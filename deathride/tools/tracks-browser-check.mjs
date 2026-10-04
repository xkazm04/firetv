import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {access, mkdir, readFile, writeFile} from 'node:fs/promises';
import {inflateRawSync} from 'node:zlib';

const output = resolve(process.argv[2] || 'evidence/tracks/t1/browser');
await mkdir(output, {recursive: true});
const atlasURL = pathToFileURL(resolve('tracks/atlas/legacy.html')).href;
const labURL = pathToFileURL(resolve('tracks/lab/index.html')).href+'?course=foundry';
const browser = await chromium.launch({channel: 'chrome', headless: true});
const results = [];
const report = JSON.parse(await readFile('tracks/atlas/data.json', 'utf8'));
assert.equal(report.courses.length, 26);
assert.ok(report.gateProof.every(p => p.fired));

async function checkLocalLinks(page) {
  for (const href of await page.locator('a[href]').evaluateAll(xs => xs.map(x => x.href))) {
    if (href.startsWith('file:')) { const url = new URL(href); url.hash = ''; url.search = ''; await access(fileURLToPath(url)); }
  }
}
async function noOverflow(page) {
  const overflowing = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflowing) {
    const boxes = await page.evaluate(() => ({viewport: innerWidth, scroll: document.documentElement.scrollWidth, x: scrollX, elements: [...document.querySelectorAll('body *')].map(e => ({tag: e.tagName, id: e.id, width: e.getBoundingClientRect().width, right: e.getBoundingClientRect().right, scroll: e.scrollWidth, client: e.clientWidth})).filter(e => e.right > innerWidth || e.scroll > e.client + 1 && e.client > 0).slice(0, 20)}));
    assert.fail('horizontal overflow: ' + JSON.stringify(boxes));
  }
}
function zipEntries(bytes) {
  const entries = {};
  const end = bytes.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06])); assert.ok(end >= 0);
  let cursor = bytes.readUInt32LE(end + 16); const count = bytes.readUInt16LE(end + 10);
  for (let i = 0; i < count; i++) {
    assert.equal(bytes.readUInt32LE(cursor), 0x02014b50);
    const method = bytes.readUInt16LE(cursor + 10), size = bytes.readUInt32LE(cursor + 20), nameLength = bytes.readUInt16LE(cursor + 28), extra = bytes.readUInt16LE(cursor + 30), comment = bytes.readUInt16LE(cursor + 32), local = bytes.readUInt32LE(cursor + 42);
    const name = bytes.subarray(cursor + 46, cursor + 46 + nameLength).toString();
    const dataStart = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28), packed = bytes.subarray(dataStart, dataStart + size);
    entries[name] = (method === 8 ? inflateRawSync(packed) : packed).toString(); cursor += 46 + nameLength + extra + comment;
  }
  return entries;
}

