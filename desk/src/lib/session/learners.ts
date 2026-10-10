/**
 * What the desk remembers about a learner between sessions.
 *
 * The session is wiped by `reset` — that is what reset is for. This file is not: it lives
 * beside session.json in the same data dir and is only ever written by the functions below,
 * none of which the reducer calls. A skill that has gone secure never goes back.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { emptyEnglish, type EnglishLearning } from "../english/types";
import { cleanEnglish } from "../english/rules";
import { DIGEST_CAP, cleanDigest, type DigestEntry } from "../rules/digest";
import { stepSlips } from "../rules/slips";
import { cleanPaper, type PaperItem } from "../rules/recovery";

export interface SkillRecord {
  topic: string; seen: number; right: number;
  estimate: number;         // 0..1
  secure: boolean;          // once true, NEVER set false again
  lastSeen: number;         // ms epoch
  slips: string[];          // slip ids seen for this learner+topic, deduped, newest last; a slip the child stops making is rubbed out (rules/slips)
  /**
   * For a live slip held at least once, the usual right attempts on items that show it since it was last made (rules/slips
   * stepSlips); three rub it out. Only ids still in `slips`, whole numbers >= 0; absent when no live slip has a count, and on
   * a learners.json written before it existed.
   */
  held?: Record<string, number>;
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

/**
 * A paper the learner sat, as kept (v2 M5b): the cleaned paper (rules/recovery cleanPaper: `items` with a known statement
 * code, `unmapped` without) and the date it was entered. The recovery is recomputed from it, never stored.
 */
export interface StoredPaper { at: number; items: PaperItem[]; unmapped: PaperItem[]; }
/** The papers kept per learner: the newest few. */
export const PAPERS_CAP = 5;

export interface Learner {
  id: string;
  english: EnglishLearning;
  skills: Record<string, SkillRecord>;
  /** the same record, one per Essay Master lens (structure, argument, evidence, language) — kept apart so no maths count ever includes a lens */
  writing: Record<string, SkillRecord>;
  memory: string[];         // plain sentences the model reads, newest last, capped at 40
  history: HistoryEntry[];  // what happened, newest last, capped at 20
  /**
   * The week, recorded (Family W9, rules/digest): one dated entry per marked set, finished Linga conversation, Essay
   * reading, homework sheet read and paper typed in - ids from closed lists and counts only, never text - newest last,
   * capped at DIGEST_CAP. A separate list from
   * the history (whose cap and pin are unchanged); the Sunday page (rules/week) is its only reader, and it is never
   * hydrated into the session (no screen is sent it). A learners.json written before W9 loads with none.
   */
  digest: DigestEntry[];
  /** The papers entered (v2 M5b), newest last, capped at PAPERS_CAP; absent until the first paper, and on a learners.json written before it. */
  papers?: StoredPaper[];
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

/**
 * The one way learners.json is written: the JSON goes to a temp file beside it, then renames over it, so a crash
 * mid-write leaves the old file whole, never a partial one. A failure removes the temp file and throws.
 */
function writeBook(book: Book): void {
  const tmp = path.join(DATA, `learners.json.${process.pid}.${Date.now().toString(36)}.tmp`);
  try {
    mkdirSync(DATA, { recursive: true });
    writeFileSync(tmp, JSON.stringify(book));
    renameSync(tmp, FILE);
  } catch (e) {
    try { rmSync(tmp, { force: true }); } catch {}
    throw new Error(`learners.json could not be written, so progress was not saved: ${why(e)}`);
  }
}

/** Put one learner into the book on disk - never over a file that could not be read. Throws when it cannot. */
function writeLearner(id: string, l: Learner): void {
  const book = readBook();
  if (!book) throw new Error("learners.json could not be read, so progress was not saved over it");
  book[id] = l;
  writeBook(book);
}

function blank(id: string): Learner { return { id, english: emptyEnglish(), skills: {}, writing: {}, memory: [], history: [], digest: [] }; }

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

/** A held count kept only as a whole number >= 0 for an id still in `slips`; anything else is dropped. Undefined when none is kept. */
function cleanHeld(raw: unknown, slips: readonly string[]): Record<string, number> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, number> = {};
  for (const id of slips) {
    const n = Object.prototype.hasOwnProperty.call(raw, id) ? (raw as Record<string, unknown>)[id] : undefined;
    if (typeof n === "number" && Number.isInteger(n) && n >= 0) out[id] = n;
  }
  return Object.keys(out).length ? out : undefined;
}

