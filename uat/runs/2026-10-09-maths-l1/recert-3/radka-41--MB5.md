# radka-41 × MB5 · Setting up and the evening's recap (recert-3)

- Character: radka-41
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-radka-41-MB5-1 Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back'; the sy… (minor) | recurs → L1-radka-41-MB5-1 | desk/src/tv/profileRows.ts:24 — DEFAULT_SYSTEM uk / desk/src/tv/profileRows.ts:69 — draft type defaults to high-school / desk/src/tv/profileRows.ts:77 — Maths course row before Save/Back / desk/src/app/phone/page.tsx:538 — the phone profile has only the Name field / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-radka-41-MB5-2 The recap and the week cover only the child seated now (minor) | recurs → L1-radka-41-MB5-2 | desk/src/tv/recapRows.ts:66-68 — recapRows(s) reads the seated learner's history / desk/src/app/phone/page.tsx:735-744 — one block titled with s.learner's name / desk/src/lib/session/store.ts:667 — away slots hold the other child's log / recert-3 @00f5db95: cited lines re-found at 00f5db95; store.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines | none |
| L1-radka-41-MB5-3 The phone's Recap opened the next day before any TV event shows yesterday's hin… (minor) | recurs → L1-radka-41-MB5-3 | desk/src/tv/recapRows.ts:79 — hints and second from s.log, no log.day check / desk/src/app/phone/page.tsx:741-744 — Recap shown when a tile is non-empty; tally from s.log / desk/src/lib/session/store.ts:665-670,680,990 — dayed only in reduce; getSession returns the stored session / recert-3 @00f5db95: cited lines re-found at 00f5db95; store.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
