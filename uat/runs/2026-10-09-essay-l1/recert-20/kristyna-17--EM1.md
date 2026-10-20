# kristyna-17 × EM1 · (recert-20)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head bf036c94
- Recertifies: 2026-10-09-essay-l1/recert-19 at 2bdbdee8
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word lists, wit (major) | recurs → L1-kristyna-17-EM1-1 | recert-20 @bf036c94: Re-walked at bf036c94 (the local main tip); what the previous walk (at 2bdbdee8) found: Refusal arm: narrowed again, not met. paragraphIsEnglish (desk/src/lib/rules/essay.ts:280-291) refuses 57 of 60 Czech (95.0%, BLIND: tools/essay-heldout-czech-short-r3.json, pinned in 2da37c3b before the rule bf036c94, measured once after it; sha256 e90edcb74df70140cb383d3199cbefafc167db6a7d6c709472aea9af054a0c84) and 0 of 45 English; baseline on bf036c94^ 55/60. r2 60/60 (English 0/44), the first held-out 53/53 (0/42) and the tuning set 56/56 (0/44) are TUNED and are not blind evidence. 3 of 60 blind short Czech lines still reach the model and are ruled on English lists. The acceptance reads "the reading is refused for a non-English text"; narrowed, not met. The refusal figures narrow this row; they never fix it. L arm unchanged and operator-owned (rule on Czech word lists, or say we do not rule Czech): CONNECTORS (desk/src/lib/rules/essay.ts:14), LINK (:16), CONTRAST (:435, was :433), wordIn (:448, was :446) and noTurn (ADULT_CHECKS :500, YOUNG_CHECKS :513, were :498 and :511) are English-only and byte-identical to 2bdbdee8 apart from their line numbers (+2 from :248). git diff -U0 2bdbdee8 bf036c94 touches one desk file, desk/src/lib/rules/essay.ts (two hunks: :245 CZECH_SHORT_SHAPE gained four endings, +2 lines at :246-247 the comment and CZECH_SHORT_WORDS, :249 czechShortShape also reads CZECH_SHORT_WORDS; every line from :248 is +2), plus tools/essay-rules-test.cjs and the new tools/essay-heldout-czech-short-r3.json (2da37c3b); desk/src/lib/desk/essay.ts, desk/src/app/api/analyse/route.ts and desk/src/app/phone/page.tsx are byte-identical. | - |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever language the model (minor) | recurs → L1-kristyna-17-EM1-3 | recert-20 @bf036c94: Re-walked at bf036c94 (the local main tip); what the previous walk (at 2bdbdee8) found still holds: the reading prompt (desk/src/lib/desk/essay.ts:113-136, byte-identical file since 2bdbdee8; the assignment sentence at :122 and the data rows at :132-133 are about the task, not about the language) still has no language instruction and the CHECKS lines are English (ADULT_CHECKS desk/src/lib/rules/essay.ts:497, YOUNG_CHECKS :510, were :495 and :508; bytes unchanged); a Czech paragraph that clears the language check would still get notes in whatever language the model picks. Operator choice: the language of the notes for a Czech text. git diff -U0 2bdbdee8 bf036c94 touches one desk file, desk/src/lib/rules/essay.ts (two hunks: :245 CZECH_SHORT_SHAPE gained four endings, +2 lines at :246-247 the comment and CZECH_SHORT_WORDS, :249 czechShortShape also reads CZECH_SHORT_WORDS; every line from :248 is +2), plus tools/essay-rules-test.cjs and the new tools/essay-heldout-czech-short-r3.json (2da37c3b); desk/src/lib/desk/essay.ts, desk/src/app/api/analyse/route.ts and desk/src/app/phone/page.tsx are byte-identical. | - |

## New findings

None.

## Notes

- Evidence check at bf036c94: every desk/src/lib/rules/essay.ts line was re-derived (git diff -U0 2bdbdee8 bf036c94 shifts every line from :248 by +2); desk/src/lib/desk/essay.ts and desk/src/app/phone/page.tsx are byte-identical. Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Nothing is resolved-verified: that needs live L2 evidence. Model-dependent behaviour stays with L2.
