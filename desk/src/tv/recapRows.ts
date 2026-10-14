/**
 * The recap's pure rows: what each app on the desk did tonight, as counts a picture can draw, read straight off the
 * session - the dated history lines Math Buddy and Essay Master write (desk/mark.ts, api/read, desk/essay.ts) and
 * the conversations Linga records (englishLearning.sessions). Never a problem's text, a question or an answer: the
 * recap is ticks, rings, marks and arrows. Shared by the Recap screen (tv/screens.tsx) and the D-pad (tv/keys.ts),
 * so the tile drawn lit and the stop the keys walk are one list. Types only from the store: the TV never loads the
 * filesystem-backed session modules.
 */
import type { Session, Subject, Task } from "@/lib/session/store";
import { landingModules } from "@/tv/landingRows";
import { BRAND } from "@/tv/profileRows";
import { MARKS, type Mark } from "@/lib/rules/marks";

/** An app with nothing tonight says so in two words. */
export const RECAP_EMPTY = "Not tonight";

/**
 * A marked set: `right` ticks, then `of - right - unsure - skipped` slips, then `unsure` items the desk could not decide,
 * then `skipped` items the child left empty (MB-B1, rules/marks). Each is drawn by its own mark (tv/screens RECAP_PEN).
 */
export interface MathsSet { right: number; of: number; unsure?: number; skipped?: number }
export interface MathsTile { app: "maths"; empty: string | null; sets: MathsSet[]; pages: number; hints: number; second: number }
export interface LingaTile { app: "english"; empty: string | null; talks: number[] }
export interface EssayTile { app: "essay"; empty: string | null; readings: Array<{ lens: string; against: number; of: number; fixed?: number }> }
export type RecapTile = MathsTile | LingaTile | EssayTile;

/**
 * The counts a history line carries, by its kind; a line this does not know gives none, and nothing is guessed.
 * A practice line is "k of n right" (rules/maths rightLine), with ", u not sure" when the desk could not decide u
 * items and ", s skipped" when s were left empty; a line without them (every line written before they existed) gives
 * no such count and draws as it always did - a blank on a line older than skipped stays in its "not sure".
 */
export interface Detail { right?: number; of?: number; unsure?: number; skipped?: number; pages?: number; problems?: number; against?: number; fixed?: number }
export function parseDetail(kind: string, detail: string): Detail {
  const d = (detail ?? "").trim();
  if (kind === "practice") {
    const m = /^(\d+) of (\d+) right(?:, (\d+) not sure)?(?:, (\d+) skipped)?$/.exec(d), u = m?.[3] ? +m[3] : 0, k = m?.[4] ? +m[4] : 0;
    if (m && +m[1] + u + k <= +m[2]) return { right: +m[1], of: +m[2], ...(u ? { unsure: u } : {}), ...(k ? { skipped: k } : {}) };
  }
  if (kind === "homework") { const m = /^(\d+) problems? read$/.exec(d); if (m) return { pages: 1, problems: +m[1] }; }
  if (kind === "writing") {
    const m = /^(\d+) of (\d+) sentences? to fix(?:, \d+ paragraphs)?(?:, (\d+) fixed)?$/.exec(d);
    if (m && +m[1] <= +m[2]) return m[3] ? { against: +m[1], of: +m[2], fixed: +m[3] } : { against: +m[1], of: +m[2] };
  }
  return {};
}

/** Local midnight of the day `now` falls in: tonight is everything since. */
export function startOfDay(now: number): number { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime(); }

/** One tile per app on the learner's profile, in the desk's left-to-right order, each drawn from tonight's work only. */
export function recapRows(s: Session, now: number): RecapTile[] {
  const from = startOfDay(now), tonight = (at: number) => at >= from && at <= now;
  const lines = (s.history ?? []).filter((h) => tonight(h.at));
  return landingModules(s).map((app): RecapTile => {
    if (app === "maths") {
      const mine = lines.filter((h) => h.kind === "practice" || h.kind === "homework");
      const sets: MathsTile["sets"] = [];
      let pages = 0;
      for (const h of mine) {
        const c = parseDetail(h.kind, h.detail);
        if (c.right !== undefined && c.of !== undefined) sets.push({ right: c.right, of: c.of, ...(c.unsure ? { unsure: c.unsure } : {}), ...(c.skipped ? { skipped: c.skipped } : {}) });
        if (c.pages) pages += c.pages;
      }
      const hints = s.log?.hints ?? 0, second = s.log?.hard?.length ?? 0;
      return { app, empty: mine.length || hints ? null : RECAP_EMPTY, sets, pages, hints, second };
    }
    if (app === "english") {
      const talks = (s.englishLearning?.sessions ?? []).filter((x) => tonight(x.at)).map((x) => x.turns);
      return { app, empty: talks.length ? null : RECAP_EMPTY, talks };
    }
    const mine = lines.filter((h) => h.kind === "writing");
    const readings: EssayTile["readings"] = [];
    for (const h of mine) { const c = parseDetail(h.kind, h.detail); if (c.against !== undefined && c.of !== undefined) readings.push({ lens: h.label, against: c.against, of: c.of, ...(c.fixed ? { fixed: c.fixed } : {}) }); }
    return { app, empty: mine.length ? null : RECAP_EMPTY, readings };
  });
}

