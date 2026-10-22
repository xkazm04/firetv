/**
 * A worked lesson (v2 M1). The examples are written and answered by code: three items from the unit's own generator
 * (lib/desk/items.ts makeSchoolItems, so they are well formed, print and never state their own answer), and each answer
 * from rules/school workedAnswer, which `check` must mark right for the learner's school system. An example without such
 * an answer is withheld, never shown "mostly right" (the plan's kill criterion). The idea's wording may come from the
 * model, in the learner's voice; it is kept only when it carries no digit (so no number on a lesson is a model's) and fits
 * the caption, else the authored idea stands (library/worked.ts).
 */
import { text } from "../engines/text";
import { assemble, say } from "../prompt/assemble";
import { makeSchoolItems } from "./items";
import { linearWorked, workedAnswer } from "../rules/school";
import { voiceOf, withManner } from "../rules/voice";
import { topicIn } from "../library/paths";
import { WORKED_METHODS } from "../library/worked";
import type { SchoolSystem, Worked } from "../session/store";

export const IDEA_MAX = 320;
/** The model's idea, cleaned: words only (no digit), at most three sentences and IDEA_MAX characters; else null. */
export function cleanIdea(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.replace(/\s+/g, " ").trim();
  if (!t || t.length > IDEA_MAX || /\d/.test(t)) return null;
  if ((t.match(/[.!?](\s|$)/g) ?? []).length > 3) return null;
  return t;
}

/** The examples, by code only. `seed` is fixed by the tests; a fresh one otherwise (items.ts). */
export function workedExamples(topic: string, system: SchoolSystem, seed?: number): Worked["examples"] {
  // a linear-equation unit has no generated spec (its sets are model-written): its examples are built from a root, by code
  const linear = linearWorked(topic, seed ?? Math.floor(Math.random() * 0x100000000));
  if (linear.length) return linear.map((l) => ({ ...l, tier: 1 as const }));
  const made = makeSchoolItems(topic, 3, seed, "standard", false, [], system);
  return made.items.flatMap((it) => {
    const answer = workedAnswer(it.spec, system);
    return answer ? [{ question: it.question, answer, tier: it.tier ?? 1 }] : [];
  });
}

export async function teachTopic(topic: string, age: number | undefined, system: SchoolSystem, seed?: number): Promise<Worked> {
  const method = WORKED_METHODS[topic];
  const title = topicIn(topic)?.name ?? topic;
  const examples = workedExamples(topic, system, seed);
  let idea = method.idea, own = false;
  try {
    const voice = voiceOf("maths", age);
    // through the one assembler (lib/prompt/assemble.ts), so the call's ledger row names the prompt version; every part is the desk's own words
    const asked = assemble("worked-idea", {
      system: [say("stance", withManner(`You are a maths tutor for ${voice.who}. Explain the idea behind one topic in at most three short sentences, before the learner sees worked examples. Words only: write no digits and no worked numbers. No praise, no questions to the learner.`, voice))],
      prompt: [
        say("topic", `Topic: ${title}.`),
        say("method", `The method the desk will show, step by step: ${method.steps.join("; ")}.`),
        say("idea", `A plain version of the idea, for reference: ${method.idea}`),
        say("ask", "Write the idea in your own words for this learner."),
      ],
    }, { prompt: "\n" });
    const { json } = await text<{ idea: string }>({
      ...asked,
      schema: { type: "object", properties: { idea: { type: "string" } }, required: ["idea"] }, model: "fast", thinking: false, use: "worked-idea",
    });
    const clean = cleanIdea(json?.idea);
    if (clean) { idea = clean; own = true; }
  } catch { /* the authored idea stands: a lesson never fails for want of the model's wording */ }
  return { topic, title, idea, own, steps: [...method.steps], examples };
}
