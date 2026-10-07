"""P11 readings: the Stick active-frame tail, attributed by phase, plus the I2 readings and the probe's sampling record.

One perf-device arm (summary.json, raw.json.gz, logcat.txt, host-cpu-*.json) -> p11-readings.json:
- I2 readings, each marked pass or fail (active p95 <= 16.7 ms, active max <= 33 ms, median 16-18 ms, PSS < 192 MiB,
  warm PSS growth <= 8 MiB, zero rejected inputs), with input Hz and host pump stalls reported beside them;
- each host pump stall placed against the memory samples (requested/started/completed, recorded since P11);
- the attribution: every active racing frame (profile rows, phase race with the scene ready) whose interval exceeds
  16.7, 20 or 33 ms, split by phase. A render's interval is the previous render's work plus the time between the
  two renders (eglSwapBuffers and the GL thread's own work), so a slow interval is charged to the previous row's phases.
  Each slow frame goes to the category whose time exceeds its active-frame median by the most; ART GC comes from the
  logcat (each GC line is [end - total, end]) and profile saves from the request timers, both placed on the profile's
  clock through the request-timer lines (a request starts its render, so log time - totalMs ~ the row's startNs).
No threshold, clock or reading definition differs from perf-summary.py; the frame categories are this file's own."""
import argparse, bisect, datetime, gzip, json, re, statistics
from collections import Counter
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('arm', type=Path, help='perf-device output directory holding summary.json, raw.json.gz, logcat.txt')
p.add_argument('out', type=Path)
a = p.parse_args()
s = json.loads((a.arm / 'summary.json').read_text())
raw = json.loads(gzip.decompress((a.arm / 'raw.json.gz').read_bytes()))
log = (a.arm / 'logcat.txt').read_text(errors='replace').splitlines()
VSYNC_MS = 1000 / 60
THRESHOLDS = (16.7, 20.0, 33.0)

def reading(name, value, limit, ok, basis):
    return {'reading': name, 'value': value, 'limit': limit, 'status': 'pass' if ok else 'fail', 'basis': basis}

def rng(xs):
    xs = [x for x in xs if x is not None]
    return [round(min(xs), 3), round(max(xs), 3)] if xs else None

# --- I2 readings (perf-summary.py's definitions; only the pass/fail marks are added here) ---
aw, clients = s['activeWindows'], s.get('clients') or []
pss = s['pssRangeMiB']
readings = [
    reading('activeP95WorstMs', aw.get('worstP95Ms'), '<= 16.7 ms', bool(aw.get('count')) and aw['worstP95Ms'] <= 16.7, 'I2 frame objective (original ambition); worst 10 s active window'),
    reading('activeP95WorstVsG1Ms', aw.get('worstP95Ms'), '<= 21.60 ms (G1, comparison only)', bool(aw.get('count')) and aw['worstP95Ms'] <= 21.60, 'I2 comparison with G1'),
    reading('activeMaxMs', aw.get('maxMs'), '<= 33 ms', bool(aw.get('count')) and aw['maxMs'] <= 33, 'I2 active maximum target'),
    reading('activeP50RangeMs', aw.get('p50RangeMs'), '16-18 ms', bool(aw.get('count')) and 16 <= aw['p50RangeMs'][0] and aw['p50RangeMs'][1] <= 18, 'I2 median objective'),
    reading('pssRangeMiB', pss, '< 192 MiB', bool(pss) and max(pss) < 192, 'I2 whole-process PSS (dumpsys meminfo --local)'),
    reading('warmPssGrowthMiB', s.get('warmPssGrowthMiB'), '<= 8 MiB', s.get('warmPssGrowthMiB') is not None and s['warmPssGrowthMiB'] <= 8, 'I2 first/last three warm medians'),
    reading('rejectedInputs', [c['rejected'] for c in clients], '0 per seat', s['gates']['zeroRejected'], 'I2 zero-rejection gate'),
    reading('inputStream', {'hz': [c['hz'] for c in clients], 'pumpStalls': len(s['pumpStalls'])}, '> 29 Hz per seat, no host pump stall', s['gates']['inputStream'], 'I2 required input throughput'),
    reading('durationSeconds', s['durationSeconds'], '>= 900 s for a soak', s['gates']['duration'], 'I2 sustained run'),
]

