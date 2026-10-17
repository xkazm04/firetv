# matyas-19 × MB3 · My Calculus course, checked (recert-1)

- Character: matyas-19 (first-year ČVUT, MA1, Calculus 1 path; Calculus 2 checked as the journey's coverage note asks)
- Journey: MB3 · My Calculus course, checked
- Cert level: L1 re-walk, code only, no model
- Head: d4f5042a
- Recertifies: 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional**: no false tick or answer leak found, and 10 of 11 prior rows are fixed, but calc1-chain still promises implicit differentiation it cannot set, read or mark.

## Reachable surface (now)

- Topics: desk/src/lib/library/calculus1.spine.ts (calc1-chain :115-120, requires composition; calc1-area-so-far :179-180).
- Set: desk/src/lib/desk/items.ts:410-423 (wellFormed, meetsRequirement, leaksCalc, q.plain).
- Typed answers: cap 120 (desk/src/lib/rules/maths.ts:120; phone :618, :661).
- Verdicts: desk/src/lib/rules/calc.ts:401-454 (judgeNumber/decimalCall, domain, forgot-chain); Czech reading desk/src/lib/rules/calc-read.ts:32, :84.
- Working pen: desk/src/lib/rules/chain.ts:272-387, :540; unsure line desk/src/lib/rules/kinds.ts:153-158.
- Explain: desk/src/lib/desk/explain.ts:50-70.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| MB3-1 decimal estimate ticked for a limit/integral (blocker) | fixed | calc.ts:401-404 -> decimalCall; 2.999, 3.014, 2.9996, 0.4996, 9.04, 8.99 unsure; 3, 3.00, 0.5, 9 right (executed) | 9c777d5d MB-B28 … |
| MB3-2 ln x + C ticked for ∫1/x (blocker) | fixed | calc-expr.ts:764 -> WHY.domain; ln x + C unsure, ln\|x\| + C right (executed) | ebdddf7c MB-B27 … |
| MB3-3 no implicit differentiation | **recurs** (major, 12) | calculus1.spine.ts:116-120 blurb promises it, shapes ['derivative']; calc.ts:42 no implicit shape; "Find dy/dx if x^2 + y^2 = 25" reads linear and "dy/dx = -x/y." passes the guard (executed) | null |
| MB3-4 40-character cap | fixed | maths.ts:120 = 120; 45-character answer right (executed) | 6cbe3bd4 MK14 … |
| MB3-5 unsure item says "I got something different" | fixed | kinds.ts:153-158 NOT_SURE with why; +C on a derivative says why (executed) | 83bbe368 MK10 … |
| MB3-6 Czech notation unreadable | fixed | calc-read.ts:32, :84; tg, arctg, arccotg, + K, + C1, 0,5 right for cz (executed) | 4879c4de feat(maths): read Czech notation in Calculus answers |
| MB3-7 no pen for prime / u = / lim = lim working | fixed | chain.ts:272-369; the three workings put the pen on the slipped line (executed) | 15e94aa8 feat(maths): read prime notation, u = lines and lim = lim lines … |
| MB3-8 chain-rule slip not named in code | fixed | calc.ts:454; "cos(x^2)" -> wrong, forgot-chain (executed) | 4a8d4dac feat(maths): name the forgotten chain factor in code |
| MB3-9 chain-rule set not required to be composite | fixed | spine :120 requires composition; items.ts:415 drops non-compositions (executed isComposition) | 3a8e36d9 feat(maths): keep only compositions in a chain-rule set |
| MB3-10 "area-so-far" topic name | fixed | calculus1.spine.ts:179-180 | 5899d6a9 TN1 … |
| MB3-11 explain prompt lacks answer/working/slip | fixed | explain.ts:50-70 seenBlock | 1dfcfdae X4 … |

## New findings

Rows from 2026-10-14 that are now **fixed** (not recorded):
- MB3-14 (pen on a correct line after a leading "="): fixed by 15e94aa8. The ∫ x^2 dx working -> pen on "= 8"; "= 3^2 + 1 / = 11" -> pen on "= 11"; a correct leading-"=" derivative gets no pen (executed).
- MB3-15 (log10/log2 read as ln·digits): fixed by 0a53e75e (calc-expr.ts:143 reads glued digits as the base) and eae919eb (cz bare log = base 10). "log10(e)/x", "log10|x|+C" and "log2(e)/x" are right (executed). For cz, "log|x|+C" for ∫1/x is now wrong, which is correct under the Czech base-10 convention.

Still holding, recorded:
- MB3-16 Calculus 2 by-parts working read as nothing (minor, 6).
- MB3-17 irrational word-problem keys need about 6 figures or the exact form, and the line never says "exact" (minor, 6).
- MB3-18 infinity as a script bound mis-typeset (polish, 2).
- MB3-20 two Calculus 2 blurbs at 30 and 33 words (minor, 3).
- MB3-21 question().tex has no reader (polish, 1).

MB3-19 (no Adult gate) skipped as by-design. No other new defect found.

## Notes

- About 120 answers and workings executed through checkAnswer, judgeSet, judgeItem and chainChecks; no false tick and no false ring found.
- Scripts: C:/Users/kazda/AppData/Local/Temp/recert-c258/scratch-matyas-19 (b.cjs, c.cjs, e.cjs, f.cjs).
