# ART STATES bundle

Preserves the phase2-hud world/UI kit and adds 70 car regions: four states and three liveries for each of ten exact owner-approved references. Derived frames are technical selections, not owner approvals. Needle intact reuses its exact reference after three rejected no-op edits.

Two 1024-square car pages consume the existing 8 MiB reserve; declared full-kit residency remains 31.25 MiB with one backdrop. Runtime loads world/UI/cars/tiles (18.75 MiB), plus at most one 4 MiB backdrop; fonts and scenery are accounted separately by TextureBudget. Cropping removes only common transparent margins, preserving aspect, four-pixel gutters, shared pivots and reference body bounds. cars-provenance.json records every frame.

Healthy cars choose base/bone/red/ochre by stable seat index. Damage takes priority and uses the original-reference paint; no damage-by-livery cross product is implied. Missing or invalid regions retain procedural fallback. See art/review/fusion/index.html for sources, rejected attempts and local grading limits.
