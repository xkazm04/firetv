/**
 * Listening engine — speech to text, over the ElevenLabs speech-to-text request shape.
 *
 *   POST {STT_URL}/v1/speech-to-text   multipart: file, model_id   →   { text, language_code }
 *
 * Default: gravitone on this machine (STT_URL, default http://localhost:8080) — faster-whisper on CPU,
 * from kiro/gravitone in the registry fleet. Nothing leaves the machine, which is the registry's rule for
 * capture (see voice.ts). Pointing STT_URL at https://api.elevenlabs.io sends the audio to ElevenLabs
 * Scribe with ELEVENLABS_API_KEY: a choice someone makes, never a silent fallback.
 *
 * Today only the web desk's temporary test bar uses it; the phone still listens through the browser.
 */
import type { EngineResult } from "./types";

const base = () => (process.env.STT_URL || "http://localhost:8080").replace(/\/+$/, "");
const cloud = () => /api\.elevenlabs\.io/.test(base());
const provider = () => (cloud() ? "elevenlabs/scribe_v1" : "gravitone/faster-whisper");
const headers = (): Record<string, string> => {
  const key = cloud() ? process.env.ELEVENLABS_API_KEY : process.env.STT_API_KEY;
  return key ? { "xi-api-key": key } : {};
};

export interface ListenStatus { reachable: boolean; provider: string; local: boolean; }

/** Whether a recording sent now would reach a transcriber. Two seconds, never longer. */
export async function listenStatus(): Promise<ListenStatus> {
  try {
    const r = await fetch(cloud() ? `${base()}/v1/models` : `${base()}/health`, { headers: headers(), signal: AbortSignal.timeout(2000) });
    return { reachable: r.ok, provider: provider(), local: !cloud() };
  } catch {
    return { reachable: false, provider: provider(), local: !cloud() };
  }
}

/** The language is detected, not pinned: a learner may answer in Czech or Ukrainian, and that is a signal. */
export async function listen(audio: Blob, filename: string): Promise<EngineResult<{ text: string; language?: string }>> {
  const started = Date.now();
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model_id", "scribe_v1");
  const r = await fetch(`${base()}/v1/speech-to-text`, { method: "POST", body: form, headers: headers(), signal: AbortSignal.timeout(120000) });
  if (!r.ok) throw new Error(`Speech-to-text answered ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { text?: unknown; language_code?: unknown };
  return { json: { text: typeof j.text === "string" ? j.text.trim() : "", language: typeof j.language_code === "string" ? j.language_code : undefined }, provider: provider(), ms: Date.now() - started };
}
