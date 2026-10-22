# docs: index

Every design doc in this folder, grouped by product, then the decision records. For how the
products fit together and the commands, start at [../README.md](../README.md) and
[../AGENTS.md](../AGENTS.md). For the agent harness (evals, prompts, runbooks, review gate), see
[AI_HARNESS.md](AI_HARNESS.md). For what changed in each product, newest first, see
[../CHANGELOG.md](../CHANGELOG.md). For the hackathon submission texts (description, product feedback,
friction log, feature requests, open source), see [devpost/](devpost/README.md).

## Telestrator (core/, tv-app/, companion/)

- [POC-FINDINGS.md](POC-FINDINGS.md): what the toolchain proved, what it did not, and the latency finding.
- [PLATFORM-RISK.md](PLATFORM-RISK.md): Fire OS vs Vega OS, and why the transport sits behind an interface.
- [FRAME-ANALYSIS-LESSONS.md](FRAME-ANALYSIS-LESSONS.md): what a local vision model can and cannot be asked about a paused frame (the `vision/` code).
- [USE-CASE-OPTIONS.md](USE-CASE-OPTIONS.md): the fallback directions after sports analytics closed, scored on user pull, reuse and risk.

## Study Desk (desk/, uat/)

Scope and plan:
- [STUDY-DESK-SCOPE.md](STUDY-DESK-SCOPE.md): core scope, subjects, and the feasibility PoCs that come first.
- [STUDY-DESK-POC-RESULTS.md](STUDY-DESK-POC-RESULTS.md): what those PoCs measured.
- [DESK-PROTOTYPE-PLAN.md](DESK-PROTOTYPE-PLAN.md): the functional prototype and its page map.
- [STUDY-DESK-SCREENS.md](STUDY-DESK-SCREENS.md): the screen inventory.

Design languages:
- [DESIGN-ON-AIR.md](DESIGN-ON-AIR.md): the design law for every TV surface.
- [DESIGN-STUDY-DESK.md](DESIGN-STUDY-DESK.md): the landing.
- [DESIGN-LINGA.md](DESIGN-LINGA.md), [DESIGN-MATH-BUDDY.md](DESIGN-MATH-BUDDY.md), [DESIGN-ESSAY-MASTER.md](DESIGN-ESSAY-MASTER.md): one per module.

Linga (English):
- [LINGA-CONVERSATION-DESIGN.md](LINGA-CONVERSATION-DESIGN.md)
- [LINGA-PLACEMENT-DESIGN.md](LINGA-PLACEMENT-DESIGN.md)
- [LINGA-IMPLEMENTATION-PLAN.md](LINGA-IMPLEMENTATION-PLAN.md)
- UAT overlay: [../uat/README.md](../uat/README.md)

Math Buddy:
- [MATH-COURSE-PATHS.md](MATH-COURSE-PATHS.md)
- [CALCULUS-1-SYLLABUS.md](CALCULUS-1-SYLLABUS.md)

Family and Adult modes:
- [FAMILY-PHASE-1-PLAN.md](FAMILY-PHASE-1-PLAN.md)
- [concepts/ADULT-MODE-TAKE-TWO.md](concepts/ADULT-MODE-TAKE-TWO.md)
- [concepts/ADULT-MODE-IMPLEMENTATION-PLAN.md](concepts/ADULT-MODE-IMPLEMENTATION-PLAN.md)

## Decisions

Decisions that are already settled. Read these before proposing to reopen one.

| Where | What it records |
|---|---|
| [../.ai/memory/](../.ai/memory/) | Repo-level decisions and gotchas, one per file, append-only (`supersedes` replaces an older entry): sports direction closed, desk is a prototype, two transports, the gate rules, worktree and shared-checkout gotchas. |
| [PLATFORM-RISK.md](PLATFORM-RISK.md) | Why the TV transport is an interface (listen on LAN, or dial out to a relay). |
| [USE-CASE-OPTIONS.md](USE-CASE-OPTIONS.md) | Which product directions were scored, and how. |

A new decision goes into `.ai/memory/` as the next `NNNN-slug.md` (format in
[../.ai/memory/README.md](../.ai/memory/README.md)). Write a longer write-up here only when it
needs one, and link it from the memory entry.
