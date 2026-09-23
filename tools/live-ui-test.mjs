/**
 * Live UI test: a real browser, driving the real companion page the TV serves, with real touch
 * events — and the assertion is made on pixels captured from the TV itself.
 *
 * Chain under test:
 *   Playwright touch -> PWA pointer events -> ws:// -> Ktor server in the APK -> PenEngine
 *   -> Compose overlay -> framebuffer -> adb screencap -> pixel assertion
 *
 * Nothing here is checked by eye, so it can run in CI.
 *
 * Usage: node live-ui-test.mjs [--out ../artifacts]
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import path from 'node:path';
import { makeAdb, TV_BASE } from './device.mjs';

const BASE = TV_BASE;
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) => (a.startsWith('--') ? [[a.slice(2), all[i + 1]]] : []))
);
const OUT = path.resolve(args.out ?? '../artifacts');
mkdirSync(OUT, { recursive: true });

const adb = makeAdb();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const health = async () => (await fetch(`${BASE}/health`)).json();

/** Pulls a framebuffer capture off the device as a decoded PNG. */
function tvScreenshot(name) {
  adb('shell', 'screencap', '-p', '/sdcard/_live.png');
  const dest = path.join(OUT, name);
  adb('pull', '/sdcard/_live.png', dest);
  return { png: PNG.sync.read(readFileSync(dest)), file: dest };
}

const INK = {
  // #FFD400 with tolerance; the fixture's pure yellow (255,255,0) fails the green test.
  yellow: (r, g, b) => r > 230 && g > 185 && g < 232 && b < 70,
  // #00E5FF, a hue that appears nowhere in the fixture's colour bars.
  cyan: (r, g, b) => r < 90 && g > 195 && b > 225,
};

/**
 * Counts pixels of one pen colour, ignoring the pairing card and the status bar so the test does
 * not end up grading its own furniture.
 */
function countInk(png, which = 'yellow') {
  const match = INK[which];
  const { width, height, data } = png;
  let n = 0;
  for (let y = 0; y < height; y++) {
    if (y > height * 0.94) continue;
    for (let x = 0; x < width; x++) {
      if (x > width * 0.74 && y < height * 0.44) continue;
      const i = (width * y + x) << 2;
      if (match(data[i], data[i + 1], data[i + 2])) n++;
    }
  }
  return n;
}

const checks = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

