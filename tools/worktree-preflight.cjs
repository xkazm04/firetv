/**
 * Makes the gate runnable in a checkout that was provisioned without its node_modules — an autopilot worktree.
 * Runs as desk/'s `pretest`, before `npm test`. It changes nothing about what the gate checks: with usable installs
 * already there it prints nothing and exits 0. The gate needs two: desk/node_modules (tsc and the rules suites) and
 * tools/node_modules (Playwright, for the Math Buddy browser check). A missing one is linked to the same directory
 * of a checkout nearby (a junction on Windows, a directory symlink elsewhere), so modules resolve the way they do in
 * the operator's checkout. No donor, or a real directory in the way, is one line telling the human which `npm
 * install` to run and a non-zero exit — never an unreadable stack.
 * Read-only towards every donor: it creates a link, and never writes into or deletes anything it did not create.
 */
const fs = require("node:fs"), path = require("node:path"), { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");

/**
 * The installs the gate reads, each with the one package that proves it usable: desk's compiler, which tsc --noEmit
 * and the rules suites' transpiling both need, and tools' Playwright, which drives the browser check.
 */
const DESK = { dir: "desk", needs: "typescript", env: "DESK_NODE_MODULES" };
const TOOLS = { dir: "tools", needs: "playwright", env: "TOOLS_NODE_MODULES" };
const TARGETS = [DESK, TOOLS];

/** Does this node_modules carry the package its target needs? */
function usable(modules, target = DESK) {
  try { return fs.statSync(path.join(modules, target.needs, "package.json")).isFile(); } catch { return false; }
}
/** What is sitting at a node_modules: nothing, a link (ours or broken), an empty directory, or a real install. */
function occupant(dest) {
  let st;
  try { st = fs.lstatSync(dest); } catch { return { kind: "absent" }; }
  if (st.isSymbolicLink()) return { kind: "link" };
  if (!st.isDirectory()) return { kind: "file" };
  let entries = [];
  try { entries = fs.readdirSync(dest); } catch { return { kind: "directory", entries: -1 }; }
  return { kind: entries.length ? "directory" : "empty", entries: entries.length };
}
/** The main worktree is the operator's checkout; an autopilot worktree is cut from it and it is the likeliest donor. */
function mainCheckout(cwd = root) {
  const r = spawnSync("git", ["worktree", "list", "--porcelain"], { cwd, encoding: "utf8" });
  const m = r.status === 0 && (r.stdout || "").match(/^worktree (.+)$/m);
  return m ? path.resolve(m[1].trim()) : null;
}
const same = (a, b) => process.platform === "win32" ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b);

/**
 * Where a donor install could be, nearest first: the target's env override when set, then the main checkout, then
 * every sibling checkout of this one and of its parents, `levels` directories up. Candidates only — none is read yet.
 */
function donorCandidates({ env = process.env, checkout = root, main = mainCheckout(checkout), levels = 3, target = DESK } = {}) {
  const out = [], rel = path.join(target.dir, "node_modules");
  const add = (modules, source) => { if (modules && !same(modules, path.join(checkout, rel))) out.push({ modules: path.resolve(modules), source }); };
  if (env[target.env]) { add(env[target.env], target.env); return out; }
  if (main && !same(main, checkout)) add(path.join(main, rel), "main checkout");
  let dir = path.dirname(path.resolve(checkout));
  for (let i = 0; i < levels; i++) {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { entries = []; }
    for (const e of entries) if (e.isDirectory() || e.isSymbolicLink()) add(path.join(dir, e.name, rel), `sibling checkout ${path.join(dir, e.name)}`);
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return out;
}
/** The first candidate that really carries the package. A donor whose node_modules is empty is no donor. */
function findDonor(options = {}) {
  const target = options.target || DESK;
  return donorCandidates(options).find(c => usable(c.modules, target)) || null;
}

/**
 * Link a target's node_modules to a donor, or say why it cannot. Never removes a real install: only a link (ours or
 * broken, which unlink removes without touching what it points at) or an empty directory is cleared out of the way.
 */
function ensure({ env = process.env, checkout = root, main, levels, link = linkDir, target = DESK } = {}) {
  const dest = path.join(checkout, target.dir, "node_modules");
  if (usable(dest, target)) return { action: "present", dest, target };
  const sitting = occupant(dest);
  if (sitting.kind === "directory" || sitting.kind === "file") return { action: "blocked", dest, target, reason: `${dest} is there but has no ${target.needs} in it` };
  const donor = findDonor({ env, checkout, target, ...(main === undefined ? {} : { main }), ...(levels === undefined ? {} : { levels }) });
  if (!donor) return { action: "unavailable", dest, target, reason: `no checkout near ${checkout} has a ${target.dir}/node_modules with ${target.needs} in it` };
  if (sitting.kind === "link") { try { fs.unlinkSync(dest); } catch { try { fs.rmdirSync(dest); } catch { /* the link outlives us; the create below will say so */ } } }
  if (sitting.kind === "empty") { try { fs.rmdirSync(dest); } catch { /* likewise */ } }
  try {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    link(donor.modules, dest);
  } catch (e) { return { action: "blocked", dest, target, donor, reason: `could not link ${dest} to ${donor.modules}: ${e.message}` }; }
  if (!usable(dest, target)) return { action: "blocked", dest, target, donor, reason: `${dest} links to ${donor.modules} but still has no ${target.needs} in it` };
  return { action: "linked", dest, target, donor };
}
/** A junction on Windows: it needs no developer mode, and `cmd mklink /J` does not survive this shell's path mangling. */
function linkDir(from, to) { fs.symlinkSync(from, to, process.platform === "win32" ? "junction" : "dir"); }

/** One line at most per install, and only when something happened. Anything it cannot fix is one instruction, then 1. */
function run(result = ensure(), out = console) {
  const dir = (result.target || DESK).dir;
  if (result.action === "present") return 0;
  if (result.action === "linked") { out.log(`${dir}/node_modules was missing — linked it to ${result.donor.modules} (${result.donor.source}). Remove the link and run \`npm install\` in ${dir}/ for an install of its own.`); return 0; }
  out.error(`${dir}/node_modules cannot run the gate: ${result.reason}. Run \`npm install\` in ${dir}/, then \`npm test\`.`);
  return 1;
}

module.exports = { DESK, TOOLS, TARGETS, usable, occupant, donorCandidates, findDonor, ensure, linkDir, run };
if (require.main === module) process.exit(TARGETS.map(target => run(ensure({ target }))).some(Boolean) ? 1 : 0);
