/**
 * Server-Sent Events: the TV and the phone see the same session the moment it changes - each as it may see it
 * (lib/session/pairing.ts view), asked again for every message, so a phone whose pin has turned over is a guest
 * from the next message on. An in-process call (no x-desk-role) gets the session itself.
 */
import { getSession, subscribe, type Session } from "@/lib/session/store";
import { liveRole, view } from "@/lib/session/pairing";

export const dynamic = "force-dynamic";
// Two signatures: the one Next's generated route types check (a Request) and the in-process one (none).
export async function GET(): Promise<Response>;
export async function GET(req: Request): Promise<Response>;
export async function GET(req?: Request) {
  const enc = new TextEncoder();
  let unsub = () => {};
  let ping: ReturnType<typeof setInterval> | undefined;
  let ended = false;
  const stream = new ReadableStream({
    start(controller) {
      const release = () => { ended = true; unsub(); clearInterval(ping); };
      const close = () => { release(); try { controller.close(); } catch {} };
      const send = (s: Session) => {
        // the message is drawn outside the enqueue's catch: a throw here is a fault to name, and the stream ends rather than sit open and silent
        let chunk: Uint8Array;
        try { chunk = enc.encode(`data: ${JSON.stringify(view(s, liveRole(req)))}\n\n`); }
        catch (e) { console.error(`desk session stream: could not draw a message, closing the stream (${e instanceof Error ? e.message : e})`); close(); return; }
        try { controller.enqueue(chunk); } catch { release(); }
      };
      unsub = subscribe(send);
      send(getSession());
      if (ended) return;
      ping = setInterval(() => { try { controller.enqueue(enc.encode(": ping\n\n")); } catch { clearInterval(ping); } }, 15000);
    },
    cancel() { ended = true; unsub(); clearInterval(ping); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
