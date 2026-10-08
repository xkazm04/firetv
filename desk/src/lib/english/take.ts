/**
 * Take Two (v2 L4, adult C1): one note's beat played again. The scene goes back to the partner line before the noted
 * turn (forkOf), and code says whether the note held on the learner's line again (heldOf): true, false, or null when
 * code cannot tell. It never guesses: a held note is backed by the tense rule or by a phrase the line contains.
 *
 * Pure: no model call and no filesystem, safe on the TV, the phone and in tests. A take is never evidence; nothing
 * here writes to the learner record.
 */
import { resolveEnglish } from "../rules/english";
import { sentenceWith } from "./notes";
import { findPhrase } from "./review";
import type { Conversation, ConversationTurn, SceneNote, Take } from "./types";

const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
const said = (text: string, phrase: string) => findPhrase(text, phrase) !== null;

/**
 * Whether `note` held on `line`, the learner's line in the take. `noted` is the text of the turn the note quotes (the
 * quote alone when it is not given: cleanNotes keeps a form note only where that turn's sentence clashes). The rule per kind:
 * - form: the time marker of the noted sentence (resolveEnglish, lib/rules/english.ts) is looked for in each sentence
 *   of the line, as the rule finds markers (the sentence's own first marker). Not held when any sentence carrying that marker still has a tense conflict. Held when none does and at
 *   least one of them has a verb form the rule reads. Null when no sentence carries the marker, when none of them has
 *   a verb form, or when the noted sentence has no marker or no conflict. The better phrase plays no part: a form note
 *   is the rule's, so a parroted better phrase beside a sentence that still clashes is not held.
 * - word: needs a better phrase. Held when the quoted words are gone (findPhrase, words compared without case or
 *   punctuation; where the better phrase itself says the quote, it is looked for outside the better phrase) and the
 *   better phrase is contained. Not held while the quote is still there. Null when the quote is gone and the better
 *   phrase is not said: the learner said something else, and code cannot tell whether it is better.
 * - meaning (and a reading): needs a better phrase. Held when the better phrase is contained; else null.
 * - register: always null: no rule reads register.
 * An empty line is null.
 */
export function heldOf(note: SceneNote, line: string, noted: string = note.quote): boolean | null {
  const text = line.trim(), better = note.better?.trim() ?? "";
  if (!text) return null;
  switch (note.kind) {
    case "form": {
      const was = resolveEnglish(sentenceWith(noted, note.quote));
      if (!was.conflict || !was.marker) return null;
      // the sentences whose own marker is the noted one, read as the rule reads markers (whole words, never "ever" in "every")
      const marker = was.marker.toLowerCase();
      const cards = sentences(text).map(x => resolveEnglish(x)).filter(c => c.marker?.toLowerCase() === marker);
      if (!cards.length) return null;
      if (cards.some(c => c.conflict)) return false;
      return cards.some(c => c.verb !== null) ? true : null;
    }
    case "word": {
      if (!better) return null;
      const used = findPhrase(text, better);
      const rest = used !== null && said(better, note.quote) ? text.replace(used, " ") : text;
      if (said(rest, note.quote)) return false;
      return used !== null ? true : null;
    }
    case "meaning": return better && said(text, better) ? true : null;
    default: return null;
  }
}

/** Where a take forks: the partner line nearest before the noted learner turn. Null when the turn or the line is missing. */
export function forkOf(note: SceneNote, turns: ConversationTurn[]): ConversationTurn | null {
  const at = turns.findIndex(t => t.id === note.turnId && t.role === "learner");
  for (let i = at - 1; i >= 0; i--) if (turns[i].role === "partner") return turns[i];
  return null;
}

/** The cast turns a take plays after the learner's line again; then it ends by itself. */
export const TAKE_CAST_TURNS = 2;
/** The take running on this conversation: the last one, while it has not ended. */
export function runningTake(c: Conversation): Take | null {
  const t = c.takes?.at(-1);
  return t && t.endedAt === undefined ? t : null;
}
