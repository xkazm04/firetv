/**
 * Math Buddy's pure rows: what the session alone says is open. Shared by the Tonight screen and
 * the D-pad (tv/keys.ts). Types only from the store - the TV never loads the filesystem.
 */
import type { Screen, Session } from "@/lib/session/store";
import { SYLLABUS, topic as topicById } from "@/lib/library/syllabus";
import { firstToLook } from "@/tv/sheetRows";

/** Where a topic stands on the path: secure (latched), the one in hand, open next, or later. */
export type TopicState = "secure" | "here" | "next" | "later";

/**
 * What the learner's record says about each topic on the path. "Secure" is the latched record alone
 * (lib/session/learners.ts: estimate 0.85 with four attempts seen, never unset) - the same record the ruler's
 * groove is drawn from, so a hatched groove never says Secure. Tonight's marked set is already in that record
 * once it is marked; the TV never re-decides it from a count of right answers. "next" is a topic whose
 * prerequisites are all latched secure.
 */
export function topicStates(s: Pick<Session, "skills" | "topic">): Record<string, TopicState> {
  const done = new Set<string>(Object.values(s.skills ?? {}).filter((r) => r.secure).map((r) => r.topic));
  const out: Record<string, TopicState> = {};
  for (const t of SYLLABUS) out[t.id] = done.has(t.id) ? "secure" : s.topic === t.id ? "here" : t.prereq.every((p) => done.has(p)) ? "next" : "later";
  return out;
}

/** A description of fact, never of permission: nothing on the path is locked. */
export function stateWord(s: Pick<Session, "skills">, id: string, st: Record<string, TopicState>): "Secure" | "In progress" | "Not started" {
  if (st[id] === "secure") return "Secure";
  return st[id] === "here" || (s.skills?.[id]?.seen ?? 0) > 0 ? "In progress" : "Not started";
}

/**
 * Where the continue card leads. Every target is a Screen the D-pad navigates to, at `focus`; "page"
 * also selects the sheet at `pageIx` first. A new target is one more member here and one branch below.
 */
export type ContinueGo = Extract<Screen, "practice" | "sheet" | "page">;

/**
 * The continue card: the one thing already open in Math Buddy, offered before anything new.
 * Read straight off the session - if none of these hold there is nothing to continue and the
 * screen says nothing about it.
 */
export interface Continue { k: string; t: string; d: string; cap: string; go: ContinueGo; pageIx: number; focus: number }
export function continueCard(s: Session): Continue | null {
  const name = s.practice ? topicById(s.practice.topic)?.name ?? s.practice.topic : "";
  if (s.practice && !s.practice.marked) return {
    k: "Still open", t: "Finish the set", d: `${s.practice.items.length} questions on ${name}, not marked yet.`,
    cap: "Your questions are still on paper. Enter puts them back on screen, ready for the photo.",
    go: "practice", pageIx: 0, focus: 0,
  };
  // a marked set is parked on its sheet until it is put away: Enter goes back to the first item to look at
  if (s.practice?.marked) { const n = s.practice.items.length, right = s.practice.items.filter((i) => i.verdict === "right").length; return {
    k: "Marked", t: "Back to the marked set", d: `${name} · ${right} of ${n} right.`,
    cap: right === n ? "All of the marked set came back right. Enter shows it, and six more are one press away."
      : "The marked set is still on the desk. Enter shows it again, on the first one to look at.",
    go: "sheet", pageIx: 0, focus: firstToLook(s.practice.items),
  }; }
  const pi = s.pages.findIndex((p) => p.subject === "maths" && p.items.length > 0);
  if (pi >= 0) { const p = s.pages[pi]; return {
    k: "On the desk", t: "Back to the sheet", d: `${p.title} · ${p.items.length} problems read.`,
    cap: "The sheet you snapped is still on the desk. Enter opens it where you were.",
    go: "page", pageIx: pi, focus: 0,
  }; }
  return null;
}

/** The ten-foot floor: no line of maths on the paper is set under 28 px (the landing's useFit keeps the same one). */
export const FIT_FLOOR = 28;
/** A row's fitted size in px, and whether it must wrap because even the floor is too wide. */
export interface RowFit { size: number; wrap: boolean }

/**
 * Fits one line of the paper (a line of working, a printed question) to the room it has: the largest size, from
 * `base` down in 2 px steps, at which `widthAt(size)` - the line's measured width at that size, in stage px - is
 * within `room`. Never above `base`, never under the floor; a line too wide even at the floor stays at the floor
 * and wraps. The width is measured, not assumed, because a line does not shrink in proportion: its scripts and
 * fraction parts stop at the floor. A line that fits is measured once and left as it is. Pure, so a test calls it
 * with widths; MathsTV.tsx measures `.rin` scrollWidth.
 */
export function fitRow(base: number, room: number, widthAt: (px: number) => number, floor = FIT_FLOOR): RowFit {
  if (!(room > 0) || !(base > 0)) return { size: base, wrap: false };
  const w0 = widthAt(base);
  if (w0 <= room) return { size: base, wrap: false };
  if (base <= floor) return { size: base, wrap: true };
  // a proportional first guess (on the 2 px step), then down in steps until it fits
  let size = Math.max(floor, Math.min(base - 2, base - 2 * Math.ceil((base - (base * room) / w0) / 2)));
  for (let guard = 0; guard < 40; guard++) {
    if (widthAt(size) <= room) break;
    if (size <= floor) return { size: floor, wrap: true };
    size = Math.max(floor, size - 2);
  }
  // step back up while the next size still fits (the guess can undershoot a line whose scripts sit at the floor)
  while (size + 2 < base && widthAt(size + 2) <= room) size += 2;
  return { size, wrap: false };
}
