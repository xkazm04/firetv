/**
 * The recovery list on Math Buddy's television (v2 M5b): the learner's latest paper (Session.paper) recomputed through
 * rules/recovery, drawn in `recovery()`'s own order (App Master ruling 5: never re-sorted here), with the topics the
 * desk calls secure marked beside them and never dropped (ruling 2). Pure; no string names the board.
 */
import type { Session } from "@/lib/session/store";
import { recovery, type Recovery } from "@/lib/rules/recovery";

export interface PaperTopic { id: string; name: string; lost: number; from: string; secure: boolean; }
export interface PaperOff { can: string; lost: number; from: string; beyond: boolean; }
export interface PaperView {
  /** No paper on the learner's record. */
  empty: boolean;
  marks: number; outOf: number; lost: number;
  topics: PaperTopic[];
  /** Statements the desk has no topic for: apart, under "Not on the desk yet". */
  off: PaperOff[];
  /** Questions left with no statement (their marks are in the totals, on no topic). */
  unmapped: number;
}

const marks = (n: number) => `${n} ${n === 1 ? "mark" : "marks"}`;
const labels = (qs: readonly string[]) => qs.join(", ");

export function paperView(s: Pick<Session, "paper" | "skills">): PaperView {
  if (!s.paper) return { empty: true, marks: 0, outOf: 0, lost: 0, topics: [], off: [], unmapped: 0 };
  const r: Recovery = recovery([...s.paper.items, ...s.paper.unmapped]);
  return {
    empty: false, marks: r.totals.marks, outOf: r.totals.outOf, lost: r.totals.lost, unmapped: r.unmapped.length,
    // the order is recovery()'s: the learner meets the base of the biggest loss first
    topics: r.topics.map((t) => ({ id: t.id, name: t.name, lost: t.lost, from: labels(t.items), secure: s.skills?.[t.id]?.secure === true })),
    off: r.notOnDesk.map((o) => ({ can: o.can, lost: o.lost, from: labels(o.items), beyond: !o.foundation })),
  };
}

/** How many topics the list holds: the stops the D-pad walks (tv/keys). */
export const paperTopicCount = (s: Pick<Session, "paper" | "skills">): number => paperView(s).topics.length;

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

/** The caption: where to start, or how to enter a paper. */
export function paperCaption(v: PaperView): string {
  if (v.empty) return "Type the marks of a paper you sat on the phone. The desk shows where they were lost.";
  if (!v.topics.length && !v.off.length) return "No marks were lost on this paper. Type another on the phone any time.";
  const first = v.topics[0];
  return first ? `Start with ${first.name}. The list runs from the biggest loss, with the base each one needs first.` : "None of these has a topic on the desk yet.";
}
