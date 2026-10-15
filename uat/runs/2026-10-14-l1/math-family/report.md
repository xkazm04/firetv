# Math Buddy, Family mode - L1 re-certification (2026-10-14)

Run: `2026-10-14-l1/math-family` · cert level **L1** · module Math Buddy, Family mode · main **4af25199** (prior run `2026-10-09-maths-l1` at 12592a71; 103 files under desk/src changed since) · no browser, no model call · scratch scripts in the session scratchpad, none in the repo, `desk/data` untouched.

Cast: **nela-12** (MB1, MB2, MB5), **owen-17** (MB2, MB4), **radka-41** (MB1, MB4, MB5). **Owen is Family mode**: age 17 is under 18, `modeOf` gives family and a stored "adult" is refused (`desk/src/lib/rules/mode.ts:48-52`); nothing of his goes to the adult walker. Plan items marked not started or pending an owner ruling (Twin T4, L5/L6, M3b-3d..g, the photo of a marked paper M5c) are not defects here and none is raised; `paperRead.ts` has no caller by design (plan row 36).

## Verdict per journey

| Pair | Verdict | Fixed / open / new | Time saved if it all worked | Conf. |
|---|---|---|---|---|
| nela-12 x MB1 tonight's sheet | **L1-conditional** | 5 / 0 / 1 major | ~10-14 min a sheet | medium |
| nela-12 x MB2 practise and marked | **L1-pass** | 4 / 3 minor / 0 | ~5-8 min a sheet (MB1 + MB2 = the file's 15-20) | medium-low |
| nela-12 x MB5 worth keeping | **L1-pass** | 3 / 2 minor / 1 minor | ~35-45 min a week | medium-low |
| owen-17 x MB2 practise and marked | **L1-conditional** | 6 / 2 (1 major) + 1 uncertain / 1 minor | ~0-10 min a session | low |
| owen-17 x MB4 where the marks went | **L1-conditional** | 6 / 1 minor / 1 major | ~25-35 min (the file says 30-45) | medium |
| radka-41 x MB1 tonight's sheet | **L1-conditional** | 4 / 0 / 1 major | ~15-20 min an evening | medium |
| radka-41 x MB4 where the marks went | **L1-conditional** | 7 / 2 (1 major) / 1 major | ~30 min (typing ~20 min, not 15) | low-medium |
| radka-41 x MB5 worth keeping | **L1-conditional** | 3 / 4 minor / 1 minor | ~60 min a week for Nela; Šimon not yet | medium / low |

No pair is `L1-fail`. Last run's blockers (a recap that said "all of it right" on a night with nothing marked, a log that never reset, a week page that saw no homework, a typed mixed number read as a product, a paper list that did not add up, '(and 10 more)' off-desk statements, a leak backstop blind on Czech sheets) are **all fixed at L1**; no blocker is open. "Fixed" means the code landed (file:line in the table). It does not mean reachable or job-unblocking, which is L2's: nothing here is `resolved-verified`.

## Counts

- Carried Family rows from `2026-10-09-maths-l1`: **53** -> **38 fixed**, **14 still open** (all recurrence 2: drained into the backlog, `docs/uat-insights/2026-10-09-maths-l1.md`, and unbuilt at 4af25199; `docs/BACKLOG.md` status lines agree), **1 uncertain** (photo marking, vision).
- New: **7 rows, 4 underlying gaps** (below).
- Strengths re-measured: **11**.
- Open now: 7 major (owen-17-MB2-3, owen-17-MB2-7, radka-41-MB4-4, nela-12-MB1-8, radka-41-MB1-6, radka-41-MB4-11, owen-17-MB4-10) and 15 minor; **0 blockers**.

## Carried findings (53) - recertified at L1

Recurrence 2 on every open row (raised on 2026-10-09 and again now, unbuilt). Severity shown is the 2026-10-09 word; open rows are re-derived from impact in findings.json. Strength rows are in findings.json.

| Id | Title | Sev. 10-09 | State | Rec. | Backlog | Evidence (first) |
|---|---|---|---|---|---|---|
| nela-12-MB1-1 | Czech sheet notation is not read: the hint loses its code leak check, gets a linear-equations ... | blocker | fixed | - | MB-B2 | lib/rules/taskText.ts:15,48 |
| nela-12-MB1-2 | The next evening, "I have homework" reopens the first sheet ever snapped and never asks for to... | major | fixed | - | MB-B34 | tv/mathsRows.ts:21 |
| nela-12-MB1-3 | The withheld hint lines for her units are 31–54 words (C4) | minor | fixed | - | MB-B6 | lib/rules/school.ts:3356 |
| nela-12-MB1-4 | MB-READ 2/5: the page read knows neither her school system, her topic nor her age; item number... | minor | fixed | - | MB-B3 | lib/desk/read.ts:27-45 |
| nela-12-MB1-5 | MB-HINT 4/8: the hint sees no method card, none of her working and none of her recorded slips | minor | fixed | - | MB-B8 | lib/desk/hint.ts:122-135 |
| nela-12-MB2-1 | An unsure item's card says "I got something different for number N", even when her value is ri... | major | fixed | - | MB-B1 | lib/rules/kinds.ts:149-157 |
| nela-12-MB2-2 | Explaining is en-US speech only; there is no typed box while a speech recogniser exists | major | fixed | - | MB-B18 | app/phone/recogniserLang.ts:7 |
| nela-12-MB2-3 | MB-EXPLAIN 3/8: the reply cannot see her written answer, her working or the slip the code found | minor | fixed | - | MB-B10 | lib/desk/explain.ts:64-70,229-241 |
| nela-12-MB2-4 | Questions and worked examples print decimal points and £/€ for a cz learner, while the answers... | minor | open | 2 | MB-B4 | lib/rules/school.ts:1089 (question(spec) takes no system) |
| nela-12-MB2-5 | The walk card's slip lines for her units run 26–32 words (C4) | minor | fixed | - | MB-B6 | lib/rules/school.ts:1208 |
| nela-12-MB2-6 | Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročník le... | minor | open | 2 | MB-B37 | lib/rules/school.ts:2280 (gen) |
| nela-12-MB2-7 | Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" | minor | open | 2 | MB-B42 (concept-doc) | lib/library/worked.ts:15 ('then simplify') |
| nela-12-MB5-1 | The recap says "Good evening's work - all of it right." on an evening where nothing was marked | blocker | fixed | - | MB-B11 | tv/recapRows.ts:109-118 |
| nela-12-MB5-2 | The evening log never resets: hint counts, "Needed a second hint" and the memory's hint count ... | blocker | fixed | - | MB-B12 | lib/session/store.ts:618-623 |
| nela-12-MB5-3 | The week page cannot see homework evenings ("Nothing this week." after three sheets) | major | fixed | - | MB-B14 | lib/rules/week.ts:177-179 |
| nela-12-MB5-4 | The school system defaults silently to UK, and the row's blurb does not say it decides how 0,5... | minor | open | 2 | MB-B21 | tv/profileRows.ts:24,26 |
| nela-12-MB5-5 | A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-off) | minor | open | 2 | MB-B21 | lib/library/syllabus.ts:296-304 |
| owen-17-MB2-1 | False tick: a typed mixed number on a linear item is read as a product, so a wrong "1 3/4" for... | blocker | fixed | - | MB-B26 | lib/desk/verify.ts:155-177 |
| owen-17-MB2-2 | False ring: a correct mixed-number root ("1 1/5" for x = 6/5, "-1 1/2" for -3/2) is ringed wro... | major | fixed | - | MB-B26 | lib/desk/verify.ts:155-177 |
| owen-17-MB2-3 | Fraction sets never practise the forms his mock tested: no mixed-number operands, no word prob... | major | open | 2 | MB-B20 | lib/rules/stretch.ts:36-39 |
| owen-17-MB2-4 | Slip lines on the walk run 26-37 words: line length 0.54 against >= 0.9 | major | fixed | - | MB-B6 | lib/rules/school.ts:1208 |
| owen-17-MB2-5 | UK-habit answers read "not sure": £ on a euro item, "cm squared", "sq cm", "pounds" | minor | open | 2 | MB-B4 | lib/rules/school.ts:146 (UNITS) |
| owen-17-MB2-6 | The unsure line says "I got something different for number N" for a rounded right answer and f... | minor | fixed | - | MB-B1 | lib/rules/kinds.ts:149-157 |
| owen-17-MB2-7 | Photo marking (the default "Snap the sheet") rests on what vision reads; the linear photo prom... | major | open (uncertain, vision) | 1 | MB-B17 | lib/desk/mark.ts:162-173 (linearPrompt) |
| owen-17-MB2-8 | Get ready for school (the road his paper sends him down) skips the worked lesson | minor | fixed | - | MB-B39 | tv/keys.ts:513-529 |
| owen-17-MB2-9 | An explain reply never sees his answer or the slip code found (MB-EXPLAIN 3/8) | minor | fixed | - | MB-B10 | lib/desk/explain.ts:64-70,229-241 |
| owen-17-MB4-1 | One broad statement spreads a loss over 3 topics: the list shows decimals rows he never lost m... | blocker | fixed | - | MB-B5 | lib/rules/recovery.ts:195-232 |
| owen-17-MB4-2 | 10 of 13 off-desk statements (20 marks, incl. quadratics and rearranging) appear only as "and ... | blocker | fixed | - | MB-B13 | tv/keys.ts:534-545 |
| owen-17-MB4-3 | No step from a recovery row to its practice: Select does nothing, Back lands on Equivalent fra... | major | fixed | - | MB-B9 | tv/keys.ts:534-545 |
| owen-17-MB4-4 | A beyond-Foundation statement is not demoted inside the off card and takes one of its 3 visibl... | minor | fixed | - | MB-B13 | lib/rules/recovery.ts:246-247 |
| owen-17-MB4-5 | The statement picker: 97 checkboxes per row, no search, percentages under "Ratio, proportion a... | minor | fixed | - | MB-B7 | lib/rules/paperEntry.ts:60-67 |
| owen-17-MB4-6 | 31 typed paper rows live only in React state: a phone reload or tab discard loses them | minor | open | 2 | MB-B22 (ruling RP5) | app/phone/page.tsx:62 |
| owen-17-MB4-7 | Get ready for school labels a 17-year-old's topics "Year 5" to "Year 9" | minor | fixed | - | MB-B19 | tv/prepareRows.ts:78-93 |
| radka-41-MB1-1 | The hint's leak backstop is blind on Czech-printed items and Czech notation | blocker | fixed | - | MB-B2 | lib/rules/taskText.ts:15,48 |
| radka-41-MB1-2 | A homework night with hints and nothing marked ends on 'Good evening's work - all of it right.' | blocker | fixed | - | MB-B11 | tv/recapRows.ts:109-118 |
| radka-41-MB1-3 | MB-HINT 4/8: no school system, no course, no working, no slips; a fixed wrong-unit stance | major | fixed | - | MB-B8 | lib/desk/hint.ts:91-102,122-135 |
| radka-41-MB1-4 | MB-READ 2/5: the page read knows nothing of the school system, the age or the topic | major | fixed | - | MB-B3 | lib/desk/read.ts:37-45 |
| radka-41-MB4-1 | 'No marks were lost' when the lost marks sit on questions with no statement picked | blocker | fixed | - | MB-B15 | tv/paperRows.ts:100-118 |
| radka-41-MB4-2 | Full-loss fan-out and the prerequisite pull open a 9th-grader's mock on 'One-step equations · ... | blocker | fixed | - | MB-B5 | lib/rules/recovery.ts:195-232 |
| radka-41-MB4-3 | No Select on the recovery list: 7 presses to the first topic's set, via a screen that does not... | major | fixed | - | MB-B9 | tv/keys.ts:534-545 |
| radka-41-MB4-4 | 97 GCSE-worded statements, 41 with specialist or UK-curriculum terms, to map a CERMAT mock | major | open | 2 | MB-B7 (owner) | app/phone/PaperPanel.tsx:25-42 |
| radka-41-MB4-5 | A blank 'Scored' (a zero) is refused as 'not a whole number'; dropped rows silently change the... | minor | fixed | - | MB-B22 | lib/rules/paperEntry.ts:32-38 |
| radka-41-MB4-6 | GCSE tier facts presented as facts about her paper: 'beyond a Foundation paper', 6-mark and 80... | minor | fixed | - | MB-B7 | app/phone/PaperPanel.tsx:36 |
| radka-41-MB4-7 | 'Secure on the desk' printed beside a topic that lost marks on the paper | minor | fixed | - | MB-B24 | maths/MathsTV.tsx:736 |
| radka-41-MB4-8 | The Paper panel never names whose record the paper goes to | minor | fixed | - | MB-B43 | app/phone/PaperPanel.tsx:15-16,45 |
| radka-41-MB4-9 | The set the recovery leads to never sees the paper (MB-SET 2/7 for the equations units) | minor | open | 2 | MB-B40 | lib/desk/items.ts:70-100,136-143 |
| radka-41-MB5-1 | The recap's hints, 'Needed a second hint' list and minutes are never reset: a night with nothi... | blocker | fixed | - | MB-B12 | lib/session/store.ts:618-623 |
| radka-41-MB5-2 | The Sunday page ignores homework evenings and papers: a week of homework help reads 'Nothing t... | blocker | fixed | - | MB-B14 | lib/rules/week.ts:177-179 |
| radka-41-MB5-4 | Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back'; the system silently d... | minor | open | 2 | MB-B21 | tv/profileRows.ts:24-31,71-82 |
| radka-41-MB5-5 | Code-written questions print UK decimal points and £/€ to a cz learner whose answers are expec... | minor | open | 2 | MB-B4 | lib/rules/school.ts:1089 |
| radka-41-MB5-6 | A skipped (blank) typed answer is shown as 'The desk is not sure' and counted as the desk's do... | minor | open | 2 | MB-B1 (blank half) | lib/rules/maths.ts:218-221 (rightLine) |
| radka-41-MB5-7 | The recap and the week cover only the child seated now | minor | open | 2 | MB-B23 | tv/recapRows.ts:46-62 |
| radka-41-MB5-8 | The digest records notSure but the Sunday page never shows it (present-but-unwired) | minor | fixed | - | MB-B14 | lib/rules/week.ts:245 |

