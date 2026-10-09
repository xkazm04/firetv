# Linga E1-E9 run 2, 2026-10-09 (M4 goal 1)

Two runs of `tools/linga-ui-test.cjs`, each on an empty `DESK_DATA_DIR` in the OS temp dir (outside every repo), port 3217,
`next dev --webpack`; ANTHROPIC_API_KEY, CLAUDECODE, CLAUDE_CODE_*, ElevenLabs, Piper and DESK_TEXT_ENGINE unset; no `.env`;
text engine the claude CLI 2.1.295 (`conversation.provider` read `claude-cli/haiku`). No push, no desk code touched.
Both servers were stopped by the PID I recorded (50596, 22092); the port is free.

## Attempts

1. **Attempt 1: E1-E7 passed, then a harness defect at the print page.** The harness opened the phone with
   `browser.newPage()` and then called `phone.context().newPage()` (line 140) for the print page; Playwright refuses it
   ("Please use browser.newContext()"). It got there only after the recap wait, so the recap fix worked. No `results.json`.
   Fixed in one commit (77206a03: the phone gets its own `newContext()`). Its evidence is not kept here.
2. **Attempt 2, fresh DATA and server: E1-E7, My map, the print page and mobile width passed; the Maths entrance failed.**
   `assert.equal(subject,'maths')` at `tools/linga-ui-test.cjs:142` read `english`. **No `results.json`**: the harness writes it
   only at line 146, after the Essay entrance (not reached) and the errors check. `timings.json` is the harness's own file,
   unedited (it is written after every action). The harness is at its two-run cap, so the Maths failure was not fixed.

### The Maths entrance failure (not diagnosed)

- After the run, a read of `GET /api/session` as the TV (no page opened) gave `screen: landing`, `focus: 0`, `subject: english`.
  So the nav to landing focus 0 had landed and the Enter key then did nothing, within the seconds before and after the assertion.
  The harness's wait `!document.querySelector('.linga-tv')` (line 142) is already true on the landing, so it waited for nothing.
- Difference from the first Enter (line 94): that one is preceded by `tv.locator('.stage').click(...)`; the second is not.
  Whether the key handler needs that focus, or the TV had not yet read the new screen when Enter was pressed, I cannot say
  without another run. Harness defect or product defect: **undecided** (a question in the result).

## Harness commits (each touches only tools/linga-ui-test.cjs)

- d0764a23 H1: E7 waits on `session.screen === 'linga-recap'`, then `.linga-tv[data-view="linga-recap"]` (LingaTV.tsx:93; view.ts:618 sets `screen`). The old line waited for `.linga-track`, which only OpenDoor.tsx:83 renders.
- 78709e24 H2: the spoken line is 'Where you saw the rover last time?' (line 88; its wait at line 129). The picked phrase 'Which bridge do you mean?' is unchanged.
- d5a21566 H3: screenshots only (tv-scene, tv-reply, tv-moment when a moment fires, tv-recap, phone-recap). No assertion added.
- 77206a03: the phone's own browser context (attempt 1).
- **H4: no selector after the recap is stale.** Read against today's code: 'My map' (LingaPhone.tsx:48), `.linga-skill` x8 (the map panel in LingaPhone.tsx; `ENGLISH_SKILLS` has 8, curriculum.ts:8-17), `/english/print` with `.linga-print table` and 8 `tbody tr` (print/page.tsx), the Maths entrance (landing stops are maths, english, essay: landingRows.ts:17 and 36-38, so focus 0 and 2) and the Essay entrance (`MODULE_HOME.essay` is `essaytype`, keys.ts:97). The run bore this out up to the Maths assertion.

## Steps

