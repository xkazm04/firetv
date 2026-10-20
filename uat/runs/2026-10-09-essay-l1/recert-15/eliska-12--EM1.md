# eliska-12 × EM1 · (recert-15)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 0e6a63c6
- Recertifies: 2026-10-09-essay-l1/recert-14 at 67e0a3a6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / backs): when it omits them, Structure marks the true topic sentence and Evidence marks nothing (major) | recurs → L1-eliska-12-EM1-4 | Re-walked at 0e6a63c6; what the previous walk (at 67e0a3a6) found still holds: supports / backs are still optional in the request schema (desk/src/lib/desk/essay.ts:33, :35, not in required; the file is unchanged since 67e0a3a6); the Evidence branch of decideVerdicts (desk/src/lib/rules/essay.ts:561-575, :579, the old :558-572, :576 moved by the 3 lines of forensicTitle) still rules neutral when no accepted link and marks were judged, and Structure marks the true topic sentence when links are omitted. git diff -U0 11ea02f7 main touches desk/src/app/api/analyse/route.ts (taskFor :56, calls :190 and :203), desk/src/app/phone/page.tsx (pieceRead :288-295 inserted, 9 lines from :287, so the old :330 is now :339 and :357 is :366; call sites :850, :856, :869), desk/src/essay/EssayTV.tsx (:164, :194, :235, :355, :438) and desk/src/lib/rules/essay.ts (forensicTitle :134-135, 3 lines from :134, so every later line moves by 3, paragraphIsEnglish :261-268 is now :264-271); each cite was re-mapped through it and its line compared byte for byte with the old one. | none |

## New findings

None.

## Notes

- Evidence check at 0e6a63c6: every cited line was re-mapped through `git diff -U0 11ea02f7 main` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
