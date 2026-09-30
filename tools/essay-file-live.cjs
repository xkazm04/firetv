/**
 * Essay Master's text input on the real phone at 390 x 844: a 3-paragraph .md file read one paragraph at a time, a
 * .docx, an oversized file, an empty file and a renamed binary refused in one sentence, a pasted message split on
 * blank lines, a paragraph over the cap refused, and a capture picker with no Essay Master in it. Not part of
 * `npm test` (it needs a server); it skips politely unless ESSAY_FILE_URL is set. Run it against an isolated dev
 * server, as tools/tv-landing-live.cjs is run:
 *
 *   DESK_DATA_DIR=<scratch dir> npx next dev --webpack -p 3459          (in desk/)
 *   ESSAY_FILE_URL=http://localhost:3459 DESK_DATA_DIR=<the same dir> node tools/essay-file-live.cjs
 *
 * No model is called: the phone's /api/analyse request is intercepted (page.route) and answered with a stub, so what
 * is asserted is what the request WOULD carry - the current paragraph, and only that. The one real request is a
 * paragraph over the cap, which the route refuses with a 400 before any run starts. The desk is built through the
 * session's own events; the phone pairs the way a phone pairs (/phone?pin=). Screenshots go to artifacts/essay-file/
 * (git-ignored). Playwright is resolved from tools/node_modules.
 */
if (!process.env.ESSAY_FILE_URL) { console.log('essay-file-live: skipped (set ESSAY_FILE_URL to an isolated dev server, and DESK_DATA_DIR to its data directory)'); process.exit(0); }
const { chromium } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
if (!process.env.DESK_DATA_DIR) throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test opens the TV with the key the desk keeps there.');
const data = path.resolve(process.env.DESK_DATA_DIR), real = path.resolve(__dirname, '../desk/data');
if (data === real || data.startsWith(real + path.sep)) throw new Error('Refusing to run against desk/data: use a scratch DESK_DATA_DIR.');
const base = process.env.ESSAY_FILE_URL.replace(/\/$/, '');
const key = JSON.parse(fs.readFileSync(path.join(data, 'pairing.json'), 'utf8')).key;
const out = path.resolve(__dirname, '../artifacts/essay-file'); fs.mkdirSync(out, { recursive: true });
const files = fs.mkdtempSync(path.join(os.tmpdir(), 'essay-file-live-'));

const LEARNER = { id: 'essay-file-live', name: 'Mia', type: 'elementary', age: 12, modules: ['maths', 'english', 'essay'] };
const P = [
  'Many students are tired in the morning. Sleep is important. Schools start early. This is bad.',
  'Homework takes hours every night. Research found that teenagers sleep less than they need. Therefore homework should shrink.',
  'In conclusion, the school day should start later, because a rested student learns more.',
];
const put = (name, content) => { const f = path.join(files, name); fs.writeFileSync(f, content); return f; };
const MD = put('my-essay.md', `${P[0]}\r\n\r\n${P[1]}\r\n   \r\n${P[2]}\r\n`);
const DOCX = put('my-essay.docx', Buffer.concat([Buffer.from('PK'), Buffer.from([3, 4, 0, 0, 0]), Buffer.from('word/document.xml')]));
const BIG = put('too-big.txt', ('A sentence that fills the file. ').repeat(4000));
const EMPTY = put('empty.txt', '');
const BLANKS = put('blank.md', '  \n\n   \n');
const BINARY = put('renamed.txt', Buffer.concat([Buffer.from('MZ'), Buffer.from([0, 0, 0, 1, 2, 0]), Buffer.from('not text')]));

