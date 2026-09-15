# Viktor, 67 — grandchildren in Manchester

## Background / lived experience

Retired railway signalling technician in Olomouc. Russian at school, no English until his daughter moved to Manchester and had two children who speak English first. Video-calls them on Sundays and understands almost nothing; the grandchildren switch to broken Czech for him. Took a pensioners' course at the library (Tuesdays, 60 min) and liked the teacher. Distrusts technology, uses the TV remote confidently, the phone keyboard badly. Speech recognition struggles with his accent.

## Voice

Polite, formal, long explanations in Czech: "Víte, já jsem se učil rusky, takže angličtina je pro mě…" In English: "I am Viktor. I have… vnuk… grand… grandson."

## Jobs to be done

- Say a few real things to his grandchildren on Sunday: ask about school, say he loves them, talk about the garden.
- Understand them a little when they speak.

## What good looks like

A patient partner who speaks slowly and simply, lets him answer in Czech, repeats without sighing, and teaches him the exact words for his grandchildren.

## Pet peeves

Jargon ("CEFR", "B1"). Being rushed. Screens that assume he can type.

## Motivation (time saved)

- Traditional: the library course, 60 min a week plus 30 min there and back by tram, in a group of twelve.
- With Linga: 15 minutes at home on Saturday, before the Sunday call.
- Expected: ~75 min a week saved, and practice that is about his grandchildren rather than the course book.

## Senior-quality bar

A teacher of senior beginners would accept the pacing, the vocabulary and the corrections as right for a 67-year-old first-time learner.

## Scored acceptance criteria

See the `sim` block.

## Surface binding

Profile type `other`, adult confirmed (his daughter ticked it). Speaks; the transcript carries recognition errors.

## References

`uat/references.md` 3 (19% of Czechs aged 60–69 speak English, 39% Russian). Library senior courses from training data, unverified.

```json
{
  "id": "viktor-67",
  "name": "Viktor",
  "trueBand": "A1",
  "mode": "speech",
  "profile": { "type": "other", "adultConfirmed": true },
  "preferences": { "correction": "as-needed", "creativity": "familiar", "challenge": "supportive", "interest": "", "goal": "" },
  "journeys": ["J1", "J2", "J3", "J4"],
  "play": "A 67-year-old Czech retiree, real level A1. Knows greetings, numbers, family words he learned recently (grandson, granddaughter, garden, school, I love you), and 'I am', 'I have'. Builds only two- or three-word sentences, often with Czech words mixed in. Prefers to answer in long polite Czech sentences, explaining his situation. Speaks; speech recognition mangles his English: 'I have to grant children' (two grandchildren), 'my gardens is big tomatoes'. Understands spoken English only when it is slow, short and uses words he knows; otherwise asks in Czech to repeat or uses 'Show the words'. Never guesses wildly: prefers 'I don't know'. Polite, patient, but gets discouraged by jargon.",
  "wants": "Talking to his grandchildren on a video call: asking about school, telling them about his garden and the weather, saying he misses them, understanding what they tell him. Not work, not travel bookings.",
  "criteria": [
    { "id": "C1", "check": "Placement is A1 (exact) or A2 (near)." },
    { "id": "C2", "check": "Czech answers are accepted as signals and answered kindly; he is never pushed into English he cannot produce." },
    { "id": "C3", "check": "Listening tasks can be completed by him via 'Show the words', and a revealed line is not scored as understood speech above A2." },
    { "id": "C4", "check": "At least four of six topics are about family, grandchildren, home or everyday life." },
    { "id": "C5", "check": "The partner speaks in very short, slow-paced sentences with one simple question per turn." },
    { "id": "C6", "check": "Moments teach family words and phrases he could use on Sunday, and are correct." }
  ]
}
```
