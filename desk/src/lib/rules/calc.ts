/**
 * The Calculus shapes, decided in code.
 *
 * A Calculus practice item is a SPEC - one of a closed set of shapes and its parameters - never free text a model
 * wrote with an answer a model stated. The desk prints the question from the spec (`question`), and judges a
 * learner's answer from the spec (`checkAnswer`) by recomputing the truth numerically each time with the expression
 * engine (calc-expr.ts). The spec carries NO answer field, so nothing that reaches a screen can carry the answer, and
 * "the model cannot solve its own question" is not a possible state: `wellFormed` refuses a spec whose truth the
 * desk cannot find, or whose truth makes a poor question (degenerate).
 *
 * The same shapes carry the leak check for hints and explanations (`leaksCalc`) and the closed slip vocabulary
 * (`CALC_SLIPS`, `slipsFor`): the model never decides a verdict; on an item code already judged wrong it may only
 * pick a slip id from its shape's list, as the linear pipeline does (rules/maths.ts settled()).
 *
 * Pure: imports only calc-expr.ts - no engine, no session store, no TV module.
 */
import { compile, derivativeAt, extremumIn, integrate, limitAt, limitInf, rootsIn, sameFunction, SAMPLES, toTex, type Expr, type Limit } from "./calc-expr";

// ------------------------------------------------------------------ the shapes

/** A number, or a constant expression the desk reads ('pi/4', 'ln(7)/2'). */
export type Num = number | string;

export type CalcSpec =
  | { shape: "evaluate"; f: string; at: Num }
  | { shape: "derivative"; f: string }
  | { shape: "derivative-at"; f: string; at: Num }
  | { shape: "antiderivative"; f: string }
  /** `zero: true` when the item is deliberately about an integral that vanishes (odd symmetry); otherwise 0 is degenerate. */
  | { shape: "definite-integral"; f: string; a: Num; b: Num; zero?: true }
  | { shape: "limit"; f: string; at: Num | "inf" | "-inf"; side?: "+" | "-" }
  | { shape: "critical-point"; f: string; on: [Num, Num] }
  | { shape: "extremum"; f: string; on: [Num, Num]; kind: "max" | "min" }
  | { shape: "newton-step"; f: string; x0: Num; steps: number };

export type CalcShape = CalcSpec["shape"];

export const CALC_SHAPES: readonly CalcShape[] = ["evaluate", "derivative", "derivative-at", "antiderivative", "definite-integral", "limit", "critical-point", "extremum", "newton-step"];

// ------------------------------------------------------------------ tolerances, each with its reason

/**
 * How close a number answer must be to the truth, relative to max(1, |truth|): `exact` for an answer written exactly
 * (a fraction, sqrt(2)/2, pi/4, ln 2), `rounded` for one written as a decimal (0.333).
 *   - evaluate, derivative-at, critical-point, extremum: exact shapes - the truth is computed to 1e-9 or better, so a
 *     right exact answer agrees far inside 1e-6; a decimal is held to the same line (the item asks for the value).
 *   - definite-integral, limit: exact 1e-6 as above; a learner who rounds to three figures lands within 5e-3.
 *   - newton-step: 5e-3 either way - an iterate is usually worked on a calculator and written rounded.
 */
export const TOLERANCE: Readonly<Record<Exclude<CalcShape, "derivative" | "antiderivative">, { exact: number; rounded: number }>> = {
  evaluate: { exact: 1e-6, rounded: 1e-6 },
  "derivative-at": { exact: 1e-6, rounded: 1e-6 },
  "critical-point": { exact: 1e-6, rounded: 1e-6 },
  extremum: { exact: 1e-6, rounded: 1e-6 },
  "definite-integral": { exact: 1e-6, rounded: 5e-3 },
  limit: { exact: 1e-6, rounded: 5e-3 },
  "newton-step": { exact: 5e-3, rounded: 5e-3 },
};
/** Function shapes compare at the samples to 1e-6: the numeric derivative is good to 1e-7 relative, so 10x margin. */
export const FUNCTION_TOL = 1e-6;
/**
 * A decimal within this of the truth on an exact shape is 'unsure', not 'wrong': it is the value rounded, and the
 * desk asks for the exact form rather than mark a correct rounding wrong. The leak check flags any number this close.
 */
export const ROUNDED_CLOSE = 5e-3;
/** A derivative whose every sampled value is within this of zero (relative to max(1, |f|)) is identically zero. */
const ZERO_REL = 1e-9;
/** An integral within this of zero (relative to max(1, the integral of |f|)) vanishes. */
const INTEGRAL_ZERO = 1e-9;
/** A root or an extremum this close to an end, relative to max(1, the interval's size), is at the end. */
const AT_END = 1e-7;
/** The step of the fixed five-point slope used to find critical points, relative to max(1, |x|). */
const SLOPE_H = 1e-4;
/** Newton iterates the desk will ask for: one to six steps. */
const MAX_STEPS = 6;

// ------------------------------------------------------------------ the desk's lines (no value in any)

const WHY = {
  right: "It agrees with what the desk worked out for itself.",
  wrong: "It does not agree with what the desk worked out for itself.",
  sign: "It has the right size but the opposite sign.",
  lostConstant: "It differentiates back to the integrand, but an antiderivative needs its arbitrary constant.",
  extraConstant: "A derivative has no arbitrary constant in it.",
  empty: "There is no answer to check.",
  unreadable: "The desk cannot read this answer as mathematics, and it does not guess.",
  notNumber: "The answer should be a number, and this one depends on x.",
  notFinite: "This answer has no finite value to compare.",
  rounded: "This is a rounded decimal; the desk asks for the exact value.",
  noCompare: "The desk cannot compare this answer where the question's function is defined.",
  badSpec: "The desk cannot work this question out for itself, so it does not judge the answer.",
} as const;

const REJECT = {
  shape: "The shape is not one of the desk's shapes.",
  answer: "A spec carries no answer field: the desk works the answer out itself.",
  read: "The desk cannot read the function.",
  constant: "The function carries an arbitrary constant; a question's function has none.",
  noX: "The function has no x in it.",
  number: "A parameter is not a finite number the desk can read.",
  interval: "The interval is empty or reversed.",
  side: "A side is only asked of a limit at a point.",
  steps: "The number of steps must be a whole number from one to six.",
  value: "The value there is not finite.",
  derivativeUndefined: "The derivative there does not exist or is not finite.",
  derivativeZero: "The derivative is identically zero, so there is nothing to find.",
  derivativeSparse: "The derivative is not defined at enough points for the desk to check an answer.",
  integrandSparse: "The integrand is not defined at enough points for the desk to check an answer.",
  integrandZero: "The integrand is identically zero, so there is nothing to find.",
  integralUndefined: "The integral is not finite on this interval.",
  integralZero: "The integral is zero, which only a question about symmetry should ask.",
  integralNotZero: "The spec says the integral is zero, but it is not.",
  limitDne: "The limit does not exist.",
  limitUndefined: "The function is not defined near that point.",
  notDefinedOn: "The function is not finite on the whole interval.",
  criticalNotUnique: "There is no unique critical point inside the interval.",
  extremumAtEnd: "The extremum is at an endpoint, not where the derivative is zero.",
  newtonUndefined: "A Newton step is not finite: the tangent is flat or the function undefined.",
  newtonConverged: "The asked-for iterate cannot be told from the next one (or the one before) at the shape's tolerance.",
} as const;

