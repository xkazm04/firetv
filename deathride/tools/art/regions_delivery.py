"""Portable offline owner pages and a budgeted, inactive regional atlas plan."""
import argparse
import html
import json
from pathlib import Path
import shutil
from PIL import Image
from common import ART, ROOT, now, read_json, write_json, sha
from gen import Budget, candidates, quota_evidence
from atlas import pack_group
from regions_pipeline import CATALOG, REPORT, records, rows, eligible, semantic_codes

REVIEW=ART/'review/regions'
PACK=ART/'regions/candidate-pack'

def audit():
    start=read_json(ART/'audits/g1-start.json');events=[json.loads(s) for s in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    reservations=[e for e in events if e.get('event')=='reserved' and e.get('asset','').startswith('g1-')]
    attempts=[]
    for row in rows():
        for path in candidates(row):
            side=read_json(path);log=path.parent/'cli-output.txt';output=log.read_text(encoding='utf-8')
            # Preserve original sidecars/history. This audit explains their incorrect classification.
            attempts.append(dict(asset=row['id'],at=side['timestamp'],original_status=side['status'],
              image_tool_calls=len(side.get('image_tool_calls',[])),sidecar=str(path.relative_to(ROOT)),sidecar_sha256=sha(path),
              log=str(log.relative_to(ROOT)),log_sha256=sha(log),detected_quota=quota_evidence(output),
              error_excerpt='API error (status 402 Payment Required): Grok Build usage balance exhausted' if 'Grok Build usage balance exhausted' in output else side.get('error','')))
    attempts.sort(key=lambda a:a['at']);summary=Budget().summary()
    data=dict(schema=1,at=now(),starting_budget=start['budget'],ending_budget=summary,new_reservations=len(reservations),
      successful_new_images=sum(r['origin']=='generated' for r in records()),observed_image_tool_calls=sum(a['image_tool_calls'] for a in attempts),
      videos=0,audio_calls=0,dollar_cost='not reported by provider; no estimate invented',reservations_refunded=0,
      first_quota_error=attempts[0] if attempts else None,attempts=attempts,
      incident='Existing detector missed HTTP 402 Payment Required / usage balance exhausted. Sixteen proof reservations ran; first-error stop requirement was not met. Manual inspection latched stop; no latch cleared, no transport retry, no image tool invocation. All reservations remain charged.',
      guard_before_sha256=start['generator_sha256'],guard_after_sha256=sha(ROOT/'tools/art/gen.py'),
      correction='Recognise contextual HTTP 402 and exhausted usage balance; stop dispatching further groups after any non-generated result; check latch before each group.',
      resumption='Blocked by a real provider quota latch. No automatic resume/retry or latch reset. Missing items remain gaps. A later authorised recovery must inspect provider state and retain this incident.')
    write_json(ART/'audits/g1-quota-incident.json',data);return data

def pack(pack_root=PACK,plan_path=ART/'regions/atlas-plan.json',candidate_records=None,candidate_rows=None):
    PACK=Path(pack_root)
    PACK.mkdir(parents=True,exist_ok=True);rs=records() if candidate_records is None else candidate_records;region_plans=[];alltiles=[];pages=[];panels=[]
    requested=rows() if candidate_rows is None else candidate_rows
    for reg in read_json(CATALOG)['regions']:
        rid=reg['id'];folder=PACK/rid;folder.mkdir(exist_ok=True)
        selected=[r for r in rs if r['region']==rid and eligible(r) and r['origin']!='reuse']
        sprites=[r for r in selected if r['kind'] in ('sprite','sheet')]
        local_pages=pack_group('region-'+rid,sprites,folder,max_pages=1) if sprites else []
        for p in local_pages:pages.append({**p,'file':rid+'/'+p['file']})
        tiles=[];local_panels=[]
        for r in selected:
            if r['kind'] not in ('tile','backdrop'):continue
            dest=folder/(r['id']+'.png');shutil.copy2(r['path'],dest);im=Image.open(dest)
            e=dict(id=r['id'],file=dest.relative_to(PACK).as_posix(),sha256=sha(dest),width=im.width,height=im.height,rgba_bytes=im.width*im.height*4,
              owner_approved=False,runtime_enabled=False,source_sha256=r['source_sha256'],kind=r['kind'],
              fallback=r['fallback'],wrap='Repeat' if r['kind']=='tile' else 'ClampToEdge',mipmaps=False,filter='Linear',
              replacement_slot=('tiles/'+{'asphalt':'asphalt-worn','clinker':'gravel','salt-crust':'dirt'}.get(r['class'],r['class'])) if r['kind']=='tile' else 'active-region-'+r['class'])
            (tiles if r['kind']=='tile' else local_panels).append(e)
        aliases=[dict(id=r['id'],existing_asset_id=r['prior_owner_evidence']['asset_id'],source=r['prior_owner_evidence']['archived_export'],
          sha256=r['sha256'],owner_evidence=r['prior_owner_evidence']['owner_evidence'],new_owner_approval=False,
          regional_placement_approved=False,additional_resident_bytes=0) for r in rs if r['region']==rid and r['origin']=='reuse']
        missing=[dict(id=row['id'],logical_name=row['logical_name'],kind=row['kind'],reason='provider quota; no candidate image',
          fallback='existing procedural prop/material/backdrop; weather disabled',runtime_enabled=False,owner_approved=False)
          for row in requested if row['region']==rid and not any(r['brief']['id']==row['id'] and eligible(r) for r in rs)]
        alltiles+=tiles;panels+=local_panels
        region_plans.append(dict(region=rid,pages=[{**p,'file':rid+'/'+p['file']} for p in local_pages],tiles=tiles,panels=local_panels,reuse_aliases=aliases,
          missing=missing,proposed_prop_metadata=reg['props'],weather_cap=reg['weather_cap'],atmosphere_budget=reg['atmosphere_budget'],
          candidate_bytes_on_disk=sum(p['rgba_bytes'] for p in local_pages+tiles+local_panels),resident_policy='Only active division; replace matching slots; unload prior region first'))
    data=dict(schema=1,at=now(),status='partial G1; all staged art inactive and owner-unapproved',baseline_bundle='assets/phase2-states',
      baseline_manifest_sha256=sha(ROOT/'assets/phase2-states/manifest.json'),pages=pages,tiles=alltiles,panels=panels,regions=region_plans,
      residency=dict(baseline_mib=31.25,current_runtime_mib=31.25,current_runtime_delta_bytes=0,
        current_candidate_swap_projection_mib=31.25,complete_kit_projection_mib=30.25,car_pages_or_reserve_mib=8,
        unused_track_edge_replaced_mib=4,regional_page_max_mib=4,old_backdrop_replaced_mib=4,new_panels_max_mib=3,
        active_regions_max=1,new_material_slots=0,material_slot_bytes=256*256*4,mipmaps=False,
        activation_prerequisites=['Exact owner Keep decisions','All technical gates and proof chronology pass','G2 track restart complete',
          'Loader replaces material slots, excludes old track-edge autotile and old backdrop allocation','Prior region unloaded before loading next','Stick delta measured in G2/G3']),
      budget_warning='Full-kit 30.25 MiB projection requires all listed replacements. Current ground-only candidate swaps retain 31.25 MiB. No new runtime allocation is made in G1.',
      fallback_policy='Missing/rejected/stale/unapproved candidate uses current procedural/existing art; weather disabled; no geometry or physics change')
    write_json(plan_path,data);print('Staged',len(alltiles),'material candidates,',len(pages),'new sprite pages; no runtime activation.',flush=True);return data

def copy_image(source,name):
    target=REVIEW/'images'/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target);return 'images/'+name

