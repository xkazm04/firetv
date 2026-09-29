/**
 * Math paths: a learner's Math course as a thing the desk can name. The 'school' path is the linear-equation spine
 * (SYLLABUS, unchanged, with its school-year bands); the 'calc1' path is the Calculus 1 course (CALC1_SPINE), which
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
    name: "Linear equations",
    blurb: "School algebra's linear equations, from one step to brackets and x on both sides.",
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
