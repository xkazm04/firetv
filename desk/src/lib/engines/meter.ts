/**
 * The usage ledger: one JSON line per engine call, success or failure, appended by call() (call.ts).
 *
 * A row holds no prompt, no answer, no image and no learner name or id: only what ran, for what, how long, and what
 * the provider reported it used. tokens are null when the provider reported nothing (never 0), and each class inside
 * is null when only that class is missing. The file is DESK_USAGE_FILE, else usage.jsonl under DESK_DATA_DIR (or
 * <cwd>/data), the same rule the stores use; past DESK_USAGE_MAX_BYTES (5 MB) it is renamed to usage.1.jsonl,
 * replacing the older copy. A write never throws into a call: a failure is logged once per distinct reason.
 */
import { appendFileSync, renameSync, statSync, unlinkSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { priceOf } from "./prices";
import type { EngineErrorKind, EngineKind, Usage } from "./types";

export interface UsageRow {
  v: 1; id: string; at: string; kind: EngineKind; use: string | null; provider: string; try: number; ok: boolean;
  error: EngineErrorKind | null; ms: number; tokens: Usage["tokens"]; notionalUsd: number | null;
  marginalUsd: number | null; basis: string;
}

const MAX_BYTES = 5 * 1024 * 1024;
const logged = new Set<string>();

export function usageFile(): string {
  return process.env.DESK_USAGE_FILE || path.join(process.env.DESK_DATA_DIR || path.join(process.cwd(), "data"), "usage.jsonl");
}

/** Append one row. Never throws. */
export function meter(r: { kind: EngineKind; use?: string; provider: string; try?: number; ok: boolean; error: EngineErrorKind | null; ms: number; startedAt: number; usage?: Usage }): void {
  try {
    const price = priceOf(r.provider);
    const row: UsageRow = {
      v: 1, id: randomUUID(), at: new Date(r.startedAt).toISOString(), kind: r.kind, use: r.use ?? null, provider: r.provider,
      try: r.try ?? 1, ok: r.ok, error: r.error, ms: r.ms, tokens: r.usage?.tokens ?? null, notionalUsd: r.usage?.notionalUsd ?? null,
      marginalUsd: price.marginalUsd, basis: price.basis,
    };
    const file = usageFile(), cap = Number(process.env.DESK_USAGE_MAX_BYTES) || MAX_BYTES;
    let size = 0;
    try { size = statSync(file).size; } catch { /* no file yet */ }
    if (size > cap) {
      const old = path.join(path.dirname(file), "usage.1.jsonl");
      try { unlinkSync(old); } catch { /* none */ }
      renameSync(file, old);
    }
    appendFileSync(file, JSON.stringify(row) + "\n");
  } catch (e) {
    const why = String((e as { message?: unknown } | null)?.message ?? e).split(/\r?\n/)[0];
    if (!logged.has(why)) { logged.add(why); console.error(`[engines] the usage ledger could not be written: ${why}`); }
  }
}
