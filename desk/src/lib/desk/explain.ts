/**
 * The learner has said out loud how they got their answer. This is the reply - and, on an item the
 * desk was not sure about, the verdict.
 *
 * The transcript is rough — a child's voice, a room with a television in it — so the model reads
 * it charitably and answers the intent, not the words. The stance is hint.ts's: one or two
 * sentences that point at the step, never the answer. It may also name a slip, but only from the
 * topic's closed vocabulary, and the desk drops anything outside it.
 *
 * The model also transcribes the value the learner says they got. That is evidence, not a verdict:
 * rules/maths substitutes it into the question, exactly as marking does, and an unsure item settles
 * on what the substitution says. The model never decides right or wrong. Its reply is checked in code
 * for the answer (`leaks`) - a reply that gives it away is replaced by the item's own line.
 */
import { text } from "../engines/text";
import { ASK, leaks, settle, slipsFor, slipVocabulary, type Settled } from "../rules/maths";
import { topic } from "../library/syllabus";
import { getLearner, recordAttempt } from "../session/learners";
import type { PracticeItem } from "../session/store";

const SCHEMA = {
  type: "object",
  properties: { reply: { type: "string" }, slip: { type: "string" }, value: { type: "string" } },
  required: ["reply", "slip", "value"],
};

export async function explain(
  itemQuestion: string,
  transcript: string,
  topicId: string,
  learnerId: string,
): Promise<{ reply: string; slip?: string; value: string; provider: string; ms: number }> {
  const t = topic(topicId);
  const memory = getLearner(learnerId).memory;

  const system =
    `You are a maths tutor listening to a school student explain their own working out loud. ` +
    `Socratic rules, absolute: never state the final answer, never give the completed line, never say whether they are right or wrong. ` +
    `Point at the step they should look at again, or at the step that was the good one. ` +
    `One or two sentences. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.`;

  const prompt =
    `Topic: ${t?.name ?? topicId}\n${t?.blurb ?? ""}\n\n` +
    `The question: ${itemQuestion}\n\n` +
    `What the student said, transcribed from speech. The transcription may be rough or misheard — read it charitably ` +
    `and answer what they meant:\n«${transcript}»\n\n` +
    (memory.length ? `What the desk has learned about this student:\n${memory.map((m) => `- ${m}`).join("\n")}\n\n` : "") +
    `Reply to them in one or two sentences that point at the step, not the answer.\n\n` +
    `You may also name the mistake you heard, as an id from this list — or the word "unclear" if none of them fits ` +
    `or their reasoning was sound:\n${slipVocabulary(topicId)}\n\n` +
    `value: the final value of x the student says they got, written as a plain number or simple fraction (nine is 9, ` +
    `minus three is -3, seven halves is 7/2). Their value, not yours — do not work it out. An empty string if they did not say one.`;

  const { json, provider, ms } = await text<{ reply: string; slip: string; value: string }>({ system, prompt, schema: SCHEMA, model: "best" });
  const allowed = new Set(slipsFor(topicId).map((s) => s.id));
  const id = typeof json?.slip === "string" ? json.slip.trim() : "";
  return {
    reply: (typeof json?.reply === "string" ? json.reply : "").trim(),
    slip: allowed.has(id) ? id : undefined,
    value: typeof json?.value === "string" ? json.value.trim() : "",
    provider,
    ms,
  };
}

/**
 * What an explanation does to its item. `settled` is set only when the item was unsure and the spoken
 * value could be read: the substitution decided it, and the attempt went to the learner record once.
 * `reply` never carries a number the substitution accepts for the question.
 */
export interface Explained { reply: string; slip?: string; settled?: Settled; }

export async function explainItem(
  item: PracticeItem,
  transcript: string,
  topicId: string,
  learnerId: string,
  /** Is this item still on the walk, as it was, and still unsure? Asked after the model answers - the set may have moved on. */
  stillUnsure: () => boolean,
): Promise<Explained> {
  const heard = await explain(item.question, transcript, topicId, learnerId);
  const verdict = stillUnsure() ? settle(item, heard.value, heard.slip, topicId) : null;
  if (verdict) recordAttempt(learnerId, topicId, verdict.verdict === "right", verdict.slip);
  // the item's own line stands in for a reply that gives the answer away (or says nothing)
  const own = verdict?.said ?? item.said ?? ASK(item.n);
  const reply = heard.reply && !leaks(item.question, heard.reply) ? heard.reply : own;
  return { reply, slip: heard.slip, ...(verdict ? { settled: verdict } : {}) };
}
