---
id: 0022
kind: decision
scope: repo
date: 2026-10-22
supersedes: 0009
refs: [0009, 0020]
---

**Death Ride was cut from the repository on 2026-10-22, because it cannot be finished within the hackathon term.**
`deathride/`, its concept docs (`docs/concepts/DEATH-RIDE-*.md`, `docs/concepts/deathride/`, `docs/narrative/FRAME-CHANGES.md`),
its dependabot entries, its harness-drills steps and its guidance overlay are gone from `main`. The repo is now two
products: the Telestrator PoC and the Study Desk. The game's history is kept on the branch `deathride/main` (worktree
`../firetv-deathride`) and in git history before the removal commit; restore it from there, not by re-adding files to
`main`. This supersedes 0009 (the standalone build) and retires 0020 (the Stick frame budget, a ratchet over
`deathride/perf/frame-budget.json`, which no longer exists). Older entries and changelog history that name `deathride/`
are records of what was true then; they are not edited.
