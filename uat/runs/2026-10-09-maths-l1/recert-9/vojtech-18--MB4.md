# vojtech-18 × MB4 · (recert-9)

- Character: vojtech-18
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head c2dacc69
- Recertifies: 2026-10-09-maths-l1/recert-8 at ee7d6ac7
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-vojtech-18-MB4-3 The only inequality statement is the linear A22; a quadratic or logarithmic ineq… (minor) | recurs → L1-vojtech-18-MB4-3 | Re-walked at c2dacc69; what the previous walk (at ee7d6ac7) found still holds: narrowed by e9c5ee8f, unchanged since: the statements A26-A28 exist (desk/src/lib/library/gcse.ts:85-87, flagged foundation false, touches []) with Czech wording (desk/src/lib/library/gcse-cz.ts:61-63), and git diff ee7d6ac7 c2dacc69 is empty on gcse.ts, gcse-cz.ts, paths.ts and school.ts. They map to no unit because no school unit teaches them, so a question that tests them lands in "Not on the desk yet" with the harder-statement flag. Waits on an owner ruling (accept "Not on the desk yet" for A26-A28) or on new units. Cites re-mapped through git diff -U0 ee7d6ac7 c2dacc69 per file (no hunk). None of the 9 commits since ee7d6ac7 changes what this row cites except as named. | e9c5ee8f |

## New findings

None.

## Notes

- Evidence check at c2dacc69: every cited line was re-mapped through `git diff -U0 ee7d6ac7 c2dacc69` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
