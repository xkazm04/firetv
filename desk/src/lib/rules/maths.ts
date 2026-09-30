/**
 * The slip vocabulary for linear equations - and, through rules/calc CALC_SLIPS, for the calc1 topics, and through
 * rules/school SCHOOL_SLIPS, for the school units that have them (Family W5b and W7: the four fractions units) - decided in code.
 *
 * Same discipline as rules/english.ts: the table is the closed set the model is allowed to
 * choose from. It names a mistake and points at a line. It never carries the corrected line,
 * the next step, or the answer — the student produces those, or there was no point asking.
 *
 * It also holds the settle rule marking and explanation share, and the check that a reply leaks nothing.
 * It imports rules/calc, rules/school and the calc1 spine (all pure, client-safe) and nothing session-backed.
 */
import { evaluate, substitute, verify } from "../desk/verify";
import type { PracticeItem, SlipAt } from "../session/store";
import { spanStarts } from "../../maths/typeset";
import { CALC_SHAPES, CALC_SLIPS, checkAnswer, slipsFor as calcSlipsFor } from "./calc";
import { CALC1_SPINE } from "../library/calculus1.spine";
import { DEFAULT_SCHOOL_SYSTEM, SCHOOL_SLIPS, SCHOOL_UNIT_SLIPS, check as schoolCheck, isSchoolSpec } from "./school";
import type { SchoolSystem } from "../session/store";

/** `name` is what the TV sets as the slip's title; `says` is the desk's line; `points` the place in words. */
export interface Slip { id: string; topics: string[]; says: string; points: string; name: string; }

const ONE = "linear-one-step";
const TWO = "linear-two-step";
const BOTH = "linear-both-sides";

export const SLIPS: Slip[] = [
  { id: "undo-wrong-order", topics: [TWO, BOTH], says: "You undid the multiplication before the addition. Look at the order the two operations were done to x, and undo them the other way round.", points: "the second line", name: "Undone in the wrong order" },
  { id: "sign-lost-moving", topics: [ONE, TWO, BOTH], says: "A term changed sides but kept its sign. Check what happened to that term as it crossed the equals sign.", points: "the line where the term moved", name: "Sign lost crossing the equals" },
  { id: "divided-one-term", topics: [TWO, BOTH], says: "You divided only part of that side. Everything on the side has to be divided, not just the term next to x.", points: "the left-hand side", name: "Only one term divided" },
  { id: "bracket-first-term-only", topics: [BOTH], says: "The bracket was expanded onto the first term only. The number outside multiplies every term inside.", points: "the expanded bracket", name: "Bracket on the first term only" },
  { id: "collect-x-wrong-sign", topics: [BOTH], says: "The x-terms were collected with the wrong sign. Check the sign of the x-term you moved across.", points: "the line where the x-terms met", name: "x-terms gathered with the wrong sign" },
  { id: "multiplied-not-divided", topics: [ONE, TWO], says: "You multiplied where the operation needed undoing by dividing. Look at what is being done to x on that line.", points: "the last line", name: "Multiplied instead of divided" },
  { id: "added-not-subtracted", topics: [ONE, TWO], says: "The same operation was done again instead of being undone. Read what is attached to x and ask what reverses it.", points: "the first line of working", name: "Done again instead of undone" },
  { id: "one-side-only", topics: [ONE, TWO, BOTH], says: "The step was done to one side and not the other. Whatever you do to one side has to happen to both.", points: "the right-hand side", name: "Done to one side only" },
  { id: "arithmetic-slip", topics: [ONE, TWO, BOTH], says: "The method is right but a number came out wrong. Re-do just the arithmetic on that line.", points: "the line you are on", name: "A number came out wrong" },
  { id: "negative-mishandled", topics: [TWO, BOTH], says: "A negative was dropped somewhere in that step. Track the minus sign through the line.", points: "the line with the negative", name: "A minus sign dropped" },
  { id: "fraction-not-cleared", topics: [TWO, BOTH], says: "The fraction was left in place instead of being undone. Look at what the x is being divided by.", points: "the left-hand side", name: "The fraction left in place" },
  { id: "answer-not-checked", topics: [ONE, TWO, BOTH], says: "The working stops before the check. Put your value back into the original equation and see whether the two sides agree.", points: "the original equation", name: "The answer not checked" },
];

