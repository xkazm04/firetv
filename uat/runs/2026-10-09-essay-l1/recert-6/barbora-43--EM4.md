# barbora-43 × EM4 ·  (recert-6)

- Character: barbora-43
- Journey: EM4
- Cert level: L1 re-walk, code only, no model
- Head 46db00cc
- Recertifies: 2026-10-09-essay-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM4-1 A paragraph-only evening's delete is out of reach when the TV is on a sentenc… (major) | recurs → L1-barbora-43-EM4-1 | cited lines re-found at 46db00cc; phone/EssayShelf.tsx changed since c4893c88 (c72a35ee, b9647a00) and the cite moved with it (same line content); phone/page.tsx:742 is the EssayShelf mount: c72a35ee added only onGone to it, and it still sits in the paragraph panel (:722, screen === "paste" && !onSentence && !onPlan), so the shelf and 'Forget tonight's paragraph' are still out of reach on a sentence or the plan | none |
| L1-barbora-43-EM4-2 A piece is 'one reading' on the recap but 'one piece' on the Sunday page (polish) | recurs → L1-barbora-43-EM4-2 | cited lines re-found at 46db00cc; no commit since c4893c88 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 46db00cc: every cited line was re-mapped through `git diff -U0 c4893c88 46db00cc` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
