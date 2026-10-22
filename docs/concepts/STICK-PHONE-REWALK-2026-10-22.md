# Stick phone hand-off re-walk (2026-10-22)

The short re-walk of the phone hand-offs on the real Fire TV stick (`dev.studydesk.stick`, adb 10.0.0.139), after the [RC walk](STICK-RC-WALK-2026-10-22.md) (GREEN, :3000 at `a39fab1a`). Six desk files changed since it: `api/memory`, `api/practice`, `api/session/retry`, `api/worked`, `api/writing/coach` and `app/phone/page.tsx` (craft-1 put worked and memory behind the ask door and moved the coach's 400 to a 409; `ed15e129` and `cf0d1c1e` let a phone retry only its own failed practice job, naming `jobId`). Method and table format are the RC walk's. Captures are under `artifacts/stick-2026-10-22-rewalk/` (gitignored): `r*` are `adb exec-out screencap` of the stick, `phone-*` are Playwright captures, `doors-*.txt` are the door probes, `jobs-rules.txt` is the suite run.

## Verdict

**GREEN for the push.** Every row walks or is NOT WALKED for the RC walk's reason, no row that was PASS in the RC walk fails, no desk file was changed (so no blocker fix and no `tools/rc-blockers-test.cjs`), and the Android build check is green for `stick-app`. One brief expectation did not match the code (see "Findings", W-A), and `tv-app` was not built because its prerequisite is absent.

- **Commit :3000 served.** `cf0d1c1e` (main HEAD, equal to this branch's base). `desk/src` of the main checkout was byte-identical to this worktree's (`diff -rq`) before the build. At the start :3000 served BUILD_ID `l-W5SRvVur4bGCYBTjmDV` (the RC build, `a39fab1a`, 08:10). `next build` in the main checkout's `desk/` made BUILD_ID `f9HDwdQPbtJFjZZdgAvcx` (09:35); the old `next start` (pid 47620) was stopped and `next start -H 0.0.0.0 -p 3000` restarted. `desk/data/` untouched.
- **Stick.** Already on `10.0.0.141:3000`: logcat `probe 10.0.0.141:3000: Answered(viewer=tv)` before the rebuild and at 09:36:00 after it. No `adb reverse`; the stick lock was held for the run and released.

## Table

`stick` rows are the remote's keys; `phone` rows are a browser at the width in the step with the cookie from the join.

| # | Step | Module | Expected | Observed | Verdict | RC walk | Capture |
|---|---|---|---|---|---|---|---|
| 1 | Back x3, Right x3, Up, Select (stick) | Pairing | The pair screen: QR, code, address | "No phone here", QR, code 8148, `10.0.0.141:3000/phone`, Pair another / Forget every phone | PASS | PASS (3) | `r02-pair-screen` |
| 2 | phone 360: /phone, type the code | Pairing | Joins as the seated learner | "Ema · TV: the paired screen", "On the desk", Recap, More; overflow 0 px | PASS | PASS (4) | `phone-360-a-lobby`, `phone-360-b-joined` |
| 3 | phone 414: /phone (code spent) | Pairing | The join page, no sideways scroll | "Not joined", Show the code on the TV, Join; overflow 0 px | PASS | PASS (5) | `phone-414-a-lobby` |
| 4 | Back, Select, Menu, Down x3, Select (stick): My level | Linga | The "Find my level" ask | "About you, question 1 of 3", "Answer on your phone"; session ask `reply` open on `linga-check` | PASS | PASS (10) | `r05`, `r06`, `r07-my-level` |
| 5 | phone 360 and 414: the same ask | Linga hand-off | Question, Speak a reply, reply field, Send reply, Cancel | All present; overflow 0 px at both widths | PASS | PASS (11) | `phone-360-linga-ask`, `phone-414-linga-ask` |
| 6 | phone: Send a reply | Linga hand-off | The answer moves the TV on | NOT WALKED. A model call that writes the real learner's placement | NOT WALKED | NOT WALKED (12) | none |
| 7 | Back x2, Left, Select, Select (stick): I have homework | Math Buddy | The photo ask | Ask `page` open, `awaiting maths` | PASS | PASS (15) | `r09-math-open`, `r10-homework-ask` |
| 8 | phone 360 and 414: the paper ask | Math hand-off | Photo panel, a way to cancel | "Ema · TV: Math Buddy", Cancel and Snap; overflow 0 px. No camera in a headless browser: Snap not pressed | PASS (camera not walked) | PASS (18) | `phone-360-math-ask`, `phone-414-math-ask` |
| 9 | phone, ask open: POST `/api/worked` (naming the open ask's id, and with none) | Math hand-off, craft-1 | A phone cannot open a worked lesson; the TV does not move | 409 "The TV is not asking for that now." both times; ask, screen and `awaiting` unchanged. `/api/memory` and `/api/practice` the same. See W-A | PASS (W-A) | new | `doors-ask-open.txt` |
| 10 | phone 360: Cancel on the paper ask | Math hand-off | The ask is withdrawn | `ask` null; `awaiting` stays `maths` until one TV Back (M1) | PASS (M1) | PASS (19) | `phone-360-math-cancelled`, `r11`, `r12` |
| 11 | phone, no ask open: the same POSTs, plus retry and coach | Door | Refused; the TV does not move | All eight calls 409; `screen`, `ask`, `awaiting` identical before and after | PASS | new | `doors-no-ask.txt` |
| 12 | Back, Right x2, Select, Down, Select (stick): Writing | Writing | The chosen prompt, two actions | School uniform: task, Write / Coached / Revised and saved, "Write it on your phone" lit, "Another prompt". (The lamp was on Math, not Linga, so a first pass of Rights landed on Essay Master; its paragraph ask was cancelled with Back x3, nothing sent.) | PASS | PASS (25, 26) | `r19`, `r20-chosen` |
| 13 | Select on "Write it on your phone" | Writing | The hand-off opens | ask `writing` open, `phase: open` | PASS | PASS (27) | `r21-handoff-open` |
| 14 | phone 360 and 414: the write panel | Writing hand-off | Prompt, one text box, Send, a way out | "Ema · TV: Writing", SCHOOL UNIFORM, the task, text box, "At least two sentences. The TV shows one note about it.", SEND PARAGRAPH, Cancel; overflow 0 px at both widths | PASS | PASS (28) | `wr-phone-360-panel`, `wr-phone-414-panel` |
| 15 | phone, writing ask open: POST `/api/writing/coach` with `{}` and with a draft but no `askId` | Writing, coach order | 409 from the door, not a 400 | 409 "The TV is not asking for that now." for both; ask unchanged. Nothing sent through the ask, so no model call | PASS (409 order only) | new | `doors-writing-ask-open.txt` |
| 16 | phone: Send paragraph (the coach call) | Writing hand-off | One note on the TV | NOT WALKED. A model call that saves a record for the real learner | NOT WALKED | NOT WALKED (29) | none |
| 17 | Back, Back, Select, Down, Select, Back (stick): Another prompt | Writing | The episode is cleared | Ask `null`, then landing, then Writing "Not started. Write one paragraph on your phone and get one coaching note on the TV." | PASS | PASS (30, 31) | `r24-another-prompt`, `r25-landing-after-clear` |
| 18 | The phone client's practice Try again | Phone client | It sends `jobId` | `desk-jobs-rules-test.cjs`, 76 of 76 pass (exit 0): line 991 pins `call("/api/session/retry", kind === "practice" ? { kind, jobId: s?.jobs?.practice?.id } : { kind })`; 986 and 994 post it as a phone and it runs in-process | PASS (suite) | new | `jobs-rules.txt` |
| 19 | A retry naming a foreign or unknown job | Door | Refused | Suite lines 1004-1010: unknown id, foreign job, job with no owner, running, ready, a job that will not change, no seated learner: each refused. Live: `jobId: "nope"` and no `jobId` from a phone, 409 | PASS | new | `jobs-rules.txt`, `doors-no-ask.txt` |
| 20 | Up, Select, Right, Select (stick): Forget every phone | Pairing | Phone forgotten | Pair screen, `phonesLive` 0; Back to the landing | PASS | PASS (32) | `r26-after-forget`, `r27-landing` |

A live practice failure on the stick (the job a Try again retries) needs a model call and a real learner, so the retry of a seated learner's own failed job (the positive path) is shown by the suite only, never by the stick.

## Regressions against the RC walk

**None.** Every row that was PASS there and is walked here is PASS. The NOT WALKED rows are the same three (a Linga reply, the Writing Send; the Essay read is out of this walk's scope) for the same reasons. Rows 9, 11, 15, 18 and 19 have no RC counterpart.

## Android build check (AGP 9.4.1 `60f7798f`, ktor 3.6.0 `421f6ee4`)

| Task | Result |
|---|---|
| `node tools/gradlew.cjs :stick-app:testDebugUnitTest` | **PASS**, `BUILD SUCCESSFUL`. Run again with `cleanTestDebugUnitTest --no-build-cache` so the result is not a cache hit: the tests ran, green. |
| `node tools/gradlew.cjs :stick-app:assembleDebug` | **PASS**, `BUILD SUCCESSFUL`. Not installed: the stick's APK stays as filmed. |
| `node tools/gradlew.cjs :tv-app:assembleDebug` | **NOT BUILT, prerequisite absent.** `compileDebugKotlin` fails: `MainActivity.kt:73:70 Unresolved reference 'raw'`, because the generated `tv-app/src/main/res/raw/fixture_clip.mp4` does not exist in this worktree (it is gitignored; `fixtures/README.md`). Dependency resolution and every task before Kotlin compile ran under AGP 9.4.1 and ktor 3.6.0. This says nothing against the bumps: build `:tv-app` where the fixture exists. |

## Findings (none fixed: none is a blocker)

- **W-A. The brief expected a worked lesson "opened from the phone through the ask door"; the code allows no phone to open one.** `api/worked` is wrapped `withPhoneAsk(req, [], ...)`: an empty kind list answers no ask, so every phone is turned back even when it names the open ask's id (row 9). The route comment says so on purpose ("Only the TV opens a worked lesson", `desk/src/tv/keys.ts:330`); the phone client never calls `/api/worked`, `/api/memory` or `/api/practice` (grep of `desk/src/app/phone`, `desk/src/tv`). Only the refusal could be walked, and it holds. If the owner meant a phone-opened lesson, that is a design change in `desk/src/app/api/worked/route.ts:15`, not a regression.
- **Landing lamp.** Back from Math Buddy put the lamp on Math Buddy, not on Linga (the RC walk saw Linga after Back from each module). A walk that counts Rights must look at the screen first; this one landed on Essay Master once and cancelled it. Not a regression of the desk's behaviour that matters; noted.
- **Still true, unchanged:** M1 (phone Cancel on the paper ask leaves `awaiting maths` until one TV Back), F3 (TV badge "Phone joined" while `phonesLive` 0 when the phone page is closed).
- **New tool.** `tools/stick-walk/phone-doors.cjs` records the door probes above (every POST refused 409, the session compared before and after).

## The desk's state after the walk

- **:3000** runs `next start` on main HEAD (`cf0d1c1e`, BUILD_ID `f9HDwdQPbtJFjZZdgAvcx`): landing, Ema seated, no ask, no Math `awaiting`, `phonesLive` 0 (every phone forgotten, code regenerated).
- **The stick** is on `10.0.0.141:3000` with `dev.studydesk.stick/.StickActivity` in focus (`rewalk-restore-probe.txt`: probe `Answered(viewer=tv)` at 09:45:22). The lock directory is released.
- No model call, no Snap, no Send, no accepted notice, nothing under `desk/data/` touched. No APK installed.
