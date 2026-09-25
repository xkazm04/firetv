/**
 * One session, on the server, pushed to every subscriber as it changes.
 *
 * The phone POSTs events; the TV (and the phone) subscribe over SSE. The reducer is pure; engine
 * work happens in the route handlers and lands as further events. Kept on globalThis so Next's
 * dev reloads do not lose the desk mid-session; persisted as JSON on every change.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { AGE_RANGE } from "@/tv/profileRows";
import { firstToLook } from "@/tv/sheetRows";
import { LANDING_REST } from "@/tv/landingRows";
import { focusAfterRewrite } from "@/tv/keys";
import path from "node:path";
import { getLearner, saveLearner, type HistoryEntry, type SkillRecord } from "./learners";
import { SYLLABUS } from "../library/syllabus";
import type { RuleCard } from "../rules/english";
import { restatedLine, slipsFor } from "../rules/maths";
import type { Fix, Sentence, Was } from "../rules/essay";
import { emptyEnglish, type Conversation, type EnglishLearning, type LevelCheck } from "../english/types";

export type Subject = "maths" | "english" | "essay";
export type Screen = "landing" | "pair" | "joined" | "tonight" | "units" | "calendar" | "page" | "hint" | "lesson" | "sentence" | "headtohead" | "essaytype" | "forensic" | "playbook" | "xray" | "break" | "recap" | "learner" | "profile" | "topics" | "practice" | "sheet" | "walk" | "linga" | "linga-scenes" | "linga-map" | "linga-talk" | "linga-coach" | "linga-recap" | "linga-check" | "linga-verdict" | "linga-plan" | "linga-moment";

export type StudentType = "elementary" | "high-school" | "other";
/** The school system a learner's progress is read against. One per profile; the desk defaults to UK. */
export type SchoolSystem = "us" | "uk" | "cz" | "de";
export interface Profile { id: string; name: string; type: StudentType; age?: number; system?: SchoolSystem; modules: Subject[]; }


export interface PageItem { n: number; text: string; cx: number; cy: number; band: [number, number]; key: string; }
/**
 * `owner` on a page, a set, a hint and a lesson is the learner it was made for (principle 3: only this learner's), stamped
 * when it is made - by the route that asked, else by the reducer from the learner at the desk. Older sessions have none:
 * settleOwners gives each the learner the desk's own record names.
 */
export interface Page { id: string; subject: Subject; title: string; img: string; w: number; h: number; items: PageItem[]; readMs?: number; provider?: string; owner?: string; }
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
}
export interface SlipAt { line: number; span?: string; kind?: "missing" | "sign" | "extra" }
const slipAtOf = (x: unknown): SlipAt | undefined => {
  const o = x as Partial<SlipAt> | null;
  if (!o || typeof o !== "object" || !Number.isInteger(o.line) || o.line! < 0) return undefined;
  const at: SlipAt = { line: o.line! };
  if (typeof o.span === "string" && o.span.trim()) at.span = o.span;
  if (o.kind === "missing" || o.kind === "sign" || o.kind === "extra") at.kind = o.kind;
  return at;
};
export interface Practice { topic: string; items: PracticeItem[]; pageId?: string; marked: boolean; owner?: string; }

/** Only the fields a screen may see — an answer riding in on an event or an older session.json stops here. */
function shown({ n, question, studentAnswer, studentWorking, verdict, slip, said, reply, slipAt }: PracticeItem): PracticeItem {
  const item: PracticeItem = { n, question };
  if (studentAnswer !== undefined) item.studentAnswer = studentAnswer;
  if (studentWorking !== undefined) item.studentWorking = studentWorking;
  if (verdict !== undefined) item.verdict = verdict;
  if (slip !== undefined) item.slip = slip;
  if (said !== undefined) item.said = said;
  if (reply !== undefined) item.reply = reply;
  const at = slipAtOf(slipAt);
  if (at && verdict === "wrong") item.slipAt = at;
  return item;
}
const shownPractice = (p: Practice | null | undefined): Practice | null => (p ? { ...p, items: (p.items ?? []).map(shown) } : null);
/**
 * The homework pipelines (lib/desk/job.ts runs each one). One record per kind: the latest run of that kind,
 * so a screen can tell "under way" from "done" from "failed" without inferring it from a scatter of flags.
 * `id` names the run (a later run of the same kind replaces it, and events for an older run are dropped);
 * `key` is what the run is about (the topic of a practice set, the item key of a hint and of its lesson pick);
 * `error` is a sentence the desk would say, never an exception's text.
 */
