# eliska-12 × EM1 · (recert-13)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 0eaf5a97
- Recertifies: 2026-10-09-essay-l1/recert-12 at ee7d6ac7
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 row open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-2 The forensic crumb, 'Its job' and the table show the regex first-pass role, whi… (minor) | fixed | 31f14444 (ancestor of main) labels the regex role as a guess everywhere the page draws it: the crumb reads "first guess: <role>" (desk/src/essay/EssayTV.tsx:437), the role card "Its job · first guess" (:446), and the table column "First guess" (:498; the chip :507). Executed at 0eaf5a97 (scratch /tmp/rc13/ex.cjs outside the repo, renderToStaticMarkup of the real EssayTV, no model): the sentence page draws "Sentence 1 of 1 · first guess: claim" and "Its job · first guess claim"; the table header reads "First guess". tools/essay-rules-test.cjs 166/0 asserts the three labels and that the old "Role" column and unlabelled crumb are gone. The role value itself is still the regex first pass (desk/src/lib/rules/essay.ts:45); the acceptance allows labelling the guess as such, and it is. | 31f14444 |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / backs): whe… (major) | recurs → L1-eliska-12-EM1-4 | Re-walked at 0eaf5a97; what the previous walk (at ee7d6ac7) found still holds: supports / backs are still optional in the request schema (desk/src/lib/desk/essay.ts:33, :35, not in required); the Evidence branch of decideVerdicts (desk/src/lib/rules/essay.ts:558-572, :576) still rules neutral when no accepted link and marks were judged, and Structure marks the true topic sentence when links are omitted. desk/src/lib/rules/essay.ts changed only at :895 and after. None of the eight Essay commits since ee7d6ac7 (5aa1a604, eb97cef2, ca0c905c, 6374a2e6, 012df48f, 16ee1e98, c2dacc69, 31f14444) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at 0eaf5a97: every cited line was re-mapped through `git diff -U0 ee7d6ac7 0eaf5a97` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
