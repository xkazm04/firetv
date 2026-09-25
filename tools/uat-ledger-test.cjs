/**
 * One open ledger across every LT run (uat/driver/ledger.cjs) and the two commands it drives: `linga-text.cjs --status`
 * (what is open now, by Character x journey, with how long each row has gone unasked; no model call) and
 * `--recertify` with no run (every pair with an open row, each judge answering all of that pair's open rows across
 * runs, the answers stamped into the run that owns each row). `--recertify <run>` stays exactly as it is.
 * Run with npm test in desk/ (directly: node tools/uat-ledger-test.cjs).
 *
 * Reads the committed runs under uat/runs/ as fixtures and never writes there: every write goes to a copy in the OS
 * temp dir, and the suite asserts the committed tree is byte-identical at the end (no OPEN.md appears in it either).
 * No model call: the tutor is stubbed at the registry, codexText is replaced in the require cache (the judge answers
 * from a queue through the engine's own shape rule; anything else throws), the codex launcher throws, and the one
 * spawned CLI runs with an empty PATH.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk'), UAT = path.resolve(__dirname, '../uat'), RUNS = path.join(UAT, 'runs');
const LEDGER = path.join(UAT, 'driver/ledger.cjs'), RECERTIFY = path.join(UAT, 'driver/recertify.cjs'), DRIVER = path.join(UAT, 'driver/linga-text.cjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uat-ledger-'));
process.env.DESK_DATA_DIR = path.join(tmp, 'desk-data');

// the committed tree, every file under uat/runs/ except the gitignored data/ and logs/, hashed now and at the end
const digest = () => {
  const h = crypto.createHash('sha256');
  const walk = (d, rel) => {
    for (const f of fs.readdirSync(d).sort()) {
      const p = path.join(d, f), r = rel ? `${rel}/${f}` : f;
      if (fs.statSync(p).isDirectory()) { if (f !== 'data' && f !== 'logs') walk(p, r); }
      else h.update(`${r}\0`).update(fs.readFileSync(p));
    }
  };
  walk(RUNS, '');
  return h.digest('hex');
};
const before = digest();

require(path.join(UAT, 'driver/surface.cjs')).install();
const calls = { tutor: 0, codex: 0 }, judgeReplies = [], seen = [];
const registry = require(path.join(root, 'src/lib/engines/registry.ts'));
registry.useProvider('text', { name: 'stub', run: async () => { calls.tutor++; throw new Error('no tutor call in this suite'); } });
const codex = require(path.join(root, 'src/lib/engines/codex.ts'));
codex.codexCli.run = async () => { throw new Error('codex must never be launched by this suite'); };
const shape = require(path.join(root, 'src/lib/engines/shape.ts'));
codex.codexText = async req => {
  calls.codex++; seen.push(req);
  if (req.schema?.required?.includes('verdict') && judgeReplies.length) { const reply = judgeReplies.shift(); return shape.answer({ name: 'stub', run: async () => ({ raw: JSON.stringify(reply), provider: 'stub' }) }, req); }
  throw new Error('stub: no model call in this suite');
};
after(() => {
  clearInterval(globalThis.__desk?.ticker); registry.resetProviders();
  fs.rmSync(tmp, { recursive: true, force: true });
  assert.equal(calls.tutor, 0, 'no tutor call');
  assert.equal(fs.existsSync(path.join(RUNS, 'OPEN.md')), false, 'no OPEN.md written into the committed runs');
  assert.equal(digest(), before, 'the committed runs under uat/runs/ are unchanged');
});

const L = () => require(LEDGER), R = () => require(RECERTIFY), D = () => require(DRIVER);
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const LT = '2026-09-15-lt', J1B = '2026-09-15-lt-j1b', RECERT = '2026-09-15-lt-recert', BEGINNERS = '2026-09-15-lt-recert2-beginners', GOAL = '2026-09-15-lt-recert2-goal';
const FIVE = [LT, J1B, RECERT, BEGINNERS, GOAL];
/** A copy of every committed run's top-level files, under the same run names, in the OS temp dir. */
function copyRuns() {
  const dst = path.join(tmp, `runs-${crypto.randomUUID().slice(0, 8)}`);
  for (const run of fs.readdirSync(RUNS)) {
    const src = path.join(RUNS, run);
    if (!fs.statSync(src).isDirectory()) continue;
    fs.mkdirSync(path.join(dst, run), { recursive: true });
    for (const f of fs.readdirSync(src)) { const p = path.join(src, f); if (fs.statSync(p).isFile()) fs.copyFileSync(p, path.join(dst, run, f)); }
  }
  return dst;
}
const pairCount = pairs => Object.values(pairs).reduce((n, js) => n + js.length, 0);
const countBy = (xs, key) => xs.reduce((m, x) => ({ ...m, [key(x)]: (m[key(x)] ?? 0) + 1 }), {});
const isOpen = f => f.type !== 'strength' && f.resolution === 'open';

