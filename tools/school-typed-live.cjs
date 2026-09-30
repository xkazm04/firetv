/**
 * Typed answers on the real phone (Family W6): a 12-year-old UK learner is seated, the desk writes the fractions set
 * by code through the TV (Tonight -> Teach me something -> Topics -> Add and subtract fractions), and on the phone at
 * 390 x 844 the Practice panel offers two routes side by side (snap the sheet, type my answers). The learner types
 * six answers - a right one, a wrong one with a known slip, an unsure one, a blank, an equivalent fraction and a
 * decimal - presses Enter from box to box, sends, and both the phone and the TV arrive at the marked sheet: ticks, a
 * slip where code detected one, a dashed ring and "not sure" where it could not decide. The walk on a wrong item is
 * opened too: an answer with no located slip draws without a pen. Measured at 1920 x 1080 on the TV (96 / 54 px safe
 * zone, no text under 28 px except 20-22 px uppercase labels) and at 390 px on the phone (nothing wider than the
 * page, every tap target in the Practice panel at least 44 px). Not part of `npm test` (it needs a server); it skips
 * politely unless SCHOOL_TYPED_URL is set. Run it against an isolated server whose text and vision engines cannot be
 * reached, so any model call fails loudly:
 *
 *   DESK_DATA_DIR=<scratch dir> CLAUDE_BIN=<a path that does not exist> OLLAMA_HOST=http://127.0.0.1:9 \
 *     npx next dev --webpack -p 3463                                                              (in desk/)
 *   SCHOOL_TYPED_URL=http://localhost:3463 DESK_DATA_DIR=<the same dir> node tools/school-typed-live.cjs
 *
 * What it asserts: the set is written by code (provider "code", 0 tries); the mark answers provider "code" with 0 ms
 * and no engine is reachable to answer otherwise; the phone follows the TV to the sheet; the verdicts are the ones code
 * decides from the spec (the script computes the true value and the classic slip itself, with exact fractions). The desk
 * is built through the session's own events; the phone pairs the way a phone pairs (/phone?pin=). Screenshots go to
 * artifacts/school-typed/ (git-ignored). Playwright is resolved from tools/node_modules.
 */
if (!process.env.SCHOOL_TYPED_URL) { console.log('school-typed-live: skipped (set SCHOOL_TYPED_URL to an isolated dev server, and DESK_DATA_DIR to its data directory)'); process.exit(0); }
const { chromium } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
if (!process.env.DESK_DATA_DIR) throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test opens the TV with the key the desk keeps there.');
const data = path.resolve(process.env.DESK_DATA_DIR), real = path.resolve(__dirname, '../desk/data');
if (data === real || data.startsWith(real + path.sep)) throw new Error('Refusing to run against desk/data: use a scratch DESK_DATA_DIR.');
const base = process.env.SCHOOL_TYPED_URL.replace(/\/$/, '');
const out = path.resolve(__dirname, '../artifacts/school-typed'); fs.mkdirSync(out, { recursive: true });

const LEARNER = { id: 'school-typed-live', name: 'Mia', type: 'elementary', age: 12, system: 'uk', modules: ['maths'] };

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

// ---- exact fractions, for the script's own idea of what is right and what the classic slip would type
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const frac = (n, d) => { const g = gcd(n, d) || 1, s = d < 0 ? -1 : 1; return [(s * n) / g, (s * d) / g]; };
/** "3/4 + 1/6" -> { a:[3,4], op:'+', b:[1,6] } (the practice question is "Work out 3/4 + 1/6.", or the like) */
function parse(question) {
  const m = question.replace(/\s+/g, ' ').match(/(\d+)\s*\/\s*(\d+)\s*([+−-])\s*(\d+)\s*\/\s*(\d+)/);
  assert.ok(m, 'the question reads as two fractions: ' + question);
  return { a: [+m[1], +m[2]], op: m[3] === '+' ? '+' : '-', b: [+m[4], +m[5]] };
}
const value = ({ a, op, b }) => frac(a[0] * b[1] + (op === '+' ? 1 : -1) * b[0] * a[1], a[1] * b[1]);
const text = ([n, d]) => (d === 1 ? String(n) : `${n}/${d}`);
const terminating = ([, d]) => { let x = d; for (const p of [2, 5]) while (x % p === 0) x /= p; return x === 1; };

