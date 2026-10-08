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
import { leaks, withheldLine } from "../rules/maths";
import { leaksCalc, withheldCalc } from "../rules/calc";
import { leaksSchool, unitOf, withheldSchool } from "../rules/school";
import { readQuestion, type ItemKind, type Question } from "../rules/kinds";
import { calcWordsOf, judgeOf, topicIn, type MathPath } from "../library/paths";
import { voiceOf, withManner, type Voice } from "../rules/voice";
import type { Subject } from "../session/store";

const SCHEMA = {
  type: "object",
  properties: {
    hint: { type: "string", description: "The hint, said to the learner as \"you\"; the learner reads it on the TV and hears it aloud." },
    what_to_try_next: { type: "string", description: "Where to look or what to write down on their paper now, said to them as \"you\". Never the answer to the hint's own question. Not a note for a teacher, parent or tutor." },
  },
  required: ["hint", "what_to_try_next"],
};
type Said = { hint: string; what_to_try_next: string };

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

/** The stance: a maths task's own kind first (Calculus, or the school unit it belongs to), the learner's path only where the text reads as neither. */
const stanceOf = (subject: Subject, voice: Voice, kind: ItemKind, path?: MathPath, unit?: string) =>
  subject !== "maths" ? STANCE[subject](voice)
    : kind === "calc" ? calcStance(path)
    : kind === "school" && unit ? unitStance(voice, unit)
    : judgeOf(path) === "calc" ? calcStance(path) : STANCE.maths(voice);

/**
 * The specs a maths task reads as (rules/kinds readQuestion): a Calculus one, a school one, or the parts of a multi-part
 * Calculus task (v2 M3a); at most one of the three reads.
 */
type Specs = Pick<Question, "calc" | "school" | "parts">;

/** Does this line give the item's answer away: the one leak rule, and each reader's own check when the item reads as its spec (every part's, for parts). */
const leaksLine = (problem: string, spec: Specs, line: string) =>
  leaks(problem, line) || (spec.calc !== null && leaksCalc(spec.calc, line)) || (spec.school !== null && leaksSchool(spec.school, line))
  || (spec.parts !== null && spec.parts.some((p) => leaksCalc(p, line)));

/** Which field of a maths hint gives the item's answer away, in words for the re-ask, or null when neither does. */
function leakedIn(problem: string, spec: Specs, said: Said): string | null {
  const inHint = leaksLine(problem, spec, said.hint), inNext = leaksLine(problem, spec, said.what_to_try_next);
  return inHint && inNext ? "the hint and what to try next" : inHint ? "the hint" : inNext ? "what to try next" : null;
}

export async function hint(subject: Subject, problem: string, opts: { previous?: string; askedQ?: string; rule?: RuleCard; path?: MathPath; age?: number }) {
  // The voice names the learner and adds one manner paragraph; the rules below are shared by every band. A Calculus
  // learner is spoken to as the course's student whatever their age, so that path takes the teen voice (today's text).
  const voice = voiceOf(subject, subject === "maths" && judgeOf(opts.path) === "calc" ? undefined : opts.age);
  const read = subject === "maths" ? readQuestion(problem) : null;
  const spec: Specs = { calc: read?.calc ?? null, school: read?.school ?? null, parts: read?.parts ?? null };
  // the unit a school task belongs to, by its path's name for it: the stance names it
  const unit = spec.school ? topicIn(unitOf(spec.school) ?? "")?.name : undefined;
  const system = withManner(
    `You are ${stanceOf(subject, voice, read?.kind ?? "linear", opts.path, unit)}. ${HINT_WITHHOLD} Point at the method, the next step, or the mistake to avoid. ` +
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
  const prompt = `Problem: ${problem}\n` + (opts.askedQ ? `The student asked: "${opts.askedQ}"\n` : "") + `\n${stage}`;
  const ask = (extra: string) => text<Said>({ system, prompt: prompt + extra, schema: SCHEMA, model: "fast" });
  const first = await ask("");
  const leaked = subject === "maths" ? leakedIn(problem, spec, first.json) : null;
  if (!leaked) return { hint: first.json.hint, next: first.json.what_to_try_next, provider: first.provider, ms: first.ms };
  // the leaked line is not handed back; the model is told where it leaked and asked again, once
  const again = await ask(`\n\nYour previous hint gave the answer away (in ${leaked}). Write it again: one step, and stop short of the answer.`).catch(() => null);
  const ms = first.ms + (again?.ms ?? 0), provider = again?.provider ?? first.provider;
  if (again && !leakedIn(problem, spec, again.json)) return { hint: again.json.hint, next: again.json.what_to_try_next, provider, ms };
  return { hint: spec.calc ? withheldCalc(spec.calc) : spec.parts ? withheldCalc(spec.parts[0]) : spec.school ? withheldSchool(spec.school) : withheldLine(problem), next: "", provider, ms };
}
