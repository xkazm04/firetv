# Q0 — The receipts belong to us

Design before implementation, 2026-10-02. Owner authority: `deathride/campaign/OWNER-CAMPAIGN-CHOICE.md`, preserved verbatim. The Ash Circuit is a survival story: Marrow can seize the garage and its occupants as debt collateral. The missing sibling copied his books and fled the fire. The nervous young Mechanic has sheltered the sibling while keeping the player's car running. His secrecy is fear, not a betrayal lottery.

The 35 existing event IDs and five hubs remain authoritative in `campaign.csv`. `campaign-beats.csv` specifies the scene and dramatic job at every event; `story-cards.csv` holds the three displayed lines. The first 34 events retain 18/21/24 laps. Each act ends with Rook, Ox, Vex, Mica or Marrow. An ordinary qualifying result advances; a promotion boss requires victory. Losing a boss still pays and repairs normally, then offers a retry. Reading cards never gates input. The Mechanic appears in the shop from event one and changes lines by act.

## Debt and the stolen money

`campaign-rules.csv` is the sole authority for the new numbers. The league ledger starts at 1,200 CR. Existing optional shop loans remain a separate balance with their existing fixed fee. No retroactive league debt is added to v1–v4 saves. Each first visit to events 1–14 adds 6 CR interest; retries, practice and real-world time add none. A race first pays insured repairs, then its existing optional-loan repayment. Up to 20% of the remaining net prize goes to the league, with the existing 40 CR minimum take-home protected across both deductions. No entry fee or debt threshold blocks racing.

Before Ox joins, Marrow diverts one quarter of each league payment to his private fleet instead of reducing principal. The player sees payment, credited amount, diversion and interest separately. Ox brings duplicate receipts: joining him credits all diverted money back against the league balance and stops further diversions and interest. The ledger retains lifetime totals and the last receipt. Zero balance never prevents the seizure: Marrow invents an ownership lien after his arithmetic is exposed. On final victory his remaining claim is void, recorded separately from money paid. No silent cash debit, compounding interest, surprise stat penalty or bankruptcy.

## Promotion and relationships

After each of the first four boss victories the boss joins once per profile, immediately, and a pending reward survives restart. Player chooses money, the named next-tier car, or a single next legal useful part on the selected owned car. Values and chassis/part IDs live in `campaign-allies.csv`. Cash is 300/500/700/900 CR, subject to the disclosed wallet cap; a full wallet refuses the choice so it cannot be lost. Car gives Trail/Flint/Quill/Kestrel, stock, without selling the current garage. Already-owned cars cannot be claimed twice. Part observes the same unlock/class caps as the shop and refuses an unavailable upgrade, leaving other choices open. Rewards never auto-select a different chassis. Choices use revision checks and persisted claimed flags, independent of race-ticket idempotency.

These are intentionally unequal market values: cash is flexible, the car is a specific sidegrade, the part is a small immediate improvement. All offered power is named and priced by the existing shop; no hidden PR. Measure all three policies in Q3. Allied rivals remain competitors under the shared physics. The default ally race benefit is zero; friendship changes taunts, and a subsequent collision grudge can coexist with loyalty. No invisible boost. Marrow is the exception to boss recruitment: his defeat ends his control; he does not join after a death fight.

Contracts remain optional overlays on the 35 events: Relay's sealed gearbox, Rook's retirement grudge, and untouched cargo. Existing rewards and predicates remain their authority. A contract never gates a licence or the plot; retiring an ally can create a grudge without revoking an already-earned payout.

## Seizure and last fight

After event 34, entering the final career preparation atomically records the selected owned car as seized. Its upgrades and condition remain saved as collateral, inaccessible to trading/selection during the finale. The card shows its name against the reused Crown backdrop; this is a story prop, not a second physics object. Every retry uses the same supplied rig at full condition, with no consumable charge or garage requirement. Abandoning or restarting cannot duplicate the rig or a reward. Practice does not trigger the seizure.

The Mechanic's rig is a basic stock Line chassis with a campaign-only mine-dispatcher ability override, not an eleventh purchasable roster tier. It uses the real Mine weapon: 0.5 m blast, normal arming, hit dedup, finite energy, cooldown and an explicit windup tell. Ability coefficients belong in ability data. Marrow retains his legally purchased Bulwark and a perception-based boss profile; same solver, HP authority, weapons and opening protection. Crown's existing linted road supplies the arena and pickups. No lap counter can win the fight. Only the last car running wins; simultaneous wrecks are a retry. A 600-second watchdog ends an unresolved fight as a draw, never awards a survivor by time or lap count. The opening fairness gate is 20 seconds. Q3 measures duration, skill differences, draws and opening losses; the rig's deliberate PR deficit is reported separately from the ordinary career ratio target.

Victory restores the seized car, voids the fraudulent balance and shows the reunited workshop epilogue. The rig is a loan for this fight, not a sellable reward. Future seasons retain allies/rewards already earned and cannot farm the one-time grants.

## Owner defaults and flags

The explicit defaults in campaign rules are `choosePayout=1`, `returnSeizedCar=1`, `duelEntrants=2`, `mechanicLoyal=1`. They record the resolved open questions; unsupported alternate settings must fail validation rather than silently pretend to work. The player chooses the payout; seizure ends on victory; the duel is one-on-one with P2 spectating; the Mechanic is loyal. No question blocks this run.

Reuse all six portraits, five Soot Pulp act backdrops and the Hot Ink HUD. Mechanic is a named text character; no reused rival portrait is mislabeled as him. Rig visuals can be procedural. Q0 generation spend: zero images, zero videos, zero paid calls. No new audio; lines are ready for the separate voice run.

Validation gates: content/reference lint, migration and idempotency, physical duel tests, real menu/browser checks, 2,000 seeded economy careers, explicit physical sample provenance, /24-discovered campaign-only Stick install. Existing G2 boss dips and H3 frame tails remain open until measured; no owner feel is inferred.

Q0 validation: {'core': 121, 'link': 3, 'game': 8} JVM tests; required APK tasks and desktop distribution pass. Four isolated desktop browser suites pass (pairing/touch/combat/abilities/HUD layout and reconnect). APK manifest is dev.deathride.campaign. Evidence: deathride/evidence/campaign/q0. The canonical art snapshot remains 482/550; this wave spent zero.
