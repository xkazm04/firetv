# Death Ride: the drift stream (D1-D3)

Written 2026-10-01 from the owner's note:

> "Research the ability to drift: losing control in a drift, keeping its momentum, and the skill to manage the drift is one of the most satisfying parts of racing games, though hard to calibrate
> and it needs to be calculated with size and proportional weight of the vehicles."

Owner decisions so far: the five steering presets are approved as they are (W1-W3); cars are about 50% larger; classes differ strongly (heavy bruiser, light sports, and others). W3 already has a handbrake drift state with hysteresis
(`Movement.kt`, `movement.csv`, `DriftTest.kt`), load transfer and surfaces. The forge notes `top-down-vehicle-handling-model` and `steering-feel-profile-shaping` in the registry (`ai-registry`, branch `forge/racing-tv-games`) record what is known
and what is only simulated. Nobody has felt any of it.

## Goal

A drift that is **a skill, not a mode**: the car can be thrown into a slide, the player *feels* it lose then regain grip, momentum is kept through the slide (speed bled in a controllable way, not killed), the player manages it with steer,
throttle and brake, and a mistake **loses control for real** (a spin, a wall hit, lost time) so mastery is rewarded. The same inputs must feel different per car because mass, size and inertia differ.

## D1 Research and diagnosis (design note first, with sources)

- Research how top-down and arcade racers produce satisfying drift: slip-angle-based tyre force curves (peak then fall-off), the friction circle (traction shared between braking, throttle and cornering), lateral versus longitudinal grip,
  handbrake versus power-over versus lift-off oversteer, counter-steer assist and its limits, momentum conservation through a slide, drift-boost and scoring only if the evidence supports them, camera and effect feedback (tyre smoke, skid marks,
  camera lean), controller input shaping for touch (drag steering and its range during a slide).
- Read the registry notes (`C:\Users\kazda\kiro\ai-registry\.claude\worktrees\forge-racing-tv\knowledge\game-production\racing-vehicles\top-down-vehicle-handling-model` and `steering-feel-profile-shaping`) and the Death Ride W1/W3 notes.
  State what the current model does: yaw lag, slip restoring, bounded load transfer, a presentation-only drift flag, hysteresis between 0.10 and 0.22 rad (the forge found no test holds slip between those thresholds).
- **Scale law**: derive how drift behaviour must scale with a vehicle's length, width, mass and yaw inertia (moment of inertia of a rectangle, wheelbase as a lever arm, centre of mass, load transfer proportional to height over track width,
  grip proportional to normal load). Write the formulas, then map them onto the existing stat model so the classes drift differently *for physical reasons*: the heavy has a long slide, is slow to start, has high momentum and is hard to catch;
  the light rotates quickly, is easy to flick and easy to over-rotate and spin; the long dragster is stable at speed with a wide arc. Derived parameters stay in data (CSV), one authority per number.

## D2 Drift model, implemented data-first in `core`

- Implement the chosen model in the deterministic 60 Hz step (no allocation, no wall clock, same determinism and allocation tests as before): per-axle slip angle with a saturating tyre curve (or the simplest arc that reproduces the target feel),
  friction-circle sharing so braking and throttle trade against cornering grip, lift-off and brake oversteer, a controllable handbrake slide, momentum retention through the slide, speed-and-angle-dependent counter-steer authority, and
  **real loss of control** beyond a threshold slip angle (spin-out with recovery time and wall consequences).
- A **drift quality signal** computed in core (slip angle, speed retained, time held, counter-steer smoothness), used for presentation first (smoke, skid marks, a phone vibration) and optionally a small speed-boost reward only if the research
  supports it and the economy and AI balance tests still hold.
- AI: the existing AIs corner from the grip limit (`ai-corner-speed-from-grip-limit`); decide explicitly whether AI drives with drift (a hard-corner tier) or grips; they must not cheat physics. Keep the finish and balance tests green.
- Keep the five approved steering presets working; the drift model must not change grip-driving feel beyond what is declared; document any change.

## D3 Tests, calibration tooling and owner checks

- **Drift Lab**: a headless scenario runner that drives scripted inputs per car class (entry speed sweep, steer step, handbrake, lift-off, brake-in-corner, countersteer timings) and reports slip angle over time, speed retained, time to recover,
  spin-out threshold, exit speed; a per-class table in a design note. Assert content (class ordering that follows from mass and inertia; a heavy keeps more momentum and takes longer to rotate; a light rotates faster and spins more easily;
  no class has a drift that cannot be recovered with a correct input; determinism; zero allocation).
- A **desktop calibration screen** (libGDX desktop launcher) with live sliders for the data parameters and a slip-angle and speed overlay, so the owner can tune by feel at the PC, plus the existing live `FeelProfile` switch for the Stick.
- On the Stick: install under app id `dev.deathride.driftlab` (another run uses `dev.deathride.tv`; never replace it), scan the /24 for port 5555, verify the frame budget with the drift effects on.
- `OWNER-CHECKS.md` entry: per class, three exercises (a hairpin entry, a long sweeper, a chicane flick), with words for what good and bad feel like (grabby, floaty, snaps back, spins too easily, cannot hold a slide) so owner feedback is directly usable.
- Honest tiers of truth: simulated versus felt; nothing is "felt" until the owner says so. Report what remains hard to calibrate.

## Rules

Original work only; no copying of any game's tuning. Build green at every commit (`:core:test :link:test :app:assembleDebug`). Branch `deathride/drift`, one commit per wave (D1, D2, D3), a design note per wave in `docs/concepts/deathride/`,
status rows in this file, a session log. Never push, never ask a question.

| Id | Wave | Status |
|---|---|---|
| D1 | Research, scale law, design note | complete — [research and scale law](deathride/D1-drift-research.md); baseline full suite and added hysteresis test green |
| D2 | Drift model in core, data-driven, class-scaled | not started |
| D3 | Drift Lab, calibration screen, Stick check, owner checks | not started |
