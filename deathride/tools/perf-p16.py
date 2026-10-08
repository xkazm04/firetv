"""P16: the optimize wave's last two cards on the Stick, the HUD font pages merge (card 1) and the static HUD layer (card 2).
Three APKs of the perf package (base, fonts = card 1, layer = card 1 + card 2), two profiled 360 s runs each, interleaved,
compared under a rule fixed before the first graded run. A copy of perf-p14.py with P16's arms, readings and comparisons;
perf-p14.py itself is unchanged.

Inputs per run: the perf-device output directory after perf-summary.py (summary.json, raw.json.gz) and perf-p11.py
(p11-readings.json) ran on it, plus installed.json for the APK. Output: one JSON with the per-run table and the verdicts.

The HUD readings come from the profile rows of active race frames (phase race with the scene ready, the profiler's
`active` column): hudMs (the drawOverlay phase), hudFlushes (the HUD SpriteBatch's renderCalls), hudDraws (GL draw calls
inside drawOverlay), drawCalls and textureBinds (whole frame), hudBakeMs (layer bakes). The frame, memory and texture
readings are P11's (perf-p11.py, perf-summary.py). Nothing here changes a threshold, clock, input rate, warm-up exclusion
or render scale."""
import argparse, gzip, hashlib, json, statistics
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARMS = ('base', 'fonts', 'layer')
RULE = ('Fixed before the first graded run (P12 rule, P16 arms). Arms: base = deathride/main d95166c8 plus the perf-only HUD '
        'counters (d6740d7f); fonts = base plus card 1 (one runtime font page); layer = fonts plus card 2 (the retained HUD '
        'layer). Each arm is its own APK of the perf package, identified by the APK SHA-256 in installed.json. Two profiled '
        '360 s runs per arm by P14\'s procedure (P11\'s command: perf-device.py --profile --seconds 360, warm routes, five-course '
        'cycle, no extra), interleaved base, fonts, layer, base, fonts, layer. Readings per run over active race frames (profile '
        'column active = 1): hudMs mean (deciding), hudMs p95, hudFlushes mean (deciding for card 1), hudDraws mean, drawCalls '
        'mean, textureBinds mean, frames with a layer bake. Arm X beats arm Y on a reading when BOTH runs of X read lower than '
        'BOTH runs of Y; anything else is "not shown". Card 1 (fonts vs base) is built when fonts beats base on hudMs mean AND '
        'on hudFlushes mean. Card 2 (layer vs fonts) is built when layer beats fonts on hudMs mean and its hudFlushes mean is '
        'not higher than either fonts run (card 1 already leaves the HUD batch at its floor of two textures, the layer and the '
        'font page, so card 2 cannot lower the count further). Guards, judged per card against its reference with the same '
        'rule: active frames over 33 ms, active frames over 20 ms, worst active-window p95, PSS max and owned textures must not '
        'be worse, where worse means the reference beats the card on that reading; owned textures must also stay <= 52 MiB. A '
        'card that fails its deciding readings or a guard is declined with its figures and its code is reverted. A run is void '
        'and is rerun once when it has any rejected input (a rejection burst), when it fails functionally, or when its APK is '
        'not its arm\'s; the void run stays in the record.')
p = argparse.ArgumentParser()
p.add_argument('--run', action='append', default=[], help='arm=perf-device output directory')
p.add_argument('--apk', action='append', default=[], help='arm=APK path (its SHA-256 identifies the arm)')
p.add_argument('--out', type=Path, default=ROOT / 'evidence/perf/p16/comparison.json')
a = p.parse_args()

def value(d, name):
    return next(r['value'] for r in d['readings'] if r['reading'] == name)

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def pct(xs, q):
    xs = sorted(xs)
    if not xs:
        return None
    k = (len(xs) - 1) * q
    lo = int(k)
    hi = min(lo + 1, len(xs) - 1)
    return xs[lo] + (xs[hi] - xs[lo]) * (k - lo)

