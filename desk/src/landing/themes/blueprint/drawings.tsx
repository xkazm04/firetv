/**
 * The three drafting-sheet drawings of the blueprint look (contest A/3, art.js), redrawn as React/SVG. Each is a state
 * of its app read off the view-model (landing/model.ts ArtState): Math Buddy's stair with the steps lit that came back
 * right and the lantern on the next; Linga's doorway, key board, bell and level staff; Essay Master's page of sentence
 * bars with the flagged one and the paragraphs read stacked beside it. Layers: cons (construction), wash (the lit
 * fill), base (the inked drawing), idle (what moves on the focused one), hint (the lantern).
 */
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { ArtState } from "@/landing/model";
import { Pen, f } from "./pen";

export interface Drawing { node: ReactElement; spot: { x: number; y: number } | null }

const list = (a: ReactNode[]) => a;

function Frame() {
  const s = 50, a = 46, e = 600 - s;
  const p = `M${s} ${s + a}V${s}H${s + a}M${e - a} ${s}H${e}V${s + a}M${e} ${e - a}V${e}H${e - a}M${s + a} ${e}H${s}V${e - a}`;
  return <path className="brk" d={p} />;
}
function Wrap({ n, children }: { n: number; children: ReactNode }) {
  return <svg viewBox="0 0 600 600" width={600} height={600} overflow="visible" aria-hidden="true" style={{ "--n": n } as CSSProperties}>{children}<Frame /></svg>;
}

function ticks(cx: number, r1: number) {
  let rt = "";
  for (let k = 0; k < 48; k++) { const a = k * Math.PI / 24, r2 = k % 4 === 0 ? 256 : 265; rt += `M${f(cx + r1 * Math.cos(a))} ${f(300 + r1 * Math.sin(a))}L${f(cx + r2 * Math.cos(a))} ${f(300 + r2 * Math.sin(a))}`; }
  return rt;
}

