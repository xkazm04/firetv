/**
 * The Company sim (v2 L3; adult plan A2's operator run): pitched scenes played through Cut, for a person to read.
 * OPERATOR-RUN. Not in `test:rules`, never in a gate: the live mode makes real model calls.
 *
 *   node tools/linga-company-sim.cjs --stub            the pipeline on a stub engine: no model is called (CI-safe)
 *   node tools/linga-company-sim.cjs --live            the real text engine (the Claude Code CLI on this computer)
 *   node tools/linga-company-sim.cjs --live absurd-1   only these scenes
 *
 * THE PROTOCOL (A2, as amended by the v2 plan's L3 card)
 * - 20 pitched scenes at B1, five in each of four genres: absurd, comedy, high stakes, workplace drama. Each premise is
 *   what an adult would type into the phone's Pitch a scene field (at most 400 characters, none on the never-list).
 * - Each scene runs the desk's own commands on one adult profile in Adult mode (type "other", 18+ confirmed, level B1):
 *   `pitch` (one shaping call, then the opening), four learner turns, then `cut`. A second model call plays the
 *   learner: a B1 adult with typical slips (articles, tense, prepositions), in character, one or two sentences a turn.
 *   The stub mode answers every call from fixed lines instead, so the run itself is checked without a model.
 * - Code records, per scene: the shaped contract (title, partner, premise, audience), the transcript, the notes as
 *   kept (quote, kind, reading, note, better) and how many the model proposed, and any refusal or error.
 * - A PERSON READS every scene in report.md and marks three things: the partner stayed in role (and inside the
 *   tutor's never-lines); the partner's English sat at B1; every kept note is a real slip of the learner's, rightly
 *   kinded. Record the counts in the v2 plan's session log. The adult plan's kill line: cast out of role or notes
 *   misquoting in more than a quarter of scenes means fix the prompts before C2 (v2 L4/L5).
 * - Data: a fresh DESK_DATA_DIR under artifacts/linga-company-sim/<stamp>/data, never desk/data. Reports in the same
 *   folder: report.json (everything) and report.md (the reading sheet). Exit 1 when a scene fails to play or Cut.
 */
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const root = path.resolve(__dirname, '../desk');
const args = process.argv.slice(2), live = args.includes('--live'), stub = args.includes('--stub');
if (live === stub) { console.error('Choose one: --stub (no model call) or --live (the real engine, operator only).'); process.exit(2); }

const SCENES = {
  'absurd-1': 'A dragon wants to open a bank account and I am its translator at the counter.',
  'absurd-2': 'I return a toaster that only toasts on Tuesdays, and the shop says that is a feature.',
  'absurd-3': 'My cat has been elected mayor and I have to give the press conference for her.',
  'absurd-4': 'I check into a hotel where every room is on the moon and the lift is broken.',
  'absurd-5': 'A ghost in my flat refuses to move out and wants to discuss the rent with me.',
  'comedy-1': 'I accidentally sent a love poem about pizza to my whole office and now I must explain it.',
  'comedy-2': 'At a cooking class I pretend to be a famous chef and the teacher asks for my secret.',
  'comedy-3': 'I am the worst tour guide in Prague and today the group is a team of history professors.',
  'comedy-4': 'My neighbour thinks I am a spy because I water my plants at three in the morning.',
  'comedy-5': 'I have to return a wedding gift I already used, and the couple is at the shop.',
  'stakes-1': 'The last train leaves in ten minutes and the ticket machine only speaks to me in riddles.',
  'stakes-2': 'I am the pilot\'s only passenger who speaks English and the radio just went quiet.',
  'stakes-3': 'A storm is coming and I must convince the harbour master to let our boat stay in port.',
  'stakes-4': 'I found a wallet with a plane ticket for today and the owner is about to board.',
  'stakes-5': 'Our expedition is lost on a glacier and I call the rescue centre on a bad line.',
  'work-1': 'My colleague presented my idea as hers in the meeting, and now we are alone in the lift.',
  'work-2': 'A client calls furious because we delivered three hundred umbrellas to a desert hotel.',
  'work-3': 'I must tell my team on Friday at five that the deadline moved to Monday morning.',
  'work-4': 'The new boss is twenty-two and asks me, politely, to explain what my job actually is.',
  'work-5': 'I negotiate with a supplier who will only agree if I can make him laugh first.',
};
const GENRE = { absurd: 'absurd', comedy: 'comedy', stakes: 'high stakes', work: 'workplace drama' };
const TURNS = 4;

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.resolve(__dirname, '../artifacts/linga-company-sim', `${stamp}${stub ? '-stub' : ''}`);
fs.mkdirSync(out, { recursive: true });
process.env.DESK_DATA_DIR = path.join(out, 'data');

