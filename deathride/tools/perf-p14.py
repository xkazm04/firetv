"""P14: does any open app stream cost the Stick's audio pair, and does a deep-buffer output avoid it? Four audio arms of
one perf APK (full, muted, silentTrack, silentDeep), two profiled 360 s runs each plus one diagnostic run with an atrace
per silent arm, compared under a rule fixed before the first run. A copy of perf-p12.py with P14's arms and comparisons;
perf-p12.py itself is unchanged.

Inputs per run: the perf-device output directory after perf-p11.py has written p11-readings.json into it (summary.json,
logcat.txt, startup-logcat.txt and device-counters-*.txt are read too). Inputs per diagnostic run: trace-p11.json from
perf-p11-trace.py analyze. Output: one JSON with the per-run table, the pairwise verdicts and the trace attribution.

Readings are P11's (perf-p11.py, perf-summary.py) and P12's schedstat deltas; nothing here changes a threshold, clock,
input rate, warm-up exclusion or render scale. Added to P12: the schedstat CPU of every thread of audioserver and of the
Fire OS audio HAL (a deep-buffer output would run its own AudioOut_<n> mixer thread, not AudioOut_D), and a check that a
silent arm logged its open app stream."""
import argparse, json, re, statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARMS = ('full', 'muted', 'silentTrack', 'silentDeep')
RULE = ('Fixed before the first run (P12 rule, P14 arms). Primary reading: active frames over 33 ms per profiled 360 s run '
        '(perf-p11.py). Second deciding reading: audio platform CPU, the schedstat CPU (% of one core) summed over every '
        'audioserver and Fire OS audio HAL thread between the two counter reads around the probe (P12 pair AudioOut_D + '
        'writer reported beside it). Arm X beats arm Y on a reading when BOTH runs of X read lower than BOTH runs of Y; '
        'anything else is "not shown". Comparisons: silentTrack vs muted (an open stream alone costs the pair when muted '
        'beats silentTrack), silentDeep vs silentTrack (the deep-buffer path avoids it when silentDeep beats silentTrack), '
        'and muted, silentTrack, silentDeep against full for reference. Worst active-window p95, active max, frames over '
        '20 ms and render-thread runqueue wait are judged the same way, reported, not decisive. Runs are interleaved full, '
        'muted, silentTrack, silentDeep, then the same order again. A run is void, and rerun, when its logcat or /stats '
        'does not show its arm, when a silent arm did not log its open stream (or another arm did), or when it fails '
        'functionally (P11 zero-rejection gate included); the void run stays in the record. Then one diagnostic run per '
        'silent arm with one 20 s atrace (perf-p11-trace.py), not graded.')
p = argparse.ArgumentParser()
p.add_argument('--run', action='append', default=[], help='arm=perf-device output directory (with p11-readings.json)')
p.add_argument('--trace', action='append', default=[], help='arm=trace-p11.json from a diagnostic run of that arm')
p.add_argument('--out', type=Path, default=ROOT / 'evidence/perf/p14/comparison.json')
a = p.parse_args()

def value(d, name):
    return next(r['value'] for r in d['readings'] if r['reading'] == name)

def counters(path):
    """Thread names from the stat section, schedstat (cpu ns, wait ns, slices) and uptime of one counter read."""
    names, sched, uptime, part = {}, {}, None, 'threads'
    for ln in path.read_text(errors='replace').splitlines():
        if ln.startswith('=='):
            part = ln[2:]
            continue
        if part == 'threads':
            m = re.match(r'(\d+) (\d+) \((.*)\) ', ln)
            if m:
                names[(int(m[1]), int(m[2]))] = m[3]
        elif part == 'schedstat':
            f = ln.split()
            if len(f) == 5:
                sched[(int(f[0]), int(f[1]))] = tuple(int(x) for x in f[2:])
        elif part == 'uptime' and ln.strip():
            uptime = float(ln.split()[0])
    return names, sched, uptime

