/**
 * The landing in a real browser: the D-pad through the real /tv page, the Select hand-off, reduced motion, the
 * 1920 x 1080 stage's safe zone and type floor, at 1920 x 1080 and at 1280 x 720. Not part of `npm test` (it needs a
 * server); run it against an isolated one, as tools/linga-ui-test.cjs is run:
 *
 *   DESK_DATA_DIR=<scratch dir> npx next dev --webpack -p 3441          (in desk/)
 *   LANDING_TEST_ALLOW_WRITES=1 LANDING_TEST_URL=http://localhost:3441 DESK_DATA_DIR=<the same dir> node tools/tv-landing-live.cjs
 *
 * The desk is built through the session's own events (a fresh desk, one learner, a phone paired or not), so what it
 * asserts does not depend on what a learner has waiting: focus, the hand-off and the frame are the landing's own.
 * It writes screenshots to artifacts/tv-landing/ (git-ignored). Playwright is resolved from tools/node_modules (or NODE_PATH).
 */
const { chromium } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
if (process.env.LANDING_TEST_ALLOW_WRITES !== '1') throw new Error('Use an isolated server, then set LANDING_TEST_ALLOW_WRITES=1.');
if (!process.env.DESK_DATA_DIR) throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test opens the TV with the key the desk keeps there.');
const base = process.env.LANDING_TEST_URL || 'http://localhost:3441';
const key = JSON.parse(fs.readFileSync(path.join(process.env.DESK_DATA_DIR, 'pairing.json'), 'utf8')).key;
const out = path.resolve(__dirname, '../artifacts/tv-landing'); fs.mkdirSync(out, { recursive: true });

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
const current = async () => (await fetch(base + '/api/session', { headers: { cookie } })).json();
const EMA = { id: 'ema-live', name: 'Ema', type: 'high-school', age: 16, system: 'uk', modules: ['maths', 'english', 'essay'] };
const ADULT = { id: 'adult-live', name: 'Jakub', type: 'other', modules: ['english', 'essay'] };
async function desk({ who = EMA, paired = true, nobody = false } = {}) {
  await event({ type: 'reset' });
  if (!nobody) { await event({ type: 'profile.draft', patch: who }); await event({ type: 'profile.save' }); }
  if (paired) await event({ type: 'join' });
  await event({ type: 'nav', screen: 'landing', focus: -1 });
}
const lit = (page) => page.locator('[data-role="desk-scene"]').getAttribute('data-lit');
const press = async (page, k) => { await page.keyboard.press(k); await page.waitForTimeout(140); };
async function waitScreen(page, fn, ms = 6000) { const t0 = Date.now(); for (;;) { const s = await current(); if (fn(s)) return { s, ms: Date.now() - t0 }; if (Date.now() - t0 > ms) throw new Error('screen never got there: ' + s.screen); await page.waitForTimeout(20); } }

/** Everything the landing shows as words or controls stays inside the 5% safe zone; meaning is never under 28px. */
async function frame(page, label) {
  const r = await page.evaluate(() => {
    const stage = document.querySelector('.stage').getBoundingClientRect(), k = stage.width / 1920;
    const scene = document.querySelector('[data-role="desk-scene"]');
    const inside = [], small = [];
    const boxes = ['.pp-cap', '.pp-cont', '.pp-else', '.pp-nm', '.pp-brand', '.pp-badge', '.pp-hints', '.pp-postcard'];
    for (const sel of boxes) for (const el of scene.querySelectorAll(sel)) {
      const b = el.getBoundingClientRect(), x0 = (b.left - stage.left) / k, x1 = (b.right - stage.left) / k, y0 = (b.top - stage.top) / k, y1 = (b.bottom - stage.top) / k;
      if (x0 < 96 - 2 || x1 > 1824 + 2 || y0 < 54 - 2 || y1 > 1026 + 2) inside.push(`${sel} ${x0 | 0},${y0 | 0}-${x1 | 0},${y1 | 0}`);
    }
    const walker = document.createTreeWalker(scene, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim() || !n.parentElement || n.parentElement.closest('[aria-hidden="true"]')) continue;
      const fs = parseFloat(getComputedStyle(n.parentElement).fontSize);
      if (fs < 28) small.push(`${n.parentElement.className || n.parentElement.tagName}:${fs}:${n.textContent.trim().slice(0, 20)}`);
    }
    const cap = scene.querySelector('.pp-cl')?.textContent + ' ' + scene.querySelector('.pp-cd')?.textContent;
    return { inside, small, words: cap.trim().split(/\s+/).length };
  });
  assert.deepEqual(r.inside, [], `${label}: everything stays in the safe zone`);
  // labels that never carry meaning alone are the 20px chips and key hints; nothing else is under the 28px floor
  const stray = r.small.filter((x) => !/pp-chip|pp-h\b|pp-sty/.test(x));
  assert.deepEqual(stray, [], `${label}: no meaning-carrying text under 28px`);
  assert.ok(r.words <= 25, `${label}: the caption is about 25 words or fewer (${r.words})`);
}

