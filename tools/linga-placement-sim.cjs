/**
 * Scenario runs of Linga's level check and topic plan against the real text engine (the Claude Code CLI).
 * A second model call plays each synthetic learner. Slow by design: every step is a model call.
 *
 *   node tools/linga-placement-sim.cjs                 every persona, in parallel
 *   node tools/linga-placement-sim.cjs teen-b1 one-word   only these
 *
 * Each persona runs in its own process with its own data dir (never desk/data). Reports land in
 * artifacts/linga-placement-sim/<stamp>/, one JSON per persona plus summary.json. Exit 1 when any
 * persona lands outside its expected bands, breaks a rule, or fails to finish.
 */
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '../desk');

const PERSONAS = {
  'young-a1': { learner: 'ema', expect: ['A1', 'A2'], who: 'an 11-year-old Czech child in their second year of school English. Knows colours, numbers, family words and "I like". Cannot build past-tense sentences. Often answers in Czech when unsure, or with one or two English words.' },
  'teen-b1': { learner: 'ema', expect: ['A2', 'B1', 'B2'], who: 'a 16-year-old Czech student with seven years of school English who plays online games in English. Speaks in simple connected sentences with typical errors: missing articles, present perfect and past simple mixed up, word-order slips.' },
  'adult-c1': { learner: 'jakub', expect: ['B2', 'C1', 'C2'], who: 'a Czech software engineer who has worked in English for ten years. Fluent, idiomatic and precise, with an occasional article slip.' },
  'czech-only': { learner: 'jakub', expect: ['A1'], who: 'an adult who understands almost no English and answers everything politely in Czech.' },
  'overclaimer': { learner: 'jakub', expect: ['A1', 'A2', 'B1'], who: 'an adult who says they are "basically C1, I watched a lot of films", but actually writes at A2: short sentences, frequent grammar errors, a small vocabulary.' },
  'one-word': { learner: 'ema', expect: ['A1', 'A2'], who: 'a shy teenager who answers with one or two English words at most, even when they understand more.' },
};

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.resolve(__dirname, '../artifacts/linga-placement-sim', process.env.SIM_STAMP || stamp);

if (process.env.SIM_PERSONA) child(process.env.SIM_PERSONA).catch(e => { console.error(e); process.exit(1); });
else parent();

async function parent() {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PERSONAS);
  for (const n of names) if (!PERSONAS[n]) { console.error(`Unknown persona ${n}. Known: ${Object.keys(PERSONAS).join(', ')}`); process.exit(2); }
  fs.mkdirSync(out, { recursive: true });
  console.log(`Running ${names.length} persona(s) against the real engine. Reports: ${out}`);
  const started = Date.now();
  const codes = await Promise.all(names.map(name => new Promise(resolve => {
    const p = spawn(process.execPath, [__filename], { env: { ...process.env, SIM_PERSONA: name, SIM_STAMP: path.basename(out), DESK_DATA_DIR: path.join(out, 'data', name) }, stdio: ['ignore', 'pipe', 'pipe'] });
    p.stdout.on('data', d => process.stdout.write(`[${name}] ${d}`));
    p.stderr.on('data', d => process.stderr.write(`[${name}] ${d}`));
    p.on('close', resolve);
  })));
  const rows = names.map((name, i) => { try { return JSON.parse(fs.readFileSync(path.join(out, `${name}.json`), 'utf8')); } catch { return { name, ok: false, problems: [`no report (exit ${codes[i]})`] }; } });
  fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify({ at: new Date().toISOString(), minutes: +((Date.now() - started) / 60000).toFixed(1), rows: rows.map(({ name, ok, band, expect, confidence, tasks, topics, problems, minutes }) => ({ name, ok, band, expect, confidence, tasks: tasks?.length, topics: topics?.length, minutes, problems })) }, null, 2));
  console.log('\npersona       band  expected        conf    tasks  topics  min   result');
  for (const r of rows) console.log(`${r.name.padEnd(13)} ${String(r.band ?? '-').padEnd(5)} ${String((r.expect ?? []).join(',')).padEnd(15)} ${String(r.confidence ?? '-').padEnd(7)} ${String(r.tasks?.length ?? '-').padEnd(6)} ${String(r.topics?.length ?? '-').padEnd(7)} ${String(r.minutes ?? '-').padEnd(5)} ${r.ok ? 'ok' : 'FAIL · ' + (r.problems ?? []).join('; ')}`);
  process.exit(rows.every(r => r.ok) ? 0 : 1);
}

