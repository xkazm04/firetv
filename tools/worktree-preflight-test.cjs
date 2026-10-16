/** The worktree preflight's tools/node_modules half (idea a3a934ac): tools/device-rules-test.cjs and the live harnesses
 * require ws and playwright from tools/node_modules, which a worktree does not have. The desk half is held by
 * kpi-measure-test.cjs. Every path below is inside a disposable scratch directory; the only links made point scratch at
 * scratch, and they are unlinked (never removed recursively) before scratch goes. Pure: no network, no model. */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
const { test, after } = require('node:test');
const preflight = require('./worktree-preflight.cjs');

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-tools-'));
const links = [];
const gone = l => { try { fs.lstatSync(l); return false; } catch { return true; } };
after(() => {
  for (const l of links.reverse()) { try { fs.unlinkSync(l); } catch { try { fs.rmdirSync(l); } catch { /* reported below */ } } }
  if (links.some(l => !gone(l))) { console.error(`worktree-preflight-test: a link is still in ${scratch}; scratch left in place`); return; }
  fs.rmSync(scratch, { recursive: true, force: true });
});
const pkg = (modules, name) => { fs.mkdirSync(path.join(modules, name), { recursive: true }); fs.writeFileSync(path.join(modules, name, 'package.json'), `{"name":"${name}"}`); };
/** A checkout with desk/ and tools/; packages names what its tools/node_modules holds, null for none at all. */
const checkout = (name, packages = null, desk = true) => {
  const dir = path.join(scratch, name), modules = path.join(dir, 'tools/node_modules');
  fs.mkdirSync(path.join(dir, 'tools'), { recursive: true });
  if (packages) for (const p of packages) pkg(modules, p); else if (packages !== null) fs.mkdirSync(modules, { recursive: true });
  if (desk) pkg(path.join(dir, 'desk/node_modules'), 'typescript');
  return { dir, modules };
};
const never = () => { throw new Error('the preflight linked over an install that was already there'); };
const said = () => { const lines = []; return { lines, log: m => lines.push(m), error: m => lines.push(m) }; };
const tools = o => preflight.ensure({ env: {}, main: null, levels: 1, area: 'tools', ...o });

test('a donor needs both ws and playwright: one of them is no donor', () => {
  const half = checkout('donor-half', ['ws']), whole = checkout('donor-whole', ['playwright', 'ws']);
  assert.equal(preflight.usableTools(half.modules), false);
  assert.equal(preflight.usableTools(whole.modules), true);
  const donor = preflight.findDonor({ env: {}, checkout: checkout('wt-needing-tools').dir, main: null, levels: 1, area: 'tools' });
  assert.equal(donor.modules, whole.modules, 'the half install comes first alphabetically and must be passed over');
});

test('a missing tools/node_modules is linked to the donor, with the same unlink-first warning as desk', () => {
  const wt = checkout('wt-to-link');
  const r = tools({ checkout: wt.dir });
  links.push(wt.modules);
  assert.equal(r.action, 'linked'); assert.equal(r.area, 'tools');
  assert.equal(fs.lstatSync(wt.modules).isSymbolicLink(), true, 'a link, not a copy');
  assert.equal(fs.realpathSync(wt.modules), fs.realpathSync(r.donor.modules));
  assert.equal(preflight.usableTools(wt.modules), true, 'ws and playwright resolve through it');
  const o = said(); assert.equal(preflight.run(r, o), 0);
  assert.equal(o.lines.length, 1, 'one line, not a stack'); assert.match(o.lines[0], /^tools\/node_modules was missing — linked it to /);
  assert.match(o.lines[0], /Unlink it before removing this worktree: `git worktree remove --force` follows the link and empties /);
  assert.equal(tools({ checkout: wt.dir, link: never }).action, 'present', 'a second run is a no-op');
});

test('a real tools/node_modules is never touched, whatever it holds', () => {
  const own = checkout('wt-own-complete', ['ws', 'playwright']), partial = checkout('wt-own-partial', ['ws']);
  const a = tools({ checkout: own.dir, link: never }), b = tools({ checkout: partial.dir, link: never });
  assert.equal(a.action, 'present'); const o = said(); assert.equal(preflight.run(a, o), 0); assert.deepEqual(o.lines, []);
  assert.equal(b.action, 'blocked', 'a real install short of a package is reported, not replaced');
  assert.equal(fs.lstatSync(partial.modules).isSymbolicLink(), false);
  assert.equal(fs.readFileSync(path.join(partial.modules, 'ws/package.json'), 'utf8'), '{"name":"ws"}');
});

test('an empty tools/node_modules directory is cleared out of the way for the link', () => {
  const wt = checkout('wt-empty-dir', []);
  const r = tools({ checkout: wt.dir }); links.push(wt.modules);
  assert.equal(r.action, 'linked'); assert.equal(fs.lstatSync(wt.modules).isSymbolicLink(), true);
});

test('TOOLS_NODE_MODULES is the answer when set, and an unusable one does not fall through to a sibling', () => {
  const donor = checkout('donor-for-env', ['ws', 'playwright']);
  assert.equal(tools({ env: { TOOLS_NODE_MODULES: donor.modules }, checkout: checkout('wt-env-ok').dir, link: (from, to) => { links.push(to); fs.symlinkSync(from, to, process.platform === 'win32' ? 'junction' : 'dir'); } }).donor.source, 'TOOLS_NODE_MODULES');
  const none = tools({ env: { TOOLS_NODE_MODULES: path.join(scratch, 'nowhere/node_modules') }, checkout: checkout('wt-env-bad').dir });
  assert.equal(none.action, 'unavailable'); assert.match(none.reason, /TOOLS_NODE_MODULES .* has no ws and playwright in it/);
});

test('no donor is a warning and never a failed desk gate', () => {
  const wt = checkout('wt-alone');
  const r = tools({ checkout: wt.dir, levels: 0 });
  const o = said(); assert.equal(r.action, 'unavailable');
  assert.equal(preflight.run(r, o), 0, 'tools/ missing must not turn the desk gate red');
  assert.equal(o.lines.length, 1); assert.match(o.lines[0], /^tools\/node_modules cannot run device-rules-test/);
  assert.match(r.reason, /no worktree of this repository has a tools\/node_modules with ws and playwright in it/);
});

test('the desk half is unchanged: its donors are desk/node_modules, its reason still names typescript, and it still fails', () => {
  const wt = checkout('wt-desk-missing', ['ws', 'playwright'], false);
  const r = preflight.ensure({ env: {}, checkout: wt.dir, main: null, levels: 0 });
  assert.equal(r.action, 'unavailable'); assert.match(r.reason, /no worktree of this repository has a desk\/node_modules with typescript in it \(DESK_NODE_MODULES/);
  assert.equal(preflight.run(r, said()), 1);
});
