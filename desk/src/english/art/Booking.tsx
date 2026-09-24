/**
 * A booking that is missing: Robin searches the reservation ledger, one line of it empty, while a guest's suitcase
 * waits at the desk. This is the winning topic page's illustration, ported shape for shape; it is the reference the
 * other seven situations are drawn against.
 */
import { P } from "./palette";
import { Counter, Floor, Glow, Lamp, Plant, Scene } from "./Room";

export function Booking() {
  return <Scene>{u => <>
    <path d="M37 35h661v510H37z" fill="none" stroke="#f8d7a4" strokeWidth="5" opacity=".55"/>
    <path d="M92 29v472M643 29v472" stroke="#894658" strokeWidth="20" opacity=".46"/>
    <Floor u={u}/>
    {/* back window and curtains */}
    <path d="M105 178Q105 77 206 77Q307 77 307 178v218H105Z" fill="#67394c" stroke="#f4d1a5" strokeWidth="11"/>
    <path d="M125 178Q125 96 206 96Q287 96 287 178v205H125Z" fill="#ecd5ab"/>
    <path d="M125 178Q125 96 206 96Q287 96 287 178v205H125Z" fill="#8f6a76" opacity=".72"/>
    <Glow u={u} x={206} y={181} r={48}/>
    <path d="M137 305q64-77 137-20v98H137Z" fill="#6d5b66"/><path d="M126 97q34 17 42 58v237h-43ZM287 97q-34 17-42 58v237h43Z" fill={P.rose900}/>
    {/* reception sign and key board */}
    <rect x="400" y="72" width="235" height="144" rx="7" fill={P.plum500} stroke="#f6d0a1" strokeWidth="8"/>
    <text x="517" y="129" textAnchor="middle" fill="#fff1d1" fontFamily="Georgia,serif" fontSize="39" letterSpacing="4">HOTEL</text>
    <path d="M433 154h169M470 176h95" stroke="#dfa980" strokeWidth="3"/>
    <path d="M459 192v11m51-11v11m51-11v11" stroke="#f3d2aa" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="459" cy="202" r="6" fill="#f3d2aa"/><circle cx="510" cy="202" r="6" fill="#f3d2aa"/><circle cx="561" cy="202" r="6" fill="#f3d2aa"/>
    <Lamp u={u} x={355}/>
    <Plant x={94} y={448}/>
    {/* Robin's jacket and neck */}
    <path d="M330 432q40-58 99-57q73 0 112 60l24 138H301Z" fill={P.plum800}/>
    <path d="M409 356h48v62q-25 26-48 0Z" fill="#dd9b86"/>
    <path d="M389 390l42 36-33 46-45-67m119-15-41 36 33 46 46-67" fill={P.collar}/>
    <path d="M397 472l34-46 33 46-32 112Z" fill={P.rose700}/>
    <path d="M326 460q7 75 20 112m188-117q-10 75-18 117" fill="none" stroke={P.plum300} strokeWidth="6"/>
    <rect x="466" y="462" width="58" height="27" rx="3" fill="#f1c99d"/><path d="M475 470h39m-39 9h27" stroke="#a35c5c" strokeWidth="3"/>
    {/* Robin's face and hair */}
    <ellipse cx="430" cy="294" rx="85" ry="102" fill={P.plum600}/>
    <path d="M357 288q-3-78 72-91q78 4 80 90q-3 85-77 100q-71-12-75-99Z" fill="#e9ad92"/>
    <path d="M347 287q-20-94 39-122q64-36 119 11q34 30 14 103q-27-16-38-52q-65 33-126 42Z" fill={P.plum700}/>
    <path d="M365 287q-20 18-4 42l18 2m123-44q21 18 5 42l-18 2" fill="#db9d83"/>
    <path d="M390 297q12-8 24 0m44 0q12-8 24 0" fill="none" stroke="#674852" strokeWidth="5" strokeLinecap="round"/>
    <circle cx="402" cy="303" r="4" fill={P.ink}/><circle cx="469" cy="303" r="4" fill={P.ink}/>
    <path d="M434 309l-5 18h10" fill="none" stroke="#ba7c71" strokeWidth="4" strokeLinecap="round"/>
    <path d="M409 344q25 18 48-1" fill="none" stroke="#8d4a51" strokeWidth="5" strokeLinecap="round"/>
    <path d="M376 185q34-32 83-14" fill="none" stroke="#6e4955" strokeWidth="12" strokeLinecap="round"/>
    {/* counter, the missing line in the ledger, bell */}
    <Counter u={u}/>
    <path d="M260 529l192-10 65 80-197 12Z" fill={P.cream2} stroke={P.wine2} strokeWidth="5"/>
    <path d="M297 550l131-7m-122 21 135-7m-128 22 65-3m30-3 47-3" stroke="#bb8e83" strokeWidth="5" strokeLinecap="round"/>
    <rect x="389" y="565" width="66" height="20" rx="5" fill="none" stroke="#af5360" strokeWidth="4" strokeDasharray="7 6"/>
    <circle cx="135" cy="524" r="27" fill={P.honey}/><path d="M105 531h60" stroke="#6d4351" strokeWidth="8" strokeLinecap="round"/><path d="M135 498v-11" stroke={P.honey} strokeWidth="8"/>
    {/* guest's suitcase at right */}
    <path d="M635 497v-52q0-15 16-15h20q16 0 16 15v52" fill="none" stroke="#4e3547" strokeWidth="12"/>
    <rect x="597" y="480" width="124" height="183" rx="17" fill="#693e50" stroke="#e4a77d" strokeWidth="6"/>
    <path d="M626 490v160m62-160v160" stroke="#a96966" strokeWidth="8"/><rect x="647" y="527" width="23" height="44" rx="4" fill="#efc995"/>
    <circle cx="622" cy="674" r="13" fill="#432e41"/><circle cx="693" cy="674" r="13" fill="#432e41"/>
  </>}</Scene>;
}
