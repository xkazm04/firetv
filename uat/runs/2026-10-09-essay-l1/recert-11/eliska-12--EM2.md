# eliska-12 × EM2 · (recert-11)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-essay-l1/recert-10 at 6b189791
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim stays 'no… (minor) | recurs → L1-eliska-12-EM2-1 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: cited lines re-found at 6b189791: reviseSentence (desk/src/lib/desk/essay.ts:292) still copies every other verdict unchanged (reading.verdicts.filter(v => v.n === s.n)) and decides only sentence n (:288); no line marks a kept faulty verdict that the rule would now clear. None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-eliska-12-EM2-2 After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not to the next… (minor) | recurs → L1-eliska-12-EM2-2 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: narrowed by 32ffdf92; still missing: The instruction ('rewrite it in your own words on the phone's Essay tab, then analyse again') is not shown on the TV page itself after pressing Rewrite on my phone; only the phone chip lights and the bench status bar carries the text. At ffa91a49 the cited lines of changed files sit at tv/keys.ts:191->199, tv/keys.ts:481->497 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
