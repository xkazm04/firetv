# owen-17 × MB4 · Where did the marks go?

- **Character:** owen-17 (17, FE college, Leeds; GCSE Foundation resit in November; mock Paper 1 scored 31/80)
- **Journey:** MB4 (`uat/journeys/maths/MB4-where-the-marks-went.md`)
- **Cert level:** L1 (theoretical, code + node executions, no model call, no browser)
- **Base commit:** 12592a71
- **Verdict:** **L1-fail**. The paper goes in and comes back with the right total (31 of 80), in `recovery()` order, with the off-desk statements counted, so the rubric's recovery-fidelity metric passes. Two findings reach blocker severity under the impact formula (frequency high × reachability high × trust med = 18). First, one wrong answer on the mock can show up as three or four rows on the TV, and the list grows to 14 of the 17 desk topics. Second, 10 of the 13 statements the desk does not cover are only counted ("and 10 more") and never named, so C1, which Owen marks BLOCKER, fails on its third part. A major remains as well: no row on the list leads to its set.

## Reachable surface set

Profile: type `high-school`, age 17 (AGE_RANGE 15–19, `desk/src/tv/profileRows.ts:13`), system `uk`, Maths course School maths, Family mode. Under 18 there is no Mode row (`desk/src/tv/profileRows.ts:74`).

| Surface | Reachable? | Gate |
|---|---|---|
| Phone Paper tab | yes, once the phone is joined | `desk/src/app/phone/page.tsx:632` (the tab is disabled until `s.joined`) |
| TV `paper` (recovery list) | yes, but only from the phone (Send, or "Show the last paper on the TV") | `desk/src/lib/session/store.ts:598`, `desk/src/app/phone/PaperPanel.tsx:50`. No TV door: `"paper"` is navigated to nowhere in `desk/src/tv` |
| TV `prepare` (Get ready for school) | yes: school path | `desk/src/tv/keys.ts:106` (doors include `prepare` on a school path), `desk/src/tv/keys.ts:487` (Back from `paper`) |
| `practice` (set from prepare) | yes | `desk/src/tv/keys.ts:476`, `desk/src/lib/session/store.ts:603` |
| Photo of the marked mock | **unreachable** | `desk/src/lib/desk/paperRead.ts:52` has no caller |
| Select on a recovery row | **not handled** | `desk/src/tv/keys.ts:484-488`: the handler only moves focus, and Back or Menu go to `prepare` |

## Surface model (in order)

1. **Phone → Paper tab**, `PaperPanel` (`desk/src/app/phone/PaperPanel.tsx:23-52`). Each row has a question label, Scored and Out of. "What does it test?" is a `<details>` holding all 97 statements as checkboxes, grouped into 6 spec areas by `can` text, with "(beyond a Foundation paper)" on the higher-only ones (`:33-38`, `desk/src/lib/rules/paperEntry.ts:40-45`). Each keystroke runs the rows through `entryOf` → `cleanPaper` (`desk/src/lib/rules/paperEntry.ts:27-36`, `desk/src/lib/rules/recovery.ts:112-150`). Drops and notes are listed live (`PaperPanel.tsx:43-45`). The draft lives in `useState` (`desk/src/app/phone/page.tsx:46`).
2. **Send** → `POST /api/session {type:"paper.enter", rows}` → `dispatch` → `addPaper` → `cleanPaper` → learner file (`desk/src/lib/session/store.ts:723-733`, `desk/src/lib/session/learners.ts:391-399`). The reducer sets `screen = "paper"` (`store.ts:598`). The phone follows `paper` to the Paper panel (`desk/src/app/phone/panelFor.ts:44`).
3. **TV `paper`**: `PaperScreen` (`desk/src/maths/MathsTV.tsx:694-740`) draws `paperView` (`desk/src/tv/paperRows.ts:25-34`), which calls `recovery()` (`recovery.ts:177-220`). Topic rows are shown 5 at a time (`MathsTV.tsx:684`). The score card reads `31 of 80 · 49 marks lost`. "Not on the desk yet" shows 3 statements and then "and N more" (`MathsTV.tsx:686, 729-732`). The caption is `paperCaption` (`paperRows.ts:52-57`).
4. **Back / Menu** → `prepare` with focus 0, Equivalent fractions (`keys.ts:487`). Each card carries a UK year label, "Year 5" to "Year 9" (`MathsTV.tsx:669`, `desk/src/tv/prepareRows.ts:16`).
5. **Select on a unit** opens "The usual" or "A step up". Select again → `o.set(..., {stay:true})` → `/api/practice` (`keys.ts:466-481`, `desk/src/app/api/practice/route.ts`). A school unit's set is written by code with no model (`desk/src/lib/desk/items.ts:359-383`). `practice.set` → screen `practice` (`store.ts:603`). From here the journey is MB2's.

