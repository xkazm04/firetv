/**
 * Who holds the Linga desk, and what the level check takes where it stands.
 *
 * A scene (s.conversation) and a level check (s.check) both live in the session and either can be half done. At most
 * one of them is live: the check is parked while a scene starts or resumes (LevelCheck.parked), and a live scene is
 * paused while a check opens, resumes or restarts. ownerOf names which one holds the phone; the server, the view, the
 * TV and the phone all ask it instead of picking a side by hand. A parked check is kept, never lost: home offers it
 * as "Carry on" once the scene is finished.
 *
 * The check also gets what the conversation got in turn.ts: where it stands is named once (checkState), CHECK_ACCEPTS
 * says which check commands each state takes, englishCommand refuses (409) whatever checkAccepts refuses, and the view
 * disables the same actions. A new check feature is a row in this table, not another stage guard.
 *
 * Pure data, no React and no filesystem: the server, the view, the TV and the phone all import it.
 */
import type { Session } from "../session/store";
import type { Conversation, LevelCheck } from "./types";

export type Owner = "check" | "conversation" | null;

/** The level check of the learner at the desk, if one is kept (live or parked). */
export function checkAt(s: Pick<Session, "check" | "learner">): LevelCheck | null { return s.check && s.check.learnerId === s.learner?.id ? s.check : null; }

/** The one that holds the phone now: an unparked check, else a scene not yet finished, else neither. */
export function ownerOf(s: Pick<Session, "check" | "learner" | "conversation">): Owner {
  const k = checkAt(s), c = s.conversation;
  if (k && !k.parked) return "check";
  return c && c.phase !== "finished" ? "conversation" : null;
}

/** A scene the learner can answer now: not finished, not paused. */
export const liveScene = (c: Conversation | null | undefined): c is Conversation => !!c && c.phase !== "finished" && !c.paused;

/** A scene as the check leaves it when it takes the desk: paused, as Leave does, so a late reply is dropped by its token. */
export const heldScene = (c: Conversation): Conversation => ({ ...c, pending: null, paused: true, capture: false, quizOpen: false });

/** A check as a starting scene leaves it: kept where it was, and no longer the phone's. */
export const parked = (k: LevelCheck): LevelCheck => k.parked ? k : { ...k, parked: true };

/** The states of the level check, in the order they are decided. A call in flight wins over the stage; a parked check waits for its turn. */
export const CHECK_STATES = ["reading", "parked", "about-empty", "about-asked", "tasks-between", "say", "listen", "choose", "verdict", "plan-goal", "plan-topics", "plan-empty"] as const;
export type CheckState = typeof CHECK_STATES[number];

/** The commands that act on a check already open. check-start, level-self, plan-propose and plan-open open or replace one and are not here. */
export const CHECK_COMMANDS = ["check-leave", "check-resume", "check-repeat", "check-retry", "check-reveal", "check-answer", "check-task", "plan-goal", "plan-swap", "plan-add", "plan-renew", "plan-agree"] as const;
export type CheckCommand = typeof CHECK_COMMANDS[number];
export function isCheckCommand(action: string): action is CheckCommand { return (CHECK_COMMANDS as readonly string[]).includes(action); }

export function checkState(k: LevelCheck): CheckState {
  if (k.pending) return "reading";
  if (k.parked) return "parked";
  if (k.stage === "about") return k.turns.length ? "about-asked" : "about-empty";
  if (k.stage === "tasks") return k.task ? k.task.kind : "tasks-between";
  if (k.stage === "verdict") return "verdict";
  return k.askGoal ? "plan-goal" : k.topics.length ? "plan-topics" : "plan-empty";
}

const KEPT = ["check-leave", "check-resume", "check-repeat"] as const;
/**
 * What each state takes. Leave, carry on and hear-again are harmless wherever the check is idle; while a call is in
 * flight only Leave and Repeat are taken (Leave drops the call). Retry asks again for what is missing: the first
 * question, the next task, the topics. The topic question takes only its answer; the topics take swap, add, renew
 * and agree; an empty plan takes add and renew as well, so the learner can ask for their own topic.
 */
export const CHECK_ACCEPTS: Record<CheckState, readonly CheckCommand[]> = {
  reading: ["check-leave", "check-repeat"],
  parked: KEPT,
  "about-empty": [...KEPT, "check-retry"],
  "about-asked": [...KEPT, "check-answer"],
  "tasks-between": [...KEPT, "check-retry"],
  say: [...KEPT, "check-task"],
  listen: [...KEPT, "check-task", "check-reveal"],
  choose: [...KEPT, "check-task"],
  verdict: KEPT,
  "plan-goal": [...KEPT, "plan-goal"],
  "plan-topics": [...KEPT, "plan-swap", "plan-add", "plan-renew", "plan-agree"],
  "plan-empty": [...KEPT, "check-retry", "plan-add", "plan-renew"],
};

export function checkAccepts(k: LevelCheck, action: string): boolean { return isCheckCommand(action) && CHECK_ACCEPTS[checkState(k)].includes(action); }

const BY_STATE: Partial<Record<CheckState, string>> = {
  reading: "Linga is still thinking. You can stop for now and come back.",
  parked: "Your conversation is on the desk. Finish it, then carry on with the level check.",
};
const BY_ACTION: Partial<Record<CheckCommand, string>> = {
  "check-retry": "There is nothing to try again here.",
  "check-reveal": "Only a listening task has words to show.",
  "check-task": "This task has changed. Answer the one on the TV.",
  "plan-goal": "Linga already knows what to plan for.",
  "plan-agree": "There are no topics to agree to yet.",
};

/** The sentence a refused command shows the learner: what the state asks for first, or what the command is missing. */
export function checkRefusal(k: LevelCheck, action: string): string {
  const state = checkState(k);
  if (BY_STATE[state]) return BY_STATE[state]!;
  if (action === "check-answer") return k.stage === "about" ? "Linga has not asked a question yet." : "The questions are done. Carry on with the tasks.";
  if (action === "plan-swap" || action === "plan-add" || action === "plan-renew") return k.stage !== "plan" ? "Find your level before choosing topics." : state === "plan-goal" ? "Say what you would like to practise first, or let Linga pick." : "There is no topic to change yet.";
  return BY_ACTION[action as CheckCommand] ?? "The level check does not take that now.";
}
