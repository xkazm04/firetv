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
import { answer } from "./shape";
import { EngineError, findBinary, type EngineResult, type Provider, type TextRequest } from "./types";

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

type CodexRequest = TextRequest & { effort?: string };

/** codex exec. It only produces the answer; text() and codexText() parse and check it, as for every provider. */
export const codexCli: Provider<CodexRequest, unknown> = {
  name: "codex",
  // codex starts an agent session per call; a tutor timeout tuned for the Claude CLI is too tight for it
  deadlineMs: 240000,
  async run(req, ctx) {
    const model = MODEL(), reported = `codex-cli/${model}`;
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
        const stop = () => child.kill();
        ctx?.signal.addEventListener("abort", stop, { once: true });
        let stderr = "";
        child.stdout.on("data", () => {});
        child.stderr.on("data", d => (stderr += d));
        child.on("error", e => { reject(new EngineError("unreachable", reported, `codex could not start: ${e.message}`)); });
        child.on("close", code => { ctx?.signal.removeEventListener("abort", stop); code === 0 ? resolve() : reject(new EngineError(ctx?.signal.aborted ? "timeout" : "exit", reported, `codex exited ${code}: ${stderr.slice(-400)}`)); });
        child.stdin.on("error", e => { reject(new EngineError("exit", reported, `codex closed its input: ${e.message}`)); });
        child.stdin.end(message);
      });
      const raw = (await readFile(last, "utf8")).trim();
      return { raw, provider: reported, audit: raw.slice(0, 2000) };
    } finally {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  },
  async probe() {
    const { cmd, pre } = launcher();
    return pre.length || findBinary(cmd)
      ? { ok: true, say: `codex is installed (model ${MODEL()}).` }
      : { ok: false, say: "codex is not installed: npm install -g @openai/codex, or set CODEX_JS to its bin/codex.js." };
  },
};

/** codex directly, whatever DESK_TEXT_ENGINE says: the UAT driver's Character and judge roles. Same schema rule as text(). */
export async function codexText<T = unknown>(req: CodexRequest): Promise<EngineResult<T>> {
  return answer<CodexRequest, T>(codexCli, req);
}
