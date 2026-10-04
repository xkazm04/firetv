# A3 — balance and device evidence, 2026-10-02

A0-A3 work is complete and build-green. **Numeric balance passes; final Stick frame and zero-loss input gates fail.** The remaining limits are measured below, with no relaxed thresholds. The owner-directed mine change is 0.5 m, and the new HUD H0-H3 plan remains a separate handoff.

## Accepted balance

**PASS: 66,000 final-runtime races across 78 cells.** This is the recovery-corrected 0.5 m mine build. The [independent audit](../../../deathride/evidence/abilities/a3/balance/audit.md) includes all ten classes, course timings, ability use/damage and first-wreck distributions; raw rows and hashes are adjacent.

The total is 40,000 abilities-on roster races, 4,000 matched roster baselines, 16,000 fully paired early observations and 6,000 homogeneous rotation races. The declared mix is 25% technical, 50% straight and 25% loose. Each cell has 100% distinct terminal hashes and replays its first seed (78 replay witnesses). No one-shot kills occur; all non-early race cells resolve. Early rows remain observations with explicit censoring.

| Tier | Abilities-on class winner shares | Skill / straight / hairpin margins (s) |
|---|---|---|
| rookie | Needle 47.24%; Line 52.76% | 10.89 / 16.84 / 5.28 |
| club | Bastion 48.83%; Trail 51.18% | 22.50 / 20.25 / 17.55 |
| pro | Comet 50.04%; Flint 49.96% | 15.64 / 25.99 / 9.78 |
| elite | Quill 49.44%; Vandal 50.56% | 11.92 / 21.61 / 6.88 |
| champion | Kestrel 48.41%; Bulwark 51.59% | 13.51 / 16.69 / 8.28 |

The largest class share is 52.7625%, below the unchanged 55% gate. Every pair retains a best and worst course; all homogeneous orders agree with contested orders. Skill, straight and hairpin margins exceed their original 1 / 2 / 2-second requirements. All ten signatures are used. These are AI proxies, not owner-felt fairness.

All four early scenarios have **0% lead losses before lap one**, on and off, with 2,000 matched seeds per mode/scenario and no unsettled lead outcomes. The final Crown on-sample observes 106 first wrecks and censors 1,894: conditional min / p50 / p95 are 78.28 / 126.15 / 169.32 seconds. Other on-scenarios observe no wreck by the declared horizon. No-wreck cases are not assigned invented times.

### Owner N2 before/after

The completed 5 m baseline passed. The first 0.5 m run retained class winners but exposed two stranded entrants in one Elite seed; the recovery-only lane correction restores full acceptance. Final versus 5 m baseline changes 25,603 terminal hashes and 1,697 winning driver slots, but **zero winning classes**. The recovery correction alone changes 604 hashes and 31 winning slots, also zero winning classes. Thus unchanged class shares do not mean identical races. Both paired comparisons and the failed intermediate run are retained.

The 5 m baseline had one observed Foundry on-wreck; final has none. Crown on-wreck observations move from 102 to 106, with all early-loss rates still zero. Smaller blast geometry changes avoidance and later contacts; overall HP totals are not isolated mine damage. The requested 0.5 m stays provisional pending actual play, with 24 base damage, 1.4-second arming, 18-second life and existing ammo/cooldown unchanged. Effective trigger is 0.5 m, body-circle overlap remains authoritative, and visual scale and local AI avoidance consume the actual radius.

## Measurement design

Design before measurement. Use the merged axle physics and shipped abilities. Full acceptance uses the existing roster/combat samples-per-scenario rules, not an entry-rate proxy. The declared synthetic course mix remains `roster-courses.csv`: weights are consumed by the independent audit. Each tier races three copies of each peer with alternating grids, equal Rookie skills and a Champion-agile/Rookie-fast technical skill swap. Weapons and abilities are enabled with the corresponding division damage policy. Compare abilities-off on the same merged code/Quill stats and seeds; baseline sample size is declared separately. Publish every course and grid stratum, skill/straight/hairpin margins, unresolved entries and per-cell hash diversity.

The separate homogeneous class/course rotation repeats every class on every declared course with the same seed set. Its peer timing order is a cross-check, not a replacement for contested race winner share. Early-wreck scenarios use the C3 reference lead and fields, but current authored division lap targets/timeouts. Count a lead wreck with zero completed laps, distinguish no-wreck censoring, and publish first-wreck distributions, per-class activations per active minute, zero-use entries and actual ability damage share. Raw rows include slot-level class/position/finish/wreck/lap/HP/use/damage facts for an independent Python audit. Failed pilots are retained; no threshold is silently weakened.

