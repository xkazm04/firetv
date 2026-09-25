"use client";
import { useEffect, useRef, useState } from "react";
import type { Event, Session } from "@/lib/session/store";

/**
 * Subscribe to the one session over SSE; post events back. Both surfaces use this. The server draws each caller's
 * own view (s.viewer: the TV, a phone, or a guest in the lobby), fixed when the stream opens - so after a join or a
 * leave the page calls reconnect() and the stream reopens as what it now is. post() hands back the Response: a
 * join that is refused says why.
 */
export function useSession() {
  const [s, setS] = useState<Session | null>(null);
  const [connected, setConnected] = useState(false);
  const reopen = useRef<() => void>(() => {});
  useEffect(() => {
    let es: EventSource | null = null, dead = false;
    const dbg = (window as unknown as { __desk: Record<string, unknown> }).__desk = { events: [] as string[] };
    const open = () => {
      es = new EventSource("/api/session/stream");
      dbg.events.push("open " + Date.now());
      es.onmessage = (m) => { dbg.events.push("msg " + m.data.length); try { setS(JSON.parse(m.data)); setConnected(true); } catch (e) { dbg.events.push("parse " + String(e)); } };
      es.onerror = () => { dbg.events.push("error rs=" + es?.readyState); setConnected(false); es?.close(); if (!dead) setTimeout(open, 1500); };
    };
    reopen.current = () => { if (dead) return; dbg.events.push("reconnect"); es?.close(); open(); };
    open();
    return () => { dead = true; dbg.events.push("cleanup"); es?.close(); };
  }, []);
  const post = useRef(async (e: Event): Promise<Response> => fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) }));
  const reconnect = useRef(() => reopen.current());
  return { s, connected, post: post.current, reconnect: reconnect.current };
}

export const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
export const call = (url: string, body: unknown) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
