"use client";
/**
 * Essay Master's television screens: the lens home, the forensic reading, the playbook and the x-ray.
 * Its own module, so the app can leave the shared On Air screens behind.
 */
import type { Session } from "@/lib/session/store";
import { ESSAY_TYPES } from "@/lib/library/lessons.data";
import { stopAt, LENS_STOPS, PLAYBOOK_STOPS } from "@/tv/keys";
import { lensStandings, writingTotals, type LensStanding } from "@/tv/writingRows";
import { day } from "@/tv/screens";

// ---- T8 Essay analysis type ----
/**
 * Essay Master's home. Each lens card carries where the learner stands on it, drawn: the measured
 * estimate as a bar, and one label — secure, the day it was last read, or not read yet.
 */
export function EssayType({ s, focus }: { s: Session; focus: number }) {
  const dia = ["thesis", "para", "order", "concl"];
  const standings = lensStandings(s.history, s.writing);
  const totals = writingTotals(standings, s.history);
  const at = stopAt(LENS_STOPS, focus);
  return (<>
    <div className="band band-low" />
    <main className="content-full">
      <div className="eyebrow" data-ch="essay">Essay · what should the desk look at?</div>
      <div className="title">Choose the lens</div>
      <div className="cards" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "300px 300px", marginTop: 40 }}>
        {LENS_STOPS.map((t, i) => (
          <div key={t.id} className="card" data-focused={t === at} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 28, alignItems: "center" }}>
            <Diagram kind={dia[i]} focused={t === at} />
            <div><div className="t">{t.name}</div><div className="d" style={{ marginTop: 10 }}>{t.promise}</div><LensMeter l={standings.find((x) => x.id === t.id)} /></div>
          </div>
        ))}
      </div>
      <div className="ticker">{totals.read
        ? <><span><b>{totals.read}</b> paragraph{totals.read === 1 ? "" : "s"} read</span><i>·</i><span><b>{totals.secure}</b> of {ESSAY_TYPES.length} lenses secure</span><i>·</i><span>Select a lens</span></>
        : <><span>Select a lens</span><i>·</i><span>then paste or dictate the paragraph on the phone</span></>}</div>
    </main>
  </>);
}
function LensMeter({ l }: { l?: LensStanding }) {
  const when = l?.lastAt ? day(l.lastAt) : "";
  const word = l?.secure ? (when ? `Secure · ${when}` : "Secure") : when ? `Read ${when}` : "Not read yet";
  return (
    <div className="lens">
      <div className="w" data-secure={!!l?.secure}>{word}</div>
      <div className="track"><i style={{ width: `${Math.round((l?.estimate ?? 0) * 100)}%` }} /></div>
    </div>
  );
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
const PLAYS: Record<(typeof PLAYBOOK_STOPS)[number], [string, string]> = {
  thesis: ["Thesis", "One sentence that takes a side and says why."], para: ["Paragraph", "Claim, then evidence, then the link back."],
  order: ["Order", "Which argument goes first, and why that one."], concl: ["Conclusion", "What the introduction promised, now delivered."],
};
export function Playbook({ focus }: { s: Session; focus: number }) {
  const at = stopAt(PLAYBOOK_STOPS, focus);
  return (<>
    <div className="band band-low" />
    <main className="content-full">
      <div className="eyebrow" data-ch="essay">Essay · playbook</div>
      <div className="title">Choose a structure to work on</div>
      <div className="cards" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "300px 300px", marginTop: 40 }}>
        {PLAYBOOK_STOPS.map((k) => { const [t, d] = PLAYS[k]; return <div key={k} className="card" data-focused={k === at} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 28, alignItems: "center" }}><Diagram kind={k} focused={k === at} /><div><div className="t">{t}</div><div className="d" style={{ marginTop: 10 }}>{d}</div></div></div>; })}
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

