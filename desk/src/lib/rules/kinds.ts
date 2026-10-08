/**
 * What KIND of item Math Buddy is looking at, decided in one place - and the one judge that settles an item of any kind.
 *
 * An item is one of three kinds: a `school` item (a spec of a school shape, rules/school), a `calc` item (a spec of a
 * Calculus shape, rules/calc), or a `linear` one (a linear equation the model wrote, no spec). The kind used to be decided
 * by three mechanisms in 15 lines of 7 files: by topic id (the generator, items.ts), by the item's spec shape (marking,
 * explaining) and by the printed text (the hint). It is decided here, by one of three readers that never disagree about
 * what they read (the Calculus and the school text readers do not overlap):
 *   - kindOfSpec(spec): from an item's `spec`, the marker's and the explainer's reader;
 *   - kindOfQuestion(text): from the printed question, the hint's reader (a task with no spec);
 *   - kindOfTopic(topicId): from the topic a set is written for, the generator's reader.
 *
 * judgeItem(item, read, ctx) is the one decision: is this answer right, which slip, what the desk says - from what a page
 * or a keyboard gave and the item itself, in code, never a model's verdict. A photographed sheet (judgeSet over a model's
 * reading) and a typed one (judgeSet over the typed strings) are judged by the same function, so they cannot disagree. It
 * needs no set and touches no record: a single answer outside a practice set (the placement staircase) is a call to it.
 *
 * Pure: it imports rules, the substitution checker and the path table, never the session, a learner file or an engine.
 */
import { chainPen } from "./chain";
import { ASK, cleanValue, isCalcSpec, locate, rootOf, settle, settled, settleSpec, workingLines, type Settled } from "./maths";
import { partsFromQuestion, specFromQuestion as calcSpecFromQuestion, type CalcSpec } from "./calc";
import { DEFAULT_SCHOOL_SYSTEM, generatorFor, isSchoolSpec, specFromQuestion as schoolSpecFromQuestion, unitOf, type SchoolSpec } from "./school";
import { slipsShown } from "./slips";
import { judgeOfTopic, pathOfTopic } from "../library/paths";
import { degenerate, substitute, verify } from "../desk/verify";
import type { PracticeItem, SchoolSystem } from "../session/store";

export type ItemKind = "school" | "calc" | "linear";

/** The kind of an item from its spec: a school shape, a Calculus shape, or (no spec, or a shape neither knows) a linear equation. */
export const kindOfSpec = (spec: unknown): ItemKind => (isSchoolSpec(spec) ? "school" : isCalcSpec(spec) ? "calc" : "linear");

/**
 * A printed task read as a spec: its kind and the spec the reader found, at most one of them - or, for a multi-part
 * Calculus task (v2 M3a, rules/calc partsFromQuestion: the maximum and the minimum on an interval), its parts' specs,
 * read only where no single spec reads. Pure; never throws.
 */
export interface Question { kind: ItemKind; calc: CalcSpec | null; school: SchoolSpec | null; parts: CalcSpec[] | null }
export function readQuestion(text: unknown): Question {
  const calc = calcSpecFromQuestion(text);
  const parts = calc ? null : partsFromQuestion(text);
  const school = calc || parts ? null : schoolSpecFromQuestion(text);
  return { kind: calc || parts ? "calc" : school ? "school" : "linear", calc, school, parts };
}
/** The kind of a printed task: the kind of the spec its text reads as, linear when neither reader reads it. */
export const kindOfQuestion = (text: unknown): ItemKind => readQuestion(text).kind;

/**
 * The unit a printed task reads as, when the desk can write six like it: the school unit its text reads as (rules/school
 * unitOf) that has a code generator and is on the learner's own `path` (paths.ts pathOfTopic). Null for a linear task, a
 * Calculus task (a shape belongs to several Calculus topics, so code names none), a school task on the Calculus path, and
 * junk. Pure; never throws.
 */
export function likeTopic(text: unknown, path: unknown): string | null {
  try {
    const unit = unitOf(readQuestion(text).school);
    return unit && generatorFor(unit) && pathOfTopic(unit) === path ? unit : null;
  } catch {
    return null;
  }
}

/**
 * The kind of item a topic's set is written as, by its path's judge (paths.ts PathJudge): Calculus on a path judged
 * 'calc', school where a unit on a path judged 'school' has a generator, else linear.
 */
export function kindOfTopic(topicId: string): ItemKind {
  const judge = judgeOfTopic(topicId);
  return judge === "calc" ? "calc" : judge === "school" && generatorFor(topicId) ? "school" : "linear";
}

/** The reading of a sheet that carries items of several kinds: the first kind with a spec on the sheet (school, then Calculus), else linear. */
export function kindOfSheet(items: readonly { spec?: unknown }[]): ItemKind {
  return items.some((i) => isSchoolSpec(i.spec)) ? "school" : items.some((i) => isCalcSpec(i.spec)) ? "calc" : "linear";
}

/**
 * What a page or a keyboard gave for one item: the answer as written, the working, and (when asked for) a slip pick. A
 * `solution` is the model's own value of x for a linear item: only when it is present does the model's trust rule apply.
 */
