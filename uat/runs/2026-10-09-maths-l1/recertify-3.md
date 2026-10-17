# Recertify, round 3 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-3`, **level L1 only (code re-walk on main 00f5db95, 2026-10-17)**; no model, no vision, no browser, desk/data untouched, nothing under desk/ or tools/ changed. Every row open in `recert-2/findings.json` (27 rows) was answered `fixed` or `recurs` with current file:line evidence at 00f5db95; the rows the new commits claim to close were executed in scratch repros outside the repo. Nothing here is `resolved-verified`: that needs live L2 evidence, and Math L2 still waits on the vision host.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json`, `recert-1/findings.json` and `recert-2/findings.json`): a fixed row carries `resolution: fixed`, `recertify_status: not-seen`, `recertify_run: 2026-10-09-maths-l1/recert-3` and `recertify_evidence` with the fixing commit; a recurring row stays open with `recurrence` + 1 and `recurred_as`. Its restatement, and every new row, is in `recert-3/findings.json` (`recurs: 2026-10-09-maths-l1/recert-2/<id>`). Rerun ids are positional, so they are written `2026-10-09-maths-l1/recert-3/<id>`.

Head of this round: **00f5db956f6c77cdfda09e5a5f477261bd543eda** (00f5db95). The previous round (recert-2) read 90e032f273eb27cbfbc0ce63394305ee4991a8df (90e032f2); the commits since are listed under *Method*. Every cited commit was checked with `git merge-base --is-ancestor <sha> 00f5db95`.

## Counts

| | Rows | By severity |
|---|---|---|
| Open before | 27 | 0 blocker, 5 major, 19 minor, 3 polish |
| Fixed (L1) | 4 | 0 blocker, 2 major, 2 minor, 0 polish (severity as raised) |
| Recurs | 23 | 0 blocker, 3 major, 17 minor, 3 polish (severity now; 1 of them narrowed) |
| New | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Open after | 23 | 0 blocker, 3 major, 17 minor, 3 polish |

Every fixed row names its commit (4 of 4); every cited commit is an ancestor of 00f5db95.

## Pair verdicts now

| Pair | At recert-2 | Now | Walk |
|---|---|---|---|
| matyas-19 MB1 | L1-conditional | L1-conditional | [matyas-19--MB1.md](recert-3/matyas-19--MB1.md) |
| matyas-19 MB3 | L1-conditional | L1-conditional | [matyas-19--MB3.md](recert-3/matyas-19--MB3.md) |
| nela-12 MB1 | L1-conditional | L1-pass | [nela-12--MB1.md](recert-3/nela-12--MB1.md) |
| nela-12 MB2 | L1-conditional | L1-conditional | [nela-12--MB2.md](recert-3/nela-12--MB2.md) |
| nela-12 MB5 | L1-conditional | L1-conditional | [nela-12--MB5.md](recert-3/nela-12--MB5.md) |
| owen-17 MB2 | L1-conditional | L1-conditional | [owen-17--MB2.md](recert-3/owen-17--MB2.md) |
| owen-17 MB4 | L1-conditional | L1-conditional | [owen-17--MB4.md](recert-3/owen-17--MB4.md) |
| radka-41 MB4 | L1-conditional | L1-conditional | [radka-41--MB4.md](recert-3/radka-41--MB4.md) |
| radka-41 MB5 | L1-conditional | L1-conditional | [radka-41--MB5.md](recert-3/radka-41--MB5.md) |
| vojtech-18 MB1 | L1-conditional | L1-pass | [vojtech-18--MB1.md](recert-3/vojtech-18--MB1.md) |
| vojtech-18 MB4 | L1-conditional | L1-conditional | [vojtech-18--MB4.md](recert-3/vojtech-18--MB4.md) |

Changed: nela-12 MB1 L1-conditional -> L1-pass; vojtech-18 MB1 L1-conditional -> L1-pass.

## Fixed (L1: the fix has landed in code; not resolved-verified)

