"use client";
/**
 * The Study Desk landing: "Left on the Desk" (docs/DESIGN-STUDY-DESK.md, design/desk-landing.css). A walnut study
 * desk at night seen from above, a leather blotter with the embossed wordmark, a place card saying whose desk it
 * is, the phone lying on it, and each app the learner has on as an object in its own brand: Math Buddy's marked
 * sheet (Lamplight), Linga's card with the arch and the scene (the Open Door), Essay Master's black card with the
 * lens word cut by the citron cursor (Specimen). The lamp's pool of light is the focus: it rests on what was left
 * (the CONTINUE tag) and the D-pad glides it between the objects (tv/keys.ts, tv/landingRows.ts). Everything each
 * object shows is read off the session; with nothing there, it says so in two words.
 */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Session, Subject } from "@/lib/session/store";
import { continueStop, deskWaiting, landingAt, landingStops, type EssayWaiting, type LandingStop, type LingaWaiting, type MathsWaiting, type SheetLine, type Waiting } from "@/tv/landingRows";
import { day } from "@/tv/screens";
import { MathText } from "@/maths/MathText";
import { Mark as MathsMark } from "@/maths/MathsTV";
import { MATHS_FONTS } from "@/maths/fonts";
import { Brand as EssayBrand, Arrow as EssayArrow } from "@/essay/EssayTV";
import { ESSAY_FONTS } from "@/essay/fonts";
import { Mark as LingaMark } from "@/english/OpenDoor";
import { ART, isScene } from "@/english/art";
import { DESK_FONTS } from "./fonts";

/** How long Select's zoom plays before the app opens (app/tv/page.tsx waits this long; reduced motion does not wait). */
export const ZOOM_MS = 560;

// ---------------------------------------------------------------- where things lie on the desk

/** An object's place on the 1920 x 1080 desk: left, top, width, height, and the angle it was put down at. */
type Box = [number, number, number, number, number];
const PLACE: Box = [760, 68, 400, 100, 0];
const PHONE: Record<"paired" | "fresh", Box> = { paired: [1306, 790, 470, 196, -5], fresh: [1160, 716, 620, 284, -3] };
/** The winner's own arrangements for the desks it drew; any other set of apps is laid out by the same rule. */
const KNOWN: Record<string, Partial<Record<Subject, Box>>> = {
  "maths,english,essay|paired": { maths: [150, 244, 500, 596, -3], english: [712, 206, 496, 624, 1.6], essay: [1274, 240, 500, 470, -1.8] },
  "maths,english,essay|fresh": { maths: [150, 236, 470, 540, -3], english: [700, 200, 470, 580, 1.6], essay: [1250, 226, 470, 470, -1.8] },
  "english,essay|paired": { english: [392, 236, 530, 630, -1.8], essay: [1040, 250, 530, 500, 1.8] },
  "english,essay|fresh": { english: [300, 244, 480, 580, -1.8], essay: [860, 254, 480, 470, 1.8] },
};
const TALL: Record<"paired" | "fresh", Record<Subject, number>> = { paired: { maths: 596, english: 624, essay: 470 }, fresh: { maths: 540, english: 580, essay: 470 } };
const TILT = [-3, 1.6, -1.8];
function layout(apps: Subject[], fresh: boolean): Record<string, Box> {
  const k = fresh ? "fresh" : "paired", known = KNOWN[`${apps.join(",")}|${k}`];
  const out: Record<string, Box> = { place: PLACE, phone: PHONE[k] };
  if (known) return { ...out, ...known } as Record<string, Box>;
  // the rest: side by side under the place card, centred on the free part of the desk
  const w = fresh ? 470 : 500, gap = 60, total = apps.length * w + (apps.length - 1) * gap, x0 = Math.max(150, (fresh ? 720 : 960) - total / 2);
  apps.forEach((a, i) => { out[a] = [x0 + i * (w + gap), 230, w, TALL[k][a], TILT[i % 3]]; });
  return out;
}
const centre = (b: Box) => [b[0] + b[2] / 2, b[1] + b[3] / 2];

// ---------------------------------------------------------------- the desk's own marks

