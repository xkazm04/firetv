# eliska-12 × EM1 · (recert-9)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head b7fca776
- Recertifies: 2026-10-09-essay-l1/recert-8 at 318bbea4
- **Verdict now: L1-conditional.** 6 recur; 6 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-1 Every faulty note is a code line not in the young voice: 'asserts', '… (major) | recurs → L1-eliska-12-EM1-1 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched the cited files | none |
| L1-eliska-12-EM1-2 The forensic crumb, 'Its job' and the table show the regex first-pass… (minor) | recurs → L1-eliska-12-EM1-2 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) but not at the cited lines; no commit since 318bbea4 touched essay/EssayTV.tsx | none |
| L1-eliska-12-EM1-3 stats.links (PEEL's L) and stats.words are computed for every reading… (polish) | recurs → L1-eliska-12-EM1-3 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched essay/EssayTV.tsx | none |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / b… (major) | recurs → L1-eliska-12-EM1-4 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched desk/essay.ts | none |
| L1-eliska-12-EM1-5 PEEL's Explain is still marked faulty when it has no connector or lin… (minor) | recurs → L1-eliska-12-EM1-5 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched the cited files | none |
| L1-eliska-12-EM1-6 cleanFix's content check is a closed list of verbs: a frame with any … (minor) | recurs → L1-eliska-12-EM1-6 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at b7fca776: every cited line was re-mapped through `git diff -U0 318bbea4 b7fca776` per file (only desk/src/lib/rules/essay.ts changed in Essay code, by 48c75157; a cite inside a rewritten hunk was re-read by hand). No row is fixed, so no fixing commit is claimed; 48c75157, the commit that narrows three rows, was checked with `git merge-base --is-ancestor 48c75157 b7fca776`. Model-dependent behaviour stays with L2.
