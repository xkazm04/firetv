# barbora-43 × EM4 ·  (recert-7)

- Character: barbora-43
- Journey: EM4
- Cert level: L1 re-walk, code only, no model
- Head 5096c0ce
- Recertifies: 2026-10-09-essay-l1/recert-6 at 46db00cc
- **Verdict now: L1-conditional.** 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM4-1 A paragraph-only evening's delete is out of reach when the TV is on a sentence… (major) | recurs → L1-barbora-43-EM4-1 | cited lines re-found at 5096c0ce; phone/page.tsx changed since 46db00cc (01327bbe, 9a4b8d43) and the cite moved with it (same line content); no commit since 46db00cc touched phone/EssayShelf.tsx, session/store.ts | none |
| L1-barbora-43-EM4-2 A piece is 'one reading' on the recap but 'one piece' on the Sunday page (polish) | recurs → L1-barbora-43-EM4-2 | cited lines re-found at 5096c0ce; no commit since 46db00cc touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 5096c0ce: every cited line was re-mapped through `git diff -U0 46db00cc 5096c0ce` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo and pinned by the repo's own narrowed suites. Model-dependent behaviour stays with L2.
