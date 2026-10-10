/**
 * One session, on the server, pushed to every subscriber as it changes.
 *
 * The phone POSTs events; the TV (and the phone) subscribe over SSE. The reducer is pure; engine
 * work happens in the route handlers and lands as further events. Kept on globalThis so Next's
 * dev reloads do not lose the desk mid-session; persisted as JSON on every change.
 */
import type { Workroom } from "../twin/workroom";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { AGE_RANGE } from "@/tv/profileRows";
import { firstToLook } from "@/tv/sheetRows";
import { LANDING_REST } from "@/tv/landingRows";
import { dayOf } from "@/tv/mathsRows";
import { focusAfterRewrite } from "@/tv/keys";
import path from "node:path";
import { addHints, addHistory, addPaper, getLearner, saveLearner, type HistoryEntry, type SkillRecord, type StoredPaper } from "./learners";
import { isPath, learnerPath, topicIn, topicsOf, type MathPath } from "../library/paths";
import { LESSONS, PLAYBOOK } from "../library/lessons.data";
import { watchDue, type Watch } from "../library/watched";
import type { RuleCard } from "../rules/english";
import { restatedLine, slipsFor } from "../rules/maths";
import { mathsEntry } from "../rules/digest";
import { WEEK_UNREAD, sundayPage, sundayWords, type WeekLine } from "../rules/week";
import { CALC_SHAPES, type CalcSpec } from "../rules/calc";
import { isCalc2Spec, type Calc2Spec } from "../rules/calc2";
import { isPartLabel, type PartLabel } from "../rules/calc-word";
import { SCHOOL_SHAPES, wellFormed as schoolWellFormed, type SchoolSpec } from "../rules/school";
import { planFill, planSlots, type Fix, type Plan, type Sentence, type Was } from "../rules/essay";
import { adultAllowed, type Mode } from "../rules/mode";
import { emptyEnglish, type Conversation, type EnglishLearning, type LevelCheck } from "../english/types";

export type Subject = "maths" | "english" | "essay";
export type Screen = "landing" | "pair" | "joined" | "tonight" | "units" | "calendar" | "page" | "hint" | "lesson" | "sentence" | "headtohead" | "essaytype" | "essayplan" | "forensic" | "playbook" | "xray" | "break" | "recap" | "learner" | "profile" | "topics" | "prepare" | "paper" | "practice" | "sheet" | "walk" | "linga" | "linga-scenes" | "linga-map" | "linga-talk" | "linga-coach" | "linga-recap" | "linga-check" | "linga-verdict" | "linga-plan" | "linga-moment" | "linga-cert" | "linga-certs" | "worked" | "workroom";

export type StudentType = "elementary" | "high-school" | "other";
/** The school system a learner's progress is read against. One per profile; the desk defaults to UK. */
export type SchoolSystem = "us" | "uk" | "cz" | "de";
/** `mathPath`: the Math course the learner is on (library/paths.ts) - absent is the school path. */
/**
 * `mode`: the explicit family/adult choice (rules/mode.ts, Family W4; the gate since slice A5). Optional and usually absent:
 * unset means the mode is derived (modeOf). A stored "adult" counts only while rules/mode adultAllowed holds (18+).
 */
export interface Profile { id: string; name: string; type: StudentType; age?: number; system?: SchoolSystem; modules: Subject[]; mathPath?: MathPath; mode?: Mode; }
/** Only a key of PATHS (library/paths isPath) is a path: any other mathPath (a draft patch, an older or hand-edited session.json) is dropped. */
function pathChecked<T extends { mathPath?: unknown }>(p: T): T {
  if (p.mathPath === undefined || isPath(p.mathPath)) return p;
  const q = { ...p }; delete q.mathPath; return q;
}
/**
 * Only "family" and "adult" are modes: any other `mode` (junk in a draft patch, a hand-edited session.json) is dropped, so the
 * profile is back to the derived default. `allowAdult` false drops "adult" too. A profile.draft patch may set "adult" since
 * slice A5, and the merged draft then passes adultGated; session.json load keeps a stored "adult" as data and modeOf
 * honours it only while the gate holds.
 */
export function modeChecked<T extends { mode?: unknown }>(p: T, allowAdult = true): T {
  if (p.mode === undefined || p.mode === "family" || (allowAdult && p.mode === "adult")) return p;
  const q = { ...p }; delete q.mode; return q;
}
/**
 * A draft that may not be Adult (under 18, or a school type with no age) loses "adult": the gate is re-checked on every
 * edit. A refused adult falls back to a "family" the draft already held, never erasing it.
 */
function adultGated(p: Profile, before?: Profile | null): Profile {
  if (p.mode !== "adult" || adultAllowed(p)) return p;
  const q = { ...p }; delete q.mode;
  return before?.mode === "family" ? { ...q, mode: "family" } : q;
}
/**
 * A practice topic's name as the desk writes it, on whichever path it belongs to: topicIn(id)?.name ?? id. For every
 * school id it is exactly the label mark.ts writes (topicById(id)?.name ?? id); tools/maths-course-test.cjs pins that.
 */
export const topicLabel = (id: string): string => topicIn(id)?.name ?? id;
/** Is this history label the one a set on `topic` was written under: its name - or its bare id, which mark.ts writes for an id the syllabus lacks. */
const labelOf = (label: string, topic: string) => label === topicLabel(topic) || label === topic;


export interface PageItem { n: number; /** a lettered part's own name on the page: 'a)', '3b' (n stays the printed number) */ label?: string; text: string; cx: number; cy: number; band: [number, number]; key: string; /** the normalised text, a content fingerprint: the key is the item's identity (page id + printed number), not its text */ fingerprint?: string; }
/**
 * `owner` on a page, a set, a hint and a lesson is the learner it was made for (principle 3: only this learner's), stamped
 * when it is made - by the route that asked, else by the reducer from the learner at the desk. Older sessions have none:
 * settleOwners gives each the learner the desk's own record names.
 */
export interface Page { id: string; subject: Subject; title: string; img: string; w: number; h: number; items: PageItem[]; readMs?: number; provider?: string; owner?: string; day?: string; /** the printed numbers the read left out: empty when complete, null when unknown, absent when never checked */ missing?: number[] | null; }
export interface Task { id: string; sub: Subject; name: string; min: number; done: boolean; }
export interface Hint { key: string; problem: string; stage: 1 | 2; hint1: { hint: string; next: string } | null; hint2: { hint: string; next: string } | null; askedQ: string; rule?: RuleCard; provider?: string; ms?: number; owner?: string; }
export interface LessonPick { id: string; title: string; t: number; text: string; why: string; youtube?: string; owner?: string; }
export interface EnglishAnalysis { sentence: string; card: RuleCard; explanation: string; provider?: string; }
/**
 * One practice question as the desk shows it. There is deliberately no answer here: the session goes
 * to every screen, and marking substitutes into the question on the server, so the answer never needs to leave it.
 */
export interface PracticeItem {
  n: number; question: string;
  studentAnswer?: string; studentWorking?: string;
  verdict?: "right" | "wrong" | "unsure";
  slip?: string; said?: string;
  /** What the desk said back when the learner explained this item (checked in code for the answer); the Walk's caption. */
  reply?: string;
  /**
   * Where in the learner's working the slip sits, when the marker can say: the line (0 = the first line of
   * `studentWorking`), the part of that line, and the kind of mark it takes. The learner's own writing, never a
   * value the answer needs. rules/maths `locate` fills it at marking and at a wrong settle; a screen that finds
   * none marks the answer line.
   */
  slipAt?: SlipAt;
  /**
   * The ONE typed second go a ringed item may take (route /api/second, judged in code by rules/kinds): 'right' wears a tick
   * on its ring, 'wrong' a second ring stroke. Only on a wrong item, set once; the verdict, slip, pen and the learner record
   * stay as marking wrote them - a second go is practice, not evidence. Never the answer typed, never a value.
   */
  second?: "right" | "wrong";
  /**
   * A Calculus item's spec (rules/calc.ts), or a school item's (rules/school.ts, Family W5b): its shape and the parameters
   * its question prints, so marking can judge the learner's answer by recomputing the truth. It holds nothing the
   * question does not already print - no result. Which engine reads it is decided by `spec.shape` alone: a Calculus
   * shape is never read by school code, a school shape never by Calculus code.
   */
  spec?: CalcSpec | Calc2Spec | SchoolSpec;
  /** A school item's tier (1 or 2), as the generator that wrote it was asked for: computed by code, never a model's number. */
  tier?: 1 | 2;
  /**
   * Set by code when the set was asked for as "a step up" (Family W8, rules/stretch): marking records this item's attempt
   * on the step-up record only (lib/session/learners.ts `stretch`), never on the usual one. Absent is a usual item.
   */
  stretch?: true;
  /**
   * A part of a multi-part Calculus question (v2 M3a, rules/calc-word): the parts are consecutive items, each with its own
   * number, spec and printed line (`question`), judged as any item. Every part carries the same `stem` - the situation,
   * written by code and printed once above the parts - and its letter. Neither holds a value a part's answer needs.
   */
  stem?: string;
  part?: PartLabel;
}
/**
 * `nth`: which occurrence of `span` in the line is meant (0 = the first, as maths/typeset `spanStarts` counts
 * them), when the line holds the same text more than once. Absent - an older slipAt too - means the first.
 */
