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
require('./ts-load.cjs');
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
test('directness reads more hedging as more indirect (Twin Card 5.1: blunt 1 ... indirect 5)', () => {
  const BLUNT = ['Send me the file today.', 'Move the meeting to Friday.', 'I need the budget by noon.', 'Do not change the plan.'];
  const HEDGED = ['Maybe we could move the meeting, if possible.', 'I think it might work, perhaps on Friday.', 'I guess it is probably fine, not sure though.', 'Just wondering if you would mind sending it, maybe today?'];
  const b = S.twinDims(S.styleSheet(BLUNT)).directness, h = S.twinDims(S.styleSheet(HEDGED)).directness;
  assert(b >= 1 && b <= 2, `blunt set reads ${b}`); assert(h >= 4 && h <= 5, `hedged set reads ${h}`);
});
test('email frames are measured apart: a greeting and sign-off alone are not ceremonial, line breaks do not shrink length or detail', () => {
  const CASUAL = ["Hi Ana,\nI can't make it tomorrow, sorry. Can we do next week instead?\nThanks,\nMartin", "Hey Tom,\nyeah that's fine, I'll bring the charger and we can sort it out at the pub.\nCheers,\nMartin", "Hi Jana,\nthanks, I'm on it. I'll send the files tonight, it's no trouble at all.\nThanks,\nMartin"];
  const LONG = ['Dear Ms Novak,\nThank you for your message regarding the schedule. I would like to confirm that the committee will meet on Thursday at ten, and furthermore that the revised budget, which was attached to the earlier notice, will be discussed in full before any vote is taken.\nKind regards,\nPetr Svoboda', 'Dear Mr Dvorak,\nPlease find attached the revised report. Kindly review the findings in the second section, because the figures there change the conclusion that was reached in the earlier draft, and let me know whether further changes are required before it is issued.\nSincerely,\nPetr Svoboda', 'Dear team,\nFurthermore, the budget review has been moved to Monday. I would appreciate your attendance, since several of the decisions cannot be taken without every department being represented at the table.\nBest regards,\nPetr Svoboda'];
  assert.equal(S.bodyOf(CASUAL[0]), "I can't make it tomorrow, sorry. Can we do next week instead?");
  const framed = S.twinDims(S.styleSheet(['Hi,\nok\nThanks,\nMartin', 'Hi,\nyes\nThanks,\nMartin', 'Hi,\nfine\nThanks,\nMartin']));
  assert(framed.formality <= 4, `a frame alone reads ${framed.formality}`);
  const c = S.twinDims(S.styleSheet(CASUAL)), l = S.twinDims(S.styleSheet(LONG));
  assert(c.formality <= 2, `casual emails read ${c.formality}`); assert(c.length >= 2, 'a casual email is more than a one-liner'); const bare = (xs) => S.twinDims(S.styleSheet(xs.map(S.bodyOf))); assert.equal(c.detail, bare(CASUAL).detail, 'the frame does not move detail'); assert.equal(l.detail, bare(LONG).detail);
  assert(l.formality >= 4, `formal emails read ${l.formality}`); assert(l.length >= 3 && l.detail >= 3, `long formal emails read length ${l.length}, detail ${l.detail}`);
  assert(S.styleSheet(LONG).wps.p90 > 30 && S.styleSheet(CASUAL).sentences === 5, 'sentences are the body sentences, not the signature lines');
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
