# Stick performance: smooth UX, same look (2026-10-20)

Operator order, 20:2x: the white frame is gone (STICK-WHITE-FRAME-2026-10-20.md), but the stick runs badly. Find what costs the most frames, mostly in the animations, and remove those bottlenecks while the look stays. This doc covers the method, what was measured, what was cut, what was tried and dropped, and what is left.

**Where things are.**
- The probe, the run order and the window meter are committed in `tools/stick-perf/` (`perf.mjs`, `scenarios.sh`, `window.mjs`).
- The raw outputs are under `artifacts/stick-2026-10-20-perf/`, which the repo's `.gitignore` keeps out of git. They are in this branch's worktree and copied to the headless run's directory (`personas/.claude/master/firetv/headless/runs/fd35672f-…/artifacts-stick-2026-10-20-perf/`): summaries, gfxinfo, the window scores, the lamp-right traces, the captures and the helper scripts (`kit/`).
- Paths below without a prefix are relative to that folder.

**In one line:** the landing ran at 8.7 fps even standing still, because every world layer's CSS `drop-shadow` sat on a composited layer and the stick's GPU blurred about eight full-stage offscreen passes on every frame. With the shadows cast inside the drawing, the idle landing runs at 55 fps (dev) and 59 fps (production), with the same picture. Lamp moves and Back went from 6–7 fps to 22–45 fps over the run, and a bug that replayed each world's entrance 0.72 s after every lamp move is fixed. What is left is one 0.4–0.7 s stall per transition, while the stick builds and rasters the arriving screen.

## How it was measured

- **The stick.** AFTKM at `10.0.0.139:5555`, Amazon WebView 150 (`150.amazon-webview-v150-7871-tv`), the `stick-app` debug APK as installed. `stick-app/` was not changed and not rebuilt. The stick was left on `10.0.0.141:3000` at the end (`shared_prefs/stick.xml`: `desk = 10.0.0.141:3000`), and the adb reverse and forward entries were removed.
- **Two temporary desks, never the operator's.** The worktree's `desk/node_modules` is a junction to the main checkout's. That one is incomplete (`@next/env` is missing; see "Left open"), so `next` cannot start from it. The temp desks ran from a copy of this branch's `desk/` at `C:/tmp/deskperf/`, with their own `npm ci`, outside the repo:
  - `next dev --webpack` on :3117;
  - `next build --webpack` + `next start` on :3118.
  Each had its own `DESK_DATA_DIR` in a fresh temp dir (Ema and Jakub, the demo profiles of a fresh session). Ema was seated and a phone joined (`learner.set`, `join`, posted as the TV), so the landing shows the paired layout.
  The stick reached the desks through `adb reverse`, with one `am start --es url` carrying each desk's TV link. Dev was on `localhost` and production on `127.0.0.1`. The desk's `desk-tv` cookie is per host, not per port: on one host the two desks overwrote each other's cookie, and the stick's heartbeat then showed its own "not its TV yet" screen over the page. Three production runs taken that way were thrown away.
  The operator's desk on :3000 was never stopped, restarted, read, written or driven.
- **One run** (`tools/stick-perf/perf.mjs <name> <dir> <steps>`) does four things:
  1. resets `dumpsys gfxinfo dev.studydesk.stick reset` and starts a Chrome DevTools trace of the stick's WebView (over `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>`);
  2. presses the remote's keys with `adb shell input keyevent`;
  3. saves `gfxinfo framestats`, the gzipped trace and a summary;
  4. counts each frame the WebView draws as one `DrawFn_DrawGL` on the app's RenderThread.
  Before trusting `input keyevent`, it was checked: a key the page ignores costs nothing (57.8 fps with two F12 presses, 59.3 fps without, `experiments/inj-*.summary.json`).
- **The scenario** (`tools/stick-perf/scenarios.sh`) runs in order on the landing with the lamp on Math Buddy:
  - idle 5 s;
  - lamp Right Right, then Left Left;
  - Select into Math Buddy, idle 5 s, Back;
  - the same for Linga and Essay Master.
