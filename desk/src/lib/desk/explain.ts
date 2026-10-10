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
 * the value settles only when code finds it in what was said (rules/saidValue, X5), and then
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
import { ASK, leaks, settle, settled, settleSpec, slip as slipOf, slipsFor, slipVocabulary, cleanValue, workingLines, type Settled } from "../rules/maths";
import { leaksCalc } from "../rules/calc";
import { askedText, namedLine } from "../rules/calc-word";
import { DEFAULT_SCHOOL_SYSTEM, leaksSchool } from "../rules/school";
import { kindOfSpec } from "../rules/kinds";
import { saidIn } from "../rules/saidValue";
import { slipsShown } from "../rules/slips";
import { voiceOf, withManner } from "../rules/voice";
import { topic } from "../library/syllabus";
import { PATHS, pathOfTopic, topicIn, type PathInfo } from "../library/paths";
import { getLearner, recordAttempt } from "../session/learners";
import type { PracticeItem, SchoolSystem } from "../session/store";

const SCHEMA = {
  type: "object",
  properties: { reply: { type: "string" }, slip: { type: "string" }, value: { type: "string" } },
  required: ["reply", "slip", "value"],
};

/** The withholding rule of every explanation reply: the school prompt and the Calculus prompt share it, in every voice. */
export const EXPLAIN_WITHHOLD = "Socratic rules, absolute: never state the final answer, never give the completed line, never say whether they are right or wrong.";

/**
 * What the desk has already seen of the item, for the prompt (MB-B10): the learner's written answer, their working as numbered
 * lines, and the slip the desk found with its line. Their own writing and the desk's fixed words only: never the right answer,
 * a value the desk worked out, or a verdict word. Each part is left out when it has nothing to say.
 */
export interface Seen { answer?: string; working?: string[]; slip?: string; line?: number }

/** The block the prompt carries after the question; empty (so the prompt is as it was) when nothing was seen. */
function seenBlock(seen?: Seen): string {
  if (!seen) return "";
  const parts: string[] = [];
  if (seen.answer) parts.push(`What the student wrote as their answer: «${seen.answer}»`);
  if (seen.working?.length) parts.push(`Their working, line by line:\n${seen.working.map((l, k) => `${k + 1}. ${l}`).join("\n")}`);
  if (seen.slip) parts.push(`The desk found this slip: ${seen.slip}${seen.working?.length && seen.line !== undefined ? `, on line ${seen.line}` : ""}.`);
  return parts.length ? `${parts.join("\n\n")}\n\n` : "";
}

