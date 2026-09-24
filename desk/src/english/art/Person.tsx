/**
 * A Linga partner, facing the learner through the door. The geometry is Robin's, the receptionist of the winning
 * topic page, moved so the centre of the face is 0,0: head 170 tall, shoulders at y 140, body down to y 279.
 * Hair, skin, clothes, glasses and mouth change; the construction never does, so every partner is one family.
 * Arms and anything held are drawn by the scene as `children`, in the same coordinates, over the body.
 */
import type { ReactNode } from "react";
import { HAIR, P, SKIN, type HairTone, type Skin } from "./palette";

export type HairStyle = "short" | "long" | "bun" | "curly" | "crop";
export interface PersonProps {
  x: number; y: number; s?: number;
  skin?: Skin; hair?: HairTone; style?: HairStyle;
  /** the jacket, sweater or top */
  top?: string;
  /** "shirt" is Robin's collar and seams; "round" a plain neckline */
  collar?: "shirt" | "round";
  /** what shows between the collar points: a tie, or the shirt itself */
  tie?: string;
  glasses?: boolean;
  mouth?: "smile" | "calm" | "open";
  /** a name badge on the chest */
  badge?: boolean;
  children?: ReactNode;
}

const FACE = "M-73 -6q-3-78 72-91q78 4 80 90q-3 85-77 100q-71-12-75-99Z";
const FRINGE = "M-83 -7q-20-94 39-122q64-36 119 11q34 30 14 103q-27-16-38-52q-65 33-126 42Z";

export function Person({ x, y, s = 1, skin = "warm", hair = "plum", style = "short", top = P.plum800, collar = "shirt", tie, glasses, mouth = "smile", badge, children }: PersonProps) {
  const [face, shade, line] = SKIN[skin], [front, back, hi] = HAIR[hair];
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {style === "long" && <path d="M-86 -24Q-104 88-84 172H84Q104 88 86 -24Z" fill={back}/>}
    {style === "bun" && <circle cx="0" cy="-116" r="38" fill={back}/>}
    {style === "curly" && <g fill={back}>{[[-76, -40], [-62, -84], [-24, -112], [22, -112], [62, -86], [78, -42]].map(([cx, cy]) => <circle key={`${cx}`} cx={cx} cy={cy} r="36"/>)}</g>}
    {/* body, neck, collar */}
    <path d="M-100 138q40-58 99-57q73 0 112 60l24 138H-129Z" fill={top}/>
    <path d="M-21 62h48v62q-25 26-48 0Z" fill={shade}/>
    {collar === "shirt" ? <>
      <path d="M-41 96l42 36-33 46-45-67m119-15-41 36 33 46 46-67" fill={P.collar}/>
      {tie && <path d="M-33 178l34-46 33 46-32 112Z" fill={tie}/>}
      <path d="M-104 166q7 75 20 112m188-117q-10 75-18 117" fill="none" stroke={P.plum300} strokeWidth="6" opacity=".7"/>
    </> : <path d="M-36 86q36 42 72 0q-36 20-72 0Z" fill={P.collar}/>}
    {badge && <><rect x="36" y="168" width="58" height="27" rx="3" fill={P.peach400}/><path d="M45 176h39m-39 9h27" stroke={P.rose900} strokeWidth="3"/></>}
    {/* head */}
    <ellipse cx="0" cy="0" rx={style === "crop" ? 80 : 85} ry={style === "crop" ? 96 : 102} fill={back}/>
    <path d={FACE} fill={face}/>
    {style === "crop"
      ? <path d="M-80 -4Q-90 -100 0 -106Q90 -100 84 -4Q72 -30 66 -44Q30 -62 0 -60Q-34 -62 -64 -44Q-72 -30 -80 -4Z" fill={front}/>
      : style === "curly"
        ? <g fill={front}>{[[-60, -58], [-28, -80], [10, -84], [46, -70], [70, -40], [-76, -26]].map(([cx, cy]) => <circle key={`${cx}`} cx={cx} cy={cy} r="28"/>)}</g>
        : <path d={FRINGE} fill={front}/>}
    <path d="M-65 -7q-20 18-4 42l18 2m123-44q21 18 5 42l-18 2" fill={shade}/>
    <path d="M-40 3q12-8 24 0m44 0q12-8 24 0" fill="none" stroke={P.plum300} strokeWidth="5" strokeLinecap="round"/>
    <circle cx="-28" cy="9" r="4" fill={P.ink}/><circle cx="39" cy="9" r="4" fill={P.ink}/>
    <path d="M4 15l-5 18h10" fill="none" stroke={line} strokeWidth="4" strokeLinecap="round"/>
    {mouth === "smile" && <path d="M-21 50q25 18 48-1" fill="none" stroke="#8d4a51" strokeWidth="5" strokeLinecap="round"/>}
    {mouth === "calm" && <path d="M-14 54q16 5 32 0" fill="none" stroke="#8d4a51" strokeWidth="5" strokeLinecap="round"/>}
    {mouth === "open" && <path d="M-18 47q21 24 42 0q-21 7-42 0Z" fill="#8d4a51"/>}
    {glasses && <g fill="none" stroke={P.plum800} strokeWidth="5"><rect x="-52" y="-8" width="44" height="32" rx="11"/><rect x="17" y="-8" width="44" height="32" rx="11"/><path d="M-8 4h25"/></g>}
    {style !== "curly" && style !== "crop" && <path d="M-54 -109q34-32 83-14" fill="none" stroke={hi} strokeWidth="12" strokeLinecap="round"/>}
    {children}
  </g>;
}

/** An arm as one thick rounded stroke in the clothes' colour, ending in a hand. Coordinates are the person's. */
export function Arm({ d, color, hand, skin = "warm", w = 40, r = 24 }: { d: string; color: string; hand: [number, number]; skin?: Skin; w?: number; r?: number }) {
  return <><path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round"/><circle cx={hand[0]} cy={hand[1]} r={r} fill={SKIN[skin][0]}/></>;
}
