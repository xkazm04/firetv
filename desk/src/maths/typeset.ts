/**
 * Math Buddy's maths reader: a line of maths as the product carries it - plain text from the OCR, the marker
 * and the tutor (`3x^2 - 5x`, `x/4 + 3 = 8`, `sqrt(x+1)`, `log_2(x)`, `x²`, `½`), or TeX when a string has it
 * (`\frac{dy}{dx}`, `\int x\,e^{2x}\,dx`) - turned into a small tree that MathText.tsx sets in the two Lamplight
 * voices, the hand (the learner's working) and the print (a question as printed). Ported from the contest
 * winner's review page (`parseTex` / `nodeHTML`), with a plain-notation reader in front of it.
 *
 * Pure and dependency-free, so tools/maths-type-test.cjs runs it in node. Never throws from `parseMath`: TeX it
 * cannot read is read again as plain text, and plain text keeps every character it does not know as itself.
 */

export interface Scripts { sup?: MNode[]; sub?: MNode[] }
export type MNode = Scripts & (
  | { t: "num"; v: string }
  | { t: "var"; v: string }
  | { t: "ord"; v: string }
  | { t: "bin"; v: string; flag?: boolean }
  | { t: "rel"; v: string }
  | { t: "open" | "close"; v: string; big?: boolean }
  | { t: "punct"; v: string }
  | { t: "text"; v: string }
  | { t: "int" }
  | { t: "fn"; v: string }
  | { t: "sym"; v: string }
  | { t: "sp"; w: number }
  | { t: "frac"; small?: boolean; num: MNode[]; den: MNode[] }
  | { t: "grp"; body: MNode[] }
  | { t: "sqrt"; body: MNode[] }
);

// ------------------------------------------------------------------ shared vocabulary

