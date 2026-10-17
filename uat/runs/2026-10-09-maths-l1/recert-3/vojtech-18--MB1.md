# vojtech-18 × MB1 · Tonight's sheet, together (recert-3)

- Character: vojtech-18
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-pass.** 2 fixed, 0 recur; 0 rows open. Was L1-conditional.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-vojtech-18-MB1-1 Every maturita task gets the 'factoring and linear-equations unit' stance, for… (major) | **fixed** | 00f5db95 makes voiceOf("maths", age) name the profile age (rules/voice.ts:75-83 ageWho: "an 18-year-old", "a 15-year-old") and gives a sequence, line or inequality task its method in the stance (desk/hint.ts:90-98 maturitaMethod, used at :110). Executed hint() with the text engine stubbed to capture the system prompt (scratch r3.cjs, system cz, age 18): "Určete 10. člen aritmetické posloupnosti ..." -> "You are a maths tutor for an 18-year-old. This is an arithmetic or geometric sequence task; use the nth-term formula."; "Find the line through (1,3) and (3,7)" -> "... for an 18-year-old. This is a line through two points; use the gradient and y = mx + c."; "Řešte nerovnici x^2 - 5x + 6 < 0" -> "... This is an inequality; find where the expression changes sign, then read off the solution set." With no age the stance keeps "a 15-year-old" but still names the method; "Simplify 3x + 2x" keeps the neutral school stance. A Calculus learner is still spoken to as the course's student (hint.ts:156), by design. | 00f5db95 |
| L1-vojtech-18-MB1-2 The two-point-line backstop misreads points written without a space: "(1,3) and… (minor) | **fixed** | 0a7b8086 reads bracketed points as written before the decimal-comma rewrite (rules/maturita.ts:100-103: points(raw) first, the rewrite only when two points are not found). Executed (scratch r3.cjs): lineOf("Find the line through (1,3) and (3,7)") -> {m 2, c 1}, and leaksLine is true for "The line is y = 2x + 1." and "y = 2x + 1", false for "Find the gradient first: change in y over change in x."; the spaced form gives the same; the decimal-comma form "A[1,5; 2] a B[3; 4]" still reads as the points (1.5, 2) and (3, 4) (m 1.333, c 0). | 0a7b8086 |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
