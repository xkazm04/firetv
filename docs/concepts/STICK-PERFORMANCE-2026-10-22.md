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

## What did not move the needle (measured, not kept)

- Pausing the loops only during a lamp move.
- Stills for the heroes' static parts (staircase, figure, key board, paragraph stack, page, pencil): GPU raster per move stayed about 600 ms. Reverted.
- A crossfade instead of the sliding layers, no stagger, no `will-change`, no title, no grain, no shadows: each within noise of the 250-300 ms start-of-move freeze.

## Left open

- The 250-300 ms freeze at the start of a lamp move is the arriving screen's style, layout and GPU raster (about 600 ms of raster per move). Hiding the whole shelf cut raster to about 200 ms in one run, but the per-element follow-ups did not reproduce, so the shelf's cost is not attributed to a single piece.
- 15 fps ambient motion: the slowest loops (clouds, bobs) read as smooth; the fast ones (voice bars, bell) step. The clock is `AMBIENT_MS` in `Paper.tsx`.
- `window.mjs`'s "fps in the 1.2 s window" now counts the ambient clock's 15 frames too, so it reads lower than before for the same transition; compare the longest gap.
