/**
 * LINGA LEVEL: the level check's command surface (lib/english/check.ts) and the table it is guarded by
 * (lib/english/activity.ts), driven through englishCommand as the phone and the TV drive it.
 *   - a check left part way is kept: opening the topics does not replace it (the home says "Your place is saved");
 *   - a judge answer whose quote is not in the learner's answer is asked for once more inside the same call, so the
 *     learner is not asked to send their answer again; a second miss is still refused;
 *   - every refusal the table gives names the stage the check is in, never a task or a question that is not there.
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

test('a judge quote that is not in the answer is asked for once more inside the call; the learner never resends', async () => {
  seat('jakub');
  const answer = 'I think it was on the bus this morning.';
  steps = { about, task: sayTask, judge: (p, n) => ({ answered: 'yes', english: p.band, quote: n === 1 ? 'I think it were on the bus' : 'it was on the bus', heldBack: '', note: 'A clear answer.' }) };
  await throughQuestions();
  let k = getSession().check; assert(k.task, 'a task is on the TV');
  calls = {};
  await command('check-task', { checkId: k.id, taskId: k.task.id, text: answer, mode: 'text' });
  k = getSession().check;
  assert.equal(calls.judge, 2, 'the judge was asked once more');
  assert.equal(k.error, '', 'no error line for the learner');
  assert.equal(k.tasks.length, 1); assert.equal(k.tasks[0].quote, 'it was on the bus');
  // two misses: the answer is refused as before, and the learner is told to send it again
  steps.judge = () => ({ answered: 'yes', english: 'B1', quote: 'something they never said', heldBack: '', note: 'A clear answer.' });
  calls = {};
  await assert.rejects(command('check-task', { checkId: k.id, taskId: k.task.id, text: answer, mode: 'text' }), /did not quote the learner accurately/);
  assert.equal(calls.judge, 2, 'one re-ask, never more');
  assert.match(getSession().check.error, /send it again/);
  assert.equal(getSession().check.tasks.length, 1, 'nothing judged on a misquote');
});

test('every refusal names the stage the check is in: no task or question that is not there', () => {
  const base = { id: 'k', learnerId: 'l', turns: [], selfBand: null, goal: '', interest: '', read: '', task: null, tasks: [], placement: null, topics: [], pending: null, error: '', commands: [], audioNonce: 0, startedAt: 0 };
  const say = { id: 'x', band: 'A2', kind: 'say', prompt: 'p', line: '', options: [], revealed: false };
  const states = {
    'about-empty': { ...base, stage: 'about' }, 'about-asked': { ...base, stage: 'about', turns: [{ id: 't', role: 'tutor', text: 'q' }] },
    'tasks-between': { ...base, stage: 'tasks' }, say: { ...base, stage: 'tasks', task: say }, listen: { ...base, stage: 'tasks', task: { ...say, kind: 'listen' } }, choose: { ...base, stage: 'tasks', task: { ...say, kind: 'choose' } },
    verdict: { ...base, stage: 'verdict' }, 'plan-goal': { ...base, stage: 'plan', askGoal: true }, 'plan-topics': { ...base, stage: 'plan', topics: [TOPIC] }, 'plan-empty': { ...base, stage: 'plan' },
  };
  assert.deepEqual(Object.keys(states).sort(), A.CHECK_STATES.filter((s) => s !== 'reading' && s !== 'parked').sort(), 'every idle state is walked');
  const bad = [];
  let n = 0;
  for (const [state, k] of Object.entries(states)) {
    assert.equal(A.checkState(k), state);
    for (const action of A.CHECK_COMMANDS) {
      if (A.checkAccepts(k, action)) continue;
      n++;
      const line = A.checkRefusal(k, action);
      if (k.stage !== 'tasks' && /\btasks?\b/i.test(line) && !/listening task/.test(line)) bad.push(`${state} ${action}: "${line}" (no task here)`);
      if (k.stage !== 'about' && /question/i.test(line) && !/questions are done/.test(line)) bad.push(`${state} ${action}: "${line}" (no question here)`);
      if (k.stage !== 'plan' && /plan for/i.test(line)) bad.push(`${state} ${action}: "${line}" (no plan here)`);
      if (/Carry on with the tasks/.test(line) && k.stage !== 'tasks') bad.push(`${state} ${action}: "${line}" (the tasks are not next)`);
    }
  }
  assert(n >= 60, `${n} refusals walked`);
  assert.deepEqual(bad, []);
});
