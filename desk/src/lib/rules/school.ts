/**
 * School numbers, decided in code (Family Phase 1, W5a): the answer reader, the fractions checker, the hint leak
 * check and the units' generators. W5b wires them: the store keeps a school spec (session/store specShown, by
 * shape), a set on a unit in SCHOOL_GENERATORS is written here with no model call (desk/items makeSchoolItems),
 * marking judges it with `check`, and hints and explanations pass `leaksSchool`. W7 batch 1 adds three units on the
 * same machinery: equivalent fractions (shapes `missing` and `simplify`), a fraction of an amount (`fraction-of`) and
 * multiply and divide fractions (`compute` with × or ÷), each with its generator, closed slip list, task reader and
 * withheld line; the leak rule below gains a per-shape profile (`leakProfile`). W7 batch 2 adds the decimals and percent
 * strand: add, subtract and multiply decimals (`compute` with decimal operands, money with a € or £ sign); fractions,
 * decimals and percent (`convert`, the one shape with a store key of its own, `to`: the form asked for, whose value in any
 * other form is unsure, never wrong, and whose leak check knows which written forms of the value give it away).
 *
 * The stances this file holds:
 *   - Code decides right and wrong. The truth is recomputed from the spec every time with EXACT rational arithmetic
 *     (bigint numerator and denominator, reduced): no floating point decides an equality. This file carries its own
 *     tiny evaluator (+ - × ÷, brackets, integers, decimals, fractions) instead of calc-expr.ts, whose engine works in
 *     floating point and so cannot say "exactly equal".
 *   - "Unsure" is never "wrong". Anything the reader cannot read with ONE meaning is null, and a null reading is an
 *     unsure verdict: the desk asks, it never marks a child wrong on a guess.
 *   - A hint never gives the answer away (`leaksSchool`, rules below). Where keeping a legit hint and refusing every
 *     leak conflict, the leak rule stays strict: a legit hint refused is acceptable, an answer given away is not.
 *
 * readNumber(answer, system) - the reading rules. Ambiguity resolves to null.
 *   - one number per answer: an integer, a terminating decimal, a fraction `a/b`, a mixed number `1 1/2` (the fraction
 *     proper, 0 < top < bottom), a percent `25%` / `25 %` / `25 percent`, or a ratio `a:b` (kept as a pair, never a
 *     value: in cz and de ':' is also the division sign);
 *   - ignored around it: a leading `x =`, `answer:`, `ans:` or `=`, one trailing full stop, spaces;
 *   - a unit from the closed list UNITS (and the English words for them) after the number, or a currency sign before
 *     or after it, is returned as `unit` and never changes the number; any other trailing word is null;
 *   - us and uk: '.' is the decimal point; ',' only separates thousands in the strict 1,234 / 12,345,678 grouping, and
 *     any other comma (`0,5`, `1,5`, `1,00`) is null (a comma is also a list: `0,5` may be "0 and 5"); a space inside
 *     a number (`1 000`) is null;
 *   - cz and de: ',' is the decimal comma; a space in strict groups of three separates thousands (`1 000`,
 *     `1 000,5`); a point separates thousands ONLY where it cannot be a decimal point: two or more strict groups
 *     (`1.000.000`) or a strict group with a decimal comma (`1.000,5`); a lone point before exactly three digits with
 *     no comma (`1.000`, `1.500`, `2.750`) is 1500 by the norm and 1.5 as a calculator writes it, so it is null; a
 *     point that cannot be a grouping (`0.5`, `12.50`, `1.25`, `0.500`) can only be a decimal point, so it reads as one;
 *   - null: a hyphenated mixed number `1-1/2` (it is also the subtraction 1 - 1/2), a mixed number whose top has three
 *     digits in any system (`1 250/500` may be 1250/500 with a space between thousands), a unit word with two
 *     meanings ("pounds": money or weight; `£` reads), a denominator of 0, leading zeros (`05`, `1 03/4`), a sign on a
 *     ratio, a unit on a percent or a ratio, two numbers, words ("about nine", "nine"), an expression (`3/4+1/6`), a
 *     chain of equalities, more than 9 whole digits, more than 6 decimal places or fraction digits, a lone slash.
 *
 * leaksSchool(spec, hint) - the leak rule. The hint's number words are read as digits first ("eleven twelfths" is
 * 11/12, "one and a half" is 1 1/2, "a half" and a bare "half" are 1/2, "thirty percent" is 30%, "eleven over
 * twelve" and "11 out of 12" are 11/12, "11 12ths" is 11/12, "nought point nine two" is 0.92; cardinals to 1000);
 * then every run of digits is read by readNumber under ALL four systems, whole and split at spaces and commas, and
 * the hint leaks when any reading is:
 *   1. the answer's size in any form: an equal fraction (22/24), a mixed number, a decimal, a percent, with or
 *      without a unit, a sign or an '=' before it (the value anywhere is refused, so every answer-statement pattern,
 *      "the answer is", "so it is", "you get", "that makes 9/12 + 2/12 = 11/12", is covered by it);
 *   2. a decimal or percent within one unit of its last written place of the answer (0.9, 0.92, 0.9167, 92%);
 *   3. for an answer over one, its fractional part (the 5/12 of 1 5/12);
 *   4. a bare whole number that is the answer's top over a working denominator: the summed numerator (9 + 2 = 11 for
 *      11/12). The working denominators are the answer's own, and for `a/b ± c/d` the lcm and b × d. For a decimals
 *      item (W7 batch 2) it is the answer's digits with the point left out (715 for 4.35 + 2.8, 144 for 3.6 × 0.4), and
 *      an answer over one has no fractional-part target (rule 3); money said aloud reads as a decimal ("13 pounds 80");
 *   5. a ratio whose quotient is the answer (11:12);
 *   6. two numbers joined by an operation (+, -, x, ×, ÷, plus, minus, take away, times, divided by, "a less than
 *      b") whose value is the answer ("1 - 1/12", "1/12 less than 1"), or, for two whole numbers, the summed top
 *      ("the top is 9 + 2") - unless the two are the question's own operands by value, in order (either order for
 *      + and ×) and with its operation: the question restated or its operands rewritten ("now add 9/12 + 2/12",
 *      "10 twelfths take away 3 twelfths") is a step, not the answer. A percent of a mixed number (91 2/3 %) and a
 *      superscript fraction (¹¹⁄₁₂) are read too.
 * The word "one" alone counts as the number 1 only straight after a statement cue ("is", "=", "makes", "gives",
 * "get", "equals", "leaves", "becomes"): as a pronoun ("this one") it is a word. Not a leak: the operands, the
 * common denominator, a rewritten operand (3/4 is 9/12), the method, and numbers inside larger ones (11/12 inside
 * 111/120, 12 alone for 3/4 + 1/6). Known cost of rule 4: a bare operand number that equals the summed numerator
 * is refused too ("6 is a multiple of 3" when 1/3 + 1/6 makes 3/6), as is "Step 1" when the answer's top is 1.
 *
 * Pure: no React, no filesystem, no model, no network; imports only a type from the store.
 */
import type { SchoolSystem } from "@/lib/session/store";

// ------------------------------------------------------------------ exact rationals

type Q = { n: bigint; d: bigint };
const Z = BigInt(0), ONE = BigInt(1), TEN = BigInt(10);
const babs = (x: bigint) => (x < Z ? -x : x);
function bgcd(a: bigint, b: bigint): bigint { a = babs(a); b = babs(b); while (b !== Z) { const t = a % b; a = b; b = t; } return a; }
/** n/d reduced with d > 0, or null when d is 0. */
function mk(n: bigint, d: bigint): Q | null {
  if (d === Z) return null;
  if (d < Z) { n = -n; d = -d; }
  const g = bgcd(n, d);
  return g === ONE ? { n, d } : { n: n / g, d: d / g };
}
const qi = (n: bigint): Q => ({ n, d: ONE });
const add = (a: Q, b: Q) => mk(a.n * b.d + b.n * a.d, a.d * b.d)!;
const sub = (a: Q, b: Q) => mk(a.n * b.d - b.n * a.d, a.d * b.d)!;
const mul = (a: Q, b: Q) => mk(a.n * b.n, a.d * b.d)!;
const div = (a: Q, b: Q) => mk(a.n * b.d, a.d * b.n);
const eq = (a: Q, b: Q) => a.n === b.n && a.d === b.d;
const qabs = (a: Q): Q => ({ n: babs(a.n), d: a.d });
function pow10(k: number): bigint { let p = ONE; for (let i = 0; i < k; i++) p *= TEN; return p; }
/** |a - b| < 10^-k: b written to k places is within one unit of its last place of a. */
const withinPlace = (a: Q, b: Q, k: number) => { const d = sub(a, b); return babs(d.n) * pow10(k) < d.d; };
/** Does a have a finite decimal expansion (denominator made of 2s and 5s)? */
function terminating(a: Q): boolean { let d = a.d; const two = BigInt(2), five = BigInt(5); while (d % two === Z) d /= two; while (d % five === Z) d /= five; return d === ONE; }
/** a × 10^k is a whole number: a can be written exactly with k decimal places. */
const exactAt = (a: Q, k: number) => (a.n * pow10(k)) % a.d === Z;
/** The fewest decimal places that write a terminating value exactly (0 for a whole number); 12 at most. */
function placesNeeded(a: Q): number { let k = 0; while (k < 12 && !exactAt(a, k)) k++; return k; }

/** A rational as the desk hands it out: lowest terms, d > 0, both safe integers (the reader's bounds keep them so). */
export interface Rat { n: number; d: number }
const toRat = (q: Q): Rat => ({ n: Number(q.n), d: Number(q.d) });
const fromRat = (r: Rat): Q => ({ n: BigInt(r.n), d: BigInt(r.d) });

// ------------------------------------------------------------------ the reader

export const SCHOOL_SYSTEMS: readonly SchoolSystem[] = ["us", "uk", "cz", "de"];
const isSystem = (s: unknown): s is SchoolSystem => typeof s === "string" && (SCHOOL_SYSTEMS as readonly string[]).includes(s);

/** The closed unit list, as the desk writes each one. */
export const UNITS = ["cm", "m", "km", "mm", "cm2", "m2", "kg", "g", "l", "ml", "min", "h", "s", "€", "$", "£"] as const;
export type Unit = (typeof UNITS)[number];

/** Every spelling the reader takes for a unit, longest first so 'cm2' is never 'm2' and 'min' never 'm'. */
const UNIT_SPELLINGS: [string, Unit][] = (() => {
  const out: [string, Unit][] = [];
  const add = (u: Unit, ...s: string[]) => s.forEach((w) => out.push([w, u]));
  const len = (u: Unit, stem: string) => [`${stem}res`, `${stem}re`, `${stem}ers`, `${stem}er`];
  add("cm2", "cm2", "cm^2", "cm²", ...len("cm2", "square centimet"));
  add("m2", "m2", "m^2", "m²", ...len("m2", "square met"));
  add("cm", "cm", ...len("cm", "centimet"));
  add("mm", "mm", ...len("mm", "millimet"));
  add("km", "km", ...len("km", "kilomet"));
  add("m", "m", ...len("m", "met"));
  add("kg", "kg", "kilograms", "kilogram");
  add("g", "g", "grams", "gram");
  add("ml", "ml", "millilitres", "millilitre", "milliliters", "milliliter");
  add("l", "l", "litres", "litre", "liters", "liter");
  add("min", "min", "minutes", "minute");
  add("h", "h", "hours", "hour");
  add("s", "s", "seconds", "second");
  add("€", "€", "euros", "euro");
  add("$", "$", "dollars", "dollar");
  add("£", "£"); // not "pounds": money or weight
  return out.sort((a, b) => b[0].length - a[0].length);
})();

export type NumberForm = "integer" | "fraction" | "mixed" | "decimal" | "percent";
export interface NumberReading {
  kind: "number";
  /** The exact value, lowest terms. */
  value: Rat;
  /** How it was written. */
  form: NumberForm;
  /** integer, fraction, mixed: is the written fraction in lowest terms (and not over 1)? */
  lowest?: boolean;
  /** decimal, percent: digits written after the separator. */
  places?: number;
  unit?: Unit;
}
export interface RatioReading { kind: "ratio"; parts: [Rat, Rat]; form: "ratio" }
export type Reading = NumberReading | RatioReading;

