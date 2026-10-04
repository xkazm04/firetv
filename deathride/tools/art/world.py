"""Versioned P4 world inventory and Content provenance; generation is separate."""
import csv,io,subprocess
from common import ART,ROOT,read_json,write_json,now,sha,briefs
from family import write_csv

TILES={
 'asphalt-worn':'Dark charcoal asphalt with slightly lighter fine aggregate and small scattered abrasion scuffs, medium wear, no large cracks.',
 'asphalt-heavy':'Worn grey asphalt with dense fine pitting and very short randomly distributed hairline cracks, high wear but no long continuous cracks or patches.',
 'grass':'Muted olive short grass seen directly from above, fine individual blades of varied directions, even tiny-scale stochastic distribution.',
 'dirt':'Warm brown packed dirt with fine ochre and grey particles, evenly scattered tiny grit, no wheel tracks or footprints.',
 'concrete':'Cool light-grey concrete, fine random pores and tiny chips, no slab seams or large cracks.',
 'metal':'Cool grey matte industrial steel surface with sparse irregular fine scratches and subtle grain, no rivet grid, checker pattern or large panels.'}
BARRIERS={
 'concrete-straight':'One straight horizontal concrete safety wall module, rectangular grey top plane with tiny worn chips; same width throughout, squared flush ends.',
 'concrete-corner':'One L-shaped concrete safety wall corner, two equal arms of the same width, a clean square ninety-degree bend, squared flush ends.',
 'metal-straight':'One straight horizontal steel guardrail module, a flat grey rectangular top with two thin lengthwise ribs and tiny bolt heads, squared flush ends.',
 'metal-corner':'One L-shaped steel guardrail corner, two equal arms of the same width, a clean square ninety-degree bend with two thin ribs, squared flush ends.',
 'hazard-straight':'One horizontal rectangular crash barrier top, alternating muted yellow and charcoal diagonal hazard bands, straight square ends, subtle edge chips.',
 'hazard-corner':'One L-shaped crash barrier top, equal-width arms and clean square bend, alternating muted yellow and charcoal diagonal hazard bands, square ends.'}
PROPS={
 'tyres':'One compact stack of three charcoal racing tyres. True overhead plan view: circular opening in the centre and nested circular top rings, no visible vertical stack walls.',
 'crate':'One closed square shipping crate top, weathered ivory wooden slats and dark metal corner brackets in a clear X-brace arrangement, no stencil or symbols.',
 'cone':'One orange traffic cone seen directly from above: small round orange tip at the centre of an orange and ivory ring, on a square charcoal base, no side profile.',
 'sign':'One flat rectangular roadside sign board, face visible as a readable icon: a simple bold right arrow in warm ivory on muted blue, no letters or numerals, short grey support extending down.',
 'drum':'One sealed oil drum seen directly from above: round olive lid with concentric rim and two small circular caps, no side wall or label.',
 'tyres-scattered':'A compact triangular arrangement of three separate charcoal tyres seen directly overhead, all complete circular rings with dark centres, no shadow.',
 'crate-metal':'One closed square blue steel storage box top, two grey straps across the lid and small metal corner pads, no markings.',
 'drum-red':'One sealed red metal drum seen directly overhead, circular red lid with an ivory band across it and two small caps, no label.'}
PICKUPS={
 'ammo':'A single compact olive ammunition box with three large ivory bullet silhouettes embossed on its top, bold readable pickup icon, no words.',
 'repair':'A single chunky cool-grey open-ended wrench crossed over a small blue toolbox, bold readable repair pickup icon, no letters.',
 'cash':'A compact stack of three warm ivory rectangular currency notes held by an olive paper band, abstract blank notes with no monetary symbol, letters or numerals.',
 'mine':'One round charcoal mechanical disc mine viewed directly overhead, six chunky olive rim lugs and a small red centre cap, no lettering.',
 'turbo':'One compact orange pressure bottle with a cool grey valve at top and a bold warm ivory lightning bolt on the bottle, readable turbo pickup icon.'}
DECALS={
 'skid':'Two short parallel charcoal tyre skid streaks with uneven broken ends and sparse rubber flecks. Flat overhead ground decal only.',
 'oil':'One irregular charcoal oil puddle with sparse muted blue-grey sheen, a flat asymmetrical filled shape with several tiny detached droplets. No outlined container.',
 'scorch':'One irregular radial charcoal burn mark, dark centre fading through uneven sparse flecks. Flat overhead ground decal only, no flames.',
 'cracks':'One small localized cluster of three thin branching near-black cracks with sparse grey edge chips, asymmetrical, flat overhead ground decal only.',
 'impact':'One blood-free metal impact mark: a small dark centre with five short grey radial scrapes and tiny ivory chips, flat overhead decal, no body or gore.'}
