# radka-41 × MB1 · Tonight's sheet, together

- Character: radka-41 (external buyer; sits beside Nela, `elementary` 12, `cz`, School maths, Family)
- Journey: MB1 (promotion: discovery)
- Cert level: L1 (code walk + node executions, no model, no vision, no browser)
- Base commit: 12592a71
- **Verdict: L1-fail**. Two blockers. The TV recap says "Good evening's work - all of it right." after an evening where nothing was marked (radka-41-MB1-2). The code check that stops a hint from giving the answer cannot read Czech-printed items or Czech notation (radka-41-MB1-1). The journey still completes structurally, in 2 presses from Tonight to the first hint.

## Reachable surface set

Radka has no profile; everything goes through Nela's session.
- Landing: Select on Math Buddy opens Tonight (`desk/src/tv/keys.ts:286`, `openWaiting` `:252-261`).
- Tonight's doors for a school path: `["homework","teach","prepare"]` (`desk/src/tv/keys.ts:106-109`). The homework door calls `page.ask` (`desk/src/tv/keys.ts:306-307`) and the phone moves to `capture` (`desk/src/app/phone/panelFor.ts:31`).
- `page` arrives on `page.reading` (`desk/src/lib/session/store.ts:525-527`). Select gives a hint (`desk/src/tv/keys.ts:357`), the `hint` stops are `["stuck","lesson"]` (`desk/src/tv/keys.ts:174`), and `lesson` comes from there (`:362-366`).
- Phone: Capture, Point & ask (`desk/src/app/phone/page.tsx:520-533`), Tonight → End session (`:611`), Recap (Parent) (`:615-627`).
- TV recap: Menu on the landing (`desk/src/tv/keys.ts:273`), drawn by `desk/src/tv/screens.tsx:303`.
- Unreachable for this pair: nothing the journey needs. Vision itself is a precondition, not a gate.

## Surface model (affordances in order)

| # | Affordance | file:line | Route / pipeline | AI prompt sources |
|---|---|---|---|---|
| 1 | Math Buddy on the shelf | `tv/keys.ts:286` | nav tonight | — |
| 2 | "I have homework" door | `tv/keys.ts:306`, `maths/MathsTV.tsx:421-432` | `page.ask` | — |
| 3 | Phone Capture → Use this page | `app/phone/page.tsx:417-466` | `/api/read` → `lib/desk/read.ts:24` (vision) | MB-READ |
| 4 | Page, one item under the lamp | `maths/MathsTV.tsx:936-990` | — | — |
| 5 | Select → Hint 1 | `tv/keys.ts:357` | `/api/hint` → `lib/desk/hint.ts:85` | MB-HINT |
| 6 | Still stuck → Hint 2 | `tv/keys.ts:362`, `app/api/hint/route.ts:33-40` | `hint()` with `previous` | MB-HINT |
| 7 | Show me the lesson / No lesson for this / Six like this | `maths/MathsTV.tsx:1035-1039`, `tv/keys.ts:362-366` | `/api/hint` → `lib/desk/pick.ts:24` | MB-PICK |
| 8 | Point & ask (phone) | `app/phone/page.tsx:520-533` | `/api/hint` with `askedQ` | MB-HINT (H3) |
| 9 | End session / Menu on landing | `app/phone/page.tsx:354-359`, `tv/keys.ts:273` | `session.end` + `/api/memory` | MEM |
| 10 | TV recap + phone Recap | `tv/screens.tsx:303`, `app/phone/page.tsx:615-627` | `tv/recapRows.ts` (code) | — |

## The walk (in character)

