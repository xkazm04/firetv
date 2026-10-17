# owen-17 × MB2 · Practise and get marked (recert-3)

- Character: owen-17
- Journey: MB2
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-owen-17-MB2-1 The three linear-equation units have no worked lesson: 'See how first' is offer… (minor) | recurs → L1-owen-17-MB2-1 | desk/src/lib/library/worked.ts:10-36 — 14 units, no linear-* / desk/src/tv/keys.ts:541 — hasWorked ? -1 : 0 / desk/src/tv/keys.ts:528 — prepare Select, the same / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-owen-17-MB2-2 The Topics ruler still labels a 17-year-old's units 'Year 5' to 'Year 9' (the P… (minor) | recurs → L1-owen-17-MB2-2 | desk/src/maths/MathsTV.tsx:337 — year label drawn with no past check / desk/src/maths/MathsTV.tsx:689 — Prepare checks !past / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
