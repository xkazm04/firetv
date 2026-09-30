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
 * rules/calc. The stance follows the learner's Math path, which the route reads from the session and passes in.
 */
import { text } from "../engines/text";
import { cardText, type RuleCard } from "../rules/english";
import { leaks, withheldLine } from "../rules/maths";
import { leaksCalc, specFromQuestion, withheldCalc, type CalcSpec } from "../rules/calc";
import type { MathPath } from "../library/paths";
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
/** The maths stance on the Calculus 1 path: a university course, its methods and its notation. */
const CALC_STANCE =
  "a maths tutor for a first-year university student in Calculus I. Use the course's methods and notation - limits, " +
  "the derivative rules, antiderivatives and the Fundamental Theorem - and name the rule that applies";

const stanceOf = (subject: Subject, voice: Voice, path?: MathPath) => (subject === "maths" && path === "calc1" ? CALC_STANCE : STANCE[subject](voice));

/** Does this line give the item's answer away: the one leak rule, and the shape's own check when the item reads as a Calculus spec. */
const leaksLine = (problem: string, spec: CalcSpec | null, line: string) => leaks(problem, line) || (spec !== null && leaksCalc(spec, line));

/** Which field of a maths hint gives the item's answer away, in words for the re-ask, or null when neither does. */
function leakedIn(problem: string, spec: CalcSpec | null, said: Said): string | null {
  const inHint = leaksLine(problem, spec, said.hint), inNext = leaksLine(problem, spec, said.what_to_try_next);
  return inHint && inNext ? "the hint and what to try next" : inHint ? "the hint" : inNext ? "what to try next" : null;
}

export async function hint(subject: Subject, problem: string, opts: { previous?: string; askedQ?: string; rule?: RuleCard; path?: MathPath; age?: number }) {
  // The voice names the learner and adds one manner paragraph; the rules below are shared by every band. A Calculus
  // learner is spoken to as the course's student whatever their age, so that path takes the teen voice (today's text).
  const voice = voiceOf(subject, subject === "maths" && opts.path === "calc1" ? undefined : opts.age);
  const system = withManner(
    `You are ${stanceOf(subject, voice, opts.path)}. ${HINT_WITHHOLD} Point at the method, the next step, or the mistake to avoid. ` +
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
  const spec = subject === "maths" ? specFromQuestion(problem) : null;
  const leaked = subject === "maths" ? leakedIn(problem, spec, first.json) : null;
  if (!leaked) return { hint: first.json.hint, next: first.json.what_to_try_next, provider: first.provider, ms: first.ms };
  // the leaked line is not handed back; the model is told where it leaked and asked again, once
  const again = await ask(`\n\nYour previous hint gave the answer away (in ${leaked}). Write it again: one step, and stop short of the answer.`).catch(() => null);
  const ms = first.ms + (again?.ms ?? 0), provider = again?.provider ?? first.provider;
  if (again && !leakedIn(problem, spec, again.json)) return { hint: again.json.hint, next: again.json.what_to_try_next, provider, ms };
  return { hint: spec ? withheldCalc(spec) : withheldLine(problem), next: "", provider, ms };
}
