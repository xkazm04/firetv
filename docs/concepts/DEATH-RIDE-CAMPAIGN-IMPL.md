# Death Ride: campaign implementation (Q0-Q4), the Ash Circuit with the owner's plot

Written 2026-10-02. Owner choice and plot: `deathride/campaign/OWNER-CAMPAIGN-CHOICE.md` (read first, verbatim words and host reading). Triage page and note: `deathride/campaign/directions/index.html`, `docs/concepts/deathride/K1-campaign-directions.md`.
Existing foundations: `DEATH-RIDE-PROGRESSION.md`, `deathride/docs/concepts` C4 (35 events, 18/21/24 laps, rival garages, three tiers), `G2-REPORT.md`, ten cars with abilities, Rivet/Hammer/Mine (mine blast 0.5 m), the HUD (`H3-hud-report.md`), art kit (rival portraits, story-card backdrops, `art/review/fusion`), audio direction (`deathride/audio/OWNER-AUDIO-CHOICE.md`: the Mechanic is the nervous, helpful young parts-store owner).

## The plot to implement

Debt to **Marrow**, who owns the league. Survival is at stake. Winnings pay down the debt, but Marrow controls the books. At the end of each division the **boss** is beaten and **turns to the player's side**: an ally who is a **medium of promotion**, paying out **money, a car or a part upgrade** (design the choice). **The Mechanic** runs the parts store (the shop) from the start, nervous, helpful, young; secretly builds a basic car with a **mine dispatcher** to end Marrow's reign.
**Finale**: Marrow **takes the player's car as part of the debt** (the apex of his need for control); the Mechanic's rig is the player's last car; the final race is a **fight to the death**, not a several-lap race.

## Q0 Design note and data model (design first)

`docs/concepts/deathride/Q0-ash-circuit-plot.md`: the full plot beat sheet (35 events across five acts, hubs, the boss ladder Rook, Ox, Vex, Mica and Marrow, side contracts, grudges), where each story card and Mechanic scene sits, the **debt model** (starting debt, how winnings and interest and Marrow's cuts work, the money twist; no dead end, keep the insured repair economy and the no-bankruptcy guarantee), the **ally promotion** rule (what each ally pays: money, a car, a part upgrade; choice or by character; per boss; balanced against the economy and the PR-ratio timeline, no hidden power), and the **finale** (car seizure, the rig, the death duel rules).
Resolve the owner's open questions with a stated default and a flag (payout choice, seized car returns or not, one-on-one or field, Mechanic loyalty). Data first: story, cards, taunts, allies, debt as CSV or data files under the existing career data, one authority per number.

## Q1 Core: debt, ally promotion, the Mechanic

Implement in `core` (deterministic, allocation-free where in the step; the career layer may allocate outside the step as the existing career code does): the **debt ledger**, **post-boss ally payout** with the owner's money/car/part choice, a **relationship state** per ally (changes taunt lines and gives a small in-race benefit only if the data says so and the balance holds), save/migration (existing saves must load; the saves already migrate v1-v4), receipts idempotent. TV and phone menus show the debt, the ally choice and the story cards (art: act backdrops and portraits exist; use the HUD style kit; spend at most about 30 images of the remaining Grok budget, guarded driver, only for gaps; report spend).
The **Mechanic** appears in the shop with lines (text now; voice later through the audio X3 run) and a gentle tutorial role.

## Q2 The death duel

New event type: **elimination fight to the death**, no lap win, last car running wins (wreck state tag, existing combat rules: one HP authority, no one-shot, hit dedup; start protection stays). The player drives the **Mechanic's rig**: a basic car with an automatic **mine dispatcher** ability (uses the existing Mine at its 0.5 m blast, an ability in the ability data with cost, cooldown and telegraph; art may be procedural for now) and Marrow's apex car and AI (perception-based, no omniscience, the same physics; a boss behaviour profile on the existing AI). The player's seized car is a story prop (shown in the cinematic card, optionally returned as a reward per Q0). Arena: a track or arena from the existing set with a layout suited to a fight (check the linter), full-field or one-on-one per Q0.

## Q3 Balance, simulation and fairness

Headless simulation: the debt and payout economy over 2,000 seeded careers (races to each ally, to the finale, bankruptcy rate, debt paid by the finale, no dead end), the PR-ratio curve with boss dips, the death duel (win rate by skill tier, duration, not one-sided, early-wreck fairness metric: under 5% of events lost before lap one for the human lead; for the duel define a comparable opening gate), instrument self-review per the registry notes (winner share not entry rate, rotation cross-check, seed diversity alarm). Registry notes: `C:\Users\kazda\kiro\ai-registry\.claude\worktrees\forge-racing-tv\knowledge\game-production` (read only).

## Q4 Stick check and owner checks

Build green (`:core:test :link:test :game:test :app:assembleDebug`, browser checks). A Stick build under app id `dev.deathride.campaign` (never `dev.deathride.tv`; the address changes, scan the /24 for port 5555) with a scripted play-through of a boss, the ally choice, the seizure and the duel start; frame budget. `OWNER-CHECKS.md` entry (what to look at: the story cards, the ally choice, the debt, the Mechanic, the duel) and `Q4-campaign-report.md` with tiers of truth (nothing "felt" until the owner says so).

## Rules

Original work only (nothing from the arcade game or the Death Rally titles; no franchise names). One design note, one status row, one session-log entry and one commit per wave; never push; never ask a question; build green at every commit.

| Id | Wave | Status |
|---|---|---|
| Q0 | Plot, debt and ally model, finale rules (design note, data) | complete ? Q0 note, 35 beats, rules, four promotion choices; green build and four browser suites |
| Q1 | Debt, ally promotion, the Mechanic, cards and menus | complete ? v5 ledger/migration, rewards and TV/phone menus; build, five browser suites and GL text checks green |
| Q2 | Death duel and the Mechanic's rig | not started |
| Q3 | Balance simulation and fairness | not started |
| Q4 | Stick check, owner checks, report | not started |
