/**
 * Socratic hints. The stance is the product: the next step, never the answer.
 * Prompt rules carried from the PoC: hint 2 sees hint 1 and must go one step further; the
 * syllabus topic goes in; no LaTeX in anything that will be spoken; for English, the rule card
 * is what the model is allowed to know and it never contains the form.
 */
import { text } from "../engines/text";
import { cardText, type RuleCard } from "../rules/english";
import type { Subject } from "../session/store";

const SCHEMA = { type: "object", properties: { hint: { type: "string" }, what_to_try_next: { type: "string" } }, required: ["hint", "what_to_try_next"] };

const STANCE: Record<Subject, string> = {
  maths: "a maths tutor for a 15-year-old. This sheet is a factoring and linear-equations unit; prefer the unit's methods over heavier ones.",
  english: "an English tutor for a Czech teenager learning English; explain in plain English, examples in English",
  essay: "a writing tutor for a 15-year-old",
};

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
  const { json, provider, ms } = await text<{ hint: string; what_to_try_next: string }>({ system, prompt, schema: SCHEMA, model: "fast" });
  return { hint: json.hint, next: json.what_to_try_next, provider, ms };
}