EFFECTS={
 'muzzle':('A short rightward muzzle flash, from tiny ivory ignition to orange pointed burst, widest three-pronged flare, shorter yellow flare, two small sparks, then a tiny orange ember. No gun.',[35,45,45,40,40,45]),
 'explosion':('An overhead explosion, from compact ivory ignition to small orange starburst, large yellow-orange radial blast, widest orange fireball, dark orange and grey breaking cloud, then a small dissipating charcoal puff. No debris objects.',[45,55,65,75,90,110]),
 'smoke':('A dissipating grey smoke puff viewed from above, from compact dark puff to growing three-lobed cloud, broad grey billow, widest thin grey cloud, sparse broken wisps, then two tiny faint grey wisps. No fire.',[90,100,120,140,160,180]),
 'sparks':('A rightward impact spark spray, from tiny ivory point to three short yellow streaks, six longer orange streaks, widest sparse sparks, three tiny red-orange sparks, then one tiny orange spark. No metal object.',[35,40,45,55,65,80]),
 'fire':('An overhead looping small fire, six visibly different radial flame shapes: compact three-lobed orange flame, taller yellow tongue, broad split orange flare, compact leftward curl, broad rightward curl, then a compact shape similar to the first. No logs or smoke.',[80,80,80,80,80,80])}
HUD={
 'frame-health':'One empty wide horizontal HUD health-bar frame, cool grey chamfered metal border with charcoal inner rim and a small red end-cap, completely empty magenta centre opening, no fill, letters or ticks.',
 'frame-turbo':'One empty wide horizontal HUD boost-bar frame, cool grey chamfered metal border with charcoal inner rim and an orange end-cap, completely empty magenta centre opening, no fill, letters or ticks.',
 'frame-panel':'One empty broad rectangular HUD equipment panel, cool grey clipped-corner metal border with a charcoal inner rim, completely empty magenta centre opening, no contents, letters or ticks.',
 'icon-armour':'One bold simple ivory shield icon with a cool-grey border and an olive central plate, no lettering.',
 'icon-engine':'One bold simplified engine block icon, cool-grey mechanical block with four orange cylinders and a dark base, no lettering.',
 'icon-handling':'One bold warm ivory steering wheel icon with three spokes and a charcoal central hub, no lettering.',
 'icon-light-gun':'One bold simplified twin light-gun icon, two short grey parallel barrels pointing RIGHT on an olive mount, no bullets or lettering.',
 'icon-heavy-gun':'One bold simplified heavy cannon icon, one thick long grey barrel pointing RIGHT on an orange mount, no bullets or lettering.',
 'icon-fuel':'One compact red fuel can icon with a grey cap, simple ivory droplet on its face, no letters or numerals.'}
PORTRAITS={
 'rook':'Fictional adult male racer with medium-brown skin, close-cropped black hair, amber goggles resting on his forehead and a yellow racing jacket. Watchful expression, lean face.',
 'ox':'Fictional adult female racer with light skin, broad face, short silver hair, a dark eyebrow scar and an olive armored racing vest. Calm determined expression.',
 'mica':'Fictional adult female racer with dark skin, short coiled black hair with a blue cloth headband and a blue racing jacket. Patient focused expression.',
 'vex':'Fictional adult male racer with light-brown skin, swept-back dark hair, small moustache and an orange racing suit. Confident narrow-eyed expression.',
 'relay':'Fictional adult androgynous racer with fair skin, a short asymmetrical dark haircut and a red and ivory racing jacket. Thoughtful expression.',
 'marrow':'Fictional older adult circuit owner with medium olive skin, neatly swept-back silver hair, a broad angular face and a stern reserved expression. A charcoal high-collared coat with restrained olive armored shoulders and a plain warm-ivory scarf; no jewellery or insignia.'}
THEMES={
 'industrial':'An original abandoned industrial yard seen directly overhead: dark concrete open centre, steel gantry feet and pipes near the outer edges, muted olive storage roofs, sparse orange safety accents.',
 'quarry':'An original stone quarry seen directly overhead: quiet grey-brown gravel open centre, terraced angular rock shelves and a few small slate piles near the outer edges, sparse olive scrub.',
 'desert':'An original dry desert proving ground seen directly overhead: warm ochre sand open centre, angular rust-coloured rocks and a few scrub patches near the outer edges, muted orange accents.',
 'wetland':'An original wetland industrial fringe seen directly overhead: dark grey-green packed-earth open centre, irregular blue-grey shallow-water channels and olive reeds near the outer edges.',
 'alpine':'An original high mountain proving ground seen directly overhead: quiet blue-grey frosted gravel open centre, angular cool-grey rock shelves, small warm-ivory snow patches and sparse dark olive dwarf conifers near the outer edges. Roof-only plan view of any utility structure; completely flat even light without cast shadows.'}
