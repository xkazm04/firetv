# nela-12 × MB2 · Practise a topic and get it marked

- Character: nela-12 (profile `elementary`, 12, `cz`, School maths, Family)
- Journey: MB2 · Practise a topic and get it marked
- Cert level: L1
- Base commit: 12592a71
- **Verdict: L1-conditional.** The typed route is code end to end and marked her answers without one false tick or false ring over 5,039 executed answers. Three majors carry forward:
  - "not sure" items say "I got something different", even when her value is right.
  - Explaining is English speech only.
  - The explain reply cannot see what she wrote.

  The photo route's read is vision: uncertain.

## Reachable surface set

- Tonight → "Teach me something" (`desk/src/tv/keys.ts:303`), opened on the frontier (`keys.ts:187-191`) → Topics (`keys.ts:447-455`).
- A unit with a worked lesson is taught first (`keys.ts:453`, `hasWorked`); her five units all have one (`desk/src/lib/library/worked.ts:9-38`).
- Worked → "Try six" (`keys.ts:457-463`) → `/api/practice` → `makeSchoolItems`, code, no model (`desk/src/lib/desk/items.ts:126-128`, `:367-392`).
- Or Tonight → "Get ready for school" (`keys.ts:305`, `:467-482`), with "The usual" or "A step up" (`desk/src/tv/prepareRows.ts:47-57`).
- Practice → phone `practice` panel (`desk/src/app/phone/panelFor.ts:33`). There she can snap the sheet (`page.tsx:507-519`) or type her answers (`page.tsx:478-505`) → `/api/mark` (`desk/src/app/api/mark/route.ts:58-66`).
- Sheet → walk (`keys.ts:492-513`). On a wrong item there is one typed second go (`page.tsx:527-541` → `/api/second`). On a wrong or unsure item she can hold to explain (`page.tsx:543-553` → `/api/explain`).
- Her answers are read by `learnerSystem` = `cz` (`mark/route.ts:62`, `desk/src/lib/rules/school.ts:2859`).
- Out of scope: Calculus sets (MB-SET model road), the Paper panel.

## Surface model

| # | Affordance | file:line | Route / pipeline | AI sources |
|---|---|---|---|---|
| 1 | Tonight → Teach me something | `MathsTV.tsx:421-433` | nav topics | none |
| 2 | Topics ruler, Select a unit | `MathsTV.tsx:588-613`, `keys.ts:447-455` | `/api/worked` → `lib/desk/worked.ts:40-58` | MB-WORKED (idea only; examples and answers by code, `worked.ts:32-38`) |
| 3 | Worked lesson: idea, 3 steps, 3 examples; Try six | `MathsTV.tsx:1143-`, `keys.ts:457-463` | `/api/practice` → `makeSchoolItems` | MB-SET: **n-a (code)** |
| 4 | Practice sheet on TV: "Work all six on paper…" | `MathsTV.tsx:751-790` | none | none |
| 5a | Phone "Type my answers" → Send | `app/phone/page.tsx:478-505` | `/api/mark {answers}` → `markTyped` → `rules/kinds judgeSet` → `rules/school check(…, "cz")` | none (code) |
| 5b | Phone "Snap the sheet" → Send my working | `page.tsx:507-519` | `/api/mark {image}` → `markSet` → vision `schoolPrompt` (`mark.ts:145-160`) → same code judge | MB-MARK |
| 6 | Sheet: ticks, rings, dashed rings; Six more / Put away | `MathsTV.tsx:864-905`, `keys.ts:492-507` | `/api/practice` or `practice.clear` | none |
| 7 | Walk: one item, the desk's card (slip name, says, "Look at …") | `MathsTV.tsx:907-933`, `:803-829` | none | none |
| 8 | Phone: second go (typed, once) | `page.tsx:527-541` | `/api/second` → `secondGo` (code) | none |
| 9 | Phone: hold "Tell the desk how you got it" | `page.tsx:543-553` | `/api/explain` → `explainSchool` (`explain.ts:100-127`), `best` model; reply checked by `leaksSchool` (`explain.ts:221-223`) | MB-EXPLAIN |

