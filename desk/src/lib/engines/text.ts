/**
 * Text engine — the Claude Code CLI, headless.
 *
 *   claude -p --no-session-persistence --tools "" --system-prompt <s>
 *          --output-format json --json-schema <schema> --model <m>
 *
 * The system prompt goes in as an argument and replaces the default one; `--tools ""` leaves the
 * model nothing but the answer; the prompt goes in on stdin so nothing is shell-quoted; and
 * `--json-schema` makes the structured answer a guarantee rather than a request — it arrives in
 * the envelope's `structured_output`. Linga's isolated calls ask for directly generated JSON instead,
 * to avoid the CLI's extra structured-output turn; text() validates both against the same schema.
 *
 * Later: Bedrock, same request shape.
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { codexCli } from "./codex";
import { provider, register } from "./registry";
import { answer } from "./shape";
import { EngineError, findBinary, type Again, type CallContext, type EngineResult, type Provider, type TextRequest, type Usage } from "./types";

export const BIN = process.env.CLAUDE_BIN || "claude";
export const MODELS = { fast: process.env.CLAUDE_FAST_MODEL || "haiku", best: process.env.CLAUDE_BEST_MODEL || "sonnet" };

/**
 * The child's environment. `thinking: false` sets MAX_THINKING_TOKENS=0, the CLI's switch for hidden reasoning
 * (it has no flag for it; `--effort low` barely moved it). Measured 2026-09-25 on Linga turns with haiku (T10 A/B):
 * thinking on, ~7k output tokens, 52-90 s and 5 timeouts in 15 calls; off, ~220 tokens and 4-6 s, none.
 */
export function childEnv(req: Pick<TextRequest, "thinking">): NodeJS.ProcessEnv {
  return req.thinking === false ? { ...process.env, MAX_THINKING_TOKENS: "0" } : process.env;
}

/** The usage a claude CLI JSON envelope reports: its four token classes (each null when the envelope omits it; the whole object null when it has none) and total_cost_usd verbatim. */
export function usageOf(envelope: unknown): Usage {
  const e = (envelope && typeof envelope === "object" ? envelope : {}) as { usage?: Record<string, unknown>; total_cost_usd?: unknown };
  const u = e.usage && typeof e.usage === "object" ? e.usage : {};
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const tokens = { input: n(u.input_tokens), output: n(u.output_tokens), cacheRead: n(u.cache_read_input_tokens), cacheWrite: n(u.cache_creation_input_tokens) };
  return { tokens: Object.values(tokens).every((v) => v === null) ? null : tokens, notionalUsd: n(e.total_cost_usd) };
}

/** The Claude CLI. It only produces the answer; text() parses and checks it, as for every provider. */
/**
 * Why the CLI's turn ended without an answer to judge, read from its envelope, or null when it answered: max_tokens is
 * a ceiling (cutoff), refusal is a decline, is_error is the run failing (exit). The stop reasons are the API's own,
 * passed through by the CLI (end_turn and stop_sequence are seen in this repo's captured envelopes and mean it answered).
 */
export function stopOf(envelope: { stop_reason?: unknown; is_error?: unknown; subtype?: unknown }): { kind: "cutoff" | "declined" | "exit"; why: string } | null {
  if (envelope.stop_reason === "max_tokens") return { kind: "cutoff", why: "claude stopped at its output limit before the answer was finished" };
  if (envelope.stop_reason === "refusal") return { kind: "declined", why: "claude declined to answer" };
  if (envelope.is_error === true) return { kind: "exit", why: `claude reported an error (${String(envelope.subtype ?? "no subtype")})` };
  return null;
}

/**
 * Start the claude CLI once: no shell (claude is a real executable on PATH, claude.exe on Windows), so every argv entry
 * arrives intact, and `input` goes in on stdin. Resolves with stdout on exit 0. On the call core's abort the child is
 * killed and the call ends as a timeout; a spawn failure is unreachable, any other non-zero exit is exit, with the spend
 * the envelope on stdout reported, when it printed one. The text and vision providers both run the CLI through it.
 */