export interface SlipAt { line: number; span?: string; kind?: "missing" | "sign" | "extra"; nth?: number }
const slipAtOf = (x: unknown): SlipAt | undefined => {
  const o = x as Partial<SlipAt> | null;
  if (!o || typeof o !== "object" || !Number.isInteger(o.line) || o.line! < 0) return undefined;
  const at: SlipAt = { line: o.line! };
  if (typeof o.span === "string" && o.span.trim()) at.span = o.span;
  if (o.kind === "missing" || o.kind === "sign" || o.kind === "extra") at.kind = o.kind;
  if (Number.isInteger(o.nth) && o.nth! >= 0) at.nth = o.nth;
  return at;
};
/** `stretch`: the set was asked for as "a step up" (Family W8); every item carries the same flag. Absent is a usual set. */
/**
 * A worked lesson (v2 M1, lib/desk/worked.ts): the idea (the model's words when `own`, else the authored one), the three
 * method steps, and examples written and answered by code. `owner` is the learner it was written for.
 */
export interface Worked { topic: string; title: string; idea: string; own: boolean; steps: string[]; examples: { question: string; answer: string; tier: 1 | 2 }[]; owner?: string; }
export interface Practice { topic: string; items: PracticeItem[]; pageId?: string; marked: boolean; owner?: string; stretch?: true; }

/** A spec's own parameters, by name: the ones its question prints. `zero` (the result, for a symmetry item) is not one. */
const SPEC_KEYS = ["f", "at", "a", "b", "side", "on", "kind", "x0", "steps", "pieces", "rule"] as const;
/**
 * A school spec's own parameters (rules/school.ts SchoolSpec): the expression, the form and unit asked for, the sign flag,
 * and the form a conversion asks for (`to`, Family W7 batch 2: "Write 3/8 as a decimal").
 */
const SCHOOL_SPEC_KEYS = ["expr", "form", "unit", "allowNegative", "to"] as const;
const plainValue = (v: unknown) => typeof v === "string" || (typeof v === "number" && Number.isFinite(v));
/**
 * A spec as a screen may see it: a known shape and only its printed parameters - any other key (an answer) stops here.
 * Dispatched on `shape`: a Calculus shape keeps SPEC_KEYS, a school shape keeps SCHOOL_SPEC_KEYS and must still be
 * well formed by rules/school (a spec that is not is dropped, so no school code ever reads one it cannot judge).
 */
function specShown(x: unknown): CalcSpec | Calc2Spec | SchoolSpec | undefined {
  const o = x as Record<string, unknown> | null;
  if (!o || typeof o !== "object") return undefined;
  if ((SCHOOL_SHAPES as readonly unknown[]).includes(o.shape)) {
    const out: Record<string, unknown> = { shape: o.shape };
    for (const k of SCHOOL_SPEC_KEYS) if (o[k] !== undefined) out[k] = o[k];
    return schoolWellFormed(out).ok ? (out as SchoolSpec) : undefined;
  }
  if (!(CALC_SHAPES as readonly unknown[]).includes(o.shape) && !isCalc2Spec({ shape: o.shape })) return undefined;
  const out: Record<string, unknown> = { shape: o.shape };
  for (const k of SPEC_KEYS) {
    const v = o[k];
    if (k === "on") { if (Array.isArray(v) && v.length === 2 && v.every(plainValue)) out.on = [v[0], v[1]]; }
    else if (plainValue(v)) out[k] = v;
  }
  return out as unknown as CalcSpec;
}
/** Only the fields a screen may see — an answer riding in on an event or an older session.json stops here. */
/** The longest stem a part may carry: a few sentences of a situation. */
const STEM_MAX = 400;
function shown({ n, question, studentAnswer, studentWorking, verdict, slip, said, reply, slipAt, second, spec, tier, stretch, stem, part }: PracticeItem): PracticeItem {
  const item: PracticeItem = { n, question };
  if (studentAnswer !== undefined) item.studentAnswer = studentAnswer;
  if (studentWorking !== undefined) item.studentWorking = studentWorking;
  if (verdict !== undefined) item.verdict = verdict;
  if (slip !== undefined) item.slip = slip;
  if (said !== undefined) item.said = said;
  if (reply !== undefined) item.reply = reply;
  const at = slipAtOf(slipAt);
  if (at && verdict === "wrong") item.slipAt = at;
  // a second go is a ringed item's alone, and only ever one of its two words (a hand-edited session.json stops here)
  if (verdict === "wrong" && (second === "right" || second === "wrong")) item.second = second;
  const sp = specShown(spec);
  if (sp) item.spec = sp;
  if (sp && (tier === 1 || tier === 2)) item.tier = tier;
  // the step-up flag is code's own and only ever true: anything else on an event or an older file is a usual item
  if (stretch === true) item.stretch = true;
  // a part keeps its stem and letter together, or neither (junk on an event or an older file is a single item)
  if (isPartLabel(part) && typeof stem === "string" && stem.trim() && stem.length <= STEM_MAX) { item.stem = stem; item.part = part; }
  return item;
}
/** A set as a screen may see it: its items `shown`, and the step-up flag kept only when it is true. */
const shownPractice = (p: Practice | null | undefined): Practice | null => {
  if (!p) return null;
  const { stretch, ...rest } = p;
  return { ...rest, items: (p.items ?? []).map(shown), ...(stretch === true ? { stretch: true as const } : {}) };
};
/**
 * The homework pipelines (lib/desk/job.ts runs each one). One record per kind: the latest run of that kind,
 * so a screen can tell "under way" from "done" from "failed" without inferring it from a scatter of flags.
 * `id` names the run (a later run of the same kind replaces it, and events for an older run are dropped);
 * `key` is what the run is about (the topic of a practice set, the item key of a hint and of its lesson pick);
 * `error` is a sentence the desk would say, never an exception's text.
 */
export type JobKind = "read" | "hint" | "lesson" | "explain" | "mark" | "practice" | "analyse" | "memory" | "teach";
export type JobPhase = "running" | "done" | "failed";
/** What a run was asked with, held so a failed run can be asked again in place (POST /api/session/retry). Never an answer, never an image. */
export type JobInput = Record<string, string | number>;
export interface Job { id: string; phase: JobPhase; startedAt: number; endedAt?: number; key?: string; error?: string; input?: JobInput; }
export type Jobs = Partial<Record<JobKind, Job>>;
/** Said for a run the desk was restarted in the middle of. */
export const INTERRUPTED = "The desk was restarted before this finished. Ask again.";
/** A saved desk has nothing running: a run that was under way when it stopped is a failed one. */
function settled(jobs: unknown): Jobs {
  const out: Jobs = {};
  if (!jobs || typeof jobs !== "object") return out;
  for (const [k, j] of Object.entries(jobs as Record<string, Job>)) {
    if (!j || typeof j !== "object") continue;
    out[k as JobKind] = j.phase === "running" ? { ...j, phase: "failed", endedAt: j.startedAt, error: INTERRUPTED } : j;
  }
  return out;
}

/**
 * One sentence's reading. `fix` (the move and a slotted pattern) only ever rides on a faulty verdict; older sessions have none.
 * `was` is set only by a rewrite of this sentence (essay.revised): the sentence as first read, its verdict and the fix it was taught.
 */
export interface Verdict { n: number; verdict: "strong" | "faulty" | "neutral"; note: string; fix?: Fix; was?: Was; }
/**
 * `piece` (v2 E1) is set on a whole-piece reading: how many paragraphs, which have been read and which failed (0-based),
 * and the text store's id when the learner kept it. A one-paragraph reading has none.
 */
export interface EssayAnalysis { text: string; type: string; sentences: Sentence[]; stats: Record<string, number>; verdicts: Verdict[]; summary: string; provider?: string; piece?: { paragraphs: number; read: number[]; failed: number[]; pieceId?: string }; }