export async function explain(
  itemQuestion: string,
  transcript: string,
  topicId: string,
  learnerId: string,
  /** The item is a Calculus one: the university stance, and the final answer as an expression or a number. */
  calc = false,
  /** The seated profile's age. Only the school stance is age-voiced (rules/voice); without an age it is today's text. */
  age?: number,
  /** What the desk has seen of the item (MB-B10); without it the prompt is as it was. */
  seen?: Seen,
): Promise<{ reply: string; slip?: string; value: string; provider: string; ms: number }> {
  if (calc) return explainCalc(itemQuestion, transcript, topicId, learnerId, seen);
  const t = topic(topicId);
  const memory = getLearner(learnerId).memory;

  const system = schoolSystem(age);

  const prompt =
    `Topic: ${t?.name ?? topicId}\n${t?.blurb ?? ""}\n\n` +
    `The question: ${itemQuestion}\n\n` +
    seenBlock(seen) +
    `What the student said, transcribed from speech. The transcription may be rough or misheard — read it charitably ` +
    `and answer what they meant:\n«${transcript}»\n\n` +
    (memory.length ? `What the desk has learned about this student:\n${memory.map((m) => `- ${m}`).join("\n")}\n\n` : "") +
    `Reply to them in one or two sentences that point at the step, not the answer.\n\n` +
    `You may also name the mistake you heard, as an id from this list — or the word "unclear" if none of them fits ` +
    `or their reasoning was sound:\n${slipVocabulary(topicId)}\n\n` +
    `value: the final value of x the student says they got, written as a plain number or simple fraction (nine is 9, ` +
    `minus three is -3, seven halves is 7/2). Their value, not yours — do not work it out. An empty string if they did not say one.`;

  return heard(await text<{ reply: string; slip: string; value: string }>({ system, prompt, schema: SCHEMA, model: "best", use: "explain" }), topicId);
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
  seen?: Seen,
): Promise<{ reply: string; slip?: string; value: string; provider: string; ms: number }> {
  const t = topicIn(topicId);
  const memory = getLearner(learnerId).memory;
  const prompt =
    `Topic: ${t?.name ?? topicId}\n${t?.blurb ?? ""}\n\n` +
    `The question: ${itemQuestion}\n\n` +
    seenBlock(seen) +
    `What the student said, transcribed from speech. The transcription may be rough or misheard — read it charitably ` +
    `and answer what they meant:\n«${transcript}»\n\n` +
    (memory.length ? `What the desk has learned about this student:\n${memory.map((m) => `- ${m}`).join("\n")}\n\n` : "") +
    `Reply to them in one or two sentences that point at the step, not the answer.\n\n` +
    `value: the final answer the student says they got, written in figures as they said it: a whole number, a fraction, ` +
    `a mixed number, a decimal or a percentage (eleven twelfths is 11/12, one and five twelfths is 1 5/12, nought point five is 0.5, ` +
    `thirty-five percent is 35%), with a currency sign if they said one (seven euros fifteen is €7.15); a ratio with its colon ` +
    `(two to three is 2:3) and two amounts joined by and (twenty-four and thirty-six is 24 and 36). ` +
    `Their answer, not yours — do not work it out and do not simplify it. An empty string if they did not say one.`;
  const { json, provider, ms } = await text<{ reply: string; value: string }>({ system: schoolSystem(age), prompt, schema: SCHOOL_SCHEMA, model: "best", use: "explain" });
  return {
    reply: (typeof json?.reply === "string" ? json.reply : "").trim(),
    value: typeof json?.value === "string" ? json.value.trim() : "",
    provider,
    ms,
  };
}

/**
 * The Calculus course the stance names: the topic's own path when it is judged 'calc' (a set is drawn from the learner's
 * path), else the first path judged 'calc'.
 */
function calcCourse(topicId: string): PathInfo {
  const path = pathOfTopic(topicId);
  return path && PATHS[path].judge === "calc" ? PATHS[path] : Object.values(PATHS).find((p) => p.judge === "calc")!;
}

