/**
 * Embedding engine — nomic-embed-text on Ollama. Used to place lesson windows and a problem's
 * concept in one space, so "watch the bit that explains this" is a nearest-neighbour rather than
 * a word match (the PoC's plain term matching scored 4/9 for exactly that reason).
 *
 * Later: Bedrock embeddings, same request shape.
 */
import { provider, register } from "./registry";
import { EngineError, type EmbedRequest, type EngineResult, type Provider } from "./types";

const HOST = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");
const MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

export const ollamaEmbed: Provider<EmbedRequest, unknown> = {
  name: "ollama",
  async run(req) {
    const reported = `ollama/${MODEL}`;
    const res = await fetch(`${HOST}/api/embed`, { method: "POST", body: JSON.stringify({ model: MODEL, input: req.texts }) })
      .catch((e: Error) => { throw new EngineError("unreachable", reported, `ollama is not reachable: ${e.message}`); });
    if (!res.ok) throw new EngineError("exit", reported, `ollama embed ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return { raw: data.embeddings, provider: reported };
  },
};

register("embed", [ollamaEmbed], () => "ollama");

/** One vector per text, in order, or EngineError("shape"). */
export async function embed(req: EmbedRequest): Promise<EngineResult<number[][]>> {
  const started = Date.now(), p = provider("embed");
  const a = await p.run(req), name = a.provider ?? p.name;
  const v = a.raw;
  if (!Array.isArray(v) || v.length !== req.texts.length || !v.every((x) => Array.isArray(x) && x.length && x.every((n) => typeof n === "number")))
    throw new EngineError("shape", name, `${name} did not answer with ${req.texts.length} vector(s).`, "");
  return { json: v as number[][], provider: name, ms: Date.now() - started };
}

export function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
