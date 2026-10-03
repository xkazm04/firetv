"""Rework measurement, cached local grading, technical proof and offline owner comparison."""
import argparse
import html
import shutil
from pathlib import Path
import urllib.request
import json
from PIL import Image
from common import ART, ROOT, briefs, read_json, write_json, sha, now, style_for, make_contact_sheet, digest
from gen import Budget, candidates, fingerprint
from process import process_one
from grade import MODELS, HOST, ask, post, decide

def rows(part): return briefs(ART/f'briefs/rework2-{part}.csv')
def report(part): return ART/f'reports/rework2-{part}.json'

def measure(part):
    prior={r['id']:r for r in read_json(report(part))} if report(part).exists() else {}
    records=[]
    for row in rows(part):
        for path in candidates(row):
            s=read_json(path)
            if s['status']!='generated':continue
            assert sha(s['image'])==s['sha256'] and s['prompt_verbatim_verified']
            key=row['id']+f"-a{s['attempt']}";cached=prior.get(key,{})
            if (cached.get('measure_version')==2 and cached.get('source_sha256')==s['sha256'] and
                cached.get('brief')==row and Path(cached.get('path','')).is_file() and
                sha(cached['path'])==cached.get('sha256') and
                cached.get('gates_hash')==digest(read_json(ART/'gates.json')) and cached.get('style_hash')==digest(style_for(row)) and
                cached.get('processor_sources',{}).get('process.py')==sha(ROOT/'tools/art/process.py')):
                records.append(cached);continue
            r=process_one(row,s['image'],ART/'processed/rework2'/row['id']/str(s['attempt']))
            if part=='faces' and row['kind']=='backdrop':
                im=Image.open(r['path']).convert('RGBA');im.thumbnail((512,512),Image.Resampling.LANCZOS);im.save(r['path'])
                r['sha256']=sha(r['path']);r['metrics']['export_size_px']=list(im.size)
            r['id']+=f"-a{s['attempt']}"
            r.update(attempt=s['attempt'],generation_sidecar=str(path.relative_to(ROOT)),owner_approved=False,measure_version=2)
            old=prior.get(r['id'],{})
            if old.get('source_sha256')==r['source_sha256'] and old.get('sha256')==r['sha256']:
                for field in ('grades','semantic_verdict','semantic_codes','direct_review','face_gate','face_grades'):
                    if field in old:r[field]=old[field]
            records.append(r)
    write_json(report(part),records)
    make_contact_sheet(records,ART/f'contact-sheets/rework2-{part}.png',part+' / gates / NO owner acceptance')
    print([(r['id'],r['codes']) for r in records],flush=True)

def grade(part):
    records=read_json(report(part))
    tags=json.load(urllib.request.urlopen(HOST+'/api/tags'))
    available={m['name']:m for m in tags['models']}
    for model in MODELS:
        assert 'vision' in available[model]['capabilities']
        for r in records:
            g=ask(r,model,available[model]['digest'])
            r['grades']=[v for v in r.get('grades',[]) if v['model']!=model]+[g]
            write_json(report(part),records)
        post('/api/generate',{'model':model,'keep_alive':0})
    for r in records:
        r['semantic_verdict'],r['semantic_codes']=decide(r['grades'],r['kind'],.85)
    write_json(report(part),records)

def direct(part,asset,note,eligible):
    records=read_json(report(part));r=next(r for r in records if r['id']==asset)
    r['direct_review']=dict(source_sha256=r['source_sha256'],export_sha256=r['sha256'],note=note,
      technical_eligible=eligible,at=now(),reviewer='executing agent; not owner acceptance')
    write_json(report(part),records)

def proof(part,batch,note):
    group=[r for r in rows(part) if r['batch']==batch and r['status']=='ready']
    r=next(r for r in reversed(read_json(report(part))) if r['brief']['id']==group[0]['id'])
    assert not r['codes'] and len(r.get('grades',[]))==2
    assert all(g['status']=='graded' and g['image_hashes']==[r['source_sha256']] for g in r['grades'])
    assert r.get('direct_review',{}).get('technical_eligible') and note
    if part=='faces':assert r.get('face_gate',{}).get('passed')
    write_json(ART/'proofs'/f'{batch}.json',dict(batch=batch,input_hash=fingerprint(group,style_for(group[0])),
      image=r['source'],sha256=r['source_sha256'],verdict='batch-direction-checked',
      reviewer='executing-agent technical screening; NOT owner acceptance',note=note,at=now(),
      report=str(report(part).relative_to(ROOT))))
    print('Technical proof recorded:',batch,flush=True)

