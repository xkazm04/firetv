# radka-41 × MB5 · (recert-6)

- Character: radka-41
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-maths-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB5-1 Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back' (the si… (minor) | recurs → L1-radka-41-MB5-1 | Cited lines re-found at 6b189791: profileRows.ts:24 DEFAULT_SYSTEM uk; profileRows.ts:77 draft type defaults to high-school; rows run Type, Age, Mode, School system, Interested in, Maths course before Save/Back (:79-87); phone profile (page.tsx:557) still has only the Name field and Save/Cancel. No commit changed this. | none |
| L1-radka-41-MB5-2 The recap and the week cover only the child seated now (minor) | recurs → L1-radka-41-MB5-2 | Cited lines re-found at 6b189791: recapRows.ts:77-78 recapRows(session, now) wraps the seated session's log in tonightsLog; the phone Recap block (page.tsx:757-768) is one block titled with s.learner's name, tiles from recapRows(s, now). No other learner's evening is listed. | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 c4893c88 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