Device: scan all 254 addresses of the active Wi-Fi /24 for ADB 5555. Verify package identity before install; only `dev.deathride.abilities` / 8767 may be installed/restarted. Preserve the existing TV package record. Run all-class ordinary input sessions plus controller lifecycle checks, recording actual simulation/effect use, p50/p95/max frame/step, discarded time and memory. Original frame targets remain p95 16.7 ms and active maximum 33 ms; prior G2 already missed them, so report measured misses without claiming a pass. No claim of physical-phone comfort, optical latency, human fairness or fun.

Protocol refinement before accepted runs: early probes retain the current authored lap targets, but use the canonical C3 `maxSeconds` observation horizon (180 seconds). They stop sooner only once both lead lap-one fate and first wreck time are final. No-wreck observations are explicitly right-censored at that horizon or race completion. The audit rejects any lead whose lap-one outcome remains unsettled, so censoring cannot silently turn an unknown early loss into a pass. No winner is inferred from an early observation. The initial full-endurance candidate run was stopped before any cell completed because later laps did not answer the requested early-race question efficiently.

## Calibration decisions

The initial 40-race/cell pilot is diagnostic only. It found Line at 57.5% of the declared mix and zero Scrambler uses across the measured Vandal entries. The latter was a real AI defect: the signature inherited Rookie's disabled mine-weapon flag. Signature use now depends on the authored local rear-target rule; the existing mine restriction remains. A regression test covers a Rookie Vandal seeing a chaser. A 200-race/cell Elite diagnostic then observed 4,709 Vandal uses across 1,800 equal-skill entries (1.537 uses per active minute).

The first 2,000-race/cell Rookie sweep confirmed Line dominance at 56.225%; its 200-race/cell abilities-off baseline was already 55.375% on the merged drift model. Tuning therefore needed to address the combined car/ability behavior. Course weights and the 55% gate were retained.

| Diagnostic | Needle speed / acceleration / grip | Line acceleration / grip | On winner shares (Needle / Line) | Outcome |
|---|---|---|---|---|
| Initial A2 runtime, 2,000/cell | 4 / 7 / 5 | 4 / 4 | 43.775% / 56.225% | failed |
| Burst refinement, 2,000/cell | 4 / 7 / 5 | 4 / 4 | 43.825% / 56.175% | failed |
| Grip trade, 500/cell | 4 / 6 / 6 | 4 / 4 | 40.35% / 59.65% | failed |
| Launch trade, 500/cell | 4 / 8 / 4 | 4 / 4 | 42.45% / 57.55% | failed |
| Speed trade, 500/cell | 5 / 5 / 5 | 4 / 4 | 39.00% / 61.00% | failed |
| Line launch cost, 500/cell | 4 / 7 / 5 | 3 / 5 | 49.40% / 50.60% | candidate for acceptance |

The retained candidate restores every Needle base stat and trades one Line acceleration point for one grip point. Line remains the faster, heavier, more durable peer with slower launch, steering and braking. Both remain in the existing PR band. Steel Flick's candidate is a 0.8-second, 1.8-times engine burst with 0.96 grip and ordinary steering; its energy, cooldown, speed cap and gun commitment costs remain. The older 0.6-second burst's extra steering and larger grip penalty were removed. Final numeric authority remains the CSV, not this historical trial table.

The first separate `abilities/acceptance` seed namespace exposed an existing signed-seed defect: `(id*7+seed)%5-2` produces only negative lane offsets for negative seeds. A sign change between calibration and acceptance moved the Rookie mix from 50.6% Line to 81.5% Needle, and changed the straight margin from 16.67 to 2.25 seconds. Terminal hashes were diverse, so hash diversity alone did not detect this systematic bias. This is why a separate seed set mattered.

AI lane selection now uses nonnegative modulo and a Long intermediate, preserving the intended five-lane cycle even at Int boundaries. A regression test compares negative, positive and extreme seeds with their equivalent remainder; positive ordinary game seeds retain their lane cycle. The interrupted, invalid acceptance outputs are archived as `signed-seed-failure`. All earlier trial shares above are historical diagnostics on that defective lane rule, not final balance evidence.