LANDMARKS={
 'gantry':'One track gantry seen directly from above: a single long thin horizontal cool-grey steel crossbeam connecting two square olive end supports, small orange/ivory warning bands at both ends. Only top planes visible. No hanging sign, lettering, front wall or shadow.',
 'split-marker':'One simple flat route-split marker: two bold warm-ivory chevrons diverging left and right from a short central charcoal stem, on two small blue plates. A readable flat overhead warning symbol, no words or numerals.',
 'stone-stack':'A small compact pile of three angular slate-grey rocks of different sizes, seen directly from above. Faceted flat top planes, bold dark contours, neutral symmetric material shading, no cast shadow.',
 'sun-sign':'One flat square ochre route-warning plate bearing a simple warm-ivory sun pictogram, eight short rays around a solid orange disc. No letters, numbers or brand. Front-facing flat sign icon, short cool-grey support at bottom.',
 'sluice':'One compact water-control gate seen directly from above: a rectangular blue-grey steel gate plate between two parallel grey rails, dark blue water visible in a narrow central slot. Only horizontal top surfaces, no vertical walls, no scene.',
 'snow-pole':'One compact alpine route marker icon: a narrow vertical orange and warm-ivory banded post with a small flat triangular blue flag at its top, short charcoal foot. Front-facing flat warning pictogram, no depth, no lettering or shadow.'}
COMBAT_ICONS={
 'scatter':'One bold flat spread-shot weapon icon: a short wide cool-grey barrel pointing RIGHT on a compact blue mount, with exactly three small ivory pellet dots spreading toward the right. Simple readable side silhouette, no perspective, no letters or numerals.',
 'spikes':'One bold flat contact-spike upgrade icon: a short orange armored ram plate carrying four large cool-grey triangular spikes pointing RIGHT, dark chunky outlines, simple readable silhouette, no vehicle or lettering.',
 'sabotage':'One bold flat ammo-switch icon: a compact olive ammunition box with three simple ivory bullet silhouettes, surrounded by exactly two curved warm-ivory exchange arrows, one clockwise above and one returning below. No letters, numbers, hands or extra badges.'}

