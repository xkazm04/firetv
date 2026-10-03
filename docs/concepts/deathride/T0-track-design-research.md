# T0 — Track design research and language

2026-10-04. Scope: research and measurement contracts, before authoring. No course, assignment, physics, AI or presentation data changed. T2 must first merge the parallel AI/pacing branch. These are authored hypotheses, not owner-approved handling or pacing.

## Research ledger

Public pages read on 2026-10-04. Observations below are paraphrases; the numerical proposals later in this note are ours, not values claimed by these sources. No layouts, track names or assets are copied.

| Source | Evidence and consequence for Death Ride | Limit |
|---|---|---|
| Luke McMillan, [A Rational Approach to Racing Game Track Design](https://www.gamedeveloper.com/design/a-rational-approach-to-racing-game-track-design), 2011 | Describes entry, clipping and exit points, compound corners, width and the relationship between a vehicle and its racing line. Distinct entry/exit punctuation helps the player learn a course. We should measure corner sequences and usable width, and test the same course with several car classes. | Arcade driving analysis, not evidence that our combat or numbers feel good. We do not adopt its preference for banked corners: our simulation is planar. |
| David Perryman, Caged Element, [Situational awareness and player frustration in GRIP](https://www.gamedeveloper.com/business/game-design-deep-dive-situational-awareness-and-player-frustration-in-i-grip-i-), 2016 | The developer identifies disorientation and unexpected scenery crashes as frustrations. Recovery cues and readable threats matter alongside deliberate risk. Our solid obstacles must remain identifiable, leave a recovery route and have consequences consistent with their footprint. | A very fast third-person racer; its camera solutions are not a prescription for top-down play. |
| Nintendo, [Mario Kart World developer interview, part 2](https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-18-mario-kart-world-part-2/), 2025 | Designers discuss distinct course concepts, contextual scenery transitions and landmarks; lighting changes require repeated checks of path readability. Give every course one teachable concept and connect geometry to its theme and landmarks. | Its open-world connections, weather and elevation are outside our ribbon model. |
| Nintendo developers, [Super Mario Kart 1992 interview](https://shmuplations.com/supermariokart/), translated archival interview | An early account of combining racing and competitive play, course iteration and recognizable environments. This supports studying kart racing as interaction between rivals, road and items. | Translation of a historical interview, not a quantitative balancing study. We borrow no course geometry. |
| Remedy/Apogee, [Death Rally Classic public product description](https://store.steampowered.com/app/358270/Death_Rally_Classic/) | Top-down racing, armed cars and vehicle improvement establish a useful genre reference: surviving and winning are coupled. Our track must provide attack, evasion and recovery choices as well as a fast line. | Public description only. The side experiment's unverified notes are not treated as evidence. |
| Microsoft, [Xbox Accessibility Guideline 109: Object clarity](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/109) and [117: Visual distractions and motion](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117) | Gameplay objects need to be distinguishable; unnecessary camera motion and visual distraction can obstruct play. Use silhouette, edge contrast and landmarks as well as color. Atlas heatmaps need text values and legends. | Accessibility guidance does not prove sofa readability. Only viewing the game at the owner's distance can establish that. |

### Registry read ledger (read-only)

Roots: `C:/Users/kazda/kiro/ai-registry/knowledge/game-production` (R), and `C:/Users/kazda/kiro/ai-registry/.claude/worktrees/forge-racing-tv/knowledge/game-production` (F). No registry files were written.

| Notes read | Applied contract |
|---|---|
| R `balance-validation/procedural-level-planning/techniques/pacing-linter-rules.md` | Each warning names an observed signature and a design consequence; unknown does not count as a rest beat. Passing a crude gate is not good pacing. |
| R same subject, `landmark-and-sightline-legibility.md` | A decision needs an advance cue and enough visible approach; report geometric warning distance separately from perceptual legibility. |
| R same subject, `critical-path-to-optional-branch-ratio.md` | Optional routes need an explicit benefit and rejoin cost. Our current shortcuts are lane bands, not graph branches: report fraction and geometric path delta, not invented branch depth. |
| R same subject, `seed-determinism-contract.md` | Record seed, parameters, algorithm version and content digest. Repeat a run and compare state hash. Different seeds must exercise different trajectories, not merely different labels. |
| F `racing-vehicles/racing-track-authoring-and-lint/techniques/width-in-widest-car-widths.md`, `corner-radius-in-longest-car-lengths.md` | Resolve units from the roster; full width is twice the stored half-width. Use baked geometry, not only control points. |
| F same subject, `straight-fraction-pacing-band.md`, `oriented-capsule-grid-lint.md`, `mutate-good-track-to-prove-linter.md` | Arc-length weighting, both band ends, real oriented grid footprints, and planted faults that demonstrate rejection. Retain the existing linter as authority. |
| F same subject, `px-per-metre-scale-contract.md` | Preserve the camera/car scale contract; an atlas is an exempt map, not a driving view. |
| R `balance-validation/combat-pacing-and-dramatic-arc/techniques/intensity-and-threat-tension-curve.md`, `encounter-duration-envelopes.md` | Count pressure over time, both duration tails and early deaths. A long race with dead time is not thereby well paced. |
| R `systems-canon/agent-behaviour-authoring/agent-behaviour-authoring.md` | Distinguish perception, intent, commitment and actual outcomes. A crowded bend is a trap candidate; it is not proof that a hunter planned a trap. |

## Existing implementation and boundaries

Read `Tracks.kt`, `TrackContent.kt`, `World.kt`, `Combat.kt`, `Obstacles.kt`, `Career.kt`, `DeathDuel.kt`, the course CSVs, track rules, themes, car shapes and presentation tables. `Course` bakes a closed Catmull–Rom centerline with linearly interpolated half-width, per-span surfaces, lane hints, fractional spots and surface features. Curvature stored by the game is unsigned; the report must derive signed heading change to identify left/right sequences. Spots are relative to `startFraction`; features and obstacle placements are absolute lap fractions. Obstacle bake adds deterministic placement jitter. Export must preserve those different coordinate bases.

There are **25 course rows, not 26 distinct layouts**. The campaign finale uses `crown` in elimination mode. The atlas will show 25 course cards plus an explicitly labeled **finale arena view of Crown**, with a separate six-car elimination stress simulation. That stress grid is an instrument, not the campaign finale's actual opponent setup. No new arena data is invented.

The actual themes are industrial, quarry, desert, wetland and alpine. Foundry/slag and speedway are industrial design dialects, salt flats is desert, mountain is alpine. Wetland must not disappear because the brief uses six descriptive theme names. Existing lessons are often duplicates; expose them now and replace them only in T2.

Full roster reference units: **W = 4.65 m** (widest car), **L = 9.3 m** (longest car), evaluated from `car-shapes.csv`, never duplicated in implementation. Existing hard floors: width **3.6 W**, radius **2 L**. Straight classification is the canonical `straightCurvature=0.012 /m`, fraction band **0.12–0.85**. At current minimum scale, shortest car is `6.6 × 12.8 = 84.48` logical pixels, above the 80-pixel floor. Atlas overview does not establish that gameplay hazards are readable at that scale.

## Track grammar

Every phrase has start/end arc fraction, arc length in L, entry/minimum/exit width in W, signed turn angle, minimum radius in L, surface, line choices, intended speed and one teaching verb. Numbers below are initial authored targets. The linter's hard floors still apply everywhere.

| Segment | Measurable definition / authoring envelope | Purpose |
|---|---|---|
| Launch / recovery straight | Canonical straight curvature; 6–12 L long, 4.5–6 W wide, no compulsory hazard | Read the next cue, separate the grid, recover aim |
| Acceleration straight | 10–24 L, 4–6 W; enough approach for next braking distance | Let speed classes and abilities matter |
| Ambush straight | 6–14 L, 4–5 W; lateral escape ≥1 W beyond occupied attack lane | Trade clean acceleration for a weapon opportunity |
| Sweeper | Sustained same-sign turn, radius ≥6 L, turn ≥30 degrees | Carry speed and choose a broad line |
| Kink | Same-sign excursion of 10–30 degrees, radius ≥4 L | A small setup action, not a blind brake test |
| Standard corner | 30–135 degrees, radius 3–6 L, width ≥4 W desirable | Braking / clipping / exit punctuation |
| Hairpin | Turn ≥135 degrees, radius 2–4 L, exit preferably ≥5 W | Compress then release; allow a switchback pass |
| Chicane | Opposite-sign pair, each 30–90 degrees, intervening gap ≤3 L | Set up the second corner; avoid compulsory single-file contact |
| Esses | Alternating turns, radius 4–8 L, gaps 3–8 L | A sustained left/right rhythm with a clear exit |
| Double apex | Same-sign peaks separated by a ≥25% curvature dip, gap ≤6 L | Sacrifice first apex to improve exit |
| Decreasing radius | Same-sign corner, last-third curvature ≥1.5× first-third, minimum ≥2 L | Teach early restraint; cue before entry |
| Increasing radius | Inverse of decreasing-radius ratio | Reward early setup with visible acceleration space |
| Off-camber substitute | Explicit lower-grip surface band over 3–8 L; no physical camber claimed | Alter grip budget without introducing jumps or a false vertical model |
| Narrow gate | 3.6–4.2 W, 2–5 L, entry/release transitions ≥2 L | Brief six-car compression, never a whole lap of choke |
| Wide overtaking zone | ≥5 W for ≥4 L after a braking approach; traversable exit ≥4 W | Two credible lines through braking and exit |
| Elevation substitute | Width opening plus surface change or landmark over ≥4 L | Tension/release and a vista beat without height physics |

Detection is a reproducible approximation: partition cyclic baked segments into straight and signed corner runs, merge only explicitly defined short gaps, discard sub-10-degree corner noise, classify radius bands and angle, retain the sequence. Report both Shannon entropy of radius classes and transition entropy; a shuffled list with the same histogram need not have the same rhythm. Complex labels are candidates for review, not a claim that a designer authored them. Width/surface/combat tags are independent layers over geometry.

## Combat phrases specific to this game

| Element | Design and instrumentation |
|---|---|
| Ambush straight | A fast exit feeds a visible attack lane, with an outside escape and a recovery straight afterward. Measure damage, contact and passes by section; long range alone is not an ambush. |
| Mine alley | Short bounded gate with lateral escape; place the intended mine decision before turn-in, not under a compulsory pickup. Mines retain the existing 0.5 m weapon tuning. Measure actual mine events and deaths; do not enlarge the weapon to make the phrase work. |
| Pickup shortcut / risk line | Inside lane saves geometric distance but loses grip or exposes the car to attack; outside route stays viable. Record path-length delta, grip ratio, clearance, obstacle overlap, observed collections and visit rate. Faster in geometry does not mean faster in simulation. |
| Obstacle field | Existing NONE/DRAG/SOLID definitions only. Decorative objects do not count as hazard load. Drag patches can price an inside line; solids must obey shoulder, grid and usable-width rules. |
| Choke gate | Six cars compress briefly, then a wide exit lets them separate. Never put solid obstacles, ice, forced pickup and tightest radius on the same unavoidable gate. Count contact episodes and early wrecks, not solver iterations. |
| Wreck lane | Reserve lateral recovery space near probable wreck sites; the report maps actual wrecks and subsequent contacts. A body left in the fastest line should create an avoidable decision. |
| Safe / aggressive lines | Safe route has stable surface and fewer attack exposures; aggressive route trades grip, clearance or combat exposure for distance/pickup. Both must remain traversable. |
| Hunter trap | A braking approach or convergence can let an attacker pressure the leader. Candidate signature: slowed leader, nearby rivals fore and aft, attack/contact evidence. This branch has no explicit hunter-plan trace: call it a **trap opportunity proxy**, never a proven hunter tactic. Re-run after AI merge. |
| Boss / arena loop | Broad looping space with repeated approaches, escape lanes and recovery pickup access. Evaluate elimination duration and spatial coverage separately from lap pacing. Current finale is Crown geometry; crossing routes or free-roaming arena topology would require a later format change. |

## Rhythm and campaign pacing

The race targets are **120–180 s for each division opener**, **240–360 s for a final**. Keep the current event/lap structure; lengthen and compose the course in T2 after the AI work, never multiply laps here. The consolidated campaign already contains variable lap counts (including 10–14 near the finale); the core default is three. For a hypothetical three-lap event the targets imply roughly 40–60 s and 80–120 s per lap, but that is not today's campaign duration claim. Standing start, fights, elimination and timeouts mean multiplied reference lap estimates are only planning aids. Use actual finish-time distributions and each event's actual lap count to judge the race envelope after the merge.

Opening-course proposal: 6–10 meaningful corners, at least 3 radius/angle families, 0.30–0.60 straight fraction, ≥2 credible passing zones per lap, ≥2 recovery beats of 3–6 s at reference speed, one optional risk line. Final proposal: 12–18 meaningful corners, ≥4 families, 0.25–0.55 straight fraction, ≥3 passing zones, ≥3 recovery beats, 2–3 risk decisions whose lessons were introduced earlier. These narrower proposals sit inside the existing hard linter band. Oval/arena exceptions must be named; they must not weaken global rules.

A lap should read as **orient → accelerate → contest → release → technique → choice → contest → recovery**. Avoid three consecutive high-load phrases (sharp bend, low grip, choke or heavy obstacle exposure) without a simple recovery interval. Do not count a straight full of attackers as measured relief. Instrument section speed, contacts, damage and nearby opponents; compare geometric rest candidates with observed pressure. A single tension scalar must not hide its inputs.

Within each division: opener teaches one thing safely, second course repeats it with one choice, third combines it with surface/width variation, fourth tests a previously taught combat decision, final recombines familiar lessons at longer duration. Across visits, increase combinations and decision cost before increasing surprise. Repeated lessons in today's CSV are findings for T2, not silently replaced in T0/T1.

| Dialect | Geometry and teaching sequence |
|---|---|
| Foundry (industrial) | Broad bends and legible gantry braking cues → exit passes → defended inside lane |
| Slag (industrial) | Stable outside asphalt → optional gravel line → recovery from a deliberately priced shortcut |
| Salt flats (desert) | Long acceleration and visible kinks → braking contests → two fast lines with different exposure |
| Quarry | Medium corners → wide hairpin exits → alternate-radius sequences; stone shoulders remain recoverable |
| Mountain (alpine) | Sweepers → clearly cued ice bands → rhythm changes with safe exits, never blind compulsory ice hairpins |
| Wetland | Surface recognition → sluice-width transitions → route choice under grip loss |
| Speedway (industrial finale dialect) | Broad continuous loops, repeated interception approaches and escape lanes; elimination pressure replaces corner-count ambition |

At sofa distance the player must distinguish road edge, solid obstacle, drag patch and pickup before committing. Minimum advance cue proposal is `max(3 L, v × 1.5 s, (v² − cornerSpeed²)/(2 × brakeDeceleration))`, using the relevant tier. Compare it with visible look-ahead at gameplay zoom. The atlas cannot validate occlusion, contrast in motion or comfort; those remain owner checks in T3.

## T1 measurement and gate contract

Thresholds will live in a dedicated tool data table, separate from gameplay/course tables. Hard geometry is still `TrackLinter`; new design gates are diagnostic and may legitimately fail today's unmastered library. Never change thresholds simply to make every current course green.

| Claim / hypothesis | Measurement and initial threshold proposal | Evidence tier |
|---|---|---|
| Road admits racing | Existing width ≥3.6 W, radius ≥2 L, grid and overlap lint; all errors visible | Measured geometry; authored floor |
| Rhythm has contrasts | Arc-weighted straight fraction 0.12–0.85; report longest run, corner count, radius histogram, entropy; warn <3 meaningful corners or radius entropy <0.5 bits | Geometry; authored diagnostic, arena exempt |
| Passing is designed | ≥2 zones with braking approach, ≥5 W full width for ≥4 L; publish approach speed drop and clearance | Geometry candidate, simulation decides usage |
| Compression is localized | Count cyclic connected width minima below 4.2 W; warn if >35% of lap is in that band | Geometry; authored |
| Hazards leave a route | Existing obstacle lint, surface fractions, effect-specific obstacle count/area, zero unreachable pickups | Geometry; collection simulation is separate |
| Shortcuts offer a trade | Report arc fraction, lane path delta, grip ratio and clearance; warn if no geometric saving or no grip/exposure price | Geometry proxy; time benefit and feel unproven |
| Race duration meets role | Report clean reference lap by all five tiers plus combat finishes/timeouts; 120–180 s opener, 240–360 s final after merge | Simulation; authored envelope; no timeout treated as finish |
| Contest persists | Position changes and confirmed live-car overtakes per field lap; target ≥0.5 passes/field lap; exclude rank changes due solely to wrecks/finishes | Simulation; diagnostic |
| Contact is not a lottery | Debounced contact episodes per car-km and per section; proposed warning >20/car-km; report wreck rate, first-wreck distribution and right-censored no-wreck runs | Simulation; authored |
| Early survival is credible | Lead-slot AI surrogate wreck-before-lap-one rate ≤0.20; rotate class/style identities through all six slots; publish sample count and Wilson interval | Simulation proxy only; human fairness unknown |
| Cars recover | Spin entry episodes, stuck ≥3 s below 1.2 m/s after launch; proposed ≤2 spin and ≤1 stuck episodes/car-lap | Simulation; authored |
| Multiple lines are used | Lateral occupancy histogram by section; entropy target ≥0.5 bits, with sample exposure and speed displayed | Simulation; not an optimal-line proof |
| Pressure can trap without certainty | Trap opportunity counts and locations, damage/contact corroboration, early death rates; no universal minimum until hunter AI merged | Simulation proxy; hunter intent unmeasured |
| Evidence is reproducible | ≥12 independent seeds ×6 identity rotations per course, held-out seed half comparison, repeated-seed hash check; diverse trajectory hashes required | Instrument acceptance |
| Gates can reject | Plant narrow/overlapping/no-straight/all-straight/unreachable-pickup/blocked-obstacle courses and fabricated adverse outcome fixtures; assert named gates fire | Instrument acceptance; distinguish geometry mutants from outcome fixtures |
| Readable, memorable and enjoyable | Owner Keep/Maybe/Reject and notes, no default pick; camera/sofa viewing later | Owner only; explicitly unmeasured |

Per-section heatmaps use fixed arc bins and lateral lanes, not screen pixels: contact episodes, wrecks, spin entries, mean active-car speed and racing-line occupancy. Expose denominators so unvisited road is **unmeasured**, not zero risk. Persist per-run evidence, seeds, hashes, rotations, car/style assignments, stopping reason and sample exposure. Geometric 90-degree rotation should preserve measured length/width/curvature within tolerance; simulation rotation is a tolerance cross-check, not an assumed bitwise promise.

T1 completion means the instruments operate and tell the truth, including bad results. It does not mean the current library meets the authored targets. T2/T3 retain ownership of redesign, campaign duration acceptance, hunter-plan validation and owner feel.
