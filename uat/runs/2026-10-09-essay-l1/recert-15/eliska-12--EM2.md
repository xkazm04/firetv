# eliska-12 × EM2 · (recert-15)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 0e6a63c6
- Recertifies: 2026-10-09-essay-l1/recert-14 at 67e0a3a6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim stays 'no evidence' (minor) | recurs → L1-eliska-12-EM2-1 | Re-walked at 0e6a63c6; what the previous walk (at 67e0a3a6) found still holds: reviseSentence (desk/src/lib/desk/essay.ts:255) still decides only sentence n (:288) and copies every other verdict unchanged (reading.verdicts.filter(v => v.n === s.n), :292); no line marks a kept faulty verdict that the rule would now clear. desk/src/lib/desk/essay.ts is unchanged since 67e0a3a6 (git diff 11ea02f7 main is empty on it). | none |

## New findings

None.

## Notes

- Evidence check at 0e6a63c6: every cited line was re-mapped through `git diff -U0 11ea02f7 main` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
