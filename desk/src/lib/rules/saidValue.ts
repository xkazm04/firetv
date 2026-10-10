/**
 * The gate that decides whether a value the model wrote down was said by the learner (X5). It can only REFUSE a settle:
 * a value that fails here settles nothing and writes no learner record, so a model's guess never marks an item.
 *
 * `saidIn(value, transcript)` is true only when the value's digits, function names and minus sign are all found in what was
 * said. The transcript is first folded with the closed number-word tables (numberWords.ts) so 'eleven twelfths' offers 11 and 12.
 * It fails closed: a value the rules cannot ground (a spoken 'x plus C' for 'x + C') is not heard.
 */
import { figuresOfCzech, figuresOfEnglish, fold } from "./numberWords";

/** The longest transcript the explain route takes (X5); the phone's box carries the same cap. */
export const EXPLAIN_TRANSCRIPT_MAX = 1000;

/** The closed alias table: a function name in a value is heard when any alias of its group is in the transcript (folded, on word boundaries). */
export const FUNCTION_ALIASES: Record<string, string[]> = {
  sin: ["sin", "sine", "sinus"],
  cos: ["cos", "cosine", "cosinus", "kosinus"],
  tan: ["tan", "tangent", "tangens"],
  log: ["ln", "log", "natural log", "logarithm", "logaritmus"],
  sqrt: ["sqrt", "root", "square root", "odmocnina"],
  exp: ["e", "exp", "exponential"],
  pi: ["pi", "π", "pí"],
};
/** The names a value may carry, by their group. */
const GROUP_OF: Record<string, string> = { sin: "sin", cos: "cos", tan: "tan", ln: "log", log: "log", sqrt: "sqrt", e: "exp", exp: "exp", pi: "pi", "π": "pi" };

const edge = (a: string) => new RegExp(`(?<![\\p{L}])${fold(a.toLowerCase())}(?![\\p{L}])`, "u");
const ALIAS_RES: Record<string, RegExp[]> = Object.fromEntries(Object.entries(FUNCTION_ALIASES).map(([g, as]) => [g, as.map(edge)]));

const runs = (s: string) => (s.match(/\d+/g) ?? []).map((r) => r.replace(/^0+(?=\d)/, ""));
const superscripts = (s: string) => s.replace(/²/g, "^2").replace(/³/g, "^3");

/**
 * The closed table of phrases that anchor a learner's own answer (X6), English and Czech, each matched as whole words on the folded lowercase transcript.
 * Bare 'is', 'equals' and '=' are never cues: a learner who reads the question aloud says them.
 */
export const ANSWER_CUES: string[] = [
  "got", // 'I got five', 'and got three quarters'
  "the answer is", // 'the answer is x squared'
  "my answer is", // 'my answer is eleven twelfths'
  "that is", // 'so that is five'
  "vyslo mi", // 'vyšlo mi jedenáct dvanáctin'
  "vychazi", // 'vychází mi pět'
];
const CUE_RES = ANSWER_CUES.map((c) => new RegExp(String.raw`(?<![\p{L}])${fold(c.toLowerCase()).replace(/ /g, String.raw`\s+`)}(?![\p{L}])`, "gu"));
/** The letters of a value that must be said as a whole letter (C is the constant). */
const LETTERS = new Set(["x", "y", "z", "t", "n", "c"]);
const UNIT_WORDS = String.raw`centimet\p{L}*|met\p{L}*|cm|m`;

/** Is the value (as the model wrote it) in what the learner said (or typed)? */
export function saidIn(value: string, transcript: string): boolean {
  const v = value.trim(), t = transcript.trim();
  if (!v || !t) return false;
  // the transcript as figures, plus the exponent words ('to the power of N' already carries N as a figure)
  const folded = figuresOfEnglish(figuresOfCzech(t));
  const low = fold(folded.toLowerCase());
  const saidTwo = runs(superscripts(folded)).includes("2") || /(?<![\p{L}])squared(?![\p{L}])|na druhou/u.test(low) || low.includes("²");
  // an area unit (cm2, m2) carries a 2 that is its exponent, not a figure; it is heard as the unit said, not as a digit
  let vl = fold(superscripts(v).toLowerCase());
  const unitless = vl.replace(/(?<![\p{L}])(c?m)\^?2(?!\d)/gu, "$1");
  const area = unitless !== vl;
  vl = unitless;
  const mine = runs(vl);
  if (area && !saidTwo && !/(?<![\p{L}])(?:square|sq)\.?\s+(?:centimet\p{L}*|met\p{L}*|cm|m)(?![\p{L}])|(?<![\p{L}])ctverecn/u.test(low)) return false;
  // the transcript as an ordered text of figures: the unit's own 2 is taken out, then 'squared' and 'cubed' are a figure where they are said
  let ordered = superscripts(low);
  if (area) {
    ordered = ordered.replace(new RegExp(String.raw`(?<![\p{L}])(${UNIT_WORDS})\s*(?:\^\s*2|2)(?!\d)`, "gu"), "$1 ");
    ordered = ordered.replace(new RegExp(String.raw`(?<![\p{L}])(${UNIT_WORDS})\s+squared(?![\p{L}])`, "gu"), "$1 ");
  }
  ordered = ordered.replace(/(?<![\p{L}])squared(?![\p{L}])|na druhou/gu, " 2 ").replace(/(?<![\p{L}])cubed(?![\p{L}])|na treti/gu, " 3 ");
  // the last cue anchors the answer: the value's figures are the figures that start at the first figure after it, in order; with no cue they are all of them
  let from = 0, anchored = false;
  for (const re of CUE_RES) for (const m of ordered.matchAll(re)) from = Math.max(from, m.index + m[0].length), (anchored = true);
  const heard = runs(ordered.slice(from));
  if (anchored ? mine.some((r, i) => heard[i] !== r) || heard.length < mine.length : heard.length !== mine.length || mine.some((r, i) => heard[i] !== r)) return false;
  // the variable of an equation answer ('x = 4') names what was asked, so it is not a letter the learner has to say
  for (const m of vl.replace(/^\s*\p{L}\s*=\s*/u, "").matchAll(/(?<![\p{L}])\p{L}(?![\p{L}])/gu)) if (LETTERS.has(m[0]) && !new RegExp(String.raw`(?<![\p{L}])${m[0]}(?![\p{L}])`, "u").test(low)) return false;
  const names = new Set<string>();
  for (const m of vl.matchAll(/\p{L}+/gu)) if (Object.prototype.hasOwnProperty.call(GROUP_OF, m[0])) names.add(GROUP_OF[m[0]]);
  for (const g of names) if (!ALIAS_RES[g].some((re) => re.test(low))) return false;
  if (/^[-−]/.test(v) && !/[-−]|(?<![\p{L}])(minus|negative|zaporn\p{L}*)(?![\p{L}])/u.test(low)) return false;
  if (!mine.length && !names.size) {
    const squash = (s: string) => s.toLowerCase().replace(/\s+/g, "");
    return squash(t).includes(squash(v));
  }
  return true;
}
