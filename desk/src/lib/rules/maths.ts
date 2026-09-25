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

export interface Slip { id: string; topics: string[]; says: string; points: string; }

const ONE = "linear-one-step";
const TWO = "linear-two-step";
const BOTH = "linear-both-sides";

export const SLIPS: Slip[] = [
  { id: "undo-wrong-order", topics: [TWO, BOTH], says: "You undid the multiplication before the addition. Look at the order the two operations were done to x, and undo them the other way round.", points: "the second line" },
  { id: "sign-lost-moving", topics: [ONE, TWO, BOTH], says: "A term changed sides but kept its sign. Check what happened to that term as it crossed the equals sign.", points: "the line where the term moved" },
  { id: "divided-one-term", topics: [TWO, BOTH], says: "You divided only part of that side. Everything on the side has to be divided, not just the term next to x.", points: "the left-hand side" },
  { id: "bracket-first-term-only", topics: [BOTH], says: "The bracket was expanded onto the first term only. The number outside multiplies every term inside.", points: "the expanded bracket" },
  { id: "collect-x-wrong-sign", topics: [BOTH], says: "The x-terms were collected with the wrong sign. Check the sign of the x-term you moved across.", points: "the line where the x-terms met" },
  { id: "multiplied-not-divided", topics: [ONE, TWO], says: "You multiplied where the operation needed undoing by dividing. Look at what is being done to x on that line.", points: "the last line" },
  { id: "added-not-subtracted", topics: [ONE, TWO], says: "The same operation was done again instead of being undone. Read what is attached to x and ask what reverses it.", points: "the first line of working" },
  { id: "one-side-only", topics: [ONE, TWO, BOTH], says: "The step was done to one side and not the other. Whatever you do to one side has to happen to both.", points: "the right-hand side" },
  { id: "arithmetic-slip", topics: [ONE, TWO, BOTH], says: "The method is right but a number came out wrong. Re-do just the arithmetic on that line.", points: "the line you are on" },
  { id: "negative-mishandled", topics: [TWO, BOTH], says: "A negative was dropped somewhere in that step. Track the minus sign through the line.", points: "the line with the negative" },
  { id: "fraction-not-cleared", topics: [TWO, BOTH], says: "The fraction was left in place instead of being undone. Look at what the x is being divided by.", points: "the left-hand side" },
  { id: "answer-not-checked", topics: [ONE, TWO, BOTH], says: "The working stops before the check. Put your value back into the original equation and see whether the two sides agree.", points: "the original equation" },
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

export interface Settled { verdict: "right" | "wrong"; slip?: string; said: string; }

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
 */
export function settle(item: { n: number; question: string }, value: unknown, slipId: unknown, topicId: string): Settled | null {
  const v = cleanValue(value);
  if (evaluate(v, 0) === null) return null;
  return settled(item.n, verify(item.question, v), slipId, topicId);
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
