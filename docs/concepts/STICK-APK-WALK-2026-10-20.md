# The stick APK and its walk (2026-10-20)

Finding F0 of the stick pass (TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md, "Stick pass 2026-10-20") says the D-pad, Select, Back and Menu never reach the page in Silk; only Play/Pause does. This doc covers the fix: `stick-app/`, a small WebView APK that loads the desk's /tv page and passes the remote's keys to it. TL-1 was then walked on the stick through the APK, and the remote-driven flows of the stick pass were walked again.

Every screencap is under `artifacts/stick-2026-10-20-apk/`. They are `adb exec-out screencap` captures, shrunk to 1280×720 with a palette.

## What was built

`stick-app/` is a new Gradle module (`include(":stick-app")` in `settings.gradle.kts`). It uses the same toolchain as `tv-app/` (AGP 8.7.3, Kotlin 2.0.21, compileSdk 34, minSdk 28) but has no Compose, no AndroidX and no other dependency.

- **`StickActivity`.** One fullscreen activity, launchable from Leanback (it has the `LEANBACK_LAUNCHER` category and a banner). Its WebView has JavaScript and DOM storage on, media can play without a gesture (the YouTube lesson plays), and http is allowed in cleartext. The screen stays on.
- **The address.** It comes from the intent extra `url`, which is kept in prefs. Without the extra, the activity uses the kept address, or else `http://10.0.0.141:3000/tv`. When the desk cannot be reached, the activity shows a notice: the address and the error, "Select: try again · Back: leave", and the `am start` line that points it (`tv-A2-unreachable-notice`).
- **`KeyBridge`.** The activity's `dispatchKeyEvent` turns each remote button into the key name `keyOf` in `desk/src/tv/keys.ts` already maps. It dispatches a `keydown` and a `keyup` on the page:

  | Remote (Android key) | Page `key` (keyCode) |
  |---|---|
  | DPAD_UP / DOWN / LEFT / RIGHT | `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` (38/40/37/39) |
  | DPAD_CENTER, ENTER, NUMPAD_ENTER | `Enter` (13) |
  | BACK | `Backspace` (8), as the stick pass injected it |
  | MENU | `ContextMenu` (93) |
  | MEDIA_PLAY_PAUSE, MEDIA_PLAY, MEDIA_PAUSE | `MediaPlayPause` (179) |

  Any other key (volume, Home) stays with the system.
- **Back.** Back goes to the page when the button is released. The page's handlers (`app/tv/page.tsx`, `LingaTV.tsx`) call `preventDefault` on every key they map, so the script returns `defaultPrevented`. If the page did not take Back, the app closes. A held Back closes the app at once and sends nothing to the page. "Held" means the system's long press (`FLAG_LONG_PRESS`, about 500 ms on Fire OS) or 800 ms, whichever comes first.
- **The stage alone.** The /tv page is also the operator's bench: its button bar hides only under `:fullscreen` (`desk/src/app/globals.css:14`). A WebView cannot go fullscreen without a gesture. On each page load, the APK injects one rule that hides `.bench > .bar` (`tv-A0-first-load` is the page before the rule, `tv-A1-landing-stage-only` after). The keys go to the stage when the focus is on the bar or nowhere, because LingaTV ignores a key whose target is inside `.bar`.
- **Tests.** `stick-app/src/test/.../KeyBridgeTest.kt` (JVM, JUnit 5) checks that every button maps to a name `keys.ts` knows, that volume and Home stay with the system, and that the script reports `defaultPrevented`.

## Install and point it

```sh
./gradlew :stick-app:assembleDebug          # stick-app/build/outputs/apk/debug/stick-app-debug.apk
adb connect 10.0.0.139:5555
adb -s 10.0.0.139:5555 install -r stick-app/build/outputs/apk/debug/stick-app-debug.apk
adb -s 10.0.0.139:5555 shell am start -n dev.studydesk.stick/.StickActivity --es url "'http://HOST:PORT/tv?key=<the desk key>'"
```

The single quotes inside the double quotes keep the `?` and `&` away from the device shell. After that, the launcher's "Study Desk" entry opens the same address. `cmd package query-activities` lists it under `LEANBACK_LAUNCHER`; the tile itself was not captured. To change the address, run `am start` with a new `url`. A launcher tap on a desk that is already running does not reload it.

