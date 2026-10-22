# Stick deadline-readiness walk (2026-10-21)

Standup item 2, deadline 2026-10-23. The walk of every module on the stick with the APK (`dev.studydesk.stick`) and the remote's key events (`adb shell input keyevent`: D-pad, Select, Back, Menu), against the operator's production desk (`next start` on :3000, main), plus each phone hand-off at 360 px and 414 px in a desktop browser against the same desk. The method is the one in [STICK-APK-WALK-2026-10-20.md](STICK-APK-WALK-2026-10-20.md); the comparison with yesterday is at the end.

Captures are under `artifacts/stick-2026-10-21-walk/` (gitignored): `w*` and `m*` are `adb exec-out screencap` of the stick, `phone-<width>-*` and `writing-<width>-*` are Playwright captures of a phone-sized page. The tools that took them are `tools/stick-walk/`.

## Verdict

**Not ready to demo on three points, none of them in the module screens the stick walked.** Ranked:

1. **BLOCKER B1: the stick cannot reach /writing.** The APK loads `origin/tv` only. A link with another path is accepted and the path thrown away (`Desk.kt` `Address.parse` and `keyOf`, `StickActivity.kt:240` `web.loadUrl(step.desk.tv(...))`). The page itself is a mouse-and-keyboard page (buttons, two textareas) that nothing on the remote can drive. Not fixable inside this change: it needs an APK change and a reinstall on a stick that the perf builder is measuring on, and it is not a one-line change (see "For the next pass"). Writing on the stick today means the desk's `/writing` in a browser on the computer or the phone.
2. **BLOCKER B2 (fixed in the tree, not yet on :3000): /writing showed no heading and no instruction.** `WritingEpisode` set `color: #111` and no background, on the desk's dark body, so "Writing", "Pick a prompt." and the prompt text were invisible at both widths (`writing-360-joined`, `writing-360-coached`). Fixed in `ed4011a2`, with a rules test. The :3000 desk is a built `next start`, so the fix shows only after its next `next build`, which this run was told not to do.
3. **B3, the Math Buddy rows were not walked (closed in "Math Buddy on the stick" below).** About 09:18 (stick clock) the perf builder pointed the stick at its own desk (`127.0.0.1:3128`, over `adb reverse`) and it stayed there to the end of this run (the logcat probe reads `127.0.0.1:3128` for every ten seconds through 10:00 and after). The brief says wait and do not repoint, so the Math Buddy flow, and the Back-out of Essay Master, are scripted in `tools/stick-walk/flow-math.sh`, which refuses to take the stick unless the last probe in logcat says `10.0.0.141:3000`. It waited for about an hour (to about 10:08 stick time, 08:08Z), never ran, and was stopped so it could not press keys unattended after this run. The perf builder's lock note read `exp3` at the end. Captures taken on :3128 (w21 to w28) were thrown away: they were on another desk.

Smaller findings: F1 (the phone's Cancel on a Linga question is a dead button), F2 (the Essay phone panel's radios sit above their labels), F3 (a headless phone shows "Phone joined" on the TV and "No phone is connected" in the caption). Details below.

## Table

Verdicts: PASS, FAIL (wrong but not stopping the demo), BLOCKER (stops it), NOT WALKED (said why). `stick` rows are the remote's keys on the stick. `phone` rows are a browser at the width in the step.

