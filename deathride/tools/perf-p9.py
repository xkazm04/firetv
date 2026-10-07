"""P9 readings: one perf-device arm against the I2 budgets and the P8 delivery, from its summary/raw/logcat."""
import argparse, gzip, json, math, re, statistics
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('arm', type=Path, help='perf-device output directory holding summary.json, raw.json.gz, logcat.txt')
p.add_argument('out', type=Path)
a = p.parse_args()
s = json.loads((a.arm / 'summary.json').read_text())
raw = json.loads(gzip.decompress((a.arm / 'raw.json.gz').read_bytes()))

P8 = {'activeP95Ms': 22.43323, 'activeMaxMs': 54.922616, 'sixLiveP95Ms': 22.43323, 'pssPeakMiB': 140.1923828125,
      'transitionMaxMs': 288.857, 'source': 'evidence/perf/final/delivery/summary.json (unprofiled, P8 course cycle)'}

def q(values):
    v = sorted(values)
    if not v:
        return {'count': 0}
    return {'count': len(v), 'p50': v[math.ceil(len(v) * .5) - 1], 'p95': v[math.ceil(len(v) * .95) - 1],
            'p99': v[math.ceil(len(v) * .99) - 1], 'max': v[-1], 'mean': statistics.fmean(v)}

windows = raw['windows']
active = [w for w in windows if w['stats']['phase'] == 'race' and w['stats']['raceSeconds'] >= 10]
transition = [w for w in windows if not (w['stats']['phase'] == 'race' and w['stats']['raceSeconds'] >= 10)]
transitionMax = max((w['stats']['frameTimeMs']['last10s']['max'] for w in transition), default=None)

def reading(name, value, limit, ok, basis):
    return {'reading': name, 'value': value, 'limit': limit, 'status': 'pass' if ok else 'fail', 'basis': basis}

aw, six = s['activeWindows'], s['sixLiveWindows']
clients = s.get('clients') or []
readings = [
    reading('durationSeconds', s['durationSeconds'], '>= 900', s['gates']['duration'], 'I2 sustained run'),
    reading('activeP50RangeMs', aw['p50RangeMs'], '16-18 ms', 16 <= aw['p50RangeMs'][0] and aw['p50RangeMs'][1] <= 18, 'I2 frame objective, median near 16.7'),
    reading('activeP95WorstMs', aw['worstP95Ms'], '<= 16.7 ms', aw['worstP95Ms'] <= 16.7, 'I2 original ambition (perf-summary frameP95 gate)'),
    reading('activeP95WorstVsG1Ms', aw['worstP95Ms'], '<= 21.60 ms', aw['worstP95Ms'] <= 21.60, 'I2 comparison with G1, not an automatic pass'),
    reading('activeMaxMs', aw['maxMs'], '< 33 ms', aw['maxMs'] < 33, 'I2 active maximum target'),
    reading('sixLiveP95WorstMs', six.get('worstP95Ms'), '<= 16.7 ms', six.get('count', 0) > 0 and six['worstP95Ms'] <= 16.7, 'I2 original ambition, six live cars'),
    reading('pssRangeMiB', s['pssRangeMiB'], '< 192 MiB', bool(s['pssRangeMiB']) and max(s['pssRangeMiB']) < 192, 'I2 whole-process PSS'),
    reading('warmPssGrowthMiB', s['warmPssGrowthMiB'], '<= 8 MiB', s['warmPssGrowthMiB'] is not None and s['warmPssGrowthMiB'] <= 8, 'I2 first/last three warm medians'),
    reading('ownedTextureMiB', s['ownedTextureMiB'], '<= 52 MiB', s['ownedTextureMiB'] <= 52, 'I2 total owned textures'),
    reading('artMiB', s['artMiB'], '<= 32 MiB', s['artMiB'] <= 32, 'I2 resident art'),
    reading('rejectedInputs', [c['rejected'] for c in clients], '0 per seat', s['gates']['zeroRejected'], 'I2 zero-rejection gate'),
    reading('inputStream', {'hz': [c['hz'] for c in clients], 'pumpStalls': len(s['pumpStalls'])}, '> 29 Hz per seat, no host pump stall', s['gates']['inputStream'], 'I2 required input throughput'),
    reading('functional', s['functionalPass'], 'probe assertions pass', s['gates']['functional'], 'every class activated, all inputs accepted'),
]
profile = s.get('profile', {})
phases = {k: profile.get('active', {}).get(k) for k in ('intervalMs', 'workMs', 'cpuMs', 'sceneryDrawMs', 'carsEffectsMs', 'hudMs', 'clearMs', 'drawCalls', 'textureBinds')}

