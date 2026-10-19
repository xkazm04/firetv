# owen-17 × MB4 · (recert-7)

- Character: owen-17
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-maths-l1/recert-6 at 6b189791
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-owen-17-MB4-1 31 typed paper rows live only in React state: a phone reload or tab discard loses them (minor) | recurs → L1-owen-17-MB4-1 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Judged on main's code only. desk/src/app/phone/page.tsx:71 is still useState<DraftRow[]>(() => [blankRow()]); nothing in page.tsx writes the rows to localStorage/sessionStorage (:200 localStorage only removes desk.pin); :562 hands rows/setRows to PaperPanel as plain React state. A reload or tab discard loses the typed rows. No commit since c4893c88 touched this (the page.tsx diffs are the Essay keep format/title only). None of the seven commits since 6b189791 (56f903ae, da6f9f07, 3240d025 and e9c5ee8f are the Math commits; b75bd45f, 61a8e2ee and ffa91a49 are Essay) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
