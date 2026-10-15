/**
 * Self-repair (K2; the owner's ruling on LG-4, the withhold option): a fix moment asks the learner for the fix before
 * it shows it.
 *
 * Withholding. When a fix moment fires, the session's moment carries said and why, never better and never the fix key:
 * both wait here, in server memory, like help.ts's unrevealed rungs and check.ts's answer keys, until a try holds or
 * the learner asks to be shown. Its Taught item is written when the moment closes (conversation.ts), so the learner
 * record the phone lists cannot carry it either, and the moment joins the scene's moments (taughtThisScene, shownLines,
 * the recap) only then.
 *
 * The rungs, one per miss, no model call: 0 "You said … say it again"; 1 the why, as a clue; 2 the fix shown, then one
 * more try. A1-A2 learners start on the clue. Show me (moment-show) and Back (moment-done) are always offered.
 *
 * The judge (judgeTry), code only:
 * - A fix with a guarded slip key (slip.ts): not held while the slip key stands in the try (slipStands, so "Did he
 *   come" is no "he come"); held when the slip is gone and the fix key is said (findKey); otherwise undecided.
 * - A fix without a guarded key: take.ts heldOf, kind "word", over (said, better): not held while the learner's quoted
 *   words are still there, held when the whole better is said, otherwise undecided.
 * - After the fix was shown, a try that is no more than the fix key ("tomatoes are", read off the card) is not the
 *   learner's sentence: it is undecided, never held. The try must hold words beyond the fix key, or be the whole
 *   better (P26, P03: the parrot is closed).
 * Undecided and not held both move to the next rung; the picture never counts tries.
 *
 * Support. A moment models wording, so the reply after it is supported (as before). A try held before the fix was
 * shown is the learner's own repair: the next reply is as supported as the partner's line after the moment made it,
 * so it can earn own-words credit. A fix that had to be shown keeps the next reply supported. A try is never evidence.
 *
 * Fallbacks. A word moment (a missing English word) shows its better at once, as before. The "pauses" preference never
 * stops a scene, so it never meets a withheld fix. A fix whose words its own why, the partner's line or an observation
 * note already said is shown at once: there is nothing left to withhold. A restart loses server memory: a moment that comes back
 * withheld can no longer show or judge its fix; it keeps said and why, marks itself lost, and Back closes it with
 * nothing kept (the fix existed only here).
 *
 * The judge and the predicates are pure (the view, the turn table and the tests import them); the memory is the server's.
 */
import { findKey, guarded, slipStands } from "./slip";
import { heldOf } from "./take";
import type { Moment, MomentRepair } from "./types";

/** What a moment keeps off the session: its better and fix key, and the slip keys its turn already counted (review.ts keepMoment). */
export interface HeldFix { better: string; fix?: string; counted: string[] }
const REPAIR_CAP = 200;
// Server memory only: the session reaches every screen.
const g = globalThis as unknown as { __lingaRepair?: Map<string, HeldFix> };
const memory = () => g.__lingaRepair ??= new Map<string, HeldFix>();

/** The longest try kept on the moment and the Taught item. */
export const TRIED_MAX = 180;

/** Remember a moment's fix and its turn's counted slips, by moment id. Every moment is remembered; only a fix is withheld. */
export function remember(m: Moment, counted: readonly string[]): void {
  const map = memory();
  map.set(m.id, { better: m.better, ...(m.fix ? { fix: m.fix } : {}), counted: [...counted] });
  while (map.size > REPAIR_CAP) map.delete(map.keys().next().value!);
}
/** What server memory holds for a moment, or undefined (never remembered, or a restart lost it). */
export const heldFor = (id: string): HeldFix | undefined => memory().get(id);
export function forget(id: string): void { memory().delete(id); }

/** The moment as the session may carry it while its fix is withheld: no better, no fix key, and the repair at its first rung. */
export function withhold(m: Moment, rung: 0 | 1, support: boolean): Moment {
  const { fix: _fix, ...rest } = m;
  return { ...rest, better: "", repair: { rung, support } };
}
/** The moment with its fix back on it, from memory; null when a restart lost it. */
export function revealed(m: Moment): Moment | null {
  if (m.better) return m;
  const h = heldFor(m.id);
  return h ? { ...m, better: h.better, ...(h.fix ? { fix: h.fix } : {}) } : null;
}

/** Whether the session moment's fix is still withheld: a repair not held, below the reveal rung, and not lost. */
export const withheld = (m: Moment | null | undefined): boolean => !!m?.repair && !m.repair.held && m.repair.rung < 2 && !m.repair.lost;
/** Whether the moment takes a try now: a fix with a repair that is not spent (held, or the one try after the reveal) and not lost. */
export const tryOpen = (m: Moment | null | undefined): boolean => m?.kind === "fix" && !!m.repair && !m.repair.spent && !m.repair.lost;
/** Whether Show me reveals anything now: the fix is still withheld. */
export const showOpen = (m: Moment | null | undefined): boolean => m?.kind === "fix" && withheld(m);

const wordCount = (text: string) => (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;

/**
 * Whether `line`, a try on fix `m` (its better and fix key from memory), held: true, false (the slip is still there),
 * or null (code cannot tell, or a bare echo of the fix key after it was shown). `shown`: the fix was on screen before
 * this try. See the file comment for the rule.
 */
export function judgeTry(m: { said: string; better: string; slip?: string; fix?: string }, line: string, shown: boolean): boolean | null {
  const text = line.trim();
  if (!text) return null;
  if (m.slip && m.fix && guarded(m.slip)) {
    if (slipStands(text, m.slip) !== null) return false;
    if (findKey(text, m.fix) === null) return null;
    return shown && wordCount(text) <= wordCount(m.fix) ? null : true;
  }
  return heldOf({ turnId: "", quote: m.said, kind: "word", note: "", better: m.better }, text);
}

/** The learner's try as the moment and the Taught item keep it: the whole line when it fits, else its sentence with the fix key, else its start. */
export function triedLine(line: string, fix?: string): string {
  const said = line.trim();
  if (said.length <= TRIED_MAX) return said;
  const sentence = fix ? said.split(/(?<=[.!?])\s+/).find(x => findKey(x, fix) !== null) : undefined;
  return sentence && sentence.length <= TRIED_MAX ? sentence : said.slice(0, TRIED_MAX);
}

/**
 * The repair after a try judged `held`: held ends it (spent, and a self-repair when the fix was not yet shown); a miss
 * below the reveal climbs one rung, to the clue and then to the fix; a miss after the reveal spends it.
 */
export function afterTry(r: MomentRepair, tried: string, held: boolean): MomentRepair {
  if (held) return { ...r, tried, held: true, selfRepaired: r.rung < 2, spent: true };
  if (r.rung >= 2) return { ...r, tried, spent: true };
  return { ...r, tried, rung: r.rung === 0 ? 1 : 2 };
}
