# nela-12 × MB5 · (recert-8)

- Character: nela-12
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-maths-l1/recert-7 at ffa91a49
- **Verdict now: L1-pass (no row open).** 1 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-nela-12-MB5-1 A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-o… (minor) | fixed | 7f74afb3 (ancestor of HEAD) adds the school-year pick the acceptance names: Profile.year (desk/src/lib/session/store.ts:49) is the learner's own year, the store drops it when it does not fit the type and system and clears it when type, system or age change under it (:772-773); the TV profile has a School year row (desk/src/tv/profileRows.ts:99-103, yearOf :22 reads the pick before the age-derived year; the lamp passes the row, keys.ts:442-444, and a pick sets {year}, :451); learnerYear prefers it (desk/src/lib/rules/stretch.ts:75-79, `who.year` before schoolYear), recovery's Reader carries it (desk/src/lib/rules/recovery.ts readerOf, destinations `at.year ?? schoolYear(...)`), and the practice route passes it (desk/src/app/api/practice/route.ts:41). Untouched profiles read exactly as before. tools/school-stretch-test.cjs 13/0 and tools/tv-keys-test.cjs 80/0 hold it. The acceptance (a school-year pick on the profile, or the cut-off applied) is met by the pick; the age-derived year still ignores the cut-off for a profile that does not set it (syllabus.ts:304). | 7f74afb3 |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
