# barbora-43 × EM1 · (recert-9)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head b7fca776
- Recertifies: 2026-10-09-essay-l1/recert-8 at 318bbea4
- **Verdict now: L1-conditional.** 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-1 The x-ray shows a hand-in-ready model paragraph on the topic of the p… (major) | recurs → L1-barbora-43-EM1-1 | cited lines re-found at b7fca776; no commit since 318bbea4 touched essay/EssayTV.tsx, phone/page.tsx, session/store.ts | none |
| L1-barbora-43-EM1-2 ES-READ grounding: the reading still never sees her earlier readings … (major) | recurs → L1-barbora-43-EM1-2 | cited lines re-found at b7fca776; no commit since 318bbea4 touched desk/essay.ts, desk/essay.ts, api/analyse/route.ts, phone/page.tsx | none |

## New findings

None.

## Notes

- Evidence check at b7fca776: every cited line was re-mapped through `git diff -U0 318bbea4 b7fca776` per file (only desk/src/lib/rules/essay.ts changed in Essay code, by 48c75157; a cite inside a rewritten hunk was re-read by hand). No row is fixed, so no fixing commit is claimed; 48c75157, the commit that narrows three rows, was checked with `git merge-base --is-ancestor 48c75157 b7fca776`. Model-dependent behaviour stays with L2.
