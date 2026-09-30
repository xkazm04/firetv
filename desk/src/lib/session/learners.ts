/**
 * What the desk remembers about a learner between sessions.
 *
 * The session is wiped by `reset` — that is what reset is for. This file is not: it lives
 * beside session.json in the same data dir and is only ever written by the functions below,
 * none of which the reducer calls. A skill that has gone secure never goes back.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { emptyEnglish, type EnglishLearning } from "../english/types";
import { cleanEnglish } from "../english/rules";

export interface SkillRecord {
  topic: string; seen: number; right: number;
  estimate: number;         // 0..1
  secure: boolean;          // once true, NEVER set false again
  lastSeen: number;         // ms epoch
  slips: string[];          // slip ids seen for this learner+topic, deduped, newest last
  /**
   * The step-up record (Family W8): moved ONLY by attempts on items of a set asked for as "a step up" (rules/stretch), by
   * the same rule as the record above - the estimate 30% of the way toward each outcome, secure latched at 0.85 with four
   * seen and never unset. The fields above are never moved by a step-up attempt, and this one never by a usual attempt,
   * so a slip at step-up can never unset or lower the usual record. Absent until the first step-up attempt; a
   * learners.json written before W8 loads without it. The TV draws it as a second ink line, never as a number.
   */
  stretch?: StretchRecord;
}

/** The step-up record's own counts, estimate and latch (SkillRecord.stretch). */
export interface StretchRecord {
  seen: number; right: number;
  estimate: number;         // 0..1
  secure: boolean;          // once true, NEVER set false again
  lastSeen: number;         // ms epoch
}

/** One thing that actually happened at the desk, so it can say where you left off. */
export interface HistoryEntry {
  at: number;                       // ms epoch
  kind: "homework" | "practice" | "writing" | "lesson";
  label: string;                    // the topic's name, the page's title, the lens that was read, or the lesson's title
  detail: string;                   // e.g. "4 of 6 right", "10 problems read", "2 of 5 sentences to fix", "watched"
  /** what the line is about, when that has an id: a lesson line's lesson (library/lessons.data.ts), which Units and the calendar tick by */
  ref?: string;
}

const KINDS: HistoryEntry["kind"][] = ["homework", "practice", "writing", "lesson"];

export interface Learner {
  id: string;
  english: EnglishLearning;
  skills: Record<string, SkillRecord>;
  /** the same record, one per Essay Master lens (structure, argument, evidence, language) — kept apart so no maths count ever includes a lens */
  writing: Record<string, SkillRecord>;
  memory: string[];         // plain sentences the model reads, newest last, capped at 40
  history: HistoryEntry[];  // what happened, newest last, capped at 20
}

// the same data dir the session store uses — derived the same way, not hard-coded
const DATA = process.env.DESK_DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA, "learners.json");

const MEMORY_CAP = 40;
const HISTORY_CAP = 20;
/** How far one attempt moves the estimate toward what we just observed. Fixed, deliberately blunt. */
const RATE = 0.3;
const SECURE_AT = 0.85;
const SECURE_SEEN = 4;
/** A reading counts as a right attempt when under a quarter of its sentences came back faulty. */
const WRITING_CLEAN_BELOW = 0.25;

type Book = Record<string, Learner>;

const why = (e: unknown) => (e instanceof Error ? e.message : String(e));
let told = "";
/** A read failure goes to the server log, once per distinct failure: getLearner runs on every request. */
function tell(line: string): void {
  if (line !== told) console.error(line);
  told = line;
}

/**
 * learners.json as a book, or null when a file is there that the desk cannot read as one. No file, or an empty
 * one, is an empty book (nothing to lose); anything else unreadable is somebody's mastery the desk must not
 * write over - every learner is in this one file.
 */
function readBook(): Book | null {
  let text: string;
  try {
    if (!existsSync(FILE)) return {};
    text = readFileSync(FILE, "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException)?.code === "ENOENT") return {};
    tell(`learners.json could not be read, so it will not be written over: ${why(e)}`);
    return null;
  }
  if (!text.trim()) return {};
  try {
    const j = JSON.parse(text);
    if (j && typeof j === "object" && !Array.isArray(j)) { told = ""; return j as Book; }
    tell("learners.json is not a book of learners, so it will not be written over");
  } catch (e) {
    tell(`learners.json is not readable JSON, so it will not be written over: ${why(e)}`);
  }
  return null;
}

/** What the desk reads: the book, or an empty one while learners.json cannot be read (and is left alone). */
function readAll(): Book {
  return readBook() ?? {};
}

/** Put one learner into the book on disk - never over a file that could not be read. A failure is logged. */
function writeLearner(id: string, l: Learner): void {
  const book = readBook();
  if (!book) { console.error(`learners.json left as it is: ${id}'s change was not saved`); return; }
  book[id] = l;
  try { mkdirSync(DATA, { recursive: true }); writeFileSync(FILE, JSON.stringify(book)); }
  catch (e) { console.error(`learners.json could not be written: ${id}'s change was not saved: ${why(e)}`); }
}

function blank(id: string): Learner { return { id, english: emptyEnglish(), skills: {}, writing: {}, memory: [], history: [] }; }

/** A finite whole number of at least 0, else 0. */
const count = (v: unknown) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0; };

