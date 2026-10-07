/**
 * The style meter and the simulated twin probe (v2 T1; owner decisions S4 email/chat first, V2-O1 simulated).
 *   - every measure is an integer (Twin Card 1.0 forbids non-integers in a part);
 *   - dims are 1-5 on the card's eight dimensions and keep its coherence rules, for any input;
 *   - distinct writers measure apart; a writer measures near themselves; distance is symmetric and 0 for the same text;
 *   - copyRun finds a lifted run of eight words; withinBands reads length against the writer's own range;
 *   - the probe's dry run (stub engine) completes for eight writers, marks itself simulated, and disqualifies a twin
 *     draft that copies the writer's corpus.
 * Run with npm test in desk/ (directly: node tools/style-rules-test.cjs). No model is called.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test } = require('node:test');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../desk');
let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error("This suite transpiles desk TypeScript with desk's own compiler. Run `npm install` in desk/ first, then `npm test` from desk/."); process.exit(1); }
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const S = require(path.join(root, 'src/lib/rules/style.ts'));

const TERSE = ['ok', 'sure, 5pm works', 'yep done', 'cant today, tmrw?', 'got it thx', 'nope', 'on my way', 'fine by me'];
const FORMAL = ['Dear Anna,\nThank you for your message regarding the schedule. I would like to confirm our meeting on Thursday at ten.\nKind regards,\nPetr', 'Good morning,\nPlease find attached the revised report. Kindly let me know if any further changes are required.\nBest regards,\nPetr', 'Dear team,\nFurthermore, the budget review has been moved to Monday. I would appreciate your attendance.\nSincerely,\nPetr'];
const BUBBLY = ['omg yes!! 😍 cant wait haha', 'that was SO fun!!! thank you 🥰', 'lol no way 😂 tell me everything!', 'yay!! see u soon 💕'];
const ints = (o) => Object.values(o).every((v) => typeof v === 'object' ? ints(v) : typeof v === 'string' || Number.isInteger(v));

test('every measure is an integer, and an empty corpus measures zero without throwing', () => {
  for (const c of [TERSE, FORMAL, BUBBLY, [], ['   '], ['One.']]) assert(ints(S.styleSheet(c)), JSON.stringify(c).slice(0, 40));
  assert.equal(S.styleSheet([]).messages, 0);
});
test('dims are 1-5 on the eight dimensions and keep the card\'s coherence rules, for any input', () => {
  const corpora = [TERSE, FORMAL, BUBBLY, [], ['Dear Sir, LOL!!! 😂😂 omg haha kindly regarding furthermore!!!'], ['x'.repeat(5000)]];
  for (const c of corpora) {
    const d = S.twinDims(S.styleSheet(c));
    assert.deepEqual(Object.keys(d), [...S.DIMS]);
    for (const v of Object.values(d)) assert(Number.isInteger(v) && v >= 1 && v <= 5);
    assert(!(d.formality >= 4 && d.expressiveness >= 4), 'formality >= 4 never with expressiveness >= 4');
    assert(!(d.humor === 5 && d.formality === 5));
  }
});
test('distinct writers measure apart; a writer measures nearer themselves than another', () => {
  const t = S.twinDims(S.styleSheet(TERSE)), f = S.twinDims(S.styleSheet(FORMAL)), b = S.twinDims(S.styleSheet(BUBBLY));
  assert(f.formality > t.formality && f.formality > b.formality, 'the letters are the most formal');
  assert(b.expressiveness > f.expressiveness && b.energy > t.energy, 'the bubbly one is the most expressive and energetic');
  assert(t.length <= f.length, 'the terse one is the shortest');
  const self = S.styleDistance(S.styleSheet(TERSE.slice(0, 4)), S.styleSheet(TERSE.slice(4)));
  assert(self < S.styleDistance(S.styleSheet(TERSE), S.styleSheet(FORMAL)), 'half a writer is nearer the other half than another writer');
  const a = S.styleSheet(BUBBLY), z = S.styleSheet(FORMAL);
  assert.equal(S.styleDistance(a, a), 0); assert.equal(S.styleDistance(a, z), S.styleDistance(z, a)); assert(Number.isInteger(S.styleDistance(a, z)));
});
test('copyRun finds a lifted run of eight words; withinBands reads length against the writer\'s range', () => {
  const src = 'Please find attached the revised report and let me know if anything else is needed.';
  assert.equal(S.copyRun(src, 'Hi! please find attached the revised report and let me know soon.', 8), 'please find attached the revised report and let');
  assert.equal(S.copyRun(src, 'The report is attached; tell me if more is needed.', 8), null);
  const terse = S.styleSheet(TERSE);
  assert.equal(S.withinBands(terse, 'ok see you'), true);
  assert.equal(S.withinBands(terse, FORMAL[0]), false, 'a full letter is outside a terse writer\'s range');
});
test('the probe\'s dry run completes for eight writers, says it is simulated, and disqualifies a copied twin draft', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'twin-probe-'));
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'twin-probe.cjs'), '--stub', '--out', out], { cwd: root, stdio: 'pipe' });
    const r = JSON.parse(fs.readFileSync(path.join(out, 'report.json'), 'utf8'));
    assert.equal(r.simulated, true); assert.equal(r.stub, true); assert.equal(r.of, 8); assert.equal(r.need, 6); assert.equal(r.writers.length, 8);
    assert(r.writers.every((w) => !w.error && w.trials.length === 3), 'every writer ran three trials');
    // the stub's twin echoes the writer's own message: wherever that is a lifted run, the trial is not won
    assert(r.writers.some((w) => w.trials.some((t) => t.copied && !t.won)), 'the copy guard disqualifies');
    assert.match(fs.readFileSync(path.join(out, 'report.md'), 'utf8'), /not proof that a twin sounds like a real person/);
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});
