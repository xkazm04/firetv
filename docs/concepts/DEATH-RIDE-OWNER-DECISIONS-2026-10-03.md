# Death Ride: owner decisions from the review pages, 2026-10-03

Source: the owner's pasted Markdown exports from the four review pages (art rework 2, audio X3 engines, effects, voices, music proof, campaign design pass 2). Verbatim tables are below; the host reading and the instructions for the apply run are in sections 0 and 6. Nothing here asks for new generated assets.

## 0. Owner instructions and host reading

> 1. Rework 2 - ... No need to generate new assets as replacements
> 2. Audio. a) Engine ... b) effects ... c) Voices - no rejections there ... d) Music - keep without music for now as a debt (...). I will use Suno later to recreate music tracks for each track type and menu
> e) Campaign proposals are well thought

Host reading:
- **Art (rework 2):** Keep means use the candidate in the game. Reject means do NOT use the candidate and fall back to what existed before (the earlier kit asset, the original portrait or card, or the procedural fallback). **No replacements are generated.** The owner's notes: Ox: "Looks well with shoulders and armor, lets keep original" (keep the original Ox portrait). Every environment row carries the note "Alter candidate resolution quality degraded": the owner is flagging that the altered (derivative) candidate shows degraded resolution; the four kept props are kept despite it, so use them as delivered (or, where the page offers the unaltered original and it passes the gates, prefer the original); do not regenerate. The retained natural dune is rejected ("Same asset"): remove it from the retained set.
- **Audio:** per-car engine picks below. Needle has both variants rejected: no Needle-specific engine, use the engine base as the fallback until a later triage. Bastion has both kept: use bastion-1 as primary and bastion-2 as the alternate variant (the cue manifest should allow a second variant per car). Effects: rejected items (tyre, skid, drift, mine-drop, lap) are not replaced now; they play nothing or fall back per the manifest; list them as open gaps. countdown is Maybe: keep it, flag as a candidate for later. Voices: all kept. **Music: none for now**; the 150 second proof is rejected; the game ships without music tracks until the owner makes tracks in Suno (a music brief per track type and menu is requested below).
- **Campaign (design pass 2):** accepted except item 02, which is rejected. Item 02 (DV1 default) proposed: ordinary boss promotion requires finishing alive ahead of the named boss (third place can recruit a fourth-place boss); rejected, so the **old rule returns: promotion needs winning the boss race** (first place, as in the owner plot "winning with each round final boss would turn it to your side", and as before DV1). The finale still requires being the last car running. Item 08 (a shorter complete campaign, about 4-6 hours) is accepted as flagged.

## 1. Art rework 2 (owner export)

