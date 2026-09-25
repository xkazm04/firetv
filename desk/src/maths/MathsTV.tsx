"use client";
/**
 * Math Buddy's television, in its own design language: Lamplight (docs/DESIGN-MATH-BUDDY.md,
 * design/maths-lamplight.css) - a lamp-lit desk at night, the learner's paper under the lamp, their working in
 * their own hand, the desk's orange pen marking inside the line. Every Math Buddy screen is here: Tonight (the
 * home), the topics, the six questions on paper, the marked sheet and its walk, and the page, hint, lesson,
 * units and calendar while maths is on them (tv/keys.ts `mathsOwns`). Each is drawn from the session and from
 * the stop lists in tv/keys.ts, so the D-pad there and the focus drawn here share one list. The On Air shell
 * (grid, band, rail, safe box) steps aside: this root is the whole 1920 x 1080 stage and keeps the 5% margins
 * itself. Stable `data-role` hooks (maths-*) name the parts a host checks.
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Page, PracticeItem, SchoolSystem, Session } from "@/lib/session/store";
import { SYLLABUS, expectedIndex, topic as topicById, type Topic } from "@/lib/library/syllabus";
import { slip as slipById } from "@/lib/rules/maths";
import { continueCard, type Continue } from "@/tv/mathsRows";
import { running, practiceFailed, stopAt, tonightStops, calendarStops, unitStops, walkStops, HINT_STOPS, TOPIC_STOPS, type TonightStop } from "@/tv/keys";
import { sheetTiles, sheetStops, tileOf } from "@/tv/sheetRows";
import { systemOf } from "@/tv/profileRows";
import { fmt } from "@/tv/useSession";
import { day } from "@/tv/screens";
import { MATHS_FONTS } from "./fonts";
import { MathText, Tick } from "./MathText";
import { isTall, parseMath } from "./typeset";
import { KIND_WORD, lookAt, working } from "./working";

/** The root every Math Buddy screen is drawn in. `busy` is the TV's own wait for a practice set. */
export function MathsTV({ s, busy }: { s: Session; busy: boolean }) {
  const f = s.focus;
  const blank = s.screen === "tonight" && !continueCard(s);
  const lamp = ["sheet", "walk", "page", "hint", "practice", "units"].includes(s.screen) ? "paper" : blank ? "blank" : s.screen === "topics" || s.screen === "calendar" ? "wide" : "desk";
  return (
    <div className={`maths-tv ${MATHS_FONTS}`} data-screen={s.screen} data-lamp={lamp}>
      <div className="mb-lamp" aria-hidden="true"><i /></div>
      {s.screen === "tonight" ? <Tonight s={s} focus={f} />
        : s.screen === "topics" ? <Topics s={s} focus={f} busy={busy} />
        : s.screen === "practice" ? <PracticeScreen s={s} />
        : s.screen === "sheet" ? <Sheet s={s} focus={f} />
        : s.screen === "walk" ? <Walk s={s} focus={f} />
        : s.screen === "page" ? <PageScreen s={s} />
        : s.screen === "hint" ? <HintScreen s={s} focus={f} />
        : s.screen === "lesson" ? <LessonScreen s={s} />
        : s.screen === "units" ? <Units s={s} focus={f} />
        : s.screen === "calendar" ? <Calendar s={s} focus={f} />
        : null}
    </div>
  );
}

// ---------------------------------------------------------------- the shell: mark, chips, caption, pills

/** A title with its last word in amber italic, the Lamplight way ("Back to the *sheet*"). */
function Amber({ text }: { text: string }) {
  const w = text.trim().split(" ");
  if (w.length < 2) return <>{text}</>;
  const last = w.pop()!;
  return <>{w.join(" ")} <em>{last}</em></>;
}

/** The mark: an equals sign whose lower bar steps forward, on an orange rounded square. */
export function Mark() {
  return (
    <div className="mb-mark" data-role="maths-mark" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <defs><radialGradient id="mb-mark-glow" cx=".28" cy=".22" r="1"><stop offset="0" stopColor="#FFEBC4" /><stop offset=".45" stopColor="#FFC56B" /><stop offset="1" stopColor="#E8891F" /></radialGradient></defs>
        <rect x="1" y="1" width="62" height="62" rx="17" fill="url(#mb-mark-glow)" />
        <rect x="1.5" y="1.5" width="61" height="61" rx="16.5" fill="none" stroke="rgba(255,255,255,.45)" />
        <rect x="11" y="19" width="28" height="8.5" rx="4.25" fill="#1A1D38" />
        <path d="M25.25 34 H41 V41.5 H53 a4.25 4.25 0 0 1 0 8.5 H37 a4.25 4.25 0 0 1 -4.25 -4.25 V42.5 H25.25 a4.25 4.25 0 0 1 0 -8.5 Z" fill="#1A1D38" />
      </svg>
    </div>
  );
}
const PHONE = <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><rect x="11" y="4" width="18" height="32" rx="4" /><path d="M17.5 31h5" /><path d="M33 13c2 2 2 8 0 10M36.5 10c3.5 4 3.5 12 0 16" strokeWidth="2" opacity=".85" /></svg>;
const PHONE_SMALL = <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><rect x="11" y="4" width="18" height="32" rx="4" /><path d="M17.5 31h5" /></svg>;
const PLAY = <svg viewBox="0 0 26 26" fill="currentColor"><path d="M8 5l14 8-14 8z" /></svg>;
const PAUSE = <svg viewBox="0 0 26 26" fill="currentColor"><rect x="6" y="5" width="5" height="16" rx="1.5" /><rect x="15" y="5" width="5" height="16" rx="1.5" /></svg>;
const ARROW = <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 16 C 14 12, 26 18, 38 15 M29 6 L39 15 L29 24" /></svg>;
const Chev = ({ dir, on }: { dir: "l" | "r"; on: boolean }) => <svg className={on ? "on" : undefined} viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir === "l" ? "M24 4 L12 15 L24 26" : "M16 4 L28 15 L16 26"} /></svg>;
const ICON = {
  hint: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 20.5c-2.6-1.8-4.2-4.4-4.2-7.4a8.7 8.7 0 0 1 17.4 0c0 3-1.6 5.6-4.2 7.4v2.5h-9z" /><path d="M12.5 27.5h7" /><path d="M16 23v-6.5l-2.5-2.5M16 16.5l2.5-2.5" strokeWidth="2.2" /></svg>,
  lesson: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8c-3-2-7-2.5-11-2v19c4-.5 8 0 11 2 3-2 7-2.5 11-2V6c-4-.5-8 0-11 2z" /><path d="M16 8v19" /></svg>,
  paper: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h12l6 6v18H7z" /><path d="M11 16h10M11 21h6" /><path d="M19 4v6h6" /></svg>,
  six: <svg viewBox="0 0 46 46" fill="currentColor"><rect x="7" y="7" width="13" height="9" rx="2" /><rect x="26" y="7" width="13" height="9" rx="2" /><rect x="7" y="19" width="13" height="9" rx="2" /><rect x="26" y="19" width="13" height="9" rx="2" /><rect x="7" y="31" width="13" height="9" rx="2" /><rect x="26" y="31" width="13" height="9" rx="2" /></svg>,
  away: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18h7l2 4h6l2-4h7v9H4z" /><path d="M16 4v12M11 11l5 5 5-5" /></svg>,
  back: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M26 16H8M14 9l-7 7 7 7" /></svg>,
};
const SLIP_MARK = <svg viewBox="0 0 26 22"><path d="M4 18 L12 4 M10 19 L20 6" /></svg>;
/** The kicker draws the same mark as the paper, so the grammar teaches itself. */
const KIND_ICON: Record<string, ReactNode> = {
  missing: <svg viewBox="0 0 52 40"><path d="M4 8 H18 M34 8 H48" opacity=".5" /><path d="M14 36 L26 22 L38 36" /><path d="M19 4 H33 V16 H19 Z" strokeDasharray="5 4" /></svg>,
  sign: <svg viewBox="0 0 52 40"><path d="M26 11 V29 M17 20 H35" /><path d="M14 11 C 20 3, 38 4, 42 14 C 46 26, 34 36, 23 35 C 11 34, 6 24, 11 14 C 13 11, 16 9, 20 8" /></svg>,
  extra: <svg viewBox="0 0 52 40"><path d="M10 20 H22 M30 20 H42" opacity=".5" /><path d="M4 28 C 18 24, 34 18, 48 12 M6 34 C 20 30, 36 24, 49 19" /></svg>,
  line: <svg viewBox="0 0 52 40"><path d="M4 18 H48" opacity=".5" /><path d="M4 30 C 10 24, 16 36, 22 30 S 34 24, 40 30 S 46 34, 49 29" /></svg>,
  right: <svg viewBox="0 0 52 40"><path d="M10 21 L22 33 L44 7" /></svg>,
  unsure: <svg viewBox="0 0 52 40"><path d="M18 12 C 18 4, 34 4, 34 12 C 34 18, 26 19, 26 25" /><path d="M26 33 V34" /></svg>,
  six: <svg viewBox="0 0 52 40"><path d="M8 6 H22 V14 H8 Z M30 6 H44 V14 H30 Z M8 18 H22 V26 H8 Z M30 18 H44 V26 H30 Z M8 30 H22 V38 H8 Z M30 30 H44 V38 H30 Z" /></svg>,
};

