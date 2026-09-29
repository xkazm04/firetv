/**
 * The Calculus expression engine: read the plain notation our prompts ask the models for and learners write, and
 * judge it numerically, so that a Calculus verdict is decided in code and never taken from a model.
 *
 * verify.ts reads one equation of arithmetic in x; this reads a Calculus EXPRESSION in x - function names, e and pi,
 * implicit products, Unicode powers and roots - and adds the numerics a checker needs: the derivative at a point, the
 * definite integral, limits (two-sided, one-sided, at and to infinity), roots and extrema on an interval, and whether
 * two expressions are the same function (or differ by a constant) by sampling.
 *
 * Pure and dependency-free: no eval, no new Function, no import from the engines, the session or the TV. Nothing
 * throws: `compile` returns null for anything it cannot read, `Expr.at` returns NaN outside the domain, and every
 * numeric returns null when it cannot answer. The checker runs inside request handlers, so every numeric is bounded
 * (a fixed number of samples, a capped recursion, an evaluation budget).
 *
 * Reading rules (what `compile` accepts):
 *   - the variable x (X read as x); constants pi, π and e; decimals with a point (.5, 3.25);
 *   - + - * / ^ and brackets ( ) [ ] { }; |...| is an absolute value; the minus glyphs, × · ⋅ ∙ ∗ and ÷ ∕;
 *   - implicit multiplication: 3x, 2sin(x), x(x+1), (x+1)(x-1), 2pi, 3e^x - but never a number written straight after
 *     another factor ('2 3', 'x 2'), which is two numbers, not a product;
 *   - functions sin cos tan sec csc cot, asin acos atan and arcsin arccos arctan, sinh cosh tanh, ln and log (both
 *     natural, as in Stewart), log_b(x) and log₂ x, exp, sqrt and √, cbrt and ∛, abs;
 *   - a function takes a bracketed argument (sin(3x)) or an unbracketed one: a run of factors that are numbers, x and
 *     constants with their powers (sin 3x, sin x^2, ln 2, sqrt 3) - so sin x cos x is two factors and ln x/x is (ln x)/x;
 *   - sin^2 x, sin^2(x) and sin²x mean (sin x)^2; a trig function to the power -1 (sin^-1 x) is its inverse, as in Stewart;
 *   - ^ is right-associative (2^3^2 = 2^9) and unary minus binds looser than ^ (-x^2 = -(x^2); x^-1 and e^-x read);
 *     / is left-associative and at the level of *, so x^-1/2 is (x^-1)/2 and 1/2/4 is 1/8;
 *   - Unicode superscripts are a bracketed exponent (x² , e²ˣ = e^(2x), x⁻¹), subscript digits a log base (log₂);
 *   - a trailing arbitrary constant (+C, + c, - C) is recognised and reported as `constant`, never evaluated.
 * Anything else - another letter, a dangling operator, over 200 characters, nesting deeper than 40 - is null.
 */

// ------------------------------------------------------------------ the tree

export type FnName =
  | "sin" | "cos" | "tan" | "sec" | "csc" | "cot" | "asin" | "acos" | "atan" | "sinh" | "cosh" | "tanh"
  | "ln" | "log" | "exp" | "sqrt" | "cbrt" | "abs";

export type Node =
  | { k: "num"; v: number; s: string }
  | { k: "x" }
  | { k: "const"; name: "pi" | "e" }
  | { k: "neg"; a: Node }
  | { k: "add" | "sub" | "div" | "pow"; a: Node; b: Node }
  | { k: "mul"; a: Node; b: Node; implicit: boolean }
  | { k: "fn"; name: FnName; arg: Node; base?: Node };

/** A compiled expression. `at` is NaN outside the domain and never throws. */
export interface Expr {
  /** The source as given. */
  readonly src: string;
  /** The reading, for printing (toTex) and inspection. */
  readonly node: Node;
  /** The value at x; x may be left out for an expression with no x (NaN if it has one). Always finite or NaN. */
  at(x?: number): number;
  /** The value at x with infinities kept (a pole is +-Infinity, not NaN): for the limit search. */
  raw(x: number): number;
  /** A trailing arbitrary constant (+C) was written. It is reported, never evaluated. */
  readonly constant: boolean;
  /** The expression contains x. */
  readonly usesX: boolean;
}

/** A function to judge: a compiled expression, or any function of x (NaN where it is undefined). */
export type Fn = Expr | ((x: number) => number);

/** Longest input `compile` reads: a formula, not a paragraph. */
export const MAX_LENGTH = 200;
/** Deepest nesting of brackets, function arguments and exponents `compile` reads. */
export const MAX_DEPTH = 40;

// ------------------------------------------------------------------ reading

type Tok =
  | { k: "num"; v: number; s: string }
  | { k: "x" } | { k: "const"; name: "pi" | "e" } | { k: "C" }
  | { k: "fn"; name: FnName | "log" }
  | { k: "op"; v: "+" | "-" | "*" | "/" | "^" | "_" }
  | { k: "(" } | { k: ")" } | { k: "|" };

const SUPER: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-", "ˣ": "x", "⁽": "(", "⁾": ")" };
const SUB: Record<string, string> = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };

