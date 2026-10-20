# daniel-15 × EM2 · (recert-14)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 67e0a3a6
- Recertifies: 2026-10-09-essay-l1/recert-13 at 0eaf5a97
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM2-2 A rewrite of a sentence first ruled neutral as a later unsupported claim is ruled faulty: 'Rewrite · not yet' (minor) | recurs → L1-daniel-15-EM2-2 | Re-walked at 67e0a3a6; what the previous walk (at 0eaf5a97) found still holds: a rewrite is judged on its own: desk/src/lib/desk/essay.ts:288 decideVerdicts(lens.id, next.sentences, new Set([n]), ...), and only the first unsupported claim of a paragraph is faulty (desk/src/lib/rules/essay.ts:569 unsupportedSeen, :609), so a claim first ruled neutral as a later one is ruled faulty alone. desk/src/lib/rules/essay.ts changed only from :917 and desk/src/lib/desk/essay.ts not at all. None of the three commits since 0eaf5a97 (5358ddeb, e0820f31, 67e0a3a6) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at 67e0a3a6: every cited line was re-mapped through `git diff -U0 0eaf5a97 67e0a3a6` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
