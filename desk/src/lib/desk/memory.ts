/**
 * What the session taught the desk about this learner.
 *
 * One to three plain sentences in the third person, written to be read back into a later prompt
 * — items.ts and explain.ts carry them, through notesPart below, as quoted data (hint.ts does not). So: prose, not JSON, not bullets, no
 * numbers the next session cannot check. The existing memory goes into the prompt so the desk
 * does not write the same sentence forty times.
 */
import { text } from "../engines/text";
import { topicIn } from "../library/paths";
import { getLearner, readLearner, RECALL_UNREAD, saveLearner, type Learner, type MemoryNote } from "../session/learners";
import { assemble, dataList, dataRows, say, type Part } from "../prompt/assemble";
import { slip as slipById } from "../rules/maths";
import type { PracticeItem } from "../session/store";
import { askedText } from "../rules/calc-word";
import { markCounts, markOf } from "../rules/marks";
import type { Evening } from "../../tv/recapRows";

/** The longest note the writer may keep: one or two plain sentences. */
export const NOTE_MAX = 240;

const SCHEMA = {
  type: "object",
  properties: { lines: { type: "array", items: { type: "string", maxLength: NOTE_MAX } } },
  required: ["lines"],
};

const DAY = 24 * 60 * 60 * 1000;
/** A note's age in the words a prompt carries it: undated for a legacy note, never a guess. */
export function ageOf(at: number | null, now = Date.now()): string {
  if (at === null) return "(undated)";
  const days = Math.floor((now - at) / DAY);
  return days <= 0 ? "(today)" : days === 1 ? "(yesterday)" : days < 14 ? `(${days} days ago)` : `(${Math.floor(days / 7)} weeks ago)`;
}

/**
 * The learner's notes as every prompt that reads them back carries them (explain.ts, items.ts). They are the desk's
 * own observations, written by a model and confirmed by no one, so they are framed as notes, quoted as data, each with
 * its age, and the list says when the cap has dropped older ones (agent-memory: observation-clock, loss-site-inventory).
 * Absent when there are none; the unavailable line when the record could not be read (null).
 */
export function notesPart(me: Pick<Learner, "memory" | "memoryDropped"> | null, now = Date.now()): Part[] {
  if (!me) return [say("notes", RECALL_UNREAD)];
  return [
    dataRows("notes", "The desk's own earlier notes on this student (written by the desk, not checked by anyone, oldest first)",
      me.memory.map((n: MemoryNote, i) => ({ n: i + 1, value: n.text, note: ageOf(n.at, now) }))),
    say("dropped", me.memory.length && me.memoryDropped ? `${me.memoryDropped} older note${me.memoryDropped === 1 ? " was" : "s were"} dropped to keep this list short.` : ""),
  ];
}

/** A filter that drops a line equal (case, runs of space) to a held note or to an earlier line of the same answer. */
function distinctFrom(held: readonly string[]): (l: string) => boolean {
  const norm = (l: string) => l.toLowerCase().replace(/\s+/g, " ").trim();
  const seen = new Set(held.map(norm));
  return (l) => { const k = norm(l); if (seen.has(k)) return false; seen.add(k); return true; };
}

export async function writeMemory(
  learnerId: string,
  session: { topic?: string; items?: PracticeItem[]; hintsUsed?: number } & Partial<Evening>,
): Promise<string[]> {
  const existing = readLearner(learnerId).memory.map((n) => n.text);
  const items = session.items ?? [];
  const t = session.topic ? topicIn(session.topic) : undefined;

  // each question as data, the desk's verdict and slip as its note; the learner's working (read from a photo) quoted too
  const rows = items.map((i) => {
    const s = i.slip ? slipById(i.slip, session.topic) : undefined;
    return { n: i.n, value: askedText(i), note: `— ${i.verdict ? markOf(i) : "not marked"}` + (s ? ` (${s.id}: ${s.says})` : "") +
      (i.studentWorking ? ` — their working: ${JSON.stringify(i.studentWorking)}` : "") };
  });

  // an item left empty is its own count (rules/marks skipped), not one the desk could not call
  const { right, wrong, unsure, skipped } = markCounts(items.filter((i) => i.verdict));

  const system =
    "You keep a tutor's private notes on one student. You write one to three plain sentences in the third person about " +
    "this student — what they struggled with, what unstuck them, how they seem to like being taught. " +
    "Plain sentences that will be read back to you later, not JSON, not bullet points, no headings, no numbers or scores. " +
    "No LaTeX. Never write the student's name; call them 'they'. Say only what tonight actually showed.";

  // one section per app that had work tonight; counts, lens names and the closed slip vocabulary only
  const maths = !!(items.length || session.hintsUsed);
  const mathsLine = maths && `Topic worked on tonight: ${t?.name ?? session.topic ?? "unknown"}\n` +
    `Marked: ${right} right, ${wrong} wrong, ${unsure} the desk could not call${skipped ? `, ${skipped} skipped` : ""}.\n` +
    `Hints asked for: ${session.hintsUsed ?? 0}`;
  const essay = (session.essay ?? []).length
    ? `Essay Master tonight:\n${session.essay!.map((e) => `- a reading through the ${e.lens} lens: ${e.sentences} sentences read, ${e.before} to fix when read` +
      (e.after !== e.before ? `, ${e.after} after rewrites` : "")).join("\n")}\n\n`
    : "";
  const linga = session.linga?.conversations
    ? `Linga tonight: ${session.linga.conversations} English conversation${session.linga.conversations === 1 ? "" : "s"}, ${session.linga.replies} replies from them.\n\n`
    : "";

  const asked = assemble("memory", {
    system: [say("stance", system)],
    prompt: [
      say("maths", mathsLine),
      dataRows("set", "The set", maths ? rows : []),
      say("essay", essay.trim()),
      say("linga", linga.trim()),
      dataList("noted", "What you already noted about them — do not repeat any of it", existing),
      say("ask", "Write what tonight added. If tonight added nothing new, return an empty list."),
    ],
  });

  const { json } = await text<{ lines: string[] }>({ ...asked, schema: SCHEMA, model: "fast", thinking: false, shorten: true, use: "memory" });
  const lines = (Array.isArray(json?.lines) ? json.lines : [])
    .filter((l): l is string => typeof l === "string")
    .map((l) => l.trim().replace(/^[-*\d.\s]+/, ""))
    .filter(Boolean)
    .filter(distinctFrom(existing))
    .slice(0, 3);
  // WD10: the lines are added in ONE save (read fresh: the record may have moved while the model wrote), so a failed write keeps none and a Try again writes each once
  if (lines.length) {
    // each note is dated and names its writer (agent-memory: observation-clock); the text is what the model wrote, as kept
    const l = getLearner(learnerId), at = Date.now();
    saveLearner({ ...l, memory: [...l.memory, ...lines.map((text): MemoryNote => ({ text, at, source: "nightly" }))] });
  }
  return lines;
}
