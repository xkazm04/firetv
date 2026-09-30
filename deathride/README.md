# Death Ride ? Slipstream

A standalone Kotlin/libGDX Fire TV spike. See `../index.html` for the evidence and verdict. The application owns the entire race; phones send only absolute input states. There are always six cars, at most two phone drivers, and three laps. There is no combat, audio, garage or downloaded game art.

## Build and launch

Prerequisites: Java 17 or newer, Android SDK platform 36 and build tools (the build selected 34.0.0), `ANDROID_HOME`, and network access for the first Gradle dependency resolution. Gradle 8.14 is wrapped. Java/Kotlin bytecode targets 17. Java 17 and the supplied Java 22 were checked for Apex; do not infer an Android runtime launch from a successful build.

From this directory in PowerShell:

```powershell
.\gradlew.bat :app:assembleDebug '-PappId=dev.deathride.slipstream' '-PappLabel=Death Ride Slipstream'
.\gradlew.bat :core:test
.\gradlew.bat :link:test
.\gradlew.bat :desktop:run
```

The default properties are `dev.deathride.tv` and `Death Ride`. Both override properties are optional. Output: `app/build/outputs/apk/debug/app-debug.apk`. The host's equivalent cmd.exe contract is `gradlew.bat :app:assembleDebug -PappId=<id> -PappLabel="<label>"`. Quote the entire `-P...` argument in PowerShell, especially IDs with periods and labels with spaces.

Transfer `../deathride.apk` to the Stick using your existing Wi-Fi file-transfer/sideload tool. Open the APK with its package installer, permit installation for that tool if requested, and launch it from Apps. No device installation was performed during development. No device bridge or emulator was used.

## Drive

Put the TV and Android phone on the same LAN. The lobby runs an AI demonstration and shows a QR, URL, PIN, and two seat indicators. Scan the QR; the PIN travels in its URL. Alternatively open the displayed address and enter the PIN. Turn the phone sideways. Hold GO, steer with the left thumb, and use BRAKE to slow. Touch anywhere on the left pad, then drag left or right relative to that starting point. Lifting recenters the control. Tap the brake into a bend and countersteer to catch the slide.

TV remote: Select starts/rematches; Back returns to the lobby, then exits; Up in the lobby clears both reservations and rotates the PIN. Phone: START RACE/REMATCH and LOBBY do the same. Desktop: press W to take car 1, WASD drives, arrows work during a race, Enter starts/rematches, Escape returns/exits. Keyboard yields car 1 to a paired phone. The TV remains awake while foregrounded.

Rejoining the same browser restores its car with a stored opaque token. Backgrounding the game stops its listener so another variant can use port 8765; returning restarts it and preserves the slots. Application process death resets the session. Pairing reservations last until Up resets them or the process exits. A claimed car always keeps its human controls, including after finishing while another driver is still racing. A race ends when all human drivers finish (or all AIs if no humans), with an explicit 180-second ceiling; unfinished cars remain marked unfinished.

Fullscreen, orientation lock, vibration and screen wake lock are capability-detected. **Chrome does not expose screen wake lock on an ordinary insecure LAN HTTP origin in the browser test.** Keep the phone's display awake through its system setting if necessary. The controller works without those optional browser features. It has a web manifest; offline installation/service-worker caching cannot be promised over plain HTTP. No tilt sensors are used.

## Inspect over Wi-Fi

`http://<tv-ip>:8765/stats` is live JSON; `/health` is a small status response. Every ten seconds the same stats serializer writes to Android logcat with the tag `DeathRide`. No diagnostic app is required for the HTTP endpoint.

- `frameTimeMs`: monotonic time between render entries, including cold/stalled frames.
- `simStepMs`: measured time executing one 60 Hz step, including contacts and AI.
- `slots[].inputAgeMs`: age when the simulation consumes the state. Phone `performance.now()` is corrected by a ping/pong midpoint offset; the lowest RTT sample on the phone is preferred. Before sync, receive time is the fallback and `clockSynced` is false. This estimates clock offset; it is not an optical latency measurement.
- Each distribution has exact last-10-second quantiles in a fixed 4096-sample ring and bounded lifetime histograms. Histogram resolution/cap is explicit: 0.1 ms / 5000 ms for frames and input age; 0.001 ms / 50 ms for sim steps. Max and count are exact. Stale held input continues aging, so disconnected-slot percentiles can grow to the lifetime cap. The exact max still shows the full age.
- Stale counts are *consumption steps*, not packets. Dropped counts combine missing sequence numbers and age/invalid-payload rejections. Duplicate/older sequences have a separate out-of-order count. Each counter has last-10-second and lifetime values.
- Connected/reserved slots, effective controls, clock state, frame/flash counts, discarded catch-up time, and JVM used heap in MB are included. Heap excludes native/GL memory and is not PSS.

