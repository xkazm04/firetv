"use client";
/**
 * "Paper": the Study Desk landing as contest A/1 drew it ("Small Worlds"). One paper-cut world for the app in the
 * light - its name in huge cut letters over stairs and lantern, a stage of hills that slide away when the D-pad moves
 * on - and a paper shelf below it: the caption for that app on the left, one arched tile per app in the middle, the
 * big "Continue as ..." and "Someone else" on the right. Top left the desk's mark, top right the phone and who is
 * at the desk. An unpaired phone is a postcard with the real address and code; Select plays the world opening.
 *
 * Only the look lives here. The apps on the shelf, their waiting lines, the stops and the words are the view-model's
 * (landing/model.ts); the keys are tv/keys.ts; the hand-off wait is app/tv/page.tsx. CSS: design/desk-landing.css
 * (`.desk-tv.pp`, `pp-` classes). Sizes are for the 1920 x 1080 stage; the stage scales as a whole.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Subject } from "@/lib/session/store";
import type { LandingStop } from "@/tv/landingRows";
import type { AppView, LandingView } from "@/landing/model";
import type { ThemeLandingProps } from "../types";
import { DESK_FONTS } from "@/landing/fonts";
import { Defs } from "./shapes";
import { HouseMark, Icon, PhoneGlyph, PostcardArt } from "./glyphs";
import { Stamp } from "./stamps";
import { worldFor, type Layer } from "./worlds";

/** Each app's colours (its own deep, its shadow, its highlight, the letters' extrusion, the motes' glow). */
const THEME: Record<Subject | "house", { deep: string; deepLo: string; hi: string; ex: string; glow: string }> = {
  maths: { deep: "#2b3fa8", deepLo: "#1b2778", hi: "#6a82ea", ex: "#22337c", glow: "255,236,150" },
  english: { deep: "#ad4529", deepLo: "#762b1f", hi: "#f08c64", ex: "#8a3a2a", glow: "255,222,150" },
  essay: { deep: "#1f5140", deepLo: "#123528", hi: "#54967a", ex: "#1a4636", glow: "255,250,222" },
  house: { deep: "#4a3324", deepLo: "#2b1d16", hi: "#8b6a54", ex: "#3a271b", glow: "255,236,170" },
};
const LEARNER_TONE = ["#e2603f", "#2f7a63", "#5a55c8", "#c9932d"];

// ---------------------------------------------------------------- the world: layers that slide at their own speeds

function WorldSet({ layers, back, mode, dir }: { layers: Layer[]; back: boolean; mode: "none" | "arrive" | "choose" | "fade" | "leave"; dir: number }) {
  return (
    <div className="pp-wset" data-mode={mode} style={{ "--dir": dir } as CSSProperties}>
      {layers.map((l, i) => l.back === back && (
        <div key={i} className="pp-layer" data-k={l.k} style={{ "--d": l.d, "--i": i } as CSSProperties}>
          <svg viewBox="-140 0 2200 1080" width="2200" height="1080" aria-hidden="true">{l.node}</svg>
        </div>
      ))}
    </div>
  );
}

/** The name in huge cut letters: the biggest size that fits the free width, centred over the stage (or left of the postcard). */
function Title({ name, unpaired, seq, still }: { name: string; unpaired: boolean; seq: number; still: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const fit = () => {
      const t = el.current; if (!t) return;
      t.style.fontSize = "240px";
      const w = t.offsetWidth || 1, fs = Math.min(280, 240 * (unpaired ? 1060 : 1600) / w);
      t.style.fontSize = `${fs.toFixed(1)}px`;
      const tw = t.offsetWidth, x = (unpaired ? 690 : 960) - tw / 2, y = 334 - fs * 0.52;
      t.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
  }, [name, unpaired, seq]);
  return (
    <div ref={el} className="pp-title" data-role="desk-title" data-still={still || undefined} aria-hidden="true" key={`${name}${seq}`}>
      {name.split("").map((ch, i) => <span key={i} className="pp-ch" style={{ "--i": i } as CSSProperties}>{ch === " " ? " " : ch}</span>)}
    </div>
  );
}

