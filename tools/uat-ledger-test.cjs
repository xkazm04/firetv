/**
 * One open ledger across every LT run (uat/driver/ledger.cjs) and the two commands it drives: `linga-text.cjs --status`
 * (what is open now, by Character x journey, with how long each row has gone unasked; no model call) and
 * `--recertify` with no run (every pair with an open row, each judge answering all of that pair's open rows across
 * runs, the answers stamped into the run that owns each row). `--recertify <run>` stays exactly as it is.
 * Run with npm test in desk/ (directly: node tools/uat-ledger-test.cjs).
 *
 * Reads the committed runs under uat/runs/ as fixtures and never writes there: every write goes to a copy in the OS
 * temp dir, and the suite asserts the committed tree is byte-identical at the end (no OPEN.md appears in it either).
 * No model call: the tutor is stubbed at the registry, the driver's claude seam is replaced (the judge answers
 * from a queue through the engine's own shape rule; anything else throws), claudeCli.run throws, and the one
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
const calls = { tutor: 0, claude: 0 }, judgeReplies = [], seen = [];
const registry = require(path.join(root, 'src/lib/engines/registry.ts'));
registry.useProvider('text', { name: 'stub', run: async () => { calls.tutor++; throw new Error('no tutor call in this suite'); } });
const claudeText = require(path.join(root, 'src/lib/engines/text.ts'));
claudeText.claudeCli.run = async () => { throw new Error('claude must never be launched by this suite'); };
const shape = require(path.join(root, 'src/lib/engines/shape.ts'));
require(DRIVER).claude.call = async req => {
  calls.claude++; seen.push(req);
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
  for (const run of fs.readdirSync(RUNS).filter(d => d.startsWith('2026-09-15-'))) {   // the five codex-era fixtures; a later run (the claude-era smoke) is not one of them
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
  assert.deepEqual(D().parseArgs(['--recertify', 'tomas-9'], { runs, characters: ids }), { mode: 'ledger', only: ['tomas-9'], runs, journeys: null, run: null, recertify: null, parallel: 3 });
  assert.deepEqual(D().parseArgs(['--recertify', BEGINNERS, 'tomas-9'], { runs, characters: ids }), { mode: 'recertify', only: ['tomas-9'], runs, journeys: null, run: null, recertify: BEGINNERS, parallel: 3 });
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

  // the command, in process with the claude seam counting: no model call, OPEN.md beside the runs
  const n = calls.claude, out = D().statusCommand({ runs });
  assert.equal(calls.claude, n, 'no model call');
  assert.equal(out.file, path.join(runs, 'OPEN.md'));
  assert.equal(fs.readFileSync(out.file, 'utf8'), md);
  // and from the command line, with no PATH so no claude could start
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

// ================================================================ the product each run saw (uat/driver/product.cjs)
// The ledger says whether the product a finding was seen on has changed: from the run's own stamp (run.json
// `product`), else from the git commit that first added its findings.json. Never a model call; temp git repos only.
const REPO = path.resolve(__dirname, '..'), PRODUCT = path.join(UAT, 'driver/product.cjs');
const P = () => require(PRODUCT);
const { execFileSync } = require('node:child_process');
const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.autocrlf=false', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' }).trim();
function tempRepo() {
  const dir = fs.mkdtempSync(path.join(tmp, 'repo-'));
  git(dir, 'init', '-q');
  return dir;
}
const put = (repo, rel, text) => { const p = path.join(repo, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); };
const commitAll = (repo, msg) => { git(repo, 'add', '-A'); git(repo, 'commit', '-q', '-m', msg); return git(repo, 'rev-parse', 'HEAD'); };
const finding = patch => ({ id: 'F-1', type: 'quality-gap', character: 'tomas-9', journey: 'J3', severity: 'major', rank: 12, title: 'a gap', resolution: 'open', recurrence: 1, ...patch });
const writeRun = (runsDir, name, rows, runJson) => {
  const d = path.join(runsDir, name); fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'findings.json'), JSON.stringify(rows));
  if (runJson) fs.writeFileSync(path.join(d, 'run.json'), JSON.stringify(runJson));
};
const STUBS = ['desk/src/a.ts', 'desk/src/b.ts', 'desk/src/c.ts'];

test('product case 1: surface() lists the desk/src files the driver loads, sorted and repo-relative, the same on a second call', () => {
  const files = P().surface();
  assert.ok(files.length >= 40, `${files.length} files`);
  for (const f of ['desk/src/lib/english/view.ts', 'desk/src/english/LingaPhone.tsx', 'desk/src/lib/english/placement.ts']) assert.ok(files.includes(f), f);
  assert.deepEqual(files, [...files].sort());
  assert.ok(files.every(f => f.startsWith('desk/src/') && !f.includes('\\')), 'repo-relative with forward slashes');
  assert.ok(files.every(f => !f.includes('node_modules') && !f.startsWith('desk/data')));
  assert.ok(files.every(f => fs.existsSync(path.join(REPO, f))));
  assert.deepEqual(P().surface(), files);
});

test('product case 2: stampOf() gives the HEAD commit and the git blob of every file; an edit makes it dirty and moves exactly that blob', () => {
  const repo = tempRepo();
  STUBS.forEach((f, i) => put(repo, f, `export const v${i} = ${i};\n`));
  const c1 = commitAll(repo, 'c1');
  const s1 = P().stampOf(repo, STUBS);
  assert.equal(s1.commit, c1);
  assert.equal(s1.dirty, false);
  assert.deepEqual(Object.keys(s1.files), STUBS);
  for (const f of STUBS) assert.equal(s1.files[f], git(repo, 'hash-object', f), f);
  put(repo, STUBS[1], 'export const v1 = 100;\n');
  const s2 = P().stampOf(repo, STUBS);
  assert.equal(s2.commit, c1);
  assert.equal(s2.dirty, true);
  assert.deepEqual(STUBS.filter(f => s2.files[f] !== s1.files[f]), [STUBS[1]]);
  assert.equal(s2.files[STUBS[1]], git(repo, 'hash-object', STUBS[1]));
});

test('product case 4: a run with no stamp is seen at the commit that first added its findings.json; changed lists the files edited since', () => {
  const repo = tempRepo(), runs = path.join(repo, 'uat/runs');
  STUBS.forEach((f, i) => put(repo, f, `export const v${i} = ${i};\n`));
  writeRun(runs, 'R', [finding()]);
  const c1 = commitAll(repo, 'c1');
  put(repo, STUBS[0], 'export const v0 = 10;\n'); put(repo, STUBS[2], 'export const v2 = 20;\n');
  const c2 = commitAll(repo, 'c2');
  const led = L().ledger(runs, { repo, files: STUBS });
  assert.equal(led.open.length, 1);
  assert.deepEqual(led.open[0].seen, { commit: c1, source: 'git' });
  assert.deepEqual([...led.open[0].changed].sort(), [STUBS[0], STUBS[2]]);
  assert.equal(led.open[0].productState, 'aged');
  assert.deepEqual(led.product.counts, { current: 0, aged: 1, unknown: 0 });
  // a gap whose newest row sits in a run stamped at HEAD is seen on the current product
  writeRun(runs, 'S', [finding({ id: 'F-2', journey: 'J4', title: 'a newer gap' })], { started: '2999-01-01T00:00:00.000Z', product: P().stampOf(repo, STUBS) });
  const led2 = L().ledger(runs, { repo, files: STUBS });
  const fresh = led2.open.find(g => g.title === 'a newer gap');
  assert.deepEqual(fresh.changed, []);
  assert.equal(fresh.productState, 'current');
  assert.equal(fresh.seen.commit, c2);
  assert.deepEqual(led2.product.counts, { current: 1, aged: 1, unknown: 0 });
});

test('product case 5: a stamped run is read without git; a run with no stamp and no history is unknown, never current', () => {
  const dir = path.join(tmp, `five-${crypto.randomUUID().slice(0, 8)}`), runs = path.join(dir, 'uat/runs');
  const current = { commit: 'beef', dirty: false, files: { 'desk/src/a.ts': 'x1', 'desk/src/b.ts': 'x2' } };
  writeRun(runs, 'A-stamped', [finding()], { started: '2026-10-01T00:00:00.000Z', product: { commit: 'c0ffee', dirty: false, files: { 'desk/src/a.ts': 'x1', 'desk/src/b.ts': 'old' } } });
  writeRun(runs, 'B-bare', [finding({ id: 'F-2', journey: 'J4', title: 'no record' })]);
  const asked = [];
  const stub = args => { asked.push(args[0]); if (args[0] === 'log') return ''; throw new Error(`git ${args[0]} must not be called`); };
  const led = L().ledger(runs, { repo: dir, git: stub, files: Object.keys(current.files), current });
  const a = led.open.find(g => g.title === 'a gap'), b = led.open.find(g => g.title === 'no record');
  assert.deepEqual(a.seen, { commit: 'c0ffee', source: 'run.json' });
  assert.deepEqual(a.changed, ['desk/src/b.ts']);
  assert.equal(b.seen, null);
  assert.equal(b.changed, null);
  assert.equal(b.productState, 'unknown');
  assert.deepEqual(asked, ['log'], 'only the unstamped run asked git, and only for its history');
  assert.deepEqual(led.product.counts, { current: 0, aged: 1, unknown: 1 });
  const md = L().statusOf(led);
  assert.ok(md.split('\n').includes('2 open: 0 seen on the current product, 1 seen before a product change, 1 unknown'), md.slice(0, 600));
  assert.ok(md.split('\n').find(l => l.includes('no record')).endsWith('product: unknown'));
});

test('product case 6: OPEN.md leads with the split and every aged row ends with how many of the files changed since; a stamped-at-HEAD row is current and carries no suffix', () => {
  const files = P().surface(), N = files.length;
  const current = { commit: 'c'.repeat(40), dirty: false, files: Object.fromEntries(files.map((f, i) => [f, `${String(i).padStart(40, '0')}`])) };
  const SAME = 3; // three files are byte-identical to the 15 Sep ones
  const old = f => files.indexOf(f) < SAME ? current.files[f] : `old${files.indexOf(f)}`.padEnd(40, '0');
  const asked = [];
  const stub = args => {
    asked.push(args[0]);
    if (args[0] === 'log') return 'a'.repeat(40);
    if (args[0] === 'ls-tree') return files.map(f => `100644 blob ${old(f)}\t${f}`).join('\n');
    throw new Error(`git ${args[0]}`);
  };
  const opts = { repo: REPO, git: stub, files, current };
  const runs = copyRuns();
  const led = L().ledger(runs, opts), md = L().statusOf(led);
  const lines = md.split('\n');
  assert.ok(lines.includes('186 open in 36 pairs across 5 runs'), 'the existing header stays');
  assert.ok(lines.includes('186 open: 0 seen on the current product, 186 seen before a product change'), md.slice(0, 600));
  const rows = lines.filter(l => l.startsWith('- `'));
  assert.equal(rows.length, 186);
  for (const r of rows) assert.ok(r.endsWith(`product: ${N - SAME} of ${N} files changed since`), r);
  assert.ok(N >= 40);
  // a run stamped at HEAD: counted current, no suffix
  writeRun(runs, 'zz-now', [finding({ id: 'LT-now-J3-1', character: 'tomas-9', journey: 'J3', title: 'seen just now' })], { started: '2999-01-01T00:00:00.000Z', product: current });
  const md2 = L().statusOf(L().ledger(runs, opts)), lines2 = md2.split('\n');
  assert.ok(lines2.includes('187 open: 1 seen on the current product, 186 seen before a product change'), md2.slice(0, 600));
  const now = lines2.find(l => l.includes('seen just now'));
  assert.ok(now && !now.includes('product:'), now);
  // --status: files only, no model call, OPEN.md written beside the runs and carrying the split
  const n = calls.claude, out = D().statusCommand({ runs, product: opts });
  assert.equal(calls.claude, n, 'no model call');
  assert.equal(fs.readFileSync(out.file, 'utf8'), md2);
  assert.ok(asked.every(a => a === 'log' || a === 'ls-tree'));
});
