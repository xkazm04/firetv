# L1 recertify, round 4, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-17)

This was a code-only L1 re-walk of the 9 pairs of `uat/runs/2026-10-09-maths-l1` that still had an open row, on main 67581c54 (`67581c54f790c5e542ebe9b6f4089644b0fa5e9c`). There was no model call, no vision call and no browser, and nothing under `desk/` or `tools/` changed. The 23 rows open in `recert-3/findings.json` were answered `fixed` or `recurs` with current file:line evidence; the commits that claim a Math row were each proved by an executed scratch repro outside the repo, not read. The full tables are in `uat/runs/2026-10-09-maths-l1/recertify-4.md`, the per-pair walks in `recert-4/`, and the stamps in the run's `findings.json`, `recert-1/findings.json`, `recert-2/findings.json` and `recert-3/findings.json`, written by `recertify.cjs writeBack()`. "Fixed" means fixed at L1: the code landed. Nothing is resolved-verified, because Math L2 still waits on the vision host.

Seven commits landed since recert-3 (00f5db95): fdafb05f, 7c8a497c, a52b4347, 6e8b7728, 258cc1bf, 5da74e9a, 67581c54. Three of them close Math rows: 7c8a497c, 258cc1bf, 5da74e9a (the last narrows one). Ids below are recert-3's unless written `recert-4/…`.

## Counts

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before | 0 | 3 | 17 | 3 | **23** |
| Fixed (severity as raised) | 0 | 3 | 1 | 0 | **4** |
| Recur (severity now) | 0 | 0 | 16 | 3 | **19** |
| New | 0 | 0 | 2 | 0 | **2** |
| Open now | 0 | 0 | 18 | 3 | **21** |

- Each fixed row names its commit, 4 of 4, and every cited commit is an ancestor of 67581c54 (checked with `git merge-base --is-ancestor`).
- 1 row is **narrowed**, not fixed: L1-radka-41-MB5-1.
- No blocker is open; none was fixed this round.
- Pair verdicts are the same as at recert-3 (all conditional); no pair passes yet, every pair still holds an open row.
- 2 new rows, each opened by a walked fix or carried out of a closed row (below).

## Pair verdicts

| Pair | At recert-3 | Now |
| --- | --- | --- |
| matyas-19 MB1 | L1-conditional | L1-conditional |
| matyas-19 MB3 | L1-conditional | L1-conditional |
| nela-12 MB2 | L1-conditional | L1-conditional |
| nela-12 MB5 | L1-conditional | L1-conditional |
| owen-17 MB2 | L1-conditional | L1-conditional |
| owen-17 MB4 | L1-conditional | L1-conditional |
| radka-41 MB4 | L1-conditional | L1-conditional |
| radka-41 MB5 | L1-conditional | L1-conditional |
| vojtech-18 MB4 | L1-conditional | L1-conditional |

## Fixed, with commits

