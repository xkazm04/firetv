/**
 * The three W7 batch-1 school units on the real TV (Family W7): a 12-year-old UK learner walks Math Buddy's Tonight
 * (seven boxes on the small ruler) -> Teach me something -> Topics (seven topics, the big ruler panning, the focused
 * name whole, the SCHOOL tick drawn and no gap line) at 1920 x 1080 and 1280 x 720; then, on a fresh desk each time,
 * Select on "Equivalent fractions", "A fraction of an amount" and "Multiply and divide fractions": six questions the
 * desk wrote itself with NO model call, fractions stacked, a missing number's gap '?' stacked in its fraction at a
 * sofa-legible size, all inside the paper. Last, the answers to the equivalent fractions set are typed on the phone
 * (390 x 844) and the TV shows the marked sheet: right, a slip code named, a blank, an unsure fraction, words.
 * Not part of `npm test` (it needs a server); it skips politely unless SCHOOL_UNITS_URL is set. Run it against an
 * isolated server whose text and vision engines cannot be reached, so any model call fails loudly:
 *
 *   DESK_DATA_DIR=<scratch dir> CLAUDE_BIN=<a path that does not exist> OLLAMA_HOST=http://127.0.0.1:9 \
 *     npx next dev --webpack -p 3465                                                              (in desk/, or a copy)
 *   SCHOOL_UNITS_URL=http://localhost:3465 DESK_DATA_DIR=<the same dir> node tools/school-units-live.cjs
 *
 * What it asserts: the practice route answers provider "code" and 0 tries for each unit; every piece of Math Buddy text
 * sits inside the 96 / 54 px safe zone of the 1920 x 1080 stage and none is under 28 px except uppercase labels of
 * 20-22 px; every numeral of a question and the gap '?' are at least 28 px; the six questions fit inside the paper; the
 * typed mark answers provider "code" with 0 ms and the verdicts are the ones the script works out itself with exact
 * fractions; no page error. Screenshots go to artifacts/school-units/ (git-ignored). Playwright is resolved from
 * tools/node_modules.
 */
if (!process.env.SCHOOL_UNITS_URL) { console.log('school-units-live: skipped (set SCHOOL_UNITS_URL to an isolated dev server, and DESK_DATA_DIR to its data directory)'); process.exit(0); }
const { chromium } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
if (!process.env.DESK_DATA_DIR) throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test opens the TV with the key the desk keeps there.');
const data = path.resolve(process.env.DESK_DATA_DIR), real = path.resolve(__dirname, '../desk/data');
if (data === real || data.startsWith(real + path.sep)) throw new Error('Refusing to run against desk/data: use a scratch DESK_DATA_DIR.');
const base = process.env.SCHOOL_UNITS_URL.replace(/\/$/, '');
const out = path.resolve(__dirname, '../artifacts/school-units'); fs.mkdirSync(out, { recursive: true });

// a fresh learner id per run: the learner record outlives a desk reset, and the needle reads it
const LEARNER = { id: `school-units-live-${Date.now()}`, name: 'Mia', type: 'elementary', age: 12, system: 'uk', modules: ['maths'] };
const NAMES = ['Equivalent fractions', 'A fraction of an amount', 'Add and subtract fractions', 'Multiply and divide fractions', 'One-step equations', 'Two-step equations', 'Equations with brackets and x on both sides'];
/** The three new units: their stop on Topics, the words a question starts with, the stacked fractions a question sets. */
const UNITS = [
  { id: 'frac-equivalent', stop: 0, words: /^\d?(Fill ?in|Write)/, fracs: (t) => (/missing/.test(t) ? 2 : 1) },
  { id: 'frac-of-amount', stop: 1, words: /^\d?Find/, fracs: () => 1 },
  { id: 'frac-mul-div', stop: 3, words: /^\d?Work ?out/, fracs: () => 2 },
];

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
async function desk() {
  await event({ type: 'reset' });
  await event({ type: 'profile.draft', patch: LEARNER }); await event({ type: 'profile.save' });
  await event({ type: 'join' });
  await event({ type: 'subject', subject: 'maths' });
  await event({ type: 'nav', screen: 'tonight', focus: 0 });
}

