# Stick performance, pass 2: module switching (2026-10-21)

The operator's order (standup, 2026-10-21): "fps is good, but switching between study desk modules is still one big lag." This pass follows [STICK-PERFORMANCE-2026-10-20.md](STICK-PERFORMANCE-2026-10-20.md), which fixed idle fps and left consumer #4 open: a 0.4–0.7 s stall at the start of each lamp move, Select and Back.

**In one line:** the stall's main cause is GPU raster, not DOM or JavaScript. On top of that, the stage's `scale(.5)` makes the stick raster every composited layer at 4× its pixels. That overflows the WebView's tile budget and adds a second 0.6–0.8 s freeze about 1 s after each lamp move. A fix that removes this (fitting the stage with `zoom`) was built, measured and **dropped**, because it changes text antialiasing (PSNR 26–35 dB). The decision goes to the operator. The one change kept (making the grain tile once) does not shorten any stall. **The acceptance criterion (a shorter stall on lamp moves, Select and Back) is not met.**

## Method

- **Stick and harness:**
  - the stick is AFTKM at `10.0.0.139:5555` with `dev.studydesk.stick`;
  - the harness is `tools/stick-perf/` (`perf.mjs`, `scenarios.sh`, `window.mjs`). `window.mjs` now also takes `WIN=2000`.
- **Temp desks:** four, run from copies of the branch under `C:/tmp/dp21/` with their own `npm ci` and `DESK_DATA_DIR`. They were reached through `adb reverse`:
  - main, production, on `127.0.0.1:3128`;
  - main, dev (`next dev --webpack`), on `localhost:3127`;
  - the branch, production, on `127.0.0.1:3138`;
  - the branch, dev, on `localhost:3137`.

  The operator's `:3000` desk was never touched. All stick input ran under the shared lock (`kit/lock.sh`).
- **Meters:**
  - the 1.2 s window after each keydown (longest frame gap, frames, gaps > 33 ms);
  - a 2.0 s window as well, because a lamp move's second freeze starts about 1.0 s after the key, at the edge of the 1.2 s window.

  For Select and Back, a still module or landing draws no frames, so in the 2.0 s window the longest gap includes idle stillness. The 1.2 s figure is the one to read there.
- **Attribution:**
  - with `EXTRA_CATS=disabled-by-default-cc.debug`, cc snapshots give each tile's GPU memory, contents scale and out-of-memory flag (`kit/mem.mjs`), and raster tasks per layer (`kit/rast.mjs`);
  - the GPU thread's time is split per 100 ms (`kit/sum.mjs`, `kit/tl.mjs`);
  - suspects were switched off one at a time with CSS laid over the live page (`kit/exp2.sh` for the lamp set, `kit/exps.sh` for Select).
- **Look:**
  - stills on the stick with every animation, the motes and the intro frozen by the same override on both builds (`kit/look.sh`);
  - PSNR with ffmpeg;
  - two captures of the same build read 69–93 dB, so the method is stable.

## What the stall is (attribution)

- **GPU raster, on one thread.** A lamp move rasters about 0.95–1.2 s of GPU work: `RendererRasterWorker` ≈ 1.0–1.1 s per move, of which:
  - Skia flush 0.6 s;
  - paint-op deserialising 0.3 s;
  - new tile textures 0.15–0.2 s.

  The page's main thread is 0.1–0.15 s. The first frame after the new tree activates waits (`WaitSyncToken`) for that batch.
- **The 4× raster-scale floor.** cc rasters a `will-change` or animating layer at contents scale ≥ 1. Under the stage's `scale(.5)` that is twice the needed resolution on each axis. Measured at rest on the Math Buddy landing:
  - the sky layer: 49 MB of tiles;
  - the whole landing: 107 MB, against a WebView policy of 80 MB soft and 160 MB hard (`hard_memory_limit_in_bytes` 167772160).

  During a move, cc reports `had_enough_memory_to_schedule_tiles_needed_now: false`. It shows the arriving world partly rastered. When the leaving world is dropped (0.72 s), it rasters the sky (19 tiles), the heroes and the hills again. That is the second freeze: 625–846 ms, 1.0–1.9 s after the key.