| Row (recert-3 id) | Was | Commit | What the code does now |
| --- | --- | --- | --- |
| L1-nela-12-MB5-1 | minor 6 | 5da74e9a | 5da74e9a makes the School system blurbs name the number convention (profileRows.ts:26-31: cz 'Progress is shown against Czech ročníky. 0,5 is a half (decimal comma).', uk and us 'decimal point', de 'decimal comma') and the Save cell name the system it will save (saveBlurb, :71-76, used at :87). Executed at 67581c54 (scratch r5.cjs): profileRows(null) Save -> 'Saves as United Kingdom (0.5 is a half); pick a school system above to change it.'; system uk -> 'Saves as United Kingdom (0.5 is a half).'; cz -> 'Saves as Czech Republic (0,5 is a half).'; de -> 'Saves as Germany (0,5 is a half).'. The default is still UK (DEFAULT_SYSTEM, :24) but no longer silent. Pinned by tools/tv-keys-test.cjs:543. |
| L1-radka-41-MB4-1 | major 9 | 258cc1bf | 258cc1bf gives the picker a Czech list: library/gcse-cz.ts (AREAS_CZ and CAN_CZ, 97 labels for the 97 STATEMENTS codes, none missing or extra), statementChoices(system) and canOf(code, system) (paperEntry.ts:51-62), choicesMatching(query, system) (:71-80), and the panel is handed the seated profile's system (phone/page.tsx:548 -> PaperPanel.tsx:22-37, :61). Executed at 67581c54 (scratch r4.cjs): statementChoices('cz') -> the six areas in Czech (Čísla a početní operace 16, Algebra 25, Poměr, úměrnost a procenta 16, Geometrie a měření 25, Pravděpodobnost 9, Statistika a práce s daty 6) with the codes unchanged; N1 reads 'Porovnávání a uspořádání celých čísel, desetinných čísel a zlomků; znaky =, ≠, <, >, ≤, ≥'; the find box for cz: 'nejmensi' and 'nejmenší' -> N4, 'nsn' -> N4, 'plocha pod grafem' -> A15, 'histogram' -> S3, and the English 'lcm' -> N4 and 'standard form' -> N9, A5 still find their statements; uk, de, us and no system keep the English list ('nejmensi' for uk finds nothing). Pinned by tools/phone-panel-test.cjs. What stays English for a cz parent is filed as a new row. |
| L1-radka-41-MB4-2 | major 8 | 7c8a497c | 7c8a497c adds CUT_FROM_YEAR = 12 (recovery.ts:192) and applies the below-year cut only from that school year (past(), recovery.ts:197: year >= CUT_FROM_YEAR && year - unit year > PAST_MARGIN). Executed recovery() at 67581c54 (scratch r1.cjs, outside the repo) on [N2 0/3, N1 1/3, A1 0/2] for no Reader, UK 13, UK 15, CZ 14, CZ 15 and CZ 16: Equivalent fractions 2, One-step equations 2, Adding and subtracting fractions 1, Multiplying and dividing fractions 1, Decimal arithmetic 1, notOnDesk empty; reachOf(['N1']) -> frac-equivalent and reachOf(['A1']) -> linear-one-step for each, so N1 and A1 are on the desk. UK 16 (Year 12), UK 17 and CZ 18 lose N1 and A1 to notOnDesk (N1 2, A1 2; Adding and subtracting 2, Multiplying and dividing 1): the intended sixth-form / maturita cut. Pinned by recovery-rules-test.cjs (UK 13 and 15, CZ 14 and 15, then the CZ 18 cut). Edge, not filed: the cut is a step at year 12, so a UK learner of 16 resitting GCSE loses N1 and A1 to 'not on the desk'. |
| L1-vojtech-18-MB4-1 | major 9 | 258cc1bf | Same fix as L1-radka-41-MB4-1 (258cc1bf): the picker, the 'Tests: …' summary and the find box are Czech for a cz profile, accent-free (executed at 67581c54, scratch r4.cjs: 'nejmensi' -> N4, 'plocha pod grafem' -> A15, 'histogram' -> S3; 97 of 97 codes labelled). Carried out of this row rather than lost, and filed as new rows: the TV still echoes the English statement text and the '· a harder statement' flag (MathsTV.tsx:735), and the only inequality statement is still the linear A22 (gcse.ts:78). |

## Narrowed

- **L1-radka-41-MB5-1** (5da74e9a), restated as `2026-10-09-maths-l1/recert-4/L1-radka-41-MB5-1` minor 6: Narrowed, not fixed (the row cannot be split, so it is kept whole and restated smaller). 5da74e9a closes the system half: Save now reads 'Saves as United Kingdom (0.5 is a half); pick a school system above to change it.' for a skipped row (executed, scratch r5.cjs). The 24-press half is untouched: profileRows(null) is still Type 3, Age 5, School system 4, Interested in 3, Maths course 3, Save/Back 2 cells in six rows (profileRows.ts:79-87), and the phone profile still has only the Name field (phone/page.tsx:543).

## Recurs

18 more rows recur: no commit changed the behaviour their cited lines describe (cites in files that did change were re-mapped hunk by hunk and compared with the old line). The ones that matter:

- **fix in flight:** the stale next-day phone Recap (`recert-4/L1-nela-12-MB5-2`, `recert-4/L1-radka-41-MB5-3`): stamped `recurs, fix in flight` from the code at 67581c54, as recert-3 stamped the phone sample paragraph; `recapRows.ts` and `store.ts` are untouched.
- **radka-41 MB4 and vojtech-18 MB4:** the two statement-picker rows are fixed; the TV never shows which statement led a question to a topic, and Back from an off-desk row lands on Equivalent fractions.
- **nela-12 and radka-41:** the 24-press child setup (narrowed), the recap covering one child, tier-2 fraction denominators, unsimplified sums ticked right, a 12-year-old in 6. ročník taken for 7. ročník.
- **matyas-19:** his own MA1 sheet is never marked; five smaller Calculus rows (`lim_(n->inf)`, by-parts working, irrational word-problem answers, the infinity bound in typesetting, two long blurbs) and `question().tex` read by no screen.
- **owen-17:** no worked lesson for the three equation units, the Topics ruler's "Year 5" to "Year 9", and 31 typed paper rows held only in React state.

## New

