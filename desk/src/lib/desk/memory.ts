/**
 * What the session taught the desk about this learner.
 *
 * One to three plain sentences in the third person, written to be read back into a later prompt
 * — items.ts and explain.ts carry them, through notesBlock below (hint.ts does not). So: prose, not JSON, not bullets, no
 * numbers the next session cannot check. The existing memory goes into the prompt so the desk
 * does not write the same sentence forty times.
 */
import { text } from "../engines/text";
import { topicIn } from "../library/paths";
import { getLearner, saveLearner } from "../session/learners";
import { slip as slipById } from "../rules/maths";
import type { PracticeItem } from "../session/store";
import { askedText } from "../rules/calc-word";
import type { Evening } from "../../tv/recapRows";

const SCHEMA = {
  type: "object",
  properties: { lines: { type: "array", items: { type: "string" } } },
  required: ["lines"],
};

/** The learner's notes as every prompt that reads them back carries them (explain.ts, items.ts); empty when there are none. */
export function notesBlock(memory: readonly string[]): string {
  return memory.length ? `What the desk has learned about this student:\n${memory.map((m) => `- ${m}`).join("\n")}\n\n` : "";
}

export async function writeMemory(
  learnerId: string,
  session: { topic?: string; items?: PracticeItem[]; hintsUsed?: number } & Partial<Evening>,
): Promise<string[]> {
  const existing = getLearner(learnerId).memory;
  const items = session.items ?? [];
  const t = session.topic ? topicIn(session.topic) : undefined;

  const rows = items.map((i) => {
    const s = i.slip ? slipById(i.slip, session.topic) : undefined;
    return `${i.n}. ${askedText(i)} — ${i.verdict ?? "not marked"}` +
      (s ? ` (${s.id}: ${s.says})` : "") +
      (i.studentWorking ? ` — their working: ${i.studentWorking}` : "");
  }).join("\n");

  const right = items.filter((i) => i.verdict === "right").length;
  const wrong = items.filter((i) => i.verdict === "wrong").length;
  const unsure = items.filter((i) => i.verdict === "unsure").length;

  const system =
    "You keep a tutor's private notes on one student. You write one to three plain sentences in the third person about " +
    "this student — what they struggled with, what unstuck them, how they seem to like being taught. " +
    "Plain sentences that will be read back to you later, not JSON, not bullet points, no headings, no numbers or scores. " +
    "No LaTeX. Never write the student's name; call them 'they'. Say only what tonight actually showed.";

  // one section per app that had work tonight; counts, lens names and the closed slip vocabulary only
  const maths = items.length || session.hintsUsed
    ? `Topic worked on tonight: ${t?.name ?? session.topic ?? "unknown"}\n` +
      `Marked: ${right} right, ${wrong} wrong, ${unsure} the desk could not call.\n` +
      `Hints asked for: ${session.hintsUsed ?? 0}\n\n` + (rows ? `The set:\n${rows}\n\n` : "")
    : "";
  const essay = (session.essay ?? []).length
    ? `Essay Master tonight:\n${session.essay!.map((e) => `- a reading through the ${e.lens} lens: ${e.sentences} sentences read, ${e.before} to fix when read` +
      (e.after !== e.before ? `, ${e.after} after rewrites` : "")).join("\n")}\n\n`
    : "";
  const linga = session.linga?.conversations
    ? `Linga tonight: ${session.linga.conversations} English conversation${session.linga.conversations === 1 ? "" : "s"}, ${session.linga.replies} replies from them.\n\n`
    : "";

  const prompt =
    maths + essay + linga +
    (existing.length ? `What you already noted about them — do not repeat any of it:\n${existing.map((m) => `- ${m}`).join("\n")}\n\n` : "") +
    `Write what tonight added. If tonight added nothing new, return an empty list.`;

  const { json } = await text<{ lines: string[] }>({ system, prompt, schema: SCHEMA, model: "fast", thinking: false, use: "memory" });
  const lines = (Array.isArray(json?.lines) ? json.lines : [])
    .filter((l): l is string => typeof l === "string")
    .map((l) => l.trim().replace(/^[-*\d.\s]+/, ""))
    .filter(Boolean)
    .slice(0, 3);
  // WD10: the lines are added in ONE save (read fresh: the record may have moved while the model wrote), so a failed write keeps none and a Try again writes each once
  if (lines.length) { const l = getLearner(learnerId); saveLearner({ ...l, memory: [...l.memory, ...lines] }); }
  return lines;
}
