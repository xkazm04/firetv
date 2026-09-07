/**
 * Vision engine — Qwen on Ollama. The same call shape the PoCs used; `format: schema` is enforced
 * in the decoder. `think: false` first, retried without for models that reject the key.
 *
 * What it can be asked: read a page, enumerate items, say what is inside a drawn ring. What it must
 * not be asked: to count, to do arithmetic, to see a process in one frame (FRAME-ANALYSIS-LESSONS).
 *
 * Later: Bedrock vision, same request shape.
 */
import type { EngineResult, VisionRequest } from "./types";

const HOST = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");
const MODEL = process.env.OLLAMA_VISION_MODEL || "qwen3.8:27b";

export async function vision<T = unknown>(req: VisionRequest): Promise<EngineResult<T>> {
  const started = Date.now();
  const body: Record<string, unknown> = {
    model: MODEL, stream: false, options: { temperature: 0, num_ctx: 16384 },
    messages: [{ role: "user", content: req.prompt, images: [req.imageBase64] }],
  };
  if (req.schema) body.format = req.schema;
  let res = await fetch(`${HOST}/api/chat`, { method: "POST", body: JSON.stringify({ ...body, think: false }) });
  if (!res.ok) res = await fetch(`${HOST}/api/chat`, { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`ollama ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const content: string = data.message?.content ?? "";
  let json: T;
  try { json = JSON.parse(content) as T; } catch { json = content as unknown as T; }
  return { json, provider: `ollama/${MODEL}`, ms: Date.now() - started, raw: content.slice(0, 2000) };
}
