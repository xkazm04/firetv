/**
 * LG-5, turn-level easing: the learner's last reply says they did not follow, so the partner's very next line gets simpler.
 * The detection is code (this file, pure, no model call); only the phrasing of the easier question is the model's.
 * The length cap on a line is LG-56 (heldBand), not here.
 */
const fold = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
/**
 * Czech function words and common replies, folded; a learner who answers in them has left English. Never an English
 * word: "to" and "ten" are left out, so "Ten." or "To school" is a short English answer, not Czech.
 */
const CZECH_WORDS = new Set(("ja je jsem jsi jsme ne ano jo ta se si na ze co jak ale taky tady tam moc bych chci mam nemam " +
  "nevim nerozumim nechapu ahoj dekuji prosim dobry dobre dobry den pes kocka dum skola proc kdy kde nikdo neco").split(" "));
const NOT_UNDERSTOOD = /\b(nevim|nerozumim|nechapu|i do not know|i dont know|i don t know|do not understand|dont understand|don t understand|i do not understand|what do you mean|what does (?:it|that|this) mean)\b/;
/** "What?" said alone, or with a sorry or a pardon: a "what" inside the learner's own question ("What do you sell?") is not lost. */
const BARE_WHAT = new Set(["what", "sorry", "pardon", "eh", "huh"]);

/** True when most of a reply's words are Czech (or carry Czech letters English does not use). */
export function mostlyCzech(reply: string): boolean {
  const words = reply.split(/[^\p{L}']+/u).filter(Boolean);
  if (!words.length) return false;
  const czech = words.filter(w => CZECH_WORDS.has(fold(w)) || /[ěščřžůňťďýáíúó]/i.test(w)).length;
  return czech * 2 >= words.length;
}

/** The reply says, in so many words, that the learner did not understand or does not know. Whole words, diacritics ignored. */
export function saysLost(reply: string): boolean {
  const plain = fold(reply).replace(/['’]/g, " ").replace(/[^a-z ]+/g, " ").replace(/\s+/g, " "), words = plain.trim().split(" ");
  return NOT_UNDERSTOOD.test(plain) || (words.includes("what") && words.every(w => BARE_WHAT.has(w)));
}

/**
 * `replies` are the learner's lines, oldest first, ending with the one just sent; `supported` is whether help was open for it.
 * Lost when the last reply is mostly Czech or says it did not understand, or help was asked for two replies running.
 */
export function learnerLost(replies: readonly { text: string; supported?: boolean }[]): boolean {
  const last = replies.at(-1);
  if (!last) return false;
  if (mostlyCzech(last.text) || saysLost(last.text)) return true;
  return replies.length >= 2 && !!last.supported && !!replies.at(-2)?.supported;
}

/** One short instruction for the turn call, ahead of the struggles and independent branches. */
export const EASE_INSTRUCTION = "The learner did not follow your last line. Ask one short question they can answer with one word, using no new vocabulary: say your last question again more simply, stay in the scene, and never repeat the same sentence.";
