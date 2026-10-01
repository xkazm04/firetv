"""Recorded executing-agent technical review; never owner acceptance or a model vote."""
from common import ART,read_json,write_json,sha,now
from grade import decide

NOTES={
 'concrete-straight':'Narrow complete overhead concrete top; no front-facing wall after correction. Suitable neutral source for deterministic barrier-case composition.',
 'concrete-corner':'Complete flat L footprint, square ends, grey concrete plane and sparse cracks. Dark perimeter is a contour; no cast ground shadow.',
 'metal-straight':'Complete flat steel strip with parallel ribs and small fasteners. Material roles and end geometry read at exported size.',
 'metal-corner':'Conditioned from the inspected concrete L geometry, with a cool-grey metal plane. No visible vertical wall in the final export; dark edge is the graphic contour. Final attempt retained for audit.',
 'hazard-straight':'Flat rectangular yellow/charcoal hazard strip with square ends and complete margin.',
 'hazard-corner':'Corrected flat L with continuous warning bands. The previous visible side face was rejected; final export has a single planar footprint.',
 'tyres':'Plain charcoal rubber top with an open centre and concentric tread rings. Stack height cannot be counted from overhead; accepted as a stack-top visual, with that model uncertainty retained.',
 'crate':'Closed ivory wooden crate top with X brace and grey corners, no text or baked shadow.',
 'cone':'Corrected solid orange central tip, continuous ivory ring and dark square base. Segmented lifebuoy-like proof was rejected. Small base pads are harmless hardware detail.',
 'sign':'Ivory right arrow on a blue plate with a short support. Explicitly a flat sign graphic, not a rotating world object.',
 'drum':'Circular olive lid with rims and two cap details, viewed overhead.',
 'tyres-scattered':'Corrected three plain rubber rings with empty centres; the wheel-rim version was rejected.',
 'crate-metal':'Blue steel box top with straps and grey corners; no stencil or words.',
 'drum-red':'Circular red lid, ivory band and cap details; complete isolated overhead form.',
 'ammo':'Final edit removes the unrequested hand emblem. Three ivory bullet tips remain above a blank olive lower lid, clearly reading as ammunition at pickup size.',
 'repair':'Large grey wrench over blue toolbox, readable as a fixed pickup/UI illustration.',
 'cash':'Blank ivory note stack and olive band, no currency mark or numbers.',
 'mine':'Round charcoal/grey disc with olive rim lugs and red centre; clear overhead mechanical silhouette.',
 'turbo':'Final edit removes the small mechanical emblem, retaining only the large ivory lightning bolt and orange pressure bottle.',
 'skid':'Corrected near-black/charcoal streaks and rubber flecks; purple accent version rejected.',
 'oil':'Irregular dark filled puddle with restrained blue-grey sheen and droplets; no container or scene.',
 'scorch':'Irregular radial charcoal burn mark, no flame or body. Hard cel edges remain a style choice for owner review.',
 'cracks':'Final isolated thin branching dark lines; the filled square asphalt patch and bright shard versions were rejected.',
 'impact':'Corrected irregular charcoal scuff with asymmetric scrape streaks and small pale chips. Qwen uncertainty is retained; it no longer has a mechanical hub or gear arms.',
 'muzzle':'Six actual exported flash/ember frames, fixed cell centre, no gun or vehicle. Phase expansion is visible; emission-point feel is for integrated review.',
 'explosion':'Six exported phases inspected directly: dot, starburst, medium orange cloud, larger orange cloud, dark puff, grey wisp. Qwen says subject=no while its description enumerates precisely these six requested phases; treated as a diagnostic false flag, not an automatic pass.',
 'smoke':'Six grey puff/wisp phases. Secondary pastel source panels were removed, then only new three-pixel key fringes were despilled. Exported-frame review confirms no panel backgrounds remain.',
 'sparks':'Six distinct small spark sprays with progressive reduction. Complete cells and no hardware; actual frame pixels reviewed on neutral backing.',
 'fire':'Six overhead radial orange/yellow flame patches. Upright flame-icon attempt rejected; secondary source panels removed. Exported frames preserve a shared centre.',
 'frame-health':'Complete grey/red HUD border with a measured transparent inner opening. Larger 256px export preserves a readable stretched border.',
 'frame-turbo':'Complete grey/orange HUD border and transparent inner opening; 256px export.',
 'frame-panel':'Complete chamfered equipment-panel border with empty transparent interior; no baked contents or labels.',
 'icon-armour':'Bold ivory shield and olive inner plate, no wordmark.',
 'icon-engine':'Grey engine block and four orange cylinders, distinct from the weapon silhouettes.',
 'icon-handling':'Three-spoke ivory steering wheel and dark hub, no lettering.',
 'icon-light-gun':'Two grey barrels on olive mounting; fixed HUD illustration. Not a rotating car or top-down world-weapon sprite.',
 'icon-heavy-gun':'Single thick grey cannon on orange mounting; fixed HUD illustration. Not a rotating world-weapon sprite.',
 'icon-fuel':'Red can, grey cap and one ivory drop. Complete icon, no text.',
 'rook':'Complete small fictional bust, yellow jacket and forehead goggles. Additional dark eyewear is a visible design variation, retained for owner review; no lettering.',
 'ox':'Complete fictional bust with silver hair, eyebrow mark and olive armor. The visible identity traits match; model uncertainty about the character description is retained rather than inferring gender from appearance.',
 'mica':'Complete fictional bust with dark coiled hair, blue headband/goggles and blue jacket; no words.',
 'vex':'Corrected complete fictional bust in plain orange jacket. Numbered-jacket source was rejected; final export has no digits.',
 'relay':'Complete fictional bust with asymmetric dark hair and red/ivory jacket, distinct silhouette and no text.',
 'marrow':'Complete fictional older circuit owner with silver swept hair, olive shoulders, charcoal coat and plain ivory scarf. The cropped proof was rejected; final full bust has clear margins. Identity comes from the separately hash-recorded C4 draft, pending committed reconciliation.',
 'industrial':'Quiet central ground and perimeter industrial structures, original wordless static backdrop. It is not approved as a rotating tile or game screenshot.',
 'quarry':'Quiet grey-brown centre, faceted quarry edges and sparse vegetation, no text or vehicle. Static backdrop only.',
 'desert':'Quiet ochre centre and rust-coloured perimeter rocks/scrub, no text or vehicle. Static backdrop only.',
 'wetland':'Muted wetland ground, channels and edge utility structures; quiet centre. Static backdrop only.',
 'alpine':'C2 frost theme: blue-grey centre, cool rock shelves, ivory snow and dark vegetation. Wordless static backdrop; no runtime geometry implied.',
 'gantry':'Corrected overhead dumbbell footprint: square olive end pads on the beam centreline, no feet hanging below as in the rejected front elevation. 512px export keeps the wide landmark readable.',
 'sluice':'Corrected complete gate plate and two rails with clear margin, no cropped ends; neutral top surfaces.',
 'snow-pole':'Orange/ivory post with blue flag and a small route-warning plate. Extra wordless mountain pictogram is accepted as a visual-only alpine warning variation; not a new gameplay rule.',
 'split-marker':'Two large diverging ivory arrows on blue bases; small wordless junction plates reinforce the split. Additional plates are a visual-only variation retained for owner review.',
 'stone-stack':'Compact faceted grey rock pile. Four stones are visible versus three in the descriptive prompt; this visual-only decoration has no per-stone collision contract. Variation is recorded, not hidden.',
 'sun-sign':'Ochre plate with one simple sun pictogram and short support; no lettering.',
 'scatter':'Blue-mounted wide barrel with three ivory projectiles spreading right. Fixed HUD illustration distinct from Rivet and Hammer.',
 'spikes':'Orange ram plate with grey spikes, clear contact-upgrade symbol; fixed HUD illustration.',
 'sabotage':'Olive ammunition box and two exchange arrows; fixed ammo-switch HUD symbol, no words or numbers.'}