/** The glyphs a keyboard, a phone and a model all produce, as the ASCII the lexer reads. */
function normalise(src: string): string {
  let s = src
    .replace(/[−–—‐‑]/g, "-")
    .replace(/[×·⋅∙∗]/g, "*")
    .replace(/[÷∕]/g, "/")
    .replace(/π/g, " pi ")
    .replace(/√/g, " sqrt ")
    .replace(/∛/g, " cbrt ")
    .replace(/[\[{]/g, "(")
    .replace(/[\]}]/g, ")");
  // a run of superscripts is one bracketed exponent; a run of subscripts one bracketed base
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ˣ⁽⁾]+/g, (m) => `^(${[...m].map((c) => SUPER[c]).join("")})`);
  s = s.replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, (m) => `_(${[...m].map((c) => SUB[c]).join("")})`);
  return s;
}

/** The words a letter run is split into, longest first: 'sinx' is sin x, 'exp' is exp, 'ex' is e x. */
const WORDS: [string, Tok][] = ([
  ["arcsin", { k: "fn", name: "asin" }], ["arccos", { k: "fn", name: "acos" }], ["arctan", { k: "fn", name: "atan" }],
  ["asin", { k: "fn", name: "asin" }], ["acos", { k: "fn", name: "acos" }], ["atan", { k: "fn", name: "atan" }],
  ["sinh", { k: "fn", name: "sinh" }], ["cosh", { k: "fn", name: "cosh" }], ["tanh", { k: "fn", name: "tanh" }],
  ["sqrt", { k: "fn", name: "sqrt" }], ["cbrt", { k: "fn", name: "cbrt" }],
  ["sin", { k: "fn", name: "sin" }], ["cos", { k: "fn", name: "cos" }], ["tan", { k: "fn", name: "tan" }],
  ["sec", { k: "fn", name: "sec" }], ["csc", { k: "fn", name: "csc" }], ["cot", { k: "fn", name: "cot" }],
  ["log", { k: "fn", name: "log" }], ["exp", { k: "fn", name: "exp" }], ["abs", { k: "fn", name: "abs" }],
  ["ln", { k: "fn", name: "ln" }], ["pi", { k: "const", name: "pi" }],
  ["e", { k: "const", name: "e" }], ["x", { k: "x" }], ["c", { k: "C" }],
] as [string, Tok][]).sort((a, b) => b[0].length - a[0].length);

function lex(src: string): Tok[] | null {
  const s = normalise(src);
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") { i++; continue; }
    if ((c >= "0" && c <= "9") || c === ".") {
      let j = i;
      while (j < s.length && s[j] >= "0" && s[j] <= "9") j++;
      if (s[j] === ".") {
        j++;
        const k = j;
        while (j < s.length && s[j] >= "0" && s[j] <= "9") j++;
        if (j === k) return null; // '5.' and '..': a point must be followed by a digit
      }
      const text = s.slice(i, j), v = Number(text);
      if (!Number.isFinite(v)) return null;
      out.push({ k: "num", v, s: text }); i = j; continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      const run = s.slice(i, j).toLowerCase();
      for (let p = 0; p < run.length;) {
        const w = WORDS.find(([word]) => run.startsWith(word, p));
        if (!w) return null; // a letter the desk does not read (y, t, theta, dx)
        out.push(w[1]); p += w[0].length;
      }
      i = j; continue;
    }
    if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^" || c === "_") { out.push({ k: "op", v: c }); i++; continue; }
    if (c === "(") { out.push({ k: "(" }); i++; continue; }
    if (c === ")") { out.push({ k: ")" }); i++; continue; }
    if (c === "|") { out.push({ k: "|" }); i++; continue; }
    return null;
  }
  return out;
}

class Unreadable extends Error {}
const TRIG_INVERSE: Partial<Record<FnName, FnName>> = { sin: "asin", cos: "acos", tan: "atan" };

/**
 * expr    := term (('+'|'-') term)*
 * term    := unary (('*'|'/') unary | implicit-factor)*      implicit-factor: an atom that is not a number
 * unary   := ('+'|'-') unary | power
 * power   := atom ('^' unary)?                                right-associative through unary
 * atom    := num | x | const | '(' expr ')' | '|' expr '|' | function
 * function:= name ('_' base)? ('^' fexp)? (bracketed-arg | bare-arg)
 * bare-arg:= ('+'|'-')? bare-factor bare-factor*              factors of num, x, const (the first may be a function)
 */
class Parser {
  private i = 0;
  private depth = 0;
  private bars = 0;
  constructor(private t: Tok[]) {}

  private peek(o = 0): Tok | undefined { return this.t[this.i + o]; }
  private isOp(v: string, o = 0): boolean { const p = this.peek(o); return !!p && p.k === "op" && p.v === v; }
  private enter(): void { if (++this.depth > MAX_DEPTH) throw new Unreadable(); }
  private leave(): void { this.depth--; }

  parse(): Node {
    const n = this.expr();
    if (this.i !== this.t.length) throw new Unreadable();
    return n;
  }

