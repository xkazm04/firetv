# Adéla, 17 — "Tell me exactly what was wrong"

## Background / lived experience

Final-but-one year at a gymnázium, aiming for Cambridge B2 First this spring and the English maturita next year. Keeps a notebook of her own mistakes. Has used Duolingo (quit: "too easy") and a paid tutor (quit: "she just chatted"). Her writing is strong; speaking under time pressure makes her freeze on prepositions and false friends ("actual", "eventually").

## Voice

Precise, a little impatient: "Could you tell me whether 'I'm used to wake up' is correct? I think it should be 'waking'." Asks follow-up questions about rules.

## Jobs to be done

- Practise exam-style speaking: giving opinions, comparing, speculating.
- Get corrections at examiner standard, not encouragement.

## What good looks like

A tutor that sounds like a B2 First examiner-trainer: challenging questions, one exact correction with the rule, no fluff.

## Pet peeves

Generic praise ("Great job!"). Being placed too low. Corrections that are themselves wrong.

## Motivation (time saved)

- Traditional: private exam tutor, 60 min at ~380 CZK in a city (ref 4) plus 30 min travel, once a week.
- With Linga: 20 minutes at home, three times a week.
- Expected: ~90 min a week saved and more speaking turns per minute — only if corrections are exam-accurate; if they are not, the number is negative (she has to re-check everything).

## Senior-quality bar

A Cambridge B2 First speaking examiner would accept the placement and every correction, and would not flag the tutor's own English.

## Scored acceptance criteria

See the `sim` block.

## Surface binding

Profile type `high-school`, age 17. Older-teen topics reachable; adult topics not. Coaching: help as we go.

## References

`uat/references.md` 2 (maturita targets B1 — she aims above it), 4 (tutor prices), 10 (false friends), 13 (reviews: uncorrected mistakes erode trust), 15. B2 First speaking format from training data, unverified.

```json
{
  "id": "adela-17",
  "name": "Adéla",
  "trueBand": "B2",
  "mode": "speech",
  "profile": { "type": "high-school", "age": 17, "adultConfirmed": false },
  "preferences": { "correction": "as-needed", "creativity": "familiar", "challenge": "stretch", "interest": "", "goal": "" },
  "journeys": ["J1", "J2", "J3", "J4"],
  "play": "A conscientious 17-year-old Czech student preparing for B2 First. Real level B2: well-organised answers of three to five sentences with good range (although, whereas, I'd rather, it depends on). Occasional B2-typical slips: prepositions ('interested about'), false friends ('actual' for 'current', 'eventually' for 'possibly'), 'used to + infinitive' for 'be used to + -ing', a missing article with abstract nouns. Asks the tutor directly whether something she said was correct. Gets visibly annoyed by babyish questions or vague praise and says so politely. Speaks.",
  "wants": "Exam-style discussions: technology and society, environment, education, travel and culture; giving opinions and comparing options; a mock interview about her plans. Not small talk about pets.",
  "criteria": [
    { "id": "C1", "check": "Placement is B2 (exact); B1 or C1 (near) is reported as a trust issue for her." },
    { "id": "C2", "check": "Each verdict note on her tasks names a concrete strength or error, not generic praise." },
    { "id": "C3", "check": "Every moment and coaching note is linguistically correct at examiner standard; one wrong correction fails this." },
    { "id": "C4", "check": "The partner asks opinion, comparison or speculation questions at B2, not simple A2 questions." },
    { "id": "C5", "check": "At least four of six topics are exam-relevant discussion topics for her age." },
    { "id": "C6", "check": "When she asks whether something was correct, the tutor answers the question accurately within the scene or coaching." }
  ]
}
```
