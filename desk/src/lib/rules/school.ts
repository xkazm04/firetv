/**
 * School numbers, decided in code (Family Phase 1, W5a): the answer reader, the fractions checker, the hint leak
 * check and the first unit's generator. W5b wires them: the store keeps a school spec (session/store specShown, by
 * shape), a set on a unit in SCHOOL_GENERATORS is written here with no model call (desk/items makeSchoolItems),
 * marking judges it with `check`, and hints and explanations pass `leaksSchool`.
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
 *      11/12). The working denominators are the answer's own, and for `a/b ± c/d` the lcm and b × d;
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
 * A school practice item is a SPEC, never text a model wrote with an answer. Only `compute` exists today.
 * Pending (W5b/W7), each its own member of this union: `percent` (a percent of an amount), `pct-change`,
 * `ratio-share`, `area` (rectangle, triangle, composite) and `mean` (mean and range).
 *   - compute: a numeric question with no unknown, "Work out 3/4 + 1/6". `form: "simplest"` asks for lowest terms,
 *     `form: "decimal"` for a decimal (the value must terminate); `unit` is the unit the answer is in;
 *     `allowNegative` lets the value be zero or below (a subtraction that crosses zero).
 */
export type SchoolSpec = { shape: "compute"; expr: string; form?: "simplest" | "decimal"; unit?: Unit; allowNegative?: true };
export type SchoolShape = SchoolSpec["shape"];
export const SCHOOL_SHAPES: readonly SchoolShape[] = ["compute"];

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
} as const;

type Read = { ok: true; spec: SchoolSpec; node: Node; truth: Q } | { ok: false; why: string };

/** The spec's structure (printable), without its truth. */
function structure(spec: unknown): { ok: true; spec: SchoolSpec; node: Node } | { ok: false; why: string } {
  if (!spec || typeof spec !== "object" || (spec as { shape?: unknown }).shape !== "compute") return { ok: false, why: REJECT.shape };
  const s = spec as SchoolSpec & Record<string, unknown>;
  if (["answer", "truth", "solution", "value", "result"].some((k) => k in s)) return { ok: false, why: REJECT.answer };
  if (s.form !== undefined && s.form !== "simplest" && s.form !== "decimal") return { ok: false, why: REJECT.form };
  if (s.unit !== undefined && !(UNITS as readonly unknown[]).includes(s.unit)) return { ok: false, why: REJECT.unit };
  if (s.allowNegative !== undefined && s.allowNegative !== true) return { ok: false, why: REJECT.flag };
  const node = parseExpr(s.expr);
  return node ? { ok: true, spec: s, node } : { ok: false, why: REJECT.read };
}

function read(spec: unknown): Read {
  const st = structure(spec);
  if (!st.ok) return st;
  const { node, spec: s } = st;
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
  return { ok: true, spec: s, node, truth };
}

/**
 * Is this spec a question the desk can print and judge? The expression reads (+ - × ÷, brackets, whole numbers,
 * decimals to 3 places, fractions a/b), has one to four operations, every whole number and top is at most 1000,
 * every bottom from 2 to 100; nothing divides by zero; the value is at most 10000 in size with a bottom of at most
 * 10000 in lowest terms; it is above zero unless `allowNegative`; `form: "decimal"` only for a terminating value;
 * a known form and unit; no answer field.
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
 * The question, printed by code from the spec, as plain text and the TeX the typesetter reads: 'Work out 3/4 + 1/6.'
 * and '\text{Work out } \frac{3}{4} + \frac{1}{6}.', with 'Give your answer in its simplest form.' (or 'as a
 * decimal.', or 'in cm.') after it when the spec asks. Null when the spec is malformed; never a throw, never the
 * answer (the spec has none, and only its own numbers are printed).
 */
export function question(spec: unknown): { plain: string; tex: string } | null {
  try {
    const st = structure(spec);
    if (!st.ok) return null;
    const { spec: s, node } = st;
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
];

/** The value each slip gives for `p op q` from the written operands, in SCHOOL_SLIPS order; exact, no guessing. */
function slipCandidates(node: Node): [string, Q][] {
  if (node.k !== "op" || (node.op !== "+" && node.op !== "-")) return [];
  const part = (n: Node): [bigint, bigint] | null => (n.k === "frac" ? [n.n, n.d] : n.k === "num" && n.whole ? [n.q.n, ONE] : null);
  const p = part(node.a), q = part(node.b);
  if (!p || !q) return [];
  const [a, b] = p, [c, d] = q;
  const plus = node.op === "+";
  const comb = (x: bigint, y: bigint) => (plus ? x + y : x - y);
  const out: [string, Q][] = [];
  const push = (id: string, v: Q | null) => { if (v) out.push([id, v]); };
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
} as const;

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
    if (reading.unit && !r.spec.unit) return { verdict: "unsure", form, why: WHY.unit };
    if (reading.unit && reading.unit !== r.spec.unit) return { verdict: "unsure", form, why: WHY.otherUnit };
    const v = fromRat(reading.value), t = r.truth;
    if (eq(v, t)) {
      if (r.spec.form === "simplest") {
        const simple = form === "integer" || ((form === "fraction" || form === "mixed") && reading.lowest === true);
        return simple ? { verdict: "right", form, why: WHY.right } : { verdict: "unsure", form, why: WHY.simplest };
      }
      if (r.spec.form === "decimal") {
        return form === "decimal" || form === "integer" ? { verdict: "right", form, why: WHY.right } : { verdict: "unsure", form, why: WHY.decimal };
      }
      return { verdict: "right", form, why: WHY.right };
    }
    if (form === "decimal" || form === "percent") {
      const k = placesOf(reading, v);
      const scaled = (x: Q) => (form === "percent" ? mul(x, qi(BigInt(100))) : x);
      if ((k > 0 || form === "percent") && !exactAt(scaled(t), k) && withinPlace(scaled(v), scaled(t), k)) return { verdict: "unsure", form, why: WHY.rounded };
    }
    for (const [id, c] of slipCandidates(r.node)) {
      if (!eq(c, t) && eq(c, v)) return { verdict: "wrong", slip: id, form, why: WHY.slip };
    }
    return { verdict: "wrong", form, why: WHY.wrong };
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
  t = t.replace(/(\d+)\s+(?:over|out\s+of)\s+(\d+)/g, "$1/$2").replace(/(\d+)\s+and\s+(\d+\s*\/\s*\d+)/g, "$1 $2");
  return t;
}

