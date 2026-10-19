# kristyna-17 × EM1 · (recert-12)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-essay-l1/recert-11 at ffa91a49
- **Verdict now: L1-conditional.** 0 fixed, 4 recur; 4 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word… (major) | recurs → L1-kristyna-17-EM1-1 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: paragraphIsEnglish is unchanged since ffa91a49 (see L1-helena-46-EM1-4). recert-12/heldout.json, a fresh probe: 36 of 36 plain-letter and 12 of 12 diacritic Czech paragraphs are refused, 0 of 32 English. Over the recert-11 probe (59 of 60) and this one (48 of 48) the refusal is 107 of 108; together with the round-10 corpus the open leak stays "Kamarad mi pujcil knizku o vesmiru a ja ji precetl za dva dny.". The acceptance asks for completeness and for language-aware verdict rules; the rules still hold the English lists (desk/src/lib/rules/essay.ts:14, :16, :412, :425, :580) and short plain Czech lines still go to the model (2 of 6 on this probe). Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; rules/essay.ts unchanged where it cites. None of the 43 commits since ffa91a49 changes what this row cites except as named. | ffa91a49 |
| L1-kristyna-17-EM1-2 ES-READ: kind and mode now reach the reading, a task has no sender and no histo… (major) | recurs → L1-kristyna-17-EM1-2 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/desk/essay.ts:102-120 prompt carries person, task and format but no history; desk/src/app/api/analyse/route.ts:54 taskOf(body.task), :154, :172 hand a task to the reading; the phone's piece call (desk/src/app/phone/page.tsx:316) and paragraph call (:343) send none; desk/src/lib/rules/voice.ts:97 essayReadingVoice takes age and mode only. No earlier readings or notes reach the prompt. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; phone/page.tsx:293 -> 316, route.ts:150 -> 154, :168 -> 172. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever languag… (minor) | recurs → L1-kristyna-17-EM1-3 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: the reading prompt (desk/src/lib/desk/essay.ts:102-112) still has no language instruction and the CHECKS lines are English (ADULT_CHECKS desk/src/lib/rules/essay.ts:459, YOUNG_CHECKS :472); a Czech paragraph that clears the language check (none of 48 on the recert-12 probe) would still get notes in whatever language the model picks. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-kristyna-17-EM1-6 Nothing says before the first send that Essay Master reads English; on the plan… (minor) | recurs → L1-kristyna-17-EM1-6 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/app/phone/page.tsx:837 Essay panel copy ("Send a .txt or .md file (a .docx goes through the PC page), or type, paste or dictate a message...") still names no language; desk/src/tv/profileRows.ts:32 essay blurb has none; desk/src/tv/keys.ts:558 posts the plan read as kind essay; the refusal is only at read time (desk/src/app/api/analyse/route.ts:168, :196; NOT_ENGLISH_LINE desk/src/lib/rules/essay.ts:173) so three Czech slots are still inked first (planFit :888). Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; phone/page.tsx:725 -> 837, profileRows.ts:20 -> 32, keys.ts:456 -> 558. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
