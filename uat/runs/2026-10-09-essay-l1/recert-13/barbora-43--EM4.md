# barbora-43 × EM4 · (recert-13)

- Character: barbora-43
- Journey: EM4
- Cert level: L1 re-walk, code only, no model
- Head 0eaf5a97
- Recertifies: 2026-10-09-essay-l1/recert-12 at ee7d6ac7
- **Verdict now: L1-pass (no row open).** 1 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM4-1 A paragraph-only evening's delete is out of reach when the TV is on a sentence… (major) | fixed | ca0c905c (ancestor of main) closes the half the row was narrowed to. 'Forget tonight's paragraph' was made always-on by 6e8b7728 (desk/src/app/phone/EssayShelf.tsx:50; DELETE /api/texts?paragraph=1 clears the seated paragraph, desk/src/app/api/texts/route.ts:73); ca0c905c now renders the shelf, and the control with it, through one shelf() (desk/src/app/phone/page.tsx:275) under the sentence rewrite panel (:831), the plan panel (:838) and the paragraph panel (:861), so it is reachable whatever the TV shows. tools/phone-panel-test.cjs 114/0 pins one EssayShelf element shared by the three panels. The engine sentence is shown before any reading of any kind (every analyse kind answers 428 with TEXT_NOTICE until it is accepted, desk/src/app/api/analyse/route.ts:156, :179, :198; the notice is the phone's TextNotice). Note for the owner: recert-4 narrowed this row to the delete and shelf-reach halves (the 'Where the writing is' Recap line of the original acceptance has no code of its own, and the Recap body now lists the evening per learner, 25b8fdf4); this round stamps the row as it stood narrowed. Not screenshot-verified: L2. | ca0c905c |

## New findings

None.

## Notes

- Evidence check at 0eaf5a97: every cited line was re-mapped through `git diff -U0 ee7d6ac7 0eaf5a97` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
