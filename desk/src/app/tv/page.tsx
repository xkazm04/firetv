"use client";
/**
 * The television. One 1920×1080 stage scaled to the window; the keyboard is the D-pad
 * (arrows, Enter = Select, Backspace/Escape = Back, M = Menu, Space = Play/Pause).
 * Everything it shows comes from the session stream; everything it changes is an event.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession, call } from "@/tv/useSession";
import type { Session } from "@/lib/session/store";
import * as S from "@/tv/screens";
import { keyOf, lingaOwns, runStep, tvKey, LOCAL, type Local } from "@/tv/keys";
import { LingaTV } from "@/english/LingaTV";
import { LingaTestBar } from "@/english/LingaTestBar";

export default function TV() {
  const { s, connected, post } = useSession();
  const [voice, setVoice] = useState(true);
  const [fast, setFast] = useState(false);
  /** TEMPORARY: the Linga test answer bar, dev builds only — open with ?test=1, close with ?test=0. */
  const [testBar, setTestBar] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const q = new URLSearchParams(location.search).get("test");
    try { if (q !== null) sessionStorage.setItem("desk-test", q === "0" ? "" : "1"); setTestBar(!!sessionStorage.getItem("desk-test")); } catch { setTestBar(q === "1"); }
  }, []);
  /**
   * The TV's own state (tv/keys.ts `Local`): a practice set asked for and not arrived, the forensic
   * table, a hint on its way. The ref is what the keymap reads, so two quick presses see the same truth.
   */
  const [loc, setLoc] = useState<Local>(LOCAL);
  const local = useRef<Local>(LOCAL);
  const apply = useCallback((p: Partial<Local>) => { local.current = { ...local.current, ...p }; setLoc(local.current); }, []);
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spoken = useRef<string>("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const linkedModule = useRef(false);
  useEffect(() => {
    if (!s || linkedModule.current) return;
    linkedModule.current = true;
    if (new URLSearchParams(window.location.search).get("module") === "english") {
      void post({ type: "subject", subject: "english" }).then(() => post({ type: "nav", screen: "linga" }));
    }
  }, [s, post]);
  useEffect(() => {
    if (s && lingaOwns(s)) {
      audio.current?.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }
  }, [s?.screen, s?.subject]);

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
  useEffect(() => { if (s && s.screen !== "topics" && local.current.busy) apply({ busy: false }); }, [s?.screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // the demo clock: ×60 when asked, so the break screen is reachable
  useEffect(() => { if (!fast) return; const t = setInterval(() => post({ type: "timer.tick", seconds: 59 }), 1000); return () => clearInterval(t); }, [fast, post]);

  // ---- D-pad: the keymap is tv/keys.ts; this is only its executor ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!s || lingaOwns(s)) return;
      const k = keyOf(e.key); if (!k) return;
      e.preventDefault();
      void runStep(tvKey(s, k, local.current), { post, call, apply });
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, [s, post, apply]);

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
      {testBar && s && lingaOwns(s) && <LingaTestBar s={s} />}
      <div className="frame" ref={frame}>
        <div className="stage" ref={stage} tabIndex={0}>
          <div className="grid" />
          <div className="safe">{s ? lingaOwns(s) ? <LingaTV s={s} post={post} voice={voice}/> : <ScreenFor s={s} table={loc.table} busy={loc.busy} /> : null}</div>
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
    case "sheet": return <S.Sheet s={s} focus={f} />;
    case "walk": return <S.Walk s={s} focus={f} />;
  }
}
