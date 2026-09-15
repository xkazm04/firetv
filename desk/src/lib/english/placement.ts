/**
 * The level check's ladder, and the shapes it leaves behind. Pure: safe on the TV, the phone and in tests.
 *
 * The tutor writes and judges each task; this file decides which band comes next and where the
 * learner stands. Same marks in, same band out.
 */
import { BANDS, type Band, type EvidenceMode, type Placement, type PlacementTask, type Plan, type PlanTopic, type SkillId, type TaskKind, type TaskVerdict, type Taught } from "./types";

export const MAX_TASKS = 5;
export const ABOUT_QUESTIONS = 3;
export const PLAN_SIZE = 6;
export const PLAN_MAX = 8;
export const TAUGHT_CAP = 60;
/** A topic in the learner's own words. The first LT run refused five real requests at 160 characters. */
export const TOPIC_ASK_MAX = 400;
/** The level check's first question: the same for everyone, so it is written here, not generated — no wait, nothing to fail. */
export const firstQuestion = (name: string) => `Hi ${name}! You can answer in English or in your own language. Where do you use English in your life?`;

export const BAND_NAME: Record<Band, string> = { A1: "First words", A2: "Everyday basics", B1: "Getting by", B2: "Comfortable", C1: "Fluent", C2: "Near-native" };
/** What a learner at each band can do, in the learner's words. */
export const BAND_CAN: Record<Band, string> = {
  A1: "You understand and use familiar everyday words and very simple phrases.",
  A2: "You handle short, routine exchanges about familiar things.",
  B1: "You get by in most everyday situations and can give reasons and opinions.",
  B2: "You talk with some ease on a wide range of topics, including less familiar ones.",
  C1: "You express ideas fluently and flexibly, with little searching for words.",
  C2: "You understand almost everything and can express fine shades of meaning.",
};
/** How the tutor pitches its English at each band. Written for the model, never shown. */
export const BAND_TUTOR: Record<Band, string> = {
  A1: "A1: very common words, present simple, one short question at a time, concrete things the learner can see or does every day. Accept single words and gestures of meaning.",
  A2: "A2: short everyday sentences on familiar topics (family, school, shopping, free time), simple past and future with going to, one question at a time.",
  B1: "B1: connected everyday talk, reasons and opinions, past experiences and plans, some less common words made clear by context.",
  B2: "B2: natural pace, less familiar and some abstract topics, follow-up questions, comparisons and hypotheticals, a wider range of vocabulary.",
  C1: "C1: nuanced and idiomatic, implicit meaning, flexible register, complex structures used naturally.",
  C2: "C2: subtle shades of meaning, humour and irony, precise register, anything a well-read speaker would say.",
};

/**
 * What the English itself shows at each band: control and range, not ideas. Written for the judge, never shown.
 * The first scenario runs passed a fluent A2 at B2 because the argument was clear; these are why that stops.
 */
export const BAND_JUDGE: Record<Band, string> = {
  A1: "isolated words and memorised phrases; almost no sentence grammar of their own.",
  A2: "simple sentences that get meaning across, with systematic basic errors: verb forms and agreement ('films is', 'he go'), missing auxiliaries or articles ('I no practice', 'is good for learn'), double comparatives ('more better'). Length, fluency and good ideas do not lift English with these errors above A2.",
  B1: "connected sentences; basic grammar mostly controlled (present and past, auxiliaries, agreement, questions); errors appear in more complex structures; vocabulary enough for familiar topics, strained on abstract ones.",
  B2: "good control: no systematic basic errors, occasional slips that never blur meaning; complex sentences, comparisons and hypotheticals used correctly; range for opinions and less familiar topics.",
  C1: "consistently accurate; complex structures used flexibly; idiomatic, precise vocabulary; register adjusted to the situation.",
  C2: "near-flawless; subtle shades of meaning, precise idiom and register.",
};

export const isBand = (x: unknown): x is Band => BANDS.includes(x as Band);
export const shift = (band: Band, by: number): Band => BANDS[Math.min(BANDS.length - 1, Math.max(0, BANDS.indexOf(band) + by))];
export const easyBand = (band: Band) => BANDS.indexOf(band) <= 1;

