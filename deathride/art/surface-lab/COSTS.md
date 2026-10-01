# Surface laboratory cost report

See [interactive A/B review](review.html) and [all-mode board](review/all-modes.png).

Median of per-run statistics, except max_ms is worst observed across repeats; 240 warmup + 900 samples/run; glFinish each frame. Completion is CPU+GPU wall time, not a GPU timer. PSS one sample per run. Fill is submitted geometry proxy, not fragments. Negative small deltas can be noise.

Lab residency includes its own ground, dirt, car and 512px experimental detail page. It excludes production gameplay allocations. No additive sum is presented as a measured combined stack.

| Mode | RGBA MiB (delta) | Draws (delta) | Fill proxy | Stick p50 / p95 ms (delta) | PSS MiB | Repeats |
|---|---:|---:|---:|---|---:|---:|
| baseline | 1.750 (+0.000) | 14.00 (+0.00) | 1.35x | 16.70 / 17.99 (+0.00 / +0.00) | 44.7 | 2 |
| painted | 1.750 (+0.000) | 14.00 (+0.00) | 1.35x | 16.70 / 17.97 (-0.00 / -0.02) | 43.6 | 2 |
| macro | 1.812 (+0.062) | 14.00 (+0.00) | 1.35x | 16.68 / 17.89 (-0.02 / -0.08) | 44.2 | 2 |
| decals | 1.750 (+0.000) | 15.00 (+1.00) | 1.49x | 16.69 / 17.95 (-0.00 / -0.01) | 43.4 | 2 |
| ribbon | 5.750 (+4.000) | 13.00 (-4.00) | 1.05x | 16.70 / 17.91 (+0.02 / +0.16) | 47.7 | 2 |
| edges | 1.750 (+0.000) | 16.00 (+2.00) | 2.39x | 16.68 / 17.83 (-0.02 / -0.13) | 43.7 | 2 |
| grade-dust | 1.750 (+0.000) | 15.00 (+1.00) | 1.40x | 16.68 / 17.84 (-0.02 / -0.12) | 43.2 | 2 |
| depth | 1.750 (+0.000) | 15.00 (+1.00) | 1.45x | 16.71 / 17.96 (+0.01 / -0.01) | 43.2 | 2 |
| wear | 2.750 (+1.000) | 15.33 (+1.33) | 2.35x | 16.68 / 17.90 (-0.02 / -0.07) | 45.6 | 2 |
| poster-grain | 1.750 (+0.000) | 14.00 (+0.00) | 1.35x | 16.67 / 18.09 (-0.03 / +0.12) | 50.7 | 2 |
| contrast | 1.750 (+0.000) | 14.00 (+0.00) | 1.35x | 16.69 / 17.92 (-0.01 / -0.05) | 43.6 | 2 |
| combined | 2.812 (+1.062) | 20.33 (+6.33) | 3.70x | 25.14 / 31.15 (+8.44 / +13.18) | 45.7 | 2 |
| ribbon-control | 1.750 (+0.000) | 17.00 (+3.00) | 2.54x | 16.68 / 17.74 (-0.01 / -0.22) | 43.1 | 2 |
| lean-stack | 1.812 (+0.062) | 18.00 (+4.00) | 2.48x | 17.46 / 23.69 (+0.76 / +5.73) | 44.8 | 2 |
| efficient-stack | 1.812 (+0.000) | 18.00 (+0.00) | 1.48x | 17.79 / 23.75 (+0.12 / -0.04) | 48.8 | 2 |
| cached-stack | 1.812 (+0.000) | 18.00 (+0.00) | 1.48x | 16.86 / 22.67 (-0.77 / -1.51) | 46.0 | 2 |

Deltas use painted ground as the control, except painted vs V1 baseline and baked course vs its matched live control. Efficient-stack compares with the restrained control freshly measured on revision 2; cached-stack compares with dynamic narrow-band geometry on revision 3. Baseline is its own zero control. Per-run ranges and all raw samples are linked in costs.json.

## Submission and synchronised completion

| Mode | CPU p50 ms (delta) | Completion p50 / p95 ms | Startup bake ms |
|---|---:|---:|---:|
| baseline | 2.39 (+0.00) | 15.70 / 16.18 | 0.00 |
| painted | 2.42 (+0.02) | 15.70 / 16.14 | 0.00 |
| macro | 2.35 (-0.07) | 15.66 / 16.09 | 0.00 |
| decals | 2.70 (+0.28) | 15.68 / 16.20 | 0.00 |
| ribbon | 2.05 (-1.61) | 15.67 / 16.14 | 42.51 |
| edges | 3.45 (+1.03) | 15.69 / 16.13 | 0.00 |
| grade-dust | 3.04 (+0.63) | 15.66 / 16.09 | 0.00 |
| depth | 2.76 (+0.34) | 15.70 / 16.16 | 0.00 |
| wear | 3.20 (+0.78) | 15.67 / 16.13 | 0.00 |
| poster-grain | 2.43 (+0.01) | 15.61 / 16.15 | 0.00 |
| contrast | 2.36 (-0.05) | 15.66 / 16.10 | 0.00 |
| combined | 6.84 (+4.42) | 23.46 / 29.16 | 0.00 |
| ribbon-control | 3.66 (+1.25) | 15.67 / 16.08 | 0.00 |
| lean-stack | 4.63 (+2.22) | 15.98 / 21.99 | 0.00 |
| efficient-stack | 5.55 (+0.57) | 16.27 / 22.21 | 0.00 |
| cached-stack | 3.76 (-1.59) | 15.79 / 20.94 | 0.00 |

