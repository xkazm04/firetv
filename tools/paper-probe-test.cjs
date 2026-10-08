/**
 * The paper probe, stubbed (v2 M5c; the M5 kill row, plan section g). No model is called and sharp is never loaded:
 *   - the 20 answer keys are deterministic, every key item survives cleanPaper whole, every paper keeps the caps and the
 *     mix (three items the desk has no topic for, one past Foundation, one naming two statements);
 *   - no stem shares a run of 4 or more words with the can text of a code it keys;
 *   - a stubbed read of every rendered paper scores 100%; one code moved to another topic scores that item down and only
 *     it; one mark misread leaves the kill figure as it is and moves marks read down; one label misread scores it down;
 *   - paperRead's request carries the schema and the statement list, asks for no arithmetic on marks, names no board;
 *   - each SVG holds its key's labels and marks, and no statement code;
 *   - the --stub run completes and its report says STUBBED in its first line.
 * Run with npm test in desk/ (directly: node tools/paper-probe-test.cjs).
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
const { test } = require('node:test');
const { execFileSync } = require('node:child_process');
const { root } = require('./ts-load.cjs');
const P = require('./paper-probe.cjs');
const { STATEMENTS } = require(path.join(root, 'src/lib/library/gcse.ts'));
const R = require(path.join(root, 'src/lib/rules/recovery.ts'));
const S = require(path.join(root, 'src/lib/rules/paperScore.ts'));
const PR = require(path.join(root, 'src/lib/desk/paperRead.ts'));
const reg = require(path.join(root, 'src/lib/engines/registry.ts'));
const { topicsOf } = require(path.join(root, 'src/lib/library/paths.ts'));

const BY = new Map(STATEMENTS.map((s) => [s.code, s]));
const SCHOOL = new Set(topicsOf('school').map((t) => t.id));
const onDesk = (c) => BY.get(c).touches.some((id) => SCHOOL.has(id));
const copy = (key) => key.map((k) => ({ ...k, codes: [...k.codes] }));
const PAPERS = P.makePapers();

test('paper probe 1: the 20 keys are deterministic, survive cleanPaper whole, and keep the caps and the mix', () => {
  assert.equal(PAPERS.length, 20);
  assert.deepEqual(P.makePapers(P.SEED).map((p) => [p.key, p.svg]), PAPERS.map((p) => [p.key, p.svg]), 'same seed, same papers');
  assert.notDeepEqual(P.makePapers(P.SEED + 1).map((p) => p.key), PAPERS.map((p) => p.key), 'another seed, other papers');
  let parts = 0;
  for (const p of PAPERS) {
    const c = R.cleanPaper(p.key);
    assert.deepEqual(c.items, p.key, `paper ${p.n}: every key item is a clean item, as it is`);
    assert.deepEqual([c.unmapped, c.dropped, c.droppedCodes], [[], [], []], `paper ${p.n}`);
    assert.ok(p.key.length <= R.MAX_ITEMS && p.key.reduce((t, k) => t + k.outOf, 0) <= R.PAPER_MARKS, `paper ${p.n}: items and marks within the caps`);
    for (const k of p.key) {
      assert.ok(k.outOf >= 1 && k.outOf <= R.MAX_OUT_OF && k.marks >= 0 && k.marks <= k.outOf && k.q.length <= R.MAX_LABEL, `paper ${p.n} ${k.q}`);
      assert.ok(k.codes.length >= 1 && k.codes.length <= R.MAX_CODES && k.codes.every((x) => BY.has(x)), `paper ${p.n} ${k.q}: real codes`);
    }
    assert.ok(p.key.filter((k) => k.codes.some((x) => BY.get(x).foundation && !onDesk(x))).length >= 3, `paper ${p.n}: at least three items the desk has no topic for`);
    assert.equal(p.key.filter((k) => k.codes.some((x) => !BY.get(x).foundation)).length, 1, `paper ${p.n}: one item past Foundation`);
    assert.ok(p.key.some((k) => k.codes.length === 2), `paper ${p.n}: an item naming two statements`);
    parts += p.key.filter((k) => /^\d+\([a-c]\)$/.test(k.q)).length;
  }
  assert.ok(parts >= 10, 'labels like 3(a)/3(b) are on the papers');
});

test('paper probe 2: no stem shares a run of 4 or more words with the can text of a code it keys', () => {
  const stems = P.POOL.flatMap((e) => [...e.parts]);
  assert.ok(stems.length >= 60);
  for (const s of stems) assert.equal(P.echoRun(s.stem, s.codes), null, s.stem);
  // the check itself: a stem that quotes its statement is caught
  assert.deepEqual(P.echoRun('Solve 3n > 2 and show the solution on a number line.', ['A22']), { code: 'A22', run: 'and show the solution' });
  assert.equal(P.echoRun('Show the answer on the line.', ['A22']), null);
});

test('paper probe 3: a stubbed read of every rendered paper scores 100%', async () => {
  const { report } = await P.runProbe();
  const { run } = report;
  assert.equal(report.stubbed, true);
  assert.equal(run.papers, 20);
  assert.ok(run.items >= 200);
  assert.deepEqual([run.mapped, run.labels, run.marks, run.codes], [run.items, run.items, run.items, run.items]);
  assert.deepEqual([run.dropped, run.extra, run.percent.mapped, run.pass, run.marksQuestion], [0, 0, 100, true, false]);
  assert.ok(report.papers.every((p) => p.error === null));
});

/** The first item of the first paper with a single code on a desk topic, and a statement whose topics share none with it. */
function oneCodeItem() {
  for (const p of PAPERS) for (let i = 0; i < p.key.length; i++) {
    const k = p.key[i];
    if (k.codes.length !== 1 || !onDesk(k.codes[0])) continue;
    const mine = new Set(BY.get(k.codes[0]).touches);
    const other = STATEMENTS.find((s) => s.touches.some((id) => SCHOOL.has(id)) && !s.touches.some((id) => mine.has(id)));
    return { n: p.n, i, other: other.code };
  }
}
const scoreOf = (key, rows) => S.scorePaper(key, R.cleanPaper(rows));