/** Most whole digits, decimal places, and digits in a fraction's top or bottom the reader takes: past them, null. */
const INT_DIGITS = 9, PLACES = 6, FRAC_DIGITS = 6;
/** Longest answer the reader looks at. */
const MAX_ANSWER = 60;
const VULGAR: Record<string, string> = { "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4", "¾": "3/4", "⅕": "1/5", "⅖": "2/5", "⅗": "3/5", "⅘": "4/5", "⅙": "1/6", "⅚": "5/6", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8" };
const VULGAR_RE = /[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g;

/** The glyphs a keyboard, a phone and a page reader produce, as the ASCII the reader reads; one space between words. */
const normalise = (s: string) => s
  .replace(VULGAR_RE, (c) => ` ${VULGAR[c]}`)
  .replace(/[    ]/g, " ")
  .replace(/[−–—‐‑]/g, "-")
  .replace(/[⁄∕]/g, "/")
  .replace(/\s+/g, " ")
  .trim();

const noLeadingZero = (s: string) => s === "0" || !s.startsWith("0");

type Plain = { q: Q; form: "integer" | "decimal"; places: number };
/** An unsigned integer or decimal by the system's separators, or null. */
function parsePlain(t: string, sys: SchoolSystem): Plain | null {
  if (!t || !/^[\d., ]+$/.test(t)) return null;
  let whole: string, frac: string | undefined;
  if (sys === "us" || sys === "uk") {
    const m = /^(?:([1-9]\d{0,2}(?:,\d{3})+)|(\d+))?(?:\.(\d+))?$/.exec(t);
    if (!m || (m[1] === undefined && m[2] === undefined && m[3] === undefined)) return null;
    if (m[2] !== undefined && !noLeadingZero(m[2])) return null;
    whole = (m[1] ?? m[2] ?? "").replace(/,/g, "");
    frac = m[3];
  } else {
    const a = /^(?:([1-9]\d{0,2}(?: \d{3})+)|([1-9]\d{0,2}(?:\.\d{3})+)|(\d+))?(?:,(\d+))?$/.exec(t);
    if (a && (a[1] !== undefined || a[2] !== undefined || a[3] !== undefined || a[4] !== undefined)) {
      if (a[3] !== undefined && !noLeadingZero(a[3])) return null;
      // one point before three digits and no comma: 1.500 is 1500 by the norm, 1.5 as a calculator writes it
      if (a[2] !== undefined && a[4] === undefined && a[2].split(".").length === 2) return null;
      whole = (a[1] ?? a[2] ?? a[3] ?? "").replace(/[ .]/g, "");
      frac = a[4];
    } else {
      // a point that is no strict grouping of three can only be a decimal point
      const b = /^(\d+)?\.(\d+)$/.exec(t);
      if (!b || (b[1] !== undefined && !noLeadingZero(b[1]))) return null;
      whole = b[1] ?? "";
      frac = b[2];
    }
  }
  if (whole.length > INT_DIGITS || (frac !== undefined && frac.length > PLACES)) return null;
  const f = frac ?? "";
  const q = mk(BigInt((whole || "0") + f), pow10(f.length))!;
  return frac === undefined ? { q, form: "integer", places: 0 } : { q, form: "decimal", places: f.length };
}

function readInner(answer: string, sys: SchoolSystem): Reading | null {
  if (answer.length > MAX_ANSWER) return null;
  let s = normalise(answer);
  s = s.replace(/^(?:x ?=|answer ?[:=]|ans ?[:=]|=) ?/i, "");
  if (/[^.]\.$/.test(s)) s = s.slice(0, -1).trimEnd();
  if (!s) return null;
  // a currency sign before the number
  let unit: Unit | undefined;
  const cur = /^([+-]?) ?([$£€]) ?(.*)$/.exec(s);
  if (cur) { unit = cur[2] as Unit; s = cur[1] + cur[3]; }
  // a unit after it
  const low = s.toLowerCase();
  for (const [sp, u] of UNIT_SPELLINGS) {
    if (!low.endsWith(sp)) continue;
    const rest = s.slice(0, s.length - sp.length);
    if (/[a-z]$/i.test(rest)) continue; // the end of a longer word
    if (unit) return null; // two units
    unit = u;
    s = rest.trimEnd();
    if (!/[\d]$/.test(s)) return null;
    break;
  }
  // the sign
  let neg = false;
  const sg = /^([+-]) ?(.*)$/.exec(s);
  if (sg) { neg = sg[1] === "-"; s = sg[2]; }
  if (!s || /^[+-]/.test(s)) return null;
  const signed = (q: Q): Q => (neg ? { n: -q.n, d: q.d } : q);
  // a ratio
  if (s.includes(":")) {
    if (sg || unit) return null;
    const parts = s.split(":");
    if (parts.length !== 2) return null;
    const a = parsePlain(parts[0].trim(), sys), b = parsePlain(parts[1].trim(), sys);
    return a && b ? { kind: "ratio", parts: [toRat(a.q), toRat(b.q)], form: "ratio" } : null;
  }
  // a percent
  const pc = /^(.*?) ?(?:%|percent|per cent)$/i.exec(s);
  if (pc) {
    if (unit) return null;
    const p = parsePlain(pc[1], sys);
    if (!p) return null;
    return { kind: "number", value: toRat(signed(mk(p.q.n, p.q.d * BigInt(100))!)), form: "percent", places: p.places };
  }
  const out = (q: Q, form: NumberForm, extra: Partial<NumberReading>): NumberReading =>
    ({ kind: "number", value: toRat(signed(q)), form, ...extra, ...(unit ? { unit } : {}) });
  // a mixed number: a whole, one space, a proper fraction
  const mx = /^(\d+) (\d+) ?\/ ?(\d+)$/.exec(s);
  if (mx) {
    const [, w, t, b] = mx;
    if (![w, t, b].every(noLeadingZero) || w === "0" || t === "0") return null;
    if (w.length > INT_DIGITS || t.length > FRAC_DIGITS || b.length > FRAC_DIGITS) return null;
    if (t.length === 3) return null; // '1 250/500' may be 1250/500, a space between thousands
    const W = BigInt(w), T = BigInt(t), B = BigInt(b);
    if (!(T < B)) return null;
    return out(mk(W * B + T, B)!, "mixed", { lowest: bgcd(T, B) === ONE });
  }
  // a fraction
  const fr = /^(\d+) ?\/ ?(\d+)$/.exec(s);
  if (fr) {
    const [, t, b] = fr;
    if (!noLeadingZero(t) || !noLeadingZero(b) || t.length > FRAC_DIGITS || b.length > FRAC_DIGITS) return null;
    const T = BigInt(t), B = BigInt(b), q = mk(T, B);
    if (!q) return null; // a denominator of 0
    return out(q, "fraction", { lowest: bgcd(T, B) === ONE && B !== ONE });
  }
  const p = parsePlain(s, sys);
  if (!p) return null;
  return p.form === "integer" ? out(p.q, "integer", { lowest: true }) : out(p.q, "decimal", { places: p.places });
}

/**
 * What a learner wrote, read as ONE school number under the learner's school system, or null (unsure) when it does
 * not read with exactly one meaning. The rules are in this file's header. Never throws.
 */
export function readNumber(answer: unknown, system: unknown): Reading | null {
  if (typeof answer !== "string" || !isSystem(system)) return null;
  try { return readInner(answer, system); } catch { return null; }
}

// ------------------------------------------------------------------ the shapes

/**
 * A school practice item is a SPEC, never text a model wrote with an answer. Every shape keeps its question in `expr`
 * (the store keeps a school spec's `expr`, `form`, `unit` and `allowNegative` and nothing else, session/store
 * SCHOOL_SPEC_KEYS), so the W7 shapes added no store key. Pending (W7 batches 2 and 3), each its own member of this
 * union: `percent` (a percent of an amount), `pct-change`, `ratio-share`, `area` and `mean`.
 *   - compute: a numeric question with no unknown, "Work out 3/4 + 1/6", "Work out 2/3 × 3/4". `form: "simplest"` asks
 *     for lowest terms, `form: "decimal"` for a decimal (the value must terminate); `unit` is the unit the answer is in;
 *     `allowNegative` lets the value be zero or below (a subtraction that crosses zero). Units: add and subtract
 *     fractions (a/b ± c/d), multiply and divide fractions (a/b × c/d, a/b ÷ c/d, Family W7), add, subtract and
 *     multiply decimals (4.35 + 2.8, 3.6 × 0.4; W7 batch 2), where a € or £ `unit` prints its sign before each amount
 *     ("Work out €4.35 + €2.80.", "Work out £3.45 × 4.": the count is not money).
 *   - fraction-of (W7, "A fraction of an amount"): expr "a/b of N", a proper fraction of a whole amount, "Find 3/5 of
 *     40 kg."; `unit` is the amount's unit (and the answer's). The value is a/b × N, exactly.
 *   - missing (W7, "Equivalent fractions"): expr "a/b = ?/d" or "a/b = c/?", one number missing on the right, "Fill in
 *     the missing number: 3/4 = ?/12."; the answer is the WHOLE number that makes the two fractions equal.
 *   - simplify (W7, "Equivalent fractions"): expr "a/b", a proper fraction not in lowest terms, "Write 18/24 in its
 *     simplest form."; the answer is the same value in lowest terms (an unreduced equal fraction is unsure, never wrong).
 *   - convert (W7 batch 2, "Fractions, decimals and percent"): expr a fraction in lowest terms "3/8", a decimal "0.35"
 *     or a percent "35%", and `to` the form asked for: "decimal", "fraction" (in its simplest form) or "percent" - never
 *     the form it is given in. Terminating values only (a fraction's bottom made of 2s and 5s), never a whole number.
 *     `to` is the one store key W7 batch 2 adds.
 */
export type ComputeSpec = { shape: "compute"; expr: string; form?: "simplest" | "decimal"; unit?: Unit; allowNegative?: true };
export type FractionOfSpec = { shape: "fraction-of"; expr: string; unit?: Unit };
export type MissingSpec = { shape: "missing"; expr: string };
export type SimplifySpec = { shape: "simplify"; expr: string };
/** The forms a conversion asks for (W7 batch 2). */
export type NumberFormAsked = "decimal" | "fraction" | "percent";
export type ConvertSpec = { shape: "convert"; expr: string; to: NumberFormAsked };
export type SchoolSpec = ComputeSpec | FractionOfSpec | MissingSpec | SimplifySpec | ConvertSpec;
export type SchoolShape = SchoolSpec["shape"];
export const SCHOOL_SHAPES: readonly SchoolShape[] = ["compute", "fraction-of", "missing", "simplify", "convert"];

/** Bounds on a compute spec, each with its reason: a school question, not a calculator exercise. */
const MAX_EXPR = 60;        // a line on a worksheet
const MAX_OPS = 4;          // five numbers at most
const MAX_LITERAL = 1000;   // whole numbers and tops up to 1000
const MAX_DENOMINATOR = 100; // bottoms a learner can find a common multiple of
const MAX_LITERAL_PLACES = 3;
const MAX_RESULT = 10000;   // the value's size, and its bottom in lowest terms
const MAX_DEPTH = 4;        // brackets inside brackets

type Op = "+" | "-" | "×" | "÷";
type Node =
  | { k: "num"; q: Q; s: string; whole: boolean }
  | { k: "frac"; n: bigint; d: bigint }
  | { k: "neg"; a: Node }
  | { k: "op"; op: Op; a: Node; b: Node }
  | { k: "par"; a: Node };

class Unreadable extends Error {}

/**
 * expr := term (('+'|'-') term)*;  term := unary (('×'|'*'|'÷') unary)*;  unary := '-' unary | atom;
 * atom := int '/' int (a fraction: '/' binds only two whole numbers, so 3/4 ÷ 2/3 is (3/4) ÷ (2/3)) | number | '(' expr ')'.
 */
function parseExpr(src: string): Node | null {
  if (typeof src !== "string" || !src.trim() || src.length > MAX_EXPR) return null;
  const s = src.replace(/[−–—]/g, "-").replace(/[*·]/g, "×").replace(/[:]/g, "÷");
  const toks: string[] = [];
  const re = /\s+|\d+(?:\.\d+)?|[-+×÷/()]|./g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (/^\s+$/.test(m[0])) continue;
    if (!/^(?:\d+(?:\.\d+)?|[-+×÷/()])$/.test(m[0])) return null;
    toks.push(m[0]);
  }
  let i = 0, depth = 0;
  const peek = () => toks[i];
  const expr = (): Node => {
    let a = term();
    while (peek() === "+" || peek() === "-") { const op = toks[i++] as Op; a = { k: "op", op, a, b: term() }; }
    return a;
  };
  const term = (): Node => {
    let a = unary();
    while (peek() === "×" || peek() === "÷") { const op = toks[i++] as Op; a = { k: "op", op, a, b: unary() }; }
    return a;
  };
  const unary = (): Node => {
    if (peek() === "-") { i++; if (++depth > MAX_DEPTH * 2) throw new Unreadable(); const a = unary(); depth--; return { k: "neg", a }; }
    return atom();
  };
  const atom = (): Node => {
    const t = peek();
    if (t === undefined) throw new Unreadable();
    if (t === "(") {
      i++;
      if (++depth > MAX_DEPTH) throw new Unreadable();
      const a = expr();
      depth--;
      if (peek() !== ")") throw new Unreadable();
      i++;
      return { k: "par", a };
    }
    if (!/^\d/.test(t)) throw new Unreadable();
    i++;
    const whole = !t.includes(".");
    if (peek() === "/") {
      const b = toks[i + 1];
      if (!whole || b === undefined || !/^\d+$/.test(b)) throw new Unreadable();
      i += 2;
      return { k: "frac", n: BigInt(t), d: BigInt(b) };
    }
    const [w, f = ""] = t.split(".");
    return { k: "num", q: mk(BigInt(w + f), pow10(f.length))!, s: t, whole };
  };
  try {
    const n = expr();
    return i === toks.length ? n : null;
  } catch {
    return null;
  }
}

/** The exact value, or null (a division by zero). */
function evalNode(n: Node): Q | null {
  switch (n.k) {
    case "num": return n.q;
    case "frac": return mk(n.n, n.d);
    case "par": return evalNode(n.a);
    case "neg": { const a = evalNode(n.a); return a ? { n: -a.n, d: a.d } : null; }
    case "op": {
      const a = evalNode(n.a), b = evalNode(n.b);
      if (!a || !b) return null;
      return n.op === "+" ? add(a, b) : n.op === "-" ? sub(a, b) : n.op === "×" ? mul(a, b) : div(a, b);
    }
  }
}

function countOps(n: Node): number {
  switch (n.k) {
    case "op": return 1 + countOps(n.a) + countOps(n.b);
    case "neg": case "par": return countOps(n.a);
    default: return 0;
  }
}
function literals(n: Node, out: Node[] = []): Node[] {
  if (n.k === "num" || n.k === "frac") out.push(n);
  else if (n.k === "op") { literals(n.a, out); literals(n.b, out); }
  else literals(n.a, out);
  return out;
}

const REJECT = {
  shape: "The shape is not one of the desk's school shapes.",
  answer: "A spec carries no answer field: the desk works the answer out itself.",
  read: "The desk cannot read the expression.",
  noOp: "There is nothing to work out: the expression has no operation.",
  tooMany: "The expression has more operations than a school question asks for.",
  big: "A number in the expression is larger than a school question uses.",
  denominator: "A fraction's bottom is 1, or larger than a school question uses.",
  places: "A decimal in the expression has more places than a school question uses.",
  divZero: "The expression divides by zero.",
  result: "The value is larger, or its bottom longer, than a school question asks for.",
  negative: "The value is zero or negative, and the spec does not allow that.",
  form: "The asked-for form is not one the desk knows.",
  notDecimal: "The value has no exact decimal, so it cannot be asked for as a decimal.",
  unit: "The unit is not one the desk knows.",
  flag: "allowNegative is true or absent.",
  key: "The shape does not take that key.",
  proper: "The fraction is not a proper fraction (its top is not smaller than its bottom).",
  same: "The new fraction keeps the given bottom (or top): there is nothing to work out.",
  notWhole: "No whole number makes the two fractions equal.",
  lowest: "The fraction is already in its simplest form: there is nothing to simplify.",
  sameForm: "The number is already in the form asked for: there is nothing to convert.",
  notLowest: "A fraction to convert is given in its simplest form.",
  whole: "The value is a whole number: there is nothing to convert.",
  trailing: "A decimal to convert does not end in a zero.",
} as const;

/**
 * What a spec asks, beyond its expression tree: a plain computation, a fraction of an amount (a/b of N), a missing
 * number (a/b = ?/d or a/b = c/?: `known` is d or c, `slot` says which is missing), or a fraction to simplify.
 */
type Kind =
  | { k: "compute" }
  | { k: "of"; a: bigint; b: bigint; N: bigint }
  | { k: "missing"; a: bigint; b: bigint; known: bigint; slot: "top" | "bottom" }
  | { k: "simplify"; a: bigint; b: bigint }
  | { k: "convert"; from: NumberFormAsked; to: NumberFormAsked; given: Q; a?: bigint; b?: bigint; text: string };
type Structure = { ok: true; spec: SchoolSpec; node: Node; kind: Kind } | { ok: false; why: string };
type ReadOk = { ok: true; spec: SchoolSpec; node: Node; kind: Kind; truth: Q };
type Read = ReadOk | { ok: false; why: string };

/** A whole number as a worksheet prints it: 1 to 999 (a top, a bottom) or 1 to 9999 (an amount), no leading zero. */
const W3 = String.raw`[1-9]\d{0,2}`, W4 = String.raw`[1-9]\d{0,3}`;
const OF_RE = new RegExp(String.raw`^(${W3})\/(${W3}) of (${W4})$`);
const MISSING_RE = new RegExp(String.raw`^(${W3})\/(${W3}) = (\?|${W3})\/(\?|${W3})$`);
const SIMPLIFY_RE = new RegExp(String.raw`^(${W3})\/(${W3})$`);
/** A decimal to convert, "0.35" (a whole part 0..999, one to three places), and a percent, "35%", "12.5%" (at most one place). */
const DECIMAL_RE = /^(0|[1-9]\d{0,2})\.(\d{1,3})$/, PERCENT_RE = /^(0|[1-9]\d{0,2})(?:\.(\d))?%$/;
const FORMS_ASKED: readonly NumberFormAsked[] = ["decimal", "fraction", "percent"];
const fracNode = (n: bigint, d: bigint): Node => ({ k: "frac", n, d });

/** The spec's structure (printable), without its truth. The W7 shapes are read in their one printed spelling each. */
function structure(spec: unknown): Structure {
  const shape = spec && typeof spec === "object" ? (spec as { shape?: unknown }).shape : undefined;
  if (!(SCHOOL_SHAPES as readonly unknown[]).includes(shape)) return { ok: false, why: REJECT.shape };
  const s = spec as Record<string, unknown>;
  if (["answer", "truth", "solution", "value", "result"].some((k) => k in s)) return { ok: false, why: REJECT.answer };
  // only a conversion names the form it asks for with `to` (W7 batch 2)
  if (shape !== "convert" && s.to !== undefined) return { ok: false, why: REJECT.key };
  if (shape === "compute") {
    if (s.form !== undefined && s.form !== "simplest" && s.form !== "decimal") return { ok: false, why: REJECT.form };
    if (s.unit !== undefined && !(UNITS as readonly unknown[]).includes(s.unit)) return { ok: false, why: REJECT.unit };
    if (s.allowNegative !== undefined && s.allowNegative !== true) return { ok: false, why: REJECT.flag };
    const node = parseExpr(s.expr as string);
    return node ? { ok: true, spec: s as SchoolSpec, node, kind: { k: "compute" } } : { ok: false, why: REJECT.read };
  }
  // the W7 shapes take no form and no sign flag; only a fraction of an amount takes a unit
  if (s.form !== undefined || s.allowNegative !== undefined || (shape !== "fraction-of" && s.unit !== undefined)) return { ok: false, why: REJECT.key };
  if (s.unit !== undefined && !(UNITS as readonly unknown[]).includes(s.unit)) return { ok: false, why: REJECT.unit };
  if (typeof s.expr !== "string" || s.expr.length > MAX_EXPR) return { ok: false, why: REJECT.read };
  if (shape === "convert") {
    if (!(FORMS_ASKED as readonly unknown[]).includes(s.to)) return { ok: false, why: REJECT.form };
    const to = s.to as NumberFormAsked, expr = s.expr;
    let m = SIMPLIFY_RE.exec(expr);
    if (m) {
      const [a, b] = [BigInt(m[1]), BigInt(m[2])];
      return { ok: true, spec: s as SchoolSpec, node: fracNode(a, b), kind: { k: "convert", from: "fraction", to, given: mk(a, b) ?? qi(Z), a, b, text: expr } };
    }
    if ((m = DECIMAL_RE.exec(expr))) {
      const q = mk(BigInt(m[1] + m[2]), pow10(m[2].length))!;
      return { ok: true, spec: s as SchoolSpec, node: { k: "num", q, s: expr, whole: false }, kind: { k: "convert", from: "decimal", to, given: q, text: expr } };
    }
    if ((m = PERCENT_RE.exec(expr))) {
      const f = m[2] ?? "", q = mk(BigInt(m[1] + f), pow10(f.length) * BigInt(100))!;
      return { ok: true, spec: s as SchoolSpec, node: { k: "num", q, s: expr.slice(0, -1), whole: !f }, kind: { k: "convert", from: "percent", to, given: q, text: expr } };
    }
    return { ok: false, why: REJECT.read };
  }
  if (shape === "fraction-of") {
    const m = OF_RE.exec(s.expr);
    if (!m) return { ok: false, why: REJECT.read };
    const [a, b, N] = [BigInt(m[1]), BigInt(m[2]), BigInt(m[3])];
    const node: Node = { k: "op", op: "×", a: fracNode(a, b), b: { k: "num", q: qi(N), s: m[3], whole: true } };
    return { ok: true, spec: s as SchoolSpec, node, kind: { k: "of", a, b, N } };
  }
  if (shape === "missing") {
    const m = MISSING_RE.exec(s.expr);
    if (!m || (m[3] === "?") === (m[4] === "?")) return { ok: false, why: REJECT.read };
    const [a, b] = [BigInt(m[1]), BigInt(m[2])];
    const slot = m[3] === "?" ? "top" : "bottom";
    return { ok: true, spec: s as SchoolSpec, node: fracNode(a, b), kind: { k: "missing", a, b, known: BigInt(slot === "top" ? m[4] : m[3]), slot } };
  }
  const m = SIMPLIFY_RE.exec(s.expr);
  if (!m) return { ok: false, why: REJECT.read };
  const [a, b] = [BigInt(m[1]), BigInt(m[2])];
  return { ok: true, spec: s as SchoolSpec, node: fracNode(a, b), kind: { k: "simplify", a, b } };
}

/** The truth of a W7 shape (fraction-of, missing, simplify) with its bounds, or why not. */
function readKind(st: Extract<Structure, { ok: true }>): Read {
  const K = st.kind, lim = BigInt(MAX_LITERAL), dlim = BigInt(MAX_DENOMINATOR);
  const bottomOk = (d: bigint) => d >= BigInt(2) && d <= dlim;
  const ok = (truth: Q): Read => ({ ok: true, spec: st.spec, node: st.node, kind: K, truth });
  if (K.k === "of") {
    if (!bottomOk(K.b)) return { ok: false, why: REJECT.denominator };
    if (!(K.a < K.b)) return { ok: false, why: REJECT.proper };
    if (K.N > lim) return { ok: false, why: REJECT.big };
    const truth = mk(K.a * K.N, K.b)!;
    if (truth.n > BigInt(MAX_RESULT) * truth.d || truth.d > BigInt(MAX_RESULT)) return { ok: false, why: REJECT.result };
    return ok(truth);
  }
  if (K.k === "missing") {
    if (!bottomOk(K.b)) return { ok: false, why: REJECT.denominator };
    if (K.a > lim || K.known > lim) return { ok: false, why: REJECT.big };
    if (K.slot === "top") {
      if (!bottomOk(K.known)) return { ok: false, why: REJECT.denominator };
      if (K.known === K.b) return { ok: false, why: REJECT.same };
      if ((K.a * K.known) % K.b !== Z) return { ok: false, why: REJECT.notWhole };
      const t = (K.a * K.known) / K.b;
      return t > lim ? { ok: false, why: REJECT.result } : ok(qi(t));
    }
    if (K.known === K.a) return { ok: false, why: REJECT.same };
    if ((K.b * K.known) % K.a !== Z) return { ok: false, why: REJECT.notWhole };
    const t = (K.b * K.known) / K.a;
    return bottomOk(t) ? ok(qi(t)) : { ok: false, why: REJECT.denominator };
  }
  if (K.k === "simplify") {
    if (!bottomOk(K.b)) return { ok: false, why: REJECT.denominator };
    if (!(K.a < K.b)) return { ok: false, why: REJECT.proper };
    if (bgcd(K.a, K.b) === ONE) return { ok: false, why: REJECT.lowest };
    return ok(mk(K.a, K.b)!);
  }
  if (K.k === "convert") {
    // W7 batch 2: the value is the given number itself; the question asks for it in another form
    if (K.from === K.to) return { ok: false, why: REJECT.sameForm };
    if (K.from === "fraction") {
      if (!bottomOk(K.b!)) return { ok: false, why: REJECT.denominator };
      if (bgcd(K.a!, K.b!) !== ONE) return { ok: false, why: REJECT.notLowest };
    }
    if ((K.from === "decimal" && K.text.endsWith("0")) || (K.from === "percent" && K.text.endsWith(".0%"))) return { ok: false, why: REJECT.trailing };
    const v = K.given;
    if (v.n <= Z) return { ok: false, why: REJECT.negative };
    if (v.d === ONE) return { ok: false, why: REJECT.whole };
    if (v.n >= BigInt(10) * v.d) return { ok: false, why: REJECT.result };
    if (!terminating(v)) return { ok: false, why: REJECT.notDecimal };
    return ok(v);
  }
  return { ok: false, why: REJECT.shape };
}

function read(spec: unknown): Read {
  const st = structure(spec);
  if (!st.ok) return st;
  if (st.kind.k !== "compute") return readKind(st);
  const { node, spec: s0 } = st;
  const s = s0 as ComputeSpec;
  const ops = countOps(node);
  if (ops === 0) return { ok: false, why: REJECT.noOp };
  if (ops > MAX_OPS) return { ok: false, why: REJECT.tooMany };
  const lim = BigInt(MAX_LITERAL), dlim = BigInt(MAX_DENOMINATOR);
  for (const l of literals(node)) {
    if (l.k === "frac") {
      if (l.d === Z) return { ok: false, why: REJECT.divZero };
      if (l.n > lim) return { ok: false, why: REJECT.big };
      if (l.d === ONE || l.d > dlim) return { ok: false, why: REJECT.denominator };
    } else if (l.k === "num") {
      if (babs(l.q.n) > lim * l.q.d) return { ok: false, why: REJECT.big };
      if (!l.whole && l.s.split(".")[1].length > MAX_LITERAL_PLACES) return { ok: false, why: REJECT.places };
    }
  }
  const truth = evalNode(node);
  if (!truth) return { ok: false, why: REJECT.divZero };
  if (babs(truth.n) > BigInt(MAX_RESULT) * truth.d || truth.d > BigInt(MAX_RESULT)) return { ok: false, why: REJECT.result };
  if (truth.n <= Z && s.allowNegative !== true) return { ok: false, why: REJECT.negative };
  if (s.form === "decimal" && !terminating(truth)) return { ok: false, why: REJECT.notDecimal };
  return { ok: true, spec: s, node, kind: st.kind, truth };
}

/** The unit a spec's answer is in, when it names one (compute and fraction-of take one). */
const specUnit = (s: SchoolSpec): Unit | undefined => (s.shape === "compute" || s.shape === "fraction-of" ? s.unit : undefined);

/**
 * Is this spec a question the desk can print and judge? The expression reads (+ - × ÷, brackets, whole numbers,
 * decimals to 3 places, fractions a/b), has one to four operations, every whole number and top is at most 1000,
 * every bottom from 2 to 100; nothing divides by zero; the value is at most 10000 in size with a bottom of at most
 * 10000 in lowest terms; it is above zero unless `allowNegative`; `form: "decimal"` only for a terminating value;
 * a known form and unit; no answer field. The W7 shapes: `fraction-of` "a/b of N" with a proper fraction (bottom 2 to
 * 100) and a whole amount 1 to 1000, a unit only; `missing` "a/b = ?/d" or "a/b = c/?" whose missing number is whole
 * (a top at most 1000, a bottom 2 to 100) and not the given one's own; `simplify` "a/b", proper and not yet in lowest
 * terms; none of them takes a form or a sign flag.
 */
export function wellFormed(spec: unknown): { ok: true } | { ok: false; why: string } {
  try {
    const r = read(spec);
    return r.ok ? { ok: true } : { ok: false, why: r.why };
  } catch {
    return { ok: false, why: REJECT.read };
  }
}

// ------------------------------------------------------------------ printing the question

const OP_PLAIN: Record<Op, string> = { "+": "+", "-": "-", "×": "×", "÷": "÷" };
const OP_TEX: Record<Op, string> = { "+": "+", "-": "-", "×": "\\times", "÷": "\\div" };
function plainOf(n: Node): string {
  switch (n.k) {
    case "num": return n.s;
    case "frac": return `${n.n}/${n.d}`;
    case "neg": return `-${plainOf(n.a)}`;
    case "par": return `(${plainOf(n.a)})`;
    case "op": return `${plainOf(n.a)} ${OP_PLAIN[n.op]} ${plainOf(n.b)}`;
  }
}
function texOf(n: Node): string {
  switch (n.k) {
    case "num": return n.s;
    case "frac": return `\\frac{${n.n}}{${n.d}}`;
    case "neg": return `-${texOf(n.a)}`;
    case "par": return `(${texOf(n.a)})`;
    case "op": return `${texOf(n.a)} ${OP_TEX[n.op]} ${texOf(n.b)}`;
  }
}
const UNIT_WORD: Record<Unit, string> = { cm: "cm", m: "m", km: "km", mm: "mm", cm2: "cm²", m2: "m²", kg: "kg", g: "g", l: "litres", ml: "ml", min: "minutes", h: "hours", s: "seconds", "€": "euros", $: "dollars", "£": "pounds" };
/**
 * An amount's unit as a fraction-of question prints it after the number: a one-letter unit as its word, because the
 * typesetter sets a lone letter as a variable (40 m would read as 40 times m). € and £ are printed as a sign before
 * the number instead (€60); a dollar amount as "60 dollars" (a plain '$' is a TeX math delimiter to the typesetter).
 */
const AMOUNT_WORD: Record<Unit, string> = { ...UNIT_WORD, m: "metres", g: "grams", l: "litres", h: "hours", s: "seconds" };

/**
 * How a conversion question names the form it asks for (W7 batch 2): "percentage" as a UK sheet says it (the reader takes
 * "percent" too), and "a simplified fraction", which fits one printed row where "a fraction in its simplest form" does not.
 */
const CONVERT_ASK: Record<NumberFormAsked, string> = { decimal: "as a decimal", fraction: "as a simplified fraction", percent: "as a percentage" };

/**
 * A two-number computation with a decimal in it (Family W7 batch 2, "Add, subtract and multiply decimals"): its operation,
 * the two numbers exactly, and the places each is written to (trailing zeros counted: 2.80 has two); or null for any
 * other expression (a fraction, a division, three numbers, two whole numbers).
 */
type DecOp = { op: "+" | "-" | "×"; a: Q; b: Q; pa: number; pb: number };
function decimalPair(n: Node): DecOp | null {
  if (n.k !== "op" || n.op === "÷" || n.a.k !== "num" || n.b.k !== "num" || (n.a.whole && n.b.whole)) return null;
  const places = (x: { s: string; whole: boolean }) => (x.whole ? 0 : x.s.split(".")[1].length);
  return { op: n.op, a: n.a.q, b: n.b.q, pa: places(n.a), pb: places(n.b) };
}
/** The places a decimal's working carries: the longer of the two for + and -, their sum for ×. */
const workingPlaces = (d: DecOp) => (d.op === "×" ? d.pa + d.pb : Math.max(d.pa, d.pb));

/**
 * A money sum as a worksheet prints it (W7 batch 2): a € or £ sign before each amount of an addition or subtraction
 * ("€4.35 + €2.80"), and before the amount only of an amount times a whole count ("£3.45 × 4"); null otherwise (another
 * unit, a fraction, a count that is not whole), and the question then names the unit after it as before.
 */
function moneyLine(n: Node, unit: Unit): { plain: string; tex: string } | null {
  if ((unit !== "€" && unit !== "£") || n.k !== "op" || n.a.k !== "num" || n.b.k !== "num") return null;
  if (n.op === "+" || n.op === "-") return { plain: `${unit}${n.a.s} ${n.op} ${unit}${n.b.s}`, tex: `${unit}${n.a.s} ${n.op} ${unit}${n.b.s}` };
  if (n.op === "×" && n.b.whole) return { plain: `${unit}${n.a.s} × ${n.b.s}`, tex: `${unit}${n.a.s} \\times ${n.b.s}` };
  return null;
}

/**
 * The question, printed by code from the spec, as plain text and the TeX the typesetter reads: 'Work out 3/4 + 1/6.'
 * and '\text{Work out } \frac{3}{4} + \frac{1}{6}.', with 'Give your answer in its simplest form.' (or 'as a
 * decimal.', or 'in cm.') after it when the spec asks. Null when the spec is malformed; never a throw, never the
 * answer (the spec has none, and only its own numbers are printed).
 */
export function question(spec: unknown): { plain: string; tex: string } | null {
  try {
    const st = structure(spec);
    if (!st.ok) return null;
    const K = st.kind;
    if (K.k === "of") {
      // € and £ as a sign before the amount; a dollar as the word, since the typesetter reads a plain '$' as TeX's math delimiter and drops it
      const u = specUnit(st.spec), N = String(K.N), sign = u === "€" || u === "£";
      const amount = !u ? N : sign ? `${u}${N}` : `${N} ${AMOUNT_WORD[u]}`;
      const texAmount = !u ? N : sign ? `${u}${N}` : `${N} \\text{ ${AMOUNT_WORD[u]}}`;
      return { plain: `Find ${K.a}/${K.b} of ${amount}.`, tex: `\\text{Find } \\frac{${K.a}}{${K.b}} \\text{ of } ${texAmount}.` };
    }
    if (K.k === "missing") {
      const [p, q] = K.slot === "top" ? ["?", String(K.known)] : [String(K.known), "?"];
      return { plain: `Fill in the missing number: ${K.a}/${K.b} = ${p}/${q}.`, tex: `\\text{Fill in the missing number: } \\frac{${K.a}}{${K.b}} = \\frac{${p}}{${q}}.` };
    }
    if (K.k === "simplify") return { plain: `Write ${K.a}/${K.b} in its simplest form.`, tex: `\\text{Write } \\frac{${K.a}}{${K.b}} \\text{ in its simplest form.}` };
    if (K.k === "convert") {
      // W7 batch 2: "Write 3/8 as a decimal.", "Write 0.35 as a fraction in its simplest form.", "Write 35% as a decimal."
      const asked = CONVERT_ASK[K.to];
      const tex = K.from === "fraction" ? `\\frac{${K.a}}{${K.b}}` : K.from === "percent" ? `${K.text.slice(0, -1)}\\%` : K.text;
      return { plain: `Write ${K.text} ${asked}.`, tex: `\\text{Write } ${tex} \\text{ ${asked}.}` };
    }
    const { node } = st, s = st.spec as ComputeSpec;
    // money (W7 batch 2): "Work out €4.35 + €2.80.", "Work out £3.45 × 4." - the sign on each amount, never on a count
    const money = s.unit ? moneyLine(node, s.unit) : null;
    if (money && !s.form) return { plain: `Work out ${money.plain}.`, tex: `\\text{Work out } ${money.tex}.` };
    const tail = s.form === "simplest" ? "Give your answer in its simplest form." : s.form === "decimal" ? "Give your answer as a decimal." : s.unit ? `Give your answer in ${UNIT_WORD[s.unit]}.` : "";
    return {
      plain: `Work out ${plainOf(node)}.${tail ? ` ${tail}` : ""}`,
      tex: `\\text{Work out } ${texOf(node)}.${tail ? ` \\text{ ${tail}}` : ""}`,
    };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ the slips a closed form can detect

/** `name` is the slip's title, `says` the desk's line, `points` where to look: none carries a value. */
export interface SchoolSlip { id: string; name: string; says: string; points: string }

export const SCHOOL_SLIPS: readonly SchoolSlip[] = [
  { id: "tops-and-bottoms", name: "Added the tops and the bottoms", says: "The tops were combined and so were the bottoms. Fractions need the same bottom first; then only the tops change.", points: "the line where the fractions were combined" },
  { id: "top-not-scaled", name: "The top not scaled with the bottom", says: "A bottom was changed to the common one but its top was not multiplied by the same number.", points: "the line where the bottoms were made the same" },
  { id: "tops-one-bottom", name: "Added the tops, kept one bottom", says: "The tops were combined over one of the two bottoms. Make the bottoms the same before combining the tops.", points: "the line where the tops were combined" },
  { id: "wrong-direction", name: "Subtracted the wrong way round", says: "The subtraction was done the other way round. It is the first number take away the second.", points: "the subtraction" },
  // equivalent fractions (Family W7)
  { id: "added-same", name: "Added the same number to top and bottom", says: "The same number was added to the top and the bottom. Equal fractions come from multiplying or dividing the top and the bottom by the same number.", points: "the line where the fraction changed" },
  { id: "one-part-only", name: "Only one part changed", says: "One part of the fraction was changed and the other was left as it was. Whatever the bottom is multiplied or divided by, the top is too.", points: "the part that was left as it was" },
  { id: "wrong-factor", name: "Scaled by the wrong number", says: "The top and the bottom were not scaled by the same number. Find what the bottom was multiplied or divided by, and do exactly that to the top.", points: "the number you multiplied or divided by" },
  // a fraction of an amount (Family W7)
  { id: "of-upside-down", name: "Divided by the top, multiplied by the bottom", says: "The amount was divided by the top and multiplied by the bottom. Divide by the bottom to find a single part, then multiply by the top.", points: "the division" },
  { id: "of-one-part", name: "Stopped at a single part", says: "The amount was divided by the bottom, which gives a single part. The top says how many of those parts to take.", points: "the last line" },
  { id: "of-not-divided", name: "Multiplied without dividing", says: "The amount was multiplied by the top but never divided by the bottom. A fraction of an amount is smaller than the amount.", points: "the multiplication" },
  { id: "of-rest", name: "Found the part that is left", says: "This is the part left over, not the part asked for. The top says how many parts to take.", points: "the last line" },
  // multiply and divide fractions (Family W7)
  { id: "added-not-multiplied", name: "Added instead of multiplied", says: "The fractions were added. Multiplying fractions means multiplying the tops together and the bottoms together.", points: "the line where the fractions were combined" },
  { id: "kept-second", name: "The fraction you divide by not flipped", says: "Dividing by a fraction is multiplying by it turned upside down. The fraction you divide by was not turned over before multiplying.", points: "the line where the division became a multiplication" },
  { id: "flipped-first", name: "The wrong fraction flipped", says: "The first fraction was turned upside down. Only the fraction you divide by is turned over.", points: "the fraction that was turned over" },
  { id: "bottoms-added", name: "Multiplied the tops, added the bottoms", says: "The tops were multiplied but the bottoms were added. The tops and the bottoms are both multiplied.", points: "the bottom of the answer" },
  // add, subtract and multiply decimals (Family W7 batch 2)
  { id: "dec-lined-up", name: "Lined up the last digits, not the points", says: "The numbers were lined up by their last digits instead of by their decimal points. Write them with the points one under the other, then add or take away.", points: "the line where the numbers were written one under the other" },
  { id: "dec-point-product", name: "The point put back in the wrong place", says: "The digits of the product are right but the point is in the wrong place. Count the digits after the points in the question: the answer has that many after its point.", points: "the decimal point in the answer" },
  { id: "dec-point-dropped", name: "The point left out", says: "The digits are right but the decimal point was never put back, so the answer is far too big. Put the point back where the places say.", points: "the answer" },
  // fractions, decimals and percent (Family W7 batch 2)
  { id: "conv-flipped", name: "The fraction turned upside down", says: "The bottom was divided by the top. A fraction is its top divided by its bottom, never the other way round.", points: "the division" },
  { id: "conv-not-scaled", name: "The percent sign moved without scaling", says: "The percent sign was put on or taken off and the number left as it was. A percent counts hundredths, so the number has to be multiplied or divided by a hundred as well.", points: "the answer" },
  { id: "conv-wrong-way", name: "The point moved the wrong way", says: "The point moved two places, but the wrong way. A decimal written as a percent gets bigger; a percent written as a decimal gets smaller.", points: "the decimal point" },
  { id: "conv-ten-times", name: "Ten times too big or too small", says: "The answer is ten times too big or too small: the point moved one place too few or too many, or the bottom has one zero too many or too few. Count the places again.", points: "the decimal point or the bottom" },
  { id: "conv-top-dot-bottom", name: "The top and bottom written as a decimal", says: "The top and the bottom were written either side of a point. A fraction is the top divided by the bottom: that division gives the decimal.", points: "the answer" },
];

/** The common factors of a and b above 1, smallest first. */
function commonFactors(a: bigint, b: bigint): bigint[] {
  const g = bgcd(a, b), out: bigint[] = [];
  for (let f = BigInt(2); f <= g; f++) if (g % f === Z) out.push(f);
  return out;
}

/**
 * The value each slip gives from the spec's own numbers, in SCHOOL_SLIPS order within its unit; exact, no guessing.
 *   - a/b ± c/d: the four add/sub slips (W5a);
 *   - a/b × c/d: a/b + c/d and (a+c)/(b+d) added; ac/(b+d) the bottoms added. a/b ÷ c/d: ac/bd the fraction you divide
 *     by kept; bc/ad the first flipped; a/b + d/c added after the flip; ad/(b+c) the bottoms added after the flip;
 *   - a/b of N: N÷a×b upside down; N÷b a single part; a×N not divided; (b−a)×N÷b the part left;
 *   - a/b = ?/d (m = ad/b): a + (d − b) the same added; a one part only; a×d and a×b÷d (the other way) the wrong
 *     factor. a/b = c/? (m = bc/a): b + (c − a); b; b×c and b×a÷c. A missing number must be a whole number above 0;
 *   - simplify a/b: (a÷g)/b and a/(b÷g) one part only, (a÷g)/(b÷h) with g ≠ h the wrong factor, over every common
 *     factor g, h above 1;
 *   - a conversion of the value T (W7 batch 2): 1/T the fraction upside down (from or to a fraction); T/100 and T/10^4
 *     to a percent (the sign put on unscaled, 0.35%; the point moved the wrong way, 0.0035%), 100T and, to a decimal,
 *     10^4 T from a percent (the sign taken off unscaled, 35; the wrong way, 3500); 10T and T/10 ten times out (3.5%,
 *     35/10); from a fraction to a decimal, the top and bottom either side of a point (7/20 as 7.20);
 *   - decimals a ± b, a × b (W7 batch 2), P the working's places (the longer of the two for ±, their sum for ×): the
 *     numbers lined up by their last digits, (a·10^pa ± b·10^pb) / 10^P, when their places differ; the point put back
 *     by the wrong count, the value × 10^k for k = -1 and 1..P-1 (products only); the point left out, the value × 10^P.
 */
function slipCandidates(r: ReadOk): [string, Q][] {
  const out: [string, Q][] = [];
  const push = (id: string, v: Q | null) => { if (v) out.push([id, v]); };
  const K = r.kind;
  if (K.k === "of") {
    push("of-upside-down", mk(K.N * K.b, K.a));
    push("of-one-part", mk(K.N, K.b));
    push("of-not-divided", qi(K.a * K.N));
    push("of-rest", mk((K.b - K.a) * K.N, K.b));
    return out;
  }
  if (K.k === "missing") {
    const whole = (x: bigint) => (x > Z ? qi(x) : null);
    const [given, other, known] = K.slot === "top" ? [K.a, K.b, K.known] : [K.b, K.a, K.known];
    push("added-same", whole(given + known - other));
    push("one-part-only", whole(given));
    push("wrong-factor", whole(given * known));
    if ((given * other) % known === Z) push("wrong-factor", whole((given * other) / known));
    return out;
  }
  if (K.k === "simplify") {
    const fs = commonFactors(K.a, K.b);
    for (const g of fs) { push("one-part-only", mk(K.a / g, K.b)); push("one-part-only", mk(K.a, K.b / g)); }
    for (const g of fs) for (const h of fs) if (g !== h) push("wrong-factor", mk(K.a / g, K.b / h));
    return out;
  }
  if (K.k === "convert") {
    // W7 batch 2: T the value, as each classic wrong conversion leaves it
    const T = r.truth, H = qi(BigInt(100)), TT = qi(TEN), T4 = qi(pow10(4));
    if (K.from === "fraction" || K.to === "fraction") push("conv-flipped", mk(T.d, T.n));
    if (K.to === "percent") { push("conv-not-scaled", div(T, H)); push("conv-wrong-way", div(T, T4)); }
    if (K.from === "percent") { push("conv-not-scaled", mul(T, H)); if (K.to === "decimal") push("conv-wrong-way", mul(T, T4)); }
    push("conv-ten-times", mul(T, TT)); push("conv-ten-times", div(T, TT));
    if (K.from === "fraction" && K.to === "decimal") { const b = K.b!, L = pow10(String(b).length); push("conv-top-dot-bottom", mk(K.a! * L + b, L)); }
    return out;
  }
  const node = r.node;
  const dp = decimalPair(node);
  if (dp) {
    // W7 batch 2, decimals: the digits right and the point wrong, from the operands' own places
    const T = r.truth, P = workingPlaces(dp);
    const shifted = (k: number) => (k >= 0 ? mul(T, qi(pow10(k))) : mk(T.n, T.d * pow10(-k)));
    if (dp.op !== "×") {
      if (dp.pa !== dp.pb) {
        const ia = mul(dp.a, qi(pow10(dp.pa))).n, ib = mul(dp.b, qi(pow10(dp.pb))).n, s = dp.op === "+" ? ia + ib : ia - ib;
        if (s > Z) push("dec-lined-up", mk(s, pow10(P)));
      }
    } else {
      push("dec-point-product", shifted(-1));
      for (let k = 1; k < P; k++) push("dec-point-product", shifted(k));
    }
    push("dec-point-dropped", shifted(P));
    return out;
  }
  if (node.k !== "op") return [];
  const part =(n: Node): [bigint, bigint] | null => (n.k === "frac" ? [n.n, n.d] : n.k === "num" && n.whole ? [n.q.n, ONE] : null);
  const p = part(node.a), q = part(node.b);
  if (!p || !q) return [];
  const [a, b] = p, [c, d] = q;
  if (node.op === "×") {
    push("added-not-multiplied", mk(a * d + c * b, b * d));
    push("added-not-multiplied", mk(a + c, b + d));
    push("bottoms-added", mk(a * c, b + d));
    return out;
  }
  if (node.op === "÷") {
    push("added-not-multiplied", c === Z ? null : mk(a * c + d * b, b * c));
    push("kept-second", mk(a * c, b * d));
    push("flipped-first", mk(b * c, a * d));
    push("bottoms-added", mk(a * d, b + c));
    return out;
  }
  const plus = node.op === "+";
  const comb = (x: bigint, y: bigint) => (plus ? x + y : x - y);
  push("tops-and-bottoms", mk(comb(a, c), comb(b, d)));
  if (b !== d) {
    const l = (b * d) / bgcd(b, d);
    for (const L of l === b * d ? [l] : [l, b * d]) {
      push("top-not-scaled", mk(comb(a, c), L));
      push("top-not-scaled", mk(comb((a * L) / b, c), L));
      push("top-not-scaled", mk(comb(a, (c * L) / d), L));
    }
    push("tops-one-bottom", mk(comb(a, c), b));
    push("tops-one-bottom", mk(comb(a, c), d));
  }
  if (!plus) push("wrong-direction", sub(mk(c, d)!, mk(a, b)!));
  return out;
}

// ------------------------------------------------------------------ judging an answer

export interface SchoolVerdict { verdict: "right" | "wrong" | "unsure"; slip?: string; form?: Reading["form"]; why: string }

const WHY = {
  right: "It agrees with what the desk worked out for itself.",
  wrong: "It does not agree with what the desk worked out for itself.",
  slip: "It is what a known wrong method gives.",
  empty: "There is no answer to check.",
  unreadable: "The desk cannot read this as one number, and it does not guess.",
  ratio: "This is written as a ratio; the question asks for one number.",
  unit: "The answer carries a unit the question did not ask for.",
  otherUnit: "The answer is in a different unit from the question's; the desk does not convert.",
  simplest: "The value is right; the question asks for it in its simplest form.",
  decimal: "The value is right; the question asks for it as a decimal.",
  rounded: "This is a rounded value; the desk asks for the exact one.",
  badSpec: "The desk cannot work this question out for itself, so it does not judge the answer.",
  given: "This is a fraction equal to the one given; the question asks for the missing number.",
  twoWays: "This reads two ways here, one right and one not, and the desk does not guess.",
  percent: "The value is right; the question asks for it as a percentage.",
  fraction: "The value is right; the question asks for it as a fraction.",
  noSign: "This reads as the percentage without its percent sign, and the desk does not guess.",
} as const;

/** The top and bottom as written, for an answer that reads as a plain fraction ('9/12', 'x = 9/12', '9 / 12.'), or null. */
function writtenFraction(answer: string): [bigint, bigint] | null {
  let s = normalise(answer).replace(/^(?:x ?=|answer ?[:=]|ans ?[:=]|=) ?/i, "");
  if (/[^.]\.$/.test(s)) s = s.slice(0, -1).trimEnd();
  const m = /^(\d+) ?\/ ?(\d+)$/.exec(s);
  return m ? [BigInt(m[1]), BigInt(m[2])] : null;
}

/** Decimal places as written, trailing zeros aside: 0.9170 is written to 3. */
const placesOf = (r: NumberReading, value: Q): number => {
  let k = r.places ?? 0;
  const scale = r.form === "percent" ? mul(value, qi(BigInt(100))) : value;
  while (k > 0 && exactAt(scale, k - 1)) k--;
  return k;
};

/**
 * The verdict on what a learner wrote, from the spec alone (the truth is recomputed, never stored):
 *   - the same value in any written form is right: 22/24, 0.75 and 75% for 3/4, 1 1/2 for 3/2;
 *   - `form: "simplest"`: right only as a whole number, a fraction or a mixed number in lowest terms (an improper
 *     fraction in lowest terms counts); the same value in another form is UNSURE, never wrong - the value is right
 *     and the form asks for more, so the TV never prints a wrong verdict for it. `form: "decimal"`: a decimal (or a
 *     whole number) is right, the same value otherwise is unsure;
 *   - a decimal or percent that is not the value but lies within one unit of its last written place of it, when
 *     the value cannot be written exactly to that many places, is a rounding: UNSURE (0.9167, 0.92, 0.9 for 11/12;
 *     0.8 for 3/4). A value that can be written to those places and differs is wrong (0.76 for 3/4);
 *   - any other value is wrong, with a slip id when a known wrong method from SCHOOL_SLIPS gives exactly that value
 *     from the spec's own operands (recomputed here, no model);
 *   - unsure: an empty or unreadable answer (readNumber null), a ratio, a unit the question did not ask for, a unit
 *     other than the question's (no conversion), or a spec the desk cannot work out. A missing unit on a question
 *     with one is not held against the value.
 * By shape (Family W7): a `simplify` spec asks for lowest terms exactly as `form: "simplest"` does (9/12 or 0.75 for
 * 18/24 is unsure, 3/4 right). A `fraction-of` spec is a compute a/b × N with the amount's unit. A `missing` spec asks
 * for a whole number: its value in any form is right (9, 9.0, 18/2 for 3/4 = ?/12), and a fraction answer that
 * completes the given one is read as its missing part (9/12 is 9, 10/12 is 10: judged as 10); a fraction equal to the
 * given one that does not complete it (3/4, 6/8, 0.75) is UNSURE - the child wrote a fraction, not the number asked for.
 * The `why` is a fixed sentence of the desk's, with no value in it.
 */
export function check(spec: unknown, writing: unknown, system: unknown): SchoolVerdict {
  try {
    const r = read(spec);
    if (!r.ok) return { verdict: "unsure", why: WHY.badSpec };
    if (typeof writing !== "string" || !writing.trim()) return { verdict: "unsure", why: WHY.empty };
    const reading = readNumber(writing, system);
    if (!reading) return { verdict: "unsure", why: WHY.unreadable };
    const form = reading.form;
    if (reading.kind === "ratio") return { verdict: "unsure", form, why: WHY.ratio };
    const unit = specUnit(r.spec);
    if (reading.unit && !unit) return { verdict: "unsure", form, why: WHY.unit };
    if (reading.unit && reading.unit !== unit) return { verdict: "unsure", form, why: WHY.otherUnit };
    let v = fromRat(reading.value);
    const t = r.truth, K = r.kind;
    if (K.k === "missing") {
      const given = mk(K.a, K.b)!, w = form === "fraction" ? writtenFraction(writing) : null;
      const slotted = w && K.slot === "top" && w[1] === K.known ? w[0] : w && K.slot === "bottom" && w[0] === K.known ? w[1] : null;
      if (slotted !== null) {
        // 12/4 for 12/16 = ?/4: as the completed fraction its top is 12 (wrong), as a value it is 3 (right) - not guessed
        if (!eq(qi(slotted), t) && eq(v, t)) return { verdict: "unsure", form, why: WHY.twoWays };
        v = qi(slotted);
      } else if (eq(v, given) && !eq(v, t)) return { verdict: "unsure", form, why: WHY.given };
    }
    if (K.k === "convert") {
      // W7 batch 2: the value right in another form is unsure, never wrong; to a percentage, the percent's number without
      // its sign (35 for 0.35) is unsure too - it is the answer or a slip, and the desk does not guess which
      if (eq(v, t)) {
        const fits = K.to === "decimal" ? form === "decimal" || form === "integer" : K.to === "percent" ? form === "percent" : (form === "fraction" || form === "mixed") && reading.lowest === true;
        if (fits) return { verdict: "right", form, why: WHY.right };
        const why = K.to === "decimal" ? WHY.decimal : K.to === "percent" ? WHY.percent : form === "fraction" || form === "mixed" ? WHY.simplest : WHY.fraction;
        return { verdict: "unsure", form, why };
      }
      if (K.to === "percent" && (form === "integer" || form === "decimal") && eq(v, mul(t, qi(BigInt(100))))) return { verdict: "unsure", form, why: WHY.noSign };
    }
    const simplest = K.k === "simplify" || (r.spec.shape === "compute" && r.spec.form === "simplest");
    const decimalAsked = r.spec.shape === "compute" && r.spec.form === "decimal";
    if (eq(v, t)) {
      if (simplest) {
        const simple = form === "integer" || ((form === "fraction" || form === "mixed") && reading.lowest === true);
        return simple ? { verdict: "right", form, why: WHY.right } : { verdict: "unsure", form, why: WHY.simplest };
      }
      if (decimalAsked) {
        return form === "decimal" || form === "integer" ? { verdict: "right", form, why: WHY.right } : { verdict: "unsure", form, why: WHY.decimal };
      }
      return { verdict: "right", form, why: WHY.right };
    }
    if (form === "decimal" || form === "percent") {
      const k = placesOf(reading, v);
      const scaled = (x: Q) => (form === "percent" ? mul(x, qi(BigInt(100))) : x);
      if ((k > 0 || form === "percent") && !exactAt(scaled(t), k) && withinPlace(scaled(v), scaled(t), k)) return { verdict: "unsure", form, why: WHY.rounded };
    }
    // a slip is the exact value a known wrong method gives, or (W7) a rounding of one that has no exact decimal to that
    // many places (66.67 for 40 ÷ 3 × 5 = 200/3): the value is wrong either way, the rounding only names the method
    const k = form === "decimal" || form === "percent" ? placesOf(reading, v) : 0;
    const sc = (x: Q) => (form === "percent" ? mul(x, qi(BigInt(100))) : x);
    const rounds = (c: Q) => (k > 0 || form === "percent") && !exactAt(sc(c), k) && withinPlace(sc(v), sc(c), k);
    const slips = slipCandidates(r).filter(([, c]) => !eq(c, t));
    const named = slips.find(([, c]) => eq(c, v)) ?? slips.find(([, c]) => rounds(c));
    return named ? { verdict: "wrong", slip: named[0], form, why: WHY.slip } : { verdict: "wrong", form, why: WHY.wrong };
  } catch {
    return { verdict: "unsure", why: WHY.unreadable };
  }
}

// ------------------------------------------------------------------ the leak check

const SMALL: Record<string, number> = { zero: 0, nought: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const UNIT_ORD: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9 };
const ORD: Record<string, number> = {
  half: 2, third: 3, quarter: 4, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
  thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20,
  thirtieth: 30, fortieth: 40, fiftieth: 50, sixtieth: 60, seventieth: 70, eightieth: 80, ninetieth: 90, hundredth: 100,
};
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/** A fraction word's denominator ('twelfths' 12, 'halves' 2, 'twenty-fourths' 24), or null. 'second' alone is time. */
function ordOf(w: string): number | null {
  if (w === "halves") return 2;
  const s = w.endsWith("s") ? w.slice(0, -1) : w;
  if (own(ORD, s)) return ORD[s];
  const m = /^([a-z]+)-([a-z]+)$/.exec(s);
  return m && own(TENS, m[1]) && own(UNIT_ORD, m[2]) ? TENS[m[1]] + UNIT_ORD[m[2]] : null;
}
/** One cardinal word ('seven', 'forty', 'twenty-one'), or null. */
function cardWord(w: string): number | null {
  if (own(SMALL, w)) return SMALL[w];
  if (own(TENS, w)) return TENS[w];
  const m = /^([a-z]+)-([a-z]+)$/.exec(w);
  return m && own(TENS, m[1]) && own(SMALL, m[2]) && SMALL[m[2]] >= 1 && SMALL[m[2]] <= 9 ? TENS[m[1]] + SMALL[m[2]] : null;
}

/** A statement cue straight before a lone 'one': then it is the number, not the pronoun. */
const CUE = /(?:\bis|=|\bmakes|\bgives|\bget|\bgets|\bgot|\bequals|\bleaves|\bbecomes)\s*$/;

/** The line with its number words as digits (rules in this file's header). */
function wordsToDigits(text: string): string {
  const toks: { w: string; s: number; e: number }[] = [];
  const re = /[a-z]+(?:-[a-z]+)*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) toks.push({ w: m[0], s: m.index, e: m.index + m[0].length });
  const next = (i: number) => (i + 1 < toks.length && /^\s+$/.test(text.slice(toks[i].e, toks[i + 1].s)) ? toks[i + 1].w : undefined);
  type R = { v: number; j: number };
  const below100 = (i: number): R | null => {
    if (i >= toks.length) return null;
    const w = toks[i].w, v = cardWord(w);
    if (v === null) return null;
    const u = next(i);
    if (own(TENS, w) && u !== undefined && own(SMALL, u) && SMALL[u] >= 1 && SMALL[u] <= 9) return { v: v + SMALL[u], j: i + 2 };
    return { v, j: i + 1 };
  };
  const card = (i: number): R | null => {
    if (i >= toks.length) return null;
    const w = toks[i].w;
    if ((w === "a" || w === "one") && next(i) === "thousand") return { v: 1000, j: i + 2 };
    let v: number, j: number;
    if (w === "a" && next(i) === "hundred") { v = 100; j = i + 2; }
    else {
      const b = below100(i);
      if (!b) return null;
      if (!(b.v >= 1 && b.v <= 9 && next(b.j - 1) === "hundred")) return b;
      v = b.v * 100; j = b.j + 1;
    }
    if (next(j - 1) === "and") { const r = below100(j + 1); if (r && next(j) !== undefined) return { v: v + r.v, j: r.j }; }
    if (next(j - 1) !== undefined) { const r = below100(j); if (r) return { v: v + r.v, j: r.j }; }
    return { v, j };
  };
  const numer = (i: number): R | null => (i < toks.length && (toks[i].w === "a" || toks[i].w === "an") ? { v: 1, j: i + 1 } : card(i));
  /** One hyphened fraction word ('three-quarters', 'eleven-twelfths'); 'twenty-fourths' is an ordinal, not 20/4. */
  const hyFrac = (i: number): string | null => {
    if (i >= toks.length) return null;
    const w = toks[i].w, m = /^([a-z]+)-([a-z]+)$/.exec(w);
    if (!m || ordOf(w) !== null) return null;
    const n = cardWord(m[1]), o = ordOf(m[2]);
    return n !== null && o ? `${n}/${o}` : null;
  };
  const at = (i: number): { j: number; rep: string } | null => {
    const w = toks[i].w, c = card(i);
    const hf = hyFrac(i);
    if (hf) return { j: i + 1, rep: hf };
    if (c && next(c.j - 1) === "and" && next(c.j) !== undefined) {
      const hm = hyFrac(c.j + 1);
      if (hm) return { j: c.j + 2, rep: `${c.v} ${hm}` };
      const nu = numer(c.j + 1);
      const o = nu && next(nu.j - 1) !== undefined ? ordOf(toks[nu.j].w) : null;
      if (nu && o) return { j: nu.j + 1, rep: `${c.v} ${nu.v}/${o}` };
    }
    const nu = numer(i);
    if (nu && next(nu.j - 1) !== undefined) {
      const o = ordOf(toks[nu.j].w);
      if (o) return { j: nu.j + 1, rep: `${nu.v}/${o}` };
    }
    if (c) {
      const after = next(c.j - 1);
      if (after === "over") { const b = card(c.j + 1); if (b) return { j: b.j, rep: `${c.v}/${b.v}` }; }
      if (after === "out" && next(c.j) === "of") { const b = card(c.j + 2); if (b) return { j: b.j, rep: `${c.v}/${b.v}` }; }
      if (after === "point") {
        let k = c.j + 1, ds = "";
        while (k < toks.length && next(k - 1) !== undefined && own(SMALL, toks[k].w) && SMALL[toks[k].w] <= 9) { ds += SMALL[toks[k].w]; k++; }
        if (ds) return { j: k, rep: `${c.v}.${ds}` };
      }
      if (after === "percent") return { j: c.j + 1, rep: `${c.v}%` };
      if (after === "per" && next(c.j) === "cent") return { j: c.j + 2, rep: `${c.v}%` };
      if (w === "one" && c.j === i + 1 && !CUE.test(text.slice(0, toks[i].s))) return null;
      return { j: c.j, rep: String(c.v) };
    }
    if (w === "half") return { j: i + 1, rep: "1/2" };
    if (w === "quarter") return { j: i + 1, rep: "1/4" };
    return null;
  };
  let out = "", from = 0;
  for (let i = 0; i < toks.length;) {
    const r = at(i);
    if (!r) { i++; continue; }
    out += text.slice(from, toks[i].s) + r.rep;
    from = toks[r.j - 1].e;
    i = r.j;
  }
  return out + text.slice(from);
}

/** Every run of digits in a line: whole, then split at commas, then split at spaces and commas. */
const RUN = /(?<![\w.,/:])(?:[.,]\d|\d)(?:[\d.,]|\s(?=\d)|\s*[/:]\s*(?=\d))*(?:\s*(?:%|per\s?cent\b))?/g;

/** The hint line as the leak check reads it: lower case, one spelling for dashes and fractions, words as digits. */
const SUP: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
const SUB: Record<string, string> = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };
function leakText(line: string): string {
  let t = line.toLowerCase()
    .replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s*[⁄∕/]\s*([₀₁₂₃₄₅₆₇₈₉]+)/g, (_, a: string, b: string) => `${[...a].map((c) => SUP[c]).join("")}/${[...b].map((c) => SUB[c]).join("")}`)
    .replace(VULGAR_RE, (c) => ` ${VULGAR[c]}`).replace(/[−–—‐‑]/g, "-").replace(/[⁄∕]/g, "/").replace(/[    ]/g, " ").replace(/[×*]/g, " x ").replace(/÷/g, " divided by ");
  t = t.replace(/(\d+)(?:\s+|\s*\/\s*)(\d+)(?:st|nd|rd|th)s?\b/g, "$1/$2").replace(/(\d)(?:st|nd|rd|th)s?\b/g, "$1");
  t = t.replace(/(\d+)\s+([a-z]+(?:-[a-z]+)?)\b/g, (m0, n: string, w: string) => { const o = ordOf(w); return o ? `${n}/${o}` : m0; });
  t = wordsToDigits(t);
  // money said the way it is spoken (W7 batch 2): "13 pounds 80", "£13 and 80p", "4 euros 5" are 13.80, 13.80, 4.05
  t = t.replace(/([£€$])\s?(\d+)\s*(?:and\s*)?(\d{1,2})\s*(?:p|pence|c|cents?)\b/g, (_, s: string, w: string, c: string) => `${s}${w}.${c.padStart(2, "0")}`)
    .replace(/(\d+)\s*(?:pounds?|euros?|dollars?)\s*(?:and\s*)?(\d{1,2})(?:\s*(?:p|pence|cents?))?(?![\d,/]|\.\d)/g, (_, w: string, c: string) => `${w}.${c.padStart(2, "0")}`);
  t = t.replace(/(\d+)\s+(?:over|out\s+of)\s+(\d+)/g, "$1/$2").replace(/(\d+)\s+and\s+(\d+\s*\/\s*\d+)/g, "$1 $2");
  return t;
}

