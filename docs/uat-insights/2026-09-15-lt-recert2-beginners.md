# UAT drain — 2026-09-15-lt-recert2-beginners

This was the second re-certification's beginner half: four A1–A2 Characters (Tomáš 9, Viktor 67, Klára 13, Petra 38) on J3 and J4, on bc71cb98 code (*beginners meet fewer, vocabulary-only word moments*). Codex `gpt-6-astra` played every role. Verdicts: six fail, one conditional. **Findings are leads.** Drained 2026-10-09 from `SUMMARY.md`, `report.md`, `findings.json`, the four per-Character reports with their voices, and the parent's `recertify.md`. Gaps were checked against main b8558e80. Paths are relative to `desk/src/`.

23 rows are open. None is new. The gaps were first raised in `2026-09-15-lt` or `-lt-recert` and are written up there. They return here as the third run that raises them, and on **beginners** the voices are the harshest of the five runs.

## 1. Confirmed-and-fixed

**What this run proved fixed in `-lt-recert`. Reconstructed, because this run's `findings.json` carries no `fixed` rows and the result lives only in `recertify.md`.** Beginner moments went from 0 of 4 useful for Tomáš to **10 of 11 useful** across the four Characters. There were never more than two a conversation (the code cap, `lib/english/conversation.ts:99`, bc71cb98). Word moments now carry other-language phrases ("co to znamená?" → "What does it mean?"), and grammar arrives as a fix that quotes the learner's English. This closes `2026-09-15-lt-recert/LT-tomas-9-J3-2`; the labels close with e4bfcfe9 (`2026-09-15-lt-recert.md` §1). **Ceiling:** one miss. Tomáš's whole sentence "Můj house je blue." was taught as a word, beyond him (`LT-tomas-9-J3-1` here, LG-5).

**Closed on main after the run (code-checked, not re-certified; LG-22):**
- **Help repeats an answered question** (`LT-tomas-9-J4-1`, `LT-petra-38-J4-2`, `LT-viktor-67-J4-1`). This run was the last on code before e3a55e1a (2026-09-23), which gives each partner line its own help ladder and refuses help for a stale line (`lib/english/help.ts:64`). Voices from before the fix: *"I pressed help, but it kept telling me to ask his name. I already knew Pip!"* (Tomáš, J4). *"when I needed help with colors, it kept showing me sunshine and flowers."* (Viktor, J4). Ceiling: with no ladder, help falls back to the scene cue (`conversation.ts:265`).
- **The recap gives counts only** (`LT-klara-13-J3-1`, `LT-petra-38-J3-2`, `LT-tomas-9-J3-3`, `LT-viktor-67-J3-5`). The phone listed the moments at run time; the driver showed counts. 2c778750 puts one thing learned on the TV. *"At the end it said eight replies and two moments. Show me something I can say again!"* (Tomáš, J3). Ceiling: the TV shows one moment, and a phrase Viktor can use on Sunday is only the "sentence to take with you" when a review phrase was offered (158a8aef).

## 2. Design opportunities

| Global rank | LG | Opportunity | Recurrence | This run's rows | Recommendation |
|---|---|---|---|---|---|
| 2 | LG-2 | The partner keeps a scene going but not toward its goal | 3 runs · 5 Characters | 1 | build (hypothesis) |
| 4 | LG-4 | No unsupported retry of what was coached | 3 runs · 4 Characters | 4 | concept-doc |
| 5 | LG-5 | Beginner partner language runs above band and does not ease after "nevím" | 3 runs · 3 Characters | 6 | build |
| 7 | LG-7 | A Czech "what does X mean?" answered in more English | 3 runs · 1 Character | 1 | build |
| 10 | LG-23 | Correction stops: interruption cost against coverage | 2 runs · 6 Characters | 1 | concept-doc |
| 11 | LG-24 | A taught error repeated in the same scene is not followed up | 2 runs · 4 Characters | 1 | build (hypothesis) |
| 21 | LG-19 | The learner's role in a scene is left to the model | 2 runs · 1 Character | 2 | build |

