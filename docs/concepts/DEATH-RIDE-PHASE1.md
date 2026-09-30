# Death Ride: Phase 1, core mechanics before art

Written 2026-09-30. Supersedes slices M1-M7 of `DEATH-RIDE-PLAN.md` (sections b and f); the rest of that plan (decisions D1-D6,
vision, kill criteria, minimum requirements) still stands. Read it first.

## a. Where we are: the spike outcome

The spike was run as a three-seat contest (six variants, no LLM judge, the owner played each on the Fire TV Stick 4K with an Android
phone). **Winner: variant `C/2`, "Slipstream"**, promoted into `deathride/` on this branch. Owner verdict, verbatim:

> Competitor C did the best. C/2 is the winner as good practice camera angle in this genre. The control is functional but turning tough -
> we will need to research and execute calibrations to sensitivity of steering and acceleration, control layout looks fine but will need
> rethink once weapons will be part of the game. The performance overall was smooth and reactions immediate.

What that fixes, and what it opens:

| | State |
|---|---|
| Camera | Settled: look-ahead follow camera plus minimap. Keep it. Tune, do not replace. |
| Performance | Smooth on the Stick. Idle frame p50 16.7 ms, p95 about 21 ms, on the AFTKM (Fire OS 8, `armeabi-v7a` only, **1.7 GB** RAM, not 2). The plan's minimum requirements section should read 1.7 GB. |
| Input latency | "Reactions immediate", by feel. Not yet measured by `/stats` under play or by the optical flash test. |
| Steering and acceleration | **Open, top priority.** "Turning tough." Needs research and calibration, not a rewrite. |
| Controller layout | Fine for driving. Must be **redesigned when weapons arrive** (fire, weapon choice, mines). |
| Combat, cars, parts, shop, tracks, campaign | Nothing yet. This phase. |

The code being built on: `deathride/` is a standalone Gradle project (modules `core` pure JVM, `link` protocol, `game` shared libGDX
code, `app` Android, `desktop` LWJGL3, `controller` the phone PWA, `tools` Node and Python checks). Its own `README.md` documents build,
`/stats`, the flash test and the reproducible checks. **The pure-JVM simulation, determinism, fixed step and zero-allocation
discipline are the foundation; keep every one of them.** The owner will keep playing every wave on the Stick.

## b. The waves (execution order; one row = one wave, one commit series, one design note)

Every wave has the same rhythm: (1) a short **design note** in `docs/concepts/deathride/W<n>-<name>.md` written first, grounded in
research and in the registry notes; (2) **data-first implementation** (everything tunable lives in data files, not constants);
(3) **tests** in `core` that assert content, with headless simulation where balance is involved; (4) `:core:test`, `:link:test`,
`:app:assembleDebug` green; (5) an on-device check on the Stick; (6) a status row, a session-log entry, an `OWNER-CHECKS.md` entry
saying exactly what the owner should try and what "good" and "bad" look like; (7) a git commit.

| # | Id | Wave | Depends on | Status | Commit | Date |
|---|---|---|---|---|---|---|
| 1 | W1 | **Feel Lab**: research and calibration of steering, throttle and brake; live presets; telemetry | - | done; owner feel pending | aaa8546 | 2026-09-30 |
| 2 | W2 | **Cars and stats**: car classes, the stat model, data-driven car specs | W1 | done; owner feel pending | bd5eb67 | 2026-09-30 |
| 3 | W3 | **Advanced vehicle movement**: weight transfer, handbrake and drift, surfaces, mass-based collisions | W2 | done; owner feel pending | 2e238cb | 2026-09-30 |
| 4 | W4 | **Weapons and damage**: weapon design and execution, HP, armor, wrecks, and **the controller layout rethink** | W3 | done; owner combat/layout judgment pending | cf1f4d6 | 2026-09-30 |
| 4b | C1 | **Calibration round (added by host)**: the owner rates W1-W3 by hand on the Stick; one default preset and tightened bands follow | W3 + owner | **closed 2026-09-30: owner approved the five presets as they are, no calibration**; feel is fine-tuned after tracks, car sizing and the other mechanics exist | | |
| 5 | W5 | **Parts and shop**: parts design, economy, garage on TV and phone, save file | W4 | done; owner economy/garage judgment pending | 2a73abd | 2026-09-30 |
| 6 | W6 | **Tracks**: track format, authoring, linter, a set of tracks that escalate | W3 | done; owner quality/feel pending | 2e6096d | 2026-09-30 |
| 7 | W7 | **Campaign**: ladder, rivals, difficulty, progression, pacing simulation | W5, W6 | done; owner career/difficulty judgment pending | this commit | 2026-09-30 |
| 8 | W8 | **Integration and Gate G1**: balance report, Stick performance with everything on, soak, owner checklist | W7 | not started | | |

