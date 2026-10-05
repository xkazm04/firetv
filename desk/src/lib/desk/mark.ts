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
 * A school item (a `spec` of a school shape, rules/school; Family W5b and W7: every school unit, fractions to mean and range) is marked by CODE
 * the same way, with its own reading prompt: the model is asked for the child's final answer and working exactly as
 * written - a fraction, a mixed number, a decimal with its comma or point - never an expression in x, never a verdict,
 * a solution or a slip. The verdict is rules/school check(spec, studentAnswer, system), `system` being the seated
 * learner's school system (the route reads it; UK when none): unsure asks and records nothing. The slip is the one
 * code detects from the spec's operands, from the unit's closed list. Still one vision call per sheet.
 *
 * An item of a set asked for as "a step up" (`stretch`, Family W8) is marked exactly as any other; only its attempt goes to
 * the learner's step-up record instead of the usual one (land -> recordAttempt). The history line is the same line.
 *
 * The decision itself - which kind an item is and whether the answer is right - is rules/kinds (judgeItem, judgeSet), shared
 * with the typed path: this file is the model's half (three reading prompts and schemas) and the one place a set lands.
 *
 * Nothing here ever puts the answer on screen, and no `said` line carries a value.
 */
import { vision } from "../engines/vision";
import { rightLine, slipVocabulary } from "../rules/maths";
import { DEFAULT_SCHOOL_SYSTEM } from "../rules/school";
import { judgeItem, judgeSet, kindOfSheet, type JudgeCtx, type Judged, type Read } from "../rules/kinds";
import { addDigest, addHistory, recordAttempt } from "../session/learners";
import { mathsEntry } from "../rules/digest";
import { topicIn } from "../library/paths";
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
    `a mixed number such as 1 5/12, a decimal with the comma or point they used, or a percentage with its % sign such as 37.5%, ` +
    `with any currency sign or unit they wrote beside it (€7.15, 45 kg); a ratio with its colon such as 2:3, or two amounts ` +
    `as they wrote them such as 24 and 36. Do not simplify, convert or correct it. ` +
    `Empty string if they wrote no final answer.\n` +
    `- studentWorking: their working transcribed exactly as written, one step per line (a newline between steps), or an empty string if there is none.\n\n` +
    `Do not solve the questions and do not judge the answers - only read what is on the page. ` +
    `Plain text only, no LaTeX. Report every item, in order. Do not invent items that are not on the page.`;
}

/** The linear reading prompt: the model's own value of x is asked for, as the trust gate in rules/kinds judgeItem needs it. */
function linearPrompt(practice: Practice, vocab: string): string {
  const sheet = practice.items.map((i) => `${i.n}. ${i.question}`).join("\n");
  return `This is a photo of a student's handwritten working on these ${practice.items.length} equations:\n${sheet}\n\n` +
    `For each numbered item, report:\n` +
    `- n: the item number.\n` +
    `- studentAnswer: the final value of x the student wrote, as a plain number or simple fraction. Empty string if they wrote none.\n` +
    `- studentWorking: their working transcribed exactly as written, one step per line (a newline between steps), or an empty string if there is none.\n` +
    `- verdict: "right" if you believe their final value is correct, "wrong" otherwise.\n` +
    `- solution: YOUR OWN value of x for that equation, worked out yourself, as a plain number or simple fraction.\n` +
    `- slip: the id of the mistake you think they made, chosen from this list, or the word "unclear" if you cannot tell:\n${vocab}\n\n` +
    `Plain text only, no LaTeX. Report every item, in order. Do not invent items that are not on the page.`;
}

/**
 * `stillSame` is asked after the model answers, as explainItem asks `stillUnsure`: is this set still the one on the
 * desk, unmarked? When it is not (another set landed, the desk was reset), the verdicts are returned with
 * `landed: false` and nothing reaches the learner record - no attempt, no history line.
 *
 * The sheet is READ by one prompt, chosen by the kinds on it (rules/kinds kindOfSheet: school, then Calculus, else linear),
 * and JUDGED item by item by each item's own kind (rules/kinds judgeSet): a mixed sheet is marked as its typed answers are.
 */
export async function markSet(
  imageBase64: string,
  practice: Practice,
  learnerId: string,
  stillSame: () => boolean = () => true,
  /** The seated learner's school system, for reading a school item's answer (rules/school readNumber). UK when not given. */
  system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM,
): Promise<MarkResult> {
  const kind = kindOfSheet(practice.items);
  const reading = kind === "school" ? { prompt: schoolPrompt(practice), schema: SCHOOL_SCHEMA }
    : kind === "calc" ? { prompt: calcPrompt(practice, slipVocabulary(practice.topic)), schema: CALC_SCHEMA }
    : { prompt: linearPrompt(practice, slipVocabulary(practice.topic)), schema: SCHEMA };
  const { json, provider, ms } = await vision<{ items: Read[] }>({ imageBase64, ...reading });

  // only what each reader asks for is read: never a verdict, and a solution only from the linear reading (the trust gate)
  const reads = (Array.isArray(json?.items) ? json.items : []).filter((m) => m && typeof m.n === "number").map((m): Read => ({
    n: m.n, studentAnswer: m.studentAnswer, studentWorking: m.studentWorking,
    ...(kind !== "school" ? { slip: m.slip } : {}),
    ...(kind === "linear" ? { solution: typeof m.solution === "string" ? m.solution : "" } : {}),
  }));
  return markReads(practice, learnerId, stillSame, reads, { topic: practice.topic, system }, { provider, ms });
}

