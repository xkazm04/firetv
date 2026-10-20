# nela-12 × MB2 · (recert-10)

- Character: nela-12
- Journey: MB2
- Cert level: L1 re-walk, code only, no model
- Head 67e0a3a6
- Recertifies: 2026-10-09-maths-l1/recert-9 at c2dacc69
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-nela-12-MB2-1 Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročník level needs a teacher's read (minor) | recurs → L1-nela-12-MB2-1 | Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: desk/src/lib/rules/school.ts:2798 gen(seed, tier) and :3040 "frac-add-sub": genMixedAddSub(seed) still draw tier-2 common bottoms beyond a 6. rocnik hand range (median 36, max 132); no teacher sign-off exists in code or in uat/. Waits on a teacher: no code closes it. git diff c2dacc69 67e0a3a6 is empty on every file this row cites. None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. | none |
| L1-nela-12-MB2-2 Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" (minor) | recurs → L1-nela-12-MB2-2 | Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: desk/src/lib/library/worked.ts:15 still teaches "Add or take away the tops, then simplify" while desk/src/lib/rules/school.ts:1588 adds the simplest-form tail only when s.form === "simplest", so an unsimplified sum is still ticked right. Waits on an owner ruling (simplest form asked, or the lesson drops "then simplify"). git diff c2dacc69 67e0a3a6 is empty on every file this row cites. None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at 67e0a3a6: every cited line was re-mapped through `git diff -U0 c2dacc69 67e0a3a6` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
