# Friction log

Real friction met while building Study Desk (and the telestrator before it) for the Fire TV Stick.
Every entry cites the doc or commit that recorded it at the time. Nothing here is reconstructed from
memory; a candidate the repository does not evidence was dropped. Severity: **high** blocked the
product until worked around, **medium** cost a day or a visible defect, **low** cost time.

The device in every entry is a Fire TV Stick 4K, model AFTKM, Fire OS 8 (Android 11), on the home
Wi-Fi, reached with `adb connect <ip>:5555` ([POC-FINDINGS.md](../POC-FINDINGS.md), section 7).

---

## FL-1. Silk passes only Play/Pause to a web page

- **Task.** Drive the Study Desk TV page, a web page, with the Fire TV remote in Silk.
- **Steps.** Open `http://<desk>/tv?key=…` in Silk 152.5.31 on the stick. Press each remote button
  (sent with `adb shell input keyevent`), windowed and in fullscreen, with the stage focused.
- **Expected.** The page receives the key values Amazon's Fire TV web-app docs give for a page in a
  web app or a WebView wrapper: Select 13, arrows 37-40, Play/Pause 179, Back 4.
- **Actual.** Only Play/Pause reaches the page (`keyCode 179`). The D-pad moves Silk's own cursor,
  Select clicks under it, Back is Silk's history and then "Exiting Amazon Silk" (in fullscreen it
  leaves fullscreen), Menu opens Silk's menu. Rewind and fast-forward send nothing. "On this stick, in
  Silk, the remote cannot drive the TV at all beyond Play/Pause."
- **Severity.** High: the TV-led product could not be used with its remote.
- **Workaround.** A small WebView APK, `stick-app/`, whose activity forwards `dispatchKeyEvent` to the
  page as the key names the page already maps (commits 17a3a854, 56e9db4e, 59e7e00a). TL-1 then passed
  on every screen.
- **Suggestion.** Document, on the Silk and web-app pages, that Silk keeps the D-pad, Select, Back and
  Menu for its cursor and chrome, and say which path (a web app package or a WebView wrapper) gives a
  page the remote. Better: a page-level opt-in (a manifest field or meta tag) that hands the remote's
  keys to a page that asks for them.
- **Source.** [TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md](../concepts/TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md),
  "Stick pass 2026-10-20", "TL-1: the key values each remote button sends" (commit c730ce91); the fix
  in [STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md) (commit fa678440).

## FL-2. Silk fullscreen paints only the top of one screen

