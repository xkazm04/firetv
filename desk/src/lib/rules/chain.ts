/**
 * The chain checker: does each line of a Calculus working still hold, given the line before it? Pure, built only on
 * the numeric primitives of calc-expr (compile, derivativeAt, limitAt, limitInf, SAMPLES) and calc's own tolerances;
 * nothing here throws, and a line it cannot read or cannot decide is null - the desk never rings what it did not check.
 *
 * A line is `{ tag, text }`, the tag naming how the line follows the one before it:
 *   - `=`     the same function (agreeing at every SAMPLES point), or equal values for two constants;
 *   - `d/dx`  the derivative of the line before (`derivativeAt` at the samples);
 *   - `int`   an antiderivative of the line before (its derivative is that line); the last indefinite line needs +C;
 *   - `at`    the value of the line before at `x`;
 *   - `lim`   the limit of the line before as x -> `x` (a number, 'inf' or '-inf'; `side` for one side);
 *   - `solve0` a line `x = c` (or `c`) where the line before is zero at c.
 * `of` names the line a line follows when it is not the one before (a root found from an earlier derivative). A line
 * with two sides (`x^2 = 1`) is null; a one-sided label ('f(x) =', "f'(x) =", 'y =') or a leading '=' is allowed.
 * The first line follows `opts.from` (the item's own function, code's) and is null when there is none.
 *
 * The second half reads a Calculus item's own working lines and tags them from the item's spec (`tagLines`), so the
 * server that places the pen and the paper that ticks the lines read the same chain.
 */
import { compile, derivativeAt, limitAt, limitInf, SAMPLES, SAME_REL, type Expr } from "./calc-expr";
import { FUNCTION_TOL, ROUNDED_CLOSE, type CalcSpec } from "./calc";

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

/** `=`: the same function (or the same value) as the line before. */
function equals(a: Expr, b: Expr, written: string): ChainResult {
  if (!a.usesX && !b.usesX) return sameValue(a.at(), b.at(), written, SAME_REL);
  const pairs: Pair[] = [];
  for (const x of SAMPLES) {
    const u = a.at(x), v = b.at(x), du = Number.isFinite(u), dv = Number.isFinite(v);
    if (x > 0 && du !== dv) return null; // defined on one only: a domain question the desk does not decide
    if (du && dv) pairs.push([u, v]);
  }
  return verdictOf(pairs, SAME_REL);
}

/** `d/dx` (b is the derivative of a) and `int` (a is the derivative of b). */
function derivesTo(a: Expr, b: Expr): ChainResult {
  const pairs: Pair[] = [];
  for (const x of SAMPLES) {
    const d = derivativeAt(a, x), v = b.at(x);
    if (d !== null && Number.isFinite(v)) pairs.push([d, v]);
  }
  return verdictOf(pairs, FUNCTION_TOL);
}

const INF = /^\s*([+-]?)\s*(?:inf|infinity|∞)\s*$/i;
const DNE = /^\s*(?:dne|does not exist)\s*$/i;

function limitLine(a: Expr, line: ChainLine, body: string): ChainResult {
  const at = line.x === "inf" || line.x === "-inf" ? line.x : constantValue(line.x);
  if (at === null) return null;
  const lim = at === "inf" ? limitInf(a, 1) : at === "-inf" ? limitInf(a, -1) : limitAt(a, at, line.side);
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
    case "d/dx": return b ? derivesTo(a, b) : null;
    case "int": return b ? derivesTo(b, a) : null;
    case "at": {
      const x = constantValue(line.x);
      if (x === null || !b || b.usesX) return null;
      const v = a.at(x);
      return Number.isFinite(v) ? sameValue(v, b.at(), bodySrc, VALUE_TOL) : null;
    }
    case "lim": return limitLine(a, line, bodySrc);
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
        }
      }
    } catch {
      result = null;
    }
    out.push(result);
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
const LIM = /^lim(?:it)?\s*_?\{?\s*x\s*(?:->|→|\\to)\s*([^\s}]+?)\}?\s+(.+)$/i;

type Kind = "fn" | "deriv" | "anti" | "value" | "limbody" | "zeroeq" | "solve" | null;
const num = (n: string | number): number | null => constantValue(n);

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
  const specAt: string | number | null = spec.shape === "limit" ? spec.at : null;
  const side = spec.shape === "limit" ? spec.side : undefined;
  const sameAt = (a: string): boolean => {
    const s = a.replace(/∞/g, "inf").replace(/^\+/, "");
    if (specAt === "inf" || specAt === "-inf") return s === specAt;
    const u = num(s), v = specAt === null ? null : num(specAt);
    return u !== null && v !== null && Math.abs(u - v) <= 1e-9;
  };
  let kind: Kind = from ? "fn" : null;
  let lastFn = from, lastDeriv: string | null = null;
  const out: ChainLine[] = [];
  for (const raw of lines) {
    const none = (): ChainLine => { kind = null; return { tag: NONE, text: raw }; };
    const t = typeof raw === "string" ? raw.trim() : "";
    const parts = t.split("=").map((p) => p.trim());
    let line: ChainLine | null = null;
    if (!t || parts.length > 2) { out.push(none()); continue; }
    // a line in words asserts nothing: it is null, and the next line follows the last line that did
    if (parts.length === 1 && !compile(t) && !LIM.test(t) && !INTEGRAL.test(t)) { out.push({ tag: NONE, text: raw, skip: true }); continue; }

    const lead = parts.length === 2 && parts[0] === "";
    const lim = LIM.exec(lead ? parts[1] : parts[0]);
    if (lim) {
      if (specAt === null || !sameAt(lim[1])) { out.push(none()); continue; }
      if (parts.length === 2 && !lead) {
        line = { tag: "lim", text: parts[1], of: lim[2], x: specAt ?? lim[1], ...(side ? { side } : {}) };
        kind = "value";
      } else if (kind === "fn" || kind === "limbody") {
        line = { tag: "=", text: lim[2] };
        kind = "limbody";
      }
    } else if (parts.length === 1) {
      const g = INTEGRAL.exec(parts[0]);
      if (g && kind === "fn") { line = { tag: "=", text: g[1] }; }
    } else if (parts[0] === "") {
      // a leading '=': the same thing as the line before
      const rest = parts[1], e = compile(rest);
      if (e && kind === "limbody" && !e.usesX && specAt !== null) { line = { tag: "lim", text: rest, x: specAt, ...(side ? { side } : {}) }; kind = "value"; }
      else if (e && (kind === "fn" || kind === "deriv" || kind === "anti" || kind === "value" || kind === "limbody")) { line = { tag: "=", text: rest }; if (kind === "fn") lastFn = rest; else if (kind === "deriv") lastDeriv = rest; }
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
      } else if (ANTI_LABEL.test(left)) {
        if (kind === "fn") { line = { tag: "int", text: rest }; kind = "anti"; }
        else if (kind === "anti") line = { tag: "=", text: rest };
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

/** Each working line of a Calculus item checked against its own spec: true, false or null per line. */
export function chainChecks(spec: unknown, working: readonly string[]): ChainResult[] {
  if (!spec || typeof spec !== "object" || !working.length) return working.map(() => null);
  try {
    const tagged = tagLines(spec as CalcSpec, working);
    return checkChain(tagged.lines, { from: tagged.from ?? undefined, definite: tagged.definite });
  } catch {
    return working.map(() => null);
  }
}

/** The first line the chain rings, or null: where the pen goes on a wrong Calculus item. */
export function chainPen(spec: unknown, working: readonly string[]): number | null {
  const at = chainChecks(spec, working).indexOf(false);
  return at < 0 ? null : at;
}
