/**
 * Which lessons a learner has watched - read off their own history, never off the library - and the rule that says
 * a lesson was watched. Browser-safe: types only from the session modules, so Units and the calendar draw from it.
 *
 * The rule. The desk cannot see the video's play position: the lesson is a plain YouTube embed, and the desk's Pause
 * (lessonPaused) is its own flag the player never reports back to. So what the desk can observe stands in: a lesson
 * is watched when its screen has been open, unpaused, with its learner at the desk, for half the lesson's running
 * time - held to at least 30 seconds and at most two minutes. Half, so a lesson opened and left, or flicked past,
 * never ticks; the floor, so even a very short lesson takes a real look; the cap, because a lesson opens at the part
 * that matters (LessonPick.t) and that part is a stretch, not the whole video. A lesson the library has no running
 * time for takes the cap. Time on another screen, paused, or after a learner switch does not count (store.ts watch).
 * Ticks are claims, so they are earned: nothing else writes a lesson line.
 */
import type { HistoryEntry } from "../session/learners";
import { LESSONS, type Lesson } from "./lessons.data";

export const WATCH_FLOOR_MS = 30_000;
export const WATCH_CAP_MS = 120_000;

/** How long a lesson has to play before it counts as watched, from its running time in minutes. */
export function watchNeedMs(minutes?: number): number {
  const m = Number(minutes);
  if (!(m > 0)) return WATCH_CAP_MS;
  return Math.min(WATCH_CAP_MS, Math.max(WATCH_FLOOR_MS, m * 60_000 / 2));
}
/** The same, for a lesson by its library id. */
export const lessonNeedMs = (id: string): number => watchNeedMs(LESSONS.find((l) => l.id === id)?.minutes);

/**
 * The lesson on screen as it plays (store.ts keeps it in the session): which lesson, whose, how long it had played
 * before the stretch now running, and since when that stretch runs (null while it is not playing). `logged` once its
 * history line is written, so a lesson played on is written once.
 */
export interface Watch { id: string; owner: string; ms: number; since: number | null; logged: boolean }
/** How long the watch has played by `now`: the stretches before, and the one running. */
export function playedMs(w: Watch, now: number): number { return w.ms + (w.since === null ? 0 : Math.max(0, now - w.since)); }
/** The watch has played long enough and has no line yet. */
export function watchDue(w: Watch | null | undefined, now: number): boolean {
  return !!w && !w.logged && playedMs(w, now) >= lessonNeedMs(w.id);
}

/** The lessons this history holds a watched line for, by id. */
export function watchedIds(history: readonly HistoryEntry[] | undefined): Set<string> {
  return new Set((history ?? []).filter((h) => h.kind === "lesson" && !!h.ref).map((h) => h.ref!));
}

/**
 * Where a learner is in a list of lessons, from their history: done (watched), next (the first not watched), open,
 * and later - lessons more than one past next, once something has been watched. With nothing watched every lesson
 * is open and the first is next: the desk has no record to place her by, so it claims none.
 */
export type LessonState = "done" | "next" | "open" | "later";
export function lessonStates(list: readonly Lesson[], history: readonly HistoryEntry[] | undefined): LessonState[] {
  const seen = watchedIds(history), next = list.findIndex((l) => !seen.has(l.id)), any = list.some((l) => seen.has(l.id));
  return list.map((l, i) => (seen.has(l.id) ? "done" : i === next ? "next" : any && i > next + 1 ? "later" : "open"));
}
