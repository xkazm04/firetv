# vojtech-18 × MB1 · Tonight's sheet, together

- Character: `vojtech-18` (out of segment: SŠ 4. ročník, maturita in May 2027, school system `cz`, School maths, Family mode)
- Journey: MB1 (`uat/journeys/maths/MB1-tonights-sheet.md`)
- Cert level: **L1** (code walk + node executions; no browser, no server, no model call)
- Base commit: 12592a71 (HEAD c3b0aee3 changes no file under `desk/src`)
- Verdict: **L1-fail**. The flow is complete: 2 presses to the first hint, a second hint, and "No lesson" said plainly. But the code backstop against an answer leak reads none of the tasks on his sheet. That is a blocker on C1, his first BLOCKER criterion. Whether a leak actually happens depends on the model (L2).

## Reachable surface set

Profile: type `high-school`, age 18, `cz`, `mathPath` unset (so `school`), modules all on, Mode Family.
- Age 18 is inside the high-school range [15, 19] (`desk/src/tv/profileRows.ts:13`). The Mode row is offered (`:74`). Mode changes nothing in Math Buddy.
- Tonight's doors are `homework`, `teach` and `prepare`, because the school path has `school: true` (`desk/src/tv/keys.ts:105-107`, `desk/src/lib/library/paths.ts:72-75`).
- Reachable on this journey:
  - Tonight → I have homework, then `page.ask` (`keys.ts:306-307`).
  - The phone's Capture tab (`desk/src/app/phone/page.tsx:417-460`) → `/api/read` → `page.reading`, which puts the TV on `page` (`desk/src/lib/session/store.ts:525-527`).
  - The page: Up/Down items, Select = hint (`keys.ts:347-358`).
  - The hint, stage 1 and 2, and "Show me the lesson" or "Six like this" (`keys.ts:359-368`).
  - The lesson screen.
  - The phone's Point & ask (`page.tsx:558-570`).
  - The recap (`desk/src/tv/recapRows.ts:43-57`, `desk/src/tv/screens.tsx:334-347`).
- Not on this journey:
  - The parent beside him. MB1 D4 is n-a: he works alone at his aunt's desk.
  - The Calculus 1 stance. He can reach it through the profile row (`profileRows.ts:77`), but his binding keeps School maths.

## Surface model (affordances in order)

| # | Affordance | file:line | Route / pipeline | AI prompt sources |
|---|---|---|---|---|
| 1 | Tonight, door "I have homework" (caption "Snap the sheet on the phone and the desk reads it, one problem at a time — hints, never the answer.") | `desk/src/maths/MathsTV.tsx:421-433`, `keys.ts:306-307` | `page.ask` event | — |
| 2 | Phone Capture → "Use this page" | `page.tsx:162-168` | `POST /api/read` → `desk/src/lib/desk/read.ts:24-37` (vision) | MB-READ: photo, subject |
| 3 | Page: one problem under the lamp, "Number N is under the lamp. Select for a hint — the next step, never the answer." | `MathsTV.tsx:935-996` | — | — |
| 4 | Select → hint 1 | `keys.ts:357` → `desk/src/app/api/hint/route.ts:42-47` → `desk/src/lib/desk/hint.ts:123-158` | text engine `fast`, then the leak check `leaksLine` (`hint.ts:113-115`) | MB-HINT |
| 5 | "Still stuck" → hint 2 | `keys.ts:362`, `route.ts:33-40` | same, with `previous` | MB-HINT + H2 |
| 6 | Lesson pick behind the hint | `route.ts:50-55` → `desk/src/lib/desk/pick.ts:24-35` | text engine `fast` | MB-PICK |
| 7 | Phone Point & ask (tap a problem, a question, Ask) | `page.tsx:258-266`, `:558-570` | `POST /api/hint {askedQ}` | MB-HINT H3 |
| 8 | Recap tile (sheets, pages, hint lamps, second-hint lamps) | `recapRows.ts:47-57`, `screens.tsx:334-347` | — | — |

## The walk (in character)

1. **Tonight.** "I have homework" is the first door, and the caption says snap the sheet on the phone.
   - (1) Yes, he knows what it wants.
   - (2) The action is the phone's Capture tab. The phone follows by itself (`desk/src/app/phone/panelFor.ts:31`).
   - (3) Yes, it connects to his goal.
   - (4) The TV shows "Waiting for the photo".
   - One press (Select).
