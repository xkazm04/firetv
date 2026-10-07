/**
 * A marked practice item as the Lamplight paper draws it: the learner's working as lines, a tick on the lines
 * the marking vouches for, and where the desk's pen goes. Pure and types-only from the store, so the maths
 * type test runs it in node.
 *
 * The pen goes only where the data puts it, most specific first:
 *   1. `slipAt` - rules/maths located the slip on the server: the first line of the learner's working that stops
 *      holding at the question's root, and the one sign to ring when a single flip is the whole mistake. The lines
 *      before it that read as arithmetic held at that root, so they are ticked. On a Calculus item the pen is the first
 *      line the chain checker rings (rules/chain) and a line before it is ticked only where the chain says it holds;
 *   2. `answer-not-checked` opens a gap after the last line, where the check belongs;
 *   3. otherwise the verdict alone: the answer line is what the desk knows is wrong, so that line is marked and
 *      nothing else is claimed. The rulebook's prose (`points`) never places the pen or earns a tick.
 * A right item ticks its answer line (the substitution checked the value, not each line); an unsure one is
 * drawn without a mark.
 */
import type { PracticeItem } from "@/lib/session/store";
import { chainChecks } from "@/lib/rules/chain";
import { isCalcSpec, readsAsArithmetic, workingLines } from "@/lib/rules/maths";
import type { ErrorKind, LineMarkSpec } from "./typeset";

/** The line split is one rule in rules/maths, so the server's `slipAt.line` and the paper's lines are the same lines. */
export { workingLines };

export type Placed = "slipAt" | "check" | "answer";
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

export function working(it: PracticeItem): Working {
  const lines = workingLines(it), n = lines.length;
  const ticks = lines.map(() => false);
  const none: Working = { lines, at: null, mark: null, ticks, placed: null };
  if (!n) return none;
  if (it.verdict === "right") { ticks[n - 1] = true; return none; }
  if (it.verdict !== "wrong") return none;
  const at = it.slipAt;
  if (at && at.line < n) {
    // a Calculus line is ticked only where the chain checker (rules/chain, the server's own rule) says it holds; a line it
    // cannot tell stays bare. The school and linear lines tick as they always did.
    const held = isCalcSpec(it.spec) ? chainChecks(it.spec, lines) : null;
    for (let k = 0; k < at.line; k++) ticks[k] = held ? held[k] === true : readsAsArithmetic(lines[k]);
    // the occurrence rides with the span, so a sign written twice on the line is ringed where the server found it
    const mark: LineMarkSpec = at.kind && at.span ? { kind: at.kind, span: at.span, ...(at.nth !== undefined ? { nth: at.nth } : {}) } : { kind: "line" };
    return { lines, at: at.line, mark, ticks, placed: "slipAt" };
  }
  if (it.slip === "answer-not-checked") return { lines, at: n - 1, mark: { kind: "missing", span: lines[n - 1] }, ticks, placed: "check" };
  return { lines, at: n - 1, mark: { kind: "line" }, ticks, placed: "answer" };
}

/**
 * The taped card's pointer on a wrong item, agreeing with the pen: where the data placed the pen the card points at
 * it; otherwise the rulebook's place in words. Nothing on a right or unsure item.
 */
export function lookAt(it: PracticeItem, points?: string): string | null {
  if (it.verdict !== "wrong") return null;
  if (working(it).placed === "slipAt") return "Look where the pen is.";
  return points ? `Look at ${points}.` : null;
}

/** The kicker word for a mark: the same grammar the sheet draws, named once beside it. */
export const KIND_WORD: Record<ErrorKind | "line", string> = { missing: "Missing", sign: "Wrong sign", extra: "Not allowed", line: "Look again" };
