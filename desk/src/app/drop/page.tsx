"use client";
/**
 * The PC page (v2 P4, T2, T5-lite; adult plan A7): a bigger keyboard and real files for the learner's own writing.
 * Joins the desk with the TV's code, like a phone (the same cookie, the same role). Keeps a piece from a paste or a
 * .txt, .md or .docx file, as a message, an email or an essay; lists the shelf; shows the twin: how you write, the
 * exemplars it learns from (each can be left out), and the Twin Card download once it is born and the profile is Adult.
 * Ten-foot rules do not apply here: this is read at a desk.
 */
import { useCallback, useEffect, useState } from "react";
import { EssayShelf, TextNotice } from "../phone/EssayShelf";
import { joinRefusal } from "../phone/panelFor";

type Words = { dim: string; level: number; word: string }[];
interface TwinView { born: boolean; need: number; channels: { channel: string; pieces: number; born: boolean; words: Words; exemplars: { pieceId: string; text: string; included: boolean }[] }[] }
const FORMATS = [["message", "Message (chat)"], ["email", "Email"], ["essay", "Essay"]] as const;
const CH = { chat: "Messages", email: "Emails", generic: "Essays" } as Record<string, string>;
const MAX_FILE = 150 * 1024;

export default function DropPage() {
  const [joined, setJoined] = useState<boolean | null>(null);
  const [who, setWho] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [say, setSay] = useState("");
  const [format, setFormat] = useState<string>("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [docx, setDocx] = useState<{ name: string; b64: string } | null>(null);
  const [pieceId, setPieceId] = useState<string | undefined>(undefined);
  const [notice, setNotice] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [twin, setTwin] = useState<TwinView | null>(null);

  const session = useCallback(async () => {
    try { const r = await fetch("/api/session"); const j = await r.json(); setJoined(!!j.joined); setWho(j.learner?.name ?? null); } catch { setJoined(false); }
  }, []);
  const loadTwin = useCallback(async () => {
    try { const r = await fetch("/api/twin"); setTwin(r.ok ? await r.json() : null); } catch { setTwin(null); }
  }, []);
  useEffect(() => { void session(); }, [session]);
  useEffect(() => { if (joined) void loadTwin(); }, [joined, tick, loadTwin]);

  // ---- the desk's doors: a call that never came back says so, a refusal says the desk's own line, and nothing on this
  // page claims what the desk did not answer (as the phone's handlers do, app/phone/page.tsx)
  const LOST = "That did not reach the desk.";
  /** A POST to the desk: its answer, or null when it never came back. */
  const send = async (url: string, body: unknown): Promise<Response | null> => {
    try { return await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); } catch { return null; }
  };
  const errorOf = async (r: Response): Promise<string | undefined> => ((await r.json().catch(() => ({}))) as { error?: string }).error;
  /** The join as the phone joins: the same refusal lines (panelFor.ts joinRefusal) for a lost call, a wrong code, a cooldown, a desk fault. */
  const join = async () => {
    const r = await send("/api/session", { type: "join", code });
    if (r?.ok) { setSay(""); await session(); return; }
    setSay(joinRefusal({ status: r?.status, error: r ? await errorOf(r) : undefined, how: "typed" }).line);
  };
  const pick = async (f: File | undefined) => {
    if (!f) return; setSay(""); setDocx(null);
    if (f.size > MAX_FILE) return setSay("That file is too big. Keep it under 150 KB, or paste the text.");
    try {
      if (/\.docx$/i.test(f.name)) {
        const bytes = new Uint8Array(await f.arrayBuffer()); let bin = ""; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        setDocx({ name: f.name, b64: btoa(bin) }); setText(""); if (!title) setTitle(f.name.replace(/\.docx$/i, ""));
      } else if (/\.(txt|md)$/i.test(f.name)) { setText(await f.text()); if (!title) setTitle(f.name.replace(/\.(txt|md)$/i, "")); }
      else setSay("The desk reads .txt, .md and .docx files.");
    } catch { setSay("The desk could not read that file. Try another one."); }
  };
  const keep = async () => {
    setSay("");
    const body = docx ? { docx: docx.b64, format, title } : { text, format, title, source: "paste", ...(pieceId ? { id: pieceId } : {}) };
    const r = await send("/api/texts", body);
    if (!r) return setSay(LOST);
    const j = (await r.json().catch(() => ({}))) as { error?: string; notice?: boolean; id?: string };
    if (r.status === 428 && j.notice) return setNotice(j.error ?? "");
    if (!r.ok) return setSay(j.error ?? "The desk could not keep that.");
    setSay(pieceId ? "Kept as a new version." : "Kept on your shelf."); setText(""); setDocx(null); setTitle(""); setPieceId(undefined); setTick((t) => t + 1);
  };
  // the piece is posted again only once the notice is recorded: a refused notice would only bring the notice back
  const accept = async () => {
    setNotice(null);
    const r = await send("/api/texts", { notice: true });
    if (!r) return setSay(LOST);
    if (!r.ok) return setSay((await errorOf(r)) ?? "The desk did not take that. Try again.");
    await keep();
  };
  const toggle = async (id: string, out: boolean) => {
    const r = await send("/api/twin", { exclude: id, on: out });
    if (!r) return setSay(LOST);
    if (!r.ok) return setSay((await errorOf(r)) ?? "The desk could not change that. Try again.");
    setTick((t) => t + 1);
  };
  const showOnTv = async () => {
    const r = await send("/api/twin", { open: true });
    if (!r) return setSay(LOST);
    if (!r.ok) return setSay((await errorOf(r)) ?? "The desk could not open the Workroom. Try again.");
    setSay("The Workroom is on the TV.");
  };

  if (joined === null) return <main className="drop"><p>Looking for the desk…</p></main>;
  if (!joined) return (
    <main className="drop"><h1>Study Desk · your writing</h1>
      <p>Type the code the TV shows to join the desk from this computer.</p>
      <div className="row"><input inputMode="numeric" placeholder="4-digit code" value={code} onChange={(e) => setCode(e.target.value)} /><button onClick={() => void join()}>Join</button></div>
      {say && <p role="alert" className="bad">{say}</p>}
    </main>
  );
  return (
    <main className="drop" data-role="drop-page">
      <h1>Study Desk · {who ? `${who}'s writing` : "your writing"}</h1>
      {!who && <p className="bad">No one is at the desk yet. Choose a learner on the TV first.</p>}
      <section><h2>Keep a piece</h2>
        <div className="row" role="radiogroup" aria-label="What is it?" data-role="drop-format">{FORMATS.map(([id, label]) => <label key={id}><input type="radio" name="format" checked={format === id} onChange={() => setFormat(id)} /> {label}</label>)}</div>
        <div className="row"><input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label className="file">Choose a file (.txt, .md, .docx)<input type="file" accept=".txt,.md,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void pick(f); }} data-role="drop-file" /></label></div>
        {docx ? <p>Ready: <b>{docx.name}</b> (its text is read on the desk; the file is not kept).</p>
          : <textarea rows={10} placeholder="Or paste a message, an email or an essay you wrote" value={text} onChange={(e) => setText(e.target.value)} data-role="drop-text" />}
        {pieceId && <p>Editing a kept piece: keeping it again adds a new version. <button className="link" onClick={() => setPieceId(undefined)}>Keep as a new piece instead</button></p>}
        {notice !== null && <TextNotice where="pc" text={notice} onAccept={() => void accept()} onDecline={() => setNotice(null)} />}
        <div className="row"><button onClick={() => void keep()} disabled={(!docx && !text.trim()) || (!format && !pieceId)} data-role="drop-keep">Keep it</button>{say && <span aria-live="polite">{say}</span>}</div>
      </section>
      <section><EssayShelf where="pc" learnerId={who ?? undefined} refresh={tick} onOpen={(id, t) => { setPieceId(id); setText(t); setDocx(null); }} /></section>
      {twin && <section data-role="drop-twin"><h2>Your twin</h2>
        <p>Your twin learns how you write from the messages and emails you keep, and travels as a <b>Twin Card</b>: a file any tool can load to draft in your voice. The card carries up to five of your own texts as samples, you review which ones, and quoted replies from other people are left out.</p>
        {twin && twin.channels.length ? twin.channels.map((c) => (
          <div key={c.channel} className="twin-ch">
            <h3>{CH[c.channel] ?? c.channel} · {c.born ? "born" : `${twin.need - c.pieces} more to keep`}</h3>
            {c.born && <dl>{c.words.map((w) => <div key={w.dim}><dt>{w.dim}</dt><dd>{w.word}</dd></div>)}</dl>}
            {c.exemplars.length > 0 && <><p>What it learns from (in your own words). A piece you leave out is not used as a sample, but it still counts toward the style words:</p>
              <ul>{c.exemplars.map((e) => <li key={e.pieceId}><label><input type="checkbox" checked={e.included} onChange={(ev) => void toggle(e.pieceId, !ev.target.checked)} /> {e.text}</label></li>)}</ul></>}
          </div>
        )) : <p>Keep three messages (or three emails) to bring your twin to life.</p>}
        {twin.born && <a className="btn" href="/api/twin/card" data-role="drop-card">Download your Twin Card</a>}
        <div className="row"><button className="secondary" onClick={() => void showOnTv()}>Show the Workroom on the TV</button></div>
      </section>}
    </main>
  );
}
