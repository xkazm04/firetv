/**
 * The Calculus 2 shapes, beside Calculus 1's nine (v2 M3b-3a: the seam; M3b-3b and M3b-3c: the first two shapes). Each slice
 * (docs/concepts/STUDY-DESK-V2-PLAN.md rows 41-46) puts one shape here: its reading of the spec, its truth, its question,
 * its verdict, its leak rule and its slips. rules/calc.ts sends a spec whose shape is in this list to the functions below
 * on the first line of wellFormed, question, checkAnswer, leaksCalc, slipsFor and withheldCalc, and offers a printed
 * question its own reader finds no spec in to calc2SpecFromQuestion.
 *
 * The functions keep the signatures of calc.ts's public ones. They are named with a calc2 prefix because calc.ts
 * imports them.
 *
 * Shape: approx-integral (M3b-3b; Stewart 9e 7.7, OpenStax Calculus Volume 2 3.6) - the trapezoid, midpoint or Simpson's rule
 * with n = `pieces` subintervals applied to f on [a, b], asked to four decimal places.
 *
 * Shape: sequence-limit (M3b-3c; Stewart 9e 11.1, OpenStax Calculus Volume 2 5.1) - the limit of a_n = f(n) as n grows, f a
 * function of x that the desk prints with n in place of x. Its truth is calc-expr's guarded limitInf(f, 1).
 *
 * Pure: imports at most calc-expr.ts and calc-read.ts - no engine, no session store, no TV module, no React, and not
 * calc.ts (which imports this file). A few lines of calc.ts are written again here for that reason (num, BAD_SPEC).
 */
import { compile, integrate, limitInf, toPlain, toTex, type Expr } from "./calc-expr";
import { commaSystem, type SchoolSystem } from "./taskText";
import { DNE, cleanAnswer, decimalCall, infinityOf, isDecimal, oneNumberComma, piecePattern, roundingRight, spoken, withinRel } from "./calc-read";

/** The ids of the Calculus 2 shapes (not calculus2.spine.ts's Calc2Shape: that is a topic's list, which also holds Calculus 1's two integral shapes). */
export type Calc2SpecShape = "approx-integral" | "sequence-limit";

export type ApproxRule = "trapezoid" | "midpoint" | "simpson";

/** A number, or a constant expression the desk reads ('pi/4'): as calc.ts's Num. */
type Num = number | string;

/** A Calculus 2 spec: a shape and its parameters, never an answer field (as CalcSpec). */
type ApproxSpec = { shape: "approx-integral"; f: string; a: Num; b: Num; pieces: number; rule: ApproxRule };
/** The limit of a_n = f(n): f is a function of x, which the desk prints in n. */
type SequenceSpec = { shape: "sequence-limit"; f: string };
export type Calc2Spec = ApproxSpec | SequenceSpec;

export const CALC2_SHAPES: readonly Calc2SpecShape[] = ["approx-integral", "sequence-limit"];

const isSequence = (spec: unknown): spec is SequenceSpec => isCalc2Spec(spec) && spec.shape === "sequence-limit";

/** Is this a Calculus 2 spec by its shape? (Calculus 1 and school shapes share no name with it.) */
export const isCalc2Spec = (spec: unknown): spec is Calc2Spec =>
  !!spec && typeof spec === "object" && (CALC2_SHAPES as readonly unknown[]).includes((spec as { shape?: unknown }).shape);

/** The verdict a Calculus 2 shape gives: the same fields as calc.ts's CalcVerdict. */
export interface Calc2Verdict { verdict: "right" | "wrong" | "unsure"; slip?: string; why: string; }

// ------------------------------------------------------------------ tolerances, each with its reason

/**
 * How close a decimal answer must be to the value, ABSOLUTELY: the question asks for four decimal places, and 5e-5 is half a
 * unit in the fourth place at any size of value (a tolerance relative to max(1, |value|) would take a three-place 22.0006
 * for 22 once the value passes 1: ruling 20). The 1e-12 is floating point. Calculus 1's 5e-3 cannot work here: T_5's own
 * error is 2.5e-3, so a learner who gave ln 2 would be right.
 */
const DECIMAL_TOL = 5e-5 + 1e-12;
/** Any other number form (a whole number, a fraction, a constant) is right within this, relative to max(1, |value|). */
const EXACT_TOL = 1e-6;
/** A rule's value this close to the exact integral, or to another rule's value with the same pieces, makes the question degenerate. */
const DEGENERATE = 1e-4;
/** The least and most pieces. */
const MIN_PIECES = 2, MAX_PIECES = 10;
/** Most tokens a window of a line may span (calc.ts WINDOW). */
const WINDOW = 6;

// ------------------------------------------------------------------ the desk's lines (no value in any)

