/** Shared data only: safe to import from the TV and phone. */
import type { LostTask } from "./lostfound";
export type SkillId = "contact" | "repair" | "request" | "describe" | "narrate" | "negotiate" | "relate" | "resolve";
export const BANDS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Band = typeof BANDS[number];
export interface EnglishPreferences {
  level: Band; interest: string; goal: string;
  creativity: "familiar" | "playful" | "surprising";
  challenge: "supportive" | "realistic" | "stretch";
  correction: "pauses" | "as-needed"; adultConfirmed: boolean;
  /** LG-56: set only where preferences were saved on top of defaultPreferences (the plan goal), so `level` is the default A1 and nobody chose it; every door that sets a level leaves it out. */
  levelUnset?: true;
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
  /** the learner passed on it: no evidence either way (the verdict stays "fail" for readers older than the flag) */
  skipped?: boolean;
  /**
   * The judge's two readings of a judged (say or listen) task, kept as it gave them: whether the task was done, and
   * the band the English itself showed. Absent on a choice, a skip, and every task stored before they were kept.
   * Code reads them (placement.ts spokenBand); no screen shows them on their own.
   */
  answered?: "yes" | "partly" | "no";
  english?: Band | "none";
  /** LG-54: an exact excerpt of the response that kept the English under the task band; code-checked, absent on older tasks */
  heldBack?: string;
}
export interface Placement {
  at: number; band: Band; selfBand: Band | null;
  confidence: "low" | "medium" | "high"; source: "check" | "self";
  summary: string; focus: string; tasks: PlacementTask[];
  /** up to three errors the learner made, their words and the better form; phone only, absent on older records */
  slips?: { said: string; better: string }[];
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
export interface Moment {
  id: string; kind: "fix" | "word"; said: string; better: string; why: string; turnId: string; at: number;
  /**
   * A fix's slip and fix keys (slip.ts slipOf): the changed words with a neighbour, as said ("tomatoes is") and as fixed
   * ("tomatoes are"). Worked out by code when the moment is made, and again when a record is cleaned; never on a word.
   */
  slip?: string; fix?: string;
  /**
   * A fix's self-repair (K2, repair.ts): absent on a word moment, on a fix shown at once, and on every moment saved before.
   * While it is withheld, better is "" and fix is absent: both wait in server memory until a try holds or Show me.
   */
  repair?: MomentRepair;
  /** LG-4: the replay a moment closed by Back handed off to (conversation.ts); on the scene's moments only, never on the record */
  replay?: MomentReplay;
}
/**
 * The replay after a moment (LG-4, owner ruling 2026-10-18): the partner's fresh question built on the moment's form, and
 * the learner's reply to it. Written by code: `used` is whether that reply said the form (review.ts usesForm), never the model's.
 */
export interface MomentReplay { question: string; turnId: string; reply?: string; used?: boolean; }
/**
 * A fix held for the recap (LG-23 Option 1, delegate ruling 2026-10-17): the turn's one fix on a reply where the moment gap
 * or cap shut the stop, held to the same checks as a moment (parseMoment's exact excerpt, the audience gate). Never a stop:
 * it never sets the moment, no screen shows it during the scene, and it is not a taught item. The recap lists it apart from
 * the moments; turnId is the learner turn it is on.
 */
export type HeldFix = Pick<Moment, "id" | "kind" | "said" | "better" | "why" | "turnId" | "at">;
/** Where a fix's self-repair stands (repair.ts). Written by code only; the try is never evidence. */
export interface MomentRepair {
  /** the rung on screen: 0 say it again, 1 the why as a clue, 2 the fix shown */
  rung: 0 | 1 | 2;
  /** the learner's latest try, in their words */
  tried?: string;
  /** a try held (repair.ts judgeTry) */
  held?: boolean;
  /** it held before the fix was shown: the learner found it */
  selfRepaired?: boolean;
  /** no further try is taken: one held, or the one try after the fix was shown */
  spent?: boolean;
  /** a restart lost the withheld fix: it can no longer be shown or judged */
  lost?: boolean;
}
/**
 * A moment kept on the learner record. The review fields are written by code (review.ts), never by the model:
 * how many scenes have invited it since, and when, where and in which words the learner used it again unaided.
 */
export interface Taught extends Moment {
  sceneId: string; title: string;
  offered?: number; reusedAt?: number; reusedIn?: string; reusedQuote?: string;
  /** how many later replies said the slip again (slip.ts, record tier only), and when the last one did; both only ever rise */
  slips?: number; slipAt?: number;
  /**
   * The schedule (K3, review.ts), written by code: when the item is next due (absent: due since it was taught), the
   * invitations in a row not followed by a use, the date of the last invitation, and every unaided use, newest last
   * (at most REUSES_MAX). reusedAt, reusedIn and reusedQuote are the latest of those uses.
   */
  nextDueAt?: number; misses?: number; offeredAt?: number; reuses?: Reuse[];
  /**
   * An item a scene's hidden line became (K4, line.ts): where the line came from, and, for a line that fixes no words
   * of the learner's, the key words a later use is judged on. `said` is then empty: the learner never said it wrong.
   */
  line?: LineSource; key?: string;
  /** a fix's self-repair (K2): whether a try held before the fix was shown, and the learner's latest try; never evidence */
  selfRepaired?: boolean; tried?: string;
  /**
   * L1, "yours" (review.ts yoursOf): set by code when the item was used unaided in two different scenes on two
   * different local days, with the two uses that earned it. A latch: it never unsets, a later slip reopens the item for
   * review without taking it away (owner ruling X1: mastery only).
   */
  yours?: Yours;
}
/** The latch "yours" (L1): when it was earned (the second use's date) and the two unaided uses, in two scenes on two days. */
export interface Yours { at: number; uses: [Reuse, Reuse] }
/** Where a scene's hidden line came from (K4, line.ts): the level check's better phrase, the opening's offer, the quiz answer. */
export type LineSource = "check" | "offer" | "quiz";
/**
 * A scene's hidden line as the session may know it (K4, line.ts): its source, whether the scene put its key words on
 * screen (an opened quiz, a cue), and its words only once they are earned: `found`, the learner's reply that said it,
 * with `foundTurn`; or handed over by the recap. Before that the words are in server memory only.
 */
export interface SceneLine { source: LineSource; shown?: boolean; found?: string; foundTurn?: string; text?: string }
/** One unaided use of a taught item: when, in which conversation and scene (absent on a use kept before K3), and the learner's words. */
export interface Reuse { at: number; conversationId: string; sceneId?: string; quote: string }
/**
 * The taught item this scene brings back (review.ts). The partner is asked to make room for it and never to say it;
 * used is the learner's reply that used it unaided, and usedTurn that reply's turn.
 */
export interface Review {
  id: string; kind: "fix" | "word"; better: string; fromTitle: string; used?: string; usedTurn?: string;
  /** a fix's guarded keys (slip.ts): reuse is the fix key said unaided with the slip key absent, not the whole sentence */
  slip?: string; fix?: string;
  /** a line's key words (K4, line.ts): reuse is the key said unaided, not the whole line */
  key?: string;
}

export interface EnglishLearning {
  preferences: EnglishPreferences | null; notes: string[];
  evidence: EnglishEvidence[]; achievements: Partial<Record<SkillId, Progress>>;
  /** `held`: the scene's held fixes (LG-23), apart from its moments, which are kept as taught items; absent when none */
  sessions: Array<{ id: string; sceneId: string; title: string; at: number; turns: number; held?: HeldFix[] }>;
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
/** "costar": the second person in the room in a duet (L2, duet.ts), never the seated learner and never evidence of theirs. */
export interface ConversationTurn { id: string; role: "partner" | "learner" | "costar"; text: string; mode?: EvidenceMode; supported?: boolean; }
/**
 * Two people in the room (L2, duet.ts): the seated learner and a co-star take beats in turn, and the partner, as the
 * scene's host, answers the pair in one call. `coStar` is a short name typed on the phone, or a profile's first name;
 * `coStarLearnerId` a second learner profile at this desk, the only co-star whose own lines can earn evidence. `beat` is
 * whose line comes next; `held` is the learner's line of this pair, kept until the co-star's arrives.
 */
export interface Duet { coStar: string; coStarLearnerId?: string; beat: "learner" | "costar"; held?: ConversationTurn }
export interface Coaching { before: string; after: string; note: string; }
/** A rung of the rescue ladder: 1 said more simply (at A1-A2, words to say back), 2 what it means, 3 a way to start. */
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
  /** LG-5 recert-9: rung 1 is words to say back to the line (A1-A2), not the line said more simply */
  say?: true;
}
export type NoteKind = "meaning" | "form" | "word" | "register";
/**
 * One of the three notes at Cut (v2 L3, notes.ts cleanNotes): a quote, exact, from one learner turn of this take, and
 * one sentence about it. "form" only where the tense rule (lib/rules/english.ts) finds a conflict in that sentence;
 * otherwise it is a "meaning" note marked `reading`, the model's read rather than a rule. Never evidence. Not the
 * learner's teaching `notes` (EnglishLearning.notes).
 */
export interface SceneNote { turnId: string; quote: string; kind: NoteKind; note: string; better?: string; reading?: boolean; }
/** A take ended by Cut: when, and its notes, kept with their turnIds (v2 L4 Take Two forks from a note). */
/** `clean`: the line for a take with nothing to flag (UD-16): notes empty, the answer valid. */
export interface Cut { at: number; notes: SceneNote[]; clean?: string; }
/**
 * Take Two (v2 L4, adult C1, take.ts): one note's beat played again, forked inside the same conversation. The scene
 * went back to `from`, the partner line before the noted turn, and said it again; the learner says their line again,
 * and at most two cast turns follow. The first take's turns and its notes are never rewritten. Never evidence.
 */
export interface Take {
  /** the note it came from, by its index in Cut.notes; at most one take per note */
  note: number;
  /** the partner turnId of the first take it forked at */
  from: string;
  /** its own lines: the partner line re-delivered first, then the learner's and the cast's */
  turns: ConversationTurn[];
  /** heldOf on the learner's first line of the take; null before it, and wherever code cannot tell */
  held: boolean | null;
  at: number;
  /** when it ended; absent while it runs */
  endedAt?: number;
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
  /** LG-23: fixes held for the recap on turns the gap or cap kept from stopping, oldest first; absent when none. Never a stop. */
  heldFixes?: HeldFix[];
  phase: "conversation" | "coaching" | "replay" | "finished";
  pending: string | null; error: string; paused: boolean;
  /** LG-4 recert-7: the command of Back's replay call; while it is the pending one the scene shows the partner thinking of a new question */
  replayFor?: string;
  capture: boolean; captureAt: number; audioNonce: number;
  supported: boolean; cue: string; quizOpen: boolean;
  /** LG-5 recert-8: the scene's cue was shown (by help or under the quiz); it is offered once a scene, never again word for word */
  sceneCued?: boolean;
  /** absent on a conversation saved before the ladder, and null when the partner's line came without one */
  help?: ConversationHelp | null;
  /** absent on a conversation saved before review, null when nothing taught was due */
  review?: Review | null;
  /** K4: the scene's hidden line (line.ts); absent or null when the review is the room's line, or none was hidden */
  line?: SceneLine | null;
  /** absent on a conversation saved before missions, and null-free: a scene with no valid steps has none */
  mission?: Mission;
  /** the lost-property task (L3, lostfound.ts): only on the "lost" scene, null once it stood down; its public half only */
  lost?: LostTask | null;
  /** absent unless the take was ended by Cut in Adult mode (v2 L3) */
  cut?: Cut;
  /** absent until a Take Two (v2 L4) starts from one of the cut notes; oldest first, the running one last */
  takes?: Take[];
  /** absent unless the scene was started as a duet (L2, duet.ts) */
  duet?: Duet;
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
  /** titles the learner swapped or renewed away in this plan session: never offered again (check.ts propose) */
  rejected?: string[];
  /** a scene started or resumed over this check: kept where it was, and not the phone's until Carry on (activity.ts); absent on every check saved before */
  parked?: boolean;
  pending: string | null; error: string; commands: string[]; audioNonce: number; startedAt: number;
  provider?: string; responseMs?: number;
}
export function emptyEnglish(): EnglishLearning { return { preferences: null, notes: [], evidence: [], achievements: {}, sessions: [], placement: null, plan: null, taught: [], placements: [], certificates: [], seenIds: [] }; }
