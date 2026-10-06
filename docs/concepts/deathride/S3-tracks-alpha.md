# S3 Tracks and regions, audio-less alpha (2026-10-06)

## Wired
- Region barrier variety (presentation only): `RegionLook.barrier` picks one of the three straight modules already in the atlas per region id (`region.csv`): scrap and switchback metal, foundry and crown hazard, salt concrete. A missing module or region presentation off falls back to the old course-material choice. Contact events and collision still use `Course.boundaryMaterial`.
- Career card shows the course: `CoursePreview` draws the sampled centreline (plus alternate passages and a start marker), the course name, region name and laps, or DEATH DUEL. No new art, no geometry change; RaceGame edit is two lines in the career block.

## Declined, old path kept
- `autotile-barrier` and `autotile-track-edge` (assets/phase2-hud): these are 1024x1024 47-tile bitmask sheets for 4-neighbour grids (barrier = thin wall lines on 120 px cells, track-edge = filled-cell mask). Courses here are splines with arc-length-sampled quads, so there is no grid neighbourhood to resolve; placing a tile per sample would draw the same straight line the barrier sprites already draw and the filled mask would paint over region ground tints. Each page is 4 MiB resident (8 MiB for both, inside the 52 MiB total, art 10.75 to 18.75 MiB of 32) for no visible gain, and I2 already records that grid autotile pages are not loaded for spline courses. Not wired.
- `course-ribbon.png` (512x256 asphalt with ochre edges): it would replace the region-tinted material tiles with one fixed brown-edged road, erasing per-region surface identity, and needs a new arc-length UV mapping in the live road quads. Not wired. Its edge look is already covered by the region kerb colours.

## Evidence
Desktop GL `--region-check` (45 captures, residency unchanged at 19,660,800 bytes, zero region-switch growth) and `--region-ui-check` pass. Screenshots (scratchpad, not committed): foundry hazard barriers, salt concrete barriers, career cards for foundry and crown.
