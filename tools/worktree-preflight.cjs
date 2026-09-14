/**
 * Makes the gate runnable in a checkout that was provisioned without desk/node_modules — an autopilot worktree.
 * Runs as desk/'s `pretest`, before `npm test`. It changes nothing about what the gate checks: with a usable
 * desk/node_modules already there it prints nothing and exits 0. Without one it links desk/node_modules to the
 * desk/node_modules of a checkout nearby (a junction on Windows, a directory symlink elsewhere), so tsc and the
 * rules suites resolve modules the way they do in the operator's checkout. No donor, or a real directory in the
 * way, is one line telling the human to run `npm install` in desk/ and a non-zero exit — never an unreadable stack.
 * Read-only towards every donor: it creates a link, and never writes into or deletes anything it did not create.
 */
const fs = require("node:fs"), path = require("node:path"), { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");

/** The compiler both halves of the gate need: tsc --noEmit is desk's own, and the rules suites require() it to transpile. */
function usable(modules) {
  try { return fs.statSync(path.join(modules, "typescript/package.json")).isFile(); } catch { return false; }
}
/** What is sitting at desk/node_modules: nothing, a link (ours or broken), an empty directory, or a real install. */
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
 * Where a donor install could be, nearest first: DESK_NODE_MODULES when set, then the main checkout, then every
 * sibling checkout of this one and of its parents, `levels` directories up. Candidates only — none is read yet.
 */
function donorCandidates({ env = process.env, checkout = root, main = mainCheckout(checkout), levels = 3 } = {}) {
  const out = [];
  const add = (modules, source) => { if (modules && !same(modules, path.join(checkout, "desk/node_modules"))) out.push({ modules: path.resolve(modules), source }); };
  if (env.DESK_NODE_MODULES) { add(env.DESK_NODE_MODULES, "DESK_NODE_MODULES"); return out; }
  if (main && !same(main, checkout)) add(path.join(main, "desk/node_modules"), "main checkout");
  let dir = path.dirname(path.resolve(checkout));
  for (let i = 0; i < levels; i++) {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { entries = []; }
    for (const e of entries) if (e.isDirectory() || e.isSymbolicLink()) add(path.join(dir, e.name, "desk/node_modules"), `sibling checkout ${path.join(dir, e.name)}`);
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return out;
}
/** The first candidate that really carries the compiler. A donor whose desk/node_modules is empty is no donor. */
function findDonor(options = {}) {
  return donorCandidates(options).find(c => usable(c.modules)) || null;
}

/**
 * Link desk/node_modules to a donor, or say why it cannot. Never removes a real install: only a link (ours or
 * broken, which unlink removes without touching what it points at) or an empty directory is cleared out of the way.
 */
function ensure({ env = process.env, checkout = root, main, levels, link = linkDir } = {}) {
  const dest = path.join(checkout, "desk/node_modules");
  if (usable(dest)) return { action: "present", dest };
  const sitting = occupant(dest);
  if (sitting.kind === "directory" || sitting.kind === "file") return { action: "blocked", dest, reason: `${dest} is there but has no typescript in it` };
  const donor = findDonor({ env, checkout, ...(main === undefined ? {} : { main }), ...(levels === undefined ? {} : { levels }) });
  if (!donor) return { action: "unavailable", dest, reason: `no checkout near ${checkout} has a desk/node_modules with typescript in it` };
  if (sitting.kind === "link") { try { fs.unlinkSync(dest); } catch { try { fs.rmdirSync(dest); } catch { /* the link outlives us; the create below will say so */ } } }
  if (sitting.kind === "empty") { try { fs.rmdirSync(dest); } catch { /* likewise */ } }
  try {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    link(donor.modules, dest);
  } catch (e) { return { action: "blocked", dest, donor, reason: `could not link ${dest} to ${donor.modules}: ${e.message}` }; }
  if (!usable(dest)) return { action: "blocked", dest, donor, reason: `${dest} links to ${donor.modules} but still has no typescript in it` };
  return { action: "linked", dest, donor };
}
/** A junction on Windows: it needs no developer mode, and `cmd mklink /J` does not survive this shell's path mangling. */
function linkDir(from, to) { fs.symlinkSync(from, to, process.platform === "win32" ? "junction" : "dir"); }

/** One line at most, and only when something happened. Anything it cannot fix is one instruction, then exit 1. */
function run(result = ensure(), out = console) {
  if (result.action === "present") return 0;
  if (result.action === "linked") { out.log(`desk/node_modules was missing — linked it to ${result.donor.modules} (${result.donor.source}). Remove the link and run \`npm install\` in desk/ for an install of its own.`); return 0; }
  out.error(`desk/node_modules cannot run the gate: ${result.reason}. Run \`npm install\` in desk/, then \`npm test\`.`);
  return 1;
}

module.exports = { usable, occupant, donorCandidates, findDonor, ensure, linkDir, run };
if (require.main === module) process.exit(run());
