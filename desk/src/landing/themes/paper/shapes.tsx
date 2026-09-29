/**
 * The paper theme's small shapes: the rounded bar, the cloud, the hill, the star, the tree, and the one hidden block
 * of gradients and blurs every drawing points at. A leaf: React and nothing else. Every id is prefixed `pp-` so it
 * cannot meet another theme's, and every drawing here is deterministic (a seeded hill, no Math.random) so a frame is
 * the same frame twice.
 */
import type { CSSProperties, ReactNode } from "react";

/** A reference to one of the shared gradients / filters below. */
export const paint = (name: string) => `url(#pp-${name})`;
const f1 = (n: number) => Math.round(n * 10) / 10;

const GRADIENTS: Record<string, [string, string]> = {
  gCobalt: ["#6480ec", "#2c41a8"], gIndigo: ["#3d50bb", "#212e80"], gButter: ["#fff3ad", "#ffcf4a"],
  gCream: ["#fefaee", "#eadcbb"], gTerra: ["#ef8259", "#bb4a2b"], gPlum: ["#82406b", "#4b1f3e"],
  gBrass: ["#f7d47c", "#b8862a"], gCoral: ["#f78f6f", "#d9563a"], gSage: ["#c4dcab", "#94bd8c"],
  gForest: ["#428068", "#1c4838"], gWood: ["#94503c", "#5c2d25"], gPage: ["#fffbf1", "#efe3c6"],
  gLeaf: ["#86b98a", "#4f8c65"], gInk: ["#4d372a", "#2b1d16"], gRose: ["#f3a08a", "#d86a58"],
  gDoor: ["#fff4b8", "#ffc656"], gYellow: ["#ffe98a", "#ffd23f"],
};

/** The hidden block of gradients and blurs (one per landing). */
export function Defs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs>
      {Object.entries(GRADIENTS).map(([k, [a, b]]) => (
        <linearGradient key={k} id={`pp-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
      ))}
      <radialGradient id="pp-rWarm"><stop offset="0" stopColor="#fff2b0" stopOpacity=".95" /><stop offset="1" stopColor="#ffd76a" stopOpacity="0" /></radialGradient>
      <radialGradient id="pp-rCream"><stop offset="0" stopColor="#fff8e4" stopOpacity=".9" /><stop offset="1" stopColor="#fff8e4" stopOpacity="0" /></radialGradient>
      <filter id="pp-fB10" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10" /></filter>
      <filter id="pp-fB22" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22" /></filter>
    </defs></svg>
  );
}

/** A vertical gradient in the layer's own units (a sky), and a plain 0..1 one for a small drawing. */
export function SkyGradient({ id, stops }: { id: string; stops: Array<[number, string]> }) {
  return <linearGradient id={`pp-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">{stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}</linearGradient>;
}
export function UnitGradient({ id, stops }: { id: string; stops: Array<[number, string]> }) {
  return <linearGradient id={`pp-${id}`} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}</linearGradient>;
}

function rng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
function hillD(base: number, amp: number, seed: number, step: number) {
  const r = rng(seed);
  let x = -1400, y = base + (r() - 0.5) * amp * 2, d = `M-1400 1400L-1400 ${f1(y)}`;
  while (x < 3300) {
    const w = step * (0.7 + r() * 0.6), nx = x + w, ny = base + (r() - 0.5) * amp * 2;
    d += `C${f1(x + w * 0.5)} ${f1(y)} ${f1(x + w * 0.5)} ${f1(ny)} ${f1(nx)} ${f1(ny)}`;
    x = nx; y = ny;
  }
  return `${d}L${f1(x)} 1400Z`;
}
/** A rolling hill with a pale rim: the seed fixes its shape. */
export function Hill({ base, amp, seed, fill, hi = "rgba(255,255,255,.45)", step = 340 }: { base: number; amp: number; seed: number; fill: string; hi?: string; step?: number }) {
  const d = hillD(base, amp, seed, step);
  return <><path d={d} fill={fill} /><path d={d} fill="none" stroke={hi} strokeWidth="3" transform="translate(0 -1.5)" /></>;
}

export function Rr({ x, y, w, h, r = 0, fill, opacity }: { x: number; y: number; w: number; h: number; r?: number; fill: string; opacity?: number }) {
  return <rect x={f1(x)} y={f1(y)} width={f1(w)} height={f1(h)} rx={r} fill={fill} opacity={opacity} />;
}
export function Circ({ x, y, r, fill, opacity }: { x: number; y: number; r: number; fill: string; opacity?: number }) {
  return <circle cx={f1(x)} cy={f1(y)} r={r} fill={fill} opacity={opacity} />;
}
export function Cloud({ x, y, s, fill }: { x: number; y: number; s: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-120 40a40 40 0 0 1 30-70a55 55 0 0 1 100-20a45 45 0 0 1 80 30a35 35 0 0 1 10 60z" fill={fill ?? paint("gCream")} />
      <path d="M-118 34a40 40 0 0 1 28-64a55 55 0 0 1 100-20a45 45 0 0 1 78 28" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="3" />
    </g>
  );
}
export function Star({ x, y, s, fill, delay = 0 }: { x: number; y: number; s: number; fill: string; delay?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><path className="pp-tw" style={{ animationDelay: `${delay}s` }} d="M0-14L4-4L14 0L4 4L0 14L-4 4L-14 0L-4-4Z" fill={fill} /></g>;
}
export function Tree({ x, y, s, c1, c2 }: { x: number; y: number; s: number; c1: string; c2: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Rr x={-6} y={-20} w={12} h={70} r={5} fill={paint("gWood")} />
      <ellipse cx="0" cy="-70" rx="52" ry="64" fill={c2} /><ellipse cx="-6" cy="-76" rx="46" ry="58" fill={c1} />
      <path d="M-40-96q30-28 60-8" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}
/** A slow drift, for clouds and floating symbols. */
export function Drift({ dur, delay = 0, children }: { dur: number; delay?: number; children: ReactNode }) {
  const style: CSSProperties = { animationDuration: `${dur}s`, animationDelay: `${delay}s` };
  return <g className="pp-drift" style={style}>{children}</g>;
}
