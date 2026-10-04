"""Portable owner review, blank choices, audio report interactions and exact provenance."""
import html
import json
from pathlib import Path
import shutil
from PIL import Image
from common import ART, ROOT, briefs, now, read_json, write_json, sha
from agy_provider import AgyBudget
from agy_pipeline import pipeline
from regions_delivery import TOOLBAR, FOOT

REVIEW=ART/'review/agy'
def e(value):return html.escape(str(value),quote=True)
def copy(path,name):
    path=Path(path);target=REVIEW/'images'/name;target.parent.mkdir(parents=True,exist_ok=True)
    if not target.exists() or sha(path)!=sha(target):shutil.copy2(path,target)
    return 'images/'+name
def header(title,key):
    return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)}</title><link rel="stylesheet" href="report.css"><link rel="stylesheet" href="agy.css"></head><body data-round="deathride.art.agy.{key}.v1" data-page-title="{e(title)}"><main><h1>{e(title)}</h1>'

def card(r):
    id=r['id'];label=r['brief']['logical_name'];figures=[]
    def figure(path,name,caption):
        link=copy(path,name)
        with Image.open(path) as im:caption+=f' ({im.width} × {im.height})'
        figures.append(f'<figure><a href="{link}"><img src="{link}" alt="{e(caption)}"></a><figcaption>{e(caption)}</figcaption></figure>')
        return link
    parent=r.get('before_source') or r['brief'].get('before_source') or r.get('parent_source')
    if parent:
        path=Path(parent);path=path if path.is_absolute() else ROOT/path
        figure(path,id+'-before-source'+path.suffix,'Before: original full-resolution source')
    source_path=Path(r['source'])
    if r.get('origin')=='reuse':
        kept=next(x for x in read_json(ART/'review/rework2/review.json')['records'] if x['id']==r['prior_owner_evidence']['asset_id'])
        source_path=ART/'review/rework2'/kept['source']
        assert sha(source_path)==r['prior_owner_evidence']['source_sha256']
    source=figure(source_path,id+'-source'+source_path.suffix,'Original full-resolution source; click for original pixels')
    path=figure(r['path'],id+'.png','Actual gated export')
    before_export=r.get('before_export') or r['brief'].get('before_export')
    if before_export:figure(before_export,id+'-before-export.png','Before: kept export at its original resolution')
    if r.get('repeat_path'):figure(r['repeat_path'],id+'-repeat.png','Actual 2 by 2 ground repeat')
    if r.get('frames_preview'):figure(r['frames_preview'],id+'-frames.png','Actual exported animation cells')
    if r.get('animation_preview'):figure(r['animation_preview'],id+'.gif','Animation preview of actual cells')
    im=Image.open(r['path']).convert('RGBA');im.thumbnail((112,112),Image.Resampling.LANCZOS)
    native=REVIEW/'images'/(id+'-native.png');im.save(native)
    ok=pipeline.eligible(r) if r.get('region') else False
    note=r.get('direct_review',{}).get('note','Direct inspection pending; no owner approval.')
    status='Previously kept pixels; regional assignment pending' if r.get('origin')=='reuse' else ('Technical candidate; owner review pending' if ok else 'Technical hold; existing fallback remains')
    evidence={k:v for k,v in r.items() if k not in ('brief',)}
    markup=f'<article class="card" data-direction="{id}" data-label="{e(label)}" data-samples="{id} / {r["sha256"]}"><h2>{e(label)}</h2><p><b>{status}</b></p><div class="comparison">'+''.join(figures)+f'</div><div class="native"><img src="images/{native.name}" width="{im.width}" height="{im.height}" alt="Native read"><p>Native {im.width} × {im.height} px read</p></div><p>{e(note)}</p><p>Gate codes: {e(", ".join(r.get("codes",[])) or "none")}</p><details><summary>Provenance, local grading and technical evidence</summary><pre>{e(json.dumps(evidence,indent=2))}</pre></details></article>'
    return markup,dict(id=id,source=source,path=path,sha256=r['sha256'],source_sha256=sha(source_path),owner_approved=False,runtime_enabled=False,technical_eligible=ok)

