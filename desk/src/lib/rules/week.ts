/**
 * The Sunday page (Family W9): the parent's week, in words, written by CODE from the learner's own weekly digest
 * (rules/digest, on the learner file) with authored templates - no model is called, and nothing here can call one.
 *
 * `sundayPage(learner, profile, now)` reads the past seven days (local midnight six days back to `now`, the recap's own
 * day rule) and returns rows: counts of things done, unit and scene names, one slip by kind, one thing to try together.
 * `sundayWords(page)` turns the rows into short lines, in a fixed order, only where there is something true to say:
 *   a. the week: how many evenings had work;
 *   b. Math Buddy: the homework sheets read, with the hints and the second hints that evening (MB-B14); per unit worked
 *      (three at most, then "and N more"), the last set's count right and, when above 0, not sure (MB5-8); a step up in
 *      words; the practice papers typed in;
 *   c. one thing to look at: the week's most frequent code-detected slip, by its plain name, only when it came twice;
 *   d. Linga: how many conversations, and the situations' names (authored scene names, or a plan topic's own title);
 *   e. Essay Master: how many paragraph readings, and the lenses;
 *   f. one thing to try together: exactly one everyday act, from the authored table DO_IT keyed by the unit worked most,
 *      or a fallback by what was done when there was no maths.
 * An empty week, one with no entry at all, is two words: "Nothing this week." The words hold counts of things (as the recap's do), never a
 * percentage, a ranking, a comparison with a sibling, a school year or an age, never praise, a problem, an answer, a
 * transcript or a quote. Only THIS learner's record is read. Each line stays within LINE_WORDS words and the page within
 * PAGE_WORDS (a fixed ladder trims detail, never a section, when a busy week runs long). Phase 1 writes English only:
 * the page's language follows the desk's, and the desk is English in Phase 1.
 *
 * Pure and client-safe: library data only - never the store, the learners file, a job or an engine (types excepted).
 */
import type { Learner } from "../session/learners";
import type { Profile } from "../session/store";
import type { DigestEntry, EnglishDigest, EssayDigest, HomeworkDigest, MathsDigest } from "./digest";
import { slipName } from "./digest";
import { topicIn } from "../library/paths";
import { ESSAY_TYPES } from "../library/lessons.data";
import { AUTHORED_SCENES } from "../english/curriculum";
import { SCHOOL_SLIPS } from "./school";

/** The empty week, whole: the desk's rule that an empty state is two words. */
export const WEEK_EMPTY = "Nothing this week.";
/** The page when the learner's record could not be read: one line, never the empty week (it is not known to be empty). */
export const WEEK_UNREAD = "The week could not be read just now.";
/** The most words on one line, and on the whole page: its lines, not counting the fixed section headings the phone draws. */
export const LINE_WORDS = 14;
export const PAGE_WORDS = 90;
/** The most units named before "and N more". */
export const UNITS_SHOWN = 3;
/** A reading of this many sentences or more is a piece on the Sunday page (the digest keeps no paragraph count; a lone paragraph is far shorter). */
export const PIECE_SENTENCES = 12;

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
/**
 * A unit's name on the Sunday page, where the library's would carry a unit line past LINE_WORDS (two-digit counts, a
 * not-sure count and "last set" leave five words for the name). Closed and authored: exactly the library topics whose
 * own name is longer, each in plain words with no abbreviation. The step-up line says the same name. The library's names
 * are unchanged; every other unit keeps its own.
 */
export const SUNDAY_NAMES: Readonly<Record<string, string>> = {
  "area": "Area of rectangles and triangles",
  "linear-both-sides": "Equations, x on both sides",
  "calc1-functions": "Functions, new from old",
  "calc1-limit-idea": "The idea of a limit",
  "calc1-limit-laws": "Limit laws, the squeeze theorem",
  "calc1-derivative": "The derivative as a limit",
  "calc1-rules": "Polynomial, product and quotient rules",
  "calc1-chain": "Chain rule, implicit differentiation",
  "calc1-log-derivative": "Derivative of the logarithm",
  "calc1-extrema": "Maxima, minima, mean value theorem",
  "calc1-shape": "Second derivative, curve sketching",
  "calc1-ftc": "The fundamental theorem, net change",
  "calc1-area-average": "Areas between curves, average values",
};
/** A unit's name as the page says it: its Sunday name when the table has one, else the library's. */
const unitName = (id: string): string | undefined => (Object.prototype.hasOwnProperty.call(SUNDAY_NAMES, id) ? SUNDAY_NAMES[id] : topicIn(id)?.name);

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

