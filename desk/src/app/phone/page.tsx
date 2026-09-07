"use client";
/**
 * The phone: the instrument. Camera, pen, keyboard, mic. It never renders the big view.
 * Student and Parent are two roles on one page for the prototype.
 */
import { useEffect, useRef, useState } from "react";
import { useSession, call, fmt } from "@/tv/useSession";
import { ESSAY_TYPES } from "@/lib/library/lessons.data";
import type { Subject } from "@/lib/session/store";

type PScreen = "join" | "capture" | "point" | "say" | "paste" | "tonight" | "parent";
const SAMPLES: Array<{ id: Subject; title: string; file: string }> = [
  { id: "maths", title: "Algebra — Exercise 4.2", file: "/samples/maths.jpg" },
  { id: "english", title: "English — Unit 6", file: "/samples/english.jpg" },
  { id: "essay", title: "Later school starts — draft", file: "/samples/essay.jpg" },
];

export default function Phone() {
  const { s, connected, post } = useSession();
  const [role, setRole] = useState<"student" | "parent">("student");
  const [screen, setScreen] = useState<PScreen>("join");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [subject, setSubject] = useState<Subject>("maths");
  const [q, setQ] = useState("");
  const [sentence, setSentence] = useState("I have gone to school yesterday.");
  const [essay, setEssay] = useState("Many students are tired. Sleep is important. Schools start early. This is bad.");
  const [etype, setEtype] = useState("structure");
  const [ring, setRing] = useState<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const [cam, setCam] = useState<MediaStream | null>(null);

  useEffect(() => { if (s?.joined && screen === "join") setScreen("capture"); }, [s?.joined, screen]);
  useEffect(() => { if (s?.essayType && role === "student" && screen !== "paste" && s.screen === "essaytype") { setEtype(s.essayType); } }, [s?.essayType, s?.screen, role, screen]);

  // camera on when the capture screen is open
  useEffect(() => {
    if (screen !== "capture") { cam?.getTracks().forEach((t) => t.stop()); setCam(null); return; }
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 } } }).then((st) => { setCam(st); if (video.current) video.current.srcObject = st; }).catch(() => setMsg("No camera here — use a sample page below."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const join = async () => { if (s && pin === s.pin) { await post({ type: "join" }); setMsg(""); } else setMsg("That code is not on the TV."); };

  const send = async (dataUrl: string, w: number, h: number, sub: Subject, title: string) => {
    setBusy(true); setMsg("sending the page…"); setScreen("point");
    try { const r = await call("/api/read", { image: dataUrl, subject: sub, title, w, h }); const j = await r.json(); setMsg(r.ok ? `read ${j.items} items in ${(j.ms / 1000).toFixed(0)} s` : `read failed: ${j.error}`); }
    catch (e) { setMsg(String(e)); } finally { setBusy(false); }
  };
  const toJpeg = (src: HTMLVideoElement | HTMLImageElement, sw: number, sh: number) => {
    const w = 1280, h = Math.round((sh / sw) * 1280); const c = document.createElement("canvas"); c.width = w; c.height = h;
    c.getContext("2d")!.drawImage(src, 0, 0, w, h); return { url: c.toDataURL("image/jpeg", 0.85), w, h };
  };
  const snap = () => { const v = video.current; if (!v || !v.videoWidth) return setMsg("camera not ready"); const { url, w, h } = toJpeg(v, v.videoWidth, v.videoHeight); send(url, w, h, subject, SAMPLES.find((x) => x.id === subject)?.title ?? "Page"); };
  const sample = (x: (typeof SAMPLES)[number]) => { const img = new Image(); img.onload = () => { const { url, w, h } = toJpeg(img, img.naturalWidth, img.naturalHeight); send(url, w, h, x.id, x.title); }; img.src = x.file; };

  const page = s?.pages[s.pageIx];
  const tap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!page) return; const r = e.currentTarget.getBoundingClientRect(); const y = ((e.clientY - r.top) / r.height) * page.h;
    let best = 0; page.items.forEach((it, i) => { if (Math.abs(it.cy - y) < Math.abs(page.items[best].cy - y)) best = i; });
    setRing({ x: e.clientX - r.left, y: e.clientY - r.top }); post({ type: "item", itemIx: best }); if (s?.screen !== "page") post({ type: "nav", screen: "page" });
  };
  const ask = async () => { if (!page) return; setBusy(true); try { await call("/api/hint", { askedQ: q, itemIx: s?.itemIx }); setQ(""); } finally { setBusy(false); } };
  const listen = (into: (t: string) => void) => {
    // Web Speech is not in TypeScript's DOM lib; the shape we use is small enough to declare here.
    type Rec = { lang: string; onresult: (ev: { results: Array<Array<{ transcript: string }>> }) => void; onerror: () => void; start: () => void };
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return setMsg("No speech recognition in this browser — type instead.");
    const r = new SR(); r.lang = "en-US"; r.onresult = (ev) => into(ev.results[0][0].transcript); r.onerror = () => setMsg("did not catch that"); r.start(); setMsg("listening…");
  };

  const nav = (n: PScreen) => { if (!s?.joined) return; setScreen(n); };
  return (
    <div className="phone">
      <div className="ptop">
        <div className="who"><button aria-pressed={role === "student"} onClick={() => { setRole("student"); }}>Student</button><button aria-pressed={role === "parent"} onClick={() => { setRole("parent"); setScreen("parent"); }}>Parent</button></div>
        <div className="link">{s?.joined ? <><b>joined</b> · {s.learner.name}</> : connected ? "not joined" : "connecting…"}</div>
      </div>
      <div className="pbody">
        {screen === "join" && <div className="pscreen"><h3>Join the desk</h3><p>Type the code on the TV.</p>
          <div className="field"><input inputMode="numeric" placeholder="4-digit code" value={pin} onChange={(e) => setPin(e.target.value)} /><button className="pbtn" onClick={join}>Join</button></div>
          <p style={{ fontSize: 12 }}>The TV serves this page itself; nothing to install.</p></div>}

        {screen === "capture" && <div className="pscreen"><h3>Capture a page</h3>
          <div className="field"><select value={subject} onChange={(e) => setSubject(e.target.value as Subject)}><option value="maths">Maths</option><option value="english">English</option><option value="essay">Essay</option></select></div>
          <div className="cam">{cam ? <video ref={video} autoPlay playsInline muted /> : <span>camera</span>}</div>
          <button className="pbtn" onClick={snap} disabled={!cam || busy}>Snap page</button>
          <p>No camera on this device? Send a sample page instead:</p>
          <div className="samples">{SAMPLES.map((x) => <button key={x.id} onClick={() => sample(x)} disabled={busy}>{x.title}</button>)}</div></div>}

        {screen === "point" && <div className="pscreen"><h3>Point &amp; ask</h3>
          {page ? <>
            <p>Tap a problem on the page, then ask. Item {page.items[s!.itemIx]?.n ?? "—"} is on the TV.</p>
            <div className="mirror" onPointerDown={tap}><img src={page.img} alt="the captured page" />
              {page.items[s!.itemIx] && <div className="band" style={{ top: `${(page.items[s!.itemIx].band[0] / page.h) * 100}%`, height: `${((page.items[s!.itemIx].band[1] - page.items[s!.itemIx].band[0]) / page.h) * 100}%` }} />}
              {ring && <div className="ring" style={{ left: ring.x, top: ring.y }} />}</div>
            <div className="field"><input placeholder="What do you want to know?" value={q} onChange={(e) => setQ(e.target.value)} /><button className="pbtn" data-secondary="true" onClick={() => listen(setQ)}>Mic</button></div>
            <div className="presets">{["What do I do first?", "Why is this negative?", "Which rule is this?"].map((p) => <button key={p} onClick={() => setQ(p)}>{p}</button>)}</div>
            <button className="pbtn" data-signal="true" onClick={ask} disabled={busy || s?.reading}>{s?.reading ? "TV is still reading…" : "Ask the desk"}</button>
          </> : <p>Capture a page first.</p>}</div>}

        {screen === "say" && <div className="pscreen"><h3>Say a sentence</h3><p>English. Speak it or type it; the TV shows what the time word decides.</p>
          <div className="field"><input value={sentence} onChange={(e) => setSentence(e.target.value)} /><button className="pbtn" data-secondary="true" onClick={() => listen(setSentence)}>Mic</button></div>
          <div className="presets">{["I have gone to school yesterday.", "I lived here since 2019.", "We will visit Prague next week.", "She went to the cinema last night."].map((p) => <button key={p} onClick={() => setSentence(p)}>{p}</button>)}</div>
          <button className="pbtn" data-signal="true" disabled={busy} onClick={async () => { setBusy(true); setMsg("sending…"); try { const r = await call("/api/analyse", { kind: "english", sentence }); setMsg(r.ok ? "on the TV" : "failed"); } finally { setBusy(false); } }}>Check it on the TV</button></div>}

        {screen === "paste" && <div className="pscreen"><h3>Your paragraph</h3><p>Paste it, or dictate it. Pick the lens — or pick it on the TV.</p>
          <div className="types">{ESSAY_TYPES.map((t) => <label key={t.id}><input type="radio" name="etype" checked={etype === t.id} onChange={() => setEtype(t.id)} /><span><b>{t.name}</b><small>{t.promise}</small></span></label>)}</div>
          <div className="field"><textarea value={essay} onChange={(e) => setEssay(e.target.value)} /></div>
          <div className="field"><button className="pbtn" data-secondary="true" onClick={() => listen((t) => setEssay((v) => (v + " " + t).trim()))}>Dictate</button>
            <button className="pbtn" data-signal="true" style={{ flex: 1 }} disabled={busy} onClick={async () => { setBusy(true); setMsg("the desk is reading it…"); try { const r = await call("/api/analyse", { kind: "essay", text: essay, type: etype }); setMsg(r.ok ? "on the TV" : "failed"); } finally { setBusy(false); } }}>Analyse on the TV</button></div></div>}

        {screen === "tonight" && s && <div className="pscreen"><h3>Tonight</h3>
          <div className="tlist">{s.tasks.map((t) => <label key={t.id}><input type="checkbox" checked={t.done} onChange={(e) => post({ type: "task.done", id: t.id, done: e.target.checked })} /><span>{t.name}</span><small>{t.min}m</small></label>)}</div>
          <AddTask onAdd={(name, sub) => post({ type: "task.add", name, sub, min: 10 })} />
          <button className="pbtn" onClick={() => post({ type: s.timer.running ? "timer.pause" : "timer.start" })}>{s.timer.running ? `Pause · ${fmt(s.timer.left)}` : `Start · ${fmt(s.timer.left)}`}</button>
          <button className="pbtn" data-secondary="true" onClick={() => post({ type: "session.end" })}>End session</button></div>}

        {screen === "parent" && s && <div className="pscreen"><h3>Recap</h3>
          {s.screen === "recap" || s.log.problems.length ? <div className="precap"><b>{s.learner.name}, tonight</b>{Math.round(s.log.minutes)} minutes on task · {s.log.problems.length} problems · {s.log.hints} hints
            <ul>{s.log.hard.length ? s.log.hard.map((h) => <li key={h}>Needed a second hint: {h}</li>) : <li>Nothing needed a second hint.</li>}</ul></div> : <p>Arrives when the session ends.</p>}
          <p style={{ fontSize: 12 }}>The TV shows: {s.screen} · {s.status}</p></div>}

        <div className="pstatus">{msg}</div>
      </div>
      <div className="pnav">
        {([["capture", "Capture"], ["point", "Point & ask"], ["say", "Say it"], ["paste", "Essay"], ["tonight", "Tonight"], ["parent", "Recap"]] as Array<[PScreen, string]>).map(([id, label]) => <button key={id} aria-pressed={screen === id} onClick={() => nav(id)}>{label}</button>)}
      </div>
    </div>
  );
}

function AddTask({ onAdd }: { onAdd: (name: string, sub: Subject) => void }) {
  const [v, setV] = useState(""); const [sub, setSub] = useState<Subject>("maths");
  return <div className="field"><select value={sub} onChange={(e) => setSub(e.target.value as Subject)}><option value="maths">Maths</option><option value="english">English</option><option value="essay">Essay</option></select>
    <input placeholder="Add an assignment" value={v} onChange={(e) => setV(e.target.value)} /><button className="pbtn" data-secondary="true" onClick={() => { if (v.trim()) { onAdd(v.trim(), sub); setV(""); } }}>Add</button></div>;
}
