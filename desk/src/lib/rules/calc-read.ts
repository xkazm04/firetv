/**
 * Reading an answer or a line, shared by the Calculus shapes (v2 M3b-3a): the helpers calc.ts used inline, moved here
 * unchanged so a Calculus 2 shape (rules/calc2.ts) reads an answer and a hint line exactly as Calculus 1 does. No
 * behaviour moved: calc.ts imports them back.
 *
 * Pure: imports nothing - no engine, no session store, no TV module.
 */

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
export const withinRel = (u: number, v: number, tol: number) => Math.abs(u - v) <= tol * Math.max(1, Math.abs(v));

/**
 * Number words to ninety-nine, as rules/maths.ts said() reads them. Written again here, not imported: said() is
 * private to rules/maths.ts (rules stay pure and small).
 */
const WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  eleven: "11", twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18",
  nineteen: "19", twenty: "20", thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70", eighty: "80", ninety: "90",
};
const NUMBER_WORD = /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:(?:-|\s+)(one|two|three|four|five|six|seven|eight|nine)\b)?|\b([a-z]+)\b/g;
/** A line as it would be said, numbers in digits: 'minus sixteen' is -16, 'one and a half' is 1.5. */
export const spoken = (line: string) => line.toLowerCase().replace(/[−–—‐‑]/g, "-")
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
