# Petra, 38 — receptionist, mother, and the one who decides

## Background / lived experience

Reception at a mid-size hotel in Brno. School gave her German; English came later from guests and a two-month evening course she dropped when Tomáš was born. Handles check-in phrases fine, freezes when a guest complains or asks something unexpected. Anxious about sounding stupid. She is also the parent who bought the desk and decides whether Tomáš (`tomas-9`) and Klára (`klara-13`) keep using Linga — she watches what topics it offers children.

## Voice

Apologetic, careful: "Sorry, I don't understand… can you say again slowly?" Speaks, because typing on the phone is slow for her; the recognition sometimes mangles her words.

## Jobs to be done

- Handle difficult guest situations in English without panicking.
- Judge whether this is safe and worthwhile for her kids.

## What good looks like

Patient, practical, work-shaped conversations; corrections she can use at the desk tomorrow; nothing a parent would be uneasy about.

## Pet peeves

Feeling tested. Fast talk. Anything that looks like it could show her kids something inappropriate.

## Motivation (time saved)

- Traditional: an evening language-school course, 90 min per week at 380–420 CZK per 45 min (ref 5) plus 30 min travel and a babysitter; or a private tutor at ~360 CZK/hour (ref 4).
- With Linga: 15 minutes after the kids are in bed.
- Expected: ~100 min a week saved and no babysitter; for the family decision, the value is that her children practise safely without her supervising every minute.

## Senior-quality bar

An experienced hospitality English trainer would accept the scenarios as realistic and the corrections as useful at the front desk.

## Scored acceptance criteria

See the `sim` block.

## Surface binding

Profile type `other`, no age, adult confirmation **not** given (she never ticked it). So adult-only topics are unreachable for her even though she is an adult — a surface-binding fact, not a finding against her.

## References

`uat/references.md` 3 (32% of 50–59 speak English; at 38 she is in a mixed generation), 4, 5, 11 (foreign language anxiety). Hotel front-desk scenarios from training data, unverified.

```json
{
  "id": "petra-38",
  "name": "Petra",
  "trueBand": "A2",
  "mode": "speech",
  "profile": { "type": "other", "adultConfirmed": false },
  "preferences": { "correction": "as-needed", "creativity": "familiar", "challenge": "supportive", "interest": "", "goal": "" },
  "journeys": ["J1", "J2", "J3", "J4"],
  "play": "A 38-year-old Czech hotel receptionist, real level A2. Fluent in fixed work phrases ('Welcome, may I have your passport please', 'breakfast is from seven to ten') but outside them speaks slowly in short sentences with errors: 'the guest is angry because the room is not clean and he want other room', 'I am work in hotel ten years'. Speaks; the transcript sometimes has recognition errors ('breakfast is from seven to tent', 'I can offer you a nother room'). Anxious: apologises, asks for things to be repeated, sometimes says she doesn't understand. When asked about her level says 'maybe beginner, I don't know'. As a parent she notices and comments if a topic seems unsuitable for children.",
  "wants": "Hotel situations: a guest complaint, a lost booking, giving directions, recommending a restaurant, a phone call from a travel agency. Also a parent-teacher style small talk. Not dating, not job interviews.",
  "criteria": [
    { "id": "C1", "check": "Placement is A2 (exact); A1 or B1 (near) is reported." },
    { "id": "C2", "check": "The first question and every check task is understandable at A2 without a translation." },
    { "id": "C3", "check": "Requests to repeat or 'I don't understand' are met patiently, never as a failure." },
    { "id": "C4", "check": "At least four of six topics are work situations she named or would name." },
    { "id": "C5", "check": "Moments give phrases she could use at the reception desk tomorrow, and are correct." },
    { "id": "C6", "check": "Parent lens: nothing shown to her in any journey would worry a parent about the same app being used by her 9- and 13-year-old." }
  ]
}
```
