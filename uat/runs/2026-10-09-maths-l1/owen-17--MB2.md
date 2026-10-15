# owen-17 × MB2 · Practise a topic and get it marked

- **Character:** owen-17 (17, GCSE Foundation resitter, UK, Family mode, School maths path)
- **Journey:** MB2 (`uat/journeys/maths/MB2-practise-and-get-marked.md`)
- **Cert level:** L1 (theoretical, code + node executions, no model call, no vision, no browser)
- **Base commit:** 12592a71
- **Verdict:** **L1-fail**. On a linear-equation set (One-step, Two-step, Brackets and both sides), a typed mixed number is read as a product, so "1 3/4" counts as 3/4. Executed: a sign-slip answer `1 3/4` to `4x + 2 = 5` (true answer 3/4) is **ticked right**, and the one second go ticks it too. That is a false tick, a boundary blocker, and C2 fails. The same misreading rings a correct `1 1/5` for x = 6/5 as wrong. The code-written school units are clean: over 11,200 generated specs, 0 false ticks and 0 false rings.

## Reachable surface set

Profile: high-school, 17, uk, School maths, Family (`desk/src/tv/profileRows.ts:13, 74`).

| Surface | Reachable? | Gate |
|---|---|---|
| Tonight → Teach me something (`topics`) → `worked` → `practice` | yes | `desk/src/tv/keys.ts:106, 303, 453` (a unit with a worked lesson is taught first) |
| Tonight → Get ready for school (`prepare`) → `practice` | yes (school path) | `keys.ts:106, 305, 476`. This road **skips** the worked lesson |
| `paper` → Back → `prepare` → `practice` | yes (MB4's road) | `keys.ts:487` |
| Phone practice panel: typed or snap | yes | `desk/src/app/phone/page.tsx:470-506` |
| `sheet` → `walk` → second go (typed) / explain (voice or typed) | yes | `keys.ts:492-513`, `page.tsx:520-548` |
| Six more / Put away | yes | `keys.ts:503-504` |
| Hints | **not on this journey**: `/api/hint` works on a snapped homework page (`desk/src/app/api/hint/route.ts:24-26`), not on the practice walk | — |
| Linear topics (One-step, Two-step, Both sides): set written by the **model** | yes, and on his recovery list (rows 9, 12, 13) | `desk/src/lib/rules/kinds.ts:68-71` (no generator → linear), `desk/src/lib/desk/items.ts:142-166` |

## Surface model

1. **Set**: `o.set` → `POST /api/practice` (`desk/src/app/api/practice/route.ts:20-49`) → `makeItems` (`desk/src/lib/desk/items.ts:124-140`).
   - School units with a generator (14 topics, `desk/src/lib/rules/school.ts:2813-2828`): code only (`items.ts:359-383`). The mix comes from `rules/stretch` (age 17 uk → "standard", 3 + 3).
   - Linear topics: model `ask()` (`items.ts:69-90`), then each item is kept only if `verify` substitutes the model's stated root (`items.ts:95-112`).
2. **Worked lesson** (Topics door only): `/api/worked` → `teachTopic` (`desk/src/lib/desk/worked.ts:38-52`). Examples come from code (`workedExamples`). The model writes the idea text only, kept if it has no digit.
3. **Practice**: six questions on the TV (`desk/src/maths/MathsTV.tsx:752-787`). The phone offers "Snap the sheet" or "Type my answers" (`page.tsx:471-506`).
4. **Typed marking**: `POST /api/mark {answers}` (`desk/src/app/api/mark/route.ts:46-60`) → `markTyped` (`desk/src/lib/desk/mark.ts:224-234`) → `judgeSet`/`judgeItem` (`desk/src/lib/rules/kinds.ts:95-170`).
   - School items: `check(spec, answer, "uk")` (`school.ts:1665-1776`).
   - Linear items: `settle` by substitution through `verify.ts` `substitute` (`desk/src/lib/desk/verify.ts:157-169`).
5. **Photo marking**: `markSet` → one vision call (`mark.ts:194-222`). The school sheet uses the read-only prompt (`mark.ts:145-158`). The linear sheet asks for a value, a verdict, the model's own solution and a slip (`mark.ts:161-173`). Then the same `judgeSet`.
6. **Sheet / walk**: tally, verdict and the desk's line `said` (`MathsTV.tsx:795-830`, `Walk` at `:907`). Unsure items get `ASK`: "I got something different for number N. How did you get there?" (`desk/src/lib/rules/maths.ts:91`, `kinds.ts:163`).
7. **Second go**: `/api/second` → `secondGo` → `judgeItem` (`mark.ts:241-243`).
8. **Explain**: `/api/explain` → `explainItem` (`desk/src/lib/desk/explain.ts:195-226`) → `explainSchool` or `explain` (model). An unsure item settles by code on the transcribed value. The reply passes `leaksSchool` or `leaks`.

## The walk (in character)

**Pick a topic.** Coming from my mock (MB4), I press Back to Get ready for school, find "Add and subtract fractions · Year 6", then The usual. *Do I know what it wants?* Yes, two cells and a line under them. *Did it work?* The TV shows six questions and "Work these on paper".
- From Tonight → Teach me something I would get a worked lesson first. From here I don't. The definition of done says I should see it where the desk has one (owen-17-MB2-8).

**The set.** "Work out 5/8 − 1/2", "Work out 5/7 + 4/7" … "Work out 5/7 + 2/3".
- The wording is fine and not babyish (C7).
- But on the mock I lost marks on 2 1/3 + 1 3/4 and on a division word problem. No set on this unit ever has a mixed number in it: 0 of 8,000 generated (owen-17-MB2-3).
- On percentages, half the money questions are in euros or dollars. I write £ without thinking (owen-17-MB2-5).

**Hand in.** I type: `1/8, 1 2/7, 1.33, 7/12, 1/4, 1 8/21`. *Can I tell it worked?* The status reads "4 right, 1 to look at, 1 to talk through". That's honest.
- 1.33 comes back "not sure": "I got something different for number 3." Different? It's 4/3 rounded. That line sounds like wrong (owen-17-MB2-6).

**Walk.** On the one I got wrong, the TV says: "The tops were combined and so were the bottoms. Fractions need the same bottom first; then only the tops change." That's right about what I did.
- On percent-change and Pythagoras slips the line runs to 27–37 words. That's long (owen-17-MB2-4).
- I typed, so there is no working for a pen to point at. That fits: I typed only answers.

**Equations (rows 9, 12 and 13 of my list).** The set is written by the model. I solve `4x + 2 = 5`, flip the sign, get 7/4 and write it the way school taught me, 1 3/4. The desk ticks it. I'd walk away believing I can do it (owen-17-MB2-1). On another one I write 1 1/5 for 6/5, which is right, and it's ringed (owen-17-MB2-2).

**Six more / Put away.** Both are there on the sheet (`keys.ts:503-504`). Tonight's continue card brings an unfinished set back.

## Scored criteria

| C | Result | Evidence |
|---|---|---|
| C2 (BLOCKER) | **fail** | The linear mixed-number false tick, executed (exec 4). Code-written school units: 0 false ticks over 106,619 wrong candidates (exec 3) |
| C6 | pass | No board, "GCSE" or grade string in any UI or prompt file on this path (grep → only `paperRead.ts` header comments, which have no caller) |
| C7 | pass for code sets; uncertain (L2) for the model's linear sets and the worked idea | Code questions read "Work out …", "Find …", "A right-angled triangle has …" (exec 1). The worked lesson's authored idea says "the same bottom number" (`desk/src/lib/library/worked.ts`, frac-add-sub). The voice for 17 is "teen" (`desk/src/lib/rules/voice.ts:75-78`) |
| C1, C3, C4, C5 | n/a on MB2 (MB4's) | — |

## Module metrics (rubric units)

| Metric | Value |
|---|---|
| **false ticks** | **4** on the linear battery (`1 3/4`, `1 1/2`, `1 2/3`, `-1 1/2`, each read as b/c), plus junk `2 3` ticked for x = 6 → **blocker**. School units: **0** over 106,619 wrong candidates on 11,200 specs |
| **false rings** | **2** on the linear battery (`1 1/5` for 6/5, `-1 1/2` for −3/2). School units: **0** over 52,030 equivalent forms |
| marking agreement | school sheets: 25/25 decided items agree (5 sheets, exec 5) = 1.00. Linear battery: 22/28 = 0.79 (6 disagreements) |
| unsure rate | 5/30 = 0.17 on Owen's five realistic typed sheets (≤ 0.2 ✓). Every unsure is a UK-habit form: `1.33`, `20cm squared`, `273.60 pounds`, `£538.20` on a € item, `25 and 30` reversed |
| answer leak | 0 in code-produced lines (`said`, ASK, withheld lines carry no value). Model lines (explain replies, worked idea) are L2 |
| hint helpfulness | n/a: no hint on the practice walk |
| slip precision | L2 (needs working). One note: `24` for a mean of 23.8 is named `stat-median` while it is also 23.8 rounded (exec 2) |
| set fit | Walker read, for the L2 judge to confirm: frac-add-sub seed 11 ≈ 3/6 at a Foundation resitter's level. Tier-1 items like `5/8 − 1/2` are KS3. There are no mixed-number operands (0/8,000) and no word problems |
| presses to first hint | n/a (MB1 metric; no hint on a practice sheet) |
| line length | 32/59 = **0.54** of the TV lines Owen acts on are ≤ 25 words (target ≥ 0.9): 27 slip lines run 26–37 words |
| handwriting read / time to marked sheet (photo) | L2. **Precondition:** vision host (env.md, Math Buddy) |
| time to marked sheet (typed) | L2 (driver). Code path, `provider:"code", ms:0` (`mark.ts:233`) |

## Wiring audit

| Route | User-facing fields computed | Wired | Unwired |
|---|---|---|---|
| `/api/mark` → `practice.marked` items | verdict, slip, said, slipAt, studentAnswer, studentWorking, second, reply | **8/8** (`MathsTV.tsx:795-830`; `desk/src/maths/working.ts:38-60` via `workingLines`) | — |
| `/api/mark` JSON | right, wrong, unsure (status line), provider, ms | 3/5. `provider` and `ms` are not shown, and that is not user-facing by intent | (provider, ms) |
| `/api/worked` → `worked` | title, idea, steps, examples (question, answer, tier) | 6/6 (`MathsTV.tsx:1153`) | — |

## Grounding audit (shared denominators)

| Surface | Score | Present (prompt line) | Absent | Named additions |
|---|---|---|---|---|
| **MB-SET**, school units (14 topics) | **n-a (code)** | — | — | — |
| **MB-SET**, linear topics | **2/7** | Q1 topic: `items.ts:80` (`Topic: ${name}\n${blurb}`). Q3 past results: `items.ts:76` (recorded slips on this topic) | Q2 level/stretch (stretch changes nothing on this road, `items.ts:25-27`), Q4 system, Q5 path, Q6 aim (the paper's lost marks), Q7 age | memory notes (`items.ts:81`) |
| **MB-WORKED** | **3/5** | W1 `worked.ts:45` (title). W2 `worked.ts:45` (steps). W3 `worked.ts:42-44` (voice by age) | W4 system (used only for `workedAnswer`), W5 his past slips on the topic | — |
| **MB-EXPLAIN**, school item | **3/8** | X1 `explain.ts:108`. X4 transcript `explain.ts:109-111`. X6 age through `schoolSystem(age)` `explain.ts:118` | X2 his typed answer, X3 the slip code detected, X5 working, X7 system (used only to settle), X8 topic history | memory notes (`explain.ts:105, 112`) |
| **MB-EXPLAIN**, linear item | **3/8** | X1 `explain.ts:66`. X4 `explain.ts:67-69`. X6 `explain.ts:62` | X2, X3 (only the vocabulary is offered, not the slip detected), X5, X7, X8 | memory |
| **MB-MARK**, school sheet (photo) | **2/6** | K1 photo (`mark.ts:206`). K2 items (`mark.ts:146-147`) | K3 the code's truth (by design: the verdict is code's), K4 system (the prompt says "comma or point they used", generic), K5 (by design: code detects the slip), K6 age | — |
| **MB-MARK**, linear sheet (photo) | **3/6** | K1, K2 (`mark.ts:162-163`), K5 vocabulary (`mark.ts:170`) | K3, K4, K6 | — |

## Executions

1. Code-written sets for his top topics (`makeSchoolItems`, mix from `setMix(…,{age:17,system:'uk'})`):
```
node C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/owen-17/s/sets.cjs frac-add-sub frac-mul-div pct-of-amount pct-change area pythagoras
== frac-add-sub seed 11 mix standard provider code
  1. [t1] Work out 5/8 - 1/2.  => 1/8      ...  6. [t2] Work out 5/7 + 2/3.  => 29/21
== pct-change seed 11: 4. [t2] Increase €460 by 17%.  => €538.20
== pythagoras seed 11: 1. [t1] A right-angled triangle has shorter sides 16 metres and 30 metres. Find the longest side. => 34 m
```
2. Hand battery of typed forms (`judgeSet`, typed, system uk), e.g.:
```
TRIES='{...}' node .../s/mark.cjs frac-add-sub 11
#2 Work out 5/7 + 4/7.  "9/7"->right "1 2/7"->right "18/14"->right "9/14"->wrong(tops-and-bottoms) "1.29"->unsure
#1 Work out 5/8 - 1/2.  "12.5%"->right "0.13"->unsure "4/2"->wrong(tops-one-bottom)
node .../s/mark.cjs pct-of-amount 11
#4 Find 57% of £480.  "£273.6"->right "273.60 pounds"->unsure "273,60"->unsure "27360"->wrong(pct-times-whole)
node .../s/mark.cjs area 11
#1 triangle base 5 height 8: "20 cm^2"->right "20cm²"->right "20 cm squared"->unsure "20 sq cm"->unsure "40"->wrong(area-no-half)
node .../s/mark.cjs ratio-share 11
#4 Share 441 grams in 2:7: "98 and 343"->right "98:343"->right "343 and 98"->unsure "343:98"->wrong(ratio-swapped) "98, 343"->unsure
node .../s/mark.cjs mean-range 11
#5 mean of 24, 9, 27, 5 and 54 (23.8): "23 4/5"->right "119/5"->right "24"->wrong(stat-median) "119"->wrong(stat-not-divided)
```
3. Systematic sweep of every school generator (14 topics × seeds 1–400 × tiers 1–2):
```
node C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/owen-17/s/sweep.cjs
{ topics: 14, specs: 11200, wrongTried: 106619, falseTicks: 0, eqTried: 52030, falseRings: 0, unsureOnEquivalent: 527 }
260 dec-convert | frac-variant | The value is right; the question asks for it in its simplest form. e.g. 31/40 ~ 62/80
267 frac-equivalent | frac-variant | The value is right; the question asks for it in its simplest form. e.g. 10/11 ~ 20/22
```
(Wrong candidates are every number in the true answer nudged by +1, −1, ×10, +0.1 and +2, plus each unit slip's own `slipValue`. Equivalents are the truth, with and without its sign or unit, `x = `, `= `, a trailing full stop, a doubled fraction and the mixed form. All 527 unsure results are on "simplest form" questions, which is by design.)

4. **The blocker**: linear items, typed:
```
node -e "require('./tools/ts-load.cjs'); const K=require('./desk/src/lib/rules/kinds.ts'); const M=require('./desk/src/lib/desk/mark.ts'); ..."
4x + 2 = 5   typed "1 3/4"   -> right   | second go -> right  | sign slip: 4x = 5 + 2 = 7, x = 7/4 written as a mixed number; truth 3/4
2x + 5 = 6   typed "1 1/2"   -> right   | second go -> right  | truth 1/2
3x - 1 = 1   typed "1 2/3"   -> right   | second go -> right  | truth 2/3
6x + 4 = 1   typed "-1 1/2"  -> right   | second go -> right  | truth -1/2
x + 4 = 10   typed "2 3"     -> right   | second go -> right  | truth 6; 2 3 is not an answer
node .../s/linear.cjs
# 7 - 2x = 3x + 1:  "6/5"->right "1.2"->right "1 1/5"->wrong
# 2x + 7 = 4:       "-3/2"->right "-1.5"->right "-1 1/2"->wrong
node -e "... V.substitute('x = 0.2','1 1/5') -> true; V.substitute('x = 1.2','1 1/5') -> false"
```
Root cause: `cleanValue` keeps "1 3/4" as it is (`maths.ts:94`). `substitute` evaluates the value with the equation grammar, where "a bare unary is implicit multiplication" (`verify.ts:66, 161`), so `1 3/4` = 1 × 3/4. The guard `rootOf` (`kinds.ts:123`) checks only the equation, never the answer's form. School items are not affected: `readNumber` reads a mixed number properly (`school.ts:310`).

5. Owen's five realistic typed sheets (seed 11):
```
frac-add-sub  "1/8":right "1 2/7":right "1.33":unsure "7/12":right "1/4":wrong(tops-and-bottoms) "1 8/21":right   unsure 1/6
area          "20cm squared":unsure "36cm2":right "84":right "95 cm2":right "40":right "31.5":right              unsure 1/6
pct-of-amount "136" "4" "12":right "273.60 pounds":unsure "16.2 litres":right "£211.20":right                    unsure 1/6
pct-change    ... "£538.20":unsure (item is in €) ...                                                            unsure 1/6
ratio-share   ... "25 and 30":unsure (amounts reversed) ...                                                      unsure 1/6
overall unsure 5/30
```
6. Line length: `node -e "...SCHOOL_SLIPS.map(x=>x.says), choiceLine, PREPARE_DOOR, paperCaption..."` → `lines 59 <=25 words 32 share 0.542`. The longest is 37 words (`pct-times-whole`, `rate-wrong-way`).
7. Currency on money generators (`node -e` over pct-of-amount, pct-change, unit-rate, ratio-share, dec-arith, seeds 1–1000 × 2 tiers) → `{ '€': 1693, '£': 1643, '$': 201 }`. `check(€ item, "£538.20", "uk")` → unsure, "different unit".
8. Fraction operands: 8,000 frac-add-sub and frac-mul-div specs → `with a mixed-number operand 0`.

## Findings (keys in owen-17.json)

- **owen-17-MB2-1 · blocker (boundary)** · A typed mixed number on a linear item is read as a product. A wrong `1 3/4` for 3/4 is ticked right, and the second go ticks it too.
- **owen-17-MB2-2 · major** · The same misreading rings a correct mixed-number root (`1 1/5` for 6/5).
- **owen-17-MB2-3 · major** · Fraction sets never use a mixed-number operand or a word problem, the forms Owen lost marks on. "A step up" only moves the tier mix.
- **owen-17-MB2-4 · major** · Slip lines run to 26–37 words. The line-length share is 0.54 against ≥ 0.9.
- **owen-17-MB2-5 · minor** · UK-habit answers read "not sure": £ on a € item (≈ half the money items are € or $), "cm squared", "pounds".
- **owen-17-MB2-6 · minor** · The unsure line says "I got something different" even for a rounded right answer or a blank, which reads as wrong.
- **owen-17-MB2-7 · major (uncertain, vision)** · Photo marking depends on vision reading answers verbatim. The linear photo prompt asks for "a plain number or simple fraction", which may hide or trigger -1.
- **owen-17-MB2-8 · minor** · The Get ready for school road (the one his paper sends him down) skips the worked lesson.
- **owen-17-MB2-9 · minor** · An explain reply never sees his typed answer or the detected slip (MB-EXPLAIN 3/8).
- **owen-17-MB2-10 · strength** · Typed marking of the 14 code-written units: 0 false ticks, 0 false rings over 11,200 specs, and "unsure, never wrong" on form questions.

## Time saved and grounding

- **Time saved if it all worked:** ~5 min saved per set · confidence low. That is marking six answers and naming the slip, against checking a worksheet's answer key, and Owen has none. The real value is practice he would otherwise not do at all (character file). As built, a ticked wrong equation is a time *loss* when the exam comes.
- **Grounding:** MB-SET n-a (code) / 2/7 (linear) · MB-WORKED 3/5 · MB-EXPLAIN 3/8 · MB-MARK 2/6 (school photo) / 3/6 (linear photo).

## Voice — Owen, first person

The fraction ones are fine, quick and marked straight away, and it caught that I'd added the tops and bottoms. That's exactly what I do. It didn't mark me wrong for 1.33, it just asked, but it said "I got something different", which sounds like wrong. And they're easy. 5/8 take a half? The mock had mixed numbers, and nothing here has them, even when I pick the harder one. The explanations under a wrong one are like three lines on the TV, too long. Then I did the equations one, wrote 1 3/4, and it ticked it. My mate checked: it's 3/4, I'd got the sign wrong. If it ticks wrong answers, what's the point? I'd believe I can do equations, go into November and drop the marks again. I'd keep using it for fractions and percentages, but I wouldn't trust the equations, and I wouldn't tell anyone it marks right until that's fixed.
