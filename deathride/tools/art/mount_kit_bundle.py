"""Pack the owner-approved mount sprites (2026-10-15) into assets/mounts/kit.png + kit.json and name them in the mount catalog.
Inputs are the processed 128 px cells under art/processed; run from deathride/tools/art with the art venv."""
import csv, json
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]; ART = ROOT/'art'
CELLS = {'rivet-needle': 'mount-proof/mount-rivet-needle-v1', 'rivet-bastion': 'mount-proof/mount-rivet-bastion-v1', 'rivet-comet': 'mount-proof/mount-rivet-comet-v1',
         'scatter': 'mount-kit/mount-scatter-line-v1', 'hammer': 'mount-kit/mount-hammer-line-v2', 'mine': 'mount-kit/mount-mine-line-v1', 'spikes': 'mount-kit/mount-spikes-line-v1'}
RIVET = {'Needle': 'needle', 'Line': 'needle', 'Flint': 'needle', 'Quill': 'needle', 'Bastion': 'bastion', 'Trail': 'bastion', 'Vandal': 'bastion', 'Bulwark': 'bastion', 'Comet': 'comet', 'Kestrel': 'comet'}
CW, CH, COLS = 128, 112, 4
def main():
    names = list(CELLS); rows = (len(names)+COLS-1)//COLS
    page = Image.new('RGBA', (CW*COLS, CH*rows), (0, 0, 0, 0)); meta = {}
    for i, n in enumerate(names):
        im = Image.open(ART/'processed'/(CELLS[n]+'.png')).convert('RGBA'); im = im.crop(im.getbbox())
        assert im.width <= CW and im.height <= CH, (n, im.size)
        x, y = (i % COLS)*CW, (i//COLS)*CH; page.alpha_composite(im, (x, y)); meta[n] = dict(x=x, y=y, w=im.width, h=im.height)
    out = ROOT/'assets/mounts'; out.mkdir(exist_ok=True); page.save(out/'kit.png')
    (out/'kit.json').write_text(json.dumps(dict(owner_approved=True, approval="owner 2026-10-15: proofs approved; 'Scatter looks good'; kit approved by use (agy, mount-pilot envelope)", sprites=meta), indent=1)+'\n')
    p = ROOT/'game/src/main/resources/mounts/mount-attachments.csv'
    with p.open(newline='') as f: rd = list(csv.reader(f))
    h = rd[0]; ci, wi, mi, si = h.index('class'), h.index('weapon'), h.index('mode'), h.index('sprite')
    for r in rd[1:]:
        if r[mi] != 'mount': continue
        w = r[wi]; r[si] = f'rivet-{RIVET[r[ci]]}' if w == 'Rivet' else w.lower()
    p.write_text('\n'.join(','.join(r) for r in rd)+'\n')
    print(meta)
main()
