/**
 * What changed between two versions of a piece (v2 T2, adult plan D3). Pure. Counts only: the TV draws marks from them
 * and never the text (the curtain); the PC page may show the words.
 *
 * Paragraphs and sentences are matched by a longest common subsequence on their normalised text (case and spacing
 * aside). A pair left over at the same place, one removed and one added, is counted as changed.
 */
import { paragraphsOf, splitSentences } from "./essay";

export interface Counts { kept: number; changed: number; added: number; removed: number }
export interface VersionDiff { paragraphs: Counts; sentences: Counts }

const norm = (t: string) => t.toLowerCase().replace(/\s+/g, " ").trim();

/** Kept, changed, added and removed between two lists, by LCS on equal items; leftover pairs between matches are "changed". */
export function countDiff(a: string[], b: string[]): Counts {
  const A = a.map(norm), B = b.map(norm), n = A.length, m = B.length;
  const L: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out: Counts = { kept: 0, changed: 0, added: 0, removed: 0 };
  let i = 0, j = 0, gapA = 0, gapB = 0;
  const flush = () => { const c = Math.min(gapA, gapB); out.changed += c; out.removed += gapA - c; out.added += gapB - c; gapA = gapB = 0; };
  while (i < n && j < m) {
    if (A[i] === B[j]) { flush(); out.kept++; i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) { gapA++; i++; } else { gapB++; j++; }
  }
  gapA += n - i; gapB += m - j; flush();
  return out;
}

export function versionDiff(before: string, after: string): VersionDiff {
  return {
    paragraphs: countDiff(paragraphsOf(before), paragraphsOf(after)),
    sentences: countDiff(splitSentences(before).map((s) => s.text), splitSentences(after).map((s) => s.text)),
  };
}
