"""Campaign rework 2: immutable briefs, game-derived environment catalog and spend envelope."""
import csv
from common import ART, ROOT, now, read_json, write_json, briefs, sha
from family import write_csv
from gen import Budget

# Decoration has no collision. Obstacle visuals below inherit core's exact footprint/effect.
PROPS = {
 'scrap-pile': ('industrial', 'Collapsed stack of salvaged corrugated panels, axle housings and bent wheel rims from a burnt-out motor yard. Jagged welded scrap, recognisable machine parts, no generic storage box.'),
 'tyre-wall': ('industrial', 'One low continuous safety wall of overlapping worn truck tyres lashed with rust wire, a patched league speedway barrier with exposed rubber holes.'),
 'oil-drums': ('industrial', 'Three battered steel oil drums strapped in a bent spill tray; flaking dried-red paint, open bung holes, oily soot around seams, abandoned foundry service equipment.'),
 'rust-pylon': ('industrial', 'A rusted lattice power pylon crown and cross braces, buckled at its base, thick angular steel ribs, top-down silhouette, no wires leaving the asset.'),
 'league-gantry': ('industrial', 'A welded league starting gantry made from reused rail beams, unequal bolted uprights and a battered blank rectangular top board, structural top view, no lettering.'),
 'derelict-crane': ('quarry', 'An abandoned short-boom quarry crawler crane, seized skeletal rust boom folded beside its empty operator housing and two worn tracks; no operator, a single connected salvage machine.'),
 'wreck-car': ('quarry', 'A stripped derelict compact car shell, empty roof opening, missing hood, two absent wheels and bent axle, rust and soot burn damage; inert salvage, no driver or weapons.'),
 'quarry-face': ('quarry', 'A compact terraced quarry rock outcrop seen from directly above, angular slate-brown ledges with exposed pale cut stone, sparse drill scars and broken scree at the foot; no building or soil rectangle.'),
 'slag-heap': ('quarry', 'A low irregular mound of cold black foundry slag, chunky vitrified rust-brown clinker with sparse bleached cracked facets; industrial waste, no glowing lava, no decorative crystals.'),
 'salt-crust': ('desert', 'A low broken crust of dirty pale salt, irregular flaked perimeter and sparse ochre fissures, flat local patch over loose gritty salt; no repeated tile, horizon, dunes or vegetation.'),
 'dead-brush': ('desert', 'One low oval clump of salt-killed thorn brush, brittle ochre twigs around a soot root core with open branch gaps, no lush leaves or ground slab.'),
 'soft-dune': ('desert', 'One low crescent of loose salt-flat grit and ochre sand, wind-scuffed grains and broken soft feathered edge; a shallow slowing patch, no ink outline or tall desert mountain.'),
 'league-hoarding': ('desert', 'One battered blank bone-painted rectangular league billboard on two reused rust beams with visibly empty face reserved for game-authored slogans; overhead sign laid at a shallow horizontal tilt, no generated writing.'),
 'smelter-stacks': ('wetland', 'A connected cluster of three cold abandoned smelter exhaust stacks on a rust maintenance platform, open dark circular mouths, soot rings, broken catwalk braces; no smoke plume.'),
 'sluice-gate': ('wetland', 'A derelict flood sluice headgate salvaged into a drainage-yard barrier, rust rack teeth, corroded wheel and broken steel grating; no water rectangle or flowing stream baked into the sprite.'),
 'dead-tree': ('wetland', 'A salt-and-soot killed tree crown directly overhead, central splintered trunk and three thick bare branch forks, uneven bone-brown ends with open gaps; no living foliage or landscape.'),
 'guard-rail': ('alpine', 'One bent corrugated steel mountain-road guard rail section and three rust bolted posts, silver bare scrape along the middle, torn ochre hazard tabs; heavy road engineering, no fence or ink road boundary.'),
 'rock-fall': ('alpine', 'One compact irregular group of four angular mountain boulders and smaller broken scree chips, distinct flat rust-grey top facets and narrow dark crevices; no giant crystal or decorative ground.'),
 'rock-spire': ('alpine', 'One compact narrow angular mountain rock pinnacle crown directly overhead, jagged weathered brown rock with three pale chipped tips; geological stone, no building, crystal or side elevation.'),
 'tyres-scattered': ('alpine', 'A low compact oval pile of three torn worn tyres and rubber strips dragged from a mountain crash, collapsed rubber rather than a wall; transparent gaps, no vehicle or ground patch.'),
}
SETS = {
 'industrial': ['scrap-pile','tyre-wall','oil-drums','rust-pylon','league-gantry','smelter-stacks','league-hoarding','wreck-car'],
 'quarry': ['quarry-face','derelict-crane','slag-heap','wreck-car','oil-drums','rust-pylon'],
 'desert': ['salt-crust','dead-brush','soft-dune','league-hoarding','wreck-car','rust-pylon'],
 'wetland': ['sluice-gate','dead-tree','smelter-stacks','scrap-pile','oil-drums','tyre-wall'],
 'alpine': ['guard-rail','rock-fall','rock-spire','tyres-scattered','dead-brush','wreck-car'],
}
OBSTACLE_VISUALS = {'brush':'dead-brush','rock-field':'rock-fall','soft-dune':'soft-dune',
 'dead-tree':'dead-tree','rock-spire':'rock-spire','tyres-scattered':'tyres-scattered',
 'rubble':'rock-fall','tree-decoration':'dead-tree'}

