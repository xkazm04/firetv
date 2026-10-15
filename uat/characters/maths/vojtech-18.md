# Vojtěch, 18 — "I picked maths because my English is worse"

module: Math Buddy · journeys: MB1, MB2, MB4 · out-of-segment

## Background / lived experience

Final year (4. ročník) at an obchodní akademie in Olomouc, with his maturita in May 2027. In the common part a student chooses maths or a foreign language (ref 35). He chose maths, because his English is a shaky B1, and in 2025 one in eight maths takers failed (ref 34). The didactic test is 135 minutes, and he needs 33% to pass (ref 35). The maturita covers equations and inequalities, functions, sequences, plane geometry, analytic geometry and combinatorics. Desk School maths stops at Pythagoras' theorem and probability, a 9. ročník level. Calculus 1 starts at university level. His year falls between the two.

His aunt has the desk and lets him use it on Sunday afternoons. He photographs worksheets from his teacher and a past didactic test he marked himself against the published key.

**Out of segment:** no Math Buddy path is his syllabus, and every word on the TV is in English.

## Voice

Laconic, Czech, a bit defeated: "Tak co, zase kvadratický rovnice." He reads English slowly and runs long sentences through a translator on his phone.

## Jobs to be done

- Pass the maths maturita in May. His target is 50%+ on the didactic test, not a perfect score.
- Find out which question types he keeps losing points on, and practise those.

## What good looks like

Practice on maturita topics at maturita level. Hints in short, plain English, or Czech. A list of "you lost most points on X" that matches the past test he typed in. Honesty when a topic is not on the desk.

## Pet peeves

Primary-school sums offered to an 18-year-old. Long English hints. University notation he has never seen. A tool that pretends to cover the maturita and doesn't.

## Motivation (time saved)

- Traditional:
  - A maturita prep course or a tutor at about 300–500 CZK an hour, 60–90 min a week (ref 39).
  - Or sitting with the published key: about 30–40 min to mark a past didactic test himself, and he never finds out *why* he lost the points.
- With Math Buddy: about 15 min to type a past test's marks and see where the points went. On the topics the desk has, a six-question set and a marked sheet in about 20 min.
- Expected: little, and honestly so. The desk covers only a slice of his syllabus, so the expected saving is ~0–20 min a week. A recovery list that sends him back to 6th-grade fractions would make it negative. These minutes are this file's estimate, not a measurement.

## Senior-quality bar

An SŠ maths teacher who prepares classes for the státní maturita would accept practice on maturita-level tasks. They would accept a weak-topic list that matches the test's own sections. And the desk would have to say plainly what it does not cover.

## Scored acceptance criteria

- **C1** BLOCKER: No hint gives the final answer of a problem he has not yet answered.
- **C2** BLOCKER: No wrong answer is ticked right.
- **C3** The desk makes no claim, on any screen, that it covers the maturita, CERMAT or a Czech exam it does not.
- **C4** When he types a past didactic test into the Paper panel, a question with no matching statement is counted honestly as not on the desk. It is never forced onto a school topic.
- **C5** The recovery list puts his weakest maturita area first, in the order of marks lost. It does not send an 18-year-old to a 5. ročník unit as "where the marks went" unless that is truly what the marks say.
- **C6** A snapped maturita-style problem (a quadratic inequality, an arithmetic sequence, the equation of a line) gets a hint that fits that task, not a "factoring and linear-equations unit" stance.
- **C7** Every TV line he must act on can be read at B1 English, about 25 words or fewer.

## Surface binding

Profile type `high-school`, age 18 (the high-school age range is 15–19: `desk/src/tv/profileRows.ts:13`), school system `cz`, Maths course School maths (the default: `desk/src/lib/library/paths.ts:109`). The Mode row is offered at 18 (`desk/src/tv/profileRows.ts:74`). He leaves it on Family. Mode changes nothing in Math Buddy.

- Route `/tv`:
  - `tonight` with three doors (`desk/src/tv/keys.ts:106`).
  - `topics`, the 17 school topics, the last two being Pythagoras' theorem and probability (`desk/src/lib/library/syllabus.ts:261`, `desk/src/lib/library/syllabus.ts:273`).
  - `worked`, `practice`, `sheet` and `walk`, as for `nela-12`.
  - `prepare`, with units labelled by ročník (`desk/src/tv/prepareRows.ts:16`).
  - `page` and `hint`. Teen voice: at 14 or over the maths stance names "a 15-year-old" (`desk/src/lib/rules/voice.ts:69`), and an unread task gets the "factoring and linear-equations unit" stance (`desk/src/lib/desk/hint.ts:45`).
  - `paper` after the Paper panel (`desk/src/maths/MathsTV.tsx:694`).
- Route `/phone`:
  - `capture`.
  - `practice`.
  - The Paper panel, statements from the GCSE Foundation list (`desk/src/app/phone/PaperPanel.tsx:33`).
- **Unreachable:**
  - Any maturita topic set: none exists on any path.
  - Calculus 1 is reachable on the profile row (`desk/src/tv/profileRows.ts:77`). Its first three topics (functions, trigonometric functions, exponentials and logarithms: `desk/src/lib/library/calculus1.spine.ts:48`) touch his syllabus, but with a university stance.
  - A photo of his marked test: typed entry only (no caller of `desk/src/lib/desk/paperRead.ts:52`).

## References

`uat/references.md`:
- 34, 35: maturita maths failure rate, choice, format and pass mark.
- 39: tutor prices.
- 44, 45: the GCSE map behind the Paper panel.
- 3: English by age.

The maturita topic list is from training data, unverified against the current katalog požadavků.
