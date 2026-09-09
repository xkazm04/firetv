import { ENGLISH_SKILLS, PROGRESS_ORDER } from "./curriculum";
import { emptyEnglish, type EnglishEvidence, type EnglishLearning, type EnglishPreferences, type Progress, type SkillId } from "./types";

const obj = (v: unknown): Record<string, unknown> => v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
const isSkill = (id: unknown): id is SkillId => ENGLISH_SKILLS.some(s => s.id === id);
export function parsePreferences(value: unknown): EnglishPreferences {
  const v = obj(value);
  if (!["beginner", "developing", "confident"].includes(String(v.level)) || !["familiar", "playful", "surprising"].includes(String(v.creativity)) || !["supportive", "realistic", "stretch"].includes(String(v.challenge)) || !["pauses", "as-needed"].includes(String(v.correction)) || typeof v.adultConfirmed !== "boolean") throw new Error("Choose the learning preferences again.");
  for (const key of ["interest", "goal"]) if (typeof v[key] !== "string" || (v[key] as string).length > 160) throw new Error("Keep interests and goals under 160 characters.");
  return { level: v.level, creativity: v.creativity, challenge: v.challenge, correction: v.correction, adultConfirmed: v.adultConfirmed, interest: (v.interest as string).trim(), goal: (v.goal as string).trim() } as EnglishPreferences;
}
/** Strict enough to discard corrupt entries; never infer speech from a missing modality. */
export function cleanEnglish(value: unknown): EnglishLearning {
  const v = obj(value), result = emptyEnglish();
  try { result.preferences = parsePreferences(v.preferences); } catch { /* old learner: no setup yet */ }
  result.notes = Array.isArray(v.notes) ? v.notes.filter((n): n is string => typeof n === "string").map(n=>n.slice(0,240)).slice(0,8) : [];
  result.evidence = Array.isArray(v.evidence) ? v.evidence.filter((e): e is EnglishEvidence => { const x=obj(e); return isSkill(x.skill) && typeof x.id === "string" && typeof x.episodeId === "string" && typeof x.turnId === "string" && typeof x.sceneId === "string" && typeof x.at === "number" && Number.isFinite(x.at) && ["speech","text","choice"].includes(String(x.mode)) && typeof x.supported === "boolean" && typeof x.success === "boolean" && typeof x.quote === "string" && typeof x.note === "string"; }).slice(-400) : [];
  for (const [key, val] of Object.entries(obj(v.achievements))) if (isSkill(key) && PROGRESS_ORDER.includes(val as Progress)) result.achievements[key] = val as Progress;
  result.sessions = Array.isArray(v.sessions) ? v.sessions.filter((s): s is EnglishLearning["sessions"][number] => {const x=obj(s);return typeof x.id === "string" && typeof x.sceneId === "string" && typeof x.title === "string" && typeof x.at === "number" && typeof x.turns === "number";}).slice(-30) : [];
  return result;
}
export function evidenceProgress(evidence: EnglishEvidence[], skill: SkillId): Progress {
  const spoken = evidence.filter(e=>e.skill===skill && e.mode==="speech" && e.success);
  const independent = spoken.filter(e=>!e.supported);
  if (independent.length >= 3 && new Set(independent.map(e=>e.episodeId)).size >= 2 && new Set(independent.map(e=>e.sceneId)).size >= 2) return "transfer";
  if (independent.length >= 2) return "independent";
  return spoken.length ? "with-help" : "not-tried";
}
export function mergeEvidence(learning: EnglishLearning, entries: EnglishEvidence[]): EnglishLearning {
  const ids=new Set(learning.evidence.map(e=>e.id));
  const evidence=[...learning.evidence, ...entries.filter(e=>!ids.has(e.id) && !!ids.add(e.id))].slice(-400);
  const achievements={...learning.achievements};
  for(const skill of ENGLISH_SKILLS){const before=achievements[skill.id]??"not-tried",now=evidenceProgress(evidence,skill.id);achievements[skill.id]=PROGRESS_ORDER[Math.max(PROGRESS_ORDER.indexOf(before),PROGRESS_ORDER.indexOf(now))];}
  return {...learning,evidence,achievements};
}
/** Model assertions must refer to this exact submitted response and an allowed ability. */
export function validateObservations(value: unknown, context: Omit<EnglishEvidence,"id"|"skill"|"success"|"quote"|"note"> & { text: string; skills: SkillId[] }): EnglishEvidence[] {
  if(!Array.isArray(value))return [];
  const seen=new Set<string>();
  return value.slice(0,2).flatMap(item=>{const e=obj(item);if(!isSkill(e.skill)||!context.skills.includes(e.skill)||seen.has(e.skill)||e.confidence!=="clear"||typeof e.success!=="boolean"||typeof e.quote!=="string"||!e.quote.trim()||!context.text.includes(e.quote)||e.quote.length>240||typeof e.note!=="string"||e.note.length>180)return [];seen.add(e.skill);return [{id:`${context.turnId}:${e.skill}`,episodeId:context.episodeId,turnId:context.turnId,sceneId:context.sceneId,at:context.at,mode:context.mode,supported:context.supported,skill:e.skill,success:e.success,quote:e.quote,note:e.note}];});
}