**How the walk served the desk.** This followed the stick pass. `next dev --webpack -H 0.0.0.0 -p 3107` ran in this branch's `desk/` with `DESK_DATA_DIR` set to a fresh temp dir outside the repo, so only the seeded test learners Ema and Jakub were there. `NODE_PATH` pointed at a temp copy of `@next/env` 16.3.8, which is still missing from the main checkout's `desk/node_modules` (F22). The Windows firewall opens only :3000, and the operator's server there serves the real learners, so the stick reached :3107 through `adb reverse tcp:3107 tcp:3107` at `http://localhost:3107/tv?key=…`. On the operator's own desk (:3000, LAN), no reverse is needed: `--es url "'http://10.0.0.141:3000/tv?key=…'"`.

**How the keys were pressed.** Every key was `adb shell input keyevent <KEY>` (`--longpress BACK` for the hold). This enters the stick's input pipeline and reaches `StickActivity.dispatchKeyEvent` the same way a remote button does. Nothing went over DevTools. DevTools (the WebView's `webview_devtools_remote_<pid>` socket, open in the debug build) was used only to read `/api/session` after each key, to set the break clock (25 `timer.tick` posts, what the bench's Clock ×60 does), and to load `about:blank` for the "page does not take Back" case. Logcat tag `StickKeys` records each key and whether the page took it. No physical remote was pressed (see the open questions).

## TL-1 through the APK

The stick check from TL-1: on the landing, Linga home, a lesson and the break, press Back, Menu and Play/Pause, plus the D-pad and Select. Record what arrives and what it does. Back must not leave the page.

The stick is an AFTKM (Android 11) with Amazon WebView 150.0.7871.181. The base is `main` at 56d93dcb.

| Screen | Button | The page received (logcat `StickKeys`) | What happened | Screencap | Verdict |
|---|---|---|---|---|---|
| landing | Left, Right | `ArrowLeft`, `ArrowRight`, taken | The lamp moved between the apps (focus 2 → 1 → 2) | `tv-TL1-02-landing-left` | pass |
| landing | Back | `Backspace`, taken | The lamp went back to rest (the phone, focus 4). The app stayed in front | `tv-TL1-03-landing-back-stays` | pass |
| landing | Menu | `ContextMenu`, taken | Nothing, by design: no learner seated (`keys.ts:376`) | `tv-TL1-04-landing-menu` | pass |
| landing | Play/Pause | `MediaPlayPause`, taken | Nothing, by design (`keys.ts:750`) | `tv-TL1-05-landing-play` | pass |
| landing | Select (no learner) | `Enter`, taken | `learner`. It paints in full, unlike Silk fullscreen (F13) | `tv-TL1-07-select-opens-learner` | pass |
| learner | Select | `Enter`, taken | Ema seated, back to the landing | `tv-TL1-08-select-seats-learner` | pass |
| landing → Linga | Left ×2, Select | taken | Linga home | `tv-TL1-09-landing-linga-lit`, `tv-TL1-10-linga-home` | pass |
| Linga home | Down | `ArrowDown`, taken | Focus to "I'll pick my level" | `tv-TL1-11-linga-down` | pass |
| Linga home | Menu | `ContextMenu`, taken | Linga's menu opened | `tv-TL1-12-linga-menu-open` | pass |
| Linga menu | Back | `Backspace`, taken | The menu closed. Linga home, focus at rest | `tv-TL1-13-linga-back-closes-menu` | pass |
| Linga home | Play/Pause | `MediaPlayPause`, taken | Nothing (no scene to pause) | (state only) | pass |
| Linga home | Back | `Backspace`, taken | The landing, lamp on Linga. The app stayed | `tv-TL1-14-linga-back-to-landing` | pass |
| tonight | Menu | `ContextMenu`, taken | `units` | `tv-TL1-15-maths-tonight`, `tv-TL1-16-maths-menu-units` | pass |
| units → lesson | Down, Select | taken | Lesson "Linear equations 1", the YouTube clip playing | `tv-TL1-17-lesson` | pass |
| lesson | Play/Pause ×2 | `MediaPlayPause`, taken | `lessonPaused` true ("Paused · Play resumes · Back returns"), then false | `tv-TL1-18-lesson-play-pauses` | pass |
| lesson | Menu | `ContextMenu`, taken | `calendar` | `tv-TL1-19-lesson-menu-calendar` | pass |
| lesson | Back | `Backspace`, taken | `units`. The app stayed | `tv-TL1-20-lesson-back-to-units` | pass |
| units | Play/Pause | `MediaPlayPause`, taken | The clock started | `tv-TL1-21-units-play-starts-clock` | pass |
| break | Menu | `ContextMenu`, taken | Nothing (the break has no Menu) | `tv-TL1-22-break` | pass |
| break | Play/Pause ×2 | `MediaPlayPause`, taken | The break clock paused, then ran | (state only) | pass |
| break | Back | `Backspace`, taken | `timer.skipbreak`: back to `units`, work phase. The app stayed | `tv-TL1-23-break-back-skips` | pass |
| any | Back held (`--longpress`) | nothing sent | "Back held: leaving". The Fire TV home screen came up | `tv-TL1-24-back-held-leaves` | pass |
| `about:blank` (no handler) | Back | `Backspace`, **not** taken | "Back not taken by the page: leaving" | (logcat) | pass |
| launcher intent | (none) | (none) | Reopened on the kept address, the session where it was | `tv-TL1-25-relaunched` | pass |

**TL-1 passes through the APK.** Every button reaches every screen with the name `keys.ts` maps. Back never leaves the page while the page handles it. A held Back, or a page with no handler, leaves the app.

## The stick pass re-walked with the remote's key path

In the stick pass, only TL-1 failed because of F0 alone. Every other step was driven by keys injected over Silk's DevTools, so its verdict did not cover the remote's key path ("the key path is not the remote's"). The remote-driven steps below were walked again through the APK, with real key events. Steps that need a phone (P2-P6, L4, E3-E5 replies, M7, S4/S5, W3, W5/W6) were not repeated: the phone side does not depend on F0.

| Step | Keys | Seen | Screencaps | Verdict |
|---|---|---|---|---|
| P1 Landing → pair | Up, Select, Back | Up lit the phone stop. Select opened `pair` with the code. Back returned to the landing on the phone stop | `tv-R-P1-landing-phone-stop`, `tv-R-P1-pair-screen`, `tv-R-P1-pair-back` | pass |
| S1 Essay Master | Right ×2, Select, Down | Lens home. Down moved the lit lens | `tv-R-S1-landing-essay-lit`, `tv-R-S1-essay-lenses`, `tv-R-S1-lens-moved` | pass |
| S3 Select on a lens | Select, Back | Ask `paragraph` opened ("argument lens chosen — paste or dictate the paragraph on the phone"). Back cancelled it. The status line stayed after the cancel: that is F21, fixed on main after this branch's base (d456d31e) | `tv-R-S3-paragraph-ask`, `tv-R-S3-back-cancels` | pass (F21 seen; fixed on main) |
| M1 Tonight | Select on Math Buddy | The doors | `tv-R-M1-tonight` | pass |
| M10 Down on Tonight, then Back | Down, Back | `paper` opened, and Back returned to **Tonight** (F10 fixed, now seen on the stick) | `tv-R-M10-paper`, `tv-R-M10-back-to-tonight` | pass |
| M2 / TL-6 I have homework, Back | Select, Back | Ask `page` opened (`awaiting` maths). Back cancelled it | `tv-R-M2-page-ask`, `tv-R-TL6-back-cancels-ask` | pass |
| M6 Get ready for school | Right ×2, Select | `prepare` | `tv-R-M6-prepare-lit`, `tv-R-M6-prepare` | pass |
| E1 I'll pick my level → A1 | Down, Select, Select | `linga-verdict`: "A1 · First words", See my topics lit | `tv-R-E1-pick-level`, `tv-R-E1-after-level` | pass |
| E8 Set up on the phone | Menu, Down ×6, Select, Back ×2 | Ask `prefs` opened ("Back cancels"). Back cancelled it, then closed the menu | `tv-R-E8-menu-setup-lit`, `tv-R-E8-prefs-ask`, `tv-R-E8-back-cancels-then-closes-menu` | pass |
| W1/W2 Sentence help | Menu, Down ×7, Select, Select, Back | `sentence`. Select opened ask `sentence`; Back cancelled it | `tv-R-W1-sentence`, `tv-R-W2-sentence-ask`, `tv-R-W2-back-cancels` | pass |

Not re-walked:
- E5 Choose a phrase. It failed on F14/F15, not on F0, and the fixes (5cf2f07f, 64bce506) are not on this base.
- See my topics and a scene. These are model calls, and the key path through them is the same as above.
- M3, a failed read retried with Select. No page was sent, because no phone was in the walk.

## Open

- **A physical remote press.** It was not done: nobody was at the stick. `input keyevent` uses the same `dispatchKeyEvent` path, but the operator should press the real D-pad, Select, Back (short and held), Menu and Play/Pause once.
- **The bench bar.** It is hidden by a stylesheet the APK injects, because desk/ was read-only here. If the desk itself should know it is on the stick, it could take a `?device=stick` (or similar) and drop the bar. That would be a desk change.
- **The default address.** It is `http://10.0.0.141:3000/tv`, the operator's desk on the one open firewall port, without a key. The first launch must therefore carry `--es url` with the key. Once the desk has set its TV cookie in the WebView, the key is no longer needed.
