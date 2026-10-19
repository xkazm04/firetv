# kristyna-17 × EM1 ·  (recert-8)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 318bbea4
- Recertifies: 2026-10-09-essay-l1/recert-7 at 5096c0ce
- **Verdict now: L1-conditional.** 6 recur; 6 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word … (major) | recurs → L1-kristyna-17-EM1-1 | narrowed, not closed: fewer leaks after 2ab0130f (21 of 74 in the probe); a leaked paragraph is still ruled on the English lists. cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched api/analyse/route.ts | 2ab0130f (narrows) |
| L1-kristyna-17-EM1-2 ES-READ: kind and mode now reach the reading, a task has no sender and no histor… (major) | recurs → L1-kristyna-17-EM1-2 | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files | none |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever language… (minor) | recurs → L1-kristyna-17-EM1-3 | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and a cite sits in a changed hunk: re-read by hand (the language check 2ab0130f rewrote); no commit since 5096c0ce touched desk/essay.ts | none |
| L1-kristyna-17-EM1-4 stats.links and stats.words are computed for every reading and shown nowhere (minor) | recurs → L1-kristyna-17-EM1-4 | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched essay/EssayTV.tsx | none |
| L1-kristyna-17-EM1-5 The language check lets some Czech through: a paragraph whose shared function wo… (major) | recurs → L1-kristyna-17-EM1-5 | narrowed, not closed: refusal 0.716 on a 74-paragraph Czech corpus; the acceptance asks 0.95 on 50+. cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and a cite sits in a changed hunk: re-read by hand (the language check 2ab0130f rewrote); no commit since 5096c0ce touched api/analyse/route.ts | 2ab0130f (narrows) |
| L1-kristyna-17-EM1-6 Nothing says before the first send that Essay Master reads English; on the plan … (minor) | recurs → L1-kristyna-17-EM1-6 | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched phone/page.tsx, tv/profileRows.ts, tv/keys.ts, api/analyse/route.ts | none |

## New findings

None.

## Notes

- Evidence check at 318bbea4: every cited line was re-mapped through `git diff -U0 5096c0ce 318bbea4` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. The rows 2ab0130f names were executed in a scratch probe outside the repo. Model-dependent behaviour stays with L2.
