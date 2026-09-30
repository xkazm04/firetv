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
 *
 * A Calculus item (one with a `spec`) is heard the same way, spoken to as a first-year university student on the
 * Calculus 1 course: the model transcribes the final answer they say they got (an expression or a number, as plain
 * text), rules/calc checkAnswer settles an unsure item from it (rules/maths settleSpec), and the reply is checked
 * with leaksCalc(spec, reply). Only a spec of a Calculus SHAPE is a Calculus item.
 *
 * A school item (a spec of a school shape, rules/school; Family W5b and W7: every school unit, fractions to mean and range) takes the school
 * stance with the learner's age voice, exactly the school system prompt; the model transcribes the answer they say as
 * figures (a fraction, a mixed number, a decimal), rules/school check settles an unsure item from it by the learner's
 * school system (rules/maths settleSpec), the slip is only the one code detects (the model is not asked for one, and a
 * wrong item is never renamed from the conversation), and the reply is checked with leaksSchool(spec, reply).
 */
import { text } from "../engines/text";
import { ASK, isCalcSpec, leaks, settle, settled, settleSpec, slipsFor, slipVocabulary, type Settled } from "../rules/maths";
import { leaksCalc } from "../rules/calc";
import { DEFAULT_SCHOOL_SYSTEM, isSchoolSpec, leaksSchool } from "../rules/school";
import { voiceOf, withManner } from "../rules/voice";
import { topic } from "../library/syllabus";
import { PATHS, topicIn } from "../library/paths";
import { getLearner, recordAttempt } from "../session/learners";
import type { PracticeItem, SchoolSystem } from "../session/store";

const SCHEMA = {
  type: "object",
  properties: { reply: { type: "string" }, slip: { type: "string" }, value: { type: "string" } },
  required: ["reply", "slip", "value"],
};

/** The withholding rule of every explanation reply: the school prompt and the Calculus prompt share it, in every voice. */
export const EXPLAIN_WITHHOLD = "Socratic rules, absolute: never state the final answer, never give the completed line, never say whether they are right or wrong.";

export async function explain(
  itemQuestion: string,
  transcript: string,
  topicId: string,
  learnerId: string,
  /** The item is a Calculus one: the university stance, and the final answer as an expression or a number. */
  calc = false,
  /** The seated profile's age. Only the school stance is age-voiced (rules/voice); without an age it is today's text. */
  age?: number,
): Promise<{ reply: string; slip?: string; value: string; provider: string; ms: number }> {
  if (calc) return explainCalc(itemQuestion, transcript, topicId, learnerId);
  const t = topic(topicId);
  const memory = getLearner(learnerId).memory;

  const system = schoolSystem(age);

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

  return heard(await text<{ reply: string; slip: string; value: string }>({ system, prompt, schema: SCHEMA, model: "best" }), topicId);
}

/** The school stance, in the learner's age voice (rules/voice): the linear items' and the school units' system prompt, one text. */
const schoolSystem = (age?: number) => withManner(
  `You are a maths tutor listening to a school student explain their own working out loud. ` +
  `${EXPLAIN_WITHHOLD} ` +
  `Point at the step they should look at again, or at the step that was the good one. ` +
  `One or two sentences. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.`,
  voiceOf("maths", age));

const SCHOOL_SCHEMA = {
  type: "object",
  properties: { reply: { type: "string" }, value: { type: "string" } },
  required: ["reply", "value"],
};

/**
 * A school unit's item heard (Family W5b): the school stance and voice, the unit from topicIn, the answer said as
 * figures. No slip is asked for: a school slip is detected by code from the spec, never named by a model.
 */
export async function explainSchool(
  itemQuestion: string,
  transcript: string,
  topicId: string,
  learnerId: string,
  age?: number,
): Promise<{ reply: string; slip?: string; value: string; provider: string; ms: number }> {
  const t = topicIn(topicId);
  const memory = getLearner(learnerId).memory;
  const prompt =
    `Topic: ${t?.name ?? topicId}\n${t?.blurb ?? ""}\n\n` +
    `The question: ${itemQuestion}\n\n` +
    `What the student said, transcribed from speech. The transcription may be rough or misheard — read it charitably ` +
    `and answer what they meant:\n«${transcript}»\n\n` +
    (memory.length ? `What the desk has learned about this student:\n${memory.map((m) => `- ${m}`).join("\n")}\n\n` : "") +
    `Reply to them in one or two sentences that point at the step, not the answer.\n\n` +
    `value: the final answer the student says they got, written in figures as they said it: a whole number, a fraction, ` +
    `a mixed number, a decimal or a percentage (eleven twelfths is 11/12, one and five twelfths is 1 5/12, nought point five is 0.5, ` +
    `thirty-five percent is 35%), with a currency sign if they said one (seven euros fifteen is €7.15); a ratio with its colon ` +
    `(two to three is 2:3) and two amounts joined by and (twenty-four and thirty-six is 24 and 36). ` +
    `Their answer, not yours — do not work it out and do not simplify it. An empty string if they did not say one.`;
  const { json, provider, ms } = await text<{ reply: string; value: string }>({ system: schoolSystem(age), prompt, schema: SCHOOL_SCHEMA, model: "best" });
  return {
    reply: (typeof json?.reply === "string" ? json.reply : "").trim(),
    value: typeof json?.value === "string" ? json.value.trim() : "",
    provider,
    ms,
  };
}

