# P16 - the optimize wave's last two cards: the HUD font pages merge and the static HUD layer

2026-10-08, AFTKM `10.0.0.139:5555` (Android 11, PowerVR GE9215, back buffer RGBA8888 with 2x MSAA), isolated
`dev.deathride.perf` / 8772 / private ADB 5041. Branch `autopilot/codebase-static-analysis-sweep-935687ff`, cut from
`deathride/main` d95166c8 (P15). Every figure below was measured in this session. Summaries are in
`deathride/evidence/perf/p16/`. Its `manifest.json` binds the raw logcats, `raw.json.gz` files, captured PNG frames, build and
gate logs, scripts and all four APKs, which are kept outside git in `C:/Users/kazda/kiro/deathride-raw-evidence/p16/`.
Nothing a player sees or hears changed: both cards are declined and reverted. Nothing was pushed.

## Figures first

| Card | Gate (pixel proof on the Stick) | Flushes per active race frame | hudMs mean (valid runs) | Disposition |
|---|---|---|---|---|
| **1. Font pages merge** (one runtime font page) | **text diff 0**: 0 differing pixels in 6 captures (2 lobby, 4 race), RGB and alpha; scenery bakes byte-identical | **3 -> 2** in every frame of every run (fonts beats base) | fonts 1.166 / 1.616 ms vs base 1.182 / 1.183 ms: **not shown** | **declined** under the fixed rule (hudMs); reverted 8443a99f |
| **2. Static HUD layer** (retained race chrome) | **fails**: 6,729-6,921 pixels differ per race frame, **337-409 by more than 1, max 30** | 2 -> 2 (not shown; the floor) | layer 1.036 / 1.039 ms vs fonts 1.166 / 1.616: layer beats fonts (and base 1.182 / 1.183) | **declined** on the pixel gate (and owned textures +3.3 MiB); reverted 7dabb5c0 |

- **Card 1 meets its own card's claim and gate but not the brief's hudMs rule.** The HUD batch flushes once less in every
  active frame, font textures drop from 5 to 2 MiB, and no pixel changes. Its hudMs gain is inside the run-to-run noise:
  fonts-run1r read 1.166 ms, under both base runs, but fonts-run2 read 1.616 ms. That run was slow in every phase (work
  11.34 ms against 9.96-10.55 in the other valid runs, thread CPU 8.92 against 7.25-7.51), so it is not the HUD. By the
  rule fixed before the first graded run (2840bfc4), that is "not shown", and the card is declined. Reverting 8443a99f
  re-lands it (question 1).
- **Card 2 saves HUD CPU but cannot pass a pixel gate on this back buffer.** Every pixel off by more than 1 lies within
  one pixel of an edge the bake rasterizes: a nine-patch seam, a frame edge or an icon quad edge. Only 6% of the bake box
  lies that close to an edge. With 2x MSAA, a seam that falls inside a pixel takes one sample from each patch, while a
  single-sampled bake takes only the patch under the pixel centre (for example, the meter frame's left patch ends at stage
  x 553.16 = 829.74 px). Some of these pixels also hold a live bar edge, so even an MSAA bake could not make them exact.
  Its hudMs is lower than base by 0.145 ms (-12%); question 2 asks whether to pursue a pixel-exact form of it.
- **Base, today:** the race HUD flushes **3** times per active frame, not the 4 the card assumed (`hudFlushes` = 3 in all
  95,006 active frames of the five base runs, void run included). hudMs mean 1.14-1.22 ms, p95 1.61-1.95 ms (P5's 1.37 / 2.17 was an older
  build).

## Step 0 - the record

`DEATH-RIDE-DECISIONS-2026-10-07.md` section 9 holds the App Master's four rulings on P15's questions (39b4832e): the
mixdown sketch retired, the `silentMmap` arm dormant in the tree, goal 1's bar with the owner (no frame-tail research
run), and P15's Wi-Fi stall card open in the ledger. It gives who decided (the App Master, under the operator's
2026-10-07 06:25Z delegation) and the reason for each.

## Step 1 - the baseline (deathride/main + the HUD counters, before any change)

FrameProfiler could not tell the HUD's flushes apart from the frame's draw calls. A perf-only counter was added first
(d6740d7f, profiled builds only), and the base APK was built from that commit. It adds three columns, read by name:

- `hudDraws`: the GL draw calls inside `drawOverlay` (ProfileGl's draw count before and after it);
- `hudFlushes`: the HUD SpriteBatch's `renderCalls` between its begin and end in `drawOverlay`. That is one per texture
  change, blend change or full buffer, plus the last flush at `end`;
- `hudBakeMs`: the time a frame spent baking a retained layer (0 on base).

The rule and readings were committed in `tools/perf-p16.py` (2840bfc4) before the first graded run. Two profiled 360 s
runs by P14's procedure (P11's command, no extra, `--install` before every run):

| Run | Active frames | hudMs mean / p95 | hudFlushes | hudDraws | drawCalls | textureBinds | Over 33 ms | Over 20 ms | Worst active p95, ms | Active max, ms | PSS, MiB | Owned textures, MiB |
|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|---:|
| base-step1a | 19,047 | 1.198 / 1.946 | 3 (all) | 6 (all) | 19.45 | 13.48 | 93 | 816 | 27.758 | 114.292 | 154.5-172.2 | 39.97 |
| base-step1b | 18,975 | 1.138 / 1.608 | 3 (all) | 6 (all) | 18.70 | 12.76 | 98 | 893 | 25.590 | 69.768 | 169.4-190.7 | 39.97 |

0 rejected inputs, thermal status 0 in both. The HUD's six draws are the shape pass (two flushes around the retained
minimap road), the minimap road mesh, and the batch's three: the UI atlas page, then the text. Only two of the three font
pages hold text in an active race frame. A layer with no quads still switches the batch's texture, but it does not flush.

## Step 2 - card 1, the font pages merge (12390e79, feebc1ff; reverted 8443a99f)

- The HUD body font (20 px, 1024x512 page, glyph cells to row 336) keeps its page. The detail font is now
  `RuntimeFonts.sibling(body)`: its own copy of the glyph cells, advances, metrics and scale over the same texture, so
  TrackScene's signage rescale and recolour cannot reach the body font. Its u/v are bit-identical, because it has the same
  cells on a page of the same size.
- `HandCutFont.createOn` copies each 34x46 title glyph cell of the old 1024x256 page, unchanged (Pixmap blending None),
  into the body page's free rows from row 336, inside a 2-row transparent border. Each glyph keeps its old 64-texel column,
  so u is bit-identical and the 30 transparent texels beside each glyph stay. Advances and scale are unchanged. Three rows
  of 50 end at row 486, inside the 512-row page.
- Font textures 5 -> 2 MiB (owned textures 39.97 -> 36.97 MiB). A build without a runtime font factory keeps the old pages.
- Tests: `FontPageTest` (4 cases on a fake GL: the sibling's metrics and u/v equal bit for bit, independence under
  rescale, `usedRows`, and titles refusing a page they do not fit). `HudDiffTest` (3 cases).

**Pixel proof.** A perf-only harness (`hudDiff=on`, af1d860c and 177d5872; reverted 61354395) captured frames on the
Stick:

- At each capture point (lobby 8 s and 20 s, race 8, 16, 24 and 32 s), it read the frame's world back and redrew it under
  each HUD variant into the real 2x MSAA back buffer. The blend state the HUD met was restored before each variant.
- It compared each pair of read-backs. RGB decides; alpha is only counted, because the window is opaque.
- The base variant draws the same text calls from genuinely old pages: two separately rasterized body pages and the old
  title page, through GlyphLayer twins. The control variant is the base drawn a second time.

| Run (APK) | Captures | base / fonts, pixels differing (max) | control |
|---|---|---|---|
| diff-fonts (af1d860c, titles packed in new cells) | lobby-1, lobby-2, race-3, race-4 | 0, 0, **31 (max 1)**, 0 (15 alpha-only) | - |
| diff-fonts2 (177d5872, titles keep their columns) | lobby-1, lobby-2, race-3..6 | **0 in all six** (RGB and alpha) | 0 in all six |
| diff-layer (42833cd9) | the same six | 0 in all six | 0 in all six |

The 31 pixels sat in one column at a title glyph's right edge (x 639 px, a bone glyph fringe at 22 against 23). Moving the
cell had changed the glyph's u coordinates, which rounded to a different filter weight there. Keeping each title glyph's
old column removed it.