/** The chips: the learner, the phone, the clock. Status, never a stop. */
function Chips({ s, clock = true, phone = true, learner = true }: { s: Session; clock?: boolean; phone?: boolean; learner?: boolean }) {
  const run = s.timer.running;
  return (
    <div className="mb-status">
      {learner && <div className="mb-chip" data-role="maths-chip"><span className="av">{s.learner.name.charAt(0)}</span>{s.learner.name}</div>}
      {phone && (s.joined
        ? <div className="mb-glyph" data-role="maths-chip">{PHONE}<span className="mb-lab">Phone</span></div>
        : <div className="mb-glyph" data-role="maths-chip">{PHONE}<span className="mb-lab">Pin</span><span className="pin">{s.pin}</span></div>)}
      {clock && (
        <div className="mb-chip mb-clock" data-role="maths-chip" data-running={run}>
          {run ? PLAY : PAUSE}<span className="mb-lab">{run ? (s.timer.phase === "break" ? "Break" : "Focus") : "Paused"}</span><span className="t">{fmt(Math.max(0, Math.round(s.timer.left)))}</span>
        </div>
      )}
    </div>
  );
}
function Top({ s, crumb, right }: { s: Session; crumb?: string; right?: ReactNode }) {
  return (
    <header className="mb-top">
      <div className="mb-brand">
        <Mark />
        <div className="mb-word">Math <em>Buddy</em></div>
        {crumb && <div className="mb-crumb"><span className="sep" /><span className="tp">{crumb}</span></div>}
      </div>
      {right ?? <Chips s={s} />}
    </header>
  );
}
/** The one caption slot. A new caption rises in; under reduced motion it cuts. */
function Caption({ text, lead, top }: { text: string; lead?: string; top?: number }) {
  return <div className="mb-cap" key={text} style={top !== undefined ? { top } : undefined}>{lead && <span className="lead">{lead}</span>}{text}</div>;
}
/** One pill; the first action on a screen is primary. */
function Act({ icon, label, focused, primary, pips, disabled }: { icon: ReactNode; label: string; focused: boolean; primary?: boolean; pips?: [number, number]; disabled?: boolean }) {
  return (
    <div className="mb-act" data-role={primary ? "maths-primary" : "maths-secondary"} data-focused={focused} data-disabled={disabled || undefined}>
      <span className="ic">{icon}</span><span>{label}</span>
      {pips && <span className="pp">{Array.from({ length: pips[1] }, (_, i) => <i key={i} className={i < pips[0] ? "on" : undefined} />)}</span>}
    </div>
  );
}

/** A sentence from the desk that carries maths: powers as printed, real minus signs, and "x = −7" never split. */
export function prose(t: string): string {
  const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", n: "ⁿ", x: "ˣ" };
  const nb = " ";
  return String(t ?? "")
    .replace(/\*\*(?=[-\dnx])/g, "^").replace(/\*\*/g, "").replace(/\$/g, "")
    .replace(/\^\{?(-?[\dnx]+)\}?/g, (_, e: string) => [...e].map((c) => SUP[c] ?? c).join(""))
    .replace(/(\S) - (?=\S)/g, `$1${nb}−${nb}`).replace(/(^|[\s(=])-(?=[\dx(])/g, "$1−")
    .replace(/(\S) ([=+−<>≤≥×÷]) (?=\S)/g, `$1${nb}$2${nb}`);
}

// ---------------------------------------------------------------- the paper: rows that pan under the lamp

/**
 * Slides the paper so the item in hand sits under the lamp (the winner's pan), and hangs a continued line's
 * "=" under the "=" above it, as a careful student aligns working. Measured after layout and again when the
 * faces arrive, in stage pixels (the stage is scaled as a whole).
 */
function usePaper(dep: unknown) {
  const pan = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = pan.current; if (!el) return;
    const lay = () => {
      const paper = el.querySelector<HTMLElement>(".mb-paper"); if (!paper) return;
      // "=" under "="
      paper.querySelectorAll<HTMLElement>(".mb-item").forEach((item) => {
        let anchor: number | null = null;
        item.querySelectorAll<HTMLElement>(".mb-row.w .rin").forEach((rin) => {
          rin.style.marginLeft = "0px";
          const mx = rin.querySelector<HTMLElement>(".mx"); if (!mx) return;
          const k = rin.getBoundingClientRect().width / Math.max(1, rin.offsetWidth) || 1;
          const first = mx.firstElementChild as HTMLElement | null, eq = mx.querySelector<HTMLElement>(".mo.eq");
          const x = (e: HTMLElement) => (e.getBoundingClientRect().left - rin.getBoundingClientRect().left) / k;
          if (first?.classList.contains("eq") && anchor !== null) { rin.style.marginLeft = `${Math.max(0, anchor - x(first))}px`; return; }
          anchor = eq ? x(eq) : null;
        });
      });
      // the pan
      const cur = paper.querySelector<HTMLElement>('[data-cur="true"]');
      const WH = el.parentElement?.offsetHeight ?? 778, PH = paper.offsetHeight;
      const top = cur ? cur.offsetTop : 0;
      const ty = PH <= WH ? 0 : Math.max(WH - PH - 10, Math.min(20, 40 - top));
      el.style.transform = `translateY(${ty}px)`;
    };
    lay();
    let live = true;
    document.fonts?.ready.then(() => { if (live) lay(); });
    return () => { live = false; };
  }, [dep]);
  return pan;
}

