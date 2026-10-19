# radka-41 × MB4 · (recert-6)

- Character: radka-41
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-maths-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB4-1 A cz parent picks Czech statements, but the TV and the Prepare line echo the En… (minor) | recurs → L1-radka-41-MB4-1 | Cited lines re-found at 6b189791; behaviour unchanged: recovery.ts:259 notOnDesk carries st.can (English); paperRows.ts:43 off: can: o.can; MathsTV.tsx:734 prints {o.can}; :736 prints ' · a harder statement'; mathsRows.ts:376 and items.ts:101 take STATEMENTS .can (English); PaperPanel.tsx:37 flag '(a harder statement)' English. canOf(code, system) is not used on any of those paths. | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 c4893c88 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
