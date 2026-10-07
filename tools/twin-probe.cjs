/**
 * The twin probe, simulated (v2 T1; owner decision V2-O1 2026-10-07: no real-writer test for now, push on with best
 * guesses, tests and simulations). The kill test for the twin (plan section g): does a profile held in the prompt make
 * the model write closer to a person than the plain model does?
 *
 * Protocol, per synthetic writer (8, distinct styles, below):
 *   1. the engine writes about 20 short messages (email and chat) in that writer's voice: the corpus;
 *   2. the last 3 are held out; the style meter (lib/rules/style.ts) measures the rest, and the 5 most recent of them
 *      (at most 500 characters each, as a Twin Card exemplar) are kept;
 *   3. for each held-out message, its subject in a few words; then two drafts on that subject and about that length:
 *      the twin's (the measured dimensions in the card's own level words, and the exemplars) and the plain model's;
 *   4. scored twice: by code (styleDistance from the writer's sheet: the nearer draft wins) and by a blind judge (shown
 *      the writer's three held-out messages and the two drafts shuffled: which one did the same person write?).
 *   A writer passes when the twin wins on both scores in at least 2 of 3 trials. The probe passes at 6 of 8 writers.
 *   A twin draft that copies a run of 8 words from the corpus is disqualified for that trial (copyRun).
 *
 * WHAT A PASS MEANS: the synthetic writers are themselves the model's writing, so a pass shows the profile steers the
 * model toward a measured style, not that a twin sounds like a real person. Record it as simulated, never as proof.
 *
 * Run on the owner's PC (the Claude CLI on PATH), from desk/:   node ../tools/twin-probe.cjs [--writers 8] [--out dir]
 * Dry run, no engine (what the gate runs):                       node ../tools/twin-probe.cjs --stub
 * Output: <out>/report.json and report.md (default artifacts/twin-probe/<timestamp>, git-ignored).
 */
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const root = path.resolve(__dirname, '../desk');
const ts = require(path.join(root, 'node_modules/typescript'));
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const style = require(path.join(root, 'src/lib/rules/style.ts'));

const LEVEL = {
  formality: ['intimate', 'casual', 'consultative', 'formal', 'ceremonial'], warmth: ['detached', 'neutral', 'cordial', 'warm', 'affectionate'],
  humor: ['none', 'dry', 'light', 'playful', 'irreverent'], energy: ['matter-of-fact', 'calm', 'engaged', 'upbeat', 'exuberant'],
  length: ['one-liner', 'brief', 'medium', 'full', 'expansive'], directness: ['blunt', 'direct', 'balanced', 'softened', 'indirect'],
  expressiveness: ['none', 'rare', 'occasional', 'frequent', 'heavy (emoji, exclamations, slang)'], detail: ['headline', 'key points', 'explained', 'thorough', 'exhaustive and structured'],
};
const WRITERS = [
  { id: 'terse', persona: 'A busy engineer who replies in lowercase fragments, no greetings, no sign-offs, rarely more than eight words.' },
  { id: 'formal', persona: 'A senior civil servant: full formal letters with "Dear ...", "Kind regards", no contractions, careful complete sentences.' },
  { id: 'bubbly', persona: 'A cheerful student: exclamation marks, emoji in most messages, "haha", "omg", short bursts.' },
  { id: 'hedger', persona: 'A polite, anxious junior: softens everything with "maybe", "I think", "if possible", "sorry to bother you".' },
  { id: 'storyteller', persona: 'A retired teacher who writes long, warm, detailed paragraphs with anecdotes and many connectors.' },
  { id: 'lister', persona: 'A project manager who writes in short bullet lists and numbered steps, crisp and structured.' },
  { id: 'dry', persona: 'A sardonic designer: dry understatement, short sentences, no emoji, occasional ironic aside.' },
  { id: 'warm-direct', persona: 'A friendly team lead: first names, thanks, plain direct asks, medium length, one exclamation at most.' },
];

const argv = process.argv.slice(2), flag = (n) => argv.includes(n), opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const STUB = flag('--stub');
const N = Math.max(1, Math.min(WRITERS.length, Number(opt('--writers', WRITERS.length))));
const OUT = path.resolve(opt('--out', path.resolve(__dirname, '../artifacts/twin-probe', new Date().toISOString().replace(/[:.]/g, '-'))));

/** The stub engine: deterministic, no model. Writers write from templates; the twin echoes the exemplars' style, the plain model a neutral one; the judge picks the draft nearer by code. */
function stubText(req) {
  const p = JSON.parse(req.prompt);
  if (p.step === 'corpus') {
    const w = WRITERS.find((x) => x.id === p.writer);
    const T = { terse: (i) => `ok, ${i} works`, formal: (i) => `Dear team,\nRegarding item ${i}, I would like to confirm the arrangement. Kind regards,\nPetr`, bubbly: (i) => `omg yes!! item ${i} 😍 haha`, hedger: (i) => `Sorry to bother you, I think maybe item ${i} could move, if possible?`, storyteller: (i) => `When we spoke about item ${i}, it reminded me of a summer long ago, because the garden was full and we talked until late, and then we laughed about it.`, lister: (i) => `- item ${i}\n- owner: me\n- due: Friday`, dry: (i) => `Item ${i}. Thrilling. Done.`, 'warm-direct': (i) => `Hi Jana, thanks for item ${i}. Can you send it by Friday? Great work!` }[w.id];
    return { messages: Array.from({ length: p.count }, (_, i) => T(i + 1)) };
  }
  if (p.step === 'subject') return { subject: p.message.split(/\s+/).slice(0, 6).join(' ') };
  if (p.step === 'twin') return { draft: p.exemplars[0] };
  if (p.step === 'plain') return { draft: `Hello. This message is about ${p.subject}. Please let me know what you think about it.` };
  if (p.step === 'judge') {
    const real = style.styleSheet(p.real), dA = style.styleDistance(real, style.styleSheet([p.A])), dB = style.styleDistance(real, style.styleSheet([p.B]));
    return { pick: dA <= dB ? 'A' : 'B' };
  }
  throw new Error('stub: unknown step');
}
let engineText;
async function ask(system, prompt, schema, model = 'best') {
  if (STUB) return stubText({ prompt: JSON.stringify(prompt) });
  engineText = engineText || require(path.join(root, 'src/lib/engines/text.ts')).text;
  const r = await engineText({ system, prompt: JSON.stringify(prompt), schema, model, thinking: false });
  return r.json;
}
const obj = (props) => ({ type: 'object', properties: Object.fromEntries(Object.entries(props).map(([k, t]) => [k, t === 'array' ? { type: 'array', items: { type: 'string' } } : { type: t }])), required: Object.keys(props) });