// The same sentences calc.ts says (WHY, REJECT), written again: this file may not import calc.ts.
const WHY = {
  right: "It agrees with what the desk worked out for itself.",
  wrong: "It does not agree with what the desk worked out for itself.",
  sign: "It has the right size but the opposite sign.",
  empty: "There is no answer to check.",
  unreadable: "The desk cannot read this answer as mathematics, and it does not guess.",
  notNumber: "The answer should be a number, and this one depends on x.",
  notFinite: "This answer has no finite value to compare.",
  badSpec: "The desk cannot work this question out for itself, so it does not judge the answer.",
  rounded: "This is a rounded decimal; the desk asks for the exact value.",
} as const;
const BAD_SPEC = WHY.badSpec;

const REJECT = {
  shape: "The shape is not one of the desk's shapes.",
  answer: "A spec carries no answer field: the desk works the answer out itself.",
  read: "The desk cannot read the function.",
  constant: "The function carries an arbitrary constant; a question's function has none.",
  noX: "The function has no x in it.",
  number: "A parameter is not a finite number the desk can read.",
  interval: "The interval is empty or reversed.",
  value: "The value there is not finite.",
  integralUndefined: "The integral is not finite on this interval.",
  pieces: "The number of pieces must be a whole number from two to ten, and even for Simpson's rule.",
  rule: "The rule must be the trapezoid rule, the midpoint rule or Simpson's rule.",
  degenerate: "The rule's value cannot be told from the exact integral or from another rule's value, so the question would not test the rule.",
  limitDne: "The limit does not exist.",
  limitUndefined: "The function is not defined near that point.",
  sequenceUndefined: "The sequence is not defined at every whole n from 1 to 100.",
} as const;

/** The fixed line when a hint gave the value away twice: it names the method and carries no number and no number word. */
const WITHHELD_SEQUENCE = "Say what the terms do as n grows, then name the step that makes it clear. The limit is yours to find.";
const WITHHELD = "List the points the rule uses, evaluate the function at each, then weight and add them as the rule says. The decimal is yours to find.";

// ------------------------------------------------------------------ reading a spec

const RULES: readonly ApproxRule[] = ["trapezoid", "midpoint", "simpson"];
const fin = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** A Num's value, or null (as calc.ts num). */
function num(n: unknown): number | null {
  if (fin(n)) return n;
  if (typeof n !== "string") return null;
  const e = compile(n);
  if (!e || e.usesX || e.constant) return null;
  const v = e.at();
  return fin(v) ? v : null;
}

/** The rule's sum of f over [a, b] with n pieces, or null when a point it uses is not finite. */
function ruleValue(f: Expr, a: number, b: number, n: number, rule: ApproxRule): number | null {
  const h = (b - a) / n;
  const at = (x: number) => f.at(x);
  let sum = 0;
  switch (rule) {
    case "trapezoid":
      for (let i = 0; i <= n; i++) sum += (i === 0 || i === n ? 0.5 : 1) * at(a + i * h);
      return fin(sum) ? h * sum : null;
    case "midpoint":
      for (let i = 0; i < n; i++) sum += at(a + (i + 0.5) * h);
      return fin(sum) ? h * sum : null;
    case "simpson":
      if (n % 2 !== 0) return null;
      for (let i = 0; i <= n; i++) sum += (i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2) * at(a + i * h);
      return fin(sum) ? (h / 3) * sum : null;
  }
}

type Read = { ok: true; spec: ApproxSpec; f: Expr; a: number; b: number; value: number } | { ok: false; why: string };

/** The structure of a spec when every field is there and of its type; else the reason. Never the truth. */
function structure(spec: unknown): { s: ApproxSpec; f: Expr; a: number; b: number } | string {
  if (!spec || typeof spec !== "object" || !isCalc2Spec(spec) || spec.shape !== "approx-integral") return REJECT.shape;
  const s = spec as ApproxSpec & Record<string, unknown>;
  if (["answer", "solution", "truth", "value", "result"].some((k) => k in s)) return REJECT.answer;
  const f = typeof s.f === "string" ? compile(s.f) : null;
  if (!f) return REJECT.read;
  if (f.constant) return REJECT.constant;
  if (!f.usesX) return REJECT.noX;
  const a = num(s.a), b = num(s.b);
  if (a === null || b === null) return REJECT.number;
  if (!(a < b)) return REJECT.interval;
  if (!RULES.includes(s.rule as ApproxRule)) return REJECT.rule;
  const n = s.pieces;
  if (typeof n !== "number" || !Number.isInteger(n) || n < MIN_PIECES || n > MAX_PIECES || (s.rule === "simpson" && n % 2 !== 0)) return REJECT.pieces;
  return { s, f, a, b };
}

function read(spec: unknown): Read {
  const st = structure(spec);
  if (typeof st === "string") return { ok: false, why: st };
  const { s, f, a, b } = st;
  const value = ruleValue(f, a, b, s.pieces, s.rule);
  if (value === null) return { ok: false, why: REJECT.value };
  const exact = integrate(f, a, b);
  if (exact === null) return { ok: false, why: REJECT.integralUndefined };
  if (Math.abs(value - exact) <= DEGENERATE) return { ok: false, why: REJECT.degenerate };
  for (const other of RULES) {
    if (other === s.rule) continue;
    const v = ruleValue(f, a, b, s.pieces, other);
    if (v !== null && Math.abs(value - v) <= DEGENERATE) return { ok: false, why: REJECT.degenerate };
  }
  return { ok: true, spec: s, f, a, b, value };
}

