# kristyna-17 × EM3 ·  (recert-8)

- Character: kristyna-17
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 318bbea4
- Recertifies: 2026-10-09-essay-l1/recert-7 at 5096c0ce
- **Verdict now: L1-conditional.** 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM3-1 A plain title line becomes paragraph 1 of the piece, costs a model call, and can… (minor) | recurs → L1-kristyna-17-EM3-1 | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) but not at the cited lines; no commit since 5096c0ce touched desk/essay.ts | none |
| L1-kristyna-17-EM3-2 GET /api/texts returns noticed and notice that no screen reads (minor) | recurs → L1-kristyna-17-EM3-2 | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 318bbea4: every cited line was re-mapped through `git diff -U0 5096c0ce 318bbea4` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. The rows 2ab0130f names were executed in a scratch probe outside the repo. Model-dependent behaviour stays with L2.