/**
 * What a hint must not say for this spec (the rules in this file's header, by shape):
 *   - `targets`: the answer's value and, over one, its fractional part (rules 1-3, 5);
 *   - `lowestOnly` (simplify): an equal fraction NOT in lowest terms is a step (9/12 on the way from 18/24), not the answer;
 *   - `bare`: whole numbers that leak alone (rule 4): the answer's top over a working denominator for compute and
 *     fraction-of; the answer's top AND bottom for simplify; none for a missing number (its value is a target);
 *   - `restated`: an operation that is the question itself or its operands rewritten (rule 6's exception); a division
 *     a/b ÷ c/d is also restated as a/b × d/c, the flip, which is a step;
 *   - `written`: a missing number's completed fraction (9/12 for 3/4 = ?/12), refused wherever it is written.
 */
interface LeakProfile {
  T: Q; targets: Q[]; lowestOnly: boolean; bare: Set<string>; restated: { p: Q; o: Op; q: Q; both: boolean }[]; written: RegExp[];
  /** A conversion (W7 batch 2): the form it is given in and the form it asks for, and, to a percentage, the percent's number (100T). */
  convert?: { from: NumberFormAsked; to: NumberFormAsked; hundred: Q };
}

function leakProfile(r: ReadOk): LeakProfile {
  const T = qabs(r.truth);
  const whole = T.n / T.d, fracPart = T.n > T.d && T.d !== ONE ? mk(T.n - whole * T.d, T.d)! : null;
  const targets = fracPart ? [T, fracPart] : [T];
  const K = r.kind;
  if (K.k === "convert") {
    // W7 batch 2: the value in the form asked for is the answer, in the form given it is the question. Bare: to a fraction
    // its lowest bottom (and top above 1); to a percentage the percent's number (35); to a decimal from a fraction the
    // decimal's digits (375 for 3/8). Restated: the division a fraction is (3 ÷ 8), a percent over a hundred (35 ÷ 100),
    // the value times a hundred on the way to a percentage (0.35 × 100) - each is the method, not the answer.
    const H = qi(BigInt(100)), hundred = mul(T, H), bare = new Set<string>(), restated: LeakProfile["restated"] = [];
    if (K.to === "fraction") { bare.add(String(T.d)); if (T.n > ONE) bare.add(String(T.n)); }
    if (K.to === "percent" && hundred.d === ONE) bare.add(String(hundred.n));
    if (K.to === "decimal" && K.from === "fraction") { const d = mul(T, qi(pow10(placesNeeded(T)))); bare.add(String(d.n)); }
    if (K.from === "fraction") restated.push({ p: qi(K.a!), o: "÷", q: qi(K.b!), both: false });
    if (K.from === "percent") restated.push({ p: hundred, o: "÷", q: H, both: false });
    if (K.to === "percent") restated.push({ p: T, o: "×", q: H, both: true });
    return { T, targets: [T], lowestOnly: false, bare, restated, written: [], convert: { from: K.from, to: K.to, hundred } };
  }
  if (K.k === "missing") {
    const [p, q] = K.slot === "top" ? [T.n, K.known] : [K.known, T.n];
    return { T, targets: [T], lowestOnly: false, bare: new Set(), restated: [], written: [new RegExp(`(?<![\\d.,/])${p}\\s*/\\s*${q}(?!\\d)`)] };
  }
  if (K.k === "simplify") return { T, targets: [T], lowestOnly: true, bare: new Set([String(T.n), String(T.d)]), restated: [], written: [] };
  // compute and fraction-of: the working denominators, and the answer's top over each (rule 4)
  const dens = new Set<bigint>([T.d]);
  const restated: LeakProfile["restated"] = [];
  const n0 = r.node;
  if (n0.k === "op") {
    const operand = (n: Node): Q | null => (n.k === "frac" || n.k === "num" ? evalNode(n) : null);
    const a = operand(n0.a), b = operand(n0.b);
    if (a && b) {
      restated.push({ p: qabs(a), o: n0.op, q: qabs(b), both: n0.op === "+" || n0.op === "×" });
      if (n0.op === "÷" && b.n !== Z) restated.push({ p: qabs(a), o: "×", q: qabs(mk(b.d, b.n)!), both: true });
    }
    if (n0.a.k === "frac" && n0.b.k === "frac") {
      const [q1, s2, t2] = [n0.a.d, n0.b.n, n0.b.d];
      if (n0.op === "+" || n0.op === "-") { dens.add((q1 * t2) / bgcd(q1, t2)); dens.add(q1 * t2); }
      else if (n0.op === "×") dens.add(q1 * t2);
      else dens.add(q1 * s2);
    }
  }
  const dp = decimalPair(n0);
  if (dp) {
    // decimals (W7 batch 2): the answer's digits with the point left out are the answer too ("715, then put the point
    // back" for 4.35 + 2.8), at the working's places and the answer's own; no fractional part is a target (0.15 of 7.15)
    const bare = new Set<string>();
    for (const k of new Set([workingPlaces(dp), placesNeeded(T)])) { const d = mul(T, qi(pow10(k))); if (d.d === ONE) bare.add(String(d.n)); }
    return { T, targets: [T], lowestOnly: false, bare, restated, written: [] };
  }
  const bare = new Set<string>();
  for (const L of dens) if (L % T.d === Z) bare.add(String((T.n * L) / T.d));
  // the fractional part of an answer over one is no leak where the question prints it (the 1/2 of 3/4 ÷ 1/2 = 1 1/2)
  const printed = restated.flatMap((s) => [s.p, s.q]);
  const own = fracPart && printed.some((x) => eq(x, fracPart)) ? [T] : targets;
  return { T, targets: own, lowestOnly: false, bare, restated, written: [] };
}

