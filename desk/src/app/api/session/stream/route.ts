/** Server-Sent Events: the TV and the phone see the same session the moment it changes. */
import { getSession, subscribe } from "@/lib/session/store";

export const dynamic = "force-dynamic";
export async function GET() {
  const enc = new TextEncoder();
  let unsub = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const send = (s: unknown) => { try { controller.enqueue(enc.encode(`data: ${JSON.stringify(s)}\n\n`)); } catch {} };
      send(getSession());
      unsub = subscribe(send);
      const ping = setInterval(() => { try { controller.enqueue(enc.encode(": ping\n\n")); } catch { clearInterval(ping); } }, 15000);
    },
    cancel() { unsub(); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
