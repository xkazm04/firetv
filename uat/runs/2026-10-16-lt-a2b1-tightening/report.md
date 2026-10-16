# LT run 2026-10-16-lt-a2b1-tightening — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 3 Characters · 8 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 3

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ivana-33 | J1 | pass | pass | 4/4 | B1 vs B1 · exact |  |  | 0 | 9 | 1.8 | done |
| petra-38 | J1 | pass | pass | 4/4 | B1 vs A2 · near |  |  | 0 | 10 | 2.5 | done |
| sofie-11 | J1 | conditional - C2 failed: #7 'What made the speaker give up on the first one?' has no 'first one' in the… | conditional | 2/3 | A2 vs A2 · exact |  |  | 0 | 10 | 2.1 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 2 · near 1 · miss 0
- **judge agreement:** 11/14 (79%)
- **topic fit:** fit n/a · safe n/a
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **moment recall:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 36 calls, 0 failed, avg 6s · character 29 calls, 0 failed, avg 6s · judge 3 calls, 0 failed, avg 26s
- **driver coverage:** 26 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **major · rank 12** `LT-ivana-33-J1-2` (trust) — Verdict says placed one level lower to be safe, with low confidence
  - expected: A level she can use on a form, with no hint of downgrade
  - got: 'Linga placed you one level lower than your answers alone, to be safe.'
  - evidence: #9 phone verdict; facts confidence 'low'. Suggests the answers read B2 and she was shaded down. · placement tightening A2/B1 rule
  - acceptance: Explain the downward nudge clearly or avoid it when task answers are solid
