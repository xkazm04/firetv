# matyas-19 × MB3 · (recert-9)

- Character: matyas-19
- Journey: MB3
- Cert level: L1 re-walk, code only, no model
- Head c2dacc69
- Recertifies: 2026-10-09-maths-l1/recert-8 at ee7d6ac7
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB3-5 question(spec).tex is computed for every Calculus spec and read by no screen (polish) | recurs → L1-matyas-19-MB3-5 | Re-walked at c2dacc69; what the previous walk (at ee7d6ac7) found still holds: desk/src/lib/rules/calc.ts:380 question() still returns tex for every Calculus spec and desk/src/lib/desk/items.ts:575 kept.push({ spec, question: q.plain, tier }) stores plain only; neither stored nor dropped. calc.ts and items.ts are unchanged since ee7d6ac7. Waits on an owner ruling: accept "documented" as closing, or the drop plus frozen-fixture rewrite. Cites re-mapped through git diff -U0 ee7d6ac7 c2dacc69 per file (no hunk in either file). None of the 9 commits since ee7d6ac7 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at c2dacc69: every cited line was re-mapped through `git diff -U0 ee7d6ac7 c2dacc69` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
