---
id: 0020
kind: decision
scope: path:deathride/
date: 2026-10-05
supersedes: null
refs: [path:deathride/perf/frame-budget.json, path:deathride/tools/frame-budget.mjs, path:deathride/tools/perf-summary.py, path:docs/concepts/DEATH-RIDE-BACKLOG.md, 0014]
---

**Stick frame time is held to a committed budget that ratchets from the accepted soak. It does not hold the product
target.**

- `deathride/perf/frame-budget.json` sets ceilings per scene: every active race window, and the six-cars-live
  windows. The ceilings cover the worst window p95, the worst frame, every window median and the simulation step
  p95.
- Each ceiling is the accepted P8 delivery soak (`evidence/perf/final/delivery/summary.json`, AFTKM) plus a stated
  tolerance.
- `node deathride/tools/frame-budget.mjs [summary.json]` exits 1 on any breach. It also exits 1 when a scene is
  missing or too thin to judge, when the soak is shorter than 300 s, or when a listed record's hash changed.

**Why a ratchet and not the 16.7/33 ms target:**

- The owner deferred closing the frame gate until the optimisation pass (`docs/concepts/DEATH-RIDE-BACKLOG.md`).
  A gate set at the target would be red on every build and would say nothing about a regression.
- The ratchet makes "this change made the Stick slower" a number that fails.
- The target stays in the file with `gating: false`.

**Only a Stick soak counts.** A desktop `--soak` runs vsync-capped on a far faster GPU. `tools/perf-desktop.py`
already says it never substitutes for Stick timing.

**How it is maintained.** As with model drift (0014), the measurement is the operator's: a device run. CI only
re-checks the committed records against the budget (`.github/workflows/harness-drills.yml`).

- A new soak that stands for the build joins `records`.
- A ceiling is tightened when a soak beats it. It is never loosened to let a change through.
