/**
 * The Cambridge map (v2 L1; owner decisions 2026-10-07 V2, L1, L2, S3): the Speaking papers of A2 Key for Schools and
 * B1 Preliminary for Schools, as data, each part and each language function mapped onto Linga's eight skills and the
 * authored scenes that practise them. Practice mode only (S3): no simulated examiner, no timing, no score.
 *
 * HONEST LIMITS, read before using this anywhere a learner can see it:
 * - Transcribed by the host from its knowledge of the public specifications (the 2020-format handbooks for teachers),
 *   in the host's own words, not copied. Every entry carries `source` (the handbook and section a person must check it
 *   against) and the table as a whole is `VERIFIED = false` until a person has done that check.
 * - Nothing may print "Cambridge", "Key", "Preliminary" or "mapped to" on a screen while `claimAllowed()` is false: it
 *   needs VERIFIED and the coverage floor of the plan's kill criterion (90% of the A2 Key for Schools descriptors).
 * - "Practised" means a scene exists whose skill covers the function, for the audience asked about. It does not mean a
 *   learner who plays it would pass the paper.
 *
 * A TEACHER OR EXAMINER MUST READ THIS TABLE, as with the band tables (placement.ts, cert.ts).
 */
import type { Audience, SkillId } from "./types";
import { ENGLISH_SCENES } from "./curriculum";

export type Exam = "a2-key-schools" | "b1-preliminary-schools";
export const EXAMS: Record<Exam, { name: string; band: "A2" | "B1"; minutes: string; format: string; source: string }> = {
  "a2-key-schools": { name: "A2 Key for Schools", band: "A2", minutes: "8–10", format: "two candidates, one interlocutor, one assessor", source: "A2 Key for Schools Handbook for Teachers (2020 format), Paper 3 Speaking" },
  "b1-preliminary-schools": { name: "B1 Preliminary for Schools", band: "B1", minutes: "12–17", format: "two candidates, one interlocutor, one assessor", source: "B1 Preliminary for Schools Handbook for Teachers (2020 format), Paper 4 Speaking" },
};
/** Set true only after a person has checked every entry against the handbooks named in `source`. */
export const VERIFIED = false;

/** One part of a Speaking paper, in the host's words. `practice` names the task shape a Linga practice task copies (L2). */
export interface SpeakingPart { exam: Exam; part: number; name: string; minutes: string; what: string; skills: SkillId[]; practice: string; }
export const SPEAKING_PARTS: SpeakingPart[] = [
  { exam: "a2-key-schools", part: 1, name: "Interview", minutes: "3–4",
    what: "The examiner asks each candidate about themselves: name, where they live, school, daily life, likes; then one question asking for a longer answer (\"Tell me something about…\").",
    skills: ["contact", "describe"], practice: "personal questions, answered in a sentence or two, then one longer answer" },
  { exam: "a2-key-schools", part: 2, name: "Discussion with a partner", minutes: "5–6",
    what: "The candidates talk together about a set of pictures on one topic (hobbies, places, things to do), saying what they like and why; then the examiner asks each a follow-up question on the topic.",
    skills: ["describe", "negotiate", "relate"], practice: "pictures on one topic: say what you like and why, ask your partner, answer a follow-up" },
  { exam: "b1-preliminary-schools", part: 1, name: "Interview", minutes: "2–3",
    what: "The examiner asks each candidate about personal details, daily routine, past experiences and future plans.",
    skills: ["contact", "describe", "narrate"], practice: "personal questions including the past and the future" },
  { exam: "b1-preliminary-schools", part: 2, name: "Describing a photograph", minutes: "3",
    what: "Each candidate talks alone for about a minute about a colour photograph: who and what they can see, where it is, what is happening.",
    skills: ["describe"], practice: "one photograph, about a minute alone: who, where, what is happening" },
  { exam: "b1-preliminary-schools", part: 3, name: "Collaborative task", minutes: "4",
    what: "The candidates discuss a situation with picture prompts (choosing a present, planning a day), make and respond to suggestions, discuss the options and try to agree.",
    skills: ["negotiate", "relate", "repair"], practice: "a situation and five options: suggest, respond, compare, agree" },
  { exam: "b1-preliminary-schools", part: 4, name: "Discussion", minutes: "3",
    what: "A conversation with the examiner and the partner on the topic of Part 3: opinions, likes and preferences, habits and experiences.",
    skills: ["relate", "describe", "narrate"], practice: "follow-up questions on the topic: opinions, preferences, experiences" },
];

