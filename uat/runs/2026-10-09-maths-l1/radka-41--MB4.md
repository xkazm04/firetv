# radka-41 × MB4 · Where did the marks go?

- Character: radka-41 (types Šimon's September mock, "22/50", into the phone; Šimon is `elementary` 14, `cz`, School maths)
- Journey: MB4 (promotion: discovery)
- Cert level: L1 (code walk + node executions of `rules/recovery`, `rules/paperEntry`, `tv/paperRows`)
- Base commit: 12592a71
- **Verdict: L1-fail**. The validation is honest: totals are exact, drops come with reasons, and nothing names the board. Two blockers break her C2:
  - If the lost marks sit on questions with no statement picked, the TV says "No marks were lost" (radka-41-MB4-1).
  - Every question's loss is copied in full onto each topic its statements touch, and the base topics are pulled to the front. The list starts with "One-step equations · 2 marks lost" above "6 marks lost", and the topics add up to 30 of 28 lost marks (radka-41-MB4-2).
  - The list also has no Select: the way to a set goes through another screen that does not know the paper (radka-41-MB4-3).

## Reachable surface set

- Phone: the Paper tab is always in the bar once joined (`desk/src/app/phone/page.tsx:632`). The panel `PaperPanel` (`desk/src/app/phone/PaperPanel.tsx:14`) offers Send only with a seated learner (`:46-49`). The parent role does not gate it.
- Send posts `paper.enter` (`PaperPanel.tsx:47`). Dispatch keeps it through `addPaper` → `cleanPaper` (`desk/src/lib/session/store.ts:723-735`, `desk/src/lib/session/learners.ts:391-399`), and the reducer moves the TV to `paper` (`store.ts:598`).
- TV `paper`, drawn by `PaperScreen` (`desk/src/maths/MathsTV.tsx:694`) through `paperOwns` (`desk/src/tv/keys.ts:72`). Keys: Up/Down/Left/Right walk the topics; Back/Menu go to `prepare`, focus 0 (`keys.ts:482-487`). **No Select handler.**
- `prepare` (Get ready for school) is reachable for a school path (`keys.ts:106`, `desk/src/tv/prepareRows.ts:30-44`).
- Unreachable (Character file, confirmed): a photo of the marked paper. `readPaper` (`desk/src/lib/desk/paperRead.ts:52`) has no caller, so the marks are typed. There is no CERMAT statement list; only the GCSE map (`desk/src/lib/library/gcse.ts:40`).

## Surface model

| # | Affordance | file:line | Pipeline | AI |
|---|---|---|---|---|
| 1 | Paper tab, one row per question: number, Scored, Out of | `PaperPanel.tsx:26-31` | `rules/paperEntry.entryOf` → `rules/recovery.cleanPaper` live as typed | — |
| 2 | "What does it test? (pick up to 3)": 97 statements in 6 areas, 11 flagged "(beyond a Foundation paper)" | `PaperPanel.tsx:32-39`, `paperEntry.ts:40-45` | — | — |
| 3 | "Left out" list and notes | `PaperPanel.tsx:43-45`, `paperEntry.ts:27-36` | — | — |
| 4 | "Send N questions to the TV" | `PaperPanel.tsx:46-48` | `/api/session` `paper.enter` → `addPaper` | — |
| 5 | TV "Where the marks went": topic rows (5 at a time), score card, "Not on the desk yet" | `MathsTV.tsx:694-741`, `tv/paperRows.ts:25-57` | `recovery()` recomputed from the stored paper | — |
| 6 | Back → Get ready for school, first unit lit | `keys.ts:486`, `keys.ts:465-478` | the set is written as Topics does | MB-SET (linear units) / code |
| 7 | "Show the last paper on the TV" | `PaperPanel.tsx:50` | `nav paper` | — |

## The walk (in character)

1. **Paper tab.** "A paper you sat. One row for each question, numbered as the paper numbers it. Pick what the question tests…" Q1 yes. Q2 yes: three fields and a fold-out. Q3 partly: I know the marks per question from the red pen, but "what it tests" is the part I came here because I can't do.
2. **Typing 16 rows.** Number, scored, out of: easy. For "out of" on a CERMAT task I copy the points printed beside it. If I leave "Scored" empty for a zero, the row is "left out: The marks scored are not a whole number." I have to work out that I must type 0 (radka-41-MB4-5). A task over 6 points is refused: "No question on this paper is worth more than 6 marks. Enter its parts one by one." That is a GCSE fact presented as a fact about my paper (radka-41-MB4-6).
3. **"What does it test?"** I open a list of 97 English statements per question. Many are fine ("Solve linear equations in one unknown…"). 41 carry words like "HCF, LCM", "reciprocals", "standard form", "identity", "loci", "trapezia", "frequency trees", "time series", and 11 are marked "beyond a Foundation paper". I don't know what a Foundation paper is (radka-41-MB4-4). Q2 yes, Q3 weakly: I can map most CERMAT tasks only if I already understand the maths, which is the thing I can't do. If I give up and pick nothing, the panel shows a quiet note per question ("names no statement the desk knows, so it counts in the marks but sits on no topic") and still lets me send.
4. **Send (16 questions).** The TV jumps to "Where the marks went". With my picks (repro 1): "22 of 50 marks · 28 marks lost", a caption "Start with One-step equations. The list runs from the biggest loss, with the base each one needs first.", and rows: 1 One-step equations · 2 lost, 2 Two-step · 4, 3 Equations with brackets and x on both sides · 6, 4 Add and subtract fractions · 3, … Not on the desk yet: Angle facts (4), Substitute values (3), Generate a sequence (2), "and 2 more". Q4: I can tell it worked. But Šimon is in 9. ročník, and the first thing it tells him is one-step equations, with 2 marks above the 6 marks row. Question 6 alone shows up on three equation rows, and the rows add to 30 when the paper lost 28. My expression questions (4 and 5, výrazy) were filed under "Equations with brackets…".
5. **Without my picks** (repro 1, second case): the score card still says "28 marks lost", the topic list says "No marks were lost." and the caption says "No marks were lost on this paper. Type another on the phone any time." The side card says "16 questions named no statement". The screen contradicts itself, and the sentence I will read is the wrong one.
6. **From the list to practice.** Select on the lit row does nothing (`keys.ts:483-487`). The caption names a topic but gives me no button. Back takes me to Get ready for school with "Equivalent fractions" lit, and nothing there marks the paper's topics. I walk Right 4 times to One-step equations, Select, then Select "The usual": **7 presses**, provided I remember the name. The biggest loss is 9 presses, Pythagoras 18. The set for an equations unit is written by the model from the topic and Šimon's recorded slips, not from his paper (radka-41-MB4-9).

## Scored criteria

| C | Result | Evidence |
|---|---|---|
| C2 BLOCKER (never secure/left out against the marks; order of marks lost; total right) | **fail** | Total exact (22/50, repro 1) ✓. "No marks were lost" with 28 lost on unmapped questions ✗ (MB4-1). First row 2 lost above 6 lost, rows add up to 30 > 28 (MB4-2). "Secure on the desk" printed beside a topic that lost marks (MB4-7). |
| C3 16-question mock in ≤ 15 min; each question answerable from the list or told plainly it has none | **uncertain (L2)** | Most CERMAT task kinds have a statement (G2 constructions, A23 sequences, R9 percent…). An empty pick is told plainly (`paperEntry.ts:34`). The timing (16 × three fields + a 97-statement list) needs a live run. |
| C4 statements understandable to a non-specialist parent | **fail** | 41/97 carry UK-curriculum or specialist terms (repro 3). "(beyond a Foundation paper)" ×11. No CERMAT-shaped wording. |
| C6 no exam board / grade / pass claim | pass (minor note) | No "GCSE", "1MA1", "Edexcel" or "přijímačky". `shown()` filters board words (`recovery.ts:73-79`), `gcseClaimAllowed()` is false (`gcse.ts:158`). But "a Foundation paper" and the 6- and 80-mark caps are presented as facts about her paper (MB4-6). |
| C1, C5, C7 | n-a | — |

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| recovery fidelity | **1/2 papers pass**. Mock with picks: total = typed (22/50), topics in `recovery()` order, 5 off-desk statements counted ("and 2 more"), no silent drop → pass. Same mock, no picks: total right, but the topic list and caption say "No marks were lost" → fail. |
| line length | static paper captions **4/4 ≤ 25 words** (18, 18, 10, 14) |
| set fit | L2 (equations units are model-written; fractions/percent/area units are code) |

## Wiring audit

| Route / view | Computed user-facing fields | Wired |
|---|---|---|
| `paperView` (`tv/paperRows.ts:25-34`) | empty, marks, outOf, lost, unmapped, topics[].id/.name/.lost/.from/.secure, off[].can/.lost/.from/.beyond | **14/14** (`MathsTV.tsx:700-737`) |
| `entryOf` (`paperEntry.ts:27`) | drops, notes, kept | **3/3** (`PaperPanel.tsx:43-48`) |
| `recovery()` internals | topics[].codes, cleanPaper.dropped (not stored) | not user-facing by design; the codes stay hidden on purpose |

Unwired: none. But see MB4-5: rows dropped at Send are not stored, so the TV total silently differs from the paper's printed total.

## Grounding audit

- The recovery list: **no model**, code only (`rules/recovery.ts:177`).
- **MB-SET** for the set the list leads to:
  - School units with a generator (fractions, decimals, percent, ratio, area, mean, Pythagoras, probability): **n-a (code)** (`lib/desk/items.ts:136`, `rules/school.ts:2813-2828`). Aimed at the learner's recorded slips, never at the paper.
  - Equations units (the first three topics of this mock): **2/7**. Q1 topic ✓ (`items.ts:80`). Q3 past results ✓ (slips and memory, `items.ts:75-81`). Q2 level/stretch ✗ (only flagged after the call, `items.ts:132-133`). Q4 school system ✗. Q5 course path ✗. Q6 the aim (the paper's lost marks) ✗. Q7 age ✗ (passed in, `api/practice/route.ts:30`, but unused by `makeLinearItems`, `items.ts:141`).

## Executions

From ROOT with `DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/radka-41`.

**1. The mock** (`node .../scripts/mb4.cjs`). 16 tasks, 50 points, 22 scored, statements: 1 N3, 2 N2, 3 N2+N8, 4 A4, 5 A4, 6 A17, 7 A21, 8 R9, 9 R5, 10 S2, 11 A2, 12 G2, 13 G17, 14 G20, 15 G3, 16 A23+A24.
```
totals {"marks":22,"outOf":50,"lost":28} kept 16 unmapped 0 dropped 0
 topic 1 linear-one-step | One-step equations | lost 2 | from 6 | codes A17
 topic 2 linear-two-step | Two-step equations | lost 4 | from 6,7 | codes A17,A21
 topic 3 linear-both-sides | Equations with brackets and x on both sides | lost 6 | from 4,5,6 | codes A4,A17
 topic 4 frac-add-sub | lost 3 | from 2,3   topic 5 frac-mul-div | lost 3 | from 2,3   topic 6 dec-arith | lost 3 | from 2,3
 topic 7 area | lost 3   topic 8 pythagoras | lost 2   topic 9-11 dec-convert/pct-of-amount/pct-change | lost 1 each | from 8   topic 12 ratio-share | lost 1
 off G3 4 / A2 3 / A23 2 / A24 2 / S2 1
 TV score: 22 of 50 marks · 28 marks lost | caption: Start with One-step equations. The list runs from the biggest loss, with the base each one needs first.
== same mock, no statement picked
totals {"marks":22,"outOf":50,"lost":28} kept 0 unmapped 16
 TV score: 22 of 50 marks · 28 marks lost | unmapped 16 | caption: No marks were lost on this paper. Type another on the phone any time.
 TV topic-list empty text: No marks were lost.
== mapped-and-full + one unmapped loss: 3 of 7 marks · 4 marks lost | caption: No marks were lost on this paper.
```
Topic rows add up to 2+4+6+3+3+3+3+2+1+1+1+1 = **30** against 28 lost. The off-desk statements add another 12.

**2. Panel entry** (same script):
```
kept 1 drops ["Question 3 is left out: The marks scored are not a whole number."   <- Scored left blank (a zero)
              "Question 4 is left out: The marks scored are not a whole number."   <- "1,5"
              "Question 15 is left out: No question on this paper is worth more than 6 marks. Enter its parts one by one."]
statements offered 97 · Number 16, Algebra 25, Ratio 16, Geometry 25, Probability 9, Statistics 6 · non-foundation 11
```

**3. Statement wording** (`node .../scripts/jargon.cjs`): 41 of 97 statements carry a specialist or UK-curriculum term (the list of terms is the walker's; the evidence is the 41 lines printed).

**4. Presses from the list to a set**, read off `keys.ts:483-487` and `prepareRows.ts:42`. Prepare order: frac-equivalent 0 … linear-one-step 4, linear-two-step 5, linear-both-sides 6 … pythagoras 15, probability 16. Back (1) + Right ×4 + Select + Select = **7** to the first topic. The biggest loss (index 6) is 9. Pythagoras is 18.

## Findings

- **radka-41-MB4-1** (blocker, 18, confirmed). The topic list and caption say "No marks were lost" when every lost mark sits on a question with no statement picked, while the score card says 28 lost.
- **radka-41-MB4-2** (blocker, 18, confirmed). A question's loss is copied in full onto every topic its statements touch, and base topics are pulled forward. A 9th-grader's mock opens on "One-step equations · 2 lost" above "6 lost", the topic rows add up to 30 of 28 lost, and expression questions (A4) land on an equations unit.
- **radka-41-MB4-3** (major, 9, confirmed). No Select on the recovery list. Back lands on Get ready for school at Equivalent fractions with no paper marks: 7 presses to the first topic's set, 9 to the biggest loss, and she has to remember the name.
- **radka-41-MB4-4** (major, 9, confirmed). The 97 statements are GCSE wording: 41 with specialist/UK terms, 11 "(beyond a Foundation paper)". A non-specialist parent can't map a CERMAT task with confidence (C4).
- **radka-41-MB4-5** (minor, 6, confirmed). A blank "Scored" (a zero) is refused as "not a whole number". Dropped rows are not stored, so the TV total silently differs from the total printed on the paper.
- **radka-41-MB4-6** (minor, 6, confirmed). "Beyond a Foundation paper" and the 6- and 80-mark caps are GCSE facts presented as facts about her paper.
- **radka-41-MB4-7** (minor, 6, confirmed). "Secure on the desk" printed beside a topic that lost marks reads as a contradiction to a parent.
- **radka-41-MB4-8** (minor, 4, confirmed). The paper lands on whoever is seated, and the panel never names whose record it goes to.
- **radka-41-MB4-9** (minor, 6, confirmed). The set the list leads to never sees the paper. Equations sets are model-written from the topic and slips (MB-SET 2/7); code sets aim at recorded slips.
- **radka-41-MB4-10** (strength). One validation that never guesses, a drop reason shown live as she types, "Send 16 questions" counting only what is kept, an exact total, off-desk statements counted apart ("and N more"), and no board name on any screen.

## Time saved and grounding

- If it all worked: **~45 min of a tutor lesson saved per paper (~375 CZK) · confidence low**. She cannot do the mock walk-through herself, and a tutor spends most of a 60-min lesson on it. The 15 min of typing replace that only if the list names the real weak topics. Today it opens on a 6th-grade topic, and with no picks it says nothing was lost.
- Grounding: recovery is code (no model). MB-SET n-a (code) for generator units, 2/7 for the equations units it leads to first.

## Voice — Radka, first person

This is the job I can't do myself, so I wanted it most. Typing the marks was fine. Number, points, out of: I am good at forms. Then "What does it test?" opened a list of ninety-seven English sentences about "reciprocals" and "loci" and "a Foundation paper", and I sat there feeling exactly how I felt at my maturita. I picked what I could. A tired parent who picks nothing gets a TV that says "No marks were lost" next to "28 marks lost". Who checked this?

With my picks, the list told Šimon to start with "One-step equations", 2 marks, above a row with 6 marks. He's in ninth grade; his teacher would laugh. Question 6 appears on three rows, and the rows add up to more than he lost. I'm good with numbers in my job, and when a total doesn't add up I stop trusting the whole report. Then I couldn't press the topic to practise it; I had to go back and hunt for it in another list.

I like that it refused to guess, told me exactly why a row was left out, and never claimed this was a přijímačky predictor. Honest machinery. But today I'd still pay the tutor for this hour. If the list were in Czech-exam words, added up to the paper, and let me press "practise this", I'd tell every parent in Šimon's class.
