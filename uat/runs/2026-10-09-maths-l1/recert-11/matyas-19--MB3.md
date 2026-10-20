# matyas-19 × MB3 · (recert-11)

- Character: matyas-19
- Journey: MB3
- Cert level: L1 re-walk, code only, no model
- Head ed23c4ac
- Recertifies: 2026-10-09-maths-l1/recert-10 at 67e0a3a6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) |
| --- | --- | --- |
| L1-matyas-19-MB3-5 question(spec).tex is computed for every Calculus spec and read by no screen (polish) | recurs → L1-matyas-19-MB3-5 | Reconciled at ed23c4ac: not landed. No screen reads it: desk/src/lib/desk/items.ts:575 stores q.plain only, and desk/src has no read of .tex on a Calculus question() result. What reads it is the tools: tools/calc-rules-test.cjs:183-185 and :270-271 (typesetFault on q.tex, the TeX printer's check), calc2-sequence-test.cjs:134, maths-calculus-test.cjs (typeset checks and frozen tex strings) and maths-calculus-live.cjs:109-121. Dropping tex from desk/src/lib/rules/calc.ts question() (builds it for every shape) means rewriting those suites, which are outside this pass's paths (only tools/calc-marking-test.cjs is in them, and it reads no tex). Needs: calc.ts plus tools/calc-rules-test.cjs, calc2-sequence-test.cjs, maths-calculus-test.cjs, maths-calculus-live.cjs; or the owner accepting "documented: kept as the TeX printer's own test surface". |

## New findings

None.