const FN = new Set(["log", "ln", "lg", "sin", "cos", "tan", "sec", "csc", "cosec", "cot", "exp", "lim", "arcsin", "arccos", "arctan", "sinh", "cosh", "tanh", "max", "min"]);
const TEX_SYM: Record<string, string> = { pi: "π", theta: "θ", alpha: "α", beta: "β", gamma: "γ", lambda: "λ", mu: "μ", sigma: "σ", phi: "φ", omega: "ω", Delta: "Δ", infty: "∞", ldots: "…", dots: "…", cdots: "⋯", degree: "°", circ: "°" };
const TEX_REL: Record<string, string> = { le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", lt: "<", gt: ">", approx: "≈", to: "→", Rightarrow: "⇒", implies: "⇒", equiv: "≡", in: "∈" };
const TEX_BIN: Record<string, string> = { cdot: "·", times: "×", pm: "±", mp: "∓", div: "÷" };
const TEX_SP: Record<string, number> = { quad: 1, qquad: 1.7, ",": 0.16, ";": 0.28, ":": 0.22, " ": 0.25, "!": -0.08 };
const TEX_DELIM = new Set(["big", "Big", "bigg", "Bigg", "bigl", "bigr", "Bigl", "Bigr", "left", "right"]);
const TEX_TEXT = new Set(["text", "mathrm", "textrm", "mbox", "textit", "operatorname"]);
/** Two-letter runs that are English, not a product of two variables (`dx`, `xy` and `uv` stay maths). */
const WORD2 = new Set(["or", "of", "to", "in", "is", "if", "by", "an", "at", "as", "on", "be", "it", "so", "no", "up", "we", "do", "go", "me", "my", "am", "cm", "mm", "km", "kg", "ml", "Or", "Of", "To", "In", "Is", "If", "By", "An", "At", "As", "On", "It", "So", "No", "Up", "We", "Do"]);
const GREEK = "αβγδθλμσφωΔΣΩ";
const SUP: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-", "⁼": "=", "⁽": "(", "⁾": ")", "ⁿ": "n", "ˣ": "x", "ʸ": "y", "ⁱ": "i", "ᵏ": "k", "ᵃ": "a", "ᵇ": "b", "ᵗ": "t" };
const SUB: Record<string, string> = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-", "₌": "=", "₍": "(", "₎": ")", "ₓ": "x", "ₙ": "n", "ₐ": "a", "ᵢ": "i", "ₖ": "k" };
const VULGAR: Record<string, [string, string]> = { "½": ["1", "2"], "⅓": ["1", "3"], "⅔": ["2", "3"], "¼": ["1", "4"], "¾": ["3", "4"], "⅕": ["1", "5"], "⅖": ["2", "5"], "⅗": ["3", "5"], "⅘": ["4", "5"], "⅙": ["1", "6"], "⅚": ["5", "6"], "⅛": ["1", "8"], "⅜": ["3", "8"], "⅝": ["5", "8"], "⅞": ["7", "8"] };

/** What may follow a function name without a space and still be its argument: sinx, lnx - never "logs" or "cost". */
const GLUED = new Set(["x", "y"]);
/** Is a run of letters English (set as a word) or maths (set as variables)? */
export function isWord(run: string): boolean {
  if (run.length >= 3) return true;
  return WORD2.has(run);
}

// ------------------------------------------------------------------ TeX (the winner's reader, extended)

class TexError extends Error {}

export function parseTex(src: string): MNode[] {
  const s = src;
  let i = 0;
  const ws = () => { while (i < s.length && /\s/.test(s[i])) i++; };
  const raw = (): string => {
    ws(); if (s[i] !== "{") throw new TexError("raw");
    let d = 0; const st = ++i;
    for (; i < s.length; i++) { if (s[i] === "{") d++; else if (s[i] === "}") { if (!d) break; d--; } }
    if (i >= s.length) throw new TexError("raw");
    const v = s.slice(st, i); i++; return v;
  };
  const arg = (): MNode[] => { ws(); if (i >= s.length) throw new TexError("arg"); if (s[i] === "{") { i++; return seq(true); } return [atom()]; };
  function seq(inBrace: boolean): MNode[] {
    const out: MNode[] = [];
    for (;;) {
      ws();
      if (i >= s.length) { if (inBrace) throw new TexError("brace"); return out; }
      const c = s[i];
      if (c === "}") { if (!inBrace) throw new TexError("brace"); i++; return out; }
      if (c === "^" || c === "_") {
        i++; const a = arg(); let last = out[out.length - 1];
        if (!last || last.t === "sp") { last = { t: "ord", v: "" }; out.push(last); }
        if (c === "^") { if (last.sup) throw new TexError("sup"); last.sup = a; } else { if (last.sub) throw new TexError("sub"); last.sub = a; }
        continue;
      }
      // a run of three or more letters outside a command is a word the desk wrote, not a product of variables
      const m = /^[a-zA-Z]{3,}/.exec(s.slice(i));
      if (m && s[i - 1] !== "\\") { i += m[0].length; out.push(FN.has(m[0]) ? { t: "fn", v: m[0] } : { t: "text", v: m[0] }); continue; }
      out.push(atom());
    }
  }
  function atom(): MNode {
    ws(); const c = s[i];
    if (c === "{") { i++; return { t: "grp", body: seq(true) }; }
    if (c === "\\") {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)); if (!m) throw new TexError("cmd");
      i += m[0].length; const n = m[1];
      if (n === "frac" || n === "tfrac" || n === "dfrac") return { t: "frac", small: n === "tfrac", num: arg(), den: arg() };
      if (n === "sqrt") { ws(); if (s[i] === "[") { const e = s.indexOf("]", i); if (e < 0) throw new TexError("root"); i = e + 1; } return { t: "sqrt", body: arg() }; }
      if (TEX_TEXT.has(n)) return { t: "text", v: raw() };
      if (n === "int") return { t: "int" };
      if (FN.has(n)) return { t: "fn", v: n };
      if (n in TEX_SYM) return { t: "sym", v: TEX_SYM[n] };
      if (n in TEX_REL) return { t: "rel", v: TEX_REL[n] };
      if (n in TEX_BIN) return { t: "bin", v: TEX_BIN[n] };
      if (n in TEX_SP) return { t: "sp", w: TEX_SP[n] };
      if (n === "{" || n === "}") return { t: n === "{" ? "open" : "close", v: n };
      if (n === "%" || n === "$" || n === "#" || n === "&") return { t: "ord", v: n };
      if (TEX_DELIM.has(n)) { ws(); const d = s[i++]; if (!/[()[\]|.]/.test(d || "")) throw new TexError("delim"); return d === "." ? { t: "sp", w: 0 } : { t: /[([]/.test(d) ? "open" : "close", v: d, big: !n.startsWith("left") && !n.startsWith("right") }; }
      throw new TexError("unknown \\" + n);
    }
    i++;
    if (/[0-9.]/.test(c)) return { t: "num", v: c };
    if (/[a-zA-Z]/.test(c) || GREEK.includes(c)) return { t: "var", v: c };
    if (c === "+") return { t: "bin", v: "+" };
    if (c === "-" || c === "−") return { t: "bin", v: "−" };
    if (c === "×" || c === "·" || c === "÷" || c === "±") return { t: "bin", v: c };
    if (c === "*") return { t: "bin", v: "·" };
    if (c === "=" || c === "<" || c === ">" || c === "≤" || c === "≥" || c === "≠" || c === "≈") return { t: "rel", v: c };
    if (c === "(" || c === "[") return { t: "open", v: c };
    if (c === ")" || c === "]") return { t: "close", v: c };
    if (c === "," || c === ";" || c === ":") return { t: "punct", v: c };
    if (c === "π") return { t: "sym", v: "π" };
    if (c === "∞") return { t: "sym", v: "∞" };
    if (c === "∫") return { t: "int" };
    if (c === "/" || c === "|" || c === "'" || c === "!" || c === "°" || c === "%") return { t: "ord", v: c };
    throw new TexError("char " + c);
  }
  return seq(false);
}

// ------------------------------------------------------------------ plain notation

type Tok =
  | { k: "ws"; n: number }
  | { k: "num"; v: string }
  | { k: "let"; v: string }
  | { k: "ch"; v: string }
  | { k: "sup" | "sub"; v: string };

/** The small clean-ups the product's strings need before they are read: markdown bold, dollar signs, dashes. */
export function normalise(s: string): string {
  return s
    .replace(/\$/g, "")
    // `x**2` is a power; `**Solve**` is markdown bold
    .replace(/([0-9a-zA-Z)\]])\*\*(?=[-+(0-9a-zA-Z{])/g, "$1^")
    .replace(/\*\*/g, "")
    .replace(/[–—]/g, (m, at: number, all: string) => (/\s/.test(all[at - 1] ?? "") || /[\d(a-zA-Z]/.test(all[at + 1] ?? "") ? "−" : m))
    .replace(/<=|=</g, "≤").replace(/>=/g, "≥").replace(/=>/g, "⇒")
    .replace(/!=/g, "≠")
    .replace(/\bpi\b/g, "π")
    .replace(/(\d)pi\b/g, "$1π");
}

function tokens(s: string): Tok[] {
  const out: Tok[] = [];
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (/\s/.test(c)) { let j = i; while (j < s.length && /\s/.test(s[j])) j++; out.push({ k: "ws", n: j - i }); i = j; continue; }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] ?? ""))) { const m = /^[0-9]*\.?[0-9]+|^[0-9]+/.exec(s.slice(i))!; out.push({ k: "num", v: m[0] }); i += m[0].length; continue; }
    if (/[a-zA-Z]/.test(c)) { const m = /^[a-zA-Z]+/.exec(s.slice(i))!; out.push({ k: "let", v: m[0] }); i += m[0].length; continue; }
    if (c in SUP) { let v = ""; while (i < s.length && s[i] in SUP) v += SUP[s[i++]]; out.push({ k: "sup", v }); continue; }
    if (c in SUB) { let v = ""; while (i < s.length && s[i] in SUB) v += SUB[s[i++]]; out.push({ k: "sub", v }); continue; }
    // a surrogate pair stays one character
    const cp = s.codePointAt(i)!; const ch = String.fromCodePoint(cp);
    out.push({ k: "ch", v: ch }); i += ch.length;
  }
  return out;
}

