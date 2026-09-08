"use client";
/**
 * Every television screen, composed on On Air. Each takes the session and a `focus` index and
 * draws itself; the D-pad logic that changes them lives in app/tv/page.tsx. No two share a layout.
 */
import type { Profile, Session, StudentType } from "@/lib/session/store";
import { LESSONS, ESSAY_TYPES } from "@/lib/library/lessons.data";
import { fmt } from "./useSession";

const SUBJECTS: Array<Session["subject"]> = ["maths", "english", "essay"];

/** The OCR writes exponents as ^n and the tutor may too; the screen shows them as printed. */
export const shown = (s: string) => s.replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/\*\*/g, "").replace(/\$/g, "");
const NAME: Record<Session["subject"], string> = { maths: "Math Buddy", english: "Linga", essay: "Essay Master" };

function Rail({ s }: { s: Session }) {
  return (
    <aside className="rail">
      <div className="learner"><small>Now studying</small>{s.learner.name}</div>
      <div>{SUBJECTS.map((x) => <div key={x} className="subj" data-on={s.subject === x}>{NAME[x]}</div>)}</div>
      <div className="clock" data-phase={s.timer.phase}>{fmt(s.timer.left)}<small>{s.timer.running ? (s.timer.phase === "work" ? "On the clock" : "Break") : s.log.started ? "Paused" : "Not started"}</small></div>
    </aside>
  );
}
const Clock = ({ s, right }: { s: Session; right?: boolean }) => (
  <div className="clock" style={{ position: "absolute", top: 0, ...(right ? { right: 0, textAlign: "right" } : { left: 0 }) }} data-phase={s.timer.phase}>{fmt(s.timer.left)}<small>{s.timer.running ? "On the clock" : "Paused"}</small></div>
);

// ---- T0 ----
export function Pair({ s }: { s: Session }) {
  return (
    <div className="content-full" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
      <div>
        <div className="eyebrow">Study Desk · pair a phone</div>
        <div style={{ margin: "40px auto 28px", width: 300, height: 300, background: "#fff", display: "grid", placeItems: "center" }}>
          <Qr seed={Number(s.pin)} />
        </div>
        <div className="title" style={{ letterSpacing: ".3em", fontSize: 96 }}>{s.pin.split("").join(" ")}</div>
        <div className="body" style={{ color: "var(--mute)", marginTop: 20, maxWidth: "28ch" }}>Open the phone page on this Wi-Fi and type the code.</div>
      </div>
    </div>
  );
}
function Qr({ seed }: { seed: number }) {
  let x = seed || 4729; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  const cells: boolean[] = []; for (let i = 0; i < 29 * 29; i++) cells.push(rnd() > 0.55);
  const finder = (cx: number, cy: number) => (
    <g key={`${cx}-${cy}`}><rect x={cx} y={cy} width={7} height={7} fill="#111" /><rect x={cx + 1} y={cy + 1} width={5} height={5} fill="#fff" /><rect x={cx + 2} y={cy + 2} width={3} height={3} fill="#111" /></g>
  );
  return (
    <svg viewBox="0 0 29 29" width={260} height={260} shapeRendering="crispEdges">
      <rect width={29} height={29} fill="#fff" />
      {cells.map((on, i) => (on ? <rect key={i} x={i % 29} y={Math.floor(i / 29)} width={1} height={1} fill="#111" /> : null))}
      {finder(0, 0)}{finder(22, 0)}{finder(0, 22)}
    </svg>
  );
}


