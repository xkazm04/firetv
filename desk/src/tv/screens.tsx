"use client";
/**
 * The shell's television screens, composed on On Air: the Study Desk landing, pairing, the learner and
 * profile picks, the break and the recap, and the page / hint / lesson / units screens when English or Essay
 * Master is on the desk. Math Buddy draws its own (maths/MathsTV.tsx), Linga and Essay Master theirs. Each
 * takes the session and a `focus` index and draws itself from its stop list in tv/keys.ts - the same list
 * the D-pad there walks, so a stop is added or moved in one place.
 */
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Profile, Session } from "@/lib/session/store";
import { fmt } from "./useSession";
import { stopAt, LANDING_STOPS, learnerStops, unitStops, HINT_STOPS, SENTENCE_STOPS, RECAP_STOPS } from "./keys";

/** The OCR writes exponents as ^n and the tutor may too; the screen shows them as printed. */
export const shown = (s: string) => s.replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/\*\*/g, "").replace(/\$/g, "");
import { BRAND, MODULE_BLURB, TYPE_WORDS, profileRows, locate, onModules } from "@/tv/profileRows";
const NAME = BRAND;

function Rail({ s }: { s: Session }) {
  return (
    <aside className="rail">
      <div className="learner"><small>Now studying</small>{s.learner.name}</div>
      <div>{onModules(s).map((x) => <div key={x} className="subj" data-on={s.subject === x}>{NAME[x]}</div>)}</div>
      <div className="clock" data-phase={s.timer.phase}>{fmt(s.timer.left)}<small>{s.timer.running ? (s.timer.phase === "work" ? "On the clock" : "Break") : s.log.started ? "Paused" : "Press Play to start"}</small></div>
    </aside>
  );
}
const Clock = ({ s, right }: { s: Session; right?: boolean }) => (
  <div className="clock" style={{ position: "absolute", top: 0, ...(right ? { right: 0, textAlign: "right" } : { left: 0 }) }} data-phase={s.timer.phase}>{fmt(s.timer.left)}<small>{s.timer.running ? "On the clock" : "Paused"}</small></div>
);

// ---- T0 ----
/** The moment after pairing: the phone is on the desk. One picture, one instruction, one action. */
export function Joined({ s }: { s: Session }) {
  return (<>
    <div className="band band-low" />
    <main className="content-full">
      <div className="eyebrow">Paired</div>
      <div className="title" style={{ maxWidth: 900 }}>{s.learner.name}’s phone is on the desk</div>
      <img src="/brand/paired.png" alt="" style={{ position: "absolute", right: 0, top: 40, width: 760, height: 520, objectFit: "contain" }} />
      <div style={{ position: "absolute", left: 0, bottom: 216, maxWidth: 900 }}>
        <span className="cap">What now</span>
        <div className="cap-text">Snap the page on the phone and it appears here. Or press Enter to see what is on tonight.</div>
      </div>
      <div className="actions"><button className="btn" data-focused>Tonight</button></div>
    </main>
  </>);
}
export function Pair({ s }: { s: Session }) {
  const url = s.phoneUrl + "?pin=" + s.pin;
  // qrcode's browser build draws the code; generated here so the store stays free of UI.
  const [svg, setSvg] = useState("");
  useEffect(() => { let live = true; QRCode.toString(url, { type: "svg", margin: 1 }).then((x) => { if (live) setSvg(x); }).catch(() => {}); return () => { live = false; }; }, [url]);
  return (<>
    <div className="band band-rule" />
    <div className="content-full" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
      <div style={{ maxWidth: 560 }}>
        <div className="eyebrow">Study Desk · pair a phone</div>
        <div className="qr" style={{ margin: "40px auto 28px", width: 300, height: 300, background: "#fff", display: "grid", placeItems: "center" }} dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="lt">
          <div className="tag">Code</div>
          <div className="txt" style={{ letterSpacing: ".3em", fontVariantNumeric: "tabular-nums" }}>{s.pin}</div>
        </div>
        <div className="body" style={{ color: "var(--mute)", marginTop: 24 }}>Scan, or open <span style={{ color: "var(--paper)" }}>{s.phoneUrl}</span> on your phone and type the code.</div>
      </div>
    </div>
    <div className="ticker"><span>Waiting for a phone</span><i>·</i><span>code <b>{s.pin}</b></span><i>·</i><span>same Wi-Fi as the TV</span></div>
  </>);
}


