# vojtech-18 × MB1 · Tonight's sheet, together (recert-2)

- Character: vojtech-18 (18, high school, cz, School maths path)
- Journey: MB1 · Tonight's sheet, together
- Cert level: L1 re-walk, code only, no model
- Head: 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a
- **Verdict now: L1-conditional**. The C1 leak-guard blocker is closed in code for the shapes recert-1 listed; the neutral stance still says '15-year-old' and names no method.

## Reachable surface (now)

- Hint: `desk/src/lib/desk/hint.ts` leaksLine -> `leaks()` plus `sequenceTermOf` (`desk/src/lib/rules/maturita.ts:72`), which now reads a listed sequence; numberWords reads inflected Czech cardinals.
- Stance and voice: `hint.ts:87,93-98`, `desk/src/lib/rules/voice.ts:68-77`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-vojtech-18-MB1-1 | fixed | Executed 21 lines at cz: listed sequence, bare log, '10 choose 3 is 120', 'Je to x + 3.', 'dvěma a třemi', two-point line, equations all refused; method lines pass | c88aef1f |
| L1-vojtech-18-MB1-2 | recurs (major, unchanged) | `hint.ts:87` names no method; `voice.ts:69` 'a 15-year-old' for any age >= 14 | none |

## New findings

- **L1-vojtech-18-MB1-2** (minor 6, new): lineOf in rules/maturita.ts:100 turns "(1,3)" into decimals, so a two-point line typed without a space after the comma is not read and its answer line passes the backstop. Found while spot-checking c88aef1f; the shapes recert-1 listed are all refused.


## Notes

- Probes: scratch `p1.cjs`, `p2.cjs` (leaksLine + readQuestion at cz). One line, 'Takže x = 11.' on 'Solve 2x + 3 = 11', now passes; it is not the answer (x = 4), so not a leak.
- L2: whether the model obeys the withhold rule.
