# daniel-15 × EM2 ·  (recert-4)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-essay-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 2 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM2-1 Rewrites never reach the phone's text or the shelf; reading the piece again re-r… (major) | **fixed** (not-seen) | 67581c54: sendRewrite writes an accepted rewrite back into the phone's own paragraphs (phone/page.tsx:251 -> writeRewriteBack, rewriteBack.ts:15-25) when the original sentence appears exactly once across them; otherwise the phone says plainly 'That rewrite stays on the desk. Reading the whole piece again uses the text as typed here.' (:251 setMsg, and a standing line above the read button while any rewrite is unwritten, :283 and :725; the count resets on a new text, :254, and on a read, :291). Executed at 67581c54 (scratch r6.cjs): ['Many students are tired. Sleep is important.','Schools start early.'], rewrite of 'Sleep is important.' -> written, the first paragraph now carries the rewrite, so readPiece's paras.join sends it; a sentence that occurs twice, is absent or is empty -> not written, the stay-on-the-desk line; 3 stranded -> '3 rewrites stay on the desk. …'. Pinned by tools/phone-panel-test.cjs. The kept piece on the shelf takes the rewrite when the next read keeps a new version, since the read sends the written-back text. | 67581c54 |
| L1-daniel-15-EM2-2 Ghostwriting backstop for the pattern is narrow: a slot may hold a whole sentenc… (major) | **fixed** (not-seen) | a52b4347: cleanFix(raw, sentences) is given every learner sentence (rules/essay.ts:231, called with sentences.map(t => t.text) at :511), refuses a slot of sentence shape or one holding a run of the learner's words (:247-249, sentenceShaped :256-259), and a frame whose literal words hold a subject and a finite verb (addsContent, :251, :267-273). Executed at 67581c54 (scratch r2.cjs): 'Phones stop students listening [how many]' (a 4-word run of a neighbour) -> refused; '[Phones stop students listening, so they lose marks in tests].' (a whole sentence in a slot) -> refused; 'This is because [children who walk arrive at school more awake and ready to learn].' -> refused; 'A survey found that [number] of children walk.' and 'Research by [source] shows that [claim].' -> refused; real frames still stand: 'For example, [a number or a case] shows that [what it proves].', 'This matters because [the effect on the reader].', '[Claim] because [mechanism].' -> kept. Pinned by tools/essay-rules-test.cjs. The note half was closed at recert-3 (f3b8e4b1). One residual edge is filed as new: the verb list in addsContent is closed. | a52b4347 |
| L1-daniel-15-EM2-3 Dictate on the Essay tab and the rewrite panel listens in Czech for a cz learner… (minor) | recurs → L1-daniel-15-EM2-1 | cited lines re-found at 67581c54; page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) | none |
| L1-daniel-15-EM2-4 A rewrite of a sentence first ruled neutral as a later unsupported claim is rule… (minor) | recurs → L1-daniel-15-EM2-2 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