export type JobKind = "read" | "hint" | "lesson" | "explain" | "mark" | "practice" | "analyse" | "memory";
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
export interface EssayAnalysis { text: string; type: string; sentences: Sentence[]; stats: Record<string, number>; verdicts: Verdict[]; summary: string; provider?: string; }

export interface Session {
  pin: string; joined: boolean; phoneUrl: string; learner: { id: string; name: string };
  profiles: Profile[]; draft: Profile | null;
  subject: Subject; screen: Screen; focus: number; view: "band" | "overview"; back?: Screen;
  tasks: Task[]; timer: { left: number; running: boolean; phase: "work" | "break"; before?: Screen };
  pages: Page[]; pageIx: number; itemIx: number; reading: boolean;
  /** The desk has asked for a page and is waiting for the phone to snap it. */
  awaiting: Subject | null;
  hint: Hint | null; lesson: LessonPick | null; noLesson: boolean; lessonPaused: boolean;
  english: EnglishAnalysis | null; essay: EssayAnalysis | null; essayType: string | null;
  /** The sentence (its number) the forensic page is about; null for the default, the first faulty one. */
  essayAt?: number | null;
  englishLearning: EnglishLearning; conversation: Conversation | null;
  /** finding the level and agreeing the topics, while it is under way */
  check: LevelCheck | null;
  /** the open maths topic, the practice set on it, and where the walk has got to */
  topic: string | null; practice: Practice | null; walkIx: number;
  /** the current learner's measured skills, hydrated at the dispatch boundary from data/learners.json */
  skills: Record<string, SkillRecord>;
  /** the same measured record per Essay Master lens, hydrated the same way */
  writing: Record<string, SkillRecord>;
  /** what the desk noticed about this learner, and what actually happened, hydrated the same way */
  memory: string[]; history: HistoryEntry[];
  /** the pipelines' runs, one per kind; see Job */
  jobs: Jobs;
  /**
   * Math Buddy's work of the learners not at the desk, by learner id (see MathsSlot). Never sent to a screen
   * (lib/session/pairing.ts view); the seated learner's own is in the fields above.
   */
  away?: Record<string, MathsSlot>;
  status: string; log: { problems: string[]; hints: number; hard: string[]; minutes: number; started: number | null };
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
  | { type: "page.reading"; page: Omit<Page, "items"> } | { type: "page.read"; id: string; items: PageItem[]; readMs: number; provider: string }
  | { type: "page.ask"; subject: Subject } | { type: "page.unask" }
  | { type: "page.select"; pageIx: number; itemIx?: number } | { type: "item"; itemIx: number } | { type: "view"; view: "band" | "overview" }
  | { type: "hint.set"; hint: Hint } | { type: "hint.stage"; stage: 1 | 2; owner?: string }
  | { type: "lesson.set"; lesson: LessonPick | null; key?: string } | { type: "lesson.pause"; paused: boolean }
  | { type: "english.set"; analysis: EnglishAnalysis } | { type: "essay.type"; essayType: string } | { type: "essay.set"; analysis: EssayAnalysis } | { type: "essay.at"; n: number | null }
  | { type: "essay.revised"; analysis: EssayAnalysis; n: number }
  | { type: "task.add"; name: string; sub: Subject; min: number } | { type: "task.done"; id: string; done: boolean }
  | { type: "timer.start" } | { type: "timer.pause" } | { type: "timer.tick"; seconds: number } | { type: "timer.skipbreak" }
  | { type: "topic.open"; topic: string }
  | { type: "practice.set"; practice: Practice } | { type: "practice.marked"; items: PracticeItem[]; owner?: string }
  | { type: "walk"; ix: number } | { type: "practice.clear" }
  | { type: "practice.settle"; n: number; reply: string; verdict?: "right" | "wrong"; slip?: string; said?: string; slipAt?: SlipAt }
  | { type: "job.start"; kind: JobKind; id: string; key?: string; input?: JobInput } | { type: "job.done"; kind: JobKind; id: string } | { type: "job.failed"; kind: JobKind; id: string; error: string }
  | { type: "status"; text: string } | { type: "session.end" } | { type: "reset" };

const DATA = process.env.DESK_DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA, "session.json");

