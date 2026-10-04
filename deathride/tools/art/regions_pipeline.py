"""Measure, grade and stage G1 candidates. Never grant owner approval or activate art."""
import argparse
import copy
import json
from pathlib import Path
import time
import urllib.request
import numpy as np
from PIL import Image
from common import ART, ROOT, briefs, digest, make_contact_sheet, now, read_json, sha, style_for, write_json
from gen import Budget, candidates, fingerprint
from process import process_one, key_image, policy, tile_metrics, tile_codes, palette_metrics
from animation import remove_cell_backgrounds, split_sheet
from grade import MODELS, HOST, ANSWER, encode, post, validate

REPORT=ART/'reports/g1-candidates.json'
CATALOG=ART/'regions/catalog.json'
def rows(): return briefs(ART/'briefs/g1-regions.csv')
def records(): return read_json(REPORT) if REPORT.exists() else []
def save(rs): write_json(REPORT,rs)

def repeat_image(im,path):
    out=Image.new('RGBA',(im.width*2,im.height*2))
    for x in (0,im.width):
        for y in (0,im.height):out.paste(im,(x,y))
    out.save(path)

def frame_preview(r,folder):
    canvas=Image.new('RGBA',(192,128))
    for f in r['frames']:canvas.paste(Image.open(f['path']),(f['index']%3*64,f['index']//3*64))
    dest=folder/(r['id']+'-frames.png');canvas.save(dest)
    r['frames_preview']=str(dest);r['frames_preview_sha256']=sha(dest)
    images=[]
    for f in r['frames']:
        im=Image.new('RGBA',(64,64),'#39302A');im.alpha_composite(Image.open(f['path']).convert('RGBA'));images.append(im.convert('RGB'))
    gif=folder/(r['id']+'.gif');images[0].save(gif,save_all=True,append_images=images[1:],duration=r['animation']['durations_ms'],loop=0)
    r['animation_preview']=str(gif)

def measure():
    prior={r['id']:r for r in records()};out=[]
    recipe=digest({p:sha(Path(__file__).with_name(p)) for p in ('regions_pipeline.py','process.py','animation.py')})
    for row in rows():
        for sidecar in candidates(row):
            s=read_json(sidecar)
            if s['status']!='generated':continue
            assert sha(s['image'])==s['sha256'] and s['prompt_verbatim_verified']
            key=row['id']+f"-a{s['attempt']}";old=prior.get(key,{})
            if old.get('recipe_hash')==recipe and old.get('source_sha256')==s['sha256'] and Path(old.get('path','')).is_file() and sha(old['path'])==old['sha256']:
                out.append(old);continue
            folder=ART/'processed/regions'/key;folder.mkdir(parents=True,exist_ok=True)
            if row['kind']=='sheet':
                source=Image.open(s['image']).convert('RGBA');cfg=policy();keyed,keydata=key_image(source,cfg)
                spec=dict(columns=3,rows=2,frames=6,durations_ms=[160]*6,loop=True,pivot='fixed cell centre',frame_cell_px=64)
                keyed,keydata['secondary_cell_keys_rgb']=remove_cell_backgrounds(source,keyed,spec)
                frames,codes=split_sheet(keyed,spec,folder,key)
                if min(source.size)<cfg['source_min_edge_px'] or max(source.size)>cfg['source_max_edge_px']:codes.append('SOURCE_SIZE_BAND')
                dest=folder/(key+'.png');keyed.thumbnail((768,512));keyed.save(dest)
                r=dict(id=key,**{'class':row['class']},kind='sheet',brief=row,source=s['image'],source_sha256=s['sha256'],
                  path=str(dest),sha256=sha(dest),codes=codes,metrics=keydata,frames=frames,animation=spec,
                  gates_hash=digest(cfg),style_hash=digest(style_for(row)),verdict='reject' if codes else 'owner-review')
                frame_preview(r,folder)
            else:
                r=process_one(row,s['image'],folder);r['id']=key
                if row['kind']=='backdrop':
                    target=(1024,512) if row['class']=='horizon' else (512,512)
                    original=Image.open(s['image']).convert('RGBA');fit=original.copy();fit.thumbnail(target,Image.Resampling.LANCZOS)
                    canvas=Image.new('RGBA',target,'#39302A');offset=((target[0]-fit.width)//2,(target[1]-fit.height)//2)
                    canvas.paste(fit,offset);canvas.save(r['path']);r['sha256']=sha(r['path'])
                    r['metrics'].update(export_size_px=list(target),aspect_fit_px=list(fit.size),offset_px=list(offset))
                    r['recipe']='Complete original aspect fit, no source crop/stretch; unused pixels dark-earth matte'
            r.update(owner_approved=False,runtime_enabled=False,region=row['region'],generation_sidecar=str(sidecar.relative_to(ROOT)),
              attempt=s['attempt'],recipe_hash=recipe,origin='generated',fallback='procedural/existing material; G2 activation gated')
            if old.get('sha256')==r['sha256'] and old.get('source_sha256')==r['source_sha256']:
                for field in ('grades','direct_review'):
                    if field in old:r[field]=old[field]
            out.append(r)
    out += [r for r in prior.values() if r['origin']!='generated']
    save(out);boards(out)
    print([(r['id'],r['codes']) for r in out],flush=True)

def boards(rs=None):
    rs=rs if rs is not None else records()
    for region in read_json(CATALOG)['regions']:
        subset=[r for r in rs if r['region']==region['id']]
        make_contact_sheet(subset,ART/f"contact-sheets/g1-{region['id']}.png",region['name']+' / candidates, not owner approved')

SCHEMA={'type':'object','additionalProperties':False,'properties':{
    **{k:ANSWER for k in ('face_free','no_letters_or_logos','top_down_prop','subject_matches','neutral_lighting','export_clean','six_cells_valid')},
    'confidence':{'type':'number','enum':[0.0,0.25,0.5,0.75,1.0]},'description':{'type':'string'}}}
SCHEMA['required']=list(SCHEMA['properties'])

def observation(r,model,model_digest):
    paths=[r['source'],r['path']]
    if r.get('frames_preview'):paths.append(r['frames_preview'])
    prompt=('Inspect actual pixels, not the claimed compliance. Image 1 is source; image 2 is exported art; image 3 if supplied is actual six exported frames. '
      'Return only required JSON. face_free=yes only if NO people, heads, faces, skulls or occupants. no_letters_or_logos=yes if no lettering, numbers, logos or watermark. '
      'top_down_prop=yes only for a prop shown directly overhead with no visible vertical side faces; not_applicable for ground, panels or weather. '
      'subject_matches requires the requested object/material; neutral_lighting means no baked cast shadow or directional lamp; material value differences are allowed. '
      'export_clean=no for key-colour fringes, lost foreground or visibly cut-off art. six_cells_valid applies only to weather sheets: six separate nonempty centred different frames without border collisions or key panels. '
      'Use uncertain when you cannot judge. Confidence is fractional, never percentage. Technical observation only, never acceptance. '
      f"Kind: {r['kind']}. Brief: {r['brief']['prompt_action']}")
    binding=dict(images=[sha(p) for p in paths],model=model,model_digest=model_digest,prompt=prompt,schema=SCHEMA,encoding='alpha-over-70747a-v1')
    key=digest(binding);cache=ART/'grades'/model.replace(':','_')/(key+'.json')
    if cache.exists():return {**read_json(cache),'asset':r['id']}
    started=time.monotonic();g=dict(asset=r['id'],model=model,model_digest=model_digest,input_hash=key,image_hashes=binding['images'],
      prompt=prompt,schema=SCHEMA,at=now(),scope='region source + actual export; advisory, not owner approval')
    try:
        result=post('/api/chat',dict(model=model,messages=[dict(role='user',content=prompt,images=[encode(p) for p in paths])],
          format=SCHEMA,stream=False,think=False,keep_alive='10m',options=dict(temperature=0,num_ctx=8192,num_predict=900,seed=47)))
        g['raw_content']=result['message']['content'];answers=json.loads(g['raw_content'])
        if not validate(answers,SCHEMA):raise ValueError('schema validation failed')
        g.update(status='graded',answers=answers)
    except Exception as exc:g.update(status='ungraded',error=str(exc))
    g['elapsed_seconds']=round(time.monotonic()-started,3);write_json(cache,g)
    print(r['id'],model,g['status'],g['elapsed_seconds'],flush=True);return g

def grade(region=None):
    rs=records();tags=json.load(urllib.request.urlopen(HOST+'/api/tags'));available={m['name']:m for m in tags['models']}
    for model in MODELS:
        assert model in available and 'vision' in available[model]['capabilities']
        for r in rs:
            if r['origin']=='reuse' or (region and r['region']!=region):continue
            g=observation(r,model,available[model]['digest']);r['grades']=[x for x in r.get('grades',[]) if x['model']!=model]+[g];save(rs)
        post('/api/generate',dict(model=model,keep_alive=0))
    print('Local grading complete; no owner approvals.',flush=True)

def semantic_codes(r):
    gs=r.get('grades',[])
    if len(gs)!=2 or any(g.get('status')!='graded' for g in gs):return ['VLM_UNMEASURED']
    codes=[];a,b=[g['answers'] for g in gs]
    for k in SCHEMA['required']:
        if k in ('description','confidence'):continue
        if a[k]!=b[k]:codes.append('VLM_DISAGREEMENT:'+k)
        if 'uncertain' in (a[k],b[k]):codes.append('VLM_UNCERTAIN:'+k)
        if a[k]==b[k]=='no':codes.append('VLM_DEFECT:'+k)
    if min(a['confidence'],b['confidence'])<.85:codes.append('VLM_LOW_CONFIDENCE')
    return codes

def eligible(r):
    if r['origin']=='reuse':return True
    if r['codes'] or not r.get('direct_review',{}).get('technical_eligible'):return False
    d=r['direct_review']
    if d['source_sha256']!=r['source_sha256'] or d['export_sha256']!=r['sha256']:return False
    gs=r.get('grades',[]);expected=[r['source_sha256'],r['sha256']]+([r['frames_preview_sha256']] if r.get('frames_preview') else [])
    if len(gs)!=2 or any(g.get('status')!='graded' or g['image_hashes']!=expected for g in gs):return False
    if any(c.startswith('VLM_DEFECT:') for c in semantic_codes(r)):return False
    return True

def direct(ids,note,accept):
    assert note
    rs=records();found=set()
    for r in rs:
        if r['id'] not in ids:continue
        r['direct_review']=dict(source_sha256=r['source_sha256'],export_sha256=r['sha256'],note=note,
          technical_eligible=accept,at=now(),reviewer='executing agent direct pixel inspection; NOT owner acceptance')
        found.add(r['id'])
    assert found==set(ids),(set(ids)-found)
    save(rs)

def proof(batch):
    group=[r for r in rows() if r['batch']==batch];assert group
    options=[r for r in records() if r['brief']['id']==group[0]['id'] and eligible(r)]
    if not options:raise ValueError('No inspected eligible first-call proof: '+batch)
    r=options[-1]
    target=ART/'proofs'/f'{batch}.json'
    if target.exists():raise ValueError('Preserve proof chronology; proof already released: '+batch)
    write_json(target,dict(batch=batch,input_hash=fingerprint(group,style_for(group[0])),image=r['source'],sha256=r['source_sha256'],
      verdict='batch-direction-checked',reviewer='executing-agent technical screening; NOT owner acceptance',note=r['direct_review']['note'],at=now(),
      report=str(REPORT.relative_to(ROOT)),candidate_id=r['id'],export_sha256=r['sha256'],grade_bindings=[g['input_hash'] for g in r['grades']]))
    print('Released technical proof',batch,flush=True)

def reuse_and_recolour():
    rs=records();existing={r['id'] for r in rs};ledger=read_json(ART/'owner-approvals-2026-10-03.json')['assets']
    source_bundle=ROOT/'assets/phase2-states'
    sources={'asphalt':source_bundle/'v4-fusion-surfaces-asphalt-worn-v1.png',
      'dirt':source_bundle/'v4-fusion-ground-dirt-v1.png','gravel':source_bundle/'v4-fusion-ground-gravel-v1-wrap-v1.png',
      'ice':source_bundle/'v4-fusion-surfaces-ice-crop768-v1.png'}
    for region in read_json(CATALOG)['regions']:
        rid=region['id']
        for p in region['props']:
            if p['origin']!='reuse':continue
            name=p['id'];l=ledger['environment/'+name];assert l['decision']=='Keep'
            path=ROOT/l['archived_export'];assert sha(path)==l['export_sha256']
            id=f'g1-{rid}-reuse-{name}'
            if id in existing:continue
            rs.append(dict(id=id,region=rid,origin='reuse',kind='sprite',**{'class':name},source=str(path),source_sha256=sha(path),path=str(path),sha256=sha(path),codes=[],
              owner_approved=False,runtime_enabled=False,prior_owner_evidence=l,brief=dict(id=id,logical_name=f'regions/{rid}/reuse/{name}',prompt_action=p['reason'],region=rid,kind='sprite'),
              fallback='exact current approved prop; regional placement remains proposed',verdict='previously kept pixels; new placement unreviewed'))
        for material in ('asphalt','dirt','gravel')+(('ice',) if rid=='switchback' else ()):
            id=f'g1-{rid}-{material}-tint-v1'
            if id in existing:continue
            path=sources[material];source=Image.open(path).convert('RGBA');assert source.size==(256,256)
            a=np.asarray(source).astype(float);rgb=a[:,:,:3];lum=rgb@np.array([.2126,.7152,.0722]);target=np.array([int(region['palette'][material][i:i+2],16) for i in (1,3,5)])
            # Pointwise affine transform preserves spatial structure; no invented texture.
            rgb2=target+(lum-lum.mean())[:,:,None]*.85+(rgb-lum[:,:,None])*.15
            a[:,:,:3]=np.clip(rgb2,0,255);image=Image.fromarray(np.round(a).astype('uint8'),'RGBA')
            folder=ART/'processed/regions'/id;folder.mkdir(parents=True,exist_ok=True);dest=folder/(id+'.png');image.save(dest)
            repeat=folder/(id+'-repeat.png');repeat_image(image,repeat)
            metrics=tile_metrics(image);codes=tile_codes(metrics,material)
            row=dict(id=id,**{'class':material},kind='tile',region=rid,style_file='style-fusion.json',asset_family='ground',
              logical_name=f'regions/{rid}/ground/{material}-tint',prompt_action=f"Existing {material} recoloured for {region['name']} to {region['palette'][material]}; preserve fine material structure. No new objects.")
            rs.append(dict(id=id,region=rid,origin='recolour',kind='tile',**{'class':material},source=str(dest),source_sha256=sha(dest),path=str(dest),sha256=sha(dest),
              parent_source=str(path.relative_to(ROOT)),parent_sha256=sha(path),recipe=dict(name='affine-luminance-tint-v1',target_hex=region['palette'][material],detail=.85,chroma=.15),
              brief=row,codes=codes,metrics=metrics,repeat_path=str(repeat),owner_approved=False,runtime_enabled=False,
              gates_hash=digest(policy()),style_hash=digest(style_for(row)),fallback=f'existing untinted {material}',verdict='reject' if codes else 'owner-review'))
    save(rs);boards(rs);print('Reuse and recolours:',[(r['id'],r['codes']) for r in rs if r['origin']!='generated'],flush=True)

def reject_for_refinement(asset,note):
    row=next(r for r in rows() if r['id']==asset);latest=read_json(candidates(row)[-1]);assert latest['status']=='generated'
    rejection=dict(asset=asset,image_sha256=latest['sha256'],note=note,at=now(),attempt=latest['attempt'])
    write_json(ART/'rejections'/f'{asset}.json',rejection);Budget().record({'event':'content-rejection',**rejection})

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['measure','grade','direct','proof','recolour','reject']);p.add_argument('--region');p.add_argument('--batch');p.add_argument('--ids',nargs='+');p.add_argument('--note');p.add_argument('--reject',action='store_true');a=p.parse_args()
    if a.mode=='measure':measure()
    elif a.mode=='grade':grade(a.region)
    elif a.mode=='direct':direct(a.ids,a.note,not a.reject)
    elif a.mode=='proof':proof(a.batch)
    elif a.mode=='recolour':reuse_and_recolour()
    else:reject_for_refinement(a.ids[0],a.note)
