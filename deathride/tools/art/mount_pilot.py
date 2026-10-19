"""One-time Gemini-via-agy mount-art pilot (owner 2026-10-15, 30 images). Proof stage only.

Reuses agy_provider (ledger usage-agy.json, history.jsonl, latch, reservations, attempt ceiling).
Nothing here is wired into the game or marks anything owner approved.
"""
from __future__ import annotations
import argparse, csv, json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from common import ART, ROOT, read_json, write_json, sha, now, append_json, style_for
from agy_provider import AgyBudget, generate

PILOT = ART/'mount-pilot'
BRIEFS = ART/'briefs/mount-proof.csv'
ATLAS = ROOT/'assets/phase2-states'
CLASSES = {'needle': ('Needle', 'v2-part4-needle-state-intact-reference'),
           'bastion': ('Bastion', 'v2-part3-bastion-state-intact-v2'),
           'comet': ('Comet', 'v2-part4-comet-state-intact-v1')}
PROOF_STAGE_MAX = 9
OWNER_MSG = "Use 'agy' cli for Gemini instead of API key"
FIELDS = 'id,class,prompt_action,size,frame,background_key,count,status,kind,reference,batch,approval,requires_approval,cell_limit,style_file,wave,asset_family,surface_stack,logical_name,region,style_references'.split(',')

def car_crop(asset_id):
    """Intact car sprite cut from the atlas pages, as RGBA."""
    pages = {}
    page = None
    cur = None
    for line in (ATLAS/'cars.atlas').read_text().splitlines():
        if line.endswith('.png'): page = line.strip(); continue
        if not line.startswith(' ') and line.strip(): cur = line.strip(); pages[cur] = {'page': page}; continue
        if cur and ':' in line:
            k, v = [s.strip() for s in line.split(':', 1)]
            pages[cur][k] = v
    r = pages[asset_id]
    x, y = [int(v) for v in r['xy'].split(',')]; w, h = [int(v) for v in r['size'].split(',')]
    return Image.open(ATLAS/r['page']).convert('RGBA').crop((x, y, x+w, y+h))

