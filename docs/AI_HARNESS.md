# AI process & harness: firetv

The index of the pieces that make agent work on this repository repeatable and checkable. It
points at the real files and does not restate them. The commands and constraints are in
[../AGENTS.md](../AGENTS.md). The Definition of Done is in [../CONTRIBUTING.md](../CONTRIBUTING.md).

## Components

- [x] Evals for AI output: deterministic ones gate every PR, and live ones are the operator's call (below).
- [x] Prompt and agent library: prompts are code in `desk/`, and skill overlays live in `.claude/` and `uat/`.
- [x] Runbooks for recurring agent tasks: the skill overlays, the UAT overlay and `.ai/memory/`.
- [x] Review gate for AI changes: the DoD, the PR template and three CI workflows.

## Evals

There are two kinds, split by one rule: **no gate makes a live model call**
([../.ai/memory/0007-no-live-model-calls-in-gates.md](../.ai/memory/0007-no-live-model-calls-in-gates.md)).

### Deterministic: these gate every pull request

These suites check what the desk does with model output: the verdict is decided in code, the answer
is withheld, and the UAT judge's verdicts and metrics are computed correctly. Every model role is
stubbed at the `provider` seam (`desk/src/lib/engines/`), and data goes to a temp `DESK_DATA_DIR`.

| Suite | What it pins |
|---|---|
| `tools/maths-judge-test.cjs` | One judge per maths item kind. The marker, explainer and hint read one registry, and a typed mark never calls a model. |
| `tools/calc-marking-test.cjs` | A photographed Calculus page is marked by code. A verdict or solution the vision model volunteers is never read. |
| `tools/withhold-rules-test.cjs` | Every maths hint bound for the TV passes `rules/maths` `leaks()`, against the lab's recorded corpus. |
| `tools/uat-verdict-test.cjs` | The UAT journey verdict is decided in code from named checks (`uat/driver/verdict.cjs`). |
| `tools/uat-metrics-test.cjs` | One metric registry feeds the judge schema, the gates, the roll-up and the report (`uat/driver/metrics.cjs`). |
| `tools/uat-recertify-test.cjs` | A recertify run recomputes deltas and confounds from committed runs, with all three model roles stubbed. |
| `tools/uat-ledger-test.cjs` | One open ledger across runs (`--status`, `--recertify`). The committed `uat/runs/` must be byte-identical afterwards. |
| `tools/uat-surface-test.cjs` | The LT driver reads the rendered TV and phone (`uat/driver/surface.cjs`), not a copy of them. |

**Where they run.** They are part of `npm --prefix desk test`, the desk gate, which
`.github/workflows/quality.yml` runs on every pull request. A red suite blocks the merge. To run
only these, use the `evals` capability in `.ai/manifest.yaml`, which calls the same files from the
repo root. `.github/workflows/capabilities-pr.yml` runs every manifest capability, including `evals`,
through `node .ai/doctor.mjs --run` on each same-repo pull request, and `capabilities.yml` repeats it
once a week. On a PR, `scripts/doctor-gate.mjs --claims` also holds every committed `verified: true`
to that run. See
[../.ai/memory/0016-capabilities-proven-per-pr.md](../.ai/memory/0016-capabilities-proven-per-pr.md).

### Degraded engines: the drill for when a live engine answers nonsense

`tools/engine-degraded-test.cjs` takes each row of `tools/engine-degraded-fixtures.json` through the real routes:
`POST /api/read`, `POST /api/hint`, and the lesson pick behind the hint. A row is one provider answer:

- prose instead of JSON, or an empty object;
- wrong types or empty strings;
- centres outside the photo, or an unknown or padded lesson id;
- a timeout, an engine that is not running, or a process that dies.

The suite checks the fallback the child at the TV is owed:

- a desk sentence on the status line, never the engine's words or the answer;
- the page not stuck on "reading", and no hint card;
- "no lesson" instead of an endless wait;
- a retry that works once the engine is back.

Engines are stubbed at the `provider` seam, so it makes no live call. It runs on every PR in
`.github/workflows/harness-drills.yml`.

Rows with a `todo` are gaps the desk has today. They run and report without failing:

