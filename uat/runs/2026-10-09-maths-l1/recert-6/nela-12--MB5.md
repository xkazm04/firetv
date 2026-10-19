# nela-12 × MB5 · (recert-6)

- Character: nela-12
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-maths-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-nela-12-MB5-1 A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-o… (minor) | recurs → L1-nela-12-MB5-1 | Cited lines re-found at 6b189791, files untouched since c4893c88: syllabus.ts:302-304 schoolYear(system,age) is still age - SYSTEM_START[system] + 1 with no cut-off, and stretch.ts:74-78 learnerYear calls it; there is still no school-year pick on the profile, so a 12-year-old in 6. rocnik is taken for 7. | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 c4893c88 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
