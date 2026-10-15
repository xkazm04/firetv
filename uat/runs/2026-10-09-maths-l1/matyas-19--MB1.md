# matyas-19 × MB1 · Tonight's sheet, together

- Character: matyas-19 (Matyáš, 19, ČVUT first semester, Calculus 1 path), `uat/characters/maths/matyas-19.md`
- Journey: MB1, `uat/journeys/maths/MB1-tonights-sheet.md`
- Cert level: L1 (theoretical, no model call, no browser)
- Base commit: 12592a71
- **Verdict: L1-conditional.** The path is complete in code: homework door, snap, page, two hints, an honest "no lesson", a recap. It carries three confirmed majors. On his own Czech-worded sheet the Calculus leak check never runs. A completing step passes the leak check even on an English item. His weekly sheet can be hinted but never marked. The page read itself (C8) waits for the vision host.

## Reachable surface set

Profile: `type: other`, no age row, Mode row shown, system `cz` (irrelevant), Maths on, course `calc1`. I executed the rows (Executions, X1). They are Type, Mode [Family | Adult (18+)], School system, Interested in, Maths course [School maths | Calculus 1 | Calculus 2], Save/Back (`desk/src/tv/profileRows.ts:68-79`).

| Surface | Reachable | Gating |
|---|---|---|
| Tonight, two doors `homework`, `teach` | yes | `desk/src/tv/keys.ts:105-108` (executed: `['homework','teach']`) |
| `page` (snapped sheet), `hint` (stage 1, 2) | yes | `keys.ts:306-307` page.ask, `desk/src/lib/session/store.ts:527` page.reading opens `page` by itself, `keys.ts:357` Select = hint, `keys.ts:362` Still stuck = stage 2 |
| Phone `capture`, "Point & ask" | yes | `desk/src/app/phone/panelFor.ts:31`, `desk/src/app/phone/page.tsx:264` (`/api/hint` with `askedQ`, `itemIx`) |
| Lesson behind a hint | no lesson by design | `desk/src/app/api/hint/route.ts:171` (`judgeOf(path) === "calc"` gives no library), so `noLesson` is set (`store.ts:550`) |
| Units / Calendar | yes, empty | `keys.ts:116-121` (executed: 0 lessons on calc1), `desk/src/maths/MathsTV.tsx:1074`, `desk/src/tv/mathsRows.ts:196-197` |
| Recap (TV tile, phone Recap) | yes | `desk/src/tv/recapRows.ts:47-57`, `desk/src/tv/screens.tsx:335-344`, `page.tsx:624` |
| `prepare`, `worked` | unreachable | `keys.ts:106` (no third door off a school path); `hasWorked('calc1-chain')` = false (X1) |
| Marking his own sheet | **does not exist** | `/api/mark` needs `s.practice`, a desk-written set (`desk/src/app/api/mark/route.ts:327-328`); a page has no marking route (MB1-3) |

## Surface model (in order)

1. **Tonight, "I have homework"** (`MathsTV.tsx:556-586`, caption `MathsTV.tsx:427-433`). Select fires `subject` and then `page.ask` (X1). The phone moves to `capture` (`panelFor.ts:31`).
2. **Phone capture** sends `/api/read` (`page.tsx:165`). The pipeline is `desk/src/app/api/read/route.ts:240-257` → `desk/src/lib/desk/read.ts:201-215`, one vision call. **AI surface MB-READ.**
3. **Page** (`MathsTV.tsx:935-997`) shows the problems as read (`PrintRow text={x.text}`), the photo band, "read in N s", and the caption "Number N is under the lamp. Select for a hint — the next step, never the answer." Up and Down walk the items (`keys.ts:352-353`).
4. **Hint 1**: Select (`keys.ts:357`) → `/api/hint` → `desk/src/lib/desk/hint.ts:85-120`. The stance on his path is `calcStance` (`hint.ts:53-56`, `:62-66`), and the leak guard is at `hint.ts:75-83` and `:113-119`. **AI surface MB-HINT.**
5. **Hint 2**: "Still stuck" (`keys.ts:362`) sends `stage: 2`, and the previous hint goes into the prompt (`route.ts:155`, `hint.ts:107-108`).
6. **Lesson stop**: on calc1 the TV shows "No lesson for this", plus the quiet line "No lesson in tonight's library covers this one. The hint is all there is — and that is fine." (`MathsTV.tsx:1008`, `:1035`). MB-PICK is never called (`route.ts:171-172`).
7. **Point & ask** (phone): a typed question goes in as `askedQ` and reaches the prompt (`hint.ts:110`).
8. **Recap**: the TV tile draws one lamp per hint and rings the ones that needed a second hint (`screens.tsx:335`). The phone Recap lists "Needed a second hint: <problem>" (`page.tsx:624`), fed by `store.ts:545-546`.

