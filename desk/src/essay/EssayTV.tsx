"use client";
/**
 * Essay Master's television, in its own design language: Specimen (docs/DESIGN-ESSAY-MASTER.md,
 * design/essay-specimen.css). Four screens - the lens home (essaytype), one sentence at a time (forensic,
 * with the table behind Menu), the playbook and the x-ray - each drawn from the session and from the stop
 * lists in tv/keys.ts, so the D-pad there and the focus drawn here share one list. The On Air shell (grid,
 * band, safe box) steps aside: this root is the whole 1920 x 1080 stage and keeps the 5% margins itself.
 */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Session, Verdict } from "@/lib/session/store";
import { ESSAY_TYPES, playFor, playLesson, type Play } from "@/lib/library/lessons.data";
import { cleanFix, type Fix } from "@/lib/rules/essay";
import { stopAt, lensStops, forensicAt, rewriteStatus, LENS_STOPS, PLAYBOOK_STOPS, FORENSIC_STOPS } from "@/tv/keys";
import { lensStandings, writingTotals } from "@/tv/writingRows";
import { fmt } from "@/tv/useSession";
import { day } from "@/tv/screens";
import { ESSAY_FONTS } from "./fonts";

const CIT = "#DCFF4E", BONE = "#EEE9E0", MUTE = "rgba(238,233,224,.5)";

/** The root every Essay Master screen is drawn in. `table` is the TV's own Menu toggle on the forensic page. */
export function EssayTV({ s, table }: { s: Session; table: boolean }) {
  return (
    <div className={`essay-tv ${ESSAY_FONTS}`} data-screen={s.screen}>
      {s.screen === "essaytype" ? <EssayType s={s} focus={s.focus} />
        : s.screen === "forensic" ? <Forensic s={s} table={table} />
        : s.screen === "playbook" ? <Playbook s={s} focus={s.focus} />
        : s.screen === "xray" ? <Xray s={s} /> : null}
    </div>
  );
}

// ---------------------------------------------------------------- the shell: brand, chips, caption

/** The mark: a whole E with the citron caret after it. */
function Brand() {
  return (
    <header className="em-brand" data-role="essay-mark">
      <svg className="em-mark" viewBox="0 0 64 72" aria-hidden="true"><path fill={BONE} d="M4 6h40v12H17v12h23v12H17v12h27v12H4z" /><rect x="52" y="1" width="8" height="70" fill={CIT} /></svg>
      <div className="em-wm">ESSAY<b>MASTER</b></div>
    </header>
  );
}
/** The header chips: what Menu does here, the focus timer, the phone, the learner. Status, never a stop. */
function Top({ s, menu, lit }: { s: Session; menu: string; lit?: boolean }) {
  return (
    <div className="em-top">
      <div className="em-pill" data-role="essay-chip"><span className="em-key">MENU</span><span>{menu}</span></div>
      <div className={`em-pill${s.timer.running ? " run" : ""}`} data-role="essay-chip"><span className="em-lbl" style={{ fontSize: 20 }}>{s.timer.phase === "break" ? "Break" : "Focus"}</span><span className="em-t">{fmt(s.timer.left)}</span></div>
      <div className={`em-pill${lit ? " lit" : ""}`} data-role="essay-chip">{PHONE}<span>{s.joined ? "Phone joined" : `PIN ${s.pin}`}</span></div>
      <div className="em-pill" data-role="essay-chip"><span className="em-av">{s.learner.name.charAt(0)}</span><span>{s.learner.name}</span></div>
    </div>
  );
}
/** The one caption slot: a citron label and one sentence. A new caption rises in; under reduced motion it cuts. */
function Caption({ label, text, className }: { label: string; text: string; className?: string }) {
  return <div className={`em-cap ${className ?? ""}`} key={label + "|" + text}><div className="em-lbl">{label}</div><p>{text}</p></div>;
}

// ---------------------------------------------------------------- drawing kit

