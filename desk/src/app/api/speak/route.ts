import { speak, voiceConfigured } from "@/lib/engines/voice";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { text } = (await req.json()) as { text: string };
  if (!voiceConfigured()) return new Response("voice not configured", { status: 503 });
  try {
    const { json } = await speak({ text: text.slice(0, 900) });
    return new Response(new Uint8Array(json), { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch (e) { return new Response(String(e), { status: 502 }); }
}
