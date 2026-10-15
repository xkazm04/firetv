/**
 * The chain checker: does each line of a Calculus working still hold, given the line before it? Pure, built only on
 * the numeric primitives of calc-expr (compile, derivativeAt, limitAt, limitInf, SAMPLES) and calc's own tolerances;
 * nothing here throws, and a line it cannot read or cannot decide is null - the desk never rings what it did not check.
 *
 * A line is `{ tag, text }`, the tag naming how the line follows the one before it:
 *   - `=`     the same function (agreeing at every SAMPLES point where both are defined), or equal values for two constants;
 *   - `d/dx`  the derivative of the line before (`derivativeAt` at the samples);
 *   - `int`   an antiderivative of the line before (its derivative is that line); the last indefinite line needs +C;
 *   - `at`    the value of the line before at `x`;
 *   - `lim`   the limit of the line before as x -> `x` (a number, 'inf' or '-inf'; `side` for one side);
 *   - `solve0` a line `x = c` (or `c`) where the line before is zero at c;
 *   - `between` the value of the line before (an antiderivative) from `x` to `to`: F(to) - F(x) (MB-B29, MB3-14);
 *   - `limeq` an expression with the same limit as x -> `x` as the line before (`lim A = lim B`: L'Hopital's body is
 *     not the same function, only the same limit). Two finite limits that clearly differ are false; any other pair
 *     the desk cannot tell apart cleanly (an infinity, no limit) is null. `also` names a second body the same line
 *     asserts against the same line before (the A of `lim A = lim B`): the line is false if either is.
 * `of` names the line a line follows when it is not the one before (a root found from an earlier derivative). An
 * `aside` line (u' = 2x under a u = x^2 binding) is checked against its `of` and leaves the chain where it was. A line
 * with two sides (`x^2 = 1`) is null; a one-sided label ('f(x) =', "f'(x) =", 'y =') or a leading '=' is allowed. The
 * function relations compare one way (D2): a line undefined where what it follows is defined is null, never true.
 * The first line follows `opts.from` (the item's own function, code's) and is null when there is none.
 *
 * The second half reads a Calculus item's own working lines and tags them from the item's spec (`tagLines`), so the
 * server that places the pen and the paper that ticks the lines read the same chain.
 */
import { checkerFault } from "./fault";
import { compile, derivativeAt, limitAt, limitInf, SAMPLES, SAME_REL, toPlain, type Expr, type FnName, type Limit, type Node } from "./calc-expr";
import { FUNCTION_TOL, ROUNDED_CLOSE, type CalcSpec } from "./calc";
import { isCalc2Spec } from "./calc2";
import { czechAnswer } from "./calc-read";
import { commaSystem, type SchoolSystem } from "./taskText";

export interface ChainLine {
  tag: string;
  text: string;
  /** For `at` and `lim`: the point. */
  x?: number | string;
  /** For `lim`: one side only. */
  side?: "+" | "-";
  /** The expression this line follows, when it is not the line before. */
  of?: string;
  /** A line in words: it asserts nothing, is null, and the next line follows the last line that did. */
  skip?: boolean;
  /** For `between`: the upper bound. */
  to?: number | string;
  /** A second body the line asserts against the same line before (the A of `lim A = lim B`). */
  also?: string;
  /** Checked against `of`; the next line still follows the line before this one. */
  aside?: boolean;
}
export interface ChainOpts {
  /** The variable the learner writes (default x); the engine reads x only. */
  letter?: string;
  /** What line 0 follows. */
  from?: string;
  /** A definite integral: an antiderivative line needs no +C. */
  definite?: boolean;
}
export type ChainResult = boolean | null;

/** Fewest samples at which a function relation must be checked before it is claimed either way. */
const MIN_PAIRS = 3;
/** A value that is not exact but within ROUNDED_CLOSE of the truth, written as a decimal, is a rounding: not ringed. */
const VALUE_TOL = 1e-6;

