# Devpost paste pack: Study Desk

Paste each section into the Devpost field named in its heading. Text only. The sources are the other
files in this folder. A mark like [CHECK] is a fact the repo does not settle. Resolve each one, or
cut the sentence, before pasting.

All three [CHECK] marks are resolved (2026-10-22). One field is left for the operator: the demo video
URL (section 0).

---

## 0. Demo video

**Field: Video demo link.**

[VIDEO URL - operator pastes]

---

## 1. Project description

**Field: What it does / project description.**

### What Study Desk is

Study Desk turns the Fire TV in the living room into a homework desk for a family.

The TV leads. The learner and a parent sit on the sofa and look at one big screen. They drive it with
the Fire TV remote. The phone assists. It pairs once. After that it is the camera, the keyboard and the
microphone, and the TV asks for one of them only when it needs it.

The TV gives what a phone app cannot: two people looking at one page, the phone pointed at the paper,
and homework kept away from phone notifications.

Study Desk never puts the answer on screen. Hints withhold the answer. A verdict on the learner's work
is decided by code, not by a model.

The landing holds three modules. Each is drawn as a small world in layered paper.

- **Math Buddy (Math).** The phone photographs the homework sheet. The TV shows the working in the
  learner's own hand and marks each error inside the line, by kind. The model marks the work and must
  show its own solution. The desk re-checks that solution itself. Where the two disagree, no verdict
  reaches the screen. It also has video lessons that the remote's Play/Pause controls.
- **Linga (Language).** A conversation is a place you step into. The learner rehearses a situation in
  English with a partner on the TV, answers on the phone, and gets one coaching note. A short placement
  conversation ends in a band from A1 to C2 that the learner can see.
- **Essay Master (Writing).** The type is the diagram. The learner sends a paragraph from the phone.
  The TV reads it through lenses, such as structure and argument, set large enough to read from the
  sofa. Essay Master is the one writing tile. Its lens home ends in "Write from a prompt", which opens a
  Writing screen inside the TV page. The remote picks a prompt. The learner types the paragraph and the
  revision on the phone. The coaching note comes back to the TV.

When a step needs the phone and none is paired, the TV opens a pairing page for that step. It says what
the phone is for. When the phone joins, the TV goes back to the same screen and runs the step again.
While the TV waits, it is drawn in the learner's module look, not a grey grid.

Around the modules is a family shell: choose who is studying, pair a phone, a break timer and a recap
of the evening.

### How a session goes

1. Open Study Desk on the Fire TV. The app finds the desk on the home network by itself.
2. Choose who is studying with the D-pad and Select.
3. Pair a phone. The TV shows a QR code, a four-digit code and the address.
4. Work on the TV. When the TV needs a photo, a typed answer, a paragraph or a spoken reply, it opens
   an ask. The phone shows only the panel for that ask. The phone cannot seat a learner or move the TV.
   The desk refuses those posts.

### How it was built

- The desk is a Next.js web app on a computer on the home network. One session store holds all state.
  It fans each change out to the TV and the phone over server-sent events and keeps it as JSON.
- Every request is classified as the TV, a phone or a guest. Only the TV holds the desk key.
- Decisions live in code, in `desk/src/lib/rules/`. Models explain. They do not decide. The text,
  vision, voice and embedding engines sit behind one provider seam. The rules suites run with the models
  stubbed, so no test makes a live model call. `npm run test:rules` in `desk/` runs 100 rules suites
  (the `rulesSuites` list in `desk/package.json`). On 2026-10-22 all 100 passed: 2,583 tests, 0 failed.
- The Fire TV app, `stick-app/`, is a small Android app for Fire OS with no dependencies. It is one
  fullscreen WebView that loads the desk's TV page. Its key bridge turns each remote button into the key
  event the page already handles. A short Back goes to the page. A held Back leaves the app. The app
  probes the desk, searches its own /24 network when the saved address does not answer, and recovers by
  itself when the desk comes back.
