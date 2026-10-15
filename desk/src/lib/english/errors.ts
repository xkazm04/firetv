import { RETRYABLE } from "../desk/failure";
import { EngineError } from "../engines/types";
import { LearnersUnread } from "../session/learners";

/**
 * A refusal the learner can act on; the status says why (400 not valid, 403 not allowed, 404 not there, 409 something
 * changed). Only refusals: a model's failure is an EngineError and is mapped at the route (failure.ts), so the type
 * admits no 5xx (error-handling: taxonomy-design).
 */
export class ConversationError extends Error { constructor(message: string, public status: 400 | 403 | 404 | 409 = 400) { super(message); } }

/** What Linga says when asking again would end the same way: a ceiling or a refusal meets the same request the same way. */
export const LINGA_NOT_AGAIN = "Linga cannot answer this one: asking again would end the same way. Choose something else or say it differently.";

/** What Linga says when the learner file cannot be read: nothing was asked or changed (learners.ts readLearner). */
export const LINGA_UNREAD = "The learner file could not be read just now, so Linga did nothing.";

/** The line a failed Linga call leaves on the session: its own line, unless the failure is one asking again cannot change. */
export function lingaLine(e: unknown, line: string): string {
  if (e instanceof LearnersUnread) return LINGA_UNREAD;
  return e instanceof EngineError && !RETRYABLE[e.kind] ? LINGA_NOT_AGAIN : line;
}
