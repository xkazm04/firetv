"""P17: what M1 goal 1's muted active tail is made of on the Stick. Research readings, no arms, no grade.

Inputs per run: the perf-device output directory after perf-summary.py and perf-p11.py ran on it (summary.json,
raw.json.gz, logcat.txt, p11-readings.json, installed.json, host-cpu-*.json), plus perf-p17-present.py's
present-latency.txt and present-start.json. Output: one JSON per run (p17-readings.json in the run directory) and, with
--out, the table of every run given.

Readings are perf-summary.py's and perf-p11.py's (frames, windows, PSS, GC, the dominant phase), read here, not redefined.
Added by P17: the present intervals (SurfaceFlinger), the scheduler split of each interval (the perf-only schedRunMs and
schedWaitMs columns, 60456219), the PSS breakdown at the run's peak sample, and one cause per slow frame. Nothing here
changes a threshold, clock, input rate, warm-up exclusion, render scale or any I2 figure."""
import argparse, bisect, datetime, json, re, statistics, sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from perf_p17_lib import q, load_raw, profile_rows, parse_present, join_present, stats_origin

ROOT = Path(__file__).resolve().parents[1]
RULE = ('Fixed before the first P17 run. Two profiled 360 s runs of deathride/main plus the perf-only schedstat columns '
        '(60456219), audioArm=muted, by P14\'s procedure (perf-device.py --install --profile --seconds 360 --extra audioArm=muted), '
        'with perf-p17-present.py polling SurfaceFlinger every 1.5 s from pairing to the probe\'s end. Host settle (settle.ps1, '
        'unchanged) is tried first with at most two 900 s waits; an unsettled run is kept as research with host CPU at its start '
        'and end. Nothing is graded: no arm, no verdict, no I2 pass or fail is claimed from these runs. A run is void, and rerun '
        'once, when it fails functionally or its APK is not the built one; rejected inputs are recorded, not voiding. '
        'Readings per run: active frames over 16.7, 20 and 33 ms; worst active-window p95, pooled active p95, pooled and window '
        'medians, active max; PSS min and max and the meminfo breakdown of the peak and lowest samples; GC count, GC time and '
        'allocation rate (ART runtime stats) and logged GCs; the device reclaim and swap counters and the CPU of kswapd0 around the run; the render thread\'s time off the CPU over active intervals, split '
        'into runnable (waiting for a CPU) and asleep; each slow frame\'s dominant phase (P11). '
        'Present: the display period is read from SurfaceFlinger (and dumpsys display); each SF frame is joined to the profile row '
        'whose render began last before its queue time. Row r\'s interval (start r-1 to start r) is frame r-1\'s, and its present '
        'interval is present(r-1) - present(r-2). A slow interval (> 16.7 ms) is class (a), jitter, when its present interval is '
        'under 1.5 periods (presented on the next refresh), and class (b), a missed refresh, at 1.5 periods or more. Every '
        'present interval of 1.5 periods or more is a class (b) frame whatever its render interval. Windows: the probe\'s active '
        'windows (phase race, raceSeconds >= 10), each rebuilt from the profile rows on the device clock (the frames link\'s '
        'Distribution held at the read) and checked against the window\'s own count and p95; per window the render-interval p95, '
        'the present-interval p95, and the p95 of the window\'s on-time frames only (class (b) intervals removed). '
        'Cause per active frame over 20 ms and per class (b) frame: the interval minus its active medians gives the excess of '
        'running (schedRunMs), runnable wait (schedWaitMs) and sleep (the rest); the largest excess names it. running -> '
        '"running:<dominant phase>"; runnable -> "preempted" (CPU held by another thread; who, only in the trace); sleep -> '
        '"sleep:gc" when a logged GC overlaps the interval, else "sleep:dequeue" when the clear plus swap gap\'s excess is at '
        'least half the sleep excess (buffer back-pressure), else "sleep:other". A frame with no schedstat or no previous row is '
        '"unattributed". Load beside it: a /stats build (window uptimeMs) or a /profile read (its end row) inside the interval.')
p = argparse.ArgumentParser()
p.add_argument('--run', action='append', default=[], type=Path)
p.add_argument('--apk', type=Path, help='the built APK (its SHA-256 identifies the runs)')
p.add_argument('--out', type=Path)
a = p.parse_args()

def rnd(x, n=3):
    return None if x is None else round(x, n)

def meminfo(text):
    """App Summary and the per-category Pss Total of one dumpsys meminfo sample (KB -> MiB)."""
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

