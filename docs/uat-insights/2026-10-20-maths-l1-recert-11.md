# L1 recertify, round 11, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-20)

Builder pass 3cefdd38 (charter accepted-idea-delivery, operator standup item 3: drain the builder-alone Math rows). Code-only L1 re-walk of the 6 rows left by recert-10, on a branch cut from main ed23c4ac. Run record: `uat/runs/2026-10-09-maths-l1/recert-11`, report `recertify-11.md`.

## Counts: Math before and after

| | Total |
| --- | --- |
| Open before (recert-10) | 6 |
| Fixed | 1 |
| Recur | 5 |
| Open now | **5** |

OPEN.md Math 6 -> 5; total 237 -> 236 (the Linga section is untouched).

## Reconciliation against main

- `L1-vojtech-18-MB4-3`: **already landed**, e9c5ee8f (ancestor of main): statements A26 (quadratic inequality), A27 (logarithmic expression), A28 (domain) beside the linear A22, English and Czech, pinned by tools/gcse-rules-test.cjs. Stamped fixed. Caveat kept on the row: no school unit teaches them.
- The other five: not landed.

## Why no code commit

The brief asked for one commit per row with a rule test. Three of the rows need edits to test suites outside the declared paths, so the code was tried, measured and reverted (nothing uncommitted is left):

- **MB2-1** (tier-2 bound). `PAIRS` tier 2 limited to bottoms 2..10 with a common bottom of at most 24 (desk/src/lib/rules/school.ts:2780). Every frozen tier-2 draw moves: tools/paper-aim-test.cjs "the usual draw" hash fails on the bound alone.
- **MB2-2** (right but not simplified). Two variants tried.
  1. check() marks a two-fraction sum written as a fraction not in lowest terms unsure (`WHY.simplest`), a decimal or whole number staying right. Red on expectations frozen on purpose: tools/school-rules-test.cjs SPELLINGS has "22/24", "33/36" for 3/4 + 1/6, "14/24" for 5/6 - 1/4, "6/8" for 1/2 + 1/4, "6/4", "1 2/4" for 3/4 + 3/4, "-2/4" for 1/4 - 3/4 as right; tools/maths-like-test.cjs case 5 writes unsimplified sums for all six items; school-stretch-test.cjs and maths-aim-test.cjs also fail.
  2. `form: "simplest"` on the generated frac-add-sub specs (the question then says "Give your answer in its simplest form."). Red in school-rules, maths-calculus, school-practice, school-toprung, school-stretch, maths-aim, paper-aim, maths-like.
  With both changes together the red suites are school-rules, school-stretch, maths-aim, paper-aim, maths-like. The rule suites on main are green (checked on the unchanged file).
- **MB3-5** (dead tex). No screen reads it (items.ts:575 stores `q.plain` only; desk/src has no `.tex` read of a Calculus question). The readers are the tools: calc-rules-test.cjs:183-185 and :270-271 (typesetFault on q.tex), calc2-sequence-test.cjs:134, maths-calculus-test.cjs, maths-calculus-live.cjs:109-121. Removing it means rewriting those suites, outside the paths.
- **MB1-1**: the client half is desk/src/app/phone/page.tsx and desk/src/tv/keys.ts, both held by the stick pass.
- **MB5-2**: operator ruling (b), 2026-10-20: keep the privacy strip; the phone Recap covers only the seated child with an honest line that the others show on the TV. The row's `suggested_acceptance` is amended in every run holding it. Acceptance amended, code owed at desk/src/app/phone/page.tsx (the Recap, about :881). Not closed.

## Open rows, ranked by cost

| # | Row | Effort | Files | Who closes it |
| --- | --- | --- | --- | --- |
| 1 | `L1-nela-12-MB2-1` | S-M | school.ts PAIRS; regenerate the frozen draws in tools/paper-aim-test.cjs, school-stretch-test.cjs, maths-aim-test.cjs, maths-like-test.cjs | a builder allowed those tests |
| 2 | `L1-matyas-19-MB3-5` | S-M | calc.ts question(); calc-rules, calc2-sequence, maths-calculus tests and maths-calculus-live | a builder allowed those tests, or owner accepts "documented" |
| 3 | `L1-nela-12-MB2-2` | M | school.ts check() or the generators, school-rules-test.cjs and the four suites above | owner's choice of rule (variant 1 or 2), then a builder |
| 4 | `L1-radka-41-MB5-2` | XS | desk/src/app/phone/page.tsx (the honest line), desk/src/tv/ | the stick pass, after it releases the phone paths |
| 5 | `L1-matyas-19-MB1-1` | L | desk/src/app/phone/page.tsx, desk/src/tv/keys.ts, the vision path | the stick pass, then Math L2 |
