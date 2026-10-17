# matyas-19 × MB3 · Chain rule and implicit differentiation, then Calculus 2 (recert-2)

- Character: matyas-19 (first-year ČVUT, MA1, Calculus 1 path)
- Journey: MB3 · Chain rule and implicit differentiation, then Calculus 2
- Cert level: L1 re-walk, code only, no model
- Head: 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a
- **Verdict now: L1-conditional**: no false tick or answer leak found; implicit differentiation is still promised and unpractisable (major, fix in flight), with five smaller rows open. Unchanged from recert-1: no commit touched this pair.

## Reachable surface (now)

- calc1-chain sets derivative compositions only (desk/src/lib/library/calculus1.spine.ts:116-120); Calculus 2 technique topics (calculus2.spine.ts:41-73) have no line-check for by-parts working.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| MB3-1 | recurs (major; fix in flight) | desk/src/lib/library/calculus1.spine.ts:116-120 — blurb promises implicit, shapes ["derivative"]; desk/src/lib/rules/calc.ts:42 — CALC_SHAPES has no implicit shape. calc1-chain still promises implicit differentiation but sets only y=f(x) derivatives; readQuestion("Find dy/dx if x^2 + y^2 = 25") -> linear, and "dy/dx = -x/y." passes leaksLine (executed false). | - | fix in flight |
| MB3-2 | recurs (minor) | desk/src/lib/rules/chain.ts:387 — tagLines unchanged, no u/dv pair or inner integral; desk/src/lib/library/calculus2.spine.ts:41-73 — technique topics unchanged. By-parts working on Calculus 2 techniques is still not line-checked; no commit touched chain.ts or calculus2.spine.ts since recert-1. | - |
| MB3-3 | recurs (minor) | desk/src/lib/rules/calc.ts:59-61 — derivative-at/extremum rounded 1e-6; desk/src/lib/rules/calc.ts:404-408 — decimalCall only for limit and definite-integral; desk/src/lib/rules/calc-word.ts:101-102 — "Give the rate in centimetres per second." no exact. Derivative-at and extremum still use the 1e-6 rounded tolerance; only limit and definite-integral go to decimalCall; word-problem lines still say no "exact". | - |
| MB3-4 | recurs (polish) | desk/src/maths/typeset.ts:299 — parsePlain takes one letter or digit per unbracketed script. Infinity bound still split in typesetting (executed: int_1^inf -> ^(i)nf; ∫_1^∞ -> ^()∞; x^inf -> ^(i)nf). | - |
| MB3-5 | recurs (minor) | desk/src/lib/library/calculus2.spine.ts:78 — approximate integration, 30 words; desk/src/lib/library/calculus2.spine.ts:85 — sequences, 33 words. Both Calculus 2 blurbs unchanged at 30 and 33 words; file untouched since recert-1. | - |
| MB3-6 | recurs (polish) | desk/src/lib/rules/calc.ts:345 — question returns plain and tex; desk/src/lib/desk/items.ts:423 — kept.push stores q.plain. question() still returns tex and items.ts stores plain only. | - |

## New findings

None.

## Notes

MB3-1: the parallel builder fix is in another worktree; answered as at HEAD 90e032f2 (recurs, executed readQuestion/leaksLine). Others by file-unchanged check plus typeset execution.
