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
 * other form is unsure, never wrong, and whose leak check knows which written forms of the value give it away); a percent
 * of an amount (`percent-of`, "Find 35% of 80.", an optional unit; an amount written as a percentage is unsure); percent
 * increase and decrease (`percent-change`, "Increase 60 by 15%.", the change applied to the whole, never reversed). W7
 * batch 3 adds the last four units, each its own shape with no new store key (`expr` and `unit` carry them): ratio and
 * sharing (`ratio`: "Write 12:18 in its simplest form.", "Share 60 in the ratio 2:3.", "Fill in the missing number: 2:3 =
 * ?:15."; the only shape whose answer may be a PAIR, read by its own strict reader, `readPair`); unit rates and direct
 * proportion (`rate`: "5 pens cost €3.50. What do 8 pens cost?", "240 km in 3 hours. How far in 5 hours?", a short
 * statement and one question, never a story); the area of rectangles, triangles and two rectangles together (`area`,
 * "Find the area of a rectangle 7 cm by 4 cm.", its answer in square units); the mean and the range of a short list (`stat`:
 * "Work out the mean of 4, 7, 9 and 10.", "Find the range of 12, 5, 9, 20 and 7."; a missing value that gives a stated mean
 * is not a unit of Phase 1).
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

/** The integer square root of n, rounded down (Newton's method on bigints): exact, no floating point (M2b, Pythagoras). */
function isqrt(n: bigint): bigint {
  if (n < BigInt(2)) return n < Z ? Z : n;
  let x = n, y = (x + ONE) / BigInt(2);
  while (y < x) { x = y; y = (x + n / x) / BigInt(2); }
  return x;
}
/**
 * The slips a kind can show, each used only where its value differs from the answer and from every other slip's: a value
 * that is also the answer is no slip (it is right), and a value two slips share cannot say which was made (M2b).
 */
function distinctSlips(cands: [string, Q][], truth: Q): [string, Q][] {
  return cands.filter(([id, v], i) => !eq(v, truth) && !cands.some(([id2, v2], j) => j !== i && id2 !== id && eq(v, v2)));
}

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
 * (the store keeps a school spec's `expr`, `form`, `unit`, `allowNegative` and `to` and nothing else, session/store
 * SCHOOL_SPEC_KEYS), so the W7 batch-1 shapes added no store key, batch 2 only `to` and batch 3 none (each W7 batch-3
 * unit is its own member of this union, below).
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
 *   - percent-of (W7 batch 2, "A percent of an amount"): expr "p% of N", a percent above 0 and below 100 (at most one
 *     decimal place) of a whole amount 1 to 1000, "Find 35% of 80.", "Find 15% of €60."; `unit` is the amount's unit
 *     (and the answer's). The value is p × N / 100 exactly, to at most two decimal places.
 *   - percent-change (W7 batch 2, "Percent increase and decrease"): expr "increase B by p%" or "decrease B by p%", a whole
 *     amount 1 to 1000 changed by a percent above 0 (at most 100 up, below 100 down), "Increase 60 by 15%.", "Decrease
 *     €80 by 25%."; `unit` as for an amount. The value is B × (100 ± p) / 100 exactly: the change applied to the whole,
 *     never a reverse percentage (finding the original), which is a later unit.
 *   - ratio (W7 batch 3, "Ratio and sharing"), two-part ratios of whole numbers only: expr "12:18" (write it in its
 *     simplest form: the answer is a RATIO, 2:3), "60 in 2:3" (share 60 in the ratio 2:3: the answer is a PAIR of amounts,
 *     24 and 36, in the ratio's order; `unit` is the amount's, optional, as for a fraction of an amount) or "2:3 = ?:15" /
 *     "2:3 = 10:?" (a missing term of an equal ratio: a whole number). A ratio to share by is in lowest terms, its two
 *     numbers differ, and the amount splits into whole shares, neither of which the question prints.
 *   - rate (W7 batch 3, "Unit rates and direct proportion"): expr "5 pens cost 3.50, 8" (q1 items cost p; what q2 of them
 *     cost; the item a noun from RATE_NOUNS, the price whole or to the penny, `unit` € or £) or "240 km in 3 h, 5" (a
 *     distance in h1 hours; the distance in h2 hours at the same speed; `unit` km). q2 = 1 asks the value of a single one
 *     (the unit rate itself). The value is p × q2 / q1 exactly, to at most two decimal places; q1 is at least 2 and q2 is
 *     not q1 (else there is nothing to find).
 *   - area (W7 batch 3, "Area of rectangles, triangles and composite shapes"): expr "rectangle 7 by 4", "triangle base 10
 *     height 6" or "rectangles 8 by 3 and 4 by 2" (two rectangles joined, their areas added: described in words, never a
 *     figure - Phase 1 draws none); sides whole or a half (7.5), at most 1000; `unit` cm2 or m2, required: the answer's
 *     square unit, the sides printed in cm or metres. The value is ab, bh/2 or ab + cd exactly.
 *   - stat (W7 batch 3, "Mean and range"): expr "mean 4, 7, 9, 10" or "range 12, 5, 9, 20, 7", three to ten whole numbers
 *     0..999 in the order printed; no unit. The mean is the total over the count exactly, allowed only when it terminates
 *     within two decimal places; the range the largest less the smallest, above nothing.
 *   - pythagoras (v2 M2b, Pythagoras' theorem; the unit is mapped to a Foundation statement, never certified): expr "longest 6 8"
 *     (the two shorter sides 6 and 8 are given: find the longest) or "shorter 10 6" (the longest side 10 and one shorter side 6
 *     are given: find the other shorter side); `unit` mm, cm or m, required: the answer's own. All three sides are whole numbers,
 *     at most 100 (a scaled Pythagorean triple); the truth is an exact integer square root, never a floating point root.
 */
export type ComputeSpec = { shape: "compute"; expr: string; form?: "simplest" | "decimal"; unit?: Unit; allowNegative?: true };
export type FractionOfSpec = { shape: "fraction-of"; expr: string; unit?: Unit };
export type MissingSpec = { shape: "missing"; expr: string };
export type SimplifySpec = { shape: "simplify"; expr: string };
/** The forms a conversion asks for (W7 batch 2). */
export type NumberFormAsked = "decimal" | "fraction" | "percent";
export type ConvertSpec = { shape: "convert"; expr: string; to: NumberFormAsked };
export type PercentOfSpec = { shape: "percent-of"; expr: string; unit?: Unit };
export type PercentChangeSpec = { shape: "percent-change"; expr: string; unit?: Unit };
export type RatioSpec = { shape: "ratio"; expr: string; unit?: Unit };
export type RateSpec = { shape: "rate"; expr: string; unit: Unit };
export type AreaSpec = { shape: "area"; expr: string; unit: Unit };
export type StatSpec = { shape: "stat"; expr: string };
export type PythagorasSpec = { shape: "pythagoras"; expr: string; unit: Unit };
export type SchoolSpec = ComputeSpec | FractionOfSpec | MissingSpec | SimplifySpec | ConvertSpec | PercentOfSpec | PercentChangeSpec | RatioSpec | RateSpec | AreaSpec | StatSpec | PythagorasSpec;
export type SchoolShape = SchoolSpec["shape"];
export const SCHOOL_SHAPES: readonly SchoolShape[] = ["compute", "fraction-of", "missing", "simplify", "convert", "percent-of", "percent-change", "ratio", "rate", "area", "stat", "pythagoras"];
/** The shapes whose amount may carry a unit (the answer is in it too). */
const AMOUNT_SHAPES: readonly SchoolShape[] = ["fraction-of", "percent-of", "percent-change"];
/** Every shape that may carry a `unit` (W7 batch 3: a ratio's shared amount; each kind says whether it takes one). */
const UNIT_SHAPES: readonly SchoolShape[] = [...AMOUNT_SHAPES, "ratio", "rate", "area", "pythagoras"];
/**
 * The things a rate question may price (W7 batch 3), plural as the question prints them, with the singular for "What does
 * 1 pen cost?". Closed, so a rate spec never carries free text; the generator draws only the short ones (a row's width).
 */
export const RATE_NOUNS: Readonly<Record<string, string>> = { pens: "pen", books: "book", cards: "card", eggs: "egg", cups: "cup", kg: "kg", pencils: "pencil", apples: "apple", tickets: "ticket", bottles: "bottle", stamps: "stamp", bags: "bag", litres: "litre", metres: "metre" };

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
  trailing: "A decimal a question prints does not end in a zero.",
  percentRange: "A percent of an amount is above nothing and below the whole amount.",
  prints: "The question would print its own answer.",
  twoPlaces: "The answer would need more than two decimal places.",
  changeRange: "A change is above nothing, at most the whole amount up and less than the whole amount down.",
  sameParts: "The two numbers of the ratio are the same: there is nothing to share out or simplify.",
  ratioLowest: "The ratio is already in its simplest form: there is nothing to simplify.",
  ratioNotLowest: "A ratio to share by is given in its simplest form.",
  wholeShares: "The amount does not split into whole shares in this ratio.",
  sameRatio: "The new ratio keeps the given number: there is nothing to work out.",
  notWholeRatio: "No whole number makes the two ratios equal.",
  rateOne: "The question already gives the value of a single one: there is nothing to find.",
  sameRate: "The question asks about the same number it gives: there is nothing to work out.",
  rateUnit: "A cost is in euros or pounds and a distance in km, and the spec names the one it is.",
  areaUnit: "An area names its square unit, cm2 or m2.",
  sameList: "Every number in the list is the same: there is nothing to work out.",
  pythUnit: "A side is in mm, cm or metres, and the spec names which.",
  pythBig: "A side is longer than a school question uses (at most 100).",
  pythTriangle: "The longest side is not longer than the other side: it is not a right-angled triangle.",
  pythWhole: "The missing side is not a whole number.",
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
  | { k: "convert"; from: NumberFormAsked; to: NumberFormAsked; given: Q; a?: bigint; b?: bigint; text: string }
  | { k: "pct-of"; p: Q; N: bigint; ptext: string }
  | { k: "pct-change"; p: Q; base: bigint; up: boolean; ptext: string }
  // W7 batch 3: a ratio a:b to simplify, an amount T to share in a:b, or a:b = ?:known ('first' missing) / known:? ('second')
  | { k: "ratio-simplify"; a: bigint; b: bigint }
  | { k: "ratio-share"; T: bigint; a: bigint; b: bigint }
  | { k: "ratio-missing"; a: bigint; b: bigint; known: bigint; slot: "first" | "second" }
  // W7 batch 3: q1 items cost p (or p km in q1 hours); the cost (distance) of q2
  | { k: "rate"; measure: "cost" | "distance"; q1: bigint; p: Q; ptext: string; q2: bigint; noun: string }
  // W7 batch 3: a rectangle's two sides, a triangle's base and height, or two rectangles' four sides, as written
  | { k: "area"; fig: "rectangle" | "triangle" | "composite"; sides: Q[]; texts: string[] }
  // W7 batch 3: the mean or the range of a list, in the order printed
  | { k: "stat"; stat: "mean" | "range"; xs: bigint[] }
  // M2b: find the longest side from the two shorter (x, y), or a shorter side from the longest (x) and the other shorter (y)
  | { k: "pyth"; find: "longest" | "shorter"; x: bigint; y: bigint };
type Structure = { ok: true; spec: SchoolSpec; node: Node; kind: Kind } | { ok: false; why: string };
/** `pair` (W7 batch 3, a ratio share): the two amounts in the ratio's order; `truth` is then the first of them. */
type ReadOk = { ok: true; spec: SchoolSpec; node: Node; kind: Kind; truth: Q; pair?: [Q, Q] };
type Read = ReadOk | { ok: false; why: string };

/** A whole number as a worksheet prints it: 1 to 999 (a top, a bottom) or 1 to 9999 (an amount), no leading zero. */
const W3 = String.raw`[1-9]\d{0,2}`, W4 = String.raw`[1-9]\d{0,3}`;
const OF_RE = new RegExp(String.raw`^(${W3})\/(${W3}) of (${W4})$`);
const MISSING_RE = new RegExp(String.raw`^(${W3})\/(${W3}) = (\?|${W3})\/(\?|${W3})$`);
const SIMPLIFY_RE = new RegExp(String.raw`^(${W3})\/(${W3})$`);
/** A decimal to convert, "0.35" (a whole part 0..999, one to three places), and a percent, "35%", "12.5%" (at most one place). */
const DECIMAL_RE = /^(0|[1-9]\d{0,2})\.(\d{1,3})$/, PERCENT_RE = /^(0|[1-9]\d{0,2})(?:\.(\d))?%$/;
const FORMS_ASKED: readonly NumberFormAsked[] = ["decimal", "fraction", "percent"];
/** A percent as a question prints it (up to three whole digits, at most one place), and "p% of N" with a whole amount. */
const PCT_SRC = String.raw`((?:0|[1-9]\d{0,2})(?:\.\d)?)`;
const PCT_OF_RE = new RegExp(String.raw`^${PCT_SRC}% of (${W4})$`);
const PCT_CHANGE_RE = new RegExp(String.raw`^(increase|decrease) (${W4}) by ${PCT_SRC}%$`);
/** W7 batch 3: a ratio to simplify "12:18", an amount to share "60 in 2:3", a missing term "2:3 = ?:15" / "2:3 = 10:?". */
const RATIO_SIMPLIFY_RE = new RegExp(String.raw`^(${W3}):(${W3})$`);
const RATIO_SHARE_RE = new RegExp(String.raw`^(${W4}) in (${W3}):(${W3})$`);
const RATIO_MISSING_RE = new RegExp(String.raw`^(${W3}):(${W3}) = (\?|${W3}):(\?|${W3})$`);
/** W7 batch 3: "5 pens cost 3.50, 8" (a price whole or to the penny) and "240 km in 3 h, 5". */
const RATE_COST_RE = new RegExp(String.raw`^(${W3}) ([a-z]+) cost ((?:0|[1-9]\d{0,3})(?:\.\d\d)?), (${W3})$`);
const RATE_DIST_RE = new RegExp(String.raw`^(${W4}) km in (${W3}) h, (${W3})$`);
/** W7 batch 3: a side, whole or a half, as an area question prints it (7, 7.5, 0.5). */
const SIDE_SRC = String.raw`((?:0|[1-9]\d{0,2})(?:\.5)?)`;
const AREA_RES: [RegExp, "rectangle" | "triangle" | "composite"][] = [
  [new RegExp(String.raw`^rectangle ${SIDE_SRC} by ${SIDE_SRC}$`), "rectangle"],
  [new RegExp(String.raw`^triangle base ${SIDE_SRC} height ${SIDE_SRC}$`), "triangle"],
  [new RegExp(String.raw`^rectangles ${SIDE_SRC} by ${SIDE_SRC} and ${SIDE_SRC} by ${SIDE_SRC}$`), "composite"],
];
/** W7 batch 3: "mean 4, 7, 9, 10" or "range 12, 5, 9, 20, 7": three to ten whole numbers, a comma and a space between. */
/** M2b: "longest 6 8" (the shorter sides given) or "shorter 10 6" (the longest and a shorter side given): sides of up to three digits. */
const PYTH_RE = /^(longest|shorter) ([1-9]\d{0,2}) ([1-9]\d{0,2})$/;
const STAT_RE = /^(mean|range) ((?:0|[1-9]\d{0,2})(?:, (?:0|[1-9]\d{0,2})){2,9})$/;
const sideQ = (x: string): Q => { const [w, f = ""] = x.split("."); return mk(BigInt(w + f), pow10(f.length))!; };
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
  // the W7 shapes take no form and no sign flag; only an amount (a fraction or a percent of it) takes a unit
  if (s.form !== undefined || s.allowNegative !== undefined || (!UNIT_SHAPES.includes(shape as SchoolShape) && s.unit !== undefined)) return { ok: false, why: REJECT.key };
  if (s.unit !== undefined && !(UNITS as readonly unknown[]).includes(s.unit)) return { ok: false, why: REJECT.unit };
  if (typeof s.expr !== "string" || s.expr.length > MAX_EXPR) return { ok: false, why: REJECT.read };
  if (shape === "ratio") {
    // W7 batch 3: only the amount a ratio shares takes a unit; a ratio to simplify and a missing term are numbers
    const expr = s.expr;
    let m = RATIO_SHARE_RE.exec(expr);
    if (m) {
      const [T, a, b] = [BigInt(m[1]), BigInt(m[2]), BigInt(m[3])];
      return { ok: true, spec: s as SchoolSpec, node: fracNode(a, b), kind: { k: "ratio-share", T, a, b } };
    }
    if (s.unit !== undefined) return { ok: false, why: REJECT.key };
    if ((m = RATIO_MISSING_RE.exec(expr))) {
      if ((m[3] === "?") === (m[4] === "?")) return { ok: false, why: REJECT.read };
      const [a, b] = [BigInt(m[1]), BigInt(m[2])], slot = m[3] === "?" ? "first" : "second";
      return { ok: true, spec: s as SchoolSpec, node: fracNode(a, b), kind: { k: "ratio-missing", a, b, known: BigInt(slot === "first" ? m[4] : m[3]), slot } };
    }
    if ((m = RATIO_SIMPLIFY_RE.exec(expr))) {
      const [a, b] = [BigInt(m[1]), BigInt(m[2])];
      return { ok: true, spec: s as SchoolSpec, node: fracNode(a, b), kind: { k: "ratio-simplify", a, b } };
    }
    return { ok: false, why: REJECT.read };
  }
  if (shape === "rate") {
    // W7 batch 3: the unit is the answer's own, so it is required; readKind checks it fits the measure
    let m = RATE_COST_RE.exec(s.expr);
    if (m) {
      if (!Object.prototype.hasOwnProperty.call(RATE_NOUNS, m[2])) return { ok: false, why: REJECT.read };
      const [w, f = ""] = m[3].split("."), p = mk(BigInt(w + f), pow10(f.length))!;
      const node: Node = { k: "op", op: "÷", a: { k: "num", q: p, s: m[3], whole: !f }, b: { k: "num", q: qi(BigInt(m[1])), s: m[1], whole: true } };
      return { ok: true, spec: s as SchoolSpec, node, kind: { k: "rate", measure: "cost", q1: BigInt(m[1]), p, ptext: m[3], q2: BigInt(m[4]), noun: m[2] } };
    }
    if ((m = RATE_DIST_RE.exec(s.expr))) {
      const node: Node = { k: "op", op: "÷", a: { k: "num", q: qi(BigInt(m[1])), s: m[1], whole: true }, b: { k: "num", q: qi(BigInt(m[2])), s: m[2], whole: true } };
      return { ok: true, spec: s as SchoolSpec, node, kind: { k: "rate", measure: "distance", q1: BigInt(m[2]), p: qi(BigInt(m[1])), ptext: m[1], q2: BigInt(m[3]), noun: "h" } };
    }
    return { ok: false, why: REJECT.read };
  }
  if (shape === "area") {
    for (const [re, fig] of AREA_RES) {
      const m = re.exec(s.expr);
      if (!m) continue;
      const texts = m.slice(1), sides = texts.map(sideQ);
      const node: Node = { k: "op", op: "×", a: { k: "num", q: sides[0], s: texts[0], whole: !texts[0].includes(".") }, b: { k: "num", q: sides[1], s: texts[1], whole: !texts[1].includes(".") } };
      return { ok: true, spec: s as SchoolSpec, node, kind: { k: "area", fig, sides, texts } };
    }
    return { ok: false, why: REJECT.read };
  }
  if (shape === "pythagoras") {
    const m = PYTH_RE.exec(s.expr);
    if (!m) return { ok: false, why: REJECT.read };
    const [x, y] = [BigInt(m[2]), BigInt(m[3])];
    return { ok: true, spec: s as SchoolSpec, node: fracNode(x, y), kind: { k: "pyth", find: m[1] as "longest" | "shorter", x, y } };
  }
  if (shape === "stat") {
    const m = STAT_RE.exec(s.expr);
    if (!m) return { ok: false, why: REJECT.read };
    const xs = m[2].split(", ").map((x) => BigInt(x));
    return { ok: true, spec: s as SchoolSpec, node: { k: "num", q: qi(xs[0]), s: String(xs[0]), whole: true }, kind: { k: "stat", stat: m[1] as "mean" | "range", xs } };
  }
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
  if (shape === "percent-of") {
    const m = PCT_OF_RE.exec(s.expr);
    if (!m) return { ok: false, why: REJECT.read };
    const [w, f = ""] = m[1].split("."), p = mk(BigInt(w + f), pow10(f.length))!, N = BigInt(m[2]);
    // the node is the working (p/100 × N; B × (100 ± p)/100 below), its numbers marked whole so no decimals rule reads it
    const node: Node ={ k: "op", op: "×", a: { k: "num", q: div(p, qi(BigInt(100)))!, s: m[1], whole: true }, b: { k: "num", q: qi(N), s: m[2], whole: true } };
    return { ok: true, spec: s as SchoolSpec, node, kind: { k: "pct-of", p, N, ptext: m[1] } };
  }
  if (shape === "percent-change") {
    const m = PCT_CHANGE_RE.exec(s.expr);
    if (!m) return { ok: false, why: REJECT.read };
    const [w, f = ""] = m[3].split("."), p = mk(BigInt(w + f), pow10(f.length))!, base = BigInt(m[2]), up = m[1] === "increase";
    const H = BigInt(100), factor = up ? add(qi(H), p) : sub(qi(H), p);
    const node: Node = { k: "op", op: "×", a: { k: "num", q: qi(base), s: m[2], whole: true }, b: { k: "num", q: div(factor, qi(H))!, s: m[3], whole: true } };
    return { ok: true, spec: s as SchoolSpec, node, kind: { k: "pct-change", p, base, up, ptext: m[3] } };
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
  if (K.k === "pct-of") {
    // W7 batch 2: p% of N = p × N / 100, a money-sized answer, never a number the question prints
    if (K.ptext.endsWith(".0")) return { ok: false, why: REJECT.trailing };
    if (K.p.n <= Z || K.p.n >= BigInt(100) * K.p.d) return { ok: false, why: REJECT.percentRange };
    if (K.N > lim) return { ok: false, why: REJECT.big };
    const truth = mk(K.p.n * K.N, K.p.d * BigInt(100))!;
    if (!exactAt(truth, 2)) return { ok: false, why: REJECT.twoPlaces };
    if (eq(truth, qi(K.N)) || eq(truth, K.p)) return { ok: false, why: REJECT.prints };
    return ok(truth);
  }
  if (K.k === "pct-change") {
    // W7 batch 2: B changed by p% = B × (100 ± p) / 100, the change applied to the whole
    const H = BigInt(100);
    if (K.ptext.endsWith(".0")) return { ok: false, why: REJECT.trailing };
    if (K.p.n <= Z || (K.up ? K.p.n > H * K.p.d : K.p.n >= H * K.p.d)) return { ok: false, why: REJECT.changeRange };
    if (K.base > lim) return { ok: false, why: REJECT.big };
    const truth = mk(K.base * (K.up ? H * K.p.d + K.p.n : H * K.p.d - K.p.n), H * K.p.d)!;
    if (!exactAt(truth, 2)) return { ok: false, why: REJECT.twoPlaces };
    if (eq(truth, qi(K.base)) || eq(truth, K.p)) return { ok: false, why: REJECT.prints };
    return ok(truth);
  }
  if (K.k === "ratio-simplify") {
    // W7 batch 3: the same ratio in lowest terms; the truth's top and bottom ARE its two parts (2/3 for 2:3)
    if (K.a > lim || K.b > lim) return { ok: false, why: REJECT.big };
    if (K.a === K.b) return { ok: false, why: REJECT.sameParts };
    if (bgcd(K.a, K.b) === ONE) return { ok: false, why: REJECT.ratioLowest };
    return ok(mk(K.a, K.b)!);
  }
  if (K.k === "ratio-share") {
    // W7 batch 3: T shared in a:b is T/(a+b) times each; whole shares only, neither printed by the question
    if (K.T > lim || K.a > lim || K.b > lim) return { ok: false, why: REJECT.big };
    if (K.a === K.b) return { ok: false, why: REJECT.sameParts };
    if (bgcd(K.a, K.b) !== ONE) return { ok: false, why: REJECT.ratioNotLowest };
    if (K.T % (K.a + K.b) !== Z) return { ok: false, why: REJECT.wholeShares };
    const k = K.T / (K.a + K.b), s1 = qi(k * K.a), s2 = qi(k * K.b);
    if ([K.T, K.a, K.b].some((x) => eq(qi(x), s1) || eq(qi(x), s2))) return { ok: false, why: REJECT.prints };
    return { ok: true, spec: st.spec, node: st.node, kind: K, truth: s1, pair: [s1, s2] };
  }
  if (K.k === "ratio-missing") {
    // W7 batch 3: a:b = ?:known is a × known / b; a:b = known:? is b × known / a - a whole number the question does not print
    if (K.a > lim || K.b > lim || K.known > lim) return { ok: false, why: REJECT.big };
    if (K.a === K.b) return { ok: false, why: REJECT.sameParts };
    const [given, other] = K.slot === "first" ? [K.a, K.b] : [K.b, K.a];
    if (K.known === other) return { ok: false, why: REJECT.sameRatio };
    if ((given * K.known) % other !== Z) return { ok: false, why: REJECT.notWholeRatio };
    const t = (given * K.known) / other;
    if (t < ONE || t > lim) return { ok: false, why: REJECT.result };
    if ([K.a, K.b, K.known].includes(t)) return { ok: false, why: REJECT.prints };
    return ok(qi(t));
  }
  if (K.k === "rate") {
    // W7 batch 3: q2 of them at p for q1 is p × q2 / q1; a cost in € or £, a distance in km; to the penny at most
    const u = (st.spec as { unit?: Unit }).unit;
    if (K.measure === "cost" ? u !== "€" && u !== "£" : u !== "km") return { ok: false, why: REJECT.rateUnit };
    if (K.q1 < BigInt(2)) return { ok: false, why: REJECT.rateOne };
    if (K.q2 === K.q1) return { ok: false, why: REJECT.sameRate };
    if (K.q1 > lim || K.q2 > lim || K.p.n > lim * K.p.d) return { ok: false, why: REJECT.big };
    if (K.p.n <= Z) return { ok: false, why: REJECT.negative };
    const truth = mk(K.p.n * K.q2, K.p.d * K.q1)!;
    if (!exactAt(truth, 2)) return { ok: false, why: REJECT.twoPlaces };
    if (truth.n > BigInt(MAX_RESULT) * truth.d) return { ok: false, why: REJECT.result };
    if ([qi(K.q1), qi(K.q2), K.p].some((x) => eq(x, truth))) return { ok: false, why: REJECT.prints };
    return ok(truth);
  }
  if (K.k === "area") {
    // W7 batch 3: ab, bh/2 or ab + cd, in the spec's square unit; every side above nothing and at most 1000
    const u = (st.spec as { unit?: Unit }).unit;
    if (u !== "cm2" && u !== "m2") return { ok: false, why: REJECT.areaUnit };
    if (K.sides.some((x) => x.n <= Z)) return { ok: false, why: REJECT.negative };
    if (K.sides.some((x) => x.n > lim * x.d)) return { ok: false, why: REJECT.big };
    const [a, b, c, d] = K.sides;
    const truth = K.fig === "rectangle" ? mul(a, b) : K.fig === "triangle" ? div(mul(a, b), qi(BigInt(2)))! : add(mul(a, b), mul(c, d));
    if (truth.n > BigInt(MAX_RESULT) * truth.d) return { ok: false, why: REJECT.result };
    // two half sides of a triangle make eighths (2.5 × 3.5 ÷ 2 = 4.375): not a school answer
    if (!exactAt(truth, 2)) return { ok: false, why: REJECT.twoPlaces };
    return ok(truth);
  }
  if (K.k === "pyth") {
    // M2b: c squared is a squared plus b squared, in whole numbers only; the root is the bigint integer square root
    const u = (st.spec as { unit?: Unit }).unit;
    if (u !== "mm" && u !== "cm" && u !== "m") return { ok: false, why: REJECT.pythUnit };
    const top = BigInt(100);
    if (K.x > top || K.y > top) return { ok: false, why: REJECT.pythBig };
    if (K.find === "longest") {
      const sq = K.x * K.x + K.y * K.y, c = isqrt(sq);
      if (c * c !== sq) return { ok: false, why: REJECT.pythWhole };
      return c > top ? { ok: false, why: REJECT.pythBig } : ok(qi(c));
    }
    if (K.y >= K.x) return { ok: false, why: REJECT.pythTriangle };
    const sq = K.x * K.x - K.y * K.y, a = isqrt(sq);
    return a * a !== sq ? { ok: false, why: REJECT.pythWhole } : ok(qi(a));
  }
  if (K.k === "stat") {
    // W7 batch 3: the total over the count, to two places at most; the largest less the smallest, above nothing
    const max = K.xs.reduce((a, b) => (b > a ? b : a)), min = K.xs.reduce((a, b) => (b < a ? b : a));
    if (max === min) return { ok: false, why: REJECT.sameList };
    if (K.stat === "range") return ok(qi(max - min));
    const truth = mk(K.xs.reduce((a, b) => a + b, Z), BigInt(K.xs.length))!;
    return exactAt(truth, 2) ? ok(truth) : { ok: false, why: REJECT.twoPlaces };
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

/** The unit a spec's answer is in, when it names one (compute and an amount's shapes take one). */
const specUnit = (s: SchoolSpec): Unit | undefined => (s.shape === "compute" || UNIT_SHAPES.includes(s.shape) ? (s as { unit?: Unit }).unit : undefined);

/**
 * Is this spec a question the desk can print and judge? The expression reads (+ - × ÷, brackets, whole numbers,
 * decimals to 3 places, fractions a/b), has one to four operations, every whole number and top is at most 1000,
 * every bottom from 2 to 100; nothing divides by zero; the value is at most 10000 in size with a bottom of at most
 * 10000 in lowest terms; it is above zero unless `allowNegative`; `form: "decimal"` only for a terminating value;
 * a known form and unit; no answer field. The W7 shapes: `fraction-of` "a/b of N" with a proper fraction (bottom 2 to
 * 100) and a whole amount 1 to 1000, a unit only; `missing` "a/b = ?/d" or "a/b = c/?" whose missing number is whole
 * (a top at most 1000, a bottom 2 to 100) and not the given one's own; `simplify` "a/b", proper and not yet in lowest
 * terms; none of them takes a form or a sign flag. W7 batch 3: `ratio` "12:18" not in lowest terms, "T in a:b" with a:b in
 * lowest terms, a ≠ b, whole shares neither printed, or "a:b = ?:k" / "a:b = k:?" with a whole missing term the question
 * does not print; numbers at most 1000. `rate` "q1 noun cost p, q2" (€ or £) or "D km in h1 h, q2" (km): q1 at least 2,
 * q2 not q1, a value to two places at most that the question does not print. `area` a rectangle, a triangle (base and
 * height) or two rectangles, sides whole or a half above nothing, `unit` cm2 or m2. `stat` a mean or range of three to ten
 * whole numbers 0..999, not all the same, a mean to two places at most.
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
 * An amount as a question prints it: € and £ as a sign before the number (€60); any other unit as its word after it (60
 * kg, 60 metres), a dollar as "60 dollars" since the typesetter reads a plain '$' as TeX's math delimiter and drops it.
 */
function amountText(N: string, u: Unit | undefined): { plain: string; tex: string } {
  if (!u) return { plain: N, tex: N };
  if (u === "€" || u === "£") return { plain: `${u}${N}`, tex: `${u}${N}` };
  return { plain: `${N} ${AMOUNT_WORD[u]}`, tex: `${N} \\text{ ${AMOUNT_WORD[u]}}` };
}

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
      const am = amountText(String(K.N), specUnit(st.spec));
      return { plain: `Find ${K.a}/${K.b} of ${am.plain}.`, tex: `\\text{Find } \\frac{${K.a}}{${K.b}} \\text{ of } ${am.tex}.` };
    }
    if (K.k === "pct-of") {
      // W7 batch 2: "Find 35% of 80.", "Find 15% of €60.", "Find 12% of 250 kg."
      const am = amountText(String(K.N), specUnit(st.spec));
      return { plain: `Find ${K.ptext}% of ${am.plain}.`, tex: `\\text{Find } ${K.ptext}\\% \\text{ of } ${am.tex}.` };
    }
    if (K.k === "pct-change") {
      // W7 batch 2: "Increase 60 by 15%.", "Decrease €80 by 25%.", "Decrease 250 kg by 12%."
      const am = amountText(String(K.base), specUnit(st.spec)), verb = K.up ? "Increase" : "Decrease";
      return { plain: `${verb} ${am.plain} by ${K.ptext}%.`, tex: `\\text{${verb} } ${am.tex} \\text{ by } ${K.ptext}\\%.` };
    }
    if (K.k === "missing") {
      const [p, q] = K.slot === "top" ? ["?", String(K.known)] : [String(K.known), "?"];
      return { plain: `Fill in the missing number: ${K.a}/${K.b} = ${p}/${q}.`, tex: `\\text{Fill in the missing number: } \\frac{${K.a}}{${K.b}} = \\frac{${p}}{${q}}.` };
    }
    if (K.k === "simplify") return { plain: `Write ${K.a}/${K.b} in its simplest form.`, tex: `\\text{Write } \\frac{${K.a}}{${K.b}} \\text{ in its simplest form.}` };
    // W7 batch 3: "Write 12:18 in its simplest form.", "Share €60 in the ratio 2:3.", "Fill in the missing number: 2:3 = ?:15."
    if (K.k === "ratio-simplify") return { plain: `Write ${K.a}:${K.b} in its simplest form.`, tex: `\\text{Write } ${K.a}:${K.b} \\text{ in its simplest form.}` };
    if (K.k === "ratio-share") {
      const am = amountText(String(K.T), specUnit(st.spec));
      return { plain: `Share ${am.plain} in the ratio ${K.a}:${K.b}.`, tex: `\\text{Share } ${am.tex} \\text{ in the ratio } ${K.a}:${K.b}.` };
    }
    if (K.k === "stat") {
      // W7 batch 3: "Work out the mean of 4, 7, 9 and 10.", "Find the range of 12, 5, 9, 20 and 7." - the list in its order
      const xs = K.xs.map(String), list = `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
      const lead = K.stat === "mean" ? "Work out the mean of" : "Find the range of";
      return { plain: `${lead} ${list}.`, tex: `\\text{${lead} } ${xs.slice(0, -1).join(", ")} \\text{ and } ${xs[xs.length - 1]}.` };
    }
    if (K.k === "area") {
      // W7 batch 3: "Find the area of a rectangle 7 cm by 4 cm.", "Find the area of a triangle, base 10 cm, height 6 cm.",
      // "Find the total area of rectangles 8 cm by 3 cm and 4 cm by 2 cm." - a side in metres is printed as the word (a
      // lone 'm' is set as a letter by the typesetter), and the square unit is left to the answer
      const m2 = specUnit(st.spec) === "m2";
      const side = (x: string) => ({ plain: m2 ? `${x} ${x === "1" ? "metre" : "metres"}` : `${x} cm`, tex: m2 ? `${x} \\text{ ${x === "1" ? "metre" : "metres"}}` : `${x} \\text{ cm}` });
      const [A, B, C, D] = K.texts.map(side);
      if (K.fig === "rectangle") return { plain: `Find the area of a rectangle ${A.plain} by ${B.plain}.`, tex: `\\text{Find the area of a rectangle } ${A.tex} \\text{ by } ${B.tex}.` };
      if (K.fig === "triangle") return { plain: `Find the area of a triangle, base ${A.plain}, height ${B.plain}.`, tex: `\\text{Find the area of a triangle, base } ${A.tex}, \\text{ height } ${B.tex}.` };
      return {
        plain: `Find the total area of rectangles ${A.plain} by ${B.plain} and ${C.plain} by ${D.plain}.`,
        tex: `\\text{Find the total area of rectangles } ${A.tex} \\text{ by } ${B.tex} \\text{ and } ${C.tex} \\text{ by } ${D.tex}.`,
      };
    }
    if (K.k === "pyth") {
      // M2b: "A right-angled triangle has shorter sides 6 cm and 8 cm. Find the longest side." - one plain sentence, no diagram;
      // a side in metres is printed as the word (the typesetter sets a lone m as a letter)
      const u = specUnit(st.spec);
      if (u !== "mm" && u !== "cm" && u !== "m") return null;
      const side = (x: bigint) => (u === "m" ? { plain: `${x} metres`, tex: `${x} \\text{ metres}` } : { plain: `${x} ${u}`, tex: `${x} \\text{ ${u}}` });
      const [X, Y] = [side(K.x), side(K.y)];
      if (K.find === "longest") return { plain: `A right-angled triangle has shorter sides ${X.plain} and ${Y.plain}. Find the longest side.`, tex: `\\text{A right-angled triangle has shorter sides } ${X.tex} \\text{ and } ${Y.tex}. \\text{ Find the longest side.}` };
      return { plain: `A right-angled triangle has longest side ${X.plain} and a shorter side ${Y.plain}. Find the other shorter side.`, tex: `\\text{A right-angled triangle has longest side } ${X.tex} \\text{ and a shorter side } ${Y.tex}. \\text{ Find the other shorter side.}` };
    }
    if (K.k === "rate") {
      // W7 batch 3: "5 pens cost €3.50. What do 8 pens cost?", "12 kg cost €30. What does 1 kg cost?", "240 km in 3 hours. How far in 5 hours?"
      if (K.measure === "distance") {
        const hrs = (n: bigint) => (n === ONE ? "hour" : "hours");
        return { plain: `${K.ptext} km in ${K.q1} hours. How far in ${K.q2} ${hrs(K.q2)}?`, tex: `${K.ptext} \\text{ km in } ${K.q1} \\text{ hours. How far in } ${K.q2} \\text{ ${hrs(K.q2)}?}` };
      }
      const am = amountText(K.ptext, specUnit(st.spec)), one = K.q2 === ONE, item = one ? RATE_NOUNS[K.noun] : K.noun;
      return {
        plain: `${K.q1} ${K.noun} cost ${am.plain}. What ${one ? "does" : "do"} ${K.q2} ${item} cost?`,
        tex: `${K.q1} \\text{ ${K.noun} cost } ${am.tex}. \\text{ What ${one ? "does" : "do"} } ${K.q2} \\text{ ${item} cost?}`,
      };
    }
    if (K.k === "ratio-missing") {
      const [p, q] = K.slot === "first" ? ["?", String(K.known)] : [String(K.known), "?"];
      return { plain: `Fill in the missing number: ${K.a}:${K.b} = ${p}:${q}.`, tex: `\\text{Fill in the missing number: } ${K.a}:${K.b} = ${p}:${q}.` };
    }
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
  // a percent of an amount (Family W7 batch 2)
  { id: "pct-divided", name: "Divided by the percent", says: "The amount was divided by the percentage. A percentage of an amount is that many hundredths of it: find one hundredth of the amount, then take that many.", points: "the division" },
  { id: "pct-times-whole", name: "The percent used as a whole number", says: "The amount was multiplied by the percentage as if it were a whole number, so the answer is far bigger than the amount. A percentage is a number of hundredths, so divide by a hundred as well.", points: "the multiplication" },
  { id: "pct-ten-stopped", name: "Found ten percent and stopped", says: "This is ten percent of the amount, the first step. Build the percentage asked for from it.", points: "the last line" },
  { id: "pct-rest", name: "Found the part that is left", says: "This is the part of the amount that is left over, not the percentage asked for. Take the percentage itself of the amount.", points: "the last line" },
  // percent increase and decrease (Family W7 batch 2)
  { id: "change-only", name: "Found the change and stopped", says: "This is the change itself, the percentage of the amount. The question asks for the new amount: add the change on, or take it off.", points: "the last line" },
  { id: "change-wrong-way", name: "Went the wrong way", says: "The change was added where the amount goes down, or taken off where it goes up. Read the question again: an increase adds, a decrease takes away.", points: "the line where the change was added or taken off" },
  { id: "change-as-number", name: "The percent added as a plain number", says: "The percentage was added or taken off as a plain number, as if the amount were a hundred. Find that percentage of the amount itself first.", points: "the line where the percentage was added or taken off" },
  // ratio and sharing (Family W7 batch 3)
  { id: "ratio-split-each", name: "Divided by each number of the ratio", says: "The amount was divided by each number of the ratio in turn. Add the ratio's numbers first to find how many equal parts there are, then find the size of a single part.", points: "the division" },
  { id: "ratio-as-amounts", name: "The ratio's numbers given as the amounts", says: "The numbers of the ratio were given as the answer. They say how many parts each side gets: find the size of a single part and multiply by them.", points: "the answer" },
  { id: "ratio-swapped", name: "The ratio the wrong way round", says: "The ratio's two numbers were used the wrong way round. The first number of the ratio goes with the first amount, and the second with the second.", points: "the order in the answer" },
  { id: "ratio-by-difference", name: "Divided by the difference", says: "The amount was divided by the difference between the ratio's numbers. The whole amount is all the parts together, so divide by their sum.", points: "the division" },
  { id: "ratio-added-same", name: "Added instead of multiplied", says: "The same number was added to both sides of the ratio. Equal ratios come from multiplying or dividing both numbers by the same number.", points: "the line where the ratio changed" },
  // unit rates and direct proportion (Family W7 batch 3)
  { id: "rate-wrong-way", name: "Divided the wrong way round", says: "The division was done the wrong way round: it gives how many for each unit of money or distance, not the value of a single one. Divide the cost or the distance by how many there are.", points: "the division" },
  { id: "rate-multiplied", name: "Multiplied instead of divided", says: "The two numbers in the first sentence were multiplied. The value of a single one comes from dividing by how many there are.", points: "the first line of working" },
  { id: "rate-other-quantity", name: "Divided by the wrong number", says: "The cost or distance was divided by the number asked about instead of the number given. Divide by the number in the first sentence to find a single one, then multiply.", points: "the division" },
  // area of rectangles, triangles and composite shapes (Family W7 batch 3)
  { id: "area-added-sides", name: "Added the lengths", says: "The lengths were added, which measures a distance round the shape, not the space inside it. An area comes from multiplying.", points: "the line where the lengths were combined" },
  { id: "area-no-half", name: "The half left out", says: "The base and the height were multiplied but the result was not halved. A triangle takes up half of the rectangle drawn around it.", points: "the last line" },
  { id: "area-one-part", name: "Only one rectangle", says: "This is the area of only one of the two rectangles. Find the area of each rectangle, then add them together.", points: "the last line" },
  // mean and range (Family W7 batch 3)
  { id: "stat-not-divided", name: "Added but did not divide", says: "The numbers were added but the total was not shared out. The mean is the total divided by how many numbers there are.", points: "the last line" },
  { id: "stat-wrong-count", name: "Divided by the wrong count", says: "The total was divided by the wrong number. Count the numbers in the list again and divide by exactly that many.", points: "the division" },
  { id: "stat-median", name: "Took the middle value", says: "This is the middle value of the list put in order, not the mean. The mean shares the total out equally among the numbers.", points: "the answer" },
  { id: "range-largest", name: "The largest number only", says: "This is the largest number of the list only. The range is the largest take away the smallest.", points: "the answer" },
  { id: "range-backwards", name: "Took away the wrong way round", says: "The largest was taken away from the smallest, so the answer is below zero. The range is the largest take away the smallest, and it is never negative.", points: "the subtraction" },
  // Pythagoras' theorem (v2 M2b)
  { id: "pyth-sides-added", name: "Added the two sides", says: "The two lengths were added. The sides of a right-angled triangle are linked through their squares, not their sum: multiply each by itself first, then add or take away.", points: "the line where the two lengths were combined" },
  { id: "pyth-no-root", name: "Stopped before the square root", says: "The squares were combined correctly but the square root was never taken. That result is the side multiplied by itself, so find the number that multiplies by itself to make it.", points: "the last line" },
  { id: "pyth-squares-added", name: "Added the squares for a shorter side", says: "The squares were added, but a shorter side comes from taking the square of the other shorter side away from the square of the longest side. The longest side is the biggest square.", points: "the line where the squares were combined" },
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
 *   - p% of N (W7 batch 2): N ÷ p and N ÷ (p/100) divided by the percent; p × N the percent as a whole number; N ÷ 10
 *     ten percent and stopped (p not ten); (100 - p)% of N the part left;
 *   - B increased or decreased by p% (W7 batch 2): p% of B the change and stopped; B × (100 ∓ p)/100 the other way; B ± p
 *     the percent added or taken off as a plain number (the percent of a hundred, not of the amount);
 *   - a missing ratio term a:b = ?:k (W7 batch 3): a + (k - b) the difference added; b × k / a the ratio the other way
 *     round (whole only). A ratio to simplify and a share are judged by `checkRatio`, whose pairs carry their own slips;
 *   - q2 at p for q1 (W7 batch 3, a rate): q1 ÷ p × q2 the division the wrong way round; p × q1 × q2 multiplied instead of
 *     divided; p ÷ q2 × q1 divided by the number asked about (q2 above 1);
 *   - an area (W7 batch 3): the lengths added (a + b, 2(a + b); b + h; the four sides and the two perimeters), a triangle
 *     not halved (bh), one rectangle of two (ab, cd);
 *   - a mean (W7 batch 3): the total not divided, the total over one fewer or one more than the count, the middle value
 *     (the median, and each middle number of an even list); a range: the largest alone, the smallest less the largest;
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
  if (K.k === "pct-of") {
    // W7 batch 2, p% of N: N ÷ p and N ÷ (p/100) divided by it; p × N the percent as a whole number; N ÷ 10 ten percent
    // and stopped (when p is not ten); (100 - p)% of N the part left
    const H = BigInt(100), N = qi(K.N);
    // for 10% the percent as a whole number (10 × N) and N ÷ 10% are one value: it is named the whole-number slip, the likelier story
    push("pct-divided", div(N, K.p));
    push("pct-times-whole", mul(K.p, N));
    push("pct-divided", div(mul(N, qi(H)), K.p));
    if (!eq(K.p, qi(TEN))) push("pct-ten-stopped", mk(K.N, TEN));
    push("pct-rest", mul(sub(qi(H), K.p), mk(K.N, H)!));
    return out;
  }
  if (K.k === "ratio-missing") {
    // W7 batch 3, a:b = ?:known (t = a × known / b): the difference added, a + (known - b); the ratio the other way round,
    // b × known / a. a:b = known:? likewise with a and b exchanged. A missing term must be a whole number above 0.
    const [given, other] = K.slot === "first" ? [K.a, K.b] : [K.b, K.a];
    const whole = (x: bigint) => (x > Z ? qi(x) : null);
    push("ratio-added-same", whole(given + K.known - other));
    if ((other * K.known) % given === Z) push("ratio-swapped", whole((other * K.known) / given));
    return out;
  }
  if (K.k === "stat") {
    // W7 batch 3, a mean: the total not divided; the total over one fewer or one more than the count; the middle value of the
    // list in order (the median, and for an even count each of the two middle numbers). A range: the largest alone; the
    // smallest less the largest, below zero
    const xs = [...K.xs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)), n = BigInt(xs.length), total = xs.reduce((a, b) => a + b, Z);
    const max = xs[xs.length - 1], min = xs[0];
    if (K.stat === "range") { push("range-largest", qi(max)); push("range-backwards", qi(min - max)); return out; }
    push("stat-not-divided", qi(total));
    push("stat-wrong-count", mk(total, n - ONE));
    push("stat-wrong-count", mk(total, n + ONE));
    const mid = xs.length >> 1;
    if (xs.length % 2) push("stat-median", qi(xs[mid]));
    else { push("stat-median", mk(xs[mid - 1] + xs[mid], BigInt(2))); push("stat-median", qi(xs[mid - 1])); push("stat-median", qi(xs[mid])); }
    return out;
  }
  if (K.k === "area") {
    // W7 batch 3: the lengths added (a + b and the perimeter 2(a + b); a triangle's b + h; two rectangles' four sides and
    // their two perimeters), a triangle's bh not halved, one rectangle of two alone. No slant side: the spec has none
    const [a, b, c, d] = K.sides, two = qi(BigInt(2));
    if (K.fig === "composite") {
      push("area-added-sides", add(add(a, b), add(c, d)));
      push("area-added-sides", mul(two, add(add(a, b), add(c, d))));
      push("area-one-part", mul(a, b));
      push("area-one-part", mul(c, d));
    } else {
      push("area-added-sides", add(a, b));
      if (K.fig === "rectangle") push("area-added-sides", mul(two, add(a, b)));
      else push("area-no-half", mul(a, b));
    }
    return out;
  }
  if (K.k === "pyth") {
    // M2b: the two given sides added (a + b, or c + b); the squares combined and the root not taken (a² + b², or c² − b²); for a
    // shorter side the squares added instead of taken away, c² + b² (its root is no whole number, so only the unrooted value is
    // exact - the rooted slip has no exact value and is not listed)
    const X = qi(K.x), Y = qi(K.y), xx = mul(X, X), yy = mul(Y, Y);
    const cands: [string, Q][] = [["pyth-sides-added", add(X, Y)], ["pyth-no-root", K.find === "longest" ? add(xx, yy) : sub(xx, yy)]];
    if (K.find === "shorter") cands.push(["pyth-squares-added", add(xx, yy)]);
    return distinctSlips(cands, r.truth);
  }
  if (K.k === "rate") {
    // W7 batch 3, q1 at p, then q2: q1 ÷ p × q2 the division the wrong way round; p × q1 × q2 multiplied instead of divided;
    // p ÷ q2 × q1 divided by the number asked about (for q2 = 1 that is p × q1, the multiplied slip, so it is not pushed)
    const P = K.p, Q1 = qi(K.q1), Q2 = qi(K.q2);
    push("rate-wrong-way", mul(div(Q1, P)!, Q2));
    push("rate-multiplied", mul(mul(P, Q1), Q2));
    if (K.q2 !== ONE) push("rate-other-quantity", mul(div(P, Q2)!, Q1));
    return out;
  }
  if (K.k === "pct-change") {
    // W7 batch 2, B changed by p%: p% of B the change alone; B × (100 ∓ p)/100 the other way; B ± p the percent as a number
    const H = qi(BigInt(100)), B = qi(K.base), change = div(mul(K.p, B), H)!;
    push("change-only", change);
    push("change-wrong-way", K.up ? sub(B, change) : add(B, change));
    push("change-as-number", K.up ? add(B, K.p) : sub(B, K.p));
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
  amountAsPercent: "This is written as a percentage; the question asks for an amount, and the desk does not guess.",
  ratioAsked: "This is one number; the question asks for a ratio.",
  ratioForm: "These are two numbers, not written as a ratio; the question asks for a ratio.",
  order: "These are the two amounts the other way round, and the desk does not guess which was meant to come first.",
  oneShare: "This is one of the two amounts; the question asks for both.",
  twoAsked: "This is one number; the question asks for two amounts, and the desk does not guess what was meant.",
  pence: "This reads as the amount in cents or pence without its unit, and the desk does not guess.",
  lengthUnit: "This area carries a length unit, not a square one; the desk does not mark a unit wrong, and asks.",
  givenRatio: "This is a ratio equal to the one given; the question asks for the missing number.",
  notCompleting: "This ratio does not complete the one given, and the desk does not guess which number was meant.",
} as const;

/**
 * Two amounts as a learner writes the answer to a ratio question (W7 batch 3): "24 and 36", "24 & 36", "24:36", "24 : 36",
 * "24 to 36", each side ONE number by readNumber under the system (a unit or a currency sign on either side is kept on its
 * reading). `sep` says how they were joined: ':' and 'to' write a ratio (its order is meant), 'and' lists two amounts.
 * Strict: anything else - a comma between them (a decimal comma in cz and de), three numbers, words, a percent - is null.
 */
function readPair(answer: string, system: unknown): { a: NumberReading; b: NumberReading; sep: "and" | ":" } | null {
  if (answer.length > MAX_ANSWER) return null;
  let s = normalise(answer).replace(/^(?:answer ?[:=]|ans ?[:=]|=) ?/i, "");
  if (/[^.]\.$/.test(s)) s = s.slice(0, -1).trimEnd();
  let m = /^(.+?) (?:and|&) (.+)$/i.exec(s), sep: "and" | ":" = "and";
  if (!m) { m = /^([^:]+?) ?: ?([^:]+)$/.exec(s) ?? /^(.+?) to (.+)$/i.exec(s); sep = ":"; }
  if (!m) return null;
  const a = readNumber(m[1], system), b = readNumber(m[2], system);
  return a && b && a.kind === "number" && b.kind === "number" && a.form !== "percent" && b.form !== "percent" ? { a, b, sep } : null;
}

/** Is the written value v (a reading) c exactly, or a rounding of c that has no exact decimal to as many places? */
function nearly(rd: NumberReading, c: Q): boolean {
  const v = fromRat(rd.value);
  if (eq(v, c)) return true;
  if (rd.form !== "decimal") return false;
  const k = placesOf(rd, v);
  return k > 0 && !exactAt(c, k) && withinPlace(v, c, k);
}

/**
 * The verdict on a ratio question (W7 batch 3), by kind; a percent, a unit the question does not carry, or two numbers the
 * reader cannot read as a pair are unsure, as everywhere:
 *   - simplify a:b (lowest p:q): a RATIO p':q' is right when it is p:q in whole numbers in lowest terms; an equal ratio not
 *     in lowest terms (4:6, 12:18, 1:1.5) is UNSURE, never wrong (the form asks for more); q:p is wrong with ratio-swapped;
 *     any other ratio wrong. Two numbers joined by 'and', or one number (2/3, 0.67), are unsure: not written as a ratio;
 *   - share T in a:b (s1, s2): the two amounts in order (s1 and s2, s1:s2) are right; the other order is wrong with
 *     ratio-swapped when written as a ratio (s2:s1), and UNSURE when listed with 'and' (the desk does not guess which was
 *     meant first); a pair that is, in either order, what a known wrong method gives is wrong with its slip (T/a and T/b
 *     split-each, a and b as-amounts, T/|a - b| times a and b by-difference); any other pair wrong. One number alone is
 *     unsure: it may be one share, or a list the reader took as one number (24,36 is 24.36 in cz and de);
 *   - a missing term: a whole number judged as a missing number is (right, a slip, or wrong); a ratio that completes the
 *     given one is read as its missing term (10:15 for 2:3 = ?:15 is 10), one equal to the given ratio that does not
 *     complete it is unsure, any other ratio unsure; a fraction completing it likewise (10/15 is 10).
 */
function checkRatio(r: ReadOk, writing: string, system: unknown): SchoolVerdict {
  const K = r.kind, t = r.truth, unit = specUnit(r.spec);
  const unitOk = (x: NumberReading) => !x.unit || x.unit === unit;
  const unsure = (why: string, form?: Reading["form"]): SchoolVerdict => ({ verdict: "unsure", ...(form ? { form } : {}), why });
  const right: SchoolVerdict = { verdict: "right", form: "ratio", why: WHY.right };
  const wrong = (slip?: string, form: Reading["form"] = "ratio"): SchoolVerdict => (slip ? { verdict: "wrong", slip, form, why: WHY.slip } : { verdict: "wrong", form, why: WHY.wrong });
  const pair = readPair(writing, system);
  if (pair) {
    if (!unitOk(pair.a) || !unitOk(pair.b)) return unsure(unit ? WHY.otherUnit : WHY.unit, "ratio");
    const p = fromRat(pair.a.value), q = fromRat(pair.b.value);
    if (K.k === "ratio-simplify") {
      if (pair.sep === "and") return unsure(WHY.ratioForm, "ratio");
      const [A, B] = [t.n, t.d];
      if (p.n * B * q.d === q.n * A * p.d && q.n !== Z) {
        const lowest = p.d === ONE && q.d === ONE && p.n > Z && q.n > Z && bgcd(p.n, q.n) === ONE;
        return lowest ? right : unsure(WHY.simplest, "ratio");
      }
      if (p.n * A * q.d === q.n * B * p.d && p.n !== Z) return wrong("ratio-swapped");
      return wrong();
    }
    if (K.k === "ratio-missing") {
      if (pair.sep === "and") return unsure(WHY.ratioForm, "ratio");
      const filled = K.slot === "first" ? (eq(q, qi(K.known)) ? p : null) : eq(p, qi(K.known)) ? q : null;
      if (filled) return judgeMissingRatio(r, filled, "ratio");
      if (q.n !== Z && eq(div(p, q)!, mk(K.a, K.b)!)) return unsure(WHY.givenRatio, "ratio");
      return unsure(WHY.notCompleting, "ratio");
    }
    // a share: the two amounts in the ratio's order
    const [s1, s2] = r.pair!;
    if (eq(p, s1) && eq(q, s2)) return right;
    if (eq(p, s2) && eq(q, s1)) return pair.sep === ":" ? wrong("ratio-swapped") : unsure(WHY.order, "ratio");
    if (K.k === "ratio-share") {
      const T = qi(K.T), a = qi(K.a), b = qi(K.b), d = qi(babs(K.a - K.b));
      const slips: [string, Q, Q][] = [["ratio-split-each", div(T, a)!, div(T, b)!], ["ratio-as-amounts", a, b], ["ratio-by-difference", mul(div(T, d)!, a), mul(div(T, d)!, b)]];
      for (const [id, x, y] of slips) if ((nearly(pair.a, x) && nearly(pair.b, y)) || (nearly(pair.a, y) && nearly(pair.b, x))) return wrong(id);
    }
    return wrong();
  }
  const reading = readNumber(writing, system);
  if (!reading) return unsure(WHY.unreadable);
  if (reading.kind === "ratio") return unsure(WHY.unreadable, "ratio");
  const form = reading.form;
  if (K.k === "ratio-simplify") return unsure(WHY.ratioAsked, form);
  if (form === "percent") return unsure(WHY.amountAsPercent, form);
  if (!unitOk(reading)) return unsure(unit ? WHY.otherUnit : WHY.unit, form);
  const v = fromRat(reading.value);
  // one number never answers a share, but it may be a list the reader took as one number (24,36 is 24.36 in cz): unsure
  if (K.k === "ratio-share") return unsure(eq(v, r.pair![0]) || eq(v, r.pair![1]) ? WHY.oneShare : WHY.twoAsked, form);
  if (K.k !== "ratio-missing") return unsure(WHY.badSpec, form);
  // a fraction that completes the given ratio is read as its missing term, as a missing number's fraction is (check)
  const w = form === "fraction" ? writtenFraction(writing) : null;
  const slotted = w && K.slot === "first" && w[1] === K.known ? w[0] : w && K.slot === "second" && w[0] === K.known ? w[1] : null;
  if (slotted !== null) {
    if (!eq(qi(slotted), t) && eq(v, t)) return unsure(WHY.twoWays, form);
    return judgeMissingRatio(r, qi(slotted), form);
  }
  if (eq(v, mk(K.a, K.b)!) && !eq(v, t)) return unsure(WHY.givenRatio, form);
  return judgeMissingRatio(r, v, form);
}

/** A missing ratio term judged as a number: the truth is right, a slip's value is wrong with it, anything else wrong. */
function judgeMissingRatio(r: ReadOk, v: Q, form: Reading["form"]): SchoolVerdict {
  if (eq(v, r.truth)) return { verdict: "right", form, why: WHY.right };
  const named = slipCandidates(r).filter(([, c]) => !eq(c, r.truth)).find(([, c]) => eq(c, v));
  return named ? { verdict: "wrong", slip: named[0], form, why: WHY.slip } : { verdict: "wrong", form, why: WHY.wrong };
}

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
 * A `ratio` spec (W7 batch 3) is judged by `checkRatio`: its answer may be a ratio or a pair of amounts.
 * The `why` is a fixed sentence of the desk's, with no value in it.
 */
export function check(spec: unknown, writing: unknown, system: unknown): SchoolVerdict {
  try {
    const r = read(spec);
    if (!r.ok) return { verdict: "unsure", why: WHY.badSpec };
    if (typeof writing !== "string" || !writing.trim()) return { verdict: "unsure", why: WHY.empty };
    // W7 batch 3: a ratio question may be answered by a ratio or a pair, which only its own reader reads
    if (r.kind.k === "ratio-simplify" || r.kind.k === "ratio-share" || r.kind.k === "ratio-missing") return checkRatio(r, writing, system);
    const reading = readNumber(writing, system);
    if (!reading) return { verdict: "unsure", why: WHY.unreadable };
    const form = reading.form;
    if (reading.kind === "ratio") return { verdict: "unsure", form, why: WHY.ratio };
    const unit = specUnit(r.spec);
    // W7 batch 3: an area written with a length unit (28 cm for 28 cm2) is UNSURE, never wrong - the desk does not teach
    // units by marking them wrong; the value is judged only bare or with its own square unit
    if (r.kind.k === "area" && reading.unit && ["cm", "m", "mm", "km"].includes(reading.unit)) return { verdict: "unsure", form, why: WHY.lengthUnit };
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
    // W7 batch 2: an amount written with a percent sign - 28% for 35% of 80 = 28, or 2800% (equal in value, from 35 × 80) -
    // is the right number in the wrong form, or a slip: the desk does not guess, and never calls it right
    if ((K.k === "pct-of" || K.k === "pct-change") && form === "percent" && (eq(mul(v, qi(BigInt(100))), t) || eq(v, t))) return { verdict: "unsure", form, why: WHY.amountAsPercent };
    // W7 batch 3: an amount of these units is never a percentage (unsure, the desk does not guess what was meant); a cost's
    // value in cents or pence written bare (560 for €5.60) is the answer in another unit or a slip, and the desk does not guess
    if ((K.k === "rate" || K.k === "area" || K.k === "stat" || K.k === "pyth") && form === "percent") return { verdict: "unsure", form, why: WHY.amountAsPercent };
    if (K.k === "rate" && K.measure === "cost" && !reading.unit && !eq(v, t) && eq(v, mul(t, qi(BigInt(100))))) return { verdict: "unsure", form, why: WHY.pence };
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

// ------------------------------------------------------------------ which slips an item shows

/** A value as a worksheet writes it: a whole number or a terminating decimal ('12', '0.035', '-5'), or null. */
function plainText(c: Q): string | null {
  if (!terminating(c)) return null;
  const k = placesNeeded(c), neg = c.n < Z, digits = (babs(c.n) * pow10(k) / c.d).toString().padStart(k + 1, "0");
  return (neg ? "-" : "") + (k === 0 ? digits : `${digits.slice(0, -k)}.${digits.slice(-k)}`);
}

/** The ways a value can be written down for `check` to read: plain, as a percent, as a fraction. */
function writingsOf(c: Q): string[] {
  const out: string[] = [], plain = plainText(c), pct = plainText(mul(c, qi(BigInt(100))));
  if (plain !== null) out.push(plain);
  if (pct !== null) out.push(`${pct}%`);
  if (c.d !== ONE) out.push(`${c.n}/${c.d}`);
  return out;
}

/** The pairs a ratio question's own judge names (checkRatio), by slip id, as the two numbers a child would write. */
function slippedPairs(r: ReadOk, slipId: string): [Q, Q][] {
  const K = r.kind;
  if (K.k === "ratio-simplify") return slipId === "ratio-swapped" ? [[qi(r.truth.d), qi(r.truth.n)]] : [];
  if (K.k !== "ratio-share") return [];
  const T = qi(K.T), a = qi(K.a), b = qi(K.b), d = qi(babs(K.a - K.b));
  const pair = r.pair ?? [a, b];
  if (slipId === "ratio-swapped") return [[pair[1], pair[0]]];
  if (K.a === K.b) return [];
  if (slipId === "ratio-split-each") return [[div(T, a)!, div(T, b)!]];
  if (slipId === "ratio-as-amounts") return [[a, b]];
  if (slipId === "ratio-by-difference") return [[mul(div(T, d)!, a), mul(div(T, d)!, b)]];
  return [];
}

/**
 * The answer a child who made the slip `slipId` would write for this spec, as text `check` reads, or null when the slip
 * does not show on it. Pinned to `check` itself: a text is returned only when `check(spec, text, "uk")` is wrong and names
 * exactly this slip, so a slip "shows" on a spec precisely when the desk would name it. Pure; a junk spec, an unknown id or
 * another unit's slip is null, never a throw.
 */
export function slipValue(spec: unknown, slipId: unknown): string | null {
  if (typeof slipId !== "string") return null;
  try {
    const r = read(spec);
    if (!r.ok) return null;
    const writings: string[] = [];
    for (const [x, y] of slippedPairs(r, slipId)) {
      const xs = writingsOf(x), ys = writingsOf(y);
      for (let i = 0; i < Math.min(xs.length, ys.length); i++) writings.push(`${xs[i]}:${ys[i]}`);
    }
    for (const [id, c] of slipCandidates(r)) if (id === slipId && !eq(c, r.truth)) writings.push(...writingsOf(c));
    for (const w of writings) {
      const v = check(spec, w, DEFAULT_SCHOOL_SYSTEM);
      if (v.verdict === "wrong" && v.slip === slipId) return w;
    }
    return null;
  } catch {
    return null;
  }
}

/** Does the slip `slipId` show on this spec: would `check` name it for the answer that slip gives? */
export const slipShows = (spec: unknown, slipId: unknown): boolean => slipValue(spec, slipId) !== null;

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
  /** A ratio share (W7 batch 3): the two amounts. A ratio in a hint gives the answer away only as these two, in either order. */
  pair?: [Q, Q];
  /** A ratio to simplify (W7 batch 3): a ratio in a hint that is not in lowest terms (6:9 for 12:18) is a step, not the answer. */
  ratioLowest?: boolean;
  /** Values beside T that an operation in the hint must not make (rule 6): a share's second amount. */
  alsoT?: Q[];
}

function leakProfile(r: ReadOk): LeakProfile {
  const T = qabs(r.truth);
  const whole = T.n / T.d, fracPart = T.n > T.d && T.d !== ONE ? mk(T.n - whole * T.d, T.d)! : null;
  const targets = fracPart ? [T, fracPart] : [T];
  const K = r.kind;
  if (K.k === "ratio-simplify") {
    // W7 batch 3: the value p/q of the lowest ratio in any form, the ratio p:q itself, and p and q alone (above 1): each is
    // the answer; the given ratio or any equal one not in lowest terms (6:9, 12/18) is the question or a step on the way
    const bare = new Set([T.n, T.d].filter((x) => x > ONE).map(String));
    return { T, targets: [T], lowestOnly: true, ratioLowest: true, bare, restated: [], written: [] };
  }
  if (K.k === "ratio-share") {
    // W7 batch 3: either amount alone, or both as a ratio; the size of a single part (T ÷ (a + b)) is a step and passes
    const [s1, s2] = r.pair!;
    return { T: s1, targets: [s1, s2], lowestOnly: false, bare: new Set(), restated: [], written: [], pair: [s1, s2], alsoT: [s2] };
  }
  if (K.k === "stat") {
    // W7 batch 3: the mean or range in any form (and, not whole, its digits with the point left out). The total, the count,
    // the largest and the smallest are steps and pass; the last step - the total over the count, the largest less the
    // smallest - makes the answer and is refused (rule 6), with no question operation to restate
    const bare = new Set<string>();
    if (T.d !== ONE) bare.add(String(mul(T, qi(pow10(placesNeeded(T)))).n));
    return { T, targets: [T], lowestOnly: false, bare, restated: [], written: [] };
  }
  if (K.k === "area") {
    // W7 batch 3: the value in any form (and, not whole, its digits with the point left out); a rectangle's own a × b is
    // the question as an operation and passes, as "0.35 × 80" does for a percent - its result is refused; a part area, a
    // triangle's bh before the halving, the lengths themselves are steps and pass
    const bare = new Set<string>();
    if (T.d !== ONE) bare.add(String(mul(T, qi(pow10(placesNeeded(T)))).n));
    const restated: LeakProfile["restated"] = K.fig === "rectangle" ? [{ p: K.sides[0], o: "×", q: K.sides[1], both: true }] : [];
    return { T, targets: [T], lowestOnly: false, bare, restated, written: [] };
  }
  if (K.k === "pyth") {
    // M2b: the side in any form. The squares, their sum or difference, and the given sides are steps and pass; the root of the
    // last step makes the answer and is refused (rule 6 needs no restated operation: the question holds none)
    return { T, targets: [T], lowestOnly: false, bare: new Set(), restated: [], written: [] };
  }
  if (K.k === "rate") {
    // W7 batch 3: the value in any form; its digits with the point left out (56 for 5.60) and a cost in cents or pence (560)
    // are the answer too. The value of a single one is a step and passes; so does p ÷ q1 when a single one is what is asked
    // (the question's own division, as "0.35 × 80" is a percent's) - its result is still refused
    const bare = new Set<string>();
    if (T.d !== ONE) bare.add(String(mul(T, qi(pow10(placesNeeded(T)))).n));
    if (K.measure === "cost") { const c = mul(T, qi(BigInt(100))); if (c.d === ONE) bare.add(String(c.n)); }
    const restated: LeakProfile["restated"] = K.q2 === ONE ? [{ p: K.p, o: "÷", q: qi(K.q1), both: false }] : [];
    return { T, targets: [T], lowestOnly: false, bare, restated, written: [] };
  }
  if (K.k === "ratio-missing") {
    // W7 batch 3: the missing term, and the completed ratio written out (10:15 for 2:3 = ?:15)
    const [p, q] = K.slot === "first" ? [T.n, K.known] : [K.known, T.n];
    return { T, targets: [T], lowestOnly: false, bare: new Set(), restated: [], written: [new RegExp(`(?<![\\d.,/:])${p}\\s*:\\s*${q}(?![\\d.,])`)] };
  }
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
  if (K.k === "pct-of") {
    // W7 batch 2: p% of N restated as p/100 × N or "p% of N" is the question; its working p × N (2800 for 35% of 80) is
    // the answer's digits; ten percent (8) or any other first step is no leak
    const H = qi(BigInt(100)), bare = new Set<string>(), h = mul(T, H);
    if (h.d === ONE) bare.add(String(h.n));
    return { T, targets: [T], lowestOnly: false, bare, restated: [{ p: div(K.p, H)!, o: "×", q: qi(K.N), both: true }], written: [] };
  }
  if (K.k === "pct-change") {
    // W7 batch 2: B × 1.15 (or × 115%, × 0.75) is the question as a multiplier, the method; p% of B, the change, is a
    // step and passes; B with the change added or taken off, and B × (100 ± p) as whole numbers (6900), give it away
    const H = qi(BigInt(100)), bare = new Set<string>(), h = mul(T, H);
    if (h.d === ONE) bare.add(String(h.n));
    const factor = div(K.up ? add(H, K.p) : sub(H, K.p), H)!;
    return { T, targets: [T], lowestOnly: false, bare, restated: [{ p: qi(K.base), o: "×", q: factor, both: true }], written: [] };
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
        // W7 batch 3: a share's amounts as a ratio, either order; a ratio to simplify only in lowest terms
        if (pr.pair) return (eq(p, pr.pair[0]) && eq(q, pr.pair[1])) || (eq(p, pr.pair[1]) && eq(q, pr.pair[0]));
        if (pr.ratioLowest && !(p.d === ONE && q.d === ONE && p.n > Z && q.n > Z && bgcd(p.n, q.n) === ONE)) return false;
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
    /** The answer an operation must not make: T, and (W7 batch 3) a share's second amount. */
    const isT = (v: Q) => eq(v, T) || (pr.alsoT ?? []).some((x) => eq(v, x));
    for (let i = 0; i + 1 < runs.length; i++) {
      const j = joinAt(i);
      if (!j) continue;
      for (const x of runs[i].values) for (const y of runs[i + 1].values) {
        const [p, q, o] = orient(j, x, y);
        const v = apply(o, p, q);
        if (!v || isRestated(p, o, q)) continue;
        if (isT(qabs(v)) || (p.d === ONE && q.d === ONE && v.d === ONE && pr.bare.has(String(babs(v.n))))) return true;
      }
      // three numbers chained by × and ÷: the whole working of a missing number or a fraction of an amount in one line
      // ("40 ÷ 5 × 3"), unless the chain is the question in other words ("3 lots of a fifth of 40" is 3/5 of 40)
      const k = i + 2 < runs.length ? joinAt(i + 1) : null;
      if ((j === "×" || j === "÷") && (k === "×" || k === "÷")) {
        for (const x of runs[i].values) for (const y of runs[i + 1].values) for (const z of runs[i + 2].values) {
          const xy = apply(j, x, y), yz = apply(k, y, z), v = xy && apply(k, xy, z);
          if (!v || !isT(qabs(v))) continue;
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
  // a share (W7 batch 3) has two answers, and neither may be printed
  if (r.pair && r.pair.some((x) => x.d === ONE && nums.includes(x.n))) return false;
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
 * fraction to decimal or percent, decimal to fraction or percent, percent to decimal or fraction) turns with the seed,
 * so a set's consecutive seeds ask different conversions:
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
    // the conversion turns with the seed, so the consecutive seeds of one set ask different ones
    const [from, to] = CONVERSIONS[((seed as number) + t) % CONVERSIONS.length];
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

/** The percents built in one or two moves from ten percent, a half or a quarter (tier 1 of the percent units). */
const FRIENDLY_PERCENTS: readonly number[] = [5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
/** The units a tier-2 percent item's amount may carry: money in six of ten, then weights, lengths and capacities. */
const PERCENT_UNITS: readonly Unit[] = ["€", "£", "€", "£", "€", "£", "kg", "m", "l", "$"];

/**
 * One "A percent of an amount" item, from a seed and a tier that code computed:
 *   - tier 1: a friendly percent (5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90: from ten percent, a half or a quarter)
 *     of a multiple of 20 up to 400, so the answer is whole, no unit: "Find 30% of 140.";
 *   - tier 2: any other whole percent 1..99, or one in five a half percent 0.5..39.5, of a multiple of 10 up to 500 (of 20
 *     for a half percent), so the answer has at most one decimal place, with a unit - money in most: "Find 35% of €80.".
 * An answer that is a number the question prints is drawn again. Pure and seeded; null for a bad seed or tier.
 */
export function genPercentOf(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed1306);
  if (!rnd) return null;
  function pick<T>(xs: readonly T[]): T { return xs[Math.floor(rnd!() * xs.length)]; }
  const int = (lo: number, hi: number) => lo + Math.floor(rnd!() * (hi - lo + 1));
  for (let t = 0; t < MAX_TRIES; t++) {
    let spec: SchoolSpec;
    if (tier === 1) spec = { shape: "percent-of", expr: `${pick(FRIENDLY_PERCENTS)}% of ${20 * int(1, 20)}` };
    else {
      const half = rnd() < 0.2, whole = int(1, 99);
      if (!half && FRIENDLY_PERCENTS.includes(whole)) continue;
      spec = half ? { shape: "percent-of", expr: `${int(0, 39)}.5% of ${20 * int(1, 25)}`, unit: pick(PERCENT_UNITS) } : { shape: "percent-of", expr: `${whole}% of ${10 * int(1, 50)}`, unit: pick(PERCENT_UNITS) };
    }
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "percent-of", expr: "25% of 80" } : { shape: "percent-of", expr: "35% of 80", unit: "€" };
}

/**
 * One "Percent increase and decrease" item, from a seed and a tier that code computed; up or down by the seed:
 *   - tier 1: a friendly percent (the list of a percent of an amount) of a multiple of 20 up to 400, so the new amount
 *     is whole, no unit: "Increase 60 by 25%.", "Decrease 140 by 30%.";
 *   - tier 2: any other whole percent 1..60, or one in five a half percent 0.5..19.5, of a multiple of 10 up to 500 (of
 *     20 for a half percent), an answer to at most one place, with a unit - money in most: "Increase €60 by 15%.".
 * The change is always applied to the whole (never a reverse percentage); an answer that is a number the question
 * prints is drawn again. Pure and seeded; null for a bad seed or tier.
 */
export function genPercentChange(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed1407);
  if (!rnd) return null;
  function pick<T>(xs: readonly T[]): T { return xs[Math.floor(rnd!() * xs.length)]; }
  const int = (lo: number, hi: number) => lo + Math.floor(rnd!() * (hi - lo + 1));
  for (let t = 0; t < MAX_TRIES; t++) {
    const verb = rnd() < 0.5 ? "increase" : "decrease";
    let spec: SchoolSpec;
    if (tier === 1) spec = { shape: "percent-change", expr: `${verb} ${20 * int(1, 20)} by ${pick(FRIENDLY_PERCENTS)}%` };
    else {
      const half = rnd() < 0.2, whole = int(1, 60);
      if (!half && FRIENDLY_PERCENTS.includes(whole)) continue;
      spec = half ? { shape: "percent-change", expr: `${verb} ${20 * int(1, 25)} by ${int(0, 19)}.5%`, unit: pick(PERCENT_UNITS) } : { shape: "percent-change", expr: `${verb} ${10 * int(1, 50)} by ${whole}%`, unit: pick(PERCENT_UNITS) };
    }
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "percent-change", expr: "increase 60 by 25%" } : { shape: "percent-change", expr: "increase 60 by 15%", unit: "€" };
}

// ------------------------------------------------------------------ the W7 batch 3 generators: ratio, rates, area, mean and range

/** Two different whole numbers lo..hi with no common factor, as a ratio in lowest terms. */
function ratioPairs(lo: number, hi: number): [number, number][] {
  const out: [number, number][] = [];
  for (let p = lo; p <= hi; p++) for (let q = lo; q <= hi; q++) if (p !== q && gcdN(p, q) === 1) out.push([p, q]);
  return out;
}
/** The units a tier-2 share's amount may carry: money in most, then weights, lengths and capacities (as a fraction of an amount). */
const SHARE_UNITS: readonly Unit[] = ["€", "£", "€", "£", "kg", "g", "m", "ml", "l", "min"];

/**
 * One "Ratio and sharing" item, from a seed and a tier that code computed:
 *   - tier 1, equal ratios, turning with the seed: simplify a ratio p:q in lowest terms (1..9, the two different) scaled by
 *     a common factor 2..9 ("Write 12:18 in its simplest form."), or fill in a missing term when p:q (2..9) is scaled UP by
 *     2..6 ("2:3 = ?:15", "2:3 = 10:?"), the new numbers at most 60;
 *   - tier 2, sharing: an amount shared in a two-part ratio a:b in lowest terms (2..9 each, different), the amount (a + b)
 *     times 2..60, at most 500, whole shares; one in three with a unit, money in most ("Share €60 in the ratio 2:3.").
 * A simplify item is drawn again when an answer part above 1 divides the scale factor (a hint may name "divide both by 3",
 * a number of the answer); a missing term when it is the scale factor. Neither part of a share is 1 part, so the size of a
 * single part - the legal first step - is never one of the answers. Nothing the question prints is an answer (`fair`).
 * Pure and seeded; null for a bad seed or tier.
 */
export function genRatio(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed1508);
  if (!rnd) return null;
  function pick<T>(xs: readonly T[]): T { return xs[Math.floor(rnd!() * xs.length)]; }
  const int = (lo: number, hi: number) => lo + Math.floor(rnd!() * (hi - lo + 1));
  for (let t = 0; t < MAX_TRIES; t++) {
    let spec: SchoolSpec;
    // the kind turns with the seed alone, never with a retry, so a set's consecutive seeds keep their mix
    if (tier === 1 && (seed as number) % 2 === 0) {
      const [p, q] = pick(ratioPairs(1, 9)), k = int(2, 9);
      if ((p > 1 && k % p === 0) || (q > 1 && k % q === 0)) continue;
      spec = { shape: "ratio", expr: `${p * k}:${q * k}` };
    } else if (tier === 1) {
      const [p, q] = pick(ratioPairs(2, 9)), k = int(2, 6);
      if (p * k > 60 || q * k > 60) continue;
      const first = rnd() < 0.5, answer = first ? p * k : q * k;
      if (answer === k) continue;
      spec = { shape: "ratio", expr: first ? `${p}:${q} = ?:${q * k}` : `${p}:${q} = ${p * k}:?` };
    } else {
      const [a, b] = pick(ratioPairs(2, 9)), k = int(2, 60), T = k * (a + b);
      if (T > 500) continue;
      spec = rnd() < 1 / 3 ? { shape: "ratio", expr: `${T} in ${a}:${b}`, unit: pick(SHARE_UNITS) } : { shape: "ratio", expr: `${T} in ${a}:${b}` };
    }
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "ratio", expr: "12:18" } : { shape: "ratio", expr: "60 in 2:3" };
}

/** The items a generated cost prices: the short ones, so a question stays one printed row. */
const GEN_NOUNS: readonly string[] = ["pens", "books", "cards", "eggs", "cups", "kg"];

/**
 * One "Unit rates and direct proportion" item, from a seed and a tier that code computed; two in three a cost ("5 pens cost
 * €3.50. What do 8 pens cost?") and one in three a distance at a steady speed ("240 km in 3 hours. How far in 5 hours?"),
 * turning with the seed; one in three asks the value of a single one (the unit rate itself: "What does 1 kg cost?"):
 *   - tier 1: the value of a single one is a WHOLE number: a price of €2..£12 an item for 2..10 items, or a speed of 20..90
 *     km an hour (a multiple of 5) for 2..5 hours; the question asks about 1 or 2..12 items, 1..8 hours;
 *   - tier 2: the value of a single one is NOT whole: a price in euros or pounds and cents or pence (€0.05..€9.95, never
 *     whole) for 2..12 items, or a speed ending in a half (20.5..95.5 km an hour) for 2, 4, 6 or 8 hours; the question asks
 *     about 1 or 2..15 items, 1..9 hours. The working carries decimals.
 * The asked number is never the given one; an answer the question prints is drawn again (`fair`). Pure and seeded; null
 * for a bad seed or tier.
 */
export function genRate(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed1609);
  if (!rnd) return null;
  function pick<T>(xs: readonly T[]): T { return xs[Math.floor(rnd!() * xs.length)]; }
  const int = (lo: number, hi: number) => lo + Math.floor(rnd!() * (hi - lo + 1));
  for (let t = 0; t < MAX_TRIES; t++) {
    const distance = (seed as number) % 3 === 2, single = rnd() < 1 / 3; // by the seed alone, never a retry
    let spec: SchoolSpec;
    if (distance) {
      // a speed in half kilometres an hour: whole at tier 1 (a multiple of 5), a half at tier 2
      const half2 = tier === 1 ? 10 * int(4, 18) : 2 * int(20, 95) + 1, h1 = tier === 1 ? int(2, 5) : pick([2, 4, 6, 8]);
      const h2 = single ? 1 : int(2, tier === 1 ? 8 : 9);
      if (h2 === h1) continue;
      spec = { shape: "rate", expr: `${(half2 * h1) / 2} km in ${h1} h, ${h2}`, unit: "km" };
    } else {
      // a price in cents or pence: a whole number of euros or pounds at tier 1, not at tier 2
      const cents = tier === 1 ? 100 * int(2, 12) : int(5, 995), q1 = int(2, tier === 1 ? 10 : 12);
      if (tier === 2 && cents % 100 === 0) continue;
      const q2 = single ? 1 : int(2, tier === 1 ? 12 : 15);
      if (q2 === q1) continue;
      const total = cents * q1, price = total % 100 === 0 ? String(total / 100) : decimalText(total, 2);
      spec = { shape: "rate", expr: `${q1} ${pick(GEN_NOUNS)} cost ${price}, ${q2}`, unit: pick(MONEY) };
    }
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "rate", expr: "4 books cost 12, 7", unit: "€" } : { shape: "rate", expr: "5 pens cost 3.50, 8", unit: "€" };
}

/**
 * One "Area of rectangles, triangles and composite shapes" item, from a seed and a tier that code computed, the shape
 * turning with the seed:
 *   - tier 1: a rectangle with whole sides 2..12 (one in four in metres, m2) or a triangle with a whole base 2..16 and
 *     height 2..12 whose area is whole (base × height even), in cm2;
 *   - tier 2: two rectangles joined (sides 2..9, their areas added), a triangle whose area ends in a half (base × height
 *     odd: base 3..15, height 3..11), or a rectangle with one side a half (2.5..11.5 by an even 2..12, a whole area); cm2,
 *     the rectangle one in four in m2.
 * Drawn again: a square whose sides added give its area (4 by 4: 2(a + b) = ab), any known wrong method that gives the
 * right value, and an answer the question prints. Pure and seeded; null for a bad seed or tier.
 */
export function genArea(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed170a);
  if (!rnd) return null;
  const int = (lo: number, hi: number) => lo + Math.floor(rnd!() * (hi - lo + 1));
  for (let t = 0; t < MAX_TRIES; t++) {
    const turn = (seed as number) % (tier === 1 ? 2 : 3), metres = rnd() < 0.25; // by the seed alone, never a retry
    let spec: SchoolSpec;
    if (tier === 1 && turn === 0) spec = { shape: "area", expr: `rectangle ${int(2, 12)} by ${int(2, 12)}`, unit: metres ? "m2" : "cm2" };
    else if (tier === 1) {
      const b = int(2, 16), h = int(2, 12);
      if ((b * h) % 2 !== 0) continue;
      spec = { shape: "area", expr: `triangle base ${b} height ${h}`, unit: "cm2" };
    } else if (turn === 0) {
      const [a, b, c, d] = [int(2, 9), int(2, 9), int(2, 9), int(2, 9)];
      if (a * b === c * d) continue;
      spec = { shape: "area", expr: `rectangles ${a} by ${b} and ${c} by ${d}`, unit: "cm2" };
    } else if (turn === 1) {
      const b = int(3, 15), h = int(3, 11);
      if ((b * h) % 2 === 0) continue;
      spec = { shape: "area", expr: `triangle base ${b} height ${h}`, unit: "cm2" };
    } else spec = { shape: "area", expr: `rectangle ${int(2, 11)}.5 by ${2 * int(1, 6)}`, unit: metres ? "m2" : "cm2" };
    const r = read(spec);
    if (!r.ok || slipCandidates(r).some(([, c]) => eq(c, r.truth))) continue;
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "area", expr: "rectangle 7 by 4", unit: "cm2" } : { shape: "area", expr: "rectangles 8 by 3 and 4 by 2", unit: "cm2" };
}

/**
 * One "Mean and range" item, from a seed and a tier that code computed, a mean or a range turning with the seed (half and
 * half at tier 1, two means in three at tier 2), the list printed in the order drawn, never sorted:
 *   - tier 1: four or five numbers 1..20 with a WHOLE mean, or their range;
 *   - tier 2: four to six numbers 2..60 whose mean is NOT whole but ends within two places (a quarter, a fifth, a half), or
 *     the range of six numbers 2..99.
 * Drawn again: an answer the list prints, a mean equal to the middle value (the median slip would give it) or to the count
 * (a hint may say "divide by 5"), any known wrong method that gives the right value. Pure and seeded; null for a bad seed or tier.
 */
export function genStat(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed180b);
  if (!rnd) return null;
  const int = (lo: number, hi: number) => lo + Math.floor(rnd!() * (hi - lo + 1));
  for (let t = 0; t < MAX_TRIES; t++) {
    const range = tier === 1 ? (seed as number) % 2 === 1 : (seed as number) % 3 === 2; // by the seed alone, never a retry
    const n = tier === 1 ? int(4, 5) : range ? 6 : int(4, 6), [lo, hi] = tier === 1 ? [1, 20] : range ? [2, 99] : [2, 60];
    const xs = Array.from({ length: n }, () => int(lo, hi)), total = xs.reduce((a, b) => a + b, 0);
    if (!range && (tier === 1 ? total % n !== 0 : total % n === 0)) continue;
    const spec: SchoolSpec = { shape: "stat", expr: `${range ? "range" : "mean"} ${xs.join(", ")}` };
    const r = read(spec);
    if (!r.ok || slipCandidates(r).some(([, c]) => eq(c, r.truth))) continue;
    // a mean equal to the count: "divide by how many there are" would name the answer
    if (!range && eq(r.truth, qi(BigInt(n)))) continue;
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "stat", expr: "mean 4, 7, 9, 12" } : { shape: "stat", expr: "mean 4, 7, 9, 10" };
}

// ------------------------------------------------------------------ the v2 M2b generators: Pythagoras' theorem, probability

/** Every right-angled triangle with whole sides a < b < c and c at most 100 (the primitive triples and their multiples). */
const TRIPLES: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  for (let c = 5; c <= 100; c++) for (let a = 3; a < c; a++) { const b2 = c * c - a * a, b = Math.round(Math.sqrt(b2)); if (b > a && b < c && b * b === b2) out.push([a, b, c]); }
  return out;
})();

/**
 * One "Pythagoras' theorem" item, from a seed and a tier that code computed (a table of whole triples, never a root):
 *   - tier 1: the longest side from the two shorter sides, the triple's longest at most 50 ("longest 6 8");
 *   - tier 2: a shorter side from the longest side and the other shorter side, the longest at most 100 ("shorter 10 6").
 * The unit is cm in half, mm and metres in a quarter each; the given sides turn round with the seed's draw. Drawn again: an item
 * on which any listed slip of its kind has no value of its own (every generated item shows every slip of its kind) and an answer
 * the question prints. Pure and seeded; null for a bad seed or tier.
 */
export function genPythagoras(seed: unknown, tier: unknown): SchoolSpec | null {
  const rnd = seeded(seed, tier, 0x5eed2b02);
  if (!rnd) return null;
  const pool = tier === 1 ? TRIPLES.filter(([, , c]) => c <= 50) : TRIPLES;
  for (let t = 0; t < MAX_TRIES; t++) {
    const [a, b, c] = pool[Math.floor(rnd() * pool.length)], u = rnd(), flip = rnd() < 0.5;
    const unit: Unit = u < 0.5 ? "cm" : u < 0.75 ? "mm" : "m";
    const spec: SchoolSpec = tier === 1 ? { shape: "pythagoras", expr: `longest ${flip ? b : a} ${flip ? a : b}`, unit } : { shape: "pythagoras", expr: `shorter ${c} ${flip ? a : b}`, unit };
    const r = read(spec);
    if (!r.ok || slipCandidates(r).length !== (tier === 1 ? 2 : 3)) continue;
    if (fair(spec)) return spec;
  }
  return tier === 1 ? { shape: "pythagoras", expr: "longest 6 8", unit: "cm" } : { shape: "pythagoras", expr: "shorter 10 6", unit: "cm" };
}

/**
 * The units of v2 M2b, beyond the school path, with their generators. They join SCHOOL_GENERATORS (and the path) only when
 * the sweep passes (tools/gcse-units-test.cjs): a unit that fails stays out of this table's spread there, its code kept.
 */
export const GCSE_GENERATORS: Readonly<Record<string, (seed: number, tier: 1 | 2) => SchoolSpec | null>> = {
  "pythagoras": (seed, tier) => genPythagoras(seed, tier),
};

/**
 * The units whose practice sets code writes, by syllabus topic id, each with its generator (Family W5b: add and
 * subtract fractions; W7 batch 1: equivalent fractions, a fraction of an amount, multiply and divide fractions; W7 batch
 * 2: decimals and percent; W7 batch 3: ratio and sharing, unit rates, area, mean and range). A topic not here is written as
 * it always was.
 */
export const SCHOOL_GENERATORS: Readonly<Record<string, (seed: number, tier: 1 | 2) => SchoolSpec | null>> = {
  "frac-equivalent": (seed, tier) => genEquivalent(seed, tier),
  "frac-of-amount": (seed, tier) => genOfAmount(seed, tier),
  "frac-add-sub": (seed, tier) => gen(seed, tier),
  "frac-mul-div": (seed, tier) => genMulDiv(seed, tier),
  "dec-arith": (seed, tier) => genDecimal(seed, tier),
  "dec-convert": (seed, tier) => genConvert(seed, tier),
  "pct-of-amount": (seed, tier) => genPercentOf(seed, tier),
  "pct-change": (seed, tier) => genPercentChange(seed, tier),
  "ratio-share": (seed, tier) => genRatio(seed, tier),
  "unit-rate": (seed, tier) => genRate(seed, tier),
  "area": (seed, tier) => genArea(seed, tier),
  "mean-range": (seed, tier) => genStat(seed, tier),
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
  "pct-of-amount": ["pct-divided", "pct-times-whole", "pct-ten-stopped", "pct-rest"],
  "pct-change": ["change-only", "change-wrong-way", "change-as-number"],
  "ratio-share": ["ratio-split-each", "ratio-as-amounts", "ratio-swapped", "ratio-by-difference", "ratio-added-same"],
  "unit-rate": ["rate-wrong-way", "rate-multiplied", "rate-other-quantity"],
  "area": ["area-added-sides", "area-no-half", "area-one-part"],
  "mean-range": ["stat-not-divided", "stat-wrong-count", "stat-median", "range-largest", "range-backwards"],
  // v2 M2b: the units beyond the school path (a slip of a kind with no exact value is not listed: the rooted squares-added slip)
  "pythagoras": ["pyth-sides-added", "pyth-no-root", "pyth-squares-added"],
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
 * A percent of an amount (W7 batch 2): 'Find 35% of 80', 'What is 15% of €60?', '12% of 250 kg', 'Find 35 percent of 80
 * sweets', after the same verbs as a fraction of an amount; the amount as `amountOf` reads it; or null.
 */
function readPercentOf(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.?!]$/, "").trim().replace(new RegExp(String.raw`^${VERB_SRC}\s*:?\s+`, "i"), "");
  const m = new RegExp(String.raw`^${PCT_SRC}\s?(?:%|percent|per cent)\s+of\s+(.+)$`, "i").exec(t);
  if (!m) return null;
  const got = amountOf(m[2].trim());
  if (!got) return null;
  const spec: SchoolSpec = { shape: "percent-of", expr: `${m[1]}% of ${got.N}`, ...(got.unit ? { unit: got.unit } : {}) };
  return read(spec).ok ? spec : null;
}

/** The percent after "by" in a change: '15%', '15 %', '15 percent', '12.5 per cent'. */
const BY_PCT = String.raw`\s+by\s+${PCT_SRC}\s?(?:%|percent|per cent)$`;
/**
 * A percent increase or decrease (W7 batch 2): 'Increase 60 by 15%', 'Decrease €80 by 25%', 'Reduce 250 kg by 12%', 'What
 * is 60 increased by 15%?', 'Work out 80 decreased by 25 percent'; the amount as `amountOf` reads it; or null. A reverse
 * percentage, a second change, a word problem and a change with no percent sign are all null.
 */
function readPercentChange(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.?!]$/, "").trim();
  let verb: string, amount: string, p: string;
  let m = new RegExp(String.raw`^(increase|decrease|reduce)\s+(.+?)${BY_PCT}`, "i").exec(t);
  if (m) [verb, amount, p] = [m[1], m[2], m[3]];
  else if ((m = new RegExp(String.raw`^(?:${VERB_SRC}\s*:?\s*)?(.+?)\s+(increased|decreased|reduced)${BY_PCT}`, "i").exec(t))) [amount, verb, p] = [m[1], m[2], m[3]];
  else return null;
  const got = amountOf(amount.trim());
  if (!got) return null;
  const up = /^increase/i.test(verb);
  const spec: SchoolSpec = { shape: "percent-change", expr: `${up ? "increase" : "decrease"} ${got.N} by ${p}%`, ...(got.unit ? { unit: got.unit } : {}) };
  return read(spec).ok ? spec : null;
}

/** A two-part ratio as a worksheet prints it: whole numbers up to three digits, a colon, spaces allowed around it. */
const RATIO_SRC = String.raw`([1-9]\d{0,2})\s*:\s*([1-9]\d{0,2})`;
/** A missing ratio term's placeholder: '?', a box or underscores, or a number. */
const RGAP_SRC = String.raw`(\?|□|☐|▢|_+|[1-9]\d{0,2})`;

/**
 * A ratio task (W7 batch 3, "Ratio and sharing"), or null: 'Simplify 12:18' (optionally 'the ratio', 'fully', 'completely',
 * 'to its simplest form', 'to lowest terms'), 'Write / Express 12:18 in its simplest form'; 'Share 60 in the ratio 2:3',
 * 'Divide £60 in the ratio 2:3', 'Split 60 kg in the ratio 2 : 3' (the amount as `amountOf` reads it); '2:3 = ?:15' or
 * '2:3 = 10:?' after an optional 'Fill in the missing number:', 'Complete:', 'Copy and complete'. A bare '12:18' is null (in
 * cz and de ':' also divides), as are three-part ratios, decimals, who shares with whom (a word problem) and a spec
 * wellFormed refuses (a ratio already in lowest terms, shares that are not whole, two gaps).
 */
function readRatio(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.!]$/, "").trim();
  const LOW = String.raw`(?:its\s+)?(?:simplest form|lowest terms)`;
  const simplify = [
    new RegExp(String.raw`^(?:simplify|reduce)(?:\s+the\s+ratio)?\s*:?\s*${RATIO_SRC}(?:\s+(?:fully|completely|to\s+${LOW}))?$`, "i"),
    new RegExp(String.raw`^(?:write|express|give|put)(?:\s+the\s+ratio)?\s+${RATIO_SRC}\s+in\s+${LOW}$`, "i"),
  ];
  let spec: SchoolSpec | null = null, m: RegExpExecArray | null = null;
  for (const re of simplify) if ((m = re.exec(t))) { spec = { shape: "ratio", expr: `${m[1]}:${m[2]}` }; break; }
  if (!spec && (m = new RegExp(String.raw`^(?:share|divide|split)\s+(.+?)\s+in\s+the\s+ratio\s+${RATIO_SRC}$`, "i").exec(t))) {
    const got = amountOf(m[1].trim());
    if (!got) return null;
    spec = { shape: "ratio", expr: `${got.N} in ${m[2]}:${m[3]}`, ...(got.unit ? { unit: got.unit } : {}) };
  }
  if (!spec) {
    const u = t.replace(/^(?:fill in the missing number|find the missing number|write the missing number|copy and complete|complete)\s*[:.]?\s*/i, "");
    if ((m = new RegExp(String.raw`^${RATIO_SRC}\s*=\s*${RGAP_SRC}\s*:\s*${RGAP_SRC}$`).exec(u))) {
      const gap = (x: string) => /^(?:\?|□|☐|▢|_+)$/.test(x);
      if (gap(m[3]) === gap(m[4])) return null;
      spec = { shape: "ratio", expr: `${m[1]}:${m[2]} = ${gap(m[3]) ? "?" : m[3]}:${gap(m[4]) ? "?" : m[4]}` };
    }
  }
  return spec && read(spec).ok ? spec : null;
}

/** A price in a rate task: '€3.50', '£3.50', '3.50 euros', '30 euro' (pounds is money or weight: never read). */
const RATE_PRICE = String.raw`(?:([€£])\s?((?:0|[1-9]\d{0,3})(?:\.\d\d)?)|((?:0|[1-9]\d{0,3})(?:\.\d\d)?)\s?(?:euros?|€))`;
/** How the question part of a cost asks it, the count and the item: 'What do 8 pens cost', 'Find the cost of 8 pens', 'What is the price of 1 kg'. */
const RATE_ASK = String.raw`(?:what\s+(?:do|does)\s+([1-9]\d{0,2})\s+([a-z]+)\s+cost|how\s+much\s+(?:do|does)\s+([1-9]\d{0,2})\s+([a-z]+)\s+cost|(?:find|what\s+is)\s+the\s+(?:cost|price)\s+of\s+([1-9]\d{0,2})\s+([a-z]+))`;

/**
 * A unit-rate task (W7 batch 3, "Unit rates and direct proportion"), or null: a statement of what a number of items cost
 * and ONE question about another number of the same items - '5 pens cost €3.50. What do 8 pens cost?', 'If 5 pens cost
 * £3.50, find the cost of 8 pens', '12 kg cost 30 euro, what is the price of 1 kg?' - the item one of RATE_NOUNS, the
 * same item (singular for one) in both; or a distance in hours and one question - '240 km in 3 hours. How far in 5 hours?',
 * '240 km takes 3 hours. How far in 1 hour at the same speed?'. A story (who buys, who travels), another item, a price
 * with no currency or in pounds, an inverse proportion, a speed asked for, and a spec wellFormed refuses are all null.
 */
function readRate(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.?!]$/, "").trim();
  let m = new RegExp(String.raw`^(?:if\s+)?([1-9]\d{0,2})\s+([a-z]+)\s+cost\s+${RATE_PRICE}\s*[.,]\s*${RATE_ASK}$`, "i").exec(t);
  if (m) {
    const [q1, noun] = [m[1], m[2].toLowerCase()], unit = (m[3] ?? "€") as Unit, price = m[4] ?? m[5];
    const q2 = m[6] ?? m[8] ?? m[10], item = (m[7] ?? m[9] ?? m[11]).toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(RATE_NOUNS, noun) || item !== (q2 === "1" ? RATE_NOUNS[noun] : noun)) return null;
    const spec: SchoolSpec = { shape: "rate", expr: `${q1} ${noun} cost ${price}, ${q2}`, unit };
    return read(spec).ok ? spec : null;
  }
  const SPEED = String.raw`(?:\s+at\s+(?:a\s+steady|the\s+same)\s+speed)?`;
  m = new RegExp(String.raw`^([1-9]\d{0,3})\s*km\s+(?:in|takes)\s+([1-9]\d{0,2})\s+hours${SPEED}\s*[.,]\s*how\s+far\s+in\s+([1-9]\d{0,2})\s+hours?${SPEED}$`, "i").exec(t);
  if (m) {
    const spec: SchoolSpec = { shape: "rate", expr: `${m[1]} km in ${m[2]} h, ${m[3]}`, unit: "km" };
    return read(spec).ok ? spec : null;
  }
  return null;
}

/** A side with its length unit in an area task: '7 cm', '7.5 cm', '7 m', '7 metres' (m[1] the number, m[2] the unit). */
const AREA_SIDE = String.raw`((?:0|[1-9]\d{0,2})(?:\.5)?)\s?(cm|centimetres?|m|metres?)`;
const areaUnitOf = (u: string): "cm" | "m" => (/^c/.test(u) ? "cm" : "m");

/**
 * An area task (W7 batch 3, "Area of rectangles, triangles and composite shapes"), or null: 'Find / Work out / Calculate /
 * What is the area of a rectangle 7 cm by 4 cm' (optionally 'measuring', or 'a 7 cm by 4 cm rectangle', or 'with length
 * 7 cm and width 4 cm'), 'the area of a triangle, base 10 cm, height 6 cm' (or 'with base 10 cm and height 6 cm'), 'the
 * total area of rectangles 8 cm by 3 cm and 4 cm by 2 cm'. Every side carries the same length unit (cm or m, the answer
 * then in cm2 or m2); sides whole or a half. A square, a circle, a perimeter, sides with no unit or with two units, a
 * third dimension, a story, and a spec wellFormed refuses are all null.
 */
function readArea(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.?!]$/, "").trim();
  const V = String.raw`^(?:find|work out|calculate|what is)\s+the\s+`, S = AREA_SIDE;
  const res: [RegExp, "rectangle" | "triangle" | "composite", number[]][] = [
    [new RegExp(String.raw`${V}area\s+of\s+a\s+rectangle\s+(?:measuring\s+)?${S}\s+by\s+${S}$`, "i"), "rectangle", [1, 3]],
    [new RegExp(String.raw`${V}area\s+of\s+an?\s+${S}\s+by\s+${S}\s+rectangle$`, "i"), "rectangle", [1, 3]],
    [new RegExp(String.raw`${V}area\s+of\s+a\s+rectangle\s+with\s+length\s+${S}\s+and\s+width\s+${S}$`, "i"), "rectangle", [1, 3]],
    [new RegExp(String.raw`${V}area\s+of\s+a\s+triangle,?\s+(?:with\s+)?base\s+${S},?\s+(?:and\s+)?height\s+${S}$`, "i"), "triangle", [1, 3]],
    [new RegExp(String.raw`${V}total\s+area\s+of\s+rectangles\s+${S}\s+by\s+${S}\s+and\s+${S}\s+by\s+${S}$`, "i"), "composite", [1, 3, 5, 7]],
  ];
  for (const [re, fig, at] of res) {
    const m = re.exec(t);
    if (!m) continue;
    const units = at.map((k) => areaUnitOf(m[k + 1].toLowerCase()));
    if (units.some((u) => u !== units[0])) return null;
    const n = at.map((k) => m[k]);
    const expr = fig === "rectangle" ? `rectangle ${n[0]} by ${n[1]}` : fig === "triangle" ? `triangle base ${n[0]} height ${n[1]}` : `rectangles ${n[0]} by ${n[1]} and ${n[2]} by ${n[3]}`;
    const spec: SchoolSpec = { shape: "area", expr, unit: units[0] === "cm" ? "cm2" : "m2" };
    return read(spec).ok ? spec : null;
  }
  return null;
}

/**
 * A mean or range task (W7 batch 3, "Mean and range"), or null: 'Work out / Find / Calculate / What is the mean (range) of
 * 4, 7, 9 and 10', 'of these numbers: 4, 7, 9, 10'; three to ten whole numbers, a comma AND a space between them (in cz and
 * de '4,7' is a decimal), 'and' before the last one or not. A median, a mode, an 'average' (which one?), a mean and a
 * range together, a decimal or a negative in the list, a letter, a missing value that gives a stated mean, a story, and a
 * spec wellFormed refuses (a mean past two places, a list of one number repeated) are all null.
 */
function readStat(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.?!]$/, "").trim(), N = String.raw`(?:0|[1-9]\d{0,2})`;
  const m = new RegExp(String.raw`^(?:work out|find|calculate|what is)\s+the\s+(mean|range)\s+of\s+(?:these numbers:\s+)?(${N}(?:, ${N})*)(?:,? and (${N}))?$`, "i").exec(t);
  if (!m) return null;
  const xs = [...m[2].split(", "), ...(m[3] !== undefined ? [m[3]] : [])];
  const spec: SchoolSpec = { shape: "stat", expr: `${m[1].toLowerCase()} ${xs.join(", ")}` };
  return read(spec).ok ? spec : null;
}

/** A side with its unit in a Pythagoras task: '6 cm', '6 mm', '6 m', '6 metres'. */
const PY_SIDE = String.raw`([1-9]\d{0,2})\s?(mm|millimetres?|cm|centimetres?|m|metres?)`;
const pyUnitOf = (u: string): Unit => (/^mm|^milli/i.test(u) ? "mm" : /^c/i.test(u) ? "cm" : "m");

/**
 * A Pythagoras task (v2 M2b), or null: 'A right-angled triangle has shorter sides 6 cm and 8 cm. Find the longest side.' or 'A
 * right-angled triangle has longest side 10 cm and a shorter side 6 cm. Find the other shorter side.' (also 'right angled', 'one
 * shorter side'); both sides carry the same unit, mm, cm or m. A diagram, a story, a hypotenuse, a decimal side, two units, and a
 * spec wellFormed refuses (no whole third side, a shorter side longer than the longest) are all null.
 */
function readPythagoras(t0: string): SchoolSpec | null {
  const t = t0.replace(/[.?!]$/, "").trim(), S = PY_SIDE, H = String.raw`^a right[- ]angled triangle has `;
  let find: "longest" | "shorter", m = new RegExp(String.raw`${H}shorter sides ${S} and ${S}\.\s*find the longest side$`, "i").exec(t);
  if (m) find = "longest";
  else {
    m = new RegExp(String.raw`${H}longest side ${S} and (?:a|one) shorter side ${S}\.\s*find the other shorter side$`, "i").exec(t);
    find = "shorter";
  }
  if (!m) return null;
  const u = pyUnitOf(m[2]);
  if (pyUnitOf(m[4]) !== u) return null;
  const spec: SchoolSpec = { shape: "pythagoras", expr: `${find} ${m[1]} ${m[3]}`, unit: u };
  return read(spec).ok ? spec : null;
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
 *     division, a decimal comma (a list too), a sign on one amount only or on a count, or two currencies;
 *   - ratio and sharing (W7 batch 3): `readRatio`'s phrasings (a bare 'a:b' is null: ':' also divides in cz and de);
 *   - unit rates (W7 batch 3): `readRate`'s phrasings, a statement and one question, never a story;
 *   - area (W7 batch 3): `readArea`'s phrasings, every side with the same length unit;
 *   - mean and range (W7 batch 3): `readStat`'s phrasings, a list with a comma and a space between its numbers.
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
    return readMissing(t) ?? readSimplify(t) ?? readOf(t) ?? readCombined(t) ?? readDecimal(t) ?? readConvert(t) ?? readPercentOf(t) ?? readPercentChange(t)
      ?? readRatio(t) ?? readRate(t) ?? readArea(t) ?? readStat(t) ?? readPythagoras(t);
  } catch {
    return null;
  }
}

/**
 * The unit a school spec belongs to, by topic id, or null: a sum or difference of two fractions is add and subtract
 * fractions, a product or quotient of two fractions multiply and divide fractions (W7), a fraction of an amount its own
 * unit, a missing number or a simplify equivalent fractions; two numbers with a decimal among them added, subtracted or
 * multiplied the decimals unit (W7 batch 2); any `ratio` spec "Ratio and sharing", any `rate` spec "Unit rates and direct
 * proportion", any `area` spec its unit, any `stat` spec "Mean and range" (W7 batch 3).
 */
export function unitOf(spec: unknown): string | null {
  try {
    const r = read(spec);
    if (!r.ok) return null;
    if (r.kind.k === "of") return "frac-of-amount";
    if (r.kind.k === "missing" || r.kind.k === "simplify") return "frac-equivalent";
    if (r.kind.k === "convert") return "dec-convert";
    if (r.kind.k === "pct-of") return "pct-of-amount";
    if (r.kind.k === "pct-change") return "pct-change";
    if (r.kind.k === "ratio-simplify" || r.kind.k === "ratio-share" || r.kind.k === "ratio-missing") return "ratio-share";
    if (r.kind.k === "rate") return "unit-rate";
    if (r.kind.k === "area") return "area";
    if (r.kind.k === "stat") return "mean-range";
    if (r.kind.k === "pyth") return "pythagoras";
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
  "pct-of-amount": "A percentage of an amount is that many hundredths of it. Find a single hundredth of the amount first and build the percentage up from it, or write the percentage as a decimal and multiply the amount by it. The answer is yours to work out.",
  "pct-change": "First find the percentage of the amount: that is the change. Then add it on for an increase, or take it off for a decrease. The answer is yours to work out.",
  "dec-arith": "To add or take away, write the numbers with their decimal points one under the other, filling empty places with zeros. To multiply, multiply as if there were no points, then give the answer as many digits after its point as the question's numbers have between them. The answer is yours to work out.",
  "mean-range": "The mean is the total of the numbers divided by how many numbers there are. The range is the largest number take away the smallest. The answer is yours to work out.",
  "area": "The area of a rectangle is its length times its width. For a triangle, multiply the base by the height and halve the result. For two rectangles together, find the area of each and add them. The answer is yours to work out.",
  "unit-rate": "Find the value of a single one first: divide the cost or the distance by how many there are in the first sentence. Then multiply by the number the question asks about. The answer is yours to work out.",
  "ratio-share": "To share in a ratio, add the ratio's numbers to find how many equal parts there are, divide the amount by that to find the size of a single part, then multiply by each number of the ratio. To simplify a ratio or find a missing number, multiply or divide both numbers by the same number. The answer is yours to work out.",
  "pythagoras": "In a right-angled triangle, multiply each shorter side by itself and add the results to get the longest side multiplied by itself. To find the longest side, add those squares and then take the square root. To find a shorter side, take the square of the other shorter side away from the square of the longest side, then take the square root. The answer is yours to work out.",
  any: "Go back to the last step you are sure of and take the next. The answer stays yours to find.",
} as const;
/** The withheld line for a school spec, chosen by its unit; the general line for any other. */
export function withheldSchool(spec: unknown): string {
  const u = unitOf(spec);
  return u && Object.prototype.hasOwnProperty.call(SCHOOL_WITHHELD, u) ? SCHOOL_WITHHELD[u as keyof typeof SCHOOL_WITHHELD] : SCHOOL_WITHHELD.any;
}

// ---- v2 M1: the worked answer a lesson shows ----

/** A rational as plain candidates: whole, fraction, mixed, terminating decimal (up to 4 places), percent. */
function writings(t: Q): string[] {
  const neg = t.n < Z, n = neg ? -t.n : t.n, d = t.d, sign = neg ? "-" : "", out: string[] = [];
  if (d === ONE) out.push(`${sign}${n}`);
  else {
    out.push(`${sign}${n}/${d}`);
    if (n > d) out.push(`${sign}${n / d} ${n % d}/${d}`);
  }
  let dd = d; while (dd % BigInt(2) === Z) dd /= BigInt(2); while (dd % BigInt(5) === Z) dd /= BigInt(5);
  if (dd === ONE) {
    for (let places = 1; d !== ONE && places <= 4; places++) {
      const scale = TEN ** BigInt(places);
      if ((n * scale) % d === Z) { const v = (n * scale) / d, s = v.toString().padStart(places + 1, "0"); out.push(`${sign}${s.slice(0, -places)}.${s.slice(-places)}`); break; }
    }
    // a percent, whole or with up to 2 places (27/40 = 67.5%)
    for (let places = 0; places <= 2; places++) {
      const scale = BigInt(100) * TEN ** BigInt(places);
      if ((n * scale) % d !== Z) continue;
      const v = ((n * scale) / d).toString();
      out.push(places ? `${sign}${v.padStart(places + 1, "0").slice(0, -places)}.${v.padStart(places + 1, "0").slice(-places)}%` : `${sign}${v}%`);
      break;
    }
  }
  return out;
}

/**
 * The answer a worked example prints, decided by code twice: built from the spec's own truth (read), then kept only
 * when `check` marks it right for this school system (so a lesson never shows an answer the desk would ring). The first
 * writing `check` accepts wins, in the order whole, fraction, mixed, decimal, percent, each bare and then with the
 * spec's unit; a ratio is written a:b. Null when no writing passes, and then the lesson withholds that example.
 */
export function workedAnswer(spec: unknown, system: unknown = DEFAULT_SCHOOL_SYSTEM): string | null {
  const r = read(spec);
  if (!r.ok) return null;
  const unit = specUnit(r.spec), K = r.kind;
  let candidates: string[];
  if (K.k === "ratio-simplify") candidates = [`${r.truth.n}:${r.truth.d}`];
  else if (K.k === "ratio-share" && r.pair) candidates = [`${r.pair[0].n / r.pair[0].d} and ${r.pair[1].n / r.pair[1].d}`, `${r.pair[0].n / r.pair[0].d}:${r.pair[1].n / r.pair[1].d}`];
  else candidates = writings(r.truth);
  // the form the question speaks in comes first: a question with a decimal, a percent or a unit is answered as a
  // decimal (31.2 litres, not 156/5); a fraction question keeps its fraction. `check` still decides which forms pass.
  const expr = String((r.spec as { expr?: unknown }).expr ?? "");
  if (unit || /[.%]/.test(expr) || ["percent-of", "percent-change", "rate", "area", "stat"].includes(r.spec.shape)) {
    const dec = (c: string) => /^-?\d+\.\d+$/.test(c);
    candidates = [...candidates.filter(dec), ...candidates.filter((c) => !dec(c))];
  }
  // money is written to the cent: £70.20, not £70.2
  const cents = (c: string) => (/^-?\d+[.,]\d$/.test(c) ? `${c}0` : c);
  const withUnit = (c: string) => (!unit ? [] : ["€", "$", "£"].includes(unit) ? [`${unit}${cents(c)}`, `${unit}${c}`, `${c} ${unit}`] : [`${c} ${unit}`]);
  // a decimal is written the way the learner's school writes it: a comma first where the system uses one (cz, de)
  const comma = system === "cz" || system === "de";
  const local = (c: string) => (/\d\.\d/.test(c) ? (comma ? [c.replace(".", ","), c] : [c, c.replace(".", ",")]) : [c]);
  // with its unit first where it has one (30 m2, not a bare 30), then bare
  for (const c of candidates.flatMap(local).flatMap((c) => [...withUnit(c), c])) if (check(spec, c, system).verdict === "right") return c;
  return null;
}
