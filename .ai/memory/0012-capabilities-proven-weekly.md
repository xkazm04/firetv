---
id: 0012
kind: convention
scope: repo
date: 2026-10-05
supersedes: null
refs: [path:.github/workflows/capabilities.yml, path:scripts/capability-proof.mjs, path:.ai/manifest.yaml, 0007, 0011]
---

**The manifest's capabilities are proven in CI once a week, and CI never commits the result.**

`.github/workflows/capabilities.yml` runs every Monday, and on dispatch. It runs
`node .ai/doctor.mjs --run --json`, then `scripts/capability-proof.mjs` judges the output on the
`capability.*.run` findings only. The doctor's exit code can't be used for this, because it also
fails on the deliberate `control.prepush` finding (0011).

When a capability that once passed fails on the schedule, the run goes red, the step summary names
the command, and GitHub emails the owner. Nobody flips a flag by hand. A human or a session either
fixes the command, or runs `node .ai/doctor.mjs --run` locally and commits the doctor's own
write-back (`verified: false` stays honest). The workflow uploads the manifest diff, so that
write-back can be seen.

Only trusted events run `--run` (schedule and dispatch), never `pull_request`, because it
shell-executes the manifest's commands.

The `evals` capability is the deterministic AI-output subset of the desk gate (model roles stubbed,
no live call, 0007). Those suites also gate every PR through `quality.yml`. Keep the two lists in
step when a new judge or UAT suite is added.

**Why:** a `verified` claim nobody re-checks goes stale, and a scheduled red run is the cheapest
reminder that does not depend on someone remembering.
