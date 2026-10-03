# P6 — test the shared receive-gap boundary

Design before implementation. P3 reproduced 281–308 ms simultaneous gaps at
both socket readers. The render loop continued for 17–18 frames during those
gaps. At rejection, parse/offer/ack-enqueue were generally below 3 ms, and
sequence order was intact. This localizes delay before application handling;
it does not distinguish the Wi-Fi path from the common transport selector.
Ktor already sets TCP_NODELAY. No input cutoff or timestamp change is justified.

Test the platform's foreground low-latency Wi-Fi lock as an explicit optional
variant. It requests a latency-oriented power policy while this activity is
resumed, and releases on pause. Preserve all input traffic and counters. Record
the actual system lock state, thermal/PSS data, and before/after long-soak RTT
and ingress-age distributions. Keep it disabled by default unless device data
supports retaining it. A held lock is not proof the driver implements it.

[Android WifiManager](https://developer.android.com/reference/android/net/wifi/WifiManager#WIFI_MODE_FULL_LOW_LATENCY)
documents foreground/screen-on restrictions and possible power/throughput
trade-offs. This AC-powered Stick still needs thermal verification. No system
Wi-Fi setting, router setting, channel or other application's lock is changed.

## Results and retention decision

Same frozen APK `41d87f006d9b0ed3733f44fbe7eab62ebd080cb65c31556cc959f26e2167918c`,
native resolution, vsync/display scheduling, ordinary 30 Hz inputs, no phase
or native profiler. Baseline 900.063 s accepted 26,994/26,992 of 27,002 inputs
per seat: 8/10 rejects, no host pump stalls, RTT p95/max 62.494/903.430 ms,
calibrated age at ack p95/max 11.017/278.866 ms. The independent late 330-second
ICMP observation had no losses, max 69 ms, and no coincident new rejection.
It cannot identify the cause of the earlier gaps.

The lock arm ran 900.159 s with all 26,595 inputs per seat accepted. RTT
p95/max 61.653/100.212 ms; calibrated age p95/max 11.116/35.775 ms. The host
pump paused 13,628.834 ms at second 202.562: functional/input-stream gates
FAIL despite zero rejects. Stale-consumption maxima around 13.7 seconds are
retained, not removed as noise. Host process/RAM inspection did not establish
a cause. The probe now records its epoch time origin for future correlation.
Qualification summaries explicitly require no host pump stalls.

Active frame p95/max baseline 20.231/33.089 ms, lock arm 20.272/32.747 ms.
Both pass PSS/texture budgets; low-latency arm max PSS 139.453 MiB. System
`dumpsys wifi` confirms the activity's type-4 lock, not driver effectiveness.
This evidence is insufficient to establish a causal input fix. Keep the lock
optional while P8/final trials repeat it at full rate; do not relax the 250 ms
age cutoff, ordering checks, acknowledgement timing or latency reporting.
Required tests remain 136 core / 8 link / 27 game plus APK (P7 frozen build).
