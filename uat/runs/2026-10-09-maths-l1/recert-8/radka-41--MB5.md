# radka-41 × MB5 · (recert-8)

- Character: radka-41
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-maths-l1/recert-7 at ffa91a49
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB5-2 The recap and the week cover only the child seated now (minor) | recurs → L1-radka-41-MB5-2 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: the phone Recap (desk/src/app/phone/page.tsx:866-877) is one block titled for the seated learner (`${s.learner.name}, tonight`) with tiles from recapRows(s, now) (desk/src/tv/recapRows.ts:78), which wraps the seated session's log in tonightsLog; no other learner's evening is listed. f36296f2 touched recapLine's Essay wording only. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; phone/page.tsx:757 -> 866, recapRows.ts:77 -> 78. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
