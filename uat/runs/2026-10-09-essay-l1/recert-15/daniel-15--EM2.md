# daniel-15 × EM2 · (recert-15)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 0e6a63c6
- Recertifies: 2026-10-09-essay-l1/recert-14 at 67e0a3a6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM2-2 A rewrite of a sentence first ruled neutral as a later unsupported claim is ruled faulty: 'Rewrite · not yet' (minor) | recurs → L1-daniel-15-EM2-2 | Re-walked at 0e6a63c6; what the previous walk (at 67e0a3a6) found still holds: a rewrite is judged on its own: desk/src/lib/desk/essay.ts:288 decideVerdicts(lens.id, next.sentences, new Set([n]), ...) (file unchanged), and only the first unsupported claim of a paragraph is faulty (desk/src/lib/rules/essay.ts:572 unsupportedSeen, :612, the old :569, :609 moved by the 3 lines of forensicTitle), so a claim first ruled neutral as a later one is ruled faulty alone. rules/essay.ts changed only by forensicTitle (:134-135). | none |

## New findings

None.

## Notes

- Evidence check at 0e6a63c6: every cited line was re-mapped through `git diff -U0 11ea02f7 main` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