/** The ring every teacher draws round an item number. */
const NumRing = () => <svg className="nr" viewBox="0 0 64 62" aria-hidden="true"><path d="M14 16 C 22 4, 48 4, 55 18 C 62 34, 50 54, 32 55 C 14 56, 4 42, 8 26 C 10 20, 14 16, 22 13" /></svg>;
const MarginArrow = () => <svg className="marrow" viewBox="0 0 110 40" aria-hidden="true"><path d="M12 16 C 36 8, 62 26, 92 20 M76 5 L93 20 L76 34" /></svg>;

/** One line of the learner's working on the paper: whole squares tall, the pen inside it, a tick after it. */
function HandRow({ line, mark, tick, after, arrow }: { line: string; mark?: Parameters<typeof MathText>[0]["mark"]; tick?: boolean; after?: boolean; arrow?: boolean }) {
  return (
    <div className="mb-row w" data-tall={isTall(parseMath(line))} data-after={after || undefined}>
      {arrow && <MarginArrow />}
      <span className="rin"><MathText text={line} voice="hand" mark={mark} />{tick && <Tick />}</span>
    </div>
  );
}
function PrintRow({ text, tick, wrap }: { text: string; tick?: boolean; wrap?: boolean }) {
  return <div className={`mb-row q${wrap ? " wrap" : ""}`} data-tall={isTall(parseMath(text))}><span className="rin"><MathText text={text} voice="print" />{tick && <Tick />}</span></div>;
}

// ---------------------------------------------------------------- the ruler: the topic path

const SYS_WORD: Record<SchoolSystem, (t: Topic) => string> = {
  us: (t) => `Grade ${t.year.us}`, uk: (t) => `Year ${t.year.uk}`, cz: (t) => `${t.year.cz}. ročník`, de: (t) => `Klasse ${t.year.de}`,
};
type TState = "secure" | "here" | "next" | "later";
/** What the session alone says about each topic (the measured record, plus tonight's marked set). */
function topicStates(s: Session): Record<string, TState> {
  const done = new Set<string>(Object.values(s.skills ?? {}).filter((r) => r.secure).map((r) => r.topic));
  if (s.practice?.marked && s.practice.items.filter((i) => i.verdict === "right").length >= 5) done.add(s.practice.topic);
  const out: Record<string, TState> = {};
  for (const t of SYLLABUS) out[t.id] = done.has(t.id) ? "secure" : s.topic === t.id ? "here" : t.prereq.every((p) => done.has(p)) ? "next" : "later";
  return out;
}
/** A description of fact, never of permission: nothing on the path is locked. */
function stateWord(s: Session, t: Topic, st: Record<string, TState>): string {
  if (st[t.id] === "secure") return "Secure";
  return st[t.id] === "here" || (s.skills?.[t.id]?.seen ?? 0) > 0 ? "In progress" : "Not started";
}

/**
 * The path as a boxwood ruler: secure topics inked solid, one in progress hatched as far as the estimate, an
 * unseen one a dashed groove, slips as pencil scratches. The learner's needle stands at the frontier; the
 * SCHOOL tick stands where the learner's school system would normally have them, and only when the profile has
 * an age and a school type to read it from - no invented comparison. On Topics the topics are the stops.
 */
function Ruler({ s, big, focus, busy }: { s: Session; big?: boolean; focus?: number; busy?: boolean }) {
  const me = s.profiles.find((p) => p.id === s.learner.id);
  const sys = systemOf(me);
  const skills = s.skills ?? {};
  const N = SYLLABUS.length, PAD = 26, W = 1728, span = (W - PAD * 2) / N;
  const has = SYLLABUS.some((t) => skills[t.id]);
  let frontier = N - 1;
  for (let i = 0; i < N; i++) { if (!skills[SYLLABUS[i].id]?.secure) { frontier = i; break; } }
  const fsk = skills[SYLLABUS[frontier].id];
  const mx = !has ? PAD : PAD + (frontier + (fsk ? (fsk.secure ? 1 : Math.max(0, Math.min(1, fsk.estimate))) : 0)) * span;
  const age = me && me.type !== "other" ? me.age : undefined;
  const exp = age === undefined ? null : expectedIndex(sys, age);
  const fx = exp === null ? null : PAD + Math.max(0, Math.min(N, exp)) * span;
  const st = big ? topicStates(s) : null;
  const strands = SYLLABUS.map((t, i) => (i === 0 || SYLLABUS[i - 1].strand !== t.strand ? t.strand : null));
  return (
    <div className={`mb-ruler${big ? " big" : ""}`} data-role="maths-ruler" data-active={focus !== undefined || undefined}>
      <div className="mb-rbody" />
      <div className="mb-major start" style={{ left: PAD - 2 }} />
      {SYLLABUS.map((t, i) => i > 0 && <div key={"m" + t.id} className="mb-major" style={{ left: PAD + i * span - 1.5 }} />)}
      <div className="mb-major" style={{ left: PAD + N * span - 1.5 }} />
      {strands.map((x, i) => x && <div key={"s" + i} className="mb-strand" style={{ left: PAD + i * span + 20 }}>{x}</div>)}
      {SYLLABUS.map((t, i) => {
        const sk = skills[t.id];
        const state = sk?.secure ? "secure" : sk ? "prog" : "unseen";
        const slips = (sk?.slips ?? []).slice(0, 4);
        return (
          <div key={t.id} className="mb-topic" data-s={state} data-focused={focus === i || undefined} data-busy={(busy && focus === i) || undefined} style={{ left: PAD + i * span + 6, width: span - 12 }}>
            <div className="mb-groove">{state !== "unseen" && <div className="fill" style={state === "prog" ? { width: `${Math.max(8, Math.min(100, (sk?.estimate ?? 0) * 100))}%` } : undefined} />}</div>
            {slips.length > 0 && <div className="mb-slips" aria-label={`${slips.length} slips seen`}>{slips.map((x) => <span key={x}>{SLIP_MARK}</span>)}</div>}
            <div className="mb-tl"><div className="mb-tn">{t.name}</div><div className="mb-ty">{SYS_WORD[sys](t)}</div>{st && <div className="mb-st">{stateWord(s, t, st)}</div>}</div>
          </div>
        );
      })}
      {fx !== null && <div className="mb-gapline" style={{ left: Math.min(mx, fx), width: Math.abs(fx - mx) }} />}
      {fx !== null && <div className="mb-flag" data-end={exp !== null && exp >= N || undefined} data-start={exp !== null && exp <= 0 || undefined} style={{ left: fx }}><div className="nd" /><div className="mc">School</div></div>}
      <div className="mb-marker" data-start={!has || undefined} style={{ left: mx }}><div className="halo" /><div className="nd" /><div className="mc">{s.learner.name}</div></div>
    </div>
  );
}

// ---------------------------------------------------------------- M0 Tonight: the sheet on the desk, two doors, the ruler

const DOORS: Array<{ id: Exclude<TonightStop, "continue">; k: string; t: string }> = [
  { id: "homework", k: "The sheet you were given", t: "I have homework" },
  { id: "teach", k: "No sheet needed", t: "Teach me something" },
];
function doorCaption(s: Session, i: number): string {
  if (i === 1) return "Pick a topic and the desk writes six questions to work on paper, then marks them from a photo.";
  if (s.awaiting === "maths") return "Waiting for the Math Buddy page. Snap it on the phone — it appears here.";
  if (s.pages.some((p) => p.subject === "maths")) return "The sheet is already on the desk. Enter opens it, one problem at a time.";
  return "Snap the sheet on the phone and the desk reads it, one problem at a time — hints, never the answer.";
}
const COUNT = ["", "One", "Two", "Three", "Four", "Five"];

