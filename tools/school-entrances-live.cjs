/**
 * The two entrances and the step-up on the real TV (Family W8): a 12-year-old UK learner's Math Buddy Tonight has THREE
 * doors - I have homework, Teach me something, Get ready for school - on the first evening (a row) and beside the continue
 * card (a column); Get ready for school lists the fifteen units by strand with the learner's own year word ("Year 8") and
 * nothing else of the path; Select asks "The usual" or "A step up"; "A step up" writes a set by code (no model call) that
 * is harder than the usual one; and the Topics ruler and Tonight's strand strip draw a second, thin sky line for every
 * unit whose step-up record has latched - one unit usual-secure only, one step-up-secure only, one both, one step-up still
 * in progress - never a digit. A Calculus learner's Tonight keeps its two doors.
 * Not part of `npm test` (it needs a server); it skips politely unless SCHOOL_ENTRANCES_URL is set. Run it against an
 * isolated server whose text and vision engines cannot be reached, so any model call fails loudly:
 *
 *   DESK_DATA_DIR=<scratch dir> CLAUDE_BIN=<a path that does not exist> CODEX_JS=<the same> OLLAMA_HOST=http://127.0.0.1:9 \
 *     npx next dev --webpack -p 3471                                                              (in a copy of desk/)
 *   SCHOOL_ENTRANCES_URL=http://localhost:3471 DESK_DATA_DIR=<the same dir> node tools/school-entrances-live.cjs
 *
 * What it asserts: every piece of Math Buddy text inside the 96 / 54 px safe zone of the 1920 x 1080 stage and none under
 * 28 px except 20-22 px uppercase labels; the three doors inside the safe zone, apart, their titles whole; exactly one
 * element lit; the Prepare screen's strands, cards and year words, no ruler, no state word, every card name whole; the
 * question's two cells; the step-up set answered by provider "code" with 0 tries and a harder mix; the second line on
 * exactly the seeded units, on the ruler and the strip, with no digit in it; no page error. It writes learner records into
 * the scratch data directory, never desk/data. Screenshots go to artifacts/school-entrances/ (git-ignored). Playwright is
 * resolved from tools/node_modules.
 */
if (!process.env.SCHOOL_ENTRANCES_URL) { console.log('school-entrances-live: skipped (set SCHOOL_ENTRANCES_URL to an isolated dev server, and DESK_DATA_DIR to its data directory)'); process.exit(0); }
const { chromium } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
if (!process.env.DESK_DATA_DIR) throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test opens the TV with the key the desk keeps there.');
const data = path.resolve(process.env.DESK_DATA_DIR), real = path.resolve(__dirname, '../desk/data');
if (data === real || data.startsWith(real + path.sep)) throw new Error('Refusing to run against desk/data: use a scratch DESK_DATA_DIR.');
const base = process.env.SCHOOL_ENTRANCES_URL.replace(/\/$/, '');
const out = path.resolve(__dirname, '../artifacts/school-entrances'); fs.mkdirSync(out, { recursive: true });

const STAMP = Date.now();
const SEEDED = { id: `school-entrances-seeded-${STAMP}`, name: 'Mia', type: 'elementary', age: 12, system: 'uk', modules: ['maths'] };
const CALC = { id: `school-entrances-calc-${STAMP}`, name: 'Ada', type: 'other', age: 19, mathPath: 'calc1', modules: ['maths'] };
const STRANDS = ['FRACTIONS', 'EQUATIONS', 'DECIMALS AND PERCENT', 'RATIO AND RATES', 'GEOMETRY AND DATA'];
/** The Prepare list, strand by strand, and each unit's UK year. */
const UNITS = [
  ['Equivalent fractions', 5], ['A fraction of an amount', 5], ['Add and subtract fractions', 6], ['Multiply and divide fractions', 7],
  ['One-step equations', 7], ['Two-step equations', 8], ['Equations with brackets and x on both sides', 9],
  ['Add, subtract and multiply decimals', 7], ['Fractions, decimals and percent', 7], ['A percent of an amount', 7], ['Percent increase and decrease', 8],
  ['Ratio and sharing', 8], ['Unit rates and direct proportion', 8], ['Area of rectangles, triangles and composite shapes', 8], ['Mean and range', 8],
];
/** The seeded states: usual-secure only, step-up-secure only, both, a step-up still in progress. */
const SEEDS = { 'frac-add-sub': 'usual', area: 'stretch', 'ratio-share': 'both', 'unit-rate': 'progress' };
const TOPIC_STOP = { 'frac-add-sub': 2, 'ratio-share': 9, 'unit-rate': 10, area: 11 };

