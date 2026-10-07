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
import type { Page, PracticeItem, Session } from "@/lib/session/store";
import { PATHS, expectedOn, learnerPath, topicIn, topicsOf } from "@/lib/library/paths";
import { LESSONS } from "@/lib/library/lessons.data";
import { lessonStates } from "@/lib/library/watched";
import { slip as slipById } from "@/lib/rules/maths";
import { PAD, STRIP_AFTER, fitName, flagOnStage, flagX, needleX, rulerFrontier, rulerModel, schoolMarks, stripFlag, stripModel } from "@/tv/rulerRows";
import { calendarWeeks, continueCard, explainLine, fitRow, humanTopic, inRunningText, markLine, mathPlaced, moreLine, noLessonsLine, paperSquare, pathSecure, rowSquares, secureTitle, sheetHead, stateWord, stretchSecure, topicName, topicStates, usualSeen, workWhat, SQUARE, type Continue, type JobLine } from "@/tv/mathsRows";
import { running, practiceFailed, stopAt, tonightStops, calendarStops, unitStops, walkStops, HINT_STOPS, TONIGHT_MENU, type TonightStop } from "@/tv/keys";
import { PREPARE_CHOICES, PREPARE_DOOR, SYS_WORD, choiceLine, prepareGroups, prepareModel } from "@/tv/prepareRows";
import { sheetTiles, sheetStops, tileOf, firstToLook, lookCount, secondLine } from "@/tv/sheetRows";
import { systemOf } from "@/tv/profileRows";
import { fmt } from "@/tv/useSession";
import { day } from "@/tv/screens";
import { MathsMark as Mark } from "@/tv/marks";
import { MATHS_FONTS } from "./fonts";
import { MathText, Tick } from "./MathText";
import { prose } from "./prose";
import { isTall, parseMath } from "./typeset";
import { KIND_WORD, lookAt, working } from "./working";

/**
 * The root every Math Buddy screen is drawn in. `busy` is the TV's own wait for a practice set; `ask` the lit cell of Get
 * ready for school's two-cell question (tv/keys Local `prepareAsk`: null while its list is walked).
 */