- **What is not it:**
  - Select's `.pp-flood` clip-path: hidden, the Select stall was 448–466 ms against 459–481;
  - the zoom overlay as a whole: 440–470 ms;
  - the shadows (all off: −150 ms of about 620 under the zoom fit);
  - the art animations (−90 ms);
  - the title (−30 ms);
  - DOM size (174 SVG nodes per world).

  No single world piece dominates. Switching each off, under the zoom fit, saved:

  | Switched off | Saved (ms) |
  |---|---|
  | hills | 175 |
  | heroes | 135 |
  | sky | 50 |
  | soft layer | 40 |
  | title | 30 |

  The leaving world adds about 180 ms (hidden: 407 against 590 ms). It is rebuilt under a new key, and its sliding layers bring new tiles into view.
- **Module entry:** Select's 0.4–0.5 s is the zoom overlay mounting and the shelf starting its transition. Both are rastered under the same 4× floor.
- **Chunk load:** none. `app/tv/page.tsx` imports every module statically, and in production the code is already loaded.
- **Back:** it rebuilds and rasters the whole landing (0.47–0.59 s of GPU). The grain's `toDataURL` is a GPU sync point on the main thread: it held 32–33 ms, and once 552 ms.

## Before / after per transition (stick, 1.2 s window, longest gap ms; fps in the window)

`before` is main (f8ba80f6). `zoom` is the dropped change (2474c807). `after` is this branch: the grain change only, after the revert. The production rows are scenario runs. Back and Select also have six repeated runs each (`kit/sb.sh`).

| Transition | prod before | prod zoom (dropped) | prod after | dev before | dev zoom (dropped) |
|---|---|---|---|---|---|
| Lamp right (1.2 s) | 402, 17.5 fps | 608, 21.3 | 428, 15.8 | 435, 13.3 | 536, 25.4 |
| Lamp left (1.2 s) | 394, 13.8 | 664, 17.5 | 374, 15.8 | 368, 14.6 | 584, 24.6 |
| Lamp right (2.0 s) | 736, 16.3 | 608, 26.0 | 757, 13.0 | 805, 9.8 | 622, 22.3 |
| Lamp left (2.0 s) | 724, 15.8 | 664, 27.3 | 684, 15.0 | 741, 10.8 | 690, 22.5 |
| Select → Math Buddy (6 runs) | 501–561 | 418–434 | 480–484 | 462 | 461–473 |
| Select → Linga | 373–393 | 405–460 | 425–429 | 385 | 348–371 |
| Select → Essay Master | 406–420 | 354–379 | 401–409 | 425 | 379–382 |
| Back from Math Buddy (6 runs) | 621–673 | 529–534 | 649–716 | 621 | 473–538 |
| Back from Linga | 660–667 | 567–620 | 651–718 | 649 | 492–539 |
| Back from Essay Master | 622–678 | 507–537 | 621–656 | 597 | 449–458 |
| Landing GPU tiles at rest | 107 MB | 71 MB | 107 MB | | |

Reading it:
- **The zoom fit** (dropped) shortened Back by about 100 ms and Select into Math Buddy by about 100 ms, and removed the lamp move's second freeze. The 2.0 s window fell from 724–736 to 608–664 ms, and the frames in it nearly doubled.
- With the zoom fit, the lamp move's first stall grew (1.2 s: about 400 → 600 ms). Without the out-of-memory state, cc waits for the whole world before it draws, so one 0.6 s freeze replaces two (about 0.4 and 0.7 s).
- **The branch as kept** is within run noise of main on every transition (±60 ms between runs).

## Look (stick, everything frozen, PSNR against main)