// ---- S1 Landing ----
/** The three modules, each branded as its own app: a name, an illustration, and one caption when it is active. */
const MODULES: Array<{ name: string; ch: Session["subject"]; img: string; tag: string; d: string }> = [
  { name: "Math Buddy", ch: "maths", img: "/brand/math-buddy.png", tag: "Maths · high school", d: MODULE_BLURB.maths },
  { name: "Linga", ch: "english", img: "/brand/linga.png", tag: "English · every level", d: MODULE_BLURB.english },
  { name: "Essay Master", ch: "essay", img: "/brand/essay-master.png", tag: "Essay · anyone who writes", d: MODULE_BLURB.essay },
];
/** The stops are the three modules, then the two actions. The caption below the row describes whatever is focused. */
export function Landing({ s, focus }: { s: Session; focus: number }) {
  const at = stopAt(LANDING_STOPS, focus);
  const active = MODULES.find((m) => m.ch === at) ?? null;
  return (<>
    <div className="band band-wedge" />
    <main className="content-full">
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <img src="/brand/mark-telestrator.png" alt="" width={96} height={96} />
        <div className="title" style={{ marginTop: 0 }}>Study Desk</div>
      </div>
      <div className="cards" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 36 }}>
        {MODULES.map((m) => (
          <div key={m.ch} className="card" data-focused={at === m.ch} style={{ minHeight: 300, padding: "20px 32px 24px" }}>
            <img src={m.img} alt="" style={{ height: 190, width: "100%", objectFit: "contain" }} />
            <div className="t" style={{ marginTop: "auto" }}>{m.name}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 44 }}>
        {active
          ? <><span className="cap" style={{ background: "transparent", color: `var(--${active.ch})`, border: `2px solid var(--${active.ch})` }}>{active.tag}</span><div className="cap-text">{active.d}</div></>
          : <><span className="cap">Hints, not answers</span><div className="cap-text">The desk gives you the next step, never the answer. The TV shows; your phone does.</div></>}
      </div>
      <div className="actions">
        <button className="btn" data-focused={at === "continue"}>Continue as {s.learner.name}</button>
        <button className="btn" data-focused={at === "someone"}>Someone else</button>
      </div>
    </main>
  </>);
}

/** A day, in the words a person would use. Calendar days, not elapsed hours. */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function day(at: number): string {
  const d = new Date(at), mid = (t: Date) => Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  const n = Math.round((mid(new Date()) - mid(d)) / 86400000);
  return n <= 0 ? "Today" : n === 1 ? "Yesterday" : n < 7 ? DAYS[d.getDay()] : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// ---- T2 Units (guide) ----
export function Units({ s, focus }: { s: Session; focus: number }) {
  const list = unitStops(s);
  const next = list.find((l) => !l.done);
  const cur = stopAt(list, focus);
  return (<>
    <div className="band band-right" />
    <main className="content-full">
      <div className="eyebrow" data-ch={s.subject}>{NAME[s.subject]} · units</div>
      <div className="title">Tonight&apos;s units</div>
      <div className="guide" style={{ position: "absolute", left: 0, top: 130, width: 900 }}>
        {list.map((l) => (
          <div key={l.id} className="row" data-focused={l === cur} data-done={!!l.done}>
            <div className="u">Unit {l.unit}</div>
            <div className="t">{l.title}{l.id === next?.id && <span className="pill">next</span>}{l.done && <span className="pill" data-kind="done">done</span>}</div>
            <div className="d">{l.minutes} min</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 980, top: 130, width: 748 }}>
        <span className="cap">From unit {cur?.unit}</span>
        <div className="headline" style={{ marginTop: 18, fontSize: 40 }}>{cur?.title}</div>
        <div className="body" style={{ marginTop: 20, color: "var(--mute)" }}>Teaches: {cur?.concepts.join(" · ")}</div>
      </div>
      <div className="ticker"><span><b>{list.length}</b> units</span><i>·</i><span>{list.filter((l) => l.done).length} done</span><i>·</i><span>{s.subject === "maths" ? "Menu for the calendar" : s.subject === "english" ? "Menu for the head-to-head" : "Menu for the playbook"}</span></div>
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
  const pageLine = read?.phase === "failed" ? "could not read this page — snap it again" : hj?.phase === "running" ? "thinking about a hint…" : hj?.phase === "failed" ? "no hint that time — Select to try again" : undefined;
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
        <div className="lt" style={{ marginTop: 24, maxWidth: 1728 }}><div className="tag">{p.subject === "essay" ? `¶ ${it.n}` : `Item ${it.n}`}</div><div className="txt" style={{ fontSize: 36 }}>{p.subject === "essay" ? it.text.slice(0, 110) + "…" : shown(it.text)}</div></div>
      )}
      <div className="strip" style={{ position: "absolute", left: 0, bottom: 0 }}>
        {s.pages.map((pg, i) => <div key={pg.id} className="thumb" data-current={i === s.pageIx} style={{ backgroundImage: `url(${pg.img})` }} />)}
      </div>
      <div className="ticker" style={{ left: 120 * s.pages.length + 40 }}>
        <span>{p.items.length} items</span><i>·</i><span>{p.readMs ? `read in ${(p.readMs / 1000).toFixed(0)} s` : read?.phase === "failed" ? "not read" : "reading"}</span><i>·</i><span>{hj?.phase === "failed" ? "Select to try again" : "Select for a hint"}</span><i>·</i><span>Menu for the overview</span>
      </div>
    </main>
  </>);
}

