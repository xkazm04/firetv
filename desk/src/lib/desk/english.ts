/** A sentence from the student: the rule table decides, the model explains. */
import { text } from "../engines/text";
import { resolveEnglish, cardText } from "../rules/english";
import type { EnglishAnalysis } from "../session/store";

const SCHEMA = { type: "object", properties: { explanation: { type: "string" } }, required: ["explanation"] };

export async function analyseSentence(sentence: string): Promise<EnglishAnalysis> {
  const card = resolveEnglish(sentence);
  const { json, provider } = await text<{ explanation: string }>({
    system: "You are an English tutor for a Czech teenager. Explain in plain English, two sentences at most, to be read aloud. Never write the corrected sentence or the verb form; point at the time word and the rule. Do not contradict the rule card.",
    prompt: `The student wrote: "${sentence}"\n\nRule card:\n${cardText(card)}\n\n` +
      (card.conflict ? "Explain, kindly, why the tense they used does not fit the time word, and which tense the time word asks for." : "Confirm what they did right and name the time word that made it right."),
    schema: SCHEMA, model: "fast",
  });
  return { sentence, card, explanation: json.explanation, provider };
}
