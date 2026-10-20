# daniel-15 × EM3 · (recert-15)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 0e6a63c6
- Recertifies: 2026-10-09-essay-l1/recert-14 at 67e0a3a6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-2 A title line is read as its own paragraph or fuses into sentence 1; the task never reaches the prompt as a task (major) | recurs → L1-daniel-15-EM3-2 | Narrowed by 0e6a63c6 (ancestor of main); not closed. Both halves the brief names hold. Fallback: executed outside the repo (scratch script, tools/ts-load.cjs, the route's own taskOf and taskFor lines read out of route.ts:54-56 and run with the real titleOf): a piece with a title line and no task -> titleOf "Why sleep matters", taskFor "Why sleep matters"; a piece with a task ("Write about school hours") -> taskFor "Write about school hours" (the explicit task wins); a piece with neither -> titleOf null, taskFor undefined; a blank task "   " with a title -> taskFor "Why sleep matters". Header: renderToStaticMarkup of the real Forensic page for a reading whose text starts with the title line draws <div class="em-lbl" data-role="essay-title">Title · Why sleep matters</div> (EssayTV.tsx:438, fed by forensicTitle :355, rules/essay.ts:135), and draws none for a text with no title. What does not hold end to end: the phone strips the title before it sends. Executed (paragraphsOf, tools/ts-load.cjs): paragraphsOf of a typed piece "Why sleep matters", blank line, two paragraphs -> the two paragraphs, no title; the text readPiece sends (paras.join of two newlines, page.tsx:333) has titleOf null; the paragraph path sends ps[0] (page.tsx:359, :366), titleOf null. paras and ps come from paragraphsOf (page.tsx:319 file, :327 paste, :359 send), which keeps the title out by design (rules/essay.ts:86-88). Only a client that posts raw text with its title line reaches the new fallback, which tools/essay-piece-test.cjs does (52/0); the phone does not. git diff -U0 11ea02f7 main touches desk/src/app/api/analyse/route.ts (taskFor :56, calls :190 and :203), desk/src/app/phone/page.tsx (pieceRead :288-295 inserted, 9 lines from :287, so the old :330 is now :339 and :357 is :366; call sites :850, :856, :869), desk/src/essay/EssayTV.tsx (:164, :194, :235, :355, :438) and desk/src/lib/rules/essay.ts (forensicTitle :134-135, 3 lines from :134, so every later line moves by 3, paragraphIsEnglish :261-268 is now :264-271); each cite was re-mapped through it and its line compared byte for byte with the old one. | cae23442 + 0e6a63c6 (narrowed) |

## New findings

None.

## Notes

- Evidence check at 0e6a63c6: every cited line was re-mapped through `git diff -U0 11ea02f7 main` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