function DoorArt({ id }: { id: "homework" | "teach" }) {
  if (id === "homework") return (
    <svg viewBox="0 0 230 210" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g opacity=".55"><path d="M26 64 L170 52 L184 196 L40 206 Z" /><path d="M52 92 h60 M56 118 h84 M58 144 h52 M60 170 h72" strokeWidth="3.5" /></g>
      <rect x="72" y="8" width="84" height="164" rx="16" strokeWidth="4.5" />
      <rect x="78" y="14" width="72" height="152" rx="11" fill="currentColor" opacity=".08" stroke="none" />
      <path d="M104 18 h20" strokeWidth="3.5" />
      <g strokeWidth="5"><path d="M86 50 v-12 h12 M142 50 v-12 h-12 M86 126 v12 h12 M142 126 v12 h-12" /></g>
      <path d="M96 76 h36 M96 94 h26 M96 112 h32" strokeWidth="3.5" opacity=".75" />
      <circle cx="114" cy="154" r="7" strokeWidth="3.5" />
    </svg>
  );
  return (
    <svg viewBox="0 0 230 210" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="34" y="20" width="158" height="182" rx="12" />
      <g strokeWidth="3.5">{[58, 84, 110, 136, 162].map((x) => <path key={x} d={`M${x} 30 v-18 a7 7 0 0 1 14 0 v10`} />)}</g>
      <g strokeWidth="3.5">{[0, 1, 2].flatMap((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={52 + c * 68} y={50 + r * 48} width="56" height="36" rx="6" />))}</g>
      <g transform="rotate(38 196 150)"><rect x="190" y="96" width="14" height="92" rx="3" fill="currentColor" fillOpacity=".18" /><path d="M190 188 l7 18 l7 -18" /></g>
    </svg>
  );
}
const Pencil = ({ style }: { style?: React.CSSProperties }) => (
  <svg className="mb-pencil" viewBox="0 0 34 300" style={style} aria-hidden="true">
    <defs><linearGradient id="mb-pencil-wood" x1="0" x2="1"><stop offset="0" stopColor="#E9A640" /><stop offset=".5" stopColor="#FFC96E" /><stop offset="1" stopColor="#C98224" /></linearGradient></defs>
    <rect x="3" y="24" width="28" height="224" fill="url(#mb-pencil-wood)" /><rect x="3" y="24" width="28" height="30" fill="#8A93AD" /><rect x="3" y="4" width="28" height="22" rx="6" fill="#E9B7A0" />
    <path d="M3 248 L17 292 L31 248 Z" fill="#EBD2A8" /><path d="M12 276 L17 292 L22 276 Z" fill="#27304A" />
  </svg>
);
const TALLY_TICK = <svg viewBox="0 0 40 40"><path d="M6 21 L16 31 L35 8" stroke="#FFB13D" strokeWidth="4.5" /></svg>;
const TALLY_RING = <svg viewBox="0 0 40 40"><path d="M10 12 C 16 4, 32 5, 35 16 C 38 28, 26 36, 16 34 C 6 32, 3 20, 9 12 C 12 9, 15 8, 18 8" stroke="#D9741A" strokeWidth="4" /></svg>;
const TALLY_ASK = <svg viewBox="0 0 40 40"><path d="M10 12 C 16 4, 32 5, 35 16 C 38 28, 26 36, 16 34 C 6 32, 3 20, 9 12" stroke="#8FB8FF" strokeWidth="3.5" strokeDasharray="5 5" /></svg>;
const RING_BOX = <svg className="ring" viewBox="0 0 200 110" preserveAspectRatio="none" aria-hidden="true"><path d="M18 30 C 40 6, 150 4, 186 26 C 204 44, 190 90, 120 100 C 60 106, 10 96, 8 62 C 6 44, 16 32, 34 24" /></svg>;
const TICK_BOX = <svg className="tk" viewBox="0 0 60 50" aria-hidden="true"><path d="M6 27 L22 42 L54 6" /></svg>;

/** Older sheets under the top one, each with its day on a tab - the history as a picture. Real entries only. */
function UnderSheets({ s }: { s: Session }) {
  const rows = (s.history ?? []).filter((h) => h.kind === "homework" || h.kind === "practice").slice(-2).reverse();
  return <>{rows.map((h, k0) => { const k = rows.length - k0; return (
    <div key={`${h.at}-${k}`} className="mb-sheet under" style={{ transform: `translate3d(${k * 16}px,${-k * 20}px,${-k * 2}px) rotate(${k * 2.6}deg)` }}>
      <div className="mb-tab" style={{ left: 230 + (k - 1) * 160 }}>{day(h.at)}</div>
      {[110, 170, 230, 290, 350, 410].map((y, j) => <div key={y} className="scrib" style={{ top: y, right: 70 + ((j * 37) % 120) }} />)}
    </div>
  ); })}</>;
}

/** The continue card as the thing itself: the marked set, the six questions, or the snapped sheet. */
function Hero({ s, cont, focused }: { s: Session; cont: Continue; focused: boolean }) {
  const p = s.practice;
  let sheet: ReactNode, detail: ReactNode = cont.d;
  const head = (ex: string) => <div className="mb-shead"><span className="ex">{ex}</span><span className="who">{s.learner.name}</span></div>;
  if (cont.go === "sheet" && p) {
    const name = topicById(p.topic)?.name ?? humanTopic(p.topic);
    const first = p.items.findIndex((it) => it.verdict !== "right");
    sheet = (
      <div className="mb-sheet top"><div className="mb-tab" style={{ left: 40 }}>{cont.k}</div><div className="margin" />{head(name)}
        <div className="mb-boxes">{p.items.slice(0, 6).map((it, i) => {
          const v = it.verdict ?? "unsure";
          return (
            <div key={it.n} className="mb-box" data-v={v} data-look={i === first || undefined}>
              <span className="qx"><MathText text={it.question} voice="hand" />{v === "wrong" && RING_BOX}</span>
              {v === "right" ? TICK_BOX : <span className="la">{v === "wrong" ? "look again" : "not sure"}</span>}
            </div>
          );
        })}</div>
      </div>
    );
    detail = <span className="tally" aria-label={cont.d}>{p.items.map((it) => <span key={it.n}>{it.verdict === "right" ? TALLY_TICK : it.verdict === "wrong" ? TALLY_RING : TALLY_ASK}</span>)}</span>;
  } else if (cont.go === "practice" && p) {
    sheet = (
      <div className="mb-sheet top"><div className="mb-tab" style={{ left: 40 }}>{cont.k}</div><div className="margin" />{head(topicById(p.topic)?.name ?? humanTopic(p.topic))}
        <div className="mb-rows">{p.items.slice(0, 8).map((it) => <div key={it.n} className="mb-srow"><span className="n">{it.n}</span><span className="qx"><MathText text={it.question} voice="print" /></span></div>)}</div>
      </div>
    );
  } else {
    const pg: Page | undefined = s.pages[cont.pageIx];
    const rows = (pg?.items ?? []).slice(0, 8);
    const at = s.pageIx === cont.pageIx ? Math.min(rows.length - 1, s.itemIx) : 0;
    sheet = (
      <div className="mb-sheet top"><div className="mb-tab" style={{ left: 40 }}>{cont.k}</div><div className="margin" />{head(pg?.title ?? "")}
        <div className="mb-readline" style={{ top: 80 + Math.max(0, at) * 43 + 1 }} />
        <div className="mb-rows">{rows.map((it) => <div key={it.key} className="mb-srow"><span className="n">{it.n}</span><span className="qx"><MathText text={it.text} voice="print" /></span></div>)}</div>
      </div>
    );
  }
  return (
    <section className="mb-hero" data-focused={focused}>
      <div className="mb-art" data-role="maths-sheet"><div className="mb-stack"><UnderSheets s={s} />{sheet}<Pencil /></div></div>
      <div className="mb-htext" data-role="maths-primary">
        <div className="mb-kick">{cont.k}</div>
        <div className="mb-htitle" data-role="maths-title"><Amber text={cont.t} /></div>
        <div className="mb-detail">{detail}</div>
        <div className="mb-ok"><span className="ok">OK</span><span className="mb-lab">Open</span></div>
      </div>
    </section>
  );
}
/** The first evening: a blank sheet with the learner's name on it and a starting line - no invented sum. */
function BlankHero({ s }: { s: Session }) {
  return (
    <section className="mb-hero blank" data-role="maths-sheet">
      <div className="mb-art"><div className="mb-stack">
        <div className="mb-sheet top"><div className="margin" /><div className="mb-shead"><span className="ex">Start here</span><span className="who">{s.learner.name}</span></div>
          <div className="mb-startdot" /><div className="mb-startline" /></div>
        <Pencil style={{ left: 330, top: 120, height: 260 }} />
      </div></div>
    </section>
  );
}