const run = async () => {
  // ---- 0. clean slate ------------------------------------------------------
  // KEYCODE_DPAD_DOWN is wired to "clear" on the TV, so the remote path gets exercised too.
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_DOWN');
  await sleep(600);
  let h = await health();
  check('TV reachable and canvas cleared via D-pad', h.ok && h.annotations === 0, JSON.stringify(h).slice(0, 80));

  const inkBefore = countInk(tvScreenshot('live-00-clean.png').png);

  // ---- 1. the phone opens the page the TV serves ---------------------------
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  await page.goto(`${BASE}/?pin=${h.pin}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__pen && window.__pen.isConnected(), null, { timeout: 15000 });
  check('PWA loaded from the TV and paired over ws:// using the on-screen PIN', true);

  h = await health();
  check('TV sees the phone connected', h.pens >= 1, `pens=${h.pens}`);

  // The pad must adopt the TV's video aspect, otherwise every stroke arrives stretched.
  const padAspect = await page.locator('#pad').boundingBox().then((b) => b.width / b.height);
  check(
    'pen surface adopts the video aspect from the welcome message',
    Math.abs(padAspect - 16 / 9) < 0.02,
    `pad aspect ${padAspect.toFixed(4)}`
  );

  // ---- 2. pause from the phone --------------------------------------------
  // Assert the toggle *flips* playback rather than that it lands on paused: the TV may already
  // be paused when the test starts, and a previous run must not decide whether this one passes.
  const wasPaused = (await health()).paused;
  await page.click('#btn-playpause');
  await sleep(800);
  h = await health();
  check('phone transport control toggles TV playback', h.paused === !wasPaused, `paused ${wasPaused} -> ${h.paused}`);

  if (!h.paused) {
    await page.click('#btn-playpause');
    await sleep(800);
    h = await health();
  }
  check('TV is paused for telestration', h.paused === true, `paused=${h.paused}`);

  // Anchor the playhead before drawing. Sections 5 and 6 seek +10s and then -10s, which only
  // stays inside a 20s looping fixture if the drawing is made near its middle. Inheriting
  // whatever position the clip happened to be at made those two checks depend on how long the
  // app had been running - invisible on the emulator, where every run starts from a fresh
  // install, and intermittent on a Stick that keeps playing between runs.
  // Land on 5s of the 20s fixture: the +10s seek reaches 15s (still inside, and well past the
  // 6s hold window) and the -10s seek returns to 5s rather than falling off either end.
  for (let i = 0; i < 5; i++) adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_LEFT'); // clamp to 0
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_RIGHT');
  await sleep(1200);
  h = await health();
  const pausedAt = h.t;

  // ---- 3. draw with real touch events -------------------------------------
  const pad = await page.locator('#pad').boundingBox();
  const cdp = await context.newCDPSession(page);
  const touch = (type, x, y) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 6, radiusY: 6, force: 0.7 }],
    });
  const at = (fx, fy) => [pad.x + pad.width * fx, pad.y + pad.height * fy];
  const drag = async (fx, fy, tx, ty) => {
    await touch('touchStart', ...at(fx, fy));
    await touch('touchMove', ...at(tx, ty));
    await touch('touchEnd', ...at(tx, ty));
    await sleep(700);
  };

  const arc = [];
  for (let i = 0; i <= 30; i++) {
    const p = i / 30;
    arc.push(at(0.15 + 0.7 * p, 0.7 - 0.45 * Math.sin(Math.PI * p)));
  }
  await touch('touchStart', ...arc[0]);
  for (const [x, y] of arc.slice(1)) {
    await touch('touchMove', x, y);
    await sleep(12);
  }
  await touch('touchEnd', ...arc.at(-1));

  await sleep(900);
  h = await health();
  check('touch drawing arrives on the TV as an annotation', h.annotations >= 1, `ink=${h.annotations}`);

  // ---- 4. the assertion that matters: it is actually on the screen ---------
  const inkAfter = countInk(tvScreenshot('live-01-drawn.png').png);
  check('stroke is rendered in the TV framebuffer', inkAfter > inkBefore + 1500, `ink px ${inkBefore} -> ${inkAfter}`);

  // ---- 5. time anchoring: seek away, the drawing must leave with the frame --
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_RIGHT');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_RIGHT');
  await sleep(1200);
  const inkSeeked = countInk(tvScreenshot('live-02-seeked-away.png').png);
  const hSeek = await health();
  check(
    'seeking past the hold window hides the drawing',
    inkSeeked < inkAfter / 3 && hSeek.t > pausedAt + 5000,
    `ink px ${inkAfter} -> ${inkSeeked}, t ${pausedAt} -> ${hSeek.t}`
  );

  // ---- 5b. review mode: one tap back to the drawing ------------------------
  // The TV publishes where the drawings are (state.marks); "previous drawing" must land paused on
  // the exact frame the ink is anchored to, without the viewer scrubbing and watching.
  const marks = await page.evaluate(() => (window.__pen.state() || {}).marks || []);
  await page.click('#btn-mark-prev', { timeout: 4000 });
  await sleep(1200);
  const hJump = await health();
  const inkJump = countInk(tvScreenshot('live-02b-jumped-to-drawing.png').png);
  const mark = marks.length ? marks[0] : NaN;
  check(
    'previous drawing jumps paused onto the drawn frame and its ink',
    Math.abs(hJump.t - mark) <= 100 && hJump.paused === true && inkJump > inkAfter * 0.6,
    `marks [${marks.join(',')}], t ${hSeek.t} -> ${hJump.t}, paused=${hJump.paused}, ink px ${inkJump} (drawn: ${inkAfter})`
  );
  // Seek away again so section 6 still proves the remote brings the drawing back on its own.
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_RIGHT');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_RIGHT');
  await sleep(1200);

  // ---- 6. the drawing comes back on its own frame --------------------------
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_LEFT');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_LEFT');
  await sleep(1200);
  const inkBack = countInk(tvScreenshot('live-03-seeked-back.png').png);
  check('seeking back onto the frame restores the drawing', inkBack > inkAfter * 0.6, `ink px ${inkBack} (drawn: ${inkAfter})`);

  // ---- 7. shapes, in a colour chosen on the phone --------------------------
  await page.click('[data-tool="arrow"]');
  await page.click('[data-color="#00E5FF"]');

  // The fixture's colour bars contain a large block of pure cyan, so an absolute count would
  // pass whether or not anything was drawn. The picture is paused, so measure the delta.
  const cyanBefore = countInk(tvScreenshot('live-04b-before-arrow.png').png, 'cyan');
  await drag(0.3, 0.3, 0.75, 0.55);
  h = await health();
  check('arrow tool commits a second annotation', h.annotations >= 2, `ink=${h.annotations}`);

  const cyanAfter = countInk(tvScreenshot('live-05-arrow.png').png, 'cyan');
  check(
    'the colour picked on the phone is the colour drawn on the TV',
    cyanAfter - cyanBefore > 800,
    `cyan px ${cyanBefore} -> ${cyanAfter} (+${cyanAfter - cyanBefore})`
  );

  // ---- 8. undo / redo round trip ------------------------------------------
  const beforeUndo = h.annotations;
  await page.click('#btn-undo');
  await sleep(700);
  h = await health();
  check('undo removes the last annotation', h.annotations === beforeUndo - 1, `ink=${h.annotations}`);
  check('the TV tells the phone redo is now available', h.canRedo === true);

  await page.click('#btn-redo');
  await sleep(700);
  h = await health();
  check('redo puts it back', h.annotations === beforeUndo, `ink=${h.annotations}`);

  // ---- 8b. the phone can see what is already on the TV ---------------------
  // The eraser is unusable without this: the viewer would be tapping at ink they cannot see.
  const mirrored = await page.evaluate(() => window.__pen.mirrored());
  check('the TV mirrors its annotations back to the phone', mirrored >= 2, `${mirrored} annotations mirrored`);

  // ---- 9. eraser ----------------------------------------------------------
  // Tap the apex of the arc from step 3; that stroke, and only that stroke, should vanish.
  await page.click('[data-tool="erase"]');
  const inkBeforeErase = countInk(tvScreenshot('live-06-before-erase.png').png);
  const apex = at(0.5, 0.25);
  await touch('touchStart', ...apex);
  await touch('touchEnd', ...apex);
  await sleep(900);
  const inkAfterErase = countInk(tvScreenshot('live-07-erased.png').png);
  check(
    'tapping ink with the eraser removes that stroke from the TV',
    inkAfterErase < inkBeforeErase * 0.5,
    `ink px ${inkBeforeErase} -> ${inkAfterErase}`
  );

  await page.click('#btn-undo');
  await sleep(800);
  const inkRestored = countInk(tvScreenshot('live-08-erase-undone.png').png);
  check(
    'undoing an erase brings the stroke back',
    inkRestored > inkBeforeErase * 0.8,
    `ink px ${inkAfterErase} -> ${inkRestored}`
  );

  // ---- 10. name tag -------------------------------------------------------
  await page.click('[data-tool="tag"]');
  await page.click('[data-color="#FFD400"]');
  const tagPoint = at(0.3, 0.78);
  await touch('touchStart', ...tagPoint);
  await touch('touchEnd', ...tagPoint);
  await page.waitForSelector('#tagbox.show', { timeout: 4000 });
  check('tapping with the tag tool opens inline label entry, not a blocking dialog', true);

  const beforeTag = (await health()).annotations;
  await page.fill('#tagtext', '#10 Novak');
  await page.click('#tagok');
  await sleep(900);
  const tagged = await health();
  check('a name tag reaches the TV as an annotation', tagged.annotations > beforeTag, `ink=${tagged.annotations}`);
  tvScreenshot('live-09-nametag.png');

  // ---- 11. frame stepping -------------------------------------------------
  const beforeStep = (await health()).t;
  await page.click('#btn-next');
  await sleep(800);
  const afterStep = await health();
  check(
    'the phone can step the TV forward by a single frame',
    afterStep.t > beforeStep && afterStep.t - beforeStep <= 250 && afterStep.paused,
    `t ${beforeStep} -> ${afterStep.t}ms`
  );

  await page.click('#btn-prev');
  await sleep(800);
  const stepBack = (await health()).t;
  check('and back again', stepBack <= afterStep.t, `t ${afterStep.t} -> ${stepBack}ms`);

  // ---- 12. slow motion ----------------------------------------------------
  await page.click('[data-rate="0.25"]');
  await sleep(700);
  const slow = await health();
  check('slow motion rate reaches the player', slow.rate === 0.25, `rate=${slow.rate}`);
  await page.click('[data-rate="1"]');
  await sleep(400);

  // ---- 13. the phone can see the frame it is drawing on -------------------
  const thumb = await page.evaluate(() => {
    const bg = getComputedStyle(document.getElementById('pad')).backgroundImage;
    return { hasImage: bg.includes('data:image/jpeg'), chars: bg.length };
  });
  check('the paused frame arrives on the phone as a thumbnail', thumb.hasImage, `${thumb.chars} chars`);

  // ---- 14. overlay draw budget -------------------------------------------
  const r = await health();
  check(
    'overlay draw stays inside the 4 ms budget',
    r.renderFrames > 20 && r.renderP95Ms < 4.0,
    `p50 ${r.renderP50Ms}ms p95 ${r.renderP95Ms}ms max ${r.renderMaxMs}ms over ${r.renderFrames} frames`
  );

  await page.screenshot({ path: path.join(OUT, 'live-04-phone.png') });
  check('no uncaught errors on the phone page', consoleErrors.length === 0, consoleErrors.join('; '));

  // ---- 15. a pen that cannot quote the PIN is turned away -----------------
  const intruder = await context.newPage();
  await intruder.goto(`${BASE}/?pin=0000`, { waitUntil: 'domcontentloaded' });
  await intruder
    .waitForFunction(() => document.getElementById('status').classList.contains('bad'), null, { timeout: 8000 })
    .catch(() => {});
  const intruderStatus = (await intruder.textContent('#status')) ?? '';
  check('a phone with the wrong PIN is refused', /not paired/i.test(intruderStatus), intruderStatus.slice(0, 55));
  await intruder.close();

  await browser.close();

  const failed = checks.filter((c) => !c.ok);
  writeFileSync(
    path.join(OUT, 'live-ui-test.json'),
    JSON.stringify({ when: new Date().toISOString(), checks }, null, 2)
  );
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed. Artifacts: ${OUT}`);
  process.exit(failed.length ? 1 : 0);
};

run().catch((e) => {
  console.error('live-ui-test crashed:', e);
  process.exit(3);
});
