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
import { WritingTV } from "@/writing/WritingTV";
import { essayOwns, keyOf, landingAt, landingStops, lingaOwns, mathsOwns, paperOwns, resumeStep, runStep, tvKey, LOCAL, type LandingStop, type Local } from "@/tv/keys";
import { LandingTV, ZOOM_MS } from "@/landing/LandingTV";
import { MathsTV } from "@/maths/MathsTV";
import { LingaTV } from "@/english/LingaTV";
import { spokenLine } from "@/lib/desk/spoken";
import { useDeskSound } from "@/tv/useDeskSound";
import { LingaTestBar } from "@/english/LingaTestBar";
import { LookWait } from "@/tv/LookWait";
import { LOOK_KEY, READING_LINE, WAIT_LINE, lookOfWait, lookToRemember, parseLook, type Look } from "@/tv/look";

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
  /** Effects and the home/break music (lib/desk/sounds.ts). On unless this browser was told otherwise. */
  const [sound, setSound] = useState(true);
  useEffect(() => { try { if (localStorage.getItem("desk-sound") === "off") setSound(false); } catch { /* storage refused: sound stays on */ } }, []);
  const toggleSound = () => setSound((v) => { try { localStorage.setItem("desk-sound", v ? "off" : "on"); } catch { /* not remembered */ } return !v; });
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
  const fx = useDeskSound(s, sound);
  const fxNow = useRef(fx); fxNow.current = fx;
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

  // the look a wait is drawn in (tv/look.ts): the module the TV last drew, remembered by this browser, so the first paint before the session
  // arrives is that module's ground and not On Air's grid; neutral until it is known
  const [look, setLook] = useState<Look>("neutral");
  useEffect(() => { try { setLook(parseLook(localStorage.getItem(LOOK_KEY))); } catch { /* storage refused: the wait stays neutral */ } }, []);
  useEffect(() => {
    const next = lookToRemember(s, look); if (next === look) return;
    setLook(next); try { localStorage.setItem(LOOK_KEY, next); } catch { /* not remembered */ }
  }, [s?.screen, s?.subject]); // eslint-disable-line react-hooks/exhaustive-deps

  const [display, setDisplay] = useState<Display>("tv");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("display");
    try { if (q === "tv" || q === "desk") localStorage.setItem("desk-display", q); setDisplay(localStorage.getItem("desk-display") === "desk" ? "desk" : "tv"); }
    catch { setDisplay(q === "desk" ? "desk" : "tv"); }
  }, []);
  const toggleDisplay = () => setDisplay((d) => { const n = d === "desk" ? "tv" : "desk"; try { localStorage.setItem("desk-display", n); } catch { /* storage is blocked: the choice holds for this page only */ } return n; });
  /** The stage this screen is drawn on. The landing is one picture with nothing more to fit, so it keeps the TV's. */
  const shown: Display = s?.screen === "landing" ? "tv" : display;

  // fit the whole stage in its box (width and height), centred; the box is what the bar leaves of the window.
  // The fit is a zoom, not a scale(): Chrome rasters a composited layer (an animated or will-change one) at no less
  // than its own scale 1, so under a scale(.5) stage every such layer on the stick was rastered at four times its
  // pixels - 107 MB of the WebView's 80 MB tile budget on the landing, and a second raster after each lamp move. Under a
  // zoom the layers are laid out at the window's resolution and rastered once at it
  // (docs/concepts/STICK-PERFORMANCE-2026-10-21.md). The translate is in the stage's zoomed px, hence the / k.
  useEffect(() => {
    const { w, h } = STAGE[shown];
    const fit = () => {
      if (!frame.current || !stage.current) return;
      const r = frame.current.getBoundingClientRect(), k = Math.min(r.width / w, r.height / h);
      stage.current.style.zoom = String(k);
      stage.current.style.transform = `translate(${Math.round((r.width - w * k) / 2) / k}px, ${Math.round((r.height - h * k) / 2) / k}px)`;
    };
    fit(); const ro = new ResizeObserver(fit); if (frame.current) ro.observe(frame.current); return () => ro.disconnect();
  }, [s?.screen, shown]);

  // speak what is new: the hint, the explanation, the verdict. Each line's blob is let go when it ends or the next
  // line replaces it (as english/useEnglishAudio.ts does), so an evening of lines holds one, not hundreds.
  useEffect(() => {
    if (!s || !voice) return;
    const line = spokenLine(s);
    if (!line || line === spoken.current) return;
    spoken.current = line;
    (async () => {
      try { const r = await call("/api/speak", { text: line }); if (!r.ok) throw new Error(); const blob = await r.blob();
        const old = audio.current; old?.pause(); if (old?.src.startsWith("blob:")) URL.revokeObjectURL(old.src);
        const next = new Audio(URL.createObjectURL(blob)); next.onended = () => { URL.revokeObjectURL(next.src); fxNow.current.duck(false); };
        fxNow.current.duck(true);
        audio.current = next; await next.play(); }
      catch { try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(line)); } catch (e) { console.warn("desk TV: neither the voice nor the browser could say the line; it stays on screen", e); } }
    })();
  }, [s, voice]);

  // the wait for a practice set belongs to the topics screen only
  // (and to Get ready for school, which writes a set from its own screen, Family W8); the two-cell question there is its own
  useEffect(() => {
    if (!s) return;
    if (s.screen !== "topics" && s.screen !== "prepare" && local.current.busy) apply({ busy: false });
    if (s.screen !== "prepare" && local.current.prepareAsk !== null) apply({ prepareAsk: null });
  }, [s?.screen]); // eslint-disable-line react-hooks/exhaustive-deps

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
  // the session changes on every message (the clock ticks): the handler reads the newest one through a ref, so the listener is bound once
  const sNow = useRef(s); sNow.current = s;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = sNow.current;
      if (!s || notTheTV(s)) return;
      const k = keyOf(e.key); if (!k) return;
      // Select and Back sound on every screen, Linga's too (it keeps its own keymap); not while the landing zooms
      if ((k === "select" || k === "back") && !zooming.current) fxNow.current.cue(k);
      if (lingaOwns(s)) return;
      e.preventDefault();
      if (zooming.current) return;
      const step = tvKey(s, k, local.current);
      const stop = s.screen === "landing" && k === "select" ? landingStops(s)[landingAt(s)] : undefined;
      if (stop && step.events.some((x) => x.type === "nav")) {
        const cut = matchMedia("(prefers-reduced-motion: reduce)").matches;
        zooming.current = true; setZoom(stop);
        setTimeout(() => { void runStep(step, { post, call, apply }).catch((e) => console.error("desk TV: a landing step failed", e)); }, cut ? 0 : ZOOM_MS);
        // a post that never lands must not leave the desk frozen behind the zoom
        setTimeout(() => { if (zooming.current) { zooming.current = false; setZoom(null); } }, 4000);
        return;
      }
      void runStep(step, { post, call, apply });
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, [post, apply]);

  // a phone joined for a wish the TV could not carry out alone (session.pairFor.ready): run the held Select once (tv/keys resumeStep)
  const resumed = useRef(0);
  useEffect(() => {
    const pf = s?.pairFor;
    if (!s || !pf?.ready || resumed.current === pf.at || notTheTV(s) || lingaOwns(s)) return;
    const step = resumeStep(s, local.current);
    if (!step) return;
    resumed.current = pf.at;
    void runStep(step, { post, call, apply });
  }, [s, post, apply]);

  return (
    <div className="bench" ref={bench}>
      <div className="bar">
        <b>Study Desk · TV</b>
        <span><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> D-pad · <kbd>Enter</kbd> Select · <kbd>Backspace</kbd> Back · <kbd>M</kbd> Menu · <kbd>Space</kbd> Play/Pause</span>
        <button aria-pressed={voice} onClick={() => setVoice((v) => !v)}>Voice</button>
        <button aria-pressed={sound} onClick={toggleSound}>Sound</button>
        <button aria-pressed={fast} onClick={() => setFast((v) => !v)}>Clock ×60</button>
        <button onClick={() => post({ type: "reset" })}>Reset session</button>
        <button onClick={() => post({ type: "join" })}>Fake phone</button>
        <button aria-pressed={display === "desk"} onClick={toggleDisplay} title="A 2880×1620 stage for a PC monitor; off is the 1920×1080 TV">Desk display</button>
        <button onClick={() => void bench.current?.requestFullscreen().catch(() => { /* the browser refused: the operator's bench stays windowed */ })} title="The stage alone; Esc leaves">Fullscreen</button>
        <span className="status">{connected ? "" : "reconnecting… "}{s?.status}</span>
      </div>
      {testBar && s && lingaOwns(s) && <LingaTestBar s={s} />}
      <div className="frame" ref={frame}>
        <div className="stage" ref={stage} tabIndex={0} data-display={shown}>
          {!connected && <div role="alert" data-role="link-lost" style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, padding: "18px 0", textAlign: "center", fontSize: 40, background: "#7A1E12", color: "#FFE3DD" }}>Lost the desk link. Reconnecting.</div>}
          {/* The landing (the desk), Essay Master (Specimen) and Math Buddy (Lamplight) draw the whole stage, no On Air grid or band; each keeps the 5% margins itself */}
          {!s ? <LookWait look={look} line={WAIT_LINE[look]} /> : notTheTV(s) ? <NotThisTV /> : lookOfWait(s) ? <LookWait look={lookOfWait(s)!} line={READING_LINE} /> : s.screen === "landing" ? <LandingTV s={s} zoom={zoom} /> : essayOwns(s) ? <EssayTV s={s} table={loc.table} /> : (mathsOwns(s) || paperOwns(s)) ? <MathsTV s={s} busy={loc.busy} ask={loc.prepareAsk} /> : <>
            <div className="grid" />
            <div className="safe">{lingaOwns(s) ? <LingaTV s={s} post={postOnly} voice={voice}/> : <ScreenFor s={s} />}</div>
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
    case "writing": return <WritingTV s={s} />;
    default: return null;
  }
}
