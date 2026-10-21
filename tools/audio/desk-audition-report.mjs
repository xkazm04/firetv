#!/usr/bin/env node
// Builds desk/audio/audition/index.html, the owner's triage page for the Study Desk audition, from plan.json and the
// sidecars the guarded tool wrote. Offline: no generation, no network. The page works from file:// with relative paths.
// Picks live in the viewer's localStorage and leave the page only through "Copy Markdown".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir = path.join(root, 'desk/audio/audition');
const plan = JSON.parse(fs.readFileSync(path.join(dir, 'plan.json'), 'utf8'));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Peak dBFS per take, measured offline with ffmpeg volumedetect into peaks.json (absent = not measured).
const peaks = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, 'peaks.json'), 'utf8')); } catch { return {}; } })();
const side = f => { try { return JSON.parse(fs.readFileSync(path.join(dir, f + '.json'), 'utf8')); } catch { return null; } };

function sample(id, file, title) {
  const s = side(file);
  if (!s || !fs.existsSync(path.join(dir, file))) return `<div class="take missing"><b>${esc(title)}</b><span>not generated</span></div>`;
  const prompt = s.request.text ?? s.request.prompt;
  return `<div class="take" data-id="${esc(id)}">
  <b>${esc(title)}</b>
  <audio controls preload="none" src="${esc(file)}"></audio>
  <div class="pick" role="group" aria-label="Verdict for ${esc(id)}">${['keep', 'maybe', 'reject'].map(v => `<button data-v="${v}">${v}</button>`).join('')}</div>
  <input class="note" placeholder="note" aria-label="Note for ${esc(id)}">
  <details><summary>prompt</summary><p>${esc(prompt)}</p><p class="meta">${s.seconds}s requested · peak ${peaks[file] ?? '?'} dB · ${s.bytes} B · billed ${s.providerCredits ?? 'unconfirmed'} · ${esc(s.ts.slice(0, 10))}</p></details>
</div>`;
}