2. **Snap.** His teacher's worksheet is in Czech: "1. Řešte v R nerovnici x² − 5x + 6 < 0", "2. V aritmetické posloupnosti je a₁ = 3, d = 4. Určete a₁₀.", "3. Napište obecnou rovnici přímky AB, A[1; 2], B[3; 6]."
   - The read prompt asks for items "exactly as printed", exponents with ^ (`read.ts:27-29`).
   - Nothing in the prompt names his school system or notation: the decimal comma, `A[1; 2]`, the interval `(2; 3)`, sub-items labelled a), b) under one numbered instruction.
   - **Uncertain at L1:** how the sheet comes back depends on vision.
3. **The page.** "Number 1 is under the lamp. Select for a hint." He presses Select: 2 presses from Tonight, the photo not counted. He wanted to know what the hint would be. He gets one, in English.
4. **Hint 1.** The prompt has these parts:
   - System (`hint.ts:132`): `You are a maths tutor for a 15-year-old. This sheet is a factoring and linear-equations unit; prefer the unit's methods over heavier ones.` His tasks read as `linear` (execution E1), so the stance is the default (`hint.ts:83`, `:100-104`). His age 18 becomes "a 15-year-old" (`desk/src/lib/rules/voice.ts:69`).
   - Prompt (`hint.ts:148`): the problem text, plus his own question if he asked one.
   - The leak guard (`hint.ts:113-115`) is `leaks()` alone. No school or Calculus reader reads a Czech or maturita task (E1). `leaks()` needs a bare equation in x, or one after a `Label:`, to have an oracle (`desk/src/lib/rules/maths.ts:362-376`).
   - My executions (E2, E3): 0 of 16 answer-giving lines on maturita and Czech tasks are caught. Among the 16:
     - "x = 4" on the task "Solve 2x + 3 = 11", printed without a colon;
     - "Takže x = 11." on "Řešte rovnici 3(x − 2) = 2x + 5.";
     - "The solution is the interval (2; 3).";
     - "The 10th term is 39.";
     - "The line is y = 2x.";
     - "Výsledek je 11/12." on "Vypočtěte 3/4 + 1/6.".
   - The same lines in the colon or bare form ("Solve: 2x + 3 = 11") are caught. So is the English fractions template ("Work out 3/4 + 1/6").
   - What stands between him and the answer is the prompt's own rule, `HINT_WITHHOLD`.
   - (4) He can tell it worked: the card "Hint 1 of 2", a hint and an arrow line.
5. **Still stuck → hint 2.** Hint 1 goes in as `previous` (`route.ts:35`), and the prompt asks for ONE STEP FURTHER (`hint.ts:145-147`). The same leak guard applies, so the same gap.
6. **The lesson.** The picker sees the 8 maths lessons. For a quadratic inequality, "Solving a quadratic equation by factoring" is a fair partial pick. For a sequence or a line, "none" is a first-class answer (`pick.ts:27`), and the TV says "No lesson in tonight's library covers this one. The hint is all there is — and that is fine." (`MathsTV.tsx:1009`). D3 holds structurally. Pick quality is L2.
7. **Point & ask.** The presets are English. Mic speech recognition is `en-US` (`page.tsx:288`), so a Czech question is misheard. He would type instead. His question reaches the prompt as `The student asked: "…"`.
8. **Recap.** One tile shows his pages as icons, one lamp per hint, and the second-hint lamps lit (`screens.tsx:335-343`). It counts what was worked on and what needed a second hint, but never names a problem. The phone's parent line has "N hints" and no second-hint count (`recapRows.ts:104-116`). By design no problem text is shown.

## Scored criteria touched