## New findings for the next drain

| Id | Title | Sev. | Rank | Rec. |
|---|---|---|---|---|
| nela-12-MB1-8 | The leak backstop still reads nothing on common Czech instruction verbs and word problems: 'Sečti', 'Odečti',... | major | 18 | 2 |
| radka-41-MB1-6 | Same gap seen from the parent: on a Czech sheet's 'Sečti / Zkrať / Kolik je ...' lines nothing but the prompt... | major | 18 | 2 |
| radka-41-MB4-11 | A topic's 'N marks lost · From 2, 3, 8, 21' is a share of those questions' marks, and nothing on the TV says ... | major | 18 | 1 |
| owen-17-MB4-10 | His row 'Add and subtract fractions: 4 lost' does not match the questions it names (they lost 8): the TV neve... | major | 18 | 1 |
| nela-12-MB5-7 | End session as the first event of a new day still reads yesterday's hints: the day-clearing skips session.end | minor | 9 | 1 |
| radka-41-MB5-10 | A parent who ends a day with nothing done is shown yesterday's hints and 'needed a second hint' (End session ... | minor | 9 | 1 |
| owen-17-MB2-11 | The three linear-equation units (the rows an equations loss leads to) have no worked lesson: 'See how first' ... | minor | 6 | 1 |