  private expr(): Node {
    let a = this.term();
    for (;;) {
      if (this.isOp("+")) { this.i++; a = { k: "add", a, b: this.term() }; }
      else if (this.isOp("-")) { this.i++; a = { k: "sub", a, b: this.term() }; }
      else return a;
    }
  }

  /** An implicit factor may follow: anything that starts an atom except a number (and a closing bar). */
  private startsImplicit(): boolean {
    const p = this.peek();
    if (!p) return false;
    if (p.k === "|") return this.bars === 0;
    return p.k === "x" || p.k === "const" || p.k === "fn" || p.k === "(";
  }

  private term(): Node {
    let a = this.unary();
    for (;;) {
      if (this.isOp("*")) { this.i++; a = { k: "mul", a, b: this.unary(), implicit: false }; }
      else if (this.isOp("/")) { this.i++; a = { k: "div", a, b: this.unary() }; }
      else if (this.startsImplicit()) a = { k: "mul", a, b: this.power(), implicit: true };
      else return a;
    }
  }

  private unary(): Node {
    if (this.isOp("-")) { this.i++; this.enter(); const a = this.unary(); this.leave(); return { k: "neg", a }; }
    if (this.isOp("+")) { this.i++; this.enter(); const a = this.unary(); this.leave(); return a; }
    return this.power();
  }

  private power(): Node {
    const a = this.atom();
    if (this.isOp("^")) {
      this.i++;
      this.enter();
      const b = this.unary();
      this.leave();
      return { k: "pow", a, b };
    }
    return a;
  }

  private bracketed(): Node {
    const p = this.peek();
    if (!p || p.k !== "(") throw new Unreadable();
    this.i++;
    this.enter();
    const saved = this.bars;
    this.bars = 0;
    const n = this.expr();
    this.bars = saved;
    this.leave();
    const q = this.peek();
    if (!q || q.k !== ")") throw new Unreadable();
    this.i++;
    return n;
  }

  private atom(): Node {
    const p = this.peek();
    if (!p) throw new Unreadable();
    if (p.k === "num") { this.i++; return { k: "num", v: p.v, s: p.s }; }
    if (p.k === "x") { this.i++; return { k: "x" }; }
    if (p.k === "const") { this.i++; return { k: "const", name: p.name }; }
    if (p.k === "(") return this.bracketed();
    if (p.k === "|") {
      this.i++;
      this.enter();
      this.bars++;
      const a = this.expr();
      this.bars--;
      this.leave();
      const q = this.peek();
      if (!q || q.k !== "|") throw new Unreadable();
      this.i++;
      return { k: "fn", name: "abs", arg: a };
    }
    if (p.k === "fn") return this.fn(p.name);
    throw new Unreadable();
  }

  /** A function application: its base (log_b), its power (sin^2), then its argument. */
  private fn(name: FnName): Node {
    this.i++;
    let base: Node | undefined;
    if (this.isOp("_")) {
      if (name !== "log") throw new Unreadable();
      this.i++;
      const p = this.peek();
      if (p && p.k === "num") { this.i++; base = { k: "num", v: p.v, s: p.s }; }
      else base = this.bracketed();
    }
    let power: Node | undefined;
    if (this.isOp("^")) {
      this.i++;
      const neg = this.isOp("-");
      if (neg) this.i++;
      const p = this.peek();
      let e: Node;
      if (p && p.k === "num") { this.i++; e = { k: "num", v: p.v, s: p.s }; }
      else e = this.bracketed();
      power = neg ? { k: "neg", a: e } : e;
    }
    this.enter();
    const arg = this.fnArg();
    this.leave();
    // sin^-1 x is arcsin x (Stewart's notation); any other power is a power of the value
    const inv = TRIG_INVERSE[name];
    if (power && inv && isMinusOne(power)) return { k: "fn", name: inv, arg };
    const f: Node = base ? { k: "fn", name, arg, base } : { k: "fn", name, arg };
    return power ? { k: "pow", a: f, b: power } : f;
  }

  private fnArg(): Node {
    const p = this.peek();
    if (!p) throw new Unreadable();
    if (p.k === "(") {
      // sin(x)^2 is (sin x)^2: the power after the bracket belongs to the function's value, taken in power()
      return this.bracketed();
    }
    // ln|x|: an absolute value is a bracketed argument too
    if (p.k === "|") return this.atom();
    let sign = 0;
    if (this.isOp("-")) { sign = -1; this.i++; } else if (this.isOp("+")) { sign = 1; this.i++; }
    let a = this.bareFactor(true);
    for (;;) {
      const q = this.peek();
      if (q && (q.k === "x" || q.k === "const")) a = { k: "mul", a, b: this.bareFactor(false), implicit: true };
      else break;
    }
    return sign < 0 ? { k: "neg", a } : a;
  }

