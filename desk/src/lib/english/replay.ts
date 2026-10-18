/**
 * The replay's own check after Back on a moment (LG-4 recert-7, LT-petra-38-J4-2): the partner names the words of the after
 * form the learner's answer should use (`form`, internal: it never reaches the TV or the phone), and code holds that claim
 * to the coaching. In recert-7 the replay question was fresh but did not call for the form, and 0 of 4 replies used it.
 */
import { wordsOf } from "./credit";
import { findPhrase } from "./review";

/** Words that carry no form of their own: a `form` that shares only these with the after form names none of it. */
const LIGHT = new Set(["i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "the", "a", "an", "this", "that", "my", "your", "his", "its", "our", "their", "to", "of", "in", "on", "at", "for", "with", "and", "or", "but", "so", "is", "are", "am", "was", "were", "be", "do", "does", "did"]);
/** The after form's content words; an after form of light words only (e.g. "on the") is held to all its words. */
export function contentWords(text: string): string[] {
  const all = wordsOf(text), content = all.filter(w => !LIGHT.has(w));
  return content.length ? content : all;
}
/**
 * Why a Back replay is no replay, or null when it holds: its `form` must name some content word of the after form, case
 * apart, and its question must not say the after form itself (the partner never supplies the learner's answer).
 */
export function replayRefused(question: string, form: unknown, after: string): string | null {
  const want = new Set(contentWords(after));
  if (typeof form !== "string" || !wordsOf(form).some(w => want.has(w))) return "The replay question did not call for the coached form.";
  if (findPhrase(question, after) !== null) return "The replay question said the coached form itself.";
  return null;
}
