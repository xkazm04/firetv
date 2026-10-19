# kristyna-17 × EM1 · (recert-9)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head b7fca776
- Recertifies: 2026-10-09-essay-l1/recert-8 at 318bbea4
- **Verdict now: L1-conditional.** 6 recur; 6 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on En… (major) | recurs → L1-kristyna-17-EM1-1 | narrowed, not closed: 6 of 30 plain-letter Czech paragraphs still leak in the fresh probe (0 of 30 with diacritics); a leaked paragraph is still ruled on the English lists. cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched api/analyse/route.ts | 48c75157 (narrows) |
| L1-kristyna-17-EM1-2 ES-READ: kind and mode now reach the reading, a task has no sender an… (major) | recurs → L1-kristyna-17-EM1-2 | cited lines re-found at b7fca776; no commit since 318bbea4 touched desk/essay.ts, api/analyse/route.ts, phone/page.tsx, rules/voice.ts | none |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatev… (minor) | recurs → L1-kristyna-17-EM1-3 | 6 of 30 plain-letter Czech paragraphs still pass the language check in the fresh probe and reach the model; no language instruction was added to the prompt. cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched desk/essay.ts; the cite :178-184 sits in a hunk 48c75157 rewrote and is re-read by hand at :194-200 | none |
| L1-kristyna-17-EM1-4 stats.links and stats.words are computed for every reading and shown … (minor) | recurs → L1-kristyna-17-EM1-4 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched essay/EssayTV.tsx | none |
| L1-kristyna-17-EM1-5 The language check lets some Czech through: a paragraph whose shared … (major) | recurs → L1-kristyna-17-EM1-5 | narrowed, not closed: Czech refusal 0.90 on a fresh 60-paragraph corpus (diacritics 30 of 30, plain 24 of 30) against 0.95; the held-out set refuses all 3 Czech texts it holds, but holds no plain-letter Czech. cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched api/analyse/route.ts | 48c75157 (narrows) |
| L1-kristyna-17-EM1-6 Nothing says before the first send that Essay Master reads English; o… (minor) | recurs → L1-kristyna-17-EM1-6 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched phone/page.tsx, tv/profileRows.ts, tv/keys.ts, api/analyse/route.ts | none |

## New findings

None.

## Notes

- Evidence check at b7fca776: every cited line was re-mapped through `git diff -U0 318bbea4 b7fca776` per file (only desk/src/lib/rules/essay.ts changed in Essay code, by 48c75157; a cite inside a rewritten hunk was re-read by hand). No row is fixed, so no fixing commit is claimed; 48c75157, the commit that narrows three rows, was checked with `git merge-base --is-ancestor 48c75157 b7fca776`. Model-dependent behaviour stays with L2.