export function Tonight({ s, focus }: { s: Session; focus: number }) {
  const cont = continueCard(s);
  const at = stopAt(tonightStops(s), focus);
  const secure = Object.values(s.skills ?? {}).filter((r) => r.secure).map((r) => r.topic);
  const door = at === "continue" ? -1 : at === "teach" ? 1 : 0;
  const title = secure.length === SYLLABUS.length ? "Every topic on the path is secure"
    : secure.length ? `${COUNT[secure.length]} of ${SYLLABUS.length} topics secure`
    : "Linear equations, from the first step";
  return (<>
    <Top s={s} />
    {cont ? <Hero s={s} cont={cont} focused={at === "continue"} /> : <><h1 className="mb-title" data-role="maths-title"><Amber text={title} /></h1><BlankHero s={s} /></>}
    <div className={`mb-doors${cont ? "" : " wide"}`} data-dim={at !== "continue" || undefined}>
      {DOORS.map((d) => (
        <div key={d.id} className="mb-door" data-focused={at === d.id} data-role={!cont && d.id === "homework" ? "maths-primary" : "maths-secondary"} data-waiting={(d.id === "homework" && s.awaiting === "maths") || undefined}>
          <div className="art"><DoorArt id={d.id} /></div>
          <div className="txt"><div className="mb-kick">{d.id === "homework" && s.awaiting === "maths" ? "Waiting for the photo" : d.k}</div><div className="dt">{d.t}</div></div>
        </div>
      ))}
    </div>
    <Caption text={cont && at === "continue" ? cont.cap : doorCaption(s, Math.max(0, door))} />
    <Ruler s={s} />
  </>);
}

// ---------------------------------------------------------------- M1 Topics: the ruler, larger, each topic a stop

const PREP = [
  "Writing six questions on this topic…",
  "Choosing numbers that are worth the working…",
  "Checking every one comes out clean…",
  "Still writing. They will appear here — nothing to press.",
];
export function Topics({ s, focus, busy: asked }: { s: Session; focus: number; busy: boolean }) {
  const st = topicStates(s);
  const busy = asked || running(s, "practice");
  const at = (busy && s.topic ? TOPIC_STOPS.find((t) => t.id === s.topic) : undefined) ?? stopAt(TOPIC_STOPS, focus)!;
  const ix = TOPIC_STOPS.indexOf(at);
  const failed = busy ? null : practiceFailed(s, at.id);
  const before = at.prereq.map((p) => topicById(p)).find((t) => t && st[t.id] !== "secure");
  const [step, setStep] = useState(0);
  useEffect(() => { if (!busy) { setStep(0); return; } const t = setInterval(() => setStep((x) => Math.min(PREP.length - 1, x + 1)), 2600); return () => clearInterval(t); }, [busy]);
  return (<>
    <Top s={s} crumb="Teach me something" />
    <h1 className="mb-title" data-role="maths-title"><Amber text="Pick a topic" /></h1>
    <div className="mb-lede" key={busy ? "busy" + step : failed ? "failed" : at.id}>
      {busy ? <><div className="mb-kick">{KIND_ICON.six}Preparing · {at.name}</div><p>{PREP[step]}</p></>
        : failed ? <><div className="mb-kick">Not written</div><p>{failed}</p></>
        : <><div className="mb-kick">{at.strand} · six questions a set</div><p>{at.blurb}{before ? ` Most people do ${before.name} first.` : ""}</p></>}
    </div>
    <Ruler s={s} big focus={ix} busy={busy} />
  </>);
}

// ---------------------------------------------------------------- M2 Practice: six questions on the paper

function humanTopic(id: string): string { const w = id.replace(/[-_]+/g, " ").trim(); return w.charAt(0).toUpperCase() + w.slice(1); }

export function PracticeScreen({ s }: { s: Session }) {
  const p = s.practice;
  if (!p) return <><Top s={s} /><h1 className="mb-title" data-role="maths-title"><Amber text="No set on the desk" /></h1></>;
  const name = topicById(p.topic)?.name ?? humanTopic(p.topic);
  return (<>
    <Top s={s} crumb={name} />
    <div className="mb-practice">
      <div className="mb-paper" data-role="maths-sheet">
        <header className="mb-sheethead"><span className="st">{name}</span><span className="who">{s.learner.name}</span></header>
        {p.items.map((it) => (
          <section key={it.n} className="mb-item"><div className="num">{it.n}</div><PrintRow text={it.question} /></section>
        ))}
      </div>
    </div>
    <aside className="mb-side">
      <div className="mb-khead"><div className="mb-kick">{KIND_ICON.six}{p.items.length} questions</div></div>
      <div className="mb-stitle" data-role="maths-title">Work these on <em>paper</em></div>
      <div className="mb-card" data-role="maths-hint">
        <div className="hl"><span className="mb-lab">What to do</span></div>
        <div className="ht">Work all six on paper, then snap the whole sheet with the phone. The desk marks it and walks you through it here.</div>
        <div className="nx">{ARROW}<span>{s.joined ? "The phone is waiting for the sheet." : `Pair the phone first · PIN ${s.pin}`}</span></div>
      </div>
    </aside>
  </>);
}

// ---------------------------------------------------------------- M3 Sheet and M4 Walk: the marked set on the paper

/** A slip's name as the rulebook keeps it (lib/rules/maths.ts), set in Fraunces. An id the rulebook does not know is spelled out. */
const slipName = (id: string) => slipById(id)?.name ?? humanTopic(id);