// ---------------------------------------------------------------- the light and the paper grain

/** Warm motes drifting up through the scene: a small canvas the stage scales, still under reduced motion. */
function Motes({ glow }: { glow: string }) {
  const cv = useRef<HTMLCanvasElement>(null), rgb = useRef(glow);
  useEffect(() => { rgb.current = glow; }, [glow]);
  useEffect(() => {
    const c = cv.current, x = c?.getContext("2d"); if (!c || !x) return;
    let r = 1234567; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    const P = Array.from({ length: 40 }, () => ({ x: rnd() * 960, y: rnd() * 540, r: 1.2 + rnd() * 2.8, vx: 0.04 + rnd() * 0.16, vy: -(0.03 + rnd() * 0.12), a: 0.3 + rnd() * 0.5, ph: rnd() * 6.28 }));
    const draw = (t: number) => {
      x.clearRect(0, 0, 960, 540);
      for (const p of P) {
        p.x += p.vx; p.y += p.vy + Math.sin(t / 1700 + p.ph) * 0.05;
        if (p.x > 970) p.x = -10; if (p.y < -10) p.y = 550;
        x.fillStyle = `rgba(${rgb.current},${(p.a * (0.6 + 0.4 * Math.sin(t / 950 + p.ph))).toFixed(3)})`;
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.2832); x.fill();
      }
    };
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) { draw(0); return; }
    let raf = 0;
    const loop = (t: number) => { if (document.hidden) { raf = 0; return; } draw(t); raf = requestAnimationFrame(loop); };
    const wake = () => { if (!document.hidden && !raf) raf = requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", wake); wake();
    return () => { document.removeEventListener("visibilitychange", wake); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={cv} className="pp-fx" width={960} height={540} aria-hidden="true" />;
}

/** Paper grain and a soft vignette: one 160 px tile, deterministic. */
function Grain() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = document.createElement("canvas"); c.width = c.height = 160;
    const x = c.getContext("2d"); if (!x || !el.current) return;
    const d = x.createImageData(160, 160);
    let r = 7; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    for (let i = 0; i < d.data.length; i += 4) {
      const dark = rnd() < 0.5;
      d.data[i] = dark ? 40 : 255; d.data[i + 1] = dark ? 25 : 250; d.data[i + 2] = dark ? 12 : 235; d.data[i + 3] = rnd() * 15;
    }
    x.putImageData(d, 0, 0);
    el.current.style.backgroundImage = `url(${c.toDataURL()}),radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 56%,rgba(45,25,12,.26) 100%)`;
  }, []);
  return <div ref={el} className="pp-grain" aria-hidden="true" />;
}

// ---------------------------------------------------------------- the pieces

const WHEN_ICON = { clock: Icon.clock, sun: Icon.sun, moon: Icon.moon };

function Postcard({ view }: { view: LandingView }) {
  const { pin, url } = view.phone;
  return (
    <div className="pp-postcard" data-role="desk-phone" data-paired={false} data-focused={view.at === "phone" ? "true" : undefined}>
      <div className="pp-pcd">
        <PostcardArt />
        <div className="pp-pin" data-role="desk-pin" aria-label={`Code ${pin}`}>{pin}</div>
        <div className="pp-url">{url}</div>
        <div className="pp-dots" aria-hidden="true"><i /><i /><i /></div>
      </div>
    </div>
  );
}

