# Death Ride: the plan

Written 2026-09-30 on `main` (6f953de). No product code was changed to write it. Baseline claims about this repo come from
`docs/POC-FINDINGS.md`, `docs/PLATFORM-RISK.md`, `tv-app/build.gradle.kts`, `settings.gradle.kts` and `scripts/dev.ps1`, read
on 2026-09-30. Nothing here was run. "Proposed" marks a number nobody has measured yet. Sizes S/M/L are relative, not measured.

> **Current status: see `DEATH-RIDE-STATUS.md` (start there; this file is the original plan).**
>
> **2026-09-30 update.** The spike is done: it ran as a contest and slice C/2 "Slipstream" won (see `DEATH-RIDE-PHASE1.md` section a). Phase 1 is now
> organised as waves W1-W8 in `DEATH-RIDE-PHASE1.md`, which supersedes slices M1-M7 here. The reference Stick has 1.7 GB RAM, not 2 GB. S3 and S5 are partial: idle
> frame time was measured on the Stick, input age under play and the optical flash test were not.

## a. How to use this file

1. Every session starts by reading sections b (status table), c (decisions) and the last entry of section k (session log).
2. Take the first `not started` row in section b whose depends-on rows are `done`. The table is in execution order.
3. Build exactly one slice by its card in section f, in its own worktree (see the `firetv-shared-checkout-parallel-sessions`
   memory: parallel sessions have switched the branch under a running wave; junction `desk/node_modules` only if you touch `desk`).
4. End by updating the slice's status row (status, branch, commit, date) and appending a session log entry with the numbers
   the card asked for. A number without its unit, sample count and device is not a result.
5. A gate with no command is `unverifiable`, never `pass`. A measurement that was not taken is `not measured`, never `pass`.
6. Stop and ask the owner where a card says STOP, and never guess past a kill criterion (section h).
7. The first session goes through the **spike (Phase 0)** only. Do not start Phase 1 before the owner has read the spike verdict (S6).

## b. Status table (sessions update this)

| # | Id | Slice | Size | Depends on | Status | Branch | Commit | Date |
|---|---|---|---|---|---|---|---|---|
| 1 | S0 | Scaffold: `race-core`, `race-tv` (libGDX), desktop launcher, APK on emulator AND on the Stick | M | - | done (contest spike, winner C/2) | | | |
| 2 | S1 | Handling model, one oval, laps, tuning as data, determinism test (desktop, keyboard) | M | S0 | done (contest spike, winner C/2) | | | |
| 3 | S2 | Phone controller: PWA, pairing, input frames, 2 phones, latency probe | M | S0 | done (contest spike, winner C/2) | | | |
| 4 | S3 | Both together on the real Stick: frame-time and input-to-photon measurements | M | S1, S2 | partial (contest spike, winner C/2) | | | |
| 5 | S4 | Cars collide, AI drivers on the centerline, 6-car load | M | S1 | done (contest spike, winner C/2) | | | |
| 6 | S5 | Feel pass: tune handling and input smoothing against S3 numbers, one owner playtest | S | S3, S4 | partial (contest spike, winner C/2) | | | |
| 7 | S6 | Spike verdict document and Gate G0 | S | S5 | done (contest spike, winner C/2) | | | |
| 8 | M1 | Combat core: machine gun, mines, HP, wreck state, hit dedup | M | G0 | superseded by DEATH-RIDE-PHASE1.md | | | |
| 9 | M2 | Track as data: 3 tracks, checkpoints, surfaces, a track linter | M | G0 | superseded by DEATH-RIDE-PHASE1.md | | | |
| 10 | M3 | Race flow: lobby, grid, countdown, results, phone HUD and rumble | M | M1, M2 | superseded by DEATH-RIDE-PHASE1.md | | | |
| 11 | M4 | AI in combat, skill tiers, bounded catch-up | M | M1, M2 | superseded by DEATH-RIDE-PHASE1.md | | | |
| 12 | M5 | Garage and economy: upgrades, cash, save file, economy sim | M | M3 | superseded by DEATH-RIDE-PHASE1.md | | | |
| 13 | M6 | Placeholder audio and particle budget; perf tiers | M | M3 | superseded by DEATH-RIDE-PHASE1.md | | | |
| 14 | M7 | MVP verdict, headless balance sim report, Gate G1 | S | M4, M5, M6 | superseded by DEATH-RIDE-PHASE1.md | | | |
| 15 | P2 | Game depth (career, rosters, weapons, track generator): planned only after G1 | L | G1 | not planned | | | |
| 16 | P3 | Art, audio, music, characters: an experiment programme, planned only after G1 | L | G1 | not planned | | | |
| 17 | P4 | Ship: Appstore, relay for internet play, Vega decision | L | P2, P3 | not planned | | | |

