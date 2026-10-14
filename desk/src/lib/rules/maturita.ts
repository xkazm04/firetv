/**
 * Three Maturita-shaped Czech tasks the other readers do not read (UD-26, MB-B48): a polynomial inequality ('Řešte nerovnici
 * x^2 - 5x + 6 < 0'), a term of an arithmetic or geometric sequence ('... a1 = 3, d = 4. Určete a10.') and a line through
 * two points ('Určete rovnici přímky procházející body A[1, 2] a B[3, 8]').
 *
 * Each reader finds the answer in code (never a model) and `leaksMaturita` says whether a hint line states it. They read for
 * the leak check only: no verdict is marked from them, and a task none of them reads is read as it was (false). A line that
 * names the METHOD ('factor the left side', 'a_n = a_1 + (n-1)d', 'the slope is rise over run') never leaks: only a line that
 * states the solution set, the term or the line does.
 *
 * Pure: imports the evaluator and the diacritics fold only. The caller passes the line as it would be said (digits for number
 * words, a decimal point), so this file needs nothing from rules/maths.
 */
import { evaluate } from "../desk/verify";
import { fold } from "./numberWords";

const NUM = String.raw`-?\d+(?:[.,]\d+)?`;
const toNum = (s: string) => Number(s.replace(",", ".").replace("−", "-"));
const near = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const numbersIn = (t: string) => [...t.replace(/[−–—]/g, "-").matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));

