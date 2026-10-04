# G0 — Five places the league has consumed

2026-10-04. Design before assets. Scope: G0 and G1 only, in `deathride/main`.

## Authority and interpretation

The owner, verbatim in [the region brief](../DEATH-RIDE-REGIONS.md):

> queue also goal to have each level of tracks slightly differently themed to differ environment, color of surface, props. We will have the premise each set of rounds until final boss will be in different area, it should generate variations of clima and flavor of wasteland

Binding sources: [OWNER-CHOICE A–F](../../../deathride/art/OWNER-CHOICE.md), [dated Keep/Reject decisions](../DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md), [STYLE](../../../deathride/art/STYLE.md), [fusion bridge](../../../deathride/art/FUSION-BRIDGE.md), `style-fusion.json` and its three hash-bound parent cards, [ACCEPTANCE](../../../deathride/art/ACCEPTANCE.md), [P4 kit](P4-world-kit.md), [V4 fusion kit](V4-part2-fusion-world.md), [atlas integration](I1-atlas-renderer.md), [Q0 plot](Q0-ash-circuit-plot.md), and the read-only `campaign.csv`, `campaign-beats.csv`, `track-themes.csv` and `obstacles.csv` under `deathride/core/src/main/resources/data`.

This is an executing-agent design, not an owner decision. The four kept exact rework-2 props are scrap pile, oil drums, rust pylon and league gantry. Their existing exports are reused where they belong; no rejected rework-2 image is restored or regenerated as a replacement. New objects below have a specific regional purpose under the new region instruction. All new art stays owner-unapproved and outside the runtime bundle.

Division wins recruit Rook, Ox, Vex and Mica; Marrow does not become an ally. The Mechanic shelters the missing sibling. Receipts expose diversion, the books expose the fraudulent league, and the Crown seizure leads to the supplied-rig last-car-running duel. Region art supports these beats without changing them. The existing courses cross theme families within each division: region is an act-level overlay, not a rename of a course or a new geometry assignment. The future track library inherits the division association in G2. `wetland` is a damp drainage material vocabulary within the industrial/mountain regions, not a sixth act.

## Landscape research, used as observation rather than copied composition

Accessed 2026-10-04. Original designs below abstract terrain and infrastructure, with no franchise/film names in prompts and no downloaded reference image used as a generation input.