test('paper probe 4: one code changed to a statement on another topic scores that item down, and only that item', async () => {
  const at = oneCodeItem(), key = PAPERS[at.n - 1].key;
  const rows = copy(key); rows[at.i].codes = [at.other];
  const s = scoreOf(key, rows);
  assert.equal(s.mapped, key.length - 1);
  assert.deepEqual(s.perItem.map((x, i) => x.mapped), key.map((_, i) => i !== at.i), 'only that item');
  assert.deepEqual([s.perItem[at.i].label, s.perItem[at.i].marks, s.perItem[at.i].codes], [true, true, false]);
  // the same through the whole probe: the run loses exactly one mapped item
  const { report } = await P.runProbe({ stub: (k) => { const r = copy(k); if (JSON.stringify(k) === JSON.stringify(key)) r[at.i].codes = [at.other]; return r; } });
  assert.equal(report.run.mapped, report.run.items - 1);
  // a different code that reaches the same desk topics is the same unit: still mapped, codes not read exactly
  const n2 = PAPERS.flatMap((p) => p.key.map((k) => [p.key, k])).find(([, k]) => k.codes.join() === 'R10');
  const same = copy(n2[0]); same[n2[0].indexOf(n2[1])].codes = ['R7'];
  const t = scoreOf(n2[0], same), x = t.perItem[n2[0].indexOf(n2[1])];
  assert.deepEqual([t.mapped, x.mapped, x.codes], [n2[0].length, true, false], 'R7 and R10 both reach unit-rate');
});

test('paper probe 5: a mark misread as another valid value leaves the kill figure as it is and moves marks read down', async () => {
  const key = PAPERS[0].key, rows = copy(key), i = key.findIndex((k) => k.outOf >= 2);
  rows[i].marks = rows[i].marks === 0 ? 1 : rows[i].marks - 1;
  const s = scoreOf(key, rows);
  assert.deepEqual([s.mapped, s.labels, s.codes, s.marks], [key.length, key.length, key.length, key.length - 1]);
  assert.equal(s.perItem[i].marks, false);
  // every mark misread: the kill figure still passes, and the report asks the owner about the marks plainly
  const { report, md } = await P.runProbe({ stub: (k) => copy(k).map((r) => ({ ...r, marks: r.marks === 0 ? 1 : r.marks - 1 })) });
  assert.deepEqual([report.run.pass, report.run.percent.mapped, report.run.marks, report.run.marksQuestion], [true, 100, 0, true]);
  assert.match(md, /A question for the owner/);
  assert.match(md, /marks were read exactly on only 0% of items/);
});

test('paper probe 6: a misread label scores that item down', () => {
  const key = PAPERS.find((p) => p.key.some((k) => k.q.includes('('))).key, i = key.findIndex((k) => k.q.includes('('));
  const rows = copy(key); rows[i].q = `9${rows[i].q}`;
  const s = scoreOf(key, rows);
  assert.deepEqual([s.mapped, s.labels, s.marks, s.codes, s.extra], [key.length - 1, key.length - 1, key.length - 1, key.length - 1, 1]);
  assert.deepEqual(s.perItem[i], { q: key[i].q, label: false, mapped: false, marks: false, codes: false });
  assert.equal(scoreOf(key, rows.map((r) => ({ ...r, q: r.q.toUpperCase().replace('(', ' (') }))).labels, key.length - 1, 'case and spaces are not a misread');
});

