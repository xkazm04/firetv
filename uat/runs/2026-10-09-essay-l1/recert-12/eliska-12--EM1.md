# eliska-12 × EM1 · (recert-12)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-essay-l1/recert-11 at ffa91a49
- **Verdict now: L1-conditional.** 2 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-2 The forensic crumb, 'Its job' and the table show the regex first-pass role, whi… (minor) | recurs → L1-eliska-12-EM1-2 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: role is still the regex first-pass guess (desk/src/lib/rules/essay.ts:45, LINK.test ? link : EVIDENCE.test ? evidence : claim); EssayTV.tsx:430 (crumb), :439 ("Its job" and the move-type word) and :498 (table chip) still draw sn.role / x.role unlabelled as a guess. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; EssayTV.tsx:423-424 -> 429-430. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / backs): whe… (major) | recurs → L1-eliska-12-EM1-4 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: supports / backs are still optional in the request schema (desk/src/lib/desk/essay.ts:33, :35, not in required); the Evidence branch of decideVerdicts (desk/src/lib/rules/essay.ts:558-572, moved +4) still rules neutral when no accepted link and marks were judged, and Structure marks the true topic sentence when links are omitted. 69b5b059 touched the Explain exemption only. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; rules/essay.ts:554 -> 558, :572 -> 576, :598 -> 602. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-eliska-12-EM1-5 PEEL's Explain is still marked faulty when it has no connector or linker opener… (minor) | fixed | 69b5b059 (ancestor of HEAD) drops the connector requirement for the Evidence lens: closesAfterEvidence (desk/src/lib/rules/essay.ts:555-558) returns false for a connector-less sentence only when lens !== "evidence", so an opinion after the paragraph's last marked evidence in the same paragraph is neutral whatever it opens with; with no marked evidence before it the opinion stays faulty. Executed at ee7d6ac7 (scratch /tmp/rc12/ex2.cjs, no model): "Cars should be banned near schools. A 2021 study found that 40% of pupils live within one mile. Cleaner air helps pupils concentrate in lessons. The council should act now." with the model naming the link (backs: 1) gives S3 neutral and S4 neutral (was S3 faulty at ffa91a49); the same paragraph with "This means fewer children breathe dirty air." is neutral; an opinion with no evidence before it is still faulty. tools/essay-rules-test.cjs 161 pass 0 fail pins the connector-less Explain. The row's acceptance (an opinion after the last marked evidence is neutral with or without a connector; a rules test holds it) is met. Whether the model names the link is L2. | 69b5b059 |
| L1-eliska-12-EM1-6 cleanFix's content check is a closed list of verbs: a frame with any other verb… (minor) | fixed | aa2d0cd5 (ancestor of HEAD) adds FIX_LIMITS.contentWords: 2 (desk/src/lib/rules/essay.ts:320) and a check in cleanFix (:346) that refuses a frame whose literal words, minus SCAFFOLD, number more than that, so no verb list is needed for it (addsContent and FINITE :359 stay as the first arm). Executed at ee7d6ac7 (no model): cleanFix({move:"State the point",pattern:"Teenagers sleep [how many] hours."}) and "Councils ban cars outside schools [where]." both return undefined (kept at ffa91a49); "Because of [reason], [claim]." is still kept. tools/essay-rules-test.cjs 161/0 pins both repros. The acceptance (the content check does not depend on a verb list; the two repros pinned) is met. | aa2d0cd5 |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