/** A marker for whitespace while the line is read; it becomes a space, or nothing, once its neighbours are known. */
type Raw = MNode | { t: "ws"; n: number };

export function parsePlain(src: string): MNode[] {
  const T = tokens(normalise(src));
  let i = 0;
  const peek = (o = 0) => T[i + o];

  /** The script after ^ or _: a braced or bracketed group, or a signed number, or one letter. */
  function script(): MNode[] {
    const t = peek();
    if (!t) return [];
    if (t.k === "ch" && (t.v === "{" || t.v === "(")) {
      const close = t.v === "{" ? "}" : ")"; i++;
      const body = seq(close);
      if (peek()?.k === "ch" && (peek() as { v: string }).v === close) i++;
      return tidy(body);
    }
    const out: MNode[] = [];
    if (t.k === "ch" && (t.v === "-" || t.v === "−" || t.v === "+")) { out.push({ t: "bin", v: t.v === "+" ? "+" : "−" }); i++; }
    const u = peek();
    if (u?.k === "num") { out.push({ t: "num", v: u.v }); i++; }
    else if (u?.k === "let") {
      // one letter, the rest of the run stays on the line: e^2x is e² x, x^n is xⁿ
      out.push({ t: "var", v: u.v[0] });
      if (u.v.length > 1) T[i] = { k: "let", v: u.v.slice(1) }; else i++;
    } else if (u?.k === "ch" && (u.v === "π" || GREEK.includes(u.v))) { out.push(u.v === "π" ? { t: "sym", v: "π" } : { t: "var", v: u.v }); i++; }
    return out;
  }
  const attach = (out: Raw[], key: "sup" | "sub", body: MNode[]) => {
    let last = out[out.length - 1];
    if (!last || last.t === "ws" || last.t === "sp") { last = { t: "ord", v: "" }; out.push(last); }
    const n = last as MNode;
    if (n[key]) n[key] = [...n[key]!, ...body]; else n[key] = body;
  };

  function letters(out: Raw[], run: string) {
    // a function name, alone or glued to its argument: sin, sinx, log2
    const fn = [...FN].filter((f) => run.startsWith(f)).sort((a, b) => b.length - a.length)[0];
    if (fn && (run.length === fn.length || GLUED.has(run.slice(fn.length)))) {
      out.push({ t: "fn", v: fn });
      if (run.length > fn.length) out.push({ t: "var", v: run.slice(fn.length) });
      return;
    }
    if (run === "sqrt") {
      const n = peek();
      if (n?.k === "ch" && n.v === "(") { i++; const body = seq(")"); if (peek()?.k === "ch") i++; out.push({ t: "sqrt", body: tidy(body) }); }
      else out.push({ t: "sqrt", body: tidy(one()) });
      return;
    }
    if (run === "int") { out.push({ t: "int" }); return; }
    // "A rectangle has...", "I got...": the article or the pronoun before a word is English too
    if ((run === "A" || run === "a" || run === "I") && peek()?.k === "ws" && peek(1)?.k === "let" && isWord((peek(1) as { v: string }).v)) { out.push({ t: "text", v: run }); return; }
    if (run === "infinity" || run === "inf") { out.push({ t: "sym", v: "∞" }); return; }
    if (isWord(run)) { out.push({ t: "text", v: run }); return; }
    for (const ch of run) out.push({ t: "var", v: ch });
  }
  /** One atom for √ without brackets: a number or a letter, with its power. */
  function one(): Raw[] {
    const out: Raw[] = [];
    const t = peek(); if (!t) return out;
    if (t.k === "num") { out.push({ t: "num", v: t.v }); i++; }
    else if (t.k === "let") { out.push({ t: "var", v: t.v[0] }); if (t.v.length > 1) T[i] = { k: "let", v: t.v.slice(1) }; else i++; }
    else if (t.k === "ch" && t.v === "(") { i++; const body = seq(")"); if (peek()?.k === "ch") i++; out.push({ t: "open", v: "(" }, ...body, { t: "close", v: ")" }); }
    else return out;
    while (peek()?.k === "sup" || (peek()?.k === "ch" && (peek() as { v: string }).v === "^")) {
      const s = peek()!; i++;
      attach(out, "sup", s.k === "sup" ? tidy(parsePlain(s.v)) : script());
    }
    return out;
  }

  function seq(close?: string): Raw[] {
    const out: Raw[] = [];
    const opener = close === ")" ? "(" : close === "}" ? "{" : close === "]" ? "[" : "";
    let depth = 0;
    while (i < T.length) {
      const t = T[i];
      if (close && t.k === "ch" && t.v === close) { if (!depth) return out; depth--; }
      else if (opener && t.k === "ch" && t.v === opener) depth++;
      i++;
      if (t.k === "ws") { out.push({ t: "ws", n: t.n }); continue; }
      if (t.k === "num") { out.push({ t: "num", v: t.v }); continue; }
      if (t.k === "let") { letters(out, t.v); continue; }
      if (t.k === "sup" || t.k === "sub") { attach(out, t.k, tidy(parsePlain(t.v))); continue; }
      const c = t.v;
      if (c === "^") { attach(out, "sup", script()); continue; }
      if (c === "_") { attach(out, "sub", script()); continue; }
      if (c in VULGAR) { const [a, b] = VULGAR[c]; out.push({ t: "frac", small: true, num: [{ t: "num", v: a }], den: [{ t: "num", v: b }] }); continue; }
      if (c === "+") { out.push({ t: "bin", v: "+" }); continue; }
      if (c === "-" || c === "−") { out.push({ t: "bin", v: "−" }); continue; }
      if (c === "±" || c === "∓" || c === "÷" || c === "×" || c === "·" || c === "⋅") { out.push({ t: "bin", v: c === "⋅" ? "·" : c }); continue; }
      if (c === "*") { out.push({ t: "bin", v: "*" }); continue; }
      if ("=<>≤≥≠≈⇒→≡".includes(c)) { out.push({ t: "rel", v: c }); continue; }
      if (c === "(" || c === "[" || c === "{") { out.push({ t: "open", v: c }); continue; }
      if (c === ")" || c === "]" || c === "}") { out.push({ t: "close", v: c }); continue; }
      if (c === "," || c === ";" || c === ":") { out.push({ t: "punct", v: c }); continue; }
      if (c === "." ) { out.push({ t: "punct", v: c }); continue; }
      if (c === "√") {
        const n = peek();
        if (n?.k === "ch" && n.v === "(") { i++; const body = seq(")"); if (peek()?.k === "ch") i++; out.push({ t: "sqrt", body: tidy(body) }); }
        else out.push({ t: "sqrt", body: tidy(one()) });
        continue;
      }
      if (c === "∫") { out.push({ t: "int" }); continue; }
      if (c === "π" || c === "∞") { out.push({ t: "sym", v: c }); continue; }
      if (GREEK.includes(c)) { out.push({ t: "var", v: c }); continue; }
      out.push({ t: "ord", v: c }); // never dropped: `/`, `|`, `'`, `!`, `%`, `°` and anything unknown
    }
    return out;
  }

  const body = seq();
  // a `)` with no `(` before it was read as a stray close; any leftover tokens are kept as they are
  while (i < T.length) { const t = T[i++]; body.push(t.k === "ws" ? { t: "ws", n: t.n } : { t: "ord", v: "v" in t ? t.v : "" }); }
  return tidy(body);
}

