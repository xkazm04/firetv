/**
 * Server-Sent Events: the TV and the phone see the same session the moment it changes - each as it may see it
 * (lib/session/pairing.ts view), asked again for every message, so a phone whose pin has turned over is a guest
 * from the next message on. An in-process call (no x-desk-role) gets the session itself.
 */
import { getSession, subscribe, type Session } from "@/lib/session/store";
import { liveRole, view } from "@/lib/session/pairing";

export const dynamic = "force-dynamic";
export async function GET(req?: Request) {
  const enc = new TextEncoder();
  let unsub = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const send = (s: Session) => { try { controller.enqueue(enc.encode(`data: ${JSON.stringify(view(s, liveRole(req)))}\n\n`)); } catch {} };
      send(getSession());
      unsub = subscribe(send);
      const ping = setInterval(() => { try { controller.enqueue(enc.encode(": ping\n\n")); } catch { clearInterval(ping); } }, 15000);
    },
    cancel() { unsub(); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
