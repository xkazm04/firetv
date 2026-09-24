"use client";
/**
 * Math Buddy's television: every screen of the maths module - Tonight (its home), the topics, the six
 * questions on paper, the marked sheet and its walk, and the page, hint, lesson, units and calendar when
 * maths is on the desk (tv/keys.ts `mathsOwns`). Each is drawn from the session and from the stop lists
 * in tv/keys.ts, so the D-pad there and the focus drawn here share one list.
 */
import { useEffect, useState } from "react";
import type { SchoolSystem, Session } from "@/lib/session/store";
import { SYLLABUS, expectedIndex, topic as topicById, type Topic } from "@/lib/library/syllabus";
import { slip as slipById } from "@/lib/rules/maths";
import { continueCard } from "@/tv/mathsRows";
import { running, practiceFailed, stopAt, tonightStops, calendarStops, TOPIC_STOPS, walkStops, type TonightStop } from "@/tv/keys";
import { sheetTiles, sheetStops, tileOf, type SheetTile } from "@/tv/sheetRows";
import { systemOf } from "@/tv/profileRows";
import { Clock, HintScreen, LessonScreen, PageScreen, Rail, Units, day, shown } from "@/tv/screens";

/** The root every Math Buddy screen is drawn in. */
export function MathsTV({ s, busy }: { s: Session; busy: boolean }) {
  const f = s.focus;
  switch (s.screen) {
    case "tonight": return <Tonight s={s} focus={f} />;
    case "topics": return <Topics s={s} focus={f} busy={busy} />;
    case "practice": return <PracticeScreen s={s} />;
    case "sheet": return <Sheet s={s} focus={f} />;
    case "walk": return <Walk s={s} focus={f} />;
    case "calendar": return <Calendar s={s} focus={f} />;
    case "units": return <Units s={s} focus={f} />;
    case "page": return <PageScreen s={s} view={s.view} />;
    case "hint": return <HintScreen s={s} focus={f} />;
    case "lesson": return <LessonScreen s={s} />;
    default: return null;
  }
}

// ---- T1 ----
/**
 * The two doors the D-pad meets: the sheet you were given, and a topic you choose. A label and a
 * name each — what either one does is the caption's job, and saying it twice was the old fault.
 */
const DOORS: Array<{ id: Exclude<TonightStop, "continue">; k: string; t: string }> = [
  { id: "homework", k: "The sheet you were given", t: "I have homework" },
  { id: "teach", k: "No sheet needed", t: "Teach me something" },
];
function doorCaption(s: Session, i: number): string {
  if (i === 1) return "Pick a topic and the desk writes six questions to work on paper, then marks them from a photo.";
  if (s.awaiting === "maths") return "Waiting for the Math Buddy page. Snap it on the phone — it appears here.";
  if (s.pages.some((p) => p.subject === "maths")) return "The sheet is already on the desk. Enter opens it, one problem at a time.";
  return "Snap the sheet on the phone and the desk reads it, one problem at a time — hints, never the answer.";
}


const COUNT = ["", "One", "Two", "Three", "Four", "Five"];

/** The last maths sheets, newest first: a title and a day each. Nothing counted, nothing explained. */
function Sheets({ s }: { s: Session }) {
  const rows = (s.history ?? []).filter((h) => h.kind === "homework").slice(-4).reverse();
  if (!rows.length) return <div className="nothing">Nothing yet</div>;
  return (
    <div className="sheets">
      {rows.map((h, i) => (
        <div key={`${h.at}-${i}`} className="s"><div className="t">{h.label}</div><div className="w">{day(h.at)}</div></div>
      ))}
    </div>
  );
}

/** The one school system's own word for a topic's year — the band as a single fact. */
const SYS_TAG: Record<SchoolSystem, string> = { us: "US", uk: "UK", cz: "CZ", de: "DE" };
function yearWord(t: Topic, sys: SchoolSystem): string {
  return { us: `Grade ${t.year.us}`, uk: `Year ${t.year.uk}`, cz: `${t.year.cz}. ročník`, de: `Klasse ${t.year.de}` }[sys];
}

/**
 * Where the learner stands on the path, drawn rather than said: one node per topic, white where
 * they have been, and a red tick at the point their school system would normally have them at.
 * No age (or a learner outside a school system) means no tick and no verdict — there is nothing
 * honest to compare against, and an invented comparison is worse than none.
 */