let cookie = '';
async function asTheTV() {
  const r = await fetch(base + '/tv?key=' + encodeURIComponent(key), { redirect: 'manual' });
  cookie = (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).filter((c) => c.startsWith('desk-tv=')).join('; ');
  assert.ok(cookie, 'the desk took its key from ' + path.join(data, 'pairing.json'));
}
async function event(b) {
  const r = await fetch(base + '/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify(b) });
  assert.equal(r.status, 200, JSON.stringify(b) + ' -> ' + r.status);
  return r.json();
}
const current = async () => (await fetch(base + '/api/session', { headers: { cookie } })).json();

(async () => {
  await asTheTV();
  await event({ type: 'reset' });
  await event({ type: 'profile.draft', patch: LEARNER }); await event({ type: 'profile.save' });
  await event({ type: 'join' });
  await event({ type: 'subject', subject: 'essay' });
  await event({ type: 'nav', screen: 'essaytype', focus: 0 });
  const seated = await current();
  assert.equal(seated.learner?.id, LEARNER.id, 'the scratch learner is at the desk');

  const browser = await chromium.launch({ headless: true });
  const errors = [], report = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    // a way to hand the phone one session message of our own, over the stream it already holds
    await ctx.addInitScript(() => {
      const Real = window.EventSource;
      window.EventSource = function (url, o) { const es = new Real(url, o); window.__es = es; return es; };
      window.EventSource.prototype = Real.prototype;
      window.__inject = (v) => window.__es.onmessage({ data: JSON.stringify(v) });
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    // the phone's analyse request never reaches a model: it is recorded and answered with a stub
    const sent = [];
    await page.route('**/api/analyse', async (route) => { sent.push(JSON.parse(route.request().postData() || '{}')); await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
    const shot = (name) => page.screenshot({ path: path.join(out, name + '.png') });

    await page.goto(base + '/phone?pin=' + seated.pin);
    await page.waitForFunction(async () => (await (await fetch('/api/session')).json()).viewer === 'phone', null, { timeout: 20000 }).catch(() => { throw new Error('The phone did not pair with ?pin='); });
    // the TV is on the lens home: the phone follows it to the Essay panel
    await page.waitForSelector('[data-role="essay-paragraph"]', { timeout: 15000 });
    await page.waitForTimeout(400);
    const note = () => page.locator('[data-role="essay-note"]').textContent().catch(() => '');
    const box = () => page.locator('[data-role="essay-paragraph"] textarea');
    const label = () => page.locator('[data-role="essay-paras"] b').textContent();
    const layout = async (name) => {
      const m = await page.evaluate(() => {
        const de = document.documentElement, over = de.scrollWidth - de.clientWidth;
        const small = [...document.querySelectorAll('[data-role="essay-paragraph"] button, [data-role="essay-paragraph"] .pfile, [data-role="essay-paragraph"] textarea')].map((el) => { const r = el.getBoundingClientRect(); return { t: (el.textContent || el.tagName).trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((x) => x.h < 44 || x.w < 44);
        const wide = [...document.querySelectorAll('[data-role="essay-paragraph"] *')].filter((el) => el.getBoundingClientRect().right > 390.5).map((el) => el.tagName + '.' + el.className);
        return { over, small, wide };
      });
      assert.ok(m.over <= 0, `${name}: the page does not scroll sideways (overflow ${m.over}px)`);
      assert.deepEqual(m.wide, [], `${name}: nothing in the panel runs past 390 px`);
      assert.deepEqual(m.small, [], `${name}: every tap target in the panel is at least 44 px (the nine-tab bar under it is older and is not judged here)`);
    };

    // 1. the panel as it opens: one paragraph, no stepper
    assert.equal(await page.locator('[data-role="essay-paras"]').count(), 0, 'one paragraph: no Previous / Next');
    await layout('opening'); await shot('01-opening');

    // 2. a 3-paragraph .md file: paragraph 1 of 3, the first paragraph in the textarea
    await page.setInputFiles('[data-role="essay-file"]', MD);
    await page.waitForSelector('[data-role="essay-paras"]');
    assert.equal((await label()).trim(), 'Paragraph 1 of 3');
    assert.equal(await box().inputValue(), P[0], 'the first paragraph is in the textarea');
    assert.match(await page.locator('[data-role="essay-info"]').textContent(), /3 paragraphs/, 'the panel says the file was split');
    await layout('file loaded'); await shot('02-file-paragraph-1');

    // 3. Next: paragraph 2; Previous is enabled, Next not yet the signal button
    await page.getByRole('button', { name: 'Next paragraph' }).click();
    assert.equal((await label()).trim(), 'Paragraph 2 of 3');
    assert.equal(await box().inputValue(), P[1]);
    await layout('paragraph 2'); await shot('03-paragraph-2');

    // 4. an edit stays with its paragraph when stepping away and back
    await box().fill(P[1] + ' It is a lot.');
    await page.getByRole('button', { name: 'Previous paragraph' }).click();
    assert.equal(await box().inputValue(), P[0]);
    await page.getByRole('button', { name: 'Next paragraph' }).click();
    assert.equal(await box().inputValue(), P[1] + ' It is a lot.', 'the edit was kept');
    await box().fill(P[1]);

    // 5. Analyse would send the current paragraph, and only that; after a reading Next is the signal button
    await page.locator('[data-role="essay-paragraph"] .field button[data-signal="true"]').click();
    await page.waitForFunction(() => document.querySelector('.pstatus')?.textContent === 'on the TV');
    assert.equal(sent.length, 1, 'one analyse request');
    assert.deepEqual(sent[0], { kind: 'essay', text: P[1], type: 'structure' }, 'the request carries paragraph 2 alone');
    assert.equal(await page.getByRole('button', { name: 'Next paragraph' }).getAttribute('data-signal'), 'true', 'after a reading, Next is the button to press');
    await layout('after analyse'); await shot('04-after-analyse');
    // the desk has read paragraph 2 (a stubbed reading, no model): the phone is on the TV's sentence
    // to rewrite, and Next paragraph there sends the TV back to the lens home and the phone to paragraph 3
    const sents = P[1].split(/(?<=\.)\s+/).map((text, i) => ({ n: i + 1, text, words: text.split(/\s+/).length, connectors: [], role: 'claim' }));
    const phoneView = await page.evaluate(async () => (await fetch('/api/session')).json());
    const reading = { text: P[1], type: 'structure', sentences: sents, stats: { sentences: 3, words: 18, avgWords: 6, claims: 3, evidence: 0, links: 0, connectors: 0 }, verdicts: sents.map((s) => ({ n: s.n, verdict: 'neutral', note: 'A stub.' })), summary: 'A stub reading.', provider: 'stub' };
    // the server's essay.set is the desk's own (a 403 for any caller), so the phone is shown the state it would have: one injected stream message
    await page.evaluate((v) => window.__inject(v), { ...phoneView, screen: 'forensic', subject: 'essay', essay: reading, essayAt: null, focus: 0 });
    await page.waitForSelector('[data-role="essay-rewrite"]');
    const from = page.locator('[data-role="essay-next-from-rewrite"]');
    assert.match((await from.textContent()).trim(), /Next paragraph \(3 of 3\)/);
    await shot('04b-rewrite-panel-next-paragraph');
    await from.click();
    await page.waitForSelector('[data-role="essay-paragraph"]');
    assert.equal((await current()).screen, 'essaytype', 'the TV went back to the lens home');
    assert.equal((await label()).trim(), 'Paragraph 3 of 3');
    assert.equal(await box().inputValue(), P[2]);
    assert.equal(await page.getByRole('button', { name: 'Next paragraph' }).isDisabled(), true, 'no Next after the last paragraph');
    await shot('05-paragraph-3');

    // 6. refused files: one plain sentence in the panel, and the loaded paragraphs stay
    const refuse = async (file, pattern, name) => {
      await page.setInputFiles('[data-role="essay-file"]', file);
      await page.waitForSelector('[data-role="essay-note"]');
      const n = await note();
      assert.match(n, pattern, `${name}: ${n}`);
      assert.doesNotMatch(n, /—|–/, 'no dashes in the copy');
      assert.equal((await label()).trim(), 'Paragraph 3 of 3', `${name}: the loaded text is untouched`);
      await layout(name); await shot('06-refused-' + name.replace(/\W+/g, '-'));
      report.push({ refused: name, said: n });
    };
    await refuse(DOCX, /\.txt and \.md/, 'a .docx');
    await refuse(BIG, /too big/, 'an oversized file');
    await refuse(EMPTY, /empty/, 'an empty file');
    await refuse(BLANKS, /empty/, 'a file of blank lines');
    await refuse(BINARY, /plain text/, 'a binary renamed .txt');

    // 7. a pasted message with blank lines is split the same way
    await box().fill('');
    await box().evaluate((el, txt) => { const dt = new DataTransfer(); dt.setData('text', txt); el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); }, `${P[0]}\n\n${P[2]}`);
    await page.waitForFunction(() => /Paragraph 1 of 2/.test(document.querySelector('[data-role="essay-paras"] b')?.textContent || ''));
    assert.equal(await box().inputValue(), P[0]);
    await shot('07-pasted-message');
    // a paste with no blank line goes in as it always did
    await page.goto(base + '/phone'); await page.waitForSelector('[data-role="essay-paragraph"]', { timeout: 15000 }).catch(() => {});

    // 8. a paragraph over the cap: refused on the phone before any request; the route refuses it too
    const before = sent.length;
    await page.waitForSelector('[data-role="essay-paragraph"]', { timeout: 15000 });
    await box().fill('word '.repeat(900));
    await page.locator('[data-role="essay-paragraph"] .field button[data-signal="true"]').click();
    const long = await note();
    assert.match(long, /Split it/, long); assert.match(long, /4000/);
    assert.equal(sent.length, before, 'no request was made for a paragraph over the cap');
    await layout('too long'); await shot('08-too-long');
    report.push({ tooLong: long });
    const r = await fetch(base + '/api/analyse', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ kind: 'essay', text: 'word '.repeat(900), type: 'structure' }) });
    assert.equal(r.status, 400, 'the route refuses it with a 400');
    assert.match((await r.json()).error, /Split it/, 'and says to split it');

    // 9. the capture picker has no Essay Master, and no essay sample
    await page.getByRole('button', { name: 'Capture', exact: true }).dispatchEvent('click');
    await page.waitForSelector('.cam');
    const options = await page.locator('.pscreen select option').allTextContents();
    assert.deepEqual(options, ['Math Buddy', 'Linga'], 'the capture subject list');
    const samples = await page.locator('.samples button').allTextContents();
    assert.equal(samples.length, 2, 'two sample sheets, no essay page');
    assert.ok(!samples.some((t) => /essay|later school/i.test(t)));
    await shot('09-capture-picker');
    // Tonight's list still takes an essay assignment (a task, not a page)
    await page.getByRole('button', { name: 'Tonight', exact: true }).dispatchEvent('click');
    const tonight = await page.locator('.pscreen select option').allTextContents();
    assert.ok(tonight.includes('Essay Master'), 'an essay assignment can still be added to the list');
    await shot('10-tonight');
    report.push({ captureOptions: options, tonightOptions: tonight, analyseRequests: sent });
    await ctx.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  assert.deepEqual(errors, [], 'no page errors');
  console.log('essay-file-live: ok'); console.log(JSON.stringify(report));
})().catch((e) => { console.error(e); process.exit(1); });