- It was measured on a real device: a Fire TV Stick 4K (AFTKM), Fire OS 8, Amazon WebView 150.
  - All 24 rows of the remote-key table pass through the app (TL-1).
  - With no adb tunnel, the app found the desk, followed it to a new address, and recovered about 12 s
    after the stick's Wi-Fi came back.
  - The idle landing went from 8.7 to 59 fps. Lamp moves and Back went from 6-7 fps to 22-45 fps.
  - A lamp move's longest frame gap fell from 641-669 ms to 271-283 ms. Back fell from 500-572 ms to
    228-378 ms.
- The repo's first product, a telestrator where a phone draws on a paused video frame, also ran on the
  stick over Wi-Fi: its live UI test passed 27 of 27.

### Honest limits

- The desk is a functional prototype and a design document for a native Fire TV rebuild. It runs on a
  computer, not on the stick.
- Linking a stick to a desk once needs one `adb` command.
- A module switch is shorter but not free. Pre-rendered bitmaps use about 46 MB more GPU memory.
- Writing on the TV is tested in code. The 2026-10-21 stick walk predates it, the TV pairing page and
  the module-look waits, and Math Buddy was not re-walked that day.
- The walks pressed keys with `adb shell input keyevent`. A press of the physical remote is still owed.

### What is next

- Rebuild the desk natively on Fire TV.
- Make linking a stick to a desk need no adb command. A pairing pattern from the platform would help
  (see the friction log).
- Re-walk Math Buddy and Writing on the stick.
- Press the physical remote through every screen.
- Keep cutting the module-switch stall.

---

## 2. Product feedback

**Field: Product feedback, one subsection per tool.** Amazon Devices Builder Tools are not listed.
Nothing in the repo shows they were used.

### Fire OS

- **Used for.** The platform for both TV apps, `stick-app/` (Study Desk) and `tv-app/` (the
  telestrator). `minSdk 28`.
- **Worked well.** A plain Android app with the `LEANBACK_LAUNCHER` category and a banner installs and
  launches from the launcher. Hardware video decode works. Remote keys arrive as ordinary key events, so
  the key bridge is a small table with unit tests. The long press on Back gives a clean "leave the app"
  gesture.
- **Needs work.** The screensaver reclaimed an app that was being watched and driven from a phone
  (FL-5). It is hard to tell which devices run Fire OS and which run Vega before buying (FL-11).
- **Onboarding.** Standard Android tooling was enough. The first gotchas were local ones.
- **Would build again.** Yes.

### Fire TV Stick 4K (AFTKM)

- **Used for.** The one test device for every stick walk and measurement. Fire OS 8.0, Android 11.
- **Worked well.** Fully usable over Wi-Fi with no cable. The telestrator's live UI test passed 27 of 27
  and its overlay drew faster than on the emulator (p50 0.084 ms). After the fixes the Study Desk
  landing runs at 59 fps idle.
- **Needs work.** Web content is GPU-bound. Large SVG layers take about half a second to raster. CSS
  filters on composited layers are very costly. The WebView's tile budget is reached under a CSS
  `scale()` (FL-7, FL-8, FL-10). None of this shows in a desktop browser, so the device was the only
  honest meter.
- **Onboarding.** Settings, My Fire TV, Developer options, ADB debugging. Then `adb connect` to the IP
  under About, Network. The address moved between sessions (FL-3).
- **Would build again.** Yes, on a stick of this class (Fire OS, not Vega).

### adb (against Fire OS)

- **Used for.** Install, launch with extras, every key of every walk (`input keyevent`, long-press
  Back), screencaps and screen recordings, logcat, `dumpsys gfxinfo`, `adb reverse` for temporary desks,
  and `adb forward` to the WebView and Silk DevTools sockets.
- **Worked well.** `input keyevent` enters the input pipeline like a remote button, so walks could be
  scripted and repeated. `screenrecord` writes one frame per composited frame, which caught a one-vsync
  blank. `adb reverse` served the stick from a temporary desk with no firewall change.
- **Needs work.** On a Windows shell, binary output and stderr handling break scripts (FL-4). Linking
  the stick to its desk still needs one adb command (FL-6).
- **Onboarding.** Quick. `adb connect <ip>:5555` over Wi-Fi was enough from day two.
- **Would build again.** Yes. It was the backbone of every on-device proof.

### Silk

- **Used for.** The first run of the TV-led flows on the real stick (Silk 152.5.31). Keys were driven
  over Silk's DevTools socket.
