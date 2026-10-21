# The stick APK and its walk (2026-10-20)

Finding F0 of the stick pass (TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md, "Stick pass 2026-10-20") says the D-pad, Select, Back and Menu never reach the page in Silk; only Play/Pause does. This doc covers the fix: `stick-app/`, a small WebView APK that loads the desk's /tv page and passes the remote's keys to it. TL-1 was then walked on the stick through the APK, and the remote-driven flows of the stick pass were walked again.

Every screencap is under `artifacts/stick-2026-10-20-apk/`. They are `adb exec-out screencap` captures, shrunk to 1280×720 with a palette.

## What was built

`stick-app/` is a new Gradle module (`include(":stick-app")` in `settings.gradle.kts`). It uses the same toolchain as `tv-app/` (AGP 8.7.3, Kotlin 2.0.21, compileSdk 34, minSdk 28) but has no Compose, no AndroidX and no other dependency.

- **`StickActivity`.** One fullscreen activity, launchable from Leanback (it has the `LEANBACK_LAUNCHER` category and a banner). Its WebView has JavaScript and DOM storage on, media can play without a gesture (the YouTube lesson plays), and http is allowed in cleartext. The screen stays on.
- **The address.** The first build kept the intent's whole `url` in prefs, key and all; the walk left it at a localhost tunnel, and the stick showed a blank error without it. Since the standalone build, the stick finds its desk by itself, keeps only `host:port`, and never keeps a localhost one. See "Standalone: finding the desk and pairing" below.
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
- **Tests.** `stick-app/src/test/.../KeyBridgeTest.kt` (JVM, JUnit 5) checks that every button maps to a name `keys.ts` knows, that volume and Home stay with the system, and that the script reports `defaultPrevented`. `DeskTest.kt` covers the address rules (below).

## Install and point it

From a fresh stick, on the computer that runs the desk. The stick and the computer must be on the same Wi-Fi, and the desk must answer on the LAN: `npm run dev` in `desk/` on :3000, the one port the Windows firewall opens.

**1. Install.** Turn on ADB debugging on the stick (Settings → My Fire TV → Developer options), then:

```sh
./gradlew :stick-app:assembleDebug          # stick-app/build/outputs/apk/debug/stick-app-debug.apk
adb connect 10.0.0.139:5555                 # the stick's address: Settings → My Fire TV → About → Network
adb -s 10.0.0.139:5555 install -r stick-app/build/outputs/apk/debug/stick-app-debug.apk
```

**2. Point it.** Usually nothing to do. Open "Study Desk" from the launcher (Your Apps & Channels). The stick tries the address it kept, else `10.0.0.141:3000`. If nothing answers there, it searches its own network (`x.y.z.1`–`254` on :3000, about 3 s) for a Study Desk. If that finds nothing, it shows **Where is the desk?**: four numbers and a port, set with the remote (Up/Down change the lit number, Left/Right move, Select connects). An address is kept only once a desk has answered at it, and a `localhost` / `127.x` / `::1` address is never kept.

**3. Pair it (once per desk key).** A desk that answers but does not take the stick for its TV gets **Found the desk. This stick is not its TV yet** (`standalone-04-final-real-desk`). When the desk starts, it prints its TV link in its own console:

```
  TV: http://10.0.0.141:3000/tv?key=…
```

Copy that link into one command:

```sh
adb -s 10.0.0.139:5555 shell am start -n dev.studydesk.stick/.StickActivity --es url "'http://10.0.0.141:3000/tv?key=<the key from the TV: line>'"
```

The single quotes inside the double quotes keep the `?` and `&` away from the device shell. The stick opens the link once. The desk sets its httpOnly `desk-tv` cookie in the WebView and moves it on to `/tv` (`desk/src/proxy.ts`). From then on the TV page opens from the launcher with no key. The key itself is never written to the stick's prefs: only `host:port` is kept (`shared_prefs/stick.xml`, `<string name="desk">10.0.0.141:3000</string>`). Pairing is needed again only when the desk mints a new key, which happens when its `pairing.json` is lost or unusable. The stick then shows the pairing screen again by itself: its heartbeat sees the desk answer it as a guest. `--es url` also takes a bare `host:port` to point the stick at another desk without pairing.

**What the screens mean.**

