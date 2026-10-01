# Fusion surface cost report

Stick AFTKM, two runs per variant at 1080p: natural edges 16.69/17.89 ms p50/p95; matched control 16.70/18.11 ms. Full art allocation 31.25 MiB (+0.50 MiB ribbon); cached course vertices 28,800 bytes. Short isolated renderer measurements, not a full-game soak.

| Variant | p50 ms | p95 ms | CPU p50 ms | Draws | Submitted area | RGBA MiB | PSS KiB |
|---|---:|---:|---:|---:|---:|---:|---:|
| fusion-control | 16.703 | 18.106 | 2.228 | 9.313 | 1.408 | 30.750 | 79247.500 |
| fusion-natural | 16.693 | 17.891 | 2.163 | 9.313 | 1.491 | 31.250 | 80623.500 |

costs are arithmetic means of the two run percentiles; ranges retain repeat variation; raw 900-sample arrays remain linked. Startup completion includes texture uploads and geometry setup; the ribbon texture was baked offline.

glFinish instrumentation serializes work; completion is CPU/GPU wall time, not GPU timer. PSS sampled once per run before PNG encoding. All atlas/material pages resident but only representative scene regions drawn. No gameplay, collision hook, full-game FBO, or thermal soak.

Four 1024² atlases = 16 MiB; eleven 256² tiles = 2.75 MiB; one 1024² backdrop = 4 MiB; two allocated car pages = 8 MiB; 512×256 ribbon = 0.5 MiB. Total 31.25 MiB versus 30.75 MiB control. Five new obstacles and a shadow mask fit existing atlas pages. Cached course vertices add 28,800 CPU bytes. The game's separate 36 MiB scenery FBO is excluded and was not allocated by the lab.

Both variants use seeded marks and tall props. No continuous edge stroke, live macro layer, dust pass or per-frame band construction. Median cadence stays approximately 16.7 ms; tail frames remain above that nominal budget. This establishes isolated cost, not production integration acceptance.

[Interactive comparison](fusion-review.html), [raw evidence and repeat ranges](fusion-costs.json), [exact source/build hashes](fusion-build-evidence.json). No Grok calls for rendering. Both sessions verified unchanged integration installation and restored its activity.
