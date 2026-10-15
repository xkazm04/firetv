# lean-2026-10-10-desk

Swept commit: 2498060d (main). Repo firetv, desk/ only. Nothing pushed.

## Commands (from desk/, after `node tools/worktree-preflight.cjs`)
```
node node_modules/typescript/bin/tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters
```
Output before the removals: `tsc-before.txt` (7 TS6133 lines, same as the brief). After: `tsc-after.txt` (2 lines: read.ts num, screens.tsx Clock). Plain `node node_modules/typescript/bin/tsc --noEmit` exits 0 after the removals. `npm run test:rules`: 75 green, 0 red (1359/1359).

```
node no-importer.cjs  > no-importer.out   # 5 files with no desk/src importer
node unused-exports.cjs > unused-exports.out   # 560 exported names
node build-findings.cjs                       # writes findings.jsonl
```
Scripts use the TypeScript compiler API from desk/node_modules (through the link), `@/` alias resolved, tools/ searched as text.

## Counts per kind (findings.jsonl, 572 lines)
- unused-local: 5 (3 built: G, takeSpent, DAY; 2 open: read.ts num, screens.tsx Clock)
- unused-param: 2 (2 built: school.ts u -> _u, rulerRows.ts x -> _x)
- no-importer: 5 (3 intentional: paperRead.ts, paperScore.ts, cambridge.ts; 2 open: lib/library/calculus1.ts and lib/rules/habits.ts)
- unused-export: 560 (all open, counted only, no judgement)

## Differences from the brief
- The brief expected 3 no-importer files under the rule "no desk/src importer AND no tools/ file names it". Run literally, that rule gives 0, because tools/ names all of paperRead.ts (paper-probe*.cjs, econ-rules-test.cjs), paperScore.ts and cambridge.ts. The script therefore lists every file with no desk/src importer and records `namedByTools`; that gives 5. The two extra, calculus1.ts and habits.ts, are required only by rule suites (calc-*-test.cjs, habits-rules-test.cjs); filed open as test-only modules.
- Unused-export is name-level: a file imported with `import *`, `export *` or dynamic import counts all its names as used; an export is also spared if its name appears anywhere in tools/ as a word.

## Kept open
- read.ts:103 `num`: looks like a missed use (the one unguarded item field is `i.number`, and missingNumbers reads a non-integer n as unknown). Not removed; owner decides.
- screens.tsx:38 `Clock`: delivery 7b's file.

Nothing failed to run.

## Correction 2026-10-11 (L2)
Matcher defect: unused-exports.cjs line 16 built its RegExp from a string with a single backslash, so `\b` was a backspace (U+0008) and the rule "an export that tools/ names as a word is spared" never fired. Fixed in 53fca526 (doubled backslashes, regex metacharacters in the name escaped). Re-run on main 4f930cc9 writes unused-exports.out and .err: 283 lines, of which 274 are rows of the original 560 and 9 are new.

Counts per status (572 rows):
- before: built 6, intentional 3, open 563, declined 0, descoped 0
- after: built 7, intentional 5, open 274, declined 286, descoped 0

- 286 unused-export rows declined: named in tools/ as a word. 274 stay open. None descoped (every old row still sits in the same file; none was imported since).
- New exports that appear only in the corrected run (added after 2498060d), not added as rows: 9 (ExplainTalkProps, Seen, weakPass, Rests, CONFIDENCE_HIGH, PieceLike, ParagraphState, unsureLine, FUNCTION_ALIASES).
- L2-1: read.ts `num` deleted in 8d625e92 (row 2 now built).
- L2-3: calculus1.ts and habits.ts set intentional (test-only corpus; habit detectors whose callers are not built yet).

tsc after L2-1, from desk/: `--noEmit --incremental false --noUnusedLocals --noUnusedParameters` prints nothing (no TS6133, screens.tsx Clock is gone from main too); plain `tsc --noEmit` exits 0.

## L3 (2026-10-11)
Commit bc611df3. Removed paperTopicCount from desk/src/tv/paperRows.ts: nothing in desk/ or tools/ reads it (only prose in the rulings doc and uat findings.json). Removed paperRows' own SCHOOL and prereqsOf plus the topicsOf import; recovery.ts prereqsOf is now exported and paperRows imports it. Safe because both walk topicsOf('school') prereqs identically and give an empty set for an unknown id, so paperBiggest and paperCaption behave the same. tsc --noEmit exits 0, the strict unused flags report nothing in paperRows.ts or recovery.ts, test:rules stays at 1658 passing. Rows: 574 (built 9).