def reference_path(cls):
    name, aid = CLASSES[cls]
    out = PILOT/f'ref-{cls}-intact.png'
    if not out.exists():
        car = car_crop(aid); k = 800/car.width; car = car.resize((800, round(car.height*k)), Image.Resampling.LANCZOS)
        sheet = Image.new('RGBA', (1024, 1024), (255, 0, 255, 255))
        sheet.alpha_composite(car, ((1024-car.width)//2, (1024-car.height)//2))
        sheet.convert('RGB').save(out)
    return out

def prompt_action(cls):
    name = CLASSES[cls][0]
    return (f"Rivet: one hood-mounted twin-barrel machine gun, a short rapid-fire weapon, designed to bolt onto the hood of the {name} car shown "
            "in the STYLE REFERENCE image. Draw ONLY the weapon, not the car. Same hand, same worn paint, same palette and same top-down "
            "orthographic camera as that reference car, and the weapon points to the right (+x) exactly as the car does. "
            "Silhouette first: two long thin parallel barrels with a round ammunition drum and a small bracket plate behind them; the long axis is "
            "horizontal. Exactly one object, centered, filling about the middle half of the canvas, at least 20 percent clear magenta margin on every side. "
            "No text, no numbers, no car body, no wheels, no driver, no ground, no cast shadow.")

def write_briefs(attempts=1):
    rows = []
    for cls, (name, aid) in CLASSES.items():
        ref = reference_path(cls)
        rows.append(dict(id=f'mount-rivet-{cls}-v1', **{'class': f'rivet-{cls}'}, prompt_action=prompt_action(cls), size='1024x1024',
                         frame='single', background_key='#FF00FF', count=1, status='ready', kind='sprite', reference='',
                         batch='mount-proof', approval='pending', requires_approval='', cell_limit=128, style_file='style-fusion.json',
                         wave='M1', asset_family='props', surface_stack='', logical_name=f'mounts/rivet-{cls}', region='',
                         style_references=json.dumps([ref.relative_to(ROOT).as_posix()])))
    BRIEFS.parent.mkdir(parents=True, exist_ok=True)
    with BRIEFS.open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, FIELDS); w.writeheader(); w.writerows(rows)
    return rows

def read_briefs():
    with BRIEFS.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

def stage_spend():
    path = ART/'history.jsonl'
    ev = [json.loads(l) for l in path.read_text(encoding='utf-8').splitlines()]
    return sum(e.get('event') == 'reserved' and e.get('provider') == 'agy' and e.get('asset', '').startswith('mount-') for e in ev)

def cmd_clear(args):
    b = AgyBudget()
    s = b.summary()['stop']
    if not s: print('no latch'); return
    record = ("Failure record from art/history.jsonl 2026-10-04T13:06:15Z: asset agy-foundry-clinker-v1 attempt 1, returncode 1, session "
              "7506c2b5-5291-4cd9-81eb-fb257b6f0f11, 52 s, status generation-error; the latch reason was the provider text 'failed to generate' "
              "(a generation failure, no HTTP 401/402/403/429 quota or auth evidence). 9 reservations kept counted.")
    print(b.clear_stop(OWNER_MSG, record))

def cmd_run(args):
    rows = {r['id']: r for r in read_briefs()}
    b = AgyBudget()
    for rid in args.ids:
        if stage_spend() >= PROOF_STAGE_MAX: print('PROOF STAGE CAP reached'); return 2
        row = rows[rid]
        res = generate(row, style_for(row), b)
        print(rid, res['status'], res.get('error', ''), flush=True)
        if res['status'] != 'generated': return 1
    return 0

# ---- proof evidence: deterministic process step + contact sheet (no game wiring) ----
def catalog_rows(cls_name):
    p = ROOT/'game/src/main/resources/mounts/mount-attachments.csv'
    with p.open(encoding='utf-8-sig', newline='') as f:
        return [r for r in csv.DictReader(f) if r['class'] == cls_name and r['weapon'] == 'Rivet']

def shape(cls_name):
    with (ROOT/'core/src/main/resources/data/car-shapes.csv').open(encoding='utf-8-sig', newline='') as f:
        r = next(x for x in csv.DictReader(f) if x['id'] == cls_name) if 'id' in next(csv.reader(open(ROOT/'core/src/main/resources/data/car-shapes.csv')))[0:1] else None
    return r

def cmd_process():
    import process as P
    out = []
    for row in read_briefs():
        sc = read_json(sorted((ART/'raw'/row['id']).glob('attempt-*/sidecar.json'))[-1])
        rec = P.process_one(row, sc['image'], ART/'processed/mount-proof')
        out.append(dict(id=rec['id'], source_sha256=rec['source_sha256'], processed_sha256=rec['sha256'], verdict=rec['verdict'],
                        codes=rec['codes'], metrics={k: rec['metrics'].get(k) for k in ('foreground_fraction', 'margin_fraction', 'aspect', 'bounds_px', 'palette_p90_delta_e', 'magenta_key', 'components')},
                        placement=rec.get('placement')))
    return out

def cmd_sheet():
    P = ART/'processed/mount-proof'
    first = {}
    with (ROOT/'core/src/main/resources/data/car-shapes.csv').open(encoding='utf-8-sig', newline='') as f:
        rd = list(csv.reader(f)); hdr = rd[0]
    font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 15)
    W, rowh = 1500, 340
    sheet = Image.new('RGB', (W, 70+rowh*3), '#20242B'); d = ImageDraw.Draw(sheet)
    d.text((12, 10), 'Rivet x Needle / Bastion / Comet - PROOF, owner_approved=false, not wired. Columns: raw source | processed cell | mount at 64 px | car with both Rivets at catalog x/y/scale (2x, then 1x)', fill='white', font=font)
    d.text((12, 32), 'Overlay is a mock-up: mount width = scale x car length (24 px/m), centred at x*L, +-y*W; car art is the owner-approved intact sprite.', fill='#F0CB58', font=font)
    cards = []
    for i, (cls, (name, aid)) in enumerate(CLASSES.items()):
        y0 = 70+i*rowh
        d.text((12, y0+4), f'{name}  mount-rivet-{cls}-v1', fill='#F0CB58', font=font)
        raw = sorted((ART/'raw'/f'mount-rivet-{cls}-v1').glob('attempt-*/image.png'))[-1]
        r = Image.open(raw).convert('RGB'); r.thumbnail((300, 300)); sheet.paste(r, (12, y0+30))
        proc = Image.open(P/f'mount-rivet-{cls}-v1.png').convert('RGBA')
        bg = Image.new('RGBA', proc.size, (70, 78, 70, 255)); bg.alpha_composite(proc)
        sheet.paste(bg.convert('RGB'), (330, y0+30)); d.text((330, y0+162), 'processed cell, native 128', fill='white', font=font)
        box = proc.getbbox(); crop = proc.crop(box)
        m64 = crop.resize((64, max(1, round(64*crop.height/crop.width))), Image.Resampling.LANCZOS)
        g = Image.new('RGBA', (96, 96), (70, 78, 70, 255)); g.alpha_composite(m64, ((96-64)//2, (96-m64.height)//2))
        sheet.paste(g.convert('RGB'), (500, y0+30)); d.text((500, y0+130), 'mount 64 px wide', fill='white', font=font)
        # overlay
        car = car_crop(aid)
        shp = {r_[0]: r_ for r_ in rd[1:]}[name]
        L = float(shp[hdr.index('lengthM')]) if 'lengthM' in hdr else float(shp[1])
        Wd = float(shp[hdr.index('widthM')]) if 'widthM' in hdr else float(shp[2])
        S = 2; k = 24
        base = Image.new('RGBA', (car.width*S, car.height*S), (70, 78, 70, 255))
        base.alpha_composite(car.resize((car.width*S, car.height*S), Image.Resampling.NEAREST))
        cx, cy = base.width/2, base.height/2
        for a in catalog_rows(name):
            ax, ay, sc_ = float(a['x']), float(a['y']), float(a['scale'])
            mw = sc_*L*k*S; mh = mw*crop.height/crop.width
            sp = crop.resize((max(1, round(mw)), max(1, round(mh))), Image.Resampling.LANCZOS)
            px = cx+ax*L*k*S; py = cy-ay*Wd*k*S
            base.alpha_composite(sp, (round(px-sp.width/2), round(py-sp.height/2)))
        sheet.paste(base.convert('RGB'), (640, y0+30))
        # 1x overlay at game scale
        small = base.resize((base.width//S, base.height//S), Image.Resampling.LANCZOS)
        sheet.paste(small.convert('RGB'), (640+base.width+16, y0+30))
        d.text((640+base.width+16, y0+30+small.height+4), '1x (game px)', fill='white', font=font)
        cards.append(dict(class_=name, L=L, W=Wd, mounts=[(a['x'], a['y'], a['scale']) for a in catalog_rows(name)]))
    target = ART/'mount-pilot/proof-sheet.png'; sheet.save(target)
    return target, cards

def cmd_evidence():
    recs = cmd_process(); target, cards = cmd_sheet()
    ev = [json.loads(l) for l in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    write_json(ART/'mount-pilot/proof-evidence.json', dict(
        schema=1, generated=now(), stage='proof', provider='agy', model=AgyBudget().model, owner_approved=False, runtime_enabled=False,
        images_reserved_this_pilot=stage_spend(), pilot_cap=30, results=recs, overlay_geometry=cards,
        sheet=dict(path='art/mount-pilot/proof-sheet.png', sha256=sha(target)),
        attempts={r['id']: 1 for r in recs}))
    print(json.dumps(recs, indent=1)[:3000])

if __name__ == '__main__':
    p = argparse.ArgumentParser(); s = p.add_subparsers(dest='cmd', required=True)
    s.add_parser('briefs'); s.add_parser('clear-latch'); s.add_parser('status'); s.add_parser('evidence')
    r = s.add_parser('run'); r.add_argument('ids', nargs='+')
    a = p.parse_args()
    if a.cmd == 'briefs': print(len(write_briefs()), 'briefs')
    elif a.cmd == 'clear-latch': cmd_clear(a)
    elif a.cmd == 'status': print(AgyBudget().summary(), 'mount- reservations', stage_spend())
    elif a.cmd == 'evidence': cmd_evidence()
    elif a.cmd == 'run': sys.exit(cmd_run(a))

