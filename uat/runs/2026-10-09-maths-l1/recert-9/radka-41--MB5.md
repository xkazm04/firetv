# radka-41 × MB5 · (recert-9)

- Character: radka-41
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head c2dacc69
- Recertifies: 2026-10-09-maths-l1/recert-8 at ee7d6ac7
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB5-2 The recap and the week cover only the child seated now (minor) | recurs → L1-radka-41-MB5-2 | Re-walked at c2dacc69; narrowed by 25b8fdf4 (ancestor of main), not closed. learnerRecaps (desk/src/tv/recapRows.ts:114-130) gives one entry per profile whose tiles have work, in profile order, and the phone Recap renders one block per entry headed "<name>, tonight" (desk/src/app/phone/page.tsx:873-881; the seated block alone carries the tally and the tasks; the old single block stays as the fallback at :882-884). But an away learner is read off their MathsSlot only: the copy sets history: [] and English sessions [] (recapRows.ts:121-123), and the maths tile is empty unless a tonight history line or a hint exists (recapRows.ts:93), so a learner who left the desk after a set marked tonight with no hint, a snapped page, an Essay reading or an English talk gets no block. Executed in a scratch script outside the repo (/tmp/rc13/recaps.cjs, two profiles, Ada seated with a set tonight): Ben away with 2 hints -> [ada, ben]; Ben away with a set marked tonight (markedAt 18:00) and no hint -> [ada] only; Ben away with a logged problem and no hint -> [ada] only. The commit's own case (tools/tv-recap-test.cjs:96-110) gives every away learner hints, so the suite (60/0) does not see it. The acceptance ("every learner with work tonight, one block each") holds only for an away learner whose evening shows as a hint; what is missing is the away learner's tonight history lines (and talks) reaching the session or the phone. The TV recap (desk/src/tv/screens.tsx:331) and the Week (phone/page.tsx:886) stay seated-only; the acceptance names the phone Recap only. Cites re-mapped through git diff -U0 ee7d6ac7 c2dacc69 per file; recapRows.ts:78 -> 78, phone/page.tsx:866 -> 868 (the block itself is 25b8fdf4's replaced hunk, re-read by hand). None of the 9 commits since ee7d6ac7 changes what this row cites except as named. | 25b8fdf4 (narrows) |

## New findings

None.

## Notes

- Evidence check at c2dacc69: every cited line was re-mapped through `git diff -U0 ee7d6ac7 c2dacc69` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
- Executed: /tmp/rc13/recaps.cjs (outside the repo) loads desk/src/tv/recapRows.ts through tools/ts-load.cjs and calls learnerRecaps on five sessions; the three away-learner cases are quoted in the row's evidence. Nothing under desk/ was changed.