// ------------------------------------------------------------------ after reading: fractions, `*`, spaces

const isOperand = (n: Raw | undefined): boolean => !!n && (n.t === "num" || n.t === "var" || n.t === "sym" || n.t === "frac" || n.t === "sqrt" || (n.t === "ord" && n.v === "" && !!n.sup));

/** The nodes of a bracket that ends at `end` (a close), or -1. */
function openOf(list: Raw[], end: number): number {
  let d = 0;
  for (let k = end; k >= 0; k--) { const n = list[k]; if (n.t === "close") d++; else if (n.t === "open") { d--; if (!d) return k; } }
  return -1;
}
function closeOf(list: Raw[], start: number): number {
  let d = 0;
  for (let k = start; k < list.length; k++) { const n = list[k]; if (n.t === "open") d++; else if (n.t === "close") { d--; if (!d) return k; } }
  return -1;
}
/** A bracket around a numerator or denominator is only grouping; its power (if any) keeps it. */
const unwrap = (part: Raw[]): Raw[] => (part.length >= 2 && part[0].t === "open" && part[part.length - 1].t === "close" && !(part[part.length - 1] as MNode).sup && closeOf(part, 0) === part.length - 1 ? part.slice(1, -1) : part);

/**
 * `a/b` becomes a stacked fraction where it is clearly one: no space around the slash, an operand on each side
 * (a number, letters, a bracket), no English word in either. The numerator is everything glued to the slash on
 * its left (`7π`, `dy`, `(x + 1)`); the denominator a number, a run of letters or one bracket (`x/4 + 3`, `dy/dx`,
 * `(a+b)/(c+d)`). Anything else keeps its slash.
 */