## The walk (in character)

**Step 1, Tonight → Teach me something.** "Pick a topic and the desk writes six questions to work on paper, then marks them from a photo." (19 words). Right, then Select. Questions 1–4: yes. The typed route is not mentioned here, but the phone offers it.

**Step 2, Topics.** The ruler opens at her frontier. She wants "Add and subtract fractions": Right, Right, Select. The kicker reads "Fractions · six questions a set" and the blurb is one sentence.
1–3: yes.
4: the lesson is written ("Preparing…" lines, `MathsTV.tsx:582-587`), then the worked screen lands by itself.

**Step 3, Worked lesson.**
- The idea comes from the model, kept only with no digit and ≤3 sentences (`worked.ts:18-25`).
- Three steps: "Find a common bottom number · Rewrite both fractions with it · Add or take away the tops, then simplify".
- Three examples answered by code for `cz`.
- On a decimals unit the examples mix notations (executed): "Work out 38.2 - 18.38." → "19,82" and "Work out £12.12 × 5." → "£60,60". The question has a point and the answer a comma, in pounds.

1–4: yes. "Try six" is lit. Mum likes seeing the steps.

**Step 4, the set (code, instant).** Sample for her profile (seed 12345): "Work out 4/5 + 7/10. · 11/12 - 5/6. · 1/3 - 2/9. · 5/6 + 3/5. · 4/11 + 1/6. · 3/5 + 7/11."
- Printed denominators are ≤12 over 240 items per unit (add/sub, of-amount; mul/div ≤10).
- In add/sub, 23% of items need a common bottom above 36 (up to 132, "4/11 + 1/6" → 66). A 6. ročník teacher should read that tier (nela-12-MB2-6).

1–4: yes. The TV says "Work all six on paper, then snap the whole sheet with the phone." (23 words). The phone jumps to Practice.

**Step 5, hand it in, typed.** "Type my answers", six boxes, each labelled with its question.
- She types like a Czech child: "1,5", "1 1/2", "6/4", "0,15", "52,04", "75 kg", "30£".
- All read correctly by code under `cz` (repro E4, E7).
- Her real slips are named: 4/5 + 7/10 → "11/15" is `tops-and-bottoms`, and "5204" for £28.85 + £23.19 is `dec-point-dropped`.
- 4. The sheet lands at once (code, `provider "code"`), on the first item to look at.

**Step 6, the sheet and the walk.**
- Right: "Number 3 came back right", a tick.
- Wrong: the slip's name ("Added the tops and the bottoms") and the desk's line, 20 words. "Look at the line where the fractions were combined." On a typed set the "line" is just her answer.
- Not sure: the title says **"The desk is not sure"**, but the card says **"I got something different for number 5. How did you get there?"** That is for "4/22" on "Write 6/33 in its simplest form", whose value is right (repro E8). The reason the code computed, "The value is right; the question asks for it in its simplest form.", is dropped before the store (`maths.ts:155-157` returns null on unsure; `kinds.ts:163` writes `ASK(n)`).

For Nela this reads as "wrong" in front of Mum, the opposite of her own reading of her paper. nela-12-MB2-1.

On the decimals unit, the walk card's slip lines are 27–32 words ("The digits of the product are right but the point is in the wrong place. Count the digits…"), past her A2 limit (nela-12-MB2-5).

**Step 7, second go.** Phone: "Try it again. Work it on paper again, then type just your answer. You get one go."
- Code judges it (repro E7: `secondGo … "cz" → right`).
- The TV draws "That one holds now. The ring stays." or "Not yet. Tell the desk how you got there."
- The phone never shows the verdict. No answer can leak here.

1–4: yes.