- **Worked well.** The page rendered with the stick's own fonts, layout and timing. Play/Pause reached
  it as documented (`keyCode 179`). The DevTools socket allowed a full walk before any APK existed.
- **Needs work.** Only Play/Pause reaches a page. The D-pad, Select, Back and Menu stay with Silk (FL-1).
  One screen painted only its top 290 px in fullscreen (FL-2).
- **Onboarding.** Opening a LAN URL is easy. Learning that the remote would not reach the page took a
  full walk.
- **Would build again.** For viewing, yes. For a remote-driven web app, no. The WebView wrapper
  replaced it.

### Amazon WebView on Fire OS (Amazon WebView 150)

- **Used for.** The whole Study Desk TV surface: one fullscreen WebView with JavaScript, DOM storage,
  media without a gesture, and cleartext http to the LAN desk.
- **Worked well.** Keys dispatched into the page arrive with the names the page maps, and
  `defaultPrevented` comes back, so the app knows when the page took Back. The desk's httpOnly cookie
  reaches the app's own native probe. The DevTools socket gave full traces, which ranked every frame
  cost.
- **Needs work.** A WebView cannot go fullscreen without a gesture, so the app injects a stylesheet to
  hide the page's operator bar. GPU raster cost, the tile budget and gfxinfo's reading of WebView frames
  (FL-7 to FL-10). `devicePixelRatio` reads 4 on a 960 x 540 CSS viewport, and a DevTools
  device-metrics override was ignored.
- **Onboarding.** A first working wrapper took one day. It was built, walked and passing TL-1 on
  2026-10-20.
- **Would build again.** Yes. It turned a web prototype into a remote-driven Fire TV app with no
  dependency beyond the platform.

### Fire TV and Vega developer documentation

- **Used for.** The remote's key values for web content (Select 13, arrows 37-40, Play/Pause 179,
  Back 4), and the platform review of Fire OS against Vega.
- **Worked well.** The key values were right for the WebView. The bridge maps to exactly them.
- **Needs work.** Silk's handling of those keys is not stated where the values are (FL-1). Vega's
  inbound sockets are undocumented (FL-11).
- **Onboarding.** The docs were enough to start. The gaps were found on the device.
- **Would build again.** Yes.

---

## 3. Friction log

**Field: Friction log.** Device in every entry: Fire TV Stick 4K (AFTKM), Fire OS 8 (Android 11), home
Wi-Fi. Severity: high blocked the product until worked around. Medium cost a day or a visible defect.
Low cost time.

### FL-1. Silk passes only Play/Pause to a web page (high)

- **Task.** Drive the Study Desk TV page with the Fire TV remote in Silk.
- **Steps.** Open the desk's TV page in Silk 152.5.31. Press each remote button, windowed and
  fullscreen.
- **Expected.** The page gets the documented key values: Select 13, arrows 37-40, Play/Pause 179,
  Back 4.
- **Actual.** Only Play/Pause reaches the page. The D-pad moves Silk's cursor. Select clicks under it.
  Back is Silk's history, then "Exiting Amazon Silk". Menu opens Silk's menu. Rewind and fast-forward
  send nothing.
- **Workaround.** A small WebView APK, `stick-app/`, forwards each key to the page as the key name the
  page maps. TL-1 then passed on every screen.
- **Suggestion.** Document that Silk keeps the D-pad, Select, Back and Menu, and say which path gives a
  page the remote. Better: a page-level opt-in that hands the keys to a page that asks.

### FL-2. Silk fullscreen paints only the top of one screen (medium)

- **Task.** Show the learner-choice screen in Silk fullscreen.
- **Actual.** Only the top 290 px painted, though the cards were laid out. Windowed it paints. Silk
  also shows a toast on entering fullscreen, which lands in captures.
- **Workaround.** None in Silk. Not seen inside the WebView APK.
- **Suggestion.** Investigate partial paint in Silk fullscreen.

### FL-3. The stick's address moves (low)

- **Task.** Reach the stick with `adb connect` across sessions.
- **Actual.** The stick was at `10.0.0.142` on 2026-09-07 and at `10.0.0.139` on 2026-10-20.
- **Workaround.** Scan the /24 for port 5555. The Study Desk app does the same in the other direction:
  it searches its own /24 for the desk.
