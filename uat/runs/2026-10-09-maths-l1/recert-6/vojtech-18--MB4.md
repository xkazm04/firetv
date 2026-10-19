# vojtech-18 × MB4 · (recert-6)

- Character: vojtech-18
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-maths-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 1 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-vojtech-18-MB4-1 The TV never shows which statement led a question to a topic (topics[].codes un… (minor) | recurs → L1-vojtech-18-MB4-1 | 5e79b0f7 wired codes through: PaperTopic.codes (desk/src/tv/paperRows.ts:11, built :42) and the topic row prints 'From {t.from} · led by {codes}' (desk/src/maths/MathsTV.tsx:752; test maths-tv-test.cjs 'led by N12'). But it prints the bare statement codes (N12, A1, A22 ...), not the statement's can text. The phone picker (PaperPanel.tsx:37) and the off-desk rows (MathsTV.tsx:734) show statements in words and never a code, so a learner cannot read 'led by A22' as a statement; the acceptance 'names the statement's can text it came through' is not met (and no canOf, so no Czech words either). Still missing: The statement's words (STATEMENTS can / canOf(code, system)) instead of, or beside, the bare code; the code alone means nothing on the TV. | 5e79b0f7 (narrows) |
| L1-vojtech-18-MB4-2 Back from an off-desk row of the recovery list lands on Equivalent fractions (minor) | fixed | 95abd6a9 changed the paper handler: Back/Menu compute last = t ?? topics[topics.length-1] and at = prepareStops(s).findIndex(u => u.id === last.id), then o.nav('prepare', Math.max(0, at)) (desk/src/tv/keys.ts:558-563). On an off-desk row t is undefined (keys.ts:550-551), so Back lands on the list's last topic row's unit, not focus 0; on a topic row it lands on that row's unit. Only an empty topics list (all rows off-desk) still falls to 0. tv-keys-test 58 pass, maths-tv-test 77 pass (test updated in the commit). | 95abd6a9 |
| L1-vojtech-18-MB4-3 The only inequality statement is the linear A22; a quadratic or logarithmic ine… (minor) | recurs → L1-vojtech-18-MB4-3 | Cited lines re-found at 6b189791: desk/src/lib/library/gcse.ts:78 A22 'Solve linear inequalities and show the solution on a number line' is still the only inequality statement; gcse-cz.ts:57 A22 Czech likewise. No statement for a quadratic inequality, a logarithm or a domain; no commit touched the library. | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 c4893c88 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