def hud(run):
    """Active race frames from the profile rows: the HUD phase's time, flushes and draws, the frame's draws and binds."""
    raw = json.loads(gzip.decompress((run / 'raw.json.gz').read_bytes()))
    profiles = raw.get('profiles') or []
    if not profiles:
        return None
    cols = profiles[0]['frames']['columns']
    I = {c: i for i, c in enumerate(cols)}
    rows = [r for prof in profiles for r in prof['frames']['rows'] if r[I['active']] == 1]
    if not rows or 'hudFlushes' not in I:
        return {'activeFrames': len(rows), 'error': 'no active rows or no HUD counters'}
    col = lambda name: [r[I[name]] for r in rows]
    hud_ms = col('hudMs')
    bake = col('hudBakeMs')
    return {'activeFrames': len(rows),
            'hudMsMean': round(statistics.fmean(hud_ms), 4), 'hudMsP50': round(pct(hud_ms, .5), 4),
            'hudMsP95': round(pct(hud_ms, .95), 4), 'hudMsMax': round(max(hud_ms), 3),
            'hudFlushesMean': round(statistics.fmean(col('hudFlushes')), 4),
            'hudFlushesCounts': {str(int(k)): v for k, v in sorted(Counter(col('hudFlushes')).items())},
            'hudDrawsMean': round(statistics.fmean(col('hudDraws')), 4),
            'hudDrawsCounts': {str(int(k)): v for k, v in sorted(Counter(col('hudDraws')).items())},
            'drawCallsMean': round(statistics.fmean(col('drawCalls')), 3), 'textureBindsMean': round(statistics.fmean(col('textureBinds')), 3),
            'framesWithBake': sum(1 for x in bake if x > 0), 'bakeMsMax': round(max(bake), 3),
            'workMsMean': round(statistics.fmean(col('workMs')), 4), 'cpuMsMean': round(statistics.fmean(col('cpuMs')), 4)}

apks = {arm: sha(path) for arm, path in (x.split('=', 1) for x in a.apk)}

def run_row(arm, run):
    d = json.loads((run / 'p11-readings.json').read_text())
    s = json.loads((run / 'summary.json').read_text())
    at = d['attribution']
    installed = json.loads((run / 'installed.json').read_text())['apkSha256']
    h = hud(run) or {}
    pss = value(d, 'pssRangeMiB')
    return {'arm': arm, 'run': run.name, 'apkSha256': installed, 'apkMatchesArm': apks.get(arm) == installed,
            'durationSeconds': d['durationSeconds'], 'functionalPass': d['functionalPass'], 'error': d.get('error'),
            **h,
            'activeFramesOver33Ms': at['over33Ms']['frames'], 'activeFramesOver20Ms': at['over20Ms']['frames'],
            'activeP95WorstMs': value(d, 'activeP95WorstMs'), 'activeMaxMs': value(d, 'activeMaxMs'),
            'activeP50RangeMs': value(d, 'activeP50RangeMs'), 'pssRangeMiB': pss, 'pssMaxMiB': max(pss) if pss else None,
            'ownedTextureMiB': s.get('ownedTextureMiB'), 'artMiB': s.get('artMiB'),
            'over33ByDominantCategory': at['over33Ms']['byDominantCategory'],
            'rejectedInputs': value(d, 'rejectedInputs'), 'inputStream': value(d, 'inputStream'),
            'gcLines': d['gc']['lines'], 'hostCpu': d.get('hostCpu')}

def pairs(items):
    for item in items:
        arm, path = item.split('=', 1)
        assert arm in ARMS, arm
        yield arm, Path(path)

runs = [run_row(arm, path) for arm, path in pairs(a.run)]
def rejected(r):
    v = r['rejectedInputs']
    return any(v) if isinstance(v, list) else bool(v)
valid = [r for r in runs if r['apkMatchesArm'] and r['functionalPass'] and not rejected(r)]
by = {arm: [r for r in valid if r['arm'] == arm] for arm in ARMS}