// ---- case 1
test('case 1: ledger() folds the five runs into 360 rows, 186 open, each with a distinct run-qualified id', () => {
  const runs = copyRuns(), led = L().ledger(runs);
  assert.deepEqual(led.runs.map(r => r.id), FIVE);
  assert.equal(led.rows.length, 360);
  const open = led.rows.filter(isOpen);
  assert.equal(open.length, 186);
  for (const r of open) assert.equal(r.gid, `${r.run}/${r.id}`);
  assert.equal(new Set(open.map(r => r.gid)).size, 186, 'every open global id is distinct');
  // the local ids are positional: 114 distinct, 51 of them naming a different finding in more than one run
  const byLocal = open.reduce((m, r) => m.set(r.id, [...(m.get(r.id) ?? []), r]), new Map());
  assert.equal(byLocal.size, 114);
  assert.equal([...byLocal.values()].filter(rs => new Set(rs.map(r => r.run)).size > 1).length, 51);
  const petra = byLocal.get('LT-petra-38-J4-1');
  assert.deepEqual(petra.map(r => r.run).sort(), [LT, RECERT, BEGINNERS]);
  assert.equal(new Set(petra.map(r => r.title)).size, 3, 'one local id, three different findings');
  // with no recurs link anywhere, every open row is its own gap
  assert.equal(led.open.length, 186);
});

// ---- case 2
test('case 2: planLedger() gives 36 pairs over 10 Characters; tomas-9 J4 carries 13 open rows from three runs, one run\'s plan offers 4', () => {
  const runs = copyRuns(), p = R().planLedger(L().ledger(runs));
  assert.equal(pairCount(p.pairs), 36);
  assert.equal(Object.keys(p.pairs).length, 10);
  const tj4 = p.prior['tomas-9'].J4;
  assert.equal(tj4.length, 13);
  assert.deepEqual(countBy(tj4, r => r.run), { [LT]: 4, [RECERT]: 5, [BEGINNERS]: 4 });
  for (const r of tj4) assert.equal(r.id, `${r.run}/${r.id.slice(r.run.length + 1)}`, 'the judge is shown the global id');
  // the per-run plan of the newest run reaches 4 of the 13
  assert.ok(R().plan(path.join(runs, BEGINNERS))['tomas-9'].includes('J4'));
  const one = R().openFindings(path.join(runs, BEGINNERS), 'tomas-9', 'J4').map(f => `${BEGINNERS}/${f.id}`);
  assert.equal(one.length, 4);
  assert.ok(one.every(id => tj4.some(r => r.id === id)));
  // restricted to a cast, only that cast's pairs
  assert.deepEqual(Object.keys(R().planLedger(L().ledger(runs), { characters: ['tomas-9'] }).pairs), ['tomas-9']);
});

