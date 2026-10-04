"""HUD preparation and guarded driver adapter; never edits the art worktree directly."""
import argparse
import csv
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'tools/art'))
from common import ART, read_json, write_json, sha

def prepare():
    # The existing binding is stale only because the owner appended section D.
    binding=read_json(ART/'owner-choice-binding.json')
    source=(ART/'OWNER-CHOICE.md').read_bytes()
    marker=b'## D. Fusion review approved'
    prefix=source.split(marker)[0].rstrip(b'\r\n')
    candidates=[prefix+ending for ending in (b'\n',b'\n\n',b'\r\n',b'\r\n\r\n')]
    audit=ART/'audits/hud-owner-binding.json'
    if binding['owner_choice_sha256']!=sha(ART/'OWNER-CHOICE.md'):
        assert any(hashlib.sha256(p).hexdigest()==binding['owner_choice_sha256'] for p in candidates), 'Owner A-C changed; cannot rebind'
        assert b'Fusion report looks nice, I approve this direction of art' in source.split(marker)[1]
        assert binding['style_sha256']==sha(ART/'style-fusion.json')
        write_json(audit,{'prior_binding':binding,'current_owner_sha256':sha(ART/'OWNER-CHOICE.md'),'reason':'H0-H3 owner instruction explicitly invokes sections A-D; exact prior A-C bytes verified, only D appended. No reference approvals changed.'})
        binding={**binding,'owner_choice_sha256':sha(ART/'OWNER-CHOICE.md'),'owner_evidence':'OWNER-CHOICE.md A-D; HUD execution instruction authorizes Hot Ink HUD generation. Exact car approvals remain separate.'}
        write_json(ART/'owner-choice-binding.json',binding)
    base=next(csv.DictReader((ART/'briefs/v4-fusion-world.csv').open(encoding='utf-8')))
    items=[
        ('instrument','hud-frames','A wide low rectangular hollow instrument frame, 4:1 outer width to height, a thin battered bone steel border with two rust-orange corner plates. Huge completely empty magenta rectangular opening, straight horizontal and vertical inner edges. Flat front view UI frame. No symbols, ticks or text.'),
        ('meter','hud-frames','A wide horizontal hollow energy gauge frame, 6:1 outer width to height. Thin bone-metal rim, a single ochre end cap, very large completely empty magenta opening with straight rectangular inner edges. No filled bar, ticks, numbers or symbols. Flat front view UI frame.'),
        ('button','hud-frames','A square hollow button frame with clipped battered corners, bone metal with a rust-orange lower edge, large completely empty magenta rectangular opening and straight inner edges. Quiet border, no symbol, no text. Flat front view.'),
        ('dial','hud-frames','A square hollow instrument bezel with clipped corners, broad thin chipped bone metal rim, tiny hazard-yellow corner plates, very large empty magenta rectangular centre. No ticks, marks, symbols or text. Flat front view.'),
        ('steel-flick','hud-icons','One compact silver steel arrowhead with two short attached rear speed fins. A narrow quick evasive dash symbol, large clean negative gaps.'),
        ('flywheel','hud-icons','One chunky circular mechanical flywheel with three broad spokes and an attached curved forward arrow. Bone and ochre, large clean gaps.'),
        ('shoulder','hud-icons','One broad heavy plated wedge-shaped battering ram pointing right, reinforced by two shoulder braces. Bone leading edge, rust body.'),
        ('turbine','hud-icons','Two massive parallel air turbine housings with bold intake fan blades and short attached rear exhaust streaks. Rust and bone, a compact turbo icon.'),
        ('ground-bite','hud-icons','One chunky treaded tyre gripping three small attached angular earth teeth. Bone tread on soot, ochre earth. A traction symbol.'),
        ('punch-lance','hud-icons','One straight mechanical lance barrel pointing right, with a long narrow bone spear tip. Heavy rust-orange breech, a ranged piercing shot symbol.'),
        ('bone-rack','hud-icons','One compact central armoured plate with three large artificial ivory weapon spikes projecting left and three projecting right. Front and rear contact weapon symbol, no gore.'),
        ('scrambler','hud-icons','One squat interference transmitter puck with two attached zigzag antenna arms, rust-orange casing and bone circuitry shapes. No loose marks, no letters.'),
        ('arc-harpoon','hud-icons','One electric harpoon pointing right: large barbed bone spearhead, short rust rail and a visible coiled insulated tether. One pale zigzag arc contained inside the coil.'),
        ('plate-brace','hud-icons','One broad heavy defensive shield assembled from three overlapping bone armour plates, dark seams and rust rivets. Bold compact silhouette.'),
    ]
    rows=[]
    for name,family,action in items:
        row={**base,'id':'v4-hud-'+name+'-v1','class':('frame-' if family=='hud-frames' else '')+name,
             'prompt_action':action+' Single isolated subject centred within the middle 75 percent of the canvas. At least 12 percent empty magenta margin on every side. No surrounding scene. Clear silhouette at 96 pixels.',
             'size':'1024x1024','kind':'hud' if family=='hud-frames' else 'icon','batch':'hud-'+family,
             'background_key':'#FF00FF','cell_limit':'256' if family=='hud-frames' else '128','asset_family':family,
             'logical_name':'hud/'+('frame-' if family=='hud-frames' else 'ability-')+name}
        rows.append(row)
    path=ART/'briefs/hud.csv'
    with path.open('w',encoding='utf-8',newline='') as stream:
        writer=csv.DictWriter(stream,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    print('14 briefs; original style and approval gates retained; no paid calls')

def driver(arguments):
    import gen
    canonical=ROOT.parent.parent/'firetv-deathride-art/deathride/art'
    assert canonical.is_dir()
    original=gen.Budget
    # Share the actual account ledger and stop latch, not the merged 401-image snapshot.
    class SharedBudget(original):
        def __init__(self): super().__init__(canonical)
        def reserve(self,asset,attempt):
            with (canonical/'history.jsonl').open(encoding='utf-8') as stream:
                count=sum(json.loads(line).get('event')=='reserved' and json.loads(line).get('asset','').startswith('v4-hud-') for line in stream)
            if count>=78: raise RuntimeError('HUD_KIT_CAP')
            return super().reserve(asset,attempt)
    gen.Budget=SharedBudget
    if arguments[:1]==['--repair']:
        from common import briefs,style_for,file_lock,now
        rows=briefs(ART/'briefs/hud.csv');wanted=arguments[1:]
        with file_lock(ART/'.run.lock',timeout=1):
            for row in rows:
                if row['id'] not in wanted: continue
                group=[r for r in rows if r['batch']==row['batch']]
                assert gen.proof_valid(row['batch'],group,style_for(row))
                latest=read_json(gen.candidates(row)[-1])
                note='Direct HUD review: retain this mechanical symbol but make the complete subject SMALL, entirely within the central HALF of the canvas. Leave at least 25 percent empty magenta border on ALL sides; no projecting loose spatter. Source edge margin failed the unchanged 3 percent gate.'
                if 'bone-rack' in row['id']:note='Direct HUD review: spikes currently point only one way. Make THREE ivory spikes project LEFT and THREE project RIGHT from one central plate, clearly bilateral. Complete SMALL subject only within central half of canvas, 25 percent empty magenta on all sides.'
                if latest['attempt']>=2:note='Second source still fails measured edge margin. Recompose as a TINY complete mechanical icon occupying ONLY the central 30 percent of this square canvas. The other 70 percent is EMPTY MAGENTA. Subject centred at x=512 y=512, complete bounds x=350..674 and y=350..674. No loose marks outside that central small box. Preserve the requested identity; Bone Rack retains spikes on BOTH left and right.'
                rejection={'asset':row['id'],'image_sha256':latest['sha256'],'note':note,'at':now(),'attempt':latest['attempt']}
                write_json(ART/'rejections'/(row['id']+'.json'),rejection)
                SharedBudget().record({'event':'content-rejection',**rejection})
                gen.generate(row,style_for(row),SharedBudget(),refine=True)
                if SharedBudget().summary()['stop']:break
    else:
        sys.argv=['gen.py','--briefs',str(ART/'briefs/hud.csv'),*arguments]
        gen.main()
    write_json(ART/'reports/hud-spend.json',SharedBudget().summary())

if __name__=='__main__':
    if sys.argv[1:]==['prepare']: prepare()
    elif sys.argv[1:2]==['generate']: driver(sys.argv[2:])
    else: raise SystemExit('prepare | generate [guarded gen.py arguments]')
