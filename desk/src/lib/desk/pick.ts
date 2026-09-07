/**
 * "Watch the bit that explains this" — choose from the syllabus, then find the segment.
 * The PoC scored 4/9 on the problem text, 8/9 choosing from the syllabus; and 'none' must stay
 * a first-class answer (lessons §7: a menu tends to get something picked).
 */
import { text } from "../engines/text";
import { LESSONS, bestWindow } from "../library/lessons";
import type { LessonPick, Subject } from "../session/store";

const SCHEMA = { type: "object", properties: { lesson: { type: "string" }, why: { type: "string" } }, required: ["lesson", "why"] };

export async function pickLesson(subject: Subject, problem: string): Promise<LessonPick | null> {
  const menu = LESSONS.filter((l) => l.subject === subject).map((l) => `- ${l.id}: ${l.title} — teaches: ${l.concepts.join(", ")}`).join("\n");
  const { json } = await text<{ lesson: string; why: string }>({
    system: "You match a student's problem to the one lesson in a small library that teaches the method it needs. Most problems are NOT covered by a small library — if none of the lessons teaches the required method, answer exactly 'none'. A wrong lesson wastes the student's time; 'none' does not.",
    prompt: `Problem:\n${problem}\n\nLessons:\n${menu}\n\nAnswer with the lesson id (or 'none') and one sentence saying why, phrased for the student: "chosen because your problem needs …".`,
    schema: SCHEMA, model: "fast",
  });
  const l = LESSONS.find((x) => x.id === json.lesson.trim());
  if (!l) return null;
  const w = l.youtube ? await bestWindow(l.id, `${problem}. ${l.concepts.join(", ")}`) : null;
  return { id: l.id, title: l.title, t: w?.t ?? 0, text: w?.text ?? "", why: json.why, youtube: l.youtube };
}
