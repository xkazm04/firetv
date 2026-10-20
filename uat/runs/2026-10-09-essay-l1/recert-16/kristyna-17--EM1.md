# kristyna-17 × EM1 · (recert-16)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 76a8cbc1
- Recertifies: 2026-10-09-essay-l1/recert-15 at 0e6a63c6
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word lists, with Eng… (major) | recurs → L1-kristyna-17-EM1-1 | Re-walked at 76a8cbc1 (the local main tip); what the previous walk (at 0e6a63c6) found still holds: paragraphIsEnglish (desk/src/lib/rules/essay.ts:264-271) is unchanged since ffa91a49: the 51 lines of the check's window hash to the same sha256 (1e12d4e6015ffc2b608a368039538edfa2f905ef7cfeaecb137b84863583b8a1) at ffa91a49 (lines 225-275), at 0e6a63c6 (lines 228-278) and at 76a8cbc1 (lines 228-278); git diff ffa91a49 76a8cbc1 touches the file at :134-136, :285, :323, :348, :559, :573-585, :617-619 and from :908 on, none of them in the check. No fresh held-out probe was written; recert-12/heldout.json stays the latest language measure (plain-letter Czech 36 of 36 refused, diacritic Czech 12 of 12, German 5 of 5, Polish 3 of 3, English 0 of 32; short plain-letter Czech lines 4 of 6). Both arms stay open: refusal is not complete (the recert-11 leak "Kamarad mi pujcil knizku o vesmiru a ja ji precetl za dva dny." and short plain lines pass) and the verdict rules still hold English-only word lists (desk/src/lib/rules/essay.ts:14, :16, :415, :428, byte for byte unchanged; the old :583 is :594). |  |
| L1-kristyna-17-EM1-2 ES-READ: kind and mode now reach the reading, a task has no sender and no history or memory rea… (major) | recurs → L1-kristyna-17-EM1-2 | Re-walked at 76a8cbc1 (the local main tip); what the previous walk (at 0e6a63c6) found still holds, with the title half of the task now closed on the phone: desk/src/lib/desk/essay.ts:102-120 (file unchanged) carries person, task and format but no history; desk/src/app/api/analyse/route.ts:54 taskOf(body.task) and taskFor :56, calls :190, :203, hand a task to the reading; the phone's piece call (desk/src/app/phone/page.tsx:340) and paragraph call (:367) send it when a title line was read (44aa0519), and no other task; desk/src/lib/rules/voice.ts (unchanged) essayReadingVoice takes age and mode only. No earlier readings or notes reach the prompt. git diff -U0 0e6a63c6 76a8cbc1 touches desk/src/app/phone/page.tsx (heading state inserted at :123, so every line from :123 on moves down by 1; loadParagraphs :308, file load :323, paste :328-330, piece call :340, paragraph call :367, learner reset :487) and desk/src/lib/rules/essay.ts (claimRuled inserted :573-580, the judged-skip :582-585, the old claim arm :607-609 removed, :619; lines up to :572 keep their numbers, :575-606 move +11, :610 on move +8), and no other desk file: analyse/route.ts, EssayTV.tsx and lib/desk/essay.ts are byte-identical to 0e6a63c6. Every cite was re-mapped through it and compared byte for byte with the old line (the cited lines of those files, 0 differ; the three lines inside a hunk, the old page.tsx :327, :339 and :366, re-read by hand at :328, :340 and :367). | 0e6a63c6 + 44aa0519 (narrowed) |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever language the model pick… (minor) | recurs → L1-kristyna-17-EM1-3 | Re-walked at 76a8cbc1 (the local main tip); what the previous walk (at 0e6a63c6) found still holds: the reading prompt (desk/src/lib/desk/essay.ts:102-112, file unchanged) still has no language instruction and the CHECKS lines are English (ADULT_CHECKS desk/src/lib/rules/essay.ts:462, YOUNG_CHECKS :475, both before the 76a8cbc1 hunks and byte-identical); a Czech paragraph that clears the language check would still get notes in whatever language the model picks. |  |

## New findings

None.

## Notes

- Evidence check at 76a8cbc1: every cited line was re-mapped through `git diff -U0 0e6a63c6 76a8cbc1` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
