/**
 * The paper landing's pre-rendered stills, as numbers: which box of a world layer a bitmap must hold, at what scale, the
 * shadow it bakes in, and what it costs in GPU memory. Pure (no DOM, no React), so tools/landing-stills-test.cjs can hold it.
 *
 * Why stills: on the stick every lamp move and every Back rastered each world's sky, hills and side cliffs again, tile by
 * tile (about 1 s of GPU per lamp move). A still layer is drawn once per page load into a canvas, which the compositor
 * shows as one texture, with no tile raster (docs/concepts/STICK-PERFORMANCE-2026-10-21.md, "Pass 3").
 */

export type StillKind = "sky" | "soft" | "hill" | "hero";
export interface Box { x: number; y: number; w: number; h: number }

/** How far a layer at depth d travels when a world slides in (design/desk-landing.css, pp-in). */
export const slide = (d: number) => 1920 * Math.max(0.15, d);
/** What the drawings span: the hills run -1400..3300 (shapes.tsx hillD), the sky's rect -460..2380 x -120..1200. */
const ART = { x0: -1400, x1: 3300, y0: -120 };
/**
 * The stage's bottom edge; the margin a slide edge keeps (the host's unpaired scale is 1.05 about 1920,560); and the
 * margin around a drawing's outline, which getBBox gives without its strokes, shadow or blur (fB22 reaches 66 px).
 */
const BOTTOM = 1080, PAD = 40, REACH = 72;

/**
 * The part of a layer a bitmap must hold: the drawing's outline widened by what its shadow and blur reach, clipped to the
 * stage widened by the layer's slide on either side (a cut edge must not come into view while the world slides) and to
 * the stage's bottom. A slide never shows below the stage: pp-in and pp-up lower a layer, they never raise it.
 */
export function stillBox(d: number, drawn: Box): Box {
  const s = slide(d);
  const x0 = Math.max(ART.x0, Math.floor(-s - PAD), Math.floor(drawn.x - REACH));
  const x1 = Math.min(ART.x1, Math.ceil(1920 + s + PAD), Math.ceil(drawn.x + drawn.w + REACH));
  const y0 = Math.max(ART.y0, Math.floor(drawn.y - REACH)), y1 = Math.min(BOTTOM + PAD, Math.ceil(drawn.y + drawn.h + REACH));
  return { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
}

/**
 * The bitmap's resolution against the device's, by kind. Half: the compositor scales it up, and a still is paper with soft
 * edges, gradients and glows. On a desktop at the stick's geometry the Math Buddy landing read 47.4 dB against the
 * live drawing at half and 48.7 dB at full, for 9.7 MB of bitmaps against 33 MB (STICK-PERFORMANCE-2026-10-21.md, Pass 3).
 */
export const KIND_SCALE: Record<StillKind, number> = { sky: 0.5, soft: 1, hill: 0.5, hero: 0.5 };

/**
 * Device pixels per layer unit, rounded up to a quarter step (a bitmap is never coarser than the screen), 0.25..1. Never
 * over 1: the stage is 1920 px and the stick shows it on a 1920 x 1080 surface, while its WebView reports a
 * devicePixelRatio of 4 (measured 2 a unit), which made each bitmap four times its pixels.
 */
export function quantScale(px: number): number {
  if (!Number.isFinite(px) || px <= 0) return 1;
  return Math.min(1, Math.max(0.25, Math.ceil(px * 4 - 1e-6) / 4));
}

/**
 * The canvas a still is drawn into: its box at the device's scale times the kind's. A small focal drawing (a face, the
 * Linga doorway) is `sharp`: drawn at the device's own scale, as half softened its fine lines (41 dB against 45-46).
 */
export function stillPixels(box: Box, px: number, kind: StillKind, sharp = false): { w: number; h: number; scale: number } {
  const scale = quantScale(px) * (sharp ? 1 : KIND_SCALE[kind]);
  return { w: Math.max(1, Math.ceil(box.w * scale)), h: Math.max(1, Math.ceil(box.h * scale)), scale };
}
/** GPU bytes of one still (RGBA, 4 bytes a pixel). */
export const stillBytes = (p: { w: number; h: number }) => p.w * p.h * 4;

/**
 * The shadow each kind's pieces cast, as design/desk-landing.css draws it (`.pp-cast > *`, filter: drop-shadow). A
 * bitmap bakes it in as an SVG feDropShadow; keep the two in step. The CSS blur is a radius: the standard deviation
 * is half of it, as Chrome draws a CSS shadow.
 */
export const SHADOW: Record<StillKind, { dx: number; dy: number; blur: number; color: string; opacity: number } | null> = {
  sky: null,
  soft: { dx: 0, dy: 8, blur: 10, color: "rgb(45,25,12)", opacity: 0.12 },
  hill: { dx: 0, dy: -5, blur: 10, color: "rgb(45,25,12)", opacity: 0.24 },
  hero: { dx: 6, dy: 12, blur: 14, color: "rgb(45,25,12)", opacity: 0.32 },
};
export const stdDeviation = (blur: number) => blur / 2;

/** One world's still layers: their ids are unique, so two worlds never share a bitmap they do not draw the same. */
export function duplicateIds(ids: string[]): string[] {
  const seen = new Set<string>(), dup = new Set<string>();
  for (const id of ids) (seen.has(id) ? dup : seen).add(id);
  return [...dup];
}