try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({viewport: {width, height: 960}}), page = await context.newPage();
    const errors = [], remote = []; page.on('pageerror', e => errors.push(e.message)); page.on('request', r => { if (/^https?:/.test(r.url())) remote.push(r.url()); });
    await page.goto(atlasURL); await page.waitForFunction(() => window.atlasReady);
    assert.equal(await page.locator('article.card').count(), 26);
    assert.equal(await page.locator('input[type=radio]:checked').count(), 0);
    await checkLocalLinks(page); await noOverflow(page);
    const first = page.locator('article.card').first();
    await first.locator('input[value=Keep]').check();
    const note = 'Braking | test \\ line\n<script>literal & safe</script>';
    await first.locator('textarea').fill(note);
    await page.locator('#refresh-export').click(); let markdown = await page.locator('#export').inputValue();
    assert.ok(markdown.includes('&#124;')); assert.ok(markdown.includes('&#92;')); assert.ok(markdown.includes('<br>')); assert.ok(markdown.includes('&lt;script&gt;'));
    assert.equal((markdown.match(/Not reviewed/g) || []).length, 25); assert.ok(markdown.includes('| Keep |'));
    await page.reload(); await page.waitForFunction(() => window.atlasReady);
    assert.equal(await first.locator('textarea').inputValue(), note); assert.ok(await first.locator('input[value=Keep]').isChecked());
    const layers = {};
    for (const layer of ['map', 'contacts', 'wrecks', 'spins', 'speed', 'lines', 'traps']) {
      await page.locator('#layer').selectOption(layer); layers[layer] = await first.locator('canvas').evaluate(c => c.toDataURL());
      assert.ok((await first.locator('.map-legend').textContent()).length > 10);
    }
    assert.notEqual(layers.map, layers.speed); assert.notEqual(layers.speed, layers.lines);
    await page.locator('#theme-filter').selectOption('alpine'); assert.equal(await page.locator('article.card:visible').count(), 4);
    await page.locator('#theme-filter').selectOption('all'); await page.locator('#search').fill('finale arena'); assert.equal(await page.locator('article.card:visible').count(), 1);
    await page.locator('#search').fill('');
    await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: async () => { throw Error('test denied'); }}}); document.execCommand = () => false; });
    await page.locator('#copy').click(); assert.match(await page.locator('#status').textContent(), /selected below/);
    await first.locator('button').first().click(); assert.equal(await first.locator('input:checked').count(), 0);
    for (const theme of ['light', 'dark']) { await page.locator('#theme').selectOption(theme); await page.locator('#layer').selectOption('contacts'); await page.evaluate(() => scrollTo(0, 0)); await noOverflow(page); await page.screenshot({path: resolve(output, `atlas-${width}-${theme}.png`)}); }
    assert.deepEqual(errors, []); assert.deepEqual(remote, []);
    results.push({page: 'atlas', width, pass: true, cards: 26, layers: Object.keys(layers), persistence: true, escapedMarkdown: true, clipboardFallback: true, remote, errors}); await context.close();
  }
  {
    const context = await browser.newContext();
    await context.addInitScript(() => { Storage.prototype.getItem = () => { throw Error('storage denied'); }; Storage.prototype.setItem = () => { throw Error('storage denied'); }; });
    const page = await context.newPage(); await page.goto(atlasURL); await page.waitForFunction(() => window.atlasReady);
    await page.locator('article.card').first().locator('input[value=Maybe]').check(); assert.match(await page.locator('#status').textContent(), /storage unavailable/);
    await page.locator('#refresh-export').click(); assert.match(await page.locator('#export').inputValue(), /\| Maybe \|/);
    results.push({page: 'atlas', storageDeniedFallback: true, pass: true}); await context.close();
  }
  const catalog = await (await fetch('http://127.0.0.1:8794/api/catalog')).json();
  const baseline = catalog.courses.find(c => c.course.id === 'foundry');
  for (const width of [1440, 390]) {
    const context = await browser.newContext({viewport: {width, height: 960}, acceptDownloads: true}), page = await context.newPage(), errors = [], remote = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('request', r => { if (/^https?:/.test(r.url()) && !r.url().startsWith('http://127.0.0.1:8794/')) remote.push(r.url()); });
    await page.goto(labURL); await page.waitForFunction(() => window.labReady); await page.waitForFunction(() => !document.getElementById('race').disabled);
    await noOverflow(page); await checkLocalLinks(page);
    const originalDigest = await page.locator('#draft-digest').textContent();
    await page.locator('#node-width').fill('2'); await page.locator('#node-width').dispatchEvent('change');
    await page.waitForFunction(() => document.getElementById('lint').textContent.includes('narrower'));
    assert.ok(await page.locator('#race').isDisabled());
    await page.locator('#undo').click(); await page.waitForFunction(() => !document.getElementById('race').disabled);
    assert.equal(await page.locator('#draft-digest').textContent(), originalDigest);
    await page.locator('#redo').click(); await page.waitForFunction(() => document.getElementById('lint').textContent.includes('narrower'));
    await page.locator('#undo').click(); await page.waitForFunction(() => !document.getElementById('race').disabled);
    await page.locator('details').filter({has: page.locator('#obstacles-csv')}).locator('summary').click();
    const solid = catalog.obstacles.find(o => o.effect === 'SOLID');
    await page.locator('#obstacle-definition').selectOption(solid.id); await page.locator('#obstacle-lane').fill('0'); await page.locator('#add-obstacle').click();
    await page.waitForFunction(() => document.getElementById('lint').textContent.includes('obstacle blocks racing line'));
    await page.locator('#undo').click(); await page.waitForFunction(() => !document.getElementById('race').disabled);
    // A malformed feature row is not silently discarded or treated as a passing empty list.
    await page.locator('details').filter({has: page.locator('#features-csv')}).locator('summary').click();
    const originalFeatures = await page.locator('#features-csv').inputValue();
    await page.locator('#features-csv').fill(originalFeatures + 'foundry,shortcut,not-a-number\n');
    await page.waitForFunction(() => document.getElementById('lint-status').textContent.includes('CSV column count'));
    assert.ok(await page.locator('#race').isDisabled());
    await page.locator('#undo').click(); await page.waitForFunction(() => !document.getElementById('race').disabled);
    assert.equal(await page.locator('#draft-digest').textContent(), originalDigest);
    await page.locator('#node-surface').selectOption('Gravel'); await page.waitForFunction(() => !document.getElementById('export-bundle').disabled);
    assert.notEqual(await page.locator('#draft-digest').textContent(), originalDigest);
    await page.locator('#node-surface').selectOption('Asphalt'); await page.waitForFunction(() => !document.getElementById('race').disabled);
    await page.locator('#spot-lane').fill('100'); await page.locator('#add-spot').click(); await page.waitForFunction(() => document.getElementById('lint').textContent.includes('spot outside road'));
    await page.locator('#undo').click(); await page.waitForFunction(() => !document.getElementById('race').disabled);
    // Drag a real control point and check the core's digest changes.
    const coords = await page.locator('#map').evaluate((canvas, node) => { const p = canvas.trackTransform.xy(node[0], node[1]), rect = canvas.getBoundingClientRect(); return [rect.x + p[0], rect.y + p[1]]; }, baseline.course.nodes[0]);
    await page.mouse.move(...coords); await page.mouse.down(); await page.mouse.move(coords[0] - 6, coords[1] + 4, {steps: 4}); await page.mouse.up();
    await page.waitForFunction(() => !document.getElementById('export-bundle').disabled);
    assert.notEqual(await page.locator('#draft-digest').textContent(), originalDigest);
    await page.locator('#undo').click(); await page.waitForFunction(() => !document.getElementById('race').disabled);
    // Round-trip an edited draft using actual ZIP/CSV export.
    await page.locator('#node-x').fill('-84'); await page.locator('#node-x').dispatchEvent('change'); await page.waitForFunction(() => !document.getElementById('export-bundle').disabled);
    const downloadEvent = page.waitForEvent('download'); await page.locator('#export-bundle').click(); const download = await downloadEvent;
    const path = resolve(output, `foundry-${width}-draft.zip`); await download.saveAs(path); const contents = zipEntries(await readFile(path));
    const firstExported = contents['tracks/foundry.csv'].trim().split('\n')[1].split(',');
    assert.deepEqual(firstExported.map((v, i) => i === 3 ? v : Number(v)), [-84, ...baseline.course.nodes[0].slice(1)]); assert.ok(contents['README.txt'].includes('ONLY rows'));
    const csvLines = contents['tracks/foundry.csv'].trim().split('\n'); assert.equal(csvLines[1], csvLines.at(-1));
    await page.locator('#reset').click(); await page.waitForFunction(() => !document.getElementById('race').disabled);
    if (width === 1440) {
      await page.locator('#race').click(); await page.waitForFunction(() => window.labRaceReady, null, {timeout: 120000});
      assert.match(await page.locator('#race-status').textContent(), /finishers.*wrecks.*passes.*contacts/);
      await page.locator('#layer').selectOption('contacts'); await page.locator('#scrub').fill('10'); await page.locator('#scrub').dispatchEvent('input');
      await page.locator('#play').click(); await page.waitForTimeout(200); await page.locator('#play').click(); assert.ok(Number(await page.locator('#scrub').inputValue()) > 10);
      await page.locator('#theme').selectOption('dark'); await page.evaluate(() => scrollTo(0, 450)); await page.screenshot({path: resolve(output, 'lab-race-dark.png')});
      await page.locator('#node-x').fill('-84'); await page.locator('#node-x').dispatchEvent('change'); assert.ok(await page.locator('#play').isDisabled());
      assert.match(await page.locator('#race-status').textContent(), /Draft changed/);
    }
    await page.evaluate(() => scrollTo(0, 0)); await noOverflow(page); await page.screenshot({path: resolve(output, `lab-${width}.png`)});
    assert.deepEqual(errors, []); assert.deepEqual(remote, []);
    results.push({page: 'lab', width, pass: true, liveLint: true, pointDrag: true, surfaces: true, pickups: true, obstacles: true, malformedFeaturesRejected: true, undoRedo: true, csvZipRoundTrip: true, race: width === 1440, errors, remote}); await context.close();
  }
  // HTTP served entry and validation failures use the same core.
  const page = await browser.newPage(); await page.goto('http://127.0.0.1:8794/tracks/lab/index.html'); await page.waitForFunction(() => window.labReady); await page.close();
  const badNodes = baseline.csv.nodes.split('\n'); badNodes[1] = badNodes[1].replace(/^[^,]+/, 'NaN');
  const bad = await fetch('http://127.0.0.1:8794/api/analyze', {method: 'POST', body: new URLSearchParams({id: 'foundry', ...baseline.csv, nodes: badNodes.join('\n')})}); assert.equal(bad.status, 400);
  const still = (await (await fetch('http://127.0.0.1:8794/api/catalog')).json()).courses.find(c => c.course.id === 'foundry'); assert.deepEqual(still, baseline);
  await writeFile(resolve(output, 'result.json'), JSON.stringify({pass: true, results, catalogUnchanged: true, malformedDraftRejected: true}, null, 2) + '\n');
  console.log('Track atlas and Track Lab browser checks PASS');
} finally { await browser.close(); }