def scheduler(run, app_pid):
    """CPU % of one core, slices per second and runqueue wait (ms per second) of the audio pair and the render thread, and
    the CPU of every audio platform thread (audioserver and the audio HAL: every schedstat pid that is not the app)."""
    s0, s1 = run / 'device-counters-start.txt', run / 'device-counters-end.txt'
    if not (s0.exists() and s1.exists()):
        return None
    n0, c0, u0 = counters(s0)
    n1, c1, u1 = counters(s1)
    if not c1 or u0 is None or u1 is None:
        return None
    seconds = u1 - u0
    out, audio = {}, {}
    for key, (cpu, wait, slices) in c1.items():
        if key not in c0:
            continue
        b = c0[key]
        name = n1.get(key, '')
        row = {'tid': key[1], 'cpuPercentOfOneCore': round((cpu - b[0]) / 1e9 / seconds * 100, 2),
               'slicesPerSecond': round((slices - b[2]) / seconds), 'runqueueWaitMsPerSecond': round((wait - b[1]) / 1e6 / seconds, 2)}
        # perf-device reads schedstat of audioserver, the audio HAL and the app; everything not the app is audio platform.
        if key[0] != app_pid:
            audio[f"{n1.get((key[0], key[0]), key[0])}/{name}/{key[1]}"] = row
        label = 'AudioOut_D' if name.startswith('AudioOut_D') else 'writer' if name == 'writer' else 'render (GLThread)' if name.startswith('GLThread') else None
        if label is None:
            continue
        # The app has several GLThread-named threads; the render thread is the busiest one.
        if label not in out or row['cpuPercentOfOneCore'] > out[label]['cpuPercentOfOneCore']:
            out[label] = row
    busy = {k: v for k, v in sorted(audio.items(), key=lambda kv: -kv[1]['cpuPercentOfOneCore']) if v['cpuPercentOfOneCore'] >= 0.5}
    return {'seconds': round(seconds, 2), 'threads': out,
            'audioPlatformCpuPercentOfOneCore': round(sum(v['cpuPercentOfOneCore'] for v in audio.values()), 2),
            'audioPlatformProcesses': sorted({k.split('/')[0] for k in audio}),
            'audioThreadsAtLeastHalfPercent': busy,
            'limit': '/proc/<pid>/task/<tid>/schedstat between the two counter reads around the probe (the probe only, no tracing). '
                     'Runqueue wait is all time runnable but not running (preempted or waking), whoever held the CPU.'}

def app_pid(run):
    m = re.search(r'^\s*\d+\s+(\d+)\s', (run / 'thread-priorities-before.txt').read_text(errors='replace').splitlines()[1]) \
        if (run / 'thread-priorities-before.txt').exists() else None
    return int(m[1]) if m else None

def arm_seen(run, arm, audio):
    """The arm the APK actually ran: RaceGame logs 'audio arm=<id>' for a perf arm; /stats audio.backend.native.arm agrees;
    the launcher logs 'silentTrack open mode=<mode>' for a silent arm's app stream."""
    log = ''.join((run / f).read_text(errors='replace') for f in ('startup-logcat.txt', 'logcat.txt') if (run / f).exists())
    logged = re.findall(r'DeathRide: audio arm=(\w+)', log)
    opened = re.findall(r'DeathRide: silentTrack open mode=(\w+)', log)
    native = ((audio or {}).get('backend') or {}).get('native') or {}
    seen = native.get('arm', 'full')
    want = {'silentTrack': {'DEFAULT'}, 'silentDeep': {'POWER_SAVING'}}.get(arm, set())
    ok = seen == arm and (logged == [] if arm == 'full' else set(logged) == {arm}) and set(opened) == want
    track = re.findall(r'DeathRide: (silentTrack open [^\r\n]*)', log)
    return {'logcat': sorted(set(logged)), 'statsArm': seen, 'appTrackOpened': sorted(set(opened)), 'appTrackLines': track[:4], 'matches': ok}

