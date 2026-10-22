# Stick release-candidate walk (2026-10-22)

The walk of every module on the real Fire TV stick (`dev.studydesk.stick`, adb 10.0.0.139) with the remote's key events, plus each phone hand-off at 360 px and 414 px in a desktop browser against the same desk. Method, tools and table format are those of [STICK-DEADLINE-WALK-2026-10-21.md](STICK-DEADLINE-WALK-2026-10-21.md). The point: main carries the 202-commit overnight sweep, which was never walked on the stick.

Captures are under `artifacts/stick-2026-10-22-rc/` (gitignored): `w*`, `m*`, `e*`, `wr*`, `f*` are `adb exec-out screencap` of the stick, `phone-*` and `writing-*` are Playwright captures. `x*`, `y*`, `z*` are the Writing re-walk (see W5).

## Verdict

**GREEN for the push.** Every module row walks with the remote, no screen crashed, no step was unreachable, no key stopped working, and no row that was PASS on 10-21 fails today. No file in `desk/` was changed, so there is no blocker fix and no `tools/rc-blockers-test.cjs` (a suite with no fix to pin would be empty).

- **Served build.** At the start :3000 served a build from 2026-10-21 17:22 (`.next/BUILD_ID`), 216 commits behind main. It was rebuilt (`next build` in the main checkout's `desk/`, 45 s, no errors) and restarted (`next start -H 0.0.0.0 -p 3000`) at `a39fab1a`. Main moved once during the walk, to `8d3de7d8` (08:11, `docs/devpost` only; `git diff a39fab1a HEAD -- desk` is empty), so :3000 serves the code of main HEAD. BUILD_ID `l-W5SRvVur4bGCYBTjmDV`.
- **Stick.** The APK was already on `10.0.0.141:3000` (logcat `probe 10.0.0.141:3000: Answered(viewer=tv)` before and after the walk; nothing used `adb reverse`).
- **Gates not in this walk's scope.** The Director's AM verify had no node/tsc gate processes left from the main checkout when the walk began (08:09).

## Table

Verdicts as on 10-21. `stick` rows are the remote's keys; `phone` rows are a browser at the width in the step. Row numbers follow 10-21 where there is a counterpart.

| # | Step | Module | Expected | Observed | Verdict | 10-21 | Capture |
|---|---|---|---|---|---|---|---|
| 1 | Open the app (stick in focus), Back x3 | Landing | The landing, a learner seated | Landing, Ema seated, Linga lit, "Continue as Ema" | PASS | PASS | `w00-start` |
| 2 | Right x3, Up (stick) | Landing | Move across the shelf, to the phone stop | Writing is lit at the end of the shelf; Select then opens the pair screen | PASS | PASS | `w01-landing-phone-stop` |
| 3 | Select on the phone stop | Pairing | QR, four-digit code, address | "No phone here", QR, code 5216, `10.0.0.141:3000/phone`, Pair another / Forget every phone | PASS | PASS | `w02-pair-screen` |
| 4 | phone 360: /phone, type the code from the TV | Pairing | Joins as the seated learner | "Ema · TV: the paired screen", "On the desk", Recap and More; overflow 0 px | PASS | PASS | `phone-360-a-lobby`, `phone-360-b-joined` |
| 5 | phone 414: /phone (the code was already used) | Pairing | The join page; a used code is refused | Join page, no sideways scroll; "That code is not on the TV." for the spent code | PASS | PASS | `phone-414-a-lobby`, `phone-414-b-joined` |
| 6 | TV after the join | Pairing | The TV says a phone is paired | "Ema's phone is on the desk", "Select: go to the desk" | PASS | PASS | `w03-tv-after-join` |
| 7 | Back, Left, Right, Left x2 (stick) | Landing | Switch between modules, lamp follows | Math Buddy lit with its caption "Not started"; Linga lit again; each tile's own scene and colour | PASS | PASS | `w04-pair-back`, `w05-landing-left`, `w06-landing-math` |
| 8 | Select on Linga | Linga | Linga home | "Find your level", "You stopped part way. Carry on from where you were.", Carry on / Start again | PASS | PASS | `w09-linga-home` |
| 9 | Menu | Linga | The menu | Back to the scene, Learning map, Choose a situation, My level, My topics, Set up on the phone, Sentence help | PASS | PASS | `w10-linga-menu` |
| 10 | Down x3, Select on My level (the "Find my level" ask) | Linga | An ask on the TV | "About you, question 1 of 3", the question, "Answer on your phone", Hear it again / Stop for now; session ask `reply` open | PASS | PASS | `w11-my-level` |
| 11 | phone 360 and 414: the same ask | Linga hand-off | The question, a way to answer, a way out | The question, Speak a reply, a reply field, Send reply, Cancel. Overflow 0 px at both widths | PASS | PASS | `phone-360-linga-ask`, `phone-414-linga-ask` |
| 12 | phone: Send a reply | Linga hand-off | The answer moves the TV on | NOT WALKED. A model call that writes the real learner's placement on the operator's desk | NOT WALKED | NOT WALKED | none |
| 13 | Back, Back (stick) | Linga | Out to the landing | Landing | PASS | PASS | `w15-back-landing` |
| 14 | Left, Select (stick) | Math Buddy | Math home with three cards | "School maths, from the first step": I have homework (lit), Teach me something, Get ready for school, the ruler | PASS | PASS | `m01-math-open` |
| 15 | Select on I have homework, no phone | Math Buddy | The photo ask, says why nothing happens | "Waiting for the photo", "No phone is connected. Up: pair a phone. Back: cancel."; ask `page`, `awaiting maths`. Back cancels (`ask` null, `awaiting` null) | PASS | PASS | `m02-homework-ask`, `m03-ask-cancelled` |
| 16 | Right, Select; Back (stick): Teach me something | Math Buddy | A topic list; Back returns | "Pick a topic" on the ruler, readable; Back to the Math home (M4: last topic lit, as on 10-21) | PASS (M4) | PASS | `m04-teach-me`, `m05-after-teach-back` |
| 17 | Right x2, Select; Back (stick): Get ready for school | Math Buddy | "What is school doing?"; Back returns | Topic cards for the year's path, Probability of an event lit; Back to the Math home | PASS | PASS | `m06-prepare`, `m07-prepare-back` |
| 18 | phone 360 and 414: the paper ask | Math hand-off | The photo panel, a way to cancel | "Ema · TV: Math Buddy", Cancel and Snap. Overflow 0 px at both widths. A headless browser has no camera: the viewfinder was not exercised and Snap was not pressed | PASS (camera not walked) | PASS | `phone-360-math-ask`, `phone-414-math-ask`, `m12-homework-ask-phone` |
| 19 | phone 360: Cancel on the paper ask | Math hand-off | The ask is withdrawn | `ask` null; `awaiting` stays `maths` until one TV Back (M1, as on 10-21) | PASS (M1) | PASS | `phone-360-math-cancelled` |
| 20 | Back x3, Right, Select (stick) | Essay Master | Lens home | Four lenses (Structure, Argument, Evidence, Language) all "Not read", "Phone joined" | PASS | PASS | `e00-landing`, `e02-essay-home` |
| 21 | Down, Select on Argument (stick) | Essay Master | An ask for the paragraph | Argument lit with an arrow; "On your phone" in the bar; ask `paragraph` open; caption "No phone is connected. Back: cancel." (F3, as on 10-21) | PASS (F3) | PASS | `e02b-lens-down`, `e03-essay-ask` |
| 22 | phone 360 and 414: the same ask | Essay hand-off | The paragraph panel | "Your paragraph", file, text, kind, Dictate, Analyse on the TV, Your shelf, Forget tonight's paragraph, Cancel, Read this. Overflow 0 px | PASS | PASS | `phone-360-essay-ask`, `phone-414-essay-ask` |
| 23 | phone: type a paragraph, Analyse on the TV; accept the notice; read | Essay Master | A reading on the TV | NOT WALKED. The read is a model call and accepting the notice is the operator's consent, recorded on the operator's desk | NOT WALKED | NOT WALKED | none |
| 24 | Back, Back, Back (stick) | Essay Master | Cancel the ask, then leave, then stay | Back 1: `ask` null on the lens screen; Back 2: landing; Back 3: stays on the landing | PASS | PASS | `e04-back1`, `e05-back2`, `e06-back3` |
| 25 | Right x2, Select (stick) | Writing | The prompt list for the learner's band | "Pick a prompt": Screens before bed, School uniform, Cars in the city centre; the lit one's task under it | PASS | PASS | `wr04-writing-lit`, `wr05-prompt-list`, `y2-list` |
| 26 | Down, Select (stick) | Writing | The chosen prompt, progress, two actions | School uniform: the task, Write / Coached / Revised and saved, "Write it on your phone" lit, "Another prompt" (see W5 for a swallowed Select) | PASS (W5) | PASS | `z1`, `z2-after-pick` |
| 27 | Select on "Write it on your phone" | Writing | The hand-off opens | `writing` ask open (`phase: open`) | PASS | PASS | `wr17-handoff-open` |
| 28 | phone 360 and 414: the write panel | Writing hand-off | The prompt, one text box, a Send, a way out | "Ema · TV: Writing", SCHOOL UNIFORM, the task, a text box, "At least two sentences. The TV shows one note about it.", SEND PARAGRAPH, Cancel. Overflow 0 px at both widths | PASS | PASS | `wr-phone-360-panel`, `wr-phone-414-panel` |
| 29 | phone: Send paragraph (the coach call) | Writing hand-off | One note on the TV; the save on Revise | NOT WALKED. A model call that saves a record for the real learner | NOT WALKED | NOT WALKED | none |
| 30 | Back, Back (stick) | Writing | Cancel the ask, then the landing | `ask` null, then landing | PASS | PASS | `wr20-landing` |
| 31 | Right x2, Select, Down, Select, Back (stick): Another prompt | Writing | The episode is cleared | Landing on Writing, "Not started. Write one paragraph on your phone and get one coaching note on the TV." | PASS | PASS | `wr22-landing-after-clear` |
| 32 | Up, Select, Right, Select (stick): Forget every phone | Pairing | The phone is forgotten, a fresh code | Pair screen "No phone here", code 5216 became 8148; `phonesLive` 0; Back to the landing | PASS | PASS | `f01-after-forget`, `f02-landing` |

## Regressions against 10-21

**None.** Every row that was PASS on 10-21 is PASS today, and the NOT WALKED rows are the same three for the same reasons (a Linga reply, the Essay read, the Writing Send: each a model call that writes the real learner's record). The Writing tile and the Writing episode, new on 10-21 evening, survive the sweep. Math Buddy, which was blocked from the device on the morning of 10-21 (B3) and then walked, walks the same.

## Findings (none fixed: none is a blocker, and the film is cut)

- **Previous findings still true, unchanged:** M1 (a phone Cancel on the paper ask leaves `awaiting maths` until one TV Back), M4 (Teach me opens on the last topic), F3/W1/M3 (the TV badge says "Phone joined" while its caption says "No phone is connected" when a phone's page is not open: here the headless phone page was closed, `phonesLive` 0).
- **W5 (new, not reproduced).** First pass of Writing: Select, Down, Select, captured after about 1.3 s, showed the list still on School uniform lit (no episode); a following Up and Select then chose Screens before bed instead. The same key sequence run again with a 3 s wait chose School uniform correctly (`z2-after-pick`). Logcat shows each key `taken=true`. A first Select swallowed or a slow render on the stick; not a stuck screen and not repeatable, so not chased.
- **Landing lamp.** Back to the landing from any module puts the lamp on Linga, not the module just left (as W3 on 10-21), so a walk that counts Rights must look first. Once this walk pressed Select, Down, Select on Linga's home (Carry on / Start again) by mistake and pressed "Start again" on a mission already at 0 of 3: no answer was lost.

## The desk's state after the walk

- **:3000** runs `next start` on main HEAD's code (`desk/.next` rebuilt from the main checkout), landing, Ema seated, no ask, no Math `awaiting`, no phone listed (Forgot every phone, new code 8148), Writing "Not started". Linga is at "stopped part way / Carry on" for the Find-your-level mission, as before the walk.
- **The stick** is on `10.0.0.141:3000` with `dev.studydesk.stick/.StickActivity` in focus (`rc-restore-probe.txt`: probe `10.0.0.141:3000: Answered(viewer=tv)` at 08:26:17). The lock directory is released.
- No model call, no Snap, no Send, no accepted notice, nothing under `desk/data/` touched by hand. No `adb reverse`.
