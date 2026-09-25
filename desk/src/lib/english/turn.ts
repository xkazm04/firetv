/**
 * Where a Linga conversation stands in its turn, named once, and what may happen there.
 *
 * A Conversation keeps its place in the turn as loose fields (pending, paused, moment, phase, quizOpen, turns).
 * turnState reads them in one fixed precedence; ACCEPTS says which conversation commands each state takes.
 * englishCommand refuses (409) whatever accepts() refuses, the view marks those actions disabled, and the phone and
 * the TV draw from the same answer. A new turn feature changes this table, not four chains of flags.
 *
 * Pure data, no React and no filesystem: the server, the view, the TV and the phone all import it.
 */
import type { Conversation } from "./types";

/**
 * The states, in the order they are decided. A finished rehearsal is finished whatever else it holds; a reply in
 * flight wins over everything else, so a paused conversation with a pending reply is waiting (or still preparing
 * when there is no line yet); a scene with no line and nothing in flight is unprepared; a moment on screen wins over
 * paused, as the moment screen does; then paused, the coach, the recognition quiz, and the learner's turn.
 */
export const TURN_STATES = ["finished", "preparing", "waiting", "unprepared", "moment", "paused", "coaching", "quiz", "your-turn"] as const;
export type TurnState = typeof TURN_STATES[number];

/** Every conversation command after the scene has started. "capture" is starting the phone's microphone. */
export const TURN_ACTIONS = ["turn", "cue", "quiz", "choice", "coach", "replay", "capture", "pause", "resume", "repeat", "leave", "finish", "moment-done"] as const;
export type TurnAction = typeof TURN_ACTIONS[number];
export function isTurnAction(action: string): action is TurnAction { return (TURN_ACTIONS as readonly string[]).includes(action); }

export function turnState(c: Conversation): TurnState {
  if (c.phase === "finished") return "finished";
  if (c.pending) return c.turns.length ? "waiting" : "preparing";
  if (!c.turns.length) return "unprepared";
  if (c.moment) return "moment";
  if (c.paused) return "paused";
  if (c.phase === "coaching") return "coaching";
  if (c.quizOpen) return "quiz";
  return "your-turn";
}

/**
 * What each state takes. Repeat audio is harmless everywhere. Leave cancels a reply in flight and keeps the scene
 * for later. Pause is a toggle, so a paused scene takes it too. Resume brings back a scene the learner left, so
 * every live state takes it, but never one with a reply in flight: clearing that token threw the reply away.
 */
export const ACCEPTS: Record<TurnState, readonly TurnAction[]> = {
  finished: ["repeat"],
  preparing: ["leave", "repeat"],
  waiting: ["leave", "repeat"],
  unprepared: ["resume", "finish", "leave", "repeat"],
  moment: ["moment-done", "resume", "finish", "leave", "repeat"],
  paused: ["resume", "pause", "finish", "leave", "repeat"],
  coaching: ["replay", "pause", "resume", "finish", "leave", "repeat"],
  quiz: ["turn", "cue", "quiz", "choice", "coach", "capture", "pause", "resume", "finish", "leave", "repeat"],
  "your-turn": ["turn", "cue", "quiz", "coach", "capture", "pause", "resume", "finish", "leave", "repeat"],
};

/** Coaching works on a reply the learner gave: the one guard the table needs from the data. */
const hasReply = (c: Conversation) => c.turns.some(t => t.role === "learner");

export function accepts(c: Conversation, action: string): boolean {
  if (!isTurnAction(action) || !ACCEPTS[turnState(c)].includes(action)) return false;
  return action !== "coach" || hasReply(c);
}

const BY_STATE: Record<TurnState, string> = {
  finished: "This rehearsal has finished. Start a new situation.",
  preparing: "The partner is preparing a reply. You can cancel and return later.",
  waiting: "The partner is preparing a reply. You can cancel and return later.",
  unprepared: "Prepare the scene before sending a reply.",
  moment: "Take in the moment on the TV, then carry on.",
  paused: "Resume the conversation first.",
  coaching: "Replay the coaching moment before replying.",
  quiz: "Return to the conversation first.",
  "your-turn": "Return to the conversation first.",
};
const BY_ACTION: Partial<Record<TurnAction, string>> = {
  coach: "Try a reply first; use a cue if you need help.",
  replay: "Ask for a coaching moment first.",
  choice: "Open Choose a phrase first.",
  "moment-done": "There is no moment on screen.",
};

/** The sentence a refused action shows the learner: what the state asks for first, or what the action is missing. */
export function refusal(c: Conversation, action: string): string {
  const state = turnState(c);
  return (state === "quiz" || state === "your-turn") && BY_ACTION[action as TurnAction] || BY_STATE[state];
}
