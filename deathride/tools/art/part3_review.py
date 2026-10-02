"""Publish Part 3 alongside preserved Part 2 evidence, using portable exact bytes."""
import html
import shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from common import ART, ROOT, read_json, write_json, sha, now, make_contact_sheet
from grade import decide
from gen import Budget
from part3_setup import APPROVED, REWORK

OUT=ART/'review/fusion'
FONT=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',15)

def paste(canvas,path,x,y,w,h,silhouette=False):
    im=Image.open(path).convert('RGBA');im=im.crop(im.getbbox());im.thumbnail((w,h),Image.Resampling.LANCZOS)
    if silhouette:
        alpha=im.getchannel('A');im=Image.new('RGBA',im.size,'#101010');im.putalpha(alpha)
    canvas.alpha_composite(im,(x+(w-im.width)//2,y+(h-im.height)//2))

def collect(wave):
    path=ART/'reports'/(wave+'-current-deterministic.json')
    if not path.exists():return [],[]
    observations=[]
    for model in ('mimo-9b','qwen3.8'):
        p=ART/'reports'/(wave+'-attempts-'+model+'.json')
        observations.append({r['image_hashes'][0]:r for r in read_json(p)} if p.exists() else {})
    manual_path=ART/'audits/v2-part3-direct-review.json';manual=read_json(manual_path) if manual_path.exists() else {}
    identity_path=ART/'reports/v2-part3-derived-identity.json';identity={r['id']:r for r in read_json(identity_path)} if identity_path.exists() else {}
    current=read_json(path);attempts=read_json(ART/'reports'/(wave+'-attempts-deterministic.json'))
    def enrich(r):
        if not r.get('source'):return r
        r=dict(r);r['pixel_codes']=list(r['codes']);r['grades']=[m.get(r['source_sha256'],{}) for m in observations]
        semantic,codes=decide(r['grades'],'car',read_json(ART/'gates.json')['vlm_confidence_min'])
        direct=manual.get(r['id'],{}) or next((v for v in manual.values() if v.get('source_sha256')==r['source_sha256'] and v.get('export_sha256')==r['sha256']),{})
        if direct and (direct.get('source_sha256')!=r['source_sha256'] or direct.get('export_sha256')!=r['sha256']):raise ValueError('stale direct inspection '+r['id'])
        pair=identity.get(r['id'],{})
        r.update(direct_review=direct,identity=pair)
        r['codes']=sorted(set(r['codes']+codes+direct.get('codes',[])+pair.get('codes',[])+['OWNER_APPROVAL_PENDING','HUMAN_CALIBRATION_PENDING']))
        r['verdict']='reject' if r['pixel_codes'] or direct.get('verdict')=='reject' or pair.get('verdict')=='reject' else 'owner-review'
        if semantic=='reject':
            if direct and direct.get('verdict')!='reject':r['codes'].append('DIRECT_REVIEW_MODEL_DISAGREEMENT')
            else:r['verdict']='reject'
        if not direct:r['codes'].append('DIRECT_REVIEW_PENDING')
        return r
    return [enrich(r) for r in current],[enrich(r) for r in attempts]

def portable(r,attempt=False):
    if not r.get('source'):return {'id':r['id'],'class':r['class'],'verdict':'unmeasured','codes':r['codes'],'source':None,'brief':r['brief']}
    suffix=Path(r['source']).suffix.lower();source='sources/'+r['id']+suffix;pixels='pixels/'+r['id']+'.png'
    shutil.copyfile(r['source'],OUT/source);shutil.copyfile(r['path'],OUT/pixels)
    record={'id':r['id'],'class':r['class'],'family':'cars','kind':'car','verdict':r['verdict'],'codes':r['codes'],'pixel_codes':r['pixel_codes'],'source':source,'source_sha256':sha(OUT/source),'pixels':pixels,'export_sha256':sha(OUT/pixels),'grades':r['grades'],'direct_review':r['direct_review'],'identity':r['identity'],'metrics':r['metrics'],'placement':r['placement'],'brief':r['brief'],'owner_approved':False,'world_bundle_selected':False,'superseded':False,'frames':[],'repeat':None,'animation':None,'repeat_sha256':None,'animation_sha256':None,'part':3}
    record['role']='rework' if 'rework-' in r['id'] else 'control' if 'consistency-control' in r['id'] else 'derived'
    record['registration']=dict(r['registration']) if r.get('registration') else None
    if record['registration']:
        original='pixels/'+r['id']+'-unregistered.png'
        shutil.copyfile(record['registration']['unregistered_path'],OUT/original)
        record['registration']['unregistered_path']=original
    if attempt:record['role']='attempt'
    return record

def main():
    for name in ('index.html','review.json'):
        archived=OUT/('part2-'+name)
        if not archived.exists():shutil.copyfile(OUT/name,archived)
    baseline=read_json(OUT/'part2-review.json');ledger=read_json(ART/'reference-approvals.json')
    rows=[];attempts=[]
    for wave in ('v2-part3-reworks','v2-part3-derived','v2-part3-control'):
        current,history=collect(wave);rows+=current;attempts+=history
    current=[portable(r) for r in rows if r.get('source')];history=[portable(r,True) for r in attempts]
    reworks={r['class']:r for r in current if r['role']=='rework'}
    original={r['class']:r for r in baseline['records'] if r['kind']=='car'}
    for r in baseline['records']:
        approval=ledger['references'].get(r['id'],{})
        r['owner_approved']=approval.get('owner_approved',False)
        if r['owner_approved']:
            r['owner_evidence']=approval['owner_evidence'];r['verdict']='owner-approved-reference';r['codes']=[c for c in r['codes'] if c!='OWNER_APPROVAL_PENDING']
        if r['kind']=='car' and r['class'] in reworks:r['superseded']=True
    # Pending candidates are bound to exact new bytes, never granted approval here.
    for cls,r in reworks.items():
        entry={'owner_approved':False,'source_sha256':r['source_sha256'],'owner_evidence':None,'candidate_source':'art/review/fusion/'+r['source'],'processed_sha256':r['export_sha256'],'pixel_codes':r['pixel_codes'],'style_file':'style-fusion.json','style_sha256':sha(ART/'style-fusion.json'),'review_page':'art/review/fusion/index.html','instruction':'Part 3 owner rework candidate; exact-source owner approval required before derived generation.'}
        existing=ledger['references'].get(r['id'],{})
        if existing.get('owner_approved'):raise ValueError('never overwrite approval '+r['id'])
        ledger['references'][r['id']]=entry
    write_json(ART/'reference-approvals.json',ledger)
    board=Image.new('RGBA',(1200,720),'#24201c');draw=ImageDraw.Draw(board)
    draw.text((16,15),'OWNER CHANGES | previous above / rework below | four references remain unapproved',font=FONT,fill='#ddd0a6')
    for i,cls in enumerate(REWORK):
        x=i*300;before=original[cls];after=reworks.get(cls)
        paste(board,OUT/before['pixels'],x,65,300,185)
        draw.text((x+12,48),cls+' BEFORE',font=FONT,fill='#ddd0a6')
        if after:
            paste(board,OUT/after['pixels'],x,285,300,185);draw.text((x+12,265),cls+' AFTER: '+after['verdict'],font=FONT,fill='#e5b770')
            draw.text((x+12,480),'96px BEFORE',font=FONT,fill='#ddd0a6');draw.text((x+162,480),'96px AFTER',font=FONT,fill='#ddd0a6')
            paste(board,OUT/before['pixels'],x+29,505,96,62);paste(board,OUT/after['pixels'],x+179,505,96,62)
            draw.rectangle((x+12,572,x+140,640),fill='#665e4c');draw.rectangle((x+162,572,x+290,640),fill='#665e4c')
            paste(board,OUT/before['pixels'],x+29,575,96,62,True);paste(board,OUT/after['pixels'],x+179,575,96,62,True)
            import textwrap
            for j,line in enumerate(textwrap.wrap(', '.join(after['pixel_codes']) or 'Pixel gates pass; owner pending',31)):
                draw.text((x+12,655+j*18),line,font=FONT,fill='#ddd0a6')
    board.convert('RGB').save(OUT/'part3-before-after.png')
    roster={**original,**reworks};im=Image.new('RGBA',(1000,370),'#665e4c');d=ImageDraw.Draw(im)
    d.text((16,12),'Actual 96px car lengths / alpha silhouettes / aspect preserved',font=FONT,fill='white')
    for i,(cls,r) in enumerate(roster.items()):
        x=(i%5)*200;y=50+(i//5)*155;paste(im,OUT/r['pixels'],x+52,y,96,64);paste(im,OUT/r['pixels'],x+52,y+65,96,64,True);d.text((x+12,y+130),cls,font=FONT,fill='white')
    im.convert('RGB').save(OUT/'part3-cars-96px.png')
    for cls in APPROVED:
        ref=original[cls];family=[{'id':cls+' approved reference','path':str(OUT/ref['pixels']),'verdict':'owner-approved exact source','codes':[]}]
        for r in rows:
            if r['class']==cls and r.get('source') and r['brief'].get('requires_approval'):
                family.append({**r,'id':r['id'].replace('v2-part3-'+cls.lower()+'-','').rsplit('-v',1)[0],'codes':r['pixel_codes']+r['direct_review'].get('codes',[])})
        make_contact_sheet(family,OUT/('part3-family-'+cls.lower()+'.png'),cls+' | approved reference + four states + three liveries | derivatives unapproved')
    allrecords=baseline['records']+current;budget=Budget().summary();cap=read_json(ART/'budget.json')['weekly_image_cap']
    review={'at':now(),'part':3,'budget':budget,'weekly_cap':cap,'part_reservations':budget['images_reserved']-338,'owner_approved':False,'approved_reference_count':6,'records':allrecords,'part3_attempts':history}
    write_json(OUT/'review.json',review)
    esc=html.escape
    cards=[]
    for r in allrecords:
        approval='owner-approved reference' if r.get('owner_approved') else r['verdict'];direct=r.get('direct_review') or {}
        label=r.get('role','reference' if r['kind']=='car' else '')
        if label=='derived':label=r['id'].replace('v2-part3-'+r['class'].lower()+'-','').rsplit('-v',1)[0].replace('-', ' ')
        observations=''.join('<p><b>'+esc(g.get('model',''))+'</b>: '+esc(g.get('answers',{}).get('description',g.get('error','unmeasured')))+'</p>' for g in r.get('grades',[]))
        if r.get('owner_approved'):observations='<p><b>Owner evidence:</b> '+esc(r['owner_evidence'])+'</p>'+observations
        identity=r.get('identity',{})
        for g in identity.get('observations',[]):observations+='<p><b>Identity '+esc(g['model'])+'</b>: '+esc(g.get('answers',{}).get('description',g.get('error','unmeasured')))+'</p>'
        cards.append('<article data-family="'+r['family']+'" data-superseded="'+str(r.get('superseded',False)).lower()+'"><h3>'+esc(r['class'])+' '+esc(label)+'</h3><a href="'+r['source']+'"><img loading="lazy" src="'+r['pixels']+'" alt="'+esc(r['id'])+'"></a><p class="'+r['verdict']+'">'+esc(approval)+'</p><p>'+esc(', '.join(r['codes']))+'</p><p>'+esc(direct.get('note',''))+'</p><details><summary>Source and local observations</summary><code>'+r['source_sha256']+'</code>'+observations+('</details>'))
        if r.get('animation'):cards[-1]+='<p><a href="'+r['animation']+'">Play exported animation</a></p>'
        if r.get('repeat'):cards[-1]+='<p><a href="'+r['repeat']+'">2 by 2 repeat</a></p>'
        cards[-1]+='</article>'
    families=sorted({r['family'] for r in allrecords});sheets=''.join('<figure><a href="part3-family-'+c.lower()+'.png"><img class="board" src="part3-family-'+c.lower()+'.png" alt="'+c+' states and liveries"></a><figcaption>'+c+'</figcaption></figure>' for c in APPROVED)
    attempts_html=''.join('<li><a href="'+r['source']+'">'+r['id']+'</a> — '+esc(', '.join(r['pixel_codes']) or 'pixel gates pass')+'</li>' for r in history)
    status=f"Part 3: {budget['images_reserved']-338} image reservations. Weekly {budget['images_reserved']}/{cap}; {budget['remaining']} remaining; zero videos; stop latch {'SET' if budget['stop'] else 'clear'}."
    outcome=f"{sum(r['role']=='rework' for r in current)}/4 reworks, {sum(r['role']=='derived' for r in current)}/42 derivatives, {sum(r['role']=='control' for r in current)}/1 unconditioned control generated."
    body='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride — Part 3 car review</title><style>
body{margin:0;background:#171513;color:#ddd0a6;font:16px/1.5 system-ui}main{max-width:1400px;margin:auto;padding:24px}h1{font-size:clamp(28px,5vw,52px);line-height:1.1}a{color:#e5b770}nav{display:flex;gap:18px;flex-wrap:wrap}section{margin:40px 0}.board{width:100%;height:auto}figure{margin:24px 0}#cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px}article{background:#24201c;border:1px solid #544332;padding:16px;min-width:0}article img{display:block;object-fit:contain;width:100%;height:210px;background:#39302a}code{overflow-wrap:anywhere;font-size:11px}.reject{color:#ed9479}.owner-review{color:#d8cc86}.owner-approved-reference{color:#9dccaa}select{font:inherit;background:#39302a;color:#ddd0a6;padding:10px}p{max-width:95ch}details{font-size:14px}article[hidden]{display:none}.callout{border-left:4px solid #b4512d;padding:8px 20px;background:#282018}li{overflow-wrap:anywhere}</style><main>
<p>ART DIRECTION V2 · PART 3 · 2026-10-02</p><h1>Four car reworks. Six approved identities.</h1>
<p>Rust and Ink cars with the shared fusion palette, neutral light and worn materials. The owner's six accepted references are locked to their exact reviewed source bytes.</p>
<nav><a href="#reworks">Before / after</a><a href="#families">Damage & liveries</a><a href="#world">All assets</a><a href="../../surface-lab/fusion-review.html">Stick A/B</a><a href="part2-index.html">Previous review</a><a href="review.json">Full evidence</a></nav>
<div class="callout"><p><b>Approved references: Line, Bastion, Trail, Flint, Vandal and Bulwark.</b> Needle, Comet, Quill and Kestrel remain unapproved. Derived images and local model observations do not grant further owner approval.</p><p><b>Rework holds:</b> Comet still fails source margin; the single-harpoon Kestrel fails margin and aspect. Both reached three attempts. Needle and Quill pass pixel gates.</p><p>'''+esc(outcome)+'''</p><p>'''+esc(status)+'''</p><p><a href="../../reference-approvals.json">Exact approval ledger</a> · <a href="../../reports/v2-part3-validation.json">Part 3 validation</a></p></div>
<section id="reworks"><h2>The owner's four changes</h2><p>Needle: silver steel. Comet: air turbines and a reinforced rear. Quill: medium-weight contact fighter with bone-like front and rear spikes. Kestrel: over-energised engine and electric harpoon.</p><img class="board" src="part3-before-after.png" alt="Four car before and after comparisons"><img class="board" src="part3-cars-96px.png" alt="Ten car 96 pixel silhouettes"></section>
<section id="families"><h2>Approved identity families</h2><p>Each sheet starts with the exact approved reference, followed by intact, light damage, heavy damage, wreck, and bone, dried-red and ochre liveries. Each generated edit uses the approved reference directly. Four states include the intact baseline. Derivatives await owner review; failures remain labelled.</p>'''+sheets+'''<h3>Consistency control</h3><img class="board" src="part3-consistency.png" alt="Approved Line, reference-conditioned livery and unconditioned control"><p>One matched prompt pair: silhouette overlap is 0.998 with the approved image supplied and 0.928 without it. The control also fails the source-margin gate. This small diagnostic is not a general performance or quality claim. <a href="../../reports/v2-part3-consistency.json">Exact comparison evidence</a></p></section>
<section id="world"><h2>Cars and the preserved fusion world</h2><p>World kit, rivals and measured surfaces retain their earlier evidence. Show superseded sources to inspect the original four cars and eleven world repairs.</p><nav><a href="world-contact.png">World contact sheet</a><a href="../../fusion-obstacles-selected.json">Obstacle metadata</a><a href="../../../assets/phase2-fusion/catalog.json">World catalog</a><a href="../../surface-lab/fusion-review.html">Measured surface A/B</a></nav><p><label>Asset family <select id="family"><option value="all">All</option>'''+''.join('<option>'+f+'</option>' for f in families)+'''</select></label> <label><input id="originals" type="checkbox"> Show superseded sources</label></p><div id="cards">'''+''.join(cards)+'''</div></section>
<details><summary>Every Part 3 generated attempt (including rejected sources)</summary><ul>'''+attempts_html+'''</ul></details><p>Original designs only. Source margins are measured before trimming; failed sources are not repaired by padding or stretching. Machine grades are diagnostic; human calibration and integrated gameplay validation remain separate.</p></main><script>function filter(){const f=document.querySelector('#family').value,old=document.querySelector('#originals').checked;document.querySelectorAll('article').forEach(a=>a.hidden=(f!=='all'&&a.dataset.family!==f)||(!old&&a.dataset.superseded==='true'))}document.querySelector('#family').onchange=filter;document.querySelector('#originals').onchange=filter;filter()</script></html>'''
    (OUT/'index.html').write_text(body,encoding='utf-8')
    print('Published',len(current),'current Part 3 sources,',len(history),'attempts;',status)

if __name__=='__main__':main()
