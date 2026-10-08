/**
 * Calculus word problems and multi-part questions (v2 M3a), drawn by CODE from a seed with no model call.
 *
 * A multi-part question is not a new kind of item: it travels as consecutive practice items, one per part, each with
 * its own number, its own spec of one of the nine shapes (rules/calc) and its own printed line, and every part carries
 * the same `stem` and its `part` letter. So marking, typed answers, the snap read, attempts, the leak check, the pen and
 * the chain checker work per part exactly as they do for a single item: `checkAnswer(part.spec, answer)` decides every
 * mark. Nothing here adds a shape, a truth or a tolerance.
 *
 * A template writes the stem and the part lines itself, in plain sentences with its own units. Every number it prints
 * is one it drew from the seed or computed from what it drew (`drawn`), or sits inside the function the stem prints,
 * which is the parts' own `f` (`fn`); no number is written as a word. A drawn problem is kept only when it is fair: each
 * part well formed, and no part's answer in the stem, in its own line or in another part's line (leaksCalc). Otherwise
 * the template draws again.
 *
 * The three templates (one per topic):
 *   - related rates (calc1-related-rates, derivative-at), after the corpus's c12-q1: air pumped into a sphere at a
 *     steady rate; (a) how fast the radius grows when r is given, (b) how fast the surface area grows then. The spec's
 *     function is the radius (or the area) as a function of the time since that moment, so its derivative at 0 is the rate;
 *   - optimisation (calc1-optimisation, extremum), after c15-q1: a rectangle of a given perimeter; (a) its largest area,
 *     (b) its shortest diagonal, each an extremum of a function of one side on [0, half the perimeter];
 *   - the maximum and the minimum (calc1-extrema, extremum), after c13-q1 with no story: a cubic on an interval chosen so
 *     that both are inside it (an extremum at an endpoint is not well formed).
 *
 * Pure: imports only rules/calc.
 */
import { leaksCalc, wellFormed, type CalcSpec } from "./calc";

export type PartLabel = "a" | "b" | "c";
export const PART_LABELS: readonly PartLabel[] = ["a", "b", "c"];

export interface WordPart { part: PartLabel; line: string; spec: CalcSpec }
export interface WordProblem {
  /** The template that drew it. */
  template: string;
  topic: string;
  /** The situation, in plain sentences, printed once above the parts. */
  stem: string;
  parts: WordPart[];
  /** Every number the stem and the part lines print outside `fn`: drawn from the seed or computed from what was drawn. */
  drawn: number[];
  /** The function the stem prints, verbatim, when it prints one: it is the parts' own `f`. */
  fn?: string;
}

/** How many draws a template makes from one seed before it gives up on it (the sweep finds none that does). */
const MAX_TRIES = 64;

/** mulberry32: the same numbers for the same seed on every machine (as rules/school's generators). */
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
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** n/d in lowest terms as the learner writes it: '40', '50/3', '-7/2'. */
const ratio = (n: number, d: number): string => {
  const g = gcd(n, d), p = n / g, q = d / g;
  return q === 1 ? String(p) : `${p}/${q}`;
};
const range = (lo: number, hi: number, step = 1): number[] => Array.from({ length: Math.floor((hi - lo) / step) + 1 }, (_, k) => lo + k * step);

/** A seed every template takes: a whole number 0 .. 2^32 - 1. */
const isSeed = (seed: unknown): seed is number => typeof seed === "number" && Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff;

/** A drawn problem and its worked answers (one string per part, exact): the answers stay here, never on an item. */
interface Drawn { problem: WordProblem; worked: string[] }

export interface WordTemplate {
  id: string;
  topic: string;
  /** One draw from the random stream, fair or not: `draw` keeps the first fair one. */
  once(rnd: () => number): Drawn | null;
  salt: number;
}

// ------------------------------------------------------------------ the templates

/** Rates of air into the balloon, in cubic centimetres per second, and the radii asked about, in centimetres. */
const RATES = range(10, 200, 10);
const RADII = range(2, 12);

