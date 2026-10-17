/**
 * A rewrite the desk accepted goes back into the phone's own paragraphs, so the next "Read the whole piece" and
 * the next keep carry it. Only when the original sentence appears exactly once across the paragraphs: a guess
 * could change the wrong sentence, so anything else is left as typed and the learner is told plainly.
 */
export const REWRITE_STAYS_ON_DESK = "That rewrite stays on the desk. Reading the whole piece again uses the text as typed here.";

/** The line above the read button while rewrites remain unwritten (n >= 1). */
export const rewriteStaysLine = (n: number): string =>
  n > 1 ? `${n} rewrites stay on the desk. Reading the whole piece again uses the text as typed here.` : REWRITE_STAYS_ON_DESK;

export type RewriteBack = { paras: string[]; written: boolean; line: string };

const occurrences = (hay: string, needle: string): number => { let n = 0, at = hay.indexOf(needle); while (at >= 0) { n++; at = hay.indexOf(needle, at + needle.length); } return n; };

/** Replace `original` by `rewritten` in the one paragraph that holds it, once. `line` is "" unless it stays on the desk. */
export function writeRewriteBack(paras: string[], original: string, rewritten: string): RewriteBack {
  if (rewritten === original) return { paras, written: true, line: "" }; // nothing changed: nothing to carry
  if (!original) return { paras, written: false, line: REWRITE_STAYS_ON_DESK };
  const counts = paras.map((p) => occurrences(p, original)), total = counts.reduce((a, b) => a + b, 0);
  if (total !== 1) return { paras, written: false, line: REWRITE_STAYS_ON_DESK };
  const at = counts.indexOf(1), p = paras[at], i = p.indexOf(original);
  const next = paras.slice(); next[at] = p.slice(0, i) + rewritten + p.slice(i + original.length);
  return { paras: next, written: true, line: "" };
}
