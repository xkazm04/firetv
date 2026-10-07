/**
 * Essay Master reads a whole piece (v2 E1, with the shelf of P3). The engine is stubbed per paragraph.
 *   - one call per paragraph, each told which paragraph it judges, with the whole piece as context;
 *   - verdicts anchor across paragraphs: a number outside the judged paragraph is dropped;
 *   - a paragraph that fails does not lose the others; only a piece where every paragraph failed fails;
 *   - the model only observes (rules/essay decideVerdicts rules); the structure rule runs per judged paragraph;
 *   - one reading in the learner's record per piece;
 *   - the route: limits checked before any call, keep needs the notice (428), a kept piece gets an id and a new
 *     version on the next read, the TV opens on the first paragraph back and later ones never move the screen.
 * Run with npm test in desk/ (directly: node tools/essay-piece-test.cjs). No model is called; a disposable data
 * directory under the OS temp dir, never desk/data.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk');
let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error("This suite transpiles desk TypeScript with desk's own compiler. Run `npm install` in desk/ first, then `npm test` from desk/."); process.exit(1); }
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-piece-')); process.env.DESK_DATA_DIR = data;
const src = (f) => path.join(root, 'src', f);
const engine = require(src('lib/engines/text.ts'));
let seen = [], answer = async () => { throw new Error('no model call expected'); };
/**
 * The model observes, code rules (rules/essay decideVerdicts). Most fixtures below were written when the model gave the
 * verdict, and still say what they want in those words: this turns each wanted verdict into the observation that makes the
 * rule decide it for that lens and sentence, so the stubs speak the new schema and the assertions stay as they were.
 * Only a reply with a `verdicts` list is turned; a reply with `observations` goes through untouched (the cases that pin
 * the rule send observations directly, with a legacy `verdict` beside them to show it is ignored).
 */