**Scenery** (the detail font draws the league-hoarding signage into the bake): `bakeHash=on` on the base APK (hash-base) and
the fonts APK (diff-fonts2) gave the same SHA-256 for scrap-1-c, foundry-1-c, salt-1-b and switchback-1-a. crown-1-a was
not reached in 240 s.

## Step 3 - card 2, the static HUD layer (42833cd9; reverted 7dabb5c0)

- **What was built:**
  - `HudLayer` bakes the race chrome into one RGBA8888 FrameBuffer, with the same camera and a viewport offset by whole
    pixels. The chrome is the six instrument frames, two meter frames, the dial, and the weapon, mine and ability icons.
  - Colour blends SRC_ALPHA / ONE_MINUS_SRC_ALPHA, as the direct draw does. Alpha blends ONE / ONE_MINUS_SRC_ALPHA, so the
    target holds premultiplied colour.
  - It is composited ONE / ONE_MINUS_SRC_ALPHA, nearest, texel for pixel, at the chrome's place in the batch order. It is
    drawn as two quads (the instrument band and the dial), so the blended area matches the direct draw.
  - The bake box is 1,832 x 473 px, 3.31 MiB, capped at 4 MiB. The cap was reserved beside the fonts in the art residency
    limit, and the target counted in `ownedTextureBytes`.
- **Kept live:** panels, bars, meters, the minimap, stale-link panels and text. The panels are ShapeRenderer rects under
  the live bars, so retaining them would put them over the bars. They share the bars' shape flush, so retaining them
  could not remove a flush.
- **Re-bake triggers, from the code:** the active driver (`activeDriver()`), that car's selected weapon, its ability
  definition, the dial's presence (`FOLLOW_CAMERA` and the scene ready), the viewport's position and size, and a resume
  (lost context). Bakes run before the frame's own drawing, first in the countdown. Active frames with a bake: 0 in
  layer-run1, 3 in layer-run2 (max 1.094 ms).
- **Pixel proof (diff-layer, fonts against layer, the same frames):**

| Capture | Pixels differing | By 1 | By more than 1 | Max | Over 1 within a pixel of a baked edge |
|---|---:|---:|---:|---:|---:|
| lobby-1, lobby-2 | 0 | 0 | 0 | 0 | - (the layer is race-only) |
| race-3 | 6,803 | 6,438 | **365** | **30** | 365 |
| race-4 | 6,883 | 6,474 | **409** | **30** | 409 |
| race-5 | 6,921 | 6,512 | **409** | **30** | 409 |
| race-6 | 6,729 | 6,392 | **337** | **30** | 337 |

  Bins for race-3: 1: 6,438; 2: 85; 3-4: 87; 5-8: 176; 9-16: 6; 17-255: 11. The diffs cluster at the meter frames over the
  health bar (stage x 550-740, y 650-660) and the energy bar (x 1040-1220, y 590-600), and at the dial's bottom seam over
  the minimap (y 400). By the brief's gate (zero, or at most 1 in any channel), **the card is declined with these
  figures**. The 1-level pixels are the premultiplied composite's 8-bit rounding: 41% of them lie near an edge, against
  6% of the box.

## Step 4 - the A/B (interleaved, one APK per arm, `perf-p16.py`'s rule)

