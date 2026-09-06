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
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import path from 'node:path';

const ADB =
  process.env.ADB ?? 'C:/Users/kazda/scoop/apps/android-clt/current/platform-tools/adb.exe';
const BASE = process.env.TV_URL ?? 'http://127.0.0.1:8765';
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) => (a.startsWith('--') ? [[a.slice(2), all[i + 1]]] : []))
);
const OUT = path.resolve(args.out ?? '../artifacts');
mkdirSync(OUT, { recursive: true });

const adb = (...a) => execFileSync(ADB, a, { maxBuffer: 1 << 28 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const health = async () => (await fetch(`${BASE}/health`)).json();

/** Pulls a framebuffer capture off the device as a decoded PNG. */
function tvScreenshot(name) {
  adb('shell', 'screencap', '-p', '/sdcard/_live.png');
  const dest = path.join(OUT, name);
  adb('pull', '/sdcard/_live.png', dest);
  return { png: PNG.sync.read(readFileSync(dest)), file: dest };
}

/**
 * Counts pixels close to the pen colour (#FFD400). The fixture clip contains saturated yellow
 * bars, so "is it yellow" is not enough — we require the exact ink hue and ignore the pairing
 * card and status bar regions.
 */
function countInk(png) {
  const { width, height, data } = png;
  let n = 0;
  for (let y = 0; y < height; y++) {
    // Skip the status line at the bottom and the pairing card at the top-right.
    if (y > height * 0.94) continue;
    for (let x = 0; x < width; x++) {
      if (x > width * 0.74 && y < height * 0.44) continue;
      const i = (width * y + x) << 2;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      // #FFD400 with tolerance; the fixture's pure yellow (255,255,0) fails the green test.
      if (r > 230 && g > 185 && g < 232 && b < 70) n++;
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
  check('TV reachable and canvas cleared via D-pad', h.ok && h.annotations === 0, JSON.stringify(h));

  const before = tvScreenshot('live-00-clean.png');
  const inkBefore = countInk(before.png);

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
  check('PWA loaded from the TV and paired over ws://', true, await page.textContent('#status'));

  h = await health();
  check('TV sees the phone connected', h.pens >= 1, `pens=${h.pens}`);

  // The pad must adopt the TV's video aspect, otherwise every stroke arrives stretched.
  const padBox = await page.locator('#pad').boundingBox();
  const padAspect = padBox.width / padBox.height;
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
  check(
    'phone transport control toggles TV playback',
    h.paused === !wasPaused,
    `paused ${wasPaused} -> ${h.paused}`
  );

  // The rest of the test needs a still frame.
  if (!h.paused) {
    await page.click('#btn-playpause');
    await sleep(800);
    h = await health();
  }
  check('TV is paused for telestration', h.paused === true, `paused=${h.paused}`);
  const pausedAt = h.t;

  // ---- 3. draw with real touch events -------------------------------------
  const pad = await page.locator('#pad').boundingBox();
  const cdp = await context.newCDPSession(page);
  const touch = (type, x, y) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 6, radiusY: 6, force: 0.7 }],
    });

  const path0 = [];
  for (let i = 0; i <= 30; i++) {
    const p = i / 30;
    path0.push([pad.x + pad.width * (0.15 + 0.7 * p), pad.y + pad.height * (0.7 - 0.45 * Math.sin(Math.PI * p))]);
  }
  await touch('touchStart', ...path0[0]);
  for (const [x, y] of path0.slice(1)) {
    await touch('touchMove', x, y);
    await sleep(12);
  }
  await touch('touchEnd', ...path0.at(-1));

  await sleep(900);
  h = await health();
  check('touch drawing arrives on the TV as an annotation', h.annotations >= 1, `ink=${h.annotations}`);

  // ---- 4. the assertion that matters: it is actually on the screen ---------
  const after = tvScreenshot('live-01-drawn.png');
  const inkAfter = countInk(after.png);
  check(
    'stroke is rendered in the TV framebuffer',
    inkAfter > inkBefore + 1500,
    `ink px ${inkBefore} -> ${inkAfter}`
  );

  // ---- 5. time anchoring: seek away, the drawing must leave with the frame --
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_RIGHT'); // seek +5s
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_RIGHT'); // seek +5s
  await sleep(1200);
  const seeked = tvScreenshot('live-02-seeked-away.png');
  const inkSeeked = countInk(seeked.png);
  const hSeek = await health();
  check(
    'seeking past the hold window hides the drawing',
    inkSeeked < inkAfter / 3 && hSeek.t > pausedAt + 5000,
    `ink px ${inkAfter} -> ${inkSeeked}, t ${pausedAt} -> ${hSeek.t}`
  );

  // ---- 6. the drawing comes back on its own frame --------------------------
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_LEFT');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_LEFT');
  await sleep(1200);
  const back = tvScreenshot('live-03-seeked-back.png');
  const inkBack = countInk(back.png);
  check(
    'seeking back onto the frame restores the drawing',
    inkBack > inkAfter * 0.6,
    `ink px ${inkBack} (drawn: ${inkAfter})`
  );

  // ---- 7. shape tool -------------------------------------------------------
  await page.click('#t-arrow');
  const c = { x: pad.x + pad.width * 0.3, y: pad.y + pad.height * 0.3 };
  const d = { x: pad.x + pad.width * 0.75, y: pad.y + pad.height * 0.6 };
  await touch('touchStart', c.x, c.y);
  await touch('touchMove', d.x, d.y);
  await touch('touchEnd', d.x, d.y);
  await sleep(800);
  h = await health();
  check('arrow tool commits a second annotation', h.annotations >= 2, `ink=${h.annotations}`);

  await page.screenshot({ path: path.join(OUT, 'live-04-phone.png') });
  tvScreenshot('live-05-arrow.png');

  check('no uncaught errors on the phone page', consoleErrors.length === 0, consoleErrors.join('; '));

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
