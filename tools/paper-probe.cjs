/**
 * The paper probe (v2 M5c; the M5 kill row, plan section g): can the vision engine read a marked paper well enough to
 * offer the photo path? Under 85% of items mapped to the right unit, the photo path is not offered and typed entry stays
 * the door (App Master ruling 1).
 *
 * Protocol:
 *   1. 20 papers are generated from a fixed seed. Each is an answer key (a raw paper of real statement codes within
 *      cleanPaper's caps: labels like 3(a)/3(b), marks and out of, some items with two codes, at least three items on
 *      statements the desk has no topic for, one item on a statement past Foundation) and its rendering as a marked
 *      paper: an SVG at A4 proportions, each question's label and stem in print, the mark allocation in brackets, and
 *      the marker's 2/3 in red beside it.
 *   2. The stems come from POOL below, each written for its key code(s). No stem shares a run of 4 or more words with
 *      the can text of a code it keys (echoRun): a stem that echoes the list the model picks from would measure
 *      copying, not reading.
 *   3. Live: each SVG is rasterized to PNG (sharp, from desk/node_modules), read by lib/desk/paperRead, cleaned by
 *      cleanPaper (lib/rules/recovery) and scored by lib/rules/paperScore against its key.
 *   4. The kill figure is mapped items / key items over the 20 papers; the probe passes at KILL_PERCENT (85) or more.
 *      Labels read, marks read exactly, codes read exactly, rows cleanPaper dropped and extra items are reported
 *      beside it and decide nothing. A pass with marks read under 85% is reported as a question for the owner.
 *
 * WHAT A PASS MEANS: the papers are clean renders, not phone photos of handwriting, so a pass is an upper bound on what a
 * real photo gives. A stubbed run reads no image at all: its report says STUBBED in its first line and it is never
 * recorded as the probe's result.
 *
 * Run on the owner's PC (Ollama up with the vision model), from desk/:   node ../tools/paper-probe.cjs [--seed n] [--out dir]
 * Stubbed, no engine and no sharp (what the gate runs):                 node ../tools/paper-probe.cjs --stub
 * Output: <out>/report.json, report.md and papers/ (default artifacts/paper-probe/<timestamp>, git-ignored).
 */
const fs = require('node:fs'), path = require('node:path');
const { root } = require('./ts-load.cjs');
const { STATEMENTS } = require(path.join(root, 'src/lib/library/gcse.ts'));
const { cleanPaper } = require(path.join(root, 'src/lib/rules/recovery.ts'));
const { scorePaper, scoreRun, KILL_PERCENT } = require(path.join(root, 'src/lib/rules/paperScore.ts'));

const SEED = 1729, PAPERS = 20;
const BY_CODE = new Map(STATEMENTS.map((s) => [s.code, s]));