def judge(x, y, k):
    vx, vy = [r.get(k) for r in by[x]], [r.get(k) for r in by[y]]
    if len(vx) < 2 or len(vy) < 2 or None in vx + vy:
        return {'verdict': 'incomplete', x: vx, y: vy}
    verdict = f'{x} beats {y}' if max(vx) < min(vy) else f'{y} beats {x}' if max(vy) < min(vx) else 'not shown'
    my = statistics.fmean(vy)
    return {'verdict': verdict, x: vx, y: vy, 'meanChange': round(statistics.fmean(vx) - my, 4),
            'meanChangePercent': round((statistics.fmean(vx) - my) / my * 100, 1) if my else None}

READINGS = ('hudMsMean', 'hudMsP95', 'hudFlushesMean', 'hudDrawsMean', 'drawCallsMean', 'textureBindsMean', 'workMsMean',
            'activeFramesOver33Ms', 'activeFramesOver20Ms', 'activeP95WorstMs', 'activeMaxMs', 'pssMaxMiB', 'ownedTextureMiB')
GUARDS = ('activeFramesOver33Ms', 'activeFramesOver20Ms', 'activeP95WorstMs', 'pssMaxMiB', 'ownedTextureMiB')
CARDS = (('card 1: font pages merge', 'fonts', 'base', ('hudMsMean', 'hudFlushesMean')),
         ('card 2: static HUD layer', 'layer', 'fonts', ('hudMsMean',)))

cards = {}
for name, x, y, deciding in CARDS:
    v = {k: judge(x, y, k) for k in READINGS}
    beats = {k: v[k]['verdict'] == f'{x} beats {y}' for k in deciding}
    worse = {k: v[k]['verdict'] == f'{y} beats {x}' for k in GUARDS}
    flushes_not_higher = (len(by[x]) >= 2 and len(by[y]) >= 2 and
                          max(r['hudFlushesMean'] for r in by[x]) <= min(r['hudFlushesMean'] for r in by[y]))
    textures_ok = bool(by[x]) and all((r['ownedTextureMiB'] or 0) <= 52 for r in by[x])
    complete = all(v[k]['verdict'] != 'incomplete' for k in deciding)
    built = complete and all(beats.values()) and not any(worse.values()) and textures_ok and \
        (x != 'layer' or flushes_not_higher)
    cards[name] = {'arm': x, 'reference': y, 'deciding': {k: v[k]['verdict'] for k in deciding},
                   'guardsWorse': {k: w for k, w in worse.items() if w}, 'flushesNotHigher': flushes_not_higher,
                   'ownedTexturesWithin52MiB': textures_ok, 'complete': complete,
                   'disposition': ('built' if built else 'declined') if complete else 'incomplete', 'readings': v}

out = {'rule': RULE, 'apks': apks, 'runs': runs,
       'void': [{'run': r['run'], 'reason': 'APK is not the arm\'s' if not r['apkMatchesArm'] else 'rejected inputs' if rejected(r) and r['functionalPass']
                 else 'functional failure: ' + str(r['error'])[:160]} for r in runs if r not in valid],
       'cards': cards,
       'perArmMeans': {arm: {k: (round(statistics.fmean([r[k] for r in by[arm] if r.get(k) is not None]), 4)
                                 if [r for r in by[arm] if r.get(k) is not None] else None) for k in READINGS} for arm in ARMS},
       'limits': 'Two profiled 360 s runs per arm on one Stick, interleaved, on a host shared with other builders (host CPU per run '
                 'recorded); not settled (P12\'s procedure has no settle). hudMs is render-thread wall time of the HUD phase; GPU time '
                 'is not in it and shows only in the frame readings.'}
a.out.parent.mkdir(parents=True, exist_ok=True)
a.out.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({'void': out['void'], 'cards': {k: {'disposition': v['disposition'], 'deciding': v['deciding'], 'guardsWorse': v['guardsWorse']}
                                                 for k, v in cards.items()},
                  'table': [(r['arm'], r['run'], r.get('hudMsMean'), r.get('hudMsP95'), r.get('hudFlushesMean'), r.get('hudDrawsMean'),
                             r['activeFramesOver33Ms'], r['activeFramesOver20Ms'], r['activeP95WorstMs'], r['pssMaxMiB'], r['ownedTextureMiB'])
                            for r in runs]}, indent=1))
