/**
 * One line in every room (K4). Each scene hides one English line for the learner to find in their own words, so a
 * clean speaker also leaves with something, and the TV shows whether they found it.
 *
 * At the start code picks the line from the first source that exists, in this order:
 *   1. the due taught item: the scene's review (review.ts), as it always worked; no line is held beside it;
 *   2. the level check's better phrase (focusParts): a second quoted span of the check's focus that no answer holds;
 *   3. for B2-C2 only, the opening call's optional offer: a sharper way to meet the scene's goal (offerLine);
 *   4. the scene's quiz answer.
 * The line is held here, in server memory, as an unrevealed help rung is (help.ts): the session every screen reads
 * knows only where it came from (SceneLine), never its words, until the learner finds it or the recap hands it over.
 * A restart loses it, and the scene falls back to what it did before: no line, no find, the recap as it was.
 *
 * The partner is given the bring-back contract (LINE_TASK): create a need for it, never say it, one question. Code
 * judges a find, with no model call, on the line's KEY words, not the whole line (lineKey): a taught fix's fix key,
 * with its slip absent; otherwise a short content-word span. A find counts on an unsupported reply only, and only
 * while no partner line, cue, moment, coach's alternative or opened quiz has shown those words.
 *
 * Pure data and one server-memory map: the server, the view and the tests import it.
 */
import { findPhrase, markReused, offer, shownLines } from "./review";
import { findKey, FUNCTION_WORDS, guarded, keysOf, slipOf, slipStands } from "./slip";
import type { Conversation, EnglishScene, LineSource, Placement, PlacementTask, SceneLine, Taught } from "./types";

/** A level-check line or an opening offer is at most this long. */
export const LINE_MAX = 80;
/** A line's key is at most this many words. */
export const KEY_WORDS = 4;
/** The focus a check keeps when its quotes do not hold (check.ts quotedFocus): no quote, no line. */
export const FOCUS_FALLBACK = "Say a little more in each answer";
/** The title a line from the level check is kept under on the learner record, and the source the recap names. */
export const CHECK_TITLE = "Your level check";
/** Bands whose opening call may offer a line (source 3). */
export const OFFER_BANDS: readonly string[] = ["B2", "C1", "C2"];
const LINES_CAP = 200;

/** What a recap sentence is, said plainly: a room line the learner did not find, or a phrase taught in an earlier scene. */
export function originLabel(c: { review?: { fromTitle: string } | null; line?: { source: LineSource } | null }): string {
  if (c.review) return `From an earlier scene: ${c.review.fromTitle.slice(0, 40)}`;
  return c.line?.source === "check" ? "From the level check" : "The line hidden in this room";
}

/** The line a scene hides, as the server holds it: never on the session. */
export interface HiddenLine {
  source: LineSource; text: string;
  /** the words a find is judged on (lineKey, or a fix key) */
  key: string;
  /** a level-check line that fixes the learner's words: their slip key, which a find must not also say */
  slip?: string;
  /** a level-check line: the learner's own quoted words it improves */
  said?: string;
}

// Server memory only: the session reaches every screen.
const g = globalThis as unknown as { __lingaLines?: Map<string, HiddenLine> };
const lines = g.__lingaLines ??= new Map<string, HiddenLine>();

/** Hold the line for conversation `id`; what the session may know of it. */
export function holdLine(id: string, line: HiddenLine): SceneLine {
  lines.set(id, line);
  while (lines.size > LINES_CAP) lines.delete(lines.keys().next().value!);
  return { source: line.source };
}
/** The line conversation `id` hides, or null when it has none or a restart lost it. */
export const heldLine = (id: string): HiddenLine | null => lines.get(id) ?? null;
export const forgetLine = (id: string): void => { lines.delete(id); };

const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const FUNCTION = new Set(FUNCTION_WORDS);
const words = (text: string) => [...text.matchAll(WORD)].map(m => m[0].toLowerCase().replace(/’/g, "'"));
const content = (w: string) => !FUNCTION.has(w) && !/^\p{N}+$/u.test(w);
/** Two phrases are the same line when their words are, case and punctuation aside. */
export const sameLine = (a: string, b: string) => { const x = words(a).join(" "); return !!x && x === words(b).join(" "); };

