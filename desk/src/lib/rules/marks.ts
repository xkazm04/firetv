/**
 * The marks a marked item reads as, on every screen and in every count - the one authority for the vocabulary
 * (MB-B1). The stored verdict stays three words (session/store PracticeItem: right, wrong, unsure); a mark is read
 * off it here and nowhere else:
 *   - right, wrong: the verdict as it stands;
 *   - skipped: an unsure item with no answer on it. The child left it empty ("Leave one empty if you skipped it"),
 *     so it is not the desk's doubt and not a slip: no ring, no lost tally, and not "all of it right" either;
 *   - unsure: the desk could not decide, or the item carries no verdict at all.
 * Skipped is read, not stored, so an item marked before the mark existed (an unsure item with a blank answer) reads
 * as skipped with no migration, and every flow keyed on the stored verdict (an explanation settling an unsure item,
 * no attempt recorded) treats a skipped item as the unsure one it is. A screen or a count that tells the marks apart
 * keys its table by `Mark` (Record<Mark, ...>), so a fifth mark is a compile error at every table. Pure, no imports.
 */
export type Mark = "right" | "wrong" | "unsure" | "skipped";

/** Every mark, in the order a set is counted and drawn: ticks, slips, the desk's doubt, then what was left empty. */
export const MARKS = ["right", "wrong", "unsure", "skipped"] as const satisfies readonly Mark[];
// the list is total: a mark missing from MARKS makes this type `false` and the line fails to compile
const _total: Exclude<Mark, (typeof MARKS)[number]> extends never ? true : false = true;
void _total;

/** An item as a mark reads it: its stored verdict and what was written as its answer. */
export interface Markable { verdict?: "right" | "wrong" | "unsure"; studentAnswer?: string }

/** The mark an item reads as. Unknown or absent verdicts read as the desk's doubt, never as a slip. */
export function markOf(it: Markable): Mark {
  if (it.verdict === "right" || it.verdict === "wrong") return it.verdict;
  return it.verdict === "unsure" && !(typeof it.studentAnswer === "string" && it.studentAnswer.trim()) ? "skipped" : "unsure";
}

/** How many items of a set read as each mark. */
export function markCounts(items: readonly Markable[]): Record<Mark, number> {
  const c: Record<Mark, number> = { right: 0, wrong: 0, unsure: 0, skipped: 0 };
  for (const it of items) c[markOf(it)]++;
  return c;
}

/**
 * The checkers' plain disagreement (rules/school, rules/calc, rules/calc2 WHY.wrong): a wrong answer with no reason
 * beyond "not what the desk got". A wrong item with no slip and THIS why asks how the learner got there; any other
 * why is a reason, and the desk says it (rules/maths settled). Each engine writes the sentence itself (calc.ts and
 * calc2.ts import only their own leaves: tools/calc2-seam-test); tools/calc-marking-test pins all three equal to this.
 */
export const DISAGREES = "It does not agree with what the desk worked out for itself.";