type Joiner = Op | "less" | "into";
/**
 * The operation joining two numbers in a hint line, from the words between them (and, for "by" and "into", the verb
 * before the first): + - × ÷, "less than" (b - a), "goes into" (b ÷ a), or null. "of", "lots of", "groups of" are ×;
 * "multiply A by B" ×, "divide A by B" ÷, "divide (share, split) A into (between, among) B" ÷.
 */
function joiner(gap: string, before: string): Joiner | null {
  if (/^(?:\+|plus|add)$/.test(gap)) return "+";
  if (/^(?:-|minus|take away|subtract)$/.test(gap)) return "-";
  if (/^(?:x|times|multiplied by|of|lots of|groups of|sets of)$/.test(gap)) return "×";
  if (/^divided by$/.test(gap)) return "÷";
  if (/^less than$/.test(gap)) return "less";
  if (/^goes into$/.test(gap)) return "into";
  if (gap === "by") return /\b(?:multiply|times)\s*$/.test(before) ? "×" : /\bdivide\s*$/.test(before) ? "÷" : null;
  if (/^(?:into|between|among)$/.test(gap) && /\b(?:divide|share|split)\s*$/.test(before)) return "÷";
  return null;
}
const apply = (o: Op, p: Q, q: Q): Q | null => (o === "+" ? add(p, q) : o === "-" ? sub(p, q) : o === "×" ? mul(p, q) : div(p, q));

