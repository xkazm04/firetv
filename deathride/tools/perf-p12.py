"""P12: what the game's sound costs on the Stick. Four audio arms of one perf APK (full, muted, capped, still), two
profiled 360 s runs each plus one diagnostic run with an atrace, compared under a rule fixed before the first run.

Inputs per run: the perf-device output directory after perf-p11.py has written p11-readings.json into it (summary.json,
logcat.txt and device-counters-*.txt are read too). Inputs per diagnostic run: trace-p11.json from
perf-p11-trace.py analyze. Output: one JSON with the per-run table, the per-arm verdicts and the trace attribution.

Readings are P11's (perf-p11.py, perf-summary.py); nothing here changes a threshold, clock, input rate, warm-up exclusion
or render scale. Added: per-thread schedstat deltas (CPU, runqueue wait, slices) of the audio pair and the render thread
between perf-device's two counter reads, and a check that each run ran the arm it is filed under."""
import argparse, json, re, statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARMS = ('full', 'muted', 'capped', 'still')
RULE = ('Fixed before the first run. Primary: active frames over 33 ms per 360 s run. An arm beats full on a reading '
        'when BOTH of its runs read lower than BOTH full runs; anything else is "not shown". Worst active-window p95 and '
        'active frames over 20 ms are judged the same way and reported beside it, not decisive. An arm clears the I2 frame '
        'limits only if both its runs read worst p95 <= 16.7 ms and active max <= 33 ms. Runs are interleaved '
        'full, muted, capped, still, full, muted, capped, still; a run whose logcat or /stats does not show its arm is void.')
p = argparse.ArgumentParser()
p.add_argument('--run', action='append', default=[], help='arm=perf-device output directory (with p11-readings.json)')
p.add_argument('--trace', action='append', default=[], help='arm=trace-p11.json from a diagnostic run of that arm')
p.add_argument('--out', type=Path, default=ROOT / 'evidence/perf/p12/comparison.json')
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

def scheduler(run):
    """CPU % of one core, slices per second and runqueue wait (ms per second) of the audio pair and the render thread."""
    s0, s1 = run / 'device-counters-start.txt', run / 'device-counters-end.txt'
    if not (s0.exists() and s1.exists()):
        return None
    n0, c0, u0 = counters(s0)
    n1, c1, u1 = counters(s1)
    if not c1 or u0 is None or u1 is None:
        return None
    seconds = u1 - u0
    out = {}
    for key, (cpu, wait, slices) in c1.items():
        name = n1.get(key, '')
        label = 'AudioOut_D' if name.startswith('AudioOut_D') else 'writer' if name == 'writer' else 'render (GLThread)' if name.startswith('GLThread') else None
        if label is None or key not in c0:
            continue
        b = c0[key]
        out[label] = {'tid': key[1], 'cpuPercentOfOneCore': round((cpu - b[0]) / 1e9 / seconds * 100, 2),
                      'slicesPerSecond': round((slices - b[2]) / seconds), 'runqueueWaitMsPerSecond': round((wait - b[1]) / 1e6 / seconds, 2)}
    return {'seconds': round(seconds, 2), 'threads': out,
            'limit': '/proc/<pid>/task/<tid>/schedstat between the two counter reads around the probe (the probe only, no tracing). '
                     'Runqueue wait is all time runnable but not running (preempted or waking), whoever held the CPU.'}

def arm_seen(run, arm, audio):
    """The arm the APK actually ran: RaceGame logs 'audio arm=<id>' for a perf arm; /stats audio.backend.native.arm agrees."""
    log = ''.join((run / f).read_text(errors='replace') for f in ('startup-logcat.txt', 'logcat.txt') if (run / f).exists())
    logged = re.findall(r'DeathRide: audio arm=(\w+)', log)
    native = ((audio or {}).get('backend') or {}).get('native') or {}
    seen = native.get('arm', 'full')
    ok = seen == arm and (logged == [] if arm == 'full' else set(logged) == {arm})
    return {'logcat': sorted(set(logged)), 'statsArm': seen, 'matches': ok}