function Shelf({ view }: { view: LandingView }) {
  const { apps, at, world } = view, n = apps.length, pitch = n >= 3 ? 176 : 200, cx = 1010 - ((n - 1) * pitch) / 2;
  const cap = view.caption;
  return (
    <div className="pp-ledge">
      <div className="pp-ledge-paper" />
      <div className="pp-cap" data-role="desk-caption" key={cap.head + cap.sub}>
        {cap.chip && <span className="pp-chip">{WHEN_ICON[cap.chip.icon]}{cap.chip.text}</span>}
        <div className="pp-cl">{cap.head}</div>
        <div className="pp-cd">{cap.sub}</div>
      </div>
      <div className="pp-rail">
        {apps.map((a, i) => (
          <div key={a.id} className="pp-stamp" data-role="desk-object" data-app={a.id} data-kind={a.kind} data-continue={a.tagged || undefined}
            data-focused={at === a.id ? "true" : undefined} data-sel={world === a.id ? "true" : "false"} style={{ left: Math.round(cx + i * pitch - 90) }}>
            <div className="pp-win"><Stamp art={a.art} /></div>
            <div className="pp-nm">{a.name}</div>
          </div>
        ))}
      </div>
      <div className="pp-actions">
        <div className="pp-cont" role="button" data-role="desk-continue"><span>{view.primary}</span>{Icon.arrow}</div>
        <div className="pp-else" role="button" data-role="desk-place-card" data-focused={at === "place" ? "true" : undefined}>{Icon.swap}<span>{view.place}</span></div>
      </div>
    </div>
  );
}

function Chrome({ view }: { view: LandingView }) {
  const { learner } = view;
  return (
    <div className="pp-chrome">
      <div className="pp-brand" data-role="desk-wordmark"><HouseMark size={64} /><span className="pp-wm">Study Desk</span></div>
      <div className="pp-badge">
        {view.phone.paired && <div className="pp-ph" data-role="desk-phone" data-paired={true}><PhoneGlyph paired /></div>}
        {!view.phone.paired && <div className="pp-ph"><PhoneGlyph paired={false} /></div>}
        {learner && <div className="pp-disc" style={{ background: LEARNER_TONE[learner.tone] }}>{learner.initial}</div>}
        <div className="pp-who">{learner ? learner.name : "Whose desk?"}</div>
      </div>
      <div className="pp-hints">
        <div className="pp-h">{Icon.left}{Icon.right}Choose</div>
        <div className="pp-h">{Icon.ok}Select</div>
      </div>
    </div>
  );
}

/** Where the light for a hand-off starts: the tile, the second action or the postcard that was Selected. */
function originOf(view: LandingView, stop: LandingStop): [number, number] {
  if (stop === "place") return [1560, 991];
  if (stop === "phone") return [1524, 438];
  const n = view.apps.length, pitch = n >= 3 ? 176 : 200, cx = 1010 - ((n - 1) * pitch) / 2, i = Math.max(0, view.apps.findIndex((a) => a.id === stop));
  return [Math.round(cx + i * pitch), 900];
}

/** Select: the world opens - a flood in the app's colours grows from what was Selected, its picture and name settle in. */
function Zoom({ view, stop }: { view: LandingView; stop: LandingStop }) {
  const app: AppView | undefined = view.apps.find((a) => a.id === stop), [ox, oy] = originOf(view, stop);
  const name = app ? app.name : stop === "place" ? "Someone else" : "Pair a phone";
  return (
    <div className="pp-zoom" data-role="desk-zoom" data-app={stop} style={{ "--ox": `${ox}px`, "--oy": `${oy}px` } as CSSProperties}>
      <div className="pp-flood" />
      <svg className="pp-zscene" viewBox="0 0 1920 1080" width="1920" height="1080" aria-hidden="true">
        <g fill="none" stroke="#fff" strokeOpacity=".075" strokeWidth="26">{[560, 420, 280].map((r) => <path key={r} d={`M${960 - r} 1100V${r}a${r} ${r} 0 0 1 ${2 * r} 0V1100`} />)}</g>
        <g><path d="M-100 940C300 890 700 990 1100 940S1700 900 2020 950V1100H-100Z" fill="var(--pp-deep)" /><path d="M-100 1000C400 960 800 1040 1200 1000S1700 970 2020 1010V1100H-100Z" fill="var(--pp-deepLo)" /></g>
      </svg>
      <div className="pp-zc">
        <div className="pp-halo" />
        <div className="pp-emb"><div className="pp-win">{app ? <Stamp art={app.art} /> : <div className="pp-zhouse"><HouseMark size={170} /></div>}</div></div>
        <div className="pp-sty"><i />Stylised</div>
        <div className="pp-op">Opening</div>
        <div className="pp-znm">{name}</div>
        <div className="pp-zbar"><i /></div>
      </div>
    </div>
  );
}

