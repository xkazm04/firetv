/** Shared data only: safe to import from the TV and phone. */
export type SkillId = "contact" | "repair" | "request" | "describe" | "narrate" | "negotiate" | "relate" | "resolve";
export type EnglishLevel = "beginner" | "developing" | "confident";
export interface EnglishPreferences {
  level: EnglishLevel; interest: string; goal: string;
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
export interface EnglishLearning {
  preferences: EnglishPreferences | null; notes: string[];
  evidence: EnglishEvidence[]; achievements: Partial<Record<SkillId, Progress>>;
  sessions: Array<{ id: string; sceneId: string; title: string; at: number; turns: number }>;
}
export interface ConversationTurn { id: string; role: "partner" | "learner"; text: string; mode?: EvidenceMode; supported?: boolean; }
export interface Coaching { before: string; after: string; note: string; }
export interface Conversation {
  id: string; learnerId: string; sceneId: string; title: string; goal: string; partner: string;
  focusSkill: SkillId; reviewSkill?: SkillId; preferences: EnglishPreferences;
  turns: ConversationTurn[]; coaching: Coaching | null;
  phase: "conversation" | "coaching" | "replay" | "finished";
  pending: string | null; error: string; paused: boolean;
  capture: boolean; captureAt: number; audioNonce: number;
  supported: boolean; cue: string; quizOpen: boolean;
  commands: string[]; evidence: EnglishEvidence[];
  provider?: string; responseMs?: number; startedAt: number;
}
export function emptyEnglish(): EnglishLearning { return { preferences: null, notes: [], evidence: [], achievements: {}, sessions: [] }; }
