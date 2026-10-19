# barbora-43 × EM4 · (recert-9)

- Character: barbora-43
- Journey: EM4
- Cert level: L1 re-walk, code only, no model
- Head b7fca776
- Recertifies: 2026-10-09-essay-l1/recert-8 at 318bbea4
- **Verdict now: L1-conditional.** 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM4-1 A paragraph-only evening's delete is out of reach when the TV is on a… (major) | recurs → L1-barbora-43-EM4-1 | cited lines re-found at b7fca776; no commit since 318bbea4 touched phone/EssayShelf.tsx, session/store.ts, phone/page.tsx | none |
| L1-barbora-43-EM4-2 A piece is 'one reading' on the recap but 'one piece' on the Sunday p… (polish) | recurs → L1-barbora-43-EM4-2 | cited lines re-found at b7fca776; no commit since 318bbea4 touched tv/recapRows.ts, rules/week.ts | none |

## New findings

None.

## Notes

- Evidence check at b7fca776: every cited line was re-mapped through `git diff -U0 318bbea4 b7fca776` per file (only desk/src/lib/rules/essay.ts changed in Essay code, by 48c75157; a cite inside a rewritten hunk was re-read by hand). No row is fixed, so no fixing commit is claimed; 48c75157, the commit that narrows three rows, was checked with `git merge-base --is-ancestor 48c75157 b7fca776`. Model-dependent behaviour stays with L2.