// ------------------------------------------------------------------ reading a spec

type Truth =
  | { kind: "number"; v: number }
  | { kind: "inf"; sign: 1 | -1 }
  /** The derivative, sampled at SAMPLES (NaN where it is not defined). */
  | { kind: "derivative"; at: Map<number, number> }
  | { kind: "antiderivative"; f: Expr };

type Read = { ok: true; spec: CalcSpec; f: Expr; truth: Truth } | { ok: false; why: string };

const isShape = (s: unknown): s is CalcShape => typeof s === "string" && (CALC_SHAPES as readonly string[]).includes(s);
const fin = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** A Num's value, or null. */
function num(n: unknown): number | null {
  if (fin(n)) return n;
  if (typeof n !== "string") return null;
  const e = compile(n);
  if (!e || e.usesX || e.constant) return null;
  const v = e.at();
  return fin(v) ? v : null;
}

/** The fixed five-point slope, for finding critical points: cheap, and good to about 1e-10 away from a corner. */
const slopeOf = (f: Expr) => (x: number) => {
  const h = SLOPE_H * Math.max(1, Math.abs(x));
  const v = (-f.at(x + 2 * h) + 8 * f.at(x + h) - 8 * f.at(x - h) + f.at(x - 2 * h)) / (12 * h);
  return Number.isFinite(v) ? v : NaN;
};

/** The Newton iterates x_1 = x0, x_2, ... x_(n+1), or null when a step is not finite. */
function newtonIterates(f: Expr, x0: number, n: number): number[] | null {
  const xs = [x0];
  for (let k = 0; k < n; k++) {
    const x = xs[k], y = f.at(x), d = derivativeAt(f, x);
    if (!fin(y) || d === null || Math.abs(d) <= ZERO_REL * Math.max(1, Math.abs(y))) return null;
    const next = x - y / d;
    if (!fin(next)) return null;
    xs.push(next);
  }
  return xs;
}

function read(spec: unknown): Read {
  if (!spec || typeof spec !== "object" || !isShape((spec as { shape?: unknown }).shape)) return { ok: false, why: REJECT.shape };
  const s = spec as CalcSpec & Record<string, unknown>;
  if (["answer", "truth", "solution", "value"].some((k) => k in s)) return { ok: false, why: REJECT.answer };
  const f = typeof s.f === "string" ? compile(s.f) : null;
  if (!f) return { ok: false, why: REJECT.read };
  if (f.constant) return { ok: false, why: REJECT.constant };
  if (!f.usesX) return { ok: false, why: REJECT.noX };
  const ok = (truth: Truth): Read => ({ ok: true, spec: s, f, truth });
  const interval = (on: unknown): [number, number] | string => {
    if (!Array.isArray(on) || on.length !== 2) return REJECT.number;
    const a = num(on[0]), b = num(on[1]);
    if (a === null || b === null) return REJECT.number;
    return a < b ? [a, b] : REJECT.interval;
  };
  switch (s.shape) {
    case "evaluate": {
      const at = num(s.at);
      if (at === null) return { ok: false, why: REJECT.number };
      const v = f.at(at);
      return fin(v) ? ok({ kind: "number", v }) : { ok: false, why: REJECT.value };
    }
    case "derivative": {
      const at = new Map<number, number>();
      let defined = 0, nonzero = false;
      for (const x of SAMPLES) {
        const d = derivativeAt(f, x);
        at.set(x, d ?? NaN);
        if (d === null) continue;
        defined++;
        if (Math.abs(d) > ZERO_REL * Math.max(1, Math.abs(f.at(x)))) nonzero = true;
      }
      if (defined < 3) return { ok: false, why: REJECT.derivativeSparse };
      return nonzero ? ok({ kind: "derivative", at }) : { ok: false, why: REJECT.derivativeZero };
    }
    case "derivative-at": {
      const at = num(s.at);
      if (at === null) return { ok: false, why: REJECT.number };
      const d = derivativeAt(f, at);
      return d === null ? { ok: false, why: REJECT.derivativeUndefined } : ok({ kind: "number", v: d });
    }
    case "antiderivative": {
      const vals = SAMPLES.map((x) => f.at(x)).filter(fin);
      if (vals.length < 3) return { ok: false, why: REJECT.integrandSparse };
      if (vals.every((v) => v === 0)) return { ok: false, why: REJECT.integrandZero };
      return ok({ kind: "antiderivative", f });
    }
    case "definite-integral": {
      const a = num(s.a), b = num(s.b);
      if (a === null || b === null) return { ok: false, why: REJECT.number };
      if (a === b) return { ok: false, why: REJECT.interval };
      const v = integrate(f, a, b);
      if (v === null) return { ok: false, why: REJECT.integralUndefined };
      const size = integrate((x) => Math.abs(f.at(x)), Math.min(a, b), Math.max(a, b)) ?? Math.abs(v);
      const zero = Math.abs(v) <= INTEGRAL_ZERO * Math.max(1, size);
      if (s.zero === true) return zero ? ok({ kind: "number", v: 0 }) : { ok: false, why: REJECT.integralNotZero };
      return zero ? { ok: false, why: REJECT.integralZero } : ok({ kind: "number", v });
    }
    case "limit": {
      if (s.side !== undefined && s.side !== "+" && s.side !== "-") return { ok: false, why: REJECT.side };
      let L: Limit | null;
      if (s.at === "inf" || s.at === "-inf") {
        if (s.side !== undefined) return { ok: false, why: REJECT.side };
        L = limitInf(f, s.at === "inf" ? 1 : -1);
      } else {
        const at = num(s.at);
        if (at === null) return { ok: false, why: REJECT.number };
        L = limitAt(f, at, s.side);
      }
      if (!L) return { ok: false, why: REJECT.limitUndefined };
      if (L.kind === "dne") return { ok: false, why: REJECT.limitDne };
      return ok(L.kind === "inf" ? { kind: "inf", sign: L.sign } : { kind: "number", v: L.v });
    }
    case "critical-point": {
      const on = interval(s.on);
      if (typeof on === "string") return { ok: false, why: on };
      const [a, b] = on;
      if (!extremumIn(f, a, b, "max")) return { ok: false, why: REJECT.notDefinedOn };
      const end = AT_END * Math.max(1, b - a);
      const inside = rootsIn(slopeOf(f), a, b).filter((r) => r - a > end && b - r > end);
      return inside.length === 1 ? ok({ kind: "number", v: inside[0] }) : { ok: false, why: REJECT.criticalNotUnique };
    }
    case "extremum": {
      const on = interval(s.on);
      if (typeof on === "string") return { ok: false, why: on };
      if (s.kind !== "max" && s.kind !== "min") return { ok: false, why: REJECT.shape };
      const [a, b] = on, e = extremumIn(f, a, b, s.kind);
      if (!e) return { ok: false, why: REJECT.notDefinedOn };
      const end = AT_END * Math.max(1, b - a);
      if (e.x - a <= end || b - e.x <= end) return { ok: false, why: REJECT.extremumAtEnd };
      return ok({ kind: "number", v: e.y });
    }
    case "newton-step": {
      if (typeof s.steps !== "number" || !Number.isInteger(s.steps) || s.steps < 1 || s.steps > MAX_STEPS) return { ok: false, why: REJECT.steps };
      const x0 = num(s.x0);
      if (x0 === null) return { ok: false, why: REJECT.number };
      const xs = newtonIterates(f, x0, s.steps + 1);
      if (!xs) return { ok: false, why: REJECT.newtonUndefined };
      const n = s.steps, x = xs[n], tol = TOLERANCE["newton-step"].exact * Math.max(1, Math.abs(x));
      if (Math.abs(xs[n + 1] - x) <= tol || Math.abs(x - xs[n - 1]) <= tol) return { ok: false, why: REJECT.newtonConverged };
      return ok({ kind: "number", v: x });
    }
  }
}