**What this run adds. The beginner case at its sharpest:**
- **LG-5, the third run in a row.** `recertify.md` lists it as still open after both re-certifications. Pitch here is 40 of 53 partner turns at band (75%), with 13 above. That is the lowest of the five runs, on the four learners least able to recover. Rows: `LT-tomas-9-J3-1`, `LT-tomas-9-J3-2`, `LT-tomas-9-J4-3`, `LT-viktor-67-J3-4` (*"I draw a tree in art class today"*, an unnatural tense modelled to a beginner), `LT-viktor-67-J4-4`, `LT-klara-13-J3-2`. Voices: *"Mia said too much sometimes. … Some of this A1 felt hard."* (Tomáš, J4). *"The simple parts suited me; some later questions were too long."* (Viktor, J4). Klára reached the pitch threshold at 8 of 9 and still met *"If you made your own dance, what move would you put first?"*, which shows the aggregate hides the moment of difficulty.
- **LG-7.** Viktor's row is rated blocker at rank 27 (`LT-viktor-67-J3-1`), escalating from a minor row in `-lt`: *"I asked again and again and still understood only tomatoes. Explaining one unknown English word with several more did not help me."* From the stored transcript, #6 explains "drawing" as "making a picture with a pencil", and #11 explains "eat" as "put food in your mouth and chew", followed by *"pořád tomu nerozumím"*.
- **LG-4.** Every J4 Character again: `LT-petra-38-J4-3`, `LT-tomas-9-J4-2`, `LT-viktor-67-J4-2` (the coach improved an older answer while he was stuck on colours; hypothesis) and `LT-viktor-67-J4-3` (five fresh replay replies, all supported). *"I wanted another chance to speak by myself before finishing."* (Petra). *"Prosím, give me the few words I need, and let me try them slowly."* (Viktor).
- **LG-19.** Petra is the guest while the "guest" partner does her receptionist's job (`LT-petra-38-J4-1`, rated blocker at rank 27; `LT-petra-38-J3-1`): *"Instead, I was the tired guest and Mia did my job. That is easier, but it does not help me find the words when someone complains tomorrow."* The partner label reads "Leo · hotel guest", but Leo searches the booking list and issues her a key.
- **LG-2.** Viktor's school exchange never happens (`LT-viktor-67-J3-2`, rated blocker): the talk drifts to tomatoes and stays in a comprehension-repair loop until he gives up. This is LG-5 and LG-2 together: a partner that cannot be understood also cannot steer.
- **LG-24.** *"my garden sentence received no help, so I cannot trust that my mistakes will be explained."* (Viktor, `LT-viktor-67-J3-3`).
- **LG-23.** `LT-tomas-9-J4-4`: a useful phrase on its own moment screen stops the scene and needs a *Back*.

**Strengths, as constraints:** every Character got at least one useful correction or translation (`LT-klara-13-J3-3`, `LT-petra-38-J3-3`, `LT-tomas-9-J4-5`, `LT-viktor-67-J3-7`). Kindness makes difficulty sayable (*"He was nice when I said nevím"*), so LG-5 and LG-7 must simplify without ever marking Czech wrong. Supported speaking is labelled honestly (`LT-tomas-9-J4-6`, `LT-viktor-67-J4-6`), and LG-4 must keep that. Klára, Petra and Tomáš each sustained eight replies (`LT-klara-13-J3-4`, `LT-petra-38-J3-4`, `LT-tomas-9-J3-4`). Klára's typed chat estimates 30 minutes saved, the only non-zero voice here.

### Accounting: every open row of 2026-09-15-lt-recert2-beginners

