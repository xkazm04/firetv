"use client";
/**
 * The phone: the instrument. Camera, pen, keyboard, mic. It never renders the big view.
 * Student and Parent are two roles on one page for the prototype.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession, call, fmt } from "@/tv/useSession";
import { ESSAY_TYPES } from "@/lib/library/lessons.data";
import { BRAND as MODULE } from "@/tv/profileRows";
import type { Event, JobKind, Session, Subject } from "@/lib/session/store";
import { LingaPhone } from "@/english/LingaPhone";
import { follow, type PScreen } from "./panelFor";
import { forensicAt } from "@/tv/keys";

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
  topics: "Teach me something", practice: "the practice set", sheet: "your marked sheet", walk: "walking the set",
  linga: "Linga", "linga-scenes": "English situations", "linga-map": "your learning map", "linga-talk": "your conversation", "linga-coach": "a coaching moment", "linga-recap": "your rehearsal recap", "linga-check": "finding your level", "linga-verdict": "your level", "linga-plan": "your topics", "linga-moment": "a moment in your conversation",
};
export default function Phone() {
  const { s, connected, post, reconnect } = useSession();
  /** Linga's panel posts and moves on; only the join reads the answer. */
  const postOnly = useCallback(async (e: Event) => { await post(e); }, [post]);
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
  /** A failed run the learner has stepped past ("Snap a new page"): its Try again is not offered again. */
  const [passed, setPassed] = useState("");

  // the QR on the TV carries the code: arrive with ?pin= and the phone gives it to the desk, which checks it, then tidies the bar
  useEffect(() => {
    if (!s || s.joined) return;
    const q = new URLSearchParams(location.search).get("pin");
    if (!q) return;
    remembered.current = null;
    history.replaceState(null, "", location.pathname);
    void join(q, true);
  }, [s?.joined]); // eslint-disable-line react-hooks/exhaustive-deps
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
  /**
   * The desk checks the code (api/session): a match sets this phone's cookie and the stream reopens as a joined
   * phone; a refusal says why. Quiet for a code the phone brought (the QR, a remembered one): no shake for those.
   */
  const join = async (code = pin, quiet = false) => {
    let r: Response | null = null;
    try { r = await post({ type: "join", code }); } catch {}
    if (r?.ok) { setMsg(""); try { localStorage.setItem("desk.pin", code); } catch {} reconnect(); return; }
    if (quiet) return;
    const j = r ? await r.json().catch(() => ({} as { error?: string })) as { error?: string } : {};
    setMsg(r ? j.error ?? "That code is not on the TV." : "That did not reach the desk."); setBad(true); setTimeout(() => setBad(false), 500);
  };
  // four digits join by themselves; Join stays as the fallback tap
  const onPin = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 4); setPin(d); if (d.length === 4 && s && !s.joined) join(d); };
  // the phone remembers the desk: a code kept from an earlier join lets it in without asking
  const remembered = useRef<string | null>(null);
  useEffect(() => { try { remembered.current = localStorage.getItem("desk.pin"); } catch {} }, []);
  useEffect(() => { if (s && !s.joined && remembered.current) { const code = remembered.current; remembered.current = null; void join(code, true); } }, [s?.joined]); // eslint-disable-line react-hooks/exhaustive-deps
  // the desk forgets this phone too: its cookie goes, and the stream reopens as a guest
  const forget = () => { try { localStorage.removeItem("desk.pin"); } catch {} remembered.current = null; setMsg("This phone will ask for the code next time.");
    void post({ type: "leave" }).then(() => reconnect(), () => {}); };

  // the phone stays where it is: the hand-off is shown, not jumped over
  const send = async (dataUrl: string, w: number, h: number, sub: Subject, title: string) => {
    setBusy(true); setPhase("sending"); setMsg("");
    try {
      const r = await call("/api/read", { image: dataUrl, subject: sub, title, w, h }); const j = await r.json();
      // a run that failed (502) is on the desk with its sentence and a Try again; only a refusal needs the line here
      if (r.ok) { setPhase("sent"); setMsg(""); } else { setPhase("failed"); setMsg(r.status === 502 ? "" : (j.error ?? `The desk could not read it (${r.status}).`)); }
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
  // the TV is on one sentence of the paragraph: the Essay tab offers that sentence, the learner's own words, to rewrite
  const onSentence = s?.screen === "forensic" && s.essay?.sentences.length ? s.essay.sentences[forensicAt(s)] : null;
  const [rewrite, setRewrite] = useState("");
  useEffect(() => { if (onSentence) setRewrite(onSentence.text); }, [onSentence?.n, onSentence?.text]); // eslint-disable-line react-hooks/exhaustive-deps
  const sendRewrite = async () => { if (!onSentence) return; setBusy(true); setMsg("the desk is reading it…");
    try { const r = await call("/api/analyse", { kind: "rewrite", n: onSentence.n, text: rewrite }); const j = await r.json().catch(() => ({} as { error?: string }));
      setMsg(r.ok ? "on the TV" : (j as { error?: string }).error ?? "failed"); } catch { setMsg("That did not reach the desk."); } finally { setBusy(false); } };
  const tap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!page) return; const r = e.currentTarget.getBoundingClientRect(); const y = ((e.clientY - r.top) / r.height) * page.h;
    let best = 0; page.items.forEach((it, i) => { if (Math.abs(it.cy - y) < Math.abs(page.items[best].cy - y)) best = i; });
    setRing({ x: e.clientX - r.left, y: e.clientY - r.top }); post({ type: "item", itemIx: best }); if (s?.screen !== "page") post({ type: "nav", screen: "page" });
  };
  const ask = async () => { if (!page) return; setBusy(true); setMsg("");
    try { const r = await call("/api/hint", { askedQ: q, itemIx: s?.itemIx }); setQ("");
      if (!r.ok && r.status !== 502) { const j = await r.json().catch(() => ({} as { error?: string })); setMsg(j.error ?? `The desk could not ask (${r.status}).`); } }
    catch (e) { setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); } };
  /** The desk's failed run of this kind that can be asked again in place: it holds what it was asked with. */
  const failed = (kind: JobKind) => { const j = s?.jobs?.[kind]; return j?.phase === "failed" && j.input && j.id !== passed ? j : null; };
  /** A hint that failed for the item the TV is on. */
  const hintAgain = (() => { const h = failed("hint"); return h && page && h.key === page.items[s?.itemIx ?? 0]?.key ? h : null; })();
  /** One press: the desk asks again with what it holds — the same page, the same item and question, the same topic. */
  const retry = async (kind: JobKind) => {
    setBusy(true); setMsg(""); if (kind === "read") setPhase("sending");
    try {
      const r = await call("/api/session/retry", { kind }); const j = await r.json().catch(() => ({} as { error?: string }));
      if (kind === "read") setPhase(r.ok ? "sent" : "failed");
      if (!r.ok && r.status !== 502) setMsg(j.error ?? `The desk could not try again (${r.status}).`);
    } catch (e) { if (kind === "read") setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };
  /** A Mic press is listening: the phone does not move away from the field it is filling. */
  const hearing = useRef(false);
  const listen = (into: (t: string) => void) => {
    // Web Speech is not in TypeScript's DOM lib; the shape we use is small enough to declare here.
    type Rec = { lang: string; onresult: (ev: { results: Array<Array<{ transcript: string }>> }) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void };
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) { setMsg("No speech recognition in this browser — type instead."); return null; }
    const r = new SR(); r.lang = "en-US"; r.onresult = (ev) => into(ev.results[0][0].transcript); r.onerror = () => { hearing.current = false; setMsg("did not catch that"); }; r.onend = () => { hearing.current = false; };
    r.start(); hearing.current = true; setMsg("listening…");
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

  // The phone follows the TV (panelFor.ts): when the TV's screen changes into a hand-off, the phone moves once to
  // the panel that does it. A same-screen update moves nothing, so a tab the learner picked stays picked; busy hands
  // (typing, a shot held unsent, a recording) are never interrupted; a fresh join lands on the confirmation.
  const seen = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!s) return;
    const el = document.activeElement;
    const typing = el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit"].includes(el.type)) || (el instanceof HTMLElement && el.isContentEditable);
    const held = (screen === "capture" || screen === "practice") && !!shot && phase !== "sent";
    const busyHands = typing || held || holding || hearing.current || !!s.conversation?.capture;
    const step = follow(seen.current, s, { panel: screen, role, busy: busyHands });
    seen.current = step.key;
    if (step.to) setScreen(step.to);
  }, [s, role, screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // The nav waits for a joined phone — except Profile, which a first arrival needs before joining.
  const nav = (n: PScreen) => { if (!s?.joined && n !== "profile") return; setScreen(n); };
  return (
    <div className="phone">
      <div className="ptop">
        <div className="who"><button aria-pressed={role === "student"} onClick={() => { setRole("student"); }}>Student</button><button aria-pressed={role === "parent"} onClick={() => { setRole("parent"); setScreen("parent"); }}>Parent</button></div>
        <div className="link">{s?.joined ? <><b>joined</b> · {s.learner.name}</> : connected ? "not joined" : "connecting…"}{s && <small>TV · {TV_WORDS[s.screen] ?? s.screen}</small>}</div>
      </div>
      <div className="pbody">
        {screen === "linga" && s && <LingaPhone key={`${s.learner.id}:${s.conversation?.id??"setup"}:${s.check?.id??""}`} s={s} post={postOnly} onSentence={()=>setScreen("say")}/>}
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
          // a read that failed: the page is already on the desk, so it is read again there, not sent twice
          const again = !reading ? failed("read") : null;
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
              : again && (phase === "failed" || !shot) ? <>
                  <p>{again.error}</p>
                  <div className="field">
                    <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => retry("read")} disabled={busy}>Try again</button>
                    <button className="pbtn" data-secondary="true" onClick={() => { setPassed(again.id); retake(); }}>Snap a new page</button>
                  </div>
                </>
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
          const unwritten = failed("practice");
          if (!pr) return <div className="pscreen"><h3>Practice</h3>
            {unwritten ? <><p>{unwritten.error}</p>
                <button className="pbtn" data-signal="true" onClick={() => retry("practice")} disabled={busy}>Try again</button></>
              : <p>The practice set starts on the TV — open <b>Teach me something</b> there and pick a topic. Six problems land on the big screen; you work them on paper.</p>}</div>;

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
          // an item the explanation just settled keeps the reply up; the verdict itself is the TV's to show
          const asking = !!item && (item.verdict === "wrong" || item.verdict === "unsure" || !!reply);
          return <div className="pscreen"><h3>Practice</h3>
            <p><b>{right} right.</b> {look ? `${look} to look at.` : "Nothing to look at."}</p>
            <p>{s.screen === "walk" ? "Look at the TV — it is walking the set with you." : "Look at the TV — the whole set is on it. Pick a number there to go through it."}</p>
            {asking && <div className="ptalk">
              <b>How did you get there?</b>
              {reply ? <><p className="said">{reply}</p><p>The TV has it.</p></> : null}
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
            {hintAgain && <><p>{hintAgain.error}</p>
              <button className="pbtn" data-signal="true" onClick={() => retry("hint")} disabled={busy}>Try again</button></>}
            <button className="pbtn" data-signal={hintAgain ? undefined : "true"} data-secondary={hintAgain ? "true" : undefined} onClick={ask} disabled={busy || s?.reading}>{s?.reading ? "TV is still reading…" : "Ask the desk"}</button>
          </> : <p>Capture a page first.</p>}</div>}

        {screen === "say" && <div className="pscreen"><h3>Say a sentence</h3><p>English. Speak it or type it; the TV shows what the time word decides.</p>
          <div className="field"><input value={sentence} onChange={(e) => setSentence(e.target.value)} /><button className="pbtn" data-secondary="true" onClick={() => listen(setSentence)}>Mic</button></div>
          <div className="presets">{["I have gone to school yesterday.", "I lived here since 2019.", "We will visit Prague next week.", "She went to the cinema last night."].map((p) => <button key={p} onClick={() => setSentence(p)}>{p}</button>)}</div>
          <button className="pbtn" data-signal="true" disabled={busy} onClick={async () => { setBusy(true); setMsg("sending…"); try { const r = await call("/api/analyse", { kind: "english", sentence }); setMsg(r.ok ? "on the TV" : "failed"); } finally { setBusy(false); } }}>Check it on the TV</button></div>}

        {screen === "paste" && onSentence && <div className="pscreen" data-role="essay-rewrite"><h3>Sentence {onSentence.n}</h3><p>Rewrite it in your own words. The desk reads this one sentence again, in its paragraph.</p>
          <div className="field"><textarea value={rewrite} onChange={(e) => setRewrite(e.target.value)} /></div>
          <div className="field"><button className="pbtn" data-secondary="true" onClick={() => listen((t) => setRewrite(t))}>Dictate</button>
            <button className="pbtn" data-signal="true" style={{ flex: 1 }} disabled={busy} onClick={sendRewrite}>Send</button></div></div>}

        {screen === "paste" && !onSentence && <div className="pscreen"><h3>Your paragraph</h3><p>Paste it, or dictate it. Pick the lens — or pick it on the TV.</p>
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
