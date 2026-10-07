/**
 * The GCSE Foundation map (v2 M2a; lib/library/gcse.ts): the 1MA1 subject-content codes are complete and in order,
 * each statement names its source, every mapped topic exists on the school path, coverage is computed by code, and no
 * screen says "GCSE" while the map is unverified (X5). Run with npm test in desk/ (directly: node tools/gcse-rules-test.cjs).
 */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test } = require('node:test');
const root = path.resolve(__dirname, '../desk');
let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error("This suite transpiles desk TypeScript with desk's own compiler. Run `npm install` in desk/ first, then `npm test` from desk/."); process.exit(1); }
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const src = (f) => path.join(root, 'src', f);
const G = require(src('lib/library/gcse.ts'));
const { topicsOf } = require(src('lib/library/paths.ts'));

test('the subject content is complete: N1-16, A1-25, R1-16, G1-25, P1-9, S1-6, in order, each with a source', () => {
  const want = { N: 16, A: 25, R: 16, G: 25, P: 9, S: 6 };
  for (const [prefix, count] of Object.entries(want)) {
    const area = Object.entries(G.AREAS).find(([, v]) => v.prefix === prefix)[0];
    assert.deepEqual(G.STATEMENTS.filter((x) => x.area === area).map((x) => x.code), Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`), prefix);
  }
  for (const st of G.STATEMENTS) { assert(st.can.length > 10 && st.can.length < 140, st.code); assert.match(st.source, /1MA1/); }
  assert.deepEqual(G.STATEMENTS.filter((x) => !x.foundation).map((x) => x.code), ['A13', 'A15', 'A16', 'A20', 'R15', 'G8', 'G10', 'G22', 'G23', 'P9', 'S3'], 'the wholly higher-tier statements');
  assert(G.STATEMENTS.filter((x) => !x.foundation).every((x) => !x.touches.length), 'nothing maps onto a higher-only statement');
  assert.equal(G.FOUNDATION.length, 86);
});
test('every mapped topic is a school-path topic, and every school topic touches something', () => {
  const school = new Set(topicsOf('school').map((t) => t.id)), used = new Set(G.STATEMENTS.flatMap((x) => x.touches));
  for (const id of used) assert(school.has(id), `${id} is on the school path`);
  for (const id of school) assert(used.has(id), `${id} touches a Foundation statement`);
  for (const t of topicsOf('calc1')) assert(!used.has(t.id), 'Calculus is not GCSE');
});
test('coverage is computed by code from the topics given', () => {
  const all = G.gcseCoverage();
  assert.equal(all.touched.length + all.gaps.length, all.total);
  assert.equal(all.touched.length, 19); assert(all.share < 0.25, 'an honest quarter: M2b fills the gaps');
  assert.deepEqual(all.topics.A17, ['linear-one-step', 'linear-two-step', 'linear-both-sides']);
  assert.equal(all.byArea.probability.touched, 0);
  assert.equal(Object.values(all.byArea).reduce((a, b) => a + b.total, 0), all.total);
  const none = G.gcseCoverage([]); assert.equal(none.touched.length, 0); assert.equal(none.share, 0);
  const fr = G.gcseCoverage(['frac-of-amount', 'not-a-topic']); assert.deepEqual(fr.touched, ['N12']);
});
test('the claim stays off while unverified, and no screen names GCSE', () => {
  assert.equal(G.VERIFIED, false); assert.equal(G.gcseClaimAllowed(), false);
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.tsx$/.test(e.name) ? [path.join(d, e.name)] : []));
  for (const f of walk(path.join(root, 'src'))) assert.doesNotMatch(fs.readFileSync(f, 'utf8'), /GCSE|1MA1|Edexcel/, path.relative(root, f));
});
