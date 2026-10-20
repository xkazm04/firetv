# kristyna-17 × EM1 · (recert-21)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 6e50d7c3
- Recertifies: 2026-10-09-essay-l1/recert-20 at bf036c94
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word lists, wi… (major) | recurs → L1-kristyna-17-EM1-1 | recert-21 @6e50d7c3: Re-walked at 6e50d7c3 (the local main tip); what the previous walk (at bf036c94) found: Refusal arm: narrowed again, not met. paragraphIsEnglish (desk/src/lib/rules/essay.ts:280-291) refuses 55 of 59 Czech (93.2%, BLIND: tools/essay-heldout-czech-short-r4.json, committed alone in 76523b70 before the rule b490c9d0; sha256 02a9eb1b1fb3696b420580206ebb881bf1a92dd2e7b111ac198a9c99ed8a3461) and 1 of 45 English; 54 of 59 before the rule. r3 is now TUNED (60 of 60, English 0 of 45), r2 60 of 60, the first held-out 53 of 53 and the tuning set 56 of 56 are TUNED. Word-list tuning has stopped (decision recorded on L1-helena-46-EM1-4): the 4 blind leaks are an accepted residual. L arm: open and operator-owned (rule on Czech word lists, or say we do not rule Czech). CONNECTORS (:14), LINK (:16), CONTRAST (:435), wordIn (:448), noTurn (ADULT_CHECKS :500, YOUNG_CHECKS :513) were re-read at 6e50d7c3 and are byte-identical to bf036c94 and at the same line numbers. The refusal figures narrow this row; they never fix it. | 6e50d7c3 |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever language the mode… (minor) | recurs → L1-kristyna-17-EM1-3 | recert-21 @6e50d7c3: Re-walked at 6e50d7c3 (the local main tip); what the previous walk (at bf036c94) found still holds: the reading prompt (desk/src/lib/desk/essay.ts:113-136) still has no language instruction and the CHECKS lines are English (ADULT_CHECKS desk/src/lib/rules/essay.ts:497, YOUNG_CHECKS :510). desk/src/lib/desk/essay.ts moved by f4aea028 in two lines only (:10 the import drops observationOk; :303 reviseSentence uses unanswered), neither in the reading prompt, and no line moves. Notes for a Czech text that clears the language check are in whatever language the model picks; the operator names the language. | 6e50d7c3 |

## New findings

None.

## Notes

- Evidence check at 6e50d7c3: every desk/src/lib/rules/essay.ts line was re-read (git diff -U0 bf036c94 6e50d7c3 shows two in-place edits, :245 and :247, so no line moves); desk/src/lib/desk/essay.ts changed in place at :10 and :303 only; desk/src/app/phone/page.tsx is byte-identical to bf036c94. Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Nothing is resolved-verified: that needs live L2 evidence. Model-dependent behaviour stays with L2. No held-out Czech leak and no held-out English line is printed in this file (counts, an index and a sha256 only).
