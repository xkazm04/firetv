"""Portable ART STATES owner review; reference approval and technical selection stay separate."""
import copy
import html
import shutil
from pathlib import Path
from PIL import Image
from common import ART, ROOT, read_json, write_json, sha, now
from gen import Budget
from part3_review import paste

OUT=ART/'review/fusion'
CLASSES=('Needle','Comet','Quill','Kestrel')


def publish():
    for name in ('index.html','review.json'):
        archive=OUT/('part4-'+name)
        if not archive.exists():shutil.copyfile(OUT/name,archive)
    baseline=read_json(OUT/'part4-review.json')
    attempts=read_json(ART/'reports/art-states-attempts-deterministic.json')
    current={r['id']:r for r in read_json(ART/'reports/art-states-current-deterministic.json')}
    grades={r['id']:r for r in read_json(ART/'reports/art-states-attempts-graded.json')}
    identity={r['id']:r for r in read_json(ART/'reports/art-states-attempts-identity.json')}
    manual=read_json(ART/'audits/art-states-direct-review.json')
    records=copy.deepcopy(baseline['records']);new=[]
    for attempt in attempts:
        r=current.get(attempt['id'],attempt);key=r['id'];direct=manual[key]
        assert direct['source_sha256']==r['source_sha256'] and direct['export_sha256']==r['sha256']
        source='sources/'+key+Path(r['source']).suffix.lower();pixels='pixels/'+key+'.png'
        shutil.copyfile(r['source'],OUT/source);shutil.copyfile(r['path'],OUT/pixels)
        g=grades[key];pair=identity[key]
        assert len(g['grades'])==2 and all(v['status']=='graded' and v['image_hashes'][0]==r['source_sha256'] for v in g['grades'])
        rejected=bool(r['codes']) or direct['verdict']=='reject'
        record={**r,'source':source,'pixels':pixels,'source_sha256':r['source_sha256'],'export_sha256':r['sha256'],
                'part':5,'family':'cars','role':'derived','pixel_codes':r['codes'],'grades':g['grades'],'identity':pair,
                'direct_review':direct,'codes':sorted(set(r['codes']+g['codes']+pair['codes']+direct.get('codes',[])+['HUMAN_CALIBRATION_PENDING','OWNER_DERIVATIVE_REVIEW_PENDING'])),
                'verdict':'reject' if rejected else 'technical-selected' if key in current else 'superseded',
                'superseded':key not in current,'owner_approved':False,'world_bundle_selected':False}
        record.pop('path',None);new.append(record)
        if r.get('registration'):
            reg=record['registration'];p=Path(reg['unregistered_path']);portable='pixels/'+key+'-unregistered.png'
            shutil.copyfile(p,OUT/portable);reg['unregistered_path']=portable
    records+=new
    ledger=read_json(ART/'reference-approvals.json')['references']
    for r in records:
        approval=ledger.get(r['id'],{})
        if approval.get('owner_approved'):
            assert approval['source_sha256']==r['source_sha256']
            r.update(owner_approved=True,verdict='owner-approved-reference',owner_evidence=approval['owner_evidence'])
            r['codes']=[c for c in r['codes'] if c not in ('OWNER_APPROVAL_PENDING','OWNER_ACCEPTANCE_PENDING')]
    budget=Budget().summary()
    evidence={'at':now(),'starting_reservations':433,'new_images':budget['images_reserved']-433,'budget':budget,
              'current_ids':list(current),'jobs':28,'attempts':sum(not r.get('derivation') for r in attempts),'reference_baselines':sum(bool(r.get('derivation')) for r in attempts),'reference_count':10,
              'runtime':'phase2-states: damage takes priority; healthy cars use stable seat-index bone/red/ochre/base liveries; no invented damage-by-livery cross product.'}
    review={**baseline,'at':now(),'part':5,'records':records,'approved_reference_count':10,'budget':budget,'art_states':evidence}
    write_json(OUT/'review.json',review);write_json(ART/'reports/art-states-spend.json',evidence)
    esc=html.escape;sections=[]
    for cls in CLASSES:
        cards=[]
        for r in new:
            if r['class']!=cls or r['superseded']:continue
            native=Image.new('RGBA',(96,64),'#39302a');paste(native,OUT/r['pixels'],0,0,96,64)
            native_name=r['id']+'-96.png';native.save(OUT/native_name)
            observations=''.join('<p><b>'+esc(g['model'])+'</b>: '+esc(g['answers']['description'])+'</p>' for g in r['identity']['observations'])
            label=r['brief']['id'].split(cls.lower()+'-',1)[1].rsplit('-v',1)[0]
            cards.append(f'<article><h3>{esc(label)}</h3><a href="{r["source"]}"><img class="frame" src="{r["pixels"]}" alt="{esc(cls+" "+label)}"></a><img class="native" width="96" height="64" src="{native_name}" alt="{esc(cls+" "+label)} at 96 pixels"><p>{esc(r["verdict"])}</p><p>{esc(r["direct_review"]["note"])}</p><details><summary>Identity observations and limits</summary>{observations}<p>{esc(", ".join(r["codes"]))}</p><code>{r["source_sha256"]}</code></details></article>')
        sections.append(f'<section id="{cls.lower()}"><h2>{cls}</h2><div class="cards">'+''.join(cards)+'</div></section>')
    rejected=''.join(f'<li><a href="{r["source"]}">{esc(r["id"])}</a>: {esc(r["direct_review"]["note"])}</li>' for r in new if r['superseded'])
    body='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride — states and liveries</title><style>
