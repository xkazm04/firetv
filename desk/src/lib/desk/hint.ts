/**
 * Socratic hints. The stance is the product: the next step, never the answer.
 * Prompt rules carried from the PoC: hint 2 sees hint 1 and must go one step further; the
 * syllabus topic goes in; no LaTeX in anything that will be spoken; for English, the rule card
 * is what the model is allowed to know and it never contains the form.
 *
 * A maths hint is checked, not only asked (PoC B: the model assembled the answer once it had the parts). Both
 * fields pass rules/maths leaks(); a leak is re-asked once, naming the field; a second leak - or a re-ask that
 * fails - gives the item's withheld line from rules/maths and an empty next. The shape is the same either way.
 */
import { text } from "../engines/text";
import { cardText, type RuleCard } from "../rules/english";
import { leaks, withheldLine } from "../rules/maths";
import type { Subject } from "../session/store";

const SCHEMA = { type: "object", properties: { hint: { type: "string" }, what_to_try_next: { type: "string" } }, required: ["hint", "what_to_try_next"] };
type Said = { hint: string; what_to_try_next: string };

const STANCE: Record<Subject, string> = {
  maths: "a maths tutor for a 15-year-old. This sheet is a factoring and linear-equations unit; prefer the unit's methods over heavier ones.",
  english: "an English tutor for a Czech teenager learning English; explain in plain English, examples in English",
  essay: "a writing tutor for a 15-year-old",
};

/** Which field of a maths hint gives the item's answer away, in words for the re-ask, or null when neither does. */
function leakedIn(problem: string, said: Said): string | null {
  const inHint = leaks(problem, said.hint), inNext = leaks(problem, said.what_to_try_next);
  return inHint && inNext ? "the hint and what to try next" : inHint ? "the hint" : inNext ? "what to try next" : null;
}

export async function hint(subject: Subject, problem: string, opts: { previous?: string; askedQ?: string; rule?: RuleCard }) {
  const system =
    `You are ${STANCE[subject]}. Socratic rules, absolute: never state the final answer, never write the completed solution, ` +
    `never fill in a blank, never state a verb form or an ending. Point at the method, the next step, or the mistake to avoid. ` +
    `Two or three sentences at most. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.` +
    (opts.rule ? `\n\nThe grammar that applies has been worked out already. Use it and do not contradict it:\n${cardText(opts.rule)}` : "");
  const stage = opts.previous
    ? `The student already had this hint and is still stuck:\n«${opts.previous}»\nGive the NEXT hint. It must go ONE STEP FURTHER than the previous one — do not repeat it — and still stop short of the answer.`
    : `Give the FIRST hint: the smallest push that gets them moving.`;
  const prompt = `Problem: ${problem}\n` + (opts.askedQ ? `The student asked: "${opts.askedQ}"\n` : "") + `\n${stage}`;
  const ask = (extra: string) => text<Said>({ system, prompt: prompt + extra, schema: SCHEMA, model: "fast" });
  const first = await ask("");
  const leaked = subject === "maths" ? leakedIn(problem, first.json) : null;
  if (!leaked) return { hint: first.json.hint, next: first.json.what_to_try_next, provider: first.provider, ms: first.ms };
  // the leaked line is not handed back; the model is told where it leaked and asked again, once
  const again = await ask(`\n\nYour previous hint gave the answer away (in ${leaked}). Write it again: one step, and stop short of the answer.`).catch(() => null);
  const ms = first.ms + (again?.ms ?? 0), provider = again?.provider ?? first.provider;
  if (again && !leakedIn(problem, again.json)) return { hint: again.json.hint, next: again.json.what_to_try_next, provider, ms };
  return { hint: withheldLine(problem), next: "", provider, ms };
}