| C | Result | Evidence |
|---|---|---|
| C1 (BLOCKER) no hint gives the answer | **uncertain (L2)**. Code backstop **absent** for his tasks | The prompt rule `hint.ts:88-89` is present. The code guard `hint.ts:113-115` + `maths.ts:232-240` reads none of 16 leaking lines (E2, E3). Fallback `withheldLine` is never reached, because no leak is ever detected. |
| C3 no claim to cover the maturita | pass | 0 hits for maturit\|cermat in `desk/src` UI (grep). The door caption makes no exam claim. |
| C6 a maturita-style task gets a fitting hint stance | **fail** | E1: the quadratic inequality, arithmetic sequence, line, system, log and combinatorics tasks all read `linear`, so the stance is "This sheet is a factoring and linear-equations unit" (`hint.ts:83`), for "a 15-year-old" (`voice.ts:69`). |
| C7 TV lines ≤ 25 words at B1 | pass on the fixed lines of this journey (door 19, page line 15, no-lesson 19). Hint lines are L2 | The prompt asks for "two or three sentences" (`hint.ts:133`): no word cap and no Czech. |

C2, C4 and C5 are not touched by MB1.

## Module metrics

| Metric (rubric unit) | L1 value |
|---|---|
| presses to first hint | **2** (Select on the homework door, Select on item 1; +1 Down per later item). Gate ≤ 4: pass |
| line length | fixed TV lines on MB1: 3 of 3 ≤ 25 words. Hint / next lines: L2 |
| answer leak | L2 (model output). Code guard on his tasks: 0 of 16 leaking lines refused (E2, E3) |
| hint helpfulness | L2 |
| page read rate (L2) | L2. Precondition: vision host |
| time to read page (L2) | L2 |

## Wiring audit

| Route / builder | Fields computed for a user-facing surface | Wired |
|---|---|---|
| `/api/read` → page | `items[].n`, `items[].text`, `readMs` | 3/3 (`MathsTV.tsx:968-985`) |
| `/api/hint` → hint | `hint1.hint`, `hint1.next`, `hint2.hint`, `hint2.next`, `askedQ`, `stage`, `lesson.title`, `lesson.why`, `noLesson` | 9/9 (`MathsTV.tsx:999-1040`, `tv/screens.tsx`) |
| recap `MathsTile` | `empty`, `sets`, `pages`, `hints`, `second` | 5/5 (`screens.tsx:334-347`) |

Total 17/17. Nothing unwired.

## Grounding audit (shared denominators)

| Surface | Score | Present (prompt line) | Absent |
|---|---|---|---|
| MB-READ | **2/5** | P1 photo (`read.ts:26`), P2 subject (`read.ts:27` `WHAT[subject]`) | P3 school system / notation, P4 topic or course, P5 age |
| MB-HINT | **4/8** | H1 problem (`hint.ts:148`), H2 previous hint (`hint.ts:146`, `route.ts:35`), H3 his question (`hint.ts:148`), H6 age band (`hint.ts:126` → `voice.ts:69`, **stated as "a 15-year-old"**) | H4 lesson / rule card (maths: none; `rule` is English-only, `route.ts:42`), H5 course path (on `school` the path only chooses the default stance, which names a "factoring and linear-equations unit", not School maths), H7 his working, H8 his slips |
| MB-PICK | **2/3** | L1 problem (`pick.ts:28`), L2 library (`pick.ts:25`) | L3 his course / topic |

Named additions for this Character, outside the score: the Czech language of the sheet, and his exam target (the maturita). Neither reaches any prompt.

## Executions