### The four new gaps

1. **Czech instruction verbs are unread** (`desk/src/lib/rules/taskText.ts:15`, INSTRUCTION). 9 of 21 phrasings a Czech worksheet prints for fractions ('Sečti', 'Odečti', 'Vynásob', 'Zkrať', 'Urči', 'Převeď', 'Rozděl', 'Kolik je 3/4 z 20?') read as no unit, so only the general `leaks()` runs; it passes 'Then you get 15.' and '3/4 of 20 is 15'. The read prompt keeps the page's language (`read.ts:45`), so these lines reach the hint verbatim. Residual of the fixed MB-B2 blocker; also sends the lesson pick to the linear library (`hint/route.ts:67-68`).
2. **End session as the first event of a later day shows yesterday's log** (`store.ts:620` exempts `session.end`; `recapRows.ts:59` reads `s.log` undated). Executed: 3 hints, 1 second hint on day 1; day 2, End only -> 'Worked through with 3 hints; nothing was marked.'
3. **A topic's "N lost" is a share and the TV does not say so.** The MB-B5 fix shares a multi-topic question's lost marks in whole marks so the rows add up. The cost: 'Add and subtract fractions · 4 lost · From 6, 10, 14' where those questions lost 8. The statement behind a share (`RecoveryTopic.codes`) has 0 readers in `tv/` and `maths/`.
4. **The three equation units have no worked lesson** (14 of 17 school units do), so a recovery row on equations skips 'See how first'. Not a planned slice (plan row 9); reported as a ceiling.