function seedLearner() {
  const file = path.join(data, 'learners.json');
  const book = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const usual = (topic, secure) => ({ topic, seen: secure ? 6 : 0, right: secure ? 6 : 0, estimate: secure ? 0.93 : 0, secure, lastSeen: secure ? STAMP : 0, slips: [] });
  const up = (latched) => ({ seen: 6, right: latched ? 6 : 3, estimate: latched ? 0.9 : 0.5, secure: latched, lastSeen: STAMP });
  const skills = {};
  for (const [t, k] of Object.entries(SEEDS)) skills[t] = { ...usual(t, k === 'usual' || k === 'both'), ...(k === 'usual' ? {} : { stretch: up(k !== 'progress') }) };
  skills['unit-rate'] = { ...skills['unit-rate'], seen: 3, right: 2, estimate: 0.5 };
  book[SEEDED.id] = { id: SEEDED.id, skills, writing: {}, memory: [], history: [] };
  fs.writeFileSync(file, JSON.stringify(book));
}

let key = '', cookie = '';
async function asTheTV() {
  await fetch(base + '/api/session').catch(() => null);
  key = JSON.parse(fs.readFileSync(path.join(data, 'pairing.json'), 'utf8')).key;
  const r = await fetch(base + '/tv?key=' + encodeURIComponent(key), { redirect: 'manual' });
  cookie = (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).filter((c) => c.startsWith('desk-tv=')).join('; ');
  assert.ok(cookie, 'the desk took its key');
}
async function event(b) {
  const r = await fetch(base + '/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify(b) });
  assert.equal(r.status, 200, JSON.stringify(b) + ' -> ' + r.status);
  return r.json();
}
const current = async () => (await fetch(base + '/api/session', { headers: { cookie } })).json();
async function desk(learner) {
  await event({ type: 'reset' });
  await event({ type: 'profile.draft', patch: learner }); await event({ type: 'profile.save' });
  await event({ type: 'join' });
  await event({ type: 'subject', subject: 'maths' });
  await event({ type: 'nav', screen: 'tonight', focus: 0 });
}

/** Math Buddy's text on the stage (the pattern of tools/school-units3-live.cjs), and how many things look lit. */
async function measure(page) {
  return page.evaluate(() => {
    window.scrollTo(0, 0);
    const root = document.querySelector('.maths-tv'), st = document.querySelector('.stage'), stage = st.getBoundingClientRect(), k = stage.width / st.offsetWidth;
    const outside = [], small = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent.trim(), el = n.parentElement;
      if (!text || !el || el.closest('[aria-hidden="true"]')) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      const r0 = range.getBoundingClientRect();
      let b = { left: r0.left, right: r0.right, top: r0.top, bottom: r0.bottom };
      for (let e = el; e && e !== root; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.overflow === 'hidden' || cs.overflowY === 'hidden' || cs.overflowX === 'hidden') {
          const c = e.getBoundingClientRect();
          b = { left: Math.max(b.left, c.left), right: Math.min(b.right, c.right), top: Math.max(b.top, c.top), bottom: Math.min(b.bottom, c.bottom) };
        }
      }
      b.width = b.right - b.left; b.height = b.bottom - b.top;
      if (b.width < 2 || b.height < 2) continue;
      const top = document.elementFromPoint(Math.min(b.left + b.width / 2, innerWidth - 1), Math.min(b.top + b.height / 2, innerHeight - 1));
      if (b.top + b.height / 2 >= innerHeight || (top && !(top === el || el.contains(top)))) continue;
      const cs = getComputedStyle(el), size = parseFloat(cs.fontSize), upper = cs.textTransform === 'uppercase' || (text === text.toUpperCase() && /[A-Z]/.test(text));
      const box = { x0: Math.round((b.left - stage.left) / k), x1: Math.round((b.right - stage.left) / k), y0: Math.round((b.top - stage.top) / k), y1: Math.round((b.bottom - stage.top) / k) };
      const row = `${el.className || el.tagName} "${text.slice(0, 32)}" ${size.toFixed(1)}px ${box.x0},${box.y0}-${box.x1},${box.y1}`;
      if (box.x0 < 96 - 2 || box.x1 > 1824 + 2 || box.y0 < 54 - 2 || box.y1 > 1026 + 2) outside.push(row);
      if (size < 27.5 && !(upper && size >= 19.5 && size <= 22.5)) small.push(row);
    }
    const q = (sel) => document.querySelector(sel)?.textContent?.trim() ?? '';
    return { outside, small, stageW: st.offsetWidth, lit: root.querySelectorAll('[data-focused="true"]').length, title: q('[data-role="maths-title"]'), screen: root.getAttribute('data-screen') };
  });
}