function fractions(list: Raw[]): Raw[] {
  const out = [...list];
  for (let k = 0; k < out.length; k++) {
    const n = out[k];
    if (n.t !== "ord" || n.v !== "/" || n.sup || n.sub) continue;
    // numerator: back to a space, a sign, a relation or an open bracket
    let a = k - 1;
    if (a < 0) continue;
    if (out[a].t === "close") { a = openOf(out, a); if (a < 0) continue; }
    else if (!isOperand(out[a])) continue;
    while (a > 0 && (isOperand(out[a - 1]) || (out[a - 1].t === "close" && openOf(out, a - 1) >= 0))) a = out[a - 1].t === "close" ? openOf(out, a - 1) : a - 1;
    // denominator: one number, or a run of letters, or one bracket, with its power
    let b = k + 1;
    const first = out[b];
    if (!first) continue;
    if (first.t === "open") { b = closeOf(out, b); if (b < 0) continue; }
    else if (first.t === "num" || first.t === "sym" || first.t === "sqrt") { /* one */ }
    else if (first.t === "var") { while (out[b + 1]?.t === "var" && !(out[b] as MNode).sup) b++; }
    else continue;
    const num = out.slice(a, k), den = out.slice(k + 1, b + 1);
    // a word anywhere, or a space, relation or comma outside a bracket, and it is not a fraction after all
    const loose = (part: Raw[]) => { let d = 0; return part.some((x) => { if (x.t === "open") d++; if (x.t === "close") d--; return x.t === "text" || (!d && (x.t === "ws" || x.t === "rel" || x.t === "punct")); }); };
    if (loose(num) || loose(den)) continue;
    const frac: MNode = { t: "frac", num: tidy(unwrap(num)), den: tidy(unwrap(den)) };
    out.splice(a, b - a + 1, frac);
    k = a;
  }
  return out;
}