// ---- case 3
test('case 3: unasked counts the later runs of a row\'s pair whose judge was not shown it; runs are ordered by start, name, recert after parent', () => {
  const led = L().ledger(copyRuns());
  const gap = gid => led.gaps.find(g => g.gids.includes(gid));
  const recap = gap(`${LT}/LT-tomas-9-J3-3`);
  assert.match(recap.title, /recap records activity/);
  assert.equal(recap.unasked, 2);
  assert.equal(recap.unaskedSince, RECERT);
  const newest = led.open.filter(g => g.character === 'tomas-9' && g.journey === 'J3' && g.lastSeen === BEGINNERS);
  assert.ok(newest.length > 0);
  for (const g of newest) { assert.equal(g.unasked, 0, g.id); assert.equal(g.unaskedSince, null); }
  // the order: run.json started, else the directory name; a recert-<k> right after its parent
  const dir = path.join(tmp, `order-${crypto.randomUUID().slice(0, 8)}`);
  const mk = (rel, started) => { fs.mkdirSync(path.join(dir, rel), { recursive: true }); fs.writeFileSync(path.join(dir, rel, 'findings.json'), '[]'); if (started) fs.writeFileSync(path.join(dir, rel, 'run.json'), JSON.stringify({ started })); };
  mk('zeta', '2026-01-01T10:00:00.000Z'); mk('alpha', '2026-02-01T10:00:00.000Z');
  mk('zeta/recert-1', '2025-12-01T10:00:00.000Z'); mk('alpha/recert-1'); mk('alpha/recert-2', '2026-03-01T10:00:00.000Z');
  assert.deepEqual(L().ledger(dir).runs.map(r => r.id), ['zeta', 'zeta/recert-1', 'alpha', 'alpha/recert-1', 'alpha/recert-2']);
});

