# barbora-43 × EM1 · (recert-17)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 37d8e8e6
- Recertifies: 2026-10-09-essay-l1/recert-16 at 76a8cbc1
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-2 ES-READ grounding: the reading still never sees her earlier readings or notes, and no clie… (major) | recurs → L1-barbora-43-EM1-2 | recert-17 @37d8e8e6: Re-walked at 37d8e8e6 (the local main tip); what the previous walk (at 76a8cbc1) found still holds: desk/src/app/api/analyse/route.ts:54 taskOf(body.task) and taskFor :56 are unchanged, used at :190 and :203 (:203 now also passes hasFormat(body.format) ? body.format : undefined as analyseEssay's last argument); the phone's piece call (desk/src/app/phone/page.tsx:340) and paragraph call (:367) send task when the learner typed or pasted a title line (44aa0519), and since c35a1cad the paragraph call also sends format when one is chosen with no piece open, so the kind of writing now reaches a single-paragraph read; they still send no assignment name and no history. The prompt (desk/src/lib/desk/essay.ts:102-120, unchanged) has person, task if any and format, no earlier readings or notes. git diff -U0 76a8cbc1 37d8e8e6 touches desk/src/app/phone/page.tsx (a line inserted after old :289 and the old :292 removed, so the format radios are :290 and no later line moves; openKept :357 and the paragraph call :367 changed in place), desk/src/app/phone/EssayShelf.tsx (onOpen's type and call), desk/src/app/api/analyse/route.ts (:19 the Body type, :203 the analyseEssay call) and desk/src/lib/desk/essay.ts (:163 analyseEssay's signature, :167 the judge call), and no other desk file: lib/rules/essay.ts, EssayTV.tsx, voice.ts and the rest are byte-identical to 76a8cbc1. Every cite was re-mapped through it per file and compared byte for byte with the old line (128 cited line numbers, ranges expanded: 0 differ; the 5 inside a hunk, the old page.tsx :292 and :367, route.ts :19 and :203, essay.ts :163, re-read by hand at page.tsx :290 and :367, route.ts :19 and :203, essay.ts :163). |  |

## New findings

None.

## Notes

- Evidence check at 37d8e8e6: every cited line was re-mapped through `git diff -U0 76a8cbc1 37d8e8e6` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main` (c35a1cad and 37d8e8e6: both true). Model-dependent behaviour stays with L2.
