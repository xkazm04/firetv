# barbora-43 × EM1 · (recert-15)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 0e6a63c6
- Recertifies: 2026-10-09-essay-l1/recert-14 at 67e0a3a6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-2 ES-READ grounding: the reading still never sees her earlier readings or notes, and no client sends the assignment (major) | recurs → L1-barbora-43-EM1-2 | Re-walked at 0e6a63c6; what the previous walk (at 67e0a3a6) found still holds, with one change in the cited route: desk/src/app/api/analyse/route.ts:54 taskOf(body.task) still reads the sent task, and 0e6a63c6 adds taskFor (:56) so a title line on top of the text is the task when none is sent (:190, :203); a title never reaches it from the phone (see L1-daniel-15-EM3-2). The phone's piece call (desk/src/app/phone/page.tsx:339) and paragraph call (:366) send kind, text, type, keep, pieceId, source and format/title, no task; the prompt (desk/src/lib/desk/essay.ts:102-120, file unchanged) has person, task if any and format, no earlier readings or notes. git diff -U0 11ea02f7 main touches desk/src/app/api/analyse/route.ts (taskFor :56, calls :190 and :203), desk/src/app/phone/page.tsx (pieceRead :288-295 inserted, 9 lines from :287, so the old :330 is now :339 and :357 is :366; call sites :850, :856, :869), desk/src/essay/EssayTV.tsx (:164, :194, :235, :355, :438) and desk/src/lib/rules/essay.ts (forensicTitle :134-135, 3 lines from :134, so every later line moves by 3, paragraphIsEnglish :261-268 is now :264-271); each cite was re-mapped through it and its line compared byte for byte with the old one. | none |

## New findings

None.

## Notes

- Evidence check at 0e6a63c6: every cited line was re-mapped through `git diff -U0 11ea02f7 main` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
