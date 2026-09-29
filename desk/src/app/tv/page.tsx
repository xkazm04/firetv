"use client";
/**
 * The television. One 1920×1080 stage fitted to the window (a 2880×1620 stage in the bench's Desk display); the keyboard is the D-pad
 * (arrows, Enter = Select, Backspace/Escape = Back, M = Menu, Space = Play/Pause).
 * Everything it shows comes from the session stream; everything it changes is an event.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession, call } from "@/tv/useSession";
import type { Event, Session } from "@/lib/session/store";
import * as S from "@/tv/screens";
import { EssayTV } from "@/essay/EssayTV";
import { essayOwns, keyOf, landingAt, landingStops, lingaOwns, mathsOwns, runStep, tvKey, LOCAL, type LandingStop, type Local } from "@/tv/keys";
import { LandingTV, ZOOM_MS } from "@/landing/LandingTV";
import { MathsTV } from "@/maths/MathsTV";
import { LingaTV } from "@/english/LingaTV";
import { LingaTestBar } from "@/english/LingaTestBar";

/**
 * The bench's display. "tv" is the television: a 1920×1080 stage, what the device, the captures and the tests see.
 * "desk" is for testing on a PC monitor: a 2880×1620 stage, so every element is two thirds of its TV size and the
 * layouts that stretch get the room. Chosen with ?display=desk|tv or the bar's toggle; this browser remembers it.
 */
type Display = "tv" | "desk";
const STAGE: Record<Display, { w: number; h: number }> = { tv: { w: 1920, h: 1080 }, desk: { w: 2880, h: 1620 } };

export default function TV() {
  const { s, connected, post } = useSession();
  const postOnly = useCallback(async (e: Event) => { await post(e); }, [post]);
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
  const bench = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spoken = useRef<string>("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const linkedModule = useRef(false);
  useEffect(() => {
    if (!s || linkedModule.current || notTheTV(s)) return;
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

  const [display, setDisplay] = useState<Display>("tv");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("display");
    try { if (q === "tv" || q === "desk") localStorage.setItem("desk-display", q); setDisplay(localStorage.getItem("desk-display") === "desk" ? "desk" : "tv"); }
    catch { setDisplay(q === "desk" ? "desk" : "tv"); }
  }, []);
  const toggleDisplay = () => setDisplay((d) => { const n = d === "desk" ? "tv" : "desk"; try { localStorage.setItem("desk-display", n); } catch {} return n; });
  /** The stage this screen is drawn on. The landing is one picture with nothing more to fit, so it keeps the TV's. */
  const shown: Display = s?.screen === "landing" ? "tv" : display;

  // fit the whole stage in its box (width and height), centred; the box is what the bar leaves of the window
  useEffect(() => {
    const { w, h } = STAGE[shown];
    const fit = () => {
      if (!frame.current || !stage.current) return;
      const r = frame.current.getBoundingClientRect(), k = Math.min(r.width / w, r.height / h);
      stage.current.style.transform = `translate(${Math.round((r.width - w * k) / 2)}px, ${Math.round((r.height - h * k) / 2)}px) scale(${k})`;
    };
    fit(); const ro = new ResizeObserver(fit); if (frame.current) ro.observe(frame.current); return () => ro.disconnect();
  }, [s?.screen, shown]);

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

  /**
   * The landing's Select: the lit object zooms into its app's colours, then the step runs. While it plays the
   * D-pad waits. Under reduced motion the zoom is a cut and the app opens at once.
   */
  const [zoom, setZoom] = useState<LandingStop | null>(null);
  const zooming = useRef(false);
  useEffect(() => { if (s?.screen !== "landing" && zooming.current) { zooming.current = false; setZoom(null); } }, [s?.screen]);

  // ---- D-pad: the keymap is tv/keys.ts; this is only its executor ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!s || notTheTV(s) || lingaOwns(s)) return;
      const k = keyOf(e.key); if (!k) return;
      e.preventDefault();
      if (zooming.current) return;
      const step = tvKey(s, k, local.current);
      const stop = s.screen === "landing" && k === "select" ? landingStops(s)[landingAt(s)] : undefined;
      if (stop && step.events.some((x) => x.type === "nav")) {
        const cut = matchMedia("(prefers-reduced-motion: reduce)").matches;
        zooming.current = true; setZoom(stop);
        setTimeout(() => { void runStep(step, { post, call, apply }).catch(() => {}); }, cut ? 0 : ZOOM_MS);
        // a post that never lands must not leave the desk frozen behind the zoom
        setTimeout(() => { if (zooming.current) { zooming.current = false; setZoom(null); } }, 4000);
        return;
      }
      void runStep(step, { post, call, apply });
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, [s, post, apply]);

  return (
    <div className="bench" ref={bench}>
      <div className="bar">
        <b>Study Desk · TV</b>
        <span><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> D-pad · <kbd>Enter</kbd> Select · <kbd>Backspace</kbd> Back · <kbd>M</kbd> Menu · <kbd>Space</kbd> Play/Pause</span>
        <button aria-pressed={voice} onClick={() => setVoice((v) => !v)}>Voice</button>
        <button aria-pressed={fast} onClick={() => setFast((v) => !v)}>Clock ×60</button>
        <button onClick={() => post({ type: "reset" })}>Reset session</button>
        <button onClick={() => post({ type: "join" })}>Fake phone</button>
        <button aria-pressed={display === "desk"} onClick={toggleDisplay} title="A 2880×1620 stage for a PC monitor; off is the 1920×1080 TV">Desk display</button>
        <button onClick={() => void bench.current?.requestFullscreen().catch(() => {})} title="The stage alone; Esc leaves">Fullscreen</button>
        <span className="status">{connected ? "" : "reconnecting… "}{s?.status}</span>
      </div>
      {testBar && s && lingaOwns(s) && <LingaTestBar s={s} />}
      <div className="frame" ref={frame}>
        <div className="stage" ref={stage} tabIndex={0} data-display={shown}>
          {/* The landing (the desk), Essay Master (Specimen) and Math Buddy (Lamplight) draw the whole stage, no On Air grid or band; each keeps the 5% margins itself */}
          {s && notTheTV(s) ? <NotThisTV /> : s && s.screen === "landing" ? <LandingTV s={s} zoom={zoom} /> : s && essayOwns(s) ? <EssayTV s={s} table={loc.table} /> : s && mathsOwns(s) ? <MathsTV s={s} busy={loc.busy} /> : <>
            <div className="grid" />
            <div className="safe">{s ? lingaOwns(s) ? <LingaTV s={s} post={postOnly} voice={voice}/> : <ScreenFor s={s} /> : null}</div>
          </>}
        </div>
      </div>
    </div>
  );
}

