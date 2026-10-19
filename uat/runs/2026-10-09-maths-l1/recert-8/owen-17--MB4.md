# owen-17 × MB4 · (recert-8)

- Character: owen-17
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-maths-l1/recert-7 at ffa91a49
- **Verdict now: L1-pass (no row open).** 1 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-owen-17-MB4-1 31 typed paper rows live only in React state: a phone reload or tab discard los… (minor) | fixed | d5857318 (ancestor of HEAD) keeps the typed Paper rows in the phone's localStorage per seated learner: keepDraft writes them on every edit (desk/src/app/phone/page.tsx:477-485, through editPaperRows which PaperPanel now gets as setRows, :673) and an effect restores the seated learner's own draft on load (:487-492); the key, serialise and parse are pure in desk/src/lib/rules/paperDraft.ts (draftKey, serialiseDraft returns null for all-blank rows, parseDraft returns null for anything but a version-1 draft); every storage call is in try/catch. d164089b (ancestor) takes keepDraft out of the learner-switch reset so the outgoing learner's draft is not overwritten with a blank row. tools/paper-draft-test.cjs 4/0. The acceptance (the draft paper persists on the phone until sent) is met. Observation, not filed: the draft is not cleared by Send (PaperPanel.tsx:70 posts paper.enter and leaves the rows), so after a send a reload restores the sent rows until they are edited or removed; before the fix the rows also stayed in state after Send. | d5857318 |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
