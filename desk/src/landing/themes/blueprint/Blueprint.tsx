"use client";
/**
 * The blueprint look of the landing (contest A/3, a drafting sheet): the three apps are line drawings on one sheet, the
 * focused one inked in with its name in giant outline capitals, an index of the apps on the left, a callout with a
 * leader to the mark on the drawing, the actions at the bottom left and the learner's plate at the bottom right.
 * LOCKED OFF (themes/index.ts THEMES_ENABLED): product will later decide which look belongs to which age tier.
 *
 * It draws the view-model and nothing else. The focus stops are the product's (view.at: an app, "place" = the second
 * action, "phone" = the unpaired phone); the big action is not a stop, it names what Select does on the app in the light.
 * Select's hand-off is view-only here: props.zoom floods the sheet with the app's colour and inverts the linework.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Subject } from "@/lib/session/store";
import type { AppView, WhenIcon } from "@/landing/model";
import type { ThemeLandingProps } from "../types";
import { BLUEPRINT_FONTS } from "./fonts";
import { drawingOf } from "./drawings";

const ACC: Record<Subject, string> = { maths: "#ffe45c", english: "#ff7d6e", essay: "#62e8b4" };
const GL: Record<Subject, string> = { maths: "255,228,92", english: "255,125,110", essay: "98,232,180" };

// ---------------------------------------------------------------- icons (24/30 px line glyphs)
const I = {
  dpad: <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 4v6M15 20v6M4 15h6M20 15h6" /><circle cx="15" cy="15" r="3" /></svg>,
  ok: <svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="10" /><circle className="fillg" cx="15" cy="15" r="4" /></svg>,
  menu: <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M5 9h20M5 15h20M5 21h20" /></svg>,
  play: <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M9 6l15 9-15 9z" /></svg>,
  swap: <svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="11" cy="10" r="4.5" /><path d="M3 24c1-5 4-7 8-7s7 2 8 7M21 8l5 4-5 4" /></svg>,
  lock: <svg viewBox="0 0 28 28" aria-hidden="true"><rect x="6" y="12" width="16" height="12" rx="2" /><path d="M10 12V9a4 4 0 0 1 8 0v3" /></svg>,
};
const WHEN: Record<WhenIcon, ReactNode> = {
  clock: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>,
  moon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" /></svg>,
  sun: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="2" /><path d="M4 11h16M9 3v5M15 3v5" /></svg>,
};
function Mark({ draw }: { draw?: boolean }) {
  const d = draw ? { className: "d", pathLength: 1 } : {};
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g className="mk"><path {...d} d="M32 14L14 56" /><path {...d} d="M32 14L50 56" /><path {...d} d="M21 38Q32 44 43 38" /><path {...d} d="M10 59Q32 68 54 59" /><circle {...d} cx="32" cy="10" r="5.5" /></g>
    </svg>
  );
}

// ---------------------------------------------------------------- the sheet itself (static)
function BgCons() {
  let rl = ""; for (let k = 0; k < 140; k++) rl += `M${k * 24} 1056v-${k % 5 === 0 ? 14 : 7}`;
  return (
    <svg width={3360} height={1080} viewBox="0 0 3360 1080" aria-hidden="true">
      {[-2, -1, 0, 1, 2].map((j) => {
        const cx = 1680 + j * 760;
        let t = ""; for (let k = 0; k < 72; k++) { const a = k * Math.PI / 36, r2 = k % 6 === 0 ? 452 : 442; t += `M${(cx + 430 * Math.cos(a)).toFixed(1)} ${(560 + 430 * Math.sin(a)).toFixed(1)}L${(cx + r2 * Math.cos(a)).toFixed(1)} ${(560 + r2 * Math.sin(a)).toFixed(1)}`; }
        return <g key={j}><circle cx={cx} cy={560} r={430} /><circle cx={cx} cy={560} r={320} /><circle cx={cx} cy={560} r={210} /><path d={t} /><path d={`M${cx - 500} 560H${cx + 500}M${cx} 40V1040`} /></g>;
      })}
      <path d={rl} /><path d="M0 1056H3360" />
    </svg>
  );
}
function SheetFrame() {
  let a = "", b = "";
  for (let z = 1; z < 8; z++) a += `M${z * 240} 30V40M${z * 240} 1040V1050`;
  for (let z = 1; z < 8; z++) b += `M30 ${z * 135}H40M1880 ${z * 135}H1890`;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" aria-hidden="true">
      <rect x={30} y={30} width={1860} height={1020} /><rect x={40} y={40} width={1840} height={1000} style={{ opacity: 0.5 }} />
      <path d={a} /><path d={b} />
      <path d="M960 20V52M960 1028V1060M20 540H52M1868 540H1900" style={{ opacity: 0.9 }} />
      <path d="M30 14V30M14 30H30M1890 14V30M1906 30H1890M30 1066V1050M14 1050H30M1890 1066V1050M1906 1050H1890" />
    </svg>
  );
}

/** A small tiled noise, made once in the browser (deterministic, so a frame is the same every time). */
function useGrain() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas"); c.width = c.height = 160;
      const x = c.getContext("2d"); if (!x || !ref.current) return;
      const im = x.createImageData(160, 160);
      let r = 987654321; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
      for (let i = 0; i < im.data.length; i += 4) { const v = rnd() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v < 128 ? 0 : 255; im.data[i + 3] = rnd() < 0.5 ? 0 : Math.floor(rnd() * 20); }
      x.putImageData(im, 0, 0);
      ref.current.style.backgroundImage = `url(${c.toDataURL()})`;
    } catch { /* no canvas: the sheet is clean */ }
  }, []);
  return ref;
}

