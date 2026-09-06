# PoC findings — Fire TV Telestrator on Windows

**Date:** 2026-09-06
**Question asked:** can we run every dependency on this Windows machine, write Fire TV-compatible
code, and get a development cycle that ends in a live UI test — or do we hit a blocker and drop the
project?

**Verdict: no blocker. Go.** Every layer of the P0 slice built, deployed and ran, and the inner
loop needs no human looking at a screen.

---

## 1. Toolchain on this machine

Nothing had to be installed except one Android TV system image. Everything else was already here.

| Need | Found | Note |
|---|---|---|
| JDK 17 | `C:\Program Files\Android\Android Studio\jbr` (17.0.7) | System `java` is Zulu 22, which AGP rejects. Gradle is pinned to the Studio JBR via `org.gradle.java.home`. |
| Gradle | 8.14 (wrapper generated from the cached distribution) | |
| AGP / Kotlin | 8.7.3 / 2.0.21 | |
| Android SDK | scoop `android-clt`, platforms 31/34/36, build-tools 34/35/36 | `ANDROID_HOME` already set. |
| Emulator | present, **WHPX hardware acceleration usable** | This was the main risk on Windows 11 Home; it is fine. |
| Android TV image | installed `system-images;android-34;android-tv;x86` | The only download needed (~1 min). |
| Node / ffmpeg / Python | 20.x / 7.x / 3.12 | ffmpeg generated the fixture clip. |

**Gotchas worth remembering** (both cost time, both are one-liners):

- `gradle.properties` and `local.properties` are Java properties files: backslashes are escape
  characters. `sdk.dir=C:\Users\...` silently resolves to `C:Userskazda...` and fails with
  "The filename, directory name, or volume label syntax is incorrect". Use forward slashes.
- PowerShell's `>` mangles binary output, so `adb exec-out screencap -p > x.png` produces a corrupt
  file. Use `adb shell screencap -p /sdcard/x.png` + `adb pull`.
- `adb` writes progress to stderr even when it succeeds. With `$ErrorActionPreference = 'Stop'`
  that terminates the script, and `2>&1` makes it worse in PowerShell 5.1 (each stderr line comes
  back as an ErrorRecord and `$?` goes false on a zero exit). `dev.ps1` wraps every adb call and
  judges it by the exit code alone.

### AVD used

`firetv_poc`: Android TV API 34, x86, `tv_1080p` profile, trimmed to **2 GB RAM / 256 MB heap** to
approximate a Fire TV Stick 4K rather than a comfortable desktop.

---

## 2. Fire TV compatibility signals

These are proxies, not proof (see §5), but each one is a thing that would have broken early:

- The app launches through `android.intent.category.LEANBACK_LAUNCHER` via `monkey`, i.e. the way a
  Fire TV launcher starts it, not by explicit component.
- `pm list features` reports `android.software.leanback` and `leanback_only`; the device model is
  `AOSP TV on x86`.
- Manifest carries `touchscreen required=false`, the leanback category, and the Fire TV
  `com.amazon.input.cursor` pointer hint.
- `minSdk 28` compiles and runs (Fire OS 7 = API 28, Fire OS 8 = API 30).
- D-pad and media keys reach the app: the live test clears the canvas and seeks using
  `adb shell input keyevent KEYCODE_DPAD_*`, which is also how the remote will drive it.
- Media3 1.4.1 reports `[emulator_x86_arm, AOSP TV on x86, Google, 34]` and plays the clip
  full-screen with the Compose overlay composited on top.

## 3. Development cycle

`scripts/dev.ps1` runs five stages, ordered so the cheapest thing fails first.

| Stage | What it proves | Cost |
|---|---|---|
| `unit` | 13 JVM tests over the annotation schema, timeline, letterbox mapping, pen engine, wire codec | ~6 s, no device |
| `build` | APK assembles | ~2 s incremental, ~60 s cold |
| `boot` | emulator up and booted | ~15 s from the AVD snapshot, skipped when already running |
| `deploy` | install, leanback launch, port forward, health check | ~10 s |
| `live` | 12 assertions, real browser → real TV → real pixels | ~20 s |

**End to end with the emulator shut down first: 45 s, one command, no human in the loop.**

The `live` stage is the one that matters. It drives the actual companion page the TV serves, in
Chromium, with CDP-dispatched **touch** events — not synthetic WebSocket messages — and then
asserts on a framebuffer capture pulled off the device:

