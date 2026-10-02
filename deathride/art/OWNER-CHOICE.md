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

## C. Car reference review (owner, 2026-10-02)

> Approved the art direction, looks very solid. For cars.
> 1. Needle constructions need to be more silver for visibility to look steely
> 2. Comet would need rework, having air turbines as engine with more massive back construction to handle it
> 3. Quill - I can imagine being accepted, but extended to have bone spikes around more massive constructions, as medium weight car specialized on using rear and front spikes for close contact damage
> 4. Kestrel - I can also imagine that car, by introducing electricity, having engine overpowering with energy, front spike transformed into electric harpoon... overall the cars are structured well to give their unique ability. It can be turbo, long range or contact weapon

Host reading (not the owner's words):
- The art direction (the fusion in section A and the surfaces in B) is approved.
- **Line, Bastion, Trail, Flint, Vandal and Bulwark** were not named for changes; the host reads that as accepted as they are. This is reversible: if the owner did not mean it, set the six entries back to `owner_approved: false`.
- **Needle**: keep the design, push the bodywork to a silver steel finish so it reads as steely and stays visible against dark ground.
- **Comet**: rework. Air-turbine engines (intakes or jet-style turbines) and a more massive rear structure that carries them; keeps its long, low top-speed role.
- **Quill**: now a medium-weight contact fighter. More massive build with bone-like spikes around the body, especially front and rear, for close-contact damage.
- **Kestrel**: electricity. An over-energised engine, the front spike becomes an electric harpoon; the car should read as able to have a turbo, long-range or contact weapon.
- Gameplay hint for the content side (not an art task): Quill's spikes and Kestrel's harpoon suggest ability data later (contact-damage bonus; a ranged tether or shock weapon). Art only needs the silhouettes and attachment points to make them plausible.

## D. Fusion review approved (owner, 2026-10-02)

> Fusion report looks nice, I approve this direction of art

The fusion direction (sections A and B) is confirmed after seeing the fusion review. This approves the **direction**, not individual assets: the four reworked cars (Needle, Comet, Quill, Kestrel) remain unapproved until their exact references are approved, per `V2-REFERENCE-APPROVAL.md`.
