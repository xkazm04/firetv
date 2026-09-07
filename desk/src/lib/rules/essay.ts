/**
 * Essay forensics — the parts that are rules, done before any model is asked.
 *
 * Sentence splitting, length, connectors and a first-pass role guess are all deterministic. The
 * model is asked afterwards to *comment* on a text whose sentences are already numbered and
 * measured, and to return verdicts anchored to sentence numbers — so a highlight can only land on
 * a sentence that exists.
 */
export type Role = "claim" | "evidence" | "link" | "context";
export interface Sentence { n: number; text: string; words: number; connectors: string[]; role: Role; }

const CONNECTORS = /\b(because|therefore|however|although|which means|so that|as a result|for example|for instance|but|since|whereas|in contrast|this suggests|which suggests)\b/gi;
const EVIDENCE = /\b(\d+%?|per cent|percent|research|study|studies|report(ed|s)?|found|data|measured|according to|for example|for instance)\b/i;
const LINK = /^(therefore|so|this (means|shows|suggests)|as a result|in conclusion|which is why)/i;

export function splitSentences(text: string): Sentence[] {
  const parts = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+(?=[A-Z"“])/);
  return parts.filter(Boolean).map((t, i) => {
    const connectors = (t.match(CONNECTORS) || []).map((c) => c.toLowerCase());
    const role: Role = LINK.test(t) ? "link" : EVIDENCE.test(t) ? "evidence" : "claim";
    return { n: i + 1, text: t, words: t.split(/\s+/).length, connectors, role };
  });
}

export function paragraphStats(sentences: Sentence[]) {
  const words = sentences.reduce((a, s) => a + s.words, 0);
  return {
    sentences: sentences.length, words,
    avgWords: sentences.length ? Math.round((words / sentences.length) * 10) / 10 : 0,
    claims: sentences.filter((s) => s.role === "claim").length,
    evidence: sentences.filter((s) => s.role === "evidence").length,
    links: sentences.filter((s) => s.role === "link").length,
    connectors: sentences.reduce((a, s) => a + s.connectors.length, 0),
  };
}

export const ANALYSIS_TYPES = [
  { id: "structure", name: "Structure", promise: "Which sentence does which job — claim, evidence, link — and what is missing.", lens: "Judge each sentence by its role in the paragraph: is there a claim, is it followed by evidence, is there a link back to the argument?" },
  { id: "argument", name: "Argument", promise: "Does the paragraph take a side, and does every sentence push the same way?", lens: "Judge whether the paragraph argues one thing consistently, and where a sentence weakens, contradicts or wanders from the claim." },
  { id: "evidence", name: "Evidence", promise: "What here is a fact a reader can check, and what is only an opinion.", lens: "Judge each sentence on whether it gives checkable support - a number, a mechanism, an example - or only asserts." },
  { id: "language", name: "Language", promise: "Sentence length, rhythm, connectors, repeated words.", lens: "Judge the writing itself: monotonous sentence length, missing connectors, repetition, vague words like 'bad' or 'important'." },
] as const;
export type AnalysisType = (typeof ANALYSIS_TYPES)[number]["id"];
