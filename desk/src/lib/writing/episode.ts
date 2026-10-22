/**
 * One writing episode as plain data and pure steps: start > write > coached > revised > finished.
 * The client holds the episode between calls; every step checks the stage it comes from, so a step out of order is
 * refused with a desk sentence and changes nothing.
 */
import { ESSAY_PARAGRAPH_MAX_CHARS, LONG_SENTENCE_WORDS, paragraphStats, splitSentences } from "@/lib/rules/essay";
import { focusOf, type Focus } from "./coach";
import { promptById } from "./prompts";

export type Stage = "start" | "write" | "coached" | "revised" | "finished";

export interface Episode {
  stage: Stage;
  promptId?: string;
  draft?: string;
  note?: string;
  revision?: string;
  finishedAt?: number;
  /** Set when the episode finishes: the focus code picked for the draft, and whether the revision now meets it. */
  focus?: Focus;
  holds?: boolean;
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
  if (wordsOf(revision as string) === wordsOf(ep.draft ?? "")) return fail("Only spaces or punctuation changed. Change some of your words, then finish.");
  return { ok: true, episode: { ...ep, stage: "revised", revision: (revision as string).trim() } };
}

export function finished(ep: Episode, at: number): Step {
  if (ep.stage !== "revised" || !ep.draft || !ep.revision) return fail("Revise your paragraph once before you finish.");
  const focus = focusOf(ep.draft);
  return { ok: true, episode: { ...ep, stage: "finished", finishedAt: at, focus, holds: focusHolds(focus, ep.revision) } };
}

/** The words of a text alone: lower-cased, with spaces and punctuation gone, so a revision that only moves those is the same words. */
const wordsOf = (t: string): string => (t.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).join(" ");

/** Whether the coached focus now holds in `text`, read with the same counts that picked it (coach.focusOf). */
export function focusHolds(focus: Focus, text: string): boolean {
  const ss = splitSentences(text), st = paragraphStats(ss);
  if (focus === "length") return !ss.some((s) => s.words > LONG_SENTENCE_WORDS);
  if (focus === "claim") return st.claims > 0;
  if (focus === "link") return st.links > 0;
  return st.evidence > 0;
}

const NEEDS: Record<Focus, [holds: string, still: string]> = {
  claim: ["now states a claim", "still needs a claim"],
  evidence: ["now gives evidence", "still needs evidence"],
  link: ["now links back to the claim", "still needs a link back to the claim"],
  length: ["no longer has a sentence that is too long", "still has a sentence that is too long"],
};
const ON: Record<Focus, string> = { claim: "the claim", evidence: "evidence", link: "the link", length: "sentence length" };

/** The history line's second half; an episode that was never checked says so and claims no revision. */
export function checkLine(ep: Pick<Episode, "focus" | "holds">): string {
  if (!ep.focus || typeof ep.holds !== "boolean") return "coached; the revision was not checked";
  return `coached on ${ON[ep.focus]}; the revision ${NEEDS[ep.focus][ep.holds ? 0 : 1]}`;
}