/**
 * Is this spec a question the desk can print and judge? The function reads, has x and no +C; every parameter is a
 * finite number; the truth exists and is finite; and it is not degenerate - a derivative that is identically zero, a
 * limit that does not exist, an integral that is zero (unless the spec says `zero: true`), a critical point that is
 * not unique inside the interval, an extremum at an endpoint, a Newton iterate that cannot be told from its neighbour
 * at the shape's tolerance. A spec with an answer field is refused: the desk works the answer out itself.
 */
export function wellFormed(spec: unknown): { ok: true } | { ok: false; why: string } {
  const r = read(spec);
  return r.ok ? { ok: true } : { ok: false, why: r.why };
}

// ------------------------------------------------------------------ printing the question

const tidy = (s: string) => s.trim().replace(/\s+/g, " ");
const isSum = (e: Expr) => e.node.k === "add" || e.node.k === "sub";
const numPlain = (n: Num) => (typeof n === "number" ? String(n) : tidy(n));
const numTex = (n: Num) => { if (typeof n === "number") return String(n); const e = compile(n); return e ? toTex(e) : tidy(n); };
/** A bound or subscript as plain text: a bare non-negative number as it is, anything else in brackets (int_(-1)^2). */
const script = (n: Num) => { const p = numPlain(n); return /^\d+(\.\d+)?$/.test(p) ? p : `(${p})`; };
const approach = (at: Num | "inf" | "-inf", side?: "+" | "-") => (at === "inf" ? "infinity" : at === "-inf" ? "-infinity" : `${numPlain(at)}${side ?? ""}`);
const approachTex = (at: Num | "inf" | "-inf", side?: "+" | "-") => (at === "inf" ? "\\infty" : at === "-inf" ? "-\\infty" : `${numTex(at)}${side ? `^${side}` : ""}`);

/**
 * The spec and its function when every field question() prints is there and of its type - the function reads with x
 * and no +C, no answer key, each point a number the desk reads, an interval of exactly two in order, a known kind,
 * whole steps from one to six, a side of '+', '-' or none ('' is the model's two-sided limit) - else null. Structure
 * only, never the truth: a degenerate question still prints (wellFormed refuses it), a malformed one never throws.
 */
function printable(spec: unknown): { s: CalcSpec; f: Expr } | null {
  if (!spec || typeof spec !== "object" || !isShape((spec as { shape?: unknown }).shape)) return null;
  const s = spec as CalcSpec & Record<string, unknown>;
  if (["answer", "truth", "solution", "value"].some((k) => k in s)) return null;
  const f = typeof s.f === "string" ? compile(s.f) : null;
  if (!f || f.constant || !f.usesX) return null;
  const has = (...n: unknown[]) => n.every((v) => num(v) !== null);
  const inOrder = (on: unknown) => Array.isArray(on) && on.length === 2 && has(on[0], on[1]) && num(on[0])! < num(on[1])!;
  const ok = (() => {
    switch (s.shape) {
      case "evaluate": case "derivative-at": return has(s.at);
      case "derivative": case "antiderivative": return true;
      case "definite-integral": return has(s.a, s.b);
      case "limit": {
        const side = s.side as unknown;
        if (side !== undefined && side !== "" && side !== "+" && side !== "-") return false;
        return s.at === "inf" || s.at === "-inf" ? !side : has(s.at);
      }
      case "critical-point": return inOrder(s.on);
      case "extremum": return inOrder(s.on) && (s.kind === "max" || s.kind === "min");
      case "newton-step": return has(s.x0) && Number.isInteger(s.steps) && s.steps >= 1 && s.steps <= MAX_STEPS;
    }
  })();
  return ok ? { s, f } : null;
}

/**
 * The question, printed by code from the spec, as the plain text our prompts use and the TeX the typesetter reads:
 * 'Differentiate f(x) = 3x^2 + 2x.', 'Find lim_(x->0) sin(3x)/x.', 'Evaluate int_0^3 2x dx.', 'Find the critical point
 * of f(x) = x^2 - 4x + 1 on [0, 5].' Null when the spec is malformed (printable): a malformed spec reaches here from
 * a model, a session file or a page reader, and it is a null, never a throw. It never carries the answer: the spec
 * has none, and the only numbers printed are the spec's own parameters.
 */
export function question(spec: unknown): { plain: string; tex: string } | null {
  const p = printable(spec);
  if (!p) return null;
  const { s, f } = p;
  const F = tidy(s.f), Ft = toTex(f);
  const Fb = isSum(f) ? `(${F})` : F, Fbt = isSum(f) ? `(${Ft})` : Ft;
  const nums = (...n: unknown[]) => n.every((v) => num(v) !== null);
  switch (s.shape) {
    case "evaluate":
      if (!nums(s.at)) return null;
      return { plain: `Find f(${numPlain(s.at)}) for f(x) = ${F}.`, tex: `\\text{Find } f(${numTex(s.at)}) \\text{ for } f(x) = ${Ft}.` };
    case "derivative":
      return { plain: `Differentiate f(x) = ${F}.`, tex: `\\text{Differentiate } f(x) = ${Ft}.` };
    case "derivative-at":
      if (!nums(s.at)) return null;
      return { plain: `Find f'(${numPlain(s.at)}) for f(x) = ${F}.`, tex: `\\text{Find } f'(${numTex(s.at)}) \\text{ for } f(x) = ${Ft}.` };
    case "antiderivative":
      return { plain: `Find int ${Fb} dx.`, tex: `\\text{Find } \\int ${Fbt}\\,dx.` };
    case "definite-integral":
      if (!nums(s.a, s.b)) return null;
      return { plain: `Evaluate int_${script(s.a)}^${script(s.b)} ${Fb} dx.`, tex: `\\text{Evaluate } \\int_{${numTex(s.a)}}^{${numTex(s.b)}} ${Fbt}\\,dx.` };
    case "limit":
      if (s.at !== "inf" && s.at !== "-inf" && !nums(s.at)) return null;
      return { plain: `Find lim_(x->${approach(s.at, s.side)}) ${Fb}.`, tex: `\\text{Find } \\lim_{x \\to ${approachTex(s.at, s.side)}} ${Fbt}.` };
    case "critical-point":
      if (!Array.isArray(s.on) || !nums(...s.on)) return null;
      return { plain: `Find the critical point of f(x) = ${F} on [${numPlain(s.on[0])}, ${numPlain(s.on[1])}].`, tex: `\\text{Find the critical point of } f(x) = ${Ft} \\text{ on } [${numTex(s.on[0])}, ${numTex(s.on[1])}].` };
    case "extremum": {
      if (!Array.isArray(s.on) || !nums(...s.on)) return null;
      const word = s.kind === "min" ? "minimum" : "maximum";
      return { plain: `Find the ${word} value of f(x) = ${F} on [${numPlain(s.on[0])}, ${numPlain(s.on[1])}].`, tex: `\\text{Find the ${word} value of } f(x) = ${Ft} \\text{ on } [${numTex(s.on[0])}, ${numTex(s.on[1])}].` };
    }
    case "newton-step": {
      if (!nums(s.x0) || typeof s.steps !== "number") return null;
      const n = s.steps + 1;
      return { plain: `Use Newton's method on ${F} = 0 with x_1 = ${numPlain(s.x0)} to find x_${n < 10 ? n : `(${n})`}.`, tex: `\\text{Use Newton's method on } ${Ft} = 0 \\text{ with } x_1 = ${numTex(s.x0)} \\text{ to find } x_{${n}}.` };
    }
  }
}

