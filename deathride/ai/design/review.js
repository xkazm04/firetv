// Offline AI review, adapted from deathride/audio/report.js. No requests or inferred picks.
(() => {
  'use strict';
  const body = document.body, key = body.dataset.round;
  const $ = id => document.getElementById(id);
  const cards = [...document.querySelectorAll('article.card[data-direction]')];
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  const validPick = value => ['Keep', 'Maybe', 'Reject'].includes(value) ? value : '';
  let state = { choices: {}, theme: 'system' }, storageOk = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (object(saved)) state = { choices: object(saved.choices) ? saved.choices : {}, theme: saved.theme };
  } catch { storageOk = false; }
  const message = text => { $('status').textContent = text; };
  const choiceFor = id => object(state.choices[id]) ? state.choices[id] : {};
  const save = () => {
    try { localStorage.setItem(key, JSON.stringify(state)); storageOk = true; }
    catch { storageOk = false; }
    message(storageOk ? 'Saved in this browser. Export before moving the report or changing browsers.' :
      'Browser storage unavailable. Notes remain on this page; copy Markdown before closing.');
    preview();
  };
  const setTheme = () => {
    state.theme = ['light','dark','system'].includes(state.theme) ? state.theme : 'system';
    document.documentElement.dataset.theme = state.theme; $('theme').value = state.theme;
  };
  setTheme();
  $('theme').addEventListener('change', () => { state.theme = $('theme').value; setTheme(); save(); });
  const make = (tag, text, attrs = {}) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    Object.entries(attrs).forEach(([name,value]) => node.setAttribute(name,value));
    return node;
  };
  cards.forEach((card,index) => {
    const id = card.dataset.direction, choice = choiceFor(id);
    const controls = make('div','',{class:'review-controls'}), field = make('fieldset');
    field.append(make('legend', `${card.dataset.label} — owner choice`));
    const picks = make('div','',{class:'picks'});
    ['Keep','Maybe','Reject'].forEach(pick => {
      const label = make('label'), input = make('input','',{type:'radio',name:`pick-${id}`,value:pick});
      input.checked = validPick(choice.pick) === pick;
      input.addEventListener('change', () => { state.choices[id] = {...choiceFor(id),pick}; save(); });
      label.append(input,document.createTextNode(` ${pick}`)); picks.append(label);
    });
    field.append(picks); controls.append(field);
    const clear = make('button','Clear pick',{type:'button',class:'clear-pick'});
    clear.addEventListener('click', () => {
      state.choices[id] = {...choiceFor(id),pick:''};
      picks.querySelectorAll('input').forEach(input => { input.checked = false; }); save();
    });
    const note = make('textarea','',{id:`owner-note-${index}`,placeholder:'What works, what should change? Optional.'});
    note.value = typeof choice.note === 'string' ? choice.note : '';
    note.addEventListener('input', () => { state.choices[id] = {...choiceFor(id),note:note.value}; save(); });
    controls.append(clear,make('label','Optional owner note',{for:note.id}),note); card.append(controls);
  });
  // Escape HTML, pipes, backslashes and multiline notes exactly as the audio export does.
  const cell = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('\\','&#92;').replaceAll('|','&#124;').replace(/\r\n|\r|\n/g,'<br>');
  const exportText = () => {
    const lines = [`## Death Ride — ${body.dataset.pageTitle} — ${new Date().toISOString().slice(0,10)}`, '',
      'Owner review draft. Keep expresses preference; technical failures and balance gates remain unchanged.', '',
      '| Category / direction | Pick | Samples | Owner note |', '|---|---|---|---|'];
    cards.forEach(card => {
      const choice = choiceFor(card.dataset.direction);
      lines.push(`| ${cell(card.dataset.label)} | ${validPick(choice.pick) || 'Not reviewed'} | ${cell(card.dataset.samples)} | ${cell(typeof choice.note === 'string' ? choice.note : '')} |`);
    });
    return lines.join('\n') + '\n';
  };
  const preview = () => { $('export').value = exportText(); };
  $('refresh-export').addEventListener('click', preview);
  $('copy').addEventListener('click', async () => {
    preview(); $('export').focus(); $('export').select();
    let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText($('export').value); copied = true; } } catch {}
    if (!copied) { try { copied = document.execCommand('copy'); } catch {} }
    message(copied ? 'Markdown copied. Paste it into your owner review notes.' :
      'Markdown is selected below. Press Ctrl+C or use your browser copy command.');
  });
  preview();
  message(storageOk ? 'Choices stay in this browser. No owner choices are inferred.' :
    'Browser storage unavailable or unreadable. Copy Markdown to preserve this review before closing.');
})();