## The walk (in character)

1. **Tonight.** *"Two doors, 'I have homework' and 'Teach me something'. No school stuff. Good."* The screen's ask is clear and the action is visible (one Select). It fits the goal: the caption says "hints, never the answer". He can tell it worked: the door turns to "Waiting for the photo" (`MathsTV.tsx:576`).
2. **Snap the sheet.** *"I photograph cvičení 5. It's in Czech: 'Vypočtěte lim x→0 sin(3x)/x', 'Derivujte y = sin(x²)'."* The TV opens `page` on its own (`store.ts:527`). Whether the read gives back his problems is a vision question (L2). The read prompt asks only for "the maths problems, with all symbols and exponents" and to keep the printed numbering (`read.ts:204-206`). Nothing in it fixes notation, so LaTeX output is possible. A LaTeX item would not be read by any of the desk's readers (MB1-4).
3. **Page.** *"Number 3 is under the lamp, Select for a hint."* All four questions pass: the action is visible, the item lifts, and the OK chip says Hint.
4. **Hint 1.** The stance is right for him: "a maths tutor for a first-year university student in Calculus I … name the rule that applies" (`hint.ts:55`). That is exactly his "tell me which rule I misapplied". But his item is worded in Czech, so `readQuestion` reads it as `linear` (X3). The hint's Calculus leak check is skipped. The only guard left is the linear-equation rule, and it lets "The limit is 3." and "The derivative is 2x cos(x^2)." through (X4) (MB1-1).
5. **Hint 2.** It "must go ONE STEP FURTHER" (`hint.ts:108`). On a one-rule item (chain rule, sin(3x)/x) one step further is the result. "Multiply cos(x^2) by 2x." passes the guard even on the English-read item (X4) (MB1-2). *"If it tells me 'multiply by 2x' I've been handed it."*
6. **No lesson.** "No lesson for this" plus one honest sentence. *"Fine, I didn't want a school algebra video."* C7 holds.
7. **Point & ask.** *"Why can't I just plug in 0?"* goes in as `askedQ`. All four questions pass.
8. **What he actually wanted.** *"Now tell me which of my ten I got wrong."* There is no route for that: marking exists only for the desk's own six-question sets (MB1-3). He is back to WolframAlpha for the checking.
9. **Recap.** Lamps for hints, rings for second hints, and the phone list of what needed a second hint. That is enough for him.

## Scored criteria

| Criterion | Result | Evidence |
|---|---|---|
| C1 BLOCKER: no hint gives the result before he answers | **uncertain (L2)**, with two confirmed guard gaps | The withhold rule is at `hint.ts:50-51`, `:94-104`. The guard is skipped on Czech items and does not catch completing steps (X3, X4; MB1-1, MB1-2) |
| C6 university voice | pass (designed) | `hint.ts:53-56`, `:88` (calc path takes the teen voice; the stance says first-year university) |
| C7 "no lesson" in one line, no school video | pass | `route.ts:171`, `MathsTV.tsx:1008`, `:1035`, `mathsRows.ts:196-197` |
| C8 his Czech MA1 page read into problems he recognises | uncertain (L2) | `read.ts:204-206`; precondition is the vision host (MB1-4) |

C2, C3, C4 and C5 are not touched (MB1 has no marking and no set).

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| presses to first hint | **2** (Select "I have homework", [photo], Select on the page; the page opens itself, `store.ts:527`). Good is ≤ 4 |
| line length | fixed TV lines on this path: **30/30 ≤ 25 words (1.0)** (X5). Model hint lines: L2 |
| answer leak | L2. The code guard is absent on Czech items and blind to completing steps (MB1-1, MB1-2) |
| hint helpfulness | L2 |
| page read rate | L2 (vision host) |
| time to read page | L2 (vision host) |

## Wiring audit

