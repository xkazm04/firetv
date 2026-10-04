"""Offline owner audition, embedded data for file:/// access, no CDN/server."""
from pathlib import Path
import html
import json
import sys
from report_format import decorate

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


def group_for(spec):
    if spec['category']=='tts': return spec['id'].split('.')[0]
    return spec.get('car') or (spec.get('cue') or spec['id']).split('.')[0]


def categories_for(spec):
    if wave == 'engines': return ['Engine / ' + spec['car']]
    if wave == 'voices':
        role, line = spec['id'].split('.')
        return [role.title(), role.title() + ' / ' + line + ' line']
    cue = spec.get('cue') or ''
    sample_id = spec['id']
    if sample_id.startswith('crunch'): return ['Crunch']
    if cue.startswith('weapon.'):
        family = cue.split('.')[1].title()
        return ['Mine blast', 'Mine', 'Weapons family'] if sample_id == 'mine-base' else [family, 'Weapons family']
    return [{'engine':'Engine', 'pickup':'Pickup', 'ui':'UI', 'movement':'Movement family', 'collision':'Collision family', 'race':'Race events family', 'ability':'Ability tells family'}.get(cue.split('.')[0], group_for(spec))]


def gain(item):
    level, peak = item.get('integratedLufs'), item.get('truePeakDbtp')
    return min(0, -26-level, -3-peak) if isinstance(level,(float,int)) and isinstance(peak,(float,int)) else 0


cards=[]
for row in report['samples']:
    spec=specs[row['id']]
    raw=row.get('raw',{})
    edited=row.get('edited',{})
    provenance=row.get('provenance',{})
    group=group_for(spec)
    players=''
    for label,item in [('Edited comparison',edited),('Original',raw),('Three cycles',row.get('repeat',{}))]:
        if item.get('file'):
            players+=f'<label>{label}<audio controls preload="none" src="{escape(relative(item["file"]))}" data-version="{label}" data-gain="{gain(item if "integratedLufs" in item else edited):.2f}"></audio></label>'
    if row['id'] in first:
        prior=first[row['id']]['edited']
        players+=f'<details><summary>First local attempt — {escape(prior["status"])}: {escape(", ".join(prior["failures"]) or "no meter failures")}</summary><audio controls preload="none" src="first-pass/edited/{escape(row["id"])}.wav" data-version="First local attempt" data-gain="{gain(prior):.2f}"></audio><p>{escape(prior["integratedLufs"])} LUFS; {escape(prior["truePeakDbtp"])} dBTP</p></details>'
    metrics=f'{edited.get("durationSeconds",0):.3f} s / {edited.get("integratedLufs")} LUFS / {edited.get("truePeakDbtp")} dBTP'
    text=spec.get('prompt') or provenance.get('request',{}).get('text','')
    details=dict(promptOrText=text,beat=spec.get('beat'),provenance=provenance,edit=row.get('edit'),normalization=row.get('normalization'),tailCleanup=row.get('tailCleanup'),
                 rawFailures=raw.get('failures'),editedChecks=edited.get('checks'),silence=edited.get('silence'),
                 loop=edited.get('loopSeam'),sourceDefects=row.get('sourceDefects'),notMeasured=row.get('notMeasured'),error=row.get('error'))
    cards.append(f'''<article class="card" data-group="{escape(group)}" data-id="{escape(row['id'])}" data-direction="{escape(row['id'])}" data-label="{escape(categories_for(spec)[0] + ' / ' + row['id'])}" data-samples="{escape(row['id'])}" data-categories="{escape(json.dumps(categories_for(spec)))}">
<h2>{escape(row['id'])}</h2><p class="badge {row['status']}">{escape(row['status'].upper())} — signal screen only</p>
<p>{escape(metrics)}</p><p>Original failures: {escape(', '.join(raw.get('failures',[])) or 'none')}<br>Edited failures: {escape(', '.join(edited.get('failures',[])) or 'none')}</p>
<p>{escape(spec.get('beat') or ('Two short character takes; no production selection' if wave=='engines' else 'Owner listening pending'))}</p>
{players}<details><summary>Prompt, cost, provenance and measurements</summary><pre>{escape(json.dumps(details,indent=2))}</pre></details>
</article>''')
groups=sorted({group_for(specs[r['id']]) for r in report['samples']})
options='<option value="all">All groups</option>'+''.join(f'<option>{escape(g)}</option>' for g in groups)
intro={'effects':'Chosen sources and new effects. Crunch has no winner: compare crunch-base with crunch-retry. Repairing meters does not repair an artistic mismatch.',
       'engines':'Ten classes, two 2-second character proofs each. No per-car production assets selected or installed. Listen for identity first; repeated-loop fatigue remains unmeasured.',
       'voices':'Announcer: Callum, noir read. Mechanic: Harry, helpful and nervous. Original lines adapted from the campaign owner choice. Check every word, Marrow pronunciation, identity and delivery; no ASR or listening verdict is claimed.'}[wave]
spend=json.loads((base/'spend.json').read_text()) if (base/'spend.json').exists() else {}
before=json.loads((base/'credits-before.json').read_text()) if (base/'credits-before.json').exists() else {}
after=json.loads((base/'credits-after.json').read_text()) if (base/'credits-after.json').exists() else {}
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Death Ride X3 — WAVE audition</title></head><body><main>
<header><h1>Death Ride / WAVE</h1><p>INTRO</p><p>COST</p><p>No in-game or physical Stick acceptance. One player at a time. Local edits cost zero credits. Original and edited failures remain visible.</p></header>
__REVIEW_TOOLBAR__
<nav class="report-toolbar"><label>Group <select id="filter" aria-label="Group">OPTIONS</select></label><button id="stop">Stop all</button></nav>
<p id="count"></p><div class="cards">CARDS</div>__REVIEW_DECISIONS__</main><script>
const $=id=>document.getElementById(id),players=[...document.querySelectorAll('audio')],cards=[...document.querySelectorAll('article')];
function stop(){players.forEach(p=>{p.pause();p.currentTime=0})} $('stop').onclick=stop;
function filter(){stop();let n=0;cards.forEach(c=>{let show=$('filter').value==='all'||c.dataset.group===$('filter').value;c.classList.toggle('hidden',!show);if(show)n++});$('count').textContent=n+' candidates shown'}$('filter').onchange=filter;filter();
</script></body></html>'''

cost=f"This wave estimate {plan['generationEstimate']} credits; session conservative total {spend.get('spent','pending')}/9,000. Account before {before.get('remaining','pending')}, after {after.get('remaining','pending')}; reserve 8,000. Shared balances include other projects and delayed billing."
page=page.replace('INTRO',escape(intro)).replace('COST',escape(cost)).replace('OPTIONS',options).replace('CARDS',''.join(cards)).replace('WAVE',wave)
page=decorate(page, 'deathride.audio.x3.'+wave, 'X3 '+wave, '../../', 'deathride-x3-'+wave)
(base/'index.html').write_text(page,encoding='utf-8',newline='\n')
print((base/'index.html').resolve().as_uri())
