/**
 * Math paths: a learner's Math course as a thing the desk can name. The 'school' path, "School maths", is the school
 * spine (SYLLABUS as it stands: add and subtract fractions, then linear equations, with its school-year bands; Family
 * W5b extended it in place and renamed it, owner decision D5); the 'calc1' path is the Calculus 1 course (CALC1_SPINE), which
 * has no school year. Every screen and pipeline that needs "the" topic list asks here - for the learner's path - rather
 * than reading SYLLABUS directly.
 *
 * Client-safe: only types and library data files are imported, never the store, the learners file, a job or an engine
 * at runtime, so a TV screen, the phone and a server route may each read it.
 */
import type { SchoolSystem } from "@/lib/session/store";import { SYLLABUS, expectedIndex } from "./syllabus";
import { CALC1_SPINE } from "./calculus1.spine";

export type MathPath = "school" | "calc1";

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
}

export interface PathInfo {
  id: MathPath;
  name: string;
  /** ONE sentence: what this path is. */
  blurb: string;
  /** True for a school-year path (its topics carry a year); false for a course with no school year. */
  school: boolean;
  topics: PathTopic[];
}

export const PATHS: Record<MathPath, PathInfo> = {
  school: {
    id: "school",
    name: "School maths",
    blurb: "School maths from adding fractions to equations with brackets and x on both sides.",
    school: true,
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
    topics: CALC1_SPINE.map((t): PathTopic => ({ id: t.id, name: t.name, strand: t.strand, blurb: t.blurb, prereq: t.prereq })),
  },
};

/** The path a profile follows: only the string 'calc1' is the Calculus course, anything else is the school path. */
export function pathOf(profile?: { mathPath?: unknown } | null): MathPath {
  return profile?.mathPath === "calc1" ? "calc1" : "school";
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
 *     to the start: with one-step equations secure the frontier is two-step equations, not the new first unit;
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
