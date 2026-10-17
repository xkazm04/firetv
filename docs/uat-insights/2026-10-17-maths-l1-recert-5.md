# L1 recertify, round 5, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-17)

This was a code-only L1 re-walk of the 9 pairs of `uat/runs/2026-10-09-maths-l1` that still had an open row, on main c4893c88 (`c4893c8886f0cb85c8880dbbb7e0ee145a9259c9`). There was no model call, no vision call and no browser, and nothing under `desk/` or `tools/` changed. The 21 rows open in `recert-4/findings.json` were answered `fixed` or `recurs` with current file:line evidence; the one commit that claims Math rows, fc8a5151, was proved by an executed scratch repro outside the repo. The full tables are in `uat/runs/2026-10-09-maths-l1/recertify-5.md`, the per-pair walks in `recert-5/`, and the stamps in the run's `findings.json` and in `recert-1` to `recert-4/findings.json`. Math L2 still waits on the vision host; `L1` is not `resolved-verified`.

Only fc8a5151 (the next-day phone and TV Recap) touches Math code since recert-4 (67581c54). Ids below are recert-4's unless written `recert-5/…`.

## Counts

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before | 0 | 0 | 18 | 3 | **21** |
| Fixed (severity as raised) | 0 | 0 | 2 | 0 | **2** |
| Recur (severity now) | 0 | 0 | 16 | 3 | **19** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 0 | 16 | 3 | **19** |

- Each fixed row names its commit, 2 of 2 (fc8a5151), an ancestor of c4893c88 (checked with `git merge-base --is-ancestor`).
- No blocker or major is open. Pair verdicts are the same as at recert-4 (all conditional); every pair still holds an open row.

## Fixed, with commits

| Row (recert-4 id) | Was | Commit | What the code does now |
| --- | --- | --- | --- |
| L1-nela-12-MB5-2 | minor 4 | fc8a5151 | `tonightsLog` (tv/recapRows.ts:71-74) returns the log only when its day is today, and `recapRows` and the phone tally use it (:77-78, phone/page.tsx:757). Executed (20:00, a log of 42 minutes, 3 hints and 1 hard problem from 19:00 the day before, no event since): the maths tile reads "Not tonight" with 0 hints, the phone tally is empty and the Recap says "Arrives when the session ends."; the same log stamped today gives 3 hints and 1 second hint. |
| L1-radka-41-MB5-3 | minor 6 | fc8a5151 | The same fix: a yesterday-stamped log, and an undated log whose timer started yesterday, no longer open a new day's Recap with yesterday's hints. These are the two rows recert-4 stamped `recurs` with "fix in flight". |

## Recurs

19 rows recur: no commit changed the behaviour their cited lines describe (cites in files that did change were re-mapped hunk by hunk and compared with the old line). One was re-read by hand: `L1-radka-41-MB5-2` (the recap and the week cover only the child seated now) cites the Recap block fc8a5151 edited; the history is still the seated learner's. The rest are the Calculus working and typesetting rows, the fraction tiers and worked lessons, the 24-press profile setup, the paper rows held only in React state and the unwired `topics[].codes`.

## New

None.

## Method notes

- Rows were answered from the code at c4893c88 with an executed repro outside the repo (`recap.cjs`: `recapRows` and the phone's tally and guard on a yesterday log, an undated log and today's log). Model-dependent behaviour and everything on the vision host stay with L2.
- Every cite was re-mapped through `git diff -U0 67581c54 c4893c88` per file; moved cites were compared with their old line, and cites inside a changed hunk were re-read by hand.
- Stamping: `writeBack` ran once through the ledger with the rerun's own rows skipped (parent 8, recert-1 19, recert-2 19, recert-3 19, recert-4 21 Math rows stamped); the ledger was read before any stamp.
- OPEN.md was regenerated once with `node uat/driver/linga-text.cjs --status`: 424 -> 424 (Math 21 -> 19, Essay 54 -> 50, Linga 349 -> 355 for the six rows of `2026-10-17-lt-swap-2` that OPEN.md did not hold yet). The Math section equals the 19 rows of `recert-5/findings.json`.
- `npm run test:rules` at c4893c88: 85 suites green, 2068 of 2068 tests.
