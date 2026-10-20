# Linga LT code-only recert 14 (2026-10-20)

Run: uat/runs/2026-10-17-lt-swap-2/. Base: main f315e1b9. No model call, no claude CLI, no driver run: the product's own functions (help.ts, plain.ts, turn.ts, conversation.ts prompts) called from a scratch script on the recorded recert-12 and recert-13 text. Shape follows ed23c4ac. Each row carries `code_recert` in its findings.json; `resolution` stays open on all four and uat/runs/OPEN.md is unchanged. **L2 live recert is owed (operator) on every row.**

Reconcile: 6f95d267, fbb8fd6d and 7c185a08 are each an ancestor of main (`git merge-base --is-ancestor`); none of the four rows carried a code stamp before this pass.

recert-13 recorded no `scene.cue` for the plan topics, so the cues are those recert-8..12 recorded for "Ask about school" (`Try: What did you do at school today?`) plus recert-13's cue rung (`Hi Sam! How is school today?`).

## recert-13 LT-viktor-67-J4-2 (6f95d267): Pause & coach disabled while stuck

Acceptance: "Pause & coach is enabled before the first reply."

| Clause | Verdict |
|---|---|
| Enabled before the first reply | **fixed** - view.ts:689 no longer gates the action on hasReply; turn.ts:105-106 accepts coach when the last turn is the partner's. accepts(partner last) = true, accepts(no turns) = false |
| Stuck learner gets the scene's phrase, else the next help rung, no model call | **fixed** - conversation.ts:582-590. sceneTaskFor gives "Hi Sam! How is school today?" at A1 and A2 for the cue rung, and "What did you do at school today?" at A2 for the plan cue |
| Press never silent | **fixed** - conversation.ts:588 falls back to the goal line |

Sub-case left open for L2: at A1 with the past-tense plan cue (sceneTaskFor = "", sceneCueFor = null) and no ladder, the learner gets "Take your time. One short sentence is enough: <goal>", not a phrase to say.

L2 must check: the button is lit on the first turn on the phone and TV; what a stuck A1 learner sees after one press on a past-tense-cue scene.

## recert-13 LT-viktor-67-J4-3 (7c185a08): fresh-question replay drifted off school

Acceptance: "After a repair, the recap invites answering the fresh question."

| Clause | Verdict |
|---|---|
| Replay asked with the scene's goal and open step | **fixed** - conversation.ts:713 (sceneGoal, currentStep); test tools/linga-rules-test.cjs:3896-3908 |
| Model told to stay on the scene | **fixed on the prompt side** - REPLAY_TASK, conversation.ts:177. No code check rejects an off-topic replay question (replay.ts:97-107 tests form, frame, band and rephrase only), so the outcome is **open** |
| Recap invites answering the fresh question | **open** - the commit is the code side only; view.ts:227 still says "Tried again, not with the new form yet" only after a try |

L2 must check: a replay question on the school topic across several runs; what the recap shows when the fresh question is left untried.

## recert-13 LT-viktor-67-J4-4 (fbb8fd6d): jargon in coaching, missed fixes

Acceptance: "Notes use plain words, for example 'Say: I eat tomatoes'."

| Clause | Verdict |
|---|---|
| No grammar term at A1-A2 | **fixed** - plain.ts:13, conversation.ts:330 (moment), :767 (coach note to PLAIN_NOTE), PLAIN_TASK in both tasks. The recorded 'Add the subject and verb so the sentence is clear.' and 'An English sentence needs a verb' both test true and are dropped |
| Plain words, e.g. "Say: I eat tomatoes" | **fixed in effect, not in form** - a term-free note passes; a termed coach note becomes "Say it this way. It is easier to hear." Code never writes a "Say: <better>" note, so the wording rests on the model |
| The 'Is school good?' fix is shown | **open** - untouched by fbb8fd6d; the three held fixes are the LG-23 hold by design |

L2 must check: real A1 notes read plainly (not "Say it this way" for every fix); whether 'School good?' -> 'Is school good?' shows at the finish.

## recert-12 LT-viktor-67-J4-5 (fbb8fd6d): "You have school?" turned into the past with jargon

Acceptance: "Fix keeps his intended meaning, no grammar terms."

| Clause | Verdict |
|---|---|
| Keeps meaning, no tense change | **fixed** - plain.ts:25. keepsTense("You have school?", "Did you have school today?") = false, so the recorded fix is dropped (conversation.ts:330 moment, :766 coach); "School good?" -> "Is school good?" = true |
| No grammar terms | **fixed for the listed terms, edge open** - hasGrammarTerm("Use did for school today") = false: an instruction naming an auxiliary ("Use did", "Use are") is not in the term list. Moot for the recorded case, the tense guard drops it first |

L2 must check: a beginner fix with "Use <word>" wording; that a present-tense question is never answered with a past-tense fix.

## Summary

Eleven clauses over four rows: 9 stamped fixed (the J4-3 prompt clause and the J4-4 plain-words clause only on the prompt side or in effect), 2 open (J4-3 recap, J4-4 held fix), plus three named edges (J4-3 off-topic outcome; A1 no-phrase case; "Use did" wording). No desk/ source changed.
