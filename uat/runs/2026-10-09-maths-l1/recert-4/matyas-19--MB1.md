# matyas-19 × MB1 · Weekly sheet (recert-4)

- Character: matyas-19
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-maths-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB1-1 His own weekly MA1 sheet can be hinted but never marked; only the desk's own six… (minor) | recurs → L1-matyas-19-MB1-1 | cited lines re-found at 67581c54; page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) | none |
| L1-matyas-19-MB1-2 A sequence limit written lim_(n->inf) is not read; lim_(n->infinity) and lim_(n-… (polish) | recurs → L1-matyas-19-MB1-2 | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
