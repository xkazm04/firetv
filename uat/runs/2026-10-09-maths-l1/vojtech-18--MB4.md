# vojtech-18 × MB4 · Where did the marks go?

- Character: `vojtech-18` (out of segment: types a past maturita didactic test he marked himself against the published key: 50 points, 25 questions)
- Journey: MB4 (`uat/journeys/maths/MB4-where-the-marks-went.md`)
- Cert level: **L1** (code walk + node executions of `paperEntry`, `recovery`, `paperRows` and `tvKey`; no browser, no model)
- Base commit: 12592a71 (HEAD c3b0aee3 changes no file under `desk/src`)
- Verdict: **L1-fail**. The arithmetic is honest: 18 of 50 typed, 18 of 50 shown, 13 off-desk statements and 2 unmapped questions counted. But two things break the job:
  - When no question names a statement, the TV says **"No marks were lost on this paper"** beside "3 marks lost". That is a blocker on recovery fidelity.
  - With the statements he would pick, the list's first line sends him to a 7. ročník rectangle-area unit because of a cylinder-volume question. Other picks send him to 5. ročník fractions or 6. ročník one-step equations (C5 fail).
  - From the list there is no Select. A set on the first topic is 16 presses away.

## Reachable surface set

- The phone's Paper tab is always in the tab bar (`desk/src/app/phone/page.tsx:632`), and the panel is `PaperPanel` (`page.tsx:415`, `desk/src/app/phone/PaperPanel.tsx:14-53`).
- Send → the `paper.enter` event → `addPaper` → `cleanPaper` (`desk/src/lib/session/store.ts:723-733`, `desk/src/lib/session/learners.ts:388-398`) → TV `paper` (`store.ts:598`), drawn by `PaperScreen` (`desk/src/maths/MathsTV.tsx:694-748`) through `desk/src/tv/paperRows.ts:25-57`.
- Keys on `paper`: Up/Down/Left/Right walk; Back and Menu go to `prepare` at focus 0; **Select does nothing** (`desk/src/tv/keys.ts:484-488`, E12).
- Get ready for school → a unit → The usual / A step up → a set (MB2's).
- Unreachable here: a photo of his marked test. `desk/src/lib/desk/paperRead.ts` has no caller, and the journey keeps it out.

## Surface model

| # | Affordance | file:line | Pipeline | AI |
|---|---|---|---|---|
| 1 | Paper panel: one row per question (number, scored, out of) and "What does it test? (pick up to 3)" from ~100 statements in 6 areas, with "(beyond a Foundation paper)" flags | `PaperPanel.tsx:24-41`, `desk/src/lib/rules/paperEntry.ts:93-98`, `desk/src/lib/library/gcse.ts:39-136` | `entryOf` → `cleanPaper` live as he types; drops and notes shown (`PaperPanel.tsx:43-45`) | — |
| 2 | Send N questions to the TV | `PaperPanel.tsx:46-48` | `paper.enter` → `addPaper` (cleanPaper again) | — |
| 3 | TV "Where the marks went": topic rows (n, name, "N marks lost", "From q…", "Secure on the desk"), the score card "X of Y marks · Z lost", the "Not on the desk yet" card (3 statements + "and N more" + "N questions named no statement"), the caption | `MathsTV.tsx:694-748`, `paperRows.ts:25-57` | `recovery()` (`desk/src/lib/rules/recovery.ts:177-220`) | — |
| 4 | Back / Menu → Get ready for school (focus 0) → walk to the unit → Select → The usual → Select → set | `keys.ts:484-488`, `:467-482` | `/api/practice` (code set) | MB-SET n-a (code) |

## The walk (in character)

1. **Paper panel.** "One row for each question, numbered as the paper numbers it. Pick what the question tests, so the desk can find where the marks went." (25 words, on the phone).
   - (1) He knows what it wants. He types 25 rows from his self-marked test (E9).
   - (2) "What does it test?" opens a list of about 100 English statements in GCSE wording. "Foundation" is never explained.
     - A quadratic inequality has no statement. A22 says *linear* inequalities. N1 lists "<, >, ≤, ≥" under ordering numbers.
     - A cylinder volume sits under G17 "…surface area and volume of solids".
     - Goniometry sits under G20 "Pythagoras' theorem and sin, cos, tan…".
     - Logs and the domain of a function: nothing. He leaves those empty.
   - Translating 100 statements through his phone takes most of the 15 minutes he budgeted.
2. **Validation.**
   - Labels "13.1"/"13.2" are accepted.
   - A half mark "1,5" is dropped with "The marks scored are not a whole number." (E10). That is shown, not silent.
   - The empty-statement rows are noted: "Question 9 names no statement the desk knows, so it counts in the marks but sits on no topic." (`paperEntry.ts:87`). Honest.
3. **Send → TV** (E9):
   - Score card: "18 of 50 marks · 32 marks lost". Exactly what he typed.
   - The list, 7 topics, in `recovery()` order:
     1. **Area of rectangles, triangles and composite shapes** (7. ročník), 2 lost, from 19 (the cylinder);
     2. Pythagoras' theorem (8.), 2 from 10 (the goniometry question);
     3. Two-step equations, 1 from 4;
     4. Equations with brackets, 2 from 2 (an algebraic fraction, via A4);
     5. then three percent units, 1 each from 20.
   - The caption: **"Start with Area of rectangles, triangles and composite shapes. The list runs from the biggest loss, with the base each one needs first."**
   - Of his 32 lost marks, only 8 sit on those questions. 24 are off the desk: 20 under 13 statements, plus 4 on 2 questions with no statement. The card shows 3 of the 13 and "and 10 more". Nowhere is that share said.
   - By his maturita areas the losses are: geometry 10, equations and algebra 9, functions 7, sequences 3, combinatorics, probability and statistics 2, numbers and percent 1. The desk cannot group by those areas.
   - (3) He does not connect "Area of rectangles" with his losses. (4) He can tell the list came back, but not why the cylinder became rectangles: the topic's `codes` are computed and never shown (wiring audit).
4. **Other plausible picks**, executed (E10):
   - The inequality filed under N1 → "Start with Equivalent fractions" (5. ročník).
   - The algebraic fraction under A4, plus notation under A1 → "Start with One-step equations" (6. ročník), pulled forward as a prerequisite of "Equations with brackets" (`recovery.ts:205-215`).
   - An analytic-geometry circle question (A16) → on the TV, "The equation of a circle and the tangent · beyond a Foundation paper", a tier from an exam he does not sit.
5. **If he picks nothing at all.** This is quite likely for him: the list is English GCSE wording. E10:
   - The score card says **"1 of 4 marks · 3 marks lost"**.
   - The list row says **"No marks were lost."** (`MathsTV.tsx:716`).
   - The caption says **"No marks were lost on this paper. Type another on the phone any time."** (`paperRows.ts:54`).
   - The card says "2 questions named no statement".
   - Three lines on one screen, two of them false.
6. **From the list to practice.** Select on a topic row: nothing (E12). Back takes him to Get ready for school at **Equivalent fractions** (focus 0). Area is 13 presses right, then Select, then Select on The usual.
   - **16 presses** from the list to a set on the first topic.
   - The set is MB2's: 7. ročník rectangles.

## Scored criteria touched

| C | Result | Evidence |
|---|---|---|
| C3 no maturita / CERMAT claim | pass | No screen string names GCSE, 1MA1 or Edexcel (`recovery.ts:73-79`, `desk/src/lib/library/gcse.ts:157`). There is no maturita claim. But "(beyond a Foundation paper)" (`PaperPanel.tsx:37`, `MathsTV.tsx:730`) brings in a foreign tier unexplained. |
| C4 a question with no matching statement is counted honestly as not on the desk, never forced onto a school topic | **pass** on a mixed paper (E9: "2 questions named no statement, so sit on no topic"; totals include them). Broken on a paper where every question is unmapped (E10, finding 1). | `recovery.ts:147`, `:181`; `MathsTV.tsx:733` |
| C5 the weakest maturita area first, by marks lost; no 5. ročník unit unless the marks say so | **fail** | E9: the lead is a 7. ročník area unit, from a volume question. E10: N1 → 5. ročník Equivalent fractions; A1 → 6. ročník One-step equations. Partial `touches` (`gcse.ts:41`, `:57`, `:60`, `:114`, `:117`) force the question onto the unit. |
| C7 TV lines ≤ 25 words | pass on this screen | caption 23 words; row and card lines short |

## Module metrics

| Metric (rubric unit) | L1 value |
|---|---|
| recovery fidelity | **8 pass / 1 fail** over 9 papers run (E9, E10). His full paper: total 18/50 = typed ✓, recovery order ✓, 13 off-desk statements + 2 unmapped counted ✓, nothing dropped silently ✓. The marks-only paper: **fail**, because the caption and the list say "No marks were lost" against 3 lost. |
| line length | TV caption 23 words; all paper lines ≤ 25 |
| presses (not a rubric metric; D4) | 16 from the list to a set on the first topic |

## Wiring audit

| Builder | Fields computed for the screen | Wired |
|---|---|---|
| `paperView` (`paperRows.ts:25-34`) | `empty`, `marks`, `outOf`, `lost`, `topics[].name`, `.lost`, `.from`, `.secure`, `off[].can`, `.lost`, `.from`, `.beyond`, `unmapped` | 13/13 (`MathsTV.tsx:694-748`) |
| `recovery()` → view | `topics[].codes`: the statements that led a question to a topic | **0 UI hits** (`grep -rn "\.codes" desk/src/maths desk/src/tv/screens.tsx` → none; only `PaperPanel.tsx` reads row codes) |

Ratio **13/14** (unwired: `topics[].codes`). The TV cannot say "from 19, through 'volume of solids'", which is exactly the explanation the misattribution needs.

## Grounding audit

No AI surface on this journey: entry, validation, recovery and the TV are code. The set it leads to is MB-SET **n-a (code)**. The unwired `paperRead.ts` vision path is out of scope.

## Executions

E9. His paper (`scripts/paper.cjs`, 25 rows typed as strings, as the panel sends them):
```
typed: marks 18 of 50 lost 32 | items 25
entry: kept 25 | drops [] | notes 2
totals {"marks":18,"outOf":50,"lost":32}
TOPICS (recovery order):
  1 area | Area of rectangles, triangles and composite shapes | 7. ročník | lost 2 | from 19 | via G17
  2 pythagoras | Pythagoras' theorem | 8. ročník | lost 2 | from 10 | via G20
  3 linear-two-step | Two-step equations | 7. ročník | lost 1 | from 4 | via A21
  4 linear-both-sides | Equations with brackets and x on both sides | 8. ročník | lost 2 | from 2 | via A4
  5-7 dec-convert / pct-of-amount / pct-change | 7. ročník | lost 1 each | from 20 | via R9
NOT ON DESK: A9 2, A12 2, A18 2, A22 2, A24 2, G3 2, G6 2, G25 2, P6 2, A5 1, A10 1, A19 1, A25 1
TV score line: 18 of 50 marks · 32 marks lost | caption: Start with Area of rectangles, triangles and composite shapes. The list runs from the biggest loss, with the base each one needs first.
TV unmapped line count 2 | off shown 3 of 13
```
E10. The branches (`scripts/paper2.cjs`):
```
== inequality picked under N1 | 0 of 4 marks · 4 marks lost | topics: Equivalent fractions (2 from 6) | caption: Start with Equivalent fractions. …
== algebraic fraction under A4 + A1 | 0 of 3 marks · 3 marks lost | topics: One-step equations (1 from 3) ; Equations with brackets and x on both sides (2 from 2) | caption: Start with One-step equations. …
== all off-desk | 0 of 4 marks · 4 marks lost | caption: None of these has a topic on the desk yet.
== circle equation A16 | off: The equation of a circle and the tangent · beyond a Foundation paper (3) | caption: None of these has a topic on the desk yet.
== nothing picked at all (types marks only) | 1 of 4 marks · 3 marks lost | unmapped 2 | topics: - | off: - | caption: No marks were lost on this paper. Type another on the phone any time.
== full marks | 2 of 2 marks · 0 marks lost | caption: No marks were lost on this paper. …
drops for 1,5: ["Question 1 is left out: The marks scored are not a whole number."]
```
The `paperCaption` branches, enumerated:
- `empty`: clean.
- `!topics && !off`: **wrong whenever `unmapped` lost marks** (finding 1); clean for a true full-marks paper.
- `first topic`: correct arithmetic, misattributed lead (finding 2).
- `none on desk`: clean and honest.

The list's fallback row (`MathsTV.tsx:716`) shares the first defect.

E11. Prepare stops for him: `0 frac-equivalent 5. … 13 area 7. … 15 pythagoras 8. 16 probability 9.`

E12. `tvKey` on the paper screen:
```
paper select -> {"events":[],"calls":[],"local":{}}
paper back   -> {"events":[{"type":"nav","screen":"prepare","focus":0}],…}
paper menu   -> {"events":[{"type":"nav","screen":"prepare","focus":0}],…}
```

## Findings

| Key | Severity | Title |
|---|---|---|
| vojtech-18-MB4-1 | blocker | "No marks were lost on this paper" when every lost mark sits on a question with no statement |
| vojtech-18-MB4-2 | blocker | Partial statement links force maturita questions onto 5.–8. ročník units and lead the list with them (C5) |
| vojtech-18-MB4-3 | major | The list never says that 24 of 32 lost marks are off the desk; the off-desk card shows 3 of 13 |
| vojtech-18-MB4-4 | major | No Select on the recovery list; Back lands on Equivalent fractions; 16 presses to a set on the first topic |
| vojtech-18-MB4-5 | major | The statement picker is about 100 English GCSE statements with "beyond a Foundation paper" flags: the hardest step for a Czech B1 learner |
| vojtech-18-MB4-6 | minor | The TV never shows which statement led a question to a topic (`topics[].codes` unwired) |
| vojtech-18-MB4-7 | strength | Totals are exact, and unmapped and off-desk marks are counted apart; no board or exam is claimed |

## Time saved and grounding

- Time saved: **~5 min saved · low**, and a loss if he follows the caption.
  - He has already spent his 30–40 minutes against the key. Typing 25 rows plus translating the statements takes ~15–25 minutes.
  - What he gets back: a correct total, a long and honest "not on the desk" list, and a first step pointing at 7. ročník rectangles.
- Grounding: no AI surface (n-a).

## Voice: Vojtěch, first person

I typed my whole test, 25 rows. The hard part was the list of "what it tests": a hundred English sentences about "Foundation", and I do not know what Foundation is. For logarithms there was nothing, so I left it empty. It told me so honestly: "names no statement, counts in the marks." OK.

The TV says 18 of 50. Right, that is my test. And then: "Start with Area of rectangles." Rectangles? I lost those points on a cylinder.

And if I had not picked anything at all, which nearly happened, it would say "No marks were lost on this paper" with "3 marks lost" right next to it. That is the kind of thing that makes you close the app.

I press OK on the first topic and nothing happens. Back, and I am at fractions again. Would I use it? To count my points, maybe. To know what to practise for May, no. Not yet.
