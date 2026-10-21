---
contextMap: context-map.json
memoryOutbox: .personas/memory-outbox.jsonl
backlogDigest: .personas/backlog-digest.json
openBacklogs: .claude/scan-history/open-backlogs.jsonl
neverSweep: []
challenge:
  cohort: 6
  waveSize: 4
  worktrees: false
  sharedSurfaces:
    - desk/package.json
    - .claude/scan-history/scan-sweep.jsonl
    - .claude/scan-history/challenge-runs.jsonl
---

# /scan-sweep overlay - firetv (Study Desk)

Adopted 2026-09-23. The skill is linked at `.claude/skills/scan-sweep` (a junction to the local
ai-registry checkout; `.claude/skills/` is gitignored machine state). The context map at the repo
root was written the same day: seven groups, fifteen contexts, tests listed with the context they
exercise.

## Gates

Each runs in its own invocation, `&&`-chained, exit code asserted (SKILL.md section 7.2).

| Surface | Gate |
| --- | --- |
| anything under `desk/` or a `tools/*-rules-test.cjs` | `cd desk && npm test` (tsc --noEmit, then every rules suite in `test:rules`) |
| `core/` | `./gradlew.bat :core:test` from the repo root (PowerShell), exit 0 |
| `tv-app/` | `./gradlew.bat :core:test :tv-app:compileDebugKotlin :tv-app:testDebugUnitTest` (the JVM tests landed 2026-10-13) |
| a TV screen (`desk/src/tv`, `desk/src/app/tv`, `desk/src/english/LingaTV.tsx`) | the gate above, plus a Playwright capture from `tools/` against a second dev server (`next dev --webpack` in a worktree) with its own seeded `DESK_DATA_DIR` |
| `uat/driver` | `node --check uat/driver/linga-text.cjs`; a live LT run costs claude CLI subscription calls (every role since 2026-10-09) and is the operator's call |

**Full-tree before the last commit** (references/challenge.md section 7 step 4): `cd desk && npm
test` always, and the gradle line whenever anything Kotlin changed. The rules suites are wired
through `desk/package.json`'s `test:rules`; a new suite goes into `rulesSuites` in desk/package.json just BEFORE `harness-rules-test.cjs`, which stays
last (run by `test:rules`, `node ../tools/run-rules.cjs`; harness-rules-test holds the rule), under the shared-surface lock.

A fresh worktree needs two gitignored files copied from the main checkout before the gradle
line can pass: `local.properties` (SDK path) and `tv-app/src/main/res/raw/fixture_clip.mp4`
(without it `R.raw` does not exist and `MainActivity.kt` fails to compile).

`npm test`'s `pretest` (`tools/worktree-preflight.cjs`) links `desk/node_modules` from the main
checkout when a worktree has none. The main checkout's `desk/node_modules/.bin` was missing on
2026-09-23 (tsc not found); `npm rebuild --ignore-scripts` restored the links.

## Repo law

The `/spark` overlay's `## Repo law` (`.claude/spark/config.md`) binds every build here, verbatim:
On Air for every TV surface, decisions stay in `desk/src/lib/rules/`, engines stay behind
`desk/src/lib/engines/`, the session is the only state, withholding is the product,
pathspec-scoped commits. Two more for this skill:

- **Never touch `desk/data/`** (the real learners Ema and Jakub). A test or builder that needs
  learner data sets `DESK_DATA_DIR` to a directory under the OS temp dir and uses a scratch
  learner id.
- **No live model calls in a gate.** The rules suites run with no Claude CLI, codex, Ollama or
  ElevenLabs; a test that needs an engine stubs it at the `provider` seam.

## Skill improvement log

- 2026-09-23 (first --challenge run): both coordinator fixes were regressions every gate passed - a stricter engine schema turning a dropped optional moment into a failed Linga turn, and a job layer whose new error sentence the phone still prefixed. Both were in the builder's own "notes", not in any red gate. Read every builder's notes for a behaviour change before starting the next wave.
- 2026-09-23: `desk/src/lib/session/store.ts`, `desk/src/tv/screens.tsx` and `uat/driver/linga-text.cjs` are in almost every desk card's write set; twelve cards needed six waves. Expect it, and let the scouts see the cohort's other hosts so two hosts do not propose the same move (two duplicate pairs this run, both resolved by the critic as revise-into-increment).
- 2026-09-23: the TV Playwright gate could not run for any card: the main checkout's `desk/node_modules` lacks `@next/env` (and had no `.bin`), and worktrees link to it. Every TV card substituted a server-side render. Fix the install before the next run that touches a TV screen.
- 2026-09-25 (backlog drain): five of the seven open findings had a prior Lane B build on a branch the owner had deleted; `git log <deleted tip>` still resolved it, and builders briefed with those dangling shas as reference only (rebuild on the current tree, re-verify, never cherry-pick) all landed. Before draining a backlog, look for the prior attempt.
- 2026-09-25 (second --challenge run): once pairing became a server fact (bc4d79b), every TV capture needs `/tv?key=` from `<DESK_DATA_DIR>/pairing.json` and a phone paired through `/phone?pin=` before navigating; a second `next dev` in the main checkout sometimes refused to start beside the operator's :3001, and the builder copied `desk/` to the OS temp dir instead. Tell TV builders both up front.
- 2026-09-30 (--optimize): `coverage.mjs --next` names the first context with no non-challenge snapshot. The outbox already had a full optimize pass on linga while the ledger was challenge-only, so `--next` said linga. Do not backfill guessed rows. When every snapshot is strategy challenge, read the outbox before trusting `--next`.
- 2026-09-30 (second linga optimize): once math-buddy, essay-master and landing have ledger rows, linga is the right next context again — its only ledger rows are challenge and its optimize sweep lives in the outbox. An outbox "Fixed:" line can be a lost commit (`fb9f0a0` is not an ancestor of HEAD); check the ancestor before treating it as still true.
- 2026-10-05 (third --challenge run): when a wave shares a checkout, a builder that finishes first sees the whole-tree chain red on a sibling file; three builders handed off without a full-chain exit 0 (landing-A, uat-B, math-buddy-B). Either serialise the last 10 minutes of a wave or have the coordinator own the chain run and count a builder flawless on its own suites plus the coordinator integration gate. The critic and every builder here ran on one model, so idea_score is self-graded; say so in the scorecard. tv-app cards cannot be device-verified from this machine: put the owed capture in the register row, not only in notes.
- 2026-10-05: the coverage.mjs --challenge cohort listed landing at 4 files and essay-master as a rider; the scouts found real structure there anyway (landing-A touched the session seat swap). A context-map file count below 10 is not a reason to expect a thin card.
- 2026-10-13 (--optimize, director fan-out over all 18 contexts, then one Lane B drain): give every A/B worktree BOTH junctions, desk/node_modules and tools/node_modules. Since the drain, device-rules-test (in desk's test:rules) imports pngjs and ws through tools/device.mjs, and worktree-preflight links only desk/node_modules, so a worktree without tools/node_modules reads 11 red that are not a defect (carded in desk-tooling.jsonl).
- 2026-10-13: when a Lane B worker's verdict rests on an external behaviour no recorded reply proves (vision: "Ollama answers 400 to a rejected think key"), hold that commit on its branch and merge the rest of the group around it. A green stubbed gate cannot see an assumption about the stub.
