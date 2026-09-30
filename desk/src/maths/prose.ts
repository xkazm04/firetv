/**
 * A sentence from the desk that carries maths - a hint, a caption, the desk's reply - set for the television:
 * powers as printed (x², xⁿ⁺¹), real minus signs, "x = −7" never split across a line, and any TeX the tutor wrote
 * ($\frac12$, \sqrt{x}, \theta) turned into what it says, so no backslash command ever reaches the screen.
 *
 * It only re-spells characters: a digit is never added, dropped or moved (tools/maths-tv-test.cjs asserts it). A
 * power is raised only when every character in it has a printed superscript; otherwise it stays on the line,
 * bracketed (x^(−1/2)) - never a partial superscript that reads as different maths. The printed forms are the
 * ones the maths reader (typeset.ts, its SUP and SUB tables) reads back, so the reader sees the same maths.
 * Named bars (\lvert, \Vert, \langle, \mid, \Leftarrow), \abs and \norm, and a cases brace are the same
 * characters that reader draws.
 *
 * Pure and dependency-free (no next/font), so node tests it; MathsTV.tsx imports it.
 */

/** Characters with a printed superscript form - the ones typeset.ts reads back as a power. */
const SUP: Readonly<Record<string, string>> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "−": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", n: "ⁿ", x: "ˣ", y: "ʸ", i: "ⁱ", k: "ᵏ", a: "ᵃ", b: "ᵇ", t: "ᵗ",
};
/** Characters with a printed subscript form - the ones typeset.ts reads back as a subscript. */
const SUB: Readonly<Record<string, string>> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "+": "₊", "-": "₋", "−": "₋", "=": "₌", "(": "₍", ")": "₎", x: "ₓ", n: "ₙ", a: "ₐ", i: "ᵢ", k: "ₖ",
};

/** TeX commands that are one character. */
const TEX_CHAR: Readonly<Record<string, string>> = {
  pi: "π", infty: "∞", cdot: "·", times: "×", div: "÷", pm: "±", mp: "∓",
  le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", lt: "<", gt: ">", approx: "≈", equiv: "≡", sim: "∼", propto: "∝",
  to: "→", rightarrow: "→", longrightarrow: "→", leftarrow: "←", Leftarrow: "⇐", Rightarrow: "⇒", implies: "⇒", Leftrightarrow: "⇔", iff: "⇔", mapsto: "↦",
  lvert: "|", rvert: "|", vert: "|", lVert: "‖", rVert: "‖", Vert: "‖", langle: "⟨", rangle: "⟩", mid: "|",
  in: "∈", notin: "∉", subset: "⊂", subseteq: "⊆", cup: "∪", cap: "∩", emptyset: "∅",
  ldots: "…", dots: "…", cdots: "⋯", degree: "°", circ: "°", prime: "′", partial: "∂", nabla: "∇", ell: "ℓ",
  int: "∫", sum: "∑", prod: "∏",
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", vartheta: "θ",
  kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", rho: "ρ", sigma: "σ", tau: "τ", phi: "φ", varphi: "φ", chi: "χ", psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Sigma: "Σ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
};
/** Function names, set as their name. */
const TEX_FN = new Set(["sin", "cos", "tan", "sec", "csc", "cot", "sinh", "cosh", "tanh", "arcsin", "arccos", "arctan", "log", "ln", "lg", "exp", "lim", "max", "min"]);
/** Commands whose argument is text: \text{area} is "area". */
const TEX_TEXT = new Set(["text", "mathrm", "textrm", "mbox", "textit", "textbf", "mathbf", "mathit", "operatorname"]);
/** Commands that only say how to set what follows, or size the next delimiter: dropped, the delimiter stays. */
const TEX_QUIET = new Set(["left", "right", "big", "Big", "bigg", "Bigg", "bigl", "bigr", "Bigl", "Bigr", "displaystyle", "textstyle", "limits", "nolimits"]);
/** Spacing commands: a space (\! is a negative space, so nothing). */
const TEX_SPACE: Readonly<Record<string, string>> = { ",": " ", ";": " ", ":": " ", " ": " ", quad: " ", qquad: " ", "\\": " ", "!": "" };
/** Literal braces from \{ and \}, kept apart from grouping braces until the grouping braces are gone. */
const LB = "", RB = "";

