# Linga LT code-only recert 15 (2026-10-20)

Run: uat/runs/2026-10-17-lt-swap-2/. Base: main ee0fd7d7. No model call, no claude CLI, no driver run: the three edges code-recert-14 (docs/uat-insights/2026-10-20-lt-code-recert-14.md) left open are closed in desk/src/lib/english and proved in tools/linga-rules-test.cjs (249 tests, 0 fail). Each row carries a `code_recert_15` stamp (commit, verdict) in recert-13/findings.json beside its recert-14 `code_recert`; `resolution` stays open on all three and uat/runs/OPEN.md is unchanged. **L2 live recert is owed (operator) on every row.**

Reconcile: none of the three edges was closed on main before this pass (replay.ts replayRefused had no scene check; hasGrammarTerm had no "use <word>"; the coach branch wrote PLAIN_NOTE only).

## recert-13 LT-viktor-67-J4-3 (9c22af0e): off-topic replay question

| Clause | Verdict |
|---|---|
| Replay asked with goal and open step | fixed (7c185a08, unchanged) |
| No code check rejects an off-topic replay | **fixed in code** - replay.ts `replayRefused(..., scene)` and `staysOnScene`: the question must share a content word (question and filler words, light words and auxiliaries ignored) with the scene goal, open step or cue, else "The replay question left the scene." conversation.ts `backRefusal` passes `[goal, open step, scene.cue, every line said so far]` (goal and cue alone made the existing replay fixtures, whose questions use the learner's own words, fail; a plural counts as its singular), so the one retry and the final refusal both use it. A scene with no topic word holds nothing |
| Recap invites answering the fresh question | still **open** (view.ts, as in recert-14) |

Test: "Which sport do you play at the weekend?" in a school scene (goal "Ask Sam about school.", cue "Try: What did you do at school today?") is refused; "Which sport do you play at school?" passes; with no scene given nothing changes.

Known limit: because the lines said so far count, a drift onto a topic the learner themself raised passes; words are matched as written (no lemmas or synonyms); a school replay phrased only with "class" or "teacher" against a goal saying "school" is refused and is retried once, then the Back falls to the conversation as for any refused replay.

## recert-12 LT-viktor-67-J4-5 edge (d6e143f3): "Use did"

plain.ts `hasGrammarTerm` is true for "use" followed by did, do, does, are, is, am, was, were, have, has, a, an, the. "Use did for school today.", "Use are here.", "use a before cat" are termed; "Say: I eat tomatoes", "Use simple words.", "You used a good word." are not. Because conversation.ts uses hasGrammarTerm for the moment and coach notes, those notes are now dropped.

## recert-13 LT-viktor-67-J4-4 (195ab5cc): the Say form

conversation.ts coach branch: a beginner's note dropped for a grammar term becomes "Say: <after>" from the coach's own after line (already through audienceSafe and keepsTense); PLAIN_NOTE stays only for an empty after. Test: 'School good?' -> 'Is school good?' with note "Use the verb is." shows "Say: Is school good?". The held fix at the finish (LG-23) stays open by design.

## Summary

Three code edges closed, one commit each; clauses still open for L2: the J4-3 recap, the J4-4 held fix, the A1 no-phrase sub-case of J4-2. Not run: tsc or lint (none configured for the gate).
