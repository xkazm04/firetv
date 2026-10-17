# kristyna-17 × EM3 ·  (recert-5)

- Character: kristyna-17
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-essay-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 0 fixed, 5 recur; 5 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM3-1 The forensic page never names the paragraph; 'Start with paragraph p, sentence … (major) | recurs → L1-kristyna-17-EM3-1 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-kristyna-17-EM3-2 After Delete the phone keeps the deleted piece's id: the next keep-and-read fai… (minor) | recurs → L1-kristyna-17-EM3-2 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) | none |
| L1-kristyna-17-EM3-3 A plain title line becomes paragraph 1 of the piece, costs a model call, and ca… (minor) | recurs → L1-kristyna-17-EM3-3 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-kristyna-17-EM3-4 While the first paragraph of a first piece is read, the TV says 'The desk is re… (minor) | recurs → L1-kristyna-17-EM3-4 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-kristyna-17-EM3-5 GET /api/texts returns noticed and notice that no screen reads (minor) | recurs → L1-kristyna-17-EM3-5 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