test('paper probe 7: paperRead\'s request carries a schema and the statement list, asks for no arithmetic on marks, and names no board', async () => {
  const seen = [];
  const rows = [{ q: '1', marks: 9, outOf: 3, codes: ['ZZ9', 'N2', 'N2', 'A1', 'R9'] }];
  reg.useProvider('vision', { name: 'stub', run: async (req) => { seen.push(req); return { raw: JSON.stringify({ items: rows }) }; } });
  let read;
  try { read = await PR.readPaper('aGVsbG8='); } finally { reg.resetProviders('vision'); }
  assert.equal(seen.length, 1);
  const req = seen[0];
  assert.equal(req.imageBase64, 'aGVsbG8=');
  assert.deepEqual(req.schema, PR.PAPER_SCHEMA);
  assert.deepEqual(req.schema.properties.items.items.required, ['q', 'marks', 'outOf', 'codes']);
  for (const s of STATEMENTS) assert.ok(req.prompt.includes(`\n${s.code}: ${s.can}`), s.code);
  assert.ok(req.prompt.startsWith(PR.PAPER_ASK));
  assert.doesNotMatch(PR.PAPER_ASK, /\b(add|adds|adding|added|sum|sums|count|counts|counting|total|totals|compare|compares|comparing|altogether|how many|difference|work out)\b/i);
  assert.doesNotMatch(req.prompt, /GCSE|1MA1|Edexcel|Pearson|specification/i);
  assert.match(PR.PAPER_ASK, new RegExp(`at most ${R.MAX_CODES} codes`));
  assert.deepEqual(read.rows, rows, 'the raw rows only: the reader drops and fixes nothing, cleanPaper decides');
  assert.equal(read.provider, 'stub');
});

test('paper probe 8: each SVG holds its key\'s labels and marks, and names no statement code', () => {
  const textOf = (s) => [...s.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
  const codes = new RegExp(`\\b(${STATEMENTS.map((s) => s.code).join('|')})\\b`);
  for (const p of PAPERS) {
    assert.match(p.svg, /^<svg [^>]*width="1240" height="1754"/, 'A4 proportions');
    for (const k of p.key) {
      const [, n, part] = /^(\d+)(\([a-c]\))?$/.exec(k.q);
      const qg = new RegExp(`<g data-question="${n}">([\\s\\S]*?)\\n</g>`).exec(p.svg);
      assert.ok(qg && textOf(qg[1])[0] === n, `paper ${p.n}: question ${n} printed`);
      const ig = new RegExp(`<g data-q="${k.q.replace(/[()]/g, '\\$&')}">([\\s\\S]*?)</g>`).exec(p.svg);
      const t = textOf(ig[1]);
      if (part) assert.equal(t[0], part, `paper ${p.n} ${k.q}: the part letter printed`);
      assert.ok(t.includes(`(${k.outOf})`), `paper ${p.n} ${k.q}: the allocation`);
      assert.ok(t.includes(`${k.marks}/${k.outOf}`), `paper ${p.n} ${k.q}: the marker's marks`);
    }
    assert.doesNotMatch(textOf(p.svg).join('\n'), codes, `paper ${p.n}: no code on the page`);
    assert.doesNotMatch(p.svg, /GCSE|1MA1|Edexcel/i);
  }
});

test('paper probe 9: the --stub run completes, writes its report, and says STUBBED in its first line', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-probe-'));
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'paper-probe.cjs'), '--stub', '--out', out], { cwd: root, stdio: 'pipe' });
    const md = fs.readFileSync(path.join(out, 'report.md'), 'utf8'), r = JSON.parse(fs.readFileSync(path.join(out, 'report.json'), 'utf8'));
    assert.match(md.split('\n')[0], /^STUBBED/);
    assert.equal(r.stubbed, true);
    assert.match(r.verdict, /^STUBBED/);
    assert.equal(r.run.percent.mapped, 100);
    assert.equal(fs.readdirSync(path.join(out, 'papers')).filter((f) => f.endsWith('.svg')).length, 20);
    assert.equal(fs.readdirSync(path.join(out, 'papers')).filter((f) => f.endsWith('.png')).length, 0, 'no image is made in a stubbed run');
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});
