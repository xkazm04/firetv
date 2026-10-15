import { RETRYABLE } from "../desk/failure";
import { EngineError } from "../engines/types";

/**
 * A refusal the learner can act on; the status says why (400 not valid, 403 not allowed, 404 not there, 409 something
 * changed). Only refusals: a model's failure is an EngineError and is mapped at the route (failure.ts), so the type
 * admits no 5xx (error-handling: taxonomy-design).
 */
export class ConversationError extends Error { constructor(message: string, public status: 400 | 403 | 404 | 409 = 400) { super(message); } }

/** What Linga says when asking again would end the same way: a ceiling or a refusal meets the same request the same way. */
export const LINGA_NOT_AGAIN = "Linga cannot answer this one: asking again would end the same way. Choose something else or say it differently.";

/** The line a failed Linga call leaves on the session: its own line, unless the failure is one asking again cannot change. */
export function lingaLine(e: unknown, line: string): string {
  return e instanceof EngineError && !RETRYABLE[e.kind] ? LINGA_NOT_AGAIN : line;
}