// ---- S1 Landing ----
/** The three modules, each branded as its own app: a name, an illustration, and one caption when it is active. */
const MODULES: Array<{ name: string; ch: Session["subject"]; img: string; tag: string; d: string }> = [
  { name: "Math Buddy", ch: "maths", img: "/brand/math-buddy.png", tag: "Maths · high school", d: "Learn and practise high-school maths one step at a time. The desk gives you the next step, never the answer." },
  { name: "Linga", ch: "english", img: "/brand/linga.png", tag: "English · every level", d: "An assistant for learning English at every level. Say a sentence, see the tense and the word that decided it." },
  { name: "Essay Master", ch: "essay", img: "/brand/essay-master.png", tag: "Essay · anyone who writes", d: "An analyst for written thoughts. See what your paragraph does and what it lacks, never rewritten for you." },
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
export function Tonight({ s, focus }: { s: Session; focus: number }) {
  const open = s.tasks.filter((t) => !t.done);
  const total = open.reduce((a, t) => a + t.min, 0);
  return (<>
    <div className="band band-left-thin" /><Rail s={s} />
    <main className="content">
      <div className="eyebrow">Tonight</div>
      <div className="title">{open.length ? `${["One", "Two", "Three", "Four", "Five"][open.length - 1] ?? open.length} thing${open.length > 1 ? "s" : ""}, about ${total} minutes` : "Everything done"}</div>
      <div className="cards" style={{ gridTemplateColumns: `repeat(${Math.max(3, s.tasks.length)}, 1fr)`, marginTop: 44 }}>
        {s.tasks.map((t, i) => (
          <div key={t.id} className="card" data-focused={focus === i} style={t.done ? { opacity: 0.5 } : undefined}>
            <div className="k">{NAME[t.sub]}</div>
            <div className="t" style={{ fontFamily: "var(--body)", textTransform: "none", fontWeight: 500, fontSize: 32 }}>{t.name}</div>
            <div className="m" style={{ color: t.done ? "var(--essay)" : "var(--mute)" }}>{t.done ? "done" : `${t.min} min`}</div>
          </div>
        ))}
      </div>
      <div className="body" style={{ marginTop: 56, color: "var(--mute)" }}>{s.pages.length ? "Select a task, or Down to the page." : "Point your phone at the page to begin."}</div>
      <div className="ticker"><span><b>{open.length}</b> to do</span><i>·</i><span>{s.pages.length} page{s.pages.length === 1 ? "" : "s"} captured</span><i>·</i><span>Menu marks a task done</span>{!s.joined && <><i>·</i><span>phone code <b>{s.pin}</b></span></>}</div>
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
const TYPE_WORDS: Record<StudentType, string> = { "high-school": "High school", university: "University", adult: "Adult" };
const TYPES: StudentType[] = ["high-school", "university", "adult"];
/** One sentence from the picks: what this desk is set up to do. */
function picksLine(p: Profile) {
  const join = (a: string[]) => (a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0] ?? "");
  const rest = p.modules.filter((m) => m !== "maths").map((m) => NAME[m]);
  if (p.modules.includes("maths")) return rest.length ? `Math Buddy at ${p.type} level, ${join(rest)} on.` : `Math Buddy at ${p.type} level.`;
  return rest.length ? `${join(rest)} on.` : "No modules on yet.";
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
  return (<>
    <div className="band band-right" />
    <main className="content-full">
      <div className="eyebrow">{editing ? `Preferences · ${d!.name}` : "New learner"}</div>
      <div className="title">{name || "Name it on the phone"}</div>
      <div className="body" style={{ color: "var(--mute)", marginTop: 16 }}>{s.joined ? "Type the name on the phone's Profile tab" : `Phone code ${s.pin} · open the phone, tab Profile`}</div>
      <div className="guide" style={{ marginTop: 40, maxWidth: 1180 }}>
        <div className="row" style={{ gridTemplateColumns: "240px 1fr" }}>
          <div className="u">Type of student</div>
          <div style={{ display: "flex", gap: 20 }}>
            {TYPES.map((t, i) => (
              <button key={t} className="btn" data-focused={focus === i} style={{ whiteSpace: "nowrap", ...(d?.type === t ? { borderColor: "#fff", borderLeftWidth: 16 } : null) }}>{TYPE_WORDS[t]}</button>
            ))}
          </div>
        </div>
        <div className="row" style={{ gridTemplateColumns: "240px 1fr" }}>
          <div className="u">Modules on</div>
          <div style={{ display: "flex", gap: 20 }}>
            {SUBJECTS.map((m, i) => (
              <button key={m} className="btn" data-focused={focus === 3 + i} style={{ whiteSpace: "nowrap" }}>{NAME[m]}{d?.modules.includes(m) && <span className="pill" data-kind="done">on</span>}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="actions">
        <button className="btn" data-focused={focus === 6} data-disabled={!name}>Save</button>
        <button className="btn" data-focused={focus === 7}>Back</button>
      </div>
    </main>
  </>);
}