// ------------------------------------------------------------------ judging an answer

export interface CalcVerdict { verdict: "right" | "wrong" | "unsure"; slip?: string; why: string; }

/** The answer as written, without a leading 'f(x) =', 'x =', "y' =" or 'lim =' and without a closing full stop. */
const cleanAnswer = (a: string) => {
  let s = a.trim();
  const eq = s.lastIndexOf("=");
  if (eq >= 0) s = s.slice(eq + 1).trim();
  return s.replace(/\.$/, "").trim();
};
/** An infinity as a learner writes it: inf, infinity, ∞, with an optional sign. */
const infinityOf = (s: string): 1 | -1 | null => {
  const m = /^([+\-−]?)\s*(inf|infinity|∞)$/i.exec(s.replace(/\s+/g, " ").trim());
  return m ? (m[1] === "-" || m[1] === "−" ? -1 : 1) : null;
};
const DNE = /^(dne|does not exist|no limit|undefined)$/i;
/** A plain decimal numeral (0.333, 16.0, .5): the learner rounded. */
const isDecimal = (s: string) => /^[+\-−]?(\d+\.\d*|\.\d+)$/.test(s.replace(/\s+/g, ""));
const withinRel = (u: number, v: number, tol: number) => Math.abs(u - v) <= tol * Math.max(1, Math.abs(v));

const verdict = (v: CalcVerdict["verdict"], why: string, slip?: string): CalcVerdict => (slip ? { verdict: v, slip, why } : { verdict: v, why });

function judgeNumber(shape: keyof typeof TOLERANCE, truth: number, s: number, decimal: boolean): CalcVerdict {
  const tol = decimal ? TOLERANCE[shape].rounded : TOLERANCE[shape].exact;
  if (withinRel(s, truth, tol)) return verdict("right", WHY.right);
  if (!withinRel(0, truth, tol) && withinRel(-s, truth, tol)) return verdict("wrong", WHY.sign, "sign");
  if (decimal && withinRel(s, truth, ROUNDED_CLOSE)) return verdict("unsure", WHY.rounded);
  return verdict("wrong", WHY.wrong);
}

/**
 * The verdict on a learner's answer, decided from the spec alone - the truth is recomputed, never stored.
 *   - derivative: the answer is the same function as the numeric derivative at the samples (FUNCTION_TOL); its
 *     negation is 'wrong' with slip 'sign'; a +C on a derivative is 'wrong'.
 *   - antiderivative: the answer's numeric derivative is the integrand at the samples; right needs the arbitrary
 *     constant - a correct function with no +C is 'wrong' with slip 'lost-constant'; the negation is slip 'sign'.
 *   - number shapes: within the shape's TOLERANCE (exact or rounded); fractions, sqrt, pi and ln forms read; a
 *     negated truth is slip 'sign'; a rounded decimal close to an exact shape's truth is 'unsure'. An infinite limit
 *     is answered by inf, infinity or ∞ (with its sign); 'dne' is wrong for a limit that exists.
 *   - an empty, unreadable or non-finite answer, an answer in x for a number, or a spec the desk cannot work out, is
 *     'unsure': the desk does not guess.
 * The `why` is a fixed sentence of the desk's, with no value in it.
 */
export function checkAnswer(spec: unknown, studentAnswer: unknown): CalcVerdict {
  const r = read(spec);
  if (!r.ok) return verdict("unsure", WHY.badSpec);
  if (typeof studentAnswer !== "string" || !studentAnswer.trim()) return verdict("unsure", WHY.empty);
  const ans = cleanAnswer(studentAnswer);
  if (!ans) return verdict("unsure", WHY.empty);
  const { truth } = r;
  if (truth.kind === "inf" || r.spec.shape === "limit") {
    const inf = infinityOf(ans);
    if (inf !== null) {
      if (truth.kind !== "inf") return verdict("wrong", WHY.wrong);
      return inf === truth.sign ? verdict("right", WHY.right) : verdict("wrong", WHY.sign, "sign");
    }
    if (DNE.test(ans)) return verdict("wrong", WHY.wrong);
  }
  const e = compile(ans);
  if (!e) return verdict("unsure", WHY.unreadable);
  if (truth.kind === "derivative") {
    const g = (x: number) => truth.at.get(x) ?? NaN;
    if (sameFunction(e, g, FUNCTION_TOL)) return e.constant ? verdict("wrong", WHY.extraConstant) : verdict("right", WHY.right);
    if (sameFunction(e, (x) => -g(x), FUNCTION_TOL)) return verdict("wrong", WHY.sign, "sign");
    return comparable((x) => e.at(x), g) ? verdict("wrong", WHY.wrong) : verdict("unsure", WHY.noCompare);
  }
  if (truth.kind === "antiderivative") {
    const d = (x: number) => derivativeAt(e, x) ?? NaN;
    if (sameFunction(d, truth.f, FUNCTION_TOL)) return e.constant ? verdict("right", WHY.right) : verdict("wrong", WHY.lostConstant, "lost-constant");
    if (sameFunction(d, (x) => -truth.f.at(x), FUNCTION_TOL)) return verdict("wrong", WHY.sign, "sign");
    return comparable(d, (x) => truth.f.at(x)) ? verdict("wrong", WHY.wrong) : verdict("unsure", WHY.noCompare);
  }
  if (e.constant) return verdict("unsure", WHY.unreadable);
  if (e.usesX) return verdict("unsure", WHY.notNumber);
  const s = e.at();
  if (!fin(s)) return verdict("unsure", WHY.notFinite);
  if (truth.kind === "inf") return verdict("wrong", WHY.wrong);
  return judgeNumber(r.spec.shape as keyof typeof TOLERANCE, truth.v, s, isDecimal(ans));
}

/** Can two functions be compared at all: at least three samples where both are defined? */
function comparable(a: (x: number) => number, b: (x: number) => number): boolean {
  let n = 0;
  for (const x of SAMPLES) {
    if (fin(a(x)) && fin(b(x))) n++;
  }
  return n >= 3;
}

// ------------------------------------------------------------------ the leak check