/** The learner sitting at the desk: a profile's id and name. */
export interface AtDesk { id: string; name: string }

export interface Session {
  pin: string; joined: boolean; phoneUrl: string;
  /** Who is at the desk; null on a fresh desk until someone sits down (the place card asks "Whose desk?"). */
  learner: AtDesk | null;
  profiles: Profile[]; draft: Profile | null;
  subject: Subject; screen: Screen; focus: number; view: "band" | "overview"; back?: Screen;
  tasks: Task[]; timer: { left: number; running: boolean; phase: "work" | "break"; before?: Screen };
  pages: Page[]; pageIx: number; itemIx: number; reading: boolean;
  /** The desk has asked for a page and is waiting for the phone to snap it. */
  awaiting: Subject | null;
  hint: Hint | null; lesson: LessonPick | null; noLesson: boolean; lessonPaused: boolean;
  /** the open lesson as it plays, for the watched rule (library/watched.ts); set by the reducer only (watchOf) */
  watch?: Watch | null;
  english: EnglishAnalysis | null; essay: EssayAnalysis | null; essayType: string | null;
  /** The sentence (its number) the forensic page is about; null for the default, the first faulty one. */
  essayAt?: number | null;
  /** The paragraph being written from the Paragraph pattern, one sentence per slot (rules/essay Plan); absent until a plan is opened. */
  essayPlan?: Plan;
  englishLearning: EnglishLearning; conversation: Conversation | null;
  /** finding the level and agreeing the topics, while it is under way */
  check: LevelCheck | null;
  /** the open maths topic, the practice set on it, and where the walk has got to */
  topic: string | null; practice: Practice | null; walkIx: number;
  /** The worked lesson on the desk (v2 M1); cleared when another learner sits down. */
  worked?: Worked | null;
  /** The Workroom as the TV may see it (v2 T2, lib/twin/workroom.ts): titles, counts, marks, level words; never text. */
  workroom?: Workroom | null;
  /** the current learner's measured skills, hydrated at the dispatch boundary from data/learners.json */
  skills: Record<string, SkillRecord>;
  /** the same measured record per Essay Master lens, hydrated the same way */
  writing: Record<string, SkillRecord>;
  /** what the desk noticed about this learner, and what actually happened, hydrated the same way */
  memory: string[]; history: HistoryEntry[];
  /**
   * The Sunday page (Family W9, rules/week): the seated learner's past seven days as the phone's Parent tab words it,
   * assembled on the server from their own digest at the dispatch boundary (weekOf). Only these lines travel - the digest
   * itself never does - and only to a phone (lib/session/pairing.ts view). Null with no one seated.
   */
  week?: WeekLine[] | null;
  /**
   * The seated learner's latest paper (v2 M5b): the cleaned paper and its date, hydrated at the dispatch boundary from their
   * record. The TV recomputes the recovery from it (rules/recovery); the recovery itself is never stored or sent. Absent with
   * none, and never sent to a guest.
   */
  paper?: StoredPaper | null;
  /** the pipelines' runs, one per kind; see Job */
  jobs: Jobs;
  /**
   * Math Buddy's work of the learners not at the desk, by learner id (see MathsSlot). Never sent to a screen
   * (lib/session/pairing.ts view); the seated learner's own is in the fields above.
   */
  away?: Record<string, MathsSlot>;
  status: string; log: { problems: string[]; hints: number; hard: string[]; minutes: number; started: number | null; /** the local day the log was first written: it is one evening's, see dayed */ day?: string; /** when the evening was last ended (session.end): the phone's recap shows for an evening ended since local midnight */ endedAt?: number };
  updatedAt: number;
  /** Who this copy was drawn for (lib/session/pairing.ts view): never stored, set only on what a route sends. */
  viewer?: "tv" | "phone" | "guest";
}

export type Event =
  | { type: "linga.changed"; conversation?: Conversation | null; check?: LevelCheck | null; screen?: Screen; focus?: number }
  // a join carries the code the phone was given; the session route checks it (lib/session/pairing.ts), the reducer does not
  | { type: "join"; code?: string } | { type: "leave" } | { type: "nav"; screen: Screen; focus?: number; from?: Screen } | { type: "focus"; focus: number }
  | { type: "subject"; subject: Subject }
  | { type: "learner.set"; id: string }
  | { type: "profile.draft"; patch: Partial<Profile> } | { type: "profile.save" } | { type: "profile.discard" }
  | { type: "page.reading"; page: Omit<Page, "items"> } | { type: "page.read"; id: string; items: PageItem[]; readMs: number; provider: string; missing?: number[] | null }
  | { type: "page.ask"; subject: Subject } | { type: "page.unask" }
  | { type: "page.select"; pageIx: number; itemIx?: number } | { type: "item"; itemIx: number } | { type: "view"; view: "band" | "overview" }
  | { type: "hint.set"; hint: Hint } | { type: "hint.stage"; stage: 1 | 2; owner?: string }
  | { type: "lesson.set"; lesson: LessonPick | null; key?: string } | { type: "lesson.pause"; paused: boolean }
  // raised by the desk's own clock when the lesson on screen has played long enough (watchDue); never posted by a screen
  | { type: "lesson.watched" }
  | { type: "english.set"; analysis: EnglishAnalysis } | { type: "essay.type"; essayType: string; owner?: string } | { type: "worked.set"; worked: Worked; owner?: string } | { type: "workroom.set"; workroom: Workroom; open?: boolean } | { type: "essay.set"; analysis: EssayAnalysis; owner?: string } | { type: "essay.progress"; analysis: EssayAnalysis; owner?: string } | { type: "essay.at"; n: number | null }
  // the plan: the TV opens one on a lens; the phone posts one sentence for a slot (validated here, by rules/essay planFill)
  | { type: "essay.plan"; lens: string } | { type: "essay.slot"; i: number; text: string }
  | { type: "essay.revised"; analysis: EssayAnalysis; n: number }
  // a paper typed on the phone (v2 M5b): the rows are as typed - the desk's own cleanPaper decides what stands (dispatch keeps it)
  | { type: "paper.enter"; rows: unknown }
  | { type: "task.add"; name: string; sub: Subject; min: number } | { type: "task.done"; id: string; done: boolean }
  | { type: "timer.start" } | { type: "timer.pause" } | { type: "timer.tick"; seconds: number } | { type: "timer.skipbreak" }
  // `stay`: the set is asked for from Get ready for school (Family W8), whose screen stays put while it is written
  | { type: "topic.open"; topic: string; stay?: boolean }
  | { type: "practice.set"; practice: Practice } | { type: "practice.marked"; items: PracticeItem[]; owner?: string }
  | { type: "walk"; ix: number } | { type: "practice.clear" }
  | { type: "practice.second"; n: number; verdict: "right" | "wrong" }
  | { type: "practice.settle"; n: number; reply: string; verdict?: "right" | "wrong"; slip?: string; said?: string; slipAt?: SlipAt }
  | { type: "job.start"; kind: JobKind; id: string; key?: string; input?: JobInput } | { type: "job.done"; kind: JobKind; id: string } | { type: "job.failed"; kind: JobKind; id: string; error: string }
  | { type: "status"; text: string } | { type: "session.end" } | { type: "reset" };

const DATA = process.env.DESK_DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA, "session.json");

/** Where the phone lives on this network — a fact of the server, so the session carries it. */
function phoneUrl(): string {
  const ip = Object.values(networkInterfaces()).flat().find((n) => n && n.family === "IPv4" && !n.internal)?.address ?? "localhost";
  return `${process.env.DESK_HTTPS === "1" ? "https" : "http"}://${ip}:${process.env.PORT ?? "3000"}/phone`;
}

/**
 * Math Buddy's evening for one learner: the pages they snapped, the set they are on, the hint and its lesson, the walk,
 * and the hints they asked for (the recap's count) - and their list for tonight (the phone's Tonight: task.add,
 * task.done), which the parent's recap reads. The session's own fields hold the seated learner's; a learner who
 * leaves the desk takes theirs to `away`, untouched, and gets it back when they sit down again - so every screen, the
 * phone and the routes read only the learner at the desk, and nothing is thrown away on a switch.
 */
