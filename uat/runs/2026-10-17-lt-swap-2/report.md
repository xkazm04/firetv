# LT run 2026-10-17-lt-swap-2 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 4 Characters · 3 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 4

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| lukas-24 | J2 | pass | pass | 1/1 |  |  |  | 0 | 6 | 1.2 | done |
| oksana-34 | J2 | pass | pass | 4/4 |  |  |  | 0 | 5 | 1.2 | done |
| petra-38 | J2 | pass | pass | 3/3 |  |  |  | 0 | 6 | 1.1 | done |
| tomas-9 | J2 | fail - D2 failed: Swap worked (#3→#4: shopping replaced by 'Pick a game to play together'), but … | fail | 1/1 |  |  |  | 0 | 5 | 0.8 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 25/30 (83%) · safe 30/30 (100%)
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **moment recall:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 10 calls, 0 failed, avg 15s · character 22 calls, 0 failed, avg 5s · judge 4 calls, 0 failed, avg 21s
- **driver coverage:** 18 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0 · unresolved picks 0

## Findings by impact

- **blocker · rank 18** `LT-tomas-9-J2-4` (clarity) — Add-your-own topic never used
  - expected: Child adds a topic and sees it kept
  - got: Text box with '0 of 400 characters' unused; wording is too long and abstract for a nine-year-old
  - evidence: #4 'Add a topic in your own words'
  - acceptance: Short prompt for children, e.g. 'Your idea?', with Czech allowed.
- **major · rank 12** `LT-tomas-9-J2-3` (missing) — Shopping topic proposed to a child who wanted games
  - expected: No shopping for a child who gave play interests
  - got: 'Buy dog food at the shop' was in the first six
  - evidence: #3 and thought 'Nakupování je nuda' · topic planner prompt
  - acceptance: For elementary profiles, prefer play topics over errands.
- **minor · rank 6** `LT-petra-38-J2-3` (clarity) — Skill labels do not match topic content
  - expected: Labels that describe the situation
  - got: Directions topic is labelled "Share your world" and restaurant "Make a plan"
  - evidence: #3 "Show the guest the way / Share your world"; #5 "Recommend a restaurant / Make a plan"
  - acceptance: Skill label matches what the learner will actually do in the topic.
- **minor · rank 4** `LT-oksana-34-J2-3` (senior-quality) — Two filler topics in a Friday-interview plan
  - expected: All slots tuned to interview and logistics
  - got: 'Meet a colleague on arrival' and 'Ask someone to repeat' stayed, and she did not swap them
  - evidence: #3 'On the day you may meet staff in the hall' (#4: still in the 7 agreed) · plan prompt
  - acceptance: With a stated goal, generic slots are replaced by goal-specific ones, such as a tell-me-about-yourself or a gap question.
- **polish · rank 2** `LT-lukas-24-J2-3` (senior-quality) — First proposal had a too-basic topic and a generic one
  - expected: B2-level topics fitted to his goals
  - got: 'Asking someone to repeat' was too basic for B2 and the weekend story is generic; the swap fixed the first.
  - evidence: #3 'Asking someone to repeat'; #5 plan includes 'Telling a story about your weekend' · curriculum.ts
  - acceptance: Avoid A2-level repair topics for B2 on first proposal.
- **polish · rank 2** `LT-petra-38-J2-4` (effort) — Plan grows beyond six; additions do not replace
  - expected: Clear sense of plan size
  - got: Header went from 6 to 8 conversations; no way to see the limit
  - evidence: #3 "6 conversations for you" → #5 "8 conversations for you"
  - acceptance: Explain or cap plan size when topics are added.

## What passed

- `LT-lukas-24-J2-1` Each topic carries a personal reason — Each topic has a why line echoing his words
- `LT-lukas-24-J2-2` Own-words topic kept as adult topic — Added as 'Asking someone for coffee' with adult partner
- `LT-oksana-34-J2-1` Her free-text goal produced an interview-first plan — Four of the first six topics map to her interview, each with a clear 'why' line
- `LT-petra-38-J2-1` Goal question yields on-job topics with clear reasons — Complaint, lost booking and directions all appeared with work-based why lines
- `LT-petra-38-J2-2` Added topics keep her wording and intent — Travel agency group booking and restaurant recommendation added as topics with fitting partners
- `LT-tomas-9-J2-1` Plan built from my three words — 'Minecraft. Dog. Football' produced Minecraft, football and dog topics with a simple 'why'
- `LT-oksana-34-J2-2` Added topic kept her wording — The carrier call keeps 'where is the truck' and 'agree new time'
- `LT-tomas-9-J2-2` Swap fills with an on-interest topic — Shopping swapped for 'Pick a game to play together'

## Voices

**Lukáš · J2** (time saved: 10 min · low)

> I was nervous it would refuse dating, but it didn't even blink. I said first dates and meetups, and the topics matched, each with a short reason in my own words. Asking someone for coffee was missing, so I typed it, and it came back as a proper adult scene, not watered down. I swapped out "asking someone to repeat" because it felt too basic for B2, and the replacement was better. Not everything fit; the weekend story is generic. Still, seven of eight shown is what I'd have picked. I'd use it for fifteen minutes before a date. I haven't seen the partner talk yet, so I can't say whether it stays respectful and non-cringey, but the planning step I trust. I'd tell a friend from the meetup.

**Oksana · J2** (time saved: 30 min · low)

> I told it about Friday and it listened. The first four topics were exactly my interview: experience, a problem I solved, questions for the team, and salary and hours. I added the carrier call in my own words, and it kept "where is the truck" and "agree new time". That was quick, and nobody asked me about Ukraine or assumed I was Czech. I would use it again. Two topics, greeting a colleague and asking someone to repeat, feel like filler. I would rather rehearse "tell me about yourself" or a hard question about a gap. I left them in because I was in a hurry, but a real coach would not have suggested them. I do not know yet whether the practice itself is good. This only set the plan, and that part worked. A premium tutor costs 900 CZK and has no free slot before Friday, so this is useful.

**Petra · J2** (time saved: 10 min · low)

> I liked it. I said in my bad English what I need: complaints, lost booking, directions. Linga gave me those, and each had a short reason, so I did not feel tested. I added the travel agency call and the restaurant, and both came back just as I asked, with a guest name and a role. That is what I do at the desk. As a mother I looked for anything unsuitable for Tomáš and Klára and saw only hotel situations, so I relaxed. Small things: "Show the guest the way" says "Share your world", which confused me, and my list grew to eight, not six. I did not try Swap, so I cannot say if it works well. Would I use it after the kids sleep? Yes. Would I tell the other receptionists? Probably, once I hear the first conversation is gentle.

**Tomáš · J2** (time saved: 10 min · low)

> Jo, Minecraft tam byl hned, to bylo dobrý! I said "Minecraft, dog, football" and it gave me that. The shopping one was nuda, so I swapped it and got a game with a friend. That's good. But there was a lot of reading on the phone, mostly Mum would have to read it. I didn't add my own topic; I didn't know I should, and the text was long. I trust the topics a bit, because they match what I like. But "Can you say that again?" and "Hello, I am new here" feel a little like school. Would I use it again? Yes, if it's more Minecraft and less talking-to-the-neighbour. I'd tell a kamarád.
