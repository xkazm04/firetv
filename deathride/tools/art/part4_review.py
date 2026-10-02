"""Portable Part 4 owner review; never grants or replaces an owner approval."""
import copy
import html
import json
import shutil
from pathlib import Path
from PIL import Image, ImageDraw
from common import ART, ROOT, read_json, write_json, sha, now, file_lock
from gen import Budget
from part3_review import paste, FONT

OUT = ART/'review/fusion'
CLASSES = ('Needle', 'Comet', 'Quill', 'Kestrel')


def spend():
    start=read_json(ART/'audits/v2-part4-attempt-extension.json')['at']
    events=[json.loads(line) for line in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    reservations=[e for e in events if e.get('event')=='reserved' and e['at']>=start]
    ours=[e for e in reservations if e['asset'].startswith(('v2-part3-rework-', 'v2-part4-'))]
    other=[e for e in reservations if e not in ours]
    return {'at':now(), 'new_images':len(ours), 'other_task_new_images':len(other),
            'starting_weekly_images':401, 'budget':Budget().summary(), 'session_image_cap':120,
            'reservations':ours, 'other_reservations':other, 'videos':0}


def collect():
    manual=read_json(ART/'audits/v2-part4-direct-review.json')
    records={}
    for path in sorted((ART/'reports').glob('v2-part4-*-graded.json')):
        for item in read_json(path):
            if not item.get('source'):continue
            direct=manual.get(item['id'])
            if not direct:raise ValueError('direct inspection required: '+item['id'])
            assert direct['source_sha256']==item['source_sha256'] and direct['export_sha256']==item['sha256']
            pixel=read_json(path.with_name(path.name.replace('-graded.json','-deterministic.json')))
            measured=next(r for r in pixel if r['id']==item['id'])
            source='sources/'+item['id']+Path(item['source']).suffix.lower()
            pixels='pixels/'+item['id']+'.png'
            if Path(item['source']).resolve()!=(OUT/source).resolve():shutil.copyfile(item['source'],OUT/source)
            if Path(item['path']).resolve()!=(OUT/pixels).resolve():shutil.copyfile(item['path'],OUT/pixels)
            codes=sorted(set(measured['codes']+item['codes']+direct['codes']+['OWNER_APPROVAL_PENDING','HUMAN_CALIBRATION_PENDING']))
            verdict='reject' if measured['codes'] or direct['verdict']=='reject' else 'owner-review'
            if item.get('semantic_verdict')=='reject':
                if direct['verdict']=='reject':verdict='reject'
                else:codes.append('DIRECT_REVIEW_MODEL_DISAGREEMENT')
            records[item['id']]={'id':item['id'],'class':item['class'],'kind':'car','family':'cars','part':4,
                'role':'derived' if item['id'].startswith('v2-part4-') else 'rework',
                'verdict':verdict,'codes':codes,'pixel_codes':measured['codes'],'source':source,
                'source_sha256':item['source_sha256'],'pixels':pixels,'export_sha256':item['sha256'],
                'grades':item['grades'],'direct_review':direct,'metrics':item['metrics'],'placement':item['placement'],
                'brief':item['brief'],'owner_approved':False,'world_bundle_selected':False,'superseded':True,
                'frames':[],'repeat':None,'animation':None,'identity':{},'registration':None}
    return records


def publish():
    for name in ('index.html','review.json'):
        target=OUT/('part3-'+name)
        if not target.exists():shutil.copyfile(OUT/name,target)
    baseline=read_json(OUT/'part3-review.json')
    generated=collect();selection=read_json(ART/'part4-selections.json')['references']
    current={cls:generated[key] for cls,key in selection.items()}
    # Preserve owner writes, including approvals arriving while the run is active.
    with file_lock(ART/'.reference-approvals.lock'):
        ledger=read_json(ART/'reference-approvals.json')
        for cls,r in current.items():
            entry={'owner_approved':False,'owner_evidence':None,'source_sha256':r['source_sha256'],
                'candidate_source':'art/review/fusion/'+r['source'],'processed_sha256':r['export_sha256'],
                'pixel_codes':r['pixel_codes'],'style_file':'style-fusion.json','style_sha256':sha(ART/'style-fusion.json'),
                'review_page':'art/review/fusion/index.html','instruction':'Part 4 candidate. Only the owner may approve these exact source bytes.'}
            old=ledger['references'].get(r['id'])
            if old:
                assert old['source_sha256']==r['source_sha256'], 'never replace reviewed bytes'
            else:ledger['references'][r['id']]=entry
        write_json(ART/'reference-approvals.json',ledger)
    records=copy.deepcopy(baseline['records']);by_id={r['id']:r for r in records}
    for r in records:
        if r.get('role')=='rework' and r['class'] in CLASSES:r['superseded']=True
    for key,r in generated.items():
        if key in by_id:
            # Retained Needle/Quill keep their original Part 3 provenance.
            by_id[key]['part4_direct_review']=r['direct_review']
        else:records.append(r);by_id[key]=r
    for cls,key in selection.items():by_id[key]['superseded']=False
    feature_path=ART/'reports/v2-part4-features.json'
    if feature_path.exists():
        features=read_json(feature_path)
        for cls,key in selection.items():
            row=by_id[key];observations=[g for g in features if g['asset']==key and g['image_hashes'][0]==row['source_sha256']]
            row['feature_observations']=observations
            codes=[]
            if len(observations)!=2 or any(g['status']!='graded' for g in observations):codes.append('FEATURES_UNMEASURED')
            else:
                a,b=[g['answers'] for g in observations]
                for field in ('feature_a_visible','feature_b_visible','one_complete_attached_car','features_read_in_small_export'):
                    if a[field]!=b[field] or 'uncertain' in (a[field],b[field]):codes.append('FEATURE_REVIEW_'+field.upper())
                    elif a[field]=='no':codes.append('FEATURE_MISSING_'+field.upper())
                if min(a['confidence'],b['confidence'])<.85:codes.append('FEATURE_LOW_CONFIDENCE')
            row['codes']=sorted(set(row['codes']+codes))
    for r in records:
        approved=ledger['references'].get(r['id'],{})
        if approved.get('owner_approved'):
            assert approved['source_sha256']==r['source_sha256'] and approved.get('owner_evidence')
            r.update(owner_approved=True,owner_evidence=approved['owner_evidence'],verdict='owner-approved-reference')
    accounting=spend()
    review={**baseline,'at':now(),'part':4,'budget':accounting['budget'],'part4_spend':accounting,
        'part4_selected':selection,'part4_attempts':[r for r in generated.values() if r['id'] not in ('v2-part3-rework-needle-v1','v2-part3-rework-quill-v2')],
        'records':records,'approved_reference_count':sum(r.get('owner_approved',False) for r in records)}
    write_json(OUT/'review.json',review);write_json(ART/'reports/v2-part4-spend.json',accounting)
    originals={r['class']:r for r in baseline['records'] if r['id'].startswith('v2-fusion-cars-')}
    previous={r['class']:r for r in baseline['records'] if r.get('role')=='rework'}
    board=Image.new('RGBA',(1200,960),'#24201c');d=ImageDraw.Draw(board)
    d.text((15,15),'PART 4 | original / Part 3 / current candidate | approval belongs to the owner',font=FONT,fill='#ddd0a6')
    for i,cls in enumerate(CLASSES):
        x=i*300;r=by_id[selection[cls]]
        for y,label,source in [(55,'ORIGINAL',originals[cls]),(265,'PART 3',previous[cls]),(475,'CURRENT',r)]:
            d.text((x+12,y),cls+' '+label,font=FONT,fill='#ddd0a6')
            paste(board,OUT/source['pixels'],x+5,y+22,290,160)
        d.text((x+12,685),'96px before / after',font=FONT,fill='#ddd0a6')
        for offset,source in [(18,originals[cls]),(168,r)]:
            paste(board,OUT/source['pixels'],x+offset,715,96,66)
            d.rectangle((x+offset-5,785,x+offset+101,865),fill='#665e4c')
            paste(board,OUT/source['pixels'],x+offset,792,96,66,True)
        d.text((x+12,885),'Pixel gates: '+('PASS' if not r['pixel_codes'] else 'FAIL'),font=FONT,fill='#ddd0a6')
        d.text((x+12,910),'Owner: '+('approved' if r.get('owner_approved') else 'pending'),font=FONT,fill='#ddd0a6')
    board.convert('RGB').save(OUT/'part4-before-after.png')
    small=Image.new('RGBA',(800,230),'#665e4c');d=ImageDraw.Draw(small)
    d.text((15,10),'Native 96px colour and alpha silhouettes; no aspect stretching',font=FONT,fill='white')
    for i,cls in enumerate(CLASSES):
        r=by_id[selection[cls]];x=i*200+52
        paste(small,OUT/r['pixels'],x,45,96,66);paste(small,OUT/r['pixels'],x,115,96,66,True)
        d.text((i*200+15,200),cls,font=FONT,fill='white')
        for kind,silhouette in [('colour',False),('silhouette',True)]:
            native=Image.new('RGBA',(96,64),'#665e4c');paste(native,OUT/r['pixels'],0,0,96,64,silhouette)
            native.save(OUT/f'part4-{cls.lower()}-96-{kind}.png')
    small.convert('RGB').save(OUT/'part4-cars-96px.png')
    esc=html.escape;cards=[]
    for r in records:
        role=r.get('role','reference' if r['kind']=='car' else '')
        note=(r.get('part4_direct_review') or r.get('direct_review') or {}).get('note','')
        observations=''.join('<p><b>'+esc(g.get('model',''))+'</b>: '+esc(g.get('answers',{}).get('description',g.get('error','unmeasured')))+'</p>' for g in r.get('grades',[]))
        observations+=''.join('<p><b>Feature/96px '+esc(g.get('model',''))+'</b>: '+esc(g.get('answers',{}).get('description',g.get('error','unmeasured')))+'</p>' for g in r.get('feature_observations',[]))
        cards.append(f'<article data-family="{esc(r["family"])}" data-superseded="{str(r.get("superseded",False)).lower()}"><h3>{esc(r["class"])} {esc(role)}</h3><a href="{r["source"]}"><img loading="lazy" src="{r["pixels"]}" alt="{esc(r["id"])}"></a><p class="{r["verdict"]}">{esc(r["verdict"])}</p><p>{esc(", ".join(r["codes"]))}</p><p>{esc(note)}</p><details><summary>Exact source and local observations</summary><code>{r["source_sha256"]}</code>{observations}</details></article>')
    options=''.join('<option>'+esc(f)+'</option>' for f in sorted({r['family'] for r in records}))
    native=''.join(f'<div><b>{cls}</b><img width="96" height="64" src="part4-{cls.lower()}-96-colour.png" alt="{cls} at 96 pixels"><img width="96" height="64" src="part4-{cls.lower()}-96-silhouette.png" alt="{cls} silhouette at 96 pixels"></div>' for cls in CLASSES)
    table=''.join(f'<tr><td>{cls}</td><td>{by_id[key]["metrics"]["margin_fraction"]:.1%}</td><td>{by_id[key]["metrics"]["aspect"]:.3f}</td><td>{"pass" if not by_id[key]["pixel_codes"] else esc(", ".join(by_id[key]["pixel_codes"]))}</td><td>{"approved" if by_id[key].get("owner_approved") else "pending"}</td></tr>' for cls,key in selection.items())
    budget=accounting['budget'];new=accounting['new_images'];other=accounting['other_task_new_images']
    attempts=''.join('<li><a href="'+r['source']+'">'+esc(r['id'])+'</a> — '+esc(', '.join(r['codes']))+'</li>' for r in review['part4_attempts'])
    body='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride — Part 4 car review</title><style>
body{margin:0;background:#171513;color:#ddd0a6;font:16px/1.5 system-ui}main{max-width:1400px;margin:auto;padding:24px}h1{font-size:clamp(28px,5vw,52px);line-height:1.1}a{color:#e5b770}nav{display:flex;gap:18px;flex-wrap:wrap}section{margin:36px 0}.board{width:100%;height:auto}.callout{border-left:4px solid #b4512d;padding:8px 20px;background:#282018}#cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px}article{background:#24201c;border:1px solid #544332;padding:16px;min-width:0}article img{display:block;object-fit:contain;width:100%;height:210px;background:#39302a}code,li,article p{overflow-wrap:anywhere}code{font-size:11px}.reject{color:#ed9479}.owner-review{color:#d8cc86}.owner-approved-reference{color:#9dccaa}select{font:inherit;background:#39302a;color:#ddd0a6;padding:10px}article[hidden]{display:none}.native{display:flex;flex-wrap:wrap;gap:24px}.native div{display:grid;grid-template-columns:96px 96px;gap:8px}.native b{grid-column:span 2}table{border-collapse:collapse;font-size:14px}td,th{text-align:left;padding:8px;border-bottom:1px solid #544332}.scroll{overflow:auto}p{max-width:95ch}</style><main>
<p>ART DIRECTION V2 · PART 4 · 2026-10-02</p><h1>Four reworked car candidates.</h1>
<p>Silver steel Needle. Turbine-powered Comet with a reinforced rear. Bone-spiked Quill for front and rear contact. Electric Kestrel with an energised engine and one harpoon.</p>
<nav><a href="#reworks">Before / after</a><a href="#native">Native 96px silhouettes</a><a href="#world">All evidence</a><a href="part3-index.html">Part 3 families and history</a><a href="../../surface-lab/fusion-review.html">Surface A/B</a><a href="review.json">Full manifest</a></nav>
<div class="callout"><p>Fusion direction approved. Individual reworked references require the owner's exact-source approval. Pixel gates and local observations do not grant approval. No damage states or liveries for a pending reference.</p><p>'''+f'Part 4: {new} new image reservations; other shared-ledger work: {other}. Weekly {budget["images_reserved"]}/550; {budget["remaining"]} remaining. Zero videos; stop latch '+('SET' if budget['stop'] else 'clear')+'''.</p><p><a href="../../reference-approvals.json">Approval ledger</a> · <a href="../../V2-REFERENCE-APPROVAL.md">Approval format</a> · <a href="../../reports/v2-part4-validation.json">Validation</a></p></div>
<section id="reworks"><h2>Original, Part 3, current</h2><p>Needle and Quill retain their passing Part 3 pixels. Comet and Kestrel have new candidates. Rejected attempts remain below and in the archived review.</p><a href="part4-before-after.png"><img class="board" src="part4-before-after.png" alt="Four original, Part 3, and current car comparisons"></a><div class="scroll"><table><tr><th>Car</th><th>Source margin</th><th>Aspect</th><th>Pixel gates</th><th>Owner</th></tr>'''+table+'''</table></div></section>
<section id="native"><h2>Actual 96-pixel reads</h2><p>These images render at 96 CSS pixels wide. Colour and alpha silhouette use the same aspect-preserving scale.</p><div class="native">'''+native+'''</div></section>
<section id="world"><h2>Current candidates and preserved evidence</h2><p>The six approved reference families and fusion world retain their source bytes and earlier reviews. Enable superseded sources to inspect all Part 4 failures.</p><label>Asset family <select id="family"><option value="all">All</option>'''+options+'''</select></label> <label><input id="originals" type="checkbox"> Show superseded sources and failed attempts</label><div id="cards">'''+''.join(cards)+'''</div></section>
<details><summary>Every new Part 4 attempt</summary><ul>'''+attempts+'''</ul></details><p>Original designs only. Source margins are checked before extraction; no padded source or stretched silhouette earns a pass. Graders share Qwen architecture and are diagnostic; human calibration remains pending. No production atlas or runtime integration changes.</p></main><script>function filter(){const f=document.querySelector('#family').value,old=document.querySelector('#originals').checked;document.querySelectorAll('article').forEach(a=>a.hidden=(f!=='all'&&a.dataset.family!==f)||(!old&&a.dataset.superseded==='true'))}document.querySelector('#family').onchange=filter;document.querySelector('#originals').onchange=filter;filter()</script></html>'''
    (OUT/'index.html').write_text(body,encoding='utf-8')
    print('Published Part 4:',len(current),'selected references;',new,'new images;',budget)
    return review


if __name__=='__main__':publish()
