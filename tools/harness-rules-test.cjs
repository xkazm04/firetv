/**
 * The rules runner (tools/run-rules.cjs) proven on fixture suites written into an os.mkdtemp folder and run with
 * --list: what is green, and every way a suite is red (a failing assertion, a crash, an early process.exit(0), no
 * tests, a missing file, a timeout), that a red suite never stops the ones after it, and that a bad list is refused
 * before anything runs. Pure: no network, no model. Run with npm test in desk/ (directly: node tools/harness-rules-test.cjs).
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test, after } = require('node:test');

const RUNNER = path.join(__dirname, 'run-rules.cjs');
const DESK = path.resolve(__dirname, '../desk');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rules-runner-'));

// A fixture suite is written next to the list; the list names it by an absolute-from-tools relative path.
const rel = f => path.relative(__dirname, path.join(dir, f)).split(path.sep).join('/');
const write = (f, body) => { fs.writeFileSync(path.join(dir, f), body); return rel(f); };
const GREEN = "require('node:test').test('ok',()=>{require('node:assert').equal(1,1);});";
const FAIL = "require('node:test').test('bad',()=>{require('node:assert').equal(1,2);});";
const CRASH = "throw new Error('boom at the top');";
const EARLY = "console.log('hello');process.exit(0);";
const EMPTY = "console.log('a suite with no tests');";
const SLOW = "require('node:test').test('slow',async()=>{await new Promise(r=>setTimeout(r,20000));});";

function run(list, env = {}) {
  const lf = path.join(dir, `list-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(lf, JSON.stringify(list));
  const r = spawnSync(process.execPath, [RUNNER, '--list', lf], { cwd: DESK, encoding: 'utf8', env: { ...process.env, ...env } });
  return { code: r.status, out: r.stdout + r.stderr };
}
const tableLine = (out, name) => out.split('\n').find(l => l.startsWith(name) && /\b(green|RED)\b/.test(l)) || '';

test('an all-green list exits 0', () => {
  const r = run([write('g1.cjs', GREEN), write('g2.cjs', GREEN)]);
  assert.equal(r.code, 0, r.out);
  assert.match(tableLine(r.out, rel('g1.cjs')), /green/);
  assert.match(r.out, /totals: 2 green, 0 red; tests 2, pass 2/);
});

test('a failing assertion exits 1, is named in the table, and the suite after it still ran', () => {
  const r = run([write('f-first.cjs', FAIL), write('f-after.cjs', GREEN)]);
  assert.equal(r.code, 1);
  assert.match(tableLine(r.out, rel('f-first.cjs')), /RED/);
  assert.match(tableLine(r.out, rel('f-after.cjs')), /green/);
  assert.match(r.out, /RED: .*f-first\.cjs/);
});

test('a top-level throw (a crash) exits 1 and the suite after it still ran', () => {
  const r = run([write('c-crash.cjs', CRASH), write('c-after.cjs', GREEN)]);
  assert.equal(r.code, 1);
  assert.match(tableLine(r.out, rel('c-crash.cjs')), /RED/);
  assert.match(tableLine(r.out, rel('c-after.cjs')), /green/);
});

test('a suite that calls process.exit(0) before any summary exits 1', () => {
  const r = run([write('e-early.cjs', EARLY), write('e-after.cjs', GREEN)]);
  assert.equal(r.code, 1);
  assert.match(tableLine(r.out, rel('e-early.cjs')), /RED.*no summary/);
  assert.match(tableLine(r.out, rel('e-after.cjs')), /green/);
});

test('a suite with 0 tests exits 1', () => {
  const r = run([write('z-empty.cjs', EMPTY)]);
  assert.equal(r.code, 1);
  assert.match(tableLine(r.out, rel('z-empty.cjs')), /RED/);
});

test('a missing file exits 1 and the suite after it still ran', () => {
  const r = run(['no-such-suite-anywhere.cjs', write('m-after.cjs', GREEN)]);
  assert.equal(r.code, 1);
  assert.match(tableLine(r.out, 'no-such-suite-anywhere.cjs'), /RED.*missing file/);
  assert.match(tableLine(r.out, rel('m-after.cjs')), /green/);
});

test('a suite past RULES_SUITE_TIMEOUT_MS is killed and is red', () => {
  const r = run([write('t-slow.cjs', SLOW), write('t-after.cjs', GREEN)], { RULES_SUITE_TIMEOUT_MS: '1500' });
  assert.equal(r.code, 1);
  assert.match(tableLine(r.out, rel('t-slow.cjs')), /RED.*timeout/);
  assert.match(tableLine(r.out, rel('t-after.cjs')), /green/);
});

test('a duplicate, an empty list and a missing list are refused before anything runs', () => {
  const g = write('d-green.cjs', GREEN);
  const dup = run([g, g]);
  assert.equal(dup.code, 1);
  assert.match(dup.out, /twice/);
  assert.doesNotMatch(dup.out, /# run-rules: .*d-green/);
  assert.equal(run([]).code, 1);
  const none = spawnSync(process.execPath, [RUNNER, '--list', path.join(dir, 'absent.json')], { cwd: DESK, encoding: 'utf8' });
  assert.equal(none.status, 1);
});

test('the real list in desk/package.json has 63+ unique suites, each a file, with this suite last', () => {
  const list = JSON.parse(fs.readFileSync(path.join(DESK, 'package.json'), 'utf8')).rulesSuites;
  assert.equal(new Set(list).size, list.length);
  for (const s of list) assert.ok(fs.existsSync(path.join(__dirname, s)), s);
  assert.equal(list[list.length - 1], 'harness-rules-test.cjs');
});

after(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} });