| Finding | Sev. | Title | Evidence (current code) and commit |
|---|---|---|---|
| 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-1 | major | Implicit differentiation cannot be practised: "The chain rule and implicit differentiatio… | fd9f5ca5 adds a tenth shape, implicit-derivative (rules/calc.ts:46-50 ImplicitSpec, CALC_SHAPES), set by calc1-chain (calculus1.spine.ts:121, items.ts SHAPE_LINES). Executed at 00f5db95 (scratch r3.cjs): readQuestion("Find dy/dx if x^2 + y^2 = 25") -> kind calc, spec {shape implicit-derivative}; the same for "Find dy/dx at (3, 4) if ...", "Differentiate x*y + y^2 = 7 implicitly" and the Czech "Určete derivaci implicitně zadané funkce ... v bodě [3; 4]" (the point read). checkAnswer marks -x/y and x/(-y) right and x/y wrong with slip sign; at (3, 4) -3/4 is right, 3/4 is a sign slip, and a general -x/y is unsure ("should be a number"). leaksLine refuses "dy/dx = -x/y." and "The slope is -x/y" (true) and, at the point, "At that point the slope is -0.75" (true); "Try differentiating each term with respect to x, treating y as a function of x." passes (false); withheldCalc names the method only. Policy note: at a point the general formula "dy/dx = -x/y." is not refused, the same as derivative-at ("The derivative is 3x^2." passes for "at x = 2", executed). Whether the model sets a sound implicit item is L2. |
| 2026-10-09-maths-l1/recert-2/L1-nela-12-MB1-1 | minor | 'Zaokrouhli 3,456 na dvě/2 desetinná místa' is not read by the rounding fallback, so '3,4… | 8f5e4a5e widens the rounding fallback (rules/maths.ts:325-327) to "na <N/jedno/jeden/jedna/dve/tri/ctyri> desetinná místa". Executed leaksLine at cz (scratch r3.cjs): "Zaokrouhli 3,456 na dvě desetinná místa" with "3,46" and with "Je to 3,46." true; "na 2 desetinná místa" with "3,46" true; "na jedno desetinné místo" with "3,5" true; English "Round 3.456 to 2 decimal places" with "3.46" true; a method line ("Zaokrouhlení se řídí třetí číslicí.") false. Edge, not a new row: "na tři desetinná místa" with "3,456" is not flagged, because that is the number the question prints. |
| 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB1-1 | major | Every maturita task gets the 'factoring and linear-equations unit' stance, for 'a 15-year… | 00f5db95 makes voiceOf("maths", age) name the profile age (rules/voice.ts:75-83 ageWho: "an 18-year-old", "a 15-year-old") and gives a sequence, line or inequality task its method in the stance (desk/hint.ts:90-98 maturitaMethod, used at :110). Executed hint() with the text engine stubbed to capture the system prompt (scratch r3.cjs, system cz, age 18): "Určete 10. člen aritmetické posloupnosti ..." -> "You are a maths tutor for an 18-year-old. This is an arithmetic or geometric sequence task; use the nth-term formula."; "Find the line through (1,3) and (3,7)" -> "... for an 18-year-old. This is a line through two points; use the gradient and y = mx + c."; "Řešte nerovnici x^2 - 5x + 6 < 0" -> "... This is an inequality; find where the expression changes sign, then read off the solution set." With no age the stance keeps "a 15-year-old" but still names the method; "Simplify 3x + 2x" keeps the neutral school stance. A Calculus learner is still spoken to as the course's student (hint.ts:156), by design. |
| 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB1-2 | minor | The two-point-line backstop misreads points written without a space: "(1,3) and (3,7)" is… | 0a7b8086 reads bracketed points as written before the decimal-comma rewrite (rules/maturita.ts:100-103: points(raw) first, the rewrite only when two points are not found). Executed (scratch r3.cjs): lineOf("Find the line through (1,3) and (3,7)") -> {m 2, c 1}, and leaksLine is true for "The line is y = 2x + 1." and "y = 2x + 1", false for "Find the gradient first: change in y over change in x."; the spaced form gives the same; the decimal-comma form "A[1,5; 2] a B[3; 4]" still reads as the points (1.5, 2) and (3, 4) (m 1.333, c 0). |

## Narrowed (still open)

| Finding | Restated as | Sev. now (was) | What closed, what is left |
|---|---|---|---|
| 2026-10-09-maths-l1/recert-2/L1-radka-41-MB4-2 | 2026-10-09-maths-l1/recert-3/L1-radka-41-MB4-2 | major · rank 8 (major · rank 12) | Narrowed, not fixed. 7107748f (PAST_MARGIN 3, N2/N8 in WHOLE; recovery.ts:185-190, gcse.ts:146-148) fixes UK 12, CZ 12 and the N2 and A1 half of CZ 14. Executed recovery() on [N2 0/3, N1 1/3, A1 0/2] (scratch r1.cjs): no Reader, UK 8, UK 10, UK 12, CZ 12 -> Equivalent fractions 2, One-step equations 2, Adding and subtracting fractions 1, Multiplying and dividing fractions 1, Decimal arithmetic 1, nothing off the desk. CZ 14 (9. ročník) -> One-step equations 2, Adding and subtracting 1, Multiplying and dividing 1, Decimal arithmetic 1, and N1 "Order integers, decimals and fractions ..." (lost 2) in notOnDesk: the CZ-14 N1 gap of the decision record (section 5) is real and unfixed. paperView on a seated cz/14 profile: four topics, one off row, caption "Start with One-step equations. ...". CZ 16 and CZ 18 lose N1 and A1 (intended: the maturita cut). |