// ------------------------------------------------------------------ MATH BUDDY
export function maths(S: { n: number } | null): Drawing {
  const t = new Pen("m");
  const X0 = 96, W = 60, RH = 48, G = 506, DX = 38, DY = -26, N = 6;
  const lit = S ? Math.max(0, Math.min(N, S.n)) : 0;
  const cons: ReactNode[] = [], wash: ReactNode[] = [], base: ReactNode[] = [], dots: ReactNode[] = [], idle: ReactNode[] = [];
  let hint: ReactNode = null;
  cons.push(t.CCI(300, 300, 274), t.CCI(300, 300, 206), t.CL(16, 300, 584, 300), t.CL(300, 16, 300, 584));
  const pm = RH / W;
  cons.push(t.CL(X0 - 44, G + 44 * pm, X0 + 6 * W + DX + 50, G - pm * (6 * W + DX + 50)));
  cons.push(t.CP(ticks(300, 274), "tk"));
  for (let k = 0; k < N; k++) {
    const x0 = X0 + W * k, x1 = x0 + W, top = G - RH * (k + 1);
    base.push(t.PA(`M${x0} ${G}V${top}H${x1}`, "l1"));
    const topFace = k < N - 1 ? [[x0, top], [x1, top], [x1, top + DY], [x0 + DX, top + DY]] : [[x0, top], [x1, top], [x1 + DX, top + DY], [x0 + DX, top + DY]];
    if (k < N - 1) base.push(t.PA(`M${x0} ${top}L${x0 + DX} ${top + DY}H${x1}`, "l2"));
    else {
      base.push(t.PA(`M${x0} ${top}L${x0 + DX} ${top + DY}H${x1 + DX}L${x1} ${top}`, "l2"));
      base.push(t.PA(`M${x1} ${G}V${top}`, "l1"));
      base.push(t.PA(`M${x1 + DX} ${top + DY}V${G + DY}L${x1} ${G}`, "l2"));
    }
    if (k < lit) {
      wash.push(<polygon key={`w${k}a`} className={`wf s${k}`} points={`${x0},${top} ${x1},${top} ${x1},${G} ${x0},${G}`} />);
      wash.push(<polygon key={`w${k}b`} className={`wf s${k}`} points={topFace.map((p) => p.join(",")).join(" ")} />);
    }
    dots.push(<circle key={`d${k}`} className={`dot${k < lit ? ` on s${k}` : ""}`} cx={x0 + W / 2} cy={top + 20} r={5} />);
    if (S && k === lit && lit < N) {
      const lx = x0 + 36, ly = top - 13;
      hint = (
        <g className="lantern">
          <circle className="halo" cx={lx} cy={ly} r={34} /><circle className="glow" cx={lx} cy={ly} r={11} />
          <path className="rays" d={`M${lx} ${ly - 22}V${ly - 32}M${lx} ${ly + 22}V${ly + 32}M${lx - 22} ${ly}H${lx - 32}M${lx + 22} ${ly}H${lx + 32}M${lx - 16} ${ly - 16}L${lx - 23} ${ly - 23}M${lx + 16} ${ly - 16}L${lx + 23} ${ly - 23}M${lx - 16} ${ly + 16}L${lx - 23} ${ly + 23}M${lx + 16} ${ly + 16}L${lx + 23} ${ly + 23}`} />
        </g>
      );
    }
  }
  base.push(t.hatch([[X0 + 6 * W, G - 6 * RH], [X0 + 6 * W + DX, G - 6 * RH + DY], [X0 + 6 * W + DX, G + DY], [X0 + 6 * W, G]], 7, "l3s", "b", "bp-k-maths-side"));
  base.push(t.L(28, G, 572, G, "l1"));
  let gh = ""; for (let k = 0; k < 38; k++) gh += `M${34 + k * 14} ${G + 3}l-9 11`;
  base.push(t.CP(gh, "gh"));
  // protractor at upper-left
  const PX = 190, PY = 282, R = 118;
  let pr = "";
  for (let k = 0; k <= 30; k++) { const ag = Math.PI - k * Math.PI / 30, rl = k % 5 === 0 ? 20 : 9; pr += `M${f(PX + R * Math.cos(ag))} ${f(PY - R * Math.sin(ag))}L${f(PX + (R - rl) * Math.cos(ag))} ${f(PY - (R - rl) * Math.sin(ag))}`; }
  base.push(t.PA(`M${PX - R} ${PY}A${R} ${R} 0 0 1 ${PX + R} ${PY}`, "l2"));
  base.push(t.PA(`M${PX - R - 14} ${PY}H${PX + R + 14}`, "l2"));
  base.push(t.PA(pr, "l3s"));
  base.push(t.CP(`M${PX - 88} ${PY}A88 88 0 0 1 ${PX + 88} ${PY}`, "tk"));
  base.push(t.L(PX, PY - 14, PX, PY + 14, "l3s"), t.L(PX - 14, PY, PX + 14, PY, "l3s"));
  const pa = Math.atan(pm);
  base.push(t.CL(PX, PY, PX + (R + 12) * Math.cos(pa), PY - (R + 12) * Math.sin(pa), "lin"));
  // compass standing on the protractor centre, pencil on the outer arc
  const HX = 249, HY = 72;
  base.push(t.PA(`M${HX} ${HY}L${PX + 22} ${PY - 100}L${PX} ${PY}`, "l1"));
  base.push(t.PA(`M${HX} ${HY}L${PX + R - 8} ${PY - 92}L${PX + R} ${PY - 2}`, "l1"));
  base.push(t.CI(HX, HY, 10, "l1"), t.L(HX, HY - 10, HX, HY - 34, "l1"), t.CI(HX, HY - 42, 8, "l2"));
  base.push(t.L(HX - 8, HY - 22, HX + 8, HY - 22, "l2"));
  base.push(t.PA(`M${PX + 24} ${PY - 122}Q${HX + 22} ${PY - 140} ${PX + R - 26} ${PY - 108}`, "l2"));
  // dimensions
  base.push(t.dim(X0, G - RH, X0, G, 30), t.dim(X0, G, X0 + W, G, 34), t.dim(X0 + 6 * W + DX, G, X0 + 6 * W + DX, G - 6 * RH + DY, 42));
  // the cloud: the answer stays withheld
  const cloud = (
    <g className="cloudg">
      <path className="cloud" d="M390 296C368 298 362 268 384 260C376 232 404 212 428 224C440 192 488 194 494 226C518 226 526 262 508 274C518 296 498 304 480 298C462 308 428 308 410 298Z" />
      <path className="qm" d="M432 246C432 228 462 226 462 246C462 260 447 260 447 272" /><circle className="qd" cx={447} cy={284} r={3.6} />
    </g>
  );
  idle.push(<path key="arc" className="arc" d={`M${PX - R} ${PY}A${R} ${R} 0 0 1 ${PX + R} ${PY}`} pathLength={1} />);
  const spot = S && lit < N ? { x: X0 + W * lit + 36, y: G - RH * (lit + 1) - 13 } : null;
  return {
    spot,
    node: (
      <Wrap n={t.count()}>
        <g className="cons">{list(cons)}</g><g className="wash">{list(wash)}</g><g className="base">{list(base)}</g>
        {cloud}<g className="dots">{list(dots)}</g><g className="idle">{list(idle)}</g><g className="hint">{hint}</g>
      </Wrap>
    ),
  };
}

