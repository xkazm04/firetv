/**
 * A learner's own texts (adult plan A6; v2 decisions 2026-10-07 X4): lib/session/texts.ts and /api/texts.
 *   - add, version, list (no text in a list), caps refused with a sentence, never cut;
 *   - ids are path parts, so a hostile id never leaves the learner's folder;
 *   - one learner can never list, read or delete another's: the route reads the seated learner only;
 *   - delete-all leaves no file on disk; a TV or a guest is refused; a body over the cap is refused before it is read;
 *   - the essay on the desk never follows a learner change (finding 6; fixed 2026-10-05, pinned here for A6).
 * Run with npm test in desk/ (directly: node tools/texts-rules-test.cjs). No model is called; a disposable data
 * directory under the OS temp dir, never desk/data.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk');
let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error("This suite transpiles desk TypeScript with desk's own compiler. Run `npm install` in desk/ first, then `npm test` from desk/."); process.exit(1); }
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-texts-')); process.env.DESK_DATA_DIR = data;
const src = (f) => path.join(root, 'src', f);
const T = require(src('lib/session/texts.ts'));
const { dispatch, getSession } = require(src('lib/session/store.ts'));
const route = require(src('app/api/texts/route.ts'));
after(() => { if (globalThis.__desk?.ticker) clearInterval(globalThis.__desk.ticker); fs.rmSync(data, { recursive: true, force: true }); });
const folder = (id) => path.join(data, 'texts', id);
const PIECE = '# Why we sleep\n\nTeenagers fall asleep later.\n\nSo school should start later.';

test('add, version, list: a list shows titles and counts, never the text', () => {
  const a = T.addPiece('ema', { text: PIECE, source: 'file' }, 1000);
  assert(a.ok); const p = a.value;
  assert.match(p.id, /^t-[a-f0-9]{12}$/); assert.equal(p.title, 'Why we sleep', 'the heading names it'); assert.equal(p.format, 'essay');
  assert.deepEqual(p.versions, [{ at: 1000, source: 'file', text: PIECE }]);
  const v = T.addVersion('ema', p.id, { text: PIECE + '\n\nA third paragraph.', source: 'message' }, 2000);
  assert(v.ok); assert.equal(v.value.versions.length, 2);
  const cards = T.listPieces('ema');
  assert.deepEqual(cards, [{ id: p.id, format: 'essay', title: 'Why we sleep', versions: 2, paragraphs: 4, updated: 2000 }]);
  assert(!JSON.stringify(cards).includes('Teenagers'), 'no text in a list');
  assert.equal(T.getPiece('ema', p.id).versions[1].source, 'message');
  assert.equal(T.addPiece('ema', { text: 'x', format: 'newsletter', title: '  My letter ' }).value.title, 'My letter');
  assert.equal(T.addPiece('ema', { text: 'x', format: 'Bad Format!', source: 'carrier pigeon' }).value.format, 'essay', 'an unknown format falls back');
});
test('refusals come with a sentence: empty, the same version again, too long, too many', () => {
  assert.equal(T.addPiece('ema', { text: '   ' }).ok, false);
  const p = T.addPiece('ema', { text: 'One.' }).value;
  const same = T.addVersion('ema', p.id, { text: 'One.' }); assert.equal(same.ok, false); assert.match(same.error, /kept last/);
  const long = T.addPiece('ema', { text: 'a'.repeat(T.TEXT_VERSION_MAX_CHARS + 1) }); assert.equal(long.ok, false); assert.match(long.error, /too long/);
  assert.equal(T.addPiece('ema', { text: 'a'.repeat(T.TEXT_VERSION_MAX_CHARS) }).ok, true, 'at the cap it is kept');
  for (let i = 2; i <= T.TEXT_VERSIONS_MAX; i++) assert(T.addVersion('ema', p.id, { text: `One, take ${i}.` }).ok);
  const over = T.addVersion('ema', p.id, { text: 'One more.' }); assert.equal(over.ok, false); assert.match(over.error, /20 versions/);
  assert.equal(T.getPiece('ema', p.id).versions.length, T.TEXT_VERSIONS_MAX, 'nothing dropped to make room');
  T.deleteAll('ema');
  for (let i = 0; i < T.TEXT_PIECES_MAX; i++) assert(T.addPiece('ema', { text: `Piece ${i}.` }).ok);
  const full = T.addPiece('ema', { text: 'One too many.' }); assert.equal(full.ok, false); assert.match(full.error, /Delete one/);
  T.deleteAll('ema');
});
test('a hostile id never leaves the learner\'s folder', () => {
  for (const bad of ['../jakub', '..', 'a/b', '', 'x'.repeat(65)]) { assert.equal(T.addPiece(bad, { text: 'x' }).ok, false, bad); assert.deepEqual(T.listPieces(bad), []); assert.equal(T.deleteAll(bad), false); }
  T.addPiece('jakub', { text: 'Jakub wrote this.' });
  for (const bad of ['../jakub/t-000000000000', 't-../../x', 'T-ABCDEF123456', '']) { assert.equal(T.getPiece('ema', bad), null); assert.equal(T.deletePiece('ema', bad), false); }
  assert.equal(T.listPieces('jakub').length, 1, 'jakub untouched');
  T.deleteAll('jakub');
});
test('delete one, delete all: nothing of the learner is left on disk', () => {
  const a = T.addPiece('ema', { text: 'First.' }).value, b = T.addPiece('ema', { text: 'Second.' }).value;
  fs.writeFileSync(path.join(folder('ema'), 'twin.json'), '{}'); // whatever later sits beside the pieces (D6) goes too
  assert.equal(T.deletePiece('ema', a.id), true); assert.equal(fs.existsSync(path.join(folder('ema'), `${a.id}.json`)), false);
  assert.equal(T.deletePiece('ema', a.id), false, 'twice is nothing');
  assert.deepEqual(T.listPieces('ema').map(c => c.id), [b.id]);
  assert.equal(T.deleteAll('ema'), true); assert.equal(fs.existsSync(folder('ema')), false, 'the folder is gone');
  assert.deepEqual(T.listPieces('ema'), []);
});

// ------------------------------------------------------------------ the route
const req = (method, q = '', body, headers = {}) => new Request(`http://desk/api/texts${q}`, { method, headers: { 'x-desk-role': 'phone', ...headers }, ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
const seat = (id) => { dispatch({ type: 'learner.set', id }); };
test('route: a piece is kept only after the one-time notice; delete-all forgets the notice too', async () => {
  seat('ema');
  const first = await route.GET(req('GET')); const j = await first.json();
  assert.equal(j.noticed, false); assert.match(j.notice, /Claude/);
  const refused = await route.POST(req('POST', '', { text: 'Before the notice.' }));
  assert.equal(refused.status, 428); assert.equal((await refused.json()).notice, true);
  assert.equal(fs.existsSync(folder('ema')) && fs.readdirSync(folder('ema')).some(f => f.startsWith('t-')), false, 'nothing kept');
  assert.equal((await (await route.POST(req('POST', '', { notice: true }))).json()).noticed, true);
  assert.equal((await (await route.GET(req('GET'))).json()).noticed, true);
  assert.equal((await route.POST(req('POST', '', { text: 'After the notice.' }))).status, 200);
  await route.DELETE(req('DELETE', '?all=1'));
  assert.equal((await (await route.GET(req('GET'))).json()).noticed, false, 'deleting everything forgets the notice: it shows again');
});
test('route: the seated learner only; one learner never reaches another\'s', async () => {
  seat('ema'); await route.POST(req('POST', '', { notice: true }));
  const made = await (await route.POST(req('POST', '', { text: PIECE, source: 'paste' }))).json();
  assert.match(made.id, /^t-/);
  let r = await route.POST(req('POST', '', { id: made.id, text: PIECE + '\n\nMore.' })); assert.equal(r.status, 200);
  assert.equal((await (await route.GET(req('GET'))).json()).pieces.length, 1);
  seat('jakub');
  assert.deepEqual((await (await route.GET(req('GET'))).json()).pieces, [], 'jakub sees an empty shelf');
  assert.equal((await (await route.GET(req('GET'))).json()).noticed, false, 'and has not accepted ema\'s notice');
  assert.equal((await route.POST(req('POST', '', { id: 'x', text: 'y' }))).status, 428, 'jakub must accept his own notice first');
  await route.POST(req('POST', '', { notice: true }));
  assert.equal((await route.GET(req('GET', `?id=${made.id}`))).status, 404, 'and cannot read ema\'s piece by its id');
  assert.equal((await route.POST(req('POST', '', { id: made.id, text: 'Jakub was here.' }))).status, 404, 'nor add to it');
  assert.equal((await route.DELETE(req('DELETE', `?id=${made.id}`))).status, 404, 'nor delete it');
  assert.equal((await route.DELETE(req('DELETE', '?all=1'))).status, 200);
  seat('ema');
  assert.equal((await (await route.GET(req('GET', `?id=${made.id}`))).json()).versions.length, 2, 'ema\'s piece survived jakub\'s delete-all');
  assert.equal((await (await route.DELETE(req('DELETE', '?all=1'))).json()).deleted, true);
  assert.equal(fs.existsSync(folder('ema')), false);
});
test('route: the TV and a guest are refused; nobody seated is refused; a body over the cap is refused before it is read', async () => {
  seat('ema');
  assert.equal((await route.GET(req('GET', '', undefined, { 'x-desk-role': 'tv' }))).status, 403);
  assert.equal((await route.POST(req('POST', '', { text: 'x' }, { 'x-desk-role': 'guest' }))).status, 403);
  assert.equal((await route.POST(req('POST', '', 'x'.repeat(10), { 'content-length': String(300 * 1024) }))).status, 413);
  assert.equal((await route.POST(req('POST', '', JSON.stringify({ text: 'a'.repeat(250 * 1024) })))).status, 413);
  assert.equal((await route.POST(req('POST', '', '{not json'))).status, 400);
  dispatch({ type: 'reset' });
  assert.equal(getSession().learner, null);
  assert.equal((await route.GET(req('GET'))).status, 409);
});
test('the essay on the desk is the seated learner\'s: a learner change never shows the last learner\'s paragraph', () => {
  dispatch({ type: 'learner.set', id: 'ema' });
  const reading = { text: 'Ema wrote this.', type: 'structure', sentences: [{ n: 1, text: 'Ema wrote this.', words: 3, connectors: [], role: 'claim' }], stats: {}, verdicts: [], summary: '' };
  dispatch({ type: 'essay.set', analysis: reading, owner: 'ema' });
  assert.equal(getSession().essay.text, 'Ema wrote this.');
  dispatch({ type: 'learner.set', id: 'jakub' });
  assert.notEqual(getSession().essay?.text, 'Ema wrote this.', 'jakub never sees ema\'s paragraph');
});
