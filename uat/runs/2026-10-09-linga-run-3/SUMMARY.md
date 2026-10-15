# Linga E1-E9 run 3, 2026-10-09

One run of `tools/linga-ui-test.cjs` (with the R1 entrance polling). DATA: a fresh directory in the OS temp dir (outside every
repo, deleted afterwards). Port 3217, `next dev --webpack`, claude CLI 2.1.295, `conversation.provider` `claude-cli/haiku`.
ANTHROPIC_API_KEY, CLAUDECODE, every CLAUDE_* variable, ElevenLabs, Piper and DESK_TEXT_ENGINE were unset for the server.
My first server start inherited this session's CLAUDE_CODE_* variables; I killed it by PID (15768) before any request and started
again with them unset (PID 45736, stopped with `taskkill //PID 45736 //T //F`; the port holds only TIME_WAIT sockets).
No `.env`, no push, nothing under desk/ touched. **One harness run; `passed: true`; `errors: []`.**
Playwright came from `NODE_PATH=C:/Users/kazda/kiro/firetv/tools/node_modules` (read only). The harness writes to the
worktree's untracked `artifacts/`; I copied the evidence and deleted that folder.

## Steps

| Step | Verdict | Evidence |
|---|---|---|
| E1 Seat and pair | pass | harness asserts passed |
| E2 Level | pass (A2 by hand, `level-self` 324 ms) | timings.json |
| E3 Scene | pass; this time the footer **did** read "Partner speaking" (`lineToVoiceMs` 1817 ms after the opening line) | timings.json `start`; shots/tv-scene.png |
| E4 Live replies | pass on lines; a moment fired after the spoken reply (a fix, exact words) | timings.json; results.json `moments`; shots/tv-reply.png, shots/tv-moment.png; transcript.md |
| E5 Coaching note | pass | shots/tv-coach.png |
| E6 Replay | pass; a new question this time ("what is near the rover now") | shots/tv-replay.png, shots/phone-replay.png; transcript.md |
| E7 Recap | pass (`finish` 118 ms) | shots/tv-recap.png, shots/phone-recap.png |
| E8 Timing | measured, below | timings.json |
| E9 Boundary | pass: **1** `POST /api/english 403` (server log line 17) | quoted below |
| After E7: My map (8 chapters), print page, mobile width | pass (the harness went past each assert). Print PDF: **1 page, 25150 bytes**, not committed | results.json `passed` |
| After E7: Maths entrance | **pass**, Enter with no click, reached in 605 ms | results.json `entrances` |
| After E7: Essay entrance | **pass**, no click, reached in 647 ms | results.json `entrances` |
| Page-errors check | pass (`errors: []`) | results.json |

## Entrances (R1)

| entrance | click | ms to arrive | reached |
|---|---|---|---|
| maths | false | 605 | true |
| essay | false | 647 | true |

Both arrived on the first attempt, with no click, so the fallback click never ran. The W-run's figure was 744 ms after a click;
here it is 605-647 ms from the key press, about the 560 ms `ZOOM_MS` plus a poll step. That fits the App Master's reading of R1
(a race on the zoom delay, not a missing focus click): Enter with no click works once the session is polled. It does not prove
the old failure was that race (the old check never polled), but nothing here points to a product defect.

## E8 table (ms, timings.json)

| action | ms | modelMs | sendToLineMs | lineToVoiceMs |
|---|---|---|---|---|
| level-self | 324 | none | null | null |
| start (opening) | 8547 | 8460 | 8553 | 1817 |
| turn (typed) | 8555 | 8343 | 8562 | 79 |
| turn (spoken, moment) | 8281 | 8218 | null (the TV showed the moment) | null |
| moment-done | 47 | 8218 (carried over) | null | null |
| coach | 10471 | 10405 | null | null |
| replay | 8576 | 8526 | 8579 | 62 |
| finish | 118 | 8526 (carried over) | null | null |

| | median modelMs | max modelMs | calls |
|---|---|---|---|
| run 3 (opening, 2 turns, coach, replay) | **8460** | **10405** | 5, 43.95 s in all |
| run 1 | 9960 | 11578 | 5, 47.2 s |
| run 2 | 13295 | 19515 | 5, 68.8 s |

