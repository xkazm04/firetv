/**
 * The missing moon rover: Pip, a friendly robot guide, points the way across the moon. The rover's tracks lead
 * behind a boulder, where only its antenna shows and a question hangs over it. Playful, never dangerous.
 */
import { P } from "./palette";
import { Glow, Scene } from "./Room";

const STARS = [[182, 172, 4], [262, 112, 3], [420, 88, 4], [516, 132, 3], [330, 206, 3], [124, 256, 3], [640, 290, 4], [462, 236, 3], [232, 244, 3], [612, 214, 3], [380, 150, 3]];
const DARK = "#553247";

export function Rover() {
  return <Scene wall={["#3f2638", "#6a3946", "#b0626a"]}>{u => <>
    <rect width="735" height="718" fill="#4a2c40" opacity=".55"/>
    {STARS.map(([x, y, r]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff5db"/>)}
    {/* a warm planet in the sky */}
    <Glow u={u} x={548} y={184} r={92} color={P.peach200} opacity={.22}/>
    <circle cx="548" cy="184" r="62" fill={P.peach200}/>
    <path d="M512 166q20-22 42-4q10 22-10 30q-24 4-32-26ZM562 206q24-6 30 14q-10 16-30 10Z" fill={P.peach600}/>
    {/* the ground: a far ridge, the pale surface, craters */}
    <path d="M0 432Q180 384 360 420Q540 372 735 420V718H0Z" fill="#8e4458"/>
    <path d="M0 482Q360 432 735 482V718H0Z" fill="#e3b995"/>
    <path d="M0 560Q360 520 735 566V718H0Z" fill="#d5a283"/>
    <ellipse cx="150" cy="548" rx="54" ry="14" fill="#c98a76"/><ellipse cx="150" cy="544" rx="40" ry="8" fill="#d9a489"/>
    <ellipse cx="410" cy="652" rx="72" ry="18" fill="#bf7f70"/><ellipse cx="410" cy="647" rx="54" ry="10" fill="#cf9480"/>
    {/* the rover's tracks, leading behind the boulder */}
    <path d="M300 718Q420 578 548 500M346 718Q456 588 578 508" fill="none" stroke="#b0626a" strokeWidth="7" strokeDasharray="14 11"/>
    <path d="M614 470v-54l22-30" fill="none" stroke={DARK} strokeWidth="9" strokeLinecap="round"/>
    <circle cx="640" cy="380" r="13" fill={DARK}/>
    <path d="M520 504q26-66 96-58q56 8 70 64Z" fill={P.rose900}/><path d="M548 486q30-30 70-24" fill="none" stroke={P.rose600} strokeWidth="8" strokeLinecap="round"/>
    <circle cx="672" cy="322" r="26" fill={P.cream}/><path d="M654 340l-6 16 18-10Z" fill={P.cream}/>
    <text x="672" y="334" textAnchor="middle" fill={P.rose900} fontFamily="Georgia,serif" fontSize="34" fontWeight="bold">?</text>
    {/* Pip */}
    <ellipse cx="282" cy="512" rx="92" ry="13" fill="#8e4458" opacity=".45"/>
    <path d="M282 172v30" stroke={DARK} strokeWidth="7"/><circle cx="282" cy="162" r="13" fill={P.honey}/>
    <circle cx="214" cy="252" r="13" fill={P.rose600}/><circle cx="350" cy="252" r="13" fill={P.rose600}/>
    <rect x="216" y="200" width="132" height="102" rx="34" fill={P.cream}/>
    <rect x="234" y="222" width="96" height="54" rx="25" fill={DARK}/>
    <circle cx="264" cy="248" r="9" fill={P.honey}/><circle cx="300" cy="248" r="9" fill={P.honey}/>
    <path d="M270 263q12 8 24 0" fill="none" stroke={P.honey} strokeWidth="4" strokeLinecap="round"/>
    <rect x="268" y="300" width="28" height="16" fill={DARK}/>
    <path d="M354 352Q412 352 452 306" fill="none" stroke={P.cream} strokeWidth="26" strokeLinecap="round"/><circle cx="458" cy="298" r="17" fill={P.rose600}/>
    <path d="M210 352Q180 398 196 440" fill="none" stroke={P.cream} strokeWidth="26" strokeLinecap="round"/><circle cx="198" cy="446" r="16" fill={P.rose600}/>
    <rect x="206" y="314" width="152" height="150" rx="30" fill={P.cream}/>
    <rect x="236" y="344" width="92" height="62" rx="12" fill="#6c3c4f"/>
    <circle cx="258" cy="375" r="8" fill="#e9b78a"/><circle cx="282" cy="375" r="8" fill={P.rose600}/><circle cx="306" cy="375" r="8" fill={P.honey}/>
    <path d="M250 424h64" stroke="#e3c9a8" strokeWidth="6" strokeLinecap="round"/>
    <rect x="216" y="462" width="132" height="44" rx="22" fill={DARK}/>
    <circle cx="242" cy="484" r="12" fill="#e9b78a"/><circle cx="282" cy="484" r="12" fill="#e9b78a"/><circle cx="322" cy="484" r="12" fill="#e9b78a"/>
    {/* the sign post Pip points past */}
    <path d="M500 330v140" stroke={P.plinth} strokeWidth="10"/>
    <path d="M500 340h70l16 16-16 16h-70Z" fill={P.honey}/><path d="M500 384h-62l-14 14 14 14h62Z" fill={P.cream}/>
  </>}</Scene>;
}
