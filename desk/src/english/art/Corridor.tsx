/**
 * The lost jacket: a school corridor. Mr Ortiz, the school helper, stands at the lost-property table with a hand up
 * beside the wall hook where a jacket should hang. The jacket is a dashed rose outline, the same gap as the hotel's
 * missing ledger line; on the shelf below sit a bottle, a single glove, a lunchbox and a scarf, and none of them is it.
 *
 * With the lost-property task (L3, lib/english/lostfound.ts) the table holds the shelf's five things instead, each
 * with the mark of where it was found: a thing the learner's words put aside is greyed where it stands, and the thing
 * code found hangs on the hook, filling the outline. The picture reads only the task's public half.
 */
import type { LostTask } from "@/lib/english/lostfound";
import { LostThingArt, PlaceMark } from "./LostThing";
import { P } from "./palette";
import { Arm, Person } from "./Person";
import { Counter, Floor, Scene } from "./Room";

/** The table's five places, left to right, inside the arch and clear of the name tag below. */
const SLOTS = [146, 258, 370, 482, 594];

const LOCKERS = [P.rose900, P.rose700, P.rose900];

export function Corridor({ lost }: { lost?: LostTask | null } = {}) {
  const found = lost?.found ? lost.items.find(x => x.id === lost.found) : undefined;
  return <Scene wall={["#b06a66", "#dd9c7c", "#f1c496"]}>{u => <>
    <Floor u={u} y={440}/>
    {/* the lockers along the wall: vents, handles, a number plate each */}
    <rect x="466" y="160" width="184" height="290" fill={P.plum800}/>
    {LOCKERS.map((c, i) => <g key={i}>
      <rect x={470 + i * 60} y="164" width="56" height="282" fill={c}/>
      <path d={`M${480 + i * 60} 184h36M${480 + i * 60} 194h36M${480 + i * 60} 204h36`} stroke={P.plum700} strokeWidth="4" strokeLinecap="round"/>
      <rect x={478 + i * 60} y="226" width="20" height="12" rx="2" fill={P.peach400}/>
      <rect x={514 + i * 60} y="320" width="6" height="34" rx="3" fill={P.honey}/>
      <path d={`M${470 + i * 60} 424h56`} stroke={P.plum700} strokeWidth="4" opacity=".6"/>
    </g>)}
    <path d="M462 160h192" stroke={P.frame} strokeWidth="10"/>
    {/* a plaque over the lost-property corner */}
    <rect x="236" y="114" width="236" height="40" rx="6" fill={P.plum500} stroke="#f6d0a1" strokeWidth="5"/>
    <text x="354" y="141" textAnchor="middle" fill="#fff1d1" fontFamily="Georgia,serif" fontSize="20" letterSpacing="2">LOST PROPERTY</text>
    {/* the one hook, and the jacket that is not on it */}
    <rect x="98" y="166" width="210" height="16" rx="4" fill={P.frame}/>
    <circle cx="190" cy="196" r="9" fill={P.honey}/><path d="M190 182v14" stroke={P.honey} strokeWidth="7"/>
    {found ? <g data-role="linga-lost-found" data-lost-item={found.id}>
      <circle cx="190" cy="268" r="96" fill={P.honey} opacity=".5"/>
      <LostThingArt thing={found} x={190} y={338} s={1.25}/>
    </g> : <path d="M172 206L138 218L116 302L140 310L150 256V340H230V256L240 310L264 302L242 218L208 206Q190 230 172 206ZM190 226V340" transform="translate(0 -4)" fill="none" stroke="#af5360" strokeWidth="5" strokeDasharray="8 7" strokeLinejoin="round"/>}
    {/* the lost-property shelf: a scarf over the end, a bottle, one glove */}
    <rect x="98" y="398" width="170" height="14" rx="3" fill={P.frame}/>
    <path d="M98 412h170" stroke="#86505a" strokeWidth="4" opacity=".5"/>
    {!lost && <>
      <path d="M100 392h36v20q-2 34 4 62h-30q-6-28-10-62Z" fill={P.rose600}/><path d="M102 424h34M104 448h34" stroke={P.cream2} strokeWidth="6"/>
      <rect x="152" y="346" width="34" height="52" rx="10" fill="#a9b39a"/><rect x="159" y="332" width="20" height="16" rx="4" fill={P.leaf}/>
      <path d="M206 398v-34q0-10 8-10t8 10v-20q0-8 7-8t7 8v20q0-10 7-10t7 10v14q0 30-14 40Z" fill={P.peach600}/>
    </>}
    {/* Mr Ortiz, a hand up beside the hook */}
    <Person x={425} y={300} s={.92} skin="tan" hair="dark" style="crop" top={P.leaf} collar="shirt" badge mouth="smile">
      <Arm d="M-92 150Q-176 150-136 40" color={P.leaf} hand={[-134, 22]} skin="tan" r={26}/>
    </Person>
    {/* the table, and a box of lost things: a jumper, a cap */}
    <Counter u={u} y={532}/>
    {!lost && <>
      <path d="M468 500h150l8 40H460Z" fill={P.peach700} stroke="#86505a" strokeWidth="5" strokeLinejoin="round"/>
      <rect x="486" y="470" width="82" height="38" rx="12" fill={P.peach400}/><path d="M500 484h50M500 496h36" stroke={P.peach700} strokeWidth="5" strokeLinecap="round"/>
      <path d="M562 500q4-40 40-40q30 0 32 40Z" fill={P.leaf}/>
      <rect x="490" y="512" width="60" height="18" rx="3" fill={P.cream2} opacity=".85"/><path d="M498 521h44" stroke="#bb8e83" strokeWidth="4" strokeLinecap="round"/>
    </>}
    {/* the table: each thing on its place, greyed once put aside; the found one is on the hook, not here */}
    {lost?.items.map((x, i) => x.id === found?.id ? null : <g key={x.id} data-role="linga-lost-item" data-lost-item={x.id} data-state={lost.out.includes(x.id) ? "out" : "table"}
      {...(lost.out.includes(x.id) ? { opacity: 0.3, style: { filter: "grayscale(1)" } } : {})}>
      <LostThingArt thing={x} x={SLOTS[i]} y={536}/>
      <PlaceMark place={x.place} x={SLOTS[i]} y={556} r={13}/>
    </g>)}
  </>}</Scene>;
}
