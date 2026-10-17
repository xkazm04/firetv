# barbora-43 × EM1 ·  (recert-5)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-essay-l1/recert-4 at 67581c54
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-1 The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own… (major) | recurs → L1-barbora-43-EM1-1 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) but not at the cited lines | none |
| L1-barbora-43-EM1-2 ES-READ grounding 3/8: the reading never sees the assignment, her earlier readi… (major) | recurs → L1-barbora-43-EM1-2 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-barbora-43-EM1-3 The Language lens falls back to the Paragraph structure move when the model's f… (minor) | recurs → L1-barbora-43-EM1-3 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