def e(text):return html.escape(str(text),quote=True)

def header(title,key):
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)} — Death Ride</title>
<link rel="stylesheet" href="report.css"><link rel="stylesheet" href="regions.css"></head><body data-round="deathride.art.regions.{key}.v1" data-page-title="{e(title)}"><main>'''

TOOLBAR='''<div class="report-toolbar"><label>Theme <select id="theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label hidden><input id="matched" type="checkbox">Matched</label><button id="copy">Copy Markdown</button><button id="refresh-export">Preview Markdown</button></div><p id="status" role="status"></p><div id="winner-fields" hidden></div>'''
FOOT='''<section class="export review-section"><h2>Your review</h2><textarea id="export" aria-label="Markdown export" readonly></textarea></section></main><script src="report.js"></script></body></html>'''

def review():
    REVIEW.mkdir(parents=True,exist_ok=True);rs=records();incident=read_json(ART/'audits/g1-quota-incident.json');plan=read_json(ART/'regions/atlas-plan.json')
    shutil.copy2(ROOT/'audio/report.css',REVIEW/'report.css')
    js=(ROOT/'audio/report.js').read_text(encoding='utf-8').replace('Owner listening draft.','Owner region art draft.').replace('deathride/audio/OWNER-AUDIO-CHOICE.md','your owner region art review reply')
    (REVIEW/'report.js').write_text(js,encoding='utf-8')
    (REVIEW/'regions.css').write_text('''[hidden]{display:none!important}h1{max-width:24ch}.cards{grid-template-columns:1fr}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0;min-width:0}figure img{display:block;width:100%;aspect-ratio:1;object-fit:contain;background:#39302a}.native{padding:12px;background:#39302a;color:#ddd0a6}.native img{display:block;max-width:none}.swatches{display:flex;flex-wrap:wrap;gap:8px}.swatch{min-width:95px;padding:8px;border:1px solid #777;border-radius:6px}.swatch i{display:block;height:35px;margin-bottom:4px;border:1px solid #777}.gap{border-left:4px solid #a37738}.badge{font-weight:bold}.prose{max-width:80ch}details pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:400px;overflow:auto}nav{display:flex;gap:15px;flex-wrap:wrap;margin:20px 0}.export textarea{min-height:230px}.review-controls textarea{min-height:75px}.meta{font-size:.9rem} @media(min-width:1100px){.cards{grid-template-columns:1fr 1fr}}''',encoding='utf-8')
    data=dict(schema=1,at=now(),owner_approved_count=0,runtime_enabled_count=0,budget=incident['ending_budget'],new_reservations=incident['new_reservations'],
      generated_images=incident['successful_new_images'],region_pages=[],records=[],gaps=[])
    nav='<nav><a href="index.html">Overview</a>'+''.join(f'<a href="{r["id"]}.html">{e(r["name"])}</a>' for r in read_json(CATALOG)['regions'])+'</nav>'
    for reg in read_json(CATALOG)['regions']:
        rid=reg['id'];cards=[];regional=[r for r in rs if r['region']==rid]
        for r in regional:
            id=r['id'];img=copy_image(r['path'],id+'.png')
            parent=ROOT/r['parent_source'] if r.get('parent_source') else Path(r['source'])
            source=copy_image(parent,id+'-source'+parent.suffix)
            native=Image.open(r['path']).convert('RGBA');native.thumbnail((96,96),Image.Resampling.LANCZOS)
            native_path=REVIEW/'images'/(id+'-native.png');native.save(native_path)
            label=r['brief']['logical_name'];status='Previously kept exact pixels; proposed regional reuse' if r['origin']=='reuse' else ('Technical candidate; owner decision pending' if eligible(r) else 'Technical hold; fallback remains')
            note=r.get('direct_review',{}).get('note') or 'Exact prior kept export; no regeneration, recolouring or new approval. Its proposed regional placement and footprint are unapproved.'
            figures=f'<figure><a href="{source}"><img src="{source}" alt="Source {e(label)}"></a><figcaption>Existing source, unchanged</figcaption></figure><figure><a href="{img}"><img src="{img}" alt="Candidate {e(label)}"></a><figcaption>{"Exact reused export" if r["origin"]=="reuse" else "Region recolour, 256 px"}</figcaption></figure>'
            extras=''
            if r.get('repeat_path'):
                repeat=copy_image(r['repeat_path'],id+'-repeat.png');extras+=f'<figure><a href="{repeat}"><img src="{repeat}" alt="Actual 2 by 2 repeat {e(label)}"></a><figcaption>Actual 2×2 repeat; click for native pixels</figcaption></figure>'
            if r.get('frames_preview'):
                frames=copy_image(r['frames_preview'],id+'-frames.png');extras+=f'<figure><img src="{frames}" alt="Actual exported frames {e(label)}"><figcaption>Actual 64 px cells</figcaption></figure>'
            evidence={k:r.get(k) for k in ('origin','parent_source','parent_sha256','source_sha256','sha256','recipe','codes','metrics','grades','direct_review','prior_owner_evidence')}
            evidence['semantic_codes']=semantic_codes(r) if r['origin']!='reuse' else [];evidence['fallback']=r['fallback']
            prop=next((p for p in reg['props'] if p['id']==r['class']),None)
            if prop:evidence['proposed_metadata']=prop
            cards.append(f'''<article class="card" data-direction="{id}" data-label="{e(label)}" data-samples="{id} / {r['sha256']}"><h2>{e(label.split('/')[-1])}</h2><p class="badge">{e(status)}</p><div class="comparison">{figures}</div>{extras}<div class="native"><img src="images/{native_path.name}" width="{native.width}" height="{native.height}" alt="Native {e(label)}"><p>Actual {native.width} × {native.height} pixel preview</p></div><p>{e(note)}</p><details><summary>Hashes, gates, local observations and fallback</summary><pre>{e(json.dumps(evidence,indent=2))}</pre></details></article>''')
            data['records'].append(dict(id=id,region=rid,label=label,path=img,source=source,sha256=r['sha256'],source_sha256=sha(parent),
              native='images/'+native_path.name,origin=r['origin'],technical_eligible=eligible(r),owner_approved=False,runtime_enabled=False))
        for row in rows():
            if row['region']!=rid or any(r['brief']['id']==row['id'] and eligible(r) for r in regional):continue
            id=row['id'];attempts=[a for a in incident['attempts'] if a['asset']==id];state='Proof failed: provider balance exhausted' if attempts else 'Not called: proof/quota gate closed'
            prop=next((p for p in reg['props'] if p['id']==row['class']),None)
            details=dict(brief=row,attempts=attempts,proposed_metadata=prop,fallback='Current procedural/existing art; weather disabled')
            cards.append(f'''<article class="card gap" data-direction="{id}" data-label="{e(row['logical_name'])} [brief only; missing image]" data-samples="NO IMAGE — {id}"><h2>{e(row['class'])}</h2><p class="badge">Missing image — {e(state)}</p><p>{e(row['prompt_action'])}</p><p>Keep/Maybe/Reject here reviews the proposed brief only. There is no image to approve or activate. Existing fallback remains.</p><details><summary>Brief, footprint and attempt evidence</summary><pre>{e(json.dumps(details,indent=2))}</pre></details></article>''')
            data['gaps'].append(dict(id=id,region=rid,state=state,owner_approved=False))
        swatches='<div class="swatches">'+''.join(f'<div class="swatch"><i style="background:{v}"></i>{e(k)}<br><code>{v}</code></div>' for k,v in reg['palette'].items())+'</div>'
        ambience='<p>Later ambience hooks: '+', '.join(e(h) for h in reg['ambience_hooks'])+'. No audio generated.</p>'
        budget=f'<p>Weather proposal: ≤{reg["weather_cap"]} live sprites within the shared 96-slot pool; ≥72 reserved for combat. Presentation only. G1 runtime texture delta: 0 bytes. Ground swaps replace existing 256² material slots; full-kit plan 30.25 MiB is conditional on the documented replacements. No Stick measurement.</p>'
        top=f'''<h1>{e(reg['name'])}</h1><p>Division: <b>{e(rid)}</b> · Boss: {e(reg['boss'])} · Ally: {e(reg['ally'])}</p><p class="prose">{e(reg['plot'])}</p><p>{e(reg['climate'])}</p>{nav}{swatches}<p class="badge">G1 partial: provider quota stopped new generation. 16 reservations, 0 new generated images, ledger 582/850. Stop remains latched.</p><p>All controls start blank. New items and regional assignments are unapproved and inactive. Existing kept pixels are explicitly labelled. Copy Markdown records your review; it does not change production files.</p>{budget}{ambience}<details><summary>Backdrop, horizon and weather design</summary><p>{e(reg['backdrop'])}</p><p>{e(reg['horizon'])}</p><pre>{e(json.dumps(reg['atmosphere'],indent=2))}</pre></details><p><a href="../../regions/atlas-plan.json">Atlas and residency plan</a> · <a href="../../audits/g1-quota-incident.json">Quota incident and spend</a> · <a href="review.json">Portable inventory</a></p>'''
        (REVIEW/(rid+'.html')).write_text(header(reg['name'],rid)+top+TOOLBAR+'<section class="cards">'+''.join(cards)+'</section>'+FOOT,encoding='utf-8')
        data['region_pages'].append(dict(region=rid,file=rid+'.html',cards=len(cards),candidates=len(regional),missing=len([g for g in data['gaps'] if g['region']==rid])))
    write_json(REVIEW/'review.json',data)
    page=header('Region art review','index')+f'''<h1>Five places the league has consumed</h1>{nav}<p>G0 complete; G1 partially delivered. This is an offline owner review of 16 ground recolours and 11 memberships using the four previously kept props. All 59 requested generated assets remain missing because Grok Build reports an exhausted balance.</p><p>The old guard missed HTTP 402: 16 proof reservations ran before manual inspection latched the stop. No image tool was invoked. The detector is corrected, no latch was cleared and all reservations remain charged. Current ledger: 582/850. No Stick access, runtime change, track edits or audio spend.</p><p>Open a region to review its palette, plot, current candidates and missing briefs with Keep, Maybe or Reject, notes and Copy Markdown. No owner picks are inferred.</p><ul>'''+''.join(f'<li><a href="{r["file"]}">{e(r["region"])}</a>: {r["candidates"]} candidate/reuse entries, {r["missing"]} missing generated assets.</li>' for r in data['region_pages'])+'''</ul><p><a href="../../regions/atlas-plan.json">Inactive atlas plan</a> · <a href="../../audits/g1-quota-incident.json">Quota incident</a> · <a href="../../../../docs/concepts/deathride/G0-region-bible.md">G0 bible</a> · <a href="../../../../docs/concepts/deathride/G1-region-assets.md">G1 results</a></p></main></body></html>'''
    (REVIEW/'index.html').write_text(page,encoding='utf-8');print((REVIEW/'index.html').as_uri(),flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['audit','pack','review']);a=p.parse_args();globals()[a.mode]()