| Category / direction | Pick | Samples | Owner note |
|---|---|---|---|
| environment/scrap-pile | Keep | rw2-env-scrap-pile-v1-a2 / 55829cb638f020126f9e5d071439ec0da7d31764356c1305c3b1f176a6e0b942 | Alter candidate resolution quality degraded |
| environment/oil-drums | Keep | rw2-env-oil-drums-v1-a1 / 60944050ba18c0d07f910c7577dc7dd08e0ef07e6ae82007ff47e96878e50b39 | Alter candidate resolution quality degraded |
| environment/rust-pylon | Keep | rw2-env-rust-pylon-v1-a2 / 9337984834c33eab491639886667e769393bf1f87440deeafb64170a5ca5adc7 | Alter candidate resolution quality degraded |
| environment/league-gantry | Keep | rw2-env-league-gantry-v1-a1 / 188740ee5829dadeb5b1dda1622e23a32d4bf47cc02a7966b54e55088b518fae | Alter candidate resolution quality degraded |
| environment/derelict-crane | Reject | rw2-env-derelict-crane-v1-a2 / 8c9a984e210544421a1720b38b96a6b65e2e84291fdbb72244d2c7e00cafaf88 | Alter candidate resolution quality degraded |
| environment/wreck-car | Reject | rw2-env-wreck-car-v1-a1 / e283ac6d3db4c134c26780487cc2453960f716f101904ba7f6588c04d39c292e | Alter candidate resolution quality degraded |
| environment/quarry-face | Reject | rw2-env-quarry-face-v1-a2 / 546faaac03940cc9df0ebd875dc53723e4e50f53c6c329d8d460e52807726b22 | Alter candidate resolution quality degraded |
| environment/slag-heap | Reject | rw2-env-slag-heap-v1-a1 / 670b7122141dcd71bc236e8d48c8615a854463ff51c9ce3c9d1e39ab6d9fa7a3 | Alter candidate resolution quality degraded |
| environment/salt-crust | Reject | rw2-env-salt-crust-v1-a2 / 5b4e741c369213eda4d4a296dc7f8b6c9691543c5d92e737f74bf853dd74c96d | Alter candidate resolution quality degraded |
| environment/dead-brush | Reject | rw2-env-dead-brush-v1-a1 / 9c7de7e655aacfebd69ebd2a32679142e3dbd3de15418c460e060a3914c8b3f6 | Alter candidate resolution quality degraded |
| environment/league-hoarding | Reject | rw2-env-league-hoarding-v1-a1 / b986cd50e56e0d87f3bdab9ad90acea03e3cc2e944c8822b20b641a26a409f54 | Alter candidate resolution quality degraded |
| environment/smelter-stacks | Reject | rw2-env-smelter-stacks-v1-a2 / 12fa688022ee74aef79291eae39300621c1942c5ad349a9e0e517acc4be1b53a | Alter candidate resolution quality degraded |
| environment/sluice-gate | Reject | rw2-env-sluice-gate-v1-a1 / 5ad31093f85c29955782ab6ed3ca8f717626e2f38ea35e60b5106eeed28b415b | Alter candidate resolution quality degraded |
| environment/dead-tree | Reject | rw2-env-dead-tree-v1-a2 / 09df1d1cdaface6bde0b12c6d437850334f3348453e5a17e72b7b086a8a9610c | Alter candidate resolution quality degraded |
| environment/guard-rail | Reject | rw2-env-guard-rail-v1-a3 / 6f6fd1c9eeaa458c2b076e6a7a622f9a95189e1dbab4af8dbb4244adfb335bd2 | Alter candidate resolution quality degraded |
| environment/rock-fall | Reject | rw2-env-rock-fall-v1-a2 / 9e907c1bbc4e0ecfdf63797cff841fb884bbbbfa699edc1d86c05c538a4f6501 | Alter candidate resolution quality degraded |
| environment/rock-spire | Reject | rw2-env-rock-spire-v1-a2 / f16a80217fcdfa34511e3952501478f1d5cffbc6a1acd0b3d3581ae9a8cf92f3 | Alter candidate resolution quality degraded |
| environment/tyres-scattered | Reject | rw2-env-tyres-scattered-v1-a1 / 3fe6adb69e87c8fe02c8c5dc4daf90b8c6cfbc46f013e980690ed081b3533559 | Alter candidate resolution quality degraded |
| environment/tyre-wall | Reject | rw2-env-tyre-wall-v2-a1 / 8f816699a8e05b57e7b0af43849b59218f74bf4fd4833844b6d45c6ee9bb1d86 | Alter candidate resolution quality degraded |
| portraits/rook | Keep | rw2-face-rook-v1-a2 / fa43631a5344a0087e1ccc62056cb594d2418c0406e74a8e61562faef373e1a5 | |
| portraits/ox | Reject | rw2-face-ox-v1-a1 / 47ef96a8acf76bf45ecc7cf2a18b50a8eba9fcabb23260862940e9ed86596093 | Looks weel with shoulders and armor, lets keep original |
| portraits/vex | Keep | rw2-face-vex-v1-a1 / befbb6136170ac1b320694fd9eb78b245072cb412cb380891a5356d91db4cc62 | |
| portraits/mica | Keep | rw2-face-mica-v1-a1 / 51dff24b96c0f3d3ff5c5f8b1750b66ae8cdabb82aae8c74f292065a747a6706 | |
| portraits/relay | Reject | rw2-face-relay-v1-a1 / 370beffb5da3901e4303c66228e9f8ad64363208c47dae6d9b2d42bf33ad3fbd | |
| portraits/marrow | Reject | rw2-face-marrow-v1-a1 / c6af1128feb3a7c33fa61f748a62ff1d211fdfcb1e1075d6ff98ccc55e82b9f4 | |
| portraits/mechanic | Keep | rw2-face-mechanic-v1-a1 / ab7a73dbd6a43421af3b9a287a30b0cf0fc08bb8f8032b2bc0340357070afb07 | |
| story/debt-contract | Keep | rw2-face-debt-contract-v2-a1 / eeec2c676d6cac466e780842d6f78888a02a23d49d73a41b7728687ff1a8ef88 | |
| story/ally-rook | Keep | rw2-face-ally-rook-v1-a1 / 7b90ca54d170fbb917038b4ac4bf139bc8471c100f78fb24c90b1f2b8a259767 | |
| story/ally-ox | Keep | rw2-face-ally-ox-v1-a1 / 9ebc5650549fc7ae5c714949e82ce91076859dd2092a5983f84146c38f63600b | |
| story/ally-vex | Keep | rw2-face-ally-vex-v1-a1 / 2c23dc8d67a3f923faa2683584c2f662cde5b63106bd47ed0b8e121ad4044f41 | |
| story/ally-mica | Keep | rw2-face-ally-mica-v1-a1 / b6c827aa3100f88db1512a44a42b4b0840dc831e53895bd108e6d64f357c83a8 | |
| story/car-seizure | Reject | rw2-face-car-seizure-v1-a1 / 0776b88902a614b786470c31a4b7736b614f1b5bca6d8ec5f292c84b0c6eeb00 | |
| story/ending | Keep | rw2-face-ending-v1-a2 / bb70e94eff1cb42d023347c64711c9a09e05ddacea675a7455108c48587ff3ff | |
| story/rig-reveal | Reject | rw2-reuse-rig-reveal / ab7a73dbd6a43421af3b9a287a30b0cf0fc08bb8f8032b2bc0340357070afb07 | |
| Retained natural dune | Reject | v4-fusion-props-soft-dune-v1-despill-v1 / 959eb3dedeb1fd60e11c5bf949072bb43c34f6a234d229b102732008b56ff209 | Same asset |

