# Death Ride: the HUD style pass and the mine fix (H0-H3)

Written 2026-10-02. Runs after the abilities stream (A0-A3) finished, on branch `deathride/hud` cut from `deathride/abilities`, with the art branch merged in.
Owner inputs: backlog notes N1 and N2 in `docs/concepts/DEATH-RIDE-BACKLOG.md`, the fusion art direction approval (`deathride/art/OWNER-CHOICE.md` in the art worktree `C:\Users\kazda\kiro\firetv-deathride-art`, sections A-D, branch `deathride/art`).

## H0 Merge the art branch and apply the mine decision

1. Merge `deathride/art` into this branch (assets under `deathride/assets/`, `deathride/art/`, `deathride/tools/art/`). Resolve conflicts carefully (the abilities, drift and integration streams all touched the renderer); prove with tests and a build.
2. **Mine decision (owner, N2):** set the Mine blast `radiusM` to **0.5 m** (down from 5 m) in `weapons.csv` as a provisional value for the main line. Then re-run the balance report, the AI mine rule (`aiMineAvoidMarginM` adds the radius), the no-one-shot floor and the telegraph/arming budget; decide with data whether `mineTriggerRadiusM` (1.6 m) and the damage (24) need adjusting so the weapon stays useful, change them only with a stated reason, and report before/after. Update the renderer's mine ring to match.

## H1 HUD inventory and design note

Inventory **every component that ends up in game** and where it is drawn (TV and phone): lap and position, speed, HP and armour bars, ammo and weapon slots, ability meters and cooldowns (A2), minimap, countdown, results, garage and shop, career menus and story cards, TV lobby and QR card, rival portraits, controller page (steering pad, pedals, fire, mine, swap, ability button, layouts Classic/Cruise/Split, settings sheets, connection and lost-link states).
For each: current implementation (procedural or atlas), target style (the owner's family assignment: Hot Ink for icons, frames and effects; Soot Pulp for portraits and barriers-like panels; Rust and Ink for cars and surfaces; the shared bridge block), size floor for sofa readability (TV text and icons at the 1080p stage, nothing under 28 px carrying meaning), and fallback.
Design note first, with the inventory table, a style spec (frame, bar, meter, button, panel, typography with a rough hand-drawn face that stays legible, wear level), and which assets exist in the atlas (`deathride/art/DELIVERY.md`, `review/fusion`) versus what must be generated.

## H2 Assets and implementation

Generate the missing HUD frames, bars, meters, buttons and icons through the **existing guarded Grok driver** in the fusion style (Hot Ink family), with the same gates, local grading, proof-before-batch and stop latch; weekly cap 550, 401 reserved at last check, so keep the HUD kit under about 80 images and report spend. Pack into the atlas, keep residency inside the declared texture budget and re-validate.
Implement: TV HUD from the atlas with the procedural fallback intact; ability meters for the ten abilities; the phone controller page restyled with the same components (CSS or sprites; keep touch targets, pointer capture, mirror and neutralise-on-loss behaviour unchanged, plus all existing browser checks); readability checks (96 px silhouettes and font floors).

## H3 Evidence and owner checks

Build green (`:core:test :link:test :app:assembleDebug` plus renderer tests and the browser checks). Stick check under app id `dev.deathride.hud` (never `dev.deathride.tv`; the Stick address changes, scan the /24 for port 5555): screenshots of every HUD state, frame budget with the HUD on. `OWNER-CHECKS.md` entry (what to look at, good and bad), `docs/concepts/deathride/H3-hud-report.md` with tiers of truth (nothing "felt" until the owner says so).

## Rules

Original work only. One design note, one status row, one session-log entry and one commit per wave. Never push, never ask a question. Build green at every commit.

| Id | Wave | Status |
|---|---|---|
| H0 | Merge art, apply mine 0.5 m and re-balance | complete - clean merge; A3 tuning preserved; 3,120 exact outcome replays; 126 tests and APK green |
| H1 | HUD inventory and design note | complete - TV/phone inventory, 1080p floors, fusion components, 14-image initial kit and fallback plan |
| H2 | HUD assets and implementation (TV and phone) | complete - 14 selected assets / 22 calls; one UI page; TV/phone styled; 128 tests, 39 art tests, GL and browser gates green |
| H3 | Stick evidence, owner checks | not started |
