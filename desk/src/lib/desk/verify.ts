/**
 * The one thing the desk can check for itself.
 *
 * The model writes the practice items and the model marks the work. That is fine for wording
 * and for naming a slip, but it is not fine for truth: a generated item whose stated answer is
 * wrong, or a correct student line marked wrong, poisons everything downstream — the skill
 * estimate, the "secure" flag, the next topic. So one deterministic backstop sits under all of
 * it. Substitute the value into the equation and see whether the two sides agree.
 *
 * No dependencies, no `eval`, no `new Function` — a tokenizer and a recursive-descent parser.
 * Malformed input never throws: `verify` returns false, `evaluate` returns null.
 */

type Tok =
  | { k: "num"; v: number }
  | { k: "x" }
  | { k: "op"; v: "+" | "-" | "*" | "/" | "^" }
  | { k: "(" } | { k: ")" }
  | { k: "sq" };   // the ² suffix

/** Normalise the characters a phone camera and a keyboard both produce. */
function normalise(s: string): string {
  return s
    .replace(/[−–—‐‑]/g, "-")   // unicode minus, dashes
    .replace(/[×∙⋅·]/g, "*")          // ×, ∙, ⋅, ·
    .replace(/[÷]/g, "/")
    .replace(/[’“”]/g, "")
    .replace(/[\[\{]/g, "(")
    .replace(/[\]\}]/g, ")");
}

function lex(src: string): Tok[] | null {
  const s = normalise(src);
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c >= "0" && c <= "9") {
      let j = i;
      while (j < s.length && s[j] >= "0" && s[j] <= "9") j++;
      if (s[j] === ".") { j++; while (j < s.length && s[j] >= "0" && s[j] <= "9") j++; }
      const v = Number(s.slice(i, j));
      if (!Number.isFinite(v)) return null;
      out.push({ k: "num", v }); i = j; continue;
    }
    if (c === ".") {
      let j = i + 1;
      while (j < s.length && s[j] >= "0" && s[j] <= "9") j++;
      if (j === i + 1) return null;
      out.push({ k: "num", v: Number(s.slice(i, j)) }); i = j; continue;
    }
    if (c === "x" || c === "X") { out.push({ k: "x" }); i++; continue; }
    if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") { out.push({ k: "op", v: c }); i++; continue; }
    if (c === "(") { out.push({ k: "(" }); i++; continue; }
    if (c === ")") { out.push({ k: ")" }); i++; continue; }
    if (c === "²") { out.push({ k: "sq" }); i++; continue; }
    return null;   // anything else is not arithmetic we understand
  }
  return out;
}

/**
 * expr  := term (('+'|'-') term)*
 * term  := unary (('*'|'/') unary | unary)*     — a bare unary is implicit multiplication
 * unary := ('+'|'-') unary | power
 * power := atom ('^' unary)? with a postfix ² allowed on the atom
 * atom  := num | x | '(' expr ')'
 */
class Parser {
  private i = 0;
  constructor(private t: Tok[], private x: number) {}

  private peek(): Tok | undefined { return this.t[this.i]; }
  private startsAtom(): boolean {
    const p = this.peek();
    return !!p && (p.k === "num" || p.k === "x" || p.k === "(");
  }

  parse(): number {
    const v = this.expr();
    if (this.i !== this.t.length) throw new Error("trailing input");
    return v;
  }

  private expr(): number {
    let v = this.term();
    for (;;) {
      const p = this.peek();
      if (p && p.k === "op" && (p.v === "+" || p.v === "-")) { this.i++; const r = this.term(); v = p.v === "+" ? v + r : v - r; }
      else return v;
    }
  }

  private term(): number {
    let v = this.unary();
    for (;;) {
      const p = this.peek();
      if (p && p.k === "op" && (p.v === "*" || p.v === "/")) {
        this.i++; const r = this.unary(); v = p.v === "*" ? v * r : v / r;
      } else if (this.startsAtom()) {
        v = v * this.unary();   // 3x, 2(x-1), (x+1)(x-2)
      } else return v;
    }
  }

  private unary(): number {
    const p = this.peek();
    if (p && p.k === "op" && (p.v === "-" || p.v === "+")) { this.i++; const v = this.unary(); return p.v === "-" ? -v : v; }
    return this.power();
  }

  private power(): number {
    let v = this.atom();
    for (;;) {
      const p = this.peek();
      if (p && p.k === "sq") { this.i++; v = v * v; continue; }
      if (p && p.k === "op" && p.v === "^") { this.i++; const e = this.unary(); return Math.pow(v, e); }
      return v;
    }
  }

  private atom(): number {
    const p = this.peek();
    if (!p) throw new Error("unexpected end");
    if (p.k === "num") { this.i++; return p.v; }
    if (p.k === "x") { this.i++; return this.x; }
    if (p.k === "(") {
      this.i++;
      const v = this.expr();
      const q = this.peek();
      if (!q || q.k !== ")") throw new Error("unclosed bracket");
      this.i++;
      return v;
    }
    throw new Error("unexpected token");
  }
}

/** The value of `expr` with x set to `x`, or null if the expression is not arithmetic we can read. */
export function evaluate(expr: string, x: number): number | null {
  if (typeof expr !== "string" || !expr.trim()) return null;
  const t = lex(expr);
  if (!t || !t.length) return null;
  try {
    const v = new Parser(t, x).parse();
    return Number.isFinite(v) ? v : null;
  } catch { return null; }
}

/** Does `value` satisfy `equation`? Both sides evaluated, compared within 1e-9 relative tolerance. */
export function verify(equation: string, value: string): boolean {
  if (typeof equation !== "string" || typeof value !== "string") return false;
  const x = evaluate(value, 0);          // the value may itself be an expression: -3, 7/2
  if (x === null) return false;
  const sides = normalise(equation).split("=");
  if (sides.length !== 2) return false;
  const a = evaluate(sides[0], x);
  const b = evaluate(sides[1], x);
  if (a === null || b === null) return false;
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}