/** One band below what the learner told us, so the first task is one they can meet. */
export function startBand(self: Band | null): Band { return self ? shift(self, -1) : "A2"; }

/** Choosing only where a spoken answer may not come; above B1 every task asks the learner to say something. */
export function kindFor(band: Band, before: Array<{ band: Band; kind: TaskKind }>): TaskKind {
  const i = BANDS.indexOf(band);
  const cycle: TaskKind[] = i <= 1 ? ["choose", "listen", "say"] : i === 2 ? ["listen", "say"] : ["say"];
  return cycle[before.filter(t => t.band === band).length % cycle.length];
}

/**
 * The judge says whether the task was done and which band the English shows; this decides pass, partial or fail.
 * Speaking: English at the task's band passes, one below is partial, lower fails. Listening: understanding decides,
 * but an answer without English, or a line read instead of heard above A2, is at most partial.
 */
export function verdictFor(task: { kind: TaskKind; band: Band; revealed?: boolean }, answered: "yes" | "partly" | "no", english: Band | "none"): TaskVerdict {
  if (answered === "no") return "fail";
  if (task.kind === "listen") {
    const capped = english === "none" || (task.revealed && BANDS.indexOf(task.band) > 1);
    return answered === "yes" && !capped ? "pass" : "partial";
  }
  if (english === "none") return "fail";
  const gap = BANDS.indexOf(task.band) - BANDS.indexOf(english);
  const verdict: TaskVerdict = gap <= 0 ? "pass" : gap === 1 ? "partial" : "fail";
  return answered === "partly" && verdict === "pass" ? "partial" : verdict;
}

export interface Mark { band: Band; verdict: TaskVerdict; }
const count = (marks: Mark[], band: Band, verdict: TaskVerdict) => marks.filter(m => m.band === band && m.verdict === verdict).length;

/**
 * Pass goes up a band, fail goes down, partial stays. The check stops at five tasks, at two failures
 * on A1, or once a band holds two passes with two failures above it (or C2 holds two passes).
 * The band is the highest one with more passes than failures; with none, one below the lowest band tried.
 */
export function staircase(start: Band, marks: Mark[]): { done: boolean; next: Band; band: Band; confidence: Placement["confidence"] } {
  const last = marks.at(-1);
  const next = last ? shift(last.band, last.verdict === "pass" ? 1 : last.verdict === "fail" ? -1 : 0) : start;
  const bracketed = BANDS.some((b, i) => count(marks, b, "pass") >= 2 && (i === BANDS.length - 1 || count(marks, BANDS[i + 1], "fail") >= 2));
  const floored = count(marks, "A1", "fail") >= 2;
  const done = marks.length >= MAX_TASKS || bracketed || floored;
  const held = BANDS.filter(b => count(marks, b, "pass") > count(marks, b, "fail"));
  const lowest = marks.length ? BANDS[Math.min(...marks.map(m => BANDS.indexOf(m.band)))] : start;
  const band = held.length ? held[held.length - 1] : shift(lowest, -1);
  // a pass above a failure means the answers disagree with each other
  const scattered = marks.some(a => a.verdict === "pass" && marks.some(b => b.verdict === "fail" && BANDS.indexOf(b.band) < BANDS.indexOf(a.band)));
  const ceiling = band === "C2" || count(marks, shift(band, 1), "fail") > 0;
  const confidence = scattered ? "low" : bracketed || floored || (count(marks, band, "pass") >= 2 && ceiling) ? "high" : "medium";
  return { done, next, band, confidence };
}

// ---- what survives a trip to disk ----
const obj = (v: unknown): Record<string, unknown> => v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
const text = (v: unknown, max: number) => typeof v === "string" && v.length <= max;
const SKILLS: SkillId[] = ["contact", "repair", "request", "describe", "narrate", "negotiate", "relate", "resolve"];
const KINDS: TaskKind[] = ["say", "listen", "choose"];
const VERDICTS: TaskVerdict[] = ["pass", "partial", "fail"];
const MODES: EvidenceMode[] = ["speech", "text", "choice"];