/** A language function a paper expects, mapped to the skills that practise it. `bands` lists the papers it appears in. */
export interface Descriptor { id: string; can: string; bands: Exam[]; skills: SkillId[]; source: string; }
const A2 = "a2-key-schools" as const, B1 = "b1-preliminary-schools" as const;
const SRC_A2 = "A2 Key for Schools Handbook, language functions and Speaking assessment scales";
const SRC_B1 = "B1 Preliminary for Schools Handbook, language functions and Speaking assessment scales";
const SRC_BOTH = `${SRC_A2}; ${SRC_B1}`;
export const DESCRIPTORS: Descriptor[] = [
  { id: "greet", can: "Greet people and respond to greetings", bands: [A2, B1], skills: ["contact"], source: SRC_BOTH },
  { id: "personal-info", can: "Give and ask for personal information (name, age, where you live, school)", bands: [A2, B1], skills: ["contact"], source: SRC_BOTH },
  { id: "routine", can: "Talk about daily life and routines", bands: [A2, B1], skills: ["describe"], source: SRC_BOTH },
  { id: "likes", can: "Say what you like and dislike, and why", bands: [A2, B1], skills: ["describe"], source: SRC_BOTH },
  { id: "describe-people-places", can: "Describe people, places and things simply", bands: [A2, B1], skills: ["describe"], source: SRC_BOTH },
  { id: "opinion", can: "Give a simple opinion and ask for someone else's", bands: [A2, B1], skills: ["describe", "relate"], source: SRC_BOTH },
  { id: "agree-disagree", can: "Agree and disagree politely", bands: [A2, B1], skills: ["relate", "negotiate"], source: SRC_BOTH },
  { id: "suggest", can: "Make, accept and reject suggestions", bands: [A2, B1], skills: ["negotiate"], source: SRC_BOTH },
  { id: "repeat-clarify", can: "Ask someone to repeat or explain, and check you understood", bands: [A2, B1], skills: ["repair"], source: SRC_BOTH },
  { id: "request", can: "Ask for things and for help; respond to requests", bands: [A2, B1], skills: ["request"], source: SRC_BOTH },
  { id: "past-events", can: "Talk about what happened (past experiences and events)", bands: [A2, B1], skills: ["narrate"], source: SRC_BOTH },
  { id: "future-plans", can: "Talk about plans and arrangements", bands: [A2, B1], skills: ["narrate", "negotiate"], source: SRC_BOTH },
  { id: "invite-offer", can: "Invite, offer, accept and refuse", bands: [A2, B1], skills: ["relate", "negotiate"], source: SRC_BOTH },
  { id: "thank-apologise", can: "Thank and apologise, and respond to thanks and apologies", bands: [A2, B1], skills: ["contact", "resolve"], source: SRC_BOTH },
  { id: "turn-taking", can: "Take turns in a conversation and keep it going with a partner", bands: [A2, B1], skills: ["contact", "relate"], source: SRC_BOTH },
  { id: "extended-answer", can: "Give a longer answer of a few connected sentences", bands: [A2, B1], skills: ["describe", "narrate"], source: SRC_BOTH },
  { id: "compare", can: "Compare options and say which is better and why", bands: [B1], skills: ["negotiate", "describe"], source: SRC_B1 },
  { id: "photo-long-turn", can: "Describe a photograph alone for about a minute", bands: [B1], skills: ["describe"], source: SRC_B1 },
  { id: "reasons", can: "Give reasons and explanations for opinions and choices", bands: [B1], skills: ["describe", "negotiate"], source: SRC_B1 },
  { id: "reach-agreement", can: "Discuss alternatives and reach a decision with a partner", bands: [B1], skills: ["negotiate"], source: SRC_B1 },
  { id: "preferences-habits", can: "Talk about preferences, habits and experiences in more depth", bands: [B1], skills: ["describe", "narrate"], source: SRC_B1 },
  { id: "feelings", can: "Express and ask about feelings and reactions", bands: [B1], skills: ["relate"], source: SRC_B1 },
  { id: "problems", can: "Explain a small problem and agree what to do", bands: [B1], skills: ["resolve", "request"], source: SRC_B1 },
];