**Step 8, explain.**
- "Tell the desk how you got it": hold, speak, let go. The recogniser is **en-US** (`page.tsx:288`).
- A typed box exists only when the browser has no speech recognition (`page.tsx:544-553`).
- Nela explains in Czech, or in single English words ("fraction… bottom number?"). The transcript she sees ("I heard: …") will be garbled English, and Send is her only way on. nela-12-MB2-2.
- If something reaches the model, it sees the question, the transcript, the unit and her memory notes. It does **not** see her answer, her working or the slip the code found (`explain.ts:106-117`), so it cannot "point at the step" she wrote (nela-12-MB2-3).
- The reply is checked by `leaksSchool`, and a leaking reply is replaced by the item's own line (`explain.ts:221-223`).

**Step 9, Six more / Put away.**
- "Six new questions on Add and subtract fractions, aimed at: Added the tops and the bottoms. Work them on paper, like this set." The line is kept ≤25 words by `mathsRows.ts:157-158`.
- Six more is code, aimed at her live slip (`items.ts:357-361`).
- Put away clears it. Tonight's continue card shows a parked set until then.

## Scored criteria touched

| C | Result | Evidence |
|---|---|---|
| C1 (BLOCKER) no answer before she answered | **uncertain (L2)**, code guard present | Practice items have no hint. The explain reply passes `leaksSchool` (`explain.ts:221-223`), and every printed practice question reads back to its spec (`school.ts:3280`). The second go and the sheet lines carry no value (`maths.ts:88-92`, `sheetRows.ts:50-53`). Model text is L2. |
| C2 (BLOCKER) nothing wrong ticked | **pass (typed)**; photo uncertain (L2) | Repro E7: 5,039 answers over 150 code sets on her 5 units, 4,881 decided, **0 false ticks**. |
| C3 decimal comma read | **pass (typed, cz)**; photo uncertain (L2) | "0,5", "1,5", "52,04", "0,968", "x = 0,5" read as decimals (E1, E4). "1.500" is unsure, never wrong. |
| C4 ≤25 words | **fail** | Walk-card slip lines for her units are 26–32 words (E6). The fixed-line share is 46/58. |
| C6 "not sure", never a guessed verdict | **fail** | Unsure items carry "I got something different for number N" (E8), including a right value and a blank answer. |
| C8 6. ročník fractions | **pass (with a note)** | Printed denominators ≤12 for add/sub, mul/div and of-amount (E3, 240 items each), no negatives. Equivalent fractions prints simplify inputs up to /99 by design. The add/sub tier-2 elevenths (lcm to 132) need a teacher's read (MB2-6). |
| C5, C7 | n/a | No hint and no snapped homework on this journey. |

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| false ticks | **0** (typed; 4,881 decided items, value oracle written independently in the script); photo **L2** |
| false rings | **0** (typed; equivalent forms 6/4, 1 1/2, 1,5, 1.5, 0,15, "75 kg", "30£" all right under cz) |
| marking agreement | **1.00** on 4,881 decided typed items, against a value oracle. Caveat: unsimplified sums are ticked where the question does not ask for simplest form (MB2-7), and a Czech teacher may disagree. |
| unsure rate | 158/5,039 = **0.03** over the battery. On the walked six (E8: one unsimplified, one blank): **2/6 = 0.33** |
| slip precision | named as made: `tops-and-bottoms` 6/6, `dec-point-dropped` 5/5, `dec-point-product` 2/2 (E4). Against working: L2 (typed sets have no working) |
| set fit | L2 judge. The walker's reading of the add/sub sample: 4/6 at 6. ročník level (two eleventh items) |
| answer leak | 0 in code lines; explain replies **L2** |
| line length | 46/58 = 0.79 (fixed lines, shared with MB1) |
| time to marked sheet | typed: code, no engine (`mark.ts:224-235`), expected well under 5 s; **L2** to measure. Photo: L2 |
| handwriting read | L2 (vision host) |

