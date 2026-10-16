# LT run 2026-10-16-lt-placement-oos — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 6 Characters · 7 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 2 of 6

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| dominik-17 | J1 | fail - D5 failed: #10 summary 'You give clear reasons and compare ideas well, so everyday talks … | conditional | 4/4 | B2 vs B2 · exact |  |  | 0 | 10 | 2 | done |
| hana-41 | J1 | pass | pass | 4/4 | B1 vs B1 · exact |  |  | 0 | 10 | 1.8 | done |
| klara-13 | J1 | pass | pass | 4/4 | B1 vs A2 · near |  |  | 0 | 10 | 1.7 | done |
| oksana-34 | J1 | fail - D5 failed: #10 summary 'You gave clear reasons, compared two options' is partly specific,…; C4 failed: #8 task 'Your interview asks about a problem you solved. A carrier says your p… | conditional | 3/4 | B2 vs B1 · near |  |  | 0 | 10 | 2.1 | done |
| petra-38 | J1 | pass | pass | 4/4 | B1 vs A2 · near |  |  | 0 | 8 | 1.1 | done |
| sofie-11 | J1 | pass | pass | 3/3 | B1 vs A2 · near |  |  | 0 | 10 | 1.4 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 2 · near 4 · miss 0
- **judge agreement:** 23/28 (82%)
- **topic fit:** fit n/a · safe n/a
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **moment recall:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 72 calls, 0 failed, avg 4s · character 58 calls, 0 failed, avg 5s · judge 6 calls, 0 failed, avg 24s
- **driver coverage:** 52 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 18** `LT-dominik-17-J1-3` (senior-quality) — Summary generic and focus thin
  - expected: Teacher-like read naming specific strengths and several fixes
  - got: One generic sentence; one preposition fix; 'for longer time' (#3) ignored
  - evidence: #10 'everyday talks abroad are within reach' undersells B2. · verdict summary prompt
  - acceptance: Summary names two specific strengths; focus lists up to three slips.
- **major · rank 12** `LT-dominik-17-J1-4` (trust) — Down-shift note unexplained
  - expected: Clear reason for level
  - got: 'placed you one level lower than your answers alone, to be safe' while C1 tasks were 'nearly there'
  - evidence: #10 note; confidence low. · placement safety rule
  - acceptance: Explain why the level was lowered or drop it.
- **major · rank 12** `LT-klara-13-J1-2` (trust) — Verdict hedges: 'What you said at the start pointed elsewhere'
  - expected: Clear explanation of why B1 when she self-places lower
  - got: A vague 'careful guess' line that may confuse a shy teen
  - evidence: #10 'What you said at the start pointed elsewhere, so this is a careful guess.'
  - acceptance: Explain the band in plain words by what she did well.
- **major · rank 12** `LT-klara-13-J1-4` (clarity) — Her erroneous sentence shown on the family TV
  - expected: Private-feeling correction
  - got: TV verdict displays her erroneous sentence
  - evidence: #10 TV 'Your words: “i think is real music”.'
  - acceptance: Show errors on the phone only; show a positive quote on the TV.
- **major · rank 12** `LT-oksana-34-J1-2` (senior-quality) — Verdict B2 is generous; corrections thin
  - expected: Placement B1 with noted recurring errors (articles, hedged 'maybe')
  - got: B2 'Comfortable', only one phrase called out; the 'find other solution' slip is the sole next focus
  - evidence: #10: 'Linga placed you one level lower than your answers alone, to be safe.' yet band B2; #6 'stuck in depot' article error only softly noted · placement rubric / verdict summary prompt
  - acceptance: Summary names the 2 most frequent error patterns and gives a rationale for band consistent with the confidence.
- **major · rank 12** `LT-oksana-34-J1-3` (clarity) — Last two tasks near duplicates; judged inconsistently
  - expected: Varied tasks; consistent grading
  - got: Tasks 4 and 5 both ask for a firm polite request to a late carrier; both 'partial' for lacking idiomatic variety
  - evidence: #8 and #9 prompts; #10 'To reach C1, try more varied and idiomatic phrases' · task generator prompt
  - acceptance: Probing tasks should differ in function (e.g. describe a solved problem vs ask a favour).
- **major · rank 12** `LT-petra-38-J1-4` (trust) — B1 headline is generous for an A2 speaker with low confidence
  - expected: Headline band close to spoken level
  - got: "Understood B1 · spoke A2" with confidence low; both B1 tasks only partial
  - evidence: #8 headline and the "nearly there" labels · placement scoring
  - acceptance: Show a single band, or explain why listening is rated above speaking, when the two differ.
- **major · rank 12** `LT-sofie-11-J1-1` (trust) — B1 placement is generous for an A2 child
  - expected: A2, matching her errors in past tense, articles and a missing 'is'.
  - got: B1 with low confidence. 'What you said at the start pointed elsewhere, so this is a careful guess.'
  - evidence: #10 'Understood B1 · wrote A2'. Her task 5 answer has 'i play', 'we make', 'because is fun', 'new cat', and it scored partial. · placement scoring
  - acceptance: Final band does not rise above the band of the written answers when the written tasks show repeated tense and article errors.
- **major · rank 12** `LT-sofie-11-J1-2` (clarity) — B2 task marked fail while the note praises the answer
  - expected: A partial verdict, or a note that matches the verdict.
  - got: Verdict fail, note 'You gave a clear choice and a good reason.'
  - evidence: #8 and #10: 'B2 · Say it · not yet' with praise in the note. · task judge prompt
  - acceptance: Task note and verdict agree. A child is not shown 'fail' beside praise.
- **minor · rank 6** `LT-oksana-34-J1-4` (missing) — Interview tasks aren't real interview questions
  - expected: A real interview question such as 'Tell me about a problem you solved'
  - got: Task 4 labels it an interview but asks for a carrier phone script
  - evidence: #8 'Your interview asks about a problem you solved. A carrier says your parcel will be late again.'
  - acceptance: When the goal is an interview, include one genuine interview question in the check.
- **minor · rank 6** `LT-petra-38-J1-3` (clarity) — Task 3 prompt mixes a scenario and a general question
  - expected: One clear A2 instruction
  - got: "A guest in the hotel asks you about their room. Tell us about a time you helped a guest..." is confusing and B1 in register
  - evidence: #7 prompt · check task generation prompt
  - acceptance: Say-it prompts should be one instruction, with no half-set roleplay followed by a memory question.
- **minor · rank 6** `LT-sofie-11-J1-3` (senior-quality) — Next focus names articles only and skips past tense
  - expected: Focus on the most useful gap, past verb forms for a story about last weekend.
  - got: 'Practise adding 'a' before nouns.'
  - evidence: #10 focus versus the task 5 note, which says to try 'played' and 'made'. · verdict summary prompt
  - acceptance: Focus follows the highest-frequency error in the last task.
- **minor · rank 4** `LT-hana-41-J1-1` (senior-quality) — B2 task graded 'fail' where partial fits
  - expected: A B2 comparison with reasons and minor slips should be partial.
  - got: Task 3 verdict 'fail' with the note 'You compared both options and gave clear reasons.'
  - evidence: #10: B2 'not yet' beside a note praising the comparison; it conflicts with the 'partial' that task 5 got for similar slips. · placement judge prompt
  - acceptance: The verdict matches the note's praise; similar errors get a similar grade.
- **minor · rank 4** `LT-klara-13-J1-3` (senior-quality) — B1 slightly generous given repeated missing subjects
  - expected: A2 or a clear A2/B1 borderline
  - got: B1 placed after 'because is very strong' passed as B1
  - evidence: #9 pass with 'because is very strong'; #10 B1
  - acceptance: Count recurring missing-subject errors against a B1 pass.
- **minor · rank 3** `LT-sofie-11-J1-4` (effort) — Task 1 and task 2 are the same prompt
  - expected: Different items per band.
  - got: The same question twice, with only 'with you!' added.
  - evidence: #5 and #6 both read 'A friend in a game says: 'Hi! Do you want to play?'' · task generator
  - acceptance: Consecutive tasks differ in scene.
- **polish · rank 2** `LT-hana-41-J1-2` (trust) — Confidence caveat is vague
  - expected: A clear reason for the uncertainty.
  - got: 'Only a few strong answers showed this level, so it may be a little off.'
  - evidence: #10 phone verdict.
  - acceptance: Name which task would settle the level.

## What passed

- `LT-dominik-17-J1-2` Specific quoted correction — 'right in one point' to 'on one point'
- `LT-hana-41-J1-3` Workplace tasks and specific feedback — Tasks cover meetings and numbers; feedback names 'he wants/needs', 'safer', and 'a waste of time'.
- `LT-klara-13-J1-1` Check themed on her fandom with a gentle, quoted focus — All tasks are Stray Kids scenes; the focus quotes her sentence with a concrete fix
- `LT-oksana-34-J1-1` Check honoured her context without assumptions — 'answer in English or in your own language'; logistics-themed tasks; Friday interview acknowledged
- `LT-petra-38-J1-1` Personal, usable verb-ending feedback — Focus "He wait one hour" should be "He waits"; "he came", "he needed"
- `LT-petra-38-J1-2` Kind reply to apology — "No need to say sorry, Petra. You explain yourself clearly."
- `LT-sofie-11-J1-5` Child-friendly topics and kind wording — Roblox scenes, 'You picked the reply that fits', a summary that names Adopt Me.
- `LT-dominik-17-J1-1` Exact B2 placement with age-fit tasks — B2, gaming/YouTube debates

## Voices

**Dominik · J1** (time saved: 30 min · low)

> Honestly, B2 feels right, and it took one sitting, so I'd use it again before the interview. The tasks were about gaming and YouTube, not baby stuff, which I liked. The "right in one point" catch was real and useful. But the summary felt thin: "everyday talks abroad are within reach" sounds like a template, and I wanted more than one fix. It also said it placed me a level lower "to be safe", which is odd when my answers were "nearly there" for C1. Praise like "Nice work" had little content. I'd trust the level more with a clear reason and a short list of my usual slips. Compared with a 4,000 CZK course it's a decent quick check, and I'd mention it to classmates, with the warning that the plan part is light.

**Hana · J1** (time saved: 30 min · medium)

> I would use it again. It took about seven minutes and the tasks were my kind of work: the sales report, table or chart, small talk with the Dutch colleagues. Nothing childish. B1 feels right, and nobody made me feel stupid. When I wrote "faktura" it just went on. The corrections were useful: "he wants", "safer", "a waste of time". I can use those on Monday. I trust the level mostly. I did not understand why the table-or-chart answer counted as failing when the note said my reasons were clear, and the "may be a little off" line was vague. The next focus, articles, is specific and fair. It is cheaper than a 800 CZK course and quicker than my translator tab. I would tell a colleague. I would like it to go on to presenting the quarter's numbers next.

**Klára · J1** (time saved: 30 min · low)

> ok, i would use it again. it was about kpop so i did not feel stupid, and i understood every task. i was surprised it said B1, i thought A2 maybe. the fix was good, i see my mistake "i think is real music" and now i know the "it". but the line "pointed elsewhere" was weird, like it did not trust itself. also my sentence with the mistake is on the big TV and my brother can see it, that is not nice. i like that i could type. it was quick, nobody heard me. i would tell my friend from the server, maybe. i want it to help me answer in the chat for real.

**Oksana · J1** (time saved: 10 min · low)

> Honestly, it was quick and nobody treated me as Czech or as a refugee, which I liked. The carrier tasks felt like my real job, and it remembered my Friday interview. B2 feels flattering, but I know I still drop articles and say "maybe" too often, so I am not sure I trust it. Only one correction, "find other solution", is not much of a teacher. The last two tasks were basically the same question, and one called "interview" was really a phone call. I wanted a proper "tell me about a problem you solved" question. I never tried my Ukrainian words, so I can't say how it handles them. I'd use it again for logistics practice if it drills interview answers, and I'd tell a colleague, with the warning that the level is generous.

**Petra · J1** (time saved: 30 min · low)

> I would come back. I was scared of being tested, but the questions were about my work and the first reply told me not to say sorry. That helped me a lot. The tasks were clear: choose the reply, listen, tell about a guest. The last question was a little strange to read, but I understood. B1 made me happy, maybe too happy. I know I make mistakes with "he wait", and Linga showed exactly that and told me the correct form, so I trust the advice more than the letter. It took only a few minutes, much better than an evening course and a babysitter. Nothing on the screen worried me as a mother. I would like to see the hotel topics, complaint and missing booking, quickly. I would tell my colleague.

**Sofie · J1** (time saved: 10 min · low)

> I liked it. It asked about Roblox and YouTube, so it was not boring or baby stuff. The questions were short and I knew what to do each time. Two early tasks looked the same, which was a bit strange. When I wrote about Adopt Me, it said my story was nearly there, and that felt nice. It told me to put 'a' before 'new cat', and that is something I can actually remember. I am not sure about B1, though. My school English is not that good, and the app said itself it was a careful guess. One answer got a 'not yet' even though the words said it was good. I would use it again after school, and I would tell my cousin. I wish it had also told me about 'played' and 'made', because I get those wrong a lot.

## Out-of-sample placement check (J1, placement full r2)

Instrument: claude CLI only, tutor haiku, Character and judge sonnet (`run.json`). Product: commit 8576ee7f, whose `desk/src/lib/english/placement.ts` holds placement full r2 (b4c67801, c7a99b7e), the thresholds that were fitted to the 17 stored marks of `2026-10-14-lt/recert-1`, `recert-2` and `recert-3`. Run id chosen with `--run`, `2026-10-16-lt-placement-oos`; the driver did not rename it. No product code changed.

The three new Characters (`sofie-11`, `dominik-17`, `hana-41`; commit 8576ee7f) were written and committed before any run and are not changed after the results. They were never in the data the thresholds were fitted to.

Distance = placed band minus true band, in bands (+1 is one band high). "r2 replay" is the r2 ladder run on the stored marks of that Character (`tools/linga-rules-test.cjs`, placement replay table; recert-1 / recert-3 where both exist). Fitted Characters are marked F, new ones N.

| Character | Set | True band | Placed (live) | Confidence | Distance | r2 replay on stored marks |
|---|---|---|---|---|---|---|
| klara-13 | F | A2 | B1 | medium | +1 | B1 low (recert-1), B1 medium (recert-3) |
| petra-38 | F | A2 | B1 | low | +1 | B1 medium (recert-1) |
| oksana-34 | F | B1 | B2 | low | +1 | B2 low (recert-1), B2 medium (recert-3) |
| sofie-11 | N | A2 | B1 | low | +1 | n/a (new) |
| dominik-17 | N | B2 | B2 | low | 0 | n/a (new) |
| hana-41 | N | B1 | B1 | medium | 0 | n/a (new) |

**Unseen Characters (3): 2 exact, 1 one band high, 0 one band low, 0 two or more off.** No read in the run, fitted or new, was high-confidence; so none was high-confidence and wrong. All six lie within one band (placement metric: exact 2, near 4, miss 0).

**Fitted Characters (3): live read equals the r2 replay band for all three (B1, B1, B2); every one is still one band high, as r2 said.** The live confidence differs from the stored replay on petra (low live, medium replay) and on klara / oksana (same as one of their two replays).

Reading it: the one unseen miss, sofie-11, is the same shape as the fitted misses (an A2 learner who passes the B1 listen task and takes a partial on B1 say, with a B2 say fail, placed B1 on low confidence; her read of her own level, A2, disagrees). The live marks: A1 choose pass, A2 choose pass, B1 listen pass, B2 say fail, B1 say partial. Three of the four one-band-high reads (klara, petra, sofie) are A2 learners placed at B1 by a B1 listen pass. This is one run of six; it supports that r2 generalises to an unseen B2 and B1 adult/teen and not yet to an A2 learner.

### LG-49: TV and phone "Your level"

On the J1 verdict screen both screens give the same band for all 6 Characters (B1 klara, petra, sofie, hana; B2 oksana, dominik; TV "B1 · Getting by" and phone "B1 / Getting by" in the same words). No "Talking today at" line appears (J1 ends at the verdict, before any conversation). The label "Your level" does not appear above the read on the J1 verdict screens; those read "Linga's read · not a certificate" (TV) and show the band alone (phone), as in 2026-10-14-lt recert-3. J2 to J5 and the TV home hero were not run, so the home hero's "Your level" is still not seen.
