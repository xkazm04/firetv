/**
 * The notes at Cut (v2 L3, adult plan A2): up to three, each quoting the learner's own words. The model proposes
 * them; this file decides which stand. Pure: safe on the TV, the phone and in tests.
 *
 * cleanNotes(raw, turns) keeps a note only when:
 * - its turnId is a learner turn of this take (a partner line is never quoted back as the learner's);
 * - its quote is an exact, nonempty substring of THAT turn's text, character for character;
 * - its kind is meaning, form, word or register, and its note one sentence;
 * - its quote is not one an earlier note already took (notes pile on one slip otherwise);
 * - three have not already been kept: a fourth is dropped.
 * A "form" note stays "form" only where resolveEnglish (lib/rules/english.ts, the tense rule) finds a conflict in the
 * sentence the quote sits in. Otherwise it becomes "meaning" and is marked a reading: the model's read, not a rule.
 * Notes are never evidence: nothing here writes to the learner record.
 */
import { resolveEnglish } from "../rules/english";
import type { ConversationTurn, NoteKind, SceneNote } from "./types";

export const NOTES_MAX = 3;
export const NOTE_KINDS: readonly NoteKind[] = ["meaning", "form", "word", "register"];
export const QUOTE_MAX = 180, NOTE_MAX = 160, BETTER_MAX = 180;
/** What the tape strip calls each kind. A reading is a meaning note the rule could not confirm as form. */
export const NOTE_LABEL: Record<NoteKind, string> = { meaning: "Meaning", form: "Form", word: "Word", register: "Register" };

const obj = (v: unknown): Record<string, unknown> => v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
/** One sentence: no sentence end followed by more words. "Say 'went', not 'goed'." is one; "Good. Now try x." is two. */
const oneSentence = (s: string) => !/[.!?]["”’')]*\s+\S/.test(s);

/** The sentence of a turn the quote sits in; the whole turn when the quote crosses a sentence end. */
export function sentenceWith(text: string, quote: string): string {
  return text.split(/(?<=[.!?])\s+/).find(x => x.includes(quote)) ?? text;
}

export function cleanNotes(raw: unknown, turns: ConversationTurn[]): SceneNote[] {
  const items = Array.isArray(raw) ? raw : Array.isArray(obj(raw).notes) ? obj(raw).notes as unknown[] : [];
  const learner = new Map(turns.filter(t => t.role === "learner").map(t => [t.id, t.text]));
  const quotes = new Set<string>(), out: SceneNote[] = [];
  for (const item of items) {
    if (out.length >= NOTES_MAX) break;
    const n = obj(item), text = typeof n.turnId === "string" ? learner.get(n.turnId) : undefined;
    const quote = typeof n.quote === "string" ? n.quote : "", note = typeof n.note === "string" ? n.note.trim() : "";
    if (text === undefined || !quote.trim() || quote.length > QUOTE_MAX || !text.includes(quote)) continue;
    if (!NOTE_KINDS.includes(n.kind as NoteKind) || !note || note.length > NOTE_MAX || !oneSentence(note)) continue;
    const key = quote.trim().toLowerCase();
    if (quotes.has(key)) continue;
    quotes.add(key);
    const better = typeof n.better === "string" ? n.better.trim() : "";
    const form = n.kind === "form", ruled = form && resolveEnglish(sentenceWith(text, quote)).conflict !== null;
    out.push({ turnId: n.turnId as string, quote, kind: form && !ruled ? "meaning" : n.kind as NoteKind, note,
      ...(better && better.length <= BETTER_MAX && better !== quote ? { better } : {}), ...(form && !ruled ? { reading: true } : {}) });
  }
  return out;
}
