# helena-46 × EM5 · (recert-9)

- Character: helena-46
- Journey: EM5
- Cert level: L1 re-walk, code only, no model
- Head b7fca776
- Recertifies: 2026-10-09-essay-l1/recert-8 at 318bbea4
- **Verdict now: L1-fail.** 4 recur; 4 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM5-1 Reading a kept email puts every sentence on the TV and its first word… (major) | recurs → L1-helena-46-EM5-1 | cited lines re-found at b7fca776; no commit since 318bbea4 touched essay/EssayTV.tsx, essay/EssayTV.tsx, essay/EssayTV.tsx | none |
| L1-helena-46-EM5-2 On /drop the notice's 'Read without keeping' reads nothing, and the e… (minor) | recurs → L1-helena-46-EM5-2 | cited lines re-found at b7fca776; no commit since 318bbea4 touched drop/page.tsx, phone/EssayShelf.tsx, phone/EssayShelf.tsx | none |
| L1-helena-46-EM5-3 Leaving a piece out of the exemplars still lets its text shape the di… (polish) | recurs → L1-helena-46-EM5-3 | cited lines re-found at b7fca776; no commit since 318bbea4 touched twin/card.ts, drop/page.tsx | none |
| L1-helena-46-EM5-4 .docx text: table cells become separate paragraphs and a non-breaking… (polish) | recurs → L1-helena-46-EM5-4 | cited lines re-found at b7fca776; no commit since 318bbea4 touched rules/docx.ts | none |

## New findings

None.

## Notes

- Evidence check at b7fca776: every cited line was re-mapped through `git diff -U0 318bbea4 b7fca776` per file (only desk/src/lib/rules/essay.ts changed in Essay code, by 48c75157; a cite inside a rewritten hunk was re-read by hand). No row is fixed, so no fixing commit is claimed; 48c75157, the commit that narrows three rows, was checked with `git merge-base --is-ancestor 48c75157 b7fca776`. Model-dependent behaviour stays with L2.
