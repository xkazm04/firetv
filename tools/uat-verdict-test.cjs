/**
 * The LT journey verdict is decided in code from named checks (uat/driver/verdict.cjs), not chosen by the judge.
 * The judge answers the journey's Definition-of-done bullets one row per D id (done[]) beside the Character's
 * criteria; verdictOf() decides from those rows, the metric gates the journey file states, BLOCKER criteria,
 * breaches and how the journey ended, and keeps the judge's own verdict as judgeVerdict.
 * Run with npm test in desk/ (directly: node tools/uat-verdict-test.cjs).
 *
 * Reads the committed runs under uat/runs/ as fixtures and never writes there: every write goes to the OS temp dir,
 * and the suite asserts the committed files are byte-identical at the end. No model call: the tutor is stubbed at
 * the registry, codexText is replaced in the require cache (the judge answers from a queue, through the engine's own
 * shape rule; anything else, the synthesis included, throws), and the codex process launcher throws.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk'), UAT = path.resolve(__dirname, '../uat'), RUNS = path.join(UAT, 'runs');
const VERDICT = path.join(UAT, 'driver/verdict.cjs'), RECERTIFY = path.join(UAT, 'driver/recertify.cjs'), DRIVER = path.join(UAT, 'driver/linga-text.cjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uat-verdict-'));
process.env.DESK_DATA_DIR = path.join(tmp, 'desk-data');

const digest = () => {
  const h = crypto.createHash('sha256');
  for (const run of fs.readdirSync(RUNS).sort()) for (const f of fs.readdirSync(path.join(RUNS, run)).sort()) {
    const p = path.join(RUNS, run, f);
    if (fs.statSync(p).isFile()) h.update(`${run}/${f}\0`).update(fs.readFileSync(p));
  }
  return h.digest('hex');
};
const before = digest();

require(path.join(UAT, 'driver/surface.cjs')).install();
const calls = { tutor: 0, synthesis: 0 }, judgeReplies = [];
const registry = require(path.join(root, 'src/lib/engines/registry.ts'));
registry.useProvider('text', { name: 'stub', run: async () => { calls.tutor++; throw new Error('no tutor call in this suite'); } });
const codex = require(path.join(root, 'src/lib/engines/codex.ts'));
codex.codexCli.run = async () => { throw new Error('codex must never be launched by this suite'); };
const shape = require(path.join(root, 'src/lib/engines/shape.ts'));
codex.codexText = async req => {
  if (req.schema?.required?.includes('verdict') && judgeReplies.length) { const reply = judgeReplies.shift(); return shape.answer({ name: 'stub', run: async () => ({ raw: JSON.stringify(reply), provider: 'stub' }) }, req); }
  calls.synthesis++;
  throw new Error('stub: no model call in this suite');
};
after(() => {
  clearInterval(globalThis.__desk?.ticker); registry.resetProviders();
  fs.rmSync(tmp, { recursive: true, force: true });
  assert.equal(calls.tutor, 0, 'no tutor call');
  assert.equal(digest(), before, 'the committed runs under uat/runs/ are unchanged');
});

const V = () => require(VERDICT), D = () => require(DRIVER), R = () => require(RECERTIFY);
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const journeyFile = id => path.join(UAT, 'journeys', fs.readdirSync(path.join(UAT, 'journeys')).find(f => f.startsWith(`${id}-`)));
const journeyText = id => fs.readFileSync(journeyFile(id), 'utf8');
const simOf = file => JSON.parse(fs.readFileSync(file, 'utf8').match(/```json\s*\n([\s\S]*?)\n```/)[1]);
const character = id => simOf(path.join(UAT, 'characters', `${id}.md`));
/** The '## Definition of done' bullets, read here independently of verdict.cjs. */
const bullets = id => {
  const out = []; let inDone = false;
  for (const l of journeyText(id).split(/\r?\n/)) { if (l.startsWith('## ')) { inDone = l.startsWith('## Definition of done'); continue; } if (inDone && l.startsWith('- ')) out.push(l.slice(2).trim()); }
  return out;
};
const ZERO = { judgeAgreement: { agree: 0, total: 0, disagreements: '' }, topicFit: { fit: 0, safe: 0, total: 0 }, pitch: { at: 0, below: 0, above: 0 }, moments: { correctUseful: 0, total: 0, learnerTurnsWithClearErrors: 0, missedClearErrors: 0 }, boundaries: { breaches: 0, notes: '' } };
const DIDS = n => Array.from({ length: n }, (_, i) => `D${i + 1}`);
/** A clean judge answer for a Character x journey: every criterion and every D row passing, metrics at zero. */
function clean(cid, jid, patch = {}) {
  return { verdict: 'pass', criteria: character(cid).criteria.map(c => ({ id: c.id, result: 'pass', evidence: '#1 fine' })), done: DIDS(bullets(jid).length).map(id => ({ id, result: 'pass', evidence: '#1 fine' })), metrics: ZERO, findings: [], timeSaved: { minutes: 0, confidence: 'low' }, voice: '', ...patch };
}
const recordOf = (jid, judge, patch = {}) => ({ id: jid, title: jid, setup: [], steps: [], facts: {}, endedBy: 'done', ms: 0, doneAsked: DIDS(bullets(jid).length), ...(judge ? { judge } : {}), ...patch });
const ctxOf = (cid, jid) => ({ character: { sim: character(cid) }, journey: journeyText(jid), rubric: '' });
const named = (v, id) => v.why.find(w => w.id === id);

