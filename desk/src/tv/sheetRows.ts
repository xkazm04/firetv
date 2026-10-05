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
export interface SheetTile { n: number; verdict: SheetVerdict; slip?: string; second?: "right" | "wrong" }
export type SheetStop = `item${number}` | "more" | "away";

export function sheetTiles(p: Practice): SheetTile[] {
  return p.items.map((it) => {
    const t: SheetTile = { n: it.n, verdict: it.verdict ?? "unsure" };
    if (it.slip) t.slip = it.slip;
    if (it.second) t.second = it.second;
    return t;
  });
}

/** One stop per tile, then the two actions: another set on this topic, and putting the sheet away. */
export function sheetStops(p: Practice): SheetStop[] {
  return [...p.items.map((_, i) => `item${i}` as SheetStop), "more", "away"];
}

/**
 * Still to look at: not right, and not fixed on its one second go (a ringed item whose typed second go held wears a tick). The
 * record keeps the first attempt; this is only what the desk still points at. A second go that missed is still to look at.
 */
export const toLookAt = (it: PracticeItem): boolean => it.verdict !== "right" && it.second !== "right";

/** How many items are still to look at (the sheet's head and the line under its actions). */
export const lookCount = (items: readonly PracticeItem[]): number => items.filter(toLookAt).length;

/** The first item to look at (wrong, or not sure, and not fixed); with none, the "Six more" stop just past the tiles. */
export function firstToLook(items: readonly PracticeItem[]): number {
  const i = items.findIndex(toLookAt);
  return i >= 0 ? i : items.length;
}

/**
 * The taped card's one sentence on a ringed item that has had its second go (null with none): a picture is already on the
 * paper, so this is the caption slot's few words. Never the answer, never a value.
 */
export function secondLine(it: Pick<PracticeItem, "verdict" | "second">): string | null {
  if (it.verdict !== "wrong" || !it.second) return null;
  return it.second === "right" ? "That one holds now. The ring stays, so you can see where it broke." : "Not yet. Say on the phone how you got there.";
}

/** The tile index a stop names, or null for an action. */
export function tileOf(stop: SheetStop | undefined): number | null {
  return stop && stop.startsWith("item") ? Number(stop.slice(4)) : null;
}
