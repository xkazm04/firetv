/**
 * Vision engine — Qwen on Ollama. The same call shape the PoCs used; `format: schema` is enforced
 * in the decoder, and vision() still checks the answer against it, as for every provider.
 * `think: false` first, retried without for models that reject the key.
 *
 * What it can be asked: read a page, enumerate items, say what is inside a drawn ring. What it must
 * not be asked: to count, to do arithmetic, to see a process in one frame (FRAME-ANALYSIS-LESSONS).
 *
 * Two more providers answer the same request, chosen by DESK_VISION_ENGINE (claude-cli | codex | ollama, default
 * ollama): the Claude CLI, which gets the page inline as an image block on stdin, and codex, which gets it as a temp
 * file (`--image`). Neither is handed a decoder-enforced schema: the schema goes into the instructions, and vision()
 * holds every provider's answer to it the same way (shape.ts).
 *
 * Later: Bedrock vision, same request shape.
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { codexCli } from "./codex";
import { provider, register } from "./registry";
import { answer } from "./shape";
import { BIN as CLAUDE_BIN, MODELS as CLAUDE_MODELS, childEnv, envelopeOf, spawnClaude, stopOf, usageOf } from "./text";
import { EngineError, findBinary, type EngineResult, type ProbeResult, type Provider, type VisionRequest } from "./types";

const HOST = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");
const MODEL = process.env.OLLAMA_VISION_MODEL || "qwen3.8:27b";

/**
 * Whether an Ollama host answers and has `model` pulled: one GET /api/tags, two seconds at most, no model loaded.
 * The vision and embed engines share it. The wording is ours (host, model, the command to run), never the host's reply.
 */
export async function ollamaProbe(host: string, model: string): Promise<ProbeResult> {
  let names: string[];
  try {
    const r = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (!r.ok) return { ok: false, say: `ollama at ${host} answered ${r.status}: is it the right host (OLLAMA_HOST)?` };
    names = ((await r.json()) as { models?: Array<{ name?: unknown }> }).models?.map((m) => String(m?.name)) ?? [];
  } catch {
    return { ok: false, say: `ollama is not reachable at ${host}: start it with \`ollama serve\`.` };
  }
  return names.some((n) => n === model || (!model.includes(":") && n === `${model}:latest`))
    ? { ok: true, say: `ollama at ${host} has ${model}.` }
    : { ok: false, say: `${model} is not pulled at ${host}: run \`ollama pull ${model}\`.` };
}