const relatedRates: WordTemplate = {
  id: "sphere-rates",
  topic: "calc1-related-rates",
  salt: 0x3a0c1201,
  once(rnd) {
    const q = RATES[Math.floor(rnd() * RATES.length)], r0 = RADII[Math.floor(rnd() * RADII.length)];
    // V = 4/3 pi r^3 grows by q a second, so t seconds after the moment r = r0: r(t) = (r0^3 + 3qt/(4pi))^(1/3)
    const inside = `${r0 ** 3} + ${3 * q}x/(4pi)`;
    const problem: WordProblem = {
      template: "sphere-rates",
      topic: "calc1-related-rates",
      stem: `Air is pumped into a spherical balloon at a steady ${q} cubic centimetres per second. Let r be the radius of the balloon in centimetres.`,
      parts: [
        { part: "a", line: `How fast is r increasing at the moment when r = ${r0}? Give the rate in centimetres per second.`, spec: { shape: "derivative-at", f: `(${inside})^(1/3)`, at: 0 } },
        { part: "b", line: "How fast is the surface area of the balloon increasing at that same moment? Give the rate in square centimetres per second.", spec: { shape: "derivative-at", f: `4pi*(${inside})^(2/3)`, at: 0 } },
      ],
      drawn: [q, r0],
    };
    // dr/dt = q / (4 pi r0^2); dS/dt = 8 pi r0 dr/dt = 2q / r0
    const a = ratio(q, 4 * r0 * r0), [an, ad] = a.split("/");
    return { problem, worked: [ad ? `${an}/(${ad}pi)` : `${an}/pi`, ratio(2 * q, r0)] };
  },
};

/** Perimeters in metres: multiples of four, so half a side is a whole number. */
const PERIMETERS = range(12, 120, 4);

const rectangle: WordTemplate = {
  id: "rectangle-perimeter",
  topic: "calc1-optimisation",
  salt: 0x3a0c1802,
  once(rnd) {
    const P = PERIMETERS[Math.floor(rnd() * PERIMETERS.length)], h = P / 2, k = P / 4;
    const problem: WordProblem = {
      template: "rectangle-perimeter",
      topic: "calc1-optimisation",
      stem: `A rectangle has a perimeter of ${P} metres. Let x be the length of a side of the rectangle in metres.`,
      parts: [
        { part: "a", line: "What is the largest area the rectangle can have? Give it in square metres.", spec: { shape: "extremum", f: `x(${h} - x)`, on: [0, h], kind: "max" } },
        { part: "b", line: "What is the shortest length its diagonal can have? Give it in metres.", spec: { shape: "extremum", f: `sqrt(x^2 + (${h} - x)^2)`, on: [0, h], kind: "min" } },
      ],
      drawn: [P],
    };
    // the square of side P/4: area k^2, diagonal k sqrt(2)
    return { problem, worked: [String(k * k), `${k}sqrt(2)`] };
  },
};

/** A cubic's two critical points, at least four apart (two apart, an end ties with the far extremum), within -6..6. */
const ROOT_PAIRS: [number, number][] = range(-6, 6).flatMap((r1) => [4, 6].map((g): [number, number] => [r1, r1 + g])).filter(([, r2]) => r2 <= 6);
const SHIFTS = range(-9, 9);

/** A polynomial's text from its coefficients, highest power first: '-x^3 + 3x^2 + 9x - 5'. */
function poly(coeffs: number[]): string {
  const deg = coeffs.length - 1;
  let out = "";
  coeffs.forEach((c, k) => {
    const p = deg - k;
    if (c === 0) return;
    const size = Math.abs(c), x = p === 0 ? "" : p === 1 ? "x" : `x^${p}`;
    const body = p > 0 && size === 1 ? x : `${size}${x}`;
    out += out ? ` ${c < 0 ? "-" : "+"} ${body}` : `${c < 0 ? "-" : ""}${body}`;
  });
  return out || "0";
}
const at = (coeffs: number[], x: number) => coeffs.reduce((v, c) => v * x + c, 0);

