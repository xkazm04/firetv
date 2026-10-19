# nela-12 × MB2 · (recert-7)

- Character: nela-12
- Journey: MB2
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-maths-l1/recert-6 at 6b189791
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-nela-12-MB2-1 Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročn… (minor) | recurs → L1-nela-12-MB2-1 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791 unchanged: school.ts:2798 gen(seed,tier) and school.ts:3040 'frac-add-sub': genMixedAddSub(seed) still draw tier-2 common bottoms beyond a 6. rocnik hand range; no teacher sign-off exists in code (school.ts diff since c4893c88 only appends linearWorked at 3646+). None of the seven commits since 6b189791 (56f903ae, da6f9f07, 3240d025 and e9c5ee8f are the Math commits; b75bd45f, 61a8e2ee and ffa91a49 are Essay) changes what this row cites. | none |
| L1-nela-12-MB2-2 Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" (minor) | recurs → L1-nela-12-MB2-2 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791: library/worked.ts:15 still teaches 'Add or take away the tops, then simplify' while school.ts:1588 adds the simplest-form tail only when s.form === 'simplest', so an unsimplified sum is still ticked. 6b189791 only adds new linear-equation entries to worked.ts (lines 38-43), not touching the fraction lesson. None of the seven commits since 6b189791 (56f903ae, da6f9f07, 3240d025 and e9c5ee8f are the Math commits; b75bd45f, 61a8e2ee and ffa91a49 are Essay) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
