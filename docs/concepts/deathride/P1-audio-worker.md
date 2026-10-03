# P1 — bounded native audio worker

Design before implementation. P0 measured render-thread audio stalls above
100 ms, and scheduler tracing separated 40.943 ms asleep from 7.131 ms CPU in a
48.601 ms audio span. Active texture uploads were zero; effect-pool update p95
was 0.051 ms. Address the measured native playback stall before any visual cut.

Keep CueService's priority/cooldown/caption/spatial decisions and eight-voice cap.
On Android, preload resources before racing and give one worker exclusive native
playback ownership. Use fixed slots and generation-checked handles, bounded
pending starts, coalesced latest parameters, and stop-before-start processing.
Never block the render thread waiting for SoundPool. Drop a start queued for more
than 100 ms rather than play an old impact; publish queue age, backend-call time,
failed/stale/cancelled starts and active native voices. Native start completion
is not audible/optical latency and is labelled accordingly.

Test native blocking, saturation, cancellation, handle reuse, failed starts,
stream completion, disposal, eight-voice maximum and allocation-free steady
submission. Re-run all required tests and the Stick phase/soak probes with audio
enabled. Preserve P0 evidence and compare like-for-like phase scopes. No physics,
input freshness, artwork, effect counts, resolution or audio gain change.

## Measured outcome

The pre-fix 900.225-second instrumented run completed with 27,007 accepted inputs
per seat and no rejection, despite retaining the audio/frame failures. This
already demonstrates that a later zero-rejection run alone cannot prove a
transport cause was fixed. Its 48,869 active phase samples measured audio p99
15.748 ms and max 131.623 ms.

The first worker APK's 360-second phase run measured audio p99 **2.003 ms** and
max **13.456 ms** over 19,341 active samples. All 10,806 inputs per seat were
accepted. Frame p95 still fails (worst active window 27.535 ms); active max
65.044 ms. Thus moving native calls removes the measured large audio stalls but
does not solve pacing. This first APK preceded the one-shot duration correction:
queued time now does not consume a clip's playback lifetime. A blocking-backend
regression tests that correction before the final APK run.

The final P1 APK ran **900.211 seconds**, with 27,007 inputs per seat at 30.0007 Hz.
It rejected **3 / 4** packets: zero-loss gate still fails. All seven rejected
inputs had clock-adjusted receive ages **252.423–270.683 ms**, beyond the unchanged
250 ms cutoff; out-of-order counts are zero. Their RTTs are 271–571 ms; maximum
RTT across all inputs is 867.133 ms. This distinguishes actual stale ingress
from return-path delay. The rejection cluster is around seconds 517–519, in a
transition window with a 142.128 ms frame maximum. It does not prove whether
wireless transport or lower-level I/O queueing produced the remaining delay.

| P1 clean observation | Result |
|---|---:|
| Worst complete active-window p95 / max | 22.672 / 48.027 ms — fail |
| Six-live-car windows p95 / max | 22.263 / 37.419 ms — fail |
| PSS min / max | 115.206 / 137.077 MiB — pass |
| Warm endpoint-median PSS change | -13.458 MiB — pass, not an indefinite leak proof |
| Owned textures / art | 39.970 / 18.750 MiB — unchanged |
| Native voice high-water | 8 |
| Native starts / failed / overflow | 4,239 / 0 / 0 |
| Cancelled pending starts / expired starts | 23 / 1, retained explicitly |
| Maximum enqueue-to-native-completion | 134.702 ms, not audible latency |
| Maximum coalesced parameter wait | 153.154 ms |

The worker is bounded and does not hold its producer lock across native calls.
The one expired onset was discarded at 134.713 ms queue age, rather than played
late; queue age and native-call time are not hidden. Native completion can exceed
100 ms when an eligible start subsequently blocks in the platform call. These
audio latency tails remain an owner listening check. CueService's `played` counts
accepted requests; the backend's `starts` counts successful native calls.

All **136 core / 5 link / 25 game** tests and the final APK pass. New tests cover
bounded capacity, native blocking, stop/cancel ordering, reused handles, failures,
stream completion, one-shot pending duration and allocation-free steady producer
submission. Existing core determinism/allocation behavior is unchanged. P1's
timing runs use full legacy HUD metadata. P2 separately measures reducing that
proven serialization/transport cost; it must not change acceptance thresholds.

Evidence: `deathride/evidence/perf/p1`; the completed pre-fix long diagnostic is
under `p0/profile`. Windows WLAN event access and privileged packet capture were
unavailable. The Stick's Wi-Fi HAL repeatedly reports failed link-layer stats,
so its zero retry counters are not treated as evidence of a lossless LAN.
