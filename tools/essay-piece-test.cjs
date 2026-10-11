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
require('./ts-load.cjs');
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
  assert.match(a.summary, /^1 of 5 sentences to fix across 3 paragraphs\. Start with paragraph 2, sentence 4: /);
  assert.doesNotMatch(a.summary, /Paragraph 2 summary/, 'E9: the model\'s paragraph summary is not read');
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
test('essay-master-A case 9 (changed by E2, council rulings 2026-10-09 section 6): Structure is ruled ONCE over the whole piece - one faulty sentence in the piece, not one per paragraph, and the record counts it', async () => {
  // E2: this case used to expect a faulty sentence in EACH paragraph (the rule ran per judged paragraph). The piece is now ruled once, after
  // every paragraph has come back, so "the first unsupported claim is faulty" holds for the piece: 1 faulty, the other bare claims neutral.
  const TWO = 'Schools start too early. Teenagers are tired.\n\nHomework is pointless. Pupils are busy.';
  seen = [];
  answer = async (req) => {
    const m = /Judge only paragraph (\d+) of \d+: sentences (\d+) to (\d+)/.exec(req.prompt);
    const observations = []; for (let n = Number(m[2]); n <= Number(m[3]); n++) observations.push({ n, job: 'claim', note: '', verdict: 'strong' });
    return { json: { observations, summary: 'ok' }, provider: 'test', ms: 1 };
  };
  const a = await analysePiece(TWO, 'structure', 'oa-9', undefined);
  assert.equal(seen.length, 2, 'one call per paragraph');
  assert.deepEqual(a.verdicts.map(v => [v.n, v.verdict]), [[1, 'faulty'], [2, 'neutral'], [3, 'neutral'], [4, 'neutral']], 'exactly one faulty sentence in the whole piece');
  assert.equal(getLearner('oa-9').history.at(-1).detail, '1 of 4 sentences to fix, 2 paragraphs');
  assert.match(a.summary, /^1 of 4 sentences to fix across 2 paragraphs. Start with paragraph 1, sentence 1: /);
  assert.doesNotMatch(a.summary, /: ok/, 'E9: the model\'s summary is not read');
});
// ---- E2 (council rulings 2026-10-09 section 6): a piece is ruled once, over the observations of all its paragraphs ----
const SECTION_A = 'Phones should be banned in class. They distract everyone.\n\nA 2020 study found 40% of lessons were interrupted. This shows phones cost time.\n\nIn conclusion, phones should be banned. Teachers agree.';
const OBS_A = [{ n: 1, job: 'claim' }, { n: 2, job: 'context' }, { n: 3, job: 'evidence', supports: 1 }, { n: 4, job: 'link' }, { n: 5, job: 'link' }, { n: 6, job: 'context' }];
const observing = (all) => async (req) => {
  const m = /Judge only paragraph (\d+) of \d+: sentences (\d+) to (\d+)/.exec(req.prompt);
  return { json: { observations: all.filter(o => o.n >= Number(m[2]) && o.n <= Number(m[3])), summary: `Paragraph ${m[1]} summary.` }, provider: 'test', ms: 1 };
};
test('E2: the repro2 section A piece is ruled over all its paragraphs: no sentence faulty, 1, 3, 4 and 5 strong, no paragraph to start with', async () => {
  seen = []; answer = observing(OBS_A);
  const a = await analysePiece(SECTION_A, 'structure', 'e2-a', undefined);
  assert.equal(seen.length, 3, 'the per-paragraph model calls stay');
  const v = new Map(a.verdicts.map(x => [x.n, x.verdict]));
  assert.equal(a.verdicts.filter(x => x.verdict === 'faulty').length, 0, 'judged per paragraph, 1 and 5 came back faulty');
  for (const n of [1, 3, 4, 5]) assert.equal(v.get(n), 'strong', 'sentence ' + n);
  assert.equal(a.verdicts.find(x => x.n === 3).supports, 1, 'the kept link');
  assert.doesNotMatch(a.summary, /Start with paragraph/);
  assert.match(a.summary, /^0 of 6 sentences to fix across 3 paragraphs./);
});
test('E2: while the piece is being read the progress carries no verdicts and no "Start with"; the map still fills in; the last report is the ruling', async () => {
  answer = observing(OBS_A);
  const progress = []; const a = await analysePiece(SECTION_A, 'structure', 'e2-b', undefined, (x) => progress.push(x));
  assert.equal(progress.length, 3);
  assert.deepEqual(progress.map(p => p.piece.read.length), [1, 2, 3], 'the progress still fills in paragraph by paragraph');
  for (const p of progress.slice(0, -1)) { assert.deepEqual(p.verdicts, [], 'no verdicts yet'); assert.doesNotMatch(p.summary, /Start with/); }
  assert.deepEqual(progress.at(-1).verdicts, a.verdicts); assert.equal(progress.at(-1).summary, a.summary);
  // faulty claims on a piece whose first paragraph comes back first would otherwise name a paragraph early
  answer = perParagraph(faultyAt([1, 3, 5]));
  const early = []; await analysePiece(PIECE, 'structure', 'e2-b', undefined, (x) => early.push(x));
  assert(early.slice(0, -1).every(p => p.verdicts.length === 0), 'no early verdicts');
  assert(early.slice(0, -1).every(p => !/Start with/.test(p.summary)));
});
test('E2: a failed paragraph is handled as before: the rest are ruled, and the failed one stays unread', async () => {
  answer = async (req) => { if (/paragraph 2 of/.test(req.prompt)) throw new Error('engine down'); return observing(OBS_A)(req); };
  const progress = []; const a = await analysePiece(SECTION_A, 'structure', 'e2-c', undefined, (x) => progress.push(x));
  assert.deepEqual(a.piece.read, [0, 2]); assert.deepEqual(a.piece.failed, [1]);
  assert.deepEqual(a.verdicts.map(v => v.n).sort((x, y) => x - y), [1, 2, 5, 6], 'sentences of the failed paragraph (3 and 4) get no verdict; 5 is faulty, its evidence was never read');
  assert.equal(progress.at(-1).verdicts.length, a.verdicts.length, 'the ruling comes after the last paragraph, read or failed');
});
test('E2: the TV draws every paragraph of a piece that is still being read as pending (paragraphPending), and EssayTV asks the rule', () => {
  const P = (read, failed = []) => ({ paragraphs: 3, read, failed });
  assert.equal(R.paragraphPending(undefined, 0), false, 'a one-paragraph reading has no piece');
  for (const para of [0, 1, 2]) assert.equal(R.paragraphPending(P([0]), para), true, 'still being read: paragraph ' + para + ' is pending, even the one that came back');
  assert.equal(R.paragraphPending(P([0, 1], [2]), 0), false, 'the piece is done: a read paragraph is drawn');
  assert.equal(R.paragraphPending(P([0, 2], [1]), 1), false, 'changed by E4 (council rulings 2026-10-09 section 6): a failed paragraph is drawn as not read, never pending, once the piece is done');
  const tv = fs.readFileSync(path.join(root, 'src/essay/EssayTV.tsx'), 'utf8');
  assert.equal((tv.match(/paragraphState\(/g) || []).length, 2, 'the map and the rail both use it (changed by E4: they ask paragraphState, of which paragraphPending is the pending view)');
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
  seen = []; answer = async () => ({ json: { verdicts: [{ n: 1, verdict: 'strong', note: 'Good.' }, { n: 2, verdict: 'neutral', note: 'Fine.' }], summary: 'ok' }, provider: 'test', ms: 1 });
  const a = await analyseEssay('One good sentence. And another one.', 'structure', 'ema', 15);
  assert.equal(a.piece, undefined); assert.doesNotMatch(seen[0].prompt, /Judge only paragraph/); assert.match(seen[0].prompt, /The student's paragraph,/);
});

// ---- E3 (council rulings 2026-10-09 section 6): a paragraph that is not English is said so and not ruled ----
const CZ_R4 = 'Telefony by ve škole měly zůstat povolené. Někteří učitelé tvrdí, že rozptylují, avšak bez nich se žáci nenaučí sebekázni. Proto je lepší je regulovat.';
const CZ_R7 = 'Telefony by ve škole měly zůstat povolené. Podle výzkumu Univerzity Karlovy se žáci s jasnými pravidly soustředí lépe. To ukazuje, že zákaz není nutný.';
const EN_LINE = 'Essay Master reads English writing. This paragraph is not in English, so the desk did not read it.';
test('E3: one paragraph (kind essay) that is not English is refused with 400 and the line, before any run', async () => {
  dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' });
  seen = []; answer = async () => { throw new Error('no model call expected'); };
  const r = await post({ kind: 'essay', text: CZ_R7, type: 'structure' });
  assert.equal(r.status, 400); assert.equal((await r.json()).error, EN_LINE); assert.equal(seen.length, 0);
});
test('E3: a piece whose every paragraph is not English is refused with 400 and the line, before any run', async () => {
  seen = [];
  const r = await post({ kind: 'piece', text: CZ_R4 + '\n\n' + CZ_R7, type: 'structure' });
  assert.equal(r.status, 400); assert.equal((await r.json()).error, EN_LINE); assert.equal(seen.length, 0);
  await assert.rejects(analysePiece(CZ_R4 + '\n\n' + CZ_R7, 'structure', 'e3-a', undefined), /not in English/, 'and analysePiece itself never rules it');
});
const E3_PIECE = 'Schools start too early. Teenagers are tired.\n\n' + CZ_R7 + '\n\nResearch found that teens sleep later. Therefore school should start at nine.';
const E3_OBS = [{ n: 1, job: 'claim' }, { n: 2, job: 'context' }, { n: 3, job: 'claim' }, { n: 4, job: 'evidence' }, { n: 5, job: 'link' }, { n: 6, job: 'evidence', supports: 1 }, { n: 7, job: 'link' }];
test('E3: an English paragraph either side of one that is not: two calls, notEnglish [1], no verdict on its sentences, the head counts the English sentences and names it, the history line agrees', async () => {
  seen = []; answer = observing(E3_OBS);
  const a = await analysePiece(E3_PIECE, 'structure', 'e3-b', undefined);
  assert.equal(seen.length, 2, 'the paragraph that is not English costs no call');
  assert.deepEqual(a.piece.notEnglish, [1]); assert.deepEqual(a.piece.read, [0, 2]); assert.deepEqual(a.piece.failed, []);
  assert(a.verdicts.every(v => v.n < 3 || v.n > 5), 'no verdict on sentences 3 to 5');
  const faulty = a.verdicts.filter(v => v.verdict === 'faulty').length;
  assert.equal(a.sentences.length, 7);
  assert(a.summary.startsWith(`${faulty} of 4 sentences to fix across 3 paragraphs. Paragraph 2 is not in English, so the desk did not read it.`), a.summary);
  assert.equal(getLearner('e3-b').history.at(-1).detail, `${faulty} of 4 sentences to fix, 3 paragraphs`);
});
test('E3: a piece with every paragraph English has no notEnglish on it, and the pieces of the earlier cases keep their shape', async () => {
  answer = perParagraph(faultyAt([])); const a = await analysePiece(PIECE, 'structure', 'e3-c', undefined);
  assert.equal(a.piece.notEnglish, undefined);
});

// ---- E4, E4-a: a failed paragraph is not read, never pending; its sentences leave the count and the summary names it ----
test('E4: a piece whose paragraph 2 fails: state not-read, the summary names it with the failed line, its sentences leave the count, the history line agrees', async () => {
  answer = async (req) => { if (/paragraph 2 of/.test(req.prompt)) throw new Error('engine down'); return observing(OBS_A)(req); };
  const a = await analysePiece(SECTION_A, 'structure', 'e4-a', undefined);
  assert.deepEqual(a.piece.failed, [1]);
  assert.equal(R.paragraphState(a.piece, 1), 'not-read'); assert.equal(R.paragraphState(a.piece, 0), 'read');
  const faulty = a.verdicts.filter(v => v.verdict === 'faulty').length;
  assert(a.summary.startsWith(`${faulty} of 4 sentences to fix across 3 paragraphs. Paragraph 2 did not come back. Send it again from the phone.`), a.summary);
  assert.equal(getLearner('e4-a').history.at(-1).detail, `${faulty} of 4 sentences to fix, 3 paragraphs`);
});

// ---- E4-a, send it again: only the failed paragraphs are asked again, and the piece is ruled once more over every paragraph read ----
const AGAIN = { piece: (extra = {}) => ({ kind: 'piece', text: SECTION_A, type: 'structure', ...extra }) };
const failOnce = (para) => { let failing = true; return async (req) => { if (failing && new RegExp('paragraph ' + para + ' of').test(req.prompt)) throw new Error('engine down'); return observing(OBS_A)(req); }; };
const sessionWith = async (fail) => { dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' }); seen = []; answer = fail ? async (req) => { if (/paragraph 2 of/.test(req.prompt)) throw new Error('engine down'); return observing(OBS_A)(req); } : observing(OBS_A); const r = await post(AGAIN.piece()); assert.equal(r.status, 200); seen = []; };
test('E4-a piece-again: one call for paragraph 2, the piece ruled once over every paragraph read, failed empty, the history line restated in place', async () => {
  await sessionWith(true);
  const first = getSession().essay;
  assert.deepEqual(first.piece.failed, [1]); assert.equal(R.paragraphState(first.piece, 1), 'not-read');
  const lines = getLearner('ema').history.length, lineBefore = getLearner('ema').history.at(-1).detail;
  answer = observing(OBS_A);
  const whole = await analysePiece(SECTION_A, 'structure', 'e4-whole', undefined); // the piece read whole, for comparison
  seen = [];
  const r = await post({ kind: 'piece-again' });
  assert.equal(r.status, 200);
  assert.equal(seen.length, 1, 'exactly one model call'); assert.match(seen[0].prompt, /Judge only paragraph 2 of 3/);
  const a = getSession().essay;
  assert.deepEqual(a.piece.failed, []); assert.deepEqual([...a.piece.read].sort(), [0, 1, 2]);
  assert.deepEqual(a.verdicts, whole.verdicts, 'the verdicts equal those of the piece read whole');
  const h = getLearner('ema').history;
  assert.equal(h.length, lines, 'no new history line'); assert.notEqual(h.at(-1).detail, lineBefore, 'the line is restated');
  assert.equal(h.at(-1).detail, getLearner('e4-whole').history.at(-1).detail, 'and agrees with the piece read whole');
});
test('E4-a piece-again: a paragraph that fails again stays failed', async () => {
  await sessionWith(true);
  seen = []; answer = async (req) => { throw new Error('engine down'); };
  const r = await post({ kind: 'piece-again' });
  assert.equal(r.status, 200); assert.equal(seen.length, 1);
  assert.deepEqual(getSession().essay.piece.failed, [1]); assert.deepEqual(getSession().essay.piece.read, [0, 2]);
});
test('E4-a piece-again: four refusals, each 400 with one plain line and no model call', async () => {
  const refusal = async (re, what) => { seen = []; const r = await post({ kind: 'piece-again' }); assert.equal(r.status, 400, what); assert.match((await r.json()).error, re, what); assert.equal(seen.length, 0, what); };
  dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' });
  await refusal(/no piece|No piece/i, 'no piece is on the desk');
  const progress = []; answer = failOnce(2); await analysePiece(SECTION_A, 'structure', 'ema', undefined, (x) => progress.push(x));
  dispatch({ type: 'essay.set', analysis: progress[0], owner: 'ema' });
  await refusal(/still reading/i, 'the piece is still being read');
  await sessionWith(false);
  await refusal(/no paragraph failed|No paragraph failed/i, 'no paragraph failed');
  await sessionWith(true);
  const a = getSession().essay;
  dispatch({ type: 'essay.revised', analysis: { ...a, verdicts: a.verdicts.map(v => v.n === 1 ? { ...v, was: { text: 'Old.', verdict: 'faulty' } } : v) }, n: 1 });
  await refusal(/read the whole piece again/i, 'a sentence was rewritten');
});
test('E4-a piece-again: the phone offers one button, only for a piece that is done with a failed paragraph', () => {
  assert.equal(R.pieceAgainOffered(undefined), false);
  assert.equal(R.pieceAgainOffered({ piece: { paragraphs: 3, read: [0], failed: [] } }), false, 'still being read');
  assert.equal(R.pieceAgainOffered({ piece: { paragraphs: 3, read: [0, 1, 2], failed: [] } }), false, 'nothing failed');
  assert.equal(R.pieceAgainOffered({ piece: { paragraphs: 3, read: [0, 2], failed: [1] } }), true);
  const phone = fs.readFileSync(path.join(root, 'src/app/phone/page.tsx'), 'utf8');
  assert.match(phone, /Read the paragraphs that did not come back/); assert.match(phone, /kind: "piece-again"/);
  assert.equal((phone.match(/pieceAgainOffered\(/g) || []).length, 1);
});

// ---- E2-b: while a piece is being read a rewrite is refused and the summary counts nothing ----
test('E2-b: the summary of a piece being read is "Reading paragraph k of N."; the last report is the ruling', async () => {
  answer = observing(OBS_A);
  const progress = []; const a = await analysePiece(SECTION_A, 'structure', 'e2b-a', undefined, (x) => progress.push(x));
  assert.deepEqual(progress.slice(0, -1).map(p => p.summary), ['Reading paragraph 2 of 3.', 'Reading paragraph 3 of 3.']);
  assert.equal(progress.at(-1).summary, a.summary); assert.match(a.summary, /^0 of 6 sentences to fix across 3 paragraphs\./);
  // a failed and a not-English paragraph are back too
  answer = observing(E3_OBS); const mixed = [];
  await analysePiece(E3_PIECE, 'structure', 'e2b-b', undefined, (x) => mixed.push(x));
  assert.equal(mixed[0].summary, 'Reading paragraph 3 of 3.', 'paragraph 1 is back and paragraph 2 is not English: two are back');
});
test('E2-b: a rewrite while the piece is being read is refused with 400 and the line, before any run', async () => {
  dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' });
  const progress = []; answer = observing(OBS_A); await analysePiece(SECTION_A, 'structure', 'ema', undefined, (x) => progress.push(x));
  dispatch({ type: 'essay.set', analysis: progress[0], owner: 'ema' });
  seen = [];
  const r = await post({ kind: 'rewrite', n: 1, text: 'Phones must be banned in every class.' });
  assert.equal(r.status, 400); assert.equal((await r.json()).error, 'The desk is still reading your piece. Rewrite a sentence once every paragraph is read.'); assert.equal(seen.length, 0);
  dispatch({ type: 'essay.set', analysis: progress.at(-1), owner: 'ema' });
  const ok = await post({ kind: 'rewrite', n: 1, text: 'x' });
  assert.notEqual((await ok.json()).error, 'The desk is still reading your piece. Rewrite a sentence once every paragraph is read.', 'the piece is read: the refusal is gone');
});
test('E2-b: the phone marks as read only the paragraphs in the reply, names each paragraph not ruled, and the rewrite panel shows the line and disables Send', () => {
  const phone = fs.readFileSync(path.join(root, 'src/app/phone/page.tsx'), 'utf8');
  assert.match(phone, /setReadIx\(back\?\.read/, 'readPiece reads the reply\'s piece.read');
  for (const piece of [{ paragraphs: 3, read: [], failed: [0] }, { paragraphs: 3, read: [], failed: [], notEnglish: [0] }]) assert(phone.includes(R.unruledLines(piece)[0].replace('Paragraph 1', 'Paragraph ${k + 1}')), 'the phone says each paragraph not ruled in the rule\'s words'); assert.match(phone, /REWRITE_WHILE_READING/); assert.match(phone, /disabled=\{busy \|\| rewriting\}/);
});

// ---- E3-b (council rulings 2026-10-09 section 6, 6c): a reading refused before any run puts the refusal's line on the TV's status line ----
const status = () => getSession().status;
const seatAndMark = (id = 'ema') => { dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id }); dispatch({ type: 'status', text: 'before' }); seen = []; answer = async () => { throw new Error('no model call expected'); }; };
test('E3-b: the plan\'s Read it body ({ kind: essay }) with a Czech paragraph: 400 as before, no run, and the status is the line', async () => {
  seatAndMark();
  const r = await post({ kind: 'essay', text: CZ_R7, type: 'structure' });
  assert.equal(r.status, 400); assert.equal((await r.json()).error, EN_LINE); assert.equal(seen.length, 0);
  assert.equal(status(), EN_LINE); assert.deepEqual(getSession().jobs, {}, 'no job');
});
test('E3-b: a kind essay paragraph that is too long: its essayTooLong line becomes the status', async () => {
  seatAndMark();
  const text = 'Long sentence here. '.repeat(300);
  const r = await post({ kind: 'essay', text, type: 'structure' });
  assert.equal(r.status, 400); const line = R.essayTooLong(text); assert(line); assert.equal((await r.json()).error, line); assert.equal(status(), line); assert.equal(seen.length, 0);
});
test('E3-b: a kind piece made only of Czech paragraphs, and a piece that pieceProblem refuses: each one\'s line becomes the status', async () => {
  seatAndMark();
  let r = await post({ kind: 'piece', text: CZ_R4 + '\n\n' + CZ_R7, type: 'structure' });
  assert.equal(r.status, 400); assert.equal(status(), EN_LINE);
  seatAndMark();
  const text = Array.from({ length: R.PIECE_PARAGRAPHS_MAX + 1 }, (_, i) => `Paragraph ${i}.`).join('\n\n');
  r = await post({ kind: 'piece', text, type: 'structure' });
  assert.equal(r.status, 400); const line = R.pieceProblem(text); assert(line); assert.equal((await r.json()).error, line); assert.equal(status(), line); assert.equal(seen.length, 0);
});
test('E3-b guards: 409 with nobody at the desk and 428 TEXT_NOTICE leave the status as it was', async () => {
  dispatch({ type: 'reset' }); dispatch({ type: 'status', text: 'before' });
  let r = await post({ kind: 'essay', text: CZ_R7, type: 'structure' });
  assert.equal(r.status, 409); assert.equal(status(), 'before');
  texts.deleteAll('ema'); seatAndMark();
  r = await post({ kind: 'piece', text: PIECE, type: 'structure', keep: true });
  assert.equal(r.status, 428); assert.equal(status(), 'before'); assert.equal(seen.length, 0);
});

// ---- E4-b (6c): a sentence of a paragraph the desk did not rule has no rewrite; the route refuses it with that paragraph's line ----
const E4B_PIECE = 'Phones should be banned in class. They distract everyone.\n\nA 2020 study found 40% of lessons were interrupted. This shows phones cost time.\n\n' + CZ_R7 + '\n\nIn conclusion, phones should be banned. Teachers agree.';
const E4B_OBS = [{ n: 1, job: 'claim' }, { n: 2, job: 'context' }, { n: 3, job: 'evidence', supports: 1 }, { n: 4, job: 'link' }, { n: 7, job: 'link' }, { n: 8, job: 'context' }, { n: 9, job: 'context' }];
const e4bDone = async () => {
  dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' });
  seen = []; answer = async (req) => { if (/paragraph 2 of/.test(req.prompt)) throw new Error('engine down'); return observing(E4B_OBS)(req); };
  assert.equal((await post({ kind: 'piece', text: E4B_PIECE, type: 'structure' })).status, 200);
  const a = getSession().essay; assert.deepEqual(a.piece.failed, [1]); assert.deepEqual(a.piece.notEnglish, [2]);
  return a;
};
const inPara = (a, para) => a.sentences.find(s => s.para === para).n;
test('E4-b: a rewrite of a sentence in a failed or a not-English paragraph: 400 with that paragraph\'s line, no call, no job, verdicts unchanged', async () => {
  const a = await e4bDone(); const before = JSON.stringify(a.verdicts), jobs = JSON.stringify(getSession().jobs);
  for (const para of [1, 2]) {
    seen = []; const n = inPara(a, para);
    const r = await post({ kind: 'rewrite', n, text: 'Phones should be banned in every class.' });
    assert.equal(r.status, 400, `paragraph ${para + 1}`); assert.equal((await r.json()).error, R.unruledCaption(a.piece, para).text);
    assert.equal(seen.length, 0); assert.equal(JSON.stringify(getSession().jobs), jobs, 'no job'); assert.equal(JSON.stringify(getSession().essay.verdicts), before);
  }
});
test('E4-b guard: a rewrite of a sentence in a ruled paragraph of the same piece still runs', async () => {
  const a = await e4bDone(); seen = []; answer = observing(E4B_OBS);
  const r = await post({ kind: 'rewrite', n: inPara(a, 0), text: 'Phones should be banned in every class.' });
  assert.equal(seen.length, 1, 'one engine call'); assert.notEqual(r.status, 400, 'not refused');
});
test('E4-b guard: a piece still being read answers REWRITE_WHILE_READING first, even for a sentence in an unruled paragraph', async () => {
  const progress = []; answer = async (req) => { if (/paragraph 2 of/.test(req.prompt)) throw new Error('engine down'); return observing(E4B_OBS)(req); };
  await analysePiece(E4B_PIECE, 'structure', 'ema', undefined, (x) => progress.push(x));
  dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' }); dispatch({ type: 'essay.set', analysis: progress[0], owner: 'ema' });
  seen = []; const r = await post({ kind: 'rewrite', n: 1, text: 'x' });
  assert.equal(r.status, 400); assert.equal((await r.json()).error, R.REWRITE_WHILE_READING); assert.equal(seen.length, 0);
});

// ---- E7 (essay full r1 craft-1): a reading that leaves a judged sentence unanswered fails and records nothing ----
const { NOT_EVERY_SENTENCE } = require(src('lib/desk/essay.ts'));
const quietly = async (fn) => { const log = console.error; console.error = () => {}; try { return await fn(); } finally { console.error = log; } };
const E7_PARA = 'Homework should be shorter. Everyone agrees. Studies of sleep show teenagers need nine hours.';
test('E7-4: POST analyse kind essay with a reading that misses sentence 1 answers 502 with the line, says it on the status line, records nothing', async () => {
  dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' }); seen = [];
  const before = JSON.stringify(getLearner('ema'));
  answer = async () => ({ json: { observations: [{ n: 2, support: 'opinion', note: 'x' }, { n: 3, support: 'context', note: 'y' }], summary: 's' }, provider: 'test', ms: 1 });
  const r = await quietly(() => post({ kind: 'essay', text: E7_PARA, type: 'evidence' }));
  assert.equal(r.status, 502); assert.equal((await r.json()).error, NOT_EVERY_SENTENCE);
  assert.equal(status(), NOT_EVERY_SENTENCE); assert.equal(JSON.stringify(getLearner('ema')), before, 'nothing recorded');
});
test('E7-5: a piece whose paragraph 2 misses a sentence: paragraph 2 is failed, the history counts only paragraph 1, and send-again with a full answer reads it', async () => {
  dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' }); seen = [];
  const TWO = 'Phones should be banned in class. They distract everyone.\n\nA 2020 study found 40% of lessons were interrupted. This shows phones cost time.';
  const obs = [{ n: 1, job: 'claim' }, { n: 2, job: 'context' }, { n: 3, job: 'evidence', supports: 1 }, { n: 4, job: 'link' }];
  answer = async (req) => { const r = await observing(obs)(req); return /paragraph 2 of/.test(req.prompt) ? { ...r, json: { ...r.json, observations: r.json.observations.filter((o) => o.n !== 4) } } : r; };
  const res = await quietly(() => post({ kind: 'piece', text: TWO, type: 'structure' }));
  assert.equal(res.status, 200);
  const a = getSession().essay;
  assert.deepEqual(a.piece.read, [0]); assert.deepEqual(a.piece.failed, [1]);
  assert.match(getLearner('ema').history.at(-1).detail, /^\d of 2 sentences to fix, 2 paragraphs$/, 'only paragraph 1\'s two sentences are counted');
  answer = observing(obs);
  const again = await post({ kind: 'piece-again' });
  assert.equal(again.status, 200);
  const b = getSession().essay;
  assert.deepEqual(b.piece.failed, []); assert.deepEqual([...b.piece.read].sort(), [0, 1]);
  assert.match(getLearner('ema').history.at(-1).detail, /^\d of 4 sentences to fix, 2 paragraphs$/);
});
test('E7-6 (guard): a piece answered in full records exactly as before', async () => {
  dispatch({ type: 'reset' }); dispatch({ type: 'learner.set', id: 'ema' }); seen = [];
  answer = observing(OBS_A);
  const res = await post({ kind: 'piece', text: SECTION_A, type: 'structure' });
  assert.equal(res.status, 200); assert.deepEqual(getSession().essay.piece.failed, []);
  assert.match(getLearner('ema').history.at(-1).detail, /^\d of 6 sentences to fix, 3 paragraphs$/);
});

// ---- E8 (essay full r1 robustness-1): a failed save after a send-again is logged and said; the send-again still succeeds ----
const failLearnerWrites = () => {
  const real = fs.renameSync;
  fs.renameSync = function (from, to, ...rest) {
    if (String(to).endsWith('learners.json')) throw Object.assign(new Error(`EPERM: operation not permitted, rename '${from}' -> '${to}'`), { code: 'EPERM' });
    return real.call(this, from, to, ...rest);
  };
  return () => { fs.renameSync = real; };
};
const againWith = async (writable) => {
  await sessionWith(true);
  answer = observing(OBS_A);
  const restore = writable ? () => {} : failLearnerWrites();
  const errs = [], e0 = console.error; console.error = (...a) => errs.push(a.join(' '));
  try { return { r: await post({ kind: 'piece-again' }), errs }; } finally { console.error = e0; restore(); }
};
test('E8-3: a send-again whose save fails answers 200, moves the paragraphs from failed to read, says PIECE_AGAIN_NOT_SAVED and logs one line', async () => {
  const { PIECE_AGAIN_NOT_SAVED } = require(src('lib/desk/essay.ts'));
  const line = getLearner('ema').history.at(-1).detail;
  const { r, errs } = await againWith(false);
  assert.equal(r.status, 200);
  const a = getSession().essay;
  assert.deepEqual(a.piece.failed, []); assert.deepEqual([...a.piece.read].sort(), [0, 1, 2]);
  assert.equal(status(), PIECE_AGAIN_NOT_SAVED); assert.equal(getSession().jobs.analyse.phase, 'done');
  assert.equal(errs.length, 1); assert.match(errs[0], /send-again/); assert.ok(!errs[0].includes('Phones'), 'no learner text');
  assert.notEqual(getLearner('ema').history.at(-1).detail, undefined); assert.ok(line);
});
test('E8-4 (guard): a send-again with the file writable says the summary and logs nothing', async () => {
  const { PIECE_AGAIN_NOT_SAVED } = require(src('lib/desk/essay.ts'));
  const { r, errs } = await againWith(true);
  assert.equal(r.status, 200); assert.equal(status(), getSession().essay.summary.slice(0, 120)); assert.notEqual(status(), PIECE_AGAIN_NOT_SAVED);
  assert.equal(errs.length, 0);
});

// ---- E9 (essay full r2, craft-2): a piece's summary is code's line from the verdicts; no paragraph summary is read ----
test('E9-4: one faulty sentence in paragraph 2: the summary ends "Start with paragraph 2, sentence n: <note>", with none of the stub\'s text; send-again builds the same line', async () => {
  seen = []; answer = perParagraph(faultyAt([4]), new Set([2]));
  const a = await analysePiece(PIECE, 'structure', 'e9-4', 15);
  const v = a.verdicts.find(x => x.verdict === 'faulty');
  assert.equal(v.n, 4);
  assert(a.summary.endsWith(`Start with paragraph 2, sentence 4: ${v.note}`), a.summary);
  assert.doesNotMatch(a.summary, /summary\./);
  const { analysePieceAgain } = require(src('lib/desk/essay.ts'));
  answer = perParagraph(faultyAt([4]));
  const b = await analysePieceAgain(a, 'e9-4', 15);
  assert.equal(b.summary, R.summaryLine(b));
  assert(b.summary.endsWith(`Start with paragraph 2, sentence 4: ${b.verdicts.find(x => x.verdict === 'faulty').note}`), b.summary);
  assert.doesNotMatch(b.summary, /summary\./);
});
