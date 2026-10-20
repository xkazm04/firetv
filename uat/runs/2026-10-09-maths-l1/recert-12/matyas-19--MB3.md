# matyas-19 × MB3 · (recert-12)

- Character: matyas-19
- Journey: MB3
- Cert level: L1 re-walk, code only, no model
- Head b6581a9e
- Recertifies: 2026-10-09-maths-l1/recert-11 at ed23c4ac
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open.

## Prior rows

| Finding | Status | Evidence (current code) |
| --- | --- | --- |
| L1-matyas-19-MB3-5 question(spec).tex is computed for every Calculus spec and read by no screen (polish) | recurs → L1-matyas-19-MB3-5 | Reconciled at b6581a9e: not landed; owed, not built. This pass held the calc suites and tried the drop: no screen reads tex (desk/src/lib/desk/items.ts:575 stores q.plain only), but removing it from desk/src/lib/rules/calc.ts question() reaches files outside this pass's paths: (1) tools/calc1-frozen.json, a byte-frozen table that records every Calculus 1 question's tex, written by tools/calc1-frozen-gen.cjs and compared byte for byte by tools/calc2-seam-test.cjs case 1, which goes red the moment tex leaves question(); (2) tools/calc2-approx-test.cjs:153 and tools/calc2-sequence-test.cjs:199 assert deepEqual(C.question(spec), C2.calc2Question(spec)), and calc2Question and sequenceQuestion are typed { plain, tex } in desk/src/lib/rules/calc2.ts:198,483 (calc2.ts is outside the paths; calc.ts alone cannot drop tex from a calc2 spec without breaking that equality). The suites this pass was given (calc-rules-test.cjs, calc2-sequence-test.cjs:134, maths-calculus-test.cjs, maths-calculus-live.cjs) would move onto plain; the others cannot. Needs: desk/src/lib/rules/calc.ts and calc2.ts (types and the tex strings), tools/calc1-frozen-gen.cjs with calc1-frozen.json regenerated, tools/calc2-seam-test.cjs, calc2-approx-test.cjs, plus the four suites above. Or the owner accepting "documented". |

## New findings

None.