E1. What kind his tasks read as:
```
DESK_DATA_DIR=…/data/vojtech-18 node -e "require('./tools/ts-load.cjs'); const k=require('./desk/src/lib/rules/kinds.ts'); …k.readQuestion(t)…"
"Řešte v R nerovnici x^2 - 5x + 6 < 0."                      -> linear
"Solve the inequality x^2 - 5x + 6 > 0"                      -> linear
"In an arithmetic sequence a1 = 3 and d = 4. Find a10."      -> linear
"Find the equation of the line through A[1; 2] and B[3; 6]." -> linear
"Kolika způsoby lze vybrat 3 žáky z 10?"                     -> linear
"Solve 2^x = 16" / "log_2 8 = ?" / "Řešte soustavu x + y = 5, x - y = 1." -> linear
"Vypočtěte 3/4 + 1/6."  -> linear     "Work out 3/4 + 1/6" -> school {"shape":"compute","expr":"3/4 + 1/6"}
"Určete 35 % z 80."     -> linear     "Find 35% of 80."    -> school {"shape":"percent-of",…}
```
E2. The leak guard on answer-giving lines (`rules/maths leaks`):
```
not caught | Solve x^2 - 5x + 6 < 0 | Factor it: the roots are 2 and 3, so x is between 2 and 3.
not caught | Solve x^2 - 5x + 6 < 0 | The solution is the interval (2; 3).
not caught | Řešte v R nerovnici x^2 - 5x + 6 < 0. | x patří do (2; 3).
not caught | Solve x^2 - 4 = 0 | x = 2 or x = -2
not caught | In an arithmetic sequence a1 = 3 and d = 4. Find a10. | a10 = 3 + 9 · 4 = 39.
not caught | Find the 10th term of 3, 7, 11, ... | The 10th term is 39.
not caught | Find the equation of the line through A[1; 2] and B[3; 6]. | The line is y = 2x.
not caught | Kolika způsoby lze vybrat 3 žáky z 10? | 10 choose 3 is 120.
not caught | Solve 2^x = 16 | 2^4 = 16 so x = 4
not caught | Solve 2x + 3 = 11 | x = 4
not caught | Řešte rovnici 3(x - 2) = 2x + 5. | Takže x = 11.
not caught | Řešte soustavu x + y = 5, x - y = 1. | x = 3 and y = 2
withheld: Go back to the last step you are sure of and take the next. The answer stays yours to find.
```
E3. Why: the oracle needs a bare equation, or one after a colon (`afterLabel`, `maths.ts:362-365`):
```
"Solve 2x + 3 = 11"                  equationOf= null                 leaks('So x = 4.')= false
"Solve: 2x + 3 = 11"                 equationOf= "2x + 3 = 11"        leaks('So x = 4.')= true
"Řešte rovnici: 3(x - 2) = 2x + 5."  equationOf= "3(x - 2) = 2x + 5"  leaks('So x = 11.')= true
"Řešte rovnici 3(x - 2) = 2x + 5."   equationOf= null                 leaks('So x = 11.')= false
"1) 2x + 3 = 11"                     equationOf= null                 leaks('So x = 4.')= false
"Solve: x^2 - 5x + 6 = 0"            equationOf= "x^2 - 5x + 6 = 0"   leaks('The roots are 2 and 3.')= true
linear | "Vypočtěte 3/4 + 1/6." | "Výsledek je 11/12."  not caught   (school | "Work out 3/4 + 1/6" | "The answer is 11/12." LEAK-CAUGHT)
linear | "V pravoúhlém trojúhelníku jsou odvěsny 6 cm a 8 cm. Určete přeponu." | "Přepona je 10 cm." not caught
```

## Findings

| Key | Severity | Title |
|---|---|---|
| vojtech-18-MB1-1 | blocker | The code leak guard reads none of his tasks: Czech-printed, maturita shapes, and "Solve …" without a colon |
| vojtech-18-MB1-2 | major | Every maturita task gets the "factoring and linear-equations unit" stance, for "a 15-year-old" (C6) |
| vojtech-18-MB1-3 | major | The page read prompt carries no school system or notation (MB-READ 2/5) |
| vojtech-18-MB1-4 | major | Hints, presets and speech are English only, with no word cap (C7, L2) |
| vojtech-18-MB1-5 | minor | The recap counts hints and second hints but cannot say which problems (by design) |
| vojtech-18-MB1-6 | strength | Two presses to the first hint, and "No lesson" said plainly |

## Time saved and grounding

- Time saved: **~0–5 min saved · low**. On the half of his sheet that is linear algebra, a stepped hint beats the published key. The rest gets a primary-school stance and no code guard, so it is close to his "honestly little".
- Grounding: MB-READ 2/5 · MB-HINT 4/8 · MB-PICK 2/3.

## Voice: Vojtěch, first person

Tak co, zase kvadratický rovnice. I snap my teacher's sheet and press OK twice, and there is a hint. That is fast, I give it that.

But the hint is written for "a 15-year-old", and it thinks my sheet is about linear equations. My sheet is inequalities, sequences and a line through two points. It is all in English, and I put it through the translator on my phone. If a hint just tells me "x ∈ (2; 3)", I learn nothing. The desk says "hints, never the answer", but for my Czech sheet nothing in the code checks that. Only the model promises it.

When it has no lesson, it says so. Good, that I trust. Would I adopt it? For a Sunday, for the linear tasks, maybe. Would I tell a friend from class? Not before it knows what a maturita sheet is.
