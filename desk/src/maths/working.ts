/**
 * A marked practice item as the Lamplight paper draws it: the learner's working as lines, a tick on the lines
 * the marking vouches for, and where the desk's pen goes. Pure and types-only from the store, so the maths
 * type test runs it in node.
 *
 * The pen goes only where the data puts it, most specific first:
 *   1. `slipAt` - the marker named the line, the part of it and the kind (a sign, a missing part, an extra part);
 *   2. the slip's rulebook `points` when it names a line ("the second line", "the last line") - the whole line
 *      is marked and the lines before it are ticked, because the rulebook says the slip starts there;
 *      `answer-not-checked` opens a gap after the last line, where the check belongs;
 *   3. otherwise the verdict alone: the answer line is what the desk knows is wrong, so that line is marked and
 *      nothing else is claimed.
 * A right item ticks its answer line (the substitution checked the value, not each line); an unsure one is
 * drawn without a mark.
 */
import type { PracticeItem } from "@/lib/session/store";
import type { ErrorKind, LineMarkSpec } from "./typeset";

/** The learner's working, one line per step: the transcription's own line breaks, `;` and arrows between steps. */
export function workingLines(it: Pick<PracticeItem, "studentWorking" | "studentAnswer">): string[] {
  const w = (it.studentWorking ?? "").trim();
  const lines = w ? w.split(/\r?\n|;\s*|\s+(?:→|⇒|=>|->)\s+/).map((l) => l.trim()).filter(Boolean) : [];
  if (lines.length) return lines;
  const a = (it.studentAnswer ?? "").trim();
  if (!a) return [];
  // the marker cleans "x = " off a value; a bare value is a value of x, as every question on the path asks
  return [/[=a-zA-Z]/.test(a) ? a : `x = ${a}`];
}

/** The line a rulebook `points` names, or null when it names a place rather than a line. */
export function lineOfPoints(points: string | undefined, n: number): number | null {
  if (!points || n <= 0) return null;
  const p = points.toLowerCase();
  if (/\blast line\b/.test(p)) return n - 1;
  const ord = ["first", "second", "third", "fourth", "fifth", "sixth"].findIndex((w) => new RegExp(`\\b${w} line\\b`).test(p));
  if (ord < 0) return null;
  return ord < n ? ord : null;
}

export type Placed = "slipAt" | "points" | "answer";
export interface Working {
  lines: string[];
  /** The line the pen is on, or null. */
  at: number | null;
  /** The mark inside that line. */
  mark: LineMarkSpec | null;
  /** A tick after each line the marking vouches for. */
  ticks: boolean[];
  /** How the pen was placed - the design doc's three steps. */
  placed: Placed | null;
}

export function working(it: PracticeItem, points?: string): Working {
  const lines = workingLines(it), n = lines.length;
  const ticks = lines.map(() => false);
  const none: Working = { lines, at: null, mark: null, ticks, placed: null };
  if (!n) return none;
  if (it.verdict === "right") { ticks[n - 1] = true; return none; }
  if (it.verdict !== "wrong") return none;
  const at = it.slipAt;
  if (at && at.line < n) {
    for (let k = 0; k < at.line; k++) ticks[k] = true;
    return { lines, at: at.line, mark: at.kind && at.span ? { kind: at.kind, span: at.span } : { kind: "line" }, ticks, placed: "slipAt" };
  }
  if (it.slip === "answer-not-checked") return { lines, at: n - 1, mark: { kind: "missing", span: lines[n - 1] }, ticks, placed: "points" };
  const line = lineOfPoints(points, n);
  if (line !== null) {
    for (let k = 0; k < line; k++) ticks[k] = true;
    return { lines, at: line, mark: { kind: "line" }, ticks, placed: "points" };
  }
  return { lines, at: n - 1, mark: { kind: "line" }, ticks, placed: "answer" };
}

/** The kicker word for a mark: the same grammar the sheet draws, named once beside it. */
export const KIND_WORD: Record<ErrorKind | "line", string> = { missing: "Missing", sign: "Wrong sign", extra: "Not allowed", line: "Look again" };
