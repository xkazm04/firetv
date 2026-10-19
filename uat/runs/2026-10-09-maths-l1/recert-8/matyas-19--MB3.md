# matyas-19 × MB3 · (recert-8)

- Character: matyas-19
- Journey: MB3
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-maths-l1/recert-7 at ffa91a49
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB3-5 question(spec).tex is computed for every Calculus spec and read by no screen (polish) | recurs → L1-matyas-19-MB3-5 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/rules/calc.ts:380 question() still returns tex for every Calculus spec and desk/src/lib/desk/items.ts:575 kept.push({ spec, question: q.plain, tier }) stores plain only; neither stored nor dropped. Needs an owner ruling to accept "documented" as closing, or the drop plus frozen-fixture rewrite. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
