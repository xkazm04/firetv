/**
 * The paper theme's key art: one paper-cut world per app, drawn in layers that slide at their own speeds when the
 * D-pad moves between apps (`d` is how far a layer travels; sky and hills barely, the hero pieces fully). Each world
 * is a function of that app's ArtState (landing/model.ts) - steps lit, a level, paragraphs read - and of nothing
 * else, so the picture is never truer than the session. Math Buddy is a staircase with a lantern and its top in a
 * cloud; Linga a hotel reception at sunset with the empty hook on the key board; Essay Master a tilted page of
 * sentence bars with a loupe. Contest A/1 ("Small Worlds"), redrawn as components.
 */
import type { ReactNode } from "react";
import type { ArtState } from "@/landing/model";
import { Circ, Cloud, Drift, Hill, Rr, SkyGradient, Star, Tree, paint } from "./shapes";

export interface Layer { d: number; k: "sky" | "soft" | "hill" | "hero"; back: boolean; node: ReactNode }
const L = (d: number, k: Layer["k"], back: boolean, node: ReactNode): Layer => ({ d, k, back, node });
const f1 = (n: number) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------- Math Buddy: a paper staircase, one lantern, the top in a cloud

const Plus = ({ x, y, s, r, fill }: { x: number; y: number; s: number; r: number; fill: string }) => (
  <Drift dur={7 + (s % 5)} delay={-(x % 7)}><g transform={`translate(${x} ${y}) rotate(${r}) scale(${s / 40})`}><Rr x={-9} y={-34} w={18} h={68} r={7} fill={fill} /><Rr x={-34} y={-9} w={68} h={18} r={7} fill={fill} /></g></Drift>
);
const Equals = ({ x, y, s, r, fill }: { x: number; y: number; s: number; r: number; fill: string }) => (
  <Drift dur={8 + (s % 4)} delay={-(y % 5)}><g transform={`translate(${x} ${y}) rotate(${r}) scale(${s / 40})`}><Rr x={-34} y={-30} w={68} h={17} r={7} fill={fill} /><Rr x={-34} y={13} w={68} h={17} r={7} fill={fill} /></g></Drift>
);
const Times = ({ x, y, s, r, fill }: { x: number; y: number; s: number; r: number; fill: string }) => (
  <Drift dur={9 + (s % 3)} delay={-(x % 6)}><g transform={`translate(${x} ${y}) rotate(${r}) scale(${s / 40})`}><g transform="rotate(45)"><Rr x={-9} y={-34} w={18} h={68} r={7} fill={fill} /><Rr x={-34} y={-9} w={68} h={18} r={7} fill={fill} /></g></g></Drift>
);

