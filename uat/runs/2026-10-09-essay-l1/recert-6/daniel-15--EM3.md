# daniel-15 × EM3 ·  (recert-6)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 46db00cc
- Recertifies: 2026-10-09-essay-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 2 fixed, 6 recur; 6 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-1 Pasting the revised essay makes a second 'Untitled essay', not a version (C6) (major) | fixed | efdf070d: a kept read whose text matches a kept piece is a new version of it. matchPiece (texts.ts:130) returns the kept piece with the same "# heading" title or whose last version shares more than half of its paragraphs with the text (a differing format is another piece; the most recently kept match wins), and the route sends the keep to addVersion on it (analyse/route.ts:124; a match that cannot take a version falls back to a new piece when a format was named, :133-134). Executed at 46db00cc (scratch repro.cjs, engine stubbed): a three-paragraph piece kept, then the same piece with its last paragraph reworked -> 1 card, 2 versions; a different text -> a second card; a headed piece pasted twice with changed words -> 1 card titled "Early starts", 2 versions; matchPiece with another format -> null. A refused read keeps nothing (analyse/route.ts:116-126 before the keep, as before). Pinned by tools/essay-piece-test.cjs ('EM3-1 (recert-5)'). Edge left as the suggested acceptance allows: the version is made without an offer ("new version of <title>") and a question first line is still never a title. (efdf070d) | efdf070d |
| L1-daniel-15-EM3-2 The forensic page he is moved to shows neither 'paragraph k of n' nor the sum… (major) | recurs → L1-daniel-15-EM3-1 | cited lines re-found at 46db00cc; essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-daniel-15-EM3-3 The paste box and the shelf are hidden whenever the TV is on the forensic pag… (major) | recurs → L1-daniel-15-EM3-2 | cited lines re-found at 46db00cc; phone/page.tsx changed since c4893c88 (c72a35ee, b9647a00) and the cite moved with it (same line content); tv/keys.ts changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-daniel-15-EM3-4 A title line is read as its own paragraph or fuses into sentence 1; the task… (major) | recurs → L1-daniel-15-EM3-3 | cited lines re-found at 46db00cc; desk/essay.ts:194-199 is still one judge() call per paragraph with the title line as a paragraph; e3f70d8b and f48ff556 added the format and reader arguments to that call (:197) and no title detection, and taskOf (analyse/route.ts:48) reads a body.task that the phone never sends | none |
| L1-daniel-15-EM3-5 Nothing says grammar and spelling are not checked; 'Well done' lands on sente… (minor) | recurs → L1-daniel-15-EM3-4 | cited lines re-found at 46db00cc; essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-daniel-15-EM3-6 Deleting the open piece leaves the phone pointing at it; the next Read with K… (minor) | fixed | c72a35ee: deleting the open piece detaches the phone, and a keep that names a missing piece is a new piece. The shelf reports a delete to the page (EssayShelf.tsx:16, :33, onGone with the piece id, or "all") and the page clears pieceId when it is that piece or all (phone/page.tsx:742, setPieceId(cur => id === "all" // cur === id ? undefined : cur)); the route treats a body.pieceId that is no longer on the shelf as no pieceId (analyse/route.ts:122, getPiece) and keeps a new piece, where it used to answer 404 "That piece is not on your shelf.". Executed at 46db00cc (scratch repro.cjs, engine stubbed): a piece kept and deleted, then a keep naming its old id with a format -> 200, one card, a new id. Pinned by tools/essay-piece-test.cjs ('EM3-6 (recert-5)'). (c72a35ee) | c72a35ee |
| L1-daniel-15-EM3-7 Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/tex… (minor) | recurs → L1-daniel-15-EM3-5 | cited lines re-found at 46db00cc; api/texts/route.ts changed since c4893c88 (b9647a00) but not at the cited lines; essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-daniel-15-EM3-8 No verdict lands until the last paragraph is read (C3 second clause fails by… (major) | recurs → L1-daniel-15-EM3-6 | cited lines re-found at 46db00cc; desk/essay.ts changed since c4893c88 (c416b952, f48ff556, e3f70d8b) and the cite moved with it (same line content); essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines | none |

## New findings

None.

## Notes

- Evidence check at 46db00cc: every cited line was re-mapped through `git diff -U0 c4893c88 46db00cc` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
