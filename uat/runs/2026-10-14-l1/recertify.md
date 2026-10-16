# Recertify — L1 run 2026-10-14-l1 (Essay and Math)

Rerun: `2026-10-14-l1/recert-1`, **level L1 only (code re-walk on main 5899cf6c)**; no model, no browser. Findings are the Essay Family, Essay Adult, Math Family and Math Adult sub-runs. Nothing here is `resolved-verified`: that state needs live L2 evidence against the originating Character, and none exists for these rows.

**Scope rule.** Rechecked: every finding already `resolution: fixed` at the 2026-10-14 walk (the drain's Confirmed-and-fixed set, `docs/uat-insights/2026-10-14.md` section 1), plus any finding whose `backlog` row is marked `built` / `closed, built` in `docs/BACKLOG.md`. Rows marked open, `built in part` or `partly built` are Not rechecked. Essay Family and Math Adult findings carry no `backlog` field, so the drain's `fixed` set stands for the mapping. EM-B4 and EM-B6 are still `open` in BACKLOG although the walk found their code landed (4158321b, 803c6075); they are rechecked on the finding, and a later drain should stamp those rows.

**Essay Family L2 was not run.** `tools/essay-ui-test.cjs` was started as its header says (fresh data dir outside every repo seeded with pairing.json, `next dev --webpack -p 3377`, claude CLI, no API key). W1 and W2 passed; W3 failed: the first `POST /api/analyse` returned 428 (the one-time text notice, UD-7, EM-B9 notice half) because the harness predates it and never accepts the notice on the Essay path. The harness is under `tools/`, which this run may not edit, and no stamp can rest on a failed run. Essay Family is therefore an L1 re-walk like the rest, and no row is `resolved-verified`. The server was stopped (only the one this run started). The artifacts are in the gitignored `artifacts/essay-integration/`. A later run should make the harness accept the notice, then run W3 onward.

Re-walk note: Math Adult has no `backlog` field on any finding; Math Family findings with `backlog` are mapped as in the drain.

## Counts

| Module | Fixed | Still open | Regressed | Not rechecked |
|---|---|---|---|---|
| Essay Family | 17 | 2 | 0 | 64 |
| Essay Adult | 2 | 0 | 0 | 25 |
| Math Family | 41 | 2 | 0 | 28 |
| Math Adult | 22 | 0 | 0 | 35 |

## Essay Family (`essay-family`)

### Fixed (L1: the fix has landed in code; not resolved-verified)

| Finding | Title | Evidence (current code) |
|---|---|---|
| L1-barbora-43-EM1-5 | No language check before the wait: a Czech paragraph goes straight to the model | desk/src/app/api/analyse/route.ts:109,146 refuse with NOT_ENGLISH_LINE (rules/essay.ts:138,171 paragraphIsEnglish) before any model call; heuristic bypass tracked separately (EM1-11). |
| L1-barbora-43-EM4-1 | The phone's Recap goes back to 'Arrives when the session ends.' once the TV leaves the recap, on any evening w | desk/src/app/phone/page.tsx:726 shows 'Arrives when the session ends.' only when no tile has work and the session has not ended since local midnight. |
| L1-barbora-43-EM4-2 | A whole piece is recapped as 'not tonight' or '0 of 0 … all of it right', and the Sunday page calls it one par | desk/src/tv/recapRows.ts:56 parseDetail accepts the ', N paragraphs' suffix and desk/src/lib/rules/week.ts:253 counts a piece by paragraphs>1 for the Sunday line. |
| L1-barbora-43-EM4-3 | Rewrites that hold never reach the recap: 'k of n to fix' and 'to look at together' count the first reading on | desk/src/lib/desk/essay.ts:265,277 restateReading writes ', k fixed' to the history line and desk/src/tv/recapRows.ts:56,281 reads it as 'k fixed tonight'. |
| L1-barbora-43-EM4-6 | 'Nothing needed a second hint.' on the parent's recap of a writing evening | desk/src/app/phone/page.tsx:732 renders the hinted/slipped list only for a maths tile that is not empty. |
| L1-daniel-15-EM2-1 | In a piece, a rewrite is ruled against cross-paragraph context while the first reading was paragraph-only, so  | desk/src/lib/desk/essay.ts:176 rules a piece once over all paragraphs' observations and :260 rules the rewrite with contextObservations over next.sentences (same whole-piece scope). |
| L1-daniel-15-EM2-2 | A still-faulty rewrite's caption is the model's note, never the code's reason; it can praise what the code fai | desk/src/lib/rules/essay.ts:426 sets a faulty verdict's note to the failed check's own line, never the model's note. |
| L1-daniel-15-EM3-8 | A failed paragraph is drawn exactly like one still being read, the phone says 'on the TV', and only a whole re | desk/src/lib/rules/essay.ts:481 paragraphState gives not-read/not-english, desk/src/essay/EssayTV.tsx:266,413 draws and captions 'Not read', phone page.tsx:283,317 names it and offers 'Read the paragraphs that did not come back'. |
| L1-eliska-12-EM1-1 | A planted unsupported claim placed before the evidence is missed; under Structure the wrong sentence is marked | desk/src/lib/rules/essay.ts:360-366 linkOf/backsOf credit evidence to the claim it names so a planted claim is faulty at any position for model-correct labels (still model-link dependent, EM1-12 open). |
| L1-eliska-12-EM1-6 | cleanNote strips only 'Label:' / 'Label - ': praise-led notes survive on faulty sentences | desk/src/lib/rules/essay.ts:426 replaces the note on a faulty sentence with the code's check line, so praise-led model notes cannot appear under a faulty verdict. |
| L1-eliska-12-EM1-9 | No refusal for a language the desk does not read: a Czech paragraph goes to the model | desk/src/lib/rules/essay.ts:138,171 NOT_ENGLISH_LINE/paragraphIsEnglish and desk/src/app/api/analyse/route.ts:109,146 refuse before any run. |
| L1-kristyna-17-EM1-1 | No language check and no word that Essay Master reads English: a Czech paragraph is read with full confidence | desk/src/app/api/analyse/route.ts:109,146 refuse a non-English paragraph with 'Essay Master reads English writing...' before any call; no advance copy on the Essay tab (acceptance's second half) is evidenced. |
| L1-kristyna-17-EM1-2 | The splitter joins every sentence opening with Č Ď É Í Ň Ó Ř Š Ť Ú Ů Ý Ž or „: five Czech sentences read as 'S | desk/src/lib/rules/essay.ts:35 splits before (?=[p{Lu}"“„]) so diacritic-initial and quote-opening sentences no longer fuse. |
| L1-kristyna-17-EM1-3 | Code verdicts rest on English word lists: her Czech evidence, concessions and vague words are mis-ruled, with  | Czech text is refused before the English word lists (rules/essay.ts:13-15) can rule it, desk/src/app/api/analyse/route.ts:109,146; a Czech paragraph passing the heuristic still hits them (EM1-11). |
| L1-kristyna-17-EM1-4 | The plan refuses a sentence opening with Š, Č or Ž with a false reason: 'Start it with a capital and end it wi | desk/src/lib/rules/essay.ts:652 planFill accepts /^["“„]?p{Lu}/u so 'Šest...' and 'Žáci...' fill their slots. |
| L1-kristyna-17-EM3-1 | The whole piece's counts are code-built from the broken split: '2 of 6 sentences to fix across 6 paragraphs' f | desk/src/lib/rules/essay.ts:35 split fix plus :464,530 ruledSentences exclude failed/not-English paragraphs from the counts; a non-English piece is refused at route.ts:109. |
| L1-kristyna-17-EM3-2 | A paragraph that fails to come back is never said: it stays dimmed like one being read, its sentences show 'Ne | desk/src/lib/rules/essay.ts:481 paragraphState not-read, desk/src/essay/EssayTV.tsx:413 'Not read' caption, desk/src/app/phone/page.tsx:317 'Read the paragraphs that did not come back' re-reads only those into the same piece. |

### Still open

| Finding | Title | Evidence |
|---|---|---|
| L1-daniel-15-EM3-1 | Each paragraph of a piece is ruled on its own paragraph's observations: every intro thesis and conclusion link | Whole-piece decideVerdicts (desk/src/lib/desk/essay.ts:176) fixes Structure only when the model names the supports chain (rules/essay.ts:402-409), and the Evidence lens still marks intro/conclusion opinions faulty per paragraph (rules/essay.ts:399 !marks.length; open L1-daniel-15-EM3-15/-16). |
| L1-kristyna-17-EM1-6 | The language of the notes, moves and summary is left to the model: an English prompt over a Czech text, no ins | No prompt or code fixes the language of notes/moves/summary (only the refusal at desk/src/app/api/analyse/route.ts:146); a Czech paragraph passing paragraphIsEnglish still gets English notes beside Czech text. |

### Regressed

None.

### Not rechecked

| Count | Reason |
|---|---|
| 48 | no BACKLOG row built for it and it was still open at the 2026-10-14 walk |
| 16 | resolution is n-a: nothing to recheck |

## Essay Adult (`essay-adult`)

### Fixed (L1: the fix has landed in code; not resolved-verified)

| Finding | Title | Evidence (current code) |
|---|---|---|
| L1-helena-46-EM1-3 | A Language length-faulty sentence kept the model's own note (praise on a faulty sentence): FIXED, the note is  | desk/src/lib/rules/essay.ts:426 (note = verdict==="faulty" ? check : said) with the length rule at :423 and CHECKS.long/word at :309-310; later commits since 4af25199 did not alter this. |
| L1-helena-46-EM1-7 | A text in a language the desk does not read is refused before any run: FIXED for Czech only | desk/src/lib/rules/essay.ts:138,171-175 paragraphIsEnglish plus desk/src/app/api/analyse/route.ts:109 (piece) and :146 (paragraph) refuse with NOT_ENGLISH_LINE before any run; Czech only, German/Dutch still pass by design (the finding's own ceiling). |

### Still open

| Finding | Title | Evidence |
|---|---|---|
| (none) | | |

### Regressed

None.

### Not rechecked

| Count | Reason |
|---|---|
| 2 | mapped row EM-B11 is not marked built in docs/BACKLOG.md |
| 1 | mapped row EM-B8 is not marked built in docs/BACKLOG.md |
| 1 | mapped row EM-B5 is not marked built in docs/BACKLOG.md |
| 2 | mapped row EM-B39 is not marked built in docs/BACKLOG.md |
| 2 | resolution is n-a: nothing to recheck |
| 1 | mapped row EM-B27 is not marked built in docs/BACKLOG.md |
| 1 | mapped row EM-B23 is not marked built in docs/BACKLOG.md |
| 1 | mapped row EM-B25 is not marked built in docs/BACKLOG.md |
| 2 | mapped row EM-B9 is not marked built in docs/BACKLOG.md |
| 2 | mapped row EM-B33 is not marked built in docs/BACKLOG.md |
| 1 | mapped row EM-B30 is not marked built in docs/BACKLOG.md |
| 1 | mapped row EM-B31 is not marked built in docs/BACKLOG.md |
| 2 | mapped row EM-B29 is not marked built in docs/BACKLOG.md |
| 5 | no BACKLOG row built for it and it was still open at the 2026-10-14 walk |
| 1 | resolution is by-design: nothing to recheck |

## Math Family (`math-family`)

### Fixed (L1: the fix has landed in code; not resolved-verified)

| Finding | Title | Evidence (current code) |
|---|---|---|
| L1-nela-12-MB1-1 | Czech sheet notation is not read: the hint loses its code leak check, gets a linear-equations stance, and the  | desk/src/lib/rules/taskText.ts:15-48 strips cz verbs (Sečti, Zkrať, Převeď, Rozděl...), reads · and : and the decimal comma; the ceiling verbs are now covered |
| L1-nela-12-MB1-2 | The next evening, "I have homework" reopens the first sheet ever snapped and never asks for tonight's | desk/src/tv/mathsRows.ts:21 tonightsSheet keeps only a page with day == today; tv/keys.ts:339-341 else issues page.ask |
| L1-nela-12-MB1-3 | The withheld hint lines for her units are 31–54 words (C4) | tools/school-rules-test.cjs:491 pins every SCHOOL_WITHHELD line at 25 words or fewer (school.ts:4463), suite passes |
| L1-nela-12-MB1-4 | MB-READ 2/5: the page read knows neither her school system, her topic nor her age; item numbers must be intege | desk/src/lib/desk/read.ts:27-45 mathsContext carries notation, course, age/stage, lettered label; app/api/read/route.ts:37 passes who |
| L1-nela-12-MB1-5 | MB-HINT 4/8: the hint sees no method card, none of her working and none of her recorded slips | desk/src/lib/desk/hint.ts:122-135 groundFor adds notation, recorded slips and the unit method; app/api/hint/route.ts:39 calls it |
| L1-nela-12-MB2-1 | An unsure item's card says "I got something different for number N", even when her value is right or the box i | desk/src/lib/rules/kinds.ts:151-158 unsureLine gives the checker reason or BLANK; rules/maths.ts:110 NOT_SURE(n, why) |
| L1-nela-12-MB2-2 | Explaining is en-US speech only; there is no typed box while a speech recogniser exists | desk/src/app/phone/recogniserLang.ts:7 cs-CZ for cz; ExplainTalk.tsx:38 Type it button |
| L1-nela-12-MB2-3 | MB-EXPLAIN 3/8: the reply cannot see her written answer, her working or the slip the code found | desk/src/lib/desk/explain.ts:56-70,246 Seen carries answer, working, slip and line into the prompt |
| L1-nela-12-MB2-4 | Questions and worked examples print decimal points and £/€ for a cz learner, while the answers print commas | desk/src/lib/rules/school.ts:1433 question(spec, system) prints decimal comma and Kč/€/£ per system; lib/desk/items.ts:480,567 and worked.ts:29 pass system; school-rules MB-B4 tests pass |
| L1-nela-12-MB2-5 | The walk card's slip lines for her units run 26–32 words (C4) | tools/school-rules-test.cjs:487,491 pins every SCHOOL_SLIPS.says and SCHOOL_WITHHELD line at 25 words or fewer (91/91 pass) |
| L1-nela-12-MB5-1 | The recap says "Good evening's work - all of it right." on an evening where nothing was marked | desk/src/tv/recapRows.ts:233-236 all of it right only when a set was marked; hints-only and Linga-only evenings get own sentences |
| L1-nela-12-MB5-2 | The evening log never resets: hint counts, "Needed a second hint" and the memory's hint count carry every earl | desk/src/lib/session/store.ts:659-668 dayed() clears log and away logs on the first event of a later day, End session included (UD-13) |
| L1-nela-12-MB5-3 | The week page cannot see homework evenings ("Nothing this week." after three sheets) | desk/src/lib/rules/week.ts:230-233 and homeworkLine at :289 put homework sheets, hints, second hints and papers on the Sunday page |
| L1-owen-17-MB2-1 | False tick: a typed mixed number on a linear item is read as a product, so a wrong "1 3/4" for x = 3/4 is tick | desk/src/lib/desk/verify.ts:155-177 mixedNumber reads a b/c as a+b/c and two bare numbers as null before substitute |
| L1-owen-17-MB2-2 | False ring: a correct mixed-number root ("1 1/5" for x = 6/5, "-1 1/2" for -3/2) is ringed wrong on a linear i | desk/src/lib/desk/verify.ts:155-177 mixedNumber makes 1 1/5 = 6/5 so it is ticked |
| L1-owen-17-MB2-4 | Slip lines on the walk run 26-37 words: line length 0.54 against >= 0.9 | tools/school-rules-test.cjs:487,491 pins every SCHOOL_SLIPS.says and SCHOOL_WITHHELD line at 25 words or fewer (91/91 pass) |
| L1-owen-17-MB2-5 | UK-habit answers read "not sure": £ on a euro item, "cm squared", "sq cm", "pounds" | desk/src/lib/rules/school.ts:156 cm squared/sq cm/square cm read as cm2, :1345 money units are system-aware (£ in uk), school-rules MB-B4 tests pass |
| L1-owen-17-MB2-6 | The unsure line says "I got something different for number N" for a rounded right answer and for a blank | desk/src/lib/rules/kinds.ts:151-158 unsure school items carry their own reason or BLANK; ASK (maths.ts:107) is for a wrong linear item only |
| L1-owen-17-MB2-8 | Get ready for school (the road his paper sends him down) skips the worked lesson | desk/src/tv/keys.ts:513-529 prepare question opens on See how first for a unit with a lesson (choicesFor in tv/prepareRows.ts:57) |
| L1-owen-17-MB2-9 | An explain reply never sees his answer or the slip code found (MB-EXPLAIN 3/8) | desk/src/lib/desk/explain.ts:56-70,246 Seen reaches the prompt (answer, working, slip) |
| L1-owen-17-MB4-2 | 10 of 13 off-desk statements (20 marks, incl. quadratics and rearranging) appear only as "and 10 more", named  | desk/src/tv/keys.ts:534-545 walks the off-desk statements after the topics; paperRows.ts offCountLine; MathsTV.tsx:735 lists each by name |
| L1-owen-17-MB4-3 | No step from a recovery row to its practice: Select does nothing, Back lands on Equivalent fractions, the capt | desk/src/tv/keys.ts:534-545 Select on a recovery row opens Get ready for school on that unit with the question open |
| L1-owen-17-MB4-4 | A beyond-Foundation statement is not demoted inside the off card and takes one of its 3 visible slots | desk/src/lib/rules/recovery.ts:246-247 sorts Foundation before flagged on equal loss; MathsTV.tsx:735 flag reads a harder statement |
| L1-owen-17-MB4-5 | The statement picker: 97 checkboxes per row, no search, percentages under "Ratio, proportion and rates of chan | desk/src/app/phone/PaperPanel.tsx:28 Find by words search box narrows the statements |
| L1-owen-17-MB4-7 | Get ready for school labels a 17-year-old's topics "Year 5" to "Year 9" | desk/src/maths/MathsTV.tsx:689 omits the year when pastPathEnd; tv/prepareRows.ts:97-109 pastPathEnd and pathEndsLine |
| L1-radka-41-MB1-1 | The hint's leak backstop is blind on Czech-printed items and Czech notation | desk/src/lib/rules/taskText.ts:15-48 and kinds.ts readQuestion(text, system) read cz instruction leads, · and : and decimal commas so leaks sees the item |
| L1-radka-41-MB1-2 | A homework night with hints and nothing marked ends on 'Good evening's work - all of it right.' | desk/src/tv/recapRows.ts:233-236 hints-only night says Worked through with N hints; nothing was marked |
| L1-radka-41-MB1-3 | MB-HINT 4/8: no school system, no course, no working, no slips; a fixed wrong-unit stance | desk/src/lib/desk/hint.ts:86,91-102,122-135 neutral stance for an unread task and groundFor carries notation, slips, method |
| L1-radka-41-MB1-4 | MB-READ 2/5: the page read knows nothing of the school system, the age or the topic | desk/src/lib/desk/read.ts:37-45 mathsContext names notation, course, age and lettered label |
| L1-radka-41-MB4-1 | 'No marks were lost' when the lost marks sit on questions with no statement picked | desk/src/tv/paperRows.ts:106-112 paperCaption states N marks lost on questions that name no statement; paperNone likewise |
| L1-radka-41-MB4-2 | Full-loss fan-out and the prerequisite pull open a 9th-grader's mock on 'One-step equations · 2 lost', with ro | desk/src/lib/rules/recovery.ts:195-232 shares make rows add up; tv/paperRows.ts:117 caption says Start with X, the base for Y (teacher sign-off is human) |
| L1-radka-41-MB4-3 | No Select on the recovery list: 7 presses to the first topic's set, via a screen that does not know the paper | desk/src/tv/keys.ts:534-545 Select on a recovery row opens that unit's question (two presses to the set or lesson) |
| L1-radka-41-MB4-5 | A blank 'Scored' (a zero) is refused as 'not a whole number'; dropped rows silently change the TV total | desk/src/lib/rules/paperEntry.ts:34 Type 0 if nothing was scored; tv/paperRows.ts leftOutLine says questions left out on the phone |
| L1-radka-41-MB4-6 | GCSE tier facts presented as facts about her paper: 'beyond a Foundation paper', 6-mark and 80-mark caps | desk/src/app/phone/PaperPanel.tsx:36 and maths/MathsTV.tsx:735 say a harder statement; recovery.ts:91,96 caps worded as the desk takes at most N marks |
| L1-radka-41-MB4-7 | 'Secure on the desk' printed beside a topic that lost marks on the paper | desk/src/maths/MathsTV.tsx:752 a secure topic with lost marks reads Worth a recheck |
| L1-radka-41-MB4-8 | The Paper panel never names whose record the paper goes to | desk/src/app/phone/PaperPanel.tsx:15-16 paperHeading and paperSend name the seated learner |
| L1-radka-41-MB4-9 | The set the recovery leads to never sees the paper (MB-SET 2/7 for the equations units) | desk/src/app/api/practice/route.ts:45 aimOf(paper items, topic) steers the set from a recovery row (Session.paperAim, keys.ts paper Select); items.ts learnerBlock/aimBlock give age, system and statements; paper-aim tests pass |
| L1-radka-41-MB5-1 | The recap's hints, 'Needed a second hint' list and minutes are never reset: a night with nothing done reads as | desk/src/lib/session/store.ts:659-668 dayed() clears the log for every slot on a later day, End session included |
| L1-radka-41-MB5-2 | The Sunday page ignores homework evenings and papers: a week of homework help reads 'Nothing this week.' | desk/src/lib/rules/week.ts:230-233 homework and paper digest entries reach the Sunday page |
| L1-radka-41-MB5-5 | Code-written questions print UK decimal points and £/€ to a cz learner whose answers are expected with a comma | desk/src/lib/rules/school.ts:1433 question(spec, system) prints comma and Kč for cz; items.ts:567 passes system |
| L1-radka-41-MB5-8 | The digest records notSure but the Sunday page never shows it (present-but-unwired) | desk/src/lib/rules/week.ts:163 unitLine prints , N not sure when above 0 |

### Still open

| Finding | Title | Evidence |
|---|---|---|
| L1-owen-17-MB2-7 | Photo marking (the default "Snap the sheet") rests on what vision reads; the linear photo prompt asks for "a p | desk/src/lib/desk/mark.ts:167,170 linear photo prompt still asks for a plain number or simple fraction and the model's own solution; handwriting read is an L2 measure |
| L1-owen-17-MB4-1 | One broad statement spreads a loss over 3 topics: the list shows decimals rows he never lost marks on and hold | desk/src/lib/rules/recovery.ts:195-232 shares add up but split evenly across destinations (not by what the question practised); the finding's own got shows 14 topic rows, acceptance asks <=8 and none for decimals |

### Regressed

None.

### Not rechecked

| Count | Reason |
|---|---|
| 1 | mapped row MB-B37 is not marked built in docs/BACKLOG.md |
| 1 | mapped row MB-B42 (concept-doc) is not marked built in docs/BACKLOG.md |
| 3 | mapped row MB-B21 is not marked built in docs/BACKLOG.md |
| 1 | mapped row MB-B20 is not marked built in docs/BACKLOG.md |
| 1 | mapped row MB-B22 (ruling RP5) is not marked built in docs/BACKLOG.md |
| 1 | mapped row MB-B7 (owner) is not marked built in docs/BACKLOG.md |
| 1 | mapped row MB-B1 (blank half) is not marked built in docs/BACKLOG.md |
| 1 | mapped row MB-B23 is not marked built in docs/BACKLOG.md |
| 7 | no BACKLOG row built for it and it was still open at the 2026-10-14 walk |
| 11 | resolution is n-a: nothing to recheck |

## Math Adult (`math-adult`)

### Fixed (L1: the fix has landed in code; not resolved-verified)

| Finding | Title | Evidence (current code) |
|---|---|---|
| L1-matyas-19-MB1-2 | A step that completes the answer passes the leak guard ("Multiply cos(x^2) by 2x"), and hint 2 is asked to go  | desk/src/lib/rules/calc.ts:641 leaksCalc refuses the two cos(x^2)/2x lines and the u-substitution line (probed), method line passes; pinned at tools/calc-rules-test.cjs:398. |
| L1-matyas-19-MB1-4 | The page read prompt carries no course, notation or language (MB-READ 2/5); a LaTeX transcription reads as no  | desk/src/lib/desk/read.ts:37-46 mathsContext carries system, course, age/stage, plain one-line notation and printed language; route passes who at app/api/read/route.ts:36. |
| L1-matyas-19-MB3-1 | False tick: a decimal estimate within 0.5% of an exact limit or definite integral is ticked right (2.999, 3.01 | desk/src/lib/rules/calc.ts checkAnswer probed: 2.999, 3.014, 9.04 unsure, 3 and 3.00 right, 3.1 wrong; pinned at tools/calc-rules-test.cjs:439,496. |
| L1-matyas-19-MB3-2 | False tick: "ln x + C" is ticked right for the antiderivative of 1/x | desk/src/lib/rules/calc.ts checkAnswer probed: ln x + C unsure with domain line, ln|x|+C right; pinned at tools/calc-rules-test.cjs:462-463. |
| L1-matyas-19-MB3-4 | Typed answers are capped at 40 characters; the phone cuts a quotient-rule answer silently and the item comes b | desk/src/lib/rules/maths.ts:120 TYPED_ANSWER_MAX = 120, used as maxLength at desk/src/app/phone/page.tsx:603,646. |
| L1-matyas-19-MB3-5 | An unsure item says "I got something different for number N", and the checker's own reason (why) is computed a | desk/src/lib/rules/kinds.ts:153-158 unsureLine gives NOT_SURE with the engine reason (maths.ts:110); tg(x)^2+1 probed unsure with a cannot-read-as-mathematics line. |
| L1-matyas-19-MB3-10 | Topic name "The area-so-far function" is the American course word the Character names as a pet peeve | desk/src/lib/library/calculus1.spine.ts:180 name is The integral with a variable upper limit. |
| L1-matyas-19-MB3-11 | The explain prompt carries neither his answer, his working nor the slip the desk found (MB-EXPLAIN 3/8) | desk/src/lib/desk/explain.ts:65-70 seenParts and 242-252 seenOf feed answer, working lines and slip with line into the Calculus prompt (explainCalc, 196). |
| L1-vojtech-18-MB1-2 | Every maturita task gets the 'factoring and linear-equations unit' stance, for 'a 15-year-old' (C6) | desk/src/lib/desk/hint.ts:87,93-98 stanceOf gives neutralStance for a task neither equation nor expression nor Calculus; linear-equations stance only when equationOf/expressionOf reads it. |
| L1-vojtech-18-MB1-3 | The page read prompt carries no school system or notation (MB-READ 2/5) | desk/src/lib/desk/read.ts:27-46 notationLine plus mathsContext carry school system, course, age/stage, printed language and label; route passes who at app/api/read/route.ts:36. |
| L1-vojtech-18-MB2-2 | A right answer in his notation ('c = 34 mm', 'P(A) = 3/13') is unsure, and the desk says 'I got something diff | desk/src/lib/rules/school.ts S.check probed: c = 34 mm, c=34mm and 34 mm are right (the odpoved: label is still unsure, with a why line, not the finding). |
| L1-vojtech-18-MB2-4 | Topics and Get ready for school open on Equivalent fractions (5. ročník) for an 18-year-old | desk/src/tv/keys.ts:215-218 prepareDoorFocus opens on the last topic past the path end, wired at keys.ts:338 (topics likewise 206-212). |
| L1-vojtech-18-MB2-5 | No line tells him his year is past the end of the path; the Prepare door promises 'what school is teaching nex | desk/src/maths/MathsTV.tsx:435 door line is pathEndsLine(s) ?? PREPARE_DOOR; desk/src/tv/prepareRows.ts:112 yields This path ends at ...; your year is past it. |
| L1-vojtech-18-MB2-6 | The explain path is hold-to-speak in en-US only; typing appears only without a mic | desk/src/app/phone/ExplainTalk.tsx:38 Type it button beside hold-to-speak; recogniserLang.ts:7-8 gives cs-CZ for cz, used at app/phone/page.tsx:358. |
| L1-vojtech-18-MB2-7 | The Pythagoras leak rule lets 'the square root of 1156' and 'c squared is 1156' through | desk/src/lib/rules/school.ts:2656 leaksSchool probed: square root of 1225, odmocnina z 1225 and c2 = ... 1225 teď odmocni leak; c squared is 1225 and the method line pass. |
| L1-vojtech-18-MB2-9 | Topic blurbs on the caption exceed 25 words (C7, line length 0.84) | Executed topicsOf over desk/src/lib/library/paths.ts: all 17 school topic blurbs are <= 25 words (only calc2-approx 30 and calc2-sequences 33 exceed). |
| L1-vojtech-18-MB2-11 | Czech number words are not read by the leak rule | desk/src/lib/rules/school.ts:2656 leaksSchool probed: jedna petina, ctyri dvacetiny, dve desetiny, tri patnactiny all leak on matching probability items. |
| L1-vojtech-18-MB4-1 | 'No marks were lost on this paper' when every lost mark sits on a question with no statement | desk/src/tv/paperRows.ts:106-112 paperCaption says No marks were lost only when v.lost is 0; paperNone 117-122 likewise. |
| L1-vojtech-18-MB4-3 | The list never says that 24 of 32 lost marks are off the desk; the off-desk card shows 3 of 13 | desk/src/tv/paperRows.ts:60-65 offCountLine, rendered at desk/src/maths/MathsTV.tsx:719. |
| L1-vojtech-18-MB4-4 | No Select on the recovery list; Back lands on Equivalent fractions; 16 presses to a set on the first topic | desk/src/tv/keys.ts:534-545 paper handler selects the topic into prepare (nav focus ix, aim) and Back/Menu land on that unit via prepareStops index. |
| L1-owen-17-MB2-1 | False tick: a typed mixed number on a linear item is read as a product, so a wrong "1 3/4" for x = 3/4 is tick | tools/maths-judge-test.cjs:229 pins 4x+2=5 with 1 3/4 wrong and 3/4 right; suite passes against current desk/src/lib/rules/maths.ts judge. |
| L1-owen-17-MB2-2 | False ring: a correct mixed-number root ("1 1/5" for x = 6/5, "-1 1/2" for -3/2) is ringed wrong on a linear i | tools/maths-judge-test.cjs:230 pins 7-2x=3x+1 with 1 1/5 right and 2x=-3 with -1 1/2 right; suite passes against current code. |

### Still open

| Finding | Title | Evidence |
|---|---|---|
| (none) | | |

### Regressed

None.

### Not rechecked

| Count | Reason |
|---|---|
| 25 | no BACKLOG row built for it and it was still open at the 2026-10-14 walk |
| 9 | resolution is n-a: nothing to recheck |
| 1 | resolution is by-design: nothing to recheck |

## BACKLOG rows a later drain should look at (read-only here)

L1 `fixed` only; nothing is resolved-verified. These are the rows with at least one finding fixed on main. Several BACKLOG rows (EM-B4, EM-B6, MB-B2, MB-B3, MB-B8, MB-B26) still read open or partial although their finding is fixed: a later drain may stamp them built with the commit, or hold until L2.

| Row | Fixed findings |
|---|---|
| EM-B4 | helena-46-EM1-7 |
| EM-B6 | helena-46-EM1-3 |
| MB-B1 | nela-12-MB2-1, owen-17-MB2-6 |
| MB-B10 | nela-12-MB2-3, owen-17-MB2-9 |
| MB-B11 | nela-12-MB5-1, radka-41-MB1-2 |
| MB-B12 | nela-12-MB5-2, radka-41-MB5-1 |
| MB-B13 | owen-17-MB4-2, owen-17-MB4-4 |
| MB-B14 | nela-12-MB5-3, radka-41-MB5-2, radka-41-MB5-8 |
| MB-B15 | radka-41-MB4-1 |
| MB-B18 | nela-12-MB2-2 |
| MB-B19 | owen-17-MB4-7 |
| MB-B2 | nela-12-MB1-1, radka-41-MB1-1 |
| MB-B22 | radka-41-MB4-5 |
| MB-B24 | radka-41-MB4-7 |
| MB-B26 | owen-17-MB2-1, owen-17-MB2-2 |
| MB-B3 | nela-12-MB1-4, radka-41-MB1-4 |
| MB-B34 | nela-12-MB1-2 |
| MB-B39 | owen-17-MB2-8 |
| MB-B4 | nela-12-MB2-4, owen-17-MB2-5, radka-41-MB5-5 |
| MB-B40 | radka-41-MB4-9 |
| MB-B43 | radka-41-MB4-8 |
| MB-B5 | radka-41-MB4-2 |
| MB-B6 | nela-12-MB1-3, nela-12-MB2-5, owen-17-MB2-4 |
| MB-B7 | owen-17-MB4-5, radka-41-MB4-6 |
| MB-B8 | nela-12-MB1-5, radka-41-MB1-3 |
| MB-B9 | owen-17-MB4-3, radka-41-MB4-3 |

Essay Family and Math Adult findings carry no backlog field; their 17 and 22 fixed ids are in the tables above. Open findings that this recheck found fixed (resolution changed to fixed): L1-nela-12-MB2-4, L1-owen-17-MB2-5, L1-radka-41-MB5-5 (MB-B4) and L1-radka-41-MB4-9 (MB-B40).

Still open: L1-daniel-15-EM3-1, L1-kristyna-17-EM1-6 (Essay Family); L1-owen-17-MB2-7, L1-owen-17-MB4-1 (Math Family).
