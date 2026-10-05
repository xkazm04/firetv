---
id: 0016
kind: convention
scope: repo
date: 2026-10-05
supersedes: 0012
refs: [path:.github/workflows/capabilities-pr.yml, path:.github/workflows/conformance-gate.yml, path:scripts/doctor-gate.mjs, path:scripts/capability-proof.mjs, path:.ai/manifest.yaml, 0011, 0012]
---

**Every same-repository pull request proves the manifest's capabilities, and a committed `verified: true` must hold on it.**

This replaces 0012's "never pull_request". The weekly `capabilities.yml` run stays and catches environmental rot
between changes.

- `.github/workflows/capabilities-pr.yml` runs `node .ai/doctor.mjs --run --json` on each PR from this repository,
  after the same warm-up as the weekly run. `scripts/capability-proof.mjs` fails the job when a capability failed.
  Fork PRs never `--run`, because `--run` shell-executes the manifest's commands. The workflow holds no secret and its
  token is read-only.
- `scripts/doctor-gate.mjs --claims` compares the manifest as committed (copied before the doctor's write-back) with
  that run. A committed `verified: true` that did not pass is a broken claim, and the job goes red. A pass with a
  committed `false` gets a notice.
- **How a flag becomes true.** Nobody hand-flips a flag, and CI never commits one. A human or a session runs
  `node .ai/doctor.mjs --run` locally and commits the doctor's own write-back in the PR. The PR run then proves the
  claim on that exact tree. So a `true` on main was proven by CI on the change that carried it.
- **The PR doctor's exit code means one thing.** `.github/workflows/conformance-gate.yml` runs the doctor with
  `--json` and lets `scripts/doctor-gate.mjs` judge it. The job fails on any `fail` finding except the waivers in that
  script. Each waiver names its owning memory, and today the only one is `control.prepush` (0011). A waiver with
  nothing left to excuse warns, so it is deleted when the operator adds the hook. Do not add a waiver to turn a gate
  green. A waiver needs its own memory entry that says why the fail is deliberate.
- `ai-conformance.yml`'s plain doctor job still exits 1 on `control.prepush`. Read the conformance-gate job instead.
  Retiring the old job is the operator's call.

**Why:** a weekly proof cannot tell an agent at merge time that its change kept every capability green, and a gate
that is red by design teaches everyone to ignore it.