const fams = Object.keys(plan.families);
const cueRows = plan.cues.map(c => `<section class="cue"><h3>${esc(c.label)} <small>${esc(c.brief)}</small></h3>
<div class="row">${fams.map(f => sample(`sfx/${c.id}-${f}`, `sfx/${c.id}-${f}.mp3`, f)).join('')}</div></section>`).join('\n');
const tracks = plan.tracks.map(t => sample(`music/${t.id}`, `music/${t.id}.mp3`, t.label)).join('\n');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Desk audio audition</title>
<style>
:root{--bg:#f6f5f2;--fg:#1d1d1f;--mute:#666;--card:#fff;--line:#ddd;--keep:#1f7a3a;--maybe:#a66b00;--reject:#b3261e}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#141416;--fg:#ececec;--mute:#9a9a9a;--card:#1e1e22;--line:#333}}
:root[data-theme=dark]{--bg:#141416;--fg:#ececec;--mute:#9a9a9a;--card:#1e1e22;--line:#333}
body{background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,sans-serif;margin:0;padding:24px 16px;max-width:1100px;margin-inline:auto}
h1{margin:0 0 4px}h2{margin:32px 0 8px}h3{margin:20px 0 8px;font-size:16px}h3 small{display:block;font-weight:400;color:var(--mute)}
.lead{color:var(--mute);margin:0 0 16px}.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.take{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px}
.take[data-v=keep]{border-color:var(--keep)}.take[data-v=maybe]{border-color:var(--maybe)}.take[data-v=reject]{opacity:.55}
audio{width:100%}.pick{display:flex;gap:6px}.pick button{flex:1;padding:6px;border-radius:6px;border:1px solid var(--line);background:transparent;color:inherit;cursor:pointer;text-transform:capitalize}
.pick button[aria-pressed=true][data-v=keep]{background:var(--keep);color:#fff}.pick button[aria-pressed=true][data-v=maybe]{background:var(--maybe);color:#fff}.pick button[aria-pressed=true][data-v=reject]{background:var(--reject);color:#fff}
.note{padding:6px;border-radius:6px;border:1px solid var(--line);background:transparent;color:inherit}
details p{margin:4px 0;font-size:13px}.meta{color:var(--mute)}.missing span{color:var(--reject)}
.bar{position:sticky;top:0;background:var(--bg);padding:8px 0;display:flex;gap:8px;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--line);z-index:1}
.bar button,.bar select{padding:6px 10px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:inherit}
textarea{width:100%;min-height:160px;margin-top:12px;background:var(--card);color:inherit;border:1px solid var(--line);border-radius:8px;box-sizing:border-box}
label{display:flex;gap:6px;align-items:center}
</style></head><body>
<h1>Desk audio audition A1</h1>
<p class="lead">${esc(plan.about)} Mark each take Keep, Maybe or Reject, pick a family for the effects, then Copy Markdown and paste it back. Play the effects at living-room volume: the focus tick is heard dozens of times a minute.</p>
<div class="bar">
  <label>Effects family <select id="family"><option value="">undecided</option>${fams.map(f => `<option>${f}</option>`).join('')}<option value="mixed">mixed per cue</option></select></label>
  <label><input type="checkbox" id="loop"> loop music</label>
  <button id="copy">Copy Markdown</button>
  <button id="theme">Theme</button>
</div>
<h2>Effects</h2>
<p class="lead">Levels are raw and uneven (peaks from about -30 to 0 dB, shown under each prompt): judge the sound, not the loudness. Picks are levelled when wired in.</p>
<p class="lead">${fams.map(f => `<b>${f}</b>: ${esc(plan.families[f])}`).join(' · ')}</p>
${cueRows}
<h2>Module themes</h2>
<p class="lead">20 s each, asked for as seamless loops. Tick "loop music" to hear the join.</p>
<div class="row">${tracks}</div>
<textarea id="out" aria-label="Markdown export" readonly placeholder="Copy Markdown fills this too, if the clipboard is blocked."></textarea>
<script>
const KEY='desk.audio.a1';let st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch{}};
document.querySelectorAll('.take[data-id]').forEach(el=>{const id=el.dataset.id,r=st[id]||(st[id]={});
  const paint=()=>{el.dataset.v=r.v||'';el.querySelectorAll('.pick button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===r.v)))};
  el.querySelectorAll('.pick button').forEach(b=>b.onclick=()=>{r.v=r.v===b.dataset.v?'':b.dataset.v;paint();save()});
  const n=el.querySelector('.note');n.value=r.n||'';n.oninput=()=>{r.n=n.value;save()};paint();});
const fam=document.getElementById('family');fam.value=st._family||'';fam.onchange=()=>{st._family=fam.value;save()};
const loop=document.getElementById('loop');loop.onchange=()=>document.querySelectorAll('audio[src^="music/"]').forEach(a=>a.loop=loop.checked);
document.addEventListener('play',e=>document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()}),true);
document.getElementById('theme').onclick=()=>{const h=document.documentElement;h.dataset.theme=h.dataset.theme==='dark'?'light':'dark'};
document.getElementById('copy').onclick=async()=>{const lines=['## Desk audio audition A1 - owner picks','','Effects family: '+(st._family||'undecided'),''];
  for(const [id,r] of Object.entries(st)){if(id.startsWith('_')||(!r.v&&!r.n))continue;lines.push('- '+id+': '+(r.v||'-')+(r.n?' - '+r.n:''))}
  const md=lines.join('\\n');const out=document.getElementById('out');out.value=md;try{await navigator.clipboard.writeText(md)}catch{}};
</script></body></html>
`;
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log(`wrote ${path.relative(root, path.join(dir, 'index.html'))}: ${plan.cues.length * fams.length} effects, ${plan.tracks.length} themes`);
