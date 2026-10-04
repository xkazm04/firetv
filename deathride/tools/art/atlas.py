"""Publish explicitly reviewed technical selections with reproducible libGDX atlases."""
import math,shutil,uuid,hashlib,csv
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from common import ART,ROOT,read_json,write_json,sha,now,digest

def extrude(im):
    a=np.asarray(im.convert('RGBA')).copy();mask=a[:,:,3]>0
    if mask.any():
        _,ix=ndimage.distance_transform_edt(~mask,return_indices=True)
        a[~mask,:3]=a[ix[0][~mask],ix[1][~mask],:3]
    return Image.fromarray(a)

def content_hash(im):
    a=np.asarray(im.convert('RGBA')).copy();a[a[:,:,3]==0,:3]=0
    return hashlib.sha256(a.tobytes()).hexdigest()

def layout(items,size=1024,max_pages=1):
    pages=[];placements=[];occupied=[]
    step=math.gcd(size,*(v for r in items for v in (r['width'],r['height']))) if items else size
    across=size//step
    for item in sorted(items,key=lambda r:(-r['height'],-r['width'],r['id'])):
        w,h=item['width'],item['height']
        if w>size or h>size:raise ValueError('ATLAS_ITEM_TOO_LARGE')
        gw,gh=w//step,h//step;found=None
        for page in range(max_pages):
            if page==len(pages):pages.append(Image.new('RGBA',(size,size)));occupied.append(np.zeros((across,across),bool))
            for gy in range(across-gh+1):
                for gx in range(across-gw+1):
                    if not occupied[page][gy:gy+gh,gx:gx+gw].any():found=(page,gx,gy);break
                if found:break
            if found:break
        if found is None:raise ValueError('ATLAS_PAGE_BUDGET')
        page,gx,gy=found;occupied[page][gy:gy+gh,gx:gx+gw]=True
        placements.append({**item,'page':page,'x':gx*step,'y':gy*step})
    return pages,placements

def validate_layout(items,size=1024):
    for i,a in enumerate(items):
        if min(a['x'],a['y'])<0 or a['x']+a['width']>size or a['y']+a['height']>size:raise ValueError('ATLAS_BOUNDS')
        for b in items[i+1:]:
            if a['page']==b['page'] and a['x']<b['x']+b['width'] and b['x']<a['x']+a['width'] and a['y']<b['y']+b['height'] and b['y']<a['y']+a['height']:raise ValueError('ATLAS_OVERLAP')

def validate_selection(selection,record):
    if selection.get('status')!='technical-accepted' or not selection.get('review_note'):raise ValueError('EXPLICIT_REVIEW_REQUIRED')
    if record.get('codes'):raise ValueError('PIXEL_GATE_REJECTION')
    if not record.get('path') or sha(record['path'])!=selection.get('processed_sha256') or record['sha256']!=selection['processed_sha256']:raise ValueError('STALE_SELECTION')
    if record['source_sha256']!=selection.get('source_sha256'):raise ValueError('STALE_SOURCE')
    if selection.get('owner_approved'):raise ValueError('ART technical selection must not impersonate owner approval')
    observations=selection.get('model_observations',[])
    if len(observations)!=2 or len({o['model'] for o in observations})!=2 or any(o.get('status')!='graded' or o.get('image_sha256')!=record['source_sha256'] for o in observations):raise ValueError('TWO_CURRENT_MODEL_OBSERVATIONS_REQUIRED')
    if record.get('frames'):
        if selection.get('export_frame_hashes')!=[f['sha256'] for f in record['frames']]:raise ValueError('STALE_FRAME_REVIEW')
        export=selection.get('export_model_observations',[])
        if len(export)!=2 or any(o.get('status')!='graded' or o.get('image_sha256')!=selection.get('export_preview_sha256') for o in export):raise ValueError('TWO_EXPORT_OBSERVATIONS_REQUIRED')