/**
 * Does this hint or explanation line state the answer, or give it away? The rule is in this file's header, and each
 * shape's own part of it in `leakProfile`. Two more readings of rule 6 (W7): three numbers chained by × and ÷ whose
 * value is the answer ("12 ÷ 4 × 3" for 3/4 = ?/12, "40 ÷ 5 × 3" for 3/5 of 40), and the joining words above. False
 * for a line that is not text or a spec the desk cannot work out (there is nothing to leak); an internal fault refuses
 * the line (true), the strict side.
 */
export function leaksSchool(spec: unknown, hint: unknown): boolean {
  if (typeof hint !== "string" || !hint.trim()) return false;
  let r: Read;
  try { r = read(spec); } catch { return false; }
  if (!r.ok) return false;
  try {
    const pr = leakProfile(r), { T, targets } = pr;
    const hit = (rd: Reading, piece: string): boolean => {
      if (rd.kind === "ratio") {
        const [p, q] = rd.parts.map(fromRat);
        const v = q.n === Z ? null : div(p, q);
        return !!v && targets.some((x) => eq(qabs(v), x));
      }
      const v = qabs(fromRat(rd.value));
      const cv = pr.convert;
      if (cv) {
        // a conversion (W7 batch 2): which written forms of its value give the answer away. A fraction over 10, 100 or
        // 1000 (35/100, 375/1000) IS the decimal or the percentage, only spelled another way.
        const tenths = (rd.form === "fraction" || rd.form === "mixed") && /\/\s*10{1,6}$/.test(piece.trim());
        const fractionish = rd.form === "fraction" || rd.form === "mixed";
        const given = cv.from === "fraction" ? fractionish && !tenths : rd.form === cv.from;
        if (given) return false;
        const leaksForm = cv.to === "fraction" ? fractionish && rd.lowest === true : rd.form === "decimal" || rd.form === "percent" || rd.form === "integer" || tenths;
        if (eq(v, T)) return leaksForm;
        if (cv.to === "percent" && rd.form !== "percent" && eq(v, cv.hundred)) return true; // 37.5 or 35: the percentage without its sign
        if (rd.form === "integer" && v.d === ONE && pr.bare.has(String(v.n))) return true;
        if (cv.to !== "fraction" && (rd.form === "decimal" || rd.form === "percent")) {
          const pct = rd.form === "percent", k = placesOf(rd, v), sc = (x: Q) => (pct ? mul(x, qi(BigInt(100))) : x);
          if ((k > 0 || pct) && withinPlace(sc(v), sc(T), k)) return true;
        }
        return false;
      }
      // simplify: an equal fraction that is not in lowest terms is a step on the way, not the answer
      const step = pr.lowestOnly && (rd.form === "fraction" || rd.form === "mixed") && rd.lowest === false;
      if (!step && targets.some((x) => eq(v, x))) return true;
      if (rd.form === "integer" && v.d === ONE && pr.bare.has(String(v.n))) return true;
      if (rd.form === "decimal" || rd.form === "percent") {
        const pct = rd.form === "percent", k = placesOf(rd, v);
        const scaled = (x: Q) => (pct ? mul(x, qi(BigInt(100))) : x);
        if ((k > 0 || pct) && targets.some((x) => withinPlace(scaled(v), scaled(x), k))) return true;
      }
      return false;
    };
    /** Every reading of a piece under the four systems, and a percent of a fraction or mixed number (91 2/3 %). */
    const readingsOf = (p: string): Reading[] => {
      const out: Reading[] = [];
      const pc = /^(.*\d) ?(?:%|per ?cent)$/.exec(p);
      for (const sys of SCHOOL_SYSTEMS) {
        const rd = readNumber(p, sys);
        if (rd) out.push(rd);
        const b = pc ? readNumber(pc[1], sys) : null;
        if (b && b.kind === "number") out.push({ kind: "number", value: toRat(mk(BigInt(b.value.n), BigInt(b.value.d) * BigInt(100))!), form: "fraction" });
      }
      return out;
    };
    const text = leakText(hint);
    if (pr.written.some((re) => re.test(text))) return true;
    const runs: { s: number; e: number; values: Q[] }[] = [];
    for (const m of text.matchAll(RUN)) {
      const run = m[0].replace(/[.,\s]+$/, "");
      const pieces = new Set<string>([run, ...run.split(/,\s*/), ...run.split(/[\s,]+/)]);
      for (const p of pieces) if (p && readingsOf(p).some((rd) => hit(rd, p))) return true;
      const values = readingsOf(run).flatMap((rd) => (rd.kind === "number" ? [qabs(fromRat(rd.value))] : []));
      runs.push({ s: m.index ?? 0, e: (m.index ?? 0) + run.length, values });
    }
    // rule 6: two numbers joined by an operation whose value is the answer (or, for two whole numbers, a bare number of rule 4)
    const joinAt = (i: number) => joiner(text.slice(runs[i].e, runs[i + 1].s).trim(), text.slice(i > 0 ? runs[i - 1].e : 0, runs[i].s));
    const orient = (j: Joiner, x: Q, y: Q): [Q, Q, Op] => (j === "less" ? [y, x, "-"] : j === "into" ? [y, x, "÷"] : [x, y, j]);
    // the question restated, or its operands rewritten (9/12 + 2/12 for 3/4 + 1/6), or a division flipped: a step, not the answer
    const isRestated = (p: Q, o: Op, q: Q) => pr.restated.some((s) => s.o === o && ((eq(p, s.p) && eq(q, s.q)) || (s.both && eq(p, s.q) && eq(q, s.p))));
    for (let i = 0; i + 1 < runs.length; i++) {
      const j = joinAt(i);
      if (!j) continue;
      for (const x of runs[i].values) for (const y of runs[i + 1].values) {
        const [p, q, o] = orient(j, x, y);
        const v = apply(o, p, q);
        if (!v || isRestated(p, o, q)) continue;
        if (eq(qabs(v), T) || (p.d === ONE && q.d === ONE && v.d === ONE && pr.bare.has(String(babs(v.n))))) return true;
      }
      // three numbers chained by × and ÷: the whole working of a missing number or a fraction of an amount in one line
      // ("40 ÷ 5 × 3"), unless the chain is the question in other words ("3 lots of a fifth of 40" is 3/5 of 40)
      const k = i + 2 < runs.length ? joinAt(i + 1) : null;
      if ((j === "×" || j === "÷") && (k === "×" || k === "÷")) {
        for (const x of runs[i].values) for (const y of runs[i + 1].values) for (const z of runs[i + 2].values) {
          const xy = apply(j, x, y), yz = apply(k, y, z), v = xy && apply(k, xy, z);
          if (!v || !eq(qabs(v), T)) continue;
          const words = (xy && isRestated(qabs(xy), k, z)) || (j === k && j === "×" && yz && isRestated(x, j, qabs(yz)));
          if (!words) return true;
        }
      }
    }
    return false;
  } catch {
    return true;
  }
}