def prepare():
    commit=subprocess.check_output(['git','rev-parse','deathride/content'],text=True).strip();sources={};tables={}
    for name in ('rivals','tracks','track-themes','weapons','consumables'):
        path='deathride/core/src/main/resources/data/'+name+'.csv';data=subprocess.check_output(['git','show',commit+':'+path]);target=ART/'contracts'/('p4-'+name+'.csv');target.write_bytes(data)
        tables[name]=list(csv.DictReader(io.StringIO(data.decode())));sources[name]={'path':path,'sha256':sha(target)}
    write_json(ART/'contracts/p4-content-source.json',{'commit':commit,'captured_at':now(),'sources':sources,'scope':'Committed Content handoff; future C2/C4 additions must be reconciled at integration.','rival_count':len(tables['rivals']),'track_count':len(tables['tracks']),'themes':list(dict.fromkeys(r['theme'] for r in tables['tracks']))})
    rows=[]
    def add(batch,name,action,kind='sprite',key='#FF00FF',frame='single',cell=128):
        rows.append({'id':'p4-'+batch+'-'+name+'-v1','class':name,'prompt_action':action,'size':'1024x1024','frame':frame,'background_key':key,'count':'1','status':'ready','kind':kind,'reference':'','batch':'p4-'+batch,'approval':'pending','cell_limit':str(cell)})
    for name,action in TILES.items():
        add('tiles',name,'The entire image is ONLY an EMPTY anonymous ground-material swatch. '+action+' Seamless edge-to-edge material with even illumination. Show one unrepeated stochastic field, no repeated quadrants or mirrored halves. Very low-contrast small-scale details; no large motifs. No car, vehicle, wheel, object, scene, border, grid, lettering or road markings.',kind='tile',key='none',cell=256)
    for batch,items in [('barriers',BARRIERS),('props',PROPS),('pickups',PICKUPS),('decals',DECALS)]:
        for name,action in items.items():
            add(batch,name,action+' One isolated asset only, centred with at least twelve percent clear margin. Crisp bold shapes readable at 96 pixels. Strict flat orthographic plan view, neutral light, no cast shadow, no vehicle, no scene.')
    for name,(action,durations) in EFFECTS.items():
        add('effects',name,'Exactly SIX separate animation frames arranged in a regular THREE-column TWO-row layout. Equal square cells, each with generous clear margin; NO visible grid or separators. Sequence reads left to right across the top row, then left to right across the bottom row. '+action+' Each comma-separated phase is one successive frame, with visible progression. Keep every effect at the exact centre of its own cell, same fixed camera and scale. All six frames contain visible effect pixels. Nothing crosses between cells. No letters, numbers, labels, weapons or people.',kind='sheet',frame='3x2:6')
    for name,action in HUD.items():add('hud',name,action+' One isolated front-facing flat graphic only, centred with generous margin, bold enough to read at 64 pixels, no scene, no vehicle.')
    for name,action in COMBAT_ICONS.items():add('combat-icons',name,action+' One isolated icon centred with generous pure magenta margin. Flat graphic material shading only, no scene or cast shadow.')
    combat_aliases={'weapons':{'Rivet':'p4-hud-icon-light-gun-v1','Hammer':'p4-hud-icon-heavy-gun-v1','Mine':'p4-pickups-mine-v1','Scatter':'p4-combat-icons-scatter-v1'},'consumables':{'spikes':'p4-combat-icons-spikes-v1','turbo':'p4-pickups-turbo-v2','fuel':'p4-hud-icon-fuel-v1','sabotage':'p4-combat-icons-sabotage-v1'}}
    if {r['id'] for r in tables['weapons']}!=set(combat_aliases['weapons']) or {r['id'] for r in tables['consumables']}!=set(combat_aliases['consumables']):raise ValueError('new combat content requires reviewed icon mapping')
    write_json(ART/'contracts/p4-combat-aliases.json',combat_aliases)
    for row in tables['rivals']:
        if row['id'] not in PORTRAITS:raise ValueError('new rival requires versioned portrait brief: '+row['id'])
        add('portraits',row['id'],PORTRAITS[row['id']]+' One bust portrait, head and shoulders completely within the central three quarters of the square. Front-facing flat character illustration, symmetric neutral light, no weapon, no car, no words, no badge or logo. Original fictional identity, no resemblance to a real person.',kind='portrait',cell=256)
    for theme in dict.fromkeys(r['theme'] for r in tables['tracks']):
        if theme not in THEMES:raise ValueError('new theme requires versioned backdrop brief: '+theme)
        add('backdrops',theme,THEMES[theme]+' Full-bleed square background illustration. Centre sixty percent is quiet low-contrast material suitable behind a menu; small detailed scenery only near the perimeter. Flat neutral overhead light, no horizon, no sky, no racing route, no cars, no people, no signs or text.',kind='backdrop',key='none',cell=1024)
    required=set()
    for theme in tables['track-themes']:required.update(theme['propSet'].split(';'))
    aliases={'tyre-stack':'p4-props-tyres-v1','oil-drum':'p4-props-drum-v1'}
    for name in sorted(required-set(aliases)):
        if name not in LANDMARKS:raise ValueError('new landmark requires brief: '+name)
        add('landmarks',name,LANDMARKS[name]+' One isolated asset only, complete silhouette centred with at least twelve percent clear pure magenta margin. Bold simple shapes readable at 96 pixels. No car, people, decorative background or additional symbols.')
        aliases[name]='p4-landmarks-'+name+'-v1'
    write_json(ART/'contracts/p4-landmark-aliases.json',aliases)
    if (ART/'brief-amendments.json').exists():
        changes=read_json(ART/'brief-amendments.json')['rows'];rows=[changes.get(r['id'],r) for r in rows]
    write_csv(ART/'briefs/p4-world.csv',rows)
    write_json(ART/'animation.json',{'schema':1,'effects':{name:{'columns':3,'rows':2,'frames':6,'durations_ms':v[1],'loop':name=='fire','pivot':'fixed cell centre','frame_cell_px':128} for name,v in EFFECTS.items()}})
    write_json(ART/'world-inventory.json',{'generated_briefs':len(rows),'batches':{batch:sum(r['batch']==batch for r in rows) for batch in dict.fromkeys(r['batch'] for r in rows)},'carry_forward':{'ice':'p1-tile-ice-v2','oil':'p1-tile-oil-v3','kerb':'p1-tile-kerb-v2'},'correction':'p1-tile-asphalt-v1 attempt 3','blocked':{'gravel':'three paid attempts exhausted; best candidate rejected'},'autotile_families':{'track-edge':47,'barrier':47}})

if __name__=='__main__':prepare()