/** Tonight's doors as drawn, in stage px: each one's box and title, whether its title is whole, and whether any two overlap. */
async function doors(page) {
  return page.evaluate(() => {
    const st = document.querySelector('.stage'), s = st.getBoundingClientRect(), k = s.width / st.offsetWidth;
    const px = (r) => ({ x0: Math.round((r.left - s.left) / k), x1: Math.round((r.right - s.left) / k), y0: Math.round((r.top - s.top) / k), y1: Math.round((r.bottom - s.top) / k) });
    const wrap = document.querySelector('.mb-doors');
    const list = [...document.querySelectorAll('.mb-door')].map((d) => {
      const dt = d.querySelector('.dt'), art = d.querySelector('.art svg');
      return { title: dt.textContent.trim(), box: px(d.getBoundingClientRect()), titlePx: parseFloat(getComputedStyle(dt).fontSize), artW: Math.round(art.getBoundingClientRect().width / k),
        whole: dt.scrollWidth <= dt.clientWidth + 1 && dt.getBoundingClientRect().bottom <= d.getBoundingClientRect().bottom + 1, focused: d.getAttribute('data-focused') === 'true' };
    });
    const apart = list.every((a, i) => list.every((b, j) => j <= i || a.box.x1 <= b.box.x0 || b.box.x1 <= a.box.x0 || a.box.y1 <= b.box.y0 || b.box.y1 <= a.box.y0));
    return { cls: wrap.className, list, apart, caption: document.querySelector('.mb-cap')?.textContent.trim() ?? '' };
  });
}

