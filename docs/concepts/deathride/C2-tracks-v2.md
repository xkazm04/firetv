# C2 Tracks v2 — design first, 2026-10-01

Retain the five Phase 1 course IDs and their geometry. Add twenty stored spline plans across industrial, quarry, desert, wetland and alpine themes. The checked-in nodes and feature intervals are authoritative; the authoring script is reproducible tooling, never a runtime generator. Each plan changes geometry, surface distribution and racing choices, not just a palette label.

Theme data owns surface vocabulary and palette/prop/hazard keys for the art handoff. This content wave creates no artwork and changes no drawing code. Practice remains open to every car. Competitive pools declare eligible tier ranges, expose eligibility in core/catalog data and supply a deterministic grid builder for career and headless callers. C4 will consume them for its field schedule.

Acceleration zones are authored clear straight sections where normal throttle can exploit top speed, not magical speed pads. Shortcuts are inside-corner lanes within the road ribbon: shorter distance costs gravel grip and drag. Their intervals affect `surfaceAt` for humans and the AI's lane selection for sufficiently grippy classes. Each has a pre-entry landmark key and sightline distance as an integration contract. Existing oil spots remain physical hazards. Features must leave a recovery gap and never cover the grid or the entire road.

Extend the geometry linter with theme references, nonempty competitive pools, interval/width bounds, useful acceleration length/curvature, inside-corner shortcut geometry, warning distance and hazard/recovery spacing. These are geometric proxies; human landmark recognition and sightline readability remain not measured. Existing projection, lap-gate, contact and zero-allocation guarantees remain gates.

Validation: at least 24 unique stored courses and four themes, valid complete references, deliberately invalid fixture rejection, physical shortcut surface/path tests, six-car seeded finishes/replay on every course within 180 seconds, pooled grids, and allocation tests on new features. Preserve W7's original five-course outcome library as historical regression coverage rather than silently multiplying its calibration sample. Run the full build, scan the LAN /24, and select every course on the Stick before committing. New palette keys remain a P4/I1 handoff; no new art spend.

## Results

25 distinct stored plans / five themes; original five geometry files unchanged. The linter rejected initial long-straight spline transitions and three short acceleration intervals; corrected node spacing and the authored bend approaches instead of relaxing the gates. Geometry, feature, reference and pacing lints pass. The offline compiler reproduces all checked-in plans byte for byte.

Headless: 200 competitive six-car races with 1,200 finishers, 66.47?120.87 seconds; 100 unrestricted six-car races also finish within 180 seconds. Paired replay, sequential lap gates, shortcut path savings and grip cost, AI lane consumption, invalid-content rejection and warmed zero-allocation checks pass. Full build green: 62 core tests / 3 link tests / debug APK. Evidence: `deathride/evidence/phase2/c2-accepted/`. W7 remains a five-course historical outcome calibration; C4 supplies the expanded career report.

The /24 scan found AFTKM at 10.0.0.139. The first device sweep exceeded its ten-second readiness ceiling at High Pass, which subsequently became ready. Preserve that failure. The repeat recorded all 25 course preparations (maximum 1.70 seconds including LAN/poll overhead) and a Quill race result at 68.10 seconds / 296 shots. This is availability and automated driving evidence, not human perception or a loading-time guarantee. Theme/landmark artwork and owner feel remain not measured. Grok calls/spend: zero.