  /** One factor of a bare argument: a number, x or a constant with its power; the first may be a function (ln ln x). */
  private bareFactor(first: boolean): Node {
    const p = this.peek();
    if (!p) throw new Unreadable();
    let a: Node;
    if (p.k === "num") { this.i++; a = { k: "num", v: p.v, s: p.s }; }
    else if (p.k === "x") { this.i++; a = { k: "x" }; }
    else if (p.k === "const") { this.i++; a = { k: "const", name: p.name }; }
    else if (first && p.k === "fn") return this.fn(p.name);
    else throw new Unreadable();
    if (this.isOp("^")) { this.i++; this.enter(); const b = this.unary(); this.leave(); a = { k: "pow", a, b }; }
    return a;
  }
}

const isMinusOne = (n: Node) => n.k === "neg" && n.a.k === "num" && n.a.v === 1;

// ------------------------------------------------------------------ evaluating

type Ev = (x: number) => number;

function build(n: Node): Ev {
  switch (n.k) {
    case "num": { const v = n.v; return () => v; }
    case "x": return (x) => x;
    case "const": { const v = n.name === "pi" ? Math.PI : Math.E; return () => v; }
    case "neg": { const a = build(n.a); return (x) => -a(x); }
    case "add": { const a = build(n.a), b = build(n.b); return (x) => a(x) + b(x); }
    case "sub": { const a = build(n.a), b = build(n.b); return (x) => a(x) - b(x); }
    case "mul": { const a = build(n.a), b = build(n.b); return (x) => a(x) * b(x); }
    case "div": { const a = build(n.a), b = build(n.b); return (x) => a(x) / b(x); }
    case "pow": { const a = build(n.a), b = build(n.b); return (x) => Math.pow(a(x), b(x)); }
    case "fn": {
      const a = build(n.arg);
      if (n.base) { const b = build(n.base); return (x) => { const bv = b(x); return bv > 0 && bv !== 1 ? Math.log(a(x)) / Math.log(bv) : NaN; }; }
      const f = FNS[n.name];
      return (x) => f(a(x));
    }
  }
}

/** Each function on its real domain: NaN outside it (Math already gives NaN for ln of a negative, asin(2), sqrt(-1)). */
const FNS: Record<FnName, (v: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  sec: (v) => 1 / Math.cos(v), csc: (v) => 1 / Math.sin(v), cot: (v) => Math.cos(v) / Math.sin(v),
  asin: Math.asin, acos: Math.acos, atan: Math.atan, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  ln: Math.log, log: Math.log, exp: Math.exp, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs,
};

function hasX(n: Node): boolean {
  switch (n.k) {
    case "x": return true;
    case "num": case "const": return false;
    case "neg": return hasX(n.a);
    case "fn": return hasX(n.arg) || (!!n.base && hasX(n.base));
    default: return hasX(n.a) || hasX(n.b);
  }
}

/**
 * Read an expression in x, or null: never throws. Input over MAX_LENGTH characters or nested deeper than MAX_DEPTH
 * is null, as is anything outside the reading rules above. A trailing +C is reported as `constant`.
 */
export function compile(src: unknown): Expr | null {
  if (typeof src !== "string" || src.length > MAX_LENGTH || !src.trim()) return null;
  try {
    let t = lex(src);
    if (!t || !t.length) return null;
    let constant = false;
    const last = t[t.length - 1], before = t[t.length - 2];
    if (last.k === "C" && before && before.k === "op" && (before.v === "+" || before.v === "-")) { constant = true; t = t.slice(0, -2); }
    if (!t.length || t.some((k) => k.k === "C")) return null;
    const node = new Parser(t).parse();
    const ev = build(node);
    const usesX = hasX(node);
    const raw = (x: number) => { try { return ev(x); } catch { return NaN; } };
    return {
      src, node, constant, usesX, raw,
      at: (x?: number) => {
        const v = raw(typeof x === "number" ? x : NaN);
        return Number.isFinite(v) ? v : NaN;
      },
    };
  } catch {
    return null;
  }
}

/** The function behind an Fn, finite or NaN (infinities are NaN). */
const fnOf = (f: Fn): ((x: number) => number) => {
  if (typeof f === "function") return (x) => { try { const v = f(x); return typeof v === "number" && Number.isFinite(v) ? v : NaN; } catch { return NaN; } };
  return (x) => f.at(x);
};
/** The function with infinities kept, for the limit search. */
const rawOf = (f: Fn): ((x: number) => number) => {
  if (typeof f === "function") return (x) => { try { const v = f(x); return typeof v === "number" ? v : NaN; } catch { return NaN; } };
  return (x) => f.raw(x);
};
const isFn = (f: unknown): f is Fn => typeof f === "function" || (!!f && typeof f === "object" && typeof (f as Expr).at === "function" && typeof (f as Expr).raw === "function");
const finite = (...v: unknown[]) => v.every((n) => typeof n === "number" && Number.isFinite(n));

// ------------------------------------------------------------------ the derivative at a point

/** The first step of the derivative's search, relative to max(1, |x|); halved DERIV_LEVELS times. */
const DERIV_H0 = 1e-2;
/** Halvings of the step: 1e-2 down to about 1e-8 relative, deep enough for ln x near 0.01 and sqrt x near 0.001. */
const DERIV_LEVELS = 20;
/** One-sided slopes (step 1e-7) that disagree by more than this, relatively, mean a corner: no derivative. */
const CORNER_REL = 1e-3;