export function mathsWorld(c: Extract<ArtState, { app: "maths" }>): Layer[] {
  const known = c.n != null, n = known ? c.n! : 0, m = c.m;
  const X0 = 560, W = 160, RISE = 54, Y0 = 756;
  const out: Layer[] = [];
  // sky, the sun as a protractor, the dotted path a learner walks
  const ticks = [];
  for (let i = 0; i <= 180; i += 6) {
    const a = i * Math.PI / 180, r2 = i % 30 === 0 ? 168 : i % 10 === 0 ? 184 : 196;
    ticks.push(<line key={i} x1={f1(Math.cos(a) * 208)} y1={f1(-Math.sin(a) * 208)} x2={f1(Math.cos(a) * r2)} y2={f1(-Math.sin(a) * r2)} stroke="#8f9de2" strokeWidth="3" strokeLinecap="round" />);
  }
  out.push(L(0.1, "sky", true, <>
    <defs><SkyGradient id="mSky" stops={[[0, "#566cd8"], [0.42, "#8a9dea"], [0.78, "#d6dcf5"], [1, "#f6ecd9"]]} /></defs>
    <rect x="-1400" y="-900" width="4800" height="2800" fill={paint("mSky")} />
    <circle cx="1560" cy="560" r="440" fill={paint("rWarm")} opacity=".75" />
    <g transform="translate(1560 596)"><path d="M-214 0A214 214 0 0 1 214 0Z" fill={paint("gCream")} /><path d="M-162 0A162 162 0 0 1 162 0Z" fill="#fff0b0" /><path d="M-104 0A104 104 0 0 1 104 0Z" fill="#ffdc70" opacity=".7" />{ticks}</g>
    <path d="M170 770Q880 60 1760 560" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="5" strokeDasharray="1 19" strokeLinecap="round" />
    <Circ x={170} y={770} r={9} fill={paint("gBrass")} />
  </>));
  out.push(L(0.22, "soft", true, <>
    <Drift dur={19}><Cloud x={520} y={214} s={0.62} /></Drift>
    <Drift dur={23} delay={-6}><Cloud x={1720} y={250} s={0.6} /></Drift>
    <Drift dur={27} delay={-11}><Cloud x={120} y={620} s={0.6} /></Drift>
  </>));
  out.push(L(0.34, "hill", true, <><Hill base={640} amp={34} seed={11} fill="#b8c2f2" /><Hill base={690} amp={30} seed={7} fill="#a2aeed" /></>));
  out.push(L(0.6, "hill", true, <><Hill base={752} amp={36} seed={23} fill="#8898e4" /><Hill base={806} amp={26} seed={5} fill="#6f81dc" /></>));
  out.push(L(0.48, "hero", true, <>
    <Plus x={790} y={152} s={62} r={-10} fill={paint("gCream")} /><Equals x={1500} y={236} s={60} r={8} fill={paint("gButter")} />
    <Times x={1120} y={176} s={50} r={0} fill={paint("gCream")} /><Plus x={1790} y={500} s={46} r={16} fill={paint("gCream")} />
  </>));

  // the staircase: lit steps are the ones the marked set got right
  const steps: ReactNode[] = [];
  for (let i = m - 1; i >= 0; i--) {
    const x = X0 + i * W, y = Y0 - i * RISE, lit = i < n;
    const rd = `M${x} ${y + 12}Q${x} ${y} ${x + 12} ${y}L${x + W - 10} ${y}Q${x + W} ${y} ${x + W} ${y + 12}L${x + W} 1100L${x} 1100Z`;
    steps.push(<g key={i}>
      {lit && <ellipse className="pp-pulse" style={{ animationDelay: `${i * 0.45}s` }} cx={x + W / 2} cy={y + 60} rx={W * 0.7} ry="90" fill="#ffe27a" opacity=".5" filter={paint("fB22")} />}
      <path d={rd} fill={lit ? paint("gButter") : paint("gIndigo")} />
      <Rr x={x + W - 12} y={y + 14} w={12} h={400} fill="rgba(20,20,90,.10)" /><Rr x={x} y={y + 14} w={9} h={400} fill="rgba(10,10,70,.16)" />
      <Rr x={x + 18} y={y + 40} w={W - 36} h={74} r={14} fill={lit ? "#ffe37a" : "#2a3a96"} />
      <Rr x={x + 22} y={y + 44} w={W - 44} h={8} r={4} fill={lit ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.10)"} />
      <Rr x={x - 3} y={y - 3} w={W + 6} h={17} r={7} fill={lit ? "#fffdf0" : paint("gCream")} />
      {lit && <circle cx={x + W / 2} cy={y + 77} r="14" fill="#fff8d0" opacity=".9" />}
    </g>);
  }
  // the next step, lit by the lantern, and the paper figure that carries it
  let fx: number, fy: number, nxt: number;
  if (known && n >= 1) { fx = X0 + (n - 1) * W + W / 2; fy = Y0 - (n - 1) * RISE - 3; nxt = n < m ? n : -1; }
  else { fx = X0 - 76; fy = Y0 + 4; nxt = known || c.fresh ? 0 : -1; }
  let lantern: ReactNode = null;
  if (nxt >= 0) {
    const tx = X0 + nxt * W, ty = Y0 - nxt * RISE, lx = fx + 62, ly = fy - 96;
    lantern = <>
      <polygon points={`${lx},${ly} ${tx - 4},${ty - 4} ${tx + W + 4},${ty - 4}`} fill="#ffe680" opacity=".22" />
      <ellipse className="pp-flick" cx={tx + W / 2} cy={ty - 4} rx={W * 0.62} ry="20" fill={paint("rWarm")} />
    </>;
  }
  out.push(L(1, "hero", false, <>
    {steps}{lantern}
    <ellipse cx={fx} cy={fy + 3} rx="34" ry="6" fill="rgba(30,20,60,.25)" />
    <Rr x={fx - 16} y={fy - 26} w={12} h={28} r={5} fill="#3a2a4a" /><Rr x={fx + 4} y={fy - 26} w={12} h={28} r={5} fill="#3a2a4a" />
    <path d={`M${fx - 22} ${fy - 30}L${fx - 15} ${fy - 92}Q${fx} ${fy - 102} ${fx + 15} ${fy - 92}L${fx + 22} ${fy - 30}Q${fx} ${fy - 22} ${fx - 22} ${fy - 30}Z`} fill={paint("gCoral")} />
    <Rr x={fx - 3} y={fy - 90} w={6} h={58} r={3} fill="rgba(255,255,255,.28)" />
    <path d={`M${fx + 14} ${fy - 82}L${fx + 52} ${fy - 100}`} stroke="#d9563a" strokeWidth="11" strokeLinecap="round" />
    <Circ x={fx} y={fy - 118} r={23} fill={paint("gCream")} />
    <path d={`M${fx - 24} ${fy - 122}A24 24 0 0 1 ${fx + 24} ${fy - 122}Q${fx} ${fy - 134} ${fx - 24} ${fy - 122}Z`} fill="#2b1d16" />
    <Circ x={fx + 8} y={fy - 114} r={2.6} fill="#2b1d16" /><Circ x={fx - 8} y={fy - 114} r={2.6} fill="#2b1d16" />
    <circle className="pp-flick" cx={fx + 62} cy={fy - 110} r="66" fill={paint("rWarm")} />
    <Rr x={fx + 51} y={fy - 122} w={22} h={28} r={5} fill={paint("gBrass")} /><Rr x={fx + 55} y={fy - 118} w={14} h={20} r={3} fill="#fff4b8" />
    <path d={`M${fx + 54} ${fy - 122}q8-14 16 0`} fill="none" stroke="#b8862a" strokeWidth="3" />
    {/* the cloud that swallows the top step: what is still to come */}
    <Drift dur={14}><Cloud x={X0 + (m - 1) * W + 92} y={Y0 - (m - 1) * RISE + 24} s={1.08} /></Drift>
  </>));
  out.push(L(1.25, "hero", false, <>
    <Hill base={940} amp={26} seed={91} fill={paint("gIndigo")} />
    <path d="M-140 1100V470C-100 560-30 700 20 830L60 1100Z" fill={paint("gCobalt")} /><path d="M2060 1100V560C2000 650 1930 760 1890 850L1850 1100Z" fill={paint("gCobalt")} />
    <Plus x={190} y={780} s={60} r={-14} fill={paint("gButter")} /><Times x={1760} y={720} s={50} r={0} fill={paint("gCream")} />
  </>));
  return out;
}

