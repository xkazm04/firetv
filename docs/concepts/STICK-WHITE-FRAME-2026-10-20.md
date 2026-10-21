# No white frame on the TV (2026-10-20)

Operator order, 18:50: on the paired Fire TV Stick (the `stick-app` WebView APK), moving between Math Buddy, Linga and Essay Master blinked a white screen. This doc covers what was measured on the stick, the cause, the fix, and the proof. Every capture is under `artifacts/stick-2026-10-20-white-frame/`.

## How it was measured

- **The stick.** AFTKM at `10.0.0.139:5555`, Amazon WebView 150, the `stick-app` debug APK as installed (it was not changed).
- **The desk.** One temporary `next dev --webpack -H 0.0.0.0 -p 3107` ran in this branch's `desk/`, with `DESK_DATA_DIR` in a fresh temp dir outside the repo (seeded learners Ema and Jakub only). The real desk on :3000 serves the real learners. Driving its screens would have written their session, so it was not used for the switches. It was never stopped, restarted, read or written. The stick reached :3107 through `adb reverse tcp:3107 tcp:3107` and a one-time `--es url` with the temp desk's TV link (a localhost address, which the stick does not keep). Ema was seated with `learner.set` posted as the TV.
- **The captures.** `adb shell screenrecord --size 960x540` ran while `adb shell input keyevent` pressed the remote's keys (`rec.sh`). screenrecord writes one frame per composited frame, so a frame the stick shows for one vsync is in the file. The mp4s were re-encoded smaller (`libx264 -crf 30`, every frame kept) before they were committed. `*-sheet.jpg` is every frame of a capture, 10 per row (`sheet.sh`).
- **The meter.** `light.py` decodes every frame and measures the share of the stage above the shelf (the top 75 %) that is light and flat: `min(R,G,B) > 200`, which takes in white and the landing's paper cream `#f6ecd9`. It prints each run of frames over 0.6 with its start and length. It also prints the share of pure white (`min > 235`) over the whole frame. That never went above 0.011 in any capture: **the stick never showed a pure white frame. What it showed was the landing's cream paper, bare, which reads as white on a TV.** `before/light-runs.txt` and `after/light-runs.txt` are the meter's output on the committed files.

## The cause

Every switch between the apps on the TV stays inside the `/tv` page. The landing, Math Buddy, Linga and Essay Master are session screens that `app/tv/page.tsx` draws on one stage. No switch navigates or loads a route: the dev log shows `/tv` compiled once, on the first load, and no request but `/api/session` during the switches. So it was not the WebView's default white between documents, a dev-mode first compile, a loading or error boundary, or late CSS.

