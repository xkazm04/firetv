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
 * A Calculus item (one with a `spec`, rules/calc) is marked by CODE alone. For a set that carries specs the model is
 * asked only to READ the page - the final answer as plain text, the working line by line, a slip id from the topic's
 * list - never to solve and never for a verdict; a verdict or a solution it volunteers is never read. The verdict is
 * checkAnswer(spec, studentAnswer) (rules/maths settleSpec): right, wrong, or unsure when the answer cannot be read or
 * compared - ASK, and no attempt. The slip is code's own (sign, lost-constant) where it names one, else the model's
 * pick from the topic's vocabulary, only on a wrong item. A Calculus item has no pen position (locate reads linear lines).
 *
 * A school item (a `spec` of a school shape, rules/school; Family W5b: add and subtract fractions) is marked by CODE
 * the same way, with its own reading prompt: the model is asked for the child's final answer and working exactly as
 * written - a fraction, a mixed number, a decimal with its comma or point - never an expression in x, never a verdict,
 * a solution or a slip. The verdict is rules/school check(spec, studentAnswer, system), `system` being the seated
 * learner's school system (the route reads it; UK when none): unsure asks and records nothing. The slip is the one
 * code detects from the spec's operands, from the unit's closed list. Still one vision call per sheet.
 *
 * Nothing here ever puts the answer on screen, and no `said` line carries a value.
 */
import { vision } from "../engines/vision";
import { ASK, cleanValue as clean, isCalcSpec, locate, rightLine, settled, settleSpec, slipVocabulary, workingLines } from "../rules/maths";
import { DEFAULT_SCHOOL_SYSTEM, isSchoolSpec } from "../rules/school";
import { addHistory, recordAttempt } from "../session/learners";
import { topicIn } from "../library/paths";
import { degenerate, substitute, verify } from "./verify";
import type { Practice, PracticeItem, SchoolSystem } from "../session/store";

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

/** A Calculus page, read: what is written, and a slip pick. No verdict and no solution is asked for. */
const CALC_SCHEMA = {
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
          slip: { type: "string" },
        },
        required: ["n", "studentAnswer", "studentWorking", "slip"],
      },
    },
  },
  required: ["items"],
};

/** Only the fields the desk reads from a Calculus page: a `verdict` or `solution` the model adds is not among them. */
interface Read { n: number; studentAnswer: string; studentWorking: string; slip: string; }

function calcPrompt(practice: Practice, vocab: string): string {
  const sheet = practice.items.map((i) => `${i.n}. ${i.question}`).join("\n");
  return `This is a photo of a student's handwritten working on these ${practice.items.length} Calculus questions:\n${sheet}\n\n` +
    `Read the page. For each numbered item, report:\n` +
    `- n: the item number.\n` +
    `- studentAnswer: the final answer the student wrote, as plain text: an expression in x using ^ for powers, sqrt(), e^, ln, sin, cos and so on, ` +
    `or a number or a fraction. Include +C if they wrote it. Copy what they wrote; empty string if they wrote no final answer.\n` +
    `- studentWorking: their working transcribed exactly as written, one step per line (a newline between steps), or an empty string if there is none.\n` +
    `- slip: if you can see a mistake in their working, its id from this list, or the word "unclear" if you cannot tell or see none:\n${vocab}\n\n` +
    `Do not solve the questions and do not judge the answers - only read what is on the page. ` +
    `Plain text only, no LaTeX. Report every item, in order. Do not invent items that are not on the page.`;
}

/** A school page, read: what is written and nothing else. No slip is asked for: a school slip is detected by code. */
const SCHOOL_SCHEMA = {
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
        },
        required: ["n", "studentAnswer", "studentWorking"],
      },
    },
  },
  required: ["items"],
};

