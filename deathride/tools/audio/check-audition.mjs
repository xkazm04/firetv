// Browser verification, not a perceptual listening judgment. Run from deathride/.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const evidence = path.resolve('audio/audition/evidence');
fs.mkdirSync(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1060 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const results = { at: new Date().toISOString(), page: 'audio/audition/index.html', browser: await browser.version(), layouts: [], media: [] };
try {
  await page.goto(pathToFileURL(path.resolve('audio/audition/index.html')).href);
  assert.equal(await page.locator('audio').count(), 32);
  assert.equal(await page.locator('.sample:visible').count(), 4);
  for (const theme of ['dark', 'light']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1060 });
      const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
        audioOverflow: [...document.querySelectorAll('.sample:not(.hidden) audio')].some(a => a.getBoundingClientRect().right > innerWidth),
        theme: document.documentElement.dataset.theme }));
      assert.ok(layout.scroll <= width, JSON.stringify(layout)); assert.equal(layout.audioOverflow, false);
      results.layouts.push(layout);
      if (width === 1440 || width === 390) await page.screenshot({ path: path.join(evidence, `${theme}-${width}.png`), fullPage: false });
    }
  }
  await page.selectOption('#category', 'all');
  assert.equal(await page.locator('.sample:visible').count(), 32);
  for (const mode of ['raw', 'matched', 'repeat']) {
    await page.selectOption('#mode', mode);
    const checked = await page.evaluate(async mode => {
      const checks = [];
      for (const player of document.querySelectorAll('audio')) {
        if (mode === 'repeat' && !player.src.endsWith('.ogg')) continue;
        player.muted = true;
        const duration = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Media timeout: ' + player.dataset.id)), 10000);
          player.addEventListener('loadedmetadata', () => { clearTimeout(timer); resolve(player.duration); }, { once: true });
          player.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Media error: ' + player.dataset.id)); }, { once: true });
          player.load();
        });
        if (!Number.isFinite(duration) || duration <= 0) throw new Error('Invalid duration');
        await player.play();
        await new Promise(resolve => setTimeout(resolve, 30));
        player.pause();
        checks.push({ id: player.dataset.id, mode, duration, src: player.src.split('/').at(-1), played: true });
      }
      return checks;
    }, mode);
    results.media.push(...checked);
  }
  await page.selectOption('#mode', 'matched');
  const exclusive = await page.evaluate(async () => {
    const [a,b] = document.querySelectorAll('audio'); a.muted=b.muted=true;
    await a.play(); await b.play(); return { firstPaused: a.paused, secondPlaying: !b.paused };
  });
  assert.deepEqual(exclusive, { firstPaused: true, secondPlaying: true });
  await page.click('#stop');
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('audio')].every(a=>a.paused)), true);
  await page.selectOption('#category', 'tts');
  assert.equal(await page.locator('.sample:visible').count(), 4);
  await page.fill('#note-music', 'TEST DRAFT: compare dust-race and noir-race; not an owner decision.');
  await page.reload();
  assert.match(await page.inputValue('#note-music'), /TEST DRAFT/);
  const downloadPromise = page.waitForEvent('download');
  await page.click('#export');
  const download = await downloadPromise;
  const downloaded = fs.readFileSync(await download.path(), 'utf8');
  assert.match(downloaded, /TEST DRAFT/); assert.match(downloaded, /Not an implementation approval/);
  assert.equal(download.suggestedFilename(), 'DEATH-RIDE-AUDIO-CHOICES-DRAFT.md');
  await page.click('#theme');
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.reload();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
  assert.deepEqual(errors, []);
  results.result = 'pass'; results.checks = ['32 players / 4 directions', '72 media loads and muted playback starts', 'eight layouts, no horizontal overflow',
    'one player at a time', 'stop', 'category filtering', 'theme persistence', 'draft notes persistence and export'];
  results.notMeasured = ['human listening', 'physical mobile browser', 'Fire TV playback', 'in-game acceptance'];
  fs.writeFileSync(path.join(evidence, 'browser-check.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify({ result: results.result, layouts: results.layouts.length, media: results.media.length, errors }));
} catch (error) {
  results.result = 'fail'; results.error = error.message;
  fs.writeFileSync(path.join(evidence, 'browser-check-failed.json'), JSON.stringify(results, null, 2) + '\n');
  throw error;
} finally { await browser.close(); }
