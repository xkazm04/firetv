"""P19: the rule for card 6 (P16 card 1 re-landed: one HUD font page), graded for memory. Fixed before the first A/B run.

Inputs per run: the perf-device output directory after perf-summary.py and perf-p11.py ran on it (summary.json,
raw.json.gz, p11-readings.json, installed.json) and the run script's settled.txt. Started from perf-p18.py: its PSS readers
and procedure are reused; the HUD readers are perf-p16.py's (active race frames, the profiler's `active` column).
Output: one JSON per run (p19-readings.json in the run directory) and, with --out, the verdict over all four runs.
Nothing here changes a threshold, clock, input rate, warm-up exclusion, render scale or any I2 figure.

The meminfo line that holds GL textures on this Stick (AFTKM, PowerVR GE9215, Android 11) is `GL mtrack` (its Pss Total
column). P19's base reading (deathride/main afc4d4cc code, base.apk 9253fc9f..., lobby, three `dumpsys meminfo --local`
samples and one `-a`) read GL mtrack 53,198-53,250 KB beside owned textures 39.97 MiB; the Stick prints no `EGL mtrack` and
no `Gfx dev` row, so the App Summary's `Graphics` equals GL mtrack in every sample. P17 and P18 read the same 52.0-52.3 MiB
at every PSS peak and lowest sample."""
import argparse, hashlib, json, re, statistics, sys
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
from perf_p17_lib import q, load_raw, profile_rows

GL_LINE = 'GL mtrack'
OWNED_CUT_MIB = 2.5
GUARDS = ('over33', 'worstActiveWindowP95Ms', 'hudMsMean', 'rejectedInputs')

RULE = ('Fixed before the first P19 A/B run. Arms: base (deathride/main afc4d4cc code, as found) and cut (the same plus the '
        're-land of P16 card 1, git revert 8443a99f), each a dev.deathride.perf debug APK built by the same command. Four profiled '
        '360 s runs on the default sound arm (no audioArm extra), P18\'s arm and procedure (perf-device.py --install --profile '
        '--seconds 360), interleaved base, cut, base, cut. No heap dump, no allocation tracker and no forced GC in these runs. '
        'Settle (settle.ps1 unchanged, P13g\'s rule: 60 consecutive 1 s samples under 60%): at most two 900 s waits before the first '
        'run; if the first run does not settle, the other three run without waits and the pair is research for the host-sensitive '
        'lines; if it settles, each later run also tries at most two waits. A run is void, and rerun once, when its probe fails '
        'functionally (rounds or input rate) or its installed APK is not its arm\'s built APK; rejected inputs are recorded and do '
        'not void a run. '
        'Readings per run: owned textures (telemetry ownedTextureBytes, max over the run, MiB); the meminfo line that holds GL '
        'textures, GL mtrack Pss Total (max over the run\'s dumpsys meminfo --local samples, MiB; min reported); PSS min and max; '
        'hudMs mean and p95 and hudFlushes mean over active race frames; active frames over 33 ms, the worst active-window p95 and '
        'rejected inputs. '
        'Verdict, keep the card: FontPageTest is green (its JUnit result has tests, no failure, no error, no skip) AND both cut runs '
        'read owned textures at least 2.5 MiB below both base runs AND both cut runs read GL mtrack (max) lower than both base runs '
        'AND no guard is worse. A guard is worse when both cut runs read worse (higher) than both base runs; the guards are active '
        'frames over 33 ms, the worst active-window p95, hudMs mean and rejected inputs. Owned textures and GL mtrack are not '
        'host-sensitive and are graded settled or not; the guards apply settled or not, and on an unsettled pair their readings '
        'are research. Otherwise the card is reverted (git revert of the re-land). hudMs p95 is reported, not graded (P17 gives '
        'the HUD no share of the tail). '
        'PSS: graded only on a settled pair (all four runs settled); then it passes when both cut runs read a lower PSS max than '
        'both base runs. On any unsettled run PSS is reported and not graded; its grade goes to the next goal-1 soak.')


def meminfo(text):
    """App Summary and the per-category Pss Total of one dumpsys meminfo sample (KB -> MiB); perf-p18.py's reader."""
    out = {}
    for name in ('Java Heap', 'Native Heap', 'Code', 'Stack', 'Graphics', 'Private Other', 'System'):
        m = re.search(r'^\s*' + name + r':\s+(\d+)', text, re.M)
        if m:
            out[name] = round(int(m[1]) / 1024, 2)
    for name in ('Dalvik Heap', 'Dalvik Other', 'GL mtrack', 'EGL mtrack', 'Gfx dev', 'Native Heap', 'Ashmem', 'Unknown'):
        m = re.search(r'^\s*' + name + r'\s+(\d+)', text, re.M)
        if m:
            out['pss ' + name] = round(int(m[1]) / 1024, 2)
    m = re.search(r'TOTAL PSS:\s+(\d+)', text)
    if m:
        out['TOTAL PSS'] = round(int(m[1]) / 1024, 2)
    return out