export interface WeekUnit { id: string; name: string; sets: number; right: number; notSure: number; total: number; stretch: boolean; latest: number }
/** The page as rows: what the words are made of. Counts and names only; empty when nothing was done this week. */
export interface SundayPage {
  name: string;
  empty: boolean;
  evenings: number;
  /** every unit worked this week, most sets first (then the most recent) */
  units: WeekUnit[];
  /** the units with a step-up set this week, in `units` order */
  stepUps: string[];
  /** the homework sheets read this week, and the hints and second hints counted onto them; null with none */
  homework: { sheets: number; hints: number; second: number } | null;
  /** the practice papers typed in this week */
  papers: number;
  slip: { id: string; name: string; times: number } | null;
  english: { conversations: number; scenes: string[] } | null;
  essay: { readings: number; pieces: number; lenses: string[] } | null;
  tryIt: string | null;
}
/** One line of the page: a section's heading, or one of its lines. What the phone is sent; never the digest. */
export interface WeekLine { section: WeekSection; head?: true; text: string }

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
  const page: SundayPage = { name, empty: !week.length, evenings: new Set(week.map((e) => dayKey(e.at))).size, units: [], stepUps: [], homework: null, papers: 0, slip: null, english: null, essay: null, tryIt: null };
  if (page.empty) return page;

  // b. the units: one row each, from its latest set; most sets first, then the most recent, then the path's order
  const maths = week.filter((e): e is MathsDigest => e.kind === "maths" && !!topicIn(e.topic));
  const byUnit = new Map<string, WeekUnit>();
  maths.forEach((e) => {
    const u = byUnit.get(e.topic) ?? { id: e.topic, name: unitName(e.topic)!, sets: 0, right: 0, notSure: 0, total: 0, stretch: false, latest: -1 };
    u.sets++; if (e.stretch) u.stretch = true;
    if (e.at >= u.latest) { u.latest = e.at; u.right = e.right; u.notSure = e.notSure; u.total = e.total; }
    byUnit.set(e.topic, u);
  });
  page.units = [...byUnit.values()].sort((a, b) => b.sets - a.sets || b.latest - a.latest || a.id.localeCompare(b.id));
  page.stepUps = page.units.filter((u) => u.stretch).map((u) => u.name);
  // the homework sheets and their hints, and the papers typed in: counts only (MB-B14)
  const sheets = week.filter((e): e is HomeworkDigest => e.kind === "homework");
  if (sheets.length) page.homework = { sheets: sheets.length, hints: sheets.reduce((a, e) => a + e.hints, 0), second: sheets.reduce((a, e) => a + e.second, 0) };
  page.papers = week.filter((e) => e.kind === "paper").length;

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
  if (reads.length) page.essay = { readings: reads.length, pieces: reads.filter((r) => r.sentences >= PIECE_SENTENCES).length, lenses: ESSAY_TYPES.filter((t) => reads.some((r) => r.lens === t.id)).map((t) => t.name) };

  // f. one act: the unit worked most (the first row) when the table has it, else by what was done
  const top = page.units.find((u) => DO_IT[u.id]);
  page.tryIt = top ? DO_IT[top.id]
    : page.english && (!page.essay || page.english.conversations >= page.essay.readings) ? DO_IT_ELSE.english
    : page.essay ? DO_IT_ELSE.essay : DO_IT_ELSE.any;
  return page;
}