/**
 * The derivative of f at x: a five-point central stencil (error O(h^4)) over a halving step, taking the estimate
 * whose neighbours on both sides agree best - accurate to 1e-7 relative on smooth functions. Null where f is not
 * finite at x, where the one-sided slopes disagree (a corner, |x| at 0), or where no step gives finite samples.
 */
export function derivativeAt(f: Fn, x: number): number | null {
  if (!isFn(f) || !finite(x)) return null;
  const g = fnOf(f);
  const fx = g(x);
  if (!finite(fx)) return null;
  const scale = Math.max(1, Math.abs(x));
  const h1 = 1e-7 * scale;
  const fwd = (g(x + h1) - fx) / h1, bwd = (fx - g(x - h1)) / h1;
  if (!finite(fwd, bwd)) return null;
  if (Math.abs(fwd - bwd) > CORNER_REL * Math.max(1, Math.abs(fwd), Math.abs(bwd))) return null;
  const est: number[] = [];
  let h = DERIV_H0 * scale;
  for (let k = 0; k <= DERIV_LEVELS; k++, h /= 2) {
    const d = (-g(x + 2 * h) + 8 * g(x + h) - 8 * g(x - h) + g(x - 2 * h)) / (12 * h);
    est.push(d);
  }
  let best: number | null = null, err = Infinity;
  for (let k = 1; k < est.length - 1; k++) {
    if (!finite(est[k - 1], est[k], est[k + 1])) continue;
    const e = Math.max(Math.abs(est[k] - est[k - 1]), Math.abs(est[k + 1] - est[k]));
    if (e < err) { err = e; best = est[k]; }
  }
  return best === null ? null : best + 0;
}

// ------------------------------------------------------------------ the definite integral

/** Adaptive Simpson's target: absolute error 1e-9 over the whole interval. */
const INT_TOL = 1e-9;
/** Deepest bisection: past it an interval must already agree to INT_FLOOR or the integral is refused. */
const INT_DEPTH = 50;
/** Agreement accepted at the deepest level: a finite integrable spike (sqrt x at 0) passes, a pole never does. */
const INT_FLOOR = 1e-10;
/** Most evaluations one integral may take: bounds the time inside a request handler. */
const INT_BUDGET = 20000;
/** Equal first pieces, so a narrow feature is not missed by the first five samples. */
const INT_PIECES = 16;

/**
 * The integral of f from a to b by adaptive Simpson to 1e-9. Null when a or b is not finite (an improper interval),
 * when the integrand is not finite at a sample (a pole, an end where it blows up, a part of the interval outside its
 * domain), or when the refinement does not settle within its depth and budget (a pole between samples).
 * b < a gives the negative; a = b gives 0.
 */
export function integrate(f: Fn, a: number, b: number): number | null {
  if (!isFn(f) || !finite(a, b)) return null;
  if (a === b) return 0;
  if (b < a) { const v = integrate(f, b, a); return v === null ? null : -v; }
  const g = fnOf(f);
  let evals = 0;
  let failed = false;
  const F = (x: number) => { evals++; const v = g(x); if (!finite(v)) failed = true; return v; };
  const simpson = (l: number, r: number, fl: number, fm: number, fr: number) => ((r - l) / 6) * (fl + 4 * fm + fr);
  const step = (l: number, r: number, fl: number, fm: number, fr: number, whole: number, tol: number, depth: number): number => {
    if (failed || evals > INT_BUDGET) { failed = true; return NaN; }
    const m = (l + r) / 2, lm = (l + m) / 2, rm = (m + r) / 2;
    const flm = F(lm), frm = F(rm);
    if (failed) return NaN;
    const left = simpson(l, m, fl, flm, fm), right = simpson(m, r, fm, frm, fr);
    const diff = left + right - whole;
    if (Math.abs(diff) <= 15 * tol) return left + right + diff / 15;
    if (depth >= INT_DEPTH) {
      if (Math.abs(diff) <= INT_FLOOR) return left + right + diff / 15;
      failed = true; return NaN;
    }
    return step(l, m, fl, flm, fm, left, tol / 2, depth + 1) + step(m, r, fm, frm, fr, right, tol / 2, depth + 1);
  };
  let sum = 0;
  const w = (b - a) / INT_PIECES;
  for (let p = 0; p < INT_PIECES && !failed; p++) {
    const l = a + p * w, r = p === INT_PIECES - 1 ? b : a + (p + 1) * w, m = (l + r) / 2;
    const fl = F(l), fm = F(m), fr = F(r);
    if (failed) break;
    sum += step(l, r, fl, fm, fr, simpson(l, r, fl, fm, fr), INT_TOL / INT_PIECES, 0);
  }
  return failed || !finite(sum) ? null : sum + 0;
}

// ------------------------------------------------------------------ limits

export type Limit = { kind: "value"; v: number } | { kind: "inf"; sign: 1 | -1 } | { kind: "dne" };

/** The steps a limit is approached by: h = 1e-2 down to 1e-8, a decade at a time. */
const LIMIT_STEPS = [1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8];
/** A sequence has converged when two neighbours agree to this, relative to max(1, |value|). */
const LIMIT_CONVERGED = 1e-6;
/** Two one-sided limits are the same when they agree to this, relative to max(1, |value|). */
const LIMIT_SIDES = 1e-5;