| Screen | Means | What to do |
|---|---|---|
| **Looking for the desk** | Probing the address, or searching the network | Wait a few seconds |
| **Found the desk. This stick is not its TV yet** | A Study Desk answered at the address shown, but the stick has no TV cookie for it | Step 3, once |
| **The desk is not answering** (`standalone-02-unreachable`) | The address shown, what failed (no answer, nothing on the port, no network), and when it was last tried. The stick probes again every 5 s and searches the network once a minute. When the desk answers, it opens it by itself (`standalone-03-recovered`). While the TV page is up, a probe runs every 10 s; three misses in a row bring this screen up | Start the desk, or check the stick's Wi-Fi. **Retry** probes now. **Change address** opens the setup screen. Back leaves the app, as before |
| **Where is the desk?** (`standalone-05-setup`) | Nothing answered anywhere, or Change address was chosen | Set the computer's address. Select connects. Back returns to the screen it came from (or leaves) |

Retry and Change address are picked with Left/Right (or Up/Down) and Select. Every other key on these screens does nothing. On the TV page, the keys behave as in "What was built" above.

## Standalone: finding the desk and pairing (2026-10-20 afternoon)

The operator asked for the stick to work without the walk's tunnel before his remote run. Root cause: the first build kept the intent's whole link, and the walk left that at `http://localhost:3107/tv?key=…`.

**What changed (`stick-app/`).**
- `Desk.kt` holds the rules as plain JVM code: the loopback check, `host:port` and TV-link parsing, how a probe answer is read, and the probe/recovery decision. `DeskNet.kt` does the network: one probe, and the /24 search with 64 probes at a time. `StickActivity` draws the screens.
- **The probe is the desk's own guest door, `GET /api/session`.** A guest may already reach it (`desk/src/proxy.ts` `OPEN`), so no desk change was needed. A desk answers with its session, which has `viewer` and `phoneUrl`. Nothing else on a LAN answers that way. The probe sends the WebView's cookie for the desk, so `viewer` also says whether the stick is the desk's TV (`"tv"`) or a guest. A guest's answer is the lobby allowlist (`view()` in `pairing.ts`): no pin, no learner's evening.
- **Decision** (`Plan`, `DeskTest`):
  - A desk that answers `tv` opens.
  - One that answers as a guest opens with the key in hand, else gets the pairing screen.
  - If the kept address or the default fails, the stick searches the LAN once. It prefers a desk that already takes it for its TV, then the same host on another port.
  - An address given by adb, or picked on the setup screen, is retried where it is: its key belongs to that desk.
  - If nothing is found, a kept address gets the error screen and the default gets the setup screen.
- **Kept state:** `desk` = `host:port`, written only after a desk answered there and never for loopback. The old `url` pref is read once and dropped. A loopback address from it is not kept, and a LAN one keeps its `host:port`.

**Provisioning the TV key: the choice.** The key reaches the stick through a **one-time adb intent carrying the TV link the desk prints on its own console at start** (`desk/src/instrumentation.ts`). The stick opens it once, and the desk's existing cookie does the rest. No desk change, no new route, and the key travels only over the operator's own adb connection. It is held in the app's memory until `/tv` has loaded and is never written to prefs.

