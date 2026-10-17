# eliska-12 × EM2 ·  (recert-6)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 46db00cc
- Recertifies: 2026-10-09-essay-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier clai… (minor) | recurs → L1-eliska-12-EM2-1 | cited lines re-found at 46db00cc; desk/essay.ts changed since c4893c88 (c416b952, f48ff556, e3f70d8b) and the cite moved with it (same line content) | none |
| L1-eliska-12-EM2-2 After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not… (minor) | recurs → L1-eliska-12-EM2-2 | cited lines re-found at 46db00cc; tv/keys.ts changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-eliska-12-EM2-3 Refusal 'In the paragraph that would not stay one sentence.' is opaque; a dic… (minor) | recurs → L1-eliska-12-EM2-3 | cited lines re-found at 46db00cc; phone/page.tsx changed since c4893c88 (c72a35ee, b9647a00) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at 46db00cc: every cited line was re-mapped through `git diff -U0 c4893c88 46db00cc` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