def pack_group(name,records,folder,max_pages=1):
    items=[]
    for record in records:
        frames=record.get('frames') or [{'path':record['path'],'sha256':record['sha256'],'index':None}]
        for frame in frames:
            path=Path(frame['path'])
            if sha(path)!=frame['sha256']:raise ValueError('FRAME_CHANGED')
            with Image.open(path) as im:w,h=im.size
            asset=record['id'] if frame['index'] is None else record['id']+'-'+str(frame['index'])
            items.append({'id':asset,'asset_id':record['id'],'path':str(path),'sha256':frame['sha256'],'content_sha256':content_hash(Image.open(path)),'width':w,'height':h,'frame_index':frame['index'],'pivot_px':frame.get('pivot_px',record.get('placement',{}).get('pivot_px',[w/2,h/2])),'region_in_cell':record.get('region_in_cell',[0,0,w,h]),'hud_interior_px':record.get('hud_interior_px')})
    pages,positions=layout(items,max_pages=max_pages);validate_layout(positions)
    atlas=[];page_records=[]
    for n,page in enumerate(pages):
        for item in positions:
            if item['page']==n:page.paste(extrude(Image.open(item['path'])),(item['x'],item['y']))
        page_name=f'{name}-{n}.png';page_path=folder/page_name;page.save(page_path)
        page_records.append({'file':page_name,'sha256':sha(page_path),'width':1024,'height':1024,'rgba_bytes':1024**2*4})
        atlas+=['' if atlas else '',page_name,'size: 1024, 1024','format: RGBA8888','filter: Linear, Linear','repeat: none']
        for item in positions:
            if item['page']!=n:continue
            rx,ry,rw,rh=item['region_in_cell'];atlas+=[item['id'],'  rotate: false',f"  xy: {item['x']+rx}, {item['y']+ry}",f'  size: {rw}, {rh}',f'  orig: {rw}, {rh}','  offset: 0, 0','  index: -1']
    (folder/(name+'.atlas')).write_text('\n'.join(atlas).lstrip()+'\n',encoding='utf-8')
    write_json(folder/(name+'.json'),{'schema':1,'group':name,'pages':page_records,'regions':positions,'filter':'Linear','mipmaps':False,'alpha':'straight RGBA; libGDX SRC_ALPHA, ONE_MINUS_SRC_ALPHA','owner_quality':'pending G2','recipe':'descending-height-first-free-cell-v1'})
    return page_records

