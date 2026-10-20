/**
 * The rescue ladder: help that answers the question on screen.
 *
 * Every partner line comes with its own ladder, written in the same model call as the line: said more simply,
 * what it means, a way to start. At A1-A2 the first rung is words to say back instead (LG-5 recert-9): the band hold
 * already keeps the partner's line short, so "said more simply" only handed the line back. Code decides the rest. It
 * drops a rung that does not do its job, reveals the rungs one at a time and in order, and decides that any rung
 * revealed for the line on screen makes the next reply supported: certification credits only fully unaided replies
 * (the delegate's ruling (a) on lt-swap-2/recert-1).
 *
 * Withholding: a rung may say the question again or explain a word, and the starter opens a reply without finishing
 * it. The say-back rung is one possible reply, which is why any rung makes the next reply supported. The words of an
 * unrevealed rung never reach the session, which every screen reads; they stay here, in server memory, like check.ts's
 * answer keys. A ladder lost to a restart gives way to the scene's own cue, as before the ladder.
 */
import { fitsBand, pastQuestion } from "./gate";
import { FUNCTION_WORDS } from "./slip";
import type { Band, ConversationHelp, HelpRung, LineQuiz } from "./types";

/** Any revealed rung is help: a reply after the simpler line, the meaning or the starter is supported practice. */
export const SUPPORTING_RUNG: HelpRung = 1;
export const SIMPLER_MAX = 160, MEANING_MAX = 160, STARTER_MAX = 80, STARTER_WORDS = 8, SAY_MAX = 80, QUIZ_MAX = 80;
const LADDER_CAP = 200;

/** The two phrases of a line's own quiz (LG-5 recert-9): `fits` answers the partner's line, `misfit` does not. */
export interface QuizWords { fits: string; misfit: string; task?: string }
/** `say`: rung 1 is words to say back (sayBack), not the line said more simply; `quiz`: the line's own phrase quiz. */
type Ladder = Partial<Record<HelpRung, string>> & { say?: true; quiz?: QuizWords; task?: string };
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
 * meaning rung must name a word that is still in it; `earlier`, the partner lines before it, none of which a say-back may answer.
 */
export interface LadderHold { band?: Band; held?: boolean; earlier?: readonly string[] }
/** A meaning rung names its word first ("see: look with your eyes"); that word must be in the line (`same`, its words). */
const namesLineWord = (meaning: string, same: string) => !meaning.includes(":") || words(meaning.slice(0, meaning.indexOf(":"))).split(" ").every(w => ` ${same} `.includes(` ${w} `));
/** The bands whose first rung is words to say back (LG-5 recert-9). */
const SAYS_BACK: readonly Band[] = ["A1", "A2"];
const sentencesOf = (text: string) => text.trim().split(/(?<=[.!?])\s+/).map(x => words(x)).filter(Boolean);
/**
 * Words the learner could say back to the partner's line (LG-5 recert-9, LT-viktor-67-J4-3, LT-tomas-9-J4-3): "Said more
 * simply: Hi Grandpa! I am home now." gave Viktor Mia's line, not his. A say-back rung is held to the band, has no
 * past-tense question at either band, says none of the line's sentences again, and answers a question line with at least
 * one sentence that is not a question ("Hi Mia! Is school good?" for "Hi Grandpa! I am home now."). Else "".
 */
export function sayBackFor(raw: string, partnerLine: string, band: Band | undefined, earlier: readonly string[] = []): string {
  const say = raw.replace(/\s+/g, " ").trim();
  if (!say || say.length > SAY_MAX || !inBand(say, band)) return "";
  const parts = say.split(/(?<=[.!?])\s+/), theirs = new Set(sentencesOf(partnerLine));
  if (parts.some(pastQuestion) || sentencesOf(say).some(x => theirs.has(x)) || words(say) === words(partnerLine)) return "";
  if (answersEarlier(say, partnerLine, earlier)) return "";
  return partnerLine.trim().endsWith("?") && parts.every(x => x.trim().endsWith("?")) ? "" : say;
}
/** Words a say-back shares with any line whatever it answers: grammar words, greetings and small reactions. */
const SAY_LIGHT = new Set([...FUNCTION_WORDS, "hi", "hello", "hey", "bye", "goodbye", "good", "nice", "great", "cool", "fine", "thanks", "thank", "sorry", "wow"]);
const contentOf = (text: string) => new Set(words(text).split(" ").filter(w => w && !SAY_LIGHT.has(w)));
/**
 * Whether a say-back answers an earlier partner line instead of the one on screen (LG-5 recert-10, LT-viktor-67-J4-2): on
 * Lena's "Hi Grandpa! I am happy too." the rung was "Hi Lena! Yes, I see you.", a reply to her first line, "Can you see
 * me?". It shares no content word with the line on screen and does share one that only an earlier line said.
 */