| # | Step | Module | Expected | Observed | Verdict | Capture |
|---|---|---|---|---|---|---|
| 1 | Open the app (stick in focus, paired) | Landing | The TV page on the landing, a learner seated | Landing, Ema seated, Linga lit, "Start as Ema" | PASS | `w00-start` |
| 2 | Right, Right, Right, Up | Landing | The phone stop lit | Essay Master lit, the phone icon is focused | PASS | `w01-landing-phone-stop` |
| 3 | Select on the phone stop | Pairing | The pairing screen with a QR, a four-digit code and the address | "No phone here", QR, code 6540, "open 10.0.0.141:3000/phone", Pair another / Forget every phone | PASS | `w02-pair-screen` |
| 4 | phone 360: open /phone | Pairing | The join page | "Join the desk", a 4-digit field, no sideways scroll (0 px) | PASS | `phone-360-a-lobby` |
| 5 | phone 414: open /phone | Pairing | The same | Same, no sideways scroll | PASS | `phone-414-a-lobby` |
| 6 | phone 360 and 414: type a wrong code (0000) | Pairing | A refusal that says why | "That code is not on the TV." Fits at both widths. The page also says "The TV is on Essay Master" (the session's screen, see "The desk's state after the walk") | PASS | `phone-360-c-wrong-code`, `phone-414-c-wrong-code` |
| 7 | phone 360: type the code from the TV | Pairing | Joins as the seated learner | Joined: "Ema · TV: the paired screen", "On the desk", Recap and More in the bar | PASS | `phone-360-b-joined` |
| 8 | TV after the join | Pairing | The TV says a phone is paired | "Ema's phone is on the desk", "Select: go to the desk" | PASS | `w03-tv-after-join` |
| 9 | Back, Left (stick) | Pairing | Out of the pair screen to the landing | Landing, Math Buddy lit | PASS | `w04-pair-back`, `w05-landing-lit` |
| 10 | Down, Select (Someone else) | Choosing a learner | The learner list | Ema (at the desk now), Jakub, Add a learner; the line says what Enter and Menu do | PASS | `w06-someone-else` |
| 11 | Select on Ema, Right, Select | Choosing a learner, Linga | Ema seated, back on the landing, Linga lit and opened | Landing with Ema, then Linga lit, then Linga home | PASS | `w07-learner-seated`, `w08-linga-lit`, `w09-linga-home` |
| 12 | Menu | Linga | The menu | Back to the scene, Learning map, Choose a situation, My level, My topics, Set up on the phone, Sentence help | PASS | `w10-linga-menu` |
| 13 | Back, Select on Find my level (stick) | Linga | An ask on the TV | "About you, question 1 of 3", the question, "Answer on your phone" | PASS | `w11-linga-find-level-ask` |
| 14 | phone 360 and 414: the same ask | Linga hand-off | The question, a way to answer, a way out | The question, Speak a reply, a reply field, Send reply (greyed until typed), Cancel. No sideways scroll | PASS | `phone-360-linga-ask`, `phone-414-linga-ask` |
| 15 | phone: Cancel on that question | Linga hand-off | The ask is withdrawn | The desk made a new ask with a new id at once (`LingaTV.tsx:57`), so the phone and the TV still show question 1. TV Back (`w13`) leaves it: "You stopped part way. Carry on from where you were." | FAIL (F1) | `w12-linga-after-phone-cancel`, `w13-linga-back-landing` |
| 16 | phone: send a reply | Linga hand-off | The answer moves the TV on | NOT WALKED. It is a model call and writes the real learner's placement on the operator's desk | NOT WALKED | none |
| 17 | Back, Back (stick) | Linga | Out to the landing | Landing | PASS | `w15-linga-back-again` |
| 18 | Right, Select; Down (stick) | Essay Master | Lens home, the lit lens moves | Four lenses, "Phone joined", Structure first, then Argument lit | PASS | `w16-essay-lit`, `w17-essay-home`, `w18-essay-lens-down` |
| 19 | Select on Argument (stick) | Essay Master | An ask for the paragraph | Argument lit with an arrow, "On your phone" in the bar | PASS | `w19-essay-ask` |
| 20 | phone 360 and 414: the same ask | Essay hand-off | The paragraph panel | "Your paragraph", file, text, kind, Dictate, Analyse on the TV, Your shelf, Cancel, Read this. No sideways scroll. The radios (Message, Email, Essay) sit above their labels (F2) | PASS (F2) | `phone-360-essay-ask`, `phone-414-essay-ask` |
| 21 | phone 360: type a paragraph, Analyse on the TV | Essay hand-off | The paragraph is read | A one-time notice first: "To read your writing, the desk sends it to its text engine: Claude ...", I understand, read it / Not now. The TV says "Not read yet. Open the Essay tab on your phone and read the text notice first, then press OK on Read it again." | PASS (the notice) | `phone-360-essay-sent`, `w20-essay-reading` |
| 22 | phone: accept the notice, read, the lenses fill | Essay Master | A reading on the TV | NOT WALKED. Accepting is the operator's consent, recorded on the operator's desk, and the read is a model call. Stopped at the notice | NOT WALKED | none |
| 23 | phone 360: Cancel on the essay panel | Essay hand-off | The ask is withdrawn | `ask` null, the desk's session unchanged otherwise (cleanup, see below) | PASS | `phone-360-essay-cancelled` |
| 24 | Back out of Essay Master (stick) | Essay Master | Cancels the ask, then leaves | Walked at 17:2x on :3000: Argument, Select opened the paragraph ask (`ask` kind `paragraph`); Back 1 cancelled it (`ask` null, screen `essaytype`); Back 2 reached the landing; Back 3 stayed on it | PASS | `e02-essay-home`, `e03-essay-ask`, `e04-back1`, `e05-back2`, `e06-back3` |
| 25 | Math Buddy: I have homework (photo ask), Teach me something, Get ready for school (stick, :3000) | Math Buddy | Every card opens and Back leaves it | Landing is now Math Buddy, Linga, Essay Master, Writing, so Math Buddy is Left of Linga (the old `Left Left` did not apply). Home shows three cards, Select on the lit one opens the ask ("Waiting for the photo", "No phone is connected. Up: pair a phone. Back: cancel."), Back cancels it. Teach me opens "Pick a topic" and Get ready for school "What is school doing?"; both readable, Back returns to the Math home each time. With a phone paired the ask is `kind page`, `awaiting maths`. Cosmetic: after Back the lit card is the one opened only for homework (M2) | PASS (M1, M2) | `m00-landing`, `m01a-math-open`, `m02a-homework-nophone`, `m03a-ask-cancelled`, `m04-teach-me`, `m05-after-teach-back`, `m06-prepare`, `m07-prepare-back`, `m11-math-home`, `m12-homework-ask-phone` |
| 26 | phone 360 and 414: the paper ask | Math hand-off | The photo panel, a way to cancel | "Ema · TV: Math Buddy", a viewfinder area, Cancel and Snap in the bottom bar. Overflow 0 px at both widths. The headless browser has no camera, so the viewfinder is blank grey and Snap is greyed: a real phone camera was not exercised. Cancel on the phone cleared the ask (`ask` null, `awaiting` still `maths`: the TV caption reads "Waiting for the Math Buddy page. Snap it on the phone — it appears here." until one Back, M1). Nothing was snapped or saved | PASS (camera not walked) | `phone-360-math-ask`, `phone-414-math-ask`, `phone-360-math-cancelled`, `m13-after-phone-cancel`, `m14-back-after-cancel` |
| 27 | Writing: the Writing tile | Writing | None yet (the brief) | There is no tile, as briefed | PASS (as briefed) | none |
| 28 | Writing: the stick reaches /writing | Writing | A way in with the remote | The APK loads /tv only; a link with `/writing` opens /tv. The page cannot be driven by the remote (B1) | BLOCKER (B1) | none |
| 29 | phone 360 and 414: /writing, pick a prompt | Writing | The prompt list | The three prompts show; no sideways scroll; **the heading and "Pick a prompt." cannot be read** (dark on dark, B2) | BLOCKER (B2, fixed in the tree) | `writing-360-joined`, `writing-414-joined` |
| 30 | phone 360 and 414: choose Screens before bed, type a paragraph | Writing | The write screen | The textarea and "Get one note" show; the prompt text is unreadable (B2) | BLOCKER (B2) | `writing-360-write`, `writing-414-write` |
| 31 | phone 360: Get one note (one claude call) | Writing | One note that shows the way and does not write the sentence | "Your reasons, "bright" and "fun," describe how screens feel, but nothing in them can be checked. What could a reader verify ...?" A question, no model sentence. "Revise your paragraph once" is unreadable (B2). Finish was not pressed: it would save a record for the real learner | PASS (note), BLOCKER (B2 text) | `writing-360-coached` |
| 32 | Writing on the stick: Back to the landing, Right to the end of the shelf (stick, :3000) | Writing | A Writing tile after the three apps, its own caption | Math Buddy, Linga, Essay Master, **Writing** lit: "Not started. Write one paragraph on your phone and get one coaching note on the TV." Start as Ema. B1 is closed on the landing. Empty world under the title, as built | PASS | `wr01-landing`, `wr04-right3` |
| 33 | Select on Writing (stick) | Writing | The prompt list for the learner's band | "Pick a prompt": Screens before bed, School uniform, Cars in the city centre; the lit one's task under it; no focus lost | PASS | `wr05-prompt-list` |
| 34 | Down, Select (stick) | Writing | The chosen prompt, progress, two actions | School uniform: the task, Write / Coached / Revised and saved, "Write it on your phone" lit, "Another prompt" | PASS | `wr06-list-down`, `wr07-chosen` |
| 35 | Up, Select with no phone joined (stick) | Writing | An ask opens and says why nothing happens | The ask opened ("The phone has it now."); the caption says "No phone is connected. Pair one from the desk. Back cancels." | PASS | `wr08-handoff-open` |
| 36 | Back, Back (stick) | Writing | Cancel the ask, then the landing on Writing | Ask gone (`ask` null), landing with Writing lit and "Left mid-way: School uniform. Picked. Your paragraph is next." | PASS | `wr09-handoff-cancelled`, `wr10-landing-writing-lit` |
| 37 | Pair a headless phone (code from the pair screen), Back, Right x3, Select, Select | Writing, Pairing | The same episode, the `writing` ask open for the phone | Joined ("Ema · TV: the paired screen"); the episode resumed at School uniform; session `screen: writing`, ask kind `writing` open | PASS | `wr11-pair-screen`, `phone-360-b-joined`, `wr16-resume-chosen`, `wr17-handoff-phone-joined` |
| 38 | phone 360 and 414: the write panel | Writing hand-off | The prompt, one text box, a Send, a way out | "Ema · TV: Writing", SCHOOL UNIFORM, the task, a text box, "At least two sentences. The TV shows one note about it.", SEND PARAGRAPH, Cancel in the bar. Overflow 0 px at both widths. Readable (B2's dark-on-dark is not here) | PASS | `wr-phone-360-panel`, `wr-phone-360-typed`, `wr-phone-414-panel`, `wr-phone-414-typed` |
| 39 | phone: Send paragraph (the coach call) | Writing hand-off | One note on the TV; the save on Revise | NOT WALKED. Stopped before Send on the operator's :3000 so nothing reaches Ema's record. The note and the save are covered by `tools/writing-tv-test.cjs` and the 2026-10-21 dev-server captures | NOT WALKED | none |
| 40 | Back, Back (stick) | Writing | Cancel the ask, then the landing | `ask` null, then the landing on Writing | PASS | `wr19-ask-cancelled`, `wr20-back-landing` |
| 41 | Select, Down, Select, Back (stick): Another prompt | Writing | The episode is cleared | The list, then the landing: "Not started" again, as before the walk | PASS | `wr21-another-prompt-list`, `wr22-landing-after-clear` |
| 42 | Up, Select, Right, Select (stick): Forget every phone | Pairing | The phone is forgotten | "No phone here", a fresh code; Back to the landing; `phonesLive` 0 | PASS | `wr23-forget-focus`, `wr24-after-forget`, `wr25-landing-end` |

## Findings

**B1. The stick cannot reach /writing.** `StickActivity` loads `Desk.tv()` only. `Address.parse` takes a whole link but `keyOf` only reads the key of a /tv link and drops any other path, so `adb ... --es url "'http://10.0.0.141:3000/writing'"` opens /tv. The page is also not remote-ready: `WritingEpisode.tsx` is two textareas and plain buttons with no key handling, and `KeyBridge` sends a synthetic `keydown` that moves no browser focus. A usable path needs three pieces: the APK keeps a path from `{/tv, /writing}`, the page takes Arrow keys to move between its buttons and Enter to press, and text goes in on the phone (the page's own two textareas want a keyboard). It needs a rebuilt and reinstalled APK. I did not build it: the stick is shared with the perf builder and a reinstall restarts the app, and I could not test it on the device in this run.

**B2. The /writing page is unreadable.** Fixed (`ed4011a2`): the page now paints `#f7f7f5` under `#111` text, inside a 720 px column. `tools/writing-rules-test.cjs` has a test that a page that sets its own text colour sets its own ground. It is not on :3000 until that desk is rebuilt.

**B3. The stick left the production desk.** Not a defect in the product: the perf builder pointed it at its desk over `adb reverse` on 3128. It is recorded here because it cost the Math Buddy rows, and because the earlier captures of this run (w00 to w20) were taken on :3000 before it left, which logcat shows (`probe 10.0.0.141:3000` until 09:15:10, `probe 127.0.0.1:3128` from 09:18:08). Keys pressed on :3128 between 09:19 and 09:25 were mine (rows 24 and 25's first attempt; I held the lock for them but had not yet checked where the stick was). They went to the perf builder's desk, not the operator's. `tools/stick-walk/lib.sh` now checks.

**F1. The phone's Cancel on a Linga question does nothing.** `LingaPhone.tsx:32` `close()` posts `ask.cancel`; `LingaTV.tsx:46` and `:57` post a fresh reply ask while the screen wants an answer, so the question comes straight back with a new id. On the TV, Back or "Stop for now" is the way out. For a learner it reads as a button that does not work. Lives in `desk/src/english/`, the perf builder's paths.

**F2. The Essay paragraph panel's radios** (Message, Email, Essay) sit above their text at 360 and 414 (`phone-360-essay-ask`). Cosmetic. The file is `desk/src/app/phone/page.tsx` (in my paths; not changed here to keep the diff to the blockers).

**F3. The TV says a phone is joined and also that none is connected** when the phone's page is not open (`w19-essay-ask`: "Phone joined" and "No phone is connected. Back: cancel."). This was my short-lived headless page (`phonesLive` 0), but a real phone with its screen off reads the same. Source: the caption text and the badge disagree on what "connected" means.

## The desk's state after the walk

- **A phone is now listed on the operator's desk** (the headless browser that joined with code 6540). The pairing screen read "No phone here" before. To undo: Select the phone stop on the TV, then "Forget every phone".
- **Ema's session screen is `essaytype`** (the stick left on :3000 will show the Essay lens screen); the open ask was cancelled from the phone. One Back from the TV leaves it.
- A Linga "Find my level" mission is now "stopped part way, carry on" (0 of 3 answered), because I opened it and left. The TV offers "Start again" on that screen (`w13-linga-back-landing`).
- No replies, no kept pieces, no finished writing episode, no accepted notice. The Writing coach ran once (a claude call) and saved nothing.
- Nothing under `desk/data/` was read or written by hand.

## Against yesterday's walk

Yesterday's [stick walk](STICK-APK-WALK-2026-10-20.md) found every key reaches every screen through the APK and covered Back, Menu and Play/Pause; none of that was repeated here beyond Select, Back, Menu and the D-pad on the screens above. What is new today: the real desk (not a tunnel), the phone side at two widths, and Writing. The pairing, learner, Linga and Essay paths pass as they did.

## For the next pass

- **Perf builder's paths** (not edited): `desk/src/english/LingaTV.tsx:46`, `:57` and `desk/src/english/LingaPhone.tsx:32` (F1). Decide whether the phone's Cancel on a question should mean "stop for now".
- **Math Buddy on the stick.** Run `bash tools/stick-walk/flow-math.sh` once the stick is back on :3000 and nobody holds `firetv-stick.lock`. It captures `m00` to `m07` and the phone's paper panel at 360 and 414.
- **Writing on the stick** (B1): the APK path list, key handling on `/writing`, and a rebuilt APK; or keep Writing a computer or phone page for the demo.
- **Rebuild :3000** (operator): B2's fix reaches the desk only on `next build`.
- **The consent** for the Essay read (step 22) is the operator's one tap on the phone.

## Writing on the stick (17:xx)

Run by a headless builder at about 17:04 to 17:10 stick time, rows 32 to 42. The walk was against the operator's :3000 desk, not a temp desk.

- **Which desk.** The :3000 `next start` already serves the Writing stop. `.next/BUILD_ID` is dated 15:30 today, the `/tv` page's chunks contain `case"writing"` and "Write it on your phone" (GET only, no key), and the stick showed the tile. So there was no finding to record about a stale build and no temp desk was needed.
- **B1 is closed on the device**, as far as the walk goes: landing, Writing, the prompt list, a chosen prompt, the hand-off opened and cancelled, and Back out, all with the remote's keys on the unchanged APK (`StickActivity` still loads /tv). The phone panel reads at 360 and 414 px with no sideways scroll. **What B1 did not get on the device:** the Send, the note on the TV, the revise and the save (row 39). Those are a model call and a write to the real learner's record, so they stop here on :3000. B2's fix is also in this build: the panel text reads.
- **No fix was needed.** Nothing stopped landing -> Writing -> hand-off -> Back, so no file in `desk/src/` was touched.
- **Findings (cosmetic, not fixed; the Writing look waits until after 10-23).**
  - **W1.** With a phone joined, the TV's caption on the hand-off still says "No phone is connected. Pair one from the desk." (`wr17`). The headless page had closed, so `phonesLive` was 0 (the same disagreement as F3). A real phone with its page open should read connected; this walk did not have one.
  - **W2.** The headless phone panel was walked after the TV ask opened with no phone (row 35) and then re-opened; a phone joined while an ask is open was not tried.
  - **W3.** Back from the pair screen puts the lamp on Linga, not where the learner came from (`wr13`). Minor.
  - **W4.** The Writing landing tile shows the empty world under the title (as built, a Writing world is a follow-up).
- **The desk's state after this walk.**
  - **:3000** is on the landing, Ema seated, no ask, no phone listed (Forgot every phone), Writing "Not started" (the episode was cleared with Another prompt). Before the walk the session screen was `essaytype` (the earlier walk's); one Back took it to the landing, so that is now the landing.
  - **Not changed:** no model call, no Send, no finished episode, no record written, nothing under `desk/data/`.
  - **The stick** is on `10.0.0.141:3000` with `dev.studydesk.stick` in focus (`wr-restore-probe.txt`: probe `10.0.0.141:3000: Answered(viewer=tv)` at 17:09:52, `mCurrentFocus=...dev.studydesk.stick/.StickActivity`). The lock was released.
- **Tools.** `tools/stick-walk/flow-writing.sh` records the key sequence in order (it was run step by step, not as one script, and is not re-run end to end) and `tools/stick-walk/writing-panel.cjs` takes the two panel captures without pressing Send.

## Math Buddy on the stick (17:2x)

Run by a headless builder against the operator's :3000 desk, stick 10.0.0.139 on `10.0.0.141:3000` throughout (logcat probe), lock taken at the start and released at the end. Rows 24 to 26 above.

- **B3 is closed.** Math Buddy home, the homework photo ask (opened and cancelled from both the remote and a phone), Teach me something, Get ready for school and the Back-out of Essay Master all walk with the remote on the unchanged APK. The paper panel fits at 360 and 414 px with no sideways scroll and can be cancelled. **Still open on the device:** the camera itself (a headless browser has none), Snap, the read of a photo and any hint: those are model calls and write the real learner's record, so they stop here.
- **No fix was needed.** No blocker, no file under `desk/src/` touched.
- **Findings (cosmetic, not fixed).**
  - **M1.** Cancelling the paper ask from the phone leaves the TV on "Waiting for the Math Buddy page. Snap it on the phone — it appears here." with no ask open (`awaiting` stays `maths`). One remote Back clears it; Select reopens the ask.
  - **M2.** Back from Teach me something or Get ready for school lands on "I have homework" lit, not the card the learner came from (`m05`, `m07` shows Get ready lit, so only Teach me resets).
  - **M3.** With a phone joined but its page closed (headless), the TV still reads "No phone is connected" (same as F3 and W1).
  - **M4.** Teach me something opens "Pick a topic" with the last topic (Probability of an event) lit and the ruler scrolled to the end, not the first.
- **The desk's state after this walk.** :3000 is on the landing, Ema seated, no ask, `phonesLive` 0, no phone listed (Forgot every phone, `f01-after-forget`, new code 5216). No model call, no Snap, nothing under `desk/data/` touched by hand. Math Buddy's `awaiting` is cleared.
- **The stick** is on `10.0.0.141:3000` with `dev.studydesk.stick/.StickActivity` in focus (`m-restore-probe.txt`: probe `10.0.0.141:3000: Answered(viewer=tv)` at 17:29:39, `mCurrentFocus=Window{9c459e6 u0 dev.studydesk.stick/dev.studydesk.stick.StickActivity}`). The lock directory is gone. No `adb reverse` was used.
- **Tools.** `tools/stick-walk/flow-math.sh` now holds the order that was walked (Left from Linga to Math, not `Left Left`). It was run step by step, not as one script.
