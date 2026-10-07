/**
 * Function graphs for Calculus (v2 M4a). Pure: a function of x (lib/rules/calc-expr compile) sampled into SVG paths in
 * a box, with a tangent and a shaded area where the item asks for them. Nothing here is a mark: the graph shows what the
 * desk computed, the verdict is still `checkAnswer`'s.
 *
 * - Samples evenly across the window; a non-finite value or a jump taller than the box breaks the curve, so a pole
 *   (1/x at 0) is never bridged by a vertical line.
 * - The y window is robust: the 5th to 95th percentile of the finite values, padded, and widened to include y = 0 when
 *   it is near, so one huge value near a pole does not flatten the rest.
 * - The tangent's slope is `derivativeAt`, the same numeric derivative the marking uses.
 */
import { compile, derivativeAt, type Expr } from "@/lib/rules/calc-expr";
import type { CalcSpec, Num } from "@/lib/rules/calc";

export interface PlotSpec { f: string; x: [number, number]; tangentAt?: number; area?: [number, number]; mark?: number }
export interface PlotModel {
  w: number; h: number; view: { x0: number; x1: number; y0: number; y1: number };
  curve: string[];            // one SVG path per unbroken piece
  axes: { x: number | null; y: number | null };   // pixel positions of y = 0 and x = 0 when they are in view
  tangent?: { x1: number; y1: number; x2: number; y2: number; at: { x: number; y: number }; slope: number };
  area?: string;              // a closed path between the curve and y = 0
  mark?: { x: number; y: number };
}

export const PLOT_SAMPLES = 360;

/** A number the specs write ('pi/4', 'ln(7)/2', 3): its value, or null. */
export function numOf(n: Num): number | null {
  if (typeof n === "number") return Number.isFinite(n) ? n : null;
  const e = compile(n); const v = e && !e.usesX ? e.at() : NaN;
  return Number.isFinite(v) ? v : null;
}

/** What to draw for a Calculus item, or null for a shape a graph does not help (and a function the desk cannot read). */
export function plotFor(spec: CalcSpec): PlotSpec | null {
  if (!compile(spec.f)?.usesX) return null;
  const around = (c: number, r = 3): [number, number] => [c - r, c + r];
  switch (spec.shape) {
    case "derivative-at": { const a = numOf(spec.at); return a === null ? null : { f: spec.f, x: around(a), tangentAt: a, mark: a }; }
    case "evaluate": { const a = numOf(spec.at); return a === null ? null : { f: spec.f, x: around(a), mark: a }; }
    case "definite-integral": {
      const a = numOf(spec.a), b = numOf(spec.b); if (a === null || b === null || a === b) return null;
      const lo = Math.min(a, b), hi = Math.max(a, b), pad = (hi - lo) * 0.35 || 1;
      return { f: spec.f, x: [lo - pad, hi + pad], area: [lo, hi] };
    }
    case "critical-point": case "extremum": {
      const a = numOf(spec.on[0]), b = numOf(spec.on[1]); if (a === null || b === null || a >= b) return null;
      const pad = (b - a) * 0.15; return { f: spec.f, x: [a - pad, b + pad] };
    }
    case "limit": {
      if (spec.at === "inf" || spec.at === "-inf") return { f: spec.f, x: spec.at === "inf" ? [0, 20] : [-20, 0] };
      const a = numOf(spec.at); return a === null ? null : { f: spec.f, x: around(a, 2), mark: a };
    }
    case "derivative": case "antiderivative": case "newton-step": return { f: spec.f, x: [-5, 5] };
  }
}

const quantile = (xs: number[], q: number) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))]; };

export function plotModel(spec: PlotSpec, w = 480, h = 300): PlotModel | null {
  const e: Expr | null = compile(spec.f);
  if (!e || !e.usesX) return null;
  const [x0, x1] = spec.x;
  if (!(Number.isFinite(x0) && Number.isFinite(x1) && x1 > x0)) return null;
  const xs = Array.from({ length: PLOT_SAMPLES + 1 }, (_, i) => x0 + ((x1 - x0) * i) / PLOT_SAMPLES);
  const ys = xs.map((x) => e.at(x));
  const finite = ys.filter(Number.isFinite);
  if (finite.length < PLOT_SAMPLES / 4) return null;
  let y0 = quantile(finite, 0.05), y1 = quantile(finite, 0.95);
  if (y1 - y0 < 1e-9) { y0 -= 1; y1 += 1; }
  const pad = (y1 - y0) * 0.15; y0 -= pad; y1 += pad;
  // y = 0 joins the window when it is within half the window's height: an axis to read the curve against
  if (y0 > 0 && y0 < (y1 - y0) / 2) y0 = 0 - pad * 0.3;
  if (y1 < 0 && -y1 < (y1 - y0) / 2) y1 = 0 + pad * 0.3;
  const px = (x: number) => ((x - x0) / (x1 - x0)) * w, py = (y: number) => h - ((y - y0) / (y1 - y0)) * h;
  const clampY = (y: number) => Math.max(-h, Math.min(2 * h, py(y)));
  const curve: string[] = [];
  let cur: string[] = [];
  for (let i = 0; i < xs.length; i++) {
    const y = ys[i], prev = ys[i - 1];
    const broken = !Number.isFinite(y) || (i > 0 && Number.isFinite(prev) && Math.abs(py(y) - py(prev)) > h);
    if (broken) { if (cur.length > 1) curve.push(cur.join(" ")); cur = []; if (!Number.isFinite(y)) continue; }
    cur.push(`${cur.length ? "L" : "M"}${px(xs[i]).toFixed(1)} ${clampY(y).toFixed(1)}`);
  }
  if (cur.length > 1) curve.push(cur.join(" "));
  const model: PlotModel = {
    w, h, view: { x0, x1, y0, y1 }, curve,
    axes: { x: y0 <= 0 && y1 >= 0 ? py(0) : null, y: x0 <= 0 && x1 >= 0 ? px(0) : null },
  };
  if (spec.tangentAt !== undefined) {
    const a = spec.tangentAt, fa = e.at(a), m = derivativeAt(e, a);
    if (Number.isFinite(fa) && m !== null && Number.isFinite(m)) {
      const t = (x: number) => fa + m * (x - a);
      model.tangent = { x1: 0, y1: clampY(t(x0)), x2: w, y2: clampY(t(x1)), at: { x: px(a), y: py(fa) }, slope: m };
    }
  }
  if (spec.area) {
    const [a, b] = spec.area, n = 120, pts: string[] = [`M${px(a).toFixed(1)} ${clampY(0).toFixed(1)}`];
    let ok = true;
    for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n, y = e.at(x); if (!Number.isFinite(y)) { ok = false; break; } pts.push(`L${px(x).toFixed(1)} ${clampY(y).toFixed(1)}`); }
    if (ok) model.area = `${pts.join(" ")} L${px(b).toFixed(1)} ${clampY(0).toFixed(1)} Z`;
  }
  if (spec.mark !== undefined) { const y = e.at(spec.mark); if (Number.isFinite(y)) model.mark = { x: px(spec.mark), y: py(y) }; }
  return model;
}
