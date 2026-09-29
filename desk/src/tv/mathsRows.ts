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

const COUNT_WORDS = ["", "One", "Two", "Three", "Four", "Five"];
/** A count as Tonight's title writes it: a word up to five, digits past the word list (never "undefined"). */
export function countWord(n: number): string { return COUNT_WORDS[n] || String(n); }

/**
 * Tonight's title when nothing is open: every topic secure, "N of M topics secure", or on the first evening the first
 * topic on the path (SYLLABUS[0]) from the first step - read from the syllabus, so a new first topic renames it.
 */
export function secureTitle(secure: number, total = SYLLABUS.length, first = SYLLABUS[0]?.name ?? ""): string {
  if (total > 0 && secure >= total) return "Every topic on the path is secure";
  if (secure > 0) return `${countWord(secure)} of ${total} topics secure`;
  return `${first}, from the first step`;
}

/**
 * The calendar's weeks over `n` lessons: three a week, the last one shorter, as [label, from, to) - the same three
 * wide grid the D-pad walks (tv/keys.ts calendarStops, `grid(k, n, 3)`), so every lesson that can be focused is drawn.
 */
export function calendarWeeks(n: number): Array<[string, number, number]> {
  const out: Array<[string, number, number]> = [];
  for (let a = 0, w = 1; a < n; a += 3, w++) out.push([`Week ${w}`, a, Math.min(n, a + 3)]);
  return out;
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

/**
 * A job's state as the TV says it: running, or failed with the job's own sentence (lib/desk/job.ts). Never an
 * answer, a verdict or a model's words - only the desk's fixed sentences.
 */
export interface JobLine { phase: "running" | "failed"; text: string }
type JobsOf = Pick<Session, "jobs" | "practice">;
/** When a run last moved: its end, or its start while it runs. */
const at = (j: { startedAt: number; endedAt?: number } | undefined) => (j ? j.endedAt ?? j.startedAt : -Infinity);

/** Practice, while the photographed set is being marked. */
export const MARKING = "The desk is marking the set…";
/** Practice, after a failed mark: how to ask again (the phone's snap is the retry). */
export const SNAP_AGAIN = "Snap the sheet again and the desk tries again.";
/**
 * The Practice caption's state: the set is being marked, or the mark failed (its sentence, then that snapping again
 * tries again - the sentence's own "Try again." is dropped, as the snap line says how). A failure belongs to the
 * set it was for: once a newer set has been written it is not shown. Otherwise null, and the caption is unchanged.
 */
export function markLine(s: JobsOf): JobLine | null {
  const p = s.practice, j = s.jobs?.mark;
  if (!p || p.marked || !j) return null;
  if (j.phase === "running") return { phase: "running", text: MARKING };
  if (j.phase !== "failed" || at(s.jobs?.practice) > at(j)) return null;
  const said = (j.error ?? "The desk could not mark the set.").replace(/\s*Try again\.\s*$/, "");
  return { phase: "failed", text: `${said} ${SNAP_AGAIN}` };
}

/** The Walk, while the learner's explanation of the open item is being thought over. */
export const THINKING = "The desk is thinking over what you said…";
/**
 * The open item's state on the Walk: the explanation of item `n` is running, or it failed (its own sentence). Only
 * for its own item (the job's key is the item's number), and only on the set it was for: a failure from before this
 * set was marked is not shown. Otherwise null, and the item is unchanged.
 */
export function explainLine(s: JobsOf, n: number): JobLine | null {
  const j = s.jobs?.explain;
  if (!s.practice?.marked || !j || j.key !== String(n)) return null;
  if (j.phase === "running") return { phase: "running", text: THINKING };
  if (j.phase !== "failed" || at(s.jobs?.mark) > at(j)) return null;
  return { phase: "failed", text: j.error ?? "The desk could not follow that. Try again." };
}

/** The paper's square in px, as drawn (design/maths-lamplight.css `--mb-sq`). */
export const SQUARE = 48;

/**
 * How many whole squares a row of the paper takes: its own minimum (two, three for a tall line), or - when the line
 * is taller than that (a fraction over a subscripted fraction, a wrapped line) - the next whole number of squares
 * that holds it, so every row stays a whole number of squares and no line is taller than its row. A pixel over is
 * sub-pixel layout, not a new square.
 */
export function rowSquares(content: number, sq = SQUARE, min = 2): number {
  if (!(content > 0) || !(sq > 0)) return min;
  return Math.max(min, Math.ceil((content - 1) / sq));
}

/** The squares a paper may be drawn on when its rows do not fit its room, largest (the paper as drawn) first. */
export const PAPER_SQUARES = [48, 46, 44, 42, 40, 38, 36];

/**
 * The largest square at which a paper with a fixed room (the Practice sheet: every question must be on screen, there
 * is nothing to pan to) fits: `chrome` squares of its own (its padding and its head) plus each row's whole squares
 * (`rowSquares` of its measured height `h`, never under its `min`). Nothing fits: the smallest square.
 */
export function paperSquare(rows: ReadonlyArray<{ h: number; min: number }>, chrome: number, room: number, sizes: readonly number[] = PAPER_SQUARES): number {
  for (const sq of sizes) {
    const squares = chrome + rows.reduce((n, r) => n + rowSquares(r.h, sq, r.min), 0);
    if (squares * sq <= room) return sq;
  }
  return sizes[sizes.length - 1];
}
