/**
 * The Calculus 2 shapes, beside Calculus 1's nine (v2 M3b-3a): the seam. No shape exists yet - CALC2_SHAPES is empty
 * and every function below refuses every spec - so nothing about Calculus 1 moves. Each later slice (docs/concepts/
 * STUDY-DESK-V2-PLAN.md rows 41-46) puts one shape here: its reading of the spec, its truth, its question, its
 * verdict, its leak rule and its slips. rules/calc.ts sends a spec whose shape is in this list to the functions below
 * on the first line of wellFormed, question, checkAnswer, leaksCalc, slipsFor and withheldCalc.
 *
 * The functions keep the signatures of calc.ts's six public ones. They are named with a calc2 prefix because calc.ts
 * imports them; a shape's reader of printed text (specFromQuestion) comes with its own slice.
 *
 * Pure: imports at most calc-expr.ts and calc-read.ts - no engine, no session store,
 * no TV module, no React.
 */

/** The ids of the Calculus 2 shapes. Empty until a shape is built (not calculus2.spine.ts's Calc2Shape: that is a topic's list). */
export type Calc2SpecShape = never;

/** A Calculus 2 spec: a shape and its parameters, never an answer field (as CalcSpec). */
export type Calc2Spec = { shape: Calc2SpecShape };

export const CALC2_SHAPES: readonly Calc2SpecShape[] = [];

/** Is this a Calculus 2 spec by its shape? (Calculus 1 and school shapes share no name with it.) */
export const isCalc2Spec = (spec: unknown): spec is Calc2Spec =>
  !!spec && typeof spec === "object" && (CALC2_SHAPES as readonly unknown[]).includes((spec as { shape?: unknown }).shape);

/** The verdict a Calculus 2 shape gives: the same fields as calc.ts's CalcVerdict. */
export interface Calc2Verdict { verdict: "right" | "wrong" | "unsure"; slip?: string; why: string; }

// The same sentences calc.ts says for a spec the desk cannot judge (WHY.badSpec) and for no shape (WITHHELD_ANY).
const BAD_SPEC = "The desk cannot work this question out for itself, so it does not judge the answer.";
const WITHHELD_ANY = "Go back to the last step you are sure of and take the next. The answer stays yours to find.";
const NO_SHAPE = "The shape is not one of the desk's shapes.";

export function calc2WellFormed(_spec: unknown): { ok: true } | { ok: false; why: string } {
  return { ok: false, why: NO_SHAPE };
}

export function calc2Question(_spec: unknown): { plain: string; tex: string } | null {
  return null;
}

export function calc2CheckAnswer(_spec: unknown, _studentAnswer: unknown): Calc2Verdict {
  return { verdict: "unsure", why: BAD_SPEC };
}

export function calc2LeaksCalc(_spec: unknown, _line: unknown): boolean {
  return false;
}

export function calc2SlipsFor(_shape: unknown): string[] {
  return [];
}

export function calc2Withheld(_spec: unknown): string {
  return WITHHELD_ANY;
}
