# Product feedback

One section per Amazon product or tool the repository shows was used. Amazon Devices Builder Tools are
not listed: nothing in the repository shows they were used. Each point cites the doc or commit it comes
from; the friction behind "what needs work" is told in full in [friction-log.md](friction-log.md).

---

## Fire OS

- **Used for.** The platform for both TV apps: `stick-app/` (Study Desk) and `tv-app/` (the telestrator),
  `minSdk 28` (Fire OS 7 = API 28, Fire OS 8 = API 30) ([POC-FINDINGS.md](../POC-FINDINGS.md), section 2;
  commit 17a3a854).
- **Worked well.** A plain Android app with the `LEANBACK_LAUNCHER` category and a banner installs and
  launches from the Fire TV launcher with no ABI issue, and hardware video decode works
  (`HW.omx.video.avc`) ([POC-FINDINGS.md](../POC-FINDINGS.md), section 7). Remote keys reach
  `dispatchKeyEvent` as ordinary Android key events, so the key bridge is a small table with JVM tests
  (`stick-app/src/test/.../KeyBridgeTest.kt`; [STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md)).
  The system's long press on Back (`FLAG_LONG_PRESS`) gives a clean "leave the app" gesture (commit 59e7e00a).
- **Needs work.** The screensaver reclaimed an app that was being watched and driven from a phone
  ([FL-5](friction-log.md#fl-5-the-screensaver-reclaimed-an-app-the-user-was-watching)). Which devices run
  Fire OS and which run Vega is hard to tell before buying
  ([FL-11](friction-log.md#fl-11-which-stick-runs-an-apk-and-what-vega-allows-is-hard-to-find-out)).
- **Onboarding.** Standard Android tooling was enough: the same AGP and Kotlin toolchain as any Android
  app. The first gotchas were local, not Fire OS ones (`local.properties` backslashes, PowerShell and adb)
  ([POC-FINDINGS.md](../POC-FINDINGS.md), section 1).
- **Would build again.** Yes. The 2026-09-06 platform review chose Fire OS for this build and kept the
  transport portable as a hedge ([PLATFORM-RISK.md](../PLATFORM-RISK.md), "Decisions this changes").

## Fire TV Stick 4K (AFTKM)

- **Used for.** The one test device for every stick walk and measurement: model AFTKM, codename `karat`,
  Fire OS 8.0 (Android 11) ([POC-FINDINGS.md](../POC-FINDINGS.md), section 7).
- **Worked well.** Fully usable over Wi-Fi with no cable at any point. The telestrator's live UI test passed
  27 of 27 on it and its overlay drew faster than on the emulator (p50 0.084 ms)
  ([POC-FINDINGS.md](../POC-FINDINGS.md), section 7). After the fixes the Study Desk landing runs at 59 fps
  idle ([STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md)).
- **Needs work.** Web content is GPU-bound: rastering large SVG layers takes about half a second, CSS
  filters on composited layers are very costly, and the WebView's tile budget is reached under a CSS
  `scale()` ([FL-7](friction-log.md#fl-7-a-blank-frame-on-every-move-between-apps-gpu-raster-time),
  [FL-8](friction-log.md#fl-8-css-drop-shadow-on-a-composited-layer-costs-the-whole-frame-budget),
  [FL-10](friction-log.md#fl-10-the-webviews-gpu-tile-budget-under-a-css-scale)). None of this shows on a
  desktop browser, so the only honest meter was the device.
- **Onboarding.** Settings → My Fire TV → Developer options → ADB debugging, then `adb connect` to the IP
  under About → Network ([STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md),
  "Install and point it"). The address moved between sessions
  ([FL-3](friction-log.md#fl-3-the-sticks-address-moves-and-nothing-on-the-stick-tells-the-computer)).
- **Would build again.** Yes, and on a stick of this class (Fire OS, not Vega)
  ([PLATFORM-RISK.md](../PLATFORM-RISK.md), decision 2).

## adb (against Fire OS)

- **Used for.** Install (`adb install -r`), launching with extras (`am start --es url`), every key of every
  stick walk (`adb shell input keyevent`, `--longpress BACK`), screencaps and screen recordings, logcat,
  `dumpsys gfxinfo`, `adb reverse` for temporary desks, and `adb forward` to the WebView's and Silk's
  DevTools sockets ([STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md);
  [STICK-WHITE-FRAME-2026-10-20.md](../concepts/STICK-WHITE-FRAME-2026-10-20.md);
  [STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md)).
- **Worked well.** `input keyevent` enters the stick's input pipeline the same way a remote button does,
  so the walks could be scripted and repeated (`tools/stick-walk/`, commit e4176983); a key the page
  ignores was checked to cost nothing (57.8 vs 59.3 fps)
  ([STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md), "How it was measured").
  `screenrecord` writes one frame per composited frame, which is what caught a one-vsync blank
  ([STICK-WHITE-FRAME-2026-10-20.md](../concepts/STICK-WHITE-FRAME-2026-10-20.md)). `adb reverse` let a
  temporary desk serve the stick with no firewall change.
- **Needs work.** On a Windows shell, binary output and stderr handling
  ([FL-4](friction-log.md#fl-4-adb-on-a-windows-shell-corrupts-screencaps-and-reads-success-as-failure)).
  Linking the stick to its desk still needs one adb command
  ([FL-6](friction-log.md#fl-6-a-secret-has-no-comfortable-way-onto-the-stick)).
- **Onboarding.** Quick: `adb connect <ip>:5555` over Wi-Fi was enough from day two
  ([POC-FINDINGS.md](../POC-FINDINGS.md), section 7).
- **Would build again.** Yes. It was the backbone of every on-device proof.

## Silk

- **Used for.** The first run of the TV-led flows on the real stick (Silk 152.5.31), loading the desk's TV
  page, with keys driven over Silk's DevTools socket (`localabstract:amazon_silk_devtools_remote`)
  ([TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md](../concepts/TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md),
  "Stick pass 2026-10-20").
- **Worked well.** The page rendered with the stick's own fonts, layout and timing, and Play/Pause reached
  it with the documented `keyCode 179`. The DevTools socket made a full walk possible before any APK existed.
- **Needs work.** Only Play/Pause reaches a page; the D-pad, Select, Back and Menu stay with Silk
  ([FL-1](friction-log.md#fl-1-silk-passes-only-playpause-to-a-web-page)). One screen painted only its top
  290 px in fullscreen ([FL-2](friction-log.md#fl-2-silk-fullscreen-paints-only-the-top-of-one-screen)).
- **Onboarding.** Opening a LAN URL is easy; learning that the remote will not reach the page took a
  full walk.
- **Would build again.** For viewing, yes. For a remote-driven web app, no: the WebView wrapper replaced it.

## Amazon WebView on Fire OS (Amazon WebView 150)

- **Used for.** The whole Study Desk TV surface: `stick-app/`'s one fullscreen WebView with JavaScript,
  DOM storage, media without a gesture and cleartext http to the LAN desk
  ([STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md), "What was built").
- **Worked well.** Keys dispatched into the page arrive with the names the page maps, and
  `defaultPrevented` comes back, so the app knows when the page took Back. The desk's httpOnly cookie set
  in the WebView reaches the app's own native probe, which tells "this stick is the desk's TV" from
  "a guest" ([STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md), "The TV-session
  half"). Its DevTools socket (`webview_devtools_remote_<pid>`) gave full traces, which is how every
  frame cost was ranked ([STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md)).
- **Needs work.** A WebView cannot go fullscreen without a gesture, so the app injects a stylesheet to
  hide the page's operator bar ([STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md),
  "The stage alone"). GPU raster cost, the tile budget and gfxinfo's reading of WebView frames
  ([FL-7](friction-log.md#fl-7-a-blank-frame-on-every-move-between-apps-gpu-raster-time) to
  [FL-10](friction-log.md#fl-10-the-webviews-gpu-tile-budget-under-a-css-scale)). `devicePixelRatio`
  reads 4 on a 960 × 540 CSS viewport and a DevTools device-metrics override was ignored
  ([STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md), "Tried and dropped").
- **Onboarding.** A first working wrapper took one day: built, walked and passing TL-1 on 2026-10-20
  (commits 17a3a854 to fa678440).
- **Would build again.** Yes. It turned a web prototype into a remote-driven Fire TV app with no
  dependency beyond the platform.

## Fire TV and Vega developer documentation

- **Used for.** The remote's key values for web content (Select 13, arrows 37-40, Play/Pause 179, Back 4)
  ([TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md](../concepts/TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md),
  TL-1 table), and the platform review of Fire OS against Vega ([PLATFORM-RISK.md](../PLATFORM-RISK.md)).
- **Worked well.** The key values were right for the WebView: the bridge maps to exactly them.
- **Needs work.** Silk's handling of those keys is not stated where the values are
  ([FL-1](friction-log.md#fl-1-silk-passes-only-playpause-to-a-web-page)); Vega's inbound sockets are
  undocumented ([FL-11](friction-log.md#fl-11-which-stick-runs-an-apk-and-what-vega-allows-is-hard-to-find-out)).
- **Onboarding.** The docs were enough to start; the gaps above were found on the device.
- **Would build again.** Yes.
