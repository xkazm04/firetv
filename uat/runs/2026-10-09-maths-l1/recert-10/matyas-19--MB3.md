# matyas-19 × MB3 · (recert-10)

- Character: matyas-19
- Journey: MB3
- Cert level: L1 re-walk, code only, no model
- Head 67e0a3a6
- Recertifies: 2026-10-09-maths-l1/recert-9 at c2dacc69
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB3-5 question(spec).tex is computed for every Calculus spec and read by no screen (polish) | recurs → L1-matyas-19-MB3-5 | Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: desk/src/lib/rules/calc.ts:380 question() still returns tex for every Calculus spec and desk/src/lib/desk/items.ts:575 kept.push({ spec, question: q.plain, tier }) stores plain only; neither stored nor dropped. Waits on an owner ruling: accept "documented" as closing, or the drop plus frozen-fixture rewrite. git diff c2dacc69 67e0a3a6 is empty on every file this row cites. None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. | fa24f5d1 (narrowed) |

## New findings

None.

## Notes

- Evidence check at 67e0a3a6: every cited line was re-mapped through `git diff -U0 c2dacc69 67e0a3a6` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
