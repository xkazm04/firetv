/**
 * Recovery from a failed paper (v2 M5a; lib/rules/recovery.ts): cleanPaper drops what it cannot read with a reason and
 * never guesses a code; recovery counts lost marks against every statement an item names, gives each desk topic once
 * with its sum, orders most lost first without ever putting a topic before its own prerequisite, keeps the statements
 * the desk cannot teach apart (higher-only flagged), agrees with gcseCoverage() over every Foundation statement, and
 * returns no string naming the board while the map is unverified. Run with npm test in desk/ (directly: node
 * tools/recovery-rules-test.cjs).
 */
const path = require('node:path'), assert = require('node:assert/strict');
const { test } = require('node:test');
const { src } = require('./ts-load.cjs');
const R = require(path.join(src, 'lib/rules/recovery.ts'));
const G = require(path.join(src, 'lib/library/gcse.ts'));
const { topicsOf, topicIn } = require(path.join(src, 'lib/library/paths.ts'));

const it = (q, marks, outOf, codes) => ({ q, marks, outOf, codes });
const ids = (r) => r.topics.map((t) => t.id);
const SCHOOL = new Set(topicsOf('school').map((t) => t.id));

test('validation: every drop reason, with its row and a plain why', () => {
  const raw = [
    'not an object', // 1
    it('', 1, 2, ['N1']), // 2
    it('   ', 1, 2, ['N1']), // 3
    it('12(a)(iii)xyz', 1, 2, ['N1']), // 4
    it('1.5', 1.5, 2, ['N1']), // 5
    it('2', '1', 2, ['N1']), // 6
    it('3', 1, 2.5, ['N1']), // 7
    it('4', 0, 0, ['N1']), // 8
    it('5', 1, R.MAX_OUT_OF + 1, ['N1']), // 9
    it('6', -1, 2, ['N1']), // 10
    it('7', 3, 2, ['N1']), // 11
    it('8(a)', 1, 2, ['N1']), // 12: kept
    it('8 (A)', 2, 2, ['N1']), // 13: the same question
    it('GCSE', 1, 2, ['N1']), // 14
    null, // 15
    [1, 2], // 16
  ];
  const c = R.cleanPaper(raw);
  assert.deepEqual(c.dropped.map((d) => [d.row, d.reason]), [
    [1, 'not-an-item'], [2, 'no-label'], [3, 'no-label'], [4, 'label-too-long'], [5, 'marks-not-whole'], [6, 'marks-not-whole'],
    [7, 'out-of-not-whole'], [8, 'out-of-under-one'], [9, 'out-of-over-cap'], [10, 'marks-under-zero'], [11, 'marks-over-out-of'],
    [13, 'repeated-label'], [14, 'label-names-the-board'], [15, 'not-an-item'], [16, 'not-an-item'],
  ]);
  for (const d of c.dropped) assert(d.why.length > 10 && /\.$/.test(d.why), d.reason);
  assert.equal(c.dropped.find((d) => d.row === 13).q, '8 (A)', 'a droppable label that can be shown is shown');
  assert.equal(c.dropped.find((d) => d.row === 4).q, '', 'a too-long label is not echoed');
  assert.equal(c.dropped.find((d) => d.row === 14).q, '', 'a label naming the board is not echoed');
  assert.deepEqual(c.items, [it('8(a)', 1, 2, ['N1'])]);
  assert.deepEqual(c.unmapped, []);
  // the caps
  assert.equal(R.PAPER_MARKS, 80); assert.equal(R.MAX_ITEMS, 80); assert.equal(R.MAX_OUT_OF, 6);
  assert.equal(R.cleanPaper([it('1', 6, 6, ['N1'])]).items.length, 1, 'MAX_OUT_OF itself is allowed');
  const ones = Array.from({ length: 81 }, (_, i) => it(String(i + 1), 0, 1, ['N1']));
  const many = R.cleanPaper(ones);
  assert.equal(many.items.length, 80); assert.deepEqual(many.dropped.map((d) => [d.row, d.reason]), [[81, 'too-many-items']]);
  const sixes = Array.from({ length: 14 }, (_, i) => it(String(i + 1), 0, 6, ['N1'])); // 84 marks
  const heavy = R.cleanPaper([...sixes, it('15', 0, 2, ['N1'])]);
  assert.deepEqual(heavy.dropped.map((d) => [d.row, d.reason]), [[14, 'over-paper-total']], 'the item past 80 marks is dropped');
  assert.equal(heavy.items.length, 14, 'the 2-mark item after it still fits'); assert.equal(heavy.items.reduce((a, x) => a + x.outOf, 0), 80);
  // a raw paper that is not an array is an empty paper
  for (const x of [undefined, null, {}, 'x', 7]) assert.deepEqual(R.cleanPaper(x), { items: [], unmapped: [], dropped: [], droppedCodes: [] });
  // a dropped row adds nothing to the totals
  assert.deepEqual(R.recovery(raw).totals, { marks: 1, outOf: 2, lost: 1 });
});

