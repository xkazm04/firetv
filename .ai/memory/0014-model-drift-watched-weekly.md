---
id: 0014
kind: convention
scope: repo
date: 2026-10-05
supersedes: null
refs: [path:tools/model-drift.cjs, path:uat/drift/, path:scripts/model-drift.ps1, path:.github/workflows/model-drift.yml, path:tools/lab-bench.cjs, 0007, 0012]
---

**Live model quality is recorded weekly on the operator's machine, and CI watches the records.**

The live run measures and keeps the record. `scripts/model-drift.ps1` runs
`MODEL_DRIFT_ALLOW_LIVE=1 node tools/model-drift.cjs --live`, either by hand or through a weekly Windows Scheduled Task
that the operator registers once with `-Register`.
- It runs the lab bench (`tools/lab-bench.cjs`) on the real engines.
- It writes one counts-only record to `uat/drift/<day>-<n>.json` and rewrites the derived `DRIFT.md`.
- It exits 1 when the numbers moved past the thresholds in `uat/drift/README.md`.
- The operator commits the record.

The watch never calls a model. `.github/workflows/model-drift.yml` runs `--status --max-age 21` every Monday against
the committed records only. It goes red, and GitHub emails the owner, in three cases:
- no live record exists
- the newest record alerted
- the newest record is older than 21 days

The same workflow runs `tools/model-drift-test.cjs` (replay, no model) on every pull request.

**Why:** the engines are the operator's own: Ollama vision on a local GPU, and claude-cli or codex signed in on that
machine. A runner has none of them, and the gates must stay free of live calls (0007). Splitting the work this way puts
the spend where the engines are. It also turns a measurement that ran only when someone remembered into one whose
absence or drift is reported without anyone remembering.

**The hint writer is watched first.** Its withholding fallback hides a worse model as generic hints, so the first-ask
leak and re-ask counts are the early signal. The `uat/` LT ledger (`uat/driver/ledger.cjs`) was not reused. It holds
chains of findings per Character and journey, not numbers per role over time, and it skips any directory without a
`findings.json`, so `uat/drift/` sits beside it.
