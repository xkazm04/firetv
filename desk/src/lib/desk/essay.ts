/**
 * Forensic essay analysis. Sentences are split, measured and given a first-pass role in code;
 * the model then judges through the chosen lens and returns verdicts anchored to sentence
 * numbers, so every highlight lands on a sentence that exists.
 */
import { text } from "../engines/text";
import { ANALYSIS_TYPES, paragraphStats, splitSentences, type AnalysisType } from "../rules/essay";
import { addHistory } from "../session/learners";
import type { EssayAnalysis } from "../session/store";

const SCHEMA = {
  type: "object",
  properties: {
    verdicts: { type: "array", items: { type: "object", properties: {
      n: { type: "integer" }, verdict: { type: "string", enum: ["strong", "faulty", "neutral"] }, note: { type: "string" } },
      required: ["n", "verdict", "note"] } },
    summary: { type: "string" },
  },
  required: ["verdicts", "summary"],
};

export async function analyseEssay(raw: string, type: AnalysisType, learnerId: string): Promise<EssayAnalysis> {
  const sentences = splitSentences(raw);
  const stats = paragraphStats(sentences);
  const lens = ANALYSIS_TYPES.find((t) => t.id === type) ?? ANALYSIS_TYPES[0];
  const numbered = sentences.map((s) => `${s.n}. ${s.text}  [${s.words} words, first-pass role: ${s.role}]`).join("\n");
  const { json, provider } = await text<{ verdicts: EssayAnalysis["verdicts"]; summary: string }>({
    system: `You are a writing tutor for a 15-year-old. Lens for this reading: ${lens.name} — ${lens.lens} ` +
      `Give one verdict per sentence, by its number: 'strong' for something done well, 'faulty' for a real problem, 'neutral' otherwise. ` +
      `Each note is one short sentence a student can act on, no praise-padding. Never rewrite their sentences for them. Then one summary sentence. Plain text, to be read aloud.`,
    prompt: `The student's paragraph, sentence by sentence:\n${numbered}\n\nCounts: ${stats.sentences} sentences, ${stats.claims} first-pass claims, ${stats.evidence} evidence, ${stats.connectors} connectors, average ${stats.avgWords} words.`,
    schema: SCHEMA, model: "best",
  });
  // A highlight may only land on a sentence number that exists. Anything else the model returned —
  // a number off either end, or a `verdicts` that is not a list at all — is dropped, not shown.
  const valid = new Set(sentences.map((s) => s.n));
  const verdicts = (Array.isArray(json?.verdicts) ? json.verdicts : []).filter((v) => valid.has(v?.n));

  // The reading happened, so the learner record says so — the same one-line episode Math Buddy
  // writes after a marked set, from counts the reading actually produced, never invented. A
  // paragraph with no sentences in it is not an episode.
  if (sentences.length) {
    const faulty = verdicts.filter((v) => v.verdict === "faulty").length;
    addHistory(learnerId, {
      at: Date.now(), kind: "writing", label: lens.name,
      detail: `${faulty} of ${sentences.length} sentence${sentences.length === 1 ? "" : "s"} to fix`,
    });
  }

  return { text: raw, type, sentences, stats, verdicts, summary: json.summary, provider };
}