## Still open

| Finding | Restated as | Sev. now (was) | Title | What the code does now |
|---|---|---|---|---|
| 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB1-1 | 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB1-1 | minor · rank 6 (minor · rank 6) | His own weekly MA1 sheet can be hinted but never marked; only the desk's own si… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB1-2 | 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB1-2 | polish · rank 2 (polish · rank 2) | A sequence limit written lim_(n->inf) is not read; lim_(n->infinity) and lim_(n… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-2 | 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB3-1 | minor · rank 6 (minor · rank 6) | Calculus 2: by-parts working (and the other technique topics) is read as nothin… | cited lines re-found at 00f5db95; chain.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines |
| 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-3 | 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB3-2 | minor · rank 6 (minor · rank 6) | Word-problem parts with an irrational answer accept only the exact form or abou… | cited lines re-found at 00f5db95; calc.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines |
| 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-4 | 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB3-3 | polish · rank 2 (polish · rank 2) | Typesetting: an infinity as a bound is split ('^inf' becomes ^i + 'nf') or left… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-5 | 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB3-4 | minor · rank 3 (minor · rank 3) | Two Calculus 2 topic blurbs are over 25 words (approximate integration 30, sequ… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-6 | 2026-10-09-maths-l1/recert-3/L1-matyas-19-MB3-5 | polish · rank 1 (polish · rank 1) | question(spec).tex is computed for every Calculus spec and read by no screen | cited lines re-found at 00f5db95; calc.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines; items.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines |
| 2026-10-09-maths-l1/recert-2/L1-nela-12-MB2-1 | 2026-10-09-maths-l1/recert-3/L1-nela-12-MB2-1 | minor · rank 6 (minor · rank 6) | Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 13… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-nela-12-MB2-2 | 2026-10-09-maths-l1/recert-3/L1-nela-12-MB2-2 | minor · rank 6 (minor · rank 6) | Unsimplified sums are ticked right, while the worked lesson teaches "then simpl… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-nela-12-MB5-1 | 2026-10-09-maths-l1/recert-3/L1-nela-12-MB5-1 | minor · rank 6 (minor · rank 6) | The school system defaults silently to UK, and the row's blurb does not say it… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-nela-12-MB5-2 | 2026-10-09-maths-l1/recert-3/L1-nela-12-MB5-2 | minor · rank 3 (minor · rank 3) | A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-o… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-nela-12-MB5-3 | 2026-10-09-maths-l1/recert-3/L1-nela-12-MB5-3 | minor · rank 4 (minor · rank 4) | The phone's Recap tab, opened on a new day before any desk event, still shows y… | cited lines re-found at 00f5db95; store.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines |
| 2026-10-09-maths-l1/recert-2/L1-owen-17-MB2-1 | 2026-10-09-maths-l1/recert-3/L1-owen-17-MB2-1 | minor · rank 6 (minor · rank 6) | The three linear-equation units have no worked lesson: 'See how first' is offer… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-owen-17-MB2-2 | 2026-10-09-maths-l1/recert-3/L1-owen-17-MB2-2 | minor · rank 4 (minor · rank 4) | The Topics ruler still labels a 17-year-old's units 'Year 5' to 'Year 9' (the P… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-owen-17-MB4-1 | 2026-10-09-maths-l1/recert-3/L1-owen-17-MB4-1 | minor · rank 6 (minor · rank 6) | 31 typed paper rows live only in React state: a phone reload or tab discard los… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-radka-41-MB4-1 | 2026-10-09-maths-l1/recert-3/L1-radka-41-MB4-1 | major · rank 9 (major · rank 9) | 97 GCSE-worded statements, 41 with specialist or UK-curriculum terms, to map a… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-radka-41-MB5-1 | 2026-10-09-maths-l1/recert-3/L1-radka-41-MB5-1 | minor · rank 6 (minor · rank 6) | Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back'; the sy… | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |
| 2026-10-09-maths-l1/recert-2/L1-radka-41-MB5-2 | 2026-10-09-maths-l1/recert-3/L1-radka-41-MB5-2 | minor · rank 6 (minor · rank 6) | The recap and the week cover only the child seated now | cited lines re-found at 00f5db95; store.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines |
| 2026-10-09-maths-l1/recert-2/L1-radka-41-MB5-3 | 2026-10-09-maths-l1/recert-3/L1-radka-41-MB5-3 | minor · rank 6 (minor · rank 6) | The phone's Recap opened the next day before any TV event shows yesterday's hin… | cited lines re-found at 00f5db95; store.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines |
| 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB4-1 | 2026-10-09-maths-l1/recert-3/L1-vojtech-18-MB4-1 | major · rank 9 (major · rank 9) | The statement picker is about 100 English GCSE statements with 'beyond a Founda… | cited lines re-found at 00f5db95; gcse.ts changed since 90e032f2 (7107748f) but not at the cited lines |
| 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB4-2 | 2026-10-09-maths-l1/recert-3/L1-vojtech-18-MB4-2 | minor · rank 6 (minor · rank 6) | The TV never shows which statement led a question to a topic (topics[].codes un… | cited lines re-found at 00f5db95; recovery.ts changed since 90e032f2 (7107748f) but not at the cited lines |
| 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB4-3 | 2026-10-09-maths-l1/recert-3/L1-vojtech-18-MB4-3 | minor · rank 6 (minor · rank 6) | Back from an off-desk row of the recovery list lands on Equivalent fractions | cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files |

## Regressed

None. A regression would be a pair whose code verdict dropped, or a row that was fixed and came back; the rows fixed at earlier rounds were not re-walked (the brief), and the rules suites (`npm run test:rules`) still pass at 00f5db95.

## New findings for the next drain

None.

## Method

Commits since recert-2 (12; 8 touch desk/ or tools/):

- 00f5db95 fix(maths): a teen's hint names the learner's real age, and a maturita sequence, line or inequality names its method instead of the neutral stance (recert-2/L1-vojtech-1…
- 0a7b8086 fix(maturita): lineOf reads bracketed points as written before the decimal-comma rewrite, so '(1,3)' is a point and 'y = 2x + 1' is flagged (recert-2 L1-vojtech-18-MB1-2)
- 8f5e4a5e fix(maths): the leak backstop reads 'na <N> desetinná místa' as a rounding, so '3,46' for 'Zaokrouhli 3,456 na dvě desetinná místa' is flagged (recert-2 L1-nela-12-MB1-1)
- f3b8e4b1 fix(essay): every note passes one ghostwriting guard, so a strong or neutral note that hands over a sentence falls back instead of reaching the caption (essay recert-2 r…
- 20769444 docs(maths): correct the paper-aim-test line range in the below-year cut record
- d66be973 docs(maths): decision record for the below-year cut margin (PAST_MARGIN 3, N2/N8 WHOLE) and the open CZ-14 N1 gap (L1-radka-41-MB4-2)
- 7107748f fix(maths): the below-year cut applies only more than 3 school years past a unit, and N2/N8 reach the fraction units whole, so a school-age learner's fraction statements…
- b6f0acb7 fix(essay): a rewrite that is still opinion does not hold because a neighbour is labelled evidence; only context checkables with no link back nothing (L1-eliska-12-EM2-2)
- 2d3526b3 fix(essay): an Explain or Link after the paragraph's last evidence is PEEL's, not a fault, so the four-part form is clean (L1-eliska-12-EM1-1)
- fd9f5ca5 fix(maths): implicit differentiation can be set, read, hint-guarded and marked - an implicit-derivative shape on calc1-chain (L1-matyas-19-MB3-3)
- cea65eff docs(uat): Math and Essay L1 recert-2 insights: counts by severity, fixed with commits, routing watch item answered, top 5 open
- dd2a070d uat: L1 recertify round 2 of the Math and Essay L1 runs (recert-2) on 90e032f2, OPEN.md 442 -> 432

Rows were answered only from the code at 00f5db95; executed evidence is in the fixed rows and in each walk (scratch repros outside the repo, loaded with `tools/ts-load.cjs`; the hint engine was stubbed to read the stance, no model call). A cite is a line of recert-2's evidence re-mapped through `git diff -U0 90e032f2 00f5db95` per file; a cite inside a changed hunk was re-read by hand. The ledger needed the same second pass as recert-2: stamps were written with the rerun's own rows skipped (`finishLedger` does the same).

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
|---|---|---|
| Walker and instrument are the same kind as recert-2 (an L1 code walk; this round by the builder session itself); the product moved: desk/ changed in the commits listed under Method, which is why some rows are fixed. | all rows | 2026-10-09-maths-l1/recert-2 -> 2026-10-09-maths-l1/recert-3 |
