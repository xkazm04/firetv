/**
 * The checkers' one expected failure, and the door for every other one. A parser throws Unreadable when the learner's
 * text is not something it reads: that is a verdict about the text, and the caller turns it into "unsure" or no check.
 * Anything else a checker throws (a TypeError, a RangeError out of its own arithmetic) is a desk defect: the learner
 * still gets the same cautious verdict, and the operator learns of it here, once per site and message (error-handling:
 * the class that must never fire is a bug report, never a quiet "your answer is unreadable").
 */
export class Unreadable extends Error {}

const told = new Set<string>();
export function checkerFault(where: string, e: unknown): void {
  if (e instanceof Unreadable) return;
  const line = `${where}: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`;
  if (told.has(line)) return;
  told.add(line);
  console.error(`[rules] checker fault in ${line}`);
}
