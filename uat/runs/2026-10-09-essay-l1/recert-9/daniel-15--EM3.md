# daniel-15 × EM3 · (recert-9)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head b7fca776
- Recertifies: 2026-10-09-essay-l1/recert-8 at 318bbea4
- **Verdict now: L1-conditional.** 5 recur; 5 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-1 The paste box and the shelf are hidden whenever the TV is on the fore… (major) | recurs → L1-daniel-15-EM3-1 | cited lines re-found at b7fca776; no commit since 318bbea4 touched phone/page.tsx, phone/page.tsx, tv/keys.ts | none |
| L1-daniel-15-EM3-2 A title line is read as its own paragraph or fuses into sentence 1; t… (major) | recurs → L1-daniel-15-EM3-2 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) but not at the cited lines; no commit since 318bbea4 touched desk/essay.ts | none |
| L1-daniel-15-EM3-3 Nothing says grammar and spelling are not checked; 'Well done' lands … (minor) | recurs → L1-daniel-15-EM3-3 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched essay/EssayTV.tsx | none |
| L1-daniel-15-EM3-4 Present-and-correct-but-unwired: provider, stats.words, stats.links; … (minor) | recurs → L1-daniel-15-EM3-4 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched api/texts/route.ts, essay/EssayTV.tsx | none |
| L1-daniel-15-EM3-5 No verdict lands until the last paragraph is read (C3 second clause f… (major) | recurs → L1-daniel-15-EM3-5 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched desk/essay.ts, essay/EssayTV.tsx | none |

## New findings

None.

## Notes

- Evidence check at b7fca776: every cited line was re-mapped through `git diff -U0 318bbea4 b7fca776` per file (only desk/src/lib/rules/essay.ts changed in Essay code, by 48c75157; a cite inside a rewritten hunk was re-read by hand). No row is fixed, so no fixing commit is claimed; 48c75157, the commit that narrows three rows, was checked with `git merge-base --is-ancestor 48c75157 b7fca776`. Model-dependent behaviour stays with L2.
