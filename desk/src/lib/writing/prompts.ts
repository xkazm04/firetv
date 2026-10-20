/** The short prompts a writing episode offers, by the learner's band (rules/voice bandOf). Fixed in code: no model picks them. */
import type { Band } from "@/lib/rules/voice";

export interface WritingPrompt { id: string; title: string; ask: string; band: Band | "both" }

export const WRITING_PROMPTS: readonly WritingPrompt[] = [
  { id: "pet", title: "A pet worth having", ask: "Which pet would you choose, and why? Write one paragraph that says what you pick and gives a reason a reader could check.", band: "young" },
  { id: "break", title: "The best part of school", ask: "What is the best part of your school day? Write one paragraph with a clear opinion and an example from your own week.", band: "young" },
  { id: "screens", title: "Screens before bed", ask: "Should screens be put away an hour before bed? Write one paragraph that takes a side and backs it with something checkable.", band: "teen" },
  { id: "uniform", title: "School uniform", ask: "Should schools have a uniform? Write one paragraph that takes a side, gives evidence, and answers one point against you.", band: "teen" },
  { id: "city", title: "Cars in the city centre", ask: "Should cars be kept out of city centres? Write one paragraph: a claim, evidence for it, and a link back to the claim.", band: "teen" },
];

/** The prompts offered to a band: its own, then the ones for both. */
export function promptsFor(band: Band): WritingPrompt[] {
  return WRITING_PROMPTS.filter((p) => p.band === band || p.band === "both");
}

export const promptById = (id: unknown): WritingPrompt | undefined => WRITING_PROMPTS.find((p) => p.id === id);
