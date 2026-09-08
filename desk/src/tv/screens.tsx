"use client";
/**
 * Every television screen, composed on On Air. Each takes the session and a `focus` index and
 * draws itself; the D-pad logic that changes them lives in app/tv/page.tsx. No two share a layout.
 */
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Profile, Session, Subject, Task } from "@/lib/session/store";
import type { Topic } from "@/lib/library/syllabus";
import { LESSONS, ESSAY_TYPES } from "@/lib/library/lessons.data";
import { fmt } from "./useSession";


/** The OCR writes exponents as ^n and the tutor may too; the screen shows them as printed. */
export const shown = (s: string) => s.replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/\*\*/g, "").replace(/\$/g, "");
import { BRAND, MODULE_BLURB, TYPE_WORDS, profileRows, locate, onModules, shownTasks } from "@/tv/profileRows";
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
/** Focus 0-2 are the modules, 3-4 the two actions. The caption below the row describes whatever is focused. */
export function Landing({ s, focus }: { s: Session; focus: number }) {
  const active = focus < 3 ? MODULES[focus] : null;
  return (<>
    <div className="band band-wedge" />
    <main className="content-full">
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <img src="/brand/mark-telestrator.png" alt="" width={96} height={96} />
        <div className="title" style={{ marginTop: 0 }}>Study Desk</div>
      </div>
      <div className="cards" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 36 }}>
        {MODULES.map((m, i) => (
          <div key={m.ch} className="card" data-focused={focus === i} style={{ minHeight: 300, padding: "20px 32px 24px" }}>
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
        <button className="btn" data-focused={focus === 3}>Continue as {s.learner.name}</button>
        <button className="btn" data-focused={focus === 4}>Someone else</button>
      </div>
    </main>
  </>);
}

// ---- T1 ----
/** The caption for whatever task is focused: what this module does with the page, in one sentence. */
function taskCaption(s: Session, t: Task): { chip: string; text: string } {
  const brand = NAME[t.sub];
  if (s.awaiting === t.sub) return { chip: "Waiting", text: `Waiting for the ${brand} page. Snap it on the phone — it appears here.` };
  if (t.done) return { chip: brand, text: "Done. Menu puts it back." };
  const p = s.pages.find((x) => x.subject === t.sub);
  if (p) return { chip: brand, text: `The sheet is on the desk. Enter opens it${p.items.length ? `, ${p.items.length} problems in` : ""}.` };
  const first: Record<Subject, string> = {
    maths: "Snap the sheet on the phone and the desk reads it one problem at a time. Hints, never the answer. Menu marks it done.",
    english: "Say a sentence on the phone and the desk shows the tense and the word that decided it. Menu marks it done.",
    essay: "Pick the lens here, then paste the paragraph on the phone. The desk shows what it does and what it lacks. Menu marks it done.",
  };
  return { chip: brand, text: first[t.sub] };
}
/** The two doors the D-pad meets first: the sheet you were given, and a topic you choose. */
const DOORS = [
  { k: "The sheet you were given", t: "I have homework", d: "Snap it; the desk reads it problem by problem." },
  { k: "No sheet needed", t: "Teach me something", d: "Pick a topic; the desk writes the questions." },
];
function doorCaption(s: Session, i: number): string {
  if (i === 1) return "Pick a topic and the desk writes six questions for you to work on paper. It marks them from a photo — nothing is typed here.";
  if (s.awaiting === "maths") return "Waiting for the Math Buddy page. Snap it on the phone — it appears here.";
  if (s.pages.some((p) => p.subject === "maths")) return "The sheet is already on the desk. Enter opens it, one problem at a time.";
  return "Snap the sheet on the phone and the desk reads it, one problem at a time. Hints, never the answer.";
}
/** Focus 0-1 are the two doors; 2 onwards walk the task board underneath them. */
export function Tonight({ s, focus }: { s: Session; focus: number }) {
  const list = shownTasks(s);
  const open = list.filter((t) => !t.done);
  const total = open.reduce((a, t) => a + t.min, 0);
  const hidden = s.tasks.length - list.length;
  const off = Array.from(new Set(s.tasks.filter((t) => !list.includes(t)).map((t) => t.sub)));
  const onDoor = focus < 2;
  const ti = Math.min(Math.max(0, focus - 2), list.length - 1);
  const at = onDoor ? null : list[ti] ?? null;
  const cap = at ? taskCaption(s, at) : null;
  return (<>
    <div className="band band-left-thin" /><Rail s={s} />
    <main className="content">
      <div className="eyebrow">Tonight</div>
      <div className="title">{open.length ? `${["One", "Two", "Three", "Four", "Five"][open.length - 1] ?? open.length} thing${open.length > 1 ? "s" : ""}, about ${total} minutes` : "Everything done"}</div>
      <div className="cards" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 26 }}>
        {DOORS.map((d, i) => (
          <div key={d.t} className="card" data-focused={focus === i} style={{ minHeight: 190 }}>
            <div className="k">{d.k}</div>
            <div className="t" style={{ fontSize: 52 }}>{d.t}</div>
            <div className="d" style={{ marginTop: "auto" }}>{d.d}</div>
          </div>
        ))}
      </div>
      <div className="eyebrow" style={{ marginTop: 28 }}>Also on the board</div>
      <div className="cards" style={{ gridTemplateColumns: `repeat(${Math.max(3, list.length)}, 1fr)`, marginTop: 12 }}>
        {list.map((t, i) => (
          <div key={t.id} className="card" data-focused={focus === i + 2} style={{ minHeight: 0, padding: "16px 22px", gap: 6, ...(t.done ? { opacity: 0.5 } : null) }}>
            <div className="k">{NAME[t.sub]}</div>
            <div className="t" style={{ fontFamily: "var(--body)", textTransform: "none", fontWeight: 500, fontSize: 30, lineHeight: 1.1 }}>{t.name}</div>
            {/* done is green on both grounds; the minutes let the focused card's CSS charcoal win */}
            <div className="m" style={{ color: t.done ? (focus === i + 2 ? "#2E7D4F" : "var(--essay)") : focus === i + 2 ? undefined : "var(--mute)" }}>{t.done ? "done" : `${t.min} min`}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 96 }}>
        {onDoor
          ? <><span className="cap" style={{ background: "transparent", color: "var(--maths)", border: "2px solid var(--maths)" }}>Math Buddy</span><div className="cap-text">{doorCaption(s, focus)}</div></>
          : cap && <><span className="cap" style={{ background: "transparent", color: `var(--${at!.sub})`, border: `2px solid var(--${at!.sub})` }}>{cap.chip}</span><div className="cap-text">{cap.text}</div></>}
      </div>
      <div className="ticker"><span><b>{open.length}</b> to do</span><i>·</i><span>about <b>{total}</b> minutes</span><i>·</i><span>{s.pages.length ? <><b>{s.pages.length}</b> page{s.pages.length === 1 ? "" : "s"} captured</> : "nothing captured yet"}</span>
        {hidden > 0 && <><i>·</i><span><b>{hidden}</b> hidden · {off.map((x) => NAME[x]).join(" and ")} {off.length > 1 ? "are" : "is"} off</span></>}
        <i>·</i>{s.joined ? <span>phone joined</span> : <span>phone code <b>{s.pin}</b> · Down to pair</span>}</div>
    </main>
  </>);
}

