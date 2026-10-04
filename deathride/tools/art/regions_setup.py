"""G1 art-only catalog/immutable briefs from the committed region bible; no paid calls."""
import re
from common import ART, ROOT, now, read_json, write_json, sha, file_lock
from family import write_csv
from gen import Budget

BIBLE = ROOT.parent/'docs/concepts/deathride/G0-region-bible.md'
REGIONS = [
 ('scrap','Ash Yards','Rook','Dry soot fall, cool overcast, brittle dust and sorted salvage.',
  'Roofless sorting sheds, cropped rail sidings and distant suspended conveyor structures surrounding a quiet empty central apron.',
  'Uneven low stacks of dismantled corrugated sheet and skeletal broken power grid across a quiet soot sky.',
  [('ash','Six different silhouettes of ONE small irregular falling ash flake, broad torn soot-bone shapes, not sparks or snow.')],12),
 ('foundry','Cinder Row','Ox','Dry furnace dust, cold clinker and intermittent ember specks.',
  'Connected cast halls, material bunkers and inclined hoist frames surrounding a broad empty dark central apron.',
  'Broken inclined lifts and squat exhaust housings, industrial black masses against quiet earth sky.',
  [('embers','Six animation phases of ONE compact ember fragment, from dull rust chip to tiny broken rust-orange spark, no large flame.')],10),
 ('salt','Salt Cut','Vex','Desiccating wind; white mineral flats meet ochre extraction terraces.',
  'A broad quiet pale mineral basin, ochre stepped extraction terraces confined to the edges and tiny distant mineral handling machinery.',
  'Low stratified ochre quarry ridge adjoining a white salt basin, an interrupted thin conveyor silhouette against quiet bone sky.',
  [('salt-glints','Six distinct tiny irregular mineral glints made from two or three angular bone flecks, no star symbols or cross shapes.'),
   ('dust','Six expanding and dispersing phases of ONE small ochre dust puff, broken soft perimeter, broad translucent-looking flat pigment masses.')],12),
 ('switchback','Thin Air','Mica','Exposed sleet and dirty snow pockets among scoured grey-bone rock.',
  'Bare jagged mountain rock crowns around an open middle pass, tiny anchored road service structures and patchy dirty snow at the edges.',
  'Layered bare wind-scoured ridges with narrow dirty-bone snow cuts, sparse anchored cableway silhouettes, quiet desaturated sky.',
  [('sleet','Six distinct short tapered sleet strokes, slanted consistently rightward, bone-grey ice fragments, one compact stroke per cell.'),
   ('snow','Six distinct small irregular torn granular snow clumps, dirty bone shapes, no decorative snowflake symbols.')],20),
 ('crown','The Crown','Marrow','Hollow decayed spectacle, stagnant low mist and empty grandstands.',
  'Broken stadium seating tiers and shuttered pit buildings around a wide empty service apron, worn dried-red fixtures and bone trim.',
  'Uneven skeletal floodlight frames, empty grandstand crowns and torn unmarked pennants, blank display boards against dark earth sky.',
  [('fog','Six slowly spreading and dispersing phases of ONE small low fog bank, horizontally elongated dirty-bone wisps with broken edges, no scenery.')],3),
]

WEATHER = {
 'ash': dict(max_live=12,spawn_per_second=3,lifetime_seconds=4,max_screen_px=12),
 'embers': dict(max_live=10,spawn_per_second=4,lifetime_seconds=2.5,max_screen_px=10),
 'salt-glints': dict(max_live=8,spawn_per_second=4,lifetime_seconds=2,max_screen_px=6),
 'dust': dict(max_live=4,spawn_per_second=1,lifetime_seconds=4,max_screen_px=64),
 'sleet': dict(max_live=14,spawn_per_second=7,lifetime_seconds=2,max_screen_px=14),
 'snow': dict(max_live=6,spawn_per_second=2,lifetime_seconds=3,max_screen_px=10),
 'fog': dict(max_live=3,spawn_per_second=.5,lifetime_seconds=6,max_screen_px=128,max_alpha=.10),
}
ATMOSPHERE = {
 'scrap': ([.98,.95,.90],.06,.04,['wind-wire','sheet-creak','sorting-clank']),
 'foundry': ([1.02,.96,.90],.07,.03,['furnace-breath','cooling-ticks','press-cycle']),
 'salt': ([1.02,1.00,.94],.03,.04,['dry-gust','sieve-rattle','distant-hauler']),
 'switchback': ([.96,.97,.94],.05,.06,['crosswind','cable-hum','grit-ticks']),
 'crown': ([.96,.93,.90],.08,.10,['empty-stands','fixture-rattle','vent-drone']),
}

