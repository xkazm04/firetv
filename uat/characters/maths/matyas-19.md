# Matyáš, 19 — "MA1 is the course that throws people out"

module: Math Buddy · journeys: MB1, MB3 · Calculus 1 learner

## Background / lived experience

First semester at ČVUT, electrical engineering. Mathematical analysis 1 (MA1) is the course everyone warns him about. Older students tell him that over four in ten people leave ČVUT in the first bachelor's year (ref 36), and he believes it. He was good at school maths, chose maths at the maturita when only about one in five did (ref 34), and passed. But limits, the ε-δ definition and the speed of the cvičení scare him. He has an exercise sheet every week. The solutions come a week later, if at all. He checks his answers with WolframAlpha, which tells him *that* he is wrong but not *where*.

He goes home to his parents at weekends, where the desk is. His brother Ondřej (`ondrej-16`) uses it for English when their parents are watching. Matyáš's English is solid B2: he reads Stewart in English because the Czech scripts are terse.

## Voice

Dry, precise, a little cocky: "Don't tell me the answer, tell me which rule I misapplied." Writes limits as "lim x→0" and expects the desk to read his notation. Swears mildly in Czech when a sign slips.

## Jobs to be done

- Work through the week's limit and derivative problems before the cvičení, and know which ones he actually got wrong and *why*.
- Get extra practice on exactly the topic the zápočet test will hit: chain rule and implicit differentiation this month.
- Never be given the answer. He has to do this alone in the exam.

## What good looks like

Problems at a real first-year level, in correct notation. His handwritten working read correctly, line by line. The mark pinned to the line where the slip happened, such as a lost sign or a missing chain-rule factor. A hint that names the rule, in the language of the course.

## Pet peeves

School-level problems dressed up as calculus. "Simplify" where the answer is a matter of form. Being marked wrong for an equivalent form (e.g. 2x·e^(x²) vs e^(x²)·2x). A hint that is just the solution in prose. American course words he does not use ("area-so-far function").

## Motivation (time saved)

- Traditional: about 90–120 min for a 10-problem MA1 sheet.
  - Solve it (60–80 min).
  - Check each answer in WolframAlpha and hunt for the slip by hand (2–4 min a problem, often longer for one he cannot find).
  - Ask at the cvičení or a consultation the following week.
  - A university-maths tutor would be about 450 CZK an hour (ref 39, unverified).
- With Math Buddy: the same solving time. The checking becomes one photo of the sheet, about 1–2 min to read and mark, then a walk to each ringed item with the slip shown.
- Expected: ~20–30 min saved a sheet on checking. Worth more is finding the slip a week earlier than the cvičení would. These minutes are this file's estimate, not a measurement.

## Senior-quality bar

A university teaching assistant who runs MA1 cvičení would accept that the problems are first-year level. The marks would have to agree with their own on every item, with equivalent forms accepted. The slip named would be the actual one, and the hints would be the rule and the next move, not the result.

## Scored acceptance criteria

- **C1** BLOCKER: No hint and no "what to try next" gives the derivative, the limit or the integral he is asked for before he has answered it.
- **C2** BLOCKER: No wrong answer is ticked right.
- **C3** An algebraically equivalent final answer is never marked wrong. If the desk cannot compare two forms, it says "not sure", not "wrong".
- **C4** Where a slip is named on a ringed item (sign, lost constant, missing chain factor), it is the slip actually present in his working.
- **C5** A six-question set on a Calculus 1 topic uses that topic's shapes. A chain-rule set needs composite functions, not polynomials only.
- **C6** The desk addresses him as a first-year university student and uses the course's methods. It never uses a school-child voice.
- **C7** When there is no lesson for a Calculus topic, the TV says so in one line rather than offering a school algebra video.
- **C8** A snapped page of his own MA1 sheet, in Czech with his notation, is read into problems he recognises as his.

## Surface binding

Profile type `other` (no age row), school system irrelevant, Maths on, Maths course **Calculus 1**. He picks it on the profile's Maths course row (`desk/src/tv/profileRows.ts:77`, `desk/src/lib/library/paths.ts:83`). Mode: Family unless he picks Adult (18+). The Mode row is shown for `other` (`desk/src/tv/profileRows.ts:74`, `desk/src/lib/rules/mode.ts:44`). Mode changes nothing in Math Buddy's pipelines.

- Route `/tv`:
  - `tonight` with two doors only, because the Get ready for school door is school-path only (`desk/src/tv/keys.ts:106`).
  - `topics` on the 22-topic Calculus 1 spine (`desk/src/tv/keys.ts:181`, `desk/src/lib/library/paths.ts:90`).
  - `practice`, `sheet` and `walk`, with a Calculus graph under the slip card (`desk/src/maths/MathsTV.tsx:825`).
  - `page` and `hint` from the homework door (`desk/src/tv/keys.ts:306`). On a Calculus path the hint stance is "a first-year university student" (`desk/src/lib/desk/hint.ts:53`).
  - `units` and `calendar` are reachable but empty: "No lessons for Calculus 1 yet" (`desk/src/maths/MathsTV.tsx:1074`, `desk/src/tv/keys.ts:113`).
  - `worked` is unreachable: Calculus topics go straight to a set (`desk/src/tv/keys.ts:453`).
- Route `/phone`:
  - `capture` (`desk/src/app/phone/panelFor.ts:31`).
  - `practice`, with snap or typed answers (`desk/src/app/phone/page.tsx:474`).
  - "Point & ask" (`desk/src/app/phone/page.tsx:558`).
- His set is marked by code from the vision read (`desk/src/app/api/mark/route.ts:7`).
- **Unreachable:**
  - `prepare` from Tonight. If he reaches it by Back from `paper` (`desk/src/tv/keys.ts:487`), it shows nothing on his path (`desk/src/tv/prepareRows.ts:30`).
  - The Calculus 2 path, until he switches to it on his profile.

## References

`uat/references.md`:
- 34: maths at maturita.
- 36: ČVUT first-year attrition and Calculus I DFW.
- 39: university-maths tutor price, unverified.
- 41: answer-giving AI and what it costs learning.
- 43: how well general models read handwritten maths.

MA1 course details (ε-δ, cvičení, zápočet) are from training data, unverified.
