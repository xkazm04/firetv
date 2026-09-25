/**
 * One-command LT recertify (uat/driver/recertify.cjs and linga-text.cjs --recertify): plan the open pairs, recompute
 * metric deltas and confounds from the runs' own JSON, stamp the ORIGINATING run's findings.json, write recertify.md.
 * Run with npm test in desk/ (directly: node tools/uat-recertify-test.cjs).
 *
 * Reads the committed runs under uat/runs/ as fixtures and never writes there: every write goes to a copy in the OS
 * temp dir, and the suite asserts the committed files are byte-identical at the end. All three model roles are
 * stubbed: the tutor at the registry, the Character and judge by replacing codexText in the require cache. No codex.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk'), RUNS = path.resolve(__dirname, '../uat/runs');
const RECERTIFY = path.resolve(__dirname, '../uat/driver/recertify.cjs'), DRIVER = path.resolve(__dirname, '../uat/driver/linga-text.cjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uat-recertify-'));
process.env.DESK_DATA_DIR = path.join(tmp, 'desk-data');

// the committed runs, hashed now and again at the end: the suite must leave them untouched
const digest = () => {
  const h = crypto.createHash('sha256');
  for (const run of fs.readdirSync(RUNS).sort()) for (const f of fs.readdirSync(path.join(RUNS, run)).sort()) {
    const p = path.join(RUNS, run, f);
    if (fs.statSync(p).isFile()) h.update(`${run}/${f}\0`).update(fs.readFileSync(p));
  }
  return h.digest('hex');
};
const before = digest();

// the driver's require hooks (@/ into desk/src, TS and TSX through desk's typescript), then the three roles stubbed
require(path.resolve(__dirname, '../uat/driver/surface.cjs')).install();
const calls = { tutor: 0, codex: 0 }, judgeReplies = [];
const registry = require(path.join(root, 'src/lib/engines/registry.ts'));
registry.useProvider('text', { name: 'stub', run: async () => { calls.tutor++; throw new Error('no tutor call in this suite'); } });
const codex = require(path.join(root, 'src/lib/engines/codex.ts'));
codex.codexCli.run = async () => { throw new Error('codex must never be launched by this suite'); };
const seen = [];
// a queued judge reply goes through the engine's own shape rule (shape.ts answer()), as codex's answer does live:
// an answer the request's shape rejects throws here exactly as it would in a run
const shape = require(path.join(root, 'src/lib/engines/shape.ts'));
codex.codexText = async req => {
  calls.codex++; seen.push(req);
  if (req.schema?.required?.includes('verdict') && judgeReplies.length) { const reply = judgeReplies.shift(); return shape.answer({ name: 'stub', run: async () => ({ raw: JSON.stringify(reply), provider: 'stub' }) }, req); }
  throw new Error('stub: no reply queued for this call');
};
after(() => {
  clearInterval(globalThis.__desk?.ticker); registry.resetProviders();
  fs.rmSync(tmp, { recursive: true, force: true });
  assert.equal(calls.tutor, 0, 'no tutor call');
  assert.equal(digest(), before, 'the committed runs under uat/runs/ are unchanged');
});

const R = () => require(RECERTIFY), D = () => require(DRIVER);
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
/** A copy of a committed run's top-level files in the OS temp dir. */
function copyRun(id, as = id) {
  const dst = path.join(tmp, `${as}-${crypto.randomUUID().slice(0, 8)}`);
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(path.join(RUNS, id))) { const p = path.join(RUNS, id, f); if (fs.statSync(p).isFile()) fs.copyFileSync(p, path.join(dst, f)); }
  return dst;
}
const metricLine = (id, name) => fs.readFileSync(path.join(RUNS, id, 'report.md'), 'utf8').split('\n').find(l => l.startsWith(`- **${name}:**`));
const pairCount = plan => Object.values(plan).reduce((n, js) => n + js.length, 0);

