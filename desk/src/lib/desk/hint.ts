/**
 * Socratic hints. The stance is the product: the next step, never the answer.
 * Prompt rules carried from the PoC: hint 2 sees hint 1 and must go one step further; the
 * syllabus topic goes in; no LaTeX in anything that will be spoken; for English, the rule card
 * is what the model is allowed to know and it never contains the form.
 *
 * A maths hint is checked, not only asked (PoC B: the model assembled the answer once it had the parts). Both
 * fields pass rules/maths leaks(); a leak is re-asked once, naming the field; a second leak - or a re-ask that
 * fails - gives the item's withheld line from rules/maths and an empty next. The shape is the same either way.
 *
 * A Calculus item is read from its printed text into a spec (rules/calc specFromQuestion, null when unsure); when it
 * reads, each field also passes the shape-aware leaksCalc, and the fallback is the shape's fixed sentence from
 * rules/calc. The stance follows the item's KIND where its text reads (rules/kinds readQuestion: a derivative question gets the
 * Calculus stance on any path, a fractions task its unit's); where the text reads as neither - a linear equation - it follows
 * the learner's Math path, which the route reads from the session and passes in. The voice is always the learner's.
 *
 * A school task (Family W5b) is read the same way by rules/school specFromQuestion ('3/4 + 1/6', 'Work out 3/4 - 1/6',
 * 'Add 3/4 and 1/6', a practice item's printed question; null when unsure): when it reads, each field also passes
 * leaksSchool, the fallback is the unit's fixed sentence (rules/school withheldSchool), and the stance names the unit
 * the task belongs to ("Add and subtract fractions") instead of the linear-equations sheet. A task no reader reads is
 * checked by the general rule alone, as before.
 */
import { text } from "../engines/text";
import { cardText, type RuleCard } from "../rules/english";
import { equationOf, expressionOf, leaks, withheldLine } from "../rules/maths";
import { leaksCalc, withheldCalc } from "../rules/calc";
import { leaksSchool, unitOf, withheldSchool } from "../rules/school";
import { readQuestion, type ItemKind, type Question } from "../rules/kinds";
import { calcWordsOf, judgeOf, topicIn, type MathPath } from "../library/paths";
import { voiceOf, withManner, type Voice } from "../rules/voice";
import { SCHOOL_SLIPS } from "../rules/school";
import { WORKED_METHODS } from "../library/worked";
import { getLearner } from "../session/learners";
import { SYSTEM_WORDS } from "@/tv/profileRows";
import type { SchoolSystem, Subject } from "../session/store";

const SCHEMA = {
  type: "object",
  properties: {
    hint: { type: "string", description: "The hint, said to the learner as \"you\"; the learner reads it on the TV and hears it aloud." },
    what_to_try_next: { type: "string", description: "Where to look or what to write down on their paper now, said to them as \"you\". Never the answer to the hint's own question. Not a note for a teacher, parent or tutor." },
  },
  required: ["hint", "what_to_try_next"],
};
type Said = { hint: string; what_to_try_next: string };

/** A maths hint line is short enough to read on the TV and hear aloud: 25 words or fewer each (MB-B33). */
export const MAX_HINT_WORDS = 25;
const LIMIT = ` ${MAX_HINT_WORDS} words or fewer.`;
/** The maths schema: the same two fields, each described with the length limit. English and Essay keep SCHEMA as it was. */
const MATHS_SCHEMA = {
  ...SCHEMA,
  properties: {
    hint: { ...SCHEMA.properties.hint, description: SCHEMA.properties.hint.description + LIMIT },
    what_to_try_next: { ...SCHEMA.properties.what_to_try_next, description: SCHEMA.properties.what_to_try_next.description + LIMIT },
  },
};
const wordCount = (s: unknown) => (typeof s === "string" ? s.trim().split(/\s+/).filter(Boolean).length : 0);

/** Which field of a maths hint is over the word limit, in words for the re-ask, or null when neither is. */
function longIn(said: Said): string | null {
  const inHint = wordCount(said.hint) > MAX_HINT_WORDS, inNext = wordCount(said.what_to_try_next) > MAX_HINT_WORDS;
  return inHint && inNext ? "the hint and what to try next" : inHint ? "the hint" : inNext ? "what to try next" : null;
}

/** Who the tutor is for, by subject: the words naming the learner come from the voice (rules/voice), the rest is the same at every age. */
const STANCE: Record<Subject, (v: Voice) => string> = {
  maths: (v) => `a maths tutor for ${v.who}. This sheet is a factoring and linear-equations unit; prefer the unit's methods over heavier ones.`,
  english: (v) => `an English tutor for ${v.who} learning English; explain in plain English, examples in English`,
  essay: (v) => `a writing tutor for ${v.who}`,
};
/** The withholding rule of every hint, in every voice and on every path. */
export const HINT_WITHHOLD =
  "Socratic rules, absolute: never state the final answer, never write the completed solution, never fill in a blank, never state a verb form or an ending.";