// ---- case 1
test('case 1: doneChecks() turns each journey\'s Definition-of-done bullets into D1..Dn, and the J4 judge is asked for exactly one row per D id', () => {
  const counts = Object.fromEntries(['J1', 'J2', 'J3', 'J4', 'J5'].map(id => [id, V().doneChecks(journeyFile(id)).length]));
  assert.deepEqual(counts, { J1: 5, J2: 4, J3: 4, J4: 4, J5: 4 });
  for (const id of ['J1', 'J2', 'J3', 'J4', 'J5']) {
    const checks = V().doneChecks(journeyFile(id));
    assert.deepEqual(checks.map(c => c.id), DIDS(checks.length), `${id} ids in bullet order`);
    assert.deepEqual(checks.map(c => c.text), bullets(id), `${id} each check carries its bullet text`);
    assert.deepEqual(V().doneChecks(journeyText(id)), checks, `${id} from the file's text as from its path`);
  }
  const req = D().judgeRequest(recordOf('J4'), ctxOf('petra-38', 'J4'));
  assert.ok(req.schema.required.includes('done'));
  const done = req.schema.properties.done;
  assert.deepEqual(done.items.properties.id.enum, ['D1', 'D2', 'D3', 'D4']);
  assert.equal(done.minItems, 4); assert.equal(done.maxItems, 4);
  assert.deepEqual(done.items.properties.result.enum, ['pass', 'fail', 'n-a']);
  const payload = JSON.parse(req.prompt);
  assert.deepEqual(payload.done.map(d => d.id), ['D1', 'D2', 'D3', 'D4']);
  for (const b of bullets('J4')) assert.ok(req.prompt.includes(JSON.stringify(b).slice(1, -1)), `the prompt carries "${b.slice(0, 40)}…"`);
  assert.match(req.system, /done\[\]/);
  // the answer is held to the looser accept shape: done[] is checked in code, not by the engine
  assert.ok(!req.accept.required.includes('done'));
});

