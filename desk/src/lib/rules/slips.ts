/**
 * A slip's life at the desk, decided in code: a slip is set down when a child makes it, and rubbed out when they stop.
 *
 * Making a slip adds it to the record (newest last) and starts its count again. A USUAL right attempt on an item that
 * SHOWS a live slip - one the child could have made there, which `school.slipShows` pins to the desk's own check - counts
 * once toward holding it; the third such attempt since it was last made rubs it out. A right attempt on an item where the
 * slip does not show moves nothing, and so does an attempt that names no slip. Only school items carry what they show
 * (kinds.ts Attempt.shows), so a linear or Calculus topic never rubs a slip out; a step-up attempt never reaches this
 * module (learners.ts), so it never moves a slip or a count.
 *
 * Pure: no store, no learner file, no engine.
 */
import { SCHOOL_UNIT_SLIPS, slipShows } from "./school";

/** Usual right attempts on items that show a slip, since it was last made, that rub it out. */
export const HOLD_AT = 3;

/** A record's slips (newest last) and, for a live slip that has been held at least once, how many times. */
export interface SlipState { slips: string[]; held?: Record<string, number> }
/** One usual attempt: whether it was right, the slip it made (wrong only) and the slips its item shows (school items only). */
export interface SlipAttempt { right: boolean; slip?: string; shows?: readonly string[] }

/** The state after one usual attempt. A new state, never the old one changed; `held` is absent when no live slip has a count. */
export function stepSlips(prev: SlipState, a: SlipAttempt): SlipState {
  let slips = prev.slips;
  const held: Record<string, number> = {};
  for (const id of slips) if (prev.held && Object.prototype.hasOwnProperty.call(prev.held, id)) held[id] = prev.held[id];
  if (a.slip) {
    slips = [...slips.filter((s) => s !== a.slip), a.slip];
    delete held[a.slip];
  } else if (a.right && a.shows?.length) {
    for (const id of slips) {
      if (!a.shows.includes(id)) continue;
      const n = (held[id] ?? 0) + 1;
      if (n >= HOLD_AT) { slips = slips.filter((s) => s !== id); delete held[id]; } else held[id] = n;
    }
  }
  return Object.keys(held).length ? { slips, held } : { slips };
}

/** The slips of a school unit that an item of that unit shows, in the unit's own order; none for a topic that is not a school unit. */
export function slipsShown(topicId: unknown, spec: unknown): string[] {
  if (typeof topicId !== "string" || !Object.prototype.hasOwnProperty.call(SCHOOL_UNIT_SLIPS, topicId)) return [];
  return SCHOOL_UNIT_SLIPS[topicId].filter((id) => slipShows(spec, id));
}
