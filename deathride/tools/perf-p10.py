"""P10 readings: the race-start hitch after the projection-bin bake left the render thread.

One perf-device arm (summary.json, raw.json.gz, logcat.txt, host-cpu-*.json) -> transition windows graded against the
brief's bar (no frame over 100 ms in any lobby-to-race transition window), per-course bake figures beside P9's diagnostic
APK, the request timers, every render over 100 ms with its phase split, and the I2 readings for reference."""
import argparse, gzip, json, re
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('arm', type=Path, help='perf-device output directory holding summary.json, raw.json.gz, logcat.txt')
p.add_argument('out', type=Path)
p.add_argument('--p9', type=Path, default=Path(__file__).resolve().parents[1] / 'evidence/perf/p9/diag/p9-readings.json')
a = p.parse_args()
s = json.loads((a.arm / 'summary.json').read_text())
raw = json.loads(gzip.decompress((a.arm / 'raw.json.gz').read_bytes()))
log = (a.arm / 'logcat.txt').read_text(errors='replace')
LIMIT_MS = 100.0
P9_PSS = [171.4951171875, 187.8779296875]

def reading(name, value, limit, ok, basis):
    return {'reading': name, 'value': value, 'limit': limit, 'status': 'pass' if ok else 'fail', 'basis': basis}

rounds = raw['rounds']
tracks = raw.get('tracks') or []
windows = raw['windows']
def is_active(w):
    return w['stats']['phase'] == 'race' and w['stats']['raceSeconds'] >= 10
transition = [{'second': round(w['second'], 3), 'round': w['round'], 'track': rounds[w['round']]['track'], 'phase': w['stats']['phase'],
               'raceSeconds': w['stats']['raceSeconds'], 'maxMs': w['stats']['frameTimeMs']['last10s']['max'],
               'p95Ms': w['stats']['frameTimeMs']['last10s']['p95']} for w in windows if not is_active(w)]
over = [w for w in transition if w['maxMs'] > LIMIT_MS]
transitionMax = max((w['maxMs'] for w in transition), default=None)
perRound = []
for r, rd in enumerate(rounds):
    ws = [w for w in transition if w['round'] == r]
    perRound.append({'round': r, 'track': rd['track'], 'startedSecond': rd['startedSecond'], 'transitionWindows': len(ws),
                     'transitionMaxMs': max((w['maxMs'] for w in ws), default=None)})

# Scenery bake logs (P9 fields plus P10's binWaitMs/binWaitFrames).
details = []
for m in re.finditer(r'^(\S+ \S+).*sceneryBakeDetail (\S+) selectRegionMs=([\d.]+) selectRegionUploadMs=(-?[\d.]+) slowStep=(\w+):([\d.]+) '
                     r'firstProjectMs=(-?[\d.]+) stages=(\S+)(?: binWaitMs=([\d.]+) binWaitFrames=(\d+))?', log, re.M):
    details.append({'logTime': m[1], 'course': m[2], 'selectRegionMs': float(m[3]), 'selectRegionUploadMs': float(m[4]),
        'slowStep': m[5], 'slowStepMs': float(m[6]), 'firstProjectMs': float(m[7]),
        'stageMs': {k: float(v) for k, v in (x.split(':') for x in m[8].split(','))},
        'binWaitMs': float(m[9]) if m[9] else None, 'binWaitFrames': int(m[10]) if m[10] else None})
bakes = [{'logTime': m[1], 'course': m[2], 'slicedFrames': int(m[3]), 'totalCpuMs': float(m[4]), 'maxSliceMs': float(m[5])}
         for m in re.finditer(r'^(\S+ \S+).*sceneryBake (\S+) slicedFrames=(\d+) totalCpuMs=([\d.]+) maxSliceMs=([\d.]+)', log, re.M)]
# Request timers (diag 0743d5b6): one line per lobby/track/car/start request, configureWorld and profile save.
timers = []
for m in re.finditer(r'^(\S+ \S+).*DeathRide: transition (\w+)(.*)$', log, re.M):
    fields = dict(re.findall(r'(\w+)=(\S+)', m[3]))
    head = m[3].split()[0] if m[3].split() and '=' not in m[3].split()[0] else None
    timers.append({'logTime': m[1], 'what': m[2], **({'course': head} if head else {}),
                   **{k: (float(v) if re.fullmatch(r'-?[\d.]+(E-?\d+)?', v) else v) for k, v in fields.items()}})

