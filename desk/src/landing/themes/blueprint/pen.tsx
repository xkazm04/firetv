/**
 * The drafting pen: the few line helpers every blueprint drawing is built from (contest A/3, art.js). Classes (scoped
 * under .desk-tv.bp in design/desk-landing-blueprint.css): l1 primary 4px, l2 secondary 2px, l3s thin 1.5px solid,
 * c dashed construction. Elements with class "d" draw on when the room is entered (pathLength 1, --k is their order).
 * Each helper returns a keyed element, so a drawing is just a list of them.
 */
import type { CSSProperties, ReactElement } from "react";

const f = (n: number) => Math.round(n * 10) / 10;
export const pts = (a: number[][]) => a.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");

export class Pen {
  private k = 0;
  private n = 0;
  private id: string;
  constructor(id: string) { this.id = id; }
  /** how many drawn-on strokes the pen has made (the arrival paces them over this many) */
  count() { return Math.max(1, this.k); }
  private key() { return `${this.id}-${this.n++}`; }
  private d(cls?: string): { className: string; style: CSSProperties; pathLength: number } {
    return { className: `d ${cls ?? "l1"}`, style: { "--k": this.k++ } as CSSProperties, pathLength: 1 };
  }
  L(x1: number, y1: number, x2: number, y2: number, c?: string): ReactElement { return <line key={this.key()} {...this.d(c)} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} />; }
  PA(d: string, c?: string): ReactElement { return <path key={this.key()} {...this.d(c)} d={d} />; }
  CI(x: number, y: number, r: number, c?: string): ReactElement { return <circle key={this.key()} {...this.d(c)} cx={f(x)} cy={f(y)} r={r} />; }
  RC(x: number, y: number, w: number, h: number, c?: string, rx = 0): ReactElement { return <rect key={this.key()} {...this.d(c)} x={x} y={y} width={w} height={h} rx={rx} />; }
  PG(a: number[][], c?: string): ReactElement { return <polygon key={this.key()} {...this.d(c)} points={pts(a)} />; }
  CP(d: string, k?: string): ReactElement { return <path key={this.key()} className={`c ${k ?? ""}`} d={d} />; }
  CCI(x: number, y: number, r: number, k?: string): ReactElement { return <circle key={this.key()} className={`c ${k ?? ""}`} cx={f(x)} cy={f(y)} r={r} />; }
  CL(x1: number, y1: number, x2: number, y2: number, k?: string): ReactElement { return <line key={this.key()} className={`c ${k ?? ""}`} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} />; }
  AH(x: number, y: number, a: number, s = 11): ReactElement {
    const bx = x - Math.cos(a) * s, by = y - Math.sin(a) * s, px = -Math.sin(a) * s * 0.36, py = Math.cos(a) * s * 0.36;
    return <path key={this.key()} className="ah" d={`M${f(x)} ${f(y)}L${f(bx + px)} ${f(by + py)}L${f(bx - px)} ${f(by - py)}Z`} />;
  }
  /** a dimension line: two extension lines and an arrowed span, off the measured edge by `off` */
  dim(x1: number, y1: number, x2: number, y2: number, off: number, ext = 10): ReactElement {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
    const nx = -uy, ny = ux, sg = off < 0 ? -1 : 1;
    const ax = x1 + nx * off, ay = y1 + ny * off, bx = x2 + nx * off, by = y2 + ny * off;
    const ex = nx * (off + sg * ext), ey = ny * (off + sg * ext);
    return (
      <g key={this.key()} className="dm">
        {this.L(x1 + nx * sg * 4, y1 + ny * sg * 4, x1 + ex, y1 + ey, "l3s")}
        {this.L(x2 + nx * sg * 4, y2 + ny * sg * 4, x2 + ex, y2 + ey, "l3s")}
        {this.L(ax, ay, bx, by, "l2")}
        {this.AH(ax, ay, Math.atan2(-uy, -ux))}
        {this.AH(bx, by, Math.atan2(uy, ux))}
      </g>
    );
  }
  /** hatching clipped to a polygon; `id` names the clip path and must be unique in the page */
  hatch(a: number[][], step: number, cls: string, dir: "v" | "b" | "f", id: string): ReactElement {
    const xs = a.map((p) => p[0]), ys = a.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const w = x1 - x0, h = y1 - y0;
    let s = "";
    if (dir === "v") for (let t = x0; t <= x1; t += step) s += `M${f(t)} ${f(y0)}V${f(y1)}`;
    else if (dir === "b") for (let t = -h; t < w; t += step) s += `M${f(x0 + t)} ${f(y0)}L${f(x0 + t + h)} ${f(y1)}`;
    else for (let t = -h; t < w; t += step) s += `M${f(x0 + t)} ${f(y1)}L${f(x0 + t + h)} ${f(y0)}`;
    return (
      <g key={this.key()}>
        <defs><clipPath id={id}><polygon points={pts(a)} /></clipPath></defs>
        <path className={`hc ${cls}`} clipPath={`url(#${id})`} d={s} />
      </g>
    );
  }
}

export { f };
