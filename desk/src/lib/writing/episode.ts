/**
 * One writing episode as plain data and pure steps: start > write > coached > revised > finished.
 * The client holds the episode between calls; every step checks the stage it comes from, so a step out of order is
 * refused with a desk sentence and changes nothing.
 */
import { ESSAY_PARAGRAPH_MAX_CHARS, splitSentences } from "@/lib/rules/essay";
import { promptById } from "./prompts";

export type Stage = "start" | "write" | "coached" | "revised" | "finished";

export interface Episode {
  stage: Stage;
  promptId?: string;
  draft?: string;
  note?: string;
  revision?: string;
  finishedAt?: number;
}

export type Step = { ok: true; episode: Episode } | { ok: false; error: string };

/** A paragraph needs at least this many sentences before it is coached. */
export const MIN_SENTENCES = 2;
export const START: Episode = { stage: "start" };

const fail = (error: string): Step => ({ ok: false, error });

/** Why a paragraph cannot be sent yet, as a line for the learner; null when it can. */
export function draftProblem(text: unknown): string | null {
  if (typeof text !== "string" || !text.trim()) return "Write your paragraph first, then send it.";
  if (text.length > ESSAY_PARAGRAPH_MAX_CHARS) return `That paragraph is longer than ${ESSAY_PARAGRAPH_MAX_CHARS} characters. Shorten it and send again.`;
  if (splitSentences(text).length < MIN_SENTENCES) return `Write at least ${MIN_SENTENCES} sentences, then send it.`;
  return null;
}

export function pick(ep: Episode, promptId: unknown): Step {
  if (ep.stage !== "start") return fail("This episode has already begun.");
  const p = promptById(promptId);
  if (!p) return fail("The desk does not know that prompt. Pick one from the list.");
  return { ok: true, episode: { stage: "write", promptId: p.id } };
}

export function coached(ep: Episode, draft: unknown, note: string): Step {
  if (ep.stage !== "write") return fail("A paragraph is coached once, after a prompt is picked.");
  const problem = draftProblem(draft);
  if (problem) return fail(problem);
  return { ok: true, episode: { ...ep, stage: "coached", draft: (draft as string).trim(), note } };
}

export function revised(ep: Episode, revision: unknown): Step {
  if (ep.stage !== "coached") return fail("Revise after the coaching note.");
  const problem = draftProblem(revision);
  if (problem) return fail(problem);
  if ((revision as string).trim() === ep.draft) return fail("Change something in your paragraph before you finish.");
  return { ok: true, episode: { ...ep, stage: "revised", revision: (revision as string).trim() } };
}

export function finished(ep: Episode, at: number): Step {
  if (ep.stage !== "revised") return fail("Revise your paragraph once before you finish.");
  return { ok: true, episode: { ...ep, stage: "finished", finishedAt: at } };
}
