/**
 * The recovery list on Math Buddy's television (v2 M5b): the learner's latest paper (Session.paper) recomputed through
 * rules/recovery, drawn in `recovery()`'s own order (App Master ruling 5: never re-sorted here), with the topics the
 * desk calls secure marked beside them and never dropped (ruling 2). Pure; no string names the board.
 */
import type { Session } from "@/lib/session/store";
import { recovery, prereqsOf, reachOf, readerOf, type Recovery } from "@/lib/rules/recovery";
import { canOf } from "@/lib/rules/paperEntry";
import { systemOf } from "@/tv/profileRows";

export interface PaperTopic { id: string; name: string; lost: number; from: string; secure: boolean;
  /** The statement codes that led the questions here (recovery topics[].codes), in the order rules/recovery gives them. */
  codes: string[];
  /** The same statements in the learner's own words (canOf: Czech for a cz learner), same order; a code the list lacks is left out. */
  said: string[];
  /** Some of its lost marks are a share of a question that reaches other places too (the whole-mark sharing of rules/recovery). */
  shared: boolean; }
export interface PaperOff { can: string; lost: number; from: string; beyond: boolean; shared: boolean; }
/** The flag on an off-desk row for a statement beyond a Foundation paper, in the learner's language. */
export const beyondFlag = (system?: string): string => (system === "cz" ? " · těžší tvrzení" : " · a harder statement");
export interface PaperView {
  /** No paper on the learner's record. */
  empty: boolean;
  marks: number; outOf: number; lost: number;
  topics: PaperTopic[];
  /** Statements the desk has no topic for: apart, under "Not on the desk yet". */
  off: PaperOff[];
  /** Questions left with no statement (their marks are in the totals, on no topic). */
  unmapped: number;
  /** Typed rows the phone's cleaning left out of this paper; 0 when none. */
  leftOut: number;
}

const marks = (n: number) => `${n} ${n === 1 ? "mark" : "marks"}`;
const labels = (qs: readonly string[]) => qs.join(", ");

export function paperView(s: Pick<Session, "paper" | "skills" | "profiles" | "learner">): PaperView {
  if (!s.paper) return { empty: true, marks: 0, outOf: 0, lost: 0, topics: [], off: [], unmapped: 0, leftOut: 0 };
  const at = readerOf(s);
  const system = systemOf(s.profiles?.find((q) => q.id === s.learner?.id));
  const r: Recovery = recovery([...s.paper.items, ...s.paper.unmapped], at);
  // a question that reaches more than one place splits its lost marks between them
  const split = new Set<string>();
  for (const it of r.items) { const d = reachOf(it.codes, at); if (d.topics.length + d.off.length > 1 && it.marks < it.outOf) split.add(it.q); }
  const isShared = (qs: readonly string[]) => qs.some((q) => split.has(q));
  return {
    empty: false, marks: r.totals.marks, outOf: r.totals.outOf, lost: r.totals.lost, unmapped: r.unmapped.length, leftOut: s.paper.leftOut ?? 0,
    // the order is recovery()'s: the learner meets the base of the biggest loss first
    topics: r.topics.map((t) => ({ id: t.id, name: t.name, lost: t.lost, from: labels(t.items), codes: t.codes, said: t.codes.map((c) => canOf(c, system)).filter(Boolean), secure: s.skills?.[t.id]?.secure === true, shared: isShared(t.items) })),
    off: r.notOnDesk.map((o) => ({ can: canOf(o.code, system) || o.can, lost: o.lost, from: labels(o.items), beyond: !o.foundation, shared: isShared(o.items) })),
  };
}

/** The stops the D-pad walks (tv/keys): the topic rows, then the off-desk statements. */
export const paperStopCount = (s: Pick<Session, "paper" | "skills" | "profiles" | "learner">): number => { const v = paperView(s); return v.topics.length + v.off.length; };

/** The index of the "Type a paper" stop (TL-13): one past the last row, so the walk is the rows, then this. */
export const paperTypeAt = (s: Pick<Session, "paper" | "skills" | "profiles" | "learner">): number => paperStopCount(s);

/**
 * The off-desk row's name (design/maths-lamplight.css .mb-poffrow): 26 px, in 732 px of room - the 1100 px column, less
 * 4 px of border, 48 px of padding, the 56 px number column, two 20 px gaps and the 220 px lost/From column. At 0.55 of a
 * character's size per character, every statement with no touches wraps whole into two lines (tools/maths-tv-test RP3 e).
 */
