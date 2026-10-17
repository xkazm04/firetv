# Recertify, round 2 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-2`, **level L1 only (code re-walk on main 90e032f2, 2026-10-17)**; no model, no vision, no browser, desk/data untouched, nothing under desk/ or tools/ changed. All 13 pairs of the run were re-walked on paper, one walker per Character, and every row open in `recert-1/findings.json` (32 rows) was answered `fixed` or `recurs` with current file:line evidence. Nothing here is `resolved-verified`: that needs live L2 evidence, and Math L2 still waits on the vision host.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1/findings.json`): a fixed row carries `resolution: fixed`, `recertify_status: not-seen`, `recertify_run: 2026-10-09-maths-l1/recert-2` and `recertify_evidence` with the fixing commit; a recurring row stays open with `recurrence` + 1 and `recurred_as`. Its restatement, and every new row, is in `recert-2/findings.json` (`recurs: 2026-10-09-maths-l1/recert-1/<id>`). Rerun ids are positional, so they are written `2026-10-09-maths-l1/recert-2/<id>`.

Head of this round: **90e032f273eb27cbfbc0ce63394305ee4991a8df** (90e032f2). The previous round (recert-1) read d4f5042a; the desk/ commits since are listed under *Method*. Every cited commit was checked with `git merge-base --is-ancestor <sha> 90e032f2`.

## Counts

| | Rows | By severity |
|---|---|---|
| Open before | 32 | 2 blocker, 9 major, 18 minor, 3 polish |
| Fixed (L1) | 8 | 2 blocker, 5 major, 1 minor, 0 polish (severity as raised) |
| Recurs | 24 | 0 blocker, 4 major, 17 minor, 3 polish (severity now; 0 blocker, 4 major, 17 minor, 3 polish before) |
| New | 3 | 0 blocker, 1 major, 2 minor, 0 polish |
| Open after | 27 | 0 blocker, 5 major, 19 minor, 3 polish |

Every fixed row names its commit (8 of 8); every cited commit is an ancestor of 90e032f2.

## Pair verdicts now

| Pair | At recert-1 | Now | Walk |
|---|---|---|---|
| matyas-19 MB1 | L1-conditional | L1-conditional | [matyas-19--MB1.md](recert-2/matyas-19--MB1.md) |
| matyas-19 MB3 | L1-conditional | L1-conditional | [matyas-19--MB3.md](recert-2/matyas-19--MB3.md) |
| nela-12 MB1 | L1-conditional | L1-conditional | [nela-12--MB1.md](recert-2/nela-12--MB1.md) |
| nela-12 MB2 | L1-conditional | L1-conditional | [nela-12--MB2.md](recert-2/nela-12--MB2.md) |
| nela-12 MB5 | L1-conditional | L1-conditional | [nela-12--MB5.md](recert-2/nela-12--MB5.md) |
| owen-17 MB2 | L1-conditional | L1-conditional | [owen-17--MB2.md](recert-2/owen-17--MB2.md) |
| owen-17 MB4 | L1-conditional | L1-conditional | [owen-17--MB4.md](recert-2/owen-17--MB4.md) |
| radka-41 MB1 | L1-conditional | L1-pass | [radka-41--MB1.md](recert-2/radka-41--MB1.md) |
| radka-41 MB4 | L1-conditional | L1-conditional | [radka-41--MB4.md](recert-2/radka-41--MB4.md) |
| radka-41 MB5 | L1-conditional | L1-conditional | [radka-41--MB5.md](recert-2/radka-41--MB5.md) |
| vojtech-18 MB1 | L1-fail | L1-conditional | [vojtech-18--MB1.md](recert-2/vojtech-18--MB1.md) |
| vojtech-18 MB2 | L1-conditional | L1-conditional | [vojtech-18--MB2.md](recert-2/vojtech-18--MB2.md) |
| vojtech-18 MB4 | L1-fail | L1-conditional | [vojtech-18--MB4.md](recert-2/vojtech-18--MB4.md) |