// ---- case 4: recertify from the ledger, tomas-9 J4 judged by the stub
function stubFinding(patch) {
  return { type: 'quality-gap', dimension: 'senior-quality', title: 'x', expected: 'x', got: 'x', evidence: '#3', frequency: 'med', reachability: 'med', trust_erosion: 'med', boundary: false, suggested_acceptance: 'x', code_hint: '', ...patch };
}
test('case 4: --recertify with no run asks the judge about all 13 of the pair\'s open rows and stamps each answer into the run that owns the row', async () => {
  // the command line: no run after --recertify is the ledger; a run after it is today's per-run recertify
  const runs = copyRuns(), ids = ['tomas-9', 'petra-38'];
  assert.deepEqual(D().parseArgs(['--recertify'], { runs, characters: ids }).mode, 'ledger');
  assert.deepEqual(D().parseArgs(['--recertify', 'tomas-9'], { runs, characters: ids }), { mode: 'ledger', only: ['tomas-9'], runs, journeys: null, run: null, recertify: null });
  assert.deepEqual(D().parseArgs(['--recertify', BEGINNERS, 'tomas-9'], { runs, characters: ids }), { mode: 'recertify', only: ['tomas-9'], runs, journeys: null, run: null, recertify: BEGINNERS });
  assert.equal(D().parseArgs(['--status', '--runs', runs], { characters: ids }).mode, 'status');

  const p = R().planLedger(L().ledger(runs), { characters: ['tomas-9'] }), shown = p.prior['tomas-9'].J4;
  assert.equal(p.home, [...new Set(Object.values(p.prior['tomas-9']).flat().map(r => r.run))].sort().at(-1), 'the rerun lives under the newest originating run');
  const slot = R().nextRerun(path.join(runs, p.home)), rerun = slot.dir;
  fs.mkdirSync(rerun, { recursive: true });
  const id = R().runId(rerun);
  assert.equal(id, `${p.home}/recert-1`);
  fs.writeFileSync(path.join(rerun, 'run.json'), JSON.stringify({ id, pairs: { 'tomas-9': ['J4'] }, ledger: { prior: { 'tomas-9': { J4: shown } } } }));

  const { judge, ...record } = readJson(path.join(RUNS, BEGINNERS, 'tomas-9.json')).journeys.find(j => j.id === 'J4');
  record.prior = shown;
  const A = `${LT}/LT-tomas-9-J4-1`, B = `${RECERT}/LT-tomas-9-J4-2`;
  judgeReplies.push({ ...judge, findings: [stubFinding({ title: 'The cue still stays the same when the question changes', evidence: '#6' })], prior: [
    { id: A, status: 'not-seen', evidence: '#9 he retries on his own and gets it', finding: -1 },
    { id: B, status: 'recurs', evidence: '#6 the same cue for a new question', finding: 0 },
  ] });
  const character = { sim: { id: 'tomas-9', name: 'Tomáš' } };
  record.judge = await D().judgeJourney(record, { character, journey: 'J4', rubric: '' });
  const req = seen.filter(r => r.schema?.required?.includes('verdict')).at(-1);
  const all = shown.map(r => r.id).sort();
  assert.equal(all.length, 13);
  assert.deepEqual(JSON.parse(req.prompt).prior.map(r => r.id).sort(), all);
  assert.deepEqual([...req.schema.properties.prior.items.properties.id.enum].sort(), all);
  assert.equal(req.schema.properties.prior.minItems, 13); assert.equal(req.schema.properties.prior.maxItems, 13);

  const result = { character: 'tomas-9', name: 'Tomáš', trueBand: 'A1', engine: 'stub', journeys: [record], calls: {} };
  fs.writeFileSync(path.join(rerun, 'tomas-9.json'), JSON.stringify(result));
  await D().synthesize(rerun, id, [result], [], 0);
  const out = R().finishLedger(rerun, { runs });
  assert.deepEqual([out.fixed, out.recurs, out.notEvaluable], [1, 1, 11]);

  const rowsOf = run => Object.fromEntries(readJson(path.join(runs, run, 'findings.json')).map(f => [f.id, f]));
  const a = rowsOf(LT)['LT-tomas-9-J4-1'], b = rowsOf(RECERT)['LT-tomas-9-J4-2'];
  assert.equal(a.resolution, 'fixed'); assert.match(a.recertify_evidence, /#9/);
  assert.equal(b.resolution, 'open'); assert.equal(b.recurrence, 2); assert.equal(b.recertify_status, 'recurs');
  // each row read back from its OWN run's findings.json
  const stamped = shown.map(r => ({ gid: r.id, run: r.run, f: rowsOf(r.run)[r.id.slice(r.run.length + 1)] }));
  assert.ok(stamped.every(s => s.f.recertify_run === id), 'every stamp names the rerun');
  const rest = stamped.filter(s => s.gid !== A && s.gid !== B);
  assert.equal(rest.length, 11);
  assert.ok(rest.every(s => s.f.recertify_status === 'not-evaluable' && s.f.resolution === 'open' && s.f.title === shown.find(r => r.id === s.gid).title));
  assert.deepEqual(countBy(rest, s => s.run), { [LT]: 3, [RECERT]: 4, [BEGINNERS]: 4 });
  // the rerun's restatement links to B by its global id, and the ledger folds the two into one gap
  const fresh = readJson(path.join(rerun, 'findings.json')).find(f => f.recurs);
  assert.equal(fresh.recurs, B);
  assert.equal(fresh.recurrence, 2);
  const again = R().planLedger(L().ledger(runs)).prior['tomas-9'].J4;
  assert.equal(again.length, 12);
  assert.equal(again.some(r => r.id === A), false);
  // the status is re-rendered beside the runs, and the per-run plan of an originating run no longer offers A
  assert.ok(fs.existsSync(out.file) && out.file === path.join(runs, 'OPEN.md'));
  assert.equal(R().openFindings(path.join(runs, LT), 'tomas-9', 'J4').some(f => f.id === 'LT-tomas-9-J4-1'), false);
});

// ---- case 5
test('case 5: a rerun finding carrying recurs <run>/<id> folds into one gap: recurrence 2, first and last seen, counted once', () => {
  const runs = copyRuns(), rerun = path.join(runs, GOAL, 'recert-1'), gid = `${BEGINNERS}/LT-tomas-9-J4-1`;
  fs.mkdirSync(rerun, { recursive: true });
  const was = readJson(path.join(runs, BEGINNERS, 'findings.json')).find(f => f.id === 'LT-tomas-9-J4-1');
  fs.writeFileSync(path.join(rerun, 'findings.json'), JSON.stringify([{ ...was, id: 'LT-tomas-9-J4-1', recurrence: 2, recurs: gid, title: `${was.title} (again)` }]));
  fs.writeFileSync(path.join(rerun, 'tomas-9.json'), JSON.stringify({ character: 'tomas-9', journeys: [{ id: 'J4', endedBy: 'done', steps: [], setup: [], facts: {}, prior: [{ id: gid }] }] }));
  const led = L().ledger(runs);
  assert.deepEqual(led.runs.map(r => r.id), [...FIVE, `${GOAL}/recert-1`]);
  const g = led.gaps.filter(x => x.gids.includes(gid));
  assert.equal(g.length, 1);
  assert.deepEqual(g[0].gids, [gid, `${GOAL}/recert-1/LT-tomas-9-J4-1`]);
  assert.equal(g[0].recurrence, 2);
  assert.equal(g[0].firstSeen, BEGINNERS);
  assert.equal(g[0].lastSeen, `${GOAL}/recert-1`);
  assert.equal(g[0].id, `${GOAL}/recert-1/LT-tomas-9-J4-1`, 'the gap is named by its newest row');
  assert.equal(led.open.length, 186, 'counted once in the open total');
  assert.equal(R().planLedger(led).prior['tomas-9'].J4.length, 13, 'and once in the pair');
  // the other rows of the pair were not shown to that rerun: each has now gone unasked once more
  assert.ok(led.open.filter(x => x.character === 'tomas-9' && x.journey === 'J4' && x !== g[0]).every(x => x.unasked >= 1));
});

// ---- case 6
test('case 6: statusOf() renders the operator view; --status prints it and writes OPEN.md with no model call', () => {
  const runs = copyRuns(), led = L().ledger(runs), md = L().statusOf(led);
  assert.ok(md.split('\n').includes('186 open in 36 pairs across 5 runs'), md.slice(0, 400));
  assert.ok(md.includes('node uat/driver/linga-text.cjs --recertify'));
  assert.ok(md.split('\n').includes('drained 0 of 5 runs'), 'no docs/uat-insights/<run>.md exists');
  const sections = md.split('\n').filter(l => l.startsWith('## '));
  assert.equal(sections.length, 36);
  const tops = sections.map(s => Number(s.match(/top rank (\d+)/)[1]));
  assert.deepEqual(tops, [...tops].sort((x, y) => y - x), 'ordered by highest rank');
  const rows = md.split('\n').filter(l => l.startsWith('- `'));
  assert.equal(rows.length, 186);
  for (const g of led.open) {
    const row = rows.find(l => l.startsWith(`- \`${g.id}\``));
    assert.ok(row, g.id);
    assert.ok(row.includes(g.severity) && row.includes(g.title), row);
    assert.equal(row.includes(`unasked since ${g.unaskedSince}`), g.unasked > 0, row);
  }
  assert.ok(rows.find(l => l.startsWith(`- \`${LT}/LT-tomas-9-J3-3\``)).includes(`unasked since ${RECERT}`));

  // the command, in process with codexText counting: no model call, OPEN.md beside the runs
  const n = calls.codex, out = D().statusCommand({ runs });
  assert.equal(calls.codex, n, 'no model call');
  assert.equal(out.file, path.join(runs, 'OPEN.md'));
  assert.equal(fs.readFileSync(out.file, 'utf8'), md);
  // and from the command line, with no PATH so no codex could start
  fs.rmSync(out.file);
  const empty = path.join(tmp, 'no-path'); fs.mkdirSync(empty, { recursive: true });
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.toUpperCase() !== 'PATH'));
  const cli = spawnSync(process.execPath, [DRIVER, '--status', '--runs', runs], { env: { ...env, PATH: empty }, encoding: 'utf8', timeout: 60000 });
  assert.equal(cli.status, 0, cli.stderr);
  assert.ok(cli.stdout.includes('186 open in 36 pairs across 5 runs'));
  assert.equal(fs.readFileSync(path.join(runs, 'OPEN.md'), 'utf8'), md);
});

// ---- case 7 (guard)
test('case 7 (guard): the per-run plan is unchanged - 7 pairs for the beginners run, 26 for -lt-recert', () => {
  assert.equal(pairCount(R().plan(BEGINNERS)), 7);
  assert.equal(pairCount(R().plan(RECERT)), 26);
});