def run_row(arm, run):
    d = json.loads((run / 'p11-readings.json').read_text())
    s = json.loads((run / 'summary.json').read_text())
    at = d['attribution']
    audio = s.get('audio') or {}
    backend = audio.get('backend') or {}
    dev = (d.get('deviceCounters') or {}).get('cpuPercentOfOneCore') or {}
    sch = scheduler(run, app_pid(run))
    threads = (sch or {}).get('threads') or {}
    return {'arm': arm, 'run': run.name, 'apkSha256': d['apkSha256'], 'durationSeconds': d['durationSeconds'], 'functionalPass': d['functionalPass'], 'error': d.get('error'),
            'armCheck': arm_seen(run, arm, audio),
            'activeFrames': at['over33Ms']['ofActive'], 'activeFramesOver33Ms': at['over33Ms']['frames'], 'activeFramesOver20Ms': at['over20Ms']['frames'],
            'activeFramesOver16_7Ms': at['over16.7Ms']['frames'], 'activeP95WorstMs': value(d, 'activeP95WorstMs'), 'activeMaxMs': value(d, 'activeMaxMs'),
            'activeP50RangeMs': value(d, 'activeP50RangeMs'), 'pssRangeMiB': value(d, 'pssRangeMiB'),
            'over33OffCpuOver8Ms': at['over33Ms']['offCpuOver8Ms'], 'over33DuringGc': at['over33Ms']['duringGc'],
            'over33ByDominantCategory': at['over33Ms']['byDominantCategory'],
            'audioPairCpuPercentOfOneCore': {k: dev.get(k) for k in ('audioserver AudioOut_D', 'audio HAL writer')},
            'scheduler': sch,
            'audioPlatformCpu': (sch or {}).get('audioPlatformCpuPercentOfOneCore'),
            'pairCpu': round(sum((threads.get(k) or {}).get('cpuPercentOfOneCore', 0) for k in ('AudioOut_D', 'writer')), 2) if sch else None,
            'pairSlicesPerSecond': {k: (threads.get(k) or {}).get('slicesPerSecond') for k in ('AudioOut_D', 'writer')},
            'renderRunqueueWaitMsPerSecond': (threads.get('render (GLThread)') or {}).get('runqueueWaitMsPerSecond'),
            'audioStats': {'played': audio.get('played'), 'highWater': audio.get('highWater'), 'workerStarts': backend.get('starts'),
                           'failedStarts': backend.get('failedStarts'), 'nativeHighWater': backend.get('nativeHighWater'), 'native': backend.get('native')},
            'rejectedInputs': value(d, 'rejectedInputs'), 'inputStream': value(d, 'inputStream'),
            'runtimeAllocation': d.get('runtimeAllocation'), 'gcLines': d['gc']['lines'], 'hostCpu': d.get('hostCpu')}

def trace_row(arm, path):
    t = json.loads(path.read_text())
    out = {'arm': arm, 'trace': path.parent.name, 'frames': t['frames'], 'spanSeconds': t['spanSeconds'], 'intervalsOver': t['intervalsOver']}
    for lim in ('over33Ms', 'over20Ms'):
        x = t['slow'][lim]
        pre = x['preemptedByMs']
        pair = sum(v for k, v in pre.items() if k.startswith(('writer', 'AudioOut_')))
        total = x['meanMs']['preemptedMs'] * x['frames']
        app = sum(v for k, v in pre.items() if k.startswith(('SoundPool', 'DeathRideAudio', 'AudioTrack', 'DR.silentTrack')))
        out[lim] = {'frames': x['frames'], 'meanMs': x['meanMs'], 'preemptedTotalMs': round(total, 1), 'preemptedByAudioPairMs': round(pair, 1),
                    'audioPairShareOfPreempted': round(pair / total, 3) if total else None, 'preemptedByAppAudioThreadsMs': round(app, 1),
                    'preemptedByTop': dict(list(pre.items())[:6])}
    pair = [h for h in t['highPriorityThreads'] if h['thread'].startswith(('writer', 'AudioOut_'))]
    out['audioPairThreads'] = [{k: h[k] for k in ('thread', 'process', 'prio', 'cpuPercentOfOneCore', 'switchInsPerSecond', 'meanSliceUs')} for h in pair]
    out['note'] = 'Intrusive trace beside a diagnostic run; its frame counts are not I2 figures. preemptedByMs lists the top 12 takers only.'
    return out