def slug(value): return re.sub(r'[^a-z0-9]+','-',value.lower()).strip('-')

def protected_hashes():
    paths = list((ROOT/'core/src/main/resources/data').glob('*'))
    paths += list((ROOT/'assets/phase2-states').rglob('*'))
    paths += [ART/p for p in ('OWNER-CHOICE.md','reference-approvals.json','owner-approvals-2026-10-03.json',
      'owner-choice-binding.json','gates.json','style-fusion.json','style-rust-ink.json','style-soot-pulp.json','style-hot-ink.json')]
    paths += list((ROOT/'game/src').rglob('*.kt'))
    return {str(p.relative_to(ROOT)):sha(p) for p in paths if p.is_file()}

def catalog():
    text=BIBLE.read_text(encoding='utf-8');regions=[]
    sections=re.split(r'\n## [1-5]\. ',text)[1:]
    assert len(sections)==5
    for spec,section in zip(REGIONS,sections):
        rid,name,boss,climate,backdrop,horizon,weather,cap=spec
        props=[];palette=None
        for line in section.splitlines():
            if not line.startswith('|'): continue
            cells=[c.strip() for c in line.strip('|').split('|')]
            if len(cells)==9 and cells[0].startswith('#'):palette=dict(zip(('asphalt','dirt','gravel','sand','salt','ice','snow','oil','kerb'),cells))
            if len(cells)!=6 or cells[-1] not in ('new','kept exact export'): continue
            namep,reason,wh,height,effect,source=cells
            w,h=map(float,wh.split('×'))
            props.append(dict(id=slug(namep),name=namep,reason=reason,effect_class=effect,
              collision_footprint=None if effect=='none' else dict(shape='ellipse',space='local-metres',centre=[0,0],radii=[w/2,h/2]),
              placement_extent_m=[w,h],visual_extent_m=[round(w*(1.35 if float(height)>2 else 1),3),round(h*(1.35 if float(height)>2 else 1),3)],
              height_m=float(height),shadow=dict(renderer_generated=True),origin='reuse' if source.startswith('kept') else 'new',
              owner_approved=False,activation='G2+owner decision required; proposal only',fallback='procedural existing obstacle; no new collision until G2'))
        assert palette and len([p for p in props if p['origin']=='new'])==8
        grade,vignette,fog,hooks=ATMOSPHERE[rid]
        regions.append(dict(id=rid,name=name,division=rid,boss=boss,ally=boss if rid!='crown' else 'Rook, Ox, Vex, Mica; Marrow never joins',
          climate=climate,palette=palette,props=props,backdrop=backdrop,horizon=horizon,
          atmosphere=[dict(id=w,brief=b,**WEATHER[w]) for w,b in weather],weather_cap=cap,owner_approved=False,
          atmosphere_budget=dict(shared_pool=96,combat_reserved=72,regional_max=24,active_families_max=2,
            projected_alpha_coverage_max=.04,additional_texture_runs_max=2,new_framebuffers=0,grade_rgb=grade,
            vignette_alpha_max=vignette,fog_alpha_max=fog,physics_effect='none; presentation only',measured=False),
          ambience_hooks=[f'region.{rid}.{h}' for h in hooks],ambience_status='later audio task; no audio generated',
          plot=section.split('\n\n')[1],source_section=section.split('\n## ')[0]))
    return dict(schema=1,scope='art-only; not runtime region.csv',source=str(BIBLE.relative_to(ROOT.parent)),source_sha256=sha(BIBLE),regions=regions)

