/**
 * Vision engine — Qwen on Ollama. The same call shape the PoCs used; `format: schema` is enforced
 * in the decoder, and vision() still checks the answer against it, as for every provider.
 * `think: false` first, retried without for models that reject the key.
 *
 * What it can be asked: read a page, enumerate items, say what is inside a drawn ring. What it must
 * not be asked: to count, to do arithmetic, to see a process in one frame (FRAME-ANALYSIS-LESSONS).
 *
 * Later: Bedrock vision, same request shape.
 */
import { provider, register } from "./registry";
import { answer } from "./shape";
import { EngineError, type EngineResult, type Provider, type VisionRequest } from "./types";

const HOST = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");
const MODEL = process.env.OLLAMA_VISION_MODEL || "qwen3.8:27b";

/** Qwen on Ollama. It only produces the answer; vision() parses and checks it. */
export const ollamaVision: Provider<VisionRequest, unknown> = {
  name: "ollama",
  async run(req) {
    const reported = `ollama/${MODEL}`;
    const body: Record<string, unknown> = {
      model: MODEL, stream: false, options: { temperature: 0, num_ctx: 16384 },
      messages: [{ role: "user", content: req.prompt, images: [req.imageBase64] }],
    };
    if (req.schema) body.format = req.schema;
    const post = (b: Record<string, unknown>) => fetch(`${HOST}/api/chat`, { method: "POST", body: JSON.stringify(b) })
      .catch((e: Error) => { throw new EngineError("unreachable", reported, `ollama is not reachable: ${e.message}`); });
    let res = await post({ ...body, think: false });
    if (!res.ok) res = await post(body);
    if (!res.ok) throw new EngineError("exit", reported, `ollama ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    const content: string = data.message?.content ?? "";
    return { raw: content, provider: reported, audit: content.slice(0, 2000) };
  },
};

register("vision", [ollamaVision], () => "ollama");

export async function vision<T = unknown>(req: VisionRequest): Promise<EngineResult<T>> {
  return answer<VisionRequest, T>(provider("vision"), req);
}