- [Landschaftspark industrial monument](https://www.landschaftspark.de/en/industrial-heritage-circuit/denkmal-huttenwerk/): furnaces, bunkers, inclined lifts and casting halls make a connected industrial system. Design inference: distinguish the scrap sorting yard from the heavy foundry belt through what equipment does, not just rust colour. Its reclaimed landscape informs the quiet, abandoned yard edges.
- [NPS salt flats](https://www.nps.gov/deva/learn/nature/salt-flats.htm): drainage concentrates salts and crystals develop along mud cracks. Design inference: Salt Cut has a fine crust structure distinct from gravel, with pale evaporation beds next to ochre extraction terraces; avoid oversized polygon outlines that repeat conspicuously.
- [NPS Death Valley geology](https://www.nps.gov/deva/learn/nature/geologicformations.htm): alluvial gravel and silt/salt playa deposits coexist. Design inference: quarry and flats belong in one basin, connected by the league's mineral-haul economy rather than separate campaign divisions.
- [NPS alpine tundra](https://www.nps.gov/romo/learn/nature/alpine_tundra_ecosystem.htm): cold, long winters and exposed wind shape low vegetation and seasonal snow. Design inference: the high road uses anchored service hardware, scoured stone and patchy dirty snow; no lush forest above the pass.

The cinematic composition rules are our own: low broken silhouettes against a quiet sky, broad negative space for the road, and empty grandstands around the final spectacle. Atmosphere is a separate layer, never fog or a directional light painted into a neutral-light prop or tile.

## Common surface, scale and obstacle contract

Rust and Ink: ground, surfaces and props. Soot Pulp: backdrop/horizon panels (host nearest-family assignment already established for backdrops). Hot Ink: atmosphere/effects. Every generated prompt resolves exactly one parent plus the unchanged fusion bridge. No faces, people, lettering, brands or baked cast shadows in environment art. Props are strict overhead plan views; backdrop/horizon panels are explicitly flat graphic panels, never mistaken for overhead collision art. Natural road edges stay broken material encroachment, never drawn outlines.

Hex colours below are target material midtones, not unrestricted palette additions. Soot `#171513`, earth `#39302A`, ochre `#A37738`, rust `#B4512D`, dried red `#6C2427`, bone `#DDD0A6`, hazard `#B4A044` remain the fusion anchors. Each region has one accent role; other warm colours read as dirt/material. Snow/ice use bone-grey mixtures, not cyan. Coloured grades are low-amplitude presentation proposals, not physics.

Footprints in the prop tables are local-metre ellipse **full diameters** W × H; machine metadata stores radii W/2, H/2, centre [0,0]. Proposed visual extent is W × H for low objects and up to 1.35W × 1.35H for tall ones. `none` has a placement extent but **no collision footprint**. `drag` means a proposed slowing footprint (coefficient intentionally deferred to core validation); `solid` means collision. These are art proposals, not modifications to `obstacles.csv`. Height Ht is metres; all shadows remain renderer-generated. G2 must reconcile obstacle IDs, legal placement and passable width with the finished courses. No picture creates collision by itself.

## 1. Ash Yards — division `scrap`, boss/ally Rook

Burned vehicle sorting yards outside the workshops. Marrow owns the debt; Rook controls the gate and becomes the first ally after defeat. Scrap 1's ash on the key and scrap 6's numbers under soot are literal environmental clues: useful metal is sorted, tagged only later with game typography, and hauled toward the foundry. The Mechanic's improvised garage belongs here.

Climate/flavour: dry soot fall after old yard fires, cool flat overcast, brittle dust in sheltered lanes. Thin ash over brown aggregate; dense salvage forms, empty sky. Accent: faded hazard ochre `#B4A044` on sorting equipment.

| Asphalt | Dirt | Gravel | Sand/fines | Salt | Ice | Snow | Oil | Kerb paint |
|---|---|---|---|---|---|---|---|---|
| #39302A | #65513D | #756047 | #8C704B | #ACA080 | #8C8879 | #B8AE91 | #171513 | #A69A78 |

Ground: recolour existing worn asphalt, dirt and gravel; heavy asphalt near compactors. No new ash tile unless these fail visual/repetition gates. Salt/ice/snow colours are continuity values for inherited material slots, not permission to add those hazards. Reuse exact oil. Small seeded soot marks carry variation.

| Prop | Reason it belongs | W × H | Ht | Effect | Source |
|---|---|---:|---:|---|---|
| scrap pile | kept salvage vocabulary | 3.8 × 2.8 | 1.5 | solid | kept exact export |
| oil drums | garage waste collection | 1.8 × 1.5 | 1.0 | solid | kept exact export |
| rust pylon | broken yard power grid | 2.8 × 2.2 | 5.0 | solid | kept exact export |
| axle cradle | two salvaged axles in a low sorting jig | 2.8 × 1.8 | 0.6 | solid | new |
| baled sheet steel | crushed corrugated metal bundle | 2.2 × 1.8 | 1.0 | solid | new |
| magnet yoke | detached salvage magnet and lifting eyes | 2.6 × 2.2 | 0.5 | solid | new |
| cable reel | exposed rust spool with dull cable | 2.2 × 2.2 | 1.2 | solid | new |
| sorting rack | bent open rack for reusable panels | 3.2 × 1.5 | 1.6 | solid | new |
| filter sacks | torn soot-catcher sacks in a shallow pile | 2.8 × 2.0 | 0.3 | drag | new |
| scale plate | worn flush vehicle-weighing deck fragment | 3.4 × 2.4 | 0.1 | none | new |
| culvert mouth cap | collapsed circular drainage grate | 2.4 × 2.1 | 0.2 | none | new |

Backdrop: roofless sorting sheds, cropped rail sidings and distant hanging conveyor silhouettes; quiet central apron. Horizon: uneven stacks of dismantled sheet and the skeletal grid, no generic desert mountains. Atmosphere: ash sheet, 12 visible flakes maximum, 3 spawns/s, 4 s life, each ≤12 px at 1080p. Grade [0.98,0.95,0.90], vignette alpha ≤0.06, optional fog alpha ≤0.04. Ambience hooks only: `region.scrap.wind-wire`, `region.scrap.sheet-creak`, distant sorting clank; sparse events, duck beneath engines and warnings. No audio generation.

## 2. Cinder Row — division `foundry`, boss/ally Ox

The league's working foundry belt melts the salvage into its own fleet. Ox holds the crew account and duplicate receipts: foundry 7's victory exposes stolen payments and stops the diversion. Infrastructure reads as a chain of material handling, not random factory rubble.

Climate/flavour: dry furnace dust, suspended grit and intermittent ember specks. Heat is conveyed by separate sparse particles and rust values, never a baked glow on neutral props. Accent: rust-orange `#B4512D` in refractory residue.

| Asphalt | Dirt | Gravel | Sand/fines | Salt | Ice | Snow | Oil | Kerb paint |
|---|---|---|---|---|---|---|---|---|
| #302925 | #624536 | #76523C | #93643E | #B9A57C | #8C8270 | #B8AC8C | #171513 | #AB7D45 |

Ground: recolour heavy asphalt and dirt; **new cold clinker aggregate** replaces the gravel slot because vitrified porous fragments must differ structurally from ordinary stones. No lava field or glowing roadway. Concrete and metal retain their existing patterns with restrained tint.

| Prop | Reason it belongs | W × H | Ht | Effect | Source |
|---|---|---:|---:|---|---|
| oil drums | kept maintenance stock | 1.8 × 1.5 | 1.0 | solid | kept exact export |
| rust pylon | kept power distribution | 2.8 × 2.2 | 5.0 | solid | kept exact export |
| casting ladle | cold empty crucible with heavy trunnions | 2.8 × 2.5 | 1.6 | solid | new |
| ingot mould | paired hollow casting channels | 3.0 × 1.8 | 0.5 | solid | new |
| refractory brick skid | irregular pale heat-damaged blocks | 2.4 × 1.8 | 0.8 | solid | new |
| cooling manifold | ring of capped coolant pipes | 2.8 × 2.2 | 0.7 | solid | new |
| roller cassette | detached steel rollers in a short frame | 3.4 × 1.7 | 0.6 | solid | new |
| quench basket | open perforated metal basket, empty | 2.4 × 2.0 | 1.2 | solid | new |
| furnace door | detached round insulated hatch | 2.6 × 2.2 | 0.3 | solid | new |
| cinder spill tray | shallow tray overflowing with cold fines | 3.0 × 2.2 | 0.2 | drag | new |

Backdrop: connected cast halls, bunker mouths and hoist frames; centre kept broad and dark. Horizon: broken inclined lifts and squat exhaust housings rather than the rejected smelter-stack sprite. Atmosphere: six-frame ember sheet, maximum 10 sprites, 4/s, 2.5 s life, ≤10 px; no bloom pass or heat-refraction render target. Grade [1.02,0.96,0.90], vignette ≤0.07, fog alpha ≤0.03. Ambience tags: `region.foundry.furnace-breath`, `region.foundry.cooling-ticks`, distant press cycles; no music or speech substitute.

## 3. Salt Cut — division `salt`, boss/ally Vex

A drained mineral basin whose white flats run into ochre extraction cuts. Marrow owns the haul contracts; Vex knows the shipping routes and becomes an ally. Salt 3's crate switch, salt 5's missing lap and Relay at dusk fit a place where loads and records can disappear. Quarry and salt are two faces of the same act.

Climate/flavour: desiccating wind, bleaching dust, hard mineral crust and sheltered ochre gullies. Glare is a bright material value with controlled contrast, not an overexposure filter. Accent: ochre `#A37738` on mineral-handling hardware.

| Asphalt | Dirt | Gravel | Sand/fines | Salt | Ice | Snow | Oil | Kerb paint |
|---|---|---|---|---|---|---|---|---|
| #655C4B | #987546 | #AA8F60 | #BEA271 | #CFC29C | #A79F88 | #CFC6AA | #2A2520 | #DDD0A6 |

Ground: **new fine salt-crust field** replaces the dirt slot on flats; recolour gravel to quarry spoil and worn asphalt to bleached mineral-dusted road. Quarry routes use ochre dirt derivative in the same replaceable slot. Salt's irregular fine crystalline structure cannot be supplied by recolouring grass or sand. No new geometry, mirage shader or physics material.

| Prop | Reason it belongs | W × H | Ht | Effect | Source |
|---|---|---:|---:|---|---|---|
| rust pylon | kept abandoned basin power link | 2.8 × 2.2 | 5.0 | solid | kept exact export |
| oil drums | kept haulage service stock | 1.8 × 1.5 | 1.0 | solid | kept exact export |
| brine pump skid | seized low pump, pipe loop and filter pot | 3.0 × 2.1 | 0.9 | solid | new |
| evaporation rake | folded scraper teeth on a short frame | 3.2 × 1.8 | 0.5 | solid | new |
| core sample rack | empty stone-drilling sample trays | 2.8 × 1.5 | 0.5 | solid | new |
| drill collar | heavy segmented drilling ring lying flat | 2.3 × 2.3 | 0.4 | solid | new |
| salt sacks | split mineral sacks spilling coarse grains | 2.8 × 2.0 | 0.4 | drag | new |
| conveyor hopper | detached shallow receiving hopper | 3.2 × 2.5 | 1.0 | solid | new |
| survey cairn ring | low angular survey-stone cluster | 2.0 × 1.8 | 0.6 | solid | new |
| mineral screen | flat ripped sieve panel and trapped pebbles | 2.8 × 1.8 | 0.1 | none | new |

Backdrop: white basin occupying quiet centre, stepped extraction terraces confined to edges, distant tiny haul machinery. Horizon: low stratified cut ridge and interrupted conveyor line. Atmosphere: salt-glint sheet (8 maximum, 4/s, 2 s, ≤6 px), dust-puff sheet (4 maximum, 1/s, 4 s, ≤64 px); combined cap 12, projected alpha coverage ≤4%. No generic glitter over cars. Grade [1.02,1.00,0.94], vignette ≤0.03, fog ≤0.04. Ambience: `region.salt.dry-gust`, `region.salt.sieve-rattle`, `region.salt.distant-hauler`.

## 4. Thin Air — division `switchback`, boss/ally Mica

The only service road above the basin. Mica controls the passage; the books and a voice on the line reveal the sibling's survival while the coalition refuses a private deal. The road is held together by anchors, grit stores and patched utilities. Mica joins after the act's win.

Climate/flavour: exposed sleet, dirty snow pockets and grey-bone ice between scoured rock. The cold comes from desaturation and granular frost, with earth still visible. Accent: bleached bone `#DDD0A6` on battered snow-service gear. No neon blue ice or evergreen wilderness.

| Asphalt | Dirt | Gravel | Sand/fines | Salt | Ice | Snow | Oil | Kerb paint |
|---|---|---|---|---|---|---|---|---|
| #514D43 | #716957 | #8E8570 | #A3987C | #BDB294 | #A9A58F | #D4CCAE | #25231F | #C3B99C |

Ground: recolour existing accepted fine-frost ice, gravel, dirt and worn asphalt. Frost texture already carries fine crystallisation; generation is unnecessary if seam/repetition and actual 2×2 inspection pass. Snow is a bone-tinted dirt/frost variant limited to existing off-road presentation; no new slippery zones.

| Prop | Reason it belongs | W × H | Ht | Effect | Source |
|---|---|---:|---:|---|---|---|
| rust pylon | kept exposed mountain utility | 2.8 × 2.2 | 5.0 | solid | kept exact export |
| oil drums | kept road crew supplies | 1.8 × 1.5 | 1.0 | solid | kept exact export |
| avalanche anchor | paired steel pins in a rock-bound foot | 2.4 × 1.8 | 0.5 | solid | new |
| snow fence bundle | collapsed slatted windbreak tied flat | 3.4 × 1.7 | 0.4 | solid | new |
| grit bin | open segmented service hopper of dull grit | 2.0 × 1.8 | 1.1 | solid | new |
| cable saddle | torn cableway guide wheel and bracket | 2.4 × 2.0 | 0.6 | solid | new |
| drain cage | ice-scoured open drain screen | 2.4 × 1.6 | 0.1 | none | new |
| scree gabion | bent wire basket full of small angular stone | 3.0 × 1.8 | 0.8 | solid | new |
| ice grit berm | low irregular dirty granular snow remnant | 3.2 × 2.0 | 0.3 | drag | new |
| rescue sledge | abandoned empty short service sled | 2.6 × 1.3 | 0.4 | solid | new |

Backdrop: jagged rock crowns and tiny anchored service structures with an open middle pass. Horizon: layered bare ridge silhouettes and sparse snow cuts. Atmosphere: sleet (14 maximum, 7/s, 2 s, ≤14 px), snow (6 maximum, 2/s, 3 s, ≤10 px); combined cap 20; motion follows a presentation wind vector, never pushes a car. Grade [0.96,0.97,0.94], vignette ≤0.05, fog ≤0.06. Ambience: `region.pass.crosswind`, `region.pass.cable-hum`, `region.pass.grit-ticks`.

## 5. The Crown — division `crown`, boss Marrow, coalition allied

The league's decayed speedway and maintenance compound. Grandstands, floodlight frames and blank display machinery celebrate a system whose accounts are now public. The final seized-car beat and the Mechanic's supplied rig belong here. Rook, Ox, Vex and Mica are allies; Marrow is defeated, never recruited.

Climate/flavour: stagnant basin nightfall suggested by dark paint values, thin ground mist and bone fixtures, a hollow spectacle. No spotlights baked into overhead objects. Accent: dried red `#6C2427` on ceremonial equipment and worn paint, subordinate to readable cars.

| Asphalt | Dirt | Gravel | Sand/fines | Salt | Ice | Snow | Oil | Kerb paint |
|---|---|---|---|---|---|---|---|---|
| #302B27 | #594936 | #75654C | #92774F | #B6A884 | #938B78 | #C2B89A | #171513 | #6C2427 |

Ground: recolour worn asphalt, compact dirt and gravel; retain existing concrete/oil; muted red/bone kerb pattern only where existing kerbs exist. Rubber and seeded wear provide age. No new asphalt generation merely to darken it.

| Prop | Reason it belongs | W × H | Ht | Effect | Source |
|---|---|---:|---:|---|---|---|
| league gantry | kept start/finish authority | 6.0 × 1.8 | 4.0 | none | kept exact export |
| oil drums | kept neglected pit maintenance | 1.8 × 1.5 | 1.0 | solid | kept exact export |
| timing cabinet | battered open relay timing enclosure | 2.0 × 1.5 | 1.2 | solid | new |
| floodlight bank | detached empty-lens lamp cluster laid flat | 3.2 × 1.8 | 0.6 | solid | new |
| seat bank | detached row of three broken stadium seats | 3.2 × 1.5 | 0.9 | solid | new |
| pit jack | collapsed low trolley lifting jack | 2.4 × 1.4 | 0.4 | solid | new |
| flag base cluster | bare snapped poles in heavy footplates | 2.4 × 1.8 | 1.0 | solid | new |
| cable protector | worn low race-control cable bridge | 3.0 × 1.3 | 0.1 | none | new |
| podium plinth | chipped shallow ceremonial platform | 3.2 × 2.4 | 0.4 | solid | new |
| ticket turnstile | fallen short gate mechanism, blank plates | 2.4 × 1.8 | 0.7 | solid | new |

Backdrop: broken seating tiers and shuttered pits around a wide empty apron. Horizon: uneven floodlight silhouettes, torn unmarked pennants, blank scoreboards with no generated text. Atmosphere: low fog-bank six-frame sheet, 3 visible banks maximum, 0.5/s, 6 s life, ≤128 px, alpha ≤0.10; total projected alpha coverage ≤4%. Grade [0.96,0.93,0.90], vignette ≤0.08. Lighting cues remain optional sprite values; no extra full-screen lighting pass. Ambience: `region.crown.empty-stands`, `region.crown.fixture-rattle`, `region.crown.vent-drone`; no crowd faces, new dialogue or music.

## G1 generation and residency envelope

Planned first attempts: 40 new props, 10 panels (one backdrop and one horizon per region), 7 six-frame atmosphere sheets, 2 structural ground fields = **59 images**. Ground recolours and kept-prop reuse spend zero. The session ceiling is **130 new image reservations**, including failed/unknown calls, and global cap **850** (ledger starts **566**). Default three-attempt ceiling per logical asset across revisions; no cap overrides. Sequential paid scheduling stops on the first quota error; never clear the latch or retry a transport error. One source proof per region/family before siblings; actual exported-pixel gates, both local graders and direct inspection precede technical proof release. Neither release nor atlas staging is owner approval.

Each review region has its palette, plot link, source image, transparent export/native read, 2×2 ground repeats, actual weather frames, gate/grader notes, and blank Keep/Maybe/Reject controls plus note and Copy Markdown export using the audio report format. Failed/capped items remain explicit gaps with procedural fallback; never silently insert a rejected image. No car or approved-source identity is edited.

Packing is an offline candidate plan, not runtime integration. Five regional pages are stored on disk; **only one** may become resident. One 1024² RGBA region page (4 MiB) holds that region's props and particle frames; existing kept props remain in their existing atlas with aliases. Ten 128² props plus twelve 64² particle cells fit comfortably. Horizon is 1024×512 (2 MiB), backdrop 512² (1 MiB), both preserving composition/aspect. Current backdrop allocation is 4 MiB, so their combined replacement is 3 MiB. Ground exports are 256² (0.25 MiB) and replace existing material slots one-for-one; never load every region's variants together. Car pages/reserve remain 8 MiB; no mipmaps.

Conservative full-kit plan: baseline **31.25 MiB** − unused 4 MiB track-edge autotile page + active 4 MiB regional page − 4 MiB old backdrop + 3 MiB regional panels = **30.25 MiB**, including car reserve. This requires G2 loader exclusion of that unused autotile page and unloading old region assets before loading replacements. If it cannot enforce those conditions, keep procedural regional fallback and do not allocate the candidate page. Other unused pages are not used as imaginary savings. Actual page/hash/byte accounting is a G1 validator requirement. The existing scenery render target and process memory are outside the declared art budget and stay outside this estimate, explicitly as in the historical kit notes.

Weather proposal: reuse the existing 96-slot presentation pool, reserve ≥72 for combat and cap regional weather at 24 (per-region tighter caps above). At most two weather sprite families, ≤4% projected alpha coverage, ≤2 additional texture runs; scenery props baked once with existing scenery, no per-frame geometry rebuilding. Fog/vignette use existing presentation capacity or stay disabled; no additional FBO, shader refraction or full-screen pass is authorised. These are caps for G2, not measured frame-time claims. G1 changes no runtime pixels, so no runtime delta is introduced; Stick timing remains unmeasured and the Stick is untouched.

## Wave outcome and boundary

G0 defines five division-bound regions, 51 prop memberships (40 new, 11 kept reuse), material targets, infrastructure-specific silhouettes, budgets and later ambience hooks. G1 will record actual spend, missing candidates and packing evidence in its own note. `region.csv`, renderer/loader changes, campaign/course assignment, device measurements and same-course regional screenshots belong to G2/G3 after the track restart, not this run.

Pre-commit validation: `:core:test :link:test :game:test :app:assembleDebug` pass; 52 art tests pass; `validate_bundle` passes for legacy `phase2-v1` and active `phase2-states` (31.25 MiB, dated owner application intact). Evidence: `deathride/art/reports/g0-*`. G0 generation spend: zero.