/**
 * The Calculus slips (rules/calc CALC_SLIPS) as Slips, each tagged with the calc1 topics whose practice shapes it
 * applies to (calculus1.spine: a topic's shapes; rules/calc slipsFor(shape), unioned over them). Their words are
 * rules/calc's own; like the school table, none carries a value.
 */
const CALC_AS_SLIPS: Slip[] = CALC_SLIPS.map((c) => ({
  id: c.id, says: c.says, points: c.points, name: c.name,
  topics: CALC1_SPINE.filter((t) => t.shapes.some((sh) => calcSlipsFor(sh).includes(c.id))).map((t) => t.id),
}));
const isCalcTopic = (topicId: string) => CALC1_SPINE.some((t) => t.id === topicId);

/**
 * The school units' slips (rules/school SCHOOL_SLIPS, Family W5b) as Slips, each tagged with the units whose closed
 * list (SCHOOL_UNIT_SLIPS) names it. Their words are rules/school's own; none carries a value. Each is detected by code
 * from the spec's own operands (rules/school check), never picked by a model.
 */
const SCHOOL_AS_SLIPS: Slip[] = SCHOOL_SLIPS.map((c) => ({
  id: c.id, says: c.says, points: c.points, name: c.name,
  topics: Object.keys(SCHOOL_UNIT_SLIPS).filter((u) => SCHOOL_UNIT_SLIPS[u].includes(c.id)),
}));

/**
 * A slip by id: the school table first (so a shared id such as 'arithmetic-slip' reads as it always has), then the
 * Calculus slips, then the school units' slips. With `topicId`, that topic's own list is asked first, so a shared id
 * reads in the topic's words.
 */
export function slip(id: string, topicId?: string): Slip | undefined {
  return (topicId ? slipsFor(topicId).find((s) => s.id === id) : undefined)
    ?? SLIPS.find((s) => s.id === id) ?? CALC_AS_SLIPS.find((s) => s.id === id) ?? SCHOOL_AS_SLIPS.find((s) => s.id === id);
}

/**
 * The closed list for a topic: the linear table for a linear id, the Calculus slips of its shapes for a calc1 id, the
 * unit's own list for a school unit (SCHOOL_UNIT_SLIPS). Nothing outside a topic's list can be named on its items.
 */
export function slipsFor(topicId: string): Slip[] {
  if (isCalcTopic(topicId)) return CALC_AS_SLIPS.filter((s) => s.topics.includes(topicId));
  return [...SLIPS, ...SCHOOL_AS_SLIPS].filter((s) => s.topics.includes(topicId));
}

/** The list the prompt carries: one slip per line, id then what the desk would say. */
export function slipVocabulary(topicId: string): string {
  return slipsFor(topicId).map((s) => `${s.id}: ${s.says} (point at ${s.points})`).join("\n");
}

// ---- settling an item: the substitution decides, the desk's line is built here, never by a model ----
/** What the desk says on an item it has settled right, and on one it cannot settle. Neither carries a value. */
export const RIGHT = (n: number) => `Number ${n} is right.`;
export const ASK = (n: number) => `I got something different for number ${n}. How did you get there?`;

/** A value as a learner or a marker writes it: `x = 9` is `9`. */
export const cleanValue = (s: unknown) => (typeof s === "string" ? s.trim().replace(/^x\s*=\s*/i, "") : "");

/** Typed answers (Family W6): the most a set may carry, and the longest one answer may be. Refused past either, never cut. */
export const TYPED_ANSWERS_MAX = 12;
export const TYPED_ANSWER_MAX = 40;

/**
 * Are these the typed answers to a set of `n` questions? A plain sentence when not, null when they are: a list of
 * strings, at most TYPED_ANSWERS_MAX of them and one per question, each at most TYPED_ANSWER_MAX characters. A blank
 * answer (the child left it) is a string like another. Pure: the route asks it, the phone's box reads the two caps.
 */
