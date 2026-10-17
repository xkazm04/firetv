# kristyna-17 × EM3 ·  (recert-6)

- Character: kristyna-17
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 46db00cc
- Recertifies: 2026-10-09-essay-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 1 fixed, 4 recur; 4 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM3-1 The forensic page never names the paragraph; 'Start with paragraph p, sentenc… (major) | recurs → L1-kristyna-17-EM3-1 | cited lines re-found at 46db00cc; essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-kristyna-17-EM3-2 After Delete the phone keeps the deleted piece's id: the next keep-and-read f… (minor) | fixed | c72a35ee: after Delete the next keep-and-read makes a new piece. Delete (one or all) clears the phone's pieceId through onGone (EssayShelf.tsx:33, phone/page.tsx:742), and a keep naming a piece that is gone is a new piece, not a 404 (analyse/route.ts:122-126). Executed at 46db00cc (scratch repro.cjs, engine stubbed): a kept piece deleted, then a keep that still names its id -> 200, a new card with a different id, no "not on your shelf". Pinned by tools/essay-piece-test.cjs ('EM3-6 (recert-5)'). (c72a35ee) | c72a35ee |
| L1-kristyna-17-EM3-3 A plain title line becomes paragraph 1 of the piece, costs a model call, and… (minor) | recurs → L1-kristyna-17-EM3-2 | cited lines re-found at 46db00cc; desk/essay.ts changed since c4893c88 (c416b952, f48ff556, e3f70d8b) and the cite moved with it (same line content) | none |
| L1-kristyna-17-EM3-4 While the first paragraph of a first piece is read, the TV says 'The desk is… (minor) | recurs → L1-kristyna-17-EM3-3 | cited lines re-found at 46db00cc; essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-kristyna-17-EM3-5 GET /api/texts returns noticed and notice that no screen reads (minor) | recurs → L1-kristyna-17-EM3-4 | cited lines re-found at 46db00cc; api/texts/route.ts changed since c4893c88 (b9647a00) but not at the cited lines; phone/EssayShelf.tsx changed since c4893c88 (c72a35ee, b9647a00) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at 46db00cc: every cited line was re-mapped through `git diff -U0 c4893c88 46db00cc` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