## Strengths worth protecting (re-measured)

- **Typed marking is exact.** cz: 4,800 of 4,800 correct answers ticked over six units; 13,712 one-digit mutations over 13 units: 0 ticked, 0 equal values ringed; 22,884 code-written slip answers over 14 units: 0 ticked, 22,721 named by their own slip, 163 'not sure'. Linear: 6,720 of 6,720 correct forms (integer, fraction, mixed number, decimal) ticked, 0 of 20,108 wrong forms ticked. Suites at this head, all green: school-marking 67/67, school-rules 87/87, maths-judge 18/18, maths-second 6/6, maths-rules 51/51, school-practice 36/36, recovery-rules 11/11, maths-tv 73/73, phone-panel 98/98, tv-recap 43/43, week-digest 31/31, week-rules 18/18.
- **The recovery list adds up.** topics + off-desk + unmapped = the paper's loss in 2,000 of 2,000 random papers; the total is the marks typed (a capped row is named).
- **Nothing names GCSE, 1MA1, Edexcel, a grade or a pass** in `maths/`, `tv/`, `app/phone/`, `rules/recovery.ts` (grep); the flag reads "a harder statement".
- **Short lines.** 106 of 107 fixed TV lines (53 slip lines, 15 withheld lines, 17 topic blurbs, choice lines, captions, 14 lesson ideas) are <= 25 words: **0.991** against 0.542 last run. The one over is the equivalent-fractions idea at 28.
- **The recap and the week tell the truth about a homework night.** 'Worked through with 3 hints; nothing was marked.'; 'Three homework sheets, 6 hints, 2 needed a second.'; 'Add and subtract fractions: 4 of 6 right, 1 not sure, last set.'