/** Where the phone lives on this network — a fact of the server, so the session carries it. */
function phoneUrl(): string {
  const ip = Object.values(networkInterfaces()).flat().find((n) => n && n.family === "IPv4" && !n.internal)?.address ?? "localhost";
  return `http://${ip}:${process.env.PORT ?? "3000"}/phone`;
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
}
const emptySlot = (): MathsSlot => ({ pages: [], pageIx: 0, itemIx: 0, reading: false, hint: null, lesson: null, noLesson: false, lessonPaused: false, topic: null, practice: null, walkIx: 0, log: { problems: [], hints: 0, hard: [] }, tasks: [] });
const slotOf = (s: Session): MathsSlot => ({ pages: s.pages, pageIx: s.pageIx, itemIx: s.itemIx, reading: s.reading, hint: s.hint, lesson: s.lesson, noLesson: s.noLesson, lessonPaused: s.lessonPaused,
  topic: s.topic, practice: s.practice, walkIx: s.walkIx, log: { problems: s.log.problems, hints: s.log.hints, hard: s.log.hard }, tasks: s.tasks ?? [] });
const emptyOf = (x: MathsSlot) => !x.pages.length && !x.practice && !x.hint && !x.lesson && !x.topic && !x.log.hints && !x.log.problems.length && !x.tasks?.length;
/** A slot onto the session's fields; the log keeps the desk's clock (minutes, started), which is the evening's, not a learner's. */
function withSlot(n: Session, x: MathsSlot): void { const { log, ...rest } = x; Object.assign(n, rest); n.log = { ...n.log, ...log }; }
/** Who sits down: the learner leaving takes their work to `away`, the learner arriving gets theirs back (or a clean desk). */
function seat(s: Session, n: Session, id: string): void {
  if (id === s.learner.id) return;
  const away = { ...(s.away ?? {}) }, left = slotOf(s);
  if (emptyOf(left)) delete away[s.learner.id]; else away[s.learner.id] = left;
  withSlot(n, away[id] ?? emptySlot()); delete away[id]; n.away = away;
}
/** A result that lands after its learner left the desk goes to their work in `away`, never onto the seated learner's. */
function toAway(s: Session, n: Session, owner: string, f: (x: MathsSlot) => MathsSlot | null): void {
  const y = f(s.away?.[owner] ?? emptySlot()); if (y) n.away = { ...(s.away ?? {}), [owner]: y };
}
const awayWith = (s: Session, has: (x: MathsSlot) => boolean) => Object.keys(s.away ?? {}).find((k) => has(s.away![k]));

/**
 * Who each Math Buddy object belongs to, for a session saved before the stamps, from the desk's own record: a page, the
 * learner whose history has its "homework" line (the same title, written after it was snapped - api/read writes it as the
 * read ends); a set, the owner of the page it was snapped on, else (marked) the learner with the latest "practice" line on
 * its topic; a hint, the owner of the page its problem is on; a lesson, its hint's. Whatever the record does not name is
 * the learner at the desk when the session was saved, so a desk with one learner keeps everything where it was. Then only
 * the seated learner's stays in the session's fields and every other learner's goes to `away`. Pure: histories are passed in.
 */
