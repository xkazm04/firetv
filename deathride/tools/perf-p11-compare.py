"""P11 A/B: the baseline arm (deathride/main APK) against the cut arm, two profiled 360 s runs each, from each run's
p11-readings.json (perf-p11.py). The keep rule was fixed before the cut arm ran: keep the cut only if EACH cut run beats
BOTH baseline runs on the two primary readings, worst active-window p95 and the count of active frames over 33 ms.
Active max and the over-20 ms count are reported beside them, not used to decide."""
import argparse, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--base', nargs='+', type=Path, required=True)
p.add_argument('--cut', nargs='+', type=Path, required=True)
p.add_argument('--out', type=Path, default=ROOT / 'evidence/perf/p11/comparison.json')
a = p.parse_args()

def value(d, name):
    return next(r['value'] for r in d['readings'] if r['reading'] == name)

def run(f):
    d = json.loads(f.read_text())
    at = d['attribution']
    return {'run': f.parent.name, 'apkSha256': d['apkSha256'], 'durationSeconds': d['durationSeconds'], 'functionalPass': d['functionalPass'],
            'activeP95WorstMs': value(d, 'activeP95WorstMs'), 'activeFramesOver33Ms': at['over33Ms']['frames'],
            'activeMaxMs': value(d, 'activeMaxMs'), 'activeFramesOver20Ms': at['over20Ms']['frames'], 'activeFramesOver16_7Ms': at['over16.7Ms']['frames'],
            'activeFrames': at['over33Ms']['ofActive'], 'activeP50RangeMs': value(d, 'activeP50RangeMs'), 'pssRangeMiB': value(d, 'pssRangeMiB'),
            'over33ByDominantCategory': at['over33Ms']['byDominantCategory'], 'over33DuringGc': at['over33Ms']['duringGc'],
            'gcLines': d['gc']['lines'], 'runtimeAllocation': d.get('runtimeAllocation'), 'deviceCounters': d.get('deviceCounters'),
            'rejectedInputs': value(d, 'rejectedInputs'), 'inputStream': value(d, 'inputStream'), 'hostCpu': d.get('hostCpu')}

base = [run(f) for f in a.base]
cut = [run(f) for f in a.cut]
primary = ('activeP95WorstMs', 'activeFramesOver33Ms')
checks = {f"{c['run']}.{k}": {'cut': c[k], 'baseline': [b[k] for b in base], 'better': all(c[k] < b[k] for b in base)} for c in cut for k in primary}
keep = all(x['better'] for x in checks.values())
out = {'rule': 'Keep only if each cut run beats both baseline runs on worst active-window p95 and on active frames over 33 ms '
               '(fixed before the cut arm ran). Active max and over-20 ms counts are reported, not decisive.',
       'baseline': base, 'cut': cut, 'checks': checks, 'verdict': 'keep' if keep else 'revert',
       'limits': 'Two profiled 360 s runs per arm, back to back, one Stick, a host shared with other builders (host CPU per run recorded). '
                 'Run-to-run variation is not modelled beyond two runs.'}
a.out.parent.mkdir(parents=True, exist_ok=True)
a.out.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({'verdict': out['verdict'], 'checks': checks,
                  'table': [(r['run'], r['activeP95WorstMs'], r['activeFramesOver33Ms'], r['activeMaxMs'], r['activeFramesOver20Ms'],
                             round((r['runtimeAllocation'] or {}).get('bytesAllocatedPerSecond', 0) / 1048576, 2), r['gcLines']) for r in base + cut]}, indent=1))