/**
 * The key of a line that is not a taught fix: the span of at most KEY_WORDS words that starts and ends on a content
 * word and holds the most content words, the first of equals. A key of one content word takes its neighbour (the one
 * before, else the one after), so a single common word is not a find on its own. Null when the line has no content
 * word: such a line is never hidden.
 *
 * 'Which bridge do you mean?' -> "bridge do you mean"; 'Could I have the bill, please?' -> "the bill"
 */
export function lineKey(text: string): string | null {
  const w = words(text);
  let best: [number, number, number] | null = null;
  for (let i = 0; i < w.length; i++) {
    if (!content(w[i])) continue;
    for (let j = i; j < Math.min(w.length, i + KEY_WORDS); j++) {
      if (!content(w[j])) continue;
      const n = w.slice(i, j + 1).filter(content).length;
      if (!best || n > best[0]) best = [n, i, j];
    }
  }
  if (!best) return null;
  let [, i, j] = best;
  if (i === j && w.length > 1) { if (i > 0) i--; else j++; }
  return w.slice(i, j + 1).join(" ");
}

/** A line from `source` with its key: a level-check line that fixes `said` is keyed on its fix key (slip.ts), any other on lineKey. */
export function lineOf(source: LineSource, text: string, said?: string): HiddenLine | null {
  const keys = said ? slipOf(said, text) : null;
  if (keys && guarded(keys.slip)) return { source, text, key: keys.fix, slip: keys.slip, said };
  const key = lineKey(text);
  return key ? { source, text, key, ...(said ? { said } : {}) } : null;
}

/**
 * The level check's focus split in code (P17). A quoted span that one of the task responses holds is the learner's
 * own words (quote, the first such). One more span that no response holds is the better phrase (line), kept only when
 * it is at most LINE_MAX characters and does not contain the learner's words. Any other unheld span, or a line that
 * does not hold, and the focus is the fallback, as a misquote always was. The audience gate is the caller's.
 */
