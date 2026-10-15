# nela-12 × MB1 · Tonight's sheet, together

- Character: nela-12 (Nela, 12, 6. ročník, Brno; profile `elementary`, age 12, system `cz`, School maths, Family)
- Journey: MB1 · Tonight's sheet, together
- Cert level: L1 (theoretical; no browser, no server, no model call)
- Base commit: 12592a71
- **Verdict: L1-fail.** One blocker-rank finding (nela-12-MB1-1): on her sheet's own notation (Czech `·` and `:`, decimal commas, a Czech instruction on the line, mixed numbers) the task reader returns null, so the hint's code leak check is blind and the stance says "factoring and linear-equations unit". The leak itself waits for L2, because what vision transcribes and what the model writes are not known. The core of the journey, the page read, is vision and stays uncertain.

## Reachable surface set

The gating, followed from the profile:

- Landing → Math Buddy: `desk/src/tv/keys.ts:286` (Select on the app, learner seated) → `openWaiting` (`keys.ts:253`) → Tonight (`MODULE_HOME`, `keys.ts:97`).
- Tonight shows three doors because her path is a school path: `keys.ts:105-107` (`PATHS[learnerPath(s)].school`). The doors are I have homework, Teach me something and Get ready for school; on a later evening a `continue` card comes first.
- Homework door → `page.ask` (`keys.ts:306-307`) → phone `capture` (`desk/src/app/phone/panelFor.ts:31`) → `/api/read` → `page.reading` puts the TV on `page` by itself (`desk/src/lib/session/store.ts:525-527`).
- `page` → Select → `/api/hint` (`keys.ts:357`) → `hint.set` puts the TV on `hint` (`store.ts:540-543`) → Still stuck → stage 2 (`keys.ts:362`). The lesson stop is "Six like this" when the task reads as a unit (`keys.ts:364-365`, `tv/mathsRows.ts:317`), otherwise the picked lesson.
- Phone "Point & ask" (`desk/src/app/phone/page.tsx:558`, `:263-264`) sends `askedQ` and `itemIx` to the same route.
- Recap: Menu on the landing (`keys.ts:273`) or the phone's End session (`page.tsx:354-358`). The recap is drawn by the shell (`desk/src/app/tv/page.tsx:201`) and the phone Recap tab (`page.tsx:615-626`).
- Voice: young band at 12 (`desk/src/lib/rules/voice.ts:34-38`).

Unreachable or out of scope for her: Calculus 1 and 2 (offered on the profile row, `desk/src/tv/profileRows.ts:77`, but not hers), the Paper panel, and Linga and Essay Master.

## Surface model (in order)

| # | Affordance | file:line | Route / pipeline | AI prompt sources |
|---|---|---|---|---|
| 1 | Tonight, door "I have homework" | `maths/MathsTV.tsx:421-433`, `tv/keys.ts:292-308` | `page.ask`, or `page.select` of the first maths page already on the desk | none |
| 2 | Phone Capture: Snap page → Use this page | `app/phone/page.tsx:417-457` | `POST /api/read` → `lib/desk/read.ts:25` vision | MB-READ: photo and subject only (`read.ts:27-30`) |
| 3 | Page: one problem under the lamp, Up/Down, Menu = photo/overview | `MathsTV.tsx:935-997`, `keys.ts:347-358` | none | none |
| 4 | Select = first hint | `keys.ts:357`, `app/api/hint/route.ts:42-47` | `lib/desk/hint.ts:86-120` text engine, `fast`; leak check `hint.ts:75-84`, re-ask once, then a code line (`hint.ts:119`) | MB-HINT, see the grounding audit |
| 5 | Lesson pick behind the hint | `app/api/hint/route.ts:50-56` | `lib/desk/pick.ts:23-35` (skipped when the task reads as a school unit: `route.ts:51`) | MB-PICK |
| 6 | Hint screen: "Still stuck" → hint 2, "Six like this" or "Show me the lesson" | `MathsTV.tsx:999-1040` | `/api/hint {stage:2}`, or `/api/practice {stay}` | MB-HINT with the previous hint |
| 7 | Phone Point & ask (tap item, type or say a question) | `app/phone/page.tsx:558-571` | `/api/hint {askedQ,itemIx}` | MB-HINT with H3 |
| 8 | End the evening → recap (TV tile and phone lines) | `tv/recapRows.ts:44-101`, `app/phone/page.tsx:615-626` | `session.end`; `/api/memory` (`lib/desk/memory.ts`) | MEM |

