# radka-41 × MB4 · Mapping a paper (recert-3)

- Character: radka-41
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-radka-41-MB4-1 97 GCSE-worded statements, 41 with specialist or UK-curriculum terms, to map a… (major) | recurs → L1-radka-41-MB4-1 | desk/src/app/phone/PaperPanel.tsx:12 — WHOLE = statementChoices(): one list for every system / desk/src/app/phone/PaperPanel.tsx:36 — c.can printed as written, '(a harder statement)' for non-foundation / desk/src/lib/rules/paperEntry.ts:48 — statementChoices() takes no system / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-radka-41-MB4-2 Below-year routing sends the fraction and notation statements of a school-age l… (major) | **recurs (narrowed)** → L1-radka-41-MB4-2 | Narrowed, not fixed. 7107748f (PAST_MARGIN 3, N2/N8 in WHOLE; recovery.ts:185-190, gcse.ts:146-148) fixes UK 12, CZ 12 and the N2 and A1 half of CZ 14. Executed recovery() on [N2 0/3, N1 1/3, A1 0/2] (scratch r1.cjs): no Reader, UK 8, UK 10, UK 12, CZ 12 -> Equivalent fractions 2, One-step equations 2, Adding and subtracting fractions 1, Multiplying and dividing fractions 1, Decimal arithmetic 1, nothing off the desk. CZ 14 (9. ročník) -> One-step equations 2, Adding and subtracting 1, Multiplying and dividing 1, Decimal arithmetic 1, and N1 "Order integers, decimals and fractions ..." (lost 2) in notOnDesk: the CZ-14 N1 gap of the decision record (section 5) is real and unfixed. paperView on a seated cz/14 profile: four topics, one off row, caption "Start with One-step equations. ...". CZ 16 and CZ 18 lose N1 and A1 (intended: the maturita cut). | 7107748f (partial: N2, A1 and the 12-year-olds; not N1 from age 13/14), d66be973/20769444 (decision record) |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
