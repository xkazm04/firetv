# LT run 2026-10-16-lt-placement-oos/recert-4 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 1 Characters · 2 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 1

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| sofie-11 | J1 | conditional - C4 failed: #10 headline 'Your words: “we build spaceship”.' puts her error on the TV; pho… | conditional | 2/3 | A2 vs A2 · exact |  |  | 0 | 10 | 1.7 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 1 · near 0 · miss 0
- **judge agreement:** 4/5 (80%)
- **topic fit:** fit n/a · safe n/a
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **moment recall:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 14 calls, 0 failed, avg 4s · character 10 calls, 0 failed, avg 4s · judge 1 calls, 0 failed, avg 25s
- **driver coverage:** 9 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 18** `LT-sofie-11-J1-2` (clarity) · recurs `2026-10-16-lt-a2b1-tightening/LT-sofie-11-J1-5`, recurrence 2 — TV headline shows her error as 'Your words'
  - expected: Praise-first headline for a child
  - got: 'Your words: “we build spaceship”.'
  - evidence: #10 TV 'Your words\nYour words: “we build spaceship”.' · verdict screen builder
  - acceptance: Headline quotes something she did well, or the corrected form.
- **blocker · rank 18** `LT-sofie-11-J1-3` (clarity) · recurs `2026-10-16-lt-placement-oos/recert-1/LT-sofie-11-J1-4`, recurrence 2 — Level explanation abstract for an 11-year-old
  - expected: Short, plain sentences
  - got: 'B1 was close, but a harder task fell short and what you said pointed lower, so you start at A2.'
  - evidence: #10 phone verdict · verdict summary prompt
  - acceptance: Reason in two short child-friendly sentences.
- **major · rank 12** `LT-sofie-11-J1-1` (senior-quality) · recurs `2026-10-16-lt-a2b1-tightening/LT-sofie-11-J1-4`, recurrence 2 — B2 task marked fail though answer has idea and reason
  - expected: Partial for a clear idea with a reason and only article slips
  - got: B2 · Say it · not yet, while the note says 'You gave an idea and a reason.'
  - evidence: #10 'B2 · Say it · not yet ... You gave an idea and a reason.' for 'i think we build spaceship because it is more fun and we can fly.' · task judge prompt
  - acceptance: Verdict and note agree; an answer with idea plus reason is at least partial.

## What passed

- `LT-sofie-11-J1-4` Tasks themed on her world, exact placement — Roblox, shop and listening tasks; A2 exact; slips shown with corrected forms

## Voices

**Sofie · J1** (time saved: 10 min · low)

> It was fun that it talked about Roblox and YouTube, and the tasks were easy to understand. I did all of it on my phone and it said A2, which feels right. I liked the part where it showed 'built' instead of 'build'. But the TV showing my mistake, 'we build spaceship', as my words was a bit embarrassing, and the long sentence about a harder task falling short I did not really read. It also said 'not yet' for my spaceship answer and then said I gave an idea and a reason, which is confusing. I would use it again for ten minutes after school, but I want more praise first.
