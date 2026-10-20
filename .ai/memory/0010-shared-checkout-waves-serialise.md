---
id: 0010
kind: gotcha
scope: repo
date: 2026-10-05
supersedes: null
refs: [path:.claude/scan-sweep/config.md]
---

When several agents build in **one shared checkout**, the first to finish sees the whole-tree gate red
on a sibling's half-written file and may hand off without a full-chain exit 0. On 2026-10-05 three
builders did. There are two safe shapes. Either use a worktree per agent or wave, or serialise the
last minutes of a wave and let the coordinator own the full-chain run (a builder is then judged on its
own suites plus the coordinator's integration gate). Another session can also switch the branch
underneath a shared checkout. Source: `.claude/scan-sweep/config.md` (Skill improvement log, 2026-10-05).