Restarted acceptance uses `abilities/acceptance-v2`: 2,000 races per on-cell, 200 matched off races per roster cell, and 2,000 on/off per early scenario. The homogeneous cross-check has 200 seeds/class/course. Acceptance seeds differ from calibration seeds; full sample counts and actual row provenance will be reported. Each completed cell replays its first seed and verifies the terminal hash. The independent audit requires the complete early on/off seed sets to match and checks homogeneous peer seed sets too.

Screenshot review of the initial Stick run exposed the new ability readout overlapping the existing course summary. The race header now reserves that area for the ability; course context moves to the lower status line. The initial 900.226-second run is retained as failed input-gate evidence (eight/seven rejected packets), not substituted for the final APK. It recorded all ten signatures, five simultaneous committed abilities, no host pump stalls, and frame-tail misses. The probe records rejection RTTs and uses best-RTT clock sync with periodic pings.


## Owner backlog N2 discovered during final review

Commit `67d660a` added [DEATH-RIDE-BACKLOG](../DEATH-RIDE-BACKLOG.md) during this session, assigning the mine-blast change to A3 if read. Owner decision `11b2657` then confirmed the provisional literal 0.5 m and asked for a before/after report after the abilities run; the pre-N2 66,000-race matrix had already completed before this change. Apply `weapons.csv` Mine radius 5 → 0.5 m, retaining 24 damage, ammo, cooldown, 1.4-second arming and 18-second life. `inRadius` checks the car's body circles, not only its centre, so a 0.5 m blast still hits a hull that overlaps it. Effective trigger radius becomes `min(configured trigger cap, blast radius)`: no wider empty detonation, and one authority for the new blast size. Keep the existing local AI avoidance margin; it already adds the actual blast radius and car radius.

Shrink the procedural mine body/shadow to fit its warning circle; constrain the expanding blast ring and fallback sparks to the same radius. The atlas explosion already consumes twice the actual radius as its width. Add a boundary fixture proving a car outside the new blast does not trigger it and a grazing hull inside it takes exactly one hit. Recheck arming/escape and no-one-shot bounds, full balance and the final APK. The existing 66,000-race passing matrix is now a pre-N2 baseline, not final acceptance. N1's full HUD family restyle is explicitly assigned to a later integration pass and remains pending.

Final review also found the lobby's typed address hardcoded to port 8765 despite the QR/listener using 8767. Bind the displayed address to `server.port` so manual pairing reaches this isolated application too.

## Build and device protocol

The recovery-corrected final build passes **120 core / 3 link / 3 renderer tests**, including the zero-allocation and deterministic replay suites; APK and desktop distribution build successfully (6m). The seven adversarial audit fixtures pass: valid raw rows, wrong winner, duplicate seed, repeated terminal state, wrong clock, ability use while disabled, and incomplete strict acceptance. The audit now also requires all ten signatures to be used and the homogeneous peer orders to agree with contested course orders.

ADB discovery scanned `10.0.0.0/24` port 5555 and found `10.0.0.139:5555`, model AFTKM. The final installed package is `dev.deathride.abilities`, served on 8767. Local and installed APK SHA-256 match: `2c0f1dc30084c80b7824f363e43d7697c604ced78c4d454a068d9e612f7ee240`. The source activity namespace still contains `dev.deathride.tv`; the installed application ID is the isolated abilities ID. No TV-package install or force-stop was issued.

Before the recovery correction, Chrome CDP touch checks passed all six Classic/Cruise/Split by mirror combinations (1,780 input packets), independent pointers, settings neutralization and disconnect release. These are real browser events against the Stick listener; they do not establish physical-phone reach or comfort. Device telemetry reports both mine blast and effective trigger radii as 0.5 m. A separate visual run holds ordinary mines as well as guns/abilities and captures their actual activity; no damage or simulation state is injected.

Historical device runs are retained. The initial A2 run rejected 15 packets. The first final-HUD run rejected six packets and had 11 host pump stalls; reduced retained JSON with no screenshot capture then accepted all packets but had four host stalls while headless reports ran. Raising only the **test driver's** host scheduling priority to AboveNormal produced a complete pre-N2 run with 54,006 accepted packets, zero rejects and no pump stalls. No input-age rejection rule was relaxed. That run still missed frame tails (worst active rolling p95 22.899 ms, max 94.264 ms), so passing the input driver is not a performance pass. The final N2 run waits for this stream's headless races to finish and uses that same priority, no in-run screenshots, and ordinary mine holds. Screenshot capture and final performance evidence are separate.

