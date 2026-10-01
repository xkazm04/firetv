# Death Ride pitfalls

- 2026-09-30 W6: Immediately restarting the Stick app after a two-socket probe left the port preflight reporting busy although no server listened. The preflight disabled address reuse, so recently closed TCP connections could block startup through TIME_WAIT. Set reuse before binding, as the listener does; an actually listening server still fails the occupied-port test. Observed via refused HTTP plus `Port 8765 unavailable` after reinstall/restart.
- 2026-09-30 W6: A static track framebuffer must extend beyond the circuit's geometry bounds by the follow camera's visible margin. Otherwise a hard rectangular terrain edge enters the driving view. Keep this margin in presentation data and inspect a corner on the Stick, not only a full-course screenshot.

- 2026-09-30 W1: `adb am start` can report success while the Stick display is asleep and libGDX has not opened its listener. Send WAKEUP (224), confirm `dumpsys power` Awake/ON, then launch. Keep-screen-on prevents sleeping after the activity is active; it does not wake an already sleeping device.
- 2026-09-30 W1: Java 22 StrictMath FdLibm sin/cos/pow allocate temporary arrays in some compiled paths. JFR pinned double-array allocations to these functions (274 MB / 10,000 baseline steps). Small-angle polynomial trig plus exp/log powers avoids that runtime dependency; accuracy checked over 20,001 angles and every preset checked for zero allocation after warmup. Do not weaken the allocation gate to hide the runtime cost.

- 2026-09-30 W4: Chromium CDP `touchEnd` with a nonempty touchPoints list ends the listed contacts (the existing browser probe already relied on this). For independent-release checks send the contact being released, or an empty list to end all. Sending the remaining contacts creates a false latched-button finding. Confirmed by the Stick controller checks.


## 2026-09-30 - Restart readiness is not a fixed delay

W5's Stick save check force-stopped/relaunched Death Ride, then tried to read its pairing PIN after 2.6 seconds. The app restarted correctly but the listener's ready log had not appeared yet. Poll the new process's ready message with a bounded timeout before pairing; do not reuse a previous process's PIN. A successful `am start` is not proof that the HTTP/WebSocket listener is ready. Source: `tools/garage-check.mjs`, live AFTKM check.

## 2026-09-30 - Touch-action on ancestors can disable a scrolling shop

The driving page deliberately sets `touch-action: none`. Giving only an overflowing child `pan-y` does not restore native menu scrolling because the browser intersects ancestor policies. The garage switches the root/body to `pan-y` while open; driving controls retain their own `none`. Keep the shop's explicit close button reachable by scrolling on short landscape screens. Source: W5 controller integration.


## 2026-09-30 - Career sheet visibility is earlier than catalog binding

The first W7 browser assertion saw a generic option-enabled result before the failure screenshot showed the native disabled flag. The sheet can be made visible by the phase HUD before asynchronous catalog/profile binding is complete. Wait for the native option property as the readiness condition, and separately test that the TV rejects a locked-car start. No host gate bypass was found; a screenshot taken after an assertion is not proof of the DOM state at the assertion's instant. Source: W7 `career-check.mjs` and `career-idle-check.mjs` on AFTKM.

## 2026-09-30 — W8 integration observations

- Full profile/traffic telemetry outgrew Android logcat's single-line payload. Keep the periodic `DeathRide` log record to frame/simulation/input-age/combat metrics; read `/stats` for full state. A truncated log line must never be treated as a valid JSON measurement.
- A shared camera that includes resolved human cars keeps zooming out around a distant wreck. Follow active human drivers and make the main HUD's driver explicit; retain wrecks on the minimap and in results.
- A mixed Monte Carlo preset must cross scenario dimensions. Using `seed % 5` for both course and lead class produces five paired cases instead of all 25. The W8 upgraded-lead preset now changes course after each full class rotation, with coverage checked in the smoke test.
- The W8 Home/resume run preserved the framebuffer scenery (identical before/after images), but that observation does not force or certify every possible Android GL-context-loss path.

- W8 sustained measurement: ordinary `dumpsys meminfo <process>` coincided with an explicit copying GC and roughly 110-130 ms render interval every minute. The device's own `dumpsys meminfo -h` documents `--local` as "only collect details locally, don't call process." Use `--local` for sustained PSS sampling; its real device output still includes TOTAL PSS and GL mtrack. Preserve the initial intrusive run and identify this measurement cost rather than quietly discarding its stalls.

- W8 scenery profiling on AFTKM: rebuilding a 3072-square procedural target in one frame took 110-121 ms for warm geometry plus 179-206 ms finishing/disposing its temporary renderer. Reuse one framebuffer/renderer and yield between bounded primitive groups using a data-defined budget. Hold countdown until ready and cancel old work on a new course choice. The nominal 3 ms budget excludes submission overhead; report measured slice maxima rather than promising a hard OS scheduling deadline.

## 2026-10-01 - P3 heading representations

Prefer one neutrally lit sprite rotated at runtime. On AFTKM, an isolated GLES2 probe drawing six copies recorded 1,800 intervals after five seconds of warmup per representation. One image: p50 16.753 ms, p95 19.534 ms, 0.25 MiB RGBA texture storage, PSS 36,914 KiB. Sixteen stored headings: 16.776 / 19.418 ms, 4 MiB, PSS 38,212 KiB. Thirty-two: 16.758 / 19.469 ms, 8 MiB, PSS 41,776 KiB. The 256-pixel square cell and source pixels are identical across methods. Stored headings quantize rotation by up to 11.25 or 5.625 degrees; actual Stick screenshots show readable silhouettes in each method. These short tests do not establish integrated gameplay performance, thermal stability, full-scene PSS, or owner quality. The probe's 384-physical-pixel cells make art inspection easier; this is not a W6 camera-scale certification.

One Grok `image_edit` request for sixteen headings instead produced sixteen near-identical right-facing cars and drawn grid lines. Component counting found sixteen cars, but the measured unsigned axes fail the specified heading sequence. Reject that representation before spending on additional headings or putting it on the device. Prompt compliance is not a frame-sequence test.

The conditioned Line paint-change probe achieved aligned silhouette IoU 0.9980 versus 0.9499 for the same unconditioned action, with palette p90 distances 9.54 versus 12.24. This is one image per arm, not a reliability estimate. Approval must bind the exact reference bytes before producing family states. Evidence: `deathride/art/device/heading-probe.json`, `headings-memory.json`, device screenshots, and `art/reports/p3-consistency-experiment.json` / `p3-generated-headings-analysis.json`. Probe application ID is isolated; the game activity was restored afterward.