export function typedAnswersProblem(answers: unknown, n: number): string | null {
  if (!Array.isArray(answers)) return "The desk did not get your answers as a list. Type them again.";
  if (answers.length > TYPED_ANSWERS_MAX) return `That is more than ${TYPED_ANSWERS_MAX} answers, and no set is that long. Send one for each question.`;
  if (answers.some((a) => typeof a !== "string")) return "One of the answers was not text. Type them again.";
  if (answers.length !== n) return `This set has ${n} questions and ${answers.length} answers came. Send one for each question.`;
  const long = (answers as string[]).findIndex((a) => a.length > TYPED_ANSWER_MAX);
  if (long >= 0) return `Answer ${long + 1} is longer than ${TYPED_ANSWER_MAX} characters. Shorten it and send again.`;
  return null;
}

export interface Settled { verdict: "right" | "wrong"; slip?: string; said: string; slipAt?: SlipAt; }

/**
 * The verdict the substitution gave, and the line that goes with it. A slip survives only on a wrong
 * item and only from this topic's closed vocabulary; a wrong item with no slip asks. Never a value.
 */
export function settled(n: number, right: boolean, slipId: unknown, topicId: string): Settled {
  const id = typeof slipId === "string" ? slipId.trim() : "";
  const own = right ? undefined : slipsFor(topicId).find((s) => s.id === id);
  return { verdict: right ? "right" : "wrong", slip: own?.id, said: right ? RIGHT(n) : own ? own.says : ASK(n) };
}

/** Is this a Calculus spec by its shape? A school spec never is (the shape lists share no name). */
export const isCalcSpec = (spec: unknown): boolean =>
  !!spec && typeof spec === "object" && (CALC_SHAPES as readonly unknown[]).includes((spec as { shape?: unknown }).shape);

/**
 * Settle an item with a spec from an answer as written or said, dispatched on the spec's shape - never both engines:
 *   - a Calculus spec: rules/calc checkAnswer decides, from the spec alone. The slip is checkAnswer's own where it names
 *     one (sign, lost-constant), else the pick offered;
 *   - a school spec (Family W5b): rules/school check(spec, answer, system) decides, reading the answer by the learner's
 *     school system (`system`, the desk's default UK when not given: '0,5' is a half in cz and de, unsure in us and
 *     uk). The slip is ONLY the one code detected from the spec's operands: a pick offered is ignored.
 * 'unsure' - blank, unreadable, a rounding, a form the question did not ask for, not comparable - settles nothing
 * (null): the desk does not guess. A slip survives only on a wrong item and only from the topic's list (`settled`).
 * No pen position: `locate` reads linear lines only. A spec of neither kind settles nothing.
 */
export function settleSpec(n: number, spec: unknown, answer: unknown, slipId: unknown, topicId: string, system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM): Settled | null {
  if (isSchoolSpec(spec)) {
    const v = schoolCheck(spec, typeof answer === "string" ? answer : "", system);
    if (v.verdict === "unsure") return null;
    return settled(n, v.verdict === "right", v.slip, topicId);
  }
  if (!isCalcSpec(spec)) return null;
  const c = checkAnswer(spec, typeof answer === "string" ? answer : "");
  if (c.verdict === "unsure") return null;
  return settled(n, c.verdict === "right", c.slip ?? slipId, topicId);
}

/**
 * Settle an item from a value the learner gave: substitute it into the question, by the one rule marking
 * uses (`substitute`). A value the substitution cannot make settles nothing (null) - the desk does not guess
 * what "about nine" was, and a value in x ("5x") is not a value of x. An item settled wrong is located in its
 * own working by the rule marking uses (`locate`).
 */
export function settle(item: { n: number; question: string } & Pick<PracticeItem, "studentWorking" | "studentAnswer">, value: unknown, slipId: unknown, topicId: string): Settled | null {
  const right = substitute(item.question, cleanValue(value));
  if (right === null) return null;
  const s = settled(item.n, right, slipId, topicId);
  const at = s.verdict === "wrong" ? locate(item.question, workingLines(item)) : undefined;
  return at ? { ...s, slipAt: at } : s;
}

