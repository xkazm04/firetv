# Part 3 — Repair the accepted finale encounter

2026-10-04. Preserve crown-7-a centreline, widths, surfaces, junction and approved silhouette. The R3 baseline has three unresolved actual duels out of twelve at the existing 600-second watchdog. First reproduce on the installed assignment, including the real rival shop configuration; inspect ammunition, damage, health and time without treating six-car traversal as a duel.

Pilot only supplies, start arrangement and perception-based hunter behaviour. No car power, hit/HP authority, attack cap, start protection or winner rule changes. Both drivers use normal inputs and physics. If searching is needed, it must depend on local visibility and simulation time, not unseen player coordinates. A timeout remains an explicit draw/censored outcome, never a fabricated elimination win; do not extend the horizon to turn a failure into a pass.

Compare the original twelve seeds, then independent held-out seeds and skill settings. Report rig wins, boss wins, unresolved outcomes, early wrecks, one-shots and timing. Re-run the six-car traversal/shape proof for any supply/grid changes and preserve the old proof as before evidence. Any remaining failure stays visible. No art changes.


## Repair and evidence

Supply-only pilots reproduced 3/12 timeouts with the original eight sites; eight centre-lane sites gave 2/12, sixteen gave 4/12 and twenty-four gave 1/12. Timed-out cars still had full ammunition and positive hull, including seed 112048 in every supply variant. The fault was sustained loss of contact, not starvation. Retained all pilot outcomes; did not ship extra supplies.

The named finale hunter now patrols at .42 of its normal AI target pace while no opponent passes the existing range/road visibility gate, after the existing 20-second opening. Ordinary throttle/brake inputs implement the target; all vehicle specs, damage, equipment and physics remain shared. Seeing a target restores pursuit; the existing visible-behind waiting lane remains. Target projection now uses the opponent's known course passage at the approved at-grade crossing. No unseen position drives search direction or pace. No per-step allocation was added.

The approved bundle remains byte-identical. Installed node/spot/junction/branch/race CSVs match that bundle byte-for-byte; the authoring recipe is unchanged. Eight original alternating ammo sites, no repairs, original start grid, 600-second watchdog. Lint checks validate spacing. Existing timeout tests explicitly verify a leader at timeout receives no elimination win and the career does not advance; no fabricated timeout victory or extended observation window.

Original 12 seeds: unresolved 3 ? 0; actual rig wins 7 ? 4; new median 125.25 s, maximum 164.68 s. Independent seeds 12?139: 0/128 unresolved, 53 rig wins, no one-shot kills. Both entrants use Pro AI in this asymmetric equipment fixture. These are AI measurements, not human win odds. All three original timeout seeds are now explicit actual-equipment regression tests. The 12-trial native evidence tool repeats its first state hash and verifies installed CSV equivalence to authoring CSV after the intentional first-column course-ID remap. It records both hashes, avoiding a false stale-proof flag caused by that metadata remap.

Evidence: deathride/evidence/tracks/owner-part3 (comparison, raw pilots/held-out trials, approved-layout preservation), tracks/candidates/crown-7-a-duel.json. The final campaign study in part 4 additionally crosses all three difficulties and both grid rotations. Required build/browser completion is recorded in the session log.