| Still | zoom fit (dropped) | after (kept) |
|---|---|---|
| Landing, Math Buddy | 25.9 dB | 30.4 dB |
| Landing, Linga | 35.1 dB | ∞ |
| Landing, Essay Master | 32.4 dB | 105.9 dB |
| Math Buddy home | 27.9 dB | ∞ |
| Linga home | 27.8 dB | ∞ |
| Essay Master home | 28.5 dB | ∞ |

- **The zoom fit:** side by side the pictures match. The amplified difference is every glyph's antialiasing and a 1 px shift of the title, which is beyond animation phase. That is why it was dropped.
- **The kept build:** five stills are identical. The Math Buddy landing's 30.4 dB was not explained within this run. The grain tile is identical by construction (seeded), and the Linga and Essay landings, which carry the same grain, read ∞. A retake of that still is owed.
- Files:
  - `look3/{before,after,final}-*.png` (`after` = zoom fit, `final` = this branch);
  - `look2/diffrgb-landing-maths.png` (the zoom fit's ×6 difference);
  - `look3/diffhalf-maths.png` (the per-layer variant below).

## What was cut

| Commit | What | Effect |
|---|---|---|
| 7540a5df | `window.mjs` takes `WIN=2000` | Scores the second freeze |
| 579fb3ed | The paper grain tile is made once per page load | Main thread in the 0.6 s after Back: 239–735 → 168–250 ms; readback 32–552 → 0 ms. Window: within noise |

## Tried and dropped

- **Fitting the stage with `zoom` instead of `scale()`** (2474c807, reverted by 54a847bc). The numbers are above. It is the real fix for the 4× floor and the out-of-memory double raster, and the look check fails it. **Operator decision:** take it (text antialiasing within sub-pixels; the title 1 px off) or leave it.
- **Halving each world layer inside** (`.pp-layer` 1100 × 540 at `scale: 2`, the SVG at `zoom: .5`; CSS override only). Same memory effect (71 MB). Linga and Essay landings read 54–56 dB, but Math Buddy reads 26.8 dB: its shadows and the sun's blur regions scale differently. Dropped.
- **Splitting the arriving world over two commits** (front layers after the back ones; two variants). No effect. The first frame after activation waits for the GPU batch either way, and the GPU is busy about 75 % for the whole 1.6 s.
- **Keying each world set by its app**, under the zoom fit: 566–571 against 589 ms, with more GPU raster (1.03–1.23 s against 0.90–1.06 s). The leaving world's sliding layers raster new tiles anyway. Not kept.
- **Animation delays on the arriving layers** (CSS): no effect. cc rasters a layer at mount whatever its opacity.
- **A compositor-only Select reveal:** not built. The flood is not the stall (measured above).

## Left open

- **The operator's call on the zoom fit:** the look rule against the second freeze and 36 MB of GPU tiles.
- **The per-move raster itself (≈1 s of GPU per lamp move).** Only not rastering again would remove it, for example:
  - pre-rendered bitmaps for the still parts of each world (sky, hills, side cliffs) drawn into canvases. A canvas is a texture layer, with no tile raster;
  - or keeping rastered worlds. That does not fit: one world is about 54 MB of tiles under the zoom fit, against an 80 MB soft budget.

  Both are L and need their own look check.
- **Back rebuilds the landing.** Keeping it mounted under the modules would save the main-thread mount (about 150 ms). The raster remains. Not built.
- **The Math Buddy landing's 30.4 dB on the kept build** needs a retake.
- `stick-app/` (WebView DPR, `setInitialScale`) and anything under `desk/src/lib/` were outside this task's paths.

## Raw outputs (`artifacts/stick-2026-10-21-perf/`, gitignored)

- `before/{prod,dev}/`, `after-zoom/prod/`, `after-grain/prod/`, `after/{prod,dev}/` (`after/dev` ran the zoom build): `*.summary.json`, `*.gfxinfo.txt`, traces, `windows.json`, `windows-2000.json`.
- `look2/`, `look3/`: the stills and the differences.
- `kit/`: the scripts named above. The experiment traces stayed in `C:/tmp/dp21/` (`exp*/`, `dbg*/`, `sb-*/`).

## Pass 3: pre-rendered stills (2026-10-21, afternoon)

The base is main e9c62990: pass 2 plus the zoom fit, which the operator took outright. This pass takes the first item under "Left open" above: the GPU rasters each world's still parts again on every lamp move and every Back.

**In one line:** each world's sky, hills and side cliffs (and Linga's doorway and counter) are drawn once per page load into a canvas. The canvas sits in the layer's SVG through a `foreignObject`, and Chrome composites it as its own texture layer, with no tile raster. On the stick:
- a lamp move's longest frame gap fell from 641–669 ms to 271–283 ms, and its second freeze is gone;
- Back fell from 500–572 ms to 228–378 ms;
- Select fell into Math Buddy and Essay Master, and Linga is within noise.

