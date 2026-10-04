// Offline campaign design review. Adapted from the Mage Arena card/report interaction pattern.
// No requests, automatic picks, or writes to the owner choice document.
(() => {
  'use strict';
  const body = document.body, key = body.dataset.round;
  if (!key) return;
  const $ = id => document.getElementById(id);
  const cards = [...document.querySelectorAll('article.card[data-direction]')];
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  let state = { choices: {}, winners: {}, theme: 'system', matched: true };
  let storageOk = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (object(saved)) state = { ...state, ...saved,
      choices: object(saved.choices) ? saved.choices : {},
      winners: object(saved.winners) ? saved.winners : {} };
    // Preserve previous listening notes without turning them into owner picks.
    if (!saved && body.dataset.legacyKey) {
      const legacy = JSON.parse(localStorage.getItem(body.dataset.legacyKey) || '{}');
      if (object(legacy)) cards.forEach(card => {
        const note = legacy[card.dataset.legacyNote || card.dataset.direction];
        if (typeof note === 'string') state.choices[card.dataset.direction] = { note };
      });
      if (key === 'deathride.audio.x3.music' && object(legacy)) {
        const note = [legacy.decision && `Previous proof verdict: ${legacy.decision}`, legacy.notes].filter(Boolean).join('\n');
        if (note) state.choices['dust-road-proof'] = { note };
      }
    }
  } catch { storageOk = false; }
  const message = text => { $('status').textContent = text; };
  const save = () => {
    try { localStorage.setItem(key, JSON.stringify(state)); storageOk = true; }
    catch { storageOk = false; }
    message(storageOk ? 'Saved in this browser. Export before moving the report or changing browsers.' :
      'Browser storage unavailable. Notes remain on this page; copy Markdown before closing.');
  };
  const setTheme = () => {
    state.theme = ['light', 'dark', 'system'].includes(state.theme) ? state.theme : 'system';
    document.documentElement.dataset.theme = state.theme;
    $('theme').value = state.theme;
    window.dispatchEvent(new Event('resize')); // Also redraw the music waveform.
  };
  setTheme();
  $('theme').addEventListener('change', () => { state.theme = $('theme').value; setTheme(); save(); });
  const make = (tag, text, attrs = {}) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, value));
    return node;
  };
  const choiceFor = id => object(state.choices[id]) ? state.choices[id] : {};
  cards.forEach((card, index) => {
    const id = card.dataset.direction, choice = choiceFor(id);
    const controls = make('div', '', { class: 'review-controls' });
    if (card.dataset.noteOnly !== 'true') {
      const field = make('fieldset');
      field.append(make('legend', 'Design choice'));
      const picks = make('div', '', { class: 'picks' });
      ['Keep', 'Maybe', 'Reject'].forEach(pick => {
        const label = make('label');
        const input = make('input', '', { type: 'radio', name: `pick-${id}`, value: pick });
        input.checked = choice.pick === pick;
        input.addEventListener('change', () => { state.choices[id] = { ...choiceFor(id), pick }; save(); });
        label.append(input, document.createTextNode(` ${pick}`)); picks.append(label);
      });
      field.append(picks); controls.append(field);
      const clear = make('button', 'Clear pick', { type: 'button', class: 'clear-pick' });
      clear.addEventListener('click', () => {
        state.choices[id] = { ...choiceFor(id), pick: '' };
        picks.querySelectorAll('input').forEach(input => { input.checked = false; }); save();
      });
      controls.append(clear);
    }
    const noteId = `owner-note-${index}`;
    const note = make('textarea', '', { id: noteId, placeholder: 'What works, what should change? Optional.' });
    note.value = typeof choice.note === 'string' ? choice.note : '';
    note.addEventListener('input', () => { state.choices[id] = { ...choiceFor(id), note: note.value }; save(); });
    controls.append(make('label', 'Optional owner note', { for: noteId }), note);
    card.append(controls);
  });
  const categories = new Map();
  cards.forEach(card => {
    if (!card.dataset.categories) return;
    JSON.parse(card.dataset.categories).forEach(category => {
      if (!categories.has(category)) categories.set(category, []);
      categories.get(category).push(card);
    });
  });
  const winners = [];
  categories.forEach((candidates, category) => {
    const id = `winner-${winners.length}`, saved = object(state.winners[category]) ? state.winners[category] : {};
    const panel = make('div', '', { class: 'winner-card', 'data-category': category });
    panel.append(make('label', category, { for: id }));
    const select = make('select', '', { id });
    [['', 'Not reviewed'], ['none', 'No winner'], ['mix', 'Mix / multiple — specify in note'],
      ...candidates.map(card => [card.dataset.direction, card.dataset.label])]
      .forEach(([value, label]) => select.append(make('option', label, { value })));
    select.value = typeof saved.pick === 'string' ? saved.pick : '';
    const note = make('textarea', '', { id: `${id}-note`, placeholder: 'Reason, selected sample IDs, or changes needed. Optional.' });
    note.value = typeof saved.note === 'string' ? saved.note : '';
    const update = () => { state.winners[category] = { pick: select.value, note: note.value }; save(); };
    select.addEventListener('change', update); note.addEventListener('input', update);
    panel.append(select, make('label', 'Category note', { for: note.id }), note);
    $('winner-fields').append(panel); winners.push({ category, candidates, select, note });
  });
  const players = [...document.querySelectorAll('audio')];
  $('matched').checked = state.matched !== false;
  const applyGain = () => players.forEach(player => {
    const gain = Number(player.dataset.gain ?? 0);
    player.volume = $('matched').checked ? Math.min(1, Math.pow(10, (Number.isFinite(gain) ? gain : 0) / 20)) : 1;
  });
  applyGain();
  document.addEventListener('report:media-change', applyGain);
  $('matched').addEventListener('change', () => { state.matched = $('matched').checked; applyGain(); save(); });
  players.forEach((player, index) => {
    player.id ||= `review-audio-${index}`;
    player.setAttribute('aria-label', player.getAttribute('aria-label') ||
      `${player.closest('[data-label]')?.dataset.label || body.dataset.pageTitle} / ${player.dataset.version || index + 1}`);
    player.addEventListener('play', () => players.forEach(other => { if (other !== player) other.pause(); }));
    player.addEventListener('error', () => message('An audio file could not load. Keep the report and its audio folders together.'));
    const loop = make('button', player.dataset.linear === 'true' ? 'Repeat full song (linear; no seam claim)' : 'Repeat for seam listening',
      { type: 'button', 'data-loop-target': player.id, 'aria-pressed': 'false', class: 'repeat' });
    const off = loop.textContent;
    loop.addEventListener('click', () => {
      player.loop = !player.loop;
      loop.textContent = player.loop ? 'Repeat on — listen across 3 passes' : off;
      loop.setAttribute('aria-pressed', String(player.loop));
    });
    // Keep the button outside legacy player labels: clicking a version label
    // must not toggle the repeat button as an implicitly labelled control.
    if (player.parentElement.tagName === 'LABEL') player.parentElement.after(loop);
    else player.after(loop);
  });
  // Escape HTML and table syntax, including pipes preceded by backslashes.
  const cell = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('\\', '&#92;').replaceAll('|', '&#124;').replace(/\r\n|\r|\n/g, '<br>');
  const exportText = () => {
    const date = new Date().toISOString().slice(0, 10);
    const lines = [`## Death Ride — ${body.dataset.pageTitle} — ${date}`, '',
      'Owner campaign design draft. Keep expresses preference; technical failures and production gates remain unchanged.', '',
      '| Category / direction | Pick | Samples | Owner note |', '|---|---|---|---|'];
    winners.forEach(({ category, candidates, select, note }) => {
      const card = candidates.find(card => card.dataset.direction === select.value);
      const pick = card ? `Winner: ${card.dataset.label}` : ({ none: 'No winner', mix: 'Mix / multiple' }[select.value] || 'Not reviewed');
      lines.push(`| ${cell(category)} | ${cell(pick)} | ${cell(card?.dataset.samples || '')} | ${cell(note.value)} |`);
    });
    cards.forEach(card => {
      const choice = choiceFor(card.dataset.direction);
      lines.push(`| ${cell(card.dataset.label)} | ${cell(choice.pick || 'Not reviewed')} | ${cell(card.dataset.samples)} | ${cell(choice.note)} |`);
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
    message(copied ? 'Markdown copied. Paste into deathride/campaign/design-v2/OWNER-REVIEW.md.' :
      'Markdown is selected below. Press Ctrl+C or use your browser copy command; paste into deathride/campaign/design-v2/OWNER-REVIEW.md.');
  });
  message(storageOk ? 'Choices stay in this browser. No owner choices are inferred.' :
    'Browser storage unavailable or unreadable. Copy Markdown to preserve this review before closing.');
})();