Do not touch: the whole-mark sharing invariant (MB-B5; label it, do not remove it), the single validation that never guesses (`cleanPaper`), code-decided marks, the per-day evening log.

## Grounding (shared denominators, `2026-10-09-maths-l1/SUMMARY.md`; a source counts only when it enters the prompt or schema)

| Surface | N | 10-09 | Now | Which |
|---|---|---|---|---|
| MB-READ (vision) | 5 | 2 | **5** | photo, subject, system (notation), course, age or stage (`read.ts:37-45`) |
| MB-HINT, read school task | 8 | 4 | **6** | H1 problem, H2 previous, H3 question, H4 method card (`groundFor`), H6 age (voice), H8 recorded slips; absent H5 path, H7 working |
| MB-HINT, task no reader reads | 8 | 4 | **4** | H1 H2 H3 H6 (+ notation as a named addition) |
| MB-EXPLAIN | 8 | 3 | **6** | X1 item, X2 answer, X3 slip, X4 explanation, X5 working, X6 age (`explain.ts:64-70,229-241`); absent X7 system (used only to read the value), X8 history |
| MB-SET, code-built school sets | - | n-a | n-a | specs printed by code, no model |
| MB-SET, model-made equation sets | 7 | 2 | **2** | Q1 topic, Q3 past slips; the paper never reaches it (grep 'paper' in items.ts and stretch.ts: 0) |
| MB-WORKED idea | 5 | 3 | **3** | W1 topic, W2 steps, W3 age; the examples are code |
| MB-PICK | 3 | 2 | **2** | not called on a school-unit task; asked for the unread Czech verbs (gap 1) |
| MB-MARK, prompt only | 6 | 2 / 3 | **2** school, **3** linear | the verdict stays code's |