// ---- T2 Units (guide) ----
export function Units({ s, focus }: { s: Session; focus: number }) {
  const list = LESSONS.filter((l) => l.subject === s.subject);
  const next = list.find((l) => !l.done);
  const cur = list[Math.min(focus, list.length - 1)];
  return (<>
    <div className="band band-right" />
    <main className="content-full">
      <div className="eyebrow" data-ch={s.subject}>{NAME[s.subject]} · units</div>
      <div className="title">Tonight&apos;s units</div>
      <div className="guide" style={{ position: "absolute", left: 0, top: 130, width: 900 }}>
        {list.map((l, i) => (
          <div key={l.id} className="row" data-focused={focus === i} data-done={!!l.done}>
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

// ---- T2m Calendar (maths) ----
export function Calendar({ s, focus }: { s: Session; focus: number }) {
  const list = LESSONS.filter((l) => l.subject === "maths");
  const nextIx = list.findIndex((l) => !l.done);
  const weeks = [["Week 1", 0, 3], ["Week 2", 3, 6], ["Week 3", 6, 8]] as const;
  return (<>
    <div className="band band-rule" />
    <main className="content-full">
      <div className="eyebrow" data-ch="maths">Maths · lessons on file</div>
      <div className="title">Where you are</div>
      <div className="cal" style={{ marginTop: 40, gridTemplateColumns: "120px repeat(3, 1fr)" }}>
        {weeks.map(([w, a, b]) => [
          <div key={w} className="wk">{w}</div>,
          ...list.slice(a, b).map((l, j) => { const i = a + j; const state = l.done ? "done" : i === nextIx ? "next" : i > nextIx + 1 ? "locked" : "open";
            return <div key={l.id} className="cell" data-state={state} data-focused={focus === i}><div className="t">{l.title}</div><div className="s">{state === "done" ? "completed" : state === "next" ? "next up" : state === "locked" ? "later" : `${l.minutes} min`}</div></div>; }),
          ...Array.from({ length: 3 - (b - a) }, (_, k) => <div key={w + k} />),
        ])}
      </div>
      <Clock s={s} right />
      <div className="ticker"><span><b>{list.filter((l) => l.done).length}</b> of {list.length} completed</span><i>·</i><span>Select opens the lesson</span><i>·</i><span>Back to units</span></div>
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
        {s.reading && <div className="cap" style={{ position: "absolute", left: 30, bottom: 24, zIndex: 2 }}>reading the page…</div>}
      </div>
      {it && !s.reading && (
        <div className="lt" style={{ marginTop: 24, maxWidth: 1728 }}><div className="tag">{p.subject === "essay" ? `¶ ${it.n}` : `Item ${it.n}`}</div><div className="txt" style={{ fontSize: 36 }}>{p.subject === "essay" ? it.text.slice(0, 110) + "…" : shown(it.text)}</div></div>
      )}
      <div className="strip" style={{ position: "absolute", left: 0, bottom: 0 }}>
        {s.pages.map((pg, i) => <div key={pg.id} className="thumb" data-current={i === s.pageIx} style={{ backgroundImage: `url(${pg.img})` }} />)}
      </div>
      <div className="ticker" style={{ left: 120 * s.pages.length + 40 }}>
        <span>{p.items.length} items</span><i>·</i><span>{p.readMs ? `read in ${(p.readMs / 1000).toFixed(0)} s` : "reading"}</span><i>·</i><span>Select for a hint</span><i>·</i><span>Menu for the overview</span>
      </div>
    </main>
  </>);
}

// ---- T4 Hint ----
export function HintScreen({ s, focus }: { s: Session; focus: number }) {
  const h = s.hint; if (!h) return null;
  const hh = h.stage === 2 ? h.hint2 : h.hint1;
  const p = s.pages[s.pageIx];
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
      {s.noLesson && <div className="body" style={{ marginTop: 28, color: "var(--mute)", maxWidth: "40ch" }}>No lesson in tonight&apos;s library covers this one. The hint is all there is — and that is fine.</div>}
      <div className="actions">
        <button className="btn" data-focused={focus === 0} data-disabled={h.stage === 2}>{h.stage === 2 ? "That's both hints" : "Still stuck"}</button>
        <button className="btn" data-focused={focus === 1} data-disabled={!s.lesson}>{s.lesson ? "Show me the lesson" : s.noLesson ? "No lesson for this" : "Finding the lesson…"}</button>
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
      <div className="actions" style={{ bottom: 60 }}><button className="btn" data-focused={focus === 0}>Try it again</button><button className="btn" data-focused={focus === 1}>Show me the unit</button></div>
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

// ---- T8 Essay analysis type ----
export function EssayType({ focus }: { s: Session; focus: number }) {
  const dia = ["thesis", "para", "order", "concl"];
  return (<>
    <div className="band band-low" />
    <main className="content-full">
      <div className="eyebrow" data-ch="essay">Essay · what should the desk look at?</div>
      <div className="title">Choose the lens</div>
      <div className="cards" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "300px 300px", marginTop: 40 }}>
        {ESSAY_TYPES.map((t, i) => (
          <div key={t.id} className="card" data-focused={focus === i} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 28, alignItems: "center" }}>
            <Diagram kind={dia[i]} focused={focus === i} />
            <div><div className="t">{t.name}</div><div className="d" style={{ marginTop: 10 }}>{t.promise}</div></div>
          </div>
        ))}
      </div>
      <div className="ticker"><span>Select a lens</span><i>·</i><span>then paste or dictate the paragraph on the phone</span></div>
    </main>
  </>);
}
function Diagram({ kind, focused }: { kind: string; focused: boolean }) {
  const c = focused ? "var(--signal)" : "var(--essay)";
  const bar = (w: string, o = 1, h = 22) => <i style={{ display: "block", height: h, width: w, background: c, opacity: o }} />;
  if (kind === "order") return <div style={{ height: 180, display: "flex", alignItems: "flex-end", gap: 14 }}>{bar("30%", 1, 50)}{bar("30%", 1, 100)}{bar("30%", 1, 160)}</div>;
  const rows = kind === "thesis" ? [["100%", 1], ["45%", .35], ["45%", .35]] : kind === "para" ? [["100%", 1], ["70%", .7], ["40%", .45]] : [["45%", .35], ["45%", .35], ["100%", 1]];
  return <div style={{ height: 180, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>{rows.map(([w, o], i) => <span key={i}>{bar(w as string, o as number)}</span>)}</div>;
}

// ---- T9 Forensic ----
export function Forensic({ s, table }: { s: Session; table: boolean }) {
  const a = s.essay; if (!a) return null;
  const v = new Map(a.verdicts.map((x) => [x.n, x]));
  const type = ESSAY_TYPES.find((t) => t.id === a.type);
  return (<>
    <main className="content-full">
      <div className="eyebrow" data-ch="essay">Essay · your paragraph · {type?.name.toLowerCase()} lens</div>
      <div className="title" style={{ fontSize: 56 }}>{a.summary.length < 70 ? a.summary : "What the desk sees"}</div>
      {!table ? (<>
        <div className="extract" style={{ position: "absolute", left: 0, top: 150, width: 1240 }}>
          {a.sentences.map((sn) => { const vd = v.get(sn.n); return <span key={sn.n}>{vd && vd.verdict !== "neutral" ? <mark data-v={vd.verdict}>{sn.text}</mark> : sn.text}{" "}</span>; })}
        </div>
        <div className="notes" style={{ position: "absolute", left: 1320, top: 150, width: 408 }}>
          {a.verdicts.filter((x) => x.verdict !== "neutral").slice(0, 5).map((x) => <div key={x.n} className="n" data-v={x.verdict}><i /><div><b>{x.verdict === "strong" ? "Well done" : "Look again"} · sentence {x.n}</b><span>{x.note}</span></div></div>)}
          {a.verdicts.every((x) => x.verdict === "neutral") && <div className="body" style={{ color: "var(--mute)" }}>{a.summary}</div>}
        </div>
      </>) : (
        <div style={{ position: "absolute", left: 0, top: 150, width: 1400, display: "grid", gridTemplateColumns: "60px 1fr 260px 160px", gap: "0 28px", alignItems: "center" }}>
          {["#", "Sentence", "Role", "Length"].map((h) => <div key={h} className="eyebrow" style={{ borderBottom: "2px solid var(--line)", padding: "8px 0" }}>{h}</div>)}
          {a.sentences.map((sn) => [
            <div key={sn.n + "n"} className="chan" style={{ padding: "20px 0", borderBottom: "1px solid var(--line)", color: "var(--mute)" }}>{sn.n}</div>,
            <div key={sn.n + "s"} className="body" style={{ fontSize: 34, padding: "20px 0", borderBottom: "1px solid var(--line)" }}>{sn.text}</div>,
            <div key={sn.n + "r"} style={{ padding: "20px 0", borderBottom: "1px solid var(--line)" }}><span className="chan" style={{ border: `2px solid ${sn.role === "claim" && a.stats.evidence === 0 ? "var(--signal)" : "var(--essay)"}`, color: sn.role === "claim" && a.stats.evidence === 0 ? "var(--tint)" : "var(--essay)", padding: "6px 12px" }}>{sn.role}</span></div>,
            <div key={sn.n + "l"} style={{ padding: "20px 0", borderBottom: "1px solid var(--line)" }}><i style={{ display: "block", height: 18, width: `${Math.min(100, sn.words * 4)}%`, background: "var(--essay)" }} /></div>,
          ])}
        </div>
      )}
      <div className="ticker"><span><b>{a.stats.sentences}</b> sentences</span><i>·</i><span><b>{a.stats.claims}</b> claims</span><i>·</i><span><b>{a.stats.evidence}</b> evidence</span><i>·</i><span><b>{a.stats.connectors}</b> connectors</span><i>·</i><span>avg <b>{a.stats.avgWords}</b> words</span><i>·</i><span>Menu: {table ? "the text" : "the table"}</span></div>
    </main>
  </>);
}

// ---- T10 Playbook / X-ray ----
export function Playbook({ focus }: { s: Session; focus: number }) {
  const plays = [["Thesis", "One sentence that takes a side and says why.", "thesis"], ["Paragraph", "Claim, then evidence, then the link back.", "para"], ["Order", "Which argument goes first, and why that one.", "order"], ["Conclusion", "What the introduction promised, now delivered.", "concl"]];
  return (<>
    <div className="band band-low" />
    <main className="content-full">
      <div className="eyebrow" data-ch="essay">Essay · playbook</div>
      <div className="title">Choose a structure to work on</div>
      <div className="cards" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "300px 300px", marginTop: 40 }}>
        {plays.map(([t, d, k], i) => <div key={t} className="card" data-focused={focus === i} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 28, alignItems: "center" }}><Diagram kind={k} focused={focus === i} /><div><div className="t">{t}</div><div className="d" style={{ marginTop: 10 }}>{d}</div></div></div>)}
      </div>
      <div className="ticker"><span>Select opens the x-ray</span><i>·</i><span>Back to the lens</span></div>
    </main>
  </>);
}
export function Xray({ }: { s: Session }) {
  const sents: Array<[string, string]> = [["claim", "Many students arrive at school exhausted, and the reason is not laziness but biology."], ["evidence", "During adolescence the body's internal clock shifts later, which means a teenager who goes to bed at eleven is often not sleepy until well after midnight."], ["link", "An early start therefore cuts into sleep that the brain still needs."]];
  const col: Record<string, string> = { claim: "var(--signal)", evidence: "var(--essay)", link: "#fff" };
  return (<>
    <div className="band band-right" style={{ width: 520, clipPath: "polygon(55% 0,100% 0,100% 100%,0 100%)" }} />
    <main className="content-full">
      <div className="eyebrow" data-ch="essay">Essay · a paragraph, x-rayed</div>
      <div className="title" style={{ fontSize: 56 }}>Claim, evidence, link</div>
      <div className="extract" style={{ position: "absolute", left: 0, top: 140, width: 1300 }}>
        {sents.map(([r, t]) => <span key={r} style={{ display: "block", padding: "6px 0 6px 44px", borderLeft: `10px solid ${col[r]}`, maxWidth: "60ch" }}>{t}</span>)}
      </div>
      <div className="notes" style={{ position: "absolute", left: 1380, top: 140, width: 348 }}>
        {[["claim", "Claim", "What you are saying. One sentence, takes a side."], ["evidence", "Evidence", "Why a reader should believe it. A fact, a number, a mechanism."], ["link", "Link", "What it means for the argument. Often starts with therefore."]].map(([r, b, d]) => <div key={r} className="n"><i style={{ background: col[r] }} /><div><b>{b}</b><span>{d}</span></div></div>)}
      </div>
      <div className="ticker"><span>Back to the playbook</span></div>
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
      <div className="actions"><button className="btn" data-focused={focus === 0}>Send to parent</button><button className="btn" data-focused={focus === 1}>Back to tonight</button></div>
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
  const at = s.profiles[focus] ?? null;
  return (<>
    <div className="band band-left" />
    <main className="content-full">
      <div className="eyebrow">Who is at the desk?</div>
      <div className="title">Learner</div>
      <div className="cards" style={{ gridTemplateColumns: `repeat(${Math.max(3, s.profiles.length + 1)}, 1fr)`, marginTop: 44 }}>
        {s.profiles.map((p, i) => (
          <div key={p.id} className="card" data-focused={focus === i}>
            <div className="k">{TYPE_WORDS[p.type].toUpperCase()}</div>
            <div className="t">{p.name}</div>
            <div className="d">{p.modules.map((m) => NAME[m]).join(" · ")}</div>
            {p.id === s.learner.id && <div className="m">at the desk now</div>}
          </div>
        ))}
        <div className="card" data-focused={focus === s.profiles.length}>
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
  const chosen = (c: (typeof cell)) => (c.kind === "type" && d?.type === c.type) || (c.kind === "age" && d?.age === c.age) || (c.kind === "interest" && !!c.sub && !!d?.modules.includes(c.sub));
  return (<>
    <div className="band band-right" />
    <main className="content-full">
      <div className="eyebrow">{editing ? `Preferences · ${d!.name}` : "New learner"}</div>
      <div className="title">{name || "Name it on the phone"}</div>
      <div className="body" style={{ color: "var(--mute)", marginTop: 16 }}>{s.joined ? "Type the name on the phone's Profile tab" : `Phone code ${s.pin} · Menu to pair, or open the phone's Profile tab`}</div>
      <div className="guide" style={{ marginTop: 24, maxWidth: 1240 }}>
        {rows.slice(0, -1).map((row, r) => (
          <div key={row.title} className="row" style={{ gridTemplateColumns: "240px 1fr", padding: "14px 0" }}>
            <div className="u">{row.title}</div>
            <div style={{ display: "flex", gap: row.cells.length > 5 ? 12 : 20 }}>
              {row.cells.map((c, i) => (
                <button key={c.label} className="btn" data-focused={at.r === r && at.c === i} style={{ whiteSpace: "nowrap", ...(row.cells.length > 5 ? { padding: "20px 24px" } : null), ...(c.sub ? { "--pick": `var(--${c.sub})` } as React.CSSProperties : null) }} data-chosen={chosen(c)}>{c.label}</button>
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

// ================= P3 · Math Buddy: topics, practice, walk, standing =================
import { SYLLABUS, topic as topicById } from "@/lib/library/syllabus";
import { slip as slipById } from "@/lib/rules/maths";

/** The four reference bands as small tabular facts, never a sentence. */
function Bands({ t, down }: { t: Topic; down?: boolean }) {
  const rows: Array<[string, string]> = [["US", t.bands.us], ["UK", t.bands.uk], ["CZ", t.bands.cz], ["DE", t.bands.de]];
  return (
    <div className={down ? "bands down" : "bands"}>
      {rows.map(([k, v]) => <div key={k}><b>{k}</b><span>{v}</span></div>)}
    </div>
  );
}

/**
 * What the session alone can say about a topic. The learner's long-term record lives on the
 * server (lib/session/learners.ts, which reads the filesystem) and the session does not carry
 * it, so tonight's marked set is the only evidence the television has.
 */
type TState = "secure" | "here" | "next" | "later";
const STATE_WORD: Record<TState, string> = { secure: "secure", here: "on the desk now", next: "next up", later: "not yet" };
function topicStates(s: Session): Record<string, TState> {
  // The measured record is the truth: s.skills is hydrated from data/learners.json at the
  // dispatch boundary and survives resets, so "secure" means secure across sessions, not tonight.
  const done = new Set<string>(Object.values(s.skills ?? {}).filter((r) => r.secure).map((r) => r.topic));
  if (s.practice?.marked && s.practice.items.filter((i) => i.verdict === "right").length >= 5) done.add(s.practice.topic);
  const out: Record<string, TState> = {};
  for (const t of SYLLABUS) out[t.id] = done.has(t.id) ? "secure" : s.topic === t.id ? "here" : t.prereq.every((p) => done.has(p)) ? "next" : "later";
  return out;
}

// ---- M1 Topics · the syllabus door. Band: corner. Hero: a card row under the caption. ----
const PREP = [
  "Writing six questions on this topic…",
  "Choosing numbers that are worth the working…",
  "Checking every one comes out clean…",
  "Still writing. They will appear here — nothing to press.",
];
export function Topics({ s, focus, busy }: { s: Session; focus: number; busy: boolean }) {
  const st = topicStates(s);
  const ix = busy && s.topic ? Math.max(0, SYLLABUS.findIndex((t) => t.id === s.topic)) : Math.min(focus, SYLLABUS.length - 1);
  const at = SYLLABUS[ix];
  // the wait is a line that changes, never a spinner
  const [step, setStep] = useState(0);
  useEffect(() => { if (!busy) { setStep(0); return; } const t = setInterval(() => setStep((x) => Math.min(PREP.length - 1, x + 1)), 2600); return () => clearInterval(t); }, [busy]);
  return (<>
    <div className="band band-corner" />
    <main className="content-full">
      <div className="eyebrow" data-ch="maths">Math Buddy · teach me something</div>
      <div className="title">Pick a topic</div>
      <div style={{ marginTop: 34, minHeight: 190 }}>
        {busy
          ? <><span className="cap">Preparing</span><div className="cap-text">{PREP[step]}</div></>
          : <><span className="cap" style={{ background: "transparent", color: "var(--maths)", border: "2px solid var(--maths)" }}>{at.strand}</span>
              <div className="cap-text">{at.blurb}</div>
              <div style={{ marginTop: 22 }}><Bands t={at} /></div></>}
      </div>
      <div className="cards" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 56 }}>
        {SYLLABUS.map((t, i) => (
          <div key={t.id} className="card" data-focused={!busy && i === ix} style={{ minHeight: 250, opacity: busy && i !== ix ? 0.4 : 1 }}>
            <div className="k">{STATE_WORD[st[t.id]]}</div>
            <div className="t" style={{ fontSize: 40 }}>{t.name}</div>
            <div className="d" style={{ marginTop: "auto" }}>{t.strand} · {t.bands.uk}</div>
          </div>
        ))}
      </div>
      <div className="ticker"><span><b>{SYLLABUS.length}</b> topics</span><i>·</i><span>six questions a set</span><i>·</i><span>{busy ? "the desk is writing them" : "Select to begin"}</span><i>·</i><span>Menu · where you are</span><i>·</i><span>Back to tonight</span></div>
    </main>
  </>);
}

// ---- M2 Practice · the poster. Band: spine. Hero: the six questions themselves. ----
export function PracticeScreen({ s }: { s: Session }) {
  const p = s.practice;
  const t = p ? topicById(p.topic) : undefined;
  if (!p) return <main className="content-full"><div className="title">No set on the desk</div></main>;
  return (<>
    <div className="band band-spine" />
    <main className="content-full">
      <div className="eyebrow" data-ch="maths">Math Buddy · {t?.name ?? p.topic}</div>
      <div className="title">Work these on paper</div>
      <div className="qs" style={{ marginTop: 44 }}>
        {p.items.map((it) => (
          <div key={it.n} className="q"><div className="n">{it.n}</div><div className="x">{shown(it.question)}</div></div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 100 }}>
        <span className="cap">What to do</span>
        <div className="cap-text">Work all six on paper, then snap the whole sheet with the phone. The desk marks it and walks you through it here.</div>
      </div>
      <div className="ticker"><span><b>{p.items.length}</b> questions</span><i>·</i><span>{t?.name ?? p.topic}</span><i>·</i><span>the phone is waiting for the sheet</span><i>·</i><span>Back to the topics</span></div>
    </main>
  </>);
}

// ---- M3 Walk · one marked item at a time. Band: gauge. Hero: a lower-third and a verdict mark. ----
const VERDICT_WORD = { right: "Right", wrong: "Look again", unsure: "The desk is not sure" } as const;
export function Walk({ s, focus }: { s: Session; focus: number }) {
  const p = s.practice;
  const it = p?.items[s.walkIx];
  if (!p || !it) return <main className="content-full"><div className="title">Nothing to walk</div></main>;
  const v = it.verdict ?? "unsure";
  const sl = it.slip ? slipById(it.slip) : undefined;
  const t = topicById(p.topic);
  const last = s.walkIx === p.items.length - 1;
  const right = p.items.filter((x) => x.verdict === "right").length;
  const look = p.items.filter((x) => x.verdict === "wrong").length;
  return (<>
    <div className="band band-gauge" data-v={v} style={{ "--fill": `${((s.walkIx + 1) / p.items.length) * 100}%` } as React.CSSProperties} />
    <main className="content-full" style={{ left: 72 }}>
      <div className="eyebrow" data-ch="maths">Math Buddy · your sheet, marked · {t?.name ?? p.topic}</div>
      <div className="clock" style={{ position: "absolute", right: 0, top: 0, fontSize: 96, textAlign: "right" }}>{it.n}<small>of {p.items.length}</small></div>
      <div className="lt" style={{ marginTop: 34, maxWidth: 1400 }}>
        <div className="tag">Question {it.n}</div>
        <div className="txt">{shown(it.question)}</div>
      </div>
      <div style={{ marginTop: 60, display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: 1400 }}>
        <div>
          <div className="chan" style={{ color: "var(--mute)" }}>You wrote</div>
          <div className="wrote" style={{ marginTop: 10 }}>{it.studentAnswer ? shown(it.studentAnswer) : "nothing on the line"}</div>
        </div>
        <div className="verdict" data-v={v}>{VERDICT_WORD[v]}</div>
      </div>
      {sl && <div className="slipname" style={{ marginTop: 34 }}>{sl.id.replace(/-/g, " ")} · look at {sl.points}</div>}
      <div style={{ position: "absolute", left: 0, bottom: 200 }}>
        <span className="cap" style={{ background: "transparent", color: "var(--maths)", border: "2px solid var(--maths)" }}>What the desk says</span>
        <div className="cap-text">{it.said ?? (v === "right" ? "This one is right. Nothing more to say about it." : "The desk has no comment on this one.")}</div>
      </div>
      {last && <div className="actions"><button className="btn" data-focused={focus === 0}>Finish the set</button></div>}
      <div className="ticker"><span>item <b>{s.walkIx + 1}</b> of {p.items.length}</span><i>·</i><span><b>{right}</b> right</span><i>·</i><span><b>{look}</b> to look at</span><i>·</i><span>{last ? "Select finishes" : "Left and Right walk the set"}</span></div>
    </main>
  </>);
}

// ---- M4 Standing · where the learner is. Band: riser. Hero: a staircase. ----
export function Standing({ s, focus }: { s: Session; focus: number }) {
  const st = topicStates(s);
  const ix = Math.min(Math.max(0, focus), SYLLABUS.length - 1);
  const at = SYLLABUS[ix];
  // the furthest topic with evidence behind it: secure if we have it, else the one on the desk
  const furthest = [...SYLLABUS].reverse().find((t) => st[t.id] === "secure") ?? [...SYLLABUS].reverse().find((t) => st[t.id] === "here") ?? SYLLABUS[0];
  const sentence: Record<TState, string> = {
    secure: "You have this one. " + at.blurb,
    here: "This is the one on the desk tonight. " + at.blurb,
    next: "This is the one to take next, and everything it needs is behind you. " + at.blurb,
    later: "Not yet — it waits on " + at.prereq.map((p) => topicById(p)?.name ?? p).join(" and ") + ". " + at.blurb,
  };
  return (<>
    <div className="band band-riser" />
    <main className="content-full">
      <div className="eyebrow" data-ch="maths">Math Buddy · where you are</div>
      <div className="title">The climb, not a score</div>
      <div className="stair" style={{ position: "absolute", left: 0, top: 210, width: 1180, height: 470 }}>
        {SYLLABUS.map((t, i) => (
          <div key={t.id} className="step" data-state={st[t.id]} data-focused={i === ix} style={{ left: i * 220, bottom: i * 155 }}>
            <div className="t">{t.name}</div>
            <div className="s">{STATE_WORD[st[t.id]]}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 0, top: 210, width: 400 }}>
        <span className="cap" style={{ background: "transparent", color: "var(--maths)", border: "2px solid var(--maths)" }}>{furthest.name}</span>
        <div className="body" style={{ marginTop: 18, color: "var(--mute)", fontSize: 28 }}>is taught at about</div>
        <div style={{ marginTop: 18 }}><Bands t={furthest} down /></div>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 96, maxWidth: 1250 }}>
        <span className="cap">{at.strand}</span>
        <div className="cap-text">{sentence[st[at.id]]}</div>
      </div>
      <div className="ticker"><span><b>{SYLLABUS.filter((t) => st[t.id] === "secure").length}</b> of {SYLLABUS.length} secure</span><i>·</i><span>no ranks, no cohort</span><i>·</i><span>Up and Down walk the climb</span><i>·</i><span>Back to the topics</span></div>
    </main>
  </>);
}