def publish(draft=False):
    selections=read_json(ART/'selections.json')
    records={r['id']:r for r in read_json(ART/'reports/p4-world-candidates-deterministic.json')}
    chosen=[]
    for selection in selections['assets']:
        if selection['status']!='technical-accepted':continue
        record=records[selection['id']];validate_selection(selection,record);chosen.append((selection,record))
    destination=ROOT/'assets/phase2-v1'
    if destination.exists() and not draft:raise ValueError('Accepted output version already exists; mint a new bundle ID rather than overwrite')
    folder=ART/'processed'/('publish-'+str(uuid.uuid4()));folder.mkdir(parents=True)
    groups={'world':[],'ui':[]};pages=[];tiles=[];themes=[];sidecars=[];catalog=[]
    for selection,record in chosen:
        group=selection['group']
        if group in groups:groups[group].append(record)
        elif group in ('tile','theme'):
            im=Image.open(record['path']).convert('RGBA');filename=record['id']+'.png';path=folder/filename;im.save(path)
            meta={'file':filename,'id':record['id'],'sha256':sha(path),'width':im.width,'height':im.height,'rgba_bytes':im.width*im.height*4,'wrap':'Repeat' if group=='tile' else 'ClampToEdge'}
            (tiles if group=='tile' else themes).append(meta)
        else:raise ValueError('unknown group '+group)
        sidecars.append({'selection':selection,'provenance':record})
        entry={'logical_name':selection['logical_name'],'asset_id':record['id'],'group':group,'owner_approved':False}
        if record.get('frames'):entry.update(frames=[record['id']+'-'+str(f['index']) for f in record['frames']],durations_ms=record['animation']['durations_ms'],loop=record['animation']['loop'],pivot='fixed cell centre')
        catalog.append(entry)
    for group,items in groups.items():
        if items:pages+=pack_group(group,items,folder)
    for family in ('track-edge','barrier'):
        path=ART/'reports'/('p4-autotile-'+family+'.json')
        if not path.exists():continue
        data=read_json(path)
        if not any(s['id']==data['source']['id'] for s,r in chosen):raise ValueError('autotile source not selected')
        if records[data['source']['id']]['sha256']!=data['source']['sha256']:raise ValueError('stale autotile source')
        from autotile import require_complete
        require_complete(data['cases'])
        case_records=[{**r,'frames':None,'placement':{'pivot_px':[64,64]}} for r in data['cases']]
        pages+=pack_group('autotile-'+family,case_records,folder)
        write_json(folder/('autotile-'+family+'-rules.json'),{'resolver':data['resolver'],'bit_order':data['bit_order'],'case_count':47,'source_sha256':data['source']['sha256'],'recipe':data['recipe'],'intentional_empty_mask':255 if family=='barrier' else None})
    world_pages=sum(1 for p in pages if not p['file'].startswith('ui-'))
    if world_pages>3:raise ValueError('world atlas page budget exceeded')
    reserve_cars=read_json(ART/'style.json')['texture_budget']['cars_pages']*4*2**20
    resident=sum(p['rgba_bytes'] for p in pages+tiles)+max((p['rgba_bytes'] for p in themes),default=0)+reserve_cars
    if resident>32*2**20:raise ValueError('SCENE_TEXTURE_BUDGET')
    write_json(folder/'manifest.json',{'schema':1,'published_at':now(),'bundle':'phase2-v1','truth':'technical assets only; owner quality pending; renderer integration not performed','pages':pages,'tiles':tiles,'themes':themes,'resident_rgba_bytes_with_reserved_cars':resident,'cars_reserved_rgba_bytes':reserve_cars,'resident_policy':'all listed atlas/tile pages plus at most one theme; includes two reserved 1024 car pages','selections_sha256':sha(ART/'selections.json')})
    write_json(folder/'provenance.json',sidecars)
    content={name:list(csv.DictReader((ART/'contracts'/('p4-'+name+'.csv')).open(encoding='utf-8'))) for name in ('rivals','track-themes','weapons','consumables')}
    provisional=read_json(ART/'contracts/p4-c4-provisional.json') if (ART/'contracts/p4-c4-provisional.json').exists() else None
    if provisional and provisional['rival']['id'] in {r['id'] for r in content['rivals']}:provisional=None
    portrait_aliases={'rival-'+r['logical_name'].split('/')[-1]:r['asset_id'] for r in catalog if r['logical_name'].startswith('portraits/')}
    write_json(folder/'catalog.json',{'assets':catalog,'content_contracts':content,'provisional_c4':provisional,'content_portrait_aliases':portrait_aliases,'content_landmark_aliases':read_json(ART/'contracts/p4-landmark-aliases.json'),'content_combat_aliases':read_json(ART/'contracts/p4-combat-aliases.json'),'content_source':read_json(ART/'contracts/p4-content-source.json'),'scale':'Car dimensions and W6 camera stay authoritative. Atlas tile pixels do not define track width or world collision geometry.'})
    shutil.copyfile(ART/'DELIVERY.md',folder/'README.md')
    from validate_bundle import validate
    validate(folder)
    # The immutable accepted destination appears only after all local gates pass.
    if draft:
        write_json(ART/'reports/p4-draft-location.json',{'folder':str(folder.resolve())})
        print('Draft validated export staged at',folder)
    else:shutil.copytree(folder,destination)
    print('Selected',len(chosen),'technical source assets;',len(pages),'atlas pages;',resident/2**20,'MiB including car reserve')
    return folder if draft else destination

if __name__=='__main__':
    import sys
    publish('--draft' in sys.argv)
