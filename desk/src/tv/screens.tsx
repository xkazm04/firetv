"use client";
/**
 * The shell's television screens, composed on On Air: pairing, the learner and profile picks, the break and
 * the recap, and the page / hint / lesson / units screens when English or Essay Master is on the desk. The
 * landing is the desk itself (landing/LandingTV.tsx); Math Buddy draws its own (maths/MathsTV.tsx), Linga and
 * Essay Master theirs. Each takes the session and a `focus` index and draws itself from its stop list in
 * tv/keys.ts - the same list the D-pad there walks, so a stop is added or moved in one place.
 */
import { failedReadLine, markedLine, missingLine } from "@/tv/pageLines";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Profile, Session } from "@/lib/session/store";
import { fmt } from "./useSession";
import { playerCommand, stopAt, learnerStops, switchEndsLine, unitStops, recapStops, HINT_STOPS, SENTENCE_STOPS, essayHandoffOf, essayHandoffLine } from "./keys";
import { lessonStates } from "@/lib/library/watched";
import { pathOf } from "@/lib/library/paths";
import { recapRows, recapCaption, railOf, setMarks, RECAP_READINGS, RECAP_SLIPS, type RecapTile, type MathsTile, type LingaTile, type EssayTile } from "./recapRows";
import type { Mark } from "@/lib/rules/marks";
import { MathsMark, EssayBrand, EssayArrow } from "./marks";
import { MATHS_FONTS } from "@/maths/fonts";
import { Mark as LingaMark } from "@/english/OpenDoor";
import { ESSAY_FONTS } from "@/essay/fonts";

/** The OCR writes exponents as ^n and the tutor may too; the screen shows them as printed. */
export const shown = (s: string) => s.replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/\*\*/g, "").replace(/\$/g, "");
import { BRAND, TYPE_WORDS, profileRows, locate, onModules, yearOf } from "@/tv/profileRows";
import { modeOf } from "@/lib/rules/mode";
const NAME = BRAND;

function Rail({ s }: { s: Session }) {
  return (
    <aside className="rail">
      <div className="learner"><small>Now studying</small>{s.learner?.name}</div>
      <div>{onModules(s).map((x) => <div key={x} className="subj" data-on={s.subject === x}>{NAME[x]}</div>)}</div>
      <div className="clock" data-phase={s.timer.phase}>{fmt(s.timer.left)}<small>{s.timer.running ? (s.timer.phase === "work" ? "On the clock" : "Break") : s.log.started ? "Paused" : "Press Play to start"}</small></div>
    </aside>
  );
}