test('validation: an unknown code is dropped, not guessed; only-unknown codes land in unmapped and still count', () => {
  const c = R.cleanPaper([
    it('1', 0, 3, ['N2', 'n2', 'N 2', 'N2 ', 'N99', 'X1', 7, '']),
    it('2', 1, 4, ['Q7', 'N2x']),
    it('3', 0, 2, 'N2'),
    it('4', 0, 2, ['N1', 'N2', 'N1', 'A1', 'A17']),
  ]);
  assert.deepEqual(c.items, [it('1', 0, 3, ['N2']), it('4', 0, 2, ['N1', 'N2', 'A1'])], 'N2 kept once; never n2 or N 2 matched to N2; at most 3');
  assert.deepEqual(c.unmapped, [it('2', 1, 4, []), it('3', 0, 2, [])]);
  assert.deepEqual(c.droppedCodes.map((d) => [d.q, d.code, d.reason]), [
    ['1', 'n2', 'unknown-code'], ['1', 'N 2', 'unknown-code'], ['1', 'N99', 'unknown-code'], ['1', 'X1', 'unknown-code'],
    ['1', '', 'not-a-code'], ['1', '', 'not-a-code'], ['2', 'Q7', 'unknown-code'], ['2', 'N2x', 'unknown-code'], ['4', 'A17', 'too-many-codes'],
  ]);
  const r = R.recovery([it('1', 0, 3, ['N99']), it('2', 2, 5, ['N10'])]);
  assert.deepEqual(r.unmapped, [it('1', 0, 3, [])]);
  assert.deepEqual(r.totals, { marks: 2, outOf: 8, lost: 6 }, "the unmapped item's 3 lost marks are in the total");
  assert.deepEqual(ids(r), ['dec-convert']); assert.equal(r.topics[0].lost, 3, 'and on no topic');
  assert.deepEqual(r.notOnDesk, []);
  assert.equal(R.cleanPaper([it('1', 0, 1, ['GCSE'])]).droppedCodes[0].code, '', 'a code naming the board is not echoed');
});

test('a full-marks item adds nothing; an item with two codes counts in full against both', () => {
  const full = R.recovery([it('1', 3, 3, ['N10', 'N3'])]);
  assert.deepEqual(full.topics, []); assert.deepEqual(full.notOnDesk, []); assert.deepEqual(full.totals, { marks: 3, outOf: 3, lost: 0 });
  const r = R.recovery([it('5(b)', 1, 4, ['N10', 'G20']), it('6', 2, 2, ['G20'])]);
  assert.deepEqual(r.topics.map((t) => [t.id, t.lost, t.items, t.codes]).sort(), [
    ['dec-convert', 3, ['5(b)'], ['N10']], ['pythagoras', 3, ['5(b)'], ['G20']],
  ], 'both statements lost the 3 marks; the full-marks item 6 is behind nothing');
  assert.equal(r.totals.lost, 3, 'the paper lost 3, once');
  const gap = R.recovery([it('7', 0, 2, ['N3', 'N4'])]);
  assert.deepEqual(gap.notOnDesk.map((o) => [o.code, o.lost]), [['N3', 2], ['N4', 2]]);
});

