/**
 * A scene the learner pitched (v2 L3, adult plan A1): kept on the learner record as a scene contract in the plan
 * topic's shape, so the conversation can start it as it starts a plan topic. Pure: safe on the TV, the phone and in
 * tests.
 *
 * - Adult mode only: the pitch door and the action exist only where modeOf says "adult" (lib/rules/mode.ts), and
 *   pitches are offered as scenes only there (curriculum.ts eligibleScenes), so a profile moved back to Family never
 *   sees one.
 * - Every pitch passes cleanTopic on the way in and on load, so the audience gate (gate.ts) reads its words each time.
 * - Kept newest last and capped: the newest PITCHES_CAP stay.
 */
import { audienceOf } from "./gate";
import { cleanTopic } from "./placement";
import type { Audience, EnglishLearning, EnglishScene, PlanTopic } from "./types";

/** The premise the learner types, at most this long (the adult plan's 400, as a topic in the learner's own words). */
export const PITCH_MAX = 400;
/** How many pitched scenes the record keeps. */
export const PITCHES_CAP = 12;
export const PITCH_PREFIX = "pitch-";
export const isPitchId = (id: string) => id.startsWith(PITCH_PREFIX);

/** The pitches on disk, cleaned: a pitch id, a topic cleanTopic keeps (a never-list one is dropped), the newest 12. */
export function cleanPitches(value: unknown): PlanTopic[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.map(cleanTopic).filter((t): t is PlanTopic => !!t && isPitchId(t.id) && !seen.has(t.id) && !!seen.add(t.id)).slice(-PITCHES_CAP);
}

/** The record with one more pitch: the newest last, a pitch with the same id replaced, the oldest past the cap dropped. */
export function keepPitch(l: EnglishLearning, t: PlanTopic): EnglishLearning {
  return { ...l, pitches: [...(l.pitches ?? []).filter(x => x.id !== t.id), t].slice(-PITCHES_CAP) };
}

/** The pitched scenes, newest first, as scenes the conversation can run. */
export function pitchScenes(l?: EnglishLearning | null): EnglishScene[] {
  return [...(l?.pitches ?? [])].reverse().map(t => ({ id: t.id, name: t.title, goal: t.goal, partner: t.partner, skill: t.skill, audience: t.audience, minutes: "8–10", premise: t.premise, cue: t.cue, quiz: t.quiz }));
}

/**
 * The shaping call's answer as a pitched scene, or null to refuse it. Its first topic passes cleanTopic (the topic's
 * own words gated, a never-list topic dropped), then the learner's premise is gated beside the label: the stricter
 * wins, and null refuses. Unlike plan-add, a never-list premise here is never carried as "adult". Last, the audience
 * this learner may practise (`allowed`, curriculum.ts audienceAllowed); anything else is refused, never toned down.
 */
export function shapePitch(json: Record<string, unknown>, premise: string, id: string, allowed: (a: Audience) => boolean): PlanTopic | null {
  const first = Array.isArray(json.topics) ? json.topics[0] : undefined;
  const t = cleanTopic(first && typeof first === "object" && !Array.isArray(first) ? { ...first, id } : null);
  const audience = t && audienceOf(premise, t.audience);
  return t && audience && allowed(audience) ? { ...t, audience } : null;
}
