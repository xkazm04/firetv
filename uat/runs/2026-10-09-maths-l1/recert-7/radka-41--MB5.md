# radka-41 × MB5 · (recert-7)

- Character: radka-41
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-maths-l1/recert-6 at 6b189791
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB5-1 Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back' (the silent UK de… (minor) | fixed | 3240d025 (ancestor of HEAD) is the second arm of the acceptance ('the TV rows start on the likely value'): in the profile handler a pick now moves the lamp to the next row's current or likely cell (desk/src/tv/keys.ts:375-380 pick(), likelyIx desk/src/tv/profileRows.ts:92-104: the middle of the age range, Family, the system's default, the first course), and the 'Maths course' row is not offered to an elementary child unless the draft already holds a course (profileRows.ts:87). tools/tv-keys-test.cjs 'profile setup (L1-radka-41-MB5-1, TV half)' walks a 12-year-old elementary cz maths-only child to Save in 13 presses (21 before), and checks the age middles 10 (elementary) and 17 (high-school); tv-keys 59/0. 13 presses is still more than the phone would take, but the acceptance names either arm; the phone-side arm is not needed to close it. | 3240d025 |
| L1-radka-41-MB5-2 The recap and the week cover only the child seated now (minor) | recurs → L1-radka-41-MB5-2 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791: recapRows.ts:77-78 recapRows(session, now) wraps the seated session's log in tonightsLog; the phone Recap block (page.tsx:757-768) is one block titled with s.learner's name, tiles from recapRows(s, now). No other learner's evening is listed. None of the seven commits since 6b189791 (56f903ae, da6f9f07, 3240d025 and e9c5ee8f are the Math commits; b75bd45f, 61a8e2ee and ffa91a49 are Essay) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
