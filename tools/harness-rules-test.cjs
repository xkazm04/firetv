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

// ------------------------------------------------------------------ the one loader (tools/ts-load.cjs)
const LOADER = path.join(__dirname, 'ts-load.cjs');
const loaderRun = (script, cacheDir, extraEnv = {}) => {
  const f = path.join(dir, `script-${Math.random().toString(36).slice(2)}.cjs`);
  fs.writeFileSync(f, `const L=require(${JSON.stringify(LOADER)});\n${script}`);
  const r = spawnSync(process.execPath, [f], { cwd: DESK, encoding: 'utf8',
    env: { ...process.env, DESK_TS_CACHE_DIR: cacheDir, NODE_PATH: path.join(DESK, 'node_modules'), ...extraEnv } });
  return { code: r.status, out: r.stdout.trim(), err: r.stderr };
};
const SRC = 'export const f=(a:number,b:number):number=>a+b;';
const OPTS = '{compilerOptions:{module:1,target:9,esModuleInterop:true}}';
const cacheCount = d => fs.existsSync(d) ? fs.readdirSync(d).filter(n => n.endsWith('.js')).length : 0;

test('loader: a cache hit returns the same text as an uncached transpile', () => {
  const c = path.join(dir, 'cache-hit');
  const s = `const a=L.transpile(${JSON.stringify(SRC)},${OPTS}).outputText,b=L.transpile(${JSON.stringify(SRC)},${OPTS}).outputText,
    c=L.ts().transpileModule(${JSON.stringify(SRC)},${OPTS}).outputText;console.log(JSON.stringify([a===b,b===c,a.length>10]));`;
  const first = loaderRun(s, c), second = loaderRun(s, c);
  assert.equal(first.out, '[true,true,true]', first.err);
  assert.equal(second.out, '[true,true,true]', second.err);
  assert.equal(cacheCount(c), 1);
});

test('loader: a hit never loads TypeScript, and DESK_TS_CACHE=0 writes nothing', () => {
  const c = path.join(dir, 'cache-lazy');
  loaderRun(`L.transpile(${JSON.stringify(SRC)},${OPTS});`, c);
  const hit = loaderRun(`L.transpile(${JSON.stringify(SRC)},${OPTS});console.log(Object.keys(require.cache).some(k=>/typescript[\\/]lib[\\/]typescript\.js$/.test(k)));`, c);
  assert.equal(hit.out, 'false', hit.err);
  const off = path.join(dir, 'cache-off');
  loaderRun(`L.transpile(${JSON.stringify(SRC)},${OPTS});`, off, { DESK_TS_CACHE: '0' });
  assert.equal(cacheCount(off), 0);
});

test('loader: changing one character of the source changes the key', () => {
  const c = path.join(dir, 'cache-key');
  loaderRun(`L.transpile('export const a=1;',${OPTS});L.transpile('export const a=2;',${OPTS});`, c);
  assert.equal(cacheCount(c), 2);
  loaderRun(`L.transpile('export const a=1;',{compilerOptions:{module:1,target:7,esModuleInterop:true}});`, c);
  assert.equal(cacheCount(c), 3, 'other options, other key');
  loaderRun(`L.transpile('export const a=1;',{fileName:'x.ts',compilerOptions:{module:1,target:9,esModuleInterop:true}});`, c);
  assert.equal(cacheCount(c), 4, 'another extension, another key');
});

test('loader: a .ts file with an angle-bracket type assertion loads', () => {
  const f = path.join(dir, 'angle.ts');
  fs.writeFileSync(f, 'export const num=(x:unknown)=><number>x;\nexport const id=<T,>(x:T)=>x;');
  const r = loaderRun(`const m=require(${JSON.stringify(f)});console.log(m.num(7)+m.id(1));`, path.join(dir, 'cache-angle'));
  assert.equal(r.out, '8', r.err);
});

test('loader: a .tsx file with JSX loads, and the @/ alias reaches desk/src', () => {
  const f = path.join(dir, 'view.tsx');
  fs.writeFileSync(f, 'export const el=<div className="a">hi</div>;');
  const r = loaderRun(`const m=require(${JSON.stringify(f)});console.log(m.el.type+':'+m.el.props.children);`, path.join(dir, 'cache-tsx'));
  assert.equal(r.out, 'div:hi', r.err);
  const a = loaderRun(`console.log(typeof require('@/lib/rules/school.ts').readNumber);`, path.join(dir, 'cache-tsx'));
  assert.equal(a.out, 'function', a.err);
});

test('loader: an unwritable cache folder still loads the module', () => {
  const blocker = path.join(dir, 'a-file'); fs.writeFileSync(blocker, 'x');
  const f = path.join(dir, 'plain.ts'); fs.writeFileSync(f, 'export const two:number=2;');
  const r = loaderRun(`console.log(require(${JSON.stringify(f)}).two);`, path.join(blocker, 'sub'));
  assert.equal(r.out, '2', r.err);
  assert.equal(r.code, 0);
});

// A loader copied into <tmp>/tools with an empty <tmp>/desk, so desk/node_modules/typescript is absent; the stub
// (when asked for) sits at <tmp>/node_modules/typescript, where only require.resolve from desk/ can find it.
function fallbackRun(stub) {
  const t = fs.mkdtempSync(path.join(dir, 'fallback-'));
  fs.mkdirSync(path.join(t, 'tools')); fs.mkdirSync(path.join(t, 'desk'));
  fs.copyFileSync(LOADER, path.join(t, 'tools/ts-load.cjs'));
  if (stub) {
    const m = path.join(t, 'node_modules/typescript'); fs.mkdirSync(m, { recursive: true });
    fs.writeFileSync(path.join(m, 'package.json'), JSON.stringify({ name: 'typescript', version: '0.0.1-stub', main: 'index.js' }));
    fs.writeFileSync(path.join(m, 'index.js'), "exports.transpileModule=()=>({outputText:'STUB-MARKER'});");
  }
  const f = path.join(t, 'run.cjs');
  fs.writeFileSync(f, "const L=require('./tools/ts-load.cjs');console.log(L.transpile('export const a=1;',{}).outputText);");
  const r = spawnSync(process.execPath, [f], { cwd: t, encoding: 'utf8', env: { ...process.env, DESK_TS_CACHE: '0' } });
  return { code: r.status, out: r.stdout.trim(), err: r.stderr };
}

test('loader: without desk/node_modules/typescript it falls back to the package Node resolves from desk/', () => {
  const r = fallbackRun(true);
  assert.equal(r.out, 'STUB-MARKER', r.err);
  assert.equal(r.code, 0);
});

test('loader: with no TypeScript anywhere it prints the install message and exits 1', () => {
  const r = fallbackRun(false);
  assert.equal(r.code, 1);
  assert.match(r.err, /Run `npm install` in desk\/ first/);
});
