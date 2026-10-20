# barbora-43 × EM1 · (recert-16)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 76a8cbc1
- Recertifies: 2026-10-09-essay-l1/recert-15 at 0e6a63c6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-2 ES-READ grounding: the reading still never sees her earlier readings or notes, and no client se… (major) | recurs → L1-barbora-43-EM1-2 | Re-walked at 76a8cbc1 (the local main tip); what the previous walk (at 0e6a63c6) found still holds, with one change in the cited calls: desk/src/app/api/analyse/route.ts:54 taskOf(body.task) and taskFor :56 (titleOf(body.text) when none is sent) are unchanged, used at :190 and :203; the phone's piece call (desk/src/app/phone/page.tsx:340) and paragraph call (:367) now add task when the learner typed or pasted a title line (44aa0519; executed, see L1-daniel-15-EM3-2), and send none otherwise; they still send no assignment name and no history. The prompt (desk/src/lib/desk/essay.ts:102-120, file unchanged) has person, task if any and format, no earlier readings or notes. git diff -U0 0e6a63c6 76a8cbc1 touches desk/src/app/phone/page.tsx (heading state inserted at :123, so every line from :123 on moves down by 1; loadParagraphs :308, file load :323, paste :328-330, piece call :340, paragraph call :367, learner reset :487) and desk/src/lib/rules/essay.ts (claimRuled inserted :573-580, the judged-skip :582-585, the old claim arm :607-609 removed, :619; lines up to :572 keep their numbers, :575-606 move +11, :610 on move +8), and no other desk file: analyse/route.ts, EssayTV.tsx and lib/desk/essay.ts are byte-identical to 0e6a63c6. Every cite was re-mapped through it and compared byte for byte with the old line (the cited lines of those files, 0 differ; the three lines inside a hunk, the old page.tsx :327, :339 and :366, re-read by hand at :328, :340 and :367). | 0e6a63c6 + 44aa0519 (narrowed) |

## New findings

None.

## Notes

- Evidence check at 76a8cbc1: every cited line was re-mapped through `git diff -U0 0e6a63c6 76a8cbc1` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