/** A set's slips: what is neither right, nor the desk's doubt, nor left empty. */
export const slipsOf = (x: MathsSet): number => x.of - x.right - (x.unsure ?? 0) - (x.skipped ?? 0);
/** The marks a set's tile draws, one per item in rules/marks order (ticks, slips, doubt, skipped), at most RAIL_MAX. */
export function setMarks(x: MathsSet): Mark[] {
  const n: Record<Mark, number> = { right: x.right, wrong: slipsOf(x), unsure: x.unsure ?? 0, skipped: x.skipped ?? 0 };
  return MARKS.flatMap((m) => Array.from({ length: Math.max(0, n[m]) }, () => m)).slice(0, RAIL_MAX);
}

/** How many readings or sets the TV tile draws, and the phone line lists. */
export const RECAP_READINGS = 3;
/** The most arrows or marks one rail draws. */
export const RAIL_MAX = 12;
/**
 * The essay rail for a reading of `of` sentences with `against` to fix: how many arrows to draw and how many of them,
 * at the end, turn citron. Up to 12 sentences it is exact. Past 12 the rail is a scale of 12: a reading with something
 * to fix always shows at least one citron arrow and never all of them unless every sentence needs fixing, and a
 * reading with nothing to fix shows none.
 */
export function railOf(of: number, against: number): { arrows: number; back: number } {
  if (of <= RAIL_MAX) return { arrows: of, back: against };
  const back = against <= 0 ? 0 : against >= of ? RAIL_MAX : Math.min(RAIL_MAX - 1, Math.max(1, Math.round((RAIL_MAX * against) / of)));
  return { arrows: RAIL_MAX, back };
}
const NUMBER = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
/**
 * How many things tonight came back to look at together: the sets' slips, the items the desk was not sure of and the
 * ones left empty (all want going through; the picture and the phone line tell them apart), and the readings' sentences
 * to fix.
 */
export function toLook(tiles: RecapTile[]): number {
  let n = 0;
  for (const t of tiles) {
    if (t.app === "maths") for (const x of t.sets) n += x.of - x.right;
    // Only the last reading's sentences to fix count: it is the last writing line of the history, which a rewrite
    // restates in place, so one paragraph read twice is not counted twice. Ceiling, accepted: when two different
    // paragraphs both have sentences to fix, only the last counts, because the history line holds no text that
    // could tell a re-read from a new paragraph. The tile and the phone line still show every listed reading.
    if (t.app === "essay" && t.readings.length) n += t.readings[t.readings.length - 1].against;
  }
  return n;
}
/**
 * The caption slot's one sentence. The picture carries the rest. "All of it right" is said only of an evening where at
 * least one item was marked and none is wrong, unsure or skipped; an evening with nothing marked says what it was instead.
 */
export function recapCaption(tiles: RecapTile[]): string {
  if (tiles.every((t) => t.empty)) return "A quiet evening.";
  const n = toLook(tiles);
  if (n) return `Good evening's work - ${NUMBER[n] ?? n} to look at together.`;
  const maths = tiles.find((t): t is MathsTile => t.app === "maths"), linga = tiles.find((t): t is LingaTile => t.app === "english");
  if (maths?.sets.length) return "Good evening's work - all of it right.";
  if (maths?.hints) return `Worked through with ${counted(maths.hints, "hint")}; nothing was marked.`;
  if (maths?.pages) return `Read ${counted(maths.pages, "page")}; nothing was marked.`;
  if (linga?.talks.length) return `${cap(times(linga.talks.length, "conversation"))} in English; nothing to mark.`;
  return "Read through; nothing to fix.";
}

/** "1 hint", "3 hints": a count and its noun, the plural when it is not one. */
export function counted(n: number, one: string, many = `${one}s`): string { return `${n} ${n === 1 ? one : many}`; }
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const times = (n: number, one: string, many = `${one}s`) => `${NUMBER[n] ?? n} ${n === 1 ? one : many}`;

/**
 * The parent's phone reads the same evening in words: one short line per tile, the app's name then its counts -
 * "Math Buddy - one set: 3 right, 1 slip, 1 the desk was not sure of, 1 skipped; 3 pages; 1 hint", "Linga - not tonight".
 * Built from recapRows' tiles only, so it carries what the picture carries and nothing more: counts and a lens
 * name, never a problem, a question, an answer or a verb form.
 */