// ---- T4 Hint ----
export function HintScreen({ s, focus }: { s: Session; focus: number }) {
  const h = s.hint; if (!h) return null;
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
  const l = s.lesson; if (!l) return null;
  const src = l.youtube ? `https://www.youtube-nocookie.com/embed/${l.youtube}?start=${l.t}&autoplay=1&rel=0&modestbranding=1` : null;
  return (<>
    <div className="band band-wedge" />
    <main className="content-full">
      <div className="eyebrow" data-ch={s.subject}>{NAME[s.subject]} · lesson</div>
      <div className="headline" style={{ fontFamily: "var(--display)", fontWeight: 800, textTransform: "uppercase", fontSize: 56 }}>{l.title}</div>
      <div className="body" style={{ marginTop: 10, color: "var(--mute)" }}>{shown(l.why)}</div>
      <div style={{ position: "absolute", left: 0, top: 200, width: 1120, height: 630, background: "#000" }}>
        {src ? <iframe src={src} width={1120} height={630} allow="autoplay; encrypted-media" style={{ border: 0 }} title={l.title} />
             : <div className="body" style={{ padding: 40, color: "var(--mute)" }}>This unit has no video yet — its theory screen is the lesson. Press Menu.</div>}
      </div>
      <div style={{ position: "absolute", left: 1160, top: 200, width: 568 }}>
        <span className="cap">The part that matters · {fmt(l.t)}</span>
        <div className="body" style={{ marginTop: 16, color: "var(--mute)", fontSize: 28, lineHeight: 1.45 }}>{l.text.slice(0, 520)}{l.text.length > 520 ? "…" : ""}</div>
      </div>
      <div className="ticker"><span>{s.lessonPaused ? "paused — circle on the phone to ask about this frame" : "playing"}</span><i>·</i><span>Space pauses</span><i>·</i><span>Back returns</span></div>
    </main>
  </>);
}

// ---- T6 Your sentence ----
export function SentenceScreen({ s, focus }: { s: Session; focus: number }) {
  const a = s.english; if (!a) return null;
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
      <div className="eyebrow" data-ch="english">English · your sentence</div>
      <div className="sent" style={{ marginTop: 90, maxWidth: 1700 }}>{parts.map((p, i) => p.k ? <span key={i} className="tok" data-k={p.k} data-l={p.l}>{p.text}</span> : <span key={i}>{p.text}</span>)}</div>
      <div className="lt" style={{ position: "absolute", left: 0, bottom: 200, maxWidth: 1500 }}><div className="tag">{card.conflict ? "The rule" : "Right"}</div><div className="txt" style={{ fontSize: 38 }}>{a.explanation}</div></div>
      <div className="actions" style={{ bottom: 60 }}><button className="btn" data-focused={stopAt(SENTENCE_STOPS, focus) === "again"}>Try it again</button><button className="btn" data-focused={stopAt(SENTENCE_STOPS, focus) === "unit"}>Show me the unit</button></div>
    </main>
  </>);
}