/**
 * The limit of the sequence s(h) as h -> 0 over LIMIT_STEPS, or null when too few samples are defined.
 * Converged: the raw values, or their Richardson extrapolations (one removing an h term, one an h^2 term), have two
 * neighbours within LIMIT_CONVERGED - the best-agreeing pair gives the value. Infinite: the last values keep one
 * sign and grow in size without their growth shrinking (or are infinite). Otherwise it does not exist.
 */
function seqLimit(s: (h: number) => number): Limit | null {
  const v = LIMIT_STEPS.map(s);
  const defined = v.filter((n) => !Number.isNaN(n));
  if (defined.length < 4) return null;
  const tail = v.slice(-3);
  if (tail.every((n) => n === Infinity)) return { kind: "inf", sign: 1 };
  if (tail.every((n) => n === -Infinity)) return { kind: "inf", sign: -1 };
  // convergence: the raw sequence and two Richardson levels (steps shrink tenfold)
  const r1 = v.slice(1).map((n, k) => (10 * n - v[k]) / 9);
  const r2 = r1.slice(1).map((n, k) => (100 * n - r1[k]) / 99);
  let best: number | null = null, err = Infinity;
  for (const seq of [v, r1, r2]) {
    for (let k = 1; k < seq.length; k++) {
      const p = seq[k - 1], q = seq[k];
      if (!finite(p, q)) continue;
      const e = Math.abs(q - p) / Math.max(1, Math.abs(q));
      if (e < err) { err = e; best = q; }
    }
  }
  if (best !== null && err <= LIMIT_CONVERGED && finite(...v.slice(-4))) return { kind: "value", v: best + 0 };
  // divergence to an infinity: the last four values, one sign, growing, the growth not dying away
  const last = v.slice(-4);
  if (last.every((n) => !Number.isNaN(n))) {
    const sign = Math.sign(last[3]);
    const same = sign !== 0 && last.every((n) => Math.sign(n) === sign);
    const growing = last.every((n, k) => k === 0 || Math.abs(n) > Math.abs(last[k - 1]));
    const d = last.slice(1).map((n, k) => Math.abs(n - last[k]));
    const notDying = d.every((n, k) => k === 0 || !finite(n, d[k - 1]) || n >= 0.5 * d[k - 1]);
    if (same && growing && notDying) return { kind: "inf", sign: sign as 1 | -1 };
  }
  return { kind: "dne" };
}

const sameLimit = (l: Limit, r: Limit): Limit => {
  if (l.kind === "value" && r.kind === "value") {
    return Math.abs(l.v - r.v) <= LIMIT_SIDES * Math.max(1, Math.abs(l.v), Math.abs(r.v)) ? { kind: "value", v: (l.v + r.v) / 2 + 0 } : { kind: "dne" };
  }
  if (l.kind === "inf" && r.kind === "inf" && l.sign === r.sign) return l;
  return { kind: "dne" };
};

/**
 * The limit of f as x -> a: from the right ('+'), from the left ('-'), or two-sided (both exist and agree; otherwise
 * dne - so |x|/x at 0 is +1 from the right, -1 from the left, and dne two-sided). Null when f is defined on neither
 * side near a (or the input is not a function and a number). f(a) itself is never used.
 */
export function limitAt(f: Fn, a: number, side?: "+" | "-"): Limit | null {
  if (!isFn(f) || !finite(a)) return null;
  const g = rawOf(f), scale = Math.max(1, Math.abs(a));
  const one = (sg: 1 | -1) => seqLimit((h) => g(a + sg * h * scale));
  if (side === "+") return one(1);
  if (side === "-") return one(-1);
  const r = one(1), l = one(-1);
  if (!r && !l) return null;
  if (!r || !l) return { kind: "dne" };
  return sameLimit(l, r);
}

/** The limit of f as x -> +infinity (sign 1) or -infinity (sign -1): the one-sided limit of f(sign/t) as t -> 0+. */
export function limitInf(f: Fn, sign: 1 | -1): Limit | null {
  if (!isFn(f) || (sign !== 1 && sign !== -1)) return null;
  const g = rawOf(f);
  return seqLimit((t) => g(sign / t));
}

// ------------------------------------------------------------------ roots and extrema on an interval

/** Samples in the first scan of an interval. */
const SCAN = 400;
/** A refined root must bring |f| down to this, relative to the largest |f| sampled: a pole's sign change is not a root. */
const ROOT_REL = 1e-8;
/** Roots closer than this, relative to max(1, |x|), are one root. */
const ROOT_SAME = 1e-7;

const grid = (a: number, b: number, n: number) => Array.from({ length: n + 1 }, (_, i) => (i === n ? b : a + ((b - a) * i) / n));