def eligible(r):
    return (not r['codes'] and decide(r.get('grades',[]),r['kind'],.85)[0]!='reject' and
      len(r.get('grades',[]))==2 and all(g['status']=='graded' and g['image_hashes']==[r['source_sha256']] for g in r['grades']) and
      r.get('direct_review',{}).get('technical_eligible',False) and
      r['direct_review']['source_sha256']==r['source_sha256'] and r['direct_review']['export_sha256']==r['sha256'] and
      (r['brief'].get('face_subject','')!='yes' or r.get('face_gate',{}).get('passed',False)))

BEFORE={'scrap-pile':'crate-metal','tyre-wall':'tyres','oil-drums':'drum-red','rust-pylon':'sign',
 'league-gantry':'sign','derelict-crane':'crate','wreck-car':'crate-metal','quarry-face':'rock-field',
 'slag-heap':'rock-field','salt-crust':'soft-dune','dead-brush':'brush','league-hoarding':'sign',
 'smelter-stacks':'drum','sluice-gate':'crate-metal','guard-rail':'sign','rock-fall':'rock-field'}

def review():
    folder=ART/'review/rework2';folder.mkdir(parents=True,exist_ok=True)
    shutil.copy2(ROOT/'audio/report.css',folder/'report.css')
    js=(ROOT/'audio/report.js').read_text(encoding='utf-8').replace('Owner listening draft.','Owner art review draft.').replace('deathride/audio/OWNER-AUDIO-CHOICE.md','your owner art review reply')
    (folder/'report.js').write_text(js,encoding='utf-8')
    all_records=[];cards=[];rejected=[]
    for part in ('environment','faces'):
        if not report(part).exists():continue
        rs=read_json(report(part));selected={}
        for r in rs:
            if eligible(r):selected[r['brief']['logical_name']]=r['id']
        for r in rs:
            current=selected.get(r['brief']['logical_name'])==r['id']
            if not current:
                rejected.append(dict(id=r['id'],codes=r['codes'],semantic_codes=r.get('semantic_codes',[]),
                  face_gate=r.get('face_gate'),direct_review=r.get('direct_review'),owner_approved=False))
                continue
            slug=r['brief']['logical_name'].split('/')[-1]
            dest=folder/'images';dest.mkdir(exist_ok=True)
            after=dest/(r['id']+'.png');shutil.copy2(r['path'],after)
            source=dest/(r['id']+'-source'+Path(r['source']).suffix);shutil.copy2(r['source'],source)
            before=None
            if part=='environment':
                name=BEFORE.get(slug,slug)
                old=next((x for x in read_json(ART/'reports/v4-fusion-current-deterministic.json') if x['brief']['logical_name']=='props/'+name),None)
                if old:
                    before=ART/'review/fusion/pixels'/(old['id']+'.png')
                    if not before.exists():before=ART/'review/fusion/sources'/('v4-fusion-props-'+name+'-v1.jpg')
            else:before=ROOT/r['brief']['before_path']
            if before and before.exists():
                before_dest=dest/(r['id']+'-before'+before.suffix);shutil.copy2(before,before_dest)
                before_view=f'<figure><img src="images/{before_dest.name}" alt="Before {slug}"><figcaption>Before</figcaption></figure>'
            else:raise RuntimeError('Before image missing: '+r['id'])
            native=60 if part=='faces' and r['kind']=='portrait' else 112 if part=='faces' else 64
            im=Image.open(after).convert('RGBA');im.thumbnail((native,native),Image.Resampling.LANCZOS)
            native_path=dest/(r['id']+'-native.png');im.save(native_path)
            item={**r,'path':'images/'+after.name,'source':'images/'+source.name,'native':'images/'+native_path.name,
              'owner_approved':False,'current':True,'part':part}
            if before and before.exists():item['before']='images/'+before_dest.name
            all_records.append(item)
            evidence=html.escape(json.dumps({k:r.get(k) for k in ('codes','semantic_codes','grades','face_gate','face_grades','direct_review')},indent=2))
            cards.append(f'''<article class="card" data-direction="{r['id']}" data-label="{html.escape(r['brief']['logical_name'])}" data-samples="{r['id']} / {r['sha256']}">
<h2>{html.escape(r['brief']['logical_name'])}</h2><p>Owner decision pending</p>
<div class="comparison">{before_view}<figure><a href="images/{source.name}"><img src="images/{after.name}" alt="After {slug}"></a><figcaption>After — candidate</figcaption></figure></div>
<div class="native"><img src="images/{native_path.name}" width="{im.width}" height="{im.height}" alt="Native {slug}"><p>Actual {im.width} × {im.height} pixel read</p></div>
<p>{html.escape(r['direct_review']['note'])}</p><details><summary>Defects, local grades and exact hashes</summary><pre>{evidence}</pre></details></article>''')
    environment=read_json(ART/'rework2-environment.json')
    for logical,retained in environment.get('retained_visuals',{}).items():
        # An explicit existing material reuse is a separate review item, never a new generated pass.
        src=ROOT/retained['source'];assert sha(src)==retained['source_sha256']
        before=folder/'images/retained-soft-dune.png';shutil.copy2(src,before)
        id='rw2-retained-soft-dune'
        all_records.append(dict(id=id,part='retained',current=True,source='images/'+before.name,path='images/'+before.name,
          source_sha256=sha(before),sha256=sha(before),owner_approved=False,retained_visual=retained))
        cards.append(f'''<article class="card" data-direction="{id}" data-label="Retained natural dune" data-samples="{retained['asset_id']} / {sha(before)}"><h2>Natural dune — retained exact fusion material</h2>
<p>{html.escape(retained['reason'])}</p><div class="comparison"><figure><img src="images/{before.name}" alt="Existing natural dune"><figcaption>Before</figcaption></figure><figure><img src="images/{before.name}" alt="Unchanged retained natural dune"><figcaption>After — exact existing asset reused</figcaption></figure></div>
<p>The renderer keeps the existing keyed atlas pixels and gameplay footprint. This source view shows its historical extraction key. No new approval is inferred.</p></article>''')
    extra=''
    board=ROOT/'evidence/rework2/environment-atlas.png'
    if board.exists():
        shutil.copy2(board,folder/'environment-atlas.png')
        extra='<p><a href="environment-atlas.png">Actual local GL atlas board and procedural fallback marks</a> — deliberate candidate preview, not approved gameplay.</p>'
    budget=Budget().summary()
    data=dict(schema=1,at=now(),budget=budget,new_images=budget['images_reserved']-510,owner_approved_count=0,
      records=all_records,excluded=rejected)
    write_json(folder/'review.json',data)
    page=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride — Campaign art rework 2</title>
