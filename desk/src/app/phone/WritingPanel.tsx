"use client";
/**
 * The phone's Writing panel (docs/concepts/TV-WRITING-SCREEN-2026-10-21.md): the answer to the TV's `writing` ask. The TV
 * shows the prompt, the note and the progress; the phone owns the typed text. Before the note it sends the paragraph to
 * /api/writing/coach, after it the revision to /api/writing/finish, each naming the open ask (`askId`): the ask door
 * (lib/session/phoneAsk.ts) refuses a send for any other ask, of any other kind. A refusal the desk words (too short, no
 * change) leaves the ask open and the text here, to fix and send again. Cancel is the bar's (phoneBar.ts PANEL_SUBMITS).
 */
import { useState } from "react";
import type { Ask, Session } from "@/lib/session/store";
import { promptById } from "@/lib/writing/prompts";
import { deskLine } from "./panelFor";

/** Where the phone's text goes at this step of the episode, and the name of its Send. */
export function writingSend(s: Pick<Session, "writingTv">): { url: string; field: "draft" | "revision"; label: string } {
  return s.writingTv?.stage === "coached"
    ? { url: "/api/writing/finish", field: "revision", label: "Send revision" }
    : { url: "/api/writing/coach", field: "draft", label: "Send paragraph" };
}

export function WritingPanel({ s, ask }: { s: Session; ask: Ask }) {
  const ep = s.writingTv ?? null, prompt = promptById(ep?.promptId);
  const revising = ep?.stage === "coached";
  const [text, setText] = useState(revising ? ep?.draft ?? "" : "");
  const [line, setLine] = useState("");
  const [busy, setBusy] = useState(false);
  const to = writingSend(s);
  const send = async () => {
    setBusy(true); setLine("");
    try {
      const r = await fetch(to.url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ askId: ask.id, [to.field]: text }) });
      if (!r.ok) setLine(deskLine((await r.json().catch(() => null)) as { error?: unknown } | null, "The desk did not take that. Try again."));
    } catch { setLine("That did not reach the desk."); }
    finally { setBusy(false); }
  };
  if (!ep || !prompt) return <div className="pscreen" data-role="phone-writing"><h3>Writing</h3><p>Pick a prompt on the TV first.</p></div>;
  return <div className="pscreen" data-role="phone-writing" data-stage={ep.stage}>
    <h3>{revising ? "Revise your paragraph" : prompt.title}</h3>
    <p data-role="writing-ask">{prompt.ask}</p>
    {revising && ep.note && <p data-role="writing-note" style={{ background: "rgba(154,120,196,.16)", padding: 10, borderRadius: 8 }}><b>The note:</b> {ep.note}</p>}
    <textarea aria-label={revising ? "Your revision" : "Your paragraph"} data-role="writing-text" value={text} onChange={(e) => setText(e.target.value)}
      rows={8} style={{ width: "100%", boxSizing: "border-box", fontSize: 16, padding: 10, resize: "vertical" }} />
    <p style={{ fontSize: 13 }}>{revising ? "Change what the note asks for, then send it. The desk saves it to your record." : "At least two sentences. The TV shows one note about it."}</p>
    {line && <p role="alert" data-role="writing-refused">{line}</p>}
    <button className="pbtn" data-signal="true" data-role="writing-send" style={{ width: "100%" }} disabled={busy || ask.phase !== "open" || !text.trim()} onClick={() => void send()}>{busy ? "Sending…" : to.label}</button>
  </div>;
}