def run_row(arm, run):
    d = json.loads((run / 'p11-readings.json').read_text())
    s = json.loads((run / 'summary.json').read_text())
    at = d['attribution']
    audio = s.get('audio') or {}
    backend = audio.get('backend') or {}
    dev = (d.get('deviceCounters') or {}).get('cpuPercentOfOneCore') or {}
    return {'arm': arm, 'run': run.name, 'apkSha256': d['apkSha256'], 'durationSeconds': d['durationSeconds'], 'functionalPass': d['functionalPass'],
            'armCheck': arm_seen(run, arm, audio),
            'activeFrames': at['over33Ms']['ofActive'], 'activeFramesOver33Ms': at['over33Ms']['frames'], 'activeFramesOver20Ms': at['over20Ms']['frames'],
            'activeFramesOver16_7Ms': at['over16.7Ms']['frames'], 'activeP95WorstMs': value(d, 'activeP95WorstMs'), 'activeMaxMs': value(d, 'activeMaxMs'),
            'activeP50RangeMs': value(d, 'activeP50RangeMs'), 'pssRangeMiB': value(d, 'pssRangeMiB'),
            'over33OffCpuOver8Ms': at['over33Ms']['offCpuOver8Ms'], 'over33DuringGc': at['over33Ms']['duringGc'],
            'over33ByDominantCategory': at['over33Ms']['byDominantCategory'],
            'audioPairCpuPercentOfOneCore': {k: dev.get(k) for k in ('audioserver AudioOut_D', 'audio HAL writer')},
            'scheduler': scheduler(run),
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
        pair = sum(v for k, v in pre.items() if k.startswith(('writer', 'AudioOut_D')))
        total = x['meanMs']['preemptedMs'] * x['frames']
        app = sum(v for k, v in pre.items() if k.startswith(('SoundPool', 'DeathRideAudio', 'AudioTrack')))
        out[lim] = {'frames': x['frames'], 'meanMs': x['meanMs'], 'preemptedTotalMs': round(total, 1), 'preemptedByAudioPairMs': round(pair, 1),
                    'audioPairShareOfPreempted': round(pair / total, 3) if total else None, 'preemptedByAppAudioThreadsMs': round(app, 1),
                    'preemptedByTop': dict(list(pre.items())[:6])}
    pair = [h for h in t['highPriorityThreads'] if h['thread'].startswith(('writer', 'AudioOut_D'))]
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
valid = [r for r in runs if r['armCheck']['matches']]
by = {arm: [r for r in valid if r['arm'] == arm] for arm in ARMS}
READINGS = ('activeFramesOver33Ms', 'activeP95WorstMs', 'activeFramesOver20Ms')

def mean(xs):
    return round(statistics.fmean(xs), 3) if xs else None

verdicts = {}
full = by['full']
for arm in ARMS[1:]:
    rows = by[arm]
    v = {}
    for k in READINGS:
        if len(rows) < 2 or len(full) < 2:
            v[k] = {'verdict': 'incomplete', 'arm': [r[k] for r in rows], 'full': [r[k] for r in full]}
            continue
        beats = max(r[k] for r in rows) < min(r[k] for r in full)
        fm, am = statistics.fmean(r[k] for r in full), statistics.fmean(r[k] for r in rows)
        v[k] = {'verdict': 'beats full' if beats else 'not shown', 'arm': [r[k] for r in rows], 'full': [r[k] for r in full],
                'meanChange': round(am - fm, 3), 'meanChangePercent': round((am - fm) / fm * 100, 1) if fm else None}
    v['primary'] = v['activeFramesOver33Ms']['verdict']
    v['clearsI2Frames'] = len(rows) >= 2 and all(r['activeP95WorstMs'] <= 16.7 and r['activeMaxMs'] <= 33 for r in rows)
    verdicts[arm] = v
out = {'rule': RULE, 'runs': runs, 'void': [r['run'] for r in runs if not r['armCheck']['matches']], 'verdicts': verdicts,
       'perArmMeans': {arm: {k: mean([r[k] for r in by[arm]]) for k in READINGS + ('activeMaxMs',)} for arm in ARMS},
       'traces': traces,
       'limits': 'Two profiled 360 s runs per arm on one Stick, interleaved, with the host shared with other builders (host CPU per run recorded). '
                 'One atrace per arm, beside a separate diagnostic run. No listening test: whether capped or still sounds different is not measured.'}
a.out.parent.mkdir(parents=True, exist_ok=True)
a.out.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({'void': out['void'], 'verdicts': {k: {x: (y['verdict'] if isinstance(y, dict) else y) for x, y in v.items()} for k, v in verdicts.items()},
                  'table': [(r['arm'], r['run'], r['activeFramesOver33Ms'], r['activeFramesOver20Ms'], r['activeP95WorstMs'], r['activeMaxMs'],
                             r['audioPairCpuPercentOfOneCore'], (r['scheduler'] or {}).get('threads')) for r in runs]}, indent=1))
