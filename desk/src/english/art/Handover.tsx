/**
 * Clear without getting louder: Morgan, the project partner, explains with an open hand. The wall calendar has the
 * handover date circled; the folder on the desk has the same dashed gap as the hotel ledger - the part that is missing.
 */
import { P } from "./palette";
import { Arm, Person } from "./Person";
import { Counter, Floor, Scene } from "./Room";

export function Handover() {
  return <Scene wall={["#b06a66", "#dd9c7c", "#f1c496"]}>{u => <>
    <Floor u={u}/>
    {/* the wall calendar, one date circled */}
    <rect x="98" y="168" width="206" height="196" fill={P.cream2} stroke={P.plum500} strokeWidth="8"/>
    <rect x="98" y="168" width="206" height="42" fill={P.rose900}/>
    <circle cx="146" cy="168" r="7" fill={P.plum500}/><circle cx="256" cy="168" r="7" fill={P.plum500}/>
    <path d="M110 250h182M110 286h182M110 322h182M146 218v134M184 218v134M220 218v134M258 218v134" stroke="#e0c3a8" strokeWidth="3"/>
    <ellipse cx="239" cy="268" rx="26" ry="20" fill="none" stroke="#b45d61" strokeWidth="5"/>
    <path d="M128 296l12 12m0-12-12 12M164 296l12 12m0-12-12 12" stroke="#c9a28f" strokeWidth="3"/>
    {/* the clock and a shelf of binders */}
    <circle cx="566" cy="188" r="50" fill={P.cream2} stroke={P.plum500} strokeWidth="8"/>
    <path d="M566 188v-30M566 188l22 12" stroke={P.plum500} strokeWidth="6" strokeLinecap="round"/><circle cx="566" cy="188" r="6" fill={P.plum500}/>
    <path d="M500 282h24v80h-24ZM528 292h24v70h-24Z" fill={P.rose900}/><path d="M556 280h24v82h-24Z" fill={P.amber}/><path d="M584 288h24v74h-24Z" fill={P.frame}/>
    <path d="M488 364h150" stroke={P.frame} strokeWidth="9"/>
    {/* Morgan, explaining with an open hand */}
    <Person x={367} y={300} s={.93} skin="warm" hair="auburn" style="short" top={P.rose900} collar="round" mouth="calm">
      <Arm d="M104 150Q150 150 152 98" color={P.rose900} hand={[152, 84]} skin="warm" r={26}/>    </Person>
    {/* the desk: laptop, the folder with its gap, a mug of pencils */}
    <Counter u={u} y={516}/>
    <rect x="96" y="436" width="140" height="84" rx="8" fill={P.frame}/><rect x="108" y="448" width="116" height="60" rx="4" fill="#e9b78a"/>
    <path d="M120 470h40M120 488h70" stroke={P.frame} strokeWidth="5" strokeLinecap="round"/><circle cx="206" cy="474" r="8" fill={P.rose600}/>
    <path d="M82 520h168l-8 9H90Z" fill={P.plum800}/>
    <path d="M300 530l176-8 28 46-182 8Z" fill={P.peach400} stroke={P.wine2} strokeWidth="5"/>
    <path d="M316 534l70-3 20 34-72 3Z" fill={P.cream2}/>
    <path d="M330 546l44-2m-38 14 42-2" stroke="#bb8e83" strokeWidth="4" strokeLinecap="round"/>
    <path d="M412 530l54-2 20 34-56 3Z" fill="none" stroke="#af5360" strokeWidth="4" strokeDasharray="7 6"/>
    <path d="M566 478h44v42h-44Z" fill={P.cream}/><path d="M576 478l-6-30M590 478v-34M602 478l8-28" stroke={P.amber} strokeWidth="6" strokeLinecap="round"/>
  </>}</Scene>;
}