export function spawnClaude(args: string[], input: string, reported: string, cwd: string, env: NodeJS.ProcessEnv, ctx?: CallContext): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(BIN, args, { cwd, windowsHide: true, env });
    // The deadline is the call core's (call.ts); on its abort the child is killed and the call ends as a timeout.
    const stop = () => child.kill();
    ctx?.signal.addEventListener("abort", stop, { once: true });
    let stdout = "", stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (e) => { reject(new EngineError("unreachable", reported, `claude could not start: ${e.message}`)); });
    child.on("close", (code) => {
      ctx?.signal.removeEventListener("abort", stop);
      if (code === 0) return resolve(stdout);
      // a failed run can still print its envelope, and with it what the attempt cost: the ledger books that spend
      const failed = new EngineError(ctx?.signal.aborted ? "timeout" : "exit", reported, `claude exited ${code}: ${stderr.slice(0, 400)}`);
      try { failed.usage = usageOf(envelopeOf(stdout)); } catch { /* no envelope on stdout: the spend is unknown (null), never 0 */ }
      reject(failed);
    });
    child.stdin.on("error", (e) => { reject(new EngineError("exit", reported, `claude closed its input: ${e.message}`)); });
    child.stdin.end(input);
  });
}

/** The envelope of a CLI run, or a throw: the whole stdout for --output-format json, its last non-empty line for stream-json. */
export function envelopeOf(out: string): unknown {
  try { return JSON.parse(out); } catch { /* stream-json: one event per line, the result envelope last */ }
  const lines = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return JSON.parse(lines.length ? lines[lines.length - 1] : "");
}

export const claudeCli: Provider<TextRequest, unknown> = {
  name: "claude-cli",
  async run(req, ctx) {
    const reported = `claude-cli/${MODELS[req.model ?? "fast"]}`;
    // Measured on 2026-09-07: `--bare` never reaches the API (exit 1, 0 ms, no message), while an
    // inline --system-prompt with --tools "" costs ~1.2k input tokens against ~18k for the default
    // system prompt. So: no --bare, inline system prompt, no tools, no session on disk.
    const dir = await mkdtemp(path.join(tmpdir(), "desk-"));
    const system = req.isolated && req.schema ? `${req.system}\nReturn the JSON object itself, without markdown fences. It must match this schema: ${JSON.stringify(req.schema)}` : req.system;
    const args = ["-p", "--no-session-persistence", "--tools", "", "--system-prompt", system,
      "--output-format", "json", "--model", MODELS[req.model ?? "fast"]];
    // Interactive coding customisations are irrelevant to a bounded tutor call. Unlike --bare,
    // safe mode retains subscription authentication. Managed policy still applies.
    if (req.isolated) args.push("--safe-mode", "--strict-mcp-config", "--disable-slash-commands");
    // The CLI's structured-output tool costs a second model turn, so isolated calls ask for the JSON
    // directly; text() holds both kinds of answer to the same schema.
    if (req.schema && !req.isolated) args.push("--json-schema", JSON.stringify(req.schema));

    const out = await spawnClaude(args, req.prompt, reported, dir, childEnv(req), ctx)
      .finally(() => rm(dir, { recursive: true, force: true }).catch((e) => console.warn(`[engines] claude left its temp dir ${dir}: ${e instanceof Error ? e.message : e}`)));

    let envelope: { structured_output?: unknown; result?: unknown; stop_reason?: unknown; is_error?: unknown; subtype?: unknown };
    try { envelope = JSON.parse(out); } catch { throw new EngineError("exit", reported, `claude answered without its JSON envelope: ${out.slice(0, 200)}`); }
    // why the turn ended is read before the answer is: a ceiling or a refusal is not a malformed answer (unattempted-is-not-failed)
    const stop = stopOf(envelope);
    if (stop) { const e = new EngineError(stop.kind, reported, stop.why); e.usage = usageOf(envelope); throw e; }
    // With --json-schema the CLI has already parsed the answer; otherwise it is the model's text.
    return { raw: envelope.structured_output ?? envelope.result, provider: reported, audit: out.slice(0, 2000), usage: usageOf(envelope) };
  },
  async probe() {
    return findBinary(BIN)
      ? { ok: true, say: `${BIN} is installed (fast ${MODELS.fast}, best ${MODELS.best}).` }
      : { ok: false, say: `${BIN} is not on PATH: install the Claude CLI, or set CLAUDE_BIN to its path.` };
  },
};

register("text", [claudeCli, codexCli], () => (process.env.DESK_TEXT_ENGINE === "codex" ? "codex" : "claude-cli"));

/**
 * One text call. The registry picks the provider (UAT text-live runs set DESK_TEXT_ENGINE=codex in their own
 * processes; the dev server never does); the answer is held to req.schema whichever one ran. A caller asking again
 * after judging an answer passes that answer's `again`: the re-ask spends what is left of its deadline (types.ts Again).
 */
export async function text<T = unknown>(req: TextRequest, after?: Again): Promise<EngineResult<T>> {
  return answer<TextRequest, T>(provider("text"), req, "text", after);
}