const TALLY_R = <svg viewBox="0 0 58 62" aria-hidden="true"><path d="M36 40 L42 47 L56 28" /></svg>;
const TALLY_W = <svg viewBox="0 0 58 62" aria-hidden="true"><path d="M18 20 C 22 10, 42 10, 46 22 C 50 36, 40 52, 28 50 C 16 49, 11 38, 13 26 C 14 22, 17 19, 22 17" /></svg>;
/** The set as six numbers in the top bar: ticked, ringed, or dashed when the desk is not sure; the one in hand lit. */
function Tally({ items, cur }: { items: PracticeItem[]; cur: number | null }) {
  return (
    <div className="mb-tally" aria-label="the set">
      {items.map((it, i) => { const v = it.verdict ?? "unsure"; return (
        <div key={it.n} className="mb-tm" data-v={v} data-cur={i === cur || undefined}>{v === "right" ? TALLY_R : TALLY_W}<span>{it.n}</span></div>
      ); })}
    </div>
  );
}

/** The side of the paper: the kind of mark, the slip's name, and the taped card - the screen's one caption slot. */
function SlipSide({ it, points }: { it: PracticeItem; points?: string }) {
  const v = it.verdict ?? "unsure", w = working(it);
  const kind = v === "right" ? "right" : v === "unsure" ? "unsure" : w.mark?.kind ?? "line";
  const word = v === "right" ? "Right" : v === "unsure" ? "Not sure" : KIND_WORD[kind as keyof typeof KIND_WORD];
  const said = it.reply ?? it.said ?? (v === "right" ? `Number ${it.n} is right.` : "The desk has no comment on this one.");
  const next = v === "wrong" ? lookAt(it, points) : v === "unsure" ? "Tell the desk on the phone how you got there." : null;
  return (
    <aside className="mb-side" key={`${it.n}-${v}`}>
      <div className="mb-khead"><div className="mb-kick">{KIND_ICON[kind]}{word}</div></div>
      <div className="mb-stitle" data-role="maths-slip">
        <Amber text={v === "right" ? `Number ${it.n} came back right` : v === "unsure" ? "The desk is not sure" : it.slip ? slipName(it.slip) : `Number ${it.n} needs another look`} />
      </div>
      <div className="mb-card" data-role="maths-hint">
        <div className="hl"><span className="mb-lab">{it.reply ? "The desk replied" : "The desk says"}</span></div>
        <div className="ht" data-role="maths-said">{prose(said)}</div>
        {next && <div className="nx">{ARROW}<span>{prose(next)}</span></div>}
      </div>
    </aside>
  );
}

/** An item on the marked paper. Open: the question and every line of working; folded: the question, and the line the pen is on. */
function MarkedItem({ it, open, focused, cur, dim, okLabel }: { it: PracticeItem; open: boolean; focused?: boolean; cur?: boolean; dim?: boolean; okLabel?: string }) {
  const v = it.verdict ?? "unsure";
  const w = working(it);
  const rows: ReactNode[] = [];
  if (v === "right") {
    if (open) w.lines.forEach((l, k) => rows.push(<HandRow key={k} line={l} tick={w.ticks[k]} />));
  } else if (!w.lines.length) {
    rows.push(<div key="none" className="mb-row w"><span className="rin"><span className="mx hand" data-role="maths-hand"><span className="mt">nothing on the line</span></span><span className="lookword">{v === "wrong" ? "look again" : "not sure"}</span></span></div>);
  } else if (open) {
    w.lines.forEach((l, k) => rows.push(<HandRow key={k} line={l} mark={k === w.at ? w.mark : null} tick={w.ticks[k]} after={w.at !== null && k > w.at} arrow={k === w.at} />));
  } else {
    const k = w.at ?? w.lines.length - 1;
    rows.push(
      <div key="pen" className="mb-row w" data-tall={isTall(parseMath(w.lines[k]))}>
        {w.at !== null && <MarginArrow />}
        <span className="rin"><MathText text={w.lines[k]} voice="hand" mark={k === w.at ? w.mark : null} />{v === "unsure" && <span className="lookword">not sure</span>}</span>
      </div>,
    );
  }
  return (
    <section className="mb-item" data-v={v} data-open={open || undefined} data-focused={focused || undefined} data-cur={cur || undefined} data-dim={dim || undefined}>
      <div className="num">{it.n}{v !== "right" && <NumRing />}</div>
      <PrintRow text={it.question} tick={v === "right" && !open} />
      {rows}
      {focused && okLabel && <div className="ok"><b>OK</b><span className="mb-lab">{okLabel}</span></div>}
    </section>
  );
}

const HOW_MANY = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/**
 * M3 · the marked set on the paper: every item folded to its question and the line the desk's pen is on,
 * right ones ticked. Left/Right walk the items (the paper slides under the lamp), Down reaches the two actions.
 */
export function Sheet({ s, focus }: { s: Session; focus: number }) {
  const p = s.practice;
  const tiles = p?.marked ? sheetTiles(p) : [];
  const at = p?.marked ? stopAt(sheetStops(p), focus) : undefined, ix = tileOf(at);
  const pan = usePaper(`${ix}|${p?.items.length}`);
  if (!p || !p.marked) return <><Top s={s} /><h1 className="mb-title" data-role="maths-title"><Amber text="No marked set on the desk" /></h1></>;
  const name = topicById(p.topic)?.name ?? humanTopic(p.topic);
  const right = tiles.filter((x) => x.verdict === "right").length, look = tiles.length - right;
  const tile = ix === null ? undefined : tiles[ix];
  const curIx = ix ?? Math.min(tiles.length - 1, Math.max(0, p.items.findIndex((x) => x.verdict !== "right")));
  return (<>
    <Top s={s} crumb={name} right={<div className="mb-status"><Tally items={p.items} cur={ix} /><Chips s={s} phone={false} clock={false} /></div>} />
    <div className="mb-win">
      <div className="mb-pan" ref={pan}>
        <div className="mb-paper" data-role="maths-sheet">
          <header className="mb-sheethead"><span className="st" data-role="maths-title">{look ? `${HOW_MANY[look] ?? look} to look at` : `All ${HOW_MANY[tiles.length]?.toLowerCase() ?? tiles.length} right`}</span><span className="who">{s.learner.name}</span></header>
          {p.items.map((it, i) => <MarkedItem key={it.n} it={it} open={false} focused={ix === i} cur={i === curIx} okLabel="Open" />)}
        </div>
      </div>
    </div>
    {tile && ix !== null ? <SlipSide it={p.items[ix]} points={p.items[ix].slip ? slipById(p.items[ix].slip!)?.points : undefined} /> : (
      <aside className="mb-side" key={String(at)}>
        <div className="mb-khead"><div className="mb-kick">{at === "more" ? <>{KIND_ICON.six}Six more</> : <>Put away</>}</div></div>
        <div className="mb-stitle" data-role="maths-slip"><Amber text={at === "more" ? `Six more on ${name}` : "The set leaves the desk"} /></div>
        <div className="mb-card" data-role="maths-hint">
          <div className="ht" data-role="maths-said">{at === "more" ? `Six new questions on ${name}, aimed at the slips the desk has seen. Work them on paper, like this set.` : "The set leaves the desk. What it showed is already in your record."}</div>
        </div>
      </aside>
    )}
    <div className="mb-acts">
      <Act icon={ICON.six} label="Six more" focused={at === "more"} primary />
      <Act icon={ICON.away} label="Put the sheet away" focused={at === "away"} />
      <div className="mb-updn"><span>{right} right · {look} to look at</span></div>
    </div>
  </>);
}