p9 = {d['course']: d for d in reversed(json.loads(a.p9.read_text())['sceneryBakeDetails'])} if a.p9.exists() else {}
courses = []
seen = set()
for d in details:
    visit = 'revisit' if d['course'] in seen else ('launch' if not seen else 'first')
    seen.add(d['course'])
    prior = p9.get(d['course']) if visit != 'revisit' else None
    courses.append({'course': d['course'], 'visit': visit, 'logTime': d['logTime'], 'firstProjectMs': d['firstProjectMs'],
                    'slowStep': d['slowStep'], 'slowStepMs': d['slowStepMs'], 'selectRegionMs': d['selectRegionMs'],
                    'selectRegionUploadMs': d['selectRegionUploadMs'], 'binWaitMs': d['binWaitMs'], 'binWaitFrames': d['binWaitFrames'],
                    'p9FirstVisit': {k: prior[k] for k in ('firstProjectMs', 'slowStep', 'slowStepMs', 'selectRegionMs', 'selectRegionUploadMs')} if prior else None})
for c in courses:
    rs = [r for r in perRound if r['track'] == c['course']]
    c['roundTransitionMaxMs'] = [r['transitionMaxMs'] for r in rs]

# Renders over 100 ms with their phase split, placed on the probe clock through each /profile fetch (last row ~ fetch second).
hitches = []
for prof in raw.get('profiles', []):
    cols = prof['frames']['columns']; rows = prof['frames']['rows']
    if not rows:
        continue
    i = {c: n for n, c in enumerate(cols)}
    lastNs = rows[-1][i['startNs']]
    for r in rows:
        if r[i['workMs']] > LIMIT_MS or r[i['intervalMs']] > LIMIT_MS:
            second = prof['second'] - (lastNs - r[i['startNs']]) / 1e9
            nxt = next((k for k, rd in enumerate(rounds) if rd['startedSecond'] >= second), None)
            hitches.append({'approxSecond': round(second, 2), 'beforeRound': nxt, 'track': rounds[nxt]['track'] if nxt is not None else None,
                            'secondsBeforeRoundStart': round(rounds[nxt]['startedSecond'] - second, 2) if nxt is not None else None,
                            'startup': second < 0, **{c: r[i[c]] for c in ('intervalMs', 'workMs', 'cpuMs', 'requestsMs', 'prepareMs',
                            'simulationMs', 'audioMs', 'telemetryMs', 'clearMs', 'sceneryDrawMs', 'carsEffectsMs', 'hudMs', 'textureUploads', 'active')}})

hostCpu = {}
for name in ('host-cpu-start.json', 'host-cpu-end.json'):
    f = a.arm / name
    if f.exists():
        try:
            h = json.loads(f.read_text(encoding='utf-8-sig'))
            hostCpu[name] = {'utc': h.get('utc'), 'totalPercentSamples': h.get('totalPercentSamples'), 'logicalProcessors': h.get('logicalProcessors'),
                             'top': [(t['Name'], t['PercentProcessorTime']) for t in h.get('topProcesses') or []][:5]}
        except (ValueError, KeyError) as e:
            hostCpu[name] = {'error': repr(e)}

aw, six = s['activeWindows'], s['sixLiveWindows']
clients = s.get('clients') or []
firstVisits = [c for c in courses if c['visit'] != 'revisit']
covered = set(c['course'] for c in firstVisits) >= set(tracks) and any(r['track'] == tracks[0] for r in rounds) if tracks else False
readings = [
    reading('coverage', {'firstVisits': [c['course'] for c in firstVisits], 'rounds': [r['track'] for r in rounds]},
            'every cycle course first-visited; the launch course reaches a race start', covered, 'P10 brief step 2'),
    reading('transitionFramesOver100Ms', {'windowsOver': len(over), 'transitionWindows': len(transition), 'maxMs': transitionMax},
            'no frame over 100 ms in any lobby-to-race transition window', not over, 'P10 brief pass bar (window last10s max)'),
]
for c in courses:
    tag = f"{c['course']}:{c['visit']}"
    readings.append(reading(f'firstProjectMs[{tag}]', c['firstProjectMs'], '<= 1 ms on the render thread (P9 revisit 0.056)', 0 <= c['firstProjectMs'] <= 1, 'TrackScene landmarks timer'))
    readings.append(reading(f'slowestBakeStepMs[{tag}]', {'step': c['slowStep'], 'ms': c['slowStepMs']}, f'< {LIMIT_MS:g} ms', c['slowStepMs'] < LIMIT_MS, 'TrackScene per-step timer'))
    readings.append(reading(f'selectRegionMs[{tag}]', {'wallMs': c['selectRegionMs'], 'glUploadMs': c['selectRegionUploadMs']}, f'< {LIMIT_MS:g} ms wall', c['selectRegionMs'] < LIMIT_MS, 'TrackScene init timer (one render frame)'))
