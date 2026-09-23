/**
 * Voice engine — one `speak()`, a preference chain behind it. Returns audio bytes the TV plays.
 *
 * 1. Piper, on this machine, when PIPER_BIN and PIPER_VOICE are both set. Provider: piper/<voice>.
 * 2. ElevenLabs, when ELEVENLABS_API_KEY is set. Provider: elevenlabs/turbo-v2.5.
 * 3. Neither — throw, so the browser's own speech synthesis in the TV page takes over.
 *
 * The registry's rule: SYNTHESIS may honestly run either locally or in the cloud — a spoken line
 * carries no learner's face, page or name, so the cloud is a fair place for it. CAPTURE is the
 * other way round and defaults to on-device: the microphone and the camera stay on the machine
 * unless someone chooses otherwise.
 *
 * OPEN GATE: the Piper voice file (en_US-lessac-medium) ships no licence field in its .onnx.json —
 * the manifest has audio/dataset/espeak/inference/language and nothing about terms. Shipping audio
 * synthesised from it needs that licence found and checked first. Local development is fine.
 *
 * Listening is done in the browser (Web Speech) for now; a server path can come later.
 * Later: Amazon Polly, same request shape.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { provider, register } from "./registry";
import { EngineError, type EngineResult, type Provider, type SpeakRequest } from "./types";

const KEY = process.env.ELEVENLABS_API_KEY || "";
// A calm, clear voice; overridable. Voice ids are ElevenLabs' public library ids.
const VOICE = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
// The local path. Both must be set, or Piper is simply not on the chain — no half-configured guess.
const PIPER = process.env.PIPER_BIN || "";
const PIPER_VOICE = process.env.PIPER_VOICE || "";

const piperReady = () => Boolean(PIPER && PIPER_VOICE);
/** The voice's own name, as the provider string reports it: en_US-lessac-medium. */
const voiceName = (p: string) => path.basename(p).replace(/\.onnx$/i, "");

export function voiceConfigured() { return piperReady() || Boolean(KEY); }

/** Piper writes a WAV to a file; it takes the text on stdin. Nothing leaves the machine. */
async function piperSpeak(text: string): Promise<Buffer> {
  const dir = mkdtempSync(path.join(tmpdir(), "desk-say-"));
  const out = path.join(dir, "say.wav");
  try {
    await new Promise<void>((resolve, reject) => {
      const p = spawn(PIPER, ["-m", PIPER_VOICE, "-f", out], { windowsHide: true });
      let err = "";
      p.stderr.on("data", (d: Buffer) => { err += d.toString(); });
      p.on("error", reject);
      p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`piper exited ${code}: ${err.slice(-300)}`))));
      p.stdin.write(text); p.stdin.end();
    });
    return readFileSync(out);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

export const piper: Provider<SpeakRequest, Buffer> = {
  name: "piper",
  async run(req) { return { raw: await piperSpeak(req.text), provider: `piper/${voiceName(PIPER_VOICE)}` }; },
};

export const elevenlabs: Provider<SpeakRequest, Buffer> = {
  name: "elevenlabs",
  async run(req) {
    const reported = "elevenlabs/turbo-v2.5";
    if (!KEY) throw new EngineError("unreachable", reported, "no voice engine: set PIPER_BIN and PIPER_VOICE, or ELEVENLABS_API_KEY");
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${req.voice || VOICE}?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text: req.text, model_id: "eleven_turbo_v2_5", voice_settings: { stability: 0.5, similarity_boost: 0.7 } }),
    }).catch((e: Error) => { throw new EngineError("unreachable", reported, `elevenlabs is not reachable: ${e.message}`); });
    if (!res.ok) throw new EngineError("exit", reported, `elevenlabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return { raw: Buffer.from(await res.arrayBuffer()), provider: reported };
  },
};

// The preference chain: Piper when it is fully configured, else ElevenLabs (which says so when it has no key).
register("speak", [piper, elevenlabs], () => (piperReady() ? "piper" : "elevenlabs"));

export async function speak(req: SpeakRequest): Promise<EngineResult<Buffer>> {
  const started = Date.now(), p = provider("speak");
  const a = await p.run(req);
  return { json: a.raw, provider: a.provider ?? p.name, ms: Date.now() - started };
}
