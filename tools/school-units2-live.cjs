/**
 * The four W7 batch-2 school units on the real TV (Family W7, "Decimals and percent"): a 12-year-old UK learner walks
 * Math Buddy's Tonight - eleven topics, so the small ruler is the strand strip (four bars, Equations twice, the SCHOOL
 * tick on it, no gap line) - and Topics (eleven topics, the big ruler panning, every focused name whole) at 1920 x 1080
 * and 1280 x 720; a second learner with the fractions, one-step equations and the decimals unit secure shows the bars
 * inked by their share and the needle at the conversion. Then, on a fresh desk each time, Select on each new unit: six
 * questions the desk wrote itself with NO model call, decimals, percent signs and currency signs set at a sofa-legible
 * size, all inside the paper. Last, the answers to a "A percent of an amount" set are typed on the phone (390 x 844) -
 * a right answer, a slip, a blank, an amount written as a percentage, a money answer with its sign, words - and the TV
 * shows the marked sheet.
 * Not part of `npm test` (it needs a server); it skips politely unless SCHOOL_UNITS2_URL is set. Run it against an
 * isolated server whose text and vision engines cannot be reached, so any model call fails loudly:
 *
 *   DESK_DATA_DIR=<scratch dir> CLAUDE_BIN=<a path that does not exist> OLLAMA_HOST=http://127.0.0.1:9 \
 *     npx next dev --webpack -p 3467                                                              (in a copy of desk/)
 *   SCHOOL_UNITS2_URL=http://localhost:3467 DESK_DATA_DIR=<the same dir> node tools/school-units2-live.cjs
 *
 * What it asserts: the practice route answers provider "code" and 0 tries for each unit; every piece of Math Buddy text
 * sits inside the 96 / 54 px safe zone of the 1920 x 1080 stage and none is under 28 px except uppercase labels of
 * 20-22 px; every numeral (a decimal as one number), percent sign and currency sign of a question is at least 28 px; the
 * six questions fit inside the paper; the strip's bars, tick and needle; the typed mark answers provider "code" with 0 ms
 * and the verdicts are the ones the script works out itself in whole hundredths; no page error. It writes one learner
 * record (the seeded learner) into the scratch data directory, never desk/data. Screenshots go to
 * artifacts/school-units2/ (git-ignored). Playwright is resolved from tools/node_modules.
 */
if (!process.env.SCHOOL_UNITS2_URL) { console.log('school-units2-live: skipped (set SCHOOL_UNITS2_URL to an isolated dev server, and DESK_DATA_DIR to its data directory)'); process.exit(0); }
const { chromium } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
if (!process.env.DESK_DATA_DIR) throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test opens the TV with the key the desk keeps there.');
const data = path.resolve(process.env.DESK_DATA_DIR), real = path.resolve(__dirname, '../desk/data');
if (data === real || data.startsWith(real + path.sep)) throw new Error('Refusing to run against desk/data: use a scratch DESK_DATA_DIR.');
const base = process.env.SCHOOL_UNITS2_URL.replace(/\/$/, '');
const out = path.resolve(__dirname, '../artifacts/school-units2'); fs.mkdirSync(out, { recursive: true });

// fresh learner ids per run: the learner record outlives a desk reset, and the needle reads it
const STAMP = Date.now();
const FRESH = { id: `school-units2-fresh-${STAMP}`, name: 'Mia', type: 'elementary', age: 12, system: 'uk', modules: ['maths'] };
const SEEDED = { id: `school-units2-seeded-${STAMP}`, name: 'Leo', type: 'elementary', age: 12, system: 'uk', modules: ['maths'] };
const NAMES = ['Equivalent fractions', 'A fraction of an amount', 'Add and subtract fractions', 'Multiply and divide fractions', 'One-step equations',
  'Add, subtract and multiply decimals', 'Fractions, decimals and percent', 'A percent of an amount', 'Percent increase and decrease',
  'Two-step equations', 'Equations with brackets and x on both sides'];
