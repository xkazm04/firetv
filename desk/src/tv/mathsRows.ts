/**
 * Math Buddy's pure rows: what the session alone says is open. Shared by the Tonight screen and
 * the D-pad (tv/keys.ts). Types only from the store - the TV never loads the filesystem.
 */
import type { Screen, Session } from "@/lib/session/store";
import { PATHS, learnerPath, topicIn, topicsOf, type MathPath, type PathTopic } from "@/lib/library/paths";
import { firstToLook } from "@/tv/sheetRows";
import { slip as slipById } from "@/lib/rules/maths";
import { SCHOOL_UNIT_SLIPS } from "@/lib/rules/school";
import { likeTopic } from "@/lib/rules/kinds";

/** Where a topic stands on the path: secure (latched), the one in hand, open next, or later. */
export type TopicState = "secure" | "here" | "next" | "later";

/** Who is at the desk, for the path: without profiles or a learner it is the school path (paths.ts `learnerPath`). */
type OnPath = Partial<Pick<Session, "profiles" | "learner">>;

/**
 * What the learner's record says about each topic on THEIR path (paths.ts `learnerPath`: the school path, or the
 * Calculus 1 course when the profile says so), in path order. "Secure" is the latched record alone
 * (lib/session/learners.ts: estimate 0.85 with four attempts seen, never unset) - the same record the ruler's
 * groove is drawn from, so a hatched groove never says Secure. Tonight's marked set is already in that record
 * once it is marked; the TV never re-decides it from a count of right answers. "next" is a topic whose
 * prerequisites are all latched secure. A record for a topic on another path is not read.
 */
export function topicStates(s: Pick<Session, "skills" | "topic"> & OnPath): Record<string, TopicState> {
  const done = new Set<string>(Object.values(s.skills ?? {}).filter((r) => r.secure).map((r) => r.topic));
  const out: Record<string, TopicState> = {};
  for (const t of topicsOf(learnerPath(s))) out[t.id] = done.has(t.id) ? "secure" : s.topic === t.id ? "here" : t.prereq.every((p) => done.has(p)) ? "next" : "later";
  return out;
}

/** A topic id spelled out as words ("calc1-no-such" -> "Calc1 no such"): only for an id no path knows. */
export function humanTopic(id: string): string { const w = id.replace(/[-_]+/g, " ").trim(); return w.charAt(0).toUpperCase() + w.slice(1); }

/** A practice topic's name as the TV writes it: its path's name for it (paths.ts `topicIn`), else the id spelled out. */
export function topicName(id: string): string { return topicIn(id)?.name ?? humanTopic(id); }

/**
 * The first evening's words on a path: the path's own name ('School maths', 'Calculus 1'), for the school path
 * too. A course's first topic is not what the learner signed up for, and neither is the school path's
 * (owner decision 2026-09-29).
 */
export function pathFirst(path: MathPath): string {
  // the path's own name, for the school path too (owner decision 2026-09-29; since W5b 'School maths, from the first step')
  return PATHS[path].name;
}

/** The learner's path as Tonight counts it: the path, its topics, the ones latched secure, and its first words. */
export function pathSecure(s: Pick<Session, "skills"> & OnPath): { path: MathPath; topics: PathTopic[]; secure: PathTopic[]; first: string } {
  const path = learnerPath(s), topics = topicsOf(path);
  return { path, topics, secure: topics.filter((t) => s.skills?.[t.id]?.secure), first: pathFirst(path) };
}

/**
 * Has the learner a Math placement - a measured place on their path, not one read off their age? The ruler draws the
 * gap line between their needle and the SCHOOL tick only then (rulerRows `schoolMarks`, owner decision D2, Family
 * Phase 1). No Math placement exists in Phase 1 (the placement staircase is Phase 2), so it is false for everyone.
 */
export function mathPlaced(_s?: unknown): boolean {
  return false;
}

/**
 * The topics on the learner's path whose step-up record has latched secure (lib/session/learners.ts SkillRecord.stretch,
 * Family W8): the ruler and the strip draw each as a second, thinner ink line under its groove. Read from the record
 * alone, whatever the usual record says - a learner may have stretched first. Never a count on screen.
 */
export function stretchSecure(s: Pick<Session, "skills"> & OnPath): Set<string> {
  return new Set(topicsOf(learnerPath(s)).filter((t) => s.skills?.[t.id]?.stretch?.secure === true).map((t) => t.id));
}

/**
 * Has the learner a usual record on this topic - one attempt seen? A step-up attempt on a topic with no record makes a
 * usual record with nothing seen (learners.ts recordAttempt), which the ruler draws as it drew no record: an unseen groove.
 */
