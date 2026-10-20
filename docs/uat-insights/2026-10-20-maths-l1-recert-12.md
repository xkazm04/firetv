# L1 recertify, round 12, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-20)

Builder pass 47b27a1c (charter accepted-idea-delivery). Code-only L1 re-walk of the 5 rows left by recert-11 (docs/uat-insights/2026-10-20-maths-l1-recert-11.md), on a branch cut from main f315e1b9, this time with the frozen test suites in the pass's paths. Run record: `uat/runs/2026-10-09-maths-l1/recert-12`, report `recertify-12.md`.

## Counts: Math before and after

| | Total |
| --- | --- |
| Open before (recert-11) | 5 |
| Fixed | 1 |
| Recur | 4 |
| Open now | **4** |

OPEN.md Math 5 -> 4; total 236 -> 235 (the Linga section is untouched). The brief hoped for 3; the honest number is 4 because MB3-5 is owed, below.

## Reconciliation against main

Neither MB2-1 nor MB3-5 was landed: `git log -S` on school.ts PAIRS and calc.ts question(), and the rows' own stamps in recert-11/findings.json, showed the recert-11 attempts were reverted and nothing since.

## L1-nela-12-MB2-1: fixed, b6581a9e

`PAIRS` tier 2 in desk/src/lib/rules/school.ts now keeps bottoms 2..10 with a common bottom of at most 24 (exported `TIER2_MAX_BOTTOM`, `TIER2_MAX_COMMON`). Tier 1 and gen()'s fallback are unchanged. 129 distinct tier-2 specs remain over seeds 1..200 (the suite needs 100).

- New rule assertion: tools/school-rules-test.cjs GENERATOR, no tier-2 draw has a bottom above 10 or a common bottom above 24.
- Frozen values that moved because of the bound: tools/paper-aim-test.cjs `PLAIN_FP` (c196d8bb... -> 9107c18d...) and `SLIPS_FP` (ec6b2384... -> 15f6826d...), hashes of draw grids that include tier-2 frac-add-sub sets. Regenerated; nothing else was loosened.
- tools/school-stretch-test.cjs, maths-aim-test.cjs, maths-like-test.cjs, school-practice-test.cjs, school-toprung-test.cjs froze no tier-2 draw the bound moves and stay green unchanged. (recert-11 expected these to move; with the bound alone they do not.)

## L1-matyas-19-MB3-5: owed, not built

The brief said to stop and record the row as owed if the drop reached beyond calc.ts and the named tools. It does:

- tools/calc1-frozen.json is a byte-frozen table of every Calculus 1 question, tex included (written by tools/calc1-frozen-gen.cjs, compared byte for byte by tools/calc2-seam-test.cjs case 1). Removing tex from question() turns that red.
- tools/calc2-approx-test.cjs:153 and tools/calc2-sequence-test.cjs:199 assert `question(spec)` deep-equals `calc2Question(spec)`, which desk/src/lib/rules/calc2.ts types and builds as `{ plain, tex }` (:198, :483). calc.ts alone cannot drop tex for a calc2 spec without breaking that equality.
- No screen reads tex (items.ts:575 stores `q.plain` only), so the drop is safe for the product; it is the fixture files and calc2.ts that are outside the paths.

Needs one pass holding calc.ts, calc2.ts, calc1-frozen-gen.cjs/calc1-frozen.json, calc2-seam-test, calc2-approx-test, calc2-sequence-test, calc-rules-test, maths-calculus-test and maths-calculus-live; or the owner accepting "documented".

## Not touched

MB2-2 (waits on the rule ruling), MB1-1 and MB5-2 (phone paths held by the stick pass). All recur.