The alternatives, and why they lost:
- *A desk route that hands the key to the stick* (for example on a LAN request from the stick's IP). The brief forbids it, and `pairing.ts` itself says an address cannot stand in for the key: any LAN client can claim one.
- *Typing the key on the stick with the remote.* The key is 32 base64url characters (`randomBytes(24)`). An on-screen keyboard driven by the D-pad would take minutes and invite typos, for something done once.
- *The desk shows the link on the TV screen.* Chicken and egg: the TV page is what needs the key, and a guest's /tv must not show it.
- *A phone pairs the TV* (the phone is joined, so it could relay the key). This needs a new desk route and changes the pairing model. It is out of scope for a 2026-10-23 deadline and outside the paths this change may touch.
- *Keep writing the whole link to prefs* (the first build). This is what broke: a dead tunnel stayed kept. It also left the key in a file when the cookie is enough.

**Proof, without adb reverse** (`artifacts/stick-2026-10-20-apk/standalone-*`). `adb reverse --remove-all` ran first. `adb reverse --list` and `adb forward --list` were empty (`standalone-00-no-tunnel.txt`) and stayed empty to the end (`standalone-06-final-state.txt`). Keys were `adb shell input keyevent`; there was no tunnel and no DevTools. The desk is the operator's own at `10.0.0.141:3000`. It was never stopped, read or written: its learners' data and its key were not touched.

| Step | Seen (logcat `StickKeys`) | Screencap | Verdict |
|---|---|---|---|
| The walk's stale pref (`url` = `http://localhost:3107/tv?key=…`) restored, launcher start | "dropped the old kept link … (loopback, not kept)". Default `10.0.0.141:3000` probed: `viewer=guest`. Pairing screen. Pref now `desk` = `10.0.0.141:3000` | `standalone-01-found-desk` (log `standalone-01-start.log`) | pass |
| The kept desk set to a dead `10.0.0.142:3000` (the computer's address changed), launcher start | Probe failed. "searching the LAN (stick at 10.0.0.139)" for 3 s. "search found [10.0.0.141:3000=guest]". Pairing screen at `.141`, pref moved to it | `standalone-01b-searching`, `standalone-01c-scan-found-desk` | pass |
| Desk unreachable: the stick's own Wi-Fi turned off for about 25 s by a script on the stick (`standalone-02-03-outage.sh`). The desk could not be stopped, it is the operator's | Probes "nothing answered at 10.0.0.141:3000" every 5 s. The error screen with the address tried, Retry lit. Its minute search found nothing | `standalone-02-unreachable` (captured on the stick, log `standalone-02-03-outage.log`) | pass |
| Wi-Fi back on, nothing pressed | Next probe `viewer=guest`, so the pairing screen came back by itself about 12 s after Wi-Fi returned | `standalone-03-recovered` | pass |
| Right, Select (Change address), then Back | "unpaired: Change address". The setup screen seeded with `10.0.0.141:3000`. "setup: back" to the pairing screen, probing again | `standalone-05-setup` (log `standalone-05-setup.log`) | pass |
| Final state | Pairing screen at `http://10.0.0.141:3000`. Pref `desk` = `10.0.0.141:3000`, no `url`, no key. App resumed | `standalone-04-final-real-desk`, `standalone-06-final-state.txt` | **the operator's one step left** |

**The TV-session half, checked before the proof** (it needs a key, and the real one is only on the desk's console). A temporary desk ran in this branch's `desk/` on :3107, with `DESK_DATA_DIR` in a fresh temp dir. The stick reached it through `adb reverse tcp:3107`, which was removed before the proof above. Through that tunnel:
- `--es url` with its TV link: probe `viewer=guest`, step `Open` with the key, then every 10 s heartbeat `viewer=tv`. The WebView's httpOnly cookie reaches the native probe.
- The localhost address was used for the run and not kept: prefs went to `<map />`.
- With the tunnel removed: three misses, then the error screen ("Tried http://localhost:3107").
- With the tunnel back: `viewer=tv` and the page reloaded by itself.

That check ran on the build just before two wording changes (the timeout and connect-failure lines) and the quieter pairing-screen retry. The proof captures ran on the final build. `standalone-01*` were taken before the timeout wording change, which does not appear on those screens.

**The real desk is not yet the stick's TV.** Its key is in `desk/data/pairing.json`, which must not be read, and in the desk's console, which only the operator sees. The one step left is step 3 above, with the `TV:` line from the console of the desk on :3000. If that console has scrolled away, restarting the desk prints the line again, with the same key.


**How the walk served the desk** (the morning walk, before the standalone build). This followed the stick pass. `next dev --webpack -H 0.0.0.0 -p 3107` ran in this branch's `desk/` with `DESK_DATA_DIR` set to a fresh temp dir outside the repo, so only the seeded test learners Ema and Jakub were there. `NODE_PATH` pointed at a temp copy of `@next/env` 16.3.8, which is still missing from the main checkout's `desk/node_modules` (F22). The Windows firewall opens only :3000, and the operator's server there serves the real learners, so the stick reached :3107 through `adb reverse tcp:3107 tcp:3107` at `http://localhost:3107/tv?key=…`. The first build kept that link, so once the walk's desk and tunnel were gone the stick opened a dead address with an empty-response error. That was the root cause the standalone build fixes. On the operator's own desk (:3000, LAN), no reverse is needed.

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
- **The default address.** It is `http://10.0.0.141:3000`, the operator's desk on the one open firewall port. Since the standalone build, the first launch finds the desk by itself; only the key needs the one adb line, once (see "Install and point it").
