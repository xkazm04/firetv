/**
 * What the session taught the desk about this learner.
 *
 * One to three plain sentences in the third person, written to be read back into a later prompt
 * — items.ts, explain.ts and hint.ts all carry them. So: prose, not JSON, not bullets, no
 * numbers the next session cannot check. The existing memory goes into the prompt so the desk
 * does not write the same sentence forty times.
 */
import { text } from "../engines/text";
import { topic } from "../library/syllabus";
import { addMemory, getLearner } from "../session/learners";
import { slip as slipById } from "../rules/maths";
import type { PracticeItem } from "../session/store";

const SCHEMA = {
  type: "object",
  properties: { lines: { type: "array", items: { type: "string" } } },
  required: ["lines"],
};

export async function writeMemory(
  learnerId: string,
  session: { topic?: string; items?: PracticeItem[]; hintsUsed?: number },
): Promise<string[]> {
  const existing = getLearner(learnerId).memory;
  const items = session.items ?? [];
  const t = session.topic ? topic(session.topic) : undefined;

  const rows = items.map((i) => {
    const s = i.slip ? slipById(i.slip) : undefined;
    return `${i.n}. ${i.question} — ${i.verdict ?? "not marked"}` +
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

  const prompt =
    `Topic worked on tonight: ${t?.name ?? session.topic ?? "unknown"}\n` +
    `Marked: ${right} right, ${wrong} wrong, ${unsure} the desk could not call.\n` +
    `Hints asked for: ${session.hintsUsed ?? 0}\n\n` +
    (rows ? `The set:\n${rows}\n\n` : "") +
    (existing.length ? `What you already noted about them — do not repeat any of it:\n${existing.map((m) => `- ${m}`).join("\n")}\n\n` : "") +
    `Write what tonight added. If tonight added nothing new, return an empty list.`;

  const { json } = await text<{ lines: string[] }>({ system, prompt, schema: SCHEMA, model: "fast" });
  const lines = (Array.isArray(json?.lines) ? json.lines : [])
    .filter((l): l is string => typeof l === "string")
    .map((l) => l.trim().replace(/^[-*\d.\s]+/, ""))
    .filter(Boolean)
    .slice(0, 3);
  for (const l of lines) addMemory(learnerId, l);
  return lines;
}
