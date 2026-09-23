/**
 * One runner for every homework pipeline (read, hint, lesson, explain, mark, practice, analyse, memory).
 *
 * A pipeline is 5-60 s of model work inside a request. `runJob` gives each one the same lifecycle in the
 * session's `jobs` record (store.ts `Job`): `job.start`, then `job.done` or `job.failed` with a sentence the
 * desk would say. One run of a kind at a time: a second request while one is running is refused (409) with
 * no engine call - unless the job `supersedes` (the lesson pick: a new hint's pick replaces the old one's,
 * and the old run's events are dropped by id). The free-text `status` line is still written, so the bench
 * bar and the phone keep working; it may carry the engine's detail, the job's error never does.
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, type JobInput, type JobKind } from "../session/store";
import { EngineError, type EngineErrorKind } from "../engines/types";

export interface JobRun {
  id: string;
  /** Still the latest run of its kind: nothing newer has replaced it and the desk was not reset. */
  current(): boolean;
}
export interface JobOptions<T> {
  /** What the run is about: a topic id, an item key. Recorded on the job; a screen matches on it. */
  key?: string;
  /** Replace a running job of this kind instead of refusing (its late events are dropped). */
  supersedes?: boolean;
  /** Status line when the run starts. */
  start?: string;
  /** Status line when it succeeds. */
  done?: (value: T) => string;
  /**
   * What the run was asked with, held on the job so POST /api/session/retry can ask again in place:
   * the route's own request body, minus anything big (a page is held on the session by its id, not its image).
   */
  input?: JobInput;
  /** Put the session right before the failure is recorded (e.g. a page stops "reading"). */
  onFail?: (e: unknown) => void;
}
export type JobResult<T> = { ok: true; value: T } | { ok: false; status: 409 | 502; error: string };

/** What each pipeline is, in the desk's words, when it does not come back. */
const FAILED: Record<JobKind, string> = {
  read: "The desk could not read that page.",
  hint: "The desk could not come up with a hint just now.",
  lesson: "The desk could not look for a lesson this time.",
  explain: "The desk could not follow that.",
  mark: "The desk could not mark the set.",
  practice: "The desk could not write this set.",
  analyse: "The desk could not read that through.",
  memory: "The desk could not write tonight down.",
};
/** Why, when the engine says. */
const WHY: Record<EngineErrorKind, string> = {
  timeout: "It took too long.",
  unreachable: "The engine behind it is not answering.",
  exit: "The engine behind it stopped part way.",
  shape: "The answer came back in pieces.",
};
export const BUSY = "The desk is already on it.";
/** A run whose result no longer fits the desk (another learner sat down, the page went): dropped, not failed. */
export const MOVED_ON = "The desk has moved on since that was asked.";
/** POST /api/session/retry with no failed run of that kind. */
export const NOTHING = "There is nothing to try again.";

/** The sentence a failed run leaves on the session: never an exception's text or its stack. */
export function jobError(kind: JobKind, e: unknown): string {
  const why = e instanceof EngineError ? WHY[e.kind] : "";
  return why ? `${FAILED[kind]} ${why}` : `${FAILED[kind]} Try again.`;
}

let seq = 0;
const runId = (kind: JobKind) => `${kind}-${Date.now().toString(36)}-${(++seq).toString(36)}`;
const detail = (e: unknown) => (e instanceof Error ? e.message : String(e)).split("\n")[0].slice(0, 120);

export async function runJob<T>(kind: JobKind, work: (run: JobRun) => Promise<T>, opts: JobOptions<T> = {}): Promise<JobResult<T>> {
  const now = getSession().jobs?.[kind];
  if (now?.phase === "running" && !opts.supersedes) return { ok: false, status: 409, error: BUSY };
  const id = runId(kind);
  const run: JobRun = { id, current: () => getSession().jobs?.[kind]?.id === id };
  dispatch({ type: "job.start", kind, id, ...(opts.key !== undefined ? { key: opts.key } : {}), ...(opts.input ? { input: opts.input } : {}) });
  if (opts.start) dispatch({ type: "status", text: opts.start });
  try {
    const value = await work(run);
    if (run.current()) {
      dispatch({ type: "job.done", kind, id });
      if (opts.done) dispatch({ type: "status", text: opts.done(value) });
    }
    return { ok: true, value };
  } catch (e) {
    const error = jobError(kind, e);
    if (run.current()) {
      try { opts.onFail?.(e); } catch {}
      dispatch({ type: "job.failed", kind, id, error });
      dispatch({ type: "status", text: `${error} (${detail(e)})` });
    }
    return { ok: false, status: 502, error };
  }
}

/** The answer a route gives for a run that did not succeed: 409 while one is running, 502 when it failed. */
export function refused(r: { status: 409 | 502; error: string }): NextResponse {
  return NextResponse.json({ error: r.error }, { status: r.status });
}