/** How each paper is assessed, and what Linga can observe for it today (null: Linga cannot judge it). */
export interface Criterion { exam: Exam; id: string; name: string; linga: string | null; }
export const CRITERIA: Criterion[] = [
  { exam: A2, id: "grammar-vocabulary", name: "Grammar and vocabulary", linga: "observations quote the learner's own words per skill; fix moments" },
  { exam: A2, id: "pronunciation", name: "Pronunciation", linga: null },
  { exam: A2, id: "interactive", name: "Interactive communication", linga: "turns taken, repair moves, help asked (evidence, supported or not)" },
  { exam: B1, id: "grammar-vocabulary", name: "Grammar and vocabulary", linga: "observations quote the learner's own words per skill; fix moments" },
  { exam: B1, id: "discourse", name: "Discourse management", linga: "longer answers in narrate and describe; not scored" },
  { exam: B1, id: "pronunciation", name: "Pronunciation", linga: null },
  { exam: B1, id: "interactive", name: "Interactive communication", linga: "turns taken, repair moves, help asked (evidence, supported or not)" },
];

/** The topic areas the papers draw on, as the handbooks list them, in short (for scene and plan coverage later). */
export const TOPIC_AREAS = ["clothes", "communication and technology", "daily life", "education and school", "entertainment and media",
  "family and friends", "food and drink", "health and exercise", "hobbies and leisure", "house and home", "places and buildings",
  "personal feelings and experiences", "shopping", "sport", "the natural world", "travel and holidays", "weather", "work and jobs"];

/** The audiences a learner of `age` may practise in (curriculum.ts audienceAllowed, by age alone, for a school-type profile). */
export function audiencesAt(age: number): Audience[] {
  return age >= 18 ? ["all", "older", "adult"] : age >= 15 ? ["all", "school", "older"] : ["all", "school"];
}

export interface Coverage { exam: Exam; total: number; practised: string[]; gaps: string[]; share: number; scenesFor: Record<string, string[]>; }
/** Which of a paper's descriptors an authored scene practises for a learner of `age` (plan topics change; they are not counted). */
export function coverage(exam: Exam, age: number): Coverage {
  const allowed = new Set(audiencesAt(age)), scenes = ENGLISH_SCENES.filter((x) => allowed.has(x.audience));
  const ds = DESCRIPTORS.filter((d) => d.bands.includes(exam));
  const scenesFor: Record<string, string[]> = {};
  for (const d of ds) scenesFor[d.id] = scenes.filter((x) => d.skills.includes(x.skill)).map((x) => x.id);
  const practised = ds.filter((d) => scenesFor[d.id].length).map((d) => d.id), gaps = ds.filter((d) => !scenesFor[d.id].length).map((d) => d.id);
  return { exam, total: ds.length, practised, gaps, share: ds.length ? practised.length / ds.length : 0, scenesFor };
}

/** The plan's kill criterion (section g): no Cambridge wording anywhere unless verified and A2 Key coverage is at least 90%. */
export const CLAIM_FLOOR = 0.9;
export function claimAllowed(age = 12): boolean {
  return VERIFIED && coverage("a2-key-schools", age).share >= CLAIM_FLOOR;
}