1. **Landing → Tonight.** Q1 yes: there is one big lit object. Q2/Q3 yes. Q4: Tonight shows three doors, and the caption on the homework door says "Snap the sheet on the phone and the desk reads it, one problem at a time — hints, never the answer." (20 words). That line is the promise I came for.
2. **Homework door (press 1).** The TV waits with "Waiting for the Math Buddy page. Snap it on the phone — it appears here." The phone jumps to Capture by itself. Q4 yes.
3. **Snap the sheet.** Nela's Czech sheet goes to vision. What comes back is outside L1's reach (radka-41-MB1-5). The prompt asks for items "exactly as printed", so Czech instruction words ("Řeš rovnici", "Vypočítej") and Czech notation ("0,3 · 0,4") reach the item text unchanged.
4. **Page.** Item 1 is under the lamp: "Number 1 is under the lamp. Select for a hint — the next step, never the answer." Q1-Q4 yes. Up/Down move between items.
5. **Select → Hint 1 (press 2).** "Hint 1 of 2 · A first look", with the hint and a "what to try next" arrow. Q4 yes. For an item the desk reads as a school unit ("3/4 + 1/6"), the code leak check and the unit's stance apply. For an item it does not read ("Řeš rovnici 3(x - 2) = 2x + 5", "0,3 · 0,4 =", "Vypočítej: 3/4 + 1/6 ="), the only backstop is the general check. Executed below, it lets "So x = 11." through. The model is also told the sheet is "a factoring and linear-equations unit" (`hint.ts:45,66`), whatever the sheet is.
6. **Still stuck → Hint 2 (press 3).** It sees hint 1 (`route.ts:35`) and must go one step further. Q4 yes ("One step further", both pips lit, "That's both hints").
7. **Lesson.** For a school-unit task there is no lesson library: "No lesson in tonight's library covers this one. The hint is all there is — and that is fine." (18 words), and "Six like this" sits on the stop. That is plain, as D3 asks. For an item that does not read, the picker sees the whole maths lesson library with no course filter (`pick.ts:25`), so whether it says "none" is L2.
8. **End and recap.** The phone's Recap says "Math Buddy - 1 page; 2 hints" and "Needed a second hint: <the problem>". That is good. The TV caption says "Good evening's work - all of it right." Nothing was marked tonight. It was a homework evening of hints. That line is false (radka-41-MB1-2).

## Scored criteria (radka-41)

| C | Result | Evidence |
|---|---|---|
| C1 BLOCKER (no answer before the child answers) | **uncertain (L2)**, with a confirmed guard gap | The prompt forbids answers (`hint.ts:50-51,100-104`). The code backstop misses Czech-printed and Czech-notation items (repro 2). Whether the model leaks needs vision + text live. |
| C5 recap in sentences | **fail** | The phone recap has counts and a second-hint list (pass). The TV caption claims "all of it right" with nothing marked (repro 1). The counts also carry over between evenings (see radka-41-MB5-1). |
| C6 no unbacked exam/grade claims | pass | Nothing on the MB1 path names a board, a grade or a pass. |
| C7 tick from the desk's own check / "not sure" | n-a | MB1 marks nothing. |
| C2, C3, C4 | n-a | Paper criteria (MB4). |

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| presses to first hint | **2** (Select homework door, Select on item 1; photo not counted; +1 Down per later item). Good ≤ 4. |
| line length | static TV lines on this path: **9/9 ≤ 25 words** (max 20). Hint/next lines are model output → L2. |
| answer leak | L2 (guard gap confirmed, see radka-41-MB1-1) |
| hint helpfulness | L2 |
| page read rate | L2 (vision host) |
| time to read page | L2 (vision host) |

## Wiring audit

| Route / view | Computed user-facing fields | Wired | Unwired |
|---|---|---|---|
| `/api/read` → `Page` | items[].n, .text, .band, readMs, provider | 4/5 | `provider` (0 hits outside `english/LingaTestBar.tsx`) |
| `/api/hint` → `Hint` | hint, next, askedQ, stage, ms (status line), provider | 5/6 | `provider` |
| lesson pick | title, t, why, youtube, text | 5/5 | — |
| **Total** | | **14/16** | page.provider, hint.provider. These would let a parent see "who answered" (C7-adjacent). |

## Grounding audit (shared denominators)

**MB-READ 2/5.** P1 photo ✓ (`read.ts:26`). P2 subject ✓ (`read.ts:27`, `WHAT[subject]`). P3 school system ✗. P4 topic/course ✗. P5 age ✗.

**MB-HINT 4/8.** H1 problem ✓ (`hint.ts:110`). H2 previous hint ✓ (`hint.ts:108`, `route.ts:35`). H3 the learner's question ✓ via Point & ask only (`hint.ts:110`, `route.ts:44`). H4 lesson/rule card ✗ (only for English, `route.ts:42`). H5 course path ✗ for a school learner: the path changes the prompt only on a calc path (`hint.ts:66`); otherwise the fixed "factoring and linear-equations unit" stance stands. H6 age ✓ (`hint.ts:88,106`; `route.ts:31`). H7 working ✗. H8 slips ✗.

**MB-PICK 2/3.** L1 problem ✓ (`pick.ts:28`). L2 library ✓ (`pick.ts:25`, all maths lessons, not path-filtered). L3 course/topic ✗.

**MEM (list).** topic, the practice items, `hintsUsed` = `s.log.hints` (`app/api/memory/route.ts:31-35`). That counter is never reset (radka-41-MB5-1), so the memory prompt sees an inflated hint count.

Named addition: the school system (cz) is used by typed marking (`app/api/mark/route.ts:62`) but by none of the MB1 AI calls.

## Executions

All from ROOT, with `DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/radka-41`. Scripts are in `.../data/radka-41/scripts/`.

