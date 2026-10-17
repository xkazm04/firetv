# matyas-19 × MB1 · Tonight's sheet, together (recert-3)

- Character: matyas-19
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-matyas-19-MB1-1 His own weekly MA1 sheet can be hinted but never marked; only the desk's own si… (minor) | recurs → L1-matyas-19-MB1-1 | desk/src/app/phone/page.tsx:387 — sendWorking posts image,w,h only / desk/src/app/api/mark/route.ts:62 — no practice: "Start a practice set first." / desk/src/tv/keys.ts:391 — page Select = hint, no mark action / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-matyas-19-MB1-2 A sequence limit written lim_(n->inf) is not read; lim_(n->infinity) and lim_(n… (polish) | recurs → L1-matyas-19-MB1-2 | desk/src/lib/rules/calc2.ts:596-597 — AS_N_GOES and TO_INFINITY accept only "infinity" / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
