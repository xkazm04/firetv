/**
 * How an engine call ends, once for every provider: a deadline, an abort signal, a typed error, and the
 * provider/ms envelope. Each engine function (text, vision, embed, speak, listen) hands its provider and request
 * to call(); the provider only produces a raw answer and, when it can, stops its work on ctx.signal.
 *
 * The core enforces the deadline itself and does not rely on a provider honouring the signal, so a stub, a
 * wrapper that drops the second argument, or a provider that forgot still ends in an EngineError("timeout").
 * Anything a provider throws that is not an EngineError becomes EngineError("exit") with the first line of its
 * message, so the contract in types.ts holds for every provider and lib/desk/job.ts can word the failure.
 */
import { EngineError, type EngineKind, type Provider, type ProviderAnswer } from "./types";

/** The default deadline per kind, in ms; a request's timeoutMs replaces it, a provider's deadlineMs floors it. */
export const DEADLINE_MS: Record<EngineKind, number> = { text: 90000, vision: 180000, embed: 60000, speak: 30000, listen: 120000 };

/** The deadline for one call: the request's timeoutMs, else the kind's default, never under the provider's own floor. */
export function deadlineFor(kind: EngineKind, p: { deadlineMs?: number }, req: { timeoutMs?: number }): number {
  return Math.max(req.timeoutMs ?? DEADLINE_MS[kind], p.deadlineMs ?? 0);
}

/** A provider's own answer, the provider string to report, and how long the call took. */
export interface Called<R> { answer: ProviderAnswer<R>; provider: string; ms: number; }

const firstLine = (e: unknown) => String((e as { message?: unknown } | null)?.message ?? e).split(/\r?\n/)[0].trim() || "The engine failed.";

/** Run one provider under its deadline. Resolves with its answer, or rejects with an EngineError, always. */
export async function call<Req extends { timeoutMs?: number }, R>(kind: EngineKind, p: Provider<Req, R>, req: Req): Promise<Called<R>> {
  const started = Date.now(), ctl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { ctl.abort(); reject(new EngineError("timeout", p.name, `The ${kind} engine took too long. Please retry.`)); }, deadlineFor(kind, p, req));
  });
  // A provider that settles after the deadline has already lost the race; its late rejection is not an unhandled one.
  const ran = Promise.resolve().then(() => p.run(req, { signal: ctl.signal }));
  ran.catch(() => {});
  try {
    const answer = await Promise.race([ran, late]);
    return { answer, provider: answer.provider ?? p.name, ms: Date.now() - started };
  } catch (e) {
    throw e instanceof EngineError ? e : new EngineError("exit", p.name, firstLine(e));
  } finally {
    clearTimeout(timer);
  }
}
