---
id: 0017
kind: convention
scope: repo
date: 2026-10-05
supersedes: null
refs: [path:tools/model-drift-pr.cjs, path:.github/workflows/model-drift-pr.yml, path:uat/drift/, path:tools/lab-bench.cjs, 0007, 0014]
---

**A pull request that changes what a real model is asked carries its own live drift record. CI holds that record to
the base branch's newest one, and CI still makes no model call.**

- **The live surface** is derived, not listed. `node tools/model-drift-pr.cjs --surface` prints it:
  - every desk module the lab bench loads (`load("...")` in `tools/lab-bench.cjs`), followed through its runtime
    imports (type-only imports are skipped);
  - all of `desk/src/lib/engines/`;
  - the bench and `tools/lab-corpus.cjs`.

  A new import in `hint.ts` widens the surface without anyone editing a list.
- **What the PR owes.** If it touches the surface, the operator runs `scripts/model-drift.ps1` on the PR branch and
  commits the new `uat/drift/<day>-<n>.json` and `DRIFT.md`. `.github/workflows/model-drift-pr.yml` runs
  `node tools/model-drift-pr.cjs --base origin/<base>` and goes red when any of these holds:
  - the PR adds no live record;
  - the newest added record alerts against the base's newest live record, judged by `tools/model-drift.cjs`'s own
    `compare()` (with no baseline yet, a hard alert alone is enough);
  - a surface file changed after the commit that record measured;
  - the PR rewrites or deletes a committed record.

  A PR that leaves the surface alone passes and owes nothing.
- **Budget.** One bench run per surface-touching PR: 12 maths hint problems asked at most twice each, two page reads
  and 9 lesson picks. Every other PR costs nothing.

**Why:** the deterministic evals stub every model role (0007), and the weekly drift run (0014) saw a prompt or engine
regression only after it had merged. The committed records were already a baseline in counts, compared in code. Holding
a PR to them moves the judgement before the merge. The spend stays on the operator's engines, and a runner stays
keyless.