## The walk (in character)

**Step 1, Tonight (first evening).** No continue card, so the lamp is on "I have homework" and the caption reads "Snap the sheet on the phone and the desk reads it, one problem at a time — hints, never the answer." (21 words).
1. Does she know what the screen wants? Yes. "Homework", "sheet", "snap" are simple words, and Mum reads the caption aloud.
2. Is the action visible? Yes: OK on the lit door.
3. Does she connect it to her goal? Yes. It is literally "I have homework".
4. Can she tell it worked? Yes: "Waiting for the photo" appears on the door (`MathsTV.tsx:571`) and the phone jumps to Capture (`panelFor.ts:31`).

**Step 2, snap the sheet.** Phone camera, Snap page, Use this page. The TV goes to the page by itself and says "Reading the page…".
1–4: yes. The read itself (does "3/4 · 2/3" come through as she sees it on paper?) is vision: **uncertain**, waiting for L2.

**Step 3, the page.** "Number 1 is under the lamp. Select for a hint — the next step, never the answer." (17 words). Up/Down walk the items. Menu shows the photo.
1–4: yes. Mum can see the band on the photo and knows which problem is meant.

**Step 4, first hint.** One press. The card shows "Hint 1 of 2 · A first look", the hint, and an arrow line with what to write.
1. She knows what to do: read the card. In English, so Mum translates.
2–3. Yes.
4. Yes: "Still stuck" is lit next.

Whether the hint names a concrete thing (C5) and stays short (C4) is model output: L2. **Code side:** on a task the school reader reads ("1) 3/4 + 1/6 ="), the hint is checked by `leaksSchool` and the stance names "Add and subtract fractions". On her real Czech sheet items the reader returns null (executed below): "2/3 · 3/4", "3/4 : 1/2", "2,5 · 0,4", "0,4 + 1,25", "Vypočítej: 3/4 + 1/6", "2 1/2 + 1/4". The model is then told the sheet is "a factoring and linear-equations unit" (`hint.ts:44-46`, `:66`). The only check left is `leaks()`, which substitutes into an equation in x and so cannot catch "so the answer is 1/2" on a fraction task (executed: `false`). If a hint leaked twice, the fallback is the generic 20-word "Go back to the last step you are sure of…".

**Step 5, still stuck.** Right to "Still stuck", Select. Hint 2 sees hint 1 and is told to go one step further (`hint.ts:107-109`). Same checks, same gap. After hint 2 the stop reads "That's both hints".

**Step 6, lesson.**
- On a read fractions task the second stop is "Six like this", a code-written set on the unit, and the hint stays on screen. That is good: it bridges to MB2. The worked lesson for that unit (`lib/library/worked.ts`) is not offered from here, so DoD 3 ("the lesson opens at the part that matters") is only partly met.
- On an unread Czech-notation task, the picker is asked to choose from a library of linear-equation and quadratic videos (`lessons.data.ts:15-22`). Its prompt makes "none" first-class. If it says "none" she sees "No lesson in tonight's library covers this one. The hint is all there is — and that is fine." (19 words), which is honest. A wrong pick is possible: L2.

**Step 7, the next evening.** Nela comes back with tonight's sheet. The hero says "Back to the sheet" (yesterday's), and "I have homework" also opens yesterday's sheet. Executed: `page.select pageIx 0`, no `page.ask`. Pages are never cleared except by the bench's Reset (`app/tv/page.tsx:148`).
1. She does not know why the desk shows yesterday's problems.
2. The way to a new sheet is hidden: the phone's Capture tab.
3–4. She gets there only if Mum finds the tab.
This is nela-12-MB1-2.

**Step 8, end of evening, recap.** The tile shows pages and hint lamps. The phone shows "Math Buddy - 1 page; 3 hints" and "Needed a second hint: 3/4 + 1/6". **The caption says "Good evening's work - all of it right."** Nothing was marked (executed). From the second evening on, the hint count and the second-hint list also carry earlier evenings (executed). Both are filed in MB5 (nela-12-MB5-1, nela-12-MB5-2) because they are the parent's recap. Here they break DoD 5.

## Scored criteria touched