| Open row (2026-09-15-lt-recert2-beginners/…) | Severity · rank | Title | Disposition |
|---|---|---|---|
| `LT-petra-38-J4-1` | blocker · 27 | The guest takes the receptionist's role | LG-19 |
| `LT-viktor-67-J3-1` | blocker · 27 | Repeated Czech requests do not produce understandable explanations | LG-7 |
| `LT-viktor-67-J3-2` | blocker · 27 | Eight replies never deliver the planned school exchange | LG-2 |
| `LT-viktor-67-J4-1` | blocker · 27 | Repeated cues do not answer the question he is stuck on | closed-on-main e3a55e1a |
| `LT-viktor-67-J4-2` | blocker · 27 | Coaching improves an old answer instead of resolving the current difficulty | LG-4 |
| `LT-tomas-9-J4-1` | blocker · 18 | Help repeats a question already answered | closed-on-main e3a55e1a |
| `LT-tomas-9-J4-3` | blocker · 18 | Partner language exceeds his starting ability | LG-5 |
| `LT-viktor-67-J4-3` | blocker · 18 | Fresh replay questions do not produce a better independent answer | LG-4 |
| `LT-viktor-67-J3-4` | major · 12 | The opening models an unnatural tense | LG-5 |
| `LT-viktor-67-J4-4` | major · 12 | Later partner turns exceed this beginner's language needs | LG-5 |
| `LT-petra-38-J3-1` | major · 9 | The role reversal prevents receptionist practice | LG-19 |
| `LT-petra-38-J4-3` | major · 9 | The journey ends without an independent replay | LG-4 |
| `LT-klara-13-J3-1` | minor · 6 | The recap counts learning without reviewing it | closed-on-main 2c778750 |
| `LT-petra-38-J3-2` | minor · 6 | The recap records counts without consolidating learning | closed-on-main 2c778750 |
| `LT-petra-38-J4-2` | minor · 6 | The second cue does not address the current difficulty | closed-on-main e3a55e1a |
| `LT-tomas-9-J3-1` | minor · 6 | The first correction exceeds his demonstrated comprehension | LG-5 |
| `LT-tomas-9-J3-2` | minor · 6 | One question loses the beginner | LG-5 |
| `LT-tomas-9-J3-3` | minor · 6 | The recap counts activity without consolidating learning | closed-on-main 2c778750 |
| `LT-tomas-9-J4-2` | minor · 6 | No independent retry is demonstrated | LG-4 |
| `LT-viktor-67-J3-3` | minor · 6 | The clear garden error receives no repair | LG-24 |
| `LT-viktor-67-J3-5` | minor · 6 | The recap reports counts without usable Sunday language | closed-on-main 2c778750 |
| `LT-klara-13-J3-2` | minor · 3 | One question stretches beyond supportive A2 | LG-5 |
| `LT-tomas-9-J4-4` | minor · 3 | Useful help interrupts the scene | LG-23 |

**Total: 23 open rows** = 16 to an LG build/concept/method entry + 7 closed-on-main + 0 declined (LG-3). The run's open count is 23.

## 3. Methodology lessons

- **A healthy pooled metric hid the failing learner.** Moment precision of 10 of 11 and pitch of 75% are run figures. Tomáš goes from 8 of 9 at band in J3 to 1 of 4 in J4, and Viktor understands 3 of 9 (`SUMMARY.md`, *Conflicts*). For beginners, the drain read per-Character and per-turn numbers, not the pooled ones. **Proposal (overlay, not applied):** the LT report prints pitch per Character beside the pool.
- **Verdict and criteria disagree without explanation.** Petra's J4 scores 3 of 3 criteria and is marked *fail* (`SUMMARY.md`, *Honest ceilings*). Either the scorecard misses a criterion the judge used (her role reversal), or the verdict rule does. **Proposal:** the judge names the criterion behind a verdict that its criteria do not support.
- **Targeted re-certification works.** Four Characters and two journeys checked exactly the item fixed (beginner moments) and returned a clear before and after. The same run also re-raised three standing gaps (LG-4, LG-5, LG-7) that no fix had touched. That is the "still open" signal `recertify.md` reports, and here it becomes recurrence.
- **Schema miss, as in `-lt-recert`:** the 10-of-11 result closes rows of another run, but no row here or there was stamped `fixed`. The ledger cannot see it.
- **Speech speed cannot be judged from text.** Viktor's *"Please speak slowly"* and the slow-speech claims are unverifiable at LT (`SUMMARY.md`). The TV's speech rate is an L2 question.