# --- the probe's sampling against its pump stalls (sampler timing exists from P11 on) ---
t0 = raw['hostTimeOriginEpochMs']
samples = [{'second': m['second'], **{k: m['sampler'].get(k) for k in ('requestedEpochMs', 'startedEpochMs', 'completedEpochMs')}}
           for m in raw['memory'] if m.get('sampler')]
stalls = []
for st in raw['pumpStalls']:
    begin = st['epochMs'] - st['lateMs']
    near = min(samples, key=lambda x: abs(begin - x['completedEpochMs']), default=None)
    stalls.append({'second': st['second'], 'lateMs': st['lateMs'], 'beginEpochMs': begin,
                   'nearestSample': None if near is None else {'second': near['second'],
                   'beginMinusRequestedMs': begin - near['requestedEpochMs'], 'beginMinusCompletedMs': begin - near['completedEpochMs']}})
sampling = {'samples': len(raw['memory']), 'withSamplerTiming': len(samples),
            'sampleDurationMs': rng([x['completedEpochMs'] - x['startedEpochMs'] for x in samples]),
            'requestToStartMs': rng([x['startedEpochMs'] - x['requestedEpochMs'] for x in samples]),
            'pumpStalls': stalls, 'heartbeatStalls': len(raw.get('hostHeartbeatStalls') or []),
            'memorySamplerError': raw.get('memorySamplerError')}

# --- profile rows, on the device's monotonic clock ---
profiles = raw.get('profiles') or []
cols = profiles[0]['frames']['columns']
I = {c: i for i, c in enumerate(cols)}
rows, gaps, end = [], 0, None
for prof in profiles:
    f = prof['frames']
    if end is not None and f['first'] != end:
        gaps += 1
        rows.append(None)
    end = f['end']
    rows.extend(f['rows'])
PHASES = ['requestsMs', 'prepareMs', 'simulationMs', 'audioMs', 'telemetryMs', 'clearMs', 'cameraMs', 'effectsUpdateMs',
          'sceneryDrawMs', 'carsEffectsMs', 'hudMs', 'captionMs']
CATEGORY = {'requests': ['requestsMs'], 'prepare': ['prepareMs'], 'simulation': ['simulationMs'], 'audio': ['audioMs'],
            'telemetry': ['telemetryMs'], 'camera': ['cameraMs', 'effectsUpdateMs'], 'scenery': ['sceneryDrawMs'],
            'cars': ['carsEffectsMs'], 'hud': ['hudMs', 'captionMs']}

def split(prev, row):
    """Category times of one interval: the previous render's phases, its untimed tail, and the gap to this render."""
    c = {k: sum(prev[I[x]] for x in v) for k, v in CATEGORY.items()}
    c['tail'] = prev[I['workMs']] - sum(prev[I[x]] for x in PHASES)
    # The first GL call after a swap (clear) is where a buffer dequeue blocks; with the swap gap it is the flush/swap time.
    c['flushSwap'] = prev[I['clearMs']] + (row[I['intervalMs']] - prev[I['workMs']])
    return c
pairs = [(pr, r) for pr, r in zip(rows, rows[1:]) if pr and r]
active = [(pr, r) for pr, r in pairs if r[I['active']] == 1 and pr[I['active']] == 1]

# Logcat -> profile clock. Request-timer lines are logged at the end of a request that began its render.
def logtime(line):
    m = re.match(r'(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)\.(\d{3})', line)
    return datetime.datetime(2026, int(m[1]), int(m[2]), int(m[3]), int(m[4]), int(m[5]), int(m[6]) * 1000).timestamp() if m else None
anchors = [(logtime(l), float(m[2])) for l in log for m in [re.search(r'DeathRide: transition (car|startRace|lobby|track) .*totalMs=([\d.]+)', l)] if m and float(m[2]) > 40]
starts = sorted(r[I['startNs']] / 1e9 for r in rows if r and r[I['requestsMs']] > 40)
offset, matched = None, []
if anchors and starts:
    def near(x):
        k = bisect.bisect_left(starts, x)
        return min((starts[j] for j in (k - 1, k) if 0 <= j < len(starts)), key=lambda v: abs(v - x))
    best = None
    for at, ms in anchors:
        for st in starts:
            off = at - ms / 1e3 - st
            hits = [at - ms / 1e3 - near(at - ms / 1e3 - off) for at, ms in anchors]
            hits = [h for h in hits if abs(h - off) < .005]
            if best is None or len(hits) > len(best[1]):
                best = (off, hits)
    offset, matched = statistics.median(best[1]), best[1]
