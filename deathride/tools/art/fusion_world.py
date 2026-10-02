"""Fusion world briefs and explicit natural-obstacle metadata, no paid calls."""
from common import ART, write_json
import re
from family import write_csv
from world import TILES,BARRIERS,PROPS,PICKUPS,DECALS,EFFECTS,HUD,THEMES,LANDMARKS,COMBAT_ICONS

NATURAL={
 'brush':'One low tangled oval clump of dry thorn brush seen directly overhead, sparse ochre twigs around a dense soot and rust root core, large transparent gaps between branches, no soil patch.',
 'rock-field':'One compact irregular group of four angular rust and bone boulders seen directly overhead, distinct flat top facets, dark narrow crevices, no ground patch.',
 'soft-dune':'One small isolated low crescent of loose ochre sand, sparse scuffed grain and broken soft feathered perimeter; overhead material patch, no drawn outline, no horizon or lighting gradient.',
 'dead-tree':'One tall dead tree cluster seen directly overhead: central thick splintered soot trunk crown, three crooked bone-brown branch forks spreading to uneven bare ends, large open gaps. Top-plan crown, no side elevation, ground or cast shadow.',
 'rock-spire':'One tall narrow angular rock spire seen directly overhead: jagged rust-brown crown with three bone chipped facet tips, asymmetrical compact footprint. Flat top-plan facets, no side elevation or cast shadow.'}

def recolour(text):
    for old,new in [('warm ivory','bleached bone'),('warm-ivory','bleached-bone'),('cool-grey','bone-grey'),('cool grey','bone grey'),('muted blue','soot'),('blue-grey','soot-grey'),('blue steel','rust steel'),('blue toolbox','rust toolbox'),('blue plates','rust plates'),('blue mount','rust mount'),('blue flag','ochre flag'),('olive','dirty ochre'),('orange','rust-orange'),('red','dried-red')]:
        text=re.sub(r'\b'+re.escape(old)+r'\b',new,text)
    return text

def main():
    rows=[]
    def add(family,cls,action,kind='sprite',cell=128,logical=None):
        if kind=='tile':
            action='Entire image is ONLY one empty anonymous painted material field. '+action+' Fine understated dry-brush grain, quiet large values, no dramatic cracks, lighting gradient, focal motif, frame or border. Single unrepeated stochastic field, seamless edges; never repeated quadrants or mirrored halves. No road line, car, prop, object, lettering, ink perimeter or scene.'
        elif kind=='backdrop':
            action+=' Quiet mid-dark centre with sparse perimeter detail. Original overhead painted setting, no cars, text or branded objects, no directional lighting.'
        elif kind=='sheet':
            action='Exactly SIX separate frames in THREE columns and TWO rows, equal square cells, no visible separators. '+action+' One phase per cell in reading order. Centre every frame in its own cell at fixed camera and scale. Leave broad uniform magenta space between frames and at the sheet border. No objects, letters, numbers or labels. All six frames contain visible effect pixels.'
        else:
            action+=' One SMALL isolated complete asset, floating in a large empty magenta field. All pixels within the middle HALF of the canvas; extremely generous empty margin on ALL four sides. Strong shape at 96 pixels, HUD at 32 pixels. Flat neutral material shading, no cast shadow, scene, car or lettering.'
            if family in ('barriers','props','landmarks','decals'):action+=' Strict directly overhead plan view; no visible front or side wall.'
        rows.append(dict(id=f'v4-fusion-{family}-{cls}-v1',**{'class':cls},prompt_action=recolour(action),size='1024x1024',frame='3x2:6' if kind=='sheet' else 'single',background_key='none' if kind in ('tile','backdrop') else '#FF00FF',count=1,status='ready',kind=kind,reference='',batch='v4-fusion-'+family,approval='pending',requires_approval='',cell_limit=cell,style_file='style-fusion.json',wave='V4',asset_family=family,surface_stack='seeded-decals-tall-props-baked-natural-bands',logical_name=logical or family+'/'+cls))
    tiles={**TILES,'asphalt-clean':'Dark soot asphalt, tiny sparse aggregate, near-uniform dark value, no cracks.',
        'gravel':'Fine packed small irregular ochre and soot stones, dense anonymous even distribution; no large rocks.',
        'ice':'Low-contrast dirty bone-grey fine frost, no large cracks, no blue border glow or directional reflection.',
        'oil':'Soot-dark oily asphalt, very subtle brown grey sheen, small irregular matte scuffs, no puddle outline.',
        'kerb':'Weathered bone and dried-red painted concrete material, irregular broken patches of worn paint with dirt showing through; no uniform racing stripes or black outlining.'}
    for cls,action in tiles.items():add('ground' if cls in ('grass','dirt','gravel') else 'surfaces',cls,action,'tile',256,'tiles/'+cls)
    for family,items in [('barriers',BARRIERS),('props',{**PROPS,**NATURAL}),('pickups',PICKUPS),('decals',DECALS),('landmarks',LANDMARKS)]:
        for cls,action in items.items():add(family,cls,action)
    for cls,(action,durations) in EFFECTS.items():add('effects',cls,action,'sheet')
    for cls,action in {**HUD,**COMBAT_ICONS}.items():
        family='hud-frames' if cls.startswith('frame-') else 'hud-icons'
        add(family,cls,action,'icon',256 if family=='hud-frames' else 128,('hud/' if cls in HUD else 'combat-icons/')+cls)
    for cls,action in THEMES.items():add('backdrops',cls,action,'backdrop',1024)
    write_csv(ART/'briefs/v4-fusion-world.csv',rows)
    obstacles={}
    specs=[('brush','drag',3.8,2.8,.5),('rock-field','solid',4.5,3.1,1.1),('soft-dune','drag',5.8,3.2,.4),('dead-tree','solid',2.2,1.7,5.4),('rock-spire','solid',2.5,1.8,6.2),('tyres-scattered','drag',3.2,2.5,.7)]
    for cls,effect,w,h,height in specs:
        obstacles[cls]={'asset_id':f'v4-fusion-props-{cls}-v1','logical_name':'props/'+cls,
            'effect_class':effect,'collision_footprint':{'shape':'ellipse','space':'local-metres','centre':[0,0],'radii':[w/2,h/2]},
            'visual_extent_m':[w*1.45,h*1.6] if height>2 else [w,h],'height_m':height,
            'shadow':{'renderer_generated':True,'offset_per_height':[.30,-.22],'opacity':.26},
            'core_hook_status':'metadata-only; not wired to physics','drag_multiplier':.68 if effect=='drag' else None,
            'placement':'seeded off racing line; later core validates passable width','owner_approved':False}
    write_json(ART/'fusion-obstacles.json',{'schema':1,'units':'metres; art proposal only, core hook must validate tuning',
        'transform':'rotate local footprint by prop heading then translate by world centre; shadow is never collision',
        'effect_classes':{'none':'visual decoration only','drag':'inside footprint: proposed multiplicative speed/traction resistance','solid':'colliding footprint; later core resolves contact'},
        'default_decoration':{'effect_class':'none','collision_footprint':None},'obstacles':obstacles})
    print('World briefs',len(rows))

if __name__=='__main__':main()
