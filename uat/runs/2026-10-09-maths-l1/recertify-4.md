# Recertify, round 4 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-4`, **level L1 only (code re-walk on main 67581c54, 2026-10-17)**; no model, no vision, no browser, desk/data untouched, nothing under desk/ or tools/ changed. Every row open in `recert-3/findings.json` (23 rows) was answered `fixed` or `recurs` with current file:line evidence at 67581c54; the rows the seven new commits claim to close were executed in scratch repros outside the repo. Nothing here is `resolved-verified`: that needs live L2 evidence, and Math L2 still waits on the vision host.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json`, `recert-1/findings.json`, `recert-2/findings.json` and `recert-3/findings.json`): a fixed row carries `resolution: fixed`, `recertify_status: not-seen`, `recertify_run: 2026-10-09-maths-l1/recert-4` and `recertify_evidence` with the fixing commit; a recurring row stays open with `recurrence` + 1 and `recurred_as`. Its restatement, and every new row, is in `recert-4/findings.json` (`recurs: 2026-10-09-maths-l1/recert-3/<id>`). Rerun ids are positional, so they are written `2026-10-09-maths-l1/recert-4/<id>`.

Head of this round: **67581c54f790c5e542ebe9b6f4089644b0fa5e9c** (67581c54). The previous round (recert-3) read 00f5db956f6c77cdfda09e5a5f477261bd543eda (00f5db95); the commits since are listed under *Method*. Every cited commit was checked with `git merge-base --is-ancestor <sha> 67581c54`.

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 23 | 0 blocker, 3 major, 17 minor, 3 polish |
| Fixed (L1) | 4 | 0 blocker, 3 major, 1 minor, 0 polish (severity as raised) |
| Recurs | 19 | 0 blocker, 0 major, 16 minor, 3 polish (severity now; 1 of them narrowed) |
| New | 2 | 0 blocker, 0 major, 2 minor, 0 polish |
| Open after | 21 | 0 blocker, 0 major, 18 minor, 3 polish |

Every fixed row names its commit (4 of 4); every cited commit is an ancestor of 67581c54.

## Pair verdicts now

| Pair | At recert-3 | Now | Walk |
| --- | --- | --- | --- |
| matyas-19 MB1 | L1-conditional | L1-conditional | [matyas-19--MB1.md](recert-4/matyas-19--MB1.md) |
| matyas-19 MB3 | L1-conditional | L1-conditional | [matyas-19--MB3.md](recert-4/matyas-19--MB3.md) |
| nela-12 MB2 | L1-conditional | L1-conditional | [nela-12--MB2.md](recert-4/nela-12--MB2.md) |
| nela-12 MB5 | L1-conditional | L1-conditional | [nela-12--MB5.md](recert-4/nela-12--MB5.md) |
| owen-17 MB2 | L1-conditional | L1-conditional | [owen-17--MB2.md](recert-4/owen-17--MB2.md) |
| owen-17 MB4 | L1-conditional | L1-conditional | [owen-17--MB4.md](recert-4/owen-17--MB4.md) |
| radka-41 MB4 | L1-conditional | L1-conditional | [radka-41--MB4.md](recert-4/radka-41--MB4.md) |
| radka-41 MB5 | L1-conditional | L1-conditional | [radka-41--MB5.md](recert-4/radka-41--MB5.md) |
| vojtech-18 MB4 | L1-conditional | L1-conditional | [vojtech-18--MB4.md](recert-4/vojtech-18--MB4.md) |

No pair changed its verdict.

## Fixed (L1: the fix has landed in code; not resolved-verified)