Phases: **Phase 0 = spike (S0-S6)**, proves the racing experience with a phone in hand. **Phase 1 = MVP (M1-M7)**, proves the
game is worth its art. Phases 2-4 are the vision and stay unplanned until their gate passes.

## c. Decisions taken (owner said yes, or the plan chose and says why)

| # | Decision | Source |
|---|---|---|
| D1 | Kotlin + libGDX. Game is named **Death Ride**. Fire OS (Android) only; Vega is out of scope. | owner, 2026-09-30 |
| D2 | Art, tracks, music, characters are a later programme gated by G1. Placeholders (flat colour shapes, CC0 sounds) until then. | owner |
| D3 | A **new pair of modules**, `race-core` (pure JVM) and `race-tv` (Android + desktop), not code inside `tv-app`. The Telestrator PoC keeps building and its 27/27 live test keeps passing. Reuse is by copying the small proven pieces (see section e) and extracting a shared `link` module only if a second consumer appears. | plan (changes my earlier note "inside `tv-app`") |
| D4 | The simulation is **hand-written pure Kotlin, not Box2D**. Cars are a few circles each, walls come from the track centerline and width. libGDX does rendering, input, audio, assets and the Android lifecycle. | plan |
| D5 | The TV is authoritative. Phones send input, receive a small HUD. Phones never render the world. | plan (feasibility report) |
| D6 | Touch controls first. Tilt steering is not in Phase 0 or 1. | plan |

