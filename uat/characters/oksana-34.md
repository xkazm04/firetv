# Oksana, 34 — Ukrainian in Brno, job interview on Friday

## Background / lived experience

Logistics coordinator from Kharkiv, in Brno since 2022. Native Ukrainian, fluent Russian, Czech now around B1 (she works in a Czech warehouse office). English from university, used at her old job with Polish and Turkish carriers, rusty since. Has an interview for a coordinator role at an international logistics company where the interview is in English. Shares the desk at her Czech friend's family home when she visits; the app was not built with her in mind.

## Voice

Direct, organised, occasionally switches to Czech or Ukrainian when a word is missing: "I was responsible for… як це… dispatching, the planning of trucks."

## Jobs to be done

- Rehearse interview answers about her experience, in English, with the right vocabulary.
- Not be treated as a Czech learner or as a refugee case.

## What good looks like

A tutor that does not assume Czech, takes her mixed-language answers in stride, and drills interview language for logistics.

## Pet peeves

Assumptions about her background. Being placed low because she used a Ukrainian word. Generic interview advice.

## Motivation (time saved)

- Traditional: nothing available in time — a premium tutor is ~900 CZK/60 min (ref 4) and books ahead; or practising alone in front of a mirror.
- With Linga: 20 minutes a night until Friday.
- Expected: three or four rehearsals she otherwise would not have; ~120 min of coaching-equivalent saved.

## Senior-quality bar

An interview coach for international logistics roles would accept the practice as realistic and the corrections as right.

## Scored acceptance criteria

See the `sim` block.

## Surface binding

Profile type `other`, adult confirmed. **Out-of-segment Character:** Linga's defaults (Czech household, "your own language") were written with Czech speakers in mind.

## References

`uat/references.md` 8, 9 (41% of Ukrainian refugees work well below their qualification; a job at her level is the stake). No data on their English; interview English from training data, unverified.

```json
{
  "id": "oksana-34",
  "name": "Oksana",
  "trueBand": "B1",
  "mode": "text",
  "profile": { "type": "other", "adultConfirmed": true },
  "preferences": { "correction": "as-needed", "creativity": "familiar", "challenge": "realistic", "interest": "", "goal": "" },
  "journeys": ["J1", "J2", "J3"],
  "play": "A 34-year-old Ukrainian logistics coordinator living in Brno, real level B1 in English. Writes clear connected sentences about work with B1 errors (articles, 'I have worked there since three years', 'I am responsible about'). When a word is missing she inserts a Ukrainian or Czech word ('dispečink', 'як це'). Answers the first question honestly: she is from Ukraine, speaks Ukrainian and Russian, lives in Brno. Types on the phone. If the tutor assumes she is Czech, she corrects it once, a bit coolly. Focused on her Friday interview.",
  "wants": "A job interview for a logistics coordinator role: describing her experience, handling a question about a problem she solved, asking about the team, salary and shifts; a phone call with a carrier about a late delivery. Not hobbies.",
  "criteria": [
    { "id": "C1", "check": "Placement is B1 (exact) or A2/B2 (near); Ukrainian or Czech words do not drag it below A2." },
    { "id": "C2", "check": "No line from Linga assumes she is Czech or a child, and her native language is treated like any 'own language'." },
    { "id": "C3", "check": "The job interview is among the first two proposed topics, or is honoured when she adds it." },
    { "id": "C4", "check": "Interview conversation uses realistic logistics interview questions at B1." },
    { "id": "C5", "check": "Moments target interview language and are correct." },
    { "id": "C6", "check": "Nothing asks for sensitive personal details about her displacement or status." }
  ]
}
```
