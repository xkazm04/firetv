/** The first hello: Jamie waves from a club evening, a name sticker on, bunting overhead, cookies on the table. */
import { P } from "./palette";
import { Arm, Person } from "./Person";
import { Counter, Floor, Glow, Scene } from "./Room";

/** Points on the bunting's string, and the flag colours in turn. */
const FLAGS = [[105, 163], [171, 174], [236, 181], [302, 186], [367, 187], [433, 186], [498, 181], [564, 174], [629, 163]];
const FLAG_FILL = [P.rose900, P.cream, P.amber, P.leaf];

export function Meet() {
  return <Scene wall={["#c47a6a", "#e8ab83", "#f7cf9c"]}>{u => <>
    <Floor u={u}/>
    {/* the noticeboard */}
    <rect x="72" y="238" width="182" height="150" rx="6" fill="#7a4a55" stroke="#f6d0a1" strokeWidth="7"/>
    <rect x="90" y="256" width="62" height="46" fill={P.cream} transform="rotate(-4 121 279)"/>
    <rect x="164" y="252" width="70" height="54" fill={P.peach400} transform="rotate(3 199 279)"/>
    <rect x="98" y="316" width="74" height="52" fill="#e9b78a" transform="rotate(2 135 342)"/>
    <rect x="186" y="320" width="50" height="46" fill={P.cream2} transform="rotate(-3 211 343)"/>
    <path d="M102 274h36m-34 12h24M176 272h44m-42 13h30M110 336h48m-46 13h30" stroke="#ad675d" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="121" cy="258" r="5" fill={P.rose900}/><circle cx="199" cy="254" r="5" fill={P.rose900}/><circle cx="135" cy="318" r="5" fill={P.rose900}/>
    {/* the arched window, evening light */}
    <path d="M482 196Q482 124 562 124Q642 124 642 196v196H482Z" fill="#67394c" stroke="#f4d1a5" strokeWidth="10"/>
    <path d="M496 196Q496 138 562 138Q628 138 628 196v184H496Z" fill="#f5d7a3"/>
    <Glow u={u} x={562} y={220} r={46} color="#fff1cc" opacity={.8}/>
    <path d="M562 138v242M496 256h132" stroke="#67394c" strokeWidth="8"/>
    {/* bunting */}
    <path d="M40 150Q367 225 695 150" fill="none" stroke={P.frame} strokeWidth="4"/>
    {FLAGS.map(([x, y], i) => <path key={x} d={`M${x - 22} ${y - 4}h44l-22 46Z`} fill={FLAG_FILL[i % 4]}/>)}
    {/* Jamie, waving hello */}
    <Person x={367} y={306} s={.96} skin="tan" hair="dark" style="curly" top={P.rose900} collar="round" mouth="open">
      <rect x="22" y="150" width="72" height="46" rx="6" fill={P.cream3}/><rect x="22" y="150" width="72" height="14" rx="4" fill={P.rose600}/>
      <path d="M34 180h46" stroke={P.rose600} strokeWidth="5" strokeLinecap="round"/>
      <Arm d="M-92 152Q-142 118-150 44" color={P.rose900} hand={[-152, 24]} skin="tan" r={27}/>
      <path d="M-200 -6q-12 26 0 52M-218 -20q-18 40 0 80" fill="none" stroke={P.cream3} strokeWidth="6" strokeLinecap="round"/>
    </Person>
    {/* the table: a scalloped cloth, cookies, two cups */}
    <Counter u={u} y={520}/>
    {Array.from({ length: 19 }, (_, i) => <circle key={i} cx={i * 40 + 8} cy={566} r="13" fill={P.paper}/>)}
    <ellipse cx="250" cy="524" rx="84" ry="14" fill={P.cream2} stroke={P.wine2} strokeWidth="5"/>
    {[[218, 510], [252, 505], [286, 511]].map(([x, y]) => <g key={x}><circle cx={x} cy={y} r="17" fill={P.amber}/><circle cx={x - 5} cy={y - 4} r="3" fill={P.frame}/><circle cx={x + 6} cy={y + 3} r="3" fill={P.frame}/></g>)}
    <path d="M456 476h38l-6 48h-26Z" fill={P.cream} stroke={P.wine2} strokeWidth="4"/><path d="M459 494h32" stroke={P.rose600} strokeWidth="6"/>
    <path d="M512 482h38l-6 44h-26Z" fill={P.cream} stroke={P.wine2} strokeWidth="4"/><path d="M515 498h32" stroke={P.leaf} strokeWidth="6"/>
  </>}</Scene>;
}
