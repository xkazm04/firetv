/**
 * Slip keys (K1): a taught fix judged by the words that changed, not by its whole sentence.
 *
 * A fix moment keeps the learner's exact words (said) and the correction (better). A whole-sentence match almost never
 * happens again: none of the taught fix sentences in the 2026-10-14 LT corpus recurs verbatim. What does recur is the
 * slip itself, inside a new sentence ("My tomatoes is big." after "My tomatoes is one metr."). slipOf reduces a pair to
 * two short keys by a token-level longest common subsequence (the rules/diff.ts countDiff idiom): the slip key, the
 * changed said-side words with a neighbour ("tomatoes is"), and the fix key, the matching better-side words ("tomatoes
 * are"). Code then asks two questions of a reply, with no model call: does the slip stand in it again (slipIn), and
 * did the learner say the fix (findKey).
 *
 * Two tiers. Any key may ask the partner for a soft recast, which costs nothing if wrong. Only a guarded key may write
 * to the learner record: it holds a content word, or one of the KNOWN_SLIPS a teacher lists, and it is not something
 * the partner itself said in this scene (correct English cannot be a slip). The lists are data a teacher can widen, as
 * credit.ts's are.
 *
 * Pure data, no filesystem: the server, the cleaner, the view and the tests all import it.
 */

/** Words that carry grammar, not meaning. A key made only of these is too common to judge a learner by ("i will"). */
export const FUNCTION_WORDS: readonly string[] = [
  "a", "an", "the", "this", "that", "these", "those", "some", "any", "no", "not", "every", "each", "all", "both", "much", "many", "more", "most", "few", "less", "other", "another", "such", "own",
  "i", "me", "my", "mine", "myself", "you", "your", "yours", "he", "him", "his", "she", "her", "hers", "it", "its", "we", "us", "our", "ours", "they", "them", "their", "theirs",
  "there", "here", "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
  "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "done",
  "will", "would", "shall", "should", "can", "could", "may", "might", "must",
  "i'm", "you're", "he's", "she's", "it's", "we're", "they're", "i've", "you've", "we've", "they've", "i'll", "you'll", "he'll", "she'll", "we'll", "they'll", "i'd", "you'd", "he'd", "she'd", "we'd", "they'd",
  "don't", "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't", "can't", "won't", "wouldn't", "couldn't", "shouldn't", "haven't", "hasn't", "hadn't", "that's", "there's", "let's", "what's",
  "to", "of", "in", "on", "at", "by", "for", "with", "from", "about", "into", "onto", "over", "under", "up", "down", "out", "off", "as", "than",
  "and", "or", "but", "if", "because", "while", "though", "so", "then", "too", "very", "also", "just", "only", "even", "really", "still", "yet", "again", "always", "never", "often", "sometimes", "now",
  "yes", "ok", "okay", "please", "oh", "well",
];
/**
 * Ungrammatical pairs made only of function words that a teacher vouches for: a key that holds one of these may write
 * to the record although it has no content word. Never a pair that is right in some sentence ("i will", "is more").
 */
export const KNOWN_SLIPS: readonly string[] = [
  "we was", "they was", "you was", "he don't", "she don't", "it don't", "he have", "she have", "it have", "he do", "she do",
  "i is", "you is", "we is", "they is", "more better", "most best", "more worse",
];
/**
 * The right form of each KNOWN_SLIPS pair (LG-57), so code can name the fix of a known slip the learner says twice in
 * one scene before any moment taught it. One entry per KNOWN_SLIPS entry; a teacher widens both together.
 */
export const KNOWN_SLIP_FIXES: Readonly<Record<string, string>> = {
  "we was": "we were", "they was": "they were", "you was": "you were", "he don't": "he doesn't", "she don't": "she doesn't", "it don't": "it doesn't",
  "he have": "he has", "she have": "she has", "it have": "it has", "he do": "he does", "she do": "she does",
  "i is": "i am", "you is": "you are", "we is": "we are", "they is": "they are", "more better": "better", "most best": "best", "more worse": "worse",
};
/**
 * Words a Czech or Slavic speaker commonly uses in their home-language sense (a false friend), each with the sense meant
 * and the English that says it. A teacher may widen it, the way KNOWN_SLIPS is widened. Read by the partner prompt only:
 * the input holds no L1, so this list is assumed, never detected.
 */
