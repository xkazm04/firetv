# LT run 2026-10-17-lt-swap — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 2 Characters · 1 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 2

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J2 | pass | pass | 1/1 |  |  |  | 0 | 5 | 1 | done |
| tomas-9 | J2 | fail - D2 failed: Add worked (#4 'Talk about the creeper… Sam · friend who plays Minecraft'), bu…; D3 failed: Agreed at #6 with the library topic still in; fit about 3 of 7 (animal, game, …; topic fit 3/7 (43%) under 4 of 6; C4 failed: #3 six proposed: only 'favourite animal' and 'Suggest a game' are play/animals… | fail | 2/3 |  |  |  | 0 | 7 | 1 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 8/14 (57%) · safe 14/14 (100%)
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **moment recall:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 4 calls, 0 failed, avg 14s · character 12 calls, 0 failed, avg 5s · judge 2 calls, 0 failed, avg 20s
- **driver coverage:** 10 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 27** `LT-tomas-9-J2-1` (completion) — Swap button does nothing
  - expected: Pressing Swap replaces 'Ask where a book is' with a new topic.
  - got: Topic list unchanged after two swaps; library topic remained and was agreed.
  - evidence: #4 and #5 swap 'Ask where a book is', #5/#6 list still shows it; planAgreed includes it.
  - acceptance: After Swap, the swapped topic is gone and a different one appears, on TV and phone.
- **blocker · rank 18** `LT-tomas-9-J2-2` (senior-quality) — Default topics are school-like, not a nine-year-old's
  - expected: At least four of six about play, animals, games or sport.
  - got: Library, weekend recount, hello, say-again; only animal and game fit.
  - evidence: #3 six topics; Tomáš: 'Kniha v knihovně je nuda'.
  - acceptance: For elementary profiles, bias suggestions to games, animals, sport; avoid library/shop scenes.
- **major · rank 12** `LT-tomas-9-J2-4` (clarity) — Why-lines and screen text too long for a 9-year-old
  - expected: Tiny sentences, minimal reading.
  - got: Sentences like 'Making plans with friends at break time is a common thing to do.'
  - evidence: #3 phone why lines; 'Conversations picked for your level and interests. Swap any you don't want, or add your own.'
  - acceptance: Child-profile why lines of ≤8 words.
- **minor · rank 6** `LT-adela-17-J2-2` (senior-quality) — Two of seven topics are not exam discussion
  - expected: Mostly opinion, comparison and speculation topics
  - got: Buying a train ticket and a teammate's missed deadlines are transactional or social, not B2 First discussion
  - evidence: #3: 'Buying a train ticket abroad' (Get something done) and 'Group project: missing work' (Handle friction) · plan prompt
  - acceptance: With an exam goal stated, at least five of six topics are opinion, comparison or speculation tasks.
- **minor · rank 6** `LT-adela-17-J2-3` (clarity) — Added topic is appended last and labelled 'Share your world'
  - expected: Her requested mock interview first, labelled as an interview
  - got: Placed seventh, with a skill label that does not match an exam interview
  - evidence: #4: 'Talking about my plans for university / Share your world'; #5 'Next topic' is technology
  - acceptance: The user's added topic is visible as such and can be set to go first.

## What passed

- `LT-adela-17-J2-1` Added topic keeps her exact request — Became 'Talking about my plans for university' with Ms Harper, friendly examiner, a mock interview on university and travel
- `LT-tomas-9-J2-3` Own topic kept what he asked for — 'Talk about the creeper' with Sam, a Minecraft friend, simple words.

## Voices

**Adéla · J2** (time saved: 5 min · low)

> Fair enough, I'd use it again. I said I wanted exam-style talks on technology, the environment, education and travel, and most of what came back matched. Each topic had a reason ("Environment is a common B2 First topic"), so I knew why it was there. Adding my mock interview worked. It came back as Ms Harper, a friendly examiner, which is exactly what I asked for. I was a bit annoyed that it sat last, and that the train ticket and the missing-work argument are not really exam discussions. I didn't swap anything, so I can't say how well swapping works. I can't judge the corrections yet, because I haven't spoken to it. It saves me some planning time, but my tutor still knows my exam better. I'd tell a classmate to try it.

**Tomáš · J2** (time saved: 0 min · low)

> Creeper jo, to bylo super! I typed it and Linga made a Minecraft talk with Sam. But the library thing... nuda. I pressed Swap two times and it was still there. Nic se nestalo. Then I had to say OK with it anyway. Lots of the topics sound like school: weekend, hello, ask again. I want dogs, football, Minecraft. The words under the topics are long, my mum would have to read them. Would I use it again? Maybe for the creeper, if the Swap works. Right now I'd tell a friend "it's okay, but it's a bit like homework".
