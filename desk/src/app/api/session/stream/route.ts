/**
 * Server-Sent Events: the TV and the phone see the same session the moment it changes - each as it may see it
 * (lib/session/pairing.ts view), asked again for every message, so a phone whose pin has turned over is a guest
 * from the next message on. An in-process call (no x-desk-role) gets the session itself.
 */
import { getSession, subscribe, type Session } from "@/lib/session/store";
import { createHash } from "node:crypto";
import { PHONE_COOKIE, cookiesOf, liveRole, roleFrom, view } from "@/lib/session/pairing";

export const dynamic = "force-dynamic";

/**
 * At most this many guest streams are open at once, desk-wide: a guest is anyone on the network, so the oldest is let go
 * when a ninth arrives (it reopens by itself). An in-process stream is not counted, and the TV and each phone have their
 * own cap (DEVICE_STREAMS). The list is on the global object, so a dev reload keeps it.
 */
const GUEST_STREAMS = 8;
/**
 * At most this many streams are open at once for the TV, and for each listed phone (its cookie, so a copied cookie shares
 * its phone's): every open stream is called on every dispatch, so the oldest is let go when a fifth arrives (it reopens by
 * itself). Guests and in-process streams are not counted here. The map is on the global object, so a dev reload keeps it.
 */
const DEVICE_STREAMS = 4;
/** A stream whose reader has this many messages unread is let go: a phone that went to sleep, which reopens by itself. */
const UNREAD = 32;
const guests = () => { const g = globalThis as unknown as { __deskGuestStreams?: (() => void)[] }; return (g.__deskGuestStreams ??= []); };
/** Device key (the TV, or a phone cookie's fingerprint) to that device's close functions, in opening order. */
const devices = () => { const g = globalThis as unknown as { __deskDeviceStreams?: Map<string, (() => void)[]> }; return (g.__deskDeviceStreams ??= new Map()); };
const deviceKey = (req: Request | undefined, role: string | null) =>
  role === "tv" ? "tv" : role === "phone" ? createHash("sha256").update(cookiesOf(req!).get(PHONE_COOKIE)?.value ?? "").digest("hex") : null;
// Two signatures: the one Next's generated route types check (a Request) and the in-process one (none).
export async function GET(): Promise<Response>;
export async function GET(req: Request): Promise<Response>;
export async function GET(req?: Request) {
  const enc = new TextEncoder();
  let unsub = () => {};
  let ping: ReturnType<typeof setInterval> | undefined;
  let ended = false;
  let release = () => {};
  const stream = new ReadableStream({
    start(controller) {
      function close() { release(); try { controller.close(); } catch { /* the client closed it first: nothing is left to close */ } }
      // the role is read once, as the stream opens: a stream stays in the list it joined
      const role = roleFrom(req), key = deviceKey(req, role);
      release = () => {
        ended = true; unsub(); clearInterval(ping);
        const list = guests(), i = list.indexOf(close); if (i >= 0) list.splice(i, 1);
        if (key !== null) { const own = devices().get(key), j = own ? own.indexOf(close) : -1; if (own && j >= 0) { own.splice(j, 1); if (!own.length) devices().delete(key); } }
      };
      if (role === "guest") { const list = guests(); while (list.length >= GUEST_STREAMS) list.shift()!(); list.push(close); }
      else if (key !== null) { const own = devices().get(key) ?? []; while (own.length >= DEVICE_STREAMS) own.shift()!(); own.push(close); devices().set(key, own); }
      const send = (s: Session) => {
        // the message is drawn outside the enqueue's catch: a throw here is a fault to name, and the stream ends rather than sit open and silent
        let chunk: Uint8Array;
        try { chunk = enc.encode(`data: ${JSON.stringify(view(s, liveRole(req)))}\n\n`); }
        catch (e) { console.error(`desk session stream: could not draw a message, closing the stream (${e instanceof Error ? e.message : e})`); close(); return; }
        if ((controller.desiredSize ?? 1) <= 0) { close(); return; }
        try { controller.enqueue(chunk); } catch { release(); }
      };
      unsub = subscribe(send);
      send(getSession());
      if (ended) return;
      ping = setInterval(() => { if ((controller.desiredSize ?? 1) <= 0) { close(); return; } try { controller.enqueue(enc.encode(": ping\n\n")); } catch { clearInterval(ping); } }, 15000);
    },
    cancel() { release(); },
  }, new CountQueuingStrategy({ highWaterMark: UNREAD }));
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