const ICON: Record<string, ReactNode> = {
  structure: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3.5" width="18" height="4.5" /><rect x="3" y="10" width="11" height="4.5" /><rect x="3" y="16.5" width="15" height="4.5" /></svg>,
  argument: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="square"><path d="M3 12h16M13 5.5l6.5 6.5-6.5 6.5" /></svg>,
  evidence: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><circle cx="10" cy="10" r="7" /><path d="M15.2 15.2L21 21M6.8 10.2l2.3 2.3 4.2-4.6" /></svg>,
  language: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M2 13c2.2-6 4.4-6 6.6 0s4.4 6 6.6 0 4.4-6 6.8-1" /></svg>,
};
const SEAL = <svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" fill="currentColor" /><path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="#0B0B0D" strokeWidth="3" /></svg>;
const PHONE = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M10.5 18.5h3" /></svg>;
const WAYS = [
  <svg key="p" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="6" y="4" width="12" height="17" rx="1" /><path d="M9 4V2.5h6V4M9 10h6M9 14h4" /></svg>,
  <svg key="t" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="1" /><path d="M6 10h1M10 10h1M14 10h1M7 14h10" /></svg>,
  <svg key="d" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4" /></svg>,
];
const ACT_ICON: Record<(typeof FORENSIC_STOPS)[number], ReactNode> = {
  rewrite: PHONE,
  why: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M4 9a8 8 0 1 1 8 8M12 13V9" /><path d="M4 9l-2.5 3M4 9l3 2.4" /></svg>,
  next: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="square"><path d="M12 3v16M5.5 12.5L12 19l6.5-6.5" /></svg>,
  back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="square"><path d="M21 12H5M11 5.5L4.5 12l6.5 6.5" /></svg>,
};
const ACT_WORD: Record<(typeof FORENSIC_STOPS)[number], string> = { rewrite: "Rewrite on my phone", why: "Why this matters", next: "Next sentence", back: "Back to the paragraph" };

/** An arrow the length of a sentence: with the side the paragraph takes, or (against) pointing back at it. */
function Arrow({ len, against, color, h = 28, className }: { len: number; against?: boolean; color: string; h?: number; className?: string }) {
  const y = h / 2, t = 7, head = h * 0.62;
  const d = against
    ? `M${len} ${y - t / 2}H${head}V1L0 ${y}L${head} ${h - 1}V${y + t / 2}H${len}z`
    : `M0 ${y - t / 2}H${len - head}V1L${len} ${y}L${len - head} ${h - 1}V${y + t / 2}H0z`;
  return <svg className={className} width={len} height={h} viewBox={`0 0 ${len} ${h}`} aria-hidden="true"><path d={d} fill={color} /></svg>;
}
/** A word as letters in three groups: Structure splits on them, Language ripples through them. */
function Letters({ word }: { word: string }) {
  const n = word.length, a = Math.ceil(n / 3), b = Math.ceil((2 * n) / 3);
  return <>{word.split("").map((ch, k) => <span key={k} className={k < a ? "g1" : k < b ? "g2" : "g3"} style={{ "--n": k } as CSSProperties}>{ch}</span>)}</>;
}