// ---- T0 ----
/** The moment after pairing: the phone is on the desk. One picture, one instruction, one action. */
export function Joined({ s }: { s: Session }) {
  return (<>
    <div className="band band-low" />
    <main className="content-full">
      <div className="eyebrow">Paired</div>
      <div className="title" style={{ maxWidth: 900 }}>{s.learner ? `${s.learner.name}’s phone` : "The phone"} is on the desk</div>
      <img src="/brand/paired.png" alt="" style={{ position: "absolute", right: 0, top: 40, width: 760, height: 520, objectFit: "contain" }} />
      <div style={{ position: "absolute", left: 0, bottom: 216, maxWidth: 900 }}>
        <span className="cap">What now</span>
        <div className="cap-text">{s.learner ? "Select: go to the desk" : "Paired. Select: choose who is studying"}</div>
      </div>
      <div className="actions"><button className="btn" data-focused>The desk</button></div>
    </main>
  </>);
}
export function Pair({ s }: { s: Session }) {
  const url = s.phoneUrl + "?pin=" + s.pin;
  // qrcode's browser build draws the code; generated here so the store stays free of UI.
  const [svg, setSvg] = useState("");
  useEffect(() => { let live = true; QRCode.toString(url, { type: "svg", margin: 1 }).then((x) => { if (live) setSvg(x); }).catch((e) => console.error("desk TV: the pairing QR could not be drawn; the code is still shown to type", e)); return () => { live = false; }; }, [url]);
  return (<>
    <div className="band band-rule" />
    <div className="content-full" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
      <div style={{ maxWidth: 1100 }}>
        <div className="eyebrow">Study Desk · pair a phone</div>
        {s.joined && <div className="body" data-role="phones-here" style={{ marginTop: 16 }}>{s.phonesLive > 0 ? `${s.phonesLive} ${s.phonesLive === 1 ? "phone" : "phones"} here` : "No phone here"}</div>}
        <div className="qr" style={{ margin: "40px auto 28px", width: 300, height: 300, background: "#fff", display: "grid", placeItems: "center" }} dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="lt" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="tag">Code</div>
          <div className="txt" style={{ letterSpacing: ".3em", fontVariantNumeric: "tabular-nums" }}>{s.pin}</div>
        </div>
        <div className="body" style={{ color: "var(--mute)", marginTop: 24 }}>Scan, or open <span style={{ color: "var(--paper)" }}>{s.phoneUrl.replace(/^https?:\/\//, "")}</span> on your phone and type the code.</div>
      </div>
    </div>
    {s.joined && <div className="actions" style={{ display: "flex", gap: 24, justifyContent: "center" }}><button className="btn" data-focused={s.focus !== 1}>Pair another</button><button className="btn" data-focused={s.focus === 1}>Forget every phone</button></div>}
    <div className="ticker"><span>Waiting for a phone</span><i>·</i><span>code <b>{s.pin}</b></span><i>·</i><span>same Wi-Fi as the TV</span></div>
  </>);
}


export { day } from "@/tv/day";

// ---- T2 Units (guide) ----
export function Units({ s, focus }: { s: Session; focus: number }) {
  const list = unitStops(s), state = lessonStates(list, s.history);
  const cur = stopAt(list, focus);
  return (<>
    <div className="band band-right" />
    <main className="content-full">
      <div className="eyebrow" data-ch={s.subject}>{NAME[s.subject]} · units</div>
      <div className="title">Lessons on file</div>
      <div className="guide" style={{ position: "absolute", left: 0, top: 130, width: 900 }}>
        {list.map((l, i) => (
          <div key={l.id} className="row" data-focused={l === cur} data-done={state[i] === "done"}>
            <div className="u">Unit {l.unit}</div>
            <div className="t">{l.title}{state[i] === "next" && <span className="pill">next</span>}{state[i] === "done" && <span className="pill" data-kind="done">watched</span>}</div>
            <div className="d">{l.minutes} min</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 980, top: 130, width: 748 }}>
        <span className="cap">From unit {cur?.unit}</span>
        <div className="headline" style={{ marginTop: 18, fontSize: 40 }}>{cur?.title}</div>
        <div className="body" style={{ marginTop: 20, color: "var(--mute)" }}>Teaches: {cur?.concepts.join(" · ")}</div>
      </div>
      <div className="ticker"><span><b>{list.length}</b> units</span><i>·</i><span>{state.filter((x) => x === "done").length} watched</span><i>·</i><span>{s.subject === "maths" ? "Menu for the calendar" : s.subject === "english" ? "Menu for the head-to-head" : "Menu for the playbook"}</span></div>
    </main>
  </>);
}


// ---- T3 Page ----
export function PageScreen({ s, view }: { s: Session; view: "band" | "overview" }) {
  const p = s.pages[s.pageIx]; if (!p) return <main className="content-full"><div className="title">No page yet</div></main>;
  const it = p.items[s.itemIx];
  const W = 1728, H = 520, scale = W / p.w;
  const bh = it ? (it.band[1] - it.band[0]) * scale : 0;
  const top = it ? Math.max(0, Math.min(p.h * scale - H, it.band[0] * scale - bh * 0.9)) : 0;
  const ovScale = H / p.h;
  // what the pipelines behind this page are doing, in the caption: a read that failed, a hint on its way or not coming
  const read = s.jobs?.read?.key === p.id ? s.jobs.read : undefined, hj = it && s.jobs?.hint?.key === it.key ? s.jobs.hint : undefined;
  const pageLine = read?.phase === "failed" ? failedReadLine(p.subject) : hj?.phase === "running" ? "thinking about a hint…" : hj?.phase === "failed" ? (hj.retry === false ? "no hint for this one" : "no hint that time — Select to try again") : p.missing?.length ? missingLine(p.missing) : p.marked ? markedLine(p.marked.items) : undefined;
  return (<>
    <div className="band band-rule" />
    <main className="content-full">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div><div className="eyebrow" data-ch={p.subject}>{NAME[p.subject]} · the page</div><div className="headline" style={{ fontFamily: "var(--display)", fontWeight: 800, textTransform: "uppercase", fontSize: 56 }}>{p.title}</div></div>
        <div className="chan" style={{ color: "var(--mute)" }}>page {s.pageIx + 1} / {s.pages.length}</div>
      </div>
      <div className="read" data-reading={s.reading} style={{ marginTop: 24, height: H, width: W }}>
        {view === "band" ? (<>
          <img className="img" src={p.img} alt="" style={{ transform: `translateY(${-top}px)` }} />
          {it && <div className="focus-band" style={{ top: it.band[0] * scale - top, height: bh }} />}
        </>) : (<>
          <img className="img" src={p.img} alt="" style={{ width: p.w * ovScale, left: (W - p.w * ovScale) / 2 }} />
          {it && <div className="focus-band" style={{ top: it.band[0] * ovScale, height: (it.band[1] - it.band[0]) * ovScale, left: (W - p.w * ovScale) / 2, right: (W - p.w * ovScale) / 2 }} />}
        </>)}
        {(s.reading || pageLine) && <div className="cap" style={{ position: "absolute", left: 30, bottom: 24, zIndex: 2 }}>{s.reading ? "reading the page…" : pageLine}</div>}
      </div>
      {it && !s.reading && (
        <div className="lt" style={{ marginTop: 24, maxWidth: 1728 }}><div className="tag">{p.subject === "essay" ? `¶ ${it.n}` : `Item ${it.n}`}</div><div className="txt" style={{ fontSize: 36 }}>{p.subject === "essay" ? it.text.slice(0, 110) + (it.text.length > 110 ? "…" : "") : shown(it.text)}</div></div>
      )}
      <div className="strip" style={{ position: "absolute", left: 0, bottom: 0 }}>
        {s.pages.map((pg, i) => <div key={pg.id} className="thumb" data-current={i === s.pageIx} style={{ backgroundImage: `url(${pg.img})` }} />)}
      </div>
      <div className="ticker" style={{ left: 120 * s.pages.length + 40 }}>
        <span>{p.items.length} items</span><i>·</i><span>{p.readMs ? `read in ${(p.readMs / 1000).toFixed(0)} s` : read?.phase === "failed" ? "not read" : "reading"}</span><i>·</i><span>{hj?.phase === "failed" && hj.retry !== false ? "Select to try again" : "Select for a hint"}</span><i>·</i><span>Menu for the overview</span>
      </div>
    </main>
  </>);
}

// ---- T4 Hint ----
export function HintScreen({ s, focus }: { s: Session; focus: number }) {
  const h = s.hint;
  // nothing to explain (the hint was cleared under the screen): one ask, not a blank stage
  if (!h) return (<>
    <div className="band band-left" />
    <main className="content-full">
      <div className="eyebrow" style={{ marginTop: 40 }}>{NAME[s.subject]} · hint</div>
      <div className="title" style={{ marginTop: 50 }}>No hint yet</div>
      <div style={{ position: "absolute", left: 0, bottom: 216 }}><span className="cap">Back</span><div className="cap-text">Press Back to return to the page, then Select on an item for a hint.</div></div>
    </main>
  </>);
  const hh = h.stage === 2 ? h.hint2 : h.hint1;
  const p = s.pages[s.pageIx];
  const at = stopAt(HINT_STOPS, focus);
  // the lesson pick runs as its own job, keyed to this hint: under way, found, none, or failed
  const pick = s.jobs?.lesson?.key === h.key ? s.jobs.lesson : undefined;
  const pickFailed = pick?.phase === "failed" ? pick.error ?? "" : null;
  return (<>
    <div className="band band-left" /><Rail s={s} />
    <main className="content">
      <div className="lt"><div className="tag">{p?.subject === "essay" ? "Your question" : `Item ${p?.items[s.itemIx]?.n ?? ""}`}</div><div className="txt">{shown(h.problem)}</div></div>
      {h.askedQ && <div className="body" style={{ marginTop: 18, color: "var(--mute)" }}>Asked from the phone: <b style={{ color: "#fff", fontWeight: 500 }}>{h.askedQ}</b></div>}
      <div style={{ marginTop: 40 }}>
        <span className="cap">{h.stage === 2 ? "Hint · one step further" : "Hint · first look"}</span>
        <div className="cap-text">{hh ? shown(hh.hint) : "…"}</div>
        {hh?.next && <div className="cap-next">→ {shown(hh.next)}</div>}
      </div>
      {h.rule && (
        <dl className="rule" style={{ marginTop: 32 }}>
          <dt>Tense</dt><dd>{h.rule.name} — because of {h.rule.tenseReason}</dd>
          <dt>Used for</dt><dd>{h.rule.when}</dd>
          <dt>Find it</dt><dd>{h.rule.findIt}</dd>
          {h.rule.warning && <div className="warn">{h.rule.warning}</div>}
        </dl>
      )}
      {s.noLesson && <div className="body" style={{ marginTop: 28, color: "var(--mute)", maxWidth: "40ch" }}>{pickFailed ? `${pickFailed} The hint is all there is this time.` : <>No lesson in tonight&apos;s library covers this one. The hint is all there is — and that is fine.</>}</div>}
      <div className="actions">
        <button className="btn" data-focused={at === "stuck"} data-disabled={h.stage === 2}>{h.stage === 2 ? "That's both hints" : "Still stuck"}</button>
        <button className="btn" data-focused={at === "lesson"} data-disabled={!s.lesson}>{s.lesson ? "Show me the lesson" : pickFailed !== null ? "No lesson this time" : s.noLesson ? "No lesson for this" : "Finding the lesson…"}</button>
      </div>
    </main>
  </>);
}

// ---- T5 Lesson ----
export function LessonScreen({ s }: { s: Session }) {
  const l = s.lesson;
  // Play/Pause is the desk's flag; the embed only obeys what it is told (enablejsapi + postMessage), so tell it on every flip
  const frame = useRef<HTMLIFrameElement>(null);
  const paused = s.lessonPaused;
  useEffect(() => { frame.current?.contentWindow?.postMessage(playerCommand(paused), "*"); }, [paused]);
  // no lesson open (cleared under the screen): one ask, not a blank stage
  if (!l) return (<>
    <div className="band band-wedge" />
    <main className="content-full">
      <div className="eyebrow" data-ch={s.subject} style={{ marginTop: 40 }}>{NAME[s.subject]} · lesson</div>
      <div className="title" style={{ marginTop: 50 }}>No lesson open</div>
      <div style={{ position: "absolute", left: 0, bottom: 216 }}><span className="cap">Back</span><div className="cap-text">Press Back to return.</div></div>
    </main>
  </>);
  const src = l.youtube ? `https://www.youtube-nocookie.com/embed/${l.youtube}?start=${l.t}&autoplay=1&rel=0&modestbranding=1&enablejsapi=1` : null;
  return (<>
    <div className="band band-wedge" />
    <main className="content-full">
      <div className="eyebrow" data-ch={s.subject}>{NAME[s.subject]} · lesson</div>
      <div className="headline" style={{ fontFamily: "var(--display)", fontWeight: 800, textTransform: "uppercase", fontSize: 56 }}>{l.title}</div>
      <div className="body" style={{ marginTop: 10, color: "var(--mute)" }}>{shown(l.why)}</div>
      <div style={{ position: "absolute", left: 0, top: 200, width: 1120, height: 630, background: "#000" }}>
        {src ? <iframe ref={frame} src={src} width={1120} height={630} allow="autoplay; encrypted-media" style={{ border: 0 }} title={l.title} onLoad={() => { if (paused) frame.current?.contentWindow?.postMessage(playerCommand(true), "*"); }} />
             : <div className="body" style={{ padding: 40, color: "var(--mute)" }}>This unit has no video yet — its theory screen is the lesson. Press Menu.</div>}
      </div>
      <div style={{ position: "absolute", left: 1160, top: 200, width: 568 }}>
        <span className="cap">The part that matters · {fmt(l.t)}</span>
        <div className="body" style={{ marginTop: 16, color: "var(--mute)", fontSize: 28, lineHeight: 1.45 }}>{l.text.slice(0, 520)}{l.text.length > 520 ? "…" : ""}</div>
      </div>
      {/* facts only: the remote's own button, and no ask the phone cannot answer (no phone panel circles a lesson frame) */}
      <div className="ticker"><span>{s.lessonPaused ? "paused" : "playing"}</span><i>·</i><span>{s.lessonPaused ? "Play resumes" : "Play pauses"}</span><i>·</i><span>Back returns</span></div>
    </main>
  </>);
}

// ---- T6 Your sentence ----
export function SentenceScreen({ s, focus }: { s: Session; focus: number }) {
  const a = s.english;
  // nothing to check yet (Linga's menu, Sentence help): one ask, not a blank screen
  if (!a) return (<>
    <div className="band band-rule" />
    <main className="content-full">
      <div className="eyebrow" style={{ marginTop: 40 }}>English · your sentence</div>
      <div className="title" style={{ marginTop: 50 }}>Nothing yet</div>
      <div style={{ position: "absolute", left: 0, bottom: 216 }}><span className="cap">Your turn</span><div className="cap-text">Say one sentence on your phone; the TV shows what the time word decides.</div></div>
    </main>
  </>);
  const { card } = a;
  const parts: Array<{ text: string; k?: "tense" | "marker"; l?: string }> = [];
  let rest = a.sentence;
  const spans = [card.conflict ? { text: card.conflict.wrote, k: "tense" as const, l: card.conflict.is } : null, card.marker ? { text: card.marker, k: "marker" as const, l: `time marker · ${card.tense === "past-simple" ? "finished time" : card.tense === "present-perfect" ? "open time" : card.name}` } : null].filter(Boolean) as Array<{ text: string; k: "tense" | "marker"; l: string }>;
  spans.sort((x, y) => a.sentence.toLowerCase().indexOf(x.text.toLowerCase()) - a.sentence.toLowerCase().indexOf(y.text.toLowerCase()));
  for (const sp of spans) { const i = rest.toLowerCase().indexOf(sp.text.toLowerCase()); if (i < 0) continue; parts.push({ text: rest.slice(0, i) }); parts.push({ text: rest.slice(i, i + sp.text.length), k: sp.k, l: sp.l }); rest = rest.slice(i + sp.text.length); }
  parts.push({ text: rest });
  return (<>
    <div className="band band-rule" />
    <main className="content-full">
      <div className="eyebrow" data-ch="english" style={{ marginTop: 40 }}>English · your sentence</div>
      <div className="sent" style={{ marginTop: 50, maxWidth: 1700 }}>{parts.map((p, i) => p.k ? <span key={i} className="tok" data-k={p.k} data-l={p.l}>{p.text}</span> : <span key={i}>{p.text}</span>)}</div>
      <div className="lt" style={{ position: "absolute", left: 0, bottom: 200, maxWidth: 1500 }}><div className="tag">{card.conflict ? "The rule" : "Right"}</div><div className="txt" style={{ fontSize: 38 }}>{a.explanation}</div></div>
      {essayHandoffOf(s) && <div className="cap-text" data-role="sentence-onphone" style={{ position: "absolute", left: 0, bottom: 130 }}><span className="cap">On your phone</span> {essayHandoffLine(s)}</div>}
      <div className="actions" style={{ bottom: 60 }}><button className="btn" data-focused={stopAt(SENTENCE_STOPS, focus) === "again"}>Try a sentence</button><button className="btn" data-focused={stopAt(SENTENCE_STOPS, focus) === "unit"}>Show me the unit</button></div>
    </main>
  </>);
}

// ---- T7 Head-to-head ----
/**
 * The head-to-head's example sentences. Withholding is the product: an example must never be the corrected
 * form of what the learner wrote, so none of them answers a phone preset, and an example sharing the learner's
 * verb (by its first three letters: go/gone/went is caught by the irregular set) is skipped for the next one.
 */
const H2H: Record<"past" | "perfect", Array<[string, string, string]>> = {
  past: [["She ", "watched", " a film last week."], ["We ", "finished", " the project yesterday."], ["He ", "cooked", " dinner two days ago."]],
  perfect: [["He ", "has worked", " here for three years."], ["We ", "have known", " them since 2019."], ["She ", "has visited", " Rome twice."]],
};
const GO = /^(go|goes|going|gone|went)$/i;
function example(side: "past" | "perfect", verb: string | null | undefined): [string, string, string] {
  const own = (verb ?? "").toLowerCase().split(/\s+/).pop() ?? "";
  const same = (v: string) => { const w = v.split(" ").pop()!.toLowerCase(); return !!own && (w.slice(0, 3) === own.slice(0, 3) || (GO.test(w) && GO.test(own))); };
  return H2H[side].find(([, v]) => !same(v)) ?? H2H[side][0];
}

export function HeadToHead({ s }: { s: Session }) {
  const verb = s.english?.card.verb, past = example("past", verb), perfect = example("perfect", verb);
  return (<>
    <div className="band band-divider" />
    <main className="content-full">
      <div style={{ position: "absolute", left: 0, top: 40, width: "46%" }}>
        <div className="chan" style={{ color: "var(--english)" }}>Finished time</div>
        <div className="title" style={{ fontSize: 84 }}>Past<br />simple</div>
        <div className="body" style={{ marginTop: 20, color: "var(--mute)", maxWidth: 640 }}>The action is over and the time is closed.</div>
        <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap" }}>{["yesterday", "in 2019", "last week", "ago"].map((m) => <span key={m} className="chan" style={{ border: "2px solid var(--english)", color: "var(--english)", padding: "6px 14px" }}>{m}</span>)}</div>
        <div className="headline" style={{ marginTop: 40, fontSize: 44 }}>{past[0]}<b style={{ color: "var(--english)" }}>{past[1]}</b>{past[2]}</div>
      </div>
      <div style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%,-50%) skewX(-12deg)", fontFamily: "var(--display)", fontSize: 120, fontWeight: 800, textShadow: "12px 12px 0 var(--signal-2)", zIndex: 2 }}>vs</div>
      <div style={{ position: "absolute", right: 0, top: 40, width: "46%", textAlign: "right" }}>
        <div className="chan" style={{ color: "var(--english)" }}>Open time</div>
        <div className="title" style={{ fontSize: 84 }}>Present<br />perfect</div>
        <div className="body" style={{ marginTop: 20, color: "var(--mute)", maxWidth: 640, marginLeft: "auto" }}>The time reaches up to now, or the result is still with us.</div>
        <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>{["since", "for", "already", "ever"].map((m) => <span key={m} className="chan" style={{ border: "2px solid var(--english)", color: "var(--english)", padding: "6px 14px" }}>{m}</span>)}</div>
        <div className="headline" style={{ marginTop: 40, fontSize: 44 }}>{perfect[0]}<b style={{ color: "var(--english)" }}>{perfect[1]}</b>{perfect[2]}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center" }}><span className="cap">The question to ask</span><div className="cap-text" style={{ margin: "18px auto 0" }}>Is the time <b>closed</b> or still <b>open</b>? Find the time word first — the tense follows.</div></div>
    </main>
  </>);
}

// ---- T11 Break ----
export function BreakScreen({ s }: { s: Session }) {
  return (
    <main className="content-full" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
      <div><div className="eyebrow">Break</div><div className="clock" data-phase="break" style={{ fontSize: 200, marginTop: 20 }}>{fmt(s.timer.left)}</div>
        <div className="body" style={{ marginTop: 30, color: "var(--mute)" }}>Stand up. The page will still be here.</div><div className="chan" style={{ marginTop: 10, color: "var(--mute)" }}>Select to skip the break</div></div>
    </main>
  );
}
// ---- T12 Recap: tonight, done ----
/**
 * The whole evening as one picture (tv/recapRows.ts): a tile per app on the desk, each in its own app's language -
 * Math Buddy's sheet with a tick for each right answer, the pen's ring for each slip (a step up's and Pythagoras' named slips
 * again under the rail, the ring with the item's number and the slip's short label) and a dashed ring for each item
 * the desk was not sure of (lines that do not say how many draw none), a page per sheet read and
 * a lamp per hint (ringed when it took a second); Linga's card with a plum mark per conversation, sized by its
 * replies; Essay Master's black card with an arrow per sentence read, the ones to fix turned round in citron.
 * Only the caption slot holds a sentence. Select on a tile opens what its app still has on the desk; the parent's
 * copy is on the phone already (its Recap tab), so the chip says so and is not a stop.
 */
export function Recap({ s, focus }: { s: Session; focus: number }) {
  const [now] = useState(() => Date.now());
  const tiles = recapRows(s, now), at = stopAt(recapStops(s), focus);
  return (<>
    <div className="band band-rule" />
    <main className="content-full rc" data-role="recap">
      <div className="title rc-title">Tonight, done</div>
      <div className="rc-tiles">{tiles.map((t) => <RecapTileOf key={t.app} t={t} lit={at === t.app} />)}</div>
      <div className="rc-foot">
        <div className="rc-cap"><span className="cap">{s.learner?.name}</span><div className="cap-text">{recapCaption(tiles)}</div></div>
        <div className="rc-acts">
          <span className="rc-chip" data-role="recap-parent">On the parent’s phone</span>
          <button className="btn" data-role="recap-desk" data-focused={at === "desk"}>Back to the desk</button>
        </div>
      </div>
    </main>
  </>);
}
function RecapTileOf({ t, lit }: { t: RecapTile; lit: boolean }) {
  const cls = t.app === "maths" ? `maths-tv ${MATHS_FONTS} rc-mb` : t.app === "english" ? "rc-lg" : `essay-tv ${ESSAY_FONTS} rc-em`;
  return (
    <div className={`rc-tile ${cls}`} data-role="recap-tile" data-app={t.app} data-focused={lit} data-empty={!!t.empty || undefined}>
      {t.app === "maths" ? <RecapMaths t={t} /> : t.app === "english" ? <RecapLinga t={t} /> : <RecapEssay t={t} />}
    </div>
  );
}
const PEN_TICK = <svg className="rc-tk" viewBox="0 0 46 40" aria-hidden="true"><path d="M5 22 L17 33 L42 5" /></svg>;
const PEN_RING = <svg className="rc-ring" viewBox="0 0 46 40" aria-hidden="true"><path d="M27 4 C42 4 45 15 43 23 C40 35 16 39 7 30 C0 23 4 8 18 5 C22 4 26 4 30 6" /></svg>;
/** Lamplight's unsure mark: no tick and no slip, the pen's ring dashed in the paper's "not sure" blue. */
const PEN_ASK = <svg className="rc-ask" viewBox="0 0 46 40" aria-hidden="true"><path d="M27 4 C42 4 45 15 43 23 C40 35 16 39 7 30 C0 23 4 8 18 5 C22 4 26 4 30 6" /></svg>;
/** MB-B1: an item left empty - the empty answer line, neither a slip's ring nor the desk's dashed doubt. */
const PEN_SKIP = <svg className="rc-skip" viewBox="0 0 46 40" aria-hidden="true"><path d="M8 32 H38" /></svg>;
/** Each mark's pen on the recap's paper, keyed by Mark (rules/marks): a slip keeps its old data-v, "look". */
const RECAP_PEN: Record<Mark, { v: string; pen: React.ReactNode }> = {
  right: { v: "right", pen: PEN_TICK }, wrong: { v: "look", pen: PEN_RING }, unsure: { v: "unsure", pen: PEN_ASK }, skipped: { v: "skipped", pen: PEN_SKIP },
};
const PAGE = <svg className="rc-page" viewBox="0 0 40 50" aria-hidden="true"><path d="M3 3h24l10 10v34H3z" /><path d="M9 20h20M9 28h20M9 36h14" /></svg>;
/** The one small line under a tile that drew its last three: how many came before them. Nothing when none did. */
function Earlier({ n }: { n: number }) {
  return n > 0 ? <div className="rc-earlier" data-role="recap-earlier">{n} earlier</div> : null;
}
/** The end of a row of named lamps or slips that drew its first few: how many it left out. Nothing when none. */
function More({ n, role }: { n: number; role: string }) {
  return n > 0 ? <div className="rc-earlier" data-role={role}>{n} more</div> : null;
}
/** The most hinted problems the tile names with a lamp each (one row on the sheet); the rest are "k more" (MB-B23). */
const RECAP_LAMPS = 5;
/**
 * The most named slips the tile draws under the set's rail (cycle 19): the pen's ring, the item's number and the slip's
 * short label from rules, one to a line (a label wraps between its words, never inside one); the rest are "k more".
 * Two (recapRows RECAP_SLIPS, the phone's slip line's cap too), because a line is the sheet's width and the rails above
 * it come first.
 */
function RecapMaths({ t }: { t: MathsTile }) {
  // a lamp per hinted problem, its name beneath, ringed when it needed a second; a log with no nameable key draws a lamp per hint as before
  const named = t.hinted.some((x) => x.name !== null), lamps = named ? [] : Array.from({ length: Math.min(t.hints, 12) }, (_, i) => i < t.second);
  const lit = t.hinted.slice(0, RECAP_LAMPS), more = t.hinted.length - lit.length;
  return (<>
    <div className="rc-head"><MathsMark /><div className="mb-word">Math <em>Buddy</em></div></div>
    <div className="rc-sheet">
      {t.empty ? <div className="rc-none">{t.empty}</div> : <>
        {t.sets.slice(-RECAP_READINGS).map((x, k) => (
          <div key={k} className="rc-set" data-role="recap-set">{setMarks(x).map((m, i) => <i key={i} data-v={RECAP_PEN[m].v}>{RECAP_PEN[m].pen}</i>)}</div>
        ))}
        <Earlier n={t.sets.length - RECAP_READINGS} />
        {t.slipped.length > 0 && <div className="rc-lamps" data-role="recap-slips">{t.slipped.slice(0, RECAP_SLIPS).map((x, i) => (
          <span key={i} className="rc-lamp" data-slip="true"><i data-v="look">{PEN_RING}</i><em>{x.name}<small>{x.slip}</small></em></span>
        ))}<More n={t.slipped.length - RECAP_SLIPS} role="recap-slips-more" /></div>}
        {t.pages > 0 && <div className="rc-pages" data-role="recap-pages">{Array.from({ length: Math.min(t.pages, 8) }, (_, i) => <i key={i}>{PAGE}</i>)}</div>}
        {lamps.length > 0 && <div className="rc-lamps" data-role="recap-hints">{lamps.map((two, i) => <b key={i} data-second={two || undefined} />)}</div>}
        {named && <div className="rc-lamps" data-role="recap-hints">{lit.map((x, i) => (
          <span key={i} className="rc-lamp" data-second={x.second || undefined} data-page={x.page}><b /><em>{x.name ?? ""}{x.page && <small>{PAGE}{x.page}</small>}</em></span>
        ))}<More n={more} role="recap-hints-more" /></div>}
      </>}
    </div>
  </>);
}
/** The most conversations the Linga card draws; the ones before them are counted under it, as the other two tiles do. */
const RECAP_TALKS = 5;
function RecapLinga({ t }: { t: LingaTile }) {
  return (<>
    <div className="rc-head"><LingaMark /></div>
    <div className="rc-door">
      {t.empty ? <div className="rc-none">{t.empty}</div>
        : <div className="rc-talks">{t.talks.slice(-RECAP_TALKS).map((n, i) => <b key={i} data-role="recap-talk" style={{ "--rc-d": `${Math.round(48 + Math.min(n, 14) * 8)}px` } as React.CSSProperties}>{n}</b>)}</div>}
    </div>
    {!t.empty && <Earlier n={t.talks.length - RECAP_TALKS} />}
  </>);
}
function RecapEssay({ t }: { t: EssayTile }) {
  return (<>
    <div className="rc-head"><EssayBrand /></div>
    {t.empty ? <div className="rc-none">{t.empty}</div>
      : <div className="rc-reads">{t.readings.slice(-RECAP_READINGS).map((r, k) => {
        const rail = railOf(r.of, r.against);
        return (
          <div key={k} className="rc-read" data-role="recap-reading">
            <div className="rc-lens">{r.lens}</div>
            <div className="rc-rail">{Array.from({ length: rail.arrows }, (_, i) => { const back = i >= rail.arrows - rail.back; return <i key={i} data-against={back || undefined}><EssayArrow len={72} h={34} against={back} color="currentColor" /></i>; })}</div>
          </div>
        );
      })}<Earlier n={t.readings.length - RECAP_READINGS} /></div>}
  </>);
}

// ---- T13 Learner ----
/** The student type, said in words — the card's kicker and the caption's chip. */
/** One sentence from the picks: what this desk is set up to do. */
function picksLine(p: Profile) {
  const join = (a: string[]) => (a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0] ?? "");
  const on = p.modules.map((m) => NAME[m]);
  const who = p.type === "other" ? "for someone who just wants to learn" : `for a ${p.age ? `${p.age}-year-old` : TYPE_WORDS[p.type].toLowerCase()} student`;
  return on.length ? `${join(on)} on, ${who}.` : `Nothing on yet, ${who}.`;
}
export function Learner({ s, focus }: { s: Session; focus: number }) {
  const stop = stopAt(learnerStops(s), focus);
  const at = stop && stop !== "add" ? stop : null;
  // The corner band: its diagonal ends at y ~270 on the safe box's right edge, so the card row (from y ~330) and the
  // caption stand on charcoal whole; a left band would cut through the first card and the caption.
  return (<>
    <div className="band band-corner" />
    <main className="content-full">
      <div className="eyebrow">Who is at the desk?</div>
      <div className="title">Learner</div>
      <div className="cards" style={{ gridTemplateColumns: `repeat(${Math.max(3, s.profiles.length + 1)}, 1fr)`, marginTop: 170 }}>
        {s.profiles.map((p) => (
          <div key={p.id} className="card" data-focused={stop === p}>
            <div className="k">{TYPE_WORDS[p.type].toUpperCase()}</div>
            <div className="t">{p.name}</div>
            <div className="d">{p.modules.map((m) => NAME[m]).join(" · ")}</div>
            {p.id === s.learner?.id && <div className="m">at the desk now</div>}
          </div>
        ))}
        <div className="card" data-focused={stop === "add"}>
          <div className="k">New</div><div className="t">Add a learner</div><div className="d">picks on the TV, name on the phone</div>
        </div>
      </div>
      <div style={{ marginTop: 44 }}>
        {at
          ? <><span className="cap">{TYPE_WORDS[at.type]}</span><div className="cap-text">{picksLine(at)} {at.id === s.learner?.id ? "Enter goes back to the desk" : "Enter to sit at this desk"}, Menu to change the picks.{switchEndsLine(s, at) && <> <b>{switchEndsLine(s, at)}</b></>}</div></>
          : <><span className="cap">New learner</span><div className="cap-text">The TV takes the picks, the phone takes the name.</div></>}
      </div>
    </main>
  </>);
}

// ---- S2 Profile · the picks on the TV, the name on the phone ----
/** Focus walks profileRows (tv/profileRows.ts): the type, the age for a school type, the mode, the school system, the interests, the Maths course while Maths is on, the actions. */
export function ProfileScreen({ s, focus }: { s: Session; focus: number }) {
  const d = s.draft;
  const editing = !!d && s.profiles.some((p) => p.id === d.id);
  const name = d?.name.trim() ?? "";
  const rows = profileRows(d), at = locate(rows, focus), cell = rows[at.r].cells[at.c];
  const chosen = (c: (typeof cell)) => (c.kind === "name" && !!name) || (c.kind === "type" && d?.type === c.type) || (c.kind === "age" && d?.age === c.age) || (c.kind === "year" && yearOf(d) === c.year) || (c.kind === "mode" && modeOf(d ?? undefined) === c.mode) || (c.kind === "system" && d?.system === c.system) || (c.kind === "interest" && !!c.sub && !!d?.modules.includes(c.sub)) || (c.kind === "path" && pathOf(d) === c.path);
  return (<>
    <div className="band band-right" />
    <main className="content-full">
      <div className="eyebrow">{editing ? `Preferences · ${d!.name}` : "New learner"}</div>
      <div className="title">{name || "Name it on the phone"}</div>
      <div className="body" style={{ color: "var(--mute)", marginTop: 16 }}>{s.joined ? (s.ask?.kind === "name" ? "Type the name on the phone" : "Select the Name row to type it on the phone") : `Phone code ${s.pin} · Menu to pair, or open the phone's Profile tab`}</div>
      {s.ask?.kind === "name" && s.ask.screen === "profile" && <div className="cap-text" data-role="profile-onphone" style={{ position: "absolute", right: 80, top: 60 }}><span className="cap">On your phone</span> The name. Back cancels.</div>}
      {/* the rows take their width from the picks, so their rules stop short of the band */}
      <div className="guide" style={{ marginTop: 16, width: "fit-content" }}>
        {rows.slice(0, -1).map((row, r) => (
          <div key={row.title} className="row" style={{ gridTemplateColumns: "220px auto", padding: rows.length > 6 ? "2px 0" : "6px 0" }}>
            <div className="u">{row.title}</div>
            <div style={{ display: "flex", gap: row.cells.length > 3 ? 12 : 20 }}>
              {row.cells.map((c, i) => (
                <button key={c.label} className="btn" data-focused={at.r === r && at.c === i} style={{ whiteSpace: "nowrap", padding: rows.length > 6 ? "10px 18px" : "14px 20px", ...(c.sub ? { "--pick": `var(--${c.sub})` } as React.CSSProperties : null) }} data-chosen={chosen(c)}>{c.label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* the caption follows the rows, so no row can sit under it */}
      {cell.kind !== "age" && <div style={{ marginTop: 24 }}>
        <span className="cap">{cell.label}</span>
        <div className="cap-text">{cell.blurb}</div>
      </div>}
      {/* in the flow, under the caption: pinned to the bottom (on-air .actions) a two-line caption ran into them (2026-10-07 capture) */}
      <div className="actions" style={{ position: "static", marginTop: 24 }}>
        <button className="btn" data-focused={cell.kind === "save"} data-disabled={!name}>Save</button>
        {!name && <span className="cap-text" data-role="profile-save-why">Save waits for a name</span>}
        <button className="btn" data-focused={cell.kind === "back"}>Back</button>
      </div>
    </main>
  </>);
}

