# Death Ride: regions, a different wasteland per level (G0-G4)

Written 2026-10-04 from the owner's note:

> queue also goal to have each level of tracks slightly differently themed to differ environment, color of surface, props. We will have the premise each set of rounds until final boss will be in different area, it should generate variations of clima and flavor of wasteland

## What it means

Each **level** (the division of rounds that ends with a boss) takes place in its own **region** of the wasteland, with its own **climate and flavour**: different environment, different **surface colour**, different **props**, different atmosphere. The campaign map already has five divisions and a plot (`docs/concepts/DEATH-RIDE-CAMPAIGN-IMPL.md`, Q0 beats): the scrap yards, the foundry row, the salt flats and quarry, the mountain switchback road, the league speedway ("the Crown"). The five existing track themes (foundry, slagway, salt flats, quarry, mountain and the speedway) are the starting point, not the end: climate and flavour variations are the goal.
Each region has to feel like a place: not a palette swap of the same ground.

## Constraints and prior owner decisions that bind

- Art direction is the fusion (Rust and Ink for surfaces and vehicles, Soot Pulp for portraits and panels, Hot Ink for icons and effects), `deathride/art/OWNER-CHOICE.md` sections A to F, and the owner's rework 2 decisions (`DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md`): kept props are scrap pile, oil drums, rust pylon, league gantry; the rest of the rework 2 environment props were rejected; the owner earlier said props must reflect the environment of the game set, so new props are now justified **per region** (not generic).
- Textures and backdrops must obey the declared texture budget (31.25 MiB resident with the car reserve; justify any change) and the Stick: the Stick frame-time optimisation is deferred by owner decision N3 (keep the full feature package), but do not make it worse than the measured baseline without reporting the delta.
- Track layouts are being redone in parallel (branch `deathride/tracks`, plan `DEATH-RIDE-TRACKS-MASTER.md` R0 to R3, in worktree `C:\Users\kazda\kiro\firetv-deathride-tracks`): do not edit course geometry in the art stage; the regions attach to divisions and themes, so any new course library inherits them.
- The Grok guarded driver stays on (stop latch, proof before batch, bounded retries, gates and local grading). Cap was 700 with about 566 used; the host raises it to 850 for the region assets and logs it. No ElevenLabs spend (ambience audio per region is only listed as a later task).

## G0 Region bible (design note first, with sources)

`docs/concepts/deathride/G0-region-bible.md`: for each of the five regions (more only if the plot supports it): the **premise** (what happened here, who rules it, link to the plot beats, the boss and ally of that act), the **climate and flavour** (for example: ash-fall yards under a soot sky; a foundry belt with ember glow and heat haze; blinding salt flats with mirage shimmer and bleached bones; a quarry in dust gusts with ochre rock and cranes; a high mountain road with sleet, ice patches and thin air; the crown speedway as a decayed spectacle with floodlights and flags), the **surface palette** (asphalt wear and tint, dirt, gravel, sand, salt crust, ice and snow, oil, kerb paint: colour values per region, kept inside the fusion palette family with one accent per region), the **ground materials** that belong (which of the existing surfaces gain a region variant), the **prop kit** per region (eight to twelve props that belong there, original, with footprint and effect class for the obstacle system; reuse the four kept props where they belong), **backdrop and horizon**, **atmosphere** (weather and light: particle type and density, colour grade, vignette, fog) with a cost budget, and **ambience hooks** for a later audio pass. Research real references for wasteland and post-industrial landscapes (public photographic and cinematic descriptions of climate and terrain, not copying any film), and keep every design original.

## G1 Assets (art stage, now, in the main worktree)

Through the guarded driver in the owner-approved style: per region the missing **props** (up to about eight each, themed, isolated on key colour, gates for margin, orientation and face-free), **ground variants** where tinting alone cannot carry the region (tileable with the seam and repetition gates; prefer a recolour pipeline over regenerating when it passes), **horizon and backdrop** panels, and **atmosphere sprites** (ash flakes, embers, salt glints, dust puffs, sleet, snow, fog banks) as small animation or particle sheets. Budget: at most about 130 new images across all regions within the cap of 850; report spend. Do not approve anything yourself: produce an owner review page per region with Keep, Maybe or Reject and a note per item, with a Copy Markdown export in the format of `deathride/audio/report.js` and `report.css` (give it as a full file:/// URL), and pack accepted-to-be assets into the atlas plan with the procedural fallbacks intact.

## G2 Engine and data (after the track restart finishes; branch `deathride/tracks`)

`region.csv` as the single authority (id, name, division, palette values, ground tints and variants, grade, vignette, fog, particle sets with caps, prop-set bias, backdrop, ambience tag); renderer support for per-region ground tint and variants, atmosphere particles within pooled budgets, colour grade and backdrop; each division and its courses carry a region; the campaign loader and menus show the region name and a banner per division; save compatibility unchanged. Tests with content assertions (every course has a region, budgets respected, deterministic where the sim is involved: weather is presentation only and never affects physics), build green, and a measured frame-time delta on the Stick.

## G3 Owner review and Stick evidence

A page showing the same course in all five regions (screenshots or renders), each region's palette, props, atmosphere and plot link; Keep, Maybe or Reject with notes and a Copy Markdown export; Stick screenshots per region; tiers of truth (nothing felt until the owner says so).

## Rules

Original work only; one design note, status row, session-log entry and one commit per wave; never push; never ask a question; build green at every commit; any html page given as a full file:/// URL in the report.

| Id | Wave | Status |
|---|---|---|
| G0 | Region bible | complete design; required build, 52 art tests and both bundles pass; see deathride/G0-region-bible.md |
| G1 | Region assets, owner review page (art stage, main worktree) | partial; provider quota latched; 16 recolours + 11 kept-prop memberships reviewed locally, five owner pages, inactive atlas plan; all 59 generated assets remain gaps; see deathride/G1-region-assets.md |
| G2 | Engine and data: region.csv, renderer, assignment (after the track restart) | gated |
| G3 | Owner review and Stick evidence | gated |
| A0 | Agy second image provider | implemented; independent 120-image cap, Grok remains latched; live generate/edit smoke and fake CLI tests; see deathride/A0-agy-provider.md |
| A1 | Agy region completion and kept-prop variants | partial: empty-output stop at 9/120 total; seven region image records, one technical panel, 53 original region images and 11 variants still missing; see deathride/A1-agy-regions.md |
| A2 | Kept-design restoration and edit repair proof | pending owner comparisons; see deathride/AGY-SESSION.md |
