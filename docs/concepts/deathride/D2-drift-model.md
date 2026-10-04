# D2 — Data-first drift implementation (2026-10-01)

Implementation follows [D1](D1-drift-research.md). The original no-roster fixture remains for W1 regression traces. Roster cars use the same deterministic axle solver for humans and AI. All five approved feel rows remain byte-for-byte unchanged.

The solver keeps a bounded arcade yaw servo near grip, blends toward axle torque as slip/handbrake grow, and reduces corrective assistance at very large slip. This deliberately changes roster dynamics; it does not claim a full suspension/tire simulation. Longitudinal and lateral forces share each axle's circle. Normal loads follow acceleration and CG height/wheelbase; lateral transfer depends on height/track width. Dimensions and upgraded mass derive yaw inertia. Tire load sensitivity is explicit and mild.

Drift quality has no economic or speed reward. Spin recovery is a measured state that needs low slip and yaw for a settling interval, not an auto-realignment. The ordinary wall/contact/damage path remains responsible for consequences. AI explicitly chooses grip driving and never applies handbrake to initiate a slide; it must recover using ordinary inputs.

Validation and calibration findings will be appended after executing the solver and all gates. Values at this stage are authored, not felt.

## Implemented laws and ownership

`drift-geometry.csv` adds wheelbase/track fractions, CG height, front-load fraction and rectangular inertia scale for all ten classes. `CarSpec` derives length/width from the existing contact shape and yaw inertia from the **current** mass, so armor/mass upgrades cannot leave a stale inertia. `drift.csv` owns tyre peak/falloff, load sensitivity, force sharing, assist and spin/quality controls with units and calibration bounds. The old W3 path remains accessible only when a spec has no drift geometry; D3 can use that path as a baseline comparator without copying its coefficients.

At each 60 Hz tick the roster solver:

1. Consumes the existing shaped steering/throttle and brake override. Splits world velocity into body components without changing it to match the new heading.
2. Filters front/rear load transfer from the preceding tick's actual longitudinal acceleration, including drag and speed limiting. Axle loads stay positive; bounded side transfer uses CG height/track width.
3. Computes front/rear slip using contact velocity including yaw and front steering. The curve rises to a peak then approaches a sliding plateau. Force capacity scales with normal load, surface and the authored load-sensitivity exponent.
4. Allocates drive/brake force, then computes the lateral budget `sqrt(capacity²-Fx²)` separately for each axle. Handbrake brakes and reduces grip at the rear. No full-vehicle handbrake velocity multiplier.
5. Blends the low-slip yaw servo toward axle torque as slip/handbrake grow. Servo response scales with `Iz/(mass*wheelbase)`; its torque is bounded by available axle forces. Countersteer authority grows with speed and useful slip, then fades before a spin. The front drive force's steering component also contributes to available yaw torque.
6. Integrates forces in world space, preserving backward momentum if the car rotates past its direction of travel. Brake opposes existing travel and cannot create reverse. Sliding reduces the old artificial rolling-drag rate; tyre work still dissipates speed.
7. Derives slip, hysteretic presentation state, spin state and quality. A spin needs at least 0.40 s settled below the slip/yaw limits before its indicator clears. No timed steering lock or automatic heading reset. Contact resolution refreshes these signals without advancing timers again; wrecks reset them.

Quality multiplies useful angle, speed retained from entry, held duration and filtered steering smoothness. It feeds snapshot skid width, atlas skid/smoke intensity, and a threshold-crossing phone haptic with a cooldown. Browser vibration support and physical-phone feel are unmeasured. There is no drift score, currency, hidden engine force or boost.

AI deliberately drives for grip. It estimates corner speed from the same surface/load-sensitive lateral limit as the solver, caps its acceleration request by the friction circle's remaining budget, and uses ordinary countersteer/throttle release after excessive slip. The common force path has no human/AI power branch.

## Findings while implementing

- The first axle model stranded one car in the all-offtrack race: removing throttle-dependent low-speed steering had removed wall recovery. Restored the existing launch-steering term, through the common input/force path. No position or yaw teleport.
- A later torque-bound check exposed an ice race failure: the old AI could request full engine/brake and full cornering simultaneously. The new circle correctly refused that request. Corrected the AI's acceleration request rather than granting it extra grip. Included the rotated front longitudinal force in the yaw-torque bound.
- A controlled 0.5 s unpowered slide with identical geometry and double mass retains more speed (17.54 versus 17.20 m/s in the focused witness) and greater absolute momentum. The lighter car's kinetic speed does not grow. This isolates load sensitivity from the confounded stock-class acceleration/grip differences.
- Initial 22 m/s, one-second handbrake probes retain roughly 68–79% speed and recover with a scripted correction in 0.22–0.67 s. Prolonging the hold causes actual spins in the small light cars; the short pulse does not. **This is provisional numerical calibration.** In particular the stock heavy gets into a smaller angle under the same pulse, so its shorter recovery in that test does not establish that an equal-angle heavy slide is easier to catch. D3 must report both controlled-state and scripted-entry comparisons.
- Unmodified five-profile/no-roster traces retain their original acceptance bands. Roster feel changes are declared: inertia-dependent turn-in, shared traction during acceleration/braking, rear-load movement, continuous sliding momentum and real over-rotation. Do not call the entire roster's grip feel unchanged merely because `feel.csv` is unchanged.

The contact solver remains W3's bounded arcade impulse approximation; this wave does not claim conservation of angular energy in multi-circle contacts. No owner has driven these values yet.

## Wave gate

Final `:core:test :link:test :app:assembleDebug` passed in 5m20s with the isolated app-id property: **96 core + 3 link tests**, no failures/errors/skips. Includes existing course finishes/replays, roster, economy, combat, five feel-profile bands and zero-allocation tests, plus the new drift witnesses. The added allocation witness exercises ten moving classes across repeated drift/spin entries for 10,000 measured steps after warmup. Evidence: `deathride/evidence/drift/d2/` (initial/final entry probes, focused failure/fix logs, final build and test XML/counts). Device performance and owner feel remain unmeasured; D3 owns those checks and broader tuning.
