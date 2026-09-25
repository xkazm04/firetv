/**
 * Taught phrases come back. A moment keeps what Linga taught on the learner record (conversation.ts, last 60);
 * this file brings one of them back into a later scene and decides, in code, whether the learner used it again.
 *
 * The model only phrases: at the start of a scene code picks the one item that is due, and the partner is asked to
 * make room for it without saying it (bringBack). Whether a reply used it is normalised containment, judged here on
 * the learner's own words: never a supported reply, and never a phrase this scene already put in front of them.
 *
 * Pure data, no filesystem: the server, the view and the tests all import it.
 */
import type { Conversation, Review, Taught } from "./types";

/** An item two scenes invited without the learner using it rests: it is not offered a third time. */
export const REVIEW_OFFERS = 2;
/** The learner's words as the recap shows them: the whole reply when it fits, else the sentence that used it. */
export const USED_MAX = 180;

/**
 * The one taught item due in the scene `episodeId` starts: from an earlier rehearsal, never used again, offered
 * fewer than REVIEW_OFFERS times, the oldest first. Null when none is left.
 */
export function dueTaught(taught: Taught[], episodeId: string): Taught | null {
  return taught.filter(t => t.reusedAt === undefined && (t.offered ?? 0) < REVIEW_OFFERS && !t.turnId.startsWith(`${episodeId}:`))
    .sort((a, b) => a.at - b.at)[0] ?? null;
}
export function reviewOf(t: Taught): Review { return { id: t.id, kind: t.kind, better: t.better, fromTitle: t.title }; }

/** What the tutor is told while the item is not yet used: the phrase, what it means, and to invite it, never say it. */
export function bringBack(c: Conversation, taught: Taught[]): { phrase: string; meaning: string; task: string } | null {
  const r = c.review;
  if (!r || r.used) return null;
  const item = taught.find(t => t.id === r.id);
  return {
    phrase: r.better, meaning: item?.why ?? "",
    task: `In an earlier scene Linga taught this learner ${r.kind === "fix" ? "this phrase" : "this word"}. Within the scene contract, create a natural moment where the learner would need it, so they can try it on their own. Invite it, never say it: do not use the phrase or its key words yourself, do not ask the learner to repeat, translate or remember it, and do not mention that it was taught. Keep to one question per turn.`,
  };
}

/** Words as they are compared: lower case, one kind of apostrophe, punctuation and spacing ignored. */
const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const tokens = (text: string) => [...text.matchAll(WORD)].map(m => ({ word: m[0].toLowerCase().replace(/’/g, "'"), at: m.index!, end: m.index! + m[0].length }));
/** Where `phrase` stands in `text`, word for word, as the excerpt of `text` that says it; null when it does not. */
export function findPhrase(text: string, phrase: string): string | null {
  const want = tokens(phrase).map(t => t.word), have = tokens(text);
  if (!want.length) return null;
  for (let i = 0; i + want.length <= have.length; i++)
    if (want.every((w, k) => have[i + k].word === w)) return text.slice(have[i].at, have[i + want.length - 1].end);
  return null;
}
/** Everything this scene has already put in front of the learner: the partner's lines, the cue, its moments, the coach. */
function alreadyShown(c: Conversation, phrase: string): boolean {
  const shown = [...c.turns.filter(t => t.role === "partner").map(t => t.text), c.cue, ...(c.moments ?? []).map(m => m.better), c.coaching?.after ?? ""];
  return shown.some(x => !!x && findPhrase(x, phrase) !== null);
}
/**
 * Whether `reply`, sent on conversation `c` as it stood, used the scene's review item unaided: the learner's own
 * words that say it, or null. Never a supported reply, never after the scene already showed the phrase, never twice.
 */
export function reuseOf(reply: string, c: Conversation): string | null {
  const r = c.review;
  if (!r || r.used || c.supported || alreadyShown(c, r.better)) return null;
  return findPhrase(reply, r.better);
}
/** The learner's words as the recap shows them: the reply, or the sentence of it that holds the quote. */
export function usedLine(reply: string, quote: string): string {
  const said = reply.trim();
  if (said.length <= USED_MAX) return said;
  const sentence = said.split(/(?<=[.!?])\s+/).find(x => x.includes(quote));
  return sentence && sentence.length <= USED_MAX ? sentence : quote.slice(0, USED_MAX);
}

/** The record after a scene invited the item. */
export function offer(taught: Taught[], id: string): Taught[] { return taught.map(t => t.id === id ? { ...t, offered: (t.offered ?? 0) + 1 } : t); }
/** The record after the learner used the item unaided in conversation `conversationId`. */
export function markReused(taught: Taught[], id: string, conversationId: string, quote: string, at: number): Taught[] {
  return taught.map(t => t.id === id ? { ...t, reusedAt: at, reusedIn: conversationId, reusedQuote: quote } : t);
}