MATERIALS={'asphalt':'Clean dark fine-grain asphalt, distinct from the two wear variants.','asphalt-worn':'Dark asphalt with restrained abrasion and small cracks.','asphalt-heavy':'Lighter heavily worn aggregate; narrow-band seam repair preserves the interior.','gravel':'Unique 512px source quadrant recovered from a repeated preview, with all fixed crop trials retained. No additional generation call.','ice':'Centred 768px crop of the fine-frost source removes broad edge lighting; all three fixed crop trials retained. Direct 2x2 review shows no bright cross or long crack motif.','oil':'Uniform subtle dark oily sheen without a focal puddle motif.','kerb':'Red/ivory kerb bands; intentional band repetition, with both edge gates still enforced.','grass':'Fine stochastic olive grass blades.','dirt':'Warm compacted dirt and fine grit.','concrete':'Pale porous concrete; narrow-band seam repair preserves the interior.','metal':'Cool matte steel grain with no repetitive rivet grid.'}

def build():
    items=read_json(ART/'reports/p4-world-candidates-deterministic.json');models=[]
    for model in ('mimo-9b','qwen3.8'):models.append({g['asset']:g for g in read_json(ART/'reports'/('p4-world-final-'+model+'.json'))})
    export_models=[]
    for model in ('mimo-9b','qwen3.8'):export_models.append({g['asset']:g for g in read_json(ART/'reports'/('p4-export-review-'+model+'.json'))})
    export_items={r['export_parent_id']:r for r in read_json(ART/'reports/p4-export-review-deterministic.json')}
    selections=[]
    for item in items:
        if item['id'] in ('p1-tile-ice-v2','p1-tile-ice-v3'):
            selections.append({'id':item['id'],'status':'rejected-visual','review_note':'v2 whole export has a broad bright repeat cross despite numeric pass; v3 adds long forbidden cracks. Select only the independently measured and reviewed centre-crop derivative.'});continue
        if item['id'] in ('p4-tiles-asphalt-heavy-v1','p4-tiles-concrete-v1'):
            selections.append({'id':item['id'],'status':'superseded-by-measured-wrap','review_note':'Original edge-peak failure remains rejected; select the separately measured wrap-v1 derivative.'});continue
        if item.get('codes'):raise ValueError('unresolved pixel failure: '+item['id']+' '+str(item['codes']))
        grades=[m.get(item['id'],{}) for m in models]
        if any(g.get('status')!='graded' or g.get('image_hashes',[None])[0]!=item['source_sha256'] for g in grades):raise ValueError('both current source observations required: '+item['id'])
        _,codes=decide(grades,item['kind'],read_json(ART/'gates.json')['vlm_confidence_min'])
        if item['kind']=='tile':group='tile';logical='tiles/'+('asphalt-clean' if item['class']=='asphalt' else item['class']);note=MATERIALS[item['class']]+' Reviewed the actual exported repeat. Final seam and repetition gates pass.'
        else:
            batch=item['brief']['batch'];group='theme' if item['kind']=='backdrop' else 'ui' if batch in ('p4-hud','p4-portraits','p4-c4-preview','p4-combat-icons','p4-pickups') else 'world'
            logical=('portraits' if item['kind']=='portrait' else batch.removeprefix('p4-'))+'/'+item['class'];note=NOTES[item['class']]
        selection={'id':item['id'],'logical_name':logical,'group':group,'status':'technical-accepted','owner_approved':False,'reviewer':'executing-agent; direct review of raw/processed contact sheets and targeted full-size images','review_note':note,'processed_sha256':item['sha256'],'source_sha256':item['source_sha256'],'reviewed_machine_codes':codes,'owner_review_reasons':sorted(set(codes+['HUMAN_CALIBRATION_PENDING','OWNER_QUALITY_PENDING'])),'model_observations':[{'model':g['model'],'status':g['status'],'image_sha256':g['image_hashes'][0],'input_hash':g['input_hash'],'answers':g['answers']} for g in grades]}
        if item.get('frames'):
            preview=export_items[item['id']];eg=[m[item['id']+'-export'] for m in export_models]
            if preview['export_frame_hashes']!=[f['sha256'] for f in item['frames']] or any(g['image_hashes'][0]!=preview['source_sha256'] for g in eg):raise ValueError('stale exported-frame review')
            selection['export_frame_hashes']=preview['export_frame_hashes'];selection['export_preview_sha256']=preview['source_sha256'];selection['export_model_observations']=[{'model':g['model'],'status':g['status'],'image_sha256':g['image_hashes'][0],'answers':g['answers']} for g in eg]
        selections.append(selection)
    write_json(ART/'selections.json',{'schema':1,'at':now(),'authority':'Executing-agent technical selection only. No model vote, human calibration or owner quality approval is implied. Car references/states are excluded pending their explicit owner gate.','assets':selections})
    print('Technical selections:',sum(s['status']=='technical-accepted' for s in selections))

if __name__=='__main__':build()