// ---- T7 Head-to-head ----
export function HeadToHead({ }: { s: Session }) {
  return (<>
    <div className="band band-divider" />
    <main className="content-full">
      <div style={{ position: "absolute", left: 0, top: 40, width: "46%" }}>
        <div className="chan" style={{ color: "var(--english)" }}>Finished time</div>
        <div className="title" style={{ fontSize: 84 }}>Past<br />simple</div>
        <div className="body" style={{ marginTop: 20, color: "var(--mute)", maxWidth: 640 }}>The action is over and the time is closed.</div>
        <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap" }}>{["yesterday", "in 2019", "last week", "ago"].map((m) => <span key={m} className="chan" style={{ border: "2px solid var(--english)", color: "var(--english)", padding: "6px 14px" }}>{m}</span>)}</div>
        <div className="headline" style={{ marginTop: 40, fontSize: 44 }}>I <b style={{ color: "var(--english)" }}>went</b> to school yesterday.</div>
      </div>
      <div style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%,-50%) skewX(-12deg)", fontFamily: "var(--display)", fontSize: 120, fontWeight: 800, textShadow: "12px 12px 0 var(--signal-2)", zIndex: 2 }}>vs</div>
      <div style={{ position: "absolute", right: 0, top: 40, width: "46%", textAlign: "right" }}>
        <div className="chan" style={{ color: "var(--english)" }}>Open time</div>
        <div className="title" style={{ fontSize: 84 }}>Present<br />perfect</div>
        <div className="body" style={{ marginTop: 20, color: "var(--mute)", maxWidth: 640, marginLeft: "auto" }}>The time reaches up to now, or the result is still with us.</div>
        <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>{["since", "for", "already", "ever"].map((m) => <span key={m} className="chan" style={{ border: "2px solid var(--english)", color: "var(--english)", padding: "6px 14px" }}>{m}</span>)}</div>
        <div className="headline" style={{ marginTop: 40, fontSize: 44 }}>I <b style={{ color: "var(--english)" }}>have lived</b> here since 2019.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center" }}><span className="cap">The question to ask</span><div className="cap-text" style={{ margin: "18px auto 0" }}>Is the time <b>closed</b> or still <b>open</b>? Find the time word first — the tense follows.</div></div>
    </main>
  </>);
}

