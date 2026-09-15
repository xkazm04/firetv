/** Server-Sent Events: the TV and the phone see the same session the moment it changes. */
import { getSession, subscribe } from "@/lib/session/store";

export const dynamic = "force-dynamic";
export async function GET(req?: Request) {
  const enc = new TextEncoder();
  let unsub = () => {};
  let ping: ReturnType<typeof setInterval> | undefined;
  /** A disconnect ends the subscription and the keep-alive timer together, whichever way it arrives. */
  const stop = () => { unsub(); unsub = () => {}; if (ping !== undefined) { clearInterval(ping); ping = undefined; } };
  const stream = new ReadableStream({
    start(controller) {
      const send = (s: unknown) => { try { controller.enqueue(enc.encode(`data: ${JSON.stringify(s)}\n\n`)); } catch {} };
      send(getSession());
      unsub = subscribe(send);
      ping = setInterval(() => { try { controller.enqueue(enc.encode(": ping\n\n")); } catch { stop(); } }, 15000);
      req?.signal?.addEventListener("abort", stop, { once: true });
    },
    cancel() { stop(); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
