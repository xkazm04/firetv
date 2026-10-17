# owen-17 × MB2 · Practise and get marked (recert-2)

- Character: owen-17 (17, FE college, Foundation resit; UK, Family mode)
- Journey: MB2 Practise and get marked
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-maths-l1 at 12592a71 (recert-1 at d4f5042a)
- **Verdict now: L1-conditional.** The photo-marking prompt gap is closed on the code side (the linear answer is asked for as written, with the learner's notation). Two minors stay open: no worked lesson for the three equation units, and the Year labels on the Topics ruler.

## Reachable surface (now)

- Photo marking: `readSheet` passes the seated learner's school system to every prompt (`desk/src/lib/desk/mark.ts:192-199`, `:360`); the linear prompt carries `notationLine(system)` (`mark.ts:168`) and asks for studentAnswer copied exactly as written (`mark.ts:171`). The model's own solution still gates the verdict (`desk/src/lib/rules/kinds.ts:117-122`).
- Paper row -> Select opens on 'See how first' only where a lesson exists (`desk/src/tv/keys.ts:541`, `:528`).
- Topics from Tonight: the big Ruler (`desk/src/maths/MathsTV.tsx:625`, year label `:337`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-owen-17-MB2-1 photo marking rests on the model's read; linear prompt asks for a plain number (major) | fixed (code side; handwriting read stays L2's) | `mark.ts:171` now asks for the value 'copied exactly as the student wrote it ... a fraction or a mixed number, not converted or simplified'; `:168` adds the notation line; the system reaches readSheet (`:195`, `:360`). The solution gate in `kinds.ts:117-122` is deliberate and untouched | 90e032f2 |
| L1-owen-17-MB2-2 no worked lesson for the three equation units (minor) | recurs (minor) | `desk/src/lib/library/worked.ts:10-36` has 14 units, no linear-*; `keys.ts:541` gives `hasWorked ? -1 : 0` | - |
| L1-owen-17-MB2-3 Topics ruler labels 'Year 5'-'Year 9' (minor) | recurs (minor) | `MathsTV.tsx:337` prints `SYS_WORD[sys](t.year)` with no past check; Prepare checks `!past` at `:689` | - |

## New findings

None.

## Notes

- Read the diff of 90e032f2 (mark.ts, prompt strings, system threaded through markSet and markPage). No model call, so whether vision keeps '1 3/4' as written is L2's: snap a worked linear sheet with mixed-number answers, right and wrong.
- MB2-2 and MB2-3 are untouched by any commit since recert-1; line cites re-found at HEAD.