// ---- exact fractions: the script's own idea of each equivalent-fractions answer and its classic slip
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function equivalent(question) {
  let m = /(\d+)\s*\/\s*(\d+)\s*=\s*(\?|\d+)\s*\/\s*(\?|\d+)/.exec(question);
  if (m) {
    const [a, b] = [+m[1], +m[2]], top = m[3] === '?', known = +(top ? m[4] : m[3]);
    const answer = top ? a * known / b : b * known / a;
    // added the same number to the top and the bottom: a + (d - b), or b + (c - a)
    const slip = top ? a + known - b : b + known - a;
    return { kind: 'missing', right: String(answer), slip: slip > 0 && slip !== answer ? String(slip) : null, slipId: 'added-same', given: `${a}/${b}` };
  }
  m = /Write (\d+)\s*\/\s*(\d+) in its simplest form/.exec(question);
  assert.ok(m, 'an equivalent fractions question: ' + question);
  const [a, b] = [+m[1], +m[2]], g = gcd(a, b);
  // divided only the top by the common factor: (a / g) / b
  return { kind: 'simplify', right: `${a / g}/${b / g}`, slip: `${a / g}/${b}`, slipId: 'one-part-only', given: `${a * 2}/${b * 2}` };
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
      // a name clamped to two lines (Tonight's seven boxes) is on the screen only as far as its clipping box: the hidden lines are not
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
      // text a panning ruler's window or the paper's clip hides is not on the screen
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

/** The ruler as drawn: its topics, the focused one's name whole, the needle, the tick and the gap line. */
async function ruler(page) {
  return page.evaluate(() => {
    const r = document.querySelector('[data-role="maths-ruler"]');
    const names = [...r.querySelectorAll('.mb-topic .mb-tn')].map((x) => x.textContent.trim());
    const f = r.querySelector('.mb-topic[data-focused="true"] .mb-tn');
    const left = (sel) => { const e = r.querySelector(sel); return e ? parseFloat(e.style.left) : null; };
    const clipped = [...r.querySelectorAll('.mb-topic:not([data-focused]) .mb-tn')].filter((x) => x.scrollHeight > x.clientHeight + 2 || x.scrollWidth > x.clientWidth + 1).length;
    return {
      names, focused: f?.textContent.trim() ?? null, pan: r.getAttribute('data-pan') === 'true',
      whole: f ? f.scrollHeight <= f.clientHeight + parseFloat(getComputedStyle(f).fontSize) * 0.4 && f.scrollWidth <= f.clientWidth + 1 : false,
      focusedPx: f ? parseFloat(getComputedStyle(f).fontSize) : null, unfocusedClipped: clipped,
      needle: left('.mb-marker'), tick: left('.mb-flag'), tickWord: r.querySelector('.mb-flag .mc')?.textContent.trim() ?? null, gap: !!r.querySelector('.mb-gapline'),
    };
  });
}

/** The practice sheet: each question inside the paper, its numerals and any gap '?' at >= 28 px. */
async function sheet(page) {
  return page.evaluate(() => {
    const paper = document.querySelector('[data-role="maths-sheet"]'), pb = paper.getBoundingClientRect();
    const st = document.querySelector('.stage'), k = st.getBoundingClientRect().width / st.offsetWidth;
    return [...paper.querySelectorAll('.mb-item')].map((it) => {
      const b = it.getBoundingClientRect(), row = it.querySelector('.mb-row');
      const leaves = [...it.querySelectorAll('*')].filter((e) => e.children.length === 0 && !e.closest('.num'));
      const nums = leaves.filter((e) => /^\d+$/.test(e.textContent.trim()));
      const gaps = leaves.filter((e) => e.textContent.trim() === '?' && e.closest('[data-role="maths-frac"]'));
      return {
        text: it.textContent.replace(/\s+/g, ' ').trim(),
        inside: b.left >= pb.left - 1 && b.right <= pb.right + 1 && b.top >= pb.top - 1 && b.bottom <= pb.bottom + 1,
        fits: row ? row.scrollWidth <= row.clientWidth + 1 : false,
        fracs: it.querySelectorAll('[data-role="maths-frac"]').length,
        numeralPx: nums.map((e) => parseFloat(getComputedStyle(e).fontSize)),
        gapPx: gaps.map((e) => ({ px: parseFloat(getComputedStyle(e).fontSize), h: Math.round(e.getBoundingClientRect().height / k), w: Math.round(e.getBoundingClientRect().width / k) })),
      };
    });
  });
}

(async () => {
  await asTheTV();
  const browser = await chromium.launch({ headless: true });
  const errors = [], report = { rulers: [], sheets: {}, typed: null };
  try {
    // ---- Tonight and Topics at both viewports: seven boxes, then the panning Topics ruler with every name whole when focused
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
      await desk();
      await page.goto(base + '/tv?display=tv&key=' + encodeURIComponent(key)); await page.waitForSelector('.maths-tv[data-screen="tonight"]'); await page.waitForTimeout(1500);
      await page.locator('.stage').click({ position: { x: 4, y: 4 } });
      let m = await measure(page);
      assert.equal(m.title, 'School maths, from the first step'); clean(m, 'Tonight');
      const tonight = await ruler(page);
      assert.deepEqual(tonight.names, NAMES, `${W}: Tonight's small ruler has the seven topics in boxes`); assert.equal(tonight.pan, false); assert.equal(tonight.gap, false); assert.equal(tonight.tickWord, 'School');
      await shot('tonight');
      await press('ArrowRight'); await press('Enter', 1500);
      m = await measure(page); assert.equal(m.screen, 'topics');
      const topics = await ruler(page);
      assert.deepEqual(topics.names, NAMES, `${W}: seven topics on Topics`); assert.equal(topics.pan, true, `${W}: the Topics ruler pans at seven`);
      assert.equal(topics.focused, NAMES[0]); assert.ok(topics.whole, `${W}: the focused name is whole`);
      assert.equal(topics.tickWord, null, 'on the first stop the tick is past the window: not drawn cut in half'); assert.equal(topics.gap, false, 'no gap line (D2)'); assert.equal(topics.needle, 26, 'the needle at the start');
      clean(m, 'Topics'); await shot('topics-0');
      const whole = [{ name: NAMES[0], px: topics.focusedPx }];
      for (let i = 1; i < NAMES.length; i++) {
        await press('ArrowRight');
        const r = await ruler(page);
        assert.equal(r.focused, NAMES[i]); assert.ok(r.whole, `${W}: "${NAMES[i]}" whole when focused`);
        whole.push({ name: NAMES[i], px: r.focusedPx });
        if (i === NAMES.length - 1) assert.equal(r.tickWord, 'School', 'panned to the end, the SCHOOL tick is drawn whole');
        clean(await measure(page), `Topics focus ${i}`);
        if (i === 3 || i === 6) await shot(`topics-${i}`);
      }
      report.rulers.push({ viewport: `${W}x${H}`, tonight, topicsFocused: whole });
      await ctx.close();
    }

    // ---- each new unit's practice sheet, written by code
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1210 } }), tv = await ctx.newPage();
    tv.on('pageerror', (e) => errors.push('tv: ' + e.message));
    await tv.route('**/api/speak**', (r) => r.fulfill({ status: 204, body: '' }));
    const press = async (k, ms = 700) => { await tv.keyboard.press(k); await tv.waitForTimeout(ms); };
    for (const u of UNITS) {
      await desk();
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
        assert.equal(r.fracs, u.fracs(items[i].spec.shape), `"${r.text}" stacks its fractions`);
        assert.ok(r.numeralPx.length >= 2 && r.numeralPx.every((px) => px >= 28), `"${r.text}" numerals ${r.numeralPx.join(',')} px`);
        if (items[i].spec.shape === 'missing') { assert.equal(r.gapPx.length, 1, `"${r.text}": the gap is stacked`); assert.ok(r.gapPx[0].px >= 28 && r.gapPx[0].h >= 28, `"${r.text}": the gap ${JSON.stringify(r.gapPx[0])}`); }
      });
      await tv.locator('.frame').screenshot({ path: path.join(out, `practice-${u.id}.png`) });
      report.sheets[u.id] = { questions: items.map((i) => i.question), tiers: items.map((i) => i.tier), rows };
    }

    // ---- the equivalent fractions set, typed on the phone; the TV lands on the marked sheet
    await desk();
    await tv.goto(base + '/tv?display=tv&key=' + encodeURIComponent(key)); await tv.waitForSelector('.maths-tv[data-screen="tonight"]'); await tv.waitForTimeout(1200);
    await tv.locator('.stage').click({ position: { x: 4, y: 4 } });
    const pin = (await current()).pin;
    const pctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }), phone = await pctx.newPage();
    phone.on('pageerror', (e) => errors.push('phone: ' + e.message));
    const marks = []; phone.on('response', (r) => { if (r.url().endsWith('/api/mark')) marks.push(r); });
    await phone.goto(base + '/phone?pin=' + pin);
    await phone.waitForFunction(async () => (await (await fetch('/api/session')).json()).viewer === 'phone', null, { timeout: 20000 });
    // the set is written through the practice route as Select on Topics writes it (the TV's own request; the key walk is
    // captured above), so the phone's pairing cannot race the D-pad here
    await event({ type: 'nav', screen: 'topics', focus: 0 });
    const madeTyped = await fetch(base + '/api/practice', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ topic: 'frac-equivalent' }) });
    assert.equal(madeTyped.status, 200); const madeBody = await madeTyped.json();
    assert.deepEqual([madeBody.provider, madeBody.tries, madeBody.items], ['code', 0, 6], 'written by code, no model call');
    await tv.waitForSelector('.maths-tv[data-screen="practice"] [data-role="maths-sheet"] .mb-item:nth-child(6)', { timeout: 15000 });
    const items = (await current()).practice.items;
    const plan = items.map((it) => equivalent(it.question));
    // 1 right; 2 a classic slip (or, where it has none, a plain wrong number); 3 blank; 4 the given fraction (unsure); 5 right; 6 words
    const typed = plan.map((p, i) => [p.right, p.slip ?? '999', '', p.kind === 'missing' ? p.given : p.given, p.right, 'nine'][i]);
    const want = plan.map((p, i) => [['right'], p.slip ? ['wrong', p.slipId] : ['wrong'], ['unsure'], ['unsure'], ['right'], ['unsure']][i]);
    // the phone follows the TV to Practice when it sees the hand-off; if it is still on its home panel, the child taps the Practice tab
    if (!(await phone.locator('[data-role="practice-route"]').count())) await phone.getByRole('button', { name: 'Practice', exact: true }).click().catch(() => phone.getByText('Practice', { exact: true }).click());
    await phone.waitForSelector('[data-role="practice-route"]', { timeout: 15000 }).catch(async (e) => { await phone.screenshot({ path: path.join(out, 'phone-debug.png'), fullPage: true }); throw e; });
    await phone.getByRole('button', { name: 'Type my answers' }).click();
    const boxes = phone.locator('[data-role="typed-answer"]'); await boxes.first().waitFor();
    assert.equal(await boxes.count(), 6);
    for (let i = 0; i < 6; i++) if (typed[i]) await boxes.nth(i).fill(typed[i]);
    await phone.screenshot({ path: path.join(out, 'phone-typed-equivalent.png'), fullPage: true });
    await phone.getByRole('button', { name: 'Send my answers' }).click();
    await phone.waitForFunction(() => /right\./.test(document.querySelector('.pscreen')?.textContent || ''), null, { timeout: 15000 });
    assert.equal(marks.length, 1); const markBody = await marks[0].json();
    assert.equal(markBody.provider, 'code'); assert.equal(markBody.ms, 0);
    await tv.waitForSelector('.maths-tv[data-screen="sheet"]', { timeout: 15000 }); await tv.waitForTimeout(1500);
    const after = (await current()).practice.items;
    after.forEach((it, i) => { assert.equal(it.verdict, want[i][0], `#${i + 1} "${typed[i]}" on ${it.question}`); if (want[i][1]) assert.equal(it.slip, want[i][1]); });
    const ms = await measure(tv); assert.deepEqual(ms.outside, [], 'the marked sheet inside the safe zone'); assert.deepEqual(ms.small, [], 'no text under 28 px');
    await tv.locator('.frame').screenshot({ path: path.join(out, 'sheet-equivalent-typed.png') });
    report.typed = { questions: items.map((i) => i.question), typed, verdicts: after.map((i) => [i.verdict, i.slip ?? null]) };
    await pctx.close(); await ctx.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  assert.deepEqual(errors, [], 'no page errors');
  console.log('school-units-live: ok'); console.log(JSON.stringify(report, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
