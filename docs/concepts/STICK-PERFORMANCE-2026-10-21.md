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
