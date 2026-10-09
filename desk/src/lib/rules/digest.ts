/**
 * The week, recorded (Family W9): a small per-learner digest of what was DONE, kept on the learner file beside the history
 * (lib/session/learners.ts `digest`). The history keeps 20 lines (pinned by tools/desk-jobs-rules-test.cjs) and Linga
 * writes none, so a week cannot be read back from it; this list can. The Sunday page (rules/week.ts) is its only reader.
 *
 * One entry per thing done, written where the thing lands:
 *   - maths:   one per marked set (desk/mark.ts `land`, the typed and the photo path alike), restated in place when an
 *              explanation settles an unsure item of that set (session/store.ts restateMarked): the unit, how many right,
 *              how many the desk was not sure of, how many in all, whether the set was asked for as "a step up", and
 *              the most frequent CODE-detected slip of the set with how many items showed it;
 *   - english: one per finished Linga conversation (english/conversation.ts "finish"): the scene, its skill, the replies;
 *   - essay:   one per paragraph reading (desk/essay.ts): the lens, the sentences, how many came back to fix;
 *   - homework: one per homework sheet read (app/api/read, maths pages only): the problems read, and the hints asked on
 *              that local day with how many problems needed a second, restated in place at the dispatch boundary as each
 *              hint lands (session/store.ts, learners.ts addHints) - one entry per sheet, never one per hint;
 *   - paper:   one per practice paper typed in (session/learners.ts addPaper, in the same save): the questions kept.
 * Numbers are COUNTS of things in one set, conversation or reading - never a percent, never a score. Nothing here holds
 * problem text, an answer, a transcript, a quote or a model's words: only ids from closed lists and counts. `cleanDigest`
 * is the whitelist every read goes through; an entry it cannot trust is dropped whole.
 *
 * Pure and client-safe: library data and rules only, never the store, the learners file, a job or an engine.
 */
import { topicIn } from "../library/paths";
import { ESSAY_TYPES } from "../library/lessons.data";
import { AUTHORED_SCENES, ENGLISH_SKILLS } from "../english/curriculum";
import type { SkillId } from "../english/types";
import { SCHOOL_SLIPS, SCHOOL_UNIT_SLIPS } from "./school";

/** A marked maths set. `slip` is a code-detected school slip (rules/school), `slipN` the items of the set that showed it. */
export interface MathsDigest {
  at: number; kind: "maths"; topic: string;
  right: number; notSure: number; total: number;
  stretch?: true; slip?: string; slipN?: number;
}
/** A finished Linga conversation: the scene (an authored scene id, or a plan topic's id), its skill, the learner's replies. */
export interface EnglishDigest { at: number; kind: "english"; sceneId: string; skill: SkillId; turns: number }
/** One Essay Master reading: the lens, the sentences read, how many came back to fix. */
export interface EssayDigest { at: number; kind: "essay"; lens: string; sentences: number; faulty: number }
/** A homework sheet read: its problems, and the hints that evening, with the problems that needed a second hint. Counts only. */
export interface HomeworkDigest { at: number; kind: "homework"; problems: number; hints: number; second: number }
/** A practice paper typed in: the questions kept (marked items and unmapped rows). No mark and no score. */
export interface PaperDigest { at: number; kind: "paper"; questions: number }
export type DigestEntry = MathsDigest | EnglishDigest | EssayDigest | HomeworkDigest | PaperDigest;

/** The most entries kept; the oldest drop off the front. Sixty is weeks of evenings, and a page reads only seven days. */
export const DIGEST_CAP = 60;
/** Ceilings on the counts, well above anything the desk makes (a set is at most 12 items, a conversation 24 replies). */
const MAX_ITEMS = 50, MAX_TURNS = 200, MAX_SENTENCES = 500, MAX_HINTS = 500, MAX_QUESTIONS = 200;

/** A plan topic's id as english/check.ts mints it: "plan-" and eight hex digits. Never words. */
const PLAN_ID = /^plan-[0-9a-f]{8}$/;
const SKILLS = new Set<string>(ENGLISH_SKILLS.map((s) => s.id));
const SCENES = new Set<string>(AUTHORED_SCENES.map((s) => s.id));
const LENSES = new Set<string>(ESSAY_TYPES.map((t) => t.id));

/** A whole number from 0 to `max`, or null when it is not a finite number at all. */
function whole(v: unknown, max: number): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return Math.min(max, Math.max(0, Math.floor(v)));
}
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
/** The unit's closed slip list (rules/school SCHOOL_UNIT_SLIPS), empty for a topic without one. */
const unitSlips = (topic: string): readonly string[] => (own(SCHOOL_UNIT_SLIPS, topic) ? SCHOOL_UNIT_SLIPS[topic] : []);

