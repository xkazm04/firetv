# eliska-12 × EM2 ·  (recert-5)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-essay-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim … (minor) | recurs → L1-eliska-12-EM2-1 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-eliska-12-EM2-2 After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not t… (minor) | recurs → L1-eliska-12-EM2-2 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-eliska-12-EM2-3 Refusal 'In the paragraph that would not stay one sentence.' is opaque; a dicta… (minor) | recurs → L1-eliska-12-EM2-3 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