export const OFF_NAME_PX = 26;
export const OFF_NAME_ROOM = 1100 - 4 - 48 - 56 - 40 - 220;
export const OFF_CH = 0.55 * OFF_NAME_PX;

/** The lost marks that sit on statements the desk has no topic for. */
const offLost = (v: PaperView): number => v.off.reduce((n, o) => n + o.lost, 0);

/** The score card's extra line: how many of the lost marks are not on the desk yet; null when none are. */
export function offCountLine(v: PaperView): string | null {
  const n = offLost(v);
  if (n <= 0) return null;
  if (n >= 2) return `${n} of ${v.lost} lost marks are not on the desk yet.`;
  return v.lost > 1 ? `1 of ${v.lost} lost marks is not on the desk yet.` : "The one lost mark is not on the desk yet.";
}

/** The score card's left-out line: how many typed questions the phone left out of the paper; null when none. */
export function leftOutLine(v: PaperView): string | null {
  const n = v.leftOut;
  if (n < 1) return null;
  if (n === 1) return "1 question was left out of the typed paper, so it is not in this score.";
  return `${n} questions were left out of the typed paper, so they are not in this score.`;
}

/** The Not on the desk yet card's line: how many statements the desk has no topic for. */
export function offSummary(v: PaperView): string {
  const n = v.off.length;
  return `${n === 1 ? "1 statement" : `${n} statements`} the desk has no topic for${v.topics.length ? ", after the topics" : ""}.`;
}

/** The topic rows in view: `size` of them around the lamp, and whether more lie above or below. */
export function paperWindow(n: number, focus: number, size: number): { from: number; to: number; up: boolean; down: boolean } {
  const f = Math.min(Math.max(0, focus), Math.max(0, n - 1));
  const from = Math.max(0, Math.min(f - Math.floor(size / 2), n - size));
  const to = Math.min(n, from + size);
  return { from, to, up: from > 0, down: to < n };
}

/** The lines of the paper's card: what was scored, and what was lost. */
export const scoreLine = (v: PaperView): string => `${v.marks} of ${v.outOf} marks · ${marks(v.lost)} lost`;
export const lostWord = (n: number): string => marks(n);
/** The row's short label, in its caption slot: the loss, and "shared" when other places hold a share of the same questions. */
export const lostLabel = (n: number, shared: boolean): string => `${marks(n)} lost${shared ? ", shared" : ""}`;

/**
 * The row that lost the most and needs the first row as a base: the earliest row in list order with the largest lost
 * whose prerequisites, followed through, include the first row's topic. Null when the first row is itself the biggest.
 */
export function paperBiggest(v: PaperView): PaperTopic | null {
  const first = v.topics[0];
  if (!first) return null;
  const most = Math.max(...v.topics.map((t) => t.lost));
  if (first.lost === most) return null;
  return v.topics.find((t) => t.lost === most && prereqsOf(t.id).has(first.id)) ?? null;
}

/** The caption: where to start, or how to enter a paper. */
export function paperCaption(v: PaperView): string {
  if (v.empty) return "Select Type a paper: the phone takes the marks, question by question.";
  if (!v.topics.length && !v.off.length) {
    if (v.lost === 1) return "1 mark was lost on a question that names no statement. Name the statement it tests when the paper is typed.";
    if (v.lost > 1) return `${v.lost} marks were lost on questions that name no statement. Name the statement each one tests when the paper is typed.`;
    return "No marks were lost on this paper. Select Type a paper to enter another any time.";
  }
  const first = v.topics[0];
  const big = paperBiggest(v);
  if (first && big) return `Start with ${first.name}, the base for ${big.name}, where most marks went.`;
  return first ? `Start with ${first.name}. The list runs from the biggest loss, with the base each one needs first.` : "None of these has a topic on the desk yet.";
}

/** The line the topic list shows when it holds no topic. */
export function paperNone(v: PaperView): string {
  if (v.off.length) return "Nothing on the desk yet covers these.";
  if (v.lost === 1) return "1 mark sits on a question that names no statement.";
  if (v.lost > 1) return `${v.lost} marks sit on questions that name no statement.`;
  return "No marks were lost.";
}
