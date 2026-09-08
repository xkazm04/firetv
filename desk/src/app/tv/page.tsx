"use client";
/**
 * The television. One 1920×1080 stage scaled to the window; the keyboard is the D-pad
 * (arrows, Enter = Select, Backspace/Escape = Back, M = Menu, Space = Play/Pause).
 * Everything it shows comes from the session stream; everything it changes is an event.
 */
import { useEffect, useRef, useState } from "react";
import { useSession, call } from "@/tv/useSession";
import { LESSONS } from "@/lib/library/lessons.data";
import { SYLLABUS } from "@/lib/library/syllabus";
import type { Screen, Session } from "@/lib/session/store";
import * as S from "@/tv/screens";
import { profileRows, locate, flat } from "@/tv/profileRows";

export default function TV() {
  const { s, connected, post } = useSession();
  const [table, setTable] = useState(false);
  const [voice, setVoice] = useState(true);
  const [fast, setFast] = useState(false);
  /** A practice set has been asked for and has not arrived: the topics screen says so. */
  const [busy, setBusy] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spoken = useRef<string>("");
  const audio = useRef<HTMLAudioElement | null>(null);

  // scale the stage to its box
  useEffect(() => {
    const fit = () => { if (frame.current && stage.current) stage.current.style.transform = `scale(${frame.current.getBoundingClientRect().width / 1920})`; };
    fit(); addEventListener("resize", fit); return () => removeEventListener("resize", fit);
  }, [s?.screen]);

  // speak what is new: the hint, the explanation, the verdict
  useEffect(() => {
    if (!s || !voice) return;
    const line = s.screen === "hint" ? (s.hint?.stage === 2 ? s.hint.hint2?.hint : s.hint?.hint1?.hint) : s.screen === "sentence" ? s.english?.explanation : s.screen === "forensic" ? s.essay?.summary : s.screen === "walk" ? s.practice?.items[s.walkIx]?.said : s.screen === "break" ? "Time for a break." : "";
    if (!line || line === spoken.current) return;
    spoken.current = line;
    (async () => {
      try { const r = await call("/api/speak", { text: line }); if (!r.ok) throw new Error(); const blob = await r.blob();
        audio.current?.pause(); audio.current = new Audio(URL.createObjectURL(blob)); await audio.current.play(); }
      catch { try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(line)); } catch {} }
    })();
  }, [s, voice]);

  // the wait for a practice set belongs to the topics screen only
  useEffect(() => { if (s && s.screen !== "topics") setBusy(false); }, [s?.screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // the demo clock: ×60 when asked, so the break screen is reachable
  useEffect(() => { if (!fast) return; const t = setInterval(() => post({ type: "timer.tick", seconds: 59 }), 1000); return () => clearInterval(t); }, [fast, post]);

  // ---- D-pad ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!s) return;
      const k = e.key; const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Backspace", "Escape", "m", "M", " "];
      if (!keys.includes(k)) return; e.preventDefault();
      const back = k === "Backspace" || k === "Escape", menu = k === "m" || k === "M", sel = k === "Enter";
      const f = s.focus, nav = (screen: Screen, focus = 0) => post({ type: "nav", screen, focus });
      const move = (n: number, delta: number) => post({ type: "focus", focus: Math.max(0, Math.min(n - 1, f + delta)) });
      const units = LESSONS.filter((l) => l.subject === s.subject);
      // Play/Pause is the clock everywhere the clock is on screen; only the lesson keeps Space for the video.
      if (k === " " && s.screen !== "lesson") { post({ type: s.timer.running ? "timer.pause" : "timer.start" }); return; }
      switch (s.screen) {
        case "landing": {
          // 0-2 the modules, 3-4 the actions; Down/Up jump between the rows
          if (f < 3) { if (k === "ArrowRight") move(3, 1); if (k === "ArrowLeft") move(3, -1); if (k === "ArrowDown") post({ type: "focus", focus: 3 });
            if (sel) { post({ type: "subject", subject: (["maths", "english", "essay"] as const)[f] }); nav("tonight"); } }
          else { if (k === "ArrowRight") post({ type: "focus", focus: 4 }); if (k === "ArrowLeft") post({ type: "focus", focus: 3 }); if (k === "ArrowUp") post({ type: "focus", focus: 0 });
            if (sel) { if (f === 3) nav("tonight"); else post({ type: "nav", screen: "learner", focus: 0, from: "landing" }); } }
          break; }
        case "pair": if (back) nav(s.back ?? "landing"); break;
        case "joined": if (sel || back) nav("tonight"); break;
        case "tonight": {
          // Math Buddy's home: the thing already open leads, then the two doors.
          const cont = S.continueCard(s);
          const off = cont ? 1 : 0, N = 2 + off;
          if (back) { if (s.awaiting) post({ type: "page.unask" }); else nav("landing"); break; }
          if (k === "ArrowRight") move(N, 1); if (k === "ArrowLeft") move(N, -1);
          if (k === "ArrowUp") post({ type: "nav", screen: "learner", focus: 0, from: "tonight" });
          if (k === "ArrowDown" && !s.joined) post({ type: "nav", screen: "pair", focus: 0, from: "tonight" });
          if (sel) {
            post({ type: "subject", subject: "maths" });
            if (cont && f === 0) {
              if (cont.go === "page") { post({ type: "page.select", pageIx: cont.pageIx }); nav("page"); }
              else nav(cont.go);
            } else if (f - off === 1) nav("topics");
            else { const pi = s.pages.findIndex((p) => p.subject === "maths");
              if (pi >= 0) { post({ type: "page.select", pageIx: pi }); nav("page"); } else post({ type: "page.ask", subject: "maths" }); }
          }
          break; }
        case "learner": {
          const n = s.profiles.length + 1;
          if (k === "ArrowRight") move(n, 1); if (k === "ArrowLeft") move(n, -1);
          if (back) nav(s.back ?? "landing");
          if (sel) { const p = s.profiles[f]; if (p) post({ type: "learner.set", id: p.id }); else { post({ type: "profile.draft", patch: {} }); nav("profile"); } }
          if (menu) { const p = s.profiles[f]; if (p) { post({ type: "profile.draft", patch: { id: p.id, name: p.name, type: p.type, age: p.age, system: p.system, modules: p.modules } }); nav("profile"); } }
          break; }
        case "profile": {
          // rows of picks (type, age when a school type, school system, interests, actions); Up/Down keep the column
          const rows = profileRows(s.draft), at = locate(rows, f), cell = rows[at.r].cells[at.c];
          if (k === "ArrowRight") post({ type: "focus", focus: flat(rows, at.r, at.c + 1) }); if (k === "ArrowLeft") post({ type: "focus", focus: flat(rows, at.r, at.c - 1) });
          if (k === "ArrowDown" && at.r < rows.length - 1) post({ type: "focus", focus: flat(rows, at.r + 1, at.c) }); if (k === "ArrowUp" && at.r > 0) post({ type: "focus", focus: flat(rows, at.r - 1, at.c) });
          if (sel) { if (cell.kind === "type" && cell.type) post({ type: "profile.draft", patch: { type: cell.type } });
            else if (cell.kind === "age") post({ type: "profile.draft", patch: { age: cell.age } });
            else if (cell.kind === "system" && cell.system) post({ type: "profile.draft", patch: { system: cell.system } });
            else if (cell.kind === "interest" && cell.sub) { const m = cell.sub, on = s.draft?.modules ?? []; post({ type: "profile.draft", patch: { modules: on.includes(m) ? on.filter((x) => x !== m) : [...on, m] } }); }
            else if (cell.kind === "save") post({ type: "profile.save" }); else post({ type: "profile.discard" }); }
          if (menu && !s.joined) post({ type: "nav", screen: "pair", focus: 0, from: "profile" });
          if (back) post({ type: "profile.discard" });
          break; }
        case "units": {
          if (k === "ArrowDown") move(units.length, 1); if (k === "ArrowUp") move(units.length, -1);
          if (sel) { const l = units[f]; if (l) { post({ type: "lesson.set", lesson: { id: l.id, title: l.title, t: 0, text: l.concepts.join(" · "), why: `Unit ${l.unit}, chosen by you.`, youtube: l.youtube } }); nav("lesson"); } }
          if (menu) nav(s.subject === "maths" ? "calendar" : s.subject === "english" ? "headtohead" : "playbook");
          if (back || k === "ArrowLeft") nav("tonight"); break; }
        case "calendar": {
          const n = units.length; if (k === "ArrowRight") move(n, 1); if (k === "ArrowLeft") move(n, -1); if (k === "ArrowDown") move(n, 3); if (k === "ArrowUp") move(n, -3);
          if (sel) { const l = units[f]; if (l) { post({ type: "lesson.set", lesson: { id: l.id, title: l.title, t: 0, text: l.concepts.join(" · "), why: `Unit ${l.unit}.`, youtube: l.youtube } }); nav("lesson"); } }
          if (back) nav("units"); break; }
        case "page": {
          const p = s.pages[s.pageIx]; if (!p) { if (back) nav("tonight"); break; }
          if (s.reading) break;
          if (k === "ArrowDown") post({ type: "item", itemIx: Math.min(p.items.length - 1, s.itemIx + 1) });
          if (k === "ArrowUp") post({ type: "item", itemIx: Math.max(0, s.itemIx - 1) });
          if (k === "ArrowRight" && s.pageIx < s.pages.length - 1) post({ type: "page.select", pageIx: s.pageIx + 1 });
          if (k === "ArrowLeft") { if (s.pageIx > 0) post({ type: "page.select", pageIx: s.pageIx - 1 }); else nav("tonight"); }
          if (menu) post({ type: "view", view: s.view === "band" ? "overview" : "band" });
          if (sel && p.items[s.itemIx]) call("/api/hint", {});
          if (back) nav("tonight"); break; }
        case "hint": {
          if (k === "ArrowLeft") move(2, -1); if (k === "ArrowRight") move(2, 1);
          if (sel) { if (f === 0 && s.hint?.stage === 1) call("/api/hint", { stage: 2 }); if (f === 1 && s.lesson) nav("lesson"); }
          if (back) nav("page"); break; }
        case "lesson": { if (k === " ") post({ type: "lesson.pause", paused: !s.lessonPaused }); if (back) nav(s.hint ? "hint" : "units", 1); if (menu) nav(s.subject === "english" ? "headtohead" : s.subject === "essay" ? "xray" : "calendar"); break; }
        case "sentence": { if (k === "ArrowLeft") move(2, -1); if (k === "ArrowRight") move(2, 1); if (sel && f === 1) nav("headtohead"); if (sel && f === 0) post({ type: "status", text: "say or type another sentence on the phone" }); if (back) nav("units"); break; }
        case "headtohead": if (back) nav(s.english ? "sentence" : "units"); break;
        case "essaytype": {
          if (k === "ArrowRight") move(4, 1); if (k === "ArrowLeft") move(4, -1); if (k === "ArrowDown") move(4, 2); if (k === "ArrowUp") move(4, -2);
          if (sel) { const t = ["structure", "argument", "evidence", "language"][f]; post({ type: "essay.type", essayType: t }); post({ type: "status", text: `${t} lens chosen — paste or dictate the paragraph on the phone` }); }
          if (menu) nav("playbook"); if (back) nav("tonight"); break; }
        case "forensic": { if (menu) setTable((t) => !t); if (sel) nav("playbook"); if (back) nav("essaytype"); break; }
        case "playbook": { if (k === "ArrowRight") move(4, 1); if (k === "ArrowLeft") move(4, -1); if (k === "ArrowDown") move(4, 2); if (k === "ArrowUp") move(4, -2); if (sel) nav("xray"); if (back) nav(s.essay ? "forensic" : "essaytype"); break; }
        case "xray": if (back) nav("playbook"); break;
        case "break": if (sel) post({ type: "timer.skipbreak" }); break;
        case "topics": {
          if (k === "ArrowRight") move(SYLLABUS.length, 1); if (k === "ArrowLeft") move(SYLLABUS.length, -1);
          if (k === "ArrowUp" || menu) nav("standing", f);
          if (sel && !busy) { const t = SYLLABUS[f]; if (t) { setBusy(true); post({ type: "topic.open", topic: t.id });
            // P2 answers with practice.set over the session stream; a failure leaves the wait on screen
            call("/api/practice", { topic: t.id }).catch(() => {}); } }
          if (back) nav("tonight"); break; }
        case "practice": { if (back) post({ type: "practice.clear" }).then(() => nav("topics")); break; }
        case "walk": {
          const items = s.practice?.items ?? [];
          if (k === "ArrowRight") post({ type: "walk", ix: s.walkIx + 1 });
          if (k === "ArrowLeft") post({ type: "walk", ix: s.walkIx - 1 });
          if (sel && s.walkIx === items.length - 1) post({ type: "practice.clear" });
          if (back) post({ type: "practice.clear" });
          break; }
        case "standing": {
          if (k === "ArrowUp") move(SYLLABUS.length, 1); if (k === "ArrowDown") move(SYLLABUS.length, -1);
          if (back || menu) nav("topics", f); break; }
        case "recap": { if (k === "ArrowLeft") move(2, -1); if (k === "ArrowRight") move(2, 1); if (sel && f === 0) post({ type: "status", text: "recap sent to the parent's phone" }); if ((sel && f === 1) || back) nav("tonight"); break; }
      }
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, [s, post, busy]);

  return (
    <div className="bench">
      <div className="bar">
        <b>Study Desk · TV</b>
        <span><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> D-pad · <kbd>Enter</kbd> Select · <kbd>Backspace</kbd> Back · <kbd>M</kbd> Menu · <kbd>Space</kbd> Play/Pause</span>
        <button aria-pressed={voice} onClick={() => setVoice((v) => !v)}>Voice</button>
        <button aria-pressed={fast} onClick={() => setFast((v) => !v)}>Clock ×60</button>
        <button onClick={() => post({ type: "reset" })}>Reset session</button>
        <button onClick={() => post({ type: "join" })}>Fake phone</button>
        <span className="status">{connected ? "" : "reconnecting… "}{s?.status}</span>
      </div>
      <div className="frame" ref={frame}>
        <div className="stage" ref={stage} tabIndex={0}>
          <div className="grid" />
          <div className="safe">{s ? <ScreenFor s={s} table={table} busy={busy} /> : null}</div>
        </div>
      </div>
    </div>
  );
}

