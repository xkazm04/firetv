# D1 — Drift research and scale law (2026-10-01)

Design before implementation. Branch `deathride/drift`; original tuning only. Read W1/W3/W2, PITFALLS and OWNER-CHECKS, then the two authorized registry subjects and their handling techniques (read only). Current content is C1–C4: **ten** classes, not the historical W2 five. The five human steering profiles remain approved. Nothing in this stream is owner-felt yet.

## Research actually consulted

Web retrieval 2026-10-01. These are references for mechanisms, not coefficients to transplant.

| Primary source | Evidence and our decision |
|---|---|
| Marco Monster, [Car Physics for Games](https://asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html) (author's article preserved in a mirror) | Separates body velocity from heading, axle slip, normal load and yaw torque. Use the two-axle reduction and world-space momentum; do not set velocity from heading. No source/demo code copied. |
| NVIDIA, [PhysX Vehicles](https://nvidia-omniverse.github.io/PhysX/physx/5.4.0/docs/Vehicles.html), tire-force and friction-vs-slip sections | Tire forces share a friction budget; slip response rises then falls toward a sliding plateau. Use an inexpensive continuous curve and a per-axle friction circle, with a low-speed guard. No PhysX dependency. |
| Edy, [Vehicle Physics Pro tires](https://vehiclephysics.com/blocks/tires/) | Distinguishes peak and sliding friction; longitudinal slip reduces sideways capacity. Use separate front/rear capacity so handbrake, drive and trail-brake can break rear traction differently. Its example values are not our tuning. |
| Avalanche, [Vehicle Physics and Tire Dynamics in Just Cause 4](https://gdcvault.com/play/1026468/Vehicle-Physics-and-Tire-Dynamics) (GDC 2019 public abstract; video not viewed) | The abstract argues for fewer designer-facing parameters than a full semi-empirical tyre formula. Choose a small rational fall-off curve, not a full Pacejka/suspension/drivetrain simulation. |
| Matthew Harris / Criterion, [Vehicle Feel Masterclass](https://www.gdcvault.com/play/1025295/Vehicle-Feel-Masterclass-Balancing-Arcade) (GDC 2018 public abstract; video not viewed) | Explicitly treats camera and assists as part of vehicle feel. Keep the shared camera readable; use skid direction, smoke and a small haptic transition cue. Camera lean is deferred because rotating a shared two-player view can obscure the other driver's line. |
| BeamNG, [official 0.25.2 release notes](https://beamng.com/game/news/patch/beamng-drive-v0-25-2/) | Speed steering reduction and oversteer assistance are separate controls. Preserve profile input shaping; make drift correction a bounded vehicle law that fades as slip approaches a spin, rather than silently recentering touch input. |
| Nintendo, [Mario Kart 7 manual](https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/3DS_mario_kart_7_eng?_a=DATC1RAAZAA0) and [Nintendo of America mini-turbo tutorial](https://www.youtube.com/watch?v=yeju5WcQr8A) (official description and manual search excerpt) | Drift-linked boost is a deliberate reward mechanic, not conservation of momentum. It is evidence that boost exists, not that Death Ride needs it. No drift boost, currency, score payout or AI-exclusive reward in D2. Quality first feeds presentation. |

The research does not establish that any chosen coefficients are enjoyable on glass. Touch keeps W1 relative drag, full normalized range, dead zone, exponent and slew exactly once in core. Do not shrink travel or multiply input during a slide. Preserve independent DRIFT/GO/brake releases. Extra countersteer authority, when present, depends on speed/slip and front traction, applies to every driver, and cannot guarantee a save after a late input.

## Diagnosis of the checked-out implementation

`SlipHandling` shapes input, computes target yaw from steering plus a slip-restoring term, exponentially follows that target, rotates heading, damps/clamps body lateral velocity, and integrates longitudinal drive/brake. Roster cars add surfaces, bounded load transfer, handbrake lateral-grip reduction, yaw increase and drag. Brake never creates reverse, but the current unconditional forward clamp also deletes legitimate backward momentum during a spin. Mass affects contact impulses, **not handling**. Shape affects contacts and AI lookahead, **not yaw inertia**.

The `drifting` flag is presentation-only (snapshot skid effects and phone HUD); it does not select forces. Entry is `0.22 rad`, exit `0.10 rad`, minimum speed `4 m/s`, owned by `movement.csv`. Held handbrake prevents the low-slip exit; low speed always exits. The registry correctly identified a missing witness: no prior test sustains the angle between exit and entry while checking both histories. D1 adds that witness without changing tuning.

## Scale law and data ownership

Let mass be `m`, visual/contact length `L`, width `W`, wheelbase `l = wheelbaseFraction * L`, track `t = trackFraction * W`, CG height `h`, and static front-load fraction `f`. Distances from CG to axles are `a = (1-f)*l`, `b = f*l`. Uniform rectangle yaw inertia is:

```
Iz = inertiaScale * m * (L² + W²) / 12
Fzf = m*g*f - m*ax*h/l       Fzr = m*g - Fzf
side load transfer / weight = ay*h/(g*t)
alphaF = atan2(vSide + a*yaw, abs(vForward)) - wheelSteer
alphaR = atan2(vSide - b*yaw, abs(vForward))
Fx² + Fy² <= (mu * Fz)²     yawAcceleration = (a*Fyf - b*Fyr)/Iz
```

Bound axle loads away from zero and filter transfer with the existing response time. Use actual acceleration/deceleration rather than calling any released throttle a lift-off. Lift after power shifts load forward; the lighter rear axle loses lateral budget. Brake splits longitudinal demand between the axles; rear braking plus forward transfer can oversteer. Rear drive uses the rear circle; excessive power trades cornering for acceleration. Handbrake reduces rear lateral capacity and adds rear braking, not a global velocity kill. A curve rises toward a peak slip angle, then smoothly falls to a nonzero sliding fraction.

**Mass cancellation must be honest.** With constant `mu`, `F/m = mu*g`: doubling mass alone does not double stopping/sliding distance. Doubling dimensions at constant mass increases inertia fourfold while axle leverage grows twofold; yaw acceleration falls. We will introduce a small, explicit tyre load-sensitivity exponent: capacity grows slightly less than normal load. Tire support scales with width; a heavier load per supported width lowers effective sliding friction. This is an arcade material assumption, not a measured tyre. It gives heavier cars longer slides in addition to greater absolute momentum `p=m*v`, without claiming that mass alone defeats Coulomb friction. Larger inertia also makes them harder to catch once rotating. A long, narrow Comet/Kestrel has a long wheelbase and large radius of gyration, yielding a wide stable arc; Needle/Quill have short arms but much smaller inertia, so flick quickly and can over-rotate.

Authorities: `car-shapes.csv` owns L/W; stat mapping owns mass, engine/braking, grip and handling; new `drift-geometry.csv` owns per-class wheelbase fraction, CG height/load split and inertia scale; new `drift.csv` owns curve/assist/transfer constants with units and slider bounds. Derive SI geometry/inertia once when building a spec, including mass upgrades, rather than store a second stale mass or length. A generated CSV report of derived values is evidence, never another input authority.

## D2 implementation contract and declared feel changes

Retain the approved five profile rows, touch geometry, shaping and the original no-roster Spike fixture. Roster physics will use axle slip/capacity and a torque-limited yaw response. A low-slip arcade yaw controller preserves the intent of the approved response; physical axle imbalance and inertia become more influential as the tyres slide. Its assistance must fade smoothly beyond useful drift angles. Keep world velocity continuous through heading changes, including backward travel caused by a spin; brake opposes travel instead of manufacturing reverse.

Grip driving is **not promised bit-identical**: body dimensions now influence yaw response, tyre budget is shared, and braking/lift affect rear load. D3 reports class and profile traces rather than claiming that untouched CSV profiles imply unchanged dynamics. No branch on `human` in force laws; AI stays a grip driver, chooses corner speed from the shared grip limit, releases handbrake, and uses ordinary countersteer when sliding. No direct yaw/velocity assignment for recovery.

Slip beyond an authored threshold records a spin. Reduced assist follows continuous slip, not the presentation flag. Recovery requires time and a physically settled car; a timer is not an immobilization or an automatic rotation animation. Bad inputs must cause actual heading/trajectory loss, lower exit speed or a wall impact through the existing damage system. Quality combines useful slip, entry-speed retention, duration and smooth countersteer; spins/wrecks clear it. No monetary/speed reward.

## D3 calibration and truth tiers

Drift Lab will run all ten classes at several entry speeds through steer step, handbrake pulse/hold, power, lift, brake-in-corner, and early/on-time/late countersteer. Record time series and summaries (slip, speed retention, yaw response, spin onset, recovery time, exit speed). Include controlled dimension/mass perturbations to distinguish physical scaling from confounded class stats. Calibrate from those traces class by class, retain before/after evidence and explain rejected tunings.

Checks: sustained hysteresis band, finite state at zero/reverse speed, friction circle, energy without drive, actual spin versus caught slide, recoverability for every class, replay hash and warmed zero allocation, existing finish/roster/combat/economy tests. A desktop libGDX calibration view gets live data sliders, class/profile selection, slip/speed overlay and export; changing a slider affects the next simulation tick. Owner exercises are hairpin, sweeper and chicane for every class.

Device identity is `dev.deathride.driftlab`, distinct from the concurrent integration app. Use a separate listener port for coexistence. Scan the local /24 at 5555; measure effects-on frames only when actually running this package. An occupied device or unavailable network is logged as unmeasured, not replaced by desktop timing. Headless = simulated; device frames = measured; fun, thumb comfort and calibration acceptance = owner-felt only after the owner says so.

## Stock scale witness before tuning

Computed from checked-out shapes and mass mapping; uniform rectangle (`inertiaScale=1`), momentum at 22 m/s. These are derived quantities, not measured tyre properties.

| Class | Mass kg | Length m | Width m | Rectangle Iz kg m? | Momentum kg m/s |
|---|---:|---:|---:|---:|---:|
| Needle | 640 | 6.6 | 3 | 2803 | 14080 |
| Line | 1210 | 7.8 | 3.75 | 7553 | 26620 |
| Bastion | 2350 | 9.3 | 4.65 | 21172 | 51700 |
| Comet | 1210 | 9 | 3.5 | 9403 | 26620 |
| Trail | 1020 | 6.9 | 3.9 | 5340 | 22440 |
| Flint | 1400 | 7.1 | 4.1 | 7842 | 30800 |
| Quill | 830 | 6.7 | 3.2 | 3813 | 18260 |
| Vandal | 1970 | 8.2 | 4 | 13665 | 43340 |
| Kestrel | 1020 | 9.15 | 3.3 | 8042 | 22440 |
| Bulwark | 2350 | 9.3 | 4.6 | 21081 | 51700 |
