# kristyna-17 × EM1 · (recert-22)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 820a115d
- Recertifies: 2026-10-09-essay-l1/recert-21 at 6e50d7c3
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word lists, wi… (major) | recurs → L1-kristyna-17-EM1-1 | Refusal arm met on the blind set by the round-5 profile: r5 BLIND 60 of 60 Czech refused, 0 of 45 English; r4 TUNED 59 of 59, 0 of 45. L arm unchanged and operator-owned: CONNECTORS (desk/src/lib/rules/essay.ts:15), LINK (:17), CONTRAST (:457), wordIn (:470), noTurn (ADULT_CHECKS :522, YOUNG_CHECKS :535) are byte-identical to 6e50d7c3, moved by the import (+1) and the rule (+22). The refusal figures narrow this row; they never fix it. | d97ec7b9 |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever language the mode… (minor) | recurs → L1-kristyna-17-EM1-3 | desk/src/lib/desk/essay.ts is byte-identical to 6e50d7c3: the reading prompt (:113-136) has no language line; ADULT_CHECKS (rules/essay.ts:519) and YOUNG_CHECKS (:532) are English. The operator names the note language. | 820a115d |

## New findings

None.

## Notes

- Evidence check at 820a115d: every cited rules/essay.ts line re-read after the +1/+22 shift; desk/src/lib/desk/essay.ts unchanged. Nothing is resolved-verified.
