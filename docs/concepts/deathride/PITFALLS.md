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
