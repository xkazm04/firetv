# nela-12 × MB2 · (recert-11)

- Character: nela-12
- Journey: MB2
- Cert level: L1 re-walk, code only, no model
- Head ed23c4ac
- Recertifies: 2026-10-09-maths-l1/recert-10 at 67e0a3a6
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) |
| --- | --- | --- |
| L1-nela-12-MB2-1 Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročník level needs a teacher's read (minor) | recurs → L1-nela-12-MB2-1 | Reconciled at ed23c4ac: not landed on main (school.ts PAIRS still draws tier 2 from bottoms 2..12 with common bottoms up to 132). Tried and not committed: PAIRS tier 2 limited to bottoms 2..10 with a common bottom of at most 24 (desk/src/lib/rules/school.ts:2780; no elevenths, nothing up to 132). The bound moves every frozen tier-2 draw: with it alone tools/paper-aim-test.cjs "the usual draw" hash fails, and with both school.ts changes of this pass tools/school-rules-test.cjs, school-stretch-test.cjs, maths-aim-test.cjs, paper-aim-test.cjs and maths-like-test.cjs are red. Those tests are outside this pass's paths, so nothing was changed. Needs: desk/src/lib/rules/school.ts (PAIRS and the gen doc line) and the frozen draws in tools/paper-aim-test.cjs, school-stretch-test.cjs, maths-aim-test.cjs and maths-like-test.cjs regenerated; no teacher read is needed for the bound itself. |
| L1-nela-12-MB2-2 Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" (minor) | recurs → L1-nela-12-MB2-2 | Reconciled at ed23c4ac: not landed (worked.ts:15 still teaches "then simplify"; school.ts check() ticks 22/24 right for 3/4 + 1/6). Tried and not committed: check() marks a sum of two fractions or mixed numbers written as a fraction not in lowest terms unsure (WHY.simplest) while a decimal or whole number stays right. It contradicts expectations frozen on purpose: tools/school-rules-test.cjs SPELLINGS has "22/24" and "33/36" for 3/4 + 1/6, "14/24" for 5/6 - 1/4, "6/8" for 1/2 + 1/4, "6/4" and "1 2/4" for 3/4 + 3/4 and "-2/4" for 1/4 - 3/4 as right; tools/maths-like-test.cjs case 5 answers six items with unsimplified sums; school-stretch-test.cjs and maths-aim-test.cjs go red too. The alternative, form "simplest" on the generated specs (the question then says "Give your answer in its simplest form."), is red in school-rules, maths-calculus, school-practice, school-toprung, school-stretch, maths-aim, paper-aim and maths-like. Both are policy flips of tests outside this pass's paths. Needs: desk/src/lib/rules/school.ts and those tests, with the owner's choice between the two. |

## New findings

None.
