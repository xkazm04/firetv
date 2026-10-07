"""Writes evidence/perf/p13c/comparison.json: the two P13c runs' p10-readings beside P13's run 1 and run 2 (comparison.json).

Per run: the bar (transition max, windows over 100 ms), every render over 100 ms with its phase,
the request timers (car, startRace, raceLaunch, track, lobby), the deferred work P13c moved off the request frames
(transition flush seat=N ms=, transition uiDeferred ms=), PSS, rejected inputs, host pump stalls and host CPU."""
import json, re, sys
from pathlib import Path

base = Path(sys.argv[1])  # deathride/evidence/perf
p13 = json.loads((base / 'p13/comparison.json').read_text())

def span(values):
    return [round(min(values), 1), round(max(values), 1)] if values else None

def requests(r, what, key='totalMs'):
    return span([t[key] for t in r['requestTimers'] if t['what'] == what and key in t])

def classify(h):
    if h['requestsMs'] > 60: return 'request'
    if h['simulationMs'] > 60: return 'simulation (finishRace or catch-up)'
    if h['workMs'] < 25 and h['prepareMs'] > 2: return 'bake-phase gap (no work)'
    if h['workMs'] < 60: return 'interval after a slow frame'
    return 'other'

runs = {}
for n in (1, 2):
    d = base / f'p13c/run{n}'
    r = json.loads((d / 'p10-readings.json').read_text())
    timers = r['requestTimers']
    renders = []
    for h in r['renders100msPlus']:
        renders.append({'approxSecond': h['approxSecond'], 'workMs': round(h['workMs'], 1), 'intervalMs': round(h['intervalMs'], 1),
                        'requestsMs': round(h['requestsMs'], 1), 'simulationMs': round(h['simulationMs'], 1), 'prepareMs': round(h['prepareMs'], 1),
                        'textureUploads': h['textureUploads'], 'group': classify(h)})
    flush = {}
    for t in timers:
        if t['what'] == 'flush':
            flush.setdefault(f"seat{int(t['seat'])}", []).append(t['ms'])
    reading = {x['reading']: x for x in r['readings']}
    host = {k: v.get('totalPercentSamples') for k, v in r['hostCpu'].items()}
    settle = json.loads((d / 'settle.json').read_text(encoding='utf-8-sig')) if (d / 'settle.json').exists() else None
    runs[f'run{n}'] = {
        'bar': {'transitionMaxMs': round(r['transitionMaxMs'], 1), 'windowsOver100': len(r['transitionWindowsOver100Ms']),
                'transitionWindows': reading['transitionFramesOver100Ms']['value']['transitionWindows'], 'pass': not r['transitionWindowsOver100Ms']},
        'perRoundTransitionMaxMs': [(p['track'], round(p['transitionMaxMs'], 1) if p['transitionMaxMs'] is not None else None) for p in r['perRound']],
        'requestsMs': {'car': requests(r, 'car'), 'startRace': requests(r, 'startRace'), 'raceLaunch': requests(r, 'raceLaunch'),
                       'track': requests(r, 'track'), 'lobby': requests(r, 'lobby'),
                       'profileSubmit': requests(r, 'profile', 'submitMs'), 'profileDeferredPublish': requests(r, 'profile', 'publishMs')},
        'flushMsPerSeat': {k: {'count': len(v), 'rangeMs': span(v), 'meanMs': round(sum(v) / len(v), 1)} for k, v in sorted(flush.items())},
        'uiDeferredMs': (lambda v: {'count': len(v), 'rangeMs': span(v), 'meanMs': round(sum(v) / len(v), 1)} if v else None)(
            [t['ms'] for t in timers if t['what'] == 'uiDeferred']),
        'renders100msPlus': renders,
        'rendersByGroup': {g: sum(1 for x in renders if x['group'] == g) for g in sorted({x['group'] for x in renders})},
        'pssMiB': [round(x, 1) for x in reading['pssRangeMiB']['value']], 'rejected': reading['rejectedInputs']['value'],
        'inputStream': reading['inputStream']['value'], 'hostCpuPercent': host,
        'hostSettle': {k: settle.get(k) for k in ('settled', 'waitedSeconds', 'rule')} if settle else None,
    }
out = {'arm': p13['arm'], 'bar': p13['bar'],
       'p13': {k: {'bar': v['bar'], 'requestsMs': v['requestsMs'], 'rendersByGroup': v['rendersByGroup'], 'pssMiB': v['pssMiB'],
                   'startBreakdown': v['startBreakdown']} for k, v in p13['runs'].items()},
       'runs': runs,
       'limits': 'Two profiled 360 s runs of one APK. Render seconds are on the /profile fetch clock (about 0.1 s); a render is tied to its request '
                 'through the log, by hand, in the concept doc. Groups as P13. A frame interval '
                 'contains the previous frame\'s work, so a slow frame is followed by one long interval. profileDeferredPublish is '
                 'publishMs in the profile line, now the cost of marking a seat (the JSON is built by a later flush).'}
(base / 'p13c/comparison.json').write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({k: {kk: v[kk] for kk in ('bar', 'requestsMs', 'flushMsPerSeat', 'uiDeferredMs', 'rendersByGroup', 'pssMiB', 'rejected', 'inputStream', 'hostCpuPercent')}
                  for k, v in runs.items()}, indent=1))
