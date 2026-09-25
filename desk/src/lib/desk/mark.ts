/**
 * Mark one photo of the whole worked set — then re-check the marker.
 *
 * The vision model reads the handwriting and offers a verdict. That is evidence, not the mark. `verify` is the
 * truth: it substitutes the model's own solution into the question, and the student's answer too.
 * When the desk can check, it decides: if the model's own solution holds (the model can solve the item, so its
 * read of the page is trusted) and the student's answer substitutes cleanly (it reads as a number and the
 * question evaluates, so it plainly holds or plainly fails), the substitution is the verdict, and a model verdict
 * that disagrees with it is overruled. When the desk cannot check, it says nothing — it asks ("not sure"): the
 * model's solution does not hold, or the student's answer is missing or does not read as a number. The model
 * reports no confidence in its read, so an answer that does not parse is the only doubtful-read signal there is.
 * A wrong guess in front of a child costs more than a question does; so does a question about an item the
 * arithmetic has already settled. (S50: this replaces "when they disagree the desk does not pick a winner".)
 *
 * Nothing here ever puts the answer on screen, and no `said` line carries a value.
 */
import { vision } from "../engines/vision";
import { ASK, cleanValue as clean, locate, rightLine, settled, slipVocabulary, workingLines } from "../rules/maths";
import { addHistory, recordAttempt } from "../session/learners";
import { topic as topicById } from "../library/syllabus";
import { substitute, verify } from "./verify";
import type { Practice, PracticeItem } from "../session/store";

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          n: { type: "integer" },
          studentAnswer: { type: "string" },
          studentWorking: { type: "string" },
          verdict: { type: "string", enum: ["right", "wrong"] },
          solution: { type: "string" },
          slip: { type: "string" },
        },
        required: ["n", "studentAnswer", "studentWorking", "verdict", "solution", "slip"],
      },
    },
  },
  required: ["items"],
};

interface Marked {
  n: number; studentAnswer: string; studentWorking: string;
  verdict: "right" | "wrong"; solution: string; slip: string;
}


export async function markSet(
  imageBase64: string,
  practice: Practice,
  learnerId: string,
): Promise<{ items: PracticeItem[]; provider: string; ms: number; unsure: number }> {
  const vocab = slipVocabulary(practice.topic);
  const sheet = practice.items.map((i) => `${i.n}. ${i.question}`).join("\n");

  const { json, provider, ms } = await vision<{ items: Marked[] }>({
    imageBase64,
    prompt:
      `This is a photo of a student's handwritten working on these ${practice.items.length} equations:\n${sheet}\n\n` +
      `For each numbered item, report:\n` +
      `- n: the item number.\n` +
      `- studentAnswer: the final value of x the student wrote, as a plain number or simple fraction. Empty string if they wrote none.\n` +
      `- studentWorking: their working transcribed exactly as written, one step per line (a newline between steps), or an empty string if there is none.\n` +
      `- verdict: "right" if you believe their final value is correct, "wrong" otherwise.\n` +
      `- solution: YOUR OWN value of x for that equation, worked out yourself, as a plain number or simple fraction.\n` +
      `- slip: the id of the mistake you think they made, chosen from this list, or the word "unclear" if you cannot tell:\n${vocab}\n\n` +
      `Plain text only, no LaTeX. Report every item, in order. Do not invent items that are not on the page.`,
    schema: SCHEMA,
  });

  const byN = new Map<number, Marked>();
  for (const m of json?.items ?? []) if (m && typeof m.n === "number") byN.set(m.n, m);

  let unsure = 0;
  const items: PracticeItem[] = practice.items.map((item) => {
    const m = byN.get(item.n);
    const studentAnswer = clean(m?.studentAnswer);
    const studentWorking = typeof m?.studentWorking === "string" ? m.studentWorking.trim() : "";
    const solution = clean(m?.solution);

    // 1 — the desk substitutes the model's own solution: can the model solve this item at all?
    const truth = solution ? verify(item.question, solution) : false;
    // 2 — and the student's answer: true or false when it substitutes cleanly, null when it cannot be substituted.
    const student = studentAnswer ? substitute(item.question, studentAnswer) : null;

    // 3 — the model cannot solve its own question, so its read of the page is worth nothing here.
    // 4 — no answer, or one that does not read as a number: there is nothing to substitute, and the desk does not guess.
    if (!truth || student === null) {
      unsure++;
      return { ...item, studentAnswer, studentWorking, verdict: "unsure" as const, said: ASK(item.n) };
    }

    // 5 — both substitute, so the arithmetic decides; a model verdict that disagrees is overruled. 6 & 7 — rules/maths
    // settles it (the same rule an explanation uses): a slip only on a wrong item and only from this topic's vocabulary,
    // never a value.
    const { verdict, slip, said } = settled(item.n, student, m?.slip, practice.topic);

    recordAttempt(learnerId, practice.topic, verdict === "right", slip);
    // 8 - where the working broke: rules/maths locates it from the learner's own lines and a root found in code
    const slipAt = verdict === "wrong" ? locate(item.question, workingLines({ studentWorking, studentAnswer })) : undefined;
    return { ...item, studentAnswer, studentWorking, verdict, slip, said, ...(slipAt ? { slipAt } : {}) };
  });

  // what happened, in one line the home screen can read back: never invented, always these counts
  // (rules/maths; a later settle restates the same line from the same verdicts - session/store)
  addHistory(learnerId, {
    at: Date.now(), kind: "practice",
    label: topicById(practice.topic)?.name ?? practice.topic,
    detail: rightLine(items),
  });

  return { items, provider, ms, unsure };
}