alignment = {'anchors': len(anchors), 'matched': len(matched), 'spreadMs': round((max(matched) - min(matched)) * 1000, 3) if matched else None,
             'limit': 'Logcat stamps are milliseconds; the anchor is the request line minus its totalMs.'}

gcs = []
for l in log:
    m = re.search(r'^\S+ \S+\s+\d+\s+(\d+) I [^:]+: (.*?)GC freed .*? paused (\S+) total ([\d.]+)(ms|us|s)\b', l)
    if m and offset is not None:
        total = float(m[4]) * {'ms': 1e-3, 'us': 1e-6, 's': 1.0}[m[5]]
        e = logtime(l) - offset
        gcs.append({'start': e - total, 'end': e, 'kind': m[2].strip(), 'totalMs': total * 1e3, 'paused': m[3], 'tid': int(m[1])})
gcWaits = [l[19:].strip() for l in log if 'WaitForGcToComplete' in l]
saves = []
for l in log:
    m = re.search(r'DeathRide: transition profile seat=(\d) saveMs=([\d.]+) publishMs=([\d.]+)', l)
    if m and offset is not None:
        saves.append({'time': logtime(l) - offset, 'seat': int(m[1]), 'saveMs': float(m[2]), 'publishMs': float(m[3])})
gcStarts = [g['start'] for g in gcs]

def overlaps_gc(t0_, t1_):
    k = bisect.bisect_right(gcStarts, t1_)
    return [g for g in gcs[max(0, k - 8):k] if g['end'] > t0_]

med = {}
if active:
    keys = list(split(*active[0]).keys())
    sp = [split(pr, r) for pr, r in active]
    med = {k: statistics.median(x[k] for x in sp) for k in keys}

def frame(pr, r):
    c = split(pr, r)
    excess = {k: c[k] - med[k] for k in c}
    gc = overlaps_gc(pr[I['startNs']] / 1e9, r[I['startNs']] / 1e9)
    return {'startSeconds': round(pr[I['startNs']] / 1e9, 4), 'intervalMs': round(r[I['intervalMs']], 3), 'workMs': round(pr[I['workMs']], 3),
            'cpuMs': round(pr[I['cpuMs']], 3), 'offCpuMs': round(pr[I['workMs']] - pr[I['cpuMs']], 3),
            'dominant': max(excess, key=excess.get), 'categoryMs': {k: round(v, 3) for k, v in c.items()},
            'gc': [{'kind': g['kind'], 'totalMs': g['totalMs']} for g in gc], 'liveCars': pr[I['liveCars']], 'drawCalls': pr[I['drawCalls']]}

attribution = {}
for lim in THRESHOLDS:
    slow = [frame(pr, r) for pr, r in active if r[I['intervalMs']] > lim]
    attribution[f'over{lim:g}Ms'] = {
        'frames': len(slow), 'ofActive': len(active),
        'byDominantCategory': dict(Counter(f['dominant'] for f in slow).most_common()),
        'duringGc': sum(1 for f in slow if f['gc']),
        'offCpuOver8Ms': sum(1 for f in slow if f['offCpuMs'] > 8),
        'byDominantCategoryOutsideGc': dict(Counter(f['dominant'] for f in slow if not f['gc']).most_common()),
        'meanCategoryMs': {k: round(statistics.fmean(f['categoryMs'][k] for f in slow), 3) for k in med} if slow else {},
    }
activeGc = sum(1 for pr, r in active if overlaps_gc(pr[I['startNs']] / 1e9, r[I['startNs']] / 1e9))
over33 = [frame(pr, r) for pr, r in active if r[I['intervalMs']] > 33]