export function answersEarlier(say: string, partnerLine: string, earlier: readonly string[]): boolean {
  const mine = contentOf(say), now = contentOf(partnerLine);
  if ([...mine].some(w => now.has(w))) return false;
  return earlier.some(line => [...contentOf(line)].some(w => !now.has(w) && mine.has(w)));
}
/**
 * The line's own phrase quiz (LG-5 recert-9, LT-viktor-67-J4-1, LT-tomas-9-J4-2, LT-petra-38-J4-2): the scene's static quiz
 * quoted a line Mia never said and asked about another line than Sam's. The turn's one help output gives two short phrases
 * for the line on screen: fits, a reply that answers it, and misfit, one that does not. Each is held to the band, with no
 * past-tense question at A1-A2, and says none of the line's sentences again; the two differ. Else null: the line has no quiz.
 */
export function quizWordsFor(o: Record<string, unknown>, partnerLine: string, band: Band | undefined): QuizWords | null {
  const theirs = new Set(sentencesOf(partnerLine)), beginner = !!band && SAYS_BACK.includes(band);
  const ok = (x: string) => !!x && x.length <= QUIZ_MAX && inBand(x, band) && !(beginner && x.split(/(?<=[.!?])\s+/).some(pastQuestion)) && !sentencesOf(x).some(y => theirs.has(y));
  const fits = plain(o, "fits"), misfit = plain(o, "misfit");
  // a question line is answered: fits is not only a question
  const answers = !partnerLine.trim().endsWith("?") || fits.split(/(?<=[.!?])\s+/).some(x => !x.trim().endsWith("?"));
  return ok(fits) && ok(misfit) && answers && words(fits) !== words(misfit) ? { fits, misfit } : null;
}
/**
 * The scene's task as a reply (rework 7, recert-12 LT-viktor-67-J4-1): when the partner's line pulls away from the task
 * ("Show me your drawing" while the task is to ask about school), the help output carries `task`, one short reply that does
 * the task. Held like a say-back: the band, no past-tense question at A1-A2, none of the line's sentences. Else "".
 */
export function taskPhraseFor(raw: string, partnerLine: string, band: Band | undefined): string {
  const t = raw.replace(/\s+/g, " ").trim(), theirs = new Set(sentencesOf(partnerLine));
  if (!t || t.length > SAY_MAX || !band || !SAYS_BACK.includes(band) || !inBand(t, band)) return "";
  return t.split(/(?<=[.!?])\s+/).some(pastQuestion) || sentencesOf(t).some(x => theirs.has(x)) ? "" : t;
}
/** The rungs of a model's ladder that do their job, for this partner line. Anything else is dropped, never the line. */
export function validLadder(raw: unknown, partnerLine: string, hold: LadderHold = {}): Ladder {
  const o = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const line = partnerLine.trim(), same = words(line), out: Ladder = {};
  const fits = (s: string) => s && inBand(s, hold.band) ? s : "";
  const says = !!hold.band && SAYS_BACK.includes(hold.band);
  // at A1-A2 the line said more simply is never a rung (it gave the partner's line back): the say-back takes its place
  const simpler = says ? "" : fits(plain(o, "simpler")), starter = fits(unfinished(plain(o, "starter")));
  const named = fits(plain(o, "meaning")), meaning = !hold.held || namesLineWord(named, same) ? named : "";
  const task = taskPhraseFor(plain(o, "task"), line, hold.band);
  // a line that pulls away from the task: rung 1 is the task phrase, which the say-back would otherwise take (rework 7)
  const say = task ? task : says ? sayBackFor(plain(o, "sayBack"), line, hold.band, hold.earlier) : "";
  if (say) { out[1] = say; out.say = true; }
  if (task) out.task = task;
  const quiz = quizWordsFor(o, line, hold.band);
  if (quiz) out.quiz = task && words(quiz.fits) !== words(task) ? { ...quiz, task } : quiz;
  // Said more simply: shorter than the line and not the line again; a question stays a question.
  if (simpler && simpler.length <= SIMPLER_MAX && simpler.length < line.length && words(simpler) !== same && (!line.includes("?") || simpler.endsWith("?"))) out[1] = simpler;
  if (meaning && meaning.length <= MEANING_MAX && words(meaning) !== same && words(meaning) !== words(simpler) && words(meaning) !== words(say)) out[2] = meaning;
  if (starter && words(starter) !== same && words(starter) !== words(say)) out[3] = starter;
  return out;
}

