# A0 — integrate calibrated drift, 2026-10-02

Merge `deathride/drift` into `deathride/abilities` before designing abilities. Preserve the axle solver and D3 calibration, integration's radius-aware verge contact, authored career lap targets, texture budgets and atlas fallbacks. Existing drift, verge, endurance, replay, allocation, link and renderer tests are the merge acceptance gates; the debug APK must build.

Seven explicit conflict decisions:

- OWNER-CHECKS: retain both G2 and D3 exercises and their historical evidence limits.
- Controller: retain drift-quality haptics and the server's career lap denominator.
- World: retain drift rules and post-contact signals alongside variable lap targets/timeouts and both sets of hash fields.
- AtlasEffects: retain D3 quality-scaled smoke/skids and counters, with integration's 64-slot pool and CombatRules smoke threshold. The smaller cosmetic capacity is intentional; simulation is unaffected.
- RaceGame: retain texture-budget accounting, career lap counts and drift telemetry together.
- TrackScene: retain quality-scaled procedural skid width behind integration's fallback guard, avoiding duplicate atlas/procedural skids.
- RaceServer: retain drift feedback/telemetry and raceLaps in health/HUD/stats.

The application is isolated as `dev.deathride.abilities`, label Death Ride Abilities, listener 8767. Android's source namespace remains unchanged because it is not the install identity. Desktop defaults to the same listener. No device install in this wave. D3's changed roster grip response is preserved deliberately; old balance evidence is historical and A3 must remeasure the merged rules. No claim of owner-felt handling.

Validation: `:core:test :link:test :game:test :app:assembleDebug` passed in 5m51s: 105 core, 3 link, 3 renderer tests; zero failures/errors/skips. XML counts, rather than the plan's historical 106-core estimate, are authoritative. Includes drift calibration/force witnesses, all-class verge tests, endurance targets, deterministic replays and zero-allocation gates. Evidence: `deathride/evidence/abilities/a0/`. APK SHA256: `178dd38b336e8dcd9225c5fdbf49c44421ba620d1083787fafaadbc54b440bd4`.
