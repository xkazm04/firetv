# kristyna-17 × EM3 · (recert-9)

- Character: kristyna-17
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head b7fca776
- Recertifies: 2026-10-09-essay-l1/recert-8 at 318bbea4
- **Verdict now: L1-conditional.** 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM3-1 A plain title line becomes paragraph 1 of the piece, costs a model ca… (minor) | recurs → L1-kristyna-17-EM3-1 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) but not at the cited lines; no commit since 318bbea4 touched desk/essay.ts | none |
| L1-kristyna-17-EM3-2 GET /api/texts returns noticed and notice that no screen reads (minor) | recurs → L1-kristyna-17-EM3-2 | cited lines re-found at b7fca776; no commit since 318bbea4 touched api/texts/route.ts, phone/EssayShelf.tsx | none |

## New findings

None.

## Notes

- Evidence check at b7fca776: every cited line was re-mapped through `git diff -U0 318bbea4 b7fca776` per file (only desk/src/lib/rules/essay.ts changed in Essay code, by 48c75157; a cite inside a rewritten hunk was re-read by hand). No row is fixed, so no fixing commit is claimed; 48c75157, the commit that narrows three rows, was checked with `git merge-base --is-ancestor 48c75157 b7fca776`. Model-dependent behaviour stays with L2.