- **Suggestion.** Advertise the stick for adb over Wi-Fi by mDNS, and show the current IP on the
  Developer options screen.

### FL-4. adb on a Windows shell corrupts screencaps and reads success as failure (low)

- **Task.** Script build, deploy and capture against the stick from PowerShell.
- **Actual.** PowerShell's `>` mangles binary output, so the PNG is corrupt. adb writes progress to
  stderr even on success, which stops the script and flips `$?` on a zero exit.
- **Workaround.** `adb shell screencap` plus `adb pull`. The dev script judges adb by exit code alone.
- **Suggestion.** A short Windows note in the "connect with adb" guide.

### FL-5. The screensaver reclaimed an app the user was watching (medium)

- **Task.** Keep the telestrator's pen session alive during a review.
- **Actual.** Fire OS counted the untouched remote as idle, ran the screensaver mid-session, and the
  process was reclaimed with the session in it.
- **Workaround.** `FLAG_KEEP_SCREEN_ON`. `stick-app/` does the same.
- **Suggestion.** Say in the app guidelines that companion-device input is not activity, and that a
  phone-driven app must hold the screen on.

### FL-6. adb pairing: a secret has no comfortable way onto the stick (low, but the one adb step a family could not do)

- **Task.** Give the stick the desk's TV key once, so the desk accepts it as its TV.
- **Actual.** The key is 32 base64url characters. Typing it with the D-pad would take minutes and invite
  typos. Showing it on the TV is chicken-and-egg. A LAN route lets any client claim an address.
- **Workaround.** One `adb shell am start ... --es url '<desk TV link>'`, with quoting that keeps `?`
  and `&` away from the device shell. The key is held in memory and never written to the stick's prefs.
- **Suggestion.** A documented pattern, or a system service, for pairing a TV app with a companion
  phone: the phone scans a code the TV shows and hands the app a token.

### FL-7. A blank frame on every move between apps (medium)

- **Task.** Move the landing's light from one app to the next in the WebView.
- **Actual.** For 450-600 ms the stage was bare cream paper, which reads as white on a TV. Both worlds
  mount as new composited layers (large inline SVGs). The stick's GPU takes about half a second to
  raster them. The compositor runs the animation on time and paints the missing tiles with what is
  under them.
- **Workaround.** A cheap gradient backdrop of the arriving world's sky under the layers.
- **Suggestion.** Publish guidance on the raster cost of large SVG and composited layers, and on what
  shows when tiles are missing during an animation.

### FL-8. CSS drop-shadow on a composited layer costs the whole frame budget (high)

- **Task.** Run the landing at a steady frame rate in the WebView.
- **Actual.** 8.7 fps standing still. Each world layer's CSS `drop-shadow` on a `will-change` layer made
  the GPU blur about eight full-stage offscreen passes per frame. A shadow on a group with one moving child goes back on the per-frame path. SVG `feDropShadow` gave 15 fps.
- **Workaround.** Cast the shadows inside the drawing, one per object, so they raster once. Idle went
  from 8.7 to 59 fps, and the look stayed within 45-46 dB PSNR.
- **Suggestion.** A "costly on Fire TV" list for web content, and a trace flag for per-frame offscreen
  passes.

### FL-9. gfxinfo's janky % does not fit WebView frames (low)

- **Task.** Use `dumpsys gfxinfo` to judge whether a screen is smooth.
- **Actual.** gfxinfo times the app's draw functor against its own deadline. Most functor frames miss it
  even at 60 fps. Math Buddy's idle home ran at 60 fps and 43 % janky.
- **Workaround.** Count `DrawFn_DrawGL` on the app's RenderThread in a DevTools trace, and score a 1.2 s
  window after each key.
- **Suggestion.** Document how to read gfxinfo for a WebView app, or report WebView frames in their own
  row.

### FL-10. The GPU tile budget under CSS `scale()` (medium)

- **Task.** Shorten the stall at the start of each module switch.
- **Steps.** The stage is a 1920 px page fitted to the window with `scale(.5)`. Take tile-memory
  snapshots while the light moves.
