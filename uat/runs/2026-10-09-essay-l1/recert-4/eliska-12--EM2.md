# eliska-12 × EM2 ·  (recert-4)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-essay-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim s… (minor) | recurs → L1-eliska-12-EM2-1 | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files | none |
| L1-eliska-12-EM2-2 After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not to… (minor) | recurs → L1-eliska-12-EM2-2 | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files | none |
| L1-eliska-12-EM2-3 Refusal 'In the paragraph that would not stay one sentence.' is opaque; a dictat… (minor) | recurs → L1-eliska-12-EM2-3 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) and the cite moved with it (same line content); page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