/** The TV's Math Buddy text: where it sits on the 1920 x 1080 stage, and how big it is. */
async function measure(page) {
  return page.evaluate(() => {
    window.scrollTo(0, 0); // a screenshot scrolls the frame into view; the stage is measured from the top
    const root = document.querySelector('.maths-tv'), st = document.querySelector('.stage'), stage = st.getBoundingClientRect(), k = stage.width / st.offsetWidth;
    const outside = [], small = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.textContent.trim(), el = n.parentElement;
      if (!t || !el || el.closest('[aria-hidden="true"]')) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      const b = range.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) continue;
      // text the paper's own clip hides (a long sheet pans under a fade) is not on the screen: what sits there is not this text
      const top = document.elementFromPoint(Math.min(b.left + b.width / 2, innerWidth - 1), Math.min(b.top + b.height / 2, innerHeight - 1));
      if (b.top + b.height / 2 >= innerHeight || (top && !(top === el || el.contains(top)))) continue;
      const cs = getComputedStyle(el), size = parseFloat(cs.fontSize), upper = cs.textTransform === 'uppercase' || (t === t.toUpperCase() && /[A-Z]/.test(t));
      const box = { x0: Math.round((b.left - stage.left) / k), x1: Math.round((b.right - stage.left) / k), y0: Math.round((b.top - stage.top) / k), y1: Math.round((b.bottom - stage.top) / k) };
      const row = `${el.className || el.tagName} "${t.slice(0, 32)}" ${size.toFixed(1)}px ${box.x0},${box.y0}-${box.x1},${box.y1}`;
      if (box.x0 < 96 - 2 || box.x1 > 1824 + 2 || box.y0 < 54 - 2 || box.y1 > 1026 + 2) outside.push(row);
      if (size < 27.5 && !(upper && size >= 19.5 && size <= 22.5)) small.push(row);
    }
    return { outside, small, stageW: st.offsetWidth, screen: root.getAttribute('data-screen') };
  });
}

