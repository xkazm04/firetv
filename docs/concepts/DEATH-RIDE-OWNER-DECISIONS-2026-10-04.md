# Death Ride: owner decisions of 2026-10-04 (regions approved, track library triage)

## Owner words

> Regions all approved. Tracks look on first sight very solid. Tracks triage:

followed by the exported Markdown of the R3 candidate track library review (`deathride/tracks/atlas/candidates.html`, 102 candidates plus the accepted Runoff). The owner gave no per-item notes except the accepted original, which carries "Existing owner acceptance; course unchanged".

## 1. Regions: all approved

The five region review pages (`deathride/art/review/regions/scrap.html`, `foundry.html`, `salt.html`, `switchback.html`, `crown.html`: Ash Yards, Cinder Row, Salt Cut, Thin Air, The Crown) are approved as delivered by the region art run (16 graded ground recolours, 11 kept-prop memberships, the inactive atlas plan). Host reading: every item on those pages is a Keep; the generated assets that the Grok stop left missing (59 planned) are still wanted and are being produced through the agy provider (run `agy1`); the region engine run (G2 and G3) wires them. Region names are the owner-approved names.

## 2. Track library triage (verbatim picks)

**Keep (37):**
- scrap: scrap-1-c, scrap-2-a, scrap-2-c, scrap-3-c, scrap-4-b, scrap-4-c, scrap-5-a, scrap-5-c, scrap-6-b
- foundry: foundry-1-c, foundry-2-b, foundry-3-b, foundry-4-c, foundry-5-a, foundry-6-b, foundry-7-b
- salt: salt-1-b, salt-2-c, salt-3-a, salt-4-c, salt-5-a, salt-6-a, salt-7-b
- switchback: switchback-1-a, switchback-2-c, switchback-3-c, switchback-4-runoff (the accepted original, unchanged), switchback-5-a, switchback-6-c, switchback-7-c
- crown: crown-1-a, crown-2-a, crown-3-a, crown-4-a, crown-5-c, crown-6-a, crown-7-a (the finale arena)

**Not reviewed:** foundry-7-a, foundry-7-c, switchback-2-b (the slot already has a Keep: foundry-7-b, switchback-2-c).

**Reject:** every other candidate (62), including all three scrap-7 candidates (scrap-7-a, scrap-7-b, scrap-7-c: the tier-1 boss of the first division has NO accepted layout).

Host reading of the pattern (to guide any new layouts): Keep families are angled-fan, diagonal-rally, three-prongs (some), staggered-bays, nested-switchbacks, double-hook; the owner mostly rejected offset-ladder, two-peninsulas, fishhook, long-cutback, ribbon-stair and crooked-key; picks vary by slot, so the owner judged individual layouts, not families alone.

## 3. What follows from the picks (instructions for the apply run)

- **One layout per event slot.** 31 of 35 slots have exactly one Keep and use it. **scrap-7 has none**: design three NEW candidate layouts for it with the composer (a tier-1 boss race, 3 laps, within the pacing targets, informed by the Keep pattern above), give the owner a choice. **scrap-2 (a and c), scrap-4 (b and c) and scrap-5 (a and c) have two Keeps**: assign the better one by the measured quality and pacing evidence to the event and keep the other as an alternate (a practice or variety course, or a second event if the campaign has a free slot); record the rule and the choice, reversible by the owner.
- The accepted Runoff stays unchanged (`switchback-4-runoff`).
- **The finale arena crown-7-a is Keep but has a technical flag: its actual two-car duel is unresolved in 3 of 12 trials.** Technical failures remain unchanged by owner preference: fix them (arena supplies, hunter behaviour, start positions, timeout handling) without redesigning what the owner approved; re-prove with the duel simulation.
- Rejected candidates are archived (not deleted) and excluded from the build; no replacements are generated except for scrap-7 and the arena fix.
- All other kept candidates must pass the shape gates, the six-car quality gates and the pacing targets as recorded; re-verify after any assignment change.