/**
 * Does this hint or explanation line state the answer, or give it away? The rule is in this file's header. False
 * for a line that is not text or a spec the desk cannot work out (there is nothing to leak); an internal fault
 * refuses the line (true), the strict side.
 */
export function leaksSchool(spec: unknown, hint: unknown): boolean {
  if (typeof hint !== "string" || !hint.trim()) return false;
  let r: Read;
  try { r = read(spec); } catch { return false; }
  if (!r.ok) return false;
  try {
    const T = qabs(r.truth);
    const whole = T.n / T.d, fracPart = T.n > T.d && T.d !== ONE ? mk(T.n - whole * T.d, T.d)! : null;
    // the working denominators, and the answer's top over each (rule 4)
    const dens = new Set<bigint>([T.d]);
    const n0 = r.node;
    if (n0.k === "op" && (n0.op === "+" || n0.op === "-") && n0.a.k === "frac" && n0.b.k === "frac") {
      const b = n0.a.d, d = n0.b.d;
      dens.add((b * d) / bgcd(b, d)); dens.add(b * d);
    }
    const tops = new Set<string>();
    for (const L of dens) if (L % T.d === Z) tops.add(String((T.n * L) / T.d));
    const targets = fracPart ? [T, fracPart] : [T];
    const hit = (rd: Reading): boolean => {
      if (rd.kind === "ratio") {
        const [p, q] = rd.parts.map(fromRat);
        const v = q.n === Z ? null : div(p, q);
        return !!v && targets.some((x) => eq(qabs(v), x));
      }
      const v = qabs(fromRat(rd.value));
      if (targets.some((x) => eq(v, x))) return true;
      if (rd.form === "integer" && v.d === ONE && tops.has(String(v.n))) return true;
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
    const runs: { s: number; e: number; values: Q[] }[] = [];
    for (const m of text.matchAll(RUN)) {
      const run = m[0].replace(/[.,\s]+$/, "");
      const pieces = new Set<string>([run, ...run.split(/,\s*/), ...run.split(/[\s,]+/)]);
      for (const p of pieces) if (p && readingsOf(p).some(hit)) return true;
      const values = readingsOf(run).flatMap((rd) => (rd.kind === "number" ? [qabs(fromRat(rd.value))] : []));
      runs.push({ s: m.index ?? 0, e: (m.index ?? 0) + run.length, values });
    }
    // rule 6: two numbers joined by an operation whose value is the answer (or, for two whole numbers, its summed top)
    const top = n0.k === "op" ? n0 : null;
    const operand = (n: Node): Q | null => (n.k === "frac" || n.k === "num" ? evalNode(n) : null);
    const given = top ? [operand(top.a), operand(top.b)] : [null, null];
    for (let i = 0; i + 1 < runs.length; i++) {
      const gap = text.slice(runs[i].e, runs[i + 1].s).trim();
      const op: Op | "less" | null = /^(?:\+|plus|add)$/.test(gap) ? "+" : /^(?:-|minus|take away|subtract)$/.test(gap) ? "-"
        : /^(?:x|times|multiplied by)$/.test(gap) ? "×" : /^divided by$/.test(gap) ? "÷" : /^less than$/.test(gap) ? "less" : null;
      if (!op) continue;
      for (const x of runs[i].values) for (const y of runs[i + 1].values) {
        const [p, q, o] = op === "less" ? [y, x, "-" as Op] : [x, y, op];
        const v = o === "+" ? add(p, q) : o === "-" ? sub(p, q) : o === "×" ? mul(p, q) : div(p, q);
        if (!v) continue;
        // the question restated, or its operands rewritten (9/12 + 2/12 for 3/4 + 1/6): a step, not the answer
        const [a, b] = given;
        const restated = !!top && !!a && !!b && top.op === o && ((eq(p, qabs(a)) && eq(q, qabs(b))) || ((o === "+" || o === "×") && eq(p, qabs(b)) && eq(q, qabs(a))));
        if (restated) continue;
        if (eq(qabs(v), T) || (p.d === ONE && q.d === ONE && v.d === ONE && tops.has(String(babs(v.n))))) return true;
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

/**
 * The units whose practice sets code writes, by syllabus topic id, each with its generator (Family W5b: add and
 * subtract fractions only; W7 adds the other units). A topic not here is written as it always was.
 */
export const SCHOOL_GENERATORS: Readonly<Record<string, (seed: number, tier: 1 | 2) => SchoolSpec | null>> = {
  "frac-add-sub": (seed, tier) => gen(seed, tier),
};
/** The generator for a topic id, or null: an own key only, so 'constructor' is not a unit. */
export const generatorFor = (topicId: unknown) =>
  typeof topicId === "string" && Object.prototype.hasOwnProperty.call(SCHOOL_GENERATORS, topicId) ? SCHOOL_GENERATORS[topicId] : null;
