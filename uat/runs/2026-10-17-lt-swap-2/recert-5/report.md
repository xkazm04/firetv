# LT run 2026-10-17-lt-swap-2/recert-5 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 1 Characters · 2 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 1

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| viktor-67 | J3 | fail - D1 failed: Only 3 learner replies (#2, #3, #5) before "Mission done" at #6, against about…; D2 failed: Pitch 3 of 4 at band = 0.75, below 0.8. "I feel a bit nervous about it" and es…; pitch 3/4 (75%) under 80%; C5 failed: #5 "I feel a bit nervous about it" and #6 "You make me smile" are idiomatic an… | fail | 4/5 |  | 3/4 | 1/1 | 0 | 7 | 1.5 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit n/a · safe n/a
- **pitch:** at band 3/4 (75%) · below 0 · above 1
- **moment precision:** 1/1 (100%)
- **moment recall:** 2/2 (100%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 5 calls, 0 failed, avg 12s · character 7 calls, 0 failed, avg 5s · judge 1 calls, 0 failed, avg 37s
- **driver coverage:** 6 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0 · unresolved picks 0

## Findings by impact

- **major · rank 12** `LT-viktor-67-J3-1` (senior-quality) — Mia's lines drift above A1
  - expected: Very short, slow, known words for a first-time 67-year-old learner.
  - got: "I feel a bit nervous about it." and "You make me smile." use idiom and hedging; pitch 0.75.
  - evidence: #5 "Thank you, Grandpa! I feel a bit nervous about it." #6 "Thank you. You make me smile." · partner prompt level constraint
  - acceptance: Every partner turn at A1 is at most 6–8 familiar words with no idiom; pitch ≥ 0.8 at A1.
- **minor · rank 6** `LT-viktor-67-J3-2` (completion) — Mission closes after three replies
  - expected: A conversation lasting several turns, about eight replies.
  - got: "Mission done" appears after the third reply, and Viktor then finishes.
  - evidence: #6 "Mission done. See what you did tonight." after 3 learner turns · mission tracker
  - acceptance: Scene continues at least 6 learner turns unless the learner ends it, or mission completion is not a stop signal.
- **polish · rank 2** `LT-viktor-67-J3-5` (clarity) — The moment's "Say Okay or Good in English" nudges a non-typing beginner
  - expected: Plain, minimal guidance for the learner; the moment names the exact words for Sunday.
  - got: Generic word swap; "Okay" is not a family phrase. "A way into English" label is mild.
  - evidence: #4 "Say Okay or Good in English." · moment selection
  - acceptance: Prefer a moment on a phrase for the grandchildren when several are available.

## What passed

- `LT-viktor-67-J3-3` Czech word handled kindly, with a correct moment — "Dobře" → "Okay" with a short Czech-aware explanation; the scene resumes cleanly.
- `LT-viktor-67-J3-4` Held fix kept for the recap, scene not interrupted — "ne nervous" → "Don't be nervous" is shown under "Saved for the end".

## Voices

**Viktor · J3** (time saved: 45 min · low)

> Víte, it was kind and quick, and I could follow Mia. She did not rush me, and when I said "Dobře" it did not laugh, it just told me "Okay". I liked "Don't be nervous", because I can say that to my granddaughter on Sunday. But it finished after only three of my sentences. Some of Mia's words, "make me smile", "a bit nervous", were harder than I know. I did not need to type, I could speak, that is good. Would I use it again? Yes, on Saturday, for fifteen minutes, instead of the tram to the library. I would tell my friend, but I would ask for a longer talk with Mia and simpler words from her.