export function recapLine(t: RecapTile): string {
  const name = BRAND[t.app];
  if (t.empty) return `${name} - ${t.empty.toLowerCase()}`;
  const parts: string[] = [];
  if (t.app === "maths") {
    if (t.sets.length) {
      const sum = (f: (x: MathsSet) => number) => t.sets.reduce((a, x) => a + f(x), 0);
      const right = sum((x) => x.right), unsure = sum((x) => x.unsure ?? 0), skipped = sum((x) => x.skipped ?? 0);
      const slips = sum((x) => slipsOf(x));
      const said = [`${right} right`];
      if (slips) said.push(counted(slips, "slip"));
      if (unsure) said.push(`${unsure} the desk was not sure of`);
      if (skipped) said.push(`${skipped} skipped`);
      parts.push(`${times(t.sets.length, "set")}: ${said.join(", ")}`);
    }
    if (t.pages) parts.push(counted(t.pages, "page"));
    if (t.hints) parts.push(t.second > 0 ? `${counted(t.hints, "hint")}, ${t.second} needed a second` : counted(t.hints, "hint"));
    return `${name} - ${parts.join("; ")}`;
  }
  if (t.app === "english") {
    const turns = t.talks.reduce((a, x) => a + x, 0);
    return `${name} - ${times(t.talks.length, "conversation")}, ${counted(turns, "reply", "replies")}`;
  }
  // Each count belongs to one reading, given in the order read; counts are never summed across readings. Past three
  // readings only the last three are listed, the same three the TV tile draws.
  const lenses = Array.from(new Set(t.readings.map((x) => x.lens))), one = lenses.length === 1;
  const last = t.readings.slice(-RECAP_READINGS), more = t.readings.length > last.length;
  const counts = last.map((x) => `${one ? "" : `${x.lens} `}${x.against} of ${x.of}`).join(", then ");
  const fixed = t.readings.reduce((a, x) => a + (x.fixed ?? 0), 0);
  const head = `${times(t.readings.length, "reading")}${one ? ` (${lenses[0]})` : ""}${more ? `, the last ${NUMBER[last.length]}` : ""}`;
  return `${name} - ${head}: ${counts} ${last.length === 1 && last[0].of === 1 ? "sentence" : "sentences"} to fix${fixed ? `, ${fixed} fixed tonight` : ""}`;
}

/**
 * The phone's Tonight list, for the parent's recap only (the TV stays one tile per app): how many of the learner's
 * own tasks are ticked, then the names of the ones still open, in the learner's own words - "Tonight's list - 1 of 3
 * done; still to do: Unit 6 · Essay draft" (a dot between, since a name may hold its own comma). The session's
 * tasks are the seated learner's (store.ts MathsSlot), so the list is this learner's. No tasks, no line.
 */
export function tasksLine(tasks: Task[] | undefined): string | null {
  const all = tasks ?? []; if (!all.length) return null;
  const open = all.filter((t) => !t.done).map((t) => t.name.trim()).filter(Boolean);
  const head = `Tonight's list - ${all.length - open.length} of ${all.length} done`;
  return open.length ? `${head}; still to do: ${open.join(" · ")}` : head;
}

/** The recap's stops: the tiles, left to right, then back to the desk. */
export type RecapStop = Subject | "desk";
export function recapStops(s: Session): RecapStop[] { return [...landingModules(s), "desk"]; }

/**
 * The paragraph in the session is the seated learner's (it travels with them, store.ts MathsSlot): when it has
 * sentences, Select on the essay tile opens it; else the lens home.
 */
export function ownReading(s: Session): boolean { return !!s.essay?.sentences?.length; }

/**
 * What Essay and Linga did tonight, as the counts the memory is written from (api/memory): the same history lines and
 * conversations recapRows reads, since local midnight, whatever apps the profile lists. Lens names and counts only -
 * never a sentence, a reply or a scene.
 */
export interface Evening { essay: Array<{ lens: string; sentences: number; before: number; after: number }>; linga: { conversations: number; replies: number } }
export function eveningOf(s: Session, now: number): Evening {
  const from = startOfDay(now), tonight = (at: number) => at >= from && at <= now;
  const essay: Evening["essay"] = [];
  for (const h of s.history ?? []) {
    if (h.kind !== "writing" || !tonight(h.at)) continue;
    const c = parseDetail(h.kind, h.detail);
    if (c.against !== undefined && c.of !== undefined) essay.push({ lens: h.label, sentences: c.of, before: c.against + (c.fixed ?? 0), after: c.against });
  }
  const talks = (s.englishLearning?.sessions ?? []).filter((x) => tonight(x.at));
  return { essay, linga: { conversations: talks.length, replies: talks.reduce((a, x) => a + x.turns, 0) } };
}
