# eliska-12 × EM2 · (recert-19)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 2bdbdee8
- Recertifies: 2026-10-09-essay-l1/recert-18 at 8a739027
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim stays 'no e… (minor) | recurs → L1-eliska-12-EM2-1 | recert-19 @2bdbdee8: Re-walked at 2bdbdee8 (the local main tip); what the previous walk (at 8a739027) found: reviseSentence (desk/src/lib/desk/essay.ts:271, byte-identical file since 8a739027) still decides only sentence n (:304) and copies every other verdict unchanged (reading.verdicts.filter(v => v.n === s.n), :308); no line marks a kept faulty verdict that the rule would now clear. The only desk file that moved is rules/essay.ts (unanswered, the language arm), which reviseSentence does not call for the kept verdicts. Still declined under R6 (docs/BACKLOG.md). git diff -U0 8a739027 2bdbdee8 touches one desk file, desk/src/lib/rules/essay.ts (+8 at :240-247 CZECH_SHORT_SHAPE, CZECH_SHORT_FUNCTION and czechShortShape; czPlain :263 now also counts czechShortShape; +15 at :467-481 linkMissing and the doc above unanswered; :491 the unanswered filter also calls linkMissing; every line from :240 is +8, every line from :470 is +23), plus tools/essay-heldout-czech-short-r2.json (new), tools/essay-rules-test.cjs and tools/essay-piece-test.cjs; desk/src/lib/desk/essay.ts, desk/src/app/api/analyse/route.ts and desk/src/app/phone/page.tsx are byte-identical. Every cite of recert-18 (130 cited line numbers, ranges expanded) was re-mapped through it per file and compared byte for byte with the old line: 0 differ; the 1 inside a hunk (rules/essay.ts old :255, the czPlain line) was re-read by hand at :263. |  |

## New findings

None.

## Notes

- Evidence check at 2bdbdee8: every cited line was re-mapped through `git diff -U0 8a739027 2bdbdee8` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main` (82905fd2, 534ba3e0 and 2bdbdee8: all true). Nothing is resolved-verified: that needs live L2 evidence. Model-dependent behaviour stays with L2.