/** Qwen on Ollama. It only produces the answer; vision() parses and checks it. */
export const ollamaVision: Provider<VisionRequest, unknown> = {
  name: "ollama",
  async run(req, ctx) {
    const reported = `ollama/${MODEL}`;
    const body: Record<string, unknown> = {
      model: MODEL, stream: false, options: { temperature: 0, num_ctx: 16384 },
      messages: [{ role: "user", content: req.prompt, images: [req.imageBase64] }],
    };
    if (req.schema) body.format = req.schema;
    const post = (b: Record<string, unknown>) => fetch(`${HOST}/api/chat`, { method: "POST", body: JSON.stringify(b), signal: ctx?.signal })
      .catch((e: Error) => { throw new EngineError(e.name === "AbortError" ? "timeout" : "unreachable", reported, `ollama is not reachable: ${e.message}`); });
    let res = await post({ ...body, think: false });
    // Only a 400 says the request body was refused (the think key); a 404 (model not pulled) or a 5xx is not cured by resending the image.
    if (res.status === 400) res = await post(body);
    if (!res.ok) throw new EngineError("exit", reported, `ollama ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    const content: string = data.message?.content ?? "";
    // ollama names why it stopped: "length" is a ceiling, not a malformed answer (unattempted-is-not-failed)
    if (data.done_reason === "length") throw new EngineError("cutoff", reported, "ollama stopped at its length limit before the answer was finished");
    return { raw: content, provider: reported, audit: content.slice(0, 2000) };
  },
  probe: () => ollamaProbe(HOST, MODEL),
};

/** The image's media type, read from the first bytes of its base64 (PNG, GIF, WebP), else JPEG: a phone capture is a JPEG. */
export function mediaTypeOf(imageBase64: string): "image/png" | "image/gif" | "image/webp" | "image/jpeg" {
  if (imageBase64.startsWith("iVBOR")) return "image/png";
  if (imageBase64.startsWith("R0lGOD")) return "image/gif";
  if (imageBase64.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}

const READER = "You read a photographed page and answer with one JSON object, without markdown fences.";
/** The instructions a CLI provider gets: the reader's role, and the caller's schema written into it (vision() still checks it). */
export const readerSystem = (req: Pick<VisionRequest, "schema">) => (req.schema ? `${READER} It must match this schema: ${JSON.stringify(req.schema)}` : READER);
/** The Claude model a page read runs on: CLAUDE_VISION_MODEL, else the text engine's best model. */
const CLAUDE_VISION_MODEL = () => process.env.CLAUDE_VISION_MODEL || CLAUDE_MODELS.best;

/**
 * The Claude CLI, headless, with the page inline:
 *
 *   claude -p --no-session-persistence --tools "" --system-prompt <s> --input-format stream-json
 *          --output-format stream-json --verbose --model <m> --safe-mode --strict-mcp-config --disable-slash-commands
 *
 * The page goes in on stdin as one stream-json user message (an image block, then the prompt), so the model gets NO
 * tool at all: it never reads a file, and no permission is granted. stream-json input requires stream-json output; the
 * result envelope is its last line, with the same fields as --output-format json (stopOf, usageOf). Same binary
 * (CLAUDE_BIN), same subscription auth and the same isolation flags as an isolated text call; hidden reasoning is off.
 * The working directory is an empty temp dir, removed when the call ends, whichever way it ends.
 */
export const claudeVision: Provider<VisionRequest, unknown> = {
  name: "claude-cli",
  async run(req, ctx) {
    const model = CLAUDE_VISION_MODEL(), reported = `claude-cli/${model}`;
    const args = ["-p", "--no-session-persistence", "--tools", "", "--system-prompt", readerSystem(req),
      "--input-format", "stream-json", "--output-format", "stream-json", "--verbose", "--model", model,
      "--safe-mode", "--strict-mcp-config", "--disable-slash-commands"];
    const message = JSON.stringify({ type: "user", message: { role: "user", content: [
      { type: "image", source: { type: "base64", media_type: mediaTypeOf(req.imageBase64), data: req.imageBase64 } },
      { type: "text", text: req.prompt },
    ] } });
    const dir = await mkdtemp(path.join(tmpdir(), "desk-vision-"));
    const out = await spawnClaude(args, message + "\n", reported, dir, childEnv({ thinking: false }), ctx)
      .finally(() => rm(dir, { recursive: true, force: true }).catch((e) => console.warn(`[engines] claude left its temp dir ${dir}: ${e instanceof Error ? e.message : e}`)));
    let envelope: { type?: unknown; result?: unknown; stop_reason?: unknown; is_error?: unknown; subtype?: unknown };
    try { envelope = envelopeOf(out) as typeof envelope; } catch { envelope = {}; }
    if (!envelope || envelope.type !== "result") throw new EngineError("exit", reported, `claude answered without its result envelope: ${out.slice(-200)}`);
    // why the turn ended is read before the answer is: a ceiling or a refusal is not a malformed answer
    const stop = stopOf(envelope);
    if (stop) { const e = new EngineError(stop.kind, reported, stop.why); e.usage = usageOf(envelope); throw e; }
    return { raw: envelope.result, provider: reported, audit: String(envelope.result ?? "").slice(0, 2000), usage: usageOf(envelope) };
  },
  async probe() {
    return findBinary(CLAUDE_BIN)
      ? { ok: true, say: `${CLAUDE_BIN} is installed (vision model ${CLAUDE_VISION_MODEL()}).` }
      : { ok: false, say: `${CLAUDE_BIN} is not on PATH: install the Claude CLI, or set CLAUDE_BIN to its path (DESK_VISION_ENGINE=claude-cli).` };
  },
};

/** The file name a page is written under for codex, by its media type. */
const EXT = { "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp", "image/jpeg": ".jpg" } as const;

/**
 * codex exec with the page attached as a file (`--image`). The bytes are written to a temp dir under the OS temp dir
 * and the dir is removed when the call ends, whichever way it ends. The schema goes in the instructions, not
 * --output-schema: codex's decoder needs every property required and closed, and the page schemas have optional parts.
 */
export const codexVision: Provider<VisionRequest, unknown> = {
  name: "codex",
  deadlineMs: codexCli.deadlineMs,
  async run(req, ctx) {
    const dir = await mkdtemp(path.join(tmpdir(), "desk-vision-codex-"));
    try {
      const file = path.join(dir, `page${EXT[mediaTypeOf(req.imageBase64)]}`);
      await writeFile(file, Buffer.from(req.imageBase64, "base64"));
      return await codexCli.run({ system: readerSystem(req), prompt: `${req.prompt}\n\nReturn only the JSON object.`, images: [file], use: req.use }, ctx);
    } finally {
      await rm(dir, { recursive: true, force: true }).catch((e) => console.warn(`[engines] codex left its temp dir ${dir}: ${e instanceof Error ? e.message : e}`));
    }
  },
  probe: () => codexCli.probe!(),
};

/** The vision providers DESK_VISION_ENGINE may name. */
export const VISION_ENGINES = ["ollama", "claude-cli", "codex"] as const;

/**
 * DESK_VISION_ENGINE picks the provider (claude-cli | codex | ollama); unset or blank is ollama, as before. A name that is
 * not one of them is passed through, so the registry refuses it as unreachable and the engine check names it.
 */
register("vision", [ollamaVision, claudeVision, codexVision], () => process.env.DESK_VISION_ENGINE?.trim() || "ollama");

export async function vision<T = unknown>(req: VisionRequest): Promise<EngineResult<T>> {
  return answer<VisionRequest, T>(provider("vision"), req, "vision");
}
