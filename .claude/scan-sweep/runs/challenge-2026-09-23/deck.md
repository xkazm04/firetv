# Deck - challenge-2026-09-23

| # | card | size | risk | impact | gate | files | critic | rank | verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **desk-pipelines A** Pipeline runs as typed session jobs: one runner, keyed lesson, no silent fails | L | 6 | 8 | architecture | 14 | 4.67 | 37.3 | build |
| 2 | **engines B** Desk work becomes a session job: no stuck waits, late results dropped, retry in place | M | 5 | 8 | contract | 11 | 4.67 | 37.3 | revise |
| 3 | **linga A** One Linga screen model: TV, phone home, test bar and LT driver derive from it | L | 6 | 8 | architecture | 6 | 4.67 | 37.3 | build |
| 4 | **linga B** Help that answers the question on screen: a code-run rescue ladder per turn | M | 5 | 8 | contract | 7 | 4.67 | 37.3 | build |
| 5 | **tv-app B** Review mode: drawn moments on the scrub bar, one tap to jump to each | M | 6 | 8 | direction | 10 | 4.67 | 37.3 | build |
| 6 | **uat B** One-command LT recertify: rerun open pairs, write back verdicts and deltas | M | 5 | 8 | none | 6 | 4.67 | 37.3 | build |
| 7 | **desk-pipelines B** 'How did you get there?' settles the item: spoken value substituted on the walk | M | 6 | 8 | contract | 8 | 4.33 | 34.7 | build |
| 8 | **tv-surface B** The marked sheet as one picture you act on: jump to a slip, six more, resume | M | 5 | 8 | contract | 10 | 4.33 | 34.7 | build |
| 9 | **tv-surface A** One D-pad for the TV: a pure, tested keymap that shares focus stops with screens | M | 6 | 7 | none | 7 | 4.67 | 32.7 | build |
| 10 | **uat A** LT driver reads the rendered TV and phone, not a hand-written mirror of them | M | 6 | 8 | policy-tighten | 6 | 4 | 32 | revise |
| 11 | **tv-app A** Move the pen conversation into core as a sans-IO state machine | M | 5 | 7 | none | 5 | 4.33 | 30.3 | revise |
| 12 | **engines A** Engines enforce the caller's schema for every provider, behind one registry | L | 6 | 7 | architecture | 15 | 4 | 28 | revise |

- **desk-pipelines A** - Approve: every homework pipeline failure becomes a visible, retryable state on the TV; hint counts and the stale-lesson bug fixed on the way.
- **engines B** - Same move as desk-pipelines A from the session side; approve as the retry-in-place increment on top of A, not as a second runner.
- **linga A** - Approve: Linga's screens decided once, tested for the first time, and the LT driver stops judging a hand copy that has already produced refuted findings.
- **linga B** - Approve: help follows the partner's current question, costs no extra model call, and stops marking every helped reply as supported.
- **tv-app B** - Approve (direction): the viewer reaches any drawn frame in one tap instead of scrubbing and watching; the transport rules get their first tests.
- **uat B** - Approve: recertification becomes one command that reruns only the open pairs, stamps the originating run, and flags the confound the operator had to reason out by hand.
- **desk-pipelines B** - Approve: an unsure item finally settles from the learner's own spoken value, decided by verify() not the model, with a code check that no reply leaks the answer.
- **tv-surface B** - Approve: six verdicts as one picture, a slip in one press, six more on the same topic in two, and a marked set that survives Back.
- **tv-surface A** - Approve: the TV's D-pad becomes a tested module, twelve screens stop keeping two focus layouts in lockstep, and a failed practice set no longer freezes Topics.
- **uat A** - Same target as linga A (the driver stops judging a hand copy); approve only as the rendered-markup layer on top of linga A's view, not as a competing rewrite of surface().
- **tv-app A** - Approve after the citation fix: eleven untested pen-protocol behaviours become 8 JVM cases in :core:test with no change to the wire.
- **engines A** - Approve after the citation fix: one validator and one registry so a malformed model answer can no longer arrive typed as the caller's shape, on claude and codex alike.

## Wave plan (disjoint write sets; shared surface desk/package.json under the mkdir lock)

| Wave | Builders | Why this order |
|---|---|---|
| 1 | engines A, tv-app A | engines A changes text()/vision() rejection - a signature every desk card calls - so it runs first with no other desk builder; tv-app A is JVM-only and cannot call it |
| 2 | linga A, tv-surface A, tv-app B | linga A before linga B / uat A; tv-surface A before tv-surface B / desk-pipelines A; tv-app B after tv-app A |
| 3 | desk-pipelines A, linga B | pipelines A needs tv-surface A's keymap and engines A's errors; linga B needs linga A's view and engines A's shape helpers |
| 4 | desk-pipelines B, uat A | pipelines B runs under A's runJob; uat A consumes linga A's view |
| 5 | tv-surface B, uat B | tv-surface B after pipelines B (store, screens, phone); uat B after every other driver edit |
| 6 | engines B (revised) | the retry-in-place increment on top of desk-pipelines A's jobs record |

Integration gate after every wave: `cd desk && npm test`, plus `gradlew :core:test :tv-app:compileDebugKotlin` when a Kotlin card landed.
Excluded (irreversible / policy-loosen / cross-repo): none.
