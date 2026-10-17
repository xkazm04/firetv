# vojtech-18 × MB2 · Marking a worked sheet (recert-2)

- Character: vojtech-18 (18, high school, cz, School maths path)
- Journey: MB2 · Marking a worked sheet
- Cert level: L1 re-walk, code only, no model
- Head: 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a
- **Verdict now: L1-conditional**. Photo marking now carries his school system and notation, and the Czech percent word is refused; whether the handwriting is read faithfully is L2's.

## Reachable surface (now)

- Photo marking: `desk/src/lib/desk/mark.ts:148-208` (schoolPrompt, linearPrompt, calcPrompt each carry `notationLine(system)`); routes `desk/src/app/api/mark/route.ts:82,114`.
- Leak check: `desk/src/lib/rules/school.ts:2422-2423`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-vojtech-18-MB2-1 | fixed | readSheet receives the system (`mark.ts:195,204-208,360`); prompts carry the cz notation line (`:116,151,168`); linear answer copied as written | 90e032f2 |
| L1-vojtech-18-MB2-2 | fixed | Executed leaksSchool: 'Je to dvacet procent.' and 'Je to dvacet procent z celku.' now true | d88fb34c |

## New findings

None.

## Notes

- Probe: scratch `p1.cjs`. Handwriting read quality, false ticks and rings are L2 (vision host).