def build_briefs(data):
    rows=[]
    def add(region,family,cls,action,kind='sprite',size='1024x1024',cell=128):
        rid=region['id'];batch=f'g1-{rid}-{family}'
        key='none' if kind in ('tile','backdrop') else '#FF00FF'
        if kind=='sprite':
            action+=' Strict directly overhead orthographic plan view: ONLY top surfaces, no visible vertical side faces, no isometric projection. One complete object centered in the middle HALF of the canvas. Leave at least 20 percent clear magenta margin on every side. Broad connected forms readable at 96 pixels. No decorative ground, human, face, skull, occupant or face-like arrangement. No cast shadow.'
        elif kind=='tile':
            action='Entire image is ONLY one empty anonymous painted material field. '+action+' Fine quiet stochastic texture without a focal motif. Seamless opposite edges, single unrepeated field, no quadrants, mirrored halves, large cracks, large polygons, gradients, lighting, objects, outlines, text, faces or people.'
        elif kind=='sheet':
            action='Exactly SIX separate frames in THREE columns and TWO rows of equal square cells. '+action+' Each frame occupies the middle HALF of its cell with at least 20 percent empty magenta margin on all four sides. Fixed origin, scale and camera; reading order. No separators, drawn boxes, labels, faces, skulls, objects or letters. Flat pigment values, no cast shadow. All six cells contain visible different effect shapes.'
        else:
            action+=' Flat graphic Soot Pulp environment panel, large quiet masses and sparse perimeter detail. No perspective grid, photorealism, cast shadow, fog baked into art, sun disc, faces, people, cars, logos or lettering. This is a graphic environment panel, not an isolated overhead prop.'
        rows.append(dict(id=f'g1-{rid}-{cls}-v1',**{'class':cls},prompt_action=action,size=size,
          frame='3x2:6' if kind=='sheet' else 'single',background_key=key,count=1,status='ready',kind=kind,
          reference='',batch=batch,approval='pending',requires_approval='',cell_limit=cell,style_file='style-fusion.json',
          wave='V4',asset_family={'props':'props','panels':'backdrops','atmosphere':'effects','ground':'ground'}[family],
          surface_stack='seeded-decals-tall-props-baked-natural-bands',logical_name=f'regions/{rid}/{family}/{cls}',region=rid))
    for region in data['regions']:
        for p in region['props']:
            if p['origin']=='new':add(region,'props',p['id'],f"{p['name']}: {p['reason']}. Belongs to {region['name']}: {region['climate']}")
        add(region,'panels','backdrop',region['backdrop'],'backdrop',cell=512)
        add(region,'panels','horizon',region['horizon'],'backdrop','1024x512',1024)
        for weather in region['atmosphere']:add(region,'atmosphere',weather['id'],weather['brief'],'sheet','1536x1024',64)
        if region['id']=='foundry':add(region,'ground','clinker','Dense small porous vitrified cold cinder chips mixed into soot-brown foundry fines. Rust-brown worn aggregate, not ordinary rounded stones, no lava or glow.','tile',cell=256)
        if region['id']=='salt':add(region,'ground','salt-crust','Fine irregular dirty-bone salt crystallisation over pale ochre silt, tiny flaky crust and sparse hairline mud fissures, anonymous consistent grain. No large polygon islands.','tile',cell=256)
    return rows

def setup():
    target=ART/'regions/catalog.json'
    if target.exists():raise RuntimeError('Already initialized; preserve immutable G1 catalog/briefs and start snapshot')
    data=catalog();rows=build_briefs(data)
    assert len(rows)==59
    with file_lock(ART/'.budget.lock'):
        policy=read_json(ART/'budget.json');start=Budget().summary()
        assert policy['weekly_image_cap']==850 and not start['stop']
        policy.setdefault('session_envelopes',{})['region-art-g1']=dict(week=start['week'],starting_reservations=start['images_reserved'],
          max_new_images=130,started_at=now(),asset_prefixes=['g1-'],authorization='2026-10-04 owner executing REGION ART: G0/G1, at most about 130 new images; global cap 850; first quota stop.')
        write_json(ART/'budget.json',policy)
    write_json(target,data);write_csv(ART/'briefs/g1-regions.csv',rows)
    write_json(ART/'audits/g1-start.json',dict(at=now(),budget=start,generator_sha256=sha(ROOT/'tools/art/gen.py'),
      protected_hashes=protected_hashes(),planned_images=len(rows),owner_approved_count=0))
    print('Prepared 59 briefs, 17 region/family proof groups; no generation. Ledger:',start)

if __name__=='__main__':setup()