async function child(name) {
  const persona = PERSONAS[name];
  let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error('Run `npm install` in desk/ first.'); process.exit(1); }
  const resolve = Module._resolveFilename;
  Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
  require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
  const { text } = require(path.join(root, 'src/lib/engines/text.ts'));
  const { englishCommand } = require(path.join(root, 'src/lib/english/conversation.ts'));
  const { dispatch, getSession } = require(path.join(root, 'src/lib/session/store.ts'));
  const { getLearner } = require(path.join(root, 'src/lib/session/learners.ts'));
  const { audienceAllowed, defaultPreferences } = require(path.join(root, 'src/lib/english/curriculum.ts'));

  const started = Date.now(), transcript = [], problems = [];
  let n = 0;
  const say = (...a) => console.log(...a);
  async function command(action, extra = {}) {
    for (let attempt = 1; ; attempt++) {
      const s = getSession();
      try { return await englishCommand({ action, learnerId: s.learner.id, checkId: s.check?.id, commandId: `sim-${++n}`, ...extra }); }
      catch (e) {
        if (e.status === 409 || e.status === 403 || attempt >= 3) throw e;
        say(`  retry ${action} after: ${e.message}`);
        if (getSession().check && !['check-answer', 'check-task', 'plan-swap', 'plan-add'].includes(action)) { action = 'check-retry'; extra = {}; }
      }
    }
  }
  const learnerSystem = 'You play a language learner in an automated test of an English level check. Stay exactly in character: write only what this person would really answer, with their real level of English and their typical errors, or in their own language if that is what they would do. If they would not manage an answer at all, answer exactly [skip]. No commentary, no quotation marks around the answer.';
  async function learnerSays(situation) {
    const r = await text({ system: learnerSystem, prompt: JSON.stringify({ person: persona.who, situation }), schema: { type: 'object', additionalProperties: false, properties: { answer: { type: 'string', maxLength: 600 } }, required: ['answer'] }, model: 'fast', timeoutMs: 90000, isolated: true });
    return String(r.json.answer ?? '[skip]').trim().slice(0, 1000) || '[skip]';
  }
  async function learnerPicks(prompt, options) {
    const r = await text({ system: learnerSystem, prompt: JSON.stringify({ person: persona.who, situation: prompt, options, task: 'Pick the reply this person would choose: 0 or 1, or -1 if they would not know.' }), schema: { type: 'object', additionalProperties: false, properties: { pick: { type: 'integer', enum: [-1, 0, 1] } }, required: ['pick'] }, model: 'fast', timeoutMs: 90000, isolated: true });
    return [0, 1].includes(r.json.pick) ? r.json.pick : -1;
  }

  dispatch({ type: 'reset' });
  dispatch({ type: 'learner.set', id: persona.learner });
  dispatch({ type: 'subject', subject: 'english' });
  const before = getLearner(persona.learner).english;
  say(`start · ${persona.learner}`);
  await command('check-start');
  for (let guard = 0; guard < 16; guard++) {
    const k = getSession().check;
    if (!k || k.stage === 'verdict') break;
    if (k.error && !k.pending) { say(`  recovering: ${k.error}`); await command('check-retry'); continue; }
    if (k.stage === 'about') {
      const q = k.turns.at(-1);
      const answer = await learnerSays(`The tutor asks you: "${q.text}"`);
      transcript.push({ tutor: q.text, learner: answer });
      say(`  Q: ${q.text}\n  A: ${answer}`);
      await command('check-answer', { text: answer === '[skip]' ? '...' : answer, mode: 'speech', lastTurnId: q.id });
      continue;
    }
    const t = k.task;
    if (!t) { await command('check-retry'); continue; }
    if (t.kind === 'choose') {
      const pick = await learnerPicks(t.prompt, t.options);
      transcript.push({ band: t.band, kind: t.kind, prompt: t.prompt, options: t.options, pick });
      say(`  ${t.band} choose: ${t.prompt} → ${pick === -1 ? 'skip' : t.options[pick]}`);
      await command('check-task', pick === -1 ? { taskId: t.id, skip: true } : { taskId: t.id, option: pick });
    } else {
      const answer = await learnerSays(t.kind === 'listen' ? `You hear someone say: "${t.line}". Then you are asked: ${t.prompt}` : `Your task: ${t.prompt}`);
      transcript.push({ band: t.band, kind: t.kind, prompt: t.prompt, line: t.line, learner: answer });
      say(`  ${t.band} ${t.kind}: ${t.prompt}\n    → ${answer}`);
      await command('check-task', answer === '[skip]' ? { taskId: t.id, skip: true } : { taskId: t.id, text: answer, mode: 'speech' });
    }
  }
  const learning = getLearner(persona.learner).english, placement = learning.placement;
  if (!placement) problems.push('no placement was saved');
  else {
    if (!persona.expect.includes(placement.band)) problems.push(`band ${placement.band} outside ${persona.expect.join('/')}`);
    if (placement.tasks.length > 5) problems.push(`${placement.tasks.length} tasks, more than five`);
  }
  if (learning.evidence.length !== before.evidence.length) problems.push('the check wrote speaking evidence');
  say(`verdict · ${placement?.band} (${placement?.confidence}) · ${placement?.summary}`);

  let topics = [];
  try {
    await command('plan-propose');
    topics = getSession().check?.topics ?? [];
    const profile = getSession().profiles.find(p => p.id === persona.learner), prefs = learning.preferences ?? defaultPreferences(profile);
    if (topics.length < 3) problems.push(`only ${topics.length} topics proposed`);
    for (const t of topics) if (!audienceAllowed(profile, prefs, t.audience)) problems.push(`topic "${t.title}" not allowed for this learner`);
    say(`topics · ${topics.map(t => `${t.title} [${t.skill}/${t.audience}]`).join(' | ')}`);
  } catch (e) { problems.push(`plan failed: ${e.message}`); }

  const report = { name, ok: !problems.length, expect: persona.expect, band: placement?.band, confidence: placement?.confidence, selfBand: placement?.selfBand, summary: placement?.summary, focus: placement?.focus, tasks: placement?.tasks ?? [], transcript, topics, problems, minutes: +((Date.now() - started) / 60000).toFixed(1) };
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(report, null, 2));
  clearInterval(globalThis.__desk?.ticker);
  process.exit(0);
}
