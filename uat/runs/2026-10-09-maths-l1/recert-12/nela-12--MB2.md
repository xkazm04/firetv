# nela-12 × MB2 · (recert-12)

- Character: nela-12
- Journey: MB2
- Cert level: L1 re-walk, code only, no model
- Head b6581a9e
- Recertifies: 2026-10-09-maths-l1/recert-11 at ed23c4ac
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 rows open.

## Prior rows

| Finding | Status | Evidence (current code) |
| --- | --- | --- |
| L1-nela-12-MB2-1 Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročník level needs a teacher's read (minor) | not-seen (fixed) | Fixed in b6581a9e: desk/src/lib/rules/school.ts PAIRS tier 2 keeps bottoms 2..10 with a common bottom of at most 24 (TIER2_MAX_BOTTOM, TIER2_MAX_COMMON), so no elevenths and nothing up to 132; tier 1 and gen()'s fallback (3/4 + 1/6) are unchanged. tools/school-rules-test.cjs GENERATOR now asserts for seeds 1..200 that no tier-2 draw has a bottom above 10 or a common bottom above 24 (129 distinct tier-2 specs remain, the suite needs 100). Frozen values moved by the bound: tools/paper-aim-test.cjs PLAIN_FP and SLIPS_FP (hashes of the tier-1/2 draw grids), regenerated; school-stretch, maths-aim, maths-like, school-practice, school-toprung and school-rules froze nothing the bound moves and are green unchanged. No teacher read is needed for the bound itself. |
| L1-nela-12-MB2-2 Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" (minor) | recurs → L1-nela-12-MB2-2 | Reconciled at b6581a9e: not landed, and not touched (the simplest-form marking rule waits on the owner's choice between check() marking an unsimplified fraction unsure and form "simplest" on the generated specs; both flip tests frozen on purpose, see recert-11). school.ts check() and worked.ts:15 are unchanged since ed23c4ac; the tier-2 PAIRS bound of b6581a9e (MB2-1) does not touch check(). |

## New findings

None.