/** Study Desk's mark: a screen with three panes and a sill, pressed into the leather. */
function HouseMark({ ink = "currentColor", cut = "#1b2420" }: { ink?: string; cut?: string }) {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="7" width="42" height="34" rx="9" fill={ink} /><rect x="9" y="13" width="15" height="14" rx="3" fill={cut} opacity=".85" /><rect x="27" y="13" width="7" height="14" rx="2.5" fill={cut} opacity=".85" /><rect x="37" y="13" width="3.5" height="14" rx="1.75" fill={cut} opacity=".85" /><rect x="9" y="31" width="31.5" height="4" rx="2" fill={cut} opacity=".5" /></svg>;
}
const LINK = <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" aria-hidden="true"><path d="M27 37l10-10" /><path d="M22 30l-6 6a9 9 0 0 0 12.7 12.7l6-6" /><path d="M42 34l6-6A9 9 0 0 0 35.3 15.3l-6 6" /></svg>;
const SWAP = <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 11h19M20 5l6 6-6 6M26 21H7M12 15l-6 6 6 6" /></svg>;
/** The desk's pen marks, drawn as a teacher draws them: the tick, and the loop left open at the end. */
const TICK = <svg className="dk-tk" viewBox="0 0 46 40" aria-hidden="true"><path pathLength={1} d="M5 22 L17 33 L42 5" /></svg>;
const RING = <svg className="dk-ring" viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden="true"><path pathLength={1} d="M70 5 C104 4 119 18 116 33 C112 52 44 60 14 46 C-2 38 4 12 30 7 C44 4 60 3 76 7" /></svg>;
const PENCIL = <svg className="dk-pencil" viewBox="0 0 360 40" aria-hidden="true"><path d="M0 20 L34 8 L34 32 Z" fill="#F1D3A3" /><path d="M0 20 L12 16 L12 24 Z" fill="#3A3A48" /><rect x="34" y="8" width="252" height="24" fill="#FFC56B" /><rect x="34" y="8" width="252" height="8" fill="#FFD994" /><rect x="34" y="24" width="252" height="8" fill="#E8A13D" /><rect x="286" y="7" width="32" height="26" fill="#C9C3B8" /><path d="M292 7v26M300 7v26M308 7v26" stroke="#9D978C" strokeWidth="2" /><rect x="318" y="7" width="38" height="26" rx="7" fill="#E9A3A0" /></svg>;

/** Shrinks each `.dk-fit` until it fits its box, in 2 px steps, never under its data-min (default 28 px). */
function useFit(dep: unknown) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const fit = () => root.current?.querySelectorAll<HTMLElement>(".dk-fit").forEach((el) => {
      el.style.fontSize = "";
      const box = el.parentElement!, cs = getComputedStyle(box);
      const max = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), min = Number(el.dataset.min ?? 28);
      let fs = parseFloat(getComputedStyle(el).fontSize), guard = 0;
      while (el.scrollWidth > max + 1 && fs > min && guard++ < 80) { fs -= 2; el.style.fontSize = `${fs}px`; }
    });
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
  }, [dep]);
  return root;
}

// ---------------------------------------------------------------- the objects

/** Math Buddy: the sheet on its night-blue folder. The real set, ticked and ringed by its verdicts; else a blank sheet. */
function MathsObject({ w }: { w: MathsWaiting }) {
  // the pen rings the answer (or the question when no answer came back): orange for a slip, dashed sky when the desk is not sure
  const row = (l: SheetLine, k: number) => {
    const v = l.voice === "hand" ? l.verdict : undefined, ring = v === "wrong" || v === "unsure" ? v : undefined;
    const onQ = ring && !l.answer, onA = ring && !!l.answer;
    return (
      <div key={l.n} className="dk-row" data-v={v} style={{ "--i": k } as CSSProperties}>
        <span className="dk-n">{l.n}</span>
        <span className="dk-q"><span className="dk-fit dk-ringed" data-min="30" data-ring={onQ ? ring : undefined}><MathText text={l.question} voice={l.voice} />{onQ && RING}</span></span>
        <span className="dk-a">{l.answer && <span className="dk-ringed" data-ring={onA ? ring : undefined}><MathText text={l.answer} voice="hand" />{onA && RING}</span>}</span>
        <span className="dk-mk">{v === "right" && TICK}</span>
      </div>
    );
  };
  return (<>
    <div className="maths-tv dk-folder">
      <div className="dk-sheet" data-empty={!w.lines.length || undefined}>
        {w.tab && <div className="dk-tab">{w.tab}</div>}
        {w.lines.length ? <>
          <div className="dk-topic"><span className="dk-fit" data-min="30">{w.title}</span></div>
          <div className="dk-rows">{w.lines.slice(0, 6).map(row)}</div>
        </> : <div className="dk-blank">{w.empty}</div>}
      </div>
      <div className="dk-mbfoot"><MathsMark /><div className="mb-word">Math <em>Buddy</em></div></div>
    </div>
    {w.lines.length > 0 && PENCIL}
  </>);
}

