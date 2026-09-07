# PoC findings — Fire TV Telestrator on Windows

**Date:** 2026-09-06 · **hardware run added 2026-09-07** (§7)
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
| `unit` | 46 JVM tests over the annotation schema, timeline, letterbox mapping, pen engine, smoothing, hit-testing, undo history, wire codec | ~6 s, no device |
| `build` | APK assembles | ~2 s incremental, ~60 s cold |
| `boot` | emulator up and booted | ~15 s from the AVD snapshot, skipped when already running |
| `deploy` | install, leanback launch, port forward, health check | ~10 s |
| `live` | 27 assertions, real browser → real TV → real pixels | ~60 s |

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

- **Memory:** 143 MB PSS with the player, overlay, web server, frame thumbnailer and a connected
  pen. Design doc target is under 300 MB. Comfortable.
- **Overlay draw:** p50 0.05 ms, p95 2.7 ms against the design doc's 4 ms budget, measured on
  device via `RenderStats` and asserted in the live test. The max sample (~31 ms) is the first
  frame after a layout change, not steady state.
- **APK:** 40.9 MB debug, of which ~7 MB is the embedded fixture clip.

### After the pen tools landed

Re-measured with smoothing, pressure width, the eraser, thumbnails and document mirroring all in
place: pen round-trip p50 9.4 ms / p95 14.8 ms under the same 60 Hz load (was 7.8 / 12.8 before
those features). Still comfortably inside budget, and the regression is small enough to attribute
to the added traffic rather than to a structural problem.

## 5. What the PoC does not prove

Honest limits, all of which stay on the risk list:

- ~~**Not real hardware.**~~ **Answered 2026-09-07 — see §7.** It mattered: the Stick found three
  bugs the emulator could not, one of them a hard crash.
- ~~**Not a real network.**~~ **Answered 2026-09-07 — see §7.** The 12.8 ms p95 was indeed a floor,
  and the gap it hid was not the network's.
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


---

## 7. The hardware run — 2026-09-07

**Device:** Fire TV Stick 4K, model `AFTKM`, codename `karat`, **Fire OS 8.0** (Android 11), ARM.
Reached over Wi-Fi with `adb connect 10.0.0.142:5555`; no cable between the PC and the Stick at
any point. `./scripts/dev.ps1 -Device <ip>` runs the whole cycle against it.

**Deliberately not tunnelled.** `adb forward` would have worked and would have silently destroyed
the measurement, because every tool would then reach the TV over loopback instead of the Wi-Fi
under test. On hardware the tools address the Stick directly.

### What carried over unchanged

Everything the emulator proved, plus one thing it could not:

| | Result |
|---|---|
| APK installs and launches via the leanback intent | ✅ no ABI issue; the app has no native code |
| **Hardware video decode** | ✅ `MediaCodecLogger: HW.omx.video.avc` — the emulator never proved this |
| Compose overlay render | ✅ p50 **0.084 ms**, *faster* than the emulator |
| Embedded Ktor server over real Wi-Fi | ✅ `http://10.0.0.142:8765/health` answers directly |
| Live UI test | ✅ **27/27**, same assertions, real Wi-Fi |

### The finding: a latency tail only real hardware shows

| Condition | p50 | p95 | max |
|---|---|---|---|
| Emulator + adb tunnel, loaded | 9.4 ms | 14.8 ms | — |
| Stick over Wi-Fi, **idle** | 12.2 ms | 17.6 ms | 21.4 ms |
| Stick over Wi-Fi, **under pen load** | 14.7–19.0 ms | **212–730 ms** | **901 ms** |

The median was fine throughout. The tail was not, and it grew without bound for as long as a
stroke continued — 2.7 s after 20 s of drawing, with probes dropped outright.

**Two plausible causes were wrong, and measuring is what caught them.** Wi-Fi power save and
per-connection head-of-line blocking were both the obvious reads, and a `WifiLock` plus
`TCP_NODELAY` would have been pure wasted work.

