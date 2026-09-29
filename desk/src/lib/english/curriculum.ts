import type { Profile } from "../session/store";
import type { Audience, EnglishLearning, EnglishPreferences, EnglishScene, Progress, SkillId } from "./types";
export type { EnglishScene } from "./types";

export const ENGLISH_SKILLS: Array<{ id: SkillId; name: string; goal: string }> = [
  { id: "contact", name: "Make contact", goal: "Greet, introduce yourself, and take a turn." },
  { id: "repair", name: "Understand and repair", goal: "Ask to repeat, clarify, and confirm meaning." },
  { id: "request", name: "Get something done", goal: "Request, locate, choose, and confirm." },
  { id: "describe", name: "Share your world", goal: "Describe interests and explain preferences." },
  { id: "narrate", name: "Tell what happened", goal: "Sequence events and explain an action and result." },
  { id: "negotiate", name: "Make a plan", goal: "Suggest options and agree on a shared plan." },
  { id: "relate", name: "Connect with people", goal: "Follow up, disagree respectfully, and decline." },
  { id: "resolve", name: "Handle friction", goal: "Name an impact, set a boundary, and agree next steps." },
];
export const ENGLISH_SCENES: EnglishScene[] = [
  { id: "meet", name: "The first hello", goal: "Introduce yourself and ask a question back.", partner: "Jamie · New acquaintance", skill: "contact", audience: "all", minutes: "6–8",
    premise: "Meet someone at a new club, class or community event that fits the learner's age and interests. Greet, introduce yourself, ask an easy question back. Fictional names are welcome.", cue: "Try: Hi, I'm Alex. What is your name?",
    quiz: { question: "Which phrase opens a conversation?", options: ["Hi! Is this your first time here?", "That was last week."], correct: 0 } },
  { id: "weekend", name: "A little of your world", goal: "Describe something you enjoy and explain why.", partner: "Casey · Fellow learner", skill: "describe", audience: "all", minutes: "8–10",
    premise: "A friendly exchange about a hobby, imagined weekend or favourite activity. Fit the details to the learner's interests. Ask for a description and a reason, then compare preferences without judgment.", cue: "Try: I enjoy this because…",
    quiz: { question: "Which phrase gives a reason?", options: ["I did that on Saturday.", "I like drawing because it helps me relax."], correct: 1 } },
  { id: "rover", name: "The missing moon rover", goal: "Find the rover by asking for clues.", partner: "Pip · Robot guide", skill: "repair", audience: "all", minutes: "6–8",
    premise: "A friendly robot needs help locating a rover. Clues involve locations. The learner's questions reveal the route; benign, playful, no danger.", cue: "Try asking: Which way should I go?",
    quiz: { question: "Which phrase asks for clarification?", options: ["Which bridge do you mean?", "Here is the bridge."], correct: 0 } },
  { id: "team", name: "Make the team work", goal: "Agree on a plan that includes everyone.", partner: "Sam · Teammate", skill: "negotiate", audience: "all", minutes: "10–12",
    premise: "Plan a cooperative game mission or school/community project matching the learner's interest. Each teammate has a preference. Negotiate roles without excluding anyone.", cue: "Try offering: How about we do this together?",
    quiz: { question: "Which phrase invites a shared plan?", options: ["You have to do it.", "How about we do it together?"], correct: 1 } },
  { id: "booking", name: "A booking that is missing", goal: "Clarify your booking and ask for a solution.", partner: "Robin · Receptionist", skill: "request", audience: "all", minutes: "8–12",
    premise: "A hotel or activity reservation cannot be found. Use fictional names and details. Clarify the date, request help and agree a practical solution. For children use a family activity with a guardian present.", cue: "Try asking: Could you check the date, please?",
    quiz: { question: "Which phrase asks for help?", options: ["My booking was yesterday.", "Could you check my booking, please?"], correct: 1 } },
  { id: "teacher", name: "Say that again, please", goal: "Ask your teacher to repeat or explain, then say what you understood.", partner: "Ms Hale · Teacher", skill: "repair", audience: "school", minutes: "6–8",
    premise: "A calm moment in class. The partner is a friendly teacher who gives an instruction a little too fast, such as a page number, a homework task or a new word. The learner asks the teacher to repeat it, say it more slowly or explain a word, then says back what they understood. Ordinary school life, fictional names, patient and kind. Never ask for real personal details.", cue: "Try asking: Could you say that again, please?",
    quiz: { question: "Which phrase asks the teacher to repeat?", options: ["Could you say that again, please?", "I already know that."], correct: 0 } },
  { id: "project", name: "Our group project", goal: "Share ideas with a classmate and agree who does what.", partner: "Noor · Classmate", skill: "negotiate", audience: "school", minutes: "8–10",
    premise: "Two classmates plan a small school project together, such as a poster about animals or a short talk for the class. The partner is a classmate, and each of them prefers a different topic or a different job. The learner suggests options, listens to the classmate's idea and helps agree a plan where everyone has a part. Friendly, fictional names, no teasing and no pressure.", cue: "Try: I could draw the pictures. What would you like to do?",
    quiz: { question: "Which phrase gives a classmate a choice?", options: ["We do it my way.", "Would you rather draw or write?"], correct: 1 } },
  { id: "lost", name: "The lost jacket", goal: "Describe what you lost and ask for help finding it.", partner: "Mr Ortiz · School helper", skill: "request", audience: "school", minutes: "6–8",
    premise: "The learner has lost something ordinary at school, such as a blue jacket, a water bottle or a notebook, and asks for help at the school office. The partner is a friendly school staff member. The learner describes the thing (colour, size, where and when it was last seen), answers a question or two and agrees what happens next, for example checking the lost property box or coming back tomorrow. Use a made-up item and fictional names; never ask for a real name, address, phone number or class.", cue: "Try asking: Excuse me, I lost my jacket. Can you help me?",
    quiz: { question: "Which phrase describes the lost thing?", options: ["The bell rings at eight.", "It is a blue jacket with a white zip."], correct: 1 } },
  { id: "interview", name: "Beyond the rehearsed answer", goal: "Explain your own contribution in an interview.", partner: "Jordan · Interviewer", skill: "narrate", audience: "older", minutes: "10–15",
    premise: "A professional interview asks for a specific action and result, followed by a contextual follow-up. Accept fictional examples for practice. Do not invent the learner's credentials. For teens use a club, volunteer or school role.", cue: "Try: I changed something, so that…",
    quiz: { question: "Which answer names a specific action?", options: ["I introduced a shared checklist.", "I was very helpful."], correct: 0 } },
  { id: "date", name: "Different tastes, good conversation", goal: "Stay curious while expressing your own preferences.", partner: "Taylor · Fictional date", skill: "relate", audience: "adult", minutes: "10–12",
    premise: "Two adults on a first date discover different interests. Practise mutual curiosity, respectful disagreement and boundaries. Non-explicit, no coercion, no promises of attraction, no ongoing romantic relationship with the character.", cue: "Try: I prefer something different. What do you enjoy about that?",
    quiz: { question: "Which answer stays curious and honest?", options: ["Fine, I love that too.", "I prefer cities. What do you like about camping?"], correct: 1 } },
  { id: "conflict", name: "Clear without getting louder", goal: "Agree on a next step after a missed handover.", partner: "Morgan · Project partner", skill: "resolve", audience: "older", minutes: "10–15",
    premise: "A teammate missed a deadline. Practise stating impact, acknowledging constraints, setting boundaries and making a concrete request. Ordinary disagreement only; never humiliation, abuse, threats, or forced appeasement. Teens use a school project.", cue: "Try: I need this part. Could we agree on a time?",
    quiz: { question: "Which reply makes a concrete request?", options: ["Can you send the finished section by noon?", "Be more considerate."], correct: 0 } },
];
export function defaultPreferences(p?: Profile): EnglishPreferences {
  return { level: "A1", interest: "", goal: "", creativity: p?.type === "elementary" ? "playful" : "familiar", challenge: "supportive", correction: "as-needed", adultConfirmed: false };
}
export function isAdult(p: Profile | undefined, prefs: EnglishPreferences): boolean {
  return p?.age !== undefined ? p.age >= 18 : p?.type === "other" && prefs.adultConfirmed;
}
/**
 * Age gates content; English level never does. School situations are for a learner under 18 (or, with no age, an
 * elementary or high-school profile), never for "other" and never for an adult, so an adult is not offered a classroom.
 */