// ---- case 1
test('case 1: plan() lists the Character x journey pairs with open non-strength findings, and only those', () => {
  const plan = R().plan(path.join(RUNS, '2026-09-15-lt-recert2-beginners'));
  assert.deepEqual(plan, { 'klara-13': ['J3'], 'petra-38': ['J3', 'J4'], 'tomas-9': ['J3', 'J4'], 'viktor-67': ['J3', 'J4'] });
  assert.equal(pairCount(plan), 7);
  const wide = R().plan('2026-09-15-lt-recert');
  assert.equal(pairCount(wide), 26);
  assert.equal(Object.keys(wide).length, 10);
  // a fixed row drops out of the plan: stamp every open finding of one pair in a temp copy and plan again
  const copy = copyRun('2026-09-15-lt-recert2-beginners');
  const rows = readJson(path.join(copy, 'findings.json')).map(f => f.character === 'klara-13' && f.resolution === 'open' ? { ...f, resolution: 'fixed' } : f);
  fs.writeFileSync(path.join(copy, 'findings.json'), JSON.stringify(rows));
  assert.deepEqual(R().plan(copy), { 'petra-38': ['J3', 'J4'], 'tomas-9': ['J3', 'J4'], 'viktor-67': ['J3', 'J4'] });
});

// ---- case 2
test('case 2: metricDelta() recomputes the rubric metrics from each run\'s per-Character JSON and matches both reports', () => {
  const d = R().metricDelta('2026-09-15-lt', '2026-09-15-lt-recert');
  assert.equal(d.topicFit.before, '209/405 (52%)');
  assert.equal(d.topicFit.after, '63/186 (34%)');
  assert.equal(d.moments.before, '3/3 (100%)');
  assert.equal(d.moments.after, '22/27 (81%)');
  // the same strings the two runs' report.md printed
  for (const [id, side] of [['2026-09-15-lt', 'before'], ['2026-09-15-lt-recert', 'after']]) {
    assert.ok(metricLine(id, 'topic fit').includes(`fit ${d.topicFit[side]}`), `${id} topic fit`);
    assert.ok(metricLine(id, 'moment precision').endsWith(d.moments[side]), `${id} moment precision`);
  }
  assert.deepEqual([d.topicFit.from, d.topicFit.to], [[209, 405], [63, 186]]);
  // recertify.md reads before over the pairs the rerun ran: lt's J1 judges counted 20 topics the rerun never saw
  assert.equal(R().metricDelta('2026-09-15-lt', '2026-09-15-lt-recert', { samePairs: true }).topicFit.before, '189/354 (53%)');
});

// ---- case 3
test('case 3: confounds() flags a changed journey start from the setup record, and notes an unrecorded instrument', () => {
  const c = R().confounds('2026-09-15-lt', '2026-09-15-lt-recert');
  const starts = c.confounds.filter(x => x.kind === 'start');
  assert.equal(starts.length, 1, JSON.stringify(c.confounds));
  assert.equal(starts[0].journey, 'J2');
  assert.ok(starts[0].text.includes('after a real J1 for 5 of 10 Characters before, 0 of 10 after (fixture: level set by hand)'), starts[0].text);
  assert.ok(starts[0].metrics.includes('topicFit'), 'the start confound covers the topic-fit metric J2 feeds');
  const c2 = R().confounds('2026-09-15-lt-recert', '2026-09-15-lt-recert2-goal');
  assert.equal(c2.confounds.filter(x => x.kind === 'start').length, 0, JSON.stringify(c2.confounds));
  const notes = c2.notes.filter(x => x.kind === 'instrument');
  assert.equal(notes.length, 1);
  assert.match(notes[0].text, /instrument not recorded/);
  // a recorded instrument that differs is a confound; the same one is nothing
  const a = copyRun('2026-09-15-lt-recert', 'a'), b = copyRun('2026-09-15-lt-recert2-goal', 'b');
  const inst = { model: 'gpt-6-astra', efforts: { tutor: 'medium', character: 'medium', judge: 'high' }, judgeScreenCap: 900, driver: { 'linga-text.cjs': 'x', 'surface.cjs': 'y' } };
  fs.writeFileSync(path.join(a, 'run.json'), JSON.stringify({ instrument: inst }));
  fs.writeFileSync(path.join(b, 'run.json'), JSON.stringify({ instrument: { ...inst, judgeScreenCap: 3000 } }));
  const c3 = R().confounds(a, b);
  assert.equal(c3.notes.filter(x => x.kind === 'instrument').length, 0);
  const inst3 = c3.confounds.filter(x => x.kind === 'instrument');
  assert.equal(inst3.length, 1);
  assert.match(inst3[0].text, /judgeScreenCap 900 -> 3000/);
  fs.writeFileSync(path.join(b, 'run.json'), JSON.stringify({ instrument: inst }));
  assert.equal(R().confounds(a, b).confounds.filter(x => x.kind === 'instrument').length, 0);
});

