/**
 * The frozen Calculus 1 table (v2 M3b-3a): every observable result of rules/calc.ts on every Calculus 1 spec the
 * calc suites use, written to tools/calc1-frozen.json BEFORE the seam moves any code, and compared byte for byte by
 * tools/calc2-seam-test.cjs afterwards. The seam (and every later slice) must leave it equal; a change to a Calculus 1
 * word is made openly (OLD/NEW, with the reason) by regenerating it in the commit that changes the word.
 *
 * Specs are collected from the suites' own sources (see SOURCES): the sweep spec per topic and CHECKS in
 * calc-rules-test.cjs (with each answer the suite pairs with a spec), plus every object literal `{shape: '<calc shape>' ...}`
 * that evaluates on its own in the other calc suites. Each spec records wellFormed, question (plain and tex), checkAnswer
 * on its paired answers and PROBE_ANSWERS, leaksCalc on its plain question, on withheldCalc(spec) and on PROBE_LINES,
 * and specFromQuestion on its plain question. Also recorded: slipsFor each shape, CALC_SHAPES, TOLERANCE, CALC_WITHHELD
 * and CALC_SLIPS.
 *
 * Usage: node tools/calc1-frozen-gen.cjs   (writes tools/calc1-frozen.json; `require` it for table()/entriesOf()).
 * Pure: no network, no model.
 */
const fs = require('node:fs'), path = require('node:path');
require('./ts-load.cjs');
const root = path.resolve(__dirname, '../desk');
const C = require(path.join(root, 'src/lib/rules/calc.ts'));

const OUT = path.join(__dirname, 'calc1-frozen.json');
const SHAPES = ['evaluate', 'derivative', 'derivative-at', 'antiderivative', 'definite-integral', 'limit', 'critical-point', 'extremum', 'newton-step'];
const SOURCES = ['calc-rules-test.cjs', 'calc-course-test.cjs', 'calc-hint-test.cjs', 'calc-marking-test.cjs', 'calc-practice-test.cjs', 'calc-word-test.cjs', 'calc2-path-test.cjs', 'chain-rules-test.cjs', 'plot-rules-test.cjs', 'maths-judge-test.cjs', 'maths-rules-test.cjs', 'maths-tv-test.cjs', 'maths-type-test.cjs'];
const PROBE_ANSWERS = ['0', '1', '-1', '2', '1/2', 'inf', '-inf', 'dne', 'x', 'x^2 + C', '', 'converges'];
const PROBE_LINES = ['the answer is 1', 'it converges', 'it goes to infinity'];

/** Every `{shape: '<calc shape>' ...}` literal in a source text that evaluates alone. */
function literals(text) {
  const out = [], re = /\{\s*["']?shape["']?\s*:\s*["']([a-z-]+)["']/g;
  let m;
  while ((m = re.exec(text))) {
    if (!SHAPES.includes(m[1])) continue;
    let depth = 0, end = -1;
    for (let k = m.index; k < text.length; k++) {
      if (text[k] === '{') depth++;
      else if (text[k] === '}' && --depth === 0) { end = k; break; }
    }
    if (end < 0) continue;
    try { out.push(new Function(`return (${text.slice(m.index, end + 1)})`)()); } catch { /* uses a variable: skipped */ }
  }
  return out;
}

/** [{ spec, answers }] gathered from the suites, sorted by the spec's canonical text. */
function entriesOf() {
  const by = new Map(), at = (spec) => {
    const k = JSON.stringify(spec);
    if (!by.has(k)) by.set(k, { spec, answers: new Set() });
    return by.get(k);
  };
  const stats = { sources: {} };
  for (const f of SOURCES) {
    const text = fs.readFileSync(path.join(__dirname, f), 'utf8');
    const found = literals(text);
    for (const s of found) at(s);
    stats.sources[f] = found.length;
  }
  const text = fs.readFileSync(path.join(__dirname, 'calc-rules-test.cjs'), 'utf8');
  const head = text.indexOf('const D={'), checks = text.indexOf('const CHECKS=['), checksEnd = text.indexOf('\n];', checks) + 3;
  const pairs = new Function(`${text.slice(head, checksEnd)}; return CHECKS;`)();
  for (const [spec, answer] of pairs) at(spec).answers.add(answer);
  const sweepAt = text.indexOf('const SWEEP={'), sweepEnd = text.indexOf('\n};', sweepAt) + 3;
  const sweep = new Function(`${text.slice(sweepAt, sweepEnd)}; return SWEEP;`)();
  for (const spec of Object.values(sweep)) at(spec);
  stats.checks = pairs.length;
  stats.sweep = Object.keys(sweep).length;
  const entries = [...by.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([, e]) => ({ spec: e.spec, answers: [...e.answers] }));
  return { entries, stats };
}

/** The table for these entries (each { spec, answers }), as a plain object. */
function table(entries) {
  let calls = 0;
  const rows = entries.map(({ spec, answers }) => {
    const q = C.question(spec), plain = q ? q.plain : null;
    const all = [...answers, ...PROBE_ANSWERS.filter((p) => !answers.includes(p))];
    const row = {
      spec, answers,
      wellFormed: C.wellFormed(spec),
      question: q,
      checks: all.map((a) => [a, C.checkAnswer(spec, a)]),
      leaks: {
        question: plain === null ? null : C.leaksCalc(spec, plain),
        withheld: C.leaksCalc(spec, C.withheldCalc(spec)),
        withheldLine: C.withheldCalc(spec),
        probes: PROBE_LINES.map((l) => [l, C.leaksCalc(spec, l)]),
      },
      fromQuestion: plain === null ? null : C.specFromQuestion(plain),
    };
    calls += 3 + all.length + 3 + PROBE_LINES.length + 1;
    return row;
  });
  return {
    shapes: C.CALC_SHAPES, tolerance: C.TOLERANCE, withheld: C.CALC_WITHHELD, slips: C.CALC_SLIPS,
    slipsFor: Object.fromEntries(C.CALC_SHAPES.map((s) => [s, C.slipsFor(s)])),
    specs: rows.length, calls: calls + C.CALC_SHAPES.length,
    rows,
  };
}

const text = (t) => JSON.stringify(t, null, 1) + '\n';

module.exports = { entriesOf, table, text, OUT, SOURCES, PROBE_ANSWERS, PROBE_LINES };

if (require.main === module) {
  const { entries, stats } = entriesOf();
  const t = table(entries);
  fs.writeFileSync(OUT, text(t));
  console.log(`calc1-frozen.json: ${t.specs} specs, ${t.calls} calls`);
  console.log(`literals per source: ${JSON.stringify(stats.sources)}; CHECKS pairs ${stats.checks}; sweep ${stats.sweep}`);
}