/**
 * Number words to ninety-nine, as rules/maths.ts said() reads them. Written again here, not imported: said() is
 * private to rules/maths.ts, and this module imports only calc-expr.ts (rules stay pure and small).
 */
const WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  eleven: "11", twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18",
  nineteen: "19", twenty: "20", thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70", eighty: "80", ninety: "90",
};
const NUMBER_WORD = /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:(?:-|\s+)(one|two|three|four|five|six|seven|eight|nine)\b)?|\b([a-z]+)\b/g;
/** A line as it would be said, numbers in digits: 'minus sixteen' is -16, 'one and a half' is 1.5. */
const spoken = (line: string) => line.toLowerCase().replace(/[−–—‐‑]/g, "-")
  .replace(NUMBER_WORD, (w, tens: string | undefined, unit: string | undefined, word: string | undefined) =>
    tens ? String(Number(WORDS[tens]) + (unit ? Number(WORDS[unit]) : 0)) : Object.hasOwn(WORDS, word!) ? WORDS[word!] : w)
  .replace(/(\d+)\s+and\s+a\s+half\b/g, "$1.5")
  .replace(/\b(?:minus|negative)\s*(?=\d)/g, "-")
  .replace(/(^|[^\s\da-z)\]²])(\s*)-\s+(?=\d)/g, "$1$2-");

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/**
 * A piece of the question as a pattern: spacing free, '->' also as '→', and only as a whole - not inside a larger
 * expression (the function 'x' is not the x of 'x^2/2', 'x^2 + 1' is not the start of 'x^2 + 10').
 */
const piecePattern = (p: string) => new RegExp(`(?<![\\w^*/.(|])${[...p.replace(/\s+/g, "")].map(escapeRe).join("\\s*").replace(/-\\s\*>/g, "(?:-\\s*>|→)")}(?![\\w^*/.)|(])`, "gi");

/** The question's own notation that may be quoted back: never the answer (the spec's function aside, handled apart). */
function ownPieces(s: CalcSpec): string[] {
  const out: string[] = ["f(x) ="];
  switch (s.shape) {
    case "evaluate": out.push(`f(${numPlain(s.at)})`); break;
    case "derivative-at": out.push(`f'(${numPlain(s.at)})`); break;
    case "definite-integral": out.push(`int_${script(s.a)}^${script(s.b)}`, `from ${numPlain(s.a)} to ${numPlain(s.b)}`); break;
    case "limit": {
      const a = approach(s.at, s.side), bare = s.at === "inf" ? "infinity" : s.at === "-inf" ? "-infinity" : numPlain(s.at);
      out.push(`lim_(x->${a})`, `lim_(x->${bare})`, `x->${a}`, `x->${bare}`);
      for (const verb of ["approaches", "tends to", "goes to", "gets close to", "near"]) out.push(`x ${verb} ${bare}`);
      break;
    }
    case "critical-point": case "extremum": out.push(`[${numPlain(s.on[0])}, ${numPlain(s.on[1])}]`); break;
    case "newton-step": out.push(`x_1 = ${numPlain(s.x0)}`, `x_${s.steps + 1}`, `x_(${s.steps + 1})`); break;
  }
  return out;
}

/** Most tokens a window of the line may span. */
const WINDOW = 6;

/**
 * Does this hint or explanation line state the answer? It reads the line as it would be said (number words to
 * ninety-nine, 'minus', 'and a half'), sets aside the question's own notation (its function - unless the function is
 * itself the answer - its point, bounds, interval, starting value), then reads the line in windows of up to six
 * whitespace-separated tokens, taking at each place the longest window the engine can read (so the 4 in 'x^2 - 4' is
 * part of an expression, not a number standing alone):
 *   - a number shape leaks by any window whose value is the truth to ROUNDED_CLOSE (a fraction, a decimal, sqrt, pi
 *     or ln forms, 3^2), or a negative number whose size is the truth ('minus sixteen' gives the size away);
 *   - a function shape leaks by any window that checkAnswer would call right (an antiderivative with or without +C);
 *   - an infinite limit leaks by naming infinity.
 */
