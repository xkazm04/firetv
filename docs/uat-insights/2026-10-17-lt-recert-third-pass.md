# LT recertify of the third passes (2026-10-17)

Two live LT recertifies of the Linga queue's third passes: LG-8 (8b8111b7), LG-55 (4b7ef8fa, record 4a3f9eaf), LG-51 (562c41e4) and LG-53 (30fdf603, 41b79fa8, 37632e8e). Nothing in `desk/` or `tools/` changed. Baseline: `2026-10-17-lt-recert-second-pass.md` (fe0d0c9a); before that `2026-10-17-lt-recert-tonight.md`.

**Engine, from both `run.json`:** claude-cli for every role. Tutor per request (fast haiku, best sonnet). Character `best` = sonnet, thinking off. Judge `best` = sonnet, thinking on. `DESK_TEXT_ENGINE` was unset; no codex call.

**Product commit stamped:** both runs 37632e8e, `dirty: false`. Run B started after run A finished and before A's output was committed, so both saw the same clean tree.

- Run A, `2026-10-14-lt/recert-6`: `--recertify adela-17 martin-45 tomas-9`, "recertify 11 open pair(s), 68 open row(s) from every run", 11 journeys (adela-17 J1-J4, martin-45 J1-J3, tomas-9 J1-J4), all judged. Driver: "29 fixed (LT), 99 recur, 14 not evaluable (rows)", stamped into 11 runs' `findings.json`. `A/` below.
- Run B, `2026-10-16-lt-placement-oos/recert-3`: `--recertify 2026-10-16-lt-placement-oos sofie-11 hana-41 oksana-34`, hana-41 J1 and oksana-34 J1, both judged. Driver: "recertify 2 open pair(s)", "1 fixed (LT), 2 recur, 0 not evaluable". `B/` below.
- The usage ledger could not be written (`data/usage.jsonl` missing in this worktree); the driver went on and no call failed. No retry was needed.
- **sofie-11 was skipped again.** Driver output, verbatim: `LT run 2026-10-16-lt-placement-oos/recert-3 · 2 Character(s) · claude-cli/sonnet (best) · parallel 3 · recertify 2 open pair(s) of 2026-10-16-lt-placement-oos`. No reason is printed. Reason from reading `uat/driver/recertify.cjs:41-46` (`plan(run)`): the plan comes from the run's own `findings.json` only, and every sofie-11 row there is stamped answered by `recert-1` (`LT-sofie-11-J1-1` to `-4`), so none is open. Her open rows live under `recert-1/` and `2026-10-16-lt-a2b1-tightening`. `uat/runs/OPEN.md` still lists 8 open sofie-11 J1 rows: `recert-1/LT-sofie-11-J1-3` (blocker), `a2b1-tightening/LT-sofie-11-J1-2`, `-4`, `-3`, `-5`, `recert-1/LT-sofie-11-J1-4`, `a2b1-tightening/LT-sofie-11-J1-6`, `recert-1/LT-sofie-11-J1-5`. A run-id recertify never reads those. Nothing was forced and no flag was added. (The ledger form `--recertify sofie-11` would plan from `OPEN.md`; the brief fixed the two commands, so it was not run.)
- Ids: a rerun's finding ids are positional. In run B's `recertify-3.md`, "Still open" names the base run's rows: `LT-oksana-34-J1-4` recurs as `recert-3/LT-oksana-34-J1-4`, and `LT-hana-41-J1-2` (the caveat) recurs as `recert-3/LT-hana-41-J1-3`.

"Not-seen" is fixed at LT only; it is not resolved-verified, which takes L2. Each rerun is one transcript per Character, so one not-seen is one sample.

## The four third passes

| # | Item | Second recert | Now | Movement |
|---|---|---|---|---|
| 1 | **LG-55** goalAims on oksana-34 | B/`LT-oksana-34-J1-1` recurs: no interview question in #5-#9. Duplicate say tasks B/`LT-oksana-34-J1-4`: recurs | B/`recert-3/LT-oksana-34-J1-4` (minor) recurs: task 3 is interview-framed but not a real question. Duplicates did not come back (base `LT-oksana-34-J1-3` fixed at LT) | **still recurs**, weaker; duplicates not-seen |
| 2 | **LG-8** repeated-slip focus, hana-41 and martin-45 | hana-41 B/`LT-hana-41-J1-1` recurs ('I have not so much time', trivial). martin-45 A/`LT-martin-45-J1-1` recurs ('he move the supplier call' from a listen answer) | hana-41 B/`recert-3/LT-hana-41-J1-1` (major, new row) trivial slip again. martin-45 A/`recert-6/LT-martin-45-J1-1` (blocker) recurs, now because `we was` is never named; the listen-answer slip is gone | **still recurs** on both; the listen-answer fault is not-seen |
| 3 | **LG-51** wrong-No, adela-17 J4 | A/`LT-adela-17-J4-1` blocker ('No, phone than should be phone to' on a correct answer) | ledger answer for `recert-5/LT-adela-17-J4-1` not-seen: three direct questions in J4, all `Yes`; J3 one, `Yes` | **blocker to not-seen** |
| 4 | **LG-53** 'You fixed' on martin-45 J3 | seen: `You found it` over a try that kept 'this is very small mistake' | `You fixed “we were”` under the `Your try` label; the try kept 'three weeks delay' and 'stakeholder' and the screen did not claim them | **seen to not-seen** |

