# radka-41 × MB4 · Mapping a paper (recert-4)

- Character: radka-41
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-maths-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 2 fixed, 0 recur; 1 row open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB4-1 97 GCSE-worded statements, 41 with specialist or UK-curriculum terms, to map a C… (major) | **fixed** (not-seen) | 258cc1bf gives the picker a Czech list: library/gcse-cz.ts (AREAS_CZ and CAN_CZ, 97 labels for the 97 STATEMENTS codes, none missing or extra), statementChoices(system) and canOf(code, system) (paperEntry.ts:51-62), choicesMatching(query, system) (:71-80), and the panel is handed the seated profile's system (phone/page.tsx:548 -> PaperPanel.tsx:22-37, :61). Executed at 67581c54 (scratch r4.cjs): statementChoices('cz') -> the six areas in Czech (Čísla a početní operace 16, Algebra 25, Poměr, úměrnost a procenta 16, Geometrie a měření 25, Pravděpodobnost 9, Statistika a práce s daty 6) with the codes unchanged; N1 reads 'Porovnávání a uspořádání celých čísel, desetinných čísel a zlomků; znaky =, ≠, <, >, ≤, ≥'; the find box for cz: 'nejmensi' and 'nejmenší' -> N4, 'nsn' -> N4, 'plocha pod grafem' -> A15, 'histogram' -> S3, and the English 'lcm' -> N4 and 'standard form' -> N9, A5 still find their statements; uk, de, us and no system keep the English list ('nejmensi' for uk finds nothing). Pinned by tools/phone-panel-test.cjs. What stays English for a cz parent is filed as a new row. | 258cc1bf |
| L1-radka-41-MB4-2 Below-year routing still strands N1 ("Order integers, decimals and fractions") f… (major) | **fixed** (not-seen) | 7c8a497c adds CUT_FROM_YEAR = 12 (recovery.ts:192) and applies the below-year cut only from that school year (past(), recovery.ts:197: year >= CUT_FROM_YEAR && year - unit year > PAST_MARGIN). Executed recovery() at 67581c54 (scratch r1.cjs, outside the repo) on [N2 0/3, N1 1/3, A1 0/2] for no Reader, UK 13, UK 15, CZ 14, CZ 15 and CZ 16: Equivalent fractions 2, One-step equations 2, Adding and subtracting fractions 1, Multiplying and dividing fractions 1, Decimal arithmetic 1, notOnDesk empty; reachOf(['N1']) -> frac-equivalent and reachOf(['A1']) -> linear-one-step for each, so N1 and A1 are on the desk. UK 16 (Year 12), UK 17 and CZ 18 lose N1 and A1 to notOnDesk (N1 2, A1 2; Adding and subtracting 2, Multiplying and dividing 1): the intended sixth-form / maturita cut. Pinned by recovery-rules-test.cjs (UK 13 and 15, CZ 14 and 15, then the CZ 18 cut). Edge, not filed: the cut is a step at year 12, so a UK learner of 16 resitting GCSE loses N1 and A1 to 'not on the desk'. | 7c8a497c |

## New findings

- **L1-radka-41-MB4-1** (minor · rank 6): A cz parent picks Czech statements, but the TV and the Prepare line echo the English statement text and the '· a harder statement' flag — 258cc1bf translates only the phone's picker. The paper's 'not on the desk' rows print o.can from STATEMENTS (recovery.ts:259 -> paperRows.ts:41 -> MathsTV.tsx:733) and the Prepare / aim line prints STATEMENTS .can (items.ts:101, mathsRows.ts:376), all in English, and the flag reads '· a harder statement' (MathsTV.tsx:735); the phone keeps English chrome ('Find by words', '(a harder statement)', PaperPanel.tsx:28, :37).

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
