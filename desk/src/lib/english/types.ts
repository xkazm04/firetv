/** Shared data only: safe to import from the TV and phone. */
export type SkillId = "contact" | "repair" | "request" | "describe" | "narrate" | "negotiate" | "relate" | "resolve";
export const BANDS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Band = typeof BANDS[number];
export interface EnglishPreferences {
  level: Band; interest: string; goal: string;
  creativity: "familiar" | "playful" | "surprising";
  challenge: "supportive" | "realistic" | "stretch";
  correction: "pauses" | "as-needed"; adultConfirmed: boolean;
}
export type EvidenceMode = "speech" | "text" | "choice";
export interface EnglishEvidence {
  id: string; episodeId: string; turnId: string; sceneId: string; skill: SkillId;
  at: number; mode: EvidenceMode; supported: boolean; success: boolean;
  quote: string; note: string;
}
export type Progress = "not-tried" | "with-help" | "independent" | "transfer";
export type Audience = "all" | "school" | "older" | "adult";
export interface EnglishScene {
  id: string; name: string; goal: string; partner: string; skill: SkillId;
  audience: Audience; minutes: string;
  premise: string; cue: string; quiz: { question: string; options: [string, string]; correct: number };
}

export type TaskKind = "say" | "listen" | "choose";
export type TaskVerdict = "pass" | "partial" | "fail";
/** One judged task of the level check. Kept apart from evidence: a placement task never moves a skill's progress. */
export interface PlacementTask {
  id: string; band: Band; kind: TaskKind; prompt: string; line: string; options: string[];
  response: string; mode: EvidenceMode; verdict: TaskVerdict; quote: string; note: string; at: number;
}
export interface Placement {
  at: number; band: Band; selfBand: Band | null;
  confidence: "low" | "medium" | "high"; source: "check" | "self";
  summary: string; focus: string; tasks: PlacementTask[];
}
/** A generated conversation topic: a scene contract the learner agreed to. */
export interface PlanTopic {
  id: string; title: string; goal: string; why: string; skill: SkillId; audience: Audience;
  partner: string; premise: string; cue: string; quiz: EnglishScene["quiz"];
}
export interface Plan { at: number; band: Band; topics: PlanTopic[]; }
/** The tutor stopped the scene: one fix to what the learner said, or one word the situation wants. */
export interface Moment { id: string; kind: "fix" | "word"; said: string; better: string; why: string; turnId: string; at: number; }
export interface Taught extends Moment { sceneId: string; title: string; }

export interface EnglishLearning {
  preferences: EnglishPreferences | null; notes: string[];
  evidence: EnglishEvidence[]; achievements: Partial<Record<SkillId, Progress>>;
  sessions: Array<{ id: string; sceneId: string; title: string; at: number; turns: number }>;
  placement: Placement | null; plan: Plan | null; taught: Taught[];
}
export interface ConversationTurn { id: string; role: "partner" | "learner"; text: string; mode?: EvidenceMode; supported?: boolean; }
export interface Coaching { before: string; after: string; note: string; }
export interface Conversation {
  id: string; learnerId: string; sceneId: string; title: string; goal: string; partner: string;
  focusSkill: SkillId; reviewSkill?: SkillId; preferences: EnglishPreferences;
  /** the scene contract as it was when the scene started, so a re-cut plan cannot pull it away */
  scene?: EnglishScene;
  turns: ConversationTurn[]; coaching: Coaching | null;
  moment: Moment | null; moments: Moment[];
  phase: "conversation" | "coaching" | "replay" | "finished";
  pending: string | null; error: string; paused: boolean;
  capture: boolean; captureAt: number; audioNonce: number;
  supported: boolean; cue: string; quizOpen: boolean;
  commands: string[]; evidence: EnglishEvidence[];
  provider?: string; responseMs?: number; startedAt: number;
}

export interface CheckTurn { id: string; role: "tutor" | "learner"; text: string; mode?: EvidenceMode; }
/** The task on screen. Deliberately no answer: the session reaches every screen, the key stays on the server. */
export interface CheckTask { id: string; band: Band; kind: TaskKind; prompt: string; line: string; options: string[]; revealed: boolean; }
/** Finding the level, then agreeing the topics. Lives in the session; only its results reach the learner record. */
export interface LevelCheck {
  id: string; learnerId: string; stage: "about" | "tasks" | "verdict" | "plan";
  turns: CheckTurn[]; selfBand: Band | null; goal: string; interest: string; read: string;
  task: CheckTask | null; tasks: PlacementTask[]; placement: Placement | null; topics: PlanTopic[];
  /** no goal or interest is known yet: ask before cutting topics, which would otherwise be generic */
  askGoal?: boolean;
  pending: string | null; error: string; commands: string[]; audioNonce: number; startedAt: number;
  provider?: string; responseMs?: number;
}
export function emptyEnglish(): EnglishLearning { return { preferences: null, notes: [], evidence: [], achievements: {}, sessions: [], placement: null, plan: null, taught: [] }; }
