/**
 * Why a desk job failed, as one closed set the store, the routes and both screens read - decided once, where the run
 * fails (lib/desk/job.ts), and carried as a value from there on: on the job, on the job.failed event, and in a route's
 * refusal body, so nobody downstream has to tell a slow engine from a refusal by reading a sentence
 * (error-handling: taxonomy-design, structured-propagation). The engine's six kinds pass through as they are; said is
 * the desk's own sentence for a model result it cannot use (DeskSaid: a read with no items, a marking with no answers,
 * an essay reading that skipped sentences); unread is a learner file the desk will not write over (LearnersUnread);
 * unknown is anything else.
 */
import type { EngineErrorKind } from "../engines/types";

export type JobFailure = EngineErrorKind | "said" | "unread" | "unknown";

/**
 * Whether asking again with the same input can end differently - what Try again is offered on. A slow, stopped or
 * absent engine can answer next time, and a model's malformed or empty answer (shape, said) is not its next one; a
 * ceiling and a refusal meet the same request the same way, and an unreadable learner file stays so until someone
 * mends it. Not knowing is not knowing it cannot help: unknown is offered.
 */
export const RETRYABLE: Record<JobFailure, boolean> = {
  timeout: true, exit: true, unreachable: true, shape: true, said: true, unknown: true,
  cutoff: false, declined: false, unread: false,
};