| Route / event | Computed user-facing fields | Wired | Unwired |
|---|---|---|---|
| `/api/read` → `page.read` (`read.ts:210-213`, `store.ts:532`) | items[].n, text, band, cx, cy; readMs; provider | 4/7 (n, text, band `MathsTV.tsx:948`, readMs `MathsTV.tsx:984`) | `cx`, `cy` (0 UI hits), `provider` (0 hits under maths/, tv/, app/phone, app/tv) |
| `/api/hint` → `hint.set` (`route.ts:165`, `:156`) | hint1.hint, hint1.next, hint2.*, askedQ, stage, problem, ms, provider | 7/8 (ms reaches the job line "hint in N s", `route.ts:167`) | `provider` |
| lesson job → `lesson.set` null → `noLesson` | noLesson | 1/1 (`MathsTV.tsx:1008`, `:1035`) | none |

Overall: **12/16**. Unwired: cx, cy, page provider, hint provider. These are engine and position metadata, polish. Not raised as findings.

## Grounding audit (shared denominators)

**MB-READ: 2/5**

| Source | In prompt? | Line |
|---|---|---|
| P1 photo | yes | `read.ts:203` `imageBase64` |
| P2 subject | yes | `read.ts:204` `WHAT[subject]` |
| P3 school system / notation | no | none |
| P4 topic or course in progress (Calculus 1) | no | none |
| P5 age or stage | no | none |

**MB-HINT: 5/8**

| Source | In prompt? | Line |
|---|---|---|
| H1 problem | yes | `hint.ts:110` |
| H2 previous hint | yes (stage 2) | `hint.ts:107-108`, `route.ts:155` |
| H3 his own question | yes (Point & ask) | `hint.ts:110` |
| H4 lesson / rule card | no (the rule card is English only, `route.ts:162`; calc1 has no lesson) | none |
| H5 course path | yes | `hint.ts:55` `calcWordsOf(path)` → "Calculus I", methods |
| H6 age or stage | yes (stage) | `hint.ts:55` "first-year university student" |
| H7 his working / attempt | no | none |
| H8 his recorded slips on the topic | no | none |

**MB-PICK: n-a.** It is not called on a calc path (`route.ts:171-172`).

## Executions

All run from ROOT with `DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/matyas-19`. Scripts are kept in that scratch dir.

**X1: gating.** `node -e "require('./tools/ts-load.cjs'); …profileRows({type:'other',…,mathPath:'calc1'}); tonightStops; topicStops; lessonsOn; hasWorked; tvKey(tonight,'select')"`
```
profile rows: Type of student[...] / Mode[Family|Adult (18+)] / School system[...] / Interested in[...] / Maths course[School maths|Calculus 1|Calculus 2] / [Save|Back]
tonightStops: [ 'homework', 'teach' ]
topics: 22 calc1-functions,…,calc1-chain,…,calc1-area-so-far,calc1-ftc,calc1-substitution,calc1-area-average
lessonsOn maths calc1: 0 | unitStops: 0
topics Select on calc1-chain -> hasWorked? false
Tonight Select (homework): [{"type":"subject","subject":"maths"},{"type":"page.ask","subject":"maths"}]
```

**X3: the hint's reader on his page items.** `node run2.cjs`, section G, `kinds.readQuestion(text)`:
```
Find lim_(x->0) sin(3x)/x                     {"kind":"calc","calc":{"shape":"limit","f":"sin(3x)/x","at":0}}
lim x→0 sin(3x)/x                             {"kind":"calc", …}
lim_{x \to 0} \frac{\sin 3x}{x}               {"kind":"linear","calc":null}
Vypočtěte lim x→0 sin(3x)/x                   {"kind":"linear","calc":null}
Vypočtěte limitu: lim x→∞ (3x^2+1)/(x^2-2)    {"kind":"linear","calc":null}
Spočtěte derivaci funkce f(x) = ln(x^2+1)     {"kind":"linear","calc":null}
Derivujte: y = sin(x^2)                       {"kind":"linear","calc":null}
Differentiate y = sin(x^2)                    {"kind":"calc", …}
Find dy/dx if x^2 + y^2 = 25                  {"kind":"linear","calc":null}
Find y' for y = tg(x^2)                       {"kind":"linear","calc":null}
Using the ε-δ definition, prove that lim x→2 (3x-1) = 5   {"kind":"linear","calc":null}
3. Vypočtěte ∫ x e^(x^2) dx                   {"kind":"linear","calc":null}
3. ∫ x e^(x^2) dx                             {"kind":"calc", …}
```
His bare notation "lim x→0 …" reads. Any Czech verb, a LaTeX transcription, `tg`, implicit equations and ε-δ items do not.

