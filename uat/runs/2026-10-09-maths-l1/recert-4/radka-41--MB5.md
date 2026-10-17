# radka-41 × MB5 · Setting up a child (recert-4)

- Character: radka-41
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-maths-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB5-1 Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back'; the sys… (minor) | **recurs (narrowed)** → L1-radka-41-MB5-1 | Narrowed, not fixed (the row cannot be split, so it is kept whole and restated smaller). 5da74e9a closes the system half: Save now reads 'Saves as United Kingdom (0.5 is a half); pick a school system above to change it.' for a skipped row (executed, scratch r5.cjs). The 24-press half is untouched: profileRows(null) is still Type 3, Age 5, School system 4, Interested in 3, Maths course 3, Save/Back 2 cells in six rows (profileRows.ts:79-87), and the phone profile still has only the Name field (phone/page.tsx:543). | 5da74e9a |
| L1-radka-41-MB5-2 The recap and the week cover only the child seated now (minor) | recurs → L1-radka-41-MB5-2 | cited lines re-found at 67581c54; page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) | none |
| L1-radka-41-MB5-3 The phone's Recap opened the next day before any TV event shows yesterday's hint… (minor) | **recurs, fix in flight** → L1-radka-41-MB5-3 | recurs, fix in flight. Read from the code at 67581c54: recapRows.ts:79 still takes hints and second from s.log with no log.day check, store.ts:665-670,680,990 is unchanged (dayed only in reduce; getSession returns the stored session) and the phone's Recap is still shown when a tile is non-empty (phone/page.tsx:747-750). A separate run is building the next-day Recap fix (recapRows.ts, phone/page.tsx); it is not on this HEAD, so the row stays open until it lands, then re-walk. | none |

## New findings

None.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