export const KNOWN_FALSE_FRIENDS: readonly string[] = [
  "eventually used for 'possibly' (eventuálně) - say 'possibly' or 'maybe'",
  "actual or actually used for 'current' or 'currently' (aktuální) - say 'current' or 'currently'",
  "sympathetic used for 'nice' (sympatický) - say 'nice' or 'likeable'",
  "concurrence used for 'competition' (konkurence) - say 'competition'",
  "become used for 'happen' (bude) - say 'happen'",
];
/**
 * A slip key preceded by one of these is no slip: after an auxiliary, a modal or "to" the bare form is right ("Did he
 * come", "Can he come", "to come").
 */
export const BARE_LICENSORS: readonly string[] = [
  "do", "does", "did", "don't", "doesn't", "didn't", "will", "would", "shall", "should", "can", "could", "may", "might", "must",
  "won't", "wouldn't", "can't", "couldn't", "shouldn't", "to",
];
/** Number words and digits are one class: "two metre" is the same slip as "one metre". */
const NUMBERS = new Set(["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety", "hundred", "thousand"]);
/** At most this many words are added to a key, beyond its first neighbour, to reach a content word. */
export const EXTEND_MAX = 2;

/** The two keys of a fix: the slip as the learner said it, and the fix in its place. Lower-case words, one space apart. */
export interface SlipKeys { slip: string; fix: string }

const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const FUNCTION = new Set(FUNCTION_WORDS), LICENSORS = new Set(BARE_LICENSORS);
const fold = (w: string) => NUMBERS.has(w) || /^\p{N}+$/u.test(w) ? "#" : w;
interface Tok { word: string; key: string; at: number; end: number }
type Span = [number, number, number, number];
const toks = (text: string): Tok[] => [...text.matchAll(WORD)].map(m => { const word = m[0].toLowerCase().replace(/’/g, "'"); return { word, key: fold(word), at: m.index!, end: m.index! + m[0].length }; });
const keyWords = (key: string) => toks(key).map(t => t.key);
const runAt = (have: string[], want: string[], i: number) => want.every((w, k) => have[i + k] === w);
const holds = (have: string[], want: string[]) => { for (let i = 0; i + want.length <= have.length; i++) if (runAt(have, want, i)) return true; return false; };
const content = (w: string) => w !== "#" && !FUNCTION.has(w);

/** Whether a slip key may write to the learner record: it holds a content word, or a pair on KNOWN_SLIPS. */
export function guarded(slip: string): boolean {
  const words = keyWords(slip);
  return words.some(content) || KNOWN_SLIPS.some(k => holds(words, keyWords(k)));
}

/**
 * The slip and fix keys of a fix: a token LCS of said against better (case, punctuation and number words aside), each
 * run of changed words taken with its neighbour. A changed word keeps the word before it (or after it, at the start); a
 * dropped or added word keeps both neighbours, so "is more better" -> "is better" and "like creeper" -> "like the
 * creeper". A key with no content word and no known pair grows outward by up to EXTEND_MAX shared words until it holds
 * one. The slip key has at least two words. Of several changes the first whose own key is guarded is kept, then the
 * first guarded once grown, then the first soft one. Null when the two do not differ in a way a key can hold.
 *
 * 'My tomatoes is one metre' / 'My tomatoes are one metre' -> { slip: "tomatoes is", fix: "tomatoes are" }
 */