/** Get ready for school as drawn: strand heads, cards (name, year word, whole or clipped), the lit and held card, the cells. */
async function prepare(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.maths-tv');
    return {
      heads: [...root.querySelectorAll('.mb-pstrand')].map((x) => x.textContent.trim().toUpperCase()),
      cards: [...root.querySelectorAll('.mb-unit2')].map((c) => { const nm = c.querySelector('.nm'); return { name: nm.textContent.trim(), year: c.querySelector('.yr')?.textContent.trim() ?? '', whole: nm.scrollHeight <= nm.clientHeight + parseFloat(getComputedStyle(nm).fontSize) * 0.4 && nm.scrollWidth <= nm.clientWidth + 1, lines: Math.round(nm.clientHeight / parseFloat(getComputedStyle(nm).lineHeight)), px: parseFloat(getComputedStyle(nm).fontSize) }; }),
      lit: root.querySelector('.mb-unit2[data-focused="true"] .nm')?.textContent.trim() ?? null,
      held: root.querySelector('.mb-unit2[data-held="true"] .nm')?.textContent.trim() ?? null,
      cells: [...root.querySelectorAll('.mb-cell2')].map((c) => ({ t: c.querySelector('.t').textContent.trim(), on: c.getAttribute('data-focused') === 'true' })),
      pathBits: root.querySelectorAll('[data-role="maths-ruler"], .mb-marker, .mb-flag, .mb-gapline').length,
      words: /\b(Secure|In progress|Not started)\b/.test(root.textContent),
      litBox: (() => { const e = root.querySelector('.mb-unit2[data-focused="true"]'), w = root.querySelector('.mb-pwin'); if (!e || !w) return null; const a = e.getBoundingClientRect(), b = w.getBoundingClientRect(); return a.left >= b.left - 1 && a.right <= b.right + 1; })(),
    };
  });
}

/** The second ink lines as drawn: on the ruler, which topic boxes carry one; on the strip, each bar's line width over its groove. */
async function inks(page) {
  return page.evaluate(() => {
    const r = document.querySelector('[data-role="maths-ruler"]');
    const topics = [...r.querySelectorAll('.mb-topic')].filter((t) => t.querySelector('.mb-ink2')).map((t) => t.querySelector('.mb-tn').textContent.trim());
    const segs = [...r.querySelectorAll('.mb-seg')].map((g) => { const i = g.querySelector('.mb-ink2'), gr = g.querySelector('.mb-groove'); return i ? Math.round(i.getBoundingClientRect().width / gr.getBoundingClientRect().width * 100) / 100 : 0; });
    const marks = [...document.querySelectorAll('[data-role="maths-stretch"]')];
    const one = marks.find((m) => m.classList.contains('mb-ink2')), gv = one?.parentElement.querySelector('.mb-groove');
    const gap = one && gv ? Math.round(one.getBoundingClientRect().top - gv.getBoundingClientRect().bottom) : null;
    return { topics, segs, digits: marks.some((m) => /[0-9]/.test(m.textContent)), sky: one ? getComputedStyle(one).backgroundColor : null, gap, count: marks.length };
  });
}

