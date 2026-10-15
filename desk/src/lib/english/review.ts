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
import { findKey, guarded, keysOf, recordTier, sameSlip, slipIn, slipStands, type SlipKeys } from "./slip";
import type { Conversation, Moment, Review, Taught } from "./types";

/** An item two scenes invited without the learner using it rests: it is not offered a third time. */
export const REVIEW_OFFERS = 2;
/** The learner's words as the recap shows them: the whole reply when it fits, else the sentence that used it. */
export const USED_MAX = 180;

/**
 * The one taught item due in the scene `episodeId` starts: from an earlier rehearsal, never used again, offered
 * fewer than REVIEW_OFFERS times, the oldest first. Null when none is left. `allowed` (curriculum.taughtAllowed) drops
 * items this learner may not be shown now, such as a phrase taught in an adult-audience scene after a switch to Family.
 */
export function dueTaught(taught: Taught[], episodeId: string, allowed?: (t: Taught) => boolean): Taught | null {
  return taught.filter(t => (!allowed || allowed(t)) && t.reusedAt === undefined && (t.offered ?? 0) < REVIEW_OFFERS && !t.turnId.startsWith(`${episodeId}:`))
    .sort((a, b) => a.at - b.at)[0] ?? null;
}
export function reviewOf(t: Taught): Review {
  const keys = keysOf(t);
  return { id: t.id, kind: t.kind, better: t.better, fromTitle: t.title, ...(keys && guarded(keys.slip) ? keys : {}) };
}

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
export const shownLines = (c: Conversation): string[] => [...c.turns.filter(t => t.role === "partner").map(t => t.text), c.cue, ...(c.moments ?? []).map(m => m.better), c.coaching?.after ?? ""];
function alreadyShown(c: Conversation, phrase: string): boolean {
  return shownLines(c).some(x => !!x && findPhrase(x, phrase) !== null);
}
/**
 * Whether `reply`, sent on conversation `c` as it stood, used the scene's review item unaided: the learner's own
 * words that say it, or null. Never a supported reply, never after the scene already showed the phrase, never twice.
 * A fix with guarded keys (slip.ts) is judged by the words that changed: its fix key said, its slip key not ("My
 * tomatoes are big." uses "tomatoes are"); a word, or a fix without keys, by its whole phrase.
 */
export function reuseOf(reply: string, c: Conversation): string | null {
  const r = c.review;
  if (!r || r.used || c.supported) return null;
  if (r.kind === "fix" && r.slip && r.fix && guarded(r.slip)) {
    if (alreadyShown(c, r.fix) || slipStands(reply, r.slip) !== null) return null;
    return findKey(reply, r.fix);
  }
  if (alreadyShown(c, r.better)) return null;
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

/** A taught slip said again: the reply's own words that say it, the fix in its place, and whether it may write to the record. */
export interface SlipAgain { said: string; better: string; keys: SlipKeys; record: boolean }
/** The partner's lines in this scene: correct English, so a slip key the partner said is never judged on the record. */
export const partnerLines = (c: Conversation): string[] => c.turns.filter(t => t.role === "partner").map(t => t.text);
/**
 * The taught slips `reply` says again (slip.ts slipIn): this scene's moments first, then the learner's taught fixes
 * (already filtered to those this learner may be shown), one per slip key. Any of them may ask the partner for a soft
 * recast; only `record` ones may count on the learner record. Code, before the model call; never a model judgement.
 */
export function slipsAgain(reply: string, c: Conversation, taught: readonly Taught[]): SlipAgain[] {
  const out: SlipAgain[] = [], partner = partnerLines(c);
  for (const item of [...(c.moments ?? []), ...taught]) {
    const keys = keysOf(item);
    if (!keys || out.some(h => sameSlip(h.keys.slip, keys.slip))) continue;
    const said = slipIn(reply, keys);
    if (said !== null) out.push({ said, better: keys.fix, keys, record: recordTier(keys, partner) });
  }
  return out;
}
/** What the partner is told when a taught slip comes back: model the right form once, and never stop the scene for it. */
export const SLIP_AGAIN_TASK = "The learner just said again a form Linga already taught: said is their words, better is the right form. In your reply, use the right form naturally once, as you would in conversation, without pointing it out, correcting them or asking them to repeat it. Do not stop the scene for it.";

/** The taught fix a slip key belongs to: the oldest fix whose own slip key is the same slip. */
function itemOf(taught: readonly Taught[], slip: string, allowed?: (t: Taught) => boolean): Taught | undefined {
  return taught.filter(t => t.kind === "fix" && (!allowed || allowed(t))).sort((a, b) => a.at - b.at)
    .find(t => { const k = keysOf(t); return !!k && sameSlip(k.slip, slip); });
}
/** The record after the learner said a taught slip again at `at`: its count and date only ever rise. Unchanged when no item holds it. */
export function markSlipped(taught: Taught[], slip: string, at: number, allowed?: (t: Taught) => boolean): Taught[] {
  const item = itemOf(taught, slip, allowed);
  return item ? bump(taught, item.id, at) : taught;
}
const bump = (taught: Taught[], id: string, at: number) => taught.map(t => t.id === id ? { ...t, slips: (t.slips ?? 0) + 1, slipAt: Math.max(t.slipAt ?? 0, at) } : t);
/**
 * The record after a moment taught `m`: a new Taught item, or, when its guarded slip key is one the record already
 * holds, that item marked slipped again instead of a second item. `counted` names slip keys this turn already marked
 * (slipsAgain), so one reply never counts twice. The record is capped at `cap`, newest kept.
 */
export function keepMoment(taught: Taught[], m: Moment & { sceneId: string; title: string }, partner: readonly string[], cap: number, counted: readonly string[] = [], allowed?: (t: Taught) => boolean): Taught[] {
  const keys = keysOf(m);
  const item = keys && recordTier(keys, partner) ? itemOf(taught, keys.slip, allowed) : undefined;
  if (!item) return [...taught, m].slice(-cap);
  return counted.some(k => sameSlip(k, keys!.slip)) ? taught : bump(taught, item.id, m.at);
}
