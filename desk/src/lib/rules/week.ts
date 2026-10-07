/**
 * The Sunday page (Family W9): the parent's week, in words, written by CODE from the learner's own weekly digest
 * (rules/digest, on the learner file) with authored templates - no model is called, and nothing here can call one.
 *
 * `sundayPage(learner, profile, now)` reads the past seven days (local midnight six days back to `now`, the recap's own
 * day rule) and returns rows: counts of things done, unit and scene names, one slip by kind, one thing to try together.
 * `sundayWords(page)` turns the rows into short lines, in a fixed order, only where there is something true to say:
 *   a. the week: how many evenings had work;
 *   b. Math Buddy: per unit worked (three at most, then "and N more"), the last set's count right; a step up in words;
 *   c. one thing to look at: the week's most frequent code-detected slip, by its plain name, only when it came twice;
 *   d. Linga: how many conversations, and the situations' names (authored scene names, or a plan topic's own title);
 *   e. Essay Master: how many paragraph readings, and the lenses;
 *   f. one thing to try together: exactly one everyday act, from the authored table DO_IT keyed by the unit worked most,
 *      or a fallback by what was done when there was no maths.
 * An empty week is two words: "Nothing this week." The words hold counts of things (as the recap's do), never a
 * percentage, a ranking, a comparison with a sibling, a school year or an age, never praise, a problem, an answer, a
 * transcript or a quote. Only THIS learner's record is read. Each line stays within LINE_WORDS words and the page within
 * PAGE_WORDS (a fixed ladder trims detail, never a section, when a busy week runs long). Phase 1 writes English only:
 * the page's language follows the desk's, and the desk is English in Phase 1.
 *
 * Pure and client-safe: library data only - never the store, the learners file, a job or an engine (types excepted).
 */
import type { Learner } from "../session/learners";
import type { Profile } from "../session/store";
import type { DigestEntry, EnglishDigest, EssayDigest, MathsDigest } from "./digest";
import { slipName } from "./digest";
import { topicIn } from "../library/paths";
import { ESSAY_TYPES } from "../library/lessons.data";
import { AUTHORED_SCENES } from "../english/curriculum";
import { SCHOOL_SLIPS } from "./school";

/** The empty week, whole: the desk's rule that an empty state is two words. */
export const WEEK_EMPTY = "Nothing this week.";
/** The most words on one line, and on the whole page: its lines, not counting the fixed section headings the phone draws. */
export const LINE_WORDS = 14;
export const PAGE_WORDS = 90;
/** The most units named before "and N more". */
export const UNITS_SHOWN = 3;

/**
 * One thing to try together, per school unit: an everyday act a parent can ask for with no expertise, where the child
 * shows the method on a real thing. Authored, closed, one line each; no brand, no price, no percent sign. A teacher reads
 * these before release (docs/FAMILY-PHASE-1-PLAN.md, W9 built).
 */
export const DO_IT: Readonly<Record<string, string>> = {
  "frac-equivalent": "Fold a sheet of paper into halves, quarters and eighths; ask which parts match.",
  "frac-of-amount": "Share out a bowl of fruit and ask what two thirds of it is.",
  "frac-add-sub": "While cooking, ask them how much half a cup and a quarter cup make.",
  "frac-mul-div": "Halve a recipe together and let them work out each new amount.",
  "linear-one-step": "Think of a number, add seven, say the result, and let them find it.",
  "dec-arith": "Add up a shopping receipt together and check it against the total.",
  "dec-convert": "Read a sale sign together and ask them to say it as a fraction.",
  "pct-of-amount": "Next time you shop, ask them what ten percent off a price would be.",
  "pct-change": "Ask them what a bus fare would be after a ten percent rise.",
  "ratio-share": "Mix a drink or some paint in a ratio together, like one to four.",
  "unit-rate": "Compare the price per kilo of two packs of the same food.",
  "area": "Measure a rug together and work out its area.",
  "mean-range": "Time a few walks to school and work out the mean and the range.",
  "pythagoras": "Lean a plank on a wall and ask how long it must be.",
  "probability": "Put coloured sweets in a bag and ask the chance of pulling red.",
  "linear-two-step": "Think of a number, double it, add three, and let them find your number.",
  "linear-both-sides": "Ask when two plans, each a fee plus a monthly charge, cost the same.",
};
/** The act for a week with no school unit worked: by what was done. */
export const DO_IT_ELSE = {
  english: "Ask them to teach you one English phrase they used this week.",
  essay: "Ask them to read you a paragraph they worked on and say what changed.",
  any: "Ask them to teach you one thing they learned this week.",
} as const;

