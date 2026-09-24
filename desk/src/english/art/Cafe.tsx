/**
 * Different tastes, good conversation: Taylor holds a cup of tea at a small café table; on the learner's side is
 * a glass of juice. Two drinks, two tastes, a chalkboard menu. Friendly and ordinary: no hearts, candles or roses.
 */
import { P } from "./palette";
import { Arm, Person } from "./Person";
import { Floor, Glow, Lamp, Scene } from "./Room";

export function Cafe() {
  return <Scene wall={["#b7676a", "#e3a07c", "#f4c898"]}>{u => <>
    <Floor u={u} y={410}/>
    {/* the big window onto the street */}
    <rect x="96" y="176" width="252" height="226" fill="#f7dcae"/>
    <Glow u={u} x={170} y={300} r={60} color={P.peach600} opacity={.5}/>
    <circle cx="276" cy="318" r="44" fill="#e9b58c" opacity=".7"/><circle cx="150" cy="330" r="36" fill="#e9b58c" opacity=".6"/>
    <path d="M96 176h252v226H96ZM222 176v226M96 290h252" fill="none" stroke="#67394c" strokeWidth="10"/>
    {/* the chalkboard menu */}
    <rect x="474" y="166" width="170" height="156" rx="4" fill={P.plum800} stroke="#c98a5a" strokeWidth="9"/>
    <path d="M500 196h86M500 230h112M500 256h92M500 282h104" stroke={P.cream} strokeWidth="5" strokeLinecap="round" opacity=".85"/>
    <path d="M600 186h24l-3 22h-18Z" fill={P.cream} opacity=".85"/>
    <Lamp u={u} x={367} len={72}/>
    {/* Taylor, holding a cup */}
    <Person x={367} y={300} s={.9} skin="light" hair="plum" style="long" top="#7b4a5c" collar="round">
      <Arm d="M-96 150Q-108 196-64 216" color="#7b4a5c" hand={[-50, 218]} skin="light" w={38} r={22}/>
      <Arm d="M104 150Q120 200 70 216" color="#7b4a5c" hand={[58, 218]} skin="light" w={38} r={22}/>
    </Person>
    {/* the round table */}
    <path d="M350 578h34v120h-34Z" fill={P.frame}/><ellipse cx="367" cy="700" rx="92" ry="14" fill={P.plinth}/>
    <ellipse cx="367" cy="548" rx="312" ry="44" fill={P.paper} stroke="#86505a" strokeWidth="8"/>
    {/* Taylor's tea */}
    <path d="M318 488h58l-7 40h-44Z" fill={P.cream}/><path d="M376 496q18 0 16 14t-18 10" fill="none" stroke={P.cream} strokeWidth="6"/>
    <ellipse cx="347" cy="530" rx="44" ry="8" fill={P.cream2} stroke="#86505a" strokeWidth="3"/>
    <path d="M336 478q-8-6 0-12t0-12t0-12M354 478q-8-6 0-12t0-12t0-12" fill="none" stroke={P.cream3} strokeWidth="5" strokeLinecap="round" opacity=".8"/>
    <circle cx="322" cy="504" r="20" fill="#f1c3a4"/><circle cx="374" cy="504" r="20" fill="#f1c3a4"/>
    {/* the learner's juice */}
    <path d="M480 446h44l-6 88h-32Z" fill={P.honey} opacity=".92" stroke="#86505a" strokeWidth="3"/>
    <path d="M482 466h40" stroke="#e39a5c" strokeWidth="5"/>
    <path d="M506 446l18-36" stroke={P.rose600} strokeWidth="5" strokeLinecap="round"/>
    <circle cx="482" cy="448" r="13" fill="#e9a36a"/><circle cx="482" cy="448" r="6" fill={P.honey}/>
    {/* a small plant in a pot */}
    <path d="M186 544h42l-6-32h-30Z" fill="#c98a5a"/><path d="M188 520h38" stroke="#a5633a" strokeWidth="5"/>
    <path d="M207 512q-20-8-24-34q18 4 24 24q4-22 22-28q2 24-22 38Z" fill={P.leaf}/><path d="M207 512q-2-26 4-40" fill="none" stroke={P.stem} strokeWidth="4" strokeLinecap="round"/>
  </>}</Scene>;
}