| Finding | Sev. | Title | Evidence (current code) and commit |
|---|---|---|---|
| 2026-10-09-maths-l1/recert-3/L1-nela-12-MB5-1 | minor | The school system defaults silently to UK, and the row's blurb does not say it decides how… | 5da74e9a makes the School system blurbs name the number convention (profileRows.ts:26-31: cz 'Progress is shown against Czech ročníky. 0,5 is a half (decimal comma).', uk and us 'decimal point', de 'decimal comma') and the Save cell name the system it will save (saveBlurb, :71-76, used at :87). Executed at 67581c54 (scratch r5.cjs): profileRows(null) Save -> 'Saves as United Kingdom (0.5 is a half); pick a school system above to change it.'; system uk -> 'Saves as United Kingdom (0.5 is a half).'; cz -> 'Saves as Czech Republic (0,5 is a half).'; de -> 'Saves as Germany (0,5 is a half).'. The default is still UK (DEFAULT_SYSTEM, :24) but no longer silent. Pinned by tools/tv-keys-test.cjs:543. (5da74e9a) |
| 2026-10-09-maths-l1/recert-3/L1-radka-41-MB4-1 | major | 97 GCSE-worded statements, 41 with specialist or UK-curriculum terms, to map a CERMAT mock | 258cc1bf gives the picker a Czech list: library/gcse-cz.ts (AREAS_CZ and CAN_CZ, 97 labels for the 97 STATEMENTS codes, none missing or extra), statementChoices(system) and canOf(code, system) (paperEntry.ts:51-62), choicesMatching(query, system) (:71-80), and the panel is handed the seated profile's system (phone/page.tsx:548 -> PaperPanel.tsx:22-37, :61). Executed at 67581c54 (scratch r4.cjs): statementChoices('cz') -> the six areas in Czech (Čísla a početní operace 16, Algebra 25, Poměr, úměrnost a procenta 16, Geometrie a měření 25, Pravděpodobnost 9, Statistika a práce s daty 6) with the codes unchanged; N1 reads 'Porovnávání a uspořádání celých čísel, desetinných čísel a zlomků; znaky =, ≠, <, >, ≤, ≥'; the find box for cz: 'nejmensi' and 'nejmenší' -> N4, 'nsn' -> N4, 'plocha pod grafem' -> A15, 'histogram' -> S3, and the English 'lcm' -> N4 and 'standard form' -> N9, A5 still find their statements; uk, de, us and no system keep the English list ('nejmensi' for uk finds nothing). Pinned by tools/phone-panel-test.cjs. What stays English for a cz parent is filed as a new row. (258cc1bf) |
| 2026-10-09-maths-l1/recert-3/L1-radka-41-MB4-2 | major | Below-year routing still strands N1 ("Order integers, decimals and fractions") for a schoo… | 7c8a497c adds CUT_FROM_YEAR = 12 (recovery.ts:192) and applies the below-year cut only from that school year (past(), recovery.ts:197: year >= CUT_FROM_YEAR && year - unit year > PAST_MARGIN). Executed recovery() at 67581c54 (scratch r1.cjs, outside the repo) on [N2 0/3, N1 1/3, A1 0/2] for no Reader, UK 13, UK 15, CZ 14, CZ 15 and CZ 16: Equivalent fractions 2, One-step equations 2, Adding and subtracting fractions 1, Multiplying and dividing fractions 1, Decimal arithmetic 1, notOnDesk empty; reachOf(['N1']) -> frac-equivalent and reachOf(['A1']) -> linear-one-step for each, so N1 and A1 are on the desk. UK 16 (Year 12), UK 17 and CZ 18 lose N1 and A1 to notOnDesk (N1 2, A1 2; Adding and subtracting 2, Multiplying and dividing 1): the intended sixth-form / maturita cut. Pinned by recovery-rules-test.cjs (UK 13 and 15, CZ 14 and 15, then the CZ 18 cut). Edge, not filed: the cut is a step at year 12, so a UK learner of 16 resitting GCSE loses N1 and A1 to 'not on the desk'. (7c8a497c) |
| 2026-10-09-maths-l1/recert-3/L1-vojtech-18-MB4-1 | major | The statement picker is about 100 English GCSE statements with 'beyond a Foundation paper'… | Same fix as L1-radka-41-MB4-1 (258cc1bf): the picker, the 'Tests: …' summary and the find box are Czech for a cz profile, accent-free (executed at 67581c54, scratch r4.cjs: 'nejmensi' -> N4, 'plocha pod grafem' -> A15, 'histogram' -> S3; 97 of 97 codes labelled). Carried out of this row rather than lost, and filed as new rows: the TV still echoes the English statement text and the '· a harder statement' flag (MathsTV.tsx:735), and the only inequality statement is still the linear A22 (gcse.ts:78). (258cc1bf) |

## Narrowed (still open)

| Finding | Restated as | Sev. now (was) | What closed, what is left |
|---|---|---|---|
| 2026-10-09-maths-l1/recert-3/L1-radka-41-MB5-1 | 2026-10-09-maths-l1/recert-4/L1-radka-41-MB5-1 | minor · rank 6 (minor · rank 6) | Narrowed, not fixed (the row cannot be split, so it is kept whole and restated smaller). 5da74e9a closes the system half: Save now reads 'Saves as United Kingdom (0.5 is a half); pick a school system above to change it.' for a skipped row (executed, scratch r5.cjs). The 24-press half is untouched: profileRows(null) is still Type 3, Age 5, School system 4, Interested in 3, Maths course 3, Save/Back 2 cells in six rows (profileRows.ts:79-87), and the phone profile still has only the Name field (phone/page.tsx:543). |

