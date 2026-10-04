"""Publish a source-bound HUD edition; original fusion bytes remain immutable."""
import csv
import json
import shutil
import sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from scipy import ndimage

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools/art'))
from common import ART,read_json,write_json,sha,now,briefs,make_contact_sheet
from process import run
from atlas import pack_group,validate_selection,content_hash
from validate_bundle import validate

def opening(im):
    solid=np.asarray(im)[:,:,3]>10
    holes=ndimage.binary_fill_holes(solid)&~solid
    labels,count=ndimage.label(holes)
    assert count,'No transparent frame opening'
    sizes=np.bincount(labels.ravel());sizes[0]=0;hole=labels==sizes.argmax()
    heights=np.zeros(im.width,int);best=(0,None)
    for y in range(im.height):
        heights=np.where(hole[y],heights+1,0);stack=[]
        for x in range(im.width+1):
            height=heights[x] if x<im.width else 0;start=x
            while stack and stack[-1][1]>height:
                left,h=stack.pop();area=(x-left)*h
                if area>best[0]:best=(area,[int(left),int(y-h+1),int(x),int(y+1)])
                start=left
            if not stack or stack[-1][1]<height:stack.append((start,height))
    assert best[0]>64
    return best[1]

def prepare():
    rows=briefs(ART/'briefs/hud.csv');records=[]
    for batch in dict.fromkeys(r['batch'] for r in rows):records+=run([r for r in rows if r['batch']==batch],batch)
    for r in records:
        if r.get('source') and r['brief']['asset_family']=='hud-frames':r['hud_interior_px']=opening(Image.open(r['path']).convert('RGBA'))
    write_json(ART/'reports/hud-final-candidates.json',records)
    print('Candidate pixel gates',[(r['id'],r['codes']) for r in records if r['codes']])

def publish():
    records=read_json(ART/'reports/hud-final-candidates.json')
    manual=read_json(ART/'audits/hud-direct-review.json')
    models=[{r['asset']:r for r in read_json(ART/f'reports/hud-final-{model}.json')} for model in ('mimo-9b','qwen3.8')]
    selections=[]
    for r in records:
        observations=[m[r['id']] for m in models]
        direct=manual[r['id']]
        assert direct['source_sha256']==r['source_sha256'] and direct['export_sha256']==r['sha256'], 'Stale direct review'
        selected={'id':r['id'],'status':'technical-accepted','owner_approved':False,'source_sha256':r['source_sha256'],'processed_sha256':r['sha256'],
                  'review_note':direct['note'],'model_observations':[{'model':o['model'],'status':o['status'],'image_sha256':o['image_hashes'][0],'answers':o['answers']} for o in observations]}
        validate_selection(selected,r);selections.append(selected)
    source=ROOT/'assets/phase2-fusion';target=ROOT/'assets/phase2-hud'
    assert not target.exists(),'Immutable accepted version already exists'
    staging=ART/'processed/hud-bundle'
    assert not staging.exists(),'Inspect existing staging before republishing'
    shutil.copytree(source,staging)
    extracted=ART/'processed/hud-inherited';extracted.mkdir(exist_ok=True)
    original=read_json(source/'ui.json');ui=[];derivatives=[]
    for r in original['regions']:
        page=Image.open(source/original['pages'][r['page']]['file'])
        im=page.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height']))
        assert content_hash(im)==r['content_sha256']
        pivot=r['pivot_px'];interior=r.get('hud_interior_px')
        if 'portraits' in r['id']:
            scale=128/im.width;im=im.resize((128,128),Image.Resampling.LANCZOS);pivot=[v*scale for v in pivot]
            derivatives.append({'id':r['id'],'source_content_sha256':r['content_sha256'],'recipe':'256 to 128 Lanczos portrait, runtime target 60 logical px / 90 physical px; save UI page residency'})
        path=extracted/(r['id']+'.png');im.save(path)
        ui.append({'id':r['id'],'path':str(path),'sha256':sha(path),'placement':{'pivot_px':pivot},'hud_interior_px':interior})
    ui+=records
    pages=pack_group('ui',ui,staging)
    manifest=read_json(staging/'manifest.json');manifest['bundle']='phase2-hud';manifest['published_at']=now()
    manifest['pages']=[p for p in manifest['pages'] if not p['file'].startswith('ui-')]+pages
    manifest['truth']='Technical fusion HUD edition; owner taste/readability pending. No additional GL page.'
    write_json(staging/'manifest.json',manifest)
    catalog=read_json(staging/'catalog.json')
    catalog['assets'] += [{'logical_name':r['brief']['logical_name'],'asset_id':r['id'],'group':'ui','owner_approved':False} for r in records]
    write_json(staging/'catalog.json',catalog)
    write_json(staging/'hud-provenance.json',{'source_bundle_manifest_sha256':sha(source/'manifest.json'),'selections':selections,'records':records,'inherited_derivatives':derivatives})
    validate(staging,ROOT/'evidence/hud/h2/bundle-validation.json')
    review=ART/'review/hud';review.mkdir(parents=True,exist_ok=True)
    portable=[]
    for r,s in zip(records,selections):
        for directory,original_path in [('sources',r['source']),('pixels',r['path'])]:
            out=review/directory/(r['id']+Path(original_path).suffix);out.parent.mkdir(exist_ok=True);shutil.copyfile(original_path,out)
        portable.append({'id':r['id'],'source':'sources/'+r['id']+Path(r['source']).suffix,'pixels':'pixels/'+r['id']+Path(r['path']).suffix,'source_sha256':r['source_sha256'],'export_sha256':r['sha256'],'selection':s,'hud_interior_px':r.get('hud_interior_px')})
    write_json(review/'review.json',{'records':portable,'owner_approved':False,'spend':read_json(ART/'reports/hud-spend.json')})
    # Exactly 96 px silhouettes on the bridge backing, plus explicit readable labels.
    sheet=Image.new('RGB',(700,((len(records)+4)//5)*150),'#171513');draw=ImageDraw.Draw(sheet);font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',12)
    for i,r in enumerate(records):
        im=Image.open(r['path']).convert('RGBA');im=im.crop(im.getbbox());im.thumbnail((96,96))
        x=(i%5)*140;y=(i//5)*150;sheet.paste(im,(x+(140-im.width)//2,y+(104-im.height)//2),im)
        draw.text((x+3,y+111),r['brief']['logical_name'].replace('hud/','').replace('ability-',''),font=font,fill='#ddd0a6')
    sheet.save(review/'silhouettes-96.png')
    html=['<!doctype html><html><meta charset="utf-8"><title>Death Ride HUD review</title><style>body{background:#171513;color:#ddd0a6;font:18px system-ui;max-width:1100px;margin:auto}img{max-width:100%}article{border-top:2px solid #b4512d;padding:20px}article img{max-width:260px}</style><h1>HUD / Hot Ink</h1><p>Technical selection only. Owner readability and taste pending. The 96 px sheet is literal scale.</p><img src="silhouettes-96.png">']
    for r in portable:html.append('<article><h2>'+r['id']+'</h2><img src="'+r['pixels']+'"><p>'+r['selection']['review_note']+'</p></article>')
    (review/'index.html').write_text('\n'.join(html),encoding='utf-8')
    (staging/'README.md').write_text('Fusion HUD edition. See deathride/art/review/hud/index.html and docs/concepts/deathride/H2-hud-implementation.md. One repacked UI page; immutable fusion world copied without changes. Technical selection does not grant owner taste approval.\n')
    shutil.copytree(staging,target)
    print('Published',target)

if __name__=='__main__':
    {'prepare':prepare,'publish':publish}[sys.argv[1]]()
