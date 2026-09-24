/**
 * The pieces every situation is built from, lifted from the winning hotel lobby: a wall that warms from wine to
 * peach, a floor that curves up to meet it, a counter or table across the front, a pendant lamp, a potted plant.
 * A situation is a 735 × 718 picture that fills the arch (the arch clips it; keep what matters inside x 90–645,
 * y 110–630, and leave the bottom-left corner to the name tag).
 */
import type { ReactNode } from "react";
import { P, useUid } from "./palette";

export const W = 735, H = 718;

/** The picture: a wall gradient, a soft glow filter, and the scene drawn over them. */
export function Scene({ wall = [P.rose500, P.peach600, P.peach300], children }: { wall?: [string, string, string]; children: (u: string) => ReactNode }) {
  const u = useUid();
  return <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${u}wall`} x2="1" y2="1"><stop stopColor={wall[0]}/><stop offset=".53" stopColor={wall[1]}/><stop offset="1" stopColor={wall[2]}/></linearGradient>
      <linearGradient id={`${u}desk`} x2="0" y2="1"><stop stopColor={P.rose400}/><stop offset="1" stopColor={P.wine}/></linearGradient>
      <linearGradient id={`${u}floor`} x2="0" y2="1"><stop stopColor="#e6a47b"/><stop offset="1" stopColor="#a55463"/></linearGradient>
      <filter id={`${u}soft`}><feGaussianBlur stdDeviation="17"/></filter>
    </defs>
    <rect width={W} height={H} fill={`url(#${u}wall)`}/>
    <path d="M0 0h735v374H0z" fill="#e6ad87" opacity=".25"/>
    {children(u)}
  </svg>;
}

/** The floor that rises to meet the wall, with its faint boards. */
export function Floor({ u, y = 391 }: { u: string; y?: number }) {
  return <>
    <path d={`M0 ${y}Q359 ${y - 56} 735 ${y}v${H - y}H0Z`} fill={`url(#${u}floor)`}/>
    <path d={`M0 ${y + 21}h735M113 ${y - 2}L12 718M334 ${y - 17}l-82 ${H - y + 17}M566 ${y - 11}l122 ${H - y + 11}`} stroke="#f9cb9c" strokeWidth="3" opacity=".42"/>
  </>;
}

/** The counter or table top across the front, with its panel below: the hotel's reception desk. */
export function Counter({ u, y = 504, top = P.paper }: { u: string; y?: number; top?: string }) {
  return <>
    <path d={`M0 ${y}q346-18 735 0v43H0Z`} fill={top} stroke="#86505a" strokeWidth="8"/>
    <path d={`M0 ${y + 43}h735v${H - y - 43}H0Z`} fill={`url(#${u}desk)`}/>
    <path d={`M39 ${y + 71}h658v143H39z`} fill="none" stroke="#dfa681" strokeWidth="5" opacity=".54"/>
  </>;
}

/** A warm pendant lamp hanging from the top of the arch. `lo-lamp` hangs from its cord (the landing swings it). */
export function Lamp({ u, x, len = 91 }: { u: string; x: number; len?: number }) {
  return <g className="lo-lamp" style={{ "--lo-lamp-x": `${x}px` } as React.CSSProperties}>
    <path d={`M${x} 0v${len}`} stroke={P.plum500} strokeWidth="7"/>
    <path d={`M${x - 46} ${len}q46 53 93 0Z`} fill={P.cream}/>
    <ellipse cx={x} cy={len + 14} rx="65" ry="16" fill="#f8dbb1" opacity=".45" filter={`url(#${u}soft)`}/>
  </g>;
}

/** The hotel's potted plant, standing with its pot's base at x, y. */
export function Plant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s}) translate(-94 -448)`}>
    <path d="M92 398q-10-65-43-78m47 76q30-52 48-60m-57 69q-42-33-67-25" fill="none" stroke={P.stem} strokeWidth="13" strokeLinecap="round"/>
    <path d="M56 327q-22 0-25-30q34-2 43 28m44 28q7-31 39-28q-6 35-39 33m-89 21q-2-29-31-35q-1 31 31 35" fill={P.leaf}/>
    <path d="M49 396h91l-12 52H63Z" fill={P.peach400}/><path d="M53 405h84" stroke="#ad675d" strokeWidth="7"/>
  </g>;
}

/** Soft light behind something: the grammar's big blurred circle. */
export function Glow({ u, x, y, r, color = "#f5d7a3", opacity = .56 }: { u: string; x: number; y: number; r: number; color?: string; opacity?: number }) {
  return <circle cx={x} cy={y} r={r} fill={color} opacity={opacity} filter={`url(#${u}soft)`}/>;
}