| C | Result | Evidence |
|---|---|---|
| C1 (BLOCKER) no answer before she answered | **uncertain (L2)**, code backstop missing on Czech notation | `hint.ts:75-84` leak check only reads with a spec; specs are null for `·`, `:`, comma, Czech verb, mixed numbers (repro E1, E2). For read tasks `leaksSchool` catches "makes 11/12", "eleven twelfths", "1,0" (repro E10). The prompt forbids the answer (`hint.ts:50-51`, `:93-104`). |
| C4 ≤25 words per line she acts on | **fail** (fixed lines), model lines L2 | The withheld lines shown after two leaks are 31–54 words for her units (repro E6). Captions on this path are ≤21. |
| C5 first hint names one concrete thing | uncertain (L2) | The prompt asks for it ("what_to_try_next is one concrete thing", young manner "point at one thing on their paper", `voice.ts:47-49`); output is the model's. |
| C7 ≤4 presses Tonight → first hint | **pass** | First evening: Select (door) → photo → Select on item 1 = **2 presses**; item 3 = 4. With a continue card: +1 Right. |
| C2, C3, C6, C8 | n/a for MB1 | No marking on this journey. |

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| presses to first hint | **2** (item 1, first evening); 3 with a continue card present |
| line length | fixed-line catalogue for her units (captions, withheld lines, desk lines): **46/58 = 0.79** ≤25 words (below 0.9); hint text is L2 |
| answer leak | 0 in code-written lines (withheld lines carry no digit, by construction); model lines **L2** |
| hint helpfulness | L2 |
| page read rate, time to read page | L2 (precondition: vision host) |

## Wiring audit

| Route / event | User-facing computed fields | Wired | Unwired |
|---|---|---|---|
| `/api/read` → `page.read` | items[].n, .text, .band, readMs ("read in N s", `MathsTV.tsx:983`) | 4/4 | none (provider is internal) |
| `/api/hint` → `hint.set` / `hint.stage` | hint1.hint, hint1.next, hint2.*, askedQ (`MathsTV.tsx:1022`), stage | 5/5 | none |
| lesson job → `lesson.set` | lesson.title, why, youtube; noLesson | 4/4 | none |
| recap tiles | sets, pages, hints, second (`tv/screens.tsx:335-343`) | 4/4 | none, but see MB5-2: the values are cumulative |

## Grounding audit (shared denominators)

**MB-READ 2/5.**
- P1 photo: present (`read.ts:26`).
- P2 subject: present (`read.ts:27`, `WHAT[subject]`).
- P3 school system: absent.
- P4 topic: absent.
- P5 age: absent.
- Named addition: none. The prompt asks for exponents with `^`, and the integer `number` field cannot hold "a)" or "b)" labels.

**MB-HINT 4/8.**
- H1 problem: present (`hint.ts:110`).
- H2 previous hint: present at stage 2 (`hint.ts:107`, route `:35`).
- H3 her question: present via Point & ask (`hint.ts:110`).
- H4 lesson or rule card: absent for maths (`rule` is English-only, `route.ts:42`), although `WORKED_METHODS` holds her unit's steps.
- H5 course path: absent on her path (only a Calculus path reaches the prompt).
- H6 age: present (young voice, `hint.ts:87`, `:105`).
- H7 her working: absent.
- H8 recorded slips: absent.
- The unit name reaches the stance only when the task reads (`hint.ts:57`, `:92`).

**MB-PICK 2/3.**
- L1 problem: present (`pick.ts:27`).
- L2 library: present (`pick.ts:24`).
- L3 course or topic: absent.
- Only asked for tasks the school reader does not read.

**MEM, no score.** Topic, marked counts, "Hints asked for" (`s.log.hints`, cumulative, see MB5-2), the set's rows with slip lines and working, and the notes already kept (`memory.ts`). No homework page content.

## Executions

All were run from ROOT with `DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/nela-12`. The scripts are in `C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/nela-12/scripts/`.

- **E1** `node …/scripts/e1.cjs`: `specFromQuestion` and `readQuestion` on Czech sheet lines.
  ```
  "3/4 + 1/6" -> compute, kind school       "1) 3/4 + 1/6 =" -> compute, kind school
  "Vypočítej: 3/4 + 1/6" -> null, kind linear   "2/3 · 3/4" -> null, linear
  "3/4 : 1/2" -> null, linear               "2,5 · 0,4" -> null, linear
  "0,4 + 1,25" -> null, linear              "2 1/2 + 1/4" -> null, linear
  "2/3 x 3/4" -> compute (frac-mul-div)     "2.5 × 0.4" -> compute (dec-arith)
  ```
