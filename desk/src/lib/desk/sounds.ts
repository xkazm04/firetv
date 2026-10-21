/**
 * What the TV sounds for a session change, and which calm track plays under a screen (owner picks of audition A1,
 * desk/audio/audition). Pure, so a rule test can call it; the TV's player (tv/useDeskSound.ts) plays what it returns.
 *
 * A cue only marks something the screen already shows: the phone joined, a hint card landed, the break began, and on
 * the walk the verdict the card wears. Nothing sounds a verdict the screen withholds. The first session the TV sees
 * (a page load, a reconnect) sounds nothing: it is not a change. Music plays on the desk home and the break only; the
 * modules are silent so the voice and the thinking have the room (owner: "descope music inside each module").
 */
import type { Session } from "../session/store";

export type Cue = "select" | "back" | "paired" | "hint" | "right" | "again" | "break";
export type Track = "landing" | "break";

const hintText = (s: Session) => (s.screen === "hint" ? (s.hint?.stage === 2 ? s.hint.hint2?.hint : s.hint?.hint1?.hint) : undefined);

/** The verdict a walk card wears; 'unsure' and unmarked items have no sound. */
function walkCue(s: Session): Cue | undefined {
  const v = s.practice?.items?.[s.walkIx]?.verdict;
  return v === "right" ? "right" : v === "wrong" ? "again" : undefined;
}

/** One cue at most per change, the most important first. */
export function cueBetween(prev: Session | null | undefined, next: Session): Cue | undefined {
  if (!prev) return undefined;
  if (!prev.joined && next.joined) return "paired";
  if (next.screen === "break" && prev.screen !== "break") return "break";
  const hint = hintText(next);
  if (hint && hint !== hintText(prev)) return "hint";
  if (next.screen === "walk" && (prev.screen !== "walk" || prev.walkIx !== next.walkIx)) return walkCue(next);
  return undefined;
}

export function musicFor(s: Session): Track | undefined {
  return s.screen === "landing" ? "landing" : s.screen === "break" ? "break" : undefined;
}