export function calc2WellFormed(spec: unknown): { ok: true } | { ok: false; why: string } {
  if (isSequence(spec)) { const q = readSequence(spec); return q.ok ? { ok: true } : { ok: false, why: q.why }; }
  const r = read(spec);
  return r.ok ? { ok: true } : { ok: false, why: r.why };
}

// ------------------------------------------------------------------ printing the question

const tidy = (s: string) => s.trim().replace(/\s+/g, " ");
const isSum = (e: Expr) => e.node.k === "add" || e.node.k === "sub";
const numPlain = (n: Num) => (typeof n === "number" ? String(n) : tidy(n));
const numTex = (n: Num) => { if (typeof n === "number") return String(n); const e = compile(n); return e ? toTex(e) : tidy(n); };
/** A bound as plain text: a bare non-negative number as it is, anything else in brackets (int_(-1)^2). */
const script = (n: Num) => { const p = numPlain(n); return /^\d+(\.\d+)?$/.test(p) ? p : `(${p})`; };
const RULE_PLAIN: Record<ApproxRule, string> = { trapezoid: "the trapezoid rule", midpoint: "the midpoint rule", simpson: "Simpson's rule" };

/**
 * The question, printed by code from the spec: 'Use the trapezoid rule with n = 5 to approximate int_1^2 1/x dx, to four
 * decimal places.' Null when the spec is malformed (structure): a malformed spec never throws. It names the rule, n and
 * the places and never the value: the only numbers printed are the spec's own parameters.
 */
export function calc2Question(spec: unknown): { plain: string; tex: string } | null {
  if (isSequence(spec)) return sequenceQuestion(spec);
  const st = structure(spec);
  if (typeof st === "string") return null;
  const { s, f } = st;
  const F = tidy(s.f), Ft = toTex(f);
  const Fb = isSum(f) ? `(${F})` : F, Fbt = isSum(f) ? `(${Ft})` : Ft;
  return {
    plain: `Use ${RULE_PLAIN[s.rule]} with n = ${s.pieces} to approximate int_${script(s.a)}^${script(s.b)} ${Fb} dx, to four decimal places.`,
    tex: `\\text{Use ${RULE_PLAIN[s.rule]} with } n = ${s.pieces} \\text{ to approximate } \\int_{${numTex(s.a)}}^{${numTex(s.b)}} ${Fbt}\\,dx\\text{, to four decimal places.}`,
  };
}

// ------------------------------------------------------------------ judging an answer

const verdict = (v: Calc2Verdict["verdict"], why: string, slip?: string): Calc2Verdict => (slip ? { verdict: v, slip, why } : { verdict: v, why });

const CLOSING: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
/** Where the bracket opened at s[i] closes, or -1. */
function closeAt(s: string, i: number): number {
  const close = CLOSING[s[i]];
  if (!close) return -1;
  let depth = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === s[i]) depth++;
    else if (s[k] === close && --depth === 0) return k;
  }
  return -1;
}
const wrapped = (s: string) => s.length > 1 && closeAt(s, 0) === s.length - 1;
const unwrapAll = (s: string) => { while (wrapped(s)) s = s.slice(1, -1); return s; };

/**
 * Does the answer read as a decimal (ruling 28)? With spaces, one leading sign and enclosing brackets removed it is a decimal
 * numeral: '0.6956', '-0.6956', '-(0.6956)', '(0.6956)'.
 */
function readsAsDecimal(ans: string): boolean {
  let s = unwrapAll(ans.replace(/\s+/g, ""));
  s = unwrapAll(s.replace(/^[+\-−]/, ""));
  return !/^[+\-−]/.test(s) && isDecimal(s);
}

/**
 * The verdict on a learner's answer, decided from the spec alone - the value is recomputed, never stored.
 *   - a decimal is right within DECIMAL_TOL of the value, absolutely; any other number form within EXACT_TOL, relative;
 *   - the negation right by the same test (and the value not within it of 0) is 'wrong' with slip 'sign';
 *   - any other number is 'wrong': there is no 'unsure' band;
 *   - an empty, unreadable or non-finite answer, an answer in x, or a spec the desk cannot work out, is 'unsure'.
 * The `why` is a fixed sentence of the desk's, with no value in it.
 * With a cz or de `system`, a one-number answer with a decimal comma ('2,718') is read as a point (MK4).
 */
