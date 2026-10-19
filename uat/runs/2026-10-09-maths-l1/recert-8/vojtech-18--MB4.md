# vojtech-18 × MB4 · (recert-8)

- Character: vojtech-18
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-maths-l1/recert-7 at ffa91a49
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-vojtech-18-MB4-3 The only inequality statement is the linear A22; a quadratic or logarithmic ine… (minor) | recurs → L1-vojtech-18-MB4-3 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: narrowed by e9c5ee8f, unchanged since: the statements A26-A28 exist (desk/src/lib/library/gcse.ts:85-87, flagged foundation false, touches []) with Czech wording (desk/src/lib/library/gcse-cz.ts:61-63), and git log e9c5ee8f..HEAD finds no commit on gcse.ts, gcse-cz.ts, paths.ts or school.ts. They map to no unit because no school unit teaches them (the only domain pages are Calculus 1's), so a question that tests them lands in "Not on the desk yet" with the harder-statement flag. The acceptance asks for the units that teach them. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file. None of the 43 commits since ffa91a49 changes what this row cites except as named. | e9c5ee8f |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
