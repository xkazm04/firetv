"""Writes evidence/perf/p13/comparison.json from the two runs' p10-readings and p13-saves, beside P10 final-run1."""
import json, re, sys
from pathlib import Path
base = Path(sys.argv[1])  # deathride/evidence/perf
p10 = json.loads((base / 'p10/final-run1/p10-readings.json').read_text())

def requests(r, what, key='totalMs'):
    v = [t[key] for t in r['requestTimers'] if t['what'] == what and key in t]
    return [round(min(v), 1), round(max(v), 1)] if v else None

def classify(h):
    if h['requestsMs'] > 60: return 'request'
    if h['simulationMs'] > 60: return 'simulation (finishRace or catch-up)'
    if h['workMs'] < 25 and h['prepareMs'] > 2: return 'bake-phase gap (no work)'
    if h['workMs'] < 60: return 'interval after a slow frame'
    return 'other'

runs = {}
for n in (1, 2):
    d = base / f'p13/run{n}'
    r = json.loads((d / 'p10-readings.json').read_text()); s = json.loads((d / 'p13-saves.json').read_text())
    ev = r['requestTimers']
    starts = []
    for i, t in enumerate(ev):
        if t['what'] != 'startRace': continue
        subs = []
        j = i - 1
        while j >= 0 and ev[j]['what'] == 'profile' and ev[j].get('kind') == 'MONEY':
            subs.append(ev[j]); j -= 1
        sub = sum(x['submitMs'] for x in subs); pub = sum(x['publishMs'] for x in subs)
        starts.append({'logTime': t['logTime'], 'totalMs': round(t['totalMs'], 1), 'ticketSubmitMs': round(sub, 1), 'ticketPublishMs': round(pub, 1),
                       'restMs': round(t['totalMs'] - sub - pub, 1)})
    renders = []
    for h in s['renders100msPlus']:
        renders.append({'approxSecond': h['approxSecond'], 'workMs': round(h['workMs'], 1), 'intervalMs': round(h['intervalMs'], 1),
                        'requestsMs': round(h['requestsMs'], 1), 'simulationMs': round(h['simulationMs'], 1), 'prepareMs': round(h['prepareMs'], 1),
                        'group': classify(h)})
    host = {k: v.get('totalPercentSamples') for k, v in r['hostCpu'].items()}
    reading = {x['reading']: x for x in r['readings']}
    runs[f'run{n}'] = {
        'bar': {'transitionMaxMs': round(r['transitionMaxMs'], 1), 'windowsOver100': len(r['transitionWindowsOver100Ms']), 'transitionWindows': reading['transitionFramesOver100Ms']['value']['transitionWindows'], 'pass': not r['transitionWindowsOver100Ms']},
        'perRoundTransitionMaxMs': [(p['track'], round(p['transitionMaxMs'], 1)) for p in r['perRound']],
        'requestsMs': {'car': requests(r, 'car'), 'startRace': requests(r, 'startRace'), 'raceLaunch': requests(r, 'raceLaunch'), 'track': requests(r, 'track'), 'lobby': requests(r, 'lobby')},
        'saves': s['timers'], 'startBreakdown': starts,
        'ticketWaits': [x['ticketWait'] for x in s['starts']], 'everyLaunchAfterDurableTickets': s['everyLaunchAfterDurableTickets'],
        'settles': s['settles'], 'everySettleCompleted': s['everySettleCompleted'], 'refusalsOrReverts': len(s['refusals']),
        'renders100msPlus': renders,
        'rendersByGroup': {g: sum(1 for x in renders if x['group'] == g) for g in sorted({x['group'] for x in renders})},
        'pssMiB': [round(x, 1) for x in reading['pssRangeMiB']['value']], 'rejected': reading['rejectedInputs']['value'],
        'inputStream': reading['inputStream']['value'], 'hostCpuPercent': host,
    }
out = {'apkSha256': 'f3804fcd43ed0e7096d8982b6d54a4b5581b99d9d26009a00b3a7bca03b8239e', 'code': 'ebe59cd3 (wiring) on cc5a6a13',
       'arm': 'tools/perf-device.py --install --profile --warm-routes --tracks scrap-1-c,foundry-1-c,salt-1-b,switchback-1-a,crown-1-a --seconds 360',
       'bar': 'no frame over 100 ms in any lobby-to-race transition window (window last10s max), in both runs',
       'p10FinalRun1': {'transitionMaxMs': round(p10['transitionMaxMs'], 1), 'windowsOver100': len(p10['transitionWindowsOver100Ms']),
                        'car': requests(p10, 'car'), 'startRace': requests(p10, 'startRace'), 'saveMs': requests(p10, 'profile', 'saveMs'),
                        'publishMs': requests(p10, 'profile', 'publishMs'),
                        'bakePhaseGaps': [(round(h['approxSecond'], 1), round(h['workMs'], 1), round(h['intervalMs'], 1), round(h['prepareMs'], 1))
                                          for h in p10['renders100msPlus'] if not h['startup'] and h['workMs'] < 25 and h['prepareMs'] > 2 and h['intervalMs'] > 100]},
       'runs': runs,
       'limits': 'Two profiled 360 s runs of one APK. Render seconds are on the /profile fetch clock. Groups: request = requests phase over 60 ms; '
                 'simulation = sim phase over 60 ms (finishRace runs its settles inside it); bake-phase gap = under 25 ms of work with a scenery-bake '
                 'slice, the time spent off render(); interval after a slow frame = the frame after one of those. finishRace has no timer line of its own.'}
(base / 'p13/comparison.json').write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({k: {kk: v[kk] for kk in ('bar', 'requestsMs', 'rendersByGroup', 'pssMiB', 'hostCpuPercent')} for k, v in runs.items()}, indent=1))
print(json.dumps(out['p10FinalRun1']))