(W6 depends only on W3, so it can be done before W4/W5 if the run is short of time, but keep the order unless a reason is recorded.)

## c. Wave cards

### W1 Feel Lab: research and calibrate steering, throttle, brake

The owner: "the control is functional but turning tough". The job is to find out why and to give the owner **levers and presets to feel
it**, since a human hand is the only instrument that can rule.

1. **Research first** (write `docs/concepts/deathride/W1-feel-research.md` with sources): how arcade and top-down racers and touch racing
   games map a thumb to a steering angle: speed-sensitive steering range, response (expo) curves, dead zones, steering rate limits
   and return-to-centre, auto-countersteer and stability assists, analog vs digital throttle, throttle ramp, brake-to-reverse
   behaviour, relative vs absolute touch. Note what the current design does and where it is likely tough (candidates: low steering
   authority at speed, dead zone plus relative drag distance needing too much travel, yaw response delay, lateral grip too high so
   the car resists turning, steering rate limit, throttle-on understeer).
2. **Diagnose with data**: add a headless "steering trace" tool that drives scripted inputs (step, ramp, sine, hold) through `core` at several speeds and
   reports turn-in time, steady-state yaw rate, radius, slip angle and recovery time. Include the numbers in the note. A claim about
   "tough" that has no trace is not a finding.
3. **Levers as data**: a `FeelProfile` (in `core`, not in the renderer) with, for example: steering range by speed, response curve
   exponent, dead zone, touch travel for full lock, rate limit, return speed, assist strength, throttle ramp and shape, brake
   response. Both the phone (input shaping) and the TV (sim) each own the part they should; document the split.
4. **Presets**: at least four named presets from "Loose" to "Stable", plus the current behaviour as `Spike`. Switchable **live**
   from the TV remote and from a phone settings sheet without restarting. The chosen preset and every parameter appears in `/stats`
   and in the log so the owner's notes can name it.
5. **Optical and network numbers**: run the stack on the Stick and record `/stats` input age p50/p95/max under a scripted 30 Hz phone
   load for 60 s (the repo has `tools/probe.mjs`), and give the owner the flash-test filming recipe.
6. **Owner checks**: for each preset, three things to do (a hairpin, a slalom, catching a slide) and the words "too twitchy", "right",
   "too heavy" so the owner's feedback is directly usable as the next calibration.

Done when: presets switch live on the Stick, the traces are in the note, the tests pin each preset's declared bands, determinism holds, and
the OWNER-CHECKS entry is written.

### W2 Cars and stats

Design first: `W2-cars-and-stats.md`. Research what defined the car choice in the genre (a light quick car, a balanced one, a heavy
bruiser; the trade-offs a player feels) and propose **five car classes** with a readable identity. Define the **stat model**: a small
set of primary stats the player understands (for example Speed, Acceleration, Grip, Armor, Mass, Handling, Weapon slots) and the **derived
physical parameters** each maps to, with the mapping in one data table, not scattered. Every car is a data file. Show the numbers as a
comparison table and prove by simulation (a headless lap-time and duel matrix) that no class dominates on every track type. Phone and TV
show the stat bars. Registry notes: `data-driven-type-objects-over-subclass-growth`, `canon-as-single-source-of-thresholds`, the
`game-economy-tuning` and `difficulty-design` families.

### W3 Advanced vehicle movement