// ------------------------------------------------------------------ LINGA
export function english(kind: "none" | "resume" | "next" | "last", cefr: string | null, tonight: boolean): Drawing {
  const t = new Pen("l");
  const G = 500;
  const cons: ReactNode[] = [], wash: ReactNode[] = [], base: ReactNode[] = [], idle: ReactNode[] = [];
  const ri = cefr ? "A1A2B1B2C1C2".indexOf(cefr) / 2 : -1;
  cons.push(t.CCI(300, 300, 274), t.CCI(300, 300, 206), t.CL(16, 300, 584, 300), t.CL(300, 16, 300, 584));
  cons.push(t.CP(ticks(300, 274), "tk"));
  const opening = "M108 500V262A92 92 0 0 1 292 262V500";
  base.push(t.PA("M82 500V262A118 118 0 0 1 318 262V500", "l1"), t.PA("M96 500V262A104 104 0 0 1 304 262V500", "l2"), t.PA(opening, "l1"));
  base.push(t.L(70, 500, 330, 500, "l1"), t.L(108, 262, 292, 262, "l2"));
  for (let i = 1; i < 6; i++) { const a = Math.PI * i / 6; base.push(t.L(200 - 30 * Math.cos(a), 262 - 30 * Math.sin(a), 200 - 92 * Math.cos(a), 262 - 92 * Math.sin(a), "l3s")); }
  base.push(t.PA("M170 262A30 30 0 0 1 230 262", "l2"), t.PA("M138 262A62 62 0 0 1 262 262", "l3s"));
  let vh = ""; for (let i = 0; i < 20; i++) vh += `M${112 + i * 9.5} 176V500`;
  base.push(<g key="int"><defs><clipPath id="bp-k-english-door"><path d={`${opening}Z`} /></clipPath></defs><path className="hc l3s" clipPath="url(#bp-k-english-door)" d={vh} /></g>);
  wash.push(<path key="wdoor" className="wf" d={`${opening}Z`} />);
  // the door leaf swung open
  base.push(t.PG([[292, 276], [234, 294], [234, 488], [292, 500]], "l1"));
  base.push(t.PG([[282, 302], [246, 312], [246, 382], [282, 386]], "l2"), t.PG([[282, 398], [246, 406], [246, 474], [282, 486]], "l2"));
  base.push(t.CI(250, 396, 4, "l2"));
  if (tonight) {
    wash.push(<path key="wmo" className="wf mo" d="M206 72A26 26 0 0 0 206 124A32 32 0 0 1 206 72Z" />);
    base.push(t.PA("M206 72A26 26 0 0 0 206 124A32 32 0 0 1 206 72Z", "l2"));
    base.push(<path key="spk" className="spk" d="M258 82h12M264 76v12M148 66h10M153 61v10M262 116h8M266 112v8" />);
  }
  // counter and bell
  base.push(t.RC(334, 408, 238, 16, "l1", 3), t.RC(346, 424, 214, 76, "l1"), t.L(30, 500, 570, 500, "l1"));
  base.push(t.RC(358, 436, 58, 52, "l2", 3), t.RC(426, 436, 58, 52, "l2", 3), t.RC(494, 436, 54, 52, "l2", 3));
  base.push(t.hatch([[346, 424], [560, 424], [560, 500], [346, 500]], 11, "l3s", "v", "bp-k-english-counter"));
  idle.push(
    <g key="bell" className="bell">
      {t.RC(384, 398, 60, 10, "l1", 5)}{t.PA("M390 398A24 24 0 0 1 438 398Z", "l1")}{t.L(414, 374, 414, 366, "l1")}{t.CI(414, 361, 5, "l2")}{t.PA("M396 388A18 18 0 0 1 405 379", "l3s")}
    </g>,
    <path key="snd" className="snd" d="M366 386Q357 374 366 362M352 392Q339 374 352 356M462 386Q471 374 462 362M476 392Q489 374 476 356" />,
  );
  wash.push(<path key="wbell" className="wf" d="M390 398A24 24 0 0 1 438 398Z" />);
  // key board: one empty hook when the next step is a topic
  base.push(t.RC(352, 192, 206, 142, "l1", 6), t.RC(362, 202, 186, 122, "l2", 3));
  const xs = [385, 431, 478, 524], rows = [222, 278];
  let spot: Drawing["spot"] = null;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const hx = xs[c], hy = rows[r], empty = kind === "next" && r === 1 && c === 2;
    base.push(<circle key={`hk${r}${c}`} className="hookd" cx={hx} cy={hy} r={3.6} />);
    if (empty) {
      spot = { x: hx, y: hy + 22 };
      idle.push(<g key="ghost" className="ghost"><circle className="c" cx={hx} cy={hy + 12} r={7} /><path className="c" d={`M${hx} ${hy + 19}V${hy + 42}M${hx} ${hy + 34}h8M${hx} ${hy + 41}h6`} /></g>);
    } else {
      base.push(t.CI(hx, hy + 12, 7, "l2"), t.L(hx, hy + 19, hx, hy + 42, "l2"), t.L(hx, hy + 34, hx + 8, hy + 34, "l2"), t.L(hx, hy + 41, hx + 6, hy + 41, "l2"));
    }
  }
  // the lamp
  base.push(t.L(456, 40, 456, 146, "l2"), t.PA("M430 178Q430 150 456 146Q482 150 482 178Z", "l1"), t.CI(456, 184, 5, "l2"));
  wash.push(<polygon key="cone" className="wf cone" points="446,190 466,190 556,336 356,336" />);
  // the speech strip
  base.push(t.RC(66, 524, 176, 50, "l1", 16), t.PA("M112 524L102 508L134 524", "l1"));
  base.push(t.RC(358, 524, 176, 50, "l1", 16), t.PA("M478 524L490 508L510 524", "l1"));
  base.push(t.L(90, 540, 200, 540, "l2"), t.L(90, 556, 150, 556, "l2"), t.L(382, 540, 490, 540, "l2"), t.L(382, 556, 450, 556, "l2"));
  const hs = [10, 22, 36, 20, 44, 28, 34, 16, 8];
  idle.push(
    <g key="wave" className={`wave${kind === "resume" ? " froze" : ""}`}>
      {hs.map((h, i) => <line key={i} className={`wvb ${kind === "resume" && i > 4 ? "q" : ""}`} style={{ "--bi": i } as CSSProperties} x1={262 + i * 10.5} y1={549 - h / 2} x2={262 + i * 10.5} y2={549 + h / 2} />)}
    </g>,
  );
  if (kind === "resume") {
    idle.push(<g key="pause" className="pause"><rect x={292} y={527} width={9} height={44} rx={3} /><rect x={311} y={527} width={9} height={44} rx={3} /></g>);
    spot = { x: 306, y: 549 };
  }
  // the level staff
  for (let i = 0; i < 6; i++) {
    const yb = 500 - 55 * i;
    base.push(t.RC(28, yb - 52, 26, 49, "l2", 5));
    if (i === ri) wash.push(<rect key="lvl" className="wf" x={28} y={yb - 52} width={26} height={49} rx={5} />);
  }
  if (ri >= 0) idle.push(<path key="mk" className="mk" d={`M60 ${500 - 55 * ri - 28}l13 -8v16z`} />);
  return {
    spot,
    node: <Wrap n={t.count()}><g className="cons">{list(cons)}</g><g className="wash">{list(wash)}</g><g className="base">{list(base)}</g><g className="idle">{list(idle)}</g></Wrap>,
  };
}