export function audienceAllowed(p: Profile | undefined, prefs: EnglishPreferences, audience: Audience): boolean {
  if (audience === "school") return p?.type !== "other" && (p?.age !== undefined ? p.age < 18 : p?.type === "elementary" || p?.type === "high-school");
  return audience === "adult" ? isAdult(p, prefs) : audience === "older" ? (p?.age ?? 0) >= 15 || p?.type === "other" : true;
}
/** The agreed plan's topics, as scenes the conversation can run. */
export function planScenes(l?: EnglishLearning | null): EnglishScene[] {
  return (l?.plan?.topics ?? []).map(t => ({ id: t.id, name: t.title, goal: t.goal, partner: t.partner, skill: t.skill, audience: t.audience, minutes: "8–10", premise: t.premise, cue: t.cue, quiz: t.quiz }));
}
/** Plan topics first, then the built-in situations; both filtered by age. */
export function eligibleScenes(p: Profile | undefined, prefs: EnglishPreferences, l?: EnglishLearning | null): EnglishScene[] {
  return [...planScenes(l), ...ENGLISH_SCENES].filter(x => audienceAllowed(p, prefs, x.audience));
}
/** Every topic in the plan has been talked through at least once. */
export function planDone(l: EnglishLearning): boolean {
  const topics = l.plan?.topics ?? [], started = new Set(l.sessions.map(x => x.sceneId));
  return topics.length > 0 && topics.every(t => started.has(t.id));
}
export function recommendScene(p: Profile | undefined, learning: EnglishLearning): EnglishScene {
  const prefs = learning.preferences ?? defaultPreferences(p);
  // An agreed plan leads: the next topic not yet talked through, then the one whose skill is due.
  const plan = planScenes(learning).filter(x => audienceAllowed(p, prefs, x.audience));
  if (plan.length) {
    const started = new Set(learning.sessions.map(x => x.sceneId));
    const unstarted = plan.find(x => !started.has(x.id));
    if (unstarted) return unstarted;
    const lastId = learning.sessions.at(-1)?.sceneId;
    const due = learning.evidence.filter(e => e.success && Date.now() - e.at > 3 * 86400000).sort((a, b) => a.at - b.at)[0];
    return plan.find(x => due && x.skill === due.skill && x.id !== lastId) ?? plan[(plan.findIndex(x => x.id === lastId) + 1) % plan.length];
  }
  const words = `${prefs.goal} ${prefs.interest}`.toLowerCase();
  // Adult eligibility makes date practice selectable, not an unsolicited next lesson.
  const allowed = eligibleScenes(p, prefs).filter(x=>x.id!=="date"||/date|dating/.test(words));
  const last = learning.sessions.at(-1);
  if (last) {
    const due = learning.evidence.filter(e => e.success && Date.now() - e.at > 3 * 86400000).sort((a,b) => a.at-b.at)[0];
    const next = allowed.find(x => due && x.skill === due.skill && x.id !== last.sceneId);
    if (next) return next;
    const index = allowed.findIndex(x => x.id === last.sceneId);
    return allowed[(index + 1) % allowed.length];
  }
  // A learner who names school in their own words starts with the matching school situation (only when it is theirs to see).
  const schoolWish = /teacher|lesson|homework|school/.test(words) ? "teacher" : /project|classmate/.test(words) ? "project" : /\blost\b/.test(words) ? "lost" : "";
  const desired = /interview|career|job/.test(words) ? "interview" : /date|dating/.test(words) ? "date" : /conflict|deadline/.test(words) ? "conflict" : schoolWish && allowed.some(x => x.id === schoolWish) ? schoolWish : p?.type === "elementary" ? "rover" : /game|team/.test(words) ? "team" : p?.type === "high-school" ? "team" : "booking";
  return allowed.find(x => x.id === desired) ?? allowed[0];
}
export const PROGRESS_LABEL: Record<Progress, string> = { "not-tried": "Not tried", "with-help": "With help", independent: "On your own", transfer: "Used elsewhere" };
export const PROGRESS_ORDER: Progress[] = ["not-tried", "with-help", "independent", "transfer"];
