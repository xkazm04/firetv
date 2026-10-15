# Transcript, attempt 2 (The missing moon rover, learner Mia, A2 picked by hand)

Source: GET /api/session as the TV after the run (`conversation.turns`, `conversation.coaching`) and the learner's
evidence list. Engine: `claude-cli/haiku` (conversation.provider). The readings are **the builder's reading**; the owner's
reading is owed. No moment fired (`conversation.moment` null, `moments` empty).

| # | Who | Mode | Line | Builder's reading: does it answer what was said? |
|---|---|---|---|---|
| 0 | Pip (opening) | | Hi, I am Pip, a robot guide! Our moon rover is lost on the Moon. Can you ask me for a clue to find it? | n/a. Sets the scene and the goal in one short sentence, fits an A2 child. |
| 1 | Mia | typed | Where is the rover? | |
| 2 | Pip | | Good question! The rover is lost, but I saw it once. Can you ask me where I saw it last? | Yes, in part. It acknowledges the question, gives the one fact it has and hands the next question back, as the scene's goal asks. It does not say where the rover is, which is in character. |
| 3 | Mia | spoken (the harness's simulated recognition, a fixed sentence) | Could you tell me which bridge you mean, please? | |
| 4 | Pip | | Oops, I did not say a bridge! Can you ask me where I saw it last? | Yes. The sentence is the harness's, not a child's: Pip never said "bridge", and Pip says so plainly, then repeats the goal. A fair answer to an odd line. |
| 5 | Pip (replay) | | Sorry, there was no bridge, my mistake! Can you ask me where I last saw the rover, in your own words? | Partly. It is a new question under "Try it again", but it apologises a second time for the bridge instead of asking something new, so the replay is nearly the same as line 4. |

Coaching note (the TV's "You said" is turn 3, exact):

- before: Could you tell me which bridge you mean, please?
- after: Sorry, what do you mean? Where did you see it last?
- note: "Clear repair move: you asked Pip to explain the word bridge, and 'please' sounds polite. Next time, a shorter phrase like 'Sorry, what do you mean?' can keep the chat moving."
- Builder's reading: the praise rests on a premise the transcript does not support (Pip never used the word "bridge"; the harness's fixed sentence did). The model took the learner's words at face value. The suggested phrase itself is good.

Evidence kept by the desk: a picked phrase "Which bridge do you mean?" (mode choice, skill repair) and the spoken line (mode speech, repair). The typed
line left no evidence row.
