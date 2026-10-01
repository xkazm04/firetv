# Owner choice (2026-10-01): a fusion of the five style directions

Source: the owner's review of `deathride/art/review/v2/index.html`. Quoted verbatim, then the host's reading (marked as the host's).

## A. Art style: the owner's preferences

> - Soot Pulp - portrait, barrier
> - Rust and Ink - cars, ground and surfaces
> - Hot Ink - icon, effect
>
> It seems each style can be strong in its own part of the game arts, all quite compatible together as the difference scale is not dramatic.

Host reading: **fusion by asset family.** `style-soot-pulp.json` for portraits and barriers; `style-rust-ink.json` for cars, ground and surfaces; `style-hot-ink.json` for icons and effects (the bleached poster and scrap collage directions are dropped).
The three style blocks are not mixed inside one prompt. A shared **bridge block** (palette anchor, neutral-light contract, outline weight band, wear level) is restated verbatim in every prompt so the families sit together; the owner says the difference scale is not dramatic, so the bridge is a tightening, not a redesign.
Unassigned families need a rule: props, pickups, landmarks, backdrops and HUD frames follow the nearest assigned direction (props and landmarks: Rust and Ink; pickups: Hot Ink; backdrops: Soot Pulp; HUD frames: Hot Ink) and are logged as host assignments.

## B. Surfaces to keep

> - Seeded decals
> - Tall props and shadows, if we can implement conflict. We can come up with natural objects slowing cars as barriers
> - Narrow band stack can work, but the track lines cannot look like drawn

Host reading:
1. **Seeded decals**: keep.
2. **Tall props and shadows**: keep, with a gameplay consequence: "natural objects slowing cars as barriers" means props are not only decoration. Some natural obstacles (brush, rock fields, soft dunes, dead-tree clusters, tyre piles) should have a **footprint and a slowing or colliding effect** on cars. Needs a catalog field for collision footprint and effect class (drag, solid, none) and a core hook; the art run supplies assets and metadata, a later core change wires the effect.
3. **Narrow band stack**: keep, but the lab measured it as CPU-expensive (rebuilding more geometry) and cut it for budget. The way to keep it is to bake the bands into the course ribbon texture or vertex colours once per course, not rebuild per frame.
   **Track lines must not look drawn**: no uniform geometric outlines or ink strokes along the track; edges should read as natural wear, dirt encroachment, tyre rubber, worn paint, so the road looks like it belongs to the ground.