## Wiring audit

- Events: 53 declared in the `Event` union, **53 of 53** posted or handled outside `store.ts`; 0 dead.
- Modules with no importer in `lib/rules`, `lib/desk`, `lib/library`: **4 of 54**: `paperRead.ts` and `paperScore.ts` (the photo-of-a-marked-paper path, plan row 36, "wired to nothing"; `scope_note`: deliberately not built until the probe passes), `habits.ts` (Twin T3, adult), `calculus1.ts` (adult data file). For Family: 2 of 54, both deliberate.
- Fields: `notSure` has a reader again (`week.ts:245`); `leftOut` (`paperRows.ts:62`), the homework and paper digest entries (`week.ts:177-179`), `page.missing` and `endedAt` (`page.tsx:718`) are read. **`RecoveryTopic.codes` has 0 readers under `tv/` and `maths/`** (declared `recovery.ts:63`, dropped at `paperRows.ts:33`): present-but-unwired, dispositioned in L1-radka-41-MB4-11.
- Dead flags: none found on the Family surfaces.

## Reachability

L1 cannot see it. The Paper tab (phone panel bar, `page.tsx:632`) and the Recap tab need a seated learner; Owen reaches Get ready for school from `paper` by Select (fixed); the cs-CZ recogniser needs a Czech profile on a browser that has one. Each is declared for L2 in findings.json `l2_priority` with its precondition.

## L2 priorities (with environment preconditions)

1. **Needs Ollama qwen host** (vision on local Ollama, qwen 27B pulled, `uat/env.md`): the Czech page read incl. lettered parts and two columns; photo marking of a handwritten linear sheet (owen MB2-7 stays *uncertain* until then).
2. Text engine (claude CLI) plus an isolated `DESK_DATA_DIR` and a cz profile: 3 live hints each on 'Kolik je 3/4 z 20?' and 'Zkrať zlomek 18/24'; the length of live hint lines (a re-ask can leave one long).
3. A browser, no model: type a real 16-25 question mock with the find box (C3 time); a clock moved past midnight for End-session-first.

## Method notes

- The prior rows' file:lines were treated as hypotheses. 38 of 53 turned out to be fixed; each was re-derived from current code or an executed repro, not from commit subjects. The backlog's status lines agreed on every row that stayed open.
- The sweeps (fuzz, slips, linear, the paper invariant, line lengths) are throw-away scratch scripts; the repo's suites cover the same ground at smaller n. They found no false tick, so the strengths are stated with their n.
- Registry: declared (`.ai/manifest.yaml`), not consulted for golden paths in this pass: no backlog item is proposed here, so no `standard:` is named and no lead is filed.
- What this pass could not see: vision, model output, a browser. The Czech-verb finding is a code fact (the reader returns null), not a measured leak rate.