/**
 * The set's line in the learner's history: "k of n right", and ", u not sure" when the desk could not decide u of
 * them (Lamplight's dashed ring: an unsure item is neither a tick nor a slip, and the recap draws it as one).
 * Counted from the verdicts the substitution set on the items, never from a model's word. With no unsure item
 * the line is the old "k of n right" exactly, so older lines and newer ones read alike. Marking writes it; a
 * settle restates it from the same verdicts - a recount, not a count-up, so an item settled twice is still one item.
 */
export const rightLine = (items: readonly { verdict?: string }[]) => {
  const u = items.filter((i) => i.verdict !== "right" && i.verdict !== "wrong").length; // unsure, or no verdict: never drawn as a slip
  return `${items.filter((i) => i.verdict === "right").length} of ${items.length} right${u ? `, ${u} not sure` : ""}`;
};

/** The restated line for a history entry that is this set's line (same n, either form), or null when it is not. */
export function restatedLine(detail: string, items: readonly { verdict?: string }[]): string | null {
  const m = /^\d+ of (\d+) right(?:, \d+ not sure)?$/.exec(detail);
  return m && Number(m[1]) === items.length ? rightLine(items) : null;
}

/** Every number written in a line: 7, -3, 3.5, 7/2. */
const NUMBERS = /[-−]?\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?/g;
const WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  eleven: "11", twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18",
  nineteen: "19", twenty: "20", thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70", eighty: "80", ninety: "90",
};
/** A number word, a tens word with its unit ('twenty-one', 'twenty one') read first so it is never 20 then 1. */
const NUMBER_WORD = /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:(?:-|\s+)(one|two|three|four|five|six|seven|eight|nine)\b)?|\b([a-z]+)\b/g;

/**
 * A line as it would be said, with its numbers in digits: lower case, every dash a '-', number words to ninety-nine
 * as digits, 'and a half' as .5, 'minus 3' and 'negative three' as -3, and a minus standing apart from its number
 * ('x = - 3') joined to it - only where no number, x or bracket stands before it, so 'x - 3' stays a subtraction.
 * A word is a number only as WORDS' own key: 'constructor' is a word, never Object's function spliced in as text.
 */
const said = (line: string) => line.toLowerCase().replace(/[−–—‐‑]/g, "-")
  .replace(NUMBER_WORD, (w, tens: string | undefined, unit: string | undefined, word: string | undefined) =>
    tens ? String(Number(WORDS[tens]) + (unit ? Number(WORDS[unit]) : 0)) : Object.hasOwn(WORDS, word!) ? WORDS[word!] : w)
  .replace(/(\d+)\s+and\s+a\s+half\b/g, "$1.5")
  .replace(/\b(?:minus|negative)\s*(?=\d)/g, "-")
  .replace(/(^|[^\s\da-z)\]²])(\s*)-\s+(?=\d)/g, "$1$2-");
/** A decimal comma read as a point ('3,5' is 3.5); a comma in a list ('1, 2, 3', '1,2,3') is left a list. */
const decimalComma = (line: string) => line.replace(/(?<!\d,|[\d.])(\d+),(\d+)(?!,\d|\d)/g, "$1.$2");

/**
 * Does this line give the answer away? Any number in it - in digits, as number words to ninety-nine, with a written,
 * spaced or spoken minus ('minus 3', 'x = - 3'), a decimal comma ('3,5') or 'and a half' - that the substitution
 * accepts for the question is the answer. The prompt asks the model not to say it; this is the check that does not
 * rely on the asking.
 *
 * The one leak rule, for explain's reply and for every hint line. It reads the question as a photographed page
 * gives it ('Solve for x:  3x − 7 = 11' is its equation, `equationOf`), and an expression item leaks by form as
 * well (`leaksByForm`): the lab's oracle (vision/poc_hints.py) derived, not hand-listed.
 */
export function leaks(question: string, line: string): boolean {
  if (typeof line !== "string" || !line) return false;
  const eq = equationOf(question) ?? question;
  const found = [...(decimalComma(said(line)).match(NUMBERS) ?? [])];
  // "12-7" reads as -7 here, so a signed number is checked with and without its sign
  return found.map((v) => v.replace(/\s+/g, "").replace(/^−/, "-"))
    .some((v) => verify(eq, v) || (v.startsWith("-") && verify(eq, v.slice(1))))
    || leaksByForm(question, line);
}

