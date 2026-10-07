"""P10 comparison: P9's diagnostic and baseline arms against the bin-fix and region-prepare arms (two runs each), per course
and per transition, from each arm's p10-readings.json (perf-p10.py). Before/after figures for P10-race-start-hitch.md."""
import argparse, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('arms', nargs='+', type=Path, help='p10-readings.json files, in report order')
p.add_argument('--out', type=Path, default=ROOT / 'evidence/perf/p10/comparison.json')
a = p.parse_args()
p9diag = json.loads((ROOT / 'evidence/perf/p9/diag/p9-readings.json').read_text())
p9base = json.loads((ROOT / 'evidence/perf/p9/baseline/p9-readings.json').read_text())

def rng(xs):
    xs = [x for x in xs if x is not None]
    return [round(min(xs), 3), round(max(xs), 3)] if xs else None

def requests(t, what, key='totalMs'):
    return rng([x[key] for x in t if x['what'] == what])

arms = []
for f in a.arms:
    d = json.loads(f.read_text())
    t = d['requestTimers']
    changed = [x for x in t if x['what'] == 'configureWorld' and x.get('changed') == 'true']
    hitches = [h for h in d['renders100msPlus'] if h['approxSecond'] > 0]
    arms.append({'arm': f.parent.name, 'apkSha256': d['apkSha256'], 'durationSeconds': d['durationSeconds'],
        'transitionMaxMs': d['transitionMaxMs'], 'transitionWindowsOver100Ms': len(d['transitionWindowsOver100Ms']),
        'roundTransitionMaxMs': [[r['track'], r['transitionMaxMs']] for r in d['perRound']],
        'courses': [{k: c[k] for k in ('course', 'visit', 'firstProjectMs', 'slowStep', 'slowStepMs', 'selectRegionMs', 'selectRegionUploadMs', 'binWaitMs', 'binWaitFrames')} for c in d['courses']],
        'requestMs': {'profileSave': requests(t, 'profile', 'saveMs'), 'garagePublish': requests(t, 'profile', 'publishMs'),
                      'car': requests(t, 'car'), 'startRace': requests(t, 'startRace'), 'lobby': requests(t, 'lobby'), 'track': requests(t, 'track'),
                      'changedCourseScene': rng([x['sceneMs'] for x in changed]), 'changedCourseWorld': rng([x['worldMs'] for x in changed])},
        'renders100msPlusAfterProbeStart': {'requestsPhase': sum(h['requestsMs'] > 100 for h in hitches), 'preparePhase': sum(h['prepareMs'] > 100 for h in hitches),
                                            'intervalOnly': sum(h['requestsMs'] <= 100 and h['prepareMs'] <= 100 and h['workMs'] <= 100 for h in hitches),
                                            'otherWork': sum(h['requestsMs'] <= 100 and h['prepareMs'] <= 100 and h['workMs'] > 100 for h in hitches)},
        'pssRangeMiB': next(r['value'] for r in d['readings'] if r['reading'] == 'pssRangeMiB'),
        'rejectedInputs': next(r['value'] for r in d['readings'] if r['reading'] == 'rejectedInputs'),
        'inputStream': next(r['value'] for r in d['readings'] if r['reading'] == 'inputStream'),
        'hostCpu': d.get('hostCpu')})
out = {'p9': {'diagApk': p9diag['apkSha256'], 'diagTransitionMaxMs': p9diag['transitionMaxMs'], 'baselineTransitionMaxMs': p9base['transitionMaxMs'],
              'diagCourses': [{k: c[k] for k in ('course', 'selectRegionMs', 'selectRegionUploadMs', 'slowStep', 'slowStepMs', 'firstProjectMs')} for c in p9diag['sceneryBakeDetails']],
              'diagRenders100msPlusPreparePhase': sum(h['prepareMs'] > 100 for h in p9diag['renders100msPlus']),
              'baselinePssRangeMiB': next(r['value'] for r in p9base['readings'] if r['reading'] == 'pssRangeMiB'),
              'diagPssRangeMiB': next(r['value'] for r in p9diag['readings'] if r['reading'] == 'pssRangeMiB')},
       'arms': arms,
       'limits': 'P9 diag had no request timers; its per-request split is not available. P9 hitch counts include app start; the P10 arm counts start at the probe.'}
a.out.parent.mkdir(parents=True, exist_ok=True)
a.out.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({x['arm']: [x['transitionMaxMs'], x['transitionWindowsOver100Ms'], x['requestMs'], x['pssRangeMiB']] for x in arms}, indent=1))
