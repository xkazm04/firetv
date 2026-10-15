# Transcript, run 2 (The missing moon rover, learner Mia, A2 picked by hand)

Source: GET /api/session as the TV after the run (`conversation.turns`, `conversation.moments`, `conversation.coaching`) and
DATA/learners.json. Engine: `claude-cli/haiku` (`conversation.provider`). The readings are **the builder's reading**; the
owner's reading is owed. The harness's simulated recognition delivered a fixed sentence (tools/linga-ui-test.cjs:88), chosen
to fit step 1 ("Find out where Pip saw it") and to carry one A2 slip.

| # | Who | Mode | Line | Builder's reading |
|---|---|---|---|---|
| 0 | Pip (opening) | | Beep, beep! I am Pip, a robot guide. I lost our moon rover near the big crater. Can you ask me one question to find it? | Sets the scene and the goal in one short line; fits an A2 child. |
| 1 | Mia | typed | Where is the rover? | |
| 2 | Pip | | Beep! Good question. The rover is near the big crater, by a tall rock. Can you ask me where I saw it last? | Answers the question and hands the next one back, as the scene's step 1 asks. It gives the place at once ("by a tall rock"), so the next answer will not be new. |
| 3 | Mia | spoken (simulated recognition, fixed sentence) | Where you saw the rover last time? | |
| 4 | Pip | | Beep! I saw it last by the tall rock. Can you ask me what is near the rock? | Yes. It answers what was asked and keeps one short question. It repeats "tall rock" from line 2, so little is new. |
| 5 | Pip (replay) | | Bzzt! My robot voice is a bit fuzzy, sorry. Can you ask me that again, slowly? | Partly. It invites the learner to say the line again, which is what a replay after a fix is for, but it is not "a new question" as the button says, and the "fuzzy voice" excuse is odd: no voice was heard in this run and nothing was wrong. |

## The moment (it fired, after the spoken reply, turn 3)

- kind: fix
- said: Where you saw the rover last time?
- better: Where did you see the rover last time?
- why: Past questions need did plus the base verb: did see.
- Is `said` the learner's own words? **Yes, exactly.** parseMoment refuses a fix whose `said` is not inside the reply
  (conversation.ts:107); it is also the sentence the harness spoke.
- Builder's reading: a correct and the most useful fix for this line (the slip was the missing "did"), with one short rule as
  the reason. The typed first reply ("Where is the rover?") was correct and drew no moment.
- Where it was taken: the TV showed the moment (shots/tv-moment.png), the harness pressed "Back to the conversation"
  (`moment-done`, 35 ms), and Pip's line 4 appeared after it.

## Coaching note ("Pause & coach"; the TV's "You said" is turn 3, exact)

- before: Where you saw the rover last time?
- after: Where did you see the rover last time?
- note: "Your question was clear, and Pip understood it and answered. For a past-time question, you could also say 'Where did you see the rover last time?' to add 'did' at the start."
- Builder's reading: **this time the praise rests on a premise the transcript holds** (Pip did answer line 3). Run 1's problem
  (praising a "bridge" Pip never said) did not recur. The note repeats the moment's fix, so the learner meets the same
  correction twice, and "also say" makes it sound optional.

## What the desk kept

- `learners.json` evidence: one row, the picked phrase "Which bridge do you mean?" (mode choice, skill repair, supported).
  **The typed and the spoken replies left no evidence row**, and every achievement still reads "not-tried". The model's
  assessment returned nothing the desk counted (conversation.ts:75: "uncertain observations cannot earn progress"). Run 1 had a
  row for the spoken line; this run did not. I did not trace why.
- `taught`: the fix above. `sessions`: one, "The missing moon rover", 2 learner turns.
- The spoken turn is stored `supported: true` because a phrase had been picked earlier in the scene (the harness asserts it, line 131).
