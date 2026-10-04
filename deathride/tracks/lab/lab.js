(() => {
  'use strict';
  const $ = id => document.getElementById(id), keys = ['nodes', 'spots', 'features', 'obstacles', 'junctions', 'branches'];
  const base = location.protocol === 'file:' ? 'http://127.0.0.1:8794' : location.origin;
  let catalog = null, original = null, draft = null, baked = null, simulation = null, trial = null, selected = 0;
  let revision = 0, validatedRevision = -1, timer = null, busy = false, recipeDirty = false, drag = null, history = [], future = [], playing = false, lastFrame = 0;
  const make = (tag, text, attrs = {}) => { const el = document.createElement(tag); if (text != null) el.textContent = text; for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); return el; };
  const copy = x => JSON.parse(JSON.stringify(x)), number = x => Number.isFinite(x) ? x.toFixed(2) : 'unmeasured';
  function setStatus(text, error = false) { $('backend-status').textContent = text; $('backend-status').classList.toggle('notice', error); }
  async function request(path, fields) {
    const response = await fetch(base + path, fields ? {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams(fields)} : {});
    if (!response.ok) { let error = response.statusText; try { error = (await response.json()).error || error; } catch {} throw Error(error); }
    return response;
  }
  function fields() { return {id: original.course.id, ...draft, seed: $('seed').value, arena: String($('arena').checked)}; }
  function editorTexts() { for (const k of keys) $(`${k}-csv`).value = draft[k]; }
  function nodeRows() {
    const lines = draft.nodes.trim().split(/\r?\n/).slice(1).map(x => x.split(','));
    if (!lines.every(r => r.length === 5 && [0, 1, 2, 4].every(i => Number.isFinite(Number(r[i]))))) throw Error('Fix control-point CSV numbers before using the point editor');
    return lines.map(r => [Number(r[0]), Number(r[1]), Number(r[2]), r[3], Number(r[4])]);
  }
  function writeNodes(rows) { draft.nodes = 'xM,yM,halfWidthM,surface,aiLaneM\n' + rows.map(r => r.join(',')).join('\n') + '\n'; $('nodes-csv').value = draft.nodes; }
  function remember() { history.push(copy(draft)); if (history.length > 80) history.shift(); future = []; }
  function buttons() { $('undo').disabled = !history.length || busy; $('redo').disabled = !future.length || busy; $('reset').disabled = !original || busy; $('race').disabled = busy || recipeDirty || !baked || validatedRevision !== revision || baked.geometry.lint.length > 0; $('export-bundle').disabled = busy || recipeDirty || !baked || validatedRevision !== revision; $('editor').disabled = !catalog || busy; $('course').disabled = !catalog || busy; }
  function draw() {
    if (!baked) return;
    const course = copy(baked.course); try { course.nodes = nodeRows(); } catch {}
    const frame = trial?.replay?.[Number($('scrub').value)] || null;
    $('legend').textContent = TrackView.draw($('map'), course, {heat: simulation?.heat, layer: $('layer').value, nodes: true, selected, cars: frame?.[1]});
    if (frame) $('replay-status').textContent = `${frame[0].toFixed(1)} s · ${frame[1].map((c, i) => `car ${i}: ${c[3] ? 'wreck' : c[5].toFixed(1) + ' m/s'}`).join(' · ')}`;
  }
  function nodePanel() {
    try { const rows = nodeRows(); selected = Math.max(0, Math.min(selected, rows.length - 2)); $('node').replaceChildren(...rows.slice(0, -1).map((_, i) => make('option', `Point ${i}`, {value: i}))); $('node').value = String(selected);
      const r = rows[selected]; $('node-x').value = r[0]; $('node-y').value = r[1]; $('node-width').value = r[2]; $('node-surface').value = r[3]; $('node-lane').value = r[4];
    } catch (e) { $('lint-status').textContent = e.message; }
  }
  function invalidate() { revision++; validatedRevision = -1; simulation = null; trial = null; playing = false; window.labRaceReady = false; $('play').disabled = true; $('play').textContent = 'Play replay'; $('scrub').disabled = true; $('race-status').textContent = 'Draft changed. Run a new race to measure it.'; $('replay-status').textContent = ''; $('pressure').getContext('2d').clearRect(0, 0, $('pressure').width, $('pressure').height); $('lint-status').textContent = 'Checking edited draft in the core…'; buttons(); }
  function schedule() { clearTimeout(timer); timer = setTimeout(analyze, 220); }
  async function analyze() {
    if (!draft || busy) return;
    const requested = revision;
    try {
      const response = await request('/api/analyze', fields()), result = await response.json();
      if (requested !== revision) return;
      baked = result; validatedRevision = requested;
      $('lint-status').textContent = result.geometry.lint.length ? `${result.geometry.lint.length} structural lint errors. Fix them before racing.` : 'Structural lint clear. Authored quality flags remain visible below.';
      $('lint-status').className = result.geometry.lint.length ? 'fail' : 'pass'; $('lint').replaceChildren(...result.geometry.lint.map(s => make('li', s)));
      const m = result.geometry.metrics; $('metrics').replaceChildren(...[[number(m.lengthM), 'metres'], [number(m.minWidthW), 'minimum car widths'], [m.cornerCount, 'corners'], [m.overtakeZones, 'passing zones']].map(([v, label]) => { const n = make('div'); n.append(make('strong', v), make('span', label)); return n; }));
      $('gates').replaceChildren(...[...result.gates,...(result.shape?.gates||[])].map(g => make('p', `${g.status.toUpperCase()} · ${g.metric}: ${number(g.value)} ${g.unit||''} (${g.min ?? '—'} … ${g.max ?? '—'})`, {class: g.status === 'pass' ? 'small' : 'notice small'})));
      $('draft-digest').textContent = 'Draft SHA-256: ' + result.digest; setStatus('Connected · actual core bake and linter · drafts stay in memory'); draw(); buttons(); window.labValidatedRevision = validatedRevision;
    } catch (e) { if (requested === revision) { $('lint-status').textContent = e.message; $('lint-status').className = 'fail'; $('lint').replaceChildren(); setStatus('Draft could not be baked: ' + e.message, true); buttons(); } }
  }
  function load(id) {
    recipeDirty=false;$('recipe').value='';$('primitives').textContent='';
    original = catalog.courses.find(c => c.course.id === id); draft = copy(original.csv); baked = {course: original.course, geometry: {lint: []}}; selected = 0; history = []; future = [];
    draft.startFraction=original.course.startFraction; editorTexts(); nodePanel(); invalidate();
    const theme = catalog.themes.find(t => t.id === original.course.theme); $('theme-vocabulary').textContent = `Theme ${theme.id}: surfaces ${theme.surfaces.join(', ')}; landmarks ${theme.landmarks.join(', ')}.`;
    analyze();
  }
  async function connect() {
    $('connect').disabled = true;
    try { catalog = await (await request('/api/catalog')).json(); $('course').replaceChildren(...catalog.courses.map(c => make('option', c.course.name, {value: c.course.id}))); $('node-surface').replaceChildren(...catalog.surfaces.map(s => make('option', s, {value: s}))); $('obstacle-definition').replaceChildren(...catalog.obstacles.map(o => make('option', `${o.id} (${o.effect})`, {value: o.id})));
      const params=new URLSearchParams(location.search),requested=params.get('course'); $('course').value = catalog.courses.some(c => c.course.id === requested) ? requested : catalog.courses[0].course.id; $('startup').open = false; load($('course').value);
      const candidate=params.get('candidate');if(candidate){if(!/^[a-z]+-[1-7]-[a-f]$/.test(candidate))throw Error('Invalid candidate ID');const result=await(await request(`/tracks/candidates/drafts/${candidate}.json`)).json();$('course').value=result.course.id;load(result.course.id);draft={...copy(result.csv),previewName:result.id,region:result.region||result.id.replace(/-[1-7]-[a-f]$/,''),startFraction:result.course.startFraction,recipe:result.recipe,tier:result.tier,laps:result.laps};baked={course:result.course,geometry:result.geometry};$('arena').checked=false;$('recipe').value=result.recipe;$('composer-status').textContent=`${result.id}: ${result.family}; tier ${result.tier}; ${result.laps} laps. Imported measured candidate draft.`;editorTexts();nodePanel();invalidate();await analyze()}
      window.labReady = true;
    } catch (e) { setStatus('Local core is offline. Start :core:trackLab, then press Connect. ' + e.message, true); $('startup').open = true; }
    $('connect').disabled = false;
  }
  $('connect').addEventListener('click', connect); $('course').addEventListener('change', () => load($('course').value)); $('node').addEventListener('change', () => { selected = Number($('node').value); nodePanel(); draw(); });
  $('load-recipe').addEventListener('click',()=>{if(catalog){$('recipe').value=catalog.composerExample;recipeDirty=true;if(draft)invalidate();$('composer-status').textContent='Example loaded. Compile to replace the draft.';}});
  $('recipe').addEventListener('input',()=>{recipeDirty=true;if(draft)invalidate();$('composer-status').textContent='Uncompiled recipe changes. Compile before racing or exporting.';});
  $('compose').addEventListener('click',async()=>{
    if(!original||busy)return;const requested=revision;busy=true;buttons();$('compose').disabled=true;$('composer-status').textContent='Compiling design primitives in the core…';
    try {const result=await(await request('/api/compose',{id:original.course.id,recipe:$('recipe').value})).json();if(revision!==requested)return;
      remember();recipeDirty=false;draft={...copy(result.csv),region:result.course.region,startFraction:result.course.startFraction,recipe:result.recipe};selected=0;baked=result;editorTexts();nodePanel();invalidate();$('primitives').textContent=result.primitives;$('composer-status').textContent=`Compiled ${result.spans.length} design spans. ${result.geometry.lint.length} structural errors. Shape gates appear below.`;
    }catch(e){$('composer-status').textContent=e.message;}finally{busy=false;buttons();$('compose').disabled=false;await analyze();}
  });
  for (const id of ['node-x', 'node-y', 'node-width', 'node-surface', 'node-lane']) $(id).addEventListener('change', () => {
    try { const rows = nodeRows(); const r = [Number($('node-x').value), Number($('node-y').value), Number($('node-width').value), $('node-surface').value, Number($('node-lane').value)]; if (JSON.stringify(rows[selected]) === JSON.stringify(r)) return; remember(); rows[selected] = r; if (selected === 0) rows[rows.length - 1] = [...r]; writeNodes(rows); invalidate(); draw(); schedule(); } catch (e) { setStatus(e.message, true); }
  });
  for (const key of keys) $(`${key}-csv`).addEventListener('input', () => { const value = $(`${key}-csv`).value; if (draft[key] === value) return; remember(); draft[key] = value; invalidate(); if (key === 'nodes') nodePanel(); schedule(); });
  $('insert-node').addEventListener('click', () => { const rows = nodeRows(), a = rows[selected], b = rows[selected + 1]; remember(); rows.splice(selected + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, a[3], (a[4] + b[4]) / 2]); selected++; writeNodes(rows); nodePanel(); invalidate(); schedule(); });
  $('remove-node').addEventListener('click', () => { const rows = nodeRows(); if (rows.length <= 5) { setStatus('At least four distinct control points are required.', true); return; } remember(); rows.splice(selected, 1); rows[rows.length - 1] = [...rows[0]]; selected = Math.min(selected, rows.length - 2); writeNodes(rows); nodePanel(); invalidate(); schedule(); });
  $('add-spot').addEventListener('click', () => { remember(); draft.spots = draft.spots.trimEnd() + `\n${$('spot-kind').value},${$('spot-fraction').value},${$('spot-lane').value}\n`; editorTexts(); invalidate(); schedule(); });
  $('add-obstacle').addEventListener('click', () => { remember(); draft.obstacles = draft.obstacles.trimEnd() + `\n${original.course.id},${$('obstacle-definition').value},${$('obstacle-fraction').value},${$('obstacle-lane').value},${$('obstacle-heading').value},7319\n`; editorTexts(); invalidate(); schedule(); });
  $('undo').addEventListener('click', () => { if (!history.length) return; future.push(copy(draft)); draft = history.pop(); editorTexts(); nodePanel(); invalidate(); analyze(); });
  $('redo').addEventListener('click', () => { if (!future.length) return; history.push(copy(draft)); draft = future.pop(); editorTexts(); nodePanel(); invalidate(); analyze(); });
  $('reset').addEventListener('click', () => load(original.course.id));
  $('map').addEventListener('pointerdown', e => {
    if (!baked || busy) return; const rect = $('map').getBoundingClientRect(), transform = $('map').trackTransform; const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    try { const rows = nodeRows(); const found = rows.slice(0, -1).map((p, i) => ({i, distance: Math.hypot(...transform.xy(p[0], p[1]).map((v, j) => v - (j ? my : mx)))})).sort((a, b) => a.distance - b.distance)[0];
      if (found.distance > 22) return; remember(); selected = found.i; drag = {transform}; $('map').setPointerCapture(e.pointerId); nodePanel(); draw();
    } catch (error) { setStatus(error.message, true); }
  });
  $('map').addEventListener('pointermove', e => { if (!drag) return; const rect = $('map').getBoundingClientRect(), p = drag.transform.toWorld(e.clientX - rect.left, e.clientY - rect.top), rows = nodeRows(); rows[selected][0] = Math.round(p[0] * 10) / 10; rows[selected][1] = Math.round(p[1] * 10) / 10; if (!selected) rows[rows.length - 1] = [...rows[0]]; writeNodes(rows); nodePanel(); invalidate(); draw(); schedule(); });
  const endDrag = () => { if (drag) { drag = null; clearTimeout(timer); analyze(); } }; $('map').addEventListener('pointerup', endDrag); $('map').addEventListener('pointercancel', endDrag);
  $('layer').addEventListener('change', draw); window.addEventListener('resize', draw); $('theme').addEventListener('change', () => { document.documentElement.dataset.theme = $('theme').value; draw(); });
  function download(blob, filename) { const a = make('a', '', {href: URL.createObjectURL(blob), download: filename}); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  $('export-bundle').addEventListener('click', async () => { try { const result = await request('/api/export', fields()); download(await result.blob(), `${original.course.id}-draft.zip`); setStatus('Draft CSV bundle downloaded. Existing course data remains unchanged.'); } catch (e) { setStatus(e.message, true); } });
  for (const key of keys) { const b = make('button', `Download ${key}.csv`, {type: 'button'}); b.addEventListener('click', () => { if (draft) download(new Blob([draft[key]], {type: 'text/csv'}), `${original.course.id}-${key}.csv`); }); $('csv-downloads').append(b); }
  function pressureChart() {
    if (!trial) return; const c = $('pressure'), ctx = c.getContext('2d'); c.width = 700; c.height = 140; ctx.clearRect(0, 0, c.width, c.height);
    for (const [field, color] of [[1, '#23877e'], [2, '#d67930']]) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); trial.pressure.forEach((p, i) => { const v = field === 1 ? p[1] : (p[2] - (trial.pressure[i - 1]?.[2] || 0)) / (trial.maxHp || 100); const x = p[0] / trial.seconds * 700, y = 135 - Math.min(1, v) * 125; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke(); }
  }
  $('race').addEventListener('click', async () => {
    const requested = revision; busy = true; buttons(); $('race-status').textContent = 'Running six AI cars in the actual fixed-step core…';
    try { const result = await (await request('/api/race', fields())).json(); if (revision !== requested) return; baked = result; simulation = result.simulation; trial = result.trial;
      $('race-status').textContent = `${number(trial.seconds)} s · ${trial.stoppingReason} · ${trial.finished} finishers · ${trial.wrecks} wrecks · ${trial.overtakes} passes · ${trial.contacts} contacts · first wreck ${number(trial.firstWreckSeconds)} s. Reference flying lap: ${number(result.referenceLap.flyingLapSeconds)} s (${result.referenceLap.car}, Pro AI, combat off). One seeded probe; feel unmeasured.`;
      $('scrub').max = Math.max(0, trial.replay.length - 1); $('scrub').value = 0; $('scrub').disabled = false; $('play').disabled = !trial.replay.length; $('layer').value = 'speed'; pressureChart(); draw(); window.labRaceReady = true;
    } catch (e) { $('race-status').textContent = e.message; } finally { busy = false; buttons(); }
  });
  $('scrub').addEventListener('input', () => { playing = false; $('play').textContent = 'Play replay'; draw(); });
  $('play').addEventListener('click', () => { playing = !playing; if (playing && Number($('scrub').value) >= Number($('scrub').max)) $('scrub').value = 0; $('play').textContent = playing ? 'Pause replay' : 'Play replay'; lastFrame = performance.now(); });
  function animate(now) { if (playing && trial && now - lastFrame >= 40) { lastFrame = now; const next = Number($('scrub').value) + 1; $('scrub').value = Math.min(next, Number($('scrub').max)); if (next >= Number($('scrub').max)) { playing = false; $('play').textContent = 'Play replay'; } draw(); } requestAnimationFrame(animate); } requestAnimationFrame(animate);
  connect();
})();