def setup():
    target=ART/'briefs/rework2-environment.csv'
    if target.exists() and 'campaign-rework2' in read_json(ART/'budget.json').get('session_envelopes',{}):
        raise RuntimeError('Rework already initialized; preserve briefs, start audit and session envelope')
    rows=[]
    for slug,(theme,action) in PROPS.items():
        rows.append(dict(id=f'rw2-env-{slug}-v1', **{'class':slug}, prompt_action=action+
          ' Original Rust and Ink game prop. Strict directly overhead plan view with readable top surfaces, flat material shading. One complete isolated subject centered in the middle 60 percent of a square with at least 15 percent empty margin on every side. Bold main forms readable in a 64px atlas cell. No separate fragments near canvas edges, cast shadows or decorative backdrop.',
          size='1024x1024',frame='single',background_key='#FF00FF',count=1,status='ready',kind='sprite',
          reference='',batch='rw2-env-'+theme,approval='pending',requires_approval='',cell_limit=64,
          style_file='style-fusion.json',wave='V4',asset_family='props',
          surface_stack='seeded-decals-tall-props-baked-natural-bands',logical_name='environment/'+slug))
    if not target.exists(): write_csv(target,rows)
    obstacles=[]
    for core in csv.DictReader((ROOT/'core/src/main/resources/data/obstacles.csv').read_text().splitlines()):
        obstacles.append(dict(id=core['id'],logical_name='environment/'+OBSTACLE_VISUALS[core['id']],
          effect_class=core['effect'],collision_footprint={'shape':'ellipse','space':'local-metres','centre':[0,0],
            'radii':[float(core['rx']),float(core['ry'])]},visual_extent_m=[float(core['visualWidth']),float(core['visualHeight'])],
          height_m=float(core['height']),drag_multiplier=float(core['drag']),
          shadow={'renderer_generated':True,'offset_per_height':[float(core['shadowX']),float(core['shadowY'])],'opacity':float(core['shadowAlpha'])},
          core_hook_status='active gameplay; visual remap only',owner_approved=False))
    write_json(ART/'rework2-environment.json',dict(schema=1,owner_approved=False,
      theme_sets={k:['environment/'+s for s in v] for k,v in SETS.items()},obstacles=obstacles,
      slogans=['THE TRACK COLLECTS','YOUR DEBT. OUR FINISH.','WIN THE HEAT. KEEP THE RECEIPT.'],
      slogan_policy='Original league copy, typeset in review signage studies; no real brands or generated lettering.',
      core_obstacles_sha256=sha(ROOT/'core/src/main/resources/data/obstacles.csv')))
    policy=read_json(ART/'budget.json');start=Budget().summary()
    assert policy['weekly_image_cap']==700 and not start['stop']
    policy.setdefault('session_envelopes',{})['campaign-rework2']=dict(week=start['week'],
      starting_reservations=start['images_reserved'],max_new_images=150,started_at=now(),asset_prefixes=['rw2-'],
      authorization='Owner CAMPAIGN ART REWORK 2: at most about 150 new images within 700, proof before batch, bounded retries, first quota stop.')
    write_json(ART/'budget.json',policy)
    write_json(ART/'audits/rework2-start.json',dict(at=now(),budget=start,environment_jobs=len(rows),
      generator_sha256=sha(ART.parent/'tools/art/gen.py'),owner_approved_count=0))
    print('Authored',len(rows),'environment jobs; 150 image envelope, cap 700.')

if __name__=='__main__': setup()
