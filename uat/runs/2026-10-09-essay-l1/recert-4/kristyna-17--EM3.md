# kristyna-17 × EM3 ·  (recert-4)

- Character: kristyna-17
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-essay-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 0 fixed, 5 recur; 5 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM3-1 The forensic page never names the paragraph; 'Start with paragraph p, sentence n… (major) | recurs → L1-kristyna-17-EM3-1 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) and the cite moved with it (same line content) | none |
| L1-kristyna-17-EM3-2 After Delete the phone keeps the deleted piece's id: the next keep-and-read fail… (minor) | recurs → L1-kristyna-17-EM3-2 | cited lines re-found at 67581c54; EssayShelf.tsx changed since 00f5db95 (6e8b7728) and the cite moved with it (same line content); page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) | none |
| L1-kristyna-17-EM3-3 A plain title line becomes paragraph 1 of the piece, costs a model call, and can… (minor) | recurs → L1-kristyna-17-EM3-3 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) but not at the cited lines | none |
| L1-kristyna-17-EM3-4 While the first paragraph of a first piece is read, the TV says 'The desk is rea… (minor) | recurs → L1-kristyna-17-EM3-4 | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files | none |
| L1-kristyna-17-EM3-5 GET /api/texts returns noticed and notice that no screen reads (minor) | recurs → L1-kristyna-17-EM3-5 | cited lines re-found at 67581c54; route.ts changed since 00f5db95 (6e8b7728) and the cite moved with it (same line content); EssayShelf.tsx changed since 00f5db95 (6e8b7728) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