export interface MathsSlot {
  pages: Page[]; pageIx: number; itemIx: number; reading: boolean;
  hint: Hint | null; lesson: LessonPick | null; noLesson: boolean; lessonPaused: boolean;
  topic: string | null; practice: Practice | null; walkIx: number; log: { problems: string[]; hints: number; hard: string[] };
  tasks: Task[];
  /** Essay Master's: the paragraph on the desk, the lens chosen for it, and the sentence the forensic page is on. Optional so a slot saved before they existed still loads. */
  essay?: EssayAnalysis | null; essayType?: string | null; essayAt?: number | null;
  /** The plan on the desk; optional so a slot saved before it existed still loads. */
  essayPlan?: Plan;
}
const emptySlot = (): MathsSlot => ({ pages: [], pageIx: 0, itemIx: 0, reading: false, hint: null, lesson: null, noLesson: false, lessonPaused: false, topic: null, practice: null, walkIx: 0, log: { problems: [], hints: 0, hard: [] }, tasks: [], essay: null, essayType: null, essayAt: null, essayPlan: undefined });
const slotOf = (s: Session): MathsSlot => ({ pages: s.pages, pageIx: s.pageIx, itemIx: s.itemIx, reading: s.reading, hint: s.hint, lesson: s.lesson, noLesson: s.noLesson, lessonPaused: s.lessonPaused,
  topic: s.topic, practice: s.practice, walkIx: s.walkIx, log: { problems: s.log.problems, hints: s.log.hints, hard: s.log.hard }, tasks: s.tasks ?? [],
  essay: s.essay ?? null, essayType: s.essayType ?? null, essayAt: s.essayAt ?? null, essayPlan: s.essayPlan });
const emptyOf = (x: MathsSlot) => !x.pages.length && !x.practice && !x.hint && !x.lesson && !x.topic && !x.log.hints && !x.log.problems.length && !x.tasks?.length && !x.essay && !x.essayType && !x.essayPlan?.slots.some(Boolean);
/** A slot onto the session's fields; the log keeps the desk's clock (minutes, started), which is the evening's, not a learner's. */
function withSlot(n: Session, x: MathsSlot): void { const { log, ...rest } = x; Object.assign(n, rest); n.log = { ...n.log, ...log }; }
/** Who sits down: the learner leaving takes their work to `away`, the learner arriving gets theirs back (or a clean desk). */
function seat(s: Session, n: Session, id: string): void {
  const was = s.learner?.id;
  if (id === was) return;
  const away = { ...(s.away ?? {}) };
  // an empty chair leaves nothing behind: the reducer writes no work while no one is at the desk
  if (was) { const left = slotOf(s); if (emptyOf(left)) delete away[was]; else away[was] = left; }
  withSlot(n, { ...emptySlot(), ...away[id] }); delete away[id]; n.away = away;
}
/** A result that lands after its learner left the desk goes to their work in `away`, never onto the seated learner's. */
function toAway(s: Session, n: Session, owner: string, f: (x: MathsSlot) => MathsSlot | null): void {
  const y = f(s.away?.[owner] ?? emptySlot()); if (y) n.away = { ...(s.away ?? {}), [owner]: y };
}
const awayWith = (s: Session, has: (x: MathsSlot) => boolean) => Object.keys(s.away ?? {}).find((k) => has(s.away![k]));

/** The millisecond the last task id was made in, and how many were made in it: a strict order within one process. */
let taskMs = -1, taskSeq = 0;
/**
 * A new task's id: "t" and the millisecond, with a "-k" suffix from the second one made in that millisecond, and a
 * candidate no task on the desk holds - the seated learner's list and every learner's in `away` - is the only one taken.
 * Nothing reads an id's parts (it is only compared), so the shape may carry the suffix.
 */
function newTaskId(s: Session): string {
  const held = new Set<string>();
  for (const t of s.tasks ?? []) held.add(t.id);
  for (const slot of Object.values(s.away ?? {})) for (const t of slot.tasks ?? []) held.add(t.id);
  for (;;) {
    const now = Date.now();
    if (now === taskMs) taskSeq++; else { taskMs = now; taskSeq = 0; }
    const id = taskSeq ? `t${now}-${taskSeq}` : `t${now}`;
    if (!held.has(id)) return id;
  }
}

/**
 * Who each Math Buddy object belongs to, for a session saved before the stamps, from the desk's own record: a page, the
 * learner whose history has its "homework" line (the same title, written after it was snapped - api/read writes it as the
 * read ends); a set, the owner of the page it was snapped on, else (marked) the learner with the latest "practice" line on
 * its topic; a hint, the owner of the page its problem is on; a lesson, its hint's. Whatever the record does not name is
 * the learner at the desk when the session was saved, so a desk with one learner keeps everything where it was. Then only
 * the seated learner's stays in the session's fields and every other learner's goes to `away`. Pure: histories are passed in.
 */
export function settleOwners(s: Session, historyOf: (id: string) => HistoryEntry[]): Session {
  if (!s.learner) return s;
  const at = s.learner.id, cur = s.pages[s.pageIx]?.id;
  if (s.pages.every((p) => p.owner === at) && (!s.practice || s.practice.owner === at) && (!s.hint || s.hint.owner === at) && (!s.lesson || s.lesson.owner === at)) return s;
  const hist = new Map<string, HistoryEntry[]>();
  const lines = (id: string) => { if (!hist.has(id)) { let h: HistoryEntry[] = []; try { h = historyOf(id) ?? []; } catch {} hist.set(id, h); } return hist.get(id)!; };
  const ids = s.profiles.map((p) => p.id);
  const snapped = (p: Page) => Number(/-(\d+)$/.exec(p.id)?.[1] ?? 0);
  const readBy = (p: Page) => { let best: [string, number] | null = null;
    for (const id of ids) for (const h of lines(id)) if (h.kind === "homework" && h.label === p.title && h.at >= snapped(p) && (!best || h.at < best[1])) best = [id, h.at];
    return best?.[0]; };
  const pages = s.pages.map((p) => (p.owner ? p : { ...p, owner: readBy(p) ?? at }));
  let practice = s.practice;
  if (practice && !practice.owner) {
    const topic = practice.topic;
    let byLine: [string, number] | null = null;
    if (practice.marked) for (const id of ids) for (const h of lines(id)) if (h.kind === "practice" && labelOf(h.label, topic) && (!byLine || h.at > byLine[1])) byLine = [id, h.at];
    const pageId = practice.pageId;
    practice = { ...practice, owner: pages.find((p) => p.id === pageId)?.owner ?? byLine?.[0] ?? at };
  }
  const hk = s.hint?.key;
  const hint = s.hint && (s.hint.owner ? s.hint : { ...s.hint, owner: pages.find((p) => p.items.some((i) => i.key === hk))?.owner ?? at });
  const lesson = s.lesson && (s.lesson.owner ? s.lesson : { ...s.lesson, owner: hint?.owner ?? at });
  const hintsOf = hint?.owner ?? at;
  const slotFor = (id: string): MathsSlot => {
    const ps = pages.filter((p) => p.owner === id), ix = ps.findIndex((p) => p.id === cur), pr = practice?.owner === id, hi = hint?.owner === id;
    return { pages: ps, pageIx: ix >= 0 ? ix : Math.max(0, ps.length - 1), itemIx: ix >= 0 ? s.itemIx : 0, reading: ix >= 0 && s.reading,
      hint: hi ? hint : null, lesson: lesson?.owner === id ? lesson : null, noLesson: hi && s.noLesson, lessonPaused: hi && s.lessonPaused,
      topic: pr || (!practice && id === at) ? s.topic : null, practice: pr ? practice : null, walkIx: pr ? s.walkIx : 0,
      log: id === hintsOf ? { problems: s.log.problems, hints: s.log.hints, hard: s.log.hard } : { problems: [], hints: 0, hard: [] },
      // tonight's list carries no stamp: it stays with the learner at the desk when the session was saved
      tasks: id === at ? s.tasks ?? [] : [] };
  };
  const n: Session = { ...s }, away = { ...(s.away ?? {}) };
  withSlot(n, slotFor(at));
  const others = new Set([...pages.map((p) => p.owner), practice?.owner, hint?.owner, lesson?.owner, hintsOf].filter((x): x is string => !!x && x !== at));
  for (const id of others) { const x = slotFor(id); if (emptyOf(x)) continue; const had = away[id]; away[id] = had ? { ...had, pages: [...had.pages, ...x.pages] } : x; }
  n.away = away;
  return n;
}