body{margin:0;background:#171513;color:#ddd0a6;font:16px/1.5 system-ui}main{max-width:1440px;margin:auto;padding:24px}a{color:#e5b770}h1{font-size:clamp(28px,5vw,52px);line-height:1.1}nav{display:flex;gap:20px;flex-wrap:wrap}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px}article{background:#24201c;border:1px solid #544332;padding:16px;min-width:0}.frame{display:block;width:100%;height:160px;object-fit:contain;background:#39302a}.native{display:block;width:96px;height:64px;margin:16px auto}code,li{overflow-wrap:anywhere}code{font-size:11px}section{margin:36px 0}.callout{border-left:4px solid #b4512d;padding:8px 20px;background:#282018}p{max-width:95ch}</style><main><p>ART STATES · 2026-10-02</p><h1>Four approved cars. Damage and liveries.</h1><p>Needle’s silver frame, Comet’s turbine cradle, Quill’s bone contact weapons and Kestrel’s coil engine and harpoon retain their exact approved reference identities.</p><nav>'''
    body+=''.join(f'<a href="#{c.lower()}">{c}</a>' for c in CLASSES)
    body+='''<a href="part4-index.html">Reference history</a><a href="part3-index.html">Earlier six families</a><a href="../../surface-lab/fusion-review.html">Fusion surfaces</a><a href="review.json">Complete evidence</a></nav><div class="callout"><p>All ten exact references are owner approved. These derived frames are executing-agent technical selections; local observations do not grant owner acceptance. Full-size sources, native 96-pixel reads and disagreements remain visible.</p>'''
    body+=f'<p>{evidence["new_images"]} new image reservations; shared weekly ledger {budget["images_reserved"]}/550, {budget["remaining"]} remaining. Zero videos. Stop latch '+('set' if budget['stop'] else 'clear')+'.</p>'
    body+='<p>Four states include an intact baseline. Three liveries change body-panel paint. At runtime damage takes priority over livery; missing art retains the procedural fallback. Cars pack losslessly into the existing two-page reserve.</p></div>'
    body+=''.join(sections)+'<section><h2>Consistency control</h2><p>One Comet bone-livery prompt, with and without the exact reference. Diagnostic only; the control does not ship.</p><a href="../../reports/art-states-consistency.json">Paired observations and silhouette overlap</a><img style="width:100%;height:auto" src="art-states-consistency.png" alt="Reference, conditioned edit and unconditioned control"></section><section><h2>Retained corrections</h2><ul>'+rejected+'</ul></section><p>Original designs only. Pixel thresholds remain unchanged. Human calibration and integrated device performance are not established by this review.</p></main></html>'
    (OUT/'index.html').write_text(body,encoding='utf-8')
    print('Published ART STATES',len(current),'current frames;',len(new),'attempts')


if __name__=='__main__':publish()
