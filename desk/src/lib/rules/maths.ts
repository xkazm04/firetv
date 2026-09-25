/**
 * The slip vocabulary for linear equations, decided in code.
 *
 * Same discipline as rules/english.ts: the table is the closed set the model is allowed to
 * choose from. It names a mistake and points at a line. It never carries the corrected line,
 * the next step, or the answer — the student produces those, or there was no point asking.
 *
 * It also holds the settle rule marking and explanation share, and the check that a reply leaks nothing.
 */
import { evaluate, verify } from "../desk/verify";
import type { PracticeItem, SlipAt } from "../session/store";

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

export function slip(id: string): Slip | undefined {
  return SLIPS.find((s) => s.id === id);
}

export function slipsFor(topicId: string): Slip[] {
  return SLIPS.filter((s) => s.topics.includes(topicId));
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

export interface Settled { verdict: "right" | "wrong"; slip?: string; said: string; slipAt?: SlipAt; }

/**
 * The verdict the substitution gave, and the line that goes with it. A slip survives only on a wrong
 * item and only from this topic's closed vocabulary; a wrong item with no slip asks. Never a value.
 */
export function settled(n: number, right: boolean, slipId: unknown, topicId: string): Settled {
  const id = typeof slipId === "string" ? slipId.trim() : "";
  const kept = !right && slipsFor(topicId).some((s) => s.id === id) ? id : undefined;
  return { verdict: right ? "right" : "wrong", slip: kept, said: right ? RIGHT(n) : kept ? slip(kept)!.says : ASK(n) };
}

/**
 * Settle an item from a value the learner gave: substitute it into the question. A value the desk
 * cannot read as arithmetic settles nothing (null) - the desk does not guess what "about nine" was.
 * An item settled wrong is located in its own working by the rule marking uses (`locate`).
 */
export function settle(item: { n: number; question: string } & Pick<PracticeItem, "studentWorking" | "studentAnswer">, value: unknown, slipId: unknown, topicId: string): Settled | null {
  const v = cleanValue(value);
  if (evaluate(v, 0) === null) return null;
  const s = settled(item.n, verify(item.question, v), slipId, topicId);
  const at = s.verdict === "wrong" ? locate(item.question, workingLines(item)) : undefined;
  return at ? { ...s, slipAt: at } : s;
}

/**
 * The set's line in the learner's history: "k of n right". Counted from the verdicts the substitution
 * set on the items, never from a model's word. Marking writes it; a settle restates it from the same
 * verdicts - a recount, not a count-up, so an item settled twice is still one item.
 */
export const rightLine = (items: readonly { verdict?: string }[]) =>
  `${items.filter((i) => i.verdict === "right").length} of ${items.length} right`;

/** The restated line for a history entry that is this set's line (same n), or null when it is not. */
export function restatedLine(detail: string, items: readonly { verdict?: string }[]): string | null {
  const m = /^\d+ of (\d+) right$/.exec(detail);
  return m && Number(m[1]) === items.length ? rightLine(items) : null;
}

/** Every number written in a line: 7, -3, 3.5, 7/2. */
const NUMBERS = /[-−]?\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?/g;
const WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  eleven: "11", twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18",
  nineteen: "19", twenty: "20",
};

/**
 * Does this line give the answer away? Any number in it - written in digits or as a word up to twenty,
 * with or without a minus - that the substitution accepts for the question is the answer. The prompt
 * asks the model not to say it; this is the check that does not rely on the asking.
 */
export function leaks(question: string, line: string): boolean {
  if (typeof line !== "string" || !line) return false;
  const found = [...(line.match(NUMBERS) ?? [])];
  for (const m of line.toLowerCase().matchAll(/\b(minus |negative )?([a-z]+)\b/g)) if (WORDS[m[2]]) found.push((m[1] ? "-" : "") + WORDS[m[2]]);
  // "12-7" reads as -7 here, so a signed number is checked with and without its sign
  return found.map((v) => v.replace(/\s+/g, "").replace(/^−/, "-"))
    .some((v) => verify(question, v) || (v.startsWith("-") && verify(question, v.slice(1))));
}

// ---- the pen: where the learner's working broke, found in code from their own lines ----
/**
 * The learner's working, one line per step: the transcription's own line breaks, `;` and arrows between steps.
 * One rule for the server that locates a slip and the TV that draws it, so a `slipAt.line` means the same line.
 */
export function workingLines(it: Pick<PracticeItem, "studentWorking" | "studentAnswer">): string[] {
  const w = (it.studentWorking ?? "").trim();
  const lines = w ? w.split(/\r?\n|;\s*|\s+(?:→|⇒|=>|->)\s+/).map((l) => l.trim()).filter(Boolean) : [];
  if (lines.length) return lines;
  const a = (it.studentAnswer ?? "").trim();
  if (!a) return [];
  // the marker cleans "x = " off a value; a bare value is a value of x, as every question on the path asks
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
 * The one written sign whose flip makes the line hold at the root, as the span to ring ("- 7"), or null when no
 * flip, more than one, or only an unwritten leading plus would repair it. Never on a line where x stands alone:
 * ringing that sign would ring the sign of the answer itself.
 */
function oneSignFlip(sides: Sides, root: number): string | null {
  if (sides.some((side) => /^\s*x\s*$/i.test(side))) return null;
  const repairs: { span: string | null }[] = [];
  sides.forEach((side, i) => {
    const at = termSigns(side), with_ = (t: string): Sides => (i === 0 ? [t, sides[1]] : [sides[0], t]);
    at.forEach((j, t) => {
      const flipped = side.slice(0, j) + (side[j] === "+" ? "-" : "+") + side.slice(j + 1);
      if (holds(with_(flipped), root)) repairs.push({ span: side.slice(j, at[t + 1] ?? side.length).trim() });
    });
    const first = side.search(/\S/);
    if (first >= 0 && !at.includes(first) && holds(with_(side.slice(0, first) + "-" + side.slice(first)), root)) repairs.push({ span: null });
  });
  return repairs.length === 1 ? repairs[0].span : null;
}

/**
 * Where the learner's working broke: the first line that stops holding at the question's root, found in code
 * (`rootOf`), never taken from a model's solution. A sign kind and span only when flipping exactly one written sign
 * repairs the line. A line that is not arithmetic is skipped, never blamed; no linear root, no claim. The position
 * is the learner's own writing - it names a line and a part of it, never the value that would make it right.
 */
export function locate(question: string, lines: readonly string[]): SlipAt | undefined {
  const root = rootOf(question);
  if (root === null || !Array.isArray(lines)) return undefined;
  for (let k = 0; k < lines.length; k++) {
    const sides = sidesOf(lines[k]);
    if (!sides || !readsAsArithmetic(lines[k]) || holds(sides, root) !== false) continue;
    const span = oneSignFlip(sides, root);
    return span ? { line: k, span, kind: "sign" } : { line: k };
  }
  return undefined;
}
