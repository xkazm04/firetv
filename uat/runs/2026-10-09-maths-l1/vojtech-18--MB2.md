# vojtech-18 × MB2 · Practise a topic and get it marked

- Character: `vojtech-18` (out of segment: SŠ 4. ročník, maturita in May 2027, `cz`, School maths)
- Journey: MB2 (`uat/journeys/maths/MB2-practise-and-get-marked.md`)
- Cert level: **L1** (code walk + node executions of the typed-marking path; no browser, no model)
- Base commit: 12592a71 (HEAD c3b0aee3 changes no file under `desk/src`)
- Verdict: **L1-conditional**. The loop is structurally complete: topic, worked lesson, six, typed or photo, sheet, walk, second go, explain. Typed marking is exact: 0 false ticks and 0 false rings over 64 Czech-style answers. But the majors stack up for him:
  - every set is primary-school level;
  - Topics opens on 5. ročník fractions;
  - a right answer written the Czech way ("c = 34 mm") is told "I got something different";
  - the explain path is English speech only.

## Reachable surface set

The profile is as in MB1. The doors are `teach` and `prepare` (`desk/src/tv/keys.ts:105-107`).
- Topics walks the 17 school topics (`keys.ts:180-181`, `desk/src/lib/library/syllabus.ts:59-284`):
  - frac-equivalent (5. ročník) … probability (9. ročník);
  - nothing is locked (`keys.ts:450-453`).
- A unit with a worked lesson (14 of 17, `desk/src/lib/library/worked.ts:9-41`) is taught first (`keys.ts:453`). The three linear topics go straight to a model-written set.
- Get ready for school lists the same 17 units by strand, with "N. ročník" labels (`desk/src/tv/prepareRows.ts:15-17`, `:30-44`). Its two cells are "The usual" / "A step up" (`keys.ts:467-482`).
- Practice → the phone's Practice tab, snap or typed (`desk/src/app/phone/page.tsx:296-330`, `:490-520`) → `/api/mark` (`desk/src/app/api/mark/route.ts:58-69`) → sheet → walk → second go (`/api/second`, code) and explain (`/api/explain`, model).
- **No maturita unit exists on any path**:
  - his topics stop at 9. ročník probability (`syllabus.ts:271-284`);
  - his school year is 13 (`schoolYear('cz', 18)`) and `expectedIndex` = 17 of 17 (E4), so the desk counts him past every topic on the path;
  - scope note: Calculus 1 is reachable on the profile row (`desk/src/tv/profileRows.ts:77`), but it is a university course and leaves his binding.

## Surface model

| # | Affordance | file:line | Pipeline | AI sources |
|---|---|---|---|---|
| 1 | Tonight → Teach me something → Topics, focus on the frontier (0 with nothing secure) | `keys.ts:303`, `:187-191` | — | — |
| 1b | Tonight → Get ready for school → list at focus 0, then Select → The usual / A step up | `keys.ts:305`, `:467-482`, `MathsTV.tsx:627-689` | — | — |
| 2 | Select a unit with a worked lesson → `/api/worked` | `keys.ts:453` → `desk/src/app/api/worked/route.ts:22` → `desk/src/lib/desk/worked.ts:37-52` | examples by code, idea by text `fast` | MB-WORKED |
| 3 | Try six → `/api/practice` | `keys.ts:461` → `desk/src/app/api/practice/route.ts:20-51` → `desk/src/lib/desk/items.ts:124-140` | school unit: **code**, no model (`items.ts:359-388`), mix from `desk/src/lib/rules/stretch.ts:73-78`; linear unit: text `fast` (`items.ts:69-93`) | MB-SET (code: n-a; linear: see table) |
| 4 | Phone: type six answers → Send, or snap the sheet | `page.tsx:312-324`, `:296-306` | typed: `markTyped` → `judgeSet` (code, `desk/src/lib/rules/kinds.ts:150-170`); photo: vision read + the same judge (`desk/src/lib/desk/mark.ts:182-201`) | MB-MARK (photo) |
| 5 | Sheet → walk an item: verdict, slip, said line, next line | `keys.ts:492-513`, `MathsTV.tsx:803-830`, `:864-933` | — | — |
| 6 | Second go (typed) | `page.tsx:525-536` → `/api/second` → `mark.ts:225-227` `secondGo` (code) | — | — |
| 7 | "Tell the desk how you got it" (hold to speak; typing only without a mic) | `page.tsx:538-556`, `:282-290` (`lang = "en-US"`) | `/api/explain` → `desk/src/lib/desk/explain.ts:97-127`, reply checked by `leaksSchool` (`explain.ts:222-224`) | MB-EXPLAIN |
| 8 | Six more / Put away | `keys.ts:503-504` | as 3 | — |