/**
 * M4 · one marked item, open under the lamp: the question as printed, every line of the learner's working in
 * their hand, a tick on each line the marking vouches for, the desk's pen inside the line it is about, the lines
 * after it faded. Left/Right walk the set; Back (or Select on the last item) returns to the sheet at this item.
 */
export function Walk({ s, focus }: { s: Session; focus: number }) {
  const p = s.practice;
  const pan = usePaper(`${s.walkIx}|${p?.items.length}`);
  const it = p?.items[s.walkIx];
  if (!p || !it) return <><Top s={s} /><h1 className="mb-title" data-role="maths-title"><Amber text="Nothing to walk" /></h1></>;
  const name = topicById(p.topic)?.name ?? humanTopic(p.topic);
  const last = s.walkIx === p.items.length - 1;
  const sl = it.slip ? slipById(it.slip) : undefined;
  return (<>
    <Top s={s} crumb={name} right={<div className="mb-status"><Tally items={p.items} cur={s.walkIx} /><Chips s={s} phone={false} clock={false} /></div>} />
    <div className="mb-win">
      <div className="mb-pan" ref={pan}>
        <div className="mb-paper" data-role="maths-sheet">
          <header className="mb-sheethead"><span className="st" data-role="maths-title">{name}</span><span className="who">{s.learner.name}</span></header>
          {p.items.map((x, i) => <MarkedItem key={x.n} it={x} open={i === s.walkIx} focused={i === s.walkIx && !last} cur={i === s.walkIx} dim={i !== s.walkIx} />)}
        </div>
      </div>
    </div>
    <SlipSide it={it} points={sl?.points} />
    <div className="mb-acts">
      {last && <Act icon={ICON.back} label="Back to the sheet" focused={stopAt(walkStops(s), focus) === "sheet"} primary />}
      <div className="mb-updn"><Chev dir="l" on={s.walkIx > 0} /><span>{it.n} of {p.items.length}</span><Chev dir="r" on={!last} /></div>
    </div>
  </>);
}

// ---------------------------------------------------------------- T3 Page: the snapped sheet, read, one problem lifted

export function PageScreen({ s }: { s: Session }) {
  const p = s.pages[s.pageIx];
  const it = p?.items[s.itemIx];
  const pan = usePaper(`${s.pageIx}|${s.itemIx}|${p?.items.length}|${s.view}`);
  if (!p) return <><Top s={s} /><h1 className="mb-title" data-role="maths-title"><Amber text="No page yet" /></h1></>;
  const read = s.jobs?.read?.key === p.id ? s.jobs.read : undefined, hj = it && s.jobs?.hint?.key === it.key ? s.jobs.hint : undefined;
  const line = s.reading ? "Reading the page… the problems appear here as they are read."
    : read?.phase === "failed" ? "The desk could not read this page. Snap it again on the phone."
    : hj?.phase === "running" ? "Thinking about a hint for this one…"
    : hj?.phase === "failed" ? "No hint that time. Select to try again."
    : it ? `Number ${it.n} is under the lamp. Select for a hint — the next step, never the answer.` : "Nothing on this page could be read as a problem.";
  const band = (scale: number) => it ? { top: it.band[0] * scale, height: Math.max(8, (it.band[1] - it.band[0]) * scale) } : null;
  const menu = <div className="mb-status"><div className="mb-chip" data-role="maths-chip"><span className="mb-lab" style={{ marginLeft: 14 }}>Menu</span>{s.view === "band" ? "The photo" : "The problems"}</div><Chips s={s} learner={false} /></div>;
  if (s.view === "overview") {
    const H = 780, sc = H / p.h, b = band(sc);
    return (<>
      <Top s={s} crumb={p.title} right={menu} />
      <div className="mb-overview" key="overview"><div className="mb-frame" data-role="maths-sheet">
        <img src={p.img} alt={p.title} />
        {b && <div className="mb-band" data-focused="true" style={b} />}
      </div></div>
      <Caption text={line} top={950} />
    </>);
  }
  const photoW = 534, sc = photoW / p.w, b = band(sc), photoH = 300;
  const offset = b ? Math.max(0, Math.min(p.h * sc - photoH, b.top - photoH / 2 + b.height / 2)) : 0;
  return (<>
    <Top s={s} crumb={p.title} right={menu} />
    <div className="mb-win" key="band">
      <div className="mb-pan" ref={pan}>
        <div className="mb-paper" data-role="maths-sheet">
          <header className="mb-sheethead"><span className="st" data-role="maths-title">{p.title}</span><span className="who">{s.learner.name}</span></header>
          {s.reading && <div className="mb-reading" />}
          {p.items.map((x, i) => (
            <section key={x.key} className="mb-item" data-focused={(i === s.itemIx && !s.reading) || undefined} data-cur={i === s.itemIx || undefined}>
              <div className="num">{x.n}</div>
              <PrintRow text={x.text} wrap />
              {i === s.itemIx && !s.reading && <div className="ok"><b>OK</b><span className="mb-lab">Hint</span></div>}
            </section>
          ))}
          {!p.items.length && <div className="mb-row"><span className="rin" style={{ marginLeft: 144 }}><span className="mx hand" data-role="maths-hand"><span className="mt">{s.reading ? "reading…" : "no problems read"}</span></span></span></div>}
        </div>
      </div>
    </div>
    <aside className="mb-side">
      <div className="mb-khead"><div className="mb-kick">The sheet you snapped</div></div>
      <div className="mb-stitle"><Amber text={it ? `Number ${it.n}` : p.title} /></div>
      <div className="mb-facts">
        <span><b>{p.items.length}</b> problems</span>
        <span>{p.readMs ? <>read in <b>{Math.max(1, Math.round(p.readMs / 1000))} s</b></> : read?.phase === "failed" ? "not read" : "reading"}</span>
        {s.pages.length > 1 && <span>page <b>{s.pageIx + 1}</b> of {s.pages.length}</span>}
      </div>
      <div className="mb-photo" style={{ position: "relative", left: 0, top: 0, marginTop: 30 }}>
        <img src={p.img} alt="" style={{ top: -offset }} />
        {b && <div className="mb-band" style={{ top: b.top - offset, height: b.height }} />}
        <span className="mb-lab">The photo</span>
      </div>
      <p className="mb-cap" key={line} style={{ position: "static", width: "auto", minHeight: 0, marginTop: 26, fontSize: 32 }}>{line}</p>
    </aside>
  </>);
}

// ---------------------------------------------------------------- T4 Hint: the problem under the lamp, the taped card