const PATH_W = 1240;
function Path({ s }: { s: Session }) {
  const me = s.profiles.find((p) => p.id === s.learner.id);
  const sys = systemOf(me);
  const secure = new Set(Object.values(s.skills ?? {}).filter((r) => r.secure).map((r) => r.topic));
  const done = SYLLABUS.filter((t) => secure.has(t.id)).length;
  const N = SYLLABUS.length, cell = PATH_W / N, cx = (i: number) => cell * i + cell / 2;

  // nothing measured and nothing ever attempted: not a greyed-out track, a starting line
  if (!done && !(s.history ?? []).some((h) => h.kind === "practice") && !s.practice) {
    const first = SYLLABUS[0];
    return (
      <div>
        <div className="chan" style={{ color: "var(--mute)" }}>Start here</div>
        <div style={{ fontFamily: "var(--display)", fontSize: 76, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".02em", lineHeight: .95, marginTop: 14, maxWidth: 1150 }}>{first.name}</div>
        <div className="chan" style={{ marginTop: 26, color: "var(--maths)" }}>{SYS_TAG[sys]} · {yearWord(first, sys)}</div>
      </div>
    );
  }

  const age = me && me.type !== "other" ? me.age : undefined;
  const exp = age === undefined ? null : expectedIndex(sys, age);
  const tick = exp === null ? null : Math.max(0, Math.min(N - 1, exp));
  const gap = exp === null ? null : done - Math.max(0, exp);
  const verdict = gap === null ? "" : gap > 0 ? `Ahead by ${COUNT[Math.min(gap, 5)].toLowerCase()}` : gap === 0 ? "On schedule" : `${COUNT[Math.min(-gap, 5)]} behind`;
  const state = (i: number) => (i < done ? "secure" : i === done ? "here" : "later");
  return (
    <div className="path" style={{ width: PATH_W }}>
      <div className="above">{tick !== null && <div className="tick" style={{ left: cx(tick) }}><b>Expected at {age}</b></div>}</div>
      <div className="nodes" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
        <div className="trk" style={{ left: cx(0), width: cx(N - 1) - cx(0) }} />
        {done > 0 && <div className="trk" data-walked="true" style={{ left: cx(0), width: cx(Math.min(done, N - 1)) - cx(0) }} />}
        {SYLLABUS.map((t, i) => <div key={t.id} className="cell"><i className="sq" data-s={state(i)} /></div>)}
      </div>
      <div className="names" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
        {SYLLABUS.map((t, i) => <span key={t.id} data-s={state(i)}>{t.name}</span>)}
      </div>
      {verdict && <div className="verdict-line">{verdict}</div>}
    </div>
  );
}

/**
 * M0 · Math Buddy's home. The doors are the screen; the half below them is one panel that belongs
 * to whichever door is focused — the last sheets, or the path. The continue card takes the focus
 * first when there is one and leaves that half empty: the caption already says what it does.
 */
