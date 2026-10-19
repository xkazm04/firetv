# barbora-43 × EM1 · (recert-12)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-essay-l1/recert-11 at ffa91a49
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-1 The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own… (major) | recurs → L1-barbora-43-EM1-1 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/essay/EssayTV.tsx:547-549 (XRAY_ROWS, XRAY) still draw the three whole "Many students arrive at school exhausted" sentences; desk/src/app/phone/page.tsx:66 ESSAY_PLACEHOLDER is still the tired / sleep sample; desk/src/lib/session/store.ts:600 seeds the task "Later school starts - first draft". TL-7 changed EssayTV Top, the captions and the action row, not the x-ray. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; EssayTV.tsx:541 -> 547. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-barbora-43-EM1-2 ES-READ grounding: the reading still never sees her earlier readings or notes, … (major) | recurs → L1-barbora-43-EM1-2 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/app/api/analyse/route.ts:54 taskOf(body.task) is still the only way a task enters; the phone's piece call (desk/src/app/phone/page.tsx:316) and paragraph call (:343) send kind, text, type, keep, pieceId, source and format/title, no task; the prompt (desk/src/lib/desk/essay.ts:102-120) still has person, task if any and format, no earlier readings or notes. TL-7's paragraph hand-off (keys.ts:260) carries no task detail. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; phone/page.tsx:293 -> 316, :318 -> 343. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
