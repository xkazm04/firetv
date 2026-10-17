# vojtech-18 × MB4 · Mapping a paper (recert-4)

- Character: vojtech-18
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-maths-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 1 fixed, 2 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-vojtech-18-MB4-1 The statement picker is about 100 English GCSE statements with 'beyond a Foundat… (major) | **fixed** (not-seen) | Same fix as L1-radka-41-MB4-1 (258cc1bf): the picker, the 'Tests: …' summary and the find box are Czech for a cz profile, accent-free (executed at 67581c54, scratch r4.cjs: 'nejmensi' -> N4, 'plocha pod grafem' -> A15, 'histogram' -> S3; 97 of 97 codes labelled). Carried out of this row rather than lost, and filed as new rows: the TV still echoes the English statement text and the '· a harder statement' flag (MathsTV.tsx:735), and the only inequality statement is still the linear A22 (gcse.ts:78). | 258cc1bf |
| L1-vojtech-18-MB4-2 The TV never shows which statement led a question to a topic (topics[].codes unw… (minor) | recurs → L1-vojtech-18-MB4-1 | cited lines re-found at 67581c54; recovery.ts changed since 00f5db95 (7c8a497c) but not at the cited lines | none |
| L1-vojtech-18-MB4-3 Back from an off-desk row of the recovery list lands on Equivalent fractions (minor) | recurs → L1-vojtech-18-MB4-2 | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files | none |

## New findings

- **L1-vojtech-18-MB4-3** (minor · rank 6): The only inequality statement is the linear A22; a quadratic or logarithmic inequality, or a domain, has no statement to pick — STATEMENTS holds one inequality statement, A22 'Solve linear inequalities …' (gcse.ts:78), and no statement for a quadratic inequality, a logarithm or a domain. Carried out of L1-vojtech-18-MB4-1 when that row closed (it named this gap in its got); not a defect opened by a fix.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
