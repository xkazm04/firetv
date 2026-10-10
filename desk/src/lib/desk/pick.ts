/**
 * "Watch the bit that explains this" — choose from the syllabus, then find the segment.
 * The PoC scored 4/9 on the problem text, 8/9 choosing from the syllabus; and 'none' must stay
 * a first-class answer (lessons §7: a menu tends to get something picked).
 */
import { text } from "../engines/text";
import { LESSONS, bestWindow, type Lesson } from "../library/lessons";
import { readQuestion } from "../rules/kinds";
import { leaksLine, type Specs } from "./hint";
import type { LessonPick, SchoolSystem, Subject } from "../session/store";

const SCHEMA = { type: "object", properties: { lesson: { type: "string" }, why: { type: "string" } }, required: ["lesson", "why"] };

/**
 * The "why" the TV shows under the lesson. On a maths problem it passes the hint's own leak check (hint.ts leaksLine: the
 * one leak rule plus each reader's own) like every hint line; a sentence that gives the answer away is replaced by one
 * built here from the lesson's own concept tags, and that one is checked too. English and essay have no equation.
 */
function checkedWhy(subject: Subject, problem: string, l: Lesson, why: string, system?: SchoolSystem): string {
  if (subject !== "maths") return why;
  const read = readQuestion(problem, system);
  const specs: Specs = { calc: read.calc ?? null, school: read.school ?? null, parts: read.parts ?? null };
  if (!leaksLine(problem, specs, why, system)) return why;
  const own = `Chosen because your problem needs this lesson's method: ${l.concepts[0]}.`;
  return l.concepts[0] && !leaksLine(problem, specs, own, system) ? own : "Chosen because your problem needs the method this lesson teaches.";
}

export async function pickLesson(subject: Subject, problem: string, system?: SchoolSystem): Promise<LessonPick | null> {
  const menu = LESSONS.filter((l) => l.subject === subject).map((l) => `- ${l.id}: ${l.title} — teaches: ${l.concepts.join(", ")}`).join("\n");
  const { json } = await text<{ lesson: string; why: string }>({
    system: "You match a student's problem to the one lesson in a small library that teaches the method it needs. Most problems are NOT covered by a small library — if none of the lessons teaches the required method, answer exactly 'none'. A wrong lesson wastes the student's time; 'none' does not.",
    prompt: `Problem:\n${problem}\n\nLessons:\n${menu}\n\nAnswer with the lesson id (or 'none') and one sentence saying why, phrased for the student: "chosen because your problem needs …".`,
    schema: SCHEMA, model: "fast",
  });
  // only an id from the menu that was offered counts: 'none', another subject's id and a non-string are no lesson
  const offered = LESSONS.filter((x) => x.subject === subject);
  const l = typeof json.lesson === "string" ? offered.find((x) => x.id === json.lesson.trim()) : undefined;
  if (!l) return null;
  const w = l.youtube ? await bestWindow(l.id, `${problem}. ${l.concepts.join(", ")}`) : null;
  return { id: l.id, title: l.title, t: w?.t ?? 0, text: w?.text ?? "", why: checkedWhy(subject, problem, l, json.why, system), youtube: l.youtube };
}