The harness's own `turnTiming.modelMs` says n=7 (it counts the two carried-over values); the five real calls give the same
median and max. Run 3 is the fastest of the three. Same code, three runs, 8.5 s to 13.3 s at the median: the spread is
between runs, and run 2 ran beside P19's device work. Fits R2's "no action".

## R2: a bare haiku call through the CLI

Fresh empty directory in the OS temp dir; CLAUDE_CODE_*, CLAUDECODE, ANTHROPIC_API_KEY unset; MAX_THINKING_TOKENS=0; the flags
of text.ts:46-53; a one-line system prompt; prompt "Reply with the single word OK." The script ran the CLI with `shell: true`
(`claude` is a shim on this machine), so the wall includes the shell.

| call | wall ms | duration_ms | duration_api_ms | wall minus duration_api_ms |
|---|---|---|---|---|
| 1 | 7049 | 2284 | 612 | 6437 |
| 2 | 6261 | 1358 | 763 | 5498 |
| 3 | 7816 | 1143 | 840 | 6976 |
| `claude --version` | 76 | | | |

Reading: a trivial call costs 6-8 s of wall time, of which the API took 0.6-0.8 s and the CLI's own `duration_ms` 1.1-2.3 s, so
about 5-6 s is process start-up outside both timers. Of the ~8.5 s a real turn takes, roughly 6 s looks like fixed CLI start-up
and only 2-3 s model time; streaming would not touch that. (`--version` is 76 ms, so it is not the shim: it is work the first
real call does. One machine, three calls, and the shell wrapper is in the wall.)

## R3: why the typed and spoken replies left no evidence row

Read-only trace; the desk does not keep the model's raw output.

**Every condition that drops a model observation**
1. `observations` is not an array: `rules.ts:66`.
2. Only the first two items are looked at: `rules.ts:68` (`slice(0,2)`).
3. Per item, `rules.ts:69`: skill is not a skill id; skill not in the allowed list (the scene's focus skill, the review skill, `repair`: `conversation.ts:327`); a second observation for a skill already seen; `confidence` is not exactly `"clear"`; `success` is not a boolean; `quote` is not a string, is blank, is not a literal substring of the submitted reply, or is over 240 characters; `note` is not a string or is over 180.
4. `creditOf` returns `none`: `credit.ts:43` (no words, or only formula words) and `credit.ts:46` (not a copy of a shown line and the wrong shape: `repair` and `request` need a "?" or a marker word, any other skill at least `MIN_WORDS` = 3 words, `credit.ts:13`, `credit.ts:35-39`).
5. After validation `mergeEvidence` drops a row whose id is already present: `rules.ts:60`.
6. The call accepts the reply under a loose schema (`turnAccept`, `conversation.ts:42`), so a malformed observation never fails the turn: items 1-4 drop it silently.

**What the desk holds.** Turn 1 (typed, "Where is the rover?"): no evidence row. Turn 3 (spoken, "Where you saw the rover last time?"): no evidence row. `conversation.evidence` and `englishLearning.evidence` both hold only the `choice` row (`...:choice`, `repair`). Same as run 2.

**What it is consistent with.** Both replies are questions of four or more words. Neither copies a shown line. So condition 4 would not drop either one for `repair`, `request` or any other skill, and a row that reached `creditOf` would have survived. The absence is therefore consistent with the model returning no observation, or with one dropped by condition 3: a skill outside the allowed list, a `confidence` other than `"clear"`, a quote that is not a literal substring, or a missing or oversized field. It **cannot be decided** without the raw model output: the desk keeps only validated rows and logs no dropped observation.

**Question, not fixed** (no desk edit): `rules.ts:69` drops silently and `conversation.ts:42` accepts any shape. Keeping the raw `observations` array, or a count and reason per drop (even only in a dev log), would make this decidable on the next run. The `credit` line in the prompt (`conversation.ts:328`) tells the model to make no observation unless the words themselves do the skill, which a haiku model could read as "none" for a plain question.

## Server log lines cited

- `17: POST /api/english 403 in 13ms (next.js: 3ms, proxy.ts: 6ms, application-code: 5ms)`: the only 403 (E9).
- No 5xx on `/api/english`. `POST /api/speak 503` appears 5 times (first `47: POST /api/speak 503 in 1438ms`): no server voice is configured. The footer still read "Partner speaking" three times, so the browser's own synthesis voice spoke it.
