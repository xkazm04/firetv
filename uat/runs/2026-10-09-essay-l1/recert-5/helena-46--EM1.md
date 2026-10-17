# helena-46 × EM1 ·  (recert-5)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-essay-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 1 fixed, 6 recur; 6 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM1-1 The kind of writing never reaches the reading, and the Language lens falls back… (major) | recurs → L1-helena-46-EM1-1 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-helena-46-EM1-2 Adult readings are still prompted for 'a 15-year-old' student; mode never reach… (minor) | recurs → L1-helena-46-EM1-2 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-helena-46-EM1-3 Adult mode's lens home, plan, playbook and x-ray speak only to school paragraphs (minor) | recurs → L1-helena-46-EM1-3 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-helena-46-EM1-4 Four reading fields are computed and never shown (provider, stats.links, stats.… (minor) | recurs → L1-helena-46-EM1-4 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-helena-46-EM1-5 The phone refuses a .docx that the PC page accepts (polish) | recurs → L1-helena-46-EM1-5 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content); drop/page.tsx changed since 67581c54 (fb23fe5c, e32f688d) but not at the cited lines | none |
| L1-helena-46-EM1-6 A language the desk does not read is refused only when it is clearly Czech; sho… (polish) | recurs → L1-helena-46-EM1-6 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-helena-46-EM1-7 Open a one-paragraph kept email, change it, 'Analyse on the TV': no new version… (major) | fixed | 087c9d13: the one-paragraph button on a paragraph opened from the shelf is now onClick={paras.length === 1 && pieceId ? () => void readPiece(true) : analyseParagraph} (phone/page.tsx:737), so the opened piece goes down the piece path: readPiece (:282) posts kind "piece" with the pieceId and /api/analyse adds a version to that id (analyse/route.ts:115, addVersion), which is what the openKept line promises (:305, "read it again as a new version"). Executed at c4893c88 (scratch piece.cjs, engine stubbed): a one-paragraph piece kept -> id t-…, 1 version; the text changed and posted as kind piece with that pieceId -> 200, the same pieceId, 2 versions. e9c5802b only follows the new onClick in tools/phone-panel-test.cjs (the empty-box guard); it changes no product code. Pinned by tools/essay-piece-test.cjs ('EM1-7'). (087c9d13, e9c5802b) | 087c9d13 (+ e9c5802b test) |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