// ---------------------------------------------------------------- the stem pool
// One entry is a question: a stem with its codes and what it is out of, or a lead with parts. Written for this probe;
// no stem quotes its statements' can text (echoRun).
const one = (stem, codes, outOf) => ({ parts: [{ stem, codes, outOf }] });
const multi = (lead, ...parts) => ({ lead, parts: parts.map(([stem, codes, outOf]) => ({ stem, codes, outOf })) });
const POOL = [
  // statements the desk has a topic for
  one('Write these numbers in order of size, smallest first: 0.6, 5/8, 0.65, 3/5', ['N1'], 2),
  one('Work out 3/4 + 2/5.', ['N2'], 2),
  one('Work out 4.6 × 0.3', ['N2'], 2),
  one('Work out 2 1/3 − 1 3/4. Give your answer as a mixed number.', ['N2'], 3),
  one('Work out 2/3 × 9/14. Give your answer in its simplest form.', ['N8'], 2),
  one('Write 0.375 as a fraction in its simplest form.', ['N10'], 2),
  one('Write 7/20 as a decimal.', ['N10'], 1),
  one('In a class, the ratio of boys to girls is 3 : 5. What fraction of the class are girls?', ['N11'], 1),
  one('A coat costs £84. In a sale, its price is cut by 1/3. Work out the sale price.', ['N12'], 2),
  one('Find 35% of 260 kg.', ['R9'], 2),
  one('A phone bill rose from £24 to £27. Work out the percentage increase.', ['R9'], 3),
  one('Sam pays £18 for a book in a 25% off sale. What was the price before the sale?', ['R9'], 3),
  one('Solve 5x − 7 = 18', ['A17'], 2),
  one('Solve 4(y − 3) = 2y + 10', ['A4', 'A17'], 3),
  one('Ella is x years old. Her mother is three times as old as Ella. Together their ages come to 52. Form an equation and find Ella\'s age.', ['A21', 'A17'], 4),
  one('Write an expression for the cost, in pence, of n pens at 45p each and one ruler at 80p.', ['A1'], 2),
  one('Write 45 : 60 in its simplest form.', ['R4'], 1),
  one('Share £72 between Ana and Ben so that Ana gets £5 for every £3 Ben gets.', ['R5'], 2),
  one('6 tins of soup cost £4.20. Work out the cost of 15 tins.', ['R10'], 2),
  one('A car travels 135 miles in 2 hours 15 minutes. Work out its average speed in miles per hour.', ['R11'], 3),
  one('Rice is sold in 2 kg bags for £3.40 or in 500 g bags for £0.95. Which bag is better value? Show how you decide.', ['R11'], 3),
  one('A trapezium has parallel sides of 7 cm and 11 cm, which are 4 cm apart. Work out its area.', ['G16'], 2),
  one('A circle has a radius of 6 cm. Work out its area. Give your answer to 1 decimal place.', ['G17', 'N15'], 3),
  one('A right-angled triangle has shorter sides of 9 cm and 12 cm. Work out the length of its longest side.', ['G20'], 3),
  one('A ladder 5 m long leans against a wall. Its foot is 1.4 m from the wall. How far up the wall does it reach?', ['G20'], 3),
  one('The probability that a bus is late is 0.15. What is the probability that the bus is not late?', ['P4'], 1),
  one('A dice is rolled 200 times and lands on six 41 times. Estimate the probability that it lands on six on the next roll.', ['P3'], 2),
  one('Two fair coins are thrown. List all the possible outcomes.', ['P7', 'N5'], 2),
  one('Here are the ages of six players: 14, 17, 15, 14, 19, 16. Work out the mean age and the range of the ages.', ['S4'], 3),
  // statements the desk has no topic for yet
  one('Work out 5 + 3 × (8 − 2)²', ['N3'], 2),
  one('Write 360 as a product of its prime factors.', ['N4'], 2),
  one('Find the highest common factor of 84 and 120.', ['N4'], 2),
  one('Write down the cube root of 64.', ['N6'], 1),
  one('Simplify 5⁷ ÷ 5⁴, leaving your answer as a power of 5.', ['N7'], 1),
  one('Write 0.00062 in standard form.', ['N9'], 1),
  one('Change 3.2 kilograms into grams.', ['R1'], 1),
  one('By rounding each number to one significant figure, estimate the value of 48.7 × 3.12 ÷ 0.51', ['N14', 'N15'], 3),
  one('Round 6.0749 to 2 decimal places.', ['N15'], 1),
  one('A length is 8.4 cm, correct to 1 decimal place. Write down the error interval for the length.', ['N15'], 2),
  one('Work out the value of 3a − 2b when a = 4 and b = −5.', ['A2'], 2),
  one('Make t the subject of v = u + at', ['A5'], 2),
  one('Draw the graph of y = 2x − 3 for values of x from −2 to 3.', ['A9'], 3),
  one('Find the gradient of the line through (1, 4) and (3, 10).', ['A10'], 2),
  one('Solve x² + 5x − 14 = 0 by factorising.', ['A18'], 3),
  one('Solve the simultaneous equations 2x + y = 11 and x − y = 1', ['A19'], 3),
  one('Solve 3n + 4 > 19, then write down the smallest whole number n can be.', ['A22'], 2),
  one('The first term of a sequence is 5. Each term after it is double the term before, minus 1. Write down the next three terms.', ['A23'], 2),
  one('Here are the first four terms of a sequence: 7, 11, 15, 19. Find an expression for the nth term.', ['A25'], 2),
  one('Kim walks 2 km in 30 minutes, rests for 10 minutes, then walks 1 km in 20 minutes. Draw a travel graph of her journey.', ['A14'], 3),
  one('On a map, 1 cm stands for 4 km. Two towns are 6.5 cm apart on the map. How far apart are they really?', ['R2'], 2),
  one('What fraction of 2 hours is 45 minutes? Simplify your answer.', ['R3'], 2),
  one('£2000 is invested at 3% compound interest a year. Work out its value after 2 years.', ['R16'], 3),
  one('Two angles on a straight line are 3x and 2x + 30. Work out the value of x.', ['G3', 'A17'], 3),
  one('Write down the name of a quadrilateral with exactly one pair of parallel sides.', ['G4'], 1),
  one('Reflect the point (3, −2) in the x-axis. Write down the coordinates of its image.', ['G7', 'A8'], 2),
  one('What is the name of a straight line that joins two points on a circle without passing through its centre?', ['G9'], 1),
  one('How many flat surfaces, straight sides and corners does a triangular prism have?', ['G12'], 2),
  one('The bearing of B from A is 070°. Work out the bearing of A from B.', ['G15'], 2),
  one('A sector of a circle has a radius of 9 cm and an angle of 40°. Work out the length of its curved edge.', ['G18'], 3),
  one('Write down the exact value of tan 45°.', ['G21'], 1),
  one('Translate the point (2, 5) by 3 to the right and 4 down, written as a column vector. Write down the vector and the new point.', ['G24'], 2),
  one('Vector a goes 2 right and 3 up; vector b goes 1 left and 4 up. Work out 2a + b as a column vector.', ['G25'], 2),
  one('Of 60 pupils, 25 walk to school. Of those who walk, 10 have breakfast at school. Complete the frequency tree.', ['P1'], 3),
  one('A fair dice is rolled 300 times. How many times would you expect it to land on a 5?', ['P2'], 2),
  one('In a group of 30 people, 18 have a cat, 12 have a dog and 5 have both. Draw a Venn diagram to show this.', ['P6'], 3),
  one('A bag holds 4 red and 6 blue counters. One is taken and not put back, then a second is taken. Work out the probability that both are red.', ['P8'], 3),
  one('A pie chart is to show how 60 pupils travel to school: 24 walk, 15 cycle and 21 take the bus. Work out the angle for each way of travelling.', ['S2'], 3),
  one('A scatter graph of engine size against fuel used has points that rise from left to right. What type of correlation does it show?', ['S6'], 1),
  one('Leo asks 10 people at a gym how often they exercise and says this tells him about the whole town. Give one reason why his sample may be biased.', ['S1'], 1),
  // the parts of one question
  multi('Here are some numbers: 4, 9, 12, 15, 21, 27, 36',
    ['Write down the numbers that are multiples of 3.', ['N4'], 1], ['Write down the square numbers.', ['N6'], 1]),
  multi('Ruth buys 3 notebooks at £1.85 each and a pen at 95p.',
    ['Work out what she pays.', ['N2'], 2], ['The price of a notebook goes up by 20%. Work out its new price.', ['R9'], 2]),
  multi('Eight pupils took these times, in minutes, to finish a puzzle: 12, 9, 15, 9, 11, 14, 10, 16',
    ['Write down the mode.', ['S4'], 1], ['Work out the median.', ['S4'], 2], ['One more pupil takes 20 minutes. Explain what happens to the range.', ['S4'], 1]),
  multi('A bag holds red, green and blue counters only. The probability of red is 0.3 and the probability of green is 0.45.',
    ['Work out the probability of blue.', ['P4'], 2], ['The bag holds 40 counters. How many of them would you expect to be green?', ['P2'], 2]),
  multi('A rectangle is (3x + 1) cm long and (x + 4) cm wide.',
    ['Write an expression for its perimeter. Simplify your answer.', ['A4', 'A1'], 2], ['The perimeter is 42 cm. Find x.', ['A21', 'A17'], 3]),
  multi('Here is the equation of a line: y = 2x − 1',
    ['Write down its gradient.', ['A10'], 1], ['Write down the coordinates of the point where it crosses the y-axis.', ['A10', 'A8'], 1]),
  multi('A recipe for 12 biscuits uses 150 g of butter and 240 g of flour.',
    ['How much butter is needed for 30 biscuits?', ['R10'], 2], ['Write the ratio of butter to flour in its simplest form.', ['R4'], 2]),
  multi('The nth term of a sequence is 4n + 3.',
    ['Write down the first three terms.', ['A23'], 2], ['Is 75 in this sequence? Give a reason.', ['A23'], 2]),
  // statements past Foundation: one per paper
  one('Starting with x0 = 1.5, use x(n+1) = cube root of (7 − 2 × xn) to find x1 and x2.', ['A20'], 3),
  one('A, B and C are points on a circle with centre O. Angle AOC is 130°. Work out angle ABC. Give a reason.', ['G10'], 2),
  one('In triangle PQR, PQ = 8 cm, PR = 11 cm and angle QPR = 52°. Work out the length of QR.', ['G22'], 3),
  one('Triangle ABC has AB = 7 cm, AC = 9 cm and angle BAC = 40°. Work out its area.', ['G23'], 2),
  one('Draw a box plot for data with lowest value 12, lower quartile 18, median 23, upper quartile 30 and highest value 41.', ['S3'], 2),
  one('Of 80 pupils, 50 study French, 35 study Spanish and 20 study both. A pupil who studies French is picked at random. Find the probability that they study Spanish too.', ['P9'], 2),
  one('Write down the equation of the circle whose centre is the origin and whose radius is 6.', ['A16'], 1),
];

