# owen-17 × MB4 · Mapping a paper (recert-4)

- Character: owen-17
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-maths-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 row open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-owen-17-MB4-1 31 typed paper rows live only in React state: a phone reload or tab discard lose… (minor) | recurs → L1-owen-17-MB4-1 | cited lines re-found at 67581c54; the cite at old :543 sits in a changed hunk and was re-read by hand: 258cc1bf added the system prop to the PaperPanel line, and the rows are still React state (paperRows, :71) | none |

## New findings

None.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
