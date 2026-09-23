/**
 * The marked sheet as rows: what the Sheet screen draws and the D-pad (tv/keys.ts) walks. Pure,
 * and types only from the store - the TV never loads the filesystem, and the store imports
 * `firstToLook` from here to land a marked set on its first slip.
 *
 * A tile is a number, a verdict and a slip id. It carries no question text, nothing the learner
 * wrote and no answer: the sheet is a picture of how the set went, and the walk is where an item
 * is read. The verdict is the one stored on the item (marking, or an explanation that settled it
 * later - rules/maths decides both); the sheet never recomputes it.
 */
import type { Practice, PracticeItem } from "@/lib/session/store";

export type SheetVerdict = NonNullable<PracticeItem["verdict"]>;
export interface SheetTile { n: number; verdict: SheetVerdict; slip?: string }
export type SheetStop = `item${number}` | "more" | "away";

export function sheetTiles(p: Practice): SheetTile[] {
  return p.items.map((it) => {
    const t: SheetTile = { n: it.n, verdict: it.verdict ?? "unsure" };
    if (it.slip) t.slip = it.slip;
    return t;
  });
}

/** One stop per tile, then the two actions: another set on this topic, and putting the sheet away. */
export function sheetStops(p: Practice): SheetStop[] {
  return [...p.items.map((_, i) => `item${i}` as SheetStop), "more", "away"];
}

/** The first item to look at (wrong, or not sure); with none, the "Six more" stop just past the tiles. */
export function firstToLook(items: readonly PracticeItem[]): number {
  const i = items.findIndex((it) => it.verdict !== "right");
  return i >= 0 ? i : items.length;
}

/** The tile index a stop names, or null for an action. */
export function tileOf(stop: SheetStop | undefined): number | null {
  return stop && stop.startsWith("item") ? Number(stop.slice(4)) : null;
}
