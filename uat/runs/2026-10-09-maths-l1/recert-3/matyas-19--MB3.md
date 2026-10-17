# matyas-19 × MB3 · Chain rule and implicit differentiation, then Calculus 2 (recert-3)

- Character: matyas-19
- Journey: MB3
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 1 fixed, 5 recur; 5 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-matyas-19-MB3-1 Implicit differentiation cannot be practised: "The chain rule and implicit diff… (major) | **fixed** | fd9f5ca5 adds a tenth shape, implicit-derivative (rules/calc.ts:46-50 ImplicitSpec, CALC_SHAPES), set by calc1-chain (calculus1.spine.ts:121, items.ts SHAPE_LINES). Executed at 00f5db95 (scratch r3.cjs): readQuestion("Find dy/dx if x^2 + y^2 = 25") -> kind calc, spec {shape implicit-derivative}; the same for "Find dy/dx at (3, 4) if ...", "Differentiate x*y + y^2 = 7 implicitly" and the Czech "Určete derivaci implicitně zadané funkce ... v bodě [3; 4]" (the point read). checkAnswer marks -x/y and x/(-y) right and x/y wrong with slip sign; at (3, 4) -3/4 is right, 3/4 is a sign slip, and a general -x/y is unsure ("should be a number"). leaksLine refuses "dy/dx = -x/y." and "The slope is -x/y" (true) and, at the point, "At that point the slope is -0.75" (true); "Try differentiating each term with respect to x, treating y as a function of x." passes (false); withheldCalc names the method only. Policy note: at a point the general formula "dy/dx = -x/y." is not refused, the same as derivative-at ("The derivative is 3x^2." passes for "at x = 2", executed). Whether the model sets a sound implicit item is L2. | fd9f5ca5 |
| L1-matyas-19-MB3-2 Calculus 2: by-parts working (and the other technique topics) is read as nothin… (minor) | recurs → L1-matyas-19-MB3-1 | desk/src/lib/rules/chain.ts:387 — tagLines unchanged, no u/dv pair or inner integral / desk/src/lib/library/calculus2.spine.ts:41-73 — technique topics unchanged / recert-3 @00f5db95: cited lines re-found at 00f5db95; chain.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines | none |
| L1-matyas-19-MB3-3 Word-problem parts with an irrational answer accept only the exact form or abou… (minor) | recurs → L1-matyas-19-MB3-2 | desk/src/lib/rules/calc.ts:67-69 — derivative-at/extremum rounded 1e-6 / desk/src/lib/rules/calc.ts:420-424 — decimalCall only for limit and definite-integral / desk/src/lib/rules/calc-word.ts:101-102 — "Give the rate in centimetres per second." no exact / recert-3 @00f5db95: cited lines re-found at 00f5db95; calc.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines | none |
| L1-matyas-19-MB3-4 Typesetting: an infinity as a bound is split ('^inf' becomes ^i + 'nf') or left… (polish) | recurs → L1-matyas-19-MB3-3 | desk/src/maths/typeset.ts:299 — parsePlain takes one letter or digit per unbracketed script / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-matyas-19-MB3-5 Two Calculus 2 topic blurbs are over 25 words (approximate integration 30, sequ… (minor) | recurs → L1-matyas-19-MB3-4 | desk/src/lib/library/calculus2.spine.ts:78 — approximate integration, 30 words / desk/src/lib/library/calculus2.spine.ts:85 — sequences, 33 words / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-matyas-19-MB3-6 question(spec).tex is computed for every Calculus spec and read by no screen (polish) | recurs → L1-matyas-19-MB3-5 | desk/src/lib/rules/calc.ts:360 — question returns plain and tex / desk/src/lib/desk/items.ts:426 — kept.push stores q.plain / recert-3 @00f5db95: cited lines re-found at 00f5db95; calc.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines; items.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
