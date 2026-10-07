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
  /** two or three goals the learner reaches in the scene (mission.ts); absent on a plan topic, which gets generated ones */
  steps?: string[];
  premise: string; cue: string; quiz: { question: string; options: [string, string]; correct: number };
  /** A Speaking-practice scene's task shape (v2 L2, speaking.ts): the paper and part it copies. Never displayed. */
  practice?: { exam: string; part: number };
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
/**
 * One level check kept in the record of checks (Family W10): what it found and how, never its tasks or answers.
 * A band picked by hand is kept too, with source "self": it is recorded, and it never certifies (cert.ts).
 */
export interface PlacementRecord {
  at: number; band: Band; confidence: Placement["confidence"]; source: Placement["source"];
  /** the check's one-sentence read, as the placement holds it; absent for a band picked by hand */
  summary?: string;
}
/** One skill on a certificate: how the learner showed it (said or typed) and one of their own lines that shows it. */
export interface CertSkill { skill: SkillId; mode: "spoken" | "written"; quote: string; at: number; }
/**
 * A certificate (Family W10, cert.ts): a snapshot issued by code from the evidence. Append-only and never edited:
 * whether it has been opened is kept apart, in EnglishLearning.seenIds.
 */
export interface Certificate {
  id: string; at: number; band: Band;
  /** the plan topics the learner chose, as they were titled when it was issued */
  topics: string[];
  /** every required skill, in the order of the eight */
  skills: CertSkill[];
  /** the date of the level check it rests on */
  checkAt: number;
}
/** A generated conversation topic: a scene contract the learner agreed to. */
export interface PlanTopic {
  id: string; title: string; goal: string; why: string; skill: SkillId; audience: Audience;
  partner: string; premise: string; cue: string; quiz: EnglishScene["quiz"];
}
export interface Plan { at: number; band: Band; topics: PlanTopic[]; }
/** The tutor stopped the scene: one fix to what the learner said, or one word the situation wants. */
export interface Moment { id: string; kind: "fix" | "word"; said: string; better: string; why: string; turnId: string; at: number; }
/**
 * A moment kept on the learner record. The review fields are written by code (review.ts), never by the model:
 * how many scenes have invited it since, and when, where and in which words the learner used it again unaided.
 */
export interface Taught extends Moment {
  sceneId: string; title: string;
  offered?: number; reusedAt?: number; reusedIn?: string; reusedQuote?: string;
}
/**
 * The taught item this scene brings back (review.ts). The partner is asked to make room for it and never to say it;
 * used is the learner's reply that used it unaided, and usedTurn that reply's turn.
 */
export interface Review { id: string; kind: "fix" | "word"; better: string; fromTitle: string; used?: string; usedTurn?: string; }

export interface EnglishLearning {
  preferences: EnglishPreferences | null; notes: string[];
  evidence: EnglishEvidence[]; achievements: Partial<Record<SkillId, Progress>>;
  sessions: Array<{ id: string; sceneId: string; title: string; at: number; turns: number }>;
  placement: Placement | null; plan: Plan | null; taught: Taught[];
  /** every level check and hand-picked band, oldest first, append-only (placement.ts appendPlacement, capped) */
  placements: PlacementRecord[];
  /** certificates issued by code (cert.ts), oldest first, append-only */
  certificates: Certificate[];
  /** the certificates already opened; the one place a certificate's state changes, so the certificate never does */
  seenIds: string[];
  /**
   * Scenes the learner pitched in Adult mode (v2 L3, pitch.ts), newest last, at most 12; ids start "pitch-". Absent on
   * every record saved before, read as `?? []`. Not `notes`, which are the teaching notes the model is given.
   */
  pitches?: PlanTopic[];
}
export interface ConversationTurn { id: string; role: "partner" | "learner"; text: string; mode?: EvidenceMode; supported?: boolean; }
export interface Coaching { before: string; after: string; note: string; }
/** A rung of the rescue ladder: 1 said more simply, 2 what it means, 3 a way to start. */
export type HelpRung = 1 | 2 | 3;
/**
 * The rescue ladder of the partner's current line, as the session may know it: which rungs exist and how far the
 * learner has climbed. Never the rungs' words: the unrevealed ones stay in server memory (help.ts).
 */
export interface ConversationHelp {
  /** the partner turn this ladder belongs to; help for an older line is never shown */
  forTurn: string;
  rungs: HelpRung[];
  /** the highest rung revealed, 0 for none */
  rung: 0 | HelpRung;
  /** the cue on screen is that rung (not the quiz's or a choice's line) */
  shown: boolean;
}
/** A scene's steps and the replies that reached them, in order (mission.ts). Never evidence. */
export interface Mission { steps: string[]; reached: Array<{ turnId: string; quote: string }>; }
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
  /** absent on a conversation saved before the ladder, and null when the partner's line came without one */
  help?: ConversationHelp | null;
  /** absent on a conversation saved before review, null when nothing taught was due */
  review?: Review | null;
  /** absent on a conversation saved before missions, and null-free: a scene with no valid steps has none */
  mission?: Mission;
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
  /** a scene started or resumed over this check: kept where it was, and not the phone's until Carry on (activity.ts); absent on every check saved before */
  parked?: boolean;
  pending: string | null; error: string; commands: string[]; audioNonce: number; startedAt: number;
  provider?: string; responseMs?: number;
}
export function emptyEnglish(): EnglishLearning { return { preferences: null, notes: [], evidence: [], achievements: {}, sessions: [], placement: null, plan: null, taught: [], placements: [], certificates: [], seenIds: [] }; }
