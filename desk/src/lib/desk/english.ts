/** A sentence from the student: the rule table decides, the model explains. */
import { text } from "../engines/text";
import { resolveEnglish, cardText } from "../rules/english";
import { voiceOf, withManner } from "../rules/voice";
import type { EnglishAnalysis } from "../session/store";

const SCHEMA = { type: "object", properties: { explanation: { type: "string", description: "The caption itself, said to the learner as \"you\": at most two short sentences, 30 words. Not a report of what you did." } }, required: ["explanation"] };

/** The withholding rule of the caption, in every voice: the rule card decides the tense, the caption never writes a form. */
export const ENGLISH_WITHHOLD =
  "Socratic rules, absolute: never write the corrected sentence, never state a verb form or an ending, not even as an example (no \"go → went\"), never repeat a form from the rule card; you may quote only words they wrote. ";

/** The caption of a TV screen, said to the learner: "you", two short sentences, and never the form itself. */
const systemFor = (age?: number) => {
  const v = voiceOf("english", age);
  return withManner(
    "You are an English tutor talking to " + v.who + " about the sentence they just wrote; your words are the caption under it on a TV screen, read aloud. " +
    "Speak to them directly as \"you\"; never call them the student, the learner, he, she or they. " +
    "At most two short sentences, 30 words in total. Plain English, no markdown. Write only the caption itself, never a description of what you did or of these rules, and never mention the rule card. " +
    ENGLISH_WITHHOLD +
    "Point at the time word and the tense it asks for, and leave the form for them to find. The rule card is final: do not contradict it and do not decide the tense yourself.",
    v,
  );
};

/** `age` is the seated profile's; without one the caption speaks as it always has (rules/voice, the teen band). */
export async function analyseSentence(sentence: string, age?: number): Promise<EnglishAnalysis> {
  const card = resolveEnglish(sentence);
  const { json, provider } = await text<{ explanation: string }>({
    system: systemFor(age),
    prompt: `They wrote: "${sentence}"\n\nRule card (for you only; they never see it):\n${cardText(card)}\n\n` +
      (card.conflict ? "Tell them, kindly, why the tense they used does not fit the time word, and which tense the time word asks for." : "Tell them what they did right and name the time word that made it right."),
    schema: SCHEMA, model: "fast", use: "english-sentence",
  });
  return { sentence, card, explanation: json.explanation, provider };
}