(async () => {
  await asTheTV();
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  try {
    for (const [W, H] of [[1920, 1080], [1280, 720]]) {
      const ctx = await browser.newContext({ viewport: { width: W, height: H + 130 } }), page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      const open = async () => { await page.goto(base + '/tv?key=' + encodeURIComponent(key)); await page.waitForSelector('[data-role="desk-scene"]'); await page.waitForTimeout(2600); await page.locator('.stage').click({ position: { x: 4, y: 4 } }); };
      const shot = (name) => page.locator('.frame').screenshot({ path: path.join(out, `${name}-${W}x${H}.png`) });

      // ---- a paired desk with a learner: the shelf of three apps, Someone else, no phone stop
      await desk(); await open();
      const apps = await page.locator('[data-role="desk-object"]').evaluateAll((els) => els.map((e) => e.dataset.app));
      assert.deepEqual(apps, ['maths', 'english', 'essay'], 'only the profile\'s apps, in the desk\'s order');
      assert.equal(await lit(page), 'maths', 'the light rests on the first app when nothing is waiting');
      assert.equal(await page.locator('[data-role="desk-phone"][data-paired="true"]').count(), 1, 'a paired phone is a chip, not a stop');
      await shot('paired'); await frame(page, `paired ${W}`);
      await press(page, 'ArrowRight'); assert.equal(await lit(page), 'english'); assert.equal((await current()).focus, 1);
      assert.equal(await page.locator('[data-role="desk-object"][data-focused="true"]').getAttribute('data-app'), 'english', 'the focus ring is on the tile');
      await press(page, 'ArrowRight'); await press(page, 'ArrowRight'); assert.equal(await lit(page), 'essay', 'Right on the last app stays');
      await press(page, 'ArrowLeft'); assert.equal(await lit(page), 'english');
      await frame(page, `english ${W}`); await shot('english');
      await press(page, 'ArrowDown'); assert.equal(await lit(page), 'place', 'Down is Someone else');
      assert.equal(await page.locator('[data-role="desk-place-card"][data-focused="true"]').count(), 1);
      await frame(page, `place ${W}`); await shot('place');
      await press(page, 'ArrowUp'); assert.equal(await lit(page), 'english', 'Up from Someone else is the app above it');
      await press(page, 'ArrowUp'); assert.equal(await lit(page), 'english', 'a paired phone is not a stop: Up stays');
      // Select on Someone else: the switcher, and Back lands on it again
      await press(page, 'ArrowDown'); await page.keyboard.press('Enter');
      await waitScreen(page, (s) => s.screen === 'learner'); await press(page, 'Backspace');
      await waitScreen(page, (s) => s.screen === 'landing'); await page.waitForTimeout(300);
      assert.equal(await lit(page), 'place', 'Back from the switcher lands on Someone else');
      // Back on the desk rests the light again
      await press(page, 'Backspace'); assert.equal(await lit(page), 'maths');

      // ---- Select on an app: the hand-off plays, then the app opens; Back comes home to that app
      await press(page, 'ArrowRight');
      const t0 = Date.now(); await page.keyboard.press('Enter');
      await page.waitForSelector('[data-role="desk-zoom"]', { timeout: 500 });
      assert.equal(await page.locator('[data-role="desk-zoom"]').getAttribute('data-app'), 'english', 'the hand-off is the lit app\'s');
      await shot('handoff');
      await page.keyboard.press('ArrowLeft'); // the D-pad waits while it plays
      const gone = await waitScreen(page, (s) => s.screen !== 'landing');
      const took = Date.now() - t0;
      assert.ok(took >= 450 && took < 1800, `the hand-off waits ZOOM_MS before the app opens (${took}ms)`);
      assert.equal(gone.s.subject, 'english'); assert.equal(gone.s.screen, 'linga');
      await event({ type: 'nav', screen: 'landing', focus: 1 }); await page.waitForSelector('[data-role="desk-object"]'); await page.waitForTimeout(400);
      assert.equal(await lit(page), 'english', 'coming home, the light is on the app it came from');
      assert.equal(await page.locator('[data-role="desk-zoom"]').count(), 0, 'the hand-off is gone');

      // ---- an adult with two apps: the profile's apps only
      await desk({ who: ADULT }); await open();
      assert.deepEqual(await page.locator('[data-role="desk-object"]').evaluateAll((els) => els.map((e) => e.dataset.app)), ['english', 'essay']);
      assert.ok(!(await page.locator('[data-role="desk-scene"]').innerText()).match(/\bage\b|years|for your age/i), 'no age comparison for an adult');
      await shot('adult'); await frame(page, `adult ${W}`);

      // ---- a fresh, unpaired desk: the postcard with the real address and code is a stop
      await desk({ paired: false }); await open();
      const pin = (await current()).pin;
      assert.equal(await page.locator('[data-role="desk-pin"]').innerText(), pin, 'the postcard shows the session\'s own code');
      assert.equal(await lit(page), 'phone', 'nothing waiting and no phone: the light rests on the phone');
      assert.match(await page.locator('.pp-url').innerText(), /\/phone$/, 'and the desk\'s own address');
      await shot('first-run'); await frame(page, `first-run ${W}`);
      await press(page, 'ArrowDown'); assert.equal(await lit(page), 'essay', 'Down from the phone is the last app');
      await press(page, 'ArrowUp'); assert.equal(await lit(page), 'phone', 'Up from an app is the phone');
      await page.keyboard.press('Enter'); await waitScreen(page, (s) => s.screen === 'pair');
      await press(page, 'Backspace'); await waitScreen(page, (s) => s.screen === 'landing'); await page.waitForTimeout(300);
      assert.equal(await lit(page), 'phone', 'Back from pairing lands on the phone');

      // ---- no one at the desk: an app asks who first
      await desk({ nobody: true }); await open();
      assert.equal(await page.locator('.pp-who').innerText(), 'Whose desk?');
      assert.equal(await page.locator('[data-role="desk-continue"] span').innerText(), 'Choose who is studying');
      await press(page, 'ArrowLeft'); await page.keyboard.press('Enter');
      await page.waitForSelector('[data-role="desk-zoom"][data-app="place"]', { timeout: 500 });
      await waitScreen(page, (s) => s.screen === 'learner');
      await ctx.close();
    }

    // ---- reduced motion: no arrival, no wait - the hand-off is a cut
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1210 }, reducedMotion: 'reduce' }), page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    await desk(); await page.goto(base + '/tv?key=' + encodeURIComponent(key)); await page.waitForSelector('[data-role="desk-scene"]');
    assert.equal(await page.locator('.pp-intro').evaluate((e) => getComputedStyle(e).display), 'none', 'no arrival under reduced motion');
    assert.equal(await page.locator('.pp-layer').first().evaluate((e) => getComputedStyle(e).animationName), 'none', 'the world does not move');
    await page.locator('.stage').click({ position: { x: 4, y: 4 } });
    const t0 = Date.now(); await page.keyboard.press('Enter');
    await waitScreen(page, (s) => s.screen !== 'landing');
    assert.ok(Date.now() - t0 < 450, `reduced motion does not wait (${Date.now() - t0}ms)`);
    await ctx.close();
  } finally { await browser.close(); }
  assert.deepEqual(errors, [], 'no page errors');
  console.log('tv-landing-live: ok');
})().catch((e) => { console.error(e); process.exit(1); });
