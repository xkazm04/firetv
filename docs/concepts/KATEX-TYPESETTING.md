# KaTeX for Math Buddy's typesetting (concept, deferred)

Status: **deferred** (owner, 2026-10-07, V2-O2: "put KaTeX into docs/concepts and defer if you have no tool to verify").
The cloud session that wrote this has no Fire TV, no Android TV emulator and no way to look at a rendered glyph on the
target, so the one question that decides this (does KaTeX's output read well at ten feet on the real device) cannot be
answered there. Slice M4b in [STUDY-DESK-V2-PLAN.md](STUDY-DESK-V2-PLAN.md) waits on the checks in section 4.

## 1. What exists today

- `desk/src/maths/typeset.ts` and `MathText.tsx`: a custom typesetter for plain notation and a subset of TeX. It handles
  stacked fractions, roots, ∫ and ∑ with limits, `lim` and Greek letters, in a handwritten look (Caveat with drawn strokes).
  Pen marks are drawn by `working.ts` on the same lines.
- Gaps, from the 2026-10-07 analysis: `cases` was not laid out as rows, and there were no matrices or aligned equations.
  Closed the same day by v2 M4b (the custom typesetter sets them as tables).
  Greek letters and arrows fall back to a system font that has never been checked on a Fire TV. `package.json` holds
  only next, react and qrcode.
- The owner's adult Math must-haves (v2 M4) include **proper typesetting**: matrices, `cases`, aligned equations, at the
  level of Calculus 1 and 2.

## 2. The two ways

| | KaTeX | Extend the custom typesetter |
|---|---|---|
| Coverage | Most of LaTeX math: matrices, `cases`, `aligned`, operators, accents, arrows | Only what is written: each construct is new code and new tests |
| Look | Computer Modern-style fonts (KaTeX_* woff2). Not the handwritten Lamplight look; the pen marks would sit over a print face | Keeps the handwritten look the Lamplight design is built on |
| Weight | One dependency; about 270 KB of JS (minified) plus about 20 woff2 font files (roughly 1 MB in all; only the faces used load) | No dependency |
| Server rendering | `katex.renderToString()` runs in Node, so the server can send HTML and the TV only lays it out | Already pure and server-safe |
| Pen marks (`working.ts`) | Must find positions inside KaTeX's HTML (spans with known classes); a new adapter | Positions are already known |
| Risk on the device | Font loading in the Fire TV WebView/Silk; sub-pixel layout of nested fractions at 1080p and 720p | Same system-font fallback risk as today, nothing new |

## 3. Recommended shape, if verified

A hybrid, not a swap:

1. Keep the custom typesetter for what learners write and for the handwritten sheet: their working, the pen marks and
   the Lamplight look.
2. Use KaTeX only for **printed** material the desk itself shows: lesson text, worked examples (v2 M1), adult problem
   statements with matrices, `cases` and aligned steps (v2 M4c, M3a/b).
3. Render on the server with `renderToString` (output `html`, `throwOnError: false`). A parse failure falls back to the
   custom typesetter, so a bad expression never blanks a screen.
4. Self-host the fonts from `desk/public/` (no CDN on the TV). Preload only the faces used: KaTeX_Main, KaTeX_Math,
   KaTeX_Size1-2.
5. Theme through CSS variables so the ink colour follows Lamplight, not KaTeX's black.

## 4. What must be verified before M4b starts (the owner's PC or a device)

1. **Readability:** a capture at 1920 x 1080 and 1280 x 720 of a page of 12 expressions (a 3 x 3 matrix, a `cases`
   piecewise function, a three-line `aligned` derivation, nested fractions, ∫ with limits, ∑ with limits), viewed from
   the sofa. Pass: the smallest script is at least 20 px at 720p, and nothing touches the safe zone.
2. **Fonts on the device:** the Android TV emulator in `tv-app/` (the PoC's AVD) or a real Fire TV loads the self-hosted
   woff2 with no fallback squares. Pass: no tofu, and no system-font substitution.
3. **Speed:** render the 12 expressions server-side 100 times. Pass: under 5 ms an expression on the owner's PC; first
   paint on the device under 300 ms with the fonts cached.
4. **Pen marks:** one marked Calculus line rendered by KaTeX with a ring drawn by `working.ts` at the right term. If the
   adapter costs more than a day, KaTeX stays print-only and working stays custom.

Kill: fail 1 or 2, and the custom typesetter is extended instead, for `cases` (rows) and matrices only.

## 5. If it is not verified soon

Until then, M4b's default from the plan stands: extend the custom typesetter for `cases` as rows and small matrices
(up to 3 x 3), with tests in `tools/maths-type-test.cjs`. That covers Calculus 1 and most of Calculus 2's notation. Linear
algebra is out of v2 scope (M3), which is where KaTeX would pay most.
