# eliska-12 × EM2 ·  (recert-7)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 5096c0ce
- Recertifies: 2026-10-09-essay-l1/recert-6 at 46db00cc
- **Verdict now: L1-conditional.** 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim… (minor) | recurs → L1-eliska-12-EM2-1 | cited lines re-found at 5096c0ce; desk/essay.ts changed since 46db00cc (6009739d) and the cite moved with it (same line content) | none |
| L1-eliska-12-EM2-2 After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not … (minor) | recurs → L1-eliska-12-EM2-2 | cited lines re-found at 5096c0ce; tv/keys.ts changed since 46db00cc (95abd6a9, 6009739d, eabdd019) and the cite moved with it (same line content) | none |
| L1-eliska-12-EM2-3 Refusal 'In the paragraph that would not stay one sentence.' is opaque; a dict… (minor) | recurs → L1-eliska-12-EM2-3 | cited lines re-found at 5096c0ce; phone/page.tsx changed since 46db00cc (01327bbe, 9a4b8d43) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at 5096c0ce: every cited line was re-mapped through `git diff -U0 46db00cc 5096c0ce` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo and pinned by the repo's own narrowed suites. Model-dependent behaviour stays with L2.
