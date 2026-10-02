"""Offline owner audition, embedded data for file:/// access, no CDN/server."""
from pathlib import Path
import html
import json
import sys

wave=sys.argv[1]
base=Path('audio/x3')/wave
plan=json.loads((base/'plan.json').read_text())
report=json.loads((base/'acceptance.json').read_text())
first_path=base/'first-pass/acceptance.json'
first={r['id']:r for r in json.loads(first_path.read_text())['samples']} if first_path.exists() else {}
specs={r['id']:r for r in plan['samples']}


def relative(path):
    import os
    return Path(os.path.relpath(path,base)).as_posix()


def escape(x): return html.escape(str(x))


cards=[]
for row in report['samples']:
    spec=specs[row['id']]
    raw=row.get('raw',{})
    edited=row.get('edited',{})
    provenance=row.get('provenance',{})
    group=spec.get('car') or (spec.get('cue') or spec['id']).split('.')[0]
    players=''
    for label,item in [('Edited comparison',edited),('Original',raw),('Three cycles',row.get('repeat',{}))]:
        if item.get('file'):
            players+=f'<label>{label}<audio controls preload="none" src="{escape(relative(item["file"]))}"></audio></label>'
    if row['id'] in first:
        prior=first[row['id']]['edited']
        players+=f'<details><summary>First local attempt — {escape(prior["status"])}: {escape(", ".join(prior["failures"]) or "no meter failures")}</summary><audio controls preload="none" src="first-pass/edited/{escape(row["id"])}.wav"></audio><p>{escape(prior["integratedLufs"])} LUFS; {escape(prior["truePeakDbtp"])} dBTP</p></details>'
    metrics=f'{edited.get("durationSeconds",0):.3f} s / {edited.get("integratedLufs")} LUFS / {edited.get("truePeakDbtp")} dBTP'
    text=spec.get('prompt') or provenance.get('request',{}).get('text','')
    details=dict(promptOrText=text,beat=spec.get('beat'),provenance=provenance,edit=row.get('edit'),normalization=row.get('normalization'),tailCleanup=row.get('tailCleanup'),
                 rawFailures=raw.get('failures'),editedChecks=edited.get('checks'),silence=edited.get('silence'),
                 loop=edited.get('loopSeam'),sourceDefects=row.get('sourceDefects'),notMeasured=row.get('notMeasured'),error=row.get('error'))
    cards.append(f'''<article data-group="{escape(group)}" data-id="{escape(row['id'])}">
<h2>{escape(row['id'])}</h2><p class="badge {row['status']}">{escape(row['status'].upper())} — signal screen only</p>
<p>{escape(metrics)}</p><p>Original failures: {escape(', '.join(raw.get('failures',[])) or 'none')}<br>Edited failures: {escape(', '.join(edited.get('failures',[])) or 'none')}</p>
<p>{escape(spec.get('beat') or ('Two short character takes; no production selection' if wave=='engines' else 'Owner listening pending'))}</p>
{players}<details><summary>Prompt, cost, provenance and measurements</summary><pre>{escape(json.dumps(details,indent=2))}</pre></details>
<label>Your listening note<textarea data-note="{escape(row['id'])}" placeholder="Preference, audible issue, device used"></textarea></label></article>''')
groups=sorted({specs[r['id']].get('car') or (specs[r['id']].get('cue') or r['id']).split('.')[0] for r in report['samples']})
options='<option value="all">All groups</option>'+''.join(f'<option>{escape(g)}</option>' for g in groups)
intro={'effects':'Chosen sources and new effects. Crunch has no winner: compare crunch-base with crunch-retry. Repairing meters does not repair an artistic mismatch.',
       'engines':'Ten classes, two 2-second character proofs each. No per-car production assets selected or installed. Listen for identity first; repeated-loop fatigue remains unmeasured.',
       'voices':'Announcer: Callum, noir read. Mechanic: Harry, helpful and nervous. Original lines adapted from the campaign owner choice. Check every word, Marrow pronunciation, identity and delivery; no ASR or listening verdict is claimed.'}[wave]
