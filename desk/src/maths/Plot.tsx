/**
 * A Calculus graph in Lamplight's hand (v2 M4a; maths/plot.ts draws the numbers): the axes in ink, the curve in the
 * desk's pen, a tangent dashed in amber, an area washed in amber. It shows what the desk computed; it never marks.
 */
import type { CalcSpec } from "@/lib/rules/calc";
import { plotFor, plotModel } from "./plot";

export function Plot({ spec, w = 470, h = 280 }: { spec: CalcSpec; w?: number; h?: number }) {
  const ps = plotFor(spec), m = ps && plotModel(ps, w, h);
  if (!m) return null;
  return (
    <div className="mb-plot" data-role="maths-plot" data-shape={spec.shape}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`The graph of ${spec.f}`}>
        {m.area && <path d={m.area} className="pa" />}
        {m.axes.x !== null && <line x1="0" x2={w} y1={m.axes.x} y2={m.axes.x} className="ax" />}
        {m.axes.y !== null && <line y1="0" y2={h} x1={m.axes.y} x2={m.axes.y} className="ax" />}
        {m.curve.map((d, i) => <path key={i} d={d} className="pc" />)}
        {m.tangent && <line x1={m.tangent.x1} y1={m.tangent.y1} x2={m.tangent.x2} y2={m.tangent.y2} className="pt" />}
        {m.mark && <circle cx={m.mark.x} cy={m.mark.y} r="7" className="pm" />}
      </svg>
    </div>
  );
}
