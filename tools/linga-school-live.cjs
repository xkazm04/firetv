/**
 * The three school situations on the real TV: Linga's situation list (`linga-scenes`) for a 12-year-old and for a
 * learner of type "other", at 1920 x 1080 and 1280 x 720. Not part of `npm test` (it needs a server); it skips
 * politely unless LINGA_SCHOOL_URL is set. Run it against an isolated server, as tools/tv-landing-live.cjs is run:
 *
 *   DESK_DATA_DIR=<scratch dir> npx next dev --webpack -p 3457          (in desk/)
 *   LINGA_SCHOOL_URL=http://localhost:3457 DESK_DATA_DIR=<the same dir> node tools/linga-school-live.cjs
 *
 * What it asserts, per situation card the TV draws: every piece of text sits inside the 96 / 54 px safe zone of the
 * 1920 x 1080 stage, and no text is under 28 px except uppercase labels of 20-22 px. And who sees what: the
 * 12-year-old's list holds the three school situations (Say that again, please; Our group project; The lost jacket)
 * and the "other" learner's list holds none of them. The desk is built through the session's own events, so no model
 * is called. Screenshots go to artifacts/linga-school/ (git-ignored). Playwright is resolved from tools/node_modules.
 */
if (!process.env.LINGA_SCHOOL_URL) { console.log('linga-school-live: skipped (set LINGA_SCHOOL_URL to an isolated dev server, and DESK_DATA_DIR to its data directory)'); process.exit(0); }
const { chromium } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
if (!process.env.DESK_DATA_DIR) throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test opens the TV with the key the desk keeps there.');
const data = path.resolve(process.env.DESK_DATA_DIR), real = path.resolve(__dirname, '../desk/data');
if (data === real || data.startsWith(real + path.sep)) throw new Error('Refusing to run against desk/data: use a scratch DESK_DATA_DIR.');
const base = process.env.LINGA_SCHOOL_URL.replace(/\/$/, '');
const key = JSON.parse(fs.readFileSync(path.join(data, 'pairing.json'), 'utf8')).key;
const out = path.resolve(__dirname, '../artifacts/linga-school'); fs.mkdirSync(out, { recursive: true });

const SCHOOL = ['Say that again, please', 'Our group project', 'The lost jacket'];
const KID = { id: 'school-kid-live', name: 'Mia', type: 'elementary', age: 12, modules: ['english'] };
const OTHER = { id: 'school-other-live', name: 'Jakub', type: 'other', modules: ['english', 'essay'] };

let cookie = '';
async function asTheTV() {
  const r = await fetch(base + '/tv?key=' + encodeURIComponent(key), { redirect: 'manual' });
  cookie = (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).filter((c) => c.startsWith('desk-tv=')).join('; ');
  assert.ok(cookie, 'the desk took its key');
}
async function event(b) {
  const r = await fetch(base + '/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify(b) });
  assert.equal(r.status, 200, JSON.stringify(b));
  return r.json();
}
async function desk(who) {
  await event({ type: 'reset' });
  await event({ type: 'profile.draft', patch: who }); await event({ type: 'profile.save' });
  await event({ type: 'join' });
  await event({ type: 'subject', subject: 'english' });
  await event({ type: 'nav', screen: 'linga-scenes', focus: 0 });
}

/** One card on the stage: where its text sits (in 1920 x 1080 stage pixels) and how big it is. */
async function measure(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.linga-tv'), stage = document.querySelector('.stage').getBoundingClientRect(), k = stage.width / 1920;
    const outside = [], small = [], seen = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent.trim(), el = n.parentElement;
      if (!text || !el || el.closest('[aria-hidden="true"], .lo-sr')) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      const b = range.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) continue;
      const cs = getComputedStyle(el), size = parseFloat(cs.fontSize) / k, upper = cs.textTransform === 'uppercase' || text === text.toUpperCase();
      const box = { x0: Math.round((b.left - stage.left) / k), x1: Math.round((b.right - stage.left) / k), y0: Math.round((b.top - stage.top) / k), y1: Math.round((b.bottom - stage.top) / k) };
      const row = `${el.className || el.tagName} "${text.slice(0, 28)}" ${size.toFixed(1)}px ${box.x0},${box.y0}-${box.x1},${box.y1}`;
      seen.push(row);
      if (box.x0 < 96 - 2 || box.x1 > 1824 + 2 || box.y0 < 54 - 2 || box.y1 > 1026 + 2) outside.push(row);
      if (size < 27.5 && !(upper && size >= 19.5 && size <= 22.5)) small.push(row);
    }
    const q = (sel) => document.querySelector(sel)?.textContent?.trim() ?? '';
    return { outside, small, seen, title: q('[data-role="linga-title"]'), where: q('.lo-where') };
  });
}

