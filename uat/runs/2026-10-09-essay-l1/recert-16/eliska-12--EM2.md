# eliska-12 × EM2 · (recert-16)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 76a8cbc1
- Recertifies: 2026-10-09-essay-l1/recert-15 at 0e6a63c6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim stays 'no eviden… (minor) | recurs → L1-eliska-12-EM2-1 | Re-walked at 76a8cbc1 (the local main tip); what the previous walk (at 0e6a63c6) found still holds: reviseSentence (desk/src/lib/desk/essay.ts:255) still decides only sentence n (:288) and copies every other verdict unchanged (reading.verdicts.filter(v => v.n === s.n), :292); no line marks a kept faulty verdict that the rule would now clear. desk/src/lib/desk/essay.ts is byte-identical to 0e6a63c6 (git diff 0e6a63c6 76a8cbc1 is empty on it). 76a8cbc1 makes a rewritten later claim keep its neutral verdict (L1-daniel-15-EM2-2) but changes nothing for a kept earlier verdict, which is this row. |  |

## New findings

None.

## Notes

- Evidence check at 76a8cbc1: every cited line was re-mapped through `git diff -U0 0e6a63c6 76a8cbc1` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
