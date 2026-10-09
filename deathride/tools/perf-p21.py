"""P21: the rule for cards 14 and 15 (do not keep what only /routes built). Fixed before the first graded run.

Inputs per run: the perf-device output directory after perf-summary.py and perf-p11.py ran on it (summary.json,
raw.json.gz, p11-readings.json, installed.json, logcat.txt, routes-warmup.json) and the run script's settled.txt. The PSS,
guard and void readers are perf-p19.py's own (loaded, not copied); the GC line is perf-p18-gc.py's own LINE (loaded without
running its main()), as perf-p20-retained.py loads it. Output: one JSON per run (p21-readings.json in the run directory)
and, with --out, both cards' verdicts over all six runs.
Nothing here changes a threshold, clock, input rate, warm-up exclusion, render scale or any I2 figure, and nothing here
reads a heap dump: no graded run takes one."""
import argparse, hashlib, importlib.util, json, re
from pathlib import Path
from xml.etree import ElementTree

HERE = Path(__file__).resolve().parent

C14_CUT_MB = 12
C15_CUT_MB = 10
GUARDS = ('over33', 'worstActiveWindowP95Ms', 'rejectedInputs')
TRANSITION_GUARDS = ('trackMsMax', 'configureWorldMsMax')
TRANSITION_ROUNDS = range(1, 6)

RULE = ('Fixed before the first P21 graded run. Arms, each a dev.deathride.perf debug APK built by the same command '
        '(gradlew.bat :app:assembleDebug -PappId=dev.deathride.perf "-PappLabel=Death Ride Perf" -PracePort=8772) and checked '
        'with aapt badging before any install: base (the base commit, deathride/main 4f05315e code), c14 (card 14 alone) and c15 '
        '(cards 14 and 15). Six profiled 360 s runs on the default sound arm (no audioArm extra), P18\'s arm and procedure '
        '(perf-device.py --install --profile --seconds 360, its default /routes warm-up and five-course cycle), interleaved base, '
        'c14, c15, base, c14, c15. No heap dump, no allocation tracker and no forced GC in any graded run. '
        'Settle (P13g\'s settle.ps1, unchanged: 60 consecutive 1 s samples under 60%): at most two 900 s waits before the first '
        'run; if the first run does not settle, the other five run without waits and the six are research for the host-sensitive '
        'lines; if it settles, each later run also tries at most two waits. A run is void, and rerun once, when its probe fails '
        'functionally (rounds or input rate; perf-p19.py\'s functional test) or its installed APK is not its arm\'s built APK; '
        'rejected inputs are recorded and do not void a run. Nothing is graded on fewer than two functional runs of an arm. '
        'Survivors: the usedMB of every logged full (non-young) concurrent copying GC with over 30 MB surviving, read with '
        'perf-p18-gc.py\'s LINE from the run\'s logcat.txt, grouped by round: round k holds the GCs logged after the k-th '
        '"transition raceLaunch" line and before the next (round 0, before the first race, is reported and not graded). A round '
        'is graded for a pair of arms when every run of both arms logged at least one such GC in it. '
        'Guards (P19\'s): active frames over 33 ms, the worst active-window p95 and rejected inputs. A guard is worse only when '
        'both runs of the arm read above (higher than) both runs it is compared with. The track transition (card 15 only): '
        'for rounds 1-5, the "transition track" totalMs and the totalMs of the "transition configureWorld" line logged just '
        'before it (the pick\'s own configureWorld), both read from the rounds\' preparation (the lines before raceLaunch k); '
        'per run the guard reads the max over rounds 1-5 of each, and the per-round values are reported. '
        'Card 14 is kept when: its served-bytes tests are green (RoutesReplyTest unchanged and the two-request test, JUnit '
        'results with tests and no failure, error or skip) AND in every graded round both c14 runs\' lowest survivors read at '
        'least 12 MB below both base runs\' lowest AND at least one round is graded AND no guard is worse against base. '
        'Otherwise it is declined and reverted by git revert. '
        'Card 15 is kept when: its tests are green (RoutesReplyTest unchanged, so the /routes body is byte-identical, and the '
        'kept-courses test) AND in every graded round both c15 runs\' lowest survivors read at least 10 MB below both runs\' '
        'lowest of the arm it is compared with AND at least one round is graded AND no guard is worse, the track transition '
        'included. It is compared with c14 when card 14 is kept, and with base when card 14 is declined. '
        'PSS max is reported for every run and graded only on a settled pair (all runs of both arms settled); then it passes '
        'when both runs of the card\'s arm read a lower PSS max than both runs it is compared with. On any unsettled run PSS is '
        'reported and not graded; its grade goes to the goal-1 soak (P22). routes-warmup seconds are reported, not graded.')


