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
/** A one-number answer (optional sign, digits, one comma, digits; no space at the comma) read as a point ('2,718' is 2.718, '-0,38' is -0.38); any other answer comes back unchanged. */
export const oneNumberComma = (ans: string) => /^[+\-−]?\s*\d+,\d+$/.test(ans.trim()) ? ans.replace(/\s+/g, "").replace(",", ".") : ans;
/**
 * The Czech function names (MB-B36): tg, cotg, arctg, arccotg, as a Czech school writes tan, cot, arctan and arccot. A name
 * touches no other letter but an x ('tgx' is tg x; 'atgx' is not read), longest first, any case.
 */
const CZECH_FN = /(?<!(?!x)\p{L})(arccotg|arctg|cotg|tg)(?!(?!x(?!\p{L}))\p{L})/giu;
const CZECH_NAME: Record<string, string> = { arctg: "arctan", cotg: "cot", tg: "tan" };
/** The argument after arccotg: a bracketed group (its own closing bracket found) or a bare x, number or a number times x, with a whole-number power. */
const BARE_ARG = /^\s*((?:\d+(?:\.\d+)?)?x(?:\^\d+)?|\d+(?:\.\d+)?)/;
/**
 * A task or an answer with the Czech function names as the desk's reader reads them: tg is tan, cotg is cot, arctg is
 * arctan, and arccotg u is (pi/2 - arctan(u)) - arccot as Czech schools and Stewart define it, with values in (0, pi). An
 * arccotg whose argument is neither bracketed nor a bare x or number is left as written, so it stays unread.
 */
export function czechNames(text: string): string {
  let out = "", from = 0;
  for (const m of text.matchAll(CZECH_FN)) {
    const at = m.index!, name = m[1].toLowerCase();
    out += text.slice(from, at);
    from = at + m[0].length;
    if (name !== "arccotg") { out += CZECH_NAME[name]; continue; }
    const rest = text.slice(from), open = /^\s*\(/.exec(rest);
    let arg: string | null = null, used = 0;
    if (open) {
      let depth = 0;
      for (let i = open[0].length - 1; i < rest.length; i++) {
        if (rest[i] === "(") depth++;
        else if (rest[i] === ")" && --depth === 0) { arg = rest.slice(open[0].length - 1, i + 1); used = i + 1; break; }
      }
    } else {
      const b = BARE_ARG.exec(rest);
      if (b) { arg = `(${b[1]})`; used = b[0].length; }
    }
    if (arg === null) { out += m[0]; continue; }
    out += `(pi/2 - arctan${arg})`;
    from += used;
  }
  return out + text.slice(from);
}
/** A trailing arbitrary constant by another letter, as a Czech school writes it: + K, + k, + C1, + C_1, + C₁. */
const OTHER_CONSTANT = /([+\-−])\s*(?:K|k|C\s*_?\s*\(?\s*\d+\s*\)?|C[₀-₉]+)\s*$/;
/**
 * The base-10 logarithm as a comma-system school writes it (MB-B36 log): `lg` in cz and de (DIN 1302, ISO 80000-2), and a
 * bare `log` - no base after it ('log_2', 'log2', 'log₂' keep theirs) - in cz only, where a school's log is base 10 and
 * the natural log is always ln. A name touches no other letter but an x ('logx' is log x), as CZECH_FN.
 */
const LG = /(?<!(?!x)\p{L})lg(?!(?!x(?!\p{L}))\p{L})/giu;
const BARE_LOG = /(?<!(?!x)\p{L})log(?![_\d₀-₉])(?!(?!x(?!\p{L}))\p{L})/giu;
/** The base 10 as the engine reads it (calc-expr log_b): bracketed, so a number after it ('lg 2', 'lg2') stays its argument. */
const LOG10 = "log_(10)";
/**
 * The base-10 logs of a comma system written with their base (MB-B36 log): `lg` in cz and de, a bare `log` in cz only, as
 * log_(10). The one table an answer (czechAnswer) and a task (calc specFromQuestion) are read by; anything else unchanged.
 */
export const systemLogs = (text: string, system?: string) => {
  const s = text.replace(LG, LOG10);
  return system === "cz" ? s.replace(BARE_LOG, LOG10) : s;
};
/**
 * A Calculus answer in a comma system (cz, de; MB-B36), as the reader reads it: a decimal comma between digits is a point
 * ('0,5x^2' is 0.5x^2, as taskText plainTask reads a task; '1,2,3' and '0, 5' are left alone), the Czech function names
 * (czechNames), and a trailing constant by another letter is the arbitrary constant C. `lg` is the base-10 log, and in
 * cz a bare `log` is too (LG, BARE_LOG); in de a bare `log` stays the engine's natural log (German school writes lg or
 * log_10 for base 10, German analysis writes log for ln: no reading of a bare log is safe there). ln is natural in both.
 * Anything else comes back unchanged.
 */
export const czechAnswer = (ans: string, system?: string) => {
  const s = systemLogs(ans, system);
  return czechNames(s.replace(/(?<![\d.,])(\d+),(\d+)(?![\d,])/g, "$1.$2")).replace(OTHER_CONSTANT, "$1 C");
};
/**
 * A spec's own text printed for a comma-system learner (MB-B36 log): the engine's bare `log` is the natural log, and a cz
 * learner reads log as base 10, so it prints as `ln` - one notation, one meaning on the screen. A log with a base keeps it.
 */
export const naturalAsLn = (text: string) => text.replace(BARE_LOG, "ln");
/** A lone digit,digit in a line read as a point ('2,72' is 2.72); a list ('1,2,3', '1, 2') is left alone (maths.ts decimalComma's pattern). */
export const pointForComma = (line: string) => line.replace(/(?<!\d,|[\d.])(\d+),(\d+)(?!,\d|\d)/g, "$1.$2");
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