## Still open

| Finding | Restated as | Sev. now (was) | Title | What the code does now |
|---|---|---|---|---|
| 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB1-1 | 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB1-1 | minor · rank 6 (minor · rank 6) | His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question… | cited lines re-found at 67581c54; page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) |
| 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB1-2 | 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB1-2 | polish · rank 2 (polish · rank 2) | A sequence limit written lim_(n->inf) is not read; lim_(n->infinity) and lim_(n->∞) are | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB3-1 | 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB3-1 | minor · rank 6 (minor · rank 6) | Calculus 2: by-parts working (and the other technique topics) is read as nothing; the pen… | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB3-2 | 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB3-2 | minor · rank 6 (minor · rank 6) | Word-problem parts with an irrational answer accept only the exact form or about 6 figures… | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB3-3 | 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB3-3 | polish · rank 2 (polish · rank 2) | Typesetting: an infinity as a bound is split ('^inf' becomes ^i + 'nf') or left outside th… | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB3-4 | 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB3-4 | minor · rank 3 (minor · rank 3) | Two Calculus 2 topic blurbs are over 25 words (approximate integration 30, sequences 33) | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB3-5 | 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB3-5 | polish · rank 1 (polish · rank 1) | question(spec).tex is computed for every Calculus spec and read by no screen | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-nela-12-MB2-1 | 2026-10-09-maths-l1/recert-4/L1-nela-12-MB2-1 | minor · rank 6 (minor · rank 6) | Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. roční… | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-nela-12-MB2-2 | 2026-10-09-maths-l1/recert-4/L1-nela-12-MB2-2 | minor · rank 6 (minor · rank 6) | Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-nela-12-MB5-2 | 2026-10-09-maths-l1/recert-4/L1-nela-12-MB5-1 | minor · rank 3 (minor · rank 3) | A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-off) | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-nela-12-MB5-3 | 2026-10-09-maths-l1/recert-4/L1-nela-12-MB5-2 | minor · rank 4 (minor · rank 4) | The phone's Recap tab, opened on a new day before any desk event, still shows yesterday's… | recurs, fix in flight. Read from the code at 67581c54: recapRows.ts:79 still reads hints and second from s.log with no day check, store.ts:665-670,680 still clears only inside reduce, and the phone's Recap guard (phone/page.tsx:746-747) is unchanged; no commit since 00f5db95 touched recapRows.ts or store.ts. A separate run is building the next-day Recap fix (recapRows.ts, phone/page.tsx); it is not on this HEAD, so the row stays open until it lands, then re-walk. |
| 2026-10-09-maths-l1/recert-3/L1-owen-17-MB2-1 | 2026-10-09-maths-l1/recert-4/L1-owen-17-MB2-1 | minor · rank 6 (minor · rank 6) | The three linear-equation units have no worked lesson: 'See how first' is offered on 14 of… | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-owen-17-MB2-2 | 2026-10-09-maths-l1/recert-4/L1-owen-17-MB2-2 | minor · rank 4 (minor · rank 4) | The Topics ruler still labels a 17-year-old's units 'Year 5' to 'Year 9' (the Prepare fix… | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |
| 2026-10-09-maths-l1/recert-3/L1-owen-17-MB4-1 | 2026-10-09-maths-l1/recert-4/L1-owen-17-MB4-1 | minor · rank 6 (minor · rank 6) | 31 typed paper rows live only in React state: a phone reload or tab discard loses them | cited lines re-found at 67581c54; the cite at old :543 sits in a changed hunk and was re-read by hand: 258cc1bf added the system prop to the PaperPanel line, and the rows are still React state (paperRows, :71) |
| 2026-10-09-maths-l1/recert-3/L1-radka-41-MB5-2 | 2026-10-09-maths-l1/recert-4/L1-radka-41-MB5-2 | minor · rank 6 (minor · rank 6) | The recap and the week cover only the child seated now | cited lines re-found at 67581c54; page.tsx changed since 00f5db95 (fdafb05f, 258cc1bf, 67581c54) and the cite moved with it (same line content) |
| 2026-10-09-maths-l1/recert-3/L1-radka-41-MB5-3 | 2026-10-09-maths-l1/recert-4/L1-radka-41-MB5-3 | minor · rank 6 (minor · rank 6) | The phone's Recap opened the next day before any TV event shows yesterday's hints as tonig… | recurs, fix in flight. Read from the code at 67581c54: recapRows.ts:79 still takes hints and second from s.log with no log.day check, store.ts:665-670,680,990 is unchanged (dayed only in reduce; getSession returns the stored session) and the phone's Recap is still shown when a tile is non-empty (phone/page.tsx:747-750). A separate run is building the next-day Recap fix (recapRows.ts, phone/page.tsx); it is not on this HEAD, so the row stays open until it lands, then re-walk. |
| 2026-10-09-maths-l1/recert-3/L1-vojtech-18-MB4-2 | 2026-10-09-maths-l1/recert-4/L1-vojtech-18-MB4-1 | minor · rank 6 (minor · rank 6) | The TV never shows which statement led a question to a topic (topics[].codes unwired) | cited lines re-found at 67581c54; recovery.ts changed since 00f5db95 (7c8a497c) but not at the cited lines |
| 2026-10-09-maths-l1/recert-3/L1-vojtech-18-MB4-3 | 2026-10-09-maths-l1/recert-4/L1-vojtech-18-MB4-2 | minor · rank 6 (minor · rank 6) | Back from an off-desk row of the recovery list lands on Equivalent fractions | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files |

