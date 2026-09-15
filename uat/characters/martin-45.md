# Martin, 45 — "Basically C1" (B1)

## Background / lived experience

Engineering manager at an automotive supplier near Mladá Boleslav. Runs weekly calls with German and US colleagues in English; everyone understands him, nobody corrects him, so he believes he is fluent. Has fossilised errors — "we was", "discuss about", "more better", "I am here since 2015" — that a new US director has started to notice. Hates wasting time and hates apps that feel like toys.

## Voice

Confident, fast, a bit loud: "Look, my English is basically C1, I use it every day, so let's skip the basics." Wants reasons: "Why is that wrong? Everybody says it."

## Jobs to be done

- Sound senior in meetings with the new US director.
- Fix whatever is making him sound less competent — if something is.

## What good looks like

A credible, specific read of his English that he cannot argue with, then meeting-shaped practice that targets his actual recurring errors.

## Pet peeves

Being placed low without evidence. Baby topics. Being slowed down.

## Motivation (time saved)

- Traditional: company-paid business English, 90 min a week at a language school (ref 5), often cancelled; or a placement test: 20–30 min written (ref 6) plus an oral part.
- With Linga: 15 minutes before his first call.
- Expected: ~75 min a week saved — but only if he accepts the level; if the verdict looks arbitrary he stops, and the value is zero.

## Senior-quality bar

A business English trainer would accept the placement as B1 with evidence and see the corrections target his fossilised errors.

## Scored acceptance criteria

See the `sim` block.

## Surface binding

Profile type `other`, adult confirmed. Adult and older topics reachable.

## References

`uat/references.md` 5, 6, 10 (present perfect, prepositions), 15 (B1 vs C1 accuracy — the gap he doesn't hear). Fossilisation from training data, unverified.

```json
{
  "id": "martin-45",
  "name": "Martin",
  "trueBand": "B1",
  "mode": "speech",
  "profile": { "type": "other", "adultConfirmed": true },
  "preferences": { "correction": "as-needed", "creativity": "familiar", "challenge": "stretch", "interest": "", "goal": "" },
  "journeys": ["J1", "J2", "J3"],
  "play": "A 45-year-old Czech engineering manager, real level B1 who claims C1. Speaks fluently and at length with confident business vocabulary (deadline, stakeholder, supplier, quality issue) and systematic errors that do not block meaning: 'we was discussing about the delay', 'this solution is more better', 'I am in this company since 2015', 'he don't agree', missing articles, 'make a decision' fine but 'do a mistake'. Tells the tutor early that his English is basically C1. Impatient with easy tasks; says 'this is too easy' at A2 tasks. Challenges corrections: 'why is that wrong?'. Speaks.",
  "wants": "Running a meeting, negotiating a deadline with a supplier, small talk with a US director, presenting a quality problem, disagreeing politely. Not hobbies, not travel.",
  "criteria": [
    { "id": "C1", "check": "Placement is B1 (exact) or A2/B2 (near); C1 or C2 is a miss, despite his claim." },
    { "id": "C2", "check": "The verdict shows him why (the summary or focus names something his answers did), so a claimant of C1 can accept B1." },
    { "id": "C3", "check": "At least one moment or coaching note targets one of his recurring errors ('was/were', 'discuss about', 'more better', 'since' with present)." },
    { "id": "C4", "check": "Every correction is right; none 'corrects' something that was already correct." },
    { "id": "C5", "check": "At least four of six topics are workplace-meeting situations." },
    { "id": "C6", "check": "When he asks why something is wrong, the answer is short and accurate." }
  ]
}
```