let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error('Run `npm install` in desk/ first (or link desk/node_modules with tools/worktree-preflight.cjs).'); process.exit(1); }
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...rest) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...rest); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const engine = require(path.join(root, 'src/lib/engines/text.ts'));
const realText = engine.text;

// ---- the stub: fixed answers in the shapes the desk asks for; the learner's lines carry typical B1 slips
const STUB_LINES = ['Yesterday I go to the bank for open a account.', 'I am agree with you, but is very difficult for me.', 'We was waiting since two hours, it is crazy.', 'Can you explain me what happen now?'];
function stubText(req) {
  const p = JSON.parse(req.prompt);
  if (p.step === 'plan') return { json: { topics: [{ title: `A pitched scene`, goal: 'Play the scene you pitched.', why: 'Your own scene.', skill: 'negotiate', audience: 'all', partner: 'Alex · The other side', premise: p.learnerAsked, cue: 'Try: Could we…', quiz: { question: 'Which keeps it polite?', options: ['Could we try again?', 'No.'], correct: 0 } }] }, provider: 'stub', ms: 0 };
  if (/^Cut:/.test(p.task ?? '')) {
    const [a, b] = p.learnerTurns;
    return { json: { notes: [
      { turnId: a.turnId, quote: a.text.split(' ').slice(0, 3).join(' '), kind: 'form', note: 'Yesterday asks for the past tense.', better: 'Yesterday I went' },
      { turnId: b.turnId, quote: 'I am agree', kind: 'form', note: 'Agree is the verb here, with no am.', better: 'I agree' },
      { turnId: b.turnId, quote: 'a quote the learner never said', kind: 'word', note: 'This one must be dropped.', better: '' },
    ] }, provider: 'stub', ms: 0 };
  }
  if (p.submittedReply) return { json: { reply: 'I see. And what do you want to do next?', supportProvided: false, observations: [], moment: { kind: 'none', said: '', better: '', why: '' }, help: { simpler: '', meaning: '', starter: '' } }, provider: 'stub', ms: 0 };
  return { json: { title: 'A pitched scene', goal: 'Play the scene you pitched.', opening: 'Hello. So, what brings you here today?', supportProvided: false, help: { simpler: '', meaning: '', starter: '' } }, provider: 'stub', ms: 0 };
}
let lastCutRaw = null;
engine.text = async (req) => {
  const r = stub ? stubText(req) : await realText(req);
  try { if (/^Cut:/.test(JSON.parse(req.prompt).task ?? '')) lastCutRaw = r.json; } catch { /* not JSON */ }
  return r;
};

const { englishCommand } = require(path.join(root, 'src/lib/english/conversation.ts'));
const { dispatch, getSession } = require(path.join(root, 'src/lib/session/store.ts'));
const { defaultPreferences } = require(path.join(root, 'src/lib/english/curriculum.ts'));

const learnerSystem = 'You play an adult English learner at B1 in an automated test of a role-play scene. Stay in character inside the scene. Write only what this person would say next: one or two sentences, with typical B1 slips (articles, verb tenses, prepositions), never perfect English. No commentary, no quotation marks.';
async function learnerSays(c, i) {
  if (stub) return STUB_LINES[i % STUB_LINES.length];
  const r = await realText({ system: learnerSystem, prompt: JSON.stringify({ scene: c.title, goal: c.goal, partner: c.partner, transcript: c.turns.map(t => ({ who: t.role, text: t.text })) }), schema: { type: 'object', additionalProperties: false, properties: { answer: { type: 'string', maxLength: 300 } }, required: ['answer'] }, model: 'fast', timeoutMs: 90000, isolated: true });
  return String(r.json.answer ?? '').trim().slice(0, 300) || 'Sorry, can you say again?';
}

let n = 0;
const command = (action, extra = {}) => { const s = getSession(); return englishCommand({ action, learnerId: s.learner.id, episodeId: s.conversation?.id, commandId: `company-${++n}`, ...extra }); };