/** Is this slip one code detects on this unit's items? Only a school unit's own closed list counts. */
export const knownSlip = (topic: string, slip: unknown): slip is string => typeof slip === "string" && unitSlips(topic).includes(slip);

/**
 * The digest entry for one marked set, from its items' verdicts as they stand: right, not sure (unsure or no verdict,
 * as rules/maths rightLine counts it), all; the step-up flag; and the most frequent code-detected slip of the set -
 * a slip on a wrong item from the unit's closed list, ties broken by that list's order - with its count. Pure.
 */
export function mathsEntry(topic: string, items: readonly { verdict?: string; slip?: string }[], stretch: boolean, at: number): MathsDigest {
  const right = items.filter((i) => i.verdict === "right").length;
  const notSure = items.filter((i) => i.verdict !== "right" && i.verdict !== "wrong").length;
  const counts = new Map<string, number>();
  for (const i of items) if (i.verdict === "wrong" && knownSlip(topic, i.slip)) counts.set(i.slip!, (counts.get(i.slip!) ?? 0) + 1);
  let slip: string | undefined, slipN = 0;
  for (const id of unitSlips(topic)) { const n = counts.get(id) ?? 0; if (n > slipN) { slip = id; slipN = n; } }
  return {
    at, kind: "maths", topic, right, notSure, total: items.length,
    ...(stretch ? { stretch: true as const } : {}),
    ...(slip ? { slip, slipN } : {}),
  };
}

/** One entry as the desk trusts it, or null: every field whitelisted, strings only from closed lists, counts clamped. */
export function cleanEntry(raw: unknown): DigestEntry | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const at = whole(o.at, Number.MAX_SAFE_INTEGER);
  if (!at) return null;
  if (o.kind === "maths") {
    const topic = typeof o.topic === "string" ? o.topic : "";
    if (!topic || !topicIn(topic)) return null;
    const total = whole(o.total, MAX_ITEMS);
    if (!total) return null;
    const right = Math.min(total, whole(o.right, MAX_ITEMS) ?? 0);
    const notSure = Math.min(total - right, whole(o.notSure, MAX_ITEMS) ?? 0);
    const wrong = total - right - notSure;
    const slip = wrong > 0 && knownSlip(topic, o.slip) ? o.slip : undefined;
    const slipN = slip ? Math.max(1, Math.min(wrong, whole(o.slipN, MAX_ITEMS) ?? 1)) : 0;
    return { at, kind: "maths", topic, right, notSure, total, ...(o.stretch === true ? { stretch: true as const } : {}), ...(slip ? { slip, slipN } : {}) };
  }
  if (o.kind === "english") {
    const sceneId = typeof o.sceneId === "string" && (SCENES.has(o.sceneId) || PLAN_ID.test(o.sceneId)) ? o.sceneId : "";
    const skill = typeof o.skill === "string" && SKILLS.has(o.skill) ? (o.skill as SkillId) : null;
    const turns = whole(o.turns, MAX_TURNS);
    if (!sceneId || !skill || turns === null) return null;
    return { at, kind: "english", sceneId, skill, turns };
  }
  if (o.kind === "essay") {
    const lens = typeof o.lens === "string" && LENSES.has(o.lens) ? o.lens : "";
    const sentences = whole(o.sentences, MAX_SENTENCES);
    if (!lens || !sentences) return null;
    return { at, kind: "essay", lens, sentences, faulty: Math.min(sentences, whole(o.faulty, MAX_SENTENCES) ?? 0) };
  }
  if (o.kind === "homework") {
    const problems = whole(o.problems, MAX_ITEMS);
    if (!problems) return null;
    // a second hint is a hint too, so the problems that needed one are never more than the hints
    const hints = whole(o.hints, MAX_HINTS) ?? 0;
    return { at, kind: "homework", problems, hints, second: Math.min(hints, whole(o.second, MAX_HINTS) ?? 0) };
  }
  if (o.kind === "paper") {
    const questions = whole(o.questions, MAX_QUESTIONS);
    if (!questions) return null;
    return { at, kind: "paper", questions };
  }
  return null;
}

/** The digest as the desk trusts it: a list (anything else is none), each entry cleaned or dropped, the last DIGEST_CAP kept. */
export function cleanDigest(raw: unknown): DigestEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(cleanEntry).filter((e): e is DigestEntry => e !== null).slice(-DIGEST_CAP);
}

/** A slip's plain-words name, from rules/school's own table (the TV's title for it); undefined for an id it lacks. */
export const slipName = (id: string): string | undefined => SCHOOL_SLIPS.find((s) => s.id === id)?.name;
