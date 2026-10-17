# barbora-43 × EM1 ·  (recert-4)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-essay-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 1 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-1 The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own… (major) | recurs → L1-barbora-43-EM1-1 | cited lines re-found at 67581c54; the cite at old page.tsx:59 sat in the changed hunk of fdafb05f and was re-read by hand: the sample is now a placeholder, the x-ray text is unchanged | none |
| L1-barbora-43-EM1-2 ES-READ grounding 3/8: the reading never sees the assignment, her earlier readin… (major) | recurs → L1-barbora-43-EM1-2 | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files | none |
| L1-barbora-43-EM1-3 The Language lens falls back to the Paragraph structure move when the model's fi… (minor) | recurs → L1-barbora-43-EM1-3 | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files | none |
| L1-barbora-43-EM1-4 The phone's paragraph box is prefilled with a sample, and reading it files a rea… (minor) | **fixed** (not-seen) | fdafb05f: the box starts empty and the sample is only a placeholder (phone/page.tsx:61-62, :719, reset :428). "Analyse on the TV" is disabled while the box is empty (disabled={… // !essay.trim()}, :728) and the whole-piece read stops on an empty piece (pieceProblem('') -> 'There is nothing to read. Write or send a piece first.', executed at 67581c54, scratch r7.cjs), so the untouched sample can no longer be read and filed (desk/essay.ts:123,142 record()) as hers. | fdafb05f |

## New findings

None.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