/** The maths stance on a Calculus path: a university course, its methods and its notation, as the path's record words them. */
const calcStance = (path?: MathPath) => {
  const w = calcWordsOf(path);
  return `a maths tutor for a first-year university student in ${w.course}. Use the course's methods and notation - ${w.methods} - and name the rule that applies`;
};

/** The maths stance on a school task that reads as a unit's (Family W5b): the sheet is that unit, named, never the linear-equations sheet. */
const unitStance = (v: Voice, unit: string) => `a maths tutor for ${v.who}. This sheet is the unit "${unit}"; prefer the unit's methods over heavier ones.`;

/** The maths stance on a task no reader reads and no Calculus path claims: it names no unit (HL2), so it never steers a method the task does not use. */
const neutralStance = (v: Voice) => `a maths tutor for ${v.who}. This is a school maths task; prefer the simplest method a school course would use over heavier ones.`;

/**
 * The stance: a maths task's own kind first (Calculus, or the school unit it belongs to), the learner's path only where the text reads as neither.
 * A task the linear rule reads (an equation or an expression, rules/maths) keeps the linear-equations sheet; any other maths task is neutral.
 */
const stanceOf = (subject: Subject, voice: Voice, kind: ItemKind, problem: string, path?: MathPath, unit?: string, system?: SchoolSystem) =>
  subject !== "maths" ? STANCE[subject](voice)
    : kind === "calc" ? calcStance(path)
    : kind === "school" && unit ? unitStance(voice, unit)
    : judgeOf(path) === "calc" ? calcStance(path)
    : equationOf(problem, system) || expressionOf(problem, system) ? STANCE.maths(voice) : neutralStance(voice);

/**
 * The specs a maths task reads as (rules/kinds readQuestion): a Calculus one, a school one, or the parts of a multi-part
 * Calculus task (v2 M3a); at most one of the three reads.
 */
export type Specs = Pick<Question, "calc" | "school" | "parts">;

/** Does this line give the item's answer away: the one leak rule, and each reader's own check when the item reads as its spec (every part's, for parts). */
export const leaksLine = (problem: string, spec: Specs, line: string, system?: SchoolSystem) =>
  leaks(problem, line, system) || (spec.calc !== null && leaksCalc(spec.calc, line)) || (spec.school !== null && leaksSchool(spec.school, line))
  || (spec.parts !== null && spec.parts.some((p) => leaksCalc(p, line)));

/** Which field of a maths hint gives the item's answer away, in words for the re-ask, or null when neither does. */
function leakedIn(problem: string, spec: Specs, said: Said, system?: SchoolSystem): string | null {
  const inHint = leaksLine(problem, spec, said.hint, system), inNext = leaksLine(problem, spec, said.what_to_try_next, system);
  return inHint && inNext ? "the hint and what to try next" : inHint ? "the hint" : inNext ? "what to try next" : null;
}

/**
 * What a maths hint is told about this learner and this task (MB-B8), as sentences for the user prompt - never the system
 * prompt, and never the leak checks' business: the school system's notation when it differs from the desk's own (cz, de;
 * the wording of the maths read, desk/read mathsContext), the slips recorded for the task's school unit (the desk's own line
 * for each, rules/school SCHOOL_SLIPS) and the unit's worked method (library/worked). A task that reads as no unit, from
 * a learner with no record and the default system, gets the empty string, so its prompt is what it was.
 */
export function groundFor(problem: string, who: { id: string; system: SchoolSystem }): string {
  const parts: string[] = [];
  if (who.system === "cz" || who.system === "de") {
    const note = who.system === "cz" ? "a decimal comma (3,5), division written with a colon, and tg and cotg for tan and cot" : "a decimal comma (3,5) and division written with a colon";
    parts.push(`The learner is in the ${SYSTEM_WORDS[who.system]} school system, whose notation uses ${note}.`);
  }
  const school = readQuestion(problem, who.system).school;
  const unit = school ? unitOf(school) : null;
  if (unit) {
    let seen: string[] = [];
    try { seen = getLearner(who.id).skills[unit]?.slips ?? []; } catch { /* no record is no slips */ }
    const said = seen.map((id) => SCHOOL_SLIPS.find((s) => s.id === id)?.says).filter((x): x is string => !!x);
    if (said.length) parts.push(`This learner has made these slips on this kind of task before: ${said.join(" ")}`);
    const m = Object.prototype.hasOwnProperty.call(WORKED_METHODS, unit) ? WORKED_METHODS[unit] : null;
    if (m) parts.push(`The method this unit teaches: ${m.idea} Its steps: ${m.steps.join("; ")}.`);
  }
  return parts.join(" ");
}

