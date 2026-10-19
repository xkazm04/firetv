/**
 * The Paper panel's draft survives a phone reload (recert-5 L1-owen-17-MB4-1): rules/paperDraft is the pure part.
 * Run with: node --test tools/paper-draft-test.cjs (from desk/: node --test ../tools/paper-draft-test.cjs). No model, no data directory.
 */
const path = require('node:path'), assert = require('node:assert/strict');
const { test } = require('node:test');
const { root } = require('./ts-load.cjs');
const D = require(path.join(root, 'src/lib/rules/paperDraft.ts'));

const rows = (n) => Array.from({ length: n }, (_, i) => ({ q: `${i + 1}a`, marks: String(i % 4), outOf: '4', codes: i % 2 ? ['N1'] : [] }));
/** A phone's localStorage, as the page uses it: a key, a text. */
const store = () => { const m = new Map(); return { get: (k) => m.get(k) ?? null, set: (k, v) => m.set(k, v), has: (k) => m.has(k) }; };

test('31 typed rows round-trip', () => {
  const r = rows(31), text = D.serialiseDraft(r);
  assert.equal(typeof text, 'string');
  assert.deepEqual(D.parseDraft(text), r);
});

test('keys are per learner and never cross; no learner means no key', () => {
  const st = store(), a = D.draftKey('ana'), b = D.draftKey('ben');
  assert.notEqual(a, b);
  st.set(a, D.serialiseDraft(rows(3)));
  assert.equal(D.parseDraft(st.get(b)), null);
  assert.equal(D.parseDraft(st.get(a)).length, 3);
  assert.equal(D.draftKey(undefined), null);
  assert.equal(D.draftKey(''), null);
});

test('malformed JSON and a wrong shape parse to null, never throw', () => {
  for (const bad of [null, undefined, '', '{', 'null', '5', '"x"', '[]', '{}', '{"v":1}', '{"v":1,"rows":"x"}', '{"v":2,"rows":[]}',
    '{"v":1,"rows":[{"q":1,"marks":"","outOf":"","codes":[]}]}', '{"v":1,"rows":[{"q":"","marks":"","outOf":"","codes":[1]}]}',
    '{"v":1,"rows":[null]}', JSON.stringify(rows(2))]) assert.equal(D.parseDraft(bad), null, String(bad));
});

test('an empty array restores one blank row; an all-blank draft is not stored', () => {
  assert.deepEqual(D.parseDraft('{"v":1,"rows":[]}'), [{ q: '', marks: '', outOf: '', codes: [] }]);
  assert.equal(D.serialiseDraft([{ q: '', marks: '', outOf: '', codes: [] }]), null);
});