const words = (s) => s.toLowerCase().match(/[a-z0-9]+/g) || [];
/** The first run of `n` or more words a stem shares with the can text of a code it keys, or null. */
function echoRun(stem, codes, n = 4) {
  const w = words(stem);
  for (const c of codes) {
    const can = ` ${words(BY_CODE.get(c).can).join(' ')} `;
    for (let i = 0; i + n <= w.length; i++) { const run = w.slice(i, i + n).join(' '); if (can.includes(` ${run} `)) return { code: c, run }; }
  }
  return null;
}

// ---------------------------------------------------------------- the papers
const higher = (codes) => codes.some((c) => !BY_CODE.get(c).foundation);
/** A statement the desk has no topic for: no school-path topic in its touches, as recovery() reads it. */
let schoolIds = null;
const gap = (codes) => {
  schoolIds = schoolIds || new Set(require(path.join(root, 'src/lib/library/paths.ts')).topicsOf('school').map((t) => t.id));
  return codes.some((c) => !BY_CODE.get(c).touches.some((id) => schoolIds.has(id)));
};
const rngOf = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648); };

/**
 * `count` papers from `seed`, deterministic: the same seed gives the same papers. Each paper: one question on a statement
 * past Foundation, questions until at least three items name a statement the desk has no topic for and one item names
 * two statements, then more until 10 to 13 items; the questions shuffled and numbered, parts lettered (a), (b), (c).
 * The marker's marks are drawn from 0 to the item's out of.
 */
