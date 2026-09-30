# Slipstream

## The bets
Force-limited tire grip + yaw inertia; Relative thumb drag; Look-ahead camera + minimap. Compared with Apex, this changes the handling model, steering ergonomics and camera policy, not just coefficients or colors. Both share the same authoritative input contract and always race six cars.

## How it feels
The brake unloads lateral grip; yaw has a 0.12 s response time and a restoring term. The countersteer test reduced a 21.85° slide to 9.60° in 0.2 simulated seconds. This is a physics result, not a comfort or perceived-latency claim. Top speed is capped at 30 m/s. There is no input prediction. An input older than 250 ms holds its last steering and drops throttle and brake. Releasing a touch explicitly recenters steering.

## Verified vs not measured
14 core tests and three link tests pass. Twenty seeded six-car races finished three laps. The warmed simulation allocated zero bytes over 10,000 steps. Desktop GL, QR decoding, two browser controllers, simultaneous touch, reconnect identity, stale/order rejection, a 60-second approximately 30 Hz probe, and a 900-second 1080p desktop soak were checked. APK ABI/manifest/label inspection passed. Stick launch, optical latency, physical Android phones, Wi-Fi contention, remote hardware, thermal behavior and owner feel: **not measured**.

## Known limits
Consequential decision: retain the 60 Hz Kotlin simulation and latest-state TCP mailboxes; do not hide late input with prediction. Hardware tail latency still decides Gate G0. Plain-HTTP Chromium did not expose wake lock on the LAN test; fullscreen/orientation/vibration are optional. No offline PWA install is promised. Reservations survive reconnect until the lobby's Up/reset or process exit. Three-minute race ceiling; unfinished cars are marked. Two phone seats; no gamepad-axis mapping. Lifetime timing percentiles use declared bounded histograms; maxima remain exact. Verdict: **STOP at G0 pending Stick measurements and the owner's playtest**.