/** Linga: the cream card, the plum arch with the scene of the next or the unfinished conversation, the name tag. */
function LingaObject({ w }: { w: LingaWaiting }) {
  const { Art, label } = ART[w.art];
  return (<>
    <div className="dk-lghead"><LingaMark />{w.band && <span className="dk-lvl">{w.band}</span>}</div>
    <div className="dk-arch" data-scene={isScene(w.art)} data-art={w.art} role="img" aria-label={label}>
      <div className="dk-art"><Art /></div>
      {w.partner && w.kind !== "none" && <div className="dk-ptag"><span>{w.partner}</span></div>}
    </div>
    <div className="dk-sill" />
    <div className="dk-lgtitle">{w.empty ?? w.title}</div>
    {w.dots && (
      <div className="dk-midway" aria-hidden="true">
        {w.dots.slice(0, 8).map((d, i) => <b key={i} data-dot={d} />)}
        {w.midway && <span>Mid-way</span>}
      </div>
    )}
  </>);
}

/** Essay Master: the black specimen card. The lens last read, inked as far as the learner has got, the citron cursor at the edge. */
function EssayObject({ w }: { w: EssayWaiting }) {
  const name = (w.lensName ?? "").toUpperCase();
  return (
    <div className="essay-tv dk-card">
      <EssayBrand />
      {w.kind === "none" ? <>
        <div className="dk-ghosts">{w.ghosts.map((g) => <div key={g}><span className="dk-hatch dk-fit" data-min="60">{g.toUpperCase()}</span></div>)}</div>
        <div className="dk-nothing">{w.empty}</div>
      </> : <>
        <div className="dk-lens" data-role="essay-lens-word" style={{ "--dk-f": `${Math.round(w.estimate * 100)}%` } as CSSProperties}>
          <span className="dk-fit" data-min="72"><span className="dk-lens-gh">{name}</span><span className="dk-lens-ink" aria-hidden="true">{name}</span><i className="dk-cur" /></span>
        </div>
        {w.rail ? <>
          <div className="em-lbl dk-raillab">Paragraph</div>
          <div className="dk-rail" data-many={w.rail.length > 7 || undefined}>{w.rail.slice(0, 10).map((a) => (
            <div key={a.n} className="dk-arr" data-against={a.against || undefined}><EssayArrow len={56} h={26} against={a.against} color="currentColor" /><span>{a.n}</span></div>
          ))}</div>
        </> : <div className="dk-emline">{w.read} {w.read === 1 ? "paragraph" : "paragraphs"} read</div>}
      </>}
    </div>
  );
}

// ---------------------------------------------------------------- the caption, the zoom

const LAST_VERB: Record<Subject, string> = { maths: "Practised", english: "Talked", essay: "Read" };
function captionOf(s: Session, at: LandingStop | undefined, all: Waiting[]): { label: string; text: string } {
  if (at === "place") return { label: "Someone else", text: "Select to hand the desk to another learner." };
  if (at === "phone") return { label: "Phone", text: "Open the address on your phone, then enter the four digits." };
  const w = all.find((x) => x.app === at);
  if (!w) return { label: "Study Desk", text: "No apps are on this profile yet. Select the place card to change it." };
  // when it was left, as a short sentence of its own: "Left Wednesday." / "Read yesterday."
  const d = w.at && (w.kind === "last" || w.kind === "resume") ? day(w.at) : null;
  const when = d ? ` ${w.kind === "resume" ? "Left" : LAST_VERB[w.app]} ${d === "Today" || d === "Yesterday" ? d.toLowerCase() : d}.` : "";
  return { label: w.app === "maths" ? "Math Buddy" : w.app === "english" ? "Linga" : "Essay Master", text: `${w.line}${when}` };
}

const ZOOM_WORD: Record<LandingStop, string> = { maths: "Opening Math Buddy", english: "Opening Linga", essay: "Opening Essay Master", place: "Whose desk is it?", phone: "Pair a phone" };
/** Select: the lit object grows until the stage is its app's own colours, then the app opens. */
function Zoom({ stop, box }: { stop: LandingStop; box: Box }) {
  const [full, setFull] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => requestAnimationFrame(() => setFull(true))); return () => cancelAnimationFrame(r); }, []);
  const style = { "--zx": `${box[0]}px`, "--zy": `${box[1]}px`, "--zw": `${box[2]}px`, "--zh": `${box[3]}px`, "--zr": `${box[4]}deg` } as CSSProperties;
  return (
    <div className="dk-zoom" data-role="desk-zoom" data-app={stop} data-full={full || undefined} style={style}>
      <div className="dk-zin">
        {stop === "maths" ? <div className="maths-tv dk-zbrand"><MathsMark /><div className="mb-word">Math <em>Buddy</em></div></div>
          : stop === "english" ? <div className="dk-zbrand"><LingaMark /></div>
          : stop === "essay" ? <div className="essay-tv dk-zbrand"><EssayBrand /></div>
          : <div className="dk-zbrand dk-zhouse"><HouseMark ink="currentColor" cut="#1b2420" /><span>Study Desk</span></div>}
        <div className="dk-zword">{ZOOM_WORD[stop]}</div>
      </div>
    </div>
  );
}