## The walk (in character)

1. **Tonight → Teach me something.** The caption says "Pick a topic and the desk writes six questions to work on paper, then marks them from a photo." (18 words).
   - The title reads "School maths, from the first step" (`desk/src/tv/mathsRows.ts:179-183`).
   - Topics opens at focus 0, **Equivalent fractions, 5. ročník**: nothing is secure, and the focus rule never reads age (`keys.ts:187-191`).
   - (1) He knows what the screen wants. (2) Right walks the ruler.
   - (3) He wants maturita topics. The nearest are Pythagoras (8.) and Probability (9.), 15 and 16 presses to the right.
   - Pet peeve: "primary-school sums offered to an 18-year-old" is the first thing on screen.
2. **Get ready for school.** The door's caption is "Pick what school is teaching next and practise it before the lesson." (`prepareRows.ts:60`).
   - His school is teaching analytic geometry. The list offers 5.–9. ročník units, and nothing says his year is past them.
   - He picks Probability → "A step up" → "Six questions with more of the harder kind…" (`prepareRows.ts:53-57`).
3. **Worked lesson.** On probability, the idea comes from the model "for a 15-year-old" (`worked.ts:43-45`, `desk/src/lib/rules/voice.ts:69`). The examples are code, answered in his system ("0,25", E5).
4. **The set.** Code writes it, at mix `harder` for him (E5). Executed (E5):
   - **Pythagoras**: integer triples, e.g. "shorter sides 16 mm and 30 mm. Find the longest side.";
   - **Probability**: single draws from a bag;
   - **Percent change**: "Increase £400 by 34%." A pound sign for a Czech learner.
   - All are on topic, and almost nothing is at maturita level. Set fit: Pythagoras 0/6, probability 2/6, pct-change 2/6 (walker as judge).
5. **Typed answers.** He types the way his school writes. Executed through the real judge (E6):
   - 64 answers: **0 false ticks, 0 false rings**, 52/52 decided answers agree with a teacher, 12 unsure (0.19).
   - The decimal comma and point both read ("326,70", "326.70", "437,8 kg"). £ is accepted on either side. "60 %" and "6/10" are right.
   - But "c = 34 mm", "c = 34", "b = 40 cm", "P = 3/13" and "P(A) = 3/13" are **unsure**. Only a leading `x =` is stripped (`desk/src/lib/rules/school.ts:37`).
   - The sheet then says "The desk is not sure" above the said line **"I got something different for number 1. How did you get there?"** (`desk/src/lib/rules/maths.ts:91`, `MathsTV.tsx:809-818`), on an answer that is right.
6. **The walk.** On a wrong item he sees the slip by name. Slip precision is 8/8 on my wrong answers, e.g. "3/10" → `prob-part-over-rest`, "333,30" → `change-wrong-way` (E6).
   - Typed answers carry no working, so there is no pen position, by design (`mark.ts:206-210`). The photo path would locate it: L2.
7. **Second go.** Typed once, judged by the same code with `cz` (`desk/src/app/api/second/route.ts:37`). He trusts it.
8. **Explain.** On his phone (Chrome has speech recognition), the panel offers only "Tell the desk how you got it", hold to speak. Recognition is **en-US** (`page.tsx:288`), and typing is offered only when there is no mic (`page.tsx:544-556`).
   - He would speak Czech, and the transcript is noise. Or he speaks B1 English, slowly.
   - The reply is checked by `leaksSchool`, a real guard.
   - The guard misses "the square root of 1156" and "c squared is 1156" on the Pythagoras item. It also misses Czech number words ("tři třináctiny") (E7).
9. **Six more / Put away.** Both work (`keys.ts:503-504`). Tonight's continue card brings the set back.

## Scored criteria touched

| C | Result | Evidence |
|---|---|---|
| C2 (BLOCKER) no wrong answer ticked right | **pass (typed)** · uncertain (photo, L2) | E6: 0 false ticks in 64 answers, across 3 sets and every wrong form I tried. The photo path uses the same judge on a vision read (`mark.ts:182-201`): L2. |
| C1 (BLOCKER) no answer before he answers | pass on the second go (code, no model). Explain replies: guard present, with gaps (E7) | `explain.ts:222-224`. E7: `√1156` / "c squared is 1156" / Czech number words are not refused. |
| C3 no maturita claim | pass, with a note | No screen claims it. But the "Get ready for school" caption ("what school is teaching next", `prepareRows.ts:60`) promises a fit his year cannot get, and no line says the path ends at 9. ročník for him. |
| C7 lines ≤ 25 words | **fail on the fixed lines measured** | 66/79 = 0.84. 12 of the 17 topic blurbs are over 25 words (probability 40, area 38, pythagoras 31), and they sit in the Topics and Prepare caption (E8). |

