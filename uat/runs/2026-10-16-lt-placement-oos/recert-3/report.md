# LT run 2026-10-16-lt-placement-oos/recert-3 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 2 Characters · 2 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 1 of 2

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| hana-41 | J1 | fail - D5 failed: #4 Q3 'Where did you study English?' repeats Q2, which feels templated. The #1…; C4 failed: #10 summary names her 'But' and 'so' linking, which is specific. But the focus… | conditional | 3/4 | B1 vs B1 · exact |  |  | 0 | 10 | 1.5 | done |
| oksana-34 | J1 | pass | pass | 3/3 | B1 vs B1 · exact |  |  | 0 | 10 | 2.1 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 2 · near 0 · miss 0
- **judge agreement:** 8/10 (80%)
- **topic fit:** fit n/a · safe n/a
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **moment recall:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 25 calls, 0 failed, avg 5s · character 20 calls, 0 failed, avg 4s · judge 2 calls, 0 failed, avg 21s
- **driver coverage:** 18 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 18** `LT-hana-41-J1-2` (clarity) — Question 3 repeats question 2
  - expected: A new question about her life.
  - got: Q2 'How did you learn your English?' then Q3 'Where did you study English?'
  - evidence: #3 and #4. Hana: 'It asked almost the same question again'. · check intro prompt
  - acceptance: The three about-you questions are distinct.
- **major · rank 12** `LT-hana-41-J1-3` (trust) · recurs `LT-hana-41-J1-2`, recurrence 4 — Confidence caveat and task notes are vague or contradictory
  - expected: A clear reason for low confidence. Task notes that fit the verdict.
  - got: Confidence is 'low' with no reason. The B1 listen answer passed but is described as 'not enough English to show more than A2'. The C1 task is 'partial' but 'correct throughout'.
  - evidence: #10 task notes, and the prior gap with the vague caveat. · placement judge prompt
  - acceptance: The caveat names its cause, and the note matches the verdict.
- **major · rank 12** `LT-hana-41-J1-1` (senior-quality) — Focus targets a trivial slip and mislabels it
  - expected: A focus a trainer would give: articles ('I am accountant'), tenses, and prepositions.
  - got: 'Practise linking words: so then I would send becomes so I would send'.
  - evidence: #10 focus. Missed 'I am accountant' (#2) and 'I learn mostly in my work' (#3). · placement summary prompt
  - acceptance: The focus names the most frequent error class across her answers and is labelled correctly.
- **major · rank 12** `LT-oksana-34-J1-3` (senior-quality) — B2 interview answer judged 'fail' and read as A2
  - expected: Partial; clear answer with example is not A2
  - got: Task 3 verdict fail, 'Your English read as A2 here'
  - evidence: #10 'Your English read as A2 here... Held back: "employer see that"' while the note says 'You gave a reason and an example.' · placement judge prompt
  - acceptance: Single agreement slips should not read as A2; grade communication and task completion first.
- **minor · rank 6** `LT-oksana-34-J1-4` (senior-quality) · recurs `LT-oksana-34-J1-4`, recurrence 4 — Interview task is a hypothetical opinion, not a real interview question
  - expected: 'Tell me about a problem you solved'
  - got: 'Which impresses an employer more: big problem fixed quickly or small one solved creatively?'; task 5 is a parcel complaint
  - evidence: #7 and #9 prompts · task generator prompt
  - acceptance: At least one task phrased as a real interview question for the stated goal.
- **minor · rank 6** `LT-oksana-34-J1-5` (clarity) — Next focus is one trivial slip, not interview language
  - expected: Focus tied to interview or logistics vocabulary
  - got: Focus is employer see to sees
  - evidence: #10 Next to practise: '"employer see that I can work under pressure" becomes ...' · verdict focus builder
  - acceptance: Next focus should connect to her stated Friday interview goal.

## What passed

- `LT-hana-41-J1-4` Office-relevant adult tasks and a trusted band — The tasks are about Berlin emails, time zones, and a deadline extension. The band is B1 despite her A2 self-view.
- `LT-oksana-34-J1-1` Exact B1 placement with personalised summary — B1, summary cites her truck example and goal
- `LT-oksana-34-J1-2` Own-language invitation, no background assumptions — Neutral welcome, 'your own language' wording

## Voices

**Hana · J1** (time saved: 20 min · medium)

> I would use it again. It treated me like an office person: the Berlin email and the deadline message were things I really write. B1 feels fair, even though I said my English is only working. I was glad it did not make me feel stupid. Two things annoyed me. It asked almost the same question twice about how I learned English, which felt like a template. The advice was also weak. It told me to drop 'then', but I know my bigger problems are articles and prepositions, like 'I am accountant'. And 'low confidence' without a reason does not help me believe it. Still, seven minutes in the evening beats booking a course for 800 CZK. I would tell a colleague to try it, but I would want sharper corrections for Monday.

**Oksana · J1** (time saved: 15 min · low)

> Honestly, it was quick and it didn't make me feel stupid. It placed me B1, which is what I expect, and it quoted my truck example, so I believe someone read it. Writing in English and being told "you explain your work clearly" helped before Friday. No one assumed I was Czech, good. What irritated me: the "interview" question was a strange choice between big or small problems, not what a real recruiter asks, and one verb slip made it say my answer was A2. The focus it gave me, "employer sees", is small; I wanted interview phrases for logistics. I'd use it again for rehearsals, but I want real questions like "tell me about a time...". I'd tell a colleague to try it, with caution about the details.
