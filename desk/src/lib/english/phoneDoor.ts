import type { Role } from "@/lib/session/pairing";
import type { Session } from "@/lib/session/store";

/**
 * The door a phone's Linga command comes through (TL-12 H3): the TV drives Linga, the phone only answers what the TV asked.
 * A phone's command is taken when it carries the askId of an open hand-off of the kind that answers it, and refused
 * otherwise, before any work or model call. The TV and in-process callers (role tv or none) are never asked.
 *
 * Every action LingaPhone.tsx posts, and what the door does with it:
 *   turn, check-answer, check-task, moment-try  reply  (an answer: the hand-off is marked sent)
 *   capture with active true                    reply  (starts the microphone: gated, but not an answer)
 *   capture with active false                   always open: it only ever ends a capture (conversation.ts)
 *   plan-goal, plan-add, pitch                  words  (an answer)
 *   preferences                                 prefs  (an answer)
 *   lost-picture                                always open: a read for the phone to draw, it changes nothing
 * Any other action from a phone (the TV row's: start, cue, finish, plan-agree, level-self ...) is refused.
 */
export const PHONE_REFUSAL = "The TV is not asking for that now.";
const ANSWERS: Record<string, "reply" | "words" | "prefs"> = {
  turn: "reply", "check-answer": "reply", "check-task": "reply", "moment-try": "reply",
  "plan-goal": "words", "plan-add": "words", pitch: "words",
  preferences: "prefs",
};
export type Door = { ok: false } | { ok: true; ask?: NonNullable<Session["ask"]>; mark: boolean };

export function phoneDoor(role: Role | null, input: unknown, ask: Session["ask"]): Door {
  if (role === null || role === "tv") return { ok: true, mark: false };
  const o = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const action = o.action;
  if (action === "lost-picture" || (action === "capture" && o.active !== true)) return { ok: true, mark: false };
  const kind = action === "capture" ? "reply" : typeof action === "string" && Object.hasOwn(ANSWERS, action) ? ANSWERS[action] : null;
  if (!kind || !ask || ask.phase !== "open" || ask.kind !== kind || typeof o.askId !== "string" || o.askId !== ask.id) return { ok: false };
  return { ok: true, ask, mark: action !== "capture" };
}
