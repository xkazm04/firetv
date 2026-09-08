/**
 * What the desk remembers about a learner between sessions.
 *
 * The session is wiped by `reset` — that is what reset is for. This file is not: it lives
 * beside session.json in the same data dir and is only ever written by the functions below,
 * none of which the reducer calls. A skill that has gone secure never goes back.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface SkillRecord {
  topic: string; seen: number; right: number;
  estimate: number;         // 0..1
  secure: boolean;          // once true, NEVER set false again
  lastSeen: number;         // ms epoch
  slips: string[];          // slip ids seen for this learner+topic, deduped, newest last
}

/** One thing that actually happened in Math Buddy, so the desk can say where you left off. */
export interface HistoryEntry {
  at: number;                       // ms epoch
  kind: "homework" | "practice";
  label: string;                    // the topic's name, or the page's title
  detail: string;                   // e.g. "4 of 6 right", "10 problems read"
}

export interface Learner {
  id: string;
  skills: Record<string, SkillRecord>;
  memory: string[];         // plain sentences the model reads, newest last, capped at 40
  history: HistoryEntry[];  // what happened, newest last, capped at 20
}

// the same data dir the session store uses — derived the same way, not hard-coded
const DATA = path.join(process.cwd(), "data");
const FILE = path.join(DATA, "learners.json");

const MEMORY_CAP = 40;
const HISTORY_CAP = 20;
/** How far one attempt moves the estimate toward what we just observed. Fixed, deliberately blunt. */
const RATE = 0.3;
const SECURE_AT = 0.85;
const SECURE_SEEN = 4;

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

function blank(id: string): Learner { return { id, skills: {}, memory: [], history: [] }; }

/** Normalise whatever was on disk into a shape the rest of the module can trust. */
function clean(id: string, l: unknown): Learner {
  const o = (l ?? {}) as Partial<Learner>;
  const skills: Record<string, SkillRecord> = {};
  const src = (o.skills ?? {}) as Record<string, Partial<SkillRecord>>;
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
  // a learners.json written before history existed still loads: the field simply defaults to none
  const history: HistoryEntry[] = (Array.isArray(o.history) ? o.history : [])
    .filter((h): h is HistoryEntry => !!h && typeof h === "object" && typeof (h as HistoryEntry).label === "string")
    .map((h): HistoryEntry => ({
      at: Number(h.at) || 0,
      kind: h.kind === "homework" ? "homework" : "practice",
      label: String(h.label), detail: typeof h.detail === "string" ? h.detail : "",
    }))
    .slice(-HISTORY_CAP);
  return { id, skills, memory: Array.isArray(o.memory) ? o.memory.filter((m): m is string => typeof m === "string").slice(-MEMORY_CAP) : [], history };
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

/**
 * One attempt at one topic. The estimate moves 30% of the way toward the outcome (1 right,
 * 0 wrong); secure latches on at 0.85 with at least four attempts seen and is never unset.
 */
export function recordAttempt(id: string, topic: string, right: boolean, slip?: string): SkillRecord {
  const l = getLearner(id);
  const prev: SkillRecord = l.skills[topic] ?? { topic, seen: 0, right: 0, estimate: 0, secure: false, lastSeen: 0, slips: [] };
  const estimate = Math.min(1, Math.max(0, prev.estimate + RATE * ((right ? 1 : 0) - prev.estimate)));
  const seen = prev.seen + 1;
  const slips = slip ? [...prev.slips.filter((s) => s !== slip), slip] : prev.slips;
  const rec: SkillRecord = {
    topic, seen, right: prev.right + (right ? 1 : 0), estimate,
    // latched: once secure, always secure
    secure: prev.secure || (estimate >= SECURE_AT && seen >= SECURE_SEEN),
    lastSeen: Date.now(), slips,
  };
  l.skills[topic] = rec;
  saveLearner(l);
  return rec;
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
