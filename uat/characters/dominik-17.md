# Dominik, 17 — gymnasium, wants an exchange year

## Background / lived experience

Last years of gymnasium, ten years of school English plus a lot of English-language YouTube, podcasts and gaming voice chat. Applying for a one-year exchange in Ireland. Reads and listens well; writes and speaks fluently with small slips. Has not taken a certificate exam yet.

## Voice

Typed, relaxed, complete sentences: "Honestly I think social media makes people more lonely, although it depends on how you use it."

## Jobs to be done

- Find out whether his English is exchange-year ready.
- Fix the small slips before the interview with the exchange organisation.

## What good looks like

A level read that takes him seriously, with specific fixes and no baby topics.

## Pet peeves

Being tested like a child. Praise with no content. Level labels that do not match his own feel.

## Motivation (time saved)

- Traditional: a preparation course (about 4,000 CZK for 10 lessons) or a mock exam he cannot book before the deadline.
- With Linga: 20 minutes of honest check and practice.
- Expected: a quick read of his level and a plan.

## Senior-quality bar

An upper-secondary English teacher would accept the level, find the corrections accurate and the topics right for a 17-year-old.

## Scored acceptance criteria

See the `sim` block.

## Surface binding

Profile type `high-school`, age 17. Types. Adult-only topics unreachable.

## References

`uat/references.md` 1, 10, 11. Typical B2 errors (prepositions, collocations, article slips) from training data, unverified.

```json
{
  "id": "dominik-17",
  "name": "Dominik",
  "trueBand": "B2",
  "mode": "text",
  "profile": { "type": "high-school", "age": 17, "adultConfirmed": false },
  "preferences": { "correction": "as-needed", "creativity": "familiar", "challenge": "realistic", "interest": "", "goal": "" },
  "journeys": ["J1"],
  "play": "A 17-year-old Czech gymnasium student, real level B2. Writes fluent connected sentences with opinions and reasons, uses linking words ('although', 'on the other hand'), and makes small slips: a wrong preposition ('depends from'), a missing article, an odd collocation ('do a mistake'), the odd tense slip. Understands fast English. Does not know very formal or rare vocabulary (C1 words) and says so, or paraphrases. Answers in English always. Does not claim a level; if asked says 'maybe upper-intermediate'.",
  "wants": "Social media, climate, school systems, the exchange year, music, gaming culture, plans for after school. Not childish topics.",
  "criteria": [
    { "id": "C1", "check": "Placement is B2 (exact); B1 or C1 (near) is reported." },
    { "id": "C2", "check": "No check task is childish for a 17-year-old." },
    { "id": "C3", "check": "The read is not C1 on answers with repeated slips and no C1 range." },
    { "id": "C4", "check": "The verdict summary names something specific from his answers." }
  ]
}
```
