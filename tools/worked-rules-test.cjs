/**
 * Worked lessons (v2 M1): "Teach me something" teaches before it practises.
 *   - every example's answer is code's (rules/school workedAnswer) and `check` marks it right, for all twelve generated
 *     units, tiers 1 and 2, and all four school systems (the plan's kill criterion: no example code does not confirm);
 *   - answers read as a school writes them: a decimal comma in cz/de, money to the cent, no "128.0", units kept;
 *   - the idea's words may be the model's only when they carry no digit and fit; else the authored idea stands;
 *   - the route, the store and the keys: a school unit is taught first, a Calculus topic goes to its set.
 * Run with npm test in desk/ (directly: node tools/worked-rules-test.cjs). No model is called (engine stubbed).
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk');
require('./ts-load.cjs');
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-worked-')); process.env.DESK_DATA_DIR = data;
const src = (f) => path.join(root, 'src', f);
const S = require(src('lib/rules/school.ts'));
const engine = require(src('lib/engines/text.ts'));
let answer = async () => { throw new Error('engine down'); };
engine.text = (req) => answer(req);
const W = require(src('lib/desk/worked.ts'));
const { WORKED_METHODS, hasWorked } = require(src('lib/library/worked.ts'));
const store = require(src('lib/session/store.ts'));
const { tvKey } = require(src('tv/keys.ts'));
const route = require(src('app/api/worked/route.ts'));
after(() => { if (globalThis.__desk?.ticker) clearInterval(globalThis.__desk.ticker); fs.rmSync(data, { recursive: true, force: true }); });

test('every worked answer is code\'s and check marks it right: 12 units x 2 tiers x 4 systems x 150 seeds', () => {
  let n = 0;
  for (const sys of ['uk', 'us', 'cz', 'de']) for (const [topic, make] of Object.entries(S.SCHOOL_GENERATORS)) for (const tier of [1, 2]) for (let seed = 1; seed <= 150; seed++) {
    const spec = make(seed, tier); if (!spec) continue;
    const a = S.workedAnswer(spec, sys);
    assert(a, `${sys} ${topic} ${JSON.stringify(spec)} has no worked answer`);
    assert.equal(S.check(spec, a, sys).verdict, 'right', `${sys} ${topic}: ${a}`);
    assert.doesNotMatch(a, /[.,]0(?!\d)/, `${a}: no trailing .0 on a whole answer`);
    n++;
  }
  assert(n > 14000, `${n} items`);
});
test('answers read as the school writes them', () => {
  assert.equal(S.workedAnswer({ shape: 'convert', expr: '15/8', to: 'decimal' }, 'cz'), '1,875', 'a decimal comma in cz');
  assert.equal(S.workedAnswer({ shape: 'convert', expr: '15/8', to: 'decimal' }, 'uk'), '1.875');
  const money = S.SCHOOL_GENERATORS['pct-of-amount'](2, 2), shape = S.SCHOOL_GENERATORS['area'](1, 2);
  assert.equal(S.question(money).plain, 'Find 54% of £130.'); assert.equal(S.workedAnswer(money, 'uk'), '£70.20', 'money to the cent');
  assert.equal(S.workedAnswer(money, 'cz'), '70,20\u00a0£', 'a comma system writes the sign after the amount, as its question prints it (MB-B4)');
  assert.match(S.workedAnswer(shape, 'uk') ?? '', /cm2$/, 'the unit kept');
  assert.equal(S.workedAnswer({ shape: 'compute', expr: '2/3 - 1/8' }, 'uk'), '13/24', 'a fraction question keeps its fraction');
  assert.equal(S.workedAnswer({ shape: 'nonsense' }, 'uk'), null);
});
test('the authored methods cover every generated unit, in words only', () => {
  for (const topic of Object.keys(S.SCHOOL_GENERATORS)) { assert(hasWorked(topic), topic); const m = WORKED_METHODS[topic]; assert.doesNotMatch(m.idea, /\d/); m.steps.forEach((st) => assert.doesNotMatch(st, /\d/, `${topic}: ${st}`)); assert.equal(m.steps.length, 3); }
  for (const t of ['calc1-derivative', 'constructor', 7]) assert.equal(hasWorked(t), false, String(t));
});
test('cleanIdea: words only, three sentences, the caption\'s length', () => {
  assert.equal(W.cleanIdea('A percent is a share out of a hundred.'), 'A percent is a share out of a hundred.');
  assert.equal(W.cleanIdea('Find 5% first.'), null, 'a digit is a number the model chose');
  assert.equal(W.cleanIdea('One. Two. Three. Four.'), null);
  assert.equal(W.cleanIdea('x'.repeat(W.IDEA_MAX + 1)), null);
  assert.equal(W.cleanIdea(7), null); assert.equal(W.cleanIdea('  '), null);
});
test('teachTopic: the model\'s idea when it passes; the authored idea when it fails or carries a number', async () => {
  answer = async () => ({ json: { idea: 'A ratio splits a total into equal parts.' }, provider: 'test', ms: 1 });
  let w = await W.teachTopic('ratio-share', 12, 'uk', 42);
  assert.equal(w.own, true); assert.equal(w.idea, 'A ratio splits a total into equal parts.');
  assert.equal(w.examples.length, 3); assert.equal(w.title, 'Ratio and sharing'); assert.equal(w.steps.length, 3);
  for (const ex of w.examples) assert(ex.question && ex.answer);
  answer = async () => ({ json: { idea: 'Add 6 and 5 to get 11 parts.' }, provider: 'test', ms: 1 });
  w = await W.teachTopic('ratio-share', 12, 'uk', 42); assert.equal(w.own, false); assert.equal(w.idea, WORKED_METHODS['ratio-share'].idea);
  answer = async () => { throw new Error('engine down'); };
  w = await W.teachTopic('ratio-share', 12, 'uk', 42); assert.equal(w.own, false, 'the lesson stands without the model');
  assert.deepEqual(W.workedExamples('ratio-share', 'uk', 42), w.examples, 'the examples are code\'s alone: same seed, same examples');
});
test('route and store: a lesson lands on "worked" for the learner who asked; a topic with no lesson is refused', async () => {
  store.dispatch({ type: 'reset' }); store.dispatch({ type: 'learner.set', id: 'ema' });
  const post = (body) => route.POST(new Request('http://desk/api/worked', { method: 'POST', body: JSON.stringify(body) }));
  assert.equal((await post({ topic: 'calc1-derivative' })).status, 400);
  assert.equal((await post({ topic: 'linear-one-step' })).status, 200, 'a linear unit has a lesson (L1-owen-17-MB2-1)');
  assert.equal((await post({})).status, 400);
  const r = await post({ topic: 'area' }); assert.equal(r.status, 200);
  const s = store.getSession(); assert.equal(s.screen, 'worked'); assert.equal(s.worked.topic, 'area'); assert.equal(s.worked.owner, 'ema');
  store.dispatch({ type: 'learner.set', id: 'jakub' }); assert.equal(store.getSession().worked, null, 'cleared when another learner sits down');
  store.dispatch({ type: 'worked.set', worked: { ...s.worked }, owner: 'ema' }); assert.equal(store.getSession().worked, null, 'a late lesson for another learner never lands');
});
test('keys: Select on a school unit asks for its lesson; on a linear topic, its lesson too (L1-owen-17-MB2-1); Try six on the lesson writes the set', () => {
  const s0 = { ...store.fresh(), learner: { id: 'ema', name: 'Ema' }, profiles: [{ id: 'ema', name: 'Ema', type: 'elementary', age: 12, modules: ['maths'] }], screen: 'topics' };
  const { topicStops } = require(src('tv/keys.ts'));
  const stops = topicStops(s0), area = stops.findIndex(t => t.id === 'area'), lin = stops.findIndex(t => t.id === 'linear-one-step');
  assert(area >= 0 && lin >= 0);
  assert.deepEqual(tvKey({ ...s0, focus: area }, 'select').calls.map(c => c.url), ['/api/worked']);
  assert.deepEqual(tvKey({ ...s0, focus: lin }, 'select').calls.map(c => c.url), ['/api/worked']);
  const lesson = { ...s0, screen: 'worked', focus: 0, worked: { topic: 'area', title: 'Area', idea: 'x', own: false, steps: [], examples: [] } };
  assert.deepEqual(tvKey(lesson, 'select').calls, [{ url: '/api/practice', body: { topic: 'area' }, onFail: { busy: false } }]);
  assert.equal(tvKey({ ...lesson, focus: 1 }, 'select').events.find(e => e.type === 'nav')?.screen, 'topics', 'Back to the topics');
  assert.deepEqual(tvKey({ ...lesson, focus: 1 }, 'select').calls, []);
  assert.equal(tvKey(lesson, 'back').events[0].screen, 'topics');
});

test('MB-B4: a cz lesson prints its examples in Kč with the decimal comma, and each answer is one check marks right for cz', () => {
  let money = 0;
  for (const seed of [1, 2, 3, 4, 5, 6]) for (const ex of W.workedExamples('dec-arith', 'cz', seed)) {
    assert.ok(!/\d\.\d/.test(ex.question) && !/[£€$]/.test(ex.question), ex.question);
    assert.ok(!/\d\.\d/.test(ex.answer), ex.answer);
    if (/Kč/.test(ex.question)) { money++; assert.match(ex.answer, /^\d+,\d\d\u00a0Kč$/); }
  }
  assert.ok(money > 0, 'a money example in Kč');
});

test('L1-owen-17-MB2-1: the three linear units have a worked lesson in words only, with three code-answered examples in every school system', () => {
  const { verify } = require(src('lib/desk/verify.ts'));
  for (const topic of ['linear-one-step', 'linear-two-step', 'linear-both-sides']) {
    assert.equal(hasWorked(topic), true, topic);
    const m = WORKED_METHODS[topic];
    assert.doesNotMatch(m.idea, /\d/, `${topic}: idea`); assert.equal(m.steps.length, 3);
    m.steps.forEach((st) => assert.doesNotMatch(st, /\d/, `${topic}: ${st}`));
    for (const sys of ['uk', 'us', 'cz', 'de']) for (const seed of [1, 7, 42, 1000]) {
      const ex = W.workedExamples(topic, sys, seed);
      assert.equal(ex.length, 3, `${topic} ${sys} ${seed}`);
      assert.equal(new Set(ex.map((e) => e.question)).size, 3, 'three different questions');
      assert.deepEqual(W.workedExamples(topic, sys, seed), ex, 'same seed, same examples');
      for (const e of ex) {
        assert(e.question && e.answer, topic);
        assert(verify(e.question.replace(/^Solve /, '').replace(/\.$/, ''), e.answer.replace(/^x = /, '')), `${topic}: ${e.question} -> ${e.answer} does not satisfy the equation`);
      }
    }
  }
});

test('optimize 2026-10-21: the worked idea is asked through the prompt assembler, so its ledger row names the prompt version; the words are as they were', async () => {
  let req; answer = async (r) => { req = r; return { json: { idea: 'A ratio splits a total into equal parts.' }, provider: 'test', ms: 1 }; };
  await W.teachTopic('ratio-share', 12, 'uk', 42);
  assert.equal(req.use, 'worked-idea');
  assert.match(String(req.fingerprint), /^[0-9a-f]{12}$/, 'a fingerprint on the call (meter.ts records it as the row\'s prompt)');
  const m = WORKED_METHODS['ratio-share'];
  assert.equal(req.prompt, `Topic: Ratio and sharing.\nThe method the desk will show, step by step: ${m.steps.join('; ')}.\nA plain version of the idea, for reference: ${m.idea}\nWrite the idea in your own words for this learner.`);
  assert.match(req.system, /^You are a maths tutor for .*Words only: write no digits and no worked numbers\. No praise, no questions to the learner\./s);
  // one fingerprint per topic's authored words, the same on every ask
  let again; answer = async (r) => { again = r; return { json: { idea: 'x' }, provider: 'test', ms: 1 }; };
  await W.teachTopic('ratio-share', 12, 'uk', 7); assert.equal(again.fingerprint, req.fingerprint);
});
