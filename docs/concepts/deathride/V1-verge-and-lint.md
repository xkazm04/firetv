# V1 Verge reach and linter mutants â€” design first, 2026-10-01

Reproduce the forge finding with every roster car on both sides of a straight, after wall containment. The existing centre-only surface query cannot reach a 1.5 m verge when the containment radius is 1.5â€“2.3 m. Do not move walls, widen tracks or shrink cars. Query the outer lateral contact footprint for edge surfaces while retaining centre-based authored shortcut/oil sampling. Apply the same footprint to AI look-ahead speed planning. This is a physical behavior correction and invalidates old simulation hashes; subsequent career evidence must use the corrected runtime.

The regression must first fail against the old behavior, then demonstrate reachable kerb and verge, added coasting drag relative to asphalt, unchanged centre-line surface, both wall sides and all ten physical sizes. Preserve deterministic replay and warmed zero-allocation gates.

Add isolated mutations for the six missing base geometry/pacing rules: corner radius, grid count, unknown spot, outside-road spot, invalid fraction, and straight fraction. Retain the existing width, checkpoint order, ribbon overlap and overlapping-grid mutants. Assert each mutation's named diagnostic, not merely a non-empty error list. If the inexpensive feature linter can be covered too, include its missing diagnostics without changing thresholds.

Required closure: full core/link/game/APK green, test evidence and explicit note that historic physical results remain historical; one status row, one session entry, one local commit. No art spend or push.

## Result

Confirmed: every tested roster car on both wall sides (20 cases) had only Asphalt or Kerb under the old centre query after containment. The regression failed on the old implementation. The final runtime reports Offtrack in all 20 near-wall cases and Kerb at the authored inner band; the centre remains Asphalt. Starting at 20 m/s, one neutral 1/60 s step ends at 19.71209 m/s on the verge versus 19.92680 on asphalt. This establishes a real drag consumer, not only a query result. Radius is the central collision circle's lateral footprint; this intentionally does not integrate fractional tire coverage or retune collision geometry.

All ten base linter rules now have named mutants; nine additional feature/vocabulary/recovery diagnostics also have explicit mutants. Full build green: 87 core, 3 link and 2 renderer tests, including seeded replay and zero warmed step allocations. Raw before/after rows and logs are in `deathride/evidence/phase2/v1/`. Historical C1?C4 outcome hashes remain historical, not evidence for this corrected physical runtime. No hardware fairness or owner feel claim; no Grok spend.