export async function hint(subject: Subject, problem: string, opts: { previous?: string; askedQ?: string; rule?: RuleCard; path?: MathPath; age?: number; ground?: string; system?: SchoolSystem }) {
  // The voice names the learner and adds one manner paragraph; the rules below are shared by every band. A Calculus
  // learner is spoken to as the course's student whatever their age, so that path takes the teen voice (today's text).
  const voice = voiceOf(subject, subject === "maths" && judgeOf(opts.path) === "calc" ? undefined : opts.age);
  const read = subject === "maths" ? readQuestion(problem, opts.system) : null;
  const spec: Specs = { calc: read?.calc ?? null, school: read?.school ?? null, parts: read?.parts ?? null };
  // the unit a school task belongs to, by its path's name for it: the stance names it
  const unit = spec.school ? topicIn(unitOf(spec.school) ?? "")?.name : undefined;
  const system = withManner(
    `You are ${stanceOf(subject, voice, read?.kind ?? "linear", problem, opts.path, unit, opts.system)}. ${HINT_WITHHOLD} Point at the method, the next step, or the mistake to avoid. ` +
    `Two or three sentences at most. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.\n\n` +
    `Who reads it: the learner, on the TV and aloud - both the hint and what_to_try_next. Speak to them as "you". ` +
    `Never refer to the learner in the third person and never write instructions for a teacher, parent or tutor. ` +
    `what_to_try_next is one concrete thing the learner can do on their paper now: WHERE to look or WHAT to write down ` +
    `(circle a term, copy a line, write the two sides one under the other, write their own answer to the hint's question). ` +
    `The hint asks the learner a question; what_to_try_next must never answer it. Never name in it the operation, the number ` +
    `or the result the hint's question is asking for - if the hint asks "what undoes the + 5?", what_to_try_next does not ` +
    `say "subtract 5"; it says where to write their answer. ` +
    `You have not seen their work and they have not answered you: do not open with praise, agreement or a verdict ` +
    `(no "Perfect", "Great", "Right", "Good"); start with the maths.` +
    (opts.rule ? `\n\nThe grammar that applies has been worked out already. Use it and do not contradict it:\n${cardText(opts.rule)}` : ""),
    voice);
  const stage = opts.previous
    ? `The learner already had this hint and pressed "still stuck":\n«${opts.previous}»\nGive the NEXT hint. It must go ONE STEP FURTHER than the previous one — do not repeat it — and still stop short of the answer.`
    : `Give the FIRST hint: the smallest push that gets the learner moving.`;
  const maths = subject === "maths";
  const prompt = `Problem: ${problem}\n` + (opts.askedQ ? `The student asked: "${opts.askedQ}"\n` : "") + `\n${stage}` +
    (maths ? `\nKeep the hint and what_to_try_next to ${MAX_HINT_WORDS} words or fewer each.` : "") + (maths && opts.ground ? `\n${opts.ground}` : "");
  const ask = (extra: string) => text<Said>({ system, prompt: prompt + extra, schema: maths ? MATHS_SCHEMA : SCHEMA, model: "fast" });
  const first = await ask("");
  const leaked = maths ? leakedIn(problem, spec, first.json, opts.system) : null, long = maths ? longIn(first.json) : null;
  if (!leaked && !long) return { hint: first.json.hint, next: first.json.what_to_try_next, provider: first.provider, ms: first.ms };
  // the faulty line is not handed back; the model is told where, and asked again, once. A leak and a length are named together.
  const told = leaked && !long ? `Your previous hint gave the answer away (in ${leaked}). Write it again: one step, and stop short of the answer.`
    : `Your previous hint ${[leaked && `gave the answer away (in ${leaked})`, long && `was over ${MAX_HINT_WORDS} words (in ${long})`].filter(Boolean).join(" and ")}. ` +
      `Write it again: one step, ${leaked ? "stop short of the answer, " : ""}and keep the hint and what_to_try_next to ${MAX_HINT_WORDS} words or fewer each.`;
  const again = await ask(`\n\n${told}`).catch(() => null);
  const ms = first.ms + (again?.ms ?? 0), provider = again?.provider ?? first.provider;
  // after the re-ask a leak is still withheld (a safety rule); a line only too long is shown (length is a value rule)
  if (again && !leakedIn(problem, spec, again.json, opts.system)) return { hint: again.json.hint, next: again.json.what_to_try_next, provider, ms };
  if (!again && !leaked) return { hint: first.json.hint, next: first.json.what_to_try_next, provider, ms };
  return { hint: spec.calc ? withheldCalc(spec.calc) : spec.parts ? withheldCalc(spec.parts[0]) : spec.school ? withheldSchool(spec.school) : withheldLine(problem, opts.system), next: "", provider, ms };
}
