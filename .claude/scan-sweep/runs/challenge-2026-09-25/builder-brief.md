# Builder brief - /scan-sweep --challenge, run challenge-2026-09-25

- Tree: `C:/Users/kazda/kiro/firetv`, the main checkout, branch `main` (base 7e47fbd). **Commit on main. Never push, never switch
  branches, never merge or rebase.** A dev server may be running here against real learner data: never write
  `desk/data/`, and if you start your own dev server use another port and `DESK_DATA_DIR` under the OS temp dir.
- Other builders are writing in the SAME worktree at the same time, on disjoint write sets.
- The deck was approved by the operator ("Build all 12"); your card is approved, including its gate.
- Method (long form): `C:/Users/kazda/kiro/firetv/.claude/skills/scan-sweep/references/challenge.md` section 7.

## Your card
Read your card from `.claude/scan-sweep/runs/challenge-2026-09-25/cards/<host>.json`, the slot named in your
prompt. It is verbatim: `acceptance`, `write_set`, `premise`, `body`. If it carries `critic_revise`, that change
is BINDING and overrides the card text where they disagree. If it carries `depends_on`, those cards have
already landed on this branch - read their commits (`git log --oneline`) and build on them, not around them.

## Design languages (binding)
The modules have operator-chosen design languages: Math Buddy = Lamplight (docs/DESIGN-MATH-BUDDY.md), Linga = the Open
Door (docs/DESIGN-LINGA.md), Essay Master = Specimen (docs/DESIGN-ESSAY-MASTER.md), landing = Left on the Desk
(docs/DESIGN-STUDY-DESK.md); On Air stays for the shell (pair/join/learner) and whatever still uses it. A new element
on a module screen speaks that module's language, never On Air. The TV is not a book: a verdict is a picture, prose
only in the caption slot (~25 words max visible body text), empty states two words.

## TV screens - the browser gate
If you change a TV screen, capture it with Playwright from `tools/` against your OWN `next dev --webpack` on a spare
port with a seeded `DESK_DATA_DIR` in the OS temp dir; stop the server after. If that cannot run, say why and
substitute a server-side render - and mark it in the result.

## Repo law (void if broken)
`.claude/scan-sweep/config.md` and `.claude/spark/config.md` "## Repo law": On Air for TV surfaces (nothing
under 28 px, the TV never asks for typing, one band per screen); decisions stay in `desk/src/lib/rules/`
(the model phrases, code decides); engines only behind `desk/src/lib/engines/`; the session store is the only
product state; **withholding is the product** - no answer, verb form or rewritten sentence on screen; never
touch `desk/data/` (tests set `DESK_DATA_DIR` under the OS temp dir, scratch learner ids); no live model call in
any test - stub at the provider seam. `desk/` runs a Next.js with breaking changes: read
`desk/node_modules/next/dist/docs/` before writing Next-specific code (route handlers, server/client boundary).
The TV (`desk/src/app/tv`, `desk/src/tv`) is a client component and must not import filesystem-backed modules.

## Order - do not reorder
1. **Re-verify the premise** on the current tree (other cards may have landed since the card was written). A
   premise that is now false -> write your result as `demoted`, no code.
2. **Write the acceptance cases as tests first and watch them FAIL.** Record how many are red. A case the card
   labels `GUARD:` is green before by design - declare it as a guard in your result. New desk suites follow
   the loader pattern of `tools/linga-rules-test.cjs`; Kotlin cases go in `core/src/test` (JUnit).
3. **Build** inside the write set. You may shrink it. Growing it beyond the tests plus one coupled doc is a
   demotion: revert your own uncommitted work and return `demoted` with why.
4. **Gates, each asserted by exit code, each in its own invocation, `&&`-chained, never piped into tail:**
   - your own new/changed suite(s) green;
   - **before the last commit, the FULL desk gate:** `cd desk && npm test` (tsc + every rules suite) - exit 0.
     Repos keep guards away from what they guard; a folder-scoped green is not enough;
   - Kotlin cards: from the tree root in PowerShell, `.\gradlew.bat :core:test :tv-app:compileDebugKotlin`
     exit 0 (and `cd desk && npm test` only if you touched desk/ or tools/*.cjs).
   A whole-tree gate red on a path you did NOT touch is a sibling's in-flight work: wait ~60 s, re-run once,
   then report it; never "fix" a file outside your write set.
   Two failed attempts at turning a gate green -> revert your own uncommitted work, return `demoted`.
5. **Commit as a short series, each commit green.** Red-before is measured in your working tree and recorded in the
   result, not committed red: a case that is red until the fix lands rides in the fix commit (or a test commit after it).
   Series: `test(<ctx>): <cases>` then `feat|refactor(<ctx>): <title>`.
   **Commit with `git commit -m "..." -- <paths>` (only-paths); never `git add -A`/`.`, never a bare
   `git commit`, never `git stash`, never reset.** New files: `git add -- <newfile>` immediately before the
   pathspec commit that includes them. Body: the lens, the card id, and the re-measured figure
   ("acceptance 0/8 -> 8/8"). End every message with:
   `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`

## Shared surface: desk/package.json (the `test:rules` chain)
Take the lock before editing it: `mkdir "$(git rev-parse --git-dir)/scan-sweep-challenge.lock"` - retry every
5 s until it succeeds (stale after 10 minutes). Append your suite at the END of `test:rules` (`&& node
../tools/<suite>.cjs`), never reflow the file, commit that one file IMMEDIATELY and alone
(`git commit -m "..." -- desk/package.json`), then `rmdir` the lock. Do this only once your suite exists.

## Hygiene
No cache or scratch dir inside the tree (npm/gradle caches stay where they are; temp data in the OS temp dir).
Before your last commit `git status --porcelain` must show nothing of yours uncommitted. Leave
`.claude/scan-sweep/runs/` alone except your result file.

## Result - write BEFORE you reply
Write `.claude/scan-sweep/runs/challenge-2026-09-25/results/<host>-<slot letter>.json` with the Write tool:
{"card":"<host> <slot>","status":"landed|demoted|partial","shas":["..."],"tests_added":<n>,
 "guards_declared":<n>,"cases_red_before":<n>,"cases_green_after":<n>,"cases_total":<n>,
 "gates":{"<command>":<exit code>},"files_changed":<n>,"lines_changed":<n>,
 "deviations_from_card":"<what differs from the card and why, or none>","notes":"<anything the next wave must know>"}
Then reply in five lines or fewer: status, shas, cases red-before/green-after, gates, deviations.