/** The pattern as a frame: its literal words around [slots] the learner fills on the phone. Never an example. */
function Pattern({ pattern, label, compact }: { pattern: string; label: ReactNode; compact?: boolean }) {
  const slots = (pattern.match(/\[[^[\]]+\]/g) ?? []).map((x) => x.slice(1, -1));
  const pieces = pattern.split(/\[[^[\]]+\]/).map((p) => p.trim());
  return (
    <div className={`em-pat${compact ? " compact" : ""}`} data-role="essay-pattern">
      <div className="em-hd">{label}</div>
      <div className="em-line">
        {pieces[0] && <span className="em-op">{pieces[0]}</span>}
        {slots.map((sl, k) => {
          const other = /other side|opposite|against|counter/i.test(sl);
          return [
            <span key={"s" + k} className="em-slot" data-role="essay-slot"><Arrow len={34} h={22} against={other} color={other ? "rgba(238,233,224,.7)" : CIT} /><em>{sl}</em></span>,
            pieces[k + 1] ? <span key={"p" + k} className="em-pn">{pieces[k + 1]}</span> : null,
          ];
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the lens home (essaytype)

/**
 * Essay Master's home. The lens names are the progress bars: each is inked from the left as far as the
 * learner has got, with a citron cursor bar at the ink's edge; a lens not read yet is a hatched plate.
 * Right of them, the last paragraph as a picture, and its door to the sentence that needs a look.
 */
export function EssayType({ s, focus }: { s: Session; focus: number }) {
  const standings = lensStandings(s.history, s.writing);
  const totals = writingTotals(standings, s.history);
  const stops = lensStops(s), at = stopAt(stops, focus);
  const lens = at && at !== "last" ? at : null;
  const a = s.essay;
  const rows = useRef<HTMLDivElement>(null);
  const commit = useCommit(s.status);

  // place the Argument arrow after its word and the Structure brackets under its three groups (layout px, unscaled)
  useLayoutEffect(() => {
    const place = () => rows.current?.querySelectorAll<HTMLElement>(".em-w").forEach((w) => {
      const ol = w.querySelector<HTMLElement>(".em-ol"); if (!ol) return;
      const arrow = w.querySelector<SVGElement>(".em-arrow"); if (arrow) arrow.style.left = `${52 + ol.offsetWidth + 40}px`;
      const brk = w.querySelector<SVGElement>(".em-brk"); if (!brk) return;
      const sp = [...ol.querySelectorAll<HTMLElement>("span")];
      const d = ["g1", "g2", "g3"].map((g, k) => {
        const grp = sp.filter((e) => e.className === g); if (!grp.length) return "";
        const l = grp[0].offsetLeft + k * 26, r = grp[grp.length - 1].offsetLeft + grp[grp.length - 1].offsetWidth + k * 26;
        return `M${l + 6} 2 V12 H${r - 6} V2`;
      }).join(" ");
      brk.setAttribute("width", String(ol.offsetWidth + 80));
      brk.innerHTML = `<path d="${d}" fill="none" stroke="${CIT}" stroke-width="4"/>`;
    });
    place();
    document.fonts?.ready.then(place).catch(() => {});
  }, []);

  const job = s.jobs?.analyse?.key === "essay" ? s.jobs.analyse : undefined;
  const chosen = lens && s.essayType === lens.id;
  const cap = job?.phase === "running" ? { label: "Reading", text: "The desk is reading your paragraph. It lands here." }
    : job?.phase === "failed" && (chosen || !a) ? { label: "Not read", text: job.error ?? "The paragraph did not come back. Send it again from the phone." }
    : at === "last" && a ? { label: `Last verdict · ${ESSAY_TYPES.find((t) => t.id === a.type)?.name ?? "Structure"}`, text: a.summary }
    : lens && chosen ? { label: `${lens.name} · chosen`, text: "Paste, type or dictate one paragraph on the phone." }
    : lens ? { label: `${lens.name} reads`, text: lens.promise } : { label: "Essay Master", text: "Choose a lens." };

  return (<>
    <Brand /><Top s={s} menu="Playbook" />
    <section className="em-stack">
      <div className="em-lbl em-h">Choose a lens</div>
      {totals.read > 0 && <div className="em-lbl em-tot"><span><b>{totals.read}</b> paragraph{totals.read === 1 ? "" : "s"} read</span></div>}
      <div className="em-rows" ref={rows}>
        {LENS_STOPS.map((l, i) => {
          const st = standings.find((x) => x.id === l.id);
          const none = !st?.lastAt && !st?.estimate;
          const f = Math.round(Math.min(1, st?.estimate ?? 0) * 100);
          const focused = lens === l;
          const status = none ? <span className="em-d">Not read</span>
            : st!.secure ? <><span className="em-lbl em-sec">{SEAL}Secure</span><span className="em-d">{st!.lastAt ? day(st!.lastAt) : ""}</span></>
            : <><span className="em-lbl">Read</span><span className="em-d">{st!.lastAt ? day(st!.lastAt) : ""}</span></>;
          return (
            <div key={l.id} className={`em-w${none ? " none" : ""}${focused ? " is-focused" : ""}${commit === l.id ? " commit" : ""}`} data-k={l.id} data-focused={focused}
              style={{ "--em-f": `${f}%`, "--em-hw": `${Math.max(18, f)}%` } as CSSProperties}>
              <span className="em-caret" />
              <span className="em-hl" />
              <div className="em-type" data-role="essay-lens-word">
                <div className="em-ol"><Letters word={l.name} /></div>
                <div className="em-sol" style={{ animationDelay: `${300 + i * 160}ms` }}><Letters word={l.name} />{!none && <i className="em-ink" data-role="essay-lens-meter" />}</div>
              </div>
              {l.id === "argument" && <svg className="em-arrow" viewBox="0 0 84 72" aria-hidden="true"><path d="M4 36h70M46 8l28 28-28 28" fill="none" stroke={CIT} strokeWidth="9" /></svg>}
              {l.id === "structure" && <svg className="em-brk" width="900" height="14" aria-hidden="true" />}
              <div className="em-st">{status}</div>
            </div>
          );
        })}
      </div>
    </section>
    <aside className="em-side">
      {a ? <LastParagraph a={a} focused={at === "last"} /> : (
        <div className="em-panel" data-role="essay-specimen-card">
          <div className="em-lbl">First paragraph</div>
          <h2 className="em-big">Nothing read</h2>
          <div className="em-ways">{["Paste", "Type", "Dictate"].map((w, k) => <div key={w}>{WAYS[k]}<span className="em-lbl">{w}</span></div>)}</div>
          <div className="em-meta">{PHONE}{s.joined ? "Phone joined" : `PIN ${s.pin}`}</div>
        </div>
      )}
    </aside>
    <div className="em-caption"><Caption label={cap.label} text={cap.text} /></div>
  </>);
}

/** The last paragraph as a picture: a block per sentence, as long as the sentence; the faulty ones citron, pointing back. */
function LastParagraph({ a, focused }: { a: NonNullable<Session["essay"]>; focused: boolean }) {
  const faulty = new Set(a.verdicts.filter((v) => v.verdict === "faulty").map((v) => v.n));
  const first = a.sentences.find((x) => faulty.has(x.n));
  const w0 = (a.sentences[0]?.text ?? "").split(",")[0].split(/\s+/).filter(Boolean);
  const opening = (w0.length > 8 ? w0.slice(0, 6) : w0).join(" ");
  const W = 432, gap = 8, n = a.sentences.length, tot = a.sentences.reduce((x, y) => x + y.words, 0) || 1, per = (W - gap * Math.max(0, n - 1)) / tot;
  let x = 0;
  const blocks = a.sentences.map((sn) => {
    const bw = Math.max(4, sn.words * per), bad = faulty.has(sn.n), at = x; x += bw + gap;
    return (
      <g key={sn.n}>
        <rect x={at.toFixed(1)} y="28" width={bw.toFixed(1)} height="30" fill={bad ? CIT : "rgba(238,233,224,.3)"} />
        {bad && bw > 30 && <path d={`M${at + 12} 43 l14 -9 v18 z`} fill="#0B0B0D" />}
        {(bw >= 26 || bad) && <text x={(at + bw / 2).toFixed(1)} y="96" textAnchor="middle" fontFamily="var(--em-mono)" fontWeight="600" fontSize="28" fill={bad ? CIT : "rgba(238,233,224,.55)"}>{sn.n}</text>}
      </g>
    );
  });
  return (
    <div className={`em-panel${focused ? " is-focused" : ""}`} data-role="essay-specimen-card" data-focused={focused}>
      <div className="em-lbl">Last paragraph</div>
      <h2>“{opening}…”</h2>
      <svg className="em-strip" width={W} height="104" viewBox={`0 0 ${W} 104`} aria-hidden="true">
        {blocks}
        <path d={`M0 10 H${W - 4} M${W - 16} 2 l12 8 -12 8`} stroke={BONE} strokeWidth="3" fill="none" opacity=".6" />
      </svg>
      {first
        ? <div className="em-door"><svg viewBox="0 0 62 36" aria-hidden="true"><path d="M62 14.5H22V1L0 18l22 17V21.5h40z" fill={CIT} /></svg><span>Sentence {first.n}</span><span className="em-key">OK</span></div>
        : <div className="em-door"><span>Nothing to fix</span><span className="em-key">OK</span></div>}
    </div>
  );
}

/** The lens just chosen on this TV, for the flood of citron that acknowledges Select. */
function useCommit(status: string): string | null {
  const [id, setId] = useState<string | null>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const m = /^(\w+) lens chosen/.exec(status); if (!m) return;
    setId(m[1]); const t = setTimeout(() => setId(null), 4200); return () => clearTimeout(t);
  }, [status]);
  return id;
}

// ---------------------------------------------------------------- one sentence (forensic)

/** What the page teaches for a faulty sentence: the reading's own fix, or the lens's playbook lesson as the move. */
function teaching(v: Verdict | undefined, type: string): { fix: Fix; from: Play | null } | null {
  if (v?.verdict !== "faulty") return null;
  const own = cleanFix(v.fix);
  if (own) return { fix: own, from: null };
  const play = playFor(type);
  return { fix: { move: play.move, pattern: play.pattern }, from: play };
}

/**
 * The forensic page: the paragraph as arrows on the left, and one sentence - the problem, THE MOVE in the
 * landing's giant type (what the sentence already does inked, what it misses hatched), THE PATTERN as a
 * frame with slots - and four actions. It opens on the first faulty sentence; Up/Down walk the paragraph.
 * Menu swaps the page for the table.
 */
export function Forensic({ s, table }: { s: Session; table: boolean }) {
  const a = s.essay;
  if (!a || !a.sentences.length) return (<>
    <Brand /><Top s={s} menu="Table" />
    <section className="em-main"><div className="em-crumb em-lbl">Your paragraph</div>
      <div className="em-move" style={{ marginTop: 60 }}><div className="em-move-type"><div className="em-g"><span className="em-wd em-hatch">Nothing read</span></div></div></div></section>
    <div className="em-caption" style={{ left: 414, top: 820, width: 1180 }}><Caption label="Your paragraph" text="Paste, type or dictate one paragraph on the phone, and it is read here." /></div>
  </>);
  const i = forensicAt(s), sn = a.sentences[i], N = a.sentences.length;
  const verdicts = new Map(a.verdicts.map((v) => [v.n, v]));
  const v = verdicts.get(sn.n);
  const lens = ESSAY_TYPES.find((t) => t.id === a.type) ?? ESSAY_TYPES[0];
  const lit = s.status === rewriteStatus(sn.n);
  if (table) return <Table s={s} a={a} cur={i} verdicts={verdicts} />;
  return (<>
    <Brand /><Top s={s} menu="Table" lit={lit} />
    <Rail a={a} cur={i} verdicts={verdicts} />
    <Page key={sn.n} sn={sn} n={N} v={v} lens={lens} type={a.type} inked={lit} />
    <nav className="em-acts">
      {FORENSIC_STOPS.map((k, j) => (
        <div key={k} className={`em-pill em-act${j === 0 ? " prim" : ""}${stopAt(FORENSIC_STOPS, s.focus) === k ? " is-focused" : ""}`} data-focused={stopAt(FORENSIC_STOPS, s.focus) === k} {...(j === 0 ? { "data-role": "essay-primary" } : {})}>
          {ACT_ICON[k]}<span>{ACT_WORD[k]}</span>
        </div>
      ))}
    </nav>
  </>);
}

type Reading = NonNullable<Session["essay"]>;
type Sent = Reading["sentences"][number];
const verdictOf = (m: Map<number, Verdict>, n: number) => m.get(n)?.verdict ?? "neutral";

/** The paragraph as one arrow per sentence, as long as the sentence; faulty sentences point back, in citron. */
function Rail({ a, cur, verdicts }: { a: Reading; cur: number; verdicts: Map<number, Verdict> }) {
  const maxW = Math.max(1, ...a.sentences.map((x) => x.words));
  const rh = Math.max(44, Math.min(96, Math.floor(740 / a.sentences.length)));
  return (
    <aside className="em-rail" data-role="essay-rail" style={{ "--em-rh": `${rh}px` } as CSSProperties}>
      <div className="em-lbl">Paragraph</div>
      <div className="em-rrows">
        {a.sentences.map((x, j) => {
          const vd = verdictOf(verdicts, x.n), bad = vd === "faulty";
          return (
            <div key={x.n} className={`em-r${bad ? " bad" : ""}${j === cur ? " cur" : ""}`} data-verdict={vd} data-current={j === cur}>
              <span className="em-n">{x.n}</span>
              <Arrow len={Math.round(56 + (124 * x.words) / maxW)} against={bad} color={bad ? CIT : vd === "strong" ? BONE : MUTE} />
            </div>
          );
        })}
      </div>
    </aside>
  );
}

/** The one sentence the page is about. Keyed by sentence, so moving along the paragraph remounts it (and its fit). */
function Page({ sn, n, v, lens, type, inked }: { sn: Sent; n: number; v: Verdict | undefined; lens: (typeof ESSAY_TYPES)[number]; type: string; inked: boolean }) {
  const main = useRef<HTMLElement>(null);
  const t = teaching(v, type);
  const vd = v?.verdict ?? "neutral";
  // fit: the move's widest line to the column, then the whole page to its 800 px - the move and the sentence give way, never the actions
  useLayoutEffect(() => {
    const el = main.current; if (!el) return;
    const fit = () => {
      let move = 128, sent = sn.words > 40 ? 40 : sn.words > 28 ? 46 : 54;
      const set = () => { el.style.setProperty("--em-move-size", `${move}px`); el.style.setProperty("--em-sent-size", `${sent}px`); };
      el.style.removeProperty("--em-move-wrap"); set();
      const lines = [...el.querySelectorAll<HTMLElement>(".em-move-type .em-g")];
      const ratio = Math.min(1, ...lines.map((l) => l.clientWidth / Math.max(1, l.scrollWidth)));
      // below the floor the move wraps rather than shrink past reading from the sofa
      if (move * ratio < 72) el.style.setProperty("--em-move-wrap", "normal");
      move = Math.max(72, Math.floor(move * ratio)); set();
      for (let k = 0; k < 8 && el.scrollHeight > el.clientHeight + 1; k++) {
        if (move > 80) move = Math.max(80, Math.floor(move * 0.86)); else if (sent > 38) sent -= 4; else break;
        set();
      }
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
  }, [sn.n, sn.text, t?.fix.move, t?.fix.pattern]);

  const note = v?.note?.trim();
  const noteCap = vd === "faulty" ? { label: "Look again · the problem", text: note || `Read it again through the ${lens.name} lens: ${lens.promise}` }
    : vd === "strong" ? { label: "Well done", text: note || "This sentence does its job." }
    : { label: "Neutral", text: note || "Nothing flagged." };
  return (
    <section className="em-main em-rise" ref={main}>
      <div className="em-crumb em-lbl">{ICON[lens.id]}<span className="em-ln">{lens.name}</span><span>· Sentence {sn.n} of {n} · {sn.role}</span></div>
      <div className="em-sent" data-role="essay-sentence"><span className="em-q" aria-hidden="true">“</span><SentenceText text={sn.text} faulty={vd === "faulty"} /></div>
      <div className="em-note" data-role="essay-problem" data-verdict={vd}><Caption label={noteCap.label} text={noteCap.text} /></div>
      {t ? <>
        <Move move={t.fix.move} label={t.from ? `The move · playbook · ${t.from.title}` : "The move"} inked={inked} />
        <Pattern pattern={t.fix.pattern} label={<span className="em-lbl">{t.from ? `The pattern · ${t.from.title}` : "The pattern"}</span>} />
      </> : (
        <div className={`em-move em-role${vd === "strong" ? "" : " neutral"}`}>
          <div className="em-lbl">Its job</div>
          <div className="em-move-type"><div className="em-g"><span className="em-wd">{sn.role}</span><Arrow className="em-arr" len={150} h={110} color={vd === "strong" ? CIT : "rgba(238,233,224,.4)"} /></div></div>
          {vd === "strong" && <div className="em-none">Nothing to fix</div>}
        </div>
      )}
    </section>
  );
}

/** The sentence, the learner's own words; when faulty, the clause it ends on (where the reader is left standing) is underlined, and an arrow points back. */
function SentenceText({ text, faulty }: { text: string; faulty: boolean }) {
  if (!faulty) return <>{text}</>;
  const k = text.lastIndexOf(", ");
  const head = k > 0 ? text.slice(0, k + 1) + " " : "", tail = k > 0 ? text.slice(k + 2) : text;
  return <>{head}<span className="em-land">{tail}</span><Arrow className="em-back" len={62} h={36} against color={CIT} /></>;
}

/** THE MOVE in giant condensed type: the first half solid, the half the sentence misses hatched with the caret waiting at it. */
function Move({ move, label, inked }: { move: string; label: string; inked: boolean }) {
  const parts = move.split(/,\s*/);
  let turn = parts.slice(1).join(", "), then = "";
  const m = /^(then)\s+(.*)$/i.exec(turn); if (m) { then = m[1]; turn = m[2]; }
  const hatched = (w: string) => <span className="em-wd"><span className="em-hatch">{w}</span><span className="em-gink" aria-hidden="true">{w}</span><i className="em-cursor" /></span>;
  return (
    <div className={`em-move${inked ? " done" : ""}`}>
      <div className="em-lbl">{label}</div>
      <div className="em-move-type" data-role="essay-move">
        {parts.length > 1 ? <>
          <div className="em-g"><span className="em-wd em-solid">{parts[0]},</span></div>
          <div className="em-g em-l2">
            <svg className="em-hook" viewBox="0 0 170 100" aria-hidden="true"><path d="M18 0V36Q18 62 44 62H150" fill="none" stroke={CIT} strokeWidth="12" /><path d="M130 38l26 24-26 24" fill="none" stroke={CIT} strokeWidth="12" /></svg>
            {then && <span className="em-then">{then}</span>}
            {hatched(turn)}
          </div>
        </> : <div className="em-g" style={{ paddingLeft: 26 }}>{hatched(parts[0])}</div>}
      </div>
    </div>
  );
}

/** Menu on the forensic page: the paragraph as rows - number, sentence, role, length - the current one focused. */
function Table({ s, a, cur, verdicts }: { s: Session; a: Reading; cur: number; verdicts: Map<number, Verdict> }) {
  const WINDOW = 6, start = Math.max(0, Math.min(cur - 2, a.sentences.length - WINDOW));
  const rows = a.sentences.slice(start, start + WINDOW);
  const maxW = Math.max(1, ...a.sentences.map((x) => x.words));
  const figs: Array<[number, string]> = [[a.stats.sentences ?? a.sentences.length, "sentences"], [a.stats.claims ?? 0, "claims"], [a.stats.evidence ?? 0, "evidence"], [a.stats.connectors ?? 0, "connectors"], [a.stats.avgWords ?? 0, "words avg"]];
  return (<>
    <Brand /><Top s={s} menu="Sentence" />
    <section className="em-table">
      <div className="em-lbl">Paragraph · table · {ESSAY_TYPES.find((t) => t.id === a.type)?.name ?? ""} lens</div>
      <div className="em-figs">{figs.map(([n, w]) => <div key={w}><b>{n}</b><span className="em-lbl">{w}</span></div>)}</div>
      <div className="em-thead em-lbl"><span /><span>#</span><span>Sentence</span><span>Role</span><span>Length</span><span>Reads</span></div>
      {rows.map((x) => {
        const j = a.sentences.indexOf(x), vd = verdictOf(verdicts, x.n), on = j === cur;
        return (
          <div key={x.n} className={`em-trow${vd === "faulty" ? " bad" : ""}${on ? " is-focused" : ""}`} data-focused={on} data-verdict={vd}>
            <span className="em-caret" />
            <span />
            <span className="em-n">{x.n}</span>
            <span className="em-tx">{x.text}</span>
            <span className="em-chip" data-r={x.role}>{x.role}</span>
            <span className="em-len"><i style={{ width: Math.round(24 + (196 * x.words) / maxW) }} /><b>{x.words}</b></span>
            <span><Arrow len={72} against={vd === "faulty"} color={vd === "faulty" ? CIT : vd === "strong" ? BONE : MUTE} /></span>
          </div>
        );
      })}
    </section>
    <div className="em-keys"><span className="em-key">OK</span><span className="em-lbl">Open sentence {a.sentences[cur].n}</span><span className="em-key" style={{ marginLeft: 24 }}>MENU</span><span className="em-lbl">Back to the sentence</span></div>
  </>);
}

// ---------------------------------------------------------------- the playbook and the x-ray

/** The playbook: four structures as giant type specimens, fully inked; the focused one's pattern stands beside them. */
export function Playbook({ s, focus }: { s: Session; focus: number }) {
  const at = stopAt(PLAYBOOK_STOPS, focus) ?? PLAYBOOK_STOPS[0];
  const forReading = s.essay ? playFor(s.essay.type) : null;
  const unit = (p: Play) => playLesson(p)?.unit ?? PLAYBOOK_STOPS.indexOf(p) + 1;
  return (<>
    <Brand /><Top s={s} menu="Back" />
    <section className="em-stack">
      <div className="em-lbl em-h">Playbook · four structures</div>
      <div className="em-rows">
        {PLAYBOOK_STOPS.map((p, i) => (
          <div key={p.id} className={`em-w${p === at ? " is-focused" : ""}`} data-k="book" data-focused={p === at} style={{ "--em-f": "100%" } as CSSProperties}>
            <span className="em-caret" />
            <div className="em-type">
              <div className="em-ol"><Letters word={p.title} /></div>
              <div className="em-sol" style={{ animationDelay: `${i * 120}ms` }}><Letters word={p.title} /></div>
            </div>
            <div className="em-st"><span className="em-lbl">Unit {String(unit(p)).padStart(2, "0")}</span><span className="em-d">{playLesson(p)?.minutes ?? ""} min</span></div>
          </div>
        ))}
      </div>
    </section>
    <aside className="em-side">
      <div className="em-panel" data-role="essay-specimen-card">
        <div className="em-lbl">{forReading === at ? "For your paragraph" : "The shape"}</div>
        <h2>{at.title}</h2>
        <div style={{ marginTop: 22 }}><Pattern compact pattern={at.pattern} label={<span className="em-lbl">The pattern</span>} /></div>
        <div className="em-door"><span>X-ray</span><span className="em-key">OK</span></div>
      </div>
    </aside>
    <div className="em-caption"><Caption label={`Unit ${unit(at)} · ${at.title}`} text={at.line} /></div>
  </>);
}

/** Which parts of the x-rayed paragraph each structure points at; the rest dims. */
const XRAY_ROWS: Record<string, number[]> = { thesis: [0], para: [0, 1, 2], order: [0, 1, 2], concl: [2] };
const XRAY: Array<{ role: string; parts: Array<[string, boolean?]> }> = [
  { role: "claim", parts: [["Many students arrive at school exhausted, and the reason is "], ["not laziness but biology", true], ["."]] },
  { role: "evidence", parts: [["During adolescence "], ["the body's internal clock shifts later", true], [", which means a teenager who goes to bed at eleven is often not sleepy until well after midnight."]] },
  { role: "link", parts: [["An early start "], ["therefore", true], [" cuts into sleep that the brain still needs."]] },
];
/**
 * The x-ray: a model paragraph, each sentence under the giant name of its job. The accent marks what does
 * the job: the side the claim takes, the checkable fact under a highlighter, the word that links back.
 */
export function Xray({ s }: { s: Session }) {
  const p = stopAt(PLAYBOOK_STOPS, s.focus) ?? PLAYBOOK_STOPS[1];
  const lit = XRAY_ROWS[p.id] ?? [0, 1, 2];
  return (<>
    <Brand /><Top s={s} menu="Back" />
    <section className="em-xray">
      <div className="em-lbl">Playbook · {p.title} · x-ray</div>
      {XRAY.map((r, i) => (
        <div key={r.role} className={`em-xrow${lit.includes(i) ? "" : " dim"}`} data-role-name={r.role}>
          <div className="em-xword">
            {r.role === "evidence" && <span className="em-xhl" aria-hidden="true" />}
            <span style={{ position: "relative" }}>{r.role}</span>
            {r.role === "claim" && <Arrow len={150} h={100} color={BONE} />}
            {r.role === "link" && <svg viewBox="0 0 150 100" aria-hidden="true"><path d="M140 88H40Q18 88 18 66V14" fill="none" stroke={CIT} strokeWidth="12" /><path d="M-6 38L18 12l24 26" fill="none" stroke={CIT} strokeWidth="12" /></svg>}
          </div>
          <div className="em-xtext">{r.parts.map(([t, mark], k) => mark ? <mark key={k}>{t}</mark> : <span key={k}>{t}</span>)}</div>
        </div>
      ))}
    </section>
    <div className="em-xcap"><Caption label={`Unit ${playLesson(p)?.unit ?? PLAYBOOK_STOPS.indexOf(p) + 1} · ${p.title}`} text={p.line} /></div>
  </>);
}