| Row | Severity | What |
| --- | --- | --- |
| 2026-10-09-maths-l1/recert-4/L1-radka-41-MB4-1 | minor 6 | A cz parent picks Czech statements, but the TV and the Prepare line echo the English statement text and the '· a harder statement' flag. 258cc1bf translates only the phone's picker. The paper's 'not on the desk' rows print o.can from STATEMENTS (recovery.ts:259 -> paperRows.ts:41 -> MathsTV.tsx:733) and the Prepare / aim line prints STATEMENTS .can (items.ts:101, mathsRows.ts:376), all in English, and the flag reads '· a harder statement' (MathsTV.tsx:735); the phone keeps English chrome ('Find by words', '(a harder statement)', PaperPanel.tsx:28, :37). |
| 2026-10-09-maths-l1/recert-4/L1-vojtech-18-MB4-3 | minor 6 | The only inequality statement is the linear A22; a quadratic or logarithmic inequality, or a domain, has no statement to pick. STATEMENTS holds one inequality statement, A22 'Solve linear inequalities …' (gcse.ts:78), and no statement for a quadratic inequality, a logarithm or a domain. Carried out of L1-vojtech-18-MB4-1 when that row closed (it named this gap in its got); not a defect opened by a fix. |

## Top 5 still open, ranked

No blocker is open. Ranked by harm to C1 (no answer given away), to marking, and to the paper list.

1. **The stale next-day phone Recap** (`recert-4/L1-nela-12-MB5-2` minor 4 and `recert-4/L1-radka-41-MB5-3` minor 6): **fix in flight**. Opened on a new day before any desk event, the phone's Recap still shows yesterday's hints as tonight's (`recapRows.ts:79`, `store.ts:665-670,680`, `phone/page.tsx:746-750`, all unchanged at 67581c54). *Fix direction:* the Recap keys its tally to the day it was written and says "Arrives when the session ends." until an event arrives; re-walk both rows when the parallel run lands.
2. **His own MA1 sheet is never marked** (`recert-4/L1-matyas-19-MB1-1`, minor 6, recurrence 5): no client sends a page id (`phone/page.tsx:392`, `api/mark/route.ts:62`). *Fix direction:* a snapped page whose items read as Calculus specs is marked by the same code judge as a desk set, items that do not read being "not sure"; waits on the vision host for L2.
3. **A cz parent picks Czech statements and reads English on the TV** (`recert-4/L1-radka-41-MB4-1`, minor 6, **new**): 258cc1bf translated the phone's picker only; the "not on the desk" rows, the aim line and the "· a harder statement" flag print the English text (`recovery.ts:259`, `MathsTV.tsx:733-735`, `mathsRows.ts:376`). *Fix direction:* print `canOf(code, system)` wherever a statement is shown to a seated learner, and translate the two flag strings.
4. **31 typed paper rows live only in React state** (`recert-4/L1-owen-17-MB4-1`, minor 6): a phone reload or tab discard loses a 15-minute entry (`phone/page.tsx:71`, `:196`, `:548`). *Fix direction:* keep the draft rows in sessionStorage (cleared on Send) or post them as a draft to the desk.
5. **Setting up a child takes about 24 remote presses** (`recert-4/L1-radka-41-MB5-1`, minor 6, narrowed: the silent UK default closed with 5da74e9a). *Fix direction:* make the picks on the phone, where the name is typed, or start the TV rows on the likely value and skip the course row when only one path fits.

Left the list since recert-3: the Czech statement picker (its number 1, fixed), the CZ-14 N1 residual (its number 2, fixed with the year-12 cut) and the silent UK default (its number 3, closed; the 24-press half stays as number 5).

## Method notes

- Rows were answered from the code at 67581c54 with executed repros in scratch directories outside the repo (`recovery`, `reachOf`, `statementChoices`, `choicesMatching`, `canOf`, `profileRows`). Model-dependent behaviour stays with L2.
- Every cite of recert-3's evidence was re-mapped through `git diff -U0 00f5db95 67581c54` per file (the first pass of this round read only the first number of a list such as `page.tsx:59,82,423`; the lists were then re-mapped, and the cites that only moved were compared with their old line: 77 of 77 identical). A cite inside a changed hunk was re-read by hand and re-written (the fixed, narrowed and touched rows).
- The walker was the builder session itself, one pass over all pairs, as at recert-3.
- Stamping: `writeBack` ran once through the ledger with the rerun's own rows skipped from the start (parent 11, recert-1 22, recert-2 23, recert-3 23 rows stamped); the generator ran once without stamping and once with, and the ledger was read before any stamp.
- OPEN.md was regenerated once with `node uat/driver/linga-text.cjs --status`. The Math section equals the 21 open rows of `recert-4/findings.json`, row for row. The Linga section's rows, ids, ranks and order are unchanged; its `product: N of 105 files changed since` figures move because desk/ files moved under a Linga row's product stamp.
- Ids are renumbered in recert-4 (positional within the folder, new rows last): for example `L1-nela-12-MB5-1` in recert-4 restates `L1-nela-12-MB5-2` in recert-3. Each restatement carries `recurs: 2026-10-09-maths-l1/recert-3/<id>`.