// ---------------------------------------------------------------- Linga: a hotel reception at sunset

export function englishWorld(c: Extract<ArtState, { app: "english" }>): Layer[] {
  const out: Layer[] = [], resume = c.resume, tonight = c.next;
  out.push(L(0.1, "sky", true, <>
    <defs><SkyGradient id="lSky" stops={[[0, "#f38a5f"], [0.45, "#f7a878"], [0.78, "#fdd2a0"], [1, "#ffe6bd"]]} />
      <mask id="pp-lMoon"><rect x="-100" y="-100" width="200" height="200" fill="#fff" /><circle cx="30" cy="-16" r="52" fill="#000" /></mask></defs>
    <rect x="-1400" y="-900" width="4800" height="2800" fill={paint("lSky")} />
    <circle cx="960" cy="730" r="520" fill={paint("rWarm")} opacity=".8" /><Circ x={960} y={730} r={250} fill={paint("gButter")} opacity={0.95} /><Circ x={960} y={730} r={190} fill="#fff6cc" opacity={0.55} />
    {tonight && <>
      <g transform="translate(1590 268)"><circle r="120" fill={paint("rCream")} opacity=".7" /><circle r="66" fill="#fff3c4" mask="url(#pp-lMoon)" /></g>
      <Star x={1440} y={210} s={0.8} fill="#fff3c4" /><Star x={1760} y={330} s={0.6} fill="#fff3c4" delay={0.9} /><Star x={1470} y={340} s={0.5} fill="#fff3c4" delay={1.7} />
    </>}
  </>));
  out.push(L(0.22, "soft", true, <>
    <Drift dur={21}><Cloud x={330} y={300} s={0.7} fill="#ffe9d2" /></Drift>
    <Drift dur={25} delay={-8}><Cloud x={1640} y={400} s={0.55} fill="#ffe4c8" /></Drift>
  </>));
  out.push(L(0.34, "hill", true, <><Hill base={650} amp={34} seed={31} fill="#ef9b82" /><Hill base={700} amp={30} seed={12} fill="#e1798a" /></>));
  out.push(L(0.6, "hill", true, <><Hill base={760} amp={36} seed={41} fill="#bd5578" /><Hill base={812} amp={26} seed={17} fill="#93406a" /></>));
  // the doorway behind the counter, with Robin the receptionist in the light
  out.push(L(0.86, "hero", false, <>
    <path d="M976 940V650A179 179 0 0 1 1334 650V940Z" fill="#ffdf8a" opacity=".6" filter={paint("fB22")} transform="translate(0 -8)" />
    <path d="M970 940V650A185 185 0 0 1 1340 650V940Z" fill={paint("gPlum")} />
    <path d="M1000 940V650A155 155 0 0 1 1310 650V940Z" fill={paint("gDoor")} />
    <path d="M1032 940V650A123 123 0 0 1 1278 650V940Z" fill="#fff8d2" opacity=".55" />
    <polygon points="1000,940 1310,940 1420,1060 890,1060" fill="#ffe08a" opacity=".3" />
    <path d="M1000 650A155 155 0 0 1 1310 650" fill="none" stroke="#fff7cf" strokeWidth="3" opacity=".85" transform="translate(0 2)" />
    <path d="M970 650A185 185 0 0 1 1340 650" fill="none" stroke="#a5628f" strokeWidth="3" opacity=".8" />
    <Rr x={1144} y={682} w={22} h={34} r={8} fill="#e9b18c" />
    <path d="M1072 800Q1076 722 1155 712Q1234 722 1238 800Z" fill={paint("gPlum")} /><path d="M1128 714L1155 758L1182 714Z" fill="#fff5e0" />
    <path d="M1155 730L1134 718V742ZM1155 730L1176 718V742Z" fill="#e0553c" /><Circ x={1155} y={730} r={5} fill="#c9432c" /><Circ x={1200} y={750} r={7} fill={paint("gBrass")} />
    <Circ x={1155} y={656} r={33} fill="#f4c7a3" /><path d="M1121 652A34 34 0 0 1 1189 652Q1172 634 1155 640Q1138 634 1121 652Z" fill="#3a2233" />
    <Circ x={1143} y={662} r={3.4} fill="#2b1d16" /><Circ x={1167} y={662} r={3.4} fill="#2b1d16" />
    <path d="M1146 674Q1155 682 1164 674" fill="none" stroke="#2b1d16" strokeWidth="3" strokeLinecap="round" />
    <Circ x={1135} y={672} r={6} fill="#f08c78" opacity={0.5} /><Circ x={1175} y={672} r={6} fill="#f08c78" opacity={0.5} />
  </>));
  // the key board with one empty hook: the moment waiting to be tried
  const tags = ["#fefaee", "#f5b34a", "#8ec39a", "#f0866a"], keys: ReactNode[] = [];
  let k = 0;
  for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) {
    const hx = 660 + i * 76, hy = 566 + j * 64;
    if (i === 2 && j === 1) {
      keys.push(<g key={`${i}${j}`}><Circ x={hx} y={hy} r={9} fill={paint("gBrass")} />
        <circle className="pp-hook" cx={hx} cy={hy} r="16" fill="none" stroke="#ffd76a" strokeWidth="5" /><circle className="pp-hook" style={{ animationDelay: "-1.1s" }} cx={hx} cy={hy} r="16" fill="none" stroke="#ffd76a" strokeWidth="5" /></g>);
      continue;
    }
    keys.push(<g key={`${i}${j}`} className="pp-keys" style={{ animationDelay: `-${(k * 0.37).toFixed(2)}s` }}>
      <Circ x={hx} y={hy} r={6} fill={paint("gBrass")} /><path d={`M${hx} ${hy}v10`} stroke="#e8c26a" strokeWidth="2.5" />
      <Circ x={hx} y={hy + 22} r={11} fill={paint("gBrass")} /><Circ x={hx} y={hy + 22} r={4} fill="#7c3f31" />
      <Rr x={hx - 3.5} y={hy + 30} w={7} h={20} r={2} fill={paint("gBrass")} /><Rr x={hx} y={hy + 42} w={10} h={5} r={2} fill={paint("gBrass")} />
      <Rr x={hx - 9} y={hy + 24} w={8} h={12} r={3} fill={tags[++k % 4]} />
    </g>);
  }
  out.push(L(1, "hero", false, <>
    <Rr x={606} y={508} w={330} h={250} r={22} fill={paint("gWood")} /><Rr x={624} y={526} w={294} h={214} r={14} fill="#7c3f31" /><Rr x={624} y={526} w={294} h={8} r={4} fill="rgba(255,255,255,.14)" />
    {keys}
  </>));
  // the counter and the bell
  out.push(L(1.12, "hero", false, <>
    <path d="M500 796Q500 776 520 776H1580Q1600 776 1600 796V1100H500Z" fill={paint("gTerra")} />
    <Rr x={492} y={766} w={1116} h={20} r={9} fill={paint("gCream")} /><Rr x={492} y={786} w={1116} h={8} r={3} fill={paint("gBrass")} />
    {[0, 1, 2, 3].map((i) => <g key={i}><path d={`M${560 + i * 260} 1080V900a70 70 0 0 1 140 0V1080Z`} fill="#c9592f" opacity=".75" /><path d={`M${574 + i * 260} 1080V904a56 56 0 0 1 112 0V1080Z`} fill="#a8432a" opacity=".55" /></g>)}
    <g transform="translate(250 0)">
      <g className="pp-bell"><path d="M1108 766A47 47 0 0 1 1202 766Z" fill={paint("gBrass")} /><path d="M1122 758A34 34 0 0 1 1150 726" fill="none" stroke="#fff3bd" strokeWidth="5" strokeLinecap="round" /><Circ x={1155} y={712} r={8} fill={paint("gBrass")} /></g>
      <Rr x={1098} y={764} w={114} h={10} r={5} fill={paint("gBrass")} />
      <g className="pp-ring"><path d="M1225 700q22 14 0 28M1240 686q34 28 0 56" fill="none" stroke="#fff3bd" strokeWidth="4" strokeLinecap="round" /></g>
    </g>
  </>));
  // the two speech bubbles and the coaching note: a conversation, mid-way or waiting
  const bars = [22, 46, 74, 40, 88, 56, 76, 44, 62, 30, 18];
  out.push(L(1.3, "hero", false, <>
    <g className="pp-bob"><path d="M1372 594L1352 650L1436 594Z" fill={paint("gCream")} /><Rr x={1352} y={448} w={350} h={148} r={46} fill={paint("gCream")} /><Rr x={1352} y={448} w={350} h={10} r={5} fill="rgba(255,255,255,.7)" />
      {bars.map((b, i) => <rect key={i} className={resume ? "" : "pp-wv"} style={{ animationDelay: `-${(i * 0.13).toFixed(2)}s` }} x={1386 + i * 27} y={522 - b / 2} width="13" height={b} rx="6.5" fill={resume && i > 5 ? "#e9d5bd" : "#d9563a"} />)}
      {resume && <><Circ x={1690} y={452} r={26} fill="#d9563a" /><Rr x={1680} y={440} w={7} h={24} r={3} fill="#fff" /><Rr x={1694} y={440} w={7} h={24} r={3} fill="#fff" /></>}
    </g>
    <g className="pp-bob" style={{ animationDelay: "-2s" }}><path d="M572 606L614 668L636 606Z" fill={paint("gCream")} /><Rr x={370} y={494} w={260} h={116} r={44} fill={paint("gCream")} /><Rr x={370} y={494} w={260} h={10} r={5} fill="rgba(255,255,255,.7)" />
      {[0, 1, 2].map((i) => <circle key={i} className="pp-dot" style={{ animationDelay: `${i * 0.28}s` }} cx={450 + i * 50} cy="552" r="13" fill="#b8552e" />)}
    </g>
    <g className="pp-bob" style={{ animationDelay: "-1s" }}><g transform="translate(1660 420) rotate(8)"><rect x="-56" y="-56" width="112" height="112" rx="6" fill={paint("gYellow")} /><path d="M56 56L20 56L56 20Z" fill="#e6b92e" /><path d="M-32-18H30M-32 4H10M-32 26H-6" stroke="#8a6a1c" strokeOpacity=".55" strokeWidth="6" strokeLinecap="round" /><Circ x={0} y={-52} r={9} fill="#e0483a" /><Circ x={-2.5} y={-55} r={3} fill="#fff" opacity={0.7} /></g></g>
  </>));
  out.push(L(1.25, "hero", false, <>
    <Hill base={950} amp={24} seed={63} fill={paint("gPlum")} />
    <path d="M-140 1100V520C-96 610-40 720 16 836L58 1100Z" fill={paint("gPlum")} /><path d="M2060 1100V600C2004 690 1940 780 1894 860L1850 1100Z" fill={paint("gTerra")} />
  </>));
  return out;
}

