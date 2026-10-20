# kristyna-17 × EM1 · (recert-13)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 0eaf5a97
- Recertifies: 2026-10-09-essay-l1/recert-12 at ee7d6ac7
- **Verdict now: L1-conditional.** 1 fixed, 3 recur; 3 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word… (major) | recurs → L1-kristyna-17-EM1-1 | Re-walked at 0eaf5a97; what the previous walk (at ee7d6ac7) found still holds: paragraphIsEnglish is unchanged since ffa91a49 (see L1-helena-46-EM1-4), so no new probe was run; the latest measure is recert-12/heldout.json (48 of 48 fresh Czech paragraphs refused, 107 of 108 over it and recert-11's, 0 of 32 English), with the open leak "Kamarad mi pujcil knizku o vesmiru a ja ji precetl za dva dny." and short plain lines passing. The acceptance asks for completeness and for language-aware verdict rules; the rules still hold the English lists (desk/src/lib/rules/essay.ts:14, :16, :412, :425, :580). None of the eight Essay commits since ee7d6ac7 (5aa1a604, eb97cef2, ca0c905c, 6374a2e6, 012df48f, 16ee1e98, c2dacc69, 31f14444) changes what this row cites. | none |
| L1-kristyna-17-EM1-2 ES-READ: kind and mode now reach the reading, a task has no sender and no histo… (major) | recurs → L1-kristyna-17-EM1-2 | Re-walked at 0eaf5a97; what the previous walk (at ee7d6ac7) found still holds: desk/src/lib/desk/essay.ts:102-120 prompt carries person, task and format but no history; desk/src/app/api/analyse/route.ts:54 taskOf(body.task), :188, :201 hand a task to the reading; the phone's piece call (desk/src/app/phone/page.tsx:319) and paragraph call (:346) send none; desk/src/lib/rules/voice.ts essayReadingVoice takes age and mode only. No earlier readings or notes reach the prompt. Cites re-mapped through git diff -U0 ee7d6ac7 0eaf5a97 per file; phone/page.tsx:316 -> 319, :343 -> 346; the two call sites are at route.ts:188 and :201 (recert-12 numbered them :154 and :172; the route is unchanged since ee7d6ac7, so those were mis-numbered cites, not moved ones). None of the eight Essay commits since ee7d6ac7 (5aa1a604, eb97cef2, ca0c905c, 6374a2e6, 012df48f, 16ee1e98, c2dacc69, 31f14444) changes what this row cites. | none |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever languag… (minor) | recurs → L1-kristyna-17-EM1-3 | Re-walked at 0eaf5a97; what the previous walk (at ee7d6ac7) found still holds: the reading prompt (desk/src/lib/desk/essay.ts:102-112) still has no language instruction and the CHECKS lines are English (ADULT_CHECKS desk/src/lib/rules/essay.ts:459, YOUNG_CHECKS :472); a Czech paragraph that clears the language check would still get notes in whatever language the model picks. None of the eight Essay commits since ee7d6ac7 (5aa1a604, eb97cef2, ca0c905c, 6374a2e6, 012df48f, 16ee1e98, c2dacc69, 31f14444) changes what this row cites. | none |
| L1-kristyna-17-EM1-6 Nothing says before the first send that Essay Master reads English; on the plan… (minor) | fixed | 31f14444 (ancestor of main) says it on both surfaces for a profile whose system is not uk or us. Phone half: englishOnlyLine(system) (desk/src/lib/rules/essay.ts:904) feeds a line "Essay Master reads English writing." on the Essay tab's paragraph panel (desk/src/app/phone/page.tsx:111, :841, data-role="essay-english-only"), before the first send. TV half: the lens-home caption of a chosen lens, of an unchosen lens and of the plan stop all end with the same line through withEnglish (desk/src/essay/EssayTV.tsx:149-158). Executed at 0eaf5a97 (scratch /tmp/rc13/ex.cjs outside the repo, renderToStaticMarkup of the real EssayTV, no model): a cz adult profile's lens home draws "Paste, type or dictate one message or email on the phone. Essay Master reads English writing." on all four lenses and "Write the message yourself: ... Essay Master reads English writing." on the plan stop, once each; a uk family profile and a us profile draw no such line. tools/essay-rules-test.cjs 166/0 counts the line once for cz and zero for uk at the lens and plan stops; the phone half is pinned by the shared rule (englishOnlyLine) and was read in the source, not rendered. Not screenshot-verified: L2. | 31f14444 |

## New findings

None.

## Notes

- Evidence check at 0eaf5a97: every cited line was re-mapped through `git diff -U0 ee7d6ac7 0eaf5a97` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