function cleanSkills(raw: unknown): Record<string, SkillRecord> {
  const skills: Record<string, SkillRecord> = {};
  const src = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<string, Partial<SkillRecord>>;
  for (const k of Object.keys(src)) {
    const r = src[k] ?? {};
    // the whitelist: a field not named here is dropped on read (the step-up record is named since Family W8)
    const stretch = cleanStretch(r.stretch);
    const slips = Array.isArray(r.slips) ? r.slips.filter((s): s is string => typeof s === "string") : [];
    const held = cleanHeld(r.held, slips);
    skills[k] = {
      topic: typeof r.topic === "string" ? r.topic : k,
      seen: Number(r.seen) || 0,
      right: Number(r.right) || 0,
      estimate: Number.isFinite(Number(r.estimate)) ? Math.min(1, Math.max(0, Number(r.estimate))) : 0,
      secure: r.secure === true,
      lastSeen: Number(r.lastSeen) || 0,
      slips,
      ...(held ? { held } : {}),
      ...(stretch ? { stretch } : {}),
    };
  }
  return skills;
}

/**
 * A stored paper as the desk trusts it: it must read back CLEANLY through cleanPaper - every item kept, no code dropped,
 * the same items and unmapped items as stored - and carry a date. Anything else is no paper at all, never a guess.
 */
export function cleanStoredPaper(raw: unknown): StoredPaper | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const { at, items, unmapped } = raw as Record<string, unknown>;
  if (typeof at !== "number" || !Number.isFinite(at) || at < 0 || !Array.isArray(items) || !Array.isArray(unmapped)) return null;
  const c = cleanPaper([...items, ...unmapped]);
  if (c.dropped.length || c.droppedCodes.length || !c.items.length && !c.unmapped.length) return null;
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  return same(c.items, items) && same(c.unmapped, unmapped) ? { at, items: c.items, unmapped: c.unmapped } : null;
}
/** The stored papers that read back cleanly, in order, at most the newest PAPERS_CAP. */
function cleanPapers(raw: unknown): StoredPaper[] {
  return (Array.isArray(raw) ? raw : []).map(cleanStoredPaper).filter((p): p is StoredPaper => !!p).slice(-PAPERS_CAP);
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
  const papers = cleanPapers(o.papers);
  return { id, english: cleanEnglish(o.english), skills, writing, memory: Array.isArray(o.memory) ? o.memory.filter((m): m is string => typeof m === "string").slice(-MEMORY_CAP) : [], history: capped(history),
    // the week's digest, whitelisted entry by entry (rules/digest cleanDigest); none on a file written before it existed
    digest: cleanDigest(o.digest),
    // the papers entered, each read back through cleanPaper (a malformed one is none); the field is absent with none, as on a file written before M5b
    ...(papers.length ? { papers } : {}) };
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
  writeLearner(l.id, { ...l, memory: l.memory.slice(-MEMORY_CAP), history: capped(l.history ?? []), digest: (l.digest ?? []).slice(-DIGEST_CAP), ...(l.papers?.length ? { papers: l.papers.slice(-PAPERS_CAP) } : {}) });
}

/** English commits (and saveLearner, the same way) report a disk failure instead of claiming progress was saved - an unreadable learners.json too. */
export function saveEnglish(id: string, english: EnglishLearning): void {
  const book = readBook();
  if (!book) throw new Error("learners.json could not be read, so progress was not saved over it");
  book[id] = { ...getLearner(id), english };
  writeBook(book);
}

/**
 * How an attempt was set (Family W8): `stretch` when its item came from a set asked for as "a step up", and the item's
 * `tier` as code set it. The record is chosen by `stretch` alone - a step-up set holds tier-1 items too, and each of its
 * attempts counts toward the step-up record - so the tier is carried for the caller's sake and never read as a lever.
 */
export interface AttemptSet { stretch?: boolean; tier?: 1 | 2; /** the slips the item shows (school items only): a usual right attempt counts toward rubbing them out */ shows?: string[] }

/**
 * One attempt at one topic. The estimate moves 30% of the way toward the outcome (1 right,
 * 0 wrong); secure latches on at 0.85 with at least four attempts seen and is never unset.
 * An attempt on a step-up item (`set.stretch`, Family W8) moves the step-up record (`SkillRecord.stretch`) by the same
 * rule and leaves every other field exactly as it was: it cannot raise, lower or unset the usual record. A usual
 * attempt leaves the step-up record exactly as it was. A slip seen at step-up is not added to the usual slips.
 */
export function recordAttempt(id: string, topic: string, right: boolean, slip?: string, set: AttemptSet = {}): SkillRecord {
  const l = withAttempt(getLearner(id), topic, right, slip, set);
  saveLearner(l);
  return l.skills[topic];
}

/** The learner with one attempt on `topic` applied; nothing is saved (WD10: a caller applies several changes, then saves once). */
export function withAttempt(l: Learner, topic: string, right: boolean, slip?: string, set: AttemptSet = {}): Learner {
  const before = l.skills[topic];
  const rec = set.stretch === true ? stretchStep(before, topic, right) : step(before, topic, right, slip, set.shows);
  return { ...l, skills: { ...l.skills, [topic]: rec } };
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
  const l = withWriting(getLearner(id), lens, sentences, faulty);
  saveLearner(l);
  return l.writing[lens];
}

