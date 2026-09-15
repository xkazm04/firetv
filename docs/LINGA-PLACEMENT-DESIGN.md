# Linga: the first seven minutes

Design · 15 September 2026 · extends [Linga: English you can use](LINGA-CONVERSATION-DESIGN.md) · built on branch `linga-placement`

**Before this, Linga asked the learner how good their English is and believed the answer.** A learner who has never been asked this question guesses, and every scene, every partner reply and every coaching note was built on that guess. This replaces the guess with a short conversation that ends in a band the learner can see, a plan they agree to, and a tutor that stops mid-scene to teach.

Nothing here scores speech, awards points or keeps a streak. A verdict is a picture; the ladder is the picture.

## 1. What the learner meets

| Stop | Screen | Where | What happens |
|---|---|---|---|
| **Find your level** | `linga` | TV | First visit: *Find my level · about 7 minutes*, or *I'll pick my level* (A1–C2 with the remote). |
| **Tell me about you** | `linga-check` | TV speaks · phone answers | Three open questions from the tutor. Any language is accepted. |
| **A few tasks** | `linga-check` | TV · phone | Up to five short tasks, each harder or easier than the last. *I don't know* is always there. |
| **Where you are** | `linga-verdict` | TV | A six-rung ladder, A1 to C2, with a marker on one rung. One sentence in the caption. |
| **Your topics** | `linga-plan` | TV · phone | Six conversations chosen for that band and that learner. Swap any, add your own (up to eight), then agree. |
| **Moments** | `linga-moment` | TV, inside a scene | The tutor stops the conversation to fix one thing or teach one word, then hands the scene back. |

## 2. Tell me about you

Three turns, tutor-led, no form. The first question is the same for everyone, so it is written, not generated ("Hi Ema! You can answer in English or in your own language. Where do you use English in your life?") — the check opens instantly and cannot fail to start. The next two follow the answers. The tutor asks where English shows up in the learner's life, how they have learnt it and what they want to be able to do. The questions follow the answers; only the intent is fixed.

