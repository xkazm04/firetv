/**
 * Beyond the rehearsed answer: Jordan reads the learner's page across an office desk, a window with blinds and a
 * small chart behind. The back of the learner's own chair is in the foreground.
 */
import { P } from "./palette";
import { Arm, Person } from "./Person";
import { Counter, Floor, Plant, Scene } from "./Room";

export function Interview() {
  return <Scene wall={["#a86468", "#d99a80", "#efc39a"]}>{u => <>
    <Floor u={u}/>
    {/* the window: a skyline behind blinds */}
    <rect x="92" y="150" width="232" height="232" fill="#f5d7a3"/>
    <path d="M110 382v-80h40v80M160 382V270h50v112M220 382v-72h40v72M270 382v-96h40v96" fill="#d48e72" opacity=".75"/>
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M96 ${166 + i * 22}h224`} stroke="#e4a27c" strokeWidth="7" opacity=".8"/>)}
    <rect x="92" y="150" width="232" height="232" fill="none" stroke="#67394c" strokeWidth="10"/>
    {/* a framed chart */}
    <rect x="470" y="168" width="152" height="112" fill={P.cream2} stroke={P.plum500} strokeWidth="8"/>
    <path d="M494 262h20v-22h-20ZM524 262h20v-38h-20ZM554 262h20v-58h-20Z" fill={P.rose600}/>
    <path d="M492 232l32-18 30-8 36-26" fill="none" stroke={P.amber} strokeWidth="5" strokeLinecap="round"/>
    <Plant x={666} y={498} s={.9}/>
    {/* Jordan, reading the page */}
    <Person x={367} y={292} s={.95} skin="deep" hair="dark" style="crop" top={P.plum800} collar="shirt" tie={P.collar} glasses>
      <Arm d="M-96 150Q-110 200-68 232" color={P.plum800} hand={[-62, 234]} skin="deep" w={38} r={22}/>
      <Arm d="M104 150Q124 204 78 230" color={P.plum800} hand={[70, 230]} skin="deep" w={38} r={22}/>
    </Person>
    {/* the desk: the page, a glass of water, pens, a folder */}
    <Counter u={u} y={520} top="#f1d2a6"/>
    <path d="M296 468l116-10 8 72-116 10Z" fill={P.cream2} stroke={P.wine2} strokeWidth="4"/>
    <path d="M314 484l60-5m-58 19 80-7m-78 21 70-6" stroke="#bb8e83" strokeWidth="5" strokeLinecap="round"/>
    <circle cx="303" cy="500" r="21" fill="#8f5a45"/><circle cx="415" cy="490" r="21" fill="#8f5a45"/>
    <path d="M520 470h34l-4 54h-26Z" fill="#fbe9cf" opacity=".85" stroke="#86505a" strokeWidth="3"/><path d="M523 490h28" stroke="#e4a27c" strokeWidth="3"/>
    <rect x="146" y="484" width="38" height="40" rx="4" fill={P.frame}/>
    <path d="M154 484l-6-30M166 484v-34M176 484l6-28" stroke={P.rose600} strokeWidth="5" strokeLinecap="round"/>
    <path d="M572 516l96-4 12 16-98 4Z" fill={P.rose600}/>
    {/* the learner's chair */}
    <path d="M528 718v-104q0-30 30-30h112q30 0 30 30v104Z" fill={P.plinth}/>
    <path d="M552 612h124" stroke="#7a4a55" strokeWidth="8" strokeLinecap="round"/>
  </>}</Scene>;
}
