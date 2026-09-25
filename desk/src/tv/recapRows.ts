/**
 * The recap's pure rows: what each app on the desk did tonight, as counts a picture can draw, read straight off the
 * session - the dated history lines Math Buddy and Essay Master write (desk/mark.ts, api/read, desk/essay.ts) and
 * the conversations Linga records (englishLearning.sessions). Never a problem's text, a question or an answer: the
 * recap is ticks, rings, marks and arrows. Shared by the Recap screen (tv/screens.tsx) and the D-pad (tv/keys.ts),
 * so the tile drawn lit and the stop the keys walk are one list. Types only from the store: the TV never loads the
 * filesystem-backed session modules.
 */
import type { Session, Subject } from "@/lib/session/store";
import { ESSAY_TYPES } from "@/lib/library/lessons.data";
import { landingModules } from "@/tv/landingRows";

/** An app with nothing tonight says so in two words. */
export const RECAP_EMPTY = "Not tonight";

export interface MathsTile { app: "maths"; empty: string | null; sets: Array<{ right: number; of: number }>; pages: number; hints: number; second: number }
export interface LingaTile { app: "english"; empty: string | null; talks: number[] }
export interface EssayTile { app: "essay"; empty: string | null; readings: Array<{ lens: string; against: number; of: number }> }
export type RecapTile = MathsTile | LingaTile | EssayTile;

/** The counts a history line carries, by its kind; a line this does not know gives none, and nothing is guessed. */
export interface Detail { right?: number; of?: number; pages?: number; problems?: number; against?: number }
export function parseDetail(kind: string, detail: string): Detail {
  const d = (detail ?? "").trim();
  if (kind === "practice") { const m = /^(\d+) of (\d+) right$/.exec(d); if (m && +m[1] <= +m[2]) return { right: +m[1], of: +m[2] }; }
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
        if (c.right !== undefined && c.of !== undefined) sets.push({ right: c.right, of: c.of });
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
/** How many things tonight came back to look at together: the sets' slips and the readings' sentences to fix. */
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

/** The recap's stops: the tiles, left to right, then back to the desk. */
export type RecapStop = Subject | "desk";
export function recapStops(s: Session): RecapStop[] { return [...landingModules(s), "desk"]; }

/**
 * The paragraph in the session, when it is this learner's: their own history holds a reading through its lens
 * (the same test the landing's Essay Master card makes). Select on the essay tile opens it; else the lens home.
 */
export function ownReading(s: Session): boolean {
  const a = s.essay; if (!a?.sentences?.length) return false;
  const name = ESSAY_TYPES.find((t) => t.id === a.type)?.name ?? a.type;
  return (s.history ?? []).some((h) => h.kind === "writing" && h.label === name);
}