<link rel="stylesheet" href="report.css"><style>.comparison{{display:grid;grid-template-columns:1fr 1fr;gap:12px}}figure{{margin:0;min-width:0}}figure img{{display:block;width:100%;aspect-ratio:1;object-fit:contain;background:#39302a}}.native{{background:#39302a;color:#ddd0a6;padding:12px;margin-top:12px}}.native img{{display:block;max-width:none}}.cards{{grid-template-columns:1fr}}details pre{{max-height:450px;overflow:auto}}@media(min-width:1000px){{.cards{{grid-template-columns:1fr 1fr}}}}</style>
<body data-round="deathride.art.rework2" data-page-title="Campaign art rework 2"><main><h1>The league leaves marks.<br>The people have faces.</h1>
<p>Before / after owner review. Rust and Ink environments; Soot Pulp faces. Every new item remains unapproved and disabled. Keep, Maybe or Reject records your preference; it does not bypass technical or exact-byte approval gates.</p>
<p>{data['new_images']} new image reservations; {budget['images_reserved']}/700 total. {len(rejected)} failed or superseded attempts withheld from the candidate gallery; their defect records remain in <a href="review.json">review.json</a>. No quota latch reset.</p>
<p><a href="../story/index.html">Earlier story review</a> · <a href="../../rework2-environment.json">Theme and footprint catalog</a></p>
<p>Original league hoarding copy, drawn by the game font: <b>THE TRACK COLLECTS</b> · <b>YOUR DEBT. OUR FINISH.</b> · <b>WIN THE HEAT. KEEP THE RECEIPT.</b> Generated boards remain blank beneath that type.</p>{extra}
<div class="report-toolbar"><label>Theme <select id="theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label hidden><input id="matched" type="checkbox">Matched</label><button id="copy">Copy Markdown</button><button id="refresh-export">Preview Markdown</button></div><p id="status" role="status"></p><div id="winner-fields" hidden></div>
<section class="cards">{''.join(cards)}</section><section class="export review-section"><h2>Your review</h2><textarea id="export" aria-label="Markdown export" readonly></textarea></section></main><script src="report.js"></script></body></html>'''
    (folder/'index.html').write_text(page,encoding='utf-8');print((folder/'index.html').as_uri(),flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['measure','grade','direct','proof','review']);p.add_argument('--part',default='environment');p.add_argument('--batch');p.add_argument('--asset');p.add_argument('--note');p.add_argument('--reject',action='store_true');a=p.parse_args()
    if a.mode=='review':review()
    elif a.mode=='proof':proof(a.part,a.batch,a.note)
    elif a.mode=='direct':direct(a.part,a.asset,a.note,not a.reject)
    else:globals()[a.mode](a.part)
