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

/**
 * The schedule (K3): a taught item keeps coming back until it holds. Code decides it, on the item, with no model call.
 *
 * - A new item is due at once, in any later scene.
 * - Each unaided use (markReused) makes it due again REUSE_INTERVALS_MS after that use: 1, 3 and 7 days after the
 *   first, second and third. A use at the end of that ladder (the fourth) lets the item rest: it is not invited again
 *   unless its slip comes back. The reuse history (dates, conversation and scene ids, the learner's words) is kept so a
 *   later rule can decide when a phrase is the learner's own (L1).
 * - REVIEW_OFFERS invitations without a use snooze it for SNOOZE_MS, instead of retiring it for good; the count starts
 *   again after the snooze.
 * - A slipping item, one whose slip (slip.ts, record tier) was said again after its last use and its last invitation,
 *   comes first, whatever its schedule says.
 *
 * The intervals are a hypothesis (expanding retrieval after a correct use: Karpicke and Roediger 2007, Cepeda et al.
 * 2006), not a measured optimum for conversation; they are constants here so they can be changed in one place.
 */
export const DAY_MS = 86_400_000;
export const REUSE_INTERVALS_MS: readonly number[] = [1 * DAY_MS, 3 * DAY_MS, 7 * DAY_MS];
/** Invitations in a row without a use, before the item is snoozed. */
export const REVIEW_OFFERS = 2;
export const SNOOZE_MS = 7 * DAY_MS;
/** The reuse history kept on an item, newest last. Longer than the ladder, so a resting item stays resting. */
export const REUSES_MAX = 8;
/** The learner's words as the recap shows them: the whole reply when it fits, else the sentence that used it. */
export const USED_MAX = 180;

/** Whether the item has climbed the whole ladder: used once more after its last interval. */
export const rests = (t: Taught): boolean => (t.reuses?.length ?? 0) > REUSE_INTERVALS_MS.length;
/** When the item is due: its scheduled date, or the day it was taught; null while it rests. */
export function dueAt(t: Taught): number | null { return rests(t) ? null : t.nextDueAt ?? t.at; }
/** Whether the item's slip came back after its last use and its last invitation (K1 slips/slipAt). */
export const slipping = (t: Taught): boolean => t.slipAt !== undefined && t.slipAt > Math.max(t.reusedAt ?? 0, t.offeredAt ?? 0);
/**
 * The schedule of an item that has none yet, worked out from its older review fields: an item saved before K3 that
 * was used again is due one interval after that use; one invited REVIEW_OFFERS times without a use (retired, before)
 * is snoozed from its last invitation, or from the day it was taught when that date was never kept. The cleaner calls
 * it on every load; fields already present are kept.
 */
export function scheduled(t: Taught): Taught {
  const out = { ...t };
  if (!out.reuses && out.reusedAt !== undefined) out.reuses = [{ at: out.reusedAt, conversationId: out.reusedIn ?? "", quote: out.reusedQuote ?? "" }];
  if (out.misses === undefined && out.offered !== undefined) out.misses = out.reusedAt === undefined ? out.offered : 0;
  if (out.nextDueAt === undefined) {
    const n = out.reuses?.length ?? 0, last = out.reuses?.at(-1);
    if (last && n <= REUSE_INTERVALS_MS.length) out.nextDueAt = last.at + REUSE_INTERVALS_MS[n - 1];
    else if (!last && (out.misses ?? 0) >= REVIEW_OFFERS) { out.nextDueAt = (out.offeredAt ?? out.at) + SNOOZE_MS; out.misses = 0; }
  }
  return out;
}

/**
 * The one taught item the scene `episodeId` starts brings back, at `now`: from an earlier rehearsal, a slipping item
 * first (the latest slip first), else the oldest item that is due. Null when none is. `allowed`
 * (curriculum.taughtAllowed) drops items this learner may not be shown now, such as a phrase taught in an
 * adult-audience scene after a switch to Family.
 */
export function dueTaught(taught: Taught[], episodeId: string, allowed?: (t: Taught) => boolean, now = Date.now()): Taught | null {
  const pool = taught.filter(t => (!allowed || allowed(t)) && !t.turnId.startsWith(`${episodeId}:`));
  const slip = pool.filter(slipping).sort((a, b) => b.slipAt! - a.slipAt!)[0];
  if (slip) return slip;
  return pool.filter(t => { const d = dueAt(t); return d !== null && d <= now; }).sort((a, b) => a.at - b.at)[0] ?? null;
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

/**
 * The record after a scene invited the item at `at`. The REVIEW_OFFERS-th invitation in a row without a use snoozes it
 * for SNOOZE_MS; a use in that same scene (markReused) replaces the snooze with its own schedule.
 */
export function offer(taught: Taught[], id: string, at = Date.now()): Taught[] {
  return taught.map(t => {
    if (t.id !== id) return t;
    const misses = (t.misses ?? 0) + 1, snooze = misses >= REVIEW_OFFERS;
    return { ...t, offered: (t.offered ?? 0) + 1, offeredAt: at, misses: snooze ? 0 : misses, ...(snooze ? { nextDueAt: at + SNOOZE_MS } : {}) };
  });
}
/**
 * The record after the learner used the item unaided in conversation `conversationId` (scene `sceneId`) at `at`.
 * reusedAt, reusedIn and reusedQuote are the latest use (the Sunday page reads them); the use joins the history, and
 * the item is due again one interval later, or rests at the end of the ladder.
 */
export function markReused(taught: Taught[], id: string, conversationId: string, quote: string, at: number, sceneId?: string): Taught[] {
  return taught.map(t => {
    if (t.id !== id) return t;
    const reuses = [...(t.reuses ?? []), { at, conversationId, quote, ...(sceneId ? { sceneId } : {}) }];
    const { nextDueAt: _, ...rest } = t, n = reuses.length;
    return { ...rest, reusedAt: at, reusedIn: conversationId, reusedQuote: quote, reuses: reuses.slice(-REUSES_MAX), misses: 0, ...(n <= REUSE_INTERVALS_MS.length ? { nextDueAt: at + REUSE_INTERVALS_MS[n - 1] } : {}) };
  });
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