export function settleOwners(s: Session, historyOf: (id: string) => HistoryEntry[]): Session {
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
    const topic = practice.topic, name = SYLLABUS.find((t) => t.id === topic)?.name ?? topic;
    let byLine: [string, number] | null = null;
    if (practice.marked) for (const id of ids) for (const h of lines(id)) if (h.kind === "practice" && h.label === name && (!byLine || h.at > byLine[1])) byLine = [id, h.at];
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
    pin: String(1000 + Math.floor(Math.random() * 9000)), joined: false, phoneUrl: phoneUrl(), learner: { id: "ema", name: "Ema" },
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

export function reduce(s: Session, e: Event): Session {
  const n: Session = { ...s, updatedAt: Date.now() };
  switch (e.type) {
    case "linga.changed": if (e.conversation !== undefined) n.conversation = e.conversation; if (e.check !== undefined) n.check = e.check; if (e.screen) { n.screen = e.screen; n.subject = "english"; n.focus = e.focus ?? (["linga-talk", "linga-coach", "linga-check", "linga-verdict", "linga-moment"].includes(e.screen) ? -1 : 0); } break;
    // a join shows the Joined screen only to a TV waiting to be paired (no phone yet, or on the code, or already there);
    // mid-session a phone slips in silently - the learner's page stays. A draft in progress owns the screen: never the profile
    case "join": { const waiting = !s.joined || s.screen === "pair" || s.screen === "joined"; n.joined = true;
      if (waiting && s.screen !== "profile") { n.screen = "joined"; n.focus = 0; } break; }
    // a phone forgetting the desk drops its own cookie (the session route); the desk itself does not change
    case "leave": return s;
    // the landing with no stop named: the lamp rests on what was left (tv/landingRows.ts LANDING_REST)
    case "nav": n.screen = e.screen; n.focus = e.focus ?? (e.screen === "landing" ? LANDING_REST : 0); if (e.from) n.back = e.from; break;
    case "focus": n.focus = e.focus; break;
    // a learner chosen or saved goes to the desk, not to one app: the lamp rests on what that learner left, among their own apps
    case "learner.set": { const p = s.profiles.find((x) => x.id === e.id); if (!p) break; if (p.id !== s.learner.id) { n.conversation = null; n.check = null; n.english = null; } seat(s, n, p.id); n.learner = { id: p.id, name: p.name }; n.screen = "landing"; n.focus = LANDING_REST; break; }
    case "profile.draft": { const d: Profile = { ...(s.draft ?? { id: "p" + Date.now(), name: "", type: "high-school" as StudentType, modules: ["maths", "english", "essay"] as Subject[] }), ...e.patch };
      const r = AGE_RANGE[d.type]; if (!r || (d.age !== undefined && (d.age < r[0] || d.age > r[1]))) delete d.age; n.draft = d; break; }
    case "profile.save": { const d = s.draft; if (!d || !d.name.trim()) break; const has = s.profiles.some((p) => p.id === d.id);
      n.profiles = has ? s.profiles.map((p) => (p.id === d.id ? d : p)) : [...s.profiles, d];
      n.conversation = null; seat(s, n, d.id); n.learner = { id: d.id, name: d.name }; n.draft = null; n.screen = "landing"; n.focus = LANDING_REST; break; }
    case "profile.discard": n.draft = null; n.screen = "learner"; n.focus = 0; break;
    case "subject": n.subject = e.subject; break;
    case "page.reading": { const ix = s.pages.findIndex((p) => p.id === e.page.id);
      const page: Page = { ...e.page, items: [], owner: e.page.owner ?? s.learner.id }; n.pages = ix >= 0 ? s.pages.map((p, i) => (i === ix ? page : p)) : [...s.pages, page];
      n.pageIx = ix >= 0 ? ix : n.pages.length - 1; n.itemIx = 0; n.reading = true; n.screen = "page"; n.subject = e.page.subject; n.awaiting = null; break; }
    // the desk asks for a page and stays where it is; the phone answers with page.reading
    case "page.ask": n.awaiting = e.subject; n.subject = e.subject; break;
    case "page.unask": n.awaiting = null; break;
    // a read that ends after its learner left lands on their page in `away`
    case "page.read": { const read = (p: Page) => (p.id === e.id ? { ...p, items: e.items, readMs: e.readMs, provider: e.provider } : p);
      const who = s.pages.some((p) => p.id === e.id) ? null : awayWith(s, (x) => x.pages.some((p) => p.id === e.id));
      if (who) { toAway(s, n, who, (x) => ({ ...x, pages: x.pages.map(read), reading: false })); break; }
      n.pages = s.pages.map(read); n.reading = false; break; }
    case "page.select": n.pageIx = e.pageIx; n.itemIx = e.itemIx ?? 0; break;
    case "item": n.itemIx = e.itemIx; break;
    case "view": n.view = e.view; break;
    // every hint the model gives counts once, here; a first hint starts a new lesson pick, so the last one's lesson goes
    case "hint.set": { const hint = { ...e.hint, owner: e.hint.owner ?? s.learner.id };
      if (hint.owner !== s.learner.id) { toAway(s, n, hint.owner, (x) => ({ ...x, hint, ...(hint.stage === 1 ? { lesson: null, noLesson: false } : {}),
        log: { ...x.log, problems: Array.from(new Set([...x.log.problems, hint.key])), hints: x.log.hints + 1 } })); break; }
      n.hint = hint; n.screen = "hint"; n.focus = 0; n.log = { ...s.log, problems: Array.from(new Set([...s.log.problems, e.hint.key])), hints: s.log.hints + 1 };
      if (e.hint.stage === 1) { n.lesson = null; n.noLesson = false; } break; }
    case "hint.stage": if (e.owner && e.owner !== s.learner.id) { toAway(s, n, e.owner, (x) => (x.hint ? { ...x, hint: { ...x.hint, stage: e.stage }, log: e.stage === 2 ? { ...x.log, hard: Array.from(new Set([...x.log.hard, x.hint.problem])) } : x.log } : null)); break; }
      if (n.hint) { n.hint = { ...n.hint, stage: e.stage }; if (e.stage === 2) n.log = { ...s.log, hard: Array.from(new Set([...s.log.hard, n.hint.problem])) }; } break;
    // a pick made for one hint never lands on another; a lesson chosen on the TV (no key) always does
    case "lesson.set": if (e.key !== undefined && e.key !== s.hint?.key) { const who = awayWith(s, (x) => x.hint?.key === e.key); if (!who) return s;
        toAway(s, n, who, (x) => ({ ...x, lesson: e.lesson && { ...e.lesson, owner: who }, noLesson: !e.lesson })); break; }
      n.lesson = e.lesson && { ...e.lesson, owner: s.hint?.owner ?? s.learner.id }; n.noLesson = !e.lesson; break;
    case "job.start": n.jobs = { ...s.jobs, [e.kind]: { id: e.id, phase: "running", startedAt: Date.now(), ...(e.key !== undefined ? { key: e.key } : {}), ...(e.input ? { input: e.input } : {}) } }; break;
    case "job.done": case "job.failed": { const j = s.jobs?.[e.kind]; if (!j || j.id !== e.id) return s;
      n.jobs = { ...s.jobs, [e.kind]: e.type === "job.done" ? { ...j, phase: "done", endedAt: Date.now() } : { ...j, phase: "failed", endedAt: Date.now(), error: e.error } };
      // a lesson pick that failed for the hint on screen ends the wait the same way "no lesson" does
      if (e.type === "job.failed" && e.kind === "lesson" && j.key === s.hint?.key) { n.lesson = null; n.noLesson = true; }
      break; }
    case "lesson.pause": n.lessonPaused = e.paused; break;
    case "english.set": n.english = e.analysis; n.screen = "sentence"; n.subject = "english"; n.focus = 0; break;
    case "essay.type": n.essayType = e.essayType; break;
    // a new reading opens on its first faulty sentence; essay.at walks the paragraph (a number it does not have is the default)
    case "essay.set": n.essay = e.analysis; n.essayAt = null; n.screen = "forensic"; n.subject = "essay"; n.focus = 0; break;
    // one sentence rewritten in place (POST /api/analyse kind 'rewrite'): the TV stays on it, on its forensic page;
    // a rewrite that holds, with another sentence still faulty, hands focus to Next sentence (tv/keys focusAfterRewrite)
    case "essay.revised": n.essay = e.analysis; n.essayAt = e.analysis.sentences.some((x) => x.n === e.n) ? e.n : null; n.subject = "essay";
      n.focus = focusAfterRewrite(e.analysis, e.n, s.screen === "forensic" ? s.focus : 0); n.screen = "forensic"; break;
    case "essay.at": n.essayAt = e.n !== null && s.essay?.sentences.some((x) => x.n === e.n) ? e.n : null; break;
    // an id no task on the list has, so two added in the same millisecond are ticked apart
    case "task.add": { let id = "t" + Date.now(); for (let k = 1; s.tasks.some((t) => t.id === id); k++) id = `t${Date.now()}-${k}`;
      n.tasks = [...s.tasks, { id, sub: e.sub, name: e.name, min: e.min, done: false }]; break; }
    case "task.done": n.tasks = s.tasks.map((t) => (t.id === e.id ? { ...t, done: e.done } : t)); break;
    case "timer.start": n.timer = { ...s.timer, running: true }; if (!s.log.started) n.log = { ...s.log, started: Date.now() }; break;
    case "timer.pause": n.timer = { ...s.timer, running: false }; break;
    case "timer.tick": { if (!s.timer.running) break; const left = Math.max(0, s.timer.left - e.seconds); const t = { ...s.timer, left };
      if (t.phase === "work") n.log = { ...s.log, minutes: s.log.minutes + e.seconds / 60 };
      if (left === 0) { if (t.phase === "work") { t.phase = "break"; t.left = 5 * 60; t.before = s.screen; n.screen = "break"; } else { t.phase = "work"; t.left = 25 * 60; n.screen = t.before ?? "page"; } }
      n.timer = t; break; }
    case "timer.skipbreak": n.timer = { ...s.timer, phase: "work", left: 25 * 60 }; n.screen = s.timer.before ?? "page"; break;
    // the open topic keeps the focus, so a set that fails is retried on the topic it was asked for
    case "topic.open": n.topic = e.topic; n.subject = "maths"; n.screen = "topics"; n.focus = Math.max(0, SYLLABUS.findIndex((t) => t.id === e.topic)); break;
    case "practice.set": n.practice = shownPractice({ ...e.practice, owner: e.practice.owner ?? s.learner.id }); n.topic = e.practice.topic; n.walkIx = 0; n.screen = "practice"; break;
    // a marked set lands on the sheet - all six verdicts at once - focused on the first item to look at
    case "practice.marked": if (e.owner && e.owner !== s.learner.id) { toAway(s, n, e.owner, (x) => (x.practice ? { ...x, practice: { ...x.practice, items: e.items.map(shown), marked: true }, walkIx: 0 } : null)); break; }
      if (s.practice) { n.practice = { ...s.practice, items: e.items.map(shown), marked: true }; n.walkIx = 0; n.screen = "sheet"; n.focus = firstToLook(n.practice.items); } break;
    // an explanation: the reply always lands on its item; a verdict only on an item still unsure (a settled item stays settled);
    // on an item already wrong, a slip with no verdict renames it - from the topic's vocabulary only, verdict and pen untouched
    case "practice.settle": if (s.practice) { const topic = s.practice.topic; n.practice = { ...s.practice, items: s.practice.items.map((it) => it.n !== e.n ? it
      : shown(e.verdict && it.verdict === "unsure" ? { ...it, verdict: e.verdict, slip: e.slip, said: e.said ?? it.said, reply: e.reply, slipAt: e.slipAt }
        : !e.verdict && e.slip && it.verdict === "wrong" && slipsFor(topic).some((x) => x.id === e.slip) ? { ...it, slip: e.slip, said: e.said ?? it.said, reply: e.reply }
        : { ...it, reply: e.reply })) }; } break;
    case "walk": { const len = s.practice?.items.length ?? 0; n.walkIx = len ? Math.min(len - 1, Math.max(0, e.ix)) : 0; break; }
    case "practice.clear": n.practice = null; n.topic = null; n.screen = "tonight"; n.focus = 0; break;
    case "status": n.status = e.text; break;
    case "session.end": n.timer = { ...s.timer, running: false }; n.screen = "recap"; n.focus = 0; break;
    case "reset": return fresh();
  }
  // a set being written is for the learner who asked: another learner at the desk supersedes it, and its late result is dropped by id
  if (n.learner.id !== s.learner.id && s.jobs?.practice?.phase === "running") { n.jobs = { ...s.jobs }; delete n.jobs.practice; }
  return n;
}

// ---- the singleton, HMR-proof ----
type Sub = (s: Session) => void;
interface Store { session: Session; subs: Set<Sub>; ticker: NodeJS.Timeout | null; }
const g = globalThis as unknown as { __desk?: Store };
function load(): Session { try { if (existsSync(FILE)) { const j = JSON.parse(readFileSync(FILE, "utf8")); if (Array.isArray(j?.profiles) && j?.learner?.id && j.profiles.every((p: Profile) => p.type in AGE_RANGE)) return settleOwners({ ...fresh(), ...j, practice: shownPractice(j.practice), away: awayShown(j.away), jobs: settled(j.jobs), phoneUrl: phoneUrl(), reading: false, englishLearning: getLearner(j.learner.id).english, conversation: j.conversation ? { moment: null, moments: [], ...j.conversation, pending: null, capture: false, paused: true } : null, check: j.check ? { ...j.check, pending: null } : null }, (id) => getLearner(id).history); } } catch {} return fresh(); }
/** The away learners' work as saved: an answer that reached the file stops here too, and a read under way ended with the desk. */
function awayShown(a: unknown): Record<string, MathsSlot> | undefined {
  if (!a || typeof a !== "object") return undefined;
  return Object.fromEntries(Object.entries(a as Record<string, MathsSlot>).map(([k, x]) => [k, { ...emptySlot(), ...x, practice: shownPractice(x.practice), reading: false }]));
}
if (!g.__desk) g.__desk = { session: load(), subs: new Set(), ticker: null };
const store = g.__desk;
// HMR can retain a session created before this feature was installed.
if (!store.session.englishLearning) store.session.englishLearning = getLearner(store.session.learner.id).english;
if (store.session.conversation === undefined) store.session.conversation = null;
if (store.session.check === undefined) store.session.check = null;
if (!store.session.jobs) store.session.jobs = {};
// ...and one whose Math Buddy work has no owner yet (settleOwners)
try { store.session = settleOwners(store.session, (id) => getLearner(id).history); } catch {}
if (!store.ticker) store.ticker = setInterval(() => {
  if (store.session.timer.running) dispatch({ type: "timer.tick", seconds: 1 });
  const c=store.session.conversation;
  if(c?.capture&&Date.now()-c.captureAt>50000)dispatch({type:"linga.changed",conversation:{...c,capture:false}});
}, 1000);

export function getSession() { return store.session; }
/**
 * Events after which the learner's measured skills may have changed, or a different learner is
 * at the desk. The reducer stays pure: the file read happens here, at the boundary that already
 * writes to disk and pushes to subscribers.
 */
const REHYDRATE = new Set(["learner.set", "practice.marked", "practice.settle", "profile.save", "reset", "join", "page.read", "linga.changed", "essay.set"]);

/**
 * A settled item changes its set's count: the line marking wrote (the last practice line, this topic, this n)
 * is restated from the item verdicts as they now stand (rules/maths). A recount, and no entry is added.
 */
function restateMarked(s: Session): void {
  const p = s.practice, l = getLearner(s.learner.id);
  const at = l.history.findLastIndex((h) => h.kind === "practice"), h = l.history[at];
  const detail = p?.marked && h?.label === (SYLLABUS.find((t) => t.id === p.topic)?.name ?? p.topic) ? restatedLine(h.detail, p.items) : null;
  if (detail && detail !== h.detail) saveLearner({ ...l, history: l.history.map((x, i) => (i === at ? { ...x, detail } : x)) });
}

export function dispatch(e: Event): Session {
  store.session = reduce(store.session, e);
  if (e.type === "practice.settle" && e.verdict) try { restateMarked(store.session); } catch {}
  if (REHYDRATE.has(e.type)) {
    try { const l = getLearner(store.session.learner.id); store.session = { ...store.session, skills: l.skills, writing: l.writing, memory: l.memory, history: l.history, englishLearning: l.english }; } catch {}
  }
  try { mkdirSync(DATA, { recursive: true }); writeFileSync(FILE, JSON.stringify(store.session)); } catch {}
  store.subs.forEach((fn) => { try { fn(store.session); } catch {} });
  return store.session;
}
export function subscribe(fn: Sub) { store.subs.add(fn); return () => store.subs.delete(fn); }