// ---- inequality
export interface Inequality { roots: number[]; linear: boolean }
/** The real roots of the boundary of a polynomial inequality of degree 1 or 2 in x, or null when the task is not one. */
export function inequalityOf(text: unknown): Inequality | null {
  if (typeof text !== "string") return null;
  const t = text.replace(/[−–]/g, "-").replace(/²/g, "^2").replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/,(?=\d)/g, ".");
  const m = /([^<>=?:]*?x[^<>=]*?|[^<>=?:]*?)\s*(<=|>=|<|>)\s*([^<>=?]*)/.exec(t.replace(/^[^:]*?(?:nerovnic\w*|inequality)[^:\dx(-]*/i, ""));
  if (!m || !/x/i.test(m[1] + m[3])) return null;
  const clean = (s: string) => s.replace(/^.*?(?=[\dx(-])/i, "").replace(/[.;]\s*$/, "").trim();
  const l = clean(m[1]), r = clean(m[3]);
  const f = (x: number) => { const a = evaluate(l, x), b = evaluate(r, x); return a === null || b === null ? null : a - b; };
  const f0 = f(0), f1 = f(1), fm = f(-1), f2 = f(2), f3 = f(3);
  if ([f0, f1, fm, f2, f3].some((v) => v === null)) return null;
  const c = f0!, a = (f1! + fm!) / 2 - c, b = (f1! - fm!) / 2;
  if (!near(f2!, 4 * a + 2 * b + c) || !near(f3!, 9 * a + 3 * b + c)) return null; // not a polynomial of degree two or less
  if (near(a, 0)) return near(b, 0) ? null : { roots: [-c / b], linear: true };
  const disc = b * b - 4 * a * c;
  if (disc <= 1e-12) return null;
  const s = Math.sqrt(disc);
  return { roots: [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((p, q) => p - q), linear: false };
}

// ---- sequence term
export interface SequenceTerm { n: number; value: number }
/** The asked term of an arithmetic (a1, d) or geometric (a1, q) sequence, or null. */
export function sequenceTermOf(text: unknown): SequenceTerm | null {
  if (typeof text !== "string") return null;
  const t = fold(text.normalize("NFC")).toLowerCase().replace(/[−–]/g, "-").replace(/₁/g, "1").replace(/(\d),(\d)/g, "$1.$2");
  const first = new RegExp(String.raw`(?:\ba_?1|prvni clen|first term)\s*(?:je|is|=|:)?\s*(${NUM})`).exec(t);
  const diff = new RegExp(String.raw`(?:\bd|diferenc\w*|common difference)\s*(?:je|is|=|:)?\s*(${NUM})`).exec(t);
  const ratio = new RegExp(String.raw`(?:\bq|kvocient\w*|common ratio)\s*(?:je|is|=|:)?\s*(${NUM})`).exec(t);
  const ask = /(?:urcete|urci|vypocitejte|vypocti(?:te)?|spoctete|najdete|najdi|find|calculate|what is)\s+(?:clen\s+)?a_?\{?(\d{1,3})\}?\b/.exec(t);
  if (!first || !ask || (!diff && !ratio) || (diff && ratio)) return null;
  const n = Number(ask[1]), a1 = toNum(first[1]);
  if (n < 2) return null;
  const value = diff ? a1 + (n - 1) * toNum(diff[1]) : a1 * Math.pow(toNum(ratio![1]), n - 1);
  return Number.isFinite(value) && Math.abs(value) < 1e12 ? { n, value } : null;
}

// ---- line through two points
export interface TwoPointLine { m: number; c: number }
/** The line through two points written A[1, 2], B(3; 8) or (1, 2) ... (3, 8), as y = mx + c; null for a vertical line or no reading. */
export function lineOf(text: unknown): TwoPointLine | null {
  if (typeof text !== "string" || !/(?:primk|line|straight)/i.test(fold(text))) return null;
  const t = text.replace(/[−–]/g, "-").replace(/(\d),(\d)(?!\d)/g, "$1.$2");
  const pts = [...t.matchAll(new RegExp(String.raw`[\[(]\s*(${NUM})\s*[,;]\s*(${NUM})\s*[\])]`, "g"))].map((p) => [toNum(p[1]), toNum(p[2])]);
  if (pts.length !== 2 || near(pts[0][0], pts[1][0])) return null;
  const m = (pts[1][1] - pts[0][1]) / (pts[1][0] - pts[0][0]);
  return { m, c: pts[0][1] - m * pts[0][0] };
}

// ---- the leak
/**
 * Does `line` state the answer of a task one of the three readers reads? `spoken` is the line as it would be said (digits, a
 * decimal point). An inequality leaks when a line names both roots (or, for a linear one, 'x' against its root); a sequence
 * term when the line says the value (not a number the task itself gives); a line when it writes y = mx + c, or names its slope
 * or its intercept as such.
 */
export function leaksMaturita(question: unknown, spoken0: string): boolean {
  const spoken = typeof spoken0 === "string" ? fold(spoken0) : spoken0;
  if (typeof question !== "string" || typeof spoken !== "string" || !spoken) return false;
  const own = new Set(numbersIn(question.replace(/(\d),(\d)/g, "$1.$2")));
  const nums = numbersIn(spoken);
  const ineq = inequalityOf(question);
  if (ineq) {
    if (ineq.linear) {
      const r = ineq.roots[0];
      for (const m of spoken.matchAll(new RegExp(String.raw`\bx\s*(?:<=|>=|<|>|=|je|is)\s*(${NUM})`, "g"))) if (near(toNum(m[1]), r)) return true;
      return false;
    }
    return ineq.roots.every((r) => nums.some((v) => near(v, r)));
  }
  const seq = sequenceTermOf(question);
  if (seq) return nums.some((v) => near(v, seq.value) && !own.has(v) && v !== seq.n);
  const line = lineOf(question);
  if (line) {
    for (const m of spoken.matchAll(/\by\s*=\s*([^.;,!?]+?)(?=\s*(?:\.\s|[.;,!?]|$))/g)) {
      const a = evaluate(m[1].replace(/\s+/g, ""), 0), b = evaluate(m[1].replace(/\s+/g, ""), 1);
      if (a !== null && b !== null && near(a, line.c) && near(b - a, line.m)) return true;
    }
    for (const m of spoken.matchAll(new RegExp(String.raw`(?:slope|gradient|smernice|k)\s*(?:is|je|=|equals)\s*(${NUM})`, "g"))) if (near(toNum(m[1]), line.m)) return true;
    return false;
  }
  return false;
}

/** Is the task one of the three the readers above read? Then it is not an unread item, and the stricter fallback does not apply to it. */
export const readsMaturita = (question: unknown): boolean => inequalityOf(question) !== null || sequenceTermOf(question) !== null || lineOf(question) !== null;
