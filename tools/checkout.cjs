/**
 * Where the operator's checkout is, for the tools that must look past a worktree to it: kpi-measure (the learner
 * book lives in the main checkout's desk/data) and worktree-preflight (its desk/node_modules is the likeliest donor,
 * and the other worktrees of this repository are the only other donors it trusts).
 * One copy, so a change to how the main checkout is found reaches both.
 */
const path = require("node:path"), { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");

/** Every worktree of this repository, the main one first, as git lists them. Empty when git is not there. */
function worktrees(cwd = root) {
  const r = spawnSync("git", ["worktree", "list", "--porcelain"], { cwd, encoding: "utf8" });
  if (r.status !== 0) return [];
  return [...(r.stdout || "").matchAll(/^worktree (.+)$/gm)].map(m => path.resolve(m[1].trim()));
}
/** The main worktree is the operator's checkout, where the desk actually runs. Null when git is not there. */
function mainCheckout(cwd = root) {
  return worktrees(cwd)[0] ?? null;
}
/** Two paths name the same place; case-insensitive on Windows. */
const same = (a, b) => process.platform === "win32" ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b);

module.exports = { worktrees, mainCheckout, same };
