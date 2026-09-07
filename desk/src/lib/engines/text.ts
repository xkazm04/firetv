/**
 * Text engine — the Claude Code CLI, headless.
 *
 *   claude -p --bare --no-session-persistence --tools "" --system-prompt-file <f>
 *          --output-format json --json-schema <schema> --model <m>
 *
 * The system prompt goes in as an argument and replaces the default one; `--tools ""` leaves the
 * model nothing but the answer; the prompt goes in on stdin so nothing is shell-quoted; and
 * `--json-schema` makes the structured answer a guarantee rather than a request — it arrives in
 * the envelope's `structured_output`.
 *
 * Later: Bedrock, same request shape.
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { EngineResult, TextRequest } from "./types";

const BIN = process.env.CLAUDE_BIN || "claude";
const MODELS = { fast: process.env.CLAUDE_FAST_MODEL || "haiku", best: process.env.CLAUDE_BEST_MODEL || "sonnet" };

export async function text<T = unknown>(req: TextRequest): Promise<EngineResult<T>> {
  const started = Date.now();
  // Measured on 2026-09-07: `--bare` never reaches the API (exit 1, 0 ms, no message), while an
  // inline --system-prompt with --tools "" costs ~1.2k input tokens against ~18k for the default
  // system prompt. So: no --bare, inline system prompt, no tools, no session on disk.
  const dir = await mkdtemp(path.join(tmpdir(), "desk-"));
  const args = ["-p", "--no-session-persistence", "--tools", "", "--system-prompt", req.system,
    "--output-format", "json", "--model", MODELS[req.model ?? "fast"]];
  if (req.schema) args.push("--json-schema", JSON.stringify(req.schema));

  const out = await new Promise<string>((resolve, reject) => {
    // claude is a real executable on PATH (claude.exe on Windows), so no shell: the JSON schema
    // arrives as one argv entry intact, and the prompt goes in on stdin.
    const child = spawn(BIN, args, { cwd: dir, windowsHide: true });
    let stdout = "", stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve(stdout) : reject(new Error(`claude exited ${code}: ${stderr.slice(0, 400)}`))));
    child.stdin.end(req.prompt);
  }).finally(() => rm(dir, { recursive: true, force: true }).catch(() => {}));

  const envelope = JSON.parse(out);
  const result = envelope.structured_output ?? envelope.result;
  let json: T;
  if (typeof result === "string") {
    // Without a schema the answer is prose; with one the CLI already parsed it.
    try { json = JSON.parse(result) as T; } catch { json = result as unknown as T; }
  } else json = result as T;
  return { json, provider: `claude-cli/${MODELS[req.model ?? "fast"]}`, ms: Date.now() - started, raw: out.slice(0, 2000) };
}
