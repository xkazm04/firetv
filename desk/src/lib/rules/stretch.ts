/**
 * How hard a school set is, decided by CODE (Family W8): the baseline mix of tier-1 and tier-2 items for a learner, and
 * "a step up", one rung harder. Pure; nothing here reads a model's number, and nothing here is a reward in itself: a
 * step-up set only changes which tiers the generator is asked for, and what it earns is a picture - a second ink line
 * on the unit's groove once the step-up record latches (lib/session/learners.ts `stretch`) - never a number.
 *
 * The tiers are the generators' own (rules/school gen(seed, tier)): tier 1 is the unit's plain case, tier 2 the case
 * that needs one more idea (a common bottom that is not a multiple, a unit to carry, a percent not built from ten...).
 * A mix is how many of each a set of six holds:
 *
 *   rung       tier 1  tier 2   when
 *   easier        4       2     the baseline for a learner whose school year is BEFORE the unit's year in their system
 *   standard      3       3     the baseline for a learner at or past the unit's year, and for anyone whose year is
 *                                unknown (no age, or not at school): the mix every set had before W8
 *   harder        2       4     a step up from standard
 *
 * A step up is always the next rung above the learner's baseline (easier -> standard, standard -> harder), so a step-up
 * set is strictly harder than the baseline set for the same learner on the same unit: more tier-2 items, the same
 * content, the same six distinct questions. The learner's school year is read from their age and system
 * (library/syllabus `schoolYear`, the rule behind the SCHOOL tick); the unit's year is its syllabus year in that system.
 *
 * Unmeasured: the rungs are set by rule and tuned after live evenings (docs/FAMILY-PHASE-1-PLAN.md "Stance check").
 */
import type { SchoolSystem } from "@/lib/session/store";
import { SYSTEM_START, schoolYear, topic as syllabusTopic } from "@/lib/library/syllabus";

export type Mix = "easier" | "standard" | "harder";
/** The rungs, easiest first. */
export const MIXES: readonly Mix[] = ["easier", "standard", "harder"];

/**
 * The baseline rung for a learner in school year `learnerYear` on a unit met in year `unitYear` (both in the learner's own
 * system): "easier" when the unit is ahead of them (learnerYear < unitYear), else "standard". Either year unknown (not a
 * finite number) is "standard". Never "harder": harder is only ever asked for, as a step up.
 */
export function baselineMix(unitYear: number | undefined, learnerYear: number | undefined): Mix {
  if (!Number.isFinite(unitYear) || !Number.isFinite(learnerYear)) return "standard";
  return (learnerYear as number) < (unitYear as number) ? "easier" : "standard";
}

/** A step up: the next rung above `base` (the top rung stays the top rung; no baseline is ever the top rung). */
export function stepUpMix(base: Mix): Mix {
  return MIXES[Math.min(MIXES.length - 1, MIXES.indexOf(base) + 1)] ?? "harder";
}

/**
 * How many tier-1 and tier-2 items a set of `n` holds at a rung: standard is the first half rounded up at tier 1 (three
 * and three for six, as every set before W8), easier one more at tier 1, harder one fewer - within 0..n.
 */
export function tierCounts(mix: Mix, n = 6): { tier1: number; tier2: number } {
  const size = Math.max(0, Math.floor(n));
  const shift = mix === "easier" ? 1 : mix === "harder" ? -1 : 0;
  const tier1 = Math.max(0, Math.min(size, Math.ceil(size / 2) + shift));
  return { tier1, tier2: size - tier1 };
}

/** Who the set is for, as the profile at the desk says: an age only for a learner at school, a system (UK when none). */
export interface MixFor { age?: number; system?: SchoolSystem }

/**
 * The learner's school year in their system, or undefined when the desk cannot say (no age, or a system it does not know).
 */
export function learnerYear(who: MixFor): number | undefined {
  const sys = who.system ?? "uk";
  if (typeof who.age !== "number" || !Number.isFinite(who.age) || !(sys in SYSTEM_START)) return undefined;
  return schoolYear(sys, who.age);
}

/**
 * The rung a set on `topicId` is written at for this learner: the baseline from the unit's year and the learner's, or a
 * step up from it when `stretch`. A topic with no school year (not a school unit) is at the standard baseline.
 */
export function setMix(topicId: string, who: MixFor, stretch: boolean): Mix {
  const sys = who.system ?? "uk";
  const t = syllabusTopic(topicId);
  const base = baselineMix(t?.year?.[sys], learnerYear(who));
  return stretch ? stepUpMix(base) : base;
}