def main():
    REVIEW.mkdir(parents=True,exist_ok=True)
    shutil.copy2(ROOT/'audio/report.css',REVIEW/'report.css')
    js=(ROOT/'audio/report.js').read_text(encoding='utf-8').replace('Owner listening draft.','Owner art draft.').replace('deathride/audio/OWNER-AUDIO-CHOICE.md','your owner art review reply')
    (REVIEW/'report.js').write_text(js,encoding='utf-8')
    (REVIEW/'agy.css').write_text('[hidden]{display:none!important}.cards{grid-template-columns:1fr}.comparison{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}figure{margin:0;min-width:0}figure img{width:100%;height:320px;object-fit:contain;background:#39302a}.native{padding:12px;background:#39302a}.native img{max-width:none}details pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:400px;overflow:auto}.export textarea{min-height:220px}nav{display:flex;flex-wrap:wrap;gap:16px}.swatches{display:flex;flex-wrap:wrap;gap:8px}.swatches span{padding:12px;border:1px solid #777}.gap{border-left:4px solid #a37738}h2{overflow-wrap:anywhere}@media(max-width:600px){.comparison{grid-template-columns:1fr}figure img{height:260px}}',encoding='utf-8')
    rs=pipeline.records();catalog=read_json(ART/'regions/catalog.json')['regions'];budget=AgyBudget().summary()
    stop=f'<p class="gap"><b>Generation stopped.</b> {e(budget["stop"]["reason"])}. No retries or further image calls. Missing items remain explicit below.</p>' if budget['stop'] else ''
    nav='<nav><a href="index.html">Overview</a>'+''.join(f'<a href="{r["id"]}.html">{e(r["name"])}</a>' for r in catalog)+'<a href="restoration.html">Restoration and repair</a></nav>'
    data=dict(schema=1,at=now(),budget=budget,owner_approved_count=0,runtime_enabled_count=0,region_pages=[],records=[],gaps=[])
    for reg in catalog:
        rid=reg['id'];cards=[];regional=[r for r in rs if r['region']==rid]
        for r in regional:
            markup,record=card(r);cards.append(markup);data['records'].append(dict(record,region=rid))
        for row in pipeline.rows():
            if row['region']!=rid or any(r['brief']['id']==row['id'] for r in regional):continue
            id=row['id'];data['gaps'].append(dict(id=id,region=rid))
            cards.append(f'<article class="card gap" data-direction="{id}" data-label="{e(row["logical_name"])} [brief only; missing image]" data-samples="NO IMAGE — {id}"><h2>{e(row["class"])}</h2><p>Missing image. Review controls apply to the brief only.</p><p>{e(row["prompt_action"])}</p><p>Current procedural/existing art remains; weather disabled.</p></article>')
        palette='<div class="swatches">'+''.join(f'<span><i style="display:block;height:30px;background:{v}"></i>{e(k)} {e(v)}</span>' for k,v in reg['palette'].items())+'</div>'
        intro=nav+stop+f'<p>{e(reg["plot"])}</p><p>{e(reg["climate"])}</p>'+palette+f'<p>Agy reservations: {budget["images_reserved"]}/120; real allowance unknown. Grok remains stopped at 582/850. No new owner approvals or runtime activation.</p><p>All picks start blank. Full sources, actual exports and native reads are separate. Regional weather cap: {reg["weather_cap"]}; one active region only. Runtime delta is zero; no Stick measurement.</p>'
        (REVIEW/(rid+'.html')).write_text(header(reg['name'],rid)+intro+TOOLBAR+'<section class="cards">'+''.join(cards)+'</section>'+FOOT,encoding='utf-8')
        data['region_pages'].append(dict(region=rid,file=rid+'.html',cards=len(cards)))
    restoration=read_json(ART/'reports/agy-restoration.json') if (ART/'reports/agy-restoration.json').exists() else []
    cards=[];data['restoration_gaps']=[]
    for r in restoration:
        markup,record=card(r);cards.append(markup);data['records'].append(dict(record,region='restoration'))
    ledger=read_json(ART/'owner-approvals-2026-10-03.json')['assets']
    for row in briefs(ART/'briefs/agy-restoration.csv'):
        if any(r['brief']['id']==row['id'] for r in restoration):continue
        id=row['id'];entry=ledger[row['logical_name']];assert entry['decision']=='Keep'
        source=copy(row['reference'],id+'-before'+Path(row['reference']).suffix)
        old=copy(ROOT/entry['archived_export'],id+'-kept-export.png')
        data['restoration_gaps'].append(dict(id=id,source=source,before_export=old,source_sha256=sha(row['reference']),status='not-attempted; provider stopped'))
        cards.append(f'<article class="card gap" data-direction="{id}" data-label="{e(row["logical_name"])} restoration [planned only]" data-samples="NO AFTER IMAGE — {id} / before {entry["source_sha256"]}"><h2>{e(row["logical_name"])} restoration</h2><p><b>Not attempted: provider empty-output stop.</b> These are the unchanged kept source and export. No restoration or resolution improvement is claimed.</p><div class="comparison"><figure><a href="{source}"><img src="{source}" alt="Original full-resolution source"></a><figcaption>Before: full-resolution source</figcaption></figure><figure><a href="{old}"><img src="{old}" alt="Kept export"></a><figcaption>Before: kept export</figcaption></figure></div><p>Keep/Maybe/Reject reviews the planned restoration brief only; there is no edited candidate.</p></article>')
    repair=next((r for r in rs if r['id']=='agy-foundry-casting-ladle-v1-a1'),None)
    if repair and not any(r.get('origin')=='edit-margin-repair' for r in restoration):
        id='agy-casting-ladle-margin-repair';source=copy(repair['source'],id+'-before.png');old=copy(repair['path'],id+'-before-export.png')
        data['restoration_gaps'].append(dict(id=id,source=source,before_export=old,source_sha256=repair['source_sha256'],status='not-attempted; provider stopped'))
        cards.append(f'<article class="card gap" data-direction="{id}" data-label="repair/casting-ladle-margin [planned only]" data-samples="NO AFTER IMAGE — {id}"><h2>Cropped-margin edit repair</h2><p><b>Not attempted: provider empty-output stop.</b> The actual source fails CROPPED_OR_MARGIN. A framing-only edit is briefed; there is no after-image or successful repair claim.</p><div class="comparison"><figure><a href="{source}"><img src="{source}" alt="Failing margin source"></a><figcaption>Before: hook tips too close to edges</figcaption></figure><figure><a href="{old}"><img src="{old}" alt="Failing candidate export"></a><figcaption>Before: actual export</figcaption></figure></div><p>Plan: preserve every part and uniformly zoom out, leaving clear magenta around the subject. Owner controls review this plan only.</p></article>')
    ox=copy(ART/'review/fusion/sources/v2-fusion-portraits-ox-v1.jpg','retained-original-ox.jpg')
    context=f'<details><summary>Original Ox remains retained</summary><p>The owner kept original Ox and rejected the replacement. That rejected replacement is not edited or proposed here.</p><a href="{ox}"><img src="{ox}" width="160" alt="Retained original Ox"></a></details>'
    (REVIEW/'restoration.html').write_text(header('Restoration and margin repair','restoration')+nav+stop+'<p>Before/after experiments preserve the kept designs. These are candidate edits, not replacements or approvals. Detail improvement and design drift must be judged at full resolution as well as native size. Only the scrap-pile edit was generated before the stop; other cards are explicit unattempted plans.</p>'+context+TOOLBAR+'<section class="cards">'+''.join(cards)+'</section>'+FOOT,encoding='utf-8')
    data['region_pages'].append(dict(region='restoration',file='restoration.html',cards=len(cards)))
    write_json(REVIEW/'review.json',data)
    (REVIEW/'index.html').write_text(header('Death Ride — agy owner art review','index')+nav+stop+f'<p>{len(data["records"])} candidate/reuse records; {len(data["gaps"])} missing region briefs (including kept-prop variants). Agy {budget["images_reserved"]}/120 reservations, actual allowance unknown. Grok remains latched.</p><p>Open a region or the restoration comparison to choose Keep, Maybe or Reject, add notes and Copy Markdown. No picks are inferred and no candidate changes production.</p><p><a href="../../reports/agy-candidates.json">Region gate and local grading evidence</a> · <a href="../../usage-agy.json">Spend ledger</a> · <a href="../../audits/a1-empty-output.json">Empty-output stop</a> · <a href="../../audits/a1-extra-call.json">Extra-call audit</a> · <a href="../../regions/agy-atlas-plan.json">Inactive candidate plan</a></p></main></body></html>',encoding='utf-8')
    print((REVIEW/'index.html').as_uri())

if __name__=='__main__':main()