The look is 45.7–46.6 dB against e9c62990 on the stick. The bitmaps take 36.9 MB.

### What was built

- **`desk/src/landing/themes/paper/stills/`.**
  - `Still.tsx`: `still(id, kind, d, node, sharp?)` declares a still at module scope. Until its bitmap is ready it renders live, exactly as the layer drew it before (a `pp-each` group, so each piece still casts its CSS shadow). After that it renders a `foreignObject` (`pp-flat`, so it casts nothing) that holds the canvas.
  - Baking: the node renders off-screen in a detached React root, is measured with `getBBox`, gets the layer's CSS shadow as an SVG `feDropShadow` on each piece the CSS would shadow, and is serialised. It is then rasterised once as an image into the canvas.
  - Once one still has mounted, every declared still is baked, one per idle callback. So the first move to another world finds its bitmaps ready.
  - On `contextrestored` a canvas is drawn again from its SVG.
  - `rules.ts` holds the pure parts:
    - the box a bitmap holds: the drawing plus what its blur reaches, clipped to the stage widened by the layer's whole slide, so no cut edge comes into view while a world slides;
    - the scale: half the device's for every kind, and full for `sharp` stills;
    - the shadow table mirrored from `design/desk-landing.css`;
    - the byte cost.
- **`worlds.tsx`.** These are stills:
  - Math Buddy: the sky (sun, protractor and dotted path), both hill layers, and the front hill and cliffs. The floating symbols on the front stay live.
  - Linga: the sky, with a night form that carries the moon (its stars twinkle live); both hills; the doorway with Robin (sharp); the counter (sharp; the bell rings live); and the front.
  - Essay Master: the sky, both hills with their trees, and the front.
  - The empty desk reuses the Math Buddy hills.

  Everything that moves or carries the session stays live: the staircase and its lit steps, the lantern, the clouds, the key board, the bubbles, the page and its bars, the loupe, and the paragraphs read.
- **Tests and tools.**
  - `tools/landing-stills-test.cjs` (9 tests) holds:
    - which layers are stills in each world;
    - that a still does not change with the session;
    - the boxes against each layer's slide;
    - the scale cap;
    - the shadow against the CSS;
    - a 40 MB ceiling for all of them.
  - `tools/stick-perf/pass3.sh` takes one measuring hold. It takes the lock and points the stick at a temp desk. Then it warms the landing, runs `scenarios.sh` or the look stills, and records `meminfo` and `window.__ppStills()`. Before it releases the lock, it puts the stick back on `10.0.0.141:3000` and checks the probe and the focus.
  - `tools/stick-perf/cdp.mjs` evaluates one expression in the stick's page.
  - `tools/stick-perf/look-desktop.mjs` takes the same stills on a desktop Chromium at the stick's geometry.

