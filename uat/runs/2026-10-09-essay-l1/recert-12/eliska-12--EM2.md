# eliska-12 × EM2 · (recert-12)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-essay-l1/recert-11 at ffa91a49
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim … (minor) | recurs → L1-eliska-12-EM2-1 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: reviseSentence (desk/src/lib/desk/essay.ts:255) still decides only sentence n (:288) and copies every other verdict unchanged (reading.verdicts.filter(v => v.n === s.n), :292); no line marks a kept faulty verdict that the rule would now clear. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-eliska-12-EM2-2 After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not t… (minor) | fixed | The two halves of the row are both in code. 32ffdf92 (already narrowed at recert-11) sends Next sentence to the next faulty sentence: focusAfterRewrite lands on Next when the rewrite holds and another sentence is faulty (desk/src/tv/keys.ts:201-204) and nextFaultyAt (:206-213, called at :596) wraps to it. 562811ec (TL-7, ancestor of HEAD) puts the instruction on the TV page itself: Rewrite on my phone opens the rewrite hand-off (keys.ts:592 ask.open rewrite, kinds listed at :260), essayHandoffLine (:274-278) gives "On the phone: your rewrite. Back cancels." (or "No phone is connected. Back: cancel."), and the forensic Page draws it as the caption under "On your phone" (desk/src/essay/EssayTV.tsx:420, passed as wait= at :348) with the lit "On your phone" chip in Top (:49). tools/tv-keys-test.cjs 80/0 holds the TL-7 caption and chip (:1189-1199). The acceptance (Next sentence after a held rewrite goes to the next faulty sentence) is met and the expected line (the instruction on the TV) is drawn. Not screenshot-verified: L2. | 562811ec |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