/** Is a part one term (a number, a word, letters, one power, or already one bracket) - so it needs no bracket round it? */
function oneTerm(x: string): boolean {
  const s = x.trim();
  if (/^[\p{L}\p{N}.′]+(\^(\{[^{}]*\}|[\p{L}\p{N}]+))?$/u.test(s)) return true;
  if (/^\(.*\)$/.test(s)) { let d = 0; for (let k = 0; k < s.length; k++) { if (s[k] === "(") d++; else if (s[k] === ")") { d--; if (!d && k < s.length - 1) return false; } } return true; }
  return false;
}
const bracket = (x: string) => (oneTerm(x) ? x.trim() : `(${x.trim()})`);

/** TeX to the characters it stands for. Grouping braces are kept (a power's braces are read after); commands never survive. */
function texToText(src: string): string {
  let i = 0;
  /** One argument: a braced group (its content, converted), one command, or one character. */
  const arg = (): string => {
    while (src[i] === " ") i++;
    if (i >= src.length) return "";
    if (src[i] === "{") { i++; return group(); }
    if (src[i] === "\\") return command();
    const ch = String.fromCodePoint(src.codePointAt(i)!); i += ch.length; return ch;
  };
  /** The rest of a braced group, after its `{`, converted - without the braces. */
  const group = (): string => {
    let out = "";
    while (i < src.length && src[i] !== "}") out += next();
    i++; // the closing brace (or the end)
    return out;
  };
  const command = (): string => {
    i++; // the backslash
    const m = /^([a-zA-Z]+|[\s\S])/.exec(src.slice(i));
    if (!m) return "";
    const n = m[1]; i += n.length;
    if (n === "frac" || n === "tfrac" || n === "dfrac") {
      const a = arg(), b = arg();
      // d/dx x³, never d/dxx³: a fraction glued to a letter after it gets a space
      const cmd = /^\\([a-zA-Z]+)/.exec(src.slice(i))?.[1];
      const glued = /^[a-zA-Z]/.test(src[i] ?? "") || (!!cmd && !TEX_QUIET.has(cmd) && !(cmd in TEX_SPACE));
      return `${bracket(a)}/${bracket(b)}${glued ? " " : ""}`;
    }
    if (n === "sqrt") {
      let idx = "";
      if (src[i] === "[") { const e = src.indexOf("]", i); if (e > i) { idx = texToText(src.slice(i + 1, e)); i = e + 1; } }
      const body = arg();
      const raised = idx && [...idx].every((c) => c in SUP) ? [...idx].map((c) => SUP[c]).join("") : idx ? `(${idx})` : "";
      return `${raised}√${bracket(body)}`;
    }
    if (TEX_TEXT.has(n)) return arg();
    if (n in TEX_SPACE) return TEX_SPACE[n];
    if (n === "{") return LB;
    if (n === "}") return RB;
    if (TEX_QUIET.has(n)) {
      while (src[i] === " ") i++;
      // \left. is an invisible delimiter; \left\{ is a literal brace
      if (src[i] === ".") i++;
      return "";
    }
    if (n in TEX_CHAR) return TEX_CHAR[n];
    if (TEX_FN.has(n)) return n;
    if (n === "%" || n === "$" || n === "#" || n === "&" || n === "_") return n;
    if (n === "|") return "‖";
    // \abs{x} and \norm{v}: the argument between its bars, as the reader draws them
    if (n === "abs" || n === "norm") { const b = n === "abs" ? "|" : "‖"; return `${b}${arg()}${b}`; }
    if (n === "begin") {
      let env = "";
      if (src[i] === "{") { i++; env = group(); }
      if (env.replace(/\*$/, "") !== "cases") return " ";
      // one line, an open brace, the rows side by side: & and \\ are gaps (typeset.ts)
      let body = "";
      while (i < src.length && !src.startsWith("\\end", i)) {
        if (src[i] === "&") { i++; body += " "; continue; }
        body += next();
      }
      return LB + body;
    }
    if (n === "end") { if (src[i] === "{") { i++; group(); } return ""; }
    // any other command keeps its name, as a word
    return /^[a-zA-Z]/.test(n) ? (src[i] === "{" ? `${n} ` : n) : "";
  };
  function next(): string {
    const c = src[i];
    if (c === "\\") return command();
    if (c === "{") { i++; return `{${group()}}`; }
    const ch = String.fromCodePoint(src.codePointAt(i)!); i += ch.length;
    return ch;
  }
  let out = "";
  while (i < src.length) out += next();
  return out;
}

