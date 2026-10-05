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

/** An app with nothing tonight says so in two words. */
export const RECAP_EMPTY = "Not tonight";

/** A marked set: `right` ticks, then `of - right - unsure` slips, then `unsure` items the desk could not decide. */
export interface MathsTile { app: "maths"; empty: string | null; sets: Array<{ right: number; of: number; unsure?: number }>; pages: number; hints: number; second: number }
export interface LingaTile { app: "english"; empty: string | null; talks: number[] }
export interface EssayTile { app: "essay"; empty: string | null; readings: Array<{ lens: string; against: number; of: number }> }
export type RecapTile = MathsTile | LingaTile | EssayTile;

/**
 * The counts a history line carries, by its kind; a line this does not know gives none, and nothing is guessed.
 * A practice line is "k of n right" (rules/maths rightLine), with ", u not sure" when the desk could not decide u
 * items; a line without it (every line written before it existed) gives no unsure count and draws as it always did.
 */
export interface Detail { right?: number; of?: number; unsure?: number; pages?: number; problems?: number; against?: number }
export function parseDetail(kind: string, detail: string): Detail {
  const d = (detail ?? "").trim();
  if (kind === "practice") {
    const m = /^(\d+) of (\d+) right(?:, (\d+) not sure)?$/.exec(d), u = m?.[3] ? +m[3] : 0;
    if (m && +m[1] + u <= +m[2]) return u ? { right: +m[1], of: +m[2], unsure: u } : { right: +m[1], of: +m[2] };
  }
  if (kind === "homework") { const m = /^(\d+) problems? read$/.exec(d); if (m) return { pages: 1, problems: +m[1] }; }
  if (kind === "writing") { const m = /^(\d+) of (\d+) sentences? to fix$/.exec(d); if (m && +m[1] <= +m[2]) return { against: +m[1], of: +m[2] }; }
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
        if (c.right !== undefined && c.of !== undefined) sets.push(c.unsure ? { right: c.right, of: c.of, unsure: c.unsure } : { right: c.right, of: c.of });
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
    for (const h of mine) { const c = parseDetail(h.kind, h.detail); if (c.against !== undefined && c.of !== undefined) readings.push({ lens: h.label, against: c.against, of: c.of }); }
    return { app, empty: mine.length ? null : RECAP_EMPTY, readings };
  });
}

const NUMBER = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
/**
 * How many things tonight came back to look at together: the sets' slips and the items the desk was not sure of
 * (both want talking through; the picture tells them apart), and the readings' sentences to fix.
 */
export function toLook(tiles: RecapTile[]): number {
  let n = 0;
  for (const t of tiles) {
    if (t.app === "maths") for (const x of t.sets) n += x.of - x.right;
    if (t.app === "essay") for (const x of t.readings) n += x.against;
  }
  return n;
}
/** The caption slot's one sentence. The picture carries the rest. */
export function recapCaption(tiles: RecapTile[]): string {
  if (tiles.every((t) => t.empty)) return "A quiet evening.";
  const n = toLook(tiles);
  return n ? `Good evening's work - ${NUMBER[n] ?? n} to look at together.` : "Good evening's work - all of it right.";
}

/** "1 hint", "3 hints": a count and its noun, the plural when it is not one. */
export function counted(n: number, one: string, many = `${one}s`): string { return `${n} ${n === 1 ? one : many}`; }
const times = (n: number, one: string, many = `${one}s`) => `${NUMBER[n] ?? n} ${n === 1 ? one : many}`;

/**
 * The parent's phone reads the same evening in words: one short line per tile, the app's name then its counts -
 * "Math Buddy - one set: 3 right, 1 slip, 2 the desk was not sure of; 3 pages; 1 hint", "Linga - not tonight".
 * Built from recapRows' tiles only, so it carries what the picture carries and nothing more: counts and a lens
 * name, never a problem, a question, an answer or a verb form.
 */
export function recapLine(t: RecapTile): string {
  const name = BRAND[t.app];
  if (t.empty) return `${name} - ${t.empty.toLowerCase()}`;
  const parts: string[] = [];
  if (t.app === "maths") {
    if (t.sets.length) {
      const right = t.sets.reduce((a, x) => a + x.right, 0), unsure = t.sets.reduce((a, x) => a + (x.unsure ?? 0), 0);
      const slips = t.sets.reduce((a, x) => a + x.of - x.right - (x.unsure ?? 0), 0);
      const said = [`${right} right`];
      if (slips) said.push(counted(slips, "slip"));
      if (unsure) said.push(`${unsure} the desk was not sure of`);
      parts.push(`${times(t.sets.length, "set")}: ${said.join(", ")}`);
    }
    if (t.pages) parts.push(counted(t.pages, "page"));
    if (t.hints) parts.push(counted(t.hints, "hint"));
    return `${name} - ${parts.join("; ")}`;
  }
  if (t.app === "english") {
    const turns = t.talks.reduce((a, x) => a + x, 0);
    return `${name} - ${times(t.talks.length, "conversation")}, ${counted(turns, "reply", "replies")}`;
  }
  const lenses = Array.from(new Set(t.readings.map((x) => x.lens)));
  const against = t.readings.reduce((a, x) => a + x.against, 0), of = t.readings.reduce((a, x) => a + x.of, 0);
  return `${name} - ${times(t.readings.length, "reading")}${lenses.length ? ` (${lenses.join(", ")})` : ""}: ${against} of ${counted(of, "sentence")} to fix`;
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
