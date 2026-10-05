# Builder brief - /scan-sweep --challenge, run challenge-2026-10-05

You are a BUILDER for ONE approved card. The deck is approved (the owner approved all 12 cards, including
the directions and architecture cards, on 2026-10-05). Read this whole file, then your card.

Tree: C:/Users/kazda/kiro/firetv, branch `main`, shared checkout (other builders of the same wave are writing
it at the same time, with disjoint write sets). Base sha: fa6eb067. Commit on `main` in this checkout,
**never push**, never switch branch, never `git stash`/`reset`/`add -A`/`add .`.
Your card: `.claude/scan-sweep/runs/challenge-2026-10-05/cards-final.json`, the entry whose `id` is given in
your prompt. It carries `write_set`, `new_files`, `acceptance`, `premise`, `rollback`, `gate`. Read the whole
entry, including `body` and `evidence`. The scout's design in `body` is what the owner approved.

## Repo law (binding; breaking it means `demoted`)
Read `.claude/scan-sweep/config.md` (`## Repo law`) and `.claude/spark/config.md` (`## Repo law`). In short:
On Air for every TV surface; decisions stay in `desk/src/lib/rules/`; engines stay behind `desk/src/lib/engines/`;
the session is the only state (desk/src/lib/session/store.ts); withholding is the product (nothing puts the
answer on screen); the TV never asks for typing; a verdict on the TV is a picture, prose only in the caption
slot (~25 words max, empty states two words); do not restyle Lamplight / Open Door / Specimen / Left on the Desk.
- NEVER touch `desk/data/`. A test that needs learner data sets `DESK_DATA_DIR` to a directory under the OS
  temp dir and uses a scratch learner id.
- No live model calls in a gate or a test: stub at the engines `provider` seam.
- Never point a build/test cache inside the repo.

## The order (do not skip a step)
1. **Re-verify the premise on the current tree.** Open every `premise` path:line. A false premise, or a
   change that cannot be done inside the write set: return `demoted` with the reason, change no code.
2. **Write the acceptance cases as tests first** (node:test suites in `tools/*-test.cjs`, transpiling desk TS the
   way `tools/linga-rules-test.cjs` does; Kotlin JUnit for tv-app/core). Run them and WATCH THEM FAIL. Record
   how many were red. Cases labelled `GUARD:` are green before by design: declare them as guards in your
   return. Commit the failing tests: `test(<ctx>): <what>` (a red commit is allowed only for this commit when
   the repo gate cannot run on it; say so in the return).
3. **Build.** Smallest change that makes the cases pass, inside the write set. Growing it by more than the
   tests and one coupled doc is a demotion. New rules suite files are wired into `desk/package.json`
   `test:rules` at the END of the chain, under the shared-surface lock below.
4. **Gates, each in its own invocation, `&&`-chained, exit code asserted (never piped through tail/head):**
   - desk: `cd desk && npm test` (tsc --noEmit, then every rules suite). Run the FULL suite before the last
     commit, not only your suite.
   - Kotlin (tv-app/core): from the repo root in PowerShell `./gradlew.bat :core:test :tv-app:compileDebugKotlin`
     exit 0. If a fresh gradle line needs `local.properties` or the fixture clip and they exist in the main
     checkout, you are in the main checkout and they are there.
   - TV screen touched: the gate above, plus a TV capture or server-side render check as the overlay
     describes; every TV capture needs `/tv?key=` from `<DESK_DATA_DIR>/pairing.json` and a phone paired
     through `/phone?pin=` first. If a capture cannot run, say so in `notes`; do not claim it ran.
   A whole-tree gate red on a path you did not touch is a sibling's in-flight work: wait ~60 s, re-run once,
   then report it instead of fixing a file outside your write set.
5. **Commit as a short series** with pathspec only: `git commit -m "<msg>" -- <your paths>` (only-paths
   semantics). Each commit message ends with the line:
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
   Messages: `test(<ctx>): ...` then `feat|refactor|fix(<ctx>): ...`. Before each commit run `git status
   --porcelain` and confirm the staged/pathspec list is exactly your files. Other people's uncommitted files
   (`.claude/contest/config.md`, `.ai/`, `.personas/`, a sibling's files) are not yours: never include them.

## Shared surfaces and the lock
`desk/package.json`, `.claude/scan-history/scan-sweep.jsonl`, `.claude/scan-history/challenge-runs.jsonl` are
shared. Before editing one, take the lock with an atomic `mkdir <git-dir>/scan-sweep-challenge.lock`
(`git rev-parse --git-dir` gives the path; retry every few seconds; the lock is stale after 10 minutes), make
the edit (append at the END of a list, never reflow), commit it IMMEDIATELY and alone with a pathspec, then
`rmdir` the lock. Generated or locale files other cards write follow the same rule. Also: `desk/src/tv/keys.ts`,
`desk/src/lib/session/store.ts`, `desk/src/tv/screens.tsx` are hot files in many cards; edit narrowly, commit
at once, and re-read the file right before editing since a sibling may have changed it.

## Demotion
Past the write set, past L, a premise that is false, or a gate you cannot turn green in two attempts: revert
your own UNCOMMITTED work (and `git revert --no-edit` your own commits if any landed), and return `demoted`
with why. Never leave the tree red or half-applied.

## Return - write BEFORE you reply
Write `.claude/scan-sweep/runs/challenge-2026-10-05/results/<id>.json`:
{"card":"<id>","status":"landed|demoted|partial","shas":["..."],"tests_added":N,"cases_total":N,"cases_red_before":N,
 "cases_guard":N,"cases_green_after":N,"gates":{"<name>":<exit code>},"files_changed":N,"lines_changed":N,
 "deviations_from_card":"...","notes":"...: EVERY behaviour change a user could see that the card did not list;
 every place you disagreed with the scout's design; whether a TV capture ran"}
Use the Write tool (not a heredoc). Then reply with one short paragraph: status, shas, cases red-before /
green-after, gates, deviations. Nothing else. Do not run /scan-sweep, do not push, do not touch another card's files.