## Wiring audit

| Route | User-facing computed fields | Wired | Unwired |
|---|---|---|---|
| `/api/practice` → `practice.set` | items[].question, tier, stretch | 3/3 | none |
| `/api/worked` → `worked.set` | idea, steps, examples (question, answer), own | 4/4 | none |
| `/api/mark` → `practice.marked` | verdict, slip (name, points via `slipById`), said, slipAt, studentAnswer, studentWorking (via `workingLines`, `maths/working.ts:39`), **check().why** | 6/7 | `SchoolVerdict.why` (`school.ts:1488-1513`): computed on every school answer, 0 UI hits; for an unsure item it is replaced by `ASK(n)` |
| `/api/second` → `practice.second` | second | 1/1 | none |
| `/api/explain` → `practice.settle` | reply, settled verdict | 2/2 | none |

## Grounding audit

- **MB-SET: n-a (code).** No model call. Code itself uses Q1 topic, Q2 level and stretch (`stretch.ts:72-77`), Q3 her live slips to aim (`items.ts:128`, `:357-361`), Q4 and Q7 via the school year (`practice/route.ts:31-32`). Q5 and Q6 do not apply.
- **MB-WORKED 3/5.**
  - W1 topic: present (`worked.ts:47`).
  - W2 method steps: present (`worked.ts:47`).
  - W3 age: present (`worked.ts:43-45`).
  - W4 school system: absent from the prompt; used for the examples' answers only.
  - W5 what she got wrong: absent.
- **MB-MARK 2/6** (photo, prompt only).
  - K1 photo: present.
  - K2 the set's items: present (`mark.ts:146`).
  - K3 spec, K4 system, K5 slip vocabulary: not in the prompt by design. They reach the **code judge** (`kinds.ts:100-104`, `school.ts:1665`).
  - K6 age: absent.
  - Named addition: the prompt asks for "a decimal with the comma or point they used" (`mark.ts:151`).
- **MB-EXPLAIN 3/8** (school item).
  - X1 item: present (`explain.ts:108`).
  - X2 her answer: absent.
  - X3 slip code: absent.
  - X4 her explanation: present (`explain.ts:110`).
  - X5 working: absent.
  - X6 age: present (`explain.ts:86-91`).
  - X7 system: absent (used only by `settleSpec`).
  - X8 history on topic: absent. Named addition: memory notes (`explain.ts:111`).

## Executions

All were run from ROOT with `DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/nela-12`. The scripts are in `…/data/nela-12/scripts/`.

- **E3** `node …/scripts/e3.cjs`: sets for age 12, cz.
  - baseline `standard`, step up `harder`, `learnerYear=7`.
  - Over 40 sets each: add/sub max printed denominator 12 (0 over 12), mul/div 10, of-amount 12, equivalent 99 (117/240 over 12). No negatives.
- **E11** `node …/scripts/e11.cjs`: frac-add-sub common denominators: median 12, p90 66, max 132; share >36: 0.23; sets with two or more such items: 43/100.
- **E4** `node …/scripts/e4.cjs`: her answers on one set per unit. Examples:
  ```
  Work out 4/5 + 7/10.  "1,5" -> right  "1.5" -> right  "6/4" -> right  "11/15" -> wrong (tops-and-bottoms)
  Work out 14.5 × 0.6.  "8,7" -> right  "87" -> wrong (dec-point-product)
  Work out £28.85 + £23.19.  "52,04 £" -> right  "52,04 Kč" -> unsure  "5204" -> wrong (dec-point-dropped)
  Write 6/33 in its simplest form.  "4/22" -> unsure
  ```
  The six "<<FALSE TICK" marks this script printed are its own mislabel: the answers were value-correct sums over the product of the bottoms. E7 re-counts with a value oracle.
