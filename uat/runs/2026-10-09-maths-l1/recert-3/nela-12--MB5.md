# nela-12 × MB5 · Is it worth keeping? (recert-3)

- Character: nela-12
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-nela-12-MB5-1 The school system defaults silently to UK, and the row's blurb does not say it… (minor) | recurs → L1-nela-12-MB5-1 | desk/src/tv/profileRows.ts:24 — DEFAULT_SYSTEM = 'uk' / desk/src/tv/profileRows.ts:29 — cz blurb names ročníky only / desk/src/tv/profileRows.ts:33 — systemOf falls back silently / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-nela-12-MB5-2 A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-o… (minor) | recurs → L1-nela-12-MB5-2 | desk/src/lib/library/syllabus.ts:302-304 — schoolYear ignores the cut-off / desk/src/lib/rules/stretch.ts:74-78 — learnerYear / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-nela-12-MB5-3 The phone's Recap tab, opened on a new day before any desk event, still shows y… (minor) | recurs → L1-nela-12-MB5-3 | desk/src/tv/recapRows.ts:79 — hints/second read from s.log without a day check / desk/src/lib/session/store.ts:665-670,680 — clearing only inside reduce / desk/src/app/phone/page.tsx:740-741 — guard / recert-3 @00f5db95: cited lines re-found at 00f5db95; store.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