export function leaksCalc(spec: unknown, line: unknown): boolean {
  if (typeof line !== "string" || !line.trim()) return false;
  const r = read(spec);
  if (!r.ok) return false;
  const { truth, f } = r, s = r.spec;
  let text = spoken(line);
  if (truth.kind === "inf") return /infinit|∞|\binf\b/.test(text);
  const fnRight = (e: Expr): boolean => {
    if (truth.kind === "derivative") return sameFunction(e, (x) => truth.at.get(x) ?? NaN, FUNCTION_TOL);
    if (truth.kind === "antiderivative") return sameFunction((x) => derivativeAt(e, x) ?? NaN, truth.f, FUNCTION_TOL);
    return false;
  };
  // the question's own pieces, and its function unless the function is the answer
  const pieces = ownPieces(s);
  if (!fnRight(f)) pieces.push(s.f);
  for (const p of pieces) text = text.replace(piecePattern(p.toLowerCase()), " ");
  const tokens = text.replace(/[=,;:!?"“”‘’]/g, " ").split(/\s+/)
    .map((t) => t.replace(/\.+$/, ""))
    .filter(Boolean);
  /** One token alone, also without a bracket it does not close ('(16', '16)'): prose wraps numbers in brackets. */
  const single = (t: string): Expr | null => {
    const e = compile(t);
    if (e) return e;
    const open = (t.match(/\(/g) ?? []).length, close = (t.match(/\)/g) ?? []).length;
    return open > close ? compile(t.replace(/^\(+/, "")) : close > open ? compile(t.replace(/\)+$/, "")) : null;
  };
  const numberRight = (e: Expr, first: string): boolean => {
    if (truth.kind !== "number" || e.usesX || e.constant) return false;
    const v = e.at();
    if (!fin(v)) return false;
    return withinRel(v, truth.v, ROUNDED_CLOSE) || (first.startsWith("-") && withinRel(-v, truth.v, ROUNDED_CLOSE));
  };
  for (let i = 0; i < tokens.length;) {
    let took = 0, hit = false;
    for (let n = Math.min(WINDOW, tokens.length - i); n >= 1; n--) {
      const e = n === 1 ? single(tokens[i]) : compile(tokens.slice(i, i + n).join(" "));
      if (!e) continue;
      took = n;
      hit = truth.kind === "number" ? numberRight(e, tokens[i]) : fnRight(e);
      break;
    }
    if (hit) return true;
    i += Math.max(1, took);
  }
  return false;
}

// ------------------------------------------------------------------ the slip vocabulary

/** `name` is the slip's title, `says` the desk's line, `points` where to look - none carries a value. */
export interface CalcSlip { id: string; name: string; says: string; points: string; shapes: readonly CalcShape[]; }

const DIFF: CalcShape[] = ["derivative", "derivative-at", "critical-point", "extremum", "newton-step"];
const INTEGRAL: CalcShape[] = ["antiderivative", "definite-integral"];

export const CALC_SLIPS: readonly CalcSlip[] = [
  { id: "lost-constant", name: "The constant left off", says: "Every antiderivative carries an arbitrary constant. Add it to the end of your answer.", points: "the end of the last line", shapes: ["antiderivative"] },
  { id: "sign", name: "The sign turned over", says: "The size is right but the sign is not. Follow the minus sign through each line.", points: "the line where the sign changed", shapes: CALC_SHAPES },
  { id: "forgot-chain", name: "The inside not differentiated", says: "A function sits inside another here. Multiply by the derivative of the inside as well.", points: "the line where you differentiated", shapes: DIFF },
  { id: "product-as-product", name: "Product rule skipped", says: "The derivative of a product is not the product of the derivatives. Use the product rule: each factor differentiated in turn.", points: "the line with the two factors", shapes: DIFF },
  { id: "quotient-order", name: "Quotient rule the wrong way round", says: "The two terms on top of the quotient rule are in the wrong order. It is bottom times the derivative of the top first.", points: "the numerator of the quotient", shapes: DIFF },
  { id: "power-off-by-one", name: "The power moved the wrong way", says: "The power changed by one in the wrong direction. Differentiating lowers it; integrating raises it.", points: "the exponent", shapes: [...DIFF, ...INTEGRAL] },
  { id: "wrong-trig-sign", name: "A trig sign flipped", says: "One trig derivative or integral has the wrong sign. Check which of sine and cosine brings a minus.", points: "the trig term", shapes: [...DIFF, ...INTEGRAL] },
  { id: "lost-inner-factor", name: "The inner factor not divided out", says: "Integrating a function of a linear inside needs dividing by the inside's coefficient. Differentiate your answer to see the extra factor.", points: "the integrated term", shapes: INTEGRAL },
  { id: "limit-substituted-early", name: "Substituted into zero over zero", says: "Putting the point straight in gives zero over zero, which is not a value. Simplify first, then let x approach the point.", points: "the first line", shapes: ["limit"] },
  { id: "bounds-swapped", name: "The bounds swapped", says: "The upper and lower limits were used the wrong way round. It is the value at the top minus the value at the bottom.", points: "the evaluation line", shapes: ["definite-integral"] },
  { id: "forgot-second-derivative-check", name: "The kind of point not checked", says: "A zero derivative alone does not say maximum or minimum. Check the sign of the second derivative, or of the first on each side.", points: "the critical point", shapes: ["critical-point", "extremum"] },
  { id: "decimal-newton-slip", name: "A Newton step miscalculated", says: "The method is right but a step's arithmetic slipped. Recompute the function and its derivative at the last iterate.", points: "the step where the numbers changed", shapes: ["newton-step"] },
  { id: "arithmetic-slip", name: "A number came out wrong", says: "The method is right but the arithmetic on one line is not. Re-do just that line.", points: "the line you are on", shapes: CALC_SHAPES },
];

/** The slip ids the model may pick from for an item of this shape, already judged wrong by code. */
export function slipsFor(shape: unknown): string[] {
  return isShape(shape) ? CALC_SLIPS.filter((s) => s.shapes.includes(shape)).map((s) => s.id) : [];
}

// ------------------------------------------------------------------ reading a printed question back into a spec

/** Longest question text the reader tries: a page item is one line, and the engine reads at most MAX_LENGTH anyway. */
const MAX_QUESTION = 300;

/** A printed question in one spelling: dashes, arrows, primes, the integral sign, infinity; no item number, no final stop. */
const normalQuestion = (t: string) => tidy(t
  .replace(/[−–—‐‑]/g, "-").replace(/→|⟶/g, "->").replace(/[’‘′ʹ]/g, "'")
  .replace(/∫\s*(?=_)/g, "int").replace(/∫\s*/g, "int ").replace(/∞/g, "infinity"))
  .replace(/^(?:\d{1,2}[.)]|\(\d{1,2}\)|[a-h]\)|\([a-h]\))\s+/i, "")
  // 'Differentiate: y = x e^x' - a colon straight after the leading words
  .replace(/^([a-z][a-z' ]*?)\s*:\s*/i, "$1 ")
  .replace(/\s*[.?]$/, "");

const CLOSING: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
/** Where the bracket opened at s[i] closes, or -1. */
function closeAt(s: string, i: number): number {
  const open = s[i], close = CLOSING[open];
  if (!close) return -1;
  let depth = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === open) depth++;
    else if (s[k] === close && --depth === 0) return k;
  }
  return -1;
}
/** Does one bracket pair wrap the whole text? */
const wrapped = (s: string) => s.length > 1 && closeAt(s, 0) === s.length - 1;

/** A parameter as a spec carries it: a plain decimal as a number, a constant ('pi/4', 'ln(7)/2') as its text; null when it does not read. */
function paramOf(t: string): Num | null {
  let s = tidy(t);
  if (wrapped(s)) s = tidy(s.slice(1, -1));
  if (/^[+-]?\d+(\.\d+)?$/.test(s)) { const v = Number(s); return fin(v) ? v : null; }
  return num(s) === null ? null : s;
}

/**
 * The function as the question writes it, or null: an expression in x the engine reads, with no '=' and no +C. With
 * `unwrap`, one bracket pair around a whole sum is the question's own (question() brackets a sum after int and lim).
 */
function fnOf(t: string, unwrap: boolean): string | null {
  let s = tidy(t);
  if (unwrap && s.startsWith("(") && wrapped(s)) {
    const inner = compile(s.slice(1, -1));
    if (inner && isSum(inner)) s = tidy(s.slice(1, -1));
  }
  if (!s || s.includes("=")) return null;
  const e = compile(s);
  return e && e.usesX && !e.constant ? s : null;
}

/** An interval as '[a, b]' or '(a, b)'. */
function intervalOf(t: string): [Num, Num] | null {
  const s = tidy(t);
  if (!/^[[(]/.test(s) || !/[\])]$/.test(s)) return null;
  const inner = s.slice(1, -1), parts: string[] = [];
  let depth = 0, from = 0;
  for (let k = 0; k < inner.length; k++) {
    const c = inner[k];
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (c === "," && depth === 0) { parts.push(inner.slice(from, k)); from = k + 1; }
  }
  parts.push(inner.slice(from));
  if (parts.length !== 2) return null;
  const a = paramOf(parts[0]), b = paramOf(parts[1]);
  return a === null || b === null ? null : [a, b];
}

type Approach = { at: Num | "inf" | "-inf"; side?: "+" | "-" };
/** Where x goes: a number with an optional side ('0+', '2^-', 'from the right'), or infinity with its sign. */
function approachOf(t: string, words?: string): Approach | null {
  let s = tidy(t).replace(/\s+/g, "").replace(/⁺/g, "+").replace(/⁻/g, "-").replace(/^(negative|minus)/i, "-").replace(/^(positive|plus)/i, "+");
  let side: "+" | "-" | undefined = words ? (/right|above/i.test(words) ? "+" : "-") : undefined;
  if (/^\+?(infinity|inf)$/i.test(s)) return side ? null : { at: "inf" };
  if (/^-(infinity|inf)$/i.test(s)) return side ? null : { at: "-inf" };
  const m = /^(.+?)\^?([+-])$/.exec(s);
  if (m && !side) { side = m[2] as "+" | "-"; s = m[1]; }
  const at = paramOf(s);
  return at === null ? null : side ? { at, side } : { at };
}

/** The bound after 'int_' or '^': a bracketed group, or a bare run up to `stop`. [bound, rest] or null. */
function boundOf(s: string, stop: RegExp): [string, string] | null {
  if (CLOSING[s[0]]) {
    const end = closeAt(s, 0);
    return end < 0 ? null : [s.slice(1, end), s.slice(end + 1)];
  }
  const m = stop.exec(s);
  const end = m ? m.index : s.length;
  return end === 0 ? null : [s.slice(0, end), s.slice(end)];
}

const VERB = String.raw`(?:find|evaluate|compute|calculate|determine|work out|what is)`;
/** 'f(x) = ', 'g(x)=', 'y = ' before a function. */
const FN = String.raw`(?:(?:[a-z]\s*\(\s*x\s*\)|y)\s*=\s*)?`;
/** A domain the page adds after the function ('for x > 0'): read and set aside. */
const DOMAIN = String.raw`(?:\s*,?\s*(?:for|where|when)\s+x\s*(?:>=|<=|>|<|≥|≤|!=|≠)\s*[+-]?(?:\d+(?:\.\d+)?|pi|π|e))?`;
/** A parameter inside f(...) or f'(...): one level of brackets. */
const ARG = String.raw`((?:[^()]|\([^()]*\))+?)`;
const GIVEN = String.raw`(?:for|if|when|given|where)`;
const re = (s: string) => new RegExp(`^${s}$`, "i");

/** The page's phrasings, in order: each a pattern and the spec its groups make (null when a piece does not read). */
const READERS: [RegExp, (m: RegExpExecArray) => CalcSpec | null][] = [
  // f(3) for f(x) = ...
  [re(`${VERB}\\s+([a-z])\\s*\\(\\s*${ARG}\\s*\\)\\s+${GIVEN}\\s+\\1\\s*\\(\\s*x\\s*\\)\\s*=\\s*(.+)`), (m) => {
    const at = paramOf(m[2]), f = fnOf(m[3], false);
    return at === null || !f ? null : { shape: "evaluate", f, at };
  }],
  // f'(x) / f'(2) for f(x) = ..., also 'Use the definition to find f'(x) ...'
  [re(`(?:use\\s+the\\s+definition(?:\\s+of\\s+(?:the\\s+|a\\s+)?derivative)?\\s+to\\s+)?${VERB}\\s+([a-z])'\\s*\\(\\s*${ARG}\\s*\\)\\s+${GIVEN}\\s+\\1\\s*\\(\\s*x\\s*\\)\\s*=\\s*(.+?)${DOMAIN}`), (m) => {
    const f = fnOf(m[3], false);
    if (!f) return null;
    if (/^x$/i.test(tidy(m[2]))) return { shape: "derivative", f };
    const at = paramOf(m[2]);
    return at === null ? null : { shape: "derivative-at", f, at };
  }],
  // dy/dx for y = ...
  [re(`${VERB}\\s+(?:dy\\s*/\\s*dx|y')\\s+${GIVEN}\\s+y\\s*=\\s*(.+?)${DOMAIN}`), (m) => {
    const f = fnOf(m[1], false);
    return f ? { shape: "derivative", f } : null;
  }],
  // the derivative of ... (at x = a)
  [re(`${VERB}\\s+the\\s+derivative\\s+of\\s+(?:the\\s+function\\s+)?${FN}(.+?)(?:\\s+at\\s+x\\s*=\\s*([^\\s,]+))?${DOMAIN}`), (m) => {
    const f = fnOf(m[1], false);
    if (!f) return null;
    if (m[2] === undefined) return { shape: "derivative", f };
    const at = paramOf(m[2]);
    return at === null ? null : { shape: "derivative-at", f, at };
  }],
  // Differentiate ...
  [re(`differentiate\\s+(?:the\\s+function\\s+)?${FN}(.+?)(?:\\s+with\\s+respect\\s+to\\s+x)?${DOMAIN}`), (m) => {
    const f = fnOf(m[1], false);
    return f ? { shape: "derivative", f } : null;
  }],
  // d/dx (...)
  [re(`(?:${VERB}\\s+)?d\\s*/\\s*dx\\s*(.+)`), (m) => {
    const f = fnOf(m[1], true);
    return f ? { shape: "derivative", f } : null;
  }],
  // the slope of the tangent to y = ... at x = a
  [re(`${VERB}\\s+the\\s+slope\\s+of\\s+the\\s+tangent(?:\\s+line)?\\s+to\\s+(?:the\\s+(?:curve|graph)\\s+(?:of\\s+)?)?${FN}(.+?)\\s+at\\s+(?:the\\s+point\\s+where\\s+)?x\\s*=\\s*([^\\s,]+)`), (m) => {
    const f = fnOf(m[1], false), at = paramOf(m[2]);
    return !f || at === null ? null : { shape: "derivative-at", f, at };
  }],
  // the limit of ... as x approaches a (from the right)
  [re(`${VERB}\\s+the\\s+limit\\s+of\\s+(.+?)\\s+as\\s+x\\s+(?:approaches|tends\\s+to|goes\\s+to|->)\\s+(.+?)(?:\\s+from\\s+the\\s+(right|left|above|below))?`), (m) => limitSpec(m[1], approachOf(m[2], m[3]))],
  // the limit as x approaches a (from the right) of ...
  [re(`${VERB}\\s+the\\s+limit\\s+as\\s+x\\s+(?:approaches|tends\\s+to|goes\\s+to|->)\\s+(.+?)(?:\\s+from\\s+the\\s+(right|left|above|below))?\\s+of\\s+(.+)`), (m) => limitSpec(m[3], approachOf(m[1], m[2]))],
  // lim_(x->a) ...
  [re(`(?:${VERB}\\s+)?lim\\s*_?\\s*(.+)`), (m) => {
    const rest = m[1];
    let inner: string, after: string;
    if (CLOSING[rest[0]]) {
      const end = closeAt(rest, 0);
      if (end < 0) return null;
      inner = rest.slice(1, end); after = rest.slice(end + 1);
    } else {
      const b = /^(x\s*->\s*\S+)\s+(.+)$/.exec(rest);
      if (!b) return null;
      inner = b[1]; after = b[2];
    }
    const x = /^\s*x\s*->\s*(.+)$/.exec(inner);
    return x ? limitSpec(after, approachOf(x[1])) : null;
  }],
  // the integral of ... from a to b
  [re(`${VERB}\\s+(?:the\\s+)?(?:definite\\s+)?integral\\s+of\\s+${FN}(.+?)(?:\\s*d\\s*x)?\\s+from\\s+(?:x\\s*=\\s*)?(\\S+)\\s+to\\s+(?:x\\s*=\\s*)?(\\S+)`), (m) => definiteSpec(m[1], m[2], m[3])],
  // the integral from a to b of ...
  [re(`${VERB}\\s+(?:the\\s+)?(?:definite\\s+)?integral\\s+from\\s+(?:x\\s*=\\s*)?(\\S+)\\s+to\\s+(?:x\\s*=\\s*)?(\\S+)\\s+of\\s+(.+?)(?:\\s*d\\s*x)?`), (m) => definiteSpec(m[3], m[1], m[2])],
  // the (indefinite) integral / antiderivative of ...
  [re(`${VERB}\\s+(?:the\\s+|an\\s+)?(?:most\\s+general\\s+|general\\s+)?(?:antiderivative|indefinite\\s+integral|integral)\\s+of\\s+(?:the\\s+function\\s+)?${FN}(.+?)(?:\\s*d\\s*x|\\s+with\\s+respect\\s+to\\s+x)?${DOMAIN}`), (m) => {
    const f = fnOf(m[1], true);
    return f ? { shape: "antiderivative", f } : null;
  }],
  // int ... dx, int_a^b ... dx
  [re(`(?:${VERB}\\s+)?(?:the\\s+(?:definite\\s+|indefinite\\s+)?integral\\s+)?int(.+)`), (m) => {
    const rest = m[1];
    if (rest[0] === "_") {
      const lo = boundOf(rest.slice(1), /\^/);
      if (!lo || lo[1][0] !== "^") return null;
      const hi = boundOf(lo[1].slice(1), /\s/);
      if (!hi) return null;
      const body = /^\s*(.+?)\s*d\s*x$/i.exec(hi[1]);
      return body ? definiteSpec(body[1], lo[0], hi[0]) : null;
    }
    const body = /^\s+(.+?)\s*d\s*x$/i.exec(rest);
    const f = body ? fnOf(body[1], true) : null;
    return f ? { shape: "antiderivative", f } : null;
  }],
  // the critical point of ... on [a, b]
  [re(`${VERB}\\s+the\\s+critical\\s+(?:point|number)\\s+of\\s+${FN}(.+?)\\s+(?:on|in|over)\\s+(?:the\\s+interval\\s+)?([[(].*[\\])])`), (m) => {
    const f = fnOf(m[1], false), on = intervalOf(m[2]);
    return !f || !on ? null : { shape: "critical-point", f, on };
  }],
  // the maximum / minimum value of ... on [a, b] (not 'local': a local extremum need not be the interval's)
  [re(`${VERB}\\s+the\\s+(?:absolute\\s+|global\\s+)?(maximum|minimum|max|min|largest|smallest|greatest|least)(?:\\s+value)?\\s+of\\s+${FN}(.+?)\\s+(?:on|in|over)\\s+(?:the\\s+interval\\s+)?([[(].*[\\])])`), (m) => {
    const f = fnOf(m[2], false), on = intervalOf(m[3]);
    const kind = /^(maximum|max|largest|greatest)$/i.test(m[1]) ? "max" : "min";
    return !f || !on ? null : { shape: "extremum", f, on, kind };
  }],
  // Use Newton's method on ... (= 0) with x_1 = a to find x_n
  [re(`use\\s+newton'?s\\s+method\\s+(?:on|for|with|to\\s+solve)\\s+(?:the\\s+equation\\s+)?${FN}(.+?)(?:\\s*=\\s*0)?\\s*,?\\s+(?:with|starting\\s+(?:with|from|at))\\s+x_?\\(?([01])\\)?\\s*=\\s*([^\\s,]+)\\s*,?\\s+(?:to\\s+)?(?:find|compute|calculate|approximate)\\s+x_?\\(?(\\d{1,2})\\)?`), (m) => {
    const f = fnOf(m[1], false), x0 = paramOf(m[3]);
    const steps = Number(m[4]) - Number(m[2]);
    return !f || x0 === null ? null : { shape: "newton-step", f, x0, steps };
  }],
];

function limitSpec(fText: string, to: Approach | null): CalcSpec | null {
  const f = fnOf(fText, true);
  if (!f || !to) return null;
  return to.side ? { shape: "limit", f, at: to.at, side: to.side } : { shape: "limit", f, at: to.at };
}

function definiteSpec(fText: string, aText: string, bText: string): CalcSpec | null {
  const f = fnOf(fText, true), a = paramOf(aText), b = paramOf(bText);
  return !f || a === null || b === null ? null : { shape: "definite-integral", f, a, b };
}

/**
 * The spec a printed Calculus task is, read in code from its text - or null. It knows the phrasings a Calculus page
 * and our own question() use, one pattern per phrasing, each anchored to the whole text: derivative ('Differentiate
 * f(x) = ...', 'Find the derivative of ...', 'Find dy/dx for y = ...', "Find f'(x) for ..."), derivative-at ("Find
 * f'(a) for ...", 'the slope of the tangent to y = ... at x = a'), evaluate ('Find f(a) for ...'), limits ('Find
 * lim_(x->a) ...', 'the limit as x approaches a of ...', one-sided and at infinity), antiderivative ('the integral /
 * antiderivative of ...', an integral sign with no bounds), definite integral (with bounds, or 'from a to b'),
 * critical point and extremum on an interval, and Newton's method.
 * Conservative: a phrasing it does not know, a function that is not one expression in x (another letter, a second
 * part, an '='), or a spec wellFormed refuses, is null - so a hint on a text it cannot read is left to the school
 * rule, never checked against a guess. A definite integral that is zero is read as the symmetry question it is
 * (`zero: true`). Pure and deterministic: a fresh object per call.
 */
export function specFromQuestion(text: unknown): CalcSpec | null {
  if (typeof text !== "string" || !text.trim() || text.length > MAX_QUESTION) return null;
  const t = normalQuestion(text);
  for (const [pattern, make] of READERS) {
    const m = pattern.exec(t);
    if (!m) continue;
    const spec = make(m);
    if (!spec) continue;
    const w = wellFormed(spec);
    if (w.ok) return spec;
    if (spec.shape === "definite-integral" && !w.ok && w.why === REJECT.integralZero) {
      const zero: CalcSpec = { ...spec, zero: true };
      if (wellFormed(zero).ok) return zero;
    }
    return null;
  }
  return null;
}

// ------------------------------------------------------------------ the line when a hint gave the answer away twice

/**
 * The line the TV shows and speaks when the model's hint on a Calculus item gave the answer away twice: written here,
 * never by a model, one per shape. It names the method and carries no number and no number word (leaksCalc reads
 * 'one' as 1), so nothing on it can be the answer.
 */
export const CALC_WITHHELD: Readonly<Record<CalcShape, string>> = {
  evaluate: "Put the value in for x everywhere it appears, then work it out piece by piece. The number is yours to find.",
  derivative: "Name the rule the expression is built with, then say the first step out loud.",
  "derivative-at": "Find the derivative as a function first, then put the point in. The value is yours to work out.",
  antiderivative: "Name the rule that undoes each term's derivative, and remember the arbitrary constant. The antiderivative is yours to write.",
  "definite-integral": "Find an antiderivative first, then take its value at the lower limit from its value at the upper limit.",
  limit: "Say what the expression does as x approaches its target, then name the step that makes it clear. The limit is yours to find.",
  "critical-point": "Find where the derivative vanishes inside the interval. The point is yours to find.",
  extremum: "Find where the derivative vanishes inside the interval, then compare the function's values there and at the ends.",
  "newton-step": "Write the Newton step from the function and its derivative, then apply it from the value you have, step by step.",
};
const WITHHELD_ANY = "Go back to the last step you are sure of and take the next. The answer stays yours to find.";

/** The withheld line for a spec, chosen by its shape; a general line when there is no shape. */
export function withheldCalc(spec: unknown): string {
  const shape = spec && typeof spec === "object" ? (spec as { shape?: unknown }).shape : undefined;
  return isShape(shape) ? CALC_WITHHELD[shape] : WITHHELD_ANY;
}