export function MathsTV({ s, busy, ask = null }: { s: Session; busy: boolean; ask?: 0 | 1 | null }) {
  const f = s.focus;
  const blank = s.screen === "tonight" && !continueCard(s);
  const lamp = ["sheet", "walk", "page", "hint", "practice", "units"].includes(s.screen) ? "paper" : blank ? "blank" : s.screen === "topics" || s.screen === "prepare" || s.screen === "calendar" ? "wide" : "desk";
  return (
    <div className={`maths-tv ${MATHS_FONTS}`} data-screen={s.screen} data-lamp={lamp}>
      <div className="mb-lamp" aria-hidden="true"><i /></div>
      {s.screen === "tonight" ? <Tonight s={s} focus={f} />
        : s.screen === "topics" ? <Topics s={s} focus={f} busy={busy} />
        : s.screen === "prepare" ? <Prepare s={s} focus={f} busy={busy} ask={ask} />
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
function Chips({ s, clock = true, phone = true, learner = true, menu }: { s: Session; clock?: boolean; phone?: boolean; learner?: boolean; menu?: string }) {
  const run = s.timer.running;
  return (
    <div className="mb-status">
      {menu && <div className="mb-glyph" data-role="maths-menu">{ICON.lesson}<span className="mb-lab">Menu</span><span className="to">{menu}</span></div>}
      {learner && <div className="mb-chip" data-role="maths-chip"><span className="av">{s.learner?.name.charAt(0)}</span>{s.learner?.name}</div>}
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
/** A job's state on a taped card, in the desk's voice (tv/mathsRows.ts `markLine`, `explainLine`). Status, never a stop. */
function JobNote({ job }: { job: JobLine }) {
  return <div className="mb-job" data-role="maths-job" data-phase={job.phase}>{job.text}</div>;
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

// ---------------------------------------------------------------- the paper: rows that pan under the lamp

/** How far the desk's pen can reach past a line's last glyph (a ring round a sign, a strike), kept inside the paper. */
const PEN_PAD = 16;
/**
 * Slides the paper so the item in hand sits under the lamp (the winner's pan), fits each line to the paper (a
 * long line of working or a long printed question shrinks to its room, never under the 28 px floor, and wraps only
 * when even the floor is too wide - so the pen's gap box and the tick stay on the paper), and hangs a continued
 * line's "=" under the "=" above it, as a careful student aligns working. Measured after layout and again when the
 * faces arrive, in stage pixels (the stage is scaled as a whole). The pen's marks are set in em inside the line, so
 * they scale with it. In the same pass each row takes whole squares: a line taller than its two (or three) squares
 * gets the next whole number of them (tv/mathsRows.ts `rowSquares`). With a `room` (the Practice sheet, which has
 * nothing to pan to) the paper is not panned but fitted: when its rows run past the room it is drawn on smaller
 * squares (`paperSquare`) until all of it is on screen.
 */
function usePaper(dep: unknown, room?: number) {
  const pan = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = pan.current; if (!el) return;
    const lay = () => {
      const paper = el.querySelector<HTMLElement>(".mb-paper"); if (!paper) return;
      paper.style.removeProperty("--mb-sq");
      let rows = fitRows(paper);
      if (room !== undefined && paper.offsetHeight > room) {
        const sq = SQUARE, used = rows.reduce((n, r) => n + r.px, 0);
        const sq2 = paperSquare(rows, Math.round((paper.offsetHeight - used) / sq), room);
        if (sq2 !== sq) { paper.style.setProperty("--mb-sq", `${sq2}px`); rows = fitRows(paper); }
      }
      if (room !== undefined) { el.style.transform = ""; return; }
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
  }, [dep, room]);
  return pan;
}

/**
 * Every line on the paper fitted to it (tv/mathsRows.ts `fitRow`), "=" under "=", and each row a whole number of
 * squares (`rowSquares`). Returns each row's measured height, its minimum squares and the px it now takes.
 */
function fitRows(paper: HTMLElement): Array<{ h: number; min: number; px: number }> {
  const out: Array<{ h: number; min: number; px: number }> = [];
  paper.querySelectorAll<HTMLElement>(".mb-item").forEach((item) => {
    let anchor: number | null = null;
    item.querySelectorAll<HTMLElement>(".mb-row").forEach((row) => {
      const rin = row.querySelector<HTMLElement>(":scope > .rin"); if (!rin) return;
      const hand = row.classList.contains("w");
      if (hand) rin.style.marginLeft = "0px";
      rin.style.fontSize = ""; delete row.dataset.fit; row.style.height = "";
      const mx = rin.querySelector<HTMLElement>(".mx");
      const k = rin.getBoundingClientRect().width / Math.max(1, rin.offsetWidth) || 1;
      const first = mx?.firstElementChild as HTMLElement | null | undefined, eq = mx?.querySelector<HTMLElement>(".mo.eq");
      const x = (e: HTMLElement) => (e.getBoundingClientRect().left - rin.getBoundingClientRect().left) / k;
      const continued = hand && anchor !== null && !!first?.classList.contains("eq");
      const hang = () => (continued && first ? Math.max(0, anchor! - x(first)) : 0);
      // the room: the row's width inside its padding, less the hang and the pen's overhang past the last glyph
      const cs = getComputedStyle(row);
      const inner = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - PEN_PAD;
      const base = parseFloat(getComputedStyle(rin).fontSize);
      const widthAt = (px: number) => { rin.style.fontSize = px === base ? "" : `${px}px`; return rin.scrollWidth; };
      let margin = hang(), fit = fitRow(base, inner - margin, widthAt);
      // the alignment gives way before a line has to wrap
      if (fit.wrap && margin) { margin = 0; fit = fitRow(base, inner, widthAt); }
      rin.style.fontSize = fit.size === base ? "" : `${fit.size}px`;
      if (fit.wrap) row.dataset.fit = "wrap";
      if (margin) rin.style.marginLeft = `${hang()}px`;
      if (hand && mx && !continued) anchor = eq ? x(eq) : null;
      // whole squares: a wrapped row by its own height, a one-line row by its maths
      const sq = parseFloat(cs.getPropertyValue("--mb-sq")) || SQUARE;
      const wrapped = fit.wrap || row.classList.contains("wrap");
      const min = row.dataset.tall === "true" ? 3 : 2;
      const h = wrapped ? row.offsetHeight : (mx ?? rin).offsetHeight;
      const n = rowSquares(h, sq, min);
      if (wrapped || n > min) row.style.height = `${n * sq}px`;
      out.push({ h, min, px: row.offsetHeight });
    });
  });
  return out;
}

/** The ring every teacher draws round an item number. */
const NumRing = ({ again }: { again?: boolean }) => <svg className={again ? "nr n2" : "nr"} viewBox="0 0 64 62" aria-hidden="true"><path d="M14 16 C 22 4, 48 4, 55 18 C 62 34, 50 54, 32 55 C 14 56, 4 42, 8 26 C 10 20, 14 16, 22 13" /></svg>;
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

/**
 * The path as a boxwood ruler: secure topics inked solid, one in progress hatched as far as the estimate, an
 * unseen one a dashed groove, slips as pencil scratches. The learner's needle stands at the frontier (rulerRows
 * `rulerFrontier`: on a school path the first topic not secure after the last secure one); the SCHOOL tick stands
 * where the learner's school system would normally have them, and only when the profile has an age and a school type
 * to read it from - no invented comparison. The gap line between the two waits for a Math placement (`schoolMarks`,
 * owner decision D2), and Phase 1 has none, so it is not drawn. On Topics the topics are the stops. Where
 * everything goes is tv/rulerRows.ts `rulerModel`: one box per topic across the ruler, or - on Topics, for a path
 * too long for that (Calculus 1) - a track wider than the stage that pans under the lamp like the paper, the
 * focused topic wide enough for its whole name, strand labels clamped to their strands, a chevron at each edge
 * that has more to show.
 */
function Ruler({ s, big, focus, busy }: { s: Session; big?: boolean; focus?: number; busy?: boolean }) {
  const me = s.profiles.find((p) => p.id === s.learner?.id);
  const sys = systemOf(me);
  const skills = s.skills ?? {};
  const path = learnerPath(s), topics = topicsOf(path);
  const st = topicStates(s);
  const m = rulerModel(topics, st, focus, big);
  const N = topics.length;
  // a usual record with nothing seen (made by a step-up attempt, Family W8) is drawn as no record
  const has = topics.some((t) => usualSeen(s, t.id));
  const up = stretchSecure(s);
  const frontier = rulerFrontier(topics, (id) => !!skills[id]?.secure, PATHS[path].school);
  const fsk = skills[topics[frontier].id];
  const mx = !has ? PAD : needleX(m, frontier, fsk ? (fsk.secure ? 1 : Math.max(0, Math.min(1, fsk.estimate))) : 0);
  const age = me && me.type !== "other" ? me.age : undefined;
  // a course path has no school year to be behind or ahead of: no SCHOOL tick, no gap line (expectedOn is null); on a
  // school path the tick is drawn and the gap line waits for a Math placement (D2), which Phase 1 does not have
  const exp = age === undefined ? null : expectedOn(path, sys, age);
  const marks = schoolMarks(exp, mathPlaced(s));
  const fx0 = exp === null || !marks.tick ? null : flagX(m, exp);
  // on a panning ruler (the school path since W7: seven topics, fifteen since batch 3) the tick is drawn only while it is on the stage, and its pill is
  // turned inward near the window's edges, so it is never cut in half by the window (tv/rulerRows flagOnStage)
  const onStage = fx0 === null ? null : flagOnStage(m, fx0);
  const fx = onStage === null || !onStage.seen ? null : fx0;
  const clampStrands = m.strands.length > 1;
  // the focused name is fitted whole on the big ruler, panning or not (the school path pans since W7)
  const win = useNameFit(m.pan || !!big, `${path}|${focus}`);
  const body = (<>
    <div className="mb-rbody" />
    <div className="mb-major start" style={{ left: PAD - 2 }} />
    {m.topics.map((t, i) => i > 0 && <div key={"m" + t.id} className="mb-major" style={{ left: t.sx - 1.5 }} />)}
    <div className="mb-major" style={{ left: m.end - 1.5 }} />
    {/* keyed by place: a strand may appear twice on a path (Equations), as on the strip */}
    {m.strands.map((g, i) => <div key={`s${i}`} className="mb-strand" style={clampStrands ? { left: g.labelX, maxWidth: g.labelW } : { left: g.labelX }}>{g.label}</div>)}
    {topics.map((t, i) => {
      const sk = skills[t.id], box = m.topics[i];
      const state = sk?.secure ? "secure" : usualSeen(s, t.id) ? "prog" : "unseen";
      // the NEWEST four live slips: a slip the child stops making is rubbed out (rules/slips), and the fifth is never hidden behind four old ones
      const slips = (sk?.slips ?? []).slice(-4);
      return (
        <div key={t.id} className="mb-topic" data-s={state} data-focused={focus === i || undefined} data-busy={(busy && focus === i) || undefined} style={{ left: box.x, width: box.w }}>
          <div className="mb-groove">{state !== "unseen" && <div className="fill" style={state === "prog" ? { width: `${Math.max(8, Math.min(100, (sk?.estimate ?? 0) * 100))}%` } : undefined} />}</div>
          {/* the step-up picture (Family W8): a second, thinner ink line under the groove once the step-up record latches */}
          {up.has(t.id) && <div className="mb-ink2" data-role="maths-stretch" />}
          {slips.length > 0 && <div className="mb-slips" data-slips={slips.join(" ")} aria-label={`${slips.length} slips seen`}>{slips.map((x) => <span key={x}>{SLIP_MARK}</span>)}</div>}
          {/* on a panning ruler the name is laid out at its box's final width at once, so the fit never measures a box mid-slide */}
          <div className="mb-tl" style={m.pan ? { right: "auto", width: box.w - 24 } : undefined}><div className="mb-tn">{t.name}</div>{t.year && <div className="mb-ty">{SYS_WORD[sys](t.year)}</div>}{big && <div className="mb-st">{stateWord(s, t.id, st)}</div>}</div>
        </div>
      );
    })}
    {fx !== null && marks.gap && <div className="mb-gapline" style={{ left: Math.min(mx, fx), width: Math.abs(fx - mx) }} />}
    {fx !== null && <div className="mb-flag" data-end={(exp !== null && exp >= N) || onStage?.edge === "r" || undefined} data-start={(exp !== null && exp <= 0) || onStage?.edge === "l" || undefined} style={{ left: fx }}><div className="nd" /><div className="mc">School</div></div>}
    <div className="mb-marker" data-start={!has || undefined} style={{ left: mx }}><div className="halo" /><div className="nd" /><div className="mc">{s.learner?.name}</div></div>
  </>);
  if (!m.pan) return <div className={`mb-ruler${big ? " big" : ""}`} ref={big ? win : undefined} data-role="maths-ruler" data-active={focus !== undefined || undefined}>{body}</div>;
  return (
    <div className="mb-ruler big" data-role="maths-ruler" data-active={focus !== undefined || undefined} data-pan="true">
      <div className="mb-rwin" ref={win} data-l={m.more.l || undefined} data-r={m.more.r || undefined}>
        <div className="mb-rtrack" style={{ width: m.trackWidth, transform: `translateX(${-m.offset}px)` }}>{body}</div>
      </div>
      {m.more.l && <div className="mb-rchev l" data-role="maths-more"><Chev dir="l" on /></div>}
      {m.more.r && <div className="mb-rchev r" data-role="maths-more"><Chev dir="r" on /></div>}
    </div>
  );
}

/**
 * On the big (Topics) ruler, the focused topic's name is shown whole: the largest of 44 down to 34 px (tv/rulerRows.ts
 * `fitName`) at which it is in the lines its box allows (three on a panning ruler, two on one that does not) with no
 * word clipped, measured after layout and again when the faces arrive. Tonight's small ruler keeps its names as the
 * stylesheet sets them (up to eight topics: a long name ends in an ellipsis there; the school path's fifteen are the strand strip since W7 batch 2). (Family W5b: the school
 * path's fourth topic narrowed its slots to 419 px, where "Equations with brackets and x on both sides" no longer fits
 * two lines at 44 px; since W7 the school Topics ruler pans, and the focused slot is 640 px.)
 */
function useNameFit(on: boolean, dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!on || !el) return;
    const fit = () => {
      el.querySelectorAll<HTMLElement>(".mb-tn").forEach((x) => x.style.removeProperty("font-size"));
      const tn = el.querySelector<HTMLElement>('.mb-topic[data-focused="true"] .mb-tn'); if (!tn) return;
      // a clamped line is a whole line more than shown; a glyph's ink past its line box is a pixel or two, not a line
      const px = fitName((size) => { tn.style.fontSize = `${size}px`; return tn.scrollHeight <= tn.clientHeight + size * 0.4 && tn.scrollWidth <= tn.clientWidth + 1; });
      tn.style.fontSize = `${px}px`;
    };
    fit();
    let live = true;
    document.fonts?.ready.then(() => { if (live) fit(); });
    return () => { live = false; };
  }, [on, dep]);
  return ref;
}

/**
 * Tonight's ruler for a long path (more than STRIP_AFTER topics): one bar per strand, as wide as its share of the
 * topics, filled by its share of latched-secure topics (`topicStates`), the learner's needle at the frontier - on a
 * course the first topic not secure whose prerequisites are, on a school path the first not secure after the last
 * secure one (tv/rulerRows.ts `stripModel`). No topic names and no school year per topic: the path's topics are on
 * Topics. A school path draws the SCHOOL tick here too (Family W7 batch 2: eleven school topics, fifteen since batch 3, make Tonight's ruler the
 * strip, and owner decision D2 keeps the tick on the child's TV), after the topics a learner of that age is normally
 * past (`stripFlag`, its pill turned inward at the ends); the gap line waits for a Math placement, as on the ruler.
 */
function Strip({ s }: { s: Session }) {
  const path = learnerPath(s);
  const up = stretchSecure(s);
  const m = stripModel(topicsOf(path), topicStates(s), PATHS[path].school, (id) => up.has(id));
  const me = s.profiles.find((p) => p.id === s.learner?.id);
  const age = me && me.type !== "other" ? me.age : undefined;
  const exp = age === undefined ? null : expectedOn(path, systemOf(me), age);
  const marks = schoolMarks(exp, mathPlaced(s));
  const flag = exp !== null && marks.tick ? stripFlag(m, exp) : null;
  return (
    <div className="mb-ruler strip" data-role="maths-ruler">
      <div className="mb-rbody" />
      <div className="mb-major start" style={{ left: PAD - 2 }} />
      {/* keyed by place: a strand may appear twice on a path (Equations) */}
      {m.segments.map((g, i) => i > 0 && <div key={`m${i}`} className="mb-major" style={{ left: g.x - 1.5 }} />)}
      <div className="mb-major" style={{ left: m.x0 + m.width - 1.5 }} />
      {m.segments.map((g, i) => (
        <div key={`s${i}`} className="mb-seg" data-s={g.secure === g.count ? "secure" : g.secure ? "prog" : "unseen"} style={{ left: g.x + 6, width: g.w - 12 }}>
          <div className="mb-groove">{g.secure > 0 && <div className="fill" style={{ width: `${g.share * 100}%` }} />}</div>
          {/* the strand's step-up line (Family W8): as long as its share of topics with a latched step-up, never a count */}
          {g.stretch > 0 && <div className="mb-ink2" data-role="maths-stretch" style={{ right: "auto", width: `calc((100% - 24px) * ${g.stretchShare})` }} />}
          <div className="mb-strand" style={{ maxWidth: g.labelW }}>{g.lines.map((l, k) => <span key={k} className="ln">{l}</span>)}</div>
        </div>
      ))}
      {flag && marks.gap && <div className="mb-gapline" style={{ left: Math.min(m.needle.x, flag.x), width: Math.abs(flag.x - m.needle.x) }} />}
      {flag && <div className="mb-flag" data-end={flag.edge === "r" || undefined} data-start={flag.edge === "l" || undefined} style={{ left: flag.x }}><div className="nd" /><div className="mc">School</div></div>}
      <div className="mb-marker" data-start={m.needle.at === "start" || undefined} data-end={m.needle.at === "end" || undefined} style={{ left: m.needle.x }}><div className="halo" /><div className="nd" /><div className="mc">{s.learner?.name}</div></div>
    </div>
  );
}

// ---------------------------------------------------------------- M0 Tonight: the sheet on the desk, two doors, the ruler

type Door = Exclude<TonightStop, "continue">;
const DOORS: Array<{ id: Door; k: string; t: string }> = [
  { id: "homework", k: "The sheet you were given", t: "I have homework" },
  { id: "teach", k: "No sheet needed", t: "Teach me something" },
  // Family W8: help in school before the lesson, for a learner on a school path (tv/keys tonightStops)
  { id: "prepare", k: "Before the lesson", t: "Get ready for school" },
];
function doorCaption(s: Session, door: Door): string {
  if (door === "teach") return "Pick a topic and the desk writes six questions to work on paper, then marks them from a photo.";
  if (door === "prepare") return PREPARE_DOOR;
  if (s.awaiting === "maths") return "Waiting for the Math Buddy page. Snap it on the phone — it appears here.";
  if (s.pages.some((p) => p.subject === "maths")) return "The sheet is already on the desk. Enter opens it, one problem at a time.";
  return "Snap the sheet on the phone and the desk reads it, one problem at a time — hints, never the answer.";
}

function DoorArt({ id }: { id: Door }) {
  // a school bag with a sheet peeking out: what goes to school tomorrow
  if (id === "prepare") return (
    <svg viewBox="0 0 230 210" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M92 44 v-14 a10 10 0 0 1 10 -10 h26 a10 10 0 0 1 10 10 v14" strokeWidth="4.5" />
      <g opacity=".55"><path d="M84 30 L150 22 L156 70 L90 76 Z" /><path d="M100 40 h36 M102 54 h26" strokeWidth="3.5" /></g>
      <rect x="54" y="44" width="122" height="152" rx="26" strokeWidth="4.5" />
      <rect x="60" y="50" width="110" height="140" rx="21" fill="currentColor" opacity=".08" stroke="none" />
      <path d="M54 96 h122" strokeWidth="3.5" opacity=".75" />
      <rect x="82" y="120" width="66" height="48" rx="10" strokeWidth="3.5" />
      <path d="M104 120 v-8 h22 v8" strokeWidth="3.5" />
    </svg>
  );
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
  const head = (ex: string) => <div className="mb-shead"><span className="ex">{ex}</span><span className="who">{s.learner?.name}</span></div>;
  if (cont.go === "sheet" && p) {
    const name = topicName(p.topic);
    const first = firstToLook(p.items);
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
      <div className="mb-sheet top"><div className="mb-tab" style={{ left: 40 }}>{cont.k}</div><div className="margin" />{head(topicName(p.topic))}
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
        <div className="mb-sheet top"><div className="margin" /><div className="mb-shead"><span className="ex">Start here</span><span className="who">{s.learner?.name}</span></div>
          <div className="mb-startdot" /><div className="mb-startline" /></div>
        <Pencil style={{ left: 330, top: 120, height: 260 }} />
      </div></div>
    </section>
  );
}

export function Tonight({ s, focus }: { s: Session; focus: number }) {
  const cont = continueCard(s);
  const at = stopAt(tonightStops(s), focus);
  // the topics on the learner's path that are secure (a record for a topic off the path is not one of "N of M")
  const { topics, secure, first } = pathSecure(s);
  const stops = tonightStops(s), doors = DOORS.filter((d) => stops.includes(d.id));
  const door: Door = at === "teach" || at === "prepare" ? at : "homework";
  const title = secureTitle(secure.length, topics.length, first);
  return (<>
    <Top s={s} right={<Chips s={s} menu={TONIGHT_MENU} />} />
    {cont ? <Hero s={s} cont={cont} focused={at === "continue"} /> : <><h1 className="mb-title" data-role="maths-title"><Amber text={title} /></h1><BlankHero s={s} /></>}
    <div className={`mb-doors${cont ? "" : " wide"}${doors.length > 2 ? " three" : ""}`} data-dim={at !== "continue" || undefined}>
      {doors.map((d) => (
        <div key={d.id} className="mb-door" data-focused={at === d.id} data-role={!cont && d.id === "homework" ? "maths-primary" : "maths-secondary"} data-waiting={(d.id === "homework" && s.awaiting === "maths") || undefined}>
          <div className="art"><DoorArt id={d.id} /></div>
          <div className="txt"><div className="mb-kick">{d.id === "homework" && s.awaiting === "maths" ? "Waiting for the photo" : d.k}</div><div className="dt">{d.t}</div></div>
        </div>
      ))}
    </div>
    <Caption text={cont && at === "continue" ? cont.cap : doorCaption(s, door)} />
    {topics.length > STRIP_AFTER ? <Strip s={s} /> : <Ruler s={s} />}
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
  // the stops are the learner's path, the same list the D-pad walks (tv/keys.ts topicStops(s))
  const stops = topicsOf(learnerPath(s));
  const busy = asked || running(s, "practice");
  const at = (busy && s.topic ? stops.find((t) => t.id === s.topic) : undefined) ?? stopAt(stops, focus)!;
  const ix = stops.indexOf(at);
  const failed = busy ? null : practiceFailed(s, at.id);
  const before = at.prereq.map((p) => topicIn(p)).find((t) => t && st[t.id] !== "secure");
  const [step, setStep] = useState(0);
  useEffect(() => { if (!busy) { setStep(0); return; } const t = setInterval(() => setStep((x) => Math.min(PREP.length - 1, x + 1)), 2600); return () => clearInterval(t); }, [busy]);
  return (<>
    <Top s={s} crumb="Teach me something" />
    <h1 className="mb-title" data-role="maths-title"><Amber text="Pick a topic" /></h1>
    <div className="mb-lede" key={busy ? "busy" + step : failed ? "failed" : at.id}>
      {busy ? <><div className="mb-kick">{KIND_ICON.six}Preparing · {at.name}</div><p>{PREP[step]}</p></>
        : failed ? <><div className="mb-kick">Not written</div><p>{failed}</p></>
        : <><div className="mb-kick">{at.strand} · six questions a set{stretchSecure(s).has(at.id) && <Stepped />}</div><p>{at.blurb}{before ? ` Most people do ${inRunningText(before.name)} first.` : ""}</p></>}
    </div>
    <Ruler s={s} big focus={ix} busy={busy} />
  </>);
}

/**
 * The focused topic's step-up, on its detail (Family W8): the groove's two lines drawn small - the ink and the sky line
 * under it - beside the words "A step up". A picture with a label, never a count.
 */
function Stepped() {
  return <span className="mb-stepped" data-role="maths-stretch"><svg viewBox="0 0 52 40" aria-hidden="true"><path className="a" d="M4 16 H48" /><path className="b" d="M4 28 H48" /></svg>A step up</span>;
}

// ---------------------------------------------------------------- W8 Get ready for school: units by strand, the usual or a step up

/**
 * Help in school, BEFORE the lesson (Family W8): the school units grouped by strand, each with the learner's own school-year
 * word (`SYS_WORD` for the unit's year in their system), and nothing else of the path - no ruler, no Secure word, no
 * needle, no SCHOOL tick. A scroller under the lamp like the Topics ruler (tv/prepareRows `prepareModel`); Select on a unit
 * asks "The usual" or "A step up" (`ask`, the lit cell) and writes the set through the same /api/practice route as Topics.
 */
export function Prepare({ s, focus, busy: asked, ask }: { s: Session; focus: number; busy: boolean; ask: 0 | 1 | null }) {
  const groups = prepareGroups(s);
  const stops = groups.flatMap((g) => g.units);
  const me = s.profiles.find((p) => p.id === s.learner?.id);
  const sys = systemOf(me);
  const busy = asked || running(s, "practice");
  const at = stopAt(stops, focus);
  const ix = at ? stops.indexOf(at) : 0;
  const m = prepareModel(groups, ix);
  const asking = ask === 0 || ask === 1;
  const failed = busy || !at ? null : practiceFailed(s, at.id);
  const [step, setStep] = useState(0);
  useEffect(() => { if (!busy) { setStep(0); return; } const t = setInterval(() => setStep((x) => Math.min(PREP.length - 1, x + 1)), 2600); return () => clearInterval(t); }, [busy]);
  if (!at) return <><Top s={s} crumb="Get ready for school" /><h1 className="mb-title" data-role="maths-title"><Amber text="Get ready for school" /></h1></>;
  return (<>
    <Top s={s} crumb="Get ready for school" />
    <h1 className="mb-title" data-role="maths-title"><Amber text="What is school doing?" /></h1>
    <div className="mb-lede mb-prep-lede" data-asking={asking || undefined} key={busy ? "busy" + step : asking ? `ask${ask}` : failed ? "failed" : at.id}>
      {asking ? <>
        <div className="mb-kick">{busy ? <>{KIND_ICON.six}Preparing · {at.name}</> : at.name}</div>
        <div className="mb-choice" data-role="maths-choice">
          {PREPARE_CHOICES.map((c, i) => (
            <div key={c.id} className="mb-cell2" data-id={c.id} data-focused={!busy && ask === i} data-dim={(busy && ask !== i) || undefined}>
              <span className="k">{c.k}</span><span className="t">{c.t}</span>
            </div>
          ))}
        </div>
        <p>{busy ? PREP[step] : failed ?? choiceLine(ask)}</p>
      </> : <>
        <div className="mb-kick">{at.strand} · six questions a set</div>
        <p>{at.blurb}</p>
      </>}
    </div>
    <div className="mb-prep" data-role="maths-prepare" data-asking={asking || undefined}>
      <div className="mb-pwin" data-l={m.more.l || undefined} data-r={m.more.r || undefined}>
        <div className="mb-ptrack" style={{ width: m.trackWidth, transform: `translateX(${-m.offset}px)` }}>
          {m.strands.map((g) => <div key={"g" + g.strand} className="mb-pstrand" style={{ left: g.x, width: g.w }}><span style={{ marginLeft: g.labelX - g.x }}>{g.strand}</span></div>)}
          {m.cards.map((c, i) => {
            const u = stops[i];
            return (
              <div key={c.id} className="mb-unit2" data-focused={(!asking && i === ix) || undefined} data-held={(asking && i === ix) || undefined} style={{ left: c.x, width: c.w }}>
                <div className="nm">{u.name}</div>
                {u.year && <div className="yr">{SYS_WORD[sys](u.year)}</div>}
              </div>
            );
          })}
        </div>
      </div>
      {m.more.l && <div className="mb-rchev l" data-role="maths-more"><Chev dir="l" on /></div>}
      {m.more.r && <div className="mb-rchev r" data-role="maths-more"><Chev dir="r" on /></div>}
    </div>
  </>);
}

// ---------------------------------------------------------------- M2 Practice: six questions on the paper

/**
 * The room the Practice sheet has, in stage px: from its top (design/maths-lamplight.css .mb-practice, 150) to the
 * safe line (1026), less 12 px for the paper's tilt. All six questions are on it at once - there is nothing to pan to.
 */
const PRACTICE_ROOM = 1026 - 150 - 12;

export function PracticeScreen({ s }: { s: Session }) {
  const p = s.practice;
  const pan = usePaper(p ? `${p.topic}|${p.items.map((it) => it.question).join("\n")}` : "", PRACTICE_ROOM);
  if (!p) return <><Top s={s} /><h1 className="mb-title" data-role="maths-title"><Amber text="No set on the desk" /></h1></>;
  const name = topicName(p.topic);
  const job = markLine(s);
  return (<>
    <Top s={s} crumb={name} />
    <div className="mb-practice" ref={pan}>
      <div className="mb-paper" data-role="maths-sheet">
        <header className="mb-sheethead"><span className="st">{name}</span><span className="who">{s.learner?.name}</span></header>
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
        <div className="ht">Work {workWhat(p.items.length)} on paper, then snap the whole sheet with the phone. The desk marks it and walks you through it here.</div>
        {job ? <JobNote job={job} /> : <div className="nx">{ARROW}<span>{s.joined ? "The phone is waiting for the sheet or your answers." : `Pair the phone first · PIN ${s.pin}`}</span></div>}
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
        <div key={it.n} className="mb-tm" data-v={v} data-second={it.second} data-cur={i === cur || undefined}>{v === "right" ? TALLY_R : TALLY_W}{it.second === "right" ? TALLY_R : it.second === "wrong" ? TALLY_W : null}<span>{it.n}</span></div>
      ); })}
    </div>
  );
}

