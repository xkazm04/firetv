/**
 * The rescue ladder: help that answers the question on screen.
 *
 * Every partner line comes with its own ladder, written in the same model call as the line: said more simply,
 * what it means, a way to start. Code decides the rest. It drops a rung that does not do its job, reveals the
 * rungs one at a time and in order, and decides that any rung revealed for the line on screen makes the next reply
 * supported: certification credits only fully unaided replies (the delegate's ruling (a) on lt-swap-2/recert-1).
 *
 * Withholding: a rung may say the question again or explain a word, and the starter opens a reply without finishing
 * it. None of them is the learner's answer. The words of an unrevealed rung never reach the session, which every
 * screen reads; they stay here, in server memory, like check.ts's answer keys. A ladder lost to a restart gives
 * way to the scene's own cue, as before the ladder.
 */
import { fitsBand } from "./gate";
import type { Band, ConversationHelp, HelpRung } from "./types";

/** Any revealed rung is help: a reply after the simpler line, the meaning or the starter is supported practice. */
export const SUPPORTING_RUNG: HelpRung = 1;
export const SIMPLER_MAX = 160, MEANING_MAX = 160, STARTER_MAX = 80, STARTER_WORDS = 8;
const LADDER_CAP = 200;

type Ladder = Partial<Record<HelpRung, string>>;
// Server memory only: the session reaches every screen.
const g = globalThis as unknown as { __lingaHelp?: Map<string, Ladder> };
const ladders = g.__lingaHelp ??= new Map<string, Ladder>();

const words = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const plain = (o: Record<string, unknown>, key: string) => typeof o[key] === "string" ? (o[key] as string).replace(/\s+/g, " ").trim() : "";

/** A starter opens a reply and stops: short, ending in an ellipsis, never a finished sentence. */
function unfinished(s: string): string {
  const body = s.replace(/(\.\.\.|…)$/, "").trimEnd();
  if (!body || /[.!?]$/.test(body) || body.length > STARTER_MAX || body.split(" ").length > STARTER_WORDS) return "";
  return body === s ? `${body} …` : s;
}

/** A rung or cue as a learner at `band` may read it (gate.ts fitsBand): a starter without its ellipsis, a cue without its "Try:". */
const inBand = (text: string, band?: Band) => fitsBand(text.replace(/^Try(?: [a-z]+)?:\s*/, "").replace(/\s*(\.\.\.|…)$/, ""), band);
/**
 * How a ladder is held (LG-5 recert-8): `band`, the band the partner line was held to, which every rung must fit too (no
 * past-tense question at A1, at most 8 words); `held`, the line on screen is the band hold's cut of the model's line, so a
 * meaning rung must name a word that is still in it.
 */
export interface LadderHold { band?: Band; held?: boolean }
/** A meaning rung names its word first ("see: look with your eyes"); that word must be in the line (`same`, its words). */
const namesLineWord = (meaning: string, same: string) => !meaning.includes(":") || words(meaning.slice(0, meaning.indexOf(":"))).split(" ").every(w => ` ${same} `.includes(` ${w} `));
/** The rungs of a model's ladder that do their job, for this partner line. Anything else is dropped, never the line. */
export function validLadder(raw: unknown, partnerLine: string, hold: LadderHold = {}): Ladder {
  const o = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const line = partnerLine.trim(), same = words(line), out: Ladder = {};
  const fits = (s: string) => s && inBand(s, hold.band) ? s : "";
  const simpler = fits(plain(o, "simpler")), starter = fits(unfinished(plain(o, "starter")));
  const named = fits(plain(o, "meaning")), meaning = !hold.held || namesLineWord(named, same) ? named : "";
  // Said more simply: shorter than the line and not the line again; a question stays a question.
  if (simpler && simpler.length <= SIMPLER_MAX && simpler.length < line.length && words(simpler) !== same && (!line.includes("?") || simpler.endsWith("?"))) out[1] = simpler;
  if (meaning && meaning.length <= MEANING_MAX && words(meaning) !== same && words(meaning) !== words(simpler)) out[2] = meaning;
  if (starter && words(starter) !== same) out[3] = starter;
  return out;
}

/** Keep a partner line's ladder, and forget the line before it. What the session may know of it, or null for none. */
export function keepLadder(turnId: string, ladder: Ladder, previous?: string | null): ConversationHelp | null {
  if (previous) ladders.delete(previous);
  const rungs = ([1, 2, 3] as const).filter(r => ladder[r]);
  if (!rungs.length) return null;
  ladders.set(turnId, ladder);
  while (ladders.size > LADDER_CAP) ladders.delete(ladders.keys().next().value!);
  return { forTurn: turnId, rungs, rung: 0, shown: false };
}

/**
 * The next rung for the line on screen: its words, and the help as the session keeps it. At the top of the ladder
 * the last rung stays. Null when there is no ladder for this line (none came with it, or a restart lost it): the
 * caller falls back to the scene's cue.
 */
export function climb(help: ConversationHelp | null | undefined, lastTurnId: string | undefined): { cue: string; help: ConversationHelp } | null {
  if (!help || !lastTurnId || help.forTurn !== lastTurnId) return null;
  const ladder = ladders.get(help.forTurn), next = help.rungs.find(r => r > help.rung) ?? help.rung;
  const cue = next ? ladder?.[next] : undefined;
  return cue ? { cue, help: { ...help, rung: next, shown: true } } : null;
}

/**
 * The scene's cue for a line with no ladder (none came, or a restart lost it), or null (LG-5 recert-8, LT-viktor-67-J4-1:
 * "Try: What did you do at school today?" four times, at A1, after Mia had moved on). It is offered once a scene: shown
 * once (`spent`), by help or under the quiz, it no longer answers the line on screen, and it is never offered again
 * word for word. It is held to the band like a rung. Null: the help gives the quiz, the recognition fallback.
 */
export function sceneCueFor(cue: string, band: Band | undefined, spent: boolean | undefined): string | null {
  return !spent && cue.trim() && inBand(cue, band) ? cue : null;
}

/** Whether a reply after this much help is supported practice. */
export const supportedBy = (help: ConversationHelp | null | undefined) => !!help && help.rung >= SUPPORTING_RUNG;