(async () => {
  await asTheTV();
  const browser = await chromium.launch({ headless: true });
  const errors = [], report = [];
  try {
    for (const [W, H] of [[1920, 1080], [1280, 720]]) {
      const ctx = await browser.newContext({ viewport: { width: W, height: H + 130 } }), page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      const open = async () => { await page.goto(base + '/tv?key=' + encodeURIComponent(key)); await page.waitForSelector('.linga-tv[data-view="linga-scenes"]'); await page.waitForTimeout(1200); await page.locator('.stage').click({ position: { x: 4, y: 4 } }); };
      const shot = (name) => page.locator('.frame').screenshot({ path: path.join(out, `${name}-${W}x${H}.png`) });
      // walk the whole list with Next situation (Right once to reach it, then Enter each time), until the first card comes round again
      async function walk(label) {
        const titles = [], cards = [];
        await page.keyboard.press('ArrowRight'); // the lamp moves to Next situation, and stays there
        for (let i = 0; i < 20; i++) {
          await page.waitForTimeout(450);
          const m = await measure(page);
          assert.ok(m.seen.length >= 8, `${label}: the measure found the card's text (${m.seen.length} runs)`);
          if (titles.includes(m.title)) break;
          titles.push(m.title); cards.push(m);
          await shot(`${label}-${String(i + 1).padStart(2, '0')}`);
          await page.keyboard.press('Enter');
        }
        return { titles, cards };
      }

      await desk(KID); await open();
      const kid = await walk('kid12');
      const total = Number(/of (\d+)/.exec(kid.cards[0].where)?.[1]);
      for (const title of SCHOOL) assert.ok(kid.titles.includes(title), `${W}: the 12-year-old is offered "${title}" (saw ${kid.titles.join(' | ')})`);
      assert.equal(kid.titles.length, total, `${W}: the tag counts the list the learner walks (${total})`);
      for (const c of kid.cards) {
        assert.deepEqual(c.outside, [], `${W}: "${c.title}" keeps its text inside the 96/54 px safe zone`);
        assert.deepEqual(c.small, [], `${W}: "${c.title}" has no text under 28 px (20-22 px uppercase labels excepted)`);
      }
      report.push({ viewport: `${W}x${H}`, kid12: kid.titles, kid12Count: total });

      await desk(OTHER); await open();
      const other = await walk('other');
      for (const title of SCHOOL) assert.ok(!other.titles.includes(title), `${W}: a learner of type "other" is not offered "${title}"`);
      assert.ok(other.titles.length >= 5, `${W}: "other" still has situations (${other.titles.length})`);
      for (const c of other.cards) assert.deepEqual(c.outside, [], `${W}: "${c.title}" (other) inside the safe zone`);
      report.push({ viewport: `${W}x${H}`, other: other.titles });
      await ctx.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  assert.deepEqual(errors, [], 'no page errors');
  console.log('linga-school-live: ok'); console.log(JSON.stringify(report));
})().catch((e) => { console.error(e); process.exit(1); });