/** The side of the paper: the kind of mark, the slip's name, and the taped card - the screen's one caption slot. */
function SlipSide({ it, points, job }: { it: PracticeItem; points?: string; job?: JobLine | null }) {
  const v = it.verdict ?? "unsure", w = working(it);
  const kind = v === "right" ? "right" : v === "unsure" ? "unsure" : w.mark?.kind ?? "line";
  const word = v === "right" ? "Right" : v === "unsure" ? "Not sure" : KIND_WORD[kind as keyof typeof KIND_WORD];
  const said = it.reply ?? it.said ?? (v === "right" ? `Number ${it.n} is right.` : "The desk has no comment on this one.");
  const next = v === "wrong" ? secondLine(it) ?? lookAt(it, points) : v === "unsure" ? "Tell the desk on the phone how you got there." : null;
  return (
    <aside className="mb-side" key={`${it.n}-${v}`}>
      <div className="mb-khead"><div className="mb-kick">{KIND_ICON[kind]}{word}</div></div>
      <div className="mb-stitle" data-role="maths-slip">
        <Amber text={v === "right" ? `Number ${it.n} came back right` : v === "unsure" ? "The desk is not sure" : it.slip ? slipName(it.slip) : `Number ${it.n} needs another look`} />
      </div>
      <div className="mb-card" data-role="maths-hint">
        <div className="hl"><span className="mb-lab">{it.reply ? "The desk replied" : "The desk says"}</span></div>
        <div className="ht" data-role="maths-said">{prose(said)}</div>
        {job ? <JobNote job={job} /> : next && <div className="nx">{ARROW}<span>{prose(next)}</span></div>}
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
      <div className="num" data-second={it.second}>{it.n}{v !== "right" && <NumRing />}{it.second === "wrong" && <NumRing again />}{it.second === "right" && <Tick className="second" />}</div>
      <PrintRow text={it.question} tick={v === "right" && !open} />
      {rows}
      {focused && okLabel && <div className="ok"><b>OK</b><span className="mb-lab">{okLabel}</span></div>}
    </section>
  );
}

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
  const name = topicName(p.topic);
  // the record is the first attempt: "right" is what marking said; a fixed item (a held second go) is counted out of "to look at" only
  const right = tiles.filter((x) => x.verdict === "right").length, fixed = tiles.filter((x) => x.second === "right").length, look = lookCount(p.items);
  const tile = ix === null ? undefined : tiles[ix];
  const curIx = ix ?? Math.min(tiles.length - 1, Math.max(0, firstToLook(p.items)));
  return (<>
    <Top s={s} crumb={name} right={<div className="mb-status"><Tally items={p.items} cur={ix} /><Chips s={s} phone={false} clock={false} /></div>} />
    <div className="mb-win">
      <div className="mb-pan" ref={pan}>
        <div className="mb-paper" data-role="maths-sheet">
          <header className="mb-sheethead"><span className="st" data-role="maths-title">{sheetHead(look, tiles.length)}</span><span className="who">{s.learner?.name}</span></header>
          {p.items.map((it, i) => <MarkedItem key={it.n} it={it} open={false} focused={ix === i} cur={i === curIx} okLabel="Open" />)}
        </div>
      </div>
    </div>
    {tile && ix !== null ? <SlipSide it={p.items[ix]} points={p.items[ix].slip ? slipById(p.items[ix].slip!)?.points : undefined} /> : (
      <aside className="mb-side" key={String(at)}>
        <div className="mb-khead"><div className="mb-kick">{at === "more" ? <>{KIND_ICON.six}Six more</> : <>Put away</>}</div></div>
        <div className="mb-stitle" data-role="maths-slip"><Amber text={at === "more" ? `Six more on ${name}` : "The set leaves the desk"} /></div>
        <div className="mb-card" data-role="maths-hint">
          <div className="ht" data-role="maths-said">{at === "more" ? moreLine(p.topic, name, s.skills?.[p.topic]?.slips ?? []) : "The set leaves the desk. What it showed is already in your record."}</div>
        </div>
      </aside>
    )}
    <div className="mb-acts">
      <Act icon={ICON.six} label="Six more" focused={at === "more"} primary />
      <Act icon={ICON.away} label="Put the sheet away" focused={at === "away"} />
      <div className="mb-updn"><span>{right} right · {fixed ? `${fixed} fixed · ` : ""}{look} to look at</span></div>
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
  const name = topicName(p.topic);
  const last = s.walkIx === p.items.length - 1;
  const sl = it.slip ? slipById(it.slip) : undefined;
  return (<>
    <Top s={s} crumb={name} right={<div className="mb-status"><Tally items={p.items} cur={s.walkIx} /><Chips s={s} phone={false} clock={false} /></div>} />
    <div className="mb-win">
      <div className="mb-pan" ref={pan}>
        <div className="mb-paper" data-role="maths-sheet">
          <header className="mb-sheethead"><span className="st" data-role="maths-title">{name}</span><span className="who">{s.learner?.name}</span></header>
          {p.items.map((x, i) => <MarkedItem key={x.n} it={x} open={i === s.walkIx} focused={i === s.walkIx && !last} cur={i === s.walkIx} dim={i !== s.walkIx} />)}
        </div>
      </div>
    </div>
    <SlipSide it={it} points={sl?.points} job={explainLine(s, it.n)} />
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
          <header className="mb-sheethead"><span className="st" data-role="maths-title">{p.title}</span><span className="who">{s.learner?.name}</span></header>
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
        <header className="mb-sheethead"><span className="st">{p?.title ?? ""}</span><span className="who">{s.learner?.name}</span></header>
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
  // Concepts are labels: the library entry's own when there is one (a hint's pick carries a transcript chunk in
  // `text`; the library's lesson pick carries the concepts joined by " · "). Over four words is not a concept.
  const concepts = (LESSONS.find((x) => x.id === l.id)?.concepts ?? l.text.split(" · "))
    .map((x) => x.trim()).filter((x) => x && x.split(/\s+/).length <= 4).slice(0, 6);
  const why = prose(l.why).replace(/^(\W*)(\p{Ll})/u, (_, a: string, c: string) => a + c.toUpperCase());
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
      <p className="mb-cap" style={{ position: "static", width: "auto", minHeight: 0, marginTop: 28, fontSize: 32 }}>{why}</p>
    </aside>
  </>);
}

