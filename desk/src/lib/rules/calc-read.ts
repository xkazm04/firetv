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
