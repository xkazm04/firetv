# owen-17 × MB4 · Turn a mock paper into a plan (recert-3)

- Character: owen-17
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 row open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-owen-17-MB4-1 31 typed paper rows live only in React state: a phone reload or tab discard los… (minor) | recurs → L1-owen-17-MB4-1 | desk/src/app/phone/page.tsx:68 — useState<DraftRow[]>(() => [blankRow()]) / desk/src/app/phone/page.tsx:192 — localStorage only removes desk.pin / desk/src/app/phone/page.tsx:543 — PaperPanel gets that state / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
