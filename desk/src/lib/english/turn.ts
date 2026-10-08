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
import type { Mode } from "../rules/mode";
import { forkOf, runningTake } from "./take";
import type { Conversation } from "./types";

/**
 * The states, in the order they are decided. A finished rehearsal is finished whatever else it holds; a reply in
 * flight wins over everything else, so a paused conversation with a pending reply is waiting (or still preparing
 * when there is no line yet); a scene with no line and nothing in flight is unprepared; a moment on screen wins over
 * paused, as the moment screen does; then paused, the coach, the recognition quiz, and the learner's turn. A finished
 * rehearsal with a Take Two running (v2 L4) is "take-two", or "waiting" while the cast's reply is on its way.
 */
export const TURN_STATES = ["finished", "take-two", "preparing", "waiting", "unprepared", "moment", "paused", "coaching", "quiz", "your-turn"] as const;
export type TurnState = typeof TURN_STATES[number];

/**
 * Every conversation command after the scene has started. "capture" is starting the phone's microphone. "cut" ends a
 * take with up to three notes (v2 L3): Adult mode only, so accepts() takes the mode. "take-two" plays one cut note's
 * beat again (v2 L4; not "replay", which is the coach's) and also takes the note; "take-end" ends that take early.
 */
export const TURN_ACTIONS = ["turn", "cue", "quiz", "choice", "coach", "replay", "capture", "pause", "resume", "repeat", "leave", "finish", "moment-done", "cut", "take-two", "take-end"] as const;
export type TurnAction = typeof TURN_ACTIONS[number];
export function isTurnAction(action: string): action is TurnAction { return (TURN_ACTIONS as readonly string[]).includes(action); }

export function turnState(c: Conversation): TurnState {
  if (c.phase === "finished") return !runningTake(c) ? "finished" : c.pending ? "waiting" : "take-two";
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
 * every live state takes it, but never one with a reply in flight: clearing that token threw the reply away. Cut
 * (Adult mode) works on the learner's own lines, so it is taken where a reply can stand: the learner's turn, the quiz
 * and a pause, never over a reply in flight, a moment or the coach. Take Two (Adult mode) starts from a finished take's
 * notes; inside it the learner says their line and the cast answers, and nothing else of the scene is offered: no Cut,
 * coach, replay, quiz, help, pause or finish. A reply in flight inside a take is "waiting", and Leave there cancels it.
 */
export const ACCEPTS: Record<TurnState, readonly TurnAction[]> = {
  finished: ["repeat", "take-two"],
  "take-two": ["turn", "capture", "repeat", "take-end"],
  preparing: ["leave", "repeat"],
  waiting: ["leave", "repeat"],
  unprepared: ["resume", "finish", "leave", "repeat"],
  moment: ["moment-done", "resume", "finish", "leave", "repeat"],
  paused: ["resume", "pause", "finish", "leave", "repeat", "cut"],
  coaching: ["replay", "pause", "resume", "finish", "leave", "repeat"],
  quiz: ["turn", "cue", "quiz", "choice", "coach", "capture", "pause", "resume", "finish", "leave", "repeat", "cut"],
  "your-turn": ["turn", "cue", "quiz", "coach", "capture", "pause", "resume", "finish", "leave", "repeat", "cut"],
};

/** Coaching and Cut work on a reply the learner gave: the one guard the table needs from the data. */
const hasReply = (c: Conversation) => c.turns.some(t => t.role === "learner");

/**
 * Why cut note `note` cannot have its Take Two, the state aside, or "" when it can: a take ended without a Cut, a note
 * that is not one of its notes, a note that already had its take, or one with no partner line before it.
 */
function noteRefusal(c: Conversation, note: unknown): string {
  const notes = c.cut?.notes ?? [];
  if (!notes.length) return "Take Two starts from a note at Cut, and this take has none.";
  if (typeof note !== "number" || !Number.isInteger(note) || note < 0 || note >= notes.length) return "Choose one of the notes on this take.";
  if (c.takes?.some(t => t.note === note)) return "This note has had its Take Two.";
  if (!forkOf(notes[note], c.turns)) return "This note has no line of the scene to go back to.";
  return "";
}

/**
 * `mode` is the learner's (rules/mode.ts modeOf); "cut" and "take-two" read it, and with none given both are refused.
 * `note` is the cut note a "take-two" plays again; no other action reads it.
 */
export function accepts(c: Conversation, action: string, mode?: Mode, note?: number): boolean {
  if (!isTurnAction(action) || !ACCEPTS[turnState(c)].includes(action)) return false;
  if (action === "cut") return mode === "adult" && hasReply(c);
  if (action === "take-two") return mode === "adult" && !noteRefusal(c, note);
  return action !== "coach" || hasReply(c);
}

const BY_STATE: Record<TurnState, string> = {
  finished: "This rehearsal has finished. Start a new situation.",
  "take-two": "Say your line again on your phone, or go back to the notes.",
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
  cut: "Say a line in the scene first; Cut gives notes on your own words.",
};

/** The sentence a refused action shows the learner: what the state asks for first, or what the action is missing. */
export function refusal(c: Conversation, action: string, mode?: Mode, note?: number): string {
  const state = turnState(c);
  if (action === "cut" && mode !== "adult") return "Cut is part of Adult mode.";
  if (action === "take-two") {
    if (mode !== "adult") return "Take Two is part of Adult mode.";
    if (state === "take-two") return "A take is already running. Finish it first.";
    if (state === "finished") return noteRefusal(c, note) || BY_STATE.finished;
    return state === "preparing" || state === "waiting" ? BY_STATE[state] : "Take Two starts from a note at Cut.";
  }
  if (action === "take-end" && !runningTake(c)) return "There is no take running.";
  if (action === "cut" && state === "paused") return BY_ACTION.cut!;
  return (state === "quiz" || state === "your-turn") && BY_ACTION[action as TurnAction] || BY_STATE[state];
}