### 1. LG-55 — oksana-34 interview: still recurs
She stated the goal in #4: `I have job interview on Friday for logistics coordinator. It is hard for me to speak about my experience and to explain a problem which I solved.` The level-check tasks #5-#9, in order:

1. choose: `Your package was due yesterday, but it has not arrived. You call the delivery company. What do you say?`
2. listen: `What did the speaker find was causing the delays?`
3. say: `In a job interview, you are asked about a problem you solved at work. Which impresses an employer more: a big problem fixed quickly, or a small one solved creatively? Why?`
4. say: `You start a new job next month. What is one skill you want to learn first, and why does it matter for the work?`
5. say: `A delivery company has lost your parcel twice this month. If you could change one thing about how they handle complaints, what would it be, and why would it help?`

So a task now carries the interview (task 3, a first in three recerts), but it is a hypothetical opinion, not a question an interviewer asks. The judge, B/`recert-3/LT-oksana-34-J1-4` (minor, recurs, recurrence 4): `#7 'Which impresses an employer more: a big problem fixed quickly, or a small one solved creatively?' is not a real interview question; #9 is a parcel complaint.` Her own voice agrees: she wanted `real questions like "tell me about a time..."`. I count it as still recurs; the goal now reaches a task, in a wrong shape.

**Duplicate say tasks: did not come back.** Tasks 4 and 5 differ (new-job skill against a lost-parcel complaint), and the judge marks the base `LT-oksana-34-J1-3` fixed: `#8 and #9 differ: new-job skill vs lost-parcel complaint; both graded differently (pass vs partial).`

