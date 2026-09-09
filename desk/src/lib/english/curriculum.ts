import type { Profile } from "../session/store";
import type { EnglishLearning, EnglishPreferences, Progress, SkillId } from "./types";

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
export interface EnglishScene {
  id: string; name: string; goal: string; partner: string; skill: SkillId;
  audience: "all" | "school" | "older" | "adult"; minutes: string;
  premise: string; cue: string; quiz: { question: string; options: [string, string]; correct: number };
}
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
  return { level: "beginner", interest: "", goal: "", creativity: p?.type === "elementary" ? "playful" : "familiar", challenge: "supportive", correction: "pauses", adultConfirmed: false };
}
export function isAdult(p: Profile | undefined, prefs: EnglishPreferences): boolean {
  return p?.age !== undefined ? p.age >= 18 : p?.type === "other" && prefs.adultConfirmed;
}
export function eligibleScenes(p: Profile | undefined, prefs: EnglishPreferences): EnglishScene[] {
  return ENGLISH_SCENES.filter(x => x.audience === "adult" ? isAdult(p, prefs) : x.audience === "older" ? (p?.age ?? 0) >= 15 || p?.type === "other" : true);
}
export function recommendScene(p: Profile | undefined, learning: EnglishLearning): EnglishScene {
  const prefs = learning.preferences ?? defaultPreferences(p);
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
  const desired = /interview|career|job/.test(words) ? "interview" : /date|dating/.test(words) ? "date" : /conflict|deadline/.test(words) ? "conflict" : p?.type === "elementary" ? "rover" : /game|team/.test(words) ? "team" : p?.type === "high-school" ? "team" : "booking";
  return allowed.find(x => x.id === desired) ?? allowed[0];
}
export const PROGRESS_LABEL: Record<Progress, string> = { "not-tried": "Not tried", "with-help": "With help", independent: "On your own", transfer: "Used elsewhere" };
export const PROGRESS_ORDER: Progress[] = ["not-tried", "with-help", "independent", "transfer"];
