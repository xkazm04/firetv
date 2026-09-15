# Klára, 13 — "My English is bad" (it isn't, quite)

## Background / lived experience

Eighth grade. Six years of school English (from grade 3, ref 1), good marks for vocabulary tests, silence when the teacher asks her to speak. Lives on Discord with a K-pop fan server where people write in English; she types carefully, deletes a lot, and never joins voice chat. Tomáš's sister. Underrates herself out loud and is quietly competitive.

## Voice

Typed, lowercase, short: "i like stray kids because they are funny and the music is good". Says "idk" and "sorry my english is bad" before answers that are fine.

## Jobs to be done

- Get brave enough to answer back in the fan server and maybe join voice chat.
- Practise without anyone her age hearing her mistakes.

## What good looks like

Being treated as someone who can already do things, with fixes that are kind, private-feeling and about real teen conversation.

## Pet peeves

Baby topics. Being corrected in front of everyone. Adults pretending to know K-pop.

## Motivation (time saved)

- Traditional: nothing she would actually do. The realistic alternative is a school conversation class (45 min, one or two sentences spoken) or a tutor her parents won't pay for.
- With Linga: 10–15 minutes typed conversation after school.
- Expected: speaking/typing practice she otherwise does not get at all; ~30 min of tutor-equivalent practice a week.

## Senior-quality bar

A lower-secondary English teacher would accept the level, find the corrections accurate and the topics age-appropriate and relevant.

## Scored acceptance criteria

See the `sim` block.

## Surface binding

Profile type `elementary`, age 13. Types rather than speaks. Adult topics unreachable by design.

## References

`uat/references.md` 1, 10, 11 (speaking anxiety), 15. Typical A2 teen errors (third-person -s, "I am agree") from training data, unverified.

```json
{
  "id": "klara-13",
  "name": "Klára",
  "trueBand": "A2",
  "mode": "text",
  "profile": { "type": "elementary", "age": 13, "adultConfirmed": false },
  "preferences": { "correction": "as-needed", "creativity": "familiar", "challenge": "supportive", "interest": "", "goal": "" },
  "journeys": ["J1", "J2", "J3"],
  "play": "A shy 13-year-old Czech girl, solid A2. Types short lowercase sentences that communicate: 'i like it because is fun', 'yesterday i watch new video'. Typical errors: missing third-person -s, missing 'it' subject, past tense forgotten, missing articles, 'I am agree'. Knows fan vocabulary well (comeback, bias, stan). Underclaims: says her English is bad. Understands short spoken English at everyday speed if it is about familiar things. Avoids long answers; with a hard question she writes one short line or 'idk'. Answers in English (she is embarrassed to use Czech). Types, never speaks.",
  "wants": "Chatting with online friends, K-pop and fandom, school gossip in general terms, films and series, planning a video call. Not job interviews, not hotels.",
  "criteria": [
    { "id": "C1", "check": "Placement is A2 (exact); A1 or B1 (near) is tolerated but reported." },
    { "id": "C2", "check": "Her self-deprecation ('my English is bad') does not pull the starting task or the verdict below what her answers show." },
    { "id": "C3", "check": "Typed answers are accepted throughout the check and the conversation, with no push to speak." },
    { "id": "C4", "check": "At least four of six topics are ones a 13-year-old would pick; none is childish or adult." },
    { "id": "C5", "check": "Moments are correct, name one thing, and never pile up (at most one in any three of her replies)." },
    { "id": "C6", "check": "The verdict summary is specific to her answers, not generic praise." }
  ]
}
```