// ------------------------------------------------------------------ the generator: add and subtract fractions

/** mulberry32: a small seeded generator, the same numbers for the same seed on every machine. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gcdN = (a: number, b: number): number => (b === 0 ? a : gcdN(b, a % b));

/** Denominator pairs, 2..12: tier 1 the same or one a multiple of the other; tier 2 unlike, neither dividing the other. */
const PAIRS: Record<1 | 2, [number, number][]> = (() => {
  const one: [number, number][] = [], two: [number, number][] = [];
  for (let b = 2; b <= 12; b++) for (let d = 2; d <= 12; d++) (b % d === 0 || d % b === 0 ? one : two).push([b, d]);
  return { 1: one, 2: two };
})();
/** The tops that make a proper fraction in lowest terms over b. */
const tops = (b: number) => Array.from({ length: b - 1 }, (_, k) => k + 1).filter((a) => gcdN(a, b) === 1);
const MAX_TRIES = 64;

/**
 * One "add and subtract fractions" item, from a seed and a tier that code computed (never a model's number):
 *   - tier 1: denominators 2..12, the same or one a multiple of the other (1/4 + 1/2, 3/5 + 4/5);
 *   - tier 2: unlike denominators 2..12, neither a multiple of the other (3/4 + 1/6, 5/6 - 3/8).
 * Both operands proper and in lowest terms; a subtraction is ordered so its value is above zero; a value that is a
 * whole number is drawn again (a fractions item whose answer is 1 has no fraction to write), and so is a value equal
 * to an operand (5/6 - 5/12 = 5/12: the question would print its own answer). Pure and seeded: the
 * same seed and tier give the same spec. Null for a seed that is not a whole number from 0 to 2^32 - 1, or another tier.
 */
export function gen(seed: unknown, tier: unknown): SchoolSpec | null {
  if (typeof seed !== "number" || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) return null;
  if (tier !== 1 && tier !== 2) return null;
  const rnd = prng(seed * 2 + tier);
  // a function, not a generic arrow: a suite that transpiles with JSX on would read `<T>(` as a tag (desk-pairing-test)
  function pick<T>(xs: T[]): T { return xs[Math.floor(rnd() * xs.length)]; }
  for (let k = 0; k < MAX_TRIES; k++) {
    let [b, d] = pick(PAIRS[tier]);
    let a = pick(tops(b)), c = pick(tops(d));
    const minus = rnd() < 0.5;
    if (minus) {
      if (a * d === c * b) continue;
      if (a * d < c * b) { [a, b, c, d] = [c, d, a, b]; }
    }
    const spec: SchoolSpec = { shape: "compute", expr: `${a}/${b} ${minus ? "-" : "+"} ${c}/${d}` };
    const r = read(spec);
    if (!r.ok || r.truth.d === ONE) continue;
    // an answer equal to an operand (5/6 - 5/12 = 5/12) is printed by the question itself
    if (eq(r.truth, mk(BigInt(a), BigInt(b))!) || eq(r.truth, mk(BigInt(c), BigInt(d))!)) continue;
    return spec;
  }
  return tier === 1 ? { shape: "compute", expr: "1/4 + 1/2" } : { shape: "compute", expr: "3/4 + 1/6" };
}

// ------------------------------------------------------------------ the W7 generators: three more fractions units

/** A seed and a tier a generator takes, or null: a whole number 0..2^32 - 1, and tier 1 or 2. */
const seeded = (seed: unknown, tier: unknown, salt: number): (() => number) | null =>
  typeof seed === "number" && Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff && (tier === 1 || tier === 2) ? prng(((seed * 2 + tier) ^ salt) >>> 0) : null;
/** Proper fractions in lowest terms a/b, bottoms lo..hi, tops at least `minTop`. */
function properLowest(lo: number, hi: number, minTop = 1): [number, number][] {
  const out: [number, number][] = [];
  for (let b = lo; b <= hi; b++) for (let a = minTop; a < b; a++) if (gcdN(a, b) === 1) out.push([a, b]);
  return out;
}
/**
 * A generated spec a set may use: well formed, and its printed question does not give its answer away - no number
 * in it is the answer, and leaksSchool passes the whole question (the W5a defect: an item that printed its own answer).
 */
function fair(spec: SchoolSpec): boolean {
  const r = read(spec), q = question(spec);
  if (!r.ok || !q) return false;
  const nums = (q.plain.match(/\d+/g) ?? []).map((x) => BigInt(x));
  if (r.truth.d === ONE && nums.includes(qabs(r.truth).n)) return false;
  return !leaksSchool(spec, q.plain);
}

/**
 * One "Equivalent fractions" item, from a seed and a tier that code computed:
 *   - tier 1: fill in the missing number when the fraction is SCALED UP by a whole number 2..6 - the top missing
 *     (3/4 = ?/12) or the bottom (3/4 = 9/?), from a proper fraction in lowest terms with a bottom 2..10 and a top of
 *     at least 2 (so the answer is never the scale factor itself), the new numbers at most 60;
 *   - tier 2: going down to fewer, bigger parts, which needs a common factor: by the seed, two in three are "write it
 *     in its simplest form" (15/20; the answer p/q has a bottom 2..12, the fraction is p/q scaled by 2..12, bottom at
 *     most 100) and one in three a missing number when the fraction is SCALED DOWN (12/16 = ?/4, 12/16 = 3/?).
 * A simplify item is drawn again when the answer's top (above 1) or bottom divides the scale factor, since then a
 * common factor a hint may name ("divide both by 3") is a number of the answer; a missing number is drawn again when it
 * is the scale factor or a number the question prints. Pure and seeded; null for a bad seed or tier.
 */
export function genEquivalent(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed0e01);
  if (!rnd) return null;
  function pick<T>(xs: T[]): T { return xs[Math.floor(rnd!() * xs.length)]; }
  const simplifyTurn = tier === 2 && (seed as number) % 3 !== 0;
  for (let t = 0; t < MAX_TRIES; t++) {
    let spec: SchoolSpec, answer: number, factor: number;
    if (tier === 1) {
      const [a, b] = pick(properLowest(3, 10, 2)), k = 2 + Math.floor(rnd() * 5);
      if (rnd() < 0.5) { if (b * k > 60) continue; spec = { shape: "missing", expr: `${a}/${b} = ?/${b * k}` }; answer = a * k; }
      else { if (b * k > 60) continue; spec = { shape: "missing", expr: `${a}/${b} = ${a * k}/?` }; answer = b * k; }
      factor = k;
    } else if (simplifyTurn) {
      const [p, q] = pick(properLowest(2, 12)), k = 2 + Math.floor(rnd() * 11);
      if (q * k > 100 || (p > 1 && k % p === 0) || k % q === 0) continue;
      spec = { shape: "simplify", expr: `${p * k}/${q * k}` }; answer = -1; factor = k;
    } else {
      const [p, q] = pick(properLowest(3, 10, 2)), k = 2 + Math.floor(rnd() * 7);
      if (q * k > 100) continue;
      if (rnd() < 0.5) { spec = { shape: "missing", expr: `${p * k}/${q * k} = ?/${q}` }; answer = p; }
      else { spec = { shape: "missing", expr: `${p * k}/${q * k} = ${p}/?` }; answer = q; }
      factor = k;
    }
    if (answer === factor || !fair(spec)) continue;
    return spec;
  }
  return tier === 1 ? { shape: "missing", expr: "3/4 = ?/12" } : { shape: "simplify", expr: "15/20" };
}

/** The units a tier-2 fraction of an amount may carry: weights, lengths, capacities, a time and three currencies. */
const OF_UNITS: readonly Unit[] = ["kg", "g", "km", "m", "cm", "l", "ml", "min", "€", "£", "$"];

/**
 * One "A fraction of an amount" item, from a seed and a tier that code computed:
 *   - tier 1: a proper fraction a/b in lowest terms with a top of at least 2 and a bottom 3..10, of an amount that is
 *     b times 2..10 (so a single part is a times-table fact), no unit: "Find 3/5 of 40.";
 *   - tier 2: a bottom 3..12, an amount b times 3..25 (up to 300), with a unit from OF_UNITS: "Find 5/12 of 180 kg.".
 * The answer is always a whole number. A top of 1 is never drawn (the first step, one part, would be the answer), nor
 * an answer that is a number the question prints. Pure and seeded; null for a bad seed or tier.
 */
export function genOfAmount(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed0f02);
  if (!rnd) return null;
  function pick<T>(xs: T[]): T { return xs[Math.floor(rnd!() * xs.length)]; }
  for (let t = 0; t < MAX_TRIES; t++) {
    const [a, b] = pick(properLowest(3, tier === 1 ? 10 : 12, 2));
    const m = tier === 1 ? 2 + Math.floor(rnd() * 9) : 3 + Math.floor(rnd() * 23);
    const spec: SchoolSpec = tier === 1 ? { shape: "fraction-of", expr: `${a}/${b} of ${b * m}` } : { shape: "fraction-of", expr: `${a}/${b} of ${b * m}`, unit: pick([...OF_UNITS]) };
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "fraction-of", expr: "3/5 of 40" } : { shape: "fraction-of", expr: "3/4 of 60", unit: "kg" };
}

/**
 * One "Multiply and divide fractions" item, from a seed and a tier that code computed:
 *   - tier 1: MULTIPLY two proper fractions in lowest terms with bottoms 2..10 (2/3 × 3/4);
 *   - tier 2: DIVIDE one by another, the same range (3/4 ÷ 2/5): the fraction you divide by is turned over first.
 * A value that is a whole number is drawn again, and so is one whose value or fractional part equals an operand or
 * the flipped divisor (the question would print its own answer). Pure and seeded; null for a bad seed or tier.
 */
