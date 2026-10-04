# Z0 — opponent intent and race time

2026-10-04. Design before implementation on `deathride/ai-pacing`. Original text and code; no generated art, external generation or publication.

## Sources and binding decisions

Read `DEATH-RIDE-AI-PACING.md` first, then the backlog, owner decisions of 2026-10-03, campaign DV0–DV3 and OWNER-APPLY-1-CAMPAIGN, its retained physical/ledger evidence in `deathride/evidence/owner-decisions/campaign`, A1–A3 ability notes and G-obstacles. Runtime sources: World, Combat, Abilities, Career, AshCircuit, DeathDuel, Tracks, their CSVs and CampaignReport. Registry consulted read-only at `C:/Users/kazda/kiro/ai-registry/knowledge/game-production`: agent-behaviour-authoring techniques (model selection, commitment/recovery, perception, shared leases, decision traces), difficulty-design-and-adaptation, encounter-balance-simulation and combat-pacing-and-dramatic-arc. Balance notes live under `balance-validation`, not under `systems-canon/balance-validation`.

The owner's verbatim decisions remain in the parent plan. Any current first/second-place car can be hunted and wrecked. Bosses have extended health and exploit the visible player car's weakest part. There is no hunt indicator. Ordinary boss promotion still requires surviving and finishing first; the finale is last car running. No change to this gate is a balancing option. Four-second protection, hit deduplication, shared physics, two attack slots, Mine radius 0.5 m and existing ability tells remain. Difficulty changes decisions, never engine power or grip. Save event and car IDs remain stable.

## Current diagnosis

World drives DRIVE/OVERTAKE/RECOVER at the skill reaction cadence, with minimum dwell and recovery. Combat chooses nearest forward targets, respecting `aiMaxAttackers` through `lastTarget`, but lacks a lease or race intent. Ability decisions already use local distance and road obstruction. Rival rows provide lane/pass/fire/heavy/mine style values. No current layer represents rank, race phase or strategic commitment. Boss HP is ordinary HP. Economy settlement expects health on a 0–100 condition basis: extended physical HP must be normalized at that boundary, not clipped or copied into a second pool.

Historical owner-application evidence is the before baseline: 669/2,000 race-informed completions, 8/2,000 highest-PR completions, 70-attempt censoring, no bankruptcy. Rookie 0/667 and Club 3/667 completions reveal a first-place bottleneck. These are conditional resampled ledgers, not independent end-to-end human careers. Old numerical acceptance remains incomplete.

## Model and numeric ownership

Keep the three driving modes. A separate strategy layer chooses intent; the driving FSM executes ordinary steering/throttle/brake and the existing combat/ability systems execute attacks. No fourth movement mode is needed.

* `ai-temperaments.csv`: one row per chassis plus the supplied rig. Contact willingness, block willingness, preferred range in car lengths, lane-risk fraction, ability-use cadence, leader/near/damaged target weights. Bastion/Bulwark bruisers; Needle/Line/Trail race first; Quill front/rear contact; Kestrel ranged hunter; Comet straight overtaker; Vandal/Flint brawlers; rig mine layer.
* `ai-personas.csv`: additive offsets for Rook (late pass), Ox (contact), Mica (corner patience), Vex (straight guns), Relay (balanced tactics), Marrow (calculated enforcement). Compose once at setup; existing rival style fields remain their sole authorities.
* `ai-plans.csv`: Rookie/Club/Pro/Champion hunter budgets, perception measured in car lengths, target commitment/lease/recovery seconds and switching margin. Rookie has zero hunters; Club light pressure; Pro/Champion permit a larger bounded share. Assign hunters deterministically from the race seed and roster, rotating slots rather than privileging player slot zero. Non-hunters retain temperament decisions.
* `ai-phases.csv`: settle, pressure, all-in, final-lap commitment, selected from own completed race fraction and lap. Roles field/rival/boss adjust phase engagement, never car physics. Early settle retains ordinary racing; protection independently forbids hunting and spending combat resources.
* `ai-weaknesses.csv`: stat identity, relative-tier deficit, current visible damage contribution and tactic. Low armor/fragile light hull → contact/Hammer; low handling or grip → corner pressure; low acceleration → blocking/brake check; low speed → straight pressure; low slots → ranged pressure. Public chassis specification can be inspected; current damage can only be sampled while the target is visible. Derived effective stats use actual installed equipment. Boss multiplier belongs to one boss table, independent of difficulty.