export function usualSeen(s: Pick<Session, "skills">, id: string): boolean {
  return (s.skills?.[id]?.seen ?? 0) > 0;
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
  const name = s.practice ? topicName(s.practice.topic) : "";
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

const SET_WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
/**
 * What the Practice card tells the learner to work, for a set of n questions: how many, in words up to ten and digits
 * past that. The desk writes six by default, but a set may hold fewer (a failed round keeps what it verified). Only the
 * count is here: the ask itself ("snap the whole sheet with the phone") stays in MathsTV's copy, where the phone's
 * hand-off test (tools/phone-panel-test.cjs) reads it.
 */
export function workWhat(n: number): string {
  return n === 1 ? "the question" : n === 2 ? "both" : `all ${SET_WORDS[n] || String(n)}`;
}

/** A count as the sheet's title writes it: a word up to ten (capitalised when it opens the line), digits past that. */
function sheetCount(n: number, cap: boolean): string {
  const w = SET_WORDS[n];
  if (!w) return String(n);
  return cap ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

/** Words in a line, as the card is counted. */
const wordCount = (t: string) => t.split(/s+/).filter(Boolean).length;
/**
 * The Sheet's Six more card (math-buddy-A): what the next six are aimed at, said truthfully. A school unit written by code
 * (rules/school SCHOOL_UNIT_SLIPS) with a live slip on it names the newest one in the desk's own slip words - the set is
 * drawn so it shows (lib/desk/items makeSchoolItems); a school unit with none makes no claim of aiming; a linear or Calculus
 * topic keeps the line it had, since the model is only asked there. `slips` is the record's, newest last. At most 25 words.
 */
export function moreLine(topicId: string, name: string, slips: readonly string[]): string {
  if (!Object.prototype.hasOwnProperty.call(SCHOOL_UNIT_SLIPS, topicId)) return `Six new questions on ${name}, aimed at the slips the desk has seen. Work them on paper, like this set.`;
  const own = SCHOOL_UNIT_SLIPS[topicId], live = slips.filter((id) => own.includes(id));
  if (!live.length) return `Six new questions on ${name}. Work them on paper, like this set.`;
  const id = live[live.length - 1], said = slipById(id)?.name ?? humanTopic(id);
  const lines = [`Six new questions on ${name}, aimed at: ${said}. Work them on paper, like this set.`, `Six new questions on ${name}, aimed at: ${said}. Work them on paper.`, `Six new questions, aimed at: ${said}.`];
  return lines.find((l) => wordCount(l) <= 25) ?? lines[2];
}

/**
 * The marked sheet's headline. Something still to look at is counted the way the title already was
 * ("One to look at", "Six to look at", "11 to look at"). An all-right set of one is "All of it right",
 * of two "Both right", and any longer set "All six right" — the same one-and-two the Practice card
 * says (`workWhat`), said as a title. The line under the actions stays digits.
 */
export function sheetHead(look: number, total: number): string {
  if (look > 0) return `${sheetCount(look, true)} to look at`;
  if (total === 1) return "All of it right";
  if (total === 2) return "Both right";
  return `All ${sheetCount(total, false)} right`;
}

/**
 * Tonight's title when nothing is open: every topic secure, "N of M topics secure", or on the first evening the path
 * from the first step (`pathFirst`: the path's own name, 'School maths' or 'Calculus 1'). The defaults are the
 * school path's.
 */
export function secureTitle(secure: number, total = PATHS.school.topics.length, first = pathFirst("school")): string {
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

/** What Units and the Calendar say on a path with no lessons on file (Calculus 1 has no lesson library). */
export function noLessonsLine(path: MathPath): string {
  return `No lessons for ${PATHS[path].name} yet. The desk explains a step when you ask.`;
}

/** First words that are a person's name, kept capitalised in running text: a listed name, or any Name's. */
const PROPER_FIRST = /^(?:Newton's|L'Hospital's|Riemann|\p{Lu}[\p{L}'’-]*['’]s)(?=[\s,;:]|$)/u;
/**
 * A topic's name as it reads mid-sentence ("Most people do the chain rule ... first."): its first letter lowercased,
 * unless the name opens with a proper name (Newton's method, L'Hospital's rule, Riemann sums). Nothing else changes.
 */
export function inRunningText(name: string): string {
  if (!name || PROPER_FIRST.test(name)) return name;
  return name.charAt(0).toLowerCase() + name.slice(1);
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

/** The page item under the lamp: the hint's own problem on the Hint screen, else the item the page has focused. */
type InHand = Pick<Session, "profiles" | "learner" | "hint" | "pages" | "pageIx" | "itemIx">;

/** The unit Six like this would write for the task in hand (rules/kinds likeTopic, on the learner's path), or null: the pill stays as it was. */
export function likeUnit(s: InHand): string | null {
  const text = s.hint?.problem ?? s.pages[s.pageIx]?.items[s.itemIx]?.text;
  return likeTopic(text, learnerPath(s));
}

/**
 * The Hint screen's second pill on a task that reads as a unit (math-buddy-B): 'Six like this' to press, 'Writing six like
 * it' while that unit's practice job runs (the pill is not pressable then), and after a failed job the job's own sentence
 * `failed` for the card's quiet line, the pill pressable again. Null when the task reads as no unit.
 */
export function likePill(s: Pick<Session, "jobs"> & InHand): { label: string; busy: boolean; failed: string | null } | null {
  const unit = likeUnit(s);
  if (!unit) return null;
  const j = s.jobs?.practice?.key === unit ? s.jobs.practice : undefined;
  return j?.phase === "running" ? { label: "Writing six like it", busy: true, failed: null }
    : { label: "Six like this", busy: false, failed: j?.phase === "failed" ? j.error ?? null : null };
}

/** The Page side card's title for item `n`: 'Number 3 · Add and subtract fractions' when the task reads as a unit on the learner's path, else 'Number 3'. */
export function itemTitle(n: number, text: string, s: Pick<Session, "profiles" | "learner">): string {
  const unit = likeTopic(text, learnerPath(s));
  return unit ? `Number ${n} · ${topicName(unit)}` : `Number ${n}`;
}