export function genMulDiv(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed1003);
  if (!rnd) return null;
  function pick<T>(xs: T[]): T { return xs[Math.floor(rnd!() * xs.length)]; }
  const fracs = properLowest(2, 10);
  for (let t = 0; t < MAX_TRIES; t++) {
    const [a, b] = pick(fracs), [c, d] = pick(fracs);
    const spec: SchoolSpec = { shape: "compute", expr: `${a}/${b} ${tier === 1 ? "×" : "÷"} ${c}/${d}` };
    const r = read(spec);
    if (!r.ok || r.truth.d === ONE) continue;
    const T = r.truth, part = T.n > T.d ? mk(T.n % T.d, T.d)! : T;
    const seen = [mk(BigInt(a), BigInt(b))!, mk(BigInt(c), BigInt(d))!, mk(BigInt(d), BigInt(c))!];
    if (seen.some((x) => eq(x, T) || eq(x, part))) continue;
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "compute", expr: "2/3 × 3/4" } : { shape: "compute", expr: "3/4 ÷ 2/5" };
}

// ------------------------------------------------------------------ the W7 batch 2 generators: decimals and percent

/** A whole number of `p`-th places written as a decimal: (435, 2) is "4.35", (5, 2) "0.05", (28, 1) "2.8". */
function decimalText(units: number, p: number): string {
  if (p === 0) return String(units);
  const s = String(units).padStart(p + 1, "0");
  return `${s.slice(0, -p)}.${s.slice(-p)}`;
}
/** The money signs a decimals or percent question prints before an amount. */
const MONEY: readonly Unit[] = ["€", "£"];

/**
 * One "Add, subtract and multiply decimals" item, from a seed and a tier that code computed:
 *   - tier 1: ADD or SUBTRACT two decimals, in three of four items written to different numbers of places (4.35 + 2.8,
 *     where the points must be lined up), 0.01 to 99.99, the larger first for a subtraction; one seed in three is money,
 *     two amounts in euros or pounds to the penny (€4.35 + €2.80);
 *   - tier 2: MULTIPLY: a decimal of one or two places (1.2..19.9 or 0.12..4.99) by a decimal of one place (0.2..0.9 or
 *     1.1..4.9: 3.6 × 0.4, 2.45 × 1.3), or, one seed in three, a money amount to 24.99 by a whole count 3..9 (£3.45 × 4).
 * A decimal that is not money never ends in 0; a value that is a whole number, or equal to either number, is drawn
 * again, and so is any item whose printed question gives its answer away. Pure and seeded; null for a bad seed or tier.
 */
export function genDecimal(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed1104);
  if (!rnd) return null;
  function pick<T>(xs: readonly T[]): T { return xs[Math.floor(rnd!() * xs.length)]; }
  const int = (lo: number, hi: number) => lo + Math.floor(rnd!() * (hi - lo + 1));
  /** lo..hi units, never ending in 0 (a non-money decimal) or never a whole amount (money: 4.00 becomes 4.05). */
  const units = (lo: number, hi: number, money: boolean) => { const u = int(lo, hi); return money ? (u % 100 === 0 ? u + 5 : u) : u % 10 === 0 ? u + 1 : u; };
  const money = (seed as number) % 3 === 0;
  for (let t = 0; t < MAX_TRIES; t++) {
    let spec: SchoolSpec;
    if (tier === 1) {
      const minus = rnd() < 0.5;
      let a: string, b: string;
      if (money) { a = decimalText(units(105, 4999, true), 2); b = decimalText(units(55, 2999, true), 2); }
      else {
        const pa = rnd() < 0.5 ? 1 : 2, pb = rnd() < 0.75 ? 3 - pa : pa;
        a = decimalText(units(pa === 1 ? 11 : 101, pa === 1 ? 999 : 9999, false), pa);
        b = decimalText(units(1, pb === 1 ? 199 : 1999, false), pb);
      }
      if (minus && Number(a) < Number(b)) [a, b] = [b, a];
      spec = { shape: "compute", expr: `${a} ${minus ? "-" : "+"} ${b}`, ...(money ? { unit: pick(MONEY) } : {}) };
    } else if (money) {
      spec = { shape: "compute", expr: `${decimalText(units(105, 2499, true), 2)} × ${int(3, 9)}`, unit: pick(MONEY) };
    } else {
      // sizes a column multiplication by hand takes: 1.2..19.9 or 0.12..4.99, by 0.2..0.9 or 1.1..4.9
      const pa = rnd() < 0.5 ? 1 : 2;
      const a = decimalText(units(12, pa === 1 ? 199 : 499, false), pa), b = decimalText(rnd() < 0.5 ? int(2, 9) : units(11, 49, false), 1);
      spec = { shape: "compute", expr: `${a} × ${b}` };
    }
    const r = read(spec);
    if (!r.ok || r.truth.d === ONE) continue;
    const dp = decimalPair(r.node);
    if (!dp || eq(r.truth, dp.a) || eq(r.truth, dp.b)) continue;
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "compute", expr: "4.35 + 2.8" } : { shape: "compute", expr: "3.6 × 0.4" };
}

/** A terminating value as a worksheet writes its decimal, no trailing zero ("0.375" for 3/8), or null past `max` places. */
function decimalOf(v: Q, max: number): string | null {
  const k = placesNeeded(v);
  return k > max ? null : decimalText(Number(mul(v, qi(pow10(k))).n), k);
}
/** A value as a percent with at most one place ("37.5%" for 3/8), or null. */
function percentOf(v: Q): string | null {
  const s = decimalOf(mul(v, qi(BigInt(100))), 1);
  return s === null ? null : `${s}%`;
}
/** The six conversions a question may ask: from the form given to the form asked. */
const CONVERSIONS: readonly [NumberFormAsked, NumberFormAsked][] = [["fraction", "decimal"], ["fraction", "percent"], ["decimal", "fraction"], ["decimal", "percent"], ["percent", "decimal"], ["percent", "fraction"]];

/**
 * One "Fractions, decimals and percent" item, from a seed and a tier that code computed; the conversion (one of six:
 * fraction to decimal or percent, decimal to fraction or percent, percent to decimal or fraction) by the seed:
 *   - tier 1: a proper fraction whose bottom goes into a hundred (2, 4, 5, 10, 20, 25, 50, 100): a decimal to at most
 *     two places, a whole percent - one step from hundredths (3/4, 0.35, 7/20 = 35%, 60%);
 *   - tier 2: eighths, sixteenths, fortieths and eightieths (3/8 = 0.375 = 37.5%, 1/16 = 0.0625), or, three in ten, a
 *     value between 1 and 3 over 2, 4, 5, 8, 10 or 20 (5/4 = 1.25 = 125%). A decimal given has at most three places and a
 *     percent given at most one (none over a hundred: 125%, never 112.5%), else the item is drawn again.
 * Terminating only (never 1/3), never a whole number, a fraction always in lowest terms. Pure and seeded; null for a bad
 * seed or tier.
 */
export function genConvert(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed1205);
  if (!rnd) return null;
  function pick<T>(xs: readonly T[]): T { return xs[Math.floor(rnd!() * xs.length)]; }
  for (let t = 0; t < MAX_TRIES; t++) {
    const [from, to] = pick(CONVERSIONS);
    let a: number, b: number;
    if (tier === 1) { b = pick([2, 4, 5, 10, 20, 25, 50, 100]); a = pick(tops(b)); }
    else if (rnd() < 0.7) { b = pick([8, 16, 40, 80]); a = pick(tops(b)); }
    else { b = pick([2, 4, 5, 8, 10, 20]); a = b * (rnd() < 0.7 ? 1 : 2) + pick(tops(b)); }
    const v = mk(BigInt(a), BigInt(b))!;
    const expr = from === "fraction" ? `${a}/${b}` : from === "decimal" ? decimalOf(v, 3) : percentOf(v);
    // a percent over a hundred is given whole (125%, never 112.5%): the row stays one printed line, and the item a step
    if (!expr || (from === "percent" && a > b && expr.includes("."))) continue;
    const spec: SchoolSpec = { shape: "convert", expr, to };
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "convert", expr: "3/4", to: "decimal" } : { shape: "convert", expr: "3/8", to: "percent" };
}

/**
 * The units whose practice sets code writes, by syllabus topic id, each with its generator (Family W5b: add and
 * subtract fractions; W7 batch 1: equivalent fractions, a fraction of an amount, multiply and divide fractions). A
 * topic not here is written as it always was.
 */
export const SCHOOL_GENERATORS: Readonly<Record<string, (seed: number, tier: 1 | 2) => SchoolSpec | null>> = {
  "frac-equivalent": (seed, tier) => genEquivalent(seed, tier),
  "frac-of-amount": (seed, tier) => genOfAmount(seed, tier),
  "frac-add-sub": (seed, tier) => gen(seed, tier),
  "frac-mul-div": (seed, tier) => genMulDiv(seed, tier),
  "dec-arith": (seed, tier) => genDecimal(seed, tier),
  "dec-convert": (seed, tier) => genConvert(seed, tier),
};
/** The generator for a topic id, or null: an own key only, so 'constructor' is not a unit. */
export const generatorFor = (topicId: unknown) =>
  typeof topicId === "string" && Object.prototype.hasOwnProperty.call(SCHOOL_GENERATORS, topicId) ? SCHOOL_GENERATORS[topicId] : null;

/** Is this a school spec by its shape (never a Calculus one: the two shape lists share no name)? It says nothing of whether it is well formed. */
export const isSchoolSpec = (spec: unknown): spec is SchoolSpec =>
  !!spec && typeof spec === "object" && (SCHOOL_SHAPES as readonly unknown[]).includes((spec as { shape?: unknown }).shape);

/** The slips each unit's items can show, by topic id: a closed list, in SCHOOL_SLIPS order, each detected by code (slipCandidates). */
export const SCHOOL_UNIT_SLIPS: Readonly<Record<string, readonly string[]>> = {
  "frac-equivalent": ["added-same", "one-part-only", "wrong-factor"],
  "frac-of-amount": ["of-upside-down", "of-one-part", "of-not-divided", "of-rest"],
  "frac-add-sub": ["tops-and-bottoms", "top-not-scaled", "tops-one-bottom", "wrong-direction"],
  "frac-mul-div": ["added-not-multiplied", "kept-second", "flipped-first", "bottoms-added"],
  "dec-arith": ["dec-lined-up", "dec-point-product", "dec-point-dropped"],
  "dec-convert": ["conv-flipped", "conv-not-scaled", "conv-wrong-way", "conv-ten-times", "conv-top-dot-bottom"],
};

/** The system the desk reads a learner's numbers by when their profile names none (tv/profileRows DEFAULT_SYSTEM is the same, tested). */
export const DEFAULT_SCHOOL_SYSTEM: SchoolSystem = "uk";
/** The school system of the learner at the desk, from their profile; the desk's default (UK) when nobody, no profile or no system. */
export function learnerSystem(s: { profiles?: { id: string; system?: unknown }[]; learner?: { id: string } | null }): SchoolSystem {
  const id = s.learner?.id;
  const sys = id ? s.profiles?.find((p) => p.id === id)?.system : undefined;
  return isSystem(sys) ? sys : DEFAULT_SCHOOL_SYSTEM;
}

// ------------------------------------------------------------------ reading a task back into a spec, for the hint's leak check

/** Longest task text the reader tries: one line on a worksheet with its instruction. */
const MAX_TASK = 200;
/** One fraction as a worksheet prints it: a top and a bottom of up to three digits, no leading zero. */
const FRAC_SRC = String.raw`([1-9]\d{0,2})\s*\/\s*([1-9]\d{0,2})`;
const VERB_SRC = String.raw`(?:work out|calculate|evaluate|compute|find|what is|what's)`;
/** The phrasings of two fractions combined, each giving the two fractions (m[1..2], m[4..5]) and the operation; `swap` puts the second first. */
const TASKS: { re: RegExp; op: (m: RegExpExecArray) => Op; swap?: boolean }[] = [
  // '3/4 + 1/6', 'Work out 3/4 - 1/6', 'Calculate: 2/3 + 1/5', 'What is 1/2 + 1/4', '3/4 plus 1/6'
  { re: new RegExp(String.raw`^(?:${VERB_SRC}\s*:?\s*)?${FRAC_SRC}\s*(\+|-|plus|minus)\s*${FRAC_SRC}$`, "i"), op: (m) => (/^(?:-|minus)$/i.test(m[3]) ? "-" : "+") },
  // 'Add 3/4 and 1/6', 'Add 1/6 to 3/4', 'Find the sum of 2/3 and 1/5'
  { re: new RegExp(String.raw`^(?:add|find the sum of|the sum of)\s+${FRAC_SRC}\s+(and|to)\s+${FRAC_SRC}$`, "i"), op: () => "+" },
  // 'Subtract 1/6 from 3/4', 'Take 1/4 away from 5/6', 'Take 1/4 from 5/6': the second take away the first
  { re: new RegExp(String.raw`^(?:subtract|take)\s+${FRAC_SRC}\s+(away from|from)\s+${FRAC_SRC}$`, "i"), op: () => "-", swap: true },
  // W7: '2/3 × 3/4', 'Work out 2/3 x 3/4', '2/3 * 3/4', '2/3 times 3/4', '3/4 ÷ 1/2', '3/4 divided by 1/2' (never ':', a ratio too)
  { re: new RegExp(String.raw`^(?:${VERB_SRC}\s*:?\s*)?${FRAC_SRC}\s*(×|x|\*|times|÷|divided by)\s*${FRAC_SRC}$`, "i"), op: (m) => (/^(?:÷|divided by)$/i.test(m[3]) ? "÷" : "×") },
  // 'Multiply 2/3 by 3/4', 'Multiply 2/3 and 3/4', 'Find the product of 2/3 and 3/4'
  { re: new RegExp(String.raw`^(?:multiply|find the product of|the product of)\s+${FRAC_SRC}\s+(by|and)\s+${FRAC_SRC}$`, "i"), op: () => "×" },
  // 'Divide 3/4 by 1/2'
  { re: new RegExp(String.raw`^divide\s+${FRAC_SRC}\s+(by)\s+${FRAC_SRC}$`, "i"), op: () => "÷" },
];

/** Two fractions added, subtracted, multiplied or divided, with an optional instruction after them; or null. */
function readCombined(t0: string): SchoolSpec | null {
  let t = t0;
  let form: ComputeSpec["form"];
  const tail = /[.?!]?\s*(?:(give your answer in its (?:simplest form|lowest terms)|simplify your answer)|(give your answer as a decimal))\.?$/i.exec(t);
  if (tail) { form = tail[1] ? "simplest" : "decimal"; t = t.slice(0, tail.index).trim(); }
  t = t.replace(/\s*(?:=\s*(?:\?|_+|\.{3}|…)?)?\s*[.?!]?$/, "").trim();
  for (const { re, op, swap } of TASKS) {
    const m = re.exec(t);
    if (!m) continue;
    const [p, q] = swap ? [[m[4], m[5]], [m[1], m[2]]] : [[m[1], m[2]], [m[4], m[5]]];
    const spec: SchoolSpec = { shape: "compute", expr: `${p[0]}/${p[1]} ${op(m)} ${q[0]}/${q[1]}`, ...(form ? { form } : {}) };
    const r = read(spec);
    if (!r.ok) return null;
    // a bottom of 1 is a whole number written as a fraction: not these units' task
    if (r.node.k !== "op" || r.node.a.k !== "frac" || r.node.b.k !== "frac") return null;
    return spec;
  }
  return null;
}

/** Words that are maths, not a count noun after an amount ('40 sweets' reads; '40 percent', '40 and 2' do not). */
const NOT_A_NOUN = /^(?:percent|per|cent|pounds?|pence|of|and|or|plus|minus|times|divided|over|squared|cubed|more|less|then|point|halves|half|thirds?|quarters?|fifths?|sixths?|sevenths?|eighths?|ninths?|tenths?|twelfths?|hundredths?|lots|groups|parts?|x)$/i;

/** An amount after 'of': a whole number, with a currency sign before it, a unit after it or one count noun after it; or null. */
function amountOf(s: string): { N: string; unit?: Unit } | null {
  const cur = /^([$£€])\s?([1-9]\d{0,3})$/.exec(s);
  if (cur) return { N: cur[2], unit: cur[1] as Unit };
  const m = /^([1-9]\d{0,3})(?:\s?(\S.*))?$/.exec(s);
  if (!m) return null;
  if (m[2] === undefined) return { N: m[1] };
  const rest = m[2].trim(), low = rest.toLowerCase();
  const u = UNIT_SPELLINGS.find(([sp]) => sp === low);
  if (u) return { N: m[1], unit: u[1] };
  // a count noun only after a space: '40 sweets', never '40sweets'
  if (/^\s/.test(s.slice(m[1].length)) && /^[a-z]{3,15}$/i.test(rest) && !NOT_A_NOUN.test(rest)) return { N: m[1] };
  return null;
}

