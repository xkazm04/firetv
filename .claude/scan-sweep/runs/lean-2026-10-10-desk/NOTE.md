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