- **E7** `node …/scripts/e7.cjs`: the battery against an independent value oracle.
  - Result: `{"total":5039,"decided":4881,"ticks":2622,"rings":2259,"unsure":158,"falseTick":0,"falseRing":0,"agreement":"1.0000"}`.
  - `"4/9 - 1/3 = 1/9" -> unsure`; `"" / "nevim" / "?" -> unsure`.
  - `secondGo right cz: right`.
  - `£22,74 cz -> right, uk(default) -> unsure "The desk cannot read this as one number…"`.
- **E8** `node …/scripts/e8.cjs`: `judgeSet`, typed, cz.
  ```
  5 Write 6/33 in its simplest form.  "4/22"  unsure | card: I got something different for number 5. How did you get there? | check.why: The value is right; the question asks for it in its simplest form.
  6 Write 42/77 in its simplest form.  ""     unsure | card: I got something different for number 6. How did you get there? | check.why: There is no answer to check.
  ```
- **E9** `node …/scripts/e9.cjs`: worked examples for cz: `{"question":"Work out 38.2 - 18.38.","answer":"19,82"}`, `{"question":"Work out £12.12 × 5.","answer":"£60,60"}`. `question()` takes no system.
- **E6**: slip "says" lines for her units are 15–32 words. Over 25: added-same 27, one-part-only 27, wrong-factor 28, of-upside-down 26, dec-lined-up 29, dec-point-product 32, dec-point-dropped 27.

## Findings

| Key | Sev | Title |
|---|---|---|
| nela-12-MB2-1 | major (12) | An unsure item's card says "I got something different", even for a right value or a blank; the code's own reason is unwired |
| nela-12-MB2-2 | major (12) | Explaining is en-US speech only; no typed box while a recogniser exists |
| nela-12-MB2-3 | minor (4, uncertain) | MB-EXPLAIN 3/8: the reply cannot see her answer, her working or the slip the code found |
| nela-12-MB2-4 | minor (6) | Questions and worked examples print decimal points and £/€ for a cz learner; answers print commas |
| nela-12-MB2-5 | minor (6) | Walk-card slip lines for her units run 26–32 words (C4) |
| nela-12-MB2-6 | minor (6, uncertain) | Add/sub tier 2 uses elevenths with common bottoms to 132; level for 6. ročník needs a teacher's read |
| nela-12-MB2-7 | minor (6, uncertain) | Unsimplified sums are ticked while the worked lesson teaches "then simplify" |
| nela-12-MB2-8 | strength | Typed marking under cz: 0 false ticks and 0 false rings in 5,039 answers; her two real slips named by code |
| nela-12-MB2-9 | strength | The second go is code-judged, once, with no value shown and nothing recorded |

## Time saved and grounding

- **~10 min saved per set · confidence medium** for the typed route. Instant code marking replaces waiting for the teacher, and her slips are named. The explain step is not usable in her language.
- Photo route: unrated (L2).
- Grounding: MB-SET n-a (code), MB-WORKED 3/5, MB-MARK 2/6 (prompt; the code judge holds K3–K5), MB-EXPLAIN 3/8.

## Voice — Nela, first person

This part I like. I typed "1,5" with a comma like at school and it was right. I typed "11/15" because I added the tops and the bottoms again, and it said exactly that: "Added the tops and the bottoms". That's my mistake. Mum went quiet because it's hers too.

The second go is good: one go, and the TV says "That one holds now". It doesn't say the answer.

But "I got something different for number 5". I wrote 4/22 and it IS the same as 6/33. It just isn't shortened. Then say "shorten it", not "different"! Mum thought I got it wrong.

The "tell the desk" button wants me to talk, in English. I can't explain fractions in English. Nevím, jak se řekne "jmenovatel". Let me type it in Czech.

Why are the questions in pounds? We don't have pounds. And the long sentence about counting digits after the point… too long, I didn't read it.

Would I use it again? Yes, for practice before a test, with typing. I'd tell Bára it marks honestly.
