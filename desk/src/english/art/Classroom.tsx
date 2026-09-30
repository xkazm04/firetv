/**
 * Say that again, please: Ms Hale, a teacher, stands beside the chalkboard with a sentence half written. The board
 * says "Turn to page" and then stops: the number she said too fast is the same dashed rose gap as the hotel's
 * missing ledger line. A window, a wall clock and two pupils' desks in front say "school" without the words.
 */
import { P } from "./palette";
import { Arm, Person } from "./Person";
import { Floor, Glow, Scene } from "./Room";

const CHALK = "#fff3dc";

/** A pupil's desk seen from the front: a slanted top, a front rail, two legs. */
function Desk({ x, y, w = 270 }: { x: number; y: number; w?: number }) {
  return <g>
    <path d={`M${x + 14} ${y}h${w - 28}l16 34H${x - 2}Z`} fill={P.paper} stroke="#86505a" strokeWidth="6" strokeLinejoin="round"/>
    <rect x={x - 2} y={y + 34} width={w + 4} height="20" fill={P.rose400}/>
    <rect x={x + 22} y={y + 54} width="14" height="120" fill={P.plum800}/><rect x={x + w - 36} y={y + 54} width="14" height="120" fill={P.plum800}/>
  </g>;
}

export function Classroom() {
  return <Scene wall={["#b86e68", "#e2a07d", "#f3c697"]}>{u => <>
    <Floor u={u} y={446}/>
    {/* the window, morning light */}
    <path d="M540 208Q540 150 590 150Q640 150 640 208V420H540Z" fill="#67394c" stroke="#f4d1a5" strokeWidth="10"/>
    <path d="M552 208Q552 162 590 162Q628 162 628 208V408H552Z" fill="#f5d7a3"/>
    <Glow u={u} x={590} y={260} r={44} color="#fff1cc" opacity={.8}/>
    <path d="M590 162v246M552 268h76" stroke="#67394c" strokeWidth="7"/>
    <path d="M530 420h120" stroke={P.frame} strokeWidth="10" strokeLinecap="round"/>
    {/* the wall clock */}
    <circle cx="226" cy="136" r="27" fill={P.cream2} stroke={P.plum500} strokeWidth="6"/>
    <path d="M226 136v-16M226 136l12 8" stroke={P.plum500} strokeWidth="4" strokeLinecap="round"/><circle cx="226" cy="136" r="3.5" fill={P.plum500}/>
    {/* the chalkboard: a sentence that stops, and the gap where the answer goes */}
    <rect x="98" y="182" width="330" height="208" rx="8" fill={P.plum600} stroke={P.peach700} strokeWidth="11"/>
    <path d="M124 222h132" stroke={CHALK} strokeWidth="6" strokeLinecap="round" opacity=".75"/>
    <text x="124" y="296" fill={CHALK} fontFamily="Georgia,serif" fontSize="31">Turn to page</text>
    <rect x="316" y="266" width="66" height="42" rx="6" fill="none" stroke="#e08a86" strokeWidth="5" strokeDasharray="8 7"/>
    <path d="M124 344h78M214 344h48" stroke={CHALK} strokeWidth="6" strokeLinecap="round" opacity=".5"/>
    <path d="M98 390h330" stroke={P.frame} strokeWidth="10"/><rect x="124" y="394" width="34" height="9" rx="3" fill={CHALK}/><rect x="168" y="396" width="22" height="7" rx="3" fill={P.peach400}/>
    {/* Ms Hale, one hand towards the board */}
    <Person x={470} y={300} s={.9} skin="warm" hair="amber" style="bun" top={P.wine} collar="shirt" glasses mouth="smile">
      <Arm d="M-92 150Q-158 136-192 82" color={P.wine} hand={[-198, 68]} skin="warm" r={26}/>
    </Person>
    {/* the desks in front: an open exercise book and a pencil on one, a stack of books and an apple on the other; they hide where Ms Hale's body ends */}
    <Desk x={12} y={548} w={308}/>
    <path d="M62 556l100-4 16 26-106 4Z" fill={P.cream2} stroke={P.wine2} strokeWidth="4"/><path d="M112 554l16 26" stroke={P.wine2} strokeWidth="3"/>
    <path d="M78 564l36-1m-32 8l34-1M134 560l32-1m-28 8l30-1" stroke="#bb8e83" strokeWidth="3" strokeLinecap="round"/>
    <path d="M214 572l74-32" stroke={P.amber} strokeWidth="9" strokeLinecap="round"/>
    <Desk x={318} y={542} w={396}/>
    <rect x="446" y="548" width="104" height="14" rx="3" fill={P.rose900}/><rect x="454" y="534" width="90" height="14" rx="3" fill={P.amber}/><rect x="464" y="520" width="76" height="14" rx="3" fill={P.frame}/>
    <circle cx="640" cy="552" r="22" fill={P.brick}/><path d="M640 532q4-12 12-14" fill="none" stroke={P.stem} strokeWidth="5" strokeLinecap="round"/>
  </>}</Scene>;
}