Design first: `W3-movement.md`. Take the handling from "a car that turns" to "a car with weight": load transfer under braking and
throttle, a handbrake and drift state that a player can hold and exit, surfaces (asphalt, dirt or gravel, oil, ice or wet) with grip
and drag as data, kerbs and off-track penalty, boost if research supports it, wall glancing versus head-on, and **mass-based
car-to-car collisions** (impulse, spin, ram damage as an input for W4). Everything stays in the deterministic pure-Kotlin step, at 60
Hz, allocation-free. Tests assert bands and determinism; a new headless AI-vs-AI test proves the AI still finishes races on every surface.

### W4 Weapons, damage, and the controller layout rethink

Design first: `W4-weapons-and-damage.md`. Research the genre's weapon set (rapid fire, dropped hazards, a heavy limited weapon,
possibly close-range), then design the roster: for each weapon, role, rate, damage, ammo, arming or cooldown times in seconds, range, how it
counters the others, and how AI uses it. From the registry (`realtime-combat-semantics`): **one authority for HP**, **hit dedup per
activation**, **wrecked as a state tag**, telegraph or arming for area effects, every time value typed in seconds. Damage model: HP,
armor as reduction, ramming damage from W3, wrecks that are out of the race and how a wrecking win can score; simple, visible damage on the car. Weapons and pickups as
data. **Controller layout rethink**: the phone must gain fire, secondary weapon and weapon swap without breaking driving. Explore two or
three layouts with reasoning (thumb reach in landscape, left-handed option, what must never be pressable by accident); implement them as
selectable layouts and give the owner a checklist to choose. Phone HUD: ammo, HP, weapon cooldowns. Haptics on hit where supported.
Placeholder shapes and code-synthesised or no audio only; there is no art in this phase.

### W5 Parts and shop

Design first: `W5-parts-and-shop.md`. Parts by system (engine, tires, brakes, armor, suspension, weapon mounts or upgrades), tiers, what
each changes in the W2 stat model, price curves, and how a part interacts with car class. **Structural economy simulation before
coefficients**: faucets and sinks, cash by finishing position and by wrecks, repair costs, a winner-take-all loop check, a tornado sweep
of the top lever (`game-economy-tuning` notes). Implement the garage on the TV (a remote-friendly shop) and the phone (a companion
view), a profile and a save file, and pricing as data. Headless economy simulation over seeded careers proves no dead end (a player who
cannot afford repairs after a loss) and no runaway.

### W6 Tracks

Design first: `W6-tracks.md`. Extend the track format: centerline, width profile, surfaces from W3, checkpoints, start grid, pickup and
hazard spots, AI racing-line hints. A **track linter** (closed loop, minimum width against car size, no self-intersection within the
width, checkpoint order, pacing of straights and corners) run as part of `:core:test`. Author **five tracks** that escalate in
difficulty and teach one new thing each (a first oval-like circuit, a technical track with a hairpin, a wide-open speed track, a
surface-change track, a tight combat arena). The minimap comes from the data. Seeded generation is optional; the linter is its
acceptance test.

### W7 Campaign

Design first: `W7-campaign.md`. A career: an ordered ladder of races and championships across the W6 tracks, prize money, rival
drivers with different cars and behaviour (a personality is a data profile on the existing AI, not a different AI), unlocks (cars,
parts, tracks) and the pacing that makes a player want the next car. Difficulty as declared tiers (skill scaling, not physics cheating;
`skill-scaling-versus-power-scaling`); any catch-up is bounded, visible and paid for by harder settings. A **pacing simulation**
(2,000 seeded careers) reports races to first upgrade, races to each unlock, bankruptcy rate and win-rate by tier. A save per phone or
profile. TV menus are remote-friendly; the phone holds the fine controls.

### W8 Integration and Gate G1

A complete session: lobby, pick a car, buy a part, race a campaign event with weapons, get results, save. Produce
`docs/concepts/deathride/G1-REPORT.md`: the headless balance report (AI-vs-AI races, kill share, one-shot rate, race duration,
economy), Stick performance with six cars, weapons, particles and surfaces (frame p50/p95/max, input age, 15-minute soak, thermal), an
honest tier of truth for each claim (exists, valid, wired, behaves, felt), and a list for the owner to try. **Gate G1 is the owner's:**
"is this worth putting art into."

## d. Ground rules for the executing agent

