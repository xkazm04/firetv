# Stick deadline-readiness walk (2026-10-21)

Standup item 2, deadline 2026-10-23. The walk of every module on the stick with the APK (`dev.studydesk.stick`) and the remote's key events (`adb shell input keyevent`: D-pad, Select, Back, Menu), against the operator's production desk (`next start` on :3000, main), plus each phone hand-off at 360 px and 414 px in a desktop browser against the same desk. The method is the one in [STICK-APK-WALK-2026-10-20.md](STICK-APK-WALK-2026-10-20.md); the comparison with yesterday is at the end.

Captures are under `artifacts/stick-2026-10-21-walk/` (gitignored): `w*` and `m*` are `adb exec-out screencap` of the stick, `phone-<width>-*` and `writing-<width>-*` are Playwright captures of a phone-sized page. The tools that took them are `tools/stick-walk/`.

## Verdict

**Not ready to demo on three points, none of them in the module screens the stick walked.** Ranked:

1. **BLOCKER B1: the stick cannot reach /writing.** The APK loads `origin/tv` only. A link with another path is accepted and the path thrown away (`Desk.kt` `Address.parse` and `keyOf`, `StickActivity.kt:240` `web.loadUrl(step.desk.tv(...))`). The page itself is a mouse-and-keyboard page (buttons, two textareas) that nothing on the remote can drive. Not fixable inside this change: it needs an APK change and a reinstall on a stick that the perf builder is measuring on, and it is not a one-line change (see "For the next pass"). Writing on the stick today means the desk's `/writing` in a browser on the computer or the phone.
2. **BLOCKER B2 (fixed in the tree, not yet on :3000): /writing showed no heading and no instruction.** `WritingEpisode` set `color: #111` and no background, on the desk's dark body, so "Writing", "Pick a prompt." and the prompt text were invisible at both widths (`writing-360-joined`, `writing-360-coached`). Fixed in `ed4011a2`, with a rules test. The :3000 desk is a built `next start`, so the fix shows only after its next `next build`, which this run was told not to do.
3. **B3, the Math Buddy rows are not walked.** About 09:18 (stick clock) the perf builder pointed the stick at its own desk (`127.0.0.1:3128`, over `adb reverse`) and it stayed there to the end of this run (the logcat probe reads `127.0.0.1:3128` for every ten seconds through 10:00 and after). The brief says wait and do not repoint, so the Math Buddy flow, and the Back-out of Essay Master, are scripted in `tools/stick-walk/flow-math.sh`, which refuses to take the stick unless the last probe in logcat says `10.0.0.141:3000`. It waited for about an hour (to about 10:08 stick time, 08:08Z), never ran, and was stopped so it could not press keys unattended after this run. The perf builder's lock note read `exp3` at the end. Captures taken on :3128 (w21 to w28) were thrown away: they were on another desk.

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
| 24 | Back out of Essay Master (stick) | Essay Master | Cancels the ask, then leaves | The Backs went to :3128, not :3000 (the stick had left at 09:18, B3). The :3000 desk's Essay ask was cancelled from the phone instead (row 23) | NOT WALKED | none |
| 25 | Math Buddy: Tonight, I have homework, the photo ask and the paper panel, Teach me something, Get ready for school | Math Buddy | As in the 2026-10-20 walk | NOT WALKED on the stick: it was on :3128 from 09:18 (B3). The flow is in `tools/stick-walk/flow-math.sh` and was never run | NOT WALKED | none |
| 26 | phone 360 and 414: the paper ask | Math hand-off | The photo panel | NOT WALKED, same reason | NOT WALKED | none |
| 27 | Writing: the Writing tile | Writing | None yet (the brief) | There is no tile, as briefed | PASS (as briefed) | none |
| 28 | Writing: the stick reaches /writing | Writing | A way in with the remote | The APK loads /tv only; a link with `/writing` opens /tv. The page cannot be driven by the remote (B1) | BLOCKER (B1) | none |
| 29 | phone 360 and 414: /writing, pick a prompt | Writing | The prompt list | The three prompts show; no sideways scroll; **the heading and "Pick a prompt." cannot be read** (dark on dark, B2) | BLOCKER (B2, fixed in the tree) | `writing-360-joined`, `writing-414-joined` |
| 30 | phone 360 and 414: choose Screens before bed, type a paragraph | Writing | The write screen | The textarea and "Get one note" show; the prompt text is unreadable (B2) | BLOCKER (B2) | `writing-360-write`, `writing-414-write` |
| 31 | phone 360: Get one note (one claude call) | Writing | One note that shows the way and does not write the sentence | "Your reasons, "bright" and "fun," describe how screens feel, but nothing in them can be checked. What could a reader verify ...?" A question, no model sentence. "Revise your paragraph once" is unreadable (B2). Finish was not pressed: it would save a record for the real learner | PASS (note), BLOCKER (B2 text) | `writing-360-coached` |

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