export function Tonight({ s, focus }: { s: Session; focus: number }) {
  const cont = continueCard(s);
  const at = stopAt(tonightStops(s), focus);
  const secure = Object.values(s.skills ?? {}).filter((r) => r.secure).map((r) => r.topic);
  const sheets = s.pages.filter((p) => p.subject === "maths").length;
  const door = at === "continue" ? -1 : at === "teach" ? 1 : 0;
  const title = cont ? "One thing is still open"
    : secure.length === SYLLABUS.length ? "Every topic on the path is secure"
    : secure.length ? `${COUNT[secure.length]} of ${SYLLABUS.length} topics secure`
    : "Linear equations, from the first step";
  return (<>
    <div className="band band-left-thin" /><Rail s={s} />
    <main className="content">
      <div className="eyebrow" data-ch="maths">Math Buddy</div>
      <div className="title">{title}</div>
      <div className="cards" style={{ gridTemplateColumns: cont ? "1.1fr 1fr 1fr" : "1fr 1fr", marginTop: 20 }}>
        {cont && (
          <div className="card" data-focused={at === "continue"} style={{ minHeight: 160 }}>
            <div className="k">{cont.k}</div>
            <div className="t" style={{ fontSize: 40 }}>{cont.t}</div>
            <div className="d" style={{ marginTop: "auto" }}>{cont.d}</div>
          </div>
        )}
        {DOORS.map((d) => (
          <div key={d.t} className="card" data-focused={at === d.id} style={{ minHeight: 160 }}>
            <div className="k">{d.k}</div>
            <div className="t" style={{ fontSize: cont ? 40 : 46, marginTop: "auto" }}>{d.t}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 44 }}>{door === 0 ? <Sheets s={s} /> : door === 1 ? <Path s={s} /> : null}</div>
      <div style={{ position: "absolute", left: 0, bottom: 96 }}>
        <span className="cap" style={{ background: "transparent", color: "var(--maths)", border: "2px solid var(--maths)" }}>Math Buddy</span>
        <div className="cap-text">{cont && at === "continue" ? cont.cap : doorCaption(s, Math.max(0, door))}</div>
      </div>
      <div className="ticker"><span><b>{secure.length}</b> of {SYLLABUS.length} topics secure</span><i>·</i><span>{sheets ? <><b>{sheets}</b> sheet{sheets === 1 ? "" : "s"} on the desk</> : "no sheet yet"}</span><i>·</i><span>{s.practice ? (s.practice.marked ? "set marked" : "set on paper") : "no set open"}</span>
        <i>·</i>{s.joined ? <span>phone joined</span> : <span>phone code <b>{s.pin}</b> · Down to pair</span>}</div>
    </main>
  </>);
}

// ---- T2m Calendar (maths) ----
export function Calendar({ s, focus }: { s: Session; focus: number }) {
  const list = calendarStops();
  const cur = stopAt(list, focus);
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
            return <div key={l.id} className="cell" data-state={state} data-focused={l === cur}><div className="t">{l.title}</div><div className="s">{state === "done" ? "completed" : state === "next" ? "next up" : state === "locked" ? "later" : `${l.minutes} min`}</div></div>; }),
          ...Array.from({ length: 3 - (b - a) }, (_, k) => <div key={w + k} />),
        ])}
      </div>
      <Clock s={s} right />
      <div className="ticker"><span><b>{list.filter((l) => l.done).length}</b> of {list.length} completed</span><i>·</i><span>Select opens the lesson</span><i>·</i><span>Back to units</span></div>
    </main>
  </>);
}


/**
 * What the session alone can say about a topic. The learner's long-term record lives on the
 * server (lib/session/learners.ts, which reads the filesystem) and the session does not carry
 * it, so tonight's marked set is the only evidence the television has.
 */
type TState = "secure" | "here" | "next" | "later";
/**
 * What the card says about a topic — a description of fact, never of permission. Nothing on
 * this screen is locked: start-anywhere-and-adjust is the decision, so no word may imply a gate.
 */
function stateWord(s: Session, t: Topic, st: Record<string, TState>): string {
  if (st[t.id] === "secure") return "Secure";
  return st[t.id] === "here" || (s.skills?.[t.id]?.seen ?? 0) > 0 ? "In progress" : "Not started";
}
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
export function Topics({ s, focus, busy: asked }: { s: Session; focus: number; busy: boolean }) {
  const st = topicStates(s);
  const sys = systemOf(s.profiles.find((p) => p.id === s.learner.id));
  // the wait is this TV's own press, or a set the desk is already writing for anyone
  const busy = asked || running(s, "practice");
  const at = (busy && s.topic ? TOPIC_STOPS.find((t) => t.id === s.topic) : undefined) ?? stopAt(TOPIC_STOPS, focus)!;
  // a set that did not come back says so on its own card, and Select asks again
  const failed = busy ? null : practiceFailed(s, at.id);
  // guidance, never a gate: the topic most people take before this one, when it is not behind them yet
  const before = at.prereq.map((p) => topicById(p)).find((t) => t && st[t.id] !== "secure");
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
          : failed ? <><span className="cap">Not written</span><div className="cap-text">{failed}</div></>
          : <><span className="cap" style={{ background: "transparent", color: "var(--maths)", border: "2px solid var(--maths)" }}>{at.strand}</span>
              <div className="cap-text">{at.blurb}{before ? ` Most people do ${before.name} first.` : ""}</div></>}
      </div>
      <div className="cards" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 56 }}>
        {TOPIC_STOPS.map((t) => (
          <div key={t.id} className="card" data-focused={!busy && t === at} style={{ minHeight: 250, opacity: busy && t !== at ? 0.4 : 1 }}>
            <div className="k">{stateWord(s, t, st)}</div>
            <div className="t" style={{ fontSize: 40 }}>{t.name}</div>
            <div className="m">{yearWord(t, sys)}</div>
          </div>
        ))}
      </div>
      <div className="ticker">{busy
        ? <><span>writing <b>six</b> questions</span><i>·</i><span>about a minute</span><i>·</i><span>nothing to press</span></>
        : failed ? <><span>{at.name}</span><i>·</i><span>no set this time</span><i>·</i><span>Select to try again</span><i>·</i><span>Menu, Up or Back · Math Buddy</span></>
        : <><span><b>{SYLLABUS.length}</b> topics</span><i>·</i><span>six questions a set</span><i>·</i><span>about a minute a set</span><i>·</i><span>years · {SYS_TAG[sys]}</span><i>·</i><span>Select to begin</span><i>·</i><span>Menu, Up or Back · Math Buddy</span></>}</div>
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
      <div className="ticker"><span><b>{p.items.length}</b> questions</span><i>·</i><span>{t?.name ?? p.topic}</span><i>·</i><span>the phone is waiting for the sheet</span><i>·</i><span>Back keeps it for later</span></div>
    </main>
  </>);
}