export function slipOf(said: string, better: string): SlipKeys | null {
  const A = toks(said), B = toks(better), n = A.length, m = B.length;
  if (!n || !m) return null;
  const L: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i].key === B[j].key ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  // the matched pairs, walked as countDiff walks them; the runs between two of them are the changes
  const pairs: Array<[number, number]> = [[-1, -1]];
  for (let i = 0, j = 0; i < n && j < m;) {
    if (A[i].key === B[j].key) { pairs.push([i, j]); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  pairs.push([n, m]);
  // each change as a ranked candidate: its own key guarded (0), guarded once grown (1), a soft key (2, 3)
  let best: { rank: number; keys: SlipKeys } | null = null;
  for (let k = 0; k + 1 < pairs.length; k++) {
    const a0 = pairs[k][0] + 1, a1 = pairs[k + 1][0], b0 = pairs[k][1] + 1, b1 = pairs[k + 1][1];
    if (a0 === a1 && b0 === b1) continue;
    // [said from, said to, better from, better to]: a change keeps one neighbour, a drop or an addition both
    const left = a0 > 0, right = a1 < n, swap = a0 < a1 && b0 < b1, after = right && (!swap || !left) ? 1 : 0;
    const base: Span = [a0 - (left ? 1 : 0), a1 + after, b0 - (left ? 1 : 0), b1 + after];
    let grown: Span = base;
    for (let extra = 0; extra < EXTEND_MAX && !guarded(spanSlip(A, grown)); extra++) {
      const [s0, s1, t0, t1] = grown;
      if (s0 > 0 && t0 > 0 && A[s0 - 1].key === B[t0 - 1].key) grown = [s0 - 1, s1, t0 - 1, t1];
      else if (s1 < n && t1 < m && A[s1].key === B[t1].key) grown = [s0, s1 + 1, t0, t1 + 1];
      else break;
    }
    for (const [rank, span] of [[0, base], [1, grown], [2, base], [3, grown]] as Array<[number, Span]>) {
      const slip = spanSlip(A, span), fix = B.slice(span[2], span[3]).map(t => t.word).join(" ");
      if (span[1] - span[0] < 2 || !fix || keyWords(slip).join(" ") === keyWords(fix).join(" ") || (rank < 2 && !guarded(slip))) continue;
      if (!best || rank < best.rank) best = { rank, keys: { slip, fix } };
      break;
    }
  }
  return best?.keys ?? null;
}
const spanSlip = (A: Tok[], s: Span) => A.slice(s[0], s[1]).map(t => t.word).join(" ");

/** Where `key` stands in `text`, word for word (number words as one class), as the excerpt of `text` that says it; null when it does not. */
export function findKey(text: string, key: string): string | null {
  const want = keyWords(key), have = toks(text), words = have.map(t => t.key);
  if (!want.length) return null;
  for (let i = 0; i + want.length <= have.length; i++) if (runAt(words, want, i)) return text.slice(have[i].at, have[i + want.length - 1].end);
  return null;
}
/**
 * Whether `text` says the slip again: the slip key stands in it, not straight after an auxiliary, a modal or "to"
 * (BARE_LICENSORS: "Did he come" is no "he come"), and the fix key is nowhere in it. The excerpt of `text` that says
 * the slip, or null. The key-match helper later items build on (self-repair, spaced return, a line per room).
 */
export function slipIn(text: string, keys: SlipKeys): string | null {
  // a fix the slip itself holds ("more better" -> "better") is in the text whenever the slip is: it clears nothing
  const inside = holds(keyWords(keys.slip), keyWords(keys.fix));
  return !inside && findKey(text, keys.fix) !== null ? null : slipStands(text, keys.slip);
}
/** Where the slip key stands in `text` as a slip: word for word, and not straight after one of the BARE_LICENSORS. Null when it does not. */
export function slipStands(text: string, slip: string): string | null {
  const want = keyWords(slip), have = toks(text), words = have.map(t => t.key);
  if (want.length < 2) return null;
  for (let i = 0; i + want.length <= have.length; i++)
    if (runAt(words, want, i) && !(i > 0 && LICENSORS.has(have[i - 1].word))) return text.slice(have[i].at, have[i + want.length - 1].end);
  return null;
}
/** Whether a pair may write to the learner record in a scene whose partner said `partnerLines`: guarded, and never words the partner said. */
export function recordTier(keys: SlipKeys, partnerLines: readonly string[]): boolean {
  return guarded(keys.slip) && !partnerLines.some(l => !!l && findKey(l, keys.slip) !== null);
}
/** Whether two slip keys are the same slip: one holds the other, word for word. */
export function sameSlip(a: string, b: string): boolean {
  const x = keyWords(a), y = keyWords(b);
  return !!x.length && !!y.length && (x.length >= y.length ? holds(x, y) : holds(y, x));
}
/** The keys of a taught item or moment: stored ones when it carries both, else worked out from its words. Fix items only. */
export function keysOf(item: { kind: "fix" | "word"; said: string; better: string; slip?: string; fix?: string }): SlipKeys | null {
  if (item.kind !== "fix") return null;
  return item.slip && item.fix ? { slip: item.slip, fix: item.fix } : slipOf(item.said, item.better);
}