(async () => {
  await asTheTV();
  seedLearner();
  const browser = await chromium.launch({ headless: true });
  const errors = [], report = {};
  try {
    for (const [W, H] of [[1920, 1080], [1280, 720]]) {
      const ctx = await browser.newContext({ viewport: { width: W, height: H + 130 } }), page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      await page.route('**/api/speak**', (r) => r.fulfill({ status: 204, body: '' }));
      const shot = (name) => page.locator('.frame').screenshot({ path: path.join(out, `${name}-${W}x${H}.png`) });
      const press = async (k, ms = 700) => { await page.keyboard.press(k); await page.waitForTimeout(ms); };
      const clean = (m, label) => {
        assert.equal(m.stageW, 1920, `${label}: the TV stage`);
        assert.deepEqual(m.outside, [], `${W}: ${label} keeps its text inside the 96/54 px safe zone`);
        assert.deepEqual(m.small, [], `${W}: ${label} has no text under 28 px (20-22 px uppercase labels excepted)`);
      };
      const open = async () => { await page.goto(base + '/tv?display=tv&key=' + encodeURIComponent(key)); await page.waitForSelector('.maths-tv[data-screen="tonight"]'); await page.waitForTimeout(1500); await page.locator('.stage').click({ position: { x: 4, y: 4 } }); };
      const r = (report[`${W}x${H}`] = {});

      // ---- Tonight: three doors in a row on an evening with nothing open, the lamp on each in turn; the strip's second lines
      await desk(SEEDED); await open();
      for (let i = 0; i < 3; i++) {
        if (i) await press('ArrowRight');
        const m = await measure(page); clean(m, `Tonight door ${i}`); assert.equal(m.lit, 1, 'one thing lit');
        const d = await doors(page);
        assert.match(d.cls, /\bwide\b/); assert.match(d.cls, /\bthree\b/);
        assert.deepEqual(d.list.map((x) => x.title), ['I have homework', 'Teach me something', 'Get ready for school']);
        assert.ok(d.apart, `${W}: the doors do not overlap`); assert.ok(d.list.every((x) => x.whole), `${W}: every door title whole`);
        assert.ok(d.list.every((x) => x.titlePx >= 48), 'the door type keeps its size');
        assert.ok(d.list.every((x) => x.box.x0 >= 96 - 20 && x.box.x1 <= 1824 + 20 && x.box.y0 >= 54 && x.box.y1 <= 1026), `${W}: doors inside the safe zone ${JSON.stringify(d.list.map((x) => x.box))}`);
        assert.equal(d.list.findIndex((x) => x.focused), i);
        if (i === 2) assert.equal(d.caption, 'Pick what school is teaching next and practise it before the lesson.');
        await shot(`tonight-door${i}`); r[`door${i}`] = d;
      }
      assert.equal((await measure(page)).title, 'Two of 15 topics secure', 'the title counts the usual records only');
      const ts = await inks(page);
      assert.deepEqual(ts.segs, [0, 0, 0, 0.5, 0.5, 0], `${W}: the strip's second line - half of Ratio and rates (ratio), half of Geometry and data (area)`);
      assert.equal(ts.digits, false); r.strip = ts;

      // ---- Get ready for school: units by strand, the learner's year word, nothing of the path
      await press('Enter', 1500);
      let m = await measure(page); assert.equal(m.screen, 'prepare'); clean(m, 'Prepare'); assert.equal(m.lit, 1, 'one thing lit');
      let p = await prepare(page);
      assert.deepEqual(p.heads, STRANDS); assert.deepEqual(p.cards.map((c) => c.name), UNITS.map((u) => u[0]));
      assert.deepEqual(p.cards.map((c) => c.year), UNITS.map((u) => `Year ${u[1]}`), `${W}: each unit with the learner's own year word`);
      assert.ok(p.cards.every((c) => c.whole && c.px >= 28), `${W}: every card name whole: ${JSON.stringify(p.cards.filter((c) => !c.whole))}`);
      assert.equal(p.pathBits, 0, 'no ruler, needle, tick or gap line'); assert.equal(p.words, false, 'no Secure / In progress / Not started');
      assert.equal(p.lit, UNITS[0][0]); assert.equal(p.litBox, true);
      await shot('prepare-0'); r.prepare = p;
      for (let i = 0; i < 13; i++) await press('ArrowRight', 350);
      await page.waitForTimeout(900);
      p = await prepare(page); m = await measure(page); clean(m, 'Prepare, panned');
      assert.equal(p.lit, UNITS[13][0]); assert.equal(p.litBox, true, 'the lit card is on the stage');
      await shot('prepare-13');
      // ---- the question: two cells, "The usual" lit; Right to "A step up"; Back to the list on the same unit
      await press('Enter');
      p = await prepare(page); m = await measure(page); clean(m, 'the question');
      assert.deepEqual(p.cells, [{ t: 'The usual', on: true }, { t: 'A step up', on: false }]); assert.equal(p.held, UNITS[13][0]); assert.equal(p.lit, null); assert.equal(m.lit, 1);
      await shot('choice-usual');
      await press('ArrowRight');
      p = await prepare(page); assert.deepEqual(p.cells.map((c) => c.on), [false, true]); clean(await measure(page), 'the question, a step up');
      await shot('choice-stepup');
      await press('Backspace');
      p = await prepare(page); assert.deepEqual(p.cells, []); assert.equal(p.lit, UNITS[13][0], 'Back: the list, on the same unit');
      // ---- A step up on the area unit: written by code, a harder mix than the usual, the practice sheet
      await press('Enter'); await press('ArrowRight');
      const answer = page.waitForResponse((x) => x.url().endsWith('/api/practice') && x.request().method() === 'POST', { timeout: 30000 });
      await press('Enter', 100);
      const resp = await answer, made = await resp.json(), sent = JSON.parse(resp.request().postData());
      assert.equal(resp.status(), 200, JSON.stringify(made));
      assert.deepEqual(sent, { topic: 'area', stretch: true });
      assert.deepEqual([made.provider, made.tries, made.items], ['code', 0, 6], 'a step up written by code, no model call');
      await page.waitForSelector('.maths-tv[data-screen="practice"] [data-role="maths-sheet"] .mb-item:nth-child(6)', { timeout: 15000 }); await page.waitForTimeout(1500);
      const set = (await current()).practice;
      assert.equal(set.stretch, true); assert.deepEqual(set.items.map((i) => i.tier), [1, 1, 2, 2, 2, 2], 'a UK Year 8 on a Year 8 unit: standard, so a step up is two and four');
      clean(await measure(page), 'the step-up sheet'); await shot('practice-stepup'); r.stepUp = set.items.map((i) => [i.tier, i.question]);

      // ---- Tonight with the set open: the continue card and the three doors as a column
      await press('Backspace', 1200);
      m = await measure(page); assert.equal(m.screen, 'tonight'); clean(m, 'Tonight with the continue card');
      const dc = await doors(page);
      assert.match(dc.cls, /\bthree\b/); assert.doesNotMatch(dc.cls, /\bwide\b/); assert.ok(dc.apart); assert.ok(dc.list.every((x) => x.whole), `${W}: whole titles beside the card`);
      assert.ok(dc.list.every((x) => x.box.y0 >= 54 && x.box.y1 <= 1026 && x.box.x1 <= 1824 + 20));
      await shot('tonight-continue');
      await press('ArrowRight'); await press('ArrowRight'); await press('ArrowRight');
      clean(await measure(page), 'Tonight with the continue card, the third door'); await shot('tonight-continue-door2'); r.column = dc;

      // ---- Topics: the second line on the ruler for exactly the step-up-secure units, and on the focused one's detail
      for (const [id, stop] of Object.entries(TOPIC_STOP)) {
        await event({ type: 'nav', screen: 'topics', focus: stop }); await page.waitForTimeout(1500);
        m = await measure(page); clean(m, `Topics at ${id}`);
        const ti = await inks(page);
        for (const t of ['Ratio and sharing', 'Area of rectangles, triangles and composite shapes']) if (Math.abs(stop - (t === 'Ratio and sharing' ? 9 : 11)) <= 2) assert.ok(ti.topics.includes(t), `${W} at ${id}: ${t} has its second line`);
        assert.ok(!ti.topics.includes('Add and subtract fractions') && !ti.topics.includes('Unit rates and direct proportion'), 'usual-secure only, and a step-up in progress: one line');
        assert.equal(ti.digits, false);
        const stepped = await page.evaluate(() => !!document.querySelector('.mb-lede .mb-stepped'));
        assert.equal(stepped, id === 'area' || id === 'ratio-share', `${id}: the detail carries the small picture only when its step-up has latched`);
        await shot(`topics-${id}`); r[`topics-${id}`] = { ...ti, stepped };
      }

      // ---- a Calculus learner: the two doors, as before
      await desk(CALC); await open();
      m = await measure(page); clean(m, 'Tonight (calc1)');
      const dcalc = await doors(page);
      assert.deepEqual(dcalc.list.map((x) => x.title), ['I have homework', 'Teach me something']); assert.doesNotMatch(dcalc.cls, /three/);
      await shot('tonight-calc1'); r.calc = dcalc;
      await ctx.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  assert.deepEqual(errors, [], 'no page errors');
  console.log('school-entrances-live: ok'); console.log(JSON.stringify(report, null, 1).slice(0, 4000));
})().catch((e) => { console.error(e); process.exit(1); });