/** A power or a subscript: raised (lowered) whole when every character has a printed form, else kept bracketed on the line. */
function script(body: string, map: Readonly<Record<string, string>>, mark: "^" | "_"): string {
  const tight = body.replace(/\s+/g, "");
  if (tight && [...tight].every((c) => c in map)) return [...tight].map((c) => map[c]).join("");
  // inside a power a hyphen is always a minus
  return `${mark}(${body.replace(/-/g, "−")})`;
}

const SCRIPT_RE = /([\^_])(?:\{([^{}]*)\}|\(([^()]*)\)|([-−+]?\d+(?:\.\d+)?)|([-−+]?[a-zA-Zα-ω]))/g;

export function prose(t: string): string {
  const nb = " ";
  let s = String(t ?? "")
    // `x**2` is a power; `**Solve**` is markdown bold
    .replace(/([0-9a-zA-Z)\]])\*\*(?=[-+(0-9a-zA-Z{])/g, "$1^").replace(/\*\*/g, "")
    // maths delimiters go; an escaped dollar stays for TeX to read
    .replace(/(^|[^\\])\$+/g, "$1").replace(/(^|[^\\])\$+/g, "$1");
  const tex = /\\([a-zA-Z]+|[{},;:! |\\$%#&_])/.test(s);
  if (tex) s = texToText(s);
  // powers and subscripts, innermost first (x^{y^{2}}); a script with no printed form keeps a bracket and its caret
  for (let pass = 0; pass < 4; pass++) {
    const before = s;
    s = s.replace(SCRIPT_RE, (all, mark: "^" | "_", brace?: string, paren?: string, num?: string, letter?: string, at?: number) => {
      const map = mark === "^" ? SUP : SUB;
      // a subscript belongs to what stands right before it - an underscore after a space is not maths
      if (mark === "_" && (!at || /\s/.test(s[at - 1] ?? ""))) return all;
      if (brace !== undefined) return script(brace, map, mark);
      if (paren !== undefined) return script(paren, map, mark);
      const one = num ?? letter ?? "";
      // an unbraced power the screen cannot raise (x^z, x^2.5) keeps its caret, a bracket only round a number
      if (![...one].every((c) => c in map)) return num !== undefined ? script(one, map, mark) : all;
      return [...one].map((c) => map[c]).join("");
    });
    if (s === before) break;
  }
  if (tex) s = s.replace(/[{}]/g, "").replace(/[ \t]{2,}/g, " ").trim();
  s = s.replace(new RegExp(LB, "g"), "{").replace(new RegExp(RB, "g"), "}");
  return s
    .replace(/(\S) - (?=\S)/g, `$1${nb}−${nb}`).replace(/(^|[\s(=])-(?=[\dx(])/g, "$1−")
    .replace(/(\S) ([=+−<>≤≥×÷·→]) (?=\S)/g, `$1${nb}$2${nb}`);
}