// ---- the pen: where the learner's working broke, found in code from their own lines ----
/**
 * The learner's working, one line per step: the transcription's own line breaks, `;` and arrows between steps.
 * One rule for the server that locates a slip and the TV that draws it, so a `slipAt.line` means the same line.
 * With no working the one line is the answer: on the school path a bare value is a value of x; an item with a spec
 * (a Calculus item - a limit, a derivative, a value of f) asks for no x, so its answer stands as the learner wrote it.
 * Callers pass the whole item, so the path is decided here and nowhere else.
 */
export function workingLines(it: Pick<PracticeItem, "studentWorking" | "studentAnswer"> & { spec?: unknown }): string[] {
  const w = (it.studentWorking ?? "").trim();
  const lines = w ? w.split(/\r?\n|;\s*|\s+(?:→|⇒|=>|->)\s+/).map((l) => l.trim()).filter(Boolean) : [];
  if (lines.length) return lines;
  const a = (it.studentAnswer ?? "").trim();
  if (!a) return [];
  if (it.spec !== undefined && it.spec !== null) return [a];
  // the marker cleans "x = " off a value; a bare value is a value of x, as every question on the school path asks
  return [/[=a-zA-Z]/.test(a) ? a : `x = ${a}`];
}

type Sides = [string, string];
/** The two sides of one equation, or null for a line that is not one. */
const sidesOf = (line: unknown): Sides | null => {
  const p = typeof line === "string" ? line.split("=") : [];
  return p.length === 2 && p[0].trim() && p[1].trim() ? [p[0], p[1]] : null;
};
const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
/** Do both sides agree at x? null when either side is not arithmetic the desk can read there. */
function holds([l, r]: Sides, x: number): boolean | null {
  const a = evaluate(l, x), b = evaluate(r, x);
  return a === null || b === null ? null : close(a, b);
}

/**
 * Is this line one equation the desk can read as arithmetic? The lines `locate` checks, and so the only lines a
 * tick before a located slip may claim: a line in words is neither checked nor ticked.
 */
export function readsAsArithmetic(line: string): boolean {
  const s = sidesOf(line);
  return !!s && evaluate(s[0], 0.37) !== null && evaluate(s[1], 0.37) !== null;
}

/**
 * The root of a linear equation, found in code: left minus right at two points gives the line, a third proves it
 * is one. Not linear, no x, or not arithmetic: null - the desk claims no root it did not find. Never leaves the server.
 */
export function rootOf(question: string): number | null {
  const s = sidesOf(question);
  if (!s) return null;
  const f = (x: number) => { const a = evaluate(s[0], x), b = evaluate(s[1], x); return a === null || b === null ? null : a - b; };
  const f0 = f(0), f1 = f(1), f3 = f(3);
  if (f0 === null || f1 === null || f3 === null) return null;
  const slope = f1 - f0;
  if (Math.abs(slope) <= 1e-9 * Math.max(1, Math.abs(f0), Math.abs(f1))) return null;
  if (!close(f3, f0 + 3 * slope)) return null;
  const r = -f0 / slope, whole = Math.round(r);
  return (Math.abs(r - whole) < 1e-9 ? whole : r) + 0;
}

