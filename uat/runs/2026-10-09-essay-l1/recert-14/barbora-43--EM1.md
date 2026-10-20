# barbora-43 × EM1 · (recert-14)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 67e0a3a6
- Recertifies: 2026-10-09-essay-l1/recert-13 at 0eaf5a97
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-2 ES-READ grounding: the reading still never sees her earlier readings or notes, and no client sends the assignment (major) | recurs → L1-barbora-43-EM1-2 | Re-walked at 67e0a3a6; what the previous walk (at 0eaf5a97) found still holds: desk/src/app/api/analyse/route.ts:54 taskOf(body.task) is still the only way a task enters (:188, :201); the phone's piece call (desk/src/app/phone/page.tsx:330) and paragraph call (:357) send kind, text, type, keep, pieceId, source and format/title, no task; the prompt (desk/src/lib/desk/essay.ts:102-120) has person, task if any and format, no earlier readings or notes. Cites re-mapped through git diff -U0 0eaf5a97 67e0a3a6 touches only desk/src/app/phone/page.tsx (11 lines inserted at :276, so the old :319 is now :330 and :346 is :357), desk/src/essay/EssayTV.tsx, desk/src/lib/rules/essay.ts (from :917), desk/src/lib/session/store.ts and desk/src/tv/recapRows.ts. None of the three commits since 0eaf5a97 (5358ddeb, e0820f31, 67e0a3a6) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at 67e0a3a6: every cited line was re-mapped through `git diff -U0 0eaf5a97 67e0a3a6` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