async function play(id) {
  const started = Date.now(), problems = [], premise = SCENES[id];
  dispatch({ type: 'reset' });
  dispatch({ type: 'profile.draft', patch: { id: 'company', name: 'Company', type: 'other', mode: 'adult', modules: ['english'] } });
  dispatch({ type: 'profile.save' });
  dispatch({ type: 'learner.set', id: 'company' });
  dispatch({ type: 'subject', subject: 'english' });
  await command('preferences', { preferences: { ...defaultPreferences({ type: 'other' }), level: 'B1', adultConfirmed: true, creativity: 'surprising', challenge: 'realistic' }, notes: [] });
  lastCutRaw = null;
  try { await command('pitch', { text: premise }); } catch (e) { return { id, genre: GENRE[id.split('-')[0]], premise, ok: false, problems: [`pitch refused: ${e.message}`] }; }
  for (let i = 0; i < TURNS; i++) {
    const c = getSession().conversation;
    if (c.moment) await command('moment-done');
    const now = getSession().conversation, said = await learnerSays(now, i);
    try { await command('turn', { text: said, mode: 'text', lastTurnId: now.turns.at(-1).id }); } catch (e) { problems.push(`turn ${i + 1}: ${e.message}`); }
  }
  if (getSession().conversation.moment) await command('moment-done');
  try { await command('cut'); } catch (e) { problems.push(`cut: ${e.message}`); }
  const c = getSession().conversation, scene = c.scene;
  const proposed = Array.isArray(lastCutRaw?.notes) ? lastCutRaw.notes.length : 0, kept = c.cut?.notes ?? [];
  if (!c.cut) problems.push('the take was not cut');
  for (const t of c.turns) if (t.role === 'partner' && t.text.length > 230) problems.push('a partner line over 230 characters');
  return { id, genre: GENRE[id.split('-')[0]], premise, ok: !problems.length, contract: scene && { title: scene.name, partner: scene.partner, premise: scene.premise, audience: scene.audience }, transcript: c.turns.map(t => ({ who: t.role === 'learner' ? 'learner' : c.partner, text: t.text })), notes: kept, proposed, problems, seconds: Math.round((Date.now() - started) / 1000) };
}

function sheet(rows) {
  const lines = [`# The Company sim · ${stub ? 'STUB (no model was called)' : 'live'} · ${new Date().toISOString()}`, '', 'For each scene mark: [ ] in role  [ ] in band (B1)  [ ] every note a real slip, rightly kinded', ''];
  for (const r of rows) {
    lines.push(`## ${r.id} · ${r.genre}${r.ok ? '' : ' · FAILED'}`, '', `Pitch: ${r.premise}`, '');
    if (r.contract) lines.push(`Contract: **${r.contract.title}** · ${r.contract.partner} · ${r.contract.audience}`, '', `> ${r.contract.premise}`, '');
    for (const t of r.transcript ?? []) lines.push(`- **${t.who}**: ${t.text}`);
    lines.push('', `Notes kept: ${(r.notes ?? []).length} of ${r.proposed ?? 0} proposed`);
    for (const x of r.notes ?? []) lines.push(`- ${x.reading ? 'a reading' : x.kind} · "${x.quote}"${x.better ? ` → "${x.better}"` : ''}: ${x.note}`);
    if (r.problems?.length) lines.push('', `Problems: ${r.problems.join('; ')}`);
    lines.push('', '[ ] in role  [ ] in band  [ ] every note a real slip', '');
  }
  return lines.join('\n');
}

(async () => {
  const names = args.filter(a => !a.startsWith('--'));
  for (const x of names) if (!SCENES[x]) { console.error(`Unknown scene ${x}. Known: ${Object.keys(SCENES).join(', ')}`); process.exit(2); }
  const ids = names.length ? names : Object.keys(SCENES);
  console.log(`The Company sim · ${stub ? 'stub engine, no model call' : 'LIVE engine'} · ${ids.length} scene(s) · ${out}`);
  const rows = [];
  for (const id of ids) { const r = await play(id); rows.push(r); console.log(`${id.padEnd(9)} ${r.ok ? 'ok' : 'FAIL'}  notes ${(r.notes ?? []).length}/${r.proposed ?? 0}${r.problems?.length ? '  · ' + r.problems.join('; ') : ''}`); }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ at: new Date().toISOString(), mode: stub ? 'stub' : 'live', rows }, null, 2));
  fs.writeFileSync(path.join(out, 'report.md'), sheet(rows));
  console.log(`\n${rows.filter(r => r.ok).length} of ${rows.length} scenes played through Cut. A person reads ${path.join(out, 'report.md')}.`);
  clearInterval(globalThis.__desk?.ticker);
  process.exit(rows.every(r => r.ok) ? 0 : 1);
})().catch(e => { console.error(e); clearInterval(globalThis.__desk?.ticker); process.exit(1); });
