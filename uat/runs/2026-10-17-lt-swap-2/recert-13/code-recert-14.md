# Code-only recert 14 of recert-13 LT-viktor-67-J4-2, J4-3, J4-4

Base main f315e1b9; commits 6f95d267 (J4-2), 7c185a08 (J4-3), fbb8fd6d (J4-4, also recert-12 J4-5), all ancestors of main. No model call. **L2 live recert owed (operator)** on every row; resolution stays open, uat/runs/OPEN.md unchanged. Stamp: `code_recert` on each row in findings.json. Detail and what L2 checks: docs/uat-insights/2026-10-20-lt-code-recert-14.md.

recert-13 recorded no `scene.cue` for the plan topics. Cues used: the plan cue recert-8..12 recorded for "Ask about school" (`Try: What did you do at school today?`) and the recert-13 cue rung (`Hi Sam! How is school today?`).

| Row | Clause | Stamp |
|---|---|---|
| J4-2 | Pause & coach enabled before the first reply | fixed (view.ts:689, turn.ts:105-106) |
| J4-2 | stuck learner gets the scene phrase, else the next rung, no model | fixed (conversation.ts:582-590); A1 + past-tense plan cue gives no phrase (sceneTaskFor "") |
| J4-2 | press never silent | fixed (conversation.ts:588) |
| J4-3 | replay carries sceneGoal and open step | fixed (conversation.ts:713) |
| J4-3 | task tells the model to stay on the scene | fixed on the prompt side (conversation.ts:177); no code check on topic, outcome open |
| J4-3 | recap invites answering the fresh question | open (view.ts:227 unchanged) |
| J4-4 | no grammar term at A1-A2 | fixed (plain.ts:13, conversation.ts:330/:767) |
| J4-4 | plain words, e.g. "Say: I eat tomatoes" | fixed in effect, not in form (PLAIN_NOTE fallback, conversation.ts:169) |
| J4-4 | the "Is school good?" fix is shown | open (held by LG-23, untouched) |

## Product functions on the recorded text

| Call | Result |
|---|---|
| sceneTaskFor("Try: What did you do at school today?", A1, any) | "" (past tense out of band) |
| sceneTaskFor(same, A2, any) | "What did you do at school today?" |
| sceneTaskFor("Try: Hi Sam! How is school today?", A1 / A2, "Hi! I am Sam. Do you have school?") | "Hi Sam! How is school today?" |
| sceneCueFor(plan cue, A1, unspent) | null (out of band): the no-phrase case falls to the goal line |
| accepts(partner last, "coach") / accepts(no turns, "coach") | true / false |
| hasGrammarTerm("Add the subject and verb so the sentence is clear.") | true: moment dropped at A1-A2 |
| hasGrammarTerm("An English sentence needs a verb") | true: moment dropped |
| hasGrammarTerm("Say: I eat tomatoes every day.") | false: passes |
| keepsTense("School good?", "Is school good?") | true |
| keepsTense("Every day tomatoes", "I eat tomatoes every day") | true |
| momentTaskFor(true) includes PLAIN_TASK / momentTaskFor(false) | true / false |