/** The phone panel's layout: nothing wider than the page, every tap target in the Practice panel at least 44 px tall. */
const phoneLayout = (page) => page.evaluate(() => {
  const de = document.documentElement, over = de.scrollWidth - de.clientWidth;
  const targets = [...document.querySelectorAll('.pscreen button, .pscreen input, .pscreen textarea')].map((el) => { const r = el.getBoundingClientRect(); return { t: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; });
  const wide = [...document.querySelectorAll('.pscreen *')].filter((el) => el.getBoundingClientRect().right > 390.5).map((el) => el.tagName + '.' + el.className);
  return { over, small: targets.filter((t) => t.h < 44 && t.w > 0), wide, count: targets.length };
});

(async () => {
  await asTheTV();
  await event({ type: 'reset' });
  await event({ type: 'profile.draft', patch: LEARNER }); await event({ type: 'profile.save' });
  await event({ type: 'join' });
  await event({ type: 'subject', subject: 'maths' });
  await event({ type: 'nav', screen: 'tonight', focus: 0 });

  const browser = await chromium.launch({ headless: true });
  const errors = [], report = {};
  try {
    // ---- the TV: Tonight -> Teach me something -> Topics -> Select on fractions -> six questions by code
    const tvCtx = await browser.newContext({ viewport: { width: 1920, height: 1210 } }), tv = await tvCtx.newPage();
    tv.on('pageerror', (e) => errors.push('tv: ' + e.message));
    await tv.route('**/api/speak**', (r) => r.fulfill({ status: 204, body: '' })); // no voice engine runs for a capture
    const tvShot = (name) => tv.locator('.frame').screenshot({ path: path.join(out, `${name}.png`) });
    const press = async (k, ms = 700) => { await tv.keyboard.press(k); await tv.waitForTimeout(ms); };
    await tv.goto(base + '/tv?display=tv&key=' + encodeURIComponent(key));
    await tv.waitForSelector('.maths-tv[data-screen="tonight"]'); await tv.waitForTimeout(1500);
    // ---- the phone: pairs with ?pin= while the TV is on Tonight, then follows the TV to Practice
    const pin = (await current()).pin;
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }), page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('phone: ' + e.message));
    const marks = [];
    page.on('response', (r) => { if (r.url().endsWith('/api/mark')) marks.push(r); });
    const shot = (name, full = false) => page.screenshot({ path: path.join(out, name + '.png'), fullPage: full });
    await page.goto(base + '/phone?pin=' + pin);
    await page.waitForFunction(async () => (await (await fetch('/api/session')).json()).viewer === 'phone', null, { timeout: 20000 }).catch(() => { throw new Error('The phone did not pair with ?pin='); });
    await press('ArrowRight'); await press('Enter', 1500);
    assert.equal((await measure(tv)).screen, 'topics', 'Teach me something opens Topics');
    const made = tv.waitForResponse((r) => r.url().endsWith('/api/practice') && r.request().method() === 'POST', { timeout: 30000 });
    await press('Enter', 100);
    const resp = await made, madeBody = await resp.json();
    assert.equal(resp.status(), 200, JSON.stringify(madeBody));
    assert.deepEqual({ provider: madeBody.provider, tries: madeBody.tries, items: madeBody.items }, { provider: 'code', tries: 0, items: 6 }, 'written by code, no model call');
    await tv.waitForSelector('.maths-tv[data-screen="practice"] [data-role="maths-sheet"] .mb-item:nth-child(6)', { timeout: 15000 });
    await tv.waitForTimeout(1500);
    const card = await tv.locator('.mb-card .nx').textContent();
    assert.match(card, /waiting for the sheet or your answers/, 'the TV card names both ways in');
    const tvOpen = await measure(tv);
    assert.deepEqual(tvOpen.outside, [], 'the practice card keeps to the safe zone'); assert.deepEqual(tvOpen.small, [], 'and to the 28 px floor');
    await tvShot('01-tv-practice-waiting');

    // ---- what to type, worked out from the set the desk wrote
    const seated = await current();
    const items = seated.practice.items;
    assert.equal(items.length, 6);
    const plan = items.map((it) => ({ n: it.n, q: it.question, ...parse(it.question) }));
    plan.forEach((p) => { p.v = value(p); });
    // the wrong one carries the unit's classic slip, whichever way the item goes: a '+' item adds the tops and the bottoms,
    // a '-' item is taken the wrong way round (the answer with its sign flipped)
    const slipOf = (p) => (p.op === '+' ? { typed: `${p.a[0] + p.b[0]}/${p.a[1] + p.b[1]}`, slip: 'tops-and-bottoms' } : { typed: `${text([-p.v[0], p.v[1]])}`, slip: 'wrong-direction' });
    const typed = plan.map((p) => {
      switch (p.n) {
        case 1: return text(p.v);                                                          // right
        case 2: return slipOf(p).typed;                                                    // wrong, with a slip code can name
        case 3: return '0,5';                                                              // uk: a decimal comma is not read: not sure
        case 4: return '';                                                                 // left blank: not sure
        case 5: return text([p.v[0] * 2, p.v[1] * 2]);                                     // equivalent fraction: right
        default: return terminating(p.v) && p.v[1] !== 1 ? String(p.v[0] / p.v[1]) : 'about ' + text(p.v); // a decimal when it ends, else words: not sure
      }
    });
    const wanted = plan.map((p, i) => {
      const t = typed[i];
      if (!t.trim()) return { n: p.n, verdict: 'unsure' };
      if (t === '0,5' || t.startsWith('about')) return { n: p.n, verdict: 'unsure' };
      if (/^-?\d+\/\d+$/.test(t)) { const [n, d] = t.split('/').map(Number), [x, y] = frac(n, d); return { n: p.n, verdict: x === p.v[0] && y === p.v[1] ? 'right' : 'wrong' }; }
      return { n: p.n, verdict: 'right' }; // a decimal that ends
    });
    report.typed = typed; report.questions = items.map((i) => i.question); console.log(JSON.stringify({ q: report.questions, typed, wanted, v: plan.map((p) => p.v) }));

    await page.waitForSelector('[data-role="practice-route"]', { timeout: 15000 });
    await page.waitForTimeout(500);
    let lay = await phoneLayout(page);
    assert.ok(lay.over <= 0, `the page does not scroll sideways (${lay.over}px)`); assert.deepEqual(lay.wide, []);
    assert.deepEqual(lay.small, [], 'every tap target in the Practice panel is at least 44 px');
    const routes = await page.locator('[data-role="practice-route"] button').allTextContents();
    assert.deepEqual(routes, ['Snap the sheet', 'Type my answers'], 'both routes are offered');
    assert.equal(await page.locator('[data-role="typed-answer"]').count(), 0, 'the boxes wait for the choice');
    await shot('02-phone-practice-both-routes');

    // the typed route
    await page.getByRole('button', { name: 'Type my answers' }).click();
    const boxes = page.locator('[data-role="typed-answer"]');
    await boxes.first().waitFor();
    assert.equal(await boxes.count(), 6, 'one box per question');
    const send = page.getByRole('button', { name: 'Send my answers' });
    assert.equal(await send.isDisabled(), true, 'Send waits for a box with text');
    const attrs = await boxes.first().evaluate((el) => ({ type: el.type, mode: el.inputMode, ac: el.autocomplete, acor: el.getAttribute('autocorrect'), cap: el.getAttribute('autocapitalize'), spell: el.spellcheck, max: el.maxLength, size: parseFloat(getComputedStyle(el).fontSize) }));
    assert.deepEqual({ type: attrs.type, mode: attrs.mode, ac: attrs.ac, acor: attrs.acor, cap: attrs.cap, spell: attrs.spell, max: attrs.max }, { type: 'text', mode: 'text', ac: 'off', acor: 'off', cap: 'off', spell: false, max: 40 });
    assert.ok(attrs.size >= 16, 'a field size a phone does not zoom into');
    // each question is in plain text above its box, numbered
    const labels = await page.locator('.pask label').allTextContents();
    labels.forEach((l, i) => assert.ok(l.replace(/\s+/g, ' ').includes(items[i].question) && l.trim().startsWith(`${i + 1}.`), `label ${i + 1}: ${l}`));
    lay = await phoneLayout(page);
    assert.ok(lay.over <= 0, `the typed form does not scroll sideways (${lay.over}px)`); assert.deepEqual(lay.wide, [], 'nothing runs past 390 px'); assert.deepEqual(lay.small, [], 'every box and button is at least 44 px');
    await shot('03-phone-typed-empty', true);

    // type, with Enter moving from box to box
    await boxes.nth(0).click();
    for (let i = 0; i < 6; i++) {
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-role')), 'typed-answer');
      assert.equal(await page.evaluate(() => [...document.querySelectorAll('[data-role="typed-answer"]')].indexOf(document.activeElement)), i, `focus is on box ${i + 1}`);
      if (typed[i]) await page.keyboard.type(typed[i]);
      if (i === 0) assert.equal(await send.isDisabled(), false, 'Send wakes once a box has text');
      await page.keyboard.press('Enter');
    }
    assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'BODY', 'Enter on the last box lets the keyboard go');
    for (let i = 0; i < 6; i++) assert.equal(await boxes.nth(i).inputValue(), typed[i], `box ${i + 1} holds what was typed`);
    await shot('04-phone-typed-filled', true);
    await send.scrollIntoViewIfNeeded(); await shot('04b-phone-typed-send-in-view');

    // send: no vision call can answer (the engines are unreachable), so a 200 with provider "code" is the whole proof
    await send.click();
    await page.waitForFunction(() => /right\./.test(document.querySelector('.pscreen')?.textContent || ''), null, { timeout: 15000 });
    assert.equal(marks.length, 1, 'one mark request'); assert.equal(marks[0].status(), 200);
    const markBody = await marks[0].json();
    assert.equal(markBody.provider, 'code'); assert.equal(markBody.ms, 0);
    assert.deepEqual(JSON.parse(marks[0].request().postData()), { answers: typed }, 'the request carries the six answers and no image');
    await tv.waitForSelector('.maths-tv[data-screen="sheet"]', { timeout: 15000 }); await tv.waitForTimeout(1200);
    const after = await current();
    assert.equal(after.practice.marked, true);
    const got = after.practice.items.map((i) => ({ n: i.n, verdict: i.verdict, slip: i.slip, answer: i.studentAnswer }));
    report.marked = got; report.counts = markBody;
    wanted.forEach((w, i) => assert.equal(got[i].verdict, w.verdict, `#${w.n} typed "${typed[i]}"`));
    assert.equal(got[3].verdict, 'unsure', 'the blank is not sure, never wrong'); assert.equal(got[3].answer, '');
    assert.equal(got[2].verdict, 'unsure', '0,5 in uk is not sure');
    assert.equal(got[1].slip, slipOf(plan[1]).slip, 'the slip code detected from the operands');
    assert.ok(after.practice.items.every((i) => i.slipAt === undefined && (i.studentWorking ?? '') === ''), 'no pen position, no working');
    assert.ok(!(after.jobs?.mark?.phase === 'failed'), 'the mark job did not fail');

    // the phone lands on the count, as after a photo
    const phoneText = await page.locator('.pscreen').textContent();
    assert.match(phoneText, /\d right\./); assert.match(phoneText, /Look at the TV/);
    lay = await phoneLayout(page); assert.ok(lay.over <= 0); assert.deepEqual(lay.small, []);
    await shot('05-phone-after-mark');

    // the TV: the sheet, then the walk on the first wrong item (an answer with no located slip)
    await tvShot('06-tv-sheet');
    const tvSheet = await measure(tv);
    assert.deepEqual(tvSheet.outside, [], 'the sheet keeps to the safe zone'); assert.deepEqual(tvSheet.small, [], 'and to the 28 px floor');
    // open the walk the way the TV does: Enter on the focused tile (the first to look at)
    await tv.keyboard.press('Enter'); await tv.waitForSelector('.maths-tv[data-screen="walk"]', { timeout: 10000 }); await tv.waitForTimeout(1500);
    await tvShot('07-tv-walk');
    const tvWalk = await measure(tv);
    assert.deepEqual(tvWalk.outside, [], 'the walk keeps to the safe zone'); assert.deepEqual(tvWalk.small, [], 'and to the 28 px floor');
    await ctx.close(); await tvCtx.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  assert.deepEqual(errors, [], 'no page errors');
  console.log('school-typed-live: ok'); console.log(JSON.stringify(report, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