/** `*` between two numbers is ×, anywhere else the dot. */
function stars(list: Raw[]): Raw[] {
  return list.map((n, k) => {
    if (n.t !== "bin" || n.v !== "*") return n;
    const prev = list.slice(0, k).reverse().find((x) => x.t !== "ws"), next = list.slice(k + 1).find((x) => x.t !== "ws");
    return { ...n, v: prev?.t === "num" && next?.t === "num" ? "×" : "·" };
  });
}

/**
 * Whitespace, now that its neighbours are known: nothing beside an operator or inside a bracket (their own
 * margins space them), a word space beside a word, a wide gap where the writer left two or more spaces.
 */
function spaces(list: Raw[]): MNode[] {
  const out: MNode[] = [];
  for (let k = 0; k < list.length; k++) {
    const n = list[k];
    if (n.t !== "ws") { out.push(n); continue; }
    const a = out[out.length - 1], b = list.slice(k + 1).find((x) => x.t !== "ws") as MNode | undefined;
    if (!a || !b) continue;
    if (a.t === "bin" || a.t === "rel" || b.t === "bin" || b.t === "rel" || a.t === "open" || b.t === "close" || b.t === "punct") continue;
    const w = n.n >= 2 ? 1 : a.t === "text" || b.t === "text" ? 0.28 : a.t === "punct" ? 0.32 : a.t === "fn" ? 0 : 0.2;
    if (w) out.push({ t: "sp", w });
  }
  return out;
}

function tidy(list: Raw[]): MNode[] { return spaces(fractions(stars(list))); }

// ------------------------------------------------------------------ the one door

