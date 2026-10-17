# vojtech-18 × MB4 ·  (recert-5)

- Character: vojtech-18
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-maths-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-vojtech-18-MB4-1 The TV never shows which statement led a question to a topic (topics[].codes un… (minor) | recurs → L1-vojtech-18-MB4-1 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-vojtech-18-MB4-2 Back from an off-desk row of the recovery list lands on Equivalent fractions (minor) | recurs → L1-vojtech-18-MB4-2 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-vojtech-18-MB4-3 The only inequality statement is the linear A22; a quadratic or logarithmic ine… (minor) | recurs → L1-vojtech-18-MB4-3 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