/** The four new units: their stop on Topics, the words a question starts with, the stacked fractions a question sets. */
const UNITS = [
  { id: 'dec-arith', stop: 5, words: /^\d?Work ?out/, fracs: () => 0 },
  { id: 'dec-convert', stop: 6, words: /^\d?Write/, fracs: (q) => (/\d\/\d/.test(q) ? 1 : 0) },
  { id: 'pct-of-amount', stop: 7, words: /^\d?Find/, fracs: () => 0 },
  { id: 'pct-change', stop: 8, words: /^\d?(Increase|Decrease)/, fracs: () => 0 },
];

/** The seeded learner: the fractions, one-step equations and the decimals unit latched secure, the conversion under way. */
function seedLearner() {
  const file = path.join(data, 'learners.json');
  const book = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const rec = (topic, secure, estimate) => ({ topic, seen: 6, right: secure ? 6 : 3, estimate, secure, lastSeen: STAMP, slips: [] });
  const skills = Object.fromEntries(['frac-equivalent', 'frac-of-amount', 'frac-add-sub', 'frac-mul-div', 'linear-one-step', 'dec-arith'].map((t) => [t, rec(t, true, 0.95)]));
  skills['dec-convert'] = rec('dec-convert', false, 0.5);
  book[SEEDED.id] = { id: SEEDED.id, skills, writing: {}, memory: [], history: [] };
  fs.writeFileSync(file, JSON.stringify(book));
}

let key = '', cookie = '';
async function asTheTV() {
  await fetch(base + '/api/session').catch(() => null); // the server writes pairing.json on its first request
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
async function desk(learner = FRESH) {
  await event({ type: 'reset' });
  await event({ type: 'profile.draft', patch: learner }); await event({ type: 'profile.save' });
  await event({ type: 'join' });
  await event({ type: 'subject', subject: 'maths' });
  await event({ type: 'nav', screen: 'tonight', focus: 0 });
}

/** Math Buddy's text on the stage: where it sits (1920 x 1080 stage px) and how big it is. */
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
    return { outside, small, stageW: st.offsetWidth, title: q('[data-role="maths-title"]'), screen: root.getAttribute('data-screen') };
  });
}

/** Tonight's strand strip as drawn: each bar's label and fill, the tick, the needle and the gap line. */
async function strip(page) {
  return page.evaluate(() => {
    const r = document.querySelector('[data-role="maths-ruler"]');
    const segs = [...r.querySelectorAll('.mb-seg')].map((g) => {
      const fill = g.querySelector('.fill');
      return { label: g.querySelector('.mb-strand')?.textContent.trim() ?? '', left: parseFloat(g.style.left), width: parseFloat(g.style.width), fill: fill ? parseFloat(fill.style.width) : 0, s: g.getAttribute('data-s') };
    });
    const left = (sel) => { const e = r.querySelector(sel); return e ? parseFloat(e.style.left) : null; };
    const pill = r.querySelector('.mb-flag .mc')?.getBoundingClientRect(), rb = r.getBoundingClientRect();
    return {
      isStrip: r.classList.contains('strip'), segs, needle: left('.mb-marker'), tick: left('.mb-flag'), tickWord: r.querySelector('.mb-flag .mc')?.textContent.trim() ?? null,
      tickEnd: r.querySelector('.mb-flag')?.getAttribute('data-end') === 'true', gap: !!r.querySelector('.mb-gapline'),
      pillInside: pill ? pill.left >= rb.left - 1 && pill.right <= rb.right + 1 : null,
    };
  });
}