/** Whose desk the lamp was last switched on for, this page load: the room flickers on only when someone sits down. */
let litFor: string | null = null;

// ---------------------------------------------------------------- the desk

export function LandingTV({ s, zoom }: { s: Session; zoom: LandingStop | null }) {
  const [boot] = useState(() => litFor !== s.learner.id);
  useEffect(() => { litFor = s.learner.id; }, [s.learner.id]);
  const stops = landingStops(s), i = landingAt(s), at = stops[i];
  const all = deskWaiting(s), apps = all.map((w) => w.app);
  const cont = continueStop(s);
  const fresh = !s.joined;
  const boxes = layout(apps, fresh);
  const lit = at ? boxes[at] : PLACE, [cx, cy] = centre(lit);
  const cap = captionOf(s, at, all);
  const root = useFit(`${s.learner.id}|${s.updatedAt}|${apps.join()}`);
  const place = (b: Box, extra?: CSSProperties): CSSProperties => ({ left: b[0], top: b[1], width: b[2], height: b[3], "--r": `${b[4]}deg`, ...extra } as CSSProperties);
  const url = s.phoneUrl.replace(/^https?:\/\//, "");

  const object = (w: Waiting): ReactNode => (
    <div key={w.app} className={`dk-obj dk-${w.app === "maths" ? "mb" : w.app === "english" ? "lg" : "em"}`} data-role="desk-object" data-app={w.app}
      data-kind={w.kind} data-focused={at === w.app} style={place(boxes[w.app])}>
      {cont?.tagged && cont.app === w.app && <div className="dk-ctag" data-role="desk-continue"><i />Continue</div>}
      {w.app === "maths" ? <MathsObject w={w} /> : w.app === "english" ? <LingaObject w={w} /> : <EssayObject w={w} />}
    </div>
  );

  return (
    <div ref={root} className={`desk-tv ${DESK_FONTS} ${MATHS_FONTS} ${ESSAY_FONTS}`} data-role="desk-scene" data-boot={boot || undefined} data-fresh={fresh || undefined}
      data-lit={at} style={{ "--px": `${cx}px`, "--py": `${cy}px` } as CSSProperties}>
      <div className="dk-blotter" data-role="desk-blotter"><div className="dk-lip" /></div>
      <div className="dk-plate" data-role="desk-wordmark"><HouseMark /><span>Study Desk</span></div>
      <div className="dk-pool" aria-hidden="true" />
      <div className="dk-objects">
        {all.map(object)}
        <div className="dk-obj dk-ph" data-role="desk-phone" data-paired={s.joined} data-focused={at === "phone"} style={place(boxes.phone)}>
          {s.joined
            ? <div className="dk-scr"><span className="dk-lk">{LINK}</span><div className="dk-pn">{s.learner.name} · paired<small>Phone</small></div></div>
            : <div className="dk-scr"><div className="dk-pair"><div className="dk-lab">On your phone, open</div><div className="dk-url"><span className="dk-fit" data-min="28">{url}</span></div>
                <div className="dk-pins" data-role="desk-pin" aria-label={`Code ${s.pin}`}>{s.pin.split("").map((d, k) => <b key={k}>{d}</b>)}</div></div></div>}
        </div>
        <div className="dk-obj dk-pc" data-role="desk-place-card" data-focused={at === "place"} style={place(boxes.place)}>
          <HouseMark ink="#3A2417" cut="#EDE5D8" /><span>{s.learner.name}’s desk</span>
          <div className="dk-se">{SWAP}Someone else</div>
        </div>
      </div>
      <div className="dk-dim" aria-hidden="true" data-wide={at === "place" || undefined} />
      <div className="dk-lamp" aria-hidden="true" />
      <div className="dk-cap" data-role="desk-caption" data-narrow={fresh || undefined} key={cap.label + cap.text}>
        <p><b>{cap.label}</b>{cap.text}</p>
      </div>
      {zoom && boxes[zoom] && <Zoom stop={zoom} box={boxes[zoom]} />}
      <div className="dk-blackout" aria-hidden="true" />
    </div>
  );
}
