# Death Ride: owner notes and backlog (kept so they are not forgotten)

## N1. Propagate the art style into the HUD, every component (owner, 2026-10-02)

> do not forget about propagating the artstyle into HUD layout itself and each of its component which will end up to be in game

The fusion art direction (Soot Pulp for portraits and barriers, Rust and Ink for cars, ground and surfaces, Hot Ink for icons and effects; see `deathride/art/OWNER-CHOICE.md` in the art worktree) covers assets, but the **HUD layout and every HUD component** still use the procedural look.
Scope: lap and position, speed, HP and armour bars, ammo and weapon slots, ability meters (new, from the abilities stream), minimap, countdown, results and garage and shop screens, menus, TV lobby, story cards, phone controller page (buttons, steering pad, sheets). Each component gets the family style (Hot Ink for icons and frames), consistent wear, a sofa-readable size, and a procedural fallback.
Owner of the work: an integration pass after the art fusion (part 3) and abilities streams land; it needs a HUD component inventory first (every component that ends up in game, including ability meters), then an atlas update. Not scheduled yet.

## N2. Mines: reduce the blast radius to 10% (owner, 2026-10-02)

> mines, reduce its current radius to be 10% of current size which exceeds the mine

Current data (`deathride/core/src/main/resources/data/weapons.csv`, row `Mine`): `radiusM = 5` (blast). Owner request: 10% of current, so about **0.5 m**. Related values: `combat.csv` `mineTriggerRadiusM = 1.6`, `aiMineAvoidMarginM = 2` (the AI avoid margin adds the mine radius, `Combat.kt:246`), the visual ring in the renderer.
Host notes, not owner words: (1) 0.5 m is smaller than the 1.6 m trigger radius and smaller than a car's collision radius (1.5-2.3 m), so the effect becomes a direct hit on a car's centre; check that `inRadius` uses the car centre or the car's circle, and set the blast and trigger relation deliberately (the owner's phrase "which exceeds the mine" suggests the blast is visibly larger than the mine sprite, which a 0.5 m blast would no longer be unless the mine sprite is also small). (2) Re-run the balance report, the no-one-shot floor, the AI mine rule and the telegraph/arming budget after the change: mines were 24 damage with a 5 m blast and will be much weaker. Consider keeping the damage or restoring a larger trigger relative to the blast so the weapon remains useful; ask the owner if the 10% was a literal figure or a "much smaller" instruction.
Applied by: the abilities stream (A3 balance pass) if it reads this file; otherwise the next combat change. Status: **not applied**.