/** The minimum of |h| on [l, r] by golden-section search. */
function golden(h: (x: number) => number, l: number, r: number): number {
  const G = (Math.sqrt(5) - 1) / 2;
  let c = r - G * (r - l), d = l + G * (r - l), fc = h(c), fd = h(d);
  for (let k = 0; k < 80 && r - l > 1e-13 * Math.max(1, Math.abs(l)); k++) {
    if (fc < fd || Number.isNaN(fd)) { r = d; d = c; fd = fc; c = r - G * (r - l); fc = h(c); }
    else { l = c; c = d; fc = fd; d = l + G * (r - l); fd = h(d); }
  }
  return (l + r) / 2;
}

/**
 * Every root of f on [a, b]: a scan of SCAN samples, each sign change refined by bisection and each dip of |f| that
 * touches zero (a double root, x^2 at 0) refined by golden section; a candidate is a root only when |f| there is
 * tiny beside the largest |f| sampled (so the sign change across a pole is not one). Sorted; [] when there is none.
 */
export function rootsIn(f: Fn, a: number, b: number): number[] {
  if (!isFn(f) || !finite(a, b) || !(a < b)) return [];
  const g = fnOf(f);
  const xs = grid(a, b, SCAN), ys = xs.map(g);
  const big = Math.max(1, ...ys.filter((y) => Number.isFinite(y)).map(Math.abs));
  const ok = (x: number) => { const y = g(x); return finite(y) && Math.abs(y) <= ROOT_REL * big; };
  const found: number[] = [];
  const add = (x: number) => { if (!found.some((r) => Math.abs(r - x) <= ROOT_SAME * Math.max(1, Math.abs(x)))) found.push(x + 0); };
  for (let i = 0; i <= SCAN; i++) {
    const y = ys[i];
    if (!finite(y)) continue;
    if (y === 0) { add(xs[i]); continue; }
    const yn = ys[i + 1];
    if (i < SCAN && finite(yn) && yn !== 0 && Math.sign(y) !== Math.sign(yn)) {
      let l = xs[i], r = xs[i + 1], fl = y;
      for (let k = 0; k < 200 && r - l > 0; k++) {
        const m = (l + r) / 2;
        if (m <= l || m >= r) break;
        const fm = g(m);
        if (!finite(fm)) break;
        if (fm === 0) { l = r = m; break; }
        if (Math.sign(fm) === Math.sign(fl)) { l = m; fl = fm; } else r = m;
      }
      const m = (l + r) / 2;
      if (ok(m)) add(m);
    }
    // a dip of |f| between its neighbours: a root that touches zero without crossing
    if (i > 0 && i < SCAN) {
      const yp = ys[i - 1];
      // strictly below one neighbour: a flat run (a constant) is not a dip
      const ay = Math.abs(y);
      if (finite(yp, yn) && ay <= Math.abs(yp) && ay <= Math.abs(yn) && (ay < Math.abs(yp) || ay < Math.abs(yn))) {
        const m = golden((x) => { const v = g(x); return finite(v) ? Math.abs(v) : Infinity; }, xs[i - 1], xs[i + 1]);
        if (ok(m)) add(m);
      }
    }
  }
  return found.sort((p, q) => p - q);
}

/** The leftmost root of f on [a, b], or null when there is none. */
export function rootIn(f: Fn, a: number, b: number): number | null {
  const r = rootsIn(f, a, b);
  return r.length ? r[0] : null;
}

/**
 * Where f is largest ('max') or smallest ('min') on [a, b], and its value there: a scan of SCAN samples, the best one
 * refined by golden section between its neighbours. An endpoint that wins is returned exactly (x = a or x = b).
 * Null when f is not finite at some sample (it may be unbounded, or undefined on part of the interval).
 */
export function extremumIn(f: Fn, a: number, b: number, kind: "max" | "min"): { x: number; y: number } | null {
  if (!isFn(f) || !finite(a, b) || !(a < b) || (kind !== "max" && kind !== "min")) return null;
  const g = fnOf(f), s = kind === "max" ? -1 : 1;
  const xs = grid(a, b, SCAN), ys = xs.map(g);
  if (!ys.every((y) => Number.isFinite(y))) return null;
  let i = 0;
  for (let k = 1; k <= SCAN; k++) if (s * ys[k] < s * ys[i]) i = k;
  if (i === 0 || i === SCAN) return { x: xs[i], y: ys[i] + 0 };
  const x = golden((t) => { const v = g(t); return finite(v) ? s * v : Infinity; }, xs[i - 1], xs[i + 1]);
  const y = g(x);
  return finite(y) && s * y <= s * ys[i] ? { x: x + 0, y: y + 0 } : { x: xs[i], y: ys[i] + 0 };
}

// ------------------------------------------------------------------ the same function

/**
 * The fixed sample points: irrational (square and cube roots, Euler's gamma), so no school function's special point
 * (0, 1, a multiple of pi/2) is among them; four negative, six positive.
 */
export const SAMPLES: readonly number[] = [-Math.sqrt(11), -Math.sqrt(5), -Math.SQRT2, -Math.SQRT1_2, 0.5772156649015329, Math.cbrt(2), Math.sqrt(3), Math.sqrt(7), Math.sqrt(13), Math.sqrt(23)];
/** Two values are the same at a sample when they agree to 1e-7, relative to max(1, |value|). */
export const SAME_REL = 1e-7;
/** Fewest samples at which both must be defined before any claim is made. */
const SAME_MIN = 3;