// ---- the recertify of tomas-9 J3 against a temp copy of the beginners run, judged by the stub
const BEGINNERS = '2026-09-15-lt-recert2-beginners';
function stubFinding(patch) {
  return { type: 'quality-gap', dimension: 'senior-quality', title: 'x', expected: 'x', got: 'x', evidence: '#3', frequency: 'med', reachability: 'med', trust_erosion: 'med', boundary: false, suggested_acceptance: 'x', code_hint: '', ...patch };
}
async function recertifyTomasJ3() {
  const prior = copyRun(BEGINNERS), rerun = path.join(prior, 'recert-1');
  fs.mkdirSync(rerun, { recursive: true });
  const committed = readJson(path.join(RUNS, BEGINNERS, 'tomas-9.json'));
  const { judge, ...record } = committed.journeys.find(j => j.id === 'J3');
  record.prior = R().openFindings(prior, 'tomas-9', 'J3');
  const metrics = { ...judge.metrics, moments: { correctUseful: 0, total: 2, learnerTurnsWithClearErrors: 8, missedClearErrors: 6 } };
  judgeReplies.push({
    ...judge, metrics,
    findings: [
      stubFinding({ type: 'missing-feature', title: 'The recap still counts activity and gives him no English to keep', evidence: '#13 the recap shows 8 replies, 1 moment' }),
      stubFinding({ title: 'The partner switches topic mid-scene', evidence: '#7' }),
      stubFinding({ type: 'strength', title: 'Minecraft still carries the scene', evidence: '#4' }),
    ],
    prior: [
      { id: 'LT-tomas-9-J3-1', status: 'not-seen', evidence: '#5 the first correction is two words he already used', finding: -1 },
      { id: 'LT-tomas-9-J3-3', status: 'recurs', evidence: '#13 the recap counts replies and moments only', finding: 0 },
    ],
  });
  const character = { sim: { id: 'tomas-9', name: 'Tomáš' } };
  record.judge = await D().judgeJourney(record, { character, journey: 'J3', rubric: '' });
  const result = { character: 'tomas-9', name: 'Tomáš', trueBand: 'A1', engine: 'stub', journeys: [record], calls: {} };
  fs.writeFileSync(path.join(rerun, 'tomas-9.json'), JSON.stringify(result));
  fs.writeFileSync(path.join(rerun, 'run.json'), JSON.stringify({ id: R().runId(rerun), recertify: BEGINNERS, pairs: { 'tomas-9': ['J3'] } }));
  await D().synthesize(rerun, R().runId(rerun), [result], [], 0);
  const out = R().finish(prior, rerun);
  return { prior, rerun, out };
}