export function fresh(): Session {
  return {
    pin: String(1000 + Math.floor(Math.random() * 9000)), joined: false, phoneUrl: phoneUrl(), learner: null,
    // the demo profiles are on the switcher, but a fresh desk seats no one: the place card asks whose desk it is
    profiles: [
      { id: "ema", name: "Ema", type: "high-school", age: 16, modules: ["maths", "english", "essay"] },
      { id: "jakub", name: "Jakub", type: "other", modules: ["english", "essay"] },
    ], draft: null,
    subject: "maths", screen: "landing", focus: LANDING_REST, view: "band",
    tasks: [
      { id: "t1", sub: "maths", name: "Algebra — Exercise 4.2, all ten", min: 25, done: false },
      { id: "t2", sub: "english", name: "Unit 6 — past simple vs present perfect", min: 15, done: false },
      { id: "t3", sub: "essay", name: "Later school starts — first draft", min: 15, done: false },
    ],
    timer: { left: 25 * 60, running: false, phase: "work" },
    pages: [], pageIx: 0, itemIx: 0, reading: false, awaiting: null,
    hint: null, lesson: null, noLesson: false, lessonPaused: false,
    english: null, englishLearning: emptyEnglish(), conversation: null, check: null, essay: null, essayType: null, essayAt: null,
    topic: null, practice: null, walkIx: 0, skills: {}, writing: {}, memory: [], history: [],
    jobs: {}, status: "", log: { problems: [], hints: 0, hard: [], minutes: 0, started: null }, updatedAt: Date.now(),
  };
}

/**
 * With no one at the desk (a fresh desk) nothing is written for no one: the work an app, a route or the phone would leave
 * is dropped, and an app asked for is the learner switcher first - who is at the desk is the first question.
 */
const NEEDS_LEARNER = new Set<Event["type"]>(["linga.changed", "page.reading", "page.read", "page.ask", "page.select", "item", "hint.set", "hint.stage", "lesson.set",
  "english.set", "essay.type", "essay.set", "essay.revised", "essay.at", "essay.plan", "essay.slot", "timer.start", "topic.open", "practice.set", "practice.marked", "practice.settle", "practice.second",
  "walk", "practice.clear", "paper.enter", "session.end"]);
/** What a route answers when work is asked for and no one is at the desk to own it. */
export const NOBODY_AT_DESK = "No one is at the desk yet. Choose who on the TV's desk (Down to Choose who).";
/** The status when a paper's rows were fine but the learner file could not be written (App Master ruling 11): the disk failed, not the rows. */
export const PAPER_NOT_SAVED = "That paper was not saved: the desk could not write it to the learner file, so progress was not saved. Send it again.";
/** The most pages a learner holds, in the session and in each away slot (HF3): every page carries its photo, and every event rewrites the whole session. A new page past it drops the oldest whole. */
export const PAGES_KEPT = 8;
/** The status when a page was read but the learner file could not be written (HF2): the page is on the desk, tonight's record and the week do not have it. */
export const READ_NOT_SAVED = "That page was read, but the desk could not write it to the learner file, so tonight's record and the week do not have it.";
/** The status when a page was read but session.json could not be written (HF4): the page is on the desk, and it is gone if the desk restarts. */
export const READ_NOT_KEPT = "That page was read, but the desk could not save it, so it will be gone if the desk restarts.";
/** The status when an answer was settled but the learner file could not be written (WD9): the item is settled on the desk, tonight's record and the week still show the old count. */
export const SETTLE_NOT_SAVED = "That answer was settled, but the desk could not write it to the learner file, so tonight's record and the week still show the old count.";
/** The status when no row of a paper survived cleanPaper: the rows are the problem, and the phone shows each drop. */
export const PAPER_NO_ROW = "The desk kept no question from that paper.";
/** The screens a desk with no one at it can show: the desk itself, pairing, and choosing or making a learner. */
export const UNSEATED_SCREENS = new Set<Screen>(["landing", "pair", "joined", "learner", "profile"]);

/** The local day a moment falls in, as the log is stamped with it. */
const loggedIn = (l: { problems: string[]; hints: number; hard: string[] }) => !!(l.problems.length || l.hints || l.hard.length);

/**
 * The evening log (problems, hints, hard, minutes, started) belongs to one evening: stamped with the server's local day
 * when it is first written, and cleared by the first event of a later day - the seated learner's and every away slot's.
 * session.end clears nothing, because the recap still reads the log it ends. A log from before the stamp is dated by
 * the day its timer started.
 */
function dayed(s: Session, e: Event, now = Date.now()): Session {
  const today = dayOf(now), was = s.log.day ?? (s.log.started ? dayOf(s.log.started) : undefined);
  if (e.type === "session.end" || !was || was === today) return s;
  const away = s.away ? Object.fromEntries(Object.entries(s.away).map(([k, x]) => [k, { ...x, log: { problems: [], hints: 0, hard: [] } }])) : undefined;
  return { ...s, log: { problems: [], hints: 0, hard: [], minutes: 0, started: null }, ...(away ? { away } : {}) };
}
function stamped(n: Session, now = Date.now()): Session {
  if (n.log.day || !(loggedIn(n.log) || n.log.minutes || n.log.started || Object.values(n.away ?? {}).some((x) => loggedIn(x.log)))) return n;
  return { ...n, log: { ...n.log, day: dayOf(now) } };
}

export function reduce(s: Session, e: Event): Session { return stamped(step(dayed(s, e), e)); }