const WANTED={
 structure:{faulty:{job:'link'},strong:{job:'evidence'},neutral:{job:'context'}},
 argument:{faulty:{side:'wanders'},strong:{side:'pushes'},neutral:{side:'neutral'}},
 evidence:{faulty:{support:'opinion'},strong:{support:'checkable'},neutral:{support:'context'}},
};
const asObservations=(req,r)=>{
 if(!r||!r.json||!('verdicts' in r.json)||!req.schema?.properties?.observations)return r;
 const lens=(/Lens for this reading: (\w+)/.exec(req.system)||[])[1]?.toLowerCase();
 const text=new Map([...req.prompt.matchAll(/^(\d+)\. (.*?) {2}\[\d+ words/gm)].map(m=>[Number(m[1]),m[2]]));
 const {verdicts,...rest}=r.json;
 const field=(e)=>{
  if(lens==='language'){const w=(text.get(e.n)||'').match(/[A-Za-z']+/)?.[0]||'';return e.verdict==='faulty'?{issues:[{kind:'vague',word:w}]}:['strong','neutral'].includes(e.verdict)?{issues:[]}:{issues:'unreadable'};}
  return WANTED[lens]?.[e.verdict]||{bogus:true};
 };
 const observations=Array.isArray(verdicts)?verdicts.map(e=>{
  if(!e||typeof e!=='object')return e;
  const {verdict,...keep}=e;
  return {...keep,...field(e)};
 }):verdicts;
 return {...r,json:{...rest,observations}};
};
engine.text = (req) => { seen.push(req); return Promise.resolve(answer(req)).then((r) => asObservations(req, r)); };
const { analysePiece } = require(src('lib/desk/essay.ts'));
const R = require(src('lib/rules/essay.ts'));
const { getLearner } = require(src('lib/session/learners.ts'));
const { dispatch, getSession } = require(src('lib/session/store.ts'));
const texts = require(src('lib/session/texts.ts'));
const analyse = require(src('app/api/analyse/route.ts'));
after(() => { if (globalThis.__desk?.ticker) clearInterval(globalThis.__desk.ticker); fs.rmSync(data, { recursive: true, force: true }); });

const PIECE = 'Schools start too early. Teenagers are tired.\n\nResearch found that teens sleep later. This is bad.\n\nTherefore school should start at nine.';
/** A stub that answers the paragraph it was asked about: sentence numbers read from the prompt's "sentences a to b". */
const perParagraph = (verdictFor, fail = new Set()) => async (req) => {
  const m = /Judge only paragraph (\d+) of \d+: sentences (\d+) to (\d+)/.exec(req.prompt);
  const para = Number(m[1]) - 1, from = Number(m[2]), to = Number(m[3]);
  if (fail.has(para)) throw new Error('engine down');
  const verdicts = []; for (let n = from; n <= to; n++) verdicts.push({ n, ...verdictFor(n) });
  verdicts.push({ n: 99, verdict: 'faulty', note: 'off the end' }, { n: from === 1 ? 5 : 1, verdict: 'faulty', note: 'another paragraph' });
  return { json: { verdicts, summary: `Paragraph ${para + 1} summary.` }, provider: 'test', ms: 1 };
};
const faultyAt = (bad) => (n) => (bad.includes(n) ? { verdict: 'faulty', note: `Fix ${n}.`, fix: { move: 'Add a reason', pattern: 'This matters because [reason].' } } : { verdict: 'neutral', note: 'Fine.' });

test('one call per paragraph, each told its paragraph, with the whole piece as context', async () => {
  seen = []; answer = perParagraph(faultyAt([4]));
  const progress = [];
  const a = await analysePiece(PIECE, 'structure', 'ema', 15, (x) => progress.push(x));
  assert.equal(seen.length, 3, 'three paragraphs, three calls');
  assert(seen.every(r => /piece, 3 paragraphs/.test(r.prompt) && /Paragraph 3:/.test(r.prompt)), 'every call sees the whole piece');
  assert.match(seen[1].prompt, /Judge only paragraph 2 of 3: sentences 3 to 4/);
  assert.deepEqual(a.verdicts.map(v => v.n), [1, 2, 3, 4, 5], 'one verdict per sentence, none off the end, none from another paragraph');
  assert.deepEqual(a.verdicts.filter(v => v.verdict === 'faulty').map(v => v.n), [4]);
  assert.deepEqual(a.piece, { paragraphs: 3, read: [0, 1, 2], failed: [] });
  assert.equal(progress.length, 3); assert.deepEqual(progress.map(p => p.piece.read.length), [1, 2, 3], 'the map fills in paragraph by paragraph');
  assert.match(a.summary, /^1 of 5 sentences to fix across 3 paragraphs\. Start with paragraph 2: Paragraph 2 summary\./);
});
test('a paragraph that fails loses only itself; every paragraph failing fails the piece', async () => {
  answer = perParagraph(faultyAt([1]), new Set([1]));
  const a = await analysePiece(PIECE, 'argument', 'ema', 15);
  assert.deepEqual(a.piece.read, [0, 2]); assert.deepEqual(a.piece.failed, [1]);
  assert.deepEqual(a.verdicts.map(v => v.n), [1, 2, 5]);
  answer = perParagraph(faultyAt([]), new Set([0, 1, 2]));
  await assert.rejects(analysePiece(PIECE, 'argument', 'ema', 15), /engine down/);
});
test('a piece is one reading in the learner\'s record, with the paragraph count', async () => {
  const before = getLearner('jakub').history.length;
  answer = perParagraph(faultyAt([2, 5]));
  await analysePiece(PIECE, 'evidence', 'jakub', undefined);
  const h = getLearner('jakub').history;
  assert.equal(h.length, before + 1);
  assert.equal(h.at(-1).detail, '2 of 5 sentences to fix, 3 paragraphs');
});
test('essay-master-A case 9: Structure runs per judged paragraph - each paragraph\'s first unsupported claim is faulty, and the record counts both', async () => {
  const TWO = 'Schools start too early. Teenagers are tired.\n\nHomework is pointless. Pupils are busy.';
  seen = [];
  answer = async (req) => {
    const m = /Judge only paragraph (\d+) of \d+: sentences (\d+) to (\d+)/.exec(req.prompt);
    const observations = []; for (let n = Number(m[2]); n <= Number(m[3]); n++) observations.push({ n, job: 'claim', note: '', verdict: 'strong' });
    return { json: { observations, summary: 'ok' }, provider: 'test', ms: 1 };
  };
  const a = await analysePiece(TWO, 'structure', 'oa-9', undefined);
  assert.equal(seen.length, 2, 'one call per paragraph');
  assert.deepEqual(a.verdicts.map(v => [v.n, v.verdict]), [[1, 'faulty'], [2, 'neutral'], [3, 'faulty'], [4, 'neutral']], 'exactly one faulty sentence in EACH paragraph');
  assert.equal(getLearner('oa-9').history.at(-1).detail, '2 of 4 sentences to fix, 2 paragraphs');
  assert.match(a.summary, /^2 of 4 sentences to fix across 2 paragraphs\./);
});
test('pieceProblem: limits checked in code, in the desk\'s words, never cut', () => {
  assert.equal(R.pieceProblem(PIECE), null);
  assert.match(R.pieceProblem('   '), /nothing to read/);
  assert.match(R.pieceProblem(Array.from({ length: R.PIECE_PARAGRAPHS_MAX + 1 }, (_, i) => `Paragraph ${i}.`).join('\n\n')), /up to 30/);
  assert.match(R.pieceProblem(`Short.\n\n${'Long sentence here. '.repeat(300)}`), /Paragraph 2 is too long/);
  assert.match(R.pieceProblem('x'.repeat(R.PIECE_MAX_CHARS + 1)), /too long to read in one go/);
});

// ------------------------------------------------------------------ the route
const post = (body) => analyse.POST(new Request('http://desk/api/analyse', { method: 'POST', body: JSON.stringify(body) }));
test('route: keep needs the one-time notice; then the piece is kept, and the next read is a new version', async () => {
  dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' });
  seen = []; answer = perParagraph(faultyAt([3]));
  const refused = await post({ kind: 'piece', text: PIECE, type: 'structure', keep: true, source: 'file' });
  assert.equal(refused.status, 428); assert.equal(seen.length, 0, 'no model call before the notice');
  texts.markNoticed('ema');
  const r = await post({ kind: 'piece', text: PIECE, type: 'structure', keep: true, source: 'file' });
  assert.equal(r.status, 200); const a = await r.json();
  assert.match(a.piece.pieceId, /^t-/);
  assert.equal(texts.getPiece('ema', a.piece.pieceId).versions[0].source, 'file');
  const again = await post({ kind: 'piece', text: PIECE, type: 'structure', keep: true, pieceId: a.piece.pieceId });
  assert.equal(again.status, 200, 'the same text again reads on the version already kept');
  assert.equal(texts.getPiece('ema', a.piece.pieceId).versions.length, 1);
  const changed = await post({ kind: 'piece', text: PIECE + '\n\nA new ending.', type: 'structure', keep: true, pieceId: a.piece.pieceId });
  assert.equal(changed.status, 200); assert.equal(texts.getPiece('ema', a.piece.pieceId).versions.length, 2);
  assert.equal((await post({ kind: 'piece', text: PIECE, type: 'structure', keep: false })).status, 200, 'without keep, no notice is needed and nothing is kept');
  assert.equal(texts.listPieces('ema').length, 1);
});
test('route: limits refused before any call; the TV opens on the first paragraph back, later ones never move it', async () => {
  dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' });
  seen = [];
  assert.equal((await post({ kind: 'piece', text: Array.from({ length: 31 }, () => 'One.').join('\n\n'), type: 'structure' })).status, 400);
  assert.equal(seen.length, 0);
  const screens = [];
  answer = async (req) => { const r = await perParagraph(faultyAt([1, 5]))(req); screens.push(getSession().screen); if (screens.length === 2) dispatch({ type: 'nav', screen: 'essaytype', focus: 0 }); return r; };
  const r = await post({ kind: 'piece', text: PIECE, type: 'language' });
  assert.equal(r.status, 200);
  assert.equal(screens[1], 'forensic', 'the first paragraph back opened the reading');
  assert.equal(getSession().screen, 'essaytype', 'the learner moved away; the later paragraphs did not pull them back');
  assert.deepEqual(getSession().essay.piece.read, [0, 1, 2]); assert.equal(getSession().essay.verdicts.length, 5);
});
test('a one-paragraph reading is unchanged: no piece, the paragraph prompt', async () => {
  const { analyseEssay } = require(src('lib/desk/essay.ts'));
  seen = []; answer = async () => ({ json: { verdicts: [{ n: 1, verdict: 'strong', note: 'Good.' }], summary: 'ok' }, provider: 'test', ms: 1 });
  const a = await analyseEssay('One good sentence. And another one.', 'structure', 'ema', 15);
  assert.equal(a.piece, undefined); assert.doesNotMatch(seen[0].prompt, /Judge only paragraph/); assert.match(seen[0].prompt, /The student's paragraph,/);
});