test('two statements on one topic give one entry with the sum', () => {
  // N11, R4 and R5 all touch ratio-share only
  const r = R.recovery([it('1', 1, 3, ['N11']), it('2(a)', 0, 2, ['R4']), it('2(b)', 2, 5, ['R5'])]);
  assert.deepEqual(r.topics, [{ id: 'ratio-share', name: topicIn('ratio-share').name, lost: 7, items: ['1', '2(a)', '2(b)'], codes: ['N11', 'R4', 'R5'] }]);
  // one item reaching one topic through two of its codes counts once there (and in full on each statement)
  const one = R.recovery([it('3', 0, 4, ['R4', 'R5'])]);
  assert.deepEqual(one.topics.map((t) => [t.id, t.lost, t.items, t.codes]), [['ratio-share', 4, ['3'], ['R4', 'R5']]]);
  // N12 touches two topics: both get the item
  const two = R.recovery([it('4', 1, 3, ['N12'])]);
  assert.deepEqual(ids(two).sort(), ['frac-of-amount', 'pct-of-amount']); assert(two.topics.every((t) => t.lost === 2));
});

test('the prerequisite rule: a later topic with more lost marks still comes after its own prerequisite', () => {
  // unit-rate needs ratio-share, which needs frac-equivalent (followed through: ratio-share is not on the paper)
  const r = R.recovery([it('1', 2, 3, ['N1']), it('2', 0, 4, ['R7']), it('3', 0, 2, ['G16'])]);
  assert.deepEqual(r.topics.map((t) => [t.id, t.lost]), [['frac-equivalent', 1], ['unit-rate', 4], ['area', 2]],
    'frac-equivalent is pulled forward by unit-rate; sorting by lost marks alone would say unit-rate, area, frac-equivalent');
  // pythagoras needs area
  const p = R.recovery([it('1', 0, 5, ['G20']), it('2', 0, 1, ['G16'])]);
  assert.deepEqual(ids(p), ['area', 'pythagoras']);
  // a chain: pct-change needs pct-of-amount needs dec-convert
  const c = R.recovery([it('1', 0, 1, ['N10']), it('2', 0, 3, ['N12']), it('3', 0, 2, ['S4'])]);
  assert.deepEqual(ids(c), ['frac-of-amount', 'dec-convert', 'pct-of-amount', 'mean-range'],
    'pct-of-amount (3) pulls dec-convert (1) forward; frac-of-amount (3) needs nothing and goes first by its own lost marks');
  // unrelated topics go by lost marks, ties by path order
  const u = R.recovery([it('1', 0, 2, ['P3']), it('2', 0, 3, ['S4']), it('3', 0, 1, ['A1']), it('4', 0, 2, ['G16'])]);
  assert.deepEqual(u.topics.map((t) => [t.id, t.lost]), [['mean-range', 3], ['area', 2], ['probability', 2], ['linear-one-step', 1]]);
  // over a sweep of papers: never a topic before one of its listed prerequisites (followed through)
  const codes = G.STATEMENTS.filter((s) => s.touches.length).map((s) => s.code);
  const pre = (id, acc = new Set()) => { for (const q of topicIn(id).prereq) if (!acc.has(q)) { acc.add(q); pre(q, acc); } return acc; };
  let seed = 7; const rnd = (n) => ((seed = (seed * 1103515245 + 12345) % 2147483648) % n);
  for (let k = 0; k < 400; k++) {
    const paper = Array.from({ length: 1 + rnd(8) }, (_, i) => { const o = 1 + rnd(6); return it(String(i + 1), rnd(o + 1), o, [codes[rnd(codes.length)], codes[rnd(codes.length)]]); });
    const order = ids(R.recovery(paper));
    order.forEach((id, i) => { for (const q of pre(id)) if (order.includes(q)) assert(order.indexOf(q) < i, `${q} before ${id} in ${order}`); });
  }
});