```
12/12 checks passed
  TV reachable and canvas cleared via D-pad
  PWA loaded from the TV and paired over ws://
  TV sees the phone connected                        (pens=1)
  pen surface adopts the video aspect                (pad aspect 1.7778)
  phone transport control toggles TV playback        (paused false -> true)
  TV is paused for telestration
  touch drawing arrives on the TV as an annotation   (ink=1)
  stroke is rendered in the TV framebuffer           (ink px 2769 -> 21086)
  seeking past the hold window hides the drawing     (ink px 21086 -> 2882)
  seeking back onto the frame restores the drawing   (ink px 21086)
  arrow tool commits a second annotation             (ink=2)
  no uncaught errors on the phone page
```

Ink is counted by matching the pen hue `#FFD400` while excluding the pairing card and status bar,
so the fixture clip's own saturated yellow bars do not register. Screenshots and a JSON result land
in `artifacts/`.

This satisfies design doc D7: **no manual review in the inner loop.**

## 4. The one real finding

The first latency run failed, and the failure was worth having.

Under a pen streaming 8 points every 16 ms, the phone→TV round trip was:

| | p50 | p95 | max |
|---|---|---|---|
| idle socket (baseline) | 6.6 ms | 11.9 ms | 16.1 ms |
| **under 60 Hz pen load, first attempt** | 18.4 ms | **50.5 ms** | **115.1 ms** |
| under 60 Hz pen load, after the fix | 7.8 ms | 12.8 ms | 26.5 ms |

The baseline run proves the tail was not the `adb forward` tunnel — it was backpressure the app
created for itself. Two causes, both the design doc's own §3.2 warning arriving early:

1. The in-progress stroke was rebuilt immutably on every incoming batch
   (`stroke.copy(points = points + new)`), which is O(points) per message and quadratic over a
   gesture, with matching allocation churn on a 256 MB heap.
2. Every message republished the annotation document, so Compose recomposed and the overlay
   redrew once per *message* on a device that only draws 60 frames a second.

Fixed by accumulating live points in place and publishing at most one document snapshot per frame
(`Session.publishIfDirty()`, called from the player's frame loop). The tail collapsed to idle
levels.

**What this means for the full project:** the design doc's "retained Path, no recomposition per
point" note is not a polish item for week 6 — it is load-bearing, and it should be built that way
from the first commit. The good news is that the fix is small and the harness caught it
automatically.

### Other measurements

- **Memory:** 114 MB PSS with the player, overlay, web server and a connected pen. Design doc
  target is under 300 MB. Comfortable.
- **APK:** 40.9 MB debug, of which ~7 MB is the embedded fixture clip.

## 5. What the PoC does not prove

Honest limits, all of which stay on the risk list:

- **Not real hardware.** An x86 Android TV API 34 emulator is not a Fire OS 7/8 ARM stick. Video
  decode, GPU behaviour, memory pressure and remote quirks all need a real Stick. The design doc
  already schedules weekly device smoke tests; keep that.
- **Not a real network.** `adb forward` over loopback is not Wi-Fi. The 12.8 ms p95 is a floor,
  not the LAN number. The pen budget still needs measuring phone-to-Stick on real Wi-Fi.
- **Not full latency.** The probe answers on the receive path, so it measures transport plus
  decode. Compositor-to-photons needs on-device render instrumentation (design doc §6.2).
- **Not real footage.** The fixture is an ffmpeg `testsrc2` pattern, deliberately: it makes pixel
  assertions deterministic and avoids any copyright question. Real sports footage will exercise
  decode paths this does not.
- **P1 and P2 untouched.** No Rekognition, no Bedrock, no tracking pipeline, no voice, no name-tag
  snapping. Those are separate risks — cost, model quality, occlusion handling — that this PoC says
  nothing about.
- **No cloud relay.** Only the LAN path exists.

## 6. Recommendation

Proceed to the full design doc scope. The platform bet (D1 native Kotlin/Compose/Media3), the input
bet (D2 phone PWA), the transport bet (D3 LAN WebSocket served by the TV) and the test bet (D7
platform-independent core plus automated UI verification) all held up on the first attempt on this
machine.

Before anything else in week 1, do two things this PoC could not:

1. Put the APK on a real Fire TV Stick and re-run `pen-sim.mjs` and `latency-probe.mjs` over Wi-Fi.
   If the LAN numbers are bad, the relay fallback moves up the priority list.
2. Build the overlay renderer around a retained `Path` from the start, per §4.

If the Stick run is clean, the remaining risk in the project is concentrated in P1/P2 — tracking
quality and model grounding — not in the foundation.