The display cadence can mask small costs. Completion includes driver synchronisation and previous queued work; it does not isolate shader execution or establish spare GPU capacity. PSS changes include allocator variation. A tiny negative delta is not a speed-up claim. No GPU fragment counter or unpaced GPU timer was collected.

12 completed captures from interrupted/concurrently changed device sessions are retained as diagnostics and excluded from these costs. See excluded_device_runs in costs.json. An integration deployment changed its own package while the first lab pass was active; the lab aborted on lost foreground. The runner only installs the verified artlab package.

## Decisions and cheaper alternatives

- **V1 repeated tile: Comparison only.** Keep as control; source is the delivered V1 tile.
- **Painted style proof: Source needs revision.** Large diagonal crack motifs still repeat. A painted label alone does not remove wallpaper.
- **Low-frequency multiply: Candidate.** Changes broad values with 64 KiB; does not fix seams. Cheaper: vertex tint patches.
- **Seeded decals: Reduce density.** 64 marks add clutter. Candidate stack uses 32 smaller, fainter marks. Cheaper: reuse fewer regions.
- **Baked course: Cut at current budget.** 4 MiB target exceeds remaining production headroom; 1024 bake softens 1080p edges. Cheaper: live ribbon with shared atlas.
- **Ink edges and shoulders: Candidate with art revision.** Clear boundaries lift the course, but uniform bands feel too geometric. Cheaper: two vertex-colour edge strips.
- **Warm grade and dust: Candidate with restraint.** One ground shader and 28 alpha quads; no full-screen blur. Cheaper: warm vertex tint, no particles.
- **Tall props and shadows: Hold for chosen kit.** Depth reads, but repeated V1 rocks clash with rough cars. Cheaper: sparse existing props and shared shadow mask.
- **Persistent wear buffer: Cut from default.** Dark repeated stamps distract and add a full-screen layer plus 1 MiB. Cheaper: capped live skid sprites.
- **Poster and grain: Reject appearance.** Quantisation/grain amplifies coarse pattern and shimmer. Cheaper: paint grain into approved tiles.
- **Ground value separation: Candidate.** Darker desaturated floor separates car accents. Cheaper: a tuned ground tint.
- **All layers combined: Reject stack.** Too much grain, repeated props and black wear. Combined cost is measured, not a sum of single-feature deltas.
- **Live edges and decals: Owner option, not selected.** Painted ground + seeded decals + edges; near 16.7 ms cadence. Same content as the bake, with no extra target. Source motifs and decal density still need art review.
- **Restrained stack: Cut: frame budget.** Macro + 32 decals + filled edges + 28 dust sprites + value separation still misses the nominal 16.7 ms target. Retained as the optimisation control.
- **Narrow-band stack: Cut: CPU/frame budget.** Narrow bands, 16 decals and 8 dust sprites reduce submitted coverage, but rebuilding more geometry raises CPU cost. Paired against restrained on revision 2.
- **Cached geometry (held): Hold: frame budget.** Identical pixels and lower CPU cost with a 0.192 MiB vertex cache, but p50 remains above nominal 16.7 ms. Paired against dynamic geometry on revision 3; no combined default accepted.

## Budget and source gates

The measured live edges/decals option (ribbon-control) would conservatively total 31.75 MiB with a new 1 MiB detail page, leaving 0.25 MiB. It is an owner option, not an accepted production stack.

The cached-geometry design, currently held on frame cost, would add at most a 1 MiB dedicated detail atlas plus 0.0625 MiB macro to the existing declared 30.75 MiB: **31.8125 MiB, 0.1875 MiB headroom**. Repacking can reduce that, but no saving is assumed. A further 1 MiB wear target or 4 MiB bake exceeds 32 MiB and is cut unless an explicit replacement is validated. Main bundle and selections remain unchanged.

Rust ground is an unapproved proof. Bleached Poster has a seam failure. Scrap Collage is a rejected negative control: its bright tile border and isolated graphic motifs repeat visibly, even where numerical seam tests pass. Surface tricks do not upgrade those source gates. Ground choice and all production artwork wait for OWNER-CHOICE.md.

The only atmospheric experiment is a warm ground grade plus bounded dust; no vignette, heat-shimmer or full-screen smoke pass is claimed. The ribbon test bakes the entire course into a 1024-square target, not a production streaming strip. Persistent wear is stamped, not driven by production tyre physics.