// ---------------------------------------------------------------- Essay Master: a tilted page of sentence bars, a loupe, a capped pencil

const TABS = ["#1f4a3a", "#5a9a72", "#d9a441", "#3d7f74", "#1f4a3a", "#d9a441"];
const BW = [470, 396, 500, 436, 360, 478];

/** The page's sentence bars: one a sentence, the one the reading found faulty in coral with its arrow and pen line. */
export function PageBars({ sent, has }: { sent: number | null; has: boolean }) {
  const y0 = -140, pitch = 44, bars: ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const y = y0 + i * pitch, hot = sent === i + 1;
    if (!has) { bars.push(<Rr key={i} x={-235} y={y} w={BW[i]} h={24} r={12} fill="rgba(31,74,58,.10)" />); continue; }
    const e = -235 + BW[i];
    bars.push(<g key={i}>
      <Rr x={-286} y={y} w={30} h={24} r={7} fill={TABS[i]} />
      <Rr x={-235} y={y} w={BW[i]} h={24} r={12} fill={hot ? paint("gCoral") : paint("gLeaf")} />
      <Rr x={-232} y={y + 2} w={BW[i] - 6} h={6} r={3} fill="rgba(255,255,255,.32)" />
      {hot && <>
        <path d={`M${e + 14} ${y + 12}L${e + 40} ${y - 4}L${e + 40} ${y + 6}L${e + 72} ${y + 6}L${e + 72} ${y + 18}L${e + 40} ${y + 18}L${e + 40} ${y + 28}Z`} fill="#d9563a" stroke="#fff5e4" strokeWidth="3" strokeLinejoin="round" />
        <path className="pp-marker" d={`M-235 ${y + 34}q120-8 240 0t230 -2`} fill="none" stroke="#f0654a" strokeWidth="5" strokeLinecap="round" opacity=".8" />
      </>}
    </g>);
  }
  // the dashed empty bar: what the paragraph lacks
  bars.push(has ? <rect key="lack" x="-235" y={y0 + 6 * pitch} width="300" height="24" rx="12" fill="none" stroke="#1f4a3a" strokeWidth="3.5" strokeDasharray="10 9" opacity=".7" />
    : <Rr key="lack" x={-235} y={y0 + 6 * pitch} w={300} h={24} r={12} fill="rgba(31,74,58,.10)" />);
  return <>{bars}</>;
}

