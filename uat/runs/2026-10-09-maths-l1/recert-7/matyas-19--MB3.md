# matyas-19 × MB3 · (recert-7)

- Character: matyas-19
- Journey: MB3
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-maths-l1/recert-6 at 6b189791
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB3-5 question(spec).tex is computed for every Calculus spec and read by no screen (polish) | recurs → L1-matyas-19-MB3-5 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: narrowed by fa24f5d1; still missing: The tex field is still computed and read by no screen: items.ts does not store tex for the typesetter, nor is the field (and the calc.ts:380-396 tex strings, with the frozen fixtures) dropped; only a comment was added. Needs an owner ruling to accept 'documented' as closing, or the drop plus frozen-fixture rewrite. None of the seven commits since 6b189791 (56f903ae, da6f9f07, 3240d025 and e9c5ee8f are the Math commits; b75bd45f, 61a8e2ee and ffa91a49 are Essay) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
