# Transcript, run 3 (The missing moon rover, learner Mia, A2 picked by hand)

Source: GET /api/session as the TV after the run (`conversation.turns`, `conversation.moments`, `conversation.coaching`,
`conversation.evidence`, `englishLearning.evidence`). Engine `claude-cli/haiku` (`conversation.provider`). The simulated
recognition delivered the same fixed sentence as run 2 (tools/linga-ui-test.cjs:88). Readings marked "mine" are the builder's;
the owner's reading is owed.

| # | Who | Mode | Line | Reading (mine) |
|---|---|---|---|---|
| 0 | Pip (opening) | | Beep, beep! I am Pip, a robot guide. The moon rover is lost somewhere on the base. Can you ask me a question to find it? | Sets scene and goal in one line. |
| 1 | Mia | typed | Where is the rover? | |
| 2 | Pip | | Beep, beep! The rover is lost on the base. I saw it near a big rocket. Can you ask me where I saw it? | Gives "near a big rocket" and then tells the learner the question to ask ("where I saw it"): the next question is handed over, not drawn out. |
| 3 | Mia | spoken (simulated) | Where you saw the rover last time? | |
| 4 | Pip | | Beep, beep! I saw it near the big rocket, by the blue shed. Can you ask me another question? | Answers what was asked; "another question" is open, not a repeat. |
| 5 | Pip (replay) | | Beep, beep! Good question, I saw it by the blue shed near the big rocket. Can you ask me what is near the rover now? | **A new question** ("what is near the rover now"), no "fuzzy robot voice" excuse. Run 2's replay did not do this. One run: R4 is not settled by it. |

## The moment (it fired, after the spoken reply, turn 3)

- kind: fix; said: "Where you saw the rover last time?" (the learner's exact words); better: "Where did you see the rover last time?"; why: "For a question about the past, use "did" before the subject."
- Mine: correct and the useful fix. No moment after the typed reply.

## Coaching note (TV "You said" = turn 3)

- before: Where you saw the rover last time?
- after: Where did you see the rover last time?
- note: "Your question worked, and Pip understood it and answered clearly. A smoother option is 'Where did you see the rover last time?' Keep asking one question at a time, as you did here."
- Mine: the premise holds (Pip did answer). It repeats the moment's fix, as in run 2.

## What the desk kept

`conversation.evidence` and `englishLearning.evidence` each hold **one row**: the picked phrase, mode `choice`, skill `repair`,
quote "Which bridge do you mean?". No row for turn 1 (typed) or turn 3 (spoken). All eight achievements read `not-tried`.
