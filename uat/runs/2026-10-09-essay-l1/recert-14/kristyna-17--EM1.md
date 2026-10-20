# kristyna-17 × EM1 · (recert-14)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 67e0a3a6
- Recertifies: 2026-10-09-essay-l1/recert-13 at 0eaf5a97
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word lists, with English advice (major) | recurs → L1-kristyna-17-EM1-1 | Re-walked at 67e0a3a6; what the previous walk (at 0eaf5a97) found still holds: paragraphIsEnglish (desk/src/lib/rules/essay.ts:261-268) is unchanged since ffa91a49: lines 225-275 of the file hash to the same sha256 (1e12d4e6...) at ffa91a49 and at 67e0a3a6, and git diff ffa91a49 67e0a3a6 touches the file at :282, :320, :345, :556 and from :897 on, none of them in the check. So no fresh held-out probe was written this round and recert-12/heldout.json stays the latest language measure (plain-letter Czech 36 of 36 refused, diacritic Czech 12 of 12, German 5 of 5, Polish 3 of 3, English 0 of 32; short plain-letter Czech lines 4 of 6, "Preji hezky den." and "Venku fouka vitr." still go to the model). Both arms stay open: refusal is not complete (the recert-11 leak "Kamarad mi pujcil knizku o vesmiru a ja ji precetl za dva dny." and short plain lines pass) and the verdict rules still hold English-only word lists (desk/src/lib/rules/essay.ts:14, :16, :412, :425, :580). None of the three commits since 0eaf5a97 (5358ddeb, e0820f31, 67e0a3a6) changes what this row cites. | ffa91a49 |
| L1-kristyna-17-EM1-2 ES-READ: kind and mode now reach the reading, a task has no sender and no history or memory reaches it (major) | recurs → L1-kristyna-17-EM1-2 | Re-walked at 67e0a3a6; what the previous walk (at 0eaf5a97) found still holds: desk/src/lib/desk/essay.ts:102-120 prompt carries person, task and format but no history; desk/src/app/api/analyse/route.ts:54 taskOf(body.task), :188, :201 hand a task to the reading; the phone's piece call (desk/src/app/phone/page.tsx:330) and paragraph call (:357) send none; desk/src/lib/rules/voice.ts essayReadingVoice takes age and mode only. No earlier readings or notes reach the prompt. Cites re-mapped through git diff -U0 0eaf5a97 67e0a3a6 touches only desk/src/app/phone/page.tsx (11 lines inserted at :276, so the old :319 is now :330 and :346 is :357), desk/src/essay/EssayTV.tsx, desk/src/lib/rules/essay.ts (from :917), desk/src/lib/session/store.ts and desk/src/tv/recapRows.ts. None of the three commits since 0eaf5a97 (5358ddeb, e0820f31, 67e0a3a6) changes what this row cites. | none |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever language the model picks; the prompt names none (minor) | recurs → L1-kristyna-17-EM1-3 | Re-walked at 67e0a3a6; what the previous walk (at 0eaf5a97) found still holds: the reading prompt (desk/src/lib/desk/essay.ts:102-112) still has no language instruction and the CHECKS lines are English (ADULT_CHECKS desk/src/lib/rules/essay.ts:459, YOUNG_CHECKS :472); a Czech paragraph that clears the language check would still get notes in whatever language the model picks. None of the three commits since 0eaf5a97 (5358ddeb, e0820f31, 67e0a3a6) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at 67e0a3a6: every cited line was re-mapped through `git diff -U0 0eaf5a97 67e0a3a6` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