- **major · rank 12** `LT-petra-38-J1-1` (trust) — B1 placement rests on one answer and the notes contradict it
  - expected: A2 or a hedged band, consistent with the notes.
  - got: B1 verdict. The notes say 'Those kept the English at A2' (#10) while the band stays B1.
  - evidence: #10 'Only one strong answer showed this level'; the Task 5 note says 'kept the English at A2'. · placement scoring / verdict prompt
  - acceptance: When the notes say A2 limits, the band follows or the summary explains why B1.
- **major · rank 12** `LT-sofie-11-J1-2` (clarity) — Listen task refers to 'the first one' that was never said
  - expected: Question answerable from the audio alone
  - got: 'What made the speaker give up on the first one?' while the audio says 'that jumping game'
  - evidence: #7 prompt versus heard line 'I stopped playing that jumping game last month.' · check task generation prompt
  - acceptance: Listen questions must reuse words from the audio and not point at unseen context.
- **major · rank 12** `LT-sofie-11-J1-4` (trust) — Note praises the answer while the verdict is fail
  - expected: Feedback that matches the verdict, framed kindly
  - got: B2 'not yet' with the note 'gave a clear reason'; a child may read it as failing
  - evidence: #10 B2 · Say it · not yet
  - acceptance: Show a 'not yet' task as 'a bit more next time'; do not label a clear answer as a fail.
- **minor · rank 6** `LT-ivana-33-J1-4` (clarity) — Next focus is a generic template line
  - expected: A focus tied to something she did
  - got: 'Say a little more in each answer'
  - evidence: #9 Next to practise
  - acceptance: Name a concrete next step, such as comparing with 'while'
- **minor · rank 6** `LT-petra-38-J1-2` (senior-quality) — Two B2 opinion tasks are a poor check for an A2 receptionist
  - expected: Tasks near A2-B1 that practise desk language.
  - got: Two B2 opinion questions (#7, #8) that she answers with an apology.
  - evidence: #7 'Do you think hotels should focus more on food or on friendly service?' · check task selection
  - acceptance: Step up in smaller increments; avoid stacking two B2 tasks.
- **minor · rank 6** `LT-sofie-11-J1-3` (senior-quality) — B2 task wording too abstract for an 11-year-old
  - expected: Simple wording for a child at the top of the ladder
  - got: 'a game by one creator... another creator's version of the same game'
  - evidence: #8 task text · elementary profile task prompt
  - acceptance: Child-profile hard tasks use concrete, short scenarios, for example 'Which game is better, and why?'
- **minor · rank 6** `LT-sofie-11-J1-5` (clarity) — Verdict quotes her error as 'Your words'
  - expected: Warm headline for a child
  - got: 'Your words: "i want play it"' shown as the focus quote
  - evidence: #10 TV 'Your words'
  - acceptance: Show the correct form first, or a positive quote, for child profiles.
- **polish · rank 2** `LT-ivana-33-J1-3` (senior-quality) — Task 3 marked partial for a correct reasoned answer
  - expected: A correct, reasoned answer credited fully at B1
  - got: verdict partial, 'compare it with working from home'
  - evidence: #7 and #9 'B2 · Say it · nearly there'
  - acceptance: Note the comparison gap without lowering credit
- **polish · rank 2** `LT-sofie-11-J1-6` (trust) — Placement lowered one level 'to be safe', confidence low
  - expected: Clear, plain reason for the level
  - got: 'Linga placed you one level lower than your answers alone, to be safe.'
  - evidence: #10 phone verdict
  - acceptance: Explain the lowering in child words or leave it out of her screen.

## What passed

- `LT-petra-38-J1-3` Warm, work-shaped check with a kind tone — Hotel tasks, bilingual invitation, encouraging replies.
- `LT-sofie-11-J1-1` Exact A2 placement with child-fitting game context — A2 exact; tasks and feedback built around Roblox and YouTube
- `LT-ivana-33-J1-1` Kind reply to apology — 'No need to say sorry, I understand you well.'

## Voices

**Ivana · J1** (time saved: 20 min · medium)

> I would use it again. I was nervous, but nobody made me feel examined. When I said sorry for my English, it told me not to, and that helped. The tasks were clear, and I could answer in short sentences. It said B1, which feels fair and matches what I do with manuals and guests. I liked the note about 'quieter' instead of 'more quiet'. It was a real correction, not a vague one. I did not like the line about being placed one level lower to be safe. Do they think I am better? The summary about opinions and reasons is nice, but a bit general. 'Say a little more' is advice I could get anywhere. Still, ten minutes at home with no oral is exactly what I wanted for the hospital form. I would tell colleagues who also freeze when tested.

**Petra · J1** (time saved: 60 min · low)

> I liked it. The questions were about my hotel, so I did not feel tested, and when I said sorry it just said my English was clear enough. I understood every task. The shower listening was good, because that is a real call. B1 feels a little high to me, and even the comments say my small words are missing, so I do not fully trust it. But it says it may be a little off, and that is honest. The two opinion questions were hard. The next step, "say a little more", is not very specific. I would try it again for 15 minutes after the children sleep, and nothing I saw worries me as a mother. Dobrý začátek.

**Sofie · J1** (time saved: 10 min · low)

> It was fun, because it was all Roblox and I did not feel stupid. The first two tasks were easy, and I liked that I could pick. The listening one was weird: "the first one" of what? I guessed. The "creator's version" task was long and hard to read. I wrote one short line and it said "not yet" even though it also said my reason was clear. That is confusing. A2 feels right, I can chat in Roblox. I did not like seeing "i want play it" written as my words, like a mistake poster, but the tip about "to" was short and I understood it. I would use it again for 10 minutes after school. Better mark than my brother? Maybe. I would tell my cousin, but only if the tasks are shorter.

## Out-of-sample check of the A2/B1 tightening (J1, ae4b1153)

Instrument: claude CLI only, tutor haiku, Character and judge sonnet (`run.json`), `--parallel 1`, run id chosen with `--run`. Product: commit c290d10b, clean, whose `desk/src/lib/english/placement.ts` (blob 782e7e11) holds the tightening of 7c94669c ("lean B1 to A2 on any A2 pass when the read is below B1"), pinned by 26376e3d and noted by ae4b1153. No product code changed. `ivana-33` (true B1, built to read low) was written and committed alone in c290d10b before this run and was not changed after it.

"Rule fired" is decided by replaying each Character's live marks through `staircase('A2', marks, read)` of this product: the rule fired when the placement is A2 with `rests: lean` and the same marks give B1 without the read. "Read" is the about-questions read (`selfBand`). The previous run is `2026-10-16-lt-placement-oos`, on placement r2 without the tightening.

| Character | True | Read | Placed | Confidence | Distance | Rule fired | Previous OOS run (read, placed) |
|---|---|---|---|---|---|---|---|
| ivana-33 | B1 | B1 | B1 | low | 0 (exact) | no: the read was B1, and the ladder's raw band was B2 (two B2 say partials), leaned to B1 by T4 | n/a (new) |
| petra-38 | A2 | B1 | B1 | medium | +1 (near) | no: the read was B1 | read B1, placed B1 low |
| sofie-11 | A2 | A2 | A2 | low | 0 (exact) | **yes**: read A2, B1 held by a listen pass under a B2 fail, A2 held by a choice; without the rule the same marks place B1 | read A2, placed B1 low |

The live marks, in task order:

| Character | Marks |
|---|---|
| ivana-33 | A2 choose pass, B1 listen pass (6 words), B2 say partial (13 words), B2 say partial (19 words) |
| petra-38 | A2 choose pass, B1 listen pass (18 words), B2 say partial, B2 say fail, B1 say partial |
| sofie-11 | A1 choose pass, A2 choose pass, B1 listen pass (5 words), B2 say fail, B1 say partial |

**The new true-B1 Character was not placed A2.** The accepted risk was not realized, but it was not exercised either: Ivana's about-question answers were short and self-deprecating, as played, and still read B1, so the rule's precondition (read below B1) never held. The rule could not have fired on her marks with any read: her ladder top is B2 from two partials, not B1, and a replay with read A2 or A1 still places her B1.

Counterfactual on petra-38's live marks: with a read of A2 the rule would have placed her A2 (exact). Her read came out B1 in both runs, so on her the rule depends on a read that is itself one band high.

Scorecard: exact 2, near 1, miss 0 (previous run on the same two A2 Characters: exact 0, near 2). No read was high-confidence.

Honest ceiling: n = 3, one run each, model-played Characters judged by a model of the same family, LT only. The one true-B1 sample did not reach the condition it was built to test.
