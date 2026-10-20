# vojtech-18 × MB4 · (recert-10)

- Character: vojtech-18
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 67e0a3a6
- Recertifies: 2026-10-09-maths-l1/recert-9 at c2dacc69
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-vojtech-18-MB4-3 The only inequality statement is the linear A22; a quadratic or logarithmic inequality, or a domain, has no statement to pick (minor) | recurs → L1-vojtech-18-MB4-3 | Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: narrowed by e9c5ee8f, unchanged since: the statements A26-A28 exist (desk/src/lib/library/gcse.ts:85-87, flagged foundation false, touches []) with Czech wording (desk/src/lib/library/gcse-cz.ts:61-63). They map to no unit because no school unit teaches them, so a question that tests them lands in "Not on the desk yet" with the harder-statement flag. Waits on an owner ruling (accept "Not on the desk yet" for A26-A28) or on new units. git diff c2dacc69 67e0a3a6 is empty on every file this row cites. None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. | e9c5ee8f (narrowed) |

## New findings

None.

## Notes

- Evidence check at 67e0a3a6: every cited line was re-mapped through `git diff -U0 c2dacc69 67e0a3a6` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
