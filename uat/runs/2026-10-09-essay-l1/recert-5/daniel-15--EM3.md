# daniel-15 × EM3 ·  (recert-5)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-essay-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 1 fixed, 8 recur; 8 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-1 After a whole-piece read the phone offers 'Next paragraph (2 of 5)', which lead… (major) | fixed | ede841e4: the phone knows when the TV holds a piece reading, pieceHeld (phone/page.tsx:238) and pieceCovers(ix) (:239, the paragraphs the piece read), and nextFromRewrite (:334-340) walks it: with a piece held it posts essay.at for the next paragraph's first sentence (:336, :338) and keeps the reading, where it used to nav to the lens home; "This paragraph only" is not rendered for a paragraph the piece already read (:737, {!pieceCovers(pix) && <button …}). Executed at c4893c88 (scratch piece.cjs, outside the repo, engine stubbed): a three-paragraph piece read -> pieceHeld true, read [0,1,2], pieceCovers true for 0, 1 and 2; the first sentence of paragraph 2 is n=3; dispatch essay.at n=3 -> essayAt 3 with essay.piece still on the session (5 sentences), where the old nav sent the TV to the lens home. Pinned by tools/essay-piece-test.cjs ('EM3-1'). Edge left as the suggested acceptance allows: a paragraph the piece did not read (failed, not English) still shows "This paragraph only". (ede841e4) | ede841e4 |
| L1-daniel-15-EM3-2 Pasting the revised essay makes a second 'Untitled essay', not a version (C6) (major) | recurs → L1-daniel-15-EM3-1 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) | none |
| L1-daniel-15-EM3-3 The forensic page he is moved to shows neither 'paragraph k of n' nor the summa… (major) | recurs → L1-daniel-15-EM3-2 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-daniel-15-EM3-4 The paste box and the shelf are hidden whenever the TV is on the forensic page,… (major) | recurs → L1-daniel-15-EM3-3 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) | none |
| L1-daniel-15-EM3-5 A title line is read as its own paragraph or fuses into sentence 1; the task ne… (major) | recurs → L1-daniel-15-EM3-4 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-daniel-15-EM3-6 Nothing says grammar and spelling are not checked; 'Well done' lands on sentenc… (minor) | recurs → L1-daniel-15-EM3-5 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-daniel-15-EM3-7 Deleting the open piece leaves the phone pointing at it; the next Read with Kee… (minor) | recurs → L1-daniel-15-EM3-6 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) | none |
| L1-daniel-15-EM3-8 Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/texts… (minor) | recurs → L1-daniel-15-EM3-7 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-daniel-15-EM3-9 No verdict lands until the last paragraph is read (C3 second clause fails by de… (major) | recurs → L1-daniel-15-EM3-8 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
