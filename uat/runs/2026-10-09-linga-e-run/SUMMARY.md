# Linga E1-E9 run, 2026-10-09 (M4 goal 1)

Two attempts of `tools/linga-ui-test.cjs`, both on an empty `DESK_DATA_DIR` in the OS temp dir (outside every repo),
port 3217, `next dev --webpack`, no API key, no ElevenLabs/Piper, text engine = the claude CLI (2.1.295, signed in;
`conversation.provider` read `claude-cli/haiku`). No push, no desk code touched.

## Attempts

1. **Attempt 1: failed at the first page, a harness defect.** `waitForSelector('[data-role="desk-object"]')` at
   `tools/linga-ui-test.cjs:91` timed out. The TV sat on the "Mia's phone is on the desk" confirmation: the harness
   waited only for the phone's cookie (line 89, before the fix), the nav to landing arrived before the join event, and the join then
   overwrote it (`desk/src/lib/session/store.ts:507-508`). No model call was made; no timings.json was written.
   Fixed in one commit (4ecd22c7: the harness waits for `joined` before the nav).
2. **Attempt 2, fresh DATA and server: ran E1-E6 live, stopped at E7 on a stale selector.** `tools/linga-ui-test.cjs:135`
   waits for `.linga-track` after Finish; the TV recap no longer renders it (`.linga-track` exists only in
   `desk/src/english/OpenDoor.tsx:83`, the Stones, which the recap does not use). The desk was on `linga-recap`
   and the recap shows (shots/tv-recap-postrun.png, taken by the builder after the failure). **Not fixed or rerun: the
   brief caps the harness at two runs.** `results.json` was never written (the harness writes it only at the very end),
   so it is absent here; `timings.json` is the harness's own file, unedited.

## Steps

| Step | Verdict | Evidence |
|---|---|---|
| E1 Seat and pair | pass (TV 1920x1150 default stage; the Desk display toggle was not used) | the run reached line 135 past the pairing asserts (lines 89-98) |
| E2 Level | pass | the harness asserted no placement and the two level buttons, no "Start talking" (lines 100-101), then `level-self` 75 ms, A2 (timings.json) |
| E3 Scene | pass for scene and line; **the footer never read "Partner speaking"** (headless) | `start` in timings.json: 8809 ms to a new line; footer "Select Repeat audio to enable speech, or use captions." |
| E4 Live replies | pass on lines (two replies, each a new Pip line); **no moment fired** | `turn` x2 in timings.json; transcript.md rows 1-4; no `moment-done` timing, session `moments` empty |
| E5 Coaching note | pass | shots/tv-coach.png; "You said" equals turn 3 exactly (transcript.md) |
| E6 Replay | pass | shots/tv-replay.png: new question, footer tag "TRY IT AGAIN" |
| E7 Recap | **fail in the harness, product reached**: `finish` 200 in 99 ms, screen `linga-recap`, recap visible. The harness's `.linga-track` wait (line 135) timed out. The phone's moments list is empty (no moment). One learned thing on the TV: the recap shows "You said", "One way to try it", the mission and "1 spoken · 1 written replies" | timings.json `finish`; shots/tv-recap-postrun.png, shots/phone-after-finish-postrun.png |
| E8 Timing | measured for 6 of 7 actions, table below | timings.json |
| E9 Boundary | pass | the adults-only start answered 403 (server log; the harness asserts it at line 82) |
| After E7 (not reached) | not reached | My map's 8 chapters, the print table and PDF, mobile width, the Maths and Essay entrances (lines 136-141); `results.json`'s checks list |

## E8 table (ms, from timings.json; attempt 2)

| action | ms | modelMs | sendToLineMs | lineToVoiceMs |
|---|---|---|---|---|
| level-self | 75 | none (no model call) | null | null |
| start (opening) | 8809 | 8739 | 8815 | null |
| turn (typed) | 11754 | 11578 | 11766 | null |
| turn (spoken) | 10744 | 10700 | 10750 | null |
| coach | 6290 | 6257 | null (a note, not a line) | null |
| replay | 9999 | 9960 | 10002 | null |
| finish | 99 | 9960 (carried over: the conversation's last `responseMs`, no new call) | null | null |

- Five real model calls: modelMs median **9960**, max **11578**, total 47.2 s. Turns alone: 11578 and 10700.
- Against the prediction (a turn: median 4.7 s, max 6.2 s; five calls 24-31 s): about 2x slower on every call. The
  coach, the cheapest, took 6.3 s. Prediction not met; the 2x is on a different model (haiku) than the 25 Sep figure's
  "fast model", no run-to-run spread is known (one run).
- Thinking reaching the CLI: **no sign.** The 9 Sep figures were 17-52 s an operation and 60 s timeouts; the max here is
  11.6 s, no timeout, no 502. That does not prove thinking is off; it says the figures are not those of the 9 Sep run.
- lineToVoiceMs is null for every action: no "<partner> speaking" within 15 s. The server answered `/api/speak` 503 seven
  times (no voice configured, as set up) and the footer held "Select Repeat audio to enable speech, or use captions."
  Nothing was heard.

## The server's own lines (quoted only the ones cited)

- ` POST /api/english 403 in 9ms` the E9 refusal.
- ` POST /api/speak 503 in 413ms` (seven, 8-413 ms): no server voice configured.
- A second ` POST /api/english 403 in 9ms` appeared after the harness had stopped. I did not trace it; the only other
  pages open then were the builder's own debug pages (a TV and a phone that joined by pin).
- No stack traces, no 5xx.

## Notes

- Attempt 1's server log and output are not kept here (no model call was made).
- Screenshots: E3 scene and E4 replies were not captured by the harness (it takes only coach, replay and phone-replay
  shots); the two `postrun` shots were taken by the builder after the harness stopped.