/** The values of a and b where both are defined, or null when their defined-ness differs on a positive sample. */
function pairs(a: Fn, b: Fn): [number, number][] | null {
  if (!isFn(a) || !isFn(b)) return null;
  const f = fnOf(a), g = fnOf(b), out: [number, number][] = [];
  for (const x of SAMPLES) {
    const u = f(x), v = g(x), du = Number.isFinite(u), dv = Number.isFinite(v);
    if (x > 0 && du !== dv) return null;
    if (du && dv) out.push([u, v]);
  }
  return out.length >= SAME_MIN ? out : null;
}

/**
 * Are a and b the same function? At every sample where both are defined their values agree to `tol` relative
 * (SAME_REL by default), they are defined at the same positive samples, and at least SAME_MIN samples compare.
 */
export function sameFunction(a: Fn, b: Fn, tol: number = SAME_REL): boolean {
  const p = pairs(a, b);
  return !!p && p.every(([u, v]) => Math.abs(u - v) <= tol * Math.max(1, Math.abs(u), Math.abs(v)));
}

/** Do a and b differ by a constant? Their difference at every compared sample is the same, to `tol` relative. */
export function sameUpToConstant(a: Fn, b: Fn, tol: number = SAME_REL): boolean {
  const p = pairs(a, b);
  if (!p) return false;
  const d0 = p[0][0] - p[0][1];
  return p.every(([u, v]) => Math.abs(u - v - d0) <= tol * Math.max(1, Math.abs(u), Math.abs(v)));
}

// ------------------------------------------------------------------ printing

const TEX_FN: Record<FnName, string> = {
  sin: "\\sin", cos: "\\cos", tan: "\\tan", sec: "\\sec", csc: "\\csc", cot: "\\cot",
  asin: "\\arcsin", acos: "\\arccos", atan: "\\arctan", sinh: "\\sinh", cosh: "\\cosh", tanh: "\\tanh",
  ln: "\\ln", log: "\\log", exp: "\\exp", sqrt: "\\sqrt", cbrt: "\\sqrt[3]", abs: "\\lvert",
};

const isSum = (n: Node) => n.k === "add" || n.k === "sub";
const paren = (s: string) => `(${s})`;
/** Does this node's TeX start with a digit (so juxtaposing it after another factor would run two numbers together)? */
const startsNumber = (n: Node): boolean => n.k === "num" || ((n.k === "pow" || n.k === "mul" || n.k === "div") && startsNumber(n.a));

function tex(n: Node): string {
  switch (n.k) {
    case "num": return n.s;
    case "x": return "x";
    case "const": return n.name === "pi" ? "\\pi" : "e";
    case "neg": return `-${isSum(n.a) || n.a.k === "neg" ? paren(tex(n.a)) : tex(n.a)}`;
    case "add": return `${tex(n.a)} + ${n.b.k === "neg" ? paren(tex(n.b)) : tex(n.b)}`;
    case "sub": return `${tex(n.a)} - ${isSum(n.b) || n.b.k === "neg" ? paren(tex(n.b)) : tex(n.b)}`;
    case "mul": {
      const a = isSum(n.a) ? paren(tex(n.a)) : tex(n.a);
      const b = isSum(n.b) || n.b.k === "neg" ? paren(tex(n.b)) : tex(n.b);
      if (!n.implicit || startsNumber(n.b) || n.a.k === "div" || n.b.k === "div") return `${a} \\cdot ${b}`;
      return /\\[a-zA-Z]+$/.test(a) && /^[a-zA-Z]/.test(b) ? `${a} ${b}` : `${a}${b}`;
    }
    case "div": return `\\frac{${tex(n.a)}}{${tex(n.b)}}`;
    case "pow": {
      const e = `^{${tex(n.b)}}`;
      if (n.a.k === "fn" && !n.a.base && n.a.name !== "sqrt" && n.a.name !== "cbrt" && n.a.name !== "abs") return `${TEX_FN[n.a.name]}${e}(${tex(n.a.arg)})`;
      const simple = n.a.k === "x" || n.a.k === "const" || (n.a.k === "num" && n.a.v >= 0) || (n.a.k === "fn" && (n.a.name === "sqrt" || n.a.name === "cbrt" || n.a.name === "abs"));
      return `${simple ? tex(n.a) : paren(tex(n.a))}${e}`;
    }
    case "fn": {
      if (n.name === "sqrt" || n.name === "cbrt") return `${TEX_FN[n.name]}{${tex(n.arg)}}`;
      if (n.name === "abs") return `\\lvert ${tex(n.arg)} \\rvert`;
      if (n.base) return `\\log_{${tex(n.base)}}(${tex(n.arg)})`;
      return `${TEX_FN[n.name]}(${tex(n.arg)})`;
    }
  }
}

/** The TeX the typesetter reads for an expression (maths/typeset.ts parseTex), with its + C when one was written. */
export function toTex(e: Expr): string {
  return tex(e.node) + (e.constant ? " + C" : "");
}
