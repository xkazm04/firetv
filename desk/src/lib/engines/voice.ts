/**
 * Voice engine — ElevenLabs text-to-speech, temporarily. Returns MP3 bytes the TV plays.
 * Listening is done in the browser (Web Speech) for now; a server path can come later.
 *
 * Later: Amazon Polly, same request shape.
 */
import type { EngineResult, SpeakRequest } from "./types";

const KEY = process.env.ELEVENLABS_API_KEY || "";
// A calm, clear voice; overridable. Voice ids are ElevenLabs' public library ids.
const VOICE = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

export function voiceConfigured() { return Boolean(KEY); }

export async function speak(req: SpeakRequest): Promise<EngineResult<Buffer>> {
  const started = Date.now();
  if (!KEY) throw new Error("ELEVENLABS_API_KEY is not set");
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${req.voice || VOICE}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: req.text, model_id: "eleven_turbo_v2_5", voice_settings: { stability: 0.5, similarity_boost: 0.7 } }),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const audio = Buffer.from(await res.arrayBuffer());
  return { json: audio, provider: "elevenlabs/turbo-v2.5", ms: Date.now() - started };
}
