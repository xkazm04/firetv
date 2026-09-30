import { speak, voiceConfigured } from "@/lib/engines/voice";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  let text: unknown;
  try {
    const body = await req.json();
    text = body && typeof body === "object" ? (body as { text?: unknown }).text : undefined;
  } catch { return new Response("Send the line as JSON.", { status: 400 }); }
  if (typeof text !== "string" || !text.trim()) return new Response("Send a line to speak.", { status: 400 });
  if (!voiceConfigured()) return new Response("voice not configured", { status: 503 });
  try {
    const { json, provider } = await speak({ text: text.slice(0, 900) });
    // Piper returns WAV, ElevenLabs MP3. Announce what was actually synthesised.
    const type = provider.startsWith("piper/") ? "audio/wav" : "audio/mpeg";
    return new Response(new Uint8Array(json), { headers: { "Content-Type": type, "Cache-Control": "no-store" } });
  } catch (e) {
    // the engine's own words stay in the server log: they can carry an upstream reply or a key fragment
    console.error("Speech synthesis failed:", e instanceof Error ? e.message : e);
    return new Response("The voice could not say that line.", { status: 502 });
  }
}
