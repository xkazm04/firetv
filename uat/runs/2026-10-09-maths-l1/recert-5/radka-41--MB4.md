# radka-41 × MB4 ·  (recert-5)

- Character: radka-41
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-maths-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB4-1 A cz parent picks Czech statements, but the TV and the Prepare line echo the En… (minor) | recurs → L1-radka-41-MB4-1 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
