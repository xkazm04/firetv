/**
 * The pieces for a state of the journey rather than a place: a 510 × 440 symbol on the arch's warm gradient, in the
 * landing's grammar - one big soft circle behind, flat shapes, no outlines. Start and Done are the winning landing's
 * own; the door, the path of doors and the corrected bubble are drawn to match them.
 */
import type { ReactNode } from "react";
import { P } from "./palette";

const Symbol = ({ children }: { children: ReactNode }) => <svg viewBox="0 0 510 440" aria-hidden="true" focusable="false">{children}</svg>;

/** A page with a way in: the landing's first-run piece. */
export function Start() {
  return <Symbol>
    <circle cx="258" cy="188" r="166" fill={P.peach200}/>
    <path d="M154 68h202v292H154Z" fill={P.plum400}/><path d="M178 88h154v253H178Z" fill="#f8e9c4"/>
    <path d="M191 235h130" stroke="#ac5b60" strokeWidth="13" strokeLinecap="round"/><path d="M191 274h90" stroke="#ac5b60" strokeWidth="13" strokeLinecap="round"/>
    <path d="M335 160l60-41v100z" fill="#5c354c"/><circle cx="260" cy="151" r="38" fill="#bd765f"/>
    <path d="M90 374q168-108 330 0v66H90Z" fill="#a64f62"/>
  </Symbol>;
}

/** Done: the landing's star-burst with a check. */
export function Done() {
  return <Symbol>
    <circle cx="255" cy="182" r="158" fill="#f4d09e"/>
    <path d="M250 20l22 70 65-33-12 73 76 11-54 49 50 59-75 2-6 75-66-40-48 58-23-72-73 19 33-70-61-47 77-13-5-77 62 42z" fill="#fff1cc"/>
    <circle cx="255" cy="183" r="91" fill={P.rose600}/>
    <path d="M211 186l32 31 62-70" stroke="#fff1cf" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M54 361q201-93 405 0v79H54Z" fill="#a34e60"/>
  </Symbol>;
}

/** The level check: a door standing open, light across two steps. The first step. */
export function Check() {
  return <Symbol>
    <circle cx="258" cy="186" r="166" fill={P.peach200}/>
    <path d="M158 58h194v306H158Z" fill={P.plum400}/>
    <path d="M178 78h154v286H178Z" fill={P.cream}/>
    <circle cx="255" cy="170" r="54" fill="#fff8e2"/>
    <path d="M332 78l66-26v334l-66-22Z" fill={P.rose900}/><circle cx="384" cy="226" r="9" fill={P.honey}/>
    <path d="M178 364h154l66 42H112Z" fill="#fff0ca" opacity=".75"/>
    <path d="M136 364h238v22H136Z" fill={P.plinth}/><path d="M112 386h286v22H112Z" fill="#7a4a55"/>
    <path d="M90 408q168-60 330 0v32H90Z" fill="#a64f62"/>
  </Symbol>;
}

/** An arched door at x, y (top-left of its box), w wide and h tall. */
const Door = ({ x, y, w, h, light }: { x: number; y: number; w: number; h: number; light: string }) => {
  const r = w / 2, i = Math.max(6, w * .12);
  return <>
    <path d={`M${x} ${y + h}V${y + r}a${r} ${r} 0 0 1 ${w} 0V${y + h}Z`} fill={P.plum400}/>
    <path d={`M${x + i} ${y + h}V${y + r}a${r - i} ${r - i} 0 0 1 ${w - 2 * i} 0V${y + h}Z`} fill={light}/>
  </>;
};

/** The topic plan: a path of doors, each a conversation, the nearest one open. */
export function Plan() {
  return <Symbol>
    <circle cx="255" cy="180" r="160" fill={P.peach200}/>
    <path d="M150 440Q120 380 220 350Q330 318 270 268Q230 236 262 206" fill="none" stroke={P.cream} strokeWidth="46" strokeLinecap="round"/>
    <path d="M150 440Q120 380 220 350Q330 318 270 268Q230 236 262 206" fill="none" stroke="#f3dcb4" strokeWidth="6" strokeDasharray="14 16"/>
    <Door x={228} y={120} w={60} h={88} light={P.peach400}/>
    <Door x={318} y={176} w={82} h={118} light={P.honey}/>
    <Door x={70} y={196} w={112} h={160} light={P.cream}/>
    <circle cx="126" cy="280" r="26" fill={P.rose600}/>
    <path d="M114 281l9 9 17-19" stroke={P.cream} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </Symbol>;
}

/** A moment of coaching: what was said, one part marked; what to try, with a check. */
export function Coach() {
  return <Symbol>
    <circle cx="255" cy="186" r="160" fill={P.peach200}/>
    <rect x="70" y="72" width="262" height="116" rx="32" fill={P.rose600}/><path d="M118 186l-8 42 48-42Z" fill={P.rose600}/>
    <path d="M110 116h92M110 150h140" stroke={P.cream} strokeWidth="13" strokeLinecap="round"/>
    <path d="M222 116h70" stroke={P.plinth} strokeWidth="13" strokeLinecap="round"/>
    <path d="M216 100l82 32" stroke={P.cream} strokeWidth="6" strokeLinecap="round"/>
    <rect x="160" y="232" width="286" height="124" rx="32" fill={P.cream}/><path d="M404 354l30 40-2-40Z" fill={P.cream}/>
    <path d="M200 280h96M200 316h170" stroke={P.rose900} strokeWidth="13" strokeLinecap="round"/>
    <path d="M314 280h70" stroke={P.amber} strokeWidth="17" strokeLinecap="round"/>
    <circle cx="436" cy="238" r="34" fill={P.frame}/>
    <path d="M421 239l11 11 20-22" stroke={P.cream} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </Symbol>;
}