// ---- case 4
test('case 4: the judge\'s prior rows are written back into the ORIGINATING findings.json, and a recurrence is carried forward', async () => {
  const { prior, rerun } = await recertifyTomasJ3();
  const id = R().runId(rerun);
  assert.equal(id, `${path.basename(prior)}/recert-1`);
  const rows = Object.fromEntries(readJson(path.join(prior, 'findings.json')).map(f => [f.id, f]));
  const fixed = rows['LT-tomas-9-J3-1'];
  assert.equal(fixed.resolution, 'fixed');
  assert.equal(fixed.recertify_run, id);
  assert.match(fixed.recertify_evidence, /#5/);
  const recurs = rows['LT-tomas-9-J3-3'];
  assert.equal(recurs.resolution, 'open');
  assert.equal(recurs.recurrence, 2);
  assert.equal(recurs.recertify_run, id);
  assert.ok(Object.values(rows).every(f => f.resolution !== 'resolved-verified'), 'LT never claims resolved-verified');
  // a pair that was not rerun is untouched
  assert.equal(rows['LT-tomas-9-J4-1'].recertify_run, undefined);
  assert.equal(rows['LT-tomas-9-J4-1'].resolution, 'open');
  const fresh = readJson(path.join(rerun, 'findings.json'));
  const match = fresh.find(f => f.recurs === 'LT-tomas-9-J3-3');
  assert.ok(match, 'the new run carries the recurrence');
  assert.equal(match.recurrence, 2);
  assert.match(match.title, /recap/);
  assert.equal(fresh.filter(f => f.recurs).length, 1);
  assert.ok(fresh.filter(f => !f.recurs).every(f => f.recurrence === 1));
  // the plan now reruns what is still open, not what was fixed
  assert.deepEqual(R().openFindings(prior, 'tomas-9', 'J3').map(f => f.id).sort(), ['LT-tomas-9-J3-2', 'LT-tomas-9-J3-3']);
});

// ---- case 5
test('case 5: the judge sees exactly the pair\'s prior open ids and must answer each; an omitted id is not-evaluable, never fixed', async () => {
  const { prior } = await recertifyTomasJ3();
  const req = seen.filter(r => r.schema?.required?.includes('verdict')).at(-1);
  const payload = JSON.parse(req.prompt);
  const ids = ['LT-tomas-9-J3-1', 'LT-tomas-9-J3-2', 'LT-tomas-9-J3-3'];
  assert.deepEqual(payload.prior.map(p => p.id).sort(), ids);
  assert.ok(req.schema.required.includes('prior'));
  const items = req.schema.properties.prior;
  assert.deepEqual([...items.items.properties.id.enum].sort(), ids);
  assert.equal(items.minItems, 3); assert.equal(items.maxItems, 3);
  assert.deepEqual(items.items.required.sort(), ['evidence', 'finding', 'id', 'status']);
  assert.match(req.system, /prior/);
  // the omitted id
  const row = readJson(path.join(prior, 'findings.json')).find(f => f.id === 'LT-tomas-9-J3-2');
  assert.equal(row.recertify_status, 'not-evaluable');
  assert.equal(row.resolution, 'open');
  assert.deepEqual(R().priorStatuses(['a', 'b'], [{ id: 'a', status: 'not-seen', evidence: '#1', finding: -1 }]).b.status, 'not-evaluable');
  // code, not the judge, decides what can count as fixed: a journey that never reached its end saw nothing
  assert.equal(R().priorStatuses(['a'], [{ id: 'a', status: 'not-seen', evidence: '#1', finding: -1 }], { endedBy: 'setup-failed' }).a.status, 'not-evaluable');
  assert.equal(R().priorStatuses(['a'], [{ id: 'a', status: 'recurs', evidence: '#1', finding: 0 }], { endedBy: 'budget' }).a.status, 'recurs');
  // a plain run's judge request has no prior: same schema minus prior[]
  const plain = D().judgeRequest({ endedBy: 'done', setup: [], facts: {}, steps: [] }, { character: {}, journey: '', rubric: '' });
  assert.equal(plain.schema.required.includes('prior'), false);
  assert.equal(plain.schema.properties.prior, undefined);
  assert.equal(JSON.parse(plain.prompt).prior, undefined);
  assert.deepEqual(Object.keys(plain.schema.properties).sort(), Object.keys(req.schema.properties).filter(k => k !== 'prior').sort());
});

// ---- case 6
test('case 6: renderRecertify() writes recertify.md beside the ORIGINATING run, every row citing ids and the run pair', async () => {
  const { prior, rerun, out } = await recertifyTomasJ3();
  const file = path.join(prior, 'recertify.md');
  assert.equal(out.file, file);
  const md = fs.readFileSync(file, 'utf8');
  const SECTIONS = ['Fixed (LT evidence)', 'Still open', 'Regressed', 'Metric deltas', 'Confounded - do not read as a regression', 'New findings for the next drain'];
  const at = SECTIONS.map(s => md.indexOf(`## ${s}\n`));
  assert.ok(at.every(i => i >= 0), `sections: ${at}`);
  assert.deepEqual([...at].sort((a, b) => a - b), at, 'in order');
  const pair = `${path.basename(prior)} -> ${R().runId(rerun)}`;
  const body = s => { const i = md.indexOf(`## ${s}\n`), j = md.indexOf('\n## ', i + 1); return md.slice(i, j < 0 ? undefined : j); };
  const rowsOf = s => body(s).split('\n').filter(l => l.startsWith('| ') && !l.startsWith('| ---') && !/^\| (Finding|Metric|Confound|Pair)/.test(l));
  for (const s of SECTIONS) for (const r of rowsOf(s)) assert.ok(r.includes(pair), `${s} row names the run pair: ${r}`);
  for (const s of ['Fixed (LT evidence)', 'Still open', 'Regressed', 'New findings for the next drain']) for (const r of rowsOf(s)) assert.match(r, /LT-[a-z]+-\d+-J\d-\d+/, `${s} row cites a finding id: ${r}`);
  assert.ok(rowsOf('Fixed (LT evidence)').some(r => r.includes('LT-tomas-9-J3-1')));
  const still = rowsOf('Still open');
  assert.ok(still.some(r => r.includes('LT-tomas-9-J3-3') && r.includes('recurs') && r.includes('recert-1/LT-tomas-9-J3-1')), 'a recurrence names the rerun finding by run, since ids are positional');
  assert.ok(still.some(r => r.includes('LT-tomas-9-J3-2') && r.includes('not-evaluable')));
  assert.ok(rowsOf('Regressed').some(r => r.includes('moment precision')), 'moment precision 1/2 -> 0/2 on the same pair is a regression');
  assert.ok(rowsOf('Metric deltas').some(r => r.includes('1/2 (50%)') && r.includes('0/2 (0%)')));
  assert.ok(rowsOf('Confounded - do not read as a regression').some(r => /instrument not recorded/.test(r)));
  const fresh = readJson(path.join(rerun, 'findings.json')).find(f => !f.recurs && f.type !== 'strength');
  assert.ok(rowsOf('New findings for the next drain').some(r => r.includes(fresh.id)));
  assert.match(md, /LT only/);
  assert.equal(out.fixed, 1); assert.equal(out.recurs, 1); assert.equal(out.notEvaluable, 1);
});

// ---- case 7
// Codex is asked for exactly one prior[] row per id (minItems = maxItems = ids; a live smoke on 25 Sep 2026 accepted
// the schema), but nothing in the answer is trusted to hold it: code checks every id, and a bad prior[] never throws the pair.
const JUDGED = { verdict: 'pass', criteria: [], metrics: { judgeAgreement: { agree: 0, total: 0, disagreements: '' }, topicFit: { fit: 0, safe: 0, total: 0 }, pitch: { at: 0, below: 0, above: 0 }, moments: { correctUseful: 0, total: 0, learnerTurnsWithClearErrors: 0, missedClearErrors: 0 }, boundaries: { breaches: 0, notes: '' } }, findings: [], timeSaved: { minutes: 0, confidence: 'low' }, voice: '' };
const row = (id, status, finding = -1) => ({ id, status, evidence: `#1 ${status}`, finding });
const priorRecord = ids => ({ endedBy: 'done', setup: [], facts: {}, steps: [], prior: ids.map(id => ({ id, title: id, expected: '', got: '', evidence: [] })) });
const CTX = { character: { sim: { id: 'x' } }, journey: 'J0', rubric: '' };
const IDS = ['P-1', 'P-2', 'P-3'];
const judgedAs = rec => async prior => { judgeReplies.push({ ...JUDGED, ...(prior === undefined ? {} : { prior }) }); return D().judgeJourney(rec, CTX); };
const statusesOf = (ids, jd) => Object.fromEntries(Object.entries(R().priorStatuses(ids, jd.prior, { endedBy: 'done' })).map(([k, v]) => [k, v.status]));
test('case 7a (guard): a well-formed prior[] answer, one row per id, is taken as it stands', async () => {
  const rec = priorRecord(IDS), jd = await judgedAs(rec)([row('P-1', 'not-seen'), row('P-2', 'recurs', 0), row('P-3', 'not-evaluable')]);
  assert.deepEqual(statusesOf(IDS, jd), { 'P-1': 'not-seen', 'P-2': 'recurs', 'P-3': 'not-evaluable' });
  assert.equal(R().priorStatuses(IDS, jd.prior)['P-2'].finding, 0);
  assert.equal(D().judgeRequest(rec, CTX).schema.properties.prior.minItems, 3, 'codex is asked for one row per id');
  assert.equal(D().judgeRequest(rec, CTX).schema.properties.prior.maxItems, 3);
});
test('case 7: prior[] is checked in code: a missing, duplicated or unknown id, or no array at all, is not-evaluable for that id and never throws the pair', async () => {
  const ids = IDS, rec = priorRecord(ids), judged = judgedAs(rec), statuses = jd => statusesOf(ids, jd);

  // a missing id: that id is not-evaluable, the rest stand
  assert.deepEqual(statuses(await judged([row('P-1', 'not-seen'), row('P-2', 'recurs', 0)])), { 'P-1': 'not-seen', 'P-2': 'recurs', 'P-3': 'not-evaluable' });
  // a duplicated id: answered twice is not answered once, so it proves nothing either way
  assert.deepEqual(statuses(await judged([row('P-1', 'recurs', 0), row('P-1', 'not-seen'), row('P-2', 'not-seen'), row('P-3', 'not-seen')])), { 'P-1': 'not-evaluable', 'P-2': 'not-seen', 'P-3': 'not-seen' });
  // an id the judge was never shown is dropped, and stamps nothing
  const extra = R().priorStatuses(ids, (await judged([row('P-1', 'not-seen'), row('P-2', 'not-seen'), row('P-3', 'recurs', 0), row('P-9', 'not-seen')])).prior, { endedBy: 'done' });
  assert.deepEqual(Object.keys(extra).sort(), ids);
  // no prior[] at all, or not an array: every id is not-evaluable
  for (const bad of [undefined, { id: 'P-1', status: 'not-seen' }, 'P-1 not-seen', null]) {
    assert.deepEqual(statuses(await judged(bad)), { 'P-1': 'not-evaluable', 'P-2': 'not-evaluable', 'P-3': 'not-evaluable' }, `prior ${JSON.stringify(bad)}`);
  }
  // a row with a status outside the three, or a non-integer finding
  const odd = R().priorStatuses(ids, [row('P-1', 'fixed'), { id: 'P-2', status: 'recurs', evidence: 3, finding: '0' }, row('P-3', 'not-seen')], { endedBy: 'done' });
  assert.equal(odd['P-1'].status, 'not-evaluable'); assert.equal(odd['P-2'].status, 'recurs'); assert.equal(odd['P-2'].finding, -1); assert.equal(odd['P-3'].status, 'not-seen');
});
test('case 7b: a duplicated recurs row cannot carry one prior finding forward twice in the rerun\'s findings.json', async () => {
  const dir = path.join(tmp, `dup-${crypto.randomUUID().slice(0, 8)}`); fs.mkdirSync(dir, { recursive: true });
  const rec = priorRecord(['P-1']);
  rec.prior[0].recurrence = 1;
  judgeReplies.push({ ...JUDGED, findings: [stubFinding({ title: 'one' }), stubFinding({ title: 'two' })], prior: [row('P-1', 'recurs', 0), row('P-1', 'recurs', 1)] });
  rec.judge = await D().judgeJourney(rec, CTX);
  const result = { character: 'x', name: 'X', trueBand: 'A1', engine: 'stub', journeys: [{ ...rec, id: 'J0', ms: 0 }], calls: {} };
  await D().synthesize(dir, 'dup', [result], [], 0);
  const fresh = readJson(path.join(dir, 'findings.json'));
  assert.equal(fresh.length, 2);
  assert.equal(fresh.filter(f => f.recurs).length, 0, 'P-1 answered twice is not-evaluable, so neither fresh finding restates it');
});