/** 'Find 3/5 of 40 kg', '3/5 of 40', 'What is 3/4 of £60?', '3/5 x 40', '40 × 3/5' as a fraction of an amount; or null. */
function readOf(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.?!]$/, "").trim().replace(new RegExp(String.raw`^${VERB_SRC}\s*:?\s+`, "i"), "");
  let a: string, b: string, got: { N: string; unit?: Unit } | null;
  let m = new RegExp(String.raw`^${FRAC_SRC}\s+of\s+(.+)$`, "i").exec(t);
  if (m) { [a, b] = [m[1], m[2]]; got = amountOf(m[3].trim()); }
  else if ((m = new RegExp(String.raw`^${FRAC_SRC}\s*(?:×|x|\*|times)\s*([1-9]\d{0,3})$`, "i").exec(t))) { [a, b] = [m[1], m[2]]; got = { N: m[3] }; }
  else if ((m = new RegExp(String.raw`^([1-9]\d{0,3})\s*(?:×|x|\*|times)\s*${FRAC_SRC}$`, "i").exec(t))) { [a, b] = [m[2], m[3]]; got = { N: m[1] }; }
  else return null;
  if (!got) return null;
  const spec: SchoolSpec = { shape: "fraction-of", expr: `${a}/${b} of ${got.N}`, ...(got.unit ? { unit: got.unit } : {}) };
  return read(spec).ok ? spec : null;
}

/** A missing number's placeholder as a worksheet prints it: '?', a box, or a run of underscores. */
const GAP_SRC = String.raw`(\?|□|☐|▢|_+|[1-9]\d{0,2})`;
const isGap = (x: string) => /^(?:\?|□|☐|▢|_+)$/.test(x);

/** 'Fill in the missing number: 3/4 = ?/12', '3/4 = □/12', '3/4 = 9/?', 'Write 3/4 with a denominator of 12'; or null. */
function readMissing(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.!]$/, "").trim()
    .replace(/^(?:fill in the missing number|find the missing number|write the missing number|copy and complete|complete)\s*[:.]?\s*/i, "");
  let m = new RegExp(String.raw`^${FRAC_SRC}\s*=\s*${GAP_SRC}\s*\/\s*${GAP_SRC}$`).exec(t);
  let spec: SchoolSpec | null = null;
  if (m) {
    const [top, bottom] = [m[3], m[4]];
    if (isGap(top) === isGap(bottom)) return null;
    spec = { shape: "missing", expr: `${m[1]}/${m[2]} = ${isGap(top) ? "?" : top}/${isGap(bottom) ? "?" : bottom}` };
  } else if ((m = new RegExp(String.raw`^write\s+${FRAC_SRC}\s+(?:as\s+(?:a|an equivalent)\s+fraction\s+)?with\s+(?:a\s+)?(denominator|numerator)\s+(?:of\s+)?([1-9]\d{0,2})$`, "i").exec(t))) {
    spec = /^denominator$/i.test(m[3]) ? { shape: "missing", expr: `${m[1]}/${m[2]} = ?/${m[4]}` } : { shape: "missing", expr: `${m[1]}/${m[2]} = ${m[4]}/?` };
  }
  return spec && read(spec).ok ? spec : null;
}

/** 'Simplify 18/24', 'Simplify 18/24 fully', 'Write 18/24 in its simplest form', 'Reduce 18/24 to lowest terms', 'Cancel 18/24 down'; or null. */
function readSimplify(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.?!]$/, "").trim();
  const LOW = String.raw`(?:its\s+)?(?:simplest form|lowest terms)`;
  const res = [
    new RegExp(String.raw`^(?:simplify|reduce)\s*:?\s*${FRAC_SRC}(?:\s+(?:fully|completely|as far as possible|to\s+${LOW}))?$`, "i"),
    new RegExp(String.raw`^(?:write|express|give|put)\s+${FRAC_SRC}\s+in\s+${LOW}$`, "i"),
    new RegExp(String.raw`^cancel\s+${FRAC_SRC}(?:\s+down)?(?:\s+to\s+${LOW})?$`, "i"),
  ];
  for (const re of res) {
    const m = re.exec(t);
    if (!m) continue;
    const spec: SchoolSpec = { shape: "simplify", expr: `${m[1]}/${m[2]}` };
    return read(spec).ok ? spec : null;
  }
  return null;
}

/** A decimal or whole number as a worksheet prints it, an optional € or £ before it: 4.35, 0.4, 12, €2.80 (m[sign], m[number]). */
const MONEY_DEC_SRC = String.raw`([€£])?\s?((?:0|[1-9]\d{0,3})(?:\.\d{1,3})?)`;
/** The phrasings of two numbers added, subtracted or multiplied, each giving sign and number (m[1..2], m[4..5]) and the operation word m[3]. */
const DEC_TASKS: { re: RegExp; op: (w: string) => "+" | "-" | "×"; swap?: boolean }[] = [
  // '4.35 + 2.8', 'Work out 3.6 × 0.4', 'Calculate €4.35 + €2.80', '3.6 x 0.4', '4.35 plus 2.8'
  { re: new RegExp(String.raw`^(?:${VERB_SRC}\s*:?\s*)?${MONEY_DEC_SRC}\s*(\+|-|plus|minus|×|x|\*|times)\s*${MONEY_DEC_SRC}$`, "i"), op: (w) => (/^(?:\+|plus)$/i.test(w) ? "+" : /^(?:-|minus)$/i.test(w) ? "-" : "×") },
  // 'Add 4.35 and 2.8', 'Add 2.8 to 4.35', 'Find the sum of 4.35 and 2.8'
  { re: new RegExp(String.raw`^(?:add|find the sum of|the sum of)\s+${MONEY_DEC_SRC}\s+(and|to)\s+${MONEY_DEC_SRC}$`, "i"), op: () => "+" },
  // 'Subtract 2.25 from 7.5', 'Take 2.25 (away) from 7.5': the second take away the first
  { re: new RegExp(String.raw`^(?:subtract|take)\s+${MONEY_DEC_SRC}\s+(away from|from)\s+${MONEY_DEC_SRC}$`, "i"), op: () => "-", swap: true },
  // 'Multiply 3.6 by 0.4', 'Find the product of 3.6 and 0.4'
  { re: new RegExp(String.raw`^(?:multiply|find the product of|the product of)\s+${MONEY_DEC_SRC}\s+(by|and)\s+${MONEY_DEC_SRC}$`, "i"), op: () => "×" },
];

/**
 * Two numbers, at least one a decimal, added, subtracted or multiplied (W7 batch 2, "Add, subtract and multiply decimals");
 * or null. Money: the same € or £ before both amounts of a sum or difference, or before the first of an amount times a
 * whole count ('£3.45 × 4'); any other placing of a sign is null.
 */
function readDecimal(t0: string): SchoolSpec | null {
  const t = t0.replace(/\s*(?:=\s*(?:\?|_+|\.{3}|…)?)?\s*[.?!]?$/, "").trim();
  for (const { re, op, swap } of DEC_TASKS) {
    const m = re.exec(t);
    if (!m) continue;
    let [sa, a, sb, b] = [m[1], m[2], m[4], m[5]];
    if (swap) [sa, a, sb, b] = [sb, b, sa, a];
    const o = op(m[3]);
    if (!a.includes(".") && !b.includes(".")) return null;
    if (o === "×" ? sb !== undefined || (sa !== undefined && b.includes(".")) : sa !== sb) return null;
    const spec: SchoolSpec = { shape: "compute", expr: `${a} ${o} ${b}`, ...(sa ? { unit: sa as Unit } : {}) };
    const r = read(spec);
    return r.ok && decimalPair(r.node) ? spec : null;
  }
  return null;
}

/** A number to convert as a worksheet prints it: a fraction '3/8', a decimal '0.35', a percent '35%', '35 %', '35 percent', '12.5 per cent'. */
const CONVERT_NUM = String.raw`([1-9]\d{0,2}\s*\/\s*[1-9]\d{0,2}|(?:0|[1-9]\d{0,2})\.\d{1,3}|(?:0|[1-9]\d{0,2})(?:\.\d)?\s?(?:%|percent|per cent))`;
const CONVERT_TO = String.raw`(?:a\s+|an\s+)?(simplified\s+fraction|decimal|fraction|percentage|percent)(\s+in\s+(?:its\s+)?(?:simplest form|lowest terms))?`;
const CONVERT_TASKS = [
  // 'Write 3/8 as a decimal', 'Convert 0.35 to a fraction', 'Change 35% into a decimal', 'Express 0.6 as a percentage'
  new RegExp(String.raw`^(?:write|express|give|convert|change|turn)\s+${CONVERT_NUM}\s+(?:as|to|into)\s+${CONVERT_TO}$`, "i"),
  // 'What is 0.35 as a fraction?'
  new RegExp(String.raw`^what\s+is\s+${CONVERT_NUM}\s+as\s+${CONVERT_TO}$`, "i"),
];

/**
 * A conversion between a fraction, a decimal and a percent (W7 batch 2, "Fractions, decimals and percent"), or null.
 * "a simplified fraction", or "in its simplest form" / "in lowest terms" only after "fraction" (both a fraction in lowest
 * terms, as a bare "a fraction" is too: the desk asks for the simplest); the spec must be one wellFormed takes (a
 * terminating value, a fraction in lowest terms, another form than the one given, never a whole number).
 */
function readConvert(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.?!]$/, "").trim();
  for (const re of CONVERT_TASKS) {
    const m = re.exec(t);
    if (!m) continue;
    const to: NumberFormAsked = /^percent/i.test(m[2]) ? "percent" : /fraction$/i.test(m[2]) ? "fraction" : "decimal";
    if (m[3] && (to !== "fraction" || /^simplified/i.test(m[2]))) return null;
    const expr = m[1].replace(/\s*\/\s*/, "/").replace(/\s?(?:%|percent|per cent)$/i, "%");
    const spec: SchoolSpec = { shape: "convert", expr, to };
    return read(spec).ok ? spec : null;
  }
  return null;
}

/**
 * A worksheet task of a school fractions unit, read back into the spec it asks, for the hint's leak check - or null.
 * Conservative: what it does not read with one meaning is null, and a null task gets no school leak check (the general
 * rule still runs), exactly as an unread Calculus task does. After an item label ('1.', '2)', '(b)', 'c)') it reads:
 *   - add and subtract: two fractions a/b joined by + or - (or 'plus', 'minus'), after an optional 'Work out',
 *     'Calculate', 'Evaluate', 'Compute', 'Find', 'What is' (a colon after it too); 'Add A and B', 'Add A to B', 'Find
 *     the sum of A and B'; 'Subtract B from A', 'Take B (away) from A' (A - B);
 *   - multiply and divide (W7): two fractions joined by ×, x, *, 'times', ÷ or 'divided by' after the same verbs;
 *     'Multiply A by B', 'Multiply A and B', 'Find the product of A and B', 'Divide A by B'. Never ':' (a ratio too);
 *   - for both: after it nothing, '=', '= ?', '= ___', a full stop or a question mark; then optionally one instruction
 *     the desk prints itself: 'Give your answer in its simplest form.' / 'in its lowest terms' / 'Simplify your
 *     answer.' (form simplest) or 'Give your answer as a decimal.' (form decimal);
 *   - a fraction of an amount (W7): 'Find 3/5 of 40', '3/5 of 40', 'What is 3/4 of £60?', with a unit from the reader's
 *     list ('40 kg', '60 minutes') or one count noun ('40 sweets'); '3/5 x 40' and '40 × 3/5' (a fraction times a whole);
 *   - a missing number (W7): 'a/b = ?/d' or 'a/b = c/?' with '?', a box or underscores for the gap, after an optional
 *     'Fill in the missing number:', 'Complete:', 'Copy and complete'; 'Write a/b with a denominator of d', 'Write a/b
 *     as a fraction with denominator d', 'Write a/b with a numerator of c';
 *   - simplify (W7): 'Simplify a/b' (optionally 'fully', 'completely', 'to its lowest terms'), 'Reduce a/b (to lowest
 *     terms)', 'Write / Express a/b in its simplest form / lowest terms', 'Cancel a/b (down)';
 *   - decimals (W7 batch 2): two numbers, at least one a decimal with a point (up to three places), joined by +, -, ×, x,
 *     *, 'plus', 'minus', 'times' after the same verbs, or 'Add A and B', 'Add B to A', 'Subtract B from A', 'Take B
 *     (away) from A', 'Multiply A by B', 'Find the product of A and B', 'Find the sum of A and B'; money with the same €
 *     or £ before both amounts of a sum or a difference, or before the amount of an amount times a whole count. Never a
 *     division, a decimal comma (a list too), a sign on one amount only or on a count, or two currencies.
 * Null for: whole numbers or mixed numbers as operands (a whole amount after 'of' excepted), a decimal beside a fraction, three or more
 * terms, any letter in the maths (an x), brackets, number words, an answer after '=', a bottom of 1 or 0, a leading
 * zero, 'the difference between' (its order is not said), a fraction of a fraction, a decimal or a thousands-separated
 * amount, two gaps or none, any other word, and a spec wellFormed refuses (a subtraction below zero, a simplify of a
 * fraction already in lowest terms or not proper, a missing number that is not whole). The printed question of every
 * practice item (`question`) reads back to its own spec. Pure; never throws.
 */
export function specFromQuestion(text: unknown): SchoolSpec | null {
  if (typeof text !== "string" || !text.trim() || text.length > MAX_TASK) return null;
  try {
    let t = normalise(text);
    t = t.replace(/^(?:\d{1,2}[.)]|\(\d{1,2}\)|[a-h]\)|\([a-h]\))\s+/i, "");
    return readMissing(t) ?? readSimplify(t) ?? readOf(t) ?? readCombined(t) ?? readDecimal(t) ?? readConvert(t);
  } catch {
    return null;
  }
}

/**
 * The unit a school spec belongs to, by topic id, or null: a sum or difference of two fractions is add and subtract
 * fractions, a product or quotient of two fractions multiply and divide fractions (W7), a fraction of an amount its own
 * unit, a missing number or a simplify equivalent fractions; two numbers with a decimal among them added, subtracted or
 * multiplied the decimals unit (W7 batch 2).
 */
export function unitOf(spec: unknown): string | null {
  try {
    const r = read(spec);
    if (!r.ok) return null;
    if (r.kind.k === "of") return "frac-of-amount";
    if (r.kind.k === "missing" || r.kind.k === "simplify") return "frac-equivalent";
    if (r.kind.k === "convert") return "dec-convert";
    const n = r.node;
    if (decimalPair(n)) return "dec-arith";
    if (n.k !== "op" || n.a.k !== "frac" || n.b.k !== "frac") return null;
    return n.op === "+" || n.op === "-" ? "frac-add-sub" : "frac-mul-div";
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ the line when a hint gave the answer away twice

/**
 * The line the TV shows and speaks when the model's hint on a school item gave the answer away twice: written here,
 * never by a model, one per unit. Each names the unit's method and carries no digit and no number word (leaksSchool
 * reads words as numbers), so nothing on it can be the answer.
 */
export const SCHOOL_WITHHELD = {
  "frac-equivalent": "Find what the bottom was multiplied or divided by to make the new bottom, and do exactly the same to the top. To simplify, divide the top and the bottom by the biggest number that goes into both. The answer is yours to work out.",
  "frac-of-amount": "Divide the amount by the bottom number to find the size of a single part, then multiply by the top number to take that many parts. The answer is yours to work out.",
  "frac-add-sub": "Make the bottoms the same first: find a number both bottoms go into and rewrite each fraction over it. Then combine only the tops. The answer is yours to work out.",
  "frac-mul-div": "To multiply, multiply the tops together and the bottoms together. To divide, turn the fraction you divide by upside down and multiply instead. Simplify at the end. The answer is yours to work out.",
  "dec-convert": "A fraction is its top divided by its bottom, so dividing gives the decimal. A percentage counts hundredths, so a decimal is written as a percentage by finding how many hundredths it makes, and a percentage as a decimal the other way. To make a fraction, write the decimal as tenths, hundredths or thousandths and simplify. The answer is yours to work out.",
  "dec-arith": "To add or take away, write the numbers with their decimal points one under the other, filling empty places with zeros. To multiply, multiply as if there were no points, then give the answer as many digits after its point as the question's numbers have between them. The answer is yours to work out.",
  any: "Go back to the last step you are sure of and take the next. The answer stays yours to find.",
} as const;
/** The withheld line for a school spec, chosen by its unit; the general line for any other. */
export function withheldSchool(spec: unknown): string {
  const u = unitOf(spec);
  return u && Object.prototype.hasOwnProperty.call(SCHOOL_WITHHELD, u) ? SCHOOL_WITHHELD[u as keyof typeof SCHOOL_WITHHELD] : SCHOOL_WITHHELD.any;
}
