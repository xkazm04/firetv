# eliska-12 × EM1 · (recert-10)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-essay-l1/recert-9 at b7fca776
- **Verdict now: L1-conditional.** 1 fixed, 5 recur; 5 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-1 Every faulty note is a code line not in the young voice: 'asserts', 'checkable'… (major) | recurs → L1-eliska-12-EM1-1 | cited lines re-found at 6b189791: CHECKS (desk/src/lib/rules/essay.ts:444-454) still holds the adult wording ('This only asserts; nothing here is checkable.' :449, 'No checkable sentence here backs this opinion.' :450); the faulty note is still the check through guardNote (:590); planFit still prints 'That reads as ...' with the bare role word (PLAN_READS :850, return :862; replace(/^a /,'') gives 'That reads as claim.'). No young-band wording exists; d051b6f2, cae23442, 645fdc94 did not touch these. | none |
| L1-eliska-12-EM1-2 The forensic crumb, 'Its job' and the table show the regex first-pass role, whi… (minor) | recurs → L1-eliska-12-EM1-2 | cited lines re-found at 6b189791: role is still the regex first-pass guess (desk/src/lib/rules/essay.ts:45, LINK.test ? link : EVIDENCE.test ? evidence : claim); EssayTV.tsx:423 (crumb), :431-433 (Its job / move-type word) and :492 (table chip) still draw sn.role / x.role, unlabelled as a guess. 176f04f0 only added word and link counts to the table (:477), not changing the role source. | none |
| L1-eliska-12-EM1-3 stats.links (PEEL's L) and stats.words are computed for every reading and shown… (polish) | fixed | desk/src/essay/EssayTV.tsx:477 now builds figs as sentences, words (a.stats.words), claims, evidence, links (a.stats.links), connectors, words avg, so the table shows links beside claims and evidence, and the words total; stats are computed at desk/src/lib/rules/essay.ts:286-287. Fixed by 176f04f0 (ancestor of HEAD); essay-specimen.css:206 gap narrowed to fit the extra figures. | 176f04f0 |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / backs): whe… (major) | recurs → L1-eliska-12-EM1-4 | cited lines re-found at 6b189791: supports/backs are still optional in the request schema (desk/src/lib/desk/essay.ts:33,35, not in required). decideVerdicts evidence branch (desk/src/lib/rules/essay.ts:554-568) still rules neutral when no accepted link and marks were judged (:561-562), else the blind/unbacked rule; structure branch (:572-580) still uses blind / unsupported (CHECKS.unsupported :578). Code does not refuse a reading whose evidence sentence names nothing. No commit since b7fca776 changed this. | none |
| L1-eliska-12-EM1-5 PEEL's Explain is still marked faulty when it has no connector or linker opener… (minor) | recurs → L1-eliska-12-EM1-5 | cited lines re-found at 6b189791: closesAfterEvidence (desk/src/lib/rules/essay.ts:526-531) still returns false unless LINK.test(text) (:15) or a connector in EXPLAINS (:400); it is the only exemption for an opinion after backed evidence (:557). A connector-less Explain after backed evidence is still faulty CHECKS.unbacked (:566-567). No commit touched it. | none |
| L1-eliska-12-EM1-6 cleanFix's content check is a closed list of verbs: a frame with any other verb… (minor) | recurs → L1-eliska-12-EM1-6 | cited lines re-found at 6b189791: FINITE is still a closed verb list (desk/src/lib/rules/essay.ts:344); addsContent (:347-354) needs a FINITE word after a non-scaffold subject, so 'Teenagers sleep [how many] hours.' has no listed verb and passes; cleanFix calls it at :331. No verb-list-free content check was added. | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 b7fca776 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