- **Two meters.**
  - *Whole run*: fps, the frame gap p50/p90, and gfxinfo's own p50/p90/p99 and janky %.
  - *Transition window* (`tools/stick-perf/window.mjs`, recomputed from the saved traces): the 1.2 s after each key reaches the page (the trace's `keydown` EventDispatch). It records frames drawn, the longest gap between two frames, and how many gaps passed 33.4 ms (two vsyncs).
  The whole-run numbers hide a single long stall among many fast frames, and one wrong decision was made on them (see "Tried and dropped"). The window is the honest meter for a transition.
- **gfxinfo's janky %** stays high on many screens after the fix. On this WebView, gfxinfo times the app's draw functor against its own deadline, and most functor frames miss it even at 60 fps (Math Buddy's idle home: 60 fps, 43 % janky in dev). The trace's frame gaps are the meter used here; gfxinfo is kept raw for reference.
- **Experiments** lay one CSS override over the live page through DevTools (`C:` steps), then measure 5 s idle or the lamp set. They switch one suspect off at a time. The override was cleared and the page reloaded between the experiments and the real runs.
- **The look** was checked in desktop Chromium (Playwright, 1920 × 1080, `kit/look.mjs`). All animations were frozen and the motes hidden, and each world was rendered under the new shadows and under the original layer-level shadows (laid back on by an override). Each pair was compared by PSNR and by a 12× amplified difference. Stills and a short recording from the stick are in `before/captures/` and `after/captures/`. Both sets were taken on the production desk, with the same steps (`kit/stills.sh`).

## The ranked consumers

Measured on the stick, the largest first:

| # | Consumer | Evidence | What it cost | Fixed? |
|---|---|---|---|---|
| 1 | **Each world layer's CSS `drop-shadow` on a composited (`will-change`) 2200 × 1080 layer.** The compositor drew each one as an offscreen pass with a blur, on every frame, for about eight layers at a time. | Idle landing with the shadows off: 8.7 → 55.3 fps. `will-change` off: 9.0. Motes off: 8.8. All animations paused: 8.7. Grain off: 8.7 (`experiments/`). Trace: `DrawFn_DrawGL` ~30–41 ms per frame on the RenderThread, waiting on the GPU. | The idle landing ran at 8.7 fps, frame gap p50 117 ms, gfxinfo p50 200 ms. Every landing transition ran at 6–7 fps throughout. | Yes, ef517a98, 1ffd697c, 46b5314a |
| 2 | **The lit world played its entrance a second time 0.72 s after each lamp move.** When the leaving world was dropped, the mode was re-read as `fade`. The world dropped 90 px, went transparent and rose again. | Desktop Chromium: `pp-in` 0–0.7 s, then `pp-up` 0.72–1.3 s (`kit/refade.mjs`). On the stick, with that replay switched off by an override, the lamp moves' frame gap p99 went 433–603 → 234–271 ms. | A second whole-world animation per move, and most of each move's long stall. | Yes, 56f6ce93 |
| 3 | **A shadow on a group that Chrome splits across layers.** A drifting cloud or a swinging key is composited on its own, and so is everything painted over it. A shadow on a group holding one of those goes back on the per-frame path. | Essay Master's hill layer as one shadowed group: 29 fps; per piece: 58 fps. Math Buddy's front hill and its side cliffs as one group: 40 fps; per piece: 55 fps. Linga's bubble+note and bell+counter groups: 42 fps; per piece: 53 fps. | 13–29 fps on the idle landing after cut #1. | Partly: see "The look, and the one trade-off" |
| 4 | **Building and rastering the arriving screen** on each lamp move, Select and Back: the world's DOM, its style and layout, then its vector raster on the GPU. | Lamp moves with the worlds hidden: longest gap 0.11 s; with them: 0.36–0.46 s (production). It barely moves with every shadow off (0.43–0.53 s) or the hills hidden (0.46 s). It is the vector content and the DOM, not the blur. | One 0.4–0.7 s stall at the start of each transition. | **No, left open** |
| 5 | **`next dev`** (React's development build, dev-only checks, the dev overlay's backdrop-filter button). | After the fixes, production vs dev, fps over the run: lamp 29 vs 22, Back from Linga 38 vs 32, Back from Essay Master 44 vs 38, idle landing 59 vs 55. Dev's lamp move has one 320–370 ms React task (`jsxDEV` alone ~180 ms); production's is ~150 ms. | 10–30 % of a transition's frames. | A choice for the operator; see "Dev vs production" |
| 6 | **The sky rect: 4800 × 2800 per world**, a 9600 × 5600 px layer on the stick. | Dev, the sky layers hidden altogether: lamp moves 22.9 → 29.0 fps. Production, the rect cut to the stage: within run noise. | Raster and GPU memory, mostly off-stage. | Cut, 75e4e9f5 |
| 7 | **The art animations inside the SVGs** (keys, wave bars, typing dots, hooks, bell, bubbles, drifts). They tick on the main thread with an SVG relayout and repaint each frame (invalidation tracking: 176 key and bar recalcs in 1.5 s). | Linga's idle landing, all art animations paused: 37.5 → 48.6 fps (before cut #3's final form). They make no difference to the transition stall (#4). | A few fps on Linga's landing. | No, left open |
| — | Not costly, measured: `will-change` left on, the motes canvas, the paper grain, the title's seven text-shadows, the caption's entrance, the shelf's transitions, and `adb shell input keyevent` itself. | Each within 1–3 fps or 50 ms of the baseline (`experiments/`). | — | — |

## The changes

| Commit | What | Before → after (stick) |
|---|---|---|
| ef517a98 | Each world layer's shadow moves from the composited `.pp-layer` onto the SVG drawing inside it (`<g class="pp-cast">`), so it is rastered into the tiles once. The moving pieces of a hero or soft layer cast their own. | Idle landing, Math Buddy, dev: 8.7 → 54.6 fps, gap p50/p90 117/119 → 17/22 ms |
| 1ffd697c | The hills cast per piece too: Essay Master's trees over its hills had put its hill shadow back on the per-frame path. | Essay Master idle, dev: 28.8 → 57.3 fps |
| 46b5314a | One shadow per *object*. Parts that overlap are one `<g>`. A piece inside another's outline casts nothing (`pp-flat`: keys on the board, bars and dots in a bubble), as under the layer's one shadow. A piece that moves alone casts from its still children (`pp-each`: the drifts, the left bubble), so its blur is rastered once into its own small layer. | PSNR against the original shadows: Math Buddy 39.8 → 45.5 dB, Linga 40.6 → 46.0, Essay Master 42.3 → 46.5. Idle, dev: Math Buddy 55.6, Essay Master 57.9, Linga 42.6 fps |
| 75e4e9f5 | The sky rect is cut to the layer plus what a slide brings into view (2840 × 1320, 3.6× less area). The `.pp-sky` backdrop from the white-frame fix paints the same gradient past it. | Production lamp moves: within noise. Raster area and memory are smaller |
| 56f6ce93 | The lamp move's direction is kept in state, so the lit world does not turn `fade` and replay its rise 0.72 s after each move. | Lamp moves, production (fps / gap p99): 26.5 / 478–677 ms → 29–33 / 385–461 ms. That build also keyed the world sets by app, which measured the same on its own; it was not committed. |
| 475c5956, reverted by 9b950486 | Keep every app's world mounted. Dropped: see below. | — |
| 19024aaa | `next build` failed its type check on main: `app/api/analyse/route.ts` exported a constant that is not a route field. It is module-private now, and the production build passes. | — |

No logic changed in the session, the rules, the keys or the rows. The changes are the landing's look layer (`landing/themes/paper/`, `design/desk-landing.css`), its world-transition state in `Paper.tsx`, and one export, so no rule suite was added. `tools/tv-landing-test.cjs` is green (10/10).

## Screen by screen, transition by transition

`before` is main at 595b48f9; `after` is this branch. The raw outputs are in `before/{dev,prod}/` and `after/{dev,prod}/`: `*.summary.json`, `*.gfxinfo.txt` and `windows.json`, plus the lamp-right trace of each set (the other traces were kept local to keep the repo small).

### Whole run (production, `next start`)

| Run | fps | frame gap p50/p90 ms | gfxinfo p50/p90/p99 ms | gfxinfo janky % |
|---|---|---|---|---|
| Landing idle 5 s | 8.8 → **59.4** | 117/119 → 17/18 | 200/200/200 → 14/16/19 | 100 → 9 |
| Lamp right ×2 | 7.5 → **29.0** | 133/216 → 18/33 | 250/350/700 → 26/48/700 | 98 → 91 |
| Lamp left ×2 | 7.5 → **28.9** | 118/200 → 18/30 | 250/400/550 → 24/48/700 | 100 → 86 |
| Select → Math Buddy | 38.4 → 48.4 | 17/17 → 17/19 | 19/22/400 → 10/17/400 | 99 → 12 |
| Math Buddy idle | 60.0 → 60.2 | 17/19 → 17/19 | 12/18/22 → 13/19/23 | 19 → 19 |
| Back from Math Buddy | 17.2 → **47.4** | 18/117 → 17/18 | 12/200/700 → 14/16/600 | 38 → 12 |
| Select → Linga | 6.8 → **31.6** | 150/182 → 21/32 | 250/450/500 → 36/48/400 | 100 → 100 |
| Linga idle | no frames (a still screen) | | | |
| Back from Linga | 6.4 → **37.8** | 150/152 → 19/30 | 250/300/750 → 27/42/650 | 100 → 100 |
| Select → Essay Master | 5.7 → **16.3** | 117/519 → 17/111 | 150/250/400 → 19/89/400 | 69 → 62 |
| Essay Master idle | 2.8 → 2.8 (one small blink twice a second, nothing else moves; each frame 12–20 ms) | | | |
| Back from Essay Master | 7.3 → **44.4** | 129/152 → 17/18 | 200/250/550 → 18/20/600 | 93 → 51 |

### Whole run (dev, `next dev --webpack`)

| Run | fps | frame gap p50/p90 ms |
|---|---|---|
| Landing idle | 8.7 → **55.0** | 117/119 → 17/23 |
| Lamp right / left | 7.2 / 7.4 → **21.9 / 22.8** | 117/279 → 24/36 |
| Select → Math Buddy / Linga / Essay Master | 36.5 / 6.6 / 6.4 → 44.2 / 28.6 / 15.5 | |
| Back from Math Buddy / Linga / Essay Master | 19.2 / 6.3 / 7.2 → 44.9 / 32.2 / 38.2 | |
| Module idles | unchanged (Math Buddy 60.1, Linga no frames, Essay Master 2.8 blink) | |

### The transition window (the 1.2 s after the key)

| Transition | Production: fps, longest gap ms, gaps > 33 ms | Dev: fps, longest gap ms, gaps > 33 ms |
|---|---|---|
| Lamp right | 7.5, 224, 8 → **16.3, 441, 4** | 6.7, 288, 8 → 12.9, 437, 4.5 |
| Lamp left | 6.7, 209, 8.5 → **16.3, 364, 4.5** | 7.5, 247, 8.5 → 15.4, 396, 4.5 |
| Select → Math Buddy | 6.7, 326, 8 → 10.8, 484, 6 | 5.8, 455, 7 → 10.0, 484, 5 |
| Select → Linga | 5.0, 312, 7 → 13.3, 392, 5 | 5.8, 387, 7 → 15.0, 415, 4 |
| Select → Essay Master | 7.5, 238, 8 → 19.2, 414, 7 | 7.5, 336, 9 → 11.7, 451, 8 |
| Back from Math Buddy | 12.5, 589, 5 → 17.5, 630, 4 | 19.2, 557, 4 → 21.7, 621, 3 |
| Back from Linga | 4.2, 596, 6 → 10.8, 671, 6 | 3.3, 603, 5 → 4.2, 690, 4 |
| Back from Essay Master | 6.7, 927, 7.8 → **15.8, 635, 3** | 5.0, 441, 7 → 5.0, 589, 4 |

How to read it:
- **Jank in the transitions is lower:** gaps over two vsyncs fell from 7–9 to 3–6 per transition, and the frames drawn doubled or more.
- **The longest single freeze got longer on most transitions** (lamp moves 0.21–0.29 s → 0.36–0.44 s). Before, every frame was slow, so the work of building the arriving screen was spread over many slow frames. Now the frames are fast and that work lands as one stall at the start. That stall is consumer #4, left open.
- On the before production run, Back from Essay Master saw six keydowns (the KeyBridge's and the page's own). Its window line is the average over them.

## The look, and the one trade-off

- **Landing, desktop Chromium, frozen, against the original layer-level shadows:** Math Buddy 45.5 dB, Linga 46.0 dB, Essay Master 46.5 dB PSNR (≈ 1 of 255 levels on average). The amplified difference shows thin lines where pieces still meet:
  - the front hill and its side cliffs in the bottom corners;
  - the figure and the lantern against the stairs (Math Buddy);
  - the trees against the hills (Essay Master).
  Each line is a soft edge of a shadow a few px wide, invisible at TV distance.
- **On the stick:** `after/captures/before-vs-after-landing.jpg` sets the three landings side by side. The only differences are animation phase: the drifting symbols and the motes are elsewhere. The module homes are pixel-identical (Linga and Essay Master: PSNR ∞; Math Buddy: 63.7 dB). `after-lamp-and-select-linga.mp4` and `before-lamp-and-select-linga.mp4` show the same lamp move and Select.
- **The trade-off kept for the look:** Linga's speech bubble with its note, and the bell with the counter, are one shadowed object each, as one layer shadow drew them. Each holds a moving part, so its small shadow is redrawn every frame: Linga's idle landing runs at **42.6 fps**. With one shadow per piece it ran at 53 fps, but the note then cast a shadow on its bubble and the bell on the counter, which the original never drew (side-by-side crops showed it). The brief says to keep the look, so the look was kept. If the operator prefers the 53 fps, the change is to drop the two wrapping `<g>`s in `englishWorld` (`worlds.tsx`, the 1.12 and 1.3 layers).

## Dev vs production

**Production is not the answer for the stick.** It helps by 10–30 % on transitions, but every big cost above is the app's, the same in both: before the fixes, production ran the idle landing at 8.8 fps and dev at 8.7.

After the fixes, production vs dev:
- idle landing: 59 vs 55 fps;
- lamp moves: 29 vs 22;
- Back from Linga: 38 vs 32;
- Back from Essay Master: 44 vs 38.

Dev's extra cost is React's development build (one 320–370 ms task per lamp move against ~150 ms) and the dev overlay. The two transition windows are close (lamp moves: 12.9–15.4 fps vs 16.3).

**If the operator wants the extra frames,** the one step is, in `desk/`:

```sh
npm run build && npm run start -- -H 0.0.0.0 -p 3000
```

That runs in place of `npm run dev` on the same port and the same `data/`. The build needs 19024aaa: main's `next build` fails without it. The trade is that a code change then needs a rebuild instead of a hot reload.

A note on the dev measurements: they used webpack (`next dev --webpack`, the only bundler a worktree can run). The operator's `npm run dev` uses Turbopack. The page's runtime cost is React's development build either way, but the dev numbers are webpack's.

## Tried and dropped

- **Keep every app's world mounted, the unlit ones at opacity 0 and paused** (475c5956, reverted by 9b950486). The idea was that a lamp move would slide layers the GPU already had. Scored over the 1.2 s window, it was worse: the longest gap rose from 385–461 ms to 482–624 ms at the same fps, for +54 MB of GL memory (160 → 214 MB). A layer at opacity 0 is not drawn, so its tiles are not kept, and putting the leaving world to rest moved it back on stage and rastered it a second time. Pausing its animations also re-layered it. The same trial at opacity 0.004 kept the tiles but halved the idle fps (overdraw) and did not move the stall. The commit was justified on the whole-run p99 and the window showed it wrong, which is why the window metric is the one in the tables.
- **Key each world set by its app**, so the leaving world keeps its DOM instead of being rebuilt under a new key for its last 0.7 s. Measured on its own: longest gap 377–469 ms against 385–461 ms. No difference; not committed.
- **A shadow per top-level piece everywhere** (the first form of ef517a98 and 1ffd697c): the fastest form (Linga 53 fps), but pieces cast onto each other (PSNR 36.8–42 dB). Superseded by 46b5314a.
- **One shadow for the whole drawing as a group** (`.pp-cast` with the filter): 22 fps on Math Buddy. Its moving children forced the group back on the per-frame path.
- **SVG `feDropShadow` filters** (`filter: url(#…)`) instead of CSS `drop-shadow`: 15 fps, worse.
- **A DevTools device-metrics override (DPR 2)** to test whether the WebView rasters at twice the window's pixels (`devicePixelRatio` reads 4 on a 960 × 540 CSS viewport in a 1920 × 1080 window). The WebView ignored the override. The composited layer sizes (the root 1920 × 1080, the 1920-px stage at 3840 under its `scale(0.5)`) point to a device scale of 2 and raster at the window's resolution. So the DPR 4 is not shown to cost anything; a `stick-app` build would be needed to settle it (see "Left open").
- **Hiding the title, its text-shadows, the caption's entrance, or the shelf's transitions** during lamp moves: each within noise of the stall.

## Left open

- **The transition stall (consumer #4).** Each lamp move, Select and Back still holds 0.36–0.69 s, with no frame, at its start: the arriving screen's DOM, style and layout (~150 ms in production), then its vector raster on the GPU (the RenderThread waits up to 330 ms on a sync token). It is not the shadows (all off: same stall), the hills or the sky.
  Candidates, none built:
  - pre-rastered images for the parts of a world that do not depend on the learner (sky, hills, side cliffs);
  - fewer DOM nodes per world;
  - for Back, keeping the landing mounted under a module's screen.
  Each is an M with its own look check.
- **The art animations run on the main thread.** The keys, wave bars, dots, hooks, bell, bubbles and drifts use `transform-box: fill-box` or animate SVG children. Chrome ticks them on the main thread with an SVG relayout and repaint each frame. Moving them to compositor-friendly forms (a `view-box` origin set per element, or HTML wrappers) is the next idle-fps lever for Linga (37.5 → 48.6 fps with them paused). Not done: it touches every animated piece's markup and needs its own look check.
- **Select's zoom** animates `clip-path` on a full-stage radial gradient (`.pp-flood`), a main-thread repaint each frame for 0.52 s. Select into Math Buddy shows 10.8 fps in its window. A compositor-only reveal (a scaled circle with a counter-scaled gradient) would look the same. Not built.
- **Math Buddy with lit steps was not measured.** The temp learners have none. A lit step's pulse sits inside the stairs' shadowed group, so it puts that group's shadow back on the per-frame path, the way the bell does on Linga.
- **`devicePixelRatio` 4 on the stick's WebView.** See "Tried and dropped". Settling whether it costs raster needs a `stick-app` debug build that logs the WebView's display metrics, or tries `setInitialScale`. That is a change to `stick-app/`, and this task kept `stick-app/` untouched.
- **The main checkout's `desk/node_modules` is incomplete.** It has 51 entries and no `@next/env` (a fresh `npm ci` of the same lockfile has both). `next` cannot start from it: the worktree's junction failed with `Cannot find module '@next/env'`. The operator's desk on :3000 (`next dev` from that folder) runs because it loaded before. A restart of it would likely fail the same way until `npm ci --prefix desk` is run in the main checkout. That is the operator's to do: builders may not reinstall over the junction.
- **The real desk.** Every number here is from the temporary desks running this branch's code. The operator's desk on :3000 runs main and keeps the old behaviour until this branch is merged and that desk picks it up (`next dev` reloads changed modules by itself).