- an empty hint passes the hint schema and shows a blank card;
- a centre outside the photo gives an inverted crop band;
- a page item of spaces is kept.

Their fixes are in `hint.ts` and `read.ts`, on the live surface, so they land with a live drift record (0017). The
drift records cannot seed these rows because they are counts-only.

### Live: opt-in, these spend real calls

These measure the quality of model output itself, so they need a real engine. Running one is the
owner's decision. They are never part of a gate.

- **UAT LT (text-live) for Linga.** The driver is `uat/driver/linga-text.cjs`, scored with
  `uat/rubric.md`, with the Characters in `uat/characters/` and the journeys in `uat/journeys/`.
  It runs on codex
  ([../.ai/memory/0008-uat-lt-runs-on-codex.md](../.ai/memory/0008-uat-lt-runs-on-codex.md)), and
  its results go to `uat/runs/<id>/`. `node uat/driver/linga-text.cjs --status` lists what is still
  open and makes no model call.
- **Live probes:** `tools/*-live.cjs` (maths Calculus, school topics, essay files, Linga cert and
  school, the TV landing) and `tools/linga-ui-test.cjs`. Each one exercises the real engine end to end.

### Drift: live quality, recorded weekly and watched by CI

A provider update can make the hints, the page read or the lesson pick worse without a single deterministic suite
going red. The drift watch leaves a trace of that
([../uat/drift/README.md](../uat/drift/README.md), [../.ai/memory/0014-model-drift-watched-weekly.md](../.ai/memory/0014-model-drift-watched-weekly.md)).

- **Live, on the operator's machine, weekly.** `scripts/model-drift.ps1` runs the step below, and `-Register` schedules
  it weekly.
  - It runs `MODEL_DRIFT_ALLOW_LIVE=1 node tools/model-drift.cjs --live`, which is the lab bench (`tools/lab-bench.cjs`)
    on the real engines.
  - It writes a counts-only record to `uat/drift/` and compares it with the previous one.
  - It exits 1 when a threshold is crossed. The hint writer's first-ask leaks and re-asks are watched first.
- **Watched in CI, no model.** `.github/workflows/model-drift.yml` runs every Monday:
  `node tools/model-drift.cjs --status --max-age 21`. It goes red when no live record exists, when the newest one
  alerted, or when it is older than 21 days.
- **Proven on every PR.** The same workflow runs `tools/model-drift-test.cjs`: the thresholds, `--status` and the
  refusals, on the bench's replay.
- **Judged before merge, when a PR changes what a model is asked.** `.github/workflows/model-drift-pr.yml` runs
  `node tools/model-drift-pr.cjs --base origin/<base>` on every PR. The live surface is derived from the bench's own
  imports (`--surface` lists it): the hint, read and pick pipelines, the rules they import, the engine seam and the bench.
  A PR that touches it goes red unless it adds a live record that measured its code and does not alert against the base
  branch's newest live record. The operator runs that one bench run on the PR branch. Every other PR owes no call
  ([../.ai/memory/0017-prompt-prs-carry-a-live-record.md](../.ai/memory/0017-prompt-prs-carry-a-live-record.md)).

## Prompt and agent library

- **Prompts are code.** They live next to the pipeline that uses them, behind the engine seam, so a
  rules suite can stub them:
  - Linga: `desk/src/lib/english/` (`check.ts`, `placement.ts`, `conversation.ts`)
  - maths and essay: `desk/src/lib/desk/` (`mark.ts`, `explain.ts`, `hint.ts`, `essay.ts`)
  - engines: `desk/src/lib/engines/` (`text.ts`, `vision.ts`, `codex.ts`)

  Decisions stay in `desk/src/lib/rules/`. The model explains; it does not decide.
- **Agents and skills.** They are registered under `agents:` in `.ai/manifest.yaml`. The skills
  come from the ai-registry, and each one has a per-repo overlay:
  - `.claude/scan-sweep/config.md`
  - `.claude/cx/config.md`
  - `.claude/spark/config.md`
  - `.claude/contest/config.md`
  - `.claude/perfect/config.md`
  - `.claude/leonardo/config.md`
  - `uat/README.md` (for `/uat`)

