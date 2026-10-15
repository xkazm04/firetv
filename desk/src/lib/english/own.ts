/**
 * Phrases you own (L1): the taught items the learner has latched "yours" (review.ts yoursOf), as the surfaces read them
 * - the Family TV home's strip, the recap's "Yours now", the print page and Adult mode's progress list.
 *
 * Every word here is either the taught phrase (`better`) or the learner's own words from the two uses that earned the
 * latch, each a quote checked in code (review.ts quoteHolds, the cert.ts style): a line that holds, and an exact
 * substring of the reply it came from whenever that reply is at hand. An item whose quotes do not hold is left out,
 * never shown with a claim code cannot back. An item from an adult-audience scene is shown only where adult content is
 * on (`allowed`, curriculum.taughtAllowed).
 *
 * Pure data, no filesystem: the TV, the print page and the tests all import it.
 */
import { AUTHORED_SCENES, planScenes } from "./curriculum";
import { pitchScenes } from "./pitch";
import { quoteHolds } from "./review";
import type { EnglishLearning, Reuse, Taught } from "./types";

/** The most phrases the TV home's strip draws: the newest, oldest of them on the left. Never a count. */
export const STRIP_MAX = 4;
/** One unaided use as a surface shows it: the learner's words and the scene they were said in. */
export interface OwnedUse { quote: string; scene: string; conversationId: string; at: number }
/** A phrase the learner owns: the taught phrase, the scene that taught it, and the two uses that made it theirs. */
export interface OwnedPhrase { id: string; kind: Taught["kind"]; better: string; taughtIn: string; at: number; uses: [OwnedUse, OwnedUse] }

/**
 * The name of the scene a use was said in: the rehearsal's own title as the record kept it (sessions, by conversation),
 * else the scene's name by id, else "an earlier scene".
 */
export function sceneName(l: Pick<EnglishLearning, "sessions" | "plan" | "pitches">, use: Pick<Reuse, "conversationId" | "sceneId">): string {
  const kept = l.sessions?.find(x => x.id === use.conversationId)?.title;
  if (kept) return kept;
  const scene = [...planScenes(l as EnglishLearning), ...pitchScenes(l as EnglishLearning), ...AUTHORED_SCENES].find(x => x.id === use.sceneId);
  return scene?.name ?? "an earlier scene";
}

/**
 * The learner's owned phrases, oldest latch first: items latched "yours" that `allowed` lets this learner see now, whose
 * two quotes hold (quoteHolds). `replies` are the learner's replies still at hand, by conversation id (the conversation
 * on the session): a quote from one of those must be an exact substring of one of its replies.
 */
export function ownedPhrases(l: Pick<EnglishLearning, "taught" | "sessions" | "plan" | "pitches">, allowed: (t: Taught) => boolean, replies: Record<string, readonly string[]> = {}): OwnedPhrase[] {
  return (l.taught ?? []).filter(t => t.yours && allowed(t))
    .filter(t => t.yours!.uses.every(u => quoteHolds(u.quote, replies[u.conversationId])))
    .sort((a, b) => a.yours!.at - b.yours!.at)
    .map(t => ({
      id: t.id, kind: t.kind, better: t.better, taughtIn: t.title, at: t.yours!.at,
      uses: t.yours!.uses.map(u => ({ quote: u.quote, scene: sceneName(l, u), conversationId: u.conversationId, at: u.at })) as [OwnedUse, OwnedUse],
    }));
}

/**
 * Tonight's words on the recap: the learner's line that used the phrase (Review.used) when it holds against their replies
 * and holds the latched quote, else the latched quote itself.
 */
export function quoteOf(line: string, quote: string, replies?: readonly string[]): string {
  return line.includes(quote) && quoteHolds(line, replies) ? line : quote;
}

/** The learner's replies in a conversation, by its id, for the quote check: what is still at hand. */
export function repliesOf(c: { id: string; turns: Array<{ role: string; text: string }> } | null | undefined): Record<string, string[]> {
  return c ? { [c.id]: c.turns.filter(t => t.role === "learner").map(t => t.text) } : {};
}

/**
 * The strip on the TV home: the newest STRIP_MAX owned phrases, oldest of them on the left. A phrase holding a digit is
 * passed over: on the TV a verdict is a picture, never a figure.
 */
export function stripOf(owned: readonly OwnedPhrase[]): string[] {
  return owned.map(o => o.better.replace(/\s+/g, " ").trim()).filter(x => x && !/\d/.test(x)).slice(-STRIP_MAX);
}