// ---- T11 Break · T12 Recap · T13 Learner ----
export function BreakScreen({ s }: { s: Session }) {
  return (
    <main className="content-full" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
      <div><div className="eyebrow">Break</div><div className="clock" data-phase="break" style={{ fontSize: 200, marginTop: 20 }}>{fmt(s.timer.left)}</div>
        <div className="body" style={{ marginTop: 30, color: "var(--mute)" }}>Stand up. The page will still be here.</div><div className="chan" style={{ marginTop: 10, color: "var(--mute)" }}>Select to skip the break</div></div>
    </main>
  );
}
export function Recap({ s, focus }: { s: Session; focus: number }) {
  return (<>
    <div className="band band-left-thin" /><Rail s={s} />
    <main className="content">
      <div className="eyebrow">Tonight, done</div>
      <div className="title">{s.log.problems.length ? (s.log.hard.length ? "Good session — things to look at together" : "Good session") : "Short session"}</div>
      <div className="cards" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 36 }}>
        {[[Math.round(s.log.minutes), "minutes on task"], [s.log.problems.length, "problems looked at"], [s.log.hints, "hints used"]].map(([v, k]) => <div key={String(k)} className="card" style={{ minHeight: 0 }}><div className="clock" style={{ fontSize: 96 }}>{v}</div><div className="k">{k}</div></div>)}
      </div>
      <div style={{ marginTop: 32 }}><span className="cap">Where it was hard</span>
        <div className="body" style={{ marginTop: 14 }}>{s.log.hard.length ? s.log.hard.map((h) => <div key={h}>· {h}</div>) : "Nothing needed a second hint."}</div></div>
      <div className="actions"><button className="btn" data-focused={stopAt(RECAP_STOPS, focus) === "send"}>Send to parent</button><button className="btn" data-focused={stopAt(RECAP_STOPS, focus) === "tonight"}>Back to tonight</button></div>
    </main>
  </>);
}
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
  return (<>
    <div className="band band-left" />
    <main className="content-full">
      <div className="eyebrow">Who is at the desk?</div>
      <div className="title">Learner</div>
      <div className="cards" style={{ gridTemplateColumns: `repeat(${Math.max(3, s.profiles.length + 1)}, 1fr)`, marginTop: 44 }}>
        {s.profiles.map((p) => (
          <div key={p.id} className="card" data-focused={stop === p}>
            <div className="k">{TYPE_WORDS[p.type].toUpperCase()}</div>
            <div className="t">{p.name}</div>
            <div className="d">{p.modules.map((m) => NAME[m]).join(" · ")}</div>
            {p.id === s.learner.id && <div className="m">at the desk now</div>}
          </div>
        ))}
        <div className="card" data-focused={stop === "add"}>
          <div className="k">New</div><div className="t">Add a learner</div><div className="d">picks on the TV, name on the phone</div>
        </div>
      </div>
      <div style={{ marginTop: 44 }}>
        {at
          ? <><span className="cap">{TYPE_WORDS[at.type]}</span><div className="cap-text">{picksLine(at)} Enter to sit at this desk, Menu to change the picks.</div></>
          : <><span className="cap">New learner</span><div className="cap-text">The TV takes the picks, the phone takes the name.</div></>}
      </div>
    </main>
  </>);
}

// ---- S2 Profile · the picks on the TV, the name on the phone ----
/** Focus: 0-2 the type of student, 3-5 the modules, 6 Save, 7 Back. */
export function ProfileScreen({ s, focus }: { s: Session; focus: number }) {
  const d = s.draft;
  const editing = !!d && s.profiles.some((p) => p.id === d.id);
  const name = d?.name.trim() ?? "";
  const rows = profileRows(d), at = locate(rows, focus), cell = rows[at.r].cells[at.c];
  const chosen = (c: (typeof cell)) => (c.kind === "type" && d?.type === c.type) || (c.kind === "age" && d?.age === c.age) || (c.kind === "system" && d?.system === c.system) || (c.kind === "interest" && !!c.sub && !!d?.modules.includes(c.sub));
  return (<>
    <div className="band band-right" />
    <main className="content-full">
      <div className="eyebrow">{editing ? `Preferences · ${d!.name}` : "New learner"}</div>
      <div className="title">{name || "Name it on the phone"}</div>
      <div className="body" style={{ color: "var(--mute)", marginTop: 16 }}>{s.joined ? "Type the name on the phone's Profile tab" : `Phone code ${s.pin} · Menu to pair, or open the phone's Profile tab`}</div>
      <div className="guide" style={{ marginTop: 20, maxWidth: 1680 }}>
        {rows.slice(0, -1).map((row, r) => (
          <div key={row.title} className="row" style={{ gridTemplateColumns: "240px 1fr", padding: "10px 0" }}>
            <div className="u">{row.title}</div>
            <div style={{ display: "flex", gap: row.cells.length > 3 ? 12 : 20 }}>
              {row.cells.map((c, i) => (
                <button key={c.label} className="btn" data-focused={at.r === r && at.c === i} style={{ whiteSpace: "nowrap", ...(row.cells.length > 3 ? { padding: "14px 22px" } : null), ...(c.sub ? { "--pick": `var(--${c.sub})` } as React.CSSProperties : null) }} data-chosen={chosen(c)}>{c.label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {cell.kind !== "age" && <div style={{ position: "absolute", left: 0, bottom: 216 }}>
        <span className="cap">{cell.label}</span>
        <div className="cap-text">{cell.blurb}</div>
      </div>}
      <div className="actions">
        <button className="btn" data-focused={cell.kind === "save"} data-disabled={!name}>Save</button>
        <button className="btn" data-focused={cell.kind === "back"}>Back</button>
      </div>
    </main>
  </>);
}