## 2. Audio X3 engines (owner export, per-car variants)

Keep: line-1; bastion-1 and bastion-2; comet-2; trail-2; flint-1; quill-1; vandal-1; kestrel-1; bulwark-1.
Reject: needle-1, needle-2 (no Needle engine); line-2; comet-1; trail-1; flint-2; quill-2; vandal-2; kestrel-2; bulwark-2.

## 3. Audio X3 effects (owner export)

Keep: engine-base, rivet-base, mine-base (mine blast), crunch-base, crunch-retry, pickup-base, confirm-base, wall, barrier, rivet-hit, hammer-fire, hammer-hit, mine-arm, scatter, pickup-ammo, pickup-repair, wreck, start, victory, defeat, ui-focus, ui-back, ui-denied, ui-purchase, and all ten ability tells (ability-steel-flick, ability-flywheel, ability-shoulder, ability-turbine, ability-ground-bite, ability-punch-lance, ability-bone-rack, ability-scrambler, ability-arc-harpoon, ability-plate-brace).
Maybe: countdown.
Reject: tyre, skid, drift (movement family), mine-drop, lap.

## 4. Audio X3 voices (owner export)

All kept: announcer.debt, announcer.boss, announcer.ally, announcer.seizure, announcer.duel, announcer.freedom; mechanic.welcome, mechanic.repair, mechanic.books, mechanic.ally, mechanic.seizure, mechanic.rig, mechanic.duel, mechanic.after. "No rejections there."

## 5. Music proof and campaign design pass 2 (owner export)

Music: 150 second proof, final master `dust-road-proof.mp3`: Reject. First render and the unmatched score export: not reviewed. Owner: no music for now; Suno later.
Campaign design pass 2: 01 Seven visits with a purpose: Keep; **02 Beat the named boss: Reject**; 03 A finite power ladder: Keep; 04 Promotion through allies: Keep; 05 The receipts return real money: Keep; 06 A coalition with something to lose: Keep; 07 The last car running: Keep; 08 A shorter complete campaign (OWNER FLAG, old 5 to 8 hour target): Keep.

## 6. Apply run (a later step, no new generated assets)

See the run prompt: merge `deathride/campaign-v2` with item 02 reverted to the old win-the-boss-race rule; apply the art Keep/Reject decisions by falling back to earlier assets on Reject; wire the per-car engine picks and the effect picks into the cue manifest with the silent or base fallbacks; and write a Suno music brief for each track type and the menus.
