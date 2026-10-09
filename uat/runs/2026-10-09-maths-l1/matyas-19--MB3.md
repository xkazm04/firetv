# matyas-19 × MB3 · My Calculus course, checked

- Character: matyas-19 (Matyáš, 19, ČVUT first semester, Calculus 1 path), `uat/characters/maths/matyas-19.md`
- Journey: MB3, `uat/journeys/maths/MB3-my-calculus-course.md`
- Cert level: L1 (theoretical, no model call, no browser)
- Base commit: 12592a71
- **Verdict: L1-fail.** Two classes of false tick, each a blocker (C2), executed:
  - a decimal estimate within 0.5% of an exact limit or definite integral is ticked right (2.999 and 3.014 for 3; 0.4996, the value at x = 0.1, for 1/2; 9.04 for 9);
  - `ln x + C` is ticked right for ∫ 1/x dx.

  Equivalent forms are judged excellently: 0 false rings in 84 decided verdicts. Beside the blockers there are confirmed majors:
  - implicit differentiation cannot be practised;
  - the 40-character typed cap cuts quotient-rule answers;
  - an "unsure" item says "I got something different";
  - the pen never lands on working written in prime notation.

## Reachable surface set

The profile is executed in MB1 (X1): `type: other`, course `calc1`.

| Surface | Reachable | Gating |
|---|---|---|
| Profile Maths course row (Calculus 1) | yes | `desk/src/tv/profileRows.ts:77`, `desk/src/lib/library/paths.ts:83-91` |
| Tonight, two doors | yes | `desk/src/tv/keys.ts:105-108` |
| Topics on the 22-topic Calculus 1 spine | yes | `keys.ts:181`, `paths.ts:90`; Select starts a set directly (`keys.ts:453`, `hasWorked` false) |
| `practice` (six questions on paper) | yes | `/api/practice` → `desk/src/lib/desk/items.ts:135` `makeCalcItems` |
| Phone practice: snap or type | yes | `desk/src/app/phone/page.tsx:471-497`, `/api/mark` (`desk/src/app/api/mark/route.ts:343-349`) |
| `sheet`, `walk`, slip card, Calculus graph | yes | `desk/src/maths/MathsTV.tsx:864-933`, `:825-826` (`Plot`) |
| Explain (phone, on a walked item) and one typed second go | yes | `page.tsx:336`, `:348`; `desk/src/lib/desk/explain.ts:137-166`, `desk/src/lib/desk/mark.ts:241-243` |
| Hints on a snapped course sheet | yes (MB1's path) | see `matyas-19--MB1.md` |
| Units "No lessons for Calculus 1 yet" | yes | `MathsTV.tsx:1074-1079`, `desk/src/tv/mathsRows.ts:196-197` |
| `worked`, `prepare`, Calculus 2 | unreachable | `keys.ts:453` (no worked lesson for a calc topic), `keys.ts:106`; calc2 only by a profile switch |

## Surface model (in order)

1. **Profile, Maths course row** (`profileRows.ts:77`) sets `mathPath: 'calc1'` (`keys.ts:327`).
2. **Tonight "Teach me something"** (`keys.ts:303`) → Topics, with focus on the frontier (`keys.ts:187-191`).
3. **Topics** (`MathsTV.tsx:588-613`) show the strand, "six questions a set" and the topic blurb. Select → `/api/practice` (`keys.ts:216-221`) → `makeItems` → `makeCalcItems` (`items.ts:297-335`). **AI surface MB-SET**: the model writes specs only; code keeps those that are well formed, prints the question, and orders by difficulty (`items.ts:314-328`).
4. **Practice** (`MathsTV.tsx:751-789`): "Work all six on paper, then snap the whole sheet with the phone".
5. **Phone**: snap → `markSet` (`mark.ts:182-203`), one vision read (**AI surface MB-MARK**, `calcPrompt` `mark.ts:110-122`). Or type → `markTyped` (`mark.ts:224-234`), code only. Both go through `judgeSet` → `judgeItem` → `settleSpec` → `checkAnswer` (`kinds.ts:100-111`, `desk/src/lib/rules/maths.ts:153-163`, `desk/src/lib/rules/calc.ts:161-197`). On a wrong item with working, the pen comes from `chainPen` (`kinds.ts:106-108`).
6. **Sheet / Walk**: a tally, a ring or a tick per item, the slip title (`MathsTV.tsx:816`), the desk's line (`it.said`), "look at" (`lookAt`), and a graph under the card (`MathsTV.tsx:826`).
7. **Explain** (phone, "Tell the desk how you got there"): `explainCalc` (`explain.ts:137-166`). **AI surface MB-EXPLAIN.** It can settle an unsure item, or rename a wrong item's slip from the conversation (`explain.ts:213-222`).
8. **Second go** (typed, once): `secondGo` (`mark.ts:241-243`), code only.

## The walk (in character)

1. **Profile.** *"Maths course: School maths | Calculus 1 | Calculus 2. Calculus 1."* All four questions pass.
2. **Tonight, Topics.** *"Two doors. Topics: 'Functions, and new functions from old' … 22 of them."* To reach "The chain rule and implicit differentiation" he walks nine steps right from the first topic (focus is on the frontier, which is the first topic while nothing is secure). It's a lot of presses, but the action is visible. On the way he passes "The area-so-far function" (`desk/src/lib/library/calculus1.spine.ts:174`). That is his named pet peeve, an American course word (MB3-10).
3. **The set.** He wants chain rule *and implicit differentiation*: that's the zápočet this month. The topic's only shape is `derivative` of a function of x (`calculus1.spine.ts:111-114`, `calc.ts:27-37`). An implicit question ("dy/dx if x² + y² = 25") is not a shape and does not read (MB1 X3). The topic name promises half a topic (MB3-3). Whether the six are composite functions is the model's choice; code checks only that each is well formed (MB3-9, L2).
4. **Answering, typed.** *"Six answers on the phone."* Most of his forms are judged right: `e^(x^2)·2x`, `2x e^(x²)`, `sec^2 x`, `1/cos^2 x`, `1+tan(x)^2`, `5(3x^2+1)^4*6x` (X1-A). But a quotient-rule answer like `(2x*cos(x^2)*(x^3+1)-3x^2*sin(x^2))/(x^3+1)^2` is 45 characters. The phone box stops at 40 (`page.tsx:490`). The cut answer is unreadable, so the item comes back "not sure" (X1-A; MB3-4). *"I typed the right thing and it says it got something different."* The unsure line is exactly that sentence (X1-D; MB3-5).
5. **Answering, Czech habits.** `0,5` (decimal comma), `tg(x)^2+1`, `+ K`: each is "not sure", never wrong (X1-B/C; MB3-6). C3 holds on the verdict. The words do not (MB3-5).
6. **The marked sheet.** A sign slip is named by code, and the pen lands on the right line (X2-F, row 4: pen 2). A dropped chain factor is "wrong" with no slip named on the typed route (X1-D; MB3-8). On the photo route the slip is the vision model's pick from a closed list (L2). If his working is written the way Czech students write the chain rule, `y' = cos(x^2) · (x^2)'`, or with a `u = x^2` line, every line is null to the chain checker. Then there is no pen at all (X2-F; MB3-7). *"Show me the line"* is the one thing he asked for.
7. **Where he gets a tick he shouldn't.** On the limit topic, plugging x = 0.01 into sin(3x)/x gives 2.9996. The desk ticks it right. So it does for 2.999, 3.01, 3.014 and 2.986 for a limit of exactly 3, for 0.4996 (the value at x = 0.1) for 1/2, and for 9.04 for ∫₀³ x² = 9 (X2-E; MB3-1). On antiderivatives, `ln x + C` for ∫ 1/x is ticked right (X1-C; MB3-2). A cvičení TA marks both wrong. These are false ticks, a C2 BLOCKER.
8. **Explain.** *"I used the chain rule, then simplified."* The reply is in a university stance (`explain.ts:147`). But his answer, his working and the slip the desk found are not in the prompt (`explain.ts:152-163`), so it cannot point at his line (MB3-11).

## Scored criteria

| Criterion | Result | Evidence |
|---|---|---|
| C1 BLOCKER no result before he answers | uncertain (L2) | Set prompt: specs only, never work out (`items.ts:209-212`, `:249`). Explain replies are checked with `leaksCalc` (`explain.ts:220`). Hints on a snapped sheet: see MB1-1 and MB1-2 |
| C2 BLOCKER no wrong answer ticked right | **fail** | X2-E: 13 decimal estimates ticked; X1-C: `ln x + C` ticked (MB3-1, MB3-2) |
| C3 equivalent form never wrong; can't compare means "not sure" | pass on verdicts (0 false rings in 84 decided; Czech forms unsure, not wrong) | X1-A/B/C. The unsure line's wording contradicts it (MB3-5) |
| C4 the slip named is his slip | uncertain (L2) | Code names only `sign` and `lost-constant` (`calc.ts:143`, `:187-188`). The rest are the vision model's pick (`maths.ts:162`). Pen gaps (MB3-7) |
| C5 a chain-rule set uses composite shapes | uncertain (L2) | Nothing in code requires it (`items.ts:314-325`, MB3-9) |
| C6 first-year university voice | pass (designed) | `items.ts:209`, `explain.ts:147`, `hint.ts:55` |
| C7 no lesson said in one line | pass | `mathsRows.ts:196-197` (18 words with "Back returns to Tonight.") |
| C8 his snapped sheet gets hints in the course's methods | uncertain (L2), see MB1 | `hint.ts:53-56`; vision host |

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| false ticks | **15** in the executed probe (13 decimal estimates in X2-E, plus 2 spellings of `ln x + C` in X1-C). Any one is a blocker |
| false rings | **0** (84 decided verdicts on realistic forms, X1-A/B/C) |
| marking agreement | **81/84 = 0.964** on the realistic probe (X1-A/B/C; disagreements 2.999, `ln(x) + C`, `ln x + C`). Good is ≥ 0.98. Estimate probe X2-E: 6/19 |
| unsure rate | **11/95 = 0.12** across the X1 probe (`tg`, decimal comma, `+ K`, `+ C1`, `0/0`, `neexistuje`, two cut answers, `+C` on a definite integral). Good is ≤ 0.2 |
| set fit | L2 (model writes the specs) |
| slip precision | code-named slips (sign): exact by construction (`calc.ts:143`). Model-picked slips: L2 |
| answer leak | L2 (explain is guarded by `leaksCalc`; hints see MB1) |
| line length | fixed lines 30/30 ≤ 25 words (MB1 X5) |
| time to marked sheet (typed) | L2. Typed marking is synchronous code with no engine call (`mark.ts:224-234`) |
| recovery fidelity | n-a (no paper on this journey) |

## Wiring audit

| Route / event | Computed user-facing fields | Wired | Unwired |
|---|---|---|---|
| `/api/practice` → `practice.set` (`desk/src/app/api/practice/route.ts:463`, `:473`) | items[].n, question, spec, stem, part, stretch; tries; provider | 6/8 (spec → `Plot` `MathsTV.tsx:826`, stem `MathsTV.tsx:765`, stretch `Stepped`) | `tries`, `provider` (the TV never reads the HTTP reply) |
| `/api/mark` → `practice.marked` (`mark/route.ts:350-353`) | verdict, slip, said, slipAt, studentAnswer, studentWorking, unsure count, CalcVerdict.why, provider | 7/9 (studentWorking via `desk/src/maths/working.ts:38-39` workingLines; unsure count in the job line `route.ts:354`) | **`why`**: computed by `checkAnswer` (`calc.ts:82-95`, `:161-196`) and dropped in `settleSpec` (`maths.ts:160-162`). `provider` |

Overall: **13/17**. The unwired field that matters is `why`. The checker knows "This is a rounded decimal; the desk asks for the exact value", "The desk cannot read this answer as mathematics" and "A derivative has no arbitrary constant in it". The learner reads "I got something different for number N" instead (MB3-5).

## Grounding audit (shared denominators)

**MB-SET: 4/7**

| Source | In prompt? | Line |
|---|---|---|
| Q1 topic | yes | `items.ts:239` name and blurb; `:243` the topic's shapes |
| Q2 level / stretch | no (stretch only flags the record, `items.ts:26-29`) | none |
| Q3 past results on the topic | yes (slips only) | `items.ts:233-237` |
| Q4 school system | no | none |
| Q5 course path | yes | `items.ts:209` `calcWordsOf(pathOfTopic)` → "a university Calculus 1 desk" |
| Q6 aim (what school is about to teach) | no | none |
| Q7 age or stage | yes (stage) | `items.ts:209` "university" |

Named addition: desk memory notes (`items.ts:240`).

**MB-MARK: 4/6 (3/6 counting prompt only)**

| Source | In prompt / verdict? | Line |
|---|---|---|
| K1 photo | yes | `mark.ts:194` |
| K2 the set's items as issued | yes | `mark.ts:95-112` `calcSheet` |
| K3 code's spec | yes, in the code verdict (not the prompt) | `kinds.ts:104`, `maths.ts:160` |
| K4 school system | no: passed to `settleSpec` but unused for a calc spec (`maths.ts:159-160`), and not in the prompt | none |
| K5 the topic's slip vocabulary | yes | `mark.ts:192`, `:119` |
| K6 age or stage | no | none |

**MB-EXPLAIN: 3/8**

| Source | In prompt? | Line |
|---|---|---|
| X1 item | yes | `explain.ts:154` |
| X2 his answer | no | none |
| X3 slip detected | no (only the vocabulary) | none |
| X4 his explanation | yes | `explain.ts:156` |
| X5 his working | no | none |
| X6 age or stage | yes (stage) | `explain.ts:147` |
| X7 school system | no | none |
| X8 his history on the topic | no (general memory only, a named addition, `explain.ts:157`) | none |

**MB-HINT**: 5/8, as in MB1. **MB-WORKED** and **MB-PICK**: unreachable or not called on calc1.

## Executions

Run from ROOT with `DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/matyas-19 node C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/matyas-19/run1.cjs` (and `run2.cjs`). Both load `tools/ts-load.cjs` and call `rules/calc` `checkAnswer`, `rules/kinds` `judgeSet`/`judgeItem`/`readQuestion`, `rules/maths` `settleSpec`/`typedAnswersProblem`, and `rules/chain` `chainChecks`/`chainPen`.

**X1-A: equivalent forms (excerpt)**
```
d/dx e^(x^2): 2x*e^(x^2) | e^(x^2)*2x | e^(x^2)·2x | 2xe^(x^2) | 2x e^(x²) | 2x·e^{x^2} | y' = 2x e^(x^2) | 2x exp(x^2)   right (all)
d/dx e^(x^2): e^(x^2)              wrong        -2x e^(x^2)   wrong/sign      2x e^(x^2) + C   wrong (extra constant)
d/dx sin(x^2): 2x cos(x^2) | cos(x^2)*2x | 2xcos(x^2) | 2x cos x^2 | 2x·cos(x²)   right;  cos(x^2) wrong
d/dx (3x^2+1)^5: 30x(3x^2+1)^4 | 5(3x^2+1)^4*6x   right;  5(3x^2+1)^4 wrong
d/dx tan(x): sec(x)^2 | sec^2(x) | sec^2 x | 1/cos(x)^2 | 1/cos^2(x) | 1/cos^2 x | 1+tan(x)^2 | 1/cos²x   right;  tg(x)^2+1  unsure (unreadable)
wellFormed arctg(x^2)  {"ok":false,"why":"The desk cannot read the function."}
d/dx sin(x^2)/(x^3+1) full (45 chars)   right
  same, cut at 40 (phone maxLength)     unsure <- "(2x*cos(x^2)*(x^3+1)-3x^2*sin(x^2))/(x^3"
typedAnswersProblem 6 answers, one 45 chars   "Answer 4 is longer than 40 characters. Shorten it and send again."
```
**X1-B: limits (excerpt)**
```
lim sin(3x)/x, x->0: 3 right | 3/1 right | 1 wrong | dne wrong | 2.999 RIGHT
lim (1-cos x)/x^2: 1/2 | 0.5 | .5 | 0.50 right;  0,5 unsure;  neexistuje unsure
lim (1+1/x)^x, inf: e | e^1 | exp(1) | 2.718 right;  2,718 unsure
lim 1/x, 0+: inf | ∞ | +∞ | infinity right;  -inf wrong/sign
wellFormed lim 1/x x->0 (two-sided)  {"ok":false,"why":"The limit does not exist."}
```
**X1-C: antiderivatives**
```
int x e^(x^2): e^(x^2)/2 + C | 1/2 e^(x^2) + C | 0.5e^(x^2)+C | e^(x^2)/2 + c   right
               e^(x^2)/2   wrong/lost-constant;   + K   unsure;   + C1   unsure
int 1/x: ln|x| + C | ln(abs(x)) + C   right;   ln(x) + C   RIGHT;   ln x + C   RIGHT
int_0^1 x e^(x^2): (e-1)/2 | e/2 - 1/2 | 0.859 right;  0,859 unsure
```
**X1-D: what the desk says (typed `judgeSet`)**
```
Differentiate f(x) = sin(x^2). :: "cos(x^2)"        {"verdict":"wrong","said":"I got something different for number 1. How did you get there?"}
Differentiate f(x) = sin(x^2). :: "-2x cos(x^2)"    {"verdict":"wrong","slip":"sign","said":"The size is right but the sign is not. …"}
Differentiate f(x) = e^(x^2). :: "2x e^(x^2) + C"   {"verdict":"wrong","said":"I got something different for number 1. How did you get there?"}
Differentiate f(x) = tan(x). :: "tg(x)^2+1"         {"verdict":"unsure","said":"I got something different for number 1. How did you get there?"}
Find lim_(x->0) (1-cos(x))/x^2. :: "0,5"            {"verdict":"unsure","said":"I got something different for number 1. How did you get there?"}
model slip pick "forgot-chain" on a wrong item -> kept ("A function sits inside another here. …"); on a right item -> dropped
```
**X2-E: numeric estimates (TOLERANCE.limit/definite-integral rounded = 5e-3, `calc.ts:58-59`)**
```
lim sin(3x)/x = 3:   2.999 right | 3.01 right | 3.014 right | 2.986 right | 2.9996 (value at x=0.01) right | 2.955 (x=0.1) wrong
lim (1-cos x)/x^2 = 1/2:  0.4996 (value at x=0.1) right | 0.498 right | 0.502 right | 0.4975 right | 0.49 wrong
lim (1+1/x)^x = e:   2.717 (value at x=1000) right | 2.71 right | 2.72 right | 2.7 wrong
derivative-at f=x^3 at 2 (=12): 12.01  unsure     (an exact shape asks for the exact value)
int_0^3 x^2 (=9): 8.99 right | 9.04 right
```
**X2-F: the pen (`chainChecks`, `chainPen`)**
```
(3x^2+1)^5 | y' = 5(3x^2+1)^4 // y' = 5(3x^2+1)^4                          checks [false,true]       pen 0
(3x^2+1)^5 | y' = 5(3x^2+1)^4 · (3x^2+1)' // = 5(3x^2+1)^4 · 6 // = 30(3x^2+1)^4   [null,null,true]  pen null
(3x^2+1)^5 | y' = 5(3x^2+1)^4 · 6x // = 30x(3x^2+1)^4 // = -30x(3x^2+1)^4   [true,true,false]         pen 2
sin(x^2)   | y' = cos(x^2) · (x^2)' // y' = cos(x^2) · x                      [null,null]               pen null
sin(x^2)   | u = x^2, u' = 2x // y' = cos(u)·u' // y' = 2x cos(x^2)           [null,null,null]          pen null
sin(3x)/x  | lim_(x->0) sin(3x)/x = lim_(x->0) 3·sin(3x)/(3x) // = 3·1 // = 1   [null,null,null]     pen null
```

## Findings

- **matyas-19-MB3-1** (blocker, boundary, confirmed). A decimal within 5e-3 relative of an exact limit or definite integral is ticked right, so a plugged-in estimate (2.9996, 0.4996) passes as a limit.
- **matyas-19-MB3-2** (blocker, boundary, confirmed). `ln x + C` is ticked right for ∫ 1/x dx. `pairs()` skips negative samples where only one side is defined (`desk/src/lib/rules/calc-expr.ts:716`).
- **matyas-19-MB3-3** (major, confirmed-absent). Implicit differentiation cannot be set or read on "The chain rule and implicit differentiation".
- **matyas-19-MB3-4** (major, confirmed). The typed route caps an answer at 40 characters. The phone cuts it silently, so quotient and product rule answers become "not sure".
- **matyas-19-MB3-5** (major, confirmed, unwired). An unsure item says "I got something different for number N", and the checker's own reason (`why`) is dropped.
- **matyas-19-MB3-6** (minor, confirmed). Czech notation (decimal comma, `tg`/`arctg`, `+ K`) is unreadable, so those items are "not sure". The profile's cz system is not used for a calc item.
- **matyas-19-MB3-7** (major, confirmed for the transcription). There is no pen for working in prime notation (`(x^2)'`), with a `u =` line, or with chained `lim` lines.
- **matyas-19-MB3-8** (minor, confirmed-absent). Code never names the chain-rule slip (or an extra +C). On the typed route a dropped chain factor gets the generic line.
- **matyas-19-MB3-9** (major, uncertain). The chain-rule set is not required to be composite functions.
- **matyas-19-MB3-10** (minor, confirmed). The topic name "The area-so-far function" is the Character's named pet peeve.
- **matyas-19-MB3-11** (minor, confirmed grounding). The explain prompt carries neither his answer, his working nor the slip found (MB-EXPLAIN 3/8).
- **matyas-19-MB3-12** (strength). Equivalent forms: 39/39 derivative forms right (·, ², exp, sec²x, 1/cos²x, 1+tan²x, factor order), 0 false rings in 84 decided.
- **matyas-19-MB3-13** (strength). The Calculus set is specs, printed and checked by code with no answer stored. The sign slip is code-detected and the pen lands on the right line.

## Time saved and grounding

- Time saved if it all worked: **~15 min saved per six-question set · confidence medium.** He would otherwise find extra problems in Stewart and check each one in WolframAlpha, 2–4 min a problem. Typed marking is code and instant. The photo route and its "line where I slipped" wait for the vision host. The false ticks put a sign on that saving: a ticked estimate costs him the zápočet point the set was meant to win.
- Grounding: MB-SET 4/7 · MB-MARK 4/6 (prompt only 3/6) · MB-EXPLAIN 3/8 · MB-HINT 5/8.

## Voice: Matyáš (L1, over the designed experience)

Would I adopt it? The marker is the best thing in here. I wrote `e^(x²)·2x`, `sec^2 x`, `1/cos^2 x`, `5(3x²+1)⁴·6x` and it took every one. No "simplify" nonsense, no "expected 2xe^(x^2)". WolframAlpha does the same, but this one actually tells me it's a sign when it's a sign. That part I'd tell people about.

What kills it for me is the 2.999. On the limits topic I can plug in x = 0.01, write what my calculator says, and get a tick. That is exactly what the cvičení teacher crosses out with "to není limita". Same with `ln x + C` for ∫1/x: the absolute value is the point of that exercise. A checker that ticks those teaches me the wrong habit right before the zápočet.

Then the small Czech things. `0,5` with a comma, `tg x`: it says "not sure", which is fair. But then the card says "I got something different", so which is it? And it knows why (I can see it's a rounding or it can't read it), it just doesn't tell me.

What's missing for my job: implicit differentiation. The topic says "chain rule and implicit differentiation" and then only ever gives me y = f(x). That's half the test. And the line where I slipped is the reason I'd snap a page at all. If I write it the way we write it, `cos(x²)·(x²)'`, the desk doesn't read the line. Typing a 45-character quotient-rule answer just gets cut off.

Would I tell a peer? "Good for drilling derivatives, don't trust the ticks on limits yet." I'd want the tolerance fixed before I trusted it the week of the test.
