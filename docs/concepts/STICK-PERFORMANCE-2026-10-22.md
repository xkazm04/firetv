# Stick performance: the landing's ambient animation (2026-10-22)

Operator, 2026-10-22: the lamp move is not the largest issue; the animation each module draws on the landing is too heavy. This pass follows [STICK-PERFORMANCE-2026-10-21.md](STICK-PERFORMANCE-2026-10-21.md). Same stick (AFTKM), same harness (`tools/stick-perf/`).

## What was measured

Idle landing, 5 s, per second of trace (`CrRendererMain` busy, `RenderThread` draw):

| Module | Before | After |
|---|---|---|
| Math Buddy | 243 ms draw, 332 ms main, 53 fps | 81 ms draw, 170 ms main, 15 fps |
| Linga | 553 ms draw, 439 ms main, 50 fps | 169 ms draw, 282 ms main, 15 fps |
| Essay Master | 177 ms draw, 220 ms main, 50 fps | 63 ms draw, 90 ms main, 15 fps |

**The cause.** Any running animation keeps the whole scene drawing at every vsync, however little it moves. With every looping animation and the motes switched off the stick draws about 8 ms a second; with one cloud drifting it draws 60 frames a second, and a frame costs about 4 ms on Essay Master and 11 ms on Linga (many promoted layers). Disabling one animation class at a time changed nothing, because the next one kept the frames coming. The motes on their own were not the cost.

**Stepping did not help.** `animation-timing-function: steps(n)` on a 0.05 s grid, with delays on the grid and every start time pinned to the document origin, still drew about 50 frames a second: a running animation asks for a frame whether or not its value changed.

## The change

`desk/src/landing/themes/paper/Paper.tsx` ("the ambient clock"): after each world swap every looping CSS animation under the landing is paused and set to the document timeline's time by one `setInterval` of 66 ms, and the motes draw on the same tick. The scene is drawn 15 times a second. The keyframes, easing and delays are the CSS ones; reduced motion is unchanged (CSS turns the animations off). The title's fitted size is cached per name once the fonts are loaded, so a lamp move no longer reads `document.fonts.ready` and `offsetWidth` (a forced style and layout pass: the JS task of a move fell from 127 to 40 ms).

## The bottom bar (shelf): GPU raster per lamp move 590 to 320 ms

The owner saw the landing smooth with the bottom bar out of the picture and laggy with it in, and asked for the bar to be checked. It is a real cost: with the shelf hidden a lamp move rasters about 175 ms; with it, about 590 ms. A move changes the shelf (the caption, the tile that grows, the Continue button's colour), and every change re-rastered the 1920 x 1080 ledge layer it was painted in, with the paper's wide blurred shadow and the tiles' glow shadows. Measured on the stick (4 moves each, GPU raster per move, `tools/stick-perf/` plus a per-move sum of `RendererRasterWorker`):

| Shelf | GPU raster per move |
|---|---|
| as it was | about 590 ms |
| tile windows promoted to layers | about 490 ms |
| + caption, buttons and paper promoted | about 450 ms |
| + only transform and opacity animate (no filter, box-shadow or colour transitions) | about 235 ms |
| shelf hidden (reference) | about 175 ms |

Kept: the last row, in `design/desk-landing.css` (`will-change` on `.pp-ledge-paper`, `.pp-cap`, `.pp-win`, `.pp-cont`, `.pp-else`; the tile windows transition transform and opacity only, the buttons transform only). The tile's saturation, shadow and the Continue button's colour now switch at once, not over 0.3-0.5 s. On the stick after the change: about 320 ms of raster per move. The look is the same at rest.

What it did not change: the first frame after the key (one 250-280 ms draw that waits on the GPU) is the same. That frame is the world swap: showing only the leaving world reproduces it, and removing the leaving world takes it to about 90-170 ms. Tried without effect on that frame: building the arriving world a layer at a time, fading the leaving world as a set, a crossfade, hiding the title, sky or grain.

## The outgoing world is dropped (kept)

On a lamp move the old world no longer slides out (`Paper.tsx` keeps no `prev`). Longest gap over 2 moves, 3 runs: 191-281 ms before, 174-180 ms after. The new world still slides in.

## What did not move the needle (measured, not kept)

- Pausing the loops only during a lamp move.
- Stills for the heroes' static parts (staircase, figure, key board, paragraph stack, page, pencil): GPU raster per move stayed about 600 ms. Reverted.
- Flattening the leaving world (22 Oct, evening): (1) keying each world by its id so the old world's rastered DOM is reused instead of re-mounted as the leaving set; (2) animating the leaving set as one element with its layers static. Longest gap over 2 lamp moves, 3 runs each, same stick: base 191-281 ms, reuse 215-249 ms, one-element 270-277 ms. No gain; not kept.
- A crossfade instead of the sliding layers, no stagger, no `will-change`, no title, no grain, no shadows: each within noise of the 250-300 ms start-of-move freeze.

## Left open

- The 250-300 ms freeze at the start of a lamp move is the arriving screen's style, layout and GPU raster (about 600 ms of raster per move). Hiding the whole shelf cut raster to about 200 ms in one run, but the per-element follow-ups did not reproduce, so the shelf's cost is not attributed to a single piece.
- 15 fps ambient motion: the slowest loops (clouds, bobs) read as smooth; the fast ones (voice bars, bell) step. The clock is `AMBIENT_MS` in `Paper.tsx`.
- `window.mjs`'s "fps in the 1.2 s window" now counts the ambient clock's 15 frames too, so it reads lower than before for the same transition; compare the longest gap.

## Pass of 23 Oct (night): the ambient clock, the pairing card, the Select curtain

Same stick, a production build (`next build --webpack`) on its own port through `adb reverse`, the film's open state (Nell seated, no phone paired). Each hold took the shared stick lock and gave the stick back to the desk it was on. A run is 4 lamp moves (right, right, left, left); per move, in the 1.2 s after the key: the longest frame gap, the GPU raster (the union of `RendererRasterWorker` slices on the GPU thread) and the page's main thread (`ThreadControllerImpl::RunTask` on `CrRendererMain`). 3 runs = 12 moves.

| Build | Longest gap, median / max | Raster per move, median | Main thread per move, median |
|---|---|---|---|
| main (a380b2d6) | 173 / 201 ms | 327 ms | 830 ms |
| + the clock no longer reads `playState` (kept) | 160 / 179 ms | 337 ms | 614 ms |

**Where a move's time goes now.** One draw about 200 ms after the key waits about 180 ms on a sync token (the arriving world's raster), and a second one about 450 ms after the key waits about 115-165 ms (more of the same batch). The page's own work in the move is one 70 ms task (React commit, 33 ms of style). Before this pass, every 66 ms tick of the ambient clock also cost about 25 ms of main thread: `Animation.playState` on a CSS animation flushes style, and each `currentTime` set made the next read flush again. The tick now sets the list it built at sync.