/** The arrival: the mark draws itself, the world opens out of it, the shelf rises. Only when someone sits down. */
function Intro() {
  return (
    <div className="pp-intro" aria-hidden="true">
      <div className="pp-ibox"><div className="pp-imark"><HouseMark size={300} /></div><div className="pp-iword">Study Desk</div></div>
    </div>
  );
}

// ---------------------------------------------------------------- the landing

export function PaperLanding({ view, zoom, boot }: ThemeLandingProps) {
  const { world, apps, at } = view, unpaired = !view.phone.paired;
  // the world that is leaving slides out while the new one slides in
  const [st, setSt] = useState<{ world: Subject | null; prev: { id: Subject; dir: number } | null; seq: number }>({ world, prev: null, seq: 0 });
  if (st.world !== world) {
    const ids = apps.map((a) => a.id), was = st.world, dir = was && world && ids.includes(was) ? (ids.indexOf(world) > ids.indexOf(was) ? 1 : -1) : 0;
    setSt({ world, prev: was && ids.includes(was) ? { id: was, dir } : null, seq: st.seq + 1 });
  }
  useEffect(() => {
    if (!st.prev) return;
    const t = setTimeout(() => setSt((x) => (x.prev ? { ...x, prev: null } : x)), 720);
    return () => clearTimeout(t);
  }, [st.seq, st.prev]);

  const art = (id: Subject | null) => apps.find((a) => a.id === id)?.art ?? null;
  const artKey = JSON.stringify([art(st.world), st.prev && art(st.prev.id)]);
  const cur = useMemo(() => worldFor(art(st.world)), [st.world, artKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const old = useMemo(() => (st.prev ? worldFor(art(st.prev.id)) : null), [st.prev, artKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const first = st.seq === 0, dir = st.prev?.dir ?? 0;
  const mode = first ? (boot ? "arrive" : "none") : dir ? "choose" : "fade";

  const held = zoom === "place" || zoom === "phone" ? "house" : world ?? "house";
  const T = THEME[held];
  const theme = { "--pp-deep": T.deep, "--pp-deepLo": T.deepLo, "--pp-hi": T.hi, "--pp-ex": T.ex } as CSSProperties;
  const name = world ? apps.find((a) => a.id === world)?.name ?? "" : "Study Desk";

  return (
    <div className={`desk-tv pp ${DESK_FONTS}`} data-role="desk-scene" data-theme="paper" data-lit={at} data-boot={boot || undefined} data-unpaired={unpaired || undefined} data-empty={view.empty || undefined} data-zoom={zoom ? "true" : undefined} style={theme}>
      <Defs />
      {boot && <Intro />}
      <div className="pp-worlds">
        <div className="pp-host pp-back">
          {old && <WorldSet key={`o${st.seq}`} layers={old} back mode="leave" dir={dir} />}
          <WorldSet key={`c${st.seq}`} layers={cur} back mode={mode} dir={dir} />
        </div>
        <Title name={name} unpaired={unpaired} seq={st.seq} still={first && !boot} />
        <div className="pp-host pp-front">
          {old && <WorldSet key={`o${st.seq}`} layers={old} back={false} mode="leave" dir={dir} />}
          <WorldSet key={`c${st.seq}`} layers={cur} back={false} mode={mode} dir={dir} />
        </div>
      </div>
      <Motes glow={T.glow} />
      {unpaired && <Postcard view={view} />}
      <Shelf view={view} />
      <Chrome view={view} />
      {zoom && <Zoom view={view} stop={zoom} />}
      <Grain />
    </div>
  );
}
