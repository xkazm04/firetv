# helena-46 × EM1 · (recert-9)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head b7fca776
- Recertifies: 2026-10-09-essay-l1/recert-8 at 318bbea4
- **Verdict now: L1-conditional.** 5 recur; 5 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM1-1 Adult mode's lens home, plan, playbook and x-ray speak only to school… (minor) | recurs → L1-helena-46-EM1-1 | cited lines re-found at b7fca776; no commit since 318bbea4 touched essay/EssayTV.tsx, essay/EssayTV.tsx, essay/EssayTV.tsx, library/lessons.data.ts | none |
| L1-helena-46-EM1-2 Four reading fields are computed and never shown (provider, stats.lin… (minor) | recurs → L1-helena-46-EM1-2 | cited lines re-found at b7fca776; no commit since 318bbea4 touched desk/essay.ts, essay/EssayTV.tsx | none |
| L1-helena-46-EM1-3 The phone refuses a .docx that the PC page accepts (polish) | recurs → L1-helena-46-EM1-3 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched phone/page.tsx, drop/page.tsx | none |
| L1-helena-46-EM1-4 A language the desk does not read is refused only when it is clearly … (polish) | recurs → L1-helena-46-EM1-4 | narrowed, not closed: short Czech 7 of 16, German 6 of 10, other languages sk 2 of 2, pl 1 of 2, fr 2 of 2, es 2 of 2, it 0 of 1, nl 0 of 1. cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched api/analyse/route.ts | 48c75157 (narrows) |
| L1-helena-46-EM1-5 An email read on its own, or a piece read with Keep off, is still jud… (minor) | recurs → L1-helena-46-EM1-5 | cited lines re-found at b7fca776; no commit since 318bbea4 touched phone/page.tsx, phone/page.tsx, desk/essay.ts, api/analyse/route.ts | none |

## New findings

None.

## Notes

- Evidence check at b7fca776: every cited line was re-mapped through `git diff -U0 318bbea4 b7fca776` per file (only desk/src/lib/rules/essay.ts changed in Essay code, by 48c75157; a cite inside a rewritten hunk was re-read by hand). No row is fixed, so no fixing commit is claimed; 48c75157, the commit that narrows three rows, was checked with `git merge-base --is-ancestor 48c75157 b7fca776`. Model-dependent behaviour stays with L2.