/**
 * The step-up record as the desk trusts it (Family W8): an object on disk becomes { seen, right, estimate, secure,
 * lastSeen } - counts whole and not negative, `right` never more than `seen`, the estimate clamped to 0..1, secure only
 * when it is `true` - and anything else (junk, an array, a number) is no step-up record at all.
 */
function cleanStretch(raw: unknown): StretchRecord | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const r = raw as Partial<Record<keyof StretchRecord, unknown>>;
  const seen = count(r.seen), est = Number(r.estimate);
  return {
    seen, right: Math.min(seen, count(r.right)),
    estimate: Number.isFinite(est) ? Math.min(1, Math.max(0, est)) : 0,
    secure: r.secure === true,
    lastSeen: count(r.lastSeen),
  };
}

function cleanSkills(raw: unknown): Record<string, SkillRecord> {
  const skills: Record<string, SkillRecord> = {};
  const src = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<string, Partial<SkillRecord>>;
  for (const k of Object.keys(src)) {
    const r = src[k] ?? {};
    // the whitelist: a field not named here is dropped on read (the step-up record is named since Family W8)
    const stretch = cleanStretch(r.stretch);
    skills[k] = {
      topic: typeof r.topic === "string" ? r.topic : k,
      seen: Number(r.seen) || 0,
      right: Number(r.right) || 0,
      estimate: Number.isFinite(Number(r.estimate)) ? Math.min(1, Math.max(0, Number(r.estimate))) : 0,
      secure: r.secure === true,
      lastSeen: Number(r.lastSeen) || 0,
      slips: Array.isArray(r.slips) ? r.slips.filter((s): s is string => typeof s === "string") : [],
      ...(stretch ? { stretch } : {}),
    };
  }
  return skills;
}

/** Normalise whatever was on disk into a shape the rest of the module can trust. */
function clean(id: string, l: unknown): Learner {
  const o = (l ?? {}) as Partial<Learner>;
  const skills = cleanSkills(o.skills);
  // a learners.json written before writing was measured still loads, with no lens seen yet
  const writing = cleanSkills(o.writing);
  // a learners.json written before history existed still loads: the field simply defaults to none
  const history: HistoryEntry[] = (Array.isArray(o.history) ? o.history : [])
    .filter((h): h is HistoryEntry => !!h && typeof h === "object" && typeof (h as HistoryEntry).label === "string")
    .map((h): HistoryEntry => ({
      at: Number(h.at) || 0,
      // an unknown kind on disk reads back as practice, the kind this field had before the others
      kind: KINDS.includes(h.kind) ? h.kind : "practice",
      label: String(h.label), detail: typeof h.detail === "string" ? h.detail : "",
      ...(typeof h.ref === "string" && h.ref ? { ref: h.ref } : {}),
    }));
  return { id, english: cleanEnglish(o.english), skills, writing, memory: Array.isArray(o.memory) ? o.memory.filter((m): m is string => typeof m === "string").slice(-MEMORY_CAP) : [], history: capped(history) };
}

/**
 * The history as kept: the last HISTORY_CAP lines, and besides them each lesson's latest watched line (kind "lesson",
 * with its ref) wherever it falls - a tick on Units is a claim, so the record behind it never rolls off the end.
 * At most one line per lesson, so the lines kept besides the cap are bounded by the library. Order is kept.
 */
export function capped(history: HistoryEntry[]): HistoryEntry[] {
  const latest = new Map<string, number>();
  history.forEach((h, i) => { if (h.kind === "lesson" && h.ref) latest.set(h.ref, i); });
  const pinned = new Set(latest.values());
  const rest = history.map((_, i) => i).filter((i) => !pinned.has(i) && !(history[i].kind === "lesson" && history[i].ref));
  const kept = new Set([...pinned, ...rest.slice(-HISTORY_CAP)]);
  return history.filter((_, i) => kept.has(i));
}

export function getLearner(id: string): Learner {
  const book = readAll();
  return book[id] ? clean(id, book[id]) : blank(id);
}

export function saveLearner(l: Learner): void {
  writeLearner(l.id, { ...l, memory: l.memory.slice(-MEMORY_CAP), history: capped(l.history ?? []) });
}