The white was the **landing's paper showing through while the stick's GPU rastered a world**. On the landing (`landing/themes/paper/Paper.tsx`), each app has a world drawn in layers: big inline SVGs (2200×1080, the sky's rect 4800×2800), composited with `will-change` and `drop-shadow` filters. When the lamp moves to another app, both the leaving and the arriving world mount as new layers. The stick's PowerVR GPU then takes about half a second to raster them. The compositor runs the slide and fade on time and paints the missing tiles with what is under them, which was the `.desk-tv.pp` background: cream paper `#f6ecd9`. For 450–600 ms the stage was bare paper with only the app's name and the shelf on it (`before/b3-home-to-linga-blank-frame.png`). The leaving world's sky dropped out first (the largest layer), then the whole world.

This happens on every lamp move between apps, so on every way from one module to another: Back to the landing, Left or Right to the next app, Select.

## Switch by switch

"Before" is `main` at cee77b9b. "After" is this branch. Paths are under `artifacts/stick-2026-10-20-white-frame/`.

| Switch | Before: what the stick showed | Cause | Fix | Before capture | After capture | After |
|---|---|---|---|---|---|---|
| Landing lamp Math Buddy → Linga | Math's sky dropped, then bare cream with "inga" for 584 ms (frames 34–37) | The worlds raster on the GPU; the paper shows under them | The arriving world's sky lies under the layers (`.pp-sky`) | `before/b3-home-to-linga.mp4` (+ `-sheet.jpg`, `-blank-frame.png`) | `after/a3-home-to-linga.mp4`, `after/a3-home-to-linga-gap-frame.png` | Linga's orange sky with "Linga" for the same frames; no light run |
| Landing lamp Linga → Essay Master | Linga's sky dropped, then bare cream "Essay Master" for 484 ms (frames 29–32) | same | same | `before/b5-home-to-essay.mp4` | `after/a5-home-to-essay.mp4` | none |
| Landing lamp Essay → Linga → Math | Each move: the old sky dropped, then bare cream; the meter catches Linga → Math at 467 ms (frames 44–47). Essay → Linga is in the sheet, rows 4–5 (the green of Essay's hills keeps it under the meter's 0.6) | same | same | `before/b8-lamp-essay-to-math.mp4` | `after/a8-lamp-essay-to-math.mp4` | none; the gap is the new app's sky |
| Landing lamp Math → Linga → Essay | Linga → Essay: 567 ms bare cream (frames 42–45) | same | same | `before/b9-lamp-math-to-essay.mp4` | `after/a9-lamp-math-to-essay.mp4` | none |
| Landing → Math Buddy (Select) | No white: the zoom into blue, then Lamplight (dark) | — | — | `before/b1-home-to-math.mp4` | `after/a1-home-to-math.mp4` | none |
| Math Buddy → landing (Back) | No white | — | — | `before/b2-math-to-home.mp4` | `after/a2-math-to-home.mp4` | none |
| Landing → Linga (Select) | No white on the zoom. Linga's own home is paper-light by design: the meter's run at the end (one frame, 0 ms) is that screen, not a blink | — | — | `before/b3-home-to-linga.mp4` (its end) | `after/a3-home-to-linga.mp4` (its end) | the same designed screen |
| Linga → landing (Back) | No white. The meter's run at frames 0–1 is Linga's designed home before Back | — | — | `before/b4-linga-to-home.mp4` | `after/a4-linga-to-home.mp4` | none |
| Landing → Essay Master (Select) | No white: the zoom into green, then Specimen (dark) | — | — | `before/b5-home-to-essay.mp4` (its end) | `after/a5-home-to-essay.mp4` | none |
| Essay Master → landing (Back) | No white | — | — | `before/b6-essay-to-home.mp4` | `after/a6-essay-to-home.mp4` | none |
| Cold load of /tv (app force-stopped, opened on the TV link) | Black (the WebView, `Color.BLACK`), the stick's dark "Looking for the desk", the dark bench, then the **arrival** (the mark draws itself on cream paper, designed, about 1.2 s; longer under dev-mode load). After it, about 0.3 s of bare cream with only the shelf before the world came in (the end of the 1168 ms run) | The arrival's reveal (a `clip-path` on `.pp-worlds`) ran late under dev-mode load, and the worlds rastered behind it; the paper showed | The same `.pp-sky`. It sits under the arrival, outside the reveal's clip, so a late reveal shows the sky | `before/b7-cold-tv.mp4` | `after/a7-cold-tv.mp4` | The run is now the arrival alone (1068 ms, frames 56–65); the reveal opens on the sky. See "Left open" |

## The fix

One layer, in `desk/src/landing/themes/paper/` and `desk/src/design/desk-landing.css`:

- `worlds.tsx` now holds each world's sky stops in one place (`SKY`). The SVG sky gradients read from it, so their colours are unchanged. `skyBackdrop(app)` gives the same stops as a CSS `linear-gradient` for the 1080 px stage.
- `Paper.tsx` draws `<div class="pp-sky">` first on the landing, filled with the sky of the app in the light (Math Buddy's when no app is). It lies under the arrival and the world layers (`z-index: 0`, outside `.pp-worlds` and its reveal clip). A gradient on a plain box is cheap to paint. Until the GPU has rastered a world's layers, the stage shows that world's sky instead of the paper.

Nothing else changed: no design value, no phone page, the On Air shell untouched, `stick-app/` untouched. Under normal timing the arrival still covers the sky until the reveal has opened, so the arrival looks as before.

**Tried and dropped:** keying each world set by its app, so the leaving world keeps its DOM and tiles. On the stick the leaving world's sky still dropped out (that layer is too large for the tiles to be kept), and the backdrop alone was enough, so the change was reverted to keep the diff narrow. A smaller sky rect (the 4800×2800 rect is mostly off-stage) would cut the raster cost itself. It is not needed for the white frame and was left alone.

## Gates

- `npm --prefix desk run test:types`: exit 0.
- Rules, narrowed to the landing: `tv-landing-test.cjs`, 10/10 green.
- No rule changed. The change is presentation only (a backdrop and shared colour stops), so no suite was added.

## Left open

- **The arrival is cream paper by design.** On a cold load, and each time someone sits down, the landing plays the arrival: the house mark draws itself and "Study Desk" settles on cream paper (`.pp-intro`, about 1.2 s). It is a designed, animated screen, not a blank frame, so it was not restyled. On a dark TV it is a bright screen, though. If the operator counts it as a white frame, the arrival's paper can take the house's deep brown (`THEME.house`). That is a design change to the contest winner, so it is the operator's call.
- **The cold load's dark frames.** Between the stick's "Looking for the desk" and the stage, the page shows its dark bench bar for a moment (the APK hides it at `onPageFinished`), the unscaled stage, and "Lost the desk link. Reconnecting." until the session stream connects. All are dark or red, not white. They are noted here, not changed.
- **The real desk.** The fix is proven on the temporary desk, from this branch's code. The operator's desk on :3000 runs `main` and shows the old behaviour until this branch is merged and that desk picks it up (`next dev` reloads the changed modules by itself, so no restart is needed).
- **Production build.** Not measured: dev-mode compiling is not a cause (no switch requests a route), and the raster cost is the same in a production build.
