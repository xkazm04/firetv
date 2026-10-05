# Changelog

What changed in each of the three products in this repository, and in the harness around them, newest first. The
format is adapted from [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

- **Dated milestones, not versions.** Nothing here ships with a version yet:
  - the Telestrator APK is `0.1-poc` (`tv-app/build.gradle.kts`)
  - Death Ride is `0.1-spike` (`deathride/app/build.gradle.kts`)
  - the desk is `0.1.0` (`desk/package.json`)

  So each entry is a dated milestone (`### YYYY-MM-DD: what landed`) that links the doc recording it. When a product
  starts shipping versions, its milestones become version headings.
- **How to add a line.** A change a user or the owner would notice (a screen, a flow, a rule, a decision, a gate) adds
  one line under its product's `### Unreleased` in the same pull request (CONTRIBUTING.md, Definition of Done). When a
  milestone closes, `Unreleased` is renamed to its date and a fresh `### Unreleased` goes on top.
- **Where the detail lives.** Every line links the design doc, plan or decision record that holds the detail. This file
  only routes to them.
- `tools/changelog-test.cjs` checks the shape: four product sections, each with `### Unreleased`, dates newest first,
  and every relative link resolving.

## Study Desk

`desk/` and `uat/`: the Next.js functional prototype of a homework desk on the TV (Linga English, Math Buddy, Essay Master).

### Unreleased

- The live model-drift watch: the lab bench on the real engines, recorded weekly in [uat/drift/](uat/drift/README.md). See the harness section.

### 2026-09-30: Family Phase 1 complete, Adult mode chosen

- Family Phase 1, waves W1 to W10, is complete ([FAMILY-PHASE-1-PLAN.md](docs/FAMILY-PHASE-1-PLAN.md), "Phase 1 complete").
- The owner chose Adult mode "Take Two", and its implementation plan was written ([ADULT-MODE-TAKE-TWO.md](docs/concepts/ADULT-MODE-TAKE-TWO.md), [ADULT-MODE-IMPLEMENTATION-PLAN.md](docs/concepts/ADULT-MODE-IMPLEMENTATION-PLAN.md)).

### 2026-09-29: Calculus 1 course path, Family owner decisions, a new landing

- Calculus 1 became a Math Buddy course path. Its verdicts are decided in code ([MATH-COURSE-PATHS.md](docs/MATH-COURSE-PATHS.md), [CALCULUS-1-SYLLABUS.md](docs/CALCULUS-1-SYLLABUS.md)).
- The owner's decisions for Family Phase 1 were recorded ([FAMILY-PHASE-1-PLAN.md](docs/FAMILY-PHASE-1-PLAN.md), "Owner decisions, 2026-09-29").
- A new Study Desk landing replaced "Left on the Desk" ([DESIGN-STUDY-DESK.md](docs/DESIGN-STUDY-DESK.md)).

### 2026-09-25: Screen inventory re-read from code

- The screen inventory was re-read from the code on main ([STUDY-DESK-SCREENS.md](docs/STUDY-DESK-SCREENS.md)).

### 2026-09-24: Module landings chosen

- The Linga, Math Buddy and Essay Master landings were chosen in design contests ([DESIGN-LINGA.md](docs/DESIGN-LINGA.md), [DESIGN-MATH-BUDDY.md](docs/DESIGN-MATH-BUDDY.md), [DESIGN-ESSAY-MASTER.md](docs/DESIGN-ESSAY-MASTER.md)).

### 2026-09-15: UAT for Linga

- The `uat/` overlay was adopted for Linga, with the LT (text-live) level running on codex. The first five LT runs were recorded under `uat/runs/2026-09-15-*` ([uat/README.md](uat/README.md), [0008](.ai/memory/0008-uat-lt-runs-on-codex.md)).

### 2026-09-08: "Check my work" in scope

- "Check my work" was overturned from out of scope to in scope ([STUDY-DESK-SCOPE.md](docs/STUDY-DESK-SCOPE.md)).

### 2026-09-07: Direction, PoCs, identity and the M0 prototype

- The Study Desk direction was chosen ([STUDY-DESK-SCOPE.md](docs/STUDY-DESK-SCOPE.md)).
- Its feasibility PoCs were run against kill criteria set beforehand ([STUDY-DESK-POC-RESULTS.md](docs/STUDY-DESK-POC-RESULTS.md)).
- The On Air identity was chosen ([DESIGN-ON-AIR.md](docs/DESIGN-ON-AIR.md)).
- The M0 functional prototype was built ([DESK-PROTOTYPE-PLAN.md](docs/DESK-PROTOTYPE-PLAN.md), "Status — 2026-09-07").

## Telestrator

`core/`, `tv-app/` and `companion/`: the original PoC, where a phone draws on a paused video frame on the TV.

### Unreleased

- Nothing yet.

### 2026-10-05: Relay pairing follows the socket

- The relay's pairing followed the pen instead of the socket. A relay channel's conversation is now shared: no hello deadline, and every hello is a (re)pairing. A late phone pairs, and a second phone is PIN-checked ([PLATFORM-RISK.md](docs/PLATFORM-RISK.md), Decisions).

### 2026-09-23: Pairing and heartbeat moved into core

- Pairing and the heartbeat (`PenConversation`, `Heartbeat`) moved into `core/` as a sans-IO state machine, covered by `:core:test` ([PLATFORM-RISK.md](docs/PLATFORM-RISK.md)).

### 2026-09-07: Hardware run, sports analytics closed

- The PoC ran on a Fire TV Stick 4K: hardware decode was proven and three bugs were found ([POC-FINDINGS.md](docs/POC-FINDINGS.md), §7).
- The sports-analytics direction was closed. The domain-neutral frame-analysis lessons were kept ([FRAME-ANALYSIS-LESSONS.md](docs/FRAME-ANALYSIS-LESSONS.md), [0002](.ai/memory/0002-sports-direction-closed.md)), and the fallback directions were scored ([USE-CASE-OPTIONS.md](docs/USE-CASE-OPTIONS.md)).

### 2026-09-06: PoC verdict: no blocker

- The whole slice built and ran, and the verdict was "no blocker. Go." ([POC-FINDINGS.md](docs/POC-FINDINGS.md)).
- The transport was put behind one interface with LAN and relay implementations ([PLATFORM-RISK.md](docs/PLATFORM-RISK.md), [0004](.ai/memory/0004-two-transports-one-interface.md)).

## Death Ride

`deathride/`: the standalone Kotlin/libGDX combat racer for Fire TV, built separately ([0009](.ai/memory/0009-deathride-standalone-build.md)). The day-to-day state is in [DEATH-RIDE-STATUS.md](docs/concepts/DEATH-RIDE-STATUS.md).

### Unreleased

- An agent guidance overlay of its own ([deathride/AGENTS.md](deathride/AGENTS.md)): its own wrapper and gate, which app id a build installs as, the pure-JVM modules, and owner-only checks.

### 2026-10-04: Status entry point, regions approved, track library triaged

- The status entry point and the story pass were written. The script is not yet wired into the game ([DEATH-RIDE-STATUS.md](docs/concepts/DEATH-RIDE-STATUS.md)).
- The owner approved every region and triaged the track library ([DEATH-RIDE-OWNER-DECISIONS-2026-10-04.md](docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-04.md)).

### 2026-10-03: Owner verdicts on art, audio and campaign

- Promotion went back to winning the boss race, and the game has no music for now ([DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md](docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md)).
- Campaign v2 was merged ([DEATH-RIDE-CAMPAIGN-IMPL.md](docs/concepts/DEATH-RIDE-CAMPAIGN-IMPL.md)), and the full feature package is kept, to be optimised later ([DEATH-RIDE-BACKLOG.md](docs/concepts/DEATH-RIDE-BACKLOG.md), N3).

### 2026-10-01: Phase 2: art, content and integration waves (tagged)

- Phase 2's waves landed, each tagged in git ([DEATH-RIDE-PHASE2.md](docs/concepts/DEATH-RIDE-PHASE2.md), status table):
  - art: `art-p1-20261001` to `art-p4-20261001`
  - content: C1 to C4 (roster, tracks, combat and economy, career)
  - integration: `integration-i1-20261001`, `-v1-`, `-ip-`, `-i2-` and `-i3-20261001`
- Art direction V2 was set ([DEATH-RIDE-ART-DIRECTION-V2.md](docs/concepts/DEATH-RIDE-ART-DIRECTION-V2.md)).

### 2026-09-30: Spike won, plan written, Phase 1 waves W1 to W8

- The spike was won by "Slipstream", and the plan was written: Kotlin and libGDX, Fire OS only ([DEATH-RIDE-PLAN.md](docs/concepts/DEATH-RIDE-PLAN.md)).
- Phase 1 waves W1 to W8 were done ([DEATH-RIDE-PHASE1.md](docs/concepts/DEATH-RIDE-PHASE1.md), [deathride/OWNER-CHECKS.md](deathride/OWNER-CHECKS.md)).

## Repo and agent harness

The agent contract, CI and the evals that cover every product.

### Unreleased

- A live model-drift watch:
  - `tools/model-drift.cjs` records each live lab-bench run in [uat/drift/](uat/drift/README.md) and compares it with the last one.
  - `scripts/model-drift.ps1` runs it weekly on the operator's machine.
  - `.github/workflows/model-drift.yml` goes red when the newest record drifted or is older than 21 days ([0014](.ai/memory/0014-model-drift-watched-weekly.md)).
- This changelog ([0015](.ai/memory/0015-one-changelog-dated-milestones.md)).
- Every same-repo PR now proves the manifest capabilities and holds committed `verified` flags to that run (`capabilities-pr.yml`). The agent-contract verdict now fails only outside documented waivers (`conformance-gate.yml`, `scripts/doctor-gate.mjs`) ([0016](.ai/memory/0016-capabilities-proven-per-pr.md)).
- A PR that changes a prompt, an engine or a rule the lab bench runs now carries a live drift record, held to the base's newest one before merge (`model-drift-pr.yml`, `tools/model-drift-pr.cjs`) ([0017](.ai/memory/0017-prompt-prs-carry-a-live-record.md)).
- An agent-task issue form: acceptance criteria and the gates per surface are required fields ([agent-task.yml](.github/ISSUE_TEMPLATE/agent-task.yml), [CONTRIBUTING.md](CONTRIBUTING.md)).
- `repo-guardrails.yml`, a new workflow:
  - The desk's layering is a failing check (`tools/desk-boundaries.cjs`): engines are a leaf behind their entry modules, rules reach no engine or Node built-in, only engines spawn, only the session writes ([0018](.ai/memory/0018-desk-import-boundaries.md)). It shares one import scanner with the model-drift check (`tools/import-graph.cjs`).
  - Every separate build has a guidance overlay (`tools/guidance-overlay-test.cjs`).
  - Agent authorship is read from `Co-Authored-By:` and `Agent-Lane:` trailers (`tools/commit-provenance.cjs`). PR commits that record it only in prose are annotated ([0019](.ai/memory/0019-commit-provenance-trailers.md)).

### 2026-10-05: The AI-native standard

- `.ai/` was adopted: the manifest, the doctor and the memory ([0001](.ai/memory/0001-adopt-ai-standard.md)).
- Decision records 0002 to 0013 were written.
- The agent guidance ([AGENTS.md](AGENTS.md)), the harness index ([AI_HARNESS.md](docs/AI_HARNESS.md)) and the Definition of Done ([CONTRIBUTING.md](CONTRIBUTING.md)) were written.
- The workflows were set up: quality, ai-conformance, weekly capabilities ([0012](.ai/memory/0012-capabilities-proven-weekly.md)) and supply-chain.