**Kept:**
- the clock fix above (`Paper.tsx` `ambientTick`);
- the pairing postcard is 472 x 448 at x 1352, top 196 (was 556 x 540 at x 1246): the unpaired title is fitted to x 160-1220, so the card stands about 120 px clear of every name at 1920 x 1080; the code is 124 px (was 136) and the address 30 px;
- the Select curtain (`.pp-flood`) is opaque on its first frame instead of growing as a `clip-path` circle, which the stick drew on the main thread at a few frames a second (the film showed 3-4 frames of a half-grown curtain over the landing). Select into Math Buddy and Back, 3 runs each, grow vs flat: longest gap on Select 265-299 vs 269-292 ms, on Back 280-318 vs 283-293 ms; GPU raster on Select 585-660 vs 508-621 ms.

**Tried and dropped (measured on the stick):**
- Every app's world kept mounted, the hidden ones parked at opacity 0 with `will-change: opacity` so a move only shows a world already rastered. Raster per move 337 to 288 ms, but the longest gap did not move (median 159, max 187 ms) and GL memory at rest rose to 143 MB against the WebView's 160 MB hard limit. The arriving world still waits about 175 ms on raster: a parked layer is rastered at rest and rastered again once its slide-in animation starts. Parking the layers on a paused copy of the slide-in animation (so they are "animating" while parked) did not change it either.
- The title animated as one element instead of letter by letter: longest gap within 5-15 ms of the base, inside the noise.
- The shelf, a piece at a time (CSS laid over the page, one run of 4 moves each): with the whole rail of tiles hidden the gap falls to 105-140 ms and raster to about 255 ms, so the rail is the shelf's cost; hiding the caption, the actions, the tile filter, or giving each tile name its own layer moved nothing. Taking the tiles' box-shadows and filter off saved about 45 ms of raster. Moving the tile's shadow and the lamp's rings onto two layers under the window (so a move changes only transform, opacity and filter) saved about 30 ms of raster in one run, and with `contain: strict` on the world layers, the shelf and the chrome, a 3-run build measured longest gap 163 / 214 ms and raster 328 ms: no better than the clock fix alone. Not kept.
- No `will-change` on the world layers: raster per move rose to 360-495 ms.

**Left open:** the arriving world's raster (about 300 ms over two draws) is still the freeze, and the rail of tiles is the largest piece of it after the world. The 15 fps ambient clock is unchanged; ticking the fast loops (voice bars, bell) faster would draw the whole scene at that rate again, which is a cost to weigh, not a fix.