- **E2** `node …/scripts/e2.cjs`: the leak check on a line that states the answer.
  ```
  "2/3 · 3/4"  "…gives 6/12, so the answer is 1/2."   leaks: false | leaksSchool: n/a (no spec)
  "2/3 x 3/4"  same line                              leaks: false | leaksSchool: true
  "3/4 : 1/2"  "…3/4 × 2/1 = 6/4 = 1 1/2."            leaks: false | leaksSchool: n/a
  "Vypočítej: 3/4 + 1/6" "…9/12 + 2/12 makes 11/12."  leaks: false | leaksSchool: n/a
  "2,5 · 0,4"  "…put the comma back: 1,0."            leaks: false | leaksSchool: n/a
  ```
- **E10** `node …/scripts/e10.cjs`: `leaksSchool` on read tasks.
  - "So 9/12 + 2/12 makes 11/12." → true; "You get eleven twelfths." → true; "That gives 1,0." → true.
  - Czech words "To je jedenáct dvanáctin." → **false**; "Je to jedna celá nula." → **false**.
- **E5** `node …/scripts/e5.cjs` (reducer, two evenings).
  - Evening 2 Tonight stops `["continue","homework","teach","prepare"]`.
  - Select on homework → `[{"type":"subject"…},{"type":"page.select","pageIx":0},{"type":"nav","screen":"page"}]`.
  - Evening 2 recap before any work: `Math Buddy - 1 hint`, hard `["3/4 + 1/6"]`, caption `Good evening's work - all of it right.`
- **E6** `node …/scripts/e6.cjs`: word counts of fixed lines. Withheld lines: frac-add-sub 31, frac-mul-div 34, frac-equivalent 45, frac-of-amount 33, dec-arith 54. Total **46/58 ≤ 25 words**.

## Findings

| Key | Sev | Title |
|---|---|---|
| nela-12-MB1-1 | blocker (rank 27, uncertain) | Czech notation is not read: no code leak check, a linear-equations stance, a picker on a linear library |
| nela-12-MB1-2 | major (9) | The next evening, "I have homework" reopens the first sheet ever snapped and never asks for tonight's |
| nela-12-MB1-3 | minor (3) | Withheld lines for her units are 31–54 words (C4) |
| nela-12-MB1-4 | minor (6, uncertain) | MB-READ 2/5: no school system, topic or age in the read; integer item numbers cannot hold a), b) |
| nela-12-MB1-5 | minor (6, uncertain) | MB-HINT 4/8: no method card, no working, no recorded slips |
| nela-12-MB1-6 | strength | Two presses to a hint, the phone follows by itself, two hint stages with a re-ask and a code fallback, an honest "no lesson" |
| nela-12-MB1-7 | strength | `leaksSchool` catches the answer in digits, words, decimal comma and percent on a read task |

The recap defects that break DoD 5 are nela-12-MB5-1 and nela-12-MB5-2.

## Time saved and grounding

- **~15 min saved per sheet · confidence low.** The file promises 15–20 min if it all worked. The read is unverified, and the second evening needs the phone's Capture tab to get past yesterday's sheet.
- Grounding: MB-READ 2/5, MB-HINT 4/8, MB-PICK 2/3.

## Voice — Nela, first person

To je dobrý, dvakrát zmáčknu a mám nápovědu. Two presses and the hint is there, on the big TV, not Mum's phone. I like that it says "the next step, never the answer", because then it still counts as mine in class.

But the card is in English, and Mum has to read it out to me. If it is long, I stop listening. The "go back to the last step" line is useless; I don't know which step.

The next evening it showed yesterday's sheet again. I pressed homework and got the old problems, and Mum had to find "Capture" on the phone. Blbost.

The recap said "all of it right". Nobody checked anything! The teacher checks it tomorrow. If the TV says all right and I get red, I won't believe it again.

Our sheets have the dot for times and the colon for divide, and commas. I don't know whether the TV understands them, and it sounds like nobody checks that the hint doesn't just say the answer then. Mum would notice if it did, and then it's not my homework.

Would I tell Bára? Maybe, if the hints are short. For now it's "the TV that helps with the first problem".