**The stick's scale.** The stick's WebView reports `devicePixelRatio` 4 on a 1920 × 1080 surface (`dumpsys SurfaceFlinger`: the app's buffer is 1920 × 1080). The first slice therefore measured 2 device px per stage px and drew Math Buddy's four stills at 40.6 MB. The scale is now capped at 1 device px per stage px.

**What did not work.** The look check above froze animations with a CSS override (`animation-play-state` plus a negative delay). That did not give the same frame twice: the drifting symbols landed in different phases. `look-desktop.mjs` and `pass3.sh` instead pause every animation through `document.getAnimations()`, finite ones at their end and endless ones at their start. Two captures of the same build then read ∞ / 88–99 dB.

### Before / after on the stick (prod builds, two scenario runs each)

`before` is e9c62990 on `127.0.0.1:3148` and `after` is this branch on `:3158`. Both are temp desks with copies of the same seeded data (Ema seated, the lamp on Math Buddy). The figures are the longest frame gap in ms, then the frames with a gap over 33 ms, then fps in the window. Each lamp row covers two moves.

| Transition | before (run 1, run 2) | after (run 1, run 2) |
|---|---|---|
| Lamp right, 1.2 s window | 641 / 4 / 17.5, 655 / 3 / 19.1 | **271** / 6.5 / 32.0, **283** / 7 / 31.3 |
| Lamp left, 1.2 s window | 658 / 3.5 / 16.3, 669 / 3 / 19.2 | **275** / 5 / 30.0, **282** / 6 / 31.6 |
| Lamp right, 2.0 s window | 641 / 5.5 / 25.0, 655 / 4 / 25.8 | **271** / 6.5 / 43.0, **283** / 7 / 42.3 |
| Lamp left, 2.0 s window | 658 / 4.5 / 27.0, 669 / 4.5 / 27.3 | **275** / 5 / 41.8, **282** / 6 / 43.0 |
| Select → Math Buddy | 461 / 6 / 17.5, 428 / 6 / 19.2 | 364 / 7 / 21.7, 343 / 6 / 23.3 |
| Select → Linga | 396 / 6 / 15.0, 459 / 5 / 13.3 | 448 / 7 / 19.2, 265 / 9 / 25.0 |
| Select → Essay Master | 371 / 7 / 22.5, 366 / 6 / 28.3 | **208** / 8 / 33.3, **214** / 7 / 34.2 |
| Back from Math Buddy | 513 / 3 / 27.5, 518 / 3 / 27.5 | 367 / 3 / 36.7, 378 / 3 / 36.7 |
| Back from Linga | 572 / 4 / 15.8, 500 / 5 / 18.3 | **305** / 3 / 35.8, **261** / 4 / 35.8 |
| Back from Essay Master | 514 / 3 / 21.7, 517 / 3 / 21.7 | **276** / 3 / 35.8, **228** / 3 / 35.8 |

Reading it:
- **A lamp move** no longer stalls twice. The 2.0 s window's longest gap is now the 1.2 s one, so the second freeze is gone, and the frames drawn nearly double.
- **More gaps over 33 ms after.** The count is slightly higher because the stick now draws through the move instead of standing still in one long freeze.
- **GPU work, per scenario run** (`Chrome_InProcGpuThread`, from each summary):
  - the two lamp moves: 3.13–3.39 s → 2.20–2.34 s, of which `RendererRasterWorker` is 1.92–2.11 s → 1.28–1.33 s, about 1.0 → 0.65 s a move;
  - each Back: 1.06–1.23 s → 0.70–0.92 s;
  - Select: Math Buddy 1.22–1.31 s → 1.02–1.03 s, Essay Master 0.87–0.98 s → 0.82–0.85 s, Linga 0.81–0.85 s → 0.78–0.85 s.
- **What still rasters:** the live layers (heroes, clouds, the title) and the module's own screen.
- **The noise:** Select into Linga reads 265–448 ms after against 396–459 ms before. That is within run noise.
- **The intermediate build.** The Math Buddy-only slice (`after-maths/`) measured before the scale cap. It already took Back from Math Buddy to 360 ms and Select into it to 368 ms. Its lamp moves were unchanged, because the Linga and Essay worlds were still live.

### GPU memory

- **The bitmaps** (`window.__ppStills()` on the stick, 15 stills): 36.9 MB.
  - Each sky is 1288 × 620 (3.0 MB): Math Buddy, Linga by day and by night, and Essay Master.
  - Each world's two hill layers take 1.8–2.2 MB each, and its front 2.9–3.2 MB.
  - Linga's doorway and counter, drawn sharp, take 1.9 and 2.0 MB.
- **The app's GPU memory** (`dumpsys meminfo`, GL mtrack, MB):

  | When | before | after |
  |---|---|---|
  | On the landing after the warm-up round trip | 124.8, 124.8 | **119.8, 119.8** |
  | After the whole scenario (three modules visited, back on Essay Master's landing) | 141.4, 148.4 | 194.2, 185.4 |

  Reading it:
  - At rest, the stills cost less than the tiles they replace.
  - After the modules, the app holds 37–53 MB more than before. Not attributed in this pass. The likely cause is that each canvas that has been shown keeps a second (front) buffer for the compositor, which would double up to 36.9 MB. That is a follow-up (below).
  - The cc tile budget (80 MB soft) no longer holds these layers at all.

### Look (PSNR against e9c62990, every animation paused at the same frame, motes hidden)

| Still | stick | desktop at the stick's geometry |
|---|---|---|
| Landing, Math Buddy | 46.6 dB | 45.9 dB |
| Landing, Linga | 45.9 dB | 42.5 dB |
| Landing, Essay Master | 45.7 dB | 45.1 dB |

- The differences are edge antialiasing only, along the hills' rims and the cliffs. Side by side the pictures are the same.
- On the desktop, drawing every still at full resolution read 48.7 dB for Math Buddy against 47.4 dB at half, for 33 MB against 9.7 MB. That is why half resolution is the default.
- Linga's doorway at half resolution softened Robin's face (41.1 dB), so the doorway and counter are drawn sharp.

**The Math Buddy retake (owed from pass 2).** Two captures of the e9c62990 landing on the stick, minutes apart:

| Still | PSNR |
|---|---|
| Math Buddy | 99.3 dB |
| Linga | 87.9 dB |
| Essay Master | ∞ |

So the landing captures stably. Pass 2's 30.4 dB on the kept build does not reproduce under the frozen-animations method. It was most likely a drifting symbol's phase under the CSS freeze.

### Still open

- **Memory after the modules:** 37–53 MB more GL mtrack than before. Candidates:
  - a single-buffered canvas (`bitmaprenderer` with `transferFromImageBitmap`), or an `<img>` of a blob, if either still composites as its own layer;
  - dropping the bitmaps that are not on screen while a module is up.

  Measure GL mtrack after each.
- **What still rasters on a lamp move** (about 0.65 s of GPU): the live hero layers and the clouds. The staircase (Math Buddy) and the page (Essay Master) carry the session. They could be keyed stills on their state, but that is per-state memory.
- **Back rebuilds the landing.** The bitmaps are reused, but the live layers raster again. Keeping the landing mounted under the modules would need `Paper.tsx` or `app/tv/page.tsx`, which this pass did not own.
- **The first lamp move after a page load** bakes the stills in idle time. A very fast first move can still find a world live. Not measured.
- **`tools/landing-stills-test.cjs` is not in `desk/package.json`'s `rulesSuites`.** That file was outside this pass's paths. Run it directly until it is listed.

### Raw outputs (`artifacts/stick-2026-10-21-perf3/`, gitignored)

- `before/`, `before2/`, `after/`, `after2/`, `after-maths/`: `scenarios.sh` traces and summaries, `windows.json`, `windows-2000.json`, `meminfo-rest.txt`, `meminfo-end.txt`, `stills.json`, `restore-probe.txt` (the stick back on `10.0.0.141:3000` with the app in focus after each hold).
- `look-before/`, `look-before2/`, `look-after/`: the stick stills. `look-desktop/`: the desktop stills, the ×10 differences and the per-still stats.