function makePapers(seed = SEED, count = PAPERS) {
  const rng = rngOf(seed), pick = (list) => list[Math.floor(rng() * list.length)];
  const foundationPool = POOL.filter((e) => !e.parts.some((p) => higher(p.codes))), higherPool = POOL.filter((e) => e.parts.some((p) => higher(p.codes)));
  const papers = [];
  for (let n = 1; n <= count; n++) {
    const chosen = [pick(higherPool)];
    const items = () => chosen.flatMap((e) => e.parts);
    const add = (want) => { const free = foundationPool.filter((e) => !chosen.includes(e) && want(e)); chosen.push(pick(free)); };
    while (items().filter((p) => !higher(p.codes) && gap(p.codes)).length < 3) add((e) => e.parts.some((p) => gap(p.codes)));
    if (!items().some((p) => p.codes.length === 2)) add((e) => e.parts.some((p) => p.codes.length === 2));
    const target = 10 + Math.floor(rng() * 4);
    while (items().length < target) add((e) => items().length + e.parts.length <= 13);
    for (let i = chosen.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [chosen[i], chosen[j]] = [chosen[j], chosen[i]]; }
    const questions = chosen.map((e, i) => ({ n: String(i + 1), lead: e.lead || null, parts: e.parts.map((p, k) => ({
      q: e.parts.length > 1 ? `${i + 1}(${'abc'[k]})` : String(i + 1), part: e.parts.length > 1 ? `(${'abc'[k]})` : null,
      stem: p.stem, codes: [...p.codes], outOf: p.outOf, marks: Math.floor(rng() * (p.outOf + 1)) })) }));
    const key = questions.flatMap((q) => q.parts.map((p) => ({ q: p.q, marks: p.marks, outOf: p.outOf, codes: p.codes })));
    papers.push({ n, key, questions, svg: renderSvg(n, questions) });
  }
  return papers;
}

// ---------------------------------------------------------------- the rendering
const W = 1240, H = 1754; // A4 at 150 dpi
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function wrap(text, max) {
  const out = []; let line = '';
  for (const w of text.split(/\s+/)) { if (line && (line + ' ' + w).length > max) { out.push(line); line = w; } else line = line ? line + ' ' + w : w; }
  if (line) out.push(line);
  return out;
}
/**
 * A marked paper: the title, then each question's number, its lead, and per item its part letter, its stem, the mark
 * allocation in brackets at the right, and the marker's "marks/outOf" in red beside it (a tick for full marks, a cross
 * for none). Nothing on the page names a statement or a code. The font steps down until the paper fits the page.
 */