def load(name, path, strip_main=False):
    if strip_main:
        src = path.read_text()
        ns = {'__name__': name}
        exec(compile(src[:src.rindex('\nmain()')], str(path), 'exec'), ns)
        return ns
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


P19 = load('perf_p19', HERE / 'perf-p19.py')
GC = load('perf_p18_gc', HERE / 'perf-p18-gc.py', strip_main=True)
MS = re.compile(r'totalMs=([\d.]+)')


def rounds(logcat):
    """Full-GC survivors and the track transition on the round clock (raceLaunch lines)."""
    launches, gcs, last_configure = 0, [], None
    transition = {}
    for ln in logcat.read_text(errors='replace').splitlines():
        if 'transition raceLaunch' in ln:
            launches += 1
            continue
        m = GC['LINE'].search(ln)
        if m and not m[1] and int(m[9]) > 30:
            gcs.append({'time': ln[6:18], 'round': launches, 'usedMB': int(m[9]), 'footprintMB': int(m[10])})
        if 'transition configureWorld' in ln:
            last_configure = ln
        elif 'transition track ' in ln:
            k = launches + 1
            t = transition.setdefault(k, {'trackMs': [], 'configureWorldMs': [], 'course': []})
            t['trackMs'].append(float(MS.search(ln)[1]))
            if last_configure:
                t['configureWorldMs'].append(float(MS.search(last_configure)[1]))
                t['course'].append(last_configure.split('configureWorld ', 1)[1].split()[0])
                t.setdefault('changed', []).append('changed=true' in last_configure)
    per = {}
    for g in gcs:
        per.setdefault(g['round'], []).append(g['usedMB'])
    trans = {k: v for k, v in transition.items() if k in TRANSITION_ROUNDS}
    return {'raceLaunches': launches, 'fullGcs': len(gcs),
            'survivorsPerRound': {str(k): {'lowestMB': min(v), 'highestMB': max(v), 'gcs': len(v)} for k, v in sorted(per.items())},
            'headroomMB': sorted({g['footprintMB'] - g['usedMB'] for g in gcs}),
            'transition': {str(k): v for k, v in sorted(trans.items())},
            'trackMsMax': max((max(v['trackMs']) for v in trans.values()), default=None),
            'configureWorldMsMax': max((max(v['configureWorldMs']) for v in trans.values() if v['configureWorldMs']), default=None),
            'transitionRoundsRead': sorted(trans)}


def read_run(run, apks):
    r = P19.read_run(run, apks)
    r.update(rounds(run / 'logcat.txt'))
    w = run / 'routes-warmup.json'
    r['routesWarmup'] = json.loads(w.read_text()) if w.exists() else None
    return r


def junit(paths):
    out = []
    for xml in paths:
        if not xml.exists():
            out.append({'file': xml.name, 'green': False, 'why': 'no JUnit result'})
            continue
        t = ElementTree.parse(xml).getroot()
        n, f, e, sk = (int(t.get(k, 0)) for k in ('tests', 'failures', 'errors', 'skipped'))
        out.append({'file': xml.name, 'suite': t.get('name'), 'tests': n, 'failures': f, 'errors': e, 'skipped': sk,
                    'timestamp': t.get('timestamp'), 'green': n > 0 and f == 0 and e == 0 and sk == 0})
    return {'results': out, 'green': bool(out) and all(x['green'] for x in out)}


def guard_value(r, g):
    if g in TRANSITION_GUARDS:
        return r[g]
    return P19.guard_value(r, g)


