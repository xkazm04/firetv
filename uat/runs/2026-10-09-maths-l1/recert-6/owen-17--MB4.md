# owen-17 × MB4 · (recert-6)

- Character: owen-17
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-maths-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-owen-17-MB4-1 31 typed paper rows live only in React state: a phone reload or tab discard los… (minor) | recurs → L1-owen-17-MB4-1 | Judged on main's code only. desk/src/app/phone/page.tsx:71 is still useState<DraftRow[]>(() => [blankRow()]); nothing in page.tsx writes the rows to localStorage/sessionStorage (:200 localStorage only removes desk.pin); :562 hands rows/setRows to PaperPanel as plain React state. A reload or tab discard loses the typed rows. No commit since c4893c88 touched this (the page.tsx diffs are the Essay keep format/title only). | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 c4893c88 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
