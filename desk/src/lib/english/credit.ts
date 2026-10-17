import type { SkillId } from "./types";

/** What counts as the child's own words is decided here, in code, not by the prompt. The lists are data a teacher can widen. */
export type Credit = "none" | "helped" | "own";

/** Words that, said alone, show no skill: a thanks, a yes, a greeting. A quote made only of these earns nothing. */
export const FORMULA_WORDS: readonly string[] = ["yes", "no", "ok", "okay", "thanks", "thank", "you", "hello", "hi", "bye", "sure", "fine", "great", "cool"];
/** A repair asks to repeat, clarify or confirm. Bare wh-words (what, which, where, how) are not markers: a '?' is the other way in. */
export const REPAIR_MARKERS: readonly string[] = ["again", "repeat", "mean", "slowly", "sorry", "pardon", "say", "spell", "understand"];
/** A request asks for something. A '?' also counts. */
export const REQUEST_MARKERS: readonly string[] = ["can", "could", "would", "please", "need", "want", "like", "may"];
/** Every other skill needs at least this many words. */
export const MIN_WORDS = 3;
/** Four consecutive words of a shown line is a copy. */
export const COPY_RUN = 4;

/** Small joining words: a run of a shown line that is the learner's own words but for one of these at its edge is still hers. */
const EDGE_WORDS: readonly string[] = ["the", "a", "an", "this", "that", "my", "your", "to", "of", "in", "on", "and", "is", "are"];

const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
/** Words of a text, lower case, no punctuation: spoken transcripts carry none. */
export const wordsOf = (text: string): string[] => [...text.matchAll(WORD)].map(m => m[0].toLowerCase().replace(/’/g, "'"));

function runs(have: string[], want: string[]): boolean {
  for (let i = 0; i + want.length <= have.length; i++) if (want.every((w, k) => have[i + k] === w)) return true;
  return false;
}
/**
 * Whether `text` repeats four or more consecutive words of a shown line, or, under four words, is wholly inside one.
 * A run the speaker already said in one of their own earlier replies in the scene (`own`, give or take a joining word
 * at its edge) is their own words, not a read-back: the partner echoing a learner's phrase back does not make saying it again a copy (lt-swap-2/recert-2).
 */
export function copiesShown(text: string, shown: readonly string[], own: readonly string[] = []): boolean {
  const said = wordsOf(text);
  if (!said.length) return false;
  const lines = shown.filter(Boolean).map(wordsOf), mine = own.filter(Boolean).map(wordsOf);
  // her words: the whole run, or the run less one joining word at an edge (the partner said "the promo code field" back to "the hidden promo code field")
  const hers = (run: string[]) => mine.some(m => runs(m, run) || (run.length >= COPY_RUN && ((EDGE_WORDS.includes(run[0]) && runs(m, run.slice(1))) || (EDGE_WORDS.includes(run[run.length - 1]) && runs(m, run.slice(0, -1))))));
  const copy = (run: string[]) => lines.some(l => runs(l, run)) && !hers(run);
  if (said.length < COPY_RUN) return copy(said);
  for (let i = 0; i + COPY_RUN <= said.length; i++) if (copy(said.slice(i, i + COPY_RUN))) return true;
  return false;
}
/** Whether the quote does what its skill's shape asks. */
function shaped(quote: string, skill: SkillId): boolean {
  const words = wordsOf(quote);
  if (skill === "repair") return quote.includes("?") || words.some(w => REPAIR_MARKERS.includes(w));
  if (skill === "request") return quote.includes("?") || words.some(w => REQUEST_MARKERS.includes(w));
  return words.length >= MIN_WORDS;
}
/** none: a formula or the wrong shape. helped: read back from what the scene showed. own: everything else. */
export function creditOf(quote: string, skill: SkillId, shown: readonly string[], own: readonly string[] = []): Credit {
  const words = wordsOf(quote);
  if (!words.length || words.every(w => FORMULA_WORDS.includes(w))) return "none";
  if (copiesShown(quote, shown, own)) return "helped";
  return shaped(quote, skill) ? "own" : "none";
}
