"""P13 readings: profile saves on ProfileWriter's thread. Reads one perf-device arm's logcat.txt beside its perf-p10.py
readings (which keep grading the brief's bar unchanged) and adds what P13 changed:

- the save timers: submit and publish ms on the render thread, the writer thread's ms per write, by purpose;
- each race start: its ticket jobs, the frames and ms it waited, and proof from the log order that the race launched
  only after every ticket write was reported OK;
- each settle: submitted and completed (OK, FAILED or CANCELLED);
- every render over 100 ms after the probe started, with the request lines logged within 0.6 s of it."""
import argparse, datetime, json, re
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('arm', type=Path, help='perf-device output directory holding logcat.txt')
p.add_argument('readings', type=Path, help='perf-p10.py output for the same arm')
p.add_argument('out', type=Path)
a = p.parse_args()
r = json.loads(a.readings.read_text())
lines = [l for l in (a.arm / 'logcat.txt').read_text(errors='replace').splitlines() if 'DeathRide: ' in l]

def when(s):
    return datetime.datetime.strptime('2026-' + s, '%Y-%m-%d %H:%M:%S.%f')
def fields(text):
    return {k: (float(v) if re.fullmatch(r'-?[\d.]+(E-?\d+)?', v) else v) for k, v in re.findall(r'(\w+)=(\S+)', text)}
events = []
for l in lines:
    m = re.match(r'^(\S+ \S+).*DeathRide: (transition (\w+)(.*)|race countdown.*)$', l)
    if m:
        events.append({'logTime': m[1], 'what': m[3] or 'countdown', **(fields(m[4]) if m[3] else {})})

submits = {int(e['job']): e for e in events if e['what'] == 'profile'}
writes = {int(e['job']): e for e in events if e['what'] == 'write'}
def span(values):
    return [round(min(values), 3), round(max(values), 3)] if values else None
timers = {
    'submitMs': {k: span([e['submitMs'] for e in submits.values() if e['kind'] == k]) for k in ('CHOICE', 'MONEY')},
    'publishMs': {k: span([e['publishMs'] for e in submits.values() if e['kind'] == k]) for k in ('CHOICE', 'MONEY')},
    'writeMs': {k: span([e['writeMs'] for e in writes.values() if e['purpose'] == k]) for k in ('CHOICE', 'TICKET', 'SETTLE')},
    'writes': {k: sum(1 for e in writes.values() if e['purpose'] == k) for k in ('CHOICE', 'TICKET', 'SETTLE')},
    'writeStatus': sorted({e['status'] for e in writes.values()}),
    'carMs': span([e['totalMs'] for e in events if e['what'] == 'car']),
    'startRaceMs': span([e['totalMs'] for e in events if e['what'] == 'startRace']),
    'raceLaunchMs': span([e['totalMs'] for e in events if e['what'] == 'raceLaunch']),
    'trackMs': span([e['totalMs'] for e in events if e['what'] == 'track']),
}

# Starts: the MONEY submits logged right before each 'startRace pending=true' are its tickets.
starts = []
for i, e in enumerate(events):
    if e['what'] != 'startRace':
        continue
    tickets, j = [], i - 1
    while j >= 0 and events[j]['what'] == 'profile' and events[j]['kind'] == 'MONEY':
        tickets.insert(0, int(events[j]['job'])); j -= 1
    rest = events[i + 1:]
    launch = next((k for k, x in enumerate(rest) if x['what'] in ('raceLaunch', 'startRace')), None)
    window = rest[:launch] if launch is not None else rest
    launched = launch is not None and rest[launch]['what'] == 'raceLaunch'
    wait = next((x for x in window if x['what'] == 'ticketWait'), None)
    ok = [t for t in tickets if any(x['what'] == 'write' and int(x['job']) == t and x['status'] == 'OK' for x in window)]
    starts.append({'logTime': e['logTime'], 'pending': e.get('pending'), 'tickets': tickets, 'ticketsOkBeforeLaunch': ok,
                   'launched': launched, 'ticketWait': {k: wait[k] for k in ('frames', 'waitMs', 'status')} if wait else None,
                   'launchedAfterTickets': launched and len(ok) == len(tickets) and wait is not None and wait['status'] == 'durable'})
ticketJobs = {t for s in starts for t in s['tickets']}
settles = []
for job, e in sorted(submits.items()):
    if e['kind'] == 'MONEY' and job not in ticketJobs:
        w = writes.get(job)
        settles.append({'job': job, 'seat': int(e['seat']), 'logTime': e['logTime'], 'status': w['status'] if w else None,
                        'purpose': w['purpose'] if w else None, 'writeMs': w['writeMs'] if w else None,
                        'completedAfterMs': round((when(w['logTime']) - when(e['logTime'])).total_seconds() * 1000, 1) if w else None})

# Renders over 100 ms placed on the log clock through each round's startRace line (the probe sends start right after it
# records the round's startedSecond), with the request lines logged near them.
startTimes = [s['logTime'] for s in starts]
rounds = r['rounds']
renders = []
for h in r['renders100msPlus']:
    if h['startup']:
        continue
    k = max((i for i, rd in enumerate(rounds) if rd['startedSecond'] <= h['approxSecond']), default=0)
    at = when(startTimes[k]) + datetime.timedelta(seconds=h['approxSecond'] - rounds[k]['startedSecond']) if k < len(startTimes) else None
    near = [f"{e['logTime'][6:]} {e['what']} " + ' '.join(f'{x}={e[x]}' for x in ('seat', 'kind', 'purpose', 'totalMs', 'submitMs', 'publishMs', 'writeMs', 'sceneMs') if x in e)
            for e in events if at and abs((when(e['logTime']) - at).total_seconds()) < .6]
    renders.append({k2: h[k2] for k2 in ('approxSecond', 'workMs', 'intervalMs', 'requestsMs', 'prepareMs', 'simulationMs', 'hudMs', 'sceneryDrawMs', 'carsEffectsMs')} | {'logTimeApprox': at.isoformat() if at else None, 'nearbyRequests': near})

out = {'arm': a.arm.name, 'bar': {'transitionMaxMs': r['transitionMaxMs'], 'windowsOver100': len(r['transitionWindowsOver100Ms']),
       'pass': not r['transitionWindowsOver100Ms']}, 'timers': timers, 'starts': starts,
       'everyLaunchAfterDurableTickets': all(s['launchedAfterTickets'] for s in starts if s['launched']) and any(s['launched'] for s in starts),
       'settles': settles, 'everySettleCompleted': all(s['status'] == 'OK' for s in settles),
       'refusals': [e for e in events if e['what'] in ('refused', 'revert', 'startDropped', 'pauseDrain', 'closeDrain')],
       'renders100msPlus': renders,
       'limits': 'Log lines are render-thread order. Render seconds come from the /profile fetch clock (about 0.1 s) mapped onto the '
                 'log clock through each round start; nearby requests are within 0.6 s and are candidates, not proof.'}
a.out.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({k: out[k] for k in ('bar', 'timers', 'everyLaunchAfterDurableTickets', 'everySettleCompleted')} |
                 {'ticketWaits': [s['ticketWait'] for s in starts], 'settles': [(s['job'], s['status'], s['writeMs']) for s in settles],
                  'refusals': len(out['refusals'])}, indent=1))