- One authority per number: any tunable threshold lives in exactly one data file. A number found in two places is a bug.
- The build must be green at every commit: `:core:test`, `:link:test`, `:app:assembleDebug`.
- `core` has no libGDX or Android imports and never reads a wall clock or unseeded randomness inside the step. The fixed 60 Hz step and
  the zero-allocation steady state are protected properties; a wave that breaks one fixes it before it commits.
- Feel is never proven by a unit test. Write `not measured` for anything not run on the Stick, and "felt" only after the owner has said so.
- No art, no downloaded assets, no audio files. Placeholder shapes; audio only if synthesised in code. Nothing is copied from the arcade
  game or the Death Rally titles; study the genre through public information only, and never extract or decompile any game files.
- The Stick may be used through `adb` (it is the reference device). Find it first: it was at `10.0.0.139:5555` on 2026-09-30 and its
  address can change; scan the /24 for port 5555 if it does not answer. Use one app at a time (they share port 8765), always with
  the release id and label, and leave the last build installed at the end of each wave. The phone is the owner's: drive controllers
  with scripted headless clients (`tools/`) and leave the feel judgement to `OWNER-CHECKS.md`.
- Read-only references: the registry's game knowledge at `C:\Users\kazda\kiro\ai-registry\knowledge\game-production` (start with `_laws.md`
  and the notes the plan cites), and, if it exists, the folder
  `C:\Users\kazda\kiro\firetv\.contest\experiments\gpt61-sol-death-rally\research\` written by a separate experiment that is
  still running; treat its facts as unverified claims and cite them as such. Do not read any other directory outside this worktree.
- Every wave appends a session-log entry and a status row here, and a new pitfall found (a libGDX, Android or Fire OS quirk) goes into
  `docs/concepts/deathride/PITFALLS.md` as a short dated entry.

## e. Session log

(the executing agent appends here; one entry per wave: wave, date, what changed, commands run with results, what is `not measured`, next wave)

### W1, 2026-09-30

Design first: `docs/concepts/deathride/W1-feel-research.md`. Added five data profiles, shared shaping, live remote/phone controls, 60 scripted traces, declared bands and strict allocation tests. Fixed Java 22 math allocations using deterministic polynomial kernels and exp/log powers. `:core:test :link:test :app:assembleDebug -PappId=dev.deathride.tv -PappLabel="Death Ride"`: green (18 core, 3 link). Installed and launched on AFTKM; remote and browser settings switch live. `tools/browser-check.mjs`: pass against Stick; `tools/probe.mjs ... 60`: pass with two 30 Hz clients. 60 s at 30.013 Hz, 1816 frames per slot. Last 10 s input age p50/p95/max: P1 20.93/41.58/63.81 ms (n=597); P2 20.77/41.07/113.04 ms (n=597). Frame interval 16.62/21.53/141.61 ms (n=593). These are network/simulation ages, not input-to-photon. Lifetime ages include the intentional silence/countdown and are not steady-load latency. Six successive windows are preserved in `w1-probe.json`. Owner exercises in `deathride/OWNER-CHECKS.md`. Optical latency and owner feel not measured. Latest APK remains installed. Next: W2 cars/stat model, lap and duel matrix.

### W2, 2026-09-30

Design first: `docs/concepts/deathride/W2-cars-and-stats.md`. Added five car CSVs, one stat mapping table, per-car physical specs, remote/phone selection and matching bars. Preserved Spike baseline via `physics.csv`. Headless matrix: 270 finish observations (18/class/type), 120 paired races; Trail leads tight/mixed and Comet fast. Comet tuning corrected a first-run failure to express its straight-line role. `:core:test :link:test :app:assembleDebug`: green, 20 core + 3 link. Installed release id/label on AFTKM; `tools/wave-check.mjs ... 2` and remote DOWN passed; evidence and APK hash in design note. Owner feel, combat balance, optical latency not measured. Latest build installed. Next W3: surfaces, transfer, handbrake and mass collisions.

### W3, 2026-09-30

Design first: `docs/concepts/deathride/W3-movement.md`. Added data surfaces/transfer, handbrake/drift hysteresis, kerb/verge penalty, unequal-mass impulses, bounded spin and ram input for W4. Fixed duplicate AI grip speed reduction found by ice completion test. 18 races/108 finishes over six surfaces: all finish within 180 s, deterministic replays; 10,000 advanced steps allocate zero bytes. `:core:test :link:test :app:assembleDebug`: green, 25 core + 3 link. On AFTKM, `tools/wave-check.mjs ... 3` confirms live surfaces and multi-touch drift; remote MENU selects Gravel. Latest release build installed. Owner feel, optical latency and physical-phone ergonomics not measured. Historical test reports now go to build/reports and are copied only into their own wave evidence. Next W4: weapons, one HP authority, wrecks, controller layouts.

## f. Reconciliation after W1-W3 (host, 2026-09-30 17:05)

The run was told to do W1-W8, and the owner asked for W1-W3 only, so the host stopped it once W3 was committed. It took about 30 minutes
of wall clock for three waves (16:35 to 17:04). It had begun the W4 design note when stopped; that note is kept as a draft.

**What the host verified itself, not from the run's claims.** `gradlew :core:test :link:test :app:assembleDebug` re-run from scratch
with `--rerun-tasks`: BUILD SUCCESSFUL in 21 s; 25 core tests (CarsTest 2, DriftTest 2, FeelTest 4, MovementTest 5, SoakTest 4,
WorldTest 8) and 3 link tests, 0 failures. The release id `dev.deathride.tv` is installed on the Stick at 10.0.0.139 (updated 17:01).
Not re-checked by the host: the Stick evidence (browser-check, probe, wave-check), which is on record in the design notes.

**What the run produced.**

| Wave | Delivered | Numbers worth keeping |
|---|---|---|
| W1 | `FeelProfile` data (Spike, Loose, Agile, Balanced, Stable), shared input shaping in `core`, live preset switch from the remote (LEFT/RIGHT) and the phone settings sheet, 60 scripted steering traces, allocation fix for Java 22 trig | At 18 m/s full lock: turn-in 90% Spike 0.183 s, Loose 0.133, Agile 0.150, Balanced 0.233, Stable 0.317; radius 15.3 m Spike vs 13.7-13.9 m for Loose/Agile/Balanced; slip 8.6 deg Spike, 38.6 Loose, 20.5 Agile, 12.3 Balanced, 7.9 Stable. Input age over Wi-Fi (2.4 GHz, 30 Hz load, 60 s): p50 ~21 ms, p95 ~41 ms, max 64-113 ms. |
| W2 | five cars (Needle, Line, Bastion, Comet, Trail), one stat-mapping table, seven stat bars on phone and TV, car pick per phone | 120 paired duels, 270 finishes: Trail leads tight and mixed, Comet leads fast, Bastion slowest everywhere (armor is unproven until W4). |
| W3 | load transfer, handbrake and drift with hysteresis, four surfaces plus kerb and verge, mass-based collision impulses, ram input for W4 | Three-lap six-car race times: asphalt 69-72 s, gravel 84-87, oil 97-102, ice 115-121, kerb 77-81. An ice failure was traced to the AI applying grip twice and fixed. Zero allocation over 10,000 steps with everything on. |

**Findings and risks the host sees.**

1. **Nothing has been felt yet.** Every wave says "owner feel pending". Three waves of movement changes are stacked on a control the owner
   already called tough, and only the owner can certify any of it. This is the main risk, and the reason for C1 below.
2. **The proposed default may work against the complaint.** The owner's issue was "turning tough". The run proposed **Balanced** as the human default, but its
   90% turn-in (0.233 s) is *slower* than the old Spike (0.183 s) while its radius is tighter (13.9 m against 15.3 m). Agile turns in faster
   (0.150 s) with the same radius but a 20 degree slip. The note does not name a root cause; it lists candidates. Which one is "tough" is for the owner's thumb to decide.
3. **Brake now overrides GO for every profile**, including Spike. That changes the old baseline, and the run says so. Worth confirming it feels right.
4. **The 141 ms worst frame** in the W1 probe (p95 21.5 ms) matches the startup outlier seen in the contest apps. Not yet explained.
5. **The Stick was on 2.4 GHz Wi-Fi** during measurement. Input age will look different on 5 GHz. Record the band with every measurement.
6. **Balance claims are so far movement-only.** Bastion's slowness is by design and unproven until weapons exist; W2 says so.
7. **Small bookkeeping errors in the run's records, fixed by the host:** the W3 status row held a commit message instead of the hash, the log
   used wrong paths for the design notes, and en dashes were written as question marks.

**Next steps, in order.**

1. **C1, owner playtest (now).** Follow `deathride/OWNER-CHECKS.md` for W1, then W2, then W3, on the Stick with the phone.
   Record for each of the five presets: "too twitchy / right / too heavy" for hairpin, slalom, slide catch. Also try the five cars, the
   four surfaces, and the drift button. Optionally film the flash test at 240 fps (30 taps) for the optical latency number.
2. **Calibration run from the owner's ratings.** One default preset, tightened bands, and any fix for what felt wrong. Small run.
3. **W4, weapons and damage and the layout rethink**, from the drafted design note. The draft proposes weapons Rivet (rapid forward gun),
   Hammer (slow heavy projectile), Mine (rear drop with an arming delay), and three layouts to try (Classic, Cruise, Split) with a
   left-handed mirror. Its layout choice depends on how steering ends up feeling, which is why C1 comes first.
4. W5 to W8 unchanged, in order. At this pace they could be one or two runs, with the owner check between W5 and W6.

## g. Owner direction, 2026-09-30 (after W1-W3)

> "The game is nowhere near real videogame quality even on scale of the 1996 original ... once we resolve tracks, cars and their sizing and other
> mentioned mechanics we can finetune the user feel. We are still operating on game quality of game boy devices and lot of work is ahead."

Consequences for the remaining waves:

1. **Presets approved as is.** No calibration round. Do not retune feel except where a new mechanic forces it.
2. **New order: W6 (tracks) first, then W4, W5, W7, W8.** W6 depends only on W3. Tracks, car size and world scale are what the owner sees first.
3. **W6 gains a scale-and-sizing pass** as its first deliverable: a written scale contract (metres per pixel, car length and width per class, track
   width in car-widths, camera zoom range so a car is large enough to read on a TV from a sofa, minimap), applied to every car and track. Cars
   must be drawn far bigger and more readable than the current tiny rectangles; track width, corner radii and lengths are designed against car size.
   Also raise the placeholder presentation toward a real top-down look within the no-art rule: car silhouettes per class with distinct shapes,
   wheels, shading and shadow drawn in code, track edges, kerbs, surface textures made procedurally, skid marks, dust/smoke particles, a proper
   HUD. Everything stays generated in code (no downloaded assets), and the frame budget on the Stick stays inside the W1 figures.
4. The remaining waves keep their cards. Report honestly where the result is still far below a real game; do not claim quality the owner has not seen.

**Addendum, 2026-09-30 19:2x (owner):** cars should be about **50% larger** than they are now (length and width, in the scale contract and on screen).
The purpose: the classes can then differ much more from the standard car (size, mass and silhouette spread wider), and cars cover far more of
the track, so a race is full of vehicle contact. Re-derive track widths, corner radii, grid spacing, AI spacing and camera zoom against the larger
cars; re-check collisions, the six-car finish-time tests and the Stick frame budget. Widen the class spread in the stat mapping, not just the drawing.


### W6, 2026-09-30 (resumed interrupted wave; section g order)

Design updated before implementation in `docs/concepts/deathride/W6-tracks.md`. Retained existing track/scenery work; applied roughly 50% larger physical/display cars, wider mass spread, three-circle contacts, re-derived grid/AI clearance, five linted courses, procedural road/car detail, skids/dust, preview and HUD. Fixed restart preflight TIME_WAIT false-busy. `:core:test :link:test :app:assembleDebug`: green (32 core, 3 link). Twenty deterministic six-car races / 120 finishers, 67.45-115.57 simulated seconds; zero steady-step allocation. AFTKM 1080p on 2442 MHz Wi-Fi: all five phone course choices and remote MENU verified; final 60 s two-controller load at 30.013 Hz, 1814 frames/slot. Final 10 s frame p50/p95/max 16.76/21.25/26.56 ms (n=600), worst six-window p95 21.42 ms. Input ages P1 47.13/69.17/77.30 ms and P2 20.28/42.82/52.21 ms (n=601 each), offset-estimated, not optical. Evidence and APK hash in W6 note; latest release build installed. Owner quality/feel and optical latency not measured; this is still far below finished-game presentation. OWNER-CHECKS updated. Next W4, then W5/W7/W8.


### W4, 2026-09-30

Design draft revised before data/code in `W4-weapons-and-damage.md`. Added data-driven Rivet/Hammer/Mine, one HP/state authority, armor, three-circle swept hits, bounded pools, arming/telegraphs, pickups, pair-deduplicated rams, wreck obstacles and last-survivor scoring. Added Classic/Cruise/Split layouts plus mirror, separate absolute weapon input fields, HP/ammo/cooldown HUDs, damage scars/smoke and optional hit haptics. First physical sample killed cars in 1.58 s at the grid; visible 4 s start protection and reduced weapon damage moved first wrecks to 8.35-18.07 s, with 3.35 mean wrecks over 20 seeded races (43.15-117.28 s), zero one-shots. `:core:test :link:test :app:assembleDebug`: green, 41 core + 3 link. Live combat zero-allocation gate passes. Stick CDP touch checks passed all layouts, heavy swap, mines, independent releases, mirror and disconnect. Latest release build installed; evidence/hash in W4 note. Owner feel, physical-phone haptics/comfort, optical latency and sustained all-effects thermals not measured. Next W5 parts/shop, then W7 and W8.


### W5, 2026-09-30 (section g order)

Design first in `W5-parts-and-shop.md`; unit-rate topology walk preceded price/reward coefficients. Six per-car part families, eight shared primary stats including stock-preserving Braking, TV/phone garage, insured pit service, idempotent race receipts and versioned/checksummed per-browser profile saves are live. Purchases publish only after durable save; bad primary recovery uses the previous-good copy and two damaged copies visibly disable writes. Economic model: 2,000 seeded 100-race careers per scenario, 13 scenarios / 2.6 million abstract outcomes; no bankruptcies, baseline first earned part 1.7025 races, permanent last-place wreck 3 races, winner wallet capped at 8,000 CR. Reward size is the tornado's top lever; assumptions are labelled, not presented as physical races. `:core:test :link:test :app:assembleDebug`: green, 46 core + 3 link. AFTKM checks passed touch/remote purchases, stale duplicate rejection, actual race payout, fresh-token process-restart persistence and native short-landscape shop scrolling. Stationary timeout result was place 3, prize 155 - pit 20 = 135 CR; this is plumbing evidence, not completed-lap evidence. Final APK installed; evidence/hash and test-harness corrections in design note. OWNER-CHECKS updated. Owner value/comfort/long-term pace not measured. Next W7 campaign, then W8 integration/G1 report; no push.


### W7, 2026-09-30 (section g order)

Design first in `W7-campaign.md`. Twelve ordered rounds/four personal-score cups, named data-profile rivals, car/course/part unlocks, retained medals/seasons, declared Rookie/Club/Pro decisions and prize multipliers, remote/phone career menus and version-two saves with W5 migration are live. No catch-up or power scaling by difficulty. Player 1 hosts; guest cash/profile stays independent. Locked cars cannot start career; idle timeouts earn normal cash but do not advance. Review caught only five repeated seed lane patterns under fixed career skills; added deterministic reset-only variation inside authored AI error bounds and reran distinct-hash samples, preserving legacy practice. Final physical library: 360 distinct races across all courses/tiers/gear bands. Pacing: 2,000 seeded careers per tier, reference-driver wins 72.68/37.08/30.53%, first earned part 1.2855/2.036/2.012 races, zero bankrupt/censored careers; resampling limitations explicitly documented. `:core:test :link:test :app:assembleDebug`: green, 51 core + 3 link. Final AFTKM touch/remote/two-controller weapon race and independent process-restart recovery passed; separate locked-car/180 s idle check passed. Device bots wrecked before three laps, so no completed-lap skill claim. Final APK installed; evidence/hash in note; OWNER-CHECKS and pitfalls updated. Owner fairness/fun/comfort not measured. Next W8 full integration, larger balance scenarios and real Stick soak; no push.