def pairs(items):
    for item in items:
        arm, path = item.split('=', 1)
        assert arm in ARMS, arm
        yield arm, Path(path)

runs = [run_row(arm, path) for arm, path in pairs(a.run)]
traces = [trace_row(arm, path) for arm, path in pairs(a.trace)]
# Void: the wrong arm (or stream), a functional failure, or a rejected input (rerun under the rule; the void run stays in 'runs').
def rejected(r):
    v = r['rejectedInputs']
    return any(v) if isinstance(v, list) else bool(v)
valid = [r for r in runs if r['armCheck']['matches'] and r['functionalPass'] and not rejected(r)]
by = {arm: [r for r in valid if r['arm'] == arm] for arm in ARMS}
READINGS = ('activeFramesOver33Ms', 'audioPlatformCpu', 'pairCpu', 'activeP95WorstMs', 'activeMaxMs', 'activeFramesOver20Ms',
            'renderRunqueueWaitMsPerSecond')
DECIDING = ('activeFramesOver33Ms', 'audioPlatformCpu')
COMPARISONS = (('silentTrack', 'muted', 'Does an open stream alone cost the pair? Yes when muted beats silentTrack.'),
               ('silentDeep', 'silentTrack', 'Does the deep-buffer path avoid it? Yes when silentDeep beats silentTrack.'),
               ('muted', 'full', 'Reference: P12 muted against full on this APK.'),
               ('silentTrack', 'full', 'Reference.'), ('silentDeep', 'full', 'Reference.'))

def mean(xs):
    return round(statistics.fmean(xs), 3) if xs else None

def judge(x, y, k):
    vx, vy = [r[k] for r in by[x]], [r[k] for r in by[y]]
    if len(vx) < 2 or len(vy) < 2 or None in vx + vy:
        return {'verdict': 'incomplete', x: vx, y: vy}
    verdict = f'{x} beats {y}' if max(vx) < min(vy) else f'{y} beats {x}' if max(vy) < min(vx) else 'not shown'
    my = statistics.fmean(vy)
    return {'verdict': verdict, x: vx, y: vy, 'meanChange': round(statistics.fmean(vx) - my, 3),
            'meanChangePercent': round((statistics.fmean(vx) - my) / my * 100, 1) if my else None}

verdicts = {}
for x, y, question in COMPARISONS:
    v = {'question': question}
    for k in READINGS:
        v[k] = judge(x, y, k)
    v['deciding'] = {k: v[k]['verdict'] for k in DECIDING}
    verdicts[f'{x} vs {y}'] = v
clears = {arm: len(by[arm]) >= 2 and all(r['activeP95WorstMs'] <= 16.7 and r['activeMaxMs'] <= 33 for r in by[arm]) for arm in ARMS}
out = {'rule': RULE, 'runs': runs,
       'void': [{'run': r['run'], 'reason': 'arm or stream not seen' if not r['armCheck']['matches'] else 'rejected inputs' if rejected(r) and r['functionalPass']
                 else 'functional failure: ' + str(r['error'])[:160]} for r in runs if r not in valid],
       'verdicts': verdicts, 'clearsI2Frames': clears,
       'perArmMeans': {arm: {k: mean([r[k] for r in by[arm] if r[k] is not None]) for k in READINGS} for arm in ARMS},
       'traces': traces,
       'limits': 'Two profiled 360 s runs per arm on one Stick, interleaved, with the host shared with other builders (host CPU per run recorded). '
                 'One atrace per silent arm, beside a separate diagnostic run. The silent arms write zeros only; nothing a player hears is measured or changed.'}
a.out.parent.mkdir(parents=True, exist_ok=True)
a.out.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({'void': out['void'], 'verdicts': {k: v['deciding'] for k, v in verdicts.items()}, 'clearsI2Frames': clears,
                  'table': [(r['arm'], r['run'], r['activeFramesOver33Ms'], r['activeFramesOver20Ms'], r['activeP95WorstMs'], r['activeMaxMs'],
                             r['audioPlatformCpu'], r['pairCpu'], r['pairSlicesPerSecond'], r['renderRunqueueWaitMsPerSecond']) for r in runs]}, indent=1))
