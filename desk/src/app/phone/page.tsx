"use client";
/**
 * The phone: the instrument. Camera, pen, keyboard, mic. It never renders the big view.
 * Student and Parent are two roles on one page for the prototype.
 */
import { useEffect, useRef, useState } from "react";
import { useSession, call, fmt } from "@/tv/useSession";
import { ESSAY_TYPES } from "@/lib/library/lessons.data";
import { BRAND as MODULE } from "@/tv/profileRows";
import type { Session, Subject } from "@/lib/session/store";
import { LingaPhone } from "@/english/LingaPhone";

type PScreen = "join" | "joined" | "capture" | "practice" | "point" | "say" | "paste" | "tonight" | "parent" | "profile" | "linga";
const SAMPLES: Array<{ id: Subject; title: string; file: string }> = [
  { id: "maths", title: "Algebra — Exercise 4.2", file: "/samples/maths.jpg" },
  { id: "english", title: "English — Unit 6", file: "/samples/english.jpg" },
  { id: "essay", title: "Later school starts — draft", file: "/samples/essay.jpg" },
];

/** The TV's screens in the user's words, for the phone's status line. */
const TV_WORDS: Partial<Record<Session["screen"], string>> = {
  landing: "the start screen", pair: "the pairing code", joined: "the paired screen", tonight: "Tonight", learner: "Who is at the desk", profile: "a new learner",
  units: "the units guide", calendar: "the calendar", page: "the page", hint: "a hint", lesson: "a lesson", sentence: "your sentence",
  headtohead: "head to head", essaytype: "the essay lens", forensic: "the essay", playbook: "the playbook", xray: "the x-ray", break: "a break", recap: "the recap",
  topics: "Teach me something", practice: "the practice set", walk: "walking the set",
  linga: "Linga", "linga-scenes": "English situations", "linga-map": "your learning map", "linga-talk": "your conversation", "linga-coach": "a coaching moment", "linga-recap": "your rehearsal recap", "linga-check": "finding your level", "linga-verdict": "your level", "linga-plan": "your topics", "linga-moment": "a moment in your conversation",
};
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
  const [pname, setPname] = useState("");
  const [ring, setRing] = useState<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const [cam, setCam] = useState<MediaStream | null>(null);
  /** The shot lives on the phone until the user says Use this page. Nothing is sent before that. */
  const [shot, setShot] = useState<{ url: string; w: number; h: number; sub: Subject; title: string } | null>(null);
  /** The hand-off, as the phone knows it: nothing sent, in flight, gone, or refused. */
  const [phase, setPhase] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  /** The TV asked for a module; the picker stays out of the way until the user asks for it. */
  const [picking, setPicking] = useState(false);
  /** What the mic caught, held on the phone until the learner has read it back. Nothing is sent unseen. */
  const [heard, setHeard] = useState("");
  const [holding, setHolding] = useState(false);
  const [micOk, setMicOk] = useState(true);
  /** The desk's answer to "how did you get there", in text — the TV speaks its own line. */
  const [reply, setReply] = useState("");
  /** What the desk noticed tonight, read once on the way out. */
  const [memory, setMemory] = useState<string[] | null>(null);

  // a fresh join lands on the confirmation, never straight into the camera
  useEffect(() => { if (s?.joined && screen === "join") setScreen("joined"); }, [s?.joined, screen]);
  useEffect(() => { if (s?.joined && s.screen.startsWith("linga") && role === "student") setScreen("linga"); }, [s?.screen, s?.joined, role]);
  useEffect(() => { if (s && !s.joined && screen !== "join" && screen !== "profile") setScreen("join"); }, [s?.joined]); // eslint-disable-line react-hooks/exhaustive-deps
  // the QR on the TV carries the code: arrive with ?pin= and the phone joins itself, then tidies the bar
  useEffect(() => {
    if (!s || s.joined) return;
    const q = new URLSearchParams(location.search).get("pin");
    if (!q || q !== s.pin) return;
    post({ type: "join" });
    history.replaceState(null, "", location.pathname);
  }, [s?.pin, s?.joined]); // eslint-disable-line react-hooks/exhaustive-deps
  // the input mirrors the draft; a new draft (or none) resets what is typed here
  useEffect(() => { setPname(s?.draft?.name ?? ""); }, [s?.draft?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // the TV asked for a page: the capture tab follows what it is waiting for
  useEffect(() => { if (s?.awaiting) setSubject(s.awaiting); }, [s?.awaiting]);
  useEffect(() => { if (s?.essayType && role === "student" && screen !== "paste" && s.screen === "essaytype") { setEtype(s.essayType); } }, [s?.essayType, s?.screen, role, screen]);

  // camera on when a screen is asking for a photo: capture, or practice with a set still to mark
  const camWanted = screen === "capture" || (screen === "practice" && !!s?.practice && !s.practice.marked);
  useEffect(() => {
    if (!camWanted) { cam?.getTracks().forEach((t) => t.stop()); setCam(null); return; }
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 } } }).then((st) => { setCam(st); if (video.current) video.current.srcObject = st; }).catch(() => setMsg("No camera here — use a sample page below."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camWanted]);
  // the element arrives after the stream does; hand it the stream once it is on the page
  useEffect(() => { if (cam && video.current && video.current.srcObject !== cam) video.current.srcObject = cam; }, [cam, shot]);

  const [bad, setBad] = useState(false);
  const join = async (code = pin) => {
    if (s && code === s.pin) { await post({ type: "join" }); setMsg(""); try { localStorage.setItem("desk.pin", code); } catch {} }
    else { setMsg("That code is not on the TV."); setBad(true); setTimeout(() => setBad(false), 500); }
  };
  // four digits join by themselves; Join stays as the fallback tap
  const onPin = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 4); setPin(d); if (d.length === 4 && s && !s.joined) join(d); };
  // the phone remembers the desk: a code kept from an earlier join lets it in without asking
  const remembered = useRef<string | null>(null);
  useEffect(() => { try { remembered.current = localStorage.getItem("desk.pin"); } catch {} }, []);
  useEffect(() => { if (s && !s.joined && remembered.current && remembered.current === s.pin) { remembered.current = null; post({ type: "join" }); } }, [s?.pin, s?.joined]); // eslint-disable-line react-hooks/exhaustive-deps
  const forget = () => { try { localStorage.removeItem("desk.pin"); } catch {} remembered.current = null; setMsg("This phone will ask for the code next time."); };

  // the phone stays where it is: the hand-off is shown, not jumped over
  const send = async (dataUrl: string, w: number, h: number, sub: Subject, title: string) => {
    setBusy(true); setPhase("sending"); setMsg("");
    try {
      const r = await call("/api/read", { image: dataUrl, subject: sub, title, w, h }); const j = await r.json();
      if (r.ok) { setPhase("sent"); setMsg(""); } else { setPhase("failed"); setMsg(j.error ?? `The desk could not read it (${r.status}).`); }
    } catch (e) { setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };
  const toJpeg = (src: HTMLVideoElement | HTMLImageElement, sw: number, sh: number) => {
    const w = 1280, h = Math.round((sh / sw) * 1280); const c = document.createElement("canvas"); c.width = w; c.height = h;
    c.getContext("2d")!.drawImage(src, 0, 0, w, h); return { url: c.toDataURL("image/jpeg", 0.85), w, h };
  };
  /** How many pages of this module are already on the desk — a sheet has more than one side. */
  const pagesOf = (sub: Subject) => s?.pages.filter((p) => p.subject === sub).length ?? 0;
  const titleFor = (sub: Subject, base: string) => { const n = pagesOf(sub); return n >= 1 ? `${base} · page ${n + 1}` : base; };
  // a snap is a shot, not a send
  const snap = () => { const v = video.current; if (!v || !v.videoWidth) return setMsg("camera not ready"); const { url, w, h } = toJpeg(v, v.videoWidth, v.videoHeight);
    setMsg(""); setPhase("idle"); setShot({ url, w, h, sub: subject, title: titleFor(subject, SAMPLES.find((x) => x.id === subject)?.title ?? "Page") }); };
  const sample = (x: (typeof SAMPLES)[number]) => { const img = new Image(); img.onload = () => { const { url, w, h } = toJpeg(img, img.naturalWidth, img.naturalHeight);
    setMsg(""); setPhase("idle"); setShot({ url, w, h, sub: x.id, title: titleFor(x.id, x.title) }); }; img.src = x.file; };
  const retake = () => { setShot(null); setPhase("idle"); setMsg(""); };

  const page = s?.pages[s.pageIx];
  const tap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!page) return; const r = e.currentTarget.getBoundingClientRect(); const y = ((e.clientY - r.top) / r.height) * page.h;
    let best = 0; page.items.forEach((it, i) => { if (Math.abs(it.cy - y) < Math.abs(page.items[best].cy - y)) best = i; });
    setRing({ x: e.clientX - r.left, y: e.clientY - r.top }); post({ type: "item", itemIx: best }); if (s?.screen !== "page") post({ type: "nav", screen: "page" });
  };
  const ask = async () => { if (!page) return; setBusy(true); try { await call("/api/hint", { askedQ: q, itemIx: s?.itemIx }); setQ(""); } finally { setBusy(false); } };
  const listen = (into: (t: string) => void) => {
    // Web Speech is not in TypeScript's DOM lib; the shape we use is small enough to declare here.
    type Rec = { lang: string; onresult: (ev: { results: Array<Array<{ transcript: string }>> }) => void; onerror: () => void; start: () => void; stop: () => void };
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) { setMsg("No speech recognition in this browser — type instead."); return null; }
    const r = new SR(); r.lang = "en-US"; r.onresult = (ev) => into(ev.results[0][0].transcript); r.onerror = () => setMsg("did not catch that"); r.start(); setMsg("listening…");
    return r; // the caller may hold the button and stop it on release
  };
  // is there a mic path at all on this device? asked once, so the fallback is offered before a failed press
  useEffect(() => { const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }; setMicOk(Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition)); }, []);

  // ---- the practice loop: the worked sheet goes to be marked, the mouth explains one slip ----
  /** The whole worked set, one photo. Same shot/review machinery as capture; a different door. */
  const sendWorking = async () => {
    if (!shot) return;
    setBusy(true); setPhase("sending"); setMsg("");
    try {
      const r = await call("/api/mark", { image: shot.url, w: shot.w, h: shot.h });
      const j = await r.json().catch(() => ({} as { error?: string }));
      if (r.ok) setPhase("sent");
      else { setPhase("failed"); setMsg(r.status === 404 ? "The desk cannot mark yet — that part is still being built." : (j.error ?? `The desk could not mark it (${r.status}).`)); }
    } catch (e) { setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };
  // the set came back marked: the sheet has done its job, so the review clears itself
  useEffect(() => { if (screen === "practice" && s?.practice?.marked) { setShot(null); setPhase("idle"); } }, [s?.practice?.marked]); // eslint-disable-line react-hooks/exhaustive-deps
  // a new item on the walk is a new question: last time's transcript and answer do not belong to it
  useEffect(() => { setHeard(""); setReply(""); }, [s?.walkIx]);

  const rec = useRef<{ stop: () => void } | null>(null);
  const holdStart = () => { setReply(""); setHeard(""); const r = listen((t) => { setHeard(t); setMsg(""); }); if (r) { rec.current = r; setHolding(true); } else setMicOk(false); };
  const holdEnd = () => { if (!holding) return; rec.current?.stop(); rec.current = null; setHolding(false); setMsg(""); };
  const explain = async (transcript: string) => {
    const t = transcript.trim(); if (!t) return;
    setBusy(true); setMsg("");
    try {
      const r = await call("/api/explain", { transcript: t, n: s?.walkIx });
      const j = await r.json().catch(() => ({} as { reply?: string; error?: string }));
      if (r.ok) { setReply(j.reply ?? "The desk heard you."); setHeard(""); }
      else setMsg(r.status === 404 ? "The desk cannot listen back yet — that part is still being built." : (j.error ?? `The desk could not use that (${r.status}).`));
    } catch (e) { setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };
  /** Memory is written on the way out — and is never allowed to hold the door shut. */
  const endSession = async () => {
    setBusy(true);
    try { const r = await call("/api/memory", {}); const j = await r.json().catch(() => ({} as { lines?: string[] })); setMemory(r.ok && Array.isArray(j.lines) ? j.lines : []); }
    catch { setMemory([]); }
    finally { setBusy(false); await post({ type: "session.end" }); }
  };

  // The nav waits for a joined phone — except Profile, which a first arrival needs before joining.
  const nav = (n: PScreen) => { if (!s?.joined && n !== "profile") return; setScreen(n); };
  return (
    <div className="phone">
      <div className="ptop">
        <div className="who"><button aria-pressed={role === "student"} onClick={() => { setRole("student"); }}>Student</button><button aria-pressed={role === "parent"} onClick={() => { setRole("parent"); setScreen("parent"); }}>Parent</button></div>
        <div className="link">{s?.joined ? <><b>joined</b> · {s.learner.name}</> : connected ? "not joined" : "connecting…"}{s && <small>TV · {TV_WORDS[s.screen] ?? s.screen}</small>}</div>
      </div>
      <div className="pbody">
        {screen === "linga" && s && <LingaPhone key={`${s.learner.id}:${s.conversation?.id??"setup"}:${s.check?.id??""}`} s={s} post={post} onSentence={()=>setScreen("say")}/>}
        {screen === "join" && <div className="pscreen"><h3>Join the desk</h3>
          <p>{!s ? "Looking for the TV…" : s.screen === "pair" ? "The TV is showing the code. Scan it, or type it here." : `The TV is on ${TV_WORDS[s.screen] ?? s.screen}. Ask it for the code, then type it here.`}</p>
          {s && s.screen !== "pair" && <button className="pbtn" data-secondary="true" onClick={() => post({ type: "nav", screen: "pair", from: s.screen })}>Show the code on the TV</button>}
          <div className="field" data-bad={bad}><input inputMode="numeric" placeholder="4-digit code" value={pin} onChange={(e) => onPin(e.target.value)} /><button className="pbtn" data-signal="true" onClick={() => join()}>Join</button></div>
          <p style={{ fontSize: 12 }}>The TV serves this page itself; nothing to install. This phone remembers the desk once it has joined. <button className="plink" onClick={forget}>Forget this desk</button></p>
          <button className="pbtn" data-secondary="true" onClick={() => nav("profile")}>Naming a new learner? Open Profile.</button></div>}

        {screen === "joined" && s && <div className="pscreen"><h3>On the desk</h3>
          <p>Joined as <b>{s.learner.name}</b>. {["landing", "pair", "joined", "tonight"].includes(s.screen) ? "Snap the page and the TV opens it." : `The TV is on ${TV_WORDS[s.screen] ?? s.screen}.`}</p>
          {s.screen === "profile" || s.draft
            ? <button className="pbtn" data-signal="true" onClick={() => nav("profile")}>Name the new learner</button>
            : <button className="pbtn" data-signal="true" onClick={() => nav("capture")}>{s.awaiting ? `Snap the ${MODULE[s.awaiting]} page` : "Snap the page"}</button>}
          <button className="pbtn" data-secondary="true" onClick={() => nav("tonight")}>Set up tonight first</button>
          <p style={{ fontSize: 12 }}>Not {s.learner.name}? Press Up on the TV's Tonight to switch who is at the desk.</p></div>}

        {screen === "profile" && <div className="pscreen"><h3>Profile</h3>
          <p>At the desk now: <b>{s?.learner.name ?? "—"}</b></p>
          {s && (s.draft || s.screen === "profile") ? <>
            <p>The TV takes the picks; type the name here.</p>
            <div className="field"><input placeholder="Name" value={pname} onChange={(e) => { setPname(e.target.value); post({ type: "profile.draft", patch: { name: e.target.value } }); }} /></div>
            <div className="field"><button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => post({ type: "profile.save" })}>Save</button>
              <button className="pbtn" data-secondary="true" onClick={() => post({ type: "profile.discard" })}>Cancel</button></div>
          </> : <p>Add or edit a learner on the TV; the name is typed here.</p>}</div>}

        {screen === "capture" && (() => {
          const reading = phase === "sending" || (phase === "sent" && !!s?.reading);
          const done = phase === "sent" && !reading;
          const read = page?.items.length ?? 0;
          const n = pagesOf(subject);
          return <div className="pscreen"><h3>Capture a page</h3>
            {s?.awaiting && !picking
              ? <p><b>{MODULE[s.awaiting]}</b> — the TV is waiting for this page. <button className="plink" onClick={() => setPicking(true)}>change</button></p>
              : <div className="field"><select value={subject} onChange={(e) => setSubject(e.target.value as Subject)}><option value="maths">Math Buddy</option><option value="english">Linga</option><option value="essay">Essay Master</option></select></div>}
            {phase === "idle" && !shot && n >= 1 && <p>Page {n + 1} of the {MODULE[subject]} sheet</p>}
            <div className="cam">
              {cam ? <video ref={video} autoPlay playsInline muted /> : !shot && <span>camera</span>}
              {shot && <img src={shot.url} alt="the page you just snapped" />}
              {cam && !shot && <div className="guide"><i /><i /><i /><i /></div>}
            </div>
            {!shot && <p>Fill the frame with the sheet, all four corners inside.</p>}

            {phase === "sending" && <p>Sent. The TV is reading it…</p>}
            {(phase === "sending" || phase === "sent") && <p>{reading ? "Reading the page…" : read ? `Read: ${read} problems` : s?.status || "Read."}</p>}

            {reading ? <button className="pbtn" disabled>Reading…</button>
              : done ? <div className="field">
                  <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => { setShot(null); setPhase("idle"); setMsg(""); }}>Add another page</button>
                  <button className="pbtn" data-secondary="true" onClick={() => setScreen("point")}>Point &amp; ask</button>
                </div>
              : shot ? <div className="field">
                  <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => send(shot.url, shot.w, shot.h, shot.sub, shot.title)} disabled={busy}>Use this page</button>
                  <button className="pbtn" data-secondary="true" onClick={retake}>Retake</button>
                </div>
              : <>
                  <button className="pbtn" onClick={snap} disabled={!cam || busy}>{cam ? "Snap page" : "No camera on this device"}</button>
                  <p style={{ fontSize: 12 }}>Prototype: send a sample sheet instead</p>
                  <div className="samples">{SAMPLES.map((x) => <button key={x.id} onClick={() => sample(x)} disabled={busy}>{x.title}</button>)}</div>
                </>}
          </div>;
        })()}

        {screen === "practice" && s && (() => {
          const pr = s.practice;
          if (!pr) return <div className="pscreen"><h3>Practice</h3>
            <p>The practice set starts on the TV — open <b>Teach me something</b> there and pick a topic. Six problems land on the big screen; you work them on paper.</p></div>;

          // not marked: the sheet is still on the table. Snap all six at once, review it, then send.
          if (!pr.marked) return <div className="pscreen"><h3>Practice</h3>
            <p><b>{pr.topic}</b> — work all {pr.items.length} on paper. When every one is done, snap the whole sheet in one photo.</p>
            <div className="cam">
              {cam ? <video ref={video} autoPlay playsInline muted /> : !shot && <span>camera</span>}
              {shot && <img src={shot.url} alt="the sheet you just snapped" />}
              {cam && !shot && <div className="guide"><i /><i /><i /><i /></div>}
            </div>
            {!shot && <p>Fill the frame with the sheet, all four corners inside.</p>}
            {phase === "sending" ? <><p>Sent. The desk is marking the set…</p><button className="pbtn" disabled>Marking the set…</button></>
              : shot ? <div className="field">
                  <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={sendWorking} disabled={busy}>Send my working</button>
                  <button className="pbtn" data-secondary="true" onClick={retake}>Retake</button>
                </div>
              : <button className="pbtn" onClick={snap} disabled={!cam || busy}>{cam ? "Snap the sheet" : "No camera on this device"}</button>}
          </div>;

          // marked: the count, and not one verdict. The walk itself belongs to the TV.
          const right = pr.items.filter((i) => i.verdict === "right").length;
          const look = pr.items.length - right;
          const item = s.screen === "walk" ? pr.items[s.walkIx] : undefined;
          const asking = !!item && (item.verdict === "wrong" || item.verdict === "unsure");
          return <div className="pscreen"><h3>Practice</h3>
            <p><b>{right} right.</b> {look ? `${look} to look at.` : "Nothing to look at."}</p>
            <p>Look at the TV — it is walking the set with you.</p>
            {asking && <div className="ptalk">
              <b>How did you get there?</b>
              {reply ? <p className="said">{reply}</p> : null}
              {heard ? <>
                <p>I heard: “{heard}”</p>
                <div className="field"><button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => explain(heard)} disabled={busy}>Send</button>
                  <button className="pbtn" data-secondary="true" onClick={() => { setHeard(""); setReply(""); }}>Try again</button></div>
              </> : micOk ? <>
                <button className="phold" data-holding={holding} onPointerDown={holdStart} onPointerUp={holdEnd} onPointerLeave={holdEnd} onPointerCancel={holdEnd} onContextMenu={(e) => e.preventDefault()}>
                  {holding ? "Listening… let go when you are done" : "Tell the desk how you got it"}</button>
                <p style={{ fontSize: 12 }}>Hold the button, say what you did, let go.</p>
              </> : <>
                <p>The microphone is not available in this browser — type it instead.</p>
                <div className="field"><textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="What did you do first?" /></div>
                <div className="field"><button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => explain(q)} disabled={busy || !q.trim()}>Send</button>
                  <button className="pbtn" data-secondary="true" onClick={() => { setQ(""); setReply(""); }}>Try again</button></div>
              </>}
            </div>}
          </div>;
        })()}

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
          <button className="pbtn" data-secondary="true" onClick={endSession} disabled={busy}>{busy ? "Closing…" : "End session"}</button>
          {memory && <div className="precap"><b>What the desk noticed</b>
            {memory.length ? <ul>{memory.map((l) => <li key={l}>{l}</li>)}</ul> : <ul><li>Nothing written down tonight.</li></ul>}</div>}</div>}

        {screen === "parent" && s && <div className="pscreen"><h3>Recap</h3>
          {s.screen === "recap" || s.log.problems.length ? <div className="precap"><b>{s.learner.name}, tonight</b>{Math.round(s.log.minutes)} minutes on task · {s.log.problems.length} problems · {s.log.hints} hints
            <ul>{s.log.hard.length ? s.log.hard.map((h) => <li key={h}>Needed a second hint: {h}</li>) : <li>Nothing needed a second hint.</li>}</ul></div> : <p>Arrives when the session ends.</p>}
          <p style={{ fontSize: 12 }}>The TV shows: {s.screen} · {s.status}</p></div>}

        <div className="pstatus">{msg}</div>
      </div>
      <div className="pnav">
        {([["capture", "Capture"], ["practice", "Practice"], ["point", "Point & ask"], ["linga", "Linga"], ["say", "Say it"], ["paste", "Essay"], ["tonight", "Tonight"], ["parent", "Recap"], ["profile", "Profile"]] as Array<[PScreen, string]>).map(([id, label]) => <button key={id} aria-pressed={screen === id} disabled={!s?.joined && id !== "profile"} onClick={() => nav(id)}>{label}</button>)}
      </div>
    </div>
  );
}

function AddTask({ onAdd }: { onAdd: (name: string, sub: Subject) => void }) {
  const [v, setV] = useState(""); const [sub, setSub] = useState<Subject>("maths");
  return <div className="field"><select value={sub} onChange={(e) => setSub(e.target.value as Subject)}><option value="maths">Math Buddy</option><option value="english">Linga</option><option value="essay">Essay Master</option></select>
    <input placeholder="Add an assignment" value={v} onChange={(e) => setV(e.target.value)} /><button className="pbtn" data-secondary="true" onClick={() => { if (v.trim()) { onAdd(v.trim(), sub); setV(""); } }}>Add</button></div>;
}
