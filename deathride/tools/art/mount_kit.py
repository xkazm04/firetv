"""Shared mount kit via agy (owner 2026-10-15: proofs approved, 'generate all the weapon types'). Envelope mount-pilot, 30 images in all.
Shared kit = Scatter, Hammer, Mine, Spikes, drawn against the Line car; Rivet stays per-class from the approved proofs."""
from __future__ import annotations
import argparse, csv, json, sys
from common import ART, ROOT, style_for
from agy_provider import AgyBudget, generate
import mount_pilot as MP

STYLE = ("Same hand, same worn paint, same palette and same top-down orthographic camera as the car shown in the STYLE REFERENCE image, "
         "and the weapon points to the right (+x) exactly as the car does. Draw ONLY the weapon, not the car. Exactly one object, centered, filling about "
         "the middle half of the canvas, at least 20 percent clear magenta margin on every side. No text, no numbers, no car body, no wheels, no driver, no ground, no cast shadow.")
KIT = {
 'scatter': "Scatter: one nose-mounted fan of three short flared barrels spreading slightly apart toward the right, on a heavy rectangular breech block. Silhouette first: a wedge that widens to the right.",
 'hammer': "Hammer: one roof-mounted heavy launcher, a single short fat tube with a wide muzzle brake at the right end and a boxy breech and orange warning band. Silhouette first: a thick horizontal cylinder with a flared mouth.",
 'mine': "Mine: one rear drop tray, a shallow square steel cradle holding one round armed proximity mine disc with a small red light, open toward the right. Silhouette first: a square tray with a round disc inside.",
 'armor1': "Armour plate, tier 1 (light): one long narrow flat side-armour plate, a single bent sheet of scrap steel with four crude bolts, thin and patched, a little rust. Silhouette first: a long thin rectangle about four times longer than wide, long axis horizontal.",
 'armor2': "Armour plate, tier 2 (reinforced): one long narrow flat side-armour plate of thick riveted steel in two overlapping layers with a yellow-black hazard stripe and a row of heavy rivets. Silhouette first: a long thin rectangle about four times longer than wide with a stepped edge, long axis horizontal.",
 'armor3': "Armour plate, tier 3 (heavy): one long narrow side-armour plate of massive layered welded steel with a row of short blunt spikes along its outer edge and scorched battle damage. Silhouette first: a long thick rectangle about four times longer than wide with a toothed edge, long axis horizontal.",
 'spikes': "Spikes: one bar of three bone-and-steel contact spikes of equal length on a thin mounting rail, spikes pointing to the right. Silhouette first: a comb with three parallel spikes.",
}
def ref():
    name, aid = 'Line', 'v2-part3-line-state-intact-v2'
    MP.CLASSES['line'] = (name, aid)
    return MP.reference_path('line')
def rows():
    r = ref(); out = []
    for k, text in KIT.items():
        out.append(dict(id=f'mount-{k}-line-v1', **{'class': k}, prompt_action=f"{text} Designed to bolt onto the Line car. {STYLE}", size='1024x1024', frame='single',
                        background_key='#FF00FF', count=1, status='ready', kind='sprite', reference='', batch='mount-kit', approval='pending', requires_approval='',
                        cell_limit=128, style_file='style-fusion.json', wave='M1', asset_family='props', surface_stack='', logical_name=f'mounts/{k}', region='',
                        style_references=json.dumps([r.relative_to(ROOT).as_posix()])))
    return out
KIT_BRIEFS = ART/'briefs/mount-kit.csv'
if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('cmd', choices=['briefs', 'run']); p.add_argument('ids', nargs='*'); a = p.parse_args()
    rs = rows()
    if a.cmd == 'briefs':
        with KIT_BRIEFS.open('w', encoding='utf-8', newline='') as f:
            w = csv.DictWriter(f, MP.FIELDS); w.writeheader(); w.writerows(rs)
        print(len(rs), 'briefs')
    else:
        b = AgyBudget(); by = {r['id']: r for r in rs}
        for r in rs:
            by[r['id'].replace('-v1', '-v2')] = dict(r, id=r['id'].replace('-v1', '-v2'), logical_name=r['logical_name'])
        for rid in a.ids or list(by):
            if MP.stage_spend() >= 12: print('KIT CAP'); sys.exit(2)
            res = generate(by[rid], style_for(by[rid]), b); print(rid, res['status'], res.get('error', ''), flush=True)
            if res['status'] != 'generated': sys.exit(1)