for r in perRound:
    readings.append(reading(f"roundTransitionMaxMs[{r['round']}:{r['track']}]", r['transitionMaxMs'], f'<= {LIMIT_MS:g} ms',
                            r['transitionMaxMs'] is not None and r['transitionMaxMs'] <= LIMIT_MS, 'max over the round\'s transition windows'))
readings += [
    reading('pssRangeMiB', s['pssRangeMiB'], '< 192 MiB (P9 171.5-187.9)', bool(s['pssRangeMiB']) and max(s['pssRangeMiB']) < 192, 'I2 whole-process PSS'),
    reading('activeP50RangeMs', aw.get('p50RangeMs'), '16-18 ms', bool(aw.get('count')) and 16 <= aw['p50RangeMs'][0] and aw['p50RangeMs'][1] <= 18, 'I2, reference'),
    reading('activeP95WorstVsG1Ms', aw.get('worstP95Ms'), '<= 21.60 ms', bool(aw.get('count')) and aw['worstP95Ms'] <= 21.60, 'I2 comparison with G1, reference'),
    reading('activeMaxMs', aw.get('maxMs'), '< 33 ms', bool(aw.get('count')) and aw['maxMs'] < 33, 'I2 active maximum target, reference'),
    reading('rejectedInputs', [c['rejected'] for c in clients], '0 per seat', s['gates']['zeroRejected'], 'I2 zero-rejection gate'),
    reading('inputStream', {'hz': [c['hz'] for c in clients], 'pumpStalls': len(s['pumpStalls'])}, '> 29 Hz per seat, no host pump stall', s['gates']['inputStream'], 'I2 required input throughput'),
]
out = {'arm': a.arm.name, 'apkSha256': s['apkSha256'], 'sourceSha256': s['sourceSha256'], 'durationSeconds': s['durationSeconds'],
       'tracks': tracks, 'rounds': [{k: r.get(k) for k in ('track', 'startedSecond', 'endedSecond', 'endedEarly')} for r in rounds],
       'hostCpu': hostCpu, 'readings': readings, 'transitionMaxMs': transitionMax, 'transitionWindowsOver100Ms': over,
       'perRound': perRound, 'courses': courses, 'requestTimers': timers, 'renders100msPlus': hitches,
       'sceneryBakes': bakes, 'activeWindows': aw, 'sixLiveWindows': six, 'pumpStalls': s['pumpStalls'],
       'limits': 'Profiled arm (--profile, /profile every 10 s), 360 s, not a 900 s soak. Hitch seconds are placed on the probe clock '
                 'from each /profile fetch (about 0.1 s); negative seconds are app start before the probe. Not optical latency or owner feel.'}
a.out.parent.mkdir(parents=True, exist_ok=True)
a.out.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({'transitionMaxMs': transitionMax, 'windowsOver100': len(over), 'courses': [(c['course'], c['visit'], c['firstProjectMs'], c['slowStep'],
      round(c['slowStepMs'], 1), round(c['selectRegionMs'], 1), c['binWaitMs'], c['roundTransitionMaxMs']) for c in courses],
      'pss': s['pssRangeMiB'], 'hitches': [(h['approxSecond'], h['track'], round(h['workMs'], 1), round(h['requestsMs'], 1), round(h['prepareMs'], 1)) for h in hitches],
      'fails': [r['reading'] for r in readings if r['status'] == 'fail']}, indent=1))
