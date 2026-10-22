/**
 * Writing on the TV (docs/concepts/TV-WRITING-SCREEN-2026-10-21.md): the pure rows the Writing screen draws and the D-pad
 * walks, and what Writing has waiting on the landing. One coached episode, the steps of lib/writing/episode: pick a
 * prompt on the TV, write the paragraph on the phone (the `writing` ask), read the one coaching note on the TV, revise
 * once on the phone, and the desk saves it to the learner's record (lib/writing/save). The episode is the session's
 * `writingTv`. Types only from the store: the TV never loads the filesystem-backed session modules.
 */
import type { Ask, Session } from "@/lib/session/store";
import { bandOf, learnerAge } from "@/lib/rules/voice";
import { promptById, promptsFor, WRITING_PROMPTS, type WritingPrompt } from "@/lib/writing/prompts";
import type { WaitKind } from "@/tv/landingRows";

/** Where the Writing screen is: the prompt list, then the chosen prompt waiting for the paragraph, coached, and saved. */
export type WritingPhase = "list" | "write" | "coached" | "finished";
/** A stop on the chosen prompt: hand the typing to the phone, or go back to the list for another prompt. */
export type WritingAction = "phone" | "another";

/** The prompts the TV offers the learner at the desk, by their band (the same list /api/writing/prompts gives). */
export function writingPrompts(s: Pick<Session, "profiles" | "learner">): WritingPrompt[] {
  return promptsFor(bandOf(learnerAge(s)));
}

export function writingPhase(s: Pick<Session, "writingTv">): WritingPhase {
  return s.writingTv ? s.writingTv.stage : "list";
}

/** The stops the D-pad walks on the Writing screen: a prompt id each on the list, the actions on the chosen prompt. */
export function writingStops(s: Pick<Session, "writingTv" | "profiles" | "learner">): string[] {
  const ph = writingPhase(s);
  if (ph === "list") return writingPrompts(s).map((p) => p.id);
  if (ph === "finished") return ["another"];
  return ["phone", "another"];
}

/** The writing hand-off open on this screen, or null: the TV's `writing` ask, opened from the Writing screen. */
export function writingAskOf(s: Pick<Session, "ask" | "screen">): Ask | null {
  const a = s.ask;
  return a && a.kind === "writing" && a.screen === "writing" && s.screen === "writing" ? a : null;
}

/** The three steps of an episode, for the progress line: how many are done. */
export const WRITING_STEPS = ["Write", "Coached", "Revised and saved"] as const;
export function writingDone(s: Pick<Session, "writingTv">): number {
  const ph = writingPhase(s);
  return ph === "finished" ? 3 : ph === "coached" ? 1 : 0;
}

/** The label of the phone action: what the phone will be asked for at this step. */
export function phoneActionLabel(s: Pick<Session, "writingTv">): string {
  return writingPhase(s) === "coached" ? "Revise it on your phone" : "Write it on your phone";
}

/**
 * The one line under the chosen prompt: what the TV is waiting for, in the words of the step. A hand-off open says
 * where the typing is and that Back cancels; no phone connected says so.
 */
export function writingLine(s: Pick<Session, "writingTv" | "ask" | "screen" | "phonesLive">): string {
  const ep = s.writingTv;
  if (!ep) return "Pick a prompt. You write the paragraph on your phone.";
  if (ep.busy) return ep.stage === "write" ? "The desk is reading your paragraph." : "The desk is saving your paragraph.";
  const a = writingAskOf(s);
  if (a && a.phase === "open") return s.phonesLive === 0 ? "No phone is connected. Pair one from the desk. Back cancels." : `On the phone: ${ep.stage === "coached" ? "your revision" : "your paragraph"}. Back cancels.`;
  if (ep.stage === "write") return "Write one paragraph on your phone. The desk reads it and gives you one note.";
  if (ep.stage === "coached") return "Read the note, then revise your paragraph once on your phone.";
  return ep.saved ? `Saved to your record: ${ep.saved}.` : "Saved to your record.";
}

// ---- the landing: what Writing has waiting ----

/** Writing on the landing: the same shape as the other apps' waiting things, read off the session only. */
export interface WritingWaiting {
  app: "writing"; kind: WaitKind; at: number | null;
  /** the prompt the episode on the desk is on, or the last one finished */
  title: string | null;
  /** how many episodes the history holds (a writing line whose label is a prompt's title) */
  done: number;
  line: string; empty: string | null;
}

const TITLES = new Set(WRITING_PROMPTS.map((p) => p.title));
export const WRITING_BLURB = "Write one paragraph on your phone and get one coaching note on the TV.";

export function writingWaiting(s: Pick<Session, "writingTv" | "history">): WritingWaiting {
  // Essay Master's readings are 'writing' lines too, labelled with a lens; an episode's line is labelled with its prompt
  const past = (s.history ?? []).filter((h) => h.kind === "writing" && TITLES.has(h.label));
  const last = past.at(-1) ?? null, ep = s.writingTv;
  const open = ep && ep.stage !== "finished" ? promptById(ep.promptId) : undefined;
  if (open) return { app: "writing", kind: "resume", at: null, title: open.title, done: past.length,
    line: ep!.stage === "coached" ? "Coached. Your revision is next." : "Picked. Your paragraph is next.", empty: null };
  if (last) return { app: "writing", kind: "last", at: last.at, title: last.label, done: past.length, line: `Last time: ${last.label} · ${last.detail}.`, empty: null };
  return { app: "writing", kind: "none", at: null, title: null, done: 0, line: WRITING_BLURB, empty: "Not started" };
}