// ------------------------------------------------------------------ ESSAY MASTER
export function essay(none: boolean, sentIn: number | null, parasIn: number): Drawing {
  const t = new Pen("e");
  const sent = sentIn ?? 0, np = Math.min(parasIn, 5);
  const cons: ReactNode[] = [], wash: ReactNode[] = [], base: ReactNode[] = [], idle: ReactNode[] = [];
  cons.push(t.CCI(270, 300, 274), t.CCI(270, 300, 206), t.CL(16, 300, 584, 300), t.CL(270, 16, 270, 584));
  cons.push(t.CP(ticks(270, 274), "tk"));
  base.push(t.PA("M130 76H370L410 116V520H130Z", "l1"), t.PA("M370 76V116H410", "l2"));
  base.push(t.PA("M142 88H360L398 126V508H142Z", "l3s"));
  base.push(t.L(160, 120, 300, 120, "l1"), t.L(160, 142, 236, 142, "l2"), t.L(150, 164, 150, 452, "l3s"));
  [150, 214, 278, 342, 406].forEach((y, i) => {
    base.push(<g key={`tab${i}`} className="tab" style={{ "--ti": i } as CSSProperties}>{t.RC(410, y, 30, 44, "l1", 8)}{t.L(420, y + 14, 430, y + 14, "l2")}{t.L(420, y + 28, 430, y + 28, "l2")}</g>);
  });
  const ws = [214, 196, 226, 210, 176, 200], barY = (n: number) => 176 + 42 * n;
  for (let i = 0; i < 6; i++) {
    const y = barY(i), isN = !none && sent === i + 1;
    if (none) base.push(<rect key={`b${i}`} className="c" x={160} y={y} width={ws[i]} height={18} rx={9} />);
    else base.push(t.RC(160, y, ws[i], 18, isN ? "l1" : "l2", 9));
    base.push(<circle key={`p${i}`} className={isN ? "dot on" : "dot"} cx={146} cy={y + 9} r={isN ? 5 : 3.2} />);
    if (isN) {
      wash.push(<rect key="wa" className="wf" x={160} y={y - 4} width={ws[i]} height={26} rx={13} />);
      wash.push(<rect key="wb" className="wf" x={134} y={y - 6} width={270} height={30} rx={6} style={{ opacity: 0.55 }} />);
    }
  }
  if (!none) base.push(<rect key="lack" className="c" x={160} y={barY(6)} width={150} height={18} rx={9} />);
  const spot = none ? { x: 270, y: 300 } : sent ? { x: 160 + ws[sent - 1] + 2, y: barY(sent - 1) + 9 } : null;
  if (!none && sent) {
    const ey = barY(sent - 1) + 9, ex = 160 + ws[sent - 1];
    idle.push(<g key="curl" className="curl"><path className="l2c" d={`M${ex + 10} ${ey}H${ex + 32}C${ex + 58} ${ey} ${ex + 58} ${ey + 30} ${ex + 32} ${ey + 30}H${ex - 8}`} />{t.AH(ex - 14, ey + 30, Math.PI, 12)}</g>);
  }
  if (!none && np) for (let i = np - 1; i >= 0; i--) {
    const px = 452 + i * 10 - (np - 1) * 5, py = 402 + i * 12 - (np - 1) * 6;
    base.push(<g key={`pg${i}`} className="pgk"><rect className="pf" x={px} y={py} width={92} height={122} rx={4} />{t.L(px + 14, py + 26, px + 66, py + 26, "l2")}{t.L(px + 14, py + 46, px + 78, py + 46, "l2")}{t.L(px + 14, py + 66, px + 58, py + 66, "l2")}</g>);
  }
  const lensY = none ? 300 : sent ? barY(sent - 1) + 9 : 300;
  idle.push(
    <g key="lens" className="lens"><g transform={`translate(${none ? 270 : 316} ${lensY})`}>
      <circle className="lr" r={52} /><circle className="lr2" r={44} /><path className="lh" d="M37 37L84 84" /><path className="lg" d="M-30 -26A44 44 0 0 1 4 -40" />
    </g></g>,
  );
  return {
    spot,
    node: <Wrap n={t.count()}><g className="cons">{list(cons)}</g><g className="wash">{list(wash)}</g><g className="base">{list(base)}</g><g className="idle">{list(idle)}</g></Wrap>,
  };
}

/** The drawing for an app's art state. */
export function drawingOf(a: ArtState): Drawing {
  if (a.app === "maths") return maths(a.n != null ? { n: a.n } : null);
  if (a.app === "english") return english(a.fresh ? "none" : a.resume ? "resume" : a.next ? "next" : "last", a.fresh ? null : a.cefr, !a.fresh && a.next);
  return essay(a.fresh, a.fresh ? null : a.sent, a.fresh ? 0 : a.paras);
}