Numeric values are proposals until Z2/Z3 tests and observations. The six authored tables initially live beside this note in `ai-data-proposal/`; Z2 moves them into core resources when their consumers and content assertions exist. CSV values, not this prose, will be authoritative. No runtime behavior changes in Z0.

## Knowledge, leases and action

At the normal reaction cadence, sample a bounded local visibility set using physical distance and the existing road/solid obstruction test. Public race standings supply rank only, never an unseen coordinate or health read. An unseen leader cannot become a pursuit target. No target or stale facts means continue racing. Candidate selection is deterministic with stable tie-breaking. A visible committed target remains preferred until dwell expires and another candidate exceeds the switching margin. Death, finish, loss of visibility, leaving the leader duo or recovery can invalidate a hunt immediately; no shooting at remembered coordinates.

One target-slot registry owns claims for all intentional AI attacks, with `combat.csv:aiMaxAttackers` as the cap. Claims expire in simulation seconds, release on invalidation, and recover after a hit. Hunters and ordinary temperament attacks share the cap; contact, guns and offensive abilities cannot acquire separate budgets. Already committed projectiles/area effects resolve under their normal lifetimes; the cap bounds intentional active attackers, not retroactively cancelled physical effects or accidental collisions. Report those distinctions explicitly. Ordinary drivers may still collide while racing.

Contact and blocking change lane selection and requested speed only in the perceived target neighborhood. Recovery overrides offensive steering. Corner speed still comes from the shared lateral grip limit with no double grip penalty. Risk controls road margin, never grip. Ability rules retain every existing archetype's front/rear/straight/surface prerequisites; strategy may withhold an activation, never bypass its tell, energy, cooldown or recovery.

## Trace and proof

Preallocate per-car decision state and a bounded structured trace. Each decision records tick, mode, phase, hunter eligibility, visible candidate mask, target, reason, commitment and weakness/tactic. No strings, collections, clocks or allocations inside the step. Export after simulation, with explicit retained/dropped trace counts. Hash decision state for replay. Independently record actual damage and source, leader changes and maximum simultaneous claims; an intent counter alone is not proof of pressure.

Controlled content assertions must distinguish every temperament/persona, plan and weakness tactic. Include symmetric AI leaders, out-of-range/occluded leaders, start protection, lease expiry, hit recovery, hysteresis, field/boss roles, recovery override, normalized settlement, same-seed replay, active-step allocations, legacy saves and free retry/roadworthiness. Invalid tables and planted metric failures must fail their respective gates.

## Pacing and evidence protocol

Z1 measures all 25 courses at every chassis tier using the reference driver (solo, three flying laps after launch), recording finite lap times, seed and class, plus the finale arena as a course separately from elimination duration. First visit target 150 seconds, ordinary level final target 300 seconds; interpolate intermediate visits. Use nearest target/lap integer, minimum two and sensible maximum six. If six laps cannot provide the envelope, lengthen the course through authored centerline geometry rather than adding repeated laps. Final variants need additional corners/surface decisions; preserve widths, car scale, themes, approved props, stable event IDs and the existing linter. Record measured complexity and final lap derivation as data, then verify full-race durations including launch.

Z3 reruns the existing physical library, boss supplement, two 2,000-career buyer policies and rotated duel cohort with immutable compiled/data bytes and disclosed seeds. Keep the 70-attempt censor boundary. Report first-place rates by skill/difficulty, all-event duration, lead early wrecks (<5%), hunter damage share, claim cap and leader changes, class winner shares and skill swaps. Retain failures, quantify sample size, test seed diversity and rotation coverage and plant failing metrics. Tune only boss HP, useful ally payouts or decision difficulty as evidence warrants. Report campaign hours including censoring separately; the accepted historical 4–6 hours will need owner review under shorter events.

Z4 makes an offline review using the existing audio report CSS/JS contract (unselected Keep/Maybe/Reject, per-decision notes, escaped Markdown export, persistence and clipboard fallback). Verify browsers each wave. Scan the active /24 for ADB 5555 and use only `dev.deathride.ai`; record actual race duration, trace and frame statistics without weakening the deferred N3 frame gates. No hunt UI.

## Wave status

Design and six proposed CSV tables authored. Required core/link/game tests, debug APK, desktop distribution and report classpath pass (6m22s). All six runtime browser suites pass: controller, combat, ability, HUD, campaign and duel. Initial browser launch failed because the new worktree lacked Playwright; local setup and successful retry are retained in `deathride/evidence/ai/z0`. Z1–Z4 have not started. Numerical or device acceptance is not claimed by this note.