/** Does this string carry TeX? A command, or braces used as a script group. */
export const looksTex = (s: string) => /\\[a-zA-Z]{2,}|\\[,;:!{} ]|[\^_]\{/.test(s) && /\\/.test(s);

/**
 * Read one line of maths. TeX when the line has it, else plain notation; TeX that will not read is read again
 * as plain text with its commands' names kept. Never throws; an empty line is an empty list.
 */
export function parseMath(src: string): MNode[] {
  const s = String(src ?? "");
  if (!s.trim()) return [];
  if (looksTex(s)) {
    try { return parseTex(s.replace(/\$/g, "")); } catch { /* read it as plain text below */ }
  }
  try { return parsePlain(s); } catch { return [{ t: "text", v: s }]; }
}

/** The line as characters again (what a screen reader hears, and what the tests compare). */
export function flatten(nodes: MNode[]): string {
  let out = "";
  for (const n of nodes) {
    switch (n.t) {
      case "num": case "var": case "ord": case "bin": case "rel": case "open": case "close": case "punct": case "text": case "fn": case "sym": out += n.v; break;
      case "int": out += "∫"; break;
      case "sp": out += " "; break;
      case "frac": out += `(${flatten(n.num)})/(${flatten(n.den)})`; break;
      case "grp": out += flatten(n.body); break;
      case "sqrt": out += `√(${flatten(n.body)})`; break;
    }
    if (n.sub) out += `_(${flatten(n.sub)})`;
    if (n.sup) out += `^(${flatten(n.sup)})`;
  }
  return out;
}

/** Every node, depth first - for the tests and for "does this line hold a fraction". */
export function walk(nodes: MNode[], fn: (n: MNode) => void): void {
  for (const n of nodes) {
    fn(n);
    if (n.t === "frac") { walk(n.num, fn); walk(n.den, fn); }
    if (n.t === "grp" || n.t === "sqrt") walk(n.body, fn);
    if (n.sup) walk(n.sup, fn);
    if (n.sub) walk(n.sub, fn);
  }
}
/** A line that holds a stacked fraction or an integral is tall: it takes three squares of the paper, not two. */
export function isTall(nodes: MNode[]): boolean {
  let tall = false;
  walk(nodes, (n) => { if (n.t === "frac" || n.t === "int") tall = true; });
  return tall;
}

// ------------------------------------------------------------------ the desk's pen inside a line

export type ErrorKind = "sign" | "missing" | "extra";
/** Where the pen goes in one line: `span` is the part of the line it is about, `kind` what is wrong with it. */
export interface LineMarkSpec { kind: ErrorKind | "line"; span?: string }
export type MarkedLine =
  | { kind: "line"; nodes: MNode[] }
  | { kind: ErrorKind; pre: MNode[]; mid: MNode[]; post: MNode[]; trail: MNode[] };

/**
 * Split a line around the span the mark is about and read each part, the winner's way: the offending sign is
 * flagged inside the span (`sign`), the span is struck (`extra`), or a gap opens after it (`missing`, with a
 * comma that belongs to the span kept before the gap, in `trail`). A span the line does not hold, or a mark
 * with no span, marks the whole line - the pen never guesses a place the data does not name.
 */
export function markLine(line: string, mark: LineMarkSpec): MarkedLine {
  const whole = (): MarkedLine => ({ kind: "line", nodes: parseMath(line) });
  if (mark.kind === "line" || !mark.span) return whole();
  const tex = looksTex(line);
  // the span is found with any run of whitespace, so the line keeps its own spacing
  const words = mark.span.trim().split(/\s+/).filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const found = words.length ? new RegExp(words.join("\\s+")).exec(line) : null;
  if (!found) return whole();
  const at = found.index, end = at + found[0].length;
  const read = (x: string) => (tex ? parseTexOr(x) : parsePlain(x));
  const pre = read(line.slice(0, at)), mid = read(found[0]);
  let post = read(line.slice(end));
  const trail: MNode[] = [];
  if (mark.kind === "sign") {
    const f = firstSign(mid);
    if (f) f.flag = true;
  }
  if (mark.kind === "missing" && post[0]?.t === "punct") trail.push(post.shift()!);
  // the space between the parts is kept as the whole line would have set it: "x = −7" then "or x = 5"
  const gap = (ws: string, a: MNode | undefined, b: MNode | undefined): MNode[] =>
    !ws || !a || !b || [a.t, b.t].some((t) => t === "bin" || t === "rel") || a.t === "open" || b.t === "close" || b.t === "punct" ? [] : [{ t: "sp", w: ws.length >= 2 ? 1 : 0.28 }];
  const before = /\s*$/.exec(line.slice(0, at))![0], after = /^\s*/.exec(line.slice(end))![0];
  const pre2 = [...pre, ...gap(before, pre[pre.length - 1], mid[0])];
  post = [...gap(after, trail[0] ?? mid[mid.length - 1], post[0]), ...post];
  return { kind: mark.kind, pre: pre2, mid, post, trail };
}
function parseTexOr(x: string): MNode[] { try { return parseTex(x); } catch { return parsePlain(x); } }
function firstSign(nodes: MNode[]): (MNode & { t: "bin" }) | null {
  for (const n of nodes) if (n.t === "bin" && (n.v === "+" || n.v === "−" || n.v === "±")) return n;
  return null;
}