/**
 * Keep a partner line's ladder, and forget the line before it. What the session may know of it, or null for none. A line
 * with a quiz and no rung keeps an empty ladder, so "Choose a phrase" still has the line's own quiz.
 */
export function keepLadder(turnId: string, ladder: Ladder, previous?: string | null): ConversationHelp | null {
  if (previous) ladders.delete(previous);
  const rungs = ([1, 2, 3] as const).filter(r => ladder[r]);
  if (!rungs.length && !ladder.quiz) return null;
  ladders.set(turnId, ladder);
  while (ladders.size > LADDER_CAP) ladders.delete(ladders.keys().next().value!);
  return { forTurn: turnId, rungs, rung: 0, shown: false, ...(ladder.say && ladder[1] ? { say: true } : {}), ...(ladder.quiz ? { quiz: true } : {}) };
}

/** The partner's name on a quiz header: the part of "Mia · Granddaughter" before the dot. */
const nameOf = (partner: string) => partner.split(" · ")[0].trim() || "Your partner";
/**
 * The phrase quiz for the line on screen, or null when that line has none (none came with it, or a restart lost it). Its
 * header quotes the line word for word ("Mia says: Hi Grandpa! I am home now."); which option fits is set by the line's
 * turn id, so it is not always the first. Never the scene's static quiz: a line with no quiz of its own has no quiz.
 */
export function quizFor(help: ConversationHelp | null | undefined, last: { id: string; role: string; text: string } | undefined, partner: string, band?: Band, sceneCue = ""): LineQuiz | null {
  if (!help?.quiz || !last || last.role !== "partner" || help.forTurn !== last.id) return null;
  const q = ladders.get(last.id)?.quiz;
  if (!q) return null;
  const correct = [...last.id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 2;
  const question = `${nameOf(partner)} ${last.text.trim().endsWith("?") ? "asks" : "says"}: ${last.text}`;
  if (help.quizSeen?.length && band && SAYS_BACK.includes(band)) {
    // rework 8 (recert-13, LT-viktor-67-J4-1, LT-tomas-9-J4-2): a later press of Choose a phrase on the same line never shows
    // a phrase it showed; it offers one not yet offered (the task phrase, the scene's own), else null: type your own reply
    const shown = new Set(help.quizSeen.map(words)), own = sceneTaskFor(sceneCue, band, last.text);
    const fresh = [q.task, own].find(x => !!x && !shown.has(words(x)));
    if (!fresh) return null;
    return { forTurn: last.id, question, options: correct === 0 ? [fresh, q.misfit] : [q.misfit, fresh], correct };
  }
  // a line that pulls away from the task: the other option is the task phrase, not a misfit (rework 7)
  const other = q.task ?? q.misfit;
  const options: [string, string] = correct === 0 ? [q.fits, other] : [other, q.fits];
  return { forTurn: last.id, question, options, correct };
}

/**
 * The scene's own cue as a phrase a learner may send (rework 8): "Try: Hi Sam! How is school?" is the phrase when it fits the
 * band, is not an unfinished starter and does not repeat the partner's line. Else "".
 */
export function sceneTaskFor(cue: string, band: Band | undefined, partnerLine: string): string {
  const t = cue.replace(/^Try(?: [a-z]+)?:\s*/, "").replace(/\s+/g, " ").trim();
  if (!t || /(\.\.\.|…)$/.test(t) || t.length > QUIZ_MAX || !band || !SAYS_BACK.includes(band) || !inBand(t, band)) return "";
  const theirs = new Set(sentencesOf(partnerLine));
  return sentencesOf(t).some(x => theirs.has(x)) ? "" : t;
}

/** Whether an option of the line's quiz is its task phrase: on-task, so a pick of it is never "does not answer" (rework 7). */
export function isTaskOption(turnId: string, option: string): boolean {
  const t = ladders.get(turnId)?.quiz?.task;
  return !!t && words(t) === words(option);
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
