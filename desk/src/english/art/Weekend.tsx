/** A little of your world: Casey plays guitar on a park bench on a sunny weekend, a kite overhead, a picnic basket near. */
import { P } from "./palette";
import { Arm, Person } from "./Person";
import { Glow, Scene } from "./Room";

export function Weekend() {
  return <Scene wall={["#e39d7b", "#f3c192", "#fbe3b7"]}>{u => <>
    {/* sun, clouds, kite */}
    <Glow u={u} x={548} y={196} r={110} color="#fff1cc" opacity={.5}/>
    <circle cx="548" cy="196" r="66" fill="#fff1cc"/>
    <path d="M300 170q0-26 28-26q10-22 36-16q22-14 40 8q26 0 26 24Z" fill={P.cream3} opacity=".8"/>
    <path d="M190 118L228 172L190 228L152 172Z" fill={P.rose600}/>
    <path d="M190 118v110M152 172h76" stroke={P.cream} strokeWidth="4"/>
    <path d="M190 228q-14 30 8 52q22 22 0 54" fill="none" stroke={P.frame} strokeWidth="3"/>
    <path d="M186 262l-14 6 14 6ZM200 300l-14 6 14 6Z" fill={P.amber}/>
    {/* hills and trees */}
    <path d="M0 382Q200 300 420 358Q600 310 735 360V718H0Z" fill="#d48e72"/>
    <path d="M0 440Q360 372 735 444V718H0Z" fill="#b86a66"/>
    <rect x="70" y="300" width="20" height="150" fill={P.plinth}/>
    <circle cx="80" cy="282" r="60" fill={P.leaf}/><circle cx="46" cy="316" r="42" fill={P.leaf}/><circle cx="116" cy="318" r="44" fill={P.leaf}/>
    <circle cx="96" cy="262" r="20" fill="#7f8a6f"/>
    <rect x="650" y="316" width="18" height="130" fill={P.plinth}/>
    <circle cx="660" cy="300" r="54" fill={P.leaf}/><circle cx="630" cy="330" r="36" fill={P.leaf}/>
    <circle cx="672" cy="282" r="18" fill="#7f8a6f"/>
    {/* bench */}
    <path d="M176 438h388v18H176ZM176 468h388v18H176Z" fill="#7a4a55"/>
    <path d="M198 438v84M542 438v84" stroke={P.plinth} strokeWidth="14"/>
    {/* Casey with a guitar */}
    <Person x={370} y={318} s={.9} skin="deep" hair="auburn" style="long" top={P.amber} collar="round">
      <Arm d="M-94 152Q-126 150-118 118" color={P.amber} hand={[-116, 110]} skin="deep" w={36} r={22}/>
      <path d="M8 198L-168 92" stroke={P.plinth} strokeWidth="22" strokeLinecap="round"/>
      <rect x="-196" y="70" width="42" height="26" rx="6" fill={P.plinth} transform="rotate(31 -175 83)"/>
      <circle cx="-4" cy="190" r="48" fill="#8c4a3c"/><circle cx="52" cy="214" r="64" fill="#8c4a3c"/>
      <circle cx="20" cy="202" r="17" fill={P.plum900}/>
      <path d="M70 232l-22-14" stroke={P.plum900} strokeWidth="10" strokeLinecap="round"/>
      <path d="M60 226L-166 90" stroke={P.cream} strokeWidth="2.5" opacity=".75"/>
      <Arm d="M104 150Q120 196 76 212" color={P.amber} hand={[66, 214]} skin="deep" w={36} r={22}/>
      <g fill={P.cream3}>
        <circle cx="146" cy="-34" r="11"/><path d="M154 -36v-50l22 8v10l-16-6v38Z"/>
        <circle cx="196" cy="4" r="9"/><path d="M203 2v-36h5v36Z"/>
      </g>
    </Person>
    {/* the grass in front, a book on the bench, a picnic basket */}
    <path d="M0 596Q367 560 735 600V718H0Z" fill="#9a4c5c"/>
    <path d="M214 426l62-6 4 14-62 6Z" fill={P.cream} stroke={P.wine2} strokeWidth="4"/>
    <path d="M572 604q42-58 84 0" fill="none" stroke={P.frame} strokeWidth="9"/>
    <path d="M556 604h116l-12 64h-92Z" fill="#c98a5a"/>
    <path d="M560 604h108l-10 16h-88Z" fill={P.cream}/><path d="M578 604l12 16M604 604l12 16M630 604l12 16" stroke={P.rose600} strokeWidth="8"/>
    <path d="M572 634h84M576 652h76" stroke="#a5633a" strokeWidth="4" opacity=".7"/>
  </>}</Scene>;
}
