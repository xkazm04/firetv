# vojtech-18 × MB4 · (recert-11)

- Character: vojtech-18
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head ed23c4ac
- Recertifies: 2026-10-09-maths-l1/recert-10 at 67e0a3a6
- **Verdict now: L1-conditional.** 1 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) |
| --- | --- | --- |
| L1-vojtech-18-MB4-3 The only inequality statement is the linear A22; a quadratic or logarithmic inequality, or a domain, has no statement to pick (minor) | not-seen → fixed (e9c5ee8f) | Fixed by e9c5ee8f (ancestor of main, reconciled at ed23c4ac): desk/src/lib/library/gcse.ts:85-87 holds A26 "Solve a quadratic inequality and write the solution as an interval", A27 (logarithmic expression) and A28 (domain of a function) beside the linear A22 (:78), with Czech wording in gcse-cz.ts:61-63; tools/gcse-rules-test.cjs:21 and :27 pin the codes, the foundation flag and the English and Czech wording. Closed on the statement-and-test acceptance of this pass's brief (2026-10-20); the narrower earlier acceptance, units that teach them, is not met: no school unit teaches A26-A28, so a question that tests them still lands in "Not on the desk yet". Code walk, not live L2. |

## New findings

None.