C4, C5 and C6 are not touched by MB2.

## Module metrics

| Metric (rubric unit) | L1 value |
|---|---|
| false ticks | **0** (typed, 64 answers, E6). Photo: L2 |
| false rings | **0** (typed). Note: 8 right answers in his notation are `unsure`, not `wrong`, but the said line reads as wrong (finding 2) |
| marking agreement | **52/52 = 1.00** over decided items; 12 unsure apart |
| unsure rate | 12/64 = **0.19** over three sets (Pythagoras 6/17 = 0.35 alone) |
| slip precision | 8/8 = 1.00 (named slips on my wrong answers) |
| set fit | Pythagoras step-up **0/6**, probability step-up **2/6**, percent-change step-up **2/6** at his level (6/6 on topic each). Gate ≥ 5/6: fail |
| answer leak | second go: 0 (code). Explain reply: L2; guard gaps E7 |
| line length | fixed lines 66/79 = 0.84 (E8); model lines L2 |
| handwriting read (L2) / time to marked sheet (L2) | L2. Typed: provider `code`, ms 0 in the judge (E6), live latency L2 |

## Wiring audit

| Route | Fields computed for a user-facing surface | Wired |
|---|---|---|
| `/api/practice` | `items[].question`, `n`, `tier`, `stretch` | 4/4 (`MathsTV.tsx` practice, sheet) |
| `/api/mark` | `verdict`, `slip`, `said`, `slipAt`, `studentAnswer`, `studentWorking`, the `unsure` count (status line) | 7/7 (`MathsTV.tsx:803-860`; `studentAnswer`/`studentWorking` through `maths/working.ts:19,39` `workingLines`) |
| `/api/explain`, `/api/second` | `reply`, `second` | 2/2 (`MathsTV.tsx:796`, `:852`; `page.tsx:525`) |
| `/api/worked` | `title`, `idea`, `own`, `steps`, `examples` | 5/5 (`MathsTV.tsx:1143-1173`) |

Total 18/18. Nothing unwired.

## Grounding audit

| Surface | Score | Present | Absent |
|---|---|---|---|
| MB-SET | **n-a (code)** on the 14 code units; **2/7** on a linear unit | Linear: Q1 topic (`items.ts:84`), Q3 past results as his slips on the topic (`items.ts:74-78`) | Q2 level / stretch (a step up on a linear unit is only a flag, `items.ts:131-133`), Q4 system, Q5 path, Q6 aim, Q7 age |
| MB-WORKED | **3/5** | W1 topic (`worked.ts:47`), W2 steps (`worked.ts:47`), W3 age band (`worked.ts:44`, as "a 15-year-old") | W4 system (used by code for the examples, not in the prompt), W5 his past slips |
| MB-MARK (photo) | **2/6** in the vision prompt; 5/6 counting the code verdict | K1 photo, K2 the set's items (`mark.ts:145-146`); in code: K3 spec, K4 system (`route.ts:62-63`), K5 slips (code-detected) | K6 age |
| MB-EXPLAIN (school item) | **3/8** | X1 item (`explain.ts:108`), X4 his explanation (`explain.ts:110`), X6 age band (`explain.ts:118`) | X2 his marked answer, X3 the slip code found, X5 working, X7 system, X8 history on this topic (only general memory notes, `explain.ts:111`: a named addition) |

## Executions

