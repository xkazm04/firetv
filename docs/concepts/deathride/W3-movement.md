# W3 Movement — design before implementation (2026-09-30)

[Box2D's simulation documentation](https://box2d.org/documentation/md_simulation.html) distinguishes restitution (normal rebound), friction (tangent response), and mass. We use those concepts in our existing pure Kotlin two-circle solver, not a new engine. [Vehicle Physics Pro's vehicle dynamics reference](https://vehiclephysics.com/advanced/how-suspensions-work/) provides a public reference for longitudinal weight transfer. This arcade model approximates its consequence with a bounded load state, not a suspension solver.

Registry: `_laws.md`, `update-order-and-frame-coherence`, allocation discipline. Keep the 60 Hz order: consume inputs, choose AI, apply surface/load/forces, contain, resolve contacts, account laps, capture snapshots. No structural mutation inside contact iteration; ram energy accumulates for W4 damage consumption once per step.

## Data and controls

One movement-rules CSV owns transfer response and grip influence, throttle understeer, handbrake grip/yaw changes, drift entry/exit hysteresis, kerb/verge widths, wall tangent loss, collision spin and ram threshold. One surfaces CSV defines Asphalt, Gravel, Oil, Ice, Kerb, Offtrack with grip and drag. The current stadium can select a practice surface live (phone settings; TV MENU); W6 track patches will reuse the same definitions. A near-edge kerb and outer verge remain inside the hard wall so off-track loss can be felt without escaping the course.

Handbrake is an absolute input, reset on stale/reconnect/blur. Add a deliberate HOLD DRIFT button and desktop Shift. The drift state enters only with speed and lateral slip; release plus low slip exits with hysteresis. Transfer loads the front on brake, unloads it on throttle; handbrake unloads rear grip and increases yaw authority. The original standalone Spike fixture remains available with no roster class for historical traces. All roster cars use advanced movement.

Car contacts split positional correction and impulse by inverse mass, use each car's radius/offset and restitution, apply bounded lever-arm spin, and record ram severity above a speed threshold. Wall response retains tangential travel while head-on normal energy is lost; wall damage is deferred to W4. No boost: speed and grip already supply a testable tradeoff and another button lacks evidence of value.

## Validation

Assert heavy/light impulse ratio and linear momentum, glancing versus head-on retained speed, surface drag/grip ordering, held drift and recovery, brake transfer sign, stale handbrake release, determinism, zero allocations. AI sees the same grip limit and lowers corner speed, with no physics cheats; seeded six-car races must finish on each authored practice surface. Historical wave evidence stops being overwritten: tests write generated reports to build/reports, copied to wave evidence only when that wave is validated.

## Measured behavior

25 core + 3 link tests and APK build green. Fixed 60 Hz Windows JVM: 18 seeded races, six finishes each, deterministic paired replays.

| Surface | Three-lap six-car finish range s | n races |
|---|---:|---:|
| Asphalt | 69.350?72.050 | 3 |
| Gravel | 83.733?87.367 | 3 |
| Oil | 97.050?102.167 | 3 |
| Ice | 115.217?121.267 | 3 |
| Kerb | 77.350?81.267 | 3 |
| Offtrack | 149.567?160.683 | 3 |

Initial ice run failed the 180 s completion requirement for Bastion. The AI applied grip once in the lateral acceleration corner limit and again as a speed multiplier. Removing that duplicate corner reduction fixed completion without adding power. Offtrack-only runs are deliberately severe; ordinary play has only an outer verge. Mass contact test conserves linear momentum and yields the expected 3:1 velocity-change ratio for 600/1800 kg; angular spin is a bounded arcade approximation, not conservation of angular energy. All advanced movement allocates zero bytes across 10,000 warmed steps.

Stick check: release id/label installed on AFTKM. `tools/wave-check.mjs ... 3` passed all practice surface switches and a real multi-touch throttle/steer/handbrake drift, plus selection/start/lobby. Remote MENU selected Gravel. APK SHA-256 `ee152609e4dd8f6cd7743f15a7e0b048d42cb0d9d1e17a449d26e446df95d06f`. Optical latency, physical-phone ergonomics and owner feel not measured.
