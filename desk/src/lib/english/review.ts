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
import { findKey, guarded, keysOf, KNOWN_SLIP_FIXES, recordTier, sameSlip, slipIn, slipStands, type SlipKeys } from "./slip";
import type { Conversation, Moment, Reuse, Review, Taught, Yours } from "./types";

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
  return { id: t.id, kind: t.kind, better: t.better, fromTitle: t.title, ...(keys && guarded(keys.slip) ? keys : {}), ...(t.key && !keys ? { key: t.key } : {}) };
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
/**
 * Everything this scene has already put in front of the learner: the partner's lines, the cue, its moments, the coach.
 * A fix the learner repaired before it was shown (K2, repair.ts) was never in front of them: the TV showed their own line.
 */
/** What `role` said in earlier turns of this scene: their own words, which a later reply may repeat without reading anything back (credit.ts copiesShown). */
export const ownLines = (c: Conversation, role: "learner" | "costar" = "learner"): string[] => c.turns.filter(t => t.role === role).map(t => t.text);
export const shownLines = (c: Conversation): string[] => [...c.turns.filter(t => t.role === "partner").map(t => t.text), c.cue, ...(c.moments ?? []).map(m => m.repair?.selfRepaired ? "" : m.better), c.coaching?.after ?? ""];
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
  // a line handed over or found in an earlier room (K4, line.ts) is judged by its key words
  if (r.key) return alreadyShown(c, r.key) ? null : findKey(reply, r.key);
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
 * "Yours" (L1): a taught item the learner has shown they own. Code decides it from the reuse history, with no model
 * call: two unaided uses (exactly the uses reuseOf counts: never a supported reply, never a phrase the scene already
 * showed, never a copy of the partner's words) in two DIFFERENT scenes on two DIFFERENT local days. Two uses in one
 * scene, or on one day, are not enough, however many there are: the latch rewards a phrase that came back days apart in a
 * new situation, never raw volume (owner ruling X1). Once set it never unsets; a slip after it (K1 slips/slipAt) makes
 * the item slipping, so the schedule (dueTaught) brings it back first, and it stays yours.
 */
/** The longest quote the latch accepts, as the reuse history keeps it (placement.ts cleanTaught). */
export const YOURS_QUOTE_MAX = 240;
/** The local day of a date, as the desk's other day rules key it (rules/week.ts, session/learners.ts). */
export const localDay = (at: number) => { const d = new Date(at); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
/**
 * A quote that may stand for the learner's words, in the style of cert.ts quoteOk: a trimmed, non-empty line of at most
 * YOURS_QUOTE_MAX characters with a letter and no control character; and, when the replies it may have come from are at
 * hand (`replies`), a substring of one of them exactly as sent. A reply no longer kept cannot be held to it twice.
 */
export function quoteHolds(quote: string, replies?: readonly string[]): boolean {
  if (typeof quote !== "string" || !quote.trim() || quote.length > YOURS_QUOTE_MAX || !/\p{L}/u.test(quote) || /[\u0000-\u001f\u007f]/.test(quote)) return false;
  return !replies || replies.some(r => r.includes(quote));
}
/** Whether `quote` says the item, judged as reuseOf judges a reply: a guarded fix by its fix key, a line by its key, else the whole phrase. */
export function saysItem(t: Taught, quote: string): boolean {
  const r = reviewOf(t);
  if (r.kind === "fix" && r.slip && r.fix && guarded(r.slip)) return findKey(quote, r.fix) !== null;
  if (r.key) return findKey(quote, r.key) !== null;
  return findPhrase(quote, r.better) !== null;
}
/** A use that may count toward "yours": it names its scene (a use kept before K3 does not), and its quote holds and says the item. */
const countsToward = (t: Taught, r: Reuse) => !!r.sceneId && quoteHolds(r.quote) && saysItem(t, r.quote);
const apart = (a: Reuse, b: Reuse) => a.sceneId !== b.sceneId && localDay(a.at) !== localDay(b.at);
/**
 * The latch an item's history earns, or null: the first use that comes in a different scene AND on a different local
 * day from an earlier counting use, with the earliest such earlier use. Pure; the same history gives the same latch.
 */
export function yoursOf(t: Taught): Yours | null {
  const uses = (t.reuses ?? []).filter(r => countsToward(t, r)).sort((a, b) => a.at - b.at);
  for (let j = 1; j < uses.length; j++) {
    const first = uses.slice(0, j).find(u => apart(u, uses[j]));
    if (first) return { at: uses[j].at, uses: [first, uses[j]] };
  }
  return null;
}
/** Whether a latch, as stored, is one code could have set: two counting uses of this item, apart, dated in order, earned at the second. */
export function yoursHolds(t: Taught, y: Yours): boolean {
  const [a, b] = y.uses;
  return countsToward(t, a) && countsToward(t, b) && apart(a, b) && a.at < b.at && y.at === b.at;
}
/** The item with its latch: one already set is kept (it never unsets), else it is worked out from the history. */
export function latched(t: Taught): Taught {
  if (t.yours) return t;
  const y = yoursOf(t);
  return y ? { ...t, yours: y } : t;
}
/** Whether an item is the learner's own (L1). */
export const isYours = (t: Taught): boolean => !!t.yours;

/**
 * The record after the learner used the item unaided in conversation `conversationId` (scene `sceneId`) at `at`.
 * reusedAt, reusedIn and reusedQuote are the latest use (the Sunday page reads them); the use joins the history, and
 * the item is due again one interval later, or rests at the end of the ladder. The use that makes it the learner's
 * own (yoursOf) sets the latch.
 */
export function markReused(taught: Taught[], id: string, conversationId: string, quote: string, at: number, sceneId?: string): Taught[] {
  return taught.map(t => {
    if (t.id !== id) return t;
    const reuses = [...(t.reuses ?? []), { at, conversationId, quote, ...(sceneId ? { sceneId } : {}) }];
    const { nextDueAt: _, ...rest } = t, n = reuses.length;
    return latched({ ...rest, reusedAt: at, reusedIn: conversationId, reusedQuote: quote, reuses: reuses.slice(-REUSES_MAX), misses: 0, ...(n <= REUSE_INTERVALS_MS.length ? { nextDueAt: at + REUSE_INTERVALS_MS[n - 1] } : {}) });
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
/**
 * LG-57: a fossilised error, the one slip in `reply` the turn stops for (council-lite r2 value-2; LT-martin-45-J3-1,
 * LT-adela-17-J3-1). A slip the learner already made and Linga already taught (`again`, slipsAgain: this scene's moments
 * and the taught fixes of earlier sessions) when it may write to the record; else a KNOWN_SLIPS pair (slip.ts) said in
 * `reply` and in an earlier learner line of this scene, never words the partner said. Code, before the call; null when
 * neither holds. A one-off slip is never a fossil: the model still judges it, as before.
 */
export function fossilOf(reply: string, c: Conversation, again: readonly SlipAgain[]): SlipAgain | null {
  const taught = again.find(h => h.record);
  if (taught) return taught;
  const partner = partnerLines(c), before = c.turns.filter(t => t.role === "learner").map(t => t.text);
  for (const [slip, fix] of Object.entries(KNOWN_SLIP_FIXES)) {
    const keys = { slip, fix }, said = slipIn(reply, keys);
    if (said !== null && recordTier(keys, partner) && before.some(t => slipIn(t, keys) !== null)) return { said, better: fix, keys, record: true };
  }
  return null;
}
/** The moment code makes for a fossil (LG-57): the learner's exact words, the right form in their case, and a reason in code's own words. */
export function fossilMoment(h: SlipAgain, turnId: string, at = Date.now()): Moment {
  const better = /^\p{Lu}/u.test(h.said) ? h.better.charAt(0).toUpperCase() + h.better.slice(1) : h.better;
  return { id: `${turnId}:moment`, kind: "fix", said: h.said, better, why: FOSSIL_WHY, turnId, at, slip: h.keys.slip, fix: h.keys.fix };
}
/** Why a fossil moment stops the scene: never its corrected words, so the fix can wait for the learner's try (repair.ts). */
export const FOSSIL_WHY = "You said this before too, so let's get it right now.";
/** What the partner is told when code stops the scene for a fossil after its reply: leave the fix to the moment. */
export const FOSSIL_TASK = "The learner just said again an error they made before: said is their words, better is the right form. Linga stops the scene for it after your reply. Do not use the right form or its corrected words in your reply, do not correct them yourself, and return moment kind none.";

/** A direct question whether the learner's own line was right ("Is my sentence correct?", "Did I say it well?"). Pure; English only. */
export const CORRECTNESS_ASKED: readonly RegExp[] = [
  /\b(?:is|was)\s+(?:my|that|this|it|the)\b[^.?!]{0,40}\b(?:correct|right|ok|okay|wrong)\b/i,
  /\bdid\s+i\s+(?:say|put|write)\b[^.?!]{0,40}\b(?:well|right|correctly|correct)\b/i,
  /\bam\s+i\s+(?:saying|using)\b[^.?!]{0,40}\b(?:right|correctly|correct)\b/i,
];
export const asksCorrectness = (reply: string): boolean => CORRECTNESS_ASKED.some(re => re.test(reply));
/** What a correctness question is about: the learner's previous own line and the taught slips it holds (empty when clean). */
export interface AskedAbout { line: string; slips: { said: string; better: string }[] }
/**
 * The line a correctness question is about, in the order learners mean it: a span quoted inside the question sentence,
 * else the rest of `reply` once the question sentence is cut out (the question is attached to the line before it), else
 * null (the question stands alone, so it is about the previous learner turn).
 */
function lineAsked(reply: string): string | null {
  const parts = reply.match(/[^.?!]*[.?!]*/g)?.filter(p => p.trim()) ?? [];
  const asks = parts.filter(p => asksCorrectness(p));
  for (const q of asks) {
    const quoted = q.match(/["“]([^"”]+)["”]/)?.[1].trim();
    if (quoted) return quoted;
  }
  const rest = parts.filter(p => !asks.includes(p)).join(" ").trim();
  return /[a-z]/i.test(rest) ? rest : null;
}
/**
 * Set only when `reply` asks a direct correctness question and there is a line to judge: the line the reply quotes in the
 * question, else the rest of the reply, else the learner's previous own line. The slips are found by slipsAgain over that
 * line (this scene's moments, then the taught fixes the learner may be shown), by code, before the call.
 */
export function askedAboutFor(reply: string, c: Conversation, taught: readonly Taught[]): AskedAbout | undefined {
  if (!asksCorrectness(reply)) return undefined;
  const line = lineAsked(reply) ?? [...c.turns].reverse().find(t => t.role === "learner")?.text;
  if (!line) return undefined;
  return { line, slips: slipsAgain(line, c, taught).map(h => ({ said: h.said, better: h.better })) };
}
/** What the partner is told when a taught slip comes back and no moment is allowed (the moment gap or cap, LG-57; K1 amended 17 Oct 2026): model the right form once and do not stop the scene. When a moment is allowed, code makes it instead (FOSSIL_TASK). */
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