| Step | Verdict | Evidence |
|---|---|---|
| E1 Seat and pair | pass | the run passed the pairing asserts (harness lines 90-99) |
| E2 Level | pass (A2 by hand, `level-self` 326 ms) | timings.json |
| E3 Scene | pass for scene and line; the footer never read "Partner speaking" (headless) | `start` in timings.json; shots/tv-scene.png |
| E4 Live replies | pass on lines; **a moment fired** after the spoken reply (a fix, the learner's exact words) | timings.json `turn` x2 and `moment-done`; shots/tv-reply.png, shots/tv-moment.png; transcript.md |
| E5 Coaching note | pass; "You said" is turn 3 exactly and the premise holds | shots/tv-coach.png; transcript.md |
| E6 Replay | pass (a line under "Try it again"; it asks the learner to repeat rather than something new) | shots/tv-replay.png, shots/phone-replay.png |
| E7 Recap | **pass**: `finish` 143 ms, screen `linga-recap`, recap drawn with no workaround ("1 spoken . 1 written replies . 1 moment to keep") | timings.json `finish`; shots/tv-recap.png, shots/phone-recap.png |
| E8 Timing | measured, table below | timings.json |
| E9 Boundary | pass (one 403) | server log line 16; the harness asserts it at line 83 |
| After E7: My map, 8 chapters | pass (the harness went past the assert at line 139) | no screenshot; the next line ran |
| After E7: print page | pass: 8 rows asserted, PDF written, **1 page, 25150 bytes** (not committed) | harness line 140 ran; learning-map.pdf in the harness's out folder |
| After E7: mobile width | pass (assert at line 141 passed: no horizontal scroll at 390 px) | the next line ran |
| After E7: Maths entrance | **fail**: subject read `english` | harness line 142; see above |
| After E7: Essay entrance | not reached (after the Maths assertion) | |
| Page-errors check | not reached | |

M4 goal 1's measure (scene, live partner replies, coaching note, replay and recap on a real model, no workaround) is met by
E1-E7. The after-E7 checks are not all green and `results.json` was not written.

## E8 table (ms, timings.json, attempt 2)

| action | ms | modelMs | sendToLineMs | lineToVoiceMs |
|---|---|---|---|---|
| level-self | 326 | none (no model call) | null | null |
| start (opening) | 13845 | 13781 | 13852 | null |
| turn (typed) | 13484 | 13295 | 13490 | null |
| turn (spoken) | 19563 | 19515 | null (the TV showed the moment, not a line; the watcher waited its 120 s) | null |
| moment-done | 35 | 19515 (carried over, no call) | null | null |
| coach | 11545 | 11491 | null (a note, not a line) | null |
| replay | 10785 | 10746 | 10808 | null |
| finish | 143 | 10746 (carried over, no call) | null | null |

| | median modelMs | max modelMs | calls |
|---|---|---|---|
| run 2 (opening, 2 turns, coach, replay) | **13295** | **19515** | 5, 68.8 s in all |
| run 1 | 9960 | 11578 | 5, 47.2 s |
| prediction | 4700 | 6200 | |

Run 2 is about 2.8x the prediction at the median (3.1x at the max) and 1.3x run 1 at the median (1.7x at the max): two runs of
the same code already differ by a third. The slowest call was the spoken turn that raised a moment (19.5 s). lineToVoiceMs is
null throughout: `/api/speak` answered 503 seven times (no voice configured) and the footer held "Select Repeat audio to enable
speech, or use captions." Nothing was heard.

## What the conversation engine passes to the claude CLI (a reading; nothing changed)

`desk/src/lib/engines/text.ts:46-47`: `claude -p --no-session-persistence --tools "" --system-prompt <system + the JSON schema as text> --output-format json --model haiku`
(`MODELS.fast` is `CLAUDE_FAST_MODEL` or `haiku`, text.ts:25). Every tutor call (opening, turn, coach, replay) sets `model:"fast"`,
`isolated:true`, `thinking:false` (conversation.ts:233 and 326), so line 50 adds `--safe-mode --strict-mcp-config --disable-slash-commands`
and line 53's `--json-schema` is skipped. `thinking:false` becomes the environment variable `MAX_THINKING_TOKENS=0`
(text.ts:28-33). **No `--effort` flag and no thinking flag is passed.** The prompt goes in on stdin; the child runs in a fresh temp dir.
So the slower figures do not come from thinking being on, and no argument the engine passes names an effort.

## The server's own lines (only the ones cited)

- `POST /api/english 403 in 9ms`: **1** line, the E9 refusal (log line 16). Run 1 had an untraced second one; this run had none.
- `POST /api/speak 503` x7, 8-668 ms: no server voice. These are the only 5xx lines in the log (7 of 7).
- No stack trace and no `Error` line. The log holds the TV key and is not kept.

## Notes

- Moments are not asserted. `results.json`, which would have recorded `fired:true`, was not written; the session read after the run
  is the source (transcript.md).
- I opened no page of my own while the harness ran. My `curl` GETs of `/` were the start-up wait, before it.
- The recap hero is the coaching comparison, not the moment (view.ts:458-460: coaching wins); the moment shows only in the count.
