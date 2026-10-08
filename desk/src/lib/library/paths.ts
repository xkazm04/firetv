/**
 * Math paths: a learner's Math course as a thing the desk can name. The 'school' path, "School maths", is the school
 * spine (SYLLABUS as it stands: four fractions units, one-step equations, four decimals and percent units, two ratio and
 * rates units, two geometry and data units, then the other two linear-equation topics, fifteen in all, with their
 * school-year bands; Family W5b extended it in place and renamed it, owner decision D5, W7 batch 1 added three fractions
 * units, W7 batch 2 the decimals and percent strand and W7 batch 3 the last four); the 'calc1' path is the Calculus 1 course (CALC1_SPINE), which
 * has no school year, and the 'calc2' path the integration-techniques course that follows it (CALC2_SPINE, v2 M3b-2). Every screen and pipeline that needs "the" topic list asks here - for the learner's path - rather
 * than reading SYLLABUS directly.
 *
 * Client-safe: only types and library data files are imported, never the store, the learners file, a job or an engine
 * at runtime, so a TV screen, the phone and a server route may each read it.
 */
import type { SchoolSystem } from "@/lib/session/store";import { SYLLABUS, expectedIndex } from "./syllabus";
import { CALC1_SPINE, type CalcShape } from "./calculus1.spine";
import { CALC2_SPINE } from "./calculus2.spine";
import type { Calc2SpecShape } from "../rules/calc2";

export type MathPath = "school" | "calc1" | "calc2";

/**
 * How a path's items are judged (architecture card 5 part a, v2 M3b-1): 'school' - a topic whose unit has a code
 * generator is a school item, any other a linear one; 'calc' - every topic is a Calculus item, set and checked by the
 * expression engine on its own shapes. Every site that asks "is this Calculus?" of a path or a topic asks here, never the
 * path's id.
 */
export type PathJudge = "school" | "calc";

export interface PathTopic {
  id: string;
  name: string;
  strand: string;
  /** ONE sentence, for the caption slot. */
  blurb: string;
  /** Topic ids of the same path, each an earlier topic. */
  prereq: string[];
  lessonId?: string;
  /** The school year the topic is normally met in, per system - school topics only, so nothing reads a year off a course topic. */
  year?: { us: number; uk: number; cz: number; de: number };
  /** The practice shapes the Calculus engine may set - topics of a path judged 'calc' only, the spine's own list. */
  shapes?: (CalcShape | Calc2SpecShape)[];
}

/**
 * The words a prompt uses for a Calculus course (v2 M3b-2 ruling 6): the course as the set's prompt names it, as the
 * hint's stance names it, and the methods the stance tells the tutor to use. Data on the path's record, so no site names a path id.
 */
export interface CalcWords {
  /** The course in the set's prompt: "a university <desk> desk". */
  desk: string;
  /** The course in the hint's stance: "a first-year university student in {course}". */
  course: string;
  /** The course's methods, as a phrase: "Use the course's methods and notation - {methods} - and name the rule that applies". */
  methods: string;
}

export interface PathInfo {
  id: MathPath;
  name: string;
  /** ONE sentence: what this path is. */
  blurb: string;
  /** True for a school-year path (its topics carry a year); false for a course with no school year. */
  school: boolean;
  /** How the path's items are judged (PathJudge): kindOfTopic, the Calculus slips, the hint's stance and the set's shapes read it. */
  judge: PathJudge;
  /** The prompt words of a path judged 'calc'; absent on any other path. */
  calcWords?: CalcWords;
  topics: PathTopic[];
}

export const PATHS: Record<MathPath, PathInfo> = {
  school: {
    id: "school",
    name: "School maths",
    blurb: "School maths from equivalent fractions through equations to Pythagoras' theorem and the probability of an event.",
    school: true,
    judge: "school",
    topics: SYLLABUS.map((t): PathTopic => ({
      id: t.id, name: t.name, strand: t.strand, blurb: t.blurb, prereq: t.prereq,
      ...(t.lessonId ? { lessonId: t.lessonId } : {}),
      year: t.year,
    })),
  },
  calc1: {
    id: "calc1",
    name: "Calculus 1",
    blurb: "A university first course in calculus, from functions and limits through derivatives to integrals.",
    school: false,
    judge: "calc",
    calcWords: { desk: "Calculus 1", course: "Calculus I", methods: "limits, the derivative rules, antiderivatives and the Fundamental Theorem" },
    topics: CALC1_SPINE.map((t): PathTopic => ({ id: t.id, name: t.name, strand: t.strand, blurb: t.blurb, prereq: t.prereq, shapes: t.shapes.slice() })),
  },
  calc2: {
    id: "calc2",
    name: "Calculus 2",
    blurb: "A second university course in calculus that follows Calculus 1, on the techniques of integration.",
    school: false,
    judge: "calc",
    calcWords: { desk: "Calculus 2", course: "Calculus II", methods: "integration by parts, trigonometric integrals, trigonometric substitution and partial fractions" },
    topics: CALC2_SPINE.map((t): PathTopic => ({ id: t.id, name: t.name, strand: t.strand, blurb: t.blurb, prereq: t.prereq, shapes: t.shapes.slice() })),
  },
};

