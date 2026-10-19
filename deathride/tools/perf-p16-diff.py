"""P16 pixel proof summary. Reads the hudDiff log lines and PNGs of perf-only `hudDiff=on` runs (diff.sh pulls them) and writes
one JSON: every capture's pairwise comparison as the device logged it, re-checked from the PNGs, and for the layer variant
every pixel whose largest RGB difference exceeds 1, placed against the edges the bake rasterizes: the nine-patch seams and
outer edges of the race frames and the icon quads, in stage units (1280x720) on the 1920x1080 back buffer.

The frame rectangles mirror the race branch of RaceGame.drawOverlay (drawRaceChrome in 42833cd9); seams follow AtlasArt.frame (NinePatch(left=interior[0],
right=width-interior[2], top=interior[1], bottom=height-interior[3]) scaled by .12 for 256-texel regions)."""
import argparse, json, re
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('run', nargs='+', type=Path, help='diff run directory (diff-lines.txt, hud-diff/*.png)')
p.add_argument('--out', type=Path, default=ROOT / 'evidence/perf/p16/pixel-diff.json')
a = p.parse_args()

catalog = json.loads((ROOT / 'assets/phase2-states/catalog.json').read_text(encoding='utf-8'))
ids = {x['logical_name']: x['asset_id'] for x in catalog['assets'] if 'logical_name' in x}
regions = {r['id']: r for r in json.loads((ROOT / 'assets/phase2-states/ui.json').read_text(encoding='utf-8'))['regions']}
FRAMES = [(24, 562, 156, 146, 'hud/frame-instrument'), (184, 562, 185, 146, 'hud/frame-instrument'), (373, 562, 160, 146, 'hud/frame-instrument'),
          (539, 562, 208, 146, 'hud/frame-instrument'), (752, 562, 238, 146, 'hud/frame-instrument'), (994, 562, 250, 146, 'hud/frame-instrument'),
          (548, 643, 190, 26, 'hud/frame-meter'), (1033, 585, 192, 26, 'hud/frame-meter'), (1044, 394, 200, 150, 'hud/frame-dial')]
ICONS = [(777, 680), (777, 636), (1017, 644)]  # 32x32, pivot near the centre (region pivots 63.5-64 of 128)

def edges():
    """Vertical lines (x, y0, y1) and horizontal lines (y, x0, x1) in stage units."""
    v, h = [], []
    for x, y, w, hh, key in FRAMES:
        r = regions[ids[key]]
        b = r['hud_interior_px']; s = .12 if r['width'] >= 256 else .5
        left, right, top, bottom = b[0] * s, (r['width'] - b[2]) * s, b[1] * s, (r['height'] - b[3]) * s
        for xx in (x, x + left, x + w - right, x + w):
            v.append((xx, y, y + hh))
        for yy in (y, y + bottom, y + hh - top, y + hh):
            h.append((yy, x, x + w))
    for cx, cy in ICONS:
        for xx in (cx - 16, cx + 16):
            v.append((xx, cy - 16, cy + 16))
        for yy in (cy - 16, cy + 16):
            h.append((yy, cx - 16, cx + 16))
    return v, h

V, H = edges()
S = 1.5

def at_edge(px, py):
    """Pixel (px, py), py counted from the bottom, touched by a baked edge within one pixel."""
    for x, y0, y1 in V:
        if abs(x * S - (px + .5)) <= 1.5 and y0 * S - 1 <= py + .5 <= y1 * S + 1:
            return True
    for y, x0, x1 in H:
        if abs(y * S - (py + .5)) <= 1.5 and x0 * S - 1 <= px + .5 <= x1 * S + 1:
            return True
    return False

def load(path):
    img = np.asarray(Image.open(path).convert('RGBA')).astype(np.int16)
    return img[::-1]  # rows bottom-up, as the device compared them

def compare(x, y):
    d = np.abs(x[..., :3] - y[..., :3]).max(axis=2)
    bins = {'1': int((d == 1).sum()), '2': int((d == 2).sum()), '3-4': int(((d >= 3) & (d <= 4)).sum()), '5-8': int(((d >= 5) & (d <= 8)).sum()),
            '9-16': int(((d >= 9) & (d <= 16)).sum()), '17-255': int((d >= 17).sum())}
    return d, {'differingRgb': int((d > 0).sum()), 'maxChannelDiffRgb': int(d.max()), 'bins': bins,
               'differingAlphaOnly': int(((d == 0) & (x[..., 3] != y[..., 3])).sum())}

