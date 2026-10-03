"""Story measurement, technical proof evidence and portable owner review. Never spends or accepts art."""
import argparse
import html
import shutil
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from common import ART, ROOT, briefs, read_json, write_json, sha, now, style_for, make_contact_sheet
from gen import Budget, candidates, fingerprint
from process import process_one

ROWS=ART/'briefs/story-art.csv'
REPORT=ART/'reports/story-attempts-deterministic.json'

def measure():
    records=[]
    for row in briefs(ROWS):
        for p in candidates(row):
            s=read_json(p)
            if s['status']!='generated':continue
            assert sha(s['image'])==s['sha256'] and s['prompt_verbatim_verified']
            r=process_one(row,s['image'],ART/'processed/story'/('attempt-'+str(s['attempt'])))
            r.update(attempt=s['attempt'],generation_sidecar=str(p.relative_to(ROOT)))
            if s['attempt']>1:r['id']+='-a'+str(s['attempt'])
            if row['asset_family']=='hud-frames':
                solid=np.asarray(Image.open(r['path']).convert('RGBA'))[:,:,3]>10
                labels,n=ndimage.label(ndimage.binary_fill_holes(solid)&~solid)
                if n:
                    sizes=np.bincount(labels.ravel());sizes[0]=0;ys,xs=np.where(labels==sizes.argmax())
                    r['hud_interior_px']=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]
                else:r['codes'].append('HUD_INTERIOR_NOT_TRANSPARENT')
            if r['codes']:r['verdict']='reject'
            records.append(r)
    write_json(REPORT,records)
    make_contact_sheet(records,ART/'contact-sheets/story-gates.png','Story art / pixel gates / owner acceptance pending')
    print([(r['id'],r['codes']) for r in records],flush=True)

def proof(batch,note):
    group=[r for r in briefs(ROWS) if r['batch']==batch and r['status']=='ready']
    records=read_json(ART/'reports/story-proofs-graded.json')
    r=next(r for r in reversed(records) if r['brief']['id']==group[0]['id'])
    assert not r.get('codes') or all(c.startswith('VLM_') or c=='OWNER_ACCEPTANCE_PENDING' for c in r['codes'])
    assert r['verdict']!='reject' and len(r['grades'])==2
    assert all(g['status']=='graded' and g['image_hashes']==[r['source_sha256']] for g in r['grades'])
    assert sha(r['source'])==r['source_sha256'] and note
    write_json(ART/'proofs'/f'{batch}.json',dict(batch=batch,input_hash=fingerprint(group,style_for(group[0])),
        image=r['source'],sha256=r['source_sha256'],verdict='batch-direction-checked',
        reviewer='executing-agent technical inspection; NOT owner acceptance',note=note,at=now(),
        deterministic_report=str(REPORT.relative_to(ROOT)),local_grade_report='art/reports/story-proofs-graded.json'))
    print('Technical proof recorded; all asset approvals remain pending:',batch)

