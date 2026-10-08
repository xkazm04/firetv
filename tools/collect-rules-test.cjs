/**
 * Collectibles (v2 R1; owner decisions 2026-10-07 V1, X1, X2, S1): lib/rules/collect.ts and tv/collection.ts.
 *   - a collectible exists only where its latch is set: never from volume, an estimate, help or a model's word;
 *   - a latch never unsets, so nothing earned is lost; order follows the record, oldest first;
 *   - Adult mode shows no collection (progress only); Family always does;
 *   - no screen file prints a count of collectibles (the objects are drawn, never numbered).
 * Run with npm test in desk/ (directly: node tools/collect-rules-test.cjs). No model is called.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test } = require('node:test');
const root = path.resolve(__dirname, '../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-collect-'));
const src = (f) => path.join(root, 'src', f);
const { collectibles, collectionShown } = require(src('lib/rules/collect.ts'));
const { collectionOf } = require(src('tv/collection.ts'));

const rec = (secure, lastSeen, stretch) => ({ seen: 40, right: 39, estimate: 0.97, secure, lastSeen, slips: [], ...(stretch !== undefined ? { stretch: { seen: 9, right: 9, estimate: 0.95, secure: stretch, lastSeen } } : {}) });

test('maths: a lamp per topic latched secure, a star only for a latched step-up; volume and estimate earn nothing', () => {
  const c = collectibles({ skills: { a: rec(true, 3), b: rec(false, 1, true), c: rec(true, 2, true), d: rec(false, 4, false) } }, { topic: (id) => ({ a: 'Fractions' })[id] }).maths;
  assert.deepEqual(c.map(x => `${x.kind}:${x.ref}`), ['star:b', 'lamp:c', 'star:c', 'lamp:a'], 'oldest record first; d (40 seen, 0.97 estimate, not latched) earns nothing');
  assert.equal(c.find(x => x.ref === 'a').label, 'Fractions'); assert.equal(c.find(x => x.ref === 'c').label, 'c', 'an unknown id is shown as itself');
  assert.deepEqual(collectibles({ skills: { x: { ...rec(false, 1), secure: 'yes' } } }).maths, [], 'only a true latch: a truthy string is not one');
});
test('essay: a specimen per lens latched secure; english: a key for independent, a golden key for transfer, nothing for help', () => {
  const c = collectibles({ writing: { structure: rec(true, 2), argument: rec(false, 1), evidence: rec(true, 1) }, english: { achievements: { contact: 'transfer', repair: 'independent', request: 'with-help', describe: 'not-tried' } } });
  assert.deepEqual(c.essay.map(x => x.ref), ['evidence', 'structure']);
  assert.deepEqual(c.english.map(x => `${x.kind}:${x.ref}`), ['golden-key:contact', 'key:repair']);
  assert.deepEqual(collectibles({}), { maths: [], essay: [], english: [] }, 'no record, no collection');
});
test('a latch never unsets, so a collectible once earned stays through any later attempt', () => {
  const learners = require(src('lib/session/learners.ts'));
  for (let i = 0; i < 6; i++) learners.recordAttempt('kim', 'frac-equivalent', true);
  const before = collectibles(learners.getLearner('kim')).maths.filter(x => x.kind === 'lamp').map(x => x.ref);
  assert.deepEqual(before, ['frac-equivalent'], 'six right in a row latches the topic');
  for (let i = 0; i < 10; i++) learners.recordAttempt('kim', 'frac-equivalent', false);
  assert.deepEqual(collectibles(learners.getLearner('kim')).maths.filter(x => x.kind === 'lamp').map(x => x.ref), before, 'ten wrong later: the lamp stays lit');
});
test('Adult mode shows progress, not a collection; Family always shows it', () => {
  const kid = { id: 'k', name: 'K', type: 'elementary', age: 12, modules: [] }, adult = { id: 'a', name: 'A', type: 'other', modules: [], mode: 'adult' };
  assert.equal(collectionShown(kid), true); assert.equal(collectionShown(adult), false);
  assert.equal(collectionShown({ ...adult, mode: 'family' }), true, 'an adult who chose Family gets the collection');
  assert.equal(collectionShown({ id: 'o', name: 'O', type: 'high-school', age: 19, modules: [] }), false, '19 with no mode set is Adult by default');
  const session = (p) => ({ profiles: [p], learner: { id: p.id, name: p.name }, skills: { 'frac-equivalent': rec(true, 1) }, writing: {}, englishLearning: { preferences: null, achievements: {} } });
  assert.equal(collectionOf(session(kid), 'maths').length, 1);
  assert.deepEqual(collectionOf(session(adult), 'maths'), []);
  assert.deepEqual(collectionOf({ ...session(kid), learner: null }, 'maths'), [], 'no one at the desk, no collection');
  const { topicIn } = require(src('lib/library/paths.ts'));
  assert.equal(collectionOf(session(kid), 'maths')[0].label, topicIn('frac-equivalent').name, 'named from the path library');
});
test('the screens draw objects and never print a count of them', () => {
  for (const f of ['maths/MathsCollection.tsx', 'essay/EssayCabinet.tsx', 'english/LingaKeys.tsx']) {
    const t = fs.readFileSync(src(f), 'utf8');
    assert.doesNotMatch(t, /\{[^}]*\.length\s*\}/, `${f}: no {x.length} rendered`);
    assert.doesNotMatch(t, /counted\(|\bof \$\{/, `${f}: no "n of m"`);
  }
});
