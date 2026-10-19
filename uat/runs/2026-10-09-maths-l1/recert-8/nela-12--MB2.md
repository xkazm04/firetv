# nela-12 × MB2 · (recert-8)

- Character: nela-12
- Journey: MB2
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-maths-l1/recert-7 at ffa91a49
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-nela-12-MB2-1 Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 13… (minor) | recurs → L1-nela-12-MB2-1 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/rules/school.ts:2798 gen(seed, tier) and :3040 "frac-add-sub": genMixedAddSub(seed) still draw tier-2 common bottoms beyond a 6. rocnik hand range (median 36, max 132); no teacher sign-off exists in code or in uat/. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-nela-12-MB2-2 Unsimplified sums are ticked right, while the worked lesson teaches "then simpl… (minor) | recurs → L1-nela-12-MB2-2 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/library/worked.ts:15 still teaches "Add or take away the tops, then simplify" while desk/src/lib/rules/school.ts:1588 adds the simplest-form tail only when s.form === "simplest", so an unsimplified sum is still ticked right. Needs the owner's ruling. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