/** English commits report a disk failure instead of claiming progress was saved - an unreadable learners.json too. */
export function saveEnglish(id: string, english: EnglishLearning): void {
  const book = readBook();
  if (!book) throw new Error("learners.json could not be read, so progress was not saved over it");
  book[id] = { ...getLearner(id), english };
  mkdirSync(DATA, { recursive: true });
  writeFileSync(FILE, JSON.stringify(book));
}

/**
 * How an attempt was set (Family W8): `stretch` when its item came from a set asked for as "a step up", and the item's
 * `tier` as code set it. The record is chosen by `stretch` alone - a step-up set holds tier-1 items too, and each of its
 * attempts counts toward the step-up record - so the tier is carried for the caller's sake and never read as a lever.
 */
export interface AttemptSet { stretch?: boolean; tier?: 1 | 2 }

/**
 * One attempt at one topic. The estimate moves 30% of the way toward the outcome (1 right,
 * 0 wrong); secure latches on at 0.85 with at least four attempts seen and is never unset.
 * An attempt on a step-up item (`set.stretch`, Family W8) moves the step-up record (`SkillRecord.stretch`) by the same
 * rule and leaves every other field exactly as it was: it cannot raise, lower or unset the usual record. A usual
 * attempt leaves the step-up record exactly as it was. A slip seen at step-up is not added to the usual slips.
 */
export function recordAttempt(id: string, topic: string, right: boolean, slip?: string, set: AttemptSet = {}): SkillRecord {
  const l = getLearner(id);
  const before = l.skills[topic];
  const rec = set.stretch === true ? stretchStep(before, topic, right) : step(before, topic, right, slip);
  l.skills[topic] = rec;
  saveLearner(l);
  return rec;
}

/** A step-up attempt: the step-up record moved by `step`'s own rule; the usual fields as they were (zero when there were none). */
function stretchStep(before: SkillRecord | undefined, topic: string, right: boolean): SkillRecord {
  const base: SkillRecord = before ?? { topic, seen: 0, right: 0, estimate: 0, secure: false, lastSeen: 0, slips: [] };
  const was = base.stretch;
  const moved = step(was ? { topic, ...was, slips: [] } : undefined, topic, right);
  return { ...base, stretch: { seen: moved.seen, right: moved.right, estimate: moved.estimate, secure: moved.secure, lastSeen: moved.lastSeen } };
}

/**
 * One reading through one lens, as one attempt on the same record Math Buddy keeps: right when
 * under a quarter of the sentences came back faulty. So a learner whose faults thin out over the
 * readings is seen to rise, and secure latches on the same terms and is never unset.
 */
export function recordWriting(id: string, lens: string, sentences: number, faulty: number): SkillRecord | null {
  if (!lens || !(sentences > 0)) return null;
  const l = getLearner(id);
  const rec = step(l.writing[lens], lens, faulty / sentences < WRITING_CLEAN_BELOW);
  l.writing[lens] = rec;
  saveLearner(l);
  return rec;
}

function step(before: SkillRecord | undefined, topic: string, right: boolean, slip?: string): SkillRecord {
  const prev: SkillRecord = before ?? { topic, seen: 0, right: 0, estimate: 0, secure: false, lastSeen: 0, slips: [] };
  const estimate = Math.min(1, Math.max(0, prev.estimate + RATE * ((right ? 1 : 0) - prev.estimate)));
  const seen = prev.seen + 1;
  const slips = slip ? [...prev.slips.filter((s) => s !== slip), slip] : prev.slips;
  return {
    topic, seen, right: prev.right + (right ? 1 : 0), estimate,
    // latched: once secure, always secure
    secure: prev.secure || (estimate >= SECURE_AT && seen >= SECURE_SEEN),
    lastSeen: Date.now(), slips,
    // a usual attempt carries the step-up record over untouched (Family W8)
    ...(prev.stretch ? { stretch: prev.stretch } : {}),
  };
}

export function addMemory(id: string, line: string): void {
  const t = (line ?? "").trim();
  if (!t) return;
  const l = getLearner(id);
  l.memory = [...l.memory, t].slice(-MEMORY_CAP);
  saveLearner(l);
}

/** One thing that happened, appended. Newest last; the oldest fall off the end, except a lesson's watched line (capped). */
export function addHistory(id: string, e: HistoryEntry): void {
  if (!e || !e.label?.trim()) return;
  const l = getLearner(id);
  l.history = capped([...l.history, { ...e, label: e.label.trim(), detail: (e.detail ?? "").trim() }]);
  saveLearner(l);
}

export function secureTopics(id: string): string[] {
  const l = getLearner(id);
  return Object.values(l.skills).filter((r) => r.secure).map((r) => r.topic);
}