const LABEL = /^\s*(?:[A-Za-z]\s*[′']*(?:\s*\(\s*[A-Za-z]\s*\))?|d[A-Za-z]\s*\/\s*d[A-Za-z])\s*$/;

const withLetter = (src: string, letter: string): string =>
  letter === "x" || !/^[A-Za-z]$/.test(letter) ? src : src.replace(new RegExp(`(?<![A-Za-z])${letter}(?![A-Za-z])`, "g"), "x");

/** The expression a line asserts: itself, or the right of a one-sided label or leading '='. Null: two sides, or empty. */
function bodyOf(text: unknown, letter: string): string | null {
  if (typeof text !== "string") return null;
  const parts = text.split("=");
  if (parts.length === 1) return text.trim() ? text.trim() : null;
  if (parts.length !== 2 || !parts[1].trim()) return null;
  const left = parts[0].trim();
  if (left === "" || (LABEL.test(left) && left !== letter)) return parts[1].trim();
  return null;
}

type Pair = [number, number];
function verdictOf(pairs: Pair[], tol: number): ChainResult {
  if (pairs.length < MIN_PAIRS) return null;
  return pairs.every(([u, v]) => Math.abs(u - v) <= tol * Math.max(1, Math.abs(u), Math.abs(v)));
}

/** Are two values the same? A decimal that is only near is a rounding, which the desk does not ring. */
function sameValue(a: number, b: number, written: string, tol: number): ChainResult {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const d = Math.abs(a - b), scale = Math.max(1, Math.abs(a), Math.abs(b));
  if (d <= tol * scale) return true;
  return d <= ROUNDED_CLOSE * scale && /\d\.\d/.test(written) ? null : false;
}

const constantValue = (src: unknown): number | null => {
  const e = compile(typeof src === "number" ? String(src) : src);
  if (!e || e.usesX) return null;
  const v = e.at();
  return Number.isFinite(v) ? v : null;
};

/**
 * The working line against what the line before makes it, one way (D2, as the judge's agreesWhereBoth): compared where
 * both are defined, so a line defined where the line before is not is fine (x + 2 after (x^2 - 4)/(x - 2)). A line that
 * agrees there but is undefined where the line before is defined is not a clean step - a domain question the desk does
 * not decide - so null, not true (ln(x) + C as the integral of 1/x); one that disagrees where both are defined is false.
 */
function oneWay(line: (x: number) => number | null, before: (x: number) => number | null, tol: number): ChainResult {
  const pairs: Pair[] = [];
  let gap = false;
  for (const x of SAMPLES) {
    const u = line(x), v = before(x), du = u !== null && Number.isFinite(u), dv = v !== null && Number.isFinite(v);
    if (dv && !du) gap = true;
    if (du && dv) pairs.push([u, v]);
  }
  const r = verdictOf(pairs, tol);
  return r === true && gap ? null : r;
}

/** `=`: the same function (or the same value) as the line before. */
function equals(a: Expr, b: Expr, written: string): ChainResult {
  if (!a.usesX && !b.usesX) return sameValue(a.at(), b.at(), written, SAME_REL);
  const r = oneWay((x) => b.at(x), (x) => a.at(x), SAME_REL);
  // a function then a constant (or the reverse) under = is a value put in at a point the line does not name: the desk
  // cannot tell what was substituted, so it is never rung (MB3-14: "= 3^2 + 1" after x^2 + 1)
  return a.usesX !== b.usesX && r === false ? null : r;
}

/** `d/dx`: the line b is the derivative of the line before, a. */
const derivativeOf = (a: Expr, b: Expr): ChainResult => oneWay((x) => b.at(x), (x) => derivativeAt(a, x), FUNCTION_TOL);
/** `int`: the line b is an antiderivative of the line before, a (b's derivative is a). */
const antiderivativeOf = (a: Expr, b: Expr): ChainResult => oneWay((x) => derivativeAt(b, x), (x) => a.at(x), FUNCTION_TOL);

const INF = /^\s*([+-]?)\s*(?:inf|infinity|∞)\s*$/i;
const DNE = /^\s*(?:dne|does not exist)\s*$/i;

function limitOf(a: Expr, line: ChainLine): Limit | null {
  const at = line.x === "inf" || line.x === "-inf" ? line.x : constantValue(line.x);
  if (at === null) return null;
  return at === "inf" ? limitInf(a, 1) : at === "-inf" ? limitInf(a, -1) : limitAt(a, at, line.side);
}

/** Limits that differ by more than this, relatively, are different; nearer but not within VALUE_TOL is null. */
const LIMIT_APART = 1e-3;
/** `limeq`: the same limit. Only two finite limits that clearly differ are false; an infinity or no limit is null. */
function sameLimit(a: Expr, b: Expr, line: ChainLine): ChainResult {
  const la = limitOf(a, line), lb = limitOf(b, line);
  if (!la || !lb) return null;
  if (la.kind === "inf" && lb.kind === "inf") return la.sign === lb.sign ? true : null;
  if (la.kind !== "value" || lb.kind !== "value") return null;
  const d = Math.abs(la.v - lb.v), scale = Math.max(1, Math.abs(la.v), Math.abs(lb.v));
  return d <= VALUE_TOL * scale ? true : d > LIMIT_APART * scale ? false : null;
}

function limitLine(a: Expr, line: ChainLine, body: string): ChainResult {
  const lim = limitOf(a, line);
  if (!lim) return null;
  const m = INF.exec(body);
  if (m) return lim.kind === "inf" ? lim.sign === (m[1] === "-" ? -1 : 1) : false;
  if (DNE.test(body)) return lim.kind === "dne";
  const v = constantValue(body);
  if (v === null) return null;
  return lim.kind === "value" ? sameValue(lim.v, v, body, VALUE_TOL) : false;
}

function relate(line: ChainLine, a: Expr, bodySrc: string, letter: string): ChainResult {
  const b = compile(withLetter(bodySrc, letter));
  switch (line.tag) {
    case "=": return b ? equals(a, b, bodySrc) : null;
    case "d/dx": return b ? derivativeOf(a, b) : null;
    case "int": return b ? antiderivativeOf(a, b) : null;
    case "at": {
      const x = constantValue(line.x);
      if (x === null || !b || b.usesX) return null;
      const v = a.at(x);
      return Number.isFinite(v) ? sameValue(v, b.at(), bodySrc, VALUE_TOL) : null;
    }
    case "lim": return limitLine(a, line, bodySrc);
    case "limeq": return b ? sameLimit(a, b, line) : null;
    case "between": {
      const lo = constantValue(line.x), hi = constantValue(line.to);
      if (lo === null || hi === null || !b || b.usesX) return null;
      const v = a.at(hi) - a.at(lo);
      return Number.isFinite(v) ? sameValue(v, b.at(), bodySrc, VALUE_TOL) : null;
    }
    default: return null;
  }
}

/**
 * Each line of a working: true (it holds), false (it stops holding here) or null (the desk cannot tell). Each line is
 * checked against the line as written before it, so a slip is rung at its own line and the lines that carry it on
 * are judged on their own step.
 */
export function checkChain(lines: readonly ChainLine[], opts: ChainOpts = {}): ChainResult[] {
  const letter = opts.letter ?? "x";
  const out: ChainResult[] = [];
  let prev: string | null = typeof opts.from === "string" ? opts.from : null;
  const bodies: (string | null)[] = [];
  for (const line of lines) {
    let result: ChainResult = null, body: string | null = null;
    if (line?.skip) { out.push(null); bodies.push(null); continue; }
    try {
      if (line && typeof line.text === "string") {
        if (line.tag === "solve0") {
          const parts = line.text.split("=");
          const right = parts.length === 1 ? parts[0] : parts.length === 2 && parts[0].trim() === letter ? parts[1] : null;
          body = right && right.trim() ? right.trim() : null;
          const src = line.of ?? prev, a = src === null ? null : compile(withLetter(src, letter));
          const c = body === null ? null : constantValue(withLetter(body, letter));
          if (a && c !== null) {
            const v = a.at(c);
            const scale = Math.max(1, ...[c - 1, c + 1].map((p) => Math.abs(a.at(p))).filter(Number.isFinite));
            result = !Number.isFinite(v) ? null : Math.abs(v) <= VALUE_TOL * scale ? true : /\d\.\d/.test(body ?? "") ? null : false;
          }
        } else {
          body = bodyOf(line.text, letter);
          const src = line.of ?? prev, a = body === null || src === null ? null : compile(withLetter(src, letter));
          if (a && body !== null) result = relate(line, a, body, letter);
          if (a && typeof line.also === "string" && result !== false) {
            const r2 = relate(line, a, line.also, letter);
            result = r2 === false ? false : r2 === null ? null : result;
          }
        }
      }
    } catch (e) { checkerFault("chain.checkChain line", e);
      result = null;
    }
    out.push(result);
    if (line?.aside) { bodies.push(null); continue; }
    bodies.push(body);
    prev = body;
  }
  // an indefinite integral ends in +C: the last line of the run that began at the last `int` line
  if (!opts.definite) {
    let j = -1;
    for (let k = 0; k < lines.length; k++) if (lines[k]?.tag === "int") j = k;
    if (j >= 0) {
      let last = j;
      while (last + 1 < lines.length && lines[last + 1]?.tag === "=") last++;
      const b = bodies[last];
      const e = last === lines.length - 1 && b !== null ? compile(withLetter(b, letter)) : null;
      if (e && !e.constant && out[last] !== false) out[last] = false;
    }
  }
  return out;
}

// ------------------------------------------------------------------ reading a Calculus item's own working

const NONE = "?";
const PRIMES = "[′']";
const FN_LABEL = new RegExp(`^(?:[a-z]\\s*\\(\\s*x\\s*\\)|y)$`);
const ANTI_LABEL = /^(?:[A-Z]\s*\(\s*x\s*\)|[A-Z])$/;
const D1_LABEL = new RegExp(`^(?:[a-zA-Z]\\s*${PRIMES}(?:\\s*\\(\\s*x\\s*\\))?|d[a-z]\\s*\\/\\s*d[a-z])$`);
const AT_LABEL = /^[a-zA-Z]\s*\(\s*([^()]+?)\s*\)$/;
const D1_AT_LABEL = new RegExp(`^[a-zA-Z]\\s*${PRIMES}\\s*\\(\\s*([^()]+?)\\s*\\)$`);
const INTEGRAL = /^(?:∫|int)\s*(.+?)\s*d\s*x$/;
const ARROW = String.raw`\s*x\s*(?:->|→|\\to)\s*`;
/** "lim x->2 body", "lim_{x->0} body", "lim_(x->0) body" (MB-B29): the point and the body. */
const LIM = new RegExp(String.raw`^lim(?:it)?\s*_?\s*(?:[{(]${ARROW}([^\s})]+)\s*[})]\s*|${ARROW}(\S+?)\s+)(.+)$`, "i");
const limOf = (s: string): { at: string; body: string } | null => {
  const m = LIM.exec(s);
  return m ? { at: m[1] ?? m[2], body: m[3].trim() } : null;
};

type Kind = "fn" | "deriv" | "anti" | "value" | "limbody" | "zeroeq" | "solve" | null;
const num = (n: string | number): number | null => constantValue(n);

// ---- prime notation (MB-B29): "(B)'" is the derivative of B, worked out exactly from B's reading

const K = (v: number): Node => ({ k: "num", v, s: String(v) });
const isK = (n: Node, v: number) => n.k === "num" && n.v === v;
const hasX = (n: Node): boolean =>
  n.k === "x" ? true : n.k === "num" || n.k === "const" ? false : n.k === "neg" ? hasX(n.a) : n.k === "fn" ? hasX(n.arg) || (!!n.base && hasX(n.base)) : hasX(n.a) || hasX(n.b);
const add = (a: Node, b: Node): Node => (isK(a, 0) ? b : isK(b, 0) ? a : { k: "add", a, b });
const sub = (a: Node, b: Node): Node => (isK(b, 0) ? a : a.k === "num" && b.k === "num" ? K(a.v - b.v) : { k: "sub", a, b });
const mul = (a: Node, b: Node): Node =>
  isK(a, 0) || isK(b, 0) ? K(0) : isK(a, 1) ? b : isK(b, 1) ? a : { k: "mul", a, b, implicit: false };
const div = (a: Node, b: Node): Node => (isK(a, 0) ? K(0) : isK(b, 1) ? a : { k: "div", a, b });
const neg = (a: Node): Node => (isK(a, 0) ? a : { k: "neg", a });
const pow = (a: Node, b: Node): Node => ({ k: "pow", a, b });
const fn = (name: FnName, arg: Node): Node => ({ k: "fn", name, arg });

/** The outer derivative of each function at its argument g. */
const OUTER: Record<FnName, (g: Node) => Node> = {
  sin: (g) => fn("cos", g), cos: (g) => neg(fn("sin", g)), tan: (g) => div(K(1), pow(fn("cos", g), K(2))),
  sec: (g) => mul(fn("sec", g), fn("tan", g)), csc: (g) => neg(mul(fn("csc", g), fn("cot", g))), cot: (g) => neg(div(K(1), pow(fn("sin", g), K(2)))),
  asin: (g) => div(K(1), fn("sqrt", sub(K(1), pow(g, K(2))))), acos: (g) => neg(div(K(1), fn("sqrt", sub(K(1), pow(g, K(2)))))),
  atan: (g) => div(K(1), add(K(1), pow(g, K(2)))), sinh: (g) => fn("cosh", g), cosh: (g) => fn("sinh", g),
  tanh: (g) => div(K(1), pow(fn("cosh", g), K(2))), ln: (g) => div(K(1), g), log: (g) => div(K(1), g), exp: (g) => fn("exp", g),
  sqrt: (g) => div(K(1), mul(K(2), fn("sqrt", g))), cbrt: (g) => div(K(1), mul(K(3), pow(fn("cbrt", g), K(2)))), abs: (g) => div(g, fn("abs", g)),
};

/** d/dx of a reading, or null (a log whose base has x in it). Exact rules; nothing is estimated. */
function dNode(n: Node): Node | null {
  switch (n.k) {
    case "num": case "const": return K(0);
    case "x": return K(1);
    case "neg": { const d = dNode(n.a); return d && neg(d); }
    case "add": case "sub": {
      const da = dNode(n.a), db = dNode(n.b);
      return da && db ? (n.k === "add" ? add(da, db) : sub(da, db)) : null;
    }
    case "mul": {
      const da = dNode(n.a), db = dNode(n.b);
      return da && db ? add(mul(da, n.b), mul(n.a, db)) : null;
    }
    case "div": {
      const da = dNode(n.a), db = dNode(n.b);
      return da && db ? div(sub(mul(da, n.b), mul(n.a, db)), pow(n.b, K(2))) : null;
    }
    case "pow": {
      const da = dNode(n.a), db = dNode(n.b);
      if (!da || !db) return null;
      if (!hasX(n.b)) return mul(mul(n.b, pow(n.a, sub(n.b, K(1)))), da);
      if (!hasX(n.a)) return mul(mul(n, fn("ln", n.a)), db);
      return mul(n, add(mul(db, fn("ln", n.a)), div(mul(n.b, da), n.a)));
    }
    case "fn": {
      const da = dNode(n.arg);
      if (!da) return null;
      if (n.base) return hasX(n.base) ? null : div(da, mul(n.arg, fn("ln", n.base)));
      return mul(OUTER[n.name](n.arg), da);
    }
  }
}

const PRIME = /[′']/;
/** A function name before a primed bracket; `log_(10)` is the base-10 log a comma-system line is read into (calc-read czechAnswer). */
const FN_BEFORE = /(?<![A-Za-z])(?:arcsin|arccos|arctan|asin|acos|atan|sinh|cosh|tanh|sin|cos|tan|sec|csc|cot|ln|log(?:_\(10\))?|exp|sqrt|cbrt|abs)\s*$/;
/**
 * Each "(B)'" (or "sin(B)'") in a line replaced by the derivative of what is primed, in brackets; the line unchanged when
 * it has no such prime; null when a primed bracket cannot be read (a letter before it that is not a function name -
 * "x(x^2)'" is not guessed - or a B the engine cannot read).
 */
function expandPrimes(s: string): string | null {
  for (let guard = 0; guard < 12; guard++) {
    let i = -1;
    for (let k = 1; k < s.length; k++) if (PRIME.test(s[k]) && s[k - 1] === ")") { i = k; break; }
    if (i < 0) return s;
    let depth = 0, j = -1;
    for (let k = i - 1; k >= 0; k--) {
      if (s[k] === ")") depth++;
      else if (s[k] === "(" && --depth === 0) { j = k; break; }
    }
    if (j < 0) return null;
    const name = FN_BEFORE.exec(s.slice(0, j));
    const start = name ? j - name[0].length : j;
    if (!name && j > 0 && /[A-Za-z_]/.test(s[j - 1])) return null;
    const e = compile(s.slice(start, i));
    const d = e && !e.constant ? dNode(e.node) : null;
    if (!d) return null;
    s = `${s.slice(0, start)}(${toPlain({ node: d } as Expr)})${s.slice(i + 1)}`;
  }
  return null;
}

/** The letters a working may bind by substitution ("u = x^2"); never x, y, e or a function's label. */
const BIND = /^([uvwtz])\s*([′'])?\s*=\s*(.+)$/;
type Binds = Map<string, string>;
/** A part of a line with every bound letter (and its prime) put back in x, then its primes worked out. */
function resolve(part: string, binds: Binds): string | null {
  let s = part;
  for (const [u, g] of binds) {
    s = s.replace(new RegExp(`(?<![A-Za-z])${u}\\s*[′']`, "g"), `((${g})')`);
    s = s.replace(new RegExp(`(?<![A-Za-z])${u}(?![A-Za-z(])`, "g"), `(${g})`);
  }
  return expandPrimes(s);
}

/** The spec's own function, which anchors line 0. Code's, never the model's read. */
const anchorOf = (spec: CalcSpec): string | null =>
  spec.shape === "newton-step" ? null : typeof spec.f === "string" ? spec.f : null;

/**
 * Tag a Calculus item's working lines from its spec: what each line is claimed to be and what it follows. A line whose
 * relation cannot be told - words, two sides, a form not listed here - is tagged `?`, which checks as null: the tagger
 * never guesses. `from` is what line 0 follows (the spec's own function).
 */
export function tagLines(spec: CalcSpec, lines: readonly string[]): { lines: ChainLine[]; from: string | null; definite: boolean } {
  const from = anchorOf(spec);
  const definite = spec.shape === "definite-integral";
  const root = spec.shape === "critical-point" || spec.shape === "extremum";
  // a one-capital label (F, F(x)) is an antiderivative only where the item integrates; elsewhere it names the function
  // (A for an area, D for a diagonal, v2 M3a), as f(x) = does
  const integrates = spec.shape === "antiderivative" || spec.shape === "definite-integral";
  const specAt: string | number | null = spec.shape === "limit" ? spec.at : null;
  const side = spec.shape === "limit" ? spec.side : undefined;
  const sameAt = (a: string): boolean => {
    const s = a.replace(/∞/g, "inf").replace(/^\+/, "");
    if (specAt === "inf" || specAt === "-inf") return s === specAt;
    const u = num(s), v = specAt === null ? null : num(specAt);
    return u !== null && v !== null && Math.abs(u - v) <= 1e-9;
  };
  const point: string | number | null = spec.shape === "evaluate" || spec.shape === "derivative-at" ? spec.at : null;
  const derives = spec.shape === "derivative" || spec.shape === "derivative-at" || root;
  const limAt = specAt !== null ? { x: specAt, ...(side ? { side } : {}) } : null;
  let kind: Kind = from ? "fn" : null;
  let lastFn = from, lastDeriv: string | null = null;
  // nothing the learner wrote has been read yet: the line before is the spec's own function, not a line on the page
  let wrote = false;
  const binds: Binds = new Map();
  const out: ChainLine[] = [];
  for (const raw of lines) {
    const none = (): ChainLine => { kind = null; return { tag: NONE, text: raw }; };
    const t0 = typeof raw === "string" ? raw.trim() : "";
    // a substitution (MB-B29): "u = x^2" binds u for the lines after it and asserts nothing; "u' = 2x" is checked as the
    // derivative of what u is, aside, so the next line still follows the line before the binding
    const clauses = t0 ? t0.split(",").map((c) => BIND.exec(c.trim())) : [];
    if (clauses.length && clauses.every((c) => c)) {
      let aside: ChainLine | null = null, ok = true;
      for (const c of clauses as RegExpExecArray[]) {
        const rhs = resolve(c[3].trim(), binds), e = rhs === null ? null : compile(rhs);
        if (!e) { ok = false; break; }
        if (!c[2]) binds.set(c[1], rhs!);
        else if (binds.has(c[1]) && !aside) aside = { tag: "d/dx", text: rhs!, of: binds.get(c[1]), aside: true };
        else { ok = false; break; }
      }
      if (ok) { out.push(aside ?? { tag: NONE, text: raw, skip: true }); continue; }
      out.push(none());
      continue;
    }
    const split = t0.split("=").map((p) => p.trim());
    // bound letters put back in x and "(B)'" worked out; a part that cannot be is left as written (and reads as null)
    const parts = split.map((p) => resolve(p, binds) ?? p);
    const t = parts.join(" = ");
    let line: ChainLine | null = null;
    if (!t0 || parts.length > 2) { wrote = true; out.push(none()); continue; }
    // a line in words asserts nothing: it is null, and the next line follows the last line that did
    if (parts.length === 1 && !compile(t) && !LIM.test(t) && !INTEGRAL.test(t)) { out.push({ tag: NONE, text: raw, skip: true }); continue; }
    const first = !wrote;
    wrote = true;

    const lead = parts.length === 2 && parts[0] === "";
    const lim = limOf(lead ? parts[1] : parts[0]);
    const lim2 = parts.length === 2 && !lead ? limOf(parts[1]) : null;
    if (lim) {
      if (limAt === null || !sameAt(lim.at) || (lim2 && !sameAt(lim2.at))) { out.push(none()); continue; }
      if (lim2) {
        // "lim A = lim B": both have the limit of the line before (L'Hopital's B is not A, only its limit is)
        if (kind === "fn" || kind === "limbody") { line = { tag: "limeq", text: lim2.body, also: lim.body, ...limAt }; kind = "limbody"; }
      } else if (parts.length === 2 && !lead) {
        line = { tag: "lim", text: parts[1], of: lim.body, ...limAt };
        kind = "value";
      } else if (kind === "fn" || kind === "limbody") {
        line = { tag: "limeq", text: lim.body, ...limAt };
        kind = "limbody";
      }
    } else if (parts.length === 1) {
      const g = INTEGRAL.exec(parts[0]);
      if (g && kind === "fn") { line = { tag: "=", text: g[1] }; }
    } else if (parts[0] === "") {
      // a leading '=': the same thing as the line before
      const rest = parts[1], e = compile(rest);
      if (!e) { /* unread */ }
      else if (!e.usesX && (kind === "limbody" || kind === "fn") && limAt !== null) { line = { tag: "lim", text: rest, ...limAt }; kind = "value"; }
      else if (kind === "limbody") line = { tag: "limeq", text: rest, ...limAt! };
      // a value after an antiderivative on a definite integral is F(b) - F(a); after the function (or its derivative
      // on a derivative-at item) it is the value at the item's point (MB3-14: never "the same function")
      else if (!e.usesX && kind === "anti" && spec.shape === "definite-integral") { line = { tag: "between", text: rest, x: spec.a, to: spec.b }; kind = "value"; }
      else if (!e.usesX && kind === "fn" && spec.shape === "evaluate" && point !== null) { line = { tag: "at", text: rest, of: lastFn ?? undefined, x: point }; kind = "value"; }
      else if (!e.usesX && kind === "deriv" && spec.shape === "derivative-at" && point !== null) { line = { tag: "at", text: rest, of: lastDeriv ?? undefined, x: point }; kind = "value"; }
      else if (first && kind === "fn" && from !== null) {
        // the first line read follows the spec's own function, which the learner did not write: "= 3x^2" may be the
        // function or its derivative. The tag is the relation that holds; when none does, the line is not guessed
        const a = compile(from);
        const holds = (r: ChainResult) => r === true;
        if (a && holds(equals(a, e, rest))) { line = { tag: "=", text: rest }; lastFn = rest; }
        else if (a && derives && e.usesX && holds(derivativeOf(a, e))) { line = { tag: "d/dx", text: rest }; kind = "deriv"; lastDeriv = rest; }
        else if (a && integrates && e.usesX && holds(antiderivativeOf(a, e))) { line = { tag: "int", text: rest }; kind = "anti"; }
      }
      else if (kind === "fn" || kind === "deriv" || kind === "anti" || kind === "value") { line = { tag: "=", text: rest }; if (kind === "fn") lastFn = rest; else if (kind === "deriv") lastDeriv = rest; }
    } else if (parts[1] === "0" && !LABEL.test(parts[0]) && compile(parts[0])) {
      kind = "zeroeq";
      out.push({ tag: NONE, text: raw });
      continue;
    } else {
      const [left, rest] = parts;
      const integral = INTEGRAL.exec(left);
      let m: RegExpExecArray | null;
      if (D1_LABEL.test(left)) {
        if (kind === "fn") { line = { tag: "d/dx", text: rest }; kind = "deriv"; lastDeriv = rest; }
        else if (kind === "deriv") { line = { tag: "=", text: rest }; lastDeriv = rest; }
      } else if (FN_LABEL.test(left)) {
        if (kind === "fn") { line = { tag: "=", text: rest }; lastFn = rest; }
      } else if (integral) {
        line = { tag: "int", text: rest, of: integral[1] };
        kind = "anti";
      } else if (ANTI_LABEL.test(left) && integrates) {
        if (kind === "fn") { line = { tag: "int", text: rest }; kind = "anti"; }
        else if (kind === "anti") line = { tag: "=", text: rest };
      } else if (ANTI_LABEL.test(left)) {
        if (kind === "fn") { line = { tag: "=", text: rest }; lastFn = rest; }
      } else if ((m = D1_AT_LABEL.exec(left))) {
        if (lastDeriv !== null && num(m[1]) !== null) { line = { tag: "at", text: rest, of: lastDeriv, x: m[1] }; kind = "value"; }
      } else if ((m = AT_LABEL.exec(left)) && m[1] !== "x") {
        if (lastFn !== null && num(m[1]) !== null) { line = { tag: "at", text: rest, of: lastFn, x: m[1] }; kind = "value"; }
      } else if (left === "x" && root && lastDeriv !== null && (kind === "zeroeq" || kind === "deriv" || kind === "solve")) {
        line = { tag: "solve0", text: rest, of: lastDeriv };
        kind = "solve";
      }
    }
    if (line) out.push(line);
    else out.push(none());
  }
  return { lines: out, from, definite };
}

/**
 * The working lines as the learner's school system writes them (MB-B36): in a comma system (cz, de) each line is read as
 * its answer is (calc-read czechAnswer, the one table): tg, cotg, arctg, arccotg are tan, cot, arctan and arccot, a decimal
 * comma between two digits is a point, and a trailing + K or + C1 is the constant. Any other system: the lines as written.
 */
const asWritten = (working: readonly string[], system?: SchoolSystem): readonly string[] =>
  commaSystem(system) ? working.map((l) => (typeof l === "string" ? czechAnswer(l, system) : l)) : working;

/**
 * Each working line of a Calculus item checked against its own spec: true, false or null per line. A Calculus 2 spec
 * (rules/calc2) has no chain: every line is null, so its working stays bare (v2 M3b-3b ruling 32). `system` is the
 * learner's school system: a cz learner's tg(x) line is read as tan(x) (asWritten); with none the lines are read as before.
 */
export function chainChecks(spec: unknown, working: readonly string[], system?: SchoolSystem): ChainResult[] {
  if (!spec || typeof spec !== "object" || !working.length || isCalc2Spec(spec)) return working.map(() => null);
  try {
    const tagged = tagLines(spec as CalcSpec, asWritten(working, system));
    return checkChain(tagged.lines, { from: tagged.from ?? undefined, definite: tagged.definite });
  } catch (e) { checkerFault("chain.chainChecks", e);
    return working.map(() => null);
  }
}

/** The first line the chain rings, or null: where the pen goes on a wrong Calculus item. */
export function chainPen(spec: unknown, working: readonly string[], system?: SchoolSystem): number | null {
  const at = chainChecks(spec, working, system).indexOf(false);
  return at < 0 ? null : at;
}