/** Where each top-level term's written sign sits in one side: a leading minus, and every + or - between terms. */
function termSigns(side: string): number[] {
  const out: number[] = [];
  let depth = 0, prev = "";
  for (let j = 0; j < side.length; j++) {
    const c = side[j];
    if (/\s/.test(c)) continue;
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (depth === 0 && /[+\-−–—]/.test(c) && !/[+\-−–—*×·∙⋅/÷^([{]/.test(prev)) out.push(j);
    prev = c;
  }
  return out;
}

/**
 * The one written sign whose flip makes the line hold at the root, as the span to ring ("- 7") and where in the
 * whole line that span starts, or null when no flip, more than one, or only an unwritten leading plus would repair
 * it. Never on a line where x stands alone: ringing that sign would ring the sign of the answer itself.
 */
function oneSignFlip(sides: Sides, root: number): { span: string; at: number } | null {
  if (sides.some((side) => /^\s*x\s*$/i.test(side))) return null;
  const repairs: ({ span: string; at: number } | null)[] = [];
  sides.forEach((side, i) => {
    const at = termSigns(side), with_ = (t: string): Sides => (i === 0 ? [t, sides[1]] : [sides[0], t]);
    // the line is `left=right` (sidesOf splits on its one "="), so the right side starts one past the left
    const offset = i === 0 ? 0 : sides[0].length + 1;
    at.forEach((j, t) => {
      const flipped = side.slice(0, j) + (side[j] === "+" ? "-" : "+") + side.slice(j + 1);
      if (holds(with_(flipped), root)) repairs.push({ span: side.slice(j, at[t + 1] ?? side.length).trim(), at: offset + j });
    });
    const first = side.search(/\S/);
    if (first >= 0 && !at.includes(first) && holds(with_(side.slice(0, first) + "-" + side.slice(first)), root)) repairs.push(null);
  });
  return repairs.length === 1 ? repairs[0] : null;
}

/**
 * Where the learner's working broke: the first line that stops holding at the question's root, found in code
 * (`rootOf`), never taken from a model's solution. A sign kind and span only when flipping exactly one written sign
 * repairs the line; when the line holds that span's text more than once, `nth` names which occurrence (as the
 * pen's `spanStarts` counts them), and a first occurrence carries none. A line that is not arithmetic is skipped,
 * never blamed; no linear root, no claim. The position is the learner's own writing - it names a line and a part
 * of it, never the value that would make it right.
 */
export function locate(question: string, lines: readonly string[]): SlipAt | undefined {
  const root = rootOf(question);
  if (root === null || !Array.isArray(lines)) return undefined;
  for (let k = 0; k < lines.length; k++) {
    const sides = sidesOf(lines[k]);
    if (!sides || !readsAsArithmetic(lines[k]) || holds(sides, root) !== false) continue;
    const flip = oneSignFlip(sides, root);
    if (!flip) return { line: k };
    const nth = spanStarts(lines[k], flip.span).findIndex((s) => s.at === flip.at);
    // the span was cut from this line at `at`, so it is always found there; if not, mark the line rather than guess
    if (nth < 0) return { line: k };
    return nth > 0 ? { line: k, span: flip.span, kind: "sign", nth } : { line: k, span: flip.span, kind: "sign" };
  }
  return undefined;
}

// ---- the hint path: the leak rule reads an item as a photographed page gives it ----
/** The maths after an item's label ('Solve for x:', 'Factor completely:'), or the whole text when it has none. */
const afterLabel = (text: string) => {
  const s = text.trim(), i = s.lastIndexOf(":");
  return (i >= 0 ? s.slice(i + 1) : s).trim().replace(/[.?!]+$/, "").trim();
};

/**
 * The one single-variable equation an item asks about, as printed: 'Solve for x:  3x − 7 = 11' is '3x − 7 = 11'.
 * A system, a word problem or a slope item has none (null) - no oracle, so the desk claims nothing about it.
 */
export function equationOf(itemText: unknown): string | null {
  if (typeof itemText !== "string") return null;
  const e = afterLabel(itemText);
  return /x/i.test(e) && readsAsArithmetic(e) ? e : null;
}

/** The one-variable expression an item works on ('Factor completely:  x² + 7x + 12'), or null. */
export function expressionOf(itemText: unknown): string | null {
  if (typeof itemText !== "string") return null;
  const e = afterLabel(itemText);
  return e && !e.includes("=") && /x/i.test(e) && evaluate(e, 0.37) !== null ? e : null;
}

/** How a line is written, for comparison: no spaces, ² as ^2, one minus. */
const compact = (s: string) => s.toLowerCase().replace(/\s+/g, "").replace(/²/g, "^2").replace(/[−–—‐‑]/g, "-");
/** A sum has a top-level + or - after its first term; otherwise it is a product (or one term). */
const isSum = (e: string) => { const first = e.search(/\S/); return termSigns(e).some((j) => j > first); };
const POINTS = [-2.5, -1, 0.37, 1.9, 3.3];
const sameValue = (a: string, b: string) => POINTS.every((x) => { const u = evaluate(a, x), v = evaluate(b, x); return u !== null && v !== null && close(u, v); });
/** The line with every word but x masked, so only its maths is left to read. */
const maskWords = (line: string) => line.replace(/[A-Za-z]+/g, (w) => (/^x$/i.test(w) ? w : "|"));
/** The line with its minus signs as '-' and its number words as digits: 'minus three' is '-3' (`said`, the one reading). */
const spoken = said;
/** Two numbers named as a pair: '3 and 4', '4 & 3', '-3, -4', '3 or 4', 'x = -3 and x = -4'. */
const PAIR = /(?<![\d.\/])(-?\d+(?:\.\d+)?(?:\/\d+)?)\s*(?:,\s*(?:and\s+|or\s+)?|and\s|&|or\s)\s*(?:x\s*=\s*)?(-?\d+(?:\.\d+)?(?:\/\d+)?)(?![\d\/]|\.\d)/g;
/** The root of a linear bracket's content, or null when it is not linear in x. */
function linearRoot(c: string): number | null {
  const f0 = evaluate(c, 0), f1 = evaluate(c, 1), f3 = evaluate(c, 3);
  if (f0 === null || f1 === null || f3 === null) return null;
  const slope = f1 - f0;
  return Math.abs(slope) > 1e-9 && close(f3, f0 + 3 * slope) ? -f0 / slope : null;
}

/**
 * Does this line give an item's answer away by its form? A linear bracket the item does not already show whose root
 * answers it ('(x + 3)' for x² + 7x + 12, '(x − 6)' for 3x − 7 = 11); and for an expression item, the expression
 * rewritten in the other form - a product for a sum, a polynomial for a product ('x^2 + x - 12' for (x + 4)(x − 3));
 * and for an item whose answer is its roots (an equation, or a sum to factor), a pair of numbers that are both roots,
 * signed or not, in either order ('3 and 4' for x² + 7x + 12, the lab's leak term). The item's own expression,
 * reordered or quoted, and its own brackets are not the answer; nor is the method's pair ('multiplies to 12 and adds
 * to 7'), nor an expand item's own numbers.
 */
export function leaksByForm(question: string, line: string): boolean {
  if (typeof question !== "string" || typeof line !== "string" || !line) return false;
  const eq = equationOf(question), ex = eq ? null : expressionOf(question);
  if (!eq && !ex) return false;
  const own = compact(question), masked = maskWords(line);
  const answers = (r: number) => (eq ? holds(sidesOf(eq)!, r) === true : (() => { const v = evaluate(ex!, r); return v !== null && close(v, 0); })());
  for (const m of masked.matchAll(/\(([^()]*)\)/g)) {
    if (!/x/i.test(m[1]) || own.includes(compact(m[0]))) continue;
    const r = linearRoot(m[1]);
    if (r !== null && answers(r)) return true;
  }
  if (eq || isSum(ex!)) {
    const root = (n: string) => { const v = evaluate(n, 0); return v !== null && (answers(v) || answers(-v)); };
    for (const m of spoken(line).matchAll(PAIR)) if (root(m[1]) && root(m[2])) return true;
  }
  if (ex) for (const f of masked.split(/[|,;:!?"“”‘’'$=\{}]|\.(?!\d)/)) {
    const frag = f.trim();
    if (/x/i.test(frag) && evaluate(frag, 0.37) !== null && isSum(frag) !== isSum(ex) && sameValue(frag, ex)) return true;
  }
  return false;
}

/**
 * The line the TV shows and speaks when the model's hint gave the answer away twice: written here, never by a model,
 * per kind of item. It points at the method and carries no number - nothing on it can be the answer.
 */
export function withheldLine(itemText: string): string {
  if (equationOf(itemText)) return "Undo what is done to x, step by step, the same on both sides. The value of x is yours to find.";
  if (expressionOf(itemText) && /^\s*factor/i.test(itemText)) return "Look for a pair of numbers that multiply to the last term and add to the middle coefficient. Finding them is yours.";
  if (expressionOf(itemText) && /^\s*expand/i.test(itemText)) return "Multiply every term in the first bracket by every term in the second, then collect the like terms.";
  return "Go back to the last step you are sure of and take the next. The answer stays yours to find.";
}
