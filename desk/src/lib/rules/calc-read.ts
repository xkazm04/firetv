/**
 * Reading an answer or a line, shared by the Calculus shapes (v2 M3b-3a): the helpers calc.ts used inline, moved here
 * unchanged so a Calculus 2 shape (rules/calc2.ts) reads an answer and a hint line exactly as Calculus 1 does. No
 * behaviour moved: calc.ts imports them back.
 *
 * Pure: imports nothing but the number-word table - no engine, no session store, no TV module.
 */
import { EN_CARD, figuresOfCzech } from "./numberWords";

/** The answer as written, without a leading 'f(x) =', 'x =', "y' =" or 'lim =' and without a closing full stop. */
export const cleanAnswer = (a: string) => {
  let s = a.trim();
  const eq = s.lastIndexOf("=");
  if (eq >= 0) s = s.slice(eq + 1).trim();
  return s.replace(/\.$/, "").trim();
};
/** An infinity as a learner writes it: inf, infinity, ∞, with an optional sign. */
export const infinityOf = (s: string): 1 | -1 | null => {
  const m = /^([+\-−]?)\s*(inf|infinity|∞)$/i.exec(s.replace(/\s+/g, " ").trim());
  return m ? (m[1] === "-" || m[1] === "−" ? -1 : 1) : null;
};
export const DNE = /^(dne|does not exist|no limit|undefined)$/i;
/** A plain decimal numeral (0.333, 16.0, .5): the learner rounded. */
export const isDecimal = (s: string) => /^[+\-−]?(\d+\.\d*|\.\d+)$/.test(s.replace(/\s+/g, ""));
/** The digits a decimal is written to, trailing zeros counted (2.718 is 3, 3.00 is 2); a point or a comma; 0 for a numeral with neither. */
export const placesOf = (s: string) => /[.,](\d*)$/.exec(s.replace(/\s+/g, ""))?.[1].length ?? 0;
/** Is `s` the `truth` correctly rounded at `places` decimals (halfway: either neighbour; a hair of slack for the truth's own numerics)? */
export const roundsTo = (s: number, truth: number, places: number) => Math.abs(s - truth) <= 0.5 * 10 ** -places * (1 + 1e-6);
export const withinRel = (u: number, v: number, tol: number) => Math.abs(u - v) <= tol * Math.max(1, Math.abs(v));
/** The significant figures a decimal is written to: its digits from the first non-zero one, trailing zeros counted (0.38 is 2, 3.0 is 2, 0.3 is 1, 0.0 is 0). */
export const figuresOf = (s: string) => s.replace(/\D/g, "").replace(/^0+/, "").length;
/** A correct rounding the desk calls right (D2 R1a): `written` is a decimal, its value `s` is `truth` rounded at its own decimals, to two significant figures or more. */
export const roundingRight = (written: string, s: number, truth: number) =>
  isDecimal(written) && roundsTo(s, truth, placesOf(written)) && figuresOf(written) >= 2;

/** The tolerances of a limit or a definite integral: exact, the rounded window, and the 'unsure' band around it. */
export interface DecimalTol { exact: number; rounded: number; close: number; }
/**
 * A decimal answer to a limit or a definite integral, the one rule both judges call (calc.ts judgeNumber, calc2.ts
 * judgeLimit; MB-B28 and D2 R1a):
 *   - the exact value to `exact` is right (0.375 for 3/8, 0.5 for 1/2);
 *   - a correct rounding of the exact value at its own written decimals (roundsTo, with its slack) is never wrong: right
 *     with two significant figures or more (2.7 for e, 0.38 for 3/8, 3.0 for 3), 'rounded' with fewer (0.3 for 1/3, 0.0
 *     for 1/32);
 *   - any other decimal keeps the MB-B28 path: 'rounded' inside the `rounded` window (2.999 for 3, a calculator estimate),
 *     'sign' for the negated truth, 'rounded' inside `close`, else 'wrong' (2.8 for e).
 */
export function decimalCall(written: string, s: number, truth: number, tol: DecimalTol): "right" | "rounded" | "sign" | "wrong" {
  if (withinRel(s, truth, tol.exact)) return "right";
  if (roundsTo(s, truth, placesOf(written))) return figuresOf(written) >= 2 ? "right" : "rounded";
  if (withinRel(s, truth, tol.rounded)) return "rounded";
  if (!withinRel(0, truth, tol.rounded) && withinRel(-s, truth, tol.rounded)) return "sign";
  return withinRel(s, truth, tol.close) ? "rounded" : "wrong";
}

/** Number words to ninety-nine, from the one table (numberWords) the three leak checks share. */
const WORDS: Record<string, string> = Object.fromEntries(Object.entries(EN_CARD).map(([w, n]) => [w, String(n)]));
const NUMBER_WORD = /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:(?:-|\s+)(one|two|three|four|five|six|seven|eight|nine)\b)?|\b([a-z]+)\b/g;
/** A line as it would be said, numbers in digits: 'minus sixteen' is -16, 'one and a half' is 1.5. */
export const spoken = (line: string) => figuresOfCzech(line.toLowerCase()).replace(/[−–—‐‑]/g, "-")
  .replace(NUMBER_WORD, (w, tens: string | undefined, unit: string | undefined, word: string | undefined) =>
    tens ? String(Number(WORDS[tens]) + (unit ? Number(WORDS[unit]) : 0)) : Object.hasOwn(WORDS, word!) ? WORDS[word!] : w)
  .replace(/(\d+)\s+and\s+a\s+half\b/g, "$1.5")
  .replace(/\b(?:minus|negative)\s*(?=\d)/g, "-")
  .replace(/(^|[^\s\da-z)\]²])(\s*)-\s+(?=\d)/g, "$1$2-");

export const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/**
 * A piece of the question as a pattern: spacing free, '->' also as '→', and only as a whole - not inside a larger
 * expression (the function 'x' is not the x of 'x^2/2', 'x^2 + 1' is not the start of 'x^2 + 10').
 */
export const piecePattern = (p: string) => new RegExp(`(?<![\\w^*/.(|])${[...p.replace(/\s+/g, "")].map(escapeRe).join("\\s*").replace(/-\\s\*>/g, "(?:-\\s*>|→)")}(?![\\w^*/.)|(])`, "gi");