**AI prompt sources:** none on MB4. Entry, recovery and the view are code only. The vision paper reader (`paperRead.ts`) has no caller.

## The walk (in character)

**Step 1: Paper tab on the phone.** *Do I know what it wants?* Yes: "One row for each question… Pick what the question tests." *Is the action visible?* The three boxes are. "What does it test?" opens a list of 97 sentences under spec-style area names. *Do I connect it to my goal?* Mostly. I know Q9 was "35% of 80", but percentages are not under Number. They sit under "Ratio, proportion and rates of change" (`desk/src/lib/library/gcse.ts:310`, R9), and I would not guess that. Fractions have three candidates: N2 "four operations…", N8 "calculate exactly with fractions and multiples of π" and N12 "fractions and percentages as operators". *Can I tell it worked?* Yes. Each pick shows as "Tests: …" in the summary, and drops are listed with a reason. There are 31 rows, and each needs its own scroll through the list. My 15-minute estimate looks optimistic.

**Step 2: Send.** The button reads "Send 31 questions to the TV" and the TV jumps to the list. Clear.

**Step 3: the TV list.** *Do I know what it wants?* The caption says "Start with Add and subtract fractions. The list runs from the biggest loss, with the base each one needs first." *What I see:* the first five rows are Add and subtract fractions (4), Multiply and divide fractions (4), Add, subtract and multiply decimals (4), Fractions, decimals and percent (4) and A percent of an amount (4). Questions 8 and 21 were fraction questions. Why are decimals "4 marks lost · From 8, 21"? The list runs to 14 rows, out of 17 topics on the whole desk path. That is just the spec again. On the right, "Not on the desk yet" shows distance-time graphs, a flagged higher-only statement I ticked by mistake, and simultaneous equations, then "and 10 more". Quadratics (3 marks) and rearranging (3 marks) are among those 10, and nothing names them. *Can I tell what comes next?* No. Select on "Add and subtract fractions" does nothing, and the caption does not say to press Back.

**Step 4: Back → Get ready for school.** It lands on "Equivalent fractions · Year 5". I press Right twice to reach "Add and subtract fractions · Year 6". Being labelled Year 6 at 17 is my pet peeve. Select, Select, and a set is written. That is 5 presses and 3 screens. It works, but I had to find the topic again myself.

## Scored criteria

| C | Result | Evidence |
|---|---|---|
| C1 (BLOCKER) | **fail (clause 3)**. Total pass; order pass by the rule; "none dropped without being listed" fails | Total 31/80 equals what was typed (exec 1). The order is `recovery()`'s (`paperRows.ts:31`). 10 of 13 off-desk statements are only counted, "and 10 more" (`MathsTV.tsx:729-732`) → owen-17-MB4-2. The row losses are also inflated by fan-out → owen-17-MB4-1 |
| C3 | uncertain (L2) | 97 checkboxes per row, no search; percentages filed under "Ratio…"; three fraction statements, and the choice changes which rows appear → owen-17-MB4-5 |
| C4 | pass (with a minor) | Every `foundation:false` statement has empty `touches` (`gcse.ts:289-358`), so none can reach the topic list. It is flagged "beyond a Foundation paper" on the card (`MathsTV.tsx:730`). It is not demoted inside the card → owen-17-MB4-4 |
| C5 | pass, with friction | 3 screens (paper → prepare → practice), 5 presses for his first topic (exec 3). There is no direct step → owen-17-MB4-3 |
| C6 | pass | No "GCSE", "1MA1", board name or grade in any UI string (grep over `desk/src/tv`, `maths`, `app/phone`, `landing` → 0 hits). `cleanPaper` refuses labels naming the board (`recovery.ts:73-79, 125`) |
| C7 | n/a on MB4 (no questions) | — |

