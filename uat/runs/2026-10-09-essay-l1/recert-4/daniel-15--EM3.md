# daniel-15 × EM3 ·  (recert-4)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-essay-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 1 fixed, 9 recur; 9 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-1 The Essay box is pre-filled with a sample paragraph; a paste at the cursor fuses… (major) | **fixed** (not-seen) | fdafb05f makes the Essay box start and reset empty: FRESH_PARAS = [""] (phone/page.tsx:61), the sample is ESSAY_PLACEHOLDER (:62), shown as the textarea's placeholder (:719), and a learner switch resets to the same empty state (:428). Executed at 67581c54 (scratch r7.cjs): onEssayPaste builds paragraphsOf(before + pasted + after) (:272-278); with an empty box a two-paragraph paste gives exactly ["Paragraph one is here.","Paragraph two follows."], where the old sample as value gave ["Many students are tired. Sleep is important. Schools start early. This is bad.Paragraph one is here.","Paragraph two follows."] (fused). Pinned by tools/phone-panel-test.cjs. | fdafb05f |
| L1-daniel-15-EM3-2 After a whole-piece read the phone offers 'Next paragraph (2 of 5)', which leads… (major) | recurs → L1-daniel-15-EM3-1 | cited lines re-found at 67581c54; page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) | none |
| L1-daniel-15-EM3-3 Pasting the revised essay makes a second 'Untitled essay', not a version (C6) (major) | recurs → L1-daniel-15-EM3-2 | cited lines re-found at 67581c54; page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) | none |
| L1-daniel-15-EM3-4 The forensic page he is moved to shows neither 'paragraph k of n' nor the summar… (major) | recurs → L1-daniel-15-EM3-3 | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files | none |
| L1-daniel-15-EM3-5 The paste box and the shelf are hidden whenever the TV is on the forensic page,… (major) | recurs → L1-daniel-15-EM3-4 | cited lines re-found at 67581c54; page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) | none |
| L1-daniel-15-EM3-6 A title line is read as its own paragraph or fuses into sentence 1; the task nev… (major) | recurs → L1-daniel-15-EM3-5 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) but not at the cited lines | none |
| L1-daniel-15-EM3-7 Nothing says grammar and spelling are not checked; 'Well done' lands on sentence… (minor) | recurs → L1-daniel-15-EM3-6 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) but not at the cited lines | none |
| L1-daniel-15-EM3-8 Deleting the open piece leaves the phone pointing at it; the next Read with Keep… (minor) | recurs → L1-daniel-15-EM3-7 | cited lines re-found at 67581c54; EssayShelf.tsx changed since 00f5db95 (6e8b7728) and the cite moved with it (same line content); page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) | none |
| L1-daniel-15-EM3-9 Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/texts… (minor) | recurs → L1-daniel-15-EM3-8 | cited lines re-found at 67581c54; route.ts changed since 00f5db95 (6e8b7728) but not at the cited lines; essay.ts changed since 00f5db95 (a52b4347) but not at the cited lines | none |
| L1-daniel-15-EM3-10 No verdict lands until the last paragraph is read (C3 second clause fails by des… (major) | recurs → L1-daniel-15-EM3-9 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
