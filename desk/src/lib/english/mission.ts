/**
 * A scene's mission: two or three steps, reached by the learner's own replies. The model proposes a step claim, code
 * decides (exact quote of the reply, in order, one step per reply). A step writes no evidence and touches no credit;
 * it lives in the session's conversation only. Pure data, no React and no filesystem.
 */
import type { EnglishScene, Mission } from "./types";

export const STEP_MAX = 48, STEPS_MIN = 2, STEPS_MAX = 3;

const wordsIn = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
/** 2-3 steps, each a non-empty string of at most STEP_MAX characters; else null. */
function validSteps(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length < STEPS_MIN || value.length > STEPS_MAX) return null;
  const steps = value.map(x => typeof x === "string" ? x.trim() : "");
  return steps.every(x => x && x.length <= STEP_MAX) ? steps : null;
}
/** The scene's authored steps, else the opening's generated steps if they pass, else no mission. */
export function missionOf(scene: Pick<EnglishScene, "steps">, generated?: unknown): Mission | null {
  const steps = scene.steps?.length ? scene.steps : validSteps(generated);
  return steps ? { steps: [...steps], reached: [] } : null;
}
export function missionDone(m: Mission): boolean { return m.reached.length >= m.steps.length; }
/** The step the learner is on, or null when the mission is done. */
export function currentStep(m: Mission): string | null { return missionDone(m) ? null : m.steps[m.reached.length]; }
/**
 * Accept a claim that the current step was reached by `reply`: only for the current step, only on a quote that is in the
 * reply and has at least two words, one step per reply, nothing after the last step. Anything else returns the mission as it was.
 */
export function applyStep(m: Mission, claim: unknown, reply: string, turnId: string): Mission {
  if (missionDone(m) || m.reached.some(r => r.turnId === turnId)) return m;
  const o = claim && typeof claim === "object" ? claim as Record<string, unknown> : {};
  const quote = typeof o.quote === "string" ? o.quote.trim() : "";
  if (o.reached !== true || wordsIn(quote) < 2 || !reply.includes(quote)) return m;
  return { ...m, reached: [...m.reached, { turnId, quote }] };
}
