# eliska-12 × EM2 · (recert-20)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head bf036c94
- Recertifies: 2026-10-09-essay-l1/recert-19 at 2bdbdee8
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim stays 'no e (minor) | recurs → L1-eliska-12-EM2-1 | recert-20 @bf036c94: Re-walked at bf036c94 (the local main tip); what the previous walk (at 2bdbdee8) found still holds: reviseSentence (desk/src/lib/desk/essay.ts:271, byte-identical file since 2bdbdee8) still decides only sentence n (:304, decideVerdicts over new Set([n])) and copies every other verdict unchanged (reading.verdicts.filter(v => v.n === s.n), :308); no line marks a kept faulty verdict that the rule would now clear. The only desk file that moved is rules/essay.ts (the language arm), which reviseSentence does not call for the kept verdicts. Still declined under R6 (docs/BACKLOG.md). Observed again, not a row: reviseSentence checks observationOk only (:303), not linkMissing (rules/essay.ts:475), so a rewritten sentence with no supports/backs link is not refused the way a first-pass reading is; unexecuted, held until this recert merges. git diff -U0 2bdbdee8 bf036c94 touches one desk file, desk/src/lib/rules/essay.ts (two hunks: :245 CZECH_SHORT_SHAPE gained four endings, +2 lines at :246-247 the comment and CZECH_SHORT_WORDS, :249 czechShortShape also reads CZECH_SHORT_WORDS; every line from :248 is +2), plus tools/essay-rules-test.cjs and the new tools/essay-heldout-czech-short-r3.json (2da37c3b); desk/src/lib/desk/essay.ts, desk/src/app/api/analyse/route.ts and desk/src/app/phone/page.tsx are byte-identical. | - |

## New findings

None.

## Notes

- Evidence check at bf036c94: every desk/src/lib/rules/essay.ts line was re-derived (git diff -U0 2bdbdee8 bf036c94 shifts every line from :248 by +2); desk/src/lib/desk/essay.ts and desk/src/app/phone/page.tsx are byte-identical. Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Nothing is resolved-verified: that needs live L2 evidence. Model-dependent behaviour stays with L2.
