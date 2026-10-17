# owen-17 × MB4 · Where did the marks go? (recert-1)

- Character: owen-17 (17, FE college, Foundation resit; mock 31/80)
- Journey: MB4 Where did the marks go?
- Cert level: L1 re-walk, code only, no model
- Head d4f5042a
- Recertifies 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional.** The blockers are gone: every off-desk statement is named, the rows add up and say 'shared', and Select leads to practice. A broad statement still fans one question out into sibling-unit rows (major), and a typed paper still does not survive a reload (minor).

## Reachable surface (now)

- Phone Paper tab: rows with a 'Find by words' picker (`desk/src/app/phone/PaperPanel.tsx:28`), state in `desk/src/app/phone/page.tsx:68`.
- Recovery: `desk/src/lib/rules/recovery.ts:207-248` (shares `:218-222`, off-desk order `:246`).
- TV `paper`: topic rows with 'N marks lost, shared' (`desk/src/tv/paperRows.ts:93`, `desk/src/maths/MathsTV.tsx:742-758`), then the off-desk statements walked by name (`MathsTV.tsx:726-741`), the score card count (`paperRows.ts:60-66`).
- Keys: Select on a row opens Get ready for school on that unit with the question open and the paper's aim; Back lands on the unit (`desk/src/tv/keys.ts:534-546`).
- No screen string names GCSE, 1MA1, a board or a grade (grep over `maths/`, `tv/`, `app/phone/`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| MB4-1 one broad statement spreads a loss over 3 topics (blocker) | **recurs** (major now) | `recovery.ts:175-177` every touched unit is a destination; `:218-222` whole-mark shares; `desk/src/lib/library/gcse.ts:42` N2 -> fractions x2 + decimals. Repro: two N2 questions (3+3 lost) -> 'Add, subtract and multiply decimals · 2 marks lost, shared'; one A17 question -> three equation rows. Sums now add up and are labelled, so trust erosion drops to low (rank 9) | — |
| MB4-2 10 of 13 off-desk statements only 'and 10 more' | fixed | `keys.ts:534-537`, `paperRows.ts:45`, `MathsTV.tsx:726-741` | 1faea42d every off-desk statement walked by name after the topics |
| MB4-3 no step from a row to practice | fixed | `keys.ts:538-546` | b3581eb2 Select on a recovery row opens its unit in Get ready for school |
| MB4-4 beyond-Foundation not demoted on a tie | fixed | `recovery.ts:246`; 'a harder statement' `MathsTV.tsx:735` | 1faea42d |
| MB4-5 97-checkbox picker, no search | fixed | `PaperPanel.tsx:28,31` | d2276d38 areas fold and a box finds a statement by its words |
| MB4-6 typed rows lost on reload | **recurs** | `page.tsx:68` useState only; `page.tsx:192` storage only clears the PIN | — |
| MB4-7 'Year 5'-'Year 9' on Get ready for school | fixed | `MathsTV.tsx:650,689`, `desk/src/tv/prepareRows.ts:97` (the Topics ruler still prints years: new row under MB2) | 29cdfd86 a learner past the end of the school path ... the desk says the path ends |

## New findings

- None in this pair.
- 2026-10-14 L1-owen-17-MB4-10 (a row's number is a share and the TV never says so) is **fixed**: `lostLabel` prints '..., shared' on every row and off-desk statement that holds a split question (`paperRows.ts:31-35,93`; `MathsTV.tsx:734,750`). Commit 95538224 (UD-8, TV labels a shared lost mark).

## Notes

- Executed `recovery()` and `paperView` on reconstructed mocks (scratch `mock.cjs`, `mock2.cjs`). The original mock script is gone, so the 14-row count was not re-run. The fan-out was reproduced directly.
- A set opened from a fraction row with N2 carries no aim line: paperSteer has no forms for the fraction units, and the route sets an aim only when the draw took it (`desk/src/app/api/practice/route.ts:45,56`). The card does not overclaim.
