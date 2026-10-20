# eliska-12 × EM1 · (recert-14)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 67e0a3a6
- Recertifies: 2026-10-09-essay-l1/recert-13 at 0eaf5a97
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / backs): when it omits them, Structure marks the true topic sentence and Evidence marks nothing (major) | recurs → L1-eliska-12-EM1-4 | Re-walked at 67e0a3a6; what the previous walk (at 0eaf5a97) found still holds: supports / backs are still optional in the request schema (desk/src/lib/desk/essay.ts:33, :35, not in required); the Evidence branch of decideVerdicts (desk/src/lib/rules/essay.ts:558-572, :576) still rules neutral when no accepted link and marks were judged, and Structure marks the true topic sentence when links are omitted. desk/src/lib/rules/essay.ts changed only from :917 (adultSay, playbookTitle). None of the three commits since 0eaf5a97 (5358ddeb, e0820f31, 67e0a3a6) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at 67e0a3a6: every cited line was re-mapped through `git diff -U0 0eaf5a97 67e0a3a6` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