export function focusParts(focus: string, tasks: readonly PlacementTask[]): { focus: string; quote?: string; line?: string } {
  const norm = (x: string) => x.toLowerCase().replace(/[\s"“”]+/g, " ").trim(), said = tasks.map(t => norm(t.response)).join(" | ");
  const spans = [...focus.matchAll(/["“]([^"”]{2,})["”]/g)].map(m => m[1].trim());
  const held = spans.filter(q => said.includes(norm(q))), free = spans.filter(q => !said.includes(norm(q)));
  if (!free.length) return held.length ? { focus, quote: held[0] } : { focus };
  const line = free[0];
  if (free.length > 1 || !held.length || [...line].length > LINE_MAX || findPhrase(line, held[0]) !== null) return { focus: FOCUS_FALLBACK };
  return { focus, quote: held[0], line };
}

/** Source 2: the level check's better phrase, until a room has hidden it (it is then a taught item). */
export function checkLine(p: Placement | null, taught: readonly Taught[]): HiddenLine | null {
  if (!p) return null;
  const { quote, line } = focusParts(p.focus, p.tasks);
  if (!quote || !line || taught.some(t => sameLine(t.better, line))) return null;
  return lineOf("check", line, quote);
}
/** Source 4: the scene's quiz answer. */
export function quizLine(scene: EnglishScene): HiddenLine | null {
  const text = scene.quiz.options[scene.quiz.correct];
  return text ? lineOf("quiz", text) : null;
}
/** A line that speaks about the learner instead of for them: a statement that opens on "you", or one that names them. */
function aboutLearner(text: string, name?: string): boolean {
  const first = words(text)[0] ?? "";
  if (/^you(r|rs|'re|'ve|'ll|'d)?$/.test(first) && !text.trim().endsWith("?")) return true;
  return !!name && findKey(text, name) !== null;
}
/**
 * Source 3: the opening call's offer, kept only when it is a line the learner could say: at most LINE_MAX characters,
 * keyed, not about the learner, and its key in neither the scene's cue nor its quiz options (which the scene may show).
 * The audience gate is the caller's. Null drops it, and the room falls back to its quiz answer.
 */
export function offerLine(raw: unknown, scene: EnglishScene, name?: string): HiddenLine | null {
  const text = typeof raw === "string" ? raw.replace(/\s+/g, " ").trim() : "";
  if (!text || [...text].length > LINE_MAX || aboutLearner(text, name)) return null;
  const line = lineOf("offer", text);
  if (!line || [scene.cue, ...scene.quiz.options].some(x => findKey(x, line.key) !== null)) return null;
  return line;
}

/** What the partner is told while the line is hidden: the bring-back contract. */
export const LINE_TASK = "This scene hides one line, phrase, for the learner to find and say in their own words. Within the scene contract, create a natural moment where the learner would need it, so they can try it on their own. Invite it, never say it: do not use the phrase or its key words yourself, do not ask the learner to repeat, translate or guess it, and do not mention that a line is hidden. Keep to one question per turn.";
/** The tutor's view of the hidden line while it can still be found; null once found, shown, or lost to a restart. */
export function lineBack(c: Conversation): { phrase: string; task: string } | null {
  const s = c.line, line = s && !s.found && !s.shown ? heldLine(c.id) : null;
  return line ? { phrase: line.text, task: LINE_TASK } : null;
}
/** Whether `text`, put on a screen by this scene (a cue, a quiz option), shows the hidden line's key. */
export function showsLine(c: Conversation, text: string): boolean {
  const line = c.line && !c.line.found ? heldLine(c.id) : null;
  return !!line && !!text && findKey(text, line.key) !== null;
}
/**
 * Whether `reply`, sent on conversation `c` as it stood, found the hidden line: the reply's words that say its key, or
 * null. Never a supported reply, never after the scene showed the key (a partner line, the cue, a moment, the coach's
 * alternative, an opened quiz), never twice; a level-check fix also needs its slip absent.
 */
export function lineFound(reply: string, c: Conversation, line: HiddenLine): string | null {
  const s = c.line;
  if (!s || s.found || s.shown || c.supported) return null;
  if (shownLines(c).some(x => !!x && findKey(x, line.key) !== null)) return null;
  if (line.slip && slipStands(reply, line.slip) !== null) return null;
  return findKey(reply, line.key);
}

const WHY: Record<LineSource, string> = { check: "Your level check suggested it.", offer: "A sharper way to meet the goal of this scene.", quiz: "The line this scene was built around." };
/** The learner-record item a found or handed-over line becomes, so a later scene can invite it (review.ts). */
export function lineTaught(line: HiddenLine, c: Conversation, at: number): Taught {
  const fix = line.source === "check" && !!line.said && !!line.slip;
  const item: Taught = { id: `${c.id}:line`, kind: fix ? "fix" : "word", said: line.said ?? "", better: line.text, why: WHY[line.source], turnId: `${c.id}:line`, at, sceneId: c.sceneId, title: line.source === "check" ? CHECK_TITLE : c.title, line: line.source, ...(fix ? {} : { key: line.key }) };
  return { ...item, ...(keysOf(item) ?? {}) };
}
/**
 * The record after the scene's line was found (`found`: when, where and the learner's words) or handed over (null).
 * A new line joins the record: found, with no reuse yet, so a later scene invites it unseen; handed over, as invited
 * once. A line the record already holds is that item used again, or invited once more. Capped at `cap`, newest kept.
 */
export function keepLine(taught: Taught[], item: Taught, found: { at: number; conversationId: string; sceneId: string; quote: string } | null, cap: number): Taught[] {
  const same = taught.find(t => sameLine(t.better, item.better));
  if (same) return found ? markReused(taught, same.id, found.conversationId, found.quote, found.at, found.sceneId) : offer(taught, same.id, item.at);
  return (found ? [...taught, item] : offer([...taught, item], item.id, item.at)).slice(-cap);
}
