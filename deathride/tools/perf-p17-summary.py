"""P17 summary: the two muted runs' readings side by side (from each run's p17-readings.json), the trace accounts, and what
each attributed cause is worth on the window p95 (counterfactuals on the rebuilt windows).

Counterfactuals, per run, over every active window rebuilt on the device clock (perf_p17_lib.stats_origin, the frames link's
Distribution held at the read): the worst window p95 and the windows over 16.7 ms
- as measured;
- with each cause's frames (perf-p17.py's cause of every frame over 20 ms) set to one refresh period, one cause at a time,
  and all of them together;
- with every class (b) interval removed (the on-time frames only);
- with every interval over 16.7 ms that presented on the next refresh (class (a)) set to one refresh period: the frames a
  jitter-free render clock would have produced, the rest as measured.
These are arithmetic on measured intervals, not runs: a changed frame would also move its neighbours, which they ignore."""
import argparse, json, statistics, sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from perf_p17_lib import q, load_raw, profile_rows, parse_present, join_present, stats_origin

p = argparse.ArgumentParser()
p.add_argument('--run', action='append', default=[], type=Path)
p.add_argument('--trace', type=Path, help='trace-p17.json from perf-p17-trace.py analyze')
p.add_argument('--out', type=Path, required=True)
a = p.parse_args()

def windows(run, r):
    raw = load_raw(run)
    I, rows = profile_rows(raw)
    origin, _ = stats_origin(raw, rows, I)
    joined, _ = join_present(I, rows, parse_present(run / 'present-latency.txt'))
    P = r['periodMs']
    cause = {f['row']: f['cause'] for f in r['slowFrames'] if f['intervalMs'] > 20}
    out = []
    for w in raw['windows']:
        st = w['stats']
        if not (st['phase'] == 'race' and st['raceSeconds'] >= 10):
            continue
        lo = origin + (st['uptimeMs'] - 10000) * 1e6
        ks = [k for k in range(st['frameNumber'] - 1000, st['frameNumber']) if k in rows and rows[k][I['startNs']] >= lo]
        def pres(k):
            x, y = joined.get(k - 1), joined.get(k - 2)
            return (x[1] - y[1]) / 1e6 if x and y else None
        out.append([(k, rows[k][I['intervalMs']], pres(k), cause.get(k)) for k in ks])
    return out, P

def worst(ws, f):
    p95 = [q([f(x) for x in w if f(x) is not None], .95) for w in ws]
    return {'worstP95Ms': round(max(p95), 3), 'windowsOver16_7': sum(1 for v in p95 if v > 16.7), 'medianWindowP95Ms': round(statistics.median(p95), 3)}

result = {'runs': []}
for run in a.run:
    r = json.loads((run / 'p17-readings.json').read_text())
    ws, P = windows(run, r)
    causes = sorted({c for w in ws for _, _, _, c in w if c})
    cf = {'measured': worst(ws, lambda x: x[1])}
    for c in causes:
        cf['without ' + c] = worst(ws, lambda x, c=c: P if x[3] == c else x[1])
    cf['without every frame over 20 ms'] = worst(ws, lambda x: P if x[1] > 20 else x[1])
    cf['on-time frames only (class b removed)'] = worst(ws, lambda x: None if x[2] is not None and x[2] >= 1.5 * P else x[1])
    cf['class (a) set to one period (jitter-free clock)'] = worst(ws, lambda x: P if x[1] > 16.7 and x[2] is not None and x[2] < 1.5 * P else x[1])
    result['runs'].append({'run': r['run'], 'windows': len(ws), 'periodMs': P, 'counterfactuals': cf,
        'readings': {k: r[k] for k in ('frames', 'activeWindows', 'pooledActive', 'present', 'vsyncLag', 'windowCheck', 'offCpu', 'gc',
                                         'deviceMemory', 'statsBuildShareOfActiveIntervals', 'hostCpu', 'rejectedInputs', 'durationSeconds', 'functionalPass')},
        'pss': r['pss'], 'over20': r['over20'], 'classB': r['classB'],
        'worst3Windows': [w for w in r['windows'] if w.get('worst3')],
        'windowsAloneOverBar': sum(1 for w in r['windows'] if w['aloneOverBar']),
        'presentP95RangeMs': [min(w['presentP95Ms'] for w in r['windows'] if w['presentP95Ms']), max(w['presentP95Ms'] for w in r['windows'] if w['presentP95Ms'])],
        'onTimeP95RangeMs': [min(w['onTimeP95Ms'] for w in r['windows']), max(w['onTimeP95Ms'] for w in r['windows'])],
        'renderP95RangeMs': [min(w['renderP95Ms'] for w in r['windows']), max(w['renderP95Ms'] for w in r['windows'])]})
if a.trace:
    t = json.loads(a.trace.read_text())
    result['trace'] = {'traces': t['traces'], 'over20ByTraceCause': t['over20'], 'classBByTraceCause': t['classB'],
                       'agreement': dict(Counter(f"{x['profileCause']} | trace {x['traceCause']}" for x in t['accounts'] if x['intervalMs'] > 20))}
a.out.parent.mkdir(parents=True, exist_ok=True)
a.out.write_text(json.dumps(result, indent=1) + '\n')
print(json.dumps([{'run': r['run'], 'counterfactuals': r['counterfactuals']} for r in result['runs']], indent=1))
