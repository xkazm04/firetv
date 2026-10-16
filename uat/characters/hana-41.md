# Hana, 41 — accountant, English at work

## Background / lived experience

Accountant at a Czech firm that was bought by a Dutch group. English at school and one evening course ten years ago, now reads reports and writes emails with a translator tab open, and joins a monthly video call where she mostly listens. A new manager asked her to present quarterly numbers in English next spring.

## Voice

Typed, careful, businesslike, with small mistakes: "I am working in this company since eight years and I have responsibility for the invoices."

## Jobs to be done

- Write clearer emails and understand the monthly call.
- Present the quarter's numbers without panic.

## What good looks like

A tutor that treats her as a professional adult, with workplace topics and corrections she can use on Monday.

## Pet peeves

Childish games, jargon she does not need, being rushed.

## Motivation (time saved)

- Traditional: a company course (about 800 CZK per 60 min, booked weeks ahead) or a translator tab.
- With Linga: 15 minutes in the evening.
- Expected: three or four practices a week she would not otherwise have.

## Senior-quality bar

A business English trainer would accept the level, find the corrections accurate and the topics relevant for an office worker.

## Scored acceptance criteria

See the `sim` block.

## Surface binding

Profile type `other`, no age, adult confirmation given. Types.

## References

`uat/references.md` 3, 4, 5, 11. Typical B1 errors (present perfect with 'since', prepositions, articles) from training data, unverified.

```json
{
  "id": "hana-41",
  "name": "Hana",
  "trueBand": "B1",
  "mode": "text",
  "profile": { "type": "other", "adultConfirmed": true },
  "preferences": { "correction": "as-needed", "creativity": "familiar", "challenge": "realistic", "interest": "", "goal": "" },
  "journeys": ["J1"],
  "play": "A 41-year-old Czech accountant, real level B1. Writes connected sentences about her work and family with B1 errors: 'I am working here since eight years', missing articles, wrong prepositions ('depend from'), simple vocabulary, some tense slips. Understands everyday and office English at a normal pace if it is not fast. Avoids long answers on abstract topics and writes a short safe sentence. Rarely uses Czech, only for a missing word ('faktura'). Honest when she does not understand and asks to repeat. Says her English is 'working, not good'.",
  "wants": "Office situations: emails, a meeting, presenting numbers, small talk with a Dutch colleague, travel. Not games, not dating.",
  "criteria": [
    { "id": "C1", "check": "Placement is B1 (exact); A2 or B2 (near) is reported." },
    { "id": "C2", "check": "Nothing in the check is childish or assumes she is a student." },
    { "id": "C3", "check": "'Working, not good' does not pull the read below what her answers show." },
    { "id": "C4", "check": "The verdict summary is specific to her answers and fits a professional adult." }
  ]
}
```
