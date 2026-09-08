/**
 * The learner has said out loud how they got their answer. This is the reply.
 *
 * The transcript is rough — a child's voice, a room with a television in it — so the model reads
 * it charitably and answers the intent, not the words. The stance is hint.ts's: one or two
 * sentences that point at the step, never the answer. It may also name a slip, but only from the
 * topic's closed vocabulary, and the desk drops anything outside it.
 */
import { text } from "../engines/text";
import { slipsFor, slipVocabulary } from "../rules/maths";
import { topic } from "../library/syllabus";
import { getLearner } from "../session/learners";

const SCHEMA = {
  type: "object",
  properties: { reply: { type: "string" }, slip: { type: "string" } },
  required: ["reply", "slip"],
};

export async function explain(
  itemQuestion: string,
  transcript: string,
  topicId: string,
  learnerId: string,
): Promise<{ reply: string; slip?: string; provider: string; ms: number }> {
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
    `or their reasoning was sound:\n${slipVocabulary(topicId)}`;

  const { json, provider, ms } = await text<{ reply: string; slip: string }>({ system, prompt, schema: SCHEMA, model: "best" });
  const allowed = new Set(slipsFor(topicId).map((s) => s.id));
  const id = typeof json?.slip === "string" ? json.slip.trim() : "";
  return {
    reply: (typeof json?.reply === "string" ? json.reply : "").trim(),
    slip: allowed.has(id) ? id : undefined,
    provider,
    ms,
  };
}