## Module metrics (rubric units)

| Metric | Value | Note |
|---|---|---|
| recovery fidelity | **pass** (1 paper) | Total 31/80 = typed. Topics in `recovery()` order. Off-desk statements counted (13: 3 named + "and 10 more"). Nothing dropped silently (0 drops, 0 unmapped) |
| line length | caption 20 words, empty caption 17, choice lines 16 and 19 → 4/4 ≤ 25 on MB4's own lines | Slip lines are MB2's |
| false ticks / rings / leaks | n/a (no marking on MB4) | — |
| presses (paper → first set) | 5 for his top topic (Back, Right, Right, Select, Select). Up to 17 when the top topic is the last prepare card (e.g. Probability, index 16) | Not a rubric metric; reported for C5 |

## Wiring audit

| Route / computer | Computed user-facing fields | Wired | Unwired |
|---|---|---|---|
| `paperView` (`paperRows.ts:25-34`) → `PaperScreen` | empty, marks, outOf, lost, topics.{id,name,lost,from,secure}, off.{can,lost,from,beyond}, unmapped | **14/14** (`MathsTV.tsx:695-735`) | — |
| `entryOf` (`paperEntry.ts:27-36`) → `PaperPanel` | drops, notes, kept | **3/3** (`PaperPanel.tsx:43-48`) | — |
| `paper.enter` dispatch statuses | PAPER_NO_ROW, PAPER_NOT_SAVED, NOBODY_AT_DESK | 3/3 (phone shows `s.status`, `PaperPanel.tsx:51`) | — |

Not a wiring gap, but worth noting: `RecoveryTopic.codes` is computed and deliberately never shown (no codes on screen).

## Grounding audit

| Surface | Shared denominator | Score | Note |
|---|---|---|---|
| (none) | — | **n-a (code)** | MB4 makes no model call. `paperRead.ts` (vision) has no caller |

## Executions

1. Owen's mock through the phone's own validation and recovery:
```
DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/owen-17 node C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/owen-17/s/mock.cjs
typed total 31 / 80 rows 31 | kept 31 drops 0 notes 0
recovery totals {"marks":31,"outOf":80,"lost":49}
TOPICS (screen order):
  1 frac-add-sub | Add and subtract fractions | lost 4 | from 8,21 | codes N2
  2 frac-mul-div | Multiply and divide fractions | lost 4 | from 8,21 | codes N2
  3 dec-arith | Add, subtract and multiply decimals | lost 4 | from 8,21 | codes N2
  4 dec-convert | Fractions, decimals and percent | lost 4 | from 9,18 | codes R9
  5 pct-of-amount | A percent of an amount | lost 4 | from 9,18 | codes R9
  6 pct-change | Percent increase and decrease | lost 4 | from 9,18 | codes R9
  7 area | ... | lost 4 | from 7,17 | codes G16,G17
  8 pythagoras | lost 3 | 9 linear-one-step | lost 2 | from 13 | codes A17
  10 ratio-share 2 | 11 unit-rate 3 | 12 linear-two-step 2 (from 13, A17) | 13 linear-both-sides 3 (from 5(b),13; A4,A17) | 14 mean-range 1
NOT ON DESK: A14 4 · A15 4 (foundation false) · A19 4 · A5 3 · A18 3 · N4 2 · N9 2 · A25 2 · N3 1 · N15 1 · A2 1 · G3 1 · S2 1
sum topic lost 44 sum off lost 29 paper lost 49
TV score: 31 of 80 marks · 49 marks lost
TV caption: Start with Add and subtract fractions. The list runs from the biggest loss, with the base each one needs first.
TV off shown (3): A14 [4] || A15 [4] || A19 [4] | and 10 more
QLA by statement: N2:4 R9:4 A19:4 A14:4 G17:3 G20:3 R11:3 A18:3 A5:3 N4:2 R5:2 A17:2 ...
```
(The mock is 31 rows. Each was picked the way a 17-year-old would pick it from the `can` text. The listing above is abridged, and the script prints each row in full.) The 14 topic rows sum to 44 "marks lost". The marks actually lost on questions the desk has a topic for come to 24.

