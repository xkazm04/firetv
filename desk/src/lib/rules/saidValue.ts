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

/** Is the value (as the model wrote it) in what the learner said (or typed)? */
export function saidIn(value: string, transcript: string): boolean {
  const v = value.trim(), t = transcript.trim();
  if (!v || !t) return false;
  // the transcript as figures, plus the exponent words ('to the power of N' already carries N as a figure)
  const folded = figuresOfEnglish(figuresOfCzech(t));
  const low = fold(folded.toLowerCase());
  const said = new Set(runs(superscripts(folded)));
  if (/(?<![\p{L}])squared(?![\p{L}])|na druhou/u.test(low) || low.includes("²")) said.add("2");
  if (/(?<![\p{L}])cubed(?![\p{L}])|na treti/u.test(low) || low.includes("³")) said.add("3");
  // an area unit (cm2, m2) carries a 2 that is its exponent, not a figure; it is heard as the unit said, not as a digit
  let vl = fold(superscripts(v).toLowerCase());
  const unitless = vl.replace(/(?<![\p{L}])(c?m)\^?2(?!\d)/gu, "$1");
  const area = unitless !== vl;
  vl = unitless;
  const mine = runs(vl);
  if (area && !said.has("2") && !/(?<![\p{L}])(?:square|sq)\.?\s+(?:centimet\p{L}*|met\p{L}*|cm|m)(?![\p{L}])|(?<![\p{L}])ctverecn/u.test(low)) return false;
  for (const r of mine) if (!said.has(r)) return false;
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