/** The reading prompt for a school sheet: the child's working and final answer as written, never an expression in x. */
export function schoolPrompt(practice: Practice): string {
  const sheet = practice.items.map((i) => `${i.n}. ${i.question}`).join("\n");
  return `This is a photo of a student's handwritten working on these ${practice.items.length} school maths questions:\n${sheet}\n\n` +
    `Read the page. For each numbered item, report:\n` +
    `- n: the item number.\n` +
    `- studentAnswer: the final answer the student wrote, copied exactly as written: a whole number, a fraction such as 5/12, ` +
    `a mixed number such as 1 5/12, or a decimal with the comma or point they used. Do not simplify, convert or correct it. ` +
    `Empty string if they wrote no final answer.\n` +
    `- studentWorking: their working transcribed exactly as written, one step per line (a newline between steps), or an empty string if there is none.\n\n` +
    `Do not solve the questions and do not judge the answers - only read what is on the page. ` +
    `Plain text only, no LaTeX. Report every item, in order. Do not invent items that are not on the page.`;
}

/**
 * `stillSame` is asked after the model answers, as explainItem asks `stillUnsure`: is this set still the one on the
 * desk, unmarked? When it is not (another set landed, the desk was reset), the verdicts are returned with
 * `landed: false` and nothing reaches the learner record - no attempt, no history line.
 */
export async function markSet(
  imageBase64: string,
  practice: Practice,
  learnerId: string,
  stillSame: () => boolean = () => true,
  /** The seated learner's school system, for reading a school item's answer (rules/school readNumber). UK when not given. */
  system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM,
): Promise<{ items: PracticeItem[]; provider: string; ms: number; unsure: number; landed: boolean }> {
  const vocab = slipVocabulary(practice.topic);
  // a set that carries specs is read by the model and marked by code; the spec's shape says which engine and which prompt
  if (practice.items.some((i) => isSchoolSpec(i.spec))) return markSchool(imageBase64, practice, learnerId, stillSame, system);
  if (practice.items.some((i) => isCalcSpec(i.spec))) return markCalc(imageBase64, practice, learnerId, stillSame, vocab);
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
  const attempts: { right: boolean; slip?: string }[] = [];
  const items: PracticeItem[] = practice.items.map((item) => {
    const m = byN.get(item.n);
    const studentAnswer = clean(m?.studentAnswer);
    const studentWorking = typeof m?.studentWorking === "string" ? m.studentWorking.trim() : "";
    const solution = clean(m?.solution);

    // 1 — the desk substitutes the model's own solution: can the model solve this item at all? An item any answer
    // satisfies (an identity, no x) is not one the arithmetic can settle, so it asks too.
    const truth = solution && !degenerate(item.question) ? verify(item.question, solution) : false;
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

    attempts.push({ right: verdict === "right", slip });
    // 8 - where the working broke: rules/maths locates it from the learner's own lines and a root found in code
    const slipAt = verdict === "wrong" ? locate(item.question, workingLines({ ...item, studentWorking, studentAnswer })) : undefined;
    return { ...item, studentAnswer, studentWorking, verdict, slip, said, ...(slipAt ? { slipAt } : {}) };
  });

  return land(practice, learnerId, stillSame, items, attempts, { provider, ms, unsure });
}