## Regressed

None. A regression would be a pair whose code verdict dropped, or a row that was fixed and came back; the rows fixed at earlier rounds were not re-walked (the brief), and the rules suites (`npm run test:rules`) pass at 67581c54 (85 suites green, 2060 of 2060 tests).

## New findings for the next drain

| Finding | Severity | Title | Opened by |
|---|---|---|---|
| 2026-10-09-maths-l1/recert-4/L1-radka-41-MB4-1 | minor · rank 6 | A cz parent picks Czech statements, but the TV and the Prepare line echo the English statement text and the '·… | opened by 258cc1bf: it translated the picker only |
| 2026-10-09-maths-l1/recert-4/L1-vojtech-18-MB4-3 | minor · rank 6 | The only inequality statement is the linear A22; a quadratic or logarithmic inequality, or a domain, has no st… | carried out of L1-vojtech-18-MB4-1 when it closed |

## Method

Commits since recert-3 (8; 7 touch desk/ or tools/):

- 67581c54 fix(essay): an accepted rewrite is written back into the phone's paragraph, and a read never drops one silently (recert-3/L1-daniel-15-EM2-1)
- 5da74e9a fix(tv): the profile screen names the number convention per school system, and Save names the system it will save (recert-3/L1-nela-12-MB5-1, recert-3/L1-radka-41-MB5-1 s…
- 258cc1bf fix(maths): a cz learner's Paper panel picks statements in Czech, with the find box searching Czech and English accent-free (recert-3/L1-radka-41-MB4-1, recert-3/L1-vojte…
- 6e8b7728 fix(essay): the phone shelf always offers 'Forget tonight's paragraph' (DELETE /api/texts?paragraph=1), so a paragraph-only evening can be removed (recert-3/L1-barbora-43…
- a52b4347 fix(essay): cleanFix reads every learner sentence and refuses a sentence in a slot or a frame that states new content (recert-3/L1-daniel-15-EM2-2, recert-3/L1-eliska-12-…
- 7c8a497c fix(maths): the below-year cut applies only from school year 12, so N1 (UK 13, CZ 14) and A1 (15) stay on the desk for a GCSE or Year 9 learner (recert-3/L1-radka-41-MB4-…
- 0ece5e41 uat: L1 recertify round 3 of the Math and Essay L1 runs (recert-3) on 00f5db95, OPEN.md 432 -> 425
- fdafb05f fix(essay): the phone's Essay box starts and resets empty with the sample as a placeholder, so a paste no longer fuses into it (recert-2/L1-daniel-15-EM3-1, L1-barbora-43…

Rows were answered only from the code at 67581c54; executed evidence is in the fixed rows and in each walk (scratch repros outside the repo, loaded with `tools/ts-load.cjs`). A cite is a line of recert-3's evidence re-mapped through `git diff -U0 00f5db95 67581c54` per file; a cite inside a changed hunk was re-read by hand, and every cite that only moved was compared with its old line (77 of 77 identical). The ledger needed the same pass as recert-3: stamps were written once, through the ledger, with the rerun's own rows skipped from the start (`finishLedger` does the same).

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-3 (an L1 code walk; this round by the builder session itself); the product moved: desk/ changed in the commits listed under Method, which is why some rows are fixed. | all rows | 2026-10-09-maths-l1/recert-3 -> 2026-10-09-maths-l1/recert-4 |