function cleanTask(value: unknown): PlacementTask | null {
  const t = obj(value);
  if (!text(t.id, 100) || !isBand(t.band) || !KINDS.includes(t.kind as TaskKind) || !VERDICTS.includes(t.verdict as TaskVerdict) || !MODES.includes(t.mode as EvidenceMode)) return null;
  if (!text(t.prompt, 400) || !text(t.line, 400) || !text(t.response, 1200) || !text(t.quote, 400) || !text(t.note, 400) || typeof t.at !== "number") return null;
  const options = Array.isArray(t.options) ? t.options.filter((o): o is string => text(o, 200)).slice(0, 2) : [];
  return { id: t.id as string, band: t.band, kind: t.kind as TaskKind, prompt: t.prompt as string, line: t.line as string, options, response: t.response as string, mode: t.mode as EvidenceMode, verdict: t.verdict as TaskVerdict, quote: t.quote as string, note: t.note as string, at: t.at };
}
export function cleanPlacement(value: unknown): Placement | null {
  const p = obj(value);
  if (!isBand(p.band) || typeof p.at !== "number" || !["low", "medium", "high"].includes(String(p.confidence)) || !["check", "self"].includes(String(p.source))) return null;
  if (!text(p.summary, 400) || !text(p.focus, 400)) return null;
  const tasks = Array.isArray(p.tasks) ? p.tasks.map(cleanTask).filter((t): t is PlacementTask => !!t).slice(0, MAX_TASKS) : [];
  return { at: p.at, band: p.band, selfBand: isBand(p.selfBand) ? p.selfBand : null, confidence: p.confidence as Placement["confidence"], source: p.source as Placement["source"], summary: p.summary as string, focus: p.focus as string, tasks };
}
export function cleanTopic(value: unknown): PlanTopic | null {
  const t = obj(value), q = obj(t.quiz);
  if (!text(t.id, 100) || !SKILLS.includes(t.skill as SkillId) || !["all", "school", "older", "adult"].includes(String(t.audience))) return null;
  for (const [key, max] of [["title", 70], ["goal", 160], ["why", 160], ["partner", 60], ["premise", 600], ["cue", 160]] as const) if (!text(t[key], max) || !(t[key] as string).trim()) return null;
  if (!text(q.question, 160) || !Array.isArray(q.options) || q.options.length !== 2 || !q.options.every(o => text(o, 160)) || ![0, 1].includes(q.correct as number)) return null;
  return { id: t.id as string, title: t.title as string, goal: t.goal as string, why: t.why as string, skill: t.skill as SkillId, audience: t.audience as PlanTopic["audience"], partner: t.partner as string, premise: t.premise as string, cue: t.cue as string, quiz: { question: q.question as string, options: [q.options[0] as string, q.options[1] as string], correct: q.correct as number } };
}
export function cleanPlan(value: unknown): Plan | null {
  const p = obj(value);
  if (!isBand(p.band) || typeof p.at !== "number" || !Array.isArray(p.topics)) return null;
  const topics = p.topics.map(cleanTopic).filter((t): t is PlanTopic => !!t).slice(0, PLAN_MAX);
  return topics.length ? { at: p.at, band: p.band, topics } : null;
}
export function cleanTaught(value: unknown): Taught[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(v => {
    const m = obj(v);
    if (!["fix", "word"].includes(String(m.kind)) || !text(m.id, 200) || !text(m.said, 240) || !text(m.better, 240) || !text(m.why, 240) || !text(m.turnId, 200) || !text(m.sceneId, 100) || !text(m.title, 100) || typeof m.at !== "number") return [];
    return [{ id: m.id as string, kind: m.kind as Taught["kind"], said: m.said as string, better: m.better as string, why: m.why as string, turnId: m.turnId as string, sceneId: m.sceneId as string, title: m.title as string, at: m.at }];
  }).slice(-TAUGHT_CAP);
}
