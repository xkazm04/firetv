---
id: 0006
kind: gotcha
scope: path:desk/
date: 2026-10-05
supersedes: null
refs: [path:tools/worktree-preflight.cjs]
---

A git worktree of this repo has no `desk/node_modules`. `npm test`'s pretest
(`tools/worktree-preflight.cjs`) links it from the main checkout (a junction on Windows). Two
consequences:
- a second dev server in a worktree must run `next dev --webpack`, because turbopack rejects the junctioned `node_modules`;
- a tv-app gate in a fresh worktree also needs the gitignored `local.properties` and `tv-app/src/main/res/raw/fixture_clip.mp4` copied in, or `R.raw` does not exist.

Sources: `.claude/scan-sweep/config.md` (Gates), `.claude/perfect/config.md`.
