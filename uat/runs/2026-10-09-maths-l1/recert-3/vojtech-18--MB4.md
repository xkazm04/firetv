# vojtech-18 × MB4 · From a paper to the desk (recert-3)

- Character: vojtech-18
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-vojtech-18-MB4-1 The statement picker is about 100 English GCSE statements with 'beyond a Founda… (major) | recurs → L1-vojtech-18-MB4-1 | desk/src/app/phone/PaperPanel.tsx:21-36 — RowPicker: fold, Find by words, '(a harder statement)' / desk/src/lib/library/gcse.ts:78 — A22 'Solve linear inequalities ...' the only inequality statement / desk/src/lib/library/gcse.ts:128 — P6 'Enumerate sets with tables, grids, Venn diagrams and tree diagrams' / desk/src/maths/MathsTV.tsx:735 — '· a harder statement' on the TV / recert-3 @00f5db95: cited lines re-found at 00f5db95; gcse.ts changed since 90e032f2 (7107748f) but not at the cited lines | none |
| L1-vojtech-18-MB4-2 The TV never shows which statement led a question to a topic (topics[].codes un… (minor) | recurs → L1-vojtech-18-MB4-2 | desk/src/lib/rules/recovery.ts:63 — codes on RecoveryTopic (still present) / desk/src/tv/paperRows.ts:40 — PaperTopic built from id, name, lost, from, secure, shared; no codes / desk/src/tv/paperRows.ts:41 — off rows keep can, so only the off-desk rows name their statement / recert-3 @00f5db95: cited lines re-found at 00f5db95; recovery.ts changed since 90e032f2 (7107748f) but not at the cited lines | none |
| L1-vojtech-18-MB4-3 Back from an off-desk row of the recovery list lands on Equivalent fractions (minor) | recurs → L1-vojtech-18-MB4-3 | desk/src/tv/keys.ts:537-538 — t only for s.focus < topics.length; ix = -1 otherwise / desk/src/tv/keys.ts:545 — back/menu -> o.nav('prepare', Math.max(0, ix)) / desk/src/tv/keys.ts:534 comment — 'Back and Menu go to the first unit' / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