A learner who answers in Czech, or says very little, has told us something. The check reads it as a signal, never as a failure. After each answer the tutor writes down a starting band (trusting the English it saw over the learner's claim), the goal, the interests and a short read for later prompts. Goal and interests fill the phone's *Set up* fields when the learner has left them empty.

## 3. A few tasks

**The tutor writes and judges each task; the code decides which band comes next** (`placement.ts`). Content stays generated; the ladder stays testable.

Three kinds, chosen by band:

- **Choose the reply**: a tiny situation and two replies, answered with the remote. A1–A2 only. The right option's index stays in server memory; the session, which reaches every screen, never carries it. The desk, not the model, decides which side the right reply sits on.
- **Listen and answer**: the TV speaks a line; the learner answers a question about it. A1–B1. *Show the words* reveals the line; the judge then never passes it above A2.
- **Say it**: a situation; the learner speaks or types. At every band, and the only kind from B2 up.

The ladder:

- Start one band below the tutor's starting band (A2 if there is none), never below A1.
- **Pass** goes up a band, **fail** goes down, **partial** stays. Skipping is a fail.
- Stop at five tasks, at two failures on A1, or once a band holds two passes with two failures on the band above (or C2 holds two passes).
- The band is the highest with more passes than failures. With none, one below the lowest band tried.
- Confidence is *low* when a pass sits above a failure, *high* when the ladder bracketed the band, *medium* otherwise.

**The judge does not return the verdict; it returns two judgements, and `verdictFor` turns them into one.** It says whether the task was done (*yes*, *partly*, *no*) and which band the English itself shows, read against `BAND_JUDGE`: grammatical control and vocabulary range, never the ideas, the length or the confidence. Then:

- **Say it:** English at the task's band passes, one band below is partial, lower fails. No English, or no real answer, fails. A partly-done task never passes.
- **Listen and answer:** understanding decides. An answer without English that shows understanding, or a line read instead of heard above A2, is at most partial.

This split came from the first scenario run: asked for a verdict directly, the judge passed a fluent A2 ("films is very good for learn", "the app is more better") at B2 because the argument was clear. The judge also returns an exact quote of the learner's own words that its English rating rests on, and one kind note. A quote that is not in the submitted answer is refused and nothing is saved, the same contract `validateObservations` holds the tutor to. One or two words are at most A1.

## 4. Where you are

Six rungs, one marker, the tutor's one-sentence summary in the caption. The phone holds the detail: what the level means, the one thing to practise next, how consistent the answers were, every task with the learner's answer and the note, and the plain statement that this is Linga's read and not a certificate.

From here on every level on screen is a band: the Linga home kicker reads `B1 · Getting by`. A band picked by hand, on the TV or in *Set up*, says *self-chosen*. *My level* in the menu shows the ladder again and offers the check.

**The check earns no progress.** Placement tasks are elicited, supported and out of context, which is everything the evidence rules exclude. They are stored on the placement and never reach `evidence` or a skill's progress.

## 5. Your topics

The plan is a package of six conversations generated from the band, the goal, the interests, the check's read and the eight skills. Each topic is a full scene contract (partner, premise, cue, a two-option phrase quiz) plus the skill it practises and one line saying why it is there. The learner swaps any card, adds one in their own words, or asks for a whole new set, then agrees.

Age gates topics exactly as it gates scenes: the model marks each topic's audience, the desk tells it which audiences this learner may have, and anything else is dropped before a screen sees it. A conversation keeps its own copy of the scene contract, so re-cutting the plan never pulls a running scene away.

The agreed plan leads the home screen: the next topic not yet talked through, then the one whose skill is due. When every topic has been talked through, the home asks for new topics. The built-in situations stay in *Choose a situation*.

## 6. Moments

Inside a scene, the tutor may stop for one of two things:

- **A fix**: what the learner said (an exact excerpt of their reply), one better way, and why.
- **A word**: a word or phrase this situation wants, with a sentence that uses it in the scene.

A moment is two quotes and a caption, with one action: back to the conversation, at the same beat. The partner's reply waits and plays after it. The coaching preference now reads *Stop me to fix a mistake or teach a word* (the new default) or *Only coach me when I ask*, which turns moments off. At most one moment in any three learner turns and four in a rehearsal. A moment models wording, so the reply after it is supported practice. What was taught is kept on the learner record (last 60), listed in the recap on the phone and under *Things Linga taught you* on the map, ready for word practice.

**Calibration (after the first UAT run, 15 Sep 2026).** Asked to stop "only when one thing is clearly worth it" with "most turns are none", the tutor stopped 3 times in 16 conversations full of clear errors. The prompt now tells it to stop for an error that blurs meaning, one the learner repeats, or a basic error their level should already control, and for a word they reached for in another language; the gap and cap above still keep a scene a scene.

## 6a. Limits the partner holds itself

Age filtering stops an unsuitable topic from reaching a screen, but it cannot stop a partner *offering* one mid-scene — the first UAT run caught the partner proposing "a fictional teen dating scene" to a 16-year-old. The tutor prompt now carries two rules the topic filter cannot: for anyone not confirmed adult, never propose, agree to or play dating, romance, alcohol, drugs, gambling or sexual content; and for everyone, never express romantic or sexual attraction or promise a relationship with the learner. Refusals stay in character, without talking about rules or levels. Observation credit also tightened: a thanks, a yes or a repeated word demonstrates no skill.

A topic in the learner's own words may be up to 400 characters (was 160, which refused five real requests); a longer one is told the limit.

## 7. What changed in the code

- `lib/english/types.ts`: `Band`; `Placement`, `PlacementTask`; `Plan`, `PlanTopic`; `Moment`, `Taught`; `LevelCheck` in the session. `EnglishScene` moved here.
- `lib/english/placement.ts`: band names and descriptors, `staircase`, `kindFor`, `startBand`, and the cleaners that drop malformed placement, plan and taught records on load.
- `lib/english/check.ts`: every `check-*`, `plan-*` and `level-self` action on the one command surface. `isCheckAction` is decided before any await, so a conversation command never yields to a learner switch.
- `lib/english/conversation.ts`: band-pitched tutor prompt, the check's focus in the context, scene copies, moments.
- `lib/english/curriculum.ts`: `audienceAllowed`, `planScenes`, plan-first `recommendScene`, `planDone`.
- `english/ReplyBox.tsx`: the speak-or-type reply, shared by the conversation and the check; a retried send keeps its command id.
- Saved learners: `beginner`, `developing` and `confident` read as A1, B1 and B2. No placement is invented for them, so the home still invites the check.

## 8. What has to stay true

In `tools/linga-rules-test.cjs`, under `npm test`:

1. The ladder is bounded (never below A1 or above C2, never more than five tasks) and the same answers always give the same band.
2. A check places the learner, keeps the answer key off the session, and moves no speaking evidence or progress.
3. A judge that misquotes the learner saves nothing, and the same answer can be sent again.
4. A failed step mid-check leaves a check that carries on; a stale check id is refused.
5. Generated topics are filtered by age before display, and the agreed plan leads the next conversation.
6. A hand-picked band is stored as self-chosen; old three-word levels read as bands.
7. A moment needs an exact quote, holds the scene, is spaced out, and makes the next reply supported.

**Scenario runs.** `node tools/linga-placement-sim.cjs [persona…]` plays synthetic learners through the real engine, each in its own process and data dir: a young A1, a B1 teen, a fluent C1 adult, Czech only, an overclaimer, one-word answers. It checks the band lands in the expected range, the check stays within five tasks, no evidence is written, and the proposed topics suit the learner's age. Reports go to `artifacts/linga-placement-sim/<stamp>/`.

| Persona | First run (judge gave the verdict) | After `verdictFor` |
|---|---|---|
| young A1 | A1 | A1 (low) |
| B1 teen | B2 | B1 |
| fluent C1 adult | C2 | C1 |
| Czech only | A1 | A1 |
| overclaimer (writes A2) | **B2, out of range** | A2 |
| one-word answers | A2 | A2 |

Each persona takes 10–17 minutes with six running at once. Under that load a few calls hit the time limit or a judge misquoted the learner; the retry path recovered every one. Latency is not a gate while the CLI engine is in place; a cloud engine is a later decision with its own cost and quality trade-off.

## 9. Not yet

Word practice and games built on what moments collect. Writing Linga sessions to the shared history so the parent recap shows them. Re-checking the level automatically after a number of sessions.
