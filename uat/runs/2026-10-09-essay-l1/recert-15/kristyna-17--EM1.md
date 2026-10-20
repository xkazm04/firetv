# kristyna-17 × EM1 · (recert-15)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 0e6a63c6
- Recertifies: 2026-10-09-essay-l1/recert-14 at 67e0a3a6
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word lists, with English advice (major) | recurs → L1-kristyna-17-EM1-1 | Re-walked at 0e6a63c6; what the previous walk (at 67e0a3a6) found still holds: paragraphIsEnglish (desk/src/lib/rules/essay.ts:264-271, the old :261-268) is unchanged since ffa91a49: the 51 lines of the check's window hash to the same sha256 (1e12d4e6015ffc2b608a368039538edfa2f905ef7cfeaecb137b84863583b8a1) at ffa91a49 (lines 225-275), at 11ea02f7 (lines 225-275) and at 0e6a63c6 (lines 228-278: the window moved down by the 3 lines of forensicTitle at :134-135, so the literal lines 225-275 of today's file hash differently and the diff, not the numbers, is the proof). git diff ffa91a49 0e6a63c6 touches the file at :134-136 (forensicTitle), :285, :323, :348, :559 and from :900 on, none of them in the check. So no fresh held-out probe was written this round and recert-12/heldout.json stays the latest language measure (plain-letter Czech 36 of 36 refused, diacritic Czech 12 of 12, German 5 of 5, Polish 3 of 3, English 0 of 32; short plain-letter Czech lines 4 of 6, "Preji hezky den." and "Venku fouka vitr." still go to the model). Both arms stay open: refusal is not complete (the recert-11 leak "Kamarad mi pujcil knizku o vesmiru a ja ji precetl za dva dny." and short plain lines pass) and the verdict rules still hold English-only word lists (desk/src/lib/rules/essay.ts:14, :16, :415, :428, :583, the old :412, :425, :580). | ffa91a49 |
| L1-kristyna-17-EM1-2 ES-READ: kind and mode now reach the reading, a task has no sender and no history or memory reaches it (major) | recurs → L1-kristyna-17-EM1-2 | Re-walked at 0e6a63c6; what the previous walk (at 67e0a3a6) found still holds: desk/src/lib/desk/essay.ts:102-120 (file unchanged) carries person, task and format but no history; desk/src/app/api/analyse/route.ts:54 taskOf(body.task) and taskFor :56, calls :190, :203, hand a task to the reading; the phone's piece call (desk/src/app/phone/page.tsx:339) and paragraph call (:366) send none; desk/src/lib/rules/voice.ts (unchanged) essayReadingVoice takes age and mode only. No earlier readings or notes reach the prompt. git diff -U0 11ea02f7 main touches desk/src/app/api/analyse/route.ts (taskFor :56, calls :190 and :203), desk/src/app/phone/page.tsx (pieceRead :288-295 inserted, 9 lines from :287, so the old :330 is now :339 and :357 is :366; call sites :850, :856, :869), desk/src/essay/EssayTV.tsx (:164, :194, :235, :355, :438) and desk/src/lib/rules/essay.ts (forensicTitle :134-135, 3 lines from :134, so every later line moves by 3, paragraphIsEnglish :261-268 is now :264-271); each cite was re-mapped through it and its line compared byte for byte with the old one. | none |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever language the model picks; the prompt names none (minor) | recurs → L1-kristyna-17-EM1-3 | Re-walked at 0e6a63c6; what the previous walk (at 67e0a3a6) found still holds: the reading prompt (desk/src/lib/desk/essay.ts:102-112, file unchanged) still has no language instruction and the CHECKS lines are English (ADULT_CHECKS desk/src/lib/rules/essay.ts:462, YOUNG_CHECKS :475, the old :459, :472); a Czech paragraph that clears the language check would still get notes in whatever language the model picks. | none |

## New findings

None.

## Notes

- Evidence check at 0e6a63c6: every cited line was re-mapped through `git diff -U0 11ea02f7 main` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