**1. Recap after a homework-only evening** (`node .../scripts/recap.cjs`; store `reduce` + `tv/recapRows`):
```
EVENING 1 (homework + hints only, nothing marked)
 tile {"app":"maths","empty":null,"sets":[],"pages":1,"hints":1,"second":1}
 TV caption: Good evening's work - all of it right.
 phone line: Math Buddy - 1 page; 1 hint
 phone second-hint list: ["3(x - 2) = 2x + 5"] | log after session.end: {"problems":["k1"],"hints":1,"hard":["3(x - 2) = 2x + 5"],...}
```

**2. The leak backstop on realistic item texts** (`node .../scripts/leak.cjs`, `leak2.cjs`; `rules/kinds.readQuestion`, `rules/maths.leaks`, `rules/school.leaksSchool`):
```
"3/4 + 1/6"                kind school  "The answer is 11/12."  -> school leak true
"Vypočítej: 3/4 + 1/6 ="   kind linear  "The answer is 11/12."  -> general false, school null
"3(x - 2) = 2x + 5"        kind linear  "So x = 11."            -> general true
"Řeš rovnici 3(x - 2) = 2x + 5"         "So x = 11."            -> general false
"Solve 3(x - 2) = 2x + 5"               "So x = 11."            -> caught: false
"Solve: 3(x − 2) = 2x + 5"              "So x = 11."            -> caught: true
"2/3 · 9/4 ="  linear  "The answer is 3/2."   -> caught: false   ("2/3 × 9/4" -> true)
"0,3 × 0,4"    linear  "The answer is 0,12."  -> caught: false   ("0.3 × 0.4" -> true)
"Vypočítej 15 % z 240 Kč."  "That is 36 Kč."  -> general false
```

**3. Line lengths** (`node .../scripts/lines.cjs`): the MB1 static lines measure 20, 14, 15, 11, 13, 16, 8, 10 and 18 words, so all ≤ 25.

## Findings

- **radka-41-MB1-1** (blocker, rank 18, confirmed guard gap). The hint's code leak check cannot read Czech instruction words ("Řeš rovnici", "Vypočítej"), the Czech multiplication dot "·", comma decimals, or an English "Solve" with no colon. On those items a line that states the answer passes, and the stance tells the model the sheet is a factoring/linear-equations unit.
- **radka-41-MB1-2** (blocker, rank 27, confirmed). After an evening of homework hints with nothing marked, the TV recap caption is "Good evening's work - all of it right."
- **radka-41-MB1-3** (major, rank 9, confirmed). MB-HINT 4/8: no school system, no course for a school learner, no working, no slips. The fixed stance names the wrong unit for any item the readers do not parse.
- **radka-41-MB1-4** (major, rank 12, uncertain → L2 vision). MB-READ 2/5: the page read gets neither the school system nor the age nor the topic, so Czech commas, "·" and lettered sub-items are read blind.
- **radka-41-MB1-5** (strength). Two presses from Tonight to a first hint. "Hint 1 of 2" and "Still stuck" make the two-step ladder visible. A school-unit item gets its own code leak check, a "No lesson for this" line and "Six like this". The second-hint list on the phone names the exact problem.
- Cross-ref **radka-41-MB5-1** (the recap's hint counts never reset) also hits this journey's D5.

## Time saved and grounding

- If it all worked: **~20 min saved per homework evening · confidence low**. Her 40 min becomes ~20 beside Nela. Low because the page read is unproven (vision) and the evening's recap currently tells her something false.
- Grounding: MB-READ 2/5 · MB-HINT 4/8 · MB-PICK 2/3.

## Voice — Radka, first person

OK, but how do I know it's right? I like the beginning a lot. Two buttons and Nela's sheet is on the big screen, one problem at a time. "Hint 1 of 2" and "Still stuck" are exactly what I want to see, because I can watch it hold back. I don't have to be the maths expert; I just read the line with her. That part fits our sofa.

Then I learn two things that worry me. Nela's sheets are Czech: "Řeš rovnici", "Vypočítej", and the dot for times. The desk's own safety check, the one that stops it giving the answer, cannot read those. So on exactly our kind of sheet I'm trusting the AI's good manners alone. And at the end the TV says "Good evening's work - all of it right." Nothing was checked tonight! She asked for hints; nobody marked anything. If I believe that line, I'll be surprised when the teacher marks it red tomorrow. That's the opposite of what I'm paying for.

Would I tell another mum? Not yet. I'd tell her "the hints idea is good, but it says things are right when nobody checked them." For my job I need a recap that says "worked through 6 problems, 2 needed a second hint, nothing was marked." That would be the truth, and I'd trust the rest more for it.