**Optical flash:** tap FLASH TEST at the bottom of the phone. It shows white on that tap and sends an input with `f:1`; the TV clears exactly one ensuing display frame to white. Film both screens in one 240 fps shot for at least 30 taps. Count the separation in video frames and multiply by 1000/240 ms. Report p50, p95 and max; network RTT is not a substitute. Flash events are discarded if their input is already stale.

## Reproduce checks

```powershell
npm ci --prefix tools
# Run the desktop host in another terminal; take its PIN from the TV/console.
node tools/probe.mjs http://127.0.0.1:8765 <pin> 60
# Browser install may be needed once: npx --prefix tools playwright install chromium
node tools/browser-check.mjs http://<desktop-ip>:8765 <pin>
.\gradlew.bat :desktop:run '--args=--smoke'
.\gradlew.bat :desktop:run '--args=--keyboard-check --duration=7 --audit'
.\gradlew.bat :desktop:run '--args=--soak --duration=900 --1080 --audit'
python tools/verify_apk.py ../deathride.apk dev.deathride.slipstream 'Death Ride Slipstream'
```

Use a fresh host session for each probe/browser test because each claims both slots. `CHROME_EXECUTABLE` optionally points to an existing Chromium executable. The browser test sends genuine CDP multi-touch events in two browser contexts, checks independent release and reconnect identity, starts/leaves a race and verifies the flash. It is not a physical Android-phone test.

The keyboard diagnostic injects W/D into this game's GLFW callback, including its polling state and event queue; it does not type into other desktop applications. The allocation audit reads this JVM render thread's allocated bytes after 300 warmup frames. It includes race transitions and the one-off diagnostic PNG capture. Network JSON encoding is off-thread. Only the pure simulation's zero-allocation invariant is a unit-test gate.

The real-time desktop soak cycles full six-car races, including countdown/results/rematch, at 1920x1080. Its real elapsed duration is 900 seconds. The separate JVM test runs 900 *simulated* seconds in a few seconds. Neither establishes Fire TV thermals or Wi-Fi performance.

## Architecture and tuning

`core`: pure Kotlin model, fixed input mailboxes, stadium projection, sequential checkpoint laps, two-circle car contacts, strict math, bounded AI trace, and reused read-only snapshot buffers. It has no Android/libGDX imports. `link`: Ktor CIO listener, pairing and clock correction, bounded input transfer and metrics. `game`: shared libGDX rendering/race flow. `app`: Android lifecycle/manifest/native packaging. `desktop`: LWJGL3 launcher and optional diagnostics. `controller`: self-contained page served from APK assets.

Simulation runs at 60 Hz with no unseeded randomness or wall clock. Draws interpolate two snapshots; no input prediction is used. Frame stalls execute at most six catch-up steps, recording discarded simulation milliseconds. Structural race resets and ownership changes happen on the render thread at step boundaries. Track vertices, glyph quads, inputs, snapshots, contacts and trace rings reuse storage. HUD strings use a reusable character builder. Stats sorting/encoding and WebSocket JSON allocate on network threads; startup, QR regeneration and explicit race transitions may allocate.

Change `CarSpec` (SI units) and `AI_SKILLS` in `core/.../World.kt`. The three AI tiers share engine power and differ in reaction steps, line error, corner margin and look-ahead. DRIVE/OVERTAKE/RECOVER use perceived gaps or a sustained low speed, plus dwell/hysteresis. `World.trace` retains 600 steps per car as `mode*10 + reason` (1 blocked, 2 perceived car ahead, 3 dwell/recovery complete). No catch-up boost or teleport exists. Full game timing is fixed at 60 Hz; the 30/60 Hz test checks isolated handling, not equivalence of reaction-step-based AI and contact iterations.

Slipstream integrates yaw inertia and tire-force saturation, with brake-induced grip loss and a restoring yaw term. AI perceives its own slip and damps yaw. The camera follows with velocity look-ahead and speed zoom; two phone drivers widen the shared view, and a minimap preserves circuit context.

Pinned libraries: Kotlin 2.0.21, AGP 8.7.3, libGDX 1.13.5, Ktor 2.3.12, ZXing 3.5.3, JUnit 5.10.2. libGDX 1.13.5's AndroidX dependency requires a newer compile SDK than 34; platform 36 was already available. Minimum Android API 28 and target 34 remain unchanged. Native libgDX libraries are packaged for arm64-v8a, armeabi-v7a and x86_64. Release reference: [libGDX 1.13.5 release](https://libgdx.com/news/2025/05/gdx-1-13-5).
