/**
 * Text engine — the Claude Code CLI, headless.
 *
 *   claude -p --no-session-persistence --tools "" --system-prompt <s>
 *          --output-format json --json-schema <schema> --model <m>
 *
 * The system prompt goes in as an argument and replaces the default one; `--tools ""` leaves the
 * model nothing but the answer; the prompt goes in on stdin so nothing is shell-quoted; and
 * `--json-schema` makes the structured answer a guarantee rather than a request — it arrives in
 * the envelope's `structured_output`. Linga's isolated calls use directly generated JSON,
 * validated by the conversation service, to avoid the CLI's extra structured-output turn.
 *
 * Later: Bedrock, same request shape.
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { codexText } from "./codex";
import type { EngineResult, TextRequest } from "./types";

const BIN = process.env.CLAUDE_BIN || "claude";
const MODELS = { fast: process.env.CLAUDE_FAST_MODEL || "haiku", best: process.env.CLAUDE_BEST_MODEL || "sonnet" };

export async function text<T = unknown>(req: TextRequest): Promise<EngineResult<T>> {
  // UAT text-live runs set this in their own processes; the dev server never does.
  if (process.env.DESK_TEXT_ENGINE === "codex") return codexText<T>(req);
  const started = Date.now();
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
  // The CLI's structured-output tool costs a second model turn. Linga instead validates the
  // directly generated JSON in its service; other callers keep the original schema contract.
  if (req.schema && !req.isolated) args.push("--json-schema", JSON.stringify(req.schema));

  const out = await new Promise<string>((resolve, reject) => {
    // claude is a real executable on PATH (claude.exe on Windows), so no shell: the JSON schema
    // arrives as one argv entry intact, and the prompt goes in on stdin.
    const child = spawn(BIN, args, { cwd: dir, windowsHide: true });
    const timeout = setTimeout(() => { child.kill(); reject(new Error("The text engine took too long. Please retry.")); }, req.timeoutMs ?? 90000);
    let stdout = "", stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (e) => { clearTimeout(timeout); reject(e); });
    child.on("close", (code) => { clearTimeout(timeout); code === 0 ? resolve(stdout) : reject(new Error(`claude exited ${code}: ${stderr.slice(0, 400)}`)); });
    child.stdin.on("error", (e) => { clearTimeout(timeout); reject(e); });
    child.stdin.end(req.prompt);
  }).finally(() => rm(dir, { recursive: true, force: true }).catch(() => {}));

  const envelope = JSON.parse(out);
  const result = envelope.structured_output ?? envelope.result;
  let json: T;
  if (typeof result === "string") {
    // Without a schema the answer is prose; with one the CLI already parsed it.
    const source = req.isolated ? result.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "") : result;
    try { json = JSON.parse(source) as T; } catch { json = result as unknown as T; }
  } else json = result as T;
  return { json, provider: `claude-cli/${MODELS[req.model ?? "fast"]}`, ms: Date.now() - started, raw: out.slice(0, 2000) };
}
