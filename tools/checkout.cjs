/**
 * Where the operator's checkout is, for the tools that must look past a worktree to it: kpi-measure (the learner
 * book lives in the main checkout's desk/data) and worktree-preflight (its desk/node_modules is the likeliest donor).
 * One copy, so a change to how the main checkout is found reaches both.
 */
const path = require("node:path"), { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");

/** The main worktree is the operator's checkout, where the desk actually runs. Null when git is not there. */
function mainCheckout(cwd = root) {
  const r = spawnSync("git", ["worktree", "list", "--porcelain"], { cwd, encoding: "utf8" });
  const m = r.status === 0 && (r.stdout || "").match(/^worktree (.+)$/m);
  return m ? path.resolve(m[1].trim()) : null;
}
/** Two paths name the same place; case-insensitive on Windows. */
const same = (a, b) => process.platform === "win32" ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b);

module.exports = { mainCheckout, same };
