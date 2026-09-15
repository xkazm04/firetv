/**
 * Text engine — codex-cli, headless. For UAT's text-live runs (DESK_TEXT_ENGINE=codex); the desk itself stays on the Claude CLI.
 *
 *   node codex.js exec -m <model> --ephemeral --skip-git-repo-check -s read-only --color never
 *        -c model_reasoning_effort="<effort>" --output-schema <file> -o <file> -
 *
 * Codex has no separate system prompt flag, so the system prompt and the request go in on stdin as one
 * message. `--output-schema` makes the shape a guarantee, and the last message lands in a file, so nothing
 * is parsed out of the event log. On Windows `codex` on PATH is an npm .cmd shim, which cannot be spawned
 * without a shell: the JS entry is launched with node instead.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { EngineResult, TextRequest } from "./types";

const MODEL = () => process.env.UAT_CODEX_MODEL || "gpt-6-astra";

function launcher(): { cmd: string; pre: string[] } {
  // The install beside the running node comes first: a stale global npm copy (0.139 on 15 Sep 2026) rejects
  // newer models with "requires a newer version of Codex", while the one on PATH (0.154) serves them.
  const candidates = [
    process.env.CODEX_JS,
    path.join(path.dirname(process.execPath), "node_modules", "@openai", "codex", "bin", "codex.js"),
    process.env.APPDATA && path.join(process.env.APPDATA, "npm", "node_modules", "@openai", "codex", "bin", "codex.js"),
  ].filter((p): p is string => !!p);
  const js = candidates.find(p => existsSync(p));
  return js ? { cmd: process.execPath, pre: [js] } : { cmd: "codex", pre: [] };
}

export async function codexText<T = unknown>(req: TextRequest & { effort?: string }): Promise<EngineResult<T>> {
  const started = Date.now(), model = MODEL();
  const dir = await mkdtemp(path.join(tmpdir(), "desk-codex-"));
  try {
    const last = path.join(dir, "last.txt");
    const args = ["exec", "-m", model, "--ephemeral", "--skip-git-repo-check", "-s", "read-only", "--color", "never",
      "-c", `model_reasoning_effort="${req.effort ?? process.env.UAT_CODEX_EFFORT ?? "medium"}"`, "-o", last];
    if (req.schema) { const file = path.join(dir, "schema.json"); await writeFile(file, JSON.stringify(req.schema)); args.push("--output-schema", file); }
    args.push("-");
    const message = `${req.system}\n\n---\n\n${req.prompt}${req.schema ? "\n\nReturn only the JSON object." : ""}`;
    const { cmd, pre } = launcher();
    await new Promise<void>((resolve, reject) => {
      const child = spawn(cmd, [...pre, ...args], { cwd: dir, windowsHide: true });
      // codex starts an agent session per call; a tutor timeout tuned for the Claude CLI is too tight for it
      const timeout = setTimeout(() => { child.kill(); reject(new Error("The text engine took too long. Please retry.")); }, Math.max(req.timeoutMs ?? 90000, 240000));
      let stderr = "";
      child.stdout.on("data", () => {});
      child.stderr.on("data", d => (stderr += d));
      child.on("error", e => { clearTimeout(timeout); reject(e); });
      child.on("close", code => { clearTimeout(timeout); code === 0 ? resolve() : reject(new Error(`codex exited ${code}: ${stderr.slice(-400)}`)); });
      child.stdin.on("error", e => { clearTimeout(timeout); reject(e); });
      child.stdin.end(message);
    });
    const raw = (await readFile(last, "utf8")).trim();
    let json: T;
    try { json = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")) as T; } catch { json = raw as unknown as T; }
    return { json, provider: `codex-cli/${model}`, ms: Date.now() - started, raw: raw.slice(0, 2000) };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
