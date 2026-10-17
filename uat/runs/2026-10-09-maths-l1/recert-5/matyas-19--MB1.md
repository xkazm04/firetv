# matyas-19 × MB1 ·  (recert-5)

- Character: matyas-19
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-maths-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB1-1 His own weekly MA1 sheet can be hinted but never marked; only the desk's own si… (minor) | recurs → L1-matyas-19-MB1-1 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) | none |
| L1-matyas-19-MB1-2 A sequence limit written lim_(n->inf) is not read; lim_(n->infinity) and lim_(n… (polish) | recurs → L1-matyas-19-MB1-2 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
