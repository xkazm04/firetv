# nela-12 × MB2 · Fractions practice set (recert-3)

- Character: nela-12
- Journey: MB2
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-nela-12-MB2-1 Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 13… (minor) | recurs → L1-nela-12-MB2-1 | desk/src/lib/rules/school.ts:2798 — gen(seed, tier) unchanged / desk/src/lib/rules/school.ts:3040 — frac-add-sub generator unchanged / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-nela-12-MB2-2 Unsimplified sums are ticked right, while the worked lesson teaches "then simpl… (minor) | recurs → L1-nela-12-MB2-2 | desk/src/lib/library/worked.ts:15 — 'Add or take away the tops, then simplify' / desk/src/lib/rules/school.ts:1588 — tail only when s.form === 'simplest' / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