/** A Calculus item heard: the university stance, the Calculus topic from topicIn, the answer as an expression or a number. */
async function explainCalc(
  itemQuestion: string,
  transcript: string,
  topicId: string,
  learnerId: string,
  seen?: Seen,
): Promise<{ reply: string; slip?: string; value: string; provider: string; ms: number }> {
  const t = topicIn(topicId);
  const memory = getLearner(learnerId).memory;

  const system =
    `You are a calculus tutor listening to a first-year university student on the ${calcCourse(topicId).name} course explain their own working out loud. ` +
    `${EXPLAIN_WITHHOLD} ` +
    `Point at the step they should look at again, or at the step that was the good one. ` +
    `One or two sentences. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.`;

  const prompt =
    `Topic: ${t?.name ?? topicId}\n${t?.blurb ?? ""}\n\n` +
    `The question: ${itemQuestion}\n\n` +
    seenBlock(seen) +
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

  return heard(await text<{ reply: string; slip: string; value: string }>({ system, prompt, schema: SCHEMA, model: "best", use: "explain" }), topicId);
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
export interface Explained { reply: string; /** the reply as the learner reads it: a part named as the paper names it (v2 M3a-2); `reply` is what the session stores */ shown: string; slip?: string; settled?: Settled; renamed?: { slip: string; said: string }; }

/**
 * What the item carries for the prompt: the written answer, the working as the pen counts it (workingLines, the same lines
 * slipAt.line indexes from 0, so the prompt numbers from 1), the slip's own sentence from the topic's list, and its line.
 * The working is shown only when the learner wrote some: a bare answer is not repeated as a line, and then no line is named.
 */
function seenOf(item: PracticeItem, topicId: string): Seen | undefined {
  const answer = (item.studentAnswer ?? "").trim();
  const working = (item.studentWorking ?? "").trim() ? workingLines(item) : [];
  const says = item.slip ? slipOf(item.slip, topicId)?.says : undefined;
  const seen: Seen = {
    ...(answer ? { answer } : {}),
    ...(working.length ? { working } : {}),
    ...(says ? { slip: says } : {}),
    ...(says && working.length && item.slipAt ? { line: item.slipAt.line + 1 } : {}),
  };
  return Object.keys(seen).length ? seen : undefined;
}

/** The one line an unsure item gets when the value the model wrote was not in what the learner said (X6-a): English for every system but cz. */
export const NOT_HEARD_LINE = {
  en: "The desk did not hear a final answer in that. Say or type what you got, for example: I got ...",
  cz: "V tom nezazněla konečná odpověď. Řekni nebo napiš, co ti vyšlo, například: Vyšlo mi ...",
};

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
  /** The item's name on the paper (rules/calc-word itemName): '5(b)' for a part; its number when not given. */
  name: string = String(item.n),
): Promise<Explained> {
  // the item's kind (rules/kinds) says which engine: a Calculus shape is a Calculus item, a school shape a school unit's item
  const kind = kindOfSpec(item.spec), calc = kind === "calc", school = kind === "school";
  // a part of a multi-part question (v2 M3a) is explained with its stem: the part's line alone does not say the situation
  const seen = seenOf(item, topicId);
  const h = school ? await explainSchool(item.question, transcript, topicId, learnerId, age, seen) : await explain(askedText(item), transcript, topicId, learnerId, calc, age, seen);
  // an item with a spec settles by its engine's check (null when unsure); a linear item by substitution
  // the value settles only when the learner said it (X5): a model-written value that is not in the transcript settles nothing and writes no record
  const unsure = stillUnsure(), heard = saidIn(h.value, transcript);
  const verdict = !unsure || !heard ? null
    : calc || school ? settleSpec(item.n, item.spec, h.value, h.slip, topicId, system)
    : settle(item, h.value, h.slip, topicId);
  // a step-up item (Family W8) settles onto the step-up record only, as marking does
  if (verdict) recordAttempt(learnerId, topicId, verdict.verdict === "right", verdict.slip, { stretch: item.stretch === true, tier: item.tier, ...(school ? { shows: slipsShown(topicId, item.spec) } : {}) });
  // an item already wrong: the slip the conversation found replaces the marker's, when the rulebook has it (no verdict,
  // no record) - never on a school item, whose slip only code detects
  const named = !verdict && !school && item.verdict === "wrong" && h.slip ? settled(item.n, false, h.slip, topicId) : null;
  // the item's own line stands in for a reply that gives the answer away (or says nothing)
  const own = verdict?.said ?? item.said ?? ASK(item.n);
  const gives = calc ? leaksCalc(item.spec, h.reply) : school ? leaksSchool(item.spec, h.reply) : leaks(item.question, h.reply, system);
  const chosen = h.reply && !gives ? h.reply : own;
  // a settled item names the value the desk took from the words (the learner's own value is not a leak, so the leak check above ran on the model's reply alone)
  const took = verdict ? (calc || school ? h.value : cleanValue(h.value)).trim() : "";
  const body = took ? `The desk heard ${took}. ${chosen}` : chosen;
  // an item still unsure whose value was not heard asks for the answer (X6-a); a wrong item or one no longer unsure gets no line
  const reply = unsure && !heard && item.verdict !== "wrong" ? `${body} ${system === "cz" ? NOT_HEARD_LINE.cz : NOT_HEARD_LINE.en}` : body;
  return { reply, shown: namedLine(reply, item.n, name), slip: h.slip, ...(verdict ? { settled: verdict } : {}), ...(named?.slip ? { renamed: { slip: named.slip, said: named.said } } : {}) };
}