/** A Calculus item heard: the university stance, the calc1 topic from topicIn, the answer as an expression or a number. */
async function explainCalc(
  itemQuestion: string,
  transcript: string,
  topicId: string,
  learnerId: string,
): Promise<{ reply: string; slip?: string; value: string; provider: string; ms: number }> {
  const t = topicIn(topicId);
  const memory = getLearner(learnerId).memory;

  const system =
    `You are a calculus tutor listening to a first-year university student on the ${PATHS.calc1.name} course explain their own working out loud. ` +
    `${EXPLAIN_WITHHOLD} ` +
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
    `value: the final answer the student says they got, as plain text - an expression in x using ^ for powers, sqrt(), ` +
    `e^, ln, sin, cos and so on, or a number or a fraction (six x plus two is 6x + 2, minus three is -3, seven halves is ` +
    `7/2, x squared plus C is x^2 + C; include +C if they say it). Their answer, not yours — do not work it out. ` +
    `An empty string if they did not say one.`;

  return heard(await text<{ reply: string; slip: string; value: string }>({ system, prompt, schema: SCHEMA, model: "best" }), topicId);
}

/** What was heard, as the desk keeps it: a slip only from the topic's list. */
function heard(
  { json, provider, ms }: { json: { reply: string; slip: string; value: string } | null | undefined; provider: string; ms: number },
  topicId: string,
): { reply: string; slip?: string; value: string; provider: string; ms: number } {
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
 * `renamed` is set only when the item was already wrong and the model named a slip from this topic's
 * vocabulary (the same `settled` rule marking uses): the item's shown slip and line follow the conversation.
 * Its verdict, its pen (`slipAt`) and the learner record are left as they were.
 */
export interface Explained { reply: string; slip?: string; settled?: Settled; renamed?: { slip: string; said: string }; }

export async function explainItem(
  item: PracticeItem,
  transcript: string,
  topicId: string,
  learnerId: string,
  /** Is this item still on the walk, as it was, and still unsure? Asked after the model answers - the set may have moved on. */
  stillUnsure: () => boolean,
  /** The seated profile's age (the route reads it); optional, so a call without one speaks as it always has. */
  age?: number,
  /** The seated profile's school system, for reading a school item's answer (the route reads it); UK when not given. */
  system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM,
): Promise<Explained> {
  // the spec's shape says which engine: a Calculus shape is a Calculus item, a school shape a school unit's item
  const calc = isCalcSpec(item.spec), school = isSchoolSpec(item.spec);
  const h = school ? await explainSchool(item.question, transcript, topicId, learnerId, age) : await explain(item.question, transcript, topicId, learnerId, calc, age);
  // an item with a spec settles by its engine's check (null when unsure); a linear item by substitution
  const verdict = !stillUnsure() ? null
    : calc || school ? settleSpec(item.n, item.spec, h.value, h.slip, topicId, system)
    : settle(item, h.value, h.slip, topicId);
  // a step-up item (Family W8) settles onto the step-up record only, as marking does
  if (verdict) recordAttempt(learnerId, topicId, verdict.verdict === "right", verdict.slip, { stretch: item.stretch === true, tier: item.tier });
  // an item already wrong: the slip the conversation found replaces the marker's, when the rulebook has it (no verdict,
  // no record) - never on a school item, whose slip only code detects
  const named = !verdict && !school && item.verdict === "wrong" && h.slip ? settled(item.n, false, h.slip, topicId) : null;
  // the item's own line stands in for a reply that gives the answer away (or says nothing)
  const own = verdict?.said ?? item.said ?? ASK(item.n);
  const gives = calc ? leaksCalc(item.spec, h.reply) : school ? leaksSchool(item.spec, h.reply) : leaks(item.question, h.reply);
  const reply = h.reply && !gives ? h.reply : own;
  return { reply, slip: h.slip, ...(verdict ? { settled: verdict } : {}), ...(named?.slip ? { renamed: { slip: named.slip, said: named.said } } : {}) };
}