/**
 * The detail a busy week is trimmed by, rung by rung, until the page fits PAGE_WORDS: fewer units named, then no scene
 * names, then a shorter step-up line, then the homework line without its hint counts (the sheets are still said). No
 * rung drops a section, or a line whose absence would read as nothing done.
 */
interface Trim { units: number; scenes: boolean; stepNames: boolean; hints: boolean }
const LADDER: Trim[] = [
  { units: 3, scenes: true, stepNames: true, hints: true }, { units: 2, scenes: true, stepNames: true, hints: true }, { units: 1, scenes: true, stepNames: true, hints: true },
  { units: 1, scenes: false, stepNames: true, hints: true }, { units: 1, scenes: false, stepNames: false, hints: true },
  { units: 1, scenes: false, stepNames: false, hints: false },
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

/** "Two homework sheets, 5 hints, 2 needed a second.": the sheets, then the hints and the second hints when each is above 0 (the sheets alone on the ladder's last rung). */
function homeworkLine(h: NonNullable<SundayPage["homework"]>, hints: boolean): string {
  return [cap(times(h.sheets, "homework sheet")), hints && h.hints ? `${h.hints} ${h.hints === 1 ? "hint" : "hints"}` : "", hints && h.second ? `${h.second} needed a second` : ""].filter(Boolean).join(", ") + ".";
}

function linesOf(page: SundayPage, t: Trim): WeekLine[] {
  if (page.empty) return [{ section: "week", text: WEEK_EMPTY }];
  // a profile name long enough to carry the week line past LINE_WORDS is said by its first word
  const said = (name: string) => `${name} worked on ${times(page.evenings, "evening")}.`;
  const out: WeekLine[] = [{ section: "week", text: wordsIn(said(page.name)) <= LINE_WORDS ? said(page.name) : said(page.name.split(/\s+/)[0]) }];
  const head = (section: Exclude<WeekSection, "week">) => out.push({ section, head: true, text: WEEK_HEADS[section] });
  if (page.homework || page.units.length || page.papers) head("maths");
  if (page.homework) out.push({ section: "maths", text: homeworkLine(page.homework, t.hints) });
  if (page.units.length) {
    const shown = page.units.slice(0, t.units);
    for (const u of shown) out.push({ section: "maths", text: `${u.name}: ${u.right} of ${u.total} right${u.notSure ? `, ${u.notSure} not sure` : ""}, last set.` });
    const more = page.units.length - shown.length;
    if (more) out.push({ section: "maths", text: `And ${times(more, "more unit")}.` });
    if (page.stepUps.length === 1 && t.stepNames && wordsIn(`A step up taken in ${page.stepUps[0]}.`) <= LINE_WORDS) out.push({ section: "maths", text: `A step up taken in ${page.stepUps[0]}.` });
    else if (page.stepUps.length) out.push({ section: "maths", text: page.stepUps.length === 1 ? "A step up taken this week." : `A step up taken in ${times(page.stepUps.length, "unit")}.` });
  }
  if (page.papers) out.push({ section: "maths", text: `${cap(times(page.papers, "practice paper"))} typed in.` });
  if (page.slip) { head("look"); out.push({ section: "look", text: `The most common slip, ${page.slip.times === 2 ? "twice" : `${num(page.slip.times)} times`}: ${low(page.slip.name)}.` }); }
  if (page.english) {
    head("english");
    const h = cap(times(page.english.conversations, "conversation"));
    out.push({ section: "english", text: t.scenes && page.english.scenes.length ? namesLine(h, page.english.scenes) : `${h}.` });
  }
  if (page.essay) {
    head("essay");
    const lenses = page.essay.lenses, list = lenses.length > 1 ? `${lenses.slice(0, -1).join(", ")} and ${lenses.at(-1)}` : lenses[0];
    const { readings, pieces } = page.essay, paras = readings - pieces;
    const said = [paras ? times(paras, "paragraph reading") : "", pieces ? times(pieces, "piece") : ""].filter(Boolean).join(" and ");
    out.push({ section: "essay", text: `${cap(said)}${list ? `, through ${list}` : ""}.` });
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
