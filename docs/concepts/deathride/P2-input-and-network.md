# P2 — input diagnostics and unchanged HUD metadata

Design before implementation. P0's 20-second scheduler capture measured 9.160 CPU
seconds in application dispatcher threads. An actual `/stats` response is 55,980
bytes, with approximately 9 KB host career, 9 KB local career and 7 KB garage per
seat. The same metadata is sent in each ten-Hz phone HUD packet. It changes on
transactions/selection, not every 100 ms. This is measured network work; it is
not proof that network CPU caused the earlier stale inputs.

Negotiate `hudDelta:1` in hello. Send a full metadata snapshot on connection,
phase change and every five seconds; send changed fields immediately at the
existing HUD cadence. Keep combat/speed/phase/freshness fields live in every
packet. The phone retains metadata across deltas and resets it on welcome.
Legacy clients continue receiving full packets. Preserve thirty-Hz input,
generation timestamps, the 250 ms cutoff and ack ordering. Publish HUD character
counts/full-snapshot counts to make the actual reduction measurable.

Probe acks now retain their server receive timestamp and the exact offset used
when generating each input. This distinguishes ingress age from return-trip
delay without calling either optical latency. Rejected packets and stale
simulation consumption remain visible. Do not change the policy to accept late
input; first identify which side of receipt incurred the delay.

Test first/changed/phase/periodic metadata, legacy behavior, actual compact
WebSockets, malformed/stale/future/out-of-order input and replacement sockets.
Run required JVM/APK gates and the existing real-browser suites. Remeasure on
the isolated Stick with all gameplay, HUD and audio enabled. No art or audio
trade-off is part of this wave; diagnostic full `/stats` remains available.

## Results and limits

Required gates passed: 136 core, 8 link, 25 game tests and APK assembly. All six
existing browser suites passed, including campaign and duel. Socket tests cover
full/delta/reconnect metadata plus malformed, stale, future and out-of-order
inputs; accepted-generation ordering and 250 ms cutoff remain unchanged.

Final APK `22abcdd5caedb6e7ba6f805667ec3b716e60e0ffeeeae2252296598be93c8564`
ran for 900.222 s: 27,007 inputs per seat at 30.0004 Hz, all accepted, no host
pump stalls. Ack RTT p95/max 61.821/115.864 ms; calibrated age at server ack
 timestamp p95/max 10.419/91.315 ms. Those are transport estimates, not optical
latency. Stale consumption before the final deliberate drain is retained:
55/31 samples include initial uncalibrated/quiet lifecycle periods; it is not
silently reported as zero. Dropped and ordering counters are zero.

HUD payload averages 1,629/1,597 characters over 8,925/8,920 messages, with 215
full metadata snapshots per seat. Active rolling frame p95/max 21.776/39.225 ms;
six-live windows 21.342/34.432 ms. Both frame gates remain open. PSS
120.076?127.856 MiB, warm median change -3.482 MiB; texture budgets pass.
Audio native start failures/overflow/stale starts zero; onset completion max
97.867 ms and parameter wait max 134.184 ms remain visible.

The 360-second diagnostic also accepted all 10,805 inputs per seat, but is not
a duration qualification. Its phase data still shows buffer acquisition sleep
and render CPU below the observed interval tail. Delta metadata demonstrably
reduces transport work, but does not prove the cause of every historical
rejection: P0 already had a rejection-free diagnostic. No freshness threshold,
input rate, ack meaning, effect, art or audio quality was relaxed.

Local Ktor 2.3.12 bytecode inspection confirms `ServerSocketImpl` sets
TCP_NODELAY=true on accepted sockets. No speculative Nagle toggle was applied.
Evidence: `deathride/evidence/perf/p2/{profile,clean,browser,browser-campaign}`.
Raw soak JSON is retained losslessly as gzip. Later tool runs can name a frozen
APK so another headless build cannot relabel a device measurement.