/** Is this a path's id: a key of PATHS itself (never one it inherits, like 'toString'). */
export function isPath(x: unknown): x is MathPath {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(PATHS, x);
}

/** The path a profile follows: a mathPath that is a key of PATHS, anything else is the school path. */
export function pathOf(profile?: { mathPath?: unknown } | null): MathPath {
  const m = profile?.mathPath;
  return isPath(m) ? m : "school";
}

/** How a path's items are judged; the school path's judge when no path is given. */
export function judgeOf(path?: MathPath): PathJudge {
  return PATHS[path ?? "school"].judge;
}

/** How a topic's items are judged, by the path it belongs to; undefined for a topic on no path. */
export function judgeOfTopic(id: string): PathJudge | undefined {
  const path = pathOfTopic(id);
  return path ? PATHS[path].judge : undefined;
}

/**
 * The prompt words of the Calculus course a path stands for: its own when it is judged 'calc', else the first path judged
 * 'calc' (a 'calc'-kind question met on the school path, or with no path, uses today's words).
 */
export function calcWordsOf(path?: MathPath): CalcWords {
  const own = path ? PATHS[path] : undefined;
  const p = own?.judge === "calc" ? own : Object.values(PATHS).find((x) => x.judge === "calc")!;
  return p.calcWords!;
}

/** Every topic of every path judged 'calc', in path order: the Calculus topics, each with its shapes. */
export function calcTopics(): PathTopic[] {
  return Object.values(PATHS).filter((p) => p.judge === "calc").flatMap((p) => p.topics);
}

/** A Calculus topic's practice shapes (a copy); empty for a topic on no path judged 'calc'. */
export function shapesOfTopic(id: string): CalcShape[] {
  return judgeOfTopic(id) === "calc" ? (topicIn(id)?.shapes?.slice() ?? []) : [];
}

export function topicsOf(path: MathPath): PathTopic[] {
  return PATHS[path].topics;
}

/** A topic by id, on whichever path it belongs to. */
export function topicIn(id: string): PathTopic | undefined {
  for (const p of Object.values(PATHS)) {
    const t = p.topics.find((x) => x.id === id);
    if (t) return t;
  }
  return undefined;
}

/** The path a topic id belongs to. */
export function pathOfTopic(id: string): MathPath | undefined {
  return (Object.keys(PATHS) as MathPath[]).find((p) => PATHS[p].topics.some((t) => t.id === id));
}

/** First topic on the path that is not secure and whose prereqs all are. */
export function nextOn(path: MathPath, secure: string[]): PathTopic | undefined {
  return topicsOf(path).find((t) => !secure.includes(t.id) && t.prereq.every((p) => secure.includes(p)));
}

/** The index just after the last of `ids` that is secure: 0 when none is, ids.length when the last one is. */
export function afterLastSecure(ids: readonly string[], isSecure: (id: string) => boolean): number {
  for (let i = ids.length - 1; i >= 0; i--) if (isSecure(ids[i])) return i + 1;
  return 0;
}

/**
 * The learner's frontier on a path - where the needle stands and where "Teach me something" opens Topics:
 *   - a school path: the first topic not secure AFTER the last secure one, else the first topic (Family W5b). A unit
 *     placed before topics a learner has already secured (fractions before linear equations) does not send them back
 *     to the start: with one-step equations secure the frontier is the topic after it (since W7 batch 2 "Add, subtract
 *     and multiply decimals", before that two-step equations), never the new first unit;
 *   - a course path (Calculus 1): the first topic not secure whose prerequisites all are (`nextOn`), as always.
 * Undefined when there is none left (the last topic of a school path is secure; everything is, on a course).
 */
export function frontierOn(path: MathPath, secure: readonly string[]): PathTopic | undefined {
  const topics = topicsOf(path);
  if (!PATHS[path].school) return nextOn(path, [...secure]);
  return topics[afterLastSecure(topics.map((t) => t.id), (id) => secure.includes(id))];
}

/**
 * How many topics on the path a learner of that age is normally already past (expectedIndex for the school path);
 * null for a course path, which has no school year to be behind or ahead of.
 */
export function expectedOn(path: MathPath, system: SchoolSystem, age: number): number | null {
  return PATHS[path].school ? expectedIndex(system, age) : null;
}

/** The path of the learner at the desk, by their profile; the school path when there is no learner or no profile. */
export function learnerPath(s: { profiles?: { id: string; mathPath?: unknown }[]; learner?: { id: string } | null }): MathPath {
  const id = s.learner?.id;
  return pathOf(id ? s.profiles?.find((p) => p.id === id) : undefined);
}
