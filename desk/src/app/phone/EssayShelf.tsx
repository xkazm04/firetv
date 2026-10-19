"use client";
/**
 * The learner's shelf on the phone's Essay tab (v2 P3; lib/session/texts.ts, /api/texts): the pieces they kept, by
 * title and counts, never shown on the TV. Open loads the latest version into the Essay panel; Delete removes one;
 * "Delete everything I kept" removes all of it (a second press confirms). "Forget tonight's paragraph" is always there and clears
 * only the reading in the session, so a paragraph-only evening can be removed too. The one-time notice (TextNotice) says where
 * the text goes before the first piece is kept; until it is accepted the shelf shows that same line (noticed/notice from GET /api/texts).
 */
import { useCallback, useEffect, useState } from "react";

export interface ShelfCard { id: string; format: string; title: string; versions: number; paragraphs: number; updated: number; }

const FORMAT_LABEL: Record<string, string> = { message: "Message", email: "Email", essay: "Essay" };
const when = (at: number) => new Date(at).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export function EssayShelf({ learnerId, refresh, onOpen, onGone }: { learnerId: string | undefined; refresh: number; onOpen: (id: string, text: string) => void; onGone?: (id: string | "all") => void }) {
  const [cards, setCards] = useState<ShelfCard[] | null>(null);
  const [line, setLine] = useState("");
  const [sure, setSure] = useState(false);
  const [say, setSay] = useState("");
  const load = useCallback(async () => {
    try { const r = await fetch("/api/texts"); if (r.ok) { const j = (await r.json()) as { pieces: ShelfCard[]; noticed?: boolean; notice?: string }; setCards(j.pieces); setLine(j.noticed === false && j.notice ? j.notice : ""); } else setCards(null); }
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
  const remove = async (q: string, done: string, gone?: string) => {
    try { const r = await fetch(`/api/texts?${q}`, { method: "DELETE" }); setSay(r.ok ? done : "The desk could not delete that."); if (r.ok && gone) onGone?.(gone); }
    catch { setSay("That did not reach the desk."); }
    setSure(false); void load();
  };
  if (!cards) return null;
  return (
    <div className="pshelf" data-role="essay-shelf">
      <b>Your shelf</b>
      {line && <p data-role="essay-shelf-notice">{line}</p>}
      {cards.length ? <ul>{cards.map((c) => (
        <li key={c.id} data-role="essay-shelf-piece">
          <span><b>{c.title}</b><small data-role="essay-shelf-format">{FORMAT_LABEL[c.format] ?? c.format} · {c.paragraphs} paragraph{c.paragraphs === 1 ? "" : "s"} · version {c.versions} · {when(c.updated)}</small></span>
          <button className="pbtn" data-secondary="true" onClick={() => void open(c.id)}>Open</button>
          <button className="pbtn" data-secondary="true" aria-label={`Delete ${c.title}`} onClick={() => void remove(`id=${encodeURIComponent(c.id)}`, "Deleted.", c.id)}>Delete</button>
        </li>))}</ul> : <p>Nothing kept yet. Pieces you read on the TV with "Keep it on my shelf" land here.</p>}
      {cards.length > 0 && (sure
        ? <button className="pbtn" data-role="essay-delete-all" onClick={() => void remove("all=1", "Everything you kept is deleted.", "all")}>Yes, delete everything I kept</button>
        : <button className="pbtn" data-secondary="true" data-role="essay-delete-all" onClick={() => setSure(true)}>Delete everything I kept</button>)}
      <button className="pbtn" data-secondary="true" data-role="essay-forget-paragraph" onClick={() => void remove("paragraph=1", "Tonight's paragraph is gone from the desk and the TV.")}>Forget tonight's paragraph</button>
      {say && <p data-role="essay-shelf-note" aria-live="polite">{say}</p>}
    </div>
  );
}

/** Shown once per learner before their first kept piece; the words come from the server (texts.ts TEXT_NOTICE). */
export function TextNotice({ text, mode = "piece", onAccept, onDecline }: { text: string; mode?: "paragraph" | "piece"; onAccept: () => void; onDecline: () => void }) {
  const reading = mode === "paragraph";
  return (
    <div className="pnotice" role="dialog" aria-label={reading ? "Before the desk reads your writing" : "Before you keep a piece"} data-role="essay-notice">
      <p>{text}</p>
      <div className="field">
        <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={onAccept}>{reading ? "I understand, read it" : "I understand, keep it"}</button>
        <button className="pbtn" data-secondary="true" onClick={onDecline}>{reading ? "Not now" : "Read without keeping"}</button>
      </div>
    </div>
  );
}