function renderSvg(n, questions) {
  for (let size = 26; ; size -= 2) {
    const lh = Math.round(size * 1.35), max = Math.floor(820 / (size * 0.52)), body = [];
    let y = 230;
    for (const qn of questions) {
      body.push(`<g data-question="${esc(qn.n)}">`, `<text class="qn" x="70" y="${y}" font-weight="bold">${esc(qn.n)}</text>`);
      if (qn.lead) for (const l of wrap(qn.lead, max)) { body.push(`<text x="130" y="${y}">${esc(l)}</text>`); y += lh; }
      for (const p of qn.parts) {
        const x = p.part ? 185 : 130, lines = wrap(p.stem, p.part ? max - 3 : max), top = y;
        body.push(`<g data-q="${esc(p.q)}">`);
        if (p.part) body.push(`<text class="part" x="130" y="${y}">${esc(p.part)}</text>`);
        for (const l of lines) { body.push(`<text x="${x}" y="${y}">${esc(l)}</text>`); y += lh; }
        const my = top + (lines.length - 1) * lh;
        body.push(`<text class="alloc" x="1060" y="${my}" text-anchor="end">(${p.outOf})</text>`);
        body.push(`<text class="mark" x="1090" y="${my + 4}" fill="#c0182a" font-family="Segoe Print, Comic Sans MS, cursive" font-size="${size + 8}" transform="rotate(-6 1090 ${my})">${p.marks}/${p.outOf}</text>`);
        if (p.marks === p.outOf) body.push(`<path d="M 955 ${my - 14} l 10 12 l 22 -26" stroke="#c0182a" stroke-width="4" fill="none"/>`);
        if (p.marks === 0) body.push(`<path d="M 958 ${my - 24} l 22 22 M 980 ${my - 24} l -22 22" stroke="#c0182a" stroke-width="4" fill="none"/>`);
        body.push('</g>');
        y += Math.round(lh * 0.6);
      }
      body.push('</g>');
      y += Math.round(lh * 0.5);
    }
    if (y <= H - 90 || size <= 16) {
      return [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="#1a1a1a">`,
        `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
        `<text x="70" y="110" font-size="40" font-weight="bold">Mathematics</text>`,
        `<text x="70" y="160" font-size="28">Practice paper ${n}. Answer every question. Marks for each part are shown in brackets.</text>`,
        `<line x1="70" y1="185" x2="1170" y2="185" stroke="#1a1a1a" stroke-width="2"/>`,
        ...body, `<text x="${W / 2}" y="${H - 40}" font-size="22" text-anchor="middle">Page 1</text>`, '</svg>'].join('\n') + '\n';
    }
  }
}

// ---------------------------------------------------------------- the run
/**
 * Read, clean and score every paper. `stub(key)` returns the rows a stubbed read gives for a paper (identity by
 * default); with `live`, each paper's PNG goes to the vision engine instead. Returns the report and its markdown; writes
 * nothing unless `out` is given.
 */
async function runProbe({ seed = SEED, count = PAPERS, stub = (key) => key.map((k) => ({ ...k, codes: [...k.codes] })), live = false, out = null, log = () => {} } = {}) {
  const papers = makePapers(seed, count);
  const { readPaper } = require(path.join(root, 'src/lib/desk/paperRead.ts'));
  const reg = require(path.join(root, 'src/lib/engines/registry.ts'));
  let raster = null, provider = 'stub';
  if (live) {
    const sharp = loadSharp();
    raster = async (svg) => (await sharp(Buffer.from(svg)).png().toBuffer());
    const probe = await reg.provider('vision').probe?.();
    if (probe && !probe.ok) throw new Error(`The vision engine is not ready: ${probe.say}`);
  }
  if (out) fs.mkdirSync(path.join(out, 'papers'), { recursive: true });
  const rows = [];
  try {
    for (const p of papers) {
      const name = `paper-${String(p.n).padStart(2, '0')}`;
      if (out) fs.writeFileSync(path.join(out, 'papers', `${name}.svg`), p.svg);
      let image = Buffer.from(p.svg).toString('base64'), read, error = null;
      if (live) {
        const png = await raster(p.svg);
        if (out) fs.writeFileSync(path.join(out, 'papers', `${name}.png`), png);
        image = png.toString('base64');
      } else {
        const answer = stub(p.key);
        reg.useProvider('vision', { name: 'stub', run: async () => ({ raw: JSON.stringify({ items: answer }) }) });
      }
      try { const r = await readPaper(image); read = r.rows; provider = r.provider; } catch (e) { error = e instanceof Error ? e.message : String(e); read = []; }
      const clean = cleanPaper(read), score = scorePaper(p.key, clean);
      rows.push({ n: p.n, ...score, error, read, droppedRows: clean.dropped, droppedCodes: clean.droppedCodes });
      log(`paper ${p.n}: ${score.mapped} of ${score.items} mapped${error ? ` (error: ${error})` : ''}`);
    }
  } finally { if (!live) reg.resetProviders('vision'); }
  const run = scoreRun(rows);
  const stubbed = !live;
  const verdict = `${stubbed ? 'STUBBED, not a result: ' : ''}${run.pass ? 'pass' : 'fail'}, ${run.percent.mapped}% of items mapped to the right unit (need ${KILL_PERCENT}%)`;
  const report = { at: new Date().toISOString(), stubbed, provider, seed, papers: rows, run, need: KILL_PERCENT, verdict };
  const md = markdown(report);
  if (out) { fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2)); fs.writeFileSync(path.join(out, 'report.md'), md); }
  return { report, md, papers };
}