- **Actual.** A composited layer is rastered at contents scale 1 or more. Under `scale(.5)` every layer
  was rastered at four times its pixels. The sky layer held 49 MB of tiles and the landing 107 MB at
  rest, against the WebView's 80 MB soft and 160 MB hard budget. During a move the tiles ran out, the
  arriving world showed part-rastered, and it was rastered again 0.72 s later. That was a second
  0.6-0.8 s freeze.
- **Workaround.** Fit the stage with `zoom` instead. Landing tiles went from 107 to 71 MB and the second
  freeze went away. The price is slightly different text antialiasing. Pre-rendering each world's sky,
  hills and cliffs once into canvases then cut a lamp move's longest frame gap from 641-669 ms to
  271-283 ms, and Back's from 500-572 ms to 228-378 ms. The bitmaps cost about 46 MB more GPU memory.
  Also: `devicePixelRatio` reads 4 on a 960 x 540 CSS viewport, and a DevTools device-metrics override
  was ignored.
- **Suggestion.** Publish the tile budget a Fire TV WebView gets, and a recommended way to fit a fixed
  1920 x 1080 stage to the window that does not raster at four times.

### FL-11. Which stick runs an APK, and what Vega allows, is hard to find out (medium)

- **Task.** Choose hardware and an architecture that will still run the app.
- **Actual.** The Fire TV Stick 4K Select and the 2026 Stick HD ship Vega OS and will not run an APK.
  Amazon does not print the OS on the box. Vega has no sideloading. Its docs are silent on whether an
  app may open a listening TCP or WebSocket socket.
- **Workaround.** Buy a 4K Plus or 4K Max class stick (Fire OS 8). Put the transport behind an
  interface with an outbound relay.
- **Suggestion.** Show the OS on each device's product page, and state in the Vega docs whether an app
  can accept inbound LAN connections.

---

## 4. Open Source mini-challenge

**Field: Repository URL.** https://github.com/xkazm04/firetv-key-bridge

**Field: GitHub username.** xkazm04

**Field: Main project repository (if asked).** https://github.com/xkazm04/firetv

(open-source.md lists the key-bridge URL as both "Contribution URL" and "Standalone key-bridge
repository". The main repository is https://github.com/xkazm04/firetv.)

**Field: What did you contribute?**

`firetv-key-bridge` is a public, MIT-licensed, standalone extraction of the Study Desk key bridge. It
wraps a LAN web page in a fullscreen WebView on Fire OS. It hands the page the remote's keys (D-pad,
Select, Back, Menu, Play/Pause) as standard key events. Back goes to the page first. A held Back leaves
the app. It has 24 unit tests. The extraction has not yet been tested on the device. The on-device proof is for `stick-app/` in
the main repository. Also in the main repository: `tools/stick-perf/`, a probe that scores a page's
transitions on the stick frame by frame from a DevTools trace, and `tools/stick-walk/`, a scripted walk
of the TV with remote key events and screencaps.

**Field: How did you build it?**

The bridge maps each Android key code to the name a web page already handles. It dispatches a `keydown`
and a `keyup`, and reads `defaultPrevented` back. The key mapping and the address rules are plain JVM
code with JUnit tests. Every on-device claim is recorded with its method and captures in the repo's
`docs/concepts/STICK-*.md` files.

**Field: Why does it matter?**

Silk passes only Play/Pause to a web page, so a web-first TV app cannot be driven by the remote in the
browser. The wrapper and the measuring tools are what it took to make one work on a real stick. They
apply to any web app on Fire TV, not only this one. The friction log and the feature requests are
written so the next builder does not have to rediscover this.

**Licence note.** The main repository has an MIT `LICENSE`. GitHub detects it: on 2026-10-22,
`gh api repos/xkazm04/firetv/license` returned `MIT`. `firetv-key-bridge` is public and also reports MIT.

---

## 5. Did this project exist before the hackathon?

**Field: Existed before.**

No. First commit 2026-09-06.

Verified with `git log --reverse | head -1`: commit 273f4f1f, dated 2026-09-06. The Study Desk's first
commit under `desk/` is 2026-09-07. `stick-app/` starts 2026-10-20. README.md in this folder states the
submission window opened on 2026-08-31. The repo holds no commit dated before the window.