export function calc2CheckAnswer(spec: unknown, studentAnswer: unknown, system?: SchoolSystem): Calc2Verdict {
  if (isSequence(spec)) return sequenceCheck(spec, studentAnswer, system);
  const r = read(spec);
  if (!r.ok) return verdict("unsure", BAD_SPEC);
  if (typeof studentAnswer !== "string" || !studentAnswer.trim()) return verdict("unsure", WHY.empty);
  let ans = cleanAnswer(studentAnswer);
  if (!ans) return verdict("unsure", WHY.empty);
  if (commaSystem(system)) ans = oneNumberComma(ans);
  const e = compile(ans);
  if (!e) return verdict("unsure", WHY.unreadable);
  if (e.constant) return verdict("unsure", WHY.unreadable);
  if (e.usesX) return verdict("unsure", WHY.notNumber);
  const s = e.at();
  if (!fin(s)) return verdict("unsure", WHY.notFinite);
  const decimal = readsAsDecimal(ans);
  const near = (u: number, v: number) => (decimal ? Math.abs(u - v) <= DECIMAL_TOL : withinRel(u, v, EXACT_TOL));
  if (near(s, r.value)) return verdict("right", WHY.right);
  if (!near(0, r.value) && near(-s, r.value)) return verdict("wrong", WHY.sign, "sign");
  return verdict("wrong", WHY.wrong);
}

// ------------------------------------------------------------------ the leak check

/** The question's own notation that may be quoted back: never the value. */
function ownPieces(s: ApproxSpec): string[] {
  const a = numPlain(s.a), b = numPlain(s.b);
  const name = s.rule === "simpson" ? "simpson's" : s.rule;
  const out = ["f(x) =", `int_${script(s.a)}^${script(s.b)}`, `from ${a} to ${b}`, `[${a}, ${b}]`, `n = ${s.pieces}`, `${name} rule`, name];
  if (s.rule === "trapezoid") out.push("trapezoidal rule", "trapezoidal");
  return out;
}

/**
 * Does this hint or explanation line state the value? It reads the line as it would be said (calc-read spoken), sets
 * aside the question's own notation (f, a, b, int_a^b, 'n = pieces', the rule's name), then reads the line in windows of up
 * to six whitespace-separated tokens, taking at each place the longest window the engine can read. A line leaks when a
 * window is a number within 5e-5 of the value or of its negation (ruling 28). A hint that rounds the value to fewer than
 * four places does not leak by this rule: a residual (docs/MATH-COURSE-PATHS.md section 10).
 */
