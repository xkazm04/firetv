/**
 * The engine check: one row per engine, to find a broken one here and not on the TV.
 *
 * engineStatus() asks each kind's ACTIVE provider (registry.ts) for its probe, all at once, each under a budget:
 * which provider would run, whether its binary, host, model, key or file is there, and what to do when it is not.
 * It makes no model call. A provider with no probe is ok: null (unknown), never a guess.
 *
 * engineCheck({ live: true }) also runs text, vision (when there is a sample page), embed and speak for real,
 * side by side, and reports the provider and ms each engine reported. Listen is only probed: a recording is the
 * user's to make. A failed run is a row with the typed error's kind and our own sentence; the engine's own message
 * goes to the server log (as lib/desk/job.ts does), because it can carry an upstream reply or a key fragment.
 */
import { embed } from "./embed";
import "./listen"; // registers the listen engine; the check never runs it
import { activeProvider, provider } from "./registry";
import { speak } from "./voice";
import { text } from "./text";
import { vision } from "./vision";
import { EngineError, type EngineErrorKind, type EngineKind, type ProbeResult } from "./types";

export const KINDS: readonly EngineKind[] = ["text", "vision", "embed", "speak", "listen"];

/** `ok` is null when nothing was checked; `error` is set only when a live run failed. */
export interface EngineRow {
  kind: EngineKind;
  provider: string;
  ok: boolean | null;
  say: string;
  ms: number;
  error?: { kind: EngineErrorKind; say: string };
}

/** How long the whole status round waits for any one probe. Ollama's own probe gives up at 2 s. */
export const BUDGET_MS = 2500;

/** Our words for why a live run failed; never the engine's. */
const WHY: Record<EngineErrorKind, string> = {
  timeout: "It took too long.",
  unreachable: "It is not answering.",
  exit: "It stopped part way.",
  shape: "It answered in pieces.",
};

const NO_PROBE = "No probe for this one: add ?live=1 to run it for real.";

const nameOf = (kind: EngineKind) => { try { return activeProvider(kind); } catch { return kind; } };

/** One kind's probe, raced against the budget. Never rejects. */
async function probeRow(kind: EngineKind, budgetMs: number): Promise<EngineRow> {
  const started = Date.now();
  const row = (name: string, ok: boolean | null, say: string): EngineRow => ({ kind, provider: name, ok, say, ms: Date.now() - started });
  let name: string = kind, timer: ReturnType<typeof setTimeout> | undefined;
  try {
    name = nameOf(kind);
    const p = provider(kind);
    if (!p.probe) return row(name, null, NO_PROBE);
    const asked = p.probe();
    asked.catch(() => {});
    const late = new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), budgetMs); });
    const r: ProbeResult | null = await Promise.race([asked, late]);
    return r ? row(name, r.ok, r.say) : row(name, false, `${name} did not answer in ${budgetMs} ms.`);
  } catch (e) {
    if (e instanceof EngineError && e.kind === "unreachable") return row(name, false, e.message);
    console.error(`[engines] ${kind} probe failed: ${e instanceof Error ? e.message : String(e)}`);
    return row(name, false, `The ${kind} probe failed.`);
  } finally { clearTimeout(timer); }
}

/** All five kinds at once, in the order text, vision, embed, speak, listen. Calls no engine. */
export function engineStatus(budgetMs: number = BUDGET_MS): Promise<EngineRow[]> {
  return Promise.all(KINDS.map((k) => probeRow(k, budgetMs)));
}

/** One live run, as a row. Never rejects. */
async function liveRow(kind: EngineKind, run: () => Promise<{ provider: string; ms: number }>): Promise<EngineRow> {
  try {
    const r = await run();
    return { kind, provider: r.provider, ok: true, say: "Answered.", ms: r.ms };
  } catch (e) {
    const k: EngineErrorKind = e instanceof EngineError ? e.kind : "exit";
    console.error(`[engines] live ${kind} ${e instanceof EngineError ? e.provider : nameOf(kind)} failed (${k}): ${e instanceof Error ? e.message : String(e)}`);
    return { kind, provider: e instanceof EngineError ? e.provider : nameOf(kind), ok: false, say: `The ${kind} call failed.`, ms: 0, error: { kind: k, say: WHY[k] } };
  }
}

/**
 * The status, or with `live` the real calls too, side by side. `sample` is a page image as base64: without one,
 * vision is only probed. Listen is always only probed.
 */
export async function engineCheck(opts: { live?: boolean; sample?: string; budgetMs?: number } = {}): Promise<EngineRow[]> {
  if (!opts.live) return engineStatus(opts.budgetMs);
  const budget = opts.budgetMs ?? BUDGET_MS, sample = opts.sample;
  const runs: Record<EngineKind, Promise<EngineRow>> = {
    text: liveRow("text", () => text({ system: "Answer in JSON.", prompt: "Set ok to the word yes.", schema: { type: "object", properties: { ok: { type: "string" } }, required: ["ok"] } })),
    vision: sample
      ? liveRow("vision", () => vision({ imageBase64: sample, prompt: "What is the title printed at the top of this page?", schema: { type: "object", properties: { title: { type: "string" } }, required: ["title"] } }))
      : probeRow("vision", budget),
    embed: liveRow("embed", () => embed({ texts: ["factoring quadratics"] })),
    speak: liveRow("speak", () => speak({ text: "The desk can speak." })),
    listen: probeRow("listen", budget),
  };
  return Promise.all(KINDS.map((k) => runs[k]));
}
