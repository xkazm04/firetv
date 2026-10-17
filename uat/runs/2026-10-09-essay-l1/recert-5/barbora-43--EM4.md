# barbora-43 × EM4 ·  (recert-5)

- Character: barbora-43
- Journey: EM4
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-essay-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM4-1 A paragraph-only evening's delete is out of reach when the TV is on a sentence … (major) | recurs → L1-barbora-43-EM4-1 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) | none |
| L1-barbora-43-EM4-2 A piece is 'one reading' on the recap but 'one piece' on the Sunday page (polish) | recurs → L1-barbora-43-EM4-2 | cited lines re-found at c4893c88; recapRows.ts changed since 67581c54 (fc8a5151) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