def review():
    folder=ART/'review/story';folder.mkdir(parents=True,exist_ok=True)
    graded=ART/'reports/story-attempts-graded.json'
    records=read_json(graded if graded.exists() else REPORT)
    direct_path=ART/'audits/story-direct-review.json'
    direct=read_json(direct_path) if direct_path.exists() else {}
    latest={r['brief']['logical_name']:r['id'] for r in records}
    selections=ART/'story-selections.json'
    if selections.exists():latest.update(read_json(selections)['candidates'])
    export_path=ART/'reports/story-exports-graded.json'
    exports={r['original_id']:r for r in read_json(export_path)} if export_path.exists() else {}
    order={}
    for row in briefs(ROWS):order.setdefault(row['logical_name'],len(order))
    records.sort(key=lambda r:(order[r['brief']['logical_name']],r['id']!=latest[r['brief']['logical_name']],r['id']))
    public=[];cards=[]
    for r in records:
        slug=r['brief']['logical_name'];out={**r,'owner_approved':False,'current':latest[slug]==r['id']}
        for name,key in [('sources','source'),('pixels','path')]:
            source=Path(r[key]);target=folder/name/(r['id']+source.suffix)
            target.parent.mkdir(exist_ok=True);shutil.copy2(source,target);out[key]=target.relative_to(folder).as_posix()
        sidecar=ROOT/r['generation_sidecar'];target=folder/'provenance'/(r['id']+'.json');target.parent.mkdir(exist_ok=True)
        shutil.copy2(sidecar,target);out['generation_sidecar']=target.relative_to(folder).as_posix()
        native=96 if r['kind'] in ('car','portrait') else 32 if r['kind']=='icon' else 256
        im=Image.open(r['path']).convert('RGBA');im.thumbnail((native,native),Image.Resampling.LANCZOS)
        target=folder/'native'/(r['id']+'.png');target.parent.mkdir(exist_ok=True);im.save(target)
        out['native']=target.relative_to(folder).as_posix();out['direct_review']=direct.get(r['id'],{})
        reference=''
        if r['brief'].get('reference'):
            ref=ROOT/r['brief']['reference'];target=folder/'references'/(r['id']+ref.suffix)
            target.parent.mkdir(exist_ok=True);shutil.copy2(ref,target)
            out['reference']=target.relative_to(folder).as_posix();out['reference_sha256']=sha(ref)
            reference=f'<p><a href="{out["reference"]}">Exact identity / edit reference</a></p>'
        menu=''
        if r['id'] in exports and out['current']:
            e=exports[r['id']];target=folder/'runtime'/(slug+'.png');target.parent.mkdir(exist_ok=True)
            source=ROOT/'assets/story-art'/(slug+'.png');assert sha(source)==e['source_sha256']
            shutil.copy2(source,target)
            out['runtime_export']={'path':target.relative_to(folder).as_posix(),'sha256':sha(target),
                'grades':e['grades'],'codes':e['codes'],'verdict':e['verdict']}
            observations=''.join('<p><b>'+html.escape(g['model'])+'</b>: '+html.escape(str(g.get('answers',g.get('error'))))+'</p>' for g in e['grades'])
            menu=f'<h3>Exact menu export (disabled pending owner review)</h3><p><a href="{out["runtime_export"]["path"]}">Packaged PNG</a> · SHA-256: {sha(target)}</p>{observations}'
        public.append(out)
        obs=''.join('<p><b>'+html.escape(g['model'])+'</b>: '+html.escape(str(g.get('answers',g.get('error'))))+'</p>' for g in r.get('grades',[]))
        codes=', '.join(r.get('codes',[])) or 'Pixel gates pass; owner decision pending'
        if out['direct_review'].get('technical_eligible') is False:codes='DIRECT INSPECTION: EXCLUDED. '+codes
        cards.append(f'''<article data-current="{str(out['current']).lower()}"><h2>{html.escape(slug.replace('-', ' ').title())}</h2>
<p class="pending">OWNER REVIEW PENDING · {'CURRENT' if out['current'] else 'EARLIER ATTEMPT'} · {html.escape(r['id'])}</p>
<div class="views"><a href="{out['source']}"><img class="source" src="{out['source']}" alt="Source {slug}"></a>
<div class="native"><img src="{out['native']}" width="{im.width}" height="{im.height}" alt="Actual-size {slug}"><p>Actual {im.width} × {im.height} px read</p></div></div>
<p><b>{html.escape(codes)}</b></p><p>{html.escape(str(out['direct_review'].get('note','Direct inspection pending')))}</p>{reference}
<details><summary>Both local graders, prompt and exact hashes</summary>{obs}<p>{html.escape(r['brief']['prompt_action'])}</p>
<p>Source SHA-256: {r['source_sha256']}<br>Processed preview SHA-256: {r['sha256']}</p><a href="{out['generation_sidecar']}">Guarded generation provenance</a> · <a href="{out['path']}">Processed preview pixels</a>{menu}</details></article>''')
    budget=Budget().summary()
    data={'schema':1,'at':now(),'budget':budget,'new_images':budget['images_reserved']-482,
          'owner_approved_count':0,'records':public,'rig_states':'Blocked until exact owner rig reference approval; no states generated.'}
    write_json(folder/'review.json',data)
    board=ROOT/'evidence/story-art/candidate-gl-board.png'
    extra=''
    if board.exists():
        shutil.copy2(board,folder/'menu-preview.png')
        extra='<p><a href="menu-preview.png">Local GL candidate board, including the stretched debt frame</a> · <a href="../../reports/story-bundle-validation.json">Menu texture validation</a></p><p>The board directly previews unapproved candidates. The game still uses its existing presentation; it is not a screenshot of approved gameplay.</p>'
    page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Death Ride — campaign story art owner review</title><style>
*{box-sizing:border-box}body{margin:0;background:#171513;color:#ddd0a6;font:17px/1.5 system-ui}main{max-width:1200px;margin:auto;padding:24px}h1{font-size:clamp(28px,5vw,48px);line-height:1.1}h2{margin:0;font-size:23px}a{color:#e6b767}article{background:#28221e;padding:20px;border:1px solid #574735;margin:24px 0;border-radius:8px}.pending{color:#e6b767}.views{display:flex;flex-wrap:wrap;gap:20px;align-items:center}.source{width:320px;max-width:100%;display:block}.views>a{max-width:100%}.native{padding:16px;background:#39302a}.native img{max-width:100%;object-fit:contain}details{overflow-wrap:anywhere}summary{cursor:pointer}button{font:inherit;padding:10px;background:#ddd0a6;color:#171513;border:0}header{border-bottom:2px solid #b4512d;padding-bottom:24px}.notice{border-left:4px solid #b4512d;padding-left:16px}</style><main>
<header><p>DEATH RIDE / CAMPAIGN STORY ART</p><h1>A debt. Four allies.<br>One last car running.</h1>
<p>Soot Pulp portraits and panels · Hot Ink ledger and meter · Rust and Ink rig</p>
<p class="notice">Every new image is pending your review. No new asset is approved or enabled in the game. The review presents candidates and failed attempts; machine grades cannot approve art.</p>
<p>BUDGET_REPLACE</p><p>Rig states are blocked until you approve the exact rig reference. Ox retains the established female portrait; current campaign prose uses masculine pronouns. This inherited inconsistency remains open.</p>
<p>Inspect the Mechanic's age and nervous helpfulness, continuity of the four allies, clear debt/seizure/reveal story beats, two-car duel and hopeful workshop ending. No baked text: game labels supply all names and amounts.</p>
<p><a href="review.json">Complete review data</a> · <a href="../../briefs/story-art.csv">Brief inventory</a></p>
<button id="attempts" onclick="document.querySelectorAll('[data-current=false]').forEach(e=>e.hidden=!e.hidden)">Show / hide earlier attempts</button></header>
'''.replace('BUDGET_REPLACE',f"{data['new_images']} new reserved images · {budget['images_reserved']} / 550 global · session limit 55 · stop: {html.escape(str(budget['stop']))}")
    page=page.replace('<button id="attempts"',extra+'<button id="attempts"')
    (folder/'index.html').write_text(page+'\n'.join(cards)+'<script>document.querySelectorAll("[data-current=false]").forEach(e=>e.hidden=true)</script></main></html>',encoding='utf-8')
    print((folder/'index.html').as_uri())

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['measure','proof','review']);p.add_argument('--batch');p.add_argument('--note');a=p.parse_args()
    if a.mode=='proof':proof(a.batch,a.note)
    else:globals()[a.mode]()
