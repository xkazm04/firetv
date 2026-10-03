"""Publish the applied decision inventory; reuse existing review images and GL screenshots."""
import html
import os
from pathlib import Path
from common import ROOT,ART,read_json,write_json
from owner_art_validation import validate_owner_art

OUT=ROOT/'evidence/owner-decisions/art';OUT.mkdir(parents=True,exist_ok=True)
ledger=read_json(ART/'owner-approvals-2026-10-03.json')
report=validate_owner_art()
report['theme_sets']=read_json(ART/'rework2-environment.json')['theme_sets']
report['theme_gaps']=read_json(ART/'rework2-environment.json')['gaps']
report['residency']=dict(declared_atlas_with_reserve_mib=31.25,desktop_atlas_mib=18.75,
    worst_story_menu_bytes=read_json(ART/'reports/story-bundle-validation.json')['worst_menu_rgba_bytes'],
    scope='Atlas residency is unchanged; story scenes additionally obey the existing 1.5 MiB and shared-headroom limits. No device measurement.')
report['decisions']=ledger['assets']
write_json(OUT/'report.json',report)
esc=html.escape
link=lambda p:Path(os.path.relpath(p,OUT)).as_posix()
cards=[];rejects=[]
for name,a in ledger['assets'].items():
    if a['decision']=='Keep':
        cards.append(f'<article><h3>{esc(name)}</h3><img src="{link(ROOT/a["archived_export"])}" alt="{esc(name)} exact kept export"><p>Active, exact delivered export.</p><details><summary>Approved hashes</summary><p>Source: <code>{a["source_sha256"]}</code></p><p>Export: <code>{a["export_sha256"]}</code></p></details></article>')
    else:rejects.append(f'<tr><td>{esc(name)}</td><td>{esc(a["fallback"])}</td><td><code>{a["asset_id"]}</code></td></tr>')
gaps=''.join(f'<li><b>{esc(k)}</b>: {esc(v)}</li>' for k,v in report['theme_gaps'].items())
page=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Owner art decisions applied — 2026-10-03</title><style>body{{font:16px system-ui;margin:2em auto;max-width:1100px;padding:1em;background:#e8dfcf;color:#26201b}}.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:18px}}article{{border:1px solid #665b4b;padding:12px;min-width:0}}img{{max-width:100%;height:auto;max-height:260px;object-fit:contain;background:#39302a}}code{{overflow-wrap:anywhere}}table{{border-collapse:collapse;width:100%}}td,th{{padding:8px;border:1px solid #897b68;overflow-wrap:anywhere}}.scroll{{overflow:auto}}</style><h1>Art decisions applied</h1><p>14 Keep / 21 Reject. No replacement generation, edits or upscaling. Four props, four portraits and six story scenes are kept as delivered. Mechanic also supplies the approved garage portrait texture.</p><p>The owner flagged degraded resolution in the altered environment candidates; the four kept 64px exports are used at their delivered quality. The rejected candidates remain in the historical review archive and are absent from the active catalog and atlas regions.</p><p>Original Ox, Relay and Marrow remain active. Seizure and rig reveal have their exact pre-rework files restored; their earlier unapproved status means the game uses procedural cards. The retained dune is removed; its core drag footprint remains and is drawn procedurally.</p><p>All 60 remaining original world cells and all 37 original UI cells retain their visible pixels. Atlas residency stays 31.25 MiB declared with reserve / 18.75 MiB in desktop GL; story menu bound is 1,283,072 bytes. No Stick/performance claim.</p><h2>Active kept exports</h2><div class="cards">{''.join(cards)}</div><h2>Rejected candidates and fallback</h2><div class="scroll"><table><tr><th>Item</th><th>Active fallback</th><th>Excluded candidate</th></tr>{''.join(rejects)}</table></div><h2>Smaller theme sets and gaps</h2><ul>{gaps}</ul><h2>Runtime evidence</h2><p><a href="gl/environment-gl.json">Environment lookup and residency</a> · <a href="gl/faces-gl.json">Portrait and story owner gates</a> · <a href="story-gl/gl-validation.json">Story load, scene release, stale/budget fallback and text layout</a></p><img src="gl/environment-atlas.png" alt="Desktop GL active environment board"><img src="gl/faces-atlas.png" alt="Desktop GL kept portrait and story board"><p><a href="report.json">Complete decision and gap report</a> · <a href="../../../art/owner-approvals-2026-10-03.json">Exact owner approval ledger</a> · <a href="../../../art/review/rework2/index.html">Historical before/after candidates, including rejections</a></p></html>'''
(OUT/'index.html').write_text(page,encoding='utf-8')
review_path=ART/'review/rework2/review.json';review=read_json(review_path)
review['owner_application']=dict(date='2026-10-03',authority=ledger['authority'],kept=14,rejected=21,
    report='../../../evidence/owner-decisions/art/index.html',decisions={k:v['decision'] for k,v in ledger['assets'].items()},
    history='Original candidate-screening flags below describe the review-time state; dated decisions are in the separate exact-hash ledger.')
write_json(review_path,review)
historical=ART/'review/rework2/index.html';text=historical.read_text(encoding='utf-8')
banner='<p id="owner-applied"><b>Owner decisions applied, 2026-10-03: 14 Keep / 21 Reject.</b> This page preserves every historical candidate. <a href="../../../evidence/owner-decisions/art/index.html">See active assets, exact hashes, fallbacks and gaps</a>. The controls below remain an archival review scratchpad, not the runtime approval authority.</p>'
if 'id="owner-applied"' not in text:text=text.replace('<main>','<main>'+banner,1)
text=text.replace('Every new item remains unapproved and disabled.', 'The original pending candidates below now have the dated decisions linked above.')
historical.write_text(text,encoding='utf-8')
print('Published current art application and linked historical review.')