Changed: radka-41 MB1 L1-conditional -> L1-pass; vojtech-18 MB1 L1-fail -> L1-conditional; vojtech-18 MB4 L1-fail -> L1-conditional.

## Fixed (L1: the fix has landed in code; not resolved-verified)

| Finding | Sev. | Title | Evidence (current code) and commit |
|---|---|---|---|
| 2026-10-09-maths-l1/recert-1/L1-owen-17-MB2-1 | major | Photo marking (the default "Snap the sheet") rests on what vision reads; the linear photo… | desk/src/lib/desk/mark.ts:171 now asks for the linear value copied exactly as written (decimal comma or point, fraction, mixed number, not converted) and :168 adds notationLine(system), threaded from markSet/markPage (:195,:360); the solution gate in rules/kinds.ts:117-122 is untouched. Read the diff; handwriting read itself is L2's. Fixed by 90e032f2. |
| 2026-10-09-maths-l1/recert-1/L1-owen-17-MB4-1 | major | One broad statement spreads a loss over 3 topics: the list shows decimals rows he never l… | Executed recovery() on the recert-1 mock (N2 0/3, N2 1/4, A17 0/3): no Reader gave frac-add-sub, frac-mul-div, dec-arith at 2 each; with Reader {uk,17} (paperRows.ts:31-32, recovery.ts:181-196) N2 goes to not-on-the-desk and there is no decimals row. Residual: A17 whole-links all 3 equation units (3 rows of 1). Fixed by 4b82f0a3. |
| 2026-10-09-maths-l1/recert-1/L1-vojtech-18-MB1-1 | blocker | The code leak guard reads none of his tasks: Czech-printed items, maturita shapes, and 'S… | Executed leaksLine at cz (scratch p1.cjs/p2.cjs): the listed-sequence lines ('The 10th term is 39.', 'Desátý člen je 39.', 'a10 = 39', 'Je to třicet devět.'), bare log ('Je to 3.', 'Výsledek je tři.'), '10 choose 3 is 120.', 'Je to 120 způsobů.', 'Je to sto dvacet.', the simplify item ('Je to x + 3.'), 'x leží mezi dvěma a třemi.' and the line/equation shapes all refuse (true); method lines (rozdíl sousedních členů, '2 na kolikátou dá 8?', kombinační číslo) pass. sequenceTermOf now at desk/src/lib/rules/maturita.ts:72. Fixed by c88aef1f. |
| 2026-10-09-maths-l1/recert-1/L1-vojtech-18-MB2-1 | major | Photo marking of his handwritten sheet is unverified; the read prompt carries no system o… | readSheet now takes the SchoolSystem and passes it to schoolPrompt, calcPrompt and linearPrompt, each emitting notationLine(system) (desk/src/lib/desk/mark.ts:116,151,168; readSheet :204-208; markSet :195; markPage :360); the routes pass learnerSystem(s) / system (desk/src/app/api/mark/route.ts:82,114). linearPrompt now asks studentAnswer 'copied exactly as the student wrote it' with decimal comma or point. Whether the model reads a handwritten 'c = 34 mm' faithfully stays L2. Fixed by 90e032f2. |
| 2026-10-09-maths-l1/recert-1/L1-vojtech-18-MB4-1 | blocker | Partial statement links force maturita questions onto 5.–8. ročník units and lead the lis… | Executed paperView on a seated cz/18 high-school profile (scratch p4.cjs): [G17 0/4, G20 1/3, A2 3/3] gives topics [] and two off-desk rows (circles/volume 4, Pythagoras 2), caption 'None of these has a topic on the desk yet.'; [N1 0/3] gives topics [] and an off-desk row, no Equivalent fractions. The same paper for a UK 12-year-old still leads with Area (as designed). readerOf is passed by paperView (desk/src/tv/paperRows.ts:30-35) and the practice route (desk/src/app/api/practice/route.ts:45); destinations drops a partly-linked past-year unit unless WHOLE keeps it (desk/src/lib/rules/recovery.ts:171-188). Fixed by 37425037, 4b82f0a3. |
| 2026-10-09-maths-l1/recert-1/L1-nela-12-MB1-1 | major | The leak backstop still reads nothing on several common Czech phrasings: 'Odečti 1/6 od 3… | taskText.ts:16-21 INSTRUCTION now has vydel/uprav/dopln/zapis and :35-45 read 'Odečti X od Y', 'Vyděl X číslem Y', 'Rozděl N v poměru', 'Uprav'. Executed readQuestion(cz) on all seven phrasings: each reads into a school spec and every answer line ('You get 7/12.', '= 1 1/2', '3/4', '9', '0,75', 'So 24 and 36.') has leaksSchool=true. Fixed by d88fb34c. |
| 2026-10-09-maths-l1/recert-1/L1-radka-41-MB1-1 | major | Narrowed: on 'Odečti X od Y', 'Vyděl', 'Rozděl ... v poměru', 'Uprav', 'Zaokrouhli', 'Dop… | Executed leaksLine (cz) on Odečti 1/4 od 3/4, Vyděl 3/4 číslem 1/2, Vydělte 3/4 : 1/2, Rozděl 60 v poměru 2:3, Zaokrouhli 3,456 na desetiny, Uprav 3/4 + 1/6, Doplň: 3/4 = ?/12 with the result lines: all true. taskText.ts:18,35-44 now read the forms into school specs; maths.ts:325 covers Zaokrouhli. Fixed by d88fb34c. |
| 2026-10-09-maths-l1/recert-1/L1-vojtech-18-MB2-2 | minor | A Czech percent word states the probability and passes the leak check ('Je to dvacet proc… | Executed leaksSchool on the probability spec (3 blue of 15; scratch p1.cjs): 'Je to dvacet procent.', 'Je to dvacet procent z celku.', 'Je to jedna pětina.', 'Je to 20 %.' all true. leakText folds Czech cardinals then maps 'procent*' to 'percent' (desk/src/lib/rules/school.ts:2422-2423); taskText also reads the Czech instruction forms (desk/src/lib/rules/taskText.ts:49,67). Fixed by d88fb34c. |

## Still open

| Finding | Restated as | Sev. now (was) | Title | What the code does now |
|---|---|---|---|---|
| 2026-10-09-maths-l1/recert-1/L1-matyas-19-MB1-1 | 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB1-1 | minor · rank 6 (minor · rank 6) | His own weekly MA1 sheet can be hinted but never marked; only the desk's own si… | His own MA1 sheet is still never marked: no client sends a page id. |
| 2026-10-09-maths-l1/recert-1/L1-matyas-19-MB3-1 | 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-1 | major · rank 12 (major · rank 12) | Implicit differentiation cannot be practised: "The chain rule and implicit diff… | calc1-chain still promises implicit differentiation but sets only y=f(x) derivatives; readQuestion("Find dy/dx if x^2 + y^2 = 25") -> linear, and "dy/dx = -x/y." passes leaksLine (executed false). [fix in flight] |
| 2026-10-09-maths-l1/recert-1/L1-nela-12-MB2-1 | 2026-10-09-maths-l1/recert-2/L1-nela-12-MB2-1 | minor · rank 6 (minor · rank 6) | Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 13… | Tier-2 add/subtract still draws common bottoms (median 36, max 132) beyond a 6. ročník hand range; unsigned by a teacher. |
| 2026-10-09-maths-l1/recert-1/L1-nela-12-MB2-2 | 2026-10-09-maths-l1/recert-2/L1-nela-12-MB2-2 | minor · rank 6 (minor · rank 6) | Unsimplified sums are ticked right, while the worked lesson teaches "then simpl… | Unsimplified add/subtract answers are still ticked right while the lesson teaches 'then simplify'. |
| 2026-10-09-maths-l1/recert-1/L1-nela-12-MB5-1 | 2026-10-09-maths-l1/recert-2/L1-nela-12-MB5-1 | minor · rank 6 (minor · rank 6) | The school system defaults silently to UK, and the row's blurb does not say it … | A profile with no system row is read as uk, so '0,5' is unsure; the blurb does not say the system decides the decimal comma. |
| 2026-10-09-maths-l1/recert-1/L1-nela-12-MB5-2 | 2026-10-09-maths-l1/recert-2/L1-nela-12-MB5-2 | minor · rank 3 (minor · rank 3) | A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-o… | A 12-year-old in 6. ročník is still taken for 7. ročník; no school-year pick on the profile. |
| 2026-10-09-maths-l1/recert-1/L1-owen-17-MB4-2 | 2026-10-09-maths-l1/recert-2/L1-owen-17-MB4-1 | minor · rank 6 (minor · rank 6) | 31 typed paper rows live only in React state: a phone reload or tab discard los… | A typed mock of 25-31 rows lives only in component state until Send; a reload or tab discard loses it. |
| 2026-10-09-maths-l1/recert-1/L1-radka-41-MB4-1 | 2026-10-09-maths-l1/recert-2/L1-radka-41-MB4-1 | major · rank 9 (major · rank 9) | 97 GCSE-worded statements, 41 with specialist or UK-curriculum terms, to map a … | A cz parent mapping a CERMAT mock still picks from the one list of 97 GCSE-worded statements (HCF, LCM, standard form, loci), with a find-by-words box but no task-shaped wording for her system. |
| 2026-10-09-maths-l1/recert-1/L1-radka-41-MB5-1 | 2026-10-09-maths-l1/recert-2/L1-radka-41-MB5-1 | minor · rank 6 (minor · rank 6) | Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back'; the sy… | Setting up a child is still about 22-24 remote presses through the TV rows, and a skipped system row saves United Kingdom. |
| 2026-10-09-maths-l1/recert-1/L1-radka-41-MB5-2 | 2026-10-09-maths-l1/recert-2/L1-radka-41-MB5-2 | minor · rank 6 (minor · rank 6) | The recap and the week cover only the child seated now | With two children working tonight the TV recap and the phone Recap show only whoever is seated. |
| 2026-10-09-maths-l1/recert-1/L1-vojtech-18-MB1-2 | 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB1-1 | major · rank 9 (major · rank 9) | Every maturita task gets the 'factoring and linear-equations unit' stance, for … | Unchanged: a maturita task that reads as no unit (sequence, line, inequality) still opens 'a maths tutor for a 15-year-old. This is a school maths task; prefer the simplest method a school course would use over heavier ones.' No method named; level fixed at 15 for every age >= 14. A task the linear rule reads as an equation/exp… [No commit touched voice.ts or the stance since recert-1; severity kept (major).] |
| 2026-10-09-maths-l1/recert-1/L1-vojtech-18-MB4-2 | 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB4-1 | major · rank 9 (major · rank 9) | The statement picker is about 100 English GCSE statements with 'beyond a Founda… | Unchanged: the picker is still about 100 English GCSE statements in folding areas with a 'Find by words' box, higher-tier ones marked '(a harder statement)' on the phone and '· a harder statement' on the TV; no Czech or task-shaped wording; the only inequality statement is the linear A22, and logarithms/domain/quadratic inequal… [Not touched by any commit; by design; severity kept (major).] |
| 2026-10-09-maths-l1/recert-1/L1-vojtech-18-MB4-3 | 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB4-2 | minor · rank 6 (minor · rank 6) | The TV never shows which statement led a question to a topic (topics[].codes un… | Unchanged: a topic row shows its loss, 'shared' and the question labels, never the statement that led it there. RecoveryTopic still carries codes but paperView drops them, and no TV or phone file reads .codes. [Softened in effect: with 37425037 the cylinder question no longer lands on 'Area' for him, so the confusing case is rarer; the row still does not name its stat…] |
| 2026-10-09-maths-l1/recert-1/L1-matyas-19-MB1-2 | 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB1-2 | polish · rank 2 (polish · rank 2) | A sequence limit written lim_(n->inf) is not read; lim_(n->infinity) and lim_(n… | lim_(n->inf) still reads as linear; "The limit is 3/2." is not refused (executed: leaksLine false; with n->infinity it reads calc and is refused true). |
| 2026-10-09-maths-l1/recert-1/L1-matyas-19-MB3-2 | 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-2 | minor · rank 6 (minor · rank 6) | Calculus 2: by-parts working (and the other technique topics) is read as nothin… | By-parts working on Calculus 2 techniques is still not line-checked; no commit touched chain.ts or calculus2.spine.ts since recert-1. |
| 2026-10-09-maths-l1/recert-1/L1-matyas-19-MB3-3 | 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-3 | minor · rank 6 (minor · rank 6) | Word-problem parts with an irrational answer accept only the exact form or abou… | Derivative-at and extremum still use the 1e-6 rounded tolerance; only limit and definite-integral go to decimalCall; word-problem lines still say no "exact". |
| 2026-10-09-maths-l1/recert-1/L1-matyas-19-MB3-4 | 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-4 | polish · rank 2 (polish · rank 2) | Typesetting: an infinity as a bound is split ('^inf' becomes ^i + 'nf') or left… | Infinity bound still split in typesetting (executed: int_1^inf -> ^(i)nf; ∫_1^∞ -> ^()∞; x^inf -> ^(i)nf). |
| 2026-10-09-maths-l1/recert-1/L1-matyas-19-MB3-5 | 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-5 | minor · rank 3 (minor · rank 3) | Two Calculus 2 topic blurbs are over 25 words (approximate integration 30, sequ… | Both Calculus 2 blurbs unchanged at 30 and 33 words; file untouched since recert-1. |
| 2026-10-09-maths-l1/recert-1/L1-matyas-19-MB3-6 | 2026-10-09-maths-l1/recert-2/L1-matyas-19-MB3-6 | polish · rank 1 (polish · rank 1) | question(spec).tex is computed for every Calculus spec and read by no screen | question() still returns tex and items.ts stores plain only. |
| 2026-10-09-maths-l1/recert-1/L1-nela-12-MB5-3 | 2026-10-09-maths-l1/recert-2/L1-nela-12-MB5-3 | minor · rank 4 (minor · rank 4) | The phone's Recap tab, opened on a new day before any desk event, still shows y… | Phone Recap opened on a new day before any desk event still reads 'Worked through with N hints; nothing was marked.' from yesterday's log. |
| 2026-10-09-maths-l1/recert-1/L1-owen-17-MB2-2 | 2026-10-09-maths-l1/recert-2/L1-owen-17-MB2-1 | minor · rank 6 (minor · rank 6) | The three linear-equation units have no worked lesson: 'See how first' is offer… | Select on an equations recovery row opens on 'The usual' and goes straight to a model-written set; no worked lesson for linear-one-step, linear-two-step, linear-both-sides. |
| 2026-10-09-maths-l1/recert-1/L1-owen-17-MB2-3 | 2026-10-09-maths-l1/recert-2/L1-owen-17-MB2-2 | minor · rank 4 (minor · rank 4) | The Topics ruler still labels a 17-year-old's units 'Year 5' to 'Year 9' (the P… | Owen's Topics ruler still prints 'Year 5' to 'Year 9' under each unit; Prepare omits the year for a learner past the path's end. |
| 2026-10-09-maths-l1/recert-1/L1-radka-41-MB5-3 | 2026-10-09-maths-l1/recert-2/L1-radka-41-MB5-3 | minor · rank 6 (minor · rank 6) | The phone's Recap opened the next day before any TV event shows yesterday's hin… | Opened on day 2 before any TV event, the phone Recap still shows yesterday's hints as tonight's. |
| 2026-10-09-maths-l1/recert-1/L1-vojtech-18-MB4-4 | 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB4-3 | minor · rank 6 (minor · rank 6) | Back from an off-desk row of the recovery list lands on Equivalent fractions | Unchanged: on an off-desk row ix is -1 and Back/Menu call nav('prepare', Math.max(0, ix)), landing on Get ready for school at focus 0. Now sharper for him: for a cz/18 maturita paper most or all rows are off-desk (37425037), so Back from the list nearly always lands on focus 0. [Code unchanged; severity kept (minor).] |

## Regressed

None. A regression would be a pair whose code verdict dropped, or a row that was fixed and came back; the rows fixed at recert-1 were not re-walked (the brief), and no recurring row got worse.

## New findings for the next drain

| Finding | Sev. | Title | Origin |
|---|---|---|---|
| 2026-10-09-maths-l1/recert-2/L1-nela-12-MB1-1 | minor · rank 6 | 'Zaokrouhli 3,456 na dvě/2 desetinná místa' is not read by the rounding fallback, so '3,46' is not caught as … | recert-2 walk |
| 2026-10-09-maths-l1/recert-2/L1-radka-41-MB4-2 | major · rank 12 | Below-year routing sends the fraction and notation statements of a school-age learner's paper to 'not on the … | recert-2 walk |
| 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB1-2 | minor · rank 6 | The two-point-line backstop misreads points written without a space: "(1,3) and (3,7)" is taken for decimals,… | recert-2 walk |

## Method

desk/ commits since recert-1 (11):

- 90e032f2 fix(maths): photo marking prompts carry the learner's school system and notation; the linear answer is read as written (L1-vojtech-18-MB2-8, L1-owen-17-MB2-7)
- ae2544b5 fix(essay): the playbook's fallback patterns are one-sentence frames, so filling one is not refused by revise (L1-eliska-12-EM2-1)
- 4b82f0a3 fix(maths): pass the seated learner's Reader to recovery, reachOf and aimOf, so MB4-2 routing reaches the paper list and the practice aim (L1-vojtech-18-MB4-2)
- 6b003c59 fix(essay): a paragraph's closing sentence after its own evidence that explains or links back is PEEL's Explain, not a fault (L1-eliska-12-EM1-2)
- 2bf64f3e fix(essay): a thesis or conclusion is read against the body paragraphs' marked evidence, so it is no false fault and Start with lands in the body (L1-daniel-15-…
- 37425037 fix(maths): a statement that only partly links to a unit below the learner's year goes to not-on-the-desk, not to that unit (MB4-2)
- 390d9408 fix(texts): an untitled piece is 'Untitled <format> <n>', never a line of its text; the analyse keep passes the body's format (L1-helena-46-EM5-1)
- 0b8a4857 fix(twin): greeting, sign-off and signature lines are measured apart from body sentences, so an email's frame is neither ceremonial nor a headline (L1-helena-46…
- 3ad088b2 fix(twin): directness reads more hedging as more indirect, as the card's level words run blunt to indirect (L1-helena-46-EM5-2)
- d88fb34c fix(maths): the leak backstop reads Odečti X od Y, Vyděl, Rozděl v poměru, Uprav, Doplň, Zapiš jako, and Czech cardinals before procent
- c88aef1f fix(maths): the hint leak guard reads a listed sequence, a bare log, a count, a simplify item and Czech number words in every case

Rows were answered only from the code at HEAD; executed evidence is in each walk (scratch repros outside the repo).

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
|---|---|---|
| Walker and instrument are the same as recert-1 (L1 code walk by subagents); the product moved: desk/ changed in the commits listed under Method, which is why some rows are fixed. | all rows | 2026-10-09-maths-l1 -> 2026-10-09-maths-l1/recert-2 |