`tools/tail-diag.mjs` settled it by measuring two paths at once: our pen socket, and TCP connects
to `adbd` — a different process on the same device over the same Wi-Fi. Across four runs, **0 of
48, 0 of 26 and 0 of 65 app stalls coincided with a network stall**, while `adbd` held p95 ≈ 12 ms
throughout. Not the radio, not power save, not the link. Ours.

The third guess was wrong too: the paused-mode document mirror looked like an obvious flood, but
an A/B put *playing* 5–70× worse than *paused*, which is the opposite of what that theory predicts.
The difference between those two states is the frame loop, and that is where the cost was.

### Three bugs, and what each one says

**1. The overlay refitted every stroke on every frame.** `drawStroke` decimated the whole point
list, fitted a spline through all of it, then issued **one `drawPath` per segment** — quadratic
work and thousands of draw calls per frame. Measured at **150% CPU** (`perfmonitord`) and a 12 ms
overlay draw against a 4 ms budget, with the receive loop competing for the same cores. An x86
emulator absorbed it; ARM did not.

Geometry is now built once: points decimate as they arrive, each span is fitted exactly once when
the point after next settles it, and segments append to one retained `Path` per pressure bucket.

This is the same lesson as §4, arriving a second time and harder. §4 said the design doc's
"retained `Path`, no recomposition per point" is load-bearing rather than polish. It was right,
and *the fix in §4 was only half of it* — §4 stopped rebuilding the document per message, but left
the renderer refitting the geometry per frame. **Treat §3.2 of the design doc as a constraint on
every layer that touches a growing stroke, not as one bug to be fixed once.**

**2. The app died outright if port 8765 was taken.** Ktor binds inside its own accept coroutine, so
the `BindException` never comes back out of `start()` — it reaches the thread's uncaught handler and
takes the process with it, which Fire OS reports only as "Unable to start activity". The common
trigger is our own previous process still letting go of the port, so this fired repeatedly during
development and contaminated several measurements before it was recognised.

`LanTransport` now checks the port by binding it, owns the engine's parent coroutine context so
its failures are handleable, and retries ten times. What survives that is red text on the pairing
card, not a dead app. Verified by stealing the port on-device with `adb reverse tcp:8765 tcp:9999`.

**3. Fire OS ran the screensaver mid-session.** A telestrator is watched, not touched: the remote
can sit untouched through a whole play review, Fire OS calls that idle, and the process is
reclaimed with the pen session inside it. `FLAG_KEEP_SCREEN_ON` — the same promise any video
player makes.

### After the fixes, same probe, same load

| | before | after |
|---|---|---|
| pen round-trip p95 | 212–730 ms | **21.1 ms** ✅ |
| pen round-trip max | 901 ms | **23.5 ms** |
| dropped probes | up to 106 | **0** |
| overlay draw p95 | 11–13 ms | **0.05–1.3 ms** |
| overlay cost vs stroke length | grew without bound | flat |

`latency-probe.mjs` **PASSes** its 25 ms gate on real hardware over real Wi-Fi, and one command
takes the whole cycle to 27/27.

### One harness bug worth naming

`live-ui-test.mjs` seeks +10 s and then −10 s from wherever the playhead happened to be, which
only stays inside the 20 s looping fixture if the drawing is made near its middle. It inherited
the clip position — invisible on an emulator that starts from a fresh install every run,
intermittent on a Stick that keeps playing between them. It cost two checks once, and looked
exactly like a regression in the renderer rewrite that had just landed. The playhead is now
anchored before drawing.

**The general lesson:** a test that inherits state from a long-lived device is a test that will
eventually accuse the wrong change. Every check that depends on where the clip is should say so.

### Still open

- One process death (`died: fg TOP`, no Java exception) from before the fixes is unexplained. It
  may simply have been bug 2 and has not recurred since.
- The relay path has not been exercised on hardware. `tools/relay-test.mjs` now resolves this
  machine's LAN address for the Stick to dial back to, but the run itself is untried and a
  Windows Firewall prompt is the likely first obstacle.
- Real footage, cloud relay latency, and everything in P1/P2 remain untouched.