E4.
```
node -e "…syllabus.schoolYear('cz',18), expectedIndex('cz',18)…"  -> schoolYear cz 18 = 13 expectedIndex = 17 of 17 ; title: School maths, from the first step
```
E5. The step-up sets he gets (`items.makeSchoolItems(t,6,12345,setMix(t,{age:18,system:'cz'},true),true)`):
```
pythagoras harder: 1 T1 A right-angled triangle has shorter sides 16 mm and 30 mm. Find the longest side. | 34 mm
                   3 T2 A right-angled triangle has longest side 50 cm and a shorter side 30 cm. Find the other shorter side. | 40 cm …
probability harder: 1 T1 A bag has 8 white, 3 pink and 2 yellow counters. Find the probability that one taken at random is pink. | 3/13
                    5 T2 The probability that a spinner lands on purple is 75%. What is the probability it does not land on purple? | 0,25 …
pct-change harder: 3 T2 Increase £400 by 34%. | £536 ; 4 T2 Decrease £330 by 1%. | £326,70 ; 6 T2 Decrease 440 kg by 0.5%. | 437,8 kg
setMix for every unit at 18/cz: usual = standard, step up = harder
```
E6. Typed marking, the desk's own judge (`scripts/mark.cjs`: `kinds.judgeSet(..., {system:'cz', typed:true})`):
```
pythagoras  1 "c = 34 mm"   -> unsure  teacher: R | said: I got something different for number 1. How did you get there?
pythagoras  1 "c = 34"      -> unsure  teacher: R
pythagoras  1 "34 cm"       -> unsure  teacher: W   (item in mm)
pythagoras  3 "b = 40 cm"   -> unsure  teacher: R
pythagoras  5 "x = 10"      -> right   teacher: R
probability 1 "P(A) = 3/13" -> unsure  teacher: R
probability 1 "3:13"        -> unsure  teacher: R
probability 1 "0,23"        -> unsure  teacher: W
probability 1 "3/10"        -> wrong prob-part-over-rest  teacher: W
probability 4 "60 %" / "6/10" / "0,6" / "0.6" -> right
pct-change  4 "326,70" / "326.70" / "£326,70" -> right ; "326,67" -> wrong ; "333,30" -> wrong change-wrong-way
pct-change  3 "536 liber"   -> unsure  teacher: R
answers 64 | false ticks 0 | false rings 0 | decided 52, agree 52 (1.000) | unsure 12 (0.19)
```
E7. The explain / hint leak guard on a code item (`school.leaksSchool`):
```
LEAK-CAUGHT | Takže c = 34 mm.
not caught  | c² = 16² + 30² = 1156, teď odmocni.
not caught  | The longest side is the square root of 1156.
not caught  | c squared is 1156.
not caught  | Pravděpodobnost je tři třináctiny.        (LEAK-CAUGHT | It is three thirteenths.)
LEAK-CAUGHT | Je to 0,23. ; Zbývá 25 %. ; 1 − 0,75 = 0,25
```
E8. Fixed TV lines ≤ 25 words (topic blurbs, worked ideas and steps, door and choice captions, paper caption): `fixed TV lines measured 79 <=25 words 66 share 0.84`. Over 25: 12 topic blurbs (26–40) and 1 worked idea (28).

## Findings

| Key | Severity | Title |
|---|---|---|
| vojtech-18-MB2-1 | strength | Typed marking is exact on Czech notation: 0 false ticks, 0 false rings, decimal comma and point, £ on either side |
| vojtech-18-MB2-2 | major | A right answer in his notation ("c = 34 mm", "P(A) = 3/13") is unsure, and the desk says "I got something different" |
| vojtech-18-MB2-3 | major | The nearest units to his exam set primary-school items, even as a step up (set fit 0–2 of 6) |
| vojtech-18-MB2-4 | major | Topics and Get ready for school open on Equivalent fractions (5. ročník) for an 18-year-old |
| vojtech-18-MB2-5 | major | No line tells him his year is past the end of the path; the Prepare door promises "what school is teaching next" |
| vojtech-18-MB2-6 | major | The explain path is hold-to-speak in en-US only; typing appears only without a mic |
| vojtech-18-MB2-7 | major | The Pythagoras leak rule lets "the square root of 1156" and "c squared is 1156" through |
| vojtech-18-MB2-8 | major | Photo marking of his handwritten sheet is unverified (vision); the read prompt has no system or notation |
| vojtech-18-MB2-9 | minor | Topic blurbs on the caption exceed 25 words (C7, 0.84) |
| vojtech-18-MB2-10 | minor | Money in pct-change and rate items is £/€ for a cz learner; "536 liber" is unsure |
| vojtech-18-MB2-11 | minor | Czech number words are not read by the leak rule |

## Time saved and grounding

- Time saved: **~0–5 min saved · low**. The 20-minute "six and a marked sheet" works, but only on 8.–9. ročník material, which earns him few points at the maturita. Marking his own six against a key would take him about as long.
- Grounding: MB-SET n-a (code) / 2/7 linear · MB-WORKED 3/5 · MB-MARK 2/6 (prompt), 5/6 with code · MB-EXPLAIN 3/8.

## Voice: Vojtěch, first person

I open "Teach me something" and the first thing is equivalent fractions, 5. ročník. I am eighteen. Nice.

I walk right to probability and ask for "a step up". I get a bag of coloured counters. Fine, it marks honestly: I typed "0,6" and "60 %" and both were right, and when I was wrong it said why. I would trust that tick. That part is better than the key at the back of the book.

Then I write "c = 34 mm", like our teacher wants, and it tells me "I got something different". It was right. That makes me nervous about every other mark.

When it wants me to explain, it only listens, in English, and I cannot type. And nowhere does it say: this desk ends at 9. ročník, your maturita is not here. I see that from the labels myself. Would I tell a friend? "Hezky to opraví, ale není to na maturitu." It marks nicely, but it is not for the maturita.
