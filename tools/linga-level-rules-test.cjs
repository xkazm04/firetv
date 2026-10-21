/**
 * LINGA LEVEL: the level check's command surface (lib/english/check.ts) and the table it is guarded by
 * (lib/english/activity.ts), driven through englishCommand as the phone and the TV drive it.
 *   - a check left part way is kept: opening the topics does not replace it (the home says "Your place is saved");
 * Run with npm test in desk/ (directly: node tools/linga-level-rules-test.cjs). No model is called: the providers throw
 * and the text engine is a fixed local stub. The data directory is disposable, under the OS temp dir; never desk/data.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
const { test, after } = require('node:test');
const { root, src: srcDir } = require('./ts-load.cjs');
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-linga-level-')); process.env.DESK_DATA_DIR = data; delete process.env.DESK_TEXT_ENGINE;
assert(!path.resolve(data).startsWith(path.resolve(root, 'data')), 'never desk/data');
const src = (f) => path.join(srcDir, f);
const reg = require(src('lib/engines/registry.ts'));
const engine = require(src('lib/engines/text.ts')); require(src('lib/engines/vision.ts'));
for (const kind of ['text', 'vision', 'embed']) reg.useProvider(kind, { name: 'stub', run: async () => { throw new Error(`the ${kind} engine was called`); } });
/** The only "model" here: a fixed local function per step; `calls` counts each step asked. */
let steps = {}, calls = {};
engine.text = async (req) => {
  const p = JSON.parse(req.prompt); calls[p.step] = (calls[p.step] ?? 0) + 1;
  const f = steps[p.step]; if (!f) throw new Error(`unexpected step ${p.step}`);
  return { json: f(p, calls[p.step]), provider: 'test', ms: 1 };
};
const A = require(src('lib/english/activity.ts'));
const { englishCommand } = require(src('lib/english/conversation.ts'));
const { dispatch, getSession } = require(src('lib/session/store.ts'));
const { getLearner, saveEnglish } = require(src('lib/session/learners.ts'));
after(() => { clearInterval(globalThis.__desk?.ticker); fs.rmSync(data, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

let counter = 0;
const command = (action, extra = {}) => { const s = getSession(); return englishCommand({ action, learnerId: s.learner.id, commandId: `level-${++counter}`, ...extra }); };
function seat(id = 'ema') { dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id }); dispatch({ type: 'subject', subject: 'english' }); }
const TOPIC = { id: 'p1', title: 'Games night', goal: 'Talk about games.', why: 'You like games.', skill: 'describe', audience: 'all', partner: 'Sam · Friend', premise: 'Two friends plan a games night.', cue: 'Try: I like…', quiz: { question: 'Which fits?', options: ['I like it.', 'Yesterday.'], correct: 0 } };
const about = () => ({ reply: 'Thanks. And what do you want to do in English?', selfBand: 'C1', goal: '', interest: 'games', language: 'english', read: 'Plays games in English.' });
const SITUATION = { B2: 'Tell me about your weekend.', C1: 'Persuade a friend to join a club.', C2: 'Explain a joke you love.' };
const sayTask = (p) => ({ prompt: SITUATION[p.band] ?? 'Describe your street.', line: '', options: [], correct: 0 });
async function throughQuestions() {
  await command('check-start');
  for (let i = 0; i < 3; i++) { const k = getSession().check; await command('check-answer', { checkId: k.id, text: 'I play games with my friends every day.', mode: 'text', lastTurnId: k.turns.at(-1).id }); }
}

test('a check left part way survives "My topics": plan-open and plan-propose do not replace it', async () => {
  seat();
  saveEnglish('ema', { ...getLearner('ema').english, placement: { at: 1, band: 'B1', selfBand: null, confidence: 'medium', source: 'check', summary: 'You get by.', focus: 'Past tense', tasks: [] }, plan: { at: 1, band: 'B1', topics: [TOPIC] } });
  steps = { about };
  await command('check-start');
  let k = getSession().check;
  await command('check-answer', { checkId: k.id, text: 'I play games with my friends.', mode: 'text', lastTurnId: k.turns.at(-1).id });
  k = getSession().check; await command('check-leave', { checkId: k.id });
  const kept = getSession().check;
  assert.equal(kept.stage, 'about'); assert.equal(kept.turns.length, 3);
  for (const action of ['plan-open', 'plan-propose']) {
    await assert.rejects(command(action), (e) => e.status === 409 && /part way/.test(e.message), action);
    const now = getSession().check;
    assert.equal(now.id, kept.id, `${action}: the part-way check is the one kept`);
    assert.deepEqual([now.stage, now.turns.length], ['about', 3], `${action}: its answers are kept`);
  }
  // and the kept check carries on from where it was
  await command('check-resume', { checkId: kept.id });
  assert.equal(getSession().check.parked, false);
});
