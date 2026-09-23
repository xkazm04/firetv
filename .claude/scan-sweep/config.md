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
| `tv-app/` | `./gradlew.bat :core:test :tv-app:compileDebugKotlin` |
| a TV screen (`desk/src/tv`, `desk/src/app/tv`, `desk/src/english/LingaTV.tsx`) | the gate above, plus a Playwright capture from `tools/` against a second dev server (`next dev --webpack` in a worktree) with its own seeded `DESK_DATA_DIR` |
| `uat/driver` | `node --check uat/driver/linga-text.cjs`; a live LT run costs codex calls and is the operator's call |

**Full-tree before the last commit** (references/challenge.md section 7 step 4): `cd desk && npm
test` always, and the gradle line whenever anything Kotlin changed. The rules suites are wired
through `desk/package.json`'s `test:rules`; a new suite is appended at the END of that chain
under the shared-surface lock.

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