# Every recorded render longer than 100 ms with its phase split (startup and course-selection hitches).
rows, cols = [], None
for prof in raw.get('profiles', []):
    cols = prof['frames']['columns']
    rows.extend(prof['frames']['rows'])
hitches = []
if cols:
    i = {c: n for n, c in enumerate(cols)}
    for r in rows:
        if r[i['workMs']] > 100 or r[i['intervalMs']] > 100:
            hitches.append({c: r[i[c]] for c in ('intervalMs', 'workMs', 'requestsMs', 'prepareMs', 'simulationMs', 'audioMs',
                'telemetryMs', 'clearMs', 'sceneryDrawMs', 'carsEffectsMs', 'hudMs', 'textureUploads', 'active')})
bakes = []
log = (a.arm / 'logcat.txt').read_text(errors='replace')
for m in re.finditer(r'^(\S+ \S+).*sceneryBake (\S+) slicedFrames=(\d+) totalCpuMs=([\d.]+) maxSliceMs=([\d.]+)', log, re.M):
    bakes.append({'logTime': m[1], 'course': m[2], 'slicedFrames': int(m[3]), 'totalCpuMs': float(m[4]), 'maxSliceMs': float(m[5])})

details = []
for m in re.finditer(r'^(\S+ \S+).*sceneryBakeDetail (\S+) selectRegionMs=([\d.]+) selectRegionUploadMs=(-?[\d.]+) slowStep=(\w+):([\d.]+) firstProjectMs=(-?[\d.]+) stages=(\S+)', log, re.M):
    details.append({'logTime': m[1], 'course': m[2], 'selectRegionMs': float(m[3]), 'selectRegionUploadMs': float(m[4]),
        'slowStep': m[5], 'slowStepMs': float(m[6]), 'firstProjectMs': float(m[7]),
        'stageMs': {k: float(v) for k, v in (x.split(':') for x in m[8].split(','))}})
memorySeconds = [round(x['second'], 1) for x in raw['memory']]
stallsAtMemory = [p['second'] for p in s['pumpStalls'] if any(abs(p['second'] - m) < 2 for m in memorySeconds)]
out = {'arm': a.arm.name, 'apkSha256': s['apkSha256'], 'sourceSha256': s['sourceSha256'], 'tracks': raw.get('tracks'),
       'rounds': s['rounds'], 'readings': readings, 'transitionMaxMs': transitionMax,
       'transitionLimit': 'I2 keeps transition maxima separate and sets no transition budget; reported, not graded.',
       'activeWindows': aw, 'sixLiveWindows': six, 'sinceStartFrameMs': s['sinceStartFrameMs'],
       'profileActivePhases': phases, 'profileRows': profile.get('rows'), 'profileGaps': profile.get('gaps'),
       'renders100msPlus': hitches, 'sceneryBakes': bakes, 'sceneryBakeDetails': details, 'pumpStalls': s['pumpStalls'],
       'memorySampleSeconds': memorySeconds, 'pumpStallsWithin2sOfMemorySample': f'{len(stallsAtMemory)}/{len(s["pumpStalls"])}',
       'hostHeartbeatStalls': s.get('hostDiagnostics', {}).get('heartbeatStalls'), 'p8Delivery': P8,
       'limits': 'Profiled arm (/profile polled every 10 s, --ez profile true); P8 delivery was unprofiled and ran the P8 course cycle. Not optical latency or owner feel.'}
a.out.parent.mkdir(parents=True, exist_ok=True)
a.out.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({'readings': [(r['reading'], r['value'], r['status']) for r in readings], 'transitionMaxMs': transitionMax,
                  'sceneryDrawMs': phases.get('sceneryDrawMs'), 'hitches': len(hitches)}, indent=1))