/**
 * A set answered by typing (Family W6): the phone sends one string per question, in item order, and CODE marks each one
 * at once - no photo, no vision call, no model call of any kind (a test makes the vision and text engines throw). The
 * verdicts are the ones a photographed sheet's transcribed strings would get, because they come from the same judge
 * (rules/kinds judgeItem), item by item, whatever mix of kinds the set carries:
 *   - an item with a `spec` (school or Calculus) is settled by `settleSpec`, `system` being the seated learner's (the route
 *     reads it): a school answer by rules/school check, a Calculus one by checkAnswer, the slip being code's own where it
 *     names one, never a model's pick;
 *   - an item WITHOUT a spec (a linear equation the model wrote) is settled by `settle`, the substitution rule marking
 *     uses, from the typed value ("x = 4" and "4" are the same value; a value in x is not accepted). A photographed
 *     linear item needs the model's own solution to hold before its read of the page is trusted; a typed one has no model
 *     to trust, so the desk asks the same of the equation itself: it must be one the desk can solve in code (a single
 *     linear root, `rootOf`) and not an identity, else it is "not sure", never a guess.
 * A BLANK answer is unsure - "not sure", no verdict, never wrong, no attempt - exactly as the photo path treats an
 * answer the model read as empty. Junk that does not read is unsure the same way. The typed string is the item's
 * `studentAnswer`; there is no working and no pen position (`slipAt` is never set, so the sheet draws the answer line,
 * as it does for any item with an answer and no located slip).
 * Then the SAME `land`: one attempt per settled item, one history line, only while the set is still the one on the desk.
 */
export function markTyped(
  answers: readonly string[],
  practice: Practice,
  learnerId: string,
  stillSame: () => boolean = () => true,
  system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM,
): MarkResult {
  // what was typed, on one line: a stray newline or run of spaces is the keyboard's, not the child's
  const reads = practice.items.map((item, i): Read => ({ n: item.n, studentAnswer: typeof answers[i] === "string" ? oneLine(answers[i]) : "" }));
  return markReads(practice, learnerId, stillSame, reads, { topic: practice.topic, system, typed: true }, { provider: "code", ms: 0 });
}

/**
 * The ONE typed second go of a ringed item (route /api/second): the typed answer judged by the same judge marking uses
 * (rules/kinds judgeItem), in code and with no model, to a verdict - or null when the answer cannot be read (blank, or not
 * a value the desk can compare), so the go is not spent. Records nothing: a second go is practice, not evidence.
 */
export function secondGo(item: PracticeItem, answer: string, topic: string, system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM): "right" | "wrong" | null {
  return judgeItem(item, { studentAnswer: oneLine(answer) }, { topic, system })?.verdict ?? null;
}

/** What was typed, on one line: a control character (a newline, a tab) or a run of spaces is the keyboard's, not the child's. */
const oneLine = (t: string) => Array.from(t, (c) => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? " " : c)).join("").split(" ").filter(Boolean).join(" ");

/** The one way a set is marked: its reads judged item by item (rules/kinds), then landed once. */
function markReads(practice: Practice, learnerId: string, stillSame: () => boolean, reads: readonly Read[], ctx: JudgeCtx & { typed?: boolean }, run: { provider: string; ms: number }): MarkResult {
  return land(practice, learnerId, stillSame, judgeSet(practice, reads, ctx), run);
}

/** What a marked set comes back as: the items, which engine read it and how long, how many it asked about, and whether it reached the record. */
export type MarkResult = { items: PracticeItem[]; provider: string; ms: number; unsure: number; landed: boolean };

/** Record a marked set once, and only while it is still the set on the desk. */
function land(
  practice: Practice,
  learnerId: string,
  stillSame: () => boolean,
  judged: Judged,
  run: { provider: string; ms: number },
): MarkResult {
  const { items, attempts, unsure } = judged;
  // 9 - the desk has moved on while the model read the page: the verdicts are not this set's to record
  if (!stillSame()) return { items, ...run, unsure, landed: false };

  // only settled items reach the record, each once, and only for the set still on the desk
  // a step-up item's attempt goes to the step-up record only (learners.ts recordAttempt, Family W8)
  for (const a of attempts) recordAttempt(learnerId, practice.topic, a.right, a.slip, { stretch: a.stretch, tier: a.tier });
  // what happened, in one line the home screen can read back: never invented, always these counts
  // (rules/maths; a later settle restates the same line from the same verdicts - session/store). The label is the
  // topic's name on whichever path it belongs to (topicIn), as session/store's restate reads it.
  addHistory(learnerId, {
    at: Date.now(), kind: "practice",
    label: topicIn(practice.topic)?.name ?? practice.topic,
    detail: rightLine(items),
  });
  // ...and the week's digest (Family W9, rules/digest): one entry for this set - counts, the unit, the step-up flag and
  // the most frequent code-detected slip - never a question or an answer. An explanation that settles an item later
  // restates it in place (session/store restateMarked), as it restates the history line.
  addDigest(learnerId, mathsEntry(practice.topic, items, practice.stretch === true || items.some((i) => i.stretch === true), Date.now()));

  return { items, ...run, unsure, landed: true };
}