// ---- M3 Sheet · the marked set as one picture. Band: shelf. Hero: the verdict tiles standing on it. ----
const TILE_WORD = { right: "Right", wrong: "Look again", unsure: "Not sure" } as const;
const HOW_MANY = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
/** What the caption says about the focused tile: where to look, never what the answer is. */
function tileCaption(t: SheetTile): string {
  if (t.verdict === "right") return `Number ${t.n} came back right. Select opens it all the same.`;
  if (t.verdict === "unsure") return `The desk could not be sure about number ${t.n}. Select opens it; tell the desk on the phone how you got there.`;
  const sl = t.slip ? slipById(t.slip) : undefined;
  return sl ? `Number ${t.n} needs another look, starting at ${sl.points}. Select opens it.` : `Number ${t.n} needs another look. Select opens it.`;
}
export function Sheet({ s, focus }: { s: Session; focus: number }) {
  const p = s.practice;
  if (!p || !p.marked) return <main className="content-full"><div className="title">No marked set on the desk</div></main>;
  const t = topicById(p.topic), name = t?.name ?? p.topic;
  const tiles = sheetTiles(p), at = stopAt(sheetStops(p), focus), ix = tileOf(at), tile = ix === null ? undefined : tiles[ix];
  const right = tiles.filter((x) => x.verdict === "right").length, look = tiles.length - right;
  return (<>
    <div className="band band-shelf" />
    <main className="content-full">
      <div className="eyebrow" data-ch="maths">Math Buddy · your sheet, marked · {name}</div>
      <div className="title">{look ? `${HOW_MANY[look] ?? look} to look at` : `All ${HOW_MANY[tiles.length]?.toLowerCase() ?? tiles.length} right`}</div>
      <div className="tiles" style={{ gridTemplateColumns: `repeat(${tiles.length}, 1fr)` }}>
        {tiles.map((x, i) => (
          <div key={x.n} className="tile" data-v={x.verdict} data-focused={ix === i}>
            <div className="n">{x.n}</div>
            <div className="w">{TILE_WORD[x.verdict]}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, top: 500 }}>
        <span className="cap" style={{ background: "transparent", color: "var(--maths)", border: "2px solid var(--maths)" }}>{tile ? `Number ${tile.n}` : at === "more" ? "Six more" : "Put away"}</span>
        <div className="cap-text">{tile ? tileCaption(tile)
          : at === "more" ? `Six new questions on ${name}, aimed at the slips the desk has seen. Work them on paper, like this set.`
          : "The set leaves the desk. What it showed is already in your record."}</div>
      </div>
      <div className="actions">
        <button className="btn" data-focused={at === "more"}>Six more</button>
        <button className="btn" data-focused={at === "away"}>Put the sheet away</button>
      </div>
      <div className="ticker"><span><b>{right}</b> right</span><i>·</i><span><b>{look}</b> to look at</span><i>·</i><span>{name}</span><i>·</i><span>Select opens one</span><i>·</i><span>Back keeps it for later</span></div>
    </main>
  </>);
}

// ---- M4 Walk · one marked item at a time. Band: gauge. Hero: a lower-third and a verdict mark. ----
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
        <div className="cap-text">{it.reply ?? it.said ?? (v === "right" ? "This one is right. Nothing more to say about it." : "The desk has no comment on this one.")}</div>
      </div>
      {last && <div className="actions"><button className="btn" data-focused={stopAt(walkStops(s), focus) === "sheet"}>Back to the sheet</button></div>}
      <div className="ticker"><span>item <b>{s.walkIx + 1}</b> of {p.items.length}</span><i>·</i><span><b>{right}</b> right</span><i>·</i><span><b>{look}</b> to look at</span><i>·</i><span>{last ? "Select · the whole sheet" : "Left and Right walk the set"}</span><i>·</i><span>Back · the whole sheet</span></div>
    </main>
  </>);
}