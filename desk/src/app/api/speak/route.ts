import { speak, voiceConfigured } from "@/lib/engines/voice";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { text } = (await req.json()) as { text: string };
  if (!voiceConfigured()) return new Response("voice not configured", { status: 503 });
  try {
    const { json, provider } = await speak({ text: text.slice(0, 900) });
    // Piper returns WAV, ElevenLabs MP3. Announce what was actually synthesised.
    const type = provider.startsWith("piper/") ? "audio/wav" : "audio/mpeg";
    return new Response(new Uint8Array(json), { headers: { "Content-Type": type, "Cache-Control": "no-store" } });
  } catch (e) { return new Response(String(e), { status: 502 }); }
}
