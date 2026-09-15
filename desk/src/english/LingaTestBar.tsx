"use client";
/**
 * TEMPORARY test aid for the web desk: answer whatever the TV's Linga screen is asking, without a paired phone.
 * Type the answer, or speak into this PC's microphone — through the local speech-to-text service (gravitone,
 * see lib/engines/listen.ts) or the browser's own recognition. Shown only in dev builds with ?test=1.
 * It sends the same commands the phone sends, so what it tests is the real flow. Remove before shipping.
 */
import { useEffect, useRef, useState } from "react";
import type { Session } from "@/lib/session/store";
import { requestId, useEnglish } from "./useEnglish";

type Target = { action: string; extra: Record<string, string>; label: string } | null;

/** The question on screen that takes a spoken or typed answer; a choice task is answered with the remote. */
function target(s: Session): Target {
  const k = s.check && s.check.learnerId === s.learner.id ? s.check : null, c = s.conversation;
  if (s.screen === "linga-check" && k && !k.pending) {
    const q = k.turns.at(-1);
    if (k.stage === "about" && q?.role === "tutor") return { action: "check-answer", extra: { lastTurnId: q.id }, label: "Answer the question" };
    if (k.stage === "tasks" && k.task && k.task.kind !== "choose") return { action: "check-task", extra: { taskId: k.task.id }, label: k.task.kind === "listen" ? "Answer the listening task" : "Answer the task" };
  }
  if (s.screen === "linga-plan" && k?.askGoal && !k.pending) return { action: "plan-goal", extra: {}, label: "Say what to practise" };
  const said = c?.turns.at(-1);
  if (s.screen === "linga-talk" && c && !c.pending && !c.paused && !c.quizOpen && c.phase !== "finished" && said?.role === "partner") return { action: "turn", extra: { lastTurnId: said.id }, label: `Reply to ${c.partner}` };
  return null;
}

interface Recognition { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: { results: ArrayLike<{ [i: number]: { transcript: string } }> }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void; }
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export function LingaTestBar({ s }: { s: Session }) {
  const { run, busy, error } = useEnglish(s);
  const [text, setText] = useState(""), [mode, setMode] = useState<"text" | "speech">("text");
  const [state, setState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [server, setServer] = useState<{ reachable: boolean; provider: string } | null>(null);
  const [note, setNote] = useState("");
  const recorder = useRef<MediaRecorder | null>(null), recognition = useRef<Recognition | null>(null), chunks = useRef<Blob[]>([]), attempt = useRef(""), answering = useRef("");
  const t = target(s), key = t ? `${t.action}:${Object.values(t.extra).join(":")}` : "";

  useEffect(() => { fetch("/api/listen").then(r => r.json()).then(setServer).catch(() => setServer({ reachable: false, provider: "none" })); }, []);
  // A new question clears the draft; a failed send, which briefly hides the question, does not.
  useEffect(() => { if (key && key !== answering.current) { answering.current = key; setText(""); setMode("text"); attempt.current = ""; } }, [key]);

  const heard = (value: string) => { setText(value); setMode("speech"); attempt.current = ""; };
  const startServer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        setState("transcribing"); setNote("Transcribing…");
        const form = new FormData();
        form.append("file", new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }), "answer.webm");
        try {
          const r = await fetch("/api/listen", { method: "POST", body: form }), j = await r.json();
          if (!r.ok) throw new Error(j.error || "Speech-to-text failed.");
          heard(j.text); setNote(`Heard by ${j.provider} in ${(j.ms / 1000).toFixed(1)} s${j.language ? ` (${j.language})` : ""}. Check it, then send.`);
        } catch (e) { setNote((e as Error).message); }
        finally { setState("idle"); }
      };
      recorder.current = rec; rec.start(); setState("recording"); setNote("Recording on this PC… press Stop when done.");
    } catch { setNote("The microphone could not start. Allow it for this page in the browser."); }
  };
  const startBrowser = () => {
    const w = window as SpeechWindow, Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) { setNote("This browser has no speech recognition. Use Chrome or Edge, or start the local STT service."); return; }
    const rec = new Ctor();
    rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true;
    rec.onresult = e => heard(Array.from(e.results).map(r => r[0].transcript).join(" ").trim());
    rec.onerror = e => setNote(`Browser speech: ${e.error}`);
    rec.onend = () => { recognition.current = null; setState("idle"); };
    recognition.current = rec; rec.start(); setState("recording"); setNote("Listening in the browser (English only)… press Stop when done.");
  };
  const stop = () => { if (recognition.current) recognition.current.stop(); else if (recorder.current?.state === "recording") recorder.current.stop(); };
  const send = async () => {
    if (!t || !text.trim()) return;
    attempt.current ||= requestId();
    if (await run(t.action, { ...t.extra, text, mode, commandId: attempt.current })) { setText(""); setMode("text"); attempt.current = ""; setNote(""); }
  };

  const idle = state === "idle", can = !!t && !busy;
  return <div className="bar linga-testbar">
    <b>Test answer</b>
    <span>{t ? t.label : "Nothing to answer on this screen"}</span>
    <textarea value={text} rows={2} disabled={!can || !idle} placeholder="Type the learner's answer, or speak it…" onChange={e => { setText(e.target.value); setMode("text"); attempt.current = ""; }} />
    {state === "recording"
      ? <button onClick={stop}>Stop</button>
      : <>
        <button disabled={!can || !idle || !server?.reachable} title={server?.reachable ? `Record here, transcribe with ${server.provider} on this machine` : "Local speech-to-text is not running (STT_URL, default http://localhost:8080)"} onClick={startServer}>Speak · {server?.reachable ? "local STT" : "local STT off"}</button>
        <button disabled={!can || !idle} title="The browser's own recognition (Chrome/Edge send audio to their cloud)" onClick={startBrowser}>Speak · browser</button>
      </>}
    <button disabled={!can || !idle || !text.trim()} onClick={send}>Send as {mode === "speech" ? "speech" : "typed"}</button>
    {(error || note) && <span className="status">{error || note}</span>}
  </div>;
}