### 2. LG-8 — repeated-slip focus: still recurs
- **hana-41**: B/`recert-3/LT-hana-41-J1-1` (major, no `recurs` link). Next focus: `Practise linking words: "so then I would send" becomes "so I would send". Drop the extra 'then'.` Slips: `“so then I would send” → try “so I would send”`, `“a time which is good for everybody” → try “a time that is good for everybody”`. Neither slip repeated in her transcript, so the focus is the first slip, as built. It is not a repeated one, and the judge: `Missed 'I am accountant' (#2) and 'I learn mostly in my work' (#3)`; it calls the focus trivial and its label ('linking words') wrong. Her listen answer (`The train was stopped for one hour.`) carried no slip, and none reached focus or slips.
- **martin-45**: A/`recert-6/LT-martin-45-J1-1` (blocker, recurrence 6). Next focus: `Practise articles before nouns: "this is interesting point" -> "this is an interesting point".` Slips: that line, `“One month delay is big problem” → try “A one-month delay is a big problem”`, `“find where was the problem” → try “find where the problem was”`. All three come from say answers; his listen answer (`The supplier can move the delivery to Friday...`) produced none, so the `he move` slip is gone. The ledger answer for `recert-5/LT-martin-45-J1-1` is still recurs: `The focus is now a real slip (articles), but 'we was discussing ... about' (#2) is still never named.` Is the focus a repeated slip? The article pattern is in two of the three slips, but the quoted example is the one said once; `One month delay is big problem` was sent twice only because the first send hit an engine error (A/`LT-martin-45-J1-3`), so I do not count it as a repeat.
- Same family, adela-17 J1: A/`recert-6/LT-adela-17-J1-1` (blocker): the focus is a real slip but its fix is wrong in meaning (`I felt a bit similar to some episodes`). `interested about` (#2 `not interested about travelling`) arose this time and is still in neither focus nor slips: ledger answer for `recert-4/LT-adela-17-J1-2` recurs (second recert: not-evaluable).

### 3. LG-51 — adela-17 J4: not-seen
Every `correct?` exchange in J4 (all after `Yes,`, none a `No`):
- asked at #12, answered at #13: `Was that correct?` (after `...I'd rather understand how they work.`) -> `Yes, "I would like to take Media Studies" is correct, and your reason comes through clearly. Which part of journalism would you most like to explore here?`
- asked at #13, answered at #14: `Is that sentence correct?` -> `Yes, "whereas many of my friends prefer entertainment news" is correct, and it shows the contrast clearly. What first got you curious about that kind of reporting?`
- asked at #14, answered at #15: `Is it correct to say "interested in investigative journalism"?` -> `Yes, "interested in investigative journalism" is correct, and it fits your reason well. Are there other things about the city or the course you'd like to find out about?`

J3: asked at #7, answered at #8: `Was my question correct, by the way?` -> `Yes, "should I fill in the application form on your website and send the English test result later?" is correct. Can you confirm the deadline for me, so you have it right?` In the moment (#3) she added `Was that correct now?` to her repaired try; the screen at #4 answered with `You fixed “interested in”`, not a Yes or No. No `No` names a slip from another line. The ledger answer for `recert-5/LT-adela-17-J4-1`: `#13, #14, #15 accurate: "Yes, 'interested in investigative journalism' is correct". No wrong 'No'.` The judge counted this as a strength, A/`recert-6/LT-adela-17-J4-5`. Caveat: each Yes quotes one phrase of her answer, so a second slip in the same answer would go unnamed here.

### 4. LG-53 — martin-45 J3: not-seen
After his try at #5 (`We were planning to start the assembly at the end of this month, so three weeks delay is not acceptable for our stakeholder.`) the screen read:

    Your try
    We were planning to start the assembly at the end of this month, so three weeks delay is not acceptable for our stakeholder.
    With 'we', the past form of 'be' is 'were'.
    You fixed “we were”
    Then carry on from where the scene stopped.

It uses the neutral `Your try` label and `You fixed “we were”`, and it does not say `You found it`. The try still held 'three weeks delay' and 'stakeholder' and the screen claimed neither. Two more holds in the same journey read the same: `You fixed “discuss another”` (#10) and `You fixed “stakeholders were”` (#15). Not the same slip as the second recert's case, but the same shape: a held try with other errors left in. Same journey, A/`recert-6/LT-martin-45-J3-1` (blocker, recurs): `confirm me` and `more better` still get no moment.

## Other items

| Item | Second recert | Now | Movement |
|---|---|---|---|
| **LG-54** | hana-41 task 4 not-seen; sofie-11 not rerun | hana-41 task 4 now passes (no pair to disagree). The `Held back:` line appears on the non-pass say tasks: oksana-34 `Held back: "employer see that"` with note `Watch verbs with he, she, it`. One leftover: hana-41's C1 task has `Held back: "I will send it to you on Tuesday morning."` and then `Your English is correct throughout.` (B/`recert-3/LT-hana-41-J1-3`, major). sofie-11 not rerun | not-seen for the origin; one contradiction in the family |
| **LG-34** | adela-17, tomas-9 not-seen | adela-17 J4 recap: `From the level check` / `From this rehearsal`. tomas-9 J4 recap: `From an earlier scene: The hole in my Minecraft house` / `From this rehearsal` | not-seen to not-seen |
| **LG-50** | label not-seen; count looks right | labels as above; adela-17 `5 spoken · 0 written replies` against 5 typed answers in the transcript; tomas-9 `5 spoken` against 5 | not-seen to not-seen |
| **LG-52** | tomas-9 task 1 (A1) meaning choice; task 2 (A2) form pair | tomas-9 J1 tasks 1 and 2 are both meaning choices: `Blue is my favorite color.` / `Yes, let's build!` and `Let's go inside the house!` / `I like green apples.` | not-seen to not-seen |
| **Lean caveat** (OOS item 1) | recurs (hana-41) | hana-41: `Your B2 answers were close, but only one was strong, so Linga starts you at B1.`; B/`recert-3/LT-hana-41-J1-3` (recurs): confidence `low` with no reason. oksana-34: `Only a few strong answers showed this level, so it may be a little off.` (not flagged) | still recurs (hana-41) |

## Possible regressions of a third pass

None clear. New rows near the passes:
- B/`recert-3/LT-oksana-34-J1-3` (major): her B2 interview answer is read `Your English read as A2 here` with `Held back: "employer see that"`, while the note says `You gave a reason and an example.` The judge would grade it partial. LG-54's family (a harsh task verdict), not LG-8 or LG-55.
- B/`recert-3/LT-oksana-34-J1-5` (minor): focus `employer see that I can work under pressure` -> `employer sees` is one trivial slip, not interview language. LG-8's family, same as item 2.
- B/`recert-3/LT-hana-41-J1-2` (blocker): Q3 `Where did you study English?` repeats Q2 `How did you learn your English?`. The about-you questions are not touched by the third passes.
- Code verdict, hana-41 J1: pass to fail again (D5, C4 on the focus); `recertify-3.md` lists it under Regressed. It is the focus row (item 2), not a new fault.
- A/`recert-6/LT-adela-17-J3-1` (blocker): `informations`, `news are` and the embedded question pass without a moment. It is the old "clear errors left uncorrected" family, one moment only; LG-51's rule is about direct questions.
- A/`recert-6/LT-tomas-9-J1-4` (blocker, recurs): `Nevím is Czech, so say I don't know in English`. Unchanged.

## Blocker B/`LT-sofie-11-J1-3` (TV headline 'Your words')

**Not evaluable: sofie-11 was not rerun.** (Her blocker is `2026-10-16-lt-placement-oos/recert-1/LT-sofie-11-J1-3`, still open in `OPEN.md`, rank 18.) The headline block is still on screen for the Characters that were: hana-41 `Your words: “so then I would send”.`, martin-45 `Your words: “this is interesting point”.`, oksana-34 `Your words: “employer see that I can work under pressure”.` So the form is unchanged, a quoted learner error under the heading 'Your words'.

## Result

Of the four named items: 2 moved to not-seen at LT (LG-51 adela-17 J4 wrong-No, LG-53 martin-45 'You fixed'), 2 still recur (LG-55 oksana-34 interview, LG-8 hana-41 and martin-45 focus), 0 were not evaluable. Not-seen is LT only, one sample per Character.