export function calc2LeaksCalc(spec: unknown, line: unknown): boolean {
  if (isSequence(spec)) return sequenceLeaks(spec, line);
  if (typeof line !== "string" || !line.trim()) return false;
  const r = read(spec);
  if (!r.ok) return false;
  let text = spoken(line);
  for (const p of [...ownPieces(r.spec), r.spec.f]) text = text.replace(piecePattern(p.toLowerCase()), " ");
  const tokens = text.replace(/[=,;:!?"“”‘’]/g, " ").split(/\s+/)
    .map((t) => t.replace(/\.+$/, ""))
    .filter(Boolean);
  /** One token alone, also without a bracket it does not close: prose wraps numbers in brackets. */
  const single = (t: string): Expr | null => {
    const e = compile(t);
    if (e) return e;
    const open = (t.match(/\(/g) ?? []).length, close = (t.match(/\)/g) ?? []).length;
    return open > close ? compile(t.replace(/^\(+/, "")) : close > open ? compile(t.replace(/\)+$/, "")) : null;
  };
  const states = (e: Expr): boolean => {
    if (e.usesX || e.constant) return false;
    const v = e.at();
    return fin(v) && (Math.abs(v - r.value) <= DECIMAL_TOL || Math.abs(v + r.value) <= DECIMAL_TOL);
  };
  for (let i = 0; i < tokens.length;) {
    let took = 0, hit = false;
    for (let n = Math.min(WINDOW, tokens.length - i); n >= 1; n--) {
      const e = n === 1 ? single(tokens[i]) : compile(tokens.slice(i, i + n).join(" "));
      if (!e) continue;
      took = n;
      hit = states(e);
      break;
    }
    if (hit) return true;
    i += Math.max(1, took);
  }
  return false;
}

// ------------------------------------------------------------------ slips and the fixed line

/** The slip ids the model may pick from for an item of this shape, already judged wrong by code (their words are calc.ts CALC_SLIPS'). */
export function calc2SlipsFor(shape: unknown): string[] {
  return shape === "approx-integral" || shape === "sequence-limit" ? ["arithmetic-slip", "sign"] : [];
}

export function calc2Withheld(spec: unknown): string {
  return isSequence(spec) ? WITHHELD_SEQUENCE : WITHHELD;
}

// ------------------------------------------------------------------ reading a printed question back into a spec

/** The bound after 'int_' or '^': a bracketed group, or a bare run up to `stop`. [bound, rest] or null. */
function boundOf(s: string, stop: RegExp): [string, string] | null {
  if (s[0] === "(") {
    const end = closeAt(s, 0);
    return end < 0 ? null : [s.slice(1, end), s.slice(end + 1)];
  }
  const m = stop.exec(s);
  const end = m ? m.index : s.length;
  return end === 0 ? null : [s.slice(0, end), s.slice(end)];
}

/** A bound as a spec carries it: a plain decimal as a number, a constant ('pi/4') as its text; null when it does not read. */
function paramOf(t: string): Num | null {
  const s = unwrapAll(tidy(t));
  if (/^[+-]?\d+(\.\d+)?$/.test(s)) { const v = Number(s); return fin(v) ? v : null; }
  return num(s) === null ? null : s;
}

/** The function as the question writes it, or null: an expression in x the engine reads, no '=' and no +C; one bracket pair around a whole sum is the question's own. */
function fnOf(t: string): string | null {
  let s = tidy(t);
  if (s.startsWith("(") && wrapped(s)) {
    const inner = compile(s.slice(1, -1));
    if (inner && isSum(inner)) s = tidy(s.slice(1, -1));
  }
  if (!s || s.includes("=")) return null;
  const e = compile(s);
  return e && e.usesX && !e.constant ? s : null;
}

/** The integral a phrasing names - 'int_a^b f dx', 'the integral of f from a to b', 'the integral from a to b of f' - as [f, a, b], or null. */
function integralOf(t: string): [string, string, string] | null {
  const s = tidy(t);
  let m = /^int(_.+)$/i.exec(s);
  if (m) {
    const lo = boundOf(m[1].slice(1), /\^/);
    if (!lo || lo[1][0] !== "^") return null;
    const hi = boundOf(lo[1].slice(1), /\s/);
    if (!hi) return null;
    const body = /^\s*(.+?)\s*d\s*x$/i.exec(hi[1]);
    return body ? [body[1], lo[0], hi[0]] : null;
  }
  m = /^the\s+(?:definite\s+)?integral\s+of\s+(.+?)(?:\s*d\s*x)?\s+from\s+(?:x\s*=\s*)?(\S+)\s+to\s+(?:x\s*=\s*)?(\S+)$/i.exec(s);
  if (m) return [m[1], m[2], m[3]];
  m = /^the\s+(?:definite\s+)?integral\s+from\s+(?:x\s*=\s*)?(\S+)\s+to\s+(?:x\s*=\s*)?(\S+)\s+of\s+(.+?)(?:\s*d\s*x)?$/i.exec(s);
  return m ? [m[3], m[1], m[2]] : null;
}

const RULE_WORDS = String.raw`(?:the\s+)?(trapezoid(?:al)?|midpoint|simpson(?:'s)?)\s+rule`;
const N_WORDS = String.raw`n\s*=\s*(\d{1,2})`;
const PIECES_WORD = String.raw`(?:\s+(?:subintervals|pieces|intervals))?`;
const PLACES = String.raw`(?:\s*,?\s*to\s+(?:four|4)\s+decimal\s+places)?`;
const APPROX = String.raw`(?:approximate|estimate)`;
const re = (s: string) => new RegExp(`^${s}$`, "i");

/** The phrasings, in order: each a pattern whose groups are the rule word, n and the integral. */
const READERS: [RegExp, (m: RegExpExecArray) => { rule: string; n: string; integral: string }][] = [
  // Use the trapezoid rule with n = 4 to approximate int_1^2 1/x dx, to four decimal places
  [re(`use\\s+${RULE_WORDS}\\s+with\\s+${N_WORDS}${PIECES_WORD}\\s+to\\s+${APPROX}\\s+(.+?)${PLACES}`), (m) => ({ rule: m[1], n: m[2], integral: m[3] })],
  // Approximate int_1^2 1/x dx using the trapezoid rule with n = 4
  [re(`${APPROX}\\s+(.+?)\\s+(?:using|with|by)\\s+${RULE_WORDS}(?:\\s*,\\s*|\\s+with\\s+)${N_WORDS}${PIECES_WORD}${PLACES}`), (m) => ({ rule: m[2], n: m[3], integral: m[1] })],
];

/**
 * The spec a printed Calculus 2 task is, read in code from its text - or null (v2 M3b-3b ruling 31, M3b-3c ruling 39): an
 * approximate-integration task first, then a sequence's limit. `text` is the question as calc.ts normalises it
 * (normalQuestion). Conservative: a phrasing it does not know, a part that does not read, or a spec calc2WellFormed refuses,
 * is null. Pure and deterministic: a fresh object per call.
 */
export function calc2SpecFromQuestion(text: string): Calc2Spec | null {
  return approxFromQuestion(text) ?? sequenceFromQuestion(text);
}

/**
 * The spec a printed approximate-integration task is, or null. It reads calc2Question's own plain text and the phrasings a
 * page uses ('Use the Trapezoidal Rule with n = 5 to approximate the integral from 1 to 2 of 1/x dx', 'Approximate int_1^2
 * 1/x dx using the trapezoid rule with n = 4', 'Estimate ... with the midpoint rule, n = 4').
 */

function approxFromQuestion(text: string): ApproxSpec | null {
  for (const [pattern, make] of READERS) {
    const m = pattern.exec(text);
    if (!m) continue;
    const g = make(m);
    const parts = integralOf(g.integral);
    if (!parts) return null;
    const f = fnOf(parts[0]), a = paramOf(parts[1]), b = paramOf(parts[2]);
    const word = g.rule.toLowerCase();
    const rule: ApproxRule = word.startsWith("trap") ? "trapezoid" : word.startsWith("mid") ? "midpoint" : "simpson";
    if (!f || a === null || b === null) return null;
    const spec: ApproxSpec = { shape: "approx-integral", f, a, b, pieces: Number(g.n), rule };
    return calc2WellFormed(spec).ok ? spec : null;
  }
  return null;
}

// ================================================================== sequence-limit (v2 M3b-3c)

/** a_n must be finite at every whole n from 1 to this: a sequence is defined at its terms. */
const TERMS = 100;
/** Calculus 1's limit row, copied (calc.ts TOLERANCE.limit and ROUNDED_CLOSE): exact 1e-6, a rounded decimal 5e-3, and a decimal this close to the limit is 'unsure'. */
const LIMIT_EXACT = 1e-6, LIMIT_ROUNDED = 5e-3, ROUNDED_CLOSE = 5e-3;

type SeqTruth = { kind: "number"; v: number } | { kind: "inf"; sign: 1 | -1 };
type SeqRead = { ok: true; spec: SequenceSpec; f: Expr; truth: SeqTruth } | { ok: false; why: string };

/** The spec's function when every field is there and of its type - an expression in x the engine reads, no +C, no answer key - else the reason. Never the truth. */
function sequenceStructure(spec: unknown): { s: SequenceSpec; f: Expr } | string {
  if (!isSequence(spec)) return REJECT.shape;
  const s = spec as SequenceSpec & Record<string, unknown>;
  if (["answer", "solution", "truth", "value", "result"].some((k) => k in s)) return REJECT.answer;
  const f = typeof s.f === "string" ? compile(s.f) : null;
  if (!f) return REJECT.read;
  if (f.constant) return REJECT.constant;
  if (!f.usesX) return REJECT.noX;
  return { s, f };
}

/** The truth is calc-expr's limitInf(f, 1), which carries the alias guard (ruling 25); a null or a dne is refused. */
function readSequence(spec: unknown): SeqRead {
  const st = sequenceStructure(spec);
  if (typeof st === "string") return { ok: false, why: st };
  const { s, f } = st;
  for (let n = 1; n <= TERMS; n++) if (!fin(f.at(n))) return { ok: false, why: REJECT.sequenceUndefined };
  const L = limitInf(f, 1);
  if (!L) return { ok: false, why: REJECT.limitUndefined };
  if (L.kind === "dne") return { ok: false, why: REJECT.limitDne };
  return { ok: true, spec: s, f, truth: L.kind === "inf" ? { kind: "inf", sign: L.sign } : { kind: "number", v: L.v } };
}

/** The term as the question prints it: f with n in the place of x. */
const termPlain = (f: Expr) => toPlain(f, "n");

function sequenceQuestion(spec: SequenceSpec): { plain: string; tex: string } | null {
  const st = sequenceStructure(spec);
  if (typeof st === "string") return null;
  const { f } = st;
  return {
    plain: `Find lim_(n->infinity) a_n, where a_n = ${termPlain(f)}.`,
    tex: `\\text{Find } \\lim_{n \\to \\infty} a_n \\text{, where } a_n = ${toTex(f, "n")}.`,
  };
}

/** Calculus 1's limit comparison (calc.ts judgeNumber, limit row): a decimal goes to the one rule both call, calc-read's decimalCall (MB-B28, D2 R1a). */
function judgeLimit(truth: number, s: number, written: string): Calc2Verdict {
  if (isDecimal(written)) {
    const c = decimalCall(written, s, truth, { exact: LIMIT_EXACT, rounded: LIMIT_ROUNDED, close: ROUNDED_CLOSE });
    return c === "right" ? verdict("right", WHY.right) : c === "rounded" ? verdict("unsure", WHY.rounded) : c === "sign" ? verdict("wrong", WHY.sign, "sign") : verdict("wrong", WHY.wrong);
  }
  if (withinRel(s, truth, LIMIT_EXACT)) return verdict("right", WHY.right);
  if (!withinRel(0, truth, LIMIT_EXACT) && withinRel(-s, truth, LIMIT_EXACT)) return verdict("wrong", WHY.sign, "sign");
  return verdict("wrong", WHY.wrong);
}

/**
 * The verdict on a learner's answer, as Calculus 1 gives it for a limit at infinity (calc.ts checkAnswer, copied; a parity
 * row in tools/calc2-sequence-test.cjs holds the two equal): an infinity (inf, infinity, ∞, with its sign) is right only for an
 * infinite limit of that sign, the opposite sign is slip 'sign'; 'dne' is wrong; a number is right within 1e-6, its negation
 * is slip 'sign'; a decimal is calc-read's decimalCall (a correct rounding at its own decimals is right with two significant
 * figures or more, 'unsure' with fewer; any other decimal within 5e-3 is 'unsure'); an empty, unreadable or non-finite
 * answer, an answer in x, or a spec the desk cannot work out, is 'unsure'.
 */
function sequenceCheck(spec: SequenceSpec, studentAnswer: unknown, system?: SchoolSystem): Calc2Verdict {
  const r = readSequence(spec);
  if (!r.ok) return verdict("unsure", BAD_SPEC);
  if (typeof studentAnswer !== "string" || !studentAnswer.trim()) return verdict("unsure", WHY.empty);
  let ans = cleanAnswer(studentAnswer);
  if (!ans) return verdict("unsure", WHY.empty);
  if (commaSystem(system)) ans = oneNumberComma(ans);
  const { truth } = r;
  const inf = infinityOf(ans);
  if (inf !== null) {
    if (truth.kind !== "inf") return verdict("wrong", WHY.wrong);
    return inf === truth.sign ? verdict("right", WHY.right) : verdict("wrong", WHY.sign, "sign");
  }
  if (DNE.test(ans)) return verdict("wrong", WHY.wrong);
  const e = compile(ans);
  if (!e) return verdict("unsure", WHY.unreadable);
  if (e.constant) return verdict("unsure", WHY.unreadable);
  if (e.usesX) return verdict("unsure", WHY.notNumber);
  const s = e.at();
  if (!fin(s)) return verdict("unsure", WHY.notFinite);
  if (truth.kind === "inf") return verdict("wrong", WHY.wrong);
  return judgeLimit(truth.v, s, ans);
}

/** The question's own notation, printed in n, that may be quoted back (calc.ts ownPieces' limit case): never the limit. */
function sequencePieces(s: SequenceSpec, f: Expr): string[] {
  const out = ["lim_(n->infinity)", "n->infinity", "a_n"];
  for (const verb of ["approaches", "tends to", "goes to", "gets close to", "near"]) out.push(`n ${verb} infinity`);
  // the term, also as the question ends on it: 'a_n = n/(n + 1).' is quoted, not a one
  out.push(`${termPlain(f)}.`, termPlain(f), s.f);
  return out;
}

/**
 * Does this hint or explanation line state the limit? Calculus 1's rule for a limit (calc.ts leaksCalc, copied): an infinite
 * limit leaks by naming infinity at all; a finite one by any window of up to six tokens, after the question's own notation is
 * set aside, that reads as a number within 5e-3 of the limit (or a negative number whose size is the limit), or as a decimal
 * the judge would call right (D2 R1a).
 */
function sequenceLeaks(spec: SequenceSpec, line: unknown): boolean {
  if (typeof line !== "string" || !line.trim()) return false;
  const r = readSequence(spec);
  if (!r.ok) return false;
  const { truth } = r;
  let text = spoken(line);
  if (truth.kind === "inf") return /infinit|∞|\binf\b/.test(text);
  for (const p of sequencePieces(r.spec, r.f)) text = text.replace(piecePattern(p.toLowerCase()), " ");
  const tokens = text.replace(/[=,;:!?"“”‘’]/g, " ").split(/\s+/)
    .map((t) => t.replace(/\.+$/, ""))
    .filter(Boolean);
  const single = (t: string): Expr | null => {
    const e = compile(t);
    if (e) return e;
    const open = (t.match(/\(/g) ?? []).length, close = (t.match(/\)/g) ?? []).length;
    return open > close ? compile(t.replace(/^\(+/, "")) : close > open ? compile(t.replace(/\)+$/, "")) : null;
  };
  const numberRight = (e: Expr, first: string, said: string): boolean => {
    if (e.usesX || e.constant) return false;
    const v = e.at();
    if (!fin(v)) return false;
    if (withinRel(v, truth.v, ROUNDED_CLOSE) || (first.startsWith("-") && withinRel(-v, truth.v, ROUNDED_CLOSE))) return true;
    // a decimal the judge calls right gives the limit away too (D2 R1a: 2.7 for e)
    const bare = said.replace(/^\(+|\)+$/g, "");
    return roundingRight(bare, v, truth.v) || (bare.startsWith("-") && roundingRight(bare.slice(1), -v, truth.v));
  };
  for (let i = 0; i < tokens.length;) {
    let took = 0, hit = false;
    for (let n = Math.min(WINDOW, tokens.length - i); n >= 1; n--) {
      const e = n === 1 ? single(tokens[i]) : compile(tokens.slice(i, i + n).join(" "));
      if (!e) continue;
      took = n;
      hit = numberRight(e, tokens[i], tokens.slice(i, i + n).join(" "));
      break;
    }
    if (hit) return true;
    i += Math.max(1, took);
  }
  return false;
}

// ------------------------------------------------------------------ reading a printed sequence question back into a spec

const SEQ_VERB = String.raw`(?:find|evaluate|compute|calculate|determine|what\s+is)`;
const A_N = String.raw`\{?a_n\}?`;
const AS_N_GOES = String.raw`n\s*(?:approaches|tends\s+to|goes\s+to|->)\s*infinity`;
const TO_INFINITY = /^n\s*->\s*\+?infinity$/i;
const reSeq = (x: string) => new RegExp(`^${x}$`, "i");

/** The term as a function in x, or null: only an n that stands between non-letters is renamed (ln(n), sin(n) read; 'pin' keeps its n and fails to read), and a term that already has an x is not in n alone. */
function termOf(t: string): string | null {
  let s = tidy(t);
  if (!s || s.includes("=") || /(?<![A-Za-z])x(?![A-Za-z])/.test(s)) return null;
  s = s.replace(/(?<![A-Za-z])n(?![A-Za-z])/g, "x");
  if (s.startsWith("(") && wrapped(s)) {
    const inner = compile(s.slice(1, -1));
    if (inner && isSum(inner)) s = tidy(s.slice(1, -1));
  }
  const e = compile(s);
  return e && e.usesX && !e.constant ? s : null;
}

/** The term's text after 'a_n =' or 'a_n, where a_n =' in a line, or the whole line when it does not start with a_n; null for an a_n with no term. */
function afterA(rest: string): string | null {
  const m = reSeq(`${A_N}\\s*(?:,\\s*where\\s+${A_N}\\s*)?=\\s*(.+)`).exec(rest);
  return m ? m[1] : new RegExp(`^${A_N}(\\s|$)`, "i").test(rest) ? null : rest;
}

const SEQ_READERS: [RegExp, (m: RegExpExecArray) => string | null][] = [
  // Find the limit of the sequence a_n = n/(n+1)
  [reSeq(`${SEQ_VERB}\\s+the\\s+limit\\s+of\\s+the\\s+sequence\\s+(.+)`), (m) => afterA(tidy(m[1]))],
  // Determine whether the sequence a_n = ln(n)/n converges or diverges. If it converges, find the limit
  [reSeq(`determine\\s+whether\\s+the\\s+sequence\\s+${A_N}\\s*=\\s*(.+?)\\s+(?:converges|is\\s+convergent)\\s+or\\s+(?:diverges|is\\s+divergent)(?:\\.\\s*if\\s+it\\s+(?:converges|is\\s+convergent),?\\s+find\\s+(?:its|the)\\s+limit)?`), (m) => m[1]],
  // Find the limit as n approaches infinity of (n^2+1)/(2n^2)
  [reSeq(`${SEQ_VERB}\\s+the\\s+limit\\s+as\\s+${AS_N_GOES}\\s+of\\s+(.+)`), (m) => afterA(tidy(m[1]))],
  // Find the limit of a_n = n/(n+1) as n approaches infinity
  [reSeq(`${SEQ_VERB}\\s+the\\s+limit\\s+of\\s+(.+?)\\s+as\\s+${AS_N_GOES}`), (m) => afterA(tidy(m[1]))],
  // Find lim_(n->infinity) a_n, where a_n = ...   /   Find lim_(n->infinity) (1+1/n)^n
  [reSeq(`(?:${SEQ_VERB}\\s+)?lim\\s*_?\\s*(.+)`), (m) => {
    const rest = tidy(m[1]);
    if (CLOSING[rest[0]]) {
      const end = closeAt(rest, 0);
      return end >= 0 && TO_INFINITY.test(tidy(rest.slice(1, end))) ? afterA(tidy(rest.slice(end + 1))) : null;
    }
    const b = /^(n\s*->\s*\+?infinity)\s+(.+)$/i.exec(rest);
    return b ? afterA(tidy(b[2])) : null;
  }],
];

/**
 * The spec a printed sequence-limit task is, read in code from its text - or null (ruling 39). It reads calc2Question's own
 * plain text and the phrasings a page uses: 'Find the limit of the sequence a_n = n/(n+1)', 'Determine whether the sequence
 * a_n = ln(n)/n converges or diverges. If it converges, find the limit', 'Find lim_(n->infinity) (1+1/n)^n', 'Find the limit
 * as n approaches infinity of (n^2+1)/(2n^2)'. The frame is matched first; inside the term only an n between non-letters is
 * renamed to x (termOf). Conservative: a term that does not read, or a spec calc2WellFormed refuses, is null.
 */
function sequenceFromQuestion(text: string): SequenceSpec | null {
  for (const [pattern, make] of SEQ_READERS) {
    const m = pattern.exec(text);
    if (!m) continue;
    const t = make(m);
    const f = t === null ? null : termOf(t);
    if (!f) continue;
    const spec: SequenceSpec = { shape: "sequence-limit", f };
    return calc2WellFormed(spec).ok ? spec : null;
  }
  return null;
}