// ---- case 2
test('case 2: a J4 judge that passes everything but D2 is overruled: the code verdict is fail, naming D2 and its evidence', async () => {
  const rec = recordOf('J4');
  judgeReplies.push(clean('petra-38', 'J4', { done: [{ id: 'D1', result: 'pass', evidence: '#3 the cue' }, { id: 'D2', result: 'fail', evidence: '#6 coaching improves an old answer' }, { id: 'D3', result: 'pass', evidence: '#8' }, { id: 'D4', result: 'pass', evidence: '#9' }] }));
  await D().judgeRecord(rec, ctxOf('petra-38', 'J4'));
  const v = V().verdictOf(rec, ctxOf('petra-38', 'J4'));
  assert.equal(v.verdict, 'fail');
  assert.ok(named(v, 'D2'), JSON.stringify(v.why));
  assert.match(named(v, 'D2').text, /#6 coaching improves an old answer/);
  assert.equal(v.judgeVerdict, 'pass'); assert.equal(v.agrees, false);
  // the driver saves the decision on the record, the judge's own verdict beside it
  assert.equal(rec.verdict, 'fail'); assert.equal(rec.judgeVerdict, 'pass');
  assert.ok(rec.verdictWhy.some(w => w.id === 'D2'));
  assert.deepEqual(rec.doneAsked, ['D1', 'D2', 'D3', 'D4']);
});

// ---- case 3
const BEGINNERS = '2026-09-15-lt-recert2-beginners';
const committed = (run, cid, jid) => readJson(path.join(RUNS, run, `${cid}.json`)).journeys.find(j => j.id === jid);
test('case 3: the committed beginners run: viktor-67 J3 fails on pitch 3/9, petra-38 J4 passes every recorded check although the judge failed it', () => {
  const vj = V().verdictOf(committed(BEGINNERS, 'viktor-67', 'J3'), V().contextOf('viktor-67', 'J3'));
  assert.equal(vj.verdict, 'fail');
  const pitch = named(vj, 'pitch');
  assert.ok(pitch, JSON.stringify(vj.why));
  assert.match(pitch.text, /pitch 3\/9 .*under 80%/);
  const pj = V().verdictOf(committed(BEGINNERS, 'petra-38', 'J4'), V().contextOf('petra-38', 'J4'));
  assert.equal(pj.verdict, 'pass', JSON.stringify(pj.why));
  assert.ok(pj.notes.includes('no definition-of-done rows'), JSON.stringify(pj.notes));
  assert.equal(pj.judgeVerdict, 'fail'); assert.equal(pj.agrees, false);
});

// ---- case 4
test('case 4: a failed BLOCKER criterion or a breach fails the journey; a failed ordinary criterion alone makes it conditional', () => {
  const ctx = V().contextOf('ondrej-16', 'J5'), crit = (id, result) => clean('ondrej-16', 'J5').criteria.map(c => c.id === id ? { ...c, result, evidence: `#4 ${id} broke` } : c);
  assert.equal(V().verdictOf(recordOf('J5', clean('ondrej-16', 'J5')), ctx).verdict, 'pass');
  const blocker = V().verdictOf(recordOf('J5', clean('ondrej-16', 'J5', { criteria: crit('C1', 'fail') })), ctx);
  assert.equal(blocker.verdict, 'fail'); assert.ok(named(blocker, 'C1'), JSON.stringify(blocker.why)); assert.match(named(blocker, 'C1').text, /BLOCKER/);
  const ordinary = V().verdictOf(recordOf('J5', clean('ondrej-16', 'J5', { criteria: crit('C3', 'fail') })), ctx);
  assert.equal(ordinary.verdict, 'conditional'); assert.ok(named(ordinary, 'C3'), JSON.stringify(ordinary.why));
  const breach = V().verdictOf(recordOf('J5', clean('ondrej-16', 'J5', { metrics: { ...ZERO, boundaries: { breaches: 1, notes: '#7' } } })), ctx);
  assert.equal(breach.verdict, 'fail'); assert.ok(breach.why.some(w => w.kind === 'breach'), JSON.stringify(breach.why));
  const flagged = { type: 'trust', dimension: 'trust', title: 'The partner plays the party scene', expected: '', got: '', evidence: '#9', frequency: 'low', reachability: 'low', trust_erosion: 'high', boundary: true, suggested_acceptance: '', code_hint: '' };
  const byFinding = V().verdictOf(recordOf('J5', clean('ondrej-16', 'J5', { findings: [flagged] })), ctx);
  assert.equal(byFinding.verdict, 'fail'); assert.ok(byFinding.why.some(w => w.kind === 'breach' && /party scene/.test(w.text)), JSON.stringify(byFinding.why));
});

// ---- case 5
test('case 5: how the journey ended decides first; a D row answered twice, left out or off the enum is not-evaluable and never lets it pass', () => {
  const ctx = V().contextOf('petra-38', 'J4'), ok = clean('petra-38', 'J4');
  for (const how of ['budget', 'character-stopped']) {
    const v = V().verdictOf(recordOf('J4', ok, { endedBy: how }), ctx);
    assert.equal(v.verdict, 'fail');
    assert.ok(v.why.some(w => w.kind === 'ended' && w.text.includes(`ended ${how} before done`)), JSON.stringify(v.why));
  }
  for (const how of ['setup-failed', 'character-model-failure']) assert.equal(V().verdictOf(recordOf('J4', ok, { endedBy: how }), ctx).verdict, 'not-reached', how);
  const unjudged = V().verdictOf(recordOf('J4', null, { judgeError: 'codex timed out' }), ctx);
  assert.equal(unjudged.verdict, 'not-reached'); assert.equal(unjudged.judgeVerdict, null); assert.ok(unjudged.why.length);
  const rows = ok.done;
  const cases = {
    twice: [rows[0], { ...rows[0], result: 'fail' }, rows[1], rows[2], rows[3]],
    'left out': [rows[0], rows[1], rows[3]],
    'off the enum': [rows[0], rows[1], { ...rows[2], result: 'maybe' }, rows[3]],
  };
  const expect = { twice: 'D1', 'left out': 'D3', 'off the enum': 'D3' };
  for (const [name, done] of Object.entries(cases)) {
    const v = V().verdictOf(recordOf('J4', { ...ok, done }), ctx);
    assert.equal(v.verdict, 'conditional', `${name}: ${JSON.stringify(v.why)}`);
    assert.ok(named(v, expect[name]) && /not evaluable/.test(named(v, expect[name]).text), `${name} names ${expect[name]}: ${JSON.stringify(v.why)}`);
  }
  // done[] missing where it was asked for, or not an array: every D id not-evaluable
  for (const done of [undefined, 'D1 pass', null]) {
    const { done: _, ...rest } = ok;
    const v = V().verdictOf(recordOf('J4', done === undefined ? rest : { ...rest, done }), ctx);
    assert.equal(v.verdict, 'conditional', JSON.stringify(done));
    assert.deepEqual(v.why.filter(w => w.kind === 'done').map(w => w.id), ['D1', 'D2', 'D3', 'D4']);
  }
});

// ---- case 6
const RUN_IDS = fs.readdirSync(RUNS).filter(d => fs.existsSync(path.join(RUNS, d, 'findings.json'))).sort();
const resultsOf = run => fs.readdirSync(path.join(RUNS, run)).filter(f => f.endsWith('.json') && f !== 'findings.json' && f !== 'run.json').sort().map(f => readJson(path.join(RUNS, run, f)));
test('case 6: over the 84 judged journeys on disk the code agrees with the judge on 42, every other verdict names its reasons, and report.md prints both', async () => {
  let judged = 0, agree = 0, unexplained = 0;
  const KINDS = new Set(['done', 'criterion', 'gate', 'breach', 'ended', 'judge']);
  for (const run of RUN_IDS) for (const r of resultsOf(run)) for (const j of r.journeys) {
    if (!j.judge) continue;
    judged++;
    const v = V().verdictOf(j, V().contextOf(r.character, j.id));
    if (v.agrees) agree++; else unexplained++;
    if (v.verdict !== 'pass') assert.ok(v.why.some(w => KINDS.has(w.kind) && w.id), `${run} ${r.character} ${j.id} ${v.verdict} names a check: ${JSON.stringify(v.why)}`);
  }
  assert.equal(RUN_IDS.length, 5);
  assert.equal(judged, 84);
  assert.equal(agree, 42);
  // synthesize() into the temp dir, the synthesis call stubbed to throw
  let printed = 0;
  for (const run of RUN_IDS) {
    const dir = path.join(tmp, `synth-${run}`); fs.mkdirSync(dir, { recursive: true });
    await D().synthesize(dir, run, resultsOf(run), [], 0);
    const md = fs.readFileSync(path.join(dir, 'report.md'), 'utf8');
    const m = md.match(/judge verdicts no recorded check explains: (\d+)/);
    assert.ok(m, `${run} report.md counts the unexplained judge verdicts`);
    printed += Number(m[1]);
    assert.match(fs.readFileSync(path.join(dir, 'SUMMARY.md'), 'utf8'), /Synthesis failed/);
    if (run !== BEGINNERS) continue;
    const cellOf = (cid, jid) => md.split('\n').find(l => l.startsWith(`| ${cid} | ${jid} |`))?.split(' | ')[2];
    assert.match(cellOf('viktor-67', 'J3'), /^fail - .*pitch 3\/9/);
    assert.match(cellOf('petra-38', 'J4'), /^pass/);
  }
  assert.equal(printed, unexplained);
  assert.equal(unexplained, 42);
  assert.ok(calls.synthesis >= 5, 'the synthesis call was made and stubbed');
});

// ---- case 7
/** A temp copy of a committed run's top-level files, patched per Character. */
function copyRun(id, patch = {}) {
  const dst = path.join(tmp, `${id}-${crypto.randomUUID().slice(0, 8)}`);
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(path.join(RUNS, id))) {
    const p = path.join(RUNS, id, f);
    if (!fs.statSync(p).isFile()) continue;
    const c = f.replace(/\.json$/, '');
    if (patch[c]) { const r = readJson(p); r.journeys = r.journeys.map(j => patch[c][j.id] ? patch[c][j.id](structuredClone(j)) : j); fs.writeFileSync(path.join(dst, f), JSON.stringify(r)); }
    else fs.copyFileSync(p, path.join(dst, f));
  }
  return dst;
}
test('case 7: recertify\'s Regressed compares code verdicts: a judge\'s mood swing alone is not a regression, a D check that turned is', () => {
  const allPass = j => { j.judge.criteria = j.judge.criteria.map(c => ({ ...c, result: c.result === 'n-a' ? 'n-a' : 'pass' })); return j; };
  const withDone = failing => j => { j.doneAsked = DIDS(4); j.judge.done = DIDS(4).map(id => ({ id, result: id === failing ? 'fail' : 'pass', evidence: id === failing ? '#6 the replay repeats the old question' : '#2 fine' })); return j; };
  // before: petra's J4 judged pass, tomas's J4 with every check passing; after: petra's judge says fail on the same checks, tomas's D2 fails
  const prior = copyRun(BEGINNERS, { 'petra-38': { J4: j => { j.judge.verdict = 'pass'; return j; } }, 'tomas-9': { J4: j => withDone(null)(allPass(j)) } });
  const rerun = path.join(prior, 'recert-1'); fs.mkdirSync(rerun);
  const petra = readJson(path.join(RUNS, BEGINNERS, 'petra-38.json')), tomas = readJson(path.join(RUNS, BEGINNERS, 'tomas-9.json'));
  fs.writeFileSync(path.join(rerun, 'petra-38.json'), JSON.stringify({ ...petra, journeys: petra.journeys.filter(j => j.id === 'J4') }));
  fs.writeFileSync(path.join(rerun, 'tomas-9.json'), JSON.stringify({ ...tomas, journeys: tomas.journeys.filter(j => j.id === 'J4').map(j => withDone('D2')(allPass(structuredClone(j)))) }));
  fs.writeFileSync(path.join(rerun, 'findings.json'), '[]');
  fs.writeFileSync(path.join(rerun, 'run.json'), JSON.stringify({ id: R().runId(rerun), recertify: BEGINNERS, pairs: { 'petra-38': ['J4'], 'tomas-9': ['J4'] } }));
  const before_ = V().verdictOf(readJson(path.join(prior, 'petra-38.json')).journeys.find(j => j.id === 'J4'), V().contextOf('petra-38', 'J4'));
  const after_ = V().verdictOf(readJson(path.join(rerun, 'petra-38.json')).journeys[0], V().contextOf('petra-38', 'J4'));
  assert.deepEqual([before_.verdict, before_.judgeVerdict, after_.verdict, after_.judgeVerdict], ['pass', 'pass', 'pass', 'fail']);
  const md = fs.readFileSync(R().renderRecertify(prior, rerun), 'utf8');
  const i = md.indexOf('## Regressed\n'), regressed = md.slice(i, md.indexOf('\n## ', i + 1));
  const pair = `${path.basename(prior)} -> ${R().runId(rerun)}`;
  assert.ok(!regressed.includes('petra-38 J4'), `the judge's pass -> fail on unchanged checks is not a regression:\n${regressed}`);
  assert.ok(!md.includes('petra-38 J4 verdict'), 'nor is it listed as a confounded verdict drop');
  const row = regressed.split('\n').find(l => l.includes('tomas-9 J4'));
  assert.ok(row, `tomas-9 J4 regressed on D2:\n${regressed}`);
  assert.match(row, /pass -> fail/); assert.match(row, /D2/); assert.ok(row.includes(pair), row);
});

// ---- case 8 (guard): a judge reply without done[] is accepted, never thrown
test('case 8 (guard): a judge reply with no done[] is taken by the engine\'s shape rule and the pair is not thrown', async () => {
  const { done: _, ...legacy } = clean('petra-38', 'J4');
  judgeReplies.push(legacy);
  const rec = recordOf('J4');
  await D().judgeRecord(rec, ctxOf('petra-38', 'J4'));
  assert.equal(rec.judgeError, undefined);
  assert.equal(rec.judge.verdict, 'pass');
  assert.equal(rec.verdict, 'conditional', 'asked for done[] and given none: not-evaluable, never pass');
});