# Profile saves, counted apart (money/data path; not changed by P11): every frame, active or not.
saveFrames = []
starts_all = [pr[I['startNs']] / 1e9 for pr, r in pairs]
for sv in saves:
    k = bisect.bisect_right(starts_all, sv['time']) - 1
    if k >= 0:
        pr, r = pairs[k]
        saveFrames.append({**sv, 'renderActive': pr[I['active']] == 1, 'requestsMs': pr[I['requestsMs']], 'simulationMs': pr[I['simulationMs']],
                           'nextIntervalMs': r[I['intervalMs']]})
saveSummary = {'saves': len(saves), 'framesOver33Ms': sum(1 for f in saveFrames if f['nextIntervalMs'] > 33),
               'framesOver100Ms': sum(1 for f in saveFrames if f['nextIntervalMs'] > 100),
               'inActiveFrames': sum(1 for f in saveFrames if f['renderActive']), 'saveMs': rng([f['saveMs'] for f in saveFrames])}

hostCpu = {}
for name in ('host-cpu-start.json', 'host-cpu-end.json'):
    f = a.arm / name
    if f.exists():
        try:
            h = json.loads(f.read_text(encoding='utf-8-sig'))
            hostCpu[name] = {'utc': h.get('utc'), 'totalPercentSamples': h.get('totalPercentSamples'), 'logicalProcessors': h.get('logicalProcessors'),
                             'top': [(t['Name'], t['PercentProcessorTime']) for t in h.get('topProcesses') or []][:5]}
        except (ValueError, KeyError) as e:
            hostCpu[name] = {'error': repr(e)}
runtime = [(prof['second'], prof['runtime']) for prof in profiles if prof.get('runtime')]
alloc = None
if len(runtime) > 2:
    (s0, r0), (s1, r1) = runtime[1], runtime[-1]
    alloc = {'bytesAllocatedPerSecond': (int(r1['art.gc.bytes-allocated']) - int(r0['art.gc.bytes-allocated'])) / (s1 - s0),
             'gcCount': int(r1['art.gc.gc-count']) - int(r0['art.gc.gc-count']), 'gcTimeMs': int(r1['art.gc.gc-time']) - int(r0['art.gc.gc-time']),
             'blockingGcCount': int(r1['art.gc.blocking-gc-count']) - int(r0['art.gc.blocking-gc-count']), 'seconds': s1 - s0,
             'limit': 'Whole process (ART runtime stats from /profile), between the second and the last profile fetch.'}

out = {'arm': a.arm.name, 'apkSha256': s['apkSha256'], 'sourceSha256': s['sourceSha256'], 'durationSeconds': s['durationSeconds'],
       'rounds': s['rounds'], 'functionalPass': s['functionalPass'], 'error': s.get('error'), 'hostCpu': hostCpu, 'readings': readings,
       'sampling': sampling, 'profileRows': sum(1 for r in rows if r), 'profileGaps': gaps, 'alignment': alignment,
       'activePhaseMediansMs': {k: round(v, 3) for k, v in med.items()}, 'attribution': attribution,
       'gc': {'lines': len(gcs), 'totalMs': rng([g['totalMs'] for g in gcs]), 'activeFramesOverlappingGc': activeGc, 'waits': gcWaits},
       'runtimeAllocation': alloc, 'profileSaves': saveSummary, 'activeFramesOver33Ms': over33,
       'activeWindows': aw, 'sixLiveWindows': s['sixLiveWindows'], 'clients': clients,
       'limits': 'Profiled arm (/profile every 10 s). Off-CPU time (work - thread CPU) says the render thread was not running, '
                 'not why: a scheduler trace separates runnable (preempted) from sleeping (blocked). GC overlap is time overlap, not cause. '
                 'Not optical latency or owner feel.'}
a.out.parent.mkdir(parents=True, exist_ok=True)
a.out.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({'readings': {r['reading']: [r['value'], r['status']] for r in readings}, 'stalls': stalls, 'alignment': alignment,
                  'attribution': {k: {x: v[x] for x in ('frames', 'byDominantCategory', 'duringGc', 'offCpuOver8Ms')} for k, v in attribution.items()},
                  'gc': out['gc']['lines'], 'activeFramesOverlappingGc': activeGc, 'alloc': alloc, 'saves': saveSummary}, indent=1))
