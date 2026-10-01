"""Record the executing agent's Oct 1 inspection; never grant owner approval."""
from common import ART,read_json,write_json,now

NOTES={
'grass':'Quiet ochre grass field, sparse fine blades, no central object.',
'dirt':'Muted earth grain; anonymous low-contrast field.',
'gravel':'Dense small dark pebbles; eight-pixel wrap repair removes the seam. Busier than dirt; use for distinct gravel patches.',
'asphalt-worn':'Quiet charcoal material with sparse ivory/rust wear; no bolted plate or painted border.',
'asphalt-heavy':'Dark aggregate field, finer and denser than worn asphalt.',
'concrete':'Bone-grey slab grain with fine scratches; no artificial perimeter.',
'metal':'Fixed centre crop removes the generated metal frame. Fine grey scratches remain; no rivets or border.',
'asphalt-clean':'Fixed centre crop removes dark perimeter; sparse aggregate remains.',
'ice':'Fixed centre crop removes framed perimeter; quiet pale granular surface.',
'oil':'Irregular dark/rust oil marks; no raised panel, text or machine object.',
'kerb':'Scattered worn red/bone paint on grey material; no continuous outlined stripe.',
'concrete-straight':'Chipped pale rectangular barrier top; dark wear at corners.',
'concrete-corner':'A single continuous L-shaped chipped slab; clear inner turn.',
'metal-straight':'Three parallel ochre/rust rails, open gaps remain transparent.',
'metal-corner':'Three rails turn through a right angle; open interior.',
'hazard-straight':'Broken ochre and soot diagonal hazard paint; physical rectangular top.',
'hazard-corner':'Corrected C shape is now a continuous L; two legs and an open inner corner.',
'tyres':'One stacked tyre crown; broad dark tread and open centre.',
'crate':'Top-down cross-braced timber crate; readable square silhouette.',
'cone':'Concentric cone crown on a square base; overhead shape.',
'sign':'Corrected single right arrow on rust sign; no generated writing.',
'drum':'Ochre circular lid with two bungs; neutral light.',
'tyres-scattered':'Three separate tread rings in triangular cluster; drag footprint supplied.',
'crate-metal':'Rust orange welded square crate with pale corner plates.',
'drum-red':'Corrected circular red lid with bone band and two bungs; no barrel side wall.',
'brush':'Low radial thorn and dry leaf cluster. Drag footprint deliberately separate from art alpha.',
'rock-field':'Corrected four angular overhead stones, shared low cluster; solid footprint supplied.',
'soft-dune':'Low crescent sand shape. Visible magenta fringe repainted from adjacent clean sand colours; original rejected. Drag footprint supplied.',
'dead-tree':'Corrected radial branch crown and central cut/bark core; height and renderer shadow supplied.',
'rock-spire':'Tapered angular overhead rock crown with pale caps. Visible magenta fringe repainted from adjacent rock; original rejected. Tall solid footprint supplied.',
'ammo':'Three pale cartridges on compact ochre box; readable pickup emblem.',
'repair':'Large pale spanner with small rust tool case; readable repair silhouette.',
'cash':'Bent pale stack with ochre band; no numerals or currency logo.',
'mine':'Dark circular mine crown, radial tabs and central generic warning symbol.',
'turbo':'Rust bottle with pale lightning mark; recognizable boost pickup.',
'skid':'Broken parallel rubber streaks with small warm paint fragments; no enclosing physical plate.',
'scorch':'Corrected white-key source yields dark central blast and pale scraped rays; no pink halo.',
'cracks':'Thin broken branching cracks on transparency; no concrete panel.',
'impact':'Radial pale/rust chips around dark hole; graphic impact decal.',
'gantry':'Simple pale beam and ochre end blocks; large readable track landmark.',
'split-marker':'Opposing pale chevrons on two rust panels with generic warning triangle.',
'stone-stack':'Angular grey overhead boulder pile, small ochre paint fragments.',
'sun-sign':'Ochre square sign with rust sun pictogram; no text.',
'sluice':'Three dark horizontal bars in rust square frame; open gaps.',
'snow-pole':'Narrow red/bone striped pole with ochre triangular flag.',
'muzzle':'All six complete flash shapes preserved and repositioned to regular cells with one shared scale. Actual exports have clear gutters and distinct ignition/peak/decay.',
'explosion':'Source six phases were two across by three down; complete shapes rearranged three across by two down. Actual exported phases retain ignition, burst, fireball and dissipating debris.',
'smoke':'Six complete smoke components regrouped into fixed cells. Pale billows and pointed drift fragments read clearly; strong stylization remains an owner taste question.',
'sparks':'Six hard-edged spark sprays; no residual smoke clouds. Whole components assigned to phase centres with one common scale; actual exports inspected.',
'fire':'Offline repaint of previously valid original overhead fire phases after three rejected generated attempts. Five fusion palette roles and sparse hatching; original alpha and pivots preserved. No fourth generation and no claim of a newly generated source.',
'frame-health':'Corrected empty health frame: pale chipped border with rust end cap; removed aircraft graphic. Transparent interior confirmed.',
'frame-turbo':'Corrected empty turbo frame: pale border with orange end cap; removed aircraft graphic. Transparent interior confirmed.',
'frame-panel':'Corrected empty square panel: soot frame, small ochre hazard marks; removed aircraft graphic. Transparent interior confirmed.',
'icon-armour':'Pale shield with ochre centre, small generic warning pictogram.',
'icon-engine':'Four rust pistons on pale block; distinct engine silhouette.',
'icon-handling':'Pale three-spoke steering wheel with dark hub.',
'icon-light-gun':'Twin narrow barrels on ochre mounting plate.',
'icon-heavy-gun':'Single wide dark barrel on chunky rust mounting plate.',
'icon-fuel':'Red fuel can with pale drop symbol, no lettering.',
'icon-scatter':'Short pale muzzle and several projectile dots; compact spread-weapon emblem.',
'icon-spikes':'Pale triangular spike on rust plate; bold directional silhouette.',
'icon-sabotage':'Open ammo crate with two curved pale arrows; readable swap/sabotage concept.',
'industrial':'Peripheral pipes and slabs frame a quiet dark centre; overhead, no horizon.',
'quarry':'Angular ochre/rust rocks around a quiet grey centre; overhead quarry bowl.',
'desert':'Corrected overhead ochre expanse with sparse peripheral rock/brush; central wrecks removed.',
'wetland':'Dark soil/water flow through ochre reeds and a peripheral grate; centre reasonably quiet.',
'alpine':'Pale peripheral boulders and small ochre roof, quiet dark centre; no horizon.'}

def main():
    path=ART/'audits/fusion-direct-review.json';audit=read_json(path)
    current=read_json(ART/'reports/v4-fusion-current-deterministic.json')
    derivatives=read_json(ART/'reports/v4-fusion-derivatives-deterministic.json')
    replacements={r['brief']['logical_name']:r for r in derivatives}
    for r in current+derivatives:
        logical=r['brief']['logical_name'];replacement=replacements.get(logical)
        superseded=replacement is not None and replacement['id']!=r['id']
        note=NOTES[r['class'] if r['class'] in NOTES else 'icon-'+r['class']]
        if superseded:note='Original retained for audit; use inspected derivative '+replacement['id']+'. '+note
        audit[r['id']]={'source_sha256':r['source_sha256'],'export_sha256':r['sha256'],'at':now(),
            'reviewer':'executing agent; not owner','note':note,'verdict':'reject' if superseded or r['codes'] else 'owner-review',
            'codes':['SUPERSEDED_SOURCE_REQUIRES_REPAIR'] if superseded else r['codes'],
            'basis':'direct inspection of exact exported family boards and effect frames; source/derivative provenance retained; diagnostic model disagreements do not grant owner taste approval'}
    write_json(path,audit)

if __name__=='__main__':main()