2. Branch enumeration of the shared mapping (statement → `touches` on the school path) behind owen-17-MB4-1 and -2:
```
node -e "require('./tools/ts-load.cjs'); const G=require('./desk/src/lib/library/gcse.ts'); const P=require('./desk/src/lib/library/paths.ts'); ... group STATEMENTS by touches on topicsOf('school')"
0 topics: 74 statements (off-desk)
1 topics: 18 statements N1 N10 N11 A1 A4 A21 R4 R5 R7 R10 R11 G16 G17 G20 P3 P4 P7 S4
2 topics: 2 statements N8(frac-add-sub,frac-mul-div) N12(frac-of-amount,pct-of-amount)
3 topics: 3 statements N2(frac-add-sub,frac-mul-div,dec-arith) A17(linear-one-step,linear-two-step,linear-both-sides) R9(dec-convert,pct-of-amount,pct-change)
```
There are 5 fan-out branches (N2, N8, N12, A17, R9). The 18 single-topic statements are clean. 74 of the 97 statements have no desk topic (61 of them Foundation), so a real Foundation paper will nearly always overflow the 3-slot off card (-2).

3. Presses from the list to a set: `keys.ts:487` Back → `prepare` focus 0. `prepareStops` order is frac-equivalent(0), frac-of-amount(1), frac-add-sub(2), … probability(16). From `prepareRows.ts:30-44` and the topics dump: `node -e "...topicsOf('school')..."` → 17 units, Fractions group first. So his first topic needs Back + Right×2 + Select + Select = 5.

## Findings (keys in owen-17.json)

- **owen-17-MB4-1 · blocker (rank 18)** · A broad statement spreads one loss over 3 topics. The list holds 14 of the 17 desk topics, including decimals rows he never lost marks on (rows sum to 44 for 24 marks).
- **owen-17-MB4-2 · blocker (rank 18)** · 10 of 13 off-desk statements (20 marks, quadratics and rearranging among them) appear only as "and 10 more". C1 fails.
- **owen-17-MB4-3 · major** · No Select on a recovery row. Back lands on Equivalent fractions, and the caption never says how to get from the list to practice.
- **owen-17-MB4-4 · minor** · A beyond-Foundation statement is not demoted inside the off card and takes one of its 3 visible slots.
- **owen-17-MB4-5 · minor (uncertain)** · The 97-item picker has no search, files percentages under Ratio, and gives three fraction statements whose choice changes the rows.
- **owen-17-MB4-6 · minor (uncertain)** · 31 typed rows live only in React state. A phone reload loses them.
- **owen-17-MB4-7 · minor** · The Get ready for school cards label a 17-year-old's topics "Year 5" to "Year 9".
- **owen-17-MB4-8 · strength** · The total is exact, validation never guesses, and no board name or grade appears anywhere.
- **owen-17-MB4-9 · strength** · Off-desk statements and unmapped questions are kept apart and counted, never forced onto a topic.

## Time saved and grounding

- **Time saved if it all worked:** ~35 min saved · confidence low. A lecturer-style plan takes 45–60 min by hand, against ~15–25 min of entry. Picking from a 97-item list on 31 rows probably pushes entry past his 15 min. As built, the plan needs re-reading, because the fan-out rows and the 10 hidden statements cut into the saving.
- **Grounding:** n-a (no AI surface on MB4).

## Voice — Owen, first person

Typing it in was alright, apart from the tick list. Ninety-seven sentences, and percentages are under "ratio"? I'd have given up around question 15 if my phone had reloaded. The TV got my score right, 31 out of 80, and it didn't call it a grade or say GCSE, which is fine. Then it told me to start with fractions, which, yeah. But then it said I lost 4 marks on decimals as well, from questions 8 and 21, and they were fraction questions. Half the list is the same four marks said three times. That's the thing I didn't want: a list that's basically everything. And the stuff I actually need, simultaneous equations and quadratics, is in a little box on the side, and two of them are just "and 10 more". More what? I pressed OK on fractions and nothing happened, and it took me a minute to work out it wanted Back. Then it called fractions "Year 6". I'd use it again, because nothing else turns my mock into anything. I wouldn't tell my mates it tells you what to revise, though. It's more like it tells you what you got.
