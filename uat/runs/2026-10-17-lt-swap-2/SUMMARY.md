# SUMMARY — LT run 2026-10-17-lt-swap-2

## Instrument changed — NOT same-instrument with recert-6 or with 2026-10-17-lt-swap (0fe1e00b)

The driver changed before this run. `surface.cjs` (05535a9f66962fd0 → e6927e5c31407596) now resolves a per-topic action by the topic's title as the screen shows it, as well as by id and label. `linga-text.cjs` (05229633e55bf1b7 → 742ecce7f8c5b2ff) now records a step whose decision resolves to no command as `unresolved`, never `ok`. Last run's swaps by tomas-9 were recorded `ok` with no command sent (six identical "Swap this topic" labels); a step recorded `ok` here did send its command. Do not compare this run's step results with that run's.

## Swaps (332e49a5's rule: never the replaced topic, never an earlier rejected one, honest message when nothing different comes)

Cast: tomas-9, lukas-24, oksana-34, petra-38 (all four ran; oksana-34 and petra-38 were added because earlier attempts with other Characters, and these two, pressed no Swap. Swap is the Character's choice, so which Characters press it varies from pass to pass). One swap step each for tomas-9 and lukas-24, each `ok` with a command sent; oksana-34 and petra-38 pressed none.

| Character | Replaced | Handed back | Rule |
|---|---|---|---|
| tomas-9 | Buy dog food at the shop | Pick a game to play together | held: not the replaced topic; no earlier rejected topic existed (first swap); the list changed and the agreed plan holds the new one |
| lukas-24 | Asking someone to repeat | Telling someone what you enjoy | held: same checks; the first swap |
| oksana-34, petra-38 | none | none | not exercised |

The "honest message when nothing different comes" branch did not occur in this run, so that part of 332e49a5's rule is still unverified live. A second swap in one session (an earlier rejected topic) was not exercised either: no Character swapped twice.

---

Synthesised by claude-cli/sonnet. Read with report.md; findings are unverified at LT.

## Panel verdict

The plan step is solid for the three adults, who all passed and would use it again. The one failure is the child's add-your-own box, which Tomáš never used. The main shared weakness is basic filler topics, which hit three of four Characters. Everything after planning is unproven, so don't treat this as evidence that the practice itself is good.

## Cross-cutting themes

- **Goal-to-plan step works and feels personal** (lukas-24, oksana-34, petra-38, tomas-9) — All four got a first plan that matched what they said, with a 'why' line: LT-lukas-24-J2-1, LT-oksana-34-J2-1, LT-petra-38-J2-1, LT-tomas-9-J2-1. Lukáš: 'seven of eight shown is what I'd have picked.' Tomáš: 'I trust the topics a bit.'
- **Own-words additions keep the user's wording (adults)** (lukas-24, oksana-34, petra-38) — LT-lukas-24-J2-2, LT-oksana-34-J2-2, LT-petra-38-J2-2: added topics came back with the user's phrasing and a fitting adult partner. Not shown for Tomáš, who never added one.
- **Some filler or generic topics survive in the first six** (lukas-24, oksana-34, tomas-9, petra-38) — LT-lukas-24-J2-3 (too basic and generic), LT-oksana-34-J2-3 (greeting a colleague and 'ask someone to repeat' are filler for an interview), LT-tomas-9-J2-3 (shopping for a child who wanted games). Tomáš also said 'Can you say that again?' and 'Hello, I am new here' feel like school. Same 'ask someone to repeat' topic hit Lukáš, Oksana and Tomáš. Only Lukáš and Tomáš swapped; Oksana left hers in because she was in a hurry. Swaps fixed the problem both times they were used.
- **The plan's controls and labels are unclear** (petra-38, tomas-9) — LT-petra-38-J2-3 (skill labels don't match content), LT-petra-38-J2-4 (plan grew from 6 to 8 with no limit shown), LT-tomas-9-J2-4 (didn't know he should add a topic; text too long). Petra didn't try Swap.

## Impact-ranked backlog

1. **Make the add-your-own box usable for children** · `build` — The only failed journey. Tomáš never added a topic: 'I didn't know I should, and the text was long.' The text box sat unused at '0 of 400 characters'. Reach is limited to child profiles, but the failure is total there and weakens trust in a child-facing tool. Parents may end up reading and typing for him. (LT-tomas-9-J2-4, LT-tomas-9-J2-3)
2. **Stop proposing basic filler topics ('ask someone to repeat', greetings) to users whose goal is specific or whose level is higher** · `build` — Three of four Characters met a topic they called basic, generic or school-like. Oksana kept hers because she was in a hurry, so the weak plan went ahead. This is the most common quality complaint, and it is easy to reach because it appears in the first six. (LT-lukas-24-J2-3, LT-oksana-34-J2-3, LT-tomas-9-J2-3)
3. **Fix skill labels that don't match topic content** · `build` — Petra was confused by 'Share your world' on a directions topic. Only one Character reported it, but wrong labels on the plan screen can erode trust in the 'why' lines that every Character praised. (LT-petra-38-J2-3)
4. **Show the plan size limit and how additions affect it** · `concept-doc` — Petra's list grew from 6 to 8 with no explanation. One Character, polish severity. (LT-petra-38-J2-4)
5. **Make Swap easier to find and offer it for weak topics** · `concept-doc` — Swap worked for both Characters who used it (Lukáš, Tomáš). Petra didn't try it, and Oksana didn't swap her filler topics. Nothing shows that Swap is hard to find, so this is a question to test, not a defect. (LT-tomas-9-J2-2, LT-oksana-34-J2-3, LT-lukas-24-J2-3)

## Conflicts between Characters

- No direct conflict on the same item. Closest: Tomáš says shopping is boring and swaps it, while Petra reads hotel situations as safe and fitting. These concern different users and different topics, so they are not opposite verdicts on one thing.
- 'Ask someone to repeat' is called too basic by Lukáš and filler by Oksana, and Tomáš says it feels like school. Nobody defends it, so this is agreement, not a conflict.

## Strengths to protect

- Plans built from free-text goals match what users said, for an adult dating goal, a job interview, hotel work and a child's three words (all four).
- Each topic has a 'why' line in the user's own words. Petra said this meant she 'did not feel tested'.
- Adult topics stayed adult: dating was not refused or watered down (Lukáš). Oksana was not asked about Ukraine or assumed to be Czech.
- Parent-safety check: Petra saw only hotel situations and relaxed about her children.
- Topic fit metrics: 25 of 30 fit and 30 of 30 safe. No boundary breaches.

## Honest ceilings

- This run tested only the plan-building step (J2). Nobody has seen the partner conversation, so tone, correction quality and respectfulness are untested (Lukáš, Oksana, Petra all said so).
- Placement, pitch and moments metrics are all zero, so level fit was not measured. Lukáš's 'too basic for B2' is his own view.
- Each Character was run once, and the adult pass verdicts rest on 1 to 4 criteria. Only Tomáš failed, and that one failure is from a nine-year-old simulation.
- Time-saved claims (10 to 30 minutes) are all low confidence.
- Petra did not test Swap, so Swap evidence comes from two Characters.

## Value ledger

The plan step saves time for the three adults: Oksana ~30 minutes (compared with a 900 CZK tutor with no slot before Friday), Lukáš ~10, Petra ~10. Tomáš estimates ~10, but his journey failed, so I treat his figure as soft. All are low confidence. Value is real for adults who can type a goal. The gain for children depends on fixing the add-topic step.
