# nela-12 × MB5 ·  (recert-5)

- Character: nela-12
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-maths-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-nela-12-MB5-1 A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-o… (minor) | recurs → L1-nela-12-MB5-1 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-nela-12-MB5-2 The phone's Recap tab, opened on a new day before any desk event, still shows y… (minor) | fixed | fc8a5151: tonightsLog(s, now) (tv/recapRows.ts:71-74) returns the session log only when its day (log.day, else the day its timer started) is today, else an empty log, and recapRows wraps the session in it (:77-78), so the TV tile's hints, second hints and hinted problems are tonight's only (:91); the phone's Recap tally takes the same log (phone/page.tsx:757) while its guard (:755-756) shows "Arrives when the session ends." when no tile has work and the evening did not end today. Executed at c4893c88 (scratch recap.cjs, outside the repo; 20:00 on 24 Sep, a log of 42 minutes, 1 problem, 3 hints and 1 hard problem from 19:00 the day before, no event since): the maths tile is empty "Not tonight" with 0 hints and 0 second hints, the phone tally is "" and the phone shows "Arrives when the session ends."; the same log stamped day 2026-9-24 gives 3 hints and 1 second. Pinned by tools/tv-recap-test.cjs ('MB5-3'). (fc8a5151) | fc8a5151 |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
