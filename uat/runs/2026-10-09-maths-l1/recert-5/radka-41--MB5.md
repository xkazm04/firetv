# radka-41 × MB5 ·  (recert-5)

- Character: radka-41
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-maths-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 1 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB5-1 Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back' (the si… (minor) | recurs → L1-radka-41-MB5-1 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) | none |
| L1-radka-41-MB5-2 The recap and the week cover only the child seated now (minor) | recurs → L1-radka-41-MB5-2 | cited lines re-found at c4893c88; the recapRows.ts cite (66-68) and the phone Recap block (741-750) sit in changed hunks of fc8a5151 and were re-read by hand: the signature moved to :77 and now wraps the log in tonightsLog, and the phone block moved to :750-760 with the tally taking the same wrapped log; the history is still the seated learner's and the block is still titled with their name; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) | none |
| L1-radka-41-MB5-3 The phone's Recap opened the next day before any TV event shows yesterday's hin… (minor) | fixed | Same fix as L1-nela-12-MB5-2 (fc8a5151): recapRows and the phone tally count the log only when it is today's (tonightsLog, tv/recapRows.ts:71-74, applied at :77-78 and at phone/page.tsx:757). Executed at c4893c88 (scratch recap.cjs): a yesterday-stamped log, and an undated log whose timer started yesterday, with no event -> the maths tile reads "Not tonight" with 0 hints, the phone tally is empty and the Recap says "Arrives when the session ends."; a log of today keeps its 3 hints. An undated log with no start time still counts as tonight's, as the store's own rule does. (fc8a5151) | fc8a5151 |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