- **Task.** Show the learner-choice screen in Silk fullscreen.
- **Steps.** Enter fullscreen (`requestFullscreen` on the page's bench), open the learner screen.
- **Expected.** The screen paints in full, as it does windowed.
- **Actual.** Only the top 290 px painted, though the cards were laid out (their rects read right over
  DevTools). Windowed, it paints. Silk also shows a toast for a few seconds on entering fullscreen,
  which lands in captures.
- **Severity.** Medium. Not diagnosed.
- **Workaround.** None in Silk. Not seen inside the WebView APK: there "it paints in full, unlike Silk
  fullscreen (F13)".
- **Suggestion.** Investigate partial paint in Silk fullscreen, where the same page paints in full when
  windowed and inside a WebView.
- **Source.** [TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md](../concepts/TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md),
  walk row L1 and the open-findings row F13; [STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md),
  TL-1 row "Select (no learner)".

## FL-3. The stick's address moves, and nothing on the stick tells the computer

- **Task.** Reach the stick with `adb connect` across sessions.
- **Steps.** `adb connect <ip>:5555`, with the IP read from Settings → My Fire TV → About → Network.
- **Expected.** A stable way to find the stick on the LAN.
- **Actual.** The stick was at `10.0.0.142` on 2026-09-07 and at `10.0.0.139` on 2026-10-20.
- **Severity.** Low.
- **Workaround.** Scan the /24 for port 5555. The Study Desk app does the same in the other direction:
  it searches its own /24 for the desk (commit fe4cb34b).
- **Suggestion.** Advertise the stick for adb over Wi-Fi by mDNS when ADB debugging is on, and show the current IP on the Developer options screen itself.
- **Source.** [POC-FINDINGS.md](../POC-FINDINGS.md), section 7 (`.142`);
  [STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md), "Install and point it"
  (`.139`).

## FL-4. adb on a Windows shell corrupts screencaps and reads success as failure

- **Task.** Script the build, deploy and capture cycle against the stick from PowerShell.
- **Steps.** `adb exec-out screencap -p > x.png`; any adb call under `$ErrorActionPreference = 'Stop'`.
- **Expected.** A valid PNG; a zero exit treated as success.
- **Actual.** PowerShell's `>` mangles the binary output, so the PNG is corrupt. adb writes progress to
  stderr even when it succeeds, which stops the script, and `2>&1` makes each stderr line an error
  record in PowerShell 5.1, so `$?` goes false on a zero exit.
- **Severity.** Low.
- **Workaround.** `adb shell screencap -p /sdcard/x.png` and `adb pull`; `scripts/dev.ps1` wraps every
  adb call and judges it by the exit code alone.
- **Suggestion.** In the Fire TV "connect with adb" guide, a short Windows note: use `adb pull` for
  binary output, and do not treat adb's stderr as failure.
- **Source.** [POC-FINDINGS.md](../POC-FINDINGS.md), section 1, "Gotchas worth remembering".

## FL-5. The screensaver reclaimed an app the user was watching

- **Task.** Keep the telestrator's pen session alive during a play review.
- **Steps.** Leave the remote untouched while the phone draws on the TV.
- **Expected.** An app in the foreground with an active session keeps running.
- **Actual.** Fire OS counted the untouched remote as idle, ran the screensaver mid-session, and the
  process was reclaimed with the pen session in it.
- **Severity.** Medium.
- **Workaround.** `FLAG_KEEP_SCREEN_ON`, "the same promise any video player makes". `stick-app/` does the
  same ("The screen stays on").
- **Suggestion.** Say in the Fire TV app guidelines that input from a companion device does not count as
  activity, and that an app driven from a phone must hold the screen on.
- **Source.** [POC-FINDINGS.md](../POC-FINDINGS.md), section 7, finding 3;
  [STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md), "What was built".

## FL-6. A secret has no comfortable way onto the stick

- **Task.** Give the stick the desk's TV key once, so the desk accepts it as its TV.
- **Steps.** The key is 32 base64url characters. Options weighed: type it with the remote, show it on the
  TV, hand it out over the LAN, or send it over adb.
- **Expected.** A one-time, safe way to put a short secret on a TV app.
- **Actual.** Typing it with an on-screen keyboard and the D-pad "would take minutes and invite typos";
  showing it on the TV is chicken-and-egg; a LAN route lets any client claim an address. The chosen path
  is one `adb shell am start … --es url "'http://<desk>/tv?key=…'"`, with the quoting needed to keep `?`
  and `&` away from the device shell.
- **Severity.** Low for the operator, but it is the one adb step a family could not do.
- **Workaround.** The one-time adb intent; the key is held in memory and never written to the stick's
  prefs (commits fe4cb34b, 2b52eb44).
- **Suggestion.** A documented pattern, or a system service, for pairing a TV app with a companion
  phone (the phone scans a code the TV shows and hands the app a token), so a TV app need not invent one.
- **Source.** [STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md), "Provisioning the
  TV key: the choice" and "Install and point it", step 3.

## FL-7. A blank frame on every move between apps (GPU raster time)

- **Task.** Move the landing's light from one app to the next (Left/Right, Back, Select) in the WebView.
- **Steps.** `adb shell screenrecord` while pressing the keys; a script measures each frame's light share.
- **Expected.** The slide and fade show the leaving and the arriving world, as on a desktop browser.
- **Actual.** For 450-600 ms the stage was bare cream paper with only the app's name on it, which reads
  as white on a TV. Both worlds mount as new composited layers (large inline SVGs), the stick's GPU takes
  about half a second to raster them, and the compositor runs the animation on time and paints the
  missing tiles with what is under them.
- **Severity.** Medium: visible on every switch.
- **Workaround.** A cheap gradient backdrop of the arriving world's sky under the layers, so a missing
  tile shows sky, not paper (commit 6c7d24f6).
- **Suggestion.** Publish guidance for web content on the stick's GPU: the raster cost of large SVG and
  composited layers, and that missing tiles show the layer below during an animation.
- **Source.** [STICK-WHITE-FRAME-2026-10-20.md](../concepts/STICK-WHITE-FRAME-2026-10-20.md), "The cause"
  (commit 595b48f9).

## FL-8. CSS drop-shadow on a composited layer costs the whole frame budget

- **Task.** Run the landing at a steady frame rate in the WebView.
- **Steps.** Measure the idle landing with a DevTools trace over the WebView's devtools socket; switch
  one suspect off at a time.
- **Expected.** An idle page with a few small animations runs near 60 fps.
- **Actual.** 8.7 fps standing still. Each world layer's CSS `drop-shadow` on a `will-change` layer made
  the GPU blur about eight full-stage offscreen passes on every frame. A shadow on a group with one moving
  child goes back on the per-frame path; SVG `feDropShadow` was worse (15 fps).
- **Severity.** High: every transition ran at 6-7 fps.
- **Workaround.** Cast the shadows inside the drawing, one per object, so they raster once: idle
  8.7 → 59 fps, the look kept within 45-46 dB PSNR (commits c5dfc4cb, 9d5de46f, 51d960bf).
- **Suggestion.** A "costly on Fire TV" list for web content (filters on composited layers first), and
  a WebView setting or trace category that flags per-frame offscreen passes.
- **Source.** [STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md), "The ranked
  consumers" #1 and #3, "Tried and dropped" (commit f8ba80f6).

## FL-9. gfxinfo's janky % does not fit WebView frames

- **Task.** Use `dumpsys gfxinfo` to judge whether a screen is smooth.
- **Steps.** `dumpsys gfxinfo dev.studydesk.stick framestats` around each run.
- **Expected.** Janky % tracks visible jank.
- **Actual.** gfxinfo times the app's draw functor against its own deadline, and most functor frames
  miss it even at 60 fps: Math Buddy's idle home ran at 60 fps and 43 % janky.
- **Severity.** Low: it would have sent the work after the wrong screens.
- **Workaround.** Count `DrawFn_DrawGL` on the app's RenderThread in a DevTools trace and score a 1.2 s
  window after each key (`tools/stick-perf/`).
- **Suggestion.** Document how to read gfxinfo for a WebView app on Fire OS, or report WebView frames
  in their own row.
- **Source.** [STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md), "How it was
  measured".

## FL-10. The WebView's GPU tile budget under a CSS `scale()`

- **Task.** Shorten the stall at the start of each module switch.
- **Steps.** cc debug snapshots of tile memory while the light moves; the stage is a 1920 px page fitted
  to the window with `scale(.5)`.
- **Expected.** Each layer rastered at the size it is shown.
- **Actual.** A composited layer is rastered at contents scale 1 or more, so under `scale(.5)` every one
  was rastered at four times its pixels: the sky layer held 49 MB of tiles and the landing 107 MB at rest,
  against the WebView's 80 MB soft and 160 MB hard budget. During a move the tiles ran out
  (`had_enough_memory_to_schedule_tiles_needed_now: false`), the arriving world showed part-rastered, and
  the world was rastered again 0.72 s later: a second 0.6-0.8 s freeze. Fitting the stage with `zoom`
  instead cut the tiles to 71 MB and removed the second freeze, but changed every glyph's antialiasing
  (25.9-35.1 dB PSNR against main). Pass 2 first dropped it for that reason.
- **Severity.** Medium: it added a second freeze to each switch.
- **Workaround.** The zoom fit shipped. The operator restored it outright on 2026-10-21 (commit e9c62990):
  one lamp-move stall instead of two, landing tiles 107 to 71 MB, at the price of slightly different text
  antialiasing. Pass 3 then drew each world's sky, hills and side cliffs once into canvases, which took a
  lamp move's longest frame gap from 641-669 ms to 271-283 ms and Back from 500-572 ms to 228-378 ms; the
  bitmaps stay resident inside a module, about 46 MB more GPU memory than before (commits 7b07a9ba,
  19f57b30, cc2cbf01, 640a931f; [STICK-PERFORMANCE-2026-10-21.md](../concepts/STICK-PERFORMANCE-2026-10-21.md),
  "Pass 3: pre-rendered stills"). The page's `devicePixelRatio` reads 4 on a 960 × 540 CSS
  viewport, and the WebView ignored a DevTools device-metrics override, so whether that costs raster is
  also unsettled.
- **Suggestion.** Publish the tile budget a Fire TV WebView gets, and a recommended way to fit a fixed
  1920 × 1080 stage to the window that does not raster at four times.
- **Source.** [STICK-PERFORMANCE-2026-10-21.md](../concepts/STICK-PERFORMANCE-2026-10-21.md) (pass 2, commit
  f9a6da99; pass 3) and commits e9c62990, 7b07a9ba, 19f57b30, cc2cbf01, 640a931f; the `devicePixelRatio` finding is in [STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md),
  "Tried and dropped".

## FL-11. Which stick runs an APK, and what Vega allows, is hard to find out

- **Task.** Choose hardware and an architecture that will still run the app.
- **Steps.** Read Amazon's statements and the Vega docs (2026-09-06).
- **Expected.** The OS printed with the model, and Vega's networking limits documented.
- **Actual.** The Fire TV Stick 4K Select and the 2026 Stick HD ship Vega OS and will not run an APK;
  "Amazon does not print the OS on the box". Vega has no sideloading, and its docs are silent on whether an
  app may open a listening TCP or WebSocket socket, which the telestrator's design (a server inside the TV
  app) depends on.
- **Severity.** Medium: it shaped the architecture.
- **Workaround.** Buy a 4K Plus or 4K Max class stick (Fire OS 8); put the transport behind an interface
  with an outbound relay, proven with nothing listening on the device.
- **Suggestion.** Show the OS (Fire OS or Vega) on each device's product page and spec sheet, and state in
  the Vega docs whether an app can accept inbound LAN connections.
- **Source.** [PLATFORM-RISK.md](../PLATFORM-RISK.md), "What nobody could confirm" and "Decisions this
  changes" 2 and 3.