export function essayWorld(c: Extract<ArtState, { app: "essay" }>): Layer[] {
  const out: Layer[] = [], sent = c.sent, has = c.sent != null || c.paras > 0;
  out.push(L(0.1, "sky", true, <>
    <defs><SkyGradient id="eSky" stops={[[0, "#68a382"], [0.42, "#9bc79b"], [0.75, "#d4e7bb"], [1, "#f2f1d3"]]} /></defs>
    <rect x="-1400" y="-900" width="4800" height="2800" fill={paint("eSky")} />
    <circle cx="1660" cy="330" r="330" fill={paint("rCream")} opacity=".8" /><Circ x={1660} y={330} r={92} fill="#fff8e2" opacity={0.95} /><Circ x={1660} y={330} r={66} fill="#fffdf3" />
  </>));
  out.push(L(0.22, "soft", true, <><Drift dur={22}><Cloud x={300} y={300} s={0.7} /></Drift><Drift dur={26} delay={-9}><Cloud x={1420} y={220} s={0.55} /></Drift></>));
  out.push(L(0.34, "hill", true, <><Hill base={650} amp={34} seed={51} fill="#b7d3a3" /><Hill base={700} amp={30} seed={9} fill="#a3c896" /><Tree x={240} y={690} s={0.8} c1="#6fa889" c2="#4f8c6c" /><Tree x={1780} y={700} s={0.7} c1="#6fa889" c2="#4f8c6c" /></>));
  out.push(L(0.6, "hill", true, <><Hill base={764} amp={34} seed={61} fill="#8dbb8c" /><Tree x={420} y={800} s={1} c1="#58a06c" c2="#3a7d55" /><Tree x={1610} y={806} s={0.95} c1="#58a06c" c2="#3a7d55" /><Hill base={816} amp={24} seed={27} fill="#6aa57a" /></>));
  // the paragraphs read, stacked at the side
  if (c.paras > 0) out.push(L(0.92, "hero", false, <>{Array.from({ length: c.paras }, (_, i) => (
    <g key={i} transform={`translate(${585 + i * 26} ${700 - i * 20}) rotate(${-9 + i * 6})`}>
      <Rr x={-96} y={-128} w={192} h={256} r={10} fill={paint("gPage")} /><Rr x={-96} y={-128} w={192} h={8} r={4} fill="#fff" />
      <path d="M-64-84H60M-64-56H44M-64-28H62M-64 0H30" stroke="#5f9273" strokeOpacity=".6" strokeWidth="9" strokeLinecap="round" /><Rr x={-96} y={60} w={8} h={46} r={3} fill={TABS[i % 4]} />
    </g>))}</>));
  // the tilted page
  out.push(L(1, "hero", false, <g transform="translate(1190 650) rotate(-4)">
    <Rr x={-320} y={-186} w={640} h={372} r={16} fill={paint("gPage")} /><Rr x={-320} y={-186} w={640} h={9} r={4} fill="#fff" /><Rr x={-320} y={170} w={640} h={16} r={8} fill="rgba(120,90,50,.10)" />
    <PageBars sent={sent} has={has} />
  </g>));
  // the loupe over the marked sentence (it sweeps slowly), and the capped pencil beside the page
  const ly = sent ? -140 + (sent - 1) * 44 + 12 : 40, lx = sent ? 60 : 200;
  out.push(L(1.12, "hero", false, <>
    <g transform="translate(1190 650) rotate(-4)"><g className={has ? "pp-sweep" : undefined}><g transform={`translate(${lx} ${ly})`}>
      <g transform="rotate(42)"><Rr x={-11} y={60} w={22} h={100} r={10} fill={paint("gWood")} /><Rr x={-14} y={52} w={28} h={16} r={6} fill={paint("gBrass")} /></g>
      <circle r="66" fill="rgba(255,250,225,.42)" /><circle r="66" fill="none" stroke={paint("gBrass")} strokeWidth="15" /><circle r="58" fill="none" stroke="#fff3bd" strokeOpacity=".6" strokeWidth="2" />
      <path d="M-36-30A46 46 0 0 1 8-48" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="7" strokeLinecap="round" />
    </g></g></g>
    <g transform="translate(770 796) rotate(-7)"><Rr x={-290} y={-14} w={350} h={28} r={5} fill={paint("gYellow")} /><Rr x={-306} y={-14} w={18} h={28} r={6} fill="#f3a08a" /><Rr x={-292} y={-14} w={8} h={28} fill={paint("gBrass")} />
      <path d="M60-14H120Q144-14 144 0Q144 14 120 14H60Z" fill={paint("gForest")} /><Rr x={50} y={-16} w={12} h={32} r={3} fill={paint("gBrass")} /><Rr x={-286} y={-8} w={330} h={6} r={3} fill="rgba(255,255,255,.4)" /></g>
  </>));
  out.push(L(1.25, "hero", false, <>
    <Hill base={950} amp={24} seed={71} fill={paint("gForest")} />
    <path d="M-140 1100V540C-96 620-40 730 16 840L58 1100Z" fill={paint("gForest")} /><path d="M2060 1100V620C2004 700 1944 790 1898 866L1852 1100Z" fill={paint("gLeaf")} />
  </>));
  return out;
}

/** A desk with no app on it: the same sky and hills, nothing in front. */
export function emptyWorld(): Layer[] {
  return [
    L(0.1, "sky", true, <><defs><SkyGradient id="mSky" stops={[[0, "#566cd8"], [0.42, "#8a9dea"], [0.78, "#d6dcf5"], [1, "#f6ecd9"]]} /></defs><rect x="-1400" y="-900" width="4800" height="2800" fill={paint("mSky")} /></>),
    L(0.34, "hill", true, <><Hill base={640} amp={34} seed={11} fill="#b8c2f2" /><Hill base={690} amp={30} seed={7} fill="#a2aeed" /></>),
    L(0.6, "hill", true, <><Hill base={752} amp={36} seed={23} fill="#8898e4" /><Hill base={806} amp={26} seed={5} fill="#6f81dc" /></>),
    L(1.25, "hero", false, <Hill base={940} amp={26} seed={91} fill={paint("gIndigo")} />),
  ];
}

export function worldFor(art: ArtState | null): Layer[] {
  if (!art) return emptyWorld();
  return art.app === "maths" ? mathsWorld(art) : art.app === "english" ? englishWorld(art) : essayWorld(art);
}
