# radka-41 × MB4 · (recert-7)

- Character: radka-41
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-maths-l1/recert-6 at 6b189791
- **Verdict now: L1-pass (no row open).** 1 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB4-1 A cz parent picks Czech statements, but the TV and the Prepare line echo the English stat… (minor) | fixed | 56f903ae (ancestor of HEAD) routes every statement the row named through canOf(code, system): paperView's off rows take can: canOf(o.code, system) with o.can as the fallback (desk/src/tv/paperRows.ts:50) with the seated learner's system from systemOf; the flag is beyondFlag(sys) (paperRows.ts:20, ' · těžší tvrzení' for cz, MathsTV.tsx:737); aimLine(p, system) (desk/src/tv/mathsRows.ts:375-376, called MathsTV.tsx:800) and aimBlock(aim, system) (desk/src/lib/desk/items.ts:100, call sites :210-211) print canOf. tools/maths-tv-test.cjs 'paper 10' renders the cz PaperScreen and asserts Czech only (no English statement, 'těžší tvrzení', no 'a harder statement'), a uk learner unchanged; tools/paper-aim-test.cjs 'aim 16' pins aimBlock; maths-tv 78/0, paper-aim 17/0. The row's acceptance (canOf wherever a statement is printed for a seated learner: notOnDesk, the aim line, the TV flag) is met. Residue, outside the row's list: the phone picker's '(a harder statement)' tag stays English (desk/src/app/phone/PaperPanel.tsx:37; a one-line change, not phone/page.tsx). | 56f903ae |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