/** The page's sections, in order, and the heading the phone draws over each (the week's own line has none). */
export type WeekSection = "week" | "maths" | "look" | "english" | "essay" | "try";
export const WEEK_HEADS: Readonly<Record<Exclude<WeekSection, "week">, string>> = {
  maths: "Math Buddy", look: "One thing to look at", english: "Linga", essay: "Essay Master", try: "One thing to try together",
};

export interface WeekUnit { id: string; name: string; sets: number; right: number; total: number; stretch: boolean; latest: number }
/** The page as rows: what the words are made of. Counts and names only; empty when nothing was done this week. */
export interface SundayPage {
  name: string;
  empty: boolean;
  evenings: number;
  /** every unit worked this week, most sets first (then the most recent) */
  units: WeekUnit[];
  /** the units with a step-up set this week, in `units` order */
  stepUps: string[];
  slip: { id: string; name: string; times: number } | null;
  english: { conversations: number; scenes: string[] } | null;
  essay: { readings: number; lenses: string[] } | null;
  tryIt: string | null;
}
/** One line of the page: a section's heading, or one of its lines. What the phone is sent; never the digest. */
export interface WeekLine { section: WeekSection; head?: true; text: string }

const DAY = 24 * 60 * 60 * 1000;
/** Local midnight six days before the day `now` falls in: the week is today and the six days before it. */
export function weekStart(now: number): number {
  const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 6); return d.getTime();
}
/** The local day an instant falls in, as a key (so a DST change never splits or merges an evening). */
const dayKey = (at: number) => { const d = new Date(at); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };

