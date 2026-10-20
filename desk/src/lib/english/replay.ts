/**
 * The replay's own check after Back on a moment (LG-4 recert-7, LT-petra-38-J4-2): the partner names the words of the after
 * form the learner's answer should use (`form`, internal: it never reaches the TV or the phone), and code holds that claim
 * to the coaching. In recert-7 the replay question was fresh but did not call for the form, and 0 of 4 replies used it.
 *
 * recert-8 (0 of 4 again, with the prompt alone asking for it): code now reads the question itself. The coached frame
 * (frameOf) is the moment's fix key, the words that changed kept and an unchanged content word left open ("have a ___" for
 * "I have cat" -> "I have a cat"), or a word moment's English whole. Its anchors are the words a question must use for its
 * natural answer to reuse the frame: "What do you have in your garden?" names no cat, and "I have tomatoes" answers it.
 * Limits, known: words are matched as written (no lemmas or synonyms), and no question can force an article or a plural;
 * a question that names the anchors makes the frame the easy answer, not the only one.
 */
import { wordsOf } from "./credit";
import { fitsBand } from "./gate";
import { findPhrase } from "./review";
import { keysOf, slipStands } from "./slip";
import type { Band, Moment } from "./types";

/** Words that carry no form of their own: a `form` that shares only these with the after form names none of it. */
const LIGHT = new Set(["i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "the", "a", "an", "this", "that", "my", "your", "his", "its", "our", "their", "to", "of", "in", "on", "at", "for", "with", "and", "or", "but", "so", "is", "are", "am", "was", "were", "be", "do", "does", "did"]);
/** Auxiliaries and their negatives: a question asks with the positive one ("Can it…?" for "it cannot"), so none is an anchor. */
const AUX = new Set(["can", "cannot", "can't", "could", "couldn't", "will", "won't", "would", "wouldn't", "should", "shouldn't", "must", "may", "might", "don't", "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't", "not", "been", "being"]);
/** The after form's content words; an after form of light words only (e.g. "on the") is held to all its words. */
export function contentWords(text: string): string[] {
  const all = wordsOf(text), content = all.filter(w => !LIGHT.has(w));
  return content.length ? content : all;
}
/** One spelling per word: "can't" and "cannot" are the same form. */
const norm = (w: string) => w === "can't" ? "cannot" : w;
const tokens = (text: string) => [...text.matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)].map(m => ({ word: norm(m[0].toLowerCase().replace(/’/g, "'")), at: m.index!, end: m.index! + m[0].length }));
const anchorable = (w: string) => !LIGHT.has(w) && !AUX.has(w);

/**
 * The coached frame of a moment: `words` in order, null for an open slot; `anchors`, the words a replay question must use;
 * `slip`, the slip key a reply must not say again. A fix with keys (slip.ts): its fix key, with an unchanged content word
 * after the first changed word left open (the thing the frame is said of: "have a ___"); words before it, and a key with no
 * changed word (a dropped word, "I am work" -> "I work"), stay whole. Anchors are the changed content words, else the key's. Anything else: the after
 * form's words whole, anchored on its content words.
 */
export interface Frame { words: (string | null)[]; anchors: string[]; slip?: string }
export function frameOf(m: Pick<Moment, "kind" | "said" | "better" | "slip" | "fix">): Frame {
  const keys = keysOf(m);
  if (!keys) {
    const words = tokens(m.better).map(t => t.word), anchors = words.filter(anchorable);
    return { words, anchors: anchors.length ? anchors : words.filter(w => !LIGHT.has(w)) };
  }
  const fix = tokens(keys.fix).map(t => t.word), left = tokens(keys.slip).map(t => t.word);
  const changed = fix.map(w => { const at = left.indexOf(w); if (at < 0) return true; left.splice(at, 1); return false; });
  const first = changed.indexOf(true), words = fix.map((w, i) => first >= 0 && i > first && !changed[i] && anchorable(w) ? null : w);
  const moved = fix.filter((w, i) => changed[i] && anchorable(w));
  return { words, anchors: moved.length ? moved : fix.filter(anchorable), slip: keys.slip };
}
/** Whether a replay question invites the frame: it uses every anchor, as written. */
export function invitesFrame(question: string, frame: Frame): boolean {
  const have = new Set(tokens(question).map(t => t.word));
  return frame.anchors.every(a => have.has(a));
}
/**
 * Where a reply says the coached frame, an open slot taking any one word ("I have a dog" says "have a ___"), and its slip
 * key does not stand in it: the reply's words that say it, or null. Read beside review.ts usesForm, which wants the key exact.
 */
export function usesFrame(reply: string, frame: Frame): string | null {
  if (!frame.words.length || frame.words.every(w => w === null)) return null;
  if (frame.slip && slipStands(reply, frame.slip) !== null) return null;
  const have = tokens(reply), n = frame.words.length;
  for (let i = 0; i + n <= have.length; i++)
    if (frame.words.every((w, k) => w === null || have[i + k].word === w)) return reply.slice(have[i].at, have[i + n - 1].end);
  return null;
}
/**
 * recert-11 (Viktor, "Can you ask a good school question?"): a replay question that asks the learner to ask, or to make up,
 * a question is a step out of the scene, not a line in it. Read on the words as written: "can/could/will/would you ask",
 * "ask me", and "ask" with a/an/one/another/some/any ... "question(s)" in the same sentence. No out-of-role classifier.
 */
const META = /\b(?:can|could|will|would)\s+you\s+ask\b|\bask\s+me\b|\bask\s+(?:a|an|one|another|some|any)\b[^.!?]*\bquestions?\b/i;
export const asksForAQuestion = (question: string) => META.test(question.replace(/’/g, "'"));
/**
 * recert-12 (LT-viktor-67-J4): a coached form that is a question the learner asks ("Did you have school today?") is never
 * the partner's line to the learner ("Grandpa, did you have school every day?"): the roles are inverted. Read on the
 * words as written: the form ends in "?", the replay question is a question, and it holds the form's opening words
 * (up to three: auxiliary, subject, verb) in a row.
 */
export function asksCoachedQuestion(question: string, after: string): boolean {
  if (!after.trim().endsWith("?") || !question.includes("?")) return false;
  const open = tokens(after).slice(0, 3).map(t => t.word), have = tokens(question).map(t => t.word);
  for (let i = 0; i + open.length <= have.length; i++) if (open.every((w, k) => have[i + k] === w)) return true;
  return false;
}
/**
 * Why a Back replay is no replay, or null when it holds: its `form` must name some content word of the after form, case
 * apart; its question must not say the after form itself (the partner never supplies the learner's answer), unless that
 * form is one word, which a question can only invite by naming ("Do you often…?" for "often"); it must ask the learner
 * something in the scene, never ask them to ask a question (recert-11); and, given the moment's frame (recert-8), the
 * question must invite it. Given the band (recert-12), the question must fit it, and given a question form, must not ask the learner the coached
 * question when the coached form is one the learner asks.
 */
export function replayRefused(question: string, form: unknown, after: string, frame?: Frame, band?: Band, scene?: string[]): string | null {
  const want = new Set(contentWords(after));
  if (typeof form !== "string" || !wordsOf(form).some(w => want.has(w))) return "The replay question did not call for the coached form.";
  if (wordsOf(after).length > 1 && findPhrase(question, after) !== null) return "The replay question said the coached form itself.";
  if (asksForAQuestion(question)) return "The replay question asked the learner to ask a question instead of asking them something in the scene.";
  if (asksCoachedQuestion(question, after)) return "The replay question asked the learner the coached question itself.";
  // recert-12 (LT-viktor-67-J4): a Back replay is held to the band the way a partner line is; bandLine can only cut it, never fit it
  if (band && !fitsBand(question, band)) return "The replay question was above the learner's level.";
  if (frame && !invitesFrame(question, frame)) return "The replay question did not invite the coached frame.";
  // recert-13 (LT-viktor-67-J4-3): the question stays on the scene (its goal, open step or cue), not on a new topic
  if (scene && !staysOnScene(question, scene)) return "The replay question left the scene.";
  return null;
}
/** Words that open any question or instruction and so say nothing of a scene's topic. */
const FILLER = new Set(["what", "where", "when", "who", "whom", "whose", "which", "why", "how", "does", "did", "do", "today", "ask", "about", "try", "say", "tell", "hi", "hello", "please", "your", "you", "can", "could", "would", "will", "there", "here", "some", "any", "much", "many", "often", "usually", "like", "have", "has", "get", "go"]);
const topicWords = (text: string) => wordsOf(text).filter(w => !LIGHT.has(w) && !AUX.has(w) && !FILLER.has(w) && w.length > 2).map(w => w.length > 3 ? w.replace(/s$/, "") : w);
/**
 * Whether a replay question shares a content word with the scene's texts (goal, open step, cue, the lines said so far; a plural counts as its singular). Pure; with no topic word in
 * the scene at all there is nothing to hold the question to, so it stays.
 */
export function staysOnScene(question: string, scene: string[]): boolean {
  const topic = new Set(scene.flatMap(topicWords));
  if (!topic.size) return true;
  return topicWords(question).some(w => topic.has(w));
}
