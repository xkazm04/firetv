"""P18: the rule for card 5's cut (the Java heap swing behind the PSS peak). Fixed before the first A/B run.

Inputs per run: the perf-device output directory after perf-summary.py and perf-p11.py ran on it (summary.json,
raw.json.gz, p11-readings.json, installed.json, host-cpu-*.json) and the run script's settled.txt. Started from perf-p17.py:
its readers (perf_p17_lib) and its PSS breakdown are reused; its present-time and cause readings are not needed here.
Output: one JSON per run (p18-readings.json in the run directory) and, with --out, the verdict over all four runs.
Nothing here changes a threshold, clock, input rate, warm-up exclusion, render scale or any I2 figure."""
import argparse, hashlib, json, re, sys
from pathlib import Path
from xml.etree import ElementTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
from perf_p17_lib import q, load_raw, profile_rows

RULE = ('Fixed before the first P18 A/B run. Arms: base (deathride/main as found) and cut (the one cut of step 3), each a '
        'dev.deathride.perf debug APK built by the same command. Four profiled 360 s runs on the default sound arm (no audioArm '
        'extra), by P14\'s procedure (perf-device.py --install --profile --seconds 360), interleaved base, cut, base, cut. No heap '
        'dump, no allocation tracker and no forced GC in these runs. Settle (P13g\'s settle.ps1, unchanged: 60 consecutive 1 s '
        'samples under 60%): at most two 900 s waits before the first run; if the first run does not settle, the other three run '
        'without waits and the four runs are research; if it settles, each later run also tries at most two waits. A run is void, '
        'and rerun once, when its probe fails functionally (rounds or input rate) or its installed APK is not its arm\'s built APK; '
        'rejected inputs are recorded and do not void a run. '
        'Readings per run: PSS min and max over the probe\'s samples, the meminfo breakdown of the peak and lowest samples (Java '
        'heap at the peak); the allocation rate (ART art.gc.bytes-allocated over the probe, MB/s), the GC count, GC time and '
        'blocking GCs; and as no-regression readings, active frames over 33 ms, the worst active-window p95 and rejected inputs. '
        'Verdict 1, keep the cut: the cut\'s equivalence test is green (its JUnit result has tests, no failure, no error, no skip) '
        'AND both cut runs allocate fewer bytes per second than both base runs. Otherwise the cut is reverted. '
        'Verdict 2, grade the PSS line: only on a settled pair (all four runs settled); then it passes when both cut runs read a '
        'lower PSS max than both base runs. On any unsettled run the PSS line is not graded (research). '
        'The no-regression readings are reported beside the verdicts and decide neither.')


def meminfo(text):
    """App Summary and the per-category Pss Total of one dumpsys meminfo sample (KB -> MiB); perf-p17.py's reader."""
    out = {}
    for name in ('Java Heap', 'Native Heap', 'Code', 'Stack', 'Graphics', 'Private Other', 'System'):
        m = re.search(r'^\s*' + name + r':\s+(\d+)', text, re.M)
        if m:
            out[name] = round(int(m[1]) / 1024, 2)
    for name in ('Dalvik Heap', 'Dalvik Other', 'GL mtrack', 'Native Heap', 'Ashmem', 'Unknown'):
        m = re.search(r'^\s*' + name + r'\s+(\d+)', text, re.M)
        if m:
            out['pss ' + name] = round(int(m[1]) / 1024, 2)
    m = re.search(r'TOTAL PSS:\s+(\d+)', text)
    if m:
        out['TOTAL PSS'] = round(int(m[1]) / 1024, 2)
    return out


def rnd(x, n=3):
    return None if x is None else round(x, n)