def grade(arm, cut_runs, ref, ref_runs, cut_mb, tests, guards):
    out = {'arm': arm, 'comparedWith': ref, 'runs': [r['run'] for r in cut_runs], 'comparedRuns': [r['run'] for r in ref_runs],
           'tests': tests}
    if not (len(cut_runs) == 2 and len(ref_runs) == 2 and all(r['functionalPass'] for r in cut_runs + ref_runs)):
        out['keep'] = None
        out['why'] = 'not two functional runs of each arm: the card stays open'
        return out
    graded, per = [], {}
    all_rounds = sorted({int(k) for r in cut_runs + ref_runs for k in r['survivorsPerRound']} - {0})
    for k in all_rounds:
        c = [r['survivorsPerRound'].get(str(k), {}).get('lowestMB') for r in cut_runs]
        b = [r['survivorsPerRound'].get(str(k), {}).get('lowestMB') for r in ref_runs]
        if None in c + b:
            per[str(k)] = {'cut': c, 'ref': b, 'graded': False}
            continue
        ok = max(c) <= min(b) - cut_mb
        per[str(k)] = {'cut': c, 'ref': b, 'graded': True, 'gapMB': min(b) - max(c), 'pass': ok}
        graded.append(ok)
    survivors_ok = bool(graded) and all(graded)
    gv = {}
    for g in guards:
        c = [guard_value(r, g) for r in cut_runs]
        b = [guard_value(r, g) for r in ref_runs]
        gv[g] = {'cut': c, 'ref': b, 'worse': None not in c + b and min(c) > max(b)}
    no_worse = not any(v['worse'] for v in gv.values())
    settled = all(r['settled'] for r in cut_runs + ref_runs)
    out['survivors'] = {'requiredLowerByMB': cut_mb, 'perRound': per, 'roundsGraded': len(graded), 'pass': survivors_ok}
    out['guards'] = gv
    out['allSettled'] = settled
    out['guardsAre'] = 'graded' if settled else 'applied; readings are research (unsettled)'
    out['keep'] = bool(tests['green'] and survivors_ok and no_worse)
    out['keepWhy'] = ('kept: tests green, survivors at least %d MB lower in every graded round, no guard worse' % cut_mb if out['keep'] else
                      'declined: ' + '; '.join(x for x, bad in (('tests not green', not tests['green']),
                                                                ('no round graded', not graded),
                                                                ('survivors not %d MB lower in every graded round' % cut_mb, graded and not survivors_ok),
                                                                ('a guard is worse: ' + ', '.join(g for g, v in gv.items() if v['worse']), not no_worse)) if bad))
    cp = [r['pss']['maxMiB'] for r in cut_runs]
    bp = [r['pss']['maxMiB'] for r in ref_runs]
    out['pss'] = {'maxMiB': {'cut': cp, 'ref': bp}, 'minMiB': {'cut': [r['pss']['minMiB'] for r in cut_runs], 'ref': [r['pss']['minMiB'] for r in ref_runs]},
                  'bothCutMaxBelowBothRef': max(cp) < min(bp)}
    out['pssGrade'] = ('pass' if max(cp) < min(bp) else 'fail') if settled else 'not graded (unsettled): to the goal-1 soak (P22)'
    out['routesWarmupSeconds'] = {'cut': [(r['routesWarmup'] or {}).get('seconds') for r in cut_runs],
                                  'ref': [(r['routesWarmup'] or {}).get('seconds') for r in ref_runs]}
    return out


def verdict(runs, c14_tests, c15_tests):
    arm = lambda name: [r for r in runs if r['arm'] == name]
    base, c14, c15 = arm('base'), arm('c14'), arm('c15')
    v14 = grade('c14', c14, 'base', base, C14_CUT_MB, c14_tests, GUARDS)
    if v14['keep'] is None:
        v15 = {'arm': 'c15', 'keep': None, 'why': 'card 14 has no verdict, so card 15 has no arm to be compared with: both stay open'}
    elif v14['keep']:
        v15 = grade('c15', c15, 'c14', c14, C15_CUT_MB, c15_tests, GUARDS + TRANSITION_GUARDS)
    else:
        v15 = grade('c15', c15, 'base', base, C15_CUT_MB, c15_tests, GUARDS + TRANSITION_GUARDS)
    return {'card14': v14, 'card15': v15}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--run', action='append', default=[], type=Path)
    p.add_argument('--base-apk', type=Path, required=True)
    p.add_argument('--c14-apk', type=Path, required=True)
    p.add_argument('--c15-apk', type=Path, required=True)
    p.add_argument('--c14-xml', action='append', default=[], type=Path, help="card 14's served-bytes JUnit results (TEST-*.xml)")
    p.add_argument('--c15-xml', action='append', default=[], type=Path, help="card 15's JUnit results (TEST-*.xml)")
    p.add_argument('--out', type=Path)
    a = p.parse_args()
    apks = {k: hashlib.sha256(v.read_bytes()).hexdigest() for k, v in (('base', a.base_apk), ('c14', a.c14_apk), ('c15', a.c15_apk))}
    runs = [read_run(r, apks) for r in a.run]
    for r, path in zip(runs, a.run):
        (path / 'p21-readings.json').write_text(json.dumps(r, indent=1) + '\n')
    out = {'rule': RULE, 'apks': apks, 'runs': runs, 'verdict': verdict(runs, junit(a.c14_xml), junit(a.c15_xml))}
    if a.out:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        a.out.write_text(json.dumps(out, indent=1) + '\n')
    print(json.dumps({'verdict': {k: {x: v.get(x) for x in ('keep', 'keepWhy', 'why', 'comparedWith')} for k, v in out['verdict'].items()},
                      'runs': [{k: r[k] for k in ('run', 'arm', 'settled', 'functionalPass')} | {
                          'survivors': {k: v['lowestMB'] for k, v in r['survivorsPerRound'].items()}, 'pssMax': r['pss']['maxMiB']} for r in runs]}, indent=1))


if __name__ == '__main__':
    main()
