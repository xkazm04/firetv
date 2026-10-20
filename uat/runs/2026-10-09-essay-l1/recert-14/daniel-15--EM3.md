# daniel-15 × EM3 · (recert-14)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 67e0a3a6
- Recertifies: 2026-10-09-essay-l1/recert-13 at 0eaf5a97
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-1 The paste box and the shelf are hidden whenever the TV is on the forensic page, and Essay Master reopens there (major) | fixed | 67e0a3a6 (ancestor of main) with ca0c905c closes the row. Read in desk/src/app/phone/page.tsx at 67e0a3a6: the paste box and its send are two pieces shared like shelf(): pasteField() (:277-282: the textarea bound to value={essay}, the note, the re-send button, the TextNotice) and pasteSend() (:283-285: Dictate, and "Analyse on the TV" or "This paragraph only"). They are rendered in the sentence rewrite panel (:841, data-role="essay-rewrite"), the plan panel (:847, data-role="essay-plan") and the paragraph panel (:859, :866), each with shelf() (:841, :847, :867), so the TV on a forensic page or the plan no longer hides the box, the send or the shelf. The shelf's Open (openKept :347 -> loadParagraphs :298) fills paras; essay = paras[pix] (:107) is what the box shows, so under the two panels Open now lands in a box on screen (before 67e0a3a6 it loaded text that no visible panel showed). The send does not depend on onSentence or onPlan (analyseParagraph :349-367 posts kind essay with the box's text). Executed at 67e0a3a6: tools/phone-panel-test.cjs 115/0 (the new case counts one textarea, one essay-analyse-one, one againBtn and a pasteField, pasteSend and shelf in each of the three panels), tools/tv-recap-test.cjs 62/0 and tools/essay-rules-test.cjs 167/0 green. The acceptance ("he can paste tonight's essay or open his shelf from the phone's Essay tab at any time") holds on the source; the rendered phone is L2. Not covered, for the next drain and not a reason to hold the row: a multi-paragraph piece opened from the shelf under the rewrite or plan panel offers "This paragraph only" and "Next paragraph" but not "Read the whole piece on the TV", which stays on the paragraph panel (:865); the TV's Back returns the phone there. | 67e0a3a6 |
| L1-daniel-15-EM3-2 A title line is read as its own paragraph or fuses into sentence 1; the task never reaches the prompt as a task (major) | recurs → L1-daniel-15-EM3-2 | Re-walked at 67e0a3a6; what the previous walk (at 0eaf5a97) found still holds: readTitle (desk/src/lib/rules/essay.ts:117; used at :30 and :87) keeps a leading title line out of the paragraphs and the sentences; titleOf (:132) has no caller outside rules/essay.ts (desk/src/lib/session/texts.ts:92 is a different function of its own); desk/src/app/api/analyse/route.ts:188 and :201 hand the reading only taskOf(body.task); the phone sends no task (desk/src/app/phone/page.tsx:330, :357); the TV draws no title (desk/src/essay/EssayTV.tsx). Cites re-mapped through git diff -U0 0eaf5a97 67e0a3a6 touches only desk/src/app/phone/page.tsx (11 lines inserted at :276, so the old :319 is now :330 and :346 is :357), desk/src/essay/EssayTV.tsx, desk/src/lib/rules/essay.ts (from :917), desk/src/lib/session/store.ts and desk/src/tv/recapRows.ts. None of the three commits since 0eaf5a97 (5358ddeb, e0820f31, 67e0a3a6) changes what this row cites. | cae23442 (narrowed) |

## New findings

None.

## Notes

- Evidence check at 67e0a3a6: every cited line was re-mapped through `git diff -U0 0eaf5a97 67e0a3a6` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