function ScreenFor({ s, table, busy }: { s: Session; table: boolean; busy: boolean }) {
  const f = s.focus;
  switch (s.screen) {
    case "landing": return <S.Landing s={s} focus={f} />;
    case "pair": return <S.Pair s={s} />;
    case "joined": return <S.Joined s={s} />;
    case "tonight": return <S.Tonight s={s} focus={f} />;
    case "learner": return <S.Learner s={s} focus={f} />;
    case "profile": return <S.ProfileScreen s={s} focus={f} />;
    case "units": return <S.Units s={s} focus={f} />;
    case "calendar": return <S.Calendar s={s} focus={f} />;
    case "page": return <S.PageScreen s={s} view={s.view} />;
    case "hint": return <S.HintScreen s={s} focus={f} />;
    case "lesson": return <S.LessonScreen s={s} />;
    case "sentence": return <S.SentenceScreen s={s} focus={f} />;
    case "headtohead": return <S.HeadToHead s={s} />;
    case "essaytype": return <S.EssayType s={s} focus={f} />;
    case "forensic": return <S.Forensic s={s} table={table} />;
    case "playbook": return <S.Playbook s={s} focus={f} />;
    case "xray": return <S.Xray s={s} />;
    case "break": return <S.BreakScreen s={s} />;
    case "recap": return <S.Recap s={s} focus={f} />;
    case "topics": return <S.Topics s={s} focus={f} busy={busy} />;
    case "practice": return <S.PracticeScreen s={s} />;
    case "walk": return <S.Walk s={s} focus={f} />;
    case "standing": return <S.Standing s={s} focus={f} />;
  }
}