function step(s: Session, e: Event): Session {
  if (!s.learner && NEEDS_LEARNER.has(e.type)) return s;
  const n: Session = { ...s, updatedAt: Date.now() }, me = s.learner?.id ?? "";
  switch (e.type) {
    case "linga.changed": if (e.conversation !== undefined) n.conversation = e.conversation; if (e.check !== undefined) n.check = e.check; if (e.screen) { n.screen = e.screen; n.subject = "english"; n.focus = e.focus ?? (["linga-talk", "linga-coach", "linga-check", "linga-verdict", "linga-moment"].includes(e.screen) ? -1 : 0); } break;
    // a join shows the Joined screen only to a TV waiting to be paired (no phone yet, or on the code, or already there);
    // mid-session a phone slips in silently - the learner's page stays. A draft in progress owns the screen: never the profile
    case "join": { const waiting = !s.joined || s.screen === "pair" || s.screen === "joined"; n.joined = true;
      if (waiting && s.screen !== "profile") { n.screen = "joined"; n.focus = 0; } break; }
    // a phone forgetting the desk drops its own cookie (the session route); the desk itself does not change
    case "leave": return s;
    // the landing with no stop named: the lamp rests on what was left (tv/landingRows.ts LANDING_REST)
    case "nav": if (!s.learner && !UNSEATED_SCREENS.has(e.screen)) { n.screen = "learner"; n.focus = 0; n.back = "landing"; break; }
      n.screen = e.screen; n.focus = e.focus ?? (e.screen === "landing" ? LANDING_REST : 0); if (e.from) n.back = e.from; break;
    case "focus": n.focus = e.focus; break;
    // a learner chosen or saved goes to the desk, not to one app: the lamp rests on what that learner left, among their own apps
    case "learner.set": { const p = s.profiles.find((x) => x.id === e.id); if (!p) break; if (p.id !== s.learner?.id) { n.conversation = null; n.check = null; n.english = null; n.worked = null; n.workroom = null; } seat(s, n, p.id); n.learner = { id: p.id, name: p.name }; n.screen = "landing"; n.focus = LANDING_REST; break; }
    case "profile.draft": { const d: Profile = pathChecked({ ...(s.draft ?? { id: "p" + Date.now(), name: "", type: "high-school" as StudentType, modules: ["maths", "english", "essay"] as Subject[] }), ...modeChecked(e.patch) });
      // the age first (a type change may clear it), then the Adult gate on what is left
      const r = AGE_RANGE[d.type]; if (!r || (d.age !== undefined && (d.age < r[0] || d.age > r[1]))) delete d.age; n.draft = adultGated(d, s.draft); break; }
    case "profile.save": { const d = s.draft; if (!d || !d.name.trim()) break; const has = s.profiles.some((p) => p.id === d.id);
      n.profiles = has ? s.profiles.map((p) => (p.id === d.id ? d : p)) : [...s.profiles, d];
      n.conversation = null; seat(s, n, d.id); n.learner = { id: d.id, name: d.name }; n.draft = null; n.screen = "landing"; n.focus = LANDING_REST; break; }
    case "profile.discard": n.draft = null; n.screen = "learner"; n.focus = 0; break;
    case "subject": n.subject = e.subject; break;
    case "page.reading": { const ix = s.pages.findIndex((p) => p.id === e.page.id);
      // `day` is the local day it was snapped, kept when the same page is read again in place (an older page without one stays without)
      const page: Page = { ...e.page, items: [], owner: e.page.owner ?? me, ...(ix >= 0 ? (s.pages[ix].day ? { day: s.pages[ix].day } : {}) : { day: dayOf(Date.now()) }) }; n.pages = ix >= 0 ? s.pages.map((p, i) => (i === ix ? page : p)) : [...s.pages, page].slice(-PAGES_KEPT);
      n.pageIx = ix >= 0 ? ix : n.pages.length - 1; n.itemIx = 0; n.reading = true; n.screen = "page"; n.subject = e.page.subject; n.awaiting = null; break; }
    // the desk asks for a page and stays where it is; the phone answers with page.reading
    case "page.ask": n.awaiting = e.subject; n.subject = e.subject; break;
    case "page.unask": n.awaiting = null; break;
    // a read that ends after its learner left lands on their page in `away`
    case "page.read": { const read = (p: Page) => (p.id === e.id ? { ...p, items: e.items, readMs: e.readMs, provider: e.provider, ...(e.missing !== undefined ? { missing: e.missing } : {}) } : p);
      const who = s.pages.some((p) => p.id === e.id) ? null : awayWith(s, (x) => x.pages.some((p) => p.id === e.id));
      if (who) { toAway(s, n, who, (x) => ({ ...x, pages: x.pages.map(read), reading: false })); break; }
      n.pages = s.pages.map(read); n.reading = false; break; }
    case "page.select": n.pageIx = e.pageIx; n.itemIx = e.itemIx ?? 0; break;
    case "item": n.itemIx = e.itemIx; break;
    case "view": n.view = e.view; break;
    // every hint the model gives counts once, here; a first hint starts a new lesson pick, so the last one's lesson goes
    case "hint.set": { const hint = { ...e.hint, owner: e.hint.owner ?? me };
      if (hint.owner !== me) { toAway(s, n, hint.owner, (x) => ({ ...x, hint, ...(hint.stage === 1 ? { lesson: null, noLesson: false } : {}),
        log: { ...x.log, problems: Array.from(new Set([...x.log.problems, hint.key])), hints: x.log.hints + 1 } })); break; }
      n.hint = hint; n.screen = "hint"; n.focus = 0; n.log = { ...s.log, problems: Array.from(new Set([...s.log.problems, e.hint.key])), hints: s.log.hints + 1 };
      if (e.hint.stage === 1) { n.lesson = null; n.noLesson = false; } break; }
    case "hint.stage": if (e.owner && e.owner !== me) { toAway(s, n, e.owner, (x) => (x.hint ? { ...x, hint: { ...x.hint, stage: e.stage }, log: e.stage === 2 ? { ...x.log, hard: Array.from(new Set([...x.log.hard, x.hint.problem])) } : x.log } : null)); break; }
      if (n.hint) { n.hint = { ...n.hint, stage: e.stage }; if (e.stage === 2) n.log = { ...s.log, hard: Array.from(new Set([...s.log.hard, n.hint.problem])) }; } break;
    // a pick made for one hint never lands on another; a lesson chosen on the TV (no key) always does
    case "lesson.set": if (e.key !== undefined && e.key !== s.hint?.key) { const who = awayWith(s, (x) => x.hint?.key === e.key); if (!who) return s;
        toAway(s, n, who, (x) => ({ ...x, lesson: e.lesson && { ...e.lesson, owner: who }, noLesson: !e.lesson })); break; }
      n.lesson = e.lesson && { ...e.lesson, owner: s.hint?.owner ?? me }; n.noLesson = !e.lesson;
      // a new lesson opens playing (the embed autoplays): the last one's Pause is not this one's
      if (e.lesson && e.lesson.id !== s.lesson?.id) n.lessonPaused = false; break;
    case "lesson.watched": if (s.watch && watchDue(s.watch, Date.now())) n.watch = { ...s.watch, logged: true }; break;
    case "job.start": n.jobs = { ...s.jobs, [e.kind]: { id: e.id, phase: "running", startedAt: Date.now(), ...(e.key !== undefined ? { key: e.key } : {}), ...(e.input ? { input: e.input } : {}) } }; break;
    case "job.done": case "job.failed": { const j = s.jobs?.[e.kind]; if (!j || j.id !== e.id) return s;
      n.jobs = { ...s.jobs, [e.kind]: e.type === "job.done" ? { ...j, phase: "done", endedAt: Date.now() } : { ...j, phase: "failed", endedAt: Date.now(), error: e.error } };
      // a lesson pick that failed for the hint on screen ends the wait the same way "no lesson" does
      if (e.type === "job.failed" && e.kind === "lesson" && j.key === s.hint?.key) { n.lesson = null; n.noLesson = true; }
      break; }
    case "lesson.pause": n.lessonPaused = e.paused; break;
    case "english.set": n.english = e.analysis; n.screen = "sentence"; n.subject = "english"; n.focus = 0; break;
    // a paragraph (and its lens) is the learner's who asked: a reading that lands after they left goes to their slot, and the TV stays put
    case "essay.type": if (e.owner && e.owner !== me) { toAway(s, n, e.owner, (x) => ({ ...x, essayType: e.essayType })); break; }
      n.essayType = e.essayType; break;
    // a new reading opens on its first faulty sentence; essay.at walks the paragraph (a number it does not have is the default)
    case "essay.set": if (e.owner && e.owner !== me) { toAway(s, n, e.owner, (x) => ({ ...x, essay: e.analysis, essayAt: null })); break; }
      n.essay = e.analysis; n.essayAt = null; n.screen = "forensic"; n.subject = "essay"; n.focus = 0; break;
    // a piece's later paragraphs (v2 E1): the reading grows where the learner is, without moving the screen or the sentence
    case "essay.progress": if (e.owner && e.owner !== me) { toAway(s, n, e.owner, (x) => ({ ...x, essay: e.analysis })); break; }
      if (s.essay?.text !== e.analysis.text) break; n.essay = e.analysis; break;
    // one sentence rewritten in place (POST /api/analyse kind 'rewrite'): the TV stays on it, on its forensic page;
    // a rewrite that holds, with another sentence still faulty, hands focus to Next sentence (tv/keys focusAfterRewrite)
    case "essay.revised": n.essay = e.analysis; n.essayAt = e.analysis.sentences.some((x) => x.n === e.n) ? e.n : null; n.subject = "essay";
      n.focus = focusAfterRewrite(e.analysis, e.n, s.screen === "forensic" ? s.focus : 0); n.screen = "forensic"; break;
    // the plan opens empty on a lens (a plan with sentences in it keeps them: the learner's words are never thrown away by pressing OK again)
    case "essay.plan": n.essayPlan = s.essayPlan?.slots.some(Boolean) ? { ...s.essayPlan, lens: e.lens } : { lens: e.lens, slots: planSlots(PLAYBOOK.find((p) => p.id === "para") ?? PLAYBOOK[0]).map(() => "") };
      n.essayType = e.lens; n.subject = "essay"; break;
    // a refused sentence changes nothing but the status line; a written one moves the caret to the first empty slot (or Read it)
    case "essay.slot": { if (!s.essayPlan) break; const r = planFill(s.essayPlan, e.i, e.text); if (!r.ok) { n.status = r.error; break; }
      n.essayPlan = r.plan; if (s.screen === "essayplan") { const open = r.plan.slots.findIndex((x) => !x); n.focus = open < 0 ? r.plan.slots.length : open; } break; }
    case "essay.at": n.essayAt = e.n !== null && s.essay?.sentences.some((x) => x.n === e.n) ? e.n : null; break;
    // an id no task anywhere on the desk has (this learner's list, and every learner's in `away`), so a tick that names
    // one learner's task can never land on another's - even two added in the same millisecond, across a learner switch
    case "task.add": { const id = newTaskId(s);
      n.tasks = [...s.tasks, { id, sub: e.sub, name: e.name, min: e.min, done: false }]; break; }
    case "task.done": n.tasks = s.tasks.map((t) => (t.id === e.id ? { ...t, done: e.done } : t)); break;
    case "timer.start": n.timer = { ...s.timer, running: true }; if (!s.log.started) n.log = { ...s.log, started: Date.now() }; break;
    case "timer.pause": n.timer = { ...s.timer, running: false }; break;
    case "timer.tick": { if (!s.timer.running) break; const left = Math.max(0, s.timer.left - e.seconds); const t = { ...s.timer, left };
      if (t.phase === "work") n.log = { ...s.log, minutes: s.log.minutes + e.seconds / 60 };
      if (left === 0) { if (t.phase === "work") { t.phase = "break"; t.left = 5 * 60; t.before = s.screen; n.screen = "break"; } else { t.phase = "work"; t.left = 25 * 60; n.screen = t.before ?? "page"; } }
      n.timer = t; break; }
    case "timer.skipbreak": n.timer = { ...s.timer, phase: "work", left: 25 * 60 }; n.screen = s.timer.before ?? "page"; break;
    // the open topic keeps the focus, so a set that fails is retried on the topic it was asked for; the focus is the topic's
    // place on the learner's own path (a topic of the other path, or an unknown id, is the first stop)
    // a worked lesson lands for the learner who asked, and only while they are at the desk
    // the paper is kept by dispatch (the reducer writes no file); the TV is then on its recovery list
    case "paper.enter": n.subject = "maths"; n.screen = "paper"; n.focus = 0; break;
    case "worked.set": if (e.owner && e.owner !== me) break; n.worked = { ...e.worked, owner: e.owner ?? me }; n.topic = e.worked.topic; n.subject = "maths"; n.screen = "worked"; n.focus = 0; break;
    // the Workroom summary for the learner at the desk; `open` also puts it on the TV
    case "workroom.set": if (e.workroom.owner !== me) break; n.workroom = e.workroom; if (e.open) { n.screen = "workroom"; n.subject = "essay"; n.focus = 0; } break;
    case "topic.open": n.topic = e.topic; n.subject = "maths"; if (e.stay) break; n.screen = "topics"; n.focus = Math.max(0, topicsOf(learnerPath(s)).findIndex((t) => t.id === e.topic)); break;
    case "practice.set": n.practice = shownPractice({ ...e.practice, owner: e.practice.owner ?? me }); n.topic = e.practice.topic; n.walkIx = 0; n.screen = "practice"; break;
    // a marked set lands on the sheet - all six verdicts at once - focused on the first item to look at
    case "practice.marked": if (e.owner && e.owner !== me) { toAway(s, n, e.owner, (x) => (x.practice ? { ...x, practice: { ...x.practice, items: e.items.map(shown), marked: true }, walkIx: 0 } : null)); break; }
      if (s.practice) { n.practice = { ...s.practice, items: e.items.map(shown), marked: true }; n.walkIx = 0; n.screen = "sheet"; n.focus = firstToLook(n.practice.items); } break;
    // an explanation: the reply always lands on its item; a verdict only on an item still unsure (a settled item stays settled);
    // on an item already wrong, a slip with no verdict renames it - from the topic's vocabulary only, verdict and pen untouched
    case "practice.settle": if (s.practice) { const topic = s.practice.topic; n.practice = { ...s.practice, items: s.practice.items.map((it) => it.n !== e.n ? it
      : shown(e.verdict && it.verdict === "unsure" ? { ...it, verdict: e.verdict, slip: e.slip, said: e.said ?? it.said, reply: e.reply, slipAt: e.slipAt }
        : !e.verdict && e.slip && it.verdict === "wrong" && slipsFor(topic).some((x) => x.id === e.slip) ? { ...it, slip: e.slip, said: e.said ?? it.said, reply: e.reply }
        : { ...it, reply: e.reply })) }; } break;
    // the one typed second go of a wrong item, judged by the route that checked the answer: set once, and nothing else on the item moves
    case "practice.second": { const it = s.practice?.items.find((x) => x.n === e.n);
      if (!s.practice || !it || it.verdict !== "wrong" || it.second || (e.verdict !== "right" && e.verdict !== "wrong")) return s;
      n.practice = { ...s.practice, items: s.practice.items.map((x) => (x.n === e.n ? shown({ ...x, second: e.verdict }) : x)) }; break; }
    case "walk": { const len = s.practice?.items.length ?? 0; n.walkIx = len ? Math.min(len - 1, Math.max(0, e.ix)) : 0; break; }
    case "practice.clear": n.practice = null; n.topic = null; n.screen = "tonight"; n.focus = 0; break;
    case "status": n.status = e.text; break;
    case "session.end": n.timer = { ...s.timer, running: false }; n.screen = "recap"; n.focus = 0; n.log = { ...s.log, endedAt: Date.now() }; break;
    case "reset": return fresh();
  }
  // a set being written is for the learner who asked: another learner at the desk supersedes it, and its late result is dropped by id
  if (n.learner?.id !== s.learner?.id && s.jobs?.practice?.phase === "running") { n.jobs = { ...s.jobs }; delete n.jobs.practice; }
  const w = watchOf(n.watch ?? null, n, n.updatedAt);
  if (w !== (n.watch ?? null)) n.watch = w;
  return n;
}