export interface Read { n?: number; studentAnswer?: unknown; studentWorking?: unknown; slip?: unknown; solution?: unknown }
export interface JudgeCtx { topic: string; system?: SchoolSystem }

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * One item judged by its own kind, or null (the desk asks, records nothing). Never a model's verdict:
 *   - school: rules/school check by the learner's school system; the slip is code's own;
 *   - calc: rules/calc checkAnswer from the spec, the slip code's own where it names one, else the pick offered; a wrong item
 *     with working is located by the chain checker (rules/chain: the first line that stops holding), never by a model;
 *   - linear, the read carries the model's own `solution`: that solution must hold in the equation (the model can solve the
 *     item, so its read of the page is trusted) and the answer must substitute, else null; a wrong item is located in its own
 *     working;
 *   - linear, no solution: the equation must be one the desk can solve itself (a single linear root, not an identity), and
 *     the answer must substitute, else null. With no working written there is no pen position.
 * A blank answer is null for every kind.
 */
export function judgeItem(item: { n: number; question: string; spec?: unknown }, read: Read, ctx: JudgeCtx): Settled | null {
  const answer = str(read.studentAnswer), working = str(read.studentWorking);
  const kind = kindOfSpec(item.spec);
  if (kind !== "linear") {
    const s = answer ? settleSpec(item.n, item.spec, answer, read.slip, ctx.topic, ctx.system ?? DEFAULT_SCHOOL_SYSTEM) : null;
    // a wrong Calculus item with working: the pen at the first line the chain rings (rules/chain), the verdict untouched
    if (s && s.verdict === "wrong" && kind === "calc" && working) {
      const line = chainPen(item.spec, workingLines({ studentWorking: working, studentAnswer: answer, spec: item.spec }));
      if (line !== null) return { ...s, slipAt: { line } };
    }
    return s;
  }

  const value = cleanValue(answer);
  if (read.solution !== undefined) {
    const solution = cleanValue(read.solution);
    const truth = solution && !degenerate(item.question) ? verify(item.question, solution) : false;
    const student = value ? substitute(item.question, value) : null;
    if (!truth || student === null) return null;
    const s = settled(item.n, student, read.slip, ctx.topic);
    const at = s.verdict === "wrong" ? locate(item.question, workingLines({ ...item, studentWorking: working, studentAnswer: value })) : undefined;
    return at ? { ...s, slipAt: at } : s;
  }
  if (!value || degenerate(item.question) || rootOf(item.question) === null) return null;
  const s = settle({ n: item.n, question: item.question, studentAnswer: value, studentWorking: working }, value, read.slip, ctx.topic);
  if (!s) return null;
  if (working) return s;
  const { slipAt: _pen, ...rest } = s; // no working was written, so there is no line to put the pen on
  return rest;
}

/**
 * One settled item's attempt, and how its item was set: a step-up item (Family W8) and its code-set tier. `shows`
 * (math-buddy-A): the slips a school item's spec shows, by code (rules/slips slipsShown) - what a right answer here counts
 * toward rubbing out; absent on a linear or Calculus item and on one that shows none.
 */
export interface Attempt { right: boolean; slip?: string; stretch?: boolean; tier?: 1 | 2; shows?: string[] }
/** How an item was set, as its attempt carries it: the step-up flag and the tier, both code's own (absent is a usual item). */
const setOf = (item: PracticeItem): { stretch?: boolean; tier?: 1 | 2 } => ({
  ...(item.stretch === true ? { stretch: true } : {}), ...(item.tier === 1 || item.tier === 2 ? { tier: item.tier } : {}),
});

/** A set judged: its items as the desk keeps them, the attempts to record (settled items only) and how many it asked about. */
export interface Judged { items: PracticeItem[]; attempts: Attempt[]; unsure: number }

/**
 * A whole set judged, item by item, each by ITS kind: `reads` are looked up by item number. `typed` reads (Family W6) keep
 * the answer as it was typed; a photographed linear answer is cleaned ("x = 4" is 4), as it always was. An item with no read
 * is a blank answer. Pure: nothing is recorded here - the caller lands the set once.
 */
export function judgeSet(practice: { topic: string; items: PracticeItem[] }, reads: readonly Read[], ctx: JudgeCtx & { typed?: boolean }): Judged {
  const byN = new Map<number, Read>();
  for (const r of reads) if (r && typeof r.n === "number") byN.set(r.n, r);
  let unsure = 0;
  const attempts: Attempt[] = [];
  const items = practice.items.map((item): PracticeItem => {
    const read = byN.get(item.n) ?? {};
    const written = str(read.studentAnswer);
    const studentAnswer = ctx.typed || kindOfSpec(item.spec) !== "linear" ? written : cleanValue(written);
    const studentWorking = str(read.studentWorking);
    const s = judgeItem(item, read, ctx);
    if (!s) {
      unsure++;
      return { ...item, studentAnswer, studentWorking, verdict: "unsure", said: ASK(item.n) };
    }
    const shows = kindOfSpec(item.spec) === "school" ? slipsShown(practice.topic, item.spec) : [];
    attempts.push({ right: s.verdict === "right", slip: s.slip, ...setOf(item), ...(shows.length ? { shows } : {}) });
    return { ...item, studentAnswer, studentWorking, verdict: s.verdict, slip: s.slip, said: s.said, ...(s.slipAt ? { slipAt: s.slipAt } : {}) };
  });
  return { items, attempts, unsure };
}