**Why D4 (the one that needs the owner's eye).** A Box2D world runs through JNI natives, so it is not a pure-JVM unit test,
and cross-platform determinism is not promised. The registry's method for tuning this kind of game is headless: run the same
input twice and diff the state (`update-order-and-frame-coherence`), and run thousands of seeded AI-vs-AI races to tune pace
(`monte-carlo-scenario-presets`). A pure Kotlin sim makes both cheap and runs on the desktop, the emulator and the Stick
identically. Cost: we write car-vs-car and car-vs-wall response ourselves (roughly 300-500 lines for circle chains). Fallback: if
S4 shows the collision response is a time sink, adopt Box2D behind the same `World` interface and record it as decision D4b.
Do not decide that in advance.

**Why D3.** `tv-app` carries a proven Ktor server, pairing and a Compose overlay, all under a live test suite. The game needs
libGDX's `AndroidApplication`, native `.so` files for several ABIs, and a fullscreen GL surface. Mixing those into the PoC
would put an unrelated dependency inside a working slice.

## d. Vision (the final game, so the spike does not build a dead end)

**Death Ride** is a couch vehicular-combat racer for Fire TV. One to four phones are the controllers, up to six cars are on
track (the rest are AI), the camera is top-down. Between races a garage sells engine, tires, armor and weapon upgrades from
prize money. A career is a ladder of championships over a set of tracks with escalating opponents. Cars can be shot, rammed
and mined, and wrecks matter (a wreck is out of the race, not just slow).

What the vision demands of the spike's architecture, and therefore what the spike must not get wrong:

- **Deterministic fixed-step sim in pure Kotlin.** Enables replays, headless balance simulation, and a test suite that runs in
  seconds without a device.
- **Everything tunable is data.** Cars, weapons, upgrades, tracks, AI tiers are data objects, not subclasses
  (`data-driven-type-objects-over-subclass-growth`). The art programme later swaps sprites without touching rules.
- **The rules never see a sprite.** Rendering reads sim state through one read-only snapshot. Art is replaceable by design.
- **Input is a tiny absolute-state frame.** So a gamepad, a keyboard and a phone are interchangeable sources, and a dropped
  or late frame is harmless.
- **The link is a transport interface.** LAN today, relay later (the PoC already has that split in `PenTransport`).

Deliberately absent from Phases 0-1: tilt steering, internet play, campaign story, real art, licensed-style music, a car
roster beyond three, voice. Each of those is a decision for P2-P4.

AirConsole, as I understand it, uses a cloud relay so any browser phone can join a screen. It was not verified in this
session. This project is LAN-first for latency and keeps the relay as a fallback transport for networks with client isolation.
Whether AirConsole distribution is worth pursuing is a P4 question, not a spike question.

## e. What is reused from this repo, and what is not

| Reuse | From | Note |
|---|---|---|
| Ktor CIO server + WebSocket + serving the phone page from the APK assets (same origin, so `ws://` is allowed) | `tv-app/.../transport/LanTransport.kt`, `tv-app/build.gradle.kts` (the `companion` assets copy) | Copy the port-bind check and 10x retry too: an unhandled `BindException` killed the whole app on Fire OS in the PoC. |
| QR + rotating PIN pairing | `tv-app/.../Qr.kt`, `PenSessionHost.kt`, `core/.../Protocol.kt` | Copy the shape, not the pen conversation. |
| `FLAG_KEEP_SCREEN_ON` | PoC finding (Fire OS started a screensaver mid-session) | A game is watched, not touched, exactly as a telestrator is. |
| Latency probe method | `tools/latency-probe.mjs`, `tools/tail-diag.mjs` | The PoC found a p95 of 212-730 ms on the Stick, and it was the app's own render loop, not the radio. Measure on hardware first. |
| One-command cycle to emulator or Stick | `scripts/dev.ps1` (`-Device <ip>`) | Add a `race` variant, do not fork the logic. The reference Stick's last known address in the docs is 10.0.0.142; verify it. |
| Pure-JVM tests for rules | `core/` pattern (79 tests, no Android imports) | `race-core` follows it exactly. |
| Versions | `gradle/libs.versions.toml`: AGP 8.7.3, Kotlin 2.0.21, Ktor 2.3.12, JUnit 5 | Add libGDX (latest stable 1.13.x or newer, verify at S0) and record the version in the log. |

New risk that the PoC did not have: **native libraries**. The PoC APK had no native code. libGDX ships `.so` files per ABI.
Include `arm64-v8a`, `armeabi-v7a` and `x86_64` (emulator), because a Stick can run a 32-bit userland on 64-bit silicon. S0's
gate is "launches on the real Stick", not "builds".

## f. Slice cards

Every card ends with **Done when**, and every measurement lands in section k with unit, sample count and device.

### Phase 0: the spike

Purpose: answer "does racing with a phone in your hand feel good, and is the Stick fast enough" for the price of about one
track. The spike deliberately builds no combat, no garage, no art.

#### S0 Scaffold (M)

Create `race-core` (Kotlin JVM, JUnit 5, `kotlinx-serialization`), `race-tv` (Android app `dev.deathride.tv`, libGDX Android
backend, leanback launcher intent, no touchscreen requirement, `minSdk` 28 like `tv-app`), and a **desktop launcher** in `race-tv`
(libGDX LWJGL3 backend, keyboard input) so game feel can be iterated on the PC without an emulator. Add the modules to
`settings.gradle.kts`. Extend `scripts/dev.ps1` with a `race` target rather than forking it.

- Game loop rules, from `update-order-and-frame-coherence`: a **fixed 60 Hz sim step** decoupled from the display frame,
  render interpolates between the last two snapshots, structural mutation (spawn, remove) is deferred to a drain point.
  `race-core` must not read a wall clock, use unseeded randomness or iterate hash-ordered collections inside the step.
- `race-core` exposes: `World`, `Car`, `InputFrame`, `Snapshot` (read-only), `Sim.step(inputs)`.
- Placeholder rendering: `ShapeRenderer` rectangles and a flat ribbon for the track. No textures.
- Allocation discipline from day one (`allocation-discipline-in-the-hot-path`): no allocation per frame in the step or in the
  render path. The PoC's per-frame path refit cost 150% CPU on ARM and the emulator hid it.

Done when: `gradlew.bat :race-core:test` green; desktop window shows a moving rectangle on keyboard; the debug APK installs and
runs on the emulator; **and on the real Stick**, with the model and ABI written down. STOP and ask the owner if the APK
refuses to start on the Stick for an ABI or GL reason after one fix attempt.

#### S1 Handling model and one oval (M)

In `race-core`: an arcade top-down car. Suggested model (not a mandate): velocity vector plus heading, lateral-friction
cancellation with a grip limit, throttle and brake as forces, a handbrake or slide state, speed-dependent steering. Every
number lives in a `CarSpec` data object with its unit in the name (`maxSpeedMps`, `gripLateralNps`). One oval track as data:
centerline points, half-width, start line, checkpoints by arc length. Lap counting, wall containment (a car cannot leave the
ribbon), off-track surface drag.

Tests, all in `race-core`, no device:

- **Determinism.** Same seed and same scripted inputs run twice, then the state hashes are equal after 60 s of sim.
- **Handling invariants.** Top speed is reached and not exceeded; a scripted full-lock turn at speed produces a slip angle
  inside a declared band; braking distance is monotonic in speed; a car released at speed slows down.
- **Track.** A scripted line makes a lap and the lap counter goes 0 to 1 exactly once; skipping a checkpoint does not count a
  lap; a car driven into a wall stays inside.
- **Time basis.** Every rate says per second or per step (`a-number-carries-its-unit-and-basis`); a test runs the step at 60 Hz
  and 30 Hz and asserts equal per-second behaviour within a declared tolerance, or documents why not.

Done when: desktop keyboard gives you a car you can drive laps with, and the tests above are green. Tuning is not finished
here (S5 finishes it), but the car must not be undriveable.

#### S2 Phone controller (M)

`race-controller/` (single-file PWA in the style of `companion/index.html`, copied into the APK assets by the same Gradle
task pattern). Landscape layout. Left thumb: steering (a horizontal touch strip or virtual wheel with a dead zone and
smoothing). Right thumb: throttle, brake, and one fire button (unused in Phase 0). **Multi-touch is mandatory**: pointer events,
`touch-action: none`, a screen wake lock, and a fullscreen or orientation lock on first tap.

Protocol (JSON text over WebSocket, keep it small and boring):

- `hello {name}` then TV `welcome {slot}` after the PIN check; slot 0-3.
- `i {q, ts, s, a, b, f}`: sequence number, the phone's `performance.now()`, steer -1..1, throttle 0..1, brake 0..1, fire bit.
  Sent at 30 Hz **and immediately on change**, always the **absolute** state. The TV keeps the latest by `q` and drops stale
  frames. A missing input for more than 250 ms zeroes throttle and holds steering, and shows "connection lost" on the phone.
- TV to phone: `ack {q, tvNow}` (for the probe) and `hud {speed, lap, pos, hp}` at about 10 Hz.
- Two phones connect at once, slots 0 and 1, and each drives its own car.

Probe: adapt `tools/latency-probe.mjs` to the new port and protocol. It reports RTT p50, p95 and max, drop count, and out-of-order
count under a scripted 30 Hz steering load for at least 60 s. Report **the age of the input at the moment the sim consumed it**
(TV clock minus phone clock, corrected by the ack handshake) as well.

Done when: two real Android phones (say which models) drive two cars on the desktop build over
the LAN; the probe runs and its numbers are in the log; unit tests cover the protocol's decode, stale-frame drop and the
250 ms hold. Note which of vibration, wake lock and fullscreen actually work on the phones used, and design nothing around
one that does not. iOS is out of scope for now (no iPhone available), so it is `not measured`, and the controller must not be built in a way that rules it out later.

#### S3 Real hardware measurement (M)

Run S1 + S2 on the Stick over real Wi-Fi. This is the slice the whole spike exists for. Measure:

1. **Frame time**: p50, p95 and **max** per 10 s window, at 1080p, with 2 cars, then 6 cars (S4 supplies the extra cars, so
   this slice re-runs once after S4). Grade the worst frame, not the mean; GC pauses hide in the mean.
2. **Input-to-photon**, optical, not estimated. Add a "flash test" mode: a tap on the phone sends an `i` frame that makes the TV
   render a full white frame on the next display frame, and the phone shows white on the same tap. Film both screens in one
   shot with a second phone at 240 fps. Count frames between the two flashes, at least 30 taps. Report p50, p95, max in ms.
3. **Network-only** RTT from the probe, idle and under 30 Hz load, as the PoC did (§7 of `docs/POC-FINDINGS.md`).
4. **Thermal and soak**: 15 minutes of continuous racing, note frame time at minute 1 and minute 15.
5. Which Stick, which Fire OS version, what Wi-Fi band. Also one run with a second device streaming on the same network.

Proposed thresholds (rubric, not physics; the owner's hands overrule them, per `genre-response-latency-norms`): optical
p50 <= 120 ms and p95 <= 180 ms; frame time p95 <= 16.7 ms and max <= 33 ms at 6 cars; no growth in tail latency over a 60 s
steering load (the PoC's failure mode grew without bound).

Done when: the numbers are in the log with the method and the device. A number not measured is written `not measured`.

#### S4 Collisions and AI drivers (M)

Car-vs-car (circle chains: impulse response with a restitution and a mass in `CarSpec`) and car-vs-wall. AI drivers follow
the centerline with a lane offset, look-ahead steering, and a speed profile from curvature. Follow the registry's authoring
rules for agents: a **state machine, not a utility system** (4 or fewer modes: drive, recover, overtake, wrecked),
hysteresis and dwell instead of re-scoring, an AI reaction must rest on a fact its perception produces, and log a **decision
trace** per AI per step so a headless test can explain a behaviour (`agent-behaviour-authoring`).

- Three skill tiers that differ in **skill** (line quality, braking accuracy, reaction delay), not only in a speed multiplier
  (`skill-scaling-versus-power-scaling`). An AI that cheats on physics is a category change, not a harder difficulty.
- No catch-up in the spike. Bounded catch-up is M4.
- Cap: 6 cars total in the spike and the MVP. A pairwise collision loop is fine at this size (`spatial-partitioning-threshold`: no structure needed below ~40 bodies).

Tests: an AI-only race of 6 cars completes N laps for 20 seeded runs without leaving the track, with no NaN, and finishes in a
declared time band; the same seed replays identically; two cars driven into each other separate.

Done when: you can race two phone cars against four AIs on the desktop build and the tests above are green.

#### S5 Feel pass (S)

Tune `CarSpec` values and the phone's steering smoothing against S3's numbers. If input latency is the dominant problem,
apply in this order, and record which one paid: (1) send on change and not only at 30 Hz, (2) a small steering
low-pass on the TV side tuned by ear, (3) dead-reckoning is **not** allowed (it hides latency by lying about the car), (4) escalate,
see kill criteria. Then one owner playtest: the owner drives three laps with a phone and answers the five questions in the S6
template. The playtest is observation first (`observation-before-interpretation`): what the owner did and saw, then what it means.

Done when: the owner playtest notes are in the log and the tuning changes are in data, not scattered constants.

#### S6 Spike verdict and Gate G0 (S)

Write `docs/concepts/DEATH-RIDE-SPIKE-VERDICT.md` using the template in section i. It reports every number from S1-S5 with its
unit, device and sample count, with each claim marked at its tier of truth (`tiers-of-truth`: T0 exists, T1 valid, T2 wired,
T3 behaves, T4 perceived). Feel is T4 and only the owner can certify it. The verdict recommends one of: **go**, **go with a
named change**, **stop**.

**Gate G0** (the owner decides, the session does not): unlocks Phase 1. Passing needs S3's numbers inside the proposed
thresholds or a written owner waiver, and an owner playtest that says driving is fun for a lap.

### Phase 1: the MVP (planned at card level; refine each card when you reach it)

The MVP question is "is this a game worth putting art into". Placeholder art stays. The MVP ends at G1.

#### M1 Combat core (M)

Machine gun (hit-scan or fast projectile, fixed rate), mines (dropped behind, arming delay, blast radius), one HP pool per car,
armor as damage reduction, a **wreck state**. From `realtime-combat-semantics`:

- **One authority for HP.** The HUD and the AI read it, they never keep their own copy (`single-source-of-health-truth`).
- **Hit dedup per activation.** Every mine blast and every ram contact has an identity that owns its set of already-hit
  cars, so damage is not applied per overlapping frame (`hit-dedup-per-swing`).
- **Wreck is a state tag** that targeting, AI perception, pickups and scoring all read, not a disabled controller
  (`death-via-state-tag-not-input-disable`).
- A mine is a positional area effect: it must be **visible before it kills**, with a measured arming time that exceeds the
  perception time plus the time to steer away at the car's top speed (`telegraph-or-homing-for-area-effects`). Small frequent
  damage (gun) does not telegraph.
- Type and unit every time value: cooldown, arming delay, blast duration, all in seconds.

Tests: a mine hits a car once per blast; a wreck stops counting for a lap; a gun cannot damage the shooter; determinism still holds.

#### M2 Track as data (M)

Tracks are data files: centerline, width profile, surface zones, pickup spots, spawn grid, and a **track linter** in
`race-core` (closed loop, minimum width vs car size, no self-intersection within the width, checkpoint order, straight vs
corner pacing) following `pacing-linter-rules` and `seed-determinism-contract` (store the plan, not just a seed). Author three
tracks: an oval, a technical track, a track with a chicane and a long straight. A generator is P2, not M2.

#### M3 Race flow (M)

Lobby (QR + slots, names, ready), grid, countdown, race, results and points, rematch. Phone HUD (speed, lap, position, HP, ammo,
wreck state) and a **vibrate** call on the phone when the car is hit (Android only, and not a design dependency). The HUD on the TV is
placeholder text. Add a controller layout with weapon fire and mine buttons.

#### M4 AI in combat and bounded catch-up (M)

AI fires and mines with a perception-based reason (it must "see" the target, use a reaction delay), uses attack **slots** so it
does not dogpile one car (`group-coordination-without-a-hive-mind`). Catch-up, if any, is a bounded, declared, visible
setting, not a hidden adjustment, and pays more for harder (`player-chosen-challenge-and-adjustment-hazards`). Start with a
declared difficulty tier and add no live adjustment unless a playtest says the race dies early.

#### M5 Garage and economy (M)

Upgrades (engine, tires, armor, weapon damage) as data with a cost curve; cash from finishing position and wrecks; a save file
on the TV; a garage screen driven from a phone. Do the **structural simulation before coefficients** (`structural-economy-simulation-before-numbers`):
walk faucets and sinks at unit rates first, flag a faucet above 50% of inflow, flag an upgrade with no cash sink, and check
for a winner-take-all loop (winning pays for upgrades that make winning likelier; `feedback-loop-topology-and-polarity`).
Then tune the top lever only, and only after a tornado sweep (`tornado-sensitivity-sweeps`).

#### M6 Placeholder audio and perf tiers (M)

Engine loop pitched by speed, impacts, gun, explosion, using CC0 clips (record each licence). Voice budget declared up front with
a per-event cooldown table (`event-priority-concurrency-cooldown`: ~50 ms for fast impacts, 100-200 ms for movement, 300-500
ms for alerts). A particle cap and one **declared hardware preset** for the reference device, never per-effect
overrides (`hardware-tier-lighting-presets` adapted; a second tier is added only if a weaker device is ever supported). Measure again on the Stick as in S3.

#### M7 MVP verdict, headless balance report, Gate G1 (S)

Run 2,000 seeded AI-only races per scenario (the registry's default; 1 sigma of about 1.1 points on a 50% win rate,
smallest difference worth reporting about 3 points, `monte-carlo-scenario-presets`), and report per scenario: race duration,
wreck count, kill share, one-shot rate (flag above ~5%), and time to first upgrade. Encounter length uses the registry's
alarm bands (a car dying in under ~5 s of contact is "punishing", a fight over ~45 s is "spongy", `encounter-duration-envelopes`).
Write `DEATH-RIDE-MVP-VERDICT.md`. **Gate G1** (owner): passing needs the MVP playable end to end with a session of three races
on the Stick, and the owner's answer to "would I put art into this".

## g. Test and gate discipline

- `race-core` has no Android or libGDX imports. Its tests run with `gradlew.bat :race-core:test` in seconds and must be green
  before any commit.
- Behavioural claims come from the headless deterministic sim, not from a screenshot. The renderer is checked by a few
  screenshots on the emulator, never by asserting on sim state through pixels.
- Every threshold lives in one place (`canon-as-single-source-of-thresholds`): a `Tuning`/`CarSpec` data file or a `Gates` object.
  A number found in two places means one is wrong.
- A check that can pass an arbitrary wrong number is only a shape check (`shape-check-vs-content-invariant`): a lap test asserts
  the lap count and a track linter asserts geometry, not "the file parses".
- Cheap checks never make a milestone `runtime-verified`. The Stick run is the top rung.
- A run that exceeds its wall-clock budget is `unverifiable`, not `fail`.
- Any new engine or Android pitfall found (a libGDX quirk, an ABI trap, a Fire OS behaviour) is written as a short atomic entry in
  `docs/concepts/DEATH-RIDE-PITFALLS.md`: incident, cause, what to do, date, source. This is the seed of the game-development
  knowledge the owner wants to grow, and it is the file to offer back to the registry after G1.

## h. Kill criteria and STOP points

| Trigger | Action |
|---|---|
| Optical input-to-photon p95 > 250 ms after S5's ladder is exhausted | STOP. Report. Options for the owner: a gamepad-first design, WebRTC data channel (unordered, no head-of-line blocking) or a native phone app. |
| Tail latency grows over a 60 s steering load (the PoC signature) | Find the cause with `tail-diag.mjs`-style two-path measurement before touching the network. The PoC's cause was app-side. |
| 6 cars cannot hold 30 fps on the reference Stick 4K at 1080p after removing effects | STOP. The minimum requirements (section n) tighten, or the car count or renderer changes. Decide with the owner. |
| The APK will not start on the Stick for an ABI or GL reason after one fix | STOP and ask. |
| Collision work in S4 exceeds one session | Try D4b (Box2D behind the same interface); record it. |
| The owner's playtest says driving is not fun after S5 | Do not proceed to Phase 1. The verdict says so plainly. |
| Any slice wants real art before G1 | Refuse. Placeholders only until G1. Assets are original, nothing is copied from the arcade game or from the Death Rally titles. |

## i. Spike verdict template (for S6)

1. What was built, and on which devices (model, Fire OS version, phone models, Wi-Fi).
2. Numbers table: metric, value, unit, n, method, device, tier of truth. `not measured` where not measured.
3. Owner playtest: what I did, what I saw, what I felt (three separate lines each).
4. The five questions: Does steering feel connected? Can I recover from a slide? Is the phone comfortable for 10 minutes? Would I
   race again? Does anything feel late?
5. Risks that got smaller and risks that got bigger.
6. Recommendation: go, go with a named change, stop. One paragraph.

## j. Owner decisions (answered 2026-09-30)

| # | Question | Answer |
|---|---|---|
| O1 | Reference device | **Amazon Fire TV Stick 4K**, about 2 GB RAM (owner's figure; record the real number with `adb shell cat /proc/meminfo` in S0). The PoC ran on model `AFTKM`, Fire OS 8.0 (Android 11), ARM (`docs/POC-FINDINGS.md`); confirm it is the same unit. Weaker devices are not a target: the plan states **minimum requirements** instead (section n) and does not build a second tier. |
| O2 | iPhone for controller tests | None. Android phones only. iOS is `not measured`. |
| O3 | Box2D fallback (D4b) | Not answered, default stands: acceptable if pure Kotlin collisions cost more than a session. |
| O4 | Car count | **6**, for the spike and the MVP. |
| O5 | Vibration / fire button | Not answered, default stands: phone-only in Phase 1; input frames stay gamepad-compatible. |
| O6 | Name | **Death Ride** (renamed from Death Race to stay clear of the 1976 arcade game). IP and licensing are otherwise not a topic at this stage. |

## k. Session log

(none yet: the first entry is written by the session that runs S0)

## l. Knowledge used (all paths relative to `C:\Users\kazda\kiro\ai-registry`; `GP` = `knowledge/game-production`)

Read these only when the slice cites them. The registry has **no** subject for vehicle handling, drift, racing AI
rubber-banding, or the phone-to-TV network link, so those are the parts this project has to learn by measuring, and they
belong in `DEATH-RIDE-PITFALLS.md` and the verdicts.

| Need | Path |
|---|---|
| Latency norms as a rubric, measured never estimated | `GP/asset-production/motion-and-audio/motion-quality-gating/techniques/genre-response-latency-norms.md` |
| Fixed step, determinism, deferred mutation | `GP/engine-integration/gameplay-runtime-patterns/techniques/update-order-and-frame-coherence.md` |
| Allocation and GC in the hot path (critical on Android) | `GP/engine-integration/gameplay-runtime-patterns/techniques/allocation-discipline-in-the-hot-path.md` |
| Data objects over subclass growth; spatial threshold | `GP/engine-integration/gameplay-runtime-patterns/techniques/data-driven-type-objects-over-subclass-growth.md`, `.../spatial-partitioning-threshold.md` |
| Combat semantics (HP authority, dedup, wreck tag, telegraph) | `GP/systems-canon/realtime-combat-semantics/` |
| Fight length and tension envelopes | `GP/balance-validation/combat-pacing-and-dramatic-arc/techniques/encounter-duration-envelopes.md`, `.../intensity-and-threat-tension-curve.md` |
| Headless AI-vs-AI simulation, goal seek, iteration counts | `GP/balance-validation/encounter-balance-simulation/techniques/` |
| AI behaviour: state machine, commitment, perception, slots, decision trace | `GP/systems-canon/agent-behaviour-authoring/techniques/` |
| Difficulty: skill vs power, adjustment hazards | `GP/balance-validation/difficulty-design-and-adaptation/techniques/skill-scaling-versus-power-scaling.md`, `.../player-chosen-challenge-and-adjustment-hazards.md` |
| Economy: structure before numbers, sinks, sweeps, loops | `GP/systems-canon/game-economy-tuning/techniques/` |
| Tracks and pacing lint, seed contract (M2, P2) | `GP/balance-validation/procedural-level-planning/techniques/` |
| Sprite, atlas, palette, autotile (P3) | `GP/asset-production/surface-and-imagery/sprite-and-atlas-production/techniques/` |
| Tiling seams (P3) | `GP/asset-production/surface-and-imagery/tiling-texture-acceptance/techniques/` |
| Music intensity tiers, voice budget, spatial cooldowns (M6, P3) | `GP/asset-production/motion-and-audio/adaptive-music-authoring/`, `.../spatial-audio-scene-authoring/techniques/event-priority-concurrency-cooldown.md` |
| Generated audio and image acceptance (P3) | `knowledge/media-generation/audio-generation/`, `knowledge/media-generation/visual-generation/generated-output-grading/`, `.../character-identity-continuity/` |
| Gate before every generation credit, placeholder is not an asset (P3) | `GP/content-pipeline/generative-artifact-gating/techniques/` |
| Tiers of truth, headless timestep, unverifiable is not fail | `GP/engine-integration/runtime-observation-evidence/techniques/` |
| Playtest to defect routing | `GP/craft-judgment/playtest-signal-to-defect/techniques/` |
| Unattended-loop honesty (no self-certifying gates) | `GP/craft-judgment/unattended-build-loop/` |
| One authority per threshold | `GP/systems-canon/design-canon-as-executable-law/techniques/canon-as-single-source-of-thresholds.md` |
| Vertical slice first, fixed-deadline triage | `GP/production-governance/production-work-prioritization/techniques/vertical-slice-as-the-first-milestone.md` |
| Cross-cutting laws | `GP/_laws.md` |
| Skipped as engine-specific (Unity/Unreal/3D) | `engine-integration-safety`, `crash-forensics-attribution`, `visual-script-to-code-transpilation`, the 3D parts of `shader-budget-authoring` |

## m. Phases 2-4 (the vision, deliberately not sliced)

- **P2 Game depth.** Career and championships, a car roster, a weapon roster, more upgrade families, a track generator
  (with the linter as its acceptance), spectator or split-screen ideas, saved profiles per phone. Sliced after G1 from the MVP
  verdict's findings, not from this list.
- **P3 Art, audio, music, characters: the experiment programme.** Owner decision D2 says this is where game-development
  knowledge gets grown by experiment. The shape: a fixed **art bible** first (palette, angle, scale, silhouette rules), then
  small **bounded experiments** with a stated hypothesis, a budget in credits and a gate before every spend
  (`gate-before-every-credit-spend`), for example "can a top-down car sprite be generated at 32 headings that keeps one identity";
  "can a tileset autotile cleanly (47 cases for 8-neighbour)"; "can generated engine and impact sounds loop and stay under a voice
  budget". Each experiment produces a verdict and a registry-ready technique note. Use the `leonardo` and `illustrate` skills
  and `knowledge/media-generation`. CC0 kits (for example Kenney's racing packs) are the honest baseline to beat.
- **P4 Ship.** Amazon Appstore requirements and review, a relay transport for networks where the LAN
  path is blocked, the Vega question in `docs/PLATFORM-RISK.md`, and performance tiers for the weakest supported Stick.

## n. Minimum requirements (replaces "weaker devices")

Proposed, to be confirmed by S3 and S6, and written into the store listing in P4:

| | Minimum |
|---|---|
| Device | Fire TV Stick 4K class or better, Fire OS 8 (Android 11, API 30). The reference unit is the owner's Stick 4K. |
| RAM | about 1.7 GB (measured on the reference Stick). The app's heap budget is decided in S3 from a measured `dumpsys meminfo`, not guessed. |
| Output | Rendered at 1080p. |
| Phone | An Android phone with Chrome, on the same Wi-Fi network as the Stick (5 GHz preferred; the band is recorded in S3). iOS is untested. |
| Not supported | Vega OS devices, Fire TV Stick HD/Lite class hardware, networks with client isolation until the relay exists (P4). |

`minSdk` stays 28 in the Gradle files as inherited from `tv-app`. If S3 shows Fire OS 7 devices are fine, that is a bonus, not
a promise. The plan supports one preset for the reference device; no Lite tier is built.