function markdown(r) {
  const { run } = r;
  const lines = [];
  if (r.stubbed) lines.push('STUBBED: this run read no image (the read is fed from each answer key), so its figure says nothing about the vision engine and is never recorded as the probe\'s result.', '');
  lines.push(`# Paper probe (${r.stubbed ? 'stubbed' : 'live'}), ${r.at}`, '',
    `Verdict: **${r.verdict}**. ${run.mapped} of ${run.items} items over ${run.papers} papers (seed ${r.seed}, read by ${r.provider}).`, '',
    'Beside it, deciding nothing:', '',
    `- labels read: ${run.labels} of ${run.items} (${run.percent.labels}%)`,
    `- marks and out of read exactly: ${run.marks} of ${run.items} (${run.percent.marks}%)`,
    `- codes read exactly: ${run.codes} of ${run.items} (${run.percent.codes}%)`,
    `- rows cleanPaper dropped: ${run.dropped}; items read that are not on the key: ${run.extra}`, '');
  if (run.marksQuestion) lines.push(`**A question for the owner:** the items mapped at ${run.percent.mapped}%, but the marks were read exactly on only ${run.percent.marks}% of items (under ${KILL_PERCENT}%). The recovery list weighs topics by lost marks, so should the photo path be offered when the marks themselves are misread this often?`, '');
  if (!r.stubbed) lines.push('The papers are clean renders, not phone photos of handwriting: a pass is an upper bound on what a real photo gives.', '');
  lines.push('| paper | items | mapped | labels | marks | codes | dropped | extra | notes |', '|---|---|---|---|---|---|---|---|---|',
    ...r.papers.map((p) => `| ${p.n} | ${p.items} | ${p.mapped} | ${p.labels} | ${p.marks} | ${p.codes} | ${p.dropped} | ${p.extra} | ${p.error ? `error: ${p.error.replace(/\|/g, '/')}` : p.perItem.filter((x) => !x.mapped).map((x) => x.q).join(', ') ? `not mapped: ${p.perItem.filter((x) => !x.mapped).map((x) => x.q).join(', ')}` : ''} |`));
  return lines.join('\n') + '\n';
}

function loadSharp() {
  try { return require(path.join(root, 'node_modules/sharp')); }
  catch (e) {
    console.error('paper-probe: sharp could not be loaded from desk/node_modules, so the papers cannot be turned into images. ' +
      `Run \`npm install\` in desk/ on this PC, then run the probe again. (${e instanceof Error ? e.message.split('\n')[0] : e})`);
    process.exit(1);
  }
}

module.exports = { SEED, PAPERS, POOL, echoRun, makePapers, renderSvg, runProbe, markdown };

if (require.main === module) {
  const argv = process.argv.slice(2), opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
  const live = !argv.includes('--stub');
  const out = path.resolve(opt('--out', path.resolve(__dirname, '../artifacts/paper-probe', new Date().toISOString().replace(/[:.]/g, '-'))));
  runProbe({ seed: Number(opt('--seed', SEED)), live, out, log: (s) => console.log(s) })
    .then(({ report }) => console.log(`paper-probe: ${report.verdict}. Report: ${out}`))
    .catch((e) => { console.error(`paper-probe: ${e instanceof Error ? e.message : e}`); process.exit(1); });
}
