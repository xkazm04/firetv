# daniel-15 × EM2 ·  (recert-6)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 46db00cc
- Recertifies: 2026-10-09-essay-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM2-1 Dictate on the Essay tab and the rewrite panel listens in Czech for a cz lear… (minor) | recurs → L1-daniel-15-EM2-1 | cited lines re-found at 46db00cc; phone/page.tsx changed since c4893c88 (c72a35ee, b9647a00) and the cite moved with it (same line content) | none |
| L1-daniel-15-EM2-2 A rewrite of a sentence first ruled neutral as a later unsupported claim is r… (minor) | recurs → L1-daniel-15-EM2-2 | cited lines re-found at 46db00cc; desk/essay.ts changed since c4893c88 (c416b952, f48ff556, e3f70d8b) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at 46db00cc: every cited line was re-mapped through `git diff -U0 c4893c88 46db00cc` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
