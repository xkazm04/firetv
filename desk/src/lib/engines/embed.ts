/**
 * Embedding engine — nomic-embed-text on Ollama. Used to place lesson windows and a problem's
 * concept in one space, so "watch the bit that explains this" is a nearest-neighbour rather than
 * a word match (the PoC's plain term matching scored 4/9 for exactly that reason).
 *
 * Later: Bedrock embeddings, same request shape.
 */
import type { EmbedRequest, EngineResult } from "./types";

const HOST = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");
const MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

export async function embed(req: EmbedRequest): Promise<EngineResult<number[][]>> {
  const started = Date.now();
  const res = await fetch(`${HOST}/api/embed`, { method: "POST", body: JSON.stringify({ model: MODEL, input: req.texts }) });
  if (!res.ok) throw new Error(`ollama embed ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return { json: data.embeddings as number[][], provider: `ollama/${MODEL}`, ms: Date.now() - started };
}

export function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