**X4: the leak guard hint.ts applies** (`leaks()` always; `leaksCalc` only when the item reads). `node run2.cjs`, section H:
```
Find lim_(x->0) sin(3x)/x :: The limit is 3.                       CAUGHT
Find lim_(x->0) sin(3x)/x :: Write sin(3x)/x as 3·sin(3x)/(3x) …   CAUGHT
Vypočtěte lim x→0 sin(3x)/x :: The limit is 3.                     passes
Vypočtěte lim x→0 sin(3x)/x :: You should get three.               passes
Differentiate y = sin(x^2) :: The derivative is 2x cos(x^2).       CAUGHT
Differentiate y = sin(x^2) :: Differentiate the outside to get cos(x^2), then multiply by 2x …   passes
Differentiate y = sin(x^2) :: Multiply cos(x^2) by 2x.             passes
Derivujte: y = sin(x^2) :: The derivative is 2x cos(x^2).          passes
Spočtěte derivaci funkce f(x) = ln(x^2+1) :: It comes out as 2x/(x^2+1).   passes
Find dy/dx if x^2 + y^2 = 25 :: You get dy/dx = -x/y.              passes
3. ∫ x e^(x^2) dx :: The answer is e^(x^2)/2 + C.                  CAUGHT
3. ∫ x e^(x^2) dx :: Substitute u = x^2 … = (1/2)e^u + C.          passes
```

**X5: line length of the fixed TV lines.** `node run3.cjs` → `share <= 25 words: 30/30` (the longest are the quotient-order and bounds-swapped slips and the limit fallback, at 24).

## Findings

- **matyas-19-MB1-1** (major, confirmed). Czech-worded items skip the Calculus leak check. The general rule passes "The limit is 3" and "The derivative is 2x cos(x^2)".
- **matyas-19-MB1-2** (major, confirmed guard gap). A step that completes the answer ("Multiply cos(x^2) by 2x", the u-substitution carried to (1/2)e^u + C) passes the guard on every item. The second hint is asked to go one step further.
- **matyas-19-MB1-3** (major, confirmed-absent). His own weekly sheet can only be hinted, never marked. His main job and the 20–30 min checking saving are not served.
- **matyas-19-MB1-4** (minor, uncertain, vision). The read prompt carries no course or notation (MB-READ 2/5). A LaTeX transcription reads as no Calculus item at all.
- **matyas-19-MB1-5** (strength). The Calculus 1 gating is clean: two doors, a 22-topic spine, an honest "No lessons for Calculus 1 yet", no school video, and the university stance.
- **matyas-19-MB1-6** (strength). Two presses from Tonight to the first hint, and every fixed TV line is ≤ 25 words.

## Time saved and grounding

- Time saved if it all worked: **~5 min saved per sheet · confidence low.** Hints on a stuck item replace a Stewart search or a week's wait for the cvičení. The checking saving in his Motivation (20–30 min per sheet) is not on offer, because his sheet is never marked (MB1-3).
- Grounding: MB-READ 2/5 · MB-HINT 5/8 · MB-PICK n-a.

## Voice: Matyáš (L1, over the designed experience)

Would I adopt it? For hints, maybe. It talks to me as a first-year student and it names the rule. That's what I said I wanted: "Don't tell me the answer, tell me which rule I misapplied." What delighted me is that it doesn't push a school video at me. "No lessons for Calculus 1 yet", fine, at least it's honest.

What frustrated me is that my sheet is in Czech. "Vypočtěte", "Derivujte". The thing that's supposed to stop the hint from blurting the limit only reads English, so on my own sheet it's off. The tutor is told not to give it away, sure. But the guard is there because the tutor slips, and on my sheet nobody's checking. And the second hint "one step further" on a chain-rule one-liner is the answer. "Multiply by 2x." Do háje, that's the whole exercise.

What's missing for my job is the checking. I came for "which of my ten did I get wrong and where". It can show my sheet and nudge me on one problem, but it can't mark my sheet. For that it wants me to do its own six questions instead. Not the same thing. My cvičení sheet is what the zápočet looks like.

Would I tell a peer? "It's a decent rubber duck for being stuck." Not yet "it checks your sheet."