export function HintScreen({ s, focus }: { s: Session; focus: number }) {
  const h = s.hint;
  if (!h) return <><Top s={s} /><h1 className="mb-title" data-role="maths-title"><Amber text="No hint yet" /></h1></>;
  const hh = h.stage === 2 ? h.hint2 : h.hint1;
  const p = s.pages[s.pageIx], n = p?.items[s.itemIx]?.n;
  const at = stopAt(HINT_STOPS, focus);
  const pick = s.jobs?.lesson?.key === h.key ? s.jobs.lesson : undefined;
  const pickFailed = pick?.phase === "failed" ? pick.error ?? "" : null;
  const noLesson = s.noLesson ? (pickFailed ? `${pickFailed} The hint is all there is this time.` : "No lesson in tonight’s library covers this one. The hint is all there is — and that is fine.") : null;
  return (<>
    <Top s={s} crumb={n !== undefined ? `Number ${n}` : p?.title} right={<Chips s={s} learner={false} />} />
    <div className="mb-hint-paper">
      <div className="mb-paper" data-role="maths-sheet">
        <header className="mb-sheethead"><span className="st">{p?.title ?? ""}</span><span className="who">{s.learner.name}</span></header>
        <section className="mb-item" data-v="wrong" data-cur="true">
          {n !== undefined && <div className="num" style={{ height: 144 }}>{n}<NumRing /></div>}
          <PrintRow text={h.problem} wrap />
        </section>
        {[0, 1, 2].map((k) => <div key={k} className="blank">{k === 0 && <span className="mb-lab">On your paper</span>}</div>)}
      </div>
    </div>
    <aside className="mb-side" key={`${h.key}-${h.stage}`}>
      <div className="mb-khead"><div className="mb-kick">{KIND_ICON.unsure}Hint {h.stage} of 2</div></div>
      <div className="mb-stitle" data-role="maths-title"><Amber text={h.stage === 2 ? "One step further" : "A first look"} /></div>
      <div className="mb-card" data-role="maths-hint">
        {h.askedQ && <div className="said">{PHONE_SMALL}<span data-role="maths-said">“{h.askedQ}”</span></div>}
        <div className="hl"><span className="mb-lab">Hint</span><span className="pips"><i className="on" /><i className={h.stage === 2 ? "on" : undefined} /></span></div>
        <div className="ht">{hh ? prose(hh.hint) : "…"}</div>
        {hh?.next && <div className="nx">{ARROW}<span>{prose(hh.next)}</span></div>}
        {noLesson && <div className="quiet">{noLesson}</div>}
      </div>
    </aside>
    <div className="mb-acts">
      <Act icon={ICON.hint} label={h.stage === 2 ? "That’s both hints" : "Still stuck"} focused={at === "stuck"} primary pips={[h.stage, 2]} disabled={h.stage === 2} />
      <Act icon={ICON.lesson} label={s.lesson ? "Show me the lesson" : pickFailed !== null ? "No lesson this time" : s.noLesson ? "No lesson for this" : "Finding the lesson…"} focused={at === "lesson"} disabled={!s.lesson} />
    </div>
  </>);
}

// ---------------------------------------------------------------- T5 Lesson: the lamp-lit frame

export function LessonScreen({ s }: { s: Session }) {
  const l = s.lesson;
  if (!l) return <><Top s={s} /><h1 className="mb-title" data-role="maths-title"><Amber text="No lesson open" /></h1></>;
  const src = l.youtube ? `https://www.youtube-nocookie.com/embed/${l.youtube}?start=${l.t}&autoplay=1&rel=0&modestbranding=1` : null;
  const concepts = l.text.split(" · ").map((x) => x.trim()).filter(Boolean).slice(0, 6);
  return (<>
    <Top s={s} crumb="The lesson" right={<Chips s={s} learner={false} phone={false} />} />
    <div className="mb-screen" data-role="maths-sheet">
      {src ? <iframe src={src} width={1120} height={630} allow="autoplay; encrypted-media" title={l.title} />
        : <div className="none">This unit has no video yet — its theory screen is the lesson.</div>}
    </div>
    <div className="mb-paused">{s.lessonPaused ? PAUSE : PLAY}<span>{s.lessonPaused ? "Paused — circle on the phone to ask about this frame" : "Playing · Space pauses · Back returns"}</span></div>
    <aside className="mb-lesson-side">
      <div className="mb-kick">The part that matters · {fmt(l.t)}</div>
      <div className="mb-stitle" data-role="maths-title"><Amber text={l.title} /></div>
      {concepts.length > 0 && <div className="mb-chips">{concepts.map((c) => <span key={c}>{c}</span>)}</div>}
      <p className="mb-cap" style={{ position: "static", width: "auto", minHeight: 0, marginTop: 28, fontSize: 32 }}>{prose(l.why)}</p>
    </aside>
  </>);
}

// ---------------------------------------------------------------- T2 Units and T2m Calendar: a contents page, a planner

export function Units({ s, focus }: { s: Session; focus: number }) {
  const list = unitStops(s);
  const next = list.find((l) => !l.done);
  const cur = stopAt(list, focus);
  const pan = usePaper(focus);
  return (<>
    <Top s={s} crumb="Units" />
    <div className="mb-win" style={{ top: 146, height: 880 }}>
      <div className="mb-pan" ref={pan}>
        <div className="mb-paper" data-role="maths-sheet">
          <header className="mb-sheethead"><span className="st" data-role="maths-title">Tonight’s units</span><span className="who">{s.learner.name}</span></header>
          {list.map((l) => (
            <div key={l.id} className="mb-unit" data-focused={l === cur || undefined} data-cur={l === cur || undefined}>
              <span className="u">{l.unit}</span>
              <span className="t">{l.title}</span>
              <span className="m">{l.done ? <Tick /> : l.id === next?.id ? <span className="next">Next</span> : null}{l.minutes} min</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <aside className="mb-side" key={cur?.id}>
      <div className="mb-khead"><div className="mb-kick">From unit {cur?.unit}</div></div>
      <div className="mb-stitle"><Amber text={cur?.title ?? ""} /></div>
      {cur && <div className="mb-chips">{cur.concepts.map((c) => <span key={c}>{c}</span>)}</div>}
      <p className="mb-cap" style={{ position: "static", width: "auto", minHeight: 0, marginTop: 28, fontSize: 32 }}>Select plays it. Menu opens the calendar.</p>
    </aside>
  </>);
}

export function Calendar({ s, focus }: { s: Session; focus: number }) {
  const list = calendarStops();
  const cur = stopAt(list, focus);
  const nextIx = list.findIndex((l) => !l.done);
  const weeks = [["Week 1", 0, 3], ["Week 2", 3, 6], ["Week 3", 6, 8]] as const;
  const tilt = [-0.8, 0.6, -0.4, 0.9, -0.6, 0.5, -0.9, 0.4];
  return (<>
    <Top s={s} crumb="Lessons on file" />
    <h1 className="mb-title" data-role="maths-title" style={{ top: 150 }}>Where you <em>are</em></h1>
    <div className="mb-planner" style={{ top: 280 }}>
      {weeks.map(([w, a, b]) => [
        <div key={w} className="wk">{w}</div>,
        ...list.slice(a, b).map((l, j) => {
          const i = a + j, state = l.done ? "done" : i === nextIx ? "next" : i > nextIx + 1 ? "locked" : "open";
          return (
            <div key={l.id} className="mb-cell" data-state={state} data-focused={l === cur || undefined} style={{ "--r": `${tilt[i % tilt.length]}deg` } as React.CSSProperties}>
              <div className="t">{l.title}</div>
              <div className="s">{state === "done" ? <><Tick />done</> : state === "next" ? "next up" : state === "locked" ? "later" : `${l.minutes} min`}</div>
            </div>
          );
        }),
        ...Array.from({ length: 3 - (b - a) }, (_, k) => <div key={w + k} />),
      ])}
    </div>
    <Caption text={`${list.filter((l) => l.done).length} of ${list.length} lessons done. Select opens the lesson; Back returns to the units.`} top={960} />
  </>);
}