const maxMin: WordTemplate = {
  id: "cubic-max-min",
  topic: "calc1-extrema",
  salt: 0x3a0c1503,
  once(rnd) {
    const [r1, r2] = ROOT_PAIRS[Math.floor(rnd() * ROOT_PAIRS.length)];
    const sign = rnd() < 0.5 ? 1 : -1, d = SHIFTS[Math.floor(rnd() * SHIFTS.length)];
    // f' = 3 sign (x - r1)(x - r2): f = sign (x^3 - 3(r1 + r2)/2 x^2 + 3 r1 r2 x) + d, whole coefficients as r1 + r2 is even
    const coeffs = [sign, (-sign * 3 * (r1 + r2)) / 2, sign * 3 * r1 * r2, d];
    const hi = Math.max(at(coeffs, r1), at(coeffs, r2)), lo = Math.min(at(coeffs, r1), at(coeffs, r2));
    // ends where both extrema stay inside and strictly the largest and smallest: a < r1 and b > r2, each within 4
    const inside = (x: number) => at(coeffs, x) < hi && at(coeffs, x) > lo;
    const as = range(r1 - 4, r1 - 1).filter(inside), bs = range(r2 + 1, r2 + 4).filter(inside);
    if (!as.length || !bs.length) return null;
    const a = as[Math.floor(rnd() * as.length)], b = bs[Math.floor(rnd() * bs.length)];
    const f = poly(coeffs);
    const problem: WordProblem = {
      template: "cubic-max-min",
      topic: "calc1-extrema",
      stem: `Let f(x) = ${f} on the interval [${a}, ${b}].`,
      parts: [
        { part: "a", line: "Find the maximum value of f on the interval.", spec: { shape: "extremum", f, on: [a, b], kind: "max" } },
        { part: "b", line: "Find the minimum value of f on the interval.", spec: { shape: "extremum", f, on: [a, b], kind: "min" } },
      ],
      drawn: [a, b],
      fn: f,
    };
    return { problem, worked: [String(hi), String(lo)] };
  },
};

/** Every template, in the order the sweep reads them. */
export const WORD_TEMPLATES: readonly WordTemplate[] = [relatedRates, rectangle, maxMin];

/**
 * The templates a set may carry (M3a's kill rule): a template whose sweep (tools/calc-word-test.cjs) shows a non-zero
 * count stays out of this list, its code and rows kept.
 */
export const SHIPPED: readonly string[] = ["sphere-rates", "rectangle-perimeter", "cubic-max-min"];

// ------------------------------------------------------------------ the rules a drawn problem is held to

/** Number words a stem may not use: every number it prints is a numeral the code drew. */
const NUMBER_WORDS = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|half|halves|twice|double|triple|quarter|dozen)\b/i;

/** The texts a problem prints: the stem, then each part's line. */
const texts = (w: WordProblem): string[] => [w.stem, ...w.parts.map((p) => p.line)];

/** Is every part a question the desk can print and judge (rules/calc wellFormed)? */
export const wellFormedWord = (w: WordProblem): boolean => w.parts.length >= 2 && w.parts.every((p) => wellFormed(p.spec).ok);

/** Does no text give a part's answer away: not the stem, not its own line, not another part's line (leaksCalc)? */
export const fairWord = (w: WordProblem): boolean => w.parts.every((p) => texts(w).every((t) => !leaksCalc(p.spec, t)));

/**
 * The numbers the problem prints that it did not draw: every numeral in the stem and the part lines, outside the function
 * the stem prints (which must be the parts' own `f`), that is not in `drawn`, and every number word. Empty when the rule holds.
 */
export function undrawn(w: WordProblem): string[] {
  const out: string[] = [];
  if (w.fn !== undefined && !w.parts.every((p) => p.spec.f === w.fn)) out.push(`fn ${w.fn}`);
  for (const t of texts(w)) {
    const words = NUMBER_WORDS.exec(t);
    if (words) out.push(words[0]);
    const rest = w.fn ? t.split(w.fn).join(" ") : t;
    for (const tok of rest.match(/-?\d+(?:\.\d+)?/g) ?? []) if (!w.drawn.includes(Number(tok))) out.push(tok);
  }
  return out;
}

