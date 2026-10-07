/**
 * Worked lessons (v2 M1): "Teach me something" teaches before it practises.
 *   - every example's answer is code's (rules/school workedAnswer) and `check` marks it right, for all twelve generated
 *     units, tiers 1 and 2, and all four school systems (the plan's kill criterion: no example code does not confirm);
 *   - answers read as a school writes them: a decimal comma in cz/de, money to the cent, no "128.0", units kept;
 *   - the idea's words may be the model's only when they carry no digit and fit; else the authored idea stands;
 *   - the route, the store and the keys: a school unit is taught first, a linear or Calculus topic goes to its set.
 * Run with npm test in desk/ (directly: node tools/worked-rules-test.cjs). No model is called (engine stubbed).
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk');
let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error("This suite transpiles desk TypeScript with desk's own compiler. Run `npm install` in desk/ first, then `npm test` from desk/."); process.exit(1); }
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
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
  assert.equal(S.workedAnswer(money, 'cz'), '£70,20');
  assert.match(S.workedAnswer(shape, 'uk') ?? '', /cm2$/, 'the unit kept');
  assert.equal(S.workedAnswer({ shape: 'compute', expr: '2/3 - 1/8' }, 'uk'), '13/24', 'a fraction question keeps its fraction');
  assert.equal(S.workedAnswer({ shape: 'nonsense' }, 'uk'), null);
});
test('the authored methods cover every generated unit, in words only', () => {
  for (const topic of Object.keys(S.SCHOOL_GENERATORS)) { assert(hasWorked(topic), topic); const m = WORKED_METHODS[topic]; assert.doesNotMatch(m.idea, /\d/); m.steps.forEach((st) => assert.doesNotMatch(st, /\d/, `${topic}: ${st}`)); assert.equal(m.steps.length, 3); }
  for (const t of ['linear-one-step', 'linear-two-step', 'calc1-derivative', 'constructor', 7]) assert.equal(hasWorked(t), false, String(t));
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
  assert.equal((await post({ topic: 'linear-one-step' })).status, 400);
  assert.equal((await post({})).status, 400);
  const r = await post({ topic: 'area' }); assert.equal(r.status, 200);
  const s = store.getSession(); assert.equal(s.screen, 'worked'); assert.equal(s.worked.topic, 'area'); assert.equal(s.worked.owner, 'ema');
  store.dispatch({ type: 'learner.set', id: 'jakub' }); assert.equal(store.getSession().worked, null, 'cleared when another learner sits down');
  store.dispatch({ type: 'worked.set', worked: { ...s.worked }, owner: 'ema' }); assert.equal(store.getSession().worked, null, 'a late lesson for another learner never lands');
});
test('keys: Select on a school unit asks for its lesson; on a linear topic, its set; Try six on the lesson writes the set', () => {
  const s0 = { ...store.fresh(), learner: { id: 'ema', name: 'Ema' }, profiles: [{ id: 'ema', name: 'Ema', type: 'elementary', age: 12, modules: ['maths'] }], screen: 'topics' };
  const { topicStops } = require(src('tv/keys.ts'));
  const stops = topicStops(s0), area = stops.findIndex(t => t.id === 'area'), lin = stops.findIndex(t => t.id === 'linear-one-step');
  assert(area >= 0 && lin >= 0);
  assert.deepEqual(tvKey({ ...s0, focus: area }, 'select').calls.map(c => c.url), ['/api/worked']);
  assert.deepEqual(tvKey({ ...s0, focus: lin }, 'select').calls.map(c => c.url), ['/api/practice']);
  const lesson = { ...s0, screen: 'worked', focus: 0, worked: { topic: 'area', title: 'Area', idea: 'x', own: false, steps: [], examples: [] } };
  assert.deepEqual(tvKey(lesson, 'select').calls, [{ url: '/api/practice', body: { topic: 'area' }, onFail: { busy: false } }]);
  assert.equal(tvKey({ ...lesson, focus: 1 }, 'select').events.find(e => e.type === 'nav')?.screen, 'topics', 'Back to the topics');
  assert.deepEqual(tvKey({ ...lesson, focus: 1 }, 'select').calls, []);
  assert.equal(tvKey(lesson, 'back').events[0].screen, 'topics');
});