/** The learner with one reading through `lens` applied as an attempt; nothing is saved. A reading with no lens or no sentences changes nothing. */
export function withWriting(l: Learner, lens: string, sentences: number, faulty: number): Learner {
  if (!lens || !(sentences > 0)) return l;
  return { ...l, writing: { ...l.writing, [lens]: step(l.writing[lens], lens, faulty / sentences < WRITING_CLEAN_BELOW) } };
}

function step(before: SkillRecord | undefined, topic: string, right: boolean, slip?: string, shows?: readonly string[]): SkillRecord {
  const prev: SkillRecord = before ?? { topic, seen: 0, right: 0, estimate: 0, secure: false, lastSeen: 0, slips: [] };
  const estimate = Math.min(1, Math.max(0, prev.estimate + RATE * ((right ? 1 : 0) - prev.estimate)));
  const seen = prev.seen + 1;
  // a slip is set down when made and rubbed out when it stops (rules/slips); only a usual attempt on a school item moves a count
  const { slips, held } = stepSlips({ slips: prev.slips, held: prev.held }, { right, slip, shows });
  return {
    topic, seen, right: prev.right + (right ? 1 : 0), estimate,
    // latched: once secure, always secure
    secure: prev.secure || (estimate >= SECURE_AT && seen >= SECURE_SEEN),
    lastSeen: Date.now(), slips, ...(held ? { held } : {}),
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
  saveLearner(withHistory(getLearner(id), e));
}

/** The learner with one history line appended; nothing is saved. A line with no label changes nothing. */
export function withHistory(l: Learner, e: HistoryEntry): Learner {
  if (!e || !e.label?.trim()) return l;
  return { ...l, history: capped([...l.history, { ...e, label: e.label.trim(), detail: (e.detail ?? "").trim() }]) };
}

/**
 * One thing done, appended to the week's digest (Family W9): cleaned by the same whitelist a read uses (an entry it
 * cannot trust is not written), newest last, the oldest dropped past DIGEST_CAP. Never raises the history's cap.
 */
export function addDigest(id: string, e: DigestEntry): void {
  const [clean] = cleanDigest([e]);
  if (!clean) return;
  saveLearner(withDigest(getLearner(id), e));
}

/** The learner with one digest entry appended, cleaned and capped; nothing is saved. An entry it cannot trust changes nothing. */
export function withDigest(l: Learner, e: DigestEntry): Learner {
  const [clean] = cleanDigest([e]);
  if (!clean) return l;
  return { ...l, digest: [...l.digest, clean].slice(-DIGEST_CAP) };
}

/** The local day an instant falls in (rules/week reads evenings the same way, so a DST change never splits one). */
const localDay = (at: number) => { const d = new Date(at); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };

/**
 * Hints counted onto the homework sheet they were asked on (MB-B14): the learner's latest homework entry of the same local
 * day is restated in place - `hints` more hints, `second` more problems that needed a second - in one save, cleaned by
 * the digest's whitelist. One entry per sheet, never one per hint (DIGEST_CAP would push a busy week's start out). False,
 * and nothing written, when there is nothing to add or no sheet was read that day: a hint on a page read on an earlier
 * day is not on the Sunday page. Throws when the file cannot be written.
 */
export function addHints(id: string, hints: number, second: number, now = Date.now()): boolean {
  if (!(hints > 0) && !(second > 0)) return false;
  const l = getLearner(id), day = localDay(now);
  const i = l.digest.findLastIndex((d) => d.kind === "homework" && localDay(d.at) === day), d = l.digest[i];
  if (d?.kind !== "homework") return false;
  const [clean] = cleanDigest([{ ...d, hints: d.hints + Math.max(0, hints), second: d.second + Math.max(0, second) }]);
  if (!clean) return false;
  l.digest = l.digest.map((x, j) => (j === i ? clean : x));
  saveLearner(l);
  return true;
}

export function secureTopics(id: string): string[] {
  const l = getLearner(id);
  return Object.values(l.skills).filter((r) => r.secure).map((r) => r.topic);
}

/**
 * A paper typed on the phone, kept (v2 M5b): the raw rows go through cleanPaper (the one validation) and what it keeps is
 * stored with the date, and the week's digest is told in the same save (MB-B14): the questions kept, never a mark or a
 * score. Null, and nothing written, when no row survives. Throws when the file cannot be written.
 */
export function addPaper(id: string, raw: unknown, now = Date.now()): StoredPaper | null {
  const c = cleanPaper(raw);
  if (!c.items.length && !c.unmapped.length) return null;
  const paper: StoredPaper = { at: now, items: c.items, unmapped: c.unmapped };
  const l = getLearner(id);
  l.papers = [...(l.papers ?? []), paper].slice(-PAPERS_CAP);
  const [entry] = cleanDigest([{ at: now, kind: "paper", questions: c.items.length + c.unmapped.length }]);
  if (entry) l.digest = [...l.digest, entry].slice(-DIGEST_CAP);
  saveLearner(l);
  return paper;
}