def rnd(x, n=3):
    return None if x is None else round(x, n)


def hud(I, rows):
    """perf-p16.py's HUD readings over active race frames (profile column active = 1)."""
    act = [r for r in rows.values() if r[I['active']] == 1]
    if not act or 'hudFlushes' not in I:
        return {'activeFrames': len(act), 'error': 'no active rows or no HUD counters'}
    col = lambda name: [r[I[name]] for r in act]
    hud_ms = col('hudMs')
    return {'activeFrames': len(act), 'hudMsMean': round(statistics.fmean(hud_ms), 4), 'hudMsP95': rnd(q(hud_ms, .95), 4),
            'hudFlushesMean': round(statistics.fmean(col('hudFlushes')), 4),
            'hudFlushesCounts': {str(int(k)): v for k, v in sorted(Counter(col('hudFlushes')).items())},
            'hudDrawsMean': round(statistics.fmean(col('hudDraws')), 4),
            'drawCallsMean': round(statistics.fmean(col('drawCalls')), 3), 'textureBindsMean': round(statistics.fmean(col('textureBinds')), 3),
            'workMsMean': round(statistics.fmean(col('workMs')), 4), 'cpuMsMean': round(statistics.fmean(col('cpuMs')), 4)}


def read_run(run, apks):
    s = json.loads((run / 'summary.json').read_text())
    d = json.loads((run / 'p11-readings.json').read_text())
    raw = load_raw(run)
    I, rows = profile_rows(raw)
    act = [k for k in sorted(rows) if k - 1 in rows and rows[k][I['active']] == 1 and rows[k - 1][I['active']] == 1]
    iv = [rows[k][I['intervalMs']] for k in act]
    mem = [m for m in raw['memory'] if m.get('pssKb')]
    parsed = [(m, meminfo(m['text'])) for m in mem]
    peak = max(mem, key=lambda m: m['pssKb'])
    low = min(mem, key=lambda m: m['pssKb'])
    gl = [p.get('pss ' + GL_LINE) for _, p in parsed if p.get('pss ' + GL_LINE) is not None]
    owned = [w['stats']['art']['ownedTextureBytes'] / 1048576 for w in raw['windows'] if (w.get('stats') or {}).get('art')]
    font = [w['stats']['art'].get('fontBytes', 0) / 1048576 for w in raw['windows'] if (w.get('stats') or {}).get('art')]
    alloc = d.get('runtimeAllocation') or {}
    sha = json.loads((run / 'installed.json').read_text())['apkSha256']
    settled = (run / 'settled.txt').read_text().strip() if (run / 'settled.txt').exists() else 'n/a'
    return {'run': run.name, 'apkSha256': sha, 'arm': next((arm for arm, h in apks.items() if h == sha), None),
            'settled': settled.startswith('yes'), 'settledNote': settled,
            'durationSeconds': d['durationSeconds'], 'functionalPass': d['functionalPass'], 'error': d.get('error'),
            'rounds': len(raw.get('rounds') or []), 'hostCpu': d.get('hostCpu'),
            'ownedTextureMiB': {'max': rnd(max(owned), 3) if owned else None, 'min': rnd(min(owned), 3) if owned else None,
                                'summaryMax': s.get('ownedTextureMiB'), 'fontMiBMax': rnd(max(font), 3) if font else None,
                                'windows': len(owned)},
            'glMtrackMiB': {'line': GL_LINE, 'max': max(gl) if gl else None, 'min': min(gl) if gl else None, 'samples': len(gl),
                            'graphicsSummaryMax': max((p.get('Graphics') for _, p in parsed if p.get('Graphics') is not None), default=None),
                            'eglMtrackRows': sum(1 for _, p in parsed if 'pss EGL mtrack' in p)},
            'pss': {'minMiB': rnd(low['pssKb'] / 1024, 2), 'maxMiB': rnd(peak['pssKb'] / 1024, 2), 'samples': len(mem),
                    'peakSecond': rnd(peak['second'], 1), 'lowestSecond': rnd(low['second'], 1),
                    'peakBreakdownMiB': meminfo(peak['text']), 'lowestBreakdownMiB': meminfo(low['text'])},
            'hud': hud(I, rows),
            'allocation': {'MBps': rnd(alloc['bytesAllocatedPerSecond'] / 1e6, 4) if alloc.get('bytesAllocatedPerSecond') else None,
                           'gcCount': alloc.get('gcCount'), 'gcTimeMs': alloc.get('gcTimeMs')},
            'guards': {'activeFrames': len(iv), 'over33': sum(1 for v in iv if v > 33),
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


def guard_value(r, g):
    if g == 'hudMsMean':
        return r['hud'].get('hudMsMean')
    v = r['guards'][g]
    return sum(v) if isinstance(v, list) else v


def verdict(runs, eq):
    base = [r for r in runs if r['arm'] == 'base']
    cut = [r for r in runs if r['arm'] == 'cut']
    out = {'baseRuns': [r['run'] for r in base], 'cutRuns': [r['run'] for r in cut], 'fontPageTest': eq}
    if not (len(base) == 2 and len(cut) == 2 and all(r['functionalPass'] for r in runs)):
        out['keep'] = None
        out['why'] = 'not two functional runs of each arm'
        return out
    bo = [r['ownedTextureMiB']['max'] for r in base]
    co = [r['ownedTextureMiB']['max'] for r in cut]
    owned_ok = max(co) <= min(bo) - OWNED_CUT_MIB
    bg = [r['glMtrackMiB']['max'] for r in base]
    cg = [r['glMtrackMiB']['max'] for r in cut]
    gl_ok = None not in bg + cg and max(cg) < min(bg)
    guards = {}
    for g in GUARDS:
        b = [guard_value(r, g) for r in base]
        c = [guard_value(r, g) for r in cut]
        guards[g] = {'base': b, 'cut': c, 'worse': None not in b + c and min(c) > max(b)}
    no_worse = not any(v['worse'] for v in guards.values())
    settled = all(r['settled'] for r in runs)
    out['ownedTextureMiB'] = {'base': bo, 'cut': co, 'requiredCutBelowBothBaseBy': OWNED_CUT_MIB, 'pass': owned_ok}
    out['glMtrackMiB'] = {'line': GL_LINE, 'base': bg, 'cut': cg, 'bothCutBelowBothBase': gl_ok}
    out['guards'] = guards
    out['allSettled'] = settled
    out['guardsAre'] = 'graded' if settled else 'applied; readings are research (unsettled)'
    out['keep'] = bool(eq['green'] and owned_ok and gl_ok and no_worse)
    out['keepWhy'] = ('kept: FontPageTest green, owned textures at least 2.5 MiB lower and GL mtrack lower in both cut runs '
                      'than both base runs, no guard worse' if out['keep'] else
                      'reverted: ' + '; '.join(x for x, bad in (('FontPageTest not green', not eq['green']),
                                                                ('owned textures not 2.5 MiB below both base runs', not owned_ok),
                                                                ('GL mtrack not lower in both cut runs', not gl_ok),
                                                                ('a guard is worse: ' + ', '.join(g for g, v in guards.items() if v['worse']), not no_worse)) if bad))
    out['reported'] = {'hudMsP95': {'base': [r['hud'].get('hudMsP95') for r in base], 'cut': [r['hud'].get('hudMsP95') for r in cut]},
                       'hudFlushesMean': {'base': [r['hud'].get('hudFlushesMean') for r in base], 'cut': [r['hud'].get('hudFlushesMean') for r in cut]}}
    bp = [r['pss']['maxMiB'] for r in base]
    cp = [r['pss']['maxMiB'] for r in cut]
    out['pss'] = {'maxMiB': {'base': bp, 'cut': cp}, 'minMiB': {'base': [r['pss']['minMiB'] for r in base], 'cut': [r['pss']['minMiB'] for r in cut]},
                  'bothCutMaxBelowBothBase': max(cp) < min(bp)}
    out['pssGrade'] = ('pass' if max(cp) < min(bp) else 'fail') if settled else 'not graded (unsettled): to the next goal-1 soak'
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--run', action='append', default=[], type=Path)
    p.add_argument('--base-apk', type=Path, required=True)
    p.add_argument('--cut-apk', type=Path, required=True)
    p.add_argument('--fontpage-xml', type=Path, help='FontPageTest JUnit result (TEST-dev.deathride.game.FontPageTest.xml)')
    p.add_argument('--out', type=Path)
    a = p.parse_args()
    apks = {'base': hashlib.sha256(a.base_apk.read_bytes()).hexdigest(), 'cut': hashlib.sha256(a.cut_apk.read_bytes()).hexdigest()}
    runs = [read_run(r, apks) for r in a.run]
    for r, path in zip(runs, a.run):
        (path / 'p19-readings.json').write_text(json.dumps(r, indent=1) + '\n')
    out = {'rule': RULE, 'glLine': GL_LINE, 'apks': apks, 'runs': runs, 'verdict': verdict(runs, equivalence(a.fontpage_xml))}
    if a.out:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        a.out.write_text(json.dumps(out, indent=1) + '\n')
    print(json.dumps({'verdict': out['verdict'], 'runs': [{k: r[k] for k in ('run', 'arm', 'settled')} | {
        'owned': r['ownedTextureMiB']['max'], 'gl': r['glMtrackMiB']['max'], 'pssMax': r['pss']['maxMiB']} for r in runs]}, indent=1))


if __name__ == '__main__':
    main()
