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
}

/** One thing that actually happened at the desk, so it can say where you left off. */
export interface HistoryEntry {
  at: number;                       // ms epoch
  kind: "homework" | "practice" | "writing";
  label: string;                    // the topic's name, the page's title, or the lens that was read
  detail: string;                   // e.g. "4 of 6 right", "10 problems read", "2 of 5 sentences to fix"
}

const KINDS: HistoryEntry["kind"][] = ["homework", "practice", "writing"];

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

function readAll(): Book {
  try {
    if (existsSync(FILE)) {
      const j = JSON.parse(readFileSync(FILE, "utf8"));
      if (j && typeof j === "object" && !Array.isArray(j)) return j as Book;
    }
  } catch {}
  return {};
}

function writeAll(book: Book): void {
  try { mkdirSync(DATA, { recursive: true }); writeFileSync(FILE, JSON.stringify(book)); } catch {}
}

function blank(id: string): Learner { return { id, english: emptyEnglish(), skills: {}, writing: {}, memory: [], history: [] }; }

function cleanSkills(raw: unknown): Record<string, SkillRecord> {
  const skills: Record<string, SkillRecord> = {};
  const src = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<string, Partial<SkillRecord>>;
  for (const k of Object.keys(src)) {
    const r = src[k] ?? {};
    skills[k] = {
      topic: typeof r.topic === "string" ? r.topic : k,
      seen: Number(r.seen) || 0,
      right: Number(r.right) || 0,
      estimate: Number.isFinite(Number(r.estimate)) ? Math.min(1, Math.max(0, Number(r.estimate))) : 0,
      secure: r.secure === true,
      lastSeen: Number(r.lastSeen) || 0,
      slips: Array.isArray(r.slips) ? r.slips.filter((s): s is string => typeof s === "string") : [],
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
    }))
    .slice(-HISTORY_CAP);
  return { id, english: cleanEnglish(o.english), skills, writing, memory: Array.isArray(o.memory) ? o.memory.filter((m): m is string => typeof m === "string").slice(-MEMORY_CAP) : [], history };
}

export function getLearner(id: string): Learner {
  const book = readAll();
  return book[id] ? clean(id, book[id]) : blank(id);
}

export function saveLearner(l: Learner): void {
  const book = readAll();
  book[l.id] = { ...l, memory: l.memory.slice(-MEMORY_CAP), history: (l.history ?? []).slice(-HISTORY_CAP) };
  writeAll(book);
}

/** English commits report a disk failure instead of claiming progress was saved. */
export function saveEnglish(id: string, english: EnglishLearning): void {
  const book = readAll();
  book[id] = { ...getLearner(id), english };
  mkdirSync(DATA, { recursive: true });
  writeFileSync(FILE, JSON.stringify(book));
}

/**
 * One attempt at one topic. The estimate moves 30% of the way toward the outcome (1 right,
 * 0 wrong); secure latches on at 0.85 with at least four attempts seen and is never unset.
 */
export function recordAttempt(id: string, topic: string, right: boolean, slip?: string): SkillRecord {
  const l = getLearner(id);
  const rec = step(l.skills[topic], topic, right, slip);
  l.skills[topic] = rec;
  saveLearner(l);
  return rec;
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
  };
}

export function addMemory(id: string, line: string): void {
  const t = (line ?? "").trim();
  if (!t) return;
  const l = getLearner(id);
  l.memory = [...l.memory, t].slice(-MEMORY_CAP);
  saveLearner(l);
}

/** One thing that happened, appended. Newest last; the oldest fall off the end. */
export function addHistory(id: string, e: HistoryEntry): void {
  if (!e || !e.label?.trim()) return;
  const l = getLearner(id);
  l.history = [...l.history, { ...e, label: e.label.trim(), detail: (e.detail ?? "").trim() }].slice(-HISTORY_CAP);
  saveLearner(l);
}

export function secureTopics(id: string): string[] {
  const l = getLearner(id);
  return Object.values(l.skills).filter((r) => r.secure).map((r) => r.topic);
}