async function probeWriter(w, rng) {
  const corpus = (await ask(`You write as one person. ${w.persona} Write realistic messages they would send: emails and chats about everyday work and life. Vary the subjects. Return JSON.`, { step: 'corpus', writer: w.id, count: 20 }, obj({ messages: 'array' }))).messages.filter((m) => typeof m === 'string' && m.trim());
  if (corpus.length < 8) return { id: w.id, error: `only ${corpus.length} messages` };
  const held = corpus.slice(-3), train = corpus.slice(0, -3);
  const sheet = style.styleSheet(train), dims = style.twinDims(sheet);
  const exemplars = train.slice(-5).reverse().map((m) => (m.length > 500 ? m.slice(0, 500) : m));
  const profile = Object.entries(dims).map(([k, v]) => `${k}: ${LEVEL[k][v - 1]}`).join('; ');
  const trials = [];
  for (const real of held) {
    const { subject } = await ask('Name the subject of a message in at most eight words. Return JSON.', { step: 'subject', message: real }, obj({ subject: 'string' }), 'fast');
    const words = style.styleSheet([real]).wpm.p50;
    const twin = (await ask(`You write as a specific person. Their measured style: ${profile}. Messages they actually wrote, to match in register, length and habits, never to copy: ${exemplars.map((e) => JSON.stringify(e)).join(' | ')}. Write one message on the subject given, about ${words} words. Return JSON.`, { step: 'twin', subject, words, exemplars }, obj({ draft: 'string' }))).draft;
    const plain = (await ask(`Write one short message on the subject given, about ${words} words. Return JSON.`, { step: 'plain', subject, words }, obj({ draft: 'string' }))).draft;
    const copied = style.copyRun(train.join('\n'), twin, 8);
    const dTwin = style.styleDistance(sheet, style.styleSheet([twin])), dPlain = style.styleDistance(sheet, style.styleSheet([plain]));
    const twinIsA = rng() < 0.5;
    const { pick } = await ask('You are shown three messages one person wrote, and two more messages, A and B. Exactly one of A and B was written to sound like that person. Which one? Return JSON.', { step: 'judge', real: held, A: twinIsA ? twin : plain, B: twinIsA ? plain : twin }, obj({ pick: 'string' }), 'best');
    const judgeTwin = (pick === 'A') === twinIsA;
    trials.push({ subject, words, codeTwin: dTwin < dPlain, judgeTwin, dTwin, dPlain, copied: !!copied, won: !copied && dTwin < dPlain && judgeTwin });
  }
  return { id: w.id, dims, exemplars: exemplars.length, trials, passed: trials.filter((t) => t.won).length >= 2 };
}

(async () => {
  let seed = 7; const rng = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const writers = [];
  for (const w of WRITERS.slice(0, N)) { try { writers.push(await probeWriter(w, rng)); } catch (e) { writers.push({ id: w.id, error: e instanceof Error ? e.message : String(e) }); } }
  const passed = writers.filter((w) => w.passed).length, need = Math.ceil((6 / 8) * N);
  const report = { at: new Date().toISOString(), simulated: true, stub: STUB, writers, passed, of: N, need, verdict: passed >= need ? 'pass (simulated)' : 'fail (simulated)' };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  const md = [`# Twin probe (simulated${STUB ? ', stub engine' : ''}), ${report.at}`, '', `Verdict: **${report.verdict}**: ${passed} of ${N} writers (need ${need}).`, '',
    'A pass shows the profile steers the model toward a measured style. It is not proof that a twin sounds like a real person.', '',
    '| writer | dims | trials won | notes |', '|---|---|---|---|',
    ...writers.map((w) => w.error ? `| ${w.id} | - | - | error: ${w.error} |` : `| ${w.id} | ${Object.values(w.dims).join(' ')} | ${w.trials.filter((t) => t.won).length} of ${w.trials.length} | ${w.trials.map((t) => `${t.codeTwin ? 'code✓' : 'code✗'} ${t.judgeTwin ? 'judge✓' : 'judge✗'}${t.copied ? ' copied' : ''}`).join('; ')} |`)].join('\n');
  fs.writeFileSync(path.join(OUT, 'report.md'), md + '\n');
  console.log(`twin-probe: ${report.verdict}, ${passed}/${N} writers. Report: ${OUT}`);
})().catch((e) => { console.error(e); process.exit(1); });