Frames are measured by the app, with complete active windows requiring at least ten simulated race seconds. Rolling windows overlap; their percentiles are not averaged or added. Startup, preparation and interrupted practice rounds remain visible in raw data. Memory records include process PSS, host driver memory and device thermal status. The probe rotates all ten classes over five courses; normal mortal AI cars mean this is not a forced maximum-effects fixture.

## Reproduction

From `deathride`, run `./gradlew.bat :core:test :link:test :game:test :app:assembleDebug :desktop:installDist`. The isolated app ID/port are in `gradle.properties`.

For the final report use `:core:abilityReport` with `-PabilityTag=accepted-final -PabilitySeedNamespace=abilities/acceptance-v2`, in three runs:

| Part | abilitySamples | abilityBaselineSamples | abilityParallel |
|---|---:|---:|---:|
| roster | 2000 | 200 | 4 |
| early | 2000 | 2000 | 4 |
| rotation | 200 | 0 | 2 |

Set `-PabilityPart` to the table's part. During this session the already compiled test runtime was launched directly with the same arguments to avoid concurrent Gradle writers; complete commands and outputs are retained in the logs. Each cell independently replays its first seed and checks its final state hash. Then run:

```text
python tools/audit-abilities.py core/build/reports/abilities/accepted-final --strict
python tools/check-ability-audit.py core/build/reports/abilities/accepted-final evidence/abilities/a3/audit-checks.json
python tools/compare-mine-radius.py evidence/abilities/a3/pre-n2-balance core/build/reports/abilities/accepted-final evidence/abilities/a3/mine-before-after.json
python tools/archive-abilities.py core/build/reports/abilities/accepted-final evidence/abilities/a3/balance
```

`audit-abilities.py` also reads the compressed archived CSVs. Device tools accept the discovered `http://ADDRESS:8767`, displayed PIN and output path; `ability-stick-probe.mjs` additionally accepts duration seconds. Final performance environment: `PROBE_MINES=1`, `PROBE_SCREENSHOTS=0`, `PROBE_PRIORITY=AboveNormal`, duration `900`. `CHROME_EXECUTABLE` selects installed Chrome for the controller touch tool. Use only an unoccupied abilities listener.

The evidence manifest binds the compiled core/data fingerprint, packaged CSV bytes, local/installed/device APK hashes, tests, sources and archived files. `runtime-data.zip` preserves exact input bytes; Git text hashes normalize LF. Binary/compiler or line-ending differences can alter fingerprints on another machine without changing CSV values; outcome replay is the behavioral check.

The 420.063-second pre-recovery N2 visual run passed its input gate (25,204 accepted packets, zero rejects/stalls), reported ACTIVE for all ten classes and captured all ten classes plus the small mine ring. It observed 171 mine shots across its rounds and up to 14 live mines. Screenshots are observations after the telemetry request, not frame-synchronous proof of the exact short phase. Review also found the lower course/status text low-contrast over Ridge Wire snow; include its background/contrast in the pending N1 HUD integration pass. The upper ability/energy HUD remains separated from the course summary.

The read-only before/after package records for `dev.deathride.tv` have identical version code, first-install time and last-update time (`package-isolation.json`). Its installation was preserved.

## N2 recovery failure found by complete acceptance

The first complete N2 matrix retained all mixed-course winner shares and early fairness, but strict acceptance failed: seed `-1935872170` in Elite skill/technical left two Vandal entrants unresolved at 300 seconds. A direct regression reproduces both pressing against each other and the outside wall at near-zero speed, still aiming at their ordinary opposing lane offsets while in RECOVER. Preserve that failed 66,000-race run. Test a recovery-only centreline target through the existing steering/throttle physics; do not exclude the seed, extend the report horizon, teleport cars or relax the unresolved gate. Rerun the complete matrix and final APK if the correction works.

The centreline recovery target passes the reproduced encounter: both stalled cars regain motion and finish through ordinary inputs. A permanent regression requires entering recovery and resolving all six by the original 300-second limit. Only RECOVER changes its base lane; ordinary driving/overtaking and local obstacle rules remain. Final acceptance is restarted as `accepted-final` on the same paired seeds, including a fresh complete balance matrix, green build and corrected-APK device checks. The first N2 matrix and its device run are diagnostic evidence, not final acceptance.