const NUMBER = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const num = (n: number) => NUMBER[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const low = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
/** "one evening", "three evenings": a count in words and its noun. */
const times = (n: number, one: string, many = `${one}s`) => `${num(n)} ${n === 1 ? one : many}`;
/** Words in a line, as a reader counts them. */
export const wordsIn = (line: string) => line.split(/\s+/).filter(Boolean).length;

/** A Linga scene's name: the authored scene's, or the learner's own plan topic's title as the desk stores it; else none. */
function sceneName(id: string, learner: Pick<Learner, "english">): string | null {
  return AUTHORED_SCENES.find((s) => s.id === id)?.name ?? learner.english?.plan?.topics?.find((t) => t.id === id)?.title?.trim() ?? null;
}

/** The week's rows from this learner's own digest. Deterministic: the same learner, profile and `now` give the same page. */
export function sundayPage(learner: Pick<Learner, "digest" | "english">, profile: Pick<Profile, "name"> | null | undefined, now: number): SundayPage {
  const from = weekStart(now);
  const week = (learner.digest ?? []).filter((e: DigestEntry) => e.at >= from && e.at <= now);
  const name = profile?.name?.trim() || "Your learner";
  const page: SundayPage = { name, empty: !week.length, evenings: new Set(week.map((e) => dayKey(e.at))).size, units: [], stepUps: [], slip: null, english: null, essay: null, tryIt: null };
  if (page.empty) return page;

  // b. the units: one row each, from its latest set; most sets first, then the most recent, then the path's order
  const maths = week.filter((e): e is MathsDigest => e.kind === "maths" && !!topicIn(e.topic));
  const byUnit = new Map<string, WeekUnit>();
  maths.forEach((e) => {
    const u = byUnit.get(e.topic) ?? { id: e.topic, name: topicIn(e.topic)!.name, sets: 0, right: 0, total: 0, stretch: false, latest: -1 };
    u.sets++; if (e.stretch) u.stretch = true;
    if (e.at >= u.latest) { u.latest = e.at; u.right = e.right; u.total = e.total; }
    byUnit.set(e.topic, u);
  });
  page.units = [...byUnit.values()].sort((a, b) => b.sets - a.sets || b.latest - a.latest || a.id.localeCompare(b.id));
  page.stepUps = page.units.filter((u) => u.stretch).map((u) => u.name);

  // c. one slip by kind: the week's most frequent code-detected slip, ties by rules/school's table order, only twice or more
  const slips = new Map<string, number>();
  for (const e of maths) if (e.slip && e.slipN) slips.set(e.slip, (slips.get(e.slip) ?? 0) + e.slipN);
  let best: { id: string; times: number } | null = null;
  for (const s of SCHOOL_SLIPS) { const n = slips.get(s.id) ?? 0; if (n >= 2 && (!best || n > best.times)) best = { id: s.id, times: n }; }
  const bestName = best ? slipName(best.id) : undefined;
  page.slip = best && bestName ? { ...best, name: bestName } : null;

  // d. Linga: the conversations, and the situations' names, each once, the most recent first
  const talks = week.filter((e): e is EnglishDigest => e.kind === "english");
  if (talks.length) {
    const scenes: string[] = [];
    for (const e of [...talks].sort((a, b) => b.at - a.at)) { const n = sceneName(e.sceneId, learner); if (n && !scenes.includes(n)) scenes.push(n); }
    page.english = { conversations: talks.length, scenes };
  }
  // e. Essay Master: the readings, and the lenses in the desk's own order
  const reads = week.filter((e): e is EssayDigest => e.kind === "essay");
  if (reads.length) page.essay = { readings: reads.length, lenses: ESSAY_TYPES.filter((t) => reads.some((r) => r.lens === t.id)).map((t) => t.name) };

  // f. one act: the unit worked most (the first row) when the table has it, else by what was done
  const top = page.units.find((u) => DO_IT[u.id]);
  page.tryIt = top ? DO_IT[top.id]
    : page.english && (!page.essay || page.english.conversations >= page.essay.readings) ? DO_IT_ELSE.english
    : page.essay ? DO_IT_ELSE.essay : DO_IT_ELSE.any;
  return page;
}

/** The detail a busy week is trimmed by, rung by rung, until the page fits PAGE_WORDS: fewer units named, then no scene names, then a shorter step-up line. */
interface Trim { units: number; scenes: boolean; stepNames: boolean }
const LADDER: Trim[] = [
  { units: 3, scenes: true, stepNames: true }, { units: 2, scenes: true, stepNames: true }, { units: 1, scenes: true, stepNames: true },
  { units: 1, scenes: false, stepNames: true }, { units: 1, scenes: false, stepNames: false },
];

/** Scene names that fit a line after `head`: as many as fit, then "and N more"; none when not even one fits. */
function namesLine(head: string, names: string[]): string {
  for (let k = names.length; k >= 1; k--) {
    const more = names.length - k;
    const line = `${head}: ${names.slice(0, k).join(" · ")}${more ? `, and ${num(more)} more` : ""}.`;
    if (wordsIn(line) <= LINE_WORDS) return line;
  }
  return `${head}.`;
}

function linesOf(page: SundayPage, t: Trim): WeekLine[] {
  if (page.empty) return [{ section: "week", text: WEEK_EMPTY }];
  const out: WeekLine[] = [{ section: "week", text: `${page.name} worked on ${times(page.evenings, "evening")}.` }];
  const head = (section: Exclude<WeekSection, "week">) => out.push({ section, head: true, text: WEEK_HEADS[section] });
  if (page.units.length) {
    head("maths");
    const shown = page.units.slice(0, t.units);
    for (const u of shown) out.push({ section: "maths", text: `${u.name}: ${u.right} of ${u.total} right, last set.` });
    const more = page.units.length - shown.length;
    if (more) out.push({ section: "maths", text: `And ${times(more, "more unit")}.` });
    if (page.stepUps.length === 1 && t.stepNames && wordsIn(`A step up taken in ${page.stepUps[0]}.`) <= LINE_WORDS) out.push({ section: "maths", text: `A step up taken in ${page.stepUps[0]}.` });
    else if (page.stepUps.length) out.push({ section: "maths", text: page.stepUps.length === 1 ? "A step up taken this week." : `A step up taken in ${times(page.stepUps.length, "unit")}.` });
  }
  if (page.slip) { head("look"); out.push({ section: "look", text: `The most common slip, ${page.slip.times === 2 ? "twice" : `${num(page.slip.times)} times`}: ${low(page.slip.name)}.` }); }
  if (page.english) {
    head("english");
    const h = cap(times(page.english.conversations, "conversation"));
    out.push({ section: "english", text: t.scenes && page.english.scenes.length ? namesLine(h, page.english.scenes) : `${h}.` });
  }
  if (page.essay) {
    head("essay");
    const lenses = page.essay.lenses, list = lenses.length > 1 ? `${lenses.slice(0, -1).join(", ")} and ${lenses.at(-1)}` : lenses[0];
    out.push({ section: "essay", text: `${cap(times(page.essay.readings, "paragraph reading"))}${list ? `, through ${list}` : ""}.` });
  }
  if (page.tryIt) { head("try"); out.push({ section: "try", text: page.tryIt }); }
  return out;
}

/** The words a parent reads on the page: its lines, the section headings (fixed labels) not counted. */
export const pageWords = (lines: readonly WeekLine[]) => lines.reduce((a, l) => a + (l.head ? 0 : wordsIn(l.text)), 0);

/** The page's words: the first rung of the trim ladder that fits PAGE_WORDS (the last rung always does for a real week). */
export function sundayWords(page: SundayPage): WeekLine[] {
  let lines: WeekLine[] = [];
  for (const t of LADDER) { lines = linesOf(page, t); if (pageWords(lines) <= PAGE_WORDS) return lines; }
  return lines;
}