/**
 * A browser without the desk's key sees the lobby (lib/session/pairing.ts), not the desk: it is not this desk's
 * TV until it opens the address the desk printed at start (/tv?key=...). One On Air line, nothing to press.
 */
const notTheTV = (s: Session) => s.viewer === "guest" || s.viewer === "phone";
function NotThisTV() {
  return (<>
    <div className="grid" />
    <div className="band band-rule" />
    <main className="content-full" data-role="not-this-tv" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
      <div style={{ maxWidth: 1200 }}>
        <div className="title">Not this desk&rsquo;s TV</div>
        <div className="cap-text" style={{ marginInline: "auto" }}>Open the TV address the desk printed.</div>
      </div>
    </main>
  </>);
}

/** The shell's screens (On Air). The landing, Math Buddy's and Essay Master's are drawn before this is asked. */
function ScreenFor({ s }: { s: Session }) {
  const f = s.focus;
  switch (s.screen) {
    case "pair": return <S.Pair s={s} />;
    case "joined": return <S.Joined s={s} />;
    case "learner": return <S.Learner s={s} focus={f} />;
    case "profile": return <S.ProfileScreen s={s} focus={f} />;
    case "units": return <S.Units s={s} focus={f} />;
    case "page": return <S.PageScreen s={s} view={s.view} />;
    case "hint": return <S.HintScreen s={s} focus={f} />;
    case "lesson": return <S.LessonScreen s={s} />;
    case "sentence": return <S.SentenceScreen s={s} focus={f} />;
    case "headtohead": return <S.HeadToHead s={s} />;
    case "break": return <S.BreakScreen s={s} />;
    case "recap": return <S.Recap s={s} focus={f} />;
    default: return null;
  }
}
