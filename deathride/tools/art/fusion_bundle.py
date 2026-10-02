"""Publish only explicitly inspected fusion assets through existing atlas gates."""
import csv,shutil
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from common import ART,ROOT,read_json,write_json,sha,now
from atlas import pack_group,validate_selection
from autotile import CASES,canonical,footprint,barrier_mask
from grade import decide

def candidates():
    records=read_json(ART/'reports/v4-fusion-current-deterministic.json')
    path=ART/'reports/v4-fusion-derivatives-deterministic.json'
    if path.exists():records+=read_json(path)
    chosen={}
    for r in records:
        logical=r['brief']['logical_name']
        # A derivative cannot quietly replace an uninspected source.
        chosen[logical]=r
    for r in read_json(ART/'reports/v2-fusion-current-deterministic.json'):
        if r['kind']=='portrait':chosen['portraits/'+r['class']]=r
    return chosen

def autotiles(family,record,folder):
    source=Image.open(record['path']).convert('RGBA');source=source.crop(source.getbbox())
    if family=='barrier':
        w,h=source.size;source=source.crop((w//4,h//4,w*3//4,h*3//4))
    pixels=np.asarray(source.resize((120,120),Image.Resampling.LANCZOS)).copy()
    yy,xx=np.mgrid[:120,:120];grain=(np.sin(xx*.37+yy*.21)+np.sin(xx*.11-yy*.41))*.6
    cells=[];out=ART/'processed'/('v4-fusion-autotile-'+family);out.mkdir(parents=True,exist_ok=True)
    for mask in CASES:
        filled=barrier_mask(mask) if family=='barrier' else footprint(mask)
        a=pixels.copy()
        if family=='track-edge':
            padded=np.pad(filled,16,mode='edge');distance=ndimage.distance_transform_edt(padded)[16:-16,16:-16]
            coverage=np.clip((distance+grain-1)/4,0,1)*filled
            # Wear fades material into the receiving dirt; no contour stroke.
            shoulder=np.clip(1-distance/7,0,1)*filled
            a[:,:,:3]=np.uint8(a[:,:,:3]*(1-shoulder[...,None]*.28)+np.array([93,70,42])*shoulder[...,None]*.28)
            a[:,:,3]=np.uint8(coverage*255)
        else:a[:,:,3]=np.uint8(filled)*255
        cell=np.pad(a,((4,4),(4,4),(0,0)),mode='edge');asset=f'{family}-{mask:03}';path=out/(asset+'.png');Image.fromarray(cell).save(path)
        cells.append({'id':asset,'mask':mask,'path':str(path.resolve()),'sha256':sha(path),'source_sha256':record['sha256'],
            'region_in_cell':[4,4,120,120],'placement':{'pivot_px':[64,64]},'frames':None})
    pages=pack_group('autotile-'+family,cells,folder)
    write_json(folder/('autotile-'+family+'-rules.json'),{'resolver':[canonical(m) for m in range(256)],'bit_order':'N NE E SE S SW W NW','case_count':47,
        'source_sha256':record['sha256'],'recipe':'canonical occupancy with four-pixel extruded gutter; track edges use irregular material fade, no outline stroke',
        'intentional_empty_mask':255 if family=='barrier' else None})
    return pages

def main():
    chosen=candidates();manual=read_json(ART/'audits/fusion-direct-review.json');models=[]
    for model in ('mimo-9b','qwen3.8'):
        observations={}
        for wave in ('v2-fusion-attempts','v4-fusion-attempts','v4-fusion-derivatives','v4-fusion-exports'):
            p=ART/'reports'/f'{wave}-{model}.json'
            if p.exists():observations.update({g['image_hashes'][0]:g for g in read_json(p)})
        models.append(observations)
    selections=[];world=[];ui=[];themes=[];tiles=[];pages=[];catalog=[];provenance=[]
    export_path=ART/'reports/v4-fusion-exports-deterministic.json'
    exports={r['export_parent_id']:r for r in read_json(export_path)} if export_path.exists() else {}
    if len(chosen)!=74:raise ValueError('expected 68 world slots plus six portraits')
    # Gate every record before creating output or changing a prior bundle.
    for logical,r in chosen.items():
        direct=manual.get(r['id'],{})
        if direct.get('source_sha256')!=r['source_sha256'] or direct.get('export_sha256')!=r['sha256'] or direct.get('verdict')=='reject' or not direct.get('note'):
            raise ValueError('DIRECT_REVIEW_REQUIRED: '+logical)
        grades=[m.get(r['source_sha256'],{}) for m in models]
        _,codes=decide(grades,r['kind'],read_json(ART/'gates.json')['vlm_confidence_min'])
        group='tile' if r['kind']=='tile' else 'theme' if r['kind']=='backdrop' else 'ui' if r['brief']['asset_family'] in ('portraits','pickups','hud-icons','hud-frames') else 'world'
        selection={'id':r['id'],'logical_name':logical,'group':group,'status':'technical-accepted','owner_approved':False,
            'review_note':direct['note'],'source_sha256':r['source_sha256'],'processed_sha256':r['sha256'],
            'reviewed_machine_codes':codes,'model_observations':[{'model':g.get('model'),'status':g.get('status'),'image_sha256':g.get('image_hashes',[None])[0],'answers':g.get('answers')} for g in grades]}
        if r.get('frames'):
            e=exports.get(r['id']);eg=[m.get(e['source_sha256'],{}) for m in models] if e else []
            selection.update(export_frame_hashes=[f['sha256'] for f in r['frames']],export_preview_sha256=e['source_sha256'] if e else None,
                export_model_observations=[{'model':g.get('model'),'status':g.get('status'),'image_sha256':g.get('image_hashes',[None])[0]} for g in eg])
        validate_selection(selection,r);selections.append(selection)
    folder=ROOT/'assets/phase2-fusion'
    if folder.exists():raise ValueError('versioned fusion destination already exists; do not overwrite')
    stage=ART/'processed/fusion-publish';stage.mkdir(parents=True,exist_ok=True)
    for selection in selections:
        logical=selection['logical_name'];r=chosen[logical];group=selection['group']
        if group in ('world','ui'):(world if group=='world' else ui).append(r)
        else:
            name=r['id']+'.png';shutil.copyfile(r['path'],stage/name);im=Image.open(stage/name)
            meta={'file':name,'id':r['id'],'sha256':sha(stage/name),'width':im.width,'height':im.height,'rgba_bytes':im.width*im.height*4,'wrap':'Repeat' if group=='tile' else 'ClampToEdge'}
            (tiles if group=='tile' else themes).append(meta)
        entry={'logical_name':logical,'asset_id':r['id'],'group':group,'owner_approved':False}
        if r.get('frames'):entry.update(frames=[r['id']+'-'+str(f['index']) for f in r['frames']],durations_ms=r['animation']['durations_ms'],loop=r['animation']['loop'],pivot='fixed cell centre')
        if group=='world' and not r.get('frames'):entry.update(effect_class='none',collision_footprint=None)
        catalog.append(entry);provenance.append({'selection':selection,'provenance':r})
    # Renderer-native shadow mask shares the last free world cells. No new page.
    from PIL import ImageDraw,ImageFilter
    shadow=Image.new('RGBA',(128,128));draw=ImageDraw.Draw(shadow);draw.ellipse((14,37,114,91),fill=(255,255,255,210));shadow=shadow.filter(ImageFilter.GaussianBlur(4))
    # Preserve fully transparent four-pixel gutter required by the atlas contract.
    a=np.asarray(shadow).copy();a[:4,:,3]=0;a[-4:,:,3]=0;a[:,:4,3]=0;a[:,-4:,3]=0
    shadow_path=ART/'processed/fusion-render-shadow.png';Image.fromarray(a).save(shadow_path)
    world.append({'id':'fusion-render-shadow','path':str(shadow_path),'sha256':sha(shadow_path),'placement':{'pivot_px':[64,64]}})
    pages+=pack_group('world',world,stage);pages+=pack_group('ui',ui,stage)
    pages+=autotiles('track-edge',chosen['tiles/asphalt-worn'],stage)
    pages+=autotiles('barrier',chosen['barriers/concrete-straight'],stage)
    ribbon=ART/'surface-lab/fusion-inputs/ribbon.png';shutil.copyfile(ribbon,stage/'course-ribbon.png');im=Image.open(ribbon)
    ribbons=[{'file':'course-ribbon.png','sha256':sha(ribbon),'width':im.width,'height':im.height,'rgba_bytes':im.width*im.height*4,'wrap':'Repeat longitudinal / ClampToEdge transverse','recipe_manifest_sha256':sha(ART/'surface-lab/fusion-inputs.json')}]
    reserve=8*2**20;resident=sum(p['rgba_bytes'] for p in pages+tiles+ribbons)+max(p['rgba_bytes'] for p in themes)+reserve
    write_json(stage/'manifest.json',{'schema':1,'bundle':'phase2-fusion','published_at':now(),'truth':'technical world kit; owner review pending; no damage/livery art; renderer integration only in isolated artlab',
        'pages':pages,'tiles':tiles,'themes':themes,'ribbons':ribbons,'cars_reserved_rgba_bytes':reserve,'resident_rgba_bytes_with_reserved_cars':resident,
        'resident_policy':'all atlas/material/ribbon pages + one backdrop + two reserved car pages; 30.75 MiB prior plus 0.5 MiB ribbon; game scenery FBO excluded','cpu_course_vertex_bytes':28800})
    old=read_json(ROOT/'assets/phase2-v1/catalog.json');old_logical={r['asset_id']:r['logical_name'] for r in old['assets']}
    def alias(value):return chosen[old_logical[value]]['id']
    obstacles=read_json(ART/'fusion-obstacles.json')
    for ob in obstacles['obstacles'].values():
        ob['asset_id']=chosen[ob['logical_name']]['id']
        entry=next(r for r in catalog if r['logical_name']==ob['logical_name']);entry.update({k:ob[k] for k in ('effect_class','collision_footprint','height_m','shadow','core_hook_status')})
    data={**old,'assets':catalog,'natural_obstacles':obstacles,'content_portrait_aliases':{'rival-'+r['class']:r['id'] for r in chosen.values() if r['kind']=='portrait'},
        'content_landmark_aliases':{k:alias(v) for k,v in old['content_landmark_aliases'].items()},
        'content_combat_aliases':{g:{k:alias(v) for k,v in m.items()} for g,m in old['content_combat_aliases'].items()}}
    write_json(ART/'fusion-obstacles-selected.json',obstacles)
    write_json(stage/'catalog.json',data);write_json(stage/'provenance.json',provenance)
    write_json(ART/'fusion-selections.json',{'schema':1,'owner_approved':False,'assets':selections})
    (stage/'README.md').write_text('# Fusion world kit\n\nTechnical candidates, owner approval pending. 74 logical assets; cars remain separately reviewed references. Natural obstacle fields are metadata for a later core hook. Declared art residency 31.25 MiB, including the 0.5 MiB baked ribbon and 8 MiB car reserve; the game scenery target is excluded. See art/review/fusion/index.html and art/surface-lab/fusion-review.html.\n',encoding='utf-8')
    from validate_bundle import validate
    validate(stage,ART/'reports/v4-fusion-bundle-validation.json')
    shutil.copytree(stage,folder);print('Published technical bundle',folder,'resident MiB',resident/2**20)

if __name__=='__main__':main()