test('notOnDesk: a gap statement keeps its can text and no topic; a higher-only statement is flagged, never dropped', () => {
  const r = R.recovery([it('1', 0, 2, ['N3']), it('2', 1, 5, ['A13', 'N10']), it('3', 0, 1, ['N3']), it('4', 0, 4, ['P8'])]);
  assert.deepEqual(r.notOnDesk, [
    { code: 'A13', can: G.STATEMENTS.find((s) => s.code === 'A13').can, lost: 4, items: ['2'], foundation: false },
    { code: 'P8', can: G.STATEMENTS.find((s) => s.code === 'P8').can, lost: 4, items: ['4'], foundation: true },
    { code: 'N3', can: G.STATEMENTS.find((s) => s.code === 'N3').can, lost: 3, items: ['1', '3'], foundation: true },
  ], 'by lost marks, ties in statement order');
  assert.deepEqual(r.topics.map((t) => [t.id, t.items, t.codes]), [['dec-convert', ['2'], ['N10']]], 'no gap code reaches a topic');
  for (const t of r.topics) for (const c of t.codes) assert(G.STATEMENTS.find((s) => s.code === c).touches.includes(t.id));
  for (const s of G.STATEMENTS.filter((x) => !x.foundation)) {
    const one = R.recovery([it('1', 0, 1, [s.code])]);
    assert.deepEqual(one.notOnDesk.map((o) => [o.code, o.foundation]), [[s.code, false]], s.code);
  }
});

test('the sweep: every Foundation statement reaches a school-path topic or notOnDesk, in step with gcseCoverage()', () => {
  const cov = G.gcseCoverage(); const touched = [], gaps = [];
  for (const st of G.FOUNDATION) {
    const r = R.recovery([it('1', 0, 2, [st.code])]);
    assert.equal(r.topics.length + r.notOnDesk.length > 0, true, st.code);
    assert(!(r.topics.length && r.notOnDesk.length), `${st.code} is either on the desk or not`);
    for (const t of r.topics) { assert(topicIn(t.id), t.id); assert(SCHOOL.has(t.id), `${t.id} is on the school path`); assert.equal(t.lost, 2); }
    assert.deepEqual(r.topics.map((t) => t.id).sort(), [...cov.topics[st.code]].sort(), st.code);
    if (r.topics.length) touched.push(st.code); else { gaps.push(st.code); assert.equal(r.notOnDesk[0].can, st.can); }
  }
  assert.deepEqual(touched, cov.touched); assert.deepEqual(gaps, cov.gaps);
  assert.equal(touched.length, cov.touched.length); assert.equal(gaps.length, cov.gaps.length);
});

test('no returned string names the board while the claim is off', () => {
  assert.equal(G.gcseClaimAllowed(), false);
  const strings = (x, out = []) => {
    if (typeof x === 'string') out.push(x);
    else if (Array.isArray(x)) x.forEach((y) => strings(y, out));
    else if (x && typeof x === 'object') Object.values(x).forEach((y) => strings(y, out));
    return out;
  };
  const codes = G.STATEMENTS.map((s) => s.code);
  let seed = 11; const rnd = (n) => ((seed = (seed * 1103515245 + 12345) % 2147483648) % n);
  const noisy = ['GCSE', '1MA1', 'gcse 4', ' 1ma1 ', 'Edexcel', '', 'N0', 'Z9'];
  let n = 0;
  for (let k = 0; k < 300; k++) {
    const paper = Array.from({ length: 1 + rnd(12) }, (_, i) => {
      const o = rnd(9) - 1, q = rnd(10) ? `${1 + rnd(20)}${'abc'[rnd(3)]}` : noisy[rnd(noisy.length)];
      return it(q, rnd(o + 3) - 1, o, Array.from({ length: rnd(5) }, () => (rnd(4) ? codes[rnd(codes.length)] : noisy[rnd(noisy.length)])));
    });
    for (const s of strings(R.recovery(paper))) { n++; assert.doesNotMatch(s, /GCSE|1MA1|Edexcel/i, s); }
  }
  assert(n > 1000, `${n} strings looked at`);
  for (const st of G.STATEMENTS) for (const s of strings(R.recovery([it('1', 0, 1, [st.code])]))) assert.doesNotMatch(s, /GCSE|1MA1|Edexcel/i, s);
});
