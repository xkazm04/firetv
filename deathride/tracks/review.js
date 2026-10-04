// Track review adaptation of deathride/audio/report.js: same picks, persistence and escaped Markdown table.
(() => {
  'use strict';
  const $ = id => document.getElementById(id), key = document.body.dataset.round;
  const cards = [...document.querySelectorAll('article.card[data-direction]')];
  const object = x => x && typeof x === 'object' && !Array.isArray(x);
  let state = {choices: {}, theme: 'system'}, storageOk = true;
  try { const saved = JSON.parse(localStorage.getItem(key) || 'null'); if (object(saved)) state = {choices: object(saved.choices) ? saved.choices : {}, theme: saved.theme}; } catch { storageOk = false; }
  const choice = id => object(state.choices[id]) ? state.choices[id] : {};
  const message = text => { $('status').textContent = text; };
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); storageOk = true; } catch { storageOk = false; } message(storageOk ? 'Saved in this browser. Copy Markdown to keep a portable review.' : 'Browser storage unavailable. Copy Markdown before closing.'); };
  const theme = () => { if (!['system', 'light', 'dark'].includes(state.theme)) state.theme = 'system'; document.documentElement.dataset.theme = state.theme; $('theme').value = state.theme; window.dispatchEvent(new Event('resize')); };
  theme(); $('theme').addEventListener('change', () => { state.theme = $('theme').value; theme(); save(); });
  const make = (tag, text, attributes = {}) => { const el = document.createElement(tag); if (text) el.textContent = text; for (const [k, v] of Object.entries(attributes)) el.setAttribute(k, v); return el; };
  cards.forEach((card, index) => {
    if(card.dataset.ownerAccepted==='true') { card.append(make('p','Existing owner Keep — preserved unchanged.',{class:'pass'}));return; }
    const id = card.dataset.direction, controls = make('div', '', {class: 'review-controls'}), field = make('fieldset'), picks = make('div', '', {class: 'picks'});
    field.append(make('legend', 'Course choice'));
    for (const pick of ['Keep', 'Maybe', 'Reject']) {
      const label = make('label'), input = make('input', '', {type: 'radio', name: `pick-${id}`, value: pick}); input.checked = choice(id).pick === pick;
      input.addEventListener('change', () => { state.choices[id] = {...choice(id), pick}; save(); }); label.append(input, document.createTextNode(` ${pick}`)); picks.append(label);
    }
    field.append(picks); controls.append(field);
    const clear = make('button', 'Clear pick', {type: 'button'}); clear.addEventListener('click', () => { state.choices[id] = {...choice(id), pick: ''}; picks.querySelectorAll('input').forEach(x => { x.checked = false; }); save(); });
    const note = make('textarea', '', {id: `owner-note-${index}`, placeholder: 'What works, what should change? Optional.'}); note.value = typeof choice(id).note === 'string' ? choice(id).note : '';
    note.addEventListener('input', () => { state.choices[id] = {...choice(id), note: note.value}; save(); });
    controls.append(clear, make('label', 'Optional owner note', {for: note.id}), note); card.append(controls);
  });
  const cell = x => String(x ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\\', '&#92;').replaceAll('|', '&#124;').replace(/\r\n|\r|\n/g, '<br>');
  const preview = () => { $('export').value = [`## Death Ride — ${document.body.dataset.pageTitle} — ${new Date().toISOString().slice(0, 10)}`, '',
    'Owner track review draft. Keep expresses preference; technical failures and production gates remain unchanged.', '',
    '| Category / direction | Pick | Samples | Owner note |', '|---|---|---|---|',
    ...cards.map(card => { const saved=choice(card.dataset.direction);const c = card.dataset.ownerAccepted==='true'?{pick:'Keep',note:'Existing owner acceptance; course unchanged.'}:saved.pick?saved:card.dataset.recordedPick?{...saved,pick:card.dataset.recordedPick,note:saved.note||'Recorded owner Keep 2026-10-04.'}:saved; return `| ${cell(card.dataset.label)} | ${cell(['Keep', 'Maybe', 'Reject'].includes(c.pick) ? c.pick : 'Not reviewed')} | ${cell(card.dataset.samples)} | ${cell(c.note)} |`; }), ''].join('\n'); };
  $('refresh-export').addEventListener('click', preview);
  $('copy').addEventListener('click', async () => { preview(); $('export').focus(); $('export').select(); let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText($('export').value); copied = true; } } catch {}
    if (!copied) try { copied = document.execCommand('copy'); } catch {}
    message(copied ? 'Markdown copied. Paste it into your track review notes.' : 'Markdown selected below. Press Ctrl+C or use your browser copy command.');
  });
  message(storageOk ? 'Choices stay in this browser. No owner choices are inferred.' : 'Browser storage unavailable or unreadable. Copy Markdown before closing.');
})();