## Runbooks

| Task | Runbook |
|---|---|
| Linga acceptance run, recertify or drain | `uat/README.md`, `uat/env.md`, `uat/accepted-gaps.md` |
| Quality sweep or challenge run | `.claude/scan-sweep/config.md` |
| Journey walk | `.claude/cx/config.md` |
| Design, then build | `.claude/spark/config.md`, `.claude/contest/config.md` |
| Telestrator full cycle (unit, build, emulator, deploy, live UI) | `scripts/dev.ps1`, `fixtures/README.md` |
| Second dev server in a worktree | [../.ai/memory/0006-worktrees-next-dev-webpack.md](../.ai/memory/0006-worktrees-next-dev-webpack.md) |
| Several agents in one checkout | [../.ai/memory/0010-shared-checkout-waves-serialise.md](../.ai/memory/0010-shared-checkout-waves-serialise.md) |
| Handing a task to an agent | `.github/ISSUE_TEMPLATE/agent-task.yml` (acceptance criteria and gates per surface are required), [../CONTRIBUTING.md](../CONTRIBUTING.md#handing-work-to-an-agent) |
| A PR that changes a prompt, an engine or a rule the bench runs | `./scripts/model-drift.ps1` on the branch, commit the record ([../uat/drift/README.md](../uat/drift/README.md)) |
| Pinning the workflow actions to commit SHAs | `node scripts/pin-actions.mjs` ([../.ai/memory/0013-pin-actions-with-the-script.md](../.ai/memory/0013-pin-actions-with-the-script.md)) |

Durable lessons from past runs are in `.ai/memory/` (format: [../.ai/memory/README.md](../.ai/memory/README.md)).

## Review gate for AI changes

- **Definition of Done:** [../CONTRIBUTING.md](../CONTRIBUTING.md#definition-of-done). The gate for
  every touched surface exits 0 after the last edit, a behaviour change comes with a failing-first
  test, there are no live model calls and nothing touches `desk/data/`, docs are updated, and
  AI-written commits carry the `Co-Authored-By` trailer. Commits from a loop lane also carry
  `Agent-Lane:` (0019).
- **PR template:** [../.github/pull_request_template.md](../.github/pull_request_template.md) asks
  for the gate commands, their exit codes and the DoD.
- **CI:**
  - `quality.yml` runs the desk gate (including the evals above) and `:core:test` on every PR.
  - `ai-conformance.yml` runs the agent-contract doctor on every PR. It is red by design on `control.prepush` (0011).
  - `conformance-gate.yml` judges the same doctor through `scripts/doctor-gate.mjs` on every PR. It goes red on any fail outside the waivers, each of which is owned by a memory entry.
  - `capabilities-pr.yml` proves the manifest commands on every same-repo PR and checks the committed `verified` flags against that run. `capabilities.yml` repeats the proof every week.
  - `model-drift.yml` watches the committed live-quality records every week and runs the drift suite on every PR.
  - `model-drift-pr.yml` holds a PR that changes the live surface to a fresh live record, compared with the base's newest one.
  - `changelog.yml` keeps `CHANGELOG.md`'s shape and links on every PR.
  - `repo-guardrails.yml` holds the shape agents are told to keep. Every PR and push to main runs:
    - the desk's layering (`tools/desk-boundaries.cjs`, 0018);
    - the guidance overlay of every separate build (`tools/guidance-overlay-test.cjs`).

    On a PR it also annotates every AI commit whose agent or lane is not in a trailer (`tools/commit-provenance.cjs`,
    0019). That step warns until the operator adds `--strict`.
  - `supply-chain.yml` builds and attests the APK on main. `sbom.yml` then attests the same APK's CycloneDX SBOM (0021).
  - `harness-drills.yml` runs on every PR and push to main:
    - the security policy check (`tools/security-policy-test.cjs`);
    - the SBOM converter suite;
    - the Stick frame budget (`deathride/tools/frame-budget.mjs`, 0020);
    - the degraded-engine drill.
- A human approves every merge (`.ai/guardrails.yaml`).
