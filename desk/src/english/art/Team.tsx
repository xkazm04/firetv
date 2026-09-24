/**
 * Make the team work: Sam points at a mission plan on the whiteboard, a dotted route from a start to a flag with a
 * sticky note for each role. The learner sits at the table with another teammate, seen from behind.
 */
import { P } from "./palette";
import { Arm, Person } from "./Person";
import { Counter, Floor, Scene } from "./Room";

const NOTES: Array<[number, number, number, string]> = [[168, 178, -5, P.honey], [272, 190, 4, "#b9bf9e"], [372, 300, -3, "#f0b5a4"]];

export function Team() {
  return <Scene wall={["#b86e68", "#e2a07d", "#f3c697"]}>{u => <>
    <Floor u={u}/>
    {/* the whiteboard and its plan */}
    <rect x="104" y="146" width="410" height="258" rx="10" fill="#fff6e2" stroke={P.frame} strokeWidth="10"/>
    <path d="M152 362Q220 250 300 300T452 206" fill="none" stroke={P.rose900} strokeWidth="6" strokeDasharray="12 10"/>
    <circle cx="152" cy="362" r="14" fill={P.frame}/>
    <path d="M452 206v-44" stroke={P.frame} strokeWidth="5"/><path d="M452 162l36 13-36 13Z" fill={P.rose600}/>
    {NOTES.map(([x, y, a, c]) => <g key={x} transform={`rotate(${a} ${x + 36} ${y + 32})`}>
      <rect x={x} y={y} width="72" height="64" fill={c}/>
      <circle cx={x + 18} cy={y + 20} r="9" fill={P.frame}/>
      <path d={`M${x + 34} ${y + 18}h26M${x + 12} ${y + 42}h48`} stroke={P.wine2} strokeWidth="4" strokeLinecap="round" opacity=".7"/>
    </g>)}
    <rect x="178" y="404" width="262" height="12" rx="4" fill={P.frame}/>
    <rect x="206" y="396" width="40" height="10" rx="3" fill={P.rose600}/><rect x="256" y="396" width="40" height="10" rx="3" fill={P.leaf}/>
    {/* Sam, pointing at the route */}
    <Person x={590} y={300} s={.88} skin="light" hair="plum" style="bun" top={P.leaf} collar="round" mouth="open">
      <Arm d="M-92 150Q-150 110-196 58" color={P.leaf} hand={[-206, 46]} skin="light"/>
      <rect x="-240" y="30" width="38" height="12" rx="4" fill={P.rose600} transform="rotate(-38 -221 36)"/>
    </Person>
    {/* the table: laptop, mugs, a rolled plan */}
    <Counter u={u} y={540}/>
    <rect x="200" y="456" width="146" height="88" rx="8" fill={P.frame}/><circle cx="273" cy="500" r="9" fill={P.honey}/>
    <path d="M186 544h174l-8 9H194Z" fill={P.plum800}/>
    <path d="M420 500h40v42q0 8-8 8h-24q-8 0-8-8Z" fill={P.cream}/><path d="M460 510q18 0 18 14t-18 12" fill="none" stroke={P.cream} strokeWidth="6"/>
    <path d="M430 490q-7-6 0-12t0-12M446 490q-7-6 0-12t0-12" fill="none" stroke={P.cream3} strokeWidth="4" strokeLinecap="round" opacity=".8"/>
    <rect x="96" y="526" width="92" height="20" rx="10" fill={P.cream2} stroke={P.wine2} strokeWidth="4"/>
    {/* a teammate at the table with the learner, from behind */}
    <path d="M488 718q110-96 224 0Z" fill={P.plum800}/>
    <circle cx="600" cy="640" r="60" fill="#8c4a3c"/><path d="M552 616q48-40 96 0" fill="none" stroke="#a8604b" strokeWidth="10" strokeLinecap="round"/>
  </>}</Scene>;
}
