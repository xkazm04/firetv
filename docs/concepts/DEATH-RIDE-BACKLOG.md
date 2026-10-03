# Death Ride: owner notes and backlog (kept so they are not forgotten)

## N1. Propagate the art style into the HUD, every component (owner, 2026-10-02)

> do not forget about propagating the artstyle into HUD layout itself and each of its component which will end up to be in game

The fusion art direction (Soot Pulp for portraits and barriers, Rust and Ink for cars, ground and surfaces, Hot Ink for icons and effects; see `deathride/art/OWNER-CHOICE.md` in the art worktree) covers assets, but the **HUD layout and every HUD component** still use the procedural look.
Scope: lap and position, speed, HP and armour bars, ammo and weapon slots, ability meters (new, from the abilities stream), minimap, countdown, results and garage and shop screens, menus, TV lobby, story cards, phone controller page (buttons, steering pad, sheets). Each component gets the family style (Hot Ink for icons and frames), consistent wear, a sofa-readable size, and a procedural fallback.
Owner of the work: an integration pass after the art fusion (part 3) and abilities streams land; it needs a HUD component inventory first (every component that ends up in game, including ability meters), then an atlas update. Not scheduled yet.

## N2. Mines: reduce the blast radius to 10% (owner, 2026-10-02)

> mines, reduce its current radius to be 10% of current size which exceeds the mine

Decision baseline (`deathride/core/src/main/resources/data/weapons.csv`, row `Mine`): `radiusM = 5` (blast); A3 now uses `0.5`. Owner request: 10% of current, so about **0.5 m**. Related values: `combat.csv` `mineTriggerRadiusM = 1.6`, `aiMineAvoidMarginM = 2` (the AI avoid margin adds the mine radius, `Combat.kt:246`), the visual ring in the renderer.
Host notes, not owner words: (1) 0.5 m is smaller than the 1.6 m trigger radius and smaller than a car's collision radius (1.5-2.3 m), so the effect becomes a direct hit on a car's centre; check that `inRadius` uses the car centre or the car's circle, and set the blast and trigger relation deliberately (the owner's phrase "which exceeds the mine" suggests the blast is visibly larger than the mine sprite, which a 0.5 m blast would no longer be unless the mine sprite is also small). (2) Re-run the balance report, the no-one-shot floor, the AI mine rule and the telegraph/arming budget after the change: mines were 24 damage with a 5 m blast and will be much weaker. Consider keeping the damage or restoring a larger trigger relative to the blast so the weapon remains useful; ask the owner if the 10% was a literal figure or a "much smaller" instruction.
Applied by: the abilities stream (A3 balance pass) if it reads this file; otherwise the next combat change. Status: **APPLIED by A3 on 2026-10-02; 0.5 m remains provisional.** Owner: "keep 0.5m for now for the main": use the literal 0.5 m blast radius on the main line (`weapons.csv` Mine `radiusM` 5 to 0.5), as a provisional value to be revisited after play.
Apply after the abilities run (A3) has finished, so its balance numbers are not changed mid-run; then re-run the balance report, the AI mine rule (`aiMineAvoidMarginM` adds the mine radius), the no-one-shot floor and the mine telegraph/arming budget, and decide whether `mineTriggerRadiusM` (1.6 m) and the mine damage (24) need adjusting so the weapon stays useful. Report the before/after to the owner.

A3 result: 5 m to 0.5 m blast, effective trigger clamped to 0.5 m, mine/flash geometry scaled, existing 24 damage and timing retained. Body circles, not only car centres, determine overlap. Mine boundary, arming/escape, AI avoidance and one-shot checks pass. The complete 66,000-race rerun exposed a rare AI recovery jam; a recovery-only centreline target resolves it in 51.43 seconds and the fresh full matrix passes. No class-winner changes versus the 5 m baseline; individual driver winners and trajectories do change. See [A3 before/after and evidence](deathride/A3-balance-and-device.md). Owner-felt usefulness/readability is still pending; N1 remains the separate integration pass.

Handoff to [the new H0-H3 plan](DEATH-RIDE-HUD.md): N2 has landed in the A3 work and should be preserved/rechecked after H0's art merge. N1's HUD inventory, styling and felt review are still pending that stream.

## N3. Keep the full feature package, optimize later (owner, 2026-10-03)

> lets keep full feature package, we will optimize once we think the game is close to complete the gameplay test from will be more in need

Decision: do NOT cut effects or lower the render scale to close the Stick frame-time gate now. State on 2026-10-03: input robustness fixed (900 s soak, zero rejects), memory fine (peak PSS 140 MiB), frame p95 22.43 ms and worst 37.58 to 54.92 ms against 16.7 and 33 ms. The optimisation pass is deferred until the game is close to feature complete and play-testing is the priority; revisit then, with the perf report as the baseline (`deathride/evidence/perf/index.html`).

## N4. Campaign design pass, and art feedback on the campaign art (owner, 2026-10-03)

> Lets do another design pass for the campaign. ...Art direction for campaign is fine, props though do not reflect the environment game set, faces are often not visible as we focus too much on bodies of characters

Decisions: (1) another design pass on the campaign (pacing, boss dips, completion rate, censoring: the gameplay run left late boss PR ratios at 0.9385 and 0.9800, outside target, with completions per 2,000 careers falling from 1,292 to 1,099 and from 541 to 419). (2) The campaign art direction stays. (3) Props must reflect the game's environment (the wasteland, rust-belt towns, foundry, salt flats and quarry, mountain road, the league speedway), not generic objects. (4) Portraits and story cards must show faces: less body, more face; expressions readable at HUD and card size.