def read_run(run, apks):
    s = json.loads((run / 'summary.json').read_text())
    d = json.loads((run / 'p11-readings.json').read_text())
    raw = load_raw(run)
    I, rows = profile_rows(raw)
    act = [k for k in sorted(rows) if k - 1 in rows and rows[k][I['active']] == 1 and rows[k - 1][I['active']] == 1]
    iv = [rows[k][I['intervalMs']] for k in act]
    mem = [m for m in raw['memory'] if m.get('pssKb')]
    peak = max(mem, key=lambda m: m['pssKb'])
    low = min(mem, key=lambda m: m['pssKb'])
    pk, lo = meminfo(peak['text']), meminfo(low['text'])
    alloc = d.get('runtimeAllocation') or {}
    sha = json.loads((run / 'installed.json').read_text())['apkSha256']
    settled = (run / 'settled.txt').read_text().strip() if (run / 'settled.txt').exists() else 'n/a'
    return {'run': run.name, 'apkSha256': sha, 'arm': next((arm for arm, h in apks.items() if h == sha), None),
            'settled': settled.startswith('yes'), 'settledNote': settled,
            'durationSeconds': d['durationSeconds'], 'functionalPass': d['functionalPass'], 'error': d.get('error'),
            'rounds': len(raw.get('rounds') or []), 'hostCpu': d.get('hostCpu'),
            'pss': {'minMiB': rnd(low['pssKb'] / 1024, 2), 'maxMiB': rnd(peak['pssKb'] / 1024, 2), 'samples': len(mem),
                    'peakSecond': rnd(peak['second'], 1), 'lowestSecond': rnd(low['second'], 1),
                    'peakBreakdownMiB': pk, 'lowestBreakdownMiB': lo,
                    'javaHeapAtPeakMiB': pk.get('Java Heap'), 'javaHeapPeakMinusLowestMiB': rnd(pk.get('Java Heap', 0) - lo.get('Java Heap', 0), 2)},
            'allocation': {'MBps': rnd(alloc['bytesAllocatedPerSecond'] / 1e6, 4) if alloc.get('bytesAllocatedPerSecond') else None,
                           'gcCount': alloc.get('gcCount'), 'gcTimeMs': alloc.get('gcTimeMs'),
                           'blockingGcCount': alloc.get('blockingGcCount'), 'seconds': rnd(alloc.get('seconds'), 1)},
            'profileReads': len(raw.get('profiles') or []),
            'noRegression': {'activeFrames': len(iv), 'over33': sum(1 for v in iv if v > 33),
                             'worstActiveWindowP95Ms': s['activeWindows']['worstP95Ms'], 'activeMaxMs': s['activeWindows']['maxMs'],
                             'pooledActiveP95Ms': rnd(q(iv, .95)),
                             'rejectedInputs': next(r['value'] for r in d['readings'] if r['reading'] == 'rejectedInputs')}}


def equivalence(xml):
    if not xml or not xml.exists():
        return {'green': False, 'why': 'no JUnit result'}
    t = ElementTree.parse(xml).getroot()
    n, f, e, sk = (int(t.get(k, 0)) for k in ('tests', 'failures', 'errors', 'skipped'))
    return {'green': n > 0 and f == 0 and e == 0 and sk == 0, 'suite': t.get('name'), 'tests': n, 'failures': f, 'errors': e, 'skipped': sk,
            'timestamp': t.get('timestamp'), 'file': xml.name}


def verdict(runs, eq):
    base = [r for r in runs if r['arm'] == 'base']
    cut = [r for r in runs if r['arm'] == 'cut']
    out = {'baseRuns': [r['run'] for r in base], 'cutRuns': [r['run'] for r in cut], 'equivalence': eq}
    complete = len(base) == 2 and len(cut) == 2 and all(r['functionalPass'] for r in runs)
    if not complete:
        out['keep'] = None
        out['why'] = 'not two functional runs of each arm'
        return out
    ba = [r['allocation']['MBps'] for r in base]
    ca = [r['allocation']['MBps'] for r in cut]
    fewer = max(ca) < min(ba)
    out['allocationMBps'] = {'base': ba, 'cut': ca, 'bothCutBelowBothBase': fewer}
    out['keep'] = bool(eq['green'] and fewer)
    out['keepWhy'] = ('kept: equivalence green and both cut runs allocate less than both base runs' if out['keep'] else
                      'reverted: ' + ('; '.join(x for x, bad in (('equivalence not green', not eq['green']),
                                                                   ('a cut run allocates as much as a base run', not fewer)) if bad)))
    bp = [r['pss']['maxMiB'] for r in base]
    cp = [r['pss']['maxMiB'] for r in cut]
    settled = all(r['settled'] for r in runs)
    out['pssMaxMiB'] = {'base': bp, 'cut': cp, 'bothCutBelowBothBase': max(cp) < min(bp), 'allSettled': settled}
    out['pssGrade'] = ('pass' if max(cp) < min(bp) else 'fail') if settled else 'not graded (unsettled: research)'
    out['noRegression'] = {r['run']: r['noRegression'] for r in runs}
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--run', action='append', default=[], type=Path)
    p.add_argument('--base-apk', type=Path, required=True)
    p.add_argument('--cut-apk', type=Path, required=True)
    p.add_argument('--equivalence-xml', type=Path, help="the cut's equivalence test JUnit result (TEST-*.xml)")
    p.add_argument('--out', type=Path)
    a = p.parse_args()
    apks = {'base': hashlib.sha256(a.base_apk.read_bytes()).hexdigest(), 'cut': hashlib.sha256(a.cut_apk.read_bytes()).hexdigest()}
    runs = [read_run(r, apks) for r in a.run]
    for r, path in zip(runs, a.run):
        (path / 'p18-readings.json').write_text(json.dumps(r, indent=1) + '\n')
    out = {'rule': RULE, 'apks': apks, 'runs': runs, 'verdict': verdict(runs, equivalence(a.equivalence_xml))}
    if a.out:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        a.out.write_text(json.dumps(out, indent=1) + '\n')
    print(json.dumps({'verdict': out['verdict'], 'runs': [{k: r[k] for k in ('run', 'arm', 'settled', 'allocation')} | {'pssMax': r['pss']['maxMiB']} for r in runs]}, indent=1))


if __name__ == '__main__':
    main()