/** Soft motes drifting up through the sheet, tinted by the app in the light. Still under reduced motion. */
function Motes({ rgb }: { rgb: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const tint = useRef(rgb); tint.current = rgb;
  useEffect(() => {
    const c = ref.current, x = c?.getContext("2d"); if (!c || !x) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let r = 1234567; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    const m = Array.from({ length: 52 }, (_, i) => ({ x: rnd() * 960, y: rnd() * 540, r: 0.8 + rnd() * 2.1, vx: (rnd() - 0.5) * 0.1, vy: -0.04 - rnd() * 0.13, a: 0.2 + rnd() * 0.45, ph: rnd() * 6.28, t: i % 5 === 0 }));
    let raf = 0;
    const draw = (t: number) => {
      x.clearRect(0, 0, 960, 540);
      for (const p of m) {
        if (!still) { p.x += p.vx; p.y += p.vy; if (p.y < -6) { p.y = 546; p.x = rnd() * 960; } if (p.x < -6) p.x = 966; if (p.x > 966) p.x = -6; }
        x.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(t / 1500 + p.ph));
        x.fillStyle = p.t ? `rgb(${tint.current})` : "#f3efe4";
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.2832); x.fill();
      }
    };
    const loop = (t: number) => { if (!document.hidden) draw(t); raf = requestAnimationFrame(loop); };
    if (still) draw(0); else raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="bp-motes" width={960} height={540} aria-hidden="true" />;
}

// ---------------------------------------------------------------- where things lie on the sheet
interface Place { x: number; y: number; s: number; o: number }
/** A drawing's place: the app in the light at the centre; its neighbours half size on the shelf line; the rest away. */
function lay(dx: number, fr: boolean, lv: 0 | 2): Place {
  if (lv === 0) {
    const cx = fr ? 1120 : 960, Ds = fr ? 480 : 600;
    if (dx === 0) return { x: cx, y: fr ? 588 : 590, s: fr ? 0.92 : 1, o: 1 };
    if (Math.abs(dx) === 1) { if (fr && dx < 0) return { x: cx - Ds - 260, y: 722, s: 0.5, o: 0 }; return { x: cx + dx * Ds, y: 722, s: 0.5, o: 1 }; }
    return { x: cx + dx * Ds * 1.3, y: 722, s: 0.5, o: 0 };
  }
  return dx === 0 ? { x: 1290, y: 512, s: 1.36, o: 1 } : { x: 1290 + dx * 1400, y: 512, s: 1.36, o: 0 };
}

/** Where the flood grows from, per what was Selected: the big action, the second action, the phone. */
const FLOOD_FROM: Record<string, [number, number]> = { app: [300, 950], place: [704, 950], phone: [290, 440] };
const ZOOM_WORD: Record<string, string> = { app: "Opening", place: "Someone else", phone: "Pair a phone" };

function splitHead(head: string): [string, string | null] {
  const i = head.indexOf(" · ");
  return i > 0 ? [head.slice(0, i), head.slice(i + 3)] : [head, null];
}

const px = (n: number) => `${n}px`;

export function BlueprintLanding({ view, zoom, boot }: ThemeLandingProps) {
  const { apps, at, learner, phone } = view;
  const fr = !phone.paired, lv: 0 | 2 = zoom ? 2 : 0;
  const n = apps.length;
  const f = Math.max(0, apps.findIndex((a) => a.id === view.world));
  const cur: AppView | null = apps[f] ?? null;
  const acc = cur ? ACC[cur.id] : ACC.maths, glow = cur ? GL[cur.id] : GL.maths;

  // the arrival plays once, then the room settles (its draw-on delays would otherwise hold the transitions)
  const [arriving, setArriving] = useState(boot);
  useEffect(() => { if (!boot) return; const t = setTimeout(() => setArriving(false), 2700); return () => clearTimeout(t); }, [boot]);

  const arts = JSON.stringify(apps.map((a) => a.art));
  const drawings = useMemo(() => apps.map((a) => drawingOf(a.art)), [arts]); // eslint-disable-line react-hooks/exhaustive-deps

  // the giant names are fitted to the room they have: 200px, smaller when the name would not fit
  const gn = useRef<Array<HTMLDivElement | null>>([]);
  const [fit, setFit] = useState<{ fs: number[]; w: number[] }>({ fs: [], w: [] });
  const names = apps.map((a) => a.name).join("|");
  useLayoutEffect(() => {
    const run = () => {
      const avail = fr ? 1230 : 1700, fs: number[] = [], w: number[] = [];
      gn.current.slice(0, n).forEach((g, i) => {
        if (!g) return;
        g.style.fontSize = "200px";
        const ww = g.offsetWidth, s = ww > avail ? Math.floor(200 * avail / ww) : 200;
        g.style.fontSize = `${s}px`; fs[i] = s; w[i] = g.offsetWidth;
      });
      setFit((p) => (p.fs.join() === fs.join() && p.w.join() === w.join() ? p : { fs, w }));
    };
    run();
    document.fonts?.ready.then(run).catch(() => {});
  }, [names, fr, n]);

  // the callout is a plate cut at one corner: its frame is drawn at the size its words made
  const coRef = useRef<HTMLDivElement>(null);
  const co = fr ? { left: 1400, top: 344, width: 424 } : { left: 1244, top: 348, width: 580 };
  const [box, setBox] = useState({ w: co.width, h: 200 });
  const capKey = cur ? `${cur.id}|${cur.caption.head}|${cur.caption.sub}|${cur.caption.chip?.text ?? ""}` : "none";
  useLayoutEffect(() => {
    const e = coRef.current; if (!e) return;
    const run = () => setBox((p) => (p.w === e.offsetWidth && p.h === e.offsetHeight ? p : { w: e.offsetWidth, h: e.offsetHeight }));
    run();
    document.fonts?.ready.then(run).catch(() => {});
  }, [capKey, fr, co.width]);

  const L0 = lay(0, fr, lv);
  const spot = cur ? drawings[f]?.spot ?? null : null;
  const spotAt = spot ? { x: L0.x + (spot.x - 300) * L0.s, y: L0.y + (spot.y - 300) * L0.s } : null;

  const grain = useGrain();
  const poolx = lv === 0 ? (fr ? 200 : 0) : 350;
  const gx = -(f * 600 * 0.3) + (lv === 0 ? 0 : -90);
  const [line, sub] = cur ? splitHead(cur.caption.head) : ["", null];
  const nothing = cur?.kind === "none";
  const [fx, fy] = FLOOD_FROM[zoom === "place" ? "place" : zoom === "phone" ? "phone" : "app"];
  const rootStyle = { "--acc": acc, "--accg": glow, "--fx": px(fx), "--fy": px(fy), "--lx": `${lv === 0 ? (fr ? 62 : 50) : 66}%` } as CSSProperties;
  const letter = learner?.initial ?? "?";

  return (
    <div className={`desk-tv bp ${BLUEPRINT_FONTS}`} data-theme="blueprint" data-role="desk-scene" data-lit={at} data-unpaired={fr || undefined}
      data-boot={arriving || undefined} data-zoom={zoom ?? undefined} style={rootStyle}>
      <div className="bp-ground" />
      <div className="bp-vig" />
      <div className="bp-gridpool" style={{ transform: `translate3d(${poolx}px,0,0)` }}>
        <div className="bp-gridlines" style={{ transform: `translate3d(${gx - poolx}px,0,0)` }}><div className="bp-gridfine" /></div>
      </div>
      <div className="bp-bgcons" style={{ transform: `translate3d(${-(f * 600 * 0.3) * 0.9 + (lv === 0 ? 0 : -160)}px,0,0)` }}><BgCons /></div>
      <div className="bp-halo" style={{ transform: `translate3d(${L0.x}px,${L0.y}px,0) scale(${lv === 0 ? 1 : 1.25})` }} />
      <Motes rgb={glow} />
      <div className="bp-sheetframe"><SheetFrame /></div>
      <div className="bp-flood" />

      {fr && (
        <div className="bp-phone" data-role="desk-phone" data-paired="false" data-focused={at === "phone"}>
          <div className="ph"><div className="scr">
            <div className="pl">{I.lock}<span>PIN</span></div>
            <div className="pin" data-role="desk-pin" aria-label={`Code ${phone.pin}`}>{phone.pin}</div>
            <div className="pdots" aria-hidden="true"><i /><i /><i /></div>
          </div></div>
          <div className="url">{phone.url}</div>
          <svg className="penline" width={1920} height={1080} viewBox="0 0 1920 1080" aria-hidden="true"><path d="M470 430C590 430 700 470 856 528" /></svg>
        </div>
      )}

      <div className="bp-names">
        {apps.map((a, i) => {
          const dx = i - f, L = lay(dx, fr, lv), fs = fit.fs[i] ?? 200, w = fit.w[i] ?? 900;
          const tf = lv === 0
            ? `translate3d(${(fr ? 1192 : 960) - w / 2 + dx * 640 * 1.15}px,${336 - 0.85 * fs}px,0) scale(1)`
            : `translate3d(${dx === 0 ? 96 : 96 + dx * 900}px,${250 - 0.85 * fs * 0.62}px,0) scale(.62)`;
          const c = { "--ai": ACC[a.id] } as CSSProperties;
          return (
            <div key={a.id} style={{ display: "contents" }}>
              <div ref={(e) => { gn.current[i] = e; }} className={`gn${dx === 0 ? " cur" : ""}`} style={{ ...c, transform: tf }}>
                <span className="o">{a.name}</span><span className="fill" aria-hidden="true">{a.name}</span>
              </div>
              <div className={`sn${lv === 0 && dx !== 0 && L.o > 0 ? " on" : ""}`} style={{ ...c, transform: `translate3d(${L.x - 230}px,${L.y + 140}px,0)` }}>{a.name}</div>
            </div>
          );
        })}
      </div>

      <div className="bp-drawings">
        {apps.map((a, i) => {
          const dx = i - f, L = lay(dx, fr, lv);
          return (
            <div key={a.id} className={`dr${dx === 0 ? " cur" : ""}${lv === 2 && dx === 0 ? " inv" : ""}`} data-app={a.id} data-fresh={a.art.fresh || undefined} data-focused={at === a.id}
              style={{ "--accent": ACC[a.id], "--glow": GL[a.id], transform: `translate3d(${L.x - 300}px,${L.y - 300}px,0) scale(${L.s})`, opacity: L.o === 0 ? 0 : undefined } as CSSProperties}>
              {drawings[i].node}
            </div>
          );
        })}
      </div>

      {spotAt && !fr && lv === 0 && cur && (
        <svg className="bp-leader" width={1920} height={1080} viewBox="0 0 1920 1080" aria-hidden="true" key={`ld-${cur.id}`}>
          {(() => {
            const x0 = co.left, y0 = co.top + 42, hx = Math.min(Math.max(spotAt.x + 90, 0), x0 - 30);
            return <><path className="lead" pathLength={1} d={`M${x0} ${y0}H${hx}L${spotAt.x} ${spotAt.y}`} /><circle className="lc2" cx={spotAt.x} cy={spotAt.y} r={20} /><circle className="lc" cx={spotAt.x} cy={spotAt.y} r={10} /></>;
          })()}
        </svg>
      )}

      <div className="bp-index">
        <div style={{ transform: `translate3d(0,${f === 0 ? Math.round((3 - n) * 34 + 118) : 0}px,0)`, transition: "transform .8s cubic-bezier(.4,.02,.14,1)" }}>
          {apps.map((a, i) => (
            <div key={a.id} className={`ix${i === f ? " on" : ""}`} data-role="desk-object" data-app={a.id} data-kind={a.kind} data-focused={at === a.id}
              data-continue={a.tagged || undefined} style={{ "--c": ACC[a.id], "--cg": GL[a.id] } as CSSProperties}>
              <b>{i + 1}</b><span>{a.name}</span><i />
            </div>
          ))}
        </div>
      </div>

      {cur ? (
        <div ref={coRef} className="bp-callout" data-role="desk-caption" style={{ left: co.left, top: co.top, width: co.width }}>
          <svg className="cf" width={box.w} height={box.h} aria-hidden="true">
            <path d={`M0 0H${box.w - 26}L${box.w} 26V${box.h}H0Z`} />
            <path className="tick" d={`M${box.w - 28} 0L${box.w} 28`} /><path className="tick" d={`M0 ${box.h - 30}V${box.h}H30`} />
          </svg>
          <div className="cc" key={cur.id}>
            {nothing
              ? <><div className="co-nothing">{cur.caption.head}</div><div className="co-tag">{cur.caption.sub}</div></>
              : <>
                  <div className="co-line">{line}</div>
                  {sub && <div className="co-sub">{sub}</div>}
                  <div className="co-detail">{cur.caption.sub}</div>
                  {cur.caption.chip && <span className="chip">{WHEN[cur.caption.chip.icon]}<span>{cur.caption.chip.text}</span></span>}
                </>}
          </div>
        </div>
      ) : (
        <div className="bp-empty" data-role="desk-caption">
          <div className="co-nothing">No apps yet</div>
          <div className="co-tag">No apps are on this profile yet. Select {view.place} to change it.</div>
        </div>
      )}

      <div className="bp-launch" aria-hidden="true">
        <div className="op">{ZOOM_WORD[zoom === "place" ? "place" : zoom === "phone" ? "phone" : "app"]}</div>
        <svg className="dimline" viewBox="0 0 640 60"><path className="d" d="M8 30H632" strokeOpacity=".25" /><path className="pr" pathLength={1} d="M8 30H632" /><path d="M8 12V48M632 12V48" /><path className="ah2" d="M8 30L26 22V38ZM632 30L614 22V38Z" /></svg>
      </div>

      <div className="bp-brand"><Mark draw /><span className="wm">Study Desk</span></div>

      <div className="bp-actions">
        <button className="bp-btn pri" data-role="desk-continue" tabIndex={-1}>{I.play}<span>{view.primary}</span></button>
        <button className="bp-btn gh" data-role="desk-place-card" data-focused={at === "place"} tabIndex={-1}>{I.swap}<span>{view.place}</span></button>
      </div>

      <div className="bp-hints" aria-hidden="true">
        <span>{I.dpad}Choose</span><span>{I.ok}Select</span>{learner && <span>{I.menu}Menu</span>}
      </div>

      <div className="bp-title">
        <div className="tc"><div className="mono-c">{letter}</div><span className="nm">{learner?.name ?? "Nobody yet"}</span></div>
        <div className="tc" style={{ padding: "0 12px" }} data-role={fr ? undefined : "desk-phone"} data-paired={fr ? undefined : "true"}>
          {phone.paired
            ? <svg className="pen" viewBox="0 0 200 70" aria-label="Phone paired"><path className="lit" d="M26 56L58 22L72 34L40 68Z" /><path className="lit" d="M26 56L20 68L40 68" /><path className="lit" d="M92 26Q102 18 112 26M86 16Q102 2 118 16" /><rect x="138" y="8" width="42" height="54" rx="8" /><path d="M152 55h14" /></svg>
            : <svg className="pen" viewBox="0 0 200 70" aria-label="Phone not paired"><g className="dim"><path d="M26 56L58 22L72 34L40 68Z" /><path d="M40 68L20 68" /><path d="M50 28L64 40" /></g><path className="dotl" d="M84 40H130" /><rect x="138" y="8" width="42" height="54" rx="8" /><path d="M152 55h14" /></svg>}
        </div>
        <div className="tc"><div className="pips" aria-hidden="true"><i className="pip on" /><i className="pip" /><i className="pip" /></div><span className="lv">Sheet</span></div>
        <div className="tc tm"><Mark /><span>Study Desk</span></div>
      </div>

      <div className="bp-grain" ref={grain} aria-hidden="true" />
    </div>
  );
}