/** A Calculus set: the model reads the page, checkAnswer marks each item from its spec. */
async function markCalc(
  imageBase64: string,
  practice: Practice,
  learnerId: string,
  stillSame: () => boolean,
  vocab: string,
): Promise<{ items: PracticeItem[]; provider: string; ms: number; unsure: number; landed: boolean }> {
  const { json, provider, ms } = await vision<{ items: Read[] }>({ imageBase64, prompt: calcPrompt(practice, vocab), schema: CALC_SCHEMA });

  const byN = new Map<number, Read>();
  for (const m of json?.items ?? []) if (m && typeof m.n === "number") byN.set(m.n, m);

  let unsure = 0;
  const attempts: { right: boolean; slip?: string }[] = [];
  const items: PracticeItem[] = practice.items.map((item) => {
    const m = byN.get(item.n);
    // only what is written on the page is read: never a verdict, never a solution
    const studentAnswer = typeof m?.studentAnswer === "string" ? m.studentAnswer.trim() : "";
    const studentWorking = typeof m?.studentWorking === "string" ? m.studentWorking.trim() : "";
    // checkAnswer decides from the spec; unsure (blank, unreadable, not comparable, or no spec) asks and records nothing
    const s = settleSpec(item.n, item.spec, studentAnswer, m?.slip, practice.topic);
    if (!s) {
      unsure++;
      return { ...item, studentAnswer, studentWorking, verdict: "unsure" as const, said: ASK(item.n) };
    }
    attempts.push({ right: s.verdict === "right", slip: s.slip });
    // no pen position on a Calculus item: the Walk falls back to the answer line
    return { ...item, studentAnswer, studentWorking, verdict: s.verdict, slip: s.slip, said: s.said };
  });

  return land(practice, learnerId, stillSame, items, attempts, { provider, ms, unsure });
}

/** A school set: the model reads the page with the school prompt, rules/school check marks each item from its spec. */
async function markSchool(
  imageBase64: string,
  practice: Practice,
  learnerId: string,
  stillSame: () => boolean,
  system: SchoolSystem,
): Promise<{ items: PracticeItem[]; provider: string; ms: number; unsure: number; landed: boolean }> {
  const { json, provider, ms } = await vision<{ items: Read[] }>({ imageBase64, prompt: schoolPrompt(practice), schema: SCHOOL_SCHEMA });

  const byN = new Map<number, Read>();
  for (const m of json?.items ?? []) if (m && typeof m.n === "number") byN.set(m.n, m);

  let unsure = 0;
  const attempts: { right: boolean; slip?: string }[] = [];
  const items: PracticeItem[] = practice.items.map((item) => {
    const m = byN.get(item.n);
    // only the answer string it transcribed reaches the check: never a verdict, a solution or a slip the model adds
    const studentAnswer = typeof m?.studentAnswer === "string" ? m.studentAnswer.trim() : "";
    const studentWorking = typeof m?.studentWorking === "string" ? m.studentWorking.trim() : "";
    const s = settleSpec(item.n, item.spec, studentAnswer, undefined, practice.topic, system);
    if (!s) {
      unsure++;
      return { ...item, studentAnswer, studentWorking, verdict: "unsure" as const, said: ASK(item.n) };
    }
    attempts.push({ right: s.verdict === "right", slip: s.slip });
    return { ...item, studentAnswer, studentWorking, verdict: s.verdict, slip: s.slip, said: s.said };
  });

  return land(practice, learnerId, stillSame, items, attempts, { provider, ms, unsure });
}

/** Record a marked set once, and only while it is still the set on the desk. */
function land(
  practice: Practice,
  learnerId: string,
  stillSame: () => boolean,
  items: PracticeItem[],
  attempts: { right: boolean; slip?: string }[],
  run: { provider: string; ms: number; unsure: number },
): { items: PracticeItem[]; provider: string; ms: number; unsure: number; landed: boolean } {
  // 9 - the desk has moved on while the model read the page: the verdicts are not this set's to record
  if (!stillSame()) return { items, ...run, landed: false };

  // only settled items reach the record, each once, and only for the set still on the desk
  for (const a of attempts) recordAttempt(learnerId, practice.topic, a.right, a.slip);
  // what happened, in one line the home screen can read back: never invented, always these counts
  // (rules/maths; a later settle restates the same line from the same verdicts - session/store). The label is the
  // topic's name on whichever path it belongs to (topicIn), as session/store's restate reads it.
  addHistory(learnerId, {
    at: Date.now(), kind: "practice",
    label: topicIn(practice.topic)?.name ?? practice.topic,
    detail: rightLine(items),
  });

  return { items, ...run, landed: true };
}
