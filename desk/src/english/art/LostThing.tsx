/**
 * A thing from the lost-property table (L3, lib/english/lostfound.ts), drawn from its public attributes: a jacket, a
 * water bottle or a school bag, in one of four colours, big or small, plain, striped or starred, and the place it was
 * found as a small round mark. The corridor draws the table with it; the phone draws the learner's own thing. No
 * words anywhere: the picture is what the learner says in English.
 */
import type { LostPlace, LostThing } from "@/lib/english/lostfound";
import { ITEM, P, useUid } from "./palette";

const LINE = "#86505a";
/** Each kind drawn in its own box, origin at the bottom centre: the jacket is the corridor's hook outline. */
const SHAPE = {
  jacket: "M-18 -134L-52 -122L-74 -38L-50 -30L-40 -84V0H40V-84L50 -30L74 -38L52 -122L18 -134Q0 -110 -18 -134Z",
  bottle: "M-12 -126h24v14q14 4 14 18v82q0 12-12 12h-28q-12 0-12-12v-82q0-14 14-18Z",
  bag: "M-44 -100q0-14 14-14h60q14 0 14 14v88q0 12-12 12h-64q-12 0-12-12Z",
} as const;
const BASE = { jacket: 0.68, bottle: 0.86, bag: 0.86 } as const;
const SIZE = { big: 1, small: 0.68 } as const;
const STARS: Array<[number, number]> = [[-22, -96], [20, -74], [-14, -44], [24, -22], [-30, -14]];

function star(cx: number, cy: number, r: number): string {
  return Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r * 0.45 : r; return `${i ? "L" : "M"}${(cx + d * Math.cos(a)).toFixed(1)} ${(cy + d * Math.sin(a)).toFixed(1)}`; }).join("") + "Z";
}

/** One thing standing with its bottom centre at x, y. `s` scales it beyond its own size. */
export function LostThingArt({ thing, x, y, s = 1 }: { thing: LostThing; x: number; y: number; s?: number }) {
  const u = useUid(), k = thing.kind, shape = SHAPE[k];
  return <g transform={`translate(${x} ${y}) scale(${(BASE[k] * SIZE[thing.size] * s).toFixed(3)})`} data-kind={k}>
    <defs><clipPath id={`${u}clip`}><path d={shape}/></clipPath></defs>
    {k === "bag" && <path d="M-18 -112q18-30 36 0" fill="none" stroke={LINE} strokeWidth="7" strokeLinecap="round"/>}
    <path d={shape} fill={ITEM[thing.colour]}/>
    <g clipPath={`url(#${u}clip)`}>
      {thing.pattern === "stripes" && [0, 1, 2, 3, 4].map(i => <rect key={i} x="-80" y={-126 + i * 28} width="160" height="11" fill={P.cream2} opacity=".82"/>)}
      {thing.pattern === "stars" && STARS.map(([cx, cy], i) => <path key={i} d={star(k === "bottle" ? cx * 0.55 : cx, cy, 10)} fill={P.cream2}/>)}
      <path d="M-90 -140h70l-70 70Z" fill="#fff" opacity=".12"/>
    </g>
    {k === "jacket" && <path d="M0 -112V0" stroke={LINE} strokeWidth="3"/>}
    {k === "bottle" && <rect x="-14" y="-142" width="28" height="18" rx="4" fill={P.plum500}/>}
    {k === "bag" && <rect x="-30" y="-56" width="60" height="40" rx="10" fill="none" stroke={LINE} strokeWidth="3"/>}
    <path d={shape} fill="none" stroke={LINE} strokeWidth="4" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
  </g>;
}

/** Where a thing was found, as a picture: a ball for the gym, a tree for the playground, a book for a classroom, an apple for the canteen. */
export function PlaceMark({ place, x, y, r = 16 }: { place: LostPlace; x: number; y: number; r?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${r / 16})`} data-place={place}>
    <circle r="16" fill={P.cream2} stroke={LINE} strokeWidth="3"/>
    {place === "gym" && <><circle r="8" fill="none" stroke={P.plum500} strokeWidth="2.5"/><path d="M-8 0h16M0 -8q6 8 0 16" fill="none" stroke={P.plum500} strokeWidth="2"/></>}
    {place === "playground" && <><circle cy="-3" r="7" fill={P.leaf}/><rect x="-1.5" y="3" width="3" height="7" fill={P.plum500}/></>}
    {place === "classroom" && <path d="M-9 -6h8v13h-8zM1 -6h8v13h-8z" fill={P.peach400} stroke={P.plum500} strokeWidth="2" strokeLinejoin="round"/>}
    {place === "canteen" && <><circle cy="1.5" r="7" fill={P.rose600}/><path d="M0 -5q1-4 5-5" fill="none" stroke={P.leaf} strokeWidth="2.5" strokeLinecap="round"/></>}
  </g>;
}
