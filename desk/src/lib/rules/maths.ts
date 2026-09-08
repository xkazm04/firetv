/**
 * The slip vocabulary for linear equations, decided in code.
 *
 * Same discipline as rules/english.ts: the table is the closed set the model is allowed to
 * choose from. It names a mistake and points at a line. It never carries the corrected line,
 * the next step, or the answer — the student produces those, or there was no point asking.
 */
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
