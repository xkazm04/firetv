# Backlog drain 2026-09-25 - builder brief (shared by every builder)

Base: `main` at 14cfe12, checkout `C:/Users/kazda/kiro/firetv` (SHARED with up to three sibling
builders working at the same time - no worktrees). Commit on `main`, **never push**, never
merge, never rebase, never `git stash`, never `git add -A/./-u`, never reset or checkout
another session's files.

## Your job

Resolve the backlog finding(s) named in your prompt. The owner asked for every finding in the
2026-09-23 challenge backlog to be resolved now.

## Prior attempts (reference only)

A scan-sweep branch the owner deleted on 2026-09-25 had already built most of these. Its commits
survive as dangling objects, so `git show <sha>` works. They were made against an OLDER main
(merge-base 12ce6ec). Since then Linga, Essay Master and Math Buddy were redesigned and screens
moved (`desk/src/maths/`, `desk/src/essay/`, `desk/src/english/OpenDoor.tsx`,
`desk/src/landing/`). Read the prior commit to save time. Do NOT cherry-pick it blindly: rebuild
it on the current tree and re-verify every line it depends on. Never restore anything else from
that branch.

## Order - do not skip a step

1. **Re-verify the premise** on the current tree. If it is already fixed or false, write the
   result file with `status: "demoted"` (or `"already-fixed"`) and why, and stop. Change no code.
2. **Tests first.** Write the behaviour cases as a test (a `tools/*-test.cjs|mjs` rules suite, a
   JVM test under `core/src/test` or `tv-app/src/test`, following the repo's patterns). Run it
   and **watch it fail**. Record how many cases were red before. A guard case (behaviour that
   must NOT change) may be green before. Declare it a guard in the result file.
3. **Build** the fix inside the declared write set. A coupled doc/test/locale file the fix
   needs is part of the fix: name it in the commit body.
4. **Gates.** Run each gate in its own invocation, `&&`-chained, and **assert the exit code**.
   Never pipe a gate into `tail`/`head`, and never `;`-then-commit.
   - anything under `desk/` or `tools/*-rules-test.cjs`: `cd desk && npm test` (tsc --noEmit plus
     every suite in `test:rules`). This is the FULL-tree gate: run it before your last commit.
   - `core/`: `./gradlew.bat :core:test` from the repo root (PowerShell), exit 0.
   - `tv-app/`: `./gradlew.bat :core:test :tv-app:compileDebugKotlin` (and
     `:tv-app:testDebugUnitTest` if you add a tv-app unit test).
   - `companion/` and `tools/*.mjs`: `node --check <file>` at least; a headless harness if you
     build one.
   A whole-tree gate that is red on a path you did NOT touch is a sibling's in-flight work.
   List the failing paths, wait about a minute, re-run once, then report it. Do not "fix" a file
   outside your write set.
5. **Commit** as a short series, each commit green: `test(<ctx>): ...` then
   `fix(<ctx>): <finding title>`. Use **`git commit -m "..." -- <path> <path>`** (only-paths
   semantics). Never a bare `git commit` after `git add`, because a sibling's staged file would
   ride along. Before each commit, check that `git diff --cached --name-only` plus your
   pathspecs are exactly your files. End every commit message with
   `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
   Put the re-measured Before -> After in the commit body.

## Shared surfaces - the lock

`desk/package.json` (appending a suite to `test:rules`) is shared. Before editing it:
`mkdir "$(git rev-parse --git-dir)/scan-sweep-challenge.lock"`. Retry every 5 s. The lock is
stale after 10 minutes. Append your suite at the END of the `test:rules` chain (never reflow the
file), commit that file ALONE immediately, then `rmdir` the lock.

## Repo law (binding)

- On Air for every TV surface. Decisions live in `desk/src/lib/rules/`. Engines stay behind
  `desk/src/lib/engines/`. The session is the only state. Withholding is the product.
- **Never touch `desk/data/`** (real learners). A test that needs learner data sets
  `DESK_DATA_DIR` to a directory under the OS temp dir and uses a scratch learner id.
- **No live model calls in a gate.** Stub engines at the `provider` seam.
- Never point a build/package cache inside the repo. Before your last commit
  `git status --porcelain` must show nothing of yours left uncommitted or littered.
- Author any regex/backslash content with the Write/Edit tools, never a shell heredoc.
- A source-scanning test strips comments before matching.

## Demotion

Past the write set by more than tests plus one coupled doc, or a gate you cannot turn green in
two attempts: revert your own uncommitted work (only your files) and return `demoted` with the
reason.

## Return - write it BEFORE you reply

`.claude/scan-sweep/runs/backlog-2026-09-25/results/<id>.json`:

```json
{"id":"<id>","finding":"<title>","status":"landed|demoted|already-fixed|partial","shas":[],
 "tests_added":0,"cases_red_before":0,"cases_green_after":0,"guard_cases":0,
 "gates":{"<gate>":0},"files_changed":[],"lines_changed":0,
 "before":"<figure>","after":"<figure>","prior_attempt_used":"<sha or none>",
 "deviations":"<anything different from the finding's fix>",
 "notes":"<ANY behaviour change a user or another surface would notice - the coordinator reads this before integrating>"}
```

Do not commit the result file. The coordinator commits the run directory. Then reply with a
five-line summary.