/** One template's draw from a seed, with its worked answers, or null for a bad seed or a seed that runs dry. */
function drawn(t: WordTemplate, seed: unknown): Drawn | null {
  if (!isSeed(seed)) return null;
  const rnd = prng((seed ^ t.salt) >>> 0);
  for (let k = 0; k < MAX_TRIES; k++) {
    const d = t.once(rnd);
    if (d && wellFormedWord(d.problem) && fairWord(d.problem) && !undrawn(d.problem).length) return d;
  }
  return null;
}

/** A template by id. */
export const templateOf = (id: string): WordTemplate | undefined => WORD_TEMPLATES.find((t) => t.id === id);

/** One problem from a template and a seed, fair and well formed, or null. Pure and seeded. */
export function drawWord(id: string, seed: unknown): WordProblem | null {
  const t = templateOf(id);
  return t ? drawn(t, seed)?.problem ?? null : null;
}

/** The worked answers of the same draw, one exact string per part: for the sweep, which marks each with checkAnswer. */
export function workedWord(id: string, seed: unknown): string[] | null {
  const t = templateOf(id);
  return t ? drawn(t, seed)?.worked ?? null : null;
}

/** The shipped template a topic's set may carry, or undefined: one per topic. */
export const wordTemplateFor = (topic: string): WordTemplate | undefined =>
  WORD_TEMPLATES.find((t) => t.topic === topic && SHIPPED.includes(t.id));

// ------------------------------------------------------------------ parts as items

/** The fields a part adds to a practice item. */
export interface PartFields { stem?: string; part?: PartLabel }
export const isPartLabel = (x: unknown): x is PartLabel => typeof x === "string" && (PART_LABELS as readonly string[]).includes(x);

/** A problem as consecutive practice items from number `first`: one per part, the stem on each. */
export function wordItems(w: WordProblem, first: number): { n: number; question: string; spec: CalcSpec; stem: string; part: PartLabel }[] {
  return w.parts.map((p, i) => ({ n: first + i, question: p.line, spec: p.spec, stem: w.stem, part: p.part }));
}

/** Where an item sits: a part (its letter, the question's number - its first part's - and whether it opens the question), or null. */
export interface PartPlace { label: PartLabel; q: number; first: boolean }
export function partPlace(items: readonly ({ n: number } & PartFields)[], i: number): PartPlace | null {
  const it = items[i];
  if (!it || !isPartLabel(it.part) || typeof it.stem !== "string") return null;
  let k = i;
  while (k > 0 && items[k - 1].stem === it.stem && isPartLabel(items[k - 1].part) && items[k].part !== "a") k--;
  return { label: it.part, q: items[k].n, first: k === i };
}

/** An item's name on the paper: '5' for a single item, '5(a)' for a part. */
export function itemName(items: readonly ({ n: number } & PartFields)[], i: number): string {
  const at = partPlace(items, i);
  return at ? `${at.q}(${at.label})` : String(items[i]?.n ?? "");
}

/**
 * A desk line that names an item by its number ('Number 6 is right.', rules/maths RIGHT and ASK), with a part named as the
 * paper names it ('Number 5(b) is right.'): for the screens only - the stored line is left as marking wrote it.
 */
export function namedLine(line: string, n: number, name: string): string {
  return name === String(n) ? line : line.replace(new RegExp(`\\b([Nn])umber ${n}\\b`, "g"), `$1umber ${name}`);
}

/**
 * A desk line for the item at `i`, as the learner sees or hears it: a part named as the paper names it. The one place an
 * item number in a stored line is rewritten - the TV card, the walk's voice, the second go's sentences and the explain reply
 * all come through here. A single item's line is returned as it is.
 */
export const deskLine = (items: readonly ({ n: number } & PartFields)[], i: number, line: string): string =>
  items[i] ? namedLine(line, items[i].n, itemName(items, i)) : line;

/** The whole task an item asks, for a prompt: the stem and the part's letter before a part's line; a single item's question. */
export const askedText = (it: { question: string } & PartFields): string =>
  typeof it.stem === "string" && isPartLabel(it.part) ? `${it.stem} (${it.part}) ${it.question}` : it.question;