runs = []
for run in a.run:
    lines = (run / 'diff-lines.txt').read_text(errors='replace').splitlines()
    caps = []
    for ln in lines:
        m = re.search(r'hudDiff tag=(\S+) phase=(\S+) w=(\d+) h=(\d+) blend=(\S+) funcs=(\S+) ms=(\S+) pairs=(\{.*\})$', ln)
        if not m:
            continue
        tag = m[1]
        cap = {'tag': tag, 'phase': m[2], 'size': [int(m[3]), int(m[4])], 'blendEnabled': m[5] == 'true', 'blendFuncs': m[6],
               'frameMs': round(float(m[7]), 1), 'logged': json.loads(m[8])}
        shots = {v: run / 'hud-diff' / f'{tag}-{v}.png' for v in ('base', 'fonts', 'layer', 'control')}
        imgs = {v: load(f) for v, f in shots.items() if f.exists()}
        cap['pngs'] = sorted(imgs)
        cap['fromPng'] = {}
        for x, y in (('base', 'fonts'), ('base', 'control'), ('fonts', 'layer')):
            if x in imgs and y in imgs:
                d, r = compare(imgs[x], imgs[y])
                cap['fromPng'][f'{x}/{y}'] = r
                if (x, y) == ('fonts', 'layer') and r['differingRgb']:
                    ys, xs = np.nonzero(d > 1)
                    seam = sum(1 for px, py in zip(xs.tolist(), ys.tolist()) if at_edge(px, py))
                    clusters = {}
                    for px, py in zip(xs.tolist(), ys.tolist()):
                        k = (int(px / S // 10 * 10), int(py / S // 10 * 10))
                        clusters[k] = clusters.get(k, 0) + 1
                    top = sorted(clusters.items(), key=lambda kv: -kv[1])[:12]
                    worst = sorted(zip(d[ys, xs].tolist(), xs.tolist(), ys.tolist()), reverse=True)[:8]
                    ys1, xs1 = np.nonzero(d == 1)
                    r['oneLevel'] = {'pixels': int(len(xs1)), 'withinOnePixelOfABakedEdge': sum(1 for px, py in zip(xs1.tolist(), ys1.tolist()) if at_edge(px, py))}
                    r['over1'] = {'pixels': int(len(xs)), 'withinOnePixelOfABakedEdge': seam,
                                  'clustersStage10': [{'stageX': k[0], 'stageY': k[1], 'pixels': n} for k, n in top],
                                  'worst': [{'diff': dd, 'px': [px, py], 'stage': [round(px / S, 2), round(py / S, 2)]} for dd, px, py in worst]}
        caps.append(cap)
    scenery = sorted({re.sub(r' arm=.*shapedSha256=', ' ', l.split('DeathRide: ')[1]).split(' unbanded')[0]
                      for l in lines if 'sceneryHash' in l})
    fonts = [l.split('DeathRide: ')[1] for l in lines if 'DeathRide: fonts page' in l][:1]
    runs.append({'run': run.name, 'fontsLine': fonts, 'captures': caps, 'sceneryHashes': scenery})

# Contrast: the share of the bake box (stage 24..1244 x 394..708, sampled every 3 px) that lies within a pixel of a baked edge.
box = [(px, py) for py in range(591, 1064, 3) for px in range(36, 1867, 3)]
edge_share = round(sum(1 for px, py in box if at_edge(px, py)) / len(box), 3)
out = {'what': 'P16 pixel proof: HUD variants drawn over one copy of the same world frame into the 2x MSAA back buffer and read back '
               '(RaceGame.hudDiffFrame); RGB decides, alpha is counted only (opaque window).',
       'edges': {'vertical': len(V), 'horizontal': len(H), 'scale': S, 'shareOfBakeBoxWithinOnePixel': edge_share}, 'runs': runs}
a.out.parent.mkdir(parents=True, exist_ok=True)
a.out.write_text(json.dumps(out, indent=1) + '\n')
for r in runs:
    for c in r['captures']:
        print(r['run'], c['tag'], {k: (v['differingRgb'], v['maxChannelDiffRgb'], (v.get('over1') or {}).get('pixels'),
                                       (v.get('over1') or {}).get('withinOnePixelOfABakedEdge')) for k, v in c['fromPng'].items()})
    print(r['run'], 'scenery', r['sceneryHashes'])
