/**
 * Embedding engine — nomic-embed-text on Ollama. Used to place lesson windows and a problem's
 * concept in one space, so "watch the bit that explains this" is a nearest-neighbour rather than
 * a word match (the PoC's plain term matching scored 4/9 for exactly that reason).
 *
 * Later: Bedrock embeddings, same request shape.
 */
import { call } from "./call";
import { provider, register } from "./registry";
import { ollamaProbe } from "./vision";
import { EngineError, type EmbedRequest, type EngineResult, type Provider } from "./types";

const HOST = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");
const MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
/** The model that places the vectors: a vector cache written under another model is not reused (library/lessons). */
export const EMBED_MODEL = MODEL;

export const ollamaEmbed: Provider<EmbedRequest, unknown> = {
  name: "ollama",
  async run(req, ctx) {
    const reported = `ollama/${MODEL}`;
    const res = await fetch(`${HOST}/api/embed`, { method: "POST", body: JSON.stringify({ model: MODEL, input: req.texts }), signal: ctx?.signal })
      .catch((e: Error) => { throw new EngineError(e.name === "AbortError" ? "timeout" : "unreachable", reported, `ollama is not reachable: ${e.message}`); });
    if (!res.ok) throw new EngineError("exit", reported, `ollama embed ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return { raw: data.embeddings, provider: reported };
  },
  probe: () => ollamaProbe(HOST, MODEL),
};

register("embed", [ollamaEmbed], () => "ollama");

/** One vector per text, in order, or EngineError("shape"). */
export async function embed(req: EmbedRequest): Promise<EngineResult<number[][]>> {
  const { answer: a, provider: name, ms } = await call("embed", provider("embed"), req);
  const v = a.raw;
  if (!Array.isArray(v) || v.length !== req.texts.length || !v.every((x) => Array.isArray(x) && x.length && x.every((n) => typeof n === "number")))
    throw new EngineError("shape", name, `${name} did not answer with ${req.texts.length} vector(s).`, "");
  return { json: v as number[][], provider: name, ms };
}

export function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