/** The big ruler as drawn: its topics, the focused one's name whole, the needle, the tick and the gap line. */
async function ruler(page) {
  return page.evaluate(() => {
    const r = document.querySelector('[data-role="maths-ruler"]');
    const names = [...r.querySelectorAll('.mb-topic .mb-tn')].map((x) => x.textContent.trim());
    const f = r.querySelector('.mb-topic[data-focused="true"] .mb-tn');
    const left = (sel) => { const e = r.querySelector(sel); return e ? parseFloat(e.style.left) : null; };
    return {
      names, focused: f?.textContent.trim() ?? null, pan: r.getAttribute('data-pan') === 'true',
      whole: f ? f.scrollHeight <= f.clientHeight + parseFloat(getComputedStyle(f).fontSize) * 0.4 && f.scrollWidth <= f.clientWidth + 1 : false,
      focusedPx: f ? parseFloat(getComputedStyle(f).fontSize) : null,
      needle: left('.mb-marker'), tick: left('.mb-flag'), tickWord: r.querySelector('.mb-flag .mc')?.textContent.trim() ?? null, gap: !!r.querySelector('.mb-gapline'),
      strands: [...r.querySelectorAll('.mb-strand')].map((x) => x.textContent.trim()),
    };
  });
}

/** The practice sheet: each question inside the paper, its numerals (a decimal as one number), % and currency signs at >= 28 px. */
async function sheet(page) {
  return page.evaluate(() => {
    const paper = document.querySelector('[data-role="maths-sheet"]'), pb = paper.getBoundingClientRect();
    return [...paper.querySelectorAll('.mb-item')].map((it) => {
      const b = it.getBoundingClientRect(), row = it.querySelector('.mb-row');
      const leaves = [...it.querySelectorAll('*')].filter((e) => e.children.length === 0 && !e.closest('.num'));
      const nums = leaves.filter((e) => /^\d+(?:\.\d+)?$/.test(e.textContent.trim()));
      const signs = leaves.filter((e) => /^[%€£]$/.test(e.textContent.trim()) || /^[€£]\d/.test(e.textContent.trim()));
      return {
        text: it.textContent.replace(/\s+/g, ' ').trim(),
        inside: b.left >= pb.left - 1 && b.right <= pb.right + 1 && b.top >= pb.top - 1 && b.bottom <= pb.bottom + 1,
        fits: row ? row.scrollWidth <= row.clientWidth + 1 : false,
        fracs: it.querySelectorAll('[data-role="maths-frac"]').length,
        numerals: nums.map((e) => e.textContent.trim()),
        numeralPx: nums.map((e) => parseFloat(getComputedStyle(e).fontSize)),
        signPx: signs.map((e) => ({ s: e.textContent.trim(), px: parseFloat(getComputedStyle(e).fontSize) })),
      };
    });
  });
}

// ---- a percent of an amount, the script's own arithmetic in whole hundredths (p may carry a half)
function percentOf(question) {
  const m = /Find (\d+(?:\.5)?)% of ([€£])?(\d+)(?: ([a-z]+))?\./.exec(question);
  assert.ok(m, 'a percent of an amount question: ' + question);
  const tenths = Math.round(Number(m[1]) * 10), N = Number(m[3]), h = tenths * N / 10; // hundredths
  const text = (x) => (x / 100).toFixed(2).replace(/\.?0+$/, '');
  return { sign: m[2] ?? null, word: m[4] ?? null, right: text(h), money: m[2] ? `${m[2]}${(h / 100).toFixed(2)}` : null, timesWhole: text(tenths * N * 10) };
}

