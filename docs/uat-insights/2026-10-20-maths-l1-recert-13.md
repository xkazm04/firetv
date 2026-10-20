# L1 recertify, round 13, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-20)

Builder pass 79f20ae6 (charter accepted-idea-delivery). Code-only L1 re-walk of the 4 rows left by recert-12 (docs/uat-insights/2026-10-20-maths-l1-recert-12.md), on a branch cut from main ee0fd7d7. Run record: `uat/runs/2026-10-09-maths-l1/recert-13`, report `recertify-13.md`.

## Counts: Math before and after

| | Total |
| --- | --- |
| Open before (recert-12) | 4 |
| Fixed | 2 |
| Recur | 2 |
| Open now | **2** |

OPEN.md Math 4 -> 2; total 235 -> 233 (the Linga section is untouched). Gates: every named tools suite green; `npm run test:rules` 90 green, 0 red, 2362 tests. No tsc ran (no desk/node_modules/.bin in the worktree).

## Reconciliation against main

Neither row had landed. gen() had no `form` and calc.ts/calc2.ts question() returned `{ plain, tex }` at ee0fd7d7.

## L1-nela-12-MB2-2: fixed, 90fd4a86

Owner ruling Variant 2 (answered 2026-10-20 under the operator's delegation; reversible by dropping `form` from the three specs in gen()).

| | Before | After |
| --- | --- | --- |
| Question | `Work out 3/4 + 3/4.` | `Work out 3/4 + 3/4. Give your answer in its simplest form.` |
| 6/4 for 3/4 + 3/4 | right | unsure (WHY.simplest), never wrong |
| 3/2 or 1 1/2 | right | right |

check() for specs without the form and library/worked.ts ('then simplify') are unchanged. The top rung (genMixedAddSub) still asks for no form.

Expectations the ruling flipped, and only these:
- tools/school-rules-test.cjs: new assertion (an add/sub spec says simplest form; 6/4 unsure, 3/2 right) and GENERATOR's question text. The hand-written SPELLINGS (A, E, N) have no `form`, so 22/24, 33/36, 6/4 and -2/4 stay right there; the same fractions under `form` are already pinned unsure by AS and ES.
- tools/school-practice-test.cjs: the spec keys gain `form`, the question regex gains the tail.
- tools/maths-calculus-test.cjs 7: the longer row is too wide at 52 px; the sheet fits it down in 2 px steps (as 7d), now asserted at 34 px or more: all 200 questions fit, the smallest at 38 px.
- tools/school-stretch-test.cjs, maths-aim-test.cjs, maths-like-test.cjs: the typed answers are written in lowest terms.
- tools/paper-aim-test.cjs: PLAIN_FP 9107c18d... -> bf2c158c..., SLIPS_FP 15f6826d... -> e8b346d3... (question text changed).
- tools/school-toprung-test.cjs: green unchanged.

## L1-matyas-19-MB3-5: fixed, e6ed58a8

question() in calc.ts (and implicitQuestion) and calc2.ts (calc2Question, sequenceQuestion) return `{ plain }`; no file outside the declared paths was needed (items.ts:420 reads q.plain). The TeX-only helpers and toTex imports went with it, so calc2's equality with calc.ts question() (approx :153, sequence :199) holds.

- tools/calc1-frozen.json regenerated through calc1-frozen-gen.cjs `table()` with the file's own 175 rows kept (a fresh collection would add 50 specs the suites gained since): only the `tex` keys leave, specs 175 and calls 3955 unchanged. calc2-seam case 1 stays byte-exact against it.
- tools/calc-rules-test.cjs asserts the plain literals and that a question carries no tex; calc2-approx and calc2-sequence likewise.
- maths-calculus-test.cjs and maths-calculus-live.cjs read the library examples' tex (calculus1.ts), not question(), and are unchanged.

## Not touched

MB1-1 and MB5-2 (phone paths held by stick pass 50602ac3). Both recur.