The corrected regression resolves all six entrants in 51.433 seconds. The final runtime fingerprint is `9d81387ed7a13014e34db09e1d7f39347c6befa17fb4461492e7c7959668bdfd`; all 66,000 final rows must match this compiled core/data fingerprint.

Final-APK controller verification passes all six layouts/mirrors again: 1,827 packets, independent pointers, settings neutralization and disconnect cleanup. A host ADB daemon restart subsequently dropped the debug connection; a fresh 254-address scan found the same Stick. The evidence reader now records and retries one reconnect for a missing/offline ADB device. This does not restart the game or change controller acceptance, and reconnect events remain in raw evidence.

The corrected-APK visual run lasted 420.144 seconds and accepted all 25,210 packets with no rejects, host stalls or ADB reconnects. All ten classes reported ACTIVE over the live HUD link; it captured ten class screenshots and observed 150 mine shots, with up to 16 live mines. These stills are not guaranteed to catch each effect: the final Kestrel image already shows cooldown after its short active phase. Live phase telemetry proves activation; owner review is still required for the warning/effect's readability. Its separate frame sample also misses the original tails (p95 21.014 ms, max 54.453 ms); the final performance run remains the declared 900-second no-capture measurement.

HUD handoff: owner commit `4631eb1` adds [DEATH-RIDE-HUD H0-H3](../DEATH-RIDE-HUD.md) for the next branch. Its queued N2 step is already implemented and revalidated by A3; H0 should preserve/check the literal 0.5 m and this trigger relation after its art merge. H1-H3's full component style inventory, assets, readability and owner checks remain separate work. The owner-authored plan is preserved.

The final-APK lobby capture confirms the typed address uses port 8767. It also exposes a transient preparation-message overlap with the pairing-reset hint; this joins the snow-footer contrast defect in the H0-H3 handoff. Neither is presented as a completed HUD restyle.

## Final Stick result and remaining work

The recovery-corrected APK ran for **900.097 seconds**, 18 practice rounds (9 reached results). Both controllers sent at 30.000 Hz. All ten signatures activated; up to five were concurrently committed. The run emitted 310 mines and observed up to 17 live mines, with blast/trigger telemetry both 0.5 m. The installed/local/probe APK hashes agree.

| Measure | Observed | Gate |
|---|---:|---|
| Accepted / sent inputs | 54,001 / 54,006 | FAIL: five rejected |
| Host pump stalls / ADB reconnects | 0 / 0 | no harness stall observed |
| Active frame median range | 16.557-16.840 ms | PASS: 16-18 ms |
| Worst active rolling frame p95 | 20.914 ms | FAIL: 16.7 ms |
| Active maximum frame | 48.153 ms | FAIL: 33 ms |
| All-window maximum frame | 256.746 ms | startup/preparation also retained |
| Worst active step p95 / max | 3.234 / 10.700 ms | measured physics cost |
| PSS range | 106.79-113.55 MiB | PASS: 192 MiB |
| Warm first/last median PSS growth | +2.24 MiB | PASS: 8 MiB |
| Owned texture maximum | 37.97 MiB | PASS: shipped budgets; zero art failures |
| Discarded time in any complete active window | 0 ms | startup/preparation total remains 952 ms |

The five rejected packets cluster at 661.5-663.1 seconds, with ACK RTTs **268.6-869.4 ms**. Nearby app frame-window maxima were about 30-31 ms and the host pump recorded no stall. These observations do not identify whether network or other scheduling caused the delay. The strict stale-input rule stays intact; this is not a zero-loss input pass. Earlier passing input runs and every failed/diagnostic run remain available, rather than replacing this final measurement with a better sample.

Keep the frame-tail and intermittent input-delay issues open for performance/network investigation and H3's repeat checks. The A3 check is executed, not a performance acceptance. N1/H0-H3 styling, the snow-footer contrast and transient lobby overlap, physical-phone comfort, optical latency, sofa warning readability, audio and owner-felt fairness/fun remain unapproved. No push was issued.

Evidence entry points: [manifest](../../../deathride/evidence/abilities/a3/manifest.json), [balance audit](../../../deathride/evidence/abilities/a3/balance/audit.md), [final Stick summary](../../../deathride/evidence/abilities/a3/release-soak/summary.json), [controller checks](../../../deathride/evidence/abilities/a3/controller-release/result.json), and [owner checks](../../../deathride/OWNER-CHECKS.md).