(async () => {
  await asTheTV();
  seedLearner();
  const browser = await chromium.launch({ headless: true });
  const errors = [], report = { tonight: [], topics: [], sheets: {}, typed: null };
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

      // ---- a fresh learner: the strip empty, the needle at the start, the SCHOOL tick after ten topics (UK Year 8)
      await desk(FRESH); await open();
      let m = await measure(page);
      assert.equal(m.title, 'School maths, from the first step'); clean(m, 'Tonight (fresh)');
      const t0 = await strip(page);
      assert.equal(t0.isStrip, true, `${W}: eleven topics draw the strand strip`);
      assert.equal(t0.segs.length, 4, 'four bars: Fractions, Equations, Decimals and percent, Equations');
      assert.equal(t0.segs[0].label.toUpperCase(), 'FRACTIONS'); assert.equal(t0.segs[2].label.toUpperCase(), 'DECIMALS AND PERCENT');
      assert.ok(t0.segs.every((g) => g.fill === 0), 'nothing inked for a fresh learner');
      assert.equal(t0.tickWord, 'School', 'the SCHOOL tick is on the strip (D2)'); assert.equal(t0.gap, false, 'no gap line (D2)'); assert.equal(t0.pillInside, true, 'the pill is whole on the ruler');
      assert.equal(t0.needle, 26, 'the needle at the start');
      const g3 = t0.segs[3]; assert.ok(t0.tick > g3.left && t0.tick < g3.left + g3.width, 'a UK 12-year-old\'s tick in the last Equations bar, before both sides');
      await shot('tonight-fresh'); report.tonight.push({ viewport: `${W}x${H}`, learner: 'fresh', strip: t0 });
      // ---- Topics for the fresh learner: eleven stops, the ruler panning, every focused name whole
      await press('ArrowRight'); await press('Enter', 1500);
      m = await measure(page); assert.equal(m.screen, 'topics'); clean(m, 'Topics');
      let r = await ruler(page);
      assert.deepEqual(r.names, NAMES, `${W}: eleven topics on Topics`); assert.equal(r.pan, true);
      assert.equal(r.focused, NAMES[0]); assert.ok(r.whole, `${W}: the focused name is whole`); assert.equal(r.gap, false);
      await shot('topics-0');
      const whole = [{ name: NAMES[0], px: r.focusedPx }];
      for (let i = 1; i < NAMES.length; i++) {
        await press('ArrowRight');
        r = await ruler(page);
        assert.equal(r.focused, NAMES[i]); assert.ok(r.whole, `${W}: "${NAMES[i]}" whole when focused`); assert.equal(r.gap, false);
        whole.push({ name: NAMES[i], px: r.focusedPx });
        if (i === NAMES.length - 1) assert.equal(r.tickWord, 'School', 'panned to the end, the SCHOOL tick is drawn whole');
        clean(await measure(page), `Topics focus ${i}`);
        if (i === 5 || i === 8 || i === 10) await shot(`topics-${i}`);
      }
      report.topics.push({ viewport: `${W}x${H}`, focused: whole, strands: r.strands });

      // ---- the seeded learner: bars inked by their share, the needle at the conversion
      await desk(SEEDED); await open();
      m = await measure(page); clean(m, 'Tonight (seeded)');
      const t1 = await strip(page);
      assert.deepEqual(t1.segs.map((g) => Math.round(g.fill)), [100, 100, 25, 0], `${W}: each bar inked by its share of secure topics`);
      const d = t1.segs[2]; assert.ok(Math.abs(t1.needle - (d.left - 6 + (d.width + 12) / 4)) <= 1, `the needle a quarter into the decimals bar (${t1.needle})`);
      assert.equal(t1.tickWord, 'School'); assert.equal(t1.gap, false);
      await shot('tonight-seeded'); report.tonight.push({ viewport: `${W}x${H}`, learner: 'seeded', strip: t1 });
      await press('ArrowRight'); await press('Enter', 1500);
      r = await ruler(page); assert.equal(r.focused, NAMES[6], 'Teach me something opens Topics at the frontier: the conversion'); assert.ok(r.whole);
      clean(await measure(page), 'Topics (seeded)'); await shot('topics-seeded');
      await ctx.close();
    }

    // ---- each new unit's practice sheet, written by code
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1210 } }), tv = await ctx.newPage();
    tv.on('pageerror', (e) => errors.push('tv: ' + e.message));
    await tv.route('**/api/speak**', (r) => r.fulfill({ status: 204, body: '' }));
    const press = async (k, ms = 700) => { await tv.keyboard.press(k); await tv.waitForTimeout(ms); };
    for (const u of UNITS) {
      await desk(FRESH);
      await tv.goto(base + '/tv?display=tv&key=' + encodeURIComponent(key)); await tv.waitForSelector('.maths-tv[data-screen="tonight"]'); await tv.waitForTimeout(1200);
      await tv.locator('.stage').click({ position: { x: 4, y: 4 } });
      await press('ArrowRight'); await press('Enter', 1500);
      for (let i = 0; i < u.stop; i++) await press('ArrowRight', 400);
      assert.equal((await ruler(tv)).focused, NAMES[u.stop]);
      const answer = tv.waitForResponse((r) => r.url().endsWith('/api/practice') && r.request().method() === 'POST', { timeout: 30000 });
      await press('Enter', 100);
      const resp = await answer, made = await resp.json();
      assert.equal(resp.status(), 200, JSON.stringify(made));
      assert.deepEqual({ provider: made.provider, tries: made.tries, items: made.items }, { provider: 'code', tries: 0, items: 6 }, `${u.id}: written by code, no model call`);
      await tv.waitForSelector('.maths-tv[data-screen="practice"] [data-role="maths-sheet"] .mb-item:nth-child(6)', { timeout: 15000 });
      await tv.waitForTimeout(1500);
      const m = await measure(tv); assert.equal(m.screen, 'practice');
      assert.deepEqual(m.outside, [], `${u.id}: the sheet inside the safe zone`); assert.deepEqual(m.small, [], `${u.id}: no text under 28 px`);
      const rows = await sheet(tv), items = (await current()).practice.items;
      assert.equal(rows.length, 6);
      rows.forEach((r, i) => {
        assert.match(r.text, u.words, r.text); assert.ok(r.inside, `"${r.text}" inside the paper`); assert.ok(r.fits, `"${r.text}" fits its row`);
        assert.equal(r.fracs, u.fracs(items[i].question), `"${r.text}" stacks its fractions`);
        assert.ok(r.numeralPx.length >= 1 && r.numeralPx.every((px) => px >= 28), `"${r.text}" numerals ${r.numerals.join(',')} at ${r.numeralPx.join(',')} px`);
        for (const d of items[i].question.match(/\d+\.\d+/g) ?? []) assert.ok(r.numerals.includes(d) || r.text.includes(d), `"${r.text}": the decimal ${d} is set whole`);
        assert.ok(r.signPx.every((x) => x.px >= 28), `"${r.text}": signs ${JSON.stringify(r.signPx)}`);
        if (/%/.test(items[i].question)) assert.ok(r.signPx.some((x) => x.s === '%'), `"${r.text}": the percent sign is set`);
      });
      await tv.locator('.frame').screenshot({ path: path.join(out, `practice-${u.id}.png`) });
      report.sheets[u.id] = { questions: items.map((i) => i.question), tiers: items.map((i) => i.tier), rows };
    }

    // ---- a percent of an amount set, typed on the phone (a percent answer and a money answer among them)
    await desk(FRESH);
    await tv.goto(base + '/tv?display=tv&key=' + encodeURIComponent(key)); await tv.waitForSelector('.maths-tv[data-screen="tonight"]'); await tv.waitForTimeout(1200);
    await tv.locator('.stage').click({ position: { x: 4, y: 4 } });
    const pin = (await current()).pin;
    const pctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }), phone = await pctx.newPage();
    phone.on('pageerror', (e) => errors.push('phone: ' + e.message));
    const marks = []; phone.on('response', (r) => { if (r.url().endsWith('/api/mark')) marks.push(r); });
    await phone.goto(base + '/phone?pin=' + pin);
    await phone.waitForFunction(async () => (await (await fetch('/api/session')).json()).viewer === 'phone', null, { timeout: 20000 });
    await event({ type: 'nav', screen: 'topics', focus: 7 });
    // a set whose tier-2 items (4-6) carry a money amount - money in six of ten, so a few tries at most
    let items = null;
    for (let k = 0; k < 8 && !items; k++) {
      const made = await fetch(base + '/api/practice', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ topic: 'pct-of-amount' }) });
      assert.equal(made.status, 200); const body = await made.json(); assert.deepEqual([body.provider, body.tries, body.items], ['code', 0, 6], 'written by code, no model call');
      const got = (await current()).practice.items;
      if (got.slice(3).some((it) => /[€£]/.test(it.question))) items = got;
    }
    assert.ok(items, 'a set with a money amount in its second half');
    await tv.waitForSelector('.maths-tv[data-screen="practice"] [data-role="maths-sheet"] .mb-item:nth-child(6)', { timeout: 15000 });
    const plan = items.map((it) => percentOf(it.question));
    const moneyIx = [3, 4, 5].find((i) => plan[i].sign), [percentIx, wordsIx] = [3, 4, 5].filter((i) => i !== moneyIx);
    // 1 right; 2 the percent as a whole number (the ÷ 100 forgotten); 3 blank; the tier-2 three: the amount with a percent
    // sign (unsure), the money answer with its sign (right), words (unsure)
    const typed = plan.map((p, i) => (i === 0 ? p.right : i === 1 ? p.timesWhole : i === 2 ? '' : i === moneyIx ? p.money : i === percentIx ? `${p.right}%` : 'nine'));
    const want = plan.map((p, i) => (i === 0 ? ['right'] : i === 1 ? ['wrong', 'pct-times-whole'] : i === 2 ? ['unsure'] : i === moneyIx ? ['right'] : ['unsure']));
    if (!(await phone.locator('[data-role="practice-route"]').count())) await phone.getByRole('button', { name: 'Practice', exact: true }).click().catch(() => phone.getByText('Practice', { exact: true }).click());
    await phone.waitForSelector('[data-role="practice-route"]', { timeout: 15000 }).catch(async (e) => { await phone.screenshot({ path: path.join(out, 'phone-debug.png'), fullPage: true }); throw e; });
    await phone.getByRole('button', { name: 'Type my answers' }).click();
    const boxes = phone.locator('[data-role="typed-answer"]'); await boxes.first().waitFor();
    assert.equal(await boxes.count(), 6);
    for (let i = 0; i < 6; i++) if (typed[i]) await boxes.nth(i).fill(typed[i]);
    await phone.screenshot({ path: path.join(out, 'phone-typed-percent.png'), fullPage: true });
    await phone.getByRole('button', { name: 'Send my answers' }).click();
    await phone.waitForFunction(() => /right\./.test(document.querySelector('.pscreen')?.textContent || ''), null, { timeout: 15000 });
    assert.equal(marks.length, 1); const markBody = await marks[0].json();
    assert.equal(markBody.provider, 'code'); assert.equal(markBody.ms, 0);
    await tv.waitForSelector('.maths-tv[data-screen="sheet"]', { timeout: 15000 }); await tv.waitForTimeout(1500);
    const after = (await current()).practice.items;
    after.forEach((it, i) => { assert.equal(it.verdict, want[i][0], `#${i + 1} "${typed[i]}" on ${it.question}`); if (want[i][1]) assert.equal(it.slip, want[i][1]); });
    const ms = await measure(tv); assert.deepEqual(ms.outside, [], 'the marked sheet inside the safe zone'); assert.deepEqual(ms.small, [], 'no text under 28 px');
    await tv.locator('.frame').screenshot({ path: path.join(out, 'sheet-percent-typed.png') });
    report.typed = { questions: items.map((i) => i.question), typed, verdicts: after.map((i) => [i.verdict, i.slip ?? null]) };
    await pctx.close(); await ctx.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  assert.deepEqual(errors, [], 'no page errors');
  console.log('school-units2-live: ok'); console.log(JSON.stringify(report, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