// ---------------------------------------------------------------- T2 Units and T2m Calendar: a contents page, a planner

export function Units({ s, focus }: { s: Session; focus: number }) {
  const list = unitStops(s), state = lessonStates(list, s.history);
  const cur = stopAt(list, focus);
  const pan = usePaper(focus);
  // a path with no lessons on file (Calculus 1): one honest line, nothing to focus; Back still goes home
  if (!list.length) return (<>
    <Top s={s} crumb="Units" />
    <h1 className="mb-title" data-role="maths-title" style={{ top: 150 }}><Amber text="Lessons on file" /></h1>
    <Caption text={`${noLessonsLine(learnerPath(s))} Back returns to Tonight.`} />
  </>);
  return (<>
    <Top s={s} crumb="Units" />
    <div className="mb-win" style={{ top: 146, height: 880 }}>
      <div className="mb-pan" ref={pan}>
        <div className="mb-paper" data-role="maths-sheet">
          <header className="mb-sheethead"><span className="st" data-role="maths-title">Lessons on file</span><span className="who">{s.learner?.name}</span></header>
          {list.map((l, i) => (
            <div key={l.id} className="mb-unit" data-focused={l === cur || undefined} data-cur={l === cur || undefined} data-state={state[i]}>
              <span className="u">{l.unit}</span>
              <span className="t">{l.title}</span>
              <span className="m">{state[i] === "done" ? <Tick /> : state[i] === "next" ? <span className="next">Next</span> : null}{l.minutes} min</span>
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
  const list = calendarStops(s), states = lessonStates(list, s.history), done = states.filter((x) => x === "done").length;
  const cur = stopAt(list, focus);
  const weeks = calendarWeeks(list.length);
  const tilt = [-0.8, 0.6, -0.4, 0.9, -0.6, 0.5, -0.9, 0.4];
  if (!list.length) return (<>
    <Top s={s} crumb="Lessons on file" />
    <h1 className="mb-title" data-role="maths-title" style={{ top: 150 }}>Where you <em>are</em></h1>
    <Caption text={`${noLessonsLine(learnerPath(s))} Back returns to the units.`} top={960} />
  </>);
  return (<>
    <Top s={s} crumb="Lessons on file" />
    <h1 className="mb-title" data-role="maths-title" style={{ top: 150 }}>Where you <em>are</em></h1>
    <div className="mb-planner" style={{ top: 280 }}>
      {weeks.map(([w, a, b]) => [
        <div key={w} className="wk">{w}</div>,
        ...list.slice(a, b).map((l, j) => {
          const i = a + j, state = states[i];
          return (
            <div key={l.id} className="mb-cell" data-state={state} data-focused={l === cur || undefined} style={{ "--r": `${tilt[i % tilt.length]}deg` } as React.CSSProperties}>
              <div className="t">{l.title}</div>
              <div className="s">{state === "done" ? <><Tick />done</> : state === "next" ? "next up" : state === "later" ? "later" : `${l.minutes} min`}</div>
            </div>
          );
        }),
        ...Array.from({ length: 3 - (b - a) }, (_, k) => <div key={w + k} />),
      ])}
    </div>
    <Caption text={`${done ? `${done} of ${list.length} lessons watched` : "No lesson watched yet"}. Select opens the lesson; Back returns to the units.`} top={960} />
  </>);
}