/**
 * The lesson's watch after any event (library/watched.ts has the rule): it runs while the lesson screen is on, the
 * lesson open and not paused; a stretch that ends is added to what it had played. A different lesson, or another
 * learner at the desk, starts from nothing - played time is the seated learner's, on this lesson. Unchanged, the
 * same object comes back.
 */
export function watchOf(was: Watch | null, n: Session, now: number): Watch | null {
  const l = n.lesson, who = n.learner;
  // no one seated: nothing is being watched by anyone
  if (!l || !who) return null;
  const on = n.screen === "lesson" && !n.lessonPaused;
  const mine = was && was.id === l.id && was.owner === who.id ? was : null;
  if (!mine && !on) return null;
  const w = mine ?? { id: l.id, owner: who.id, ms: 0, since: null, logged: false };
  if (on) return w.since === null ? { ...w, since: now } : w;
  return w.since === null ? w : { ...w, ms: w.ms + Math.max(0, now - w.since), since: null };
}

/** The watched lesson's dated line, in its learner's own history - what Units and the calendar tick by. */
function logWatched(w: Watch): void {
  const l = LESSONS.find((x) => x.id === w.id);
  addHistory(w.owner, { at: Date.now(), kind: "lesson", label: l?.title ?? getSession().lesson?.title ?? w.id, detail: "watched", ref: w.id });
}

// ---- the singleton, HMR-proof ----
type Sub = (s: Session) => void;
interface Store { session: Session; subs: Set<Sub>; ticker: NodeJS.Timeout | null; /** whether the last session.json write landed (HF4); a store HMR kept from before has none, which reads as landed */ saved?: boolean; /** whether the last practice.settle restate of the learner file landed (WD9); a missing value reads as landed */ settled?: boolean; }
const g = globalThis as unknown as { __desk?: Store };
function load(): Session { try { if (existsSync(FILE)) { const j = JSON.parse(readFileSync(FILE, "utf8")); const bad = !Array.isArray(j?.profiles) ? "profiles is not a list" : !(j?.learner === null || j?.learner?.id) ? "learner is neither null nor a learner with an id" : !j.profiles.every((p: Profile) => p.type in AGE_RANGE) ? "a profile has a type that is not known" : null; if (bad) console.error(`desk session: session.json was not used, it failed the shape check (${bad}); starting fresh`); else return settleOwners({ ...fresh(), ...j, profiles: j.profiles.map((p: Profile) => modeChecked(pathChecked(p))), practice: shownPractice(j.practice), away: awayShown(j.away), jobs: settled(j.jobs), watch: null, phoneUrl: phoneUrl(), reading: false, englishLearning: j.learner ? getLearner(j.learner.id).english : emptyEnglish(), conversation: j.conversation ? { moment: null, moments: [], ...j.conversation, pending: null, capture: false, paused: true } : null, check: j.check ? { ...j.check, pending: null } : null }, (id) => getLearner(id).history); } } catch (e) { console.error(`desk session: session.json was not used, it could not be read (${e instanceof Error ? e.message : e}); starting fresh`); } return fresh(); }
/** The away learners' work as saved: an answer that reached the file stops here too, and a read under way ended with the desk. */
function awayShown(a: unknown): Record<string, MathsSlot> | undefined {
  if (!a || typeof a !== "object") return undefined;
  return Object.fromEntries(Object.entries(a as Record<string, MathsSlot>).map(([k, x]) => [k, { ...emptySlot(), ...x, practice: shownPractice(x.practice), reading: false }]));
}
if (!g.__desk) g.__desk = { session: load(), subs: new Set(), ticker: null };
const store = g.__desk;
// HMR can retain a session created before this feature was installed.
if (!store.session.englishLearning) store.session.englishLearning = store.session.learner ? getLearner(store.session.learner.id).english : emptyEnglish();
if (store.session.conversation === undefined) store.session.conversation = null;
if (store.session.check === undefined) store.session.check = null;
if (!store.session.jobs) store.session.jobs = {};
// ...and one whose Math Buddy work has no owner yet (settleOwners)
try { store.session = settleOwners(store.session, (id) => getLearner(id).history); } catch {}
// the Sunday page is drawn fresh for whoever is seated, never taken from the file
store.session = { ...store.session, week: weekRead(store.session) };
// the learner's latest paper (v2 M5b), read back through cleanPaper from their record, never taken from the saved session
try { store.session = { ...store.session, paper: store.session.learner ? getLearner(store.session.learner.id).papers?.at(-1) ?? null : null }; } catch {}
if (!store.ticker) store.ticker = setInterval(() => {
  if (store.session.timer.running) dispatch({ type: "timer.tick", seconds: 1 });
  if (watchDue(store.session.watch, Date.now())) dispatch({ type: "lesson.watched" });
  const c=store.session.conversation;
  if(c?.capture&&Date.now()-c.captureAt>50000)dispatch({type:"linga.changed",conversation:{...c,capture:false}});
}, 1000);