Order: base-run1, fonts-run1, layer-run1, base-run2, fonts-run2, layer-run2, then the two void runs' reruns base-run1r and
fonts-run1r. The A/B was not settled (P12's procedure has no settle); host CPU per run is in `comparison.json`.

| Run | Arm | hudMs mean / p95 | hudFlushes | hudDraws | drawCalls | textureBinds | work ms | Over 33 ms | Over 20 ms | Worst active p95, ms | Active max, ms | PSS, MiB | Owned, MiB |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|
| base-run2 | base | 1.182 / 1.727 | 3 | 6 | 18.10 | 12.18 | 10.07 | 87 | 786 | 26.959 | 60.41 | 178.4-**194.3** | 39.97 |
| base-run1r | base | 1.183 / 1.758 | 3 | 6 | 18.73 | 12.79 | 10.45 | 151 | 999 | 39.093 | 137.19 | 165.4-188.1 | 39.97 |
| fonts-run2 | fonts | 1.616 / 2.309 | 2 | 5 | 17.53 | 11.57 | 11.34 | 139 | 940 | 29.183 | 92.64 | 164.9-190.2 | 36.97 |
| fonts-run1r | fonts | 1.166 / 1.874 | 2 | 5 | 17.76 | 11.82 | 10.55 | 124 | 894 | 27.290 | 71.54 | 168.2-177.7 | 36.97 |
| layer-run1 | layer | 1.036 / 1.622 | 2 | 5 | 17.31 | 11.39 | 10.17 | 68 | 720 | 25.291 | 62.72 | 173.9-183.3 | 40.28 |
| layer-run2 | layer | 1.039 / 1.589 | 2 | 5 | 17.17 | 11.26 | 9.96 | 79 | 799 | 25.717 | 73.35 | 172.0-190.8 | 40.28 |
| *base-run1 (void)* | base | 1.224 / 1.809 | 3 | 6 | 18.21 | 12.27 | 11.20 | 112 | 877 | 25.619 | 62.83 | 153.1-174.9 | 39.97 |
| *fonts-run1 (void)* | fonts | 1.107 / 1.820 | 2 | 5 | 17.76 | 11.82 | 10.41 | 108 | 886 | 24.237 | 63.77 | 160.1-177.5 | 36.97 |

| Comparison (both runs of X lower than both of Y) | hudMs mean | hudFlushes | Guards (over 33, over 20, worst p95, PSS max, owned) | Verdict |
|---|---|---|---|---|
| **card 1: fonts vs base** | **not shown** (+0.209 ms mean, from fonts-run2) | **fonts beats base** (-1.0) | none worse; owned textures better (-3.0 MiB); hudMs p95: base beats fonts | **declined** |
| **card 2: layer vs fonts** | **layer beats fonts** (-0.354 ms) | not shown (2 = 2) | over 33, over 20 and worst p95: layer beats fonts; **owned textures worse (+3.31 MiB)** | **declined** (pixel gate; owned guard) |
| layer vs base (reference) | layer beats base (-0.145 ms, -12%) | layer beats base (3 -> 2) | owned +0.31 MiB | - |

No arm clears the I2 frame limits (every worst active p95 is over 16.7 ms and every active max over 33 ms). That is goal
1's bar, which is with the owner (section 9, ruling 3). This run grades nothing on it.

## Failures and limits kept

- **Two void runs, each rerun once and not interleaved.** base-run1 refused 7 + 7 inputs 203.9-205.6 s in, at receive
  ages of 251-282 ms. fonts-run1 refused 6 + 6 inputs 65.0-66.6 s in, at 264-279 ms. Both are the Wi-Fi delivery stall of
  P15's lane-C card. Their figures are in the table and would not change either verdict.
- **fonts-run2 is valid and slow in every phase.** Against the other valid runs' 7.25-7.51 ms and 9.96-10.55 ms, its
  thread CPU was 8.92 ms per frame and its work 11.34 ms. Simulation, cars and effects, scenery and HUD were all higher.
  It decides card 1's hudMs verdict under the rule. No settle was run, and the Stick's own load was not sampled.
- **base-run2 read two PSS samples at or over 192 MiB** (194.3 and 192.0), on the base arm. Its other six read 178.4-189.3.
- The card assumed 4 HUD flushes. Today's main has 3, because one of the three text layers is empty in race frames, and
  the claim "4 -> 2" became 3 -> 2.
- The pixel proof compares variants drawn over a read-back copy of the world, so under the HUD each pixel holds the
  resolved world rather than its two samples. The base, the control and the variants all meet the same copy, and the
  control read 0 in every capture.
- The first card-1 proof (31 pixels off by 1) is kept as diff-fonts, with its APK.
- The race chrome bake was single-sampled. An MSAA bake was not tried: libGDX's GLES2 context has no multisampled
  FrameBuffer, and it could not make the pixels where a live bar edge meets a seam exact.

## Gates

- `gradlew.bat :core:test :link:test :game:test --rerun-tasks --console=plain` was run four times on the last code commit
  (8443a99f). Its game/app/desktop code equals 2840bfc4, the counters and the tool.
  - Runs 1-3 each failed one timing test, a different one each time, on a host at 94-99% from other sessions:
    `LinkTest.badPinMalformedInputAndLifecycleAreContained` ("no welcome" after a link restart);
    `ProfileSavesTest` (two cases); and `HiddenPhoneTest.hiddenPhoneReceivesNoHudAndResumesFull`.
  - Each passed in the other three runs, and none is in code P16 touches.
  - **Run 4, with the evidence committed (d4bd97cf), is green:** core 261 (with `EvidenceRuleTest`), link 29 (2 skipped, as
    on the base), game 114. All four runs are in `tests.json`.
- While the cards were in place, `FontPageTest` (4) and `HudDiffTest` (3) passed, run by class. They were reverted with
  their cards.
- `assembleRelease` passed at 8443a99f (`4c4a86a8...`).
- desktop/ did not change; it compiled with card 2 in place.
- **What did not change:**
  - any threshold, clock, physics, input rate, render scale, TextureBudget or budget;
  - audio code and the audio arms;
  - link/, core/, BakeShape, /routes, /stats, ProfileWriter, FramePublish and the region bake;
  - `perf-device.py`'s arguments, the grading in `perf-p10/p11/p12/p14.py`, and `settle.ps1`.
- **New tools:**
  - `perf-p16.py` (rule and readings), a new copy of `perf-p14.py`;
  - `perf-p16-diff.py`, the pixel-proof summary.
- **Device at the end:**
  - The owner's `dev.deathride.tv` was in front before and after: the same task t330, activity record a03c5a7 and
    process 14337. Task size was 4, and the package was last updated 2026-10-06 23:44:23.
  - `dev.deathride.perf` was force-stopped.
  - The restore intent was delivered to the running top-most instance.
  - Both mixers were in standby (`device-state.json`).
  - The copied `ws` module was removed.

## Card figures (for the optimize ledger)

- **Merge the three HUD font pages and the UI atlas into fewer texture pages: declined (P16).**
  - Built, proved and measured, then reverted (12390e79, feebc1ff; reverted 8443a99f).
  - HUD flushes 3 -> 2 in every active race frame. hudDraws 6 -> 5. drawCalls -0.77 and textureBinds -0.79 per frame.
  - Font textures 5 -> 2 MiB.
  - Text pixel diff 0 in 6 Stick captures (2 lobby, 4 race). Scenery bakes byte-identical on 4 courses.
  - hudMs mean not shown under the fixed rule: fonts 1.166 / 1.616 ms against base 1.182 / 1.183 (fonts-run2 slow in
    every phase). p95: base beats fonts (1.874 / 2.309 against 1.727 / 1.758).
- **Retain the static HUD frame/panel layer as one textured quad: declined (P16).**
  - Built and measured, then reverted (42833cd9; reverted 7dabb5c0).
  - The pixel gate fails. 6,729-6,921 pixels differ per race frame, 337-409 of them by more than 1 (max 30). Every one lies
    within a pixel of a nine-patch seam, frame edge or icon edge, under the Stick's 2x MSAA.
  - hudMs 1.036 / 1.039 ms: it beats fonts (1.166 / 1.616) and base (1.182 / 1.183), -0.145 ms against base.
  - Flushes not lower (2), owned textures +3.31 MiB.
- **Lane C, open: the early-probe Wi-Fi delivery stall** (P15's card, section 9 ruling 4). P16 adds two more bursts: 7 + 7
  inputs at 203.9-205.6 s and 6 + 6 at 65.0-66.6 s, at receive ages of 251-282 ms. The second burst is outside the 4.7-6.0 s
  window seen so far.

## Questions

1. **Card 1 met its card's own claim and gate** (flushes down, text diff 0, 3 MiB less) and failed only the brief's hudMs
   rule, on one valid run that was slow in every phase. Should it be re-landed (`git revert 8443a99f`), or re-graded with
   a settled pair?
2. **Card 2's CPU gain is real** (-0.145 ms hudMs against base, both runs), but a texture bake cannot be pixel-exact under
   2x MSAA. Do you want a new card for a pixel-exact form? It would retain the chrome's vertices (the same quads, the same
   atlas page and the same MSAA rasterization, copied into the batch each frame instead of rebuilt) and needs no texture.
