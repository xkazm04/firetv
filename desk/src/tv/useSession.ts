"use client";
import { useEffect, useRef, useState } from "react";
import type { Event, Session } from "@/lib/session/store";

/** The wait before the stream reopens, by consecutive failures since the last message: none yet is zero, then 1.5 s, doubling, capped at 30 s. */
export const reopenDelay = (attempt: number): number => attempt <= 0 ? 0 : Math.min(30000, 1500 * 2 ** (attempt - 1));

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
    let es: EventSource | null = null, dead = false, attempt = 0;
    // the stream's trace for a person at the devtools (window.__desk.events): the last TRACE_MAX lines, since the clock
    // alone sends a message a second and an evening would otherwise keep every one
    const TRACE_MAX = 200;
    const dbg = (window as unknown as { __desk: { events: string[] } }).__desk = { events: [] as string[] };
    const trace = (line: string) => { dbg.events.push(line); if (dbg.events.length > TRACE_MAX) dbg.events.splice(0, dbg.events.length - TRACE_MAX); };
    const open = () => {
      es = new EventSource("/api/session/stream");
      trace("open " + Date.now());
      es.onmessage = (m) => { trace("msg " + m.data.length); try { setS(JSON.parse(m.data)); attempt = 0; setConnected(true); } catch (e) { trace("parse " + String(e)); } };
      es.onerror = () => { trace("error rs=" + es?.readyState); setConnected(false); es?.close(); if (!dead) { attempt += 1; setTimeout(open, reopenDelay(attempt)); } };
    };
    reopen.current = () => { if (dead) return; trace("reconnect"); es?.close(); open(); };
    open();
    return () => { dead = true; trace("cleanup"); es?.close(); };
  }, []);
  const post = useRef(async (e: Event): Promise<Response> => fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) }));
  const reconnect = useRef(() => reopen.current());
  return { s, connected, post: post.current, reconnect: reconnect.current };
}

export const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
export const call = (url: string, body: unknown) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