export function getSession() { return store.session; }
/**
 * Events after which the learner's measured skills may have changed, or a different learner is
 * at the desk. The reducer stays pure: the file read happens here, at the boundary that already
 * writes to disk and pushes to subscribers.
 */
const REHYDRATE = new Set(["learner.set", "practice.marked", "practice.settle", "profile.save", "reset", "join", "page.read", "linga.changed", "essay.set", "essay.progress", "essay.revised", "lesson.watched", "paper.enter"]);

/**
 * A settled item changes its set's count: the line marking wrote (the last practice line, this topic, this n)
 * is restated from the item verdicts as they now stand (rules/maths). A recount, and no entry is added.
 * The week's digest entry for the same set (Family W9: the last maths entry, this topic, this n) is restated the same
 * way (rules/digest mathsEntry: its counts and its slip), keeping its date and its step-up flag.
 */
function restateMarked(s: Session): void {
  if (!s.learner) return;
  const p = s.practice, l = getLearner(s.learner.id);
  const at = l.history.findLastIndex((h) => h.kind === "practice"), h = l.history[at];
  const detail = p?.marked && h && labelOf(h.label, p.topic) ? restatedLine(h.detail, p.items) : null;
  const history = detail && detail !== h.detail ? l.history.map((x, i) => (i === at ? { ...x, detail } : x)) : null;
  const di = l.digest.findLastIndex((d) => d.kind === "maths"), d = l.digest[di];
  const entry = p?.marked && d?.kind === "maths" && d.topic === p.topic && d.total === p.items.length ? mathsEntry(p.topic, p.items, d.stretch === true, d.at) : null;
  const digest = entry && JSON.stringify(entry) !== JSON.stringify(d) ? l.digest.map((x, i) => (i === di ? entry : x)) : null;
  if (history || digest) saveLearner({ ...l, ...(history ? { history } : {}), ...(digest ? { digest } : {}) });
}

/**
 * What one hint event added to its owner's evening log, as the reducer counted it (MB-B14): every hint.set is one hint,
 * and a problem counts once toward "needed a second" when it first joins the log's hard list (hint.stage 2). The owner
 * is the hint's (it may be a learner who left the desk: toAway), else the learner seated. The log before is read as the
 * reducer saw it, after a new evening's clearing (dayed). Null when the event added nothing.
 */
function hintsAdded(was: Session, now: Session, e: Event): { owner: string; hints: number; second: number } | null {
  if (e.type !== "hint.set" && e.type !== "hint.stage") return null;
  const owner = (e.type === "hint.set" ? e.hint.owner : e.owner) ?? was.learner?.id;
  if (!owner) return null;
  const logOf = (s: Session) => (s.learner?.id === owner ? s.log : s.away?.[owner]?.log) ?? { hints: 0, hard: [] };
  const a = logOf(now), b = logOf(dayed(was, e));
  const hints = Math.max(0, a.hints - b.hints), second = Math.max(0, a.hard.length - b.hard.length);
  return hints || second ? { owner, hints, second } : null;
}

/**
 * The Sunday page's lines for the learner at the desk, from their own record (rules/week, no model): null with no one
 * seated. Read at the boundary, like the history: after an event that can change the record or who is seated, and when
 * a session ends. The page is a household convenience on the phone's Parent tab, not a locked view (Phase 1 has no
 * parent lock, owner decision D1).
 */
export function weekOf(s: Session, now = Date.now()): WeekLine[] | null {
  const id = s.learner?.id;
  if (!id) return null;
  return sundayWords(sundayPage(getLearner(id), s.profiles.find((p) => p.id === id), now));
}

/**
 * weekOf as the session holds it: a page that could not be read is logged and said in one authored line (WEEK_UNREAD) -
 * never null, which the phone draws as the empty week, and never the lines held before, which after a switch are another
 * learner's page.
 */
function weekRead(s: Session): WeekLine[] | null {
  try { return weekOf(s); } catch (err) {
    console.error("The week could not be read:", err instanceof Error ? err.message : err);
    return [{ section: "week", text: WEEK_UNREAD }];
  }
}

export function dispatch(e: Event): Session {
  if (e.type === "paper.enter") {
    // the one validation (rules/recovery cleanPaper) decides what is kept; a paper with no row left is not kept, and the TV stays put.
    // A paper addPaper could not write is reported as not saved (ruling 11), never as a paper with no row left; the TV stays put too.
    const id = store.session.learner?.id;
    let kept: StoredPaper | null = null, failed = false;
    if (id) try { kept = addPaper(id, e.rows); } catch (err) { failed = true; console.error("A paper could not be saved:", err instanceof Error ? err.message : err); }
    if (!kept) {
      store.session = { ...store.session, status: !id ? NOBODY_AT_DESK : failed ? PAPER_NOT_SAVED : PAPER_NO_ROW, updatedAt: Date.now() };
      store.subs.forEach((fn) => { try { fn(store.session); } catch {} });
      return store.session;
    }
  }
  const was = store.session.watch, before = store.session;
  store.session = reduce(store.session, e);
  // a hint is counted onto its owner's homework sheet of the day (MB-B14), never one digest entry per hint
  const added = hintsAdded(before, store.session, e);
  let hinted = false;
  if (added) try { hinted = addHints(added.owner, added.hints, added.second); } catch (err) { console.error("A hint could not be counted on the week:", err instanceof Error ? err.message : err); }
  // a settle is a learner's action, so a failed restate is logged once per event, never by the timer; whether it landed is kept for the explain route (WD9)
  if (e.type === "practice.settle") {
    store.settled = true;
    if (e.verdict) try { restateMarked(store.session); } catch (err) { store.settled = false; console.error("A settled answer could not be restated on the learner file:", err instanceof Error ? err.message : err); }
  }
  const w = store.session.watch;
  if (e.type === "lesson.watched" && w?.logged && !was?.logged) try { logWatched(w); } catch {}
  if (REHYDRATE.has(e.type)) {
    const id = store.session.learner?.id;
    if (id) try { const l = getLearner(id); store.session = { ...store.session, skills: l.skills, writing: l.writing, memory: l.memory, history: l.history, englishLearning: l.english, paper: l.papers?.at(-1) ?? null }; } catch {}
  }
  if (REHYDRATE.has(e.type) || e.type === "session.end" || hinted) store.session = { ...store.session, week: weekRead(store.session) };
  writeSession();
  store.subs.forEach((fn) => { try { fn(store.session); } catch {} });
  return store.session;
}
/**
 * The one way session.json is written: a temp file beside it, then a rename over it, so a crash mid-write leaves the old
 * file whole (the way learners.ts writeBook does). Whether it landed is kept for the read route (HF4). The log speaks on a
 * change only, so the timer's once-a-second event cannot flood it.
 */
function writeSession(): void {
  const tmp = path.join(DATA, `session.json.${process.pid}.${Date.now().toString(36)}.tmp`);
  try {
    mkdirSync(DATA, { recursive: true });
    writeFileSync(tmp, JSON.stringify(store.session));
    renameSync(tmp, FILE);
    if (store.saved === false) console.error("desk session: session.json is being written again");
    store.saved = true;
  } catch (e) {
    try { rmSync(tmp, { force: true }); } catch {}
    if (store.saved !== false) console.error("desk session: session.json could not be written, so the session will not survive a restart:", e instanceof Error ? e.message : e);
    store.saved = false;
  }
}
/** Whether the last practice.settle restate landed (WD9); a settle with no verdict, or none yet, reads as landed. */
export function settleSaved(): boolean { return store.settled !== false; }
/** Whether the last session.json write landed (HF4). */
export function sessionSaved(): boolean { return store.saved !== false; }
export function subscribe(fn: Sub) { store.subs.add(fn); return () => store.subs.delete(fn); }
