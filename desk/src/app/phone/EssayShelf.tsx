"use client";
/**
 * The learner's shelf on the phone's Essay tab (v2 P3; lib/session/texts.ts, /api/texts): the pieces they kept, by
 * title and counts, never shown on the TV. Open loads the latest version into the Essay panel; Delete removes one;
 * "Delete everything I kept" removes all of it (a second press confirms). The one-time notice (TextNotice) says where
 * the text goes before the first piece is kept.
 */
import { useCallback, useEffect, useState } from "react";

export interface ShelfCard { id: string; format: string; title: string; versions: number; paragraphs: number; updated: number; }

const when = (at: number) => new Date(at).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export function EssayShelf({ learnerId, refresh, onOpen }: { learnerId: string | undefined; refresh: number; onOpen: (id: string, text: string) => void }) {
  const [cards, setCards] = useState<ShelfCard[] | null>(null);
  const [sure, setSure] = useState(false);
  const [say, setSay] = useState("");
  const load = useCallback(async () => {
    try { const r = await fetch("/api/texts"); if (r.ok) setCards(((await r.json()) as { pieces: ShelfCard[] }).pieces); else setCards(null); }
    catch { setCards(null); }
  }, []);
  useEffect(() => { setSure(false); setSay(""); void load(); }, [load, learnerId, refresh]);
  const open = async (id: string) => {
    try {
      const r = await fetch(`/api/texts?id=${encodeURIComponent(id)}`);
      const j = (await r.json()) as { versions?: { text: string }[]; error?: string };
      if (r.ok && j.versions?.length) onOpen(id, j.versions[j.versions.length - 1].text); else setSay(j.error ?? "That piece could not be opened.");
    } catch { setSay("That did not reach the desk."); }
  };
  const remove = async (q: string, done: string) => {
    try { const r = await fetch(`/api/texts?${q}`, { method: "DELETE" }); setSay(r.ok ? done : "The desk could not delete that."); }
    catch { setSay("That did not reach the desk."); }
    setSure(false); void load();
  };
  if (!cards) return null;
  return (
    <div className="pshelf" data-role="essay-shelf">
      <b>Your shelf</b>
      {cards.length ? <ul>{cards.map((c) => (
        <li key={c.id} data-role="essay-shelf-piece">
          <span><b>{c.title}</b><small>{c.paragraphs} paragraph{c.paragraphs === 1 ? "" : "s"} · version {c.versions} · {when(c.updated)}</small></span>
          <button className="pbtn" data-secondary="true" onClick={() => void open(c.id)}>Open</button>
          <button className="pbtn" data-secondary="true" aria-label={`Delete ${c.title}`} onClick={() => void remove(`id=${encodeURIComponent(c.id)}`, "Deleted.")}>Delete</button>
        </li>))}</ul> : <p>Nothing kept yet. Pieces you read on the TV with "Keep it on my shelf" land here.</p>}
      {cards.length > 0 && (sure
        ? <button className="pbtn" data-role="essay-delete-all" onClick={() => void remove("all=1", "Everything you kept is deleted.")}>Yes, delete everything I kept</button>
        : <button className="pbtn" data-secondary="true" data-role="essay-delete-all" onClick={() => setSure(true)}>Delete everything I kept</button>)}
      {say && <p data-role="essay-shelf-note" aria-live="polite">{say}</p>}
    </div>
  );
}

/** Shown once per learner before their first kept piece; the words come from the server (texts.ts TEXT_NOTICE). */
export function TextNotice({ text, onAccept, onDecline }: { text: string; onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="pnotice" role="dialog" aria-label="Before you keep a piece" data-role="essay-notice">
      <p>{text}</p>
      <div className="field">
        <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={onAccept}>I understand, keep it</button>
        <button className="pbtn" data-secondary="true" onClick={onDecline}>Read without keeping</button>
      </div>
    </div>
  );
}