def logtime(line):
    m = re.match(r'(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)\.(\d{3})', line)
    return datetime.datetime(2026, int(m[1]), int(m[2]), int(m[3]), int(m[4]), int(m[5]), int(m[6]) * 1000).timestamp() if m else None

def read_run(run):
    s = json.loads((run / 'summary.json').read_text())
    d = json.loads((run / 'p11-readings.json').read_text())
    raw = load_raw(run)
    I, rows = profile_rows(raw)
    idx = sorted(rows)
    has_sched = 'schedRunMs' in I
    PH = ['requestsMs', 'prepareMs', 'simulationMs', 'audioMs', 'telemetryMs', 'clearMs', 'cameraMs', 'effectsUpdateMs',
          'sceneryDrawMs', 'carsEffectsMs', 'hudMs', 'captionMs']
    CAT = {'requests': ['requestsMs'], 'prepare': ['prepareMs'], 'simulation': ['simulationMs'], 'audio': ['audioMs'],
           'telemetry': ['telemetryMs'], 'camera': ['cameraMs', 'effectsUpdateMs'], 'scenery': ['sceneryDrawMs'],
           'cars': ['carsEffectsMs'], 'hud': ['hudMs', 'captionMs']}
    def split(prev, row):  # perf-p11.py's split, unchanged
        c = {k: sum(prev[I[x]] for x in v) for k, v in CAT.items()}
        c['tail'] = prev[I['workMs']] - sum(prev[I[x]] for x in PH)
        c['flushSwap'] = prev[I['clearMs']] + (row[I['intervalMs']] - prev[I['workMs']])
        return c
    act = [k for k in idx if k - 1 in rows and rows[k][I['active']] == 1 and rows[k - 1][I['active']] == 1]
    iv = {k: rows[k][I['intervalMs']] for k in act}
    med = {}
    sp = {k: split(rows[k - 1], rows[k]) for k in act}
    for key in next(iter(sp.values())):
        med[key] = statistics.median(x[key] for x in sp.values())
    sched = {}
    if has_sched:
        for k in act:
            run_, wait = rows[k][I['schedRunMs']], rows[k][I['schedWaitMs']]
            if run_ >= 0 and wait >= 0:
                sched[k] = (run_, wait, iv[k] - run_ - wait)
    smed = [statistics.median(x[i] for x in sched.values()) for i in range(3)] if sched else None
    active_seconds = sum(iv.values()) / 1000

    # Logcat GCs on the profile clock (perf-p11.py's anchor method, its offset reused from the request-timer lines).
    log = (run / 'logcat.txt').read_text(errors='replace').splitlines()
    anchors = [(logtime(l), float(m[2])) for l in log for m in [re.search(r'DeathRide: transition (car|startRace|lobby|track) .*totalMs=([\d.]+)', l)] if m and float(m[2]) > 40]
    starts40 = sorted(rows[k][I['startNs']] / 1e9 for k in idx if rows[k][I['requestsMs']] > 40)
    offset = None
    if anchors and starts40:
        def near(x):
            j = bisect.bisect_left(starts40, x)
            return min((starts40[i] for i in (j - 1, j) if 0 <= i < len(starts40)), key=lambda v: abs(v - x))
        best = None
        for at, ms in anchors:
            for st in starts40:
                off = at - ms / 1e3 - st
                hits = [at2 - ms2 / 1e3 - near(at2 - ms2 / 1e3 - off) for at2, ms2 in anchors]
                hits = [h for h in hits if abs(h - off) < .005]
                if best is None or len(hits) > len(best[1]):
                    best = (off, hits)
        offset = statistics.median(best[1])
    gcs = []
    for l in log:
        m = re.search(r'^\S+ \S+\s+\d+\s+(\d+) I [^:]+: (.*?)GC freed (.*?) paused (\S+) total ([\d.]+)(ms|us|s)\b', l)
        if m and offset is not None:
            total = float(m[5]) * {'ms': 1e-3, 'us': 1e-6, 's': 1.0}[m[6]]
            e = logtime(l) - offset
            gcs.append({'start': e - total, 'end': e, 'kind': m[2].strip(), 'freed': m[3][:80], 'totalMs': round(total * 1e3, 3)})
    gcs.sort(key=lambda g: g['start'])
    gstarts = [g['start'] for g in gcs]
    def gc_in(t0, t1):
        j = bisect.bisect_right(gstarts, t1)
        return [g for g in gcs[max(0, j - 8):j] if g['end'] > t0]

    # Present times.
    pres = None
    period_ms = None
    pfile = run / 'present-latency.txt'
    joined = {}
    if pfile.exists():
        pres = parse_present(pfile)
        joined, early = join_present(I, rows, pres)
        period_ms = statistics.median(pres['periods']) / 1e6 if pres['periods'] else None
    def pinterval(k):
        """Present interval of row k's interval: present(k-1) - present(k-2), ms."""
        x, y = joined.get(k - 1), joined.get(k - 2)
        return (x[1] - y[1]) / 1e6 if x and y else None
    pi = {k: pinterval(k) for k in act} if joined else {}
    def klass(k):
        d = pi.get(k)
        if d is None:
            return None
        if d >= 1.5 * period_ms:
            return 'b'
        return 'a' if iv[k] > 16.7 else 'onTime'

    # Load beside a frame: /stats builds (from each window's uptimeMs, the build's start, on the device clock) and /profile reads
    # (the row before the read's end row).
    origin, width = stats_origin(raw, rows, I)
    builds = sorted(origin + w['stats']['uptimeMs'] * 1e6 for w in raw['windows'] if w['stats'].get('uptimeMs') is not None) if origin else []
    profile_reads = sorted(rows[pr['frames']['end'] - 1][I['startNs']] for pr in raw['profiles'] if pr['frames']['end'] - 1 in rows)
    def any_in(xs, t0, t1):
        j = bisect.bisect_left(xs, t0)
        return j < len(xs) and xs[j] <= t1

    def frame(k):
        prev, row = rows[k - 1], rows[k]
        c = sp[k]
        ex = {x: c[x] - med[x] for x in c}
        t0, t1 = prev[I['startNs']], row[I['startNs']]
        g = gc_in(t0 / 1e9, t1 / 1e9)
        f = {'row': k, 'second': rnd((t0 - rows[idx[0]][I['startNs']]) / 1e9, 3), 'intervalMs': rnd(iv[k]),
             'presentIntervalMs': rnd(pi.get(k)), 'class': klass(k), 'dominantPhase': max(ex, key=ex.get),
             'workMs': rnd(prev[I['workMs']]), 'threadCpuMs': rnd(prev[I['cpuMs']]), 'offCpuMs': rnd(prev[I['workMs']] - prev[I['cpuMs']]),
             'clearMs': rnd(prev[I['clearMs']]), 'swapGapMs': rnd(iv[k] - prev[I['workMs']]), 'flushSwapMs': rnd(c['flushSwap']),
             'gc': [{'kind': x['kind'], 'totalMs': x['totalMs']} for x in g],
             'statsBuild': any_in(builds, t0, t1), 'profileRead': any_in(profile_reads, t0 - 1, t1)}
        if k in sched:
            run_, wait, sleep = sched[k]
            f.update({'runningMs': rnd(run_), 'runnableMs': rnd(wait), 'sleepMs': rnd(sleep)})
            exs = {'running': run_ - smed[0], 'runnable': wait - smed[1], 'sleep': sleep - smed[2]}
            top = max(exs, key=exs.get)
            if top == 'running':
                cause = 'running:' + f['dominantPhase']
            elif top == 'runnable':
                cause = 'preempted'
            elif g:
                cause = 'sleep:gc'
            elif c['flushSwap'] - med['flushSwap'] >= .5 * exs['sleep']:
                cause = 'sleep:dequeue'
            else:
                cause = 'sleep:other'
            f['excessMs'] = {x: rnd(v) for x, v in exs.items()}
            f['cause'] = cause
        else:
            f['cause'] = 'unattributed'
        return f

    slow = [k for k in act if iv[k] > 20 or klass(k) == 'b']
    frames = [frame(k) for k in slow]
    def tally(fs):
        return {'frames': len(fs), 'byCause': dict(Counter(x['cause'] for x in fs).most_common()),
                'byDominantPhase': dict(Counter(x['dominantPhase'] for x in fs).most_common()),
                'byClass': dict(Counter(str(x['class']) for x in fs).most_common()),
                'withLoggedGc': sum(1 for x in fs if x['gc']), 'withStatsBuild': sum(1 for x in fs if x['statsBuild']),
                'withProfileRead': sum(1 for x in fs if x['profileRead']),
                'unattributed': sum(1 for x in fs if x['cause'] == 'unattributed'),
                'meanMs': {x: rnd(statistics.fmean(f[x] for f in fs if f.get(x) is not None)) for x in
                           ('intervalMs', 'workMs', 'threadCpuMs', 'offCpuMs', 'runningMs', 'runnableMs', 'sleepMs', 'flushSwapMs')
                           if any(f.get(x) is not None for f in fs)} if fs else {}}
    over20 = [f for f in frames if f['intervalMs'] > 20]
    classb = [f for f in frames if f['class'] == 'b']

    # Base rates for the load columns: the share of all active intervals holding a /stats build or a /profile read.
    base_stats = sum(1 for k in act if any_in(builds, rows[k - 1][I['startNs']], rows[k][I['startNs']])) / len(act) if builds else None
    base_gc = sum(1 for k in act if gc_in(rows[k - 1][I['startNs']] / 1e9, rows[k][I['startNs']] / 1e9)) / len(act)

    # Windows rebuilt on the device clock.
    windows = []
    if origin is not None:
        for w in raw['windows']:
            st = w['stats']
            if not (st['phase'] == 'race' and st['raceSeconds'] >= 10):
                continue
            fn, up = st['frameNumber'], st['uptimeMs']
            lo = origin + (up - 10000) * 1e6
            ks = [k for k in range(fn - 1000, fn) if k in rows and rows[k][I['startNs']] >= lo]
            vals = [rows[k][I['intervalMs']] for k in ks]
            pis = [pinterval(k) for k in ks] if joined else []
            known = [x for x in pis if x is not None]
            cls = Counter()
            for k, v, pd in zip(ks, vals, pis or [None] * len(ks)):
                if pd is None:
                    cls['unknown' if v > 16.7 else 'unknownFast'] += 1
                elif pd >= 1.5 * period_ms:
                    cls['b'] += 1
                elif v > 16.7:
                    cls['a'] += 1
            on_time = [v for v, pd in zip(vals, pis) if pd is not None and pd < 1.5 * period_ms] if joined else []
            ft = st['frameTimeMs']['last10s']
            n = len(vals)
            windows.append({'second': rnd(w['second'], 2), 'raceSeconds': rnd(st['raceSeconds'], 1), 'frames': n,
                'statsCount': ft['count'], 'renderP95Ms': rnd(q(vals, .95)), 'statsP95Ms': rnd(ft['p95']),
                'presentP95Ms': rnd(q(known, .95)), 'presentKnown': len(known), 'renderMaxMs': rnd(max(vals) if vals else None),
                'over16_7': sum(1 for v in vals if v > 16.7), 'classA': cls['a'], 'classB': cls['b'],
                'over16_7Unknown': cls['unknown'], 'onTimeP95Ms': rnd(q(on_time, .95)),
                'aloneOverBar': cls['a'] >= n - max(0, -(-95 * n // 100)) + 1 if n else None})
    worst3 = sorted(windows, key=lambda w: -w['statsP95Ms'])[:3]
    for w in worst3:
        w['worst3'] = True

    # Render start against the display's vsync grid (from the present fences): lag = start - the last vsync before it.
    lag = None
    if joined and period_ms:
        pns = sorted(x[1] for x in joined.values())
        per = period_ms * 1e6
        phase = statistics.median([(x % per) for x in pns[:2000]])
        lags = [((rows[k][I['startNs']] - phase) % per) / 1e6 for k in act]
        ivs = [iv[k] for k in act if pi.get(k) is not None and pi[k] < 1.5 * period_ms]
        lag = {'p5Ms': rnd(q(lags, .05)), 'p50Ms': rnd(q(lags, .5)), 'p95Ms': rnd(q(lags, .95)),
               'onTimeIntervalP95Ms': rnd(q(ivs, .95)), 'onTimeIntervalP50Ms': rnd(q(ivs, .5)),
               'onTimeIntervalsOver16_7': sum(1 for v in ivs if v > 16.7), 'onTimeIntervals': len(ivs),
               'limit': 'The vsync phase is the median of present fences modulo the period (a fence signals at a vsync, with HWC '
                        'jitter); lag is a render start\'s position in its refresh.'}

    # PSS: the peak and the lowest sample, with their breakdowns.
    mem = [m for m in raw['memory'] if m.get('pssKb')]
    peak = max(mem, key=lambda m: m['pssKb'])
    low = min(mem, key=lambda m: m['pssKb'])
    near_heap = lambda sec: min(raw['windows'], key=lambda w: abs(w['second'] - sec))['stats'].get('heapUsedMB')
    pss = {'rangeMiB': s['pssRangeMiB'], 'samples': [rnd(m['pssKb'] / 1024, 1) for m in mem],
           'peak': {'second': rnd(peak['second'], 1), 'breakdownMiB': meminfo(peak['text']), 'heapUsedMBNearest': rnd(near_heap(peak['second']), 1)},
           'lowest': {'second': rnd(low['second'], 1), 'breakdownMiB': meminfo(low['text']), 'heapUsedMBNearest': rnd(near_heap(low['second']), 1)}}
    pss['peakMinusLowestMiB'] = {k: rnd(pss['peak']['breakdownMiB'][k] - pss['lowest']['breakdownMiB'].get(k, 0), 2)
                                 for k in pss['peak']['breakdownMiB']}

    allv = list(iv.values())
    aw = s['activeWindows']
    present_info = None
    if pres:
        stt = json.loads((run / 'present-start.json').read_text())
        end = pres['end']
        secs = (end[0] - stt['uptimeAtStart']) if end else None
        sf0, sf1 = stt.get('surfaceflingerTicksAtStart'), stt.get('surfaceflingerTicksAtEnd')
        present_info = {'source': 'dumpsys SurfaceFlinger --latency "' + stt['layer'] + '"', 'pollSeconds': stt['periodSeconds'],
            'dumps': pres['dumps'], 'gaps': pres['gaps'], 'framesSeen': len(pres['entries']), 'framesJoined': len(joined),
            'joinChecksFailed': early, 'refreshPeriodsNs': pres['periods'],
            'activeIntervalsWithPresent': sum(1 for k in act if pi.get(k) is not None), 'activeIntervals': len(act),
            'pollerCpuPercentOfOneCore': rnd(sum(end[2:6]) / secs, 2) if end and secs else None,
            'surfaceflingerCpuPercentOfOneCore': rnd(((sf1[0] + sf1[1]) - (sf0[0] + sf0[1])) / (stt['uptimeAtEnd'] - stt['uptimeAtStart']), 1) if sf0 and sf1 else None}
    # Device memory pressure (the run script's vm-start.txt / vm-end.txt around the run): reclaim and swap counters per second,
    # and kswapd0's CPU (10 ms ticks per second = % of one core).
    vm = None
    if (run / 'vm-start.txt').exists() and (run / 'vm-end.txt').exists():
        def vmread(f):
            out = {}
            for ln in f.read_text(errors='replace').splitlines():
                parts = ln.split()
                if ln.startswith('uptime '):
                    out['uptime'] = float(parts[1])
                elif ln.startswith('kswapd ') and len(parts) == 3:
                    out['kswapdTicks'] = int(parts[1]) + int(parts[2])
                elif len(parts) == 2 and parts[1].isdigit():
                    out[parts[0]] = int(parts[1])
                elif ln.startswith('MemAvailable:') or ln.startswith('MemFree:'):
                    out[parts[0].rstrip(':') + 'MiB'] = round(int(parts[1]) / 1024, 1)
            return out
        v0, v1 = vmread(run / 'vm-start.txt'), vmread(run / 'vm-end.txt')
        secs = v1.get('uptime', 0) - v0.get('uptime', 0)
        if secs > 0:
            vm = {'seconds': rnd(secs, 1), 'kswapdCpuPercentOfOneCore': rnd((v1['kswapdTicks'] - v0['kswapdTicks']) / secs, 2) if 'kswapdTicks' in v0 and 'kswapdTicks' in v1 else None,
                  'perSecond': {k: rnd((v1[k] - v0[k]) / secs, 1) for k in v0 if k in v1 and k not in ('uptime', 'kswapdTicks') and not k.endswith('MiB')},
                  'memAvailableMiB': [v0.get('MemAvailableMiB'), v1.get('MemAvailableMiB')], 'memFreeMiB': [v0.get('MemFreeMiB'), v1.get('MemFreeMiB')]}
    alloc = d.get('runtimeAllocation') or {}
    out = {'run': run.name, 'apkSha256': json.loads((run / 'installed.json').read_text())['apkSha256'],
           'durationSeconds': d['durationSeconds'], 'functionalPass': d['functionalPass'], 'error': d.get('error'),
           'rejectedInputs': next(r['value'] for r in d['readings'] if r['reading'] == 'rejectedInputs'), 'hostCpu': d.get('hostCpu'),
           'frames': {'active': len(act), 'over16_7': sum(1 for v in allv if v > 16.7), 'over20': sum(1 for v in allv if v > 20),
                      'over33': sum(1 for v in allv if v > 33), 'p11Over20': d['attribution']['over20Ms']['frames'],
                      'p11Over33': d['attribution']['over33Ms']['frames']},
           'activeWindows': {'count': aw['count'], 'worstP95Ms': aw['worstP95Ms'], 'maxMs': aw['maxMs'], 'p50RangeMs': aw['p50RangeMs']},
           'pooledActive': {'p50Ms': rnd(q(allv, .5)), 'p95Ms': rnd(q(allv, .95)), 'maxMs': rnd(max(allv))},
           'pss': pss,
           'gc': {'gcCount': alloc.get('gcCount'), 'gcTimeMs': alloc.get('gcTimeMs'), 'blockingGcCount': alloc.get('blockingGcCount'),
                  'allocMBPerSecond': rnd(alloc['bytesAllocatedPerSecond'] / 1e6, 3) if alloc.get('bytesAllocatedPerSecond') else None,
                  'loggedGcs': len(gcs), 'loggedGcKinds': dict(Counter(g['kind'] for g in gcs)),
                  'activeIntervalsOverlappingLoggedGc': rnd(base_gc, 4)},
           'offCpu': {'activeSeconds': rnd(active_seconds, 1),
                      'workMinusCpuMsPerSecond': rnd(sum(rows[k - 1][I['workMs']] - rows[k - 1][I['cpuMs']] for k in act) / active_seconds, 2),
                      'runnableMsPerSecond': rnd(sum(x[1] for x in sched.values()) / active_seconds, 2) if sched else None,
                      'sleepMsPerSecond': rnd(sum(x[2] for x in sched.values()) / active_seconds, 2) if sched else None,
                      'runningMsPerSecond': rnd(sum(x[0] for x in sched.values()) / active_seconds, 2) if sched else None,
                      'medianIntervalSplitMs': [rnd(x) for x in smed] if smed else None, 'intervalsWithSched': len(sched)},
           'activeMediansMs': {k: rnd(v) for k, v in med.items()},
           'present': present_info, 'periodMs': rnd(period_ms, 5), 'vsyncLag': lag,
           'windowOriginFitShare': rnd(width, 4),
           'windowCheck': {'countMatches': sum(1 for w in windows if w['frames'] == w['statsCount']),
                           'p95Matches': sum(1 for w in windows if w['renderP95Ms'] == rnd(w['statsP95Ms'])), 'windows': len(windows)},
           'windows': windows,
           'statsBuildShareOfActiveIntervals': rnd(base_stats, 4),
           'over20': tally(over20), 'classB': tally(classb), 'slowFrames': frames,
           'deviceCounters': d.get('deviceCounters'), 'deviceMemory': vm}
    return out

runs = [read_run(r) for r in a.run]
apk = None
if a.apk:
    import hashlib
    apk = hashlib.sha256(a.apk.read_bytes()).hexdigest()
for r, path in zip(runs, a.run):
    r['apkIsBuilt'] = (apk == r['apkSha256']) if apk else None
    (path / 'p17-readings.json').write_text(json.dumps(r, indent=1) + '\n')
summary = {'rule': RULE, 'apk': apk, 'runs': [{k: r[k] for k in ('run', 'apkIsBuilt', 'durationSeconds', 'functionalPass', 'rejectedInputs', 'frames',
           'activeWindows', 'pooledActive', 'periodMs', 'present', 'vsyncLag', 'windowCheck', 'offCpu', 'gc', 'statsBuildShareOfActiveIntervals', 'deviceMemory')}
           | {'pssRangeMiB': r['pss']['rangeMiB'], 'pssPeak': r['pss']['peak'], 'over20': {k: v for k, v in r['over20'].items()},
              'classB': r['classB'], 'worst3Windows': [w for w in r['windows'] if w.get('worst3')],
              'windowsAloneOverBar': sum(1 for w in r['windows'] if w['aloneOverBar']), 'windowsCount': len(r['windows'])} for r in runs]}
if a.out:
    a.out.parent.mkdir(parents=True, exist_ok=True)
    a.out.write_text(json.dumps(summary, indent=1) + '\n')
print(json.dumps([{k: r[k] for k in ('run', 'frames', 'activeWindows', 'pooledActive', 'periodMs', 'windowCheck')} | {'over20': r['over20']['byCause'], 'classB': r['classB']['frames'],
                   'aloneOverBar': sum(1 for w in r['windows'] if w['aloneOverBar'])} for r in runs], indent=1))