spend=json.loads((base/'spend.json').read_text()) if (base/'spend.json').exists() else {}
before=json.loads((base/'credits-before.json').read_text()) if (base/'credits-before.json').exists() else {}
after=json.loads((base/'credits-after.json').read_text()) if (base/'credits-after.json').exists() else {}
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Death Ride X3 — WAVE audition</title><style>
:root{color-scheme:dark;--bg:#161513;--panel:#24221e;--ink:#eee7d8;--edge:#817253}body.light{color-scheme:light;--bg:#eee9dd;--panel:#fffaf0;--ink:#27221d;--edge:#766444}*{box-sizing:border-box}body{background:var(--bg);color:var(--ink);font:16px/1.5 system-ui;margin:0 auto;padding:24px;max-width:1500px}h1{font-size:clamp(28px,5vw,48px);margin-bottom:8px}header{max-width:1000px}button,select{font:inherit;padding:8px;background:var(--panel);color:var(--ink);border:1px solid var(--edge);border-radius:4px}nav{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:20px}article{min-width:0;background:var(--panel);padding:18px;border:1px solid var(--edge);border-radius:5px}h2{overflow-wrap:anywhere}audio{display:block;width:100%;margin:6px 0 16px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}textarea{display:block;width:100%;min-height:70px;font:inherit}.badge{font-weight:700}.fail,.missing{color:#ef997f}.pass{color:#83b99c}body.light .pass{color:#275e37}body.light .fail{color:#9c331d}.hidden{display:none}a{color:inherit}
</style><header><h1>Death Ride / WAVE</h1><p>INTRO</p><p>COST</p><p>No in-game or physical Stick acceptance. One player at a time. Local edits cost zero credits. Original and edited failures remain visible.</p></header>
<nav><select id="filter" aria-label="Group">OPTIONS</select><button id="stop">Stop all</button><button id="theme">Light / dark</button><button id="export">Export notes</button></nav>
<p id="count"></p><main>CARDS</main><script>
const $=id=>document.getElementById(id),players=[...document.querySelectorAll('audio')],cards=[...document.querySelectorAll('article')];
function stop(){players.forEach(p=>{p.pause();p.currentTime=0})} $('stop').onclick=stop;
players.forEach(p=>p.addEventListener('play',()=>players.forEach(q=>{if(p!==q)q.pause()})));
function filter(){stop();let n=0;cards.forEach(c=>{let show=$('filter').value==='all'||c.dataset.group===$('filter').value;c.classList.toggle('hidden',!show);if(show)n++});$('count').textContent=n+' candidates shown'}$('filter').onchange=filter;filter();
const key='deathride-x3-WAVE';let notes={};try{notes=JSON.parse(localStorage.getItem(key)||'{}');document.body.classList.toggle('light',localStorage.getItem('deathride-x3-theme')==='light')}catch{}
$('theme').onclick=()=>{document.body.classList.toggle('light');try{localStorage.setItem('deathride-x3-theme',document.body.classList.contains('light')?'light':'dark')}catch{}};
document.querySelectorAll('[data-note]').forEach(n=>{n.value=notes[n.dataset.note]||'';n.oninput=()=>{notes[n.dataset.note]=n.value;try{localStorage.setItem(key,JSON.stringify(notes))}catch{}}});
$('export').onclick=()=>{let a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify({wave:'WAVE',at:new Date().toISOString(),notes},null,2)],{type:'application/json'}));a.href=u;a.download='x3-WAVE-listening-notes.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
</script></html>'''
cost=f"This wave estimate {plan['generationEstimate']} credits; session conservative total {spend.get('spent','pending')}/9,000. Account before {before.get('remaining','pending')}, after {after.get('remaining','pending')}; reserve 8,000. Shared balances include other projects and delayed billing."
page=page.replace('INTRO',escape(intro)).replace('COST',escape(cost)).replace('OPTIONS',options).replace('CARDS',''.join(cards)).replace('WAVE',wave)
(base/'index.html').write_text(page,encoding='utf-8',newline='\n')
print((base/'index.html').resolve().as_uri())
