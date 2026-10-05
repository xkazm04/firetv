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
import { EngineError, type EngineResult, type ProbeResult, type Provider, type VisionRequest } from "./types";

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
    if (!res.ok) res = await post(body);
    if (!res.ok) throw new EngineError("exit", reported, `ollama ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    const content: string = data.message?.content ?? "";
    return { raw: content, provider: reported, audit: content.slice(0, 2000) };
  },
  probe: () => ollamaProbe(HOST, MODEL),
};

register("vision", [ollamaVision], () => "ollama");

export async function vision<T = unknown>(req: VisionRequest): Promise<EngineResult<T>> {
  return answer<VisionRequest, T>(provider("vision"), req, "vision");
}
